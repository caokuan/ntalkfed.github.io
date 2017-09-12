;(function($, undefined){
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
			this.scrollBox = $({className: 'view-scrollBox', style:$.STYLE_NBODY + 'display:block;border-radius:10px;'}).appendTo(this.mainBox);
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
				background:	'#f9f9f9',
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
				$(this).css('background', '#a6a6a6');
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

			this.callChatResize(this.options.width, this.options.height);
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
				//已存在客服输入状态时，直接显示
				if( selector == 'systembottom' ){
					this.chatHistory.find('li.' + selector).css('visibility', 'visible');
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
				}
			}

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
					//展示商品信息
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
				            // 2017.04.17针对有些图片放送成功但是展示的时候出现请求失败的的问题，做出优化，再第一次请求失败的情况下在请求一次。
				            var receiveNum = 0;
				            var receiveImage = function(){
				            $.require(data.url + '#rnd#image', function(image) {
                                var imageHeight;
				                if (image.error) {
					                	if( receiveNum == 0 ){
					                		receiveNum++;
					                		receiveImage();
					                	}else{
				                    $.Log('upload file failure.', 3);
				                    //IE7 兼容处理
				                    liElement.find('table').css('width', '120px');
				                    bodyElement.css({
				                        'width': '100px',
				                        'background': 'url(' + $.imageicon + ') no-repeat 0 -145px'
				                    });
					                	}

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
				            }
				            receiveImage();
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
					try{
					self.mode.loadLink(url, '.' + selector.replace(/ntalk\-link\-contains\s+/gi, ''));
					}catch(e){

					}
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
          data.url = $.protocolFilter(data.url);
          data.imageurl = $.protocolFilter(data.imageurl);
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
			if (this._inputStateTimeID && position === undefined) {
			    return;
			}
			position = position ? position : -22;

			var self = this,
			    elementWait = this.chatHistory.find('.view-history-body-wait');

			elementWait.html($.lang.system_printing || '').css({
			    'position': 'relative',
			    'width': $.enLength($.clearHtml($.lang.system_printing || '')) * 7 + "px",
			    'left': '10px',
			    'font-size': '12px',
			    'line-height': '20px'
			});

			$({ tag: 'span', style: 'display:block; left: -24px; top:-20px; position:relative; width:20px; height:20px; background: url(' + $.sourceURI + 'images/mobileicon.png) -110px -70px no-repeat' }).appendTo(elementWait);
			$({ id: 'show-input-status-loading', tag: 'span', style: 'display:block; left: -14px; top:-38px; position:relative; width:20px; height:20px' }).html(this.loadingPoint ? this.loadingPoint : '...').appendTo(elementWait);

			var count = 3;
			if (!this._inputStatusLoadingInter) {
			    this._inputStatusLoadingInter = setInterval(function() {
			        self.loadingPoint = '';
			        count--;
			        for (var i = 0; i < count; i++) {
			            self.loadingPoint += '.';
			        }
			        $('#show-input-status-loading').html(self.loadingPoint);
			        if (count == -1) {
			            count = 4;
			        }
			    }, 1000);
			}

			this._inputStateTimeID = setTimeout(function() {

			    if (!elementWait.length) {
			        clearTimeout(self._inputStateTimeID);
			        clearInterval(self._inputStatusLoadingInter);
			        self._inputStateTimeID = null;
			        return;
			    }

			    position = position <= -52 ? -22 : position - 10;
			    elementWait.css('background-position', position + 'px -250px');

			    self.showInputState(position);
			}, 5E2);

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
			var statusStyle = (dest && userid) ? ' display:none; ' : '';
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
			this.objImage = this._createUpload(server, 'uploadimage', this.contains.find('.chat-view-image'),'', 'image/jpg,image/pjpeg,image/png,image/gif,image/jpeg,image/bmp');
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
								'<td class="view-history-content" style="',$.STYLE_BODY,'padding:8px;background:#8CD0F3;border:1px solid #d5d5d5;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;">',
									'<div class="view-history-body" style="min-height:20px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;/*width:100px;*/min-height:50px;height:85px;*font-size:0px;*line-height:0px;*font-family:Arial;' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;',
									(data.type == 1 ? 'color:#' + data.color + ';font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' ' + data.fontsize + 'px/160% Arial,SimSun;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									(data.type == 1 ? data.msg : ''),
									'</div>',
									'<div class="view-history-progress" style="',$.STYLE_NBODY,'display:none;border-top:1px solid #30c2fd;background:#fff;height:5px">',
										'<div class="view-history-upload-progress" style="',$.STYLE_NBODY,'height:5px;width:20%;background:#30c2fd;"></div>',
									'</div>',
								'</td>',
								'<td style="',$.STYLE_NBODY,'width:20px;vertical-align:middle;overflow:visible;">',
									//尖角添加className
									'<div class="view-history-angle" style="',$.STYLE_NBODY,'position:relative;left:-1px;z-index:1;width:20px;height:18px;background:url(',$.imageicon,') no-repeat -1px -63px;"></div>',//
								'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_BODY,'overflow:visible;text-align:right;position:relative;">',
									'<span class="view-history-time" style="',$.STYLE_BODY,'float:right;color:#b9b9c1;line-height:26px;">',$.formatDate(data.timerkeyid),'</span>',
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
				[//接收的消息
					'<table style="',$.STYLE_NBODY,'float:left;float:none;table-layout:auto;border-collapse:separate;" class="view-history-left" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'">',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_NBODY,'width:20px;vertical-align:middle;overflow:visible;">',
									//尖角添加className
									'<div class="view-history-angle" style="',$.STYLE_NBODY,'position:relative;right:-1px;top:0px;z-index:1;width:20px;height:18px;background:url(',$.imageicon,') no-repeat -20px -62px;"></div>',
								'</td>',
								'<td class="view-history-content" style="',$.STYLE_BODY,'padding:8px;background:#ffffff;border:1px solid #d5d5d5;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px">',
									'<div class="view-history-body" style="min-height:20px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;/*width:100px;*/min-height:50px;height:85px;*font-size:0px;*line-height:0px;*font-family:Arial;' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;',(type=='bottom' ? 'width:auto;' : ''),
									(data.type == 1 ? 'color:#' + data.color + ';font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' ' + data.fontsize + 'px/160% Arial,SimSun;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									(/^(1|9)$/i.test(data.type) ? data.msg : ''),
									'</div>',
								'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_BODY,'overflow:visible;position:relative;">',
									'<span class="view-history-more" style="',$.STYLE_BODY,'margin-right:5px;float:left;color:blue;cursor:pointer;line-height:26px;display:none;">',$.lang.button_more,'</span>',
									//接收到非当前客服的消息时，显示客服名 当时机器人转人工消息是不显示机器人名称
									(data.userid && !this.mode.isVisitor(data.userid)&&this.mode.dest.id!=data.userid&&data.systype != (4) ?
										['<span class="view-history-destname" style="',$.STYLE_BODY,'padding-right:5px;float:left;color:#b9b9c1;line-height:26px;">',
											data.name,
										'</span>'].join('') :
									''),
									'<span class="view-history-time" style="',$.STYLE_BODY,'float:left;color:#b9b9c1;line-height:26px;">',
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
			var manualText = ($.server.robot == 1) ? $.lang.button_switch_manual : "";
			return type=='load' ?
				[
					'<div class="chat-view-load-icon" style="',$.STYLE_NBODY,'margin:0 auto;width:100px;height:33px;background:transparent url(',$.imageloading,') no-repeat 0px 0px;"></div>',
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
					'<div class="chat-view-window-toolbar" style="',$.STYLE_BODY,'height:28px;width:100%;border-top:1px solid #d5d5d5;background:#f9f9f9;">',
						//分配客服时状态消息
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-window-status-info" style="',$.STYLE_BODY,'background:#66ccff;overflow:hidden;margin-left:10px;width:380px;line-height:30px;height:30px;position:absolute;top:-30px;z-index:99;text-align:center;display:none;"></div>',
						'</div>',
						//2015.01.05 添加输入提示建议
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-suggest-list chat-view-span" style="',$.STYLE_NBODY,'border:1px solid #999;background:#fafafa;width:400px;line-height:30px;height:auto;position:absolute;top:-2px;left:2px;z-index:999;display:none;">',
								'<ul style="',$.STYLE_BODY,'list-style:none;"></ul>',
							'</div>',
						'</div>',
						'<div class="chat-view-button chat-view-face" title=',$.lang.button_face,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:3px 0 3px 10px;_margin-left:5px;border:0px solid #ccc;height:22px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -100px 1px;">',
							'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-window-face" style="',$.STYLE_NBODY,'display:none;position:absolute;left:-11px;top:-229px;border:1px solid #979A9E;width:273px;height:224px;background:#fff;z-index:1000002;cursor:auto;border-radius:3px;overflow:hidden;">',

								'</div>',
							'</div>',
						'</div>',
						'<div class="chat-view-button chat-view-image" title=',$.lang.button_image,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -120px 0;"></div>',
						'<div class="chat-view-button chat-view-file" title=',$.lang.button_file,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -140px 0;"></div>',
						'<div class="chat-view-button chat-view-history" title=',$.lang.button_save,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -180px 0;"></div>',
						//2014.11.11 添加查看聊天记录按钮
						'<div class="chat-view-button chat-view-load-history" title=',$.lang.button_view,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -220px -40px;"></div>',
						'<div class="chat-view-button chat-view-evaluate" title=',$.lang.button_evaluation,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -160px 0;"></div>',
						'<div class="chat-view-button chat-view-capture" title=',$.lang.button_captureImage,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -200px 0;"></div>',
						'<div class="chat-view-capture-options" style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 0px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;">',
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
						'<div class="chat-view-button chat-view-exp" style="',$.STYLE_BODY,'color:#525252;float:right;margin:4px 3px;padding:0 3px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;">',$.lang.button_more,' &gt;</div>',
					'</div>',
					'<div class="chat-view-window-editor" style="',$.STYLE_BODY,'height:95px;width:100%;overflow:hidden;">',
						'<textarea placeholder="',$.lang.default_textarea_text,'" style="',$.STYLE_BODY,CON_STYLE_SHADOW,'margin:1px;padding:10px;width:391px;width:411px\\9;height:73px;height:93px\\9;outline:0px solid #08f;border:0px solid #08f;color:#ccc;resize:none;overflow:hidden;overflow-y:auto;"></textarea>',
					'</div>',
					'<div class="chat-view-window-bottom" style="',$.STYLE_BODY,'height:40px;width:100%;background:#f9f9f9;border-radius:0px 0px 0px 5px;-moz-border-radius:0px 0px 0px 5px;-webkit-border-radius:0px 0px 0px 5px">',
						'<div class="chat-view-options" style="',$.STYLE_BODY,'margin:6px 10px 6px 0;float:right;border:1px solid #ccc;width:14px;height:26px;line-height:25px;text-align:center;cursor:pointer;">',
							'▼',
							'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:1px;position:relative;overflow:visible;">',
								'<div class="chat-view-span chat-view-options-menu" style="',$.STYLE_BODY,'display:none;padding:1px;background:#fff;position:absolute;left:-89px;top:-79px;border:1px solid #ccc;width:100px;*width:102px;_width:102px;height:auto;z-index:1000002;cursor:cursor;">',
									//发送消息方式
									'<div class="view-option-enter talk_selected" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;background:#efefef;">',$.lang.button_enter,'</div>',
									'<div class="view-option-ctrl+enter" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;">',$.lang.button_ctrl_enter,'</div>',
								'</div>',
							'</div>',
						'</div>',
						'<div class="chat-view-submit" style="',$.STYLE_BODY,'margin:6px 0;float:right;width:auto;height:26px;line-height:26px;text-align:center;padding:0 25px;border:1px #CCC solid;border-right:none;cursor:pointer;">',$.lang.chat_button_send,'</div>',
						'<span class="chat-view-end-session" style="',$.STYLE_BODY,'text-decoration:none;margin:8px 10px 8px 0;padding:0 10px;float:right;height:24px;line-height:24px;cursor:pointer;">',$.lang.button_end_session,'</span>',
						'<span class="chat-view-xiaoneng-version" style="',$.STYLE_BODY,'display:block;visibility:visible;text-decoration:none;margin:6px 0px 6px 10px;float:left;height:26px;line-height:26px;color:#DDD;">',$.lang.chat_xiaoneng_version,'</span>',
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

				var css = {color:'#000'};
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
					//2016.12.15 截图的时候，定位索要上传的图片
					$('.pastepic-background').fixed({width:'100%',height:'100%',left:'0',top:'0'});
					$(".pastepic-container").fixed({width:'640px',height:'480px',top:c_top+'px',left:left+'px'});
					$(".pastepic-toolbar").fixed({width:'320px',height:'30px',top:t_top+'px',left:left+'px'});
			    };

				var paste = new $.paste(e, pasteCallback);
				paste.getImgBase64Str();

			});

			if( this.textEditor.val() === '' && !$.browser.html5 ){
				this.textEditor.val( $.lang.default_textarea_text );
			}

			//this._listenTextEditor();
			//结束会话
			this.chatElement.find('.chat-view-end-session').hover(function(event){
				$(this).css('color', '#005fea');
			}, function(event){
				$(this).css('color', '#010101');
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

				//hack lt IE8
				positionX = $(this).css('background-position').split(' ').shift();
				positionY = $(this).indexOfClass('chat-view-load-history')||$(this).indexOfClass('chat-view-switch-manual')||$(this).indexOfClass('chat-view-change-csr') ? ' -60px' : ' -19px';

				$(this).css('background-position', positionX + positionY);
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}

				//hack lt IE8
				positionX = $(this).css('background-position').split(' ').shift();
				if( $(this).indexOfClass('chat-view-face') ) {
					positionY = ' 1px';
				}else if( $(this).indexOfClass('chat-view-load-history') || $(this).indexOfClass('chat-view-switch-manual') || $(this).indexOfClass('chat-view-change-csr')) {
					positionY = ' -40px';
				}else {
					positionY = ' 0px';
				}

				$(this).css('background-position', positionX + positionY);
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
			//,.chat-view-options,.chat-view-options-menu .chat-view-span div
			this.chatElement.find('.chat-view-submit').hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					'background-color': '#F1F1F1'
				});
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					'background-color': 'none'
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
			if( typeof data.msg !== 'string' || (/<.*?\>/gi.test(data.msg)) || data.type == 7){

				//2015.03.28 添加消息内容中含图片时，默认显示小图，点击后显示大图
				if( (data.type === 1 || data.type == 7) && /<img(.*?)src=([^\s]+)(.*?)>/gi.test( data.msg ) ){
					data.msg = data.msg.replace(/<img(.*?)src=([^\s]+)(.*?)>/gi, '<img class="ntalk-preview" '+ (data.type == 7 ? " robotImg='true' " : "") +'src="' + $.imageloading + '" sourceurl=$2 style="' + $.STYLE_NBODY + '" />');
				}

        if(data.type == 7) {
          data.msg = $.utils.handleLinks(data.msg, null, 'p4');
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
				this.chatElement.find('.chat-view-exp').display(this.mode._moreData && this.mode._moreData.length);
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

				this.chatElement.find('.chat-view-exp').display(this.mode._moreData && this.mode._moreData.length);
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

			//消息区宽、高
			//this.chatHistory.find('ul').css({'width':  (width - 4) + 'px'});
			this.chatHistory.css({'height': (height - 165) + 'px'});
			this.chatElement.find('.chat-view-float-history, .chat-view-float-history iframe').css({'height': (height - 165) + 'px'});
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
			dropHeight: 55,
			width:  415, //聊天窗口区域宽
			height: 465, //聊天窗口区域高
			minWidth: 415,//最小聊天窗口宽
			minHeight:520,//最小聊天窗口高
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
		/*
        *2017.04.01
        *更新电话信息教育版
        *
        */
        setPhoneNumber:function(data){

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

			if( data.status === 0 && $.CON_SINGLE_SESSION !== data.id ){
				icon.find('img').css('opacity', '0.5');
			}else{
				icon.find('img').css('opacity', '1');
			}
			name.css('visibility', 'visible').html( data.title || data.name );

			if($.evaluateStarLevel) {
			    sign.css('display', 'none');
			}else{
			    signWidth = Math.max(0, this.header.width() - name.width() - 165);
			    sign.css('visibility', 'visible').attr('title', data.sign).css('width', signWidth + 'px').html( data.sign );
			}
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
				'border-top': '1px solid #5f6467',
				'border-left': '1px solid #5f6467',
				'border-right': '1px solid #5f6467',
				'border-bottom': '0',
				'top': '13px',//IN
				'border-radius': '5px 5px 0px 0px',
				'-moz-border-radius': '5px 5px 0px 0px',
				'-webkit-border-radius': '5px 5px 0px 0px',
				'width': (this.options.width - 2) + 'px',//IN
				'height': (this.options.dropHeight - 13) + 'px'//IN
			});

			this.headName = $({tag: 'span', className:'chat-header-name', style: $.STYLE_BODY + 'color:#ffffff;margin:10px 0px 10px 80px;display:inline-block;float:left;height:20px;line-height:20px;max-width:220px;visibility:hidden;overflow:hidden;font-weight:bold;cursor:auto;font-size:12px;color:#fff;'}).appendTo(this.headBody).html('');
			this.headSign = $({tag: 'span', className:'chat-header-sign', style: $.STYLE_BODY + 'color:#c3c3c3;margin:10px 0px 10px 10px;display:inline-block;float:left;height:20px;line-height:20px;visibility:hidden;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;cursor:auto;'}).appendTo(this.headBody);
			this.headIcon = $({tag: 'div',  className:'chat-header-icon', style: $.STYLE_NBODY + 'visibility:hidden;border-radius:0px;overflow:hidden;background:url(' + $.imageicon + ');background-repeat:no-repeat;background-position:-374px 0; background-color:#ffffff;position:absolute;left:20px;top:0px;width:' + this.CON_ICON_WIDTH + 'px;height:' + this.CON_ICON_HEIGHT + 'px;border:1px solid #5f6467;z-index:1;'}).appendTo(this.header, true);

			this.chatBody = this._objView.chatBody;

			this.leftElement = $({className: 'body-chat-tags', style: $.STYLE_NBODY + 'display:none;float:left;background:#fafafa;overflow:hidden;'}).css({
				'border-left': '1px solid #5f6467',
				'border-bottom': '1px solid #5f6467',
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

			if( setMax ){
				this._objView.buttonMax.css('background-position', '-20px 0').attr('title', $.lang.chat_button_resize_min);
			}else{
				this._objView.buttonMax.css('background-position', '-40px 0').attr('title', $.lang.chat_button_resize_max);
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
