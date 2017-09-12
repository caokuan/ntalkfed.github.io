(function($, undefined){
	/**
	 * @description 轨迹服务模块
	 */
	if( $.trail ){
		return;
	}
	$.trail = {
		_trailServer: {
			'kf_9988': 'http://trailsvc.ntalker.com/trailsvc/count/trail.php?'
		},
		islogin: false,
		called: false,
		etype:		'pv',		//pv:常规PV请求; update:更新商品信息;event:页面元素事件;
		edata:		'',		//事件数据，JSON字符串格式内容
		/**
		 * 开始调用轨迹服务
		 * @param  {boolean} islogin
		 * @param  {boolean}  isupdate 用于发起PV请求后，更新商品信息
		 * @return {void}
		 */
		start: function(islogin, isupdate){
			var self = this, params, data, referrer_is_current = $.referrer && $.referrer.indexOf($.domain) > -1;

			if( this.called && !isupdate ){
				return;
			}

			$.Log('nTalk.trail.start()', 1);
			this.etype = isupdate ? 'update' : this.etype;
			//2014.11.07 来源页域名不为当前网站域名时，才当成新进入网站，轨迹服务log值为1
			if( islogin || $.global.trailid === '' || !referrer_is_current ){
				this.islogin = 1;
			}else{
				this.islogin = 0;
			}

			params = this.formartData();

			if( !$.isEmptyObject( $.global.ntalkerparam ) && $.global.ntalkerparam ){
				data = $.extend({}, {
					ntalkerparam: $.global.ntalkerparam
				});
			}

			//referrer 改为POST
			data = $.extend(data, {
				ref: document.referrer
			});

			$.each(params, function(i, QueryParam){
				self.request( self.formatURI() + $.toURI(QueryParam), data, function(log){
					$.Log(log, 1);
				}, i);
			});

			this.called = true;
		},
		/**
		 * @method request 请求轨迹服务
		 * @param  {String}   uri      轨迹服务地址
		 * @param  {JSON}     data     通过POST方式提交的数据
		 * @param  {Function} callback 轨迹服务调用完成后的回调函数
		 * @param  {[type]}   i        [description]
		 * @return {[type]}            [description]
		 */
		request: function(uri, data, callback, i){
			// 不要判断ntalkerparam
			// && data.hasOwnProperty("ntalkerparam") && !$.isEmptyObject(data.ntalkerparam)
			if(data){
				$.Log('nTalk.trail.request():etype:' + this.etype + ';POST request URI:' + uri);
				new $.POST(uri, data, function(e, name){

					callback.call(nTalk, 'nTalk.trail: iframe[' + name + '] post complete.', 1);

				}, 'POST_IFRAME_' + i);
			}
			else{
				$.Log('nTalk.trail.request():etype:' + this.etype + ';POST request URI:' + uri);
				$.require(uri + "#rnd", function( ){

					callback.call(nTalk, 'nTalk.trail: script get complete.', 1);

				});
			}
		},
		/**
		 * @method formatURI 格式化轨迹服务器地址
		 * @return {[type]} [description]
		 */
		formatURI: function(){
			if( this._trailServer[ $.global.siteid ] ){
				return $.protocolFilter( this._trailServer[ $.global.siteid ] );
			}else{
				return $.protocolFilter( $.server.trailserver + "/userinfo.php?" );
			}
		},
		/**
		 * @method  formartData 格式化轨迹服务参数
		 * @return {Array}
		 */
		formartData: function(){
			var result = [],
				orderprice,
				publicTrailParams = {
					action:		'save',
					url:		$.url,
					siteid:		$.global.siteid,
					uid:		$.user.id,
					uname:		$.user.name,
					//设备类型：0:PC;1:微信;2:APP;3:WAP
					//2014.09.04
					device:		$.browser.mobile ? 'WAP' : 'PC',
					isvip:		$.global.isvip,
					userlevel:	$.global.userlevel,
					cid:		$.global.pcid,
					sid:		$.global.trailid,
					log:		this.islogin,
					pageid:		$.base.pageid,
					etype:		this.etype,
					edata:		this.edata
				}
			;

			if( $.global.pagetype ){
				//--页面自定义类型
				if( $.url.indexOf('#') == -1 ){
					publicTrailParams.url += '#ntalker-pagetype=' + $.global.pagetype;
				}else if( $.url.indexOf('?') == -1 ){
					publicTrailParams.url = $.enCut($.url.replace(/#/i, '?ntalker-pagetype=' + $.global.pagetype + '#'), 255);
				}else{
					publicTrailParams.url = $.enCut($.url.replace(/#/i, '&ntalker-pagetype=' + $.global.pagetype + '#'), 255);
				}
			}

			if( this.islogin == 1 ){
				$.cache.set('tid',  $.global.trailid);

				publicTrailParams = $.merge(publicTrailParams, {
					lan:	$.language,
					scr:	screen.width+'*'+screen.height,
					cookie:	$.cookie.enable() ? 1 : 0,
					flash:	$.flash.version
				});
			}

			$.Log('nTalk.trail: ' + (this.islogin ? 'LOGIN' : 'LINK') + ' trailid:' + $.global.trailid + ', uid:' + $.user.id + ', pcid:' + $.global.pcid, this.islogin ? 1 : 0);

			//2014.11.20
			//针对平台版，商户ID\订单号\订单价格支持常规字符串外，添加支持数组
			//      sellerid,orderid,orderprice全转换为数组，以orderid的长度为凭据，超出部分丢弃,不足以空补足

			if( $.global.orderid.length ){
				$.each($.global.orderid, function(i, orderid){
					if( i > $.global.orderprice.length - 1 ){
						orderprice = '';
					}else{
						orderprice = $.global.orderprice[i];
					}

					//$.Log('orderid:' + orderid + ', orderprice:' + orderprice, 2);
					result.push(	$.merge({}, publicTrailParams, {
							orderid:	orderid,
							orderprice:	orderprice,
							sellerid:	$.global.sellerid[i] || '',
							ttl:		$.global.title
							//ref:		$.referrer
						})
					);
				});
			}else{
				result.push(	$.merge({}, publicTrailParams, {
						sellerid:	$.global.sellerid.length ? $.global.sellerid[0] : '',
						ttl:		$.global.title
						//ref:		$.referrer
					})
				);
			}

			return result;
		}
	};
})(nTalk);
