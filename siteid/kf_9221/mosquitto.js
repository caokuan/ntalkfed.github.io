;(function($, undefined){

	var CONNECT = 0x10,
		CONNACK = 0x20,
		PUBLISH = 0x30,
		PUBACK = 0x40,
		PUBREC = 0x50,
		PUBREL = 0x60,
		PUBCOMP = 0x70,
		SUBSCRIBE = 0x80,
		SUBACK = 0x90,
		UNSUBSCRIBE = 0xA0,
		UNSUBACK = 0xB0,
		PINGREQ = 0xC0,
		PINGRESP = 0xD0,
		DISCONNECT = 0xE0;

	$.extend({
		AB2S : function(buffer){
			var binary = '';
			var bytes = new Uint8Array(buffer);
			var len = bytes.byteLength;
			for(var i=0; i<len; i++){
				binary += String.fromCharCode(bytes[i]);
			}
			return binary;			
		}
	});

	$.Mosquitto = $.Class.create();
	$.Mosquitto.prototype = {

		initialize : function(){
			this.ws = null;
			this.onconnect = null;
			this.ondisconnect = null;
			this.onmessage = null;
			this.onreconnect = null;
			this.closeFlag = false;

			if (!ArrayBuffer.prototype.slice){
				ArrayBuffer.prototype.slice = function (start, end) {
				var that = new Uint8Array(this);
				if (end === undefined) end = that.length;
				var result = new ArrayBuffer(end - start);
				var resultArray = new Uint8Array(result);
				for (var i = 0; i < resultArray.length; i++)
					resultArray[i] = that[i + start];
					return result;
			    };
			}
		},
		
		mqtt_ping : function(){
			var buffer = new ArrayBuffer(2);
			var i8V = new Int8Array(buffer);
			i8V[0] = PINGREQ;
			i8V[1] = 0;
			if(this.ws.readyState == 1){
				this.ws.send(buffer);
			}else{
				this.queue(buffer);
			}
			setTimeout(function(_this){_this.mqtt_ping();}, 60000, this);
		},

		connect : function(url, keepalive, clientId){
			this.url = url;
			this.keepalive = keepalive;
			this.clientId = clientId;
			this.mid = 1;
			this.out_queue = [];

			try{
				this.ws = new WebSocket(url, 'mqttv3.1');
				this.ws.binaryType = "arraybuffer";
				this.ws.onopen = this.ws_onopen;
				this.ws.onclose = this.ws_onclose;
				this.ws.onmessage = this.ws_onmessage;
				this.ws.m = this;
				this.ws.onerror = this.ws_onerror;
			}catch(e){
				$.Log("url is wrong or server is down");
			}
		},

		disconnect : function(){
			if(this.ws.readyState == 1){
				var buffer = new ArrayBuffer(2);
				var i8V = new Int8Array(buffer);

				i8V[0] = DISCONNECT;
				i8V[1] = 0;
				this.ws.send(buffer);
				this.ws.close();
			}
		},

		ws_onerror : function(evt) {
			$.Log("mqtt error: " + evt.data, 3);
		},

		ws_onopen : function(evt) {
			var username = "testuser",
				password = "passwd",
                j,
				clientId = this.m.clientId
            ;
			//var username = "admin";
			//var password = "password";

			$.Log("[MQTT CLIENTID] onopen: " + clientId);
			var buffer = new ArrayBuffer(1+1+12+2+clientId.length+2+username.length+2+password.length);
			var i8V = new Int8Array(buffer);

			i=0;
			i8V[i++] = CONNECT;
			i8V[i++] = 12+2+clientId.length+2+username.length+2+password.length;
			i8V[i++] = 0;
			i8V[i++] = 6;
			str = "MQIsdp";
			for(j=0; j<str.length; j++){
				i8V[i++] = str.charCodeAt(j);
			}
			i8V[i++] = 3;
			i8V[i++] = 0xC2;
			i8V[i++] = 0;
			i8V[i++] = 60;
			i8V[i++] = 0;
			i8V[i++] = clientId.length;

			for(j=0; j<clientId.length; j++){
				i8V[i++] = clientId.charCodeAt(j);
			}
			
			i8V[i++] = 0;
			i8V[i++] = username.length;
			for(j=0; j<username.length; j++){
				i8V[i++] = username.charCodeAt(j);
			}

			
			i8V[i++] = 0;
			i8V[i++] = password.length;
			for(j=0; j<password.length; j++){
				i8V[i++] = password.charCodeAt(j);
			}		

			this.send(buffer);
			while(this.m.out_queue.length > 0){
				this.send(this.m.out_queue.pop());
			}
			setTimeout(function(_this){_this.mqtt_ping();}, 60000, this.m);
		},

		ws_onclose : function(evt) {
			$.Log("mqtt close error: " + evt.data, 3);

			if(this.m){
				if(!this.closeFlag){
					this.m.onreconnect();
				}else{
					this.m.disconnect();
				}
			}else{
				this.onreconnect();
			}
		},
		/**
		 * 情况：
		 * 登录：qos = 0 客户端发起 TYPE:PUBLISH
		 * 保持心跳：qos = 0 客户端发起 TYPE:PUBLISH
		 * 下发消息：qos = 1 服务端发起 TYPE:PUBLISH 
		 *					 客户端响应 TYPE:PUBACK
		 *           qos = 2 服务端发起 TYPE:PUBLISH 
		 *                   客户端响应 TYPE:PUBRECV 
		 *                   服务端确认 TYPE:PUBREL 
		 *                   客户端完成 TYPE:PUBCOMP
		 */
		ws_onmessage : function(evt) {
			var self = this;
			var i8V = new Int8Array(evt.data);
			buffer = evt.data;
			var q=0, rl, i, digit, mid;
			while(i8V.length > 0 && q < 1000){
				if((i8V[0] & 0xF0) == DISCONNECT){
					$.Log("recieve a disconnect info !", 3);
					this.closeFlag = true;
					this.m.ws.close();
					break;
				}
				q++;
				switch(i8V[0] & 0xF0){
					case CONNACK:
						rl = i8V[1];
						var rc = i8V[2];
						if(this.m.onconnect){
							this.m.onconnect(rc);
						}
						buffer = buffer.slice(rl+2);
						i8V = new Int8Array(buffer);
						break;
					case PUBLISH:
						i=1;
						var mult = 1;
						rl = 0;
						var count = 0;
						var qos = (i8V[0] & 0x06) >> 1;
						var retain = (i8V[0] & 0x01);
						mid = 0;
                        
						do{
							count++;
							digit = i8V[i++];
							rl += (digit & 127)*mult;
							mult *= 128;
						}while((digit & 128) !== 0);

						var topiclen = i8V[i++]*256 + i8V[i++];
						var atopic = buffer.slice(i, i+topiclen);
						i+=topiclen;
						var topic = $.AB2S(atopic);
						if(qos > 0){
							mid = i8V[i++]*256 + i8V[i++];
							var cmd = (1 == qos) ? PUBACK : PUBREC;  
							this.m.send_cmd_with_mid(cmd, mid);
						}
						var apayload = buffer.slice(i, rl+count+1);
						var payload = $.AB2S(apayload);

						buffer = buffer.slice(rl+1+count);
						i8V = new Int8Array(buffer);

						if(this.m.onmessage){
							this.m.onmessage(topic, payload, qos, retain);
						}
						break;
					case PUBREC:
					//下发消息质量为2时，会收到服务端发起的二次确认
					case PUBREL:
						i = 1;
						mid = 0;
						do{
							count++;
							digit = i8V[i++];
							rl += (digit & 127)*mult;
							mult *= 128;
						}while((digit & 128) !== 0);

						mid = i8V[i++]*256 + i8V[i++];

						this.m.send_cmd_with_mid(PUBCOMP, mid);
                        break;
					case PUBACK:
					case PUBCOMP:
					case SUBACK:
					case UNSUBACK:
					case PINGRESP:
						rl = i8V[1];
						buffer = buffer.slice(rl+2);
						i8V = new Int8Array(buffer);
						break;
				}
			}
		},

		get_remaining_count : function(remaining_length)
		{
			if(remaining_length >= 0 && remaining_length < 128){
				return 1;
			}else if(remaining_length >= 128 && remaining_length < 16384){
				return 2;
			}else if(remaining_length >= 16384 && remaining_length < 2097152){
				return 3;
			}else if(remaining_length >= 2097152 && remaining_length < 268435456){
				return 4;
			}else{
				return -1;
			}
		},

		generate_mid : function()
		{
			var mid = this.mid;
			this.mid++;
			if(this.mid == 256) this.mid = 0;
			return mid;
		},

		queue : function(buffer)
		{
			this.out_queue.push(buffer);
		},

		send_cmd_with_mid : function(cmd, mid)
		{
			var buffer = new ArrayBuffer(4);
			var i8V = new Int8Array(buffer);
			i8V[0] = cmd;
			i8V[1] = 2;
			i8V[2] = mid/256;
			i8V[3] = mid%256;
			if(this.ws.readyState == 1){
				this.ws.send(buffer);
			}else{
				this.queue(buffer);
			}
		},

		unsubscribe : function(topic)
		{
			var rl = 2+2+topic.length;
			var remaining_count = this.get_remaining_count(rl);
			var buffer = new ArrayBuffer(1+remaining_count+rl);
			var i8V = new Int8Array(buffer);

			var i=0;
			i8V[i++] = UNSUBSCRIBE | 0x02;
			do{
				digit = Math.floor(rl % 128);
				rl = Math.floor(rl / 128);
				if(rl > 0){
					digit = digit | 0x80;
				}
				i8V[i++] = digit;
			}while(rl > 0);
			i8V[i++] = 0;
			i8V[i++] = this.generate_mid();
			i8V[i++] = 0;
			i8V[i++] = topic.length;
			for(var j=0; j<topic.length; j++){
				i8V[i++] = topic.charCodeAt(j);
			}

			if(this.ws.readyState == 1){
				this.ws.send(buffer);
			}else{
				this.queue(buffer);
			}
		},

		subscribe : function(topic, qos)
		{
			if(qos !== 0){
				return 1;
			}
			var rl = 2+2+topic.length+1;
			var remaining_count = this.get_remaining_count(rl);
			var buffer = new ArrayBuffer(1+remaining_count+rl);
			var i8V = new Int8Array(buffer);

			var i=0;
			i8V[i++] = SUBSCRIBE | 0x02;
			do{
				digit = Math.floor(rl % 128);
				rl = Math.floor(rl / 128);
				if(rl > 0){
					digit = digit | 0x80;
				}
				i8V[i++] = digit;
			}while(rl > 0);
			i8V[i++] = 0;
			i8V[i++] = this.generate_mid();
			i8V[i++] = 0;
			i8V[i++] = topic.length;
			for(var j=0; j<topic.length; j++){
				i8V[i++] = topic.charCodeAt(j);
			}
			i8V[i++] = qos;

			if(this.ws.readyState == 1){
				this.ws.send(buffer);
			}else{
				this.queue(buffer);
			}
		},

		publish : function(topic, payload, qos, retain){
			if(qos !== 0) return 1;
			var rl = 2+topic.length+payload.length;
			var remaining_count = this.get_remaining_count(rl);
			var buffer = new ArrayBuffer(1+remaining_count+rl);
			var i8V = new Int8Array(buffer);

			var i=0, j;
			retain = retain?1:0;
			i8V[i++] = PUBLISH | (qos<<1) | retain;
			do{
				digit = Math.floor(rl % 128);
				rl = Math.floor(rl / 128);
				if(rl > 0){
					digit = digit | 0x80;
				}
				i8V[i++] = digit;
			}while(rl > 0);
			i8V[i++] = 0;
			i8V[i++] = topic.length;
			for(j=0; j<topic.length; j++){
				i8V[i++] = topic.charCodeAt(j);
			}
			for(j=0; j<payload.length; j++){
				i8V[i++] = payload.charCodeAt(j);
			}

			if(this.ws.readyState == 1){
				this.ws.send(buffer);
			}else{
				this.queue(buffer);
			}
		}
    };

})(nTalk);