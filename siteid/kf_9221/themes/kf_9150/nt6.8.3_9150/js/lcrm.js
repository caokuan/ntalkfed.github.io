/**
 * @file   lcrm.js
 * @date   2014.09.04
 * @desc   当前公网版livecrm.js改写
 * #09.05  图片更新，添加自适应兼容处理
 */
;(function($, undefined){
	/**
	 * @desc	lcrm mode
	 * @rely	
	 */
    var emptyFunc = function(){},
        /*jshint scripturl:true*/
        SCRIPT_URL = "javascript:void();",
		//透明样式
		CON_STYLE_OPACITY	= 'filter:alpha(opacity=0);-moz-opacity:0;-webkit-opacity:0;-khtml-opacity:0;opacity:0;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";',
		//阴影样式
		CON_STYLE_SHADOW	= 'box-shadow:0 3px 2px 0 #aaa;-moz-box-shadow:0 3px 2px 0 #aaa;-webkit-box-shadow:0 3px 2px 0 #aaa;',
		//默认配置
		CON_DEFAULT_OPTIONS = {
			action:			1,		//0 取消 1 执行
			trigger:		0,		//0 立即触发，1离开前触发
			token:			"",		//新 param1
			//--展示相关--
			showmode:		1,		//展示形式 0 通栏1 窗口
			location:		"center-center",//定位
			sizex:			50,		//宽
			sizey:			50,		//高
			tempmode:		0,		//0 图片模版
			tempcontent:	"",		//模版内容，tempmode:0，内容为图片地址
			bgcontent:		"",		//页面背景内容。空/null : 不显示，#开头：纯色，Http开头：图片
			effect:			"",		//动态效果。flyin ：飞入，fadein：淡入，空/null : 无效果
			//--促销相关-
			saletype:		"",		//分类：0优惠券1促销活动2页面客服
			salemode:		"",		//优惠券类型.0 现金券,1 满减券
			price:			"",		//现金价格。salemode=0时使用
			pricebegin:		"",		//满减此价格，salemode=1时使用
			priceend:		"",		//满减此价格，salemode=1时使用
			begintime:		"",		//有效期。开始时间
			endtime:		"",		//有效期。结束时间
			desc:			"",		//使用说明
			sms:			"",		//短信模板
			jumpurl:		"",		//活动连接。saletype：=1 时有效
			kfconfigcode:	""		//客服代码。saletype：=2 时有效
		},
		CON_LANG = {
			symbol: '\uffe5',
			unit: '\u5143',
			type: '\u73b0\u91d1\u5238',
			mode: '\u6ee1\u51cf\u5238',
			valid: '\u4e0b\u8f7d\u540e{$valid}\u6709\u6548',
			desctitle: '\u4f7f\u7528\u8bf4\u660e\uff1a',
			fullcut: '\u6ee1{$begin}\u5143\u51cf{$end}\u5143',
			download: '\u4e0b\u8f7d',
			sms: {
				title: '\u514d\u8d39\u77ed\u4fe1\u4e0b\u8f7d',
				desc: '\u77ed\u4fe1\u4e0b\u8f7d\u514d\u8d39\uff0c\u6211\u4eec\u4f1a\u4e25\u683c\u4fdd\u5bc6\u60a8\u624b\u673a\u53f7'
			},
			mail: {
				title: '\u53d1\u9001\u81f3\u90ae\u7bb1',
				desc: '\u4f18\u60e0\u5238\u4f1a\u4ee5\u90ae\u4ef6\u5f62\u5f0f\u53d1\u9001\u5230\u60a8\u90ae\u7bb1'
			},
			save: {
				title: '\u4fdd\u5b58\u81f3\u672c\u5730\u7535\u8111',
				desc: '\u4f18\u60e0\u5238\u4f1a\u4ee5\u6587\u672c\u6587\u6863\u683c\u5f0f\u53e6\u5b58\u5230\u60a8\u672c\u5730\u7535\u8111'
			},
			title: '\u4eb2\uff0c\u606d\u559c\u60a8\u83b7\u5f97\u4f18\u60e0\u5238\u54e6\uff01',
			smstitle: '\u514d\u8d39\u77ed\u4fe1\u4e0b\u8f7d\u4f18\u60e0\u5238',
			smslabel: '\u8f93\u5165\u624b\u673a\u53f7\u7801\uff1a',
			smserror: '\u624b\u673a\u53f7\u7801\u6709\u8bef\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165\uff01',
			smsbtntext: '\u514d\u8d39\u77ed\u4fe1\u4e0b\u8f7d',
			smsdesc: '\u4f18\u60e0\u5238\u7801\u5df2\u53d1\u51fa\uff0c\u8bf7\u6ce8\u610f\u67e5\u6536\u77ed\u4fe1\uff01\u5982\u679c\u6ca1\u6709\u6536\u5230\uff0c\u60a8\u53ef\u4ee5\u5728{$time}\u4e4b\u540e\u8981\u6c42\u7cfb\u7edf\u91cd\u65b0\u53d1\u9001',
			tempttitle: '\u60a8\u5c06\u6536\u5230\u4ee5\u4e0b\u77ed\u4fe1\uff1a',
			temptdesc: '\u5728\u63d0\u4ea4\u8ba2\u5355\u65f6\u8f93\u5165\u77ed\u4fe1\u4e2d\u7684\u4f18\u60e0\u5238\u5361\u5bc6\uff0c\u5373\u53ef\u4eab\u53d7\u4f18\u60e0',
			
			mailtitle: '\u90ae\u7bb1\u4e0b\u8f7d\u4f18\u60e0\u5238',
			maillabel: '\u8bf7\u8f93\u5165\u90ae\u7bb1\u5730\u5740\uff1a',
			mailerror: '\u90ae\u7bb1\u5730\u5740\u6709\u8bef\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165\uff01',
			mailbtntext: '\u63d0\u3000\u3000\u4ea4',
			maildesc: '\u4f18\u60e0\u5238\u7801\u5df2\u53d1\u51fa\uff0c[link href={$url}]\u53bb\u90ae\u7bb1\u67e5\u6536\u90ae\u4ef6[/link]\uff0c\u5982\u679c\u6ca1\u6709\u6536\u5230\uff0c\u60a8\u53ef\u4ee5\u5728{$time}\u4e4b\u540e\u8981\u6c42\u7cfb\u7edf\u91cd\u65b0\u53d1\u9001',
			
			errormessage: '\u7cfb\u7edf\u5fd9\uff0c\u53d1\u9001\u5931\u8d25',
			closelink: '[link href={$url}]\u5df2\u6536\u5230\u4f18\u60e0\u5238\u7801\uff0c\u8fd4\u56de\u5546\u57ce\u6d88\u8d39[/link]',
			resend: '\u91cd\u65b0\u53d1\u9001',
			sended: '\u5df2\u53d1\u9001',
			day: '{$time}\u5929',
			hour: '{$time}\u5c0f\u65f6',
			minute: '{$time}\u5206\u949f',
			time: '{$time}\u79d2'
		},
		CON_MAIL_SERVER = {
			'163.com':		'mail.163.com',
			'vip.163.com':	'vip.163.com',
			'126.com':		'mail.126.com',
			'qq.com':		'mail.qq.com',
			'vip.qq.com':	'mail.qq.com',
			'foxmail.com':	'mail.qq.com',
			'gmail.com':	'mail.google.com',
			'sohu.com':		'mail.sohu.com',
			'vip.sina.com':	'vip.sina.com',
			'sina.com.cn':	'mail.sina.com.cn',
			'sina.com':		'mail.sina.com.cn',
			'tom.com':		'mail.tom.com',
			'yahoo.com.cn':	'mail.cn.yahoo.com',
			'yahoo.cn':		'mail.cn.yahoo.com',
			'yeah.net':		'www.yeah.net',
			'21cn.com':		'mail.21cn.com',
			'hotmail.com':	'www.hotmail.com',
			'sogou.com':	'mail.sogou.com',
			'188.com':		'www.188.com',
			'139.com':		'mail.10086.cn',
			'189.cn':		'webmail15.189.cn/webmail',
			'wo.com.cn':	'mail.wo.com.cn/smsmail',
			'ntalker.com':	'cnc.exmail.qq.com/login'
		},
		CON_IMAGE_LCRM = $.sourceURI + '/images/livecrm.png',
		CON_IMAGE_00 = $.sourceURI + '/images/coupons0.jpg',
		CON_IMAGE_01 = $.sourceURI + '/images/coupons1.jpg'
	;

	$.require([CON_IMAGE_LCRM, CON_IMAGE_00, CON_IMAGE_01]);
	
	$.lcrm = {
		params: null,
		hasComplete: new $.HASH(),
		start: function(param, retry, cache, requestType){
            if($.browser.mobile){
				$.Log("mobile don't support lcrm");
				return;
			}
			var self = this,
				currentpage = $.im.connect.currentPage.get()
			;

			this.params = $.extend(CON_DEFAULT_OPTIONS, param);

			if( this.params.action === 1 && !retry && !cache ){
				this.statistic(11);
			}
			
			if( (this.params.trigger == 1 && !$.browser.mobile) || !currentpage ){
				$.Log('$.lcrm.start(): save cache');
				//非移动设备的离开前方案或非当前页，方案存入缓存，待激活
				//离开前方案等待鼠标移出可视区时执行
				//非当前页收到方案，等待当前页激活
				// @date 2014.09.16
				// @desc 离开前触发方案直接存入缓存，鼠标移出浏览器可视区后再从缓存中获取数据并判断
				$.flashData.add($.CON_LCRM_FIX + this.params.token, this.params);
			}else{
				$.Log('$.lcrm.start(): execute');
				this.params.trigger = 0;
				//--立即展示或移动设备离开前立即时执行
				if( this.hasComplete.contains( this.params.token ) )
					return;
				this.hasComplete.add(this.params.token, $.extend(
					this.params, {
						example: new $.liveCRM(this.params)
					}
				));
			}
		},
		statistic: function(action){
			var url = $.server.crmcenter + 'rtmarket.php?',
				params = $.extend({}, this.params);
			
			delete params.example;
			url += $.toURI({
				m:		'CouponLog',
				a:		'log',
				siteid:	$.global.siteid,
				uid:	$.user.id,
				pcid:	$.global.pcid,
				token:	this.params.token,
				action: action || 11,
				content:$.JSON.toJSONString(params)
			});
			//statictis
			$.require(url + '#rnd');
		}
	};
	$.Dialog  = $.Class.create();
	$.liveCRM = $.Class.create();
	
	$.Dialog.prototype = {
		key: null,
		element: null,
		options: null,
		offset: null,
		initialize: function(options){
			this.offset = $.extend($(window).offset(), {
				width: $(window).width(),
				height:$(window).height()
			});
			this.options = $.extend({
				key:	$.randomChar(),
				width:	720,	//弹窗宽
				height:	364,	//弹窗高
				location:'center',	//定位,center;top-banner;bottom-banner;right-bottom;
				zIndex: 1000110,	//弹窗zIndex
				mask:	1,		//是否显示遮罩
				effect:	'fadein',//动画效果,fadein:淡入淡出; flyin:飞入;none:无效果
				title: null,	//弹窗标题，null时，无标题栏
				buttons: 1,		//弹窗按钮,0:无按钮;1:关闭按钮;2:确认按钮;3:全部按钮
				fnClick:emptyFunc,//点击弹窗
				fnClose:emptyFunc,//点击关闭按钮
				fnOk:	emptyFunc,//点击确认按钮
				fnShow:	emptyFunc,//打开后调用
				fnHide:	emptyFunc,//关闭后调用
				bind:	emptyFunc,//事件绑定
				html:	''		//html
			}, options);

			this.create();
		},
		create: function(){
			var self = this,
				backgroundCss, elementCss,
				titleCss, bodyCss,
				buttonClose, buttonOk,
				html
			;

			$.Log('$.Dialog.create()');

			if( $.browser.msie6 ){
				this.position = 'absolute';
			}else{
				this.position = 'fixed';
			}

			switch(this.options.location){
				case 'top-banner':
					break;
				case 'bottom-banner':
					break;
				case 'right-bottom':
					break;
				default:
					if( this.position === "fixed" ){
						this.options.left = Math.max(0, (this.offset.width - this.options.width)/2 );
						this.options.top  = Math.max(0, (this.offset.height - this.options.height)/2 );
					}else{
						this.options.left = Math.max(0, this.offset.left + (this.offset.width - this.options.width)/2 );
						this.options.top  = Math.max(0, this.offset.top + (this.offset.height - this.options.height)/2 );
					}
					break;
			}

			elementCss = [
				$.STYLE_BODY, CON_STYLE_SHADOW,
				'width:', this.options.width, 'px;height:', this.options.height, 'px;position:', this.position, ';left:', this.options.left, 'px;top:', this.options.top, 'px;z-index:', (+this.options.zIndex + 1), ';background:#FFFFFF;display:block;visibility:hidden;'
			].join('');

			backgroundCss = [
				$.STYLE_BODY,CON_STYLE_OPACITY,
				'width:100%;height:', this.offset.height, 'px;','position:', this.position, ';','left:0px;top:0px;z-index:', this.options.zIndex, ';background:#000000;display:block;visibility:hidden;'
			].join('');
			
			titleCss = [
				$.STYLE_BODY,
				'background:#900;color:#fff;font:normal 14px/30px Arial,SimSun;'].join('');
			
			bodyCss = [
				$.STYLE_BODY,
				'background:#fff;color:#333;width:100%;'].join('');

			buttonClose = [
				$.STYLE_NBODY,
				'cursor:pointer;width:20px;height:20px;position:absolute;left:', (this.options.width - 25), 'px;top:4px;background:url(' + CON_IMAGE_LCRM + ') no-repeat 0 0;',this.options.closeCss].join('');
			buttonOk = [
				$.STYLE_NBODY,
				'cursor:pointer;width:120px;height:30px;margin:5px auto;',
				this.options.okCss].join('');

			html = [
				(this.options.title === null ? '' : '<div class="dialog-title" style="' + titleCss + '"><span style="' + titleCss + 'margin:0 0 0 10px;">' + this.options.title + '</span></div>'),
				'<div class="dialog-body" style="' + $.STYLE_BODY + 'text-align:center;">' + this.options.html + '</div>',
				'<div class="dialog-button-close" style="' + buttonClose + '"></div>',
				'<div class="dialog-button-ok" style="' + buttonOk + '"></div>'
				].join('');

			if( this.options.mask ){
				this.background	= $({className:           'dialog-background-' + this.options.key, style: backgroundCss}).appendTo(true).fixed();
				this.iframe		= $({tag:'IFRAME', className: 'dialog-iframe-' + this.options.key, style: backgroundCss}).appendTo(true).fixed();
			}
			
			this.element = $({className: 'dialog-container-' + this.options.key, style: elementCss}).html(html).appendTo(true).fixed()
			.bind('click', function(){
				self.options.fnClick.call(self);
			});
			
			if( /^[1|3]$/i.test(this.options.buttons) ){
				$('.dialog-button-close', this.element).bind('click', function(e){
					$.Event.fixEvent(e).stopPropagation();
					self.options.fnClose.call(self);
					self.hide();
				});
			}else{
				$('.dialog-button-close', this.element).display();
			}
			
			if( /^[2|3]$/i.test(this.options.buttons) ){
				$('.dialog-button-ok', this.element).bind('click', function(e){
					$.Event.fixEvent(e).stopPropagation();
					self.options.fnOk.call(self);
					self.hide();
				});
			}else{
				$('.dialog-button-ok', this.element).display();
			}
			
			$.Log('key: ' + this.options.key + ', top:' + this.options.top);
			this.options.bind.call(this, this.element, this.options);

			return this.element;
		},
		show: function(){
			var self = this;
			//--打开一个浮层框
			$.Log('$.Dialog.show()');
			
			if(this.background){
				this.background.animate({
					visibility: 'visible',
					opacity:{
						form: 0,
						to:   0.6
					}
				});
			}
			
			this._funcSize = function(event){
				self.resizeCenter(event);
		    };

			switch( this.options.effect ){
				case 'fadein':
					this.element.animate({
						visibility: 'visible',
						opacity:{
							form: 0,
							to:   1
						}
					}, 500, function(){
						self.options.fnShow.call(self);
						$.Event.addEvent(window, 'resize', self._funcSize);
					});
					break;
				case 'flyin':
					this.element.animate({
						visibility: 'visible',
						to: {
							from: this.offset.top + this.offset.height + 'px',
							to:   this.options.top + 'px'
						}
					}, 500, function(){
						self.options.fnShow.call(self);
						$.Event.addEvent(window, 'resize', self._funcSize);
					});
					break;
				default:
					this.element.css({
						visibility: 'visible'
					});
					this.options.fnShow.call(this);
					$.Event.addEvent(window, 'resize', self._funcSize);
					break;
			}
			return this.element;
		},
		hide: function(){
			var self = this;

			//--关闭一个浮层框
			$.Log('$.Dialog.hide()');

			if( this.background ){
				this.background.hide(function(){
					self.background.remove();
					self.iframe.remove();
				});
			}

			switch( this.options.effect ){
				case 'fadein':
					this.element.animate({
						opacity:{
							to: 0
						}
					}, 500, function(){
						self.element.remove();
						self.options.fnHide.call(self);
					});
					break;
				case 'flyin':
					this.element.anim({
						top: {
							to: this.offset.viewY + this.offset.viewH + 'px'
						}
					}, 500, function(){
						self.element.remove();
						self.options.fnHide.call(self);
					});
					break;
				default:
					this.element.remove();
					this.options.fnHide.call(this);
					break;
			}
			$.Event.removeEvent(window, 'resize', this._funcSize);
		},
		/**
		 * 浏览器大小变化时，重置定位
		 * @return {[type]} [description]
		 */
		resizeCenter: function(event){
			var offset = $(window).offset(), x, y;
			$.Log('$.Dialog.resizeCenter()');

			if( this.position === 'fixed' ){
				x = 0;
				y = 0;
			}else{
				x = offset.left;
				y = offset.top;
			}
			if( this.options.mask ){
				this.background.css({
					left: x + 'px',
					top:  y + 'px',
					width: '100%',
					height:$(window).height() + 'px'
				});
				this.iframe.css({
					left: x + 'px',
					top:  y + 'px',
					width: '100%',
					height:$(window).height() + 'px'
				});
			}
			this.element.css({
				right: 'auto',
				bottom: 'auto',
				left: (x + ($(window).width()  - this.options.width )/2) + 'px',
				top:  (y + ($(window).height() - this.options.height)/2) + 'px'
			});
		}
	};
	
	/**
	 * liveCRM Object
	 * @type {Object}
	 */
	$.liveCRM.prototype = {//liveCRM
		id: '',
		element: null,
		background: null,
		iframe: null,
		offset: null,
		config: null,
		options: null,
		width: 0,
		height: 0,
		location: {}, //liveCRM
		key: '',
		defRequest: null,
		timeID: null,
		diagDownCoupon: null,
		livecrm: null,
		baseURL: '',
		initialize: function(param){
			var example, position;

			this.key    = $.randomChar();
			this.id     = 'lcrm-' + this.key;
			this.options = $.extend(this.options, CON_DEFAULT_OPTIONS, param);
			this.baseURL= $.server.crmcenter + 'rtmarket.php?';
			this.offset = $.extend($(window).offset(), {
				width: $(window).width(),
				height:$(window).height()
			});
			
			var temp = $.extend({}, this.options);
			if( temp.example ) delete temp.example;
			$.Log('$.liveCRM.initialize()', 1);
			
			if( this.options.token === '' ){
				$.Log('Active liveCRM is not configured. token:'+this.options.token, 3);
				return;
			}
			
			this.defRequest = {
				m:		'Index',
				a:		'Coupon',
				s:		$.global.siteid,
				uid:	$.user.id,
				t:		'', //30:短信、31邮件、32另存
				pid:	$.global.pcid,
				token:	this.options.token
			};

			//--参数修正--
			this.options.width  = Math.min($(window).width(), this.options.sizex);
			this.options.height = Math.min($(window).height(), this.options.sizey);
			
			//--可视区宽高
			this.width  = $(window).width();
			this.height = $(window).height();
			position = $.browser.msie6||($.browser.msie && $.browser.Quirks) ? 'absolute' : 'fixed';
			switch( this.options.location ){
				case "top-banner":
					this.location = {position: 'static', x: 'left', y: 'top', left: 0, top: 0};
					this.options.effect = 'heighten'; //top banner set effect heighten
					break;
				case "bottom-banner":
					this.location = {position: position, x: 'left', y: 'bottom', left: 0, bottom: 0};
					break;
				case "left-center":
					this.location = {position: position, x: 'left', y: 'bottom', left: 0, bottom: (this.height - this.options.height)/2};
					break;
				case "right-center":
					this.location = {position: position, x: 'left', y: 'bottom', left: Math.max(0, this.offset.width - this.options.width), bottom: (this.height - this.options.height)/2};
					break;
				case "left-bottom":
					this.location = {position: position, x: 'left', y: 'bottom', left: 0, bottom: 0};
					break;
				case "center-bottom":
					this.location = {position: position, x: 'left', y: 'bottom', left: (this.width  - this.options.width) /2, bottom: 0};
					break;
				case "right-bottom":
					this.location = {position: position, x: 'left', y: 'bottom', left: Math.max(0, this.offset.width - this.options.width), bottom: 0};
					break;
				default:
					this.location = {
						position: position,
						x: 'left',
						y: 'bottom',
						left:    (this.width  - this.options.width) /2,
						bottom:  (this.height - this.options.height)/2
					};
					break;
			}

			if( !$.isDefined(this.location.right) ){
				this.location.right		= this.width  - this.location.left - this.options.width;
			}
			if( !$.isDefined(this.location.bottom) ){
				this.location.bottom	= this.height - this.location.top - this.options.height;
			}
			if( !$.isDefined(this.location.top) ){
				this.location.top		= this.height - this.location.bottom - this.options.height - 2;
			}
			if( position === 'absolute' ){
				//IE下 右定位时
				if( this.options.location.indexOf('right')>-1 ){
					this.location.left -= 2;
				}
				this.location.y = 'top';
			}
			
			this.create();
			
			//--按钮状态初始化
			this.inputs = [];
		},
		statistic: function(atype){
			var self = this;
			
			$.Log('$.liveCRM.statistic(atype:' + atype + ')');
			
			$.require(this.baseURL + $.toURI($.extend({},
				this.defRequest, {
					t:	atype //类型：10：触发、20展示、30短信下载、31邮件下载、32本地另存、33咨询、34跳转、40激活
				}
			)) + '#rnd', function(element){
				if( element.error ){
					$.Log('Statistics call fails', 3);
				}
			});
		},
		create: function(){
			var self = this,
				html, promotions,
				elementCss,
				backgroundCss
			;
			$.Log('$.liveCRM.create()');

			elementCss = [
				$.STYLE_BODY,
				'margin:0 auto;cursor:pointer;width:' + this.options.width + 'px;',
				'height:' + this.options.height + 'px;'
			].join('');
			
			html	= '<div class="lcrm-body" token="' + this.options.token + '" style="' + $.STYLE_BODY + 'overflow:hidden;">';

			if( this.options.tempmode !== 0 ){
				// 非图片模版类型暂不支持
				$.Log('tempmode:' + this.options.tempmode, 2);
				return;
			}

			html += '<img src="' + this.options.tempcontent + '" width="' + this.options.width + '" height="' + this.options.height + '" border="0" />';

			html += '</div><div class="lcrm-close" style="' + $.STYLE_BODY + ';background:url(' + CON_IMAGE_LCRM + ') no-repeat 0 -330px; width:28px;height:28px;position:absolute;right:5px;top:5px;"></div>';
			//--创建背景
			if( this.options.showmode === 0 ){//--通栏[顶部通栏|底部通栏]
				backgroundCss = [
					$.STYLE_BODY,
					'width:100%;height:', (this.options.location=='top-banner' ? 1 : this.options.height) ,'px;z-Index:1000100;visibility:hidden;text-align:center;position:' + this.location.position + ';left:none;top:none;overflow:hidden;',
					(/^#([0-9A-F]){6}/gi.test(this.options.bgcontent) ? 'background:' + this.options.bgcontent + ';' : /^https?:\/\/(.*?)/gi.test(this.options.bgcontent) ? 'background:url(' + this.options.bgcontent + ') repeat scroll 0 0;' : '')
				].join('');

				this.background = $({className: this.id + '-background', style: backgroundCss}).appendTo(true);
				this.element    = $({className: this.id + '-container', id: this.id, style: elementCss}).appendTo(this.background).html(html);
			}
			else if( this.options.location == "right-bottom" ){// --右下角提示
				elementCss += [
					'position:' + this.location.position + ';visibility:visible;',
					this.location.x + ':' + this.location[ this.location.x ] + 'px;',
					this.location.y + ':' + this.location[ this.location.y ] + 'px;'
				].join('');
				
				this.element	= $({className: this.id + '-container-'	+ this.key, id: this.id, style: elementCss + 'z-Index:1000101;'}).appendTo(true).html(html);
			}
			else{ //--遮罩背景层
				backgroundCss = [
					$.STYLE_BODY,CON_STYLE_OPACITY,
					'width:100%;height:' + this.offset.height + 'px;visibility:visible;position:', this.location.position, ';left:0;top:', (this.location.position=='fixed' ? 0 : this.offset.top), 'px;z-index:1000100;display:block;',
					(/^#([0-9A-F]){6}/gi.test(this.options.bgcontent) ? 'background:' + this.options.bgcontent + ';' : /^https?:\/\/(.*?)/gi.test(this.options.bgcontent) ? 'background:url(' + this.options.bgcontent + ') repeat scroll 0 0;' : '')
				].join('');
				
				elementCss += [
					'position:' + this.location.position + ';visibility:visible;',
					this.location.x + ':' + this.location[ this.location.x ] + 'px;',
					this.location.y + ':' + this.location[ this.location.y ] + 'px;'
				].join('');

				this.background = $({className: this.id + '-background', style: backgroundCss}).appendTo(true);
				this.iframe		= $({className: this.id + '-iframe', style: backgroundCss, tag:'IFRAME'}).appendTo(true);
				this.element	= $({className: this.id + '-container', id: this.id, style: elementCss + 'z-Index:1000101;'}).appendTo(true).html(html);
			}

			if(this.background){
				this.background.bind('contextmenu', function(){return false;}).bind('selectstart', function(){return false;});
			}
			this.element.bind('click', function(e){
				//--执行处理
				self.actionEvent(e);
			});
			this.element.find('.lcrm-close').bind('click', function(e){
				$.Event.fixEvent(e).stopPropagation();
				
				self.close();
			});
			
			this.show(function(){
				if( 'top-banner' == self.options.location || ('bottom-banner' == self.options.location && 'fixed' == this.location.position) ){
					//-顶部\底部(fixed)通栏不定位
					return;
				}
				if( self.options.showmode === 1 && "right-bottom" != self.options.location ){
					//窗口模式需要定位
					self.element.fixed();
				}
				if( self.background ){
					self.background.fixed();
				}

				//resize事件时重置
				$.Event.addEvent(window, 'resize', function(event){
					self.resizeCenter(event);
				});
			});

			return true;
		},
		/**
		 * 浏览器大小变化时，重置定位
		 * @param {Event} event
		 * @return {void}
		 */
		resizeCenter: function(event){
			var offset = $(window).offset(), x, y, left, top,
				width  = $(window).width(),
				height = $(window).height()
			;
			
			$.Log('nTalk.liveCRM.resizeCenter()');
			if( this.location.position == 'fixed' ){
				x = 0;
				y = 0;
			}else{
				x = offset.left;
				y = offset.top;
			}
			if( this.background && this.background.length ){
				this.background.css({
					left: x + 'px',
					top:  y + 'px',
					width: '100%',
					height:height + 'px'
				});
			}
			if( this.iframe && this.iframe.length ){
				this.iframe.css({
					left: x + 'px',
					top:  y + 'px',
					width: '100%',
					height:height + 'px'
				});
			}
			switch(this.options.location){
				case 'left-center':
					this.location[ this.location.x ] = x;
					this.location[ this.location.y ] = (y + (height - this.options.height)/2);
					break;
				case 'right-center':
					this.location[ this.location.x ] = (x + (width  - this.options.width ));
					this.location[ this.location.y ] = (y + (height - this.options.height)/2);
					break;
				case 'left-bottom':
					this.location[ this.location.x ] = x;
					this.location[ this.location.y ] = y;
					break;
				case 'center-bottom':
					this.location[ this.location.x ] = (x + (width  - this.options.width )/2);
					this.location[ this.location.y ] = y;
					break;
				case 'right-bottom':
					this.location[ this.location.x ] = (x + (width  - this.options.width ));
					this.location[ this.location.y ] = y;
					break;
				default://'center-center'
					this.location[ this.location.x ] = (x + (width  - this.options.width )/2);
					this.location[ this.location.y ] = (y + (height - this.options.height)/2);
					break;
			}
			
			var setOpt = {left: 'auto',top:'auto',right:'auto',bottom:'auto'};
			setOpt[this.location.x] = Math.max(0, this.location[ this.location.x ]) + 'px';
			setOpt[this.location.y] = Math.max(0, this.location[ this.location.y ]) + 'px';
			this.element.css(setOpt);
		},
		show: function(callback){
			var self = this, element, args = {visibility: 'visible'};

			$.Log('$.liveCRM.show()');

			if( this.options.showmode === 0 ){
				element = this.background;
			}else{
				element = this.element;
				//--窗口模式背景展示 
				if( this.background ){
					this.background.css({
						opacity: 0.6
					});
				}
			}
			if ( !element ) return;

			switch(this.options.effect){
				case 'flyin':
					args[this.location.y] = {
						from: (this.location.y=='top' ? this.offset.top + this.offset.height : 0 - this.options.height) + "px",
						to:   (this.location.y=='top' ? this.offset.top + this.location.top  : this.location[this.location.y]) + "px"
					};
					element.animate(args, 500, function(){
						callback.call(self);
					});
					break;
				case 'heighten':
					$(window).scrollTop(0);
					args.height = {
						from: "1px",
						to:   this.options.height + "px"
					};
					element.animate(args, 500, function(){
						callback.call(self);
					});
					break;
				default:
					args[this.location.y] = this.location[this.location.y] + 'px';
					element.css(args);
					callback.call(this);
					break;
			}
			//--调用统计
			this.statistic(20);

			if( typeof(ntcall_onShowInvitation) !== "undefined" ){
				ntcall_onShowInvitation(0, this.param.token);
			}
			//浏览器标题栏闪烁
			$.promptwindow.startPrompt('', CON_LANG.title, true);
			
			return;
		},
		close: function(callback){
			var self = this, element,args = {};

			$.Log('$.liveCRM.close()');

			if( this.options.showmode === 0 ){
				element = this.background;
			}else{
				element = this.element;
				//--窗口模式背景关闭
				if( this.background ){
					this.background.animate({
						opacity: this.options.effect ? {
							from: 0.6,
							to:   0
						} : 0
					}, 500, function(){
						self.background.remove();
						self.iframe.remove();
					});
				}
			}
			if(!element) return;
			
			switch(this.options.effect){
				case 'flyin':
					this.offset = $.extend(this.offset, $(window).offset());
					args[this.location.y] = {
						from: (this.location.y=='top' ? this.offset.top + this.location.top  : 0) + "px",
						to:   (this.location.y=='top' ? this.offset.top + this.offset.height : 0 - this.options.height) + "px"
					};
					element.animate(args, 600, function(){
						$(this).remove();
						if(callback)callback.call(self);
					});
					break;
				case 'heighten':
					element.animate({
						height: {to:"1px"}
					}, 500, function(el){
						$(this).remove();
						if(callback)callback.call(self);
					});
					break;
				default:
					element.remove();
					if(callback)callback.call(self);
			}
			//prompt.stopPrompt();
		},
		actionEvent: function(){
			var self = this,valid,
				buttonCss,validOpacity,
				options = {
					mask:		1,
					buttons:	1,
					title:		CON_LANG.title,
					fnClose:	emptyFunc,
					fnOk:		emptyFunc,
					html:		'',
					closeCss:	'background:url(' + CON_IMAGE_LCRM + ') no-repeat 0px -298px;',
					bind:		function(element){
						$('.market-fright-buttons .button', element).hover(
						function(event){
							$(this).css({
								'background-color': '#FFF2F2',
								'border-color': '#A11D1B'
							});
						}, function(event){
							$(this).css({
								'background-color': '#FFFFFF',
								'border-color': '#959595'
							});
						}).bind('click', function(event){
							//停止闪烁
							$.promptwindow.stopPrompt();
							
							self.showDown(this.className);
						});
					}
				}
			;
			
			valid = this.options.ltdtime > 0 ? true : false;
			//--按钮样式
			buttonCss = [$.STYLE_BODY, CON_STYLE_SHADOW,'margin:10px 38px 15px 15px;padding:0;width:320px;height:74px;border:1px solid #959595;border-radius:5px;cursor:pointer;'].join('');
			validOpacity = !valid ? 'background:transparent;' : ($.browser.oldmsie ? 'background:#000;filter:alpha(opacity=80)' : 'background:rgba(0,0,0,0.6);');
			//优惠券
			options.html = [
				'<div class="market-fleft-content" style="' + $.STYLE_BODY + 'width:345px;height:auto;float:left;background:none;">',
					'<div class="market-fleft-icon" style="' + $.STYLE_BODY + 'width:250px;height:130px;margin:25px 40px 25px 55px;background:#B20000 url(' + $.sourceURI + '/images/coupons' + this.options.salemode + '.jpg) -2px 0 no-repeat;">',
						'<div class="markt-site" style="' + $.STYLE_BODY + 'position:relative;height:30px;overflow:hidden;background:url() no-repeat;color:#000;border:0px dotted #fff;">',
							//--网站名称
						'</div>',
						'<div class="markt-price" style="' + $.STYLE_BODY + 'margin:0 8px;position:relative;height:54px;overflow:hidden;background:none;text-align:center;border-left:0px dotted #fff;border-right:0px dotted #fff;">',
							//--优惠(满减)券金额
							'<span style="' + $.STYLE_BODY + 'background:none;color:#fff;font:bold 2em/140% Arial,SimSun;">' + CON_LANG.symbol + '</span>',
							'<span style="' + $.STYLE_BODY + 'background:none;color:#fff;font:bold 4em/140% Arial,SimSun;">',
								(this.options.salemode == 1 ? this.options.priceend : this.options.price),
							'</span>',
							'<span style="' + $.STYLE_BODY + 'background:none;color:#fff;font:bold 2em/140% Arial,SimSun;">' + CON_LANG.unit + '</span>',
							'<span style="' + $.STYLE_BODY + 'background:none;color:#fff;font:bold 2em/140% Arial,SimSun;">' + (this.options.salemode === 1 ? CON_LANG.mode : CON_LANG.type) + '</span>',
						'</div>',
						//--满减券限制
						'<div class="markt-fullcut" style="' + $.STYLE_BODY + 'font-size:14px;font-weight:bold;margin:0 8px;position:relative;background:none;height:20px;text-align:right;color:#fff;padding:0 20px 0 0;border-left:0px dotted #fff;border-right:0px dotted #fff;">',
							(this.options.salemode === 1 ? $.utils.handleLinks(CON_LANG.fullcut, {begin: this.options.pricebegin, end: this.options.priceend}) : ''),
						'</div>',
						'<div class="markt-valid-date" style="margin:0;padding:0;border:none;font:normal 12px/160% Microsoft YaHei,Arial,SimSun;position:relative;height:26px;line-height:26px;padding:0 5px 0 0;color:#fff;text-align:right;border:0px dotted #fff;border-top:none;'+validOpacity+'">',
							//--有效期
							(valid ? $.utils.handleLinks(CON_LANG.valid, {valid: this.formatValid( this.options.ltdtime )}) : ''),
						'</div>',
					'</div>',
					'<div class="market-fleft-title" style="' + $.STYLE_BODY + 'padding:0 0 0 70px;font:bold 16px/160% Arial,SimSun;color:#666;background:url(' + CON_IMAGE_LCRM + ') no-repeat 52px -44px;">' + CON_LANG.desctitle + '</div>',
					'<div class="market-fleft-desc"  style="' + $.STYLE_BODY + 'margin:0 0 0 55px;color:#666;height:116px;overflow:hidden;word-break:break-all;word-wrap:break-word;">' + this.options.desc + '</div>',
				'</div>',
				'<div class="market-fright-buttons" style="' + $.STYLE_BODY + 'padding:40px 0 10px 0;width:375px;height:auto;float:right;background:none;">',
					//--下载优惠券按钮
					'<div class="button market-buttons-sms" style="' + buttonCss + 'background:#fff url(' + CON_IMAGE_LCRM + ') no-repeat  18px -128px;">',
						'<div style="' + $.STYLE_BODY + 'margin:10px 0 0 74px;background:none;font:bold 16px/160% Arial,SimSun;">' + CON_LANG.sms.title + '</div>',
						'<div style="' + $.STYLE_BODY + 'margin:5px 0 0 74px;background:none;color:#999;height:20px;">' + CON_LANG.sms.desc + '</div>',
					'</div>',
					'<div class="button market-buttons-mail" style="' + buttonCss + 'background:#fff url(' + CON_IMAGE_LCRM + ') no-repeat  18px -68px;">',
						'<div style="' + $.STYLE_BODY + 'margin:10px 0 0 74px;background:none;font:bold 16px/160% Arial,SimSun;">' + CON_LANG.mail.title + '</div>',
						'<div style="' + $.STYLE_BODY + 'margin:5px 0 0 74px;background:none;color:#999;height:20px;">' + CON_LANG.mail.desc + '</div>',
					'</div>',
					'<div class="button market-buttons-save" style="' + buttonCss + 'background:#fff url(' + CON_IMAGE_LCRM + ') no-repeat  18px -210px;">',
						'<div style="' + $.STYLE_BODY + 'margin:10px 0 0 74px;background:none;font:bold 16px/160% Arial,SimSun;">' + CON_LANG.save.title + '</div>',
						'<div style="' + $.STYLE_BODY + 'margin:5px 0 0 74px;background:none;color:#999;height:20px;">' + CON_LANG.save.desc + '</div>',
					'</div>',
				'</div>'
			].join('');

			//--点击后立即关闭
			this.close.call(this, function(){
				switch( self.options.saletype ){
					//0优惠券1促销活动2页面客服
					case 0:
						this.statistic(36);
						try{
							self.dialog = new $.Dialog(options);
							self.dialog.show();
						}catch(e){
							$.Log(e, 3);
						}
						break;
					case 1:
						self.statistic(34);
						if( self.options.jumpurl ){
							window.open(self.options.jumpurl);
						}else{
							$.Log('jumpurl is null', 3);
						}
						break;
					default:
						$.global.chattype = 9;
						
						self.statistic(33);
						//--打开聊窗
						$.im_openInPageChat(self.options.kfconfigcode, '', '', {single: -1,manual: 1});
						break;
				}
			});
		},
		disabled: function(key, selector, status){
			var btnConfig;
			
			if( !this.inputs[key] ){
				this.inputs[key] = [];
			}
			
			if( !this.inputs[key]['dialog-body-submit'] ){
				this.inputs[key]['dialog-body-submit'] = {
					status:	false,
					_default: {
						'cursor':				'pointer',
						'background-color':		'#B20000',
						'background-position':	'5px 40px',
						'border-bottom-color':	'#3C0000',
						'padding-left':			'20px'
					},
					disable: {
						'cursor':				'auto',
						'background-color':		'#ADADAD',
						'background-position':	'5px 10px',
						'border-bottom-color':	'#909090',
						'padding-left':			'30px'
					}
				};
			}
			if( !this.inputs[key]['dialog-body-input'] ){
				this.inputs[key]['dialog-body-input'] = {
					status: false,
					_default: {
						color:				'#000',
						'background-color':	'#fff'
					},
					disable: {
						color:				'#999',
						'background-color':	'#fafafa'
					}
				};
			}
			
			btnConfig = this.inputs[key][selector];
			
			btnConfig.status = status;
			
			$('.' + selector, this.diagDownCoupon.element)
				.css(btnConfig.status ? btnConfig.disable : btnConfig._default)
				.attr('disabled', btnConfig.status ? 'disabled' : '');
			
			return btnConfig.status;
		},
		showDown: function(type){
			var self = this, html, tiptext, label,title,desc,btntext,
				dialogType = type.indexOf('market-buttons-sms') > -1 ? 'SMS' : type.indexOf('market-buttons-mail') > -1 ? 'MAIL' : '',
				descriptionCss, inputCss, linkCss, buttonCss,
				options = {
					mask:		0,
					buttons:	1,
					zIndex:		1000120,
					fnClose:	emptyFunc,
					fnOk:		emptyFunc,
					html:		''
				}
			;
			descriptionCss = [$.STYLE_BODY, CON_STYLE_SHADOW,'width:625px;height:80px;background:#FFF2F2;margin:45px auto 0;padding:10px;'].join('');
			
			inputCss = [$.STYLE_BODY, 'margin:20px 0 0;'].join('');

			linkCss = [$.STYLE_BODY].join('');
			
			if( !dialogType ){
				//--下载优惠券文本
				$.Log('download to pc');
				this.downCoupon({t: 32});
				return;
			}else{
				title = dialogType == 'SMS' ? CON_LANG.smstitle : CON_LANG.mailtitle;
                label = dialogType == 'SMS' ? CON_LANG.smslabel : CON_LANG.maillabel;
				desc  = dialogType == 'SMS' ? CON_LANG.smsdesc : CON_LANG.maildesc;
				btntext = dialogType == 'SMS' ? CON_LANG.smsbtntext : CON_LANG.mailbtntext;
                
				//短信模板
				tiptext = dialogType == 'SMS'&&this.options.sms ? ['<div class="dialog-body-desc" style="' + descriptionCss + '">',
					'<div style="' + $.STYLE_BODY + 'background:none;">',
						'<span style="' + $.STYLE_BODY + 'background:none;font:1.6em/160% Arial,SimSun;">' + CON_LANG.tempttitle + '</span>',
						'<span style="' + $.STYLE_BODY + 'background:none;font:1em/160% Arial,SimSun;">(' + CON_LANG.temptdesc + ')</span>',
					'</div>',
					'<div style="' + $.STYLE_BODY + 'display:block;width:100%;background:#FBDDDD;font:1.2em/160% Arial,SimSun;word-break:break-all;word-wrap:break-word;">',
						//--短信模板
						//'亲，恭喜您获得优惠券！优惠券卡号######，密码是###，订单满###可用，不限品类仅限一小时，过期无效！【酷派商城】',
						this.options.sms,
					'</div>',
				'</div>'].join('') : '';
			}
			//--邮件
			if( dialogType !== 'SMS' || !this.options.sms ){
				inputCss += 'margin:100px 0 0;';
			}
			
			//--短信或邮箱收取优惠券号界面
			html = [
				tiptext,
				'<div class="dialog-body-inputarea" style="' + inputCss + '">',
					'<div style="' + $.STYLE_BODY + 'float:left;width:260px;height:32px;text-align:right;line-height:30px;display:inline-block;">' + label + '</div>',
					'<input style="' + $.STYLE_BODY + 'float:left;width:235px;height:30px;border:1px solid #ccc;font-size:15px"',
					(dialogType == 'SMS' ? ' size="11" onkeyup="this.value=this.value.replace(/\\D/g,\'\')" onafterpaste="this.value=this.value.replace(/\\D/g,\'\')"' : ''),
					' type="text" name="dialog-body-input" class="dialog-body-input" value="" />',
					'<div class="dialog-body-error" style="' + $.STYLE_BODY + 'float:left;background:none;margin:0 0 0 5px;width:auto;display:inline-block;color:#f00;line-height:30px;"></div>',
					'<div style="',$.STYLE_BODY,'margin:0;padding:0;border:0;font-size:0;line-height:0;clear:both;display:block;height:0px;"></div>',
				'</div>',
				'<div class="dialog-body-console" style="' + $.STYLE_BODY + 'margin:20px 0 0 0;">',
					'<table><tr>',
					'<td align="right" width="50%"><div class="dialog-body-submit" style="', $.STYLE_BODY, 'float:right;text-align:center;cursor:pointer;background:#B20000 url(', CON_IMAGE_LCRM, ') no-repeat 5px 10px;color:#fff;padding:10px 20px;margin:0 0 0 0px;display:block;width:80px;*width:120px;">', btntext, '</div></td>',
					'<td align="left" width="50%"><div class="dialog-body-message" style="', $.STYLE_BODY, 'background:none;color:#000;margin:0 50px 0 5px;width:290px;visibility:hidden;display:inline', ($.browser.msie6 ? '' : '-block'), ';">',
					$.utils.handleLinks(desc, {
						url: '#',
						time: '<span class="dialog-timeinterval" style="' + $.STYLE_BODY + 'color:#f00;display:inline;">0秒</span>'
					}),
					'</div></td></tr></table>',
				'</div>',
				'<div class="dialog-body-link" style="' + linkCss + 'background:none;margin:20px 0 0 0;visibility:hidden;">',
					'<div style="' + $.STYLE_BODY + 'background:none;margin:0 0 0 260px;">',
					$.utils.handleLinks(CON_LANG.closelink, {url: SCRIPT_URL}),
					'</div>',
				'</div>'
			].join('');
			
			options.title = title;
			options.html  = html;
			options.closeCss = 'background:url(' + CON_IMAGE_LCRM + ') no-repeat 0px -298px;';
			options.bind  = function(element, options){
				//--提交按钮
				$('.dialog-body-submit', element).hover(function(e){
					if( self.inputs[options.key]['dialog-body-submit'].status ){
						return;
					}
					$(this).css({'background-color': '#E20000'});
				}, function(e){
					if( self.inputs[options.key]['dialog-body-submit'].status ){
						return;
					}
					$(this).css({'background-color': '#B20000'});
				}).bind('click', function(e){
					//--发送或重新发送时初始化消息区
					$('div.dialog-body-message', element).css({
						color: '#000000',
						visibility:	'hidden'
					}).html( $.utils.handleLinks(desc, {
						url: SCRIPT_URL, 
						time: '<span class="dialog-timeinterval" style="' + $.STYLE_BODY + 'color:#f00;display:inline;">0秒</span>'
					}));
					
					if( self.inputs[options.key]['dialog-body-submit'].status ){
						return;
					}
					self.sendCoupon(dialogType);
				});
				//--回到网站
				$('div.dialog-body-link a', element).bind('click', function(e, link){
					if(self.dialog) self.dialog.hide();
					if( self.diagDownCoupon ){
						self.diagDownCoupon.hide();
						self.diagDownCoupon = null;
					}
				});
		    };
			options.fnShow = function(){
				
			};
			options.fnHide = function(){
				clearInterval(self.timeID);
				self.timeID = null;
				self.diagDownCoupon = null;
			};
			this.timeinterval = 50;
			this.diagDownCoupon = new $.Dialog(options);
			this.diagDownCoupon.show();
			
			self.disabled(this.diagDownCoupon.options.key, 'dialog-body-submit', false);
			self.disabled(this.diagDownCoupon.options.key, 'dialog-body-input', false);
		},
		sendCoupon: function(type){
			var self = this,
				input = this.diagDownCoupon.element.find('input.dialog-body-input'),
				error = this.diagDownCoupon.element.find('.dialog-body-error'),
				phone = new RegExp("^1[3|4|5|8][0-9]\\d{8}$", "i"),
				email = new RegExp("^[a-zA-Z0-9\\._-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$", "i"),
				val = input.val();
			
			switch(type){
				case 'SMS':
					if( !val || !phone.test(val) ){
						error.html(CON_LANG.smserror);
						input.get(0).focus();
						return;
					}else{
						error.html('');
					}
					$.Log('download to your phone');
					this.downCoupon({t: 30, phone: val});
					break;
				case 'MAIL':
					if( !val || !email.test(val) ){
						error.html(CON_LANG.mailerror);
						input.get(0).focus();
						return;
					}else{
						error.html('');
					}
					//--修改邮箱提示文本中连接地址--
					var linkElement = $('div.dialog-body-message a').get(0);
					if( linkElement ){
						linkElement.target = '_blank';
						if( CON_MAIL_SERVER[val.split('@')[1]] ){
							linkElement.href = 'http://' + CON_MAIL_SERVER[val.split('@')[1]] || 'mail.' + val.split('@')[1];
						}else{
							linkElement.href = 'http://mail.' + val.split('@')[1];
						}
					}
					
					$.Log('download to your mailbox');
					this.downCoupon({t: 31, email: val});
					break;
				default:
					break;
			}
		},
		downCoupon: function(params, callback){
			var self = this,
				url  = this.baseURL + $.toURI($.extend({},
					this.defRequest, 
					params
				))
			;
			
			if( params.t === 32 ){
				window.open(url);
			}
			else{
				$.require(url + '#rnd', function(element){
					$.Log('type:' + params.t, 2);
					if( typeof ntkf_active_marketing_send_number != 'undefined' && $.isPlainObject(ntkf_active_marketing_send_number) ){
						$.Log(ntkf_active_marketing_send_number);
					}
					if( element.error || typeof ntkf_active_marketing_send_number == 'undefined' || !$.isPlainObject(ntkf_active_marketing_send_number) ){
						//请求服务器失败
						$('div.dialog-body-message').css({
							color:		'#f00',
							visibility:	'visible'
						}).html(CON_LANG.errormessage);
						
						$('.dialog-body-submit').html(CON_LANG.resend);
					}else if( ntkf_active_marketing_send_number.result == -1 ){
						//下载优惠券异常
						$('div.dialog-body-message').css({
							color:		'#f00',
							visibility:	'visible'
						}).html(ntkf_active_marketing_send_number.error);
						
						$('.dialog-body-submit').html(CON_LANG.resend);
					}else if( self.diagDownCoupon ){
						//下载成功，定时器启动
						$('.dialog-body-submit', self.diagDownCoupon.element).html(CON_LANG.sended);
						
						self.diagDownCoupon.element.find('div.dialog-body-message, div.dialog-body-link').css('visibility', 'visible');
						self.diagDownCoupon.element.find('span.dialog-timeinterval').html( $.utils.handleLinks(CON_LANG.time, {time: self.timeinterval}) );
						
						self.disabled(self.diagDownCoupon.options.key, 'dialog-body-submit', true);
						self.disabled(self.diagDownCoupon.options.key, 'dialog-body-input', true);
						if(callback) callback.call(self);
						
						//--定时器启动
						self.interval();
					}
				}, null, {remove: true});
			}
		},
		interval: function(){
			var self = this;
			
			this.stopInterval();
			
			this.timeID = setInterval(function(){
				if( !self.diagDownCoupon ){
					self.stopInterval();
				}
				$('span.dialog-timeinterval', self.diagDownCoupon ? self.diagDownCoupon.element : null).html( $.utils.handleLinks(CON_LANG.time, {time: (--self.timeinterval).toString()}) );
				if( self.timeinterval <= 0 ){
					self.timeinterval = 50;
					
					$('.dialog-body-submit', self.diagDownCoupon.element).html(CON_LANG.resend);
					self.disabled(self.diagDownCoupon.options.key, 'dialog-body-submit', false);
					self.disabled(self.diagDownCoupon.options.key, 'dialog-body-input', false);
					
					$('div.dialog-body-message, div.dialog-body-link', self.diagDownCoupon.element).css('visibility', 'hidden');
					clearInterval(self.timeID);
					self.timeID = null;
					return;
				}
			}, 1000);
		},
		stopInterval: function(){
			clearInterval(this.timeID);
			this.timeID = null;
		},
		formatValid: function(ltdtime){
			var rt = ltdtime;
			
			if( rt > 60*60*24 ){//-天
				return $.utils.handleLinks(CON_LANG.day, {time: parseInt( rt*10 / 60 / 60 / 24 ) / 10});
			}
			if( rt > 60*60 ){//-小时
				return $.utils.handleLinks(CON_LANG.hour, {time: parseInt( rt*10 / 60 / 60 ) / 10});
			}
			if( rt > 60 ){//-分钟
				return $.utils.handleLinks(CON_LANG.minute, {time: parseInt( rt*10 / 60 ) / 10});
			}
			else{
				return $.utils.handleLinks(CON_LANG.time, {time: rt || '0'});
			}
		}
	};
})(nTalk);