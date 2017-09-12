(function($, undefined){
    var CON_UID = "ntguest";
    var CON_PWD = "xiaoneng123";

    //服务器连接对像，用于Mqtt连接
    $.Connection = {
        name: "Connection",
        debug:  false,
        client: null,
        mqttMessageTopic:"",// C/a
        mqttWillTopic:"",   // S/WILL/a
        chatRouteTopic:"",  // S/ROUTE/TCHAT
        sessionId:"",
        //private prototype
        _urlExp: /(wss?:)\/\/(.*?):(\d+)\/(\w+)/gi,
        _ssl: false,
        _mqttserver:"",
        _clientId:"",
        _protocol:"",
        _host:"",
        _port:80,
        _path:"",
        _options:"",
        _conn: false,
        _reconnectCount: 0,
        _waitTime: 0,
        _timeout: 6,
        _keepAliveInterval: 60,
        eventCallback: {
            onConnectSuccess: {},
            onConnectFailure: {},
            onResponse: {},
            onPublish: {}
        },
        /**
         * @param  {string|array} url      mqtt服务器地址
         * @param  {string}       clientId
         */
        connect: function(url, clientId){
            this._conn = true;
            if( !this.client || !this.client.isConnected() ){

                return this._connectMqtt(url, clientId);
            }else{
                //connected
                this._fireEvent("onConnectSuccess", this.mqttMessageTopic);
            }
            return true;
        },
        disconnect: function(){
            this._conn = false;
            if( this.client && this.client.isConnected() ){

                this._disconnectMqtt();
            }
        },
        /**
         * @method 发送消息
         * @param Object jsonMessage json形式消息串
         * @param String topic
         */
        publish: function(jsonMessage, topic){
            var strMessage, objMessage;
            if( !this.client || !this.client.isConnected() ){
                if( this.debug ){
                    $.Log(this._clientId + " publish failure, client disconnect", 3);
                }

                return false;
            }
            if( !jsonMessage || typeof jsonMessage !== "object" ){
                if( this.debug ){
                    $.Log(this._clientId + " publish param jsonMessage failure", 3);
                }
                return false;
            }
            strMessage = $.JSON.toJSONString(jsonMessage);

            topic = topic || this.chatRouteTopic;
            if( !topic ){
                if( this.debug ){
                    $.Log(this._clientId + " publish param topic is null>" + strMessage);
                }
                return false;
            }
            objMessage = this._mqttMessage(strMessage, topic);

            if( this.debug ){
                $.Log(this._clientId + " $.Connection.publish(" + strMessage + ", " + topic + ")", 2);
            }

            return this.client.send(objMessage);
        },
        /**
         * 注册回调函数名
         * @method register
         * @param String   eventName   注册事件名
         * @param Function callback    函数名或函数引用
         */
        register: function(appId, eventName, callback){
            var arr, method, registered = false;
            var self = this;

            if( typeof callback === "function" ){
                if( typeof this.eventCallback[eventName] === "undefined" ){
                    this.eventCallback[eventName] = {};
                }
                $.each(this.eventCallback[eventName], function(key, func){
                    //已注册函数
                    if( func === callback || appId === key ){
                        registered = true;
                    }
                });
                if( registered !== true ){
                    if( this.debug ){
                        $.Log(this._clientId + " $.Connection.reqister(" + eventName + ")");
                    }
                    this.eventCallback[eventName][appId] = callback;
                }
            }else if( typeof callback === "string" ){
                arr = methodName.split(".");
                mehtod = $;
                $.each(arr, function(i, value){
                    mehtod = mehtod[value];
                });
                if( typeof this.eventCallback[key] === "undefined" ){
                    this.eventCallback[key] = {};
                }
                $.each(this.eventCallback[eventName], function(key, func){
                    //已注册函数
                    if( func === mehtod || appId === key ){
                        registered = true;
                    }
                });
                if( registered !== true ){
                    if( this.debug ){
                        $.Log(this._clientId + " $.Connection.reqister(" + methodName + ")");
                    }
                    this.eventCallback[eventName][appId] = mehtod;
                }
            }
        },
        unregister: function(appId){
            var self = this;
            $.each(this.eventCallback, function(methodName, methods){
                $.each(methods, function(key, func){
                    if( key === appId ){
                        delete self.eventCallback[methodName][key];
                    }
                });
            });
        },
        /**
         * @mehtod 订阅
         * @param String topic
         */
        subscribe: function(topic, options){
            if( !this.client || !this.client.isConnected() ){
                return false;
            }
            if( this.debug ){
                $.Log(this._clientId + " $.Connection.subscribe(" + topic + ")");
            }

            var self = this;
            options = $.extend({qos: 1}, options);
            this.client.subscribe(topic, options);
        },
        /**
         * @mehtod 退订
         * @param String topic
         */
        unsubscribe: function(topic){
            if( !this.client || !this.client.isConnected() || !topic ){
                return false;
            }

            if( this.debug ){
                $.Log(this._clientId + " $.Connection.unsubscribe(" + topic + ")");
            }

            this.client.unsubscribe(topic);
        },

        //callback function
        /**
         * @method 连接失败
         */
        onConnectionLost: function(response){
            var self = this;

            if (response.errorCode === 0) {
                return;
            }
            if( this.debug ){
                $.Log(this._clientId + " $.Connection.onConnectionLost() > " + response.errorMessage, 3);
            }

            //连接断开，重新连接Mqtt服务器
            this._reconnectMqtt();
        },
        /**
         * @method 接收消息
         */
        onPublish: function(message){
            var data, method;

            if( !this.client || !this.client.isConnected() ){
                return false;
            }

            if( this.debug ){
                //console.log("receive: " + message.payloadString);
                $.Log(this._clientId + " $.Connection.onPublish() > " + message.payloadString, 2);
            }

            /*
            //debug
            if( message.payloadString.indexOf("remoteNotifyUserList") > -1 ){
                message.payloadString = message.payloadString.replace(/hasConnTchat/gi, "testtitle\":\"\\\u2014\",\"hasConnTchat");
            }
            */
            try{
                data   = $.JSON.parseJSON(message.payloadString);
            }catch(e){
                data = {};
                $.Log('$.Connection.onPublish(): ' + e.message, 3);
            }
            method = data.method || "";

            if( method === "responseServer" ){
                this.responseServer.apply(this, Array.prototype.concat.call([message.destinationName], data.params) );
            }else if( method ){
                this._fireEvent("onPublish", Array.prototype.concat.call([message.destinationName, method], data.params) );
            }
        },
        /**
         * @method 申请虚拟连接
         * @param String  topic      消息连接对应topic
         * @param String  cTopic     客户端消息上行的topic
         * @param String  cWillTopic 客户端订阅服务器的遗言topic
         * @param String  sTopic     服务端消息下行的topic
         * @param String  sId        会话ID
         */
        responseServer: function(topic, cTopic, cWillTopic, sTopic, sId){
            var self = this;

            //客户端订阅服务器的遗言
            this.subscribe( cWillTopic, {
                onSuccess: function(result){
                    if( this.debug ){
                        $.Log(self._clientId + " $.Connection.subscribe()>" + $JSON.toJSONString(result), 2);
                    }
                },
                onFailure: function(error){
                    if( this.debug ){
                        $.Log(self._clientId + " $.Connection.subscribe()>" + $JSON.toJSONString(error), 3);
                    }

                    //虚拟服务器连接异常，重新连接
                    self._fireEvent("onConnectSuccess", self.mqttMessageTopic);
                }
            } );

            //订阅服务端下行消息
            this.subscribe( sTopic );

            this._fireEvent("onResponse", topic, cTopic, cWillTopic, sTopic, sId);
        },
        getRegisterMethod: function(){
            return this.eventCallback;
        },
        ////// private method //////////////////////////
        /**
         * @method 连接MQTT服务器
         */
        _connectMqtt: function(url, clientId){
            var self       = this;
            var mqttserver = url;

            if( !this._mqttserver || this._mqttserver !== mqttserver ){
                mqttserver      = mqttserver || this._mqttserver;

                if( !this._format( mqttserver ) ){
                    return false;
                }
                this.chatRouteTopic   = "S/ROUTE/" + this._path;
            }

            if( !this._clientId || this._clientId !== clientId ){
                this._clientId = clientId || this._clientId;
                if( !this._clientId ){
                    return false;
                }

                //init topic
                this.mqttMessageTopic = "C/" + this._clientId;
                this.mqttWillTopic    = "S/WILL/" + this._clientId;
            }

            this._options = {
                userName: CON_UID,
                password: CON_PWD,
                useSSL: this._ssl,
                timeout: this._timeout,
                keepAliveInterval: this._keepAliveInterval,
                cleanSession: false,
                willMessage: this._mqttMessage("{}"),
                mqttVersion: 4,
                onSuccess: function(){
                    self._success();
                },
                onFailure: function(e){
                    self._failure(e);
                }
            };

            if( $.browser.supportMqtt ){
                if( !this.client ){
                    if( this.debug ){
                        $.Log("connect mqtt server", 2);
                    }
                    this.client = new $.MQTT.Client(this._host, this._port, this._clientId);
                    this.client.onConnectionLost = function(response){
                        self.onConnectionLost(response);
                    };
                    this.client.onMessageArrived = function(message){
                        self.onPublish(message);
                    };
                }else{
                    if( this.debug ){
                        $.Log("reconnect mqtt server", 2);
                    }
                }
                this.client.connect(this._options);

                if( this.debug ){
                    this.client.startTrace();
                }
            }else{
                this.client = $.MQTT.flashSock;
                this.client.onConnectionLost = function(response){
                    self.onConnectionLost(response);
                };
                this.client.onMessageArrived = function(message){
                    self.onPublish(message);
                };
                this.client.init(this._host, this._port, this._clientId, this._options);
            }
        },
        _reconnectMqtt: function(){
            if( (!this.client || !this.client.isConnected()) && this._conn ){
                var self = this;

                //3次连接失败，3-7秒等待后再次重新连接
                if( ++this._reconnectCount <= 3 ){
                    this._waitTime = 50;
                }else{
                    this._waitTime = +("034567890".charAt(Math.ceil(Math.random()*5))) * 1000;
                }
                if( this.debug ){
                    $.Log(this._clientId + " wait recontent mqtt:" + this._waitTime, 3);
                }
                //if( this._reconnectCount > 3 ){
                //MQTT连接3次异常，抛出错误
                this._fireEvent("onConnectFailure", this.mqttMessageTopic);
                //}
                setTimeout(function(){
                    self._connectMqtt( self._mqttserver, self._clientId );
                }, this._waitTime);
            }
        },
        _disconnectMqtt: function(){
            var message = this._mqttMessage("{}");
            this.publish( message, this.mqttWillTopic );

            //取消订阅
            this.unsubscribe( this.mqttMessageTopic );

            if( this.client ){
                if( this.debug ){
                    this.client.stopTrace();
                }
                this.client.disconnect();

                //断开mqtt连接，清空缓存数据
                if( this.client.clear ){
                    this.client.clear();
                }
            }
            this.client = null;
        },
        /**
         * @method 格式化参数
         * @param {array|string} url mqtt服务器地址
         */
        _format: function( mqttserver ){
            var math, url;

            if( !mqttserver || mqttserver === "" ){
                return false;
            }
            if( $.isObject(mqttserver) ){
                url = $.browser.supportMqtt&&mqttserver.ws ? mqttserver.ws : mqttserver.tcp ? mqttserver.tcp : "";
            }else{
                url = mqttserver;
            }
            math = this._urlExp.exec(url);
            if( !math || !math.length ){
                math = url.replace(/(wss?|tcp):\/\//gi, ",$1,")
                        .replace(/:(\d+)/gi, ",$1").replace(/\//gi, ",")
                        .split(",");

                if( !math || !math.length ){
                    $.Log("url:" + url + ", math:" + math, 2);
                }
            }
            this._protocol = math[1] || "ws:";
            this._ssl  = this._protocol === "wss:";
            this._host = math[2];
            // (6.8.2合版) 未读取到端口号时，wss使用443，ws使用80 端口
            this._port = Number(math[3]) || (this._ssl ? 443 : 80);
            this._path = math[4] || "mqtt";
            this._mqttserver  = url;

            return true;
        },
        /**
         * @method 连接MQTT服务器成功
         */
        _success: function(){
            if( this.debug ){
                $.Log(this._clientId + " $.Connection connect success.");
            }
            this._reconnectCount = 0;
            //订阅
            this.subscribe( this.mqttMessageTopic );

            //requestServer
            this._fireEvent("onConnectSuccess", this.mqttMessageTopic);
        },
        /**
         * @method 连接MQTT服务器失败
         */
        _failure: function(e){
            if( this.debug ){
                $.Log(this._clientId + " $.Connection connect failure.");
            }

            this._fireEvent("onConnectFailure", this.mqttMessageTopic);

            //连接断开，重新连接Mqtt服务器
            this._reconnectMqtt();
        },
        /**
         * @method 触发连接事件
         */
        _fireEvent: function(){
            var me = this;
            var args = Array.prototype.slice.call(arguments);
            var method = args[0];
            var params = args.slice(1);

            $.each(this.eventCallback[method], function(key, func){
                if( method === "onResponse" ){
                    func.apply(me, params.slice(1) );
                }else{
                    func.apply(me, params );
                }
            });
        },
        /**
         * @method 转换为mqtt消息
         */
        _mqttMessage: function(strMessage, topic){
            var message = new $.MQTT.Message(strMessage);

            topic = topic || this.mqttWillTopic;
            message.qos = 1;
            message.destinationName = topic;
            return message;
        }
    };

    $(window).bind('unload', function(){
        $.Connection.disconnect();
    });
})(nTalk);

(function($, undefined){
    /** ====================================================================================================================================================
     * js实现mqtt.tchat连接对像,用于不对持flash或flash异常时，连接Tchat服务
     * @class mqttChat
     * @constructor
     * @param json     options  连接参数
     */
    $.Connection.TChat = $.Class.create();
    $.Connection.TChat.prototype = {
        name: 'TChat',
        options: null,
        data: null,
        connect: null,
        debug: false,
        login: false,
        connected: false,
        status: false,
        defBody: {
            bold: false,
            italic: false,
            color: "000000",
            fontsize: "14",
            underline: false
        },
        clientWillTopic: "",
        serverTopic: "",
        clientTopic: "",
        _reconnect_mqtt_count: 0,
        _reconnect_tchat_count: 0,
        _waitReconnectTimeID: null,
        _roomConnectTimeID: null,
        _roomConnectTimeout: 5000,
        roomConnectTimeout: 2000,
        robotQueue: 0, //(6.8.2合版 新增参数) 标识是否在机器人排队状态  0代表没有排队 1代表可能准备排队 2代表正在排队
        initialize: function(options){
            this.sendHASH     = new $.HASH();
            this.receiveHASH  = new $.HASH();
            this.completeHASH = new $.HASH();
            this.data  = $.store;
            this._reconnect_tchat_count = 0;
            this._reconnect_mqtt_count  = 0;

            this.options = $.extend({
                //设备类型：0:PC;1:微信;2:APP;3:WAP
                deviceType: $.browser.mobile ? 3 : 0,
                chatType:    '0',
                chatValue:    '0'
            }, $.whereGet(options,
                //["siteid", "settingid", "tchatgoserver", "surl", "cid", "u", "n", "sid", "groupid", "rurl", "statictis", "htmlSid", "userLevel", "disconnecttime", "mini", "chatType", "chatValue"],
                //兼容转换参数命名
                ["siteid", "settingid", "tchatmqttserver", "tchatgoserver", "serverurl", "machineID", "userid", "username", "sessionid", "destid", "resourceurl", "statictis", "htmlsid", "connectid", "userlevel", "disconnecttime", "mini", "chattype", "chatvalue"],
                ["siteId", "settingId", "tchatmqttserver", "tchatgoserver", "serverurl", "machineID", "userId", "userName", "sessionId", "targetId", "resourceurl", "statictis", "htmlSid", "connectId", "userLevel", "disconnectTime", "mini", "chatType", "chatValue"]
            ));

            if( !this.options.machineID || this.options.machineID.length <= 10 ){
                this.options.machineID = this.data.get('machineid');

                if( !this.options.machineID || this.options.machineID.length <= 10 ){
                    this.options.machineID = $.base._createScriptPCID();
                }
            }
            this.data.set('machineid', this.options.machineID);

            //mqttserver内含tcp\ws两个地址
            //2016/02/17 修改为不支持websock时，采用flashsock
            var tchatmqttserver = this.options.tchatmqttserver.toString().split(';');
            this.options.tchatmqttserver = {};
            for(var i=0; i< tchatmqttserver.length; i++){
                if( !tchatmqttserver[i] ) continue;
                if( tchatmqttserver[i].indexOf("ws") > -1 ){
                    this.options.tchatmqttserver.ws = tchatmqttserver[i];
                }
                else if( tchatmqttserver[i].indexOf("tcp") > -1 ){
                    this.options.tchatmqttserver.tcp = tchatmqttserver[i];
                }
            }

            //mqtt连接ID
            //this.clientId = this.options.machineID.toString().replace(/\-/gi, '').substr(-21);
            //this.clientId = "v_" + this.options.htmlSid;
            //MQTT clientId 当前页首次打开聊窗（chatMangage）时创建
            this.clientId = this.options.connectId;

            if( !this.options.userId ){
                this.options.userId = $.base.userIdFix + this.options.machineID.substr(0, 21);
            }

            if( this.debug ){
                $.Log('initialize mqtt chatConnect');
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

            $.Log('connect tChat', 1);

            this.connect = $.Connection;
            this.connect.register(this.options.settingId, "onConnectSuccess", function(){

                //console.warn("onConnectSuccess//////////////////////////");
                self.requestServer();
            });
            this.connect.register(this.options.settingId, "onConnectFailure", function(){
                //服务器返回消息
                self._onAbnormal.apply(self, arguments);
            });
            this.connect.register(this.options.settingId, "onResponse", function(cTopic, cWillTopic, sTopic, settingId){

                //console.warn("onResponse//////////////////////////");
                self.roomConnect(cTopic, cWillTopic, sTopic, settingId);

            });
            this.connect.register(this.options.settingId, "onPublish", function(){

                //服务器返回消息
                self._onCallback.apply(self, arguments);
            });

            this.connect.connect(this.options.tchatmqttserver, self.clientId);

            this.sessionIdleReplys = {};

            this.sessionIdleReplys[+(this.options.disconnectTime)] = '\u8d85\u65f6\u672a\u53d1\u9001\u6d88\u606f\uff0c\u81ea\u52a8\u65ad\u5f00\u8fde\u63a5';
        },
        requestServer: function(){
            var self = this;

            if( this.connected ){
                return false;
            }
            this.connected = true;
            this.connect.publish({
                method: "requestServer",
                params: [this.options.userId, this.clientId, this.options.settingId,this.options.targetId, this.options.sessionId]
            }, this.connect.chatRouteTopic);

            this._roomConnectTimeID = setTimeout(function(){

                //超时未接收到服务器响应,重新发起虚拟连接请求
                self.reconnect();
            }, this._roomConnectTimeout);
        },
        roomConnect: function(cTopic, cWillTopic, sTopic, settingId){
            var self = this;
            if( this.options.settingId !== settingId ){
                return false;
            }

            $.Log("$.Connection.TChat.roomConnect(" + cTopic + ", " + cWillTopic +", " + sTopic + ", " + settingId + ")");

            this.clientTopic       = cTopic;
            this.clientWillTopic   = cWillTopic;
            this.serverTopic       = sTopic;

            this.connect.publish({
                method: "roomConnect",
                params: [this.options.userId, "", this.options.sessionId, this.options.targetId, this.options.machineID,this.options.deviceType,this.options.chatType, this.options.chatValue,this.options.userName,this.options.userLevel,this.options.settingId]
            }, this.clientTopic);
        },
        stopReroomConnect: function(){
            clearTimeout(this._roomConnectTimeID);
            this._roomConnectTimeID = null;
        },
        /**
         * 保持tchat连接
         * @return
         */
        startKaliveConnect: function(){
            var self = this;

            this.stopKaliveConnect();
            this.kaliveTimeId = setInterval(function(){
                $.Log('nTalk.TChat.kaliveConnect()', 1);

                self.connect.publish({
                    method: "remoteKeepAlive",
                    params: [self.options.clientId, self.options.userId]
                }, self.clientTopic);
            }, 60000);
        },
        stopKaliveConnect: function(){
            clearInterval(this.kaliveTimeId);
            this.kaliveTimeId = null;
        },
        /**
         * 重新连接Tchat
         * @return
         */
        reconnect: function(){
            var self = this;
            this.connected = false;
            //取消订阅
            this.connect.unsubscribe( this.clientWillTopic );
            this.connect.unsubscribe( this.serverTopic );
            this.connect.unregister(this.options.settingId);

            //3次登录失败，3-7秒等待后再次重新连接
            if( ++this._reconnect_tchat_count <= 3 ){
                this._waitTime = 500;
            }else{
                this._waitTime = +("034567890".charAt(Math.ceil(Math.random()*5))) * 1000;
            }
            $.Log("TChat.reconnect(): waitTime:" + this._waitTime);
            if( !this.status ){
                $.Log('stop reconnect');
                return;
            }

            this._waitReconnectTimeID = setTimeout(function(){

                self.loginConnect();
            }, this._waitTime);
        },
        /**
         * 断开mqttChat连接
         * @return
         */
        disconnect: function(){
            var self = this;
            for (var key in this.sessionIdleReplys) {
                if( !this.sessionIdleTimeouts ) continue;
                if (this.sessionIdleTimeouts[key]){
                    clearTimeout(this.sessionIdleTimeouts[key].id);
                }
            }
            //停止继续保持
            this.status    = false;
            this.login     = false;
            this.connected = false;
            clearTimeout(this._waitReconnectTimeID);
            this._waitReconnectTimeID = null;

            //停止发起心跳
            this.stopKaliveConnect();

            if( self.options.clientId && this.clientTopic ){
                this.connect.publish({
                    method: "remoteEndConnection",
                    params: [self.options.clientId, self.options.userId]
                }, this.clientTopic);
            }

            //取消订阅
            this.connect.unsubscribe( this.clientWillTopic );

            this.connect.unsubscribe( this.serverTopic );

            this.connect.unregister(this.options.settingId);
            //this.connect.disconnect();
            this.clientTopic       = "";
            this.clientWillTopic   = "";
            this.serverTopic       = "";
        },
        /**
         * 通过mqttChat发送消息
         * @param  json|strJSON data 字符串json消息
         * @return
         */
        sendMessage: function(data){
            var message, attributes;

            data = $.isObject(data) ? data : $.JSON.parseJSON(data);
            //filter body
            data = $.charFilter(data);

            //get type, msgid
            attributes = $.whereGet(data, ["type", "msgid"], ["type", "msgid"]);

            //file, image, audio
            if( data.url ){
                attributes = $.extend(attributes, $.whereGet(data, ["url", "emotion", "oldfile", "size", "extension", "sourceurl", "mp3", "length"]));
            }
            message = {
                flashuid: data.timerkeyid,
                msgid:    data.msgid,
                src:      data,
                json:     {},
                xml:      ""
            };
            if( typeof  data.msg === "object" ){
                message.json.msg = $.extend(data.msg, {attributes: attributes});
            }else{
                attributes  = $.extend({}, attributes, this.defBody);
                message.json.msg = $.extend({text: data.msg}, {attributes: attributes});
            }
            if( data.msg.evaluate ){
                message.json.msg.evaluate = $.JSON.toJSONString(data.msg.evaluate);
            }
            message.xml = $.jsonToxml(message.json);

            this.sendHASH.add(message.msgid, message);

            //-非系统消息 更新超时断线定时器（且不处于机器人排队状态时，更新超时断线定时器）
            if( data.type !== 5 && !this.robotQueue){
                this.processSessionIdle();
            }

            //加入队列
            this.messageQueue.addMessage( message );

            this.startSend( message );
        },
        /**
         * 消息发送失败
         * @param  String msgid 消息ID
         * @return
         */
        sendAbnormal: function(msgid){
            if( this.completeHASH.contains(msgid) ){
                //发送成功未收到回应，但服务器下行消息中已推送
                return;
            }
            var message    = this.sendHASH.items(msgid);
            var timesample = $.getTime();
            var src = $.extend({
                type:    9,
                msgType: 2,
                timesample: timesample,
                msgid:      timesample + 'J',
                userid:     "system"
            }, message.src);

            this._callback('fIM_receiveMessage', [src]);
        },
        /**
         * 开始发送消息队列中的消息
         * @param  Object message json消息内容
         * @return
         */
        startSend: function(message){
            if( !message || !this.login ){
                //队列中没有消息或连接断开
                return;
            }
            if( !message.timestamp || !message.recount ){
                //本条消息非重新发送时，直接发送
                message.timestamp = $.getTime();
                message.recount    = 1;
            }

            this.connect.publish({
                method: "remoteSendMessage",
                params: [this.options.userId, this.options.clientId, this.options.sessionId, message.xml, message.flashuid]
            }, this.clientTopic);
        },
        /**
         * 消息发送完成
         * @param  Boolean  result 消息发送状态
         * @param  String   msgid  消息ID
         * @return
         */
        _callbackComplete: function(result, msgid){
            if( result ){
                //if( this.debug )$.Log('_callbackComplete::removeMessage ' + msgid + ', index:' + index);
                this.messageQueue.removeMessage( msgid );
                this.completeHASH.add(msgid, this.sendHASH.items(msgid));
            }
        },
        /**
         * 验证队列中的消息是否已发送成功,超时消息抛出异常
         * @return
         */
        verificationMessage: function(){
            var message = this.messageQueue.first(),
                curTimestamp = $.getTime(),
                msgid, index, sendCount = 0,
                SEND_MAX_PERTIME = 2
            ;

            while( message ){
                if( message.src.type === 5 ){
                    //系统消息不验证，发送一次后直接从消息队列中删除
                    this.messageQueue.removeMessage( message.msgid);
                }
                else if( curTimestamp - message.timestamp >= 3000 ){
                    //-发送超时,3秒未移除
                    if( message.recount >= 3 ){
                        //-3次重试失败，抛出异常,从队列中清除
                        //-分包时只要有一条消息发送失败，要返回整条消息发送失败的提示，
                        this.sendAbnormal(message.msgid);
                        //-删除队列中同一msgid的所有消息
                        this.messageQueue.removeMessage( message.msgid );
                    }else{
                        if( sendCount >= SEND_MAX_PERTIME ){
                            message = this.messageQueue.nextMessage(message.msgid);
                            continue;
                        }
                        sendCount++;
                        //-重新发送
                        message.timestamp = curTimestamp;
                        message.recount++;

                        if( !this.login ){
                            //断线后不再尝试,全部抛出
                            this.sendAbnormal(message.msgid);
                        }else{
                            this.startSend(message);
                        }
                    }
                }

                message = this.messageQueue.nextMessage(message.msgid);
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
                this.defBody.fontsize = data.fontsize;
            }
        },
        /**
         * 发送正在输入的消息(消息预知)
         * @param  String message 消息预知内容
         * @return
         */
        predictMessage: function(message){
            this.connect.publish({
                method: "onPredictMessage",
                params: [this.options.sessionId, this.options.userId, message]
            }, this.clientTopic);
        },
        /**
         * 连接状态返回
         * @param Boolean  result    是否登陆成功
         * @param String   clientId  连接ID
         * @param String   userInfo  用户信息
         * @param String   sessionId 会话ID
         * @param String   soid
         * @param Number   time      服务器时间
         */
        LoginResult: function(result, clientId, userInfo, sessionId, soid, time){
            this.login = result === true;
            this.options.result = result===true ? 1 : 0;
            this.options.clientId = clientId;
            this.options.sessionId= sessionId;
            this.options.soid     = soid;
            this.options.time     = time;

            try{
                this.options.userInfo = $.JSON.parseJSON(userInfo);
            }catch(e){
                this.options.userInfo = this.options.userInfo || {};
            }

            this.stopReroomConnect();
            //console.warn("LoginResult..........................................");
            this._callback('fIM_tchatFlashReady', [this.options.userId, this.options.machineID]);
            if( this.options.result ){
                //-更新超时断线定时器
                if( this.firstConnected === true ){
                    this.firstConnected = false;
                    this.processSessionIdle();
                }

                this.userInfo = {
                    myuid:        this.options.userInfo.userid,
                    myuname:      this.options.userInfo.username,
                    signature:    "",
                    mylogo:       this.options.userInfo.usericon || "",
                    sessionid:    this.options.sessionId,
                    timesample:   this.options.time
                };
            }

            //2015.03.03
            //客服在请求t2d后，客服离线，连接不可用，断开连接，不再重连
            if( this.options.userInfo && this.options.userInfo.connectable === false ){

                this._callback('fIM_onGetUserInfo', ['{"status": 0}']);

                return;
            }

            if( !this.options.result ){
                this.reconnect('login relogin');

                this.userInfo = '';

                //停止发起心跳
                this.stopKaliveConnect();
            }
            else{
                //开始发起心跳
                this.startKaliveConnect();

                this._reconnect_tchat_count = 0;
                this.flashgourl = this.disconecturl(this.options.tchatgoserver);
                this._callback('fIM_setTChatGoServer', [this.flashgourl]);
            }

            this._callback('fIM_ConnectResult', [this.options.result, this.userInfo, '']);
        },
        disconecturl: function(url){
            return url + "?" + $.toURI( {
                from:  'TCHAT',
                cid:   this.options.clientId,
                sitid: this.options.siteId,
                uid:   this.options.userId,
                ts:    $.getTime()
            } );
        },
        /**
         * 返回历史聊天记录
         * @params
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
                    case 2://targetId
                        body.userid = arguments[j];
                        break;
                    case 3://destinfo
                        body = $.extend(body, $.whereGet(
                            $.JSON.parseJSON(arguments[j]),
                            ["externalname", "usericon", "nickname", "username"],
                            ["name", "logo", "nickname", "username"]
                        ));
                        body.name = body.name || body.nickname || body.username || "";
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
                                    msg:    elementMessage.textContent
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

                        if( this.sendHASH.contains(body.msgid) ){
                            //send message complete
                            this._callbackComplete(true, body.msgid);
                        }
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
         * @param  Number  timestamp  时间戳
         * @param  String  userId     发送消息用户ID
         * @param  String  userInfo   发送消息用户信息(json)
         * @param  String  xmlString  消息内容(xml)
         * @param  Number  flashUid
         */
        remoteSendMessage: function(timestamp, userId, userInfo, xmlString, flashUid){
            var message, jUserInfo, json, elementMessage;

            if( !xmlString || (xmlString.indexOf('type="5"') > -1 && xmlString.indexOf('systype="5"') === -1) ) return;

            if( userInfo && typeof userInfo == 'string' ){
                userInfo = $.JSON.parseJSON(userInfo);
                //2016.02.24 消息名使用外部名，或username
                jUserInfo = $.whereGet(userInfo, ["usericon", "userid", "externalname"], ["logo", "userid", "name"]);
                jUserInfo.name = jUserInfo.name || userInfo.username;
            }

            xmlString = xmlString.replace(/<\?xml\s+version=\"1\.0\"\s+encoding=\"utf\-\d+\"\?>/gi, '');
            //将消息中的&转为&amp; 否则xml会解析失败
			xmlString = xmlString.replace(/&(?!amp;)/gi, '&amp;');
            try{
                elementMessage = $.htmlToElement(xmlString)[0];
		        if( elementMessage && elementMessage.nodeType == 3 ){
                    json = {
                        type:    1,
                        msg:     elementMessage.textContent,
                        msgid:   flashUid + 'x'
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

            message = $.extend({}, this.defBody, json, jUserInfo, {
                timestamp: timestamp
            });

            if( this.sendHASH.contains(message.msgid) ){
                //send message complete
                this._callbackComplete(true, message.msgid);
            }
            if( !this.sendHASH.contains(message.msgid) && !this.receiveHASH.contains(message.msgid) ){
                //no send message && no receive message
                this._callback('fIM_receiveMessage', [message]);

                this.receiveHASH.add(message.msgid, message);
            }
        },
        /**
         * @desc 登录成功,返回房间用户列表
         * @param  String strUserList   客服信息列表(json)
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
                if( userList[i].userId == this.options.userId ){
                    userList.splice(i, 1);
                }
            }

            this._callback('fIM_notifyUserNumbers', [userList.length]);

            this._callback('fIM_notifyUserList', [$.JSON.toJSONString(userList)]);
        },
        /**
         * 连接tchat成功后返回客服的详细信
         * @param  String targetId   客服ID
         * @param  String destInfo   客服信息
         */
        remoteSearchWaiter: function(targetId, destInfo){
            //$.Log('tchat.remoteSearchWaiter(' + targetId + ', ' + destInfo + ')', 2);
            this._callback('fIM_onGetUserInfo', [destInfo]);
        },
        /**
         * 客服信息发生改变时返回新的客服信息
         * @param  String targetId    客服ID
         * @param  String userInfo    客服信息(json)
         */
        remoteNotifyUserInformation: function(targetId, userInfo){
            //$.Log('tchat.remoteNotifyUserInformation(' + targetId + ', ' + userInfo + ')', 2);
            if( targetId == this.options.userId ){
                //访客信息不通知
                return;
            }
            this._callback('fIM_onGetUserInfo',[userInfo]);
        },
        /**
         * 新客服进入房间时, 返回新客服信息
         * @param  String userId    进入房间用户ID
         * @param  String userInfo  进入房间用户信息(json)
         */
        remoteNotifyUserEnter: function(userId, userInfo){
            //$.Log('tchat.remoteNotifyUserEnter(' + userId + ', ' + userInfo + ')');

            //2015.03.25 其它客服进入房间后，连线断开后只连接最新客服
            this.options.targetId = userId;

            this._callback('fIM_notifyUserEnter', [this.options.targetId, userInfo, '']);
        },
        /**
         * 客服退出房间时, 返回客服信息
         * @param  String userId  退出房间人用户ID
         */
        remoteNotifyUserLeave: function(userId){
            $.Log('tchat.remoteNotifyUserLeave(' + userId + ')', 2);

            this._callback('fIM_notifyUserLeave', [userId]);
        },
        /**
         * 服务器通知断开连接
         * @param  String clientId   连接ID
         * @param  String userId     用户ID
         */
        remoteNotifyUserClose: function(clientId, userId){
            if( clientId != this.options.clientId ){
                //2015.03.20, 预防接收到非当前连接的userClose事件，导致连接断开
                return;
            }

            this._callback('fIM_ConnectResult', [5, '', '']);

            this.disconnect();

            this._callback('fIM_ConnectResult', [4, '', '']);
        },
        /**
         * 通知会话场景信息, 用来判断评价按钮是否可用
         * @param  String sceneStr  场景信息(json)
         */
        remoteNotifySessionScene: function(sceneStr){
            this._callback('fIM_onNotifySessionSence', [sceneStr]);
        },
        /**
         * 通知访客客服正在输入
         * @param  String sessionId   会话ID
         * @param  String sourceUid   客服ID
         */
        remoteNotifyUserInputing: function(sessionId, sourceUid){
            this._callback('fIM_notifyUserInputing', [sourceUid]);
        },
        /**
         * 客服邀请访客评价
         * @param  String sessionId  会话ID
         * @param  String targetId   发起人ID
         * @param  String targetName 发起人名
         */
        remoteRequestEvalute: function(sessionId, targetId, targetName){
            this._callback('fIM_requestEvaluate', [targetId, targetName]);
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
         * @param  Object json  源json对像
         * @param  Array  arr   需要获取的字段数组
         * @return Array
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
         * @param  String methodName   方法名
         * @param  Array  methodParams 方法参数
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
         * @param  String methodName   方法名
         * @param  Array  methodParams 方法参数
         */
        _callback: function(methodName, methodParams){
            methodParams.push(this.options.settingId);
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
         * @param  Array    args      参数数组
         * @return Boolean
         */
        _onCallback: function( args ){
            var self = this, topic, method;

            if( !args.length ){
                return;
            }

            topic  = args[0];
            method = args[1];

            if( topic === this.clientWillTopic && method === "reconnect" ){
                //接收到服务器遗言消息
                this.reconnect();
                return false;
            }
            else if( topic !== this.serverTopic ){
                //只获取当前TChat连接消息
                return false;
            }

            if( method === "LoginResult" ){
                this.LoginResult.apply( self, args.slice(2) );
            }else{
                this._handleResponse.call( self, method, args.slice(2) );
            }
        },
        /**
         * 连接异常
         * @return {void}
         */
        _onAbnormal: function(){
            this.connected = false;

            //-更新超时断线定时器
            //this.processSessionIdle();
            this._reconnect_mqtt_count++;
            if( this._reconnect_mqtt_count > 3 ){
                this._callback('fIM_ConnectResult', [2, '', '\u8fde\u63a5\u670d\u52a1\u5668\u8d85\u65f6\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\uff01']);
                this._reconnect_mqtt_count = 0;
            }
        },
        /**
         * @desc    tchat时，初始化消息队列
         */
        _initQueue: function(){
            var self = this;

            this.messageQueue = new $.Queue();
            this.messageQueue.first = function(){
                return this.queueFront();
            };
            //-消息队列中,同一msgid可能会有多条消息-
            this.messageQueue.nextMessage = function(msgid){
                if( !this.list.length ) return null;
                else if( !msgid ) return this.list[0];
                for(var i = 0; i < this.list.length; i++ ){
                    if( this.list[i].msgid == msgid ){

                        //$.Log("messageQueue: " + this.length, 1);
                        return this.list[ i + 1 ];
                    }
                }
                return null;
            };
            //移除消息队列中的消息
            this.messageQueue.removeMessage = function(msgid){
                var queue = [];
                for(var i = 0; i < this.list.length; i++ ){
                    if( this.list[i].msgid == msgid ){
                    }else{
                        queue.push(this.list[i]);
                    }
                }
                this.list = queue;
                this.length = queue.length;
                //$.Log("messageQueue: " + this.length, 1);
            };
            this.messageQueue.addMessage = function(obj){
                for(var i = 0; i < this.list.length; i++ ){
                    if ( this.list[i].msgid == obj.msgid ) return false;
                }
                this.list.push(obj);
                this.length = this.list.length;
                //$.Log("messageQueue: " + this.length, 1);
                return true;
            };
            this.messageQueue.getSendingNum = function(){
                var count = 0;
                for(var i = 0; i < this.list.length; i++ ){
                    if( this.list[i].status ) count++;
                }
                return count;
            };

            //发送消息订时器
            this.sendIntervalID = setInterval(function(){
                self.verificationMessage();
            }, 1000);
        }
    };
})(nTalk);
