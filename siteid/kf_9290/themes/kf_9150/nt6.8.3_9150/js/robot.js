(function($, undefined){/*@file: robot.js */
    var emptyFunc = function(){};
	/** 
	 * 机器人会话消息同步发送的mcenter服务器
	 * ====================================================================================================================================================
	 * 机器人连接模块
	 * @class Robot
	 * @constructor
	 * @param json     options  连接参数
	 */
	$.Robot = $.Class.create();
	$.Robot.prototype = {
		name: 'Robot',
		options: null,
		callbackName: '',
		serviceRobot: '',
		hashSend: null,
		entityList: {
			"#":	""
		},
		//2015.05.13
		robotUserId: '',
		robotSessionID: '',
		sending: false,
		postTimeID: null,
		initialize: function(options){
			var self = this;
			
			this.hashSend = new $.HASH();
			this.callbackName = '__robot_callback';
			this.data	= $.store;
			this.options= $.extend({
				//设备类型：0:PC;1:微信;2:APP;3:WAP
				devicetype: $.browser.mobile ? 3 : 0,
				chattype:	'0',
				chatvalue:	'0'
			}, options
                /*,
				["siteid", "settingid", "surl", "cid", "u", "n", "sid", "groupid", "rurl", "statictis", "htmlsid", "userlevel", "disconnecttime", "mini", "chattype", "chatvalue"],
				["siteid", "settingid", "serverurl", "machineID", "userid", "username", "sessionid", "destid", "resourceurl", "statictis", "htmlsid", "userlevel", "disconnecttime", "mini", "chattype", "chatvalue"]
                */
			);
			
			//机器人ID,需要转换为标准客服ID
			if( $.CON_CUSTOMER_ID !== $.base.checkID(this.options.destid) ){
				this.options.destid = this.options.siteid + '_ISME9754_T2D' + this.options.destid;
			}
			//temp debug 当前测试siteid
			//this.options.siteid = 'kf_9979';
			this.serviceRobot = $.server.roboturl || '';
			
			window[this.callbackName] = function(result){
				try{
					result = typeof result == "string" ? $.JSON.parseJSON(result) : result;
				}catch(e){
					$.Log('Robot.callback:' + e.message, 3);
				}
				self._handleResponse(result);
			};
			
			if( !this.serviceRobot ){
				$.Log('serviceRobot is null', 3);
				return;
			}
			
			if( !this.options.machineID || this.options.machineID.length <= 10 ){
				this.options.machineID = this.data.get('machineid');
				
				if( !this.options.machineID || this.options.machineID.length <= 10 ){
					this.options.machineID = $.base._createScriptPCID();
				}
			}
			this.data.set('machineid', this.options.machineID);

			if( !this.options.userid ){
				this.options.userid = $.base.userIdFix + this.options.machineID.substr(0, 21);
			}
			this.robotUserId	= this.robotUserId    || this.options.siteid + '_ISME9754_T2D_webbot';
			this.robotSessionID = this.robotSessionID || this.options.siteid + '_ISME9754_' + $.getTime();
			
			//连接服务器
			this.connect();
		},
		connect: function(){
			var data;
			
			data = {
				data:{
					type:		'open',
					siteId:		this.options.siteid
				},
				clientid: this.options.machineID,
				callback: this.callbackName
			};
			
			$.require(this.serviceRobot + '?' + $.toURI(data) + '#rnd');
		},
		/**
		 * 回调此对像内部方法
		 * @return {[type]}
		 */
		_handleResponse: function(result){
			if( !result ) return;
			
			$.Log('nTalk.Robot._handleResponse(' + $.JSON.toJSONString(result) + ')', 1);
			var body = result.body, userinfo;
			switch( result.type ){
				case 'sessionopen':
					userinfo = {
						status:   1,
						nickname: $.lang.robot_name || '',
						userid:   body.userId || 'robotid',
						usericon: '',
						signature:'',
						sessionid:''
					};
					this.LoginResult(true, 0, userinfo, body.sessionId, '', $.getTime());
					break;
				case 'index':
				case 'txt':
					this.remoteSendMessage(body);
					break;
				case 'suggest':
					if( body.contents ){
						this.remoteSendSuggest(body);
					}
					break;
				default:
					this.sendAbnormal(result);
					break;
			}
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
			
			if( typeof userinfo == 'string' ){
				try{
					this.options.userinfo = $.JSON.parseJSON(userinfo);
				}catch(e){
				}
			}else{
				this.options.userinfo = userinfo || {};
			}
			
			if( this.options.result === 1 ){
				this.userinfo = $.extend({}, {
					myuid:		this.options.userid,
					myuname:	this.options.username,
					signature:	'',
					mylogo:		this.options.userinfo.usericon,
					sessionid:	this.robotSessionID, //this.options.sessionid,
					timesample:	this.options.time
				});
				
				//debug temp
				this.flashGoURL = this.serviceRobot + '?' + $.toURI({
					data: {
						type: 'close',
						sessionId:	this.options.sessionid,
						siteId:		this.options.siteid,
						userId:		this.options.userinfo ? this.options.userinfo.userid : ''
					},
					clientid:       this.options.machineID,
					callback:		this.callbackName
				});
				
				this._callback('fIM_setTChatGoServer', [this.flashGoURL]);
			}
			
			//-更新超时断线定时器
			this.processSessionIdle();
			
			this._callback('fIM_tchatFlashReady', [this.options.userid, this.options.machineID, this.options.settingid]);
			
			this._callback('fIM_ConnectResult', [this.options.result, this.userinfo, '']);
			
			this._callback('fIM_notifyUserNumbers', [0]);
			
			this._callback('fIM_notifyUserList', [""]);
		},
		/**
		 * @method remoteSendMessage 接收消息
		 * @param  {json} body
		 * @return {type}
		 */
		remoteSendMessage: function(body){
			var data, content, time = $.getTime();
			
			if( body.content ){
				content = body.content;
			}else{
				content = ($.lang.robot_question_tip || '') +  "\r";
				$.each(body.contents, function(i, bodyContent){
					content += '[link robotindex=' + (i + 1) + ']' + (i + 1) + ". " + bodyContent + "[/link]\r";
				});
			}
			data = {
				bold:	"false",
				italic:	"false",
				color:	"000000",
				fontsize:"12",
				underline:"false",
				msg:	content,
				msgid:	time + 'S',
				type:	1,
				logo:	'',
				userid:	this.options.destid,
				name:	'',
				timestamp:time
			};
			
			//机器人返回消息存入待发送队列
			this.addPostMessage(data);
			
			this._callback('fIM_receiveMessage', [data]);
		},
		/**
		 * @method remoteSendMessage 接收消息
		 * @param  {json} body
		 * @return {type}
		 */
		remoteSendSuggest: function(body){
			
			if( !body.contents || !body.contents.length ){
				return;
			}
			
			this._callback('fIM_suggestMessage', [body.contents]);
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
		 * public method
		 */
		sendMessage: function(msg, element){
			var self = this, data, json;
			
			$.Log('nTalk.Robot.sendMessage()');
			
			json = $.isObject(msg) ? msg : $.JSON.parseJSON(msg);
			if( json.type != 1 ){
				//非常规文本消息，忽略
				return;
			}
			json = $.extend({
				userid:	this.options.userid,
				name:	'',
				logo:	''
			}, json);
			this.hashSend.add(json.msgid, json);
			
			var funcAbnormal = function(element){
				if( element.error ){
					self.sendAbnormal( json.msgid );
				}
		    };
			
			//机器人返回消息存入待发送队列
			this.addPostMessage(json);
			
			data = {
				data:{
					//2015.04.15 发送建议内容索引时传botindex
					type: 		json.botindex || 'txt',
					siteId:		this.options.siteid,
					sessionId:	this.options.sessionid,
					userId:		this.options.userinfo.userid || '',
					body: {
						content: this.charFilter(json.msg)
					}
				},
				clientid: this.options.machineID,
				callback: this.callbackName
			};
			
			//-更新超时断线定时器
			this.processSessionIdle();
			
			$.require(this.serviceRobot + '?' + $.toURI(data) + '#rnd', funcAbnormal);
		},
		predictMessage: function(msg){
			var self = this, data;

			$.Log('nTalk.Robot.predictMessage("' + msg + '")');
			if( !msg ){
				return;
			}
			
			data = {
				data:{
					type:		'suggest',
					siteId:		this.options.siteid,
					sessionId:	this.options.sessionid,
					userId:		this.options.userinfo.userid || '',
					body: {
						content: this.charFilter(msg)
					}
				},
				clientid: this.options.machineID,
				callback: this.callbackName
			};
			
			//-更新超时断线定时器
			//this.processSessionIdle();
			
			$.require(this.serviceRobot + '?' + $.toURI(data) + '#rnd');
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
				},data)
			;
			
			this._callback('fIM_receiveMessage', [body]);
		},
		closeTChat: function(){
		    window[this.callbackName] = emptyFunc;
			return;
		},
		disConnect: function(){
			return;
		},
		
		/**
		 * [processSessionIdle description]
		 * @return {[type]}
		 */
		processSessionIdle: function() {
			if( !this.sessionIdleTimeouts )
				this.sessionIdleTimeouts = {};
			
			for (var key in this.sessionIdleReplys) {
				if (this.sessionIdleTimeouts[key])
					clearTimeout(this.sessionIdleTimeouts[key]);
				this.sendIdleReply(key);
			}
		},
		/**
		 * [sendIdleReply description]
		 * @param  {[type]} key
		 * @return {[type]}
		 */
		sendIdleReply: function(key) {
			var self = this;
			this.sessionIdleTimeouts[key] = setTimeout(function(){
				var i = 0,
					connectMessage = self.sessionIdleReplys[key]
				;
				delete self.sessionIdleReplys[key];
				
				for(var _k in self.sessionIdleReplys){
					if( typeof self.sessionIdleReplys[_k] == 'function' ) continue;
					i++;
				}
				$.Log('setTimeout ' + key + 's, disconnect tchat', 1);

				if ( i === 0 && self.connect && self.options.result ){
					//--超时未发送消息且当前连接状态为已连接--
					self.disconnect();
					self._callback('fIM_ConnectResult', [4, '', connectMessage]);
				}
			}, key * 1000);
		},
		
		/**
		 * 字符过滤
		 * @param  json param 要过滤的json对像
		 * @return json       返回过滤后的json
		 */
		charFilter: function(param){
			var self = this, rp, k,
				replace = function(str){
					str = '' + str;
					for(var k in self.entityList){
						if( typeof self.entityList[k] == 'function' ) continue;
						str = str.replace(new RegExp("" + k + "", 'g'), self.entityList[k]);
					}
					return str;
				}
			;
			if( $.isArray(param) ){
				rp = [];
				for(k = 0; k<param.length; k++){
					if( typeof(param[k]) == 'object' ){
						rp[k] = $.charFilter( param[k] );
					}else if( typeof(param[k]) == 'string' ){
						rp[k] = replace( param[k] );
					}else{
						rp[k] = param[k];
					}
				}
			}else if( typeof(param)=="object" ){
				rp = {};
				for(k in param){
					if( typeof(param[k]) == 'function' ){
						continue;
					}else if( typeof(param[k]) == 'object' ){
						rp[k] = $.charFilter( param[k] );
					}else if( typeof(param[k]) == 'string' ){
						rp[k] = replace( param[k] );
					}else{
						rp[k] = param[k];
					}
				}
			}else{
				rp = replace( param );
			}
			return rp;
		},
		/**
		 * @method addPostMessage 消息加载队列
		 * @param {object} data
		 */
		addPostMessage: function(data){
			if( !this.messageQueue ){
				this.messageQueue = new $.Queue();
			}
			
			this.messageQueue.enQueue(data);
			
			this.postMCenter();
		},
		/**
		 * @method filterLink 过滤自定义标签
		 * @param  {String} message 消息内容
		 * @return {String}         
		 */
		filterLink: function(message){
			return message.toString().replace(/\[\/?link(.*?)\]/gi, '');
		},
		/**
		 * @method postMCenter 机器人会话消息同步发送到会话服务器
		 */
		postMCenter: function(){
			var self = this, body,
				url = $.server.mcenter + 'message.php?m=Message&a=saveRobotMsg&ts=' + $.getTime(),
				pdata = {
					siteid:		this.options.siteid,
					sessionid:	this.robotSessionID,
					destid:		this.robotUserId,
					myuid:		this.options.userid,
					data:		[]
				}
			;
			
			if( this.sending === true || this.messageQueue.isEmpty() ){
				$.Log('sending or messageQueue.isEmpty');
				return;
			}
			this.sending = true;
			
			if( (body = this.messageQueue.deQueue()) ){
				pdata.data.push({
					userid:		body.userid == this.options.userid ? body.userid : this.robotUserId,
					username:	body.name,
					type:		body.type,
					msgid:		body.msgid,
					timestamp:  body.timerkeyid || body.timestamp,
					msg:		this.filterLink(body.msg)
				});
			}
			
			if( !pdata.data.length ) return;
			
			new $.POST(url, pdata, function(event){
				$.Log('send hidtory message complete');
				clearTimeout(self.postTimeID);
				self.postTimeID = null;
				
				setTimeout(function(){
					self.sending = false;
					self.postMCenter('complete');
				}, 50);
			});
			
			//-发送消息记录超时保护
			this.postTimeID = setTimeout(function(){
				clearTimeout(self.postTimeID);
				self.postTimeID = null;
				self.sending = false;
				self.postMCenter('timeout');
			}, 10000);
		}
	};
})(nTalk);