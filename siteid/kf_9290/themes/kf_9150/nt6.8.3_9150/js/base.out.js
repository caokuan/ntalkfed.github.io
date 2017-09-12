;(function($, undefined){
	var CON_FLASH_DIV	= 'nt-flash-div',
		CON_NT_ID		= 'ntkf_flash_ntid',
		CON_N2ID		= ['kf_9933','kf_9949', 'kf_9954'],
		//统计: 0:!0|1|2|4|5|6|7|8|18|19|20|21;1:all; 2:!10|11|12|13|22|23
		CON_STATICTIS	= 2,
        emptyFunc = function(){},
		rSiteidExp = /[a-z]{2}\_\d+/ig,
		rSettingIdExp = /[a-z]{2}\_\d+\_\d+/ig
	;

	if( !$.baseURI ){
		$.baseURI = $.pageURI;
	}

	if( $.base ){
		return;
	}

	$.extend({
		//2014.10.14
		//可配置项，配置是否加载NID.swf模块,默认值：1(加载)
		CON_LOAD_MODE_NID: 1,
		CON_CUSTOMER_ID: 0,
		CON_GROUP_ID:    1,
		CON_VISITOR_ID:  2,
		CON_SHORT_ID:    3
	});

	$.base = {
		_complete:  false,
		_connectTimeID: null,
		clearChatCache: false,
		timeOut: 2000, //超时保护
		entityList: {
			'<':	'&lt;',
			'>':	'&gt;'
		},
		fieldList: ['shortid','uid','uname','isvip','userlevel','itemid','itemparam','erpparam','exparams'],
		CON_LOCAL_FIX: 'NOWAIT_',
		start: function(){
			var scriptList;

			if( !$.server ){
				$.Log( 'Loaded $server mode failed' , 3);
				return;
			}
			if( !$.cookie.enable() ){
				$.Log( 'Does not support cookies!' , 2);
			}
			$.global.pageinchat = false;
			$.global.statictis	= CON_STATICTIS;
			$.global.mobile     = $.browser.mobile;
			$.browser.mobile	= $.pageName=='mobilechat.html'||window.mobile ? true : false;
			this._complete		= false;

			//移动页面COMET连接
			$.global.connect = $.CON_CONNECT_COMET;

			//每次加载脚本时以当前时间戳创建一个当前页ID作为身份标识
			this.pageid = $.getTime();
			//加载参数
			this._loadQueryString();

			if( !$.global.siteid || !$.global.settingid ){
				$.Log('base params failed', 3);
				return;
			}

			//验证加载flashserver地址
			this._loadFlashServer();

			var self  = this,
				ftype = $.browser.mobile ? 'wap' : 'out'
			;
			this._loadIdentityID(function( uid, pcid){

				$.Log('PCID:' + pcid, 1);

				// cookie中获取或通过脚本创建时
				self._startOtherMode(uid, pcid);
			});

			scriptList = {
				lang: ($.global.lan || 'zh_cn') + '.js' + $.baseExt
			};

			//2015-05-03 增加tchatConnectType开关，用来控制是否使用mqtt
			if( $.browser.supportMqtt && $.server.tchatmqttserver && $.server.tchatConnectType == 1 ){
			    scriptList.MQTT       = 'mqtt31.js' + $.baseExt;
			    scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
			//2016-04-28 移动端不支持webSock时，直接通过commet连接服务器
			}else if( !$.browser.mobile && $.flash.support && $.server.tchatmqttserver && $.server.tchatConnectType == 1 ){
                scriptList.MQTT  = 'flashsock.js' + $.baseExt;
                scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
            }else{
			   scriptList.TChat = 'comet.chat.js' + $.baseExt;
			}
			//2015.10.09 添加开发工具支持，允许在本地调用聊窗脚本
			if( $.global.themes ){
				scriptList.chatManage = 'chat.js' + $.baseExt;
				scriptList.chatManageView = $.global.themes + '/chat.view.' + ftype + '.js' + $.baseExt;

				$.themesURI = $.global.themes + '/images/';
			}else if( ftype === "wap" ) {
				//(6.8.2合版) wap默认不加载视图文件，在chat.js中再做判断
                                //20160425,wap聊窗默认加载不含主题的chat文件
				scriptList.chatManage = 'chat.js' + $.baseExt;
			}else{
				scriptList.chatManage = 'chat.' + ftype + '.js' + $.baseExt;
			}
			if( parseFloat( $.server.robot ) == 1 ){
				scriptList.Robot = 'robot.js' + $.baseExt;
			}

			//加载语言包、视图
			$.require(scriptList, function(lang, module){
				if( !module ){
					$.Log('Loaded module failed', 3);
					return;
				}
				if( $.chatManage.open($.global.settingid, $.global.destid, $.global.itemid, $.global.itemparam, $.global.sellerid, false/*autoconnect*/, $.global.single/*single*/) ){
					$.cache.set('opd', 1);
				}
			});
		},
		/**
		 * [startIM description]
		 * @return {[type]} [description]
		 */
		startIM: function(){
			//连接已创建，不再重复执行
			if( $.im && $.im.connect ){
				return;
			}
			$.Log('start im service');
			//Opened the chat window

			$.require({
				im: 'im.js' + $.baseExt
			}, function(im){
				if( !im ){
					$.Log('Loaded $im mode failed', 3);
					return;
				}
				$.im.start();
			});
		},
		startAudio: function(){
			if( !$.browser.mobile ){
				return;
			}

			$.require({
				Audio: 'audio.js' + $.baseExt
			}, function(Audio){
				if( !Audio ){
					$.Log('Loaded $Audio mode failed', 3);
					return;
				}
				if( $.Audio.support() === false ){
					$.Log('Browser does not support audio.', 2);
				}
			});
		},
        /**
         * @method startEntrance 加载邀请模块
         * @param  {string} iconId    入口配置ID
         * ////////////////////////////////////////////////
         * @config array entranceConfig
         *         $settingid => $entrance_file
         */
        startEntrance: function(iconId){
            var entranceFile = $.server.entranceConfig[ $.global.settingid ] || "";
            $.Log('$.base.startEntrance(' + iconId + ')//iconId');

            if( !entranceFile || !$.server.entranceConfig || $.isEmptyObject($.server.entranceConfig) ){
                return;
            }

            $.require({
                entrance: entranceFile + $.baseExt
            }, function(entrance){
                if( !entrance ){
                    $.Log('Load $.entrance mode failed', 3);
                    return;
                }
                if( $.server.enable_entrance != "0" && $.options.entrance ){
                	//enable_entrance为2代表，移动端不开启入口
                	if($.server.enable_entrance == "2" && $.browser.mobile) {
						return;
					}
                    $.entrance.start('entrance');
                }
            });
        },
		_loadQueryString: function(){
			var tmpsiteid, target = {vip: 0};

			//兼容正常url参数、hash传递参数、POST到php页面的参数
			$.merge(target, $.hashParams, $.params);
			if( typeof window.globalQueryParams == 'object' ){
				$.merge(target, window.globalQueryParams);
			}

			$.global = $.whereGetTo($.global, target, [
				'siteid', 'sellerid', 'settingid', 'uid', 'uname', 'exparams','single','pcid','themes',
				'vip',				/*-是否是VIP用户-*/
				'ulevel',			/*-用户级别-*/
				'ref',
				'tit',
				'itemid', 'itemparam',	/*-商品(老版本)-*/
				'orderid', 'orderprice',/*-订单-*/
				'erpparam',				/*-ERP参数-*/
				'ntalkerparam',			/*-新版商品信息-*/
				'pagetype',				/*-页面类型，特殊参数，传入轨迹服务-*/
				'lan', 'destid'
			], [
				null, null, null, 'uid', 'uname','exparams','single','pcid','themes',
				'isvip',
				'userlevel',
				'source',
				'title'
			]);
			//微信机器人排队进入留言时，需要获取此参数
			//因为老式集成有可能没有window.globalQueryParams参数，所以添加校验
			if(window.globalQueryParams) {
				$.global.message = window.globalQueryParams.message;

				if($.global.message == 1){
					$.global.opId = window.globalQueryParams.opId;
				}
			}

			$.global.siteid    = $.global.siteid&&rSiteidExp.test($.global.siteid) ? $.global.siteid : ($.extParmas.siteid || '');
			$.global.settingid = $.global.settingid&&rSettingIdExp.test($.global.settingid) ? $.global.settingid : '';
			if( $.global.settingid && !$.global.siteid ){
				$.global.siteid= $.global.settingid.split('_').splice(0,2).join('_');
			}
			$.global.shortid   = $.enCut(this.toShortID( $.global.uid ), 64 - $.enLength($.global.siteid) - 10);
			//(6.8.2合版) base.out.js 中对uname的处理正则有问题
			//2015.08.31 修正对uname的处理，当siteid不在CON_N2ID中的时候，uname赋值为空
			if( !$.global.shortid || (/^guest(.*?)/ig.test($.global.shortid)&&$.global.shortid.length==21) || /^(undefined|null|0)$/gi.test($.global.uname) ){
			    //用户ID是访客ID或为空，用户名为空
			    $.global.uname = "";
			}else if( $.global.uname ){
			    $.global.uname = $.enCut($.global.uname, 32);
			}
			if( $.inArray( $.global.siteid, CON_N2ID ) > -1 ){
			    $.global.shortid = $.global.uname || "";
			}
			$.global.uid       = this.toLongID( $.global.shortid );
			$.global.isvip     = $.isNumeric($.global.isvip) ? $.global.isvip : $.isNumeric($.global.userlevel) ? $.global.userlevel : 0;
			$.global.userlevel = $.isNumeric($.global.userlevel) ? $.global.userlevel : 0;
			$.global.lan       = $.extParmas.lan || $.global.lan || 'zh_cn';
			//来源页地址
			$.source           = $.global.source;

			if( !$.global.sellerid ){
				tmpsiteid         = $.global.settingid.split('_').splice(0,2).join('_');
				$.global.sellerid = tmpsiteid == $.global.siteid ? '' : tmpsiteid;
			}

			if( $.global.exparams ){
				try{
					$.global.exparams = $.JSON.parseJSON( $.global.exparams );
				}catch(e){
				}
			}
			//过滤4字节字符
			$.global = this.filterJSONChar($.global);

			$.Log('global: ' + $.JSON.toJSONString($.global), 1);

			return $.global;
		},
		toShortID: function(id){
			var verify = this.checkID( id );
			if( verify === $.CON_SHORT_ID ){
				return id;
			}else if( verify === $.CON_VISITOR_ID ){
				return id.split('_ISME9754_')[1];
			}else{
				return '';
			}
		},
		toLongID: function( id ){
			var verify = this.checkID( id );
			if( verify === $.CON_SHORT_ID ){
				return $.global.siteid + '_ISME9754_' + id;
			}else if( verify == $.CON_VISITOR_ID ){
				return id;
			}else{
				return '';
			}
		},
		/**
		 * 验证ID类型
		 * @param  {[type]} id [description]
		 * @return {[type]}    [description]
		 */
		checkID: function( id ){
			id = '' + id;
			if( !id || id == '0' ){
				return false;
			}else if( id.indexOf( '_ISME9754_T2D' ) > -1 ){
				return $.CON_CUSTOMER_ID;//destid
			}else if( id.indexOf( '_ISME9754_GT2D' ) > -1 ){
				return $.CON_GROUP_ID;//groupid
			}else if( id.indexOf( $.global.siteid + '_ISME9754_' ) > -1 ){
				return $.CON_VISITOR_ID;//uid
			}else{
				return $.CON_SHORT_ID;//shortid
			}
		},
		/**
		 * 跟据配置项，加载并执行相关模块
		 */
		_startOtherMode: function(uid, pcid){
			//清除超时保护
			clearTimeout(this._connectTimeID);
			this._connectTimeID = null;

			$.global.pcid = pcid;
			$.user.id     = uid;
			if( $.isDefined( $.global.uname ) ){
				$.user.name	= $.global.uname;
			}
			$.cache.set('uid', uid);
			$.cookie.set( $.CON_PCID_KEY, pcid, 1000*3600*24*365*2 );

			//2015.01.15 开启IM、页外关闭会话后、移动所isnoim0,2都直接开启IM
			if( !$.server.isnoim || ( $.server.isnoim === 2 && ($.cache.get('opd') == '1' || $.browser.mobile) ) ){
				this.startIM();
			}else{
				$.Log("no load im, isnoim:" + $.server.isnoim, 1);
			}

			this.startAudio();

			this._complete = true;
		},
		/**
		 * @method _filterChar  过滤四字节字符,首尾无空格
		 * @param  {string} str 需要处理的字符串
		 * @param {boolean} clear 是否过滤
		 * @return {string}     过滤后的字符串
		 */
		_filterChar: function(str, clear){
			var res = [], reg, tmp;
			if( clear ) $.each(this.entityList, function(name, value){
				try{
					//$.Log(name + ' - ' + value);
					reg = new RegExp(name, 'gi');
					str = str.replace(reg, value);
				}catch(e){
				}
			});

			for(var i = 0, len = str.length; i < len; i++){
				try{
					tmp = encodeURIComponent( str.charAt(i) );
					res.push( str.charAt(i) );
				}catch(e){
					try{
						//for no doctype 无效
						tmp = encodeURIComponent( str.charAt(i) + str.charAt( i + 1 ) );
						res.push( (!res.length ? '' : ' ') + tmp.replace(/%/gi, '') + (i + 2 >= len ? '' : ' ') );
						++i;
					}catch(e1){
						res.push( str.charAt(i) );
					}
				}
			}
			return res.join('');
		},
		/**
		 * @method filterJSONChar 过滤字符
		 * @param {json}    json
		 * @param {string}  key
		 * @param {boolean} clear 是否过滤
		 */
		filterJSONChar: function(data, key, clear){
			var result;
			clear = clear || false;
			if( $.isObject(data) ){
				result = {};
				for(var k in data){
					result[k] = this.filterJSONChar(data[k], k);
				}
			}else if( $.isArray(data) ){
				result = [];
				for(var i = 0; i < data.length; i++ ){
					result[i] = this.filterJSONChar(data[i], i);
				}
			}else if( typeof data == 'string' ){
				result = this._filterChar(data, $.inArray(key, this.fieldList)==-1 ? false : true);
			}else{
				result = data;
			}
			return result;
		},
		/**
		 * @description 加载PCID, 存在则直接使用，不存在则创建，等待返回
		 * @param {function} callback 获取或创建PCID完成后，回调此函数
		 * @return {void}
		 */
		_loadIdentityID: function(callback/*:function*/){
			var self = this, uid,
				//2015.04.20 继承页面PCID
				pcid = $.global.pcid || $.cookie.get( $.CON_PCID_KEY )
			;

			this.userIdFix = $.global.siteid + '_ISME9754_';

			if( pcid && pcid.length > 10 ){
				//2014.09.15
				//加载的访客ID属于另一个站点的ID时，重新创建
				if( $.global.uid && $.global.uid.indexOf( $.global.siteid ) > -1 ){
					uid = $.global.uid;
				}else{
					uid = this.userIdFix + pcid.substr(0, 21);
				}

				$.Log('load PCID:' + pcid + ', uid:' + uid);

				callback.call( this, uid, pcid );
			}else{

				if( $.flash.support && !$.browser.mobile ){
					// 需要等待FlashReady
					this._createNTID({
						u:		$.global.uid,
						siteid:		$.global.siteid,
						//是否加载NID.swf模块
						loadnid:	$.CON_LOAD_MODE_NID
					});

					// 创建一个临时PCID, 预防Flash被浏览器插件禁用
					pcid = this._createScriptPCID(true);

					$.Log('create flash PCID, tmp pcid:' + pcid);

					uid = $.global.uid || (this.userIdFix + pcid.substr(0, 21));

					//预防异常,用户太快打开聊窗
					$.global.pcid = pcid;
					$.user.id     = uid;
					//超时未创建pcid,转comet连接
					this._connectTimeID = setTimeout(function(){
						$.global.connect = $.CON_CONNECT_COMET;

						$.Log('timeout:' + self.timeOut + ' no create pcid', 2);
						callback.call( this, uid, pcid );
					}, this.timeOut);
				}else{
					pcid = this._createScriptPCID();

					$.Log('create script PCID');

					uid = $.global.uid || (this.userIdFix + pcid.substr(0, 21));

					callback.call( this, uid, pcid );
				}
			}
		},
		/**
		 * @description 创建NTID
		 * @return {void}
		 */
		_createNTID: function( flashvars/*:json*/ ){
			var html = $.flashHtml(CON_NT_ID, $.sourceURI + 'fs/NTID.swf?' + $.version.ntid, flashvars);

			html = '<div id="' + CON_FLASH_DIV + '" style="position: absolute; z-index: 9996; top: -200px;">' + html + '</div>';

			$(document.body).insert( html );
		},
		/**
		 * 通过脚本创建一个PCID
		 * @return {String}	返回一个PCID,8位随机数&13位时间戳&三位时间戳
		 */
		_createScriptPCID: function(istemp){
			/*
			2014.10.27 回滚版本，使用原pcid
			return [
				istemp ? 'T' + $.randomChar(7, 10) : $.randomChar(8, 10),
				$.getTime(2)
			].join('');
			*/
			return "guest" + [
				istemp ? 'TEMP' + $.randomChar(4) : $.randomChar(8),
				$.randomChar(4),
				$.randomChar(4),
				$.randomChar(4),
				//2015.11.06 修改为由时间戳生成随机串
				//$.randomChar(12)
				$.getTime().toString(16).toUpperCase().substr(-8) + $.randomChar(4)
			].join("-");
		},
		/**
		 * 加载getflashserver，获取服务器地址配置
		 * @return {void}
		 */
		_loadFlashServer: function(){
			$.Log('start load flashserver.');
			$.require({
				flashserver: $.server.flashserver + '/func/getflashserver.php?' + $.toURI({
					resulttype:		1,
					siteid:			$.global.siteid,
					callbackname:	"nTalk._callFlashServer"
				}) + '#rnd'
			}, function(flashserver){
				if( flashserver ){
					$.server = $.protocolFilter( $.extend($.server, flashserver) );

					$.Log('$flashserver is loaded.');
				}
			});
		},
		/**
		 * 显示加载中
		 * @return {[type]} [description]
		 * debug
		 */
		showLoading: function() {
		    $.base.chatLoading = true;
		    $.base.startTime = $.getTime();

		    var loadingStyle = "";
		    var loadingPicStyle = "";

		    if (!this.loadingElement || !this.loadingElement.length) {
		        this.loadingElement = $({
		                id: "ntalk-chat-loading",
		                style: "margin:0;padding:0;float:none;background:none;width:100%;height:33px;position:fixed:right:0;bottom:0;z-index:9999;font:normal normal normal 0px/0px Arial,SimSun;"
		            })
		            .appendTo(true).fixed({
		                right: 0,
		                bottom: 0
		            }).html('<div class="ntalk-chat-loading-pic" style="margin:0 auto;padding:0;float:none;width:99px;height:33px;background:url(' + $.imageloading + ') no-repeat 0 0;"></div>');
		        if ($.browser.mobile) {
		            this.LoadingGif();
		        }
		    } else {
		        this.loadingElement.display(1);
		    }
		    return this.loadingElement;

		},

		LoadingGif: function() {
		    $('#ntalk-chat-loading').css('height', '100%');
		    $('.ntalk-chat-loading-pic').display();
		    $('#ntalk-chat-loading').append(' <img src="' + $.sourceURI +  'images/m-loading.gif" style="position:absolute;top:50%;left:50%;margin:-11px 0px 0px -11px;width:22px;height:22px">');
		},

		hiddenLoading: function(){
			this.loadingElement.display();
			$.base.endTime	= $.getTime();
			$.base.chatLoading = false;

			$.Log('loaded time:' + ($.base.endTime - $.base.startTime), 1);
		}
	};

	$.extend({/*private function*/
		/**
		 * flashserver回调函数
		 * @param  {json} data json格式服务器地址
		 * @return {void}
		 */
		_callFlashServer: function(data/*json*/, resulttype/*:int*/){
			$.flashserver = data;

			$.server = $.protocolFilter( $.extend($.server, $.flashserver) );

			$.Log('$flashserver loading is complete.');
		},
		/**
		 * NTID 回调函数
		 * @param  {String} uid		用户ID
		 * @param  {String} pcid	PCID
		 */
		fIM_presenceFlashReady: function(uid, pcid){
			setTimeout(function(){
				//NTID与impresence回调都是同一接口，
				//所以添加一个_complete状态判断用以区分
				if( !$.base._complete ){
					$.Log( '>RETURN flash PCID, uid:' + uid + ', pcid:' + pcid, 1);
					if( uid && pcid ){
						$.base._startOtherMode(uid, pcid);
					}
				}else{
					$.Log( '$.fIM_presenceFlashReady()' );
					if( !$.Event.fireEvent(document, 'focus') ){
						$.Event.fireEvent(document, 'click');
					}
					if( $.im && $.im.connect ){
						$.im.connect.stopSwitchConnect();
					}
				}
			}, 0);
			return true;
		},
	/**
         * 2015.12.28 手机端使用页内方式打开时，为页面添加样式块
         * （6.8.2合版）添加addMobileStyle 方法，在wap中使用
         */
        addMobileStyle: function(css) {
            var head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
        }
	});

	$.extend({
		enableDebug: function(){
			if( !$.cache.get("debug") ){
				$.cache.set("debug", 2);
			}
			if( !$.mDebug ){
				$.require({
					mDebug: 'debug.js' + $.baseExt,
					Window: 'nt2.js' + $.baseExt
				}, function(mDebug, Window){
					if( !mDebug || mDebug.error ){
						return;
					}
					$.mDebug.initialize();
					$.Log   = $.mDebug.Log;
					$.debug = $.mDebug;
				});
			}
			return $.cache.get("debug");
		}
	});

	$.ready(function(){
		if( !$.isDefined(CON_SERVER) ){
			alert('CON_SERVER is not defined');
			return;
		}
		$.imageloading = $.sourceURI + 'images/loading.gif';
		$.server = $.extend({}, $.protocolFilter( CON_SERVER ));
		$.version= $.extend({}, $.version, CON_VERSION );

		$.baseExt = '?siteid=' + $.extParmas.siteid + '&v=' + $.version.dir + '&t=' + $.version.release;
		if( parseFloat( $.params['ntalker-debug'] ) > 0 || +$.cache.get("debug") > 0 ){
			$.require({
				mDebug: 'debug.js'	+ $.baseExt,
				Window: 'nt2.js'	+ $.baseExt
			}, function(mDebug, Window){
				if( !mDebug || mDebug.error ){
					return;
				}
				$.mDebug.initialize();
				$.Log   = $.mDebug.Log;
				$.debug = $.mDebug;
				$.base.start();
			});
		}else{
		    $.Log = emptyFunc;
			$.debug = {
				//未加载debug模块时，comet连接异常采用老版方式调
				Log: $.Log
			};
			$.base.start();
		}

		$.require($.imageloading);
	});
})(nTalk);
