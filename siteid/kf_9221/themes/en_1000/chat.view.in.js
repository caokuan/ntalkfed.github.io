﻿;(function($, undefined){
    var emptyFunc = function(){
    };
    /*jshint scripturl:true*/
    var SCRIPT_URL = "javascript:void();";
	//====================================================================================
	/**
	 * 自定义滚动条对像
	 * @class myScroll
	 * @constructor
	 */
	var myScroll = $.Class.create();
	myScroll.prototype = {
		name: 'myScroll',
		mainBox:	null,
		contentBox:	null,
		scrollBar:	null,
		_wheelFlag:  0,
		_wheelData:	-1,
		timeID:		null,
		options: null,
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
			this.scrollBox = $({className: 'view-scrollBox', style:$.STYLE_NBODY + 'display:block;border-radius:10px;background: #f3f3f3;'}).appendTo(this.mainBox);
			this.scrollBar = $({className: className, style:$.STYLE_NBODY + 'background:#d8d8d8;border-radius:10px;position:absolute;width:6px;top:0;'}).appendTo(this.scrollBox);
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
				position:	'absolute',
				background:	'#f3f3f3',
				width:	this.scrollBar.width() + 'px',
				height:	this.mainBox.height() + 'px',
				left:	(mainBoxWidth - _barWidth - _border) + 'px',
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
                event = $.Event.fixEvent(event);
				var mainHeight = self.mainBox.height(),
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
				$(this).css('background', '#c8c8c8');
			}, function(event){
				$(this).css('background', '#d8d8d8');
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
	var chatView = $.Class.create();
	chatView.prototype = {
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
		_eventFunction: emptyFunc,
		scroll: null,
		_listenNumber: 0,
		_listenTimeID:null,
		_inputTimerID: null,
		buttonSelectors: null,
		imageHash: {}, //2015.11.01 记录已出现的图片的msgid
		evalRepeatClick: true, //2016.02.14 预防重复点击评价
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
			$({className: 'header-chatrecord-title', style:$.STYLE_BODY + 'font-weight:bold;float:left;margin:15px 10px 5px 20px;height:20px;visibility:visible;overflow:hidden;display:none;color:#ffffff;'}).appendTo( this.options.chatHeader.find('.chat-header-body') ).html( $.lang.button_view );
			}
			if( !this.options.chatHeader.find('.header-chatrecord-close').length ){
			$({className: 'header-chatrecord-close', style: $.STYLE_NBODY + 'float:right;cursor:pointer;margin:20px 5px 0 0;width:20px;height:20px;position:relative;display:none;'}).appendTo(this.options.chatHeader);
			}

			this._chatsHeader   = this.options.chatHeader.find('.header-chatrecord-title,.header-chatrecord-close');
			this._chatsElement  = this.chatElement.find('.chat-view-float-history');

			this._bind();
			this._specialForChe();
			this.callChatResize(this.options.width, this.options.height);
		},

		_specialForChe: function() {


			var che_head = $('.ntalk-window-head'),
				che_icon = che_head.find('.chat-header-icon'),
				che_head_body = che_head.find('.chat-header-body'),
				che_head_name = che_head_body.find('.chat-header-name'),
				che_head_min = che_head.find('.ntalk-button-min'),
				che_head_max = che_head.find('.ntalk-button-maxresize'),
				che_head_close = che_head.find('.ntalk-button-close'),

				btn = $('.chat-view-button'),

				che_messagebox = $('.chat-view-window-history');

				che_messagebox.css({
					"backgroundColor": "#f3f3f3",
					"height": "333px"
				})


			var special_lang = {
				name: "\u5728\u7ebf\u5ba2\u670d"
			};

			che_head.css({
				width: "455px",
				height: "48px"
			});

			che_icon.css({
				width: "122px",
				height: "27px",
				visibility: "visible",
				left: "16px",
				bottom: "12px",
				backgroundPosition: "-298px -42px",
				border: "none",
				backgroundColor: "transparent"
			});

			che_head_body.css({
				top: "0px"
			});

			che_head_name.css({
				fontSize: "12px",
				color: "#333",
				// position: ""
				visibility: "visible",
				margin: "17px 0 0 145px",
				fontWeight: "normal"
			}).html(special_lang.name);

			che_head_min.css({
				width: "32px",
				height: "32px",
				margin: "0",
				backgroundPosition: "10px 11px"
			}).hover(function(){
				$(this).css({
					backgroundColor: "#df9d00",
					backgroundPosition: "10px 11px"
				})
			}, function(){
					$(this).css({
						backgroundColor: "transparent",
						backgroundPosition: "10px 11px"
					})
			})

			che_head_max.css({
				width: "32px",
				height: "32px",
				margin: "0",
				backgroundPosition: "-13px 10px"
			}).hover(function(){
				$(this).css({
					backgroundColor: "#df9d00",
					backgroundPosition: "-13px 10px"
				})
			}, function(){
					$(this).css({
						backgroundColor: "transparent",
						backgroundPosition: "-13px 10px"
					})
			})

			che_head_close.css({
				width: "32px",
				height: "32px",
				margin: "0",
				backgroundPosition: "-36px 10px"
			}).hover(function(){
				$(this).css({
					backgroundColor: "#df9d00",
					backgroundPosition: "-36px 10px"
				})
			}, function(){
					$(this).css({
						backgroundColor: "transparent",
						backgroundPosition: "-36px 10px"
					})
			});

			btn.css({
				width: "24px",
				height: "24px"
			}).hover(function(){
				$(this).css({
					backgroundColor: "#ffb2b2"
				})
			}, function(){
				$(this).css({
					backgroundColor: "transparent"
				})
			})

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
						this.scroll = new myScroll(this.chatHistory, this.chatHistory.find('ul'), 'chat-view-scrollBar', {width: 411});
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
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;padding:5px 30px 0 0;',
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;padding:5px 0 0 30px;text-align:right;',
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;padding:5px 10px 0 10px;text-align:center;',
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:none;padding:5px 30px 0 0;',
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
				cstyle	= style[3];
				selector= 'systembottom';
				break;
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
				//已存在客服输入状态时，强制不显示
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
          //转接的时候显示离开回话&&加入回话
            if( data.enter && data.enter == 1){

            }else{
                this.chatHistory.find('li.' + selector).remove();
            }
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
					// 收到消息
					$('.chat-view-xiaoneng-version').css('visibility', 'hidden');
				}
			}

			//客服输入状态消息3秒后隐藏
			//2017.05.08 直接删除了原有的客服输入部分逻辑
			// if( selector == 'systembottom' ){
			// 	clearTimeout(this._inputTimerID);
			// 	this._inputTimerID = null;
			// 	this._inputTimerID = setTimeout(function(){
			// 		self.chatHistory.find('li.systembottom').css('visibility', 'hidden');
			// 	}, 3E3);
			// }

			if( this.scroll ){
				this.scroll.scrollBottom();
			}

			//2015.09.28 加载链接URL解析内容
			if( data && data.type==1 ){
				this.loadLinkContainer(data.msgid);
			}
            //2016.10.12 自定义标签添加
            if ( typeof(data.msg)==="string" &&  data.msg.indexOf('rightTag="true"') > -1 ){
                this.linkInPageFilter(data.msgid);
            }
            //2016.10.13自动添加的标签栏
			if( data && /^(1|2|4|6|9|13|8)$/i.test(data.type) ){
				this.updateMessage(data.msgid, data.type, data, position==='left');
			}

			//2015.07.01 解决欢迎语ie7错位问题
			if($(".welcome").length==1){
				$(".welcome").css("visibility","hidden").css("visibility","visible");
			}

			return selector;
		},
        /*2016.10.20
        *自定义标签过滤链接
        *
        */
        linkInPageFilter: function(msgid){
            var self = this;
            var linkInPageContains = this.chatHistory.find('.' + msgid ).last().find('.view-history-body').find("span");
            linkInPageContains.each(function( i ,linkElement){
                var url = $(linkElement).attr('src');
                var title = $(linkElement).attr('title') || '自定义标签';
                var closebutton = $(linkElement).attr('closebtn') || true;
                if( url.indexOf(self.mode.config.linkinpage)){
                    $(linkElement).attr('href','javascript:;').attr('linkinpagesrc',url);
                    linkElement.onclick = null;
                    $(linkElement).bind('click',function(){
                        self.mode.manageMode.view._addRightTag( url,title,closebutton,self);
                    })
                }
            })
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
				bodyElement = liElement.find('.view-history-body').last();
				//maxHeight = $(".chat-view-window-history").height()-90;

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
/*			（6.8.2合版）去掉更多按钮
			curHeight = bodyElement.height();
			if($.base.checkID(data.userid) == $.CON_CUSTOMER_ID && (bodyElement.scrollHeight() > maxHeight || bodyElement.height() > maxHeight)){
				bodyElement.css({
					'height':	maxHeight+"px",
					'overflow-y':'hidden'
				});

				liElement.find('.view-history-more').display(1);
			}*/

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

                            var hzm = '#image';

                            if($(imageElement).attr('robotImg')){
                                hzm = '#robotImg#image';
                            }

							$.require(imageurl + hzm, function(image){
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
					// 展示商品信息
					var attr, k, html = [], options, json = data.msg.item || data.msg.items || {};
					if( !json || $.isEmptyObject(json) ){
						return;
					}
					json.url = json.url || SCRIPT_URL;
					if( json.name ){
						html.push( '<a href="',json.url,'" target="_blank" style="' + $.STYLE_BODY + 'color:#0479D9;font-weight:bold;">' + json.name + '</a>' );
					}
					$.each(json, function(k, productAttr){
						if( $.isArray(productAttr) ){
							productAttr[1] = (k.indexOf('price')>-1&&json.currency&&(productAttr[1]+'').indexOf(json.currency)<=-1 ? json.currency : '') + '' + productAttr[1];

							html.push( '<div style="' + $.STYLE_BODY + '"><span style="' + $.STYLE_BODY + '">' + productAttr[0] + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + '</span>' + productAttr[1] + '</div>' );

							$.Log(productAttr[0] + ': ' + productAttr[1]);
						}else if( $.isObject(productAttr) ){
							productAttr.v = (k.indexOf('price')>-1&&json.currency&&(productAttr.v+'').indexOf(json.currency)<=-1 ? json.currency : '') + '' + productAttr.v;

							html.push( '<div style="' + $.STYLE_BODY + '"><span style="' + $.STYLE_BODY + '">' + productAttr.k + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + '</span>' + productAttr.v + '</div>' );

							$.Log(productAttr.k + ': ' + productAttr.v);
						}else if( $.lang.goodsinfo[k] ){
							//添加货币符号
							productAttr = (k.indexOf('price')>-1&&json.currency&&(productAttr+'').indexOf(json.currency)<=-1 ? json.currency : '') + productAttr;

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
					case "8":
					var html = [],
						sourceurl = data.url,
						broswerAgent=navigator.userAgent.toLowerCase();
					if( data.from && data.from == 1 && (($.browser.msie && $.browser.ieversion === 9) || broswerAgent.indexOf('firefox') > -1 )){
						html.push([
							'<video class="ntalker-for-miya-video" style="width:240px;transform:rotate(90deg);-ms-transform:rotate(90deg);margin-left:-30px;margin-top:30px;height:180px"  loop>',
		  						'<source src="'+sourceurl+'" type="video/mp4">',
							'</video>',
							'<span class="ntkf-video-button" style="display:block;width:52px;height:52px;background:url('+ $.button +') center no-repeat;background-size:100%;position:absolute;top:50%;left:0;right:0;margin:-26px auto 0;"></span>'].join(''));
					bodyElement.css({'width':'180px','height':'240px'});
					}else if($.browser.msie && $.browser.ieversion < 9 ){
						html.push(['<span>',$.lang.cant_play_video,'</span>',
					 	].join(''))
					}else{
						html.push([
							'<video class="ntalker-for-miya-video" style="width:100%;height:100%;"  loop>',
		  						'<source src="'+sourceurl+'" type="video/mp4">',
							'</video>',
							'<span class="ntkf-video-button" style="display:block;width:52px;height:52px;background:url('+ $.button +') center no-repeat;background-size:100%;position:absolute;top:50%;left:0;right:0;margin:-26px auto 0;"></span>'].join(''));
						bodyElement.css({'width':'137px'});
					}
					bodyElement.parent().css({
						'padding':'3px'
					});
					bodyElement.css({
                    	'line-height':'0',
                    	'padding':'0',
                    	'position':'relative'
                    }).html(html);
					$('.ntkf-video-button').click(function(e){
						e.stopPropagation();
						$(this).css('display','none');
						$(this).parent().find('video').get(0).play();
					})
					$('.view-history-body').click(function(event){
                        event.stopPropagation();

                        $(this).find('video').get(0).pause();

                        $(this).find('.ntkf-video-button').css('display','block');

                    });
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
				        position = type == 2 ? '-98px -145px' : '0 -245px';
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
				            position = type == 2 ? '0 -145px' : '-98px -245px';

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

				            $.require(data.url + '#rnd#image', function(image) {
                                var imageHeight;
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
				                    	width = 138;
				                    	if(image.height < 100){
				                    		height = 100;
				                    		imageHeight = (!$.browser.Quirks && ($.browser.ieversion == 6 || $.browser.ieversion == 7)) ? image.height : height;
				                    		imageHtml = '<div style="width:138px;height:'+imageHeight+'px;padding:' + (100 - image.height) / 2 + 'px 0;box-sizing:border-box;text-align:center;background:white;border-radius:5px;max-width:220px;max-height:160px">' + imageHtml + '</div>';
				                    	}else{
				                    		imageHtml = '<div style="width:138px;height:' + image.height + 'px;text-align:center;background:white;border-radius:5px;max-width:220px;max-height:160px">' + imageHtml + '</div>';
				                    	}
				                    } else if (image.height < 100) {
				                        height = 100;
				                        imageHeight = (!$.browser.Quirks && ($.browser.ieversion == 6 || $.browser.ieversion == 7)) ? image.height : height;
				                        imageHtml = '<div style="height:'+imageHeight+'px;width:' + image.width + 'px;padding:' + (100 - image.height) / 2 + 'px 0;box-sizing:border-box;text-align:center;background:white;border-radius:5px;max-width:220px;max-height:160px">' + imageHtml + '</div>';
				                    }
				                    //IE7 兼容处理
				                    liElement.find('table').css('width', ( (width < 220 ? width : 220) + 26) + 'px');

				                    //设置最大宽高
				                    $.Log('upload file(width:' + image.width + ', height:' + image.height + ') success:' + data.url);
				                    bodyElement.css({
				                        'background': 'none',
				                        'cursor': 'pointer',
				                        'width': width < 220 ? width + 'px' : '220px',
				                        'height': height < 160 ? height + 'px' : '160px',
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
				                            'border': '1px solid #e2e2e2'
				                        });
				                    } else {
				                        bodyElement.parent().css({
				                            'padding': '2px',
				                            'border': '1px solid #78bde9'
				                        });
				                    }

				                    //设置尖角位置为距离顶部15px
				                    var angle = liElement.find('.view-history-angle');
				                    angle.css('margin-top', '15px');
				                    angle.parent().css('vertical-align', 'top');
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
            //途虎资料卡片，纯连接的话去掉连接
            if( self.siteid == "kf_9739" ){
                var flag = true;
                for( var i = 0 ; i<root[0].parentElement.childNodes.length ; i++ ){
                    if( root[0].parentElement.childNodes[i].nodeType == 3 ){
                        flag = false;
                    }
                }
                if( flag ){
                    for( var j=0 ; j<$(root[0].parentElement).find('div').length ; j++){
                        if( nTalk(root[0].parentElement).find("div").eq(j)[0].className == "" ){
                            nTalk(root[0].parentElement).find("div").eq(j).find('a').css("display","none");
                        }
                    }
                }
            }
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
				"width":            "300px"
			});
			linkImage = $({className:'link-image',style: $.STYLE_BODY + 'margin:10px;background-color:#fff;width:77px;height:77px;overflow:hidden;float:left;display:inline-block;'}).appendTo( root );
			container = $({className:'link-container',style: $.STYLE_BODY + 'overflow:hidden;zoom:1;'}).appendTo( root );

			$({className:'link-title',style: $.STYLE_BODY + 'margin:10px 0 0 0;width:100%;height:24px;white-space:nowrap;text-overflow:ellipsis;-o-text-overflow:ellipsis;overflow:hidden;'}).appendTo( container ).html(
				['<a href="', data.url, '" target="_blank">', data.title, '</a>'].join('')
			);

			$({className:'link-desc', style: $.STYLE_BODY + 'margin:5px 0 10px 0;width:100%;max-height:60px;overflow:hidden;'}).appendTo( container ).html( $.enCut(data.description, 96, 1) + '&nbsp;' );
            $({className:'link-customer', style: $.STYLE_BODY + 'margin:5px 0 10px 0;width:100%;max-height:60px;overflow:hidden;'+((nTalk.global.siteid == "kf_9739" || nTalk.global.siteid == "kf_3004" ) ? 'color:#f00;' : '')}).appendTo( container ).html( data.customer );
            $({className:'link-clear',style: $.STYLE_BODY + 'clear:both;'}).appendTo( root );

            linkImage.css('margin', ((root.height()-linkImage.height())/2 + 'px') + ' 10px');

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
                var showMessage = message.replace(self.textEditor.val(), "<span style='color:#ff6f40'>"+self.textEditor.val()+"</span>");

				var li = $({tag: 'LI', talk_index: i, className: '', style:$.STYLE_BODY + 'padding:0 0 0 20px;list-style:none;line-height:28px;height:28px;overflow:hidden;cursor:pointer;'}).appendTo(list.find('ul')).html(showMessage).hover(function(event){
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

                    setTimeout(function(){
                        list.css('display', 'none');
                    }, 200);

				});

                if(type){
                    $(li).attr('robotmsg', message);
                }
			});

			list.css({
				'display':	'block',
				'top':      'auto',
				'bottom':   '0px'
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
		showInputState: function(position){
			// if (this._inputStateTimeID && position === undefined) {
			//     return;
			// }
			$('.chat-view-xiaoneng-version').css('visibility', 'visible');
			if($('.chat-view-xiaoneng-version').css('visibility')=='visible'){
				clearTimeout(this._inputTimerID);
			    this._inputTimerID = null;
			    this._inputTimerID = setTimeout(function(){
				//2016.03.23
				$('.chat-view-xiaoneng-version').css('visibility', 'hidden');
			 }, 3E3);
			}

			// position = position ? position : -22;

			// var self = this,
			//     elementWait = this.chatHistory.find('.view-history-body-wait');

			// elementWait.html($.lang.system_printing || '').css({
			//     'position': 'relative',
			//     'width': $.enLength($.clearHtml($.lang.system_printing || '')) * 7 + "px",
			//     'left': '10px',
			//     'font-size': '12px',
			//     'line-height': '20px'
			// });

			// $({ tag: 'span', style: 'display:block; left: -24px; top:-20px; position:relative; width:20px; height:20px; background: url(' + $.sourceURI + 'images/mobileicon.png) -110px -70px no-repeat' }).appendTo(elementWait);
			// $({ id: 'show-input-status-loading', tag: 'span', style: 'display:block; left: -14px; top:-38px; position:relative; width:20px; height:20px' }).html(this.loadingPoint ? this.loadingPoint : '...').appendTo(elementWait);

			// var count = 3;
			// if (!this._inputStatusLoadingInter) {
			//     this._inputStatusLoadingInter = setInterval(function() {
			//         self.loadingPoint = '';
			//         count--;
			//         for (var i = 0; i < count; i++) {
			//             self.loadingPoint += '.';
			//         }
			//         $('#show-input-status-loading').html(self.loadingPoint);
			//         if (count == -1) {
			//             count = 4;
			//         }
			//     }, 1000);
			// }

			// this._inputStateTimeID = setTimeout(function() {

			//     if (!elementWait.length) {
			//         clearTimeout(self._inputStateTimeID);
			//         clearInterval(self._inputStatusLoadingInter);
			//         self._inputStateTimeID = null;
			//         return;
			//     }

			//     position = position <= -52 ? -22 : position - 10;
			//     elementWait.css('background-position', position + 'px -250px');

			//     self.showInputState(position);
			// }, 5E2);

		},
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

			//分别设置访客v_、客服d_,宽度、高度、边界、距离左侧、顶部距离
			var v_width = 265, v_height = [104, 76, 28], v_border = 'none', v_left = [11, 78], v_top = [8, -44];
			var d_width = 270, d_height = [110, 80, 30], d_border = '1px solid #e2e2e2', d_left = [13, 80], d_top = [10, -42];

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
			var statusIconPosition = success ? ' -287px -96px ' : ' -159px -37px ';
			//显示状态名称
			var status =  success ? $.lang.news_trans_success : $.lang.news_trans_failure;
			//下载区域显示内容
			var download =  success ? $.lang.news_download : '';

            //文件上传html:结构 body{top:{icon, content: {title,size,status,status-icon}}, bottom:{bottom}}
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
			angle.css('margin-top', '15px');
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
						'<input type="button" class="view-alert-submit" value="' + $.lang.evaluation_button_submit + '" style="' + $.STYLE_BODY + 'padding:0 15px;border:1px solid #878787;background:#ebe9e9;height:28px;color:#333;line-height:24px;display:inline-block" />',
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
					$({className: 'textarea-' + formOptions[i].name, maxsize: formOptions[i].max, style: $.STYLE_BODY + 'font-size:16px;font-weight:bold;color:#ccc;float:right;position:absolute;right:15px;top:70px;'}).appendTo( areaElement ).html('0/' + formOptions[i].max/2);
				}
			}
			dialogElement.find('table textarea').bind('keyup', function(event){
				var selector = 'table .textarea-' + $(this).attr('name');
				var color  = $.enLength($(this).val()) > dialogElement.find(selector).attr('maxsize') ? '#f00' : '#ccc';
				var inputText= Math.ceil($.enLength($(this).val()) / 2) + '/' + (dialogElement.find(selector).attr('maxsize') / 2);

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
				//2016.04.20 失败没有回调，导致1次评价，提示输入错误后，无法再次评价
				if(self.evalRepeatClick && self.evalDialog){
					self.evalRepeatClick = false;
					self.mode.submitEvaluationForm(function(){
						if( $.isFunction(callback) ) callback();

						self.evalDialog.close();
						self.evalDialog = null;
						self.evalRepeatClick = true;
					}, function(){
						self.evalRepeatClick = true;
					});
				}

				//self._hiddenDialog();
			}).gradient("top", '#f5f5f5', '#ffffff');
			//应该标题栏皮肤样式
			dialogElement.find('.chat-view-evaluation-title').gradient("top", '#ffffff', '#f5f5f5');//startColor, endColor

			return dialogElement.get(0);
		},

        createEvaluationVersion2: function(evaluateTree, callback) {
            var self = this, dialogElement;
            if( !this.evalDialog ){
                var evaluteHtml = new $.EvaluateView(evaluateTree).evaluateHtml;

                this.evalDialog = new $.DialogChat(evaluteHtml,  $.extend($.defaultStyle.evaluateWrap,{
                    parent: this.chatElement.get(0)
                }));

                $.EvaluateEvent.bindEvaluateEvent();

                $('[nodeid=submit]').click(function(event){
	                $.Event.fixEvent(event).stopPropagation();
	                //2016.02.14 预防重复点击评价
	                //2016.04.20 失败没有回调，导致1次评价，提示输入错误后，无法再次评价
	                if(self.evalRepeatClick && self.evalDialog){
	                    self.evalRepeatClick = false;
	                    self.mode.submitEvaluationForm(function(){
	                    	if( $.isFunction(callback) ) callback();

	                        self.evalDialog.close();
	                        self.evalDialog = null;
	                        self.evalRepeatClick = true;
	                    }, function(data){
	                        self.evalRepeatClick = true;

	                        for(id in data) {
	                        	$('.nt-evaluation-error').html(data[id]).display(1);
	                        }

	                    });
	                }
	            });

	            $('[nodeid=close]').click(function(event){
	                self.evalDialog.close();
	                self.evalDialog = null;
	            });
            }
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
					if(chat) chat.uploadFailure(options.action, result);
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
						if(chat) chat.uploadFailure(options.action, result);
					}else{
						//$.fIM_startSendFile('', options.action, result.oldfile, options.settingid);
						if(chat) chat.startUpload(options.action, result.oldfile);

						setTimeout(function(){
							//$.fIM_receiveUploadSuccess('', options.action, result, options.settingid);
							if(chat) chat.uploadSuccess(options.action, result);
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

			//2016.04.01
			//（6.8.2合版）留言新增配置项
			var config = this.mode.getNewMessageConfig(),
			    message_plan = config.message_plan || 1, //1：采用6.8.1中的留言样式 2：采用新版留言样式
			    link_mode = config.link_mode || "", //1：在聊窗打开留言链接 2：点击我要留言后，新开页卡打开留言链接
			    specify_link = config.specify_link || ""; //留言链接地址

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
					titlewidth:	/zh_cn|zh_tw/ig.test( $.lang.language ) ? '80px' : '140px',
					inputwidth: 'auto',
					input:{
						width:'90%',
						height:(formOptions[i].type=='textarea' ? '140px' : 'auto')
					},
					messageid:'chat-view-message-' + formOptions[i].name
				});
			}


			//2016.03.16新增disable_message:0:开启默认;1关闭默认
			//留言开启后 分为两种情况：字段message_plan  1 之前默认的情况；2自定义情况:分为两种。聊窗内打开，跳转到新链接
			//（6.8.2合版）留言新版逻辑
			switch (disableMessage) {
			    case 0:
			        switch (message_plan) {
			            case 1:
			                this.messageElement.find('.chat-view-submit-submit').gradient("top", '#f5f5f5', '#ffffff');
			                this.messageElement.find('.chat-view-message-body').css('height', (this.messageElement.height() - announHeight) + 'px');
			                this.messageElement.find('.chat-view-message-table').html([
			                    '<table cellspacing="0" cellpadding="0" border="0" style="', $.STYLE_BODY, 'margin:20px 0 0 0;width:100%;table-layout:auto;border-collapse:separate;">',
			                    '<tbody style="', $.STYLE_NBODY, '">',
			                    ([
			                        $.FORM.createInput(formOptions, null, $.lang.message_no_null),
			                        '<tr style="', $.STYLE_NBODY, '">',
			                        '<td colspan="2" style="', $.STYLE_BODY, 'text-align:center;padding:10px 0px 10px;color:#090;">',
			                        '<input style="' + $.STYLE_BODY + 'text-align:center;padding:0 20px;margin:0 auto;border:1px solid #878787;height:28px;color:#000;line-height:26px;" type="button" class="chat-view-button chat-view-submit-submit" value="' + $.lang.message_button_submit + '">',
			                        '<span class="submit_message_complete" style="', $.STYLE_BODY, 'text-align:center;color:#090;display:none;">', $.lang.message_success, '</span>',
			                        '</td></tr>'
			                    ].join('')),
			                    '</tbody></table>'
			                ].join(''));
			                break;
			            case 2:
			                switch (link_mode) {
			                    case 1:
			                        this.messageElement.find('.chat-view-message-announcement').display();
			                        this.messageElement.html([
			                            '<iframe src="' + specify_link + '" class="chat-view-message-table-iframe" name="announce_iframe" scrolling="auto" frameborder="0" style="', $.STYLE_BODY, 'display:block;width:100%;height:' + (this.messageElement.height()) + 'px;background-color:#ffffff;overflow-x:hidden;overflow-y:auto;" >',
			                            '</iframe>',
			                        ].join(''));
			                        break;
			                    case 2:
			                        this.messageElement.find('.chat-view-message-announcement').display();
			                        //2016.03.17 增加图片
			                        $.messageRest = $.sourceURI + '/images/message-rest.' + ($.browser.msie6 ? 'gif' : 'png');
			                        $.messageFish = $.sourceURI + '/images/message-fish.' + ($.browser.msie6 ? 'gif' : 'png');
			                        this.messageElement.find('.chat-view-message-message-prompt').display(1);
			                        this.messageElement.find('.chat-view-message-message-prompt').html([
			                            '<div class="chat-view-message-prompt-string"  style="width:340px;height:380px;padding:38px 0 0 40px;">',
			                            '<img src="' + $.messageRest + '" style="width:290px;height:210px;"/>',
			                            '<div style="width:290px;height:90px;background:url(' + $.messageFish + ') 140px 14px no-repeat;padding:38px 0 0 34px;">',
			                            '<span style="font-size:13px;">', $.utils.handleLinks($.lang.message_prompt), '</span>',
			                            '</div>',
			                            '</div>'

			                        ].join(''));

			                        //2016.03.16添加点击事件
			                        this.messageElement.find('.chat-view-message-prompt-string').find('a').attr('target', '_blank').attr('href', specify_link).css({
			                            'text-decoration': 'none',
			                            'margin-left': '28px',
			                            'font-size': '13px',
			                            'font-weight': 'bold',
			                            'color': 'white'
			                        });
			                        break;
			                    default:
			                        $.Log('link_mode error', 3);
			                        break;
			                }
			                break;
			        }
			        break;
			    case 1:
			        $.Log('message is close', 1);
			        break;
			    default:
			        $.Log('disableMessage error', 3);
			        break;
			}


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
		    var self = this, hashMsgId,
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
		            var hashTime = parseInt(hashMsgId.substr(0, msgid.length - 1));
		            var time = parseInt(msgid.substr(0, msgid.length - 1));
		            if (hashTime - time > 0 && hashTime - time < timeSub) {
		                nextMsgId = hashMsgId;
		                timeSub = (hashTime - time);
		            }
		        }
		        if (nextMsgId === 0) {
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
		            var hashTime = parseInt(hashMsgId.substr(0, msgid.length - 1));
		            var time = parseInt(msgid.substr(0, msgid.length - 1));
		            if (hashTime - time < 0 && hashTime - time > timeSub) {
		                lastMsgId = hashMsgId;
		                timeSub = (hashTime - time);
		            }
		        }
		        if (lastMsgId === 0) {
		            self._hideScreenImage();
		        } else {
		            self._fullScreenImage($('.' + lastMsgId).find('.view-history-body').find('img'), lastMsgId);
		        }
		    };

		    container.find('.view-next-picture').addEvent('click', this.nextClick);
		    container.find('.view-prev-picture').addEvent('click', this.prevClick);

		    container.find('.view-fullScreen-download').removeEvent('click', downloadImage).bind('click', downloadImage);
            //(6.8.2)富媒体图片隐藏下载按钮
            if($(image).attr('sourceurl') == $(image).attr('src')){
                container.find('.view-fullScreen-download').display(0);
                container.find('.view-next-picture').display(0);
                container.find('.view-prev-picture').display(0);
            }else{
                container.find('.view-fullScreen-download').display(1);
                container.find('.view-next-picture').display(1);
                container.find('.view-prev-picture').display(1);
            }

		    $(document).bind('keypress', function(event) {
		        if ($.Event.fixEvent(event).keyCode != 27) {
		            return;
		        }
		        self._hideScreenImage();
		    });
		    //2016.03.29 添加重新加载页面 添加类
		    $(window).bind('resize', function(event) {
		        $('.view-fullScreen-background,.view-fullScreen-iframe,.view-fullScreen-container').css({
		            width: $(window).width() + 'px',
		            height: $(window).height() + 'px'
		        });
		        //2016.06.2目的使前翻和后翻按钮进行重新调整位置
		        $('.view-prev-picture div,.view-next-picture div').css({
		            'top': ($(window).height() - 40)/2 + 'px'
		        });
		    });

		    if (container.find('img').attr('src') == src) {
		        return;
		    }

		    //2016.03.30 修改加载图片
		    container.find('td').css({
		        'background': 'url(' + $.imageloading + ') no-repeat center center'
		    });

		    $.require(src + '#image', function(element) {
		        $.Log('nTalk._fullScreenImage() width:' + element.width + ', height:' + element.height);
		        var maxw = $(window).width(),
		            maxh = $(window).height(),
		            attr = $.zoom(element, maxw - 100, maxh);
		        //如果显示之前发现，存在后来加载出来的图片，先remove掉
		        if (container.find('td img').length > 0) {
		            container.find('td img').remove();
		        }
		        //由于container中添加了左右按钮，改为append
		        container.find('td').append('<img src="' + src + '" width="' + Math.floor(attr.width) + '" height="' + Math.floor(attr.height) + '" style="' + $.STYLE_NBODY + 'margin:0 auto;max-width:'+(maxw-100)+'px;max-height:'+maxh+'px"/>');
		        //2016.03.29 加载条隐藏
		        if (container.find('td img')) {
		            container.find('td').css({
		                'background-image': ''
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
					'<td valign="middle" align="center" style="',$.STYLE_NBODY,'text-align:center;vertical-align:middle;background:url(',$.imageloading,') no-repeat center center;">',
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
			var systemMsgLength = 'auto';

			if ( type === 'system' && $.browser.oldmsie) {
				systemMsgLength =  Math.min($.enLength($.clearHtml(data.msg)) * 6, 340);
			}
			if( type === 'otherinfo' ){
				type = 'left';
				data.userid = '';
				data.name = '';
				// message body for faq
				data.msg = [
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
				[// send message
					'<table style="',$.STYLE_NBODY,'float:right;_float:none;border-collapse:separate;" class="view-history-right" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'text-align:right;">',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td class="view-history-content" style="',$.STYLE_BODY,'max-width:310px;padding:8px;background:#fdc235;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;">',
									'<div class="view-history-body" style="min-height:20px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;/*width:100px;*/min-height:50px;height:85px;*font-size:0px;*line-height:0px;*font-family:Arial;' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;',
									(data.type == 1 ? 'color:#333;font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' 12px/160% Arial,SimSun;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									(data.type == 1 ? data.msg : ''),
									'</div>',
									'<div class="view-history-progress" style="',$.STYLE_NBODY,'display:none;border-top:1px solid #30c2fd;background:#fff;height:5px">',
										'<div class="view-history-upload-progress" style="',$.STYLE_NBODY,'height:5px;width:20%;background:#30c2fd;"></div>',
									'</div>',
								'</td>',
								'<td style="',$.STYLE_NBODY,'width:20px;vertical-align:middle;overflow:visible;">',
									//尖角添加className
									// '<div class="view-history-angle" style="',$.STYLE_NBODY,'position:relative;left:-1px;z-index:1;width:20px;height:18px;background:url(',$.imageicon,') no-repeat -1px -63px;"></div>',//
									'<div style="',$.STYLE_NBODY,'width:60px;height:40px;float:right;position:relative;">',
										'<div style="'+$.STYLE_NBODY+'width:40px;height:40px;float:right;background:url('+$.themesURI+'chaticon.png) no-repeat -305px -274px;margin-right:9px;"></div>',
										'<div class="view-history-angle" style="',$.STYLE_NBODY,'position:absolute;left:-1px;top:13px;z-index:1;width:15px;height:18px;background:url(',$.themesURI,'chaticon.png) no-repeat -308px -22px;margin:0;"></div>',//
									'</div>',
									'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_BODY,'overflow:visible;text-align:right;position:relative;">',
									'<span class="view-history-time" style="',$.STYLE_BODY,'float:right;color:#999;line-height:26px;">',$.formatDate(data.timerkeyid),'</span>',
									'<span class="view-chat-hidden-area" style="',$.STYLE_NBODY,'float:right;width:1px;height:26px;overflow:visible;position:relative;top:0px;">',
										'<div class="view-history-status" style="',$.STYLE_BODY,'display:none;color:#010002;line-height:26px;width:280px;position:absolute;left:-280px;top:0px;">',
											'<div class="view-history-status-link" style="',$.STYLE_BODY,'float:right;line-height:26px;height:26px;"></div>',
											'<div class="view-history-status-icon" style="',$.STYLE_NBODY,'margin:7px 3px;float:right;display:block;line-height:26px;width:10px;height:10px;background:#fff url(',$.imageicon,') no-repeat -140px -39px;"></div>',
										'</div>',
									'</span>',
								'</td>',
								'<td style="',$.STYLE_NBODY,'"></td>',//null
							'</tr>',
						'</tbody>',
					'</table>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				/left|bottom/gi.test(type) ? 
				[// received message
					'<table style="',$.STYLE_NBODY,'float:left;float:none;table-layout:auto;border-collapse:separate;" class="view-history-left" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'">',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_NBODY,'width:20px;vertical-align:middle;overflow:visible;">',
									// add className for angle
 									'<div style="',$.STYLE_NBODY,'width:52px;height:40px;position:relative;margin-left: 9px">',
										// if we receive with logo and it has a 'welcome' msgid
										// treat the logo field as a img label
										(data.logo && data.msgid != 'welcome' ? 
											'<img style="'+$.STYLE_BODY+'width:40px;height:40px;border-radius:40px;-moz-border-radius:40px;-webkit-border-radius:40px;float:left;display:block;text-align:left;"  src="'+data.logo+''+'" />' 
										:
											// else we treat this message as a faq or welcome message
											// show the default icon of dest
											'<div style="'+$.STYLE_BODY+'width:40px;height:40px;border-radius:40px;-moz-border-radius:40px;-webkit-border-radius:40px;float:left;display:block;text-align:left;margin-right:3px;background:url('+$.themesURI+'chaticon.png) no-repeat -306px -222px;"></div>'),
										'<div class="view-history-angle" style="',$.STYLE_NBODY,'position:absolute;right:-2px;top:13px;z-index:1;width:20px;height:18px;background:url(',$.imageicon,') no-repeat -284px -23px;"></div>',
									'</div>',
								'</td>',
								'<td class="view-history-content" style="',$.STYLE_BODY,'max-width:310px;padding:8px;background:#ffffff;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px">',
									'<div class="view-history-body" style="min-height:20px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;/*width:100px;*/min-height:50px;height:85px;*font-size:0px;*line-height:0px;*font-family:Arial;' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;',(type=='bottom' ? 'width:auto;' : ''),
									(data.type == 1 ? 'color:#333; font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' 12px/160% Arial,SimSun;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									(/^(1|9)$/i.test(data.type) ? data.msg : ''),
									'</div>',
								'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_BODY,'overflow:visible;position:relative;">',
									'<span class="view-history-more" style="',$.STYLE_BODY,'margin-right:5px;float:left;color:blue;cursor:pointer;line-height:26px;display:none;">',$.lang.button_more,'</span>',
									// show dest name
									(data.userid && !this.mode.isVisitor(data.userid)&&data.systype != (4) ?
										['<span class="view-history-destname" style="',$.STYLE_BODY,'padding-right:5px;float:left;color:#999;line-height:26px;">',
											data.name,
										'</span>'].join('') :
									''),
									'<span class="view-history-time" style="',$.STYLE_BODY,'float:left;color:#999;line-height:26px;">',
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
				[// sysMessage enterPrise logo
					'<div class="view-history-system" style="',$.STYLE_BODY,'background:transparent;line-height:180%;marign:0 auto;padding:20px 0;text-align:center;word-break:break-all;word-wrap:break-word;">',
						data.msg,
					'</div>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				type === 'goods' ?
				[// product message
					'<table style="',$.STYLE_NBODY,'float:left;width:100%;table-layout:auto;border-collapse:separate;" class="view-history-goods" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'text-align:center;">',
						'<tr style="',$.STYLE_NBODY,'">',
						'<td class="view-history-goods-image" style="',$.STYLE_BODY,'width:50%;min-width:150px;text-align:center;"></td>',
						'<td class="view-history-goods-info" style="',$.STYLE_BODY,'width:50%;text-align:left;"></td>',
						'</tr>',
						'<tr style="',$.STYLE_NBODY,'"><td colspan="2" style="',$.STYLE_NBODY,'height:10px;width:100%;"><div style="',$.STYLE_BODY,'margin:0 auto;background:#FFF url(',$.imageicon,') no-repeat 85px -80px;height:10px;width:391px;visibility: hidden;"></div></td></tr>',
						'</tbody>',
					'</table>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				[// common sysMessage
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
			var CON_STYLE_SHADOW = '';
			var manualText = ($.server.robot == 1) ? $.lang.button_switch_manual : "";
			var text_holder_default = '\u6211\u6709\u95ee\u9898\u002c\u6211\u60f3\u95ee\u002e\u002e\u002e';
			var dist_is_inputting = '\u5bf9\u65b9\u6b63\u5728\u8f93\u5165\u4fe1\u606f\u002e\u002e\u002e'
			return type=='load' ?
				[
					'<div class="chat-view-load-icon" style="',$.STYLE_NBODY,'margin:0 auto;width:100px;height:33px;background:transparent url(',$.imageloading,') no-repeat 0px 0px;"></div>',
					'<div class="chat-view-load-info" style="',$.STYLE_BODY,'text-align:center;">',$.lang.chat_info_loading,'</div>',
					'<div class="chat-view-load-error" style="',$.STYLE_BODY,'text-align:center;margin:120px auto 0;display:none;">',$.lang.chat_info_failure,'<!--<span style="',$.STYLE_BODY,'cursor:pointer;color:#005ffb;text-decoration:none;">',$.lang.chat_info_reload,'</span>--></div>'
				].join('') :
				type=='window' ?
				[
					// show history message
					'<div class="chat-view-float-history" style="',$.STYLE_BODY,'width:100%;height:270px;height:267px\\0;_height:269px;background:#fff;padding-top:1px solid #fff\\0;position:absolute;overflow:hidden;z-index:99;display:none;box-shadow:0 5px 3px #888888;">',
						'<iframe class="chat-view-float-iframe" scrolling="no" frameborder="0" style="',$.STYLE_BODY,'display:block;width:100%;height:100%;">',
						'</iframe>',
					'</div>',
					'<div class="chat-view-window-history" style="',$.STYLE_BODY,'width:100%;height:333px;height:267px\\0;_height:269px;background-repeat:no-repeat;background-position:center bottom; padding-top:1px solid #fff\\0;position:relative;overflow-x:hidden;overflow-y:scroll;">',
						'<ul style="',$.STYLE_NBODY,'list-style:none;margin:10px 0px 10px 0px;">',
							//'<li style="',$.STYLE_NBODY,'list-style:none;"></li>',
						'</ul>',
					'</div>',
					'<div class="chat-view-window-toolbar" style="',$.STYLE_BODY,'height:28px;width:100%;background:#fff;">',
						// ditribute dest
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-window-status-info" style="',$.STYLE_BODY,'background:#66ccff;overflow:hidden;margin-left:10px;width:380px;line-height:30px;height:30px;position:absolute;top:-30px;z-index:99;text-align:center;display:none;"></div>',
						'</div>',
						//2015.01.05 添加输入提示建议
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-suggest-list chat-view-span" style="',$.STYLE_NBODY,'border:1px solid #999;background:#fafafa;width:400px;line-height:30px;height:auto;position:absolute;top:-2px;left:2px;z-index:999;display:none;">',
								'<ul style="',$.STYLE_BODY,'list-style:none;"></ul>',
							'</div>',
						'</div>',
						'<div class="chat-view-button chat-view-face" title=',$.lang.button_face,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:2px 0 2px 10px;_margin-left:5px;border:0px solid #ccc;height:22px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -97px 2px;">',
							'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-window-face" style="',$.STYLE_NBODY,'display:none;position:absolute;left:-8px;top:-229px;border:1px solid #979A9E;width:273px;height:224px;background:#fff;z-index:1000002;cursor:auto;border-radius:3px;overflow:hidden;">',

								'</div>',
							'</div>',
						'</div>',
						'<div class="chat-view-button chat-view-image" title=',$.lang.button_image,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:3px 0 3px 3px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -120px 2px;"></div>',
						'<div class="chat-view-button chat-view-file" title=',$.lang.button_file,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:3px 0 3px 3px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -142px 2px;"></div>',
						'<div class="chat-view-button chat-view-history" title=',$.lang.button_save,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:3px 0 3px 3px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -318px 1px;"></div>',
						//2014.11.11 添加查看聊天记录按钮
						'<div class="chat-view-button chat-view-load-history" title=',$.lang.button_view,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:3px 0 3px 3px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -220px -40px;"></div>',
						'<div class="chat-view-button chat-view-evaluate" title=',$.lang.button_evaluation,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:3px 0 3px 2px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -185px 2px;"></div>',
						'<div class="chat-view-button chat-view-capture" title=',$.lang.button_captureImage,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:3px 0 3px 3px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -163px 2px;"></div>',
						'<div class="chat-view-capture-options" style="',$.STYLE_BODY,'color:#525252;float:left;margin-top:8px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;">',
							'▼',
							'<div class="chat-view-capture-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:1px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-options-capture-menu" style="',$.STYLE_BODY,'display:none;padding:1px;background:#fff;position:absolute;left:-89px;top:-79px;border:1px solid #ccc;width:100px;*width:102px;_width:102px;height:auto;z-index:1000002;cursor:cursor;">',
									//截图方式
									'<div class="view-option-hidden talk_selected" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;background:#efefef;">',$.lang.button_capture_hidden_chatWin,'</div>',/*',隐藏窗口,'*/
									'<div class="view-option-show" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;">',$.lang.button_capture_show_chatWin,'</div>',/*',不隐藏窗口,'*/
								'</div>',
							'</div>',
						'</div>',
						//2015.01.06 机器要转人工客服按钮
						'<div class="chat-view-switch-manual chat-view-robot-button" title="',$.lang.button_switch_manual,'" style="',$.STYLE_BODY,'color:#525252;float:left;padding:0 0 0 20px;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:auto;background:url(',$.imageicon,') no-repeat -265px -40px;display:none;">',manualText,'</div>',
						'<div class="chat-view-button chat-view-change-csr" title=',$.lang.button_change_csr,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -243px -40px;"></div>',
						'<div class="chat-view-button chat-view-exp" style="',$.STYLE_BODY,'color:#525252;float:right;margin:4px 3px;padding:0 3px;border:0px solid #ccc;height:20px;display:none;cursor:pointer;">',$.lang.button_more,' &gt;</div>',
					'</div>',
					'<div class="chat-view-window-editor" style="',$.STYLE_BODY,'height:68px;width:100%;overflow:hidden;color:#333;">',
						'<textarea placeholder="',text_holder_default,'" style="',$.STYLE_BODY,CON_STYLE_SHADOW,'margin:0px;padding:10px 10px 0 10px;width:391px;width:411px\\9;height:63px;height:93px\\9;outline:0px solid #08f;border:0px solid #08f;resize:none;overflow:hidden;overflow-y:auto;outline:none;color:#333;"></textarea>',
					'</div>',
					'<div class="chat-view-window-bottom" style="',$.STYLE_BODY,'height:34px;width:100%;">',
						'<div class="chat-view-options" style="',$.STYLE_BODY,'margin:6px 10px 6px 0;float:right;border:1px solid #ccc;width:14px;height:26px;line-height:25px;text-align:center;cursor:pointer;display: none;">',
							'▼',
							'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:1px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-options-menu" style="',$.STYLE_BODY,'display:none;padding:1px;background:#fff;position:absolute;left:-89px;top:-79px;border:1px solid #ccc;width:100px;*width:102px;_width:102px;height:auto;z-index:1000002;cursor:cursor;">',
									//发送消息方式
									'<div class="view-option-enter talk_selected" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;background:#efefef;">',$.lang.button_enter,'</div>',
									'<div class="view-option-ctrl+enter" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;">',$.lang.button_ctrl_enter,'</div>',
								'</div>',
							'</div>',
						'</div>',
						'<div class="chat-view-submit" style="',$.STYLE_BODY,'color: #fff;float:right;width:75px;height:25px;line-height:25px;text-align:center;cursor:pointer;background-color:#fdc235;margin-right: 9px;border-radius: 4px;">',$.lang.chat_button_send,'(S)</div>',
						'<span class="chat-view-end-session" style="',$.STYLE_BODY,'text-decoration:none;float:right;margin-right:6px;height:23px;line-height:23px;cursor:pointer;width:85px;height:23px;border:1px solid #ebedec;color: #333;text-align:center;background-color: #f3f3f3;font-size: 13px; border-radius: 4px;">',$.lang.button_end_session,'</span>',
						'<span class="chat-view-xiaoneng-version" style="',$.STYLE_BODY,'display:block;visibility:visible;text-decoration:none;margin:6px 0px 6px 10px;float:left;height:26px;line-height:26px;color:#999;">',dist_is_inputting,'</span>',
						'<div style="',$.STYLE_NBODY,'clear:both;"></div>',
					'</div>'
				].join('') :
				type=='message' ? [
					'<div class="chat-view-message-announcement" style="',$.STYLE_BODY,'margin:10px 20px 10px 20px;height:auto;max-height:200px;overflow:hidden;display:none;"></div>',
					//2016.03.16 提示语句 （6.8.2合版）我要留言 DOM元素
					'<div class="chat-view-message-message-prompt" style="',$.STYLE_BODY,'margin:10px 20px 10px 20px;height:auto;max-height:500px;overflow:hidden;display:none;"></div>',
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
      //keypress计算方式在计算汉字的时候胡出现问题，所以改为keyup计算方式。2016.12.02
			this.textEditor = this.chatElement.find('.chat-view-window-editor textarea').css({
				width: $.browser.Quirks ? '411px' : '391px',
				height:$.browser.Quirks ? '93px' : '58px',
				color: "#333"
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
				//$.Log('set editorStart:' + self._editorStart, 1);
			}).bind('keyup', function(event){
				event = $.Event.fixEvent(event);
				//按键时，清除超出最大输入值内容
        self._editorStart = self._getPositionForTextArea(this) + 1;
				var keyCode  = event.keyCode,
					enLength = $.enLength($(this).val()),
					selectIndex = 0
				;
				if( enLength > self.mode.inputMaxByte ){
					$(this).val( $.enCut($(this).val(), self.mode.inputMaxByte) );
				}

                var moveIndexFlag = (self.mode.robotKf || self.mode.requestRobot) && $('.chat-view-hidden-area .chat-view-suggest-list').css('display') != 'none'

				//2015.07.02 按上下方向键时，机器人输入提示选中项可上下移动
				if( keyCode == 38 && moveIndexFlag){
					event.preventDefault();
					self._selectSuggest(-1);
				}else if( keyCode == 40 && moveIndexFlag ){
					event.preventDefault();
					self._selectSuggest(1);
				}
			}).bind('click', function(){
				self._editorStart = self._getPositionForTextArea(this);

				//$.Log('set editorStart:' + self._editorStart, 1);
			}).bind('focus', function(){
				$.promptwindow.stopPrompt();
				self.chatElement.find('.chat-view-hidden-area .chat-view-span').display();

				var css = {color:'#333'};
				if( $.browser.msie && $.browser.ieversion<=7 ){

					$(this).css($.merge(css, {
						'width':	($(this).parent().width() - 26) + 'px',
						'height':	($(this).parent().height() - 26) + 'px',
						'border-width': '1px'
					}));
				}else{
					$(this).css($.merge(css, {"outline-width": "1px"}));
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
						$(this).css({'color': '#999'});
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
					    	'<img class="pastepic-show" style="max-width:640px;max-height:480px;" src=""/>',
					    '</div>',
					    '<div class="pastepic-toolbar" style="top:',t_top,'px;left:',left,'px;width:640px;height:30px;position:absolute;z-index:5000000;margin:auto;text-align:right;background-color:transparent;display:none;">',
					    	'<div class="pastepic-toolbar-main" style="width:320px;height:30px;line-height:30px;position:relative;float:right;background-color:#F9F9F9;">',
					    		'<span class="pastepic-describe" style="font-size:12px;font-weight:bold;color:#333333;float:left;margin-left:10px;">是否粘贴此图片</span>',
								'<span class="pastepic-choose-no" style="font-size:12px;color:#333333;cursor:pointer;width:45px;display:inline-block;margin-right:25px;background:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAANeSURBVDhPXVW/axVBEJ7du7zCMqW1hXX0L0gjRIMWplALRbAIMYnxByiibXgIYhA0gqJgp4JirIMaGxUVbcXOTpuYvNzt3e2O3zf33otxHsfe7c58+83Mt/tcCEEF5iWTqJWNSdTGxifJk5eE0cFLnWDku7d3enksKD8Q1eL0LUk0EDMPB6+SpSiOSIkB3kAbcZiDX1JxPkoCjnexjYMNAW0TD5aIQigCMlF8KzZyFpCA4STHDEfJMB8zW6sHRGBDQEspJgOLf35jA3BBegQdpJhlDTwRorX4ouqninn4DWwIyFfFrs3chNQHdku8eQ4p5+AXAYZaMQaMUtiS+vyEbI2PSrp/zTYimYH9A4hib22KfnoNjl6aZ3el6k4jM3qDKcmUW9IsHJb4YRU+KtWbFyw1SrwNsyPluGtU9Pi8fROmXnkgaXEOqeErbEh5cVLc5zU0A/4oReckGALC/5PyUDaORacnOlovXRJ5ugQgznvJJ09J/PlDGoBlZApanSvLIgdP2WYuY5zBbAMyLS8j5qAuSXProjRPbpuC6Gvlx4ZUUOfysuSHToBdbpFt0/7TIV8bqUzE7HQ235VsakbUNMiKoQxIrXPljvjJkwZGEOp0AOYc8xkaUsPPaonHl0Hc96/cHt3GMnBH2PVv763bFsFThAUTOozZDQG5SwXt8Si5cl3ChcOiX94Zs4SaOTBtPHT46qHU3TMWAzwzhS7JjjYEpM46mkvT25Tq0lEweYtF/PyIZFeXxR2bRVB79NLKQ4mLMxbDhzpNPIM0NoVPGWqtQ6Wb0+O6vs/pxn7RP/u9Fs/vaSgaLctSe91Z3RwTrGNtzGlxc0GrUGhVthhVVaE9fUNCOHK/RD+u4rih0DjL+dV74iZOg0abUs5GHT9r3qxtubaCEYyBYuqgzgYMAxiWVaG9Gwu6fmSPliuPbT6CdVkFLUJpGfQwFnev68bUXg0vH9laKMo+RtBtYVNLihuEZwm78uCTFWvWQX0iSHEOXubTgJY1EO48EDwYtGHKwtsF3Y+KK8sObntdEd+6jNF0h3dcSrzpWhJ0BRHaTtnAwzSFAO4s0CSlzofzrFPW7yaZMzhBRnQd4ZGF7RQ2dEanPCKoz9D2AwtKw+5GziMNB3lt/xVwy5ahc07+ArnLFQPLE82pAAAAAElFTkSuQmCC\') no-repeat 5px 5px">否</span>',
					    		'<span class="pastepic-choose-yes" style="font-size:12px;color:#333333;cursor:pointer;width:50px;display:inline-block;margin-right:25px;border:1px solid #cfcfcf;height:20px;line-height:20px;padding:0 8px 0 1px;border-radius:3px;background:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKPSURBVDhP1VLNS1VREJ85531oGomaCMFDREmIIgg3FW0qamGLFyUFtXFlRBgIkS500cciigjSvyCiTRS2blHQ8oGtkvSpkGj4kSX4vF9npt+5T7G1u+bCveeemfnNzG9+HIYh7dXM9ndP9v8mi7I/qaqh9LSL6F1KmerPWrJ0/9v5YqlpfOEeYpQMR0Eo5NPUqjpi9vlWRXyaIXW4wWElnB+ZubIYzAu85F4dna7PNRthA6+QoyTtIoV0bMSDMcCc2oXw+9DUxZ/BDyaXVenc112Xb0Zxj02UCXXrw/LYp/X3pDFK+17gMqqUKweTQ1M9q26NNQZWR/2J0cNvEYYGOYyDROhJ+Xpp/WPC7kxj8U7bWC3VOJS10dRG6cHctc1oA80L8fH9p4Y7X+e5DmUTcoYdZ5VXojVHzrL5/Ovd05m+QLdQ9uvvL6Plq5vxHz+22u6GC8Mdb/JcS5rBZHlljuIKsqYrpZHZYiWspBX02IGT5xpvvpwdSDh2xlnh0w3Fu+3jlms0ZR7DGlZoO8Y/WCpvTY7M9FaiZQEPaUjKPGLkbPONW4Vn1mZZHNhIebTgGD5EJeC8vfbI466JpuyhNMsC3HNPdOlg/+2255ZzhEzcbovC+QUKHr8f0GELua6HXRMt+YJJ41C1t3Wwr/CIU/qhFtTw9zvmRUIsaizqQFCWdNUtvZjrXwzmLrcO9LT0QThgiCnx3UJNANoxrkShrU7o+/eNgli/ZIBVW8QXesGLwbF1ZjfZIBN6AiR48kU4D1EJxSKJVxp2xPCwVZw0AU3/GGSIPSMATugNRMesOdaMABbXkrA11SaYs2nbu4b4OFYnFgyzOgyG+cFejI4yIsZkIO6UJxGJ4N3OgxH9Ben/Y4RnXjBoAAAAAElFTkSuQmCC\') no-repeat 5px 0px">是</span>',
					    	'</div>',
					    '</div>'
					].join("");

					if($('.pastepic-background').length === 0){
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
			    };

				var paste = new $.paste(e, pasteCallback);
				paste.getImgBase64Str();

			});

			if( this.textEditor.val() === '' && !$.browser.html5 ){
				this.textEditor.val( $.lang.default_textarea_text );
			}

			//this._listenTextEditor();
			//结束会话
			this.chatElement.find('.chat-view-end-session').click(function(event){
				$.Event.fixEvent(event).stopPropagation();

				self._endSession();
			});

			var positionX, positionY;
			//bind chat tools button event
			// this.chatElement.find('.chat-view-button,.chat-view-switch-manual').hover(function(event){
			// 	$.Event.fixEvent(event).stopPropagation();
			// 	if( $(this).attr('talk_disable') || $(this).attr('selected') ){
			// 		return;
			// 	}

			// 	//hack lt IE8
			// 	positionX = $(this).css('background-position').split(' ').shift();
			// 	positionY = $(this).indexOfClass('chat-view-load-history')||$(this).indexOfClass('chat-view-switch-manual')||$(this).indexOfClass('chat-view-change-csr') ? ' -60px' : ' -19px';

			// 	$(this).css('background-position', positionX + positionY);
			// }, function(event){
			// 	$.Event.fixEvent(event).stopPropagation();
			// 	if( $(this).attr('talk_disable') || $(this).attr('selected') ){
			// 		return;
			// 	}

			// 	//hack lt IE8
			// 	positionX = $(this).css('background-position').split(' ').shift();
			// 	if( $(this).indexOfClass('chat-view-face') ) {
			// 		positionY = ' 1px';
			// 	}else if( $(this).indexOfClass('chat-view-load-history') || $(this).indexOfClass('chat-view-switch-manual') || $(this).indexOfClass('chat-view-change-csr')) {
			// 		positionY = ' -40px';
			// 	}else {
			// 		positionY = ' 0px';
			// 	}

			// 	$(this).css('background-position', positionX + positionY);
			// });

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

				$.Event.fixEvent(event).stopPropagation();

				self._image(event);
			});
			this.chatElement.find('.chat-view-file').click(function(event){
				//发送文件统计点
				self.mode.callTrack("10-02-05");

				$.Event.fixEvent(event).stopPropagation();

				self._file(event);
			});
			this.chatElement.find('.chat-view-history').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') ) return;
				self._download(event);
			});
			// 2014.11.11 添加查看聊天记录按钮，此按钮有选中与未选择两种状态，选中时显示聊天记录框
			this.chatElement.find('.chat-view-load-history').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') ) return;

				//显示隐藏聊天记录
				self._viewHistory( !$(this).attr('selected') );
			});
			this.chatElement.find('.chat-view-evaluate').click(function(event){
				//评价统计点
				self.mode.callTrack("10-02-09");

				$.Event.fixEvent(event).stopPropagation();

				if( $(this).attr('talk_disable') ) return;
				self._evaluate(event);
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

				self._expansion(event);
			});
			//点击其它地址，隐藏表情
			this._eventFunction = function(event){
				self._hiddenFloatMenu();
			};
			$(document.body).click(this._eventFunction);

			//发送设置

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
				if( selector.indexOf('chat-view-change-csr') > -1 ){
					$('.chat-view-change-csr').css('background-position-y', ' -40px');
				}
				if( selector.indexOf('chat-view-switch-manual') > -1 ){
					$('.chat-view-switch-manual').css('background-position-y', ' -40px');
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

                 /*&& self._listenNumber%2 === 0*/
				if( ((Listen && cacheListen !== Listen) ||
				(!Listen && cacheListen))){
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
					self.chatElement.find('.chat-view-window-face').insert('<div class="' + groupClass + ' chat-view-face-group" style="' + $.STYLE_NBODY + (i === 0 ? '' : 'display:none;') + 'overflow-x:hidden;overflow-y:auto;margin:10px 0px 10px 10px;clear:left;height:165px;"></div>', 'afterbegin');
				}
                if( cFace.pics === undefined ){
                    cFace.pics = [];
                }
				$.each(cFace.pics, function(faceIndex, jsonFace){
					var j	= faceIndex + 1;
					//2016.12.08 针对http网站把表情URL地址协议变成http后，还带有443端口号的情况进行处理。
					if( nTalk.protocol == 'http:'){
						if( jsonFace.sourceurl ){
							jsonFace.sourceurl =jsonFace.sourceurl.replace(/:443/,"");
							jsonFace.url =jsonFace.url.replace(/:443/,"");
						}
					}
					var alt	= i === 0 ? ' title="' + jsonFace.sourceurl + '"' : ' title="" sourceurl="' + jsonFace.sourceurl + '"';
					cstyle	= style + 'border:1px solid #F6FBFE;border-left:1px solid #DFEFF8;border-bottom:1px solid #DFEFF8;background:#F6FBFE;' + (j<=6 ? 'border-top:1px solid #DFEFF8;' : '') + (j%6 === 0 ? 'border-right:1px solid #DFEFF8;' : '');

					self.chatElement.find('.' + groupClass).append('<img src="' + jsonFace.url + '" ' + alt + ' border="0" style="' + cstyle + '" />');
				});
				//组标签
				if( i === 0 ){
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
			//if( (typeof data.msg !== 'string' || /<.*?\>/gi.test(data.msg)) ){
			if( typeof data.msg !== 'string' || (/<.*?\>/gi.test(data.msg))){

				//2015.03.28 添加消息内容中含图片时，默认显示小图，点击后显示大图
				if( (data.type === 1 || data.type == 7) && /<img(.*?)src=([^\s]+)(.*?)>/gi.test( data.msg ) ){
					data.msg = data.msg.replace(/<img(.*?)src=([^\s]+)(.*?)>/gi, '<img class="ntalk-preview" '+ (data.type == 7 ? " robotImg='true' " : "") +'src="' + $.imageloading + '" sourceurl=$2 style="' + $.STYLE_NBODY + '" />');
				}
				return data;
			}
			data.msg = data.msg.replace(/[\r\n]/ig, ' <br>');
			if(data.msg && data.msg.indexOf('xnlink') === -1) {
			data.msg = data.msg.replace(/(\s{2})/ig, ' {$null}');
			}

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

			this.chatElement.find('.chat-view-exp').html($.lang.button_more + (extend ? ' &lt;' : ' &gt;') );
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
				this.displayButton(['capture','capoptions'], this.mode.config.captureimage === 0);
				this.displayButton('evaluate', this.mode.config.evaluation === 0);
				// this.chatElement.find('.chat-view-exp').display(this.mode._moreData && this.mode._moreData.length);
				this.chatElement.find('.chat-view-exp').display();
				this.chatElement.find('.chat-view-switch-manual').display();
			}else{
				//2016.05.02 机器人2.0与1.0显隐按钮逻辑不一致
				if( $.server.robot == 2 ) {
					this.chatElement.find('.chat-view-button,.chat-view-capture-options').each(function(){
						var captureOption = $(this).indexOfClass('chat-view-capture-options');
						//2015.12.18 修正按钮显隐判断bug
						if( $(this).attr('talk_disable') == 'disable' ||
							(captureOption && self.chatElement.find('.chat-view-capture').css('display') == "none")) $(this).display();
					});

					this.displayButton('loadhistory', this.mode.config.viewchatrecord != 1);
					this.displayButton('history', this.mode.config.chatingrecord != 1);
					this.displayButton(['capture','capoptions'], this.mode.config.captureimage === 0);
					this.displayButton('evaluate', this.mode.config.evaluation === 0);

					// if( this.mode._sendNum === 0 ){
					// 	$.Log("disable manual button: sendNum:" + this.mode._sendNum, 2);
					// 	//2016.02.04 机器人会话时，转人工按钮初始不可用，当用户发送消息后再转为可用
					// 	this.disableButton("manual", true);
					// }
				}else{
					this.chatElement.find('.chat-view-button,.chat-view-capture-options').each(function(){
						$(this).display();
					});
				}

				// this.chatElement.find('.chat-view-exp').display(this.mode._moreData && this.mode._moreData.length);
				// 定制主题, 不显示更多按钮
				this.chatElement.find('.chat-view-exp').display();
				this.chatElement.find('.chat-view-switch-manual').display(1);
				this.chatElement.find('.chat-view-change-csr').display(0);
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

			if( ($('.chat-view-submit').attr('talk_disable') == 'disable') || /QUERY|QUEUE/i.test(this.mode.statusConnectT2D) ){
				return false;
			}
			var textContent = this._clearEditor();
			if( textContent.length && textContent != $.lang.default_textarea_text ){
				//加载默认文本
				this.mode.send( textContent );

				// $.Log("enable manual button: sendNum:" + this.mode._sendNum, 2);
				// //2016.02.04 机器人会话时，转人工按钮初始不可用，当用户发送消息后再转为可用
				// this.disableButton("manual", false);
			}

			if( !$.browser.html5 && isSubmit === true ){
				this.textEditor.css({'color': '#ccc'}).val( $.lang.default_textarea_text ).get(0).focus();
			}
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
			//
			// alert(height)

			//消息区宽、高
			//this.chatHistory.find('ul').css({'width':  (width - 4) + 'px'});
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
		},

        starLevel: function(level){
        	if($('.nt-evaluation-starlevel').length > 0) {
        		return;
        	}

            var starLevelHtml = "",
                className = 'nt-evaluation-starlevel',
                style = {
                    'nt-evaluation-starlevel-span' : 'padding: 0px; margin:11px 0px 14px 10px; border: none; width: 90px; max-width: 90px; height:16px; line-height:16px; max-height: none; clear: none; position: static; display: inline-block; float: left;visibility: visible; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; cursor: auto; background-color: transparent;',
                    'nt-evaluation-starlevel' : ''
                },
                halfstarFlag = false,
                fullStarImageUrl = $.sourceURI + "images/evaluate/fullstar.png",
                emptyStarImageUrl = $.sourceURI + "images/evaluate/emptystar.png",
                halfStarImageUrl = $.sourceURI + "images/evaluate/halfstar.png";

            if(level != Math.ceil(level)){
                halfstarFlag = true;
            }


            for(i=0; i<Math.floor(level); i++) {
                starLevelHtml += '<img class="' + className + '" style="' + $.STYLE_BODY + " " + style[className] + '" src="' + fullStarImageUrl + '" nodeid="fullstar"/>';
            }

            if(halfstarFlag) {
                starLevelHtml += '<img class="' + className + '" style="' + $.STYLE_BODY + " " + style[className] + '" src="' + halfStarImageUrl + '" nodeid="fullstar"/>';
            }

            for(i=0; i<5-Math.ceil(level); i++) {
                starLevelHtml += '<img class="' + className + '" style="' + $.STYLE_BODY + " " + style[className] + '" src="' + emptyStarImageUrl + '" nodeid="fullstar"/>';
            }

            starLevelHtml = '<span class="nt-evaluation-starlevel-span" style="' + $.STYLE_BODY + " " + style['nt-evaluation-starlevel-span'] + '">'+starLevelHtml+'</span>'

            $('.chat-header-body').append(starLevelHtml);
        }

	};

	/** ====================================================================================================================================================
	 * 最小化窗体状态条
	 * @type {class}
	 */
	var minimizeView = $.Class.create();
	minimizeView.prototype = {
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
			this.callback = callback || emptyFunc;
			this.element = $('.ntalk-minimize-window');
			this._width = 213;
			this._height= 44;

			if( !this.element.length ){
        //2016.12.02直接改为向右下角定位
				this.element = $({className:'ntalk-minimize-window', style:$.STYLE_BODY + 'width:' + (this._width - 2) + 'px;height:' + (this._height - 2) + 'px;border:1px solid #c8c7c6;background:#e5e5e4;cursor:pointer;z-Index:2000000000;'}).appendTo(true)
				.gradient('top', '#e5e5e4', '#f2f3f3').fixed({
          bottom:'0',
          right:'0'
				}).html( [
						'<div class="ntalk-minimize-icon" style="',$.STYLE_BODY,'float:left;margin:4px 8px;_margin:4px 4px;width:35px;height:35px;background:url(',$.imageicon,') no-repeat -383px -8px;"></div>',
						'<div class="ntalk-minimize-title" style="',$.STYLE_BODY,'float:left;margin:4px 0;line-height:35px;overflow:hidden;width:160px;height:35px;max-width:162px;"></div>',
						'<div style="',$.STYLE_NBODY,'clear:both;"></div>'
				].join('') );
			}

			//定位  2016.12.02后认为没有必要在重新定位了。
			// $(window).bind('resize', function(event){
			// 	self._fiexd(event);
			// });

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
			this.element.fixed({
				width:  this.width  - 2,
				height: this.height - 2,
				left:	$(window).width()  - this.width  - 2,
				top:	$(window).height() - this.height - 2
			});
		}
	};
	/*
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
	var chatManageView = $.Class.create();
	chatManageView.prototype = {
		name: 'chatManageView',
		defaultOptions: {
			dropHeight: 48,
			width:  455, //聊天窗口区域宽
			height: 468, //聊天窗口区域高
			minWidth: 455,//最小聊天窗口宽
			minHeight:468,//最小聊天窗口高
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

			// if( !data.id ){
			// 	// this.header.find(".chat-header-icon,.chat-header-name,.chat-header-sign").css('visibility', 'hidden');
			// 	return;
			// }
			//$.Log('chatManageView.updateChatTag(' + $.JSON.toJSONString(data) + ')');

			if( $.CON_MULTIPLAYER_SESSION === data.logo ){
				data.logo = $.imagemultiplayer;
			}else if( $.CON_SINGLE_SESSION === data.logo ){
				data.logo = $.imagesingle;
			}
			//$.Log('user icon attr:' + $.JSON.toJSONString(data));
			// icon.css('visibility', 'visible').css('background-image', 'none');

			//2015.01.15 排队时，每3秒更新一次用户信息,避免重新更新
			//2017.5.5 定制 ui 顶部 logo
			// if( !icon.find('img').length || icon.find('img').attr('src') != data.logo ){
			// 	icon.html( '<img data-single="1" onerror="nTalk.loadImageAbnormal(this, event)" src="' + data.logo + '" border="0" width="' + data.attr.width + '" height="' + data.attr.height + '" style="' + $.STYLE_NBODY + 'margin:' + (this.CON_ICON_HEIGHT - data.attr.height)/2 + 'px ' + (this.CON_ICON_WIDTH - data.attr.width)/2 + 'px;width:' + data.attr.width + 'px;height:' + data.attr.height + 'px;background:#fff;" />' );
			// }else{
			// 	icon.find('img').attr({
			// 		'data-single': $.CON_MULTIPLAYER_SESSION != data.logo ? '1' : '0',
			// 		'width': data.attr.width,
			// 		'height':data.attr.height
			// 	}).css({
			// 		margin:(this.CON_ICON_HEIGHT - data.attr.height)/2 + 'px ' + (this.CON_ICON_WIDTH - data.attr.width)/2 + 'px',
			// 		width:  data.attr.width + 'px',
			// 		height: data.attr.height + 'px'
			// 	});
			// }

			// if( data.status === 0 && $.CON_SINGLE_SESSION !== data.id ){
			// 	icon.find('img').css('opacity', '0.5');
			// }else{
			// 	icon.find('img').css('opacity', '1');
			// }
			// name.css('visibility', 'visible').html( data.title || data.name );

			// if($.evaluateStarLevel) {
			//     sign.css('display', 'none');
			// }else{
			//     signWidth = Math.max(0, this.header.width() - name.width() - 165);
			//     sign.css('visibility', 'visible').attr('title', data.sign).css('width', signWidth + 'px').html( data.sign );
			// }
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

			//2016.04.18
			//变更侧边栏时，签名的最大长度会变更
			var name = this.header.find('.chat-header-name'),
				sign = this.header.find('.chat-header-sign');


			if($.evaluateStarLevel) {
			    sign.css('display', 'none');
			}else{
			    var signWidth = Math.max(0, this.header.width() - name.width() - 165);
			    sign.css('visibility', 'visible').css('width', signWidth + 'px');
			}

			return this.extended[attr];
		},
		/**
		 * 更新聊窗当前右侧数据
		 * @param  {string} settingid
		 * @param  {array}  data
		 * @return {[type]}
		 * 
		 */
		updateRightData: function(settingid, data){
			
			// 对接车城网, 顶部颜色色值来自定义标签
			if( data[data.length-1].data.indexOf('#') > -1 ) {
				$('.chat-header-body').css('background' , data[data.length-1].data);
			}

			var self = this, selectLabel = false;

			this.settingid = settingid;

			if( !data || !data.length ){
				//页外时,无右侧配置数据时,不显示右侧区域
				this.toggleExpansion("rightElement", false);

				return;
			}

			this._clearTag();

			$.each(data, function(i, obj){
                //自定义标签渲染事添加
                if( obj.autoopen ){
                    for(var i=0 ; i < obj.autoopen.length ; i++){
                        var url = obj.autoopen[i].src;
                        var title = obj.autoopen[i].title;
                        var closebutton = obj.autoopen[i].closebutton;

                        self._addRightTag(url,title,closebutton);
                    }
                }
				if( !obj.data || !obj.data.length ){
					return;
				}
				if( obj.selected === true ){
					selectLabel = true;
				}

				//默认选择项内容为空或无默认选项时，最后一项为选中项
				if( !selectLabel && i == data.length - 1 ){
					obj.selected = true;
				}
				self._addRightLabel(obj.title, obj.data, data.length, obj.selected);

			});
            //判断是否有自定义标签，切为渲染时打开。

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
			// 2017.5.5 顶部颜色写死
			// need update
			// this.headBody.css('background', '#fdc235');

			// chat = this._manageMode.get();
			// if( chat && colorExp.test(backgroundImage) ){
			// 	chat.view.chatElement.find('.chat-view-window-history').css("background-color",backgroundImage);
			// }else if( chat && backgroundImage ){
			// 	chat.view.chatElement.find('.chat-view-window-history').css("background-image",'url('+backgroundImage+')');
			// }
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

			if ($.themesURI) {
			    $.imageicon = $.themesURI + 'chaticon.' + ($.browser.msie6 ? 'gif' : 'png');
			    //预加载图片
			    $.require([$.imageicon], function(element) {
			        if (element.error) {
			            $.Log('cache chat icon failure', 3);
			        }
			    });
			}

			var self = this, options = $.extend({}, this.options, {
				width:  this.options.width,
				height: this.options.height + this.options.dropHeight,
				minWidth: this.defaultOptions.minWidth,
				minHeight:this.defaultOptions.minHeight
			});

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
				$(this).css('background-position', '-60px -20px');
			}, function(){
				$(this).css('background-position', '-60px 0');
			}).attr('title', $.lang.chat_button_close).css({
				margin: '20px 5px 0 0',
				background: 'url(' + $.imageicon + ') no-repeat -60px 0'
			});
			if( this._objView.buttonResize ){
				this._objView.buttonResize.css({
					'width':  '12px',
					'height': '15px',
					'background': 'url(' + $.imageicon + ') no-repeat -298px -5px'
				});
			}
			this._objView.buttonMax.hover(function(event){
				var positionX = $(this).css('background-position').split(' ').shift();

				$(this).css('background-position', positionX + ' -20px');
			}, function(event){
				var positionX = $(this).css('background-position').split(' ').shift();

				$(this).css('background-position', positionX + ' 0');
			}).css({
				margin: '20px 5px 0 0',
				background: 'url(' + $.imageicon + ') no-repeat -40px 0'
			}).attr('title', $.lang.chat_button_resize_max);

			this._objView.buttonMin.hover(function(){
				$(this).css('background-position', '-1px -20px');
			}, function(){
				$(this).css('background-position', '-1px 0');
			}).css({
				margin: '20px 5px 0 0',
				background: 'url(' + $.imageicon + ') no-repeat -1px 0'
			}).attr('title', $.lang.chat_button_min);

			this.headBody = $({className: 'chat-header-body', style: $.STYLE_BODY + 'background:#ebe9e9;z-index:0;color:#525252;'}).appendTo(this.header, true).css({
				'position': 'absolute',
				'top': '0',//IN
				'width': (this.options.width) + 'px',//IN 
				'height': (this.options.dropHeight) + 'px'//IN
			});

			// alert(this.options.width)
			this.headName = $({tag: 'span', className:'chat-header-name', style: $.STYLE_BODY + 'color:#ffffff;margin:10px 0px 10px 80px;display:inline-block;float:left;height:20px;line-height:20px;max-width:220px;visibility:hidden;overflow:hidden;font-weight:bold;cursor:auto;font-size:12px;color:#fff;'}).appendTo(this.headBody).html('');
			this.headSign = $({tag: 'span', className:'chat-header-sign', style: $.STYLE_BODY + 'color:#c3c3c3;margin:10px 0px 10px 10px;display:inline-block;float:left;height:20px;line-height:20px;visibility:hidden;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;cursor:auto;'}).appendTo(this.headBody);
			this.headIcon = $({tag: 'div',  className:'chat-header-icon', style: $.STYLE_NBODY + 'visibility:hidden;border-radius:0px;overflow:hidden;background:url(' + $.imageicon + ');background-repeat:no-repeat;background-position:-374px 0; background-color:#ffffff;position:absolute;width:' + this.CON_ICON_WIDTH + 'px;height:' + this.CON_ICON_HEIGHT + 'px;border:1px solid #5f6467;z-index:1;'}).appendTo(this.header, true);
			this.chatBody = this._objView.chatBody;

			this.leftElement = $({className: 'body-chat-tags', style: $.STYLE_NBODY + 'display:none;float:left;background:#fafafa;overflow:hidden;'}).css({
				'border-left': '1px solid #5f6467',
				'border-bottom': '1px solid #5f6467',
				'border-radius': '0px 0px 0px 5px',
				'width':  (this.options.leftElementWidth - 1) + 'px',
				'height': (this.options.height - 1) + 'px'
			}).appendTo( this.chatBody );

			this.chatContainter = $({className: 'body-chat-containter', style: $.STYLE_NBODY + 'float:left;overflow:hidden;background:#fff;'}).css({
				'width':  (+this.options.width) + 'px',
				'height': (+this.options.height) + 'px'
			}).appendTo( this.chatBody );

			//clear both
			$({style: $.STYLE_NBODY+'clear:both;'}).appendTo(this.chatBody);

			this.rightElement = this._objView.rightElement.css({
				width: this.options.rightElementWidth + 'px'
			});
			//IN:
            /*
				$({className: 'ntalker-button-close', style: $.STYLE_BODY + 'background:url(' + $.imageicon + ') no-repeat -80px 0;cursor:pointer;width:20px;height:20px;float:right;color:#fff;'}).appendTo(this.rightElement.find('.window-right-head')).hover(function(){
				$(this).css('background-position', '-80px -20px');
			}, function(){
				$(this).css('background-position', '-80px 0');
			}).css({
				margin: '10px 10px 0 0'
			}).attr('title', $.lang.chat_button_close).click(function(event){

				self._manageMode.callToggleExpansion(self.settingid);
				});
            */


			this.rightBody = $({className: 'window-right-body', style: $.STYLE_BODY + 'width:199px;background:#fff;'}).css({
				'border-right':  '1px solid #5f6467',
				'border-bottom': '1px solid #5f6467',
				'height':(+this.options.height - 1) + 'px',
				'border-radius': '0px 0px 5px 0px',
				'-moz-border-radius': '0px 0px 5px 0px',
				'-webkit-border-radius': '0px 0px 5px 0px'
			}).appendTo(this.rightElement);

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
				background: 'url('+$.imageicon+') no-repeat -159px -39px'
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

			this.headBody.css('width', (args.width) + 'px');

			this.body.css('width', ( this.options.width + (this.extended.leftElement ? this.options.leftElementWidth : 0) ) + 'px');
				this.leftElement.css({
					width: (this.options.leftElementWidth - 1) + "px",
					height:(this.options.height - 1) + "px"
				});
					this.leftBody.css('height', (this.options.height - 40) + 'px');
				this.chatContainter.css({
					width: (this.options.width) + "px",
					height:(this.options.height) + "px"
				});

			//2016.03.16增加更改留言窗口 大小
			this.messageElement=this.chatContainter.find('.chat-view-message');
			this.messageElement.css('height',(this.options.height-2)+'px');
			this.chatContainter.find('.chat-view-message-table-iframe').css('height',(this.options.height-2)+'px');

			this.rightBody.css({
				height:(this.options.height - 1) + "px"
			});

			//侧边栏内容区高，去除侧边栏标签区高
			//var rigthConentHeight = this.options.height - Math.max(this.rightTags.height() + parseFloat(this.rightTags.css('border-top-width')) - 1, 28);
			var rigthConentHeight = this.options.height - 29;
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

			// if( setMax ){
			// 	this._objView.buttonMax.css('background-position', '-20px 0').attr('title', $.lang.chat_button_resize_min);
			// }else{
			// 	this._objView.buttonMax.css('background-position', '-40px 0').attr('title', $.lang.chat_button_resize_max);
			// }

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
			}

			//2015.06.11 最大、最小限制
			this.options.left = Math.min(Math.max(this.options.left, 0), $(window).width()  - this.options.width);
			this.options.top  = Math.min(Math.max(this.options.top,  0), $(window).height() - this.options.height - this.options.dropHeight);
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
				rightContentHeight = this.options.height - 28;

			if( !this.rightTags ){
				this.rightTags = $({className:'window-right-tags', style: $.STYLE_NBODY + 'background:#FAF9F9;z-index:-1;overflow:hidden;height:26px;border-top:2px solid #FFF;'}).appendTo(this.rightBody);
				this.rightTags.insert('<div style="' + $.STYLE_NBODY + 'clear:both;"></div>');
			}
			if( !this.rightContent){
				this.rightContent = $({className:'window-right-content', style: $.STYLE_NBODY + 'overflow:hidden;background:#FAF9F9;position:relative;top:-1px;z-index:1;border-radius:0px 0px 5px 0px;-moz-border-radius:0px 0px 5px 0px;-webkit-border-radius:0px 0px 5px 0px'}).appendTo(this.rightBody);
			}
			style = $.STYLE_BODY + 'background-color:#FAF9F9;height:24px;line-height:24px;text-align:center;cursor:pointer;border-bottom:1px solid #d5d5d5;float:left;';

			if( length == 1 ){
				style += 'width:199px;';
			}else{
				if( this.rightTags.find('div').length == 1 ){
					style += 'width:' + (length == 2 ? 98 : 65) + 'px;border-right:1px solid #D5D5D5;';
				}else if( this.rightTags.find('div').length < length ){
					style += 'width:' + (length == 2 ? 98 : 65) + 'px;border-right:1px solid #D5D5D5;';//border-left:1px solid #FCE4E7;
				}else{
					style += 'width:' + (length == 2 ? 99 : 65) + 'px;';//border-left:1px solid #FCE4E7;
				}
			}

			tagElement = $({className: key, title: title, style: style}).appendTo(this.rightTags, this.rightTags.find('div').last()).html( title );//.gradient("top", '#F8CEDC', '#FAB2CA')
			tagBody = this.rightContent.insert( ['<div class="',key,' view-right-content" style="',$.STYLE_BODY,'background-color:#FAF9F9;width:100%;height:' + rightContentHeight + 'px;overflow-x:hidden;overflow-y:auto;display:none;border-radius:0px 0px 5px 0px;-moz-border-radius:0px 0px 5px 0px;-webkit-border-radius:0px 0px 5px 0px"></div>'].join('') );

			if( $.isArray(data) ){
				//用于常见问题一类的列表形式展示内容
				listElement = $({tag: 'ul', style: $.STYLE_BODY + 'margin:10px 0 10px 25px;list-style:disc;background-color:#FAF9F9;'}).appendTo(tagBody).click(function(event){
					var srcElement = $.Event.fixEvent(event).target;
					if( srcElement.tagName.toLowerCase() !== 'li' ) return;
					var title = $(srcElement).attr('talk_title');
					var content= $(srcElement).attr('talk_content');
					var id = $(srcElement).attr('talk_id');

					self._manageMode.showFAQ(self.settingid, title, content, id);
				});

				for(var i = 0; i < data.length; i++){
					$({tag:'li', talk_id : data[i].id || 'thisisadefaultid', talk_title: data[i].title, talk_content: data[i].con, title: $.clearHtml(data[i].con || ''), style: $.STYLE_BODY + 'list-style:disc outside none;margin-top:5px;cursor:pointer;background-color:#FAF9F9;'}).appendTo(listElement).html( $.clearHtml(data[i].title || '') );
					/*
					.html( '<span style="' + $.STYLE_BODY + 'color:#525252;background-color:#FAF9F9;text-decoration:none;">' + $.clearHtml(data[i].title || '') + '</span>' );
					*/
				}
			}else if( expURL.test( data ) ){
				//自定义签外部页面传入参数
				data += (data.indexOf('?')==-1 ? '?' : '&') + $.toURI({
					lan:		$.extParmas.lan,
					sellerid:	this._manageMode.sellerid,
					userid:		$.user.id,
					exparams:	$.global.exparams || ''
				});
				$({className: 'window-right-iframe', tag: 'iframe', width:'100%',frameborder:'0', height:rightContentHeight, scrolling: 'auto', style:$.STYLE_NBODY + 'width:100%;height:' + rightContentHeight + 'px;'}).appendTo(tagBody.css('overflow-y','hidden')).attr('src', data);
			}else{//text
				$({className: 'window-right-text', style: $.STYLE_BODY + 'margin:5px;word-wrap:break-word'}).appendTo(tagBody).html(data);
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
			this.rightTags.find('div[class]').click(function(){
				self._selectedTag(this);
			});
		},
		_selectedTag: function(eventElement){
			var self = this;
            if( eventElement.tagName && eventElement.tagName.toLowerCase() == 'span'){
                return;
            }
            //chrome浏览器隐藏和显示切换时会出现丢失滚动条。
            if( eventElement.className && $.browser.chrome == true ){
                if( eventElement.className.toString().indexOf("link_") >= 0 && eventElement.className.toString().indexOf("talk_selected") <0 ){
                    $(".window-right-content").find('.'+eventElement.className.trim()+" iframe").attr("src",$(".window-right-content").find('.'+eventElement.className.trim()+" iframe").attr("src"));
                }
            }
			this.rightTags.find('div[class]').each(function(i, elem){
				var key = $.myString( elem.className.replace('talk_selected', '') ).trim();

				if( $(eventElement).indexOfClass( key ) ){
					//$.Log('selected class:' + key + ', selected');
					$(elem).addClass('talk_selected').css({'height': '25px', 'border-bottom': 'none','background-color':"transparent"});//.gradient('top', '#F8BAC2', '#F9CDDC').css('color', '#DE7E80');
					self.rightContent.find('.'+key).display(1);
				}else{
					//$.Log('selected class:' + key + '');
					$(elem).removeClass('talk_selected').css({'height': '24px', 'border-bottom': '1px solid #D5D5D5'});//.gradient('top', '#F8CEDC', '#FAB2CA').css('color', '#FFFFFF');
					self.rightContent.find('.'+key).display();
				}
			});
		},
        /*
        * 添加右侧栏标签
        * url 链接地址
        * title 标签的名称
        * closebutton 是否可以关闭
        * obj chatView因为需要调用对象。
        */
        _addRightTag:function(url,title,closebutton,obj){
            if( obj && this.extended.rightElement == false){
                obj.mode.toggleExpansion(true);
            };
            var rightContentHeight = this.options.height - 28;
            var self = this;
            var taglength = $('.window-right-tags').find('div[class]').length;
            var tagWidth = this.options.rightElementWidth-1;
            var styleWid = Math.floor(tagWidth/(taglength+1));
            var styleWid2 = tagWidth - styleWid*taglength;
            var linkpageClass = 'link_' + $.randomChar();
            //判断URL是否为正规地址。
            if( !(url.indexOf('http://') > -1 || url.indexOf('https://') > -1) ){
                url = "http://" +url;
            }
            //判断是否事重复链接。
            var repeatEle = this._repeatRightTag(url);
            if( repeatEle ){
                self._selectedTag(repeatEle);
                return ;
            }
            if( $(".window-right-tags").find('div[class]').length >=4 ){
                return;
            }
            //判断关闭标签是否存在
            var closebuttonstr = '';
            var tagContent = '';
            if( closebutton == true ){
                closebuttonstr = '<span class="closelinkpage" style="width:16px;height:25px;float:right;text-align:center;line-height:25px;display:inline-block;border:none;position:absolute;top:0;right:0;">X</span>';
                tagContent = '<p style="height:25px;float:left;line-height:25px;text-align:center;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">'+title+'</p>'
            }else{
                tagContent = title;
            }
            var divstr = '<div class="'+linkpageClass+' talk_selected" style="'+$.STYLE_BODY + 'position:relative;background-color:#FAF9F9;height:24px;line-height:24px;text-align:center;cursor:pointer;border-bottom:1px solid #d5d5d5;border-right:1px solid #d5d5d5;float:left;'+'width:'+(styleWid2-1)+'px;'+'">'+tagContent+closebuttonstr+'</div>';
            $(".window-right-tags").find(".talk_selected").removeClass("talk_selected");
            $(".window-right-tags").find('div[class]').css('width',(styleWid-1)+'px');
            $(".window-right-tags").find('div[class]').eq(taglength-1).insert(divstr,'afterend');
            $(".window-right-tags").find('div[class]').find('p').css("width",(styleWid-18)+"px");
            $('.window-right-content').insert( ['<div class="'+linkpageClass+' view-right-content" style="',$.STYLE_BODY,'background-color:#FAF9F9;width:100%;height:'+rightContentHeight+'px;overflow-x:hidden;overflow-y:hidden;display:none;border-radius:0px 0px 5px 0px;-moz-border-radius:0px 0px 5px 0px;-webkit-border-radius:0px 0px 5px 0px;"><iframe style="width:100%;height:100%;border:none;" src="'+url+'" ></iframe></div>'].join('') )
            $(".window-right-tags").find('.'+linkpageClass).bind('click',function(){
                self._selectedTag(this);
            });
            this._selectedTag($('.'+linkpageClass));
            $(".window-right-tags").find('.'+linkpageClass).find(".closelinkpage").bind("click",function(event){
                var event = $.Event.fixEvent(event);
                event.preventDefault();
                event.stopPropagation();
                self._closelinkpage(this);
            })
        },
        /*
        *判断标签是否已经在右侧标签栏中存在。
        *
        */
        _repeatRightTag: function(url){
            var obj = null;
            $('.window-right-content').find('iframe').each(function(i,ele){
                var elementsrc = ele.src;
                //这里不太准确。
                elementsrc = elementsrc.replace(/^http:\/\//,"");
                elementsrc = elementsrc.replace(/\/$/,"");
                url = url.replace(/^http:\/\//,"");
                url = url.replace(/\/$/,"");
                if( url == elementsrc ){
                    var repeatEleClass = ele.parentElement.className;
                    var arr = repeatEleClass.split(" ");
                    for ( var i = 0 ; i<arr.length ; i++ ){
                        if( arr[i].indexOf("link_") > -1 ){
                            obj  = $('.window-right-tags '+'.'+arr[i])[0];
                        }
                    }
                }
            })
            return obj;
        },
        /*
        *关闭右侧栏按钮
        *
        */
        _closelinkpage:function(obj){
            var checked = obj.parentElement.className.indexOf('talk_selected') >  -1;
            $(obj.parentElement).removeClass("talk_selected");
            var str ='.'+ obj.parentElement.className.trim();
            $(obj.parentElement).remove();
            $(".window-right-content").find(str).remove()
            var taglength = $('.window-right-tags').find('div[class]').length;
            var tagWidth = $('.window-right-tags').width();
            var styleWid = Math.floor(tagWidth/(taglength))-1;
            var styleWid2 = tagWidth - (styleWid+1)*(taglength-1) - 1;
            $(".window-right-tags").find('div[class]').css('width',styleWid+'px');
            $(".window-right-tags").find('div[class]').last().css('width',styleWid2+'px');
            if( checked && $(".window-right-tags").find('div[class]').length > 0 ){
                this._bindTag();
                this._selectedTag($(".window-right-tags").find('div[class]').last()[0]);
            }
        },
		_clearTag: function(){
			this.rightBody.find("*").remove();
			this.rightTags = null;
			this.rightContent = null;
		}
	};
    //view 导出
    //（6.8.2合版）均采取局部变量在ntView中返回的方式，加载视图文件
    if( typeof $.ntView === "undefined"){
        $.ntView = {
            "chatView": chatView,
            "minimizeView": minimizeView,
            "chatManageView": chatManageView
        };
    }


})(nTalk);
