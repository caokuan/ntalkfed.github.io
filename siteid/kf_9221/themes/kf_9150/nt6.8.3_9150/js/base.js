;(function($, undefined){
	/**
	 * @description Base Mode
	 * @rely	nt1
	 * #09.17	debug 模块名称修改，兼容老板
	 */

	var CON_NOIM		= ['kf_9933','kf_9923', 'kf_9954', 'kf_10111'],
		CON_N2ID		= ['kf_9933','kf_9949', 'kf_9954'],
		CON_FLASH_DIV	= 'nt-flash-div',
		CON_NT_ID		= 'ntkf_flash_ntid',
		//统计: 0:!0|1|2|4|5|6|7|8|18|19|20|21;1:all; 2:!10|11|12|13|22|23
		CON_STATICTIS	= 2,
		CON_FLASHSERVER = {
			'trailserver':'',
			'presenceserver':'',
			'presencegoserver':'',
			'crmcenter':'',
			'mcenter':'',
			'coopserver':'',
			'roboturl':'',
			't2dstatus':'',
			'isnoim':0,
			'notrail':0,
			'preload':2000,
			'sessioncarry':'1',
			'enable_entrance':'0',
			'enable_invite':'0',
			'close_tchat_flash':'1',
			'close_im_flash':'0',
			'robot':'0',
			'siteid':''
		},
        emptyFunc = function(){},
		rSiteidExp = /[a-z]{2}\_\d+/ig
	;

	if( !$.baseURI || $.base ){
		return;
	}

	$.extend({//CONST
		//2014.10.14
		//可配置项，配置是否加载NID.swf模块,默认值：1(加载)
		CON_LOAD_MODE_NID: 1,
		CON_CUSTOMER_ID: 0,
		CON_GROUP_ID:    1,
		CON_VISITOR_ID:  2,
		CON_SHORT_ID:    3
	});

	$.base = {
		_startBase:		false,
		_identityIDReady:false,
		_connectTimeID:	null,
		chatLoading:	false,
		clearChatCache:	false,
		/**
		 * @property timeOut
		 * @type {Number}
		 * */
		timeOut:		2000, //超时保护
		entityList:		{
			'<':	'&lt;',
			'>':	'&gt;'
		},
		fieldList:		['shortid','uid','uname','isvip','userlevel','itemid','itemparam','erpparam','exparams'],
		CON_LOCAL_FIX:  'NOWAIT_',
		call_trail_status: false,	//update 是否已调用轨迹服务，用于notrail为2时 2015-08-10
		userIdFix:		'',
		_reload_trail:  false,
		/**
		 * @property _get_page_data
		 * @type {JSON}
		 */
		_get_page_data: null,
		/**
		 * @desc 入口共用config
		 * @property config
		 * @type {JSON}
		 */
		config: null,
		/**
		 * 初始化页面信息，获取网站配置信息
		 * @return {void}
		 */
		_islogin: true,
		start: function(){
			var self = this;

			if( !$.server ){
				$.Log( 'Loaded $server mode failed' , 3);
				return;
			}
			$.Log('nTalk.base.start()', 1);
			if( !$.cookie.enable() ){
				$.Log( 'Does not support cookies!' , 3);
			}
			$.global.pageinchat = true;
			$.global.statictis	= CON_STATICTIS;
			$.source = $.url;
			this._identityIDReady = false;

			if( this._startBase ){
				return;
			}
			//每次加载脚本时以当前时间戳创建一个当前页ID作为身份标识
			this.pageid = $.getTime();

			this._startBase = true;
			this._loadFlashServer();

			if( $.isEmptyObject(CON_RULE) ){
				//获取标准页面数据
				this.getPageData();

				this._loadIdentityID(function( uid, pcid ){
					$.Log("PCID:" + pcid, 1);

					// cookie中获取或通过脚本创建时
					self.startOtherMode(uid, pcid);
				});
			}
			else{
				this.startData(function(){

					this._loadIdentityID(function( uid, pcid ){
						$.Log("PCID:" + pcid, 1);

						// cookie中获取或通过脚本创建时
						self.startOtherMode(uid, pcid);
					});
				});
			}
		},
		/**
		 * @method chanageUserID 2015.09.18 验证用户ID是否已发生变更
		 * @return {boolean}
		 */
		chanageUserID: function(){
			if( typeof NTKF_PARAM == "undefined" ){
				return false;
			}else if( NTKF_PARAM.uid && this.toLongID(NTKF_PARAM.uid) && this.toLongID(NTKF_PARAM.uid) != $.user.id ){
				//3个站点，uid通过uname赋值，兼容处理
				if( $.inArray( $.global.siteid, CON_N2ID ) > -1 && ($.global.siteid + "_ISME9754_" + NTKF_PARAM.uname == $.user.id)){
					return false;
				}
                //修复uid为0时，会重载数据
				return true;
			}else{
				return false;
			}
		},
		/**
		 * @method overloadedData 2015.09.18 重载集成的用户信息
		 * @param  {json}     uData     重置用户数据，结构参见NTKF_PARAM
		 * @param  {function} callback  获取数据完成后回调函数
		 * @return {void}
		 */
		overloadedData: function(uData, callback){
			if( $.isFunction(uData) ){
				callback = uData;
				uData    = null;
			}

			$.Log('nTalk.base.overloadedData()');
			if( $.isEmptyObject(CON_RULE) ){
				//重新获取常规数据
				this.getPageData(uData);

				//重载数据中用户ID为空时，继承原用户ID
				$.user.id   = $.global.uid || $.user.id;
				$.user.name = $.global.uname || '';
				$.cache.set('uid', $.user.id);

				if( $.isFunction(callback) )
					callback();

				$.base.startTrail( $.base._islogin, true );
			}
			else{
				this.startData(function(){
					$.user.id   = $.global.uid || $.user.id;
					$.user.name = $.global.uname || '';
					$.cache.set('uid', $.user.id);

					if( $.isFunction(callback) )
						callback();

					$.base.startTrail( $.base._islogin, true );
				}, uData);
			}
		},
		/**
		 * @method startData 加载数据模块
		 * @param  function callback
		 * @param  Object   uData     网站传递的数据
		 * @return {void}
		 */
		startData: function(callback, uData){
			var self = this;
			$.Log('nTalk.base.startData()');

			$.require({
				data: 'data.js' + $.baseExt
			}, function(data){
				if( !data ){
					$.Log('Loaded $data mode failed', 3);
					return;
				}

				var pData = $.data.start( CON_RULE );

				self._get_page_data = $.extend({}, pData, uData);

				self.getPageData( self._get_page_data );

				callback.call(self);
			});
		},
		/**
		 * @method _execMode 加载数据模块
		 * @param  function callback
		 * @return {void}
		 */
		_execMode: function(){
			var self = this;

			this._startBase = true;
			this._loadFlashServer();

		},
		/**
		 * @method startTrail 加载轨迹模块
		 * @param  boolean  isLogin
		 * @param  boolean  isUpdate
		 * @return {void}
		 */
		startTrail: function( isLogin, isUpdate ){
			$.require({
				trail: 'trail.js' + $.baseExt
			}, function(trail){
				if( !trail ){
					$.Log('Loaded $trail mode failed', 3);
					return;
				}
				$.trail.start( isLogin, isUpdate );
			});
		},
		/**
		 * 开始创建IM连接
		 * @return {void}
		 */
		startIM: function(){
			//连接已创建，不再重复执行
			if( $.im && $.im.connect ){
				return;
			}
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
		/**
		 * 执行livecrm
		 * @param data	json|Array
		 * @param retry	boolean		来自重载数据
		 * @param cache	boolean		来自缓存的数据
		 * @return {void}
		 */
		startLCrm: function(data, retry, cache){
			var receiveData = data && $.isArray(data) ? data : [data];
			$.require({
				lcrm: 'lcrm.js' + $.baseExt
			}, function(lcrm){
				$.each(receiveData, function(index, data){

					$.Log('start lcrm mode', 1);
					$.lcrm.start(data, retry, cache);
				});
			});
		},
		/**
		 * @description 打开聊窗
		 * @param {string} settingid
		 * @param {string} destid
		 * @param {string} itemid
		 * @param {string} itemparam
		 * @param {string} sellerid
		 * @param {string} noWaitConnect
		 * @param {string} single	是否是单客服 -1 为未知
		 * @param {boolean} manual	是否强制进入人工客服
		 * @return {void}
		 */
		startChat: function(settingid, destid, itemid, itemparam, sellerid, noWaitConnect, single, manual){
			var scriptList;

			settingid = settingid || '';
			destid    = destid || '';
			itemid    = itemid || '';
			itemparam = itemparam || '';
			sellerid  = sellerid || '';

			if( $.im ){
				$.im.hideTips();
			}
			if( $.base.chatLoading === true ){
				$.Log('loading......', 2);
				return;
			}
			$.Log('$.base.startChat(' + $.JSON.toJSONString(arguments) + ')', 1);

			$.base.showLoading();

			scriptList = {
				lang: ($.extParmas.lan || 'zh_cn') + '.js' + $.baseExt
			};

            //2015-05-03 增加tchatConnectType开关，用来控制是否使用mqtt
            if( $.browser.supportMqtt && $.server.tchatmqttserver && $.server.tchatConnectType == 1){
                scriptList.MQTT  = 'mqtt31.js' + $.baseExt;
                scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
            }else if( $.flash.support && $.server.tchatmqttserver && $.server.tchatConnectType == 1 ){
                scriptList.MQTT  = 'flashsock.js' + $.baseExt;
                scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
            }else{
                scriptList.TChat = 'comet.chat.js' + $.baseExt;
            }

			//2015.10.09 添加开发工具支持，允许在本地调用聊窗脚本
			if( $.global.themes ){
				scriptList.chatManage = 'chat.js' + $.baseExt;
				scriptList.chatManageView = $.global.themes + '/chat.view.in.js' + $.baseExt;

				$.themesURI = $.global.themes + '/images/';
			}else{
				scriptList.chatManage = 'chat.in.js' + $.baseExt;
			}
			scriptList.Window    = 'nt2.js' + $.baseExt;

			//2015.06.19 加载机器人模块
			if( $.server.robot == 1 ){
				scriptList.Robot = 'robot.js' + $.baseExt;
			}

			$.require(scriptList, function(){

				$.base.hiddenLoading();

				if( !$.chatManage ){
					$.Log('Load $chatManage mode failed', 3);
					return;
				}else{
					$.Log('load $chatManage mode complete');
				}
				if( $.chatManage.open(settingid, destid, itemid, itemparam, sellerid, noWaitConnect, single, manual) ){
					$.cache.set('opd', 1);
				}
			});
		},
        /**
         * @method startEntrance 加载邀请模块
         * ////////////////////////////////////////////////
         * @config array entranceConfig
         *         $settingid => $entrance_file
         */
        startEntrance: function(){
            var entranceFile = $.server.entranceConfig[ $.global.settingid ] || "";
            $.Log('$.base.startEntrance()');

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
                    $.entrance.start('entrance');
                }
                if( $.server.enable_entrance != "0" && $.options.invite ){
                    $.entrance.start('invite');
                }
            });
        },
		/**
		 * 显示加载中
		 * @return {[type]} [description]
		 */
		showLoading: function(){
			$.base.chatLoading	= true;
			$.base.startTime	= $.getTime();

			if( !this.loadingElement || !this.loadingElement.length ){
				this.loadingElement = $({id:"ntalk-chat-loading", style: $.STYLE_NBODY + "width:100%;height:33px;position:fixed:right:0;bottom:0;z-index:9999;"})
				.appendTo(true).fixed({
					right:	0,
					bottom:	0
				}).html('<div style="' + $.STYLE_BODY + 'margin:0 auto;width:99px;height:33px;background:url(' + $.imageloading + ') no-repeat 0 0;"></div>');
			}else{
				this.loadingElement.display(1);
			}

			return this.loadingElement;
		},
		hiddenLoading: function(){
			this.loadingElement.display();
			$.base.endTime     = $.getTime();
			$.base.chatLoading = false;

			$.Log('$.base.showLoading-hiddenLoading execute time:' + ($.base.endTime - $.base.startTime) + ' ms', 1);
		},
		/**
		 * 转换为长ID
		 * @param  {String}	id  用户ID
		 * @return {String}    返回长用户ID
		 */
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
        toShortID: function(id){
            var verify = this.checkID( id );
            if( verify === $.CON_SHORT_ID ){
                return id;
            }else if( verify === $.CON_VISITOR_ID ){
                return id.replace(this.userIdFix, "");
            }else{
                return "";
            }
        },
		/**
		 * 验证ID类型
		 * @param  {String}   id      访客、客服、客服组，会员ID
		 * @return {boolean|number}   返回ID类型
		 */
		checkID: function( id ){
			id = id ? id.toString() : "";
			if( !id || id === '0' ){
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
		 * @method startOtherMode 跟据配置项，加载并执行相关模块
		 * @param {String} uid    用户ID
		 * @param {String} pcid   PCID
		 * @return {void}
		 * */
		startOtherMode: function(uid, pcid){
			var cacheUID  = $.cache.get('uid') || '', options, carry;

			//清除超时保护
			clearTimeout(this._connectTimeID);
			this._connectTimeID = null;
			this._identityIDReady = true;

			$.Log( 'cache uid:' + cacheUID + ', site uid:' + uid + ', return uid:' + uid, 1 );
			if( !cacheUID ){
				this._islogin = true;
			}else {
				this._islogin = cacheUID != uid;
			}

			$.global.pcid = pcid;
			$.user.id     = uid;
			if( $.isDefined( $.global.uname ) ){
				$.user.name	= $.global.uname;
			}

			$.cache.set('uid', uid);
			$.cookie.set( $.CON_PCID_KEY, pcid, 1000*3600*24*365*2 );

			//update notrail: 0：默认值，直接调用轨迹服务；1：关闭轨迹服务；2：首次打开聊窗时调用轨迹；2015-08-10
			if( $.server.notrail === 0 ){
				this.startTrail( this._islogin, false );
			}else{
				$.Log( 'no load trail' );
			}

			//2014.12.10 加载entrance模块
			if( $.server.entranceConfig && ($.server.enable_entrance != "0" || $.server.enable_invite == "1") ){
				//enable_entrance为2代表，移动端不开启入口
				if($.server.enable_entrance == "2" && $.browser.mobile) {
					return;
				}
				this.startEntrance( );
			}

			if( !$.server.isnoim || $.server.isnoim == 3 || ( $.server.isnoim == 2 && $.cache.get('opd') == '1' ) ){
				$.Log('nTalk.base.startIM()::' + $.im, 1);
				this.startIM();
			}else{
				$.Log("no load im, isnoim:" + $.server.isnoim + ', opd:' + $.cache.get('opd'), 1);
			}

			if($.browser.mobile == 1){
				var css = ['.full-html,.full-body{',
                    'width: 100% !important;',
                    'height: 100% !important;',
                    'margin: 0 !important;',
                    'overflow: hidden !important;',
                    '}',

                    '.full-body *{',
                    'display: none !important;',
                    '}',

                    '.full-iframe {',
                    'display: block !important;',
                    '}'
                ].join("");
				$.addMobileStyle(css);
			}

			//预加载、携带
			carry = {
				settingid:	$.cache.get('carry_sid'),
				destid:		$.cache.get('carry_did')
			};
			if( $.server.sessioncarry != '0' && carry.settingid && !$.browser.mobile){
				$.Log('sessioncarry:' + $.JSON.toJSONString(carry));

				$.cache.set('carry_sid', '');
				$.cache.set('carry_did', '');

				if( carry.settingid ){
					if( $.browser.mobile || !$.global.pageinchat ){
						options = {
							"single": -1
						};
						$.im_openOutPageChat(carry.settingid, '', carry.destid, options, "");
					}else{
						options = {
							"autoconnect": true,
							"single":      -1
						};
						$.im_openInPageChat(carry.settingid, '', carry.destid, options, "");
					}
				}
			}else if( $.server.preload > 0 && !$.global.themes ){
				this.preloadChat();
			}
		},
		/**
		 * @method preloadChat 预加载聊窗模块
		 * @return {void}
		 */
		preloadChat: function(){
			var scriptList;

			$.Log('$.base.preloadChat()', 1);
			setTimeout(function(){
				if( $.base.chatLoading === true ){
					return;
				}
                scriptList = {
    				lang: ($.extParmas.lan || 'zh_cn') + '.js' + $.baseExt
    			};
    			//2015.10.09 添加开发工具支持，允许在本地调用聊窗脚本
    			if( $.global.themes ){
    				scriptList.chatManage = 'chat.js' + $.baseExt;
    				scriptList.chatManageView = $.global.themes + '/chat.view.in.js' + $.baseExt;

    				$.themesURI = $.global.themes + '/images/';
    			}else{
    				scriptList.chatManage = 'chat.in.js' + $.baseExt;
    			}
    			scriptList.Window     = 'nt2.js' + $.baseExt;
                if( $.browser.supportMqtt && $.server.tchatmqttserver && $.server.tchatConnectType == 1){
                    scriptList.MQTT  = 'mqtt31.js' + $.baseExt;
                    scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
                }else if( $.flash.support  && $.server.tchatConnectType == 1 ){
                    scriptList.MQTT  = 'flashsock.js' + $.baseExt;
                    scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
                }else{
                    scriptList.TChat = 'comet.chat.js' + $.baseExt;
                }

    			//2015.06.19 加载机器人模块
    			if( $.server.robot == 1 ){
    				scriptList.Robot = 'robot.js' + $.baseExt;
    			}
				$.require(scriptList, function(lang, chatManage){
					if( !chatManage ){
						$.Log('preload $chatManage mode failed', 3);
					}else{
						$.Log('preload $chatManage mode complete');
					}
				});
			}, $.server.preload);
		},
		/**
		 * 获取NTKF_PARAM参数
		 * @param Object pageData
		 * @return {Object|boolean}  页面数据
		 */
		getPageData: function(pageData){
			var data;
			$.Log('nTalk.base.getPageData()');

			data = $.extend({}, typeof NTKF_PARAM !== 'undefined' ? NTKF_PARAM : {}, pageData);

			//2014.12.27 新增传入参数exparams(object)
			$.whereGetTo($.global, data, [
				'siteid', 'sellerid', 'settingid', 'uid', 'uname','exparams','themes',
				'isvip',				/*-是否是VIP-*/
				'userlevel',			/*-用户级别-*/
				'itemid', 'itemparam',	/*-商品(老版本)-*/
				'orderid', 'orderprice',/*-订单-*/
				'erpparam',				/*-ERP参数-*/
				'ntalkerparam',			/*-新版商品信息-*/
				'pagetype',				/*-页面类型，特殊参数，传入轨迹服务-*/
				'title', 'lang','iconid'
			], [ null, null, null, 'shortid', 'uname', 'exparams', 'themes']);

			$.global.siteid    = ($.global.siteid + '').replace(/^\s+|\s+$/, '');
			$.global.settingid = ($.global.settingid + '').replace(/^\s+|\s+$/, '');
			//2015.06.02 允许页面中不传任何参数，其中siteid可以使用加载脚本时的siteid
			$.global.siteid = $.global.siteid&&rSiteidExp.test($.global.siteid) ? $.global.siteid : ($.extParmas.siteid || '');
			if( $.global.siteid === '' ){
				return false;
			}
			//-兼容参数中pagetype为空，URL中含页面类型参数source
			$.global.pagetype	= $.params.source || '';

			//2014.11.20 添加orderid, orderprice单个的字符串，用逗号分隔的多个或数组型式多个
			$.global.sellerid = $.isArray($.global.sellerid) ?
				$.global.sellerid :
				$.global.sellerid.toString().indexOf(',') > -1 ?
					$.global.sellerid.split(',') :
					$.global.sellerid ? [$.global.sellerid] : [];
			$.global.orderid = $.isArray($.global.orderid) ?
				$.global.orderid :
				$.global.orderid.toString().indexOf(',') > -1 ?
					$.global.orderid.split(',') :
					$.global.orderid ? [$.global.orderid] : [];
			$.global.orderprice = $.isArray($.global.orderprice) ?
				$.global.orderprice :
				$.global.orderprice.toString().indexOf(',') > -1 ?
					$.global.orderprice.split(',') :
					$.global.orderprice ? [$.global.orderprice] : [];

			if( $.inArray( $.global.siteid, CON_N2ID ) > -1 ){
				$.global.shortid = $.global.uname || '';
			}

			if( !$.global.itemid && $.global.ntalkerparam ){
				if( !$.isObject($.global.ntalkerparam) ){
					$.Log('ntalkerparam param abnormal', 2);
				}
				//-新版商品详情页
				if( $.global.ntalkerparam.item ){
					$.global.itemid = $.global.ntalkerparam.item.id;
				}
			}
			if( !/number|string/i.test(typeof $.global.shortid) || !/string/i.test(typeof $.global.uname) ){
				//原uid 为空，此处退出，导致异常
                $.Log("userid or username type error");
				$.global.shortid = "";
                $.global.uname   = "";
			}
			$.referrer			= $.enCut($.referrer, 255);
			$.global.settingid	= $.global.settingid && /[a-z]{2}\_\d+\_\d+/ig.test($.global.settingid) ? $.global.settingid : '';
			$.global.iconid		= $.isNumeric($.global.iconid) ? $.global.iconid : 0;
			$.global.title		= $.enCut($.title, 255);
			$.global.shortid	= !$.global.shortid||$.global.shortid=='0' ? '' : $.enCut($.global.shortid, 64 - $.enLength($.global.siteid) - 10);
			$.global.uname		= !$.global.shortid||$.global.shortid=='0'||/^(undefined|null|0)$/gi.test($.global.uname) ? '' : $.global.uname ? $.enCut($.global.uname, 32) : $.enCut($.global.shortid, 32);
			$.global.uid		= this.toLongID( $.global.shortid );
			$.global.isvip		= $.isNumeric($.global.isvip) ? $.global.isvip : $.isNumeric($.global.userlevel) ? $.global.userlevel : 0;
			$.global.userlevel	= $.isNumeric($.global.userlevel) ? $.global.userlevel : 0;

			if( $.inArray( $.global.siteid, CON_N2ID ) > -1 ){
                $.global.shortid = $.global.uname || "";
            }
			//过滤4字节字符
			$.global = this.filterJSONChar( $.global, "" );

			$.Log('global: ' + $.JSON.toJSONString($.global), 1);

			return $.global;
		},
		/**
		 * @method _filterChar  过滤四字节字符,首尾无空格
		 * @param  {String}  str   需要处理的字符串
		 * @param  {Boolean} clear 是否过滤
		 * @return {String}        过滤后的字符串
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
					}catch(e){
						res.push( str.charAt(i) );
					}
				}
			}
			return res.join('');
		},
		/**
		 * @method filterJSONChar 过滤字符
		 * @param {Object|Array|String|Number|Boolean}    data
		 * @param {String|Number}  key
		 * @retrun {json}
		 */
		filterJSONChar: function(data, key){
			var result, self = this;

			if( $.isObject(data) ){
				result = {};
				$.each(data, function (k, item) {
					result[k] = self.filterJSONChar(item, k);
				});
			}else if( $.isArray(data) ){
				result = [];
				for(var i = 0; i < data.length; i++ ){
					result[i] = this.filterJSONChar(data[i], i);
				}
			}else if( typeof data == 'string' ){
				result = this._filterChar(data, $.inArray(key, this.fieldList) !== -1 );
			}else{
				result = data;
			}
			return result;
		},
		/**
		 * @description 加载PCID,存在则直接使用，不存在则创建，等待返回
		 * @param {function} callback 获取或创建PCID完成后，回调此函数
		 * @return {void}
		 */
		_loadIdentityID: function(callback/*:function*/){
			var self = this, uid, diff, pcid = "";

			//2015.12.30 添加通过SDK获取PCID
            if( typeof ntalker !== "undefined" && ntalker.getIdentityID ){
            	$.Log('get sdk pcid');
                pcid = ntalker.getIdentityID();
            }

            $.Log('ntalker type : ' + (typeof ntalker));


            if( pcid === "" ){
                pcid = $.cookie.get( $.CON_PCID_KEY );
            }
			$.global.trailid = $.cache.get('tid');
			this.userIdFix = $.global.siteid + '_ISME9754_';

			//2014.07.23
			//解决访问不关闭浏览器，会话ID跨天问题
			if( $.global.trailid ){
				diff = Math.round( ($.getTime() - +($.global.trailid.toString().substr(0, 13)))/3600000 );

				//$.Log('diff:' + diff, 2);
				// 当会话ID超过4小时，强制重新创建会话ID
				if( diff >= 4 ){
					$.global.trailid = '';
				}
			}

			if( !$.global.trailid || $.url.indexOf("livecrmtest") > -1){
				//创建新会话ID
				$.global.trailid = $.getTime(2);

				//新会话，清除
				$.base.clearChatCache = true;

				//IM:清除缓存数据
				if( $.flashData ){
					$.flashData.clearAll();
				}
			}

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
						u:			$.global.uid,
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
					this._connectTimeID = setTimeout( function(){

						$.global.connect = $.CON_CONNECT_COMET;

						$.Log('timeout:' + self.timeOut + ' no create pcid', 2);

						callback.call( self, uid, pcid );
					}, this.timeOut);
				}else{
					if ( $.cookie.enable() ) {
						pcid = this._createScriptPCID(false);

						$.Log('create script PCID');

						uid = $.global.uid || (this.userIdFix + pcid.substr(0, 21));

						callback.call( this, uid, pcid );
					} else {
						$.require({
							Fingerprint2 : 'fingerprint2.js' + $.baseExt
						}, function(Fingerprint2){
							if(!$.Fingerprint2) {
								$.Log('load Fingerprint2 failure');
								return;
							}
							fingerprint2 = new $.Fingerprint2();

							fingerprint2.get(function(id){
								pcid = ("guest-Fin" + id);

								uid = $.global.uid || (self.userIdFix + pcid.substr(20, 41));

								callback(uid, pcid);
							});
						});
					}
				}
			}
		},
		/**
		 * @description 创建NTID
		 * @return {void}
		 */
		_createNTID: function( flashvars/*:json*/ ){
			var flashdiv = $('#' + CON_FLASH_DIV),
				flashhtml = $.flashHtml(CON_NT_ID, $.sourceURI + 'fs/NTID.swf?' + $.version.ntid, flashvars);

			//修复IE下flash创建到body下，导致页首空行
			if( !flashdiv.length ){
				flashdiv = $(document.body).insert( '<div id="' + CON_FLASH_DIV + '" style="position: absolute; z-index: 9996; top: -200px;"></div>' );
			}

			flashdiv.insert( flashhtml );
		},
		/**
		 * 通过脚本创建一个PCID
		 * @param  {Boolean}   isTemp
		 * @return {String}	返回一个PCID,8位随机数&13位时间戳&三位时间戳
		 */
		_createScriptPCID: function(isTemp){
			/*
			2014.10.27 回滚版本，使用原pcid
			return [
				istemp ? 'T' + $.randomChar(7, 10) : $.randomChar(8, 10),
				$.getTime(2)
			].join('');
			*/
			return "guest" + [
					isTemp ? 'TEMP' + $.randomChar(4) : $.randomChar(8),
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
				flashserver = $.extend({}, CON_FLASHSERVER, flashserver);

				$.server = $.protocolFilter( $.extend($.server, flashserver) );
			});
		}
	};

	$.extend({/*private function*/
		/**
		 * flashserver回调函数
		 * @param  {Object} data        json格式服务器地址
		 * @param  {Number} resultType
		 * @return {void}
		 */
		_callFlashServer: function(data, resultType){
			$.flashserver = data;

			$.server = $.protocolFilter( $.extend($.server, $.flashserver) );

			$.Log('$flashserver loading is complete. resultType:' + resultType);
		},
		/**
		 * NTID 回调函数
		 * @param  {String} uid		用户ID
		 * @param  {String} pcid	PCID
		 */
		fIM_presenceFlashReady: function(uid, pcid){
			setTimeout(function(){
				//NTID与impresence回调都是同一接口，
				//所以添加一个_identityIDReady状态判断用以区分
				if( !$.base._identityIDReady ){
					$.Log( '>RETURN flash PCID, uid:' + uid + ', pcid:' + pcid, 1);
					if( uid && pcid ){
						$.base.startOtherMode(uid, pcid);
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
		 * flash检查js是否ready
		 */
		isJsReady: function(){
			return true;
		},

        /**
         * @method _createMobileIframeWindow 创建移动设备页内iframe
         * @param  string name
         * @retrun Object
         */
        _createMobileIframeWindow: function(name){
            var chatElement   = $(".ntalk-mobile-iframe-window"),
                iframeElement = $("IFRAME[name=" + name + "]"),
                mChatWindow
            ;

            if( !chatElement.length ){
            	//2015.12.18 强制显示iframe
                chatElement   = $({className: "ntalk-mobile-iframe-window", "data-status": "visible", style:$.STYLE_BODY + 'background:#fff;width:100% !important;height:100% !important;position:fixed;left:0;top:0px;-webkit-overflow-scrolling: touch;overflow-y:scroll'}).appendTo(true);
                iframeElement = $({tag:'IFRAME',name:name,style:$.STYLE_BODY + 'width:100% !important;height:100% !important;display:block !important;',src:'about:blank'}).appendTo(".ntalk-mobile-iframe-window");

                $(window).bind('resize', function(){
                    $(iframeElement).css({
                        'width': '100%',
                        'height':$(window).height() + 'px'
                    });
                    if( chatElement.attr("data-status") == "hidden" ){
                        chatElement.css("top", $(window).height() + "px");
                    }else{
                        chatElement.css("top", "0px");
                    }
                });
                mChatWindow   = iframeElement[0].contentWindow;

                //message listener
                $.listenerMessage(function(data){
                    $.Log('listenerMessage:' + data);

                    switch( data ){
                        case "hideMobileIframeWindow":
                            $._hideMobileIframeWindow(chatElement, false);
                            break;
                        case "closeMobileIframeWindow":
                            $._hideMobileIframeWindow(chatElement, true);
                            break;
                    }

                    //for 360
                    if(data && data.indexOf("destInfo") > -1 && typeof im_destUserInfo == "function" && data.split(",").length == 3){
                    	var destId = data.split(",")[1];
                    	var destName = data.split(",")[2];
                    	im_destUserInfo({"id":destId,"name":destName});
                    }
                });

                return {
                    created: true,
                    element: chatElement
                };
            }
            else{
                return {
                    created: false,
                    element: chatElement
                };
            }
        },
        /***/
        _showMobileIframeWindow: function(chatElement){
            if( !(nTalk.isObject(chatElement) && chatElement.talkVersion) ){
                return;
            }
            //2015.12.18 显示时，隐藏html，body中的所有内容，仅显示chatElement的内容，并置前
            $("html").addClass("full-html");
            $("body").addClass("full-body");
            chatElement.addClass("full-iframe");
            chatElement.css('z-index', '999999999');
        },
        /***/
        _hideMobileIframeWindow: function(chatElement, closeIframeWindow){
            if( !(nTalk.isObject(chatElement) && chatElement.talkVersion) ){
                return chatElement;
            }
            //2015.12.18 隐藏时，显示html，body中的所有内容，隐藏chatElement的内容，并置后
            $("html").removeClass("full-html");
            $("body").removeClass("full-body");
            chatElement.removeClass("full-iframe");
            chatElement.css({
            	'z-index' : -1,
            	'display' : 'none'
            });

            //2015.03.09 如果closeIframeWindow为true，删除iframe,同时将监听的函数清空
            if(closeIframeWindow) {
            	chatElement.remove();
            	$.listenerFunctions = [];
            }
		},
        /**
         * 2015.12.28 手机端使用页内方式打开时，为页面添加样式块
         * (6.8.2合版) 将addMobileStyle 改为接收参数的方法，便于复用
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

	$.extend({/* 打开聊窗 */
		/**
		 * @description 打开聊窗
		 * @param {String}	settingId	配置ID
		 * @param {String}	itemId		商品ID
		 * @param {String}	destId		客服ID
		 * @param {Object}	options		其它配置项
         *                  	single      请求单客服
         *                      manual      请求人工客服
         *                      autoconnect 自动连接服务器
         *                      iframechat  移动设备指定打开聊窗方式：页内浮窗；标准聊窗
         *                      header      是否显示聊窗头
		 * @param {String}	itemparam	商品信息附加参数
		 * @return {void}
		 */
		im_openInPageChat: function(settingId, itemId, destId, options, itemparam){
			var gSellerid, cSellerid, args, sellerId;

			if( !$.base._startBase ){
				$.base.start();
				(function(){
					args = arguments;
					if( $.base._startBase ){
						$.im_openInPageChat(settingId, itemId, destId, options, itemparam);
					}else{
						setTimeout(function(){
							args.callee();
						}, 50);
					}
				})();
				return;
			}

			if( $.base.chanageUserID() ){
				//用户信息变更，重载数据(同步｜异步)
				$.base.overloadedData(function(){
					$.im_openInPageChat(settingId, itemId, destId, options, itemparam);
				});
				return;
			}
            if( $.invite ){
				$.invite._close();
			}

			$.Log('nTalk.im_openInPageChat()', 1);

			settingId = settingId || $.global.settingid || '';
			gSellerid = $.global.settingid ? $.global.settingid.split('_').splice(0,2).join('_') : '';
			cSellerid = settingId ? settingId.split('_').splice(0,2).join('_') : '';
			sellerId  = $.global.sellerid&&$.global.sellerid.length ? $.global.sellerid[0] : '';
			options   = $.extend({}, options);

			if( itemId ){
				//
			}else if( !cSellerid || ( cSellerid!=='' && (cSellerid == sellerId || cSellerid == gSellerid ) ) ){
				itemId    = $.global.itemid;
				itemparam = $.global.itemparam;
			}else{
				itemId    = '';
				itemparam = '';
			}
			sellerId      = cSellerid != $.global.siteid ? cSellerid : '';

			$.Log('settingId:' + settingId + ', itemId:' + itemId + ', itemparam:' + itemparam);

			if( $.browser.mobile || $.global.pageinchat !== true ){
				return this.im_openOutPageChat(settingId, itemId, destId, options, itemparam);
			}else{
				//update notrail值为2时，打开聊窗时调用轨迹 2015-08-10
				if( $.server.notrail == 2 && !$.base.call_trail_status ){
					$.base.call_trail_status = true;
					$.base.startTrail();
				}

				var single      = options&&options.single ? options.single : '';
				var manual      = options&&options.manual ? 1 : 0;
				var autoConnect = options&&$.isDefined(options.autoconnect) ? options.autoconnect : false;

				this.base.startChat(settingId, destId, itemId, itemparam, sellerId, autoConnect, single, manual);

				//this.im_openOutPageChat(settingId, destId, itemId, itemparam, sellerId, autoConnect, single);
			}
		},
		/**
		 * 打开页外聊天窗口
		 * @param {String}  settingId 配置ID
		 * @param {String}  itemId    商品ID
		 * @param {String}  destId    客服(组)ID
		 * @param {Object}  options   其它配置项
         *                      single      请求单客服
         *                      manual      请求人工客服
         *                      autoconnect 自动连接服务器
         *                      iframechat  移动设备指定打开聊窗方式：页内浮窗；标准聊窗
         *                      header      是否显示聊窗头
		 * @param {String}  itemparam 商品信息附加参数
         * @return {window}
		 */
		im_openOutPageChat: function(settingId, itemId, destId, options, itemparam){
			var gSellerid, cSellerid, args, sellerId;

			if( !$.base._startBase ){
				$.base.start();
				(function(){
					args = arguments;
					if( $.base._startBase ){
						$.im_openInPageChat(settingId, itemId, destId, options, itemparam);
					}else{
						setTimeout(function(){
							args.callee();
						}, 50);
					}
				})();
				return;
			}

			if( $.base.chanageUserID() ){
				//用户信息变更，重载数据(同步｜异步)
				$.base.overloadedData(function(){
					$.im_openInPageChat(settingId, itemId, destId, options, itemparam);
				});
				return;
			}

			$.Log('nTalk.im_openOutPageChat()', 1);

			settingId = settingId || $.global.settingid || '';
			gSellerid = $.global.settingid ? $.global.settingid.split('_').splice(0,2).join('_') : '';
			cSellerid = settingId ? settingId.split('_').splice(0,2).join('_') : '';
			sellerId  = $.global.sellerid&&$.global.sellerid.length ? $.global.sellerid[0] : '';
			options   = $.extend({}, options);

			if( itemId ){
				//
			}else if( !cSellerid || ( cSellerid!=='' && (cSellerid == sellerId || cSellerid == gSellerid ) ) ){
				itemId    = $.global.itemid;
				itemparam = $.global.itemparam;
			}else{
				itemId    = '';
				itemparam = '';
			}
			sellerId      = cSellerid != $.global.siteid ? cSellerid : '';

			$.Log('settingId:' + settingId + ', itemId:' + itemId + ', itemparam:' + itemparam);

			//测试POST方式，打开聊窗
			var objectResult,
                target = $.browser.mobile ? '_self' : '_blank',
                single = options&&options.single ? options.single : '',
				manual = options&&options.manual ? 1 : 0,
				query = {
					v:				$.version.script,
					siteid:			$.global.siteid,
					sellerid:		sellerId,
					settingid:		settingId,
					baseuri:		$.baseURI,
					mobile:			$.browser.mobile ? 1 : 0,
					lan:			$.extParmas.lan || '',
                    iframechat:     options.iframechat || "0",
                    header:         ($.isDefined(options.header) ? options.header : "1"),
                    rnd:			$.getTime()
				},
				post = {
					uid:		$.user.id,
					uname:		$.user.name,
					pcid:		$.global.pcid,
					vip:		$.global.isvip,
					ulevel:		$.global.userlevel,
					destid:		destId || '',
					single:		single ? single : !destId ? -1 : destId.indexOf('GT2D')>-1 ? 0 : 1,
					chattype:	'',
					chatvalue:	'',
					itemid:		itemId,
					itemparam:	itemparam,
					erpparam:	$.global.erpparam,
					ref:		$.enCut($.url, 255),
					tit:		$.global.title,
                    "ntalker-debug": $.params['ntalker-debug'] || $.cache.get("debug"),
					//2014.12.27 新添参数传入页外，注意与extParmas的区别
					exparams:	$.global.exparams
				}
			;
            //open sdk chat window
            if( typeof ntalker !== "undefined" && ntalker.openChatWindow ){
                sdkQuery = $.extend({}, query, post);
                sdkQuery.uid = $.base.toShortID(sdkQuery.uid);
                sdkQuery.flashserver = $.server.flashserver;

				$.Log("call ntalker.openChatWindow()", 2);
                var result = ntalker.openChatWindow( $.JSON.toJSONString(sdkQuery) );
                $.Log("call ntalker.openChatWindow()>>" + result, 3);
                if( result === 0 ){
                return;
	            }else{
	                $.Log("call ntalker.openChatWindow()>>" + result, 3);
            }
            }

			if( $.global.themes ){
				query.themes = $.global.themes;
			}
			if( options.iframechat ){
				target = 'ntalk-mobile-chat';

				$.require({
					animate: 'nt2.js' + $.baseExt
				}, function(nt2){
					if( !$.animate ){
						$.Log('Loaded $nt2 mode failed', 3);
						return;
					}
					objectResult = $._createMobileIframeWindow(target);

		            if( !objectResult || (objectResult && objectResult.created === true ) ){
		                $.objectPost = new $.POST($.server.flashserver + 'chat.php?' + $.toURI(query, true, '&'), post, function(){
						$.Log('open chat window complete', 1);
		                }, target);
		            }

					$._showMobileIframeWindow(objectResult.element);
				});

				return null;
			}

            if( !objectResult || (objectResult && objectResult.created === true ) ){
                $.objectPost = new $.POST($.server.flashserver + 'chat.php?' + $.toURI(query, true, '&'), post, function(){
				$.Log('open chat window complete', 1);
                }, target);
            }

            return objectResult ? objectResult.element : $.objectPost.iframeElement;
		},
		/**
		 * @method im_getAppChatWindowURL APP下专用获取打开聊窗口地址
         * @param {Object} data 打开聊窗参数
		 *          {String}  settingId 配置ID
		 *          {String}  itemId    商品ID
		 *          {String}  destId    客服(组)ID
		 *          {Object}  options   其它配置项
         *                      single      请求单客服
         *                      manual      请求人工客服
         *                      autoconnect 自动连接服务器
         *                      iframechat  移动设备指定打开聊窗方式：页内浮窗；标准聊窗
         *                      header      是否显示聊窗头
		 *          {String}  itemparam 商品信息附加参数
         * @param {function} callback
		 * @return void
		 */
        im_getAppChatWindowURL: function(data, callback){
            var gSellerid, cSellerid, args, sellerId, destId, settingId, itemId, itemparam, options;

			if( !$.base._startBase ){
				$.base.start();
				(function(){
					args = arguments;
					if( $.base._startBase ){
						$.im_getAppChatWindowURL(data, callback);
					}else{
						setTimeout(function(){
							args.callee();
						}, 50);
					}
				})();
				return;
			}

			if( $.base.chanageUserID() ){
				//用户信息变更，重载数据(同步｜异步)
				$.base.overloadedData(function(){
					$.im_getAppChatWindowURL(data, callback);
				});
				return;
			}

			$.Log('nTalk.im_getAppChatWindowURL()', 1);

            if( typeof data == "function" ){
                callback = data;
                data  = {};
            }else{
                data  = $.extend({}, data);
            }

            destId    = data.destid || "";
			settingId = data.settingId || $.global.settingid || '';
			gSellerid = $.global.settingid ? $.global.settingid.split('_').splice(0,2).join('_') : '';
			cSellerid = data.settingid ? data.settingid.split('_').splice(0,2).join('_') : '';
			sellerId  = $.global.sellerid&&$.global.sellerid.length ? $.global.sellerid[0] : '';
			options   = $.extend({}, data.options);

			if( data.itemid ){
				itemId    = data.itemid;
                itemparam = data.itemparam;
			}else if( !cSellerid || ( cSellerid!=='' && (cSellerid === sellerId || cSellerid === gSellerid ) ) ){
				itemId    = $.global.itemid;
				itemparam = $.global.itemparam;
			}else{
				itemId    = '';
				itemparam = '';
			}
			sellerId      = cSellerid != $.global.siteid ? cSellerid : '';

			$.Log('settingId:' + settingId + ', itemId:' + itemId + ', itemparam:' + itemparam);

			//测试POST方式，打开聊窗
			var single = options&&options.single ? options.single : '',
				manual = options&&options.manual ? 1 : 0,
				query = {
					v:			$.version.script,
					siteid:		$.global.siteid,
					sellerid:	sellerId,
					settingid:	settingId,
					baseuri:	$.baseURI,
					mobile:		$.browser.mobile ? 1 : 0,
					lan:		$.extParmas.lan || '',
                    header:     ($.isDefined(options.header) ? options.header : "1"),
					uid:		$.user.id,
					uname:		$.user.name,
					pcid:		$.global.pcid,
					vip:		$.global.isvip,
					ulevel:		$.global.userlevel,
					destid:		destId || '',
					single:		single ? single : !destId ? -1 : destId.indexOf('GT2D')>-1 ? 0 : 1,
					chattype:	'',
					chatvalue:	'',
					itemid:		itemId,
					itemparam:	itemparam,
					erpparam:	$.global.erpparam,
					ref:		$.enCut($.url, 255),
					tit:		$.global.title,
                    "ntalker-debug": $.params['ntalker-debug'] || $.cache.get("debug") || "",
					//2014.12.27 新添参数传入页外，注意与extParmas的区别
					exparams:	$.global.exparams
				}
			;

            if( $.isFunction(callback) ){
                callback.call(self, $.server.flashserver + 'recieve.php?' + $.toURI(query, true, '&'));
            }
        },
		/**
		 * @method im_updatePageInfo 更新页面信息｜重新获取页面信息
		 * @param  Object uData 网站传递的数据(可选),数据结构按照NTKF_PARAM
		 * @return boolean
		 */
		im_updatePageInfo: function(uData){

			$.base.overloadedData(uData);

		},
		/**
		 * 微信单页面hash值改变，提交给轨迹
		 */
		im_addTrailInfo: function(title, url, uData) {
			$.referrer = $.url;
			$.title = title || document.title;
			$.url = url || document.location.href;
			$.base.overloadedData(uData);
		},
		t2d: {
			/**
			 * @method openChatWindow 兼容旧版
			 * @param  {String} destId
			 * @param  {String} sessionId
			 * @param  {String} settingId
			 * @return {void} 返回打开的聊窗口是否成功
			 */
			openChatWindow: function(destId, sessionId, settingId){

				$.im_openOutPageChat(settingId, '', destId, null, '');

			}
		},
		enableDebug: function(){
			if( !$.cache.get("debug") ){
				$.cache.set("debug", 2);
			}
			if( !$.mDebug ){
				$.require({
					mDebug: 'debug.js' + $.baseExt,
					Window: 'nt2.js' + $.baseExt
				}, function(mDebug){
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

	if( !$.isDefined(CON_SERVER) ){
		throw 'CON_SERVER is not defined';
	}

	$.imageloading = $.sourceURI + 'images/loading.gif';
	$.server = $.extend({}, $.protocolFilter( CON_SERVER ));
	$.version= $.extend({}, $.version, CON_VERSION );

	$.baseExt = '?siteid=' + ($.extParmas.siteid || '') + '&v=' + $.version.dir + '&t=' + $.version.release;
	if( parseFloat( $.params['ntalker-debug'] ) > 0 || +$.cache.get("debug") > 0 ){
		$.require({
			mDebug: 'debug.js' + $.baseExt,
			Window: 'nt2.js' + $.baseExt
		}, function(mDebug){
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
})(nTalk);
