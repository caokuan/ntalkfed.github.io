(function($, underfined){
	
	if( $.invite ){
		return;
	}

	var CON_LANG = {
			destName:			'{$destname}客服',
			invitationText:		'向您发出对话邀请',
			buttonCancelText:	'忽略',
			buttonConfirmText:	'接受',
			listEntranceText:	'在线客服'
		},
		/**
		 * 
		 * @method _load 加载配置文件
		 * @param {String}   settingid 配置ID
		 * @param {JSON}     config    配置
		 * @param {Function} callback  加载完成的回调函数
		 */
		_load = function(settingid, config, callback){
			var self = this, url;

			if( config && config.settingid == settingid ){
				callback(config);
				return;
			}

			url = [
				//debug temp
				//'http://192.168.1.119/xn6/config/6/',
				$.server.flashserver, 'config/6/',
				settingid.split("_").slice(0, 2).join('_'), '_',
				settingid, '.js'
			].join('');
			
			$.require(url, function(script){
				if( script.error || (!nTalk.CONFIG && !NTKF.CONFIG) ){
					$.Log('nTalk.invite::load config file failed', 3);
					return;
				}

				$.base.config = $.extend({
					settingid: settingid
				}, nTalk.CONFIG || NTKF.CONFIG);
				
				callback($.base.config);
			});
		};

	$.invite = {
		config: null,	//配置文件内容
		number: 0,		//邀请次数
		timeID: null,
		settingid: '',
		inviteid: '',   //邀请ID
		destid: '',		//发起邀请的客服ID
		winInvite: null,
		/**
		 * @method start 邀请开始
		 * @param  {string} settingid 配置ID
		 * @param  {string} destid    发起邀请的客服ID
		 * @return {void}             [description]
		 */
		start: function(settingid, destid, inviteid){

			if( !settingid ){
				return;
			}
			
			this.settingid = settingid || '';
			this.destid    = destid || '';
			this.inviteid  = inviteid || '';
			$.Log('nTalk.invite.start(' + settingid + ')');
			_load(settingid, $.base.config, function(conf){

				$.invite._init(conf);
			});
		},
		/**
		 * ===Private methods============================
		 * @method _init  初始化邀请信息
		 * @param  {JSON}  conf 配置内容
		 */
		_init: function(config){
			this.config = config;

			var self = this, conf = this.config.invite;
			
			if( !conf ){
				$.Log('No invitation Configuration', 2);
				return;
			}
			
			if( !this.destid ){
				//2015.03.23 邀请需要接收回执，自动邀请时，无客服ID，需要获取客服组ID
				this.destid = this.config.icon ? this.config.icon.members.groupID :
					this.config.list ? this.config.list.members.groupID :
					this.config.toolbar ? this.config.toolbar.members.groupID : '';
			}
			
			setTimeout(function(){

				self._create(conf);
				
				self.timeID = setInterval(function(){
					
					self._create(conf);
					
				}, conf.invite_interval * 1000);

			}, conf.invite_waittime * 1000);
		},
		/**
		 * @method _create  创建邀请框
		 * @param  {JSON}  conf 配置内容
		 */
		_create: function(conf){
			var reg, color = /#[0-9a-f]/gi;
			
			//每次会话只显示指定次
			if( conf.invite_onlyone > 0 && parseFloat($.cache.get('onlyone')) > conf.invite_onlyone - 1 ){
				clearInterval( this.timeID );
				return;
			}
			//已打开聊窗时、已展示邀请
			if( ($.chatManage && $.chatManage.hash.count() > 0) || $('#entrance_container_invite').length ){
				return;
			}
			if( $.browser.mobile ){
				//移动设备展示独立邀请
				return;
			}
			
			//頁面內型判斷
			if( conf.invite_pagetype && !$.isNumeric(conf.invite_pagetype) ){
				try{
					reg = new RegExp(conf.invite_pagetype, 'i');
					if( !reg.test($.url) ){
						return;
					}
				}catch(e){
					//;
				}
			}
			
			$.Log('nTalk.invite._create()', 1);
			this.number++;
			if( this.number >= conf.invite_repeat ){
				this._stop();
			}
			var self = this,
				headerColor,
				background = '',
				buttonClose = '',
				startColor = '',
				endColor   = '',
				left, top,
				options,
				def = {
					width: 436,
					height:161
				}
			;
			buttonClose= 'url(' + $.sourceURI + 'images/invite/1/bg_invite.png) no-repeat -320px -189px';
			if( /2|3/i.test(conf.invite_rcmdskin) ){
				//自定义、定制化皮肤
				background = '#fff url(' + conf.invite_skin + ') no-repeat 0 0';
			}else{
				//推荐皮肤，默认背景图
				background = '#fff url(' + $.sourceURI + 'images/invite/1/bg_invite.png) no-repeat -12px -10px';
				headerColor = conf.invite_skin.split('|');
				startColor = headerColor[0];
				endColor   = headerColor.length > 1 ? headerColor[1] : headerColor[0];
			}
			$.cache.set('onlyone', this.number);
			//预防配置中存在异常配置，设定默认配置
			conf.invite_position = $.extend({}, {
				position: 'center-center',
				xoff: 0,
				yoff: 0
			}, conf.invite_position);
			//定位
			switch( conf.invite_position.position ){
				case 'left-top':
					left = 0  + conf.invite_position.xoff;
					top  = 0 + conf.invite_position.yoff;
					break;
				case 'center-top':
					left = ($(window).width()  - def.width)/2  + conf.invite_position.xoff;
					top  = 0 + conf.invite_position.yoff;
					break;
				case 'right-top':
					left = $(window).width()  - def.width  + conf.invite_position.xoff;
					top  = 0 + conf.invite_position.yoff;
					break;
				case 'left-center':
					left = 0  + conf.invite_position.xoff;
					top  = ($(window).height() - def.height)/2 + conf.invite_position.yoff;
					break;
				case 'right-center':
					left = $(window).width()  - def.width  + conf.invite_position.xoff;
					top  = ($(window).height() - def.height)/2 + conf.invite_position.yoff;
					break;
				case 'left-bottom':
					left = 0  + conf.invite_position.xoff;
					top  = $(window).height() - def.height + conf.invite_position.yoff;
					break;
				case 'center-bottom':
					left = ($(window).width()  - def.width)/2  + conf.invite_position.xoff;
					top  = $(window).height() - def.height + conf.invite_position.yoff;
					break;
				case 'right-bottom':
					left = $(window).width()  - def.width  + conf.invite_position.xoff;
					top  = $(window).height() - def.height + conf.invite_position.yoff;
					break;
				default://'center-center'
					left = ($(window).width()  - def.width)/2  + conf.invite_position.xoff;
					top  = ($(window).height() - def.height)/2 + conf.invite_position.yoff;
					break;
			}
			
			//2015.06.11 最大、最小限制
			left = Math.min(Math.max(left, 0), $(window).width()  - def.width);
			top  = Math.min(Math.max(top,  0), $(window).height() - def.height);
			
			options = $.merge({
				className:	'entrance_container_invite',
				left:		left,
				top:		top,
				dropHeight:	36,
				resize:		false,
				drag:		true,
				//定义 固定:相对屏幕定位，滚动时，定位不变; 浮动：相对页面定位，滚动时，跟随页面滚动;
				fixed:		conf.invite_fixed == 1,
				rightNode:	false,
				zIndex:		2147483647
			}, def);
			this.winInvite = new $.Window( options );
			this.winInvite.containter.attr('id', 'entrance_container_invite');
			this.winInvite.buttonMax.display();
			this.winInvite.buttonMin.display();
			this.header  = this.winInvite.header;
			this.element = this.winInvite.chatBody;
			
			if( startColor && endColor ){
				this.header.gradient('top', startColor, endColor);
			}
			this.winInvite.containter.css({
				'border':     '1px solid #ccc',
				'border-radius':'3px',
				'-moz-border-radius':'3px',
				'-webkit-border-radius':'3px',
				'background': background
			});
			this.header.insert([
				'<span style="',$.STYLE_BODY,'float:left;margin:0 0 0 20px;font-size:14px;font-weight:bold;color:#fff;line-height:36px;">',conf.invite_title,'</span>'
			].join(''), 'afterbegin');
			
			this.element.css('top', '-4px').html([
				'<div class="entrance_content" style="',$.STYLE_NBODY,'margin:0 0 0 120px;">',
					'<div style="',$.STYLE_BODY,'font-size:14px;margin:5px 0 0 0;height:75px;overflow:hidden;">',
						'<div style="',$.STYLE_BODY,'font-size:14px;overflow:hidden;height:24px;">',
						'</div>',
						'<div style="',$.STYLE_BODY,'font-size:14px;">',
							conf.invite_content,
						'</div>',
					'</div>',
					'<div class="entrance_buttons" style="',$.STYLE_NBODY,'height:45px;text-align:right">',
						'<input type="button" name="cancel" value="',CON_LANG.buttonCancelText,'" style="font-size:14px;text-align:center;width:68px;height:30px;line-height:26px;margin:15px 0px 0 15px;" />',
						'<input type="button" name="confirm" value="',CON_LANG.buttonConfirmText,'" style="font-size:14px;text-align:center;width:68px;height:30px;line-height:26px;margin:15px 20px 0 15px;" />',
					'</div>',
				'</div>'
			].join(''));
			
			this.winInvite.buttonClose.css({
				'background':	buttonClose,
				'margin':		'8px 8px 0 0'
			}).hover(function(){
				$(this).css('background-position', '-361px -188px');
			}, function(){
				$(this).css('background-position', '-320px -189px');
			}).click(function(){
				//忽略客服邀请
				self._close(false);
			});
			this.element.find('.entrance_buttons INPUT[name=cancel]').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				
				$(this).css('background-position', '-178px -186px');
				//拒绝客服邀请
				self._close(true);
			});
			this.element.find('.entrance_buttons INPUT[name=confirm]').click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				
				$(this).css('background-position', '-178px -186px');
				self._open();
			});
			this.element.click(function(event){
				$.Event.fixEvent(event).stopPropagation();
				
				self._open();
			});
		},
		_createmobile: function(conf){
		},
		_showMobilePhone: function(){
		},
		/**
		 * 显示弹出消息框:
		 * @param  {[type]} html
		 * @return {[type]}
		 */
		showDialog: function(html, style){
			var self = this, offset;
			
			this._dialogDisplay = false;
			style = $.merge({
				'display':	'block',
				'width':	$(window).width() + 'px',
				'height':	$(window).height() + 'px',
				'top':		'0px',
				'left':		'0px',
				'opacity':	1,
				'border-radius': '0px'
			}, style);
			
			if( !this.alertIframe || !this.alertIframe.length ){
				this.alertIframe	= $({className:'mobile_alert_iframe',style:$.STYLE_NBODY + 'display:none;position:fixed;left:0;top:0;width:100%;-moz-opacity:0;opacity:0;filter:alpha(opacity=0);z-index:88888;'}).appendTo(true);
				this.alertBackground= $({className:'mobile_alert_background',style:$.STYLE_NBODY + 'display:none;position:fixed;left:0;top:0;width:100%;background:#000;-moz-opacity:0.35;opacity:0.35;filter:alpha(opacity=35);z-index:99999;'}).appendTo(true);
				this.alertContainer = $({className:'mobile-alert-container',style:$.STYLE_BODY + 'font-size:14px;padding:10px 0 0;display:none;position:fixed;left:39px;top:100px;width:auto;height:auto;border-radius:10px;-moz-opacity:1;opacity:1;filter:alpha(opacity=100);z-index:2147483647;background:#fff;'}).appendTo(true);
			}
			
			this.alertContainer.html( html ).css(style, 500, function(){});
			
			this.alertIframe.css({
				display: 'block',
				width:	 '100%',
				height:	 ($(window).height() + 50) + 'px'
			});
			this.alertBackground.css({
				display: 'block',
				width:	 '100%',
				height:	 ($(window).height() + 50) + 'px',
				opacity: 0.6
			});
			
			if( $.browser.iPad||$.browser.iPod||$.browser.iPhone ){
				$(window).scrollTop(1);
				
				this.alertContainer.css({
					'height':	style.height,
					'top':		style.top
				});
				this.alertIframe.css({
					top:		$(window).offset().top + 'px',
					height:		($(window).height() + 50) + 'px'
				});
				this.alertBackground.css({
					top:		$(window).offset().top + 'px',
					height:		($(window).height() + 50) + 'px'
				});
			}
			
			$(window).bind('resize', function(event){
				self.alertBackground.css({
					height:	 ($(window).height() + 50) + 'px'
				});
				self.alertContainer.css({
					left:  ($(window).width() - parseFloat(self.alertContainer.width()))/2 + 'px',
					top:   ($(window).height() - parseFloat(self.alertContainer.height()))/2 + 'px'
				});
			});
			
			return this.alertContainer;
		},
		/**
		 * @method hiddenDialog 隐藏浮动层
		 * @return {void}
		 */
		hiddenDialog: function(){
			if( !this.alertIframe ) return;
			this.alertIframe.display();
			this.alertContainer.display();
			this.alertBackground.display();
			this._dialogDisplay = true;
		},
		/**
		 * @methid _reposition 重新定位邀请框
		 * @return {void}
		 */
		_reposition: function() {
			var top = (($(window).height() / 2) - ($("#entrance_container_invite").height() / 2));
			var left = (($(window).width() / 2) - ($("#entrance_container_invite").width() / 2));
			if( top < 0 ) top = 0;
			if( left < 0 ) left = 0;
			
			// IE6 fix
			if( $.browser.oldmsie ) top = top + $(window).scrollTop();
			
			$("#entrance_container_invite").css({
				top:  top + 'px',
				left: left + 'px'
			});
		},
		_maintainPosition: function(status) {
			switch(status) {
				case true:
					$(window).addEvent('resize', $.invite._reposition);
					if( $.browser.oldmsie ){
						$(window).addEvent('scroll', $.invite._reposition);
					}
				break;
				case false:
					$(window).removeEvent('resize', $.invite._reposition);
					if( $.browser.oldmsie ){
						$(window).removeEvent('scroll', $.invite._reposition);
					}
				break;
			}
		},
		/**
		 * @method _stop 终止会话邀请
		 */
		_stop: function(){
			clearInterval(this.timeID);
			this.timeID = null;
		},
		/**
		 * @method _open 接受客服邀请
		 * @return {void}
		 */
		_open: function(){
			if( this.destid && this.inviteid ){
				$.im.refuseInvite(this.destid, this.inviteid, 0);
			}
			$('#entrance_container_invite').remove();
			$.invite._maintainPosition(false);
			
			$.im_openInPageChat(this.config.settingid, ''/*itemid*/, this.destid/*destid*/, {single:-1, autoconnect: true}/*json*/, ''/*itemparam*/);
			
			if( this.config.invite.invite_session_disable == '1' ){
				//会话后不再邀请
				this._stop();
			}
		},
		/**
		 * @method _open 拒绝或忽略客服邀请
		 * @return {void}
		 */
		_close: function(refusal){
			if( this.destid && this.inviteid ){
				$.im.refuseInvite(this.destid, this.inviteid, 2);
			}
			$('#entrance_container_invite').remove();
			$.invite._maintainPosition(false);
			
			if( refusal === true && this.config.invite.invite_refusal_disable == '1' ){
				//拒绝后不再邀请
				this._stop();
			}
		}
	};
})(nTalk);