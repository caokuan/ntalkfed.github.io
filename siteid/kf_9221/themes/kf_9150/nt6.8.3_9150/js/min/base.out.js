!function(a,b){var c="nt-flash-div",d="ntkf_flash_ntid",e=["kf_9933","kf_9949","kf_9954"],f=2,g=function(){},h=/[a-z]{2}\_\d+/gi,i=/[a-z]{2}\_\d+\_\d+/gi;a.baseURI||(a.baseURI=a.pageURI),a.base||(a.extend({CON_LOAD_MODE_NID:1,CON_CUSTOMER_ID:0,CON_GROUP_ID:1,CON_VISITOR_ID:2,CON_SHORT_ID:3}),a.base={_complete:!1,_connectTimeID:null,clearChatCache:!1,timeOut:2e3,entityList:{"<":"&lt;",">":"&gt;"},fieldList:["shortid","uid","uname","isvip","userlevel","itemid","itemparam","erpparam","exparams"],CON_LOCAL_FIX:"NOWAIT_",start:function(){var b;if(!a.server)return void a.Log("Loaded $server mode failed",3);if(a.cookie.enable()||a.Log("Does not support cookies!",2),a.global.pageinchat=!1,a.global.statictis=f,a.global.mobile=a.browser.mobile,a.browser.mobile=!("mobilechat.html"!=a.pageName&&!window.mobile),this._complete=!1,a.global.connect=a.CON_CONNECT_COMET,this.pageid=a.getTime(),this._loadQueryString(),!a.global.siteid||!a.global.settingid)return void a.Log("base params failed",3);this._loadFlashServer();var c=this,d=a.browser.mobile?"wap":"out";this._loadIdentityID(function(b,d){a.Log("PCID:"+d,1),c._startOtherMode(b,d)}),b={lang:(a.global.lan||"zh_cn")+".js"+a.baseExt},a.browser.supportMqtt&&a.server.tchatmqttserver&&1==a.server.tchatConnectType?(b.MQTT="mqtt31.js"+a.baseExt,b.Connection="mqtt.chat.js"+a.baseExt):!a.browser.mobile&&a.flash.support&&a.server.tchatmqttserver&&1==a.server.tchatConnectType?(b.MQTT="flashsock.js"+a.baseExt,b.Connection="mqtt.chat.js"+a.baseExt):b.TChat="comet.chat.js"+a.baseExt,a.global.themes?(b.chatManage="chat.js"+a.baseExt,b.chatManageView=a.global.themes+"/chat.view."+d+".js"+a.baseExt,a.themesURI=a.global.themes+"/images/"):"wap"===d?b.chatManage="chat.js"+a.baseExt:b.chatManage="chat."+d+".js"+a.baseExt,1==parseFloat(a.server.robot)&&(b.Robot="robot.js"+a.baseExt),a.require(b,function(b,c){return c?void(a.chatManage.open(a.global.settingid,a.global.destid,a.global.itemid,a.global.itemparam,a.global.sellerid,!1,a.global.single)&&a.cache.set("opd",1)):void a.Log("Loaded module failed",3)})},startIM:function(){a.im&&a.im.connect||(a.Log("start im service"),a.require({im:"im.js"+a.baseExt},function(b){return b?void a.im.start():void a.Log("Loaded $im mode failed",3)}))},startAudio:function(){a.browser.mobile&&a.require({Audio:"audio.js"+a.baseExt},function(b){return b?void(a.Audio.support()===!1&&a.Log("Browser does not support audio.",2)):void a.Log("Loaded $Audio mode failed",3)})},startEntrance:function(b){var c=a.server.entranceConfig[a.global.settingid]||"";a.Log("$.base.startEntrance("+b+")//iconId"),c&&a.server.entranceConfig&&!a.isEmptyObject(a.server.entranceConfig)&&a.require({entrance:c+a.baseExt},function(b){if(!b)return void a.Log("Load $.entrance mode failed",3);if("0"!=a.server.enable_entrance&&a.options.entrance){if("2"==a.server.enable_entrance&&a.browser.mobile)return;a.entrance.start("entrance")}})},_loadQueryString:function(){var b,c={vip:0};if(a.merge(c,a.hashParams,a.params),"object"==typeof window.globalQueryParams&&a.merge(c,window.globalQueryParams),a.global=a.whereGetTo(a.global,c,["siteid","sellerid","settingid","uid","uname","exparams","single","pcid","themes","vip","ulevel","ref","tit","itemid","itemparam","orderid","orderprice","erpparam","ntalkerparam","pagetype","lan","destid"],[null,null,null,"uid","uname","exparams","single","pcid","themes","isvip","userlevel","source","title"]),window.globalQueryParams&&(a.global.message=window.globalQueryParams.message,1==a.global.message&&(a.global.opId=window.globalQueryParams.opId)),a.global.siteid=a.global.siteid&&h.test(a.global.siteid)?a.global.siteid:a.extParmas.siteid||"",a.global.settingid=a.global.settingid&&i.test(a.global.settingid)?a.global.settingid:"",a.global.settingid&&!a.global.siteid&&(a.global.siteid=a.global.settingid.split("_").splice(0,2).join("_")),a.global.shortid=a.enCut(this.toShortID(a.global.uid),64-a.enLength(a.global.siteid)-10),!a.global.shortid||/^guest(.*?)/gi.test(a.global.shortid)&&21==a.global.shortid.length||/^(undefined|null|0)$/gi.test(a.global.uname)?a.global.uname="":a.global.uname&&(a.global.uname=a.enCut(a.global.uname,32)),a.inArray(a.global.siteid,e)>-1&&(a.global.shortid=a.global.uname||""),a.global.uid=this.toLongID(a.global.shortid),a.global.isvip=a.isNumeric(a.global.isvip)?a.global.isvip:a.isNumeric(a.global.userlevel)?a.global.userlevel:0,a.global.userlevel=a.isNumeric(a.global.userlevel)?a.global.userlevel:0,a.global.lan=a.extParmas.lan||a.global.lan||"zh_cn",a.source=a.global.source,a.global.sellerid||(b=a.global.settingid.split("_").splice(0,2).join("_"),a.global.sellerid=b==a.global.siteid?"":b),a.global.exparams)try{a.global.exparams=a.JSON.parseJSON(a.global.exparams)}catch(d){}return a.global=this.filterJSONChar(a.global),a.Log("global: "+a.JSON.toJSONString(a.global),1),a.global},toShortID:function(b){var c=this.checkID(b);return c===a.CON_SHORT_ID?b:c===a.CON_VISITOR_ID?b.split("_ISME9754_")[1]:""},toLongID:function(b){var c=this.checkID(b);return c===a.CON_SHORT_ID?a.global.siteid+"_ISME9754_"+b:c==a.CON_VISITOR_ID?b:""},checkID:function(b){return b=""+b,!(!b||"0"==b)&&(b.indexOf("_ISME9754_T2D")>-1?a.CON_CUSTOMER_ID:b.indexOf("_ISME9754_GT2D")>-1?a.CON_GROUP_ID:b.indexOf(a.global.siteid+"_ISME9754_")>-1?a.CON_VISITOR_ID:a.CON_SHORT_ID)},_startOtherMode:function(b,c){clearTimeout(this._connectTimeID),this._connectTimeID=null,a.global.pcid=c,a.user.id=b,a.isDefined(a.global.uname)&&(a.user.name=a.global.uname),a.cache.set("uid",b),a.cookie.set(a.CON_PCID_KEY,c,63072e6),!a.server.isnoim||2===a.server.isnoim&&("1"==a.cache.get("opd")||a.browser.mobile)?this.startIM():a.Log("no load im, isnoim:"+a.server.isnoim,1),this.startAudio(),this._complete=!0},_filterChar:function(b,c){var d,e,f=[];c&&a.each(this.entityList,function(a,c){try{d=new RegExp(a,"gi"),b=b.replace(d,c)}catch(e){}});for(var g=0,h=b.length;g<h;g++)try{e=encodeURIComponent(b.charAt(g)),f.push(b.charAt(g))}catch(i){try{e=encodeURIComponent(b.charAt(g)+b.charAt(g+1)),f.push((f.length?" ":"")+e.replace(/%/gi,"")+(g+2>=h?"":" ")),++g}catch(j){f.push(b.charAt(g))}}return f.join("")},filterJSONChar:function(b,c,d){var e;if(d=d||!1,a.isObject(b)){e={};for(var f in b)e[f]=this.filterJSONChar(b[f],f)}else if(a.isArray(b)){e=[];for(var g=0;g<b.length;g++)e[g]=this.filterJSONChar(b[g],g)}else e="string"==typeof b?this._filterChar(b,a.inArray(c,this.fieldList)!=-1):b;return e},_loadIdentityID:function(b){var c,d=this,e=a.global.pcid||a.cookie.get(a.CON_PCID_KEY);this.userIdFix=a.global.siteid+"_ISME9754_",e&&e.length>10?(c=a.global.uid&&a.global.uid.indexOf(a.global.siteid)>-1?a.global.uid:this.userIdFix+e.substr(0,21),a.Log("load PCID:"+e+", uid:"+c),b.call(this,c,e)):a.flash.support&&!a.browser.mobile?(this._createNTID({u:a.global.uid,siteid:a.global.siteid,loadnid:a.CON_LOAD_MODE_NID}),e=this._createScriptPCID(!0),a.Log("create flash PCID, tmp pcid:"+e),c=a.global.uid||this.userIdFix+e.substr(0,21),a.global.pcid=e,a.user.id=c,this._connectTimeID=setTimeout(function(){a.global.connect=a.CON_CONNECT_COMET,a.Log("timeout:"+d.timeOut+" no create pcid",2),b.call(this,c,e)},this.timeOut)):(e=this._createScriptPCID(),a.Log("create script PCID"),c=a.global.uid||this.userIdFix+e.substr(0,21),b.call(this,c,e))},_createNTID:function(b){var e=a.flashHtml(d,a.sourceURI+"fs/NTID.swf?"+a.version.ntid,b);e='<div id="'+c+'" style="position: absolute; z-index: 9996; top: -200px;">'+e+"</div>",a(document.body).insert(e)},_createScriptPCID:function(b){return"guest"+[b?"TEMP"+a.randomChar(4):a.randomChar(8),a.randomChar(4),a.randomChar(4),a.randomChar(4),a.getTime().toString(16).toUpperCase().substr(-8)+a.randomChar(4)].join("-")},_loadFlashServer:function(){a.Log("start load flashserver."),a.require({flashserver:a.server.flashserver+"/func/getflashserver.php?"+a.toURI({resulttype:1,siteid:a.global.siteid,callbackname:"nTalk._callFlashServer"})+"#rnd"},function(b){b&&(a.server=a.protocolFilter(a.extend(a.server,b)),a.Log("$flashserver is loaded."))})},showLoading:function(){a.base.chatLoading=!0,a.base.startTime=a.getTime();return this.loadingElement&&this.loadingElement.length?this.loadingElement.display(1):(this.loadingElement=a({id:"ntalk-chat-loading",style:"margin:0;padding:0;float:none;background:none;width:100%;height:33px;position:fixed:right:0;bottom:0;z-index:9999;font:normal normal normal 0px/0px Arial,SimSun;"}).appendTo(!0).fixed({right:0,bottom:0}).html('<div class="ntalk-chat-loading-pic" style="margin:0 auto;padding:0;float:none;width:99px;height:33px;background:url('+a.imageloading+') no-repeat 0 0;"></div>'),a.browser.mobile&&this.LoadingGif()),this.loadingElement},LoadingGif:function(){a("#ntalk-chat-loading").css("height","100%"),a(".ntalk-chat-loading-pic").display(),a("#ntalk-chat-loading").append(' <img src="'+a.sourceURI+'images/m-loading.gif" style="position:absolute;top:50%;left:50%;margin:-11px 0px 0px -11px;width:22px;height:22px">')},hiddenLoading:function(){this.loadingElement.display(),a.base.endTime=a.getTime(),a.base.chatLoading=!1,a.Log("loaded time:"+(a.base.endTime-a.base.startTime),1)}},a.extend({_callFlashServer:function(b,c){a.flashserver=b,a.server=a.protocolFilter(a.extend(a.server,a.flashserver)),a.Log("$flashserver loading is complete.")},fIM_presenceFlashReady:function(b,c){return setTimeout(function(){a.base._complete?(a.Log("$.fIM_presenceFlashReady()"),a.Event.fireEvent(document,"focus")||a.Event.fireEvent(document,"click"),a.im&&a.im.connect&&a.im.connect.stopSwitchConnect()):(a.Log(">RETURN flash PCID, uid:"+b+", pcid:"+c,1),b&&c&&a.base._startOtherMode(b,c))},0),!0},addMobileStyle:function(a){var b=document.head||document.getElementsByTagName("head")[0],c=document.createElement("style");c.type="text/css",c.styleSheet?c.styleSheet.cssText=a:c.appendChild(document.createTextNode(a)),b.appendChild(c)}}),a.extend({enableDebug:function(){return a.cache.get("debug")||a.cache.set("debug",2),a.mDebug||a.require({mDebug:"debug.js"+a.baseExt,Window:"nt2.js"+a.baseExt},function(b,c){b&&!b.error&&(a.mDebug.initialize(),a.Log=a.mDebug.Log,a.debug=a.mDebug)}),a.cache.get("debug")}}),a.ready(function(){return a.isDefined(CON_SERVER)?(a.imageloading=a.sourceURI+"images/loading.gif",a.server=a.extend({},a.protocolFilter(CON_SERVER)),a.version=a.extend({},a.version,CON_VERSION),a.baseExt="?siteid="+a.extParmas.siteid+"&v="+a.version.dir+"&t="+a.version.release,parseFloat(a.params["ntalker-debug"])>0||+a.cache.get("debug")>0?a.require({mDebug:"debug.js"+a.baseExt,Window:"nt2.js"+a.baseExt},function(b,c){b&&!b.error&&(a.mDebug.initialize(),a.Log=a.mDebug.Log,a.debug=a.mDebug,a.base.start())}):(a.Log=g,a.debug={Log:a.Log},a.base.start()),void a.require(a.imageloading)):void alert("CON_SERVER is not defined")}))}(nTalk);