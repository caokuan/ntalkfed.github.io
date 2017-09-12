;(function($, undefined){
	var CON_NULL           = /[\r\n]/gi,
		CON_FLASH_DIV      = 'nTalk-flash-element',
		CON_TCHAT_ID       = 'ntkf-flash-tchat',
		CON_NO_FREE_USER   = "no free users",       //重新分配客服：无空闲客服
		CON_OVER_RECHATNUM = "over rechatnum",      //重新分配客服：访问超过重新请求客服次数
		CON_NO_USER2       = "no user2"             //当前客服ID不存在或客组ID下未配置客服
	;
    var emptyFunc = function(){};
	/**
     * 页面数据重载时，base会重新给$.global赋值
     * 将 $.global.waitMessage 改成 $.waitMessage
     */
	$.extend({
		//打开聊天窗口时，是否默认连接机器人
		default_connect_robot: true
	});

	/** ====================================================================================================================================================
	 * 截图控件对像
	 * @module Capture
	 * @static
	 */
	$.Capture = {
		udCapCtl: null,
		setupFrame: null,
		version: '1.6.1',
		mimeType: 'application/xiaonengcapture-plugin',
		license: 'C35F3907AADCC3BB0FEB1DAC6866D806A0DAA7C07A001D97E14ECFBE1D27CC99891F79A7D86AA9CCAFF6B24C1CC1BA89143E5F61849BCC87E12ED104A23B4F980EDCEBE5471FEDE121826153381CC7A3E040D9D5374D13A587BE7B4011FCA44C6E849C8717E483905FB038986FC7F8376E849C8717E483905FB038986FC7F837310A71452C349CA1EB060B439E6535037D30D63B4FEE80AB2C8102DFC48E0C486E849C8717E483905FB038986FC7F8376E849C8717E483905FB038986FC7F8376E849C8717E483905FB038986FC7F837', //注册授权许可号
		setup:	'setup/Xiaonengcapture.msi',
		inited:	false,
		loaded:	false,
		callback: null,
		supportActiveX: false,
		captureWithMin: true, //截图时是否隐藏窗口
		/**
		 * 初始化时，获取截图相关配置，截图控件下载地址、截图上传地址
		 * @return
		 */
		init: function(filetranserver){
			if( !this.inited || !filetranserver ){
				this.inited = true;
			}else return;

			$.Log('filetranserver:' + filetranserver);
			this.id = 'setFrame-' + $.randomChar();
			this.name = this.id;
			this.PostUrl = filetranserver + '/imageupload.php?' + $.toURI({
				action: 'uploadimage',
				siteid: $.global.siteid,
				roomid: 't2d',
				type:	'json',
				charset:$.charset
			});

			this.supportActiveX = (window.ActiveXObject !== undefined);
			if( this.supportActiveX && window.navigator.platform == 'Win64' || window.navigator.cpuClass == "x64" ){
				this.setup = 'setup/Xiaonengcapture64.msi';
			}
			this.loaded = false;
			this.udCapCtlSpan = $({tag:'div', className:'nTalk-hidden-element', id:'udCapSpan', style:$.STYLE_NBODY+"left:-1000px;top:-1000px;"}).appendTo(true);
			this.setupFrame = $({tag:'iframe', className:'nTalk-hidden-element', id:this.id, src:"", style:'display:none;'}).appendTo(true);
		},
		/**
		 * 开始截图，未创建截图控件时，创建，已创建时，直接开始
		 * 添加截图时聊天窗口最小化
		 * @methon  start
		 * @param  {String}   settingid    配置ID
		 * @param  {Function} callback     回调函数
		 * @return
		 */
		start: function(settingid, autoMinimize, callback){
			$.Log('nTalk.Capture.start(' + settingid + ', ' + autoMinimize + ', callback)');
			var self = this;
			this.settingid = settingid;
			this.callback = callback || emptyFunc;

			var isChrome = navigator.userAgent.match(/Chrome\/([0-9]+)/);
			if(isChrome && isChrome.length >= 2 && isChrome[1]>=42){
				alert($.lang.capture_forbidden);
				return;
			}

			if( $.Capture.installCheck() ){
				if(this.captureWithMin){
					$.chatManage.view.hidden();
				}

				setTimeout(function(){
					if( self.supportActiveX || self.loaded){
						self.doCapture(autoMinimize);
					}
				}, 300);
			}
		},
		doCapture: function(autoMinimize){
			if( autoMinimize && this.udCapCtl.StartCapture ){
				this.udCapCtl.StartCapture();
			}else{
				try{
					this.udCapCtl.Capture();
				}catch(e){
					if( this.udCapCtl && this.udCapCtl.StartCapture ){
						this.udCapCtl.StartCapture();
					}else{
						$.chatManage.view.visible();
						alert( $.lang.capture_reload );
					}
				}
			}
		},
		/**
		 * 截图版本验证
		 * @method hasVersion
		 * @param  String  instVer 验证版本号
		 * @return {Boolean}       是否通过验证
		 */
		hasVersion: function(instVer){
			if (instVer.substring(0, 1) == 'v')
				instVer = instVer.substring(1, instVer.length);
			var newVer = this.version.split(".");
			var curVer = instVer.split(".");
			if (parseInt(newVer[0]) > parseInt(curVer[0]))
				return true;
			if (parseInt(newVer[0]) == parseInt(curVer[0]) && parseInt(newVer[1]) > parseInt(curVer[1]))
				return true;
			if (parseInt(newVer[0]) == parseInt(curVer[0]) && parseInt(newVer[1]) == parseInt(curVer[1]) && parseInt(newVer[2]) > parseInt(curVer[2]))
				return true;
			return false;
		},
		/**
		 * IE下控件事件添加
		 * @method addEvent
		 * @param String   type     事件名称
		 * @param Function handler  回调函数
		 * @param String   funcName 回调函数名称
		 */
		addEvent: function(type, handler, funcName){
			if( this.udCapCtl.attachEvent ){
				this.udCapCtl.attachEvent(type, handler);
			}else{//for IE 11
				var nameFromToStringRegex = /^function\s?([^\s(]*)/;
				var paramsFromToStringRegex = /\(\)|\(.+\)/;
				var functionName = handler.name || handler.toString().match(nameFromToStringRegex)[1] || funcName;
				var params = handler.toString().substring(handler.toString().indexOf('('), handler.toString().indexOf(')')+1);
				var _handler = document.createElement("script");
				_handler.setAttribute("for", this.udCapCtl.id);
				_handler.event = type + params;
				_handler.appendChild(document.createTextNode(functionName + params + ";"));
				document.body.appendChild(_handler);
			}
		},
		/**
		 * 开始截图
		 */
		_onBeforeCapture: function(){
			$.Log('Capture._onBeforeCapture', 2);
			return;
		},
		/**
		 * 取消截图
		 */
		_onCaptureCanceled: function(){
			$.Log('Capture._onCaptureCanceled');
			$.chatManage.view.visible();
			return;
		},
		/**
		 * 截图完成
		 */
		_onCaptureCompleted: function(file){
			$.Log('Capture._onCaptureCompleted(' + file + ')');
			$.chatManage.view.visible();
			return;
		},
		/**
		 * 准备上传截图
		 */
		_onBeforeUpload: function(file, size){
			$.Log('Capture._onBeforeUpload(' + file + ', ' + size + ')');
			return;
		},
		/**
		 * 截图上传完成
		 */
		_onUploadCompleted: function(responseText){
			$.Log('Capture._onUploadCompleted("' + responseText + '")');
			var self = $.Capture, data, timeout = 500;
			try{
				data = $.JSON.parseJSON(responseText);
			}catch(e){
				responseText = responseText.substring(responseText.indexOf('{'), responseText.indexOf('}')+1);
				try{
					data = $.JSON.parseJSON(responseText);
				}catch(e){
					return;
				}
			}
			if( self.callback.call() === false ){
				timeout = 0;
			}
			self._callback('fIM_startSendFile', ['', 'uploadimage', data.oldfile]);

			setTimeout(function(){
				self._callback('fIM_receiveUploadSuccess', ['', 'uploadimage', data]);
			}, timeout);
			return;
		},
		/**
		 * 截图上传失败
		 */
		_onUploadFailed: function(errorCode){
			$.Log('Capture._onUploadFailed(' + errorCode + ')', 2);
			return;
		},
		/**
		 * 截图完成后回调
		 */
		_callback: function(methodName, methodParams){
			methodParams.push(this.settingid);
			if( $.hasOwnProperty( methodName ) ){
				$[methodName].apply(this, methodParams);
			}else{
				$.Log('nTalk.' + methodName + '(...)', 2);
				return;
			}
		},
		/**
		 * 验证控件是否已安装验证，未安装时提示安装
		 * @return boolean  返回是否已安装控件
		 */
		installCheck: function(){
			this.loaded = false;

			if( this.udCapCtl ){
				this.loaded = true;
			}

			if( this.supportActiveX ){
				$('#udCapSpan').html( "<object id=\"udCaptureCtl\" width=\"0\" height=\"0\" classid=\"CLSID:0FAE7655-7C34-4DEE-9620-CD7ED969B3F2\"></object>" );
				this.udCapCtl = $('#udCaptureCtl').get(0);
				if( this.udCapCtl.PostUrl !== undefined ){
					if( this.hasVersion(this.udCapCtl.GetVersion()) ){
						if( confirm( $.lang.capture_activex_update ) ){
							this.startSetup();
						}
						return false;
					}else{
						this.udCapCtl.PostUrl = this.PostUrl;
						this.udCapCtl.License = this.license;

						this.addEvent("OnBeforeCapture",	nTalk.Capture._onBeforeCapture,		'nTalk.Capture._onBeforeCapture');
						this.addEvent("OnCaptureCanceled",	nTalk.Capture._onCaptureCanceled,	'nTalk.Capture._onCaptureCanceled');
						this.addEvent("OnCaptureCompleted",	nTalk.Capture._onCaptureCompleted,	'nTalk.Capture._onCaptureCompleted');
						this.addEvent("OnBeforeUpload",		nTalk.Capture._onBeforeUpload,		'nTalk.Capture._onBeforeUpload');
						this.addEvent("OnUploadCompleted",	nTalk.Capture._onUploadCompleted,	'nTalk.Capture._onUploadCompleted');
						this.addEvent("OnUploadFailed",		nTalk.Capture._onUploadFailed,		'nTalk.Capture._onUploadFailed');
						this.loaded = true;
					}
				}else{
					if( confirm($.lang.capture_install) ){
						$('#udCapSpan').html( '' );
						this.udCapCtl = null;
						this.startSetup();
					}else{
						$('#udCapSpan').html( '' );
						this.udCapCtl = null;
					}
					return false;
				}
			}
			else if( navigator.plugins ){
				var plugin = (navigator.mimeTypes && navigator.mimeTypes[this.mimeType]) ?
					navigator.mimeTypes[this.mimeType].enabledPlugin : 0;
				if( plugin ){
					var version = 'v1.0.0';
					var words = plugin.description.split(" ");
					if (words[words.length - 1].substring(0, 1) == "v")
						version = words[words.length - 1];

					if (this.hasVersion(version)) {
						if (confirm( $.lang.capture_other_update )) {
							this.startSetup();
						}
						return false;
					}else{
						$('#udCapSpan').html( "<embed id=\"udCaptureCtl\" width=\"0\" height=\"0\" type=\"" + this.mimeType + "\"></embed>" );
						this.udCapCtl = $('#udCaptureCtl').get(0);
						this.udCapCtl.PostUrl = this.PostUrl;
						this.udCapCtl.License = this.license;

						this.udCapCtl.OnBeforeCapture		= "nTalk.Capture._onBeforeCapture";
						this.udCapCtl.OnCaptureCanceled		= "nTalk.Capture._onCaptureCanceled";
						this.udCapCtl.OnCaptureCompleted	= "nTalk.Capture._onCaptureCompleted";
						this.udCapCtl.OnBeforeUpload		= "nTalk.Capture._onBeforeUpload";
						this.udCapCtl.OnUploadCompleted		= "nTalk.Capture._onUploadCompleted";
						this.udCapCtl.OnUploadFailed		= "nTalk.Capture._onUploadFailed";
						this.loaded = true;
					}
				}
				if( !this.loaded && confirm($.lang.capture_install) ){
					this.startSetup();
				}
			}

			return this.loaded;
		},
		/**
		 * 下载控件安装文件
		 * @return
		 */
		startSetup: function(){
			this.setupFrame.attr('src', $.baseURI + this.setup);
		}
	};

	$.extend({
		CON_SINGLE_SESSION:      'SINGLE',         //默认单用户LOGO标识
		CON_MULTIPLAYER_SESSION: 'MULTIPLAYER',    //多用户LOGO标识
		//聊天窗口中缓存的图片地址
		imageicon	:'',
		imagebg		:'',
		imagesingle	:'',
		imagemultiplayer:'',
		loadImageAbnormal: function(self, event){
			if( $(self).attr('data-type') == 'ntalk-enterprise-logo' ){
				self.src = $.sourceURI + 'images/blank.gif';
			}else{
				try{
					var width  = $(self).parent().width();
					var height = $(self).parent().height();
				$(self).css({
					margin: '0px'
				}).attr({
					width: width,
					height:height,
					src:   $(self).attr('data-single') == '1' ? $.imagesingle : $.imagemultiplayer
				});
				}catch(e){
					$.Log("img parent is null", 2);
				}
			}
		},
		imgScrollBottom:function(){
			var imgSettingid = nTalk.global.settingid;
			if(nTalk.chatManage.get(imgSettingid)){
				nTalk.chatManage.get(imgSettingid).view.scroll.scrollBottom();
			}else{
				setTimeout(function(){
					nTalk.chatManage.get(imgSettingid) && nTalk.chatManage.get(imgSettingid).view.scroll.scrollBottom();
				},500)
			}
		},
		/**
		 * 图片等比缩放
		 * @param  Image  image     图片对像
		 * @param  number maxWidth  图片最大宽
		 * @param  number maxHeight 图片最大高
		 * @return json             返回等比缩入后的宽高
		 */
		zoom: function(image, maxWidth, maxHeight){
			var width,height, ret = {width: maxWidth, height: maxHeight};
			if( !image || !image.width ){
				return ret;
			}
			width = image.width > maxWidth ? maxWidth : image.width;
			height= width/image.width * image.height;
			if( height > maxHeight ){
				height = maxHeight;
				width  = height/image.height*image.width;
			}
			return $.extend(ret, {
				width: width,
				height:height
			});
		},
		entityList: {
			"&":		"&amp;",
			"<":		"&lt;",
			"\uff1c":	"&lt;",
			">":		"&gt;",
			"\uff1e":	"&gt;",
			"\uff06":	"&amp;",
			"\u00a9":	"&copy;",
			"\u00ae":	"&reg;",
			"\"":		"&quot;",
			"'":		"&apos;",
			"\uff02":	"&quot;"
		},
		/**
		 * 字符过滤
		 * @param  json param 要过滤的json对像
		 * @return json       返回过滤后的json
		 */
		charFilter: function(param){
			var self = this, rp, k,
				replace = function(str){
					for(var k in $.entityList){
						if( typeof $.entityList[k] == 'function' ) continue;
						str = str.replace(new RegExp("" + k + "", 'g'), $.entityList[k]);
					}
					return str;
				}
			;
			if( $.isArray(param) ){
				rp = [];
				for(k = 0; k<param.length; k++){
					if( typeof(param[k]) == 'object' ){
						rp[k] = $.charFilter( param[k] );
					}else if( typeof(param[k]) == 'string' ){
						rp[k] = replace( param[k] );
					}else{
						rp[k] = param[k];
					}
				}
			}else if( typeof(param)=="object" ){
				rp = {};
				for(k in param){
					if( typeof(param[k]) == 'function' ){
						continue;
					}else if( typeof(param[k]) == 'object' ){
						rp[k] = $.charFilter( param[k] );
					}else if( typeof(param[k]) == 'string' ){
						rp[k] = replace( param[k] );
					}else{
						rp[k] = param[k];
					}
				}
			}else{
				rp = replace( param );
			}
			return rp;
		}
	});

	/** ====================================================================================================================================================
	 * tChat连接对像,此对像内含comet连接tchat对像与flash tchat连接对像，默认选中flash连接，不支持flash或超过5秒无响应时，使用comet连接
	 * @class chatConnect
	 * @constructor
	 *
	 * @param  json  options  连接参数
	 */
	$.chatConnect = $.Class.create();
	$.chatConnect.prototype = {
		name: 'chatConnect',
		debug: false,
		options: null,
		switchTimeId: null,
		error:	false, //连接错误，转换连接失败
		initialize: function(options, close_tchat_flash){
			if(this.debug)$.Log('create chatConnect()', 1);

			this.options = $.extend({
				//设备类型：0:PC;1:微信;2:APP;3:WAP
				devicetype: $.browser.mobile ? 3 : 0,
				chattype:	'0',
				chatvalue:	'0'
			}, $.whereGet(options,
				["requestRobot","siteid", "settingid", "tchatmqttserver", "tchatgoserver", "surl", "cid", "u", "n", "sid", "groupid", "rurl", "statictis", "htmlsid","connectid", "userlevel", "disconnecttime", "mini", "chattype", "chatvalue", "edu_invisitid", "edu_visitid","usertag","userrank"],
				["requestRobot","siteid", "settingid", "tchatmqttserver", "tchatgoserver", "serverurl", "machineID", "userid", "username", "sessionid", "destid", "resourceurl", "statictis", "htmlsid","connectid", "userlevel", "disconnecttime", "mini", "chattype", "chatvalue"]
			));

			//连接机器人
			if (this.options.requestRobot && $.Robot) {
			    $.global.connect = 'robot';
			    this._createRobotConnect();
            }else if( ($.browser.supportMqtt || $.flash.support) && this.options.tchatmqttserver && $.server.tchatConnectType == 1){
            	//2015-04-28 修复不支持webSock，flashsock，没能切换为comet
            	//2015-05-03 增加tchatConnectType开关，用来控制是否使用mqtt
            	$.Log('mqtt connect.');
			    $.global.connect = 'mqtt';
			    this._createMqttConnect();
			    /*
			//rtmp
			}else if( $.global.connect == $.CON_CONNECT_FLASH && close_tchat_flash != '1' ){
				this._createFlashConnect();
			*/
			} else {
				$.Log('commet connect.');
			    $.global.connect = 'comet';
			    this.startCometConnect();
			}

			/*
			var self = this;

			//timeout switch connect type
			this.switchTimeId = setTimeout(function(){

				self.switchConnect();
			}, 5000);
			*/
		},
		startCometConnect: function(){
		    var self = this;
		    $.require({TChat: 'comet.chat.js' + $.baseExt}, function(tchat){
		        if( !tchat ){
		            $.Log('Loaded $comet.chat mode failed', 3);
		            return;
		        }
                $.Log('Loaded $comet.chat mode complete', 3);
		        self._createCometConnect();
		    });
		},
		/**
		 * 发送消息
		 * @param  json data json消息
		 * @return
		 */
		sendMessage: function(data){
			var content = $.JSON.toJSONString(data);

			if(this.debug){
				$.Log('chatConnect.sendMessage(' + content + ')');
			}
			if( this.connect && $.isFunction(this.connect.sendMessage) ){
				this.connect.sendMessage(content);
			}else{
				$.Log('connect.sendMessage is undefined', 3);
			}
		},
		/**
		 * 发送消息预知内容
		 * @param  String message 当前输入消息内容
		 * @return
		 */
		predictMessage: function(message){
			if(this.debug){
				$.Log('chatConnect.predictMessage(' + message + ')');
			}
			if( this.connect && $.isFunction(this.connect.predictMessage) ){
				this.connect.predictMessage(message);
			}
		},
		/**
		 * 设定文本样式
		 * @param json data 文本样式属性
		 */
		setTextStyle: function(data){
			if(this.debug){
				$.Log('chatConnect.setTextStyle(' + $.JSON.toJSONString(data) + ')');
			}
			if( this.connect && $.isFunction(this.connect.setTextStyle) ){
				this.connect.setTextStyle(data);
			}
		},
		/**
		 * 断开Tchat连接
		 * @return
		 */
		disconnect: function(){
			if(this.debug){
				$.Log('chatConnect.disconnect()');
			}

			if( this.connect && $.isFunction(this.connect.closeTChat) ){
				try{
					this.connect.closeTChat();
				}catch(e){
				}
				//Flash连接关闭后，移除flash DOMHtml
				if( $.global.connect == $.CON_CONNECT_FLASH ){
					$.flash.remove(this.connect);
				}
				this.connect = null;
			}
		},
		/**
		 * 断开Tchat连接
		 * @return
		 */
		closeTChat: function(){
			if(this.debug){
				$.Log('chatConnect.closeTChat()');
			}
			this.disconnect();
		},
		/**
		 * 连接类型切换,如果当前连接类型不为comet连接，使用comet方式创建连接
		 * @return
		 */
		switchConnect: function(){
			this.stopSwitchConnect();

			$.Log('connect tchat abnormalities[' + $.global.connect + '], switch the connection type.', 2);
			if( !this.options.requestRobot && $.global.connect != "comet" ){
				if( this.connect && $.isFunction(this.connect.remove) ){
					//flash connect, remove flash HTMLDOM
					this.connect.remove();
				}
				if( this.connect && $.isFunction(this.connect.disconnect) ){
					this.connect.disconnect();
				}
				$.global.connect = $.CON_CONNECT_COMET;
				this.startCometConnect();
			}else{
				this.error = true;
				$.Log('switch connect tchat type failure', 3);
			}
		},
		/**
		 * 连接完成或正准备切换连接时，终止连接类型切换
		 * @return
		 */
		stopSwitchConnect: function(){
			if(this.debug){
				$.Log('chatConnect.stopSwitchConnect');
			}
			clearTimeout( this.switchTimeId );
			this.switchTimeId = null;
		},
		/**
		 * Flash连接,创建Tchat(flash版)
		 * @return htmlDom			Flash对像
		_createFlashConnect: function(){
			$.Log('chatConnect._createFlashConnect()', 1);
			var flashdiv = $('#' + CON_FLASH_DIV),
				flashsrc = $.sourceURI + 'fs/TChat.swf?' + $.version.chat,
				flashid  = CON_TCHAT_ID + '_' + $.randomChar(),
				flashhtml= $.flashHtml(flashid, flashsrc, this.options);

			if( !flashdiv.length ){
				flashdiv = $(document.body).insert('<div id="' + CON_FLASH_DIV + '" class="nTalk-hidden-element" style="position: absolute; z-index: 9996; top: -200px;"></div>');
			}
			flashdiv.insert( flashhtml );

			if( $.browser.msie ){
				flashdiv.find('#' + flashid).display(1);
			}
			this.connect = $('#' + flashid).get(0);
		},
         */
		/**
		 * comet连接,创建Tchat(comet版)
		 * @return Object				Comet对像
		 */
		_createCometConnect: function(){
			$.Log('chatConnect._createCometConnect()', 1);
			this.connect = new $.TChat(this.options, $.server);
		},
		/**
		 * @method _createRobotConnect 加载机器人模块
		 */
		_createRobotConnect: function(){
			$.Log('chatConnect._createRobotConnect()', 1);
			if( !$.Robot ){
				return false;
			}
			this.connect = new $.Robot(this.options);
		},
		_createMqttConnect: function(){
		    if( !$.Connection ){
 		        $.Log('load tchat connect object fail.',3);
		        return false;
		    }
		    this.connect = new $.Connection.TChat(this.options);
		}
	};

	/** ====================================================================================================================================================
	 * @class TChat
	 * @constructor
	 */
	$.chatMode = $.Class.create();
	$.chatMode.prototype = {
		name: 'chatMode',
		debug: false,
		view: null,
		options: null,
		manageMode: null,
		//已执行发送的消息
		hash: new $.HASH(),
		//未发送的缓存消息
		hashCache: new $.HASH(),
		htmlsid: 0,
		connectId: "",
		siteid: '',
		settingid: '',
		config: null,
		connected: false,
		defData: null,
		_sendNum: 0,
		_changeCsrNum: 0,		//每次更换客服前发送消息数量
		_changeCsrMaxNum: 5,	//N条消息可更换客服
		_reconnectCount: 0,
		_startQueue: false,
		_queueNum: 1,
		statusConnectT2D: 'WAIT',	//WAIT;QUERY;QUEUE;COMPLETE;
		statusConnectTChat: 'WAIT',	//WAIT;QUEUE;READY;COMPLETE;FAILURE;CLOSECHAT;DISCONNECT;
		_submitRating: false,
		_Evaluable: false,
		_Enableevaluation: false,
		_currentView: '',
		inputMaxByte: 0,
		selected: false,
		floatTimeID: null,
		dest: null,
		hashDest: new $.HASH(),
		sessionid: '',
		user: null,
		_moreData: null,
		unread: 0,
		userNumber: 0,
		userList: [],
		sessionType: null,
		enterData: null,
		captureing: false,
		waitTimeID: null,
		cacheTimeID: null,
		server: [],
		receiveMsgCount: 0,     //客户端帮助中心消息数
		requestRobot: false,	//请求客服类型，默认人工客服
		enterUserId: null,		//同事会话新加入客服id
		startCSSwitch: '',	//开始切换客服状态:',START|'
		CON_GENERAL: 1,		//会话类型:常规会话
		CON_ADPTER:	 10000,	//会话类型:转接
		CON_INVITE:	 10001,	//会话类型:邀请

		CON_VIEW_LOADING: 'loading',
		CON_VIEW_ERROR:   'error',
		CON_VIEW_WINDOW:  'window',
		CON_VIEW_MESSAGE: 'message',

		CON_OFFLINE:   0,//离线
		CON_ONLINE:    1,//在线
		CON_INVISIBLE: 2,//隐身
		CON_BUSY:      3,//忙碌
		CON_AWAY:      4,//离开

		CON_LOGIN_FAILURE:   0,//tchat登录失败
		CON_LOGIN_SUCCESS:   1,//tchat登录成功
		CON_CONNECT_FAILURE: 2,//tchat连接失败
		CON_CONNECT_SUCCESS: 3,//tchat连接成功
		CON_DISCONNECT:      4,//断开tchat连接
		CON_CLOSE_CONNECT:   5,//关闭tchat连接

		CON_MOBILE_SHOW_GOODSINFO:  0,//移动设备上前端是否显示商品信息
		CON_ROBOT_ID: '_ISME9754_T2D_webbot',	//机器人ID
		CON_ROBOT_ERROR_MESSAGE: 'ROBOT_ERROR_MESSAGE',
		//机器人回答不了问题的回复内容，小能后台添加用户可配置统一回复语，将会替换下面的内容为统一内容
		CON_ROBOT_NO_ANSWER: '\u975e\u5e38\u5bf9\u4e0d\u8d77\u54e6\uff0c\u8fd9\u4e2a\u95ee\u9898\u5728\u6211\u77e5\u8bc6\u8303\u56f4\u5916\uff0c\u6211\u4f1a\u52aa\u529b\u53bb\u5b66\u4e60\u7684\uff01',
		robotID: '',
		robotSessionID: '',
		lastSessionID: '',
		t2dMode: null,	//null 正常分配， 0，更换客服  1、机器人转人工 2、继续和当前机器人会话
		uploadingid: {},
		evalRequestType: 'POST', //(6.8.2合版 - 新增参数 默认POST:form表单提交、可选值：AJAX,CORS跨域提交)
		evalFailCount: 0,//（6.8.2合版 - 新增参数 标识评价失败次数）
		robotSystemMessage: {
			'message': '\u7559\u8a00',
			'fq' : 'FQ,\u653e\u5f03\u6392\u961f',
			'ch' : 'CH,\u67e5\u770b\u6392\u961f\u60c5\u51b5'
		},
		initialize: function(options, manageMode){
			this.defData = {
				type:	1,
				userid:	"",
				name:	"",
				logo:	"",
				msg:	''
			};
			this.sessionid = '';
			this.dest = {
				id:		'',
				name:	''
			};
			this._moreData = [];
			this.user = {
				id:	$.user.id
			};

			this.hash.clear();
			this.options = $.extend({}, options);
			this.manageMode = manageMode;
			this.siteid  = this.options.siteid;
			this.sellerid= this.options.sellerid;
			this.settingid= this.options.settingid;
			this.edu_invisitid = this.options.edu_invisitid;
			this.edu_visitid= this.options.edu_visitid;
			// 2017.05.07 缺少itemid赋值，侧边栏链接需要替换itemid时会读取不到
			this.itemid = this.options.itemid;
			//时间戳+3位随机数字=16位数字
			//20160412 chatManage中创建
			this.htmlsid = this.options.htmlsid;
			this.connectId = this.options.connectid;
			this.selected = true;
			this.unread = 0;
			this._submitRating = false;
			this._Evaluable = false;
			this._currentView = this.CON_VIEW_LOADING;
			this.robotID = this.siteid + this.CON_ROBOT_ID;
			this._callbackGoodsinfo = 'scriptCallReceiveGoodsinfo_' + this.settingid;
			window[this._callbackGoodsinfo] = null;

			this.waitTimeID  = [];
			this.cacheTimeID = [];
			var self = this;
			//（6.8.2合版）wap中chatView变为局部变量，加载完成后赋值在$.ntView.chatView中
			var chatView = $.ntView? $.ntView.chatView : $.chatView;
			this.view = new chatView({
				siteid:		this.siteid,
				settingid:	this.settingid,
				width:		this.manageMode.view.options.width,
				height:		this.manageMode.view.options.height,
				chatHeader: this.manageMode.view.header,
				chatContainter:this.manageMode.view.chatContainter,
				toggleExpansion: function(settingid){
					self.toggleExpansion(settingid);
				}
			}/*options*/, this);

			var eduWapAutoView = $.ntView ? $.ntView.eduWapAutoView : $.eduWapAutoView;
			if ($.isAutoEdu && $.browser.mobile) {
				this.eduWapAutoView = new eduWapAutoView(this.settingid);
			}

			this.setDest();

			//2015.12.25 将最大字数限制PC，WAP统一改为600个字符
			this.inputMaxByte = 600;

			this.initConfig();

			if( !$.browser.mobile ){
				$.Capture.init(this.server.filetranserver);
			}

			//初始化后，以下功能按钮一定不可用
			this.view.disableButton(['history','evaluate','capture'], true);

			//创建文件、图片上传按钮
			this.view.createFileButton(this.server);

			//尚德添加统计点
			this.callStat("24");
		},
		/**
		 * 聊窗右侧展开收缩
		 * @param  {[type]} settingid [description]
		 * @return {[type]}           [description]
		 */
		toggleExpansion: function(settingid){
			return this.manageMode.callToggleExpansion(settingid);
		},
		/**
		 * @method getExpansionStatus 获取当前侧边栏状态
		 */
		getExpansionStatus: function(){
			return this.manageMode.view.extended.rightElement;
		},
		/**
		 * @method loadLink 加载连接内容简介
		 * @param  {string} url      URL地址
		 * @param  {string} selector 更新选择器
		 * @return {void}
		 */
		loadLink: function(url, selector){
			var
			self = this,
			callbackname,
			queryString,
			//debug temp
			//serverurl  = 'http://192.168.30.50/action.php'
			//serverurl  = 'http://113.31.17.240:8080/spider'
			serverurl    = $.isDefined(this.server.queryurl) && this.server.queryurl ? this.server.queryurl : ''
			;

			if( !serverurl || !url || (!/^\d+\.\d+\.\d+\.\d+$/gi.test($.domain) && url.indexOf($.domain)<=-1 && $.global.pageinchat) ){
				//接口地址为空、非本站域名不加载
				return;
			}

			$.Log('nTalk.chatMode.loadLink(' + url + ')');
			callbackname = 'callback_' + $.randomChar();
			queryString = $.toURI({
				query: 'getwebinfo',
				weburl: url,
				ctype: 1,
				siteid: this.siteid,
				batch: 0,
				callbackname: callbackname
			});
			window[ callbackname ] = function(data){

				$.Log('nTalk.chatMode.loadLink() callback: ' + $.JSON.toJSONString(data), 1 );

				data.customer = "";

				if( self.view.viewLinkContainer && data.title ){
					if(data.customs && data.customs.length > 0){
						for(var i=0; i<data.customs.length; i++){
							if(data.customs[i] && data.customs[i].name && data.customs[i].content){
								data.customer += data.customs[i].name + data.customs[i].content + '<br/>';
							}
						}
					}
					self.view.viewLinkContainer(data, selector);
				}
			};
			$.require(serverurl + '?' + queryString + '#rnd');
		},
		/**
		 * @method callTrack 产品功能统计
		 * @param  {string} nodeid    统计点统号
		 * 10-01-01 会话开始成功
		 * 10-01-02 会话连接成功
		 * 10-01-03 会话连接失败
		 * 10-01-04 发送消息失败
		 * 10-01-05 开始请求t2d
		 * 10-01-06 请求t2d成功
		 * 10-01-07 请求t2d失败
		 * 10-01-08 进入留言
		 * 10-02-02 表情
		 * 10-02-03 发送图片
		 * 10-02-04 屏幕截图
		 * 10-02-05 发送文件
		 * 10-02-09 评价
		 * @param  {string} nodeparam 统计点相关参数
		 * @return {void}
		 */
		callTrack: function(nodeid, nodeparam){
			var query = {
				siteid: this.siteid,
				userid: $.user.id,
				sid:    this.getHtmlSid(),
				nodeid: nodeid,
				nodeparam: nodeparam
			};

			if( !this.server.trackserver ){
				$.Log('nTalk.chatMode.callTrack(' + nodeid + '): trackserver error', 1);
				return;
			}

			$.require( this.server.trackserver + '/track.php?' + $.toURI(query) + '#rnd#image', function(script){
				if( script.error === true ){
					$.Log('call trackServer error: ' + nodeid, 3);
				}
				$(script.error ? script.target : script).remove();
			} );
			return true;
		},
		/**
		 * 聊窗执行流程统计
		 * @param  {[type]} action [description]
		 * @return {[type]}        [description]
		 */
		callStat: function(action){
			/**
			 * 0: 补充传递会话id统计点
			 * 4(debug): tchat flash ready 无用
			 * 5(debug): 关闭聊窗时是否已经连接成功
			 * 6(debug): flash获取地址成功
			 * 7(debug): flash获取地址失败
			 * 8(debug): flash开始请求分配客服
			 * 9: flash获取分配客服成功
			 * 11:  客服忙碌，进入排队状态（基础统计调用2开启）
			 * 12:  客服离线，进入留言界面（只含直接进留言）（基础统计调用2开启）
			 * 13:  分配客服结果失败，提示用户连接失败，重试或留言（基础统计调用2开启）
			 * 14: flash服务器连接成功
			 * 15: flash服务器连接失败
			 * 16: mqtt服务器连接成功
			 * 17: mqtt服务器连接失败
			 * 18(debug)：flash获取userlist成功
			 * 19(debug)：flash获取对方进入userenter事件
			 * 20(debug)：访客发送第一条消息
			 * 21(debug)：客服聊窗打开
			 * 22：进入留言界面（含直接进留言、排队进留言、连接失败进留言、咨询进留言）（基础统计调用2开启）
			 * 23：关闭聊窗（基础统计调用2开启）
			 * 24: 访客打开聊窗次数
			 */
			var disableAll = new RegExp("^(1|2|4|5|6|7|8|18|19|20|21)", 'gi');
			var disableSection = new RegExp("^(0|5|14|15|16|17|10|11|12|13|22|23|24)$", 'gi');
			var query = {
				type:		'chatjs',
				siteid:		this.siteid,
                kfid:       this.dest.id || '',
				guestid:	$.user.id,
				action:		action,
				htmlsid:	this.getHtmlSid(),
				chatsession:this.sessionid || '',
				//2014.11.11 统计添加settingid参数
				settingid:	this.settingid
			};

			if( !$.global.statictis && disableAll.test(action) ){
				return false;
			}else if( $.global.statictis === 2 && !disableSection.test(action) ){
				return false;
			}
			if( this.debug )$.Log(this.settingid + ':chat.callStat(' + action + ')');

			var serverurl;
			// 20150803 $.server.mcenter 尚德统计地址修改为 bkpi-sunlands-test.ntalker.com/index.php?
			if( this.siteid === "kf_9740" ){
			    // 尚德统计参数变更
			    query = $.extend(query, {
			        c:			'addmessage',
			        m:			'collection'
			    });
			    serverurl = "http://bkpi-sunlands.ntalker.com/index.php?";
			}else{
			    query = $.extend(query, {
			        m:			'Count',
			        a:			'collection'
			    });
			    serverurl = this.server.mcenter + 'statistic.php?';
			}
			$.require( serverurl + $.toURI(query) + '#rnd', function(script){
				if( script.error === true ){
					$.Log('call statictis error: ' + action, 3);
				}
				$(script.error ? script.target : script).remove();
			} );
			return true;
		},
		/**
		 * 关闭聊窗口
		 */
		close: function(){
			this.statusConnectTChat = 'CLOSECHAT';

			this.disconnect();

			if ($.xpush && ($.browser.oldmsie || !$.browser.supportMqtt)) {
				$.xpush.startXpush();
			}
			
			//换客服后，清除原用户列表
			this.userList = [];
			this.sessionid = '';
			this.view.close();

			this.callStat('23');
			//关闭聊窗时，连接IM
			if( this.server.isnoim == 2 && $.cache.get('opd') == '1' && $.base ){
				$.base.startIM();
			}
		},
		/**
		 * 发送消息时，如果未连接，则请求客服，开始连接
		 */
		start: function(data){
			var chat, idType;
			if( !this.config || $.isEmptyObject(this.config) ){
				$.Log('chatMode.start():config is null', 3);
				return;
			}
			$.Log(this.settingid + ':chatMode.start()');

			if( $.isFunction(this.manageMode.callVerification) ){
				//验证已打开的聊窗客服是否在当前聊窗可接待客服组中
				if( ( chat = this.manageMode.callVerification(this.settingid, this.config) ) ){
					chat.showMessage('system0', {
						type:	9,
						msg:	$.utils.handleLinks($.lang.system_merge_session, {destname: chat.dest.name})
					});
					//终止当前聊窗打开，消息合并至同名客服
					chat.send(data);
					//切换聊窗至目标窗口
					$.chatManage.switchChatTag(chat.settingid);

					$.Log('Only one customer to open a chat window', 2);
					return;
				}
			}

			this.dest.kfid = this.getDest(true);

			//2015.06.18 添加保护，打开聊窗时传入非法客服ID时，使用当前配置的默认客服组ID
			idType = $.base.checkID(this.options.destid);
			if( idType === false || (idType != $.CON_CUSTOMER_ID && idType != $.CON_GROUP_ID) ){
				this.options.destid = this.getDest(true);
			}

			if( !this.options.single ){
				//打开聊天窗口时，未指定是否为单用户模式时，跟据请求客服类型确定模式
				if( $.base.checkID(this.options.destid) == $.CON_GROUP_ID ){
					this.options.single = 0;
				}else{
					this.options.single = 1;
				}
			}

			//开始请求分配客服
			this.callStat('8');

			this.getCustomerServiceInfo(this.options.destid, this.options.single);
		},
		/**
		 * 重新连接
		 * @param {element} HtmlElement
		 * @param {string} destid 客服ID, 用于IM接收消息，重连已打开聊窗时指定客服ID
		 * @param {number} single 是否是请求单客服
		 */
		reconnect: function(element, destid, single, edu_invisitid, edu_visitid){
			if( element ){
				while(element && element.tagName.toUpperCase() != 'LI' && element.parentNode ){
					element = element.parentNode;
				}
				$(element).remove();
			}
			if( /QUERY|QUEUE/i.test(this.statusConnectT2D) ){
				//t2d正在连接或排队
				$.Log('reconnect:' + this.statusConnectT2D);
				return;
			}
			if( /QUEUE|READY|COMPLETE/i.test( this.statusConnectTChat ) ){
				//tchat正在连接\连接完成
				$.Log('reconnect:' + this.statusConnectTChat);
				return;
			}
			if( destid ){
				//IM接收消息，重新连接Tchat
				this.options.destid = destid || '';
				this.options.single = single || '0';
				this.options.edu_invisitid =  edu_invisitid || '';
				this.options.edu_visitid = edu_visitid || '';
			}
			if( this._currentView !== this.CON_VIEW_WINDOW ){
				//用于当前聊窗进入留言界面时，收到消息
				this.switchUI(this.CON_VIEW_WINDOW);
			}
			this.start();
		},
		/**
		 * 创建TChat连接
		 * @return {[type]} [description]
		 */
		createConnect: function(){
			var self = this, flashvars;
			//20160429 云问机器人2.0 机器人转人工时，t2dMode为1，此时传递上一次的sessionid连接tchat
			var sid = this.t2dMode === 1 ? this.lastSessionID : this.sessionid;
			$.Log("connect tchat sessioId>>" + this.sessionid, 1);
			flashvars = {
			tchatgoserver:	this.server.tchatgoserver,
				//mqtt 服务器地址
				tchatmqttserver: this.server.tchatmqttserver,
				//"ws://bmqtt.ntalker.com:8083/TCHAT",
				siteid:		this.siteid,
				settingid:	this.settingid,
				surl:		this.server.flashserver,
				rurl:		$.baseURI,
				u:			$.user.id,
				n:			$.user.name,
				groupid:	this.dest.id,
				destname:   this.dest.name,	//新增destName，用于成功连接用回调接口im_destUserInfo
				sid:		sid,
				cid:		$.global.pcid,
				htmlsid:	this.getHtmlSid(),
				connectid:  this.connectId,
				statictis:	$.global.statictis,
				userlevel:	$.global.isvip || '0',
				disconnecttime: this.config.contime || 180,
				mini:		0,
				chattype:	$.global.chattype || '1',
				chatvalue:	$.global.chattype==3 ? $.global.inviteid : $.global.chatvalue || '0',
				//是否加载NID.swf模块
				loadnid:	$.CON_LOAD_MODE_NID,
				//机器连接模式
				requestRobot:	this.requestRobot,
				//断开连接的情况下不会初始化edu_invisitid、edu_visitid
				edu_invisitid: $.chatManage.get(this.settingid).options.edu_invisitid,
				edu_visitid: $.chatManage.get(this.settingid).options.edu_visitid,
				//2017.08.26 用户标签
				userrank:	this.options.userrank,
				usertag:	this.options.usertag

			};

			//会话开始连接统计点
			this.callTrack("10-01-01","start connect");
			//重新请求客客服状态标识
			if(this.connect){
				this.statusConnectTChat = 'WAIT';
				this.statusConnectT2D = 'WAIT';
				this.disconnect();
			}

			this.connect = new $.chatConnect(flashvars, this.server.close_tchat_flash || '0');
			//连接机器人异常，转留言
			if( this.requestRobot ) setTimeout(function(){
				if( self.connect.error ){
					clearTimeout(this._connectTimeout);
					self.switchUI( self.CON_VIEW_MESSAGE, 'TIMEOUT');
				}
			}, 6000);
			this._connectTimeout = setTimeout(function(){
				//会话连接失败统计点
				self.callTrack("10-01-03","connect time out");

				if( self.debug )$.Log('connect timeout 60s');
				self.switchUI( self.CON_VIEW_MESSAGE, 'TIMEOUT');
			}, 60000);
		},
		/**
		 * 获取页面级会话ID，超4小时重新计算一个
		 */
		getHtmlSid: function(){
			if(this.htmlsid){
				this.htmlsid =  $.getTime() - this.htmlsid.substring(0, this.htmlsid.length-3) > (4 * 60 * 60 * 1000) ?
				$.getTime(2) : this.htmlsid;
				return this.htmlsid;
			}else{
				return '';
			}
		},
		/**
		 * 断开TChat连接
		 * @return {[type]} [description]
		 */
		disconnect: function(){
			var self = this;

			if( this.statusConnectTChat == 'CLOSECHAT'){
				//会话结束
				this.showMessage('system', {
					type:	9,
					msg:	$.utils.handleLinks($.lang.system_end_session, {settingid: this.settingid})
				});
				/**
				* 2017.04
				* 会话结束
				*/
				$.base.fire("SessionEnd",[{
					type: 		1,
					settingid: 	this.settingid || "",
					sessionid: 	this.sessionid || ""
				}]);
			}else if( this.statusConnectTChat == 'COMPLETE' ){
				//自动断线
				if( this.config.enable_auto_disconnect !== 0 ){
					this.showMessage('system', {
						type:	9,
						msg:	$.utils.handleLinks($.lang.system_auto_disconnect, {settingid: this.settingid})
					});
				}
				/**
				* 2017.04
				* 会话结束
				*/
				$.base.fire("SessionEnd",[{
					type: 		2,
					settingid: 	this.settingid || "",
					sessionid: 	this.sessionid || ""
				}]);

			}else if( this.statusConnectTchat == 'WAIT'){
				//断线后，更换客服消息数量置0 , 更换客服不可用
			        this._clearChangeCsrNum();
			}
			this._stopConnectTimeout();

			//断线后，不可主动评价
			//断线后，截图不可用
			this.view.disableButton(['evaluate','capture'], true);

			//连接断开，修改按钮状态
			this.manageMode.view.updateViewStatus(true);

			$.Log(self.settingid + ':chatMode.disconnect()', 1);

			this.connected = false;
			this.statusConnectTChat = 'DISCONNECT';

			//客服状态变更为离线
			this.setDest({status:0});
			if( this.chatFlashGoUrl ){
				$.require( this.chatFlashGoUrl + '#rnd', function(script){
					self.chatFlashGoUrl = '';
					$(script.error ? script.target : script).remove();
				});
			}
			//终止排队定时器
			if( this._queueTimeID ){
				clearTimeout(this._queueTimeID);
				this._queueTimeID = null;
			}
			//修正:连接tchat,返回连接异常后，清除发起页消息、缓存消息队列定时器
			$.each(this.waitTimeID, function(i, timeId){
				clearTimeout( timeId );
			});
			this.waitTimeID = [];

			$.each(this.cacheTimeID, function(i, timeId){
				clearTimeout( timeId );
			});
			this.cacheTimeID = [];

			if( this.connect ){
				this.connect.disconnect();
			}
		},
		/**
		 * 结束当前会话
		 * @return {[type]} [description]
		 */
		endSession: function(){
			var self = this;

			if( this.manageMode.hash.count() > 1 ){
				$.Log('...............close', 2);
				if( this.config && this.config.enableevaluation==1 && !this._submitRating && this._Evaluable && this._currentView == this.CON_VIEW_WINDOW ){
					if( this.showEvaluation(0, function(){
						//评价完成后，关闭聊窗
						self.manageMode.closeChat(self.settingid);
					}) === false){
						//已评价，直接关闭聊窗
						try{
							self.manageMode.closeChat(self.settingid);
						}catch(e){
							$.Log(e, 3);
						}
					}
				}else{
					//结束当前会话时，判断评价
					this.manageMode.closeChat(this.settingid);
				}
			}else{
				this.manageMode.close();
			}
		},
		/**
		 * 切换聊窗界面
		 * @param  {[type]} type [description]
		 * @return {[type]}      [description]
		 */
		switchUI: function(type, tempTYPE){
			var self = this;

			this.view.switchUI(type);

			this._currentView = type;

			$.Log(this.settingid + ':chatMode.switchUI(' + type + ', ' + tempTYPE + ')');
			if( type === this.CON_VIEW_MESSAGE ){
				//进入留言统计点
				this.callTrack("10-01-08");

				//wap版进留言，修改按钮状态
				if( this.manageMode.view && $.isFunction(this.manageMode.view.updateViewStatus) ){
					this.manageMode.view.updateViewStatus(true);
				}

				this.disconnect();

				this.callStat('22');

				this.createMessageForm();
			}
		},
		/**
		 * 初始化留言区信息内容
		 * @return {[type]} [description]
		 */
		createMessageForm: function(){
			var self = this, announcement, data;

			//set default config
			if( !this.config.form_message || typeof(this.config.form_message)=='string' || !this.config.form_message.length ){
				this.config.form_message = this.config.message_form;
			}
			if( !this.config.form_message || typeof(this.config.form_message)=='string' || !this.config.form_message.length || this.config.preferlan){
				this.config.form_message = $.lang.default_message_form_fields || "";
			}

			//get dest info
			this.dest = this.getDest(false);

			//留言界面时，要显示客服信息
			this.setDest({status: 0});

			data = {
				myuid:   $.user.id,
				destid:  this.dest.id,
				sid:     this.sessionid || '',
				source:  '',
				content: ''
			};
			//将缓存中的消息消息添加到留言输入框中
			this.hashCache.each(function(k, body){
				//常规消息才携带，上传的文件或图片消息丢弃
				if( body.type == 1 ){
					data.content += body.msg + "\n";
				}
				else if( /^(2|4)$/.test(body.type) ){
					data.fileError = true;
				}
			});
			this.hashCache.clear();

			this.view.createMessageForm(this.config.form_message, this.config.disable_message, this.config.form_announcement || this.config.announcement || '', data);
		},
		/**
		 * @method submitMessageForm 提交表单
		 * @return {void}
		 */
		submitMessageForm: function(){
		    //尚德留言服务器地址变更
		    var serverurl;
		    var query = {
		        t: "leaveMsg",
		        siteid: this.siteid,
		        sellerid: this.sellerid,
		        settingid: this.settingid
		    };
		    if( this.siteid === "kf_9740" ){
		        query = $.extend(query, {
		            c:	'addmessage',
		            m:	'queryService'
		        });
		        serverurl = "http://bkpi-sunlands.ntalker.com/index.php?";
		    }else{
		        query = $.extend(query, {
		            m:	'Index',
		            a:	'queryService'
		        });
		        serverurl = this.server.mcenter + "queryservice.php?";
		    }
			//微信进入留言，添加opId参数
			if( $.global.message == 1) {
				query = $.extend(query, {
		            opId:	$.global.opId
		        });
			}
			//验证邮箱时，把邮箱两边的空格去掉。
			var mailinput = $('.chat-view-message-form input[name=msg_email]');
			var mailValue = mailinput.val().replace(/(^\s*)|(\s*$)/g, "");
			mailinput.val(mailValue);
			this.view.submitMessageForm(this.config.form_message, serverurl + $.toURI(query) + '#rnd');
		},
		/**
		 * 终止连接超时定时器
		 * @return {[type]} [description]
		 */
		_stopConnectTimeout: function(){
			clearTimeout( this._connectTimeout );
			this._connectTimeout = null;
		},
		/**
		 * 取消息上传文件或图片
		 * @return {[type]}
		 */
		cancelUpload: function(action){
			var objName = action == 'uploadfile' ? 'objFile' : 'objImage';

			$.Log(this.settingid + ':chatMode.cancelUpload()');

			if( this.view[objName].cancelUpload ){
				this.view[objName].cancelUpload();
			}

			this.view.updateMessage(this.uploadmsgid, 'uploadfile'==action ? 4 : 2, -1);
		},
		/**
		 * 文件、图片上传Flash Ready
		 * @param  {string} action
		 * @return {void}
		 */
		_uploadReady: function(action){
			var objName = action == 'uploadfile' ? 'objFile' : 'objImage';
			$.Log(this.settingid + ':chatMode._uploadReady(' + objName + ')', 1);

			if( $.isFunction( this.view[ objName ].setUploadServer ) ){
				this.view[ objName ].setUploadServer( this.server.filetranserver );
			}
		},
		/**
		 * 2015.11.01 移动端不传递oldfile值
		 * 开始上传文件、图片
		 * @param  {[type]} action  [description]
		 * @param  {[type]} content [description]
		 * @return {[type]}         [description]
		 */
		startUpload: function(action, content){
			var fileName = $.hexToDec(content || '').replace(/.*?(\u201c|\\u201c)/ig, "").replace(/(\u201d|\\u201d).*?$/ig, "");

			//开始上传文件、图片的提示，允许取消息上传
			this.uploadmsgid = this.showMessage('right', {
				type:	 'uploadfile'==action ? 4 : 2,
				status:  'UPLOADING',
				oldfile: $.browser.mobile ? '' : fileName
			});
		},
		/**
		 * 2015.11.01
		 * 开始压缩上传图片
                 * debug
		 * @param  {[type]} action  [description]
		 * @param  {[type]} content [description]
		 * @return {[type]}         [description]
		 */
		startCompress: function(action){
			//开始上传文件、图片的提示，允许取消息上传
			this.uploadmsgid = this.showMessage('right', {
				type:	 'uploadfile'==action ? 4 : 2,
				status:  'COMPRESS'
			});
		},
		/**
		 * 文件、图片上传成功
		 * @param  {[type]} action [description]
		 * @param  {[type]} data   [description]
		 * @return {[type]}        [description]
		 */
		uploadSuccess: function(action, data){
			data = $.isObject(data) ? data : $.JSON.parseJSON(data);

			//过滤url地址协议
			data = $.protocolFilter(data);

			this.view.updateMessage(this.uploadmsgid, 'uploadfile'==action ? 4 : 2, data);

			$.Log(this.settingid + ': $.chatMode.uploadSuccess()', 1);

			this.send($.extend(data, {
				msg: data
			}));
			//文件、图片上传完成，清除临时消息ID
			this.uploadmsgid = '';
		},
		/**
		 * 2015.11.01 移动端不传送oldfile值，失败时新增message.etype参数
		 * 文件、图片上传失败
		 * @param  {string}        action
		 * @param  {string|object} message
		 * @return {void}
		 */
		uploadFailure: function(action, message){
			if( !this.uploadmsgid ){
				var fileMessage = '';
				/*
				if( $.isObject(message)&&message.etype ){
					fileMessage = (message.name || '') + ' ' + (message.etype=="SIZE" ? $.lang.news_trans_size : message.etype=="TYPE" ? $.lang.news_trans_type : message.etype=="UPLOAD" ? $.lang.news_trans_failure : message.msg);
				}else{
					fileMessage = message || '';
				}
				*/

				this.uploadmsgid = this.showMessage('right', {
					type:		'uploadfile'==action ? 4 : 2,
					oldfile:	$.browser.mobile ? '' : fileMessage,
					name:   message.name,
					size:   message.size
				});
			}
			//更新文件发送失败的状态
			this.view.updateMessage(this.uploadmsgid, 'uploadfile'==action ? 4 : 2, -2, message);
			//文件、图片上传完成，清除临时消息ID
			this.uploadmsgid = '';
		},
		/**
		 * 文件、图片上传进度
		 * @param  {string} action
		 * @param  {number} intProgress
		 * @return {void}
		 */
		uploadProgress: function(action, intProgress){
			//$.Log(this.settingid + ':chatMode.uploadProgress()');

			this.view.updateMessage(this.uploadmsgid, 'uploadfile'==action ? 4 : 2, intProgress);
		},
		/**
		 * 显示评价界面
		 * @param  number	passive 0: 点击打开(默认),1:已开启强制评价断开连接时,2:邀请评价
		 * @return {[type]}
		 */
		showEvaluation: function(passive, callback){

			//当前已打开评价窗，忽略邀请评价
			if( passive == 2 && this.view.evalDialog ){
				return false;
			}
			//未连接或发送消息数小于最低消息数时(邀请评价除外)，不能打开评价窗口
			if( this.statusConnectTChat == 'WAIT' && passive != 2 ){
				//$.Log('connect status:' + this.statusConnectTChat, 2);
				return false;
			}
			//主动打开评价窗时，已经评价过时，显示终止消息
			if( this._submitRating === true && passive != 2 ){
				return false;
			}

			//2.0评价
			if(this.config.evaluateVersion == 2) {
				try{
					var evaluateData = $.JSON.parseJSON(this.config.newevaluate)
					this.showEvaluationVersion2(evaluateData, callback);
					return true;
				}catch(e){
					$.Log("This newevaluate JSON is wrong, change evaluate to version 1.0");
					this.config.evaluateVersion = 1;
				}
			}

			//非当前聊窗，收到邀请评价时闪烁
			this.manageMode.callReceive(this.settingid);

			var self = this, formElement;
			//set default config
			if( !this.config.form_evaluation || typeof(this.config.form_evaluation)=='string' || !this.config.form_evaluation.length ){
				this.config.form_evaluation = this.config.evaluation_form;
			}
			if( !this.config.form_evaluation || typeof(this.config.form_evaluation)=='string' || !this.config.form_evaluation.length || this.config.preferlan){
				this.config.form_evaluation = $.lang.default_evaluation_form_fields || [];
			}
			if( !this.config.evaluation_form_title ){
				this.config.evaluation_form_title = $.lang.default_evaluation_form_title || "";
			}
			//set default style
			for(var i=0; i<this.config.form_evaluation.length; i++){
				this.config.form_evaluation[i] = $.extend(this.config.form_evaluation[i], {titlewidth:/zh_cn|en_us/ig.test($.lang.language) ? '5px' : '10px', inputwidth:'auto',optionLine:true, messageid:'alert-form-' + this.config.form_evaluation[i].name});
				if( this.config.form_evaluation[i].type=='textarea' ){
					this.config.form_evaluation[i] = $.extend(this.config.form_evaluation[i], {input:{width:'95%',height:'70px'}});
				}
			}

			this.evaluationElement = this.view.createEvaluation(this.config.form_evaluation, this.config.evaluation_form_title, this.config.startColor, this.config.endColor, callback);

			return true;
		},

		showEvaluationVersion2: function(data, callback) {
		    var self = this;
		    $.require({
		        evaluateTree: self.config.evaluateFile + $.baseExt
		    }, function() {
		        if (!$.evaluateTree) {
		            $.evaluateTree = new $.EvaluateTree(data);
		        }

				if (self.config.enable_labelCounts) {
					$.evaluateTree.clearAnswerCount();

					//所有label
					var nodes = $.evaluateTree.levelNodes[3];
					var labids = "";
					for(nodeIndex in nodes){
						labids += nodes[nodeIndex].substring(1) + ",";
					}
					labeids = labids.substring(0, labids.lastIndexOf(','));

					//设置jsonp回调函数
					var callbackName = 'labelCounts';
					window[callbackName] = function(result){
						try{
							var labelCounts =  typeof result == "string" ? $.JSON.parseJSON(result) : result;
							for(eid in labelCounts){
								$.evaluateTree.getNode('a' + eid).count = labelCounts[eid];
							}
						}catch(e){
							$.Log('labelCounts.callback:' + e.message, 3);
						}
					};

					//评价标签数接口
					data = {
						kfid: self.dest.id,
						labids: labeids,
						callback: callbackName
					};

					$.require($.server.settingserver + '/index.php/api/setting/returnLabids?' + $.toURI(data) + '#rnd', function(){
							self.evaluationElement = self.view.createEvaluationVersion2($.evaluateTree, callback);
					});
				}else {
					self.evaluationElement = self.view.createEvaluationVersion2($.evaluateTree, callback);
				}

				/*
					if (!$.evaluateInterface) {
						$.evaluateInterface = new $.EvaluateInterface($.global.siteid);
					}

					$.evaluateInterface.achieve(function(){
						self.evaluationElement = self.view.createEvaluationVersion2();
					});
				*/

		    });
		},

    	/**2016.04.5
		 * @method submitEvaluationForm 留言的配置
		 * @param  {Function} callback
		 * @return {void}
		 * （6.8.2合版） 留言添加新配置项，可以跳转到企业指定的留言界面
		 */
		getNewMessageConfig :function(){
			if(!this.config.new_leave_message){
				this.config.new_leave_message = {};
			}

			this.config.new_leave_message.disable_message = this.config.disable_message;

			return this.config.new_leave_message;
		},
		/**
		 * 2016.04.20 添加验证失败回调
		 * @method submitEvaluationForm 提交评价
		 * @param  {Function} callback
		 * @return {void}
		 */
		submitEvaluationForm: function(callback, failCallback){
			var self = this;

			if(this.config.evaluateVersion == 2){
				var data = $.EvaluateVerificate.getEvaluateSubmitData();
				if($.isArray(data)){
					self.postEvaluate(data);

					if( callback ){
						setTimeout(function(){
							callback.call(self);
						}, 500);
					}
				}else {
					failCallback.call(self, data);
				}

				return;
			}

			$.FORM.verificationForm(this.config.form_evaluation, function(data){

				self.postEvaluate(data);

				if( callback ){
					setTimeout(function(){
						callback.call(self);
					}, 500);
				}
			}, this.evaluationElement, failCallback);
		},
		/**
		 * POST方式提交评价消息
		 * @param  {Function} callback
		 * @return {void}
		 */
		postEvaluate: function(evaluateData){
			var self = this;

			this.evaluationHidden = true;

			evaluateData = this._formatEvaluationData(evaluateData);

			if( !this.chatgourl ){
				$.Log('chatMode.postEvaluate():chatgourl:' + this.chatgourl, 3);
				this.chatgourl = this.mdyServerAddr( this.server.tchatgoserver );
			}

			//2015.04.27 提交评价history会发生变更
			this.manageMode.addHistoryPageCount();

			//（6.8.2合版）
			var sucFunc = function(){
				//评价提交成功能按钮不可用或等待场景接口返回后设定按钮不可用
				$.Log('evaluate submit complete.', 1);

				if($.browser.mobile){
					evMsg = $.lang.system_mobile_evaluation;
				}else{
					evMsg = $.utils.handleLinks($.lang.system_evaluation, {evaluation: $.enCut(evaluateData.info, 120) });
				}
				self.showMessage('info', {
					type:	9,
					msg:    evMsg
				});
			};


			var failFunc = function(){
				self.evalFailCount++;
				if(self.evalFailCount < 3) {
					evalRequest();
					return;
				}

				self.evalFailCount = 0;
				//评价提交成功能按钮不可用或等待场景接口返回后设定按钮不可用
				$.Log('evaluate submit complete.', 1);

				self.showMessage('info', {
					type:	9,
					msg:    '评价失败'
				});
			};

			var funArr = [
				function(data){
					if((self.evalRequestType === 'AJAX' && data && data.status) || self.evalRequestType === 'POST'){
						sucFunc();
						self.evalFailCount = 0;
					}else{
						$.Log(data.errormsg);
						failFunc();
					}
				},
				function(){
					$.Log('evaluate submit error.', 1);
					failFunc();
				}
			];

			var baseData = {
				action:		'onremark',
				myuid:		this.user.id,
				clientid:	this.clientid,
				sessionid:	this.sessionid,
				rnd:        $.getTime(1)
			};

		    var options = {
		        url: $.server.tstatus,
		        dataType: "json",
		        crossDomain: true,
		        data: $.extend({}, baseData, evaluateData.data, {type:0}),
		        success: function(data){
		            funcArr[0](data);
		        },
		        error: function(msg){
		        	$.Log(msg);
		        	self.evalRequestType = 'POST';
		            evalRequest();
		        }
		    };

		    var evalRequest = function(){
			    if(self.evalRequestType === 'AJAX'){
			    	$.doAjaxRequest(options);
			    }else{
			    	new $.POST(self.chatgourl + '?' + $.toURI(baseData), evaluateData.data, funArr);
			    }
		    };

		    evalRequest();
		},
		/**
		 * 下载聊天记录
		 * @return {void}
		 */
		download: function(){
			$.Log('download recording file');
			if( this.statusConnectTChat == 'WAIT' ){
				return;
			}
			var query = $.toURI({
				m:		'Msg',
				a:		'downloadMsg',
				uid:	this.user.id,
				//不传sessionid时，下载全部互动记录
				sid:	this.sessionid,
				lang:	$.language,
				tzo:	new Date().getTimezoneOffset()/60,
				ts:		$.getTime()
			});
			var url = this.server.mcenter + 'historymessage.php?' + query;
			if( typeof window.openURLToBrowser == "function"){
				window.openURLToBrowser(url);
			}else{
				this.view.displayiFrame.attr('src', url);
			}
		},
		/**
		 * 加载聊天记录
		 * @param {string} settingid
		 * @param {HTMLDOM} iFrame
		 * @return {void}
		 */
		viewHistory: function(settingid, iFrame){
			//兼容360健康
			var address = ($.global.siteid === 'gy_1000' ? 'http://bkpirb.ntalker.com/index.php/messageweb/webAppIndex?' : this.server.mcenter);
			var url = address + 'index.php/messageweb/webAppIndex?' + $.toURI({
				userid:	this.user.id,
				//sid:	this.sessionid,
				//token: "",
				lang:	$.language,
				tzo:	new Date().getTimezoneOffset()/60,
				ts:		$.getTime()
			});

			$.Log('view chats,iFrame:' + iFrame + ', url:' + url, 2);
			$(iFrame).attr('src', url);
		},
		/**
		 * 截图
		 * @return {void}
		 */
		startCapture: function(){
			var self = this;
			if( !this.connected || this.captureing === true ){
				return;
			}
			//09.26 某些情况下连续点击开始截图，浏览器会出现卡死
			this.captureing = true;
			$.Log(this.settingid + ':chatMode.startCapture()');

			$.Capture.start(this.settingid, false, function(){
				self.captureing = false;
				$.Log('Capture.onUploadCompleted()');
			});
			setTimeout(function(){
				self.captureing = false;
			}, 500);
		},
		/**
		 * 20160429 兼容处理机器人1.0,2.0
		 * @method switchServerType 切换服务类型，转人工或转机器人
		 * @param  {string} toArtificial 转人工客服
		 * @param  {string} source       来源
		 * @return {[type]}
		 */
		switchServerType: function(toArtificial, source){
			////this.config.robot 1代表云问机器人1.0  2代表云问机器人2.0
			if( toArtificial ){
				$.Log('switch connect t2dstatus');
				//(6.8.2合版) 机器人2.0 使用发转人工3个字进行转接人工
				if ($.server.robot == 1) {
					this.robotSessionID = this.sessionid;
					this.requestRobot = false;
					this.view.disableButton('manual', true);
					this.statusConnectTChat = 'CLOSECHAT';
					this.disconnect();
					this.view.switchToolbar(true);
					this.sendFirstMessage();
					this.reconnect();
				} else if ($.server.robot == 2) {
					this.manualServiceInfo();
				}
			}else{
				$.Log('switch connect robot');

				if ($.server.robot == 1) {
				    this.robotSessionID = '';
				    this.requestRobot = true;
				} else if ($.server.robot == 2) {
				    this.lastSessionID = '';
				    this.t2dMode = (source === 2) ? source : 1;
				}

				this.view.disableButton('manual', false);

				//停止排队
				this._stopQueue();
				//已转机器人时，忽略t2d排队请求结果
				this.callMethod[this.callBack] = emptyFunc;
				this.statusConnectT2D = 'COMPLETE';
				this.statusConnectTChat = 'WAIT';
				this.disconnect();
				this.view.switchToolbar(false);
				this.sendFirstMessage();
				this.reconnect();
			}
		},
		/**
		 * 最小化聊窗
		 * @return {[type]} [description]
		 */
		minimize: function(){
			//$.Log(this.settingid + ':chatMode.minimize()');
			this.selected = false;
			this.view.minimize();
		},
		/**
		 * 还原聊窗
		 * @return {[type]} [description]
		 */
		maximize: function(){
			$.Log(this.settingid + ':chatMode.maximize()');
			this.selected = true;
			this.unread = 0;
			this.view.maximize();
			//更新客服信息
			this.setDest();
		},
		/**
		 * 接收消息
		 * @param  {[type]} data
		 * @return {[type]}
		 */
		receive: function(data){ //receive message
			var direction;
			if( !$.isObject(data) ){
				$.Log(this.settingid + ':chatMode.receive(' + data + ')');
				data = $.JSON.parseJSON(data);
			}else{
				$.Log(this.settingid + ':chatMode.receive(' + $.JSON.toJSONString(data) + ')');
			}

			//处理接收到的消息
			data = this._filterReceive(data);
			//机器人返回没法回复问题时，会把内容替换指定文本
			if( $.clearHtml(data.msg) == this.CON_ROBOT_NO_ANSWER || data.msg == this.CON_ROBOT_ERROR_MESSAGE ){
				data.msg = this.config.robot_noanswer || data.msg;
			}
			//已发送的消息  2016.12.03 判断机器人systype类型的消息。否则会影响聊窗消息记录显示错误，重复出现该类型的消息。
			if( this.hash.contains(data.msgid) || (data.history == 1&&(data.systype)) ){
				return;
			}

			//接收消息数
			//（6.8.2合版）优化帮助中心，未读消息数量计数方式
			this.noticeMessageCountNew();

			if( data !== false ){
				//访客发送的消息显示的右则，客服消息显示在左则
				direction = $.base.checkID(data.userid)==$.CON_CUSTOMER_ID ? "left" : "right";
				//$.Log('userid:' + data.userid + '(' + $.base.checkID(data.userid) + '), direction:' + direction, 2);
				this.showMessage(direction, data);
			}

			//2014-04-28 接收消息时，同步获了客服信息
			if( $.base.checkID(data.userid)==$.CON_CUSTOMER_ID ){
				//添加客服信息到客服列表中
				//（6.8.2合版）addDestList方法在6.8.1中对参数的赋值有遗漏
				this.addDestList({
					id: data.userid||"",
					name: data.name || data.nickname || data.username,
					logo: data.logo || ""
				});
			}
		},
		/**
		 * @method suggest 显示输入建议
		 * @param  {array} data
		 */
		suggest: function(data){
			return this.view.suggest(data);
		},
		/**
		 * @method (6.8.2合版-新增方法) robot2GetSuggest 云问2.0获取问题建议
		 */
		robot2GetSuggest: function(msg){
			//如果消息为空，直接返回
			if(!msg || (msg && ($.enLength(msg) > 25 || msg.length < 2) )){
				$('.chat-view-hidden-area .chat-view-suggest-list').display();
				return;
			}

			//设置jsonp回调函数
			var self=this,callbackName = '__robot2_callback';
			window[callbackName] = function(result){
				try{
					result = typeof result == "string" ? $.JSON.parseJSON(result) : result;
				}catch(e){
					$.Log('Robot.callback:' + e.message, 3);
				}

				//如果数组长度超过10条，则显示10条
				if(result.list && result.list.length > 10){
					result.list= result.list.slice(0,10);
				}

				//最热的离输入框最近,逆序一下数组
				result.list = result.list.reverse();
				self.robot2Suggest(result);
			};

			//获取输入引导接口
			data = {
				action:"ig",
				q: msg,
				sessionid: this.sessionid,
				clientid: $.global.pcid,
				type: 'jsonp',
				callbackname: callbackName
			};

			$.require(this.server.robotserver + '/robot/app?' + $.toURI(data) + '#rnd');
		},
		/**
		 * @method (6.8.2合版-新增方法) robot2Suggest 云问2.0显示输入建议
		 */
		robot2Suggest: function(data){
			var dataArr = [];
			if(data && data.list && data.status === 0){
				$.each(data.list, function(index, content){
					dataArr.push(content.question);
				});

				return this.view.suggest(dataArr, "robot2.0");
			}
		},
		sendFirstMessage: function(){
			//机器人欢迎语
			//2016.05.02 机器人1.0模式下才显示机器人问候语，机器人2.0的机器人问候语和人工在一个字段
			if( this.requestRobot && this.config.enable_robotgreeting !== 0 && $.server.robot == 1){
				if(!this.config.robot_greeting){ return; }
				this.showMessage('left', {
					msgid:  'welcome_robot',
					type:	1,
					history:1,
					msg:	this.config.robot_greeting || ''
				});
			}
			else if( this.config.enable_artificialgreeting !== 0 ){

				if($.server.robot == 2 && this.robotKf) return;

				var greet_msg = this.config.greet_detail ? this.config.greet_detail : $.utils.handleLinks($.lang.system_first_news, {name: this.config.name});

				this.showMessage('left', {
					msgid:  'welcome',
					type:	1,
					//history:1, debug 20150701  第一条问候语不传递history值
					msg:	greet_msg
				});
			}
		},
		/**
		 * 发送消息
		 * @param  {string|json} data
		 * @return {Boolean}
		 */
		send: function(data, showValue, hiddenValue){ //send message
			var timerkeyid = $.getTime(),
				tdata = {
					//本地时间戳
					localtime:	timerkeyid,
					timerkeyid:	timerkeyid,
					msgid:		this.getMsgId( timerkeyid )
				};
			if( typeof data == 'string' ){
				data = $.extend({}, this.defData, tdata, {msg: data.replace(/</gi, '&lt;').replace(/>/gi, '&gt;')});
			}else{
				data = $.extend({}, this.defData, tdata, data);
			}

			if( !this.connected ){
				//连接异常，正尝试重新连接时，发送消息不分配置客服
				if( !/FAILURE|QUEUE/i.test(this.statusConnectTChat) ){
					$.Log('connected:' + this.connected + ', statusConnectTChat:' + this.statusConnectTChat + ', start', 1);

					this.statusConnectTChat = 'QUEUE';
					this.start(data);
				}

				//未连接或连接断开时，消息存在hashCache中，连接完成后，再发送
				this.hashCache.add(data.msgid, data);

				return false;
			}

			if( typeof data.msg == "string" && data.msg.indexOf('faqvote:') === -1){
				data.msg = $.enCut( data.msg, this.inputMaxByte );
			}

			$.Log(this.settingid + ':chatMode.send(' + ($.isObject(data) ? $.JSON.toJSONString(data) : data) + ')', 1);

			//常规消息在发送同时显示到消息区
			if( data.type == 1 || (data.type==2 && data.emotion==1) ){
				var showData = $.extend({}, data);
				if(showValue) { showData.msg = showValue; }
				if(showData.msg.indexOf('faqvote:') > -1 && hiddenValue) {
					data.msg = hiddenValue;
					data.hidden = showData.msg;
					showData.msg = hiddenValue;
					this.showMessage('right', showData);
				} else {
					this.showMessage('right', showData);
				}
			}else if( /^(2|4|6)$/gi.test(data.type) ){
				//发送文件或图片时，消息存在hash中
				this.hash.add(data.msgid, data);
			}

			//发送消息数量自增
			if( /^(1|2|4|6)$/gi.test(data.type) ){
				this._sendNum++;
				this._changeCsrNum++;
				//已添加场景信息，访客会话消息数量满足条件后，服务端会通过场景信息，通知是否可评价
				if(this._changeCsrNum == this._changeCsrMaxNum){
					this.view.disableButton('csr', false);
				}
			}

			//-----------------发送消息-------------------------------
			if( this.connect ){
				this.connect.sendMessage(data);
			}

			//2016-04-25
			//（6.8.2合版）优化帮助中心，清空未读消息数量
			this.clearMessageCount(data);
			return true;
		},
		//（6.8.2合版）优化帮助中心，未读消息数量计数方式
		noticeMessageCountNew: function (data) {
			if( typeof webInfoChanged !== "function" ){
				return;
			}
			if( !data || !/(^1|2|4|6|7)$/i.test(data.type) || data.msgid === "welcome" || data.history == 1 || data.msgsystem == "true" ){
				return;
			}
			this.receiveMsgCount++;

			webInfoChanged(400, '{"num":' + this.receiveMsgCount + ', "showNum":1}', false);
		},
		//（6.8.2合版）优化帮助中心，清空未读消息数量
		clearMessageCount: function () {
			this.noticeMessageCount = 0;

			if( typeof webInfoChanged !== "function" ){
				return;
			}
			webInfoChanged(400, '{"num":0, "showNum":1}', false);
		},
		/**
		 * 重新发送发送失败的消息
		 * @param  {string} msgid
		 * @return {void}
		 */
		resend: function(msgid){
			if( !this.hash.contains(msgid) ){
				return false;
			}

			this.send( this.hash.items(msgid) );
		},
		/**
		 * 发送消息预知
		 * @param  {string} data [description]
		 * @return {void}
		 */
		predictMessage: function(data){
			if( !this.connected || !this.connect ){
				return;
			}
			$.Log('$.chatMode.predictMessage(' + data + ')');
			this.connect.predictMessage(data);
			if( $.server.robot == 2 && this.robotKf && this.view.isRobotSuggest){
				this.robot2GetSuggest(data);
			}
		},
		/**
		 * 过滤接收到的消息:常规消息，发送失败的消息等等
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_filterReceive: function(data){
			var self = this;
			if( this.user.id == data.userid || $.base.checkID(data.userid) === $.CON_VISITOR_ID  ){
				//修正通过flash收到的已发送消息消息无msgid问题
				data.msgid = !data.msgid ? this.getMsgId( data.timerkeyid ) : data.msgid;
			}else{
				if( +data.history != 1 && /^(1|2|4)$/.test(data.type) ){
					//收到非历史消息时,标题闪烁
					$.promptwindow.startPrompt('', $.lang.news_new, true);
					//聊窗标签闪烁
					this.manageMode.callReceive(this.settingid);

					//未读消息数
					if( !this.selected ){
						this.unread++;
					}
				}
			}
			data.msgid = data.msgid || data.timerkeyid;
			// bug7387 存在一种情况 this.jetLag 为undefined 所以这里把他转换成数字 2016.11
			if( this.jetLag ){
				data.timestamp	= data.timestamp + parseInt(this.jetLag) ;
			}else{
				data.timestamp	= data.timestamp
			}

			data.timerkeyid	= data.timestamp;
			//本地时间戳
			data.localtime	= data.timestamp;

			//连接对像返馈的消息,用于重新发送
			if( data.msgType == 1 ){
				//flash连接超时，发送消息失败
				//system_connect_timeout
				this.view.updateMessage(data.msgid, 1, $.lang.system_send_failure);

				//发送消息失败统计点
				this.callTrack("10-01-04","flash timeout, message send failure");

				return false;
			}else if( data.msgType == 2 ){
				//消息发送失败
				if( $.isObject(data.msg) ){
					//评价等复杂消息发送失败(新版已不在通过此处返回)
					return false;
				}else{
					//发送消息失败统计点
					this.callTrack("10-01-04","common message send failure");

					//常规消息发送失败
					this.view.updateMessage(data.msgid, 1, $.lang.system_send_failure);

					return false;
				}
			}else if( data.type === 9 ){
				//发送消息失败统计点
				this.callTrack("10-01-04","message is too fast to send");

				//发送消息太快
				data.msgid = data.msgid || this.getMsgId( data.timeData );

				this.view.updateMessage(data.msgid, 1, $.lang.system_send_failure);

				if( this.view.displayStatusInfo ){
					this.view.displayStatusInfo(true, $.lang.system_fast_messaging);

					this.floatTimeID = setTimeout(function(){
						clearTimeout(self.floatTimeID);
						self.floatTimeID = null;
						self.view.displayStatusInfo(false);
					}, 3000);
				}
				return false;
			}
			return data;
		},
		/**
		 * 展示消息
		 * @param  {string} type first|goods|system|left|right
		 * @param  {[type]} data
		 * @return {[type]}
		 */
		showMessage: function(type, data){
			var timesample = $.getTime(),
				self = this;
			data = $.extend({
				localtime:	timesample,
				timerkeyid:	timesample,
				msgid:		this.getMsgId( timesample ),
				msg:		''
			}, type == 'left' ? this.dest : this.defData, data);

			if( this.hash.contains(data.msgid) ){
				return;
			}
			if( data.msgid.indexOf('welcome') > -1) {
				data.timerkeyid = -1;
				data.localtime = -1;
			}
            //过滤消息中URL协议
            if( data.logo){
                data.logo = $.protocolFilter( data.logo );
            }
            if( data.url ){
                data.url   = $.protocolFilter( data.url );
            }
            if( data.sourceurl ){
                data.sourceurl = $.protocolFilter( data.sourceurl );
            }
            if( data.mp3 ){
                data.mp3   = $.protocolFilter( data.mp3 );
            }
            if(data.msg && typeof data.msg == "string" && data.msg.indexOf('xnlink')>-1) {
            	data.xnlink = true;
            }
            //（6.8.2合版）systype 为 1 代表是机器人系统消息
            if( data.systype ) {
            	//添加sysStatus字段， 1：正在为您转接 2：排队 3：放弃排队提示 4：成功转接人工 5：转接人工失败

				//排队时，需要停止排队断线定时器
				if( data.systype === "2" ){

					if( this.connect.connect.robotQueue !== 2 && !data.history){
						this.callStat('11');
						this.connect.connect.robotQueue = 2;
						this.connect.connect.clearSessionIdle();
						this.view.disableButton("manual", true);
					}

                    while( data.msg.indexOf("\n") !== -1 ){
                        data.msg = data.msg.replace("\n", "<br>");
                    }

					var num = data.msg.match(new RegExp(/[0-9]+/gi));
					if(num && num.length > 0 && num[0]){
						var queueNumber = '<font class="chat-view-queue-num" style="' + $.STYLE_BODY + 'color:red;font-weight:bold;">' + num[0]+ '</font>';
						data.msg = data.msg.replace(/[0-9]+/, queueNumber);
					}
				} else {
					if(data.systype === "1" && !data.history){
						this.connect.connect.robotQueue = 1;
					}else{
						//收到放弃排队提示
						if(data.systype === "3"  && !data.history){
							this.callStat('23');
							this.htmlsid = $.getTime(2);
						}
						//收到转人工成功提示，且非历史消息
						//2016.12.05转人工后出现客服欢迎语和问候语  注释掉。
						// if(data.systype === "4"  && !data.history){
						// 	if($('.welcome').length > 0){
			      //               $('.welcome').remove();
			      //               self.hash.remove('welcome');
			      //           }
						// 	//进入咨询发送 统计点10
						// 	this.callStat('10');
						//
						// 	setTimeout(function(){
						// 		self.sendFirstMessage();
						// 		self.setRobot2Param(false);
						// 	}, 500);
						// }
						this.connect.connect.robotQueue = 0;
						this.view.disableButton("manual", false);
					}
				}

            	type = 'left';

				if( data.systype === "2" || data.systype === "5"){
					var robotSystemMessage = this.config.robotSystemMessage || this.robotSystemMessage;

					$.each(robotSystemMessage, function(key, value){
						if(key == 'message'){
							data.msg = $.utils.handleLinks(data.msg.replace(value, "[link message={$settingid} source=2]" + value + "[/link]"));
						}else{
							value = value.split(",");
							for(var i=0; i<value.length; i++) {
								var message = '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;font-size:' + ($.browser.mobile ? 14 : 12) + 'px;" href="javascript:void(0);" onclick="nTalk.chatManage.get(\'' + self.settingid + '\').send(\'' + key + '\', \'' + value[i] + '\');return false;" >' + value[i] +'</a>';
								if(data.msg.indexOf(value[i]) > -1){
									data.msg = data.msg.replace(value[i], message);
								}
							}
						}
					});
				}

            	data.msgid = 'robot_toast' + (/2|4|5/gi.test(data.systype) ? 2 : data.systype);
                data.type = 1;
                data.msg = data.msg;
                data.fontsize = $.browser.mobile ? 14 : 12;

                if($('.' + data.msgid).length > 0){
                    $('.' + data.msgid).remove();
                }
            }

            this.hash.add(data.msgid, data);

			return this.view.showMessage(type, data);
		},
		/**
		 * 发送商品信息地址
		 * @return {[type]} [description]
		 */
		_sendGoodsinfo: function(){
			var self = this,url;

			if( !this.options.itemid ){
				return;
			}
			this.callStat('20');

			url = this.server.mcenter + '/goodsinfo/api.php?' + $.toURI({
				siteid:		this.siteid,
				itemid:		this.options.itemid,
				itemparam:	this.options.itemparam,
				sellerid:	this.options.sellerid,
				user_id:	$.global.shortid
			});

			//商品信息接口地址存入消息hashCache中
			//客户端商品信息展示采用接口type=2
			this.hashCache.add($.getTime(1), {
				type: 5,
				msg: {
					msgtype: 5,
					productInfoURL: url + '&type=2&ts=' + $.getTime()//老版本客户端商品信息页面
				}
			});

			//加载商品信息
			if( window[this._callbackGoodsinfo] || ($.browser.mobile && !this.CON_MOBILE_SHOW_GOODSINFO) ){
				$.Log('CON_MOBILE_SHOW_GOODSINFO:' + this.CON_MOBILE_SHOW_GOODSINFO);
				return;
			}

			window[this._callbackGoodsinfo] = function(data){
				self._showGoodsinfo(data);
			};
			$.require( url + '&type=jsonp&lan=' + $.lang.language + '&callback=' + this._callbackGoodsinfo + '#rnd', function(script){
				$(script.error ? script.target : script).remove();
			});
		},
		/**
		 * 展示商品信息
		 * @return {[type]} [description]
		 */
		_showGoodsinfo: function(data){
			if( !data ){
				this.showMessage('goods', {type: 3});
			}else{
				this.showMessage('goods', {
					type:	13,//goodstype:13
					msg:	data
				});
			}
		},
		/**
		 * 是否是访客
		 * @param string userid
		 * @return number 0:访客;1:客服;
		 */
		isVisitor: function(userid){
			var usertype = $.base.checkID(userid);
			return usertype === $.CON_VISITOR_ID;
		},
		/**
		 * 获取客服信息(分配失败时，从config中获取第一个)
		 * @param  {Boolean}  isGetGroupID
		 * @return {json}
		 */
		getDest: function(isGetGroupID){
			var config = this.config;
			$.Log('chatMode.getDest(' + isGetGroupID + ')');
			if( isGetGroupID ){
				//2015.06.18 客服组ID为空或客服组无客服时，提示用户未配置客服
				temp = config.icon || config.list || config.toolbar || config.featureset || null;
				return !temp||!temp.members.groupID||!temp.members.idList.length ? '' : temp.members.groupID;
			}else{
				if( this.dest && this.dest.id && this.dest.id != this.robotID && this.dest.id != $.CON_SINGLE_SESSION && this.dest.id.indexOf('GT2D') == -1 ){
					return this.dest;
				}else{
					this.dest.id = '';
					this.dest.name = '';
					var members = (config.icon || config.list || config.toolbar || config.featureset).members;
					return {
						id:		members.idList[0],
						name:	members.nameList[0],
						sign:	members.sigList[0]
					};
				}
			}
		},
		/**
		 * 更新客服信息
		 * @param {Object}  data
		 */
		setDest: function(data){
			var self = this, attr;

			data = data || {};
			//教育版 更新电话状态
			if( data.phone && $.browser.mobile ){
				this.manageMode.view.setPhoneNumber(data.phone);
			}
			//2016.12.15 客户更换头像后，有缓存的访客不生效。
			if( data.logo ){
				data.logo.indexOf('rand')<0  ? data.logo = data.logo+'?rand='+nTalk.randomChar() : '';
			}
			$.Log(this.settingid + ':chatMode.setDest(' + (data ? $.JSON.toJSONString(data) : '') + ')');
			//2015.05.12 排队时，首次返回完整信息，之后会返回部分信息
			$.each(data, function(key, value){
				self.dest[key] = value || self.dest[key];
			});
			//this.dest = $.extend({}, this.dest, data);

			//添加客服信息到客服列表中
			if( data && !$.isEmptyObject(data) ){
				this.addDestList({
				    id: data.id,
					name: data.name,
					logo: data.logo
				});
			}

			if( this.config && this.config.mode=='trial' ){
				this.dest.title = $.lang.chat_title_ext + ' ' + this.dest.name;
			}else{
				this.dest.title = this.dest.name;
			}
			//2015.10.12 聊窗头像最大尺寸
			this.dest.attr = {
				width: $.browser.mobile ? 35 : 55,
				height:$.browser.mobile ? 35 : 55
			};

			if( !this.dest.logo ){
				//$.Log('LOGO is null::' + $.JSON.toJSONString(this.dest), 2);
				if( self.selected ){
					self.dest.logo = self.userNumber > 1 ? $.imagemultiplayer : $.imagesingle;

					self.manageMode.callSetDest(this.settingid, $.extend({}, this.dest));
				}
			}else{
				//预加载头像
				if( $.CON_MULTIPLAYER_SESSION === this.dest.logo || (this.userNumber > 1 && !$.browser.mobile) ){
					this.dest.logo = $.imagemultiplayer;
				}else if( $.CON_SINGLE_SESSION === this.dest.logo ){
					this.dest.logo = $.imagesingle;
				}

				if( this.selected ){
					this.manageMode.callSetDest(this.settingid, $.extend({}, this.dest));
				}

				$.require(this.dest.logo + '#image', function(image){
					if( this.src !== self.dest.logo ){
						return;
					}
					if( this.error !== true ){
						//（6.8.2合版）wap在多人会话时，对头像做特殊处理
						self.dest = $.extend({}, self.dest, {
							logo: self.dest.logo,
							image:this,
							attr: $.zoom(this, self.dest.attr.width, self.dest.attr.height)
						});
						//更新头象属性
						//2015.01.14 self.dest需要使用$.extend({}, self.dest)消除引用关系
						self.hashDest.items(self.dest.id, $.extend({}, self.dest));
					}else{
						self.dest.logo = $.imagesingle;
					}

					if( self.selected ){
						self.manageMode.callSetDest(self.settingid, $.extend({}, self.dest));
					}else{
						//2014.08.21
						//非当前聊窗，客服状态变更时，需要更新多聊窗时侧边栏客服在线状态图标
						self.manageMode.callSetDestStatus(self.settingid, $.extend({}, self.dest), true);
					}
				});
			}
		},
		/**
		 * 更新访客信息
		 * @param {[type]} data
		 */
		setUser: function(data){
			this.user = $.extend(this.user, data);

			this.defData = $.extend(this.defData, {
				userid:	this.user.id || '',
				name:	this.user.name || '',
				logo:   this.user.logo || ''
			});
		},
		/**
		 * 客服正在输入,在聊窗中创建一条新消息占位，此消息会一直在最新位置
		 * @params {string} targetId 正在输入的用户ID
		 * @return {void}
		 * （6.8.2合版）显示客服正在输入消息时，添加客服的id,name,logo信息
		 */
		showInputState: function(targetId){
			var cssText = 'background:transparent url('+$.sourceURI+'images/mobileicon.png) no-repeat -22px -250px;';
			var newTargetInfo = this.hashDest.items(targetId);

			this.showMessage('bottom', {
				userid:	newTargetInfo ? newTargetInfo.id : targetId,
				name:	newTargetInfo ? newTargetInfo.name : "",
				logo:	newTargetInfo ? newTargetInfo.logo : "",
				type:	1,
				msg:	['<span class="view-history-body-wait" style="', $.STYLE_NBODY, 'margin:0 10px;display:block;width:32px;height:20px;',cssText,'"></span>'].join('')
			});

			this.view.showInputState();
		},
		/**
		 * 处理加载的配置项
		 * @return {[type]} [description]
		 */
		initConfig: function(){
			var self = this, msgContent, effective;

			if( !this.options.config || $.isEmptyObject(this.options.config) ){
				this.switchUI( this.CON_VIEW_ERROR, 'LOAD_FAIED' );
				return;
			}else{
				this.switchUI(this.CON_VIEW_WINDOW, 'LOAD_COMPLETE');
			}
			this.config = $.extend({
				settingid: this.settingid
			}, this.options.config);

			//2014.09.20
			//会话服务相关服务器地址迁移至配置文件中，此处需要合并服务器地址至 $.server
			if( !this.options.config.service ){
				$.Log('config file version error.', 3);
				this.server = $.extend({}, $.server, {
					tchatserver:	'',
					tchatgoserver:	'',
					filetranserver: ''
				});
			}else{
				this.server = $.extend({}, $.server, $.protocolFilter(this.options.config.service));
			}

			//配置文件中的URL协议替换,企业头像使用替换的https协议
			this.config.logo = $.protocolFilter(this.config.logo);

			//2016.05.02 机器人1.0需要在此给requestRobot赋值
			effective = this.server.robot == '1' && this.config.robot == '1' && this.server.roboturl;
			if( effective ){
				if( this.options.manual == 1 ){
					this.requestRobot = false;
				}else if( this.config.robot_mode === 0 ){
					//机器人有效、配置模式为直连机器人
					if( !this.config.robot_inherits_state || (this.config.robot_inherits_state == 1 && $.default_connect_robot) ){
						//不继承连接状态，或继承连接状态且连接状态为直接机器人时
						this.requestRobot = true;
					}
				}
				$.Log('nTalk.chatMode.initConfig(): requestRobot:' + this.requestRobot);
			}


			//配置应用到当前聊窗
			this._initChatConfig();
			//-------------首条消息，企业Logo、欢迎语-----------------------
			msgContent = !$.browser.mobile&&this.config.logo ? '<p style="' + $.STYLE_BODY + 'background-color:transparent;text-align:center;"><img data-type="ntalk-enterprise-logo" src="'+this.config.logo+'" style="' + $.STYLE_BODY + 'text-align:center;display:inline;" onerror="nTalk.loadImageAbnormal(this, event)" onload="nTalk.imgScrollBottom()"/></p>' : '';


			//--------------------------------------------------------------
			//2014.08.06
			//欢迎语显示到聊窗头
			//更新展示客服信息
			this.setDest({
				id:		this.siteid,
				logo:	this.config.logo || '',
				name:	$.utils.handleLinks($.lang.system_title_news, {name: this.config.name || ''}),
				status:	0
			});
			//聊窗消息区公众形像
			this.showMessage('first', {
				type:	0,
				msg:	msgContent
			});

			this.sendFirstMessage();

			//2015.11.01 单独提取语音初始化方法，方便调用
			if(this.config.enable_audio == 1){
				this.audioInit();
			}
			// 2017.04加载聊窗完成执行回调函数
			$.base.fire("OpenChatWindow",[]);
		},

		/**
		 * 2015.11.01 语音初始化方法
		 */
		audioInit: function(){
			var self = this;
			if( $.Audio ){
				//音频消息支持
				$.Audio.start(this.server.filetranserver, {
					action: 'uploadaudio',
					roomid: 'T2D',
					siteid: this.siteid,
					settingid:this.settingid
				}, function(disabled){
					$.Log('set Audio Button disabled:' + disabled, 2);
					//设音频消息可用
					self.view.disabledAudioButton(disabled);
				});
			}
		},

		audioUpload: function(e, randomid){
			var progress, target, json, self=this;
			if( e.status === 'uploading' ){
				if( !this.uploadingid[randomid] ){
					this.uploadingid[randomid] = 'temp';
					this.uploadingid[randomid] = this.showMessage('right', {
						type:	6,
						msg:	'uploading'
					});
				}

				progress = ((e.event.loaded/e.event.total)*100).toFixed(2);
				//$.Log('upload ' + progress + '%', 1);

				if (this.uploadingid[randomid] && this.uploadingid[randomid] != 'temp') {
					this.view.audioProgress(this.uploadingid[randomid], progress);
				}
			}
			else if( e.status === 'success' ){
				var successInter = setInterval(function(){
					if(self.uploadingid[randomid] && self.uploadingid[randomid]!='temp') {
						clearInterval(successInter);
						target = e.event.target || e.event.currentTarget || e.event.srcElement;
						//发送音频消息
						$.Log(target.responseText);
						try{
							json = $.JSON.parseJSON(target.responseText);
						}catch(e){
						}
						//音频消息类型:6
						json.type = 6;
						json.sourceurl = json.url;
						json.url = json.mp3;
						json.duration = json.length;
						delete json.mp3;

						self.view.updateMessage(self.uploadingid[randomid], 6, json);
						$.Log('audioUpload:' + $.JSON.toJSONString(json), 2);
						self.send($.extend(json, {
							msg: json
						}));
						self.view.showAudioResult(self.uploadingid[randomid]);
						self.uploadingid[randomid] = '';
					}
				}, 200);
			}else if( e.status === 'error' ){
				self.view.showAudioResult(self.uploadingid[randomid]);
			}else {
				$.Log(e, 3);
			}
		},
		/**
		 * 应用配置项
		 * @return {[type]} [description]
		 */
		_initChatConfig: function(){
			var self = this, data = [], buttonArea, startColor, endColor, defultFace, display;

			if( $.isDefined(this.config.message_skin) && (this.config.message_skin == 'chat/2' || this.config.message_skin === '' || this.config.message_skin.indexOf('|') > -1) ){
				this.config.message_skin = !this.config.message_skin ? '#2c2c2e|#474749' : this.config.message_skin;
				this.config.startColor = this.config.message_skin.substr(0, this.config.message_skin.indexOf('|'));
				this.config.endColor   = this.config.message_skin.substr(this.config.message_skin.indexOf('|') + 1);
			}else{
				var defaultSkin = {
					'chat/1': '#4297e0',
					'chat/3': '#575757',
					'chat/4': '#f25488',
					'chat/5': '#52ab52',
					'chat/6': '#9bc942',
					'chat/7': '#4297e0',
					'chat/8': '#4297e0',
					'chat/9': '#4297e0',
					'chat/10': '#4297e0'//老版皮肤兼容10
				};
				if( defaultSkin[this.config.message_skin] ){
					this.config.startColor = this.config.endColor = defaultSkin[this.config.message_skin];
				}else{
					this.config.startColor = this.config.endColor = this.config.message_skin;
				}
			}
			//新增聊窗背景图支持
			this.config.chatBackground = $.isDefined(this.config.message_content_skin) ? this.config.message_content_skin : '#FFFFFF';

			//聊窗功能按钮控制开关
			//2015.02.07 工具条功能按钮添加状态标记，在切换工具条按钮时，disabled的按钮不显示
			this.view.disableButton('face', this.config.enable_face === 0);
			this.view.displayButton('face', this.config.enable_face === 0);

			this.view.disableButton(['image','file'], this.config.transferfiles === 0);

			if( this.config.transferfiles === 0 || ($.browser.android && this.config.androidtransf === 0) || ($.browser.mobile && !$.browser.android && this.config.othertransf === 0) ){
			    this.view.displayButton(['image','file'], true);
			}else{
			    this.view.displayButton(['image','file'], false);
			}

			//语音是否隐藏
			if ($.browser.mobile && (this.config.enable_audio === 0 || (this.config.enable_audio==2 && $.browser.gecko))) {
				this.view.hideAudioButton();
			}

			this.view.disableButton('history', this.config.chatingrecord === 0);
			this.view.displayButton('history', this.config.chatingrecord === 0);

			//2014.11.28 聊天记录查看按钮控制开关
			this.view.disableButton('loadhistory', this.config.viewchatrecord != 1);
			this.view.displayButton('loadhistory', this.config.viewchatrecord != 1);

			this.view.disableButton('evaluate', this.config.evaluation === 0);
			this.view.displayButton('evaluate', this.config.evaluation === 0);

			//截图功能控制开关
			this.view.disableButton(['capture','capoptions'], this.config.captureimage === 0);
			this.view.displayButton(['capture','capoptions'], this.config.captureimage === 0 );//|| !$.global.pageinchat

			//2015.07.01 是否启用切换客服功能按钮，需要服务器支持
			this.view.disableButton('csr', this.config.changecsr != 1);
			this.view.displayButton('csr', this.config.changecsr != 1);

			//2015.12.15 允许屏蔽
			this.view.displayButton('xiaonengver', this.config.xiaonengver === 0);

			if( this.requestRobot && this.config.robot_mode === 0 ){
				//机器人模式，机器人工具条(显示转人工按钮)
				this.view.switchToolbar(false);
			}
			//表情组数据
			var firstIcon = true;
			this.config.faces = this.config.faces || [];
			defultFace = {
				id:		"-1",
				name:		"",
				icon:	"",
				pics:		[]
			};
			$.each($.lang.editorFaceAlt, function(k, face){
				//setFirst Face to default icon
				if( firstIcon ){
					defultFace.icon = $.sourceURI + 'images/faces/' + k + ($.browser.msie6 ? '.gif' : '.png');
					firstIcon = false;
				}
				defultFace.pics.push( {
					id:			k,
					url:		$.sourceURI + 'images/faces/' + k + ($.browser.msie6 ? '.gif' : '.png'),
					sourceurl:	$.lang.editorFaceAlt[k]
				});
			});
			if( !this.config.faces.length || this.config.faces[0].id != "-1" ){
				this.config.faces.unshift( defultFace );
			}

			//侧边栏数据,配置文件中配置优先级大于默认配置
			if( !this.config.rightlabel || $.isEmptyObject(this.config.rightlabel) ){
				this.config.rightlabel = $.lang.rightlabel;
			}else{
				this.config.rightlabel = $.merge({}, this.config.rightlabel);
			}

			$.each(this.config.rightlabel, function(k, item){
				switch(k){
				case 'about':
					var introHtml = self.config.introduction,
						expTab = /\[tab\s+(.*?)\](.*?)\[\/tab\]/gi
					;
					if( expTab.test(introHtml) ){
						introHtml = introHtml.replace(expTab, "$1");
						introHtml  = $.utils.handleLinks(introHtml , {
							siteid:		self.siteid,
							user_id:	$.global.shortid,
							lang:		$.language || '',
							itemid:		self.itemid || '1111',
                            erpparam:   $.global.erpparam || "",
							itemparam:	self.options.itemparam,
							sellerid:   !self.options.itemparam ? self.options.sellerid : ''
						});
						data.push($.extend(item, {data: introHtml}));
					}else if( introHtml ){
						data.push($.extend(item, {data: introHtml}));
					}
					break;
				case 'faq':
					if( self.config.faqlist && self.config.faqlist.length ){
						data.push($.extend(item, {data: self.config.faqlist || []}));
					}
					break;
				case 'linkinpage':
					data.push(item);
				default:
					//自定义页常规参数替换
					// 2017.05.07 多次替换itemid会失效
					var itemdata = $.extend({}, item);
					itemdata.data = $.utils.handleLinks(item.data, {
						siteid:		self.siteid,
						user_id:	$.global.shortid,
						itemid:		self.itemid || '1111',
						itemparam:	self.options.itemparam
					});
					if( itemdata.data ){
						data.push(itemdata);
					}
                    break;
				}
			});

			this._moreData = data;
			if( this.manageMode.callConfigLoaded ){
				this.manageMode.callConfigLoaded(this.settingid, this.config, data);
			}
			//无更多配置时，聊窗不显示更多按钮
			this.displayMoreData();

			return;
		},
		/**
		 * 显示与隐藏更多按钮
		 * @return {[type]} [description]
		 */
		displayMoreData: function(){
			if( !this.view.displayButton || $.browser.mobile) return;

			if( !this._moreData || !this._moreData.length || $.global.pageinchat === false ){
				this.view.displayButton('exp', true);

				return true;
			}else{
				if( this.config.autoexpansion == '1' && !this.getExpansionStatus() ){
					if( this.view.chatElement.find('.chat-view-exp') ){
						this.view.chatElement.find('.chat-view-exp').html($.lang.button_more + ' &lt;');
					}
					this.toggleExpansion(this.settingid);
				}
				//this.view.displayButton('exp', false);

				return false;
			}
		},
		/**
		 * 请求分配客服
		 * @param  string   destid    客服ID或客服组ID
		 * @param  number   single    是否是单客服
		 * @param  string   ruids     前一次分配的客服ID
		 * @return
		 */
		getCustomerServiceInfo: function(destid, single, ruids){
			//开始t2d连接统计点
			this.callTrack("10-01-05","start t2d connect");

			var self = this, customerInfo;

			this.callMethod = this.callMethod || window;
			this.callBack   = 'callBack_chat_' + $.randomChar();
			this.callMethod[this.callBack] = function(){
				if( typeof window.nTalk.fIM_getSessionCustomerServiceInfo == 'function' ){
					window.nTalk.fIM_getSessionCustomerServiceInfo.apply(self, arguments);
				}else{
					window.nTalk.Log('nTalk.fIM_getSessionCustomerServiceInfo is undefined', 3);
				}
			};

			//2016.05.02 机器人1.0利用requestRobot,机器人2.0统一使用请求t2d
			if( this.requestRobot ){
				this.dest.destid = this.robotID;

				customerInfo = {
					status:		1,
					userid:		this.dest.destid,
					nickname:	this.config.robot_name || $.lang.robot_name,
					usericon:	this.config.robot_logo || '',
					signature:	'',
					sessionid:	''
				};
				this.callMethod[this.callBack](customerInfo, this.settingid);
			}else{
				//t2d
				this._getCustomerServiceForT2dStatus(destid, single, ruids);
			}
		},
		/**
		 * 请求更换客服
		 */
		changeCustomerServiceInfo: function(){
			this.startCSSwitch = 'START';

			//机器人2.0 更换客服前，先将t2dMode置为0，将上一次会话sessionid清空
			if($.server.robot == 2) {
				this.t2dMode = 0;
				this.lastSessionID = "";
			}

			this.getCustomerServiceInfo(this.getDest(true), 0, this.getDest().id);
		},
		/**
		 * 请求转人工
		 */
		manualServiceInfo: function(){
			this.send($.lang.button_switch_manual);
			this.view.disableButton("manual", true);
		},
		/**
		 * 请求客服分配
		 * @param  string   destid    客服ID或客服组ID
		 * @param  number   single    是否是单客服
		 * @param  string   ruids     前一次分配的客服ID
		 * @return
		 */
		_getCustomerServiceForT2dStatus: function(destid, single, ruids){
			$.Log('chatMode._getCustomerServiceForT2dStatus(' + destid + ', ' + single + ')', 1);
			var self = this, queryString, idType = $.base.checkID(destid);

			if( this._connectTimeout ){
				$.Log('Connect tchat...', 2);
				return;
			}
			if( !$.user.id || !$.global.pcid ){
				return;
			}

			if( idType === false || (idType != $.CON_CUSTOMER_ID && idType != $.CON_GROUP_ID) ){
				//2015.06.18 客服ID为空或异常客服ID时(非客服组ID、客服ID)，显示未配置客服ID
				this.showMessage('system', {
					type:	9,
					msg:	$.lang.system_no_user
				});
				return;
			}

			//如果是云问机器人2.0
			var robotVersion2 = {};
			if( $.server.robot == 2){
				var sessionid = (this.lastSessionID || this.sessionid) ? (this.lastSessionID || this.sessionid) : null;
				var trf = this.t2dMode;
				var _ruids = ruids ? ruids : ((this.dest && this.dest.id && $.base.checkID(this.dest.id)===0) ? this.dest.id : null);
				_ruids = (this.t2dMode === null) ? null : _ruids;
				robotVersion2 = {
					sid: sessionid,
					trf: trf,
					ruids: _ruids
				};
			}

			queryString = $.toURI($.extend({
				query:		'requestchat',
				sitid:		this.siteid,
				settingid:	this.settingid,
				uid:		$.user.id,
				uids:		destid,
				ruids:		ruids,
				issingle:	single,
				cid:		$.global.pcid,//2014.07.31 新添pcid参数
				type:		$.global.isvip,
				userlevel:	$.global.userlevel, //2017.08.17 添加userlevel参数
				usertag:    $.global.usertag,	//2017.08.17 添加usertag参数
				userrank:   $.global.userrank, //2017.08.17	添加userrank参数
				callbackname: this.callBack
			}, robotVersion2), true);
			if( this.view.displayStatusInfo && this.statusConnectT2D !== 'QUEUE' ){
				this.view.displayStatusInfo(true, $.lang.system_allocation_service);
			}
			$.Log('QueryString:' + queryString);

			$.Log(':::' + this.server.t2dstatus + '?' + queryString + '#rnd', 1);
			this.statusConnectT2D = 'QUERY';
			$.require(this.server.t2dstatus + '?' + queryString + '#rnd', function(script){
				$.Log('request t2dstatus complete: error:' + (script.error||'') + ', reconnect:' + self._reconnectCount + ', statusConnectT2D:' + self.statusConnectT2D);

				if( script.error || self.statusConnectT2D == 'QUERY' ){

					self.callTrack('10-01-07', 't2d abnormal');
					self._reconnectCount++;
					self.statusConnectT2D = 'WAIT';
					if( self._reconnectCount < 3 ){
						setTimeout(function(){
							self.reconnect();
						}, 1000);
					}else{
						//20150212 原为3次重试失败后，转向留言界面
						//self.switchUI(self.CON_VIEW_MESSAGE, '3TH_REQUEST');
						//现在修改为3次重试失败后，显示提示消息，允许访客重试或留言
						self._reconnectCount = 0;
						self._failure('3TH_REQUEST');
					}
				}
				$(script.error ? script.target : script).remove();
			});
		},
		/**
		 * 分配客服完成回调
		 * @param  {[type]} data
		 * @return {[type]}
		 */
		callBackCustomerServiceInfo: function(data){
			var self = this;
			var msg = '';
			// 教育版 如果客服在忙碌状态下邀请，直接将状态改为在线
			if( this.options.edu_invisitid && $.isEdu && data.status == 3){
				data.status = 1;
			}
			$.Log(this.settingid + ':chatMode.callBackCustomerServiceInfo(' + $.JSON.toJSONString(data) + ')', 1);

			if( !data || data.error || (data.status!=3 && ( !data.userid || (!data.externalname && !data.nickname) )) ){
				//切换客服失败
				this.callTrack('10-01-07', 'result params abnormal');

				//切换客服异常
				if(data.error == CON_NO_FREE_USER){
					msg =	$.lang.system_no_free_user;
				}
				//切换客服超出最大次数
				else if(data.error == CON_OVER_RECHATNUM){
					msg =	$.lang.system_over_rechatnum;
					this.view.disableButton('csr', true);
				}
				else if( data.error == CON_NO_USER2 ){

					msg =	$.lang.system_no_user;
				}
				if( msg !== "" ){
					this.showMessage('system', {
						type:	9,
						msg:	msg
					});

					this.callStat('13');

					this.statusConnectT2D = 'COMPLETE';

					//分配客服异常，隐藏分配消息
					if( this.view.displayStatusInfo ){
						this.view.displayStatusInfo(false);
					}

					this._stopQueue();

					if( this.robotKf) {
						setTimeout(function(){
							self.t2dMode = null;
							self.reconnect();
							$.Log("please set manual customer in robot setting group");
						}, 2000);
					}

					return;
				}

				this._abnormal(data.error || '');

				this.startCSSwitch = '';

				if( this.view.displayStatusInfo ){
					this.view.displayStatusInfo(false);
				}
				return;
			}

			this.callTrack('10-01-06', 'success');

			if( this.startCSSwitch == 'START' ){
				this.startCSSwitch = 'SHOW';
			}

			this._clearChangeCsrNum();

			//2015.07.03 重新分配客服完成后，清除之前的sessionid,赋值新sessionid或置空
			this.sessionid = data.sessionid || '';
			$.Log("get sessioId>>" + this.sessionid, 1);
			data.usericon = data.usericon == 'null' ? '' : data.usericon;

			//(6.8.2合版)机器人转人工逻辑修改，T2d不再有机器人转人工情况
			//2016.05.02 云问2.0 从机器人模式转人工发起的请求，如果得到的状态不是在线，不用更新客服信息
			/*if (this.robotKf && data.usertype === 0 && data.status != this.CON_ONLINE) {
				$.Log('robot to Artificial, but no body online', 2);
			} else {*/

			//2016.05.02 防止错误数据处理
			data.usericon = data.usericon == 'null' ? '' : data.usericon;
			this.setDest({
				id:		data.userid,
				name:	data.externalname || data.nickname || '',
				sign:	data.signature || '',
				logo:	$.protocolFilter(data.usericon || ''),
				status:	data.status || 0,
				phone:  data.mobile || data.phone || ''
			});
			//}

			//分配客服完成，预防之前超时连接返回内容
			this.callMethod[this.callBack] = emptyFunc;

			if( data.status === this.CON_OFFLINE ){
				//分配客服成功，客服离线，打开留言界面
				this.statusConnectT2D = 'COMPLETE';
				this._offline();
			}
			else if( data.status === this.CON_BUSY ){
				this.statusConnectT2D = 'QUEUE';
				//排队中人数
				this._queueNum = +data.num + 1;

				this._busy();
			}else{
				this.statusConnectT2D = 'COMPLETE';
				this._online();
			}

			//2016.05.02 云问机器人2.0
			//(6.8.2合版)不会通过此通道转接人工客服
			if($.server.robot == 2 && data.usertype == 1){
				this.setRobot2Param(true);
				/*}else if( data.status === this.CON_ONLINE ) {
					if (this.robotKf) {
						this.showMessage('system', {
							msg: $.lang.system_to_artificial,
							type: 9
						});
					}
						setRobot2Param(false);
				}*/
			}

			//星级评价接口
			if(this.config.enable_starLevel && !self.getStarLevel) {
				self.getStarLevel = true;
				//设置jsonp回调函数
				window['startLevel'] = function(result){
					try{
						$.evaluateStarLevel = 5;
						if(result >= 55 && result <= 59) {
							$.evaluateStarLevel = 4;
						}else if(result <55){
							$.evaluateStarLevel = 3;
						}
					}catch(e){
						$.Log('startLevel.callback:' + e.message, 3);
					}
				};

				//评价标签数接口
				startLevelData = {
					siteid: self.dest.id.substr(0, self.dest.id.indexOf('_ISME')),
					kfid: self.dest.id,
					callback: 'startLevel'
				};

				$.require($.server.settingserver + '/index.php/api/setting/returnCount?' + $.toURI(startLevelData) + '#rnd', function(){
					if(self.view.starLevel) {
						self.view.starLevel($.evaluateStarLevel);
					}
				});
			}

		},
		/**
		 * (6.8.2合版)提取修改机器人2.0参数公共方法
		 */
		setRobot2Param: function(robot){
			if (robot) {
				this.robotKf = true;
				this.view.switchToolbar(false);
				//分配到机器人后，默认t2dMode为2:继续和机器人会话
				this.t2dMode = 2;
			} else {
				this.robotKf = false;
				this.view.switchToolbar(true);
				//分配到人工后，默认t2dMode为null
				this.t2dMode = null;
			}
		},
		/**
		 * 分配客服异常
		 * @return {[type]}
		 */
		_abnormal: function(error){
			//分配客服失败、异常
			var failure =	$.utils.handleLinks($.lang.system_abnormal, {
				settingid:	this.settingid
			});
			this.callStat('13');

			this.connected = false;
			this._stopQueue();

			this.showMessage('system', {
				type:	9,
				msg:	failure
			});
			$.Log('Customer information request an exception.(' + error + ')', 3);
		},
		/**
		 * 分配客服请求失败
		 * @return {[type]}
		 */
		_failure: function(error){
			//分配客服失败、异常
			var failure =	$.utils.handleLinks($.lang.system_failure, {
				settingid:	this.settingid
			});

			//分配客服失败，不在显示此消息
			if( this.view.displayStatusInfo ){
				this.view.displayStatusInfo(false);
			}
			this.connected = false;
			this._stopQueue();

			this.showMessage('system', {
				type:	9,
				msg:	failure
			});
			$.Log('Customer information request fails.(' + error + ')', 3);
		},
		/**
		 * 客服不在线
		 * @return {[type]}
		 */
		_offline: function(){
			var offline = $.utils.handleLinks($.lang.system_offline, {
				destname:	this.dest.name,
				settingid:	this.settingid
			});

			//分配客服完成，不在显示此消息
			if( this.view.displayStatusInfo ){
				this.view.displayStatusInfo(false);
			}

			this.callStat('12');

			this.connected = false;
			this._stopQueue();

			//2015.05.02 云问2.0上一个客服是robot的情况，默认连机器人的情况
			/*if(this.robotKf){

				//客服离线，禁用文件、图片、发送按钮按钮
				this.view.disableButton(['image','file','submit'], true);

				var system_robot_offline = "";
				if (this.config.disable_message === 0) {
					system_robot_offline = $.lang.system_robot_offline1;
				} else {
					system_robot_offline = $.lang.system_robot_offline2;
				}
				this.showMessage('system', {
					msg: system_robot_offline,
					type: 9
				});
			}else{*/
			this.showMessage('system', {
				msg:	offline,
				type:	9
			});
			if( this.server.robot == 1 && this.server.roboturl && this.config.robot == 1 && (parseFloat(this.config.robot_mode) > 0 || this.options.manual == 1) ){
				//客服不在线，已开启机器人时，转机器人客服
				this.switchServerType(false, 'OFFLINE');
			}else{
				//--排队中，客服离线，转向留言--
				this.switchUI( this.CON_VIEW_MESSAGE, 'OFFLINE');
			}
			//}
		},
		/**
		 * 客服在线
		 * @return {[type]}
		 */
		_online: function(){
			var self = this;

			//分配客服完成，不在显示此消息
			if( this.view.displayStatusInfo ){
				this.view.displayStatusInfo(false);
				/*
				 * 2015.01.09 iPhone中safari浏览器cookie被禁用提示显示兼容iPhone4 - 6S
				 */
				if($.browser.safari && !navigator.cookieEnabled) {
					setTimeout(function(){
						self.view.displayStatusInfo(true, $.lang.system_cookie, {'font-size':'12px','line-height':'27px','padding': '0 45px'}, true);
					}, 1000);
				}

			}

			this.callStat('10');

			this._stopQueue();

			$.Log('connect user ' + this.dest.name + '...', 1);

			//create connect
			this.createConnect();
		},
		/**
		 * 客服忙碌，访客排除中
		 * @return {[type]}
		 */
		_busy: function(){
			var queue, queue2message, htmlQueueNumber, htmlQueueTime;

			this.connected = false;

			//分配客服完成，不在显示此消息
			if( this.view.displayStatusInfo ){
				this.view.displayStatusInfo(false);
			}

			if(this._startQueue){
				//更新排队人数据
				this.view.chatHistory.find('.chat-view-queue-num').html( this._queueNum.toString() );
				return;
			}
			if( this.server.robot == 1 && this.server.roboturl && this.config.robot == 1 && parseFloat(this.config.robot_mode) == 2 ){
				//客服忙碌，已开启机器人时，转机器人客服
				this.statusConnectT2D = 'COMPLETE';
				this.switchServerType(false, 'BUSY');
				return;
			}
			//开始排队
			if( this._startQueue !== true ){
				this._startQueue = true;
				this.callStat('11');

				var self = this;
				//开始排队，禁用文件、图片、发送按钮按钮
				this.view.disableButton(['image','file','submit'], true);

				this._queueTime = 0;
				this._queueTimeID = setInterval(function(){
					//2016.05.06 机器人转人工碰到排队的情况，更新自动断开定时器
					//(6.8.2合版)机器人转人工不走此逻辑
					/*if( self.robotKf ) {
						self.connect.connect.processSessionIdle();
					}*/
					//self.robotKf ? 0 :
					if( self._queueTime%3 === 0 ){
						self.getCustomerServiceInfo(self.options.destid, self.options.single, '');
					}
					self._queueTime++;

					//更新排队消息时间
					self.view.chatHistory.find('.chat-view-queue-time').html( $.secondsToMinutes(self._queueTime) );
				}, 1000);
			}

			//更新排队数据
			if( !this.view.chatHistory.find('.chat-view-queue-num').length ){
				//排队数
				htmlQueueNumber = '<font class="chat-view-queue-num" style="' + $.STYLE_BODY + 'color:red;font-weight:bold;">' + this._queueNum.toString() + '</font>';
				//排队等待时间
				htmlQueueTime = '';//'<span class="chat-view-queue-time" style="' + $.STYLE_BODY + '">'+$.secondsToMinutes(this._queueTime)+'</span>';

				//开启机器人模块时，排队时可以转机器人
				toRobotMessage = '';
				//临时不添加转机器人入口
				//this.server.robot==1 && this.server.roboturl && this.config.robot == 1 ? $.utils.handleLinks($.lang.system_to_robot) : '';
				//客服忙碌，无留言排队提示
				var queueMsg1, queueMsg2;
				if ($.browser.mobile) {
					queueMsg1 = $.lang.system_mobile_queue1 || $.lang.system_queue1;
					queueMsg2 = $.lang.system_mobile_queue2 || $.lang.system_queue2;
				} else {
					queueMsg1 = $.lang.system_queue1;
					queueMsg2 = $.lang.system_queue2;
				}

				//（6.8.2合版）转人工逻辑修改，此处无机器人2.0逻辑
				//2015.05.02 云问2.0 上一个客服是机器人的情况，使用机器人的排队提醒
				/*if (this.robotKf) {
					queueMsg1 = $.lang.system_robot_queue1;
					queueMsg2 = $.lang.system_robot_queue2;
				}*/

				queue1message =	$.utils.handleLinks(queueMsg2, {
					settingid:	this.settingid,
					count:		htmlQueueNumber,
					time:		htmlQueueTime
				});
				//客服忙碌，完整排队提示
				queue2message =	$.utils.handleLinks(queueMsg1, {
					settingid:	this.settingid,
					count:		htmlQueueNumber,
					time:		htmlQueueTime,
					br:			'',
					torobot:	toRobotMessage
				});

				//显示排队消息

				if( this.config.disable_message === 1 ){
					this.showMessage('system', {
						type: 0,
						msg:  queue1message
					});
				}else{
					this.showMessage('system', {
						type: 0,
						msg:  queue2message
					});
				}

				this.view.changeQueueStyle();
			}
		},
		/**
		 * 停止排队定时器
		 * @return {[type]}
		 */
		_stopQueue: function(){
			this._startQueue = false;
			clearInterval( this._queueTimeID );
			//文件、图片按钮可用
			this.view.disableButton(['image','file','submit'], false);
		},
		_ready: function(userid, pcid){
			$.Log(this.settingid + '::chatMode._ready()', 1);
			//5秒未返回，自动切换连接类型
			if( this.connect ){
				this.connect.stopSwitchConnect();
			}

			this.statusConnectTChat = 'READY';

			if( 'zh_cn' !== $.lang.language.toLowerCase() ){
				if( this.debug ){
					$.Log(this.settingid + ':chat.connect.setTextStyle');
				}
				if( this.connect ){
					this.connect.setTextStyle($.JSON.toJSONString({
						fontsize:20
					}));
				}
			}

			this.callStat('4');
		},
		/**
		 * 连接成功
		 * @param  {[type]} userinfo [description]
		 * @return {[type]}          [description]
		 */
		_connectSuccess: function(userinfo){
			//会话连接成功
			this.callTrack("10-01-02","connect success");

			var self = this, data, content, timeout = 0;

			if( userinfo ){
				if( typeof userinfo == "string" ){
					data = $.JSON.parseJSON(userinfo);
				}else{
					data = userinfo;
				}
				//更新访客信息
				this.setUser({
					id:			data.myuid || '',
					name:		data.myuname || '',
					sign:		data.signature || '',
					logo:		$.protocolFilter(data.mylogo || '')
				});
				this.sessionid = data.sessionid || '';

				if (this.sessionid) {
					this.callStat("0");
				}

				//时间差值
				this.jetLag	= $.getTime() - data.timesample;
				//由机器人转人工客服，分配客服完成后，合并会话
				if($.server.robot == 1) {
					this.mergeSession(this.dest.id, this.sessionid, function(){
						$.Log('merge session');
					});
				}
			}

			this._stopConnectTimeout();

			this.statusConnectTChat = 'COMPLETE';

			$.Log('connect ' + this.dest.name + ' complete', 1);

			if( typeof im_destUserInfo == "function" ) {
				im_destUserInfo({id:this.dest.id, name:this.dest.name});
			}else if($.browser.mobile){
				$.postMessage(window.parent, ['destInfo',this.dest.id,this.dest.name].join(","), "*");
			}

			if( $.browser.mobile && this.manageMode && $.isFunction(this.manageMode.view.updateViewStatus) ){
				this.manageMode.view.updateViewStatus(false);
			}

			//清除系统消息,如自动断线提示消息
			this.view.removeMessage("system");

			if( this.startCSSwitch == 'SHOW' && !this.requestRobot){
				//换客服后，清除原用户列表
				this.userList = [];
				//2015.07.03 切换客服完成后显示提示消息
				this.startCSSwitch = '';
				this.showMessage('system', {
					type:	9,
					msg:	$.utils.handleLinks($.lang.system_switch_session,{destname: this.dest.name})
				});
			}

			//发送缓存消息
			$.waitMessage.each(function(k, body){
				self.waitTimeID[self.waitTimeID.length] = setTimeout(function(){
					//$.Log(self.settingid + '::send waitMessage');
					self.send( body );
				}, timeout);
				//flash连接时，连续两条消息时间必须大于500毫秒
				timeout += 600;
			});

			//2015.02.10连接完成时，展示商品信息
			this._sendGoodsinfo();

			//连接完成后，发送缓存消息
			this.hashCache.each(function(k, body){
				self.cacheTimeID[self.cacheTimeID.length] = setTimeout(function(){
					//$.Log(self.settingid + '::send hashCache', 2);
					self.send( body );
				}, timeout);

				timeout += 600;
			});

			this.hashCache.clear();

			this.view.disableButton('history', false);

			//由机器人转工人客服后连接成功后，开启继承连接状态时，本页面再次打开的会话都直接连接机器人
			if( !this.requestRobot && this.config.robot_inherits_state == 1 ){
				$.default_connect_robot =  false;
			}
		},
		/**
		 * 客服离线、断线
		 * @return {[type]} [description]
		 */
		_connectException: function(){
			$.Log(this.settingid + ':chatMode._connectException()');

			this.connected = false;
			this.statusConnectTChat = 'FAILURE';

			this.showMessage('system', {
				type:	9,
				msg:	$.utils.handleLinks($.lang.system_connect_wait, {settingid: this.settingid})
			});
		},
		/**
		 * 返回连接状态
		 * @param  {[type]} status   [description]
		 * @param  {[type]} userinfo [description]
		 * @param  {[type]} message  [description]
		 * @return {[type]}          [description]
		 */
		_connectResult: function( status, userinfo, message ){
			message = $.hexToDec(message);

			$.Log(this.settingid + ':chatMode.connectResult(' + $.JSON.toJSONString(arguments) + ')');
			//会话结束
			if( this.connected && status === this.CON_CLOSE_CONNECT ){
				this.statusConnectTChat = 'CLOSECHAT';
				return;
			}
			if( this.connected && status === this.CON_DISCONNECT ){
				//--超时未发送消息时，WEB端自动断开连接--
				//--客户端关闭聊窗时，WEB端自动断开连接--
				this.disconnect();
			}
			if( !this.connected && status === this.CON_LOGIN_SUCCESS ){
				this.connected = true;
			}

			switch(status){
				case this.CON_LOGIN_SUCCESS:
					this.view.disableButton('capture', false);
					this._connectSuccess(userinfo);
					break;
				case this.CON_LOGIN_FAILURE:
				case this.CON_CONNECT_FAILURE:
					this.view.disableButton('capture', true);
					this._connectException();
					break;
			}
		},
		/**
		 * 上行服务器地址接口更新,下行接口地址为 /flashgo 上行修改为 /httpgo
		 * @date 2014.09.03
		 * @param
		 */
		mdyServerAddr: function(url){
			return url.replace(/\/flashgo/i, '/httpgo');
		},
		/**
		 * 获取断开连接时的地址与相关参数
		 * @param {[type]} tChatFlashGoUrl [description]
		 */
		setFlashGoServer: function(tChatFlashGoUrl){
			var match, pattern = /cid=(\-?\d+)/gi;

			$.Log(this.settingid + ':chatMode.setFlashGoServer("' + tChatFlashGoUrl + '")');
			if( tChatFlashGoUrl ){
				tChatFlashGoUrl = this.mdyServerAddr( tChatFlashGoUrl );
			}else{
				return;
			}

			match = pattern.exec(tChatFlashGoUrl);

			this.chatFlashGoUrl = $.protocolFilter(tChatFlashGoUrl);

			this.chatgourl = $.protocolFilter( tChatFlashGoUrl.substr(0, tChatFlashGoUrl.indexOf("?")) );
			//连接ID
			this.clientid  = match && match.length==2 ? match[1] : '';
		},
		/**
		 * 会话场景信息,用于返回评价状态、发起页
		 * @return {[type]}
		 */
		notifySessionSence: function(data){
			$.Log('chatMode.notifySessionSence(' + data + ')', 1);
			try{
				data = $.JSON.parseJSON(data);
			}catch(e){
			}
			//服务端通过场景信息通知是否可评价
			if( data.evaluable === 1 ){
				this._Evaluable = true;
			}else{
				this._Evaluable = false;
			}

			//服务端通知是否强制评价
			if( data.enableevaluation === 1){
				this._Enableevaluation = true;
			}else{
				this._Enableevaluation = false;
			}

			//服务端通知
			//（6.8.2合版）统一使用公共机器人设置参数方法设置参数
			if( $.server.robot == 2 ){
				if( data.scenemode === 0 ) {
					this.setRobot2Param(false);
				}else if ( data.scenemode === 1 ) {
					this.setRobot2Param(true);
				}
			}

			if ($.browser.mobile) {
				this.view.displayEvClose(this._Enableevaluation ? 1 : 0);
			}

			this.view.disableButton('evaluate', !this._Evaluable);

			//返回评价提交状态
			//-1:失败；0:常规;1:成功
			if( data.score == -1 ){
				this._submitRating = false;
				//显示评价提交失败的提示
				this.showMessage('info', {
					type:	9,
					msg:	$.lang.system_evaluation_failure
				});
			}else if( data.score > 0 ){
				this._submitRating = true;
			}
		},
		/**
		 * 接收房间中客服列表
		 * @param {[type]} currentSubscribers [description]
		 */
		notifyUserList: function(userList){
			$.Log(this.settingid + ':chatMode.notifyUserList(' + userList + ')');

			try{
				userList = $.JSON.parseJSON(userList);
			}catch(e){
				userList = [];
			}
			var retList = [];
			for(var i = 0; i < userList.length; i++){
				//非客服ID，移队userList
				if( $.base.checkID(userList[i].userid) !== $.CON_CUSTOMER_ID ){
					continue;
				}
				else{
					retList.push(userList[i]);
					//添加客服信息到客服列表中
					this.addDestList({
						id: userList[i].userid || "",
						name: userList[i].externalname || userList[i].nickname || userList[i].username || "",
						logo: userList[i].usericon || ""
					});
				}
			}

			this.userList	= retList;
			this.userNumber	= this.userList.length;

			$.Log(this.settingid + ':chatMode.notifyUserList:' + userList.length);
			if( this.userNumber > 1 ){
				this.callStat('21');
			}
		},
		/**
		 * 客服加入会话
		 * @param  json data
		 * @return {[type]}
		 */
		userEnter: function(strData){
			var data, message = $.lang.system_add_session, newCustomer = true;

			try{
				data = $.JSON.parseJSON(strData);
			}catch(e){
				data = null;
			}
			if( $.base.checkID(data.userid) != $.CON_CUSTOMER_ID || this.userList.length === 0 ){
				//2015.05.08 非客服ID时忽略
				//2015.07.03 userList还没收到时，忽略userEnter事件
				return;
			}
			//$.Log('userList:' + this.userList.length, 2);
			//新客服加入会话
			for(var i = 0; i < this.userList.length; i++){
				if( this.userList[i].userid == data.userid ){
					newCustomer = false;
				}
			}
			if( newCustomer ){
				this.userList.push(data);
				this.userNumber = this.userList.length;
			}
			//客服有变动，重新记录更换客服消息数量
			if(this.userList.length > 1){
				this._clearChangeCsrNum();
			}
			$.Log(this.settingid + ':[' + this.userList.length + ']chatMode.userEnter(' + strData + ')');

			//添加客服信息到客服列表中
			this.addDestList({
				id: data.userid || data.id,
				name: data.externalname || data.nickname || data.username || data.name,
				logo: data.logo || ""
			});

			if( message && this.userNumber > 1 ){
				this.enterUserId = data.userid;
				this.showMessage('system', {
					type:	9,
					msg:	$.utils.handleLinks(message, {destname: data ? data.externalname || data.nickname || '' : this.dest.name}),
					enter:	1
				});
			}
		},
		/**
		 * 客服离开会话
		 * @param  json data
		 * @return {[type]}
		 */
		userLeave: function(destid){
			this.enterData = null;
			$.Log(this.settingid + ':chatMode.userLeave(' + destid + ')');

			var destLeave = $.extend({},this.hashDest.items(destid));

			if( destLeave && !$.isEmptyObject(destLeave) ){

				if( this.userList.length < 2 ){
					return;
				}else{
					//有客服离开时，需要更新当前客服信息
					var data = [];
					for(var i = 0; i < this.userList.length; i++){
						if( this.userList[i].userid != destid){
							data.push( this.userList[i] );
						}
					}
					this.userList = data;
					this.userNumber = this.userList.length;
					data = this.userList[0];

					if( !data ) return;

					this.setDest({
						id:			data.userid || '',
						name:		data.externalname || data.nickname || '',
						sign:		data.signature || '',
						logo:		$.protocolFilter(data.usericon || data.logo || ''),
						status:		data.status
					});
					//多人会话时，客服离开会话，显示提示
					if(destLeave.name && destLeave.id && destLeave.id.indexOf('robot') == -1){
						this.showMessage('system', {
							type:	9,
							msg:	$.utils.handleLinks($.lang.system_go_away_session, {destname: destLeave.name}),
							enter:	1
						});
					}
				}
			}else{
				$.Log('chatMode.userLeave(): dest info is null', 2);
			}
		},
		/**
		 * 客服信息变更
		 * @param  {[type]} data
		 * @return {[type]}
		 */
		_userInfo: function(strData){
			var data;

			if( typeof strData == 'object' ){
				data = strData;
			}else try{
				data = $.JSON.parseJSON( strData );
			}catch(e){
				return;
			}

			if( data.status === this.CON_OFFLINE || data.status === this.CON_AWAY ){
				//客服离线\离开时断开连接（如访客被加入黑名单）
				this.statusConnectTChat = 'CLOSECHAT';
				this.disconnect();
				return;
			}

			if( this.dest.id != data.userid && data.status != 1 ){
				$.Log('>userid:' + this.dest.id  + '!=' + data.userid + ' ,>' + (this.dest.id != data.userid) + ', ' + data.status + '!=1>' + (data.status !=1), 1);
				$.Log('Switch to is not online customer service does not update the customer information ', 2);
				return;
			}
			//在线新客服进入房间时、客服信息变更时
			//fix update destinfo phone not show bug
			this.setDest({
				id:		data.userid || this.dest.id,
				name:		data.externalname || data.nickname || this.dest.name,
				sign:		data.signature || this.dest.sign,
				logo:		$.protocolFilter(data.usericon || data.logo || this.dest.logo),
				phone:  data.mobile || data.phone || '',
				status:		data.status
			});
		},
		/**
		 * 添加客服信息到客服列表
		 * @method addDestList
		 * @param  {Object} data 客服信息
		 * @return {Object}      新添加客服信息
		 * （6.8.2合版）优化addDestList对客服信息的兼容处理
		 */
		addDestList: function(data){
			var dest, userid,userName,userLogo;
			if( !data || $.isEmptyObject(data) || (!data.id && !data.userid) ){
				return;
			}

			userid = data.userid || data.id;
			userName=data.externalname || data.nickname || data.username || data.name;
			userLogo=data.usericon ||data.logo || "";
			$.Log('add or update dest info:' + $.JSON.toJSONString(data), 2);
			if( !this.hashDest.contains(userid) ){
				dest = {
					id: userid,
					name:userName,
					//status: data.status,
					logo: userLogo
				};
				this.hashDest.add(dest.id, dest);
			}else{
				//更新客服信息与状态
				dest = $.extend({}, this.hashDest.items(data.id), {
					id: userid,
					name: userName,
					//status: data.status,
					logo: userLogo
				});
				this.hashDest.items(dest.id, dest);
			}
			return dest;
		},
		/**
		 * 获取消息ID
		 * @method getMsgId
		 * @param  {number} timesample 时间戳
		 * @return {string}            消息ID
		 */
		getMsgId: function(timesample){
			timesample = timesample || $.getTime();

			while( this.hash.contains(timesample + 'J') ){
				timesample++;
			}
			return parseFloat(timesample) + 'J';
		},
		/**
		 * @method mergeSession 更新会话ID,合并人工会话与机器人会话记录
		 * @param {string} updateDestID
		 * @param {string} updateSessionID
		 * @param {function} callback
		 */
		mergeSession: function(updateDestID, updateSessionID, callback){
			if( !this.robotSessionID ) return;
			var self = this,
				pdata = {
					siteid:			this.siteid,
					robotsessionid:	this.robotSessionID,
					sessionid:		updateSessionID || this.sessionid,
					destid:			updateDestID,
					myuid:			$.user.id
				}
			;

			new $.POST(this.server.mcenter + '/message.php?m=Message&a=updateRobotMsg', pdata, function(event){
				$.Log('send hidtory message complete');
				setTimeout(function(){
					callback.call(self);
				}, 50);
			});
		},
		_clearChangeCsrNum: function(){
			this._changeCsrNum = 0;
			this.view.disableButton('csr', true);
		},
		/**
		 * 过滤空字符
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_filterNullChar: function(data){
			var self = this;
			$.each(data, function(i, value) {
				if( $.isObject(value) || $.isArray(value)){
					data[i] = self._filterNullChar(value);
				}else if( typeof value == "number" ){
					data[i] = value;
				}else{
					data[i] = value.replace(CON_NULL, '');
				}
			});
			return data;
		},
		/**
		 * 格式化提交评价消息
		 * @param  {[type]} data [description]
		 * @return json		评价数据
		 */
		_formatEvaluationData: function(data){
			var self = this,
				evalContent = '',
				timerkeyid = $.getTime(),
				submitData = {
					type: 5,
					timerkeyid:	timerkeyid,
					msgid:		this.getMsgId( timerkeyid )
				};

			data = this._filterNullChar(data);

			if(this.config.evaluateVersion == 2){
				submitData.msg = $.extend({msgtype: 3}, {newevaluate:data});
			}else{
				submitData.msg = $.extend({msgtype: 3}, {evaluate:data});
			}

			if(this.config.evaluateVersion == 2){
				for(var k in data){
					if( !data[k] || !data[k].answer){
						continue;
					}

					var answer = data[k].answer;

					for(var m in answer) {
						if( !answer[m] || !answer[m].lab) {
							continue;
						}
						evalContent += answer[m].lab + '; ';
					}
				}
			}else{
				for(var k in data){
					if( !data[k] || !data[k].value || $.isFunction(data[k]) || !data.hasOwnProperty(k) ){
						continue;
					}
					if( typeof data[k].value === "string" ){
						evalContent += data[k].value + '; ';
					}else{
						evalContent += data[k].value.text + '; ';
					}
				}
			}

			$.Log('submitData::' + $.JSON.toJSONString(submitData));
			//评价消息独立发送
			return {
				data: this._toEvaluateXML( submitData ),
				info: $.enCut(evalContent, 50)
			};
		},
		/**
		 * json格式评价消息转xml评价消息
		 * @param  {[type]} json [description]
		 * @return {[type]}      [description]
		 */
		_toEvaluateXML: function(json){
			var attributes, body;

			//-过滤特殊字符
			json = $.charFilter(json);

			//get type, msgid
			attributes = $.whereGet(json, ["type", "msgid"]);
			for(var k in attributes)
				if( attributes[k]===undefined ) delete attributes[k+""];

			body = {
				flashuid:	json.timerkeyid,
				msg:{
					msg: $.extend(json.msg, {attributes: attributes})
				}
			};

			if( body.msg.msg.newevaluate ){
				//--新版评价内容转jsonString
				body.msg.msg.newevaluate = $.JSON.toJSONString(body.msg.msg.newevaluate);
			}

			if( body.msg.msg.evaluate ){
				//--新版评价内容转jsonString
				body.msg.msg.evaluate = $.JSON.toJSONString(body.msg.msg.evaluate);
			}
			body.msg = $.jsonToxml(body.msg);

			return body;
		}
	};


	/** ====================================================================================================================================================
	 * 聊窗管理器(壳)
	 * @class chatManage
	 * @constructor
	 */
	$.chatManage = {
		name: 'chatManage',
		view: null,
		options: null,
		hash: new $.HASH(),
		hashWait:	new $.HASH(),
		hashConfig: new $.HASH(),
		hashStatus: new $.HASH(),
		objMinView: null,
		cacheLeft: null,
		cacheTop:  null,
        htmlSID: "",
        connectId: "",
		open: function(settingid, destid, itemid, itemparam, sellerid, noWaitConnect, single, manual, edu_invisitid, edu_visitid){
			$.Log('$.chatManage.open(' + $.JSON.toJSONString(arguments) + ')');
			var self = this, preTime;

			if ($.xpush) {
				$.xpush.clearSettingUnReadMsgCount(settingid);
			}

			//this.htmlSID = this.htmlSID || $.getTime(2);
			this.htmlSID = $.getTime(2); //(6.8.2修改回，每次htmlSID重新生成)
			// 2017.04.14 如果没有传值的将用户名设置为settingId。
			this.settingid = settingid ||　destid;
			this.destid    = destid || '';
			this.itemid    = itemid;
			this.itemparam= itemparam;
			this.sellerid = sellerid;
			this.single    = single || (this.destid ? 1 : 0);
			this.manual    = manual || '0';
			this.edu_visitid   = edu_visitid || '';
			this.edu_invisitid = edu_invisitid || '';
			//2015.09.29 进入聊窗时，清空一下历史记录
			this.clearHistoryPageCount();
			if( this.view && this.objMinView ){
				this.objMinView.remove();
			}

			//MQTTclientID
			this.createClientID();

			if( !this.hash.contains( this.settingid ) ){
				//配置文件加载缓慢时，用户连续点击，会出现打开同一settingid打开多个聊窗的问题
				if( this.hashWait.contains( this.settingid ) ){
					$.Log('wait open chat', 2);
					return;
				}else{
					this.hashWait.add(this.settingid, 'wait');
				}
				$.base.showLoading();

				this.loadConfig(settingid ? settingid : $.global.settingid, function(config){
					//（6.8.2合版）wap通过loadWapView加载视图文件
					if($.browser.mobile){
						self.loadWapView(config, function () {
							self.initChatManage(noWaitConnect, config);
						});
					}else{
						self.initChatManage(noWaitConnect, config);
					}
				}, this.settingid);
			}else if( this.hash.items( this.settingid ) ){
				$.Log('$.chatManage.switchChat(' + this.settingid + ')', 1);
				this.chat = this.hash.items( this.settingid );
				if( !(this.get(this.settingid).connect && this.get(this.settingid).connect.connect) ){
					this.get(this.settingid).reconnect('', this.destid, this.single, this.edu_invisitid, this.edu_visitid);
				}
				//教育版
				if( !this.chat.selected && !( $.isEdu &&  $.browser.mobile) ){
					this.switchChat( this.settingid );
				}
			}

			return true;
		},
		/**
		 * @method loadWapView 跟据配置文件加载WAP页主题文件
		 * @param config ｛Object｝ 配置文件JSON
		 * @param callback ｛function} 回调函数
		 * （6.8.2合版）wap通过loadWapView加载视图文件
		 */
		loadWapView: function (config, callback) {
			var WapViewFileName = 'chat.view.wap.js';

			//2017.05.04 教育版不加载其他布局视图
			if($.flashserver.layout && ($.flashserver.layout == '2' || $.flashserver.layout == '3') && !$.isEdu){
				WapViewFileName ='chat.view.wap.theme'+$.flashserver.layout+'.js' + $.baseExt;
			}
			$.require({
				view: WapViewFileName + $.baseExt
			}, function () {
				callback.call();
			});
		},
		/**
		 * 创建MQTT连接ID
		 * createClientID
		 * @return {String} MQTT连接ID
		 */
		createClientID: function(){
			var _UUID = $.randomChar(20);

			this.connectId = this.connectId!=="" ? this.connectId : 'JS_' + _UUID.toLowerCase();
			return this.connectId;
		},
		/**
		 * 初始化聊窗管理器视图
		 * @param  {[type]} noWaitConnect [description]
		 * @param  {[type]} config        [description]
		 * @return {[type]}               [description]
		 * （6.8.2合版）wap中chatManageView在ntView中调用
		 */
		initChatManage: function(noWaitConnect, config){
			var self = this, preTime, options = {};
			var chatManageView;

			if( !this.view ){
				if( $.global.siteid == "kf_9740" ){
				    options.position = {"position":"center-center"};
				}else{
				    options.position = config ? config.position : {};
				}
				//聊窗是否可拖动大小
				if( config && typeof config.resize_chat !== undefined && typeof config.drag_chat !== undefined ){
					options.resize = !$.global.pageinchat||!config||config.resize_chat===0 ? false : true;
					options.drag   = !$.global.pageinchat||!config||config.drag_chat===0 ? false : true;
				}else{
					options.resize = false;
					options.drag   = true;
				}
				chatManageView = $.ntView? $.ntView.chatManageView : $.chatManageView;
				if( $.ntView && $.browser.mobile){
					this.view = new chatManageView(options, this,config.wapTheme);
				}else{
					this.view = new chatManageView(options, this);
				}

				$(window).bind('beforeunload', function(event){
					self.beforeunload(event);
				});
			}

			if( !$.global.pageinchat ){
				$.Capture.captureWithMin = false;
			}

			//创建聊窗标签
			this.view.addChatTag(this.settingid/*@key*/);

			//最小化其它会话窗口
			if ( !$.browser.mobile ){
				this.hash.each(function(i, chat){
					if( chat ){
						chat.minimize();
					}
				});
			}


			if( (config && config.autoconnect == 1 ) || $.server.reversechat == '1' ){
				$.Log('autoconnect:1');
				//已配置直接连接
				noWaitConnect = true;
			}else if( config && config.autoconnect == -1 ){
				noWaitConnect = false;
			}else{
				//已打开过的聊窗（按settingid区分），半小时内再次打开，直接连接，不需要激活
				preTime = $.store.get($.base.CON_LOCAL_FIX + this.settingid);
				if( preTime ){
					var diff = $.getTime() - preTime;
					if( diff < 1800*1000 ) noWaitConnect = true;
				}
			}

			//2015.11.23 协议替换
			try{
				config = $.protocolFilter(config);
			}catch(e){
				$.Log('error config file: ' +e);
			}

			//创建新聊窗
			this.chat = this.createChatMode(noWaitConnect, config);
			//关闭聊窗后但是内存没有释放，导致有些dom被删除了。
			if( $.browser.mobile && $('.chat-view-window-header').length == 0){
				this.view._create();
			}
			//保存新聊窗对像的引用
			this.hash.add(this.settingid, this.chat);

			//如果微信发送留言请求，直接进留言
			if( $.global.message === "1" ){
				this.chat.switchUI('message');
				return;
			}

			//robot:当前聊窗无连接，需要连接机器人或不需要等待直接连接服务器时，直接连接
			if( (noWaitConnect || this.chat.requestRobot ) && !this.chat.connected ){
				this.chat.start();
			}

			//记录最后打开时间,用于下次打开时自动连接
			$.store.set($.base.CON_LOCAL_FIX + this.settingid, $.getTime());
		},
		/**
		 * 存贮会话携带信息，页外关闭聊窗触发评价
		 * @param  {HtmlEvent} event
		 * @return {null|String}
		 */
		beforeunload: function(event){
			if( this.hash.count() === 0 ){
				return;
			}
			//开启会话携带,已连接tchat并发送过消息时携带会话
			if( this.chat.connected && this.chat._sendNum > 0 && this.chat.config.sessioncarry !== 0 ){
				$.cache.set('carry_sid', this.chat.settingid);
				$.cache.set('carry_did', this.chat.dest.id);
			}else{
				$.cache.set('carry_sid', '');
				$.cache.set('carry_did', '');
			}

			if( !$.global.pageinchat && !$.browser.mobile){
				//页外预留代码
				if( this.chat && this.chat.config && this.chat.config.enableevaluation==1 && this.chat._Evaluable && !this.chat._submitRating ){
					//--需要弹出评价时，弹系统提示框
					this.close();

					if( $.browser.chrome )
						return $.lang.system_before_evaluation;
					else
						$.Event.fixEvent(event).returnValue = $.lang.system_before_evaluation;
				}else{
					//--不弹系统提示框时，不添加这句会出现调用(flashgourl)失败
					setTimeout(function(){}, 500);
				}
			}
		},
		/**
		 * 加载配置文件
		 * @param  {String}   settingid	配置ID
		 * @param  {Function} callback  回调函数
		 * @param  {String}   教育版打开聊窗时没有接待组所以需要一个客服id
		 * @return null
		 */
		loadConfig: function(settingid, callback, destid){
			var self = this, chat,
				config = this.hashConfig.items(settingid);
				//2017.04 加载配置文件修改为如果配置了configserver地址将在configserver中读取配置文件。
				url = [
					//debug temp
					//'http://192.168.30.50/',
					($.server.configserver ? $.server.configserver : $.server.flashserver),'config/6/',
					settingid.split("_").slice(0, 2).join('_'), '_',
					settingid, '.js#rnd'
				].join('')
			;
			$.Log('$.chatManage.loadConfig(' + settingid + '):' + url);

			//2014.12.17 小能6.0入口已加载配置文件到 nTalk.base.config下，如果已加载当前配置文件，不再重复加载
			if( !config && !$.isEmptyObject($.base.config) && $.base.config.settingid == settingid ){
				config = config || $.base.config;
			}
			if( config && config.service && config.service.tchatgoserver ){

				$.base.hiddenLoading();

				//临时窗口移除hashTable
				if( destid && destid.indexOf("ISME9754") > -1 ){
					self.hashWait.remove(destid);
				}else{
					self.hashWait.remove(settingid);
				}


				if( (chat = self.verificationDestId( config )) ){
					$.Log('Only one customer to open a chat window', 2);
					chat.showMessage('system0', {
						type:	9,
						msg:	$.utils.handleLinks($.lang.system_merge_session, {destname: chat.dest.name})
					});
				}else{
					callback.call(this, config);
				}
			}else{
				$.require(url, function(script){

					$.base.hiddenLoading();

					//临时窗口移除hashTable
					if( destid && destid.indexOf("ISME9754") > -1 ){
						self.hashWait.remove(destid);
					}else{
						self.hashWait.remove(settingid);
					}

					if( script.error || (!nTalk.CONFIG && !NTKF.CONFIG) ){
						if( self.view ){
							self.view.toggleExpansion("rightElement", false);
						}
						//加载配置文件失败
						callback.call(self, null);
					}else{
						config = nTalk.CONFIG || NTKF.CONFIG;
						self.hashConfig.add(settingid, config);
						if( (chat = self.verificationDestId(config)) ){
							$.Log('Only one customer to open a chat window', 2);
							chat.showMessage('system0', {
								type:	9,
								msg:	$.utils.handleLinks($.lang.system_merge_session, {destname: chat.dest.name})
							});
						}else{
							callback.call(self, config);
						}
					}
					setTimeout(function(){
						delete NTKF.CONFIG;
						delete nTalk.CONFIG;
					}, 1000);

					$(script.error ? script.target : script).remove();
				});
			}
		},
		/**
		 * 验证新打开的聊窗中可分配客服中是否已存在打开的聊窗
		 * @param  {json}  config json配置
		 * @return {[type]}        [description]
		 */
		verificationDestId: function(config){
			var idList, result = false, tmp;
			if( !config ){
				return false;
			}else{
				tmp = config.icon || config.list || config.toolbar || config.featureset || null;
				if( !tmp||!tmp.members.groupID||!tmp.members.idList.length ){
					$.Log('No valid entry configuration', 3);
					return false;
				}
				idList = tmp.members ? tmp.members.idList : [];
				if( !$.isArray(idList) ){
					return false;
				}
				this.hash.each(function(key, chat){
					//验证时要排除当前聊窗(重连时，当前聊窗已获得客服ID)
					if( $.inArray( chat.dest.id, idList ) > -1 && chat.settingid != config.settingid ){
						$.Log('opened destid:' + chat.dest.id + ', idList:' + $.JSON.toJSONString(idList), 2);
						result = chat;
					}else{
						$.Log('opened destid:' + chat.dest.id + ', idList:' + $.JSON.toJSONString(idList), 1);
					}
				});
				return result;
			}
		},
		/**
		 * 创建聊天窗口
		 * @param  {boolean} noWaitConnect 是否打开聊天窗口直接请求客服
		 * @param  {json}    config        json配置
		 * @return {Object}                返回聊窗chatMode实例化对像
		 */
		createChatMode: function(noWaitConnect, config){
			var self = this;

			$.Log('nTalk.chatManage.createChatMode():noWaitConnect:' + noWaitConnect, 1);
			//创建一个新会话窗口
			return new $.chatMode({
				config:		config,
				siteid:		$.global.siteid,
				settingid:	this.settingid,
				destid:		this.destid,
				itemid:		this.itemid,
				itemparam:	this.itemparam,
				sellerid:	this.sellerid,
				single:		this.single,
				manual:		this.manual,
				htmlsid:	this.htmlSID,
				connectid:  this.connectId,
				edu_invisitid:  this.edu_invisitid,
				edu_visitid:    this.edu_visitid,
                                usertag:	$.global.usertag,
				userrank:	$.global.userrank
			}, this);
		},
		/**
		 * 获取聊窗实例化对像
		 * @param  {String} key       配置ID
		 * @param  {String} destid    客服ID
		 * @return {Object|null}
		 */
		get: function(key, destid){
			if( !this.hash.count() ){
				return null;
			}
			if( !key ){
				return this.chat || this.hash.first();
			}
			if( this.hash.contains(key) ){
				return this.hash.items( key );
			}
			//2015.07.14 IM推送的消息中客服ID与已打开聊窗的最后客服是同一客服时
			if( destid && $.base.checkID(destid) == $.CON_CUSTOMER_ID ){
				for(var k in this.hash.hashTable){
					var chat = this.hash.items(k);
					if( k && this.hash.hashTable.hasOwnProperty(k) && chat.dest.id == destid ){
						key = chat.settingid;
					}
				}
			}
			if( this.hash.contains(key) ){
				return this.hash.items( key );
			}
			return null;
		},
		/**
		 * 关闭所有聊窗
		 * @return {null}
		 */
		close: function(){
			$.Log('nTalk.chatManage.close()');
			var settingidstr = 	this.settingid;
			var self = this,
				closeChatManage = function(){
					if(!$.global.callStatCount || ($.global.callStatCount && $.global.callStatCount.success == 0 && $.global.callStatCount.failure == 1) ){
						$.chatManage.get().callStat('5');
					}

					self.hash.each(function(i, chat){
						chat.close();
					});
					self.hash.clear();

					if( $.global.pageinchat ){
						self.view.close();

						self.view = null;
					}else if( $.browser.mobile ){
						if( $.global.backURL ){
							window.open($.global.backURL);
						}else{
							history.go(-1);
						}

					}else{
						//#09.23 处理关闭失败问题
						window.opener = null;
						if( !$.browser.chrome ) window.open('','_self');
						if( !window.close() ){
							//关闭失败
							window.location.href = 'about:blank';
						}
					}
				}
			;

			//$.Log('chat' + (!!this.chat) + ', submitRating:' + (this.chat ? this.chat._submitRating : '') + ',_Evaluable:' + this.chat._Evaluable + ',currentView:' + this.chat._currentView);
			//当前聊窗需要评价时
			if( this.chat && this.chat.config && !this.chat._submitRating && this.chat._currentView == this.chat.CON_VIEW_WINDOW && this.chat.config.enableevaluation==1 && this.chat._Enableevaluation){
				if( this.chat.showEvaluation(0, function(){
					//评价完成后，关闭聊窗
					closeChatManage();
					/**
					* 2017.04
					* 会话结束，评价完成后关闭的窗口。
					*/
					$.base.fire("CloseChatWindow",[{
						type: 		2,
						settingid: 	settingidstr || ''
					}]);
				}) === false){
					//已评价,取消评价，直接关闭聊窗
					try{
						closeChatManage();
						//
						$.base.fire("CloseChatWindow",[{
							type: 		1,
							settingid: 	settingidstr || ''
						}]);
					}catch(e){
						$.Log(e, 3);
					}
				}
			}else{
				//未开启强制评价
				try{
					closeChatManage();
					$.base.fire("CloseChatWindow",[{
						type: 		1,
						settingid: 	settingidstr || ''
					}]);
				}catch(e){
					$.Log(e, 3);
				}
			}
		},
		/**
		 * 切换聊天窗口
		 * @param  {String} settingid 配置ID
		 * @return {null}
		 */
		switchChat: function(settingid){
			$.Log('chatManage.switchChat('+settingid+')');

			this.view.switchChatTag( settingid );

			this.callSwitchChat(settingid);
		},
		/**
		 * 关闭单个聊天窗口
		 * @param  {[type]} settingid
		 * @return {[type]}
		 */
		closeChat: function(settingid){
			var nextkey = this.hash.next( settingid );
			$.Log('chatManage.closeChat()');

			this.view.removeChatTag(settingid);

			this.switchChat( nextkey );

			this.hash.items(settingid) && this.hash.items(settingid).close();

			this.hash.remove(settingid);
		},
		/**
		 * 外部调用验证合并聊窗,用于打开多个未连接聊窗，连接时验证
		 * @param  {[type]} settingid [description]
		 * @param  {[type]} config    [description]
		 * @return {[type]}           [description]
		 */
		callVerification: function(settingid, config){
			var chat;

			$.Log('chatManage._callStart(' + settingid + ', [config Object])');

			if( (chat = this.verificationDestId(config)) ){
				this.closeChat(settingid);
				return chat;
			}else{
				return false;
			}
		},
		/**
		 * 聊天窗口管理器大小变更
		 * @param {Number} width
		 * @param {Number} height
		 * @return {void}
		 */
		callManageResize: function(width, height){
			this.hash.each(function(i, chat){
				chat.view.callChatResize(width, height);
			});
		},
		/**
		 * 聊天窗口管理器最小化
		 * （6.8.2合版）最小化聊窗miniView在wap模式下在ntView里调用
		 * @return {void}
		 */
		callMinimize: function(){
			$.Log('$.chatManage.callMinimize()');

			var self = this, minView;

			minView = $.ntView? $.ntView.minimizeView : $.minimizeView;

			this.objMinView = new minView(this.chat.dest, this.chat._currentView == this.chat.CON_VIEW_MESSAGE, function(){
				if( $.isFunction(self.view.maximize) ){
					self.view.maximize();
				}
				self.objMinView = null;
			});
		},
		/**
		 * 通过视图切换聊窗
		 * @param  {String} settingid
		 * @return {void}
		 */
		callSwitchChat: function(settingid){
			var self = this;
			$.Log('chatManage.callSwitchChat(' + settingid + ')');

			this.hash.each(function(i, chat){
				if( chat.settingid === settingid ){
					chat.maximize();

					if( chat.displayMoreData() ){
						//页外时,无右侧配置数据时,不显示右侧区域
						self.view.toggleExpansion("rightElement", false);
					}
					//切换聊窗时，更新更多区内容
					self.view.updateRightData(chat.settingid, chat._moreData);
					self.chat = chat;
				}else{
					chat.minimize();
				}
			});
		},
		/**
		 * 展开或收缩侧边栏
		 * @param  {String} settingid
		 * @return {Boolean}
		 */
		callToggleExpansion: function(settingid){
			var result = this.view.toggleExpansion("rightElement");

			this.hash.each(function(settingid, chat){
				chat.view.updateMore(result);
			});
			return result;
		},
		/**
		 * 展开或收缩标签栏
		 * @return {Boolean}
		 */
		callToggleExpansionTab: function(){
			return this.view.toggleExpansion("leftElement");
		},
		/**
		 * 更新聊窗侧边栏数据
		 * @param  {[type]} config
		 * @return {[type]}
		 */
		callConfigLoaded: function(settingid, config, data, startColor, endColor){
			//2015.10.12 右侧标签颜色可能继承聊窗设置
			this.view.updataSkin(config.chatBackground, config.startColor, config.endColor);

			if( data && data.length ){
				//切换聊窗时，更新更多区内容
				this.view.updateRightData(settingid, data);
			}
		},
		/**
		 * 展示消息至聊窗,用于查看常见问题
		 * @param  {[type]} config
		 * @param  {[type]} title
		 * @param  {[type]} content
		 * @return {[type]}
		 */
		showFAQ: function(settingid, title, content, id){

			var chat = this.hash.items( settingid );
			$.Log('chatManage.showFAQ()');

			if( this.get().config.count_for_faq && this.get().config.count_for_faq == 1 ){
				this.requestForCount(id);
			}

			chat.showMessage('otherinfo', {
				userid:	chat.dest.id,
				type:	9,
				title:	title,
				msg:	content
			});
		},
		/**
		 * [requestForCount 向小霍发送请求]
		 * @param   id 常见问题id
		 */
		requestForCount:function(id) {
			var time = $.getTime(),
				url,callBackName,faqQuery;
				//url = "http://192.168.30.13/server/count_for_faq.php?"+$.toURI({
				//index.php/api/comment/faq?sireid=kf_8002&faqid=123&kfid=kf_8002_ISME9754_T2D_hxy&settingid=kf_8002_ISME9754_T2D_123456789&vid=fdsfsfsdfsdf&sessionid=kf_8002_ISME9754_T2D_2222222222
				callBackName = 'ntcount_for_faq_' + $.randomChar();
				// 自适应http https
				$.server.kpiserver = $.protocolFilter($.server.kpiserver);
				if($.server.kpiserver.charAt($.server.kpiserver.length-1) === "/"){
					url = $.server.kpiserver + "index.php/api/comment/faq?";
				} else {
					url = $.server.kpiserver + "/index.php/api/comment/faq?";
				}
				faqQuery = $.toURI({
					siteid     : this.chat.siteid,       //企业id
					timesample : time,			         // 时间戳
					faqid      : id,					//问题id
					kfid       : this.get().dest.id,    //客服id
					settingid  : this.chat.settingid,   //接待组
					vid        : $.global.uid || 'notloggedin',
					time       : time,
					sessionid  : this.chat.sessionid,
					callback   : callBackName

				})

				window[callBackName] = function(data){
					$.Log( 'receive respones from kpiserver for count_for_faq' );
					if( data.issuccess == '1000' ){
						$.Log( 'count_for_faq success . code :' + data.errormsg );
					}else{
						$.Log( 'count_for_faq failure . errorCode :' + data.errormsg  , 2);
					}
				}
			$.require(url + faqQuery + '#rnd');
		},
		/**
		 * 更新聊窗口客服头像
		 * @return {[type]}
		 */
		callSetDest: function(settingid, data){
			//$.Log('$.chatManage.callSetDest(' + settingid + ', ' + $.JSON.toJSONString(data) + ')');
			if( this.view ){
				this.view.updateChatTag(settingid, data);
			}
			if( this.eduWapAutoView ){
				this.eduWapAutoView.update(settingid, data);
			}
			if( this.objMinView ){
				this.objMinView[data.status === 0 ? 'offline' : 'online']();
			}
		},
		/**
		 * 更新聊窗口客服状态
		 * @return {[type]}
		 */
		callSetDestStatus: function(settingid, data, updateStatus){
			//$.Log('$.chatManage.callSetDestStatus(' + settingid + ', ' + $.JSON.toJSONString(data) + ', ' + updateStatus + ')');
			if( this.view ){
				this.view.updateChatTag(settingid, data, updateStatus);
			}
		},
		/**
		 * 指定聊窗收到消息
		 * @param  {[type]} settingid
		 * @return {[type]}
		 */
		callReceive: function(settingid){
			$.Log('$.chatManage.callReceive()');
			var chat = this.hash.items( settingid );

			//收到消息的聊窗未选中时，管理器侧边标签闪烁
			if( !chat.selected ){
				this.view.labelFlicker(settingid);
			}
			//管理器最小化时，收到消息数量增加
			if( this.objMinView ){
				this.objMinView.count++;
				this.objMinView.startFlicker();
			}
		},
		/**
		 * @method getHistoryPageCount 获取当前历史访问记录数
		 */
		getHistoryPageCount: function(){
			if( !$.browser.mobile ) return -1;

			return $.store.get('history') || -1;
		},
		/**
		 * @method clearHistoryPageCount 清除历史访问记录数
		 */
		clearHistoryPageCount: function(){
			return $.store.remove('history');
		},
		/**
		 * @method addHistoryPageCount 历史访问记录数增一
		 */
		addHistoryPageCount: function(){
			if( !$.browser.mobile ) return -1;

			var currentHistory = $.store.get('history') || '-1';
			currentHistory = parseFloat(currentHistory) - 1;
			$.store.set('history', currentHistory);

			return currentHistory;
		}
	};

	$.extend({
		/**
		 * 分配客服回调
		 * @param  {[type]} json
		 * @param  {[type]} settingid
		 * @return {[type]}
		 */
		fIM_getSessionCustomerServiceInfo: function(json, settingid){
			var data, rundestinfo, chat = $.chatManage.get(settingid);
			if( !chat ){
				return;
			}

			if( $.isObject(json) ) {
				data = json;
			}else try{
				data = $.JSON.parseJSON( json.replace(/[\r|\n]/ig, '') );
			}catch(e){

			}
			chat.callBackCustomerServiceInfo(data);

			//2017.04.21分配完成客服，返回数据给客户。
			rundestinfo = {
				id: 	data.userid,
				name: 	data.externalname || data.nickname || "",
				logo: 	data.usericon || '',
				status: data.status == undefined ? '' : data.status,
				type: 	data.usertype == undefined ? '' : data.usertype
			}
			$.base.fire("DistributionService",[rundestinfo]);
			return true;
		}
	});

	$.extend({//chatConnect callback
		fIM_tchatFlashReady: function(userid, machineid, settingid){
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ){
					$.Log('fIM_tchatFlashReady:settingid:' + settingid, 3);
					return;
				}
				chat._ready(userid, machineid);
			}, 0);
			return true;
		},
		fIM_ConnectResult: function(status, userinfo, message, settingid){
			$.Log('nTalk.fIM_ConnectResult(' + status + ', userinfo, "' + message + '", "' + settingid + '")', 1);
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ){
					return;
				}
				chat._connectResult(status, userinfo, message);
			}, 0);
			return true;
		},
		fIM_onGetUserStatus: function(strStatus, settingid){
			$.Log('nTalk.fIM_onGetUserStatus(' + strStatus + ', "' + settingid + '")', 2);
			return true;
		},
		/**
		 * 接收邀请评价
		 */
		fIM_requestEvaluate: function(userID, userName, settingid){
			$.Log('nTalk.fIM_requestEvaluate(' + $.JSON.toJSONString(arguments) + ')');
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ){
					$.Log('fIM_requestEvaluate:settingid:' + settingid, 3);
					return;
				}
				chat.showEvaluation(2);
			}, 0);
			return true;
		},
		fIM_notifyUserInputing: function(userId, settingid){
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ){
					$.Log('fIM_notifyUserInputing:settingid:' + settingid, 3);
					return;
				}
				chat.showInputState(userId);
			}, 0);
			return true;
		},
		fIM_receiveCustomerServiceInfo: function(json, settingid){
			$.Log('nTalk.fIM_receiveCustomerServiceInfo("'+json+'", "' + settingid + '")');
			return;
		},
		/**
		 * 评价场景信息
		 * @param  {[type]} json
		 * @param  {[type]} settingid
		 * @return {[type]}
		 */
		fIM_onNotifySessionSence: function(json, settingid){
			//评价场景信息
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ) return;
				chat.notifySessionSence(json);
			}, 0);
			return true;
		},
		/**
		 * 返回当前会话中所有客服的信息
		 * @param  {[type]} currentSubscribers [description]
		 * @param  {[type]} settingid          [description]
		 * @return {[type]}                    [description]
		 */
		fIM_notifyUserNumbers: function(currentSubscribers, settingid){
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ) return;
			}, 0);
			return;
		},
		/**
		 * 房间客服列表
		 * @param  json		destList
		 * @param  string	settingid
		 * @return {[type]}
		 */
		fIM_notifyUserList: function(destList, settingid){
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ) return;
				chat.notifyUserList(destList);
			}, 0);
			return true;
		},
		/**
		 * 客服信息
		 * @param  json		dest
		 * @param  string	settingid
		 * @return {[type]}
		 */
		fIM_onGetUserInfo: function(dest, settingid){
			$.Log('nTalk.fIM_onGetUserInfo(' + $.JSON.toJSONString(dest) + ', ' + settingid + ')', 1);
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ) return;
				chat._userInfo( dest );
			}, 0);
			return true;
		},
		/**
		 * 新加入会话客服信息
		 * @param  string	destid
		 * @param  json		destinfo
		 * @param  string	mast
		 * @param  string	settingid
		 * @return {[type]}
		 */
		fIM_notifyUserEnter: function(destid, destinfo, mast, settingid){
			$.Log('nTalk.fIM_notifyUserEnter(' + destid + ', ' + destinfo + ')');
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ) return;
				chat.userEnter( destinfo );
				chat._userInfo( destinfo );
			}, 0);
			return true;
		},
		/**
		 * 离开房间客服信息
		 * @param  json		destid
		 * @param  string	settingid
		 * @return {[type]}
		 */
		fIM_notifyUserLeave: function(destid, settingid){
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ) return;
				chat.userLeave(destid);
			}, 0);
			return true;
		},
		/**
		 * 接收消息
		 * @param  {[type]} json
		 * @param  {[type]} settingid
		 * @return {[type]}
		 */
		fIM_receiveMessage: function(json, settingid){
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( chat ){
					chat.receive(json);
				}
			}, 0);
			return;
		},
		fIM_eduWapReceiveMessage: function(json, settingid){
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( chat && chat.eduWapAutoView){
					chat.eduWapAutoView.showMessage(json);
				}
			}, 0);
			return;
		},
		/**
		 * @method fIM_suggestMessage 接收消息建议
		 */
		fIM_suggestMessage: function(json, settingid){
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( chat ){
					chat.suggest(json);
				}
			}, 0);
			return;
		},
		fIM_onGetFlashServer: function(userInfoUrl, trailUrl, historicalMsgUrl, checkURL, avServer, manageServer, fileServer){
			return;
		},
		fIM_setTChatGoServer: function(tChatFlashGoUrl, settingid){
			$.Log('nTalk.fIM_setTChatGoServer(' + tChatFlashGoUrl + ')');
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if( !chat ) return;
				chat.setFlashGoServer(tChatFlashGoUrl);
			}, 0);
		},
		fIM_updateUserNumber: function(){
			return;
		},
		/*
		* 合并tchat连接状态的统计点
		* 在loginconnect 注册的函数中调用该函数。
		*/
		fIM_callStat: function(method,settingid,result){

			if( $.global && !($.global.callStatCount ) ){
				$.global.callStatCount = new Object();
				$.global.callStatCount.success = 0;
				$.global.callStatCount.failure = 0;
			}
			if( method == "mqtt" && result == 'success' && $.global.callStatCount.success == 0){
				$.chatManage.get(settingid).callStat('16');
				$.global.callStatCount.success = 1;
			}else if( method == 'mqtt' && result == "failure" && $.global.callStatCount.failure == 0){
				$.chatManage.get(settingid).callStat('17');
				$.global.callStatCount.failure = 1;
			}else if( method == 'flash' && result == 'success' && $.global.callStatCount.success == 0){
				$.chatManage.get(settingid).callStat('14');
				$.global.callStatCount.success = 1
			}else if( method == 'flash' && result == 'failure' && $.global.callStatCount.failure == 0){
				$.chatManage.get(settingid).callStat('15');
				$.global.callStatCount.failure = 1;
			}else{
				$.log('fIM_callStat: error;')
			}
		}
	});

	$.extend({// uploadFlash callback
		fIM_uploadFlashReady: function(id, action, settingid){
			//$.Log('fIM_uploadFlashReady(' + action + ', ' + settingid + ')');
			setTimeout(function(){
				var chat = $.chatManage.get(settingid);
				if(!chat){
					$.Log('nTalk.uploadFlashReady()', 3);
					return;
				}
				chat._uploadReady(action);
			}, 0);
			return true;
		},
		fIM_startSendFile: function(id, action, strMsg, settingid){
			var chat = $.chatManage.get(settingid);

			$.Log('nTalk.fIM_startSendFile(' + action + ',' + strMsg + ', ' + settingid + ')');
			setTimeout(function(){
				chat.startUpload(action, strMsg);
			}, 0);
			return true;
		},
		fIM_receiveUploadSuccess: function(id, action, data, settingid){
			var chat = $.chatManage.get(settingid);

			$.Log('nTalk.fIM_receiveUploadSuccess(' + $.JSON.toJSONString(arguments) + ')');
			setTimeout(function(){
				chat.uploadSuccess(action, data);
			}, 0);
			return;
		},
		fIM_receiveUploadFailure: function(id, action, data, settingid){
			var chat = $.chatManage.get(settingid);

			$.Log('nTalk.fIM_receiveUploadFailure(' + $.JSON.toJSONString(arguments) + ')');
			setTimeout(function(){
				chat.uploadFailure(action, data);
			}, 0);
			return;
		},
		fIM_receiveUploadProgress: function(id, action, data, settingid){
			var chat = $.chatManage.get(settingid);

			//$.Log('nTalk.fIM_receiveUploadProgress(' + $.JSON.toJSONString(arguments) + ')');
			setTimeout(function(){
				chat.uploadProgress(action, data);
			}, 0);
			return true;
		}
	});

	$.extend({
		/**
		 * @method clearSessionCache 清除会话缓存,新创建轨迹ID时，清除原会话缓存
		 * @desc   小能6.0聊窗未配置自动连接时，打开聊天窗时，不自动连接；
		 *         已连接过会话，30分钟内再次打开时，自动连接；
		 *         轨迹ID变更后，清除缓存
		 * @return
		 */
		clearSessionCache: function(){
			var self = this, ret;
			if( !$.base || !$.base.clearChatCache ){
				$.Log('no clear chat cache');
				return;
			}
			try{
				ret = $.store.getAll();
			}catch(e){
				$.Log('$.store:' + typeof($.store), 3);
			}
			if( !ret ) return;
			$.each(ret, function(k){
				if( k.toString().indexOf( $.base.CON_LOCAL_FIX ) > -1 ){
					self.store.remove(k);
				}
			});
			$.Log('clear chat cache');
		},
		/*
		*发送erp消息信息
		*
		*
		*
		*
		*/
		sendErpNews : function(){
			var ip = "", country = "", province = "", city = "";

			if ($.global.trailGetRegion) {
				if ($.global.trailGetRegion.ip) {
					ip = $.global.trailGetRegion.ip;
				}
				if ($.global.trailGetRegion.country) {
					country = $.global.trailGetRegion.country;
				}
				if ($.global.trailGetRegion.province) {
					province = $.global.trailGetRegion.province;
				}
				if ($.global.trailGetRegion.city) {
					city = $.global.trailGetRegion.city;
				}
			}

			$.waitMessage.verificationAdd($.getTime(1), {
				type: 5,
				msg: {
					msgtype:	7,
					param:		$.global.erpparam + '|lang=' + ($.global.lang || $.language) + '|{"ip":"'+	ip+'","country":"'+country+'","province":"'+province+'","city":"'+city+'"}'
				}
			});
		},
		chatReady: function(){
			//等待发送的消息
			var self  = this;
			//this.trailGetRegionCount 轨迹请求地域信息的次数。
			this.trailGetRegionCount = 0 ;
			if( !$.waitMessage ){
				$.waitMessage = new $.HASH();
				//2014.10.22 添加新方法，同类消息只添加一条
				$.waitMessage.verificationAdd = function(key, data){
					var exists = false;
					this.each(function(k, body){
						if( body.type == data.type && body.msg.msgtype == data.msg.msgtype )
							exists = true;
					});
					if( !exists ){
						this.add(key, data);
					}
				};
			}
			//咨询发起页

			$.waitMessage.verificationAdd($.getTime(1), {
				type: 5,
				msg: {
					msgtype:			2,
					parentpagetitle:	($.global.title || $.title).toString().substr(0, 32),
					parentpageurl:		($.global.source|| $.source),
					userlevel:			$.global.isvip,
					sences:				''
				}
			});
			//epr|language
			//2017-02-10  增加erp新的参数  发erp消息，在没有请求到轨迹的地域等信息之前，尝试4次，每次500ms，4次后如果还没有请求到信息，则发送空的地域信息。
			if(	$.global.trailGetRegion && $.global.trailGetRegion.success &&  $.global.trailGetRegion.success == true ){
				this.sendErpNews();
			}else{
				this.trailGetRegionTimer = setInterval(function(){
					self.trailGetRegionCount ++ ;
					if( 	$.global.trailGetRegion && $.global.trailGetRegion.success == true || self.trailGetRegionCount >= 4){
						self.sendErpNews();
						clearInterval(self.trailGetRegionTimer);
						self.trailGetRegionCount = 0;
					}
				},500)
			}
			$.Log('$.chatReady():: $.waitMessage.count():' + $.waitMessage.count(), 1);

			if( !$.themesURI && $.browser.mobile ){
				$.imageicon = $.sourceURI + 'images/mobileicon.png';
				$.rengong   = $.sourceURI + 'images/rengong.png';
			}else if( !$.themesURI ){
				$.imageicon = $.sourceURI + 'images/chaticon.' + ($.browser.msie6 ? 'gif' : 'png');
				$.imagebg   = $.sourceURI + 'images/chatbg.gif';
			}

			//默认单用户与多用会话头像
			$.imagesingle = $.sourceURI + 'images/single.png';
			$.imagemultiplayer = $.sourceURI + 'images/multiplayer.png';
			$.button = $.sourceURI + 'images/button.png';
			$.button2 = $.sourceURI + 'images/button2.png';


			//预加载图片
			$.require([$.imageicon], function(element){
				if( element.error ){
					$.Log('cache chat icon failure', 3);
				}
			});

			$.clearSessionCache();
		}
	});
	$.chatReady();


})(nTalk);
