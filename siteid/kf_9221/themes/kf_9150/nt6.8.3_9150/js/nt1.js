;(function(window, underfined){
	var root,
		readyList = [],
		loadList = {},
		core_strUndefined = typeof undefined,
		location = window.location,
		document = window.document,
		navigator = window.navigator,
		core_deletedIds = [],
		class2type = {},
		core_push = core_deletedIds.push,
		core_slice = core_deletedIds.slice,
		core_hasOwn = class2type.hasOwnProperty,
		core_version = '2015.09.23',
		rQuickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
		rSingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
		cssValueExp = /[\-\+0-9\.]/ig,
		rCamelCase = /-([a-z])/ig,
		clearHtmlExp = /(<.*?>)/ig,
		nTalk = function (selector, context) {
			return new nTalk.fn.init(selector, context, root);
		},
		readyComplete = false,
        emptyFunc = function(){}
	;

	nTalk.fn = nTalk.prototype = {
		talkVersion:   core_version,
		constructor:   nTalk,
		init: function(selector, context, root){/*selector init*/
			var match, elem;

			if( !selector ){
				return this;
			}
			if ( typeof selector === "string" ) {
				if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
					match = [ null, selector, null ];
				} else {
					match = rQuickExpr.exec( selector );
				}
				if ( match && (match[1] || !context) ) {
					if ( match[1] ) {
						context = context instanceof nTalk ? context[0] : context;
						nTalk.merge(this, nTalk.parseHTML(
							match[1],
								context && context.nodeType ? context.ownerDocument || context : document,
							true
						));
						return this;
					} else { //$(#id)
						elem = document.getElementById( match[2] );
						if ( elem && elem.parentNode ) {
							this.length = 1;
							this[0] = elem;
						}
						this.context = document;
						this.selector = selector;
						return this;
					}
				} else if ( !context || context.talkVersion ) {//$(expr, $(...))
					return ( context || root ).find( selector );
				} else {//$(expr, context)
					return this.constructor( context ).find( selector );
				}
			} else if( selector.nodeType || nTalk.isWindow(selector) ) {//$(DOMElement)
				this.context = this[0] = selector;
				this.length = 1;
				return this;
			} else if( nTalk.isObject(selector) && selector.talkVersion ){//$()
				if( selector.length ){
					this.context = this[0] = selector[0];
					this.length = 1;
				}
				return this;
			} else if( nTalk.isPlainObject(selector) ) {//$({tag:"DIV"})
				var tag = selector.tag||'div';
				delete selector.tag;

				this.context = this[0] = nTalk.Element(tag, selector);
				this.length = 1;
				return this;
			} else if ( nTalk.isFunction( selector ) ) {//$(function)
				return nTalk.ready( selector );
			}
			if ( selector.selector !== undefined ) {
				this.selector = selector.selector;
				this.context = selector.context;
			}

			return nTalk.merge( this, [selector] );
		},
		selector:   "",
		length:     0,
		toArray: function() {
			return core_slice.call( this );
		},
		get: function( num ){
			return num === null ?
				this.toArray() :
				( num < 0 ? this[ this.length + num ] : this[ num ] );
		},
		pushStack: function( elems ) {
			var ret = nTalk.merge( this.constructor(), elems );
			ret.prevObject = this;
			ret.context = this.context;
			return ret;
		},
		slice: function() {
			return this.pushStack( core_slice.apply( this, arguments ) );
		},
		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
		},
		first: function() {
			return this.eq( 0 );
		},
		last: function() {
			return this.eq( this.length - 1 );
		},
		each: function( callback, args ) {
			return nTalk.each( this, callback, args );
		},
		find: function( selector ){
			var child = this.constructor.selector.query(selector, this);
			return this.pushStack( child );
		},
		push: core_push,
		sort: [].sort,
		splice: [].splice
	};
	nTalk.fn.init.prototype = nTalk.fn;
	nTalk.extend = nTalk.fn.extend = function() {/*extend*/
		var options, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;
		if ( typeof target === "boolean" ) {
			deep = target;
			target = arguments[1] || {};
			i = 2;
		}
		if ( typeof target !== "object" && !nTalk.isFunction(target) ) {
			target = {};
		}
		if ( length === i ) {
			target = this;
			--i;
		}
		for ( ; i < length; i++ ) {
			options = arguments[i];
			if ( options ) {
				for (var key in options) {
					if( !options.hasOwnProperty(key) ) continue;
					src = target[ key ];
					copy = options[ key ];
					if (target === copy) {
						continue;
					}
					if (deep && copy && ( nTalk.isPlainObject(copy) || (copyIsArray = nTalk.isArray(copy)) )) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && nTalk.isArray(src) ? src : [];
						} else {
							clone = src && nTalk.isPlainObject(src) ? src : {};
						}
						target[ key ] = nTalk.extend(deep, clone, copy);
					} else if (copy !== undefined) {
						target[ key ] = copy;
					}
				}
			}
		}
		return target;
	};
	nTalk.extend({/*-base function-*/
		CON_CACHE_COOKIE:	'nTalk_CACHE_DATA',
		CON_MANAGE_COOKIE:	'nTalk_PAGE_MANAGE',
		CON_PCID_KEY:		'NTKF_T2D_CLIENTID',
		CON_CONNECT_FLASH:	'FLASH',
		CON_CONNECT_COMET:	'COMET',
		/**
		 * @property
		 * @name
		 * @type {String}
		 */
		STYLE_BODY: 'margin:0;padding:0;border:none;float:none;width:auto;height:auto;min-width:none;min-height:none;max-width:none;max-height:none;clear:none;position:static;left:auto;top:auto;right:auto;bottom:auto;text-align:left;box-sizing:content-box;color:#000;background-color:transparent;font:normal normal normal 12px/160% Arial,Microsoft YaHei;',
		STYLE_NBODY:'margin:0;padding:0;border:none;float:none;width:auto;height:auto;min-width:none;min-height:none;max-width:none;max-height:none;clear:none;position:static;left:auto;top:auto;right:auto;bottom:auto;text-align:left;box-sizing:content-box;color:#000;background-color:transparent;font:normal normal normal 0px/0px Arial,Microsoft YaHei;',
		isReady:    false,
		Log:		emptyFunc,
		charset:    document.charset || document.characterSet,
		language:   navigator.language || navigator.systemLanguage,
		protocol:   location.protocol,
		url:		location.href,
		title:      document.title,
		referrer:   document.referrer,
		/**
		 * @property 页内时当前页地址，面外时可能是referrer
		 */
		source:     '',
		/**
		 * @property 网站域名
		 */
		domain:     '',
		/**
		 * @property 脚本路径
		 */
		baseProtocol:'',
		/**
		 * @property 脚本加载地址
		 */
		baseURI:    '',
		/**
		 * @property 资源加载地址
		 */
		sourceURI:  '',
		/**
		 * @property 当前加载脚本文件名
		 */
		baseName:   '',
		/**
		 * @property {String} 加载脚本时的参数，用于加载内部脚本时附加此参数
		 */
		baseExt:	'',
		/**
		 * @property {Object} 加载脚本时的参数
		 */
		extParmas:	{},
		/**
		 * @property 当前页路径
		 */
		pageURI:    '',
		/**
		 * @property 当前页面地址文件名
		 */
		pageName:   '',
		/**
		 * @property 当前页面所有参数
		 */
		params:     null,
		/**
		 * @property {Object} hash参数
		 */
		hashParams: null,
		/**
		 * @property 访客信息
		 */
		user:       {},
		/**
		 * @property 语言包
		 */
		lang:       null,
		/**
		 * @property 脚本地址配置
		 */
		server:     null,
		/**
		 * @property 全局配置
		 */
		global:     {},
		/**
		 * @property IM连接对像
		 */
		IMPRESENCE: null,
		version: {
			pub: core_version
		},
		/**
		 * @property 嵌入脚本父级节点
		 */
		elementParent:    null,
		/**
		 * @property 嵌入脚本节点
		 */
		elementBefore:    null,
		/**
		 * @property 主题资源目录
		 */
		themesURI:        '',
		/**
		 * @method isNumeric 判断是否是数字类型值
		 */
		isNumeric: function( obj ) {
			return !isNaN( parseFloat(obj) ) && isFinite( obj );
		},
		/**
		 * @method isBoolean 是否是true|false类型值
		 */
		isBoolean: function(v){
			return typeof v === 'boolean';
		},
		/**
		 * @method isDefined 判断变量是否定义
		 */
		isDefined: function( v ){
			return typeof v !== "undefined";
		},
		/**
		 * @method isWindow 是否是window对像
		 */
		isWindow: function( obj ) {
			return obj && obj == obj.window;
		},
		/**
		 * @method isFunction 是否是函function类型
		 */
		isFunction: function( obj ) {
			return Object.prototype.toString.call(obj) === "[object Function]";
		},
		/**
		 * @method isArray 是否是数组类型
		 */
		isArray: function( obj ) {
			return nTalk.isFunction(Array.isArray) ? Array.isArray(obj) : Object.prototype.toString.call(obj) === "[object Array]";
		},
		/**
		 * @method isObject 是否是对像类型(非HTMLDOM)
		 */
		isObject: function( obj ){
			return Object.prototype.toString.call(obj) === "[object Object]" && obj && !this.isDefined(obj.nodeType);
		},
		/**
		 * @method isEmptyObject 是否是空对像
		 */
		isEmptyObject: function( obj ) {
			for ( var name in obj ) {
				if( !obj.hasOwnProperty(name) ) continue;
				return false;
			}
			return true;
		},
		/**
		 * @method isPlainObject 是否是普通对像
		 * @param {Object} obj
		 * @return {Boolean}
		 */
		isPlainObject: function(obj){
			if( typeof obj !== "object" || obj.nodeType || this.isWindow(obj) ){
				return false;
			}
			try{
				if( obj.constructor && !core_hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ){
					return false;
				}
			} catch (e){
				return false;
			}
			return true;
		},
		/**
		 * @method getWindow 获取当前DOM对像关连的window对像
		 * @param {HTMLElement|window} elem
		 */
		getWindow: function(elem){
			return nTalk.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
		},
		/**
		 * @method bind 等同apply
		 * @param {HTMLElement} object
		 * @param {Function} func
		 */
		bind: function(object, func){
			var args = Array.prototype.slice.call(arguments).slice(2);
			return function(event) {
				return func.apply(object, [event || window.event].concat(args));
			};
		},
		/**
		 * @method parseHTML html转DOM
		 * @param  {String}  html
		 * @param  {Boolean} context
		 * @return  {Array}   返回的节点集合
		 */
		parseHTML: function( html, context ) {
			if ( !html || typeof html !== "string" ) {
				return null;
			}

			context = context || document;
			var parsed = rSingleTag.exec( html );
			// Single tag
			if ( parsed ) {
				return [ context.createElement( parsed[1] ) ];
			}
			if( !/<|&#?\w+;/.test(html) ){
				return [ context.createTextNode( html ) ];
			}else{
				//--复杂html
				var tmp = context.createElement('div');
				tmp.innerHTML = html;
				return nTalk.merge([], tmp.childNodes);
			}
		},
		/**
		 * @method merge 合并对像
		 */
		merge: function( ) {
			var target = arguments[0] || {},
				args = arguments,
				i, k, len
			;
			if( args.length <= 1 ) return target;
			for(i = 1; i < args.length; i++ ){
				if ( !args[i] || args[i] === null ) continue;
				if ( args[i].length === undefined ){
					for(k in args[i] ){
						if( !args[i].hasOwnProperty(k) ) continue;
						target[k] = args[i][k];
					}
				} else {
					for(k = 0, len = args[i].length; k < len; k++ ) {
						if( target.length !== undefined )
							target.push(args[i][k]);
						else
							target[k] = args[i][k];
					}
				}
			}
			return target;
		},
		/**
		 * @method each 枚举对像、数组、json,并执行对应函数
		 * @param {Array|Object|String|Number} obj
		 * @param {Function} callback
		 * @param {Array}    args
		 * @return {Array|Object|String|Number}
		 */
		each: function( obj, callback, args){
			if( !nTalk.isArray(args) ) args = [];

			if( nTalk.isArray(obj) || (nTalk.isObject(obj) && obj.talkVersion) ){
				for(var i = 0; i < obj.length;){
					if( callback.apply(obj[i], [i, obj[i++]].concat(args)) === false ){
						break;
					}
				}
			}else if( nTalk.isObject(obj) ){
				for(var name in obj){
					if( !obj.hasOwnProperty(name) ) continue;
					callback.apply(obj[name], [name, obj[name]].concat(args));
				}
			}else{
				callback.apply(obj, [0, obj].concat(args));
			}
			return obj;
		},
		/**
		 * @method access 连式调用功能函数
		 */
		access: function(elems, fn, key, value, chainable){
			var i = 0,
				length = elems.length;

			if( nTalk.isPlainObject(key) ){
				chainable = true;
				for(var k in key){
					if( !key.hasOwnProperty(k) ) continue;
					nTalk.access(elems, fn, k, key[k], true);
				}
			}else if( value !== undefined ){
				chainable = true;
				for ( ; i < length; i++ ) {
					fn( elems[i], key, value );
				}
			}
			return chainable ?
				elems :
				length ? fn( elems[0], key ) : null;
		},
		/**
		 * @method strFormat 第一个参数转换为字符串，返回每二个参数标识的长度，不足时以0补齐
		 * @param  {String|Number} str 要格式化的字符串
		 * @param  {Number} length default:2 返回字符串长
		 * @return {String}
		 */
		strFormat: function(str, length){
			for(var result = "",i = 1, maxLength = length || 2; i <= maxLength; i++)
				result += "0";
			result += str || '';
			return result.substr( result.length - maxLength );
		},
		/**
		 * @method getTime 获取时间戳生成成的数字或数字字符串
		 * @param  {Number} type default:0类型[0:default;1:+随机数;2:连接随机数符串]
		 * @return {Number|String} 返回数字或字符串
		 */
		getTime: function(type){
			var time = new Date().getTime(),
				random = Math.random()*1000
			;
			random = this.strFormat( Math.floor(random), 3);
			switch(type){
				case 2: return time.toString() + random;
				case 1: return time + random;
				default: return time;
			}
		},
		/**
		 * @method secondsToMinutes 数字转换为时间格式
		 * @param  seconds {Number} 要转换的数据
		 * @return {String} 返回格式化的字符串 123=>02:03
		 */
		secondsToMinutes: function(seconds){
			var a = '', b = seconds, f = this.strFormat;
			if( b >= 60 ){
				a += f( Math.floor(b/60) );
				b = b%60;
			}else{
				a += '00';
			}
			return a + ':' + f(b);
		},
		/**
		 * @method formatDate 格式化时间
		 * @param  {Number|String|Null}  time 时间戳
		 * @param  {String|Null}  format 格式字符串
		 * @return {String} 返回格式化后的时间日期字符串
		 * formatDate('yyyy-MM-dd HH:mm:ss.S') ==> 2015-04-03 02:30:17.982
		 * formatDate('yyyy-M-d H:m:s.S')      ==> 2015-4-3 2:30:55.413
		 */
		formatDate: function(time, format){
			var cDate, regs;

			if( this.isNumeric(time) ){
				cDate = new Date( time );
			}else if( typeof time == "string" ){
				cDate = new Date();
				format = time;
			}else{
				cDate = new Date();
			}
			format = format || 'HH:mm:ss';
			regs = {
				"M+" : cDate.getMonth()+1, //月份
				"d+" : cDate.getDate(), //日
				"h+" : cDate.getHours()%12 === 0 ? 12 : cDate.getHours()%12, //小时
				"H+" : cDate.getHours(), //小时
				"m+" : cDate.getMinutes(), //分
				"s+" : cDate.getSeconds(), //秒
				"q+" : Math.floor((cDate.getMonth()+3)/3), //季度
				"S+" : cDate.getMilliseconds() //毫秒
			};
			if (/(y+)/i.test(format)){
				format = format.replace(RegExp.$1, (cDate.getFullYear() + "").substr(4 - RegExp.$1.length));
			}
			for (var k in regs) {
				if ( regs.hasOwnProperty(k) && new RegExp("(" + k + ")").test( format ) ) {
					if( RegExp.$1 == "S" ){
						format = format.replace(RegExp.$1, ("00" + regs[k]).substr(3));
					}else{
						format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (regs[k]) : (("00" + regs[k]).substr(("" + regs[k]).length)));
			}
			}
			}
			return format;
		},
		/**
		 * @method randomChar 生成十六进制随机字符串
		 * @param  {Number} len 字符串长度
		 * @param  {Number} radix [16|10]  随机串类型，默认十六进制
		 * @return {String}   返回生成的随机字符串
		 * 2015.11.06 随机串生成算法
		 */
		randomChar: function(len, radix){
			var tmp = "", l = len || 8, strR = radix==10 ? "0123456789" : "0123456789ABCDEF";
			for(var i=0;i<l;i++)  {
				tmp += strR.charAt(Math.round(Math.random()*(strR.length-1)));
			}
			return tmp;
		}
	});
	/**
	 * @method selector DOM选择器
	 */
	nTalk.selector = {/*--selector--*/
		tagGuid: 1,
		attrMap: {
			"class": "className",
			"for": "htmlFor"
		},
		rex: {
			R_RULE: /[ +>~]/g,
			NR_RULE: /[^ +>~]+/g,
			TRIM_LR: /^ +| +$/g,
			TRIM_ALL: / *([ +>~,]) */g,
			PSEU_PARAM: /\([^()]+\)/g,
			ATTR_PARAM: /[^\[]+(?=])/g,
			ATTR: /=|!=|\^=|\$=|\*=|~=|\|=/,
			CLS: /\./g,
			PSEU: /[^:]+/g,
			NUM: /\d+/,
			NTH: /(-?\d*)n([+-]?\d*)/,
			//2014.11.12 修复选择器选择h1-h6标记不能获取Element的BUG
			RULES: /((?:#.+)*)([a-zA-Z1-6*]*)([^\[:]*)((?:\[.+])*)((?::.+)*)/
		},
		query: function(selector, context) {
			if( typeof selector =="undefined" || !selector ) return [];
			var results = [],
				selectors, contexts, rules,
				i, j, n, m;
			switch (typeof context) {
				case "undefined":
					contexts = [document];
					break;
				case "string":
					selector = context + " " + selector;
					contexts = [document];
					break;
				case "object":
					if (context.nodeType) {
						contexts = [context];
					} else {
						contexts = context;
					}
			}
			selectors = this.format(selector);
			context = contexts;
			for (i = 0, j = selectors.length; i < j; i++) {
				selector = selectors[i];
				rules = (" " + selector).match(this.rex.R_RULE);
				selector = selector.match(this.rex.NR_RULE);
				contexts = context;
				for (n = 0, m = rules.length; n < m; n++) {
					contexts = this.parse(selector[n], contexts, rules[n]);
				}
				results = results.concat(contexts);
			}
			if(j > 1) {
				return this.makeDiff(results);
			}
			return results;
		},
		format: function(selector){
			var pseuParams = [],
				attrParams = [];
			this.pseuParams = pseuParams;
			this.attrParams = attrParams;
			selector = selector.replace(this.rex.TRIM_LR, "").replace(this.rex.TRIM_ALL, "$1").replace(this.rex.ATTR_PARAM, function(match){
				return attrParams.push(match) - 1;
			});
            var tmpFunc = function(match){
				return pseuParams.push( match.substring(1, match.length - 1) ) - 1;
			};
			while(selector.indexOf("(") !== -1) {
				selector = selector.replace(this.rex.PSEU_PARAM, tmpFunc);
			}
			return selector.split(",");
		},
		parse: function(selector, contexts, rule){
			var matched, rules, id, cls, attrs, pseudos;
			rules = this.rex.RULES.exec(selector);
			if ( (id = rules[1]) ) {
				if ( (id = document.getElementById(id.substring(1))) ) {
					return [id];
				}
				return [];
			}
			matched = nTalk.selector.queryRelative[rule](contexts, rules[2] || "*", this);
			if( (cls = rules[3]) ) {
				matched = this.filterClass(matched, cls.replace(this.rex.CLS, ""));
			}
			if( (attrs = rules[4]) ) {
				matched = this.filterAttr(matched, this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams));
			}
			if( (pseudos = rules[5]) ) {
				matched = this.filterPseudo(matched, this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseuParams));
			}
			return matched;
		},
		getRules : function(selector) {
			var rules, attrs, pseudos;
			rules = this.rex.RULES.exec(selector);
			if(!rules[2]) {
				rules[2] = "*";
			}
			rules[3] = rules[3].replace(this.rex.CLS, "");
			if ( (attrs = rules[4]) ) {
				rules[4] = this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams);
			}
			if ( (pseudos = rules[5]) ) {
				rules[5] = this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseuParams);
			}
			return rules;
		},
		getAttrRules: function(attrs, attrParams) {
			var arr = [],
				len = attrs.length,
				rex = this.rex.ATTR,
				i   = 0,
				attr, rule;
			for(; i < len; i++) {
				attr = attrParams[attrs[i]];
				rule = attr.match(rex) || " ";
				attr = attr.split(rex);
				arr.push(nTalk.selector.queryAttrs[rule]);
				arr.push(attr);
			}
			return arr;
		},
		getPseudoRules: function(pseudos, pseuParams) {
			var arr  = [],
				i    = 0,
				len  = pseudos.length,
				guid = this.tagGuid++,
				name, param, rules;
			for(; i < len; i++) {
				name = pseudos[i];
				if(this.rex.NUM.test(name)) {
					param = pseuParams[RegExp["$&"]];
					name  = RegExp["$`"];
					switch(name) {
						case "nth-child":
							if (this.rex.NTH.test(param === "odd" && "2n+1" || param === "even" && "2n"  || param)) {
								param = RegExp.$1;
								param = param === "" ? 1 :
										param === "-" ? -1 :
										param;
								param = [guid, true, param, RegExp.$2];
								if (param[2] === 1 && param[3] === 0) {
									continue;
								}
							} else {
								param = [guid, false, param];
							}
							break;
						case "not":
							rules = param.split(",");
							param = [];
							while(rules.length) {
								param.push(this.getRules(rules.pop()));
							}
							break;
						//2014.11.12 添加包含内容的选择器
						case "contains":
					}
				}
				arr.push(nTalk.selector.queryPseudos[name]);
				arr.push(param);
			}
			return arr;
		},
		filterPseudo: function(els, pseudoRules){
			var len = els.length,
				i   = 0,
				m   = pseudoRules.length,
				matched = [],
				n, el, pseudo, param;
			for(; i < len; i++) {
				el = els[i];
				for (n = 0; n < m; n += 2) {
					pseudo = pseudoRules[n];
					param  = pseudoRules[n + 1];
					if (!pseudo || !pseudo(el, param, this)) {
						break;
					}
				}
				if(n === m) {
					matched.push(el);
				}
			}
			return matched;
		},
		filterAttr: function(els, attrRules){
			var len = els.length,
				i = 0,
				m = attrRules.length,
				matched = [],
				n, el, attr, rule, val, name;
			for(; i < len; i++) {
				el = els[i];
				for (n = 0; n < m; n += 2) {
					rule = attrRules[n];
					attr = attrRules[n + 1];
					name = attr[0];
					if (!(val = (name === "href" ? el.getAttribute(name/*, 2*/) : el.getAttribute(name)))) {
						if (!(val = el[this.attrMap[name] || name])) {
							break;
						}
					}
					if (!rule(val + "", attr[1])) {
						break;
					}
				}
				if(n === m) {
					matched.push(el);
				}
			}
			return matched;
		},
		filterClass: function(els, cls){
			var i = 0,
				len = els.length,
				matched = [],
				clsName, rex, el;
			for(; i < len; i++) {
				el = els[i];
				//-svg节点的className属性是对像
				if( typeof(el.className) == "string" ) {
					clsName = el.className;
					rex = new RegExp(clsName.replace(" ", "|"), "g");
					if(!cls.replace(rex, "")) {
						matched.push(el);
					}
				}
			}
			return matched;
		},
		filterEl: function(el, tag, cls, attrRules, pseudoRules) {
			if (tag !== "*" && el.nodeName.toLowerCase() !== tag) {
				return false;
			}
			if (cls && !this.filterClass([el], cls).length) {
				return false;
			}
			if (attrRules && !this.filterAttr([el], attrRules).length) {
				return false;
			}
			return !(pseudoRules && !this.filterPseudo([el], pseudoRules).length);
		},
		makeDiff : function(arr){
			var gUid  = this.tagGuid++,
				len   = arr.length,
				diff  = [],
				i     = 0,
				el, data;
			for (; i < len; i++) {
				el = arr[i];
				data = this.getElData(el);
				if (data.tagGuid !== gUid) {
					diff.push(el);
					data.tagGuid = gUid;
				}
			}
			return diff;
		},
		getElData: function(el) {
			var data = el.mojoExpando;
			if(!data) {
				data = el.mojoExpando = {
					mQuery: {
						tagGuid: 0
					}
				};
			}
			if(!(data = data.mQuery)) {
				data = {
					tagGuid: 0
				};
			}
			return data;
		},
		queryRelative: {
			" " : function(contexts, tag, joQuery) {
				var
					guid  = joQuery.tagGuid++,
					len   = contexts.length,
					arr   = [],
					i     = 0,
					n, m, nodes, el, pel;
				for(; i < len; i++) {
					el  = contexts[i];
					if( (pel = el.parentNode) ) {
						if(joQuery.getElData(pel).tagGuid === guid) {
							continue;
						}
						joQuery.getElData(el).tagGuid = guid;
					}
					nodes = el.getElementsByTagName(tag) || null;
					for(n = 0, m = nodes.length; n < m; n++) {
						arr.push(nodes[n]);
					}
				}
				return arr;
			},
			">" : function(contexts, tag) {
				var
					arr = [],
					len = contexts.length,
					i   = 0, el;
				for(; i < len; i++) {
					el = contexts[i].firstChild;
					while(el) {
						if(el.nodeType === 1) {
							if(el.nodeName.toLowerCase() === tag || tag === "*") {
								arr.push(el);
							}
						}
						el = el.nextSibling;
					}
				}
				return arr;
			},
			"+" : function(contexts, tag) {
				var
					arr = [],
					len = contexts.length,
					i   = 0, el;
				for (; i < len; i++) {
					el = contexts[i];
					while( (el = el.nextSibling) ) {
						if(el.nodeType === 1) {
							if(el.nodeName.toLowerCase() === tag || tag === "*") {
								arr.push(el);
							}
							break;
						}
					}
				}
				return arr;
			},
			"~" : function(contexts, tag, joQuery) {
				var guid  = joQuery.tagGuid++,
					len   = contexts.length,
					arr   = [],
					i     = 0,
					el, pel, data;
				for (; i < len; i++) {
					el = contexts[i];
					if ( (pel = el.parentNode) ) {
						if((data = joQuery.getElData(pel)).tagGuid === guid) {
							continue;
						}
						data.tagGuid = guid;
					}
					while( (el = el.nextSibling) ) {
						if (el.nodeType === 1) {
							if(el.nodeName.toLowerCase() === tag || tag === "*") {
								arr.push(el);
							}
						}
					}
				}
				return arr;
			}
		},
		queryAttrs: {
			" " : function() {
				return true;
			},
			"=" : function(attrVal, inputVal) {
				return attrVal === inputVal;
			},
			"!=" : function(attrVal, inputVal) {
				return attrVal !== inputVal;
			},
			"^=" : function(attrVal, inputVal) {
				return attrVal.indexOf(inputVal) === 0;
			},
			"$=" : function(attrVal, inputVal) {
				return attrVal.substring(attrVal.length - inputVal.length) === inputVal;
			},
			"*=" : function(attrVal, inputVal) {
				return attrVal.indexOf(inputVal) !== -1;
			},
			"~=" : function(attrVal, inputVal) {
				return (" " + attrVal + " ").indexOf(" " + inputVal + " ") !== -1;
			},
			"|=" : function(attrVal, inputVal) {
				return attrVal === inputVal || attrVal.substring(0, inputVal.length + 1) === inputVal + "-";
			}
		},
		queryPseudos: {
			"eq": function(el,param,joQuery) {
				var
					pel, index, node, i, data;
				if ((pel = el.parentNode) && (data = joQuery.getElData(pel)).tagGuid !== param) {
					node = pel.firstChild;
					i = 1;
					while (node) {
						if (node.nodeType === 1) {
							joQuery.getElData(node).nodeIndex = i++;
						}
						node = node.nextSibling;
					}
					data.tagGuid = param;
				}
				index = joQuery.getElData(el).nodeIndex;

				return index == param;
			},
			"lt": function(el,param,joQuery) {
				var
					pel, index, node, i, data;
				if ((pel = el.parentNode) && (data = joQuery.getElData(pel)).tagGuid !== param) {
					node = pel.firstChild;
					i = 1;
					while (node) {
						if (node.nodeType === 1) {
							joQuery.getElData(node).nodeIndex = i++;
						}
						node = node.nextSibling;
					}
					data.tagGuid = param;
				}
				index = joQuery.getElData(el).nodeIndex;

				return index < param;
			},
			"gt": function(el,param,joQuery) {
				var
					pel, index, node, i, data;
				if ((pel = el.parentNode) && (data = joQuery.getElData(pel)).tagGuid !== param) {
					node = pel.firstChild;
					i = 1;
					while (node) {
						if (node.nodeType === 1) {
							joQuery.getElData(node).nodeIndex = i++;
						}
						node = node.nextSibling;
					}
					data.tagGuid = param;
				}
				index = joQuery.getElData(el).nodeIndex;

				return index > param;
			},
			"first-child": function(el) {
				while ( (el = el.previousSibling) ) {
					if (el.nodeType === 1) {
						return false;
					}
				}
				return true;
			},
			"last-child": function(el) {
				while ( (el = el.nextSibling) ) {
					if (el.nodeType === 1) {
						return false;
					}
				}
				return true;
			},
			"only-child": function(el) {
				var
					next = el.nextSibling,
					pre  = el.previousSibling;
				while(next) {
					if(next.nodeType === 1) {
						return false;
					}
					next = next.nextSibling;
				}
				while(pre) {
					if(pre.nodeType === 1) {
						return false;
					}
					pre = pre.previousSibling;
				}
				return true;
			},
			"nth-child": function(el, param, joQuery) {
				var
					pel, index, node, i, data;
				if ((pel = el.parentNode) && (data = joQuery.getElData(pel)).tagGuid !== param[0]) {
					node = pel.firstChild;
					i = 1;
					while (node) {
						if (node.nodeType === 1) {
							joQuery.getElData(node).nodeIndex = i++;
						}
						node = node.nextSibling;
					}
					data.tagGuid = param[0];
				}
				index = joQuery.getElData(el).nodeIndex;
				if (param[1]) {
					index = index - param[3];
					param = param[2];
					return index * param >= 0 && index % param === 0;
				}
				return index === param[2];
			},
			not: function(el, params, joQuery) {
				var
					i   = 0,
					len = params.length,
					param;
				for(; i < len; i++) {
					param = params[i];
					if(param[1]) {
						if("#" + el.id !== param[1]) {
							continue;
						}
						return false;
					}
					if(joQuery.filterEl(el, param[2], param[3], param[4], param[5])) {
						return false;
					}
				}
				return true;
			},
			contains: function(el, text){
				return ( el.textContent || el.innerText || '' ).indexOf( text ) > -1;
			},
			enabled: function(el) {
				return el.disabled === false;
			},
			disabled: function(el) {
				return el.disabled === true;
			},
			checked: function(el) {
				return el.checked === true;
			},
			empty: function(el){
				return !el.firstChild;
			}
		}
	};
	/**
	 * @class Class 创建空的类对像
	 */
	nTalk.Class = {
		create: function(){
			return function(){
				this.initialize.apply(this, arguments);
			};
		}
	};

	nTalk.extend({/*-initialize page info-*/
		/**
		 * @method initializeCore 初始化页面基本信息
		 *         获取当前页面信息: 域名、网址、参数集合、脚本加载地址
		 * @private
		 */
		initializeCore: function(){
			var domain = /([^\.]+(\.com(\.cn)?|\.net(\.cn)?|\.edu(\.cn)?|\.org(\.cn)?|\.gov(\.cn)?|\.cn|\.mobi|\.tel|\.asia|\.me|\.info|\.hk|\.cc|\.biz|\.tv))$/i.exec(document.domain),
				//2014.12.08 修复URL参数中含网站地址且未编码时，获取地址与文件名出错
				match = /(.*\/)(.*?\.\w+)?([\?#].*)?$/ig.exec(location.protocol + '//' + document.domain + location.pathname),
				strParams = ''
			;
			root = nTalk(document);

			nTalk("script[src*=ntkf],script[src*=base.out]").each(function(i, element){
				if( !element.src ) return;

				var match = /^((https?:).*\/)?(.*?\.js)?(\?.*)?/ig.exec(element.src);
				//2015.08.19 恢复判断ntkfstat.js后含siteid参数。兼容网站嵌入多次老式脚本
				if( match && match[1] && match[3] && /^((ntkfstat|ntkf|base\.out).*?)\.js/gi.test(match[3]) && match[4] && match[4].indexOf('siteid') > -1 ){
					nTalk.baseProtocol= match[2] || nTalk.protocol;
					nTalk.baseURI   = match[1] || nTalk.pageURI;
					nTalk.baseName  = match[3];
					strParams       = match[4] ? match[4] : '';
					nTalk.elementParent = element.parentNode;
					nTalk.elementBefore = element;
				}
			});
			if( !nTalk.baseURI ){
				throw 'get script url failure';
			}

			//页面信息
			nTalk.domain    = domain&&domain[0] || document.domain;
			nTalk.pageURI   = match && match[1] ? match[1] : '';
			nTalk.pageName  = match && match[2] ? match[2] : '';
			nTalk.params    = nTalk.uriToJSON( location.search.substr(1) );
			//2014.08.06
			//部分网站通过hash传递参数，而其中有的参数值为一个带参数的url,直接通过location.hash获取值会出现参数值中的参数也被解析
			nTalk.hash      = location.hash ? location.href.substr(location.href.indexOf("#") + 1) : '';
			nTalk.hashParams= nTalk.uriToJSON( nTalk.hash );
			nTalk.loadList  = loadList;

			//-连接类型
			if( nTalk.flash.support && !nTalk.browser.mobile ){
				nTalk.global.connect = nTalk.CON_CONNECT_FLASH;
			}else{
				nTalk.global.connect = nTalk.CON_CONNECT_COMET;
			}

			if( nTalk.browser.msie6 ){
				try {
					document.execCommand("BackgroundImageCache", false, true);
				} catch(e) {
				}
			}

			var arrs = strParams.length ? strParams.substr(1).split('&') : ['lan=zh_cn', ''];
			for(var tmp, i = 0; i < arrs.length; i++ ){
				tmp = arrs[i].split('=');
				nTalk.extParmas[ tmp[0] ] = tmp[0] == 'lan' ? (tmp[1] || 'zh_cn') : tmp[1];
			}
			nTalk.cache.init();
		}
	});

	/**
	 * @class  browser 获取浏览器信息
	 * @static
	 */
	nTalk.browser = (function(ua){/*-browser function-*/
		var browser = {"360ee":!1,lbbrowser:!1,se:!1,chrome:!1,safari:!1,msie:!1,firefox:!1,oupeng:!1,opera:!1,webkit:!1,iPod:!1,iPad:!1,iPhone:!1,android:!1,gecko:!1,windows:!1,"windows ce":!1,edge:!1,uc:!1},
			core = ['applewebkit\/([^\\s]*)', 'presto\\/([\\d.]*)', 'trident([^;]*)', 'gecko\\/([\\d.]*)','msie ([\\d.]*)'];

		var ISOldIOS     = /OS (\d)_.* like Mac OS X/g.exec(window.navigator.userAgent);

		nTalk.each(browser, function(name){
			browser[name] = ua.indexOf(name.toLowerCase()) > -1;
		});
		browser.ua = ua;
		browser.ieversion = 0;
		browser.coreversion = 0;
		browser.mac = !!ua.match(/cpu.+mac\s+os\s+x/g);
		for(var j = 0; j < core.length; j++){
			if( new RegExp(core[j], 'i').test(ua) ){
				if( j == core.length-1 ){
                    /*jslint sub: true */
					browser.ieversion = RegExp['\x241'] || RegExp['\x242'];
				}else{
                    /*jslint sub: true */
					browser.coreversion = RegExp['\x241'];
				}
			}
		}

		browser.ieversion = document.documentMode || browser.ieversion || browser.ieversion;
		browser.msie = browser.msie || browser.ieversion > 0;
		browser.gecko = browser.gecko && !browser.webkit && !browser.msie;
		browser.msie6   = browser.msie && browser.ieversion==6;
		browser.msie7   = browser.msie && browser.ieversion==7;
		browser.msie8   = browser.msie && browser.ieversion==8;
		browser.msie9   = browser.msie && browser.ieversion==9;
		browser.msie10   = browser.msie && browser.ieversion==10;
		browser.msie11   = browser.msie && browser.ieversion==11;
		browser.edge    = browser.edge;
		browser.uc      = browser.uc;
		browser.oldmsie = browser.ieversion && browser.ieversion <= 9;
		browser.safari  = browser.safari && !browser.chrome;
		browser.safari2 = browser.safari && !/adobeair/i.test(ua);
		browser.Quirks = document.compatMode === 'BackCompat';
		browser.mobile = /mobile|android|linux/i.test(ua);
		browser.android = /android (\d.*?);/g.exec(ua);
		browser.oldAndroid = browser.android && (browser.android.pop().substr(0, 3) < 4.5);
		browser.oldIOS  = ISOldIOS ? +ISOldIOS.pop() < 8 : false;
		browser.iPhone6 = browser.iPhone && (document.body.offsetWidth == 375);
		browser.iPhone6Plus = browser.iPhone && (document.body.offsetWidth == 414);
		browser.iOS = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || ua.indexOf('mac')>-1;
		browser.is = function(keyword){
			return new RegExp(keyword, 'ig').test(ua);
		};
		browser.html5 = !!window.applicationCache;

        browser.supportMqtt = "WebSocket" in window && window.WebSocket !== null && "localStorage" in window && window.localStorage !== null && "ArrayBuffer" in window && window.ArrayBuffer !== null;

		return browser;
	})(navigator.userAgent.toLowerCase());

	/**
	 * @method ready 页面ready后执行fn
	 * @param  {Function} fn 页面ready后执行的函数
	 */
	nTalk.extend({/*-ready load-*/
		ready: function(fn){ /*ready*/
			var self = this,
				readyState = document.readyState,
				oldWebkit = nTalk.browser.webkit && nTalk.browser.version < 525,
				completed = function() {
					if(readyComplete) return;
					if( !oldWebkit && window.removeEventListener ){
						document.removeEventListener('DOMContentLoaded', completed, false);
						window.removeEventListener('load', completed, false);
					}
					nTalk.isReady = readyComplete = true;

					for (var i = 0; i < readyList.length; i++){
						readyList[i].apply(document);
					}
					readyList = [];
				}
				;

			if( readyComplete || /loaded|complete/gi.test(readyState) ){
				nTalk.isReady = readyComplete = true;
				fn.call(self);
			}else{
				readyList[readyList.length] = function(){
					return fn.call(self);
				};
			}

			if( oldWebkit ){
				(function(){
					/^loaded|complete$/i.test(readyState) ?
						completed() :/*jshint -W030 */
						setTimeout(arguments.callee(), 50);
				})();
			} else if( document.addEventListener ){
				if( readyState == 'interactive' ){
					completed();
				}else{
					document.addEventListener( "DOMContentLoaded", completed, false );
					window.addEventListener("load", completed, false);
				}
			}else {
				// Hack IE DOM for ready event
				var temp = document.createElement('div');
				(function(){
					(function(){
						try{
							temp.doScroll('left');
							document.body.insertBefore(temp, document.body.lastChild).setAttribute("html", "temp");
						}catch(e){
						}
						return temp;
					}) ?
					completed() :/*jshint -W030 */
					setTimeout(arguments.callee(), 50);
				})();
			}
		},
		/**
		 * @method require 加载外部模块或文件,模块文件中需要包含与文件同名(不包括扩展名)的对像定义
		 * #rnd:   强制重新加载
		 * #image: 标注动态程序输出的图片文件
		 * @param  {URL|Array|JSON} content 要加载的文件地址
		 *		URL:  加载单文件;
		 *		Array:加载多文件; 加载文件支持脚本、css、图片
		 *		JSON: 加载验证模块;
		 * @param {Function}  callback 文件加载完成后执行此函数，
		 *		回调函数参数：
		 *		加载文件时，成功返回HtmlDOM，失败返回event对像，对像error属性为true时加载失败
		 *		加载模块时，返回模块对像，失败返回false
		 * @param {Object} bind
		 * @return {void}
		 */
		require: function(content, callback, bind){
			var queue = [], result = [],
				attrs, item = null, l, url;

			if( !content ){
				return;
			}
			content  = typeof content === 'string' ? [content] : content;
			callback = callback || emptyFunc;
			bind = bind || document.head || nTalk('head')[0] || document.documentElement;

			l = nTalk._getObjectNumber(content);
			if( queue.length === 0 && l === 0 ){
				callback.apply(item, result);
			}
			nTalk.each(content, function(name, src){
				if( !src ) return;
				var isImage, time = nTalk.getTime(),
					lchar = src.indexOf('?') == -1 ? '?' : '&',
					//2014.12.09 URL中含/时异常，2015.01.23获取文件名作唯一key
					fix = src.replace(/(.*\/)?(.*?)[\?$](.*)?/i, "$2"),
					modeName = !nTalk.isNumeric(name) ? name : '',
					scriptComplete = function(){
						//dequeue
						queue.splice( nTalk.inArray(src, queue), 1 );
						l--;
						if( queue.length === 0 && l === 0 ){
							//nTalk.Log('scriptComplete: queue.length:' + queue.length + ' - l:' + l, 2);
							callback.apply(item, result);
						}
					},
					onScriptLoad = function(event){
						event = nTalk.Event.fixEvent(event);
						var node = event.currentTarget || event.srcElement;
						var reg = /loaded|complete/gi;
						var readyState = node.readyState;

						//nTalk.Log('scriptLoad:[' + readyState + '] - ' + node.src, 2);
						if ( event.type === 'load' || (reg.test( readyState )) ){
							//文件加载完成
							setTimeout(function(){
								if( modeName ){
									loadList[fix] = nTalk[modeName];
									result.push( nTalk[modeName] );
								}else{
									loadList[fix] = node;
									result.push( node );
								}
								scriptComplete();
							}, nTalk.browser.msie6 ? 5E2 : 0);
						}else if( event.type === 'error' ){
							event.error = true;
							result.push( modeName ? false : event );
							scriptComplete();
						}
					}
				;

				queue.push(src);
				fix += src.indexOf('#rnd') > -1 ? String(time).substring(5, 11) : src.indexOf('#image') > -1 ? src.replace(/(.*?)\?(.*?)(#.*?)?$/gi, "-$2") : '';
				isImage = /\.((gif)|(png)|(jpg)|(bmp)|(jpeg))$/i.test(src) || /#image$/ig.test(src);
				isRobotImage = /#robotImg/ig.test(src);
				//#rnd时，每次强制加载，含#image的动态图片需要添加参数强制加载
				src = src.replace(/#rnd/i, lchar + 'ts=' + time).replace(/#image/i, '');
				url = (!/^(https?:\/\/)/i.test( src ) ? nTalk.baseURI : '') + src;

				if( modeName && nTalk[modeName] ){
					//模块已加载
					result.push( nTalk[modeName] );
					scriptComplete();
				}else if( !modeName && loadList[fix] ){
					//文件已加载
					result.push( loadList[fix] );
					scriptComplete();
				}else if( isImage ){
					//图片未加载
					item = nTalk.preloadImage(
							url,
							function(elem){
								elem.error = false;
								loadList[fix] = elem;
								result.push( elem );
								scriptComplete();
							}, function(event){
								event.error = true;
								result.push( event );
								scriptComplete();
							}, isRobotImage? 120 : 6);
				}else{
					//文件、模块未加载
					attrs = /\.css[^\.]*$/gi.test(src) ?
						{tag: 'link', type: 'text/css',rel:'stylesheet',href: url} :
						{tag: 'script',type: 'text/javascript',async:'async',charset:'utf-8',src: url}
					;
					if( attrs.tag == 'script' && modeName ){
						attrs['data-requiremodule'] = modeName;
					}
					//nTalk.Log('createScriptNode:' + url, 2);
					item = nTalk(attrs).appendTo( bind );
					if( typeof item.get(0).onreadystatechange == 'undefined' ){
						item.bind('load', onScriptLoad).bind('error', onScriptLoad);
					}else{
						item.bind('readystatechange', onScriptLoad).bind('error', onScriptLoad);
					}
				}
			});
		},
		/**
		 * @method jsonp jsonp调用URL
		 * @param  url      {String}   url 地址
		 * @param  callback {Function} 调用完成后回调函数
		 */
		jsonp: function(url, callback){
			var args, callName = 'call_' + nTalk.randomChar(16);
			url = url + (/\?/ig.test( url ) ? "&" : "?") + 'callback=' + callName;

			window[callName] = function(){
				args = arguments;
				setTimeout(function(){
					if( nTalk.isFunction(callback) ){
						callback.apply(self, args);
					}
				}, 0);
				try{
					delete window[callName];
				}catch(e){
				}
			};
			nTalk.require(url, function(script){
				nTalk(script.error ? script.target : this).remove();
			});
		},
		/**
		 * @method preloadImage 图片预加载
		 * @param  src   {String} 图片地址
		 * @param  load  {[type]} 图片加载完成执行此函数
		 * @param  error {[type]} 图片加载异常执行此函数
		 * @return {Image} 返回图片对像
		 */
		preloadImage: function(src, load, error, count){
			var self = this;
			load  = load || emptyFunc;
			error = error || emptyFunc;

			var timeID, img = new Image();
			img.src = src;
			//debug 2015.09.16 修复图片一直加载不到出现的死循环情况
			img.setAttribute('loadTime', 0);
			if( img.complete ){
				load.call(nTalk, img);
				return img;
			}
			img.onload = function(){
				clearInterval(timeID);
				load.call(nTalk, this);
			};
			img.onError = function(){
				clearInterval(timeID);
				error.call(nTalk, this);
			};
			timeID = setInterval(function(){
				//加载次数加1
				img.setAttribute('loadTime', parseInt(img.getAttribute('loadTime')) + 1);
				//当加载次数大于3次时，清除定时器，抛出错误
                                //2015.10.09 修改为6次，防止大图加载未完成，就进行了回调
				if( parseInt(img.getAttribute('loadTime'), 10) >= count){
					clearInterval(timeID);
					error.call(nTalk, self);
				}
				if( img.readyState != "complete" && !nTalk.browser.msie7 ) return;
				clearInterval(timeID);
				img.onLoad = img.onError = null;
				load.call(nTalk, img);
			}, 500);
			return img;
		},
		/**
		 * @method _getObjectNumber 获取对像属性数量
		 * @param  {Object|Array} obj 目标对像
		 * @return {Number|Boolean} 返回对像属性数
		 */
		_getObjectNumber: function(obj){
			if( !obj ){
				return false;
			}else if( nTalk.isArray(obj) ){
				return obj.length;
			}else{
				var length = 0;
				for(var k in obj){
					if( obj.hasOwnProperty(k) ) length++;
				}
				return length;
			}
		}
	});

	/**
	 * @class cookie cookie操作
	 * @static
	 */
	nTalk.cookie = {
		enable: function(){
			var result = false, testCookie= "testcookie";
			if ( navigator.cookieEnabled ){
				return true;
			}
			this.set(testCookie, 'yes', 0);
			if (this.get(testCookie) == 'yes') result = true;
			this.del(testCookie);
			return result;
		},
		set: function(key, value, time, domain) {
			var cDate, exp, _cookie, path;
			value = value || '';
			domain = domain ? domain : ('' || nTalk.domain);
			if (typeof time != "number" ) {
				time = 0;
			}
			if ( time === 0 ){
				exp = nTalk.browser.msie||nTalk.browser.mobile ? " " : "expires=0; ";
			}else {
				cDate = new Date();
				cDate.setTime(cDate.getTime() + time);
				exp = cDate ? "expires=" + cDate.toGMTString() + "; ": "";
			}
			domain = "domain=" + domain + "; ";
			_cookie = key + "=" + (''+value).replace(/\"|\'/gi, "|") + "; ";
			path = "path=/; ";
			document.cookie = _cookie + exp + domain + path;
			return value;
		},
		get: function(key) {
			var reg, _cookie = document.cookie;
			if (_cookie.length) {
				reg = new RegExp("(?:^|;)\\s*" + key + "=(.*?)(?:;|$)").exec( _cookie );
				if (reg && reg.length) {
					return decodeURIComponent(reg[1].replace(/\|/gi, '\"'));
				}
			}
			return null;
		},
		del: function(key, domain) {
			return this.set(key, "", 1, domain);
		}
	};

	/**
	 * @class flash Flash版本验证
	 * @static
	 */
	nTalk.flash = (function(){/*flash */
		var
			axo, counter,hasFlash = false, version = [0,0,0,0],
			fnRemove = function(selector){
				nTalk(selector).each(function(i, element){
					var tElement;
					if( nTalk.browser.msie || !element.parentNode ){
						for(var k in element)
							try{
                                /*jslint evil: true */
								eval("element." + k + "=null");
							}catch(e){
							}
						tElement = document.createElement('DIV');
						try{
						    tElement.appendChild(element);
						    tElement.innerHTML = '';
							if(tElement.parentNode) tElement.parentNode.removeChild(tElement);
						}catch(e){
						}
					}else
						try{
							element.parentNode.removeChild(element);
						}catch(e){
							nTalk.Log('remove flash node failure', 3);
						}
				});
			}
			;
		if (navigator.plugins && navigator.mimeTypes.length) {
			var x = navigator.plugins["Shockwave Flash"];
			if (x && x.version  ){
				hasFlash = true;
				version = x.version.split(".");
			}else if (x && x.description) {
				hasFlash = true;
				version = x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
				if(version.length == 3) version[version.length] = 0;
			}
		} else if ( nTalk.browser["windows ce"] ) {
			axo = 1;
			counter = 3;
			while (axo) {
				try {
					counter++;
					axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + counter);
					hasFlash = true;
					version = [counter, 0, 0];
				} catch (e) {
					axo = null;
				}
			}
		} else {
			try {
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				if (axo !== null) {
					hasFlash = true;
					version = axo.GetVariable("$version").split(" ")[1].toString().replace(/,/g, '.').split(".");
				}
			} catch (e) {
				hasFlash = false;
			}
		}
		return {
			remove: fnRemove,
			GT: gt,
			support: (version.join('.').indexOf('11.6.602') === 0 || version.join('.').indexOf('11.3.300')===0 || !gt('10.3'))&&nTalk.browser.firefox || nTalk.browser.mac ? false : hasFlash,
			version: version.join('.')
		};
		function gt(ver){
			var cv = version, v = (ver || "0.0.0").split('.').slice(0, 3);
			return cv[0] > v[0] || cv[0] == v[0] && cv[1] > v[1] || cv[0] == v[0] && cv[1] == v[1] && cv[2] > v[2];
		}
	})();

	/**
	 * @class Event DOM事件操作
	 * @static
	 */
	nTalk.Event = function(){/*Event */
		var addEvent, removeEvent, evtHash = [];
		if( window.addEventListener ) {
			addEvent = function( elem, type, handler, useCapture){
				if( type=='mouseenter' )
					elem.addEventListener('mouseover', mouseEnter(handler), useCapture);
				else if( type=='mouseleave' )
					elem.addEventListener('mouseout', mouseEnter(handler), useCapture);
				else
					elem.addEventListener(type, handler, useCapture);
			};
			removeEvent = function( elem, type, handler, useCapture){
				elem.removeEventListener(type, handler, useCapture);
			};
		} else {
			addEvent = function( elem, type, handler ){
				var key = '{FNKEY::obj_' + ieGetUniqueID(elem) + '::evt_' + type + '::fn_' + handler + '}',
					f = evtHash[key];
				if(typeof f != 'undefined') return;
				f = function(_evt){
					handler.call(elem, _evt);
				};
				evtHash[key] = f;
				elem.attachEvent( "on"+type, f);
				window.attachEvent('onunload', function() {
					try{
						elem.detachEvent('on' + type, f);
					}catch(e){
					}
				});
				key = null;
			};
			removeEvent = function( elem, type, handler ){
				var key = '{FNKEY::obj_' + ieGetUniqueID(elem) + '::evt_' + type + '::fn_' + handler + '}',
					f = evtHash[key];
				if(typeof f != 'undefined'){
					elem.detachEvent('on' + type, f);
					delete evtHash[key];
				}
				key = null;
			};
		}

		function ieGetUniqueID(elem) {
			return elem===window ? 'theWindow' : elem===document ? 'theDocument' : elem.uniqueID;
		}
		function mouseEnter(_pFn) {
			return function(_evt) {
				var relTarget = _evt.relatedTarget;
				if (this == relTarget || isAChildOf(this, relTarget)) {
					return;
				}
				_pFn.call(this, _evt);
			};
		}
		function isAChildOf(_parent, _child) {
			if (_parent == _child) {
				return false;
			}
			while (_child && _child != _parent) {
				_child = _child.parentNode;
			}
			return _child == _parent;
		}
		function fixEvent(event) {
			if (event && event.target) return event;
			event = event || window.event;
			event.pageX = event.clientX + nTalk(window).scrollLeft();
			event.pageY = event.clientY + nTalk(window).scrollTop();
			event.target = event.srcElement;
			event.stopPropagation = stopPropagation;//不再派发事件
			event.preventDefault = preventDefault; //取消事件的默认动作
			switch (event.type) {
				case "mouseout" :
					event.relatedTarget = event.toElement; break;
				case "mouseover" :
					event.relatedTarget = event.fromElement; break;
			}
			return event;
		}
		function stopPropagation() { this.cancelBubble = true; }
		function preventDefault() { this.returnValue = false; }
		function fireEvent(elem, type) {
			if( nTalk.browser.msie ) try{
				elem.fireEvent('on'+type);
			}catch(e){
				return false;
			}
			else{
				var htmlEvent = document.createEvent('HTMLEvents');
				htmlEvent.initEvent(type, true, true);
				try{
					if( elem ) elem.dispatchEvent(htmlEvent);
				}catch(e){

				}
			}
			return true;
		}
		return {
			__evtHash: evtHash,
			addEvent: addEvent,
			removeEvent: removeEvent,
			fixEvent: fixEvent,
			fireEvent: fireEvent
		};
	}();

	/**
	 * @class JSON json转换对像
	 * @static
	 */
	nTalk.JSON = (function(){ /*JSON */
		var toJSONString, parseJSON, gap, indent, rep,
			cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			reg = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			meta = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};
		function quote(string) {
			reg.lastIndex = 0;
			return reg.test(string) ?
				'"' + string.replace(reg, function (a) {
				var c = meta[a];
				return typeof c === 'string' ? c :
					'\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' :
				'"' + string + '"';
		}
		function str(key, holder) {
			var i, k, v, length, partial,
				mind = gap,
				value = holder[key];
			if (typeof rep === 'function') {
				value = rep.call(holder, key, value);
			}
			switch (typeof value) {
				case 'string':
					return quote(value);
				case 'number':
					return isFinite(value) ? String(value) : 'null';
				case 'boolean':
				case 'null':
					return String(value);
				case 'object':
					if (!value) {
						return 'null';
					}
					gap += indent;
					partial = [];
					if (Object.prototype.toString.apply(value) === '[object Array]') {
						length = value.length;
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || 'null';
						}
						v = partial.length === 0 ? '[]' :
							gap ? '[\n' + gap +
								partial.join(',\n' + gap) + '\n' +
								mind + ']' :
								'[' + partial.join(',') + ']';
						gap = mind;
						return v;
					}
					if (rep && typeof rep === 'object') {
						length = rep.length;
						for (i = 0; i < length; i += 1) {
							k = rep[i];
							if (typeof k === 'string') {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v);
								}
							}
						}
					} else {
						for (k in value) {
							if ( value.hasOwnProperty(k) ) {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v);
								}
							}
						}
					}
					v = partial.length === 0 ? '{}' :
						gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
							'{' + partial.join(',') + '}';
					gap = mind;
					return v;
			}
		}
		toJSONString = function(value, replacer){
			/* 2015.09.21 部分网站自己实现了JSON对象，解析的方式有出入
			if( nTalk.isObject(JSON) ){
				return JSON.stringify(value);
			}
			*/
			if (replacer && typeof replacer !== 'function' &&
				(typeof replacer !== 'object' ||
					typeof replacer.length !== 'number')) {
				throw new Error('JSON.toString');
			}
			return str('', {'': value});
		};
		parseJSON = function(text, reviver){
			var j;
			function walk(holder, key) {
				var v, value = holder[key];
				if (value && typeof value === 'object') {
					for (var k in value) {
						if (value.hasOwnProperty(k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}
			text = String(text).replace(/\r|\n/ig, '');
			if(text) try{
				text = nTalk.hexToDec(text);
			}catch(e){
			}
			/* 2015.09.21 部分网站自己实现了JSON对象，解析的方式有出入
			if( nTalk.isObject(JSON) ){
				return JSON.parse(text);
			}
			*/
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function (a) {
					return '\\u' +
						('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				});
			}
			if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
				.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
				.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                /*jslint evil: true */
				j = eval('(' + text + ')');
				return typeof reviver === 'function' ?
					walk({'': j}, '') : j;
			}
			throw new SyntaxError('JSON.toJSON');
		};

		return {
			'toJSONString': toJSONString,
			'parseJSON': parseJSON
		};
	})();

	/**
	 * hash table
	 * @class HASH
	 * @constructor
	 */
	nTalk.HASH = nTalk.Class.create();
	nTalk.HASH.prototype = {
		hashTable: null,
		hashIndex: null,
		initialize: function(){
			this.hashTable = {};
			this.hashIndex = [];
		},
		add: function(key, value){
			if( typeof key === core_strUndefined) return false;
			if( !this.contains(key) ){
				this.hashTable[key] = typeof(value) !== core_strUndefined ? value : null;
				this.hashIndex.push(key);
				return true;
			}else{return false;}
		},
		remove: function(key){
			var next = this.next(key),
				i = this.index(key)
				;
			delete this.hashTable[key];
			if( i !== false ) this.hashIndex.splice(i, 1);
			return this.hashTable[next];
		},
		first: function(){
			for(var k in this.hashTable){
				if( this.hashTable.hasOwnProperty(k) )return this.hashTable[k];
			}
		},
		last: function(){
			var lastData = null;
			for(var k in this.hashTable){
				if( this.hashTable.hasOwnProperty(k) ){
					lastData = this.hashTable[k];
				}
			}
			return lastData;
		},
		previous: function(key){
			var preKey = null;
			for(var k in this.hashTable){
				if( !this.hashTable.hasOwnProperty(k) ) continue;

				if( k == key ) return preKey;
				preKey = k;
			}
			return preKey;
		},
		next: function(key){
			var firstKey = null, getNext = false;
			for(var k in this.hashTable){
				if( !this.hashTable.hasOwnProperty(k) ) continue;

				if( !firstKey ) firstKey = k;
				if( k == key ){
					getNext = true;
					continue;
				}
				if( getNext ) return k;
			}
			return firstKey;
		},
		count: function(){
			var i=0;
			for(var k in this.hashTable){
				if( this.hashTable.hasOwnProperty(k) ) i++;
			}
			return i;
		},
		items: function(key, value){
			if( value ){
				this.hashTable[key] = value;
				return this.hashTable[key];
			}else{
				return this.hashTable[key];
			}
		},
		index: function(key){
			for(var i=0; i<this.hashIndex.length; i++){
				if( this.hashIndex[i] == key ) return i;
			}
			return false;
		},
		contains: function(key){
			return typeof(this.hashTable[key]) != "undefined";
		},
		clear: function(){
			for(var k in this.hashTable){
				if( this.hashTable.hasOwnProperty(k) ){
					delete this.hashTable[k];
				}
			}
			this.hashIndex = [];
		},
		each: function(Fn){
			for(var k in this.hashTable){
				if( k && this.hashTable.hasOwnProperty(k) ){
					Fn.call(self, k, this.hashTable[k]);
				}
			}
		}
	};

	/**
	 * 通过post提交数据
	 * @class POST
	 * @constructor
	 */
	nTalk.POST = nTalk.Class.create();
	nTalk.POST.prototype = {/*POST */
		iframeName: '',
		iframeElement:	null,
		formName:		'',
		formElement:	null,
		hiddenElement:  null,	//2015.12.28 添加一个隐藏的div，将iframe append到div中，不直接append到body节点
		target:			'',
		CON_TARGET:		['_blank','_self','_parent','_top'],
		_stopCall: false,
		onComplete: null,
		onFailure: null,
		_loaded: false,
		/**
		 * @method initialize
		 * @param {String} url
		 * @param {String} DATA
		 * @param {Function|Array} callback
		 * @param {String}   target*/
		initialize: function(url, DATA, callback, target){
			var data = nTalk.merge({}, DATA), randomChar = nTalk.randomChar(16);
			if( nTalk.isArray(callback) ){
				this.onComplete = callback[0] || emptyFunc;
				this.onFailure  = callback[1] || emptyFunc;
			}else{
				this.onComplete = callback || emptyFunc;
				this.onFailure  = emptyFunc;
			}
			this.target			= target || 'POST_IFRAME_' + randomChar;
			//创建hiddenElement
			if (nTalk('.nTalk_post_hiddenElement').length > 0) {
				this.hiddenElement = nTalk('#nTalk_post_hiddenElement');
			}else {
				this.hiddenElement = nTalk({
					tag:	'div',
					id:		'nTalk_post_hiddenElement',
					style:	'left:-10px;top:-10px;visibility:hidden;display:none;width:1px;height:1px;'
				}).appendTo(true);
			}

			if( nTalk.inArray(this.target, this.CON_TARGET) < 0 ){
				this.iframeName		= this.target;
				this.iframeElement	= this.createIFrame( this.iframeName, 'about:blank' );
			}

			this.formName		= 'POST_FORM_' + randomChar;
			this.formElement	= this.form( url, data );

			try{
				this.formElement.submit();
			}catch(e){
			}
		},
		stopCall: function(){
			this._stopCall = true;
		},
		/**
		 * @method createIFrame 创建隐藏iframe，监控加载完成事件
		 * @param  {String}  iFName	iFrame名称
		 * @param  {String}  uri		iFrame地址
		 * @return {Element}
		 */
		createIFrame: function(iFName, uri){
			var self = this,
				iFrameElement,
				fnLoad = function(event){
					var element = this, readyState = element.readyState;
					if( !/^(?:loaded|complete|undefined)$/.test( readyState ) || self._loaded ) return;

					nTalk(element).removeEvent('readystatechange', fnLoad);
					nTalk(element).removeEvent('load', fnLoad);
					nTalk(element).removeEvent('error', fnError);

					self._loaded = true;
					if( !self._stopCall ){
						self.onComplete.call(self, event, iFName);
					}
					window.frames[iFName] = window[iFName] = null;
					setTimeout(function(){
						nTalk(element).remove();
						nTalk(self.formElement).remove();
					}, 800);
				},
				fnError = function(event){
					var element = this;

					nTalk(element).removeEvent('readystatechange', fnLoad);
					nTalk(element).removeEvent('load', fnLoad);
					nTalk(element).removeEvent('error', fnError);

					if( !self._stopCall ){
						self.onFailure.call(self, event, iFName);
					}
					window.frames[iFName] = window[iFName] = null;
					setTimeout(function(){
						nTalk(element).remove();
						nTalk(self.formElement).remove();
					}, 50);
			}
			;

			if (window[iFName]){
				return window[iFName];
				}
			if (window.frames[iFName]){
				return window.frames[iFName];
			}
			//2015.12.28 append到隐藏的div中
			iFrameElement	= nTalk({
				tag:	'IFRAME',
				name:	iFName,
				id:		iFName,
				src:	uri,
				style:	'left:-10px;top:-10px;visibility:hidden;width:1px;height:1px;'
			}).appendTo(this.hiddenElement);

			if( !nTalk.browser.safari ){
				iFrameElement.css('position', 'absolute');
			}
			iFrameElement.bind('readystatechange', fnLoad).bind('load', fnLoad).bind('error', fnError);
			window[iFName]	= iFrameElement.get(0);
			return window[iFName];
		},
		/**
		 * 创建表单
		 * @param  {String}        url  表单URL
		 * @param  {Array|Object}  data 表单数据
		 * @return {Element}
		 */
		form: function( url, data ){
			var formElement;
			//2015.12.28 append到隐藏的div中
			formElement = nTalk({
				tag:		'FORM',
				name:		this.formName,
				'accept-charset':'utf-8',
				enctype:	'application/x-www-form-urlencoded',
				method:		'POST',
				style:		'display:none;',
				target:		this.target,
				action:		url
			}).appendTo(this.hiddenElement);

			if( nTalk.isArray(data) ){
				for(var i = 0; i < data.length; i++ ){
					for (var name in data[i]) {
						if( !data[i].hasOwnProperty(name) ) continue;

						this.input(name+'[]', data[i][name], formElement);
					}
				}
			}else{
				for (var y in data) {
					if( !data.hasOwnProperty(y) ) continue;

					if( nTalk.isArray(data[y]) ){
						for(var j = 0; j<data[y].length; j++){
							this.input(y+'[]', data[y][j], formElement);
						}
					}else{
						this.input(y, data[y], formElement);
					}
				}
			}
			return formElement.get(0);
		},
		/**
		 * @method input 创建表单项
		 * @param  {String}  name   表单名称
		 * @param  {String}  value 表单值
		 * @param  {Element} parent
		 * @return {Object}
		 */
		input: function(name, value, parent){
			return nTalk({
				tag:	'INPUT',
				type:	'hidden',
				name:	name,
				value:	encodeURIComponent( /number|string/.test(typeof(value)) ? value : nTalk.JSON.toJSONString(value) )
			}).appendTo(parent);
		}
	};

	nTalk.extend({
		/**
		 * @method inArray 判断某值是否存在入一个数组中
		 * @param  value {String|Number|Boolean}      值
		 * @param  array {Array} 数组
		 * @return {String|Number}
		 */
		inArray: function(value, array){
			if ( array.length == core_strUndefined ){
				for ( var name in array ){
					if( !array.hasOwnProperty(name) ) continue;

					if(array[name] == value) return name;
				}
			} else {
				for ( var i = 0, len = array.length; i < len; i++ ) {
					if(array[i] == value) return i;
				}
			}
			return -1;
		},
		/**
		 * @method toURI json转换为查询字符串
		 * @param  {Object}  args
		 * @param  {Boolean} clearNull
		 * @param  {String}  separator
		 * @return {String}
		 */
		toURI: function(args, clearNull, separator){
			var t = [], sp = separator===undefined ? '&' : separator,
				add = function(k, v){
					var h = sp=='&' ? k+'=' : '', type = typeof args[name];
					switch( type ){
						case 'object': return (v ? h + encodeURIComponent(nTalk.JSON.toJSONString(v)) : clearNull ? '' : h);
						case 'function':
						case 'undefined': return '';
						case 'boolean':
						case 'number': return h + v;
						default: return (v ? h + encodeURIComponent(v.replace(/\+/gi, '%2B')) : clearNull ? '' : h);
					}
				}
				;
			if ( nTalk.isPlainObject(args) ){
				for ( var name in args ){
					if( !args.hasOwnProperty(name) ) continue;
					var kv = add(name, args[name]);
					if( kv ) t.push( kv );
				}
			}else{
				return '';
			}
			return t.join(sp).replace(/%20/g, "+" );
		},
		/**
		 * @method uriToJSON 查询字符串转换为json
		 * @param  {String} str   待转换字符串
		 * @return {Object}         返回json
		 */
		uriToJSON: function(str){
			var target = {}, arr = str.toString().split('&');
			for(var arg, i = 0; i < arr.length; i++){
				arg = arr[ i ].split('=');
				if( arg.length < 2 ) continue;
				try{
					target[ arg[0] ] = decodeURIComponent( arg[1] || '' );
				}catch(e){
					target[ arg[0] ] = arg[1];
				}
			}
			return target;
		},
		whereGetTo: function(to, form, formkeys, tokeys){
			return nTalk.merge(to, this.whereGet(form, formkeys, tokeys));
		},
		whereGet: function(form, formkeys, tokeys, callback){
			var target = {};
			if( formkeys && nTalk.isArray(formkeys) ){
				for(var i = 0, l = formkeys.length; i < l; i++){
					if( tokeys && tokeys[i] && tokeys[i] !== formkeys[i] )
						target[ tokeys[i] ] = !nTalk.isDefined(form[ formkeys[i] ]) ? '' : form[ formkeys[i] ];
					else
						target[ formkeys[i] ] = !nTalk.isDefined(form[ formkeys[i] ]) ? '' : form[ formkeys[i] ];
				}
			}else {
				target = form;
			}
			if( !nTalk.isFunction(callback) ) return target;
			for(var k in target){
				if( !target.hasOwnProperty(k) ) continue;
				callback.call(this, target[k]);
			}
		},
		/**
		 * @method enLength 获取字符串长度，双字节字符算两个
		 * @param  {string} str [description]
		 * @return {number}     [description]
		 */
		enLength: function(str){
			str = str || '';
			try{
				return str.toString().replace(/[^\x00-\xFF]/g,'**').length;
			}catch(e){
				nTalk.Log(e, 3);
			}
		},
		/**
		 * @method enSubstr 按要求截断字符串
		 * @param  str {String}   字符串
		 * @param  len {Number}   截取字符串的长度
		 * @param  ext {String}   截断的字符串补齐字符
		 * @return {String}
		 */
		enCut: function(str, len, ext){
			var l = nTalk.enLength(str);
			len   = len || 0;
			if( l < len ){
				return '' + (str || '');
			}
			for(var r = 0, i = 0; i  < str.length; i++){
				r += str.charCodeAt(i) > 255 ? 2 : 1;
				if( r == len || (ext && r == len - 2) ){
					return str.substring(0, i + 1) + ( ext ? '..' : '');
				}else if( r > len || (ext && r > len - 2) ){
					return str.substring(0, i) + ( ext ? '..' : '');
				}
			}
			return str || '';
		},
		camelize: function(word){
			return word.replace('-ms-', 'ms-').replace(rCamelCase, function (match, letter) {
				return (letter + '').toUpperCase();
			});
		},
		clearHtml: function( html ){
			html = html || '';
			return html.replace(clearHtmlExp, '');
		},
		protocolFilter: function(data, protocol){
			protocol = protocol || nTalk.protocol;
			if( protocol == 'file:' ){
				protocol = 'http:';
			}
			if( nTalk.isObject(data) ){
				for(var k in data){
					if( data.hasOwnProperty(k) ){
						data[k] = this.protocolFilter(data[k], protocol);
					}
				}
				return data;
            }else if( nTalk.isArray(data) ){
				for(var i = 0; i < data.length; i++){
					data[i] = this.protocolFilter(data[i], protocol);
				}
				return data;
			}else if( nTalk.isNumeric(data) || nTalk.isBoolean(data) || nTalk.isFunction(data) ){
				return data;
			}else if( typeof data !=="undefined" ){
				return !data ? data : data.toString().replace(/^https?:/ig, protocol).replace(/^rtmps?:/ig, protocol == 'https:' ? 'rtmps:' : 'rtmp:').replace(/^wss?:/ig, protocol == 'https:' ? 'wss:' : 'ws:');
			}
		},
		decToHex: function(source){
			var res = [];
			for (var i = 0; i < source.length; i++){
				if( /[\u4e00-\u9fa5]/i.test( source.charAt(i) ) ){
					res[i] = "\\u" + ("00" + source.charCodeAt(i).toString(16)).slice(-4);
				}else{
					res[i] = source.charAt(i);
				}
			}
			return res.join('');
		},
		hexToDec: function(source){
			if( !source ) return '';
			var reg = /\\u([0-9a-zA-Z]{2,4})|&#(\d+);/gi;
			var arrs = source.match(reg),
				strOutScript = source;
			if (!arrs) {
				return strOutScript;
			}else{
				for(var i=0; i <= arrs.length; i++ ){
					if (!arrs[i]) continue;
					var strHex, strChar, isError = false;
					strHex = arrs[i].replace("\\u", "");
					for (var j = 0; j < strHex.length; j++) {
						if ("0123456789abcdef".indexOf(strHex.charAt(j)) == -1) {
							isError = true;
						}
					}
					if (!isError) {
						strChar = String.fromCharCode( parseInt( strHex , 16 ) );
						strOutScript = strOutScript.replace(arrs[i], strChar);
					}
				}
			}
			return strOutScript;
		}
	});

	/**
	 * @desc    DOMElement
	 * @rely    core
	 */
	nTalk.extend({/*Element*/
		Element: function(tag, options){
			var elem, html, attr = '';
			tag = tag.toLocaleUpperCase();

			if( nTalk.inArray(tag, ['IFRAME', 'FORM', 'INPUT', 'SELECT','TEXTAREA']) > -1 ){
				try{
					if( tag == 'FORM' ){
						attr = (options.method ? ' method="' + options.method + '"' : '') + (options.enctype ? ' enctype="' + options.enctype + '"' : '');
					}
					html = '<' + tag + ' name="' + (options.name || nTalk.randomChar(16)) + '"' + attr + '></' + tag + '>';
					elem = document.createElement(html);
					delete options.name;
				}catch(e){
					elem = document.createElement(tag);
				}
			}else{
				elem = tag === 'comment' ? document.createComment(options.text||'') : document.createElement(tag);
			}
			if( options ){
				nTalk.each(options, function(name, value){
					try{
						switch (name){
							case 'css':
							case 'style':
								elem.style.cssText = value;
								break;
							case 'innerHTML':
							case 'html':
								elem.innerHTML = value;
								break;
							case 'className':
							case 'class':
								elem.className = value;
								break;
							case 'text':
								elem.textContent = value;
								break;
							default:
								elem.setAttribute(name, value);
								break;
						}
					}catch(e){
					}
				});
			}
			return elem;
		},
		/**
		 * @desc 按条件插入HTML
		 * @param {Element}  rootElement	插入html的节点
		 * @param {String}   html	插入html
		 * @param {String}	  where	default:afterbegin；插入html相对于rootElement位置
		 * @return {Element}
		 */
		insert: function(rootElement, html, where) {
			var range, frag;
			rootElement = rootElement || document.body;
			where = where ? where.toLowerCase() : 'afterbegin';
			if (rootElement.insertAdjacentHTML) {
				switch (where.toLowerCase()) {
					case "beforebegin":rootElement.insertAdjacentHTML('BeforeBegin', html);return rootElement.previousSibling;
					case "afterbegin": rootElement.insertAdjacentHTML('AfterBegin', html);return rootElement.firstChild;
					case "afterend":rootElement.insertAdjacentHTML('AfterEnd', html); return rootElement.nextSibling;
					default :rootElement.insertAdjacentHTML('BeforeEnd', html);return rootElement.lastChild;
				}
			}
			range = rootElement.ownerDocument.createRange();
			switch (where) {
				case "beforebegin":
					range.setStartBefore(rootElement);
					frag = range.createContextualFragment(html);
					rootElement.parentNode.insertBefore(frag, rootElement);
					return rootElement.previousSibling;
				case "afterbegin":
					if (rootElement.firstChild) {
						range.setStartBefore(rootElement.firstChild);
						frag = range.createContextualFragment(html);
						rootElement.insertBefore(frag, rootElement.firstChild);
					} else {
						rootElement.innerHTML = html;
					}
					return rootElement.firstChild;
				case "beforeend":
					if (rootElement.lastChild) {
						range.setStartAfter(rootElement.lastChild);
						frag = range.createContextualFragment(html);
						rootElement.appendChild(frag);
					} else {
						rootElement.innerHTML = html;
					}
					return rootElement.lastChild;
				case "afterend":
					range.setStartAfter(rootElement);
					frag = range.createContextualFragment(html);
					rootElement.parentNode.insertBefore(frag, rootElement.nextSibling);
					return rootElement.nextSibling;
			}
			throw 'Illegal insertion point -> "' + where + '"';
		},
		/**
		 * 创建FLashHtml
		 * @param {String}  movieName
		 * @param {String}  src flash src
		 * @param {Object}  data params
		 * @param {Object}  attr
		 * @return {String} flash html
		 */
		flashHtml: function(movieName/*:String*/, src/*:String*/, data/*json*/, attr/*json*/){
			attr = nTalk.extend({
				width:  1,
				height: 1,
				style: '',
				wmode: 'opaque'/*window|transparent|opaque*/
			}, attr);
			if( nTalk.browser.oldmsie ){
				//2014.10.21 旧版IE加载flash需要添加随机数，随机数取值0-999
				var ljf = src.indexOf('?') > -1 ? '&' : '?';
				src +=  ljf + 'rnd=' + Math.floor(Math.random()*1000);
			}
			return nTalk.browser.msie && nTalk.browser.ieversion<11 ?
				[
					'<object id="', movieName, '" name="', movieName, '" width="',attr.width,'" height="',attr.height,'" style="',attr.style,'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="https://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,28">',
					'<param name="wmode" value="',attr.wmode,'" />',
					'<param name="movie" value="',src,'" />',
					'<param name="allowscriptaccess" value="always" />',
					'<param name="flashvars" value="', nTalk.toURI(data, true), '" />',
					'</object>'
				].join('') :
			nTalk.browser.msie && nTalk.browser.ieversion>=11 ?
				[
					'<object id="', movieName, '"  name="', movieName, '" data="', src, '" width="',attr.width,'" height="',attr.height,'" style="',attr.style,'" type="application/x-shockwave-flash">',
					'<param name="wmode" value="',attr.wmode,'"/>',
					'<param name="movie" value="',src,'"/>',
					'<param name="quality" value="high"/>',
					'<param name="allowscriptaccess" value="always"/>',
					'<param name="flashvars" value="', nTalk.toURI(data, true), '"/>',
					'</object>'
				].join('') :
				[
					'<embed id="', movieName, '" name="', movieName, '" src="' + src + '" width="',attr.width,'" height="',attr.height,'" style="',attr.style,'" flashvars="', nTalk.toURI(data, true), '" wmode="',attr.wmode,'" allowscriptaccess="always" pluginspage="https://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" >',
					'</embed>'
				].join('');

		},
		_vendorPropName: function(style, name){
			if ( name in style ) {
				return name;
			}
			var cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
				capName = name.charAt(0).toUpperCase() + name.slice(1),
				origName = name,
				i = cssPrefixes.length;
			while( i-- ){
				name = cssPrefixes[i] + capName;
				if(name in style){
					return name;
				}
			}
			return origName;
		},
		css: function(elem, name, value){
			var opacity, origName, opacityExp = /\s*alpha\(opacity=([^)]*)\)\s*/gi;
			if( !elem ){
				return false;
			}

			if(value === undefined){
				origName = nTalk.camelize(name);

				if( document.defaultView && document.defaultView.getComputedStyle ){
					value = document.defaultView.getComputedStyle(elem, null).getPropertyValue( name );
					return value === 'auto' || value === '' ? 0 : value;
				}else{
					name = nTalk.cssProps[origName] || nTalk._vendorPropName( elem.style, origName );

					value = name === 'opacity' ? /opacity=([^)]*)/.test(elem.currentStyle.filter) ?
						(0.01 * parseFloat(RegExp.$1)) + '' :
						1 : elem.style[name] || (elem.currentStyle ? elem.currentStyle[name] : null);
					//ie hack
					if( name === 'backgroundPosition' && nTalk.browser.msie && nTalk.browser.ieversion <= 8 ){
						value = elem.style[name+'X'] || (elem.currentStyle ? elem.currentStyle[name+'X'] : null);
						value = value + ' ' + elem.style[name+'Y'] || (elem.currentStyle ? elem.currentStyle[name+'Y'] : null);
				   }
					return value === 'auto' ? 0 : value;
				}
			}else{
				if ( document.documentElement.style.opacity !== undefined ){
					try{
					elem.style[nTalk.camelize(name)] = value;
					}catch(e0){
						return false;
					}
					return true;
				}else{
					if (!elem.currentStyle || !elem.currentStyle.hasLayout){
						elem.style.zoom = 1;
					}
					if( name === 'opacity' ){
						try{
							//for IE8 添加滤镜时，图片显示很粗糙
							elem.style.filter = value == 1 ? 'none' : ((elem.currentStyle || elem.style).filter.replace(opacityExp, "") + ' alpha(opacity=' + value * 100 + ')');
						}catch(e1){
						}
						elem.style.zoom = 1;
					}else try{
						elem.style[nTalk.camelize(name)] = value;
					}catch(e0){
						return false;
					}
					return true;
				}
			}
		},
		attr: function(el, name, value){
			if(!el) return;
			if(typeof value != 'undefined'){
				if ( value==='' )
					el.removeAttribute(name);
				else
					el.setAttribute(name, value);
				return value;
			}else{
				return el.getAttribute ? el.getAttribute(name) : (el[name] || '');
			}
		},
		addClass: function(elem, classname){
			if( !elem ) return false;
			if( this.indexOfClass(elem, classname) ){
				return false;
			}else{
				var srcClass = elem.className.split(/\s+/).join(" ");
				elem.className = (srcClass ? srcClass + " " : "") + classname;
				return true;
			}
		},
		removeClass: function(elem, classname){
			if( !elem || !elem.className ){
				return false;
			}else{
				elem.className = elem.className.replace( new RegExp( "(^|\\s+)" + classname + "(\\s+|$)", "i" ), " " );
				return true;
			}
		},
		indexOfClass: function(elem, classname){
			if( !elem || !elem.className ){
				return false;
			}else{
				return new RegExp( "(^|\\b)" + classname + "(\\s|$)", "gi" ).test(elem.className);
			}
		},
		contains: function(parent, elem){
			if( elem ){
				while( (elem = elem.parentNode) ){
					if( elem === parent ){
						return true;
					}
				}
			}
			return false;
		}
	});


	/**
	 * @desc 公共定位对像
	 */
	nTalk.position = nTalk.Class.create();
	nTalk.position.prototype = {
		defaultOptions:{
			left: null,
			top:  null,
			width: null,
			height:null,
			right: null,
			bottom:null,
			fixed: true,
			resize:false
		},
		timer: 0,
		repwidth: '',
		repheight:'',
		inited: false,
		direction: 'left',
		initialize: function(element, options){
			var offset;

			nTalk.extend(this, this.defaultOptions, options);
			this.element = element.talkVersion ? element : nTalk(element);

			if( !this.width ){
				this.width = this.element.width();
			}else if( this.width == 'auto' ){
				this.repwidth = 'auto';
				this.width = this.element.width();
			}
			if( !this.height ){
				this.height = this.element.height();
			}else if( this.height == 'auto' ){
				this.repheight = 'auto';
				this.height = this.element.height();
			}
			this.offset  = nTalk(window).offset();

			this.quirks = nTalk.browser.msie6 || (nTalk.browser.Quirks&&nTalk.browser.oldmsie);
			if( this.left === null ){
				this.direction = 'right';
			}
			if( this.left === null && this.right === null ){
				offset = this.element.offset();

				this.left = offset.left;
				this.top  = offset.top;
			}

			this.right = this.right===null  ? (nTalk(window).width()  - this.left - this.width) : this.right;
			this.bottom= this.bottom===null ? (nTalk(window).height() - this.top  - this.height): this.bottom;
			this.left  = this.left===null   ? (nTalk(window).width()  - this.right - this.width)  : this.left;
			this.top   = this.top===null	? (nTalk(window).height() - this.bottom - this.height):this.top;

			if( this.fixed ){
				this.fixedPosition({
					left: this.left,
					top:  this.top,
					right:this.right,
					bottom:this.bottom
				});
			}else{
				this.animationPosition();
			}
		},
		fixedPosition: function(options){
			var self = this, offset, scrollTop;

			if( this.quirks ){
				offset = nTalk(window).offset();
				scrollTop = nTalk(window).scrollTop();

				this.element.css({
					position:	"absolute",
					width:		this.repwidth  ? this.repwidth  : (this.width + "px"),
					height:		this.repheight ? this.repheight : (this.height + "px"),
					left:		options.left + offset.left + "px",
					top:		options.top  + offset.top  + "px"
				});

				var leftExpression = [
					'expression(eval(Math.max((document.documentElement.scrollLeft || document.body.scrollLeft), (document.documentElement.scrollLeft || document.body.scrollLeft) + ' + options.left + ')))',
					'expression(eval(Math.max((document.documentElement.scrollLeft || document.body.scrollLeft), (document.documentElement.scrollLeft || document.body.scrollLeft) + (document.documentElement.clientWidth  || document.body.clientWidth ) - this.offsetWidth  - ' + options.right + ')))'
					];
				var topExpression  = [
					'expression(eval(Math.max((document.documentElement.scrollTop  || document.body.scrollTop ), (document.documentElement.scrollTop  || document.body.scrollTop ) + ' + options.top + ')))',
					'expression(eval(Math.max((document.documentElement.scrollTop  || document.body.scrollTop ), (document.documentElement.scrollTop  || document.body.scrollTop ) + (document.documentElement.clientHeight || document.body.clientHeight) - this.offsetHeight - ' + options.bottom + ')))'
					];

				if( nTalk.isFunction(this.element.get(0).style.getExpression) ){
					if( this.direction == 'left' ){
						this.element.Expression('left', leftExpression[0]);
						this.element.Expression('top',  topExpression[0]);
					}else{
						this.element.Expression('left', leftExpression[1]);
						this.element.Expression('top',  topExpression[1]);
					}
				}else{
					nTalk(window).scrollTop( scrollTop + 1 );

					if( this.direction == 'left' ){
						this.element.replaceIEcssText({
							left: leftExpression[0],
							top:  topExpression[0]
						});
					}else{
						this.element.replaceIEcssText({
							left: leftExpression[1],
							top:  topExpression[1]
						});
					}

					nTalk(window).scrollTop( scrollTop );
				}
			}else{
				offset = {
					position: "fixed",
					width:	  this.repwidth  ? this.repwidth  : (this.width + "px"),
					height:	  this.repheight ? this.repheight : (this.height + "px")
				};
				if( this.direction == 'left' ){
					offset.left = options.left + "px";
					offset.top  = options.top + "px";
				}else{
					offset.right = options.right + "px";
					offset.bottom= options.bottom + "px";
				}
				this.element.css(offset);
			}

			if( this.resize && !this.inited ){
				nTalk.Event.addEvent(window, 'resize', function(event){
					self.resizeFixed(event);
				});
				/*
				nTalk.Event.addEvent(window, 'scroll', function(event){
					if( self.timer == 0 || nTalk.getTime() - self.timer >= 500 ){
						self.timer = nTalk.getTime();
						self.resizeFixed(event);
					}
				});
				*/
			}
			this.inited = true;
		},
		resizeFixed: function(){
			var style = [];
			if( this.direction == 'left' ){
				style.left = Math.max(0, Math.min(this.left, nTalk(window).width()  - this.width));
				style.top  = Math.max(0, Math.min(this.top,  nTalk(window).height() - this.height));
				style.right= nTalk(window).width()  - style.left - this.width;
				style.bottom=nTalk(window).height() - style.top  - this.height;
			}else{
				style.right = Math.min(this.right,  nTalk(window).width()  - this.width);
				style.bottom= Math.min(this.bottom, nTalk(window).height() - this.height);
				style.left  = nTalk(window).width()  - style.right - this.width;
				style.top   = nTalk(window).height() - style.bottom - this.height;
				if( style.left < 0 || style.top < 0 ){
					style.left = Math.max(0, style.left);
					style.top  = Math.max(0, style.top);
					style.right= nTalk(window).width()  - style.left - this.width;
					style.bottom=nTalk(window).height() - style.top  - this.height;
				}
			}

			this.fixedPosition(style);
		},
		clearExpression: function(){
			if( this.quirks ){
				var offset = nTalk(window).offset();

				this.element.Expression("left", "");
				this.element.Expression("top", "");
				this.element.css({
					left: this.left + offset.left + "px",
					top:  this.top  + offset.top  + "px"
				});
			}
		},
		animationPosition: function(){
		}
	};

	nTalk.extend({
		myString: function(text){
            /*jshint -W053 */
			str = new String(text || "");
			str.trim = function(){
				return this.replace(/(^\s*)|(\s*$)/g, "");
			};
			str.linkFilter = function(style){
				return this.toString()
				.replace(/((\w+):\/\/)?([\w-]+\.)([\w-]+\.)([a-zA-Z\-_\.]+)([^$\s,\"\u4E00-\u9FA5]*)?/ig, function(a, b, c, d, e, f, g){
					var blankURL = (b||'http://') + (d||'') + e + f + (g || '');
					return '<a href="' + blankURL.replace(/(^\s+)|(\s+$)/gi, '') + '" target="_blank" style="' + (style || '') + '">' + (b||'') + (d||'') + e + f + (g || '') + '</a>';
				});
			};
			str.linkFilter1 = function(cssText){
				return this.toString()
				.replace(/((\w+):\/\/)?([\w-]+\.)([\w-]+\.)([a-zA-Z\-_\.]+)([^$\s,\uFF0C\u3002\"\u4E00-\u9FA5]*)?/ig, function(a, b, c, d, e, f, g){
					var blankURL = ((b||'http://') + (d||'') + e + f + (g || '')).replace(/(^\s+)|(\s+$)/gi, '');
					var linkClass= '' + nTalk.randomChar(16);

					return ['<div style="',nTalk.STYLE_BODY,'"><a href="', blankURL, '" target="_blank" style="', (cssText || ''), '">',
							(b||''), (d||''), e, f, (g || ''),
							'</a></div><div class="ntalk-link-contains ', linkClass, '" data-source="', blankURL, '" style="', cssText, '"></div>'].join('');
				});
			};
			str.sprintf = function(){
				var len = arguments.length, r = this;
				if (len < 1 || !RegExp) return r.toString();
				for (var a = 0; a < len; a++) {
					r = r.replace(new RegExp("%" + (a+1), "g"), (arguments[a] + "").replace(/%\d/g, '').toString() );
				}
				return r;
			};
			return str;
		},
		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"columnCount": true,
			"fillOpacity": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"zIndex": true,
			"zoom": true
		},
		cssProps: {
			"float": "cssFloat"
		},
		unit: function (name, value){
			if (this.cssNumber[name]){
				return '';
			}
			var unit = (value + '').replace(cssValueExp, '');

			return unit === '' ? 'px' : unit;
		},
		valHooks: {
			option: {
				get: function(elem){
					return elem.value || elem.text;
				}
			},
			select: {
				get: function(elem){
					var value, i, max, option,
						index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type === "select-one";

					if( index < 0 )
						return null;

					i = one ? index : 0;
					max = one ? index + 1 : options.length;
					for(; i < max; i++){
						option = options[ i ];
						if( option.selected && option.getAttribute('disabled') === null && (!option.parentNode.disabled && option.parentNode.tagName.toUpperCase()!=='OPTGROUP') ){
							value = nTalk(option).val();

							if( one )
								return value;

							values.push( value );
						}
					}
					if( one && !values.length && options.length){
						return nTalk( options[index] ).val();
					}

					return values;
				},
				set: function(elem, value){
					var values = nTalk.isArray(value) ? value : [value];

					nTalk(elem).find('option').each(function(){
						this.selected = nTalk.inArray( nTalk(this).val(), values ) >= 0;
					});

					if( !values.length ){
						elem.selectedIndex = -1;
					}

					return values;
				}
			}
		}
	});

	nTalk.each(['radio', 'checkbox'], function(i, key){
		nTalk.valHooks[key] = {
			get: function(elem){
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
	nTalk.each(['radio', 'checkbox'], function(i, key){
		nTalk.valHooks[key] = nTalk.extend(nTalk.valHooks[key], {
			set: function(elem, value){
				elem.checked = nTalk.inArray( nTalk(elem).val(), value ) >= 0;
				return elem.checked;
			}
		});
	});

	nTalk.fn.extend({
		bind: function(event, fn){
			return nTalk.access( this, function(element, event, fn){
				nTalk.Event.addEvent(element, event, fn);
			}, event, fn, 1);
		},
		addEvent: function(event, fn){
			return this.bind(event, fn);
		},
		click: function(fn){
			return this.bind('click', fn);
		},
		hover: function(fnOver, fnOut){
			return nTalk.access( this, function(element, fnOver, fnOut){
				nTalk.Event.addEvent(element, 'mouseover', fnOver);
				nTalk.Event.addEvent(element, 'mouseout', fnOut);
				return nTalk( element );
			}, fnOver, fnOut || emptyFunc);
		},
        	//03.28 移除事件绑定支持fn参数为空
		removeEvent: function(event, fn){
			return nTalk.access( this, function(element, event, fn){
                if( fn === undefined )
				    element.onclick = null;
                else
				    nTalk.Event.removeEvent(element, event, fn);
			}, event, fn, 1);
		},
		fire: function(event){
			return nTalk.access( this, function(element, event, o){
		        nTalk.Event.fireEvent(element, event);
			}, event, "", 1);
		},
		insert: function(html, where){
			return nTalk(nTalk.insert(this[0], html, where));
		},
		html: function(html, clearNull){
			if( html !== undefined )
				return nTalk.each(this, function(i, element){
					element.innerHTML = html;
				});
			else{
				if( nTalk.isBoolean(clearNull) && clearNull ){
					return (this.length ? this.get(0).innerHTML : '').replace(/(^\s+)|(\s+$)/gi, "");
				}else{
					return this.length ? this.get(0).innerHTML : '';
				}
			}
		},
		append: function(content){
			return nTalk.each( this, function(i, element){
				nTalk.insert(element, content, 'beforeend');
			});
		},
		appendTo: function(selector, before){
			var parent, body = document.body || nTalk("body")[0] || document.documentElement;
			if( typeof selector=='boolean' ){
				before = selector;
				selector = null;
			}
			//修复selector为nTalk对像，selector.length==0时报错的问题
			if( !selector || typeof selector == 'string' ){
				parent = nTalk(selector || body)[0];
			}else{
				if( selector.talkVersion ){
				   parent = selector.length ? selector[0] : nTalk(body)[0];
				}else{
					parent = selector;
				}
			}
			return nTalk.each(this, function(i, element){
				var tagName = parent.tagName.toLocaleUpperCase();
				if( before && before.talkVersion && before.length ){
					return parent.insertBefore(element, before.get(0));
				}else if( before && before.nodeType == 1 ){
					return parent.insertBefore(element, before);
				}else if( before===true ){
					return parent.insertBefore(element, parent.firstChild);
				}else if( readyComplete || tagName != 'BODY' ){
					//页面未ready,只能向HEAD内appendChild节点
					try{
						return parent.appendChild(element);
					}catch(e){
					}
				}else{
					return nTalk.insert(parent, element.outerHTML, 'beforeend');//afterbegin
				}
			});
		},
		replace: function(node){
			nTalk.each(this, function(i, element){
				if( element.replaceNode ){
					element.replaceNode(node);
				}else{
					try{
						element.parentNode.appendChild(node);
						element.parentNode.removeChild(element);
					}catch(e){
					}
				}
			});
			return nTalk(node);
		},
		find: function( selector ){
			var child = this.constructor.selector.query(selector, this);
			return this.pushStack( child );
		},
		/**
		 * @method parent 获取当前节点N级父级节点
		 * @param  {Number} level 级别,默认1
		 * @return {HtmlElement}  返回nTalk节点对像
		 */
		parent: function(level){
			var parent = this.get(0);
			level = level || 1;
			if(!parent || !parent.parentNode || !this.length ){
				return null;
			}

			while( level > 0 && parent.parentNode && parent.parentNode.nodeType !== 11 ){
				parent = parent.parentNode;
				level--;
			}
			return parent ? nTalk(parent) : null;
		},
		/**
		 * @method child 获取所以子节点
		 * @return {Object} 返回nTalk对像
		 */
		child: function(){
			return this.find("*");
		},
		remove: function(){
			return nTalk.each( this, function(i, element){
				var removeComplete = false;
				for(var methodName in element){
					if( element.tagName.toUpperCase() == 'IFRAME' ) continue;
					try{
						//Element节点上绑定函数后，部分浏览器不能移除这个Element
						if( typeof element[methodName] === "function" ){
							element[methodName] = null;
						}
					}catch(e){
						nTalk.Log('remove(' + element.tagName + '):' + e.message, 3);
					}
				}
				if( element.parentNode ){
					try{
						element.parentNode.removeChild(element);
						removeComplete = true;
					}catch(e){}
				}
				if( !removeComplete ){
					var tElement = document.createElement('DIV');
					try{
					    tElement.appendChild(element);
					    tElement.innerHTML = '';
						if( tElement.parentNode ) tElement.parentNode.removeChild(tElement);
					}catch(e1){
					}
				}
			});
		},
		css: function(name, value){
			return nTalk.access( this, function(elem, name, value){
				return value !== undefined ?
					nTalk.css(elem, name, value) :
					nTalk.css(elem, name);
			}, name, value, arguments.length > 1);
		},
		cssText: function(value){
			return nTalk.access( this, function(elem, name, value){
				return value !== undefined ?
						(elem.style.cssText = value) :
						elem.style.cssText;
			}, "", value, arguments.length > 1);
		},
		attr: function(name, value){
			return nTalk.access( this, function(elem, name, value){
				return value !== undefined ?
					nTalk.attr(elem, name, value) :
					nTalk.attr(elem, name);
			}, name, value, arguments.length > 1);
		},
		display: function(block){
			return nTalk.each( this, function(i, element){
				nTalk.css(element, 'display', (block ? 'block' : 'none'));
			});
		},
		replaceIEcssText: function(name, value){
			return nTalk.access( this, function(elem, name, value){
				value = value || '';
				var cssText = ';' + elem.style.cssText,
					pattern = new RegExp(";\\s*" + name + ":\\s*(.*?);", "ig"),
					content = ';' + name + ':' + value + ';',
					exisit = pattern.test( cssText );

				if( exisit ){
					elem.style.cssText = cssText.replace(pattern, content);
				}else{
					elem.style.cssText = cssText + content;
				}
			}, name, value, arguments.length > 1);
		},
		//for IE6
		Expression: function(name, value){
			return nTalk.access( this, function(elem, name, value){
				if( !("getExpression" in elem.style) ){
					return;
                }
				if( value === undefined )
					return elem.style.getExpression(name);
				else if( value === '' )
					return elem.style.removeExpression(name);
				else
					return elem.style.setExpression(name, value);
			}, name, value, arguments.length > 1);
		},
		curClass: function(){
			return this.length ? this.get(0).className : '';
		},
		addClass: function(value){
			return nTalk.each(this, function(i, element){
				nTalk.addClass(element, value);
			});
		},
		removeClass: function(value){
			return nTalk.each(this, function(i, element){
				nTalk.removeClass(element, value);
			});
		},
		indexOfClass: function(class1){
			return nTalk.indexOfClass(this[0], class1);
		},
		replaceClass: function(class1, class2){
			return nTalk.each(this, function(i, element){
				nTalk.addClass(element, class1);
				nTalk.removeClass(element, class2);
			});
		},
		//for input select textarea
		val: function(value){
			if( !this.length ) return '';
			var hooks, ret, radio, elem = this[0];

			if( !arguments.length ){
				hooks = nTalk.valHooks[ elem.nodeName.toLowerCase() ];
				if( hooks && 'get' in hooks && (ret = hooks.get(elem, 'value')) !== undefined ){
					return ret;
				}

				hooks = nTalk.valHooks[ elem.type ];
				if( hooks && 'get' in hooks){
					radio = this[0].type == 'radio';
					for(var values = [],i = 0; i < this.length; i++){
						if( (ret = hooks.get(this[i], 'value')) !== undefined && this[i].checked ){
							if( radio ) return ret;
							else values.push( ret );
						}
					}
					return radio ? '' : values;
				}

				ret = this[0].value;

				return typeof ret === 'string' ?
					ret :
					ret === null ? '' : ret;
			}else{
				return nTalk.each(this, function(i, elem){
					if( value === null ){
						value = '';
					}
					hooks = nTalk.valHooks[ elem.type ] || nTalk.valHooks[ elem.nodeName.toLowerCase() ];

					if ( !hooks || !("set" in hooks) || hooks.set( this, value, "value" ) === undefined ) {
						elem.value = value;
					}
				});
			}
		},
		width: function(value){
			var curElem;
			if( this.length > 0 ){
				curElem = this[0];
			}else{
				return 0;
			}
			if( nTalk.isWindow(curElem) ){
				return nTalk.browser.Quirks&&!nTalk.browser.msie ? document.documentElement.clientWidth : document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
			}else{
				return value === undefined ?
					curElem.offsetWidth :
					(curElem.offsetWidth = value);
			}
		},
		height: function(value){
			var curElem;
			if( this.length ){
				curElem = this[0];
			}else{
				return 0;
			}
			if( nTalk.isWindow(curElem) ){
				return nTalk.browser.Quirks&&!nTalk.browser.msie ? window.innerHeight : document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
			}else{
				return value === undefined ?
					curElem.offsetHeight :
					(curElem.offsetHeight = value);
			}
		},
		scrollHeight: function(value){
			var curElem;
			if( this.length ){
				curElem = this[0];
			}else{
				return 0;
			}
			if( nTalk.isWindow(curElem) ){
				return window.innerHeight || document.documentElement.scrollHeight || document.body.scrollHeight;
			}else{
				try{
					return value === undefined ?
						curElem.scrollHeight :
						(curElem.scrollHeight = value);
				}catch(e){
					return 0;
				}
			}
		},
		scrollLeft: function(value){
			var curElem;
			if( this.length ){
				curElem = this[0];
			}else{
				return 0;
			}
			if( nTalk.isWindow(curElem) ){
				if( value === undefined ){
					try{
						var sLeft = document.documentElement.scrollLeft || window.pageXOffset;
						return Math.max(sLeft, document.body ? document.body.scrollLeft : 0) || 0;
					}catch(e){
						return 0;
					}
				}else{
					document.documentElement.scrollLeft = value;
					document.body.scrollLeft = value;
				}
			}else{
				return value === undefined ?
					curElem.scrollLeft :
					(curElem.scrollLeft = value);
			}
		},
		/**
		 * @method scrollTop
		 * @param  {undefined|Number} value
		 * @return {Boolean|Number}
		 * */
		scrollTop: function(value){
			var curElem;
			if( this.length ){
				curElem = this[0];
			}else{
				return 0;
			}
			if( nTalk.isWindow(curElem) ){
				if( value === undefined ){
					return (document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop);
				}else{
					document.documentElement.scrollTop = value;
					if( document.documentElement.scrollTop != value ){
						document.body.scrollTop = value;
					}
				}
			}else{
				return value === undefined ?
					curElem.scrollTop :
					(curElem.scrollTop = value);
			}
		},
		offset: function(options){
			if( arguments.length ){
				return options === undefined ?
					this :
					this.each(function(i, elem){
						nTalk.offset.setOffset(elem, options, i);
					});
			}
			var docElem,
				elem = this[0],
				box = {top: 0, left: 0},
				doc = elem && elem.ownerDocument
			;
			if( nTalk.isWindow(elem) ){
				return {
					top: nTalk(elem).scrollTop(),
					left:nTalk(elem).scrollLeft()
				};
			}
			if( !doc ){
				return box;
			}
			docElem = doc.documentElement;
			if( !nTalk.contains(docElem, elem) ){
				return box;
			}
			if ( typeof elem.getBoundingClientRect !== core_strUndefined ) {
				box = elem.getBoundingClientRect();
			}

			return {
				top: box.top + nTalk(window).scrollTop() - docElem.clientTop,
				left:box.left+ nTalk(window).scrollLeft() - docElem.clientLeft
			};
		},
		fixed: function(options){
			return nTalk.each(this, function(i, elem){
				new nTalk.position(elem, options);
			});
		}
	});
	nTalk.offset = {
		setOffset: function(elem, options){
			var curCSSTop, curOffset, curCSSLeft,//calculatePosition,
				position = nTalk.css( elem, "position" ),
				curElem = nTalk( elem ),
				props = {};
			if ( position === "static" ) {
				elem.style.position = "relative";
			}

			curOffset  = curElem.offset();
			curCSSTop  = nTalk.css( elem, "top" );
			curCSSLeft = nTalk.css( elem, "left" );
			//calculatePosition = ( position === "absolute" || position === "fixed" ) && ( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

			if ( options.top !== null ){
				props.top = (options.top - curOffset.top) + (curCSSTop || 0);
			}
			if ( options.left !== null ){
				props.left = (options.left - curOffset.left) + (curCSSLeft || 0);
			}
			curElem.css( props );
		}
	};

	/**
	 * @desc 缓存对像，cookie集合
	 */
	nTalk.cache = {
		data: null,
		init: function(){
			nTalk.cache.data = nTalk.extend( {}, nTalk.cache.deserialize(nTalk.cookie.get( nTalk.CON_CACHE_COOKIE ) ) );
		},
		get: function(key, Immediate){
			if( Immediate === true ){
				nTalk.cache.data = nTalk.merge(nTalk.cache.data, nTalk.cache.deserialize( nTalk.cookie.get( nTalk.CON_CACHE_COOKIE )) );
			}
			return this.formatData(key);
		},
		set: function(key, value){
			this.formatData(key, value);
			return nTalk.cookie.set( nTalk.CON_CACHE_COOKIE, nTalk.cache.serialize(nTalk.cache.data), 0);
		},
		/**
		 * @method serialize json转字符串，用于存入cookie
		 * @param  {Object|Array|String}    data
		 * @return {String}
		 */
		serialize: function(data){
			var self = this, result = [];

			if( nTalk.isArray(data) ){
				for(var i = 0; i < data.length; i++){
					result.push( this.serialize(data[i]) );
				}
				return '[' + result.join('|') + ']';
			}else if( nTalk.isObject(data) ){
				nTalk.each(data, function(k, value){
					result.push( k + ':' + self.serialize(value) );
				});
				return result.length ? '{' + result.join(',') + '}' : '{}';
			}else{
				return data;
			}
		},
		/**
		 * cookie中的字符串转json
		 * @param  {String} data
		 * @return {Object}
		 */
		deserialize: function(data){
			if( !data ) return {};

			var json, strJson = /"/.test(data) ? data : data.replace(/(\{|\[)/g, "$1\"").replace(/(}|])/g, "\"$1").replace(/(:|,)/g, "\"$1\"");
			try{
                json = nTalk.JSON.parseJSON(strJson);
			}catch(e){
				return null;
			}
			for(var k in json){
				if( !json.hasOwnProperty(k) ) continue;
				json[k] = nTalk.isNumeric(json[k]) ? +json[k] : json[k];
			}
			return json;
		},
		formatData: function(key, value){
			var strDate = key.split('.'), copy = nTalk.cache.data, g;
			while( (g = strDate.shift()) ){
				if( strDate.length > 0 ){
					if(!copy[g]){
						copy[g] = {};
					}
					copy = copy[g];
				}else{
					if( value === undefined )
						return copy[g] || null;
					else if( nTalk.isArray(value) ){
						var arrTo = [];
						if( copy[g] )
							arrTo = arrTo.concat(copy[g]);
						copy[g] = arrTo.concat(value);
					}
					else{
						copy[g] = value;
						return nTalk.cache.data;
					}
				}
			}
		}
	};

	nTalk.promptwindow = function(){
		var isFocus = false,
			isPrompting = false,
			cacheTime = nTalk.getTime(),
			timerID = null,
			promptMsg = null,
			promptMsg2 = null,
			originTitle = document.title,
			counter = 0,
			autoStop = true,
			promptTitle = '\u3010%1\u3011%2 - %3'
		;

		if(window.addEvent){
			nTalk(document).bind("focusin", handleFocus);
			nTalk(document).bind("focusout", handleBlur);
		}
		nTalk(window).bind('focus', handleFocus);
		nTalk(window).bind('blur',  handleBlur);

		function handleFocus(){
			isFocus = true;
			var curTime = nTalk.getTime();
			if( curTime - cacheTime < 100  ){
				return;
			}
			cacheTime = nTalk.getTime();
			if(autoStop){
				stopPrompt();
			}
			if( nTalk.isFunction(nTalk.promptwindow.callbackFocus) ){
				nTalk.promptwindow.callbackFocus();
			}
		}
		function handleBlur(){
			isFocus = false;
			if( nTalk.isFunction(nTalk.promptwindow.callbackBlur) ){
				nTalk.promptwindow.callbackBlur();
			}
		}
		function startPrompt(destnick, flashNews, aStop){
			if(isPrompting || isFocus)
				return;
			if(flashNews && flashNews.length>0){
				promptMsg = nTalk.myString(promptTitle).sprintf(flashNews, '', originTitle);
				promptMsg2 = "";
				for(var i=0,l = Math.ceil(nTalk.enLength(flashNews)/2); i<l; i++){
					promptMsg2 += '\u3000' ;
				}
				promptMsg2 = nTalk.myString(promptTitle).sprintf(promptMsg2, destnick, originTitle);
			}
			autoStop = aStop || autoStop;
			timerID = setInterval(changeWindowTitle, 800);
			isPrompting = true;
			return isPrompting;
		}
		function changeWindowTitle(){
			counter++;
			document.title = counter%2===0 ? promptMsg2 : promptMsg;
			try{
				if(top != self){
					top.document.title = counter%2 === 0 ? promptMsg2 : promptMsg;
				}
			}catch(e){}
		}
		function stopPrompt(){
			if(!isPrompting) return;
			clearInterval(timerID);
			timerID = null;
			counter = 0;
			setTimeout(function(){
				document.title = originTitle;
			}, 500);
			isPrompting = false;
			if( window.top != window.self){
				try{window.top.document.title = originTitle;}catch(e){}
			}
		}
		return {
			callbackFocus: emptyFunc,
			callbackBlur: emptyFunc,
			originTitle: originTitle,
			startPrompt: startPrompt,
			stopPrompt: stopPrompt
		};
	}();

	//（6.8.2合版）添加 CORS Ajax跨域提交 基础库
	var createXHR = function(){
	    try{
	        return new window.XMLHttpRequest();
	    }catch(e){
	        try{
	            return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	        }catch(e1){
	            return false;
	        }
	    }
	};

	var xmlrequest = function(){
	    var xhr = createXHR();

	    if( !xhr ){
	    	return xhr;
	    }

	    if( "withCredentials" in xhr ){
	        return xhr;
	    }

	    if( window.XDomainRequest===undefined ){
	        return xhr;
	    }
	    xhr = new XDomainRequest();
	    xhr.readyState = 0;
	    xhr.status = 100;
	    xhr.onreadystatechange = emptyFunc;
	    xhr.onload = function(){
	        xhr.readyState = 4;
	        xhr.status = 200;
	        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	        xmlDoc.async = "false";
	        xmlDoc.loadXML(xhr.responseText);
	        xhr.responseXML = xmlDoc;
	        xhr.response = xhr.responseText;
	        xhr.onreadystatechange();
	    };
	    xhr.ontimeout = xhr.oerror = function(){
	        xhr.readyState = 4;
	        xhr.status = 500;
	        xhr.onreadystatechange();
	    };

	    return xhr;
	};

	var tepmxhr = xmlrequest();
	var hasSetRequestHeader = (tepmxhr.setRequestHeader || false );
	var hasOverrideMimeType = (tepmxhr.overrideMimeType || false);
	tepmxhr = null;

	/**
	 * 跨域Ajax请求
	 * @method doAjaxRequest
	 * @param {Object}   options 请求参数
	 * @param {String}   options.url
	 * @param {Function} [options.success=emptyFunc] 调用成功能
	 * @param {Function} [options.error=emptyFunc]   调用成失败
	 * @param {String}   [options.type=GET]      请求方式
	 * @param {Object}   [options.data]          请求数据
	 * @param {Object}   [options.headers={}]    请求头
	 * @param {String}   [options.dataType=text] 响应数据类型
	 * @param {String}   [options.responseType]  设置响应数据类型
	 * @param {String}   [options.mimeType]
	 * @return {Object}         xhr对像
	 */
	nTalk.doAjaxRequest = function(options){
	    var dataType = options.dataType || "text";
	    var success  = options.success || emptyFunc;
	    var error    = options.error || emptyFunc;
	    var xhr      = xmlrequest();

	    if(!xhr){
	    	error("no xhr");
	    	return null;
	    }

	    var callback = function(){
	        var json;

	        if( xhr.readyState === 4 ){
	            var status = xhr.status || 0;
	            if( status === 200 ){
	                if( dataType === "json" ){
	                    try{
	                        json = nTalk.JSON.parse(xhr.responseText);
	                        success(json, xhr);
	                    }catch(e){
	                        error(xhr.responseText, xhr, "response to json exception");
	                    }
	                    return;
	                }else{
	                    success(xhr.responseText, xhr);
	                    return;
	                }
	            }
	            else{
	                if( dataType === "json" ){
	                    try{
	                        json = nTalk.JSON.parse(xhr.responseText);
	                        error(json, xhr);
	                    }catch(e){
	                        error(xhr.responseText, xhr, "response to json exception");
	                    }
	                    return;
	                }else{
	                    success(xhr.responseText, xhr, "Server exception");
	                }
	            }
	        }
	        if( xhr.readyState === 0){
	            success(xhr.responseText, xhr, "Server exception");
	        }
	    };

	    xhr.onreadystatechange = callback;

	    if(options.responseType){
	        if( typeof xhr.responseType !== 'undefined' ){
	            xhr.responseType = options.responseType;
	        } else {
	            error('',xhr,"Browser does not support setting response type");
	            return null;
	        }
	    }
	    if(options.mimeType){
	        if(hasOverrideMimeType){
	            xhr.overrideMimeType(options.mimeType);
	        } else {
	            error('',xhr,"Browser does not support setting mimeType");
	            return null;
	        }
	    }

	    var headers = options.headers || {};

	    if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
	        headers[ "X-Requested-With" ] = "XMLHttpRequest";
	    }
	    for(var key in headers){
	        if(hasSetRequestHeader){
	            xhr.setRequestHeader(key, headers[key]);
	        } else {
	            error('',xhr,"Browser does not support setting header");
	            return null;
	        }
	    }

	    var type = options.type || "GET";
	    xhr.open(type, options.url);

	    var data = options.data || null;
	    xhr.send(data);
	    return xhr;
	};

	if( window.nTalk ) return;
	window.nTalk = window.NTKF = nTalk;
	/**
	 * 初始化页面数据
	 */
	nTalk.initializeCore();
})(window);
