(function($, undefined){
	/** ====================================================================================================================================================
	 * js实现comet.tchat连接对像,用于不对持flash或flash异常时，连接Tchat服务
	 * @class TChat
	 * @constructor
	 * @param json     options  连接参数
	 */
	$.TChat = $.Class.create();
	$.TChat.prototype = {
		name: 'TChat',
		options: null,
		data: null,
		connectParams: ['userid', 'usertoken', 'sessionid', 'destid', 'machineID', 'devicetype', 'chattype', 'chatvalue', 'username', 'userlevel', 'settingid'],
		connect: null,
		debug: false,
		login: false,
		status: false,
		defBody: {
			bold: false,
			italic: false,
			color: "000000",
			fontsize: "14",
			underline: false
		},
		abnormalCount: 0,
		loginAbnormalCount: 0,
		fontsize: 14,
		_reCount: 0,
		callback: '',
		disconnectparams: null,
		_waitReconnectTimeID: null,
		robotQueue: 0, //(6.8.2合版 新增参数) 标识是否在机器人排队状态 0代表没有排队 1代表可能准备排队 2代表正在排队
		initialize: function(options){
			this.callback = 'tchat_' + $.randomChar();
			this.hashSend = new $.HASH();
			this.hashComplete = new $.HASH();
			this.hashReceive = new $.HASH();
			this.data  = $.store;
			this._reCount = 0;
			this.options = $.extend({
				//设备类型：0:PC;1:微信;2:APP;3:WAP
				devicetype: $.browser.mobile ? 3 : 0,
				chattype:	'0',
				chatvalue:	'0'
			}, options);

			if( !this.options.pcid || this.options.pcid.length <= 10 ){
				this.options.pcid = this.data.get('machineid');

				if( !this.options.pcid || this.options.pcid.length <= 10 ){
					this.options.pcid = $.base._createScriptPCID();
				}
			}
			this.data.set('machineid', this.options.pcid);

			if( !this.options.userid ){
				this.options.userid = $.base.userIdFix + this.options.pcid.substr(0, 21);
			}

			if( this.debug ){
				$.Log('initialize comet chatConnect');
			}

			this.status = true;
            this.firstConnected = true;

			this._initQueue();

			this.loginConnect();
		},
		/**
		 * 开始(登录)Tchat连接
		 * @return
		 */
		loginConnect: function(){
			var self = this;
			var arrConnectParams = this._toArray(this.options, this.connectParams);

			$.Log('connect tChat:' + arrConnectParams.join(','), 1);

			this.connect = new $.comet(this.options.tchatgoserver, {
				timeout: 10,
				onCallback: function(){
					//$.Log('comet.onCallback()', 2);
					self._onCallback.apply(self, arguments);
				},
				onComplete: function(){
					//$.Log('comet.onComplete()', 2);
					self._onComplete.apply(self, arguments);
				},
				onAbnormal: function(){
					//$.Log('comet.onAbnormal()', 2);
					self._onAbnormal.apply(self, arguments);
				},
				onTimeout: function(){
					//$.Log('comet.onTimeout()', 2);
					self._onTimeout.apply(self, arguments);
				}
			});
			this.sessionIdleReplys = {};

			this.sessionIdleReplys[+(this.options.disconnecttime)] = '\u8d85\u65f6\u672a\u53d1\u9001\u6d88\u606f\uff0c\u81ea\u52a8\u65ad\u5f00\u8fde\u63a5';

			this.connect.connect({
				ac:		'conn',
				action:	'roomconnect',
				login:	true,
				params:	arrConnectParams.join(','),
				timeout:10
			});
		},
		/**
		 * 保持tchat连接
		 * @return
		 */
		kaliveConnect: function(message){
			$.Log('nTalk.TChat.kaliveConnect(' + message + ')', 1);
			var self = this,
				arrConnectParams = this._toArray(this.options, this.connectParams),
				connectOptions = {
					ac:		'kalive',
					action: 'roomconnect',
					login:	false,
					params:	arrConnectParams.join(','),
					clientid:this.options.clientid,
					timeout:10
				};
			if( !this.status ){
				$.Log('stop kalive connect');
				return;
			}
			setTimeout(function(){
				self.connect.kalive( connectOptions );
			}, 1000);
		},
		/**
		 * 重新连接Tchat
		 * @return
		 */
		reconnect: function(){
			var self = this;
			//3次登录失败，3-7秒等待后再次重新连接
			if( ++this._reCount <= 3 ){
				this._waitTime = 500;
			}else{
				this._waitTime = +("034567890".charAt(Math.ceil(Math.random()*5))) * 1000;
			}
			if( !this.status ){
				$.Log('stop reconnect');
				return;
			}

			this._waitReconnectTimeID = setTimeout(function(){
				self.connect.reconnect();
			}, this._waitTime);
		},
		/**
		 * 断开TChat连接
		 * @return
		 */
		disconnect: function(){
			for (var key in this.sessionIdleReplys) {
				if( !this.sessionIdleTimeouts ) continue;
				if (this.sessionIdleTimeouts[key]){
					clearTimeout(this.sessionIdleTimeouts[key].id);
				}
			}
			//停止继续保持
			this.status = false;
			clearTimeout(this._waitReconnectTimeID);
			this._waitReconnectTimeID = null;

			this.connect.disconnect();
		},
		/**
		 * 通过TChat发送消息
		 * @param  json|strJSON data 字符串json消息
		 * @return
		 */
		sendMessage: function(data){
			var self = this, body, attributes;

			data = $.isObject(data) ? data : $.JSON.parseJSON(data);
			//filter body
			data = $.charFilter(data);

			//get type, msgid
			attributes = $.whereGet(data, ["type", "msgid"], ["type", "msgid"]);

			//file, image, audio
			if( data.url ){
				attributes = $.extend(attributes, $.whereGet(data, ["url", "emotion", "oldfile", "size", "extension", "sourceurl", "mp3", "length"]));
			}

			body = {
				action:		'remoteSendMessage',
				myuid:		this.options.userid,
				clientid:	this.options.clientid,
				sessionid:	this.options.sessionid,
				flashuid:	data.timerkeyid,
				type:		'',
				fs:		this.fontsize
			};

			if( data.type === 1 ){
				$.extend(body, {
					msgid:	data.msgid,
					style:	0,
					type:	1,
					msg:	data.msg
				});
			}else{
				$.extend(body, {
					msgid:	data.msgid,
					msg:{
						msg: $.extend(data.msg, {attributes: attributes})
					}
				});
				if( body.msg.msg.evaluate ){
					body.msg.msg.evaluate = $.JSON.toJSONString(body.msg.msg.evaluate);
				}

				body.msg = $.jsonToxml(body.msg);
			}

			this.hashSend.add(body.msgid, body);

			//-非系统消息 更新超时断线定时器（且不处于机器人排队状态时，更新超时断线定时器）
			if( data.type !== 5 && !this.robotQueue ){
			    this.processSessionIdle();
			}

			this._splitParcels(body);
		},
		/**
		 * 消息发送失败
		 * @param  String msgid 消息ID
		 * @return
		 */
		sendAbnormal: function(msgid){
			var data = this.hashSend.items(msgid),
				timesample = $.getTime(),
				body = $.extend({}, {
					type:		9,
					msgType:	2,
					timesample:	timesample,
					msgid:		timesample + 'J',
					userid:		'system',
					body:		data
				}, data);

			delete body.timerkeyid;
			this._callback('fIM_receiveMessage', [body]);
		},
		/**
		 * 消息分包
		 * @param  json data json消息
		 * @return json
		 */
		_splitParcels: function(data){
			var pLength = $.browser.mobile ? 300 : 768;
			var tmp, start = 0, pIndex = 0, sbody, pCount, correction, pcontent, result = [];
			sbody = encodeURIComponent(data.msg);

			pCount = Math.ceil(sbody.length/pLength);

			while(sbody.length > 0){
				correction = true;	//更正包长度
				pLength = pLength <= sbody.length ? pLength : sbody.length;
				while( correction ){
					pcontent = sbody.substring(0, pLength);
					try{
						//一个中文字符encode后9个字符，分包异常时，decode时会报错
						pcontent = decodeURIComponent(pcontent);
						correction = false;
					}catch(e){
						pLength--;
					}
				}
				tmp = {
					msgid:	data.msgid,
					index:	pIndex,
					body:	$.extend({}, data, {
						sendpacket:		pIndex,
						packetcount:	pCount,
						msg:			pcontent
					})
				};
				result.push(tmp);

				//加入队列
				this.messageQueue.addMessage( tmp );

				this.startSend( tmp );

				pIndex++;
				start = pLength;
				sbody = sbody.substring(start, sbody.length);
			}

			return result;
		},
		/**
		 * 开始发送消息队列中的消息
		 * @param  json sbody json消息内容
		 * @return
		 */
		startSend: function(sbody){
			if( !sbody || !this.login ){
				//队列中没有消息或连接断开
				return;
			}
			if( !sbody.timestamp || !sbody.recount ){
				//本条消息非重新发送时，直接发送
				sbody.timestamp = $.getTime();
				sbody.recount	= 1;
			}

			//通过comet对像发送消息,等待callback回调，标记是否成功
			this.connect.send($.extend({
				//消息发送完成回调
				callback:	this.callback
				}, sbody.body) );
		},
		/**
		 * 消息发送完成
		 * @param  {Boolean}     result 消息发送状态
		 * @param  String  msgid  消息ID
		 * @param  number  index  包索引
		 * @return
		 */
		_callbackComplete: function(result, msgid, index){
			if( result ){
				//if( this.debug )$.Log('_callbackComplete::removeMessage ' + msgid + ', index:' + index);
				this.messageQueue.removeMessage( msgid, index );
				this.hashComplete.add(msgid, this.hashSend.items(msgid));
			}
		},
		/**
		 * 验证队列中的消息是否已发送成功,超时消息抛出异常
		 * @return
		 */
		verificationMessage: function(){
			var sbody = this.messageQueue.first(),
				curTimestamp = $.getTime(),
				msgid, index, sendCount = 0,
				SEND_MAX_PERTIME = 2
			;
			if( !this.login ){
				//断线后不再尝试
				return;
			}
			while( sbody ){
				if( curTimestamp - sbody.timestamp >= 3000 ){
					//-发送超时,3秒未移除
					if( sbody.recount >= 3 ){
						//-3次重试失败，抛出异常,从队列中清除
						//-分包时只要有一条消息发送失败，要返回整条消息发送失败的提示，
						this.sendAbnormal(sbody.msgid);
						//-删除队列中同一msgid的所有消息
						this.messageQueue.removeMessage( sbody.msgid, -1 );
					}else{
						if( sendCount >= SEND_MAX_PERTIME ){
							sbody = this.messageQueue.nextMessage(sbody.msgid, sbody.body.sendpacket);
							continue;
						}
						sendCount++;
						//this.debug && $.Log('msgid:' + sbody.msgid + ',index:' + sbody.body.sendpacket + '/count:' + messageBody.body.packetcount + ',content:' + messageBody.body.msg, 1);
						//-重新发送
						sbody.timestamp = curTimestamp;
						sbody.recount = sbody.recount + 1;

						this.startSend(sbody);
					}
				}

				sbody = this.messageQueue.nextMessage(sbody.msgid, sbody.body.sendpacket);
			}
		},
		/**
		 * 断开连接
		 * @return {[type]}
		 */
		closeTChat: function(){
			this.disconnect();
		},
		/**
		 * 修改默认字号
		 * @param json data 消息文本样式生属性
		 */
		setTextStyle: function(data){
			if( !data ) return;

			if( data.fontsize ){
				this.fontsize = data.fontsize;
			}
		},
		/**
		 * 发送正在输入的消息(消息预知)
		 * @param  String message 消息预知内容
		 * @return
		 */
		predictMessage: function(message){
			var body = {
				action:		'onPredictMessage',
				myuid:		this.options.userid,
				clientid:	this.options.clientid,
				sessionid:	this.options.sessionid,
				msg:		message
			};

			this.connect.send(body, function(result){
				$.Log('comet.TChat.predictMessage()');
			});
		},
		/**
		 * 连接状态返回
		 * @param boolean  result    [description]
		 * @param {[type]} clientid  [description]
		 * @param {[type]} userinfo  [description]
		 * @param {[type]} sessionid [description]
		 * @param {[type]} soid      [description]
		 * @param {[type]} time      [description]
		 */
		LoginResult: function(result, clientid, userinfo, sessionid, soid, time){
			this.login = result === true;
			this.options.result = result===true ? 1 : 0;
			this.options.clientid = clientid;
			this.options.sessionid= sessionid;
			this.options.soid     = soid;
			this.options.time     = time;

			try{
				this.options.userinfo = $.JSON.parseJSON(userinfo);
			}catch(e){
				this.options.userinfo = this.options.userinfo || {};
			}

			this._callback('fIM_tchatFlashReady', [this.options.userid, this.options.pcid, this.options.settingid]);
			if( this.options.result ){
				//-更新超时断线定时器
				if( this.firstConnected === true ){
				    this.firstConnected = false;
				    this.processSessionIdle();
				}

				this.userinfo = $.extend({}, {
					myuid:		this.options.userinfo.userid,
					myuname:	this.options.userinfo.username,
					signature:	'',
					mylogo:		this.options.userinfo.usericon,
					sessionid:	this.options.sessionid,
					timesample:	this.options.time
				});

				var arrId = this.options.userid.split('_ISME9754_');
				this.disconnectparams = {
					from:	'TCHAT',
					cid:	this.options.clientid,
					sitid:	this.options.siteid,
					uid:	arrId.length == 2 ? arrId[1] : ''
				};
				this.flashGoURL = this.connect.disconnectServer(this.disconnectparams, false);
			}

			//2015.03.03
			//客服在请求t2d后，离线，连接不可用，断开连接，不再重连
			if( this.options.userinfo && this.options.userinfo.connectable === false ){

				this._callback('fIM_onGetUserInfo', ['{"status": 0}']);

				return;
			}

			if( this.options.result ){
				this.kaliveConnect('login kalive');

				this._callback('fIM_setTChatGoServer', [this.flashGoURL]);

				this._reCount = 0;
			}else{
				this.reconnect('login relogin');

				this.userinfo = '';
				this.flashGoURL = '';
			}

			this._callback('fIM_ConnectResult', [this.options.result, this.userinfo, '']);
		},
		/**
		 * 返回历史聊天记录
		 * @return {[type]}
		 */
		remoteHistroyMessage: function(){
			var self = this, count = arguments[0], strXML, elementMessage, jsonMessage, timeout = 0,
				historyList = [],
				body = {
					history:1
				};

			for(var j = 1; j < arguments.length; j++ ){
				switch(j % 4){
					case 1://timestamp
						body.timestamp = arguments[j];
						break;
					case 2://destid
						body.userid = arguments[j];
						break;
					case 3://destinfo
						body = $.extend(body, $.whereGet(
							$.JSON.parseJSON(arguments[j]),
							["externalname", "usericon", "nickname", "username"],
							["name", "logo", "nickname", "username"]
						));
						break;
					case 0:
						strXML = arguments[j];
						if( strXML===null || strXML==="" || strXML.indexOf('<msgtype') != -1 ){
							//--忽略系统消息, 空消息--
							continue;
						}else{
							strXML = strXML.replace(/<\?xml\s+version=\"1\.0\"\s+encoding=\"utf\-\d+\"\?>/gi, '');
							strXML = strXML.replace(/&(?!amp;)/gi, '&amp;');
							elementMessage = $.htmlToElement(strXML)[0];
							if( elementMessage && elementMessage.nodeType == 3 ){
								jsonMessage = {
									msg:	elementMessage.textContent
								};
							}else{
								jsonMessage = $.elementToObject( elementMessage );
							}

							if(jsonMessage.xnlink == "true" && jsonMessage.msg){
				                var reg = new RegExp(/\[[0-9]*\].+[\n]/g);
				                jsonMessage.msg = jsonMessage.msg.replace("&amp;lt;![CDATA[","").replace("<![CDATA[", "").replace("]]>","");
				                var matches = jsonMessage.msg.match(reg);
				                if (matches && matches.length > 0) {
				                    for(var i=0, l=matches.length; i<l; i++){
				                        var tmp_match = matches[i].replace(/[\n]/g, "").replace(/\[[0-9]*\]\s/,"");
				                        var tmp_match_txt = matches[i].replace(/[\n]/g, "")
				                        tmp_match = '[link robotindex='+tmp_match+']'+tmp_match_txt+'[\/link]\n';
				                        jsonMessage.msg = jsonMessage.msg.replace(matches[i], tmp_match);
				                    }
				                }
							}else if(jsonMessage.type == 7  && strXML){
								//（6.8.2合版）type 为 7 代表html消息，需要base64解码
                                var matchArr = strXML.replace(/</g, '&lt;').replace(/>/g, '&gt;').match("&lt;content&gt;(.+?)&lt;/content&gt;");
                				if(matchArr && matchArr.length>=2){
                					jsonMessage.msg = $.base64.decode(matchArr[1]);
                				}
                            }else{
								jsonMessage.msg = elementMessage.textContent || elementMessage.text;

								if( typeof jsonMessage.msg == 'string' ){
									jsonMessage.msg = jsonMessage.msg.replace(/</g, '&lt;');
								}
							}

							body = $.extend(body, this.defBody, jsonMessage);
						}
						historyList.push(body);
						body = {history:1};
				}
			}

			$.each(historyList, function(i, body){
				setTimeout(function(){
					self._callback('fIM_receiveMessage', [body]);
				}, timeout);
				timeout += 50;
			});

		},
		/**
		 * 接收消息
		 * @param  {[type]} timestamp
		 * @param  {[type]} destId
		 * @param  {[type]} destInfo
		 * @param  {[type]} xmlString
		 * @param  {[type]} flashUid
		 * @return {[type]}
		 */
		remoteSendMessage: function(timestamp, destId, destInfo, xmlString, flashUid){
			var body, json, elementMessage;

			if( !xmlString || (xmlString.indexOf('type="5"') > -1 && xmlString.indexOf('systype="5"') === -1) ) return;

			if( destInfo && typeof destInfo == 'string' ){
				destInfo = $.JSON.parseJSON(destInfo);
				destInfo = $.whereGet(destInfo, ["usericon", "userid", "externalname"], ["logo", "userid", "name"]);
			}

			xmlString = xmlString.replace(/<\?xml\s+version=\"1\.0\"\s+encoding=\"utf\-\d+\"\?>/gi, '');
			//将消息中的&转为&amp; 否则xml会解析失败
			xmlString = xmlString.replace(/&(?!amp;)/gi, '&amp;');
			try{
				elementMessage = $.htmlToElement(xmlString)[0];
				if( elementMessage && elementMessage.nodeType == 3 ){
					json = {
						type:	1,
						msg:	elementMessage.textContent,
						msgid:	flashUid + 'x'
					};
				}else{
					json = $.elementToObject( elementMessage );
				}
			}catch(e){
				$.Log('remoteSendMessage:' + e.description + '; xmlString:' + xmlString, 3);
				return;
			}

			if(json.xnlink == "true" && json.msg){
                var reg = new RegExp(/\[[0-9]*\].+[\n]/g);
                json.msg = json.msg.replace("&amp;lt;![CDATA[","").replace("<![CDATA[", "").replace("]]>","");
                var matches = json.msg.match(reg);
                if (matches && matches.length > 0) {
                    for(var i=0, l=matches.length; i<l; i++){
                        var tmp_match = matches[i].replace(/[\n]/g, "").replace(/\[[0-9]*\]\s/,"");
                        var tmp_match_txt = matches[i].replace(/[\n]/g, "")
                        tmp_match = '[link robotindex='+tmp_match+']'+tmp_match_txt+'[\/link]\n';
                        json.msg = json.msg.replace(matches[i], tmp_match);
                    }
                }
			}else if(json.type == 7  && xmlString){
				//（6.8.2合版）type 为 7 代表html消息，需要base64解码
                var matchArr = xmlString.replace(/</g, '&lt;').replace(/>/g, '&gt;').match("&lt;content&gt;(.+?)&lt;/content&gt;");
				if(matchArr && matchArr.length>=2){
					json.msg = $.base64.decode(matchArr[1]);
				}
            }else{
				json.msg = elementMessage.textContent || elementMessage.text;

				if( typeof json.msg == 'string' ){
					json.msg = json.msg.replace(/</g, '&lt;');
				}
			}

			body = $.extend({}, this.defBody, json, destInfo, {
				timestamp: timestamp
			});

			if( !this.hashSend.contains(body.msgid) && !this.hashReceive.contains(body.msgid) ){
				//no send message && no receive message
				this._callback('fIM_receiveMessage', [body]);

				this.hashReceive.add(body.msgid, body);
			}
		},
		/**
		 * @desc 登录成功,返回房间用户列表
		 * @param  {[type]} strUserList
		 * @return {[type]}
		 */
		remoteNotifyUserList: function(strUserList){
			//$.Log('tchat.remoteNotifyUserList(' + $.JSON.toJSONString(remoteNotifyUserList) + ')', 2);
			var userList = [];
			try{
				userList = $.JSON.parseJSON(strUserList);
			}catch(e){
				$.Log("remoteNotifyUserList toJSON abnormal", 3);
			}
			for(var i = 0; i < userList.length; i++){
				if( userList[i].userid == this.options.userid ){
					userList.splice(i, 1);
				}
			}

			this._callback('fIM_notifyUserNumbers', [userList.length]);

			this._callback('fIM_notifyUserList', [$.JSON.toJSONString(userList)]);
		},
		/**
		 * 连接tchat成功后返回客服的详细信
		 * @param  {[type]} destid
		 * @param  {[type]} destinfo
		 * @return {[type]}
		 */
		remoteSearchWaiter: function(destid, destinfo){
			//$.Log('tchat.remoteSearchWaiter(' + destid + ', ' + destinfo + ')', 2);
			this._callback('fIM_onGetUserInfo', [destinfo]);
		},
		/**
		 * 客服信息发生改变时返回新的客服信息
		 * @param  {[type]} userid
		 * @param  {[type]} userinfo
		 * @return {[type]}
		 */
		remoteNotifyUserInformation: function(userid, userinfo){
			//$.Log('tchat.remoteNotifyUserInformation(' + userid + ', ' + userinfo + ')', 2);
			if( userid == this.options.userid ){
				//访客信息不通知
				return;
			}
			this._callback('fIM_onGetUserInfo',[userinfo]);
		},
		/**
		 * 新客服进入房间时, 返回新客服信息
		 * @param  {[type]} destid
		 * @param  {[type]} destinfo
		 * @return {[type]}
		 */
		remoteNotifyUserEnter: function(destid, destinfo){
			//$.Log('tchat.remoteNotifyUserEnter(' + destid + ', ' + destinfo + ')');

			//2015.03.25 其它客服进入房间后，连线断开后只连接最新客服
			this.options.destid = destid;
			var connectParams = this._toArray(this.options, this.connectParams);
			if( this.connect ){
				this.connect.connectOptions.params = connectParams.join(',');
				this.connect.kaliveOptions.params = connectParams.join(',');
			}

			this._callback('fIM_notifyUserEnter', [this.options.destid, destinfo, '']);
		},
		/**
		 * 客服退出房间时, 返回客服信息
		 * @param  {[type]} destid
		 * @return {[type]}
		 */
		remoteNotifyUserLeave: function(destid){
			$.Log('tchat.remoteNotifyUserLeave(' + destid + ')', 2);

			this._callback('fIM_notifyUserLeave', [destid]);
		},
		/**
		 * 服务器通知断开连接
		 * @param  {[type]} clientid
		 * @param  {[type]} uid
		 * @return {[type]}
		 */
		remoteNotifyUserClose: function(clientid, uid){
			if( clientid != this.options.clientid ){
				//2015.03.20, 预防接收到非当前连接的userClose事件，导致连接断开
				return;
			}

			this._callback('fIM_ConnectResult', [5, '', '']);

			this.disconnect();

			this._callback('fIM_ConnectResult', [4, '', '']);
		},
		/**
		 * 通知会话场景信息, 用来判断评价按钮是否可用
		 * @param  {[type]} sceneStr
		 * @return {[type]}
		 */
		remoteNotifySessionScene: function(sceneStr){
			this._callback('fIM_onNotifySessionSence', [sceneStr]);
		},
		/**
		 * 通知访客客服正在输入
		 * @param  {[type]} sessionid
		 * @param  {[type]} sourceUid
		 * @return {[type]}
		 */
		remoteNotifyUserInputing: function(sessionid, sourceUid){
			this._callback('fIM_notifyUserInputing', [sourceUid]);
		},
		/**
		 * 客服邀请访客评价
		 * @param  {[type]} sessionid
		 * @param  {[type]} myuid
		 * @param  {[type]} myuname
		 * @return {[type]}
		 */
		remoteRequestEvalute: function(sessionid, myuid, myuname){
			this._callback('fIM_requestEvaluate', [myuid, myuname]);
		},
        /**
         * @method processSessionIdle 更新超时断线定时器
         */
        processSessionIdle: function() {
            var self = this;

            if( !this.sessionIdleTimeouts )
                this.sessionIdleTimeouts = {};

            $.each(this.sessionIdleReplys, function(key, timeoutID){
                if( self.sessionIdleTimeouts[key] ){
                    clearTimeout(self.sessionIdleTimeouts[key].id);
                }

                self.sendIdleReply(key);
            });
        },

        /**
         * @method (6.8.2合版-新添方法) 用于清楚超时断线定时器
         */
        clearSessionIdle: function() {
			var self = this;

            if( !this.sessionIdleTimeouts )
                this.sessionIdleTimeouts = {};

            $.each(this.sessionIdleReplys, function(key, timeoutID){
                if( self.sessionIdleTimeouts[key] ){
                    clearTimeout(self.sessionIdleTimeouts[key].id);
                }
            });
        },

        /**
         * @method sendIdleReply 发送断线回复
         * @param  String   key
         */
        sendIdleReply: function(key) {
            var self = this;
            var opt  = $.extend(this.sessionIdleTimeouts[key], {
                start: $.formatDate(),
                id: setTimeout(function(){
                    var i = 0,
                        connectMessage = self.sessionIdleReplys[key]
                    ;
                    delete self.sessionIdleReplys[key];

                    self.sessionIdleTimeouts[key].end = $.formatDate();
                    $.each(self.sessionIdleReplys, function(_k){
                        i++;
                    });
                    $.Log('setTimeout ' + key + 's ' + self.sessionIdleTimeouts[key].end + ', disconnect tchat', 1);

                    if ( i === 0 && self.connect && self.options.result ){
                        //--超时未发送消息且当前连接状态为已连接--
                        self._callback('fIM_ConnectResult', [4, '', connectMessage]);

                        self.disconnect();
                    }
                }, key * 1000)
            });
            this.sessionIdleTimeouts[key] = opt;
        },
		/**
		 * 按条件将json对像转换为数组
		 * @param  {json} json  源json对像
		 * @param  {Array} arr  需要获取的字段数组
		 * @return {Array}
		 */
		_toArray: function(json, arr){
			var result = [];
			if( !json ){
				return 'error';
			}
			for( var i = 0; i < arr.length; i++ ){
				result.push( !$.isDefined(json[ arr[i] ]) ? '' : json[ arr[i] ]);
			}
			return result;
		},
		/**
		 * 回调此对像内部方法
		 * @param  {String} methodName   方法名
		 * @param  {Array}  methodParams 方法参数
		 * @return {[type]}
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
			methodParams.push(this.options.settingid);
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
		 * @return {Boolean}
		 */
		_onCallback: function(isCurrentCallBack, args){
			var self = this, method;

			if( !args.length ){
				return;
			}
			method = args[0];

			if( method === "LoginResult" ){
				if( !isCurrentCallBack ){
					//2015.03.20 修复登录超过预设时长，丢弃已超时登录结果
					return false;
				}else{
					this.LoginResult.apply( self, args.slice(1) );
				}
			}else{
				this._handleResponse.call( self, method, args.slice(1) );

				if( isCurrentCallBack ){
					this.abnormalCount = 0;
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

			if( this.debug ) $.Log('TChat.onComplete( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )');

			if( args[0] == 'kalive' ){
				this.abnormalCount = 0;
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

			if( this.debug ) $.Log('TChat.onAbnormal( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )', 3);

			this.abnormalCount++;

			if( args[0] == 'login' || this.abnormalCount >= 3 ){
				this.abnormalCount = 0;

				//-更新超时断线定时器
				//this.processSessionIdle();

				this._callback('fIM_ConnectResult', [2, '', '\u8fde\u63a5\u670d\u52a1\u5668\u8d85\u65f6\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\uff01']);

				//登录失败或连续3次请求异常, 重新登录
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

			if( this.debug ) $.Log('TChat.onTimeout( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )', 3);

			//2015.06.09 comet原本因为登陆异常一次就通知UI层状态，改为3次登陆异常再通知UI层
			if( args[0] == 'login' ){
				this.loginAbnormalCount++;
			}

			this.abnormalCount++;

			if( this.loginAbnormalCount >= 3 || this.abnormalCount >= 5 ){
				this.abnormalCount = 0;
				this.loginAbnormalCount = 0;

				//-更新超时断线定时器
				//this.processSessionIdle();

				this._callback('fIM_ConnectResult', [2, '', '\u8fde\u63a5\u670d\u52a1\u5668\u8d85\u65f6\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\uff01']);

				//登录超时, 重新登录
				this.reconnect('time login');
			}else{
				this.kaliveConnect('timeout kalive');
			}
		},
		/**
		 * @desc	tchat时，初始化消息队列
		 * @return	{void}
		 */
		_initQueue: function(){
			var self = this;

			this.messageQueue = new $.Queue();
			this.messageQueue.first = function(){
				return this.queueFront();
			};
			//-消息队列中,同一msgid可能会有多条消息-
			this.messageQueue.nextMessage = function(msgid, index){
				index = index || 0;
				if( !this.list.length ) return null;
				else if( !msgid ) return this.list[0];
				for(var i = 0; i < this.list.length; i++ ){
					if( this.list[i].msgid == msgid && this.list[i].body.sendpacket == index ){
						return this.list[ i + 1 ];
					}
				}
				return null;
			};
			//移除消息队列中的消息
			this.messageQueue.removeMessage = function(msgid, index){
				var queue = [];index = index || 0;
				for(var i = 0; i < this.list.length; i++ ){
					if( this.list[i].msgid == msgid && (this.list[i].index == index || index == -1 ) ){
					}else{
						queue.push(this.list[i]);
					}
				}
				this.list = queue;
				this.length = queue.length;
			};
			this.messageQueue.addMessage = function(obj){
				for(var i = 0; i < this.list.length; i++ ){
					if ( this.list[i].msgid == obj.msgid && this.list[i].index == obj.index ) return false;
				}
				this.list.push(obj);
				this.length = this.list.length;
				return true;
			};
			this.messageQueue.getSendingNum = function(){
				var count = 0;
				for(var i = 0; i < this.list.length; i++ ){
					if( this.list[i].status ) count++;
				}
				return count;
			};

			window[ this.callback ] = function(){
				self._callbackComplete.apply(self, arguments);
			};
			//发送消息订时器
			this.sendIntervalID = setInterval(function(){
				self.verificationMessage();
			}, 1000);
		}
	};
})(nTalk);
