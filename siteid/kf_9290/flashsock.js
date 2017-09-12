(function($){
    var emptyFunc = function(){};
    
    $.MQTT = $.MQTT || {};

    $.MQTT.Message = function(strMessage){
        this.payloadString   = strMessage;
        this.destinationName = undefined;
        this.pos             = 0;
    };

    $.MQTT.flashSock = {
        name: "flashSocket",
        debug: true,
        flash: null,
        connectStatus: 0,//0:未连接；1:开始连接；2:连接成功；3:连接失败；
        onConnectionLost: emptyFunc,
        onMessageArrived: emptyFunc,
        options: null,
        /**
         * 连接服务器
         * @param {string} host
         * @param {number} port
         * @param {string} clientId
         * 
         * @param {object} connectOptions
         * @param {number} connectOptions.timeout
         * @param {string} connectOptions.userName
         * @param {string} connectOptions.password
         *
         * @param {Number}   connectOptions.keepAliveInterval
         * @param {boolean}  connectOptions.cleanSession
         * @param {object}   connectOptions.invocationContext
         * @param {function} connectOptions.onSuccess
         * @param {function} connectOptions.onFailure
         */
        init: function(host, port, clientId, connectOptions){
            this._host = host;
            this._port = port;
            this._clientId = clientId;
            this._userName = connectOptions.userName;
            this._password = connectOptions.password;
            this.options   = connectOptions;

            if( !this.flash ){
                if( this.debug ){
                    $.Log("create flashsock", 2);
                }
                this.flash = this._createflash();
            }
            else if( this.isConnected() === false ){
                this.connect();
            }
        },
        connect: function(){
            if( this.flash ){

                if( this.debug ){
                    this.flash.setDebugMode(true);
                }
                
                if( this.connectStatus === 3 ){
                    if( this.debug ){
                        $.Log("flash.reStartConnect()", 2);
                    }
                    this.flash.reStartConnect();
                }else{
                    if( this.debug ){
                        $.Log("flash.connect(" + this._host + ", " + this._port + ", " + this._clientId + ")", 2);
                    }
                    this.connectStatus = 1;
                    this.flash.connect(this._host, this._port, this._clientId, this._userName, this._password);
                }
            }else{
                $.Log('this.flash not element', 3);
            }
        },
        reconnect: function(){
            if( this.flash ){

                if( this.debug ){
                    $.Log("flash.reStartConnect()", 2);
                }
                this.connectStatus = 1;
                this.flash.reStartConnect();
            }else{
                $.Log('this.flash not element, no reconnect', 3);
            }
        },
        /**
         * @param  {string} filter
         * @param  {object} subscribeOptions
         */
        subscribe: function(filter, subscribeOptions){
            if( this.debug ){
                $.Log("flashsock.subscribe(" + filter + ", 1, " + subscribeOptions.qos + ")", 1);
            }
            if( this.flash ){
                this.flash.subscribe(filter, 1, subscribeOptions.qos);
            }else{
                $.Log('this.flash not element', 3);
            }
        },
        /**
         * @param  {string} filter
         * @param  {object} unsubscribeOptions
         */
        unsubscribe: function(filter, unsubscribeOptions){
            unsubscribeOptions = $.merge({qos: 1}, unsubscribeOptions);
            if( this.debug ){
                $.Log("flashsock.unsubscribe(" + filter + ", 1)", 1);
            }
            if( this.flash ){
                try{
                    this.flash.unsubscribe(filter, 1);
                }catch(e){
                    $.Log(e, 3);
                }
            }else{
                $.Log('this.flash not element', 3);
            }
        },
        /**
         * @param {object} message
         */
        send: function(message){
            if( this.debug ){
                $.Log("flashsock.publish(" + message.destinationName + ", " + message.payloadString + ", " + message.qos + ")", 1);
            }
            if( this.flash ){
                this.flash.publish(message.destinationName, message.payloadString, message.qos);
            }else{
                $.Log('this.flash not element', 3);
            }
        },
        connectionLost: function(param){
            this.connectStatus = 3;
            
            this.onConnectionLost(param);
        },
        messageArrived: function(param){
            this.onMessageArrived(param);
        },
        isConnected: function(){
            return this.flash && typeof this.flash.connect === "function" && this.connectStatus===2;
        },
        disconnect: function(){
            
        },
        startTrace: function(){
            if( this.flash ){
                $.flash.remove(this.flash);
            }
        },
        stopTrace: function(){
            
        },
        clear: function(){
            
        },
        //private prototype
        _createflash: function(){
            var flashdiv = $('#nTalk-flash-element');
            var flashsrc = $.sourceURI + 'fs/TChatSocket.swf?' + $.version.flashsock;
            var flashhtml= $.flashHtml('flashsock', flashsrc, {});
            
            if( !flashdiv.length ){
                flashdiv = $(document.body).insert('<div id="nTalk-flash-element" class="nTalk-hidden-element" style="position: absolute; z-index: 9996; top: -200px;"></div>');
            }
            if( flashdiv.find('#flashsock').length ){
                flashdiv.find('#flashsock').remove();
            }
            flashdiv.insert( flashhtml );
            
            if( $.browser.msie ){
                flashdiv.find('#flashsock').display(1);
            }
            return flashdiv.find('#flashsock').get(0);
        },
        onSuccess: function(){
            this.connectStatus = 2;
            
            this.options.onSuccess();
        },
        onFailure: function(){
            this.connectStatus = 3;
        }
    };  
    
    $.extend({
        /**
         * @method flashready
         */
        fIM_flashSocketReady: function(){
            $.Log("fIM_flashSocketReady", 1);
            setTimeout(function(){
                $.MQTT.flashSock.connect();
            }, 0);
        },
        /**
         * @param  {number} status 返回MQTT连接状态
         */
        fIM_notifyConnectStatus: function(status){
            var statusText = status === 0 ? "DISCONNECT" : status===1 ? "CONNECTING" : "CONNECTED";
            $.Log("fIM_notifyConnectStatus:" + statusText + "(" + status + ")" , 1);
            
        },
        /**
         * 连接成功
         * @param  {string} message 连接状态
         */
        fIM_onConnected: function(message){
            $.Log("fIM_onConnected", 1);
            setTimeout(function(){
                $.MQTT.flashSock.onSuccess(message);
            }, 0);
        },
        /**
         * 连接异常
         * @param {number} status  异常代码
         * @param {string} message 异常消息
         */
        fIM_NotifyError: function(status, message){
            $.Log("fIM_NotifyError:" + status + ", message:" + message, 1);
            setTimeout(function(){
                $.MQTT.flashSock.connectionLost({
                    errorCode: status,
                    errorMessage: message
                });
            }, 0);
        },
        /**
         * 返回消息
         * @param  {string}
         * @param  {string}
         */
        fIM_onPublish: function(topic, message){
            message = typeof message === "string" ? message : $.JSON.toJSONString(message);
            $.Log("fIM_onPublish(" + topic + ", " + message + ")", 1);
            setTimeout(function(){
                $.MQTT.flashSock.messageArrived({
                    destinationName: topic,
                    payloadString: message
                });
            }, 0);
        }
    });
})(nTalk);