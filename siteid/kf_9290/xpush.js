; (function ($) {

    var serveraddr = '192.168.30.246' || $.flashserver.xpush;
    var port = 8088;

    $.xpush = function () { };
    $.xpush.debug = true;

    var mqttMessage = function (data, topic, qos) {
        var str = stringify(data);
        var message = new $.MQTT.Message(str);
        message.destinationName = topic;
        message.qos = qos;
        return message;
    }

    var stringify = function (o) {
        if (window.JSON) {
            return JSON.stringify(o);
        } else {
            return $.JSON.toJSONString(o);
        }
    }

    var parse = function (s) {
        if (window.JSON) {
            return JSON.parse(s);
        } else {
            return $.JSON.parseJSON(s);
        }
    }

    var log = function (s) {
        if ($.xpush.debug) {
            if (window.console && console.log) {
                console.log(s);
            } else {
                $.Log(s, 1);
            }
        }
    }

    var formatXpushData = function (xpushdata) {
        var formatData = {};

        if (xpushdata) {
            xpushdata = parse(xpushdata);   
        }

        if (xpushdata.contents && xpushdata.numbers) {
            for (var key in xpushdata.contents) {
                formatData[key] = {
                    unreadMessageCount: xpushdata.numbers[key],
                    lastMessage: xpushdata.contents[key][0]
                }
            }
        }

        return formatData;
    }

    $.xpushcallback = function (data) {
        if (data) {
            $.xpush.unreadMessageInfo = formatXpushData(data);
        }

        log(stringify($.xpush.unreadMessageInfo));

        if ($.global.callbacks.ReceiveOfflineMessage) {
            try {
                $.global.callbacks.ReceiveOfflineMessage($.xpush.unreadMessageInfo);
            } catch (e) {
                log('客户尚未实现ReceiveOfflineMessage接口，或实现内部报错');
                $.xpush.UI.show($.xpush.unreadMessageInfo);
            }
        } else {
            $.xpush.UI.show($.xpush.unreadMessageInfo);
        }

    }

    $.xpush.startXpush = function () {
        var self = this;
        var callback = function () {
            $.xpushcallback(JSON.parse(xdr.responseText).message);
        }
        var search = function () {
            xdr = new XDomainRequest(); // Create a new XDR object.
            if (xdr) {
                xdr.onload = callback;
                xdr.onerror = callback;
                xdr.open("get", 'http://192.168.30.246/xpush/thirdpush/poll?userid=' + NTKF.user.id + '&clientid=' + self.clientid + '&devicetype=webhttp');
            }
            xdr.send();
        }
        requestXpushInterval = setInterval(search, 10 * 1000);
        search();
    }

    $.xpush.stopXpush = function () {
        clearInterval(requestXpushInterval);
        requestXpushInterval = null;
    }

    $.xpush.init = function () {
        var self = this;

        // 生成clientid
        var clientid = 'JS_' + $.randomChar(20).toLowerCase();

        /**
         * 清零接口
         * 参数1: 不传
         * 参数2: 访客id
         * 参数3: 接待组id
         */
        this.clearSettingUnReadMsgCount = function (settingid) {
            var info = self.unreadMessageInfo;

            if (info && info[settingid]) {
                info[settingid].unreadMessageCount = 0;
                info[settingid].lastMessage = "";

                if ($.browser.oldmsie) {
                    xdr = new XDomainRequest(); // Create a new XDR object.
                    if (xdr) {
                        xdr.onload = callback;
                        xdr.onerror = callback;
                        xdr.open("get", 'http://192.168.30.246/xpush/thirdpush/clearSettingUnReadMsgCount?userid=' + NTKF.user.id);
                    }
                    xdr.send();
                    self.stopXpush();
                } else {
                    self.connect.send(new mqttMessage({
                        method: 'clearSettingUnReadMsgCount',
                        params: [, $.user.id, settingid]
                    }, self.peertopic, 1));
                }

                $.xpushcallback();
            }

        }

        $.xpush.UI.init();

        if ($.browser.oldmsie || !$.browser.supportMqtt) {
            this.clientid = clientid;
            this.startXpush();
            return;
        }

        this.connect = new $.MQTT.Client(serveraddr, port, clientid);

        this.connect.onConnectionLost = function (response) {
            log(stringify(response));
        };

        this.connect.onMessageArrived = function (message) {
            var data = parse(message.payloadString);

            //responseserver
            /**
             * peertopic 往服务器的topic里面发消息，但不需要订阅 
             * mywilltopic 需要订阅，接收遗言消息
             * myapptopic 需要订阅,接收xpush业务消息
             * settingid 接待组ID
             * sessionid 在xpush业务中，此字段无意义
             */
            if (data.method === 'responseServer') {
                log("接收到xpush的responseServer");
                log("peertopic: " + data.params[0]);
                log("mywilltopic: " + data.params[1]);
                log("myapptopic: " + data.params[2]);

                self.peertopic = data.params[0];
                self.connect.subscribe(data.params[1], { onSuccess: function () { log('成功订阅xpush业务层遗言topic'); }, onFailure: function () { } });
                self.connect.subscribe(data.params[2], {
                    onSuccess: function () {
                        log('成功订阅xpush业务层接收消息topic');
                        log('发送roomConnect');
                        self.connect.send(new mqttMessage({
                            method: 'roomConnect',
                            params: [
                                $.user.id,
                                clientid,
                                0,
                                0,
                                'webmqtt'
                            ]
                        }, self.peertopic));
                    }, onFailure: function () { }
                });

                setInterval(function () {
                    self.connect.send(new mqttMessage({
                        method: 'remoteKeepAlive',
                        params: [
                            clientid,
                            $.user.id
                        ]
                    }, self.peertopic, 0));
                    log("发送KeepAlive");
                }, 3 * 60 * 1000);
            }
            /**
             * params[0]: 登录是否成功 true | false 
             * params[1]: 是否过期 true | false
             * params[2]: userid
             * params[3]: clientid
             * params[4]: 未读消息 “” 
             * {
             *    numbers:{kf_8002_9999:1,kf_8002_9998:2}, 
             *    contents:{
             *      kf_8002_9999: ["图片消息", 时间], 
             *      kf_8002_9998: ["王启宇大帅哥", 时间]
             *    }
             * }
             */
            else if (data.method === 'LoginResult') {
                log('接收到登录结果消息：' + data.params[0]);
                if (data.params[4] === "") {
                    log('没有离线消息');
                } else {
                    // 打印一下离线消息的内容
                    $.xpushcallback(data.params[4]);
                }
            }
            else if (data.method === 'remoteNotifyUnReadMessage') {
                /**
                 * 访客在网站上，但是没有打开聊窗时，接收到消息
                 */
                $.xpushcallback(data.params[1]);
            }
        }

        var willMessage = new mqttMessage({}, "S/WILL/a", 1);

        var options = {
            userName: 'ntguest',
            password: 'xiaoneng123',
            useSSL: false,
            timeout: 6,
            keepAliveInterval: 180,
            cleanSession: false,
            willMessage: willMessage,
            mqttVersion: 4,
            onSuccess: function () {
                log('连接MQTT服务成功');

                self.connect.subscribe('C/' + clientid, {
                    onSuccess: function (result) {
                        log("订阅业务层成功");
                        self.connect.send(new mqttMessage({
                            method: "requestServer",
                            /**
                             * userid: 客户集成的userid $.user.id
                             * clientid: 上面生成的clientid
                             * settingid: 接待组id
                             * targetid：传空
                             * sessionid：传空
                             */
                            params: [$.user.id, clientid, 'kf_8002_1491904802839', "", ""]
                        }, 'S/ROUTE/NEWIM', 0));
                    },
                    onFailure: function (error) {
                        log("订阅业务层失败");
                    }
                });
            },
            onFailure: function (e) {
                log('连接MQTT服务失败');
            }
        };

        this.connect.connect(options);
    }

    $.xpush.UI = {
        settingids: [],
        init: function () {
            var self = this;

            this.xpushContainer = $({
                tag: 'div',
                className: 'nTalk-xpush-container',
                style: $.STYLE_BODY + 'width:300px;height:100px;position:fixed;right:0;bottom:0;display:none'
            }).appendTo(true);
            this.xpushMessageWrapper = $({
                tag: 'ul',
                className: 'nTalk-xpush-message-wrapper',
                style: $.STYLE_BODY + 'margin:30px 100px 0 0;max-width:230px;'
            }).appendTo(this.xpushContainer);
            this.xpushMessageCount = $({
                tag: 'span',
                className: 'nTalk-xpush-message-count',
                style: $.STYLE_BODY + 'position:absolute;color:#4C97EA;top:8px;right:4px;width:22px;height:22px;text-align:center;line-height:22px;font-size:18px'
            }).appendTo(this.xpushContainer);
            this.xpushMessageCountBkg = $({
                tag: 'img',
                src: $.sourceURI + 'images/messageCountBkg.png',
                className: 'nTalk-xpush-message-count-bkg',
                style: $.STYLE_NBODY + 'float:right;position:absolute;left:210px;top:5px;z-index:-1'
            }).appendTo(this.xpushContainer);
            this.xpushMessage = $({
                tag: 'li',
                className: 'nTalk-xpush-message',
                style: $.STYLE_BODY + 'color: white;min-width:60px;position:absolute;bottom:45px;right:100px;font-family: "微软雅黑";font-size: 14px;background: #3786EB;border-radius: 5px;display: inline;float: right;padding-left: 6px;padding-right: 2px;font-weight: 100;padding-top: 7px;padding-bottom: 7px;word-break:break-all;list-style:none'
            }).appendTo(this.xpushMessageWrapper);
            this.xpushMessageAngel = $({
                tag: 'div',
                className: 'nTalk-xpush-message-angel',
                style: $.STYLE_BODY + ' display: block;position: absolute;left: 170px;top: 2px;margin:30px;height:0px;width:0px;border-left:solid 5px #3786EB;border-top:solid 5px rgba(0,0,0,0); border-bottom:solid 5px rgba(0,0,0,0); '
            }).appendTo(this.xpushMessageWrapper);

            this.xpushMessageCountBkg.bind('click', function(){
                for (var i = 0, l = self.settingids.length; i < l; i++) {
                     NTKF.im_openInPageChat(self.settingids[i]);
                }
                self.hide();
                self.settingids = [];
            })
        },

        show: function (data) {
            var count = 0;
            var lastMessage = "";

            for (var settingid in data) {
                count += data[settingid].unreadMessageCount;
                lastMessage = data[settingid].lastMessage;
                this.settingids.push(settingid);
            }
                                     
            this.xpushContainer.display(1);
            this.xpushMessage.html(lastMessage);
            this.xpushMessageCount.html(count);
        },

        hide: function () {
            this.xpushContainer.display(0);
        }
    }

})(nTalk);