!function(a,b){a.trail||(a.trail={_trailServer:{kf_9988:"http://trailsvc.ntalker.com/trailsvc/count/trail.php?"},islogin:!1,called:!1,etype:"pv",edata:"",start:function(b,c){var d,e,f=this,g=a.referrer&&a.referrer.indexOf(a.domain)>-1;this.called&&!c||(a.Log("nTalk.trail.start()",1),this.etype=c?"update":this.etype,b||""===a.global.trailid||!g?this.islogin=1:this.islogin=0,d=this.formartData(),!a.isEmptyObject(a.global.ntalkerparam)&&a.global.ntalkerparam&&(e=a.extend({},{ntalkerparam:a.global.ntalkerparam})),e=a.extend(e,{ref:document.referrer}),a.each(d,function(b,c){f.request(f.formatURI()+a.toURI(c),e,function(b){a.Log(b,1)},b)}),this.called=!0)},request:function(b,c,d,e){c?(a.Log("nTalk.trail.request():etype:"+this.etype+";POST request URI:"+b),new a.POST(b,c,function(a,b){d.call(nTalk,"nTalk.trail: iframe["+b+"] post complete.",1)},"POST_IFRAME_"+e)):(a.Log("nTalk.trail.request():etype:"+this.etype+";POST request URI:"+b),a.require(b+"#rnd",function(){d.call(nTalk,"nTalk.trail: script get complete.",1)}))},formatURI:function(){return this._trailServer[a.global.siteid]?a.protocolFilter(this._trailServer[a.global.siteid]):a.protocolFilter(a.server.trailserver+"/userinfo.php?")},formartData:function(){var b,c=[],d={action:"save",url:a.url,siteid:a.global.siteid,uid:a.user.id,uname:a.user.name,device:a.browser.mobile?"WAP":"PC",isvip:a.global.isvip,userlevel:a.global.userlevel,cid:a.global.pcid,sid:a.global.trailid,log:this.islogin,pageid:a.base.pageid,etype:this.etype,edata:this.edata};return a.global.pagetype&&(a.url.indexOf("#")==-1?d.url+="#ntalker-pagetype="+a.global.pagetype:a.url.indexOf("?")==-1?d.url=a.enCut(a.url.replace(/#/i,"?ntalker-pagetype="+a.global.pagetype+"#"),255):d.url=a.enCut(a.url.replace(/#/i,"&ntalker-pagetype="+a.global.pagetype+"#"),255)),1==this.islogin&&(a.cache.set("tid",a.global.trailid),d=a.merge(d,{lan:a.language,scr:screen.width+"*"+screen.height,cookie:a.cookie.enable()?1:0,flash:a.flash.version})),a.Log("nTalk.trail: "+(this.islogin?"LOGIN":"LINK")+" trailid:"+a.global.trailid+", uid:"+a.user.id+", pcid:"+a.global.pcid,this.islogin?1:0),a.global.orderid.length?a.each(a.global.orderid,function(e,f){b=e>a.global.orderprice.length-1?"":a.global.orderprice[e],c.push(a.merge({},d,{orderid:f,orderprice:b,sellerid:a.global.sellerid[e]||"",ttl:a.global.title}))}):c.push(a.merge({},d,{sellerid:a.global.sellerid.length?a.global.sellerid[0]:"",ttl:a.global.title})),c}})}(nTalk);