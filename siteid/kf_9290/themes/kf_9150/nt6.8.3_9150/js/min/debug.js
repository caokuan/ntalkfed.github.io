!function(a,b){if(!a.mDebug){var c=0,d=0,e=0,f=[["DEBUG","#64C864"],["INFO","#000000"],["WARN","#0000FF"],["ERROR","#FF8C00"],["FATAL","#FF0000"],["NONE","#333333"]],g=new a.HASH;a.mDebug={name:"mDebug",objWindow:null,body:null,enable:0,level:0,hashCache:null,initialize:function(){d=+(a.params["ntalker-debug"]||a.cache.get("debug")||0),e=+(a.params["ntalker-level"]||a.cache.get("level")||0),a.mDebug.create(),this.hashCache=g},create:function(){2!=d&&(a(".nTalk-debug-window").length?a.mDebug.body=a(".nTalk-debug-window").find(".ntalk-chat-body"):a.Window&&(this.objWindow=new a.Window({className:"nTalk-debug-window",dropHeight:25,width:a.browser.mobile?320:380,height:250,minWidth:280,minHeight:120,leftChatWidth:400,rightWinWidth:0,drag:!0,resize:!0,fixed:!0,zIndex:2147483647,left:0,top:40}),this.objWindow.containter.css({background:"#fafafa",border:"1px solid #ccc"}),this.objWindow.header.css("background","#efefef"),this.objWindow.buttonMax.display(),this.objWindow.buttonMin.display(),a({className:"window-button-clear",style:a.STYLE_BODY+this.objWindow.buttonClose.cssText()+"width:auto;margin-right:10px;"}).appendTo(this.objWindow.header).html("Clear").hover(function(){a(this).css("color","#fff")},function(){a(this).css("color","#333")}).click(function(b){a.Event.fixEvent(b).stopPropagation(),a.mDebug.body.html("")}).display(1),a({className:"window-button-copy",style:a.STYLE_BODY+this.objWindow.buttonClose.cssText()+"width:auto;margin-right:10px;"}).appendTo(this.objWindow.header).html("Copy").hover(function(){a(this).css("color","#fff")},function(){a(this).css("color","#333")}).click(function(b){a.Event.fixEvent(b).stopPropagation();var c=a.clearHtml(a.mDebug.body.html());a.mDebug.copy_clip(c)}).display(1),this.objWindow.buttonClose.hover(function(){a(this).css("color","#fff")},function(){a(this).css("color","#333")}).css("width","auto").html("Close"),a.mDebug.body=this.objWindow.chatBody.css({"overflow-y":"scroll","overflow-x":"hidden"})))},Log:function(b,c){var h,i=c||0,j=a.formatDate("dd HH:mm:ss.S");if(d&&!(i<e))return h=j+" - ["+f[i][0]+"] - ",h+="object"==typeof b?b.message?b.message+" - "+b.fileName+"("+(b.lineNumber?b.lineNumber:b.number||"unknown")+")":a.JSON.toJSONString(b):b,g.add(j,h),window.console&&2==d?a.mDebug.winLog(h,i):(a.mDebug.create(),a.mDebug.body?a.mDebug.divLog(h,i):void 0)},divLog:function(b,d){return a.mDebug.body.length||console&&console.log&&console.log(b),a({style:a.STYLE_BODY+"color:"+f[d][1]+";background-color:"+(c%2===0?"#fafafa":"#FFFFFF")+";"}).appendTo(a.mDebug.body).html(b),a.mDebug.body.scrollTop(a.mDebug.body.scrollHeight()),c++,b},winLog:function(a,b){switch(f[b][0].toLowerCase()){case"debug":window.console.debug?window.console.debug(a):window.console.info&&window.console.info(a);break;case"info":window.console.info&&window.console.info(a);break;case"warn":window.console.warn&&window.console.warn(a);break;case"fatal":case"error":window.console.warn&&window.console.warn(a);break;default:window.console.log&&window.console.log(a)}return a},copy_clip:function(a){if(window.clipboardData)window.clipboardData.clearData(),window.clipboardData.setData("Text",a);else if(navigator.userAgent.indexOf("Opera")!=-1)window.location=a;else if(window.netscape){try{netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")}catch(b){return alert("about:config >> signed.applets.codebase_principal_support=true"),!1}var c=Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);if(!c)return;var d=Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);if(!d)return;d.addDataFlavor("text/unicode");var e=Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString),f=a;e.data=f,d.setTransferData("text/unicode",e,2*f.length);var g=Components.interfaces.nsIClipboard;if(!c)return!1;c.setData(d,null,g.kGlobalClipboard)}},submitLog:function(c){var d=[];if(typeof c!==b&&0!==g.count())return g.each(function(a,b){d.push(b+"\n")}),new a.POST(c,{action:"savelog",data:d.join("")},[function(){a.Log("Submit a log file successfully",1)},function(){a.Log("Failure to submit the log file",3)}]),!0}}}}(nTalk);