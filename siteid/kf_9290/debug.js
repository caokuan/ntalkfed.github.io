;(function($, underfined){
	/*
	 * debug mode test
	 * rely: Element, sessionData, lockPosition, JSON, POST
	 * #09.17	修改模块名称，兼容老板
	 **/
	if( $.mDebug ){
		return;
	}
	var debug_line	= 0,
		debug_enable = 0,
		debug_level  = 0,
		debug_const	= [
			['DEBUG', '#64C864'],
			['INFO',  '#000000'],
			['WARN',  '#0000FF'],
			['ERROR', '#FF8C00'],
			['FATAL', '#FF0000'],
			['NONE',  '#333333']
		],
		debug_cache = new $.HASH()
	;
	$.mDebug = { /*-debug-*/
		name: 'mDebug',
		objWindow: null,
		body: null,
		enable: 0,
		level:	0,
		hashCache: null,
		initialize: function(){
			debug_enable= +($.params['ntalker-debug'] || $.cache.get('debug') || 0);
			debug_level	= +($.params['ntalker-level'] || $.cache.get('level') || 0);

			$.mDebug.create();
			this.hashCache = debug_cache;
		},
		create: function(){
			if( debug_enable == 2 ) return;

			if( $('.nTalk-debug-window').length ){
				$.mDebug.body = $('.nTalk-debug-window').find('.ntalk-chat-body');
			}
			else if( $.Window ){
				this.objWindow = new $.Window({
					className:		'nTalk-debug-window',
					dropHeight:		25,
					width:			$.browser.mobile ? 320 : 380,
					height:			250,
					minWidth:		280,
					minHeight:		120,
					leftChatWidth:	400,
					rightWinWidth:	0,
					drag:			true,
					resize:			true,
					fixed:			true,
					zIndex:			2147483647,
					left:			0,
					top:			40
				});
				this.objWindow.containter.css({'background': '#fafafa', 'border': '1px solid #ccc'});
				this.objWindow.header.css('background', '#efefef');
				this.objWindow.buttonMax.display();
				this.objWindow.buttonMin.display();
				
				$({className:'window-button-clear', style: $.STYLE_BODY + this.objWindow.buttonClose.cssText() + 'width:auto;margin-right:10px;'}).appendTo(this.objWindow.header).html('Clear')
				.hover(function(){
					$(this).css('color', '#fff');
				}, function(){
					$(this).css('color', '#333');
				}).click(function(event){
					$.Event.fixEvent(event).stopPropagation();
					$.mDebug.body.html('');
				}).display(1);
				
				$({className:'window-button-copy', style: $.STYLE_BODY + this.objWindow.buttonClose.cssText() + 'width:auto;margin-right:10px;'}).appendTo(this.objWindow.header).html('Copy')
				.hover(function(){
					$(this).css('color', '#fff');
				}, function(){
					$(this).css('color', '#333');
				}).click(function(event){
					$.Event.fixEvent(event).stopPropagation();
					var logText = $.clearHtml($.mDebug.body.html());
					$.mDebug.copy_clip( logText );
				}).display(1);
				
				this.objWindow.buttonClose.hover(function(){
					$(this).css('color', '#fff');
				}, function(){
					$(this).css('color', '#333');
				}).css('width', 'auto').html('Close');
				$.mDebug.body = this.objWindow.chatBody.css({'overflow-y': 'scroll', 'overflow-x': 'hidden'});
			}
		},
		Log: function(error, l){
			var logText, level =  l || 0, time = $.formatDate('dd HH:mm:ss.S');
			
			if( !debug_enable || level < debug_level ) return;
			
			logText = time + ' - [' + debug_const[level][0] + '] - ';

			if( typeof error=='object' ){
				if( error.message ){
					logText += error.message + ' - ' + error.fileName + '(' + (error.lineNumber ? error.lineNumber : (error.number || 'unknown')) + ')';
				}else{
					logText += $.JSON.toJSONString(error);
				}
			}else{
				logText += error;
			}
			debug_cache.add(time, logText);
			
			if( window.console && debug_enable == 2 ){
				return $.mDebug.winLog(logText, level);
			}else{
				$.mDebug.create();

				if( $.mDebug.body ){
					return $.mDebug.divLog(logText, level);
				}
			}
		},
		divLog: function(error, l){
			if( !$.mDebug.body.length ){
				if( console && console.log ) console.log(error);
			}
			$({style: $.STYLE_BODY + 'color:' + debug_const[l][1] + ';background-color:' + (debug_line%2 === 0 ? "#fafafa" : "#FFFFFF") + ';'}).appendTo($.mDebug.body).html(error);
			
			$.mDebug.body.scrollTop( $.mDebug.body.scrollHeight() );
			
			debug_line++;

			return error;
		},
		winLog: function(error, l){
			switch( debug_const[l][0].toLowerCase()  ){
				case 'debug':
					if( window.console.debug )
						window.console.debug(error);
					else if(window.console.info)
						window.console.info(error);
					break;
				case 'info':
					if(window.console.info)
						window.console.info(error);
					break;
				case 'warn':
					if(window.console.warn)
						window.console.warn(error);
					break;
				case 'fatal':
				case 'error':
					if(window.console.warn)
						window.console.warn(error);
					break;
				default:
					if( window.console.log )
						window.console.log(error);
			}
			return error;
		},
		copy_clip: function(txt) {
			if (window.clipboardData) {
				window.clipboardData.clearData();
				window.clipboardData.setData("Text", txt);
			} else if (navigator.userAgent.indexOf("Opera") != -1) {
				window.location = txt;
			} else if (window.netscape) {
				try {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				} catch (e) {
					alert("about:config >> signed.applets.codebase_principal_support=true");
					return false;
				}
				var clip = Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);
				if (!clip) return;
				var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
				if (!trans) return;
				trans.addDataFlavor('text/unicode');
				var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
				var copytext = txt;
				str.data = copytext;
				trans.setTransferData("text/unicode", str, copytext.length * 2);
				var clipid = Components.interfaces.nsIClipboard;
				if (!clip) return false;
				clip.setData(trans, null, clipid.kGlobalClipboard);
			}
		},
		submitLog: function(uri){
			var logText = [];
			if( typeof uri === underfined || debug_cache.count() === 0 ){
				return;
			}
			debug_cache.each(function(k, v){
				logText.push(v + '\n');
			});
			
			new $.POST(uri, {
					action: 'savelog',
					data: logText.join('')
				}, [
					function(){
						$.Log('Submit a log file successfully', 1);
					},
					function(){
						$.Log('Failure to submit the log file', 3);
					}
				]);
			return true;
		}
	};
})(nTalk);