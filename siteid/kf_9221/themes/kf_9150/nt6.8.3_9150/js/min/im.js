!function(a,b){var c="nTalk-flash-element",d="ntkf_flash_impresence",e="IM_",f="JDATA_",g="machineid",h=e+"CURRENT_PAGE",i=e+"CUREENT_CONNECT",j=e+"SEND_CURRENT_PAGE_DATA",k="margin:0;padding:0;border:none;float:none;font:normal normal normal 12px/160% Arial,SimSun;",l=e+"EXIST_PAGEARR";a.im||(a.tipsicon=a.sourceURI+"images/tipsicon."+(a.browser.msie6?"gif":"png"),a.extend({CON_LCRM_FIX:"LCRM_",currentCount:0,im:{connect:null,time:3,args:null,options:null,tipElement:null,receiveMsgCount:0,isInvite:!1,start:function(){var b=this;return this.connect?void a.Log("im connected",2):(this.options={siteid:a.global.siteid,settingid:a.global.settingid,surl:a.server.flashserver,r:a.baseURI,ref:a.referrer,fsid:a.global.trailid,cid:a.global.pcid,presenceserver:a.server.presenceserver,presencegoserver:a.server.presencegoserver,t2dstatus:a.server.t2dstatus,crmcenter:a.server.crmcenter,coopserver:a.server.coopserver,loadnid:a.CON_LOAD_MODE_NID},a.user.id&&(this.options=a.merge(this.options,a.whereGet(a.user,["id","name"],["u","n"]))),void a.require({comet:"nt2.js?siteid="+a.extParmas.siteid},function(c){return c?(b.connect=new a.connectPresence(b.options,a.server.close_im_flash||"0",a.server.connect_type),a.IMPRESENCE=b.connect,a.promptwindow.callbackFocus=function(){b.onPageFocus()},a.promptwindow.callbackBlur=function(){b.onPageBlur()},a.listenMouseOutEvent(),setInterval(function(){b.intervalVerify()},5e3),void(a.moveCheck=setInterval(function(){0===a.moveTime&&1==a.currentCount&&a.moveCheckFlag&&(a.moveCheckFlag=!1,setTimeout(function(){0===a.moveTime&&1==a.currentCount&&a.showBeforeLeavePlan(),a.moveCheckFlag=!0},2e3))},1e3))):void a.Log("Loaded $comet mode failed",3)}))},callReceiveSysMessage:function(b,c){var d,e,f;switch(e=b.id||"",!b.settingid&&e&&(f=e.split("_").splice(0,2).join("_"),b.settingid=a.global.settingid.indexOf(f)>-1||f.indexOf("kf_")?a.global.settingid:f+"_9999"),b.calltype){case 10:a.browser.mobile&&a.global.pageinchat?a.isFunction(im_receiveMessage)&&im_receiveMessage(b.settingid,c):a.chatManage&&(d=a.chatManage.get(b.settingid,e))?(d.reconnect(null,e,-1),a.chatManage.callReceive(d.settingid)):3==a.server.isnoim?a.im_openInPageChat(b.settingid,"",e,{single:-1,autoconnect:!0},""):a.im.showTips(b,c);break;case 1:case 2:a.base.startLCrm(b.content);break;default:b.autoOpen||3==a.server.isnoim?(a.im&&a.im.refuseInvite(e,b.inviteid,0),a.chatManage&&(d=a.chatManage.get(b.settingid,e))?(d.reconnect(null,e,-1),a.chatManage.callReceive(d.settingid)):a.im_openInPageChat&&a.im_openInPageChat(b.settingid,"",e,{single:-1,autoconnect:1},"")):this.showTips(b,c,!0)}},onPageFocus:function(){a.IMPRESENCE.setPageFocus(!0,a.title,a.url,0),this.intervalVerify()},onPageBlur:function(){a.IMPRESENCE.setPageFocus(!1)},intervalVerify:function(){var b,c;b=a.loadLCrm(),a.each(b,function(b,d){1!=d.trigger&&a.im.connect.currentPage.get()&&(c=a.extend(d,{cw:a.currentCount}),a.base.startLCrm(c,!1,!0),a.flashData.remove(a.CON_LCRM_FIX+c.token))})},showTips:function(b,c,d){var e;this.settingid=b.settingid||a.global.settingid||"",this.destid=b.id||"",this.sessionid=b.sid||"",this.inviteid=b.inviteid||"",this.isInvite=d,"function"==typeof window.webInfoChanged&&webInfoChanged(400,'{"num":'+ ++this.receiveMsgCount+', "showNum":1}',!1),e=this.destid.split("_ISME9754_T2D_"),this.sellerid=e[0].indexOf("kf_")>-1||e[0]==a.global.siteid?"":e[0],a.require(a.tipsicon,function(b){b.error&&a.Log("cache chat icon failure",3)}),this._createTips(),this.tipElement.find(".ntalk-tips-body").html(c),this.tipElement.find(".ntalk-tips-button").html("立刻咨询"),a.promptwindow.startPrompt("",a.lang.news_new,!0)},hideTips:function(){var b=this;this.tipElement&&this.tipElement.length&&this.tipElement.hide(500,function(){a(this).remove(),b.tipElement=null})},openChat:function(){this.hideTips(),a.browser.mobile||!a.global.pageinchat?a.im_openOutPageChat(this.settingid,"",this.destid,{manual:1},"",this.sellerid):a.im_openInPageChat(this.settingid,"",this.destid,{single:-1,autoconnect:this.isInvite?-1:1,manual:1},"")},_createTips:function(){var b=this;if(!this.tipElement||!this.tipElement.length){var c=['<div class="ntalk-tips-background" style="margin:0;padding:10px;border:0;background:url(',a.tipsicon,') no-repeat 0 0;color:#333333;font:normal 12px/160% Arial,SimSun;text-align:left;height:150px;width:205px;">','<div class="ntalk-tips-body" style="margin:0;padding:0;border:0;float:left;font:normal 12px/160% Arial,SimSun;color:#333;height:60px;overflow:hidden;text-align:left;white-space:normal;width:156px;word-break:break-all;"></div>','<div class="ntalk-tips-close" style="background:url(',a.tipsicon,') no-repeat -7px -120px;margin:5px;padding:0;border:0;cursor:pointer;font:normal 1px/1px Arial;height:20px;left:166px;position:absolute;top:0px;width:20px;"></div>','<div class="ntalk-tips-button" style="background:#008CD4;margin:0;padding:0;border:0;color:#FFFFFF;cursor:pointer;height:24px;left:105px;font:normal 12px/24px Arial,SimSun;position:absolute;text-align:center;top:78px;width:69px;"></div>',"</div>"].join("");this.tipElement=a({className:"ntalk-tips-container",style:k+"width:206px;height:112px;z-index:99999;"}).appendTo(!0).fixed({right:0,bottom:0}).html(c),this.tipElement.click(function(c){a.Event.fixEvent(c).stopPropagation(),b.openChat()}),this.tipElement.find(".ntalk-tips-button").click(function(c){a.Event.fixEvent(c).stopPropagation(),b.openChat()}).hover(function(b){a(this).css("background","#007AB9")},function(b){a(this).css("background","#008CD4")}),this.tipElement.find(".ntalk-tips-close").click(function(c){a.Event.fixEvent(c).stopPropagation(),b.hideTips()}).hover(function(b){a(this).css("background-position","-27px -120px")},function(b){a(this).css("background-position","-7px -120px")})}},refuseInvite:function(b,c,d){if(!a.server.presencegoserver)return void a.Log("presencegoserver is null",2);if(!b||!c)return void a.Log("auto invite",1);var e={action:"",query:"invtrst",suid:a.user.id,duid:b,rst:d,invid:c,tk:a.global.userToken};a.require(a.server.presencegoserver+"?"+a.toURI(e)+"#rnd")}}}),a.extend({listenMouseEvent:!1,lcrmGoAwayClientY:0,lcrmGoAwayView:!1,moveTime:0,moveCheck:null,moveCheckFlag:!0,loadLCrm:function(){var b=a.flashData.get(),c={};for(var d in b)"function"!=typeof b[d]&&b[d]&&d.indexOf(a.CON_LCRM_FIX)>-1&&(c[d]=b[d]);return c},listenMouseOutEvent:function(b){var c=this,d=function(b){var d=a.Event.fixEvent(b);!d.relatedTarget&&!d.toElement||c.lcrmGoAwayView||c.setMouseOutWindow(d,!1)},e=function(b){var d=a.Event.fixEvent(b);d.relatedTarget||d.toElement||(c.setMouseOutWindow(d,!0),c.moveTime=0)},f=function(b){var d=a.Event.fixEvent(b);c.setMouseOutWindow(d,"mousemove"),null!==a.moveCheck&&(a.moveCheck=null),c.moveTime=a.getTime()};this.listenMouseEvent||a.browser.mobile||(this.listenMouseEvent=!0,b===!0?(a(document).removeEvent("mouseover",d),a(document).removeEvent("mouseout",e),a(document).removeEvent("mousemove",f)):(a(document).addEvent("mouseover",d),a(document).addEvent("mouseout",e),a(document).addEvent("mousemove",f)))},setMouseOutWindow:function(b,c){var d=this;if("mousemove"===c)return void(this.lcrmGoAwayClientY=b.clientY>0?b.clientY:this.lcrmGoAwayClientY);if(this.lcrmGoAwayView=c,b.clientY<0&&d.lcrmGoAwayClientY<50){if(1!=a.currentCount)return;setTimeout(function(){0===a.moveTime&&a.showBeforeLeavePlan()},500)}},_getExistPageList:function(){try{return a.store.get(l).split(",")}catch(b){return[]}},showBeforeLeavePlan:function(){var b,c;b=a.loadLCrm(),a.each(b,function(b,d){0!==d.trigger&&(c=a.extend(d,{trigger:0,cw:a.currentCount}),a.base.startLCrm(c,!1,!0),a.flashData.remove(a.CON_LCRM_FIX+c.token))})}}),a.extend({fIM_onPresenceReceiveSysMessage:function(b,c){return a.Log('$.fIM_onPresenceReceiveSysMessage("'+b+'", "'+a.JSON.toJSONString(c)+'")',1),setTimeout(function(){var b,d,e;d=a.clearHtml(c.substr(0,c.indexOf("ntalker://"))),e=c.substr(c.indexOf("ntalker://")+10);try{b=a.JSON.parseJSON(e)}catch(f){return void a.Log("nTalk.fIM_onPresenceReceiveSysMessage():"+f.message,3)}a.im.callReceiveSysMessage(b,d)},0),!0},fIM_onGetFlashServer:function(a,b,c,d,e,f,g){return!0},connectStatus:-1,fIM_updateUserStatus:function(b,c){return setTimeout(function(){if(a.Log("$.fIM_updateUserStatus("+b+', "'+c+'")'),a.connectStatus=b,2==a.connectStatus)try{a.IMPRESENCE.setPageFocus(!0,a.title,a.url,1)}catch(d){a.Log(d,3)}},0),!0},fIM_presenceSetIMSid:function(b){return a.Log("fIM_presenceSetIMSid(userToken:"+b+")",1),a.global.userToken=b,!0},fIM_presenceSetMyClientID:function(b){return a.url_presenceFlashGoUrl=b,!0},flashData:{debug:!1,reNumber:0,sessionData:null,checkFlash:function(b){if(a.IMPRESENCE&&a.isFunction(a.IMPRESENCE.setJSData))b.call(this);else{if(this.reNumber>3)return;this.reNumber++,setTimeout(b,500)}},add:function(b,c){c&&(c=this.filter(a.JSON.toJSONString(c),!0)),this.debug&&a.Log("$.flashData.add(k:"+b+", v:"+c+")",1),this.checkFlash(function(){try{return a.IMPRESENCE.setJSData(a.global.trailid,b,c),!0}catch(d){return!1}})},remove:function(a){this.add(a,null,!1)},clearAll:function(){this.checkFlash(function(){try{return NTKF.IMPRESENCE.setJSData("","",""),!0}catch(a){return!1}})},get:function(b){var c,d={};if(!a.IMPRESENCE||!a.IMPRESENCE.getJSData)return d;c=a.IMPRESENCE.getJSData(a.global.trailid,b||"");try{c=a.JSON.parseJSON(c)}catch(e){}if("string"==typeof c)d=a.JSON.parseJSON(this.filter(c,!1)||"{}");else for(var f in c)if(!a.isFunction(c[f]))try{d[f]=a.JSON.parseJSON(this.filter(c[f],!1))}catch(e){}return d},filter:function(a,b){return b===!0?a.replace(/\"/gi,"{sy}"):a.replace(/\{sy\}/gi,'"')}}}),a.connectPresence=a.Class.create(),a.connectPresence.prototype={name:"connectPresence",options:null,manage:null,debug:!1,data:null,switchTimeId:null,_connected:!1,currentConnectType:"",initialize:function(b,c,d){var e;switch(this.data=a.store,this.options=a.extend({nullparam:"",usemqtt:0},b),d){case"mqtt":this.options.usemqtt=1,e="WebSocket"in window||"MozWebSocket"in window?"websock":"1"==c?"comet":"fssock";break;case"rtmp":"1"==c?e="comet":a.flash.support&&(e="rtmp")}switch(e){case"websock":this.connect=this._createMqttConnect(this.options);break;case"fssock":case"rtmp":this.connect=this._createFlashConnect(this.options);break;default:this.options.usemqtt=0,this.connect=this._createCometConnect(this.options)}a.Log("new $.connectPresence(); conType: "+e+", isnoim:"+a.server.isnoim),this.connect.manage?this.manage=this.connect.manage:this.manage=new a.pageManage,this.manage.options.onChanage=function(b,c){a.currentCount=b,a.Log("page manage callback: current open window number:"+a.currentCount,1)},a.currentCount=this.manage.count,this.identid=this.manage.identid,this.connect.currentPage?this.currentPage=this.connect.currentPage:(a.Log("new $.CurrentPage("+this.identid+")",1),this.currentPage=new a.CurrentPage(this.identid,this.manage))},switchConnect:function(){this.stopSwitchConnect(),this.currentConnectType!=a.CON_CONNECT_COMET?(a.Log("Flash abnormalities, switch the connection type. this.currentConnectType:"+this.currentConnectType+" > comet",2),this.connect&&a.isFunction(this.connect.remove)&&a.flash.remove(this.connect),this.connect&&a.isFunction(this.connect.disconnect)&&this.connect.disconnect()):a.Log("Flash abnormalities",2)},stopSwitchConnect:function(){clearTimeout(this.switchTimeId),this.switchTimeId=null},setPageFocus:function(a,b,c,d){a&&this.currentPage.set(b,c)},closePresence:function(){if(this.connect)try{this.connect.closePresence()}catch(b){}this.currentConnectType==a.CON_CONNECT_FLASH&&a.flash.remove(this.connect),this.connect=null,this.manage=null},setJSData:function(a,b,c){var d;if(a=arguments[0],a&&""!==a)b=f+a+"-"+arguments[1],this.data.set(b,arguments[2]);else{d=this.data.getAll();for(var e in d)d.hasOwnProperty(e)&&e.indexOf(f)>-1&&this.data.remove(e)}},getJSData:function(b,c){var d,e={};d=this.data.getAll();for(var g in d)"function"!=typeof d[g]&&g.indexOf(f)>-1&&(e[g]=d[g]);return a.JSON.toJSONString(e)},_createFlashConnect:function(b){a.Log("$.connectPresence._createFlashConnect()",1);var e=a("#"+c),f=a.sourceURI+"fs/impresence.swf?"+a.version.im,g=a.flashHtml(d,f,b);return this.currentConnectType=a.CON_CONNECT_FLASH,e.length||(e=a(document.body).insert('<div id="'+c+'" class="nTalk-hidden-element" style="position: absolute; z-index: 9996; top: -200px;"></div>')),e.insert(g),a.browser.msie&&e.find("#"+d).display(1),e.find("#"+d).get(0)},_createCometConnect:function(b){return a.Log("$.connectPresence._createCometConnect()",1),this.currentConnectType=a.CON_CONNECT_COMET,new a.IMPresence(b)},_createMqttConnect:function(b){return a.Log("$.connectPresence._createMqttConnect()",1),this.currentConnectType=a.CON_CONNECT_COMET,new a.IMPresence(b)}},a.IMPresence=a.Class.create(),a.IMPresence.prototype={name:"IMPresence",options:null,connectParams:["userid","username","token","sessionid","nullparam","nullparam","nullparam","siteid","nullparam","nullparam","connectType","pcid","nullparam"],connect:null,debug:!1,login:!1,currentPage:null,_reCount:0,_waitTime:500,_currentConnected:!1,_waitReconnectTimeID:null,_mqttFlag:!0,initialize:function(b){var c=this;this._wsFlag=1==b.usemqtt,this.options=a.extend({nullparam:""},a.whereGet(b,["siteid","settingid","cid","surl","u","n","s","r","ref","fsid"],["siteid","settingid","pcid","serverurl","userid","username","sessionid","resourceurl","referrer","flashsessionid"])),this.data=a.store,this._reCount=0,(!this.options.pcid||this.options.pcid.length<=10)&&(this.options.pcid=this.data.get(g),(!this.options.pcid||this.options.pcid.length<=10)&&(this.options.pcid=a.base._createScriptPCID()));try{this.data.set(g,this.options.pcid)}catch(d){a.Log(d,3)}this.options.userid||(this.options.userid=a.base.userIdFix+this.options.pcid.substr(0,21)),this._callback("fIM_presenceFlashReady",[this.options.userid,this.options.pcid]);var e={onInterval:function(a,b){c._onInterval.call(c,a,b)},onChanage:function(a,b){c._onChanage.call(c,a,b)}};this.manage=new a.pageManage(e),this.identid=this.manage.identid,this.currentPage=new a.CurrentPage(this.identid,this.manage),this.setPageFocus(!0,a.title,a.url)},loginConnect:function(){var b=this,c="",d=this._toArray(this.options,this.connectParams);if(this.debug&&a.Log("im.loginConnect()"),this._callback("fIM_updateUserStatus",[1,""]),a.server.presenceserver){for(var e=a.server.presenceserver.split(";"),f=0;f<e.length;f++)e[f].indexOf("ws://")>-1&&(c=e[f]);c||(this._wsFlag=!1),this._wsFlag?this.connect=new a.mqttws({url:c,siteid:b.options.siteid,pcid:b.options.pcid,onCallback:function(){b._onCallback.apply(b,arguments)},loginMsg:a.JSON.toJSONString({method:"roomConnect",params:d})}):(this.connect=new a.comet(a.server.presencegoserver,{timeout:20,onCallback:function(){b._onCallback.apply(b,arguments)},onComplete:function(a){b._onComplete.apply(b,arguments)},onAbnormal:function(a){b._onAbnormal.apply(b,arguments)},onTimeout:function(a){b._onTimeout.apply(b,arguments)}}),this.connect.connect({action:"conn",params:d.join(",")},"callback"))}},kaliveConnect:function(){this.debug&&a.Log("$.IMPresence.kaliveConnect()",1);var b,c=this;if(this._wsFlag)b={method:"remoteKeepAlive",params:[null,this.options.userid,this.options.clientid]},this.connect.kalive(a.JSON.toJSONString(b));else{var d=this._toArray(this.options,this.connectParams);b={action:"kalive",params:d.join(","),clientid:this.options.clientid,machineid:this.options.pcid,token:this.options.token,uid:this.options.userid},setTimeout(function(){c.connect.kalive(b,"callback")},1e3)}},reconnect:function(){var b=this;++this._reCount<=3?this._waitTime=500:this._waitTime=1e3*+"034567890".charAt(Math.ceil(5*Math.random())),this.debug&&a.Log("$.IMPresence.reconnect() wait:"+this._waitTime,1),this._waitReconnectTimeID=setTimeout(function(){b.connect.reconnect()},this._waitTime)},disconnect:function(){var a=this.data.getAll();for(var b in a)"function"!=typeof a[b]&&b.indexOf(f)>-1&&this.data.remove(b);clearTimeout(this._waitReconnectTimeID),this._waitReconnectTimeID=null},LoginResult:function(a,b,c,d){this.login=a,this.options.clientid=c,this.options.token=d,this._callback("fIM_updateUserStatus",[this.login?2:0,""]),this._callback("fIM_presenceSetIMSid",[this.login?this.options.token:""]),this.login?this.kaliveConnect("call kalive"):this.reconnect("login relogin")},remoteNotifyChatWithGroup:function(b,c,d,e,f,g,h,i){var j,k,l;if(!h)return void(this.debug&&a.Log("message content is null",3));k=a.clearHtml(h.substr(0,h.indexOf("ntalker://"))),l=h.substr(h.indexOf("ntalker://")+10);try{j=a.JSON.parseJSON(l)}catch(m){}a.store.isStorageSupported?this._sendMessage2CurrenPage(k+"ntalker://"+l):this._callback("fIM_onPresenceReceiveSysMessage",[1,k+"ntalker://"+l])},remoteNotifyUserCode:function(b){a.Log("do remoteNotifyUserCode!!!")},remoteConfirmAddFriend:function(b){a.Log("do remoteConfirmAddFriend")},_handleResponse:function(b,c){this[b]?this[b].apply(this,c):a.Log("The object of the method '"+b+"' does not exist",3)},_callback:function(b,c){if(a.hasOwnProperty(b))try{a[b].apply(this,c)}catch(d){}else a.Log("nTalk."+b+"(...)",2)},_onCallback:function(b,c){var d,e=this;if(this.debug&&a.Log("$.IMPresence.onCallback(  )"),c.length)if(d=c[0],/LoginResult|LoginReslut/gi.test(d)){if(!b)return;this.LoginResult.apply(e,c.slice(1))}else this._handleResponse.call(e,d,c.slice(1)),b&&this.kaliveConnect("call kalive")},_onComplete:function(){var b=Array.prototype.slice.call(arguments);this.debug&&a.Log("$.IMPresence.onComplete( "+b[0]+","+b[1]+","+b[2]+" )"),"kalive"==b[0]?this.kaliveConnect("complete kalive"):"login"==b[0]&&this.reconnect("abnormal login")},_onAbnormal:function(){var b=Array.prototype.slice.call(arguments);this.debug&&a.Log("$.IMPresence.onAbnormal( "+b[0]+","+b[1]+","+b[2]+" )",3),"login"==b[0]?this.reconnect("abnormal login"):this.kaliveConnect("abnormal kalive")},_onTimeout:function(){var b=Array.prototype.slice.call(arguments);this.debug&&a.Log("$.IMPresence.onTimeout( "+b[0]+","+b[1]+","+b[2]+" )",3),"login"==b[0]?this.reconnect("time login"):this.kaliveConnect("timeout kalive")},_onInterval:function(b,c){if(this.currentConn=this.data.get(i)||{identid:"",time:0},this.currentConn.identid&&this.currentConn.identid===this.identid)this.currentConn.time=a.getTime(),this.data.set(i,this.currentConn),this._fireEvent("update");else{var d;if(a.isArray(c))for(var e=0;e<c.length;e++)page=c[e],page&&page[this.currentConn.identid]&&(d=!0,this._currentConnected=!0);if(this.currentConn.identid&&this.currentConn.identid!==this.identid&&!d&&(this.currentConn.identid="",this._currentConnected=!1,this._fireEvent("clear")),this.debug&&a.Log("currentConnect>>_onInterval:"+a.JSON.toJSONString(this.currentConn)+", _currentConnected:"+this._currentConnected),this.currentConn.identid&&""!==this.currentConn.identid||this._currentConnected)this._fireEvent("wait");else{this.currentConn={identid:this.identid,time:a.getTime()},this._currentConnected=!0;try{this.data.set(i,this.currentConn)}catch(f){a.Log(f,3)}this._fireEvent("add"),this.loginConnect()}}},_onChanage:function(a,b){this.pageCount=a},_fireEvent:function(b){1!=this.temp&&this.temp?this.temp>=5&&(this.temp=0):(this.temp=1,this.debug&&"wait"!==b&&a.Log(this.identid+", "+b+" long connect, curPage:"+this.currentPage.get(),2)),this.temp++,this._currentGetMessage()},_toArray:function(a,b){var c=[];if(!a)return"error";for(var d=0;d<b.length;d++)c.push(a[b[d]]||"");return c},_sendMessage2CurrenPage:function(b){var c=this.data.get(j);b&&(this.Queue||(this.Queue=new a.Queue),c?this.Queue.enQueue({data:b}):this.data.set(j,b))},_currentGetMessage:function(){var b=this.data.get(j);if(b){try{b=a.JSON.parseJSON(b)}catch(c){}if(this.currentPage.get()&&b&&(this.data.remove(j),this._callback("fIM_onPresenceReceiveSysMessage",[1,b]),this.Queue)){var d=this.Queue.deQueue();d&&this._sendMessage2CurrenPage(d.data)}}},setPageFocus:function(a,b,c,d){a===!0&&this.currentPage.set(b,c)},closePresence:function(){if(this._wsFlag)this.connect.disconnect();else try{this.cometd.disconnect(!0)}catch(a){}this.data.remove(i)},setJSData:function(){var a,b,c=arguments[0];if(c&&""!==c)b=f+c+"-"+arguments[1],this.data.set(b,arguments[2]);else{a=this.data.getAll();for(var d in a)"function"!=typeof a[d]&&d.indexOf(f)>-1&&this.data.remove(d)}},getJSData:function(){var b,c={},d=Array.prototype.slice.call(arguments,0,2).slice(0,2).join("-");if(d&&arguments[1])return a.JSON.toJSONString(this.data.get(d));b=this.data.getAll();for(var e in b)"function"!=typeof b[e]&&e.indexOf(f)>-1&&(c[e]=b[e]);return a.JSON.toJSONString(c)}},a.CurrentPage=a.Class.create(),a.CurrentPage.prototype={name:"CurrentPage",cachePageData:null,identid:"",debug:!1,manage:null,initialize:function(b,c){return b?(this.identid=b,this.manage=c,void(this.data=a.store)):void a.Log("$.CurrentPage params failed",3)},set:function(b,c){return b&&c?(this.cachePageData={identid:this.identid,title:b,url:c},this.debug&&a.Log("$.CurrentPage.set():"+a.JSON.toJSONString(this.cachePageData),1),void this.data.set(h,this.cachePageData)):(a.Log("title is null, url is null"),!1)},get:function(){var b,c=!1;if(this.cachePageData=this.data.get(h),!this.cachePageData||a.isEmptyObject(this.cachePageData))return!1;var d=a._getExistPageList();if(d.length>0){for(var e=0;e<d.length;e++)if(b=d[e],b==this.cachePageData.identid){c=!0;break}if(c===!1&&this.identid==d[d.length-1])return this.set(a.title,a.url),!0}this.debug&&(a.Log("::"+a.JSON.toJSONString(this.cachePageData)),a.Log("cache page identid:"+this.cachePageData.identid+", identid:"+this.identid+", currentPage: "+(this.cachePageData.identid==this.identid)));try{return this.cachePageData.identid==this.identid}catch(f){return!1}}})}(nTalk);