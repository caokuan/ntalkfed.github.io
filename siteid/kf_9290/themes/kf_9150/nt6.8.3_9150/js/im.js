;(function($, undefined){
	/**
	 * IM 模块
	 * @list im, flashData, connectPresence, impresence
	 * #09.16	修改lcrm模块离开前逻辑
	 * #09.17	修改最后一页、当前页判断逻辑
	 */
	var CON_FLASH_DIV	= 'nTalk-flash-element',
		CON_IM_ID		= 'ntkf_flash_impresence',
		CON_IM_FIX		= 'IM_',
		CON_DATA_FIX	= 'JDATA_',								//缓存数据，会话
		CON_PCID_KEY		= 'machineid',					//PCID		无限
		CON_CURRENT_PAGE	= CON_IM_FIX + 'CURRENT_PAGE',	//当前页	无限
		CON_CUREENT_CONNECT	= CON_IM_FIX + 'CUREENT_CONNECT',//IM连接	无限
		CON_PAGE_DATA		= CON_IM_FIX + 'SEND_CURRENT_PAGE_DATA',//需要发送到当前页的消息（发送完成后清除）
		CON_STYLE_PUBLIC_CONTENT = 'margin:0;padding:0;border:none;float:none;font:normal normal normal 12px/160% Arial,SimSun;',
		CON_EXIST_PAGEARR = CON_IM_FIX + 'EXIST_PAGEARR'; //当前存在的页面ID

	if ( $.im ){
		return;
	}
	$.tipsicon = $.sourceURI + 'images/tipsicon.' + ($.browser.msie6 ? 'gif' : 'png');
	
	$.extend({
		CON_LCRM_FIX: 'LCRM_',
		currentCount: 0,
		im: {
			connect: null,
			time: 3,
			args: null,
			options: null,
			tipElement: null,
			receiveMsgCount: 0,
			isInvite: false,
			start: function(){
				var self = this;
				
				if( this.connect ){
					$.Log('im connected', 2);
					return;
				}
				
				this.options = {
					siteid:		$.global.siteid,
					settingid:	$.global.settingid,
					surl:		$.server.flashserver,
					r:			$.baseURI,
					ref:		$.referrer,
					fsid:		$.global.trailid,
					cid:		$.global.pcid,
					presenceserver:		$.server.presenceserver,
					presencegoserver:	$.server.presencegoserver,
					t2dstatus:			$.server.t2dstatus,
					crmcenter:			$.server.crmcenter,
					coopserver:			$.server.coopserver,
					//是否加载NID.swf模块
					loadnid:			$.CON_LOAD_MODE_NID
				};
				if( $.user.id ) {
					this.options = $.merge(this.options, $.whereGet($.user, ['id', 'name'], ['u', 'n']));
				}
				
				$.require({comet: 'nt2.js?siteid=' + $.extParmas.siteid}, function(comet){
					if( !comet ){
						$.Log('Loaded $comet mode failed', 3);
						return;
					}
					//self.connect = new $.connectPresence( self.options, $.server.close_im_flash || '0' );
					self.connect = new $.connectPresence( self.options, $.server.close_im_flash || '0' , $.server.connect_type);
					$.IMPRESENCE = self.connect;
					$.promptwindow.callbackFocus = function(){
						self.onPageFocus();
					};
					$.promptwindow.callbackBlur = function(){
						self.onPageBlur();
					};
					
					//加载IM时，一直监控鼠标移动事件
					$.listenMouseOutEvent();
					
					//每5秒验证一次是否存在未执行的立即显示方案
					setInterval(function(){
						self.intervalVerify();
					}, 5000);

					$.moveCheck = setInterval(
						function(){
							if( $.moveTime === 0 && $.currentCount == 1 && $.moveCheckFlag){
								$.moveCheckFlag = false;
								setTimeout(function(){
									if($.moveTime === 0 && $.currentCount == 1){
										$.showBeforeLeavePlan();
									}
									$.moveCheckFlag = true;
								},2*1000);
							}
						}, 1*1000);
				});
			},
			/**
			 * IM收到系统消息
			 * 2015.07.22 被动接收的会话消息，直接连接客服，客服不在线时，进机器人
			 *            接收的邀请，直接连接人工客服，优先连接发起邀请的客服，接待组中所有客服不在线时，进机器人
			 *            邀请不主动连接，只在访客发送消息后，再连接客服函数im_receiveMessage，调用此函数
			 *            移动设备下,网站页内，会话消息不走PC逻辑，网站定义了
			 * @param  {[type]} data    [description]
			 * @param  {[type]} message [description]
			 * @return {[type]}         [description]
			 */
			callReceiveSysMessage: function(data, message){
				var chat, settingid, destid, sellerid;

				destid    = data.id || '';
				if( !data.settingid && destid ){
					sellerid = destid.split('_').splice(0,2).join('_');
					//如果打开的商户配置非默认 _9999配置时，会出现异常
					data.settingid = $.global.settingid.indexOf(sellerid) > -1||sellerid.indexOf('kf_') ? $.global.settingid : sellerid + '_9999';
				}
				
				switch( data.calltype ){
				case 10:
					if( $.browser.mobile && $.global.pageinchat ){
						if( $.isFunction(im_receiveMessage) ){
							im_receiveMessage(data.settingid, message);
						}
					}else if( $.chatManage && (chat = $.chatManage.get(data.settingid, destid)) ){
						//已打开聊天窗口，重新连接
						chat.reconnect(null, destid, -1);/*single*/
						$.chatManage.callReceive(chat.settingid);
					}else if( $.server.isnoim == 3 ){
						//服务器返回状态autoOpen，收到消息，直接打开聊窗
						$.im_openInPageChat(data.settingid, '', destid, {single:-1, autoconnect: true}, '');
					}else{
						//未打开聊天窗口，显示tip
						$.im.showTips(data, message);
					}
					break;
				case 1:
				case 2:
					//liveCRM消息
					$.base.startLCrm(data.content);
					break;
				default:
					//邀请:0
                    //2015.10.20 临时添加 isnoim值为3时，直接打开聊窗
					if( data.autoOpen || $.server.isnoim == 3 ){
						//收到直接打开聊窗的邀请，算接受邀请
						if( $.im ){
							$.im.refuseInvite(destid, data.inviteid, 0);
						}
						if( $.chatManage && (chat = $.chatManage.get(data.settingid, destid)) ){
							chat.reconnect(null, destid, -1);
							$.chatManage.callReceive(chat.settingid);
						}else if( $.im_openInPageChat ){
							$.im_openInPageChat(data.settingid, '', destid, {single:-1, autoconnect: 1}, '');
						}
					}else{
						//2015.06.08 手动营销发起的邀请TIP
						this.showTips(data, message, true);
						//客服主动推送邀请
						//$.base.startInvite(data.settingid, destid, data.inviteid);
					}
					
					break;
				}
			},
			/**
			 * 页面获得焦点
			 * @return {[type]} [description]
			 */
			onPageFocus: function(){
				$.IMPRESENCE.setPageFocus(true, $.title, $.url, 0);
				
				this.intervalVerify();
			},
			/**
			 * 页面失去焦点
			 * @return {[type]} [description]
			 */
			onPageBlur: function(){
				$.IMPRESENCE.setPageFocus(false);
			},
			/**
			 * 定时验证是否存在立即执行方案
			 * @return {[type]} [description]
			 */
			intervalVerify: function(){
				var cacheData, tmpData;
				cacheData = $.loadLCrm();
				$.each(cacheData, function(index, data){
					if( data.trigger == 1 || !$.im.connect.currentPage.get()){
						//离开前触发方案，不在此处执行
						return;
					}
					tmpData = $.extend(data, {
						cw: $.currentCount
					});
					
					$.base.startLCrm(tmpData/*params*/, false/*retry*/, true/*cache*/);
					//清除缓存中当前方案数据
					$.flashData.remove($.CON_LCRM_FIX + tmpData.token);
					
				});
			},
			/**
			 * 显示tips消息通知
			 * @param  json     data       [description]
			 * @param  string   txtMessage [description]
			 * @param  boolean  isInvite   是否是手动营销，手动营销打开的聊窗不主动连接TCHAT
			 * @return
			 */
			showTips: function(data, txtMessage, isInvite){
				var arrtmp;
				this.settingid	= data.settingid || $.global.settingid || '';
				this.destid		= data.id || '';
				this.sessionid	= data.sid || '';
				this.inviteid	= data.inviteid || '';
				this.isInvite   = isInvite;

				if(typeof window.webInfoChanged == "function") {
					webInfoChanged(400, '{"num":' + (++this.receiveMsgCount) + ', "showNum":1}', false);
				}
				arrtmp = this.destid.split('_ISME9754_T2D_');
				this.sellerid   = arrtmp[0].indexOf('kf_') > -1||arrtmp[0]==$.global.siteid ? '' : arrtmp[0];
				
				$.require($.tipsicon, function(image){
					if( image.error ) $.Log('cache chat icon failure', 3);
				});
				this._createTips();
				
				this.tipElement.find('.ntalk-tips-body').html( txtMessage );
				
				this.tipElement.find('.ntalk-tips-button').html( '\u7acb\u523b\u54a8\u8be2' );
				
				//标题闪烁
				$.promptwindow.startPrompt('', $.lang.news_new, true);
			},
			/**
			 * 隐藏tip消息
			 * @return
			 */
			hideTips: function(){
				var self = this;
				if( !this.tipElement || !this.tipElement.length ){
					return;
				}
				this.tipElement.hide(500, function(){
					$(this).remove();
					self.tipElement = null;
				});
			},
			/**
			 * 通过tips打开聊天窗口
			 * @return
			 */
			openChat: function(){
				this.hideTips();
				//打开聊窗，选连接人工客服，
				
				if( $.browser.mobile || !$.global.pageinchat ){
					$.im_openOutPageChat(this.settingid, '', this.destid, {manual: 1}, '', this.sellerid);
				}else{
					$.im_openInPageChat(this.settingid, '', this.destid, {single:-1, autoconnect: this.isInvite ? -1 : 1, manual: 1}, '');
				}
			},
			/**
			 * 创建tips消息通知
			 * @return {[type]} [description]
			 */
			_createTips: function(){
				var self = this;
				if( !this.tipElement || !this.tipElement.length ){
					var html = [
						'<div class="ntalk-tips-background" style="margin:0;padding:10px;border:0;background:url(', $.tipsicon ,') no-repeat 0 0;color:#333333;font:normal 12px/160% Arial,SimSun;text-align:left;height:150px;width:205px;">',
							'<div class="ntalk-tips-body" style="margin:0;padding:0;border:0;float:left;font:normal 12px/160% Arial,SimSun;color:#333;height:60px;overflow:hidden;text-align:left;white-space:normal;width:156px;word-break:break-all;"></div>',
							'<div class="ntalk-tips-close" style="background:url(', $.tipsicon ,') no-repeat -7px -120px;margin:5px;padding:0;border:0;cursor:pointer;font:normal 1px/1px Arial;height:20px;left:166px;position:absolute;top:0px;width:20px;"></div>',
							'<div class="ntalk-tips-button" style="background:#008CD4;margin:0;padding:0;border:0;color:#FFFFFF;cursor:pointer;height:24px;left:105px;font:normal 12px/24px Arial,SimSun;position:absolute;text-align:center;top:78px;width:69px;"></div>',
						'</div>'
					].join('');
					
					this.tipElement = $({className: 'ntalk-tips-container', style: CON_STYLE_PUBLIC_CONTENT + 'width:206px;height:112px;z-index:99999;'}).appendTo(true).fixed({right:0,bottom:0}).html( html );
					
					this.tipElement.click(function(event){
						$.Event.fixEvent(event).stopPropagation();
						
						self.openChat();
					});
					this.tipElement.find('.ntalk-tips-button').click(function(event){
						$.Event.fixEvent(event).stopPropagation();
						
						self.openChat();
					}).hover(function(event){
						$(this).css('background', '#007AB9');
					},function(event){
						$(this).css('background', '#008CD4');
					});
					this.tipElement.find('.ntalk-tips-close').click(function(event){
						$.Event.fixEvent(event).stopPropagation();
						
						self.hideTips();
					}).hover(function(event){
						$(this).css('background-position', '-27px -120px');
					},function(event){
						$(this).css('background-position', '-7px -120px');
					});
				}
			},
			/**
			 * @method refuseInvite 用户响应客服邀请回执
			 * @param  {string} destid   发起邀请的客服ID
			 * @param  {string} inviteid 邀请ID
			 * @param  {number} status   状态0:接受邀请;1:拒绝邀请;
			 * @return {[type]}          [description]
			 */
			refuseInvite: function(destid, inviteid, status){
				if( !$.server.presencegoserver ){
					$.Log('presencegoserver is null', 2);
					return;
				}

				if( !destid || !inviteid ){
					$.Log('auto invite', 1);
					return;
				}

				var params = {
					action: '',
					query:  'invtrst',
					suid:   $.user.id,
					duid:   destid,
					rst:    status,
					invid:  inviteid,
					tk:     $.global.userToken
				};

				$.require($.server.presencegoserver + '?' + $.toURI(params) + '#rnd');
			}
		}
	});
	
	$.extend({//load liveCRM DATA
		listenMouseEvent:  false,
		//鼠标上次座标位置
		lcrmGoAwayClientY: 0,
		//离开视区
		lcrmGoAwayView: false,
		//移动时间
		moveTime: 0,
		//失去焦点时，检查移动定时器
		moveCheck: null,
		//
		moveCheckFlag: true,

		/**
		 * 加载缓存中离开前营销方案
		 * @return {[type]} [description]
		 */
		loadLCrm: function(){
			var data = $.flashData.get(), result = {};
			
			for(var name in data ){
				if( typeof(data[name])=="function" ) continue;
				
				if( data[name] && name.indexOf( $.CON_LCRM_FIX )>-1 ){
					result[name] = data[name];
				}
			}
			
			return result;
		},
		/**
		 * 开始监控鼠标移动事件
		 * @param  boolean  remove [description]
		 * @return {[type]}        [description]
		 */
		listenMouseOutEvent: function(remove){
			var self = this,
				_mouseover = function(e){
					var event = $.Event.fixEvent(e);
					if( (event.relatedTarget || event.toElement) && !self.lcrmGoAwayView ){
						self.setMouseOutWindow(event, false);
					}
				},
				_mouseout = function(e){
					var event = $.Event.fixEvent(e);
					if( !(event.relatedTarget || event.toElement) ){
						self.setMouseOutWindow(event, true);
						self.moveTime = 0;
					}
				},
				_mousemove = function(e){
					var event = $.Event.fixEvent(e);
					self.setMouseOutWindow(event, 'mousemove');

					if($.moveCheck !== null){
						$.moveCheck = null;
					}
					self.moveTime = $.getTime();
				}
			;
			//已开始监控或移动设备不再监控
			if( this.listenMouseEvent || $.browser.mobile ){
				return;
			}
			this.listenMouseEvent = true;
			if( remove === true ){
				$(document).removeEvent('mouseover', _mouseover);
				$(document).removeEvent('mouseout', _mouseout);
				$(document).removeEvent('mousemove', _mousemove);
			}else{
				$(document).addEvent('mouseover', _mouseover);
				$(document).addEvent('mouseout', _mouseout);
				$(document).addEvent('mousemove', _mousemove);
			}
		},
		/**
		 * 判断鼠标是否是从窗口向上移动(准备关闭浏览器)
		 * @param {[type]} event      事件对像
		 * @param {[type]} goAwayView 是否是离开视区
		 */
		setMouseOutWindow: function(event, goAwayView){
			var self = this;
			
			if( goAwayView === 'mousemove' ){
				this.lcrmGoAwayClientY = event.clientY > 0 ? event.clientY : this.lcrmGoAwayClientY;
				return;
			}
			this.lcrmGoAwayView = goAwayView;

			if( event.clientY<0 && self.lcrmGoAwayClientY<50 ){
				//$.Log('mousemove event: current open window number:' + $.currentCount, 1);
				
				//最后一个页面
				if( $.currentCount != 1 ){
					return;
				}
				
				setTimeout(function(){
					if($.moveTime === 0){
						$.showBeforeLeavePlan();
					}
				},0.5*1000);
				
			}
		},

		_getExistPageList: function(){
			try{
				return $.store.get(CON_EXIST_PAGEARR).split(",");
			}catch(e){
				return [];
			}
		},

		showBeforeLeavePlan : function(){
			var cache, tmpData;
				cache = $.loadLCrm();
			
			$.each(cache, function(index, data){
				if( data.trigger === 0 ){
					//立即触发类型方案，不在此处执行
					return;
				}
				tmpData = $.extend(data, {
					trigger: 0,
					cw: $.currentCount
				});
				
				$.base.startLCrm(tmpData/*params*/, false/*retry*/, true/*cache*/);
				
				//清除缓存中当前方案数据
				$.flashData.remove($.CON_LCRM_FIX + tmpData.token);
			});
		}
	});
	
	$.extend({//im callback
		/**
		 * IM回调函数接口
		 * @param  {number}		type 
		 * @param  {strJson}	strjson
		 * @return {void}
		 */
		fIM_onPresenceReceiveSysMessage: function(type, message){
			$.Log('$.fIM_onPresenceReceiveSysMessage("' + type + '", "' + $.JSON.toJSONString(message) + '")', 1);
			
			setTimeout(function(){
				var json, textMessage, strJson;

				textMessage = $.clearHtml( message.substr( 0, message.indexOf('ntalker://') ) );
				strJson		= message.substr( message.indexOf('ntalker://') + 10 );

				try{
					json = $.JSON.parseJSON( strJson );
				}catch(e){
					$.Log('nTalk.fIM_onPresenceReceiveSysMessage():' + e.message, 3);
					return;
				}
				$.im.callReceiveSysMessage(json, textMessage);
			}, 0);
			
			return true;
		},
		fIM_onGetFlashServer: function(userInfoUrl, trailUrl, historicalMsgUrl, checkURL, avServer, manageServer, fileServer){
			return true;
		},
		connectStatus: -1,
		fIM_updateUserStatus: function(state, strMessage){
			// 0:disconnect; 1:Are connected;2:Connection success;
			setTimeout(function(){
				$.Log('$.fIM_updateUserStatus('+state+', "'+strMessage+'")');
				
				$.connectStatus = state;
				if( $.connectStatus == 2 ){
					try{
						$.IMPRESENCE.setPageFocus(true, $.title, $.url, 1);
					}catch(e){
						$.Log(e, 3);
					}
				}
			}, 0);
			return true;
		},
		fIM_presenceSetIMSid: function(userToken){// im connection complete
			$.Log('fIM_presenceSetIMSid(userToken:' + userToken + ')', 1);
			$.global.userToken = userToken;
			
			return true;
		},
		fIM_presenceSetMyClientID: function(presenceFlashGoUrl){
			$.url_presenceFlashGoUrl = presenceFlashGoUrl;
			return true;
		},
		/**
		 * IM 数据存贮模块
		 * @type {Object}
		 */
		flashData: {
			debug:       false,
			reNumber:    0,
			sessionData: null,
			checkFlash:  function(fn){
				if( !$.IMPRESENCE || !$.isFunction($.IMPRESENCE.setJSData) ){
					if( this.reNumber > 3 ){return;}
					this.reNumber++;
					setTimeout(fn, 500);
				}else fn.call(this);
			},
			add: function(k, data){
				var self = this;
				if( data ){
					data = this.filter( $.JSON.toJSONString(data), true);
				}
				if( this.debug ){
					$.Log('$.flashData.add(k:' + k + ', v:' + data + ')', 1);
				}
				this.checkFlash(function(){
					try{
						$.IMPRESENCE.setJSData($.global.trailid, k, data);
						return true;
					}catch(e){
						return false;
					}
				});
			},
			remove: function(k){
				this.add(k, null, false);
			},
			clearAll: function(){
				this.checkFlash(function(){
					try{
						//trailID为空时，清空所有数据
						NTKF.IMPRESENCE.setJSData('', '', '');
						return true;
					}catch(e){
						return false;
					}
				});
			},
			get: function(key){
				var data, ret = {};
				if( !$.IMPRESENCE || !$.IMPRESENCE.getJSData ) return ret;
				data = $.IMPRESENCE.getJSData( $.global.trailid, (key || '') );
				//返回可能是多条数据
				try{
					data = $.JSON.parseJSON(data);
				}catch(e){
					
				}
				if( typeof data == 'string' ){
					ret = $.JSON.parseJSON( this.filter( data, false) || '{}' );
				}else{
					for(var k in data){
						if( $.isFunction(data[k]) ) continue;
						try{
							ret[k] = $.JSON.parseJSON( this.filter( data[k], false) );
						}catch(e){
							
						}
					}
				}
				return ret;
			},
			filter: function(data, replace){
				return replace===true ? data.replace(/\"/gi, "{sy}") : data.replace(/\{sy\}/gi, "\"");
			}
		}
	});
	
	/**
	 * Presence 连接对像(flash|impresence)
	 * @type {[type]}
	 */
	$.connectPresence = $.Class.create();
	$.connectPresence.prototype = {
		name: 'connectPresence',
		options: null,
		manage: null,
		debug:	false,
		data: null,            //用于存储flash接收到的营销方案
		switchTimeId: null,
		_connected: false,
		currentConnectType: '',
		initialize: function( options/*:json*/, close_im_flash, connect_type ){
			var self = this, manageOptions, conType;
			
			this.data = $.store;

			this.options = $.extend({
				nullparam: '',
				usemqtt:   0
			}, options);
			
			switch(connect_type){
				case 'mqtt':
					this.options.usemqtt = 1;

					if( 'WebSocket' in window || 'MozWebSocket' in window ){
						conType = 'websock';
					}else if( close_im_flash == '1' ){
						conType = 'comet';
					}else{
						conType = 'fssock';
					}
					break;
				case 'rtmp':
					if( close_im_flash == '1' ){
						conType = 'comet';
					}else if( $.flash.support ){
						conType = 'rtmp';
					}
					break;
			}
			
		 	switch(conType){
				case "websock":
					this.connect = this._createMqttConnect(this.options);
					break;
				case "fssock":
				case "rtmp":
					this.connect = this._createFlashConnect( this.options );
					break;
				default://comet
					this.options.usemqtt = 0;
					this.connect = this._createCometConnect( this.options );
					break;
			}
			
		 	$.Log('new $.connectPresence(); conType: ' + conType + ', isnoim:' + $.server.isnoim);

			/**
			 * 页面管理器，管理当前已打开页面数量(最多管理三个页面)，用于最后一页判断
			 */
			if( !this.connect.manage ){
				this.manage  = new $.pageManage();
			}else{
				this.manage  = this.connect.manage;
			}
			this.manage.options.onChanage = function(count, data){
				$.currentCount = count;
				$.Log('page manage callback: current open window number:' + $.currentCount, 1);
			};
			$.currentCount = this.manage.count;
			this.identid = this.manage.identid;
			
			if( !this.connect.currentPage ){
				$.Log('new $.CurrentPage(' + this.identid + ')', 1);
				
				this.currentPage = new $.CurrentPage( this.identid, this.manage );
			}else{
				this.currentPage = this.connect.currentPage;
			}
		},
		/**
		 * 连接类型切换,如果当前连接类型不为comet连接，使用comet方式创建连接
		 * @return
		 */
		switchConnect: function(){
			this.stopSwitchConnect();
			
			if( this.currentConnectType != $.CON_CONNECT_COMET ){
				$.Log('Flash abnormalities, switch the connection type. this.currentConnectType:' + this.currentConnectType + ' > comet', 2);
				if( this.connect && $.isFunction(this.connect.remove) ){
					//flash connect, remove flash HTMLDOM
					$.flash.remove(this.connect);
				}
				if( this.connect && $.isFunction(this.connect.disconnect) ){
					this.connect.disconnect();
				}
				//this._createCometConnect(this.options);
			}else{
				$.Log('Flash abnormalities', 2);
			}
		},
		/**
		 * 连接完成或正准备切换连接时，终止连接类型切换
		 * @return
		 */
		stopSwitchConnect: function(){
			clearTimeout( this.switchTimeId );
			this.switchTimeId = null;
		},
		/**
		 * 当前页面获取焦点
		 * @param {[type]} focus [description]
		 * @param {[type]} title [description]
		 * @param {[type]} url   [description]
		 * @param {[type]} other [description]
		 */
		setPageFocus: function(focus, title, url, other){
			//debug 20150701 仅使用js的页面管理逻辑
			if( focus){
				this.currentPage.set(title, url);
			}
		},
		/**
		 * 关闭Presence连接
		 * @return {[type]} [description]
		 */
		closePresence: function(){
			if( this.connect ){
				try{
					this.connect.closePresence();
				}catch(e){
				}
			}
			//Flash连接断开时，要移除Flash对像
			if( this.currentConnectType == $.CON_CONNECT_FLASH ){
				$.flash.remove(this.connect);
			}
			this.connect = null;
			this.manage = null;
		},
		/**
		 * 存贮数据
                 * debug 20150701 connectpresence中的setJSData逻辑采取本地存储方案
		 * @param {[type]} trailid [description]
		 * @param {[type]} key     [description]
		 * @param {[type]} value   [description]
		 */
		setJSData: function(trailid, key, value){
			//2014.07.18
			//comet连接时，存贮的数据与常规数据进行区分
			//通过此接口存贮的数据，添加前缀
			var ret;
            trailid = arguments[0];
			if( !trailid || trailid === '' ){
				//trailid为空时，清除通过此接口存贮的数据
				ret = this.data.getAll();
				for(var k in ret){
                    if( !ret.hasOwnProperty(k) ) continue;
					if( k.indexOf( CON_DATA_FIX ) > -1 ){
						this.data.remove(k);
					}
				}
			}else{
				key = CON_DATA_FIX + trailid + '-' + arguments[1];
				this.data.set(key, arguments[2]);
			}
		},
		/**
		 * 获取数据
                 * debug 20150701 connectpresence中的getJSData逻辑采取
                 * 遍历本地存储，找到以JDADA为key值的缓存信息
		 * @param  {[type]} trailid [description]
		 * @param  {[type]} key     [description]
		 * @return {[type]}         [description]
		 */
		getJSData: function(trailid, key){
		    var ret, result = {};
            
			ret = this.data.getAll();
			for(var k in ret){
				if( typeof ret[k] == 'function' ) continue;
				if( k.indexOf( CON_DATA_FIX ) > -1 ){
					result[k] = ret[k];
			}
			}
			return $.JSON.toJSONString(result);
		},
		_createFlashConnect: function(options/*:json*/){
			$.Log('$.connectPresence._createFlashConnect()', 1);
			var flashdiv = $('#' + CON_FLASH_DIV),
				flashsrc  = $.sourceURI + 'fs/impresence.swf?' + $.version.im,
				flashhtml = $.flashHtml(CON_IM_ID, flashsrc, options )
			;
			this.currentConnectType = $.CON_CONNECT_FLASH;
			if( !flashdiv.length ){
				flashdiv = $(document.body).insert( '<div id="' + CON_FLASH_DIV + '" class="nTalk-hidden-element" style="position: absolute; z-index: 9996; top: -200px;"></div>' );
			}

			flashdiv.insert( flashhtml );
			
			if( $.browser.msie ){
				flashdiv.find('#' + CON_IM_ID).display(1);
			}

			return flashdiv.find('#' + CON_IM_ID).get(0);
		},
		_createCometConnect: function(options/*:json*/){
			$.Log('$.connectPresence._createCometConnect()', 1);
			this.currentConnectType = $.CON_CONNECT_COMET;
			return new $.IMPresence( options );
		},
		_createMqttConnect: function(options){
			$.Log('$.connectPresence._createMqttConnect()', 1);
			this.currentConnectType = $.CON_CONNECT_COMET;
			return new $.IMPresence( options);
		}
	};

	/**
	 * comet IMPresence
	 * @type {Object}
	 */
	$.IMPresence = $.Class.create();
	$.IMPresence.prototype = {
		name: 'IMPresence',
		options: null,
		connectParams: ['userid', 'username', 'token', 'sessionid', 'nullparam', 'nullparam', 'nullparam', 'siteid','nullparam', 'nullparam', 'connectType', 'pcid', 'nullparam'],
		connect: null,
		debug: false,
		login: false,
		currentPage: null,
		_reCount:    0,
		_waitTime:   500,
		_currentConnected: false,
		_waitReconnectTimeID: null,
		_mqttFlag: true,

		initialize: function( options ){
			var self = this;
			
			this._wsFlag = options.usemqtt == 1 ? true : false;

			this.options = $.extend({
				nullparam: ''
			}, $.whereGet(options,
				["siteid", "settingid", "cid", "surl", "u", "n", "s", "r", "ref", "fsid"],
				["siteid", "settingid", "pcid", "serverurl", "userid", "username", "sessionid", "resourceurl", "referrer", "flashsessionid"]
			));
			
			this.data = $.store;
			this._reCount = 0;
			
			if( !this.options.pcid || this.options.pcid.length <= 10 ){
				this.options.pcid = this.data.get( CON_PCID_KEY );
				
				if( !this.options.pcid || this.options.pcid.length <= 10 ){
					this.options.pcid = $.base._createScriptPCID();
				}
			}
			try{
				this.data.set(CON_PCID_KEY, this.options.pcid);
			}catch(e){
				$.Log(e, 3);
			}
			
			if( !this.options.userid ){
				this.options.userid = $.base.userIdFix + this.options.pcid.substr(0, 21);
			}
			
			this._callback('fIM_presenceFlashReady', [this.options.userid, this.options.pcid]);

			var manageOptions = {
				onInterval: function(timeout, manageData){
					self._onInterval.call(self, timeout, manageData);
				},
				onChanage: function(count, data){
					self._onChanage.call(self, count, data);
				}
			};
			this.manage  = new $.pageManage(manageOptions);
			this.identid = this.manage.identid;
			
			this.currentPage = new $.CurrentPage( this.identid, this.manage );
			//首次默认先获得焦点,存贮当前页数据
			this.setPageFocus(true, $.title, $.url);
		},
		loginConnect: function(){
			var self = this, wsUrl = '', arrConnectParams = this._toArray( this.options, this.connectParams );
			
			if( this.debug )$.Log('im.loginConnect()');
			//开始连接
			this._callback('fIM_updateUserStatus', [1, '']);

			//获取websocket地址
			if($.server.presenceserver){
				var urlArr = $.server.presenceserver.split(";");
				for(var i=0; i<urlArr.length; i++){
					if(urlArr[i].indexOf("ws:\/\/") > -1){
						wsUrl = urlArr[i];
					}
				}
			}else {
				return;
			}
			
			//2015.07.29 无mqtt地址时，切换连接为comet
			if( !wsUrl ){
				this._wsFlag = false;
			}
			//如果选择可websocket方式且wsUrl存在，采取MQTT方式连接
			if(this._wsFlag){
				this.connect = new $.mqttws(
						{
							url: wsUrl,
							siteid: self.options.siteid,
							pcid: self.options.pcid,
							onCallback: function(){
								self._onCallback.apply(self, arguments);
							},
							loginMsg: $.JSON.toJSONString({"method": "roomConnect", "params":arrConnectParams})
						});
			}else{
				this.connect = new $.comet($.server.presencegoserver, {
					timeout: 20,
					onCallback: function(){
						self._onCallback.apply(self, arguments);
					},
					onComplete: function(event){
						self._onComplete.apply(self, arguments);
					},
					onAbnormal: function(event){
						self._onAbnormal.apply(self, arguments);
					},
					onTimeout: function(event){
						self._onTimeout.apply(self, arguments);
					}
				});

				this.connect.connect( {
					action:		'conn',
					params:		arrConnectParams.join(',')
				}, 'callback');
			}
		},
		/**
		 * 保持IM连接
		 * @return {void}
		 */
		kaliveConnect: function(){
			if( this.debug )$.Log('$.IMPresence.kaliveConnect()', 1);
			var self = this;
			var connectOptions;
			if(this._wsFlag){
				connectOptions = {
					"method": 'remoteKeepAlive',
					"params": [null, this.options.userid, this.options.clientid]
				};
				this.connect.kalive($.JSON.toJSONString(connectOptions));
			}else{
				var	arrConnectParams = this._toArray( this.options, this.connectParams );
				connectOptions = {
					action:		'kalive',
					params:		arrConnectParams.join(','),
					clientid:	this.options.clientid,
					machineid:	this.options.pcid,
					token:		this.options.token,
					uid:		this.options.userid
				}
				;
			
				setTimeout(function(){
					self.connect.kalive( connectOptions, 'callback');
				}, 1000);
			}

		},
		/**
		 * 重新连接IM
		 * @return {[type]} [description]
		 */
		reconnect: function(){
			var self = this;
			//3次登录失败，3-7秒等待后再次重新连接
			if( ++this._reCount <= 3 ){
				this._waitTime = 500;
			}else{
				this._waitTime = +("034567890".charAt(Math.ceil(Math.random()*5))) * 1000;
			}
			if( this.debug )$.Log('$.IMPresence.reconnect() wait:' + this._waitTime, 1);
			
			this._waitReconnectTimeID = setTimeout(function(){
				self.connect.reconnect();
			}, this._waitTime);
		},
		/**
		 * 断开IM连接,清除缓存数据
		 * @return {[type]} [description]
		 */
		disconnect: function(){
			var ret = this.data.getAll();
			for(var k in ret){
				if( typeof ret[k] == 'function' ) continue;
				if( k.indexOf( CON_DATA_FIX ) > -1 ){
					this.data.remove(k);
				}
			}
			
			clearTimeout(this._waitReconnectTimeID);
			this._waitReconnectTimeID = null;
		},
		/**
		 * 登录完成，返回登录状态
		 * @param {boolean} login   登录状态
		 * @param {String} userid   用户ID
		 * @param {number} clientid 连接ID
		 * @param {String} token    token
		 */
		LoginResult: function(login, userid, clientid, token){
			this.login = login;
			this.options.clientid = clientid;
			this.options.token = token;
			
			this._callback('fIM_updateUserStatus', [ this.login ? 2 : 0, '']);
			
			this._callback('fIM_presenceSetIMSid', [ this.login ? this.options.token : '']);
			if( this.login ){
				this.kaliveConnect('call kalive');
			}else{
				this.reconnect('login relogin');
			}
		},
		/**
		 * 分发消息
		 * @param  {String} param1    保留
		 * @param  {String} param2    保留
		 * @param  {String} param3    保留
		 * @param  {String} destuid   发送人uid
		 * @param  {String} destuname 发送人名字
		 * @param  {String} destlogo  发送人头像
		 * @param  {String} msg       消息
		 * @param  {long} time        当前时间
		 * @return {void}
		 */
		remoteNotifyChatWithGroup: function(param1, param2, param3, destuid, destuname, destlogo, msg, time){
			var json, message, protocol;

			if( !msg ){
				if( this.debug ) $.Log( 'message content is null', 3);
				return;
			}
			message  = $.clearHtml( msg.substr(0, msg.indexOf('ntalker://') ) );
			protocol = msg.substr( msg.indexOf('ntalker://') + 10);
			
			try{
				json = $.JSON.parseJSON( protocol );
			}catch(e){}
			
			//--消息发送至当前页--
			if($.store.isStorageSupported) {
				this._sendMessage2CurrenPage( message + 'ntalker://' + protocol );
			}else {
				this._callback('fIM_onPresenceReceiveSysMessage', [1, message + 'ntalker://' + protocol]);
			}
		},

		remoteNotifyUserCode: function(args){
			$.Log("do remoteNotifyUserCode!!!");
		},
		
		remoteConfirmAddFriend: function(args){
			$.Log("do remoteConfirmAddFriend");
		},

		/**
		 * 回调此对像内部方法
		 * @param  {String} methodName   方法名
		 * @param  {Array}  methodParams 方法参数
		 * @return {[type]} [description]
		 */
		_handleResponse: function(methodName, methodParams){
			if( this[methodName] ){
				this[methodName].apply(this, methodParams);
			}else{
				$.Log("The object of the method '" + methodName + "' does not exist", 3);
			}
		},
		/**
		 * 回调nTalk下的方法
		 * @param  {String} methodName   方法名
		 * @param  {Array}  methodParams 方法参数
		 * @return {[type]}
		 */
		_callback: function(methodName, methodParams){
			if( $.hasOwnProperty( methodName ) ){
				try{
					$[methodName].apply(this, methodParams);
				}catch(e){}
			}else{
				$.Log('nTalk.' + methodName + '(...)', 2);
			}
		},
		/**
		 * jsonp回调,单次请求可能会返回多个回调
		 * comet对像因链接超过预设时长，会重新发超请求，超过预设时长的链接也会返回内容
		 * 所以，回调中发起下一次请求时不能重复
		 * @param {boolean} isCurrentCallBack 是否是当前回调
		 * @param {Array}   args              参数数组
		 * @return {void}
		 */
		_onCallback: function(isCurrentCallBack, args){
			var self = this, method;
			
			if( this.debug ) $.Log('$.IMPresence.onCallback(  )');

			if( !args.length ){
				return;
			}
			method = args[0];

			if( /LoginResult|LoginReslut/gi.test(method) ){
				if( !isCurrentCallBack ){
					//2015.03.20 修复登录超过预设时长，丢弃已超时登录结果
					return;
				}else{
					this.LoginResult.apply( self, args.slice(1) );
				}
			}else{
				this._handleResponse.call( self, method, args.slice(1) );

				if( isCurrentCallBack ){
					this.kaliveConnect('call kalive');
				}
			}
		},
		/**
		 * jsonp调调用结束
		 * @return {void}
		 */
		_onComplete: function(){
			var args = Array.prototype.slice.call(arguments);

			if( this.debug ) $.Log('$.IMPresence.onComplete( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )');

			if( args[0] == 'kalive' ){
				this.kaliveConnect('complete kalive');
			}else if( args[0] == 'login' ){
				//2014.10.11 添加异常处理，comet登录连接请求成功，但无任何内容返回，重新登录
				this.reconnect('abnormal login');
			}
		},
		/**
		 * jsonp调用异常
		 * @return {void}
		 */
		_onAbnormal: function(){
			var args = Array.prototype.slice.call(arguments);

			if( this.debug ) $.Log('$.IMPresence.onAbnormal( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )', 3);

			if( args[0] == 'login' ){
				//登录失败, 重新登录
				this.reconnect('abnormal login');
			}else{
				this.kaliveConnect('abnormal kalive');
			}
		},
		/**
		 * jsonp调用超时
		 * @return {void}
		 */
		_onTimeout: function(){
			var args = Array.prototype.slice.call(arguments);

			if( this.debug ) $.Log('$.IMPresence.onTimeout( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )', 3);

			if( args[0] == 'login' ){
				//登录超时, 重新登录
				this.reconnect('time login');
			}else{
				this.kaliveConnect('timeout kalive');
			}
		},
		/**
		 * 维护IM连接,最多维护三个，其中只有一个页面连接IM
		 * @param  {[Number]} timeout [description]
		 * @param  {[Array]} m      当前页面管理器数据
		 * @return {[type]}         [description]
		 */
		_onInterval: function(timeout, m){
			var diff;
			
			//get long connect
			this.currentConn = this.data.get( CON_CUREENT_CONNECT ) || {identid:"",time:0};
			
			//$.Log('get current connect userdata:' + $.JSON.toJSONString(this.currentConn), 2);
			
			if( this.currentConn.identid && this.currentConn.identid === this.identid ){
				//update long connect
				this.currentConn.time = $.getTime();
				
				this.data.set( CON_CUREENT_CONNECT, this.currentConn);
				
				this._fireEvent('update');
			}else{
				var exists;
				if( $.isArray(m) ){
					for(var i = 0; i<m.length; i++){
						page = m[i];
						if( page && page[this.currentConn.identid] ){
							exists = true;
							this._currentConnected = true;
						}
						
					}
				}
				if( this.currentConn.identid && this.currentConn.identid !== this.identid && !exists  ){
					//clear timeout long connect
					this.currentConn.identid = '';
					this._currentConnected = false;
					this._fireEvent('clear');
				}
				if( this.debug ) $.Log('currentConnect>>_onInterval:' + $.JSON.toJSONString(this.currentConn) + ', _currentConnected:' + this._currentConnected );
				//当前页未创建过连接且未连接过时，创建新连接
				//已连接过：debug
				if( (!this.currentConn.identid || this.currentConn.identid === '') && !this._currentConnected ){
					//add long connect
					this.currentConn = {
						identid: this.identid,
						time: $.getTime()
					};
					
					this._currentConnected = true;
					
					try{
						this.data.set( CON_CUREENT_CONNECT, this.currentConn);
					}catch(e){
						$.Log(e, 3);
					}
					
					this._fireEvent('add');
					
					this.loginConnect();
				}else{
					this._fireEvent('wait');
				}
			}
		},
		/**
		 * pageManage回调，返回当前打开页面数量
		 * @param  {[type]} pageCount [description]
		 * @param  {[type]} data      [description]
		 * @return {[type]}           [description]
		 */
		_onChanage: function(pageCount, data){
			this.pageCount = pageCount;
			return ;
		},
		/**
		 * 执行相关更新事件
		 * @param  {[type]} type [description]
		 * @return {[type]}      [description]
		 */
		_fireEvent: function(type){
			
			if( this.temp == 1 || !this.temp ){
				this.temp = 1;
				if( this.debug && type !== 'wait' ){
					$.Log(this.identid + ', ' + type + ' long connect, curPage:' + this.currentPage.get(), 2 );
				}
			}else if( this.temp >= 5 )
				this.temp = 0;
			
			this.temp++;
			
			//发送至当前页的数据存在时, 发送至当前
			this._currentGetMessage();
		},
		/**
		 * 按条件将json对像转换为数组
		 * @param  {json} json  源json对像
		 * @param  {Array} arr  需要获取的字段数组
		 * @return {Array} 
		 */
		_toArray: function( json, arr ){
			var result = [];
			if( !json ){
				return 'error';
			}
			for( var i = 0; i < arr.length; i++ ){
				result.push( json[ (arr[i]) ] || '' );
			}
			return result;
		},
		/**
		 * 消息存至缓存中，如缓存中已存在消息，将消息加入队列，等待下次载入
		 * @param  {String} message
		 * @return {[type]}
		 */
		_sendMessage2CurrenPage: function(message){
			var self = this, objectQueue,
				strdata = this.data.get( CON_PAGE_DATA )
			;
			
			if( !message ) return;
			
			if( !this.Queue ){
				this.Queue = new $.Queue();
			}
			
			if( strdata ){
				//-有等待发送的消息,将消息加入队列
				this.Queue.enQueue( {data: message} );
			}else{
				//-无等待消息时,将消息存入缓存
				this.data.set( CON_PAGE_DATA, message );
			}
		},
		/**
		 * 定时在当前页获取缓存数据,并清除缓存
		 * @return {[type]} [description]
		 */
		_currentGetMessage: function(){
			var callCurrentPageData = this.data.get( CON_PAGE_DATA );
			
			if( !callCurrentPageData ){
				return;
			}
			try{
				callCurrentPageData = $.JSON.parseJSON(callCurrentPageData);
			}catch(e){
				//$.Log('$.IMPresence._currentGetMessage:' + e, 3);
			}
			
			//$.Log('is current page:' + this.currentPage.get(), 2);
			//针对最后一页未获得焦点
			if( !this.currentPage.get() || !callCurrentPageData ){
				return;
			}
			
			this.data.remove( CON_PAGE_DATA );

			this._callback('fIM_onPresenceReceiveSysMessage', [1, callCurrentPageData]);

			if(!this.Queue){
				return;
			}

			//队列中有数据时，进行下一次分发
			var objectQueue = this.Queue.deQueue();
			
			if( objectQueue){
				this._sendMessage2CurrenPage(objectQueue.data);
			}

			
		},
		/**
		 * 设定当前页
		 */
		setPageFocus: function(focus, title, url, other){
			if( focus === true ){
				this.currentPage.set(title, url);
			}
		},
		closePresence: function(){
			if(this._wsFlag){
				this.connect.disconnect();
			}else{
				try{
					this.cometd.disconnect(true);
				}catch(e){}
			}
			
			this.data.remove( CON_CUREENT_CONNECT );
		},
		/**
		 * 存贮数据
		 * @param {number} trailid  轨迹ID
		 * @param {string} key      
		 * @param {string} value      
		 * @return {[type]} [description]
		 */
		setJSData: function(){
			//2014.07.18
			//comet连接时，存贮的数据与常规数据进行区分
			//通过此接口存贮的数据，添加前缀
			var ret, key, trailid = arguments[0];
			if( !trailid || trailid === '' ){
				//trailid为空时，清除通过此接口存贮的数据
				ret = this.data.getAll();
				for(var k in ret){
					if( typeof ret[k] == 'function' ) continue;
					if( k.indexOf( CON_DATA_FIX ) > -1 ){
						this.data.remove(k);
					}
				}
			}else{
				key = CON_DATA_FIX + trailid + '-' + arguments[1];
				this.data.set(key, arguments[2]);
			}
		},
		/**
		 * 获取存贮的数据
		 * @param {number} trailid  轨迹ID
		 * @param {string} key      
		 * @return {[type]} [description]
		 */
		getJSData: function(){
			var ret, result = {}, key = Array.prototype.slice.call(arguments, 0, 2).slice(0, 2).join('-');
			if( key && arguments[1] )
				return $.JSON.toJSONString(this.data.get(key));
			else{
				ret = this.data.getAll();
				for(var k in ret){
					if( typeof ret[k] == 'function' ) continue;
					if( k.indexOf( CON_DATA_FIX ) > -1 ){
						result[k] = ret[k];
					}
				}
				return $.JSON.toJSONString(result);
			}
		}
	};
	
	/**
	 * 是否是当前页判断
	 * @param {number}  identid  参数来自pageManage对像，页面唯一身份标识
	 */
	$.CurrentPage = $.Class.create();
	$.CurrentPage.prototype = {
		name: 'CurrentPage',
		cachePageData: null,
		identid: '',
		debug:   false,
		manage:  null,
		initialize: function(identid, objManage){
			if( !identid ){
				$.Log('$.CurrentPage params failed', 3);
				return;
			}
			this.identid = identid;
			this.manage  = objManage;
			
			//数据存贮模块
			this.data = $.store;
		},
		/**
		 * 更新当前页信息
		 * @param {[type]} title [description]
		 * @param {[type]} url   [description]
		 */
		set: function(title, url){
			if( !title || !url ){
				$.Log('title is null, url is null');
				return false;
			}
			this.cachePageData = {
				identid: this.identid,
				title:   title,
				url:     url
			};
			if( this.debug ){
				$.Log('$.CurrentPage.set():' + $.JSON.toJSONString(this.cachePageData), 1);
			}
			
			this.data.set(CON_CURRENT_PAGE, this.cachePageData);
		},
		/**
		 * 获取是否是当前页
		 * @return {[type]} [description]
		 */
		get: function(){
			var page, exists = false;
			
			this.cachePageData = this.data.get(CON_CURRENT_PAGE );
			
			if( !this.cachePageData || $.isEmptyObject(this.cachePageData) ){
				return false;
			}
			var pageList = $._getExistPageList();

			if( pageList.length > 0 ){
				for(var i = 0; i<pageList.length; i++){
					page = pageList[i];
					if( page == this.cachePageData.identid ){
						exists = true;
						break;
					}
				}
				//缓存中的当前页不存在时,设定其它页为当前页
				if( exists === false ){
					if(this.identid == pageList[pageList.length-1]){
					this.set($.title, $.url);
						return true;
					}
				}
			}
			if( this.debug ){
				$.Log('::' + $.JSON.toJSONString(this.cachePageData));
				$.Log('cache page identid:' + this.cachePageData.identid + ', identid:' + this.identid + ', currentPage: ' + (this.cachePageData.identid == this.identid));
			}
			try{
				if( this.cachePageData.identid == this.identid ){
					return true;
				}
				else return false;
			}catch(e){
				return false;
			}
		}
	};
})(nTalk);