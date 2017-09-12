(function($, undefined) {
    var CON_UID = "ntguest";
    var CON_PWD = "xiaoneng123";

    //服务器连接对像，用于Mqtt连接
    $.IMConnection = {
        name: "IMConnection",
        debug: false,
        client: null,
        mqttMessageTopic: "", // C/a
        mqttWillTopic: "", // S/WILL/a
        chatRouteTopic: "", // S/ROUTE/TCHAT
        sessionId: "",
        //private prototype
        _urlExp: /(wss?:)\/\/(.*?):(\d+)\/(\w+)/gi,
        _ssl: false,
        _mqttserver: "",
        _clientId: "",
        _protocol: "",
        _host: "",
        _port: 80,
        _path: "",
        _options: "",
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
        connect: function(url, clientId) {
            this._conn = true;
            if (!this.client || !this.client.isConnected()) {

                return this._connectMqtt(url, clientId);
            } else {
                //connected
                this._fireEvent("onConnectSuccess", this.mqttMessageTopic);
            }
            return true;
        },
        disconnect: function() {
            this._conn = false;
            if (this.client && this.client.isConnected()) {

                this._disconnectMqtt();
            }
        },
        /**
         * @method 发送消息
         * @param Object jsonMessage json形式消息串
         * @param String topic
         */
        publish: function(jsonMessage, topic) {
            var strMessage, objMessage;
            if (!this.client || !this.client.isConnected()) {
                if (this.debug) {
                    $.Log(this._clientId + " publish failure, client disconnect", 3);
                }

                return false;
            }
            if (!jsonMessage || typeof jsonMessage !== "object") {
                if (this.debug) {
                    $.Log(this._clientId + " publish param jsonMessage failure", 3);
                }
                return false;
            }
            strMessage = $.JSON.toJSONString(jsonMessage);

            topic = topic || this.chatRouteTopic;
            if (!topic) {
                if (this.debug) {
                    $.Log(this._clientId + " publish param topic is null>" + strMessage);
                }
                return false;
            }
            objMessage = this._mqttMessage(strMessage, topic);

            if (this.debug) {
                $.Log(this._clientId + " $.IMConnection.publish(" + strMessage + ", " + topic + ")", 2);
            }

            return this.client.send(objMessage);
        },
        /**
         * 注册回调函数名
         * @method register
         * @param String   eventName   注册事件名
         * @param Function callback    函数名或函数引用
         */
        register: function(appId, eventName, callback) {
            var arr, method, registered = false;
            var self = this;

            if (typeof callback === "function") {
                if (typeof this.eventCallback[eventName] === "undefined") {
                    this.eventCallback[eventName] = {};
                }
                $.each(this.eventCallback[eventName], function(key, func) {
                    //已注册函数
                    if (func === callback || appId === key) {
                        registered = true;
                    }
                });
                if (registered !== true) {
                    if (this.debug) {
                        $.Log(this._clientId + " $.IMConnection.reqister(" + eventName + ")");
                    }
                    this.eventCallback[eventName][appId] = callback;
                }
            } else if (typeof callback === "string") {
                arr = methodName.split(".");
                mehtod = $;
                $.each(arr, function(i, value) {
                    mehtod = mehtod[value];
                });
                if (typeof this.eventCallback[key] === "undefined") {
                    this.eventCallback[key] = {};
                }
                $.each(this.eventCallback[eventName], function(key, func) {
                    //已注册函数
                    if (func === mehtod || appId === key) {
                        registered = true;
                    }
                });
                if (registered !== true) {
                    if (this.debug) {
                        $.Log(this._clientId + " $.IMConnection.reqister(" + methodName + ")");
                    }
                    this.eventCallback[eventName][appId] = mehtod;
                }
            }
        },
        unregister: function(appId) {
            var self = this;
            $.each(this.eventCallback, function(methodName, methods) {
                $.each(methods, function(key, func) {
                    if (key === appId) {
                        delete self.eventCallback[methodName][key];
                    }
                });
            });
        },
        /**
         * @mehtod 订阅
         * @param String topic
         */
        subscribe: function(topic, options) {
            if (!this.client || !this.client.isConnected()) {
                return false;
            }
            if (this.debug) {
                $.Log(this._clientId + " $.IMConnection.subscribe(" + topic + ")");
            }

            var self = this;
            options = $.extend({ qos: 1 }, options);
            this.client.subscribe(topic, options);
        },
        /**
         * @mehtod 退订
         * @param String topic
         */
        unsubscribe: function(topic) {
            if (!this.client || !this.client.isConnected() || !topic) {
                return false;
            }

            if (this.debug) {
                $.Log(this._clientId + " $.IMConnection.unsubscribe(" + topic + ")");
            }

            this.client.unsubscribe(topic);
        },

        //callback function
        /**
         * @method 连接失败
         */
        onConnectionLost: function(response) {
            var self = this;

            if (response.errorCode === 0) {
                return;
            }
            if (this.debug) {
                $.Log(this._clientId + " $.IMConnection.onConnectionLost() > " + response.errorMessage, 3);
            }

            //连接断开，重新连接Mqtt服务器
            this._reconnectMqtt();
        },
        /**
         * @method 接收消息
         */
        onPublish: function(message) {
            var data, method;

            if (!this.client || !this.client.isConnected()) {
                return false;
            }

            if (this.debug) {
                //eduimmqttserver("receive: " + message.payloadString);
                $.Log(this._clientId + " $.IMConnection.onPublish() > " + message.payloadString, 2);
            }

            /*
            //debug
            if( message.payloadString.indexOf("remoteNotifyUserList") > -1 ){
                message.payloadString = message.payloadString.replace(/hasConnTchat/gi, "testtitle\":\"\\\u2014\",\"hasConnTchat");
            }
            */
            try {
                data = $.JSON.parseJSON(message.payloadString);
            } catch (e) {
                data = {};
                $.Log('$.IMConnection.onPublish(): ' + e.message, 3);
            }
            method = data.method || "";
            if( method === "loginResult" ){
                // eduimmqttserver('$.IMConnection.onPublish():'+data.method+'params:['+params[0]+','+params[1]+','+params[2]+']');
            }
            if (method === "responseServer") {
                this.responseServer.apply(this, Array.prototype.concat.call([message.destinationName], data.params));
            } else if (method) {
                this._fireEvent("onPublish", Array.prototype.concat.call([message.destinationName, method], data.params));
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
        responseServer: function(topic, cTopic, cWillTopic, sTopic, sId) {
            var self = this;

            //客户端订阅服务器的遗言
            this.subscribe(cWillTopic, {
                onSuccess: function(result) {
                    if (this.debug) {
                        $.Log(self._clientId + " $.IMConnection.subscribe()>" + $JSON.toJSONString(result), 2);
                    }
                },
                onFailure: function(error) {
                    if (this.debug) {
                        $.Log(self._clientId + " $.IMConnection.subscribe()>" + $JSON.toJSONString(error), 3);
                    }

                    //虚拟服务器连接异常，重新连接
                    self._fireEvent("onConnectSuccess", self.mqttMessageTopic);
                }
            });

            //订阅服务端下行消息
            this.subscribe(sTopic);

            this._fireEvent("onResponse", topic, cTopic, cWillTopic, sTopic, sId);
        },
        getRegisterMethod: function() {
            return this.eventCallback;
        },
        ////// private method //////////////////////////
        /**
         * @method 连接MQTT服务器
         */
        _connectMqtt: function(url, clientId) {
            var self = this;
            var mqttserver = url;

            if (!this._mqttserver || this._mqttserver !== mqttserver) {
                mqttserver = mqttserver || this._mqttserver;

                if (!this._format(mqttserver)) {
                    return false;
                }
                this.chatRouteTopic = "S/ROUTE/" + this._path;
            }

            if (!this._clientId || this._clientId !== clientId) {
                this._clientId = clientId || this._clientId;
                if (!this._clientId) {
                    return false;
                }

                //init topic
                this.mqttMessageTopic = "C/" + this._clientId;
                this.mqttWillTopic = "S/WILL/" + this._clientId;
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
                onSuccess: function() {
                    self._success();
                },
                onFailure: function(e) {
                    self._failure(e);
                }
            };

            if ($.browser.supportMqtt) {
                if (!this.client) {
                    if (this.debug) {
                        $.Log("connect mqtt server", 2);
                    }
                    this.client = new $.MQTT.Client(this._host, this._port, this._clientId);
                    this.client.onConnectionLost = function(response) {
                        self.onConnectionLost(response);
                    };
                    this.client.onMessageArrived = function(message) {
                        self.onPublish(message);
                    };
                } else {
                    if (this.debug) {
                        $.Log("reconnect mqtt server", 2);
                    }
                }
                this.client.connect(this._options);

                if (this.debug) {
                    this.client.startTrace();
                }
            } else {
                this.client = $.MQTT.flashSock;
                this.client.onConnectionLost = function(response) {
                    self.onConnectionLost(response);
                };
                this.client.onMessageArrived = function(message) {
                    self.onPublish(message);
                };
                this.client.init(this._host, this._port, this._clientId, this._options);
            }
        },
        _reconnectMqtt: function() {
            if ((!this.client || !this.client.isConnected()) && this._conn) {
                var self = this;

                //3次连接失败，3-7秒等待后再次重新连接
                if (++this._reconnectCount <= 3) {
                    this._waitTime = 50;
                } else {
                    this._waitTime = +("034567890".charAt(Math.ceil(Math.random() * 5))) * 1000;
                }
                if (this.debug) {
                    $.Log(this._clientId + " wait recontent mqtt:" + this._waitTime, 3);
                }
                //if( this._reconnectCount > 3 ){
                //MQTT连接3次异常，抛出错误
                this._fireEvent("onConnectFailure", this.mqttMessageTopic);
                //}
                setTimeout(function() {
                    self._connectMqtt(self._mqttserver, self._clientId);
                }, this._waitTime);
            }
        },
        _disconnectMqtt: function() {
            var message = this._mqttMessage("{}");
            this.publish(message, this.mqttWillTopic);

            //取消订阅
            this.unsubscribe(this.mqttMessageTopic);

            if (this.client) {
                if (this.debug) {
                    this.client.stopTrace();
                }
                this.client.disconnect();

                //断开mqtt连接，清空缓存数据
                if (this.client.clear) {
                    this.client.clear();
                }
            }
            this.client = null;
        },
        /**
         * @method 格式化参数
         * @param {array|string} url mqtt服务器地址
         */
        _format: function(mqttserver) {
            var math, url;

            if (!mqttserver || mqttserver === "") {
                return false;
            }
            if ($.isObject(mqttserver)) {
                //url = $.browser.supportMqtt&&mqttserver.ws ? mqttserver.ws : mqttserver.tcp ? mqttserver.tcp : "";
                if ($.browser.supportMqtt) {
                    if ($.protocol === "http:" && $.flashserver.usehttps == 0) {
                        url = mqttserver.ws ? mqttserver.ws : mqttserver.wss.replace(/^wss:/, 'ws:');
                    } else {
                        url = mqttserver.wss ? mqttserver.wss : mqttserver.ws.replace(/^ws:/, 'wss:');
                    }
                } else {
                    url = mqttserver.tcp;
                }
            } else {
                url = mqttserver;
            }
            math = this._urlExp.exec(url);
            if (!math || !math.length) {
                math = url.replace(/(wss?|tcp):\/\//gi, ",$1,")
                    .replace(/:(\d+)/gi, ",$1").replace(/\//gi, ",")
                    .split(",");

                if (!math || !math.length) {
                    $.Log("url:" + url + ", math:" + math, 2);
                }
            }
            this._protocol = ($.flashserver.usehttps == 1) ? "wss:" : (math[1] || "ws:");
            this._ssl = this._protocol === "wss:";
            this._host = math[2];
            // (6.8.2合版) 未读取到端口号时，wss使用443，ws使用80 端口
            this._port = Number(math[3]) || (this._ssl ? 443 : 80);
            this._path = math[4] || "mqtt";
            this._mqttserver = url;

            return true;
        },
        /**
         * @method 连接MQTT服务器成功
         */
        _success: function() {
            if (this.debug) {
                $.Log(this._clientId + " $.IMConnection connect success.");
            }
            this._reconnectCount = 0;
            //订阅
            this.subscribe(this.mqttMessageTopic);

            //requestServer
            this._fireEvent("onConnectSuccess", this.mqttMessageTopic);
        },
        /**
         * @method 连接MQTT服务器失败
         */
        _failure: function(e) {
            if (this.debug) {
                $.Log(this._clientId + " $.IMConnection connect failure.");
            }

            this._fireEvent("onConnectFailure", this.mqttMessageTopic);

            //连接断开，重新连接Mqtt服务器
            this._reconnectMqtt();
        },
        /**
         * @method 触发连接事件
         */
        _fireEvent: function() {
            var me = this;
            var args = Array.prototype.slice.call(arguments);
            var method = args[0];
            var params = args.slice(1);

            $.each(this.eventCallback[method], function(key, func) {
                if (method === "onResponse") {
                    func.apply(me, params.slice(1));
                } else {
                    func.apply(me, params);
                }
            });
        },
        /**
         * @method 转换为mqtt消息
         */
        _mqttMessage: function(strMessage, topic) {
            var message = new $.MQTT.Message(strMessage);

            topic = topic || this.mqttWillTopic;
            message.qos = 1;
            message.destinationName = topic;
            return message;
        }
    };

    $(window).bind('unload', function() {
        $.IMConnection.disconnect();
    });
})(nTalk);

(function($, undefined) {
    var CON_FLASH_DIV = 'nTalk-flash-element',
        CON_IM_ID = 'ntkf_flash_impresence',
        CON_IM_FIX = 'IM_',
        CON_DATA_FIX = 'JDATA_', //缓存数据，会话
        CON_PCID_KEY = 'machineid', //PCID		无限
        CON_CURRENT_PAGE = CON_IM_FIX + 'CURRENT_PAGE', //当前页	无限
        CON_CUREENT_CONNECT = CON_IM_FIX + 'CUREENT_CONNECT', //IM连接	无限
        CON_PAGE_DATA = CON_IM_FIX + 'SEND_CURRENT_PAGE_DATA', //需要发送到当前页的消息（发送完成后清除）
        CON_STYLE_PUBLIC_CONTENT = 'margin:0;padding:0;border:none;float:none;font:normal normal normal 12px/160% Arial,SimSun;',
        CON_EXIST_PAGEARR = CON_IM_FIX + 'EXIST_PAGEARR'; //当前存在的页面ID

    /**
     * comet Presence
     * @type {Object}
     */
    $.IMConnection.Presence = $.Class.create();
    $.IMConnection.Presence.prototype = {
        name: 'Presence',
        debugLevel: 2,
        options: null,
        connectParams: ['userid', 'username', 'token', 'sessionid', 'nullparam', 'nullparam', 'nullparam', 'siteid', 'nullparam', 'nullparam', 'connectType', 'pcid', 'nullparam'],
        connect: null,
        debug: false,
        login: false,
        currentPage: null,
        _reCount: 0,
        _waitTime: 500,
        _currentConnected: false,
        _waitReconnectTimeID: null,
        _stopReconnect: false,
        _roomConnectTimeout: 5000,
        initialize: function(options) {
            var self = this;
            this.options = $.extend({
                deviceType: $.browser.mobile ? 3 : 0,
                nullparam: ''
            }, $.whereGet(options, ["siteid", "settingid", "cid", "surl", "u", "n", "s", "r", "ref", "fsid", "userlevel"], ["siteid", "settingid", "pcid", "serverurl", "userid", "username", "sessionid", "resourceurl", "referrer", "flashsessionid", "userLevel"]));

            this.data = $.store;
            this._reCount = 0;
            $.Log('IMConnection.Presence start');
            if (!this.options.pcid || this.options.pcid.length <= 10) {
                this.options.pcid = this.data.get(CON_PCID_KEY);

                if (!this.options.pcid || this.options.pcid.length <= 10) {
                    this.options.pcid = $.base._createScriptPCID();
                }
            }
            try {
                this.data.set(CON_PCID_KEY, this.options.pcid);
            } catch (e) {
                $.Log(e, 3);
            }

            if (!this.options.userid) {
                this.options.userid = $.base.userIdFix + this.options.pcid.substr(0, 21);
            }
            this.clientId = 'IM_' + $.randomChar(20).toLowerCase();

            this._callback('fIM_presenceFlashReady', [this.options.userid, this.options.pcid]);

            //教育版发现该功能并不是好用，尤其在打开多个页面同事登录多个访客的情况下。
            var manageOptions = {
                onInterval: function(timeout, manageData) {
                    self._onInterval.call(self, timeout, manageData);
                },
                onChanage: function(count, data) {
                    self._onChanage.call(self, count, data);
                }
            };
            this.manage = new $.pageManage(manageOptions);
            this.identid = this.manage.identid;

            this.currentPage = new $.CurrentPage(this.identid, this.manage);
            //首次默认先获得焦点,存贮当前页数据
            this.setPageFocus(true, $.title, $.url);

            var eduimmqttserver = $.server.eduimmqttserver.toString().split(';');
            this.eduimmqttserver = {};
            for (var i = 0; i < eduimmqttserver.length; i++) {
                if (!eduimmqttserver[i]) continue;
                if (eduimmqttserver[i].indexOf("ws:") > -1) {
                    this.eduimmqttserver.ws = eduimmqttserver[i];
                }
                //2016.10.26 添加MQTT下WSS支持
                else if (eduimmqttserver[i].indexOf("wss:") > -1) {
                    this.eduimmqttserver.wss = eduimmqttserver[i];
                } else if (eduimmqttserver[i].indexOf("tcp") > -1) {
                    this.eduimmqttserver.tcp = eduimmqttserver[i];
                }
            }
            //2017.04.26 创建一个页面连接管理器，主要作用是用来处理访客信息变更。判断是否要重新连接服务器。
            //get
            var guestInfostr  = localStorage.getItem('gustInfo');
            if( guestInfostr ){
                var guestInfoJson = JSON.parse(guestInfostr);
            }else{
                var guestInfoJson = new Object();
            }
            // set
            if( !(this.identid in guestInfoJson) ){

                guestInfoJson[this.identid] = {
                    userid:      this.options.userid,
                    loginname:   $.global.uname,
                    userlevel:  (this.options.userLevel ? this.options.userLevel : 0),
                    isvip:      $.global.isvip,
                    time:       new Date().getTime()
                }
                this.guestInfoJson = guestInfoJson;
                localStorage.setItem('gustInfo',JSON.stringify(guestInfoJson));

            }

            //chanage

            //
        },

        loginConnect: function() {
            var self = this;
            if (this.debug) $.Log('im.loginConnect()', this.debugLevel);
            //开始连接
            this._callback('fIM_updateUserStatus', [1, '']);

            this.connect = $.IMConnection;
            this.connect.register(this.options.settingId, "onConnectSuccess", function() {

                self.requestServer();
            });
            this.connect.register(this.options.settingId, "onConnectFailure", function() {
                //服务器返回消息
                self._onAbnormal.apply(self, arguments);
                 $.Log('mqtt:abnormal');

            });
            this.connect.register(this.options.settingId, "onResponse", function(cTopic, cWillTopic, sTopic, settingId) {

                //console.warn("onResponse//////////////////////////");
                self.roomConnect(cTopic, cWillTopic, sTopic, settingId);
            });
            this.connect.register(this.options.settingId, "onPublish", function() {

                //服务器返回消息
                self._onCallback.apply(self, arguments);
            });

            this.connect.connect(this.eduimmqttserver, this.clientId);
        },
        requestServer: function() {
            var self = this;

            if (this.connected) {
                return false;
            }
            $.Log("$.IMConnection.Presence.requestServer()", 2);
            this.connected = true;
            this.options.targetId = '';
            this.connect.publish({
                method: "requestServer",
                params: [this.options.userid, this.clientId, this.options.settingid, this.options.targetId, this.options.sessionid]
            }, this.connect.chatRouteTopic);

            this._roomConnectTimeID = setTimeout(function() {

                //超时未接收到服务器响应,重新发起虚拟连接请求
                self.reconnect(0);
            }, this._roomConnectTimeout);
        },
        roomConnect: function(cTopic, cWillTopic, sTopic, settingId) {
            var self = this;
            if (this.options.settingid !== settingId) {
                return false;
            }
            var jsonstr = '{"pcid":'+this.options.pcid+',"loginname":"'+nTalk.global.uname+'","devicetype":"'+this.options.deviceType+'","userlevel":'+(this.options.userLevel ? this.options.userLevel : 0)+',"isvip":'+nTalk.global.isvip+'}'
            $.Log("$.IMConnection.Presence.roomConnect(" + cTopic + ", " + cWillTopic + ", " + sTopic + ", " + settingId + ")", 2);
            this.clientTopic = cTopic;
            this.clientWillTopic = cWillTopic;
            this.serverTopic = sTopic;
            this.deviceType  = 0;
            this.connect.publish({
                method: "roomConnect",
                params: [this.options.userid, this.options.siteid, this.options.pcid, this.options.settingid, "", this.options.username,jsonstr]
            }, this.clientTopic);
        },
        stopReroomConnect: function() {
            clearTimeout(this._roomConnectTimeID);
            this._roomConnectTimeID = null;
        },
        /**
         * 保持tchat连接
         * @return
         */
        startKaliveConnect: function() {
            var self = this;
            this.stopKaliveConnect();
            this.kaliveTimeId = setInterval(function() {
                $.Log('$.IMConnection.Presence.kaliveConnect()', 1);

                self.connect.publish({
                    method: "remoteKeepAlive",
                    params: [self.options.connectId, self.options.userid, self.options.siteid, self.options.pcid]
                }, self.clientTopic);
            }, 10000);
        },
        stopKaliveConnect: function() {
            clearInterval(this.kaliveTimeId);
            this.kaliveTimeId = null;
        },
        /**
         * 重新连接Tchat
         * @param {Number} level 0:重连MQTT，重发RequestServer,1：重发roomConnect
         * @return
         */
        reconnect: function(level) {
            var self = this;
            this.connected = false;
            if (level === 0) {
                //取消订阅
                this.connect.unsubscribe(this.clientWillTopic);
                this.connect.unsubscribe(this.serverTopic);
                this.connect.unregister(this.options.settingId);
            }

            //3次登录失败，3-7秒等待后再次重新连接
            if (++this._reconnect_tchat_count <= 3) {
                this._waitTime = 500;
            } else {
                this._waitTime = +("034567890".charAt(Math.ceil(Math.random() * 5))) * 1000;
            }

            this._waitReconnectTimeID = setTimeout(function() {

                $.Log("$.IMConnection.Presence.reconnect(): waitTime:" + self._waitTime, 2);
                if (level == 0) {
                    self.loginConnect();
                } else {
                    self.roomConnect(self.clientTopic, self.clientWillTopic, self.serverTopic, self.options.settingid);
                }
            }, this._waitTime);
        },
        /**
         * 断开IM连接,清除缓存数据
         * @return {[type]} [description]
         */
        disconnect: function() {
            $.Log("$.IMConnection.Presence.disconnect()");
            var ret = this.data.getAll();
            for (var k in ret) {
                if (typeof ret[k] == 'function') continue;
                if (k.indexOf(CON_DATA_FIX) > -1) {
                    this.data.remove(k);
                }
            }

            this.stopReroomConnect();

            this.stopKaliveConnect();
        },
        /**
         * 登录完成，返回登录状态
         * @param {boolean} login   登录状态
         * @param {String} siteId   企业ID
         * @param {String} clientId 连接ID
         */
        LoginResult: function(login, siteId, clientId) {
            this.login = login;
            this.options.connectId = clientId;

            $.Log("$.IMConnection.Presence.LoginResult(" + $.JSON.toJSONString(arguments) + ")", 2);

            this._callback('fIM_updateUserStatus', [this.login ? 2 : 0, '']);

            //this._callback('fIM_presenceSetIMSid', [this.login ? this.options.token : '']);
            if (this.login) {

                this.startKaliveConnect('call kalive');
            } else {
                this.reconnect('login relogin');
            }

            this.stopReroomConnect();
        },
        /**
         * 分发消息
         * @param  {String} srcuid    客服ID
         * @param  {String} srcnick   客服名称
         * @param  {String} srcicon   客服头像
         * @param  {String} msg       消息内容
         * @param  {String} chatsessionid 会话ID
         * @return {void}
         */
        remoteNotifyChatWithGroup: function(srcuid, srcnick, srcicon, msg, chatsessionid) {
            var json, message, protocol;

            if (!msg) {
                if (this.debug) $.Log('message content is null', 3);
                return;
            }
            //TODO: 临时
            $.Log("$.IMConnection.Presence.remoteNotifyChatWithGroup(" + $.JSON.toJSONString(arguments) + ")", 2);

            message = $.clearHtml(msg.substr(0, msg.indexOf('ntalker://')));
            protocol = msg.substr(msg.indexOf('ntalker://') + 10);

            try {
                json = $.JSON.parseJSON(protocol);
            } catch (e) {}

            //--消息发送至当前页--
            // 2017-03-15 判断localStorage 是否可用。
            isStorageSupported = function(){
                var supported = null;
                try{
                    supported = window.localStorage;
                }catch(e){
                    $.Log('localStorage:' + e.message, 3);
                    return false;
                }
                if( supported ){
                    var mod = 'test';
                    try{
                        if( localStorage.getItem(mod) !== null ){
                            localStorage.removeItem(mod);
                        }
                        localStorage.setItem(mod, mod);
                        if( localStorage.getItem(mod) == mod ){
                            localStorage.removeItem(mod);
                            return true;
                        }else{
                            return false;
                        }
                    }catch(e){
                        $.Log('The browser localStorage is unavailable. ' + e.message, 3);
                        return false;
                    }
                }
            }
            // 教育版不在采用多页面管理器
            if ( isStorageSupported() ) {
                this._sendMessage2CurrenPage(message + 'ntalker://' + protocol);
            } else {
                this._callback('fIM_onPresenceReceiveSysMessage', [1, message + 'ntalker://' + protocol]);
            }
        },
        /**
         * @param {String} siteId        企业ID
         * @param {String} srcUser       客服ID
         * @param {String} destUid       访客ID
         * @param {JSONString} userInfo  客服信息
         */
        remoteNotifyReverseChat: function(srcuid, srcnick, srcicon, msg, inviteid) {
            var json, message, protocol;

            if (!msg) {
                if (this.debug) $.Log('message content is null', 3);
                return;
            }
            var message = 'msg='+msg+'&&inviteid='+inviteid;
            var inviteidobj = $.JSON.parseJSON(inviteid);
            var ReverseChatObj = $.JSON.parseJSON(msg);
            ReverseChatObj.ReverseChat = 1;
            msg = $.JSON.toJSONString(ReverseChatObj);
            ReverseChatObj = null;
            //TODO: 临时
            $.Log("$.IMConnection.Presence.remoteNotifyReverseChat(" + $.JSON.toJSONString(arguments) + ")", 2);


            try {
                json = $.JSON.parseJSON(protocol);
            } catch (e) {}

            //--消息发送至当前页--
            // 2017-03-15 判断localStorage 是否可用。
            isStorageSupported = function(){
                var supported = null;
                try{
                    supported = window.localStorage;
                }catch(e){
                    $.Log('localStorage:' + e.message, 3);
                    return false;
                }
                if( supported ){
                    var mod = 'test';
                    try{
                        if( localStorage.getItem(mod) !== null ){
                            localStorage.removeItem(mod);
                        }
                        localStorage.setItem(mod, mod);
                        if( localStorage.getItem(mod) == mod ){
                            localStorage.removeItem(mod);
                            return true;
                        }else{
                            return false;
                        }
                    }catch(e){
                        $.Log('The browser localStorage is unavailable. ' + e.message, 3);
                        return false;
                    }
                }
            }
            //教育版不在采用多页面管理器
            if ( isStorageSupported() ) {
                this._sendMessage2CurrenPage(message);
            } else {
                this._callback('fIM_onPresenceReceiveSysMessage', [1, message]);
            }
        },

        remoteNotifyUserCode: function(args) {
            $.Log("do remoteNotifyUserCode!!!");
        },

        remoteConfirmAddFriend: function(args) {
            $.Log("do remoteConfirmAddFriend");
        },

        /**
         * 回调此对像内部方法
         * @param  {String} methodName   方法名
         * @param  {Array}  methodParams 方法参数
         * @return {[type]} [description]
         */
        _handleResponse: function(methodName, methodParams) {
            if (this[methodName]) {
                this[methodName].apply(this, methodParams);
            } else {
                $.Log("The object of the method '" + methodName + "' does not exist", 3);
            }
        },
        /**
         * 回调nTalk下的方法
         * @param  {String} methodName   方法名
         * @param  {Array}  methodParams 方法参数
         * @return {[type]}
         */
        _callback: function(methodName, methodParams) {
            if ($.hasOwnProperty(methodName)) {
                try {
                    $[methodName].apply(this, methodParams);
                } catch (e) {}
            } else {
                $.Log('nTalk.' + methodName + '(...)', 2);
            }
        },
        /**
         * MQTT下行消息方法回调
         * @param {Array}   args              参数数组
         * @return {void}
         */
        _onCallback: function(args) {
            var self = this,
                method;

            if (this.debug) $.Log('$.Presence.onCallback(  )');

            if (!args.length) {
                return;
            }

            topic = args[0];
            method = args[1];

            if (topic === this.clientWillTopic && method === "reconnect") {
                //接收到服务器遗言消息
                this.reconnect();
                return false;
            } else if (topic !== this.serverTopic) {
                //只获取当前TChat连接消息
                return false;
            }
            $.Log('$.Presence.onCallback('+method+')');
            //2017 教育版
            if (method === "connectResult") {
                this.LoginResult.apply(self, args.slice(2));
            }else if(method === "remoteNotifyChatWithGroup"){
                this.remoteNotifyChatWithGroup.apply(self,args.slice(5))
            }else if( method === "remoteNotifyReverseChat" ){
                this.remoteNotifyReverseChat.apply(self,args.slice(2));
            } else {
                this._handleResponse.call(self, method, args.slice(2));
            }
        },
        /**
         * jsonp调用异常
         * @return {void}
         */
        _onAbnormal: function() {
            var args = Array.prototype.slice.call(arguments);

            if (this.debug) $.Log('$.Presence.onAbnormal( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )', 3);

            this.reconnect('abnormal login');
        },
        /**
         * 回调此对像内部方法
         * @param  String methodName   方法名
         * @param  Array  methodParams 方法参数
         */
        _handleResponse: function(methodName, methodParams) {
            if (this[methodName]) {
                this[methodName].apply(this, methodParams);
            } else {
                $.Log("The object of the method '" + methodName + "' does not exist", 3);
            }
        },
        /**
         * 维护IM连接,最多维护三个，其中只有一个页面连接IM
         * @param  {[Number]} timeout [description]
         * @param  {[Array]} m      当前页面管理器数据
         * @return {[type]}         [description]
         */
        _onInterval: function(timeout, m) {
            var diff;

            //get long connect
            this.currentConn = this.data.get(CON_CUREENT_CONNECT) || { identid: "", time: 0 };

            //$.Log('get current connect userdata:' + $.JSON.toJSONString(this.currentConn), 2);
            if (this.currentConn.identid && this.currentConn.identid === this.identid) {
                //update long connect
                this.currentConn.time = $.getTime();

                this.data.set(CON_CUREENT_CONNECT, this.currentConn);

                this._fireEvent('update');

            } else {
                var exists;
                if ($.isArray(m)) {
                    for (var i = 0; i < m.length; i++) {
                        page = m[i];
                        if (page && page[this.currentConn.identid]) {
                            exists = true;
                            this._currentConnected = true;
                        }

                    }
                }
                if (this.currentConn.identid && this.currentConn.identid !== this.identid && !exists) {
                    //clear timeout long connect
                    this.currentConn.identid = '';
                    this._currentConnected = false;
                    this._fireEvent('clear');
                }
                if (this.debug) $.Log('currentConnect>>_onInterval:' + $.JSON.toJSONString(this.currentConn) + ', _currentConnected:' + this._currentConnected);
                //当前页未创建过连接且未连接过时，创建新连接
                //已连接过：debug
                if ((!this.currentConn.identid || this.currentConn.identid === '') && !this._currentConnected) {
                    //add long connect
                    this.currentConn = {
                        identid: this.identid,
                        time: $.getTime()
                    };

                    this._currentConnected = true;

                    try {
                        this.data.set(CON_CUREENT_CONNECT, this.currentConn);
                    } catch (e) {
                        $.Log(e, 3);
                    }

                    this._fireEvent('add');

                    this.loginConnect();
                } else {
                    this._fireEvent('wait');
                }
            }

            //2017.04.26管理im服务访客信息状态
            if( this.connected ){
                var guestInfostr  = localStorage.getItem('gustInfo');
                if( guestInfostr ){
                    var guestInfoJson = JSON.parse(guestInfostr);
                }else{
                    var guestInfoJson = new Object();
                }
                for( var k in guestInfoJson ){
                    if( k == this.clientId ){
                        if( !(guestInfoJson[k].userid == this.options.userid && guestInfoJson[k].loginname == nTalk.global.uname && guestInfoJson[k].userlevel == (this.options.userLevel ? this.options.userLevel : 0))){
                            this.options.userid = guestInfoJson[k].userid;
                            $.global.name = guestInfoJson[k].loginname;
                            this.options.userLevel = guestInfoJson[k].userLevel;
                            this.options.isvip = guestInfoJson[k].isvip;
                            this.reconnect(0);
                        }
                        localStorage.removeItem('gustInfo')
                    }else{
                        if( !(guestInfoJson[k].userid == this.options.userid && guestInfoJson[k].loginname == nTalk.global.uname && guestInfoJson[k].userlevel == (this.options.userLevel ? this.options.userLevel : 0))){
                            this.options.userid = guestInfoJson[k].userid;
                            this.options.loginname = guestInfoJson[k].loginname;
                            this.options.userLevel = guestInfoJson[k].userLevel;
                            this.reconnect(0);
                        }
                        localStorage.removeItem('gustInfo');
                    }
                }
            }
        },
        /**
         * pageManage回调，返回当前打开页面数量
         * @param  {[type]} pageCount [description]
         * @param  {[type]} data      [description]
         * @return {[type]}           [description]
         */
        _onChanage: function(pageCount, data) {
            this.pageCount = pageCount;
            return;
        },
        /**
         * 执行相关更新事件
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        _fireEvent: function(type) {

            if (this.temp == 1 || !this.temp) {
                this.temp = 1;
                if (this.debug && type !== 'wait') {
                    $.Log(this.identid + ', ' + type + ' long connect, curPage:' + this.currentPage.get(), 2);
                }
            } else if (this.temp >= 5)
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
        _toArray: function(json, arr) {
            var result = [];
            if (!json) {
                return 'error';
            }
            for (var i = 0; i < arr.length; i++) {
                result.push(json[(arr[i])] || '');
            }
            return result;
        },
        /**
         * 消息存至缓存中，如缓存中已存在消息，将消息加入队列，等待下次载入
         * @param  {String} message
         * @return {[type]}
         */
        _sendMessage2CurrenPage: function(message) {
            var self = this,
                objectQueue,
                strdata = this.data.get(CON_PAGE_DATA);

            if (!message) return;

            if (!this.Queue) {
                this.Queue = new $.Queue();
            }

            if (strdata) {
                //-有等待发送的消息,将消息加入队列
                this.Queue.enQueue({ data: message });
            } else {
                //-无等待消息时,将消息存入缓存
                this.data.set(CON_PAGE_DATA, message);
            }
        },
        /**
         * 定时在当前页获取缓存数据,并清除缓存
         * @return {[type]} [description]
         */
        _currentGetMessage: function() {
            var callCurrentPageData = this.data.get(CON_PAGE_DATA);
            if (!callCurrentPageData) {
                return;
            }
            try {
                callCurrentPageData = $.JSON.parseJSON(callCurrentPageData);
                // eduimmqttserver(callCurrentPageData)
            } catch (e) {
                //$.Log('$.Presence._currentGetMessage:' + e, 3);
            }

            //$.Log('is current page:' + this.currentPage.get(), 2);
            //针对最后一页未获得焦点
            // 2017.04.26 如果document.hidden存在的话使用这种方式。
            if( typeof document.hidden !== "undefined" ){
                if( document.hidden == true ){
                    return;
                }
            }else{
                if (!this.currentPage.get() || !callCurrentPageData) {
                    return;
                }
            }


            this.data.remove(CON_PAGE_DATA);

            this._callback('fIM_onPresenceReceiveSysMessage', [1, callCurrentPageData]);

            if (!this.Queue) {
                return;
            }

            //队列中有数据时，进行下一次分发
            var objectQueue = this.Queue.deQueue();

            if (objectQueue) {
                this._sendMessage2CurrenPage(objectQueue.data);
            }


        },
        /**
         * 设定当前页
         */
        setPageFocus: function(focus, title, url, other) {
            if (focus === true) {
                this.currentPage.set(title, url);
            }
        },
        closePresence: function() {
            if (this._wsFlag) {
                this.connect.disconnect();
            } else {
                try {
                    this.cometd.disconnect(true);
                } catch (e) {}
            }

            this.data.remove(CON_CUREENT_CONNECT);
        },
        /**
         * 存贮数据
         * @param {number} trailid  轨迹ID
         * @param {string} key
         * @param {string} value
         * @return {[type]} [description]
         */
        setJSData: function() {
            //2014.07.18
            //comet连接时，存贮的数据与常规数据进行区分
            //通过此接口存贮的数据，添加前缀
            var ret, key, trailid = arguments[0];
            if (!trailid || trailid === '') {
                //trailid为空时，清除通过此接口存贮的数据
                ret = this.data.getAll();
                for (var k in ret) {
                    if (typeof ret[k] == 'function') continue;
                    if (k.indexOf(CON_DATA_FIX) > -1) {
                        this.data.remove(k);
                    }
                }
            } else {
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
        getJSData: function() {
            var ret, result = {},
                key = Array.prototype.slice.call(arguments, 0, 2).slice(0, 2).join('-');
            if (key && arguments[1])
                return $.JSON.toJSONString(this.data.get(key));
            else {
                ret = this.data.getAll();
                for (var k in ret) {
                    if (typeof ret[k] == 'function') continue;
                    if (k.indexOf(CON_DATA_FIX) > -1) {
                        result[k] = ret[k];
                    }
                }
                return $.JSON.toJSONString(result);
            }
        }
    };
})(nTalk);
