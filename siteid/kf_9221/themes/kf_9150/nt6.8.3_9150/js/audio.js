(function($, undefined){
	/**
	 * HTML 5 audio 录音支持
	 */
	var CON_WORKER_PATH = 'recorder_worker.js';
	
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || null;
	window.AudioContext = window.AudioContext || window.webkitAudioContext || window.msAudioContext || null;
	window.URL =          window.URL || window.webkitURL || null;

	$.Audio = {
		inited: false,
		rec: null,
		formData: null,
		/**
		 * @method support
		 * @return {Boolean}
		 */
		support: function(){
			if( !navigator.getUserMedia || !window.AudioContext ){
				return false;
			}
			else{
				return true;
			}
		},
		/**
		 * @method createAudio 创建音频播放元素
		 * @param  {String}      url
		 * @param  {HTMLElement} parentElement
		 * @return {Object}
		 */
		createAudio: function(url, parentElement){
			var supportVideo = !!( document.createElement('video').canPlayType );
			//2015.11.01 音频默认样式修改
			if( supportVideo ){
				return $(parentElement).find('audio').length ?
					$(parentElement).find('audio').attr('src', url) :
					$({tag: 'AUDIO'}).appendTo(parentElement).attr('src', url);
			}else{
				$.Log('Browser does not support audio.', 3);
				return null;
			}
		},
		/**
		 * @method start
		 * @param  {String}      fileTranServer
		 * @param  {Object}      options
		 * @return {void}
		 */
		start: function(fileTranServer, options, callback){
			var self = this;
			
			this.fileTranServer = fileTranServer || '';
			this.options = options || {};

			if( this.support() === false ){
				$.Log('Browser does not support getUserMedia or AudioContext.', 2);
				return false;
			}
			//2015.12.28 音频文件跨域提交append到音频按钮中
			var iframe = $({tag:'IFRAME', src: fileTranServer + '/proxy.html?t=' + $.getTime(), style:$.STYLE_NBODY + 'width:1px;height:1px;visibility:hidden;'}).appendTo($('.chat-view-button-audio')).get(0);

			this.proxy = iframe.contentWindow;
			
			/**
			 *  2015.11.01 调整是否初始化逻辑
			 *  如果两个回调均没有执行, 将语音功能置灰，inited设置为false
			 *  chat.view.wap中检测到inited为false的情况下，会重新初始化
			 *  应用场景（进入页面后，未点击允许麦克风按钮，两个回调均不会触发，点击允许后，在点击语音按钮后再初始化，即可初始化成功）
			 */
			try{
				navigator.getUserMedia({audio: true}, function(stream){
					callback(false);/*disabled*/	
					self._success(stream);
					self.inited = true;
				}, function(event){
					callback(true);/*disabled*/
					self._failure(event);
					self.inited = true;
				});

				setTimeout(function(){
					if( !self.inited ) {
						callback(true);/*disabled*/
						self._failure(event);
						self.inited = false;
					}
				}, 2000);
				                          
			}catch(e){
				$.Log('navigator.getUserMedia:' + e.message, 3);
			}
		},
		record: function(){
			if( !this.rec || !this.inited ){
				return false;
			}
			this.rec.record();
		},
		end: function(callback){
			var self = this;
			
			if( !this.rec || !this.inited ){
				return false;
			}
			
			this.rec.stop();
			
			this.rec.exportWAV(function(blob){
				
				self.rec.clear();
				
				$.Log(blob, 2);
				
				self._upload(blob, callback);
			});
		},
		_upload: function(blob, callback){
			var self = this;
			//清除数据
			this.rec.clear();

			this.formData = new FormData();
			this.formData.append('userfile', blob);
			this.formData.append('fname',    $.getTime()+'.wav');
			$.each(this.options, function(name, value){
				self.formData.append(name, value);
			});
			
			try{
				this.proxy.uploadFile(this.fileTranServer + '/imageupload.php', this.formData, callback);
			}catch(e){
				$.Log('$.Audio._upload():' + e.message, 3);
			}
		},
		_success: function(stream){
			$.Log('nTalk.Audio._success()');
			
			var context = new window.AudioContext();

			var MSSource = context.createMediaStreamSource(stream);

			var config = {
				workerPath: 'recorder_worker.js'
			};

			this.rec = new $.Recorder(MSSource, config);
		},
		_failure: function(event){
			
			$.Log('nTalk.Audio._failure()');
		}
	};

	$.Recorder = function(source, cfg){
		var config    = cfg || {};
		var bufferLen = config.bufferLen || 4096;
		var worker, currCallback, recording = false;
		
		this.context  = source.context;
		if( this.context.createJavaScriptNode ){
			this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
		}else{
			this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
		}
		try{
			worker = new Worker( config.workerPath || CON_WORKER_PATH );
		}catch(e){
			$.Log(e, 3);
		}
		worker.postMessage({
			command: 'init',
			config:  {
				sampleRate: this.context.sampleRate
			}
		});
		
		this.node.onaudioprocess = function(e){
			if( !recording ){
				return;
			}

			worker.postMessage({
				command: 'record',
				buffer:  [
					e.inputBuffer.getChannelData(0),
					e.inputBuffer.getChannelData(1)
				]
			});
		};
		
		this.configure = function(cfg){
			for( var prop in cfg ){
				if (cfg.hasOwnProperty(prop)){
					self.config[prop] = cfg[prop];
				}
			}
		};
		this.record = function(){
			recording = true;
		};
		this.stop = function(){
			recording = false;
		};
		this.clear = function(){
			worker.postMessage({ command: 'clear' });
		};
		worker.onmessage = function(e){
			var blob = e.data;
			currCallback(blob);
		};
		this.getBuffer = function(cb){
			currCallback = cb || config.callback;
			worker.postMessage({ command: 'getBuffer' });
	    };
		this.exportWAV = function(cb, type){
			currCallback = cb || config.callback;
			type = type || config.type || 'audio/wav';

			if( !currCallback ){
				throw new Error('Callback not set');
			}

			worker.postMessage({
				command: 'exportWAV',
				type:    type
			});
	    };
		source.connect( this.node );
		//this should not be necessary
		this.node.connect( this.context.destination );
	};

})(nTalk);