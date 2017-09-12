;(function($, undefined){
	//====================================================================================
	/**
	 * 自定义滚动条对像
	 * @class myScroll
	 * @constructor
	 */
	$.myScroll = $.Class.create();
	$.myScroll.prototype = {
		name: 'myScroll',
		mainBox:	null,
		contentBox:	null,
		scrollBar:	null,
		_wheelFlag:  0,
		_wheelData:	-1,
		timeID:		null,
		options: null,
		temp: false,
		/**
		 * 初始化滚动条对像
		 * @param  HtmlElement|nTalkElements  mainBox    可视区节点
		 * @param  HtmlElement|nTalkElements  contentBox 内容区节点
		 * @param  String                     className  滚动条className
		 * @param  json                       options    滚动条属性、样式
		 */
		initialize: function(mainBox, contentBox, className, options) {
			this.mainBox = mainBox.talkVersion ? mainBox : $(mainBox);
			this.contentBox = contentBox.talkVersion ? contentBox : $(contentBox);
			this.options = $.extend({width: 0}, options);
			if( !this.mainBox.length || !this.contentBox.length ) return;
			
			this._createScroll(className);
			
			this.resizeScroll();
			this._tragScroll();
			this._wheelChange();
			this._clickScroll();
		},
		/**
		 * 滚动条移至底端
		 * @return {void}
		 */
		scrollBottom: function(){
			var self = this;
			if( !this.mainBox.length || !this.contentBox.length ) return;
			
			clearTimeout(this.timeID);
			this.timeID = setTimeout(function(){
				self.resizeScroll();
			
				self.mainBox.scrollTop( self.mainBox.scrollHeight() );
				self.scrollBox.css('top', Math.floor(self.mainBox.offset().top - self.scrollBox.offset().top) + 'px');
				self.scrollBar.css('top', (self.scrollBox.height() - self.scrollBar.height()) + "px");
			//修正鼠标滚动时从顶部开始问题
				self._wheelFlag = (self.mainBox.height() - self.scrollBar.height()) * 12;
			}, 50);
		},
		/**
		 * 创建滚动条节点
		 * @param  String  className  滚动条className
		 * @return nTalkElements      返回滚动条节点
		 */
		_createScroll: function(className) {
			this.mainBox.css('overflow-y', 'hidden');
			this.scrollBox = $({className: 'view-scrollBox', style:$.STYLE_NBODY + 'display:block;border-radius:10px;'}).appendTo(this.mainBox);
			this.scrollBar = $({className: className, style:$.STYLE_NBODY + 'background:#c8c8c8;border-radius:10px;position:absolute;width:7px;top:0;'}).appendTo(this.scrollBox);
			$({tag:'span', style:$.STYLE_NBODY}).appendTo(this.scrollBar);
			return this.scrollBar;
		},
		/**
		 * 调整滚动条定位
		 * @return
		 */
		resizeScroll: function() {
			var mainBoxWidth = this.mainBox.width();
			var _border = (parseInt(this.mainBox.css('border-left-width')) || 0) + (parseInt(this.mainBox.css('border-right-width')) || 0);
			var _margin = parseInt(this.contentBox.css('margin-left')) + parseInt(this.contentBox.css('margin-right'));
			var _height = this.mainBox.height() - 10 - _border;
			var _barWidth= this.scrollBar.width() || 6;
			
			this.scrollBox.css({
				//2016.03.11更改颜色
				position:	'absolute',
				background:	'#f3f3f3',
				width:	this.scrollBar.width() + 'px',
				height:	this.mainBox.height() + 'px',
				//2016.03.11更改距离右侧的距离
				left:	(mainBoxWidth - _barWidth - _border-4) + 'px',
				top:	'0px'
			});
			this.contentBox.css({
				width:	Math.max(this.options.width, (mainBoxWidth - _barWidth - _margin)) + 'px'
			});
			//for IE8 ul节点无内容时，高为0
			var _contentHeight = Math.max(this.contentBox.height(), this.mainBox.height());
			var _scrollHeight = parseInt(_height * (_height / _contentHeight)) || 300;
			if( _scrollHeight >= this.mainBox.height() ) {
				this.scrollBox.display();
			}else{
				this.scrollBox.display(1);
			}
			this.scrollBar.css('height', _scrollHeight + 'px');
		},
		/**
		 * 拖动滚动条
		 * @return
		 */
		_tragScroll: function() {
			var self = this;
			this.scrollBar.bind('mousedown', function(event){
				var event = $.Event.fixEvent(event),
					mainHeight = self.mainBox.height(),
					scrollTop = self.scrollBar.offset().top - self.scrollBox.offset().top,
					top = event.clientY
				;
				$(document).bind('mousemove', scrollGo);
				$(document).bind('mouseup', function(event) {
					$(document).removeEvent('mousemove', scrollGo);
				});
				
				function scrollGo(event) {
					var flag = $.Event.fixEvent(event).clientY - top + scrollTop;
					if( flag > (mainHeight - self.scrollBar.height()) ) {
						flag = mainHeight  - self.scrollBar.height();
					}
					if (flag <= 0) {
						flag = 0;
					}
					var sTop = flag * (self.contentBox.height() / self.mainBox.height());
					
					self.mainBox.scrollTop( sTop );
					self.scrollBox.css('top',   Math.floor(sTop) + "px");
					self.scrollBar.css('top',   flag + "px");
					self._wheelData = flag;
				}
			}).hover(function(event){
				$(this).css('background', '#a6a6a6');
			}, function(event){
				//2016.03.11更改颜色
				$(this).css('background', '#c8c8c8');
			});
		},
		/**
		 * 鼠标滚轮滚动，滚动条滚动
		 * @return
		 */
		_wheelChange: function() {
			var self = this,
				flag = 0,
				rate = 0
			;
			this._mouseWheel(this.mainBox, function(data) {
				self._wheelFlag += data;
				if (self._wheelData >= 0) {
					flag = self._wheelData;
					self.scrollBar.css('top', flag + "px");
					self._wheelFlag = self._wheelData * 12;
					self._wheelData = -1;
				} else {
					flag = self._wheelFlag / 12;
				}
				if (flag <= 0) {
					flag = 0;
					self._wheelFlag = 0;
				}
				if (flag >= (self.mainBox.height() - self.scrollBar.height())) {
					flag = (self.mainBox.height()  - self.scrollBar.height());
					self._wheelFlag = (self.mainBox.height() - self.scrollBar.height()) * 12;
				}
				
				var sTop = flag * (self.contentBox.height() / self.mainBox.height());
				
				self.mainBox.scrollTop( sTop );
				self.scrollBox.css('top', Math.floor(sTop) + 'px');
				self.scrollBar.css('top', flag + "px");
			});
		},
		/**
		 * 点击滚动条定位
		 * @return
		 */
		_clickScroll: function() {
			var self = this;
			this.scrollBox.click(function(event) {
				event = $.Event.fixEvent(event);
				var _top = event.clientY + $(window).scrollTop() - self.mainBox.offset().top - self.scrollBar.height() / 2;
				if (_top <= 0) {
					_top = 0;
				}
				if (_top >= (self.mainBox.height() - self.scrollBar.height())) {
					_top = self.mainBox.height() - self.scrollBar.height();
				}
				if (event.target != self.scrollBar) {
					var sTop = _top * (self.contentBox.height() / self.mainBox.height());
					self.mainBox.scrollTop( sTop );
					self.scrollBox.css('top', Math.floor(sTop) + "px");
					self.scrollBar.css('top', _top + "px");
					self._wheelData = _top;
				}
			});
		},
		/**
		 * 鼠标滚动事件
		 * @param  nTalkElements obj     滚动条控制区域节点
		 * @param  Function      handler 事件执行函数
		 * @return
		 */
		_mouseWheel: function(obj, handler) {
			obj.bind('mousewheel', function(event) {
				var data = -getWheelData(event);
				handler(data);
				if (document.all) {
					window.event.returnValue = false;
				} else {
					event.preventDefault();
				}
			}).bind('DOMMouseScroll', function(event) {
				var data = getWheelData(event);
				handler(data);
				event.preventDefault();
			});

			/**
			 * 获取滚动距离
			 * @param  htmlEvent event
			 * @return number           返回滚动距离
			 */
			function getWheelData(event) {
				event = $.Event.fixEvent(event);
				return event.wheelDelta ? event.wheelDelta : event.detail * 40;
			}
		}
	};

	/** ====================================================================================================================================================
	 * 聊天窗视图对像
	 * @type {Object}
	 */
	$.chatView = $.Class.create();
	$.chatView.prototype = {
		name: 'chatView',
		contains: null,
		loadElement: null,
		chatElement: null,
		messageElement: null,
		displayiFrame: null,
		chatHistory: null,
		objFile: null,
		objImage: null,
		_tempHeader: null,
		_chatsHeader: null,
		_chatsElement: null,
		_maxNumber: 50,
		_sendKey: 'Enter',
		_editorStart: 0,
		_initFace: false,
		_eventFunction: new Function(),
		scroll: null,
		_listenNumber: 0,
		_listenTimeID:null,
		_inputTimerID: null,
		buttonSelectors: null,
		imageHash: {}, //2015.11.01 记录已出现的图片的msgid
		evalRepeatClick: true, //2016.02.14 预防重复点击评价
		receiveMsgCount: 0,
		mode: null,
		options: null,
		siteid: '',
		settingid: '',
		isRobotSuggest: true,
		/**
		 * 对像初始化
		 * @param  {json}     options 配置选项
		 * @param  {chatMode} mode    chatMode引用
		 */
		initialize: function(options, mode){
			this.options         = options;
			this.siteid          = this.options.siteid;
			this.settingid       = this.options.settingid;
			this.mode            = mode;
			this.buttonSelectors = {
				'face':    'chat-view-face',
				'image':   'chat-view-image',
				'file':    'chat-view-file',
				'history': 'chat-view-history',
				'loadhistory': 'chat-view-load-history',
				'evaluate':'chat-view-evaluate',
				'capture': 'chat-view-capture',
				'capoptions': 'chat-view-capture-options',
				'csr':     'chat-view-change-csr',
				'manual':  'chat-view-switch-manual',
				'submit':  'chat-view-submit',
				'exp':     'chat-view-exp',
                'xiaonengver': 'chat-view-xiaoneng-version'
			};

			if( !this.mode ){
				$.Log('mode is null', 3);
				return;
			}
			
			this.scroll = null;
			this._create();
		},
		/**
		 * @method _create 创建聊天窗体
		 * @return {void}
		 */
		_create: function(){
			this.contains       = $({className: 'chat-view-contains', key: this.settingid, style: $.STYLE_NBODY + 'overflow:hidden;width:100%;height:auto;position:relative;left:0;top:0;padding-top:1px solid #fff\\0;'}).appendTo( this.options.chatContainter );
			
			this.loadElement    = $({className: 'chat-view-load', style: $.STYLE_BODY + 'height:' + this.options.height + 'px;_height:' + (this.options.height - 240) + 'px;box-sizing:border-box;display:block;'}).appendTo(this.contains).html( this._getViewHtml('load') );
			
			this.chatElement    = $({className: 'chat-view-window', style: $.STYLE_BODY + 'width:100%;height:auto;display:none;padding-top:1px solid #fff\\0;'}).appendTo(this.contains).html( this._getViewHtml('window') );
			
			this.messageElement = $({className: 'chat-view-message', style: $.STYLE_BODY + 'height:' + this.options.height + 'px;display:none;float:left;width:100%;'}).appendTo(this.contains).html( this._getViewHtml('message') );
			
			this.displayiFrame  = $({tag:'iframe', id:'chat-view-submit-iframe', name:'chat-view-submit-iframe', className:'chat-view-submit-iframe', style:$.STYLE_NBODY + 'display:none;'}).appendTo( this.contains );
			
			this.contains.append( this._getViewHtml('alert') );
			
			this.chatHistory    = this.chatElement.find('.chat-view-window-history');
			
			//
			this._tempHeader    = this.options.chatHeader.find('.chat-header-icon,.chat-header-name,.chat-header-sign,.ntalk-button-maxresize,.ntalk-button-min,.ntalk-button-close');
			
			if( !this.options.chatHeader.find('.header-chatrecord-title').length ){
			$({className: 'header-chatrecord-title', style:$.STYLE_BODY + 'font-weight:bold;float:left;margin:15px 10px 5px 20px;height:20px;visibility:visible;overflow:hidden;display:none;'}).appendTo( this.options.chatHeader.find('.chat-header-body') ).html( $.lang.button_view );
			}
			if( !this.options.chatHeader.find('.header-chatrecord-close').length ){
			$({className: 'header-chatrecord-close', style: $.STYLE_NBODY + 'float:right;cursor:pointer;margin:20px 5px 0 0;width:20px;height:20px;position:relative;display:none;'}).appendTo(this.options.chatHeader);
			}
			
			this._chatsHeader   = this.options.chatHeader.find('.header-chatrecord-title,.header-chatrecord-close');
			this._chatsElement  = this.chatElement.find('.chat-view-float-history');
			
			this._bind();
			
			this.callChatResize(this.options.width, this.options.height);
			this._qijia_special();
		},

         //2016.03.10 齐家网的定制
          _qijia_special:function(){
          
          	var qijia_chat_view_window_bottom=this.contains.find('.chat-view-window-bottom');
            var qijia_chat_view_end_session=this.contains.find('.chat-view-end-session');
            var qijia_chat_view_submit=this.contains.find('.chat-view-submit');
          	var qijia_chat_view_options=this.contains.find('.chat-view-options');
          	var qijia_chat_view_window_history=$('.chat-view-window-history');
          	var qijia_chat_view_window_editor=$('.chat-view-window-editor').find('textarea');
            var qijia_body_chat_containter=$('.body-chat-containter');
           // var qijia_ntalk_button_min=$('.ntalk-button-min');
            var qijia_chat_view_lbar=$('.chat-view-lbar');
            var qijia_chat_view_options_menu=$('.chat-view-options-menu');
            var qijia_view_fileupload_body=$('.view-fileupload-body');
            var oppo_view_history_body = $('.view-history-body');
            var oppo_view_history_nowDestname = $('.view-history-nowDestname')
            qijia_view_fileupload_body.css({
            	'border-color':'#ffffff'
 
            });
           qijia_chat_view_window_editor.css({
            	height:$.browser.Quirks ? '73px' : '53px',
            	'box-shadow':'white 0px 0px 0px inset'
              

            });
             qijia_chat_view_window_history.css({
             	'background-color':'#f5f5f5',
             	'border-left':'solid 1px #f5f5f5',
             	'border-right':'solid 1px #f5f5f5',

             	'width':'453px'
             });
            qijia_body_chat_containter.css({
            	
				'border-radius': '0',
				'border-right':  '1px solid #f5f5f5',
				'border-bottom': '1px solid #f5f5f5',
				'border-left':   '1px solid #f5f5f5',
                '-moz-border-radius': '0px 0px 0px 0px',
				'-webkit-border-radius': '0px 0px 0px 0px',
				'width':  (+this.options.width  - 2) + 'px',
				'height': (+this.options.height - 1) + 'px'

            });
          	qijia_chat_view_window_bottom.css('background','#ffffff');
          		
			qijia_chat_view_end_session.css({
				margin:'4px 0',
				border:'solid 1px #ebedec',
				'font-size':'13px',
				height: '23px',
				'line-height': '23px',
				'border-radius':'4px',
				padding:'0 16px',
            });
          	qijia_chat_view_submit.css({
                  margin:'4px 8px 0 6px',
                  
                 'background-color':'#2caa76',
                  border:'solid 1px #2caa76',
                  'font-size':'13px',
                  height:'23px',
                 'line-height': '23px',
                 'border-radius':'4px',
                 
                 color:'#fff',
                 padding:'0px 16px'

          	});
       
           //发送按钮悬浮在上面
            qijia_chat_view_submit.hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					'background-color': '#2caa76'
				});
				qijia_chat_view_lbar.css('display','none');
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					'background-color': '#2caa76'
				});
			
			});
			
    
          },


		/**
		 * @method close 关闭聊窗口
		 * @return {void}
		 */
		close: function(){
			this.contains.remove();
			this.contains = null;
			
			if( $.isFunction(this._eventFunction) ){
				$(document.body).removeEvent('click', this._eventFunction);
			}
		},
		/**
		 * @method minimize 最小化聊窗口
		 * @return {void}
		 */
		minimize: function(){
			this.contains.css({
				width: ($.browser.msie&&$.browser.ieversion<=7 ? 1 : 0) + 'px',
				height:($.browser.msie&&$.browser.ieversion<=7 ? 1 : 0) + 'px'
			});
		},
		/**
		 * @method maximize 还原聊窗口
		 * @return {void}
		 */
		maximize: function(){
			this.contains.css({
				width: '100%',
				height:'auto'
			});
		},
		/**
		 * @method switchUI 切换视图
		 * @param {string} type 视图类型[加载:loading｜会话:window｜留言:message|异常:error]
		 * @return {void}
		 */
		switchUI: function(type){
			var self = this;
			if( !this.contains ) return;
			
			switch(type){
				case this.mode.CON_VIEW_WINDOW:
					this.contains.find('.chat-view-load,.chat-view-message').display();
					this.contains.find('.chat-view-window').display(1);
					
					if( !this.scroll ){
						this.scroll = new $.myScroll(this.chatHistory, this.chatHistory.find('ul'), 'chat-view-scrollBar', {width: 411});
					}
					break;
				case this.mode.CON_VIEW_MESSAGE:
					this.contains.find('.chat-view-load,.chat-view-window').display();
					this.contains.find('.chat-view-message').display(1);
					
					this._viewHistory(false);
					
					this._stopListen();
					//2014.11.21
					//留言区出现滚动条时，聊窗变更为最大模式
					/*
					setTimeout(function(){
						var announcement = self.messageElement.find('.chat-view-message-announcement');
						var messageHeight = 0;
						if( announcement.css('display') != 'none' ){
							messageHeight += announcement.height() + 20;
						}
						messageHeight += Math.max(self.messageElement.find('.chat-view-message-table').height(), self.messageElement.find('.chat-view-message-body').height());
						if( messageHeight > self.contains.height() || announcement.html().toString().toLowerCase().indexOf('<img') > -1 ){
							self.mode.manageMode.view._callMaxResize();
						}
					}, 10);
					*/
					break;
				case this.mode.CON_VIEW_ERROR:
					this.contains.find('.chat-view-window,.chat-view-message').display();
					this.contains.find('.chat-view-load').display(1);
					this.contains.find('.chat-view-load-icon, .chat-view-load-info').display();
					this.contains.find('.chat-view-load-error').display(1).find('span');
					break;
				default:
					this.contains.find('.chat-view-window,.chat-view-message').display();
					this.contains.find('.chat-view-load').display(1);
					this.contains.find('.chat-view-load-error').display();
					this.contains.find('.chat-view-load-icon, .chat-view-load-info').display(1);
					break;
			}
		},
		/**
		 * 添加消息, 按消息显示位置分类: first|goods|left|right|bottom|system
		 * @param {string} type
		 * @param {json}   data
		 * 添加消息排序,06.17 添加多客服系统消息排序
		 */
		showMessage: function(position, data){
			var self = this, liElement, style, cstyle, selector, before, compare, beforeCount = 1;

			style = [
			//2016.03.18更改padding 值
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;padding:5px 64px 0 0;',
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;padding:5px 0 0 58px;text-align:right;',
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;padding:5px 10px 0 10px;text-align:center;'
				];
			
			//消息区为示消息上限
			while( this.chatHistory.find('li[class]').length >= this._maxNumber ){
				this.chatHistory.find('li[class]').first().remove();
			}
			
			switch(position){
			case 'left':
				cstyle	= style[0];
				selector= data.msgid;
				break;
			case 'bottom'://客服输入状态消息
				cstyle	= style[0];
				selector= 'systembottom';
				return;
				
			case 'right':
				cstyle	= style[1];
				selector= data.msgid;
				break;
			case 'goods'://商品信息
				cstyle	= style[2];
				selector = 'first';
				break;
			case 'system'://系统提示消息
				cstyle = style[2];
				selector = 'system';
				break;
			case 'system0'://会话合并提示消息
				cstyle = style[2];
				selector = 'system0';
				break;
			case 'info'://系统提示消息
				cstyle = style[2];
				selector = data.msgid;
				break;
			case 'otherinfo'://faq信息
				cstyle  = style[0];
				selector= data.msgid;
				break;
			default://欢迎消息
				cstyle = style[2];
				selector = 'first';
				break;
			}
			
			if( this.chatHistory.find('li.' + selector).length && selector != 'system' ){
				
				//已存在客服输入状态时，直接显示
				if( selector == 'systembottom' ){
					this.chatHistory.find('li.' + selector).css('visibility', 'hidden');
				}
				liElement = this.chatHistory.find('li.' + selector).html( this._getMessageHtml(position, this._contentFilter(data)) );
			}else if( !data ){
				//用于清除消息
				this.chatHistory.find('li.' + selector).remove();
				
			}else{
				//系统消息，直接替换
				if( selector === 'system' || selector === 'system0' ){
					this.chatHistory.find('li.' + selector).remove();
				}
				//置顶消息
				if( selector==='first' && this.chatHistory.find('ul li').length > 1 ){
					before = this.chatHistory.find('li').eq(0);
				}
				//消息排序，排序规则
				else{
					compare = this.chatHistory.find('li').eq( 0 - beforeCount );
					if( compare.indexOfClass('first') ){
						before = null;
					}
					else{
						if( compare.indexOfClass('systembottom') ){
							beforeCount++;
							before = compare;
							compare = this.chatHistory.find('li').eq( 0 - beforeCount );
						}
						
						if( selector === 'system' && this.mode.enterUserId){
							while( compare && compare.attr("userid") == this.mode.enterUserId){
								if( beforeCount >= 5 ){
									break;
								}
								beforeCount++;
								before = compare;
							
								compare = this.chatHistory.find('li').eq( 0 - beforeCount );
							}
							this.mode.enterUserId = "";
						}
						
						while( compare && !compare.indexOfClass('first') && !compare.indexOfClass('system') && compare.attr("localtime") && beforeCount <= this.chatHistory.find('li').length && parseFloat( compare.attr("localtime") ) >= data.localtime ){
							if( beforeCount >= 5 ){
								break;
							}
							beforeCount++;
							before = compare;
							
							compare = this.chatHistory.find('li').eq( 0 - beforeCount );
						}
					}
				}
				try{
					liElement = $({tag:'li', className: selector, localtime: data.localtime, userid: (data.userid || ''), style: cstyle, history:data.history || '0'}).appendTo(this.chatHistory.find('ul'), before);
					liElement.insert( this._getMessageHtml(position, this._contentFilter(data) ) );
					if( selector == 'systembottom' ){
						liElement.find('table td.view-history-content').css('width', '60px');

					}
				}catch(e){
					$.Log(e, 3);
				}

				//2016.9.10 debug解决机器人反向引导中含有空格时跳到新的空白页面
                if(data.xnlink) {
                    setTimeout(function(){
                        var el = liElement.find('.robotQuestion');
                        el.click(function(event){
                            var event = $.Event.fixEvent(event);
                            event.preventDefault();
                            event.stopPropagation();
                            nTalk.chatManage.get(this.settingid).send($(this).html().replace(/[[0-9]*]\s/,""));
                            return false;
                        });
                    },200);
                }

				if( selector != 'system' ){
					//消息区连接打开方式处理
					liElement.find('a').click(function(){
						//2015.11.10 如果A链接有onclick属性，则不执行此方法
						if( this.onclick ) return;
						var href = $(this).attr('_href') || $(this).attr('href');
						$(this).attr('_href', href).attr('target', '_self').attr('href', '###');
						if( typeof window.openURLToBrowser == "function"){
							window.openURLToBrowser(href);
							return false;
						}
						window.open(href);
						return false;
					});
				}
				
				if( data.type == 1 && position=='left' ){
					//收到消息时，隐藏输入状态
					this.chatHistory.find('li.systembottom').css('visibility', 'hidden');
                     	//2016.03.23
			         $('.chat-view-xiaoneng-version').css('visibility', 'hidden');

				}

				if( data && /^(1|2|4|6)$/i.test(data.type) && position=='left' && typeof window.webInfoChanged == "function" && (data.msgid != 'welcome') && (data.history != 1) && data.msgsystem != "true" ) {
					webInfoChanged(400, '{"num":' + (++this.receiveMsgCount) + ', "showNum":1}', false);
				}
			}
			//2016.03.22增加隐藏消息
			//客服输入状态消息3秒后隐藏
			if( selector == 'systembottom' ){
				clearTimeout(this._inputTimerID);
				this._inputTimerID = null;
				this._inputTimerID = setTimeout(function(){
					self.chatHistory.find('li.systembottom').css('visibility', 'hidden');
				
				}, 3E3);
			}
			
			if( this.scroll ){
				this.scroll.scrollBottom();
			}
			
			//2015.09.28 加载链接URL解析内容
			if( data && data.type==1 ){
				this.loadLinkContainer(data.msgid);
			}
			
			if( data && /^(1|2|4|6|9|13)$/i.test(data.type) ){
				this.updateMessage(data.msgid, data.type, data, position==='left');
			}
			
			//2015.07.01 解决欢迎语ie7错位问题
			if($(".welcome").length==1){
				$(".welcome").css("visibility","hidden").css("visibility","visible");
			}
			
			return selector;
		},
		/**
		 * 移除消息指定消息
		 * @return {string} msgid 消息ID
		 */
		removeMessage: function(msgid){
			this.chatHistory.find('.' + msgid).remove();
		},
		/**
		 * 更新消息状态\内容
		 * @param  string   msgid   消息ID
		 * @param  bumber   type    消息类型ID[1:文本消息;2:图片消息;4:文件消息;5:特定系统消息;9:系统提示消息;]
		 * @param  json     data    消息内容
		 * @param  boolean  receive 是否是接收的消息,用于区分访问发送的与客服发送的文件、图片消息
		 * @return {void}
		 */
		updateMessage: function(msgid, type, data, receive){
			var self = this, position,
				liElement   = this.chatHistory.find('.' + msgid).last(),
				bodyElement = liElement.find('.view-history-body').last(),
				maxHeight = $(".chat-view-window-history").height()-95;

			//2015.05.24 消息下存在更新选项时，绑定事件
			liElement.find(".view-history-more").bind("click", function(){
				bodyElement.css({
					'height': 'auto',
					'overflow-y': 'visible',
					'max-height': 'none'
					});
				if( self.scroll ){
					self.scroll.resizeScroll();
				}
				$(this).display();
			});
			//2015.05.14 检查消息高度，若大于设定的最大高度，则显示更多按钮
			curHeight = bodyElement.height();
			if($.base.checkID(data.userid) == $.CON_CUSTOMER_ID && (bodyElement.scrollHeight() > maxHeight || bodyElement.height() > maxHeight)){
				bodyElement.css({
					'height':	maxHeight+"px",
					'overflow-y':'hidden'
				});
				
				liElement.find('.view-history-more').display(1);
			}

			switch(type+''){
				case "1":
					if( typeof data === 'string' ){
						//消息发送失败时，显示可以重新发送的连接
						this._showResend(msgid, data).click(function(event){
							$.Event.fixEvent(event).stopPropagation();
							
							$(this).parent().parent().display();
							self.mode.resend(msgid);
						});
					}else if( bodyElement.find('.ntalk-preview').length ){
						//2015.03.28 常规消息中含图片时预加载图片，显示小图，点击可查看大图
						//2015.05.06 机器人版本，用户配置的消息可能含存在同一条消息中有多个超大图片
						bodyElement.find('.ntalk-preview').each(function(i){
							var imageElement = this,
								imageurl = $(imageElement).attr('sourceurl')
							;
							
							$.require(imageurl + '#image', function(image){
								if( image.error ){
									$(imageElement).display();
								}else{
									var attr = $.zoom(image, 332, 500);
									$(imageElement).attr({
										width: attr.width,
										height:attr.height,
										src: image.src
									}).click(function(event){
										//2015.11.10 全屏显示图片时需要传入msgid，便于前后翻看图片
										self._fullScreenImage(this, msgid);
									}).css({
										width:  attr.width + 'px',
										height: attr.height+ 'px',
										cursor: 'pointer'
									});
								}
							
								if( self.scroll && self.scroll.scrollBottom ){
									self.scroll.scrollBottom();
								}
							});
						});
					}
					break;
				case "13":
					//展示商品信息
					var self = this, attr, k, html = [], options, json = data.msg.item || data.msg.items || {};
					if( !json || $.isEmptyObject(json) ){
						return;
					}
					json.url = json.url || 'javascript:void(0)';
					if( json.name ){
						html.push( '<a href="',json.url,'" target="_blank" style="' + $.STYLE_BODY + 'color:#0479D9;font-weight:bold;">' + json.name + '</a>' );
					}
					$.each(json, function(k, productAttr){
						if( $.isArray(productAttr) ){
							productAttr[1] = (k.indexOf('price')>-1&&json['currency']&&(productAttr[1]+'').indexOf(json['currency'])<=-1 ? json['currency'] : '') + '' + productAttr[1];
							
							html.push( '<div style="' + $.STYLE_BODY + '"><span style="' + $.STYLE_BODY + '">' + productAttr[0] + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + '</span>' + productAttr[1] + '</div>' );
							
							$.Log(productAttr[0] + ': ' + productAttr[1]);
						}else if( $.isObject(productAttr) ){
							productAttr['v'] = (k.indexOf('price')>-1&&json['currency']&&(productAttr['v']+'').indexOf(json['currency'])<=-1 ? json['currency'] : '') + '' + productAttr['v'];
							
							html.push( '<div style="' + $.STYLE_BODY + '"><span style="' + $.STYLE_BODY + '">' + productAttr['k'] + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + '</span>' + productAttr['v'] + '</div>' );
							
							$.Log(productAttr['k'] + ': ' + productAttr['v']);
						}else if( $.lang.goodsinfo[k] ){
							//添加货币符号
							productAttr = (k.indexOf('price')>-1&&json['currency']&&(productAttr+'').indexOf(json['currency'])<=-1 ? json['currency'] : '') + productAttr;
							
							html.push( '<div style="' + $.STYLE_BODY + '"><span style="' + $.STYLE_BODY + '">' + $.lang.goodsinfo[k] + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + ' </span>' + productAttr + '</div>' );
							
							$.Log($.lang.goodsinfo[k] + '' + productAttr);
						}
					});
					if(json.imageurl) $.require(json.imageurl + '#image', function(image){
						if( image.error ){
							self.chatHistory.find('.view-history-goods-image').html('');
						}else{
							attr = $.zoom(image, 75, 75);
							self.chatHistory.find('.view-history-goods-image').html('<a href="' + json.url + '" target="_blank" style="' + $.STYLE_BODY + '"><img src="' + json.imageurl + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_NBODY + 'display:inline;width:' + attr.width + 'px;height:' + attr.height + 'px;" /></a>');
						}
						if( self.scroll ){
							self.scroll.scrollBottom();
						}
					});
					if( self.scroll ){
						self.scroll.scrollBottom();
					}
					this.chatHistory.find('.view-history-goods-info').html( html.join('') );
					break;
				case "2":
				case "4":
				    if (data.type == 2 && data.emotion == 1) {
				        //2015.02.06, 加载自定义表情
				        $.require(data.sourceurl + '#image', function(image) {
				            if (image.error) {
				                $.Log('emotion file failure.', 3);

				                if (data.msgid) self.removeMessage(data.msgid);
				            } else {
				                var attr = $.zoom(image, 100, 85);
				                bodyElement.css({
				                    'background': 'none',
				                    'cursor': 'auto',
				                    'height': attr.height + 'px'
				                }).html('<img src="' + data.sourceurl + '" sourceurl="' + data.sourceurl + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_NBODY + 'width:' + attr.width + 'px;height:' + attr.height + 'px;vertical-align:middle;" />');
				            }
				            //$.Log('load face image, scroll.scrollBottom()');
				            if (self.scroll) {
				                self.scroll.scrollBottom();
				            }
				        });
				        if (self.scroll) {
				            self.scroll.scrollBottom();
				        }
				    } else if (data.status == 'UPLOADING') {
				        //准备上传文件

				        liElement.find('table').css('width', '138px');
				        //开始上传图片文件时，显示取消息上传提示
				        position = type == 2 ? '-115px -145px' : '0 -245px';
				        bodyElement.css({
				            'width': '100px',
				            'height': '85px',
				            'background': 'url(' + $.imageicon + ') no-repeat ' + position
				        });
				        /*
				        this._showCancel(msgid).click(function(event){
				        	self.mode.cancelUpload(type == 2 ? 'uploadimage' : 'uploadfile');
				        });
				        */
				    } else if ($.isNumeric(data) && data > 0 && data <= 100) {
				        //正在上传,更新进度条宽

				        liElement.find('.view-history-progress').display(1).find('.view-history-upload-progress').css('width', data + '%');

				    } else if (data < 0 || data.error) {
				        //上传失败、异常
				        if (type == 2) {
				            //2015.11.10 IE7 兼容处理
				            liElement.find('table').css('width', '138px');
				            //2015.11.10 图片上传失败处理
				            position = type == 2 ? '-20px -145px' : '-98px -245px';

				            bodyElement.css({
				                'width': '100px',
				                'height': '85px',
				                'background': 'url(' + $.imageicon + ') no-repeat ' + position
				            });

				            if (data == -1) { //-1:取消上传
				                this._transCancel(msgid);
				            } else { //-2: 上传失败
				                this._showFailure(msgid);
				            }
				        } else {
				            //2015.11.10 文件上传，界面响应方法
				            this._showFileUpload(liElement, bodyElement, {
				                name: '',
				                size: '',
				                error: receive
				            }, -1);
				        }

				        liElement.find('.view-history-progress').display();
				    } else if ($.isObject(data) && data.url) {
				        //文件、图片上传完成
				        if (type == 2) {
				            //2015.11.01 需要显示的图片，将msgid放入imageMsgIdArr中
				            //self.imageHash[msgid] = 0;

				            $.require(data.url + '#image', function(image) {
				                if (image.error) {
				                    $.Log('upload file failure.', 3);
				                    //IE7 兼容处理
				                    liElement.find('table').css('width', '120px');

				                    bodyElement.css({
				                        'width': '100px',
				                        'background': 'url(' + $.imageicon + ') no-repeat 0 -145px'
				                    });
				                } else {
				                    //var attr = $.zoom(image, 100, 85);
				                    //设置图片宽高为读取到的宽高
				                    var imageHtml = '<img src="' + data.url + '" sourceurl="' + data.sourceurl + '" width="' + image.width + '" height="' + image.height + '" style="vertical-align:middle;' + $.STYLE_NBODY + 'width:' + image.width + 'px;height:' + image.height + 'px;max-width:220px;max-height:160px;" />';

				                    var width = image.width,
				                        height = image.height;

				                    //当宽度或高度不足时，添加默认的白色的背景
				                    if (image.width < 138) {
				                        imageHtml = '<div style="width:138px;height:' + image.height + 'px;text-align:center;background:white;border-radius:5px;max-width:220px;max-height:160px">' + imageHtml + '</div>';
				                        width = 138;
				                    } else if (image.height < 100) {
				                        height = 100;
				                        var temp_height = (!$.browser.Quirks && ($.browser.ieversion <= 7 ))? image.height : 100;
				                        imageHtml = '<div style="height:'+temp_height+'px;width:' + image.width + 'px;box-sizing:border-box;padding:' + (100 - image.height) / 2 + 'px 0px;text-align:center;background:white;border-radius:5px;max-width:220px;max-height:160px">' + imageHtml + '</div>';
				                        
				                    }
				                    //IE7 兼容处理 宽度增大 2016.03.31
				                    liElement.find('table').css('width', ( (width < 220 ? width : 220) + 68) + 'px');
                                   
                                     
				                    //设置最大宽高
				                    $.Log('upload file(width:' + image.width + ', height:' + image.height + ') success:' + data.url);
				                    bodyElement.css({
				                        'background': 'none',
				                        'cursor': 'pointer',
				                        //2016.03.31更改高度值
				                        'width': width < 220 ? width + 'px' : '220px',
				                        'height': height < 160 ? height +'px' : '160px',
				                        'max-width': '220px',
				                        'max-height': '160px'
				                    }).html(imageHtml).find('img').click(function(event) {
				                        self._fullScreenImage(this, msgid);
				                    });


				                    //判断消息来源于访客或客服
				                    var userid = liElement.attr('userid');
				                    var dest = $.base.checkID(userid) <= 1;

				                    //访客，客服样式不同处理
				                    if (dest && userid) {
				                        bodyElement.parent().css({
				                            'padding': '2px',
				                            'border': '1px solid #ffffff'
				                        });
				                    } else {
				                        bodyElement.parent().css({
				                            'padding': '2px',
				                            'border': '1px solid #78bde9'
				                        });
				                    }

				                    //设置尖角位置为距离顶部15px
				                   //var angle = liElement.find('.view-history-angle');
				                   // angle.css('margin-left', '15px');
				                   // angle.parent().css('vertical-align', 'top');
				                    self.imageHash[msgid] = 1;

				                    //添加鼠标移入显示图片底部透明长条设置，点击长条可以下载图片
				                    if( typeof webInfoChanged != "function" ){
				                    bodyElement.bind('mouseenter', function(event) {
                                     var downloadHtml = ['<div class="mouse-enter-download" style="', $.STYLE_BODY, 'position:absolute;bottom:0px;width:100%;height:30px;line-height:30px;text-align:right;background:#000;color:white;left:0px">', $.lang.news_download, '&nbsp;&nbsp;</div>'].join("");
                     
                                       $(this).css('position', 'relative');
				                        $(this).append(downloadHtml);
				                        $(this).find('.mouse-enter-download').css('opacity', 0.5);
				                        $(this).find('.mouse-enter-download').click(function(event) {
				                            $.Event.fixEvent(event).stopPropagation();
				                            self.displayiFrame.attr('src', data.sourceurl || data.url);
				                        });
				                    }).bind('mouseleave', function(event) {
				                        $(this).css('position', 'static');
				                        $(this).find('.mouse-enter-download').remove();
				                    });
				                    }

				                }
				                if (self.scroll) {
				                    self.scroll.scrollBottom();
				                }
				            });
				        } else {
				            //文件上传效果处理
				            this._showFileUpload(liElement, bodyElement, data, 1);
				        }
				        liElement.find('.view-history-progress').display();
				    }
				    break;
				case "6":
					//创建音频消息播放器
					var musicEl = new $.Music(msgid, data.url, 'audio/mpeg', (data.duration||data.length), this.audioView, this.audioBindEvent, this.contains);
					break;
				case "9":break;
				default:
					bodyElement.html( data );
					break;

			}
		},
		/**
		 * @method loadLinkContainer 查询加载消息区连接地址
		 * @param  {string} msgid
		 * @return {void}
		 */
		loadLinkContainer: function(msgid){
			var self = this,
				linkContains = this.chatHistory.find('.' + msgid ).last().find('.view-history-body').find('.ntalk-link-contains')
			;
			if( !linkContains.length ) return;
			
			linkContains.each(function(i, aElement){
				var url = $(aElement).attr('data-source');
				var selector = $(aElement).attr('class');
				if( url ){
					self.mode.loadLink(url, '.' + selector.replace(/ntalk\-link\-contains\s+/gi, ''));
				}
			});
		},
		/**
		 * @method viewLinkContainer 显示连接信息
		 * @param  {json|string} data
		 * @return {void}
		 */
		viewLinkContainer: function(data, selector){
			var self = this, root = $(selector), linkImage;

			if( typeof data == 'string' ){
				try{
					data = $.JSON.parseJSON(data);
				}catch(e){
				}
			}

			root.css({
				"margin":           "5px",
				"border-radius":    "5px",
				"border":           "1px solid #CCC",
				"background-color": "#FAFAFA",
				"width":            "250px"
			});
			linkImage = $({className:'link-image',style: $.STYLE_BODY + 'margin:10px;background-color:#fff;width:77px;height:77px;overflow:hidden;float:left;display:inline-block;'}).appendTo( root );
			container = $({className:'link-container',style: $.STYLE_BODY + 'overflow:hidden;zoom:1;'}).appendTo( root );

			$({className:'link-title',style: $.STYLE_BODY + 'margin:10px 0 0 0;width:100%;height:24px;white-space:nowrap;text-overflow:ellipsis;-o-text-overflow:ellipsis;overflow:hidden;'}).appendTo( container ).html(
				['<a href="', data.url, '" target="_blank">', data.title, '</a>'].join('')
			);

			$({className:'link-desc', style: $.STYLE_BODY + 'margin:5px 0 10px 0;width:100%;max-height:60px;overflow:hidden;'}).appendTo( container ).html( $.enCut(data.description, 96, 1) + '&nbsp;' );
			$({className:'link-clear',style: $.STYLE_BODY + 'clear:both;'}).appendTo( root );

			//load image
			$.require(data.imageurl + '#image', function(image){
				var attr = $.zoom(image, 75, 75);
				var margin = (75 - attr.height)/2 + 'px ' + (75 - attr.width)/2 + 'px';
				linkImage.html(
					['<img src="', data.imageurl, '" style="', $.STYLE_NBODY, 'margin:' + margin + ';width:' + attr.width + 'px;height:' + attr.height + 'px;"/>'].join('')
				);
				
				//更新滚动条
				if( self.scroll ){
					self.scroll.scrollBottom();
				}
			});
		},
		/**
		 * @method scrollBottom 消息区向下滚动
		 * @return {void}
		 */
		scrollBottom: function(){
			//this.chatHistory.scrollTop( this.chatHistory.scrollHeight() );
		},
		/**
		 * @method suggest 显示输入建议(用于机器人客服时快速提问)
		 * @param  {array}  data
		 */
		suggest: function(data, type){
			var self = this,
				list = this.chatElement.find('.chat-view-hidden-area .chat-view-suggest-list')
			;
			list.find('ul li').remove();
			
			if(data.length === 0) {
			    list.css('display', 'none');
			    return;
			}

			$.each(data, function(i, message){
				$({tag: 'LI', talk_index: i, className: '', style:$.STYLE_BODY + 'padding:0 0 0 20px;list-style:none;line-height:28px;height:28px;overflow:hidden;cursor:pointer;'}).appendTo(list.find('ul')).html(message).hover(function(event){
					$(this).css({
						'color':	'#fff',
						'background-color':'#4297e0'
					});
				}, function(event){
					$(this).css({
						'color':	'#000',
						'background-color':'#fafafa'
					});
				}).click(function(event){
					$.Event.fixEvent(event).stopPropagation();
					
					//2015.04.15 点击建议消息后发送index类型消息,值为索引
					var index = parseFloat($(this).attr('talk_index')) + 1;
					self.mode.send( {
						msg: !type ? index : message,
						botindex: 'index'
					} );
					self.textEditor.val( '' );
					
					list.css('display', 'none');
				});

	
			});
			
			list.css({
				'display':	'block',
				'top':		(-10 - 26*data.length) + 'px'
			});
		},
		/**
		 * @method _selectSuggest 移动输入选项位置
		 * @param  {number} num 
		 */
		_selectSuggest: function(num){
			var list = this.chatElement.find('.chat-view-suggest-list li'),
				selectIndex = 0
			;
			list.each(function(){
				if( $(this).attr('talk_selected') ){
					selectIndex = $(this).attr('talk_index');
				}
				$(this).attr('talk_selected', '').css({
					'color':	'#000',
					'background-color':'#fafafa'
				});
			});
			
			selectIndex = parseFloat(selectIndex) + num;
			selectIndex = selectIndex < 0 ? list.length - 1 : selectIndex;
			selectIndex = selectIndex >= list.length ? selectIndex - list.length : selectIndex;
			$.Log('set selected index:' + selectIndex);
			
			//选中项
			list.eq(selectIndex).attr('talk_selected', '1').css({
				//2016.03.11更改颜色
				'color':	'#fff',
				'background-color':'#4297e0'
			});
			
			this.isRobotSuggest = false;
			this.textEditor.val( list.eq(selectIndex).attr('robotmsg') ? list.eq(selectIndex).attr('robotmsg') : (parseFloat(selectIndex)+1) );
		},
		/**
		 * 开始分配置客服时，显示正在分配客服状态消息
		 * @param  {boolean} display 显示｜隐藏状态消息
		 * @param  {string}  message 消息内容
		 * @return {void}
		 */
		displayStatusInfo: function(display, message){
			var statusElement = this.chatElement.find('.chat-view-window-status-info');
			if( message ){
				statusElement.html(message);
			}
			if( display ){
				statusElement.display(1);
			}else{
				statusElement.hide(function(){
					$(this).css({
						'display':	'none',
						'opacity':	1
					});
				});
			}
		},
		/**
		 * 客服正在输入,在聊窗中创建一条新消息占位，此消息会一直在最新位置
		 * 默认用户输入状态与默认配套背景图片关联
		 * @param  {number} position 动画更新输入状态
		 * @return {void}
		 */
		 //2016.03.23 改写聊窗内容
          showInputState:function(){
          	//2016.03.23
			  $('.chat-view-xiaoneng-version').css('visibility', 'visible');
			  if($('.chat-view-xiaoneng-version').css('visibility')=='visible'){
					clearTimeout(this._inputTimerID);
				    this._inputTimerID = null;
				    this._inputTimerID = setTimeout(function(){
					//2016.03.23
					$('.chat-view-xiaoneng-version').css('visibility', 'hidden');
			     }, 3E3);
				}
           
          },

		/*showInputState: function(position){
			if( this._inputStateTimeID && position === undefined ){
				return;
			}
			//2016.03.23 
			position = position ? position : -140;
			
			var self = this, elementWait = this.chatHistory.find('.view-history-body-wait');
			this._inputStateTimeID = setTimeout(function(){

				if( !elementWait.length ){
					clearTimeout( self._inputStateTimeID );
					self._inputStateTimeID = null;
					return;
				}
				
				position = position <= -170 ? -140 : position - 10;
				elementWait.css('background-position', position + 'px -60px');

				self.showInputState(position);	
			}, 5E2);
		},*/
		/**
		 * @method _showResend 显示重新发送消息
		 * @param  {string} msgid 消息ID
		 * @param  {string} msg   消息内容
		 * @return {void}
		 */
		_showResend: function(msgid, msg){
			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);
			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display(1);
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html( $.utils.handleLinks( msg || $.lang.news_send_failure ) ).find('a');
		},
		/**
		 * @method _showCancel 显示取消文件上传消息
		 * @param  {string}  msgid   消息ID
		 * @param  {boolean} receive 是否是接收消息
		 * @return {void}
		 */
		_showCancel: function(msgid, receive){
			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);
			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display();
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html('<span style="' + $.STYLE_BODY + 'cursor:pointer;color:#005ffb;text-decoration:none;">' + ($.lang.news_cancel_trans || '') + '</span>').find('span');
		},
		/**
		 * @method _showDownload 显示文件下载连接与文件名
		 * @param  {string}  msgid   消息ID
		 * @param  {boolean} receive 是否是接收消息
		 * @param  {json}    data    消息内容
		 * @return {HtmlDom}
		 */
		_showDownload: function(msgid, receive, data){
			var html, filename = data.type==4&&data.oldfile ? data.oldfile : '';

			html = receive ? [
				'<span class="chat-view-download-link" style="' + $.STYLE_BODY +  'float:left;line-height:26px;margin:0 5px;cursor:pointer;color:#005ffb;text-decoration:none;">' + $.lang.news_download + '</span>',
				(filename ? '<span style="' + $.STYLE_BODY + 'float:left;line-height:26px;text-decoration:none;display:block;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;max-width:100px;" title="' + filename + '">' + this._toFileName(filename) + '</span>' : '')
			].join('') : [
				(filename ? '<span style="' + $.STYLE_BODY + 'float:left;line-height:26px;text-decoration:none;display:block;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;max-width:100px;" title="' + filename + '">' + this._toFileName(filename) + '</span>' : ''),
				'<span class="chat-view-download-link" style="' + $.STYLE_BODY +  'float:left;line-height:26px;margin:0 5px;cursor:pointer;color:#005ffb;text-decoration:none;">' + $.lang.news_download + '</span>'
				].join('');

			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);

			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display();
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html(html).find('.chat-view-download-link');
		},
		_toFileName: function(fName){
			fName = fName || '';
			return $.enLength(fName) < 16 ? fName : $.enCut(fName, 10) + '..' + fName.substr(fName.length-4, 4);
		},
		_showFailure: function(msgid){
			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);
			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display(1);
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html($.lang.news_trans_failure);
		},
		_transCancel: function(msgid){
			this.chatHistory.find('.' + msgid).last().find('.view-history-status').display(1);
			this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display(1);
			return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html($.lang.news_trans_cancel);
		},
		_showFileUpload: function(liElement, bodyElement, data, type) {
			var self = this; 

			//IE7下布局调整
			liElement.find('table').css('width', '293px');
			liElement.find('table').css('height', '104px');
			bodyElement.css('height', '104px');
			//bodyElement.css('width','211px');


			//分别设置访客v_、客服d_,宽度、高度、边界、距离左侧、顶部距离
			var v_width = 265, v_height = [104, 76, 28], v_border = 'none', v_left = [11, 78], v_top = [8, -44];
			//2016.03.30 更改border 的颜色值
			var d_width = 270, d_height = [110, 80, 30], d_border = '1px solid #ffffff', d_left = [13, 80], d_top = [10, -42];

			//获取消息来源于访客还是客服
			var userid = liElement.attr('userid');
			var dest = $.base.checkID(userid) <= 1;

			//将样式配置参数赋值给指定的变量
			var width, height, border, left, top;
			if (dest && userid) {
				width = d_width;
				height = d_height;
				border = d_border;
				left = d_left;
				top = d_top;
			} else {
				width = v_width;
				height = v_height;
				border = v_border;
				left = v_left;
				top = v_top;
			} 
			
			//左侧iconurl与其样样式
			var iconurl = "", iconStyle = "";
			
			//data.oldfile||data.size用于获取历史消息中的文件名与大小信息
			//this.uploadFileSize||this.uploadFileName用于获取上传时的文件名与大小信息
			var oldfile = data.oldfile || this.uploadFileName,
				filename = data.oldfile || this.uploadFileName,
				size = !this.uploadFileSize ? (data.size ? parseInt(data.size.replace("KB","")) : '') : (this.uploadFileSize / 1024).toFixed(2);

			//后缀名正则，匹配后得到hzm数组
			var hzmPattern = /\.[^\.]+$/,
				hzm =  filename.toLowerCase().match(hzmPattern);
			
			//后缀标识
			var imgFlag = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.pjpeg'],
				docFlag = ['.doc', '.docx'],
				mp3Flag = ['.mp3'],
				txtFlag = ['.txt'];

			if ( $.inArray(hzm[0], imgFlag) > -1 ) {
				//图片时，需要在图标区域直接显示一张小图
				iconurl = data.url || '\'\'';
				iconStyle = ' width=50 height=50 style="border: 1px solid #d4d4d4;border-radius:5px;margin:2px"';
			} else if ( $.inArray(hzm[0], mp3Flag) > -1 ) {
				//设置左侧图标为MP3
				iconurl = $.sourceURI + 'images/filetype/mp3.png';
			} else if ( $.inArray(hzm[0], docFlag) > -1 ) {
				//设置左侧图标为DOC
				iconurl = $.sourceURI + 'images/filetype/doc.png';
			} else if ( $.inArray(hzm[0], txtFlag) > -1 ) {
				//设置左侧图标为TXT
				iconurl = $.sourceURI + 'images/filetype/txt.png';
			} else {
				//设置左侧图标为ZIP
				iconurl = $.sourceURI + 'images/filetype/zip.png';
			}

			//文件名超过一行的情况下，进行截取
			if ( filename.length > 12 ) {
				filename = filename.substr(0, 4) + "..." + filename.substr(filename.length-6, filename.length);
			}

			//文件大小使用适合的单位表示
			if ( !size ) {
				size = '';
			}else if ( size > 1024 ) {
				size = '(' + (size / 1024).toFixed(2) + " MB" + ')';
			} else if ( size < 1024 ) {
				size = '(' + size + " KB" + ')';
			}

			//上传状态
			var success = (type == 1);
			//状态样式
			var statusStyle = (dest && userid) ? ' display:none ' : '';
			//所需图标在大图中的位置
			//2016.03.30修改图片的位置
			var statusIconPosition = success ? ' -10px -96px ' : ' -10px -116px ';
			//显示状态名称
			var status =  success ? $.lang.news_trans_success : $.lang.news_trans_failure;
			//下载区域显示内容
			var download =  success ? $.lang.news_download : '';
               
            //文件上传html:结构 body{top:{icon, content: {title,size,status,status-icon}}, bottom:{bottom}}   
            var width=($.browser.ieversion == 7 )? (width-42): width;
			var html = ['<div class="view-fileupload-body" style="',$.STYLE_BODY,'position:relative;width:',width,'px;height:',height[0],'px;border-radius:5px;background:#FFF;border:',border,'">',
				'<div class="view-fileupload-body-top" style="',$.STYLE_BODY,'width:',width,'px;height:',height[1],'px;border-bottom:1px solid #e2e2e2">',
					'<div class="view-fileupload-type-icon" style="',$.STYLE_BODY,'position:relative;width:54px;height:54px;top:',top[0],'px;left:',left[0],'px"><img src=',iconurl + iconStyle ,' /></div>',
					'<div class="view-fileupload-content" style="',$.STYLE_BODY,'position:relative;width:170px;height:54px;top:',top[1],'px;left:',left[1],'px;text-align:left">',
						'<span class="view-fileupload-title" title=',oldfile,' style="',$.STYLE_BODY,'cursor:pointer;color:#333333;font-size:12px;font-weight:bold;">',filename,'</span>',
						'<span class="view-fileupload-size" style="',$.STYLE_BODY,'color:#666666;font-size:12px">',size,'</span>',
						'<div class="view-fileupload-status" style="',$.STYLE_BODY + statusStyle,'position:relative;top:5px;left:-2px;color:#333333;font-size:12px">',status,'</div>',
						'<div class="view-fileupload-status-icon" style="',$.STYLE_BODY + statusStyle,'position:relative;width:20px;height:20px;top:-2px;left:-25px;background:url(',$.imageicon,') no-repeat ',statusIconPosition,'"></div>',
					'</div>',
				'</div>',
				'<div class="view-fileupload-body-bottom" style="',$.STYLE_BODY,'position:relative;width:',width,'px;height:',height[2],'px">',
					'<div class="view-fileupload-download" style="',$.STYLE_BODY,'width:auto;height:',height[2],'px;line-height:',height[2],'px;font-size:12px;color:#0681D7;text-align:right;margin-right:35px;cursor:pointer">',download,'</div>',
				'</div>',
			'</div>'].join("");

			bodyElement.append(html);
			//消息发送人不同，设置不同的bodyElement样式
			if (dest && userid) {
				bodyElement.parent().css({
					'padding': '0px',
					'border': 'none'
				});
			} else {
				bodyElement.parent().css({
					'padding': '2px',
					'border': '1px solid #78bde9'
				});
			}
			//尖角距离顶部15px
			var angle = liElement.find('.view-history-angle');
			//2016.03.30修改样式top值
			angle.css('margin-top', '0px');
			angle.parent().css('vertical-align', 'top');
			//原有的状态栏不显示
			liElement.find('.view-history-status-link').last().display(0);
			liElement.find('.view-history-status').last().display(0);
			//上传失败的消息提醒
			if ( !success ) {
				if ( data.error.maxSize ) {
					data.error.error = $.utils.handleLinks($.lang.news_trans_failure_size, {maxsize: data.error.maxSize / (1024 * 1024)});
				} else if ( data.error.ext ) {
					data.error.error = $.utils.handleLinks($.lang.news_trans_failure_type, {type: data.error.ext});
				}
				self.showMessage('system', {
					type:	9,
					msg:	'<span style="display:inline-block;width:20px;height:20px;position:relative;top:5px;background: url(' + $.imageicon + ') no-repeat ' + statusIconPosition + '"></span>' + data.error.error
				});
			}
			//下载按钮绑定下载事件
			bodyElement.find('.view-fileupload-download').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if ( success ) {
					if( typeof openURLToBrowser == "function" ){
						openURLToBrowser(data.sourceurl || data.url);
					}else{
					self.displayiFrame.attr('src', data.sourceurl || data.url);
				}
				}
			});
		},
		/**
		 * 获取输入框中光标位置
		 * @param  element input
		 * @return {number}
		 */
		_getPositionForTextArea: function(input){
			var start = 0;
			if( document.selection ){
				input.focus();
				var rang = document.selection.createRange();
				var dup = rang.duplicate();
				try{
					dup.moveToElementText(input);
				}catch(e){
				}
				start = -1;
				while (dup.inRange(rang)) {
					dup.moveStart('character');
					start++;
				}
			}else if( input.selectionStart || input.selectionStart == '0' ){
				start = input.selectionStart;
			}
			return start;
		},
		/**
		 * 设置光标栏置
		 * @param {HTMLDOM} input
		 * @param {number}  pos
		 */
		_setCursorPosition: function(input, pos){
			this._editorStart = pos;
			if(input.setSelectionRange){
				input.focus();
				input.setSelectionRange(pos, pos);
			}else if (input.createTextRange) {
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		},
		/**
		 * 插入消息内容、表情符号到输入框
		 * @param  {HTMLDOM} input 输入框对像引用
		 * @return {void}
		 */
		_insertText: function(content){
			var input = this.textEditor.get(0),
				text = input.value == $.lang.default_textarea_text ? '' : input.value,
				start = Math.min(text.length, this._editorStart)
			;
			start = start < 0 ? text.length : start;
			input.value = text.substr(0, start) + content + text.substr(start, text.length);
			if( !$.browser.mobile ){
				this._setCursorPosition(input, start + content.length);
				input.focus();
			}
		},
		/**
		 * @method createEvaluation 评价窗口内容
		 * @param  {json}   formOptions 表单配置项
		 * @param  {string} title       标题
		 * @param  {string} startColor  颜色
		 * @param  {string} endColor    颜色
		 * @param  {function} callback  回调
		 * @return {HTMLDOM}
		 */
		createEvaluation: function(formOptions, title, startColor, endColor, callback){
			var self = this,
				dialogElement,
				html = [
				'<div class="ntkf-alert-close" style="' + $.STYLE_NBODY + 'cursor:pointer;height:20px;position:absolute;right:5px;top:9px;width:20px;background:url(' + $.imageicon + ') no-repeat scroll -60px -61px;-moz-border-radius:0px;-webkit-border-radius:0px;border-radius:0px;"></div>',
				'<table border="0" cellpadding="0" cellspacing="0" style="' + $.STYLE_NBODY + 'margin:0px 0 10px 0;width:100%;table-layout:auto;border-collapse:separate;">',
				'<tbody style="', $.STYLE_NBODY, '">',
				'<tr style="',$.STYLE_NBODY,'">',
				'<td class="chat-view-evaluation-title" colspan="2" style="',$.STYLE_BODY,'text-align:center;height:39px;color:#fff;">',
				'<span style="',$.STYLE_BODY,'color:#000;font-weight:bold;font-size:14px;vertical-align:middle;">' + title + '</span>',
				'</td></tr>',
				$.FORM.createInput(formOptions),
				'<tr style="',$.STYLE_NBODY,'">',
					'<td colspan="2" style="',$.STYLE_BODY,'padding:5px 0;text-align:center;color:#333;">',
						'<input type="button" class="view-alert-submit" value="' + $.lang.evaluation_button_submit + '" style="' + $.STYLE_BODY + 'padding:0 15px;border:1px solid #878787;background:#ebe9e9;height:28px;color:#333;line-height:24px;" />',
					'</td></tr>',
					'</tbody>',
				'</table>'
			].join('');
			
			if( !this.evalDialog ){
				this.evalDialog = new $.DialogChat(html, {
					margin: 2,
					border: 3,
					style:  {
						border: '3px solid #00ACFF',
						height: 'auto'
					},
					parent: this.chatElement.get(0)
				});
			}
			dialogElement = this.evalDialog.container;
			
			//输入框可输入字符数提示
			for(var areaElement, i=0; i<formOptions.length; i++){
				if( formOptions[i].type == 'textarea' ){
					areaElement = dialogElement.find('table textarea[name=' + formOptions[i].name + ']').parent();
					//2014.11.26 输入字数提示节点需要父级节点为相对定位
					areaElement.css('position', 'relative');
					$({className: 'textarea-' + formOptions[i].name, maxsize: formOptions[i].max, style: $.STYLE_BODY + 'font-size:16px;font-weight:bold;color:#ccc;float:right;position:absolute;right:15px;top:70px;'}).appendTo( areaElement ).html('0/' + formOptions[i].max);
				}
			}
			dialogElement.find('table textarea').bind('keyup', function(event){
				var selector = 'table .textarea-' + $(this).attr('name');
				var color  = $.enLength($(this).val()) > dialogElement.find(selector).attr('maxsize') ? '#f00' : '#ccc';
				var inputText= $.enLength($(this).val()) + '/' + dialogElement.find(selector).attr('maxsize');
				
				dialogElement.find(selector).html( inputText ).css('color', color);
			});
			
			//bind form event
			$.FORM.bindFormEvent(formOptions, dialogElement);
			
			//set evaluation form focus
			dialogElement.find('input[type!=hidden],textarea').get(0).focus();
			
			dialogElement.find('.ntkf-alert-close').click(function(event){
				self.evalDialog.close();
				self.evalDialog = null;
			});
			dialogElement.find('.view-alert-submit').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//2016.02.14 预防重复点击评价
				if(self.evalRepeatClick){
					self.evalRepeatClick = false;
				self.mode.submitEvaluationForm(function(){
					if( $.isFunction(callback) ) callback();
					
					self.evalDialog.close();
					self.evalDialog = null;
						self.evalRepeatClick = true;
				});
				}

				
				//self._hiddenDialog();
			}).gradient("top", '#f5f5f5', '#ffffff');
			//应该标题栏皮肤样式
			dialogElement.find('.chat-view-evaluation-title').gradient("top", '#ffffff', '#f5f5f5');//startColor, endColor
			
			return dialogElement.get(0);
		},
		/**
		 * @method createFileButton 创建文件、图片上传按钮
		 * @param  {json} server 服务器地址集合
		 */
		createFileButton: function(server){
			//去掉脚本中MAXSIZE的传值
			this.objFile = this._createUpload(server, 'uploadfile', this.contains.find('.chat-view-file'));
			this.objImage = this._createUpload(server, 'uploadimage', this.contains.find('.chat-view-image'), 'image/jpg,image/png,image/gif,image/jpeg');
		},
		/**
		 * 创建文件图片上传节点
		 * @param  {json}        server   服务器地址
		 * @param  {string}      options  配置选项
		 * @param  {HTMLElement} parent   父级节点对像
		 * @param  {Number}      maxSize  允许上传的最大文件
		 * @param  {String}      accept   允许上传的文件
		 * @return {objTransfer}
		 */
		_createUpload: function(server, action, parent, maxSize, accept){
			var self = this;
			var options = {
				action: action,
				roomid: 'T2D',
				siteid: this.siteid,
				settingid:this.settingid,
				charset:$.charset
			};
			return !server.filetranserver ? null : new $.Transfer({
				server:	server.filetranserver + '/imageupload.php',
				name:	'userfile',
				maxSize:maxSize,
				accept:	accept,
				params:	options,
				onError:  function(result){
					//上传文件失败:类型不支持、超出最尺寸
					var chat = $.chatManage.get(options.settingid);
					chat && chat.uploadFailure(options.action, result);
				},
				onChange: function(data){
					//记录此次上传的文件名和大小
					self.uploadFileName = data.name;
					self.uploadFileSize = data.size;
				},
				callback: function(result){
					$.Log(options.settingid + '::jsonp: ' + $.JSON.toJSONString(result));
					
					var chat = $.chatManage.get(options.settingid);
					
					if( result.result == -2 || result.type == 9 ){
						//$.fIM_receiveUploadFailure('', options.action, {name: '', error: result.error}, options.settingid);
						chat && chat.uploadFailure(options.action, result);
					}else{
						//$.fIM_startSendFile('', options.action, result.oldfile, options.settingid);
						chat && chat.startUpload(options.action, result.oldfile);
			
						setTimeout(function(){
							//$.fIM_receiveUploadSuccess('', options.action, result, options.settingid);
							chat && chat.uploadSuccess(options.action, result);
						});
					}
				}
			}, parent);
		},
		/**
		 * 创建留言表单
		 * @param  {json}    formOptions     表单配置
		 * @param  {boolean} disableMessage  关闭留言
		 * @param  {string}  announcement    公告内容
		 * @param  {json}    data            表单默认数据
		 * @return {void}
		 */
		createMessageForm: function(formOptions, disableMessage, announcement, data){
			var self = this, html, td, tr, announHeight = 0;
			
			//进入留言，关闭评价弹窗
			if( this.evalDialog ){
				this.evalDialog.close();
				this.evalDialog = null;
			}
			
			if( this.messageElement.find('.chat-view-message-table table').length){
				return;
			}
			
			if( announcement ){
				announHeight = this.messageElement.find('.chat-view-message-announcement').html(announcement).display(1).height() + 20;
			}

			//set message div\style
			for(var i=0; i<formOptions.length; i++){
				formOptions[i] = $.extend(formOptions[i], {
					titlewidth:	/zh_cn|zh_tw/ig.test( $.lang['language'] ) ? '80px' : '140px',
					inputwidth: 'auto',
					input:{
						width:'90%',
						height:(formOptions[i].type=='textarea' ? '140px' : 'auto')
					},
					messageid:'chat-view-message-' + formOptions[i].name
				});
			}
			
			this.messageElement.find('.chat-view-submit-submit').gradient("top", '#f5f5f5', '#ffffff');
			this.messageElement.find('.chat-view-message-body').css('height', (this.messageElement.height() - announHeight) + 'px');
			this.messageElement.find('.chat-view-message-table').html( [
				'<table cellspacing="0" cellpadding="0" border="0" style="',$.STYLE_BODY,'margin:20px 0 0 0;width:100%;table-layout:auto;border-collapse:separate;">',
				'<tbody style="',$.STYLE_NBODY,'">',
				(disableMessage ?
					'' :
					[$.FORM.createInput( formOptions, null, $.lang.message_no_null ),
					'<tr style="',$.STYLE_NBODY,'">',
					'<td colspan="2" style="',$.STYLE_BODY,'text-align:center;padding:10px 0px 10px;color:#090;">',
						'<input style="' + $.STYLE_BODY + 'text-align:center;padding:0 20px;margin:0 auto;border:1px solid #878787;height:28px;color:#000;line-height:26px;" type="button" class="chat-view-button chat-view-submit-submit" value="' + $.lang.message_button_submit + '">',
						'<span class="submit_message_complete" style="',$.STYLE_BODY,'text-align:center;color:#090;display:none;">', $.lang['message_success'], '</span>',
					'</td></tr>'].join('')),
				'</tbody></table>'
			].join('') );
			
			this.messageElement.find('input[name=myuid]').val( data.myuid );
			this.messageElement.find('input[name=destuid]').val( data.destid );
			this.messageElement.find('input[name=ntkf_t2d_sid]').val( data.sessionid );
			this.messageElement.find('input[name=source]').val( data.source  );
			this.messageElement.find('input[type=text],textarea,select').css('color', '#ccc').attr('disabled', '');
			
			if( data.fileError ){
				//文件、图片上传后未激活聊窗(未连上TChat)
				tr = $({tag:'tr', style: $.STYLE_NBODY}).appendTo( this.messageElement.find('.chat-view-message-table tbody'), this.messageElement.find('.chat-view-message-table tbody tr').eq(-1) );
				td = $({tag:'td', style: $.STYLE_NBODY}).appendTo(tr);
				td = $({tag:'td', style: $.STYLE_NBODY}).appendTo(tr).html( [
					'<div style="',$.STYLE_BODY,'display:block;color:#ef7208;">',
						'<div style="',$.STYLE_BODY,'margin:2px;width:15px;height:15px;float:left;background:url(',$.imageicon,') no-repeat -160px -39px;"></div>',
						'<div style="',$.STYLE_BODY,'float:left;" class="chat-view-info">',$.lang.message_upload_failure,'</div>',
						'<div style="',$.STYLE_NBODY,'clear:both;height:0;width:0;"></div>',
					'</div>'
				].join('') );
			}
			
			this.messageElement.find('.chat-view-submit-submit').show(function(){
				$(this).css('display', $.browser.oldmsie ? 'inline-block' : 'block');
			});
			this.messageElement.find('.submit_message_complete').display();

			//bind event
			$.FORM.bindFormEvent(formOptions, this.messageElement);
			
			this.messageElement.find('.chat-view-submit-submit').click(function(event){
				self.mode.submitMessageForm();
			});
			//连接服务器失败时，消息放入留言框(默认留言表单只有一个多行文本框)
			this.messageElement.find('textarea').val( data.content );
		},
		/**
		 * 提交留言表单
		 * @param  {json}    formOptions     表单配置
		 * @param {string}   actionUrl       提交地址
		 * @return {void}
		 */
		submitMessageForm: function(formOptions, actionUrl){
			var self = this;
			
			$.FORM.verificationForm(formOptions, function(){
				self.messageElement.find('.chat-view-message-form').attr('action', actionUrl);
				self.messageElement.find('.chat-view-message-form').get(0).submit();
				$.Log('chatView.submitMessageForm complete', 1);
				
				self.messageElement.find('input[type=text],textarea,select').attr("disabled", true);
				self.messageElement.find('.chat-view-submit-submit').display();
				self.messageElement.find('.submit_message_complete').css('display', 'block');
			}, this.messageElement);
		},
		/**
		 * 全屏查看图片
		 * @param ImageDOM image
		 * @msgid 此张图片的msgid
                 * debug
		 */
		_fullScreenImage: function(image, msgid) {
		    var self = this,
		        container = this._createfullScreen(image),
		        src = $(image).attr('sourceurl') || image.src,
		        downloadImage = function() {
		            $.Log('download image ' + src);
		            if( typeof openURLToBrowser == "function" ){
		            	openURLToBrowser(src);
		            }else{
		            	self.displayiFrame.attr('src', src);
		            }	            
		        };

		    $.Log(this.settingid + ':chatView._fullScreenImage(), src:' + src, 1);

		    $('.view-fullScreen-background').css('opacity', 0.6);
		    container.click(function(event) {
		        $.Event.fixEvent(event).stopPropagation();
		        self._hideScreenImage();
		    }).find('.view-fullScreen-close').click(function(event) {
		        $.Event.fixEvent(event).stopPropagation();
		        self._hideScreenImage();
		    });

		    //如果不是第一次进入此方法，需要先移除左右翻页的按钮下的绑定的事件
		    if (this.nextClick && this.prevClick) {
		        container.find('.view-next-picture').removeEvent('click', this.nextClick);
		        container.find('.view-prev-picture').removeEvent('click', this.prevClick);
		    }

		    //下一张图片
		    this.nextClick = function(event) {
		        $.Event.fixEvent(event).stopPropagation();
		        var nextMsgId = 0;
		        var timeSub = 10000000;
		        for (hashMsgId in self.imageHash) {
		            var hashTime = parseInt(hashMsgId.substr(0, msgid.length - 1))
		            var time = parseInt(msgid.substr(0, msgid.length - 1));
		            if (hashTime - time > 0 && hashTime - time < timeSub) {
		                nextMsgId = hashMsgId;
		                timeSub = (hashTime - time);
		            }
		        }
		        if (nextMsgId == 0) {
		            self._hideScreenImage();
		        } else {
		            self._fullScreenImage($('.' + nextMsgId).find('.view-history-body').find('img'), nextMsgId);
		        }
		    };


		    //上一张图片
		    this.prevClick = function(event) {
		        $.Event.fixEvent(event).stopPropagation();
		        var lastMsgId = 0;
		        var timeSub = -10000000;
		        for (hashMsgId in self.imageHash) {
		            var hashTime = parseInt(hashMsgId.substr(0, msgid.length - 1))
		            var time = parseInt(msgid.substr(0, msgid.length - 1));
		            if (hashTime - time < 0 && hashTime - time > timeSub) {
		                lastMsgId = hashMsgId;
		                timeSub = (hashTime - time);
		            }
		        }
		        if (lastMsgId == 0) {
		            self._hideScreenImage();
		        } else {
		            self._fullScreenImage($('.' + lastMsgId).find('.view-history-body').find('img'), lastMsgId);
		        }
		    };

		    container.find('.view-next-picture').addEvent('click', this.nextClick);
		    container.find('.view-prev-picture').addEvent('click', this.prevClick);

		    container.find('.view-fullScreen-download').removeEvent('click', downloadImage).bind('click', downloadImage);
		    $(document).bind('keypress', function(event) {
		        if ($.Event.fixEvent(event).keyCode != 27) {
		            return;
		        }
		        self._hideScreenImage();
		    });
		    $(window).bind('resize', function(event) {
		        $('.view-fullScreen-background,.view-fullScreen-iframe,.view-fullScreen-container').css({
		            width: $(window).width() + 'px',
		            height: $(window).height() + 'px'
		        });
		    });

		    if (container.find('img').attr('src') == src) {
		        return;
		    }
		  	container.find('td').css({
	             	'background':'url('+ $.loadingGif + ') no-repeat center center'
	                  });
         
		    $.require(src + '#image', function(element) {
		        $.Log('nTalk._fullScreenImage() width:' + element.width + ', height:' + element.height);
		        var maxw = $(window).width(),
		            maxh = $(window).height(),
		            attr = $.zoom(element, maxw - 100, maxh);
                  //2016.03.29 加载条隐藏
			   	container.find('td').css({
	             	'background':'url('+ $.loadingGif + ') no-repeat center center'
	                  });
			   
		        //由于container中添加了左右按钮，改为append
		        container.find('td').append('<img src="' + src + '" width="' + Math.floor(attr.width) + '" height="' + Math.floor(attr.height) + '" style="' + $.STYLE_NBODY + 'margin:0 auto;" />');
		         //2016.03.29 加载条隐藏
			     if(container.find('td img')){
			     	container.find('td').css({
	             	'background-image':''
	                  });
			     }
		    });
		      

		},
		/**
		 * 关闭全屏图片查看
		 * @param ImageDOM image
		 */
		_hideScreenImage: function(){
			$('.view-fullScreen-container,.view-fullScreen-background,.view-fullScreen-iframe').display();
		},
		/**
		 * 创建全屏图片查看视图
		 * @return {void}
		 */
		_createfullScreen: function(){
			var self = this,
				width = $(window).width(),
				height = $(window).height();
			
			if( !$('.view-fullScreen-iframe').length ){
				$({tag:'iframe', className: 'view-fullScreen-iframe', style:$.STYLE_NBODY + 'display:none;width:' + width + 'px;height:' + height + 'px;'}).appendTo(true).fixed();
			}
			if( $('.view-fullScreen-background').length ){
				$('.view-fullScreen-background').display(1);
			}else{
				$({className: 'view-fullScreen-background', style: $.STYLE_NBODY + 'background:#000;opacity:0.6;filter:alpha(opacity=60);width:' + width + 'px;height:' + height + 'px;position:absolute;top:0;left:0;z-index:2000000000;'}).appendTo(true).fixed();
			}
			if( $('.view-fullScreen-container').length ){
				//2014.09.25 全屏查看图片时，清除上一次图片
				$('.view-fullScreen-container img').remove();
				//2016.03.29 增加第二次打开图片时的设置
				 if($('.view-fullScreen-container').width()!=width){

                    $('.view-fullScreen-container').css('width', width+'px');
                }
                if($('.view-fullScreen-container').height()!=height){
                	$('.view-fullScreen-container').css('height', height+'px');
                }
				$('.view-fullScreen-container').display(1);
			}else{
				$({className: 'view-fullScreen-container', style:$.STYLE_NBODY + 'width:' + width + 'px;height:' + height + 'px;text-align:center;position:absolute;top:0px;left:0;z-index:2000000001;'}).appendTo(true).html([
				'<table style="',$.STYLE_NBODY,'width:100%;height:100%;table-layout:auto;border-collapse:separate;">',
					'<tbody style="',$.STYLE_NBODY,'">',
					'<tr style="',$.STYLE_NBODY,'">',
					'<td valign="middle" align="center" style="',$.STYLE_NBODY,'text-align:center;vertical-align:middle;background:url(',$.loadingGif,') no-repeat center center;">',
					//添加前后翻页按钮
					'<div class="view-prev-picture" style="',$.STYLE_NBODY,'-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;position:absolute;width:50px;height:100%;bottom:0px;top:0px;left:0px">',
					'<div style="position:relative;width:50px; height:40px;top:' + ($(window).height() - 40)/2 + 'px;background:url(',$.imageicon,') no-repeat -225px -92px"></div>',
					'</div>',
					'<div class="view-next-picture" style="',$.STYLE_NBODY,'-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;position:absolute;width:50px;height:100%;bottom:0px;top:0px;right:0px">',
					'<div style="position:relative;width:50px; height:40px;top:' + ($(window).height() - 40)/2 + 'px;background:url(',$.imageicon,') no-repeat -178px -92px"></div>',
					'</div>',
					'</td></tr></table>',
					'<span class="view-fullScreen-close" style="',$.STYLE_NBODY,'position:absolute;width:28px;height:28px;margin:20px 20px 0 0;top:0;right:0;cursor:pointer;background:url(',$.imageicon,') no-repeat scroll -259px 0;z-index:2000000001;"></span>',
					'<span class="view-fullScreen-download"  style="',$.STYLE_NBODY,'position:absolute;width:28px;height:28px;margin:20px 20px 0 0;top:0;right:50px;cursor:pointer;background:url(',$.imageicon,') no-repeat scroll -219px 0;z-index:2000000001;"></span>'
				].join('')).fixed();
			}
			
			return $('.view-fullScreen-container');
		},
		/**
		 * 聊窗消息模板
		 * @param  {string} type 模板类型
		 * @param  {json}   data 消息类型
		 * @return {void}
		 * 调整样式，支持多语言
		 */
		_getMessageHtml: function(type, data){
			var l, fix = '';
			var systemMsgLength = $.browser.oldmsie ?  Math.min($.enLength($.clearHtml(data.msg)) * 6, 340) + 'px' : 'auto';
			if( type === 'otherinfo' ){
				type = 'left';
				data.userid = '';
				data.name = '';
				data.msg = [//faq信息
					'<h1 style="',$.STYLE_BODY,'">',
					'<span style="',$.STYLE_NBODY,'float:left;margin-right:5px;width:15px;height:15px;background:transparent url(',$.imageicon,') no-repeat -199px -38px;"></span>',
					'<span style="',$.STYLE_BODY,'font-weight:bold;">',data.title,'</span>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />',
					'</h1>',
					'<p style="',$.STYLE_BODY,'">', data.msg, '</p>'
				].join('');
			}
			
			if(data.type == 7) data.type = 1;
			
			return type === 'right' ?
				[//发送的消息
					'<table style="',$.STYLE_NBODY,'float:right;_float:none;border-collapse:separate;" class="view-history-right" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'text-align:right;">',
							'<tr style="',$.STYLE_NBODY,'">',
							//2016.03.11更改颜色更改border 顏色值 添加color 值if(data.type == 7) data.type = 1;
								'<td class="view-history-content" style="',$.STYLE_BODY,'padding:8px;background:#38ce91;border:1px solid #38ce91;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;">',
									'<div class="view-history-body" style="min-height:20px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;/*width:100px;*/min-height:50px;height:85px;*font-size:0px;*line-height:0px;*font-family:"方正兰亭中黑";' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;',
									(data.type == 1 ? 'color:#' + data.color + ';font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' ' + data.fontsize + 'px/160% Arial,SimSun;font-size:12px;color:#ffffff;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									(data.type==1 
									? data.msg 
									: data.type==6 
										? ['<div style="' + $.STYLE_NBODY + 'width:200px;height:40px;overflow:hidden;">',
										'<div class="view-history-audio" style="',$.STYLE_BODY,'float:left;min-width:1px;height:40px;overflow:hidden;">',
										'<video controls="controls" width="200" height="40" style="' + $.STYLE_NBODY + 'width:200px;height:40px;" src="',
										($.browser.opera || $.browser.firefox ? data.url : data.sourceurl),
										'"></video></div>',
										'</div>'].join('')
										: ''),
									'</div>',
									'<div class="view-history-progress" style="',$.STYLE_NBODY,'display:none;border-top:1px solid #30c2fd;background:#fff;height:5px">',
										'<div class="view-history-upload-progress" style="',$.STYLE_NBODY,'height:5px;width:20%;background:#30c2fd;"></div>',
									'</div>',
								'</td>',
								'<td style="',$.STYLE_NBODY,'width:10px;vertical-align:top;overflow:visible;">',
									
									//尖角添加className
									'<div class="view-history-angle" style="',$.STYLE_NBODY,'position:relative;left:-1px;z-index:1;width:10px;height:18px;background:url(',$.imageicon,') no-repeat -1px -62px;"></div>',//
									
								'</td>',
								'<td style="',$.STYLE_NBODY,'width:54px;vertical-align:top;overflow:visible;">',
								//2016.03.31更改样式增加td//2016.03.18增加头像
								   '<div style="',$.STYLE_NBODY,'margin-right:14px;width:40px; height:40px; position:relative; bottom:0; background:url(',$.imageicon,') no-repeat -325px 0px; border-radius:50%;"></div>',
								'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_BODY,'overflow:visible;text-align:right;position:relative;">',
								  '<span class="view-chat-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:26px;overflow:visible;position:relative;top:0px;">',
										'<div class="view-history-status" style="',$.STYLE_BODY,'display:none;color:#010002;line-height:26px;width:280px;position:absolute;left:-280px;top:-17px;">',
											'<div class="view-history-status-link" style="',$.STYLE_BODY,'float:right;line-height:26px;height:26px;"></div>',
											'<div class="view-history-status-icon" style="',$.STYLE_NBODY,'margin:7px 3px;float:right;display:block;line-height:26px;width:10px;height:10px;background:#fff url(',$.imageicon,') no-repeat -140px -39px;"></div>',
										'</div>',
									'</span>',
								//2017.05.16 隐藏访客名称
									// '<span class="view-history-nowDestname" style="',$.STYLE_BODY,'color:#999999;line-height:26px;font-family:',"方正兰亭中黑",';font-size:10px;">',
                                     //('\u672a\u767b\u5f55\u9f50\u5bb6\u7f51\u53cb' ||this.mode.user.name ),
                                    // ( $.global.uname || 'O\u7C89\u513F' ),
                                    // '</span>',
								  //2016.03.11更改颜色
									'<span class="view-history-time" style="',$.STYLE_BODY,'padding-left:6px;color:#999999;line-height:26px;font-size:10px;">',$.formatDate(data.timerkeyid),'</span>',
									
								'</td>',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_NBODY,'"></td>',//null
							'</tr>',
						'</tbody>',
					'</table>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				/left|bottom/gi.test(type) ?
				[//接收的消息
					'<table style="',$.STYLE_NBODY,'float:left;float:none;table-layout:auto;border-collapse:separate;" class="view-history-left" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'">',
							'<tr style="',$.STYLE_NBODY,'">',
							    '<td style="',$.STYLE_NBODY,'width:48px;height:40px;vertical-align:bottom;vertical-align:top;overflow:visible;">',
                                       //2016.03.22增加头像 背景图片更改 29更改图片大小
									'<div class="view-history-div" style="',$.STYLE_NBODY,'float:left;margin-left:8px; -margin-left:7px; width:40px; height:40px; display:inline-block; position:relative; top:0;border-radius:50%">',
                                     (data.logo ? ['<img data-single="1" onerror="nTalk.loadImageAbnormal(this, event)" class="view-history-receive-icon" userid="', data.userid, '" src="', data.logo, '" style="', $.STYLE_NBODY, 'width:38px; height:38px;border:solid 1px #ffffff;border-radius:20px;" />'].join('') :''),
                                   '</div>',
							    '</td>',
							   '<td style="',$.STYLE_NBODY,'width:10px;height:40px;vertical-align:bottom;vertical-align:top;overflow:visible;">',
									//2016.03.18更改垂直方向的位置
									//尖角添加className
									'<div class="view-history-angle" style="',$.STYLE_NBODY,'flaot:right;position:relative;top:0px;z-index:1;display:inline-block;width:10px;height:18px;background:url(',$.imageicon,') no-repeat -30px -62px;"></div>',
								'</td>',
								'<td class="view-history-content" style="',$.STYLE_BODY,'padding:8px;background:#ffffff;border:1px solid #ffffff;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px">',
									'<div class="view-history-body" style="min-height:20px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;/*width:100px;*/min-height:50px;height:85px;*font-size:0px;*line-height:0px;*font-family:Arial;' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;',(type=='bottom' ? 'width:60px;' : ''),
									(data.type == 1 ? 'color:#' + data.color + ';color:#4d4d4d;font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' ' + data.fontsize + 'px/160%' + ' ' + '"方正兰亭中黑",SimSun;color:#4d4d4d;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									(/^(1|9)$/i.test(data.type) ? data.msg : ''),
									'</div>',
								'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_BODY,'overflow:visible;position:relative;">',
									'<span class="view-history-more" style="',$.STYLE_BODY,'margin-right:5px;float:left;color:blue;cursor:pointer;line-height:26px;display:none;">',$.lang.button_more,'</span>',
									//2017.05.16 隐藏客服名称
								// 	'<span class="view-history-nowDestname" style="',$.STYLE_BODY,'float:left;color:#999999;line-height:26px;font-size:10px;">',
                                //    (data.name || this.mode.dest.name),
                                //     '</span>',
								// 	//接收到非当前客服的消息时，显示客服名
								// 	(data.userid && !this.mode.isVisitor(data.userid)&&this.mode.dest.id!=data.userid ?
								// 		['<span class="view-history-destname" style="',$.STYLE_BODY,'padding-right:5px;float:left;color:#b9b9c1;line-height:26px;">',
								// 			data.name,
								// 		'</span>'].join('') :
								// 	''),
									
									//2016.03.11更改颜色
									'<span class="view-history-time" style="',$.STYLE_BODY,'padding-left:6px;float:left;color:#999999;line-height:26px;font-size:10px;">',
										//客服输入状态消息不显示时间
										(type=='bottom' ? '' : $.formatDate(data.timestamp || data.timerkeyid)),
									'</span>',
									'<span class="view-chat-hidden-area" style="',$.STYLE_NBODY,'float:left;width:1px;height:26px;overflow:visible;position:absolute;">',
										'<div class="view-history-status" style="',$.STYLE_BODY,'display:none;color:#010002;line-height:26px;height:26px;width:280px;position:absolute;left:0px;top:0px;">',
											'<div class="view-history-status-icon" style="',$.STYLE_NBODY,'margin:7px 3px;float:left;line-height:26px;display:block;width:10px;height:10px;background:url(',$.imageicon,') no-repeat -140px -39px;"></div>',
											'<div class="view-history-status-link" style="',$.STYLE_BODY,'float:left;line-height:26px;height:26px;">',
											( /^(2|4)$/i.test(data.type)&&!data.emotion ?
												['<a href="javascript:void(0);" style="',$.STYLE_BODY,'">',$.lang.news_download,'</a>'].join('') :
												[''].join('')
											),
											'</div>',
										'</div>',
									'</span>',
								'</td>',
							'</tr>',
						'</tbody>',
					'</table>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				type === 'first' ?
				[//系统消息:公众形像
					'<div class="view-history-system" style="',$.STYLE_BODY,'background:transparent;line-height:180%;marign:0 auto;padding:20px 0;text-align:center;word-break:break-all;word-wrap:break-word;">',
						data.msg,
					'</div>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				type === 'goods' ?
				[//商品信息
					'<table style="',$.STYLE_NBODY,'float:left;width:100%;table-layout:auto;border-collapse:separate;" class="view-history-goods" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'text-align:center;">',
						'<tr style="',$.STYLE_NBODY,'">',
						'<td class="view-history-goods-image" style="',$.STYLE_BODY,'width:50%;min-width:150px;text-align:center;"></td>',
						'<td class="view-history-goods-info" style="',$.STYLE_BODY,'width:50%;text-align:left;"></td>',
						'</tr>',
						'<tr style="',$.STYLE_NBODY,'"><td colspan="2" style="',$.STYLE_NBODY,'height:10px;width:100%;"><div style="',$.STYLE_BODY,'margin:0 auto;background:#FFF url(',$.imageicon,') no-repeat 85px -80px;height:10px;width:391px;"></div></td></tr>',
						'</tbody>',
					'</table>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				[//系统消息2
					'<div class="view-history-system" style="',$.STYLE_BODY,'marign:20px 0;text-align:center;color:#706E6F;">',
						'<fieldset style="',$.STYLE_BODY,'margin:0 0 10px 0;text-align:center;border-top:1px solid #ccc;">',
							'<legend style="',$.STYLE_BODY,'margin:0 auto;text-align:center;word-break: normal;word-wrap:break-word;font:normal normal normal 12px/160% Arial,SimSun;color:#706e6f;width:',systemMsgLength,';overflow-x:hidden;display:block;" align="center">',
							'<div style="',$.STYLE_BODY,'text-align:center;word-break: normal;word-wrap:break-word;color:#706e6f;width:',systemMsgLength,';overflow-x:hidden;">',data.msg, '</div>',
							'</legend>',
						'</fieldset>',
					'</div>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('');
		},
		/**
		 * @method _getViewHtml  聊窗HTML
		 * @param  {string} type 聊窗视图类型
		 * @return {string}      聊窗视图HTML
		 */
		_getViewHtml: function(type){
			var CON_STYLE_SHADOW = $.browser.msie&&$.browser.ieversion<=8 ? '' : 'box-shadow:inset 0px 0px 5px #aaa;-moz-box-shadow:inset 0px 0px 5px #aaa;-webkit-box-shadow:inset 0px 0px 5px #aaa;';

			return type=='load' ?
				[
					'<div class="chat-view-load-icon" style="',$.STYLE_NBODY,'margin:0 auto;width:100px;height:33px;background:transparent url(',$.loadingGif,') no-repeat 0px 0px;"></div>',
					'<div class="chat-view-load-info" style="',$.STYLE_BODY,'text-align:center;">',$.lang.chat_info_loading,'</div>',
					'<div class="chat-view-load-error" style="',$.STYLE_BODY,'text-align:center;margin:120px auto 0;display:none;">',$.lang.chat_info_failure,'<!--<span style="',$.STYLE_BODY,'cursor:pointer;color:#005ffb;text-decoration:none;">',$.lang.chat_info_reload,'</span>--></div>'
				].join('') :
				type=='window' ?
				[
					//显示聊天记录
					'<div class="chat-view-float-history" style="',$.STYLE_BODY,'width:100%;height:270px;height:267px\\0;_height:269px;background:#fff;padding-top:1px solid #fff\\0;position:absolute;overflow:hidden;z-index:99;display:none;box-shadow:0 5px 3px #888888;">',
						'<iframe class="chat-view-float-iframe" scrolling="no" frameborder="0" style="',$.STYLE_BODY,'display:block;width:100%;height:100%;">',
						'</iframe>',
					'</div>',
					'<div class="chat-view-window-history" style="',$.STYLE_BODY,'width:100%;height:270px;height:267px\\0;_height:269px;background-repeat:no-repeat;background-position:center bottom; padding-top:1px solid #fff\\0;position:relative;overflow-x:hidden;overflow-y:scroll;">',
						'<ul style="',$.STYLE_NBODY,'list-style:none;margin:10px 0px 10px 0px;">',
							//'<li style="',$.STYLE_NBODY,'list-style:none;"></li>',
						'</ul>',
					'</div>',
					//2016.03.11更改border 的颜色
					'<div class="chat-view-window-toolbar" style="',$.STYLE_BODY,'height:28px;width:100%;border-top:1px solid #ffffff;background:#ffffff;">',
						//分配客服时状态消息
						//2017-05-16 xiu
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-window-status-info" style="',$.STYLE_BODY,'background:#2CAA76;overflow:hidden;color:#fff;margin-left:10px;width:380px;line-height:30px;height:30px;position:absolute;top:-30px;z-index:99;text-align:center;display:none;"></div>',
						'</div>',
						//2015.01.05 添加输入提示建议 3.21更改margin 值
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-suggest-list chat-view-span" style="',$.STYLE_NBODY,'border:1px solid #999;background:#fafafa;width:440px;line-height:30px;height:auto;position:absolute;top:-88px;left:0px;z-index:999;display:none;">',
								'<ul style="',$.STYLE_BODY,'list-style:none;"></ul>',
							'</div>',
						'</div>',
						//2016.03.15修改padding margin 高度
						'<div class="chat-view-button chat-view-face" title=',$.lang.button_face,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:3px 0 3px 6px;_margin-left:5px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -95px 2px;padding:2px;">',
							'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-window-face" style="',$.STYLE_NBODY,'display:none;position:absolute;left:-11px;top:-229px;border:1px solid #979A9E;width:273px;height:224px;background:#fff;z-index:1000002;cursor:auto;border-radius:3px;overflow:hidden;">',
									
								'</div>',
							'</div>',
						'</div>',
						//2016 更改图标padding 值
						'<div class="chat-view-button chat-view-image" title=',$.lang.button_image,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -118px 2px;padding:2px;"></div>',
						'<div class="chat-view-button chat-view-file" title=',$.lang.button_file,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:17px;display:inline-block;cursor:pointer;width:15px;background:url(',$.imageicon,') no-repeat -140px 2px;padding:2px;"></div>',
						//2016.03.21更改位置
						'<div class="chat-view-button chat-view-capture" title=',$.lang.button_captureImage,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -159px 2px;padding:2px;"></div>',
						/*'<div class="chat-view-capture-options" style="',$.STYLE_BODY,'color:#525252;float:left;margin:8px 0 4px 0px;border:0px solid #ccc;height:16px;display:inline-block;cursor:pointer;">',
							'▼',
							'<div class="chat-view-capture-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:1px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-options-capture-menu" style="',$.STYLE_BODY,'display:none;padding:1px;background:#fff;position:absolute;left:-89px;top:-79px;border:1px solid #ccc;width:100px;*width:102px;_width:102px;height:auto;z-index:1000002;cursor:cursor;">',
									//截图方式
									'<div class="view-option-hidden talk_selected" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;background:#efefef;">',$.lang.button_capture_hidden_chatWin,'</div>',/*',隐藏窗口,'*/
									/*'<div class="view-option-show" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;">',$.lang.button_capture_show_chatWin,'</div>',/*',不隐藏窗口,'*/
								/*'</div>',
							'</div>',
						'</div>',*/
						'<div class="chat-view-button chat-view-evaluate" title=',$.lang.button_evaluation,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:18px;display:inline-block;cursor:pointer;width:15px;background:url(',$.imageicon,') no-repeat -180px 2px;padding:4px 5px 0px 4px;"></div>',
						'<div class="chat-view-button chat-view-history" title=',$.lang.button_save,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -200px 2px;padding:2px;"></div>',
						//2014.11.11 添加查看聊天记录按钮
						'<div class="chat-view-button chat-view-load-history" title=',$.lang.button_view,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -220px -40px;padding:2px;"></div>',
						
						
						//2015.01.06 机器要转人工客服按钮
						'<div class="chat-view-switch-manual chat-view-robot-button" title="',$.lang.button_switch_manual,'" style="',$.STYLE_BODY,'color:#525252;float:left;padding:0 0 0 20px;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:auto;background:url(',$.imageicon,') no-repeat -265px -40px;display:none;">',$.lang.button_switch_manual,'</div>',
						'<div class="chat-view-button chat-view-change-csr" title=',$.lang.button_change_csr,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 6px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -243px -40px;"></div>',
						//2017.05.15 隐藏更多按钮
						/* '<div class="chat-view-button chat-view-exp" style="',$.STYLE_BODY,'color:#525252;float:right;margin:4px 3px;padding:0 3px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;font-family">',$.lang.button_more,' &gt;</div>',*/
					'</div>',
					//2016.03.11 更改高度和padding值 
					'<div class="chat-view-window-editor" style="',$.STYLE_BODY,'height:65px;width:100%;overflow:hidden;">',
						//2016.03.22更改固定文字 更改颜色
						'<textarea placeholder="\u6211\u6709\u95ee\u9898\uff0c\u6211\u8981\u95ee\u002e\u002e\u002e" style="',$.STYLE_BODY,CON_STYLE_SHADOW,'margin:1px;padding:10px 10px 0 10px;width:391px;width:411px\\9;height:73px;height:93px\\9;outline:0px solid #08f;border:0px solid #08f;color:#999999;font-family:',"方正兰亭中黑",'resize:none;overflow:hidden;"></textarea>',
					'</div>',
					'<div class="chat-view-window-bottom" style="',$.STYLE_BODY,'height:40px;width:100%;background:#f9f9f9;border-radius:0px 0px 0px 5px;-moz-border-radius:0px 0px 0px 5px;-webkit-border-radius:0px 0px 0px 5px">',
					//2016.03.21 注释
					/*	'<div class="chat-view-options" style="',$.STYLE_BODY,'margin:6px 10px 6px 0;float:right;border:1px solid #ccc;width:14px;height:26px;line-height:25px;text-align:center;cursor:pointer;">',
							'▼',
							'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:1px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-options-menu" style="',$.STYLE_BODY,'display:none;padding:1px;background:#fff;position:absolute;left:-89px;top:-79px;border:1px solid #ccc;width:100px;*width:102px;_width:102px;height:auto;z-index:1000002;cursor:cursor;">',
									//发送消息方式
									'<div class="view-option-enter talk_selected" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;background:#efefef;">',$.lang.button_enter,'</div>',
									'<div class="view-option-ctrl+enter" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;">',$.lang.button_ctrl_enter,'</div>',
								'</div>',
							'</div>',
						'</div>',*/
						'<div class="chat-view-submit" style="',$.STYLE_BODY,'margin:4px 0;margin-left: 6px;float:right;width:auto;height:26px;line-height:26px;text-align:center;padding:0 24px;border:1px #CCC solid;border-right:none;cursor:pointer;">'
						//2016.03.22更改固定字体
						,'\u53d1\u9001\u0028\u0053\u0029',
						'</div>',
						//2016.03.10 修改背景颜色' ,$.lang.button_end_session,'
						'<span class="chat-view-end-session" style="',$.STYLE_BODY,'border:1px solid #ebedec;color: #3b3b3b;text-decoration:none;margin:4px 10px 8px 0;padding:0 10px;float:right;height:24px;line-height:24px;cursor:pointer;background-color:#f3f3f3;">\u7ed3\u675f\u5bf9\u8bdd</span>',
						//2016.03.22修改颜色
						'<span class="chat-view-xiaoneng-version" style="',$.STYLE_BODY,'display:block;visibility:visible;text-decoration:none;margin:4px 0px 6px 10px;float:left;height:26px;line-height:26px;color:#999999;visibility:hidden;">\u5bf9\u65b9\u6b63\u5728\u8f93\u5165\u4fe1\u606f\u002e\u002e\u002e</span>',
						'<div style="',$.STYLE_NBODY,'clear:both;"></div>',
					'</div>'
				].join('') :
				type=='message' ? [
					'<div class="chat-view-message-announcement" style="',$.STYLE_BODY,'margin:10px 20px 10px 20px;height:auto;max-height:200px;overflow:hidden;display:none;"></div>',
					'<div class="chat-view-message-body" style="',$.STYLE_BODY,'overflow-x:hidden;overflow-y:auto;width:100%;">',
					'<form name="chat-view-message-form" action="" enctype="multipart/form-data" target="chat-view-submit-iframe" method="post" class="chat-view-message-form" style="',$.STYLE_NBODY,'display:block;">',
						'<input type="hidden" value="' + $.charset + '" name="charset" />',
						'<input type="hidden" value="' + $.source + '" name="parentpageurl" />',
						'<input type="hidden" value="" name="myuid" />',
						'<input type="hidden" value="" name="destuid" />',
						'<input type="hidden" value="" name="ntkf_t2d_sid" />',
						'<input type="hidden" value="" name="source" />',
						'<input type="hidden" value="' + this.settingid + '" name="settingid" />',
						'<div class="chat-view-message-table" style="',$.STYLE_BODY,'width:100%;"></div>',
					'</form>',
					'</div>'
				].join('') :
				[
					//Alter
					'<iframe class="ntkf-alert-iframe" style="',$.STYLE_BODY,'display:none;position:absolute;left:0;top:0;width:100%;height:464px;-moz-opacity:0;opacity:0;filter:alpha(opacity=0);z-index:88888;">',
					'</iframe>',
					'<div class="ntkf-alert-background" style="',$.STYLE_BODY,'display:none;position:absolute;left:0;top:0;width:100%;height:464px;background:#000;-moz-opacity:0.35;opacity:0.35;filter:alpha(opacity=35);z-index:99999;">',
					'</div>',
					'<div class="ntkf-alert-container" style="',$.STYLE_BODY,'display:none;position:absolute;left:2px;top:0;width:100%;min-height:260px;height:auto;-moz-opacity:1;opacity:1;filter:alpha(opacity=100);border:3px solid #00acff;z-index:2000000000;background:#fff;">',
					'</div>'
				].join('');
		},
		/**
		 * @method _bind    绑定事件
		 * @return {void}
		 */
		_bind: function(){
			var self = this;

			this.textEditor = this.chatElement.find('.chat-view-window-editor textarea').css({
				width: $.browser.Quirks ? '411px' : '391px',
				height:$.browser.Quirks ? '93px' : '73px'
			}).bind('keypress', function(event){
				event = $.Event.fixEvent(event);
				event.stopPropagation();
				
				if( event.keyCode == 13 && event.shitfKey ){
					//Enter
				}else if( self._sendKey == 'Enter' ){
					if( (event.keyCode == 13 && event.ctrlKey) || event.keyCode == 10 ){
						//--IE下\r\n后无字符时，用户只看到一个空格，未换行
						self.textEditor.val( self.textEditor.val() + "\r\n" );
					}
					else if( event.keyCode == 13 ){
						event.preventDefault();
						self._send();
					}
				}else if( self._sendKey == 'Ctrl+Enter' ){
					if( /^(10|13)$/.test(event.keyCode) && event.ctrlKey ){
						event.preventDefault();
						self._send();
					}
				}
				
				self._editorStart = self._getPositionForTextArea(this) + 1;
				//$.Log('set editorStart:' + self._editorStart, 1);
			}).bind('keyup', function(event){
				event = $.Event.fixEvent(event);
				//按键时，清除超出最大输入值内容
				var keyCode  = event.keyCode,
					enLength = $.enLength($(this).val()),
					selectIndex = 0
				;
				if( enLength > self.mode.inputMaxByte ){
					$(this).val( $.enCut($(this).val(), self.mode.inputMaxByte) );
				}
				//2015.07.02 按上下方向键时，机器人输入提示选中项可上下移动
				if( keyCode == 38 ){
					event.preventDefault();
					self._selectSuggest(-1);
				}else if( keyCode == 40 ){
					event.preventDefault();
					self._selectSuggest(1);
				}
			}).bind('click', function(){
				self._editorStart = self._getPositionForTextArea(this);
				
				//$.Log('set editorStart:' + self._editorStart, 1);
			}).bind('focus', function(){
				$.promptwindow.stopPrompt();
				self.chatElement.find('.chat-view-hidden-area .chat-view-span').display();
				
				var css = {color:'#333333'};
				if( $.browser.msie && $.browser.ieversion<=7 ){
					//2016.03.11消除点击时的边框border为0
					$(this).css($.merge(css, {
						'width':	($(this).parent().width() - 26) + 'px',
						'height':	($(this).parent().height() - 26) + 'px',
						'border-width': '0px'
					}));
				}else{
					//2016.03.11消除点击时的边框border为0
					$(this).css($.merge(css, {"outline-width": "0px"}));
				}
				if( !$.browser.html5 ){
					//模拟提未文件会在拖动文本、图片进入textarea区后，提示文本未清除
					if( $(this).val() == $.lang.default_textarea_text ){
						$(this).val('');
					}
				}
				
				//2015.09.10 获取焦点时，开始监听
				self._listenTextEditor();
			}).bind('blur', function(){
				if( !$.browser.html5 ){
					if( $(this).val() === '' ){
						$(this).val($.lang.default_textarea_text);
					}
					if( $(this).val() == $.lang.default_textarea_text ){
						$(this).css({'color': '#ccc'});
					}
				}
				if( $.browser.msie && $.browser.ieversion<=7 ){
					$(this).css({
						"border-width": '0px',
						'width':	($(this).parent().width() - 24) + 'px',
						'height':	($(this).parent().height() - 24) + 'px'
					});
				}else{
					$(this).css({"outline-width": "0"});
				}
				
				self._stopListen();
			}).bind('paste', function(e){
				var pasteCallback = function(base64) {
					if(!base64) return;

					$.pasteBase64 = base64;
					var c_top = ($(window).height()-510) / 2;
					var t_top = c_top + 480;
					var left = ($(window).width()-640) / 2;
					var ensurePicHtml = [
						'<div class="pastepic-background" style="width:100%;height:100%;position:absolute;top:0px;left:0px;background-color:#000;opacity:0.6;z-index:5000000;display:none;color:#FFF;"></div>',
						'<div class="pastepic-container" style="top:',c_top,'px;left:',left,'px;width:640px;height:480px;background-color:#fff;text-align:center;z-index:5000000;margin:auto;position:absolute;display:none;">',
					    	'<img class="pastepic-show" style="max-width:640px;max-height:480px;" src=""></img>',
					    '</div>',
					    '<div class="pastepic-toolbar" style="top:',t_top,'px;left:',left,'px;width:640px;height:30px;position:absolute;z-index:5000000;margin:auto;text-align:right;background-color:transparent;display:none;">',
					    	'<div class="pastepic-toolbar-main" style="width:320px;height:30px;line-height:30px;position:relative;float:right;background-color:#F9F9F9;">',
					    		'<span class="pastepic-describe" style="font-size:12px;font-weight:bold;color:#333333;float:left;margin-left:10px;">是否粘贴此图片</span>',
								'<span class="pastepic-choose-no" style="font-size:12px;color:#333333;cursor:pointer;width:45px;display:inline-block;margin-right:25px;background:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAANeSURBVDhPXVW/axVBEJ7du7zCMqW1hXX0L0gjRIMWplALRbAIMYnxByiibXgIYhA0gqJgp4JirIMaGxUVbcXOTpuYvNzt3e2O3zf33otxHsfe7c58+83Mt/tcCEEF5iWTqJWNSdTGxifJk5eE0cFLnWDku7d3enksKD8Q1eL0LUk0EDMPB6+SpSiOSIkB3kAbcZiDX1JxPkoCjnexjYMNAW0TD5aIQigCMlF8KzZyFpCA4STHDEfJMB8zW6sHRGBDQEspJgOLf35jA3BBegQdpJhlDTwRorX4ouqninn4DWwIyFfFrs3chNQHdku8eQ4p5+AXAYZaMQaMUtiS+vyEbI2PSrp/zTYimYH9A4hib22KfnoNjl6aZ3el6k4jM3qDKcmUW9IsHJb4YRU+KtWbFyw1SrwNsyPluGtU9Pi8fROmXnkgaXEOqeErbEh5cVLc5zU0A/4oReckGALC/5PyUDaORacnOlovXRJ5ugQgznvJJ09J/PlDGoBlZApanSvLIgdP2WYuY5zBbAMyLS8j5qAuSXProjRPbpuC6Gvlx4ZUUOfysuSHToBdbpFt0/7TIV8bqUzE7HQ235VsakbUNMiKoQxIrXPljvjJkwZGEOp0AOYc8xkaUsPPaonHl0Hc96/cHt3GMnBH2PVv763bFsFThAUTOozZDQG5SwXt8Si5cl3ChcOiX94Zs4SaOTBtPHT46qHU3TMWAzwzhS7JjjYEpM46mkvT25Tq0lEweYtF/PyIZFeXxR2bRVB79NLKQ4mLMxbDhzpNPIM0NoVPGWqtQ6Wb0+O6vs/pxn7RP/u9Fs/vaSgaLctSe91Z3RwTrGNtzGlxc0GrUGhVthhVVaE9fUNCOHK/RD+u4rih0DjL+dV74iZOg0abUs5GHT9r3qxtubaCEYyBYuqgzgYMAxiWVaG9Gwu6fmSPliuPbT6CdVkFLUJpGfQwFnev68bUXg0vH9laKMo+RtBtYVNLihuEZwm78uCTFWvWQX0iSHEOXubTgJY1EO48EDwYtGHKwtsF3Y+KK8sObntdEd+6jNF0h3dcSrzpWhJ0BRHaTtnAwzSFAO4s0CSlzofzrFPW7yaZMzhBRnQd4ZGF7RQ2dEanPCKoz9D2AwtKw+5GziMNB3lt/xVwy5ahc07+ArnLFQPLE82pAAAAAElFTkSuQmCC\') no-repeat 5px 5px">否</span>',
					    		'<span class="pastepic-choose-yes" style="font-size:12px;color:#333333;cursor:pointer;width:50px;display:inline-block;margin-right:25px;border:1px solid #cfcfcf;height:20px;line-height:20px;padding:0 8px 0 1px;border-radius:3px;background:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKPSURBVDhP1VLNS1VREJ85531oGomaCMFDREmIIgg3FW0qamGLFyUFtXFlRBgIkS500cciigjSvyCiTRS2blHQ8oGtkvSpkGj4kSX4vF9npt+5T7G1u+bCveeemfnNzG9+HIYh7dXM9ndP9v8mi7I/qaqh9LSL6F1KmerPWrJ0/9v5YqlpfOEeYpQMR0Eo5NPUqjpi9vlWRXyaIXW4wWElnB+ZubIYzAu85F4dna7PNRthA6+QoyTtIoV0bMSDMcCc2oXw+9DUxZ/BDyaXVenc112Xb0Zxj02UCXXrw/LYp/X3pDFK+17gMqqUKweTQ1M9q26NNQZWR/2J0cNvEYYGOYyDROhJ+Xpp/WPC7kxj8U7bWC3VOJS10dRG6cHctc1oA80L8fH9p4Y7X+e5DmUTcoYdZ5VXojVHzrL5/Ovd05m+QLdQ9uvvL6Plq5vxHz+22u6GC8Mdb/JcS5rBZHlljuIKsqYrpZHZYiWspBX02IGT5xpvvpwdSDh2xlnh0w3Fu+3jlms0ZR7DGlZoO8Y/WCpvTY7M9FaiZQEPaUjKPGLkbPONW4Vn1mZZHNhIebTgGD5EJeC8vfbI466JpuyhNMsC3HNPdOlg/+2255ZzhEzcbovC+QUKHr8f0GELua6HXRMt+YJJ41C1t3Wwr/CIU/qhFtTw9zvmRUIsaizqQFCWdNUtvZjrXwzmLrcO9LT0QThgiCnx3UJNANoxrkShrU7o+/eNgli/ZIBVW8QXesGLwbF1ZjfZIBN6AiR48kU4D1EJxSKJVxp2xPCwVZw0AU3/GGSIPSMATugNRMesOdaMABbXkrA11SaYs2nbu4b4OFYnFgyzOgyG+cFejI4yIsZkIO6UJxGJ4N3OgxH9Ben/Y4RnXjBoAAAAAElFTkSuQmCC\') no-repeat 5px 0px">是</span>',
					    	'</div>',
					    '</div>'
					].join("");

					if($('.pastepic-background').length == 0){
						$(document.body).append(ensurePicHtml);
						$('.pastepic-choose-no').bind('click', function() {
			            	background.display(0);
			            	container.display(0);
			            	toolbar.display(0);	
						});
						$('.pastepic-choose-yes').bind('click', function() {
			            	background.display(0);
			            	container.display(0);
			            	toolbar.display(0);	
			            	self.objImage.base64Transf($.pasteBase64);	
						});
					}

		            var background = $('.pastepic-background');
		            var container = $('.pastepic-container');
		            var toolbar = $('.pastepic-toolbar');
		            var img = $('.pastepic-show');

					img.attr('src', base64);

		            background.display(1);
		            container.display(1);
		            toolbar.display(1);					
				}
				
				var paste = new $.paste(e, pasteCallback);
				paste.getImgBase64Str();
				
			});
			
			if( this.textEditor.val() == '' && !$.browser.html5 ){
				this.textEditor.val( $.lang.default_textarea_text );
			}
			
			//this._listenTextEditor();
			//结束会话
			this.chatElement.find('.chat-view-end-session').hover(function(event){
				//2016.03.10更改样式 修改border 颜色
				$(this).css({
					'color':'#333333',
					'background-color':'#f3f3f3',
					'border-color':'#ebedec'
				});
			}, function(event){
				$(this).css({
					'color':'#333333',
					'background-color':'#f3f3f3',
					'border-color':'#ebedec'
				});
			}).click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				
				self._endSession();
			});
			
			var positionX, positionY;
			//bind chat tools button event
			this.chatElement.find('.chat-view-button,.chat-view-switch-manual').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}
				//2016.03.15
				//$(this).css('background-color','#feb4b3');
				
				//hack lt IE8 2016.03.15注释
				//positionX = $(this).css('background-position').split(' ').shift();
				//positionY = $(this).indexOfClass('chat-view-load-history')||$(this).indexOfClass('chat-view-switch-manual')||$(this).indexOfClass('chat-view-change-csr') ? ' -59px' : ' -17px';

				//$(this).css('background-position', positionX + positionY);
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}
				$(this).css('background-color','');
				//hack lt IE8 2016.03.15注释
				/*positionX = $(this).css('background-position').split(' ').shift();
				if( $(this).indexOfClass('chat-view-face') ) {
					positionY = ' 2px';
				}else if( $(this).indexOfClass('chat-view-load-history') || $(this).indexOfClass('chat-view-switch-manual') || $(this).indexOfClass('chat-view-change-csr')) {
					//2016.03.15修改值
					positionY = ' -39px';
				}else {
					////2016.03.15修改值
					positionY = ' 2px';
				}
				
				$(this).css('background-position', positionX + positionY);*/
				//2016.03.15
			
              });
            //2016.03.18修改更多上面的按钮出现红色
            this.chatElement.find('.chat-view-exp').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}
				//2016.03.15
				$(this).css('background-color','#ffffff');
				
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}
				$(this).css('background-color','');
			});

			this.chatElement.find('.chat-view-face').click(function(event){
				//表情统计点
				self.mode.callTrack("10-02-02");
				
				$.Event.fixEvent(event).stopPropagation();
				
				self.chatElement.find('.chat-view-window-face').display(1);
				self._initFaceGroup();
			});

			this.chatElement.find('.chat-view-image').click(function(event){
				//发送图片统计点
				self.mode.callTrack("10-02-03");
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();
				
				$.Event.fixEvent(event).stopPropagation();
				
				self._image(event);
			});

			this.chatElement.find('.chat-view-file').click(function(event){
				//发送文件统计点				
				self.mode.callTrack("10-02-05");
				
				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();
				
				self._file(event);
			});
			this.chatElement.find('.chat-view-history').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();
				if( $(this).attr('talk_disable') ) return;
				self._download(event);
			});
			// 2014.11.11 添加查看聊天记录按钮，此按钮有选中与未选择两种状态，选中时显示聊天记录框
			this.chatElement.find('.chat-view-load-history').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();
				if( $(this).attr('talk_disable') ) return;
				
				//显示隐藏聊天记录
				self._viewHistory( !$(this).attr('selected') );
			});
			this.chatElement.find('.chat-view-evaluate').click(function(event){
				//评价统计点
				self.mode.callTrack("10-02-09");
				
				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();
				
				if( $(this).attr('talk_disable') ) return;
				self._evaluate(event);
				//2017.05.15 点击后样式
				$(this).css("background-position","-180px -18px");
			});

			this.chatElement.find('.chat-view-capture').click(function(event){
				//截图统计点
				self.mode.callTrack("10-02-04");
				
				$.Event.fixEvent(event).stopPropagation();
				
				if( $(this).attr('talk_disable') ) return;
				self._capture(event);
			});
			this.chatElement.find('.chat-view-switch-manual').click(function(event){
				//转人工客服
				$.Event.fixEvent(event).stopPropagation();
				
				if( $(this).attr('talk_disable') ) return;
				self._switchManual(event);
			});
			this.chatElement.find('.chat-view-change-csr').click(function(event){
				//切换客服
				$.Event.fixEvent(event).stopPropagation();
				
				if( $(this).attr('talk_disable') ) return;
				self._changeCsr(event);
			});
			
			this.chatElement.find('.chat-view-exp').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//2016.03.30修改
				self.chatElement.find('.chat-view-window-face').display();
				
				self._expansion(event);
			});
			//点击其它地址，隐藏表情
			this._eventFunction = function(event){
				self._hiddenFloatMenu();
			};
			$(document.body).click(this._eventFunction);
			
			//发送设置
			//,.chat-view-options,.chat-view-options-menu .chat-view-span div
			this.chatElement.find('.chat-view-submit').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					//'background-color': '#F1F1F1'
				});
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					//'background-color': 'none'
				});
			});
            
			this.chatElement.find('.chat-view-submit').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') ) return;
				self._send(true);
			});
			this.chatElement.find('.chat-view-options').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//show menu
				self.chatElement.find('.chat-view-hidden-area .chat-view-options-menu').display(1);
			});
			//截图按钮配置选项
			this.chatElement.find('.chat-view-capture-options').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				//show menu
				self.chatElement.find('.chat-view-capture-hidden-area .chat-view-options-capture-menu').display(1);//.show();
			});
			this.chatElement.find('.chat-view-options-menu div').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				
				self.chatElement.find('.chat-view-options-menu div').each(function(i, element){
					$(element).removeClass('talk_selected').css('background', 'none');
				});
				if( $(this).indexOfClass('view-option-enter') ){
					self._sendKey = 'Enter';
				}else{
					self._sendKey = 'Ctrl+Enter';
				}
				$(this).addClass('talk_selected').css('background', '#f1f1f1');
				$(this).parent().display();
			});

			this.chatElement.find('.chat-view-options-capture-menu div').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				
				self.chatElement.find('.chat-view-options-capture-menu div').each(function(i, element){
					$(element).removeClass('talk_selected').css('background', 'none');
				});
				if( $(this).indexOfClass('view-option-hidden') ){
					$.Capture.captureWithMin = true;
				}else{
					$.Capture.captureWithMin = false;
				}
				$(this).addClass('talk_selected').css('background', '#f1f1f1');
				$(this).parent().display();
			});
			
			//2014.11.17 聊天记录查看区关闭按钮
			this.options.chatHeader.find('.header-chatrecord-close').css({
				margin: '20px 5px 0 0',
				background: 'url(' + $.imageicon + ') no-repeat -60px 0'
			}).attr('title', $.lang.chat_button_close)
				.hover(function(event){
				$(this).css('background-position', '-60px -20px');
			}, function(event){
				$(this).css('background-position', '-60px 0');
			}).click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				
				self._viewHistory(false);
			});
		},
		/**
		 * @method audioProgress 音频进度
		 * @param  {string} msgid
		 * @param  {number} progress
		 * @return {void}
		 */
		audioProgress: function(msgid, progress){
		},
		/**
		 * @method _hiddenFloatMenu 隐藏浮动层菜单
		 * @return {void}
		 */
		_hiddenFloatMenu: function(){
			this.chatElement.find('.chat-view-hidden-area .chat-view-span').display();
			this.chatElement.find('.chat-view-capture-hidden-area .chat-view-span').display();
		},
		/**
		 * 禁用或启用按钮功能
		 * @param  string|array   buttonName 按钮简写名
		 * @param  boolen         disable    禁用｜启用
		 * @return boolen
		 */
		disableButton: function(buttonName, disable){
			var self = this, selector = [];
			
			buttonName = $.isArray(buttonName) ? buttonName : [buttonName];
			$.each(buttonName, function(i, name){
				selector.push('.' + self.buttonSelectors[name] );
			});
			selector = selector.join(',');
			
			if( disable ){
				if( selector.indexOf('chat-view-image') > -1 ){
					this.chatElement.find('.chat-view-image').find('object,embed,form').css('visibility', 'hidden');
				}
				if( selector.indexOf('chat-view-file') > -1 ){
					this.chatElement.find('.chat-view-file').find('object,embed,form').css('visibility', 'hidden');
				}
				if( selector.indexOf('chat-view-change-csr') > -1){
					$('.chat-view-change-csr').css('background-position-y', ' -40px');
				}
				this.chatElement.find(selector).attr('talk_disable', 'disable').css('opacity', '0.4');
				return false;
			}else{
				if( selector.indexOf('chat-view-image') > -1 ){
					this.chatElement.find('.chat-view-image').find('object,embed,form').css('visibility', 'visible');
				}
				if( selector.indexOf('chat-view-file') > -1 ){
					this.chatElement.find('.chat-view-file').find('object,embed,form').css('visibility', 'visible');
				}
				this.chatElement.find(selector).attr('talk_disable', '').css('opacity', 1);
				return true;
			}
		},
		/**
		 * 显示功能按钮
		 * @param  string|array   buttonName 按钮简写名
		 * @param  boolen         display    显示｜隐藏
		 * @return boolen
		 */
		displayButton: function(buttonName, display){
			var self = this, selector = [];
			
			buttonName = $.isArray(buttonName) ? buttonName : [buttonName];
			
			$.each(buttonName, function(i, name){
				selector.push('.' + self.buttonSelectors[name] );
			});
			selector = selector.join(',');
			
			this.chatElement.find(selector).display(!display);
		},
		/**
		 * 禁用音频按钮
		 * @return {void}
		 */
		disabledAudioButton: function(){
		},
		/**
		 * 监听输入框内容，定时发送当前输入框消息内容（消息预知）
		 * @return {void}
		 * 2015.09.10 优化监听
		 *   获得焦点时，开始监听，失去焦点时，停止监听
		 *   监听频次改为1s，保存2s发送消息
		 */
		_listenTextEditor: function(){
			//消息预知
			var self = this;
			this._listenTimeID = setInterval(function(){
				var Listen = self.textEditor.val();
				var cacheListen = self._cacheListen;
				
				if( !$.browser.html5 && Listen == $.lang.default_textarea_text ){
					Listen = '';
				}
				//输入内容超出限制时
				if( $.enLength(Listen) > 500 ){
					Listen = $.enCut(Listen, 500);
					self.textEditor.val( Listen );
					
					self.textEditor.scrollTop( self.textEditor.scrollHeight() );
				}
				
				self._listenNumber++;
				if( ((Listen && cacheListen !== Listen) ||
				(!Listen && cacheListen)) && self._listenNumber%2 == 0 ){
					self.mode.predictMessage(Listen);
				}
				self._cacheListen = Listen;
			}, 1E3);
		},
		/**
		 * @method _stopListen 停止监听消息输入框
		 * @return {void}
		 */
		_stopListen: function(){
			this._listenNumber = 0;
			clearInterval(this._listenTimeID);
			this._listenTimeID = null;
		},
		/**
		 * @method _initFaceGroup 初始化表情列表
		 * @return {void}
		 * 2015.08.27 事件优化
		 */
		_initFaceGroup: function(){
			var self	= this, cstyle,
				style	= $.STYLE_NBODY + 'outline:0;float:left;padding:8px;width:23px;height:23px;display:inline;zoom:1;'
			;
			if( this._initFace ){
				return;
			}
			this._initFace = true;
			
			if( !this.chatElement.find('.chat-view-face-tags').length ){
				this.chatElement.find('.chat-view-window-face').append(['<div class="chat-view-face-tags" style="',$.STYLE_NBODY,'background:#F1F1F1;clear:both;padding:0 10px;height:38px;border-top:1px solid #D4D4D4;"></div>'].join(''));
			}
			//init face group
			$.each(this.mode.config.faces, function(i, cFace){
				var groupClass	= 'chat-view-face-group-' + i;
				var tagClass	= 'chat-view-face-tag-' + i;
				//表情组
				if( !self.chatElement.find('.' + groupClass).length ){
					self.chatElement.find('.chat-view-window-face').insert('<div class="' + groupClass + ' chat-view-face-group" style="' + $.STYLE_NBODY + (i == 0 ? '' : 'display:none;') + 'overflow-x:hidden;overflow-y:auto;margin:10px 0px 10px 10px;clear:left;height:165px;"></div>', 'afterbegin');
				}
				$.each(cFace.pics, function(faceIndex, jsonFace){
					var j	= faceIndex + 1;
					var alt	= i == 0 ? ' title="' + jsonFace.sourceurl + '"' : ' title="" sourceurl="' + jsonFace.sourceurl + '"';
					cstyle	= style + 'border:1px solid #F6FBFE;border-left:1px solid #DFEFF8;border-bottom:1px solid #DFEFF8;background:#F6FBFE;' + (j<=6 ? 'border-top:1px solid #DFEFF8;' : '') + (j%6==0 ? 'border-right:1px solid #DFEFF8;' : '');
					
					self.chatElement.find('.' + groupClass).append('<img src="' + jsonFace.url + '" ' + alt + ' border="0" style="' + cstyle + '" />');
				});
				//组标签
				if( i == 0 ){
					$({className: 'chat-view-face-tag ' + tagClass + ' tag-selected', title: cFace.name, index: '0', style:$.STYLE_NBODY + 'zoom:1;margin:0 5px 0 0;float:left;background:#fff;position:relative;top:-1px;border-left:1px solid #D4D4D4;border-right:1px solid #D4D4D4;'}).appendTo(self.chatElement.find('.chat-view-face-tags')).append('<img src="' + cFace.icon + '" border="0" style="' + style + 'border:none;" />');
				}else{
					$({className: 'chat-view-face-tag ' + tagClass, title: cFace.name, index: i, style:$.STYLE_NBODY + 'zoom:1;margin:0 5px 0 0;float:left;position:relative;top:0px;border-left:1px solid #f1f1f1;border-right:1px solid #f1f1f1;'}).appendTo(self.chatElement.find('.chat-view-face-tags')).append('<img src="' + cFace.icon + '" border="0" style="' + style + 'border:none;" />');
				}
			});
			//bind face event
			this.chatElement.find('.chat-view-face-group').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;
				
				if( srcElement.tagName.toLowerCase() !== 'img' ) return;
				$(srcElement).css({
					'cursor': 'pointer',
					"background-color": '#FFF'
				});
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;
				
				if( srcElement.tagName.toLowerCase() !== 'img' ) return;
				$(srcElement).css({
					"background-color": '#F6FBFE'
				});
			}).click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;
				
				if( srcElement.tagName.toLowerCase() !== 'img' ) return;
				
				self.chatElement.find('.chat-view-window-face').display();
				if( $(this).indexOfClass('chat-view-face-group-0') ){
					//select default face
					self._insertText('[' + $(srcElement).attr('title') + ']');
				}else{
					$.Log('selected current face:' + $(srcElement).attr('sourceurl'));
					//current faces
					self.mode.send({
						type:		2,
						emotion:	1,
						msg:		"current face",
						url:		$(srcElement).attr('src'),
						sourceurl:	$(srcElement).attr('sourceurl'),
						oldfile:	"",
						size:		"",
						extension:	""
					});
				}
			});
			
			//tag event bind
			this.chatElement.find('.chat-view-face-tags').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;
				srcElement = srcElement.tagName.toLowerCase() == 'img' ? srcElement.parentNode : srcElement;
				
				if( !$(srcElement).indexOfClass('chat-view-face-tag') || $(srcElement).indexOfClass('tag-selected') ) return;
				
				$(srcElement).css({
					'background-color':	'#fafafa',
					'top':				'-1px',
					'border-left':		'1px solid #D4D4D4',
					'border-right':		'1px solid #D4D4D4',
					'margin-right':		'5px',
					'zoom':	'1'
				});
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;
				srcElement = srcElement.tagName.toLowerCase() == 'img' ? srcElement.parentNode : srcElement;
				
				if( !$(srcElement).indexOfClass('chat-view-face-tag') || $(srcElement).indexOfClass('tag-selected') ) return;
				
				$(srcElement).css({
					'background-color':	'transparent',
					'top':				'0px',
					'border-left':		'1px solid #f1f1f1',
					'border-right':		'1px solid #f1f1f1',
					'margin-right':		'5px',
					'zoom':	'1'
				});
			}).click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				var srcElement = $.Event.fixEvent(event).target;
				srcElement = srcElement.tagName.toLowerCase() == 'img' ? srcElement.parentNode : srcElement;
				
				if( !$(srcElement).indexOfClass('chat-view-face-tag') ) return;
				
				self.chatElement.find('.chat-view-face-tag').css({
					'background-color':	'transparent',
					'top':				'0px',
					'border-left':		'1px solid #f1f1f1',
					'border-right':		'1px solid #f1f1f1',
					'margin-right':		'5px',
					'zoom':	'1'
				}).removeClass('tag-selected');
				self.chatElement.find('.chat-view-face-group').display();
				
				$(srcElement).css({
					'background-color':	'#fff',
					'top':				'-1px',
					'border-left':		'1px solid #D4D4D4',
					'border-right':		'1px solid #D4D4D4',
					'margin-right':		'5px',
					'zoom':	'1'
				}).addClass('tag-selected');
				self.chatElement.find('.chat-view-face-group-' + $(srcElement).attr('index')).display(1);
			});
		},
		/**
		 * 消息内容过滤,表情转换，url转换
		 * @return {[type]}
		 */
		_contentFilter: function(data){
			if( typeof data.msg !== 'string' || /\<.*?\>/gi.test(data.msg) ){
				
				//2015.03.28 添加消息内容中含图片时，默认显示小图，点击后显示大图
				if( data.type == 1 && /<img(.*?)src=([^\s]+)(.*?)>/gi.test( data.msg ) ){
					data.msg = data.msg.replace(/<img(.*?)src=([^\s]+)(.*?)>/gi, '<img class="ntalk-preview" src="' + $.loadingGif + '" sourceurl=$2 style="' + $.STYLE_NBODY + '" />');
				}
				return data;
			}
			data.msg = data.msg.replace(/[\r\n]/ig, ' <br>');
			data.msg = data.msg.replace(/(\s{2})/ig, ' {$null}');
			
			//2015.09.22 替换连接
			data.msg = $.myString(data.msg).linkFilter1($.STYLE_BODY + 'color:#0a8cd2;');
			data.msg = data.msg.replace(/\{\$null\}/ig, '&nbsp;&nbsp;');
			data.msg = data.msg.replace(/\t/ig, '&nbsp;&nbsp;&nbsp;&nbsp;');
			//机器人快速回复连接
			data.msg = $.utils.handleLinks(data.msg, {
				settingid: this.settingid
			});
			data.msg = this._faceFilter(data.msg);
			//添加消息默认样式
			data = $.extend({
				color:		"000000",
				fontsize:	"12",
				bold:		"false",
				italic:		"false",
				underline:	"false"
			}, data);
			//$.Log('message data:' + $.JSON.toJSONString(data), 2);
			
			return data;
		},
		_faceFilter: function(str){
			var m = str.match(/\[([a-z]+)\]/ig),
				_gIndex = function(text){
					var ret = null;
					$.each($.lang.editorFaceAlt, function(k, ftext){
						if( ftext && new RegExp(text.replace(/\[/,"\\[").replace(/\]/,"\\]"), "gi").test('[' + ftext + ']') ) ret = k;
					});
					return ret;
				};
			if( !m || !str ){
				return str;
			}
			for(var k, i=0; i<m.length; i++){
				if( !(k = _gIndex(m[i]) ) ){
					continue;
				}
				str = str.replace(m[i], '<img src="' + $.sourceURI + 'images/faces/' + k + ($.browser.msie6 ? '.gif' : '.png') + '" style="' + $.STYLE_NBODY + 'width:23px;height:23px;margin:0 2px;display:inline;vertical-align:text-bottom;" />');
			}
			return str;
		},
		/**
		 * [_image description]
		 * @return {[type]}
		 */
		_image: function(){
			
		},
		/**
		 * [_file description]
		 * @return {[type]}
		 */
		_file: function(){
			
		},
		/**
		 * 下载聊天记录
		 * @return {[type]}
		 */
		_download: function(){
			if( !this.mode.download ){
				return;
			}
			this.mode.download(this.settingid);
		},
		/**
		 * @method _viewHistory 查看聊天记录(2014.11.11)
		 * @params {Boolean}  showView 查看聊天记录或关闭聊天记录
		 * @return {[type]}
		 */
		_viewHistory: function(showView){
			if( !this.mode.viewHistory ){
				return;
			}
			if( showView ){
				this.chatElement.find('.chat-view-load-history').attr('selected', 'selected').css('background-position', '-220px -60px');
			}else{
				this.chatElement.find('.chat-view-load-history').attr('selected', '').css('background-position', '-220px -40px');
			}
			
			//聊天窗口头
			this._tempHeader.display(!showView);
			//聊天记录头
			this._chatsHeader.display(showView);
			
			this._chatsElement.css({
				height: this.chatHistory.height() + 'px'
			}).display(showView);
			
			if( showView ){
				this.mode.viewHistory(this.settingid, this._chatsElement.find('IFRAME.chat-view-float-iframe').get(0));
			}
		},
		/**
		 * 评价
		 * @return {[type]}
		 */
		_evaluate: function(){
			if( !this.mode.showEvaluation ){
				return;
			}
			this.mode.showEvaluation();
		},
		/**
		 * 开始截图
		 * @return {[type]}
		 */
		_capture: function(){
			if( !this.mode.startCapture ){
				return;
			}
			this.mode.startCapture(this.settingid);
		},
		/**
		 * @method _switchManual 转人工客服
		 */
		_switchManual: function(){
			if( !this.mode.switchServerType ){
				return;
			}
			
			this.mode.switchServerType(true, this.settingid);
		},
		/**
		 * @method _changeCsr 更换客服
		 */
		_changeCsr: function(){
			if( !this.mode.changeCustomerServiceInfo ) {
				return;
			}
			this.mode.changeCustomerServiceInfo();
		},
		/**
		 * 展开或收缩侧边栏
		 * @param {event} event
		 * @return {void}
		 */
		_expansion: function(event){
			
			this.options.toggleExpansion(this.settingid);
		},
		updateMore: function(extend){
			//2016.03.11更改更多后面的箭头
			this.chatElement.find('.chat-view-exp').html($.lang.button_more + (extend ? ' &gt;' : ' &gt;') );
		},
		/**
		 * @method switchToolbar 工具条效果转换，人工客服工具条与机器人工具条
		 * @param {boolean} 是否转换为人工客服工具条
		 * @param {string}  source       来源
		 */
		switchToolbar: function(manual, source){
			var self = this;
			$.Log('nTalk.chat.view.switchToolbar(' + manual + ')');
			if( manual ){
				this.chatElement.find('.chat-view-button,.chat-view-capture-options').each(function(){
					var captureOption = $(this).indexOfClass('chat-view-capture-options');
					//2015.12.18 修正按钮显隐判断bug
					if( (!captureOption && $(this).attr('talk_disable') != 'disable' ) || 
						(captureOption && self.chatElement.find('.chat-view-capture').css('display') == "block") ){
						$(this).display(1);
					}
				});
				this.displayButton('csr', this.mode.config.changecsr != 1);
				this.displayButton('history', this.mode.config.chatingrecord != 1);
				this.displayButton('loadhistory', this.mode.config.viewchatrecord != 1);
				this.displayButton(['capture','capoptions'], this.mode.config.captureimage == 0 || !$.global.pageinchat);
				this.displayButton('evaluate', this.mode.config.evaluation == 0);
				this.chatElement.find('.chat-view-exp').display(this.mode._moreData && this.mode._moreData.length);
				this.chatElement.find('.chat-view-switch-manual').display();
			}else{
				this.chatElement.find('.chat-view-button,.chat-view-capture-options').each(function(){
					$(this).display();
				});
				this.chatElement.find('.chat-view-exp').display(this.mode._moreData && this.mode._moreData.length);
				this.chatElement.find('.chat-view-switch-manual').display(1);
				/*
				if( /OFFLINE|BUSY/i.test(source) ){
					//由客服忙碌、离线转向机器人客服时，不能再转向人工客服
					this.disableButton('manual', true);
				}
				*/
			}
		},
		/**
		 * 发送消息
		 * @return {void}
		 */
		_send: function(isSubmit){
			this.chatElement.find('.chat-view-hidden-area .chat-view-suggest-list').display();
			this.isRobotSuggest = true;
			if( /QUERY|QUEUE/i.test(this.mode.statusConnectT2D) ){
				return false;
			}
			var textContent = this._clearEditor();
			if( textContent.length && textContent != $.lang.default_textarea_text ){
				//加载默认文本
				this.mode.send( textContent );
			}
			
			if( !$.browser.html5 && isSubmit === true ){
				this.textEditor.css({'color': '#ccc'}).val( $.lang.default_textarea_text ).get(0).focus();
			}

			$.fn.isReaded();
		},
		_endSession: function(){
			this.mode.endSession();
		},
		_clearEditor: function(){
			var textContent = this.textEditor.val().replace(/(^\s*)|(\s*$)/g, "");
			this.textEditor.val('');
			return textContent;
		},
		/**
		 * @method callChatResize 会话窗口resize
		 * @return {void}
		 */
		callChatResize: function(width, height){
			//$.Log('nTalk.chatMode.view.callChatResize(' + width + ', ' + height + ')');
			
			//消息区宽、高
			this.chatHistory.find('ul').css({'width':  (width - 2) + 'px'});
			//2016.03.11更改高度将165改为135
			this.chatHistory.css({'height': (height - 135) + 'px'});
			this.chatElement.find('.chat-view-float-history, .chat-view-float-history iframe').css({'height': (height - 135) + 'px'});
			this.chatElement.find('.chat-view-window-status-info').css('width', (width - 40) + 'px' );
			
			if( this.evalDialog ){
				this.evalDialog.resize();
			}
			//输入框宽
			this.textEditor.css({
				'width': (width - 22) + 'px'
			});
			
			//更新滚动条
			if( this.scroll ){
				this.scroll.resizeScroll();
			}
		},

        /**
         * 更改排队样式
         */
        changeQueueStyle: function() {
           return false;
        },
        
        /**
		 * audio view 回调
		 * @param {Object} msgid 消息id
		 * @param {Object} type 需要回调type (init|play|stop)
		 */
		audioView: function(type) {
		    /*
		     * 如果没有传递msgid且musicEl存在，改变musicEl的状态
		     */
		    if (!this.msgid && $.musicEl) {
		        $.musicEl.emit();
		        $.musicEl = null;
		        return;
		    }

		    var self = this;
		    var img, msgid = self.msgid;
		    var duration = self.duration;
		    var bodyEl = $('.' + msgid).find('.view-history-body');
		    var kf = msgid.toLowerCase().indexOf("j") > -1 ? false : true;
		    var pngArs, gifArs, bgColor, borderColor, align;
		    if (kf) {
		        pngArs = $.sourceURI + 'images/kfSound.png';
		        gifArs = $.sourceURI + 'images/kfSound.gif';
		        bgColor = '#FFFFFF';
		        align = 'right';
		        durationAlign = 'left';
		    } else {
		        pngArs = $.sourceURI + 'images/mySound.png';
		        gifArs = $.sourceURI + 'images/mySound.gif';
		        bgColor = '#CEF2FF';
		        align = 'left';
		        durationAlign = 'right';
        }

		    switch (type) {
		        case "init":
		            $.Log('[nTalk music]: mp3 view init, msgid is ' + msgid);
		            var html = ['<div id="duration_', msgid, '" style="', $.STYLE_BODY, 'height:24px;line-height:24px;padding:4px 4px 0px;float:', durationAlign, '" >', duration, '\'\'</div>',
		                '<div id="player_', msgid, '" style="', $.STYLE_BODY, ' width:80px;height:24px;padding:4px 0;background:', bgColor, ';border-radius:5px;border: none;text-align:', align, '">',
		                '<img width="24px" height="24px" src="', pngArs, '"/>', '</div>'].join("");
		            bodyEl.parent().css('padding', '0px');
		            bodyEl.append(html);
		            if ($.browser.msie && $.browser.ieversion <= 7) {
		                $('#player_' + msgid).css('width', '50px');
		                $('.' + msgid).find('table').css('width', '100px');
		            }

		            break;
		        case "play":
		            $.Log('[nTalk music]: mp3 view play, msgid is ' + msgid);
		            if ($.musicEl) {
		                $.Log('[nTalk music]: stop playing mp3 view, msgid is ' + $.playMsgid, 2);
		                $.musicEl.emit();
		            }
		            $.musicEl = self;
		            img = $('#player_' + msgid + ' img')[0];
		            img.src = img.src.replace("png", "gif");
		            break;
		        case "stop":
		            $.Log('[nTalk music]: mp3 view stop, msgid is ' + msgid);
		            $.musicEl = null;
		            img = $('#player_' + msgid + ' img')[0];
		            img.src = img.src.replace("gif", "png");
		            break;
		    }
		},

		/**
		 *
		 * @param {Object} msgid
		 */
		audioBindEvent: function(type) {
		    var msgid = this.msgid;
		    switch (type) {
		        case "init":
		            $.Log('[nTalk music]: mp3 event init, msgid is ' + msgid);
		            var self = this;
		            var player = $('#player_' + msgid);
		            player.click(function() {
		                $.Log('[nTalk music]: mp3 trigger click, msgid is ' + msgid);
		                self.emit();
		            });
		            break;
		    }
		}
	};

	/** ====================================================================================================================================================
	 * 最小化窗体状态条
	 * @type {class}
	 */
	$.minimizeView = $.Class.create();
	$.minimizeView.prototype = {
		_width:	0,
		_height:0,
		_isMessageView: false,
		element: null,
		title:	'',
		status: 0,
		count:  0,
		initialize: function(dest, isMessageView, callback){
			var self = this;
			
			$.Log('new nTalk.minimizeView()', 1);
			this.status = dest.status || 0;
			this._isMessageView = isMessageView;
			this.callback = callback || new Function();
			this.element = $('.ntalk-minimize-window');
			this._width = 213;
			this._height= 44;
			
			if( !this.element.length ){
				this.element = $({className:'ntalk-minimize-window', style:$.STYLE_BODY + 'width:' + (this._width - 2) + 'px;height:' + (this._height - 2) + 'px;border:1px solid #c8c7c6;background:#e5e5e4;cursor:pointer;z-Index:2000000000;'}).appendTo(true)
				.gradient('top', '#e5e5e4', '#f2f3f3').fixed({
					left: $(window).width()  - this._width - 2,
					top:  $(window).height() - this._height- 2
				}).html( [
						'<div class="ntalk-minimize-icon" style="',$.STYLE_BODY,'float:left;margin:4px 8px;_margin:4px 4px;width:35px;height:35px;background:url(',$.imageicon,') no-repeat -383px -8px;"></div>',
						'<div class="ntalk-minimize-title" style="',$.STYLE_BODY,'float:left;margin:4px 0;line-height:35px;overflow:hidden;width:160px;height:35px;max-width:162px;"></div>',
						'<div style="',$.STYLE_NBODY,'clear:both;"></div>'
				].join('') );
			}

			//定位
			$(window).bind('resize', function(event){
				self._fiexd(event);
			});

			this.update(dest.name || '', dest.logo || '');
			
			if( this.status ){
				this.online();
			}else{
				this.offline();
			}
			
			this.element.click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				self.remove();
			});
		},
		/**
		 * @method online 更改为在线状态
		 * @return {void}
		 */
		online: function(){
			this.element.find('.ntalk-minimize-icon').css('opacity', 1);
		},
		/**
		 * @method offline 更改为离线状态
		 * @return {void}
		 */
		offline: function(){
			this.element.find('.ntalk-minimize-icon').css('opacity', 0.5);
		},
		/**
		 * @method update 更新状态条信息
		 * @return {void}
		 */
		update: function(name, logo){
			this.title = name ? $.utils.handleLinks($.lang.toolbar_min_title, {destname: name}) : $.lang.toolbar_default_text;
			
			this.element.find('.ntalk-minimize-title').html( this.title );
			
			if( logo && logo != $.CON_SINGLE_SESSION ){
				var self = this, attr;
				$.require(logo + '#image', function(image){
					if( image.error ){
						$.Log('load logo:' + logo, 2);
						return;
					}
					attr = $.zoom(image, 35, 35);
					self.element.find('.ntalk-minimize-icon').css('background-position', '-500px -8px').html( '<img src="' + logo + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_NBODY + 'margin:' + (35-attr.height)/2 + 'px ' + (35-attr.width)/2 + 'px;width:' + attr.width + 'px;height:' + attr.height + 'px;" />' );
				});
			}else{
				this.element.find('.ntalk-minimize-icon').css('background-position', '-383px -8px');
			}
		},
		/**
		 * @method remove 关闭状态条
		 * @return {void}
		 */
		remove: function(){
			$(window).removeEvent('resize', this._fiexd);
			this.stopFlicker();
			this.element.remove();
			this.callback();
		},
		/**
		 * @method startFlicker 收到消息时，开始闪烁
		 * @param  {boolean} highlight
		 * @param  {number}  count
		 * @return {void}
		 */
		startFlicker: function(highlight, count){
			var self = this,
				messageCount = this.count > 99 ? '99+' : this.count,
				timeout = highlight ? 1000 : 500
			;
			count = count || 0;
			if( highlight === undefined ){
				this.stopFlicker(true);
			}
			
			$.Log('$.minView.startFlicker(' + $.JSON.toJSONString(arguments) + ') timeid:' + this.timeID, 1);
			if( highlight ){
				this.element.css({
					'border-color': '#d55f01'
				}).gradient('top', '#ff8803', '#ff7b16');
			}else{
				this.element.css({
					'border-color': '#c8c7c6'
				}).gradient('top', '#e5e5e4', '#f2f3f3').find('.ntalk-minimize-title').html( $.utils.handleLinks($.lang.toolbar_min_news, {count: '<span style="' + $.STYLE_BODY + 'color:#fff;font-weight:bold;">' + messageCount + '</span>'}) );
			}
			if( count >= 7 ) return;

			this.timeID = setTimeout(function(){
				count++;
				self.startFlicker(!highlight, count);
			}, timeout);
		},
		/**
		 * @method stopFlicker 终止闪烁
		 * @param  {boolean}   startNewFlicker 开始新闪烁时终止
		 * @return {void}
		 */
		stopFlicker: function(startNewFlicker){
			$.Log('$.minView.stopFlicker()', 1);
			clearTimeout(this.timeID);
			this.timeID = null;
			if( !startNewFlicker ){
				this.count = 0;
			}
			this.element.find('.ntalk-minimize-icon').css('background-position', '-98px -38px');
			this.element.css({
				'border-color': '#d55f01'
			}).gradient('top', '#e5e5e4', '#f2f3f3').find('.ntalk-minimize-title').html( this.title );
		},
		_fiexd: function(event){
			this.element = $('.ntalk-minimize-window');
			if( !this.element || !this.element.length ){
				return;
			}
			var width = this.element.width();
			var height = this.element.height();
			this.element.fixed({
				width:  width  - 2,
				height: height - 2,
				left:	$(window).width()  - width  - 2,
				top:	$(window).height() - height - 2
			});
		}
	};
	
	$.fn.extend({
        isReaded: function() {
        	if($.chatManage && $.chatManage.get() && $.chatManage.get().view && $.chatManage.get().view.receiveMsgCount) {
        		$.chatManage.get().view.receiveMsgCount = 0;
        	}
    	    if($.im){
    			$.im.receiveMsgCount = 0;
    		}
            if( typeof window.webInfoChanged == "function" ) {
            	webInfoChanged(400, '{"num":0, "showNum":1}', false);
            }
        }
    });
	
	/** ====================================================================================================================================================
	 * [chatManageView description]
	 * @type {[type]}
	 */
	$.chatManageView = $.Class.create();
	$.chatManageView.prototype = {
		name: 'chatManageView',
		defaultOptions: {
			//2016.03.10更改窗口大小
			dropHeight: 50,
			width:  455, //聊天窗口区域宽
			height: 468, //聊天窗口区域高
			minWidth: 415,//最小聊天窗口宽
			minHeight:518,//最小聊天窗口高
			leftElementWidth:  140,//聊窗标签区域宽
			rightElementWidth: 200,//聊窗侧边栏宽
			resizeHeight: 595,     //
			drag:   true,
			resize: false,
			fixed:  true,
			zIndex: 1000000
		},
		_flickerTimeID: [],
		_objView:  null,
		_manageMode: null,
		//当前窗体标识、标题
		tagKey: '',
		tagTitle: '',
		extended: null,
		options: null,
		header: null,
		body: null,
		leftContent: null,
		leftElement: null,
		chatBody: null,
		chatContainter: null,
		rightElement: null,
		
		chatWidth: 0,
		chatHeight: 0,
		CON_ICON_WIDTH: 53,
		CON_ICON_HEIGHT:53,
		initialize: function(options, manageMode){
			this.options = $.extend({}, this.defaultOptions, options);

			this.extended = {
				leftElement: false,
				rightElement: false
			};
			
			this._manageMode = manageMode;
			
			this._getChatPosition(options.position || {});

			this._create();
			
			this._bind();
		},
		close: function(){
			$.Log('nTalk.chatManageView.close()', 1);
			try{
				if( $.browser.oldmsie ){
					this._objView.containter.display();
				}else{
					this._objView.containter.remove();
				}
			}catch(e){
				$.Log(e, 3);
			}
		},
		/**
		 * 添加标签
		 * @param {string} settingid 聊窗标签key
		 */
		addChatTag: function(settingid){
			var self = this, chatTag;

			if( !this.leftContent ){
				return;
			}
			this.tagKey = settingid;
			this.tagTitle = $.lang.toolbar_default_text;
			chatTag = $({tag:'li', style: $.STYLE_NBODY + 'margin:5px 0 0 5px;list-style:none;border:1px solid #fafafa;border-right:none;position:relative;cursor:pointer;', className: this.tagKey, key: this.tagKey}).appendTo(this.leftContent)
				.html( [
					'<div class="tag-head-icon" style="',$.STYLE_NBODY,'width:12px;height:12px;overflow:hidden;position:absolute;left:0;margin:11px 0px 11px 11px;background:#666;"></div>',
					'<div class="tag-content-text" style="',$.STYLE_BODY,'margin-left:30px;height:35px;line-height:35px;overflow:hidden;">', this.tagTitle,'</div>',
					'<div class="tag-button-close" style="',$.STYLE_NBODY,'width:15px;height:15px;position:absolute;left:110px;top:10px;"></div>'
			].join('') ).click(function(event){
				self._onSwitchChat(this, event);
			}).hover(this._onOverChatTag, this._onOutChatTag);

			this._onSelectedChatTag(chatTag);

			chatTag.find('div.tag-button-close').click(function(event){

				self._onCloseChatTag(this, event);
			});

			if( this.leftContent.find('li').length > 1 && !this.extended.leftElement ){
				//展示左侧边栏
				this.toggleExpansion('leftElement', true);
			}
			
			//左侧边栏滚动到最底端
			this.leftBody.scrollTop( this.leftBody.scrollHeight() );
			
			return;
		},
		/**
		 * 移除标签
		 * @param  {string} settingid
		 * @return {void}
		 */
		removeChatTag: function(settingid){
			this.leftContent.find('li.'+settingid).remove();

			if( this.leftContent.find('li').length <= 1 && this.extended.leftElement ){
				//隐藏侧边栏
				this.toggleExpansion('leftElement', false);
			}
			return;
		},
		/**
		 * 更新当前聊窗状态\客服信息
		 * @param  {string} settingid
		 * @param  {json}   data
		 * @param  {boolean}updateStatus	只更新多聊窗时侧边栏客服状态
		 * @return
		 */
		updateChatTag: function(settingid, data, updateStatus){
			var attr, signWidth,
				icon = this.header.find('.chat-header-icon'),
				name = this.header.find('.chat-header-name'),
				sign = this.header.find('.chat-header-sign')
			;
			
			this.leftContent.find('li.'+settingid+' .tag-head-icon').css('background-color', data.status!==1 ? '#666' : '#060');
			
			if( updateStatus === true ) return;
			
			this.leftContent.find('li.'+settingid+' .tag-content-text').html( data.id == $.CON_SINGLE_SESSION ? $.lang.toolbar_default_text : data.name);
			
			if( !data.id ){
				this.header.find(".chat-header-icon,.chat-header-name,.chat-header-sign").css('visibility', 'hidden');
				return;
			}
			//$.Log('chatManageView.updateChatTag(' + $.JSON.toJSONString(data) + ')');
			
			if( $.CON_MULTIPLAYER_SESSION === data.logo ){
				data.logo = $.imagemultiplayer;
			}else if( $.CON_SINGLE_SESSION === data.logo ){
				data.logo = $.imagesingle;
			}
			//$.Log('user icon attr:' + $.JSON.toJSONString(data));
			icon.css('visibility', 'visible').css('background-image', 'none');
			
			//2015.01.15 排队时，每3秒更新一次用户信息,避免重新更新
			if( !icon.find('img').length || icon.find('img').attr('src') != data.logo ){
				icon.html( '<img data-single="1" onerror="nTalk.loadImageAbnormal(this, event)" src="' + data.logo + '" border="0" width="' + data.attr.width + '" height="' + data.attr.height + '" style="' + $.STYLE_NBODY + 'margin:' + (this.CON_ICON_HEIGHT - data.attr.height)/2 + 'px ' + (this.CON_ICON_WIDTH - data.attr.width)/2 + 'px;width:' + data.attr.width + 'px;height:' + data.attr.height + 'px;background:#fff;" />' );
			}else{
				icon.find('img').attr({
					'data-single': $.CON_MULTIPLAYER_SESSION != data.logo ? '1' : '0',
					'width': data.attr.width,
					'height':data.attr.height
				}).css({
					margin:(this.CON_ICON_HEIGHT - data.attr.height)/2 + 'px ' + (this.CON_ICON_WIDTH - data.attr.width)/2 + 'px',
					width:  data.attr.width + 'px',
					height: data.attr.height + 'px'
				});
			}
			
			if( data.status==0 && $.CON_SINGLE_SESSION !== data.id ){
				icon.find('img').css('opacity', '0.5');
			}else{
				icon.find('img').css('opacity', '1');
			}
			//2016.03.21 修改name的值增加在线客服的字样
			name.css('visibility', 'visible').html( '\u5728\u7ebf\u5ba2\u670d\u002d'+data.title || '\u5728\u7ebf\u5ba2\u670d\u002d'+data.name );
			signWidth = Math.max(0, this.header.width() - name.width() - 95);
			sign.css('visibility', 'visible').attr('title', data.sign).css('width', signWidth + 'px').html( data.sign );
		},
		/**
		 * 切换标签
		 * @param  {String} settingid
		 * @return {void}
		 */
		switchChatTag: function(settingid){
			var tagLi = $('li.'+settingid, this.leftContent);
			
			if( tagLi.length ){
				this._onSelectedChatTag(tagLi);
			}

			this._manageMode.callSwitchChat(settingid);
		},
		/**
		 * 展开或收缩左或右侧边栏
		 * @param  {string} attr leftElement|rightElement
		 * @param  {boolen} extend
		 * @return {boolean}
		 */
		toggleExpansion: function(attr, extend){
			if( $.inArray(['leftElement', 'rightElement'], attr) === false ){
				attr = "leftElement";
			}
			
			extend = $.isBoolean(extend) ? extend : !this.extended[attr];
			if( attr === 'rightElement' ){
				if( extend ){
					this[attr].css({
						width:   this.options.rightElementWidth + 'px',
						display: 'block'
					});
					this.chatWidth = this.options.width + this.options.rightElementWidth;
				}else if( !extend ){
					this[attr].css({
						width:   this.options.rightElementWidth + 'px',
						display: 'none'
					});
					this.chatWidth = this.options.width;
				}
				this.extended[attr] = extend;
				this.chatHeight= this.options.height + this.options.dropHeight;
				this.chatWidth += this.extended.leftElement ? this.options.leftElementWidth : 0;
			}else{
				if( extend ){
					this.chatWidth = this.options.width + this.options.leftElementWidth;
					this[attr].css('display', 'block');
					this.chatContainter.css('border-bottom-left-radius', '0px');
				}else if( !extend ){
					this.chatWidth = this.options.width;
					this[attr].css('display', 'none');
					this.chatContainter.css('border-bottom-left-radius', '5px');
				}
				this.extended[attr] = extend;
				this.chatWidth += this.extended.rightElement ? this.options.rightElementWidth : 0;
			}
			
			//设定最小宽度
			this._objView.minWidth = this.defaultOptions.width + (this.extended.leftElement ? this.options.leftElementWidth : 0) + (this.extended.rightElement ? this.options.rightElementWidth : 0);
			
			this.headBody.css('width', this.chatWidth + 'px');
			this.body.css('width', (this.chatWidth - (this.extended.rightElement ? this.options.rightElementWidth : 0) ) + 'px');

			this._objView.changeAttr(this.chatWidth, this.chatHeight);
			
			return this.extended[attr];
		},
		/**
		 * 更新聊窗当前右侧数据
		 * @param  {string} settingid
		 * @param  {array}  data
		 * @return {[type]}
		 */
		updateRightData: function(settingid, data){
			var self = this, selectLabel = false;
			
			this.settingid = settingid;
			
			if( !data || !data.length ){
				//页外时,无右侧配置数据时,不显示右侧区域
				this.toggleExpansion("rightElement", false);
				
				return;
			}

			this._clearTag();
			
			$.each(data, function(i, obj){
				if( !obj.data || !obj.data.length ){
					return;
				}
				if( obj.selected == true ){
					selectLabel = true;
				}
				
				//默认选择项内容为空或无默认选项时，最后一项为选中项
				if( !selectLabel && i == data.length - 1 ){
					obj.selected = true;
				}
				self._addRightLabel(obj.title, obj.data, data.length, obj.selected);
			});
			this._bindTag();
		},
		/**
		 * @method updateViewStatus 更新ManageView状态效果
		 * @param  {boolean} status 
		 * @return {void}
		 */
		updateViewStatus: function(status){
		},
		/**
		 * @method updataSkin 更新聊窗皮肤
		 * @param  {string} backgroundImage
		 * @param  {string} startColor
		 * @param  {string} endColor
		 * @return {void}
		 */
		updataSkin: function(backgroundImage, startColor, endColor){
			var chat, colorExp = /^#[0-9a-f]{6}$/i;
			//2016.03.04新增皮肤颜色
		  startColor=endColor='#2caa76';
			
			if( startColor == endColor ){
				//自定义皮肤
				if( colorExp.test(startColor) ){
					//背景颜色
					var hsl = $.toHSL(startColor).l;
					this.headBody.css({
						'background':	startColor,
						'color':		hsl < 0.75 ? '#fff' : '#525252'
					});
					this.rightElement.find('.window-right-head').css({
						'background':	startColor,
						'color':		hsl < 0.75 ? '#fff' : '#525252'
					});
				}else{
					//背景图片
					this.headBody.css({
						'background':	'url(' + startColor + ') repeat'
					});
					this.rightElement.find('.window-right-head').css({
						'background':	'url(' + startColor + ') repeat'
					});
				}
			}else{
				//默认皮肤
				this.headBody.gradient("top", startColor, endColor);
				this.rightElement.find('.window-right-head').gradient("top", startColor, endColor);
			}
			
			chat = this._manageMode.get();
			if( chat && colorExp.test(backgroundImage) ){
				chat.view.chatElement.find('.chat-view-window-history').css("background-color",backgroundImage);
			}else if( chat && backgroundImage ){
				chat.view.chatElement.find('.chat-view-window-history').css("background-image",'url('+backgroundImage+')');
			}
		},
		minimize: function(event){
			this._objView.minimize(event);
		},
		maximize: function(event){
			this._objView.maximize(event);
		},
		hidden: function(){
			this._objView.minimize(null, true);
			$.Log('chatManageView.hidden:' + this._objView.containter.css('visibility'), 2);
		},
		visible: function(){
			this._objView.maximize(null, true);
			$.Log('chatManageView.visible:' + this._objView.containter.css('visibility'), 2);
		},
		/**
		 * 收到消息时，开始闪烁
		 * @param  {string}  selector 选择器
		 * @param  {boolean} highlight
		 * @param  {number}  count
		 * @return {void}
		 */
		labelFlicker: function(selector, highlight, count){
			var self = this, timeout = highlight ? 1000 : 500;
			count = count || 0;
			if( highlight === undefined ){
				this.stopFlicker(selector);
			}

			if( highlight ){
				this.leftContent.find("." + selector).css({
					'background-color': '#FE800F'
				}).addClass('talk_flicker');
			}else{
				this.leftContent.find("." + selector).css({
					'background-color': '#fafafa'
				}).addClass('talk_flicker');
			}
			if( count >= 7 ) return;

			this._flickerTimeID[selector] = setTimeout(function(){
				count++;
				self.labelFlicker(selector, !highlight, count);
			}, timeout);
		},
		stopFlicker: function(selector){
			clearTimeout(this._flickerTimeID[selector]);
			this._flickerTimeID[selector] = null;
			
			this.leftBody.find("." + selector).css({
				'background-color': '#fafafa'
			}).removeClass('talk_flicker');
		},
		/**
		 * 创建聊窗管理器视图界面
		 * @return {[type]}
		 */
		_create: function(){
			var self = this, options = $.extend({}, this.options, {
				width:  this.options.width,
				height: this.options.height + this.options.dropHeight,
				minWidth: this.defaultOptions.minWidth,
				minHeight:this.defaultOptions.minHeight
			});
			//2016.03.10添加主题文件
				if ($.themesURI) {
			    $.imageicon = $.themesURI + 'chaticon.' + ($.browser.msie6 ? 'gif' : 'png');
			    
			   //预加载图片
			    $.require([$.imageicon], function(element) {
			        if (element.error) {
			            $.Log('cache chat icon failure', 3);
			        }
			    });
			 
			}
			
			this._objView = new $.Window( $.extend({
				onChanage: function(args){
					self._callResize.call(self, args);
				},
				onClose: function(){
					self._callClose.call(self);
				},
				onMinimize: function(){
					self._callMinimize.call(self);
				},
				onMaximize: function(){
					self._callMaximize.call(self);
				},
				onMaxResize: function(){
					self._callMaxResize.call(self);
				}
			}, options) );

			this.header = this._objView.header;
			this.body   = this._objView.body;
			
			this.chatWidth = this.options.width;
			this.chatHeight= this.options.height + this.options.dropHeight;
			
			this._objView.buttonClose.hover(function(){
				//$(this).css('background-position', '-60px -20px');
				//2016.03.15
				$(this).css('background-color','#209060');
			}, function(){
				//$(this).css('background-position', '-60px 0');
				$(this).css('background-color','');
			}).attr('title', $.lang.chat_button_close).css({
				margin: '0px 0px 0 0',
				padding:'6px 6px 7px 5px',
				background: 'url(' + $.imageicon + ') no-repeat -55px 14px'
			});
			if( this._objView.buttonResize ){
				this._objView.buttonResize.css({
					'width':  '12px',
					'height': '15px',
					'background': 'url(' + $.imageicon + ') no-repeat -298px -5px'
				});
			}
			this._objView.buttonMax.hover(function(event){
				//var positionX = $(this).css('background-position').split(' ').shift();
				//$(this).css('background-position', positionX + ' -20px');
				$(this).css('background-color','#209060');
				
			}, function(event){
				//var positionX = $(this).css('background-position').split(' ').shift();
				//$(this).css('background-position', positionX + ' 0');
				$(this).css('background-color','');
			}).css({
				margin: '0px 0px 0 0',
				padding:'6px 4px 7px 5px',

				background: 'url(' + $.imageicon + ') no-repeat -35px 14px'
			}).attr('title', $.lang.chat_button_resize_max);
            //2016.03.15更改
			this._objView.buttonMin.hover(function(){
				//$(this).css('background-position', '-1px -20px');
				$(this).css('background-color','#209060');
			}, function(){
				$(this).css({
					//'background-position': '7px 15px',
					'background-color':''
			});
			}).css({
				margin: '0px 0px 0 0',
				padding:'6px 6px 7px 5px',
				//2016.03.30 
				background: 'url(' + $.imageicon + ') no-repeat 8px 14px'
			}).attr('title', $.lang.chat_button_min);
		
			this.headBody = $({className: 'chat-header-body', style: $.STYLE_BODY + 'background:#ebe9e9;z-index:0;color:#525252;'}).appendTo(this.header, true).css({
				'position': 'absolute',
				//2016.03.10更改 border颜色背景和height 值top值
				//2017-05-12更改 border背景颜色
				//'border-top': '1px solid #ff4d4d',
				'border-left': '1px solid #2caa76',
				'border-right': '1px solid #2caa76',
				'border-bottom': '0',
				'top': '0px',//IN
				'border-right': '1px solid #2caa76',//IN
				//'border-radius': '5px 5px 0px 0px',
				//'-moz-border-radius': '5px 5px 0px 0px',
				//'-webkit-border-radius': '5px 5px 0px 0px',
				'width': (this.options.width - 2) + 'px',//IN
				'height': (this.options.dropHeight ) + 'px'//IN
			});
			//2016.03.10 新增logo图片
			
			this.headPic=$({tag: 'span', className:'chat-header-pic', style: $.STYLE_BODY + 'display:inline-block;margin:19px 22px 0 15px;height:18px;width:90px;float:left;background:url('+ $.imageicon + ') no-repeat -332px -102px' }).appendTo(this.headBody).html('');
			//2016.03.11更改字体颜色和margin 值
			this.headName = $({tag: 'span', className:'chat-header-name', style: $.STYLE_BODY + 'color:#ebedec;margin:19px 0px 0px 0px;padding-left: 5px;display:inline-block;heigth:13px;color:#ffffff;font-size:12px;float:left;max-width:220px;border-left:1px solid #ffffff;visibility:hidden;overflow:hidden;cursor:auto;'}).appendTo(this.headBody);
			
			this.headSign = $({tag: 'span', className:'chat-header-sign', style: $.STYLE_BODY + 'color:#c3c3c3;margin:10px 0px 13px 10px;display:inline-block;float:left;height:20px;visibility:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:auto;'}).appendTo(this.headBody);
			//2016.03.10将图片进行隐藏
			//this.headIcon = $({tag: 'div',  className:'chat-header-icon', style: $.STYLE_NBODY + 'visibility:hidden;border-radius:0px;overflow:hidden;background:url(' + $.imageicon + ');background-repeat:no-repeat;background-position:-374px 0; background-color:#ffffff;position:absolute;left:14px;bottom:13px;width:' + this.CON_ICON_WIDTH + 'px;height:' + this.CON_ICON_HEIGHT + 'px;border:1px solid #5f6467;z-index:1;'}).appendTo(this.header, true);

			this.chatBody = this._objView.chatBody;
			
			this.leftElement = $({className: 'body-chat-tags', style: $.STYLE_NBODY + 'display:none;float:left;background:#fafafa;overflow:hidden;'}).css({
				'border-left': '1px solid #f5f5f5',
				'border-bottom': '1px solid #f5f5f5',
				'border-radius': '0px 0px 0px 5px',
				'width':  (this.options.leftElementWidth - 1) + 'px',
				'height': (this.options.height - 1) + 'px'
			}).appendTo( this.chatBody );

			this.chatContainter = $({className: 'body-chat-containter', style: $.STYLE_NBODY + 'float:left;overflow:hidden;background:#fff;'}).css({
				'border-right':  '1px solid #5f6467',
				'border-bottom': '1px solid #5f6467',
				'border-left':   '1px solid #5f6467',
				'border-radius': '0px 0px 0px 5px',
				'-moz-border-radius': '0px 0px 0px 5px',
				'-webkit-border-radius': '0px 0px 0px 5px',
				'width':  (+this.options.width  - 2) + 'px',
				'height': (+this.options.height - 1) + 'px'
			}).appendTo( this.chatBody );
			
			//clear both
			$({style: $.STYLE_NBODY+'clear:both;'}).appendTo(this.chatBody);

			this.rightElement = this._objView.rightElement.css({
				width: this.options.rightElementWidth + 'px'
			});
			//IN:

			/*	$({className: 'ntalker-button-close', style: $.STYLE_BODY + 'background:url(' + $.imageicon + ') no-repeat -80px 0;cursor:pointer;width:20px;height:20px;float:right;color:#fff;'}).appendTo(this.rightElement.find('.window-right-head')).hover(function(){
				$(this).css('background-position', '-80px -20px');
			}, function(){
				$(this).css('background-position', '-80px 0');
			}).css({
				margin: '10px 10px 0 0'
			}).attr('title', $.lang.chat_button_close).click(function(event){
				
				self._manageMode.callToggleExpansion(self.settingid);
				});*/				
			
            //2016.03.11更改边框颜色和border角
			this.rightBody = $({className: 'window-right-body', style: $.STYLE_BODY + 'width:199px;background:#fff;'}).css({
				'border-right':  '1px solid #f3f3f3',
				'border-bottom': '1px solid #f3f3f3',
				'height':+ (this.options.height - 1) + 'px',
				'border-radius': '0px 0px 0px 0px',
				'-moz-border-radius': '0px 0px 0px 0px',
				'-webkit-border-radius': '0px 0px 0px 0px'
			}).appendTo(this.rightElement);

			// 2016.03.21添加iframe框架
			var pptElement_tem_height=$.browser.Quirks ? 288 : 272;
			this.pptElement         = $({tag: 'iframe', className: 'window-right-pro-images', style: $.STYLE_BODY + 'margin:0px;padding:4px 4px;width:' + (this.options.rightElementWidth-21) + 'px;background:#fff;height:'+ pptElement_tem_height+'px;overflow-x:hidden; scroll-x:none'}).attr({
				//debug temp
				//别人提供的地址
				// "src": $.server.mcenter+"web/"+$.global.siteid+"/index.html"
			}).appendTo(this.rightBody);

			//taglist ul
			this.buttonScrollTop    = $({tag:'div',className:'nTalk-scroll-top', style:$.STYLE_NBODY + 'height:20px;width:100%;z-index:99;background:url(' + $.imageicon + ') no-repeat 20px -92px;display:block;cursor:pointer;'}).appendTo(this.leftElement);
			this.leftBody           = $({tag:'div',className:'nTalk-scroll-body', style: $.STYLE_NBODY + 'overflow:hidden;height:424px;'}).appendTo(this.leftElement);
			this.leftContent        = $({tag:'ul',className: 'ntalke-scroll-content', style: $.STYLE_NBODY}).appendTo(this.leftBody);
			this.buttonScrollBottom = $({tag:'div',className:'nTalk-scroll-bottom', style:$.STYLE_NBODY + 'height:20px;width:100%;z-index:99;background:url(' + $.imageicon + ') no-repeat 20px -108px;display:block;cursor:pointer;'}).appendTo(this.leftElement);
		},
		_bind: function(){
			var self = this;
			
			this.buttonScrollTop.click(function(event){
				if( self._verificationScroll(true) ){
					self.leftBody.scrollTop( self.leftBody.scrollTop() - 40 );
				}
			}).hover(function(event){
				if( self._verificationScroll(true) ){
					$(this).css('background-position', '-79px -92px');
				}
			}, function(event){
				$(this).css('background-position', '20px -92px');
			});
			this.buttonScrollBottom.click(function(event){
				if( self._verificationScroll(false) ){
					self.leftBody.scrollTop( self.leftBody.scrollTop() + 40 );
				}
			}).hover(function(event){
				if( self._verificationScroll(false) ){
					$(this).css('background-position', '-79px -108px');
				}
			}, function(event){
				$(this).css('background-position', '20px -108px');
			});
		},
		/**
		 * 聊窗标签 _onOverChatTag
		 * @param  Event event
		 * @return {[type]}
		 */
		_onOverChatTag: function(event){
			var target = this;
			while( target.tagName.toUpperCase() !== 'LI' ){
				target = target.parentNode;
			}
			$(target).find('.tag-button-close').css({
				background: 'url('+$.imageicon+') no-repeat -140px -39px'
			});
			if( $(target).indexOfClass('talk_flicker') ) return;
			$(target).css({
				'border-top':		'1px solid #ccc',
				'border-bottom':	'1px solid #ccc',
				'border-left':		'1px solid #ccc',
				'left':				'1px',
				'background':		'#fff'
			});
		},
		/**
		 * 聊窗标签 _onOutChatTag
		 * @return {[type]}
		 */
		_onOutChatTag: function(){
			var target = this;
			while( target.tagName.toUpperCase() !== 'LI' ){
				target = target.parentNode;
			}
			$(target).find('.tag-button-close').css({
				background: 'none'
			});
			if( $(target).indexOfClass('talk_flicker') ) return;
			if( $(target).indexOfClass('talk_selected') ) return;
			$(target).css({
				'border-top':		'1px solid #fafafa',
				'border-bottom':	'1px solid #fafafa',
				'border-left':		'1px solid #fafafa',
				'left':				'0px',
				'background':		'#fafafa'
			});
		},
		/**
		 * 聊窗标签选中 _onSelectedChatTag
		 * @param  {[type]} tagChat
		 * @return {[type]}
		 */
		_onSelectedChatTag: function(tagChat){
			var self = this;
			$('li', this.leftContent).each(function(i, element){
				$(element).removeClass('talk_selected');
				//正在闪烁的标签，不执行此操作
				if( !$(element).indexOfClass('talk_flicker') ){
					self._onOutChatTag.apply( element );
				}
			});
			
			this.stopFlicker( $(tagChat).attr("key") );
			$(tagChat).addClass('talk_selected').css({
				'border-top':		'1px solid #ccc',
				'border-bottom':	'1px solid #ccc',
				'border-left':		'1px solid #ccc',
				'left':				'1px',
				'background':		'#fff'
			});
		},
		/**
		 * 窗体大小变化
		 * @param  {json} args
		 * @return {[type]}
		 */
		_callResize: function(args){
			var chatWidth = args.width;
			var chatHeight= args.height;
			
			if( this.extended.leftElement ){
				chatWidth -= this.options.leftElementWidth;
			}
			if( this.extended.rightElement ){
				chatWidth -= this.options.rightElementWidth;
			}
			this.options.width  = chatWidth;
			this.options.height = chatHeight - this.options.dropHeight;
			
			this.headBody.css('width', (args.width - 2) + 'px');
			
			this.body.css('width', ( this.options.width + (this.extended.leftElement ? this.options.leftElementWidth : 0) ) + 'px');
				this.leftElement.css({
					width: (this.options.leftElementWidth - 1) + "px",
					height:(this.options.height - 1) + "px"
				});
					this.leftBody.css('height', (this.options.height - 40) + 'px');
				this.chatContainter.css({
					width: (this.options.width - 2) + "px",
					height:(this.options.height - 1) + "px"
				});

			this.rightBody.css({
				height:(this.options.height - 1) + "px"
			});
			
			//侧边栏内容区高，去除侧边栏标签区高
			//var rigthConentHeight = this.options.height - Math.max(this.rightTags.height() + parseFloat(this.rightTags.css('border-top-width')) - 1, 28);
			//2016.03.21 更改高度值

			var rigthConentHeight = this.options.height - 24;
			//2016.03.21新添加
			//this.rightElement.css('height', 'auto');
			this.rightElement.find('.view-right-content').css({'height': rigthConentHeight + 'px'});
			this.rightElement.find('.window-right-content iframe').attr('height', rigthConentHeight).css({'height': rigthConentHeight + 'px'});//右侧iframe样式、属性同步更新
			
			//聊窗尺寸
			this._manageMode.callManageResize(this.options.width, this.options.height);
		},
		/**
		 * @method _callMaxResize 窗口大小变化时回调
		 * @return {void}
		 */
		_callMaxResize: function(){
			var setMax = this.options.height < this.defaultOptions.resizeHeight;
			this.chatHeight = this.options.dropHeight + (setMax ? this.defaultOptions.resizeHeight : this.defaultOptions.height);
			
			this._objView.changeAttr(this.chatWidth, this.chatHeight);
			
			if( setMax ){
				this._objView.buttonMax.css('background-position', '-15px 14px').attr('title', $.lang.chat_button_resize_min);
			}else{
				this._objView.buttonMax.css('background-position', '-35px 14px').attr('title', $.lang.chat_button_resize_max);
			}
			
			this._callResize({width: this.chatWidth, height: this.chatHeight});
		},
		/**
		 * 还原窗体
		 * @return {[type]}
		 */
		_callMaximize: function(){
		},
		/**
		 * 关闭窗体
		 * @return {[type]}
		 */
		_callClose: function(){
			this._manageMode.close();
		},
		/**
		 * 最小化窗体
		 * @return {[type]}
		 */
		_callMinimize: function(){
			this._manageMode.callMinimize();
		},
		/**
		 * 切换窗体
		 * @param  {HtmlDOM} elem
		 * @param  {Event}   event
		 * @return {[type]}
		 */
		_onSwitchChat: function(elem, event){
			var tagKey = $(elem).attr('key');
			$.Event.fixEvent(event).stopPropagation();

			this._onSelectedChatTag(elem);
			
			this._manageMode.callSwitchChat(tagKey);
		},
		/**
		 * 关闭单个窗体
		 * @return {[type]}
		 */
		_onCloseChatTag: function(elem, event){
			var tagKey, target = elem;

			$.Event.fixEvent(event).stopPropagation();
			
			while( target.tagName.toUpperCase() !== 'LI' ){
				target = target.parentNode;
			}
			$(target).removeClass('talk_selected');
			tagKey = target.className.replace(/^\s*|\s*$/g, '') || '';

			this._manageMode.closeChat(tagKey);
		},
		_getChatPosition: function(position){
			var offset, selector;
			if( !position || $.isEmptyObject(position) ){
				//默认定位
				this.options.left = Math.max(0, $(window).width()  - this.options.width);
				this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
			}else if(position.rightline && position.width){
				//网页右边线定位
				this.options.left = Math.max(0, ($(window).width() - position.width)/2  + position.width - this.options.width);
				this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
			}else if( (position.id || position.entryid) && $.isDefined(position.left) && $.isDefined(position.left) ){
				//相对于指定节点定位
				selector = position.id || position.entryid || '';
				selector = /(^[#\.])|\s+/gi.exec(selector) ? selector : '#'+selector;
				
				//2014.12.25 添加兼容：网站配置页面中找不到的节点时
				if( !$(selector).length ){
					this.options.left = Math.max(0, $(window).width()  - this.options.width);
					this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
				}else{
					offset = $(selector).offset();
					position.left = position.left || 0;
					position.top  = position.top || 0;
					this.options.left = Math.min(offset.left - this.options.width + position.left, $(window).width()  - this.options.width);
					this.options.top  = Math.min(offset.top  + position.top, $(window).height() - this.options.height - this.options.dropHeight);
				}
			}else{
				//预设位置定位
				switch(position.position){
				case 'left-top':
					this.options.left = 0;
					this.options.top  = 0;
					break;
				case 'center-top':
					this.options.left = Math.max(0, ($(window).width() - this.options.width)/2);
					this.options.top  = 0;
					break;
				case 'right-top':
					this.options.left = Math.max(0, $(window).width()  - this.options.width);
					this.options.top  = 0;
					break;
				case 'left-center':
					this.options.left = 0;
					this.options.top  = Math.max(0, ($(window).height() - this.options.height - this.options.dropHeight)/2);
					break;
				case 'center-center':
					this.options.left = Math.max(0, ($(window).width() - this.options.width)/2);
					this.options.top  = Math.max(0, ($(window).height() - this.options.height - this.options.dropHeight)/2);
					break;
				case 'right-center':
					this.options.left = Math.max(0, $(window).width()  - this.options.width);
					this.options.top  = Math.max(0, ($(window).height() - this.options.height - this.options.dropHeight)/2);
					break;
				case 'left-bottom':
					this.options.left = 0;
					this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
					break;
				case 'center-bottom':
					this.options.left = Math.max(0, ($(window).width() - this.options.width)/2);
					this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
					break;
				default:// 'right-bottom'
					this.options.left = Math.max(0, $(window).width()  - this.options.width);
					this.options.top  = Math.max(0, $(window).height() - this.options.height - this.options.dropHeight);
					break;
				}
				
				this.options.left += (position.xoff || 0);
				this.options.top  += (position.yoff || 0);
				
				//2015.06.11 最大、最小限制
				this.options.left = Math.min(Math.max(this.options.left, 0), $(window).width()  - this.options.width);
				this.options.top  = Math.min(Math.max(this.options.top,  0), $(window).height() - this.options.height - this.options.dropHeight);
			}
		},
		/**
		 * 验证是否需要显示滚动条
		 * @param {boolean} isTop
		 */
		_verificationScroll: function(isTop){
			var tmp = this.leftBody.scrollHeight() - this.leftBody.height();
			if( isTop && tmp > 0 && self.leftBody.scrollTop() > 0 ){
				return true;
			}else if( !isTop && tmp > 0 && tmp > this.leftBody.scrollTop() ){
				return true;
			}else{
				return false;
			}
		},
		/**
		 * @method _addRightLabel   添加右侧标签、内容节点
		 * @param {string} title    标签文本
		 * @param {string} data     标签内容或URL
		 * @param {number} length   标签总数
		 * @param {boolean}selected 是否选中
		 * 修复标签设定选择项功能
		 * 2015.08.27 常见问题事件优化
		 */
		_addRightLabel: function(title, data, length, selected){
			var self = this,
				expURL = /^https?:\/\/(.*?)/gi,
				key = $.randomChar(), listElement, style, tagElement, tagBody,
				rightContentWidth  = this.options.rightElementWidth - 12 - length + 1,
				//2016.03.21更改高度
				rightContentHeight = this.options.height -314;
			
			if( !this.rightTags ){
				//2016.03.11更改颜色 border 改为1
				this.rightTags = $({className:'window-right-tags', style: $.STYLE_NBODY + 'background:#ffffff;z-index:-1;overflow:hidden;height:34px;border-top:1px solid #FFF;'}).appendTo(this.rightBody);
				this.rightTags.insert('<div style="' + $.STYLE_NBODY + 'clear:both;"></div>');
			}
			if( !this.rightContent){
				//2016.03.11
				this.rightContent = $({className:'window-right-content', style: $.STYLE_NBODY + 'overflow:hidden;background:#ffffff;position:relative;top:-1px;z-index:1;border-radius:0px 0px 5px 0px;-moz-border-radius:0px 0px 5px 0px;-webkit-border-radius:0px 0px 5px 0px'}).appendTo(this.rightBody);
			}
			//2016.03.11改变字体border颜色 
			style = $.STYLE_BODY + 'background-color:#FAF9F9;height:34px;color:#333333;line-height:34px;text-align:center;cursor:pointer;border:1px solid #ebedec;float:left;';
			
			if( length == 1 ){
				//2016.03.11
				style += 'width:199px;';
			}else{
				if( this.rightTags.find('div').length == 1 ){
					//2016.03.21更改width值 border值
					style += 'width:' + (length == 2 ? 98 : 64) + 'px;border-right:1px solid #ebedec;';
				}else if( this.rightTags.find('div').length < length ){
					style += 'width:' + (length == 2 ? 98 : 64) + 'px;border-right:1px solid #ebedec;';//border-left:1px solid #FCE4E7;
				}else{
					//2016.03.29 修改大小
					style += 'width:' + (length == 2 ? 97 : 65) + 'px;';//border-left:1px solid #FCE4E7;
				}
			}
			
			tagElement = $({className: key, title: title, style: style}).appendTo(this.rightTags, this.rightTags.find('div').last()).html( title );//.gradient("top", '#F8CEDC', '#FAB2CA')
			//2016.03.21更改颜色 增加padding 值width值
			tagBody = this.rightContent.insert( ['<div class="',key,' view-right-content" style="',$.STYLE_BODY,'background-color:#ffffff;width:'+ (this.options.rightElementWidth-16) +'px;height:' + rightContentHeight + 'px;overflow-x:hidden;padding:8px 0 0px 16px;;overflow-y:auto;display:none;border-radius:0px 0px 5px 0px;-moz-border-radius:0px 0px 5px 0px;-webkit-border-radius:0px 0px 5px 0px"></div>'].join('') );
			
			if( $.isArray(data) ){
				//2016.03.11修改list样式和颜色值
				//用于常见问题一类的列表形式展示内容
				listElement = $({tag: 'ul', style: $.STYLE_BODY + 'margin:0px 0px 4px 0px;list-style:none;background-color:#ffffff;'}).appendTo(tagBody).click(function(event){
					var srcElement = $.Event.fixEvent(event).target;
					if( srcElement.tagName.toLowerCase() !== 'li' ) return;
					var title = $(srcElement).attr('talk_title');
					var content= $(srcElement).attr('talk_content');
					
					self._manageMode.showFAQ(self.settingid, title, content);
				});
				
				for(var i = 0; i < data.length; i++){
					//2016.03.11更改颜色
					$({tag:'li', talk_title: data[i].title, talk_content: data[i].con, title: $.clearHtml(data[i].con || ''), style: $.STYLE_BODY + 'list-style:none outside none;margin-top:5px;cursor:pointer;background-color:#ffffff;color:#666666'}).appendTo(listElement).html( $.clearHtml(data[i].title || '') );
					/*
					.html( '<span style="' + $.STYLE_BODY + 'color:#525252;background-color:#FAF9F9;text-decoration:none;">' + $.clearHtml(data[i].title || '') + '</span>' );
					*/
				}
			}else if( expURL.test( data ) ){
				//自定义签外部页面传入参数
				data += (data.indexOf('?')==-1 ? '?' : '&') + $.toURI({
					lan:		$.extParmas['lan'],
					sellerid:	this._manageMode.sellerid,
					userid:		$.user.id,
					exparams:	$.global.exparams || ''
				});
				$({className: 'window-right-iframe', tag: 'iframe', width:'100%',frameborder:'0', height:rightContentHeight, scrolling: 'auto', style:$.STYLE_NBODY + 'width:100%;height:' + rightContentHeight + 'px;'}).appendTo(tagBody.css('overflow-y','hidden')).attr('src', data);
			}else{//text3.30更改color 值
				$({className: 'window-right-text', style: $.STYLE_BODY + 'margin:5px;color:#666666;font-size:10px;'}).appendTo(tagBody).html(data);
			}
			//新创建标签默认选中
			if( selected ){
				this._selectedTag(tagElement);
			}
			
			return tagElement;
		},
		_bindTag: function(){
			var self = this;
			if( !this.rightTags ){
				return;
			}
			this.rightTags.find('[class]').click(function(){
				self._selectedTag(this);
			});
		},
		_selectedTag: function(eventElement){
			var self = this;
			this.rightTags.find('[class]').each(function(i, elem){
				var key = $.myString( elem.className.replace('talk_selected', '') ).trim();
				
				if( $(eventElement).indexOfClass( key ) ){
					//$.Log('selected class:' + key + ', selected');
					//2016.03.11改变背景颜色高度值
					$(elem).addClass('talk_selected').css({'height': '35px', 'border-bottom': 'none','background-color':'#ffffff'});//.gradient('top', '#F8BAC2', '#F9CDDC').css('color', '#DE7E80');
					self.rightContent.find('.'+key).display(1);
				}else{
					//$.Log('selected class:' + key + '');
					$(elem).removeClass('talk_selected').css({'height': '34px', 'border-bottom': '1px solid #f3f3','background-color':'#f3f3f3'});//.gradient('top', '#F8CEDC', '#FAB2CA').css('color', '#FFFFFF');
					self.rightContent.find('.'+key).display();
				}
			});
		},
		_clearTag: function(){
			this.rightBody.find(".window-right-tags *,.window-right-content *").remove();
			this.rightTags = null;
			this.rightContent = null;
		}
	};
	
})(nTalk);
