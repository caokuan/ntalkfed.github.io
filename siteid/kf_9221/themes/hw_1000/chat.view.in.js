/**
 * 加入md5解密模块
 * @蜜芽自定义ui专用
 */
nTalk.MD5 = function (string) {
 
	function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}
 
	function AddUnsigned(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	}
 
 	function F(x,y,z) { return (x & y) | ((~x) & z); }
 	function G(x,y,z) { return (x & z) | (y & (~z)); }
 	function H(x,y,z) { return (x ^ y ^ z); }
	function I(x,y,z) { return (y ^ (x | (~z))); }
 
	function FF(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function GG(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function HH(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function II(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1=lMessageLength + 8;
		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
		var lWordArray=Array(lNumberOfWords-1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	};
 
	function WordToHex(lValue) {
		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	};
 
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	};
 
	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;
 
	string = Utf8Encode(string);
 
	x = ConvertToWordArray(string);
 
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}
 
	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
	return temp.toLowerCase();
}
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
			
			this.messageElement = $({className: 'chat-view-message', style: $.STYLE_BODY + 'height:' + this.options.height + 'px;float:left;width:100%;'}).appendTo(this.contains).html( this._getViewHtml('message') );
			
			this.displayiFrame  = $({tag:'iframe', id:'chat-view-submit-iframe', name:'chat-view-submit-iframe', className:'chat-view-submit-iframe', style:$.STYLE_NBODY + 'display:none;'}).appendTo( this.contains );
			
			this.contains.append( this._getViewHtml('alert') );
			
			this.chatHistory    = this.chatElement.find('.chat-view-window-history');

			
			//2016.03.04修改放大按钮
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
			//this._miya_special();
			
			this.callChatResize(this.options.width, this.options.height);
			this._miya_special();


			//20160801 加载订单信息
			this.requestOrderData();
		},
		requestOrderData: function(){
			var self = this;
			//config
			var ordersUrlReg = /success/gi,goodsUrlReg = /item-/gi;
			var url = $.url;
			if( goodsUrlReg.test(url) ){
				

				//url = "http://localhost/data2.json?";
				url = $.protocolFilter("http://www.mia.com/instant/xiaonengservice/itemPageInfo?");
				//itemid=1019432&key=477638684a6af77a6baf5af934f2bdb6&callback=itemPageInfo
				url += $.toURI({
					itemid: this.mode.options.itemid,
					key: nTalk.MD5('ntalker' + this.mode.options.itemid),
					callback:"itemPageInfo"
				});
			}else if( ordersUrlReg.test(url) ){
				//url = "http://localhost/data2.json?";
				url = $.protocolFilter("http://www.mia.com/instant/xiaonengservice/getUserOrderInfo?");
				//url += 'uid=1019432&key=477638684a6af77a6baf5af934f2bdb6&callback=getUserOrderInfo&code=160729609414343'
				url += $.toURI({
					uid: $.global.shortid,
					key: nTalk.MD5('ntalker' + $.global.shortid),	
					callback:"getUserOrderInfo"
					//code: $.global.orderid
				    
				});
				url +="&code="+$.global.orderid+""
			} else {
				$(".chat-view-detail").css('display','none');
				return;
			}
			window.itemPageInfo = function(data){
				var mask = 1;
				self.createOrderInfo(data.item,mask);

				
			};
			window.getUserOrderInfo = function(data){
		
				var mask = 2 ;
				self.createOrderInfo(data.orders,mask);
	
			};
			$.require(url+'#rnd', function(){
				$.Log('load order info ok.');
			});
		},		
		createOrderInfo: function(data,mask){
			var domOrderInfo = [];
			domOrderInfo.push('<a href="'+data.url+'" style="',$.STYLE_BODY,'text-decoration:none;border:none;" target="_blank" >',
				'<span style="',$.STYLE_NBODY,'width:48px;height:48px;border:1px solid #f2f2f2;float:left;display:inline;margin:9px 9px 0 9px;">',
								'<img style="',$.STYLE_NBODY,'width:48px;height:48px;border:none;" src='+data.imageurl+' />',
								'</span>',
						    	 '<div style="',$.STYLE_NBODY,'width:400px;height:52px;float:right;display:block;padding:8px 0 8px 0;">');
			if( data.name )  domOrderInfo.push('<p style="',$.STYLE_BODY,'width:100%;height:18px;" >',data.name,'</p>');
			if( data.order_code )  domOrderInfo.push('<p style="',$.STYLE_BODY,'width:100%;height:18px;" >',(mask===1 ? '' : '订单编码:'),data.order_code,'</p>');
			if( data.siteprice && mask === 1 ) domOrderInfo.push('<p style="',$.STYLE_BODY,'width:100%;height:18px; color:red;margin-top:14px;" >￥',+data.siteprice+'</p>');
			if( data.pay_price && mask === 2 ) domOrderInfo.push('<p style="',$.STYLE_BODY,'width:100%;height:18px; " >',(mask === 1 ? '':'订单金额:'),+data.pay_price+'</p>');
			if( data.order_time )  domOrderInfo.push('<p style="',$.STYLE_BODY,'width:100%;height:18px;" >',(mask===1 ? '' : '下单时间:'),data.order_time,'</p>');
		    
			domOrderInfo.push('</div>','</a>');

			
		
			$(".chat-view-detail").html(domOrderInfo.join(''))
				
		},
       /*
          2016.07.31 添加需求，特制miya


          */
          _miya_special:function(){
          	var miya_chat_head_body = $('.chat-header-body');
          	var miya_chat_view_window_bottom=this.contains.find('.chat-view-window-bottom');
            var miya_chat_view_end_session=this.contains.find('.chat-view-end-session');
            var miya_chat_view_submit=this.contains.find('.chat-view-submit');
          	var miya_chat_view_options=this.contains.find('.chat-view-options');
          	var miya_body_chat_containter=this.contains.find('.body-chat-containter');
          	var miya_chat_view_window_editor=this.contains.find('.chat-view-window-editor').find('textarea');
          	//var miya_view_history_more=this.contains.find('.view-history-more');
            var miya_ntalk_button_close=$('.ntalk-button-close');                
          	var miya_ntalk_button_maxresize=$('.ntalk-button-maxresize');
           
            var miya_ntalk_button_min=$('.ntalk-button-min');
            var miya_chat_view_lbar=$('.chat-view-lbar');
            var miya_chat_view_options_menu=$('.chat-view-options-menu');


            var miya_detail_container = $('.chat-view-detail')


            var miya_banner = $('.chat-view-banner');
            var miya_list = $('.chat-shop-list');
            var miay_detail = $('.chat-history-detail').html('<span style="',$.STYLE_NBODY,'width:48px;height:48px;border:1px solid #f2f2f2;float:left;display:block"></span>').appendTo('miya_detail_container');
           




            

          	miya_chat_view_window_bottom.css({'background':'#ffffff','height':'60px'});
          		
          		miya_chat_view_end_session.css({
          		margin:'6px 0',
          		border:'none',
                'font-size':'14px',
                height: '40px',
                width:'120px',
                'line-height': '40px',
                 'border-radius':'3px',
                 'background-color':'#ededed',
                 'text-align':'center'
            });
          	miya_chat_view_submit.css({
                  margin:'6px 0 0 10px',
                  'background-color':'#f88274',
                  border:'none',
                  'font-size':'14px',
                  height:'40px',
                 'line-height': '40px',
                 'border-radius':'3px',
                 color:'#fff'

          	});
         miya_chat_view_options.css({
         	    'padding':'4px 2px 6px',
                 
                  border:'0px solid #239bf4',
                  color:'white',
                  'background-color':'#1798f6',
                  width: '18px',
                  height:'18px',
                  //'border-left':'0px solid white',
                  
                  'border-top-right-radius':'3px',
                 'border-bottom-right-radius':'3px'

          	});
          
          	miya_chat_view_window_editor.css('box-shadow','white 0px 0px 0px inset');
          	miya_ntalk_button_min.css({
               margin:'14px 0 0 0',
               width:'32px',
               height:'32px',
               'border-radius':'1px'
          	});
          //2016.03.04
            miya_ntalk_button_maxresize.css({
            	display:'none',
            	'height':'0',		
            	'width':'0'
            });
            miya_ntalk_button_close.css({
            	'height':'32px',
            	'width':'32px',
            	'border-radius':'1px'
            })
            /*
			*2016.7.28 蜜芽定制需求
			*
			*
            */
            var miya_chat_view_history = this.contains.find('.chat-view-window-history');
            var miya_chat_view_toolbar = this.contains.find('.chat-view-window-toolbar');
           
            //miya_view_history_more.display();
            // miya_chat_view_toolbar.find('.chat-view-face').css('background-position','-60px -1px')
            // .hover(function(){
            // 	$(this).css('background-position','-60px -20px')
            // },function(){
            // 	$(this).css('background-position','-60px -1px')
            // });
            //隐藏更多按钮
            this.chatElement.find('.chat-view-exp').display();
            //发送按钮悬浮在上面
            miya_chat_view_submit.hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					'background-color': '#f88274'
				});
				miya_chat_view_lbar.css('display','none');
			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					'background-color': '#e96759'
				});

				 //2016.03.09 修改发送按钮移入时的bug
			if(miya_chat_view_options_menu.css('display')=='none'){
	             
					miya_chat_view_lbar.css('display','none');
				}
			else{
				
				miya_chat_view_lbar.css('display','none');

			}
			});
			//多选项悬浮在上面
			 miya_chat_view_options.hover(function(event){
				$.Event.fixEvent(event).stopPropagation();
				$(this).css({
					'background-color': '#6cbef8'
				});
				miya_chat_view_lbar.css('display','none');

			}, function(event){
				$.Event.fixEvent(event).stopPropagation();
			 
			 //2016.03.08增加
			if(miya_chat_view_options_menu.css('display')=='none'){
	             $(this).css({
						'background-color': '#1798f6'
					});
					miya_chat_view_lbar.css('display','none');
				}
			else{
				$(this).css({
					'background-color': '#6cbef8'
				});
				miya_chat_view_lbar.css('display','none');

			}
			});
			  //2016.03.08增加
			   if(miya_chat_view_options_menu.css('display')=='none'){
	             $(this).css({
						'background-color': '#1798f6'
					});
					miya_chat_view_lbar.css('display','none');
				}
		
     	//更新头部的背景颜色
			miya_chat_head_body.css({
				//'background':'#121212',
				'height':'59px'
				
             });
			//2016.03.09 增加ie7模式下的图片按钮
			if($.browser.msie && $.browser.ieversion<=7 ){
					var view_option_enter_span_content='<a id="view-option-enter-svg" style="font-size:16px;line-height:20px;">∨</a>';
                                          
					$('.view-option-enter-span').html(view_option_enter_span_content);
                   $('.view-option-enter-span').css({
                    	height:'16px',
                    	'padding-top':'0'
                    });

                  var view_option_ctrl_span_content='<a id="view-option-ctrl-svg" style="font-size:18px;line-height:20px;display:none;">∨</a>';
                    $('.view-option-ctrl-span').html(view_option_ctrl_span_content);
                    $('.view-option-ctrl-span').css({
                    	height:'16px',
                    	'padding-top':'0'
                    });
				}
				
    
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
					self._expansion();
					
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
				$.STYLE_NBODY + 'background:transparent;list-style:none outside none;display:block;text-align:center;'
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

			if( position === 'right' && data.evaluateid && data.history ) {
				return;
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
	            	var el = liElement.find('.robotQuestion');
	            	el.click(function(event){
	            		var event = $.Event.fixEvent(event);
	            		event.preventDefault();
	            		event.stopPropagation();
						nTalk.chatManage.get(this.settingid).send($(this).html().replace(/[[0-9]*]\s/,""));
						return false;
	            	});
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

				if( data && /^(1|2|4|6)$/i.test(data.type) && position=='left' && typeof window.webInfoChanged == "function" && (data.msgid != 'welcome') && (data.history != 1) && data.msgsystem != "true" ) {
					webInfoChanged(400, '{"num":' + (++this.receiveMsgCount) + ', "showNum":1}', false);
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
			
			if( data && /^(1|2|4|6|9|13|8)$/i.test(data.type) ){
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
		 * @param  bumber   type    消息类型ID[1:文本消息;2:图片消息;4:文件消息;5:特定系统消息;6:音频消息;8:视频消息;9:系统提示消息;]
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
							attr = $.zoom(image, 35, 35);
							//self.chatHistory.find('.view-history-goods-image').html('<a href="' + json.url + '" target="_blank" style="' + $.STYLE_BODY + '"><img src="' + json.imageurl + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_NBODY + 'display:inline;width:' + attr.width + 'px;height:' + attr.height + 'px;" /></a>');
							self.chatHistory.find('.view-history-goods-image').html('<div style="' + $.STYLE_BODY + 'width:28px;height:36px;padding:8px;border:1px solid #f2f2f2;margin-left:10px;"><a href="' + json.url + '" target="_blank" style="' + $.STYLE_BODY + '"><img src="' + json.imageurl + '" width="' + 28 + '" height="' + 36 + '" style="' + $.STYLE_NBODY + 'display:inline;width:' + 28 + 'px;height:' + 36 + 'px;" /></a></div>');
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
						picurl = data.pictureurl,
						broswerAgent=navigator.userAgent.toLowerCase();
					if( data.from && data.from == 1 && (($.browser.msie && $.browser.ieversion === 9) || broswerAgent.indexOf('firefox') > -1 )){
						html.push([
							'<video poster="' + picurl +'"  src="'+sourceurl+'" type="video/mp4" class="ntalker-for-miya-video" style="width:240px;transform:rotate(90deg);-ms-transform:rotate(90deg);margin-left:-30px;margin-top:30px;height:180px"  loop>',
							'</video>',
							'<span class="ntkf-video-button" style="display:block;width:52px;height:52px;background:url('+ $.button +') center no-repeat;background-size:100%;position:absolute;top:50%;left:0;right:0;margin:-26px auto 0;"></span>'].join(''));
					bodyElement.css({'width':'180px','height':'240px'});
					}else if($.browser.msie && $.browser.ieversion < 9 ){
						html.push(['<span>',$.lang.cant_play_video,'</span>',
					 	].join(''))
					}else{
						html.push([
							'<video  poster="' + picurl +'" src="'+sourceurl+'" type="video/mp4" class="ntalker-for-miya-video" style="width:100%;height:100%;"  loop>',
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
				            liElement.find('table').css('width', '228px');
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
				                    var attr = $.zoom(image, 100, 85);
				                    //设置图片宽高为读取到的宽高
				                    var imageHtml = '<img src="' + data.url + '" sourceurl="' + data.sourceurl + '" width="' + image.width + '" height="' + image.height + '" style="vertical-align:middle;' + $.STYLE_NBODY + 'width:' + image.width + 'px;height:' + image.height + 'px;max-width:220px;max-height:160px;" />';

				                    var width = image.width,
				                        height = image.height;

				                    //当宽度或高度不足时，添加默认的白色的背景
				                    if (image.width < 138) {
				                        width = 138;
				                    	if(image.height < 100){
				                    		height = 100;
				                    		var imageHeight = (!$.browser.Quirks && ($.browser.ieversion == 6 || $.browser.ieversion == 7)) ? image.height : height;
				                    		imageHtml = '<div style="width:138px;height:'+imageHeight+'px;padding:' + (100 - image.height) / 2 + 'px 0;box-sizing:border-box;text-align:center;background:white;border-radius:5px;max-width:220px;max-height:160px">' + imageHtml + '</div>';
				                    	}else{
				                    		imageHtml = '<div style="width:138px;height:' + image.height + 'px;text-align:center;background:white;border-radius:5px;max-width:220px;max-height:160px">' + imageHtml + '</div>';
				                    	}
				                    } else if (image.height < 100) {
				                        height = 100;
				                        var imageHeight = (!$.browser.Quirks && ($.browser.ieversion == 6 || $.browser.ieversion == 7)) ? image.height : height;
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
				                        'max-width': '320px',
				                        'max-height': '200px'
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
				                            'border': '1px solid #e2e2e2'
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
					bodyElement.parent().css('padding','0 4px');

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

			$({className:'link-desc', style: $.STYLE_BODY + 'margin:5px 0 10px 0;width:100%;max-height:60px;overflow:hidden;color:#f00'}).appendTo( container ).html( $.enCut(data.description, 96, 1) + '&nbsp;' );
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
			if( this._inputStateTimeID && position === undefined ){
				return;
			}
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
				docFlag = ['.doc', '.docx'];
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
			var statusIconPosition = success ? ' -289px -97px ' : ' -78px -58px '
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
				'<div class="ntkf-alert-close" style="' + $.STYLE_NBODY + 'cursor:pointer;height:20px;position:absolute;right:5px;top:9px;width:20px;background:url(' + $.imageicon + ') no-repeat scroll -270px -55px;-moz-border-radius:0px;-webkit-border-radius:0px;border-radius:0px;"></div>',
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
						width:'308px',
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
			                        '<input style="' + $.STYLE_BODY + 'text-align:center;padding:0 20px;margin:0 auto;height:40px;color:#000;line-height:40px;width:120px;background-color:#f98275;color:white;border-radius:3px;" type="button" class="chat-view-button chat-view-submit-submit" value="' + $.lang.message_button_submit + '">',
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
						'<div style="',$.STYLE_BODY,'margin:2px;width:15px;height:15px;float:left;background:url(',$.imageicon,') no-repeat -98px -58px;"></div>',
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
		
			$('.chat-view-message-table input:not(.chat-view-button)').css({
				'background':'#f6f6f6',
				'border-radius':'3px',
				'height':'20px',
				'border':'solid 1px #f2f2f2',
				'margin-bottom':'16px',
				'color':'#999999',
				'font-size':'14px',
				'padding':'10px'

			});
			$('.chat-view-message-table table tr td div').css('padding-top','8px')
			$('textarea').css({
				'width':'308px',
				'background':'#f6f6f6',
				'border-radius':'3px',
				'border':'solid 1px #f2f2f2',
				'resize':'none',
				'color':'#999999',
				'padding':'10px'
			});
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
		    //2016.03.29 添加重新加载页面 添加类
		    $(window).bind('resize', function(event) {
		        $('.view-fullScreen-background,.view-fullScreen-iframe,.view-fullScreen-container').css({
		            width: $(window).width() + 'px',
		            height: $(window).height() + 'px'
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
					'<span class="view-fullScreen-close" style="',$.STYLE_NBODY,'position:absolute;width:28px;height:28px;margin:20px 20px 0 0;top:0;right:0;cursor:pointer;background:url(',$.imageicon,') no-repeat scroll -266px -24px;z-index:2000000001;"></span>',
					'<span class="view-fullScreen-download"  style="',$.STYLE_NBODY,'position:absolute;width:28px;height:28px;margin:20px 20px 0 0;top:0;right:50px;cursor:pointer;background:url(',$.imageicon,') no-repeat scroll -230px -24px;z-index:2000000001;"></span>'
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
			if ( type === 'system' && ($.browser.oldmsie || $.browser.ieversion == 11)) {
				systemMsgLength =  Math.min($.enLength($.clearHtml(data.msg)) * 6, 440) + "px";
			}
			if( type === 'otherinfo' ){
				type = 'left';
				data.userid = '';
				data.name = '';
				data.msg = [//faq信息
					'<h1 style="',$.STYLE_BODY,'">',
					'<span style="',$.STYLE_NBODY,'float:left;margin-right:5px;width:15px;height:15px;background:transparent url(',$.imageicon,') no-repeat -293px -54px;"></span>',
					'<span style="',$.STYLE_BODY,'font-weight:bold;">',data.title,'</span>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />',
					'</h1>',
					'<p style="',$.STYLE_BODY,'">', data.msg, '</p>'
				].join('');
			}

			if(data.type == 7) data.type = 1;

			var evaluateHTml = '';
			if(data.evaluateid && !data.history) {
				var id = $.getTime();
				evaluateHTml = [
					// 换行
					'<br/>',
					// wrapper
					'<div style="',$.STYLE_BODY,'width:100%;text-align:right">',
					// 赞
					'<img class=',(id + '_yibot_button'),' onClick="NTKF.chatManage.get().sendYiBotEvaluate(\'ok\', \'',data.evaluateid,'\', 1, \'',data.question,'\', \'',data.faq,'\');nTalk(\'',('.' + id + '_yibot_button'),'\').display(0);nTalk(\'',('#' + id + '_yibot_toast'),'\').display(true)" style="',$.STYLE_NBODY,'margin:12px 10px 0px 0px;cursor:pointer" src="',($.sourceURI + 'images/robot/zan.png'),'">',
					// 踩
					'<img class=',(id + '_yibot_button'),' onClick="NTKF.chatManage.get().sendYiBotEvaluate(\'no\', \'',data.evaluateid,'\', 0, \'',data.question,'\', \'',data.faq,'\');nTalk(\'',('.' + id + '_yibot_button'),'\').display(0);nTalk(\'',('#' + id + '_yibot_toast'),'\').display(true)" style="',$.STYLE_NBODY,'margin:12px 6px 0px 0px;cursor:pointer" src="',($.sourceURI + 'images/robot/cai.png'),'">',
					'<span id=',(id + '_yibot_toast'),' style="display:none">感谢您的评价^-^!</span>',
					'</div>'
				].join("");
			}

			return type === 'right' ?
				[//发送的消息
					'<table style="',$.STYLE_NBODY,'float:right;_float:none;border-collapse:separate;padding-left:42px;" class="view-history-right" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'text-align:right;">',
												
							'<tr style="',$.STYLE_NBODY,'">',

							//2016.03.02更改背景颜色和字体粗细
								'<td class="view-history-content" style="',$.STYLE_BODY,'padding:8px;background:#fdcac6;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;">',
									'<div class="view-history-body" style="min-height:20px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;/*width:100px;*/min-height:50px;height:85px;font-weight:bold;*font-size:0px;*line-height:0px;*font-family:Arial;' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;font-weight:bold;font-family:微软雅黑;',
									(data.type == 1 ? 'color:#' + data.color + ';font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' ' + data.fontsize + 'px/160% Arial,微软雅黑;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									(data.type==1 
									? data.msg 
									: data.type==6 
										? ['<div style="' + $.STYLE_NBODY + 'width:1px;height:1px;overflow:hidden;visibility:hidden;">',
										'<div class="view-history-audio" style="',$.STYLE_BODY,'float:left;min-width:1px;height:1px;overflow:hidden;visibility:hidden;">',
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
								'<td style="',$.STYLE_NBODY,'width:10px;vertical-align:middle;overflow:visible;">',
									//尖角添加className
									'<div class="view-history-angle" style="',$.STYLE_NBODY,'position:relative;left:-1px;z-index:1;width:10px;height:18px;top:3px;background:url(',$.imageicon,') no-repeat -266px -2px;"></div>',//
								'</td>',
								'<td style="',$.STYLE_NBODY,'vertical-align:middle;width:50px;height:50px;padding-right:9px;">',
									//2016.7.29蜜芽添加头像
									'<div style="',$.STYLE_NBODY,'width:50px;height:50px;background:url(',$.imageicon,') no-repeat -317px -58px;"></div>',
								'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_BODY,'overflow:visible;text-align:right;position:relative;">',
									'<span class="view-history-time" style="',$.STYLE_BODY,'float:right;color:#b9b9c1;line-height:26px;"> \u6211  ',$.formatDate(data.timerkeyid),'</span>',
									'<span class="view-chat-hidden-area" style="',$.STYLE_NBODY,'float:right;width:1px;height:26px;overflow:visible;position:relative;top:0px;">',
										'<div class="view-history-status" style="',$.STYLE_BODY,'display:none;color:#010002;line-height:26px;width:280px;position:absolute;left:-280px;top:0px;">',
											'<div class="view-history-status-link" style="',$.STYLE_BODY,'float:right;line-height:26px;height:26px;"></div>',
											'<div class="view-history-status-icon" style="',$.STYLE_NBODY,'margin:7px 3px;float:right;display:block;line-height:26px;width:10px;height:10px;background:#fff url(',$.imageicon,') no-repeat -58px -58px;"></div>',
										'</div>',
									'</span>',
								'</td>',
								'<td style="',$.STYLE_NBODY,'"></td>',//null
								'<td style="',$.STYLE_NBODY,'"></td>',//null
							'</tr>',
							
						'</tbody>',
					'</table>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				/left|bottom/gi.test(type) ?
				[//接收的消息
				//2016.03.08 新增 padding 值
					'<table style="',$.STYLE_NBODY,'float:left;float:none;table-layout:auto;border-collapse:separate;padding:0 38px 0 4px;" class="view-history-left" cellpadding="0" cellspacing="0" border="0" class="table">',
						'<tbody style="',$.STYLE_NBODY,'">',
						 //2016.03.08更改时间tr和内容的位置
							
							
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_NBODY,'vertical-align:middle;width:50px;height:50px;padding-left:9px;">',
									//2016.7.29蜜芽添加头像
									'<div style="',$.STYLE_NBODY,'width:50px;height:50px;background:url(',$.imageicon,') no-repeat -317px -2px;"></div>',
								'</td>',
                               '<td style="',$.STYLE_NBODY,'width:10px;vertical-align:middle;overflow:visible;">',
									//尖角添加className 增加样式
									'<div class="view-history-angle" style="',$.STYLE_NBODY,'position:relative;right:-3px;top:3px;z-index:1;width:10px;height:18px;background:url(',$.imageicon,') no-repeat -256px -2px;z-index:2;"></div>',
								'</td>',
								//
								'<td class="view-history-content" style="',$.STYLE_BODY,'padding:8px;background:white;border:1px solid #ededed;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px">',
									'<div class="view-history-body" style="min-height:20px;',$.STYLE_BODY,(/^(2|4)$/i.test(data.type)&&!data.emotion ? 'text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;font-weight:bold;/*width:100px;*/min-height:50px;height:85px;*font-size:0px;*line-height:0px;*font-family:Arial;' : 'display:block;/*width:100%;*/'),'word-break:break-all;word-wrap:break-word;',(type=='bottom' ? 'width:60px;' : ''),
									(data.type == 1 ? 'color:#' + data.color + ';font:'+(data.italic=="true" ? 'italic' : 'normal')+' '+(data.bold=="true" ? 'bold' : 'normal')+' ' + data.fontsize + 'px/160% 微软雅黑;text-decoration:' + (data.underline=="true" ? 'underline' : 'none') + ';' : ''),
									'">',
									(/^(1|9)$/i.test(data.type) ? data.msg : ''),
									evaluateHTml,
									'</div>',
								'</td>',
							'</tr>',
							'<tr style="',$.STYLE_NBODY,'">',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_NBODY,'"></td>',
								'<td style="',$.STYLE_BODY,'overflow:visible;position:relative;">',
									'<span class="view-history-more" style="',$.STYLE_BODY,'margin-right:5px;float:left;color:blue;cursor:pointer;line-height:26px;display:none;">',$.lang.button_more,'</span>',
									//接收到非当前客服的消息时，显示客服名
									// (data.userid && !this.mode.isVisitor(data.userid)&&this.mode.dest.id!=data.userid ?
									// 	['<span class="view-history-destname" style="',$.STYLE_BODY,'padding-right:5px;float:left;color:#b9b9c1;line-height:26px;">',
									// 		data.name,
									// 	'</span>'].join('') :
									// ''),
									// 2016.7.29 蜜芽定制ui不用判断总是显示客服的昵称
									'<span class="view-history-destname" style="',$.STYLE_BODY,'padding-right:5px;float:left;color:#b9b9c1;line-height:26px;">',
											data.name,
									 	'</span>',
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
				//2016.03.02将公众形象隐藏
					'<div class="view-history-system" style="',$.STYLE_BODY,'background:transparent;line-height:180%;marign:0 auto;padding:20px 0;text-align:center;word-break:break-all;word-wrap:break-word;display:none;">',
						data.msg,
					'</div>',
					'<br style="',$.STYLE_NBODY,'clear:both;" />'
				].join('') :
				type === 'goods' ?
				[//商品信息
					'<table style="',$.STYLE_NBODY,' background:white;border:1px solid #f2f2f2;float:left;width:478px;height:68px;table-layout:auto;border-collapse:separate;display:none" class="view-history-goods" cellpadding="0" cellspacing="0" border="0" class="table">',

						'<tbody style="',$.STYLE_NBODY,'text-align:center;">',
						'<tr style="',$.STYLE_NBODY,'">',
						'<td class="view-history-goods-image" style="',$.STYLE_BODY,'width:48px;height:48px;min-width:48px;text-align:center;";padding:none;></td>',
						'<td class="view-history-goods-info" style="',$.STYLE_BODY,'width:400px;height:68px;text-align:left;padding-left:10px"></td>',
						'</tr>',
						//'<tr style="',$.STYLE_NBODY,'"><td colspan="2" style="',$.STYLE_NBODY,'height:10px;width:100%;"><div style="',$.STYLE_BODY,'margin:0 auto;background:#FFF url(',$.imageicon,') no-repeat 85px -80px;height:10px;width:391px;"></div></td></tr>',
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
					'<div class="chat-view-window-history" style="',$.STYLE_BODY,'width:100%;height:320px;height:267px\\0;_height:269px;background-repeat:no-repeat;background-position:center bottom; padding-top:1px solid #fff\\0;position:relative;background-color:#f6f6f6;overflow-x:hidden;overflow-y:scroll;">',
						'<ul style="',$.STYLE_NBODY,'list-style:none;margin:0px 0px 10px 0px;">',
							    '<li class="chat-view-detail" style="',$.STYLE_NBODY,'list-style:none;width:478px;height:68px;border:1px solid #f2f2f2;background-color:white;">',
							    	
							    	'</li>',
						'</ul>',
					'</div>',
					//2016.03.03 更改border边框的颜色
					'<div class="chat-view-window-toolbar" style="',$.STYLE_BODY,'height:40px;width:100%;">',
						//分配客服时状态消息
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-window-status-info" style="',$.STYLE_BODY,'background:#66ccff;overflow:hidden;margin-left:10px;width:380px;line-height:30px;height:30px;position:absolute;top:-30px;z-index:99;text-align:center;display:none;"></div>',
						'</div>',
						//2015.01.05 添加输入提示建议
						'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
						   
							'<div class="chat-view-suggest-list chat-view-span" style="',$.STYLE_NBODY,'border:1px solid #999;background:#fafafa;width:467px;line-height:30px;height:auto;position:absolute;top:-2px;left:2px;z-index:999;display:none;">',
								'<ul style="',$.STYLE_BODY,'list-style:none;"></ul>',
							'</div>',
						'</div>',
						'<div class="chat-view-button chat-view-face" title=',$.lang.button_face,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:3px 0 3px 10px;_margin-left:5px;border:0px solid #ccc;height:30px;;display:inline-block;cursor:pointer;width:30px;background:url(',$.imageicon,') no-repeat -53px 6px;">',
							'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:0px;height:0px;position:relative;overflow:visible;">',
							'<div class="chat-view-span chat-view-window-face" style="',$.STYLE_NBODY,'display:none;position:absolute;left:-9px;top:-229px;border:1px solid #979A9E;width:273px;height:224px;background:#fff;z-index:1000002;cursor:auto;border-radius:3px;overflow:hidden;">',
									
								'</div>',
							'</div>',
						'</div>',
						//2016.03.03改变的截图到前面
						
						'<div class="chat-view-button chat-view-image" title=',$.lang.button_image,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:30px;display:inline-block;cursor:pointer;width:30px;background:url(',$.imageicon,') no-repeat -83px 6px;"></div>',
						//2016.03.07　将文件进行隐藏
						'<div class="chat-view-button chat-view-file" title=',$.lang.button_file,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:30px;display:inline-block;cursor:pointer;width:30px;background:url(',$.imageicon,') no-repeat -111px 6px;"></div>',
						'<div class="chat-view-button chat-view-history" title=',$.lang.button_save,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:30px;display:inline-block;cursor:pointer;width:30px;background:url(',$.imageicon,') no-repeat -167px 6px;"></div>',
						//2014.11.11 添加查看聊天记录按钮
						'<div class="chat-view-button chat-view-load-history" title=',$.lang.button_view,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -220px -40px;display:none;"></div>',
						'<div class="chat-view-button chat-view-evaluate" title=',$.lang.button_evaluation,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:30px;display:inline-block;cursor:pointer;width:30px;background:url(',$.imageicon,') no-repeat -139px 6px;"></div>',
						'<div class="chat-view-button chat-view-capture" title=',$.lang.button_captureImage,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:30px;display:inline-block;cursor:pointer;width:30px;background:url(',$.imageicon,') no-repeat -195px 6px;"></div>',
						//2016.03.07 将按钮进行隐藏
						//'<div class="chat-view-capture-options" style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 0px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;">',
							//'▼',
							//'<div class="chat-view-capture-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:1px;position:relative;overflow:visible;">',
								//'<div class="chat-view-span chat-view-options-capture-menu" style="',$.STYLE_BODY,'display:none;padding:1px;background:#fff;position:absolute;left:-89px;top:-79px;border:1px solid #ccc;width:100px;*width:102px;_width:102px;height:auto;z-index:1000002;cursor:cursor;">',
									//截图方式
									//'<div class="view-option-hidden talk_selected" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;background:#efefef;">',$.lang.button_capture_hidden_chatWin,'</div>',/*',隐藏窗口,'*/
									//'<div class="view-option-show" style="',$.STYLE_BODY,'padding:3px 0 3px 10px;">',$.lang.button_capture_show_chatWin,'</div>',/*',不隐藏窗口,'*/
								//'</div>',
							//'</div>',
						//'</div>',
						//2015.01.06 机器要转人工客服按钮   /*,$.lang.button_switch_manual,*/
						'<div class="chat-view-switch-manual chat-view-robot-button" title="',$.lang.button_switch_manual,'" style="',$.STYLE_BODY,'color:#f04d50;float:right;margin:10px 15px 0 0 ;height:22px;display:inline-block;cursor:pointer;width:auto;font-size:14px;margin-top:6px;line-height:22px;padding:3px 5px; border-radius:3px;">\u4eba\u5de5\u5ba2\u670d</div>',
						'<div class="chat-view-button chat-view-change-csr" title=',$.lang.button_change_csr,' style="',$.STYLE_BODY,'color:#525252;float:left;margin:4px 0 4px 10px;border:0px solid #ccc;height:20px;display:inline-block;cursor:pointer;width:20px;background:url(',$.imageicon,') no-repeat -243px -40px;"></div>',
						'<div class="chat-view-button chat-view-exp" style="',$.STYLE_BODY,'color:#525252;float:right;margin:4px 3px;padding:0 3px;border:0px solid #ccc;height:0px;display:none;cursor:pointer;visibility:hidden;">',$.lang.button_more,' &lt;</div>',
					'</div>',
					'<div class="chat-view-window-editor" style="',$.STYLE_BODY,'height:110px;width:100%;overflow:hidden; background-color:#f6f6f6;">',
						'<textarea placeholder="',$.lang.default_textarea_text,'" style="',$.STYLE_BODY,CON_STYLE_SHADOW,'margin:1px;padding:10px;width:381px;width:411px\\9;height:88px;height:93px\\9;outline:0px solid #08f;border:0px solid #08f;color:#ccc;resize:none;overflow:hidden;"></textarea>',
					'</div>',
					'<div class="chat-view-window-bottom" style="',$.STYLE_BODY,'height:60px;width:100%;background:#f9f9f9;border-radius:0px 0px 0px 5px;-moz-border-radius:0px 0px 0px 5px;-webkit-border-radius:0px 0px 0px 5px">',
						'<div class="chat-view-options" style="',$.STYLE_BODY,'margin:6px 10px 6px 0;float:right;border:1px solid #ccc;width:14px;height:26px;line-height:25px;text-align:center;cursor:pointer;display:none">',
							'▼',
							'<div class="chat-view-hidden-area" style="',$.STYLE_NBODY,'width:1px;height:1px;position:relative;overflow:visible;">',
								//2016.03.04 变化 将padding值去掉
								'<div class="chat-view-span chat-view-options-menu" style="',$.STYLE_BODY,'display:none;background:#fff;position:absolute;left:-166px;top:-82px;border:1px solid #f4f4f4;border-radius:3px;width:188px;*width:104px;_width:104px;height:auto;z-index:1000002;cursor:cursor;display:none;">',
									//发送消息方式 
									//2016.03.06去掉padding 值，将line-height变成200
							     '<div class="view-option-enter talk_selected" style="',$.STYLE_BODY,'padding:0;background:#fafafa;line-height:200%;width:184px;">',
							    
							    // '\u6309\u0045\u006e\u0074\u0065\u0072\u952e\u53d1\u9001\u6d88\u606f',
                                    //2016.03.06增加左侧区域 
                                    '<span class="view-option-enter-span" style="float:left;width:22px;height:8px;padding:8px 0px 8px 4px;background:#e4e4e4;margin-right:10px;">',
                                        
                                        '<svg  id="view-option-enter-svg" height="8" width="14" style="display:block">',
                                           '<path d="M0,2 L6,8 L14,0" fill="none" stroke="#626262" stroke-width="2px"/>',
  
                                        '</svg>',
                                    '</span>',
                                    '<a>','\u6309\u0045\u006e\u0074\u0065\u0072\u952e\u53d1\u9001\u6d88\u606f','</a>',
                                    '</div>',
									'<div class="view-option-ctrl+enter" style="',$.STYLE_BODY,'padding:0;background:#fafafa;line-height:200%;width:184px;">',
									//'\u6309\u0043\u0074\u0072\u006c\u002b\u0045\u006e\u0074\u0065\u0072\u952e\u53d1\u9001\u6d88\u606f',
                                         '<span class="view-option-ctrl-span" style="float:left;width:22px;height:8px;padding:8px 0px 8px 4px;background:#e4e4e4;margin-right:10px;">',
                                          '<svg  id="view-option-ctrl-svg" height="8" width="14" style="display:none" xmlns="http://www.w3.org/2000/svg">',
                                            '<path d="M0,2 L6,8 L14,0" fill="none" stroke="#626262" stroke-width="2px"/>',
  
                                        ' </svg>',
                                    '</span>',
                                     '<a>','\u6309\u0043\u0074\u0072\u006c\u002b\u0045\u006e\u0074\u0065\u0072\u952e\u53d1\u9001\u6d88\u606f','</a>',
									'</div>',
								'</div>',
							'</div>',
						'</div>',
						//2016.03.06新增一个div 
						'<div class="chat-view-lbar" style="position:absolute;right:34px;width:1px;height:14px;background:#ffffff;margin:14px 0;display:none;"></div>',
						'<div class="chat-view-submit" style="',$.STYLE_BODY,'margin:5px 0;float:right;width:120px;height:40px;line-height:40px;text-align:center;cursor:pointer;">\u53d1\u0020\u9001</div>',
						//',$.lang.chat_button_send,'
						'<span class="chat-view-end-session" style="',$.STYLE_BODY,'text-decoration:none;margin:8px 10px 8px 0;padding:0 10px;float:right;height:24px;line-height:24px;cursor:pointer;">',
						//$.lang.button_end_session,
						//2016.03.09修改文字
						'\u5173\u95ed',
						'</span>',
						'<span class="chat-view-xiaoneng-version" style="',$.STYLE_BODY,'display:block;visibility:visible;text-decoration:none;margin:6px 0px 6px 10px;float:left;height:26px;line-height:26px;color:#DDD;">',$.lang.chat_xiaoneng_version,'</span>',
						'<div style="',$.STYLE_NBODY,'clear:both;"></div>',
					'</div>'
				].join('') :
				type=='message' ? [
					'<div class="chat-view-message-announcement" style="',$.STYLE_BODY,'margin:10px 20px 10px 20px;height:auto;max-height:200px;overflow:hidden;"></div>',
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
				
				var css = {color:'#000'};
				if( $.browser.msie && $.browser.ieversion<=7 ){
					//2016.03.03消除边框颜色
					$(this).css($.merge(css, {
						'width':	($(this).width() - 26) + 'px',
						'height':	($(this).height() - 26) + 'px',
						'border-width': '0px'
					}));
				}else{
					//2016.03.03消除边框
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
			});
			
			if( this.textEditor.val() == '' && !$.browser.html5 ){
				this.textEditor.val( $.lang.default_textarea_text );
			}
			
			//this._listenTextEditor();
			//结束会话
			this.chatElement.find('.chat-view-end-session').hover(function(event){
				//2016.03.03字体颜色发生改变,边框颜色改变
				$(this).css({
					//'color':'#010101',
					'background-color':'#e0e0e0'
					//'border-color':'#e2e2e2'
				});
			}, function(event){
				$(this).css({
					//'color':'#010101',
					'background-color':'#ededed'
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
				
				//hack lt IE8
				positionX = $(this).css('background-position').split(' ').shift();
				positionY = $(this).indexOfClass('chat-view-load-history')||$(this).indexOfClass('chat-view-switch-manual')||$(this).indexOfClass('chat-view-change-csr') ? ' -60px' : ' -21px';

				$(this).css({'background-position': positionX + positionY,'background-color':'#ededed'});
				}, function(event){
				$.Event.fixEvent(event).stopPropagation();
				if( $(this).attr('talk_disable') || $(this).attr('selected') ){
					return;
				}
				





				//hack lt IE8
				positionX = $(this).css('background-position').split(' ').shift();
				if( $(this).indexOfClass('chat-view-face') ) {
					positionY = ' 6px';
				}else if(  $(this).indexOfClass('chat-view-capture')||$(this).indexOfClass('chat-view-evaluate')||$(this).indexOfClass('chat-view-image')||$(this).indexOfClass('chat-view-file')||$(this).indexOfClass('chat-view-history')|| $(this).indexOfClass('chat-view-switch-manual') || $(this).indexOfClass('chat-view-change-csr')) {
					positionY = ' 6px';
				}
					
				$(this).css({'background-position': positionX + positionY,'background-color':'transparent'});
				
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
					//2016.03.06背景颜色改变
					$(element).removeClass('talk_selected').css('background', '#fafafa');
					
                });
				if( $(this).indexOfClass('view-option-enter') ){
					self._sendKey = 'Enter';
					//2016.03.06新增背景颜色
					self.chatElement.find('.view-option-enter-span').css('background','#6cbdfc');
					self.chatElement.find('.view-option-ctrl-span').css('background','#e4e4e4');
					self.chatElement.find('#view-option-enter-svg').css('display','block');
					self.chatElement.find('#view-option-ctrl-svg').css('display','none');
				}else{
					self._sendKey = 'Ctrl+Enter';
					//2016.03.06新增背景颜色
					self.chatElement.find('.view-option-ctrl-span').css('background','#6cbdfc');
					self.chatElement.find('.view-option-enter-span').css('background','#e4e4e4');
					self.chatElement.find('#view-option-enter-svg').css('display','none');
					self.chatElement.find('#view-option-ctrl-svg').css('display','block');
                    
				}
				//2016.03.06 背景颜色改变

				$(this).addClass('talk_selected').css('background', '#6cbdfc');
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
				margin: '14px 22px 0 0',
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
			 //2016.03.08增加
			 this.chatElement.find('.chat-view-options').css({
						'background-color': '#1798f6'
					});
			this.chatElement.find('.chat-view-lbar').css('display','none');
				
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
			if( (typeof data.msg !== 'string' || /<.*?\>/gi.test(data.msg)) ){

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
			this.chatHistory.find('ul').css({'width':  (width) + 'px'});
			this.chatHistory.css({'height': (height - 220) + 'px'});
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
		    var msgid = self.msgid;
		    var duration = self.duration;
		    var bodyEl = $('.' + msgid).find('.view-history-body');
		    var kf = msgid.indexOf("J") > -1 ? false : true;
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
		            var img = $('#player_' + msgid + ' img')[0];
		            img.src = img.src.replace("png", "gif");
		            break;
		        case "stop":
		            $.Log('[nTalk music]: mp3 view stop, msgid is ' + msgid);
		            $.musicEl = null;
		            var img = $('#player_' + msgid + ' img')[0];
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
					attr = {width:35,height:35};
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
			//2016.03.04修改
			dropHeight: 60,
			//2016.03.02修改窗口大小
			width:  490, //聊天窗口区域宽
			height: 540, //聊天窗口区域高
			minWidth: 490,//最小聊天窗口宽
			minHeight:540,//最小聊天窗口高
			leftElementWidth:  140,//聊窗标签区域宽
			rightElementWidth: 270,//聊窗侧边栏宽
			resizeHeight: 540,
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
		MIYA_GOODSURL: 'https://www.mia.com/instant/xiaonengservice/recItem',

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

			this.requireGoodsInfo();

			

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
				icon = this.header.find('.chat-header-icon').css('display','none'),
				sign = this.header.find('.chat-header-sign')
			;
			
			this.leftContent.find('li.'+settingid+' .tag-head-icon').css('background-color', data.status!==1 ? '#666' : '#060');
			
			if( updateStatus === true ) return;
			
			this.leftContent.find('li.'+settingid+' .tag-content-text').html( data.id == $.CON_SINGLE_SESSION ? $.lang.toolbar_default_text : data.name);
			
			if( !data.id ){
				this.header.find(".chat-header-icon,.chat-header-name").css('visibility', 'hidden');
				return;
			}
			this.header.find(".chat-header-sign").css('display', 'none');
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
			this.headName.css('display', 'none').html( data.title || data.name );
			signWidth = Math.max(0, this.header.width() - this.headName.width() - 165);
			sign.css('visibility', 'visible').attr('title', data.sign).css('width', signWidth + 'px').html( data.sign );

			
		},
		requireGoodsInfo: function(){
			var self = this,uid = $.global.shortid || 1019432;
			var url = this.MIYA_GOODSURL + "?callback=recItem&uid="+uid
			//&rnd=" + new Date().getTime();
			//nTalkGoodsInfoCallback
			window.recItem = function(data){
				data =  typeof(data) === "string" ? $.JSON.parseJSON(data) : data;
		 		if( !data || typeof(data) !== "object" ){
		 			return;
		 		}
		 		self.createGoodsInfolist(data.data);
		 		self.showBannerPicList(data.data);

		 	};
		 	$.require(url+'#rnd', function(){
				$.Log('require miya order info ok.');
		 	});
		},


		createGoodsInfolist: function(data){
			var html = ['<ul style="',$.STYLE_NBODY,'">'];
			for(var item,i = 0, len = data.recommendItem.length; i < len; i ++){
				item = data.recommendItem[i];
				html.push( this.createGoodsInfo(item.name,item.sale_price,item.img2,item.url) );
			}
			html.push('</ul>');
			$(".window-right-externaldata").html( html.join('') );
		},
		createGoodsInfo: function(name,price,img,url){
			return ['<a href = "'+url+'" style="',$.STYLE_BODY,'text-decoration:none;border:none;" target = "_blank" >',
			'<li style="',$.STYLE_BODY,'width:230px;height:71px;list-style:none;">',
					'<div style="',$.STYLE_BODY,'width:221px;height:61px;border-bottom:1px solid #f2f2f2;padding-top:9px;padding-left:9px;">',
						'<span style="',$.STYLE_BODY,'display:block;width:48px;height:48px;border:1px solid #f2f2f2;float:left;">',
							'<img style="',$.STYLE_BODY,'width:48px;height:48px;border:none;" src='+img+'>',
						'</span>',
						'<div style="',$.STYLE_BODY,'width:160px;height:70px;float:left;padding-left:10px;">',
							'<p style="',$.STYLE_BODY,'width:138px;height:20px;overflow:hidden;">'+name+'</p>',
							'<p style="',$.STYLE_BODY,'width:50px;height:20px;color:red;margin-top:10px;">￥'+price+'</p>',
						'</div>',
					'</div>',
				'</li>',
				'</a>'].join('');
		},
		showBannerPicList:function(data){
			var swipeDom = [];
			if( data.banner.length === 1 ){
				swipeDom.push('<div class = "nTalk-miya-swiper"  style="',$.STYLE_NBODY,'width:250px;height:150px;position:absolute;left:0px;zoom:1;">')
					swipeDom.push('<a href = "'+data.banner[0].url+'" style="',$.STYLE_NBODY,'text-decoration:none;border:none" target="_blank"><img src='+data.banner[0].pic+' style="',$.STYLE_NBODY,'margin:0 auto;width:250px;height:150px;float:left;border:none"/></a>');
				swipeDom.push('</div>');
				$('.window-right-swipe').html(swipeDom.join(''));
			} else{			
				swipeDom.push('<div class = "nTalk-miya-swiper"  style="',$.STYLE_NBODY,'width:750px;height:150px;position:absolute;left:0px;zoom:1;overflow:hidden;">')

				for(var i = 0,len = data.banner.length; i < len; i ++){
					swipeDom.push('<a href = "'+data.banner[i].url+'" style="',$.STYLE_NBODY,'text-decoration:none;border:none" target="_blank"><img src='+data.banner[i].pic+' style="',$.STYLE_NBODY,'margin:0 auto;width:250px;height:150px;float:left;"/></a>');
				} 
				swipeDom.push('</div>');
			
				$('.window-right-swipe').html(swipeDom.join(''));

				var timeout = 0;
				var waittime = 0;
				var distance = 10;
				var waitFlag = false;
				var timer = setInterval(function(){
					if( i == 3){ i = 1; timeout = 0 }; 

					if(!waitFlag) {
						timeout++;
						$('.nTalk-miya-swiper').css('left', -(distance*timeout)+'px');
						
						if(distance*timeout % 250 == 0) {
							waitFlag = true;
							i++;
						}
					} else {
						waittime++;

						if(waittime == 300) {
							waitFlag = false;
							waittime = 0;
						}
					}
				},10);
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
					obj.selected = false;
					
				}

				if( obj.title == '\u63a8\u8350\u5546\u54c1' ){

					selectLabel = true;
					obj.selected = true;

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
		  startColor=endColor='#fdcac6';

			if( startColor == endColor ){
				//自定义皮肤
				if( colorExp.test(startColor) ){
					//背景颜色
					var hsl = $.toHSL(startColor).l;
					this.headBody.css({
						'background':	startColor,
						'color':		hsl < 0.75 ? '#fff' : '#525252'
					});
					this.rightElement && this.rightElement.find('.window-right-head').css({
						'background':	startColor,
						'color':		hsl < 0.75 ? '#fff' : '#525252'
					});
				}else{
					//背景图片
					this.headBody.css({
						'background':	'url(' + startColor + ') repeat'
					});
					this.rightElement && this.rightElement.find('.window-right-head').css({
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
			//2016.8.2 添加最外层元素的阴影样式
			$('.ntalk-window-containter').css({
					'border-radius':'5px',
					'box-shadow':'1px 1px 30px #ccc'
				});
			
			this.chatWidth = this.options.width;
			this.chatHeight= this.options.height + this.options.dropHeight;
			
			this._objView.buttonClose.hover(function(){
				$(this).css('background-color', '#fab9b3');
				$(this).css('background-position','-25px 6px');
			}, function(){
				$(this).css('background-color', 'transparent');
				$(this).css('background-position','-25px 5px');
			}).attr('title', $.lang.chat_button_close).css({
				margin: '14px 22px 0 0',
				background: 'url(' + $.imageicon + ') no-repeat -25px 5px'
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
				//2016.7.28更改背景颜色
				$(this).css('background-color', '#fab9b3');
				$(this).css('background-position', '6px 7px');
			}, function(){
				//2016.03.07更改位置
				$(this).css('background-color', 'transparent');
				$(this).css('background-position', '6px 6px');
			}).css({
				margin: '14px 0px 0 0',
				//更改位置
				background: 'url(' + $.imageicon + ') no-repeat 6px 6px'
			}).attr('title', $.lang.chat_button_min);
		    //2016.03.02变化背景颜色 和top值将13px变成10px
			this.headBody = $({className: 'chat-header-body', style: $.STYLE_BODY + 'z-index:0;color:#525252;'}).appendTo(this.header, true).css({
				'position': 'absolute',
				'top': '0',//IN
				'background':'#fccac5',
				'border-bottom':'1px solid #f44d4d',
				'border-radius': '5px 5px 0px 0px',
				'-moz-border-radius': '5px 5px 0px 0px',
				'-webkit-border-radius': '5px 5px 0px 0px',
				'width': this.options.width + 'px',//IN
				'height': (this.options.dropHeight-1) + 'px'//IN
			});
			this.chatBody = this._objView.chatBody;
			          
             //2016.03.04 新增图标图片
			//2016.03.03将name和sign和icon标记隐藏
            $.headerP= $.themesURI +'logo.png';
			this.headPic=$({tag: 'span', className:'chat-header-pic', style: $.STYLE_BODY + 'display:inline-block;float:left;margin:8px 0 0 20px;height:44px;width:36px;background:url('+ $.imageicon + ') no-repeat -382px -5px' }).appendTo(this.headBody).html('');
			//旧版样式
			//
			this.headName = $({tag: 'span', className:'chat-header-name', style: $.STYLE_BODY + 'margin:10px 0px 10px 80px;display:inline-block;float:left;height:24px;line-height:24px;max-width:220px;overflow:hidden;font-weight:bold;cursor:auto;font-size:14px;color:#f46d71;display:none;visibility:hidden;'}).appendTo(this.headBody);
			this.headIntroduce = $({tag:'span',className:'chat-header-introduce',style: $.STYLE_BODY + 'margin:20px 0px 10px 12px;display:inline-block;float:left;height:24px;line-height:24px;max-width:220px;overflow:hidden;font-weight:bold;cursor:auto;font-size:14px;color:#f44d4d;display:inline-block;visibility:visible;'}).appendTo(this.headBody).html('\u871c\u82bd\u5ba2\u670d\u4e3a\u60a8\u670d\u52a1');
			this.headSign = $({tag: 'span', className:'chat-header-sign', style: $.STYLE_BODY + 'color:#c3c3c3;margin:10px 0px 10px 10px;display:inline-block;float:left;height:20px;visibility:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:auto;display:none;'}).appendTo(this.headBody);
			this.headIcon = $({tag: 'div',  className:'chat-header-icon', style: $.STYLE_NBODY + 'visibility:hidden;border-radius:0px;overflow:hidden;background:url(' + $.imageicon + ');background-repeat:no-repeat;background-position:-374px 0; background-color:#ffffff;display:none;position:absolute;left:20px;top:0px;width:' + this.CON_ICON_WIDTH + 'px;height:' + this.CON_ICON_HEIGHT + 'px;border:1px solid #5f6467;z-index:1;'}).appendTo(this.header, true);
			
			this.leftElement = $({className: 'body-chat-tags', style: $.STYLE_NBODY + 'display:none;float:left;background:#fafafa;overflow:hidden;'}).css({
				'border-left': '1px solid #5f6467',
				'border-bottom': '1px solid #5f6467',
				'border-radius': '0px 0px 0px 5px',
				'width':  (this.options.leftElementWidth - 1) + 'px',
				'height': (this.options.height - 1) + 'px'
			}).appendTo( this.chatBody );
            //2016.03.02修改边框颜色
			this.chatContainter = $({className: 'body-chat-containter', style: $.STYLE_NBODY + 'float:left;overflow:hidden;background:#fff;'}).css({
				'border-radius': '0px 0px 0px 5px',
				'-moz-border-radius': '0px 0px 0px 5px',
				'-webkit-border-radius': '0px 0px 0px 5px',
				'padding-top':'10px',
				'padding-left':'10px',
				'width':  (+this.options.width - 10) + 'px',
				'height': (+this.options.height - 10) + 'px'
			}).appendTo( this.chatBody );
			//clear both
			$({style: $.STYLE_NBODY+'clear:both;'}).appendTo(this.chatBody);

			this.rightElement = this._objView.rightElement.css({
				width: this.options.rightElementWidth-22 + 'px',
				'border-radius': ' 0 0 5px 0',
				'background-color':'white'
				
			});
			//IN:

/*				$({className: 'ntalker-button-close', style: $.STYLE_BODY + 'background:url(' + $.imageicon + ') no-repeat -80px 0;cursor:pointer;width:20px;height:20px;float:right;color:#fff;'}).appendTo(this.rightElement.find('.window-right-head')).hover(function(){
				$(this).css('background-position', '-80px -20px');
			}, function(){
				$(this).css('background-position', '-80px 0');
			}).css({
				margin: '10px 10px 0 0'
			}).attr('title', $.lang.chat_button_close).click(function(event){
				
				self._manageMode.callToggleExpansion(self.settingid);
				});*/				
			


			this.rightSwipeContainer = $({className:'window-right-swipe',style:$.STYLE_BODY + 'width: 250px;overflow:hidden;position:relative;zoom:1;height:150px;margin:10px 0 0 10px;' }).appendTo(this.rightElement);


			






			//this.rightSwipe = $('<img src="http://img.miyabaobei.com//d1//p4//2016//07//29//15//11//151178b6475d460cf456c61f5d8e6809608981950.jpg" />'

			//).appendTo(this.rightSwipeContainer);
            //2016.03.02 修改大小和背景图片
			this.rightBody = $({className: 'window-right-body', style: $.STYLE_BODY + 'width:248px;border:1px solid #f2f2f2;'}).css({
				'height':(+this.options.height - 182) + 'px',
				'border-radius': '0px 0px 5px 0px',
				'-moz-border-radius': '0px 0px 5px 0px',
				'-webkit-border-radius': '0px 0px 0px 0px',
				//2016.03.02 增加padding 值
				'margin-top':'10px',
				'margin-left':'10px'
				
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
				background: 'url('+$.imageicon+') no-repeat -78px -58px'
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
			
			this.headBody.css('width', args.width+ 'px');
			
			this.body.css('width', ( this.options.width + (this.extended.leftElement ? this.options.leftElementWidth : 0) ) + 'px');
				this.leftElement.css({
					width: (this.options.leftElementWidth - 1) + "px",
					height:(this.options.height - 1) + "px"
				});
					this.leftBody.css('height', (this.options.height - 40) + 'px');
				this.chatContainter.css({
					width: (this.options.width - 10) + "px",
					height:(this.options.height - 10) + "px"
				});
           //2016.03.02 修改宽度
			// this.rightBody.css({
			// 	width:(this.rightElement.width - 20) + "px",
			// 	height:(this.rightElement.height - 190) + "px"
			// });
			
			//侧边栏内容区高，去除侧边栏标签区高
			//var rigthConentHeight = this.options.height - Math.max(this.rightTags.height() + parseFloat(this.rightTags.css('border-top-width')) - 1, 28);
			var rigthConentHeight = this.options.height - 217;
			//2016.03.02修改高度
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
				//2016.7.30 修改内容部分的高度
				rightContentHeight = this.options.height - 28;
			
			if( !this.rightTags ){
				//2016.03.10更改border 颜色
				this.rightTags = $({className:'window-right-tags', style: $.STYLE_NBODY + 'background:white;z-index:-1;overflow:hidden;height:37px;color:#999999;'}).appendTo(this.rightBody);
				this.rightTags.insert('<div style="' + $.STYLE_NBODY + 'clear:both;"></div>');
			}
			if( !this.rightContent){
				this.rightContent = $({className:'window-right-content', style: $.STYLE_NBODY + 'overflow:hidden;position:relative;top:-1px;z-index:1;border-radius:0px 0px 5px 0px;-moz-border-radius:0px 0px 5px 0px;-webkit-border-radius:0px 0px 0px 0px'}).appendTo(this.rightBody);
			}
			style = $.STYLE_BODY + 'margin:0 10px;text-align:center;height:34px;widdth:48px;line-height:40px;text-align:center;cursor:pointer;float:left;color:#999;';
			
			if( length == 1 ){
				style += 'width:199px;';
			}else{
				if( this.rightTags.find('div').length == 1 ){
					style += 'width:' + (length == 2 ? 98 : 62) + 'px;';
				}else if( this.rightTags.find('div').length < length ){
					style += 'width:' + (length == 2 ? 98: 62) + 'px;';//border-left:1px solid #FCE4E7;
				}else{
					style += 'width:' + (length == 2 ? 98 : 62) + 'px;';//border-left:1px solid #FCE4E7;
				}
			}
			// this.rightTags.find('div').css('width':'48px');
			tagElement = $({className: key, title: title, style: style}).appendTo(this.rightTags, this.rightTags.find('div').last()).html( title );//.gradient("top", '#F8CEDC', '#FAB2CA')
			//2016.03.02 修改高度
			tagBody = this.rightContent.insert( ['<div class="',key,' view-right-content" style="',$.STYLE_BODY,'height:100%;overflow-x:hidden;overflow-y:auto;display:none;padding-left:10px;"></div>'].join('') );
			
			



			if( $.isArray(data) ){
				//用于常见问题一类的列表形式展示内容
				//2016.03.02修改list-style的格式和margin值
				listElement = $({tag: 'ul', style: $.STYLE_BODY + 'margin:0;list-style:none;'}).appendTo(tagBody).click(function(event){
					var srcElement = $.Event.fixEvent(event).target;
					if( srcElement.tagName.toLowerCase() !== 'span' ) return;
					var title = $(srcElement).parent().attr('talk_title');
					var content= $(srcElement).parent().attr('talk_content');
					
					self._manageMode.showFAQ(self.settingid, title, content);
				});
				
				for(var i = 0; i < data.length; i++){
					//2016.03.02修改行高和字体颜色
					$({tag:'li', talk_title: data[i].title, talk_content: data[i].con, title: $.clearHtml(data[i].con || ''), style: $.STYLE_BODY + 'list-style:none;cursor:pointer;width:228px;padding:0 10px 0 0;'}).appendTo(listElement)
					
					.html( '<span style="' + $.STYLE_BODY + 'color:#525252;text-decoration:none;*height:45px;min-height:45px;line-height:45px;border-bottom:1px solid #f2f2f2;width:210px;display:block;padding: 0 10px;">' + $.clearHtml(data[i].title || '') + '</span>' );
					
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
				//debuger
			}else if( data === '{externaldata}'){//text
				$({className: 'window-right-externaldata', style: $.STYLE_BODY + 'margin:5px;'}).appendTo(tagBody);
			}else{
				$({className: 'window-right-text', style: $.STYLE_BODY + 'margin:5px;'}).appendTo(tagBody).html(data);
			}
			//新创建标签默认选中
			if( selected ){
				this._selectedTag(tagElement);
			}
			//2016.03.09使得上面的标栏显示
			//this.rightTags.display();
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
					//2016.03.10 更改选中时的颜色变化
					$(elem).addClass('talk_selected').css({'height': '34px', 'font-size':'12px','font-weight':'normal','text-align':'center','color':'#f34d4d','border-bottom':'2px solid #f44d4d'});//.gradient('top', '#F8BAC2', '#F9CDDC').css('color', '#DE7E80');
					self.rightContent.find('.'+key).display(1);
				}else{
					//$.Log('selected class:' + key + '');
					$(elem).removeClass('talk_selected').css({'height': '34px', 'border-bottom': 'none','color':'black','font-weight':'normal','font-size':'12px'});//.gradient('top', '#F8CEDC', '#FAB2CA').css('color', '#FFFFFF');
					self.rightContent.find('.'+key).display();
				}
			});
		},
		_clearTag: function(){
			this.rightBody.find("*").remove();
			this.rightTags = null;
			this.rightContent = null;
		}
	};
	
})(nTalk);