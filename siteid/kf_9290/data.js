(function($, undefined){
	$.data = {
		start: function(options){
			return this.get(options);
		},
		/**
		 * @method get 根据规则获取信息数据
		 * @param  {JSON}   options 预置在脚本中的规则
		 * @return {JSON}              返回获取的数据结构与NTKF_PARAM等同
		 */
		get: function(options){
			var self = this,
				startTime = $.getTime(),
				tmpData,
				whereSelector = "\\[where\\{(\\d+)\\s*,\\s*(\\-?\\d+)\\}\\]$",
				result = {}
			;
			options = $.extend({}, CON_RULE, options);
			
			if( typeof options == 'undefined' || $.isEmptyObject(options) ){
				return;
			}
			
			$.each(options, function(rule, page){
				var reg;
				try{
					reg = new RegExp(rule, "gi");
				}catch(e){
				}
				if( !reg || !reg.test( $.url ) ){
					$.Log('N-RegExp: ' + rule);
					return;
				}else{
					$.Log('Y-RegExp: ' + rule);
				}
				//开始获取数据
				$.each(page, function( fieldName, data){
					if( $.isArray(data) ){
						//获取单一数据
						for(var i = 0; i < data.length; i++ ){
							$.Log(fieldName + '[' + data[i].root + ']: ' + $.JSON.toJSONString(data[i]));
							
							if( data[i].root || $.inArray(fieldName, ['cartprice']) !== false ){
								var rootSelector = data[i].root;
								
								//20150821 root选择器添加自定义条件选择器
								var list;
								var tExp = new RegExp(whereSelector, "gi");
								var mExp = new RegExp(whereSelector, "gi");
								if( tExp.test(rootSelector) ){
									var match = mExp.exec(rootSelector);
									var start = match ? parseFloat( match[1] ) : 0;
									var end   = match ? parseFloat( match[2] ) : 0;
									rootSelector = rootSelector.replace(mExp, '');
									list = $(rootSelector).slice(start, end);
								}else{
									list = $(rootSelector);
								}
								
								if( !list.length ){
									$.base._reload_trail = true;
									continue;
								}else{
									$.base._reload_trail = false;
								}
								
								//购物车数据
								if( !result.ntalkerparam ){
								    result.ntalkerparam = {"items": []};
								}
                                
                                for(var ii = 0, ll = list.length; ii < ll; ii++){
                                    if( !result.ntalkerparam.items[ii] ){
									    result.ntalkerparam.items[ii] = {};
									}
								    result.ntalkerparam.items[ii][fieldName] = $.data.getFieldData(data[ii].root, ii, fieldName, data[ii]);
                                }
							}
							else if( $.inArray(fieldName, ['uid','uname','userlevel', 'erpparam', 'bland', 'category', 'orderid', 'orderprice']) <= -1 ){
								//商品页数据
								if( !result.ntalkerparam ){
									result.ntalkerparam = {'item': {}};
								}
								
								result.ntalkerparam.item[fieldName] = $.data.getFieldData('html', 0, fieldName, data[i]);
							}
							else{
								result[fieldName] = $.data.getFieldData('html', 0, fieldName, data[i]);
							}
						}
					}
				});
			});
			
			$.Log('nTalk.data.get() exec time ' + ($.getTime() - startTime) + ' ms', 1);
			//$.Log('DATA: ' + $.JSON.toJSONString(result) );
			return result;
		},
		/**
		 * @method getFieldData 根据规则获取单个配置的数据
		 * @param  {string}  selector  根选择器
		 * @param  {number}  index     索引
		 * @param  {String}  name      字段名称
		 * @param  {JSON}    conf      规则配置
		 * @return {String}            返回在网站页面中获取的数据
		 */
		getFieldData: function(selector, index, name, conf){
			var result, __global;
			if( $.isEmptyObject(conf) ){
				return '';
			}
			//$.Log('nTalk.getFieldData():' + conf.type.toLowerCase() + ' ' + name + ' ' + $.JSON.toJSONString(conf));
			switch( conf.type.toLowerCase() ){
				case 'global':
					result = this.getVariable(window, conf.name);
					break;
				case 'cookie':
					result = $.cookie.get( conf.name ) || '';
					break;
				case 'params':
					result = $.params[ conf.name ] || '';
					break;
				case 'hash':
					result = $.hashParams[ conf.name ] || '';
					break;
				case 'reg':
					result = this.verificationReg(conf);
					break;
				case 'url':
					result = window.location[ conf.name ];
					break;
				case 'attr':
				case 'link-reg':
				case 'attr-reg':
					result = this.verificationAttrReg(selector, index, conf);
					break;
				default://html
					result = this.verificationHtml(selector, index, conf);
					break;
			}
			$.Log('return:' + $.JSON.toJSONString(result));
			return result;
		},
		/**
		 * @method verificationReg
		 * @param  {JSON}   config [description]
		 * @return {Array}         [description]
		 */
		verificationReg: function(config){
			var reg, match;
			
			reg = new RegExp( config.regular.replace(/\\\\/ig, "\\"), 'gi');
			match = reg.exec( location.pathname + location.search + location.hash );
			
			return match && match[config.rindex] ? match[config.rindex] : '';
		},
		/**
		 * @method verificationAttrReg
		 * @param  {string}  selector  根选择器
		 * @param  {number}  index     索引
		 * @param  {JSON}   config     配置
		 * @return {Array}
		 */
		verificationAttrReg: function(selector, index, config){
			var $node, attrValue, reg;
			
			$node = $(selector).eq(index);
			if( config.selector ){
				$node = $node.find(config.selector).eq( $.isNumeric(config.sindex) ? config.sindex : 0 );
			}
			attrValue = $node.attr( config.name );
			
			if( config.regular ){
				reg = new RegExp(config.regular, "gi");
				match = reg.exec(attrValue);
				if( !match ) return null;
				
				return match[config.rindex];
			}else{
				return this.toFullURI( attrValue );
			}
		},
		toFullURI: function(url){
			url = url || '';
			if( /^\?/gi.test( url ) ){
				return document.pageURI + url;
			}else if( /^(\/)/gi.test( url ) ){
				return location.protocol + '//' + document.domain + url;
			}else{
				return url;
			}
		},
		/**
		 * @method verificationHtml
		 * @param  {string}  selector  根选择器
		 * @param  {number}  index     索引
		 * @param  {JSON}   config [description]
		 * @return {Array}         [description]
		 */
		verificationHtml: function(selector, index, config){
			var $node;
			
			$node = $(selector).eq(index);
			if( config.selector ){
				$node = $node.find(config.selector).eq( $.isNumeric(config.sindex) ? config.sindex : 0 );
			}
			return this.clearHtmlNode( $node.html() );
		},
		getVariable: function(global, key){
			if( key&&key.indexOf('.') > 1 ){
				var arr = key.split('.');
				for(var i=0; i<arr.length; i++){
					if( !arr[i] || arr[i] === '' ) continue;
					
					global = global[ arr[i] ] || '';
				}
			}else if( !!key ){
				global = global[key] || '';
			}
			return global;
		},
		/**
		 * @method clearHtmlNode 清除Html代码以及代码内的内容
		 * @param  {String} html html
		 * @return {String}      html
		 */
		clearHtmlNode: function(html){
			var clearHtmlExp = /(<.*?\>(.*?)<\/.*?\>)/ig;
			var nullChats    = /[\r\n(^\s+)(\s+$)]/gi;
			var comment		 = /<!--(.*?)--\>/gi;
			return html.replace(clearHtmlExp, '').replace(nullChats, '').replace(comment, '');
		}
	};
})(nTalk);