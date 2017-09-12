var CON_VERSION = {
	release:'2017.08.25_001938',
	dir:	'nt6.92',
	script:	'2017.08.23',
	ntid:	'2017.08.23',
	im: 	'2017.08.23',
	chat:	'2017.08.23',
	publish:'2016.09.21_000000'
};
var CON_RULE = {};
var CON_SERVER = {
	flashserver:'http://bj-v2.ntalker.com/downt/t2d/',
	configserver:'http://statics.ntalker.com/mcenter/'
};
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
			if (time === -1) {
				return '';
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

			var ntkfscript =  nTalk("script[src*=ntkf]");
			var baseoutscript = nTalk("script[src*=base.out]");
			var scripts = [];

			if (ntkfscript && ntkfscript.length != 0) {
				scripts.push(ntkfscript[0]);
			}

			if (baseoutscript && baseoutscript.length != 0) {
				scripts.push(baseoutscript[0]);
			}

			for (var i = 0, l = scripts.length; i < l; i++) {
				var element = scripts[i];
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
			}
			if( !nTalk.baseURI ){
				nTalk.baseURI = './siteid/kf_9221/';
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
		var browser = {"360ee":!1,lbbrowser:!1,se:!1,chrome:!1,safari:!1,msie:!1,firefox:!1,oupeng:!1,opera:!1,webkit:!1,iPod:!1,iPad:!1,iPhone:!1,android:!1,gecko:!1,windows:!1,"windows ce":!1,edge:!1,uc:!1,micromessenger:!1,weibo:!1},
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
		//是否支持localstorage
		isStorageSupported = function(){
				var supported = null;
				try{
					supported = window.localStorage;
				}catch(e){
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
						return false;
					}
				}
			}
		//2017.03.30 发现localstorage不可用的情况下，mqtt报错不可用
        browser.supportMqtt = "WebSocket" in window && window.WebSocket !== null && "localStorage" in window && window.localStorage !== null && "ArrayBuffer" in window && window.ArrayBuffer !== null && isStorageSupported();

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
					scriptCompleteImg = function(){
						//dequeue
						queue.splice( nTalk.inArray(src, queue), 1 );
						l--;

						//nTalk.Log('scriptComplete: queue.length:' + queue.length + ' - l:' + l, 2);
						callback.apply(item, result);
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
				if (src.indexOf('theme') > -1) {
					url = src;
				} else {
					url = (!/^(https?:\/\/)/i.test( src ) ? nTalk.baseURI : '') + src;
				}
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
								scriptCompleteImg();
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
			protocol = (nTalk.flashserver.usehttps == 1) ? "https:" : (protocol || nTalk.protocol);
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
				.replace(/((\w+):\/\/)?([\w-]+\.)?([\w-]+\.)?([\w-]+\.)([a-zA-Z\-_\.]+)([^$\s,\"\u4E00-\u9FA5]*)?/ig, function(a, b, c, d, e, f, g, h){
					var blankURL = (b||'http://') + (d||'') + (e||'') + (f||'') + (g||'') + (h || '');
					return '<a href="' + blankURL.replace(/(^\s+)|(\s+$)/gi, '') + '" target="_blank" style="' + (style || '') + '">' + (b||'') + (d||'') + (e || '') + (f || '') + (g || '') + (h || '') + '</a>';
				});
			};
			str.linkFilter1 = function(cssText){
				var yuanshi = this.toString();
				/*2016.10.20 如果是右侧自定义标签不经过此步骤*/
				if( yuanshi.indexOf('rightTag=true') > -1){
					return yuanshi;
				}

				// 如果匹配有邮箱地址返回原始值 2017.08.16
				var regMail = new RegExp(/([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+(\.[a-zA-Z]{2,3})+/gi);
				if(regMail.test(yuanshi)) {
					return yuanshi;
				}

				//匹配连接 2017-02-19 zlc
				return this.toString()
				.replace(/((\w+):\/\/)?([\w-]+\.)?([\w-]+\.)?([\w-]+\.)([a-zA-Z\-_\.]+)([^$\s,\uFF0C\u3002\"\u4E00-\u9FA5]*)?/ig, function(a, b, c, d, e, f, g, h){
					var blankURL = ((b||'http://') + (d||'') + (e||'') + (f||'') + (g||'') + (h || '')).replace(/(^\s+)|(\s+$)/gi, '');
					var linkClass= '' + nTalk.randomChar(16);

						return ['<div style="',nTalk.STYLE_BODY,'"><a href="', blankURL, '" target="_blank" style="', (cssText || ''), '">',
							(b||''), (d||''), (e||''), (f||''), (g||'') ,(h || ''),
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

	var tepmxhr, hasSetRequestHeader, hasOverrideMimeType;

	try {
		tepmxhr = xmlrequest();
		hasSetRequestHeader = (tepmxhr.setRequestHeader || false );
		hasOverrideMimeType = (tepmxhr.overrideMimeType || false);
		tepmxhr = null;
	} catch (e) {

	}

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

(function($){
	$.flashserver = {
		'trailserver':'http://bj-trail.ntalker.com/trail/trail',
		'presenceserver':'rtmp://bim1.ntalker.com:8000/flashIM;rtmps://bim1.ntalker.com:443/flashIM',
		'presencegoserver':'http://bj-v2.ntalker.com/flashIM/wdkstatus',
		'crmcenter':'http://hcrmct.ntalker.com/',
		'mcenter':'http://bj-v2.ntalker.com/record/mcenters/',
		'coopserver':'',
		'roboturl':'http://xn.faqrobot.org/servlet/XNAQ',
		't2dstatus':'http://bj-v2.ntalker.com/t2d1/t2dstatus',
		'chatview_in':'',
		'chatview_out':'',
		'chatview_wap':'',
		'queryurl':'http://bj-v2.ntalker.com/spider/spider/',
		'tchatmqttserver':'tcp://bj-v2.ntalker.com:8020/tchat1;ws://bj-v2.ntalker.com:8021/tchat1;wss://bj-v2.ntalker.com:8023/tchat1',
		'eduimmqttserver':'',
		'robotserver':'http://bj-v2.ntalker.com/assist',
		'kpiserver':'http://bj-v2.ntalker.com/kpi',
		'isnoim':1,
		'notrail':0,
		'preload':2000,
		'sessioncarry':'1',
		'enable_entrance':'0',
		'enable_invite':'0',
		'close_tchat_flash':'1',
		'close_im_flash':'0',
		'robot':'2',
		'connect_type':'comet',
		'history_version':'1',
		'entranceConfig':{
		},
		'tchatConnectType':'1',
		'layout':'2',
		'reversechat':'0',
		'usehttps':'0',
		'eduautochat':'0',
		'eduautoopentimeout':'3000',
		'eduautoopendomains':'',
		'eduautoopenstrs':'',
		'settingserver':'http://bj-v2.ntalker.com/setting',
		'apiserver':'http://bj-v2.ntalker.com/api/',
		'siteid':'kf_9221'
	};
	$.sourceURI = $.sourceURI = "../respack/";
})(nTalk);
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
		useSdkData: false,
		getRegionTimer: null, //获取地域的定时请求
		/**
		 * 开始调用轨迹服务
		 * @param  {boolean} islogin
		 * @param  {boolean}  isupdate 用于发起PV请求后，更新商品信息
		 * @return {void}
		 */
		start: function(islogin, isupdate, useSdkData, callback){
			var self = this, params, data, referrer_is_current = $.referrer && $.referrer.indexOf($.domain) > -1;

			if( this.called && !isupdate ){
				return;
			}

			$.Log('nTalk.trail.start()', 1);
			this.etype = isupdate ? 'update' : this.etype;
			this.useSdkData = useSdkData;
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
					if (this.getRegionTimer != null) {
						callback && (typeof callback === 'function') && callback();
					}
				}, i);
			});

			this.getRegionTimer = setTimeout(function() {
				callback && (typeof callback === 'function') && callback();
				clearTimeout(self.getRegionTimer);
				self.getRegionTimer = null;
			}, 200);

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

				if($.browser.android && $.browser.uc) {
					// 兼容uc浏览器post数据为空时，无法正常提交
					data.uc = 1;
					if (window.XMLHttpRequest && window.FormData) {
						var formdata = new FormData();
						for (var key in data) {
							formdata.append(key, data[key]);
						}
						var xhr = new XMLHttpRequest();
						xhr.open('POST', uri, true);
						xhr.send(formdata);
						return;
					}
				}

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
					device:		this.useSdkData ? 'App' : ($.browser.mobile ? 'WAP' : 'PC'),
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

;(function($, undefined) {
    function emptyFunc() {}
    /**
     * 基础库补充
     * @list animate, Queue,pageManage,store,comet,
     * 2015.08.03 修改Window对像布局左右布局改为上下布局
     */
    if ($.animate) {
        $.Log('nt2.js loaded');
        return;
    }

    $.animate = (function() {
            // Use CSS3 native transition for animation as possible
            var style = document.documentElement.style;

            return (
                style.webkitTransition !== undefined ||
                style.MozTransition !== undefined ||
                style.OTransition !== undefined ||
                style.msTransition !== undefined ||
                style.transition !== undefined
            );
        }()) ?
        (function() {
            var style = document.documentElement.style,
                prefix_name = style.webkitTransition !== undefined ? 'Webkit' :
                style.MozTransition !== undefined ? 'Moz' :
                style.OTransition !== undefined ? 'O' :
                style.msTransition !== undefined ? 'ms' : '',
                transition_name = prefix_name + 'Transition';

            return function(elem, options, duration, callback) {
                var css_value = [],
                    css_name = [],
                    unit = [],
                    css_style = [],
                    style = elem.style;

                duration = duration || 300;

                $.each(options, function(name, item) {
                    css_name[name] = $.camelize(name);
                    if ($.isObject(item)) {
                        item.to = item.to || 0;
                        css_value[name] = !$.cssNumber[name] ? parseInt(item.to, 10) : item.to;
                        //unit
                        unit[name] = $.unit(name, item.to);
                        if ($.isDefined(item.from)) {
                            $.css(elem, css_name[name], parseInt(item.from, 10) + unit[name]);
                        }
                    } else {
                        css_value[name] = $.cssNumber[name] ? parseInt(item, 10) : item;
                        //unit
                        unit[name] = $.unit(name, item);
                        $.css(elem, css_name[name], css_value[name]);
                    }
                    css_style.push(name);
                });

                setTimeout(function() {
                    style[transition_name] = 'all ' + duration + 'ms';

                    $.each(css_style, function(i, name) {

                        style[css_name[name]] = css_value[name] + unit[name];
                    });
                }, 15);

                // Animation completed
                setTimeout(function() {
                    // Clear up CSS transition property
                    style[transition_name] = '';

                    if (callback) {
                        callback.call(elem);
                    }
                }, duration);

                return elem;
            };
        })() :
        function(elem, options, duration, callback) {
            var step = 0,
                i = 0,
                j,
                length = 0,
                p = 30,
                css_to_value = [],
                css_from_value = [],
                css_name = [],
                css_unit = [],
                css_style = [],
                property_value, timer;

            duration = duration || 300;

            $.each(options, function(name, item) {
                css_name.push($.camelize(name));

                if ($.isObject(item)) {
                    property_value = item.to;

                    if ($.isDefined(item.from)) {
                        css_from_value.push(!$.cssNumber[name] ? parseInt(item.from, 10) : item.from);
                    } else {
                        css_from_value.push(!$.cssNumber[name] ? parseInt($(elem).css(name), 10) : $(elem).css(name));
                    }

                    $.css(elem, css_name[i], css_from_value[i] + $.unit(name, property_value));
                } else {
                    //not number px
                    property_value = item;
                    css_from_value.push($(elem).css(name));
                }

                css_to_value.push($.cssNumber[name] ? property_value : isNaN(parseInt(property_value, 10)) ? '' : parseInt(property_value, 10));
                css_unit.push($.unit(name, property_value));
                i++;
                length++;
            });
            // Pre-calculation for CSS value
            for (j = 0; j < p; j++) {
                css_style[j] = [];
                for (i = 0; i < length; i++) {
                    css_style[j][css_name[i]] = !$.cssNumber[css_name[i]] && !$.isNumeric(parseInt(css_from_value[i])) ? "" :
                        (css_from_value[i] + (css_to_value[i] - css_from_value[i]) / p * j) + (css_name[i] === 'opacity' ? '' : css_unit[i]);
                }
            }

            var func = function() {
                for (i = 0; i < length; i++) {
                    $.css(elem, css_name[i], css_style[step][css_name[i]]);
                }
                step++;
            };
            for (; i < p; i++) {
                timer = setTimeout(func, (duration / p) * i);
            }

            setTimeout(function() {
                for (i = 0; i < length; i++) {
                    $.css(elem, css_name[i], css_to_value[i] + css_unit[i]);
                }
                if (callback) {
                    callback.call(elem);
                }
            }, duration);

            return elem;
        };

    /**
     * @desc iframe跨域通信
     * @name Message
     * @type {class}
     */
    $.extend({
        listenerFunctions: [],
        /**
         * @method postMessage 跨域发送消息到iframe
         * @param  function callback
         */
        listenerMessage: function(bindFunc) {
            function funcMessage(event) {
                $.each($.listenerFunctions, function(i, f) {
                    f.apply($, [event.data]);
                });
            }
            $.listenerFunctions.push(bindFunc);

            if (!window.addEventListener || this.__listenerMessage === true) {
                return;
            }
            $.Event.addEvent(window, "message", funcMessage);

            $.removelistenerMessage = function() {
                $.Event.removeEvent(window, "message", funcMessage);
                $.listenerFunctions = [];
            }

            this.__listenerMessage = true;
        },
        /**
         * @method postMessage 跨域发送消息到iframe
         * @param  window contentWindow iframe window对像
         * @param  string data          消息内容
         * @param  string origin        消息范围
         */
        postMessage: function(contentWindow, data, origin) {
            if (!contentWindow.postMessage) {
                return;
            }
            origin = origin || "*";
            try {
                contentWindow.postMessage(data, origin);
            } catch (e) {}
        }
    });

    /**
     * @desc 支持拖动、缩放的公共窗口
     * @name Window
     * @type {class}
     */
    $.Window = $.Class.create();
    $.Window.prototype = {
        defaultOptions: {
            dropHeight: 30,
            width: 520,
            height: 410,
            left: 100,
            top: 100,
            minWidth: 520,
            minHeight: 410,
            resize: false,
            drag: false,
            fixed: false,
            zIndex: 1000000,
            rightNode: true,
            onChanage: emptyFunc,
            onClose: emptyFunc,
            onMinimize: emptyFunc,
            onMaximize: emptyFunc,
            onMaxResize: emptyFunc
        },
        _tmpMove: null,
        _tmpStop: null,
        containter: null,
        header: null,
        body: null,
        chatBody: null,
        rightElement: null,
        buttonResize: null,
        buttonClose: null,
        buttonMax: null,
        buttonMin: null,
        _x: 0,
        _y: 0,
        _isdrag: null,
        _Style: null,
        parent: null,
        /**
         * @method initialize
         * @param {Object}      options
         * @param {HTMLElement|undefined} parentElement
         * @return {void}
         * */
        initialize: function(options, parentElement) {
            $.extend(this, this.defaultOptions, options);
            this.parent = parentElement || null;
            this.quirks = $.browser.msie6 || ($.browser.Quirks && $.browser.oldmsie);

            this.right = $(window).width() - this.left - this.width;
            this.bottom = $(window).height() - this.top - this.height;

            $.Log('$.Window:: left:' + this.left + ', top:' + this.top);
            this._create();

            this._bind();
        },
        /**
         * 关闭窗口
         * @param  {Event} event
         * @return {void}
         */
        close: function(event) {
            this.cancelBubble(event);

            if (this.onClose.toString().indexOf('anonymous') <= -1) {
                this.onClose();
            } else {
                this.containter.hide(function() {
                    $(this).remove();
                });
            }
        },
        /**
         * @methmod change
         * @param    {Boolean} isCallBack
         * @return   {void}*/
        change: function(isCallback) {
            if (isCallback) this.onChanage.call(this, {
                width: this.width,
                height: this.height
            });
            if (this._isdrag) {
                return;
            }
            //内容区高度不用变更
            //this.body.css('height', this.height + 'px');
            this.chatBody.css({
                height: (this.height - this.dropHeight) + "px"
            });
            if (this.rightNode) {
                this.rightElement.css('height', (this.height - this.dropHeight) + 'px');
            }
        },
        maxresize: function() {
            this.onMaxResize();
        },
        /**
         * 窗体最小化
         * @param  {Event}   event		Event对像，
         & @param   {Boolean}  hidden		是否只隐藏
         * @return {void}
         */
        minimize: function(event, hidden) {
            if (hidden !== true) {
                this.cancelBubble(event);
            }
            this.containter.css({
                height: "0px",
                width: "0px"
                //top:	(this.top + $(window).height()) + "px",
                //left:	(this.left + $(window).width()) + "px"
            });

            if (hidden !== true) {
                this.onMinimize();
            }
        },
        /**
         * 窗体还原
         * @param  {Event}   event		Event对像，
         * @param  {Boolean} hidden		是否只隐藏
         * @return {void}
         */
        maximize: function(event, hidden) {
            this.containter.css({
                height: this.height + "px",
                width: this.width + "px"
                //top:  this.top + "px",
                //left: this.left + "px"
            });
            if (hidden !== true) {
                this.onMaximize();
            }
        },
        /**
         * 取消冒泡
         * @param  {Event} event
         * @return {void}
         */
        cancelBubble: function(event) {
            this.containter.css("z-index", this.zIndex);
            $.Event.fixEvent(event).stopPropagation();
        },
        /**
         * 更新窗体宽高
         * @param  {Number} width
         * @param  {Number} height
         * @return {void}
         */
        changeAttr: function(width, height) {
            if (this.quirks) {
                this.clearExpression();
            }

            $.extend(this, {
                width: width,
                height: height,
                left: Math.max(0, $(window).width() - this.right - width),
                top: Math.max(0, $(window).height() - this.bottom - height)
            });

            this.containter.css({
                width: this.width + "px",
                height: this.height + "px",
                left: this.left + "px",
                top: this.top + "px"
            });

            if (this.quirks) {
                this.fixedPosition();
            }

            this.change(true);
        },
        /**
         * 开始拖动或改变窗口大小
         * @param  {Event}  event
         * @param  {Boolean} isDrag
         * @return {void}
         */
        start: function(event, isDrag) {
            if (!isDrag) {
                this.cancelBubble(event);
            }
            this._Style = isDrag ? {
                x: "left",
                y: "top"
            } : {
                x: "width",
                y: "height"
            };

            this.right = $(window).width() - this.left - this.width;
            this.bottom = $(window).height() - this.top - this.height;

            if (this.quirks && !isDrag) {
                //IE6,resize，清除表达式
                this.clearExpression();
            }

            event = $.Event.fixEvent(event);
            this.containter.css(isDrag ? {
                //for ie6,7,8应用此样式时，边框丢失
                //opacity: 0.5,
                "z-index": ++this.zIndex
            } : {
                "z-index": ++this.zIndex
            });
            this._isdrag = isDrag;
            this._x = isDrag ? (event.clientX - this.containter.get(0).offsetLeft || 0) : (this.containter.get(0).offsetLeft || 0);
            this._y = isDrag ? (event.clientY - this.containter.get(0).offsetTop || 0) : (this.containter.get(0).offsetTop || 0);

            if ($.browser.msie) {
                this.containter.bind('losecapture', this._tmpStop).get(0).setCapture();
            } else {
                $.Event.fixEvent(event).preventDefault();
                $(window).bind('blur', this._tmpStop);
            }
            $(document).bind('mousemove', this._tmpMove);
            $(document).bind('mouseup', this._tmpStop);
        },
        /**
         * 移动窗口或改变大小
         * @param  {Event} event
         * @return {void}
         */
        move: function(event) {
            if (window.getSelection)
                window.getSelection().removeAllRanges();
            else
                document.selection.empty();

            event = $.Event.fixEvent(event);
            var i_x = event.clientX - this._x,
                i_y = event.clientY - this._y,
                offset = $(window).offset();

            if (this._isdrag) {
                //left, top
                if (this.quirks) {
                    this[this._Style.x] = Math.min(Math.max(i_x, offset.left), offset.left + $(window).width() - this.width) - offset.left;
                    this[this._Style.y] = Math.min(Math.max(i_y, offset.top), offset.top + $(window).height() - this.height) - offset.top;
                } else {
                    this[this._Style.x] = Math.min(Math.max(i_x, 0), $(window).width() - this.width);
                    this[this._Style.y] = Math.min(Math.max(i_y, 0), $(window).height() - this.height);
                }

                this.containter.css(this._Style.x, (this.quirks ? offset.left : 0) + Math.max(0, this[this._Style.x]) + 'px');
                this.containter.css(this._Style.y, (this.quirks ? offset.top : 0) + Math.max(0, this[this._Style.y]) + 'px');
            } else {
                //width, height
                if (this.quirks) {
                    this[this._Style.x] = Math.min(Math.max(i_x + (this.quirks ? offset.left : 0), this.minWidth), $(window).width() - this.left);
                    this[this._Style.y] = Math.min(Math.max(i_y + (this.quirks ? offset.top : 0), this.minHeight), $(window).height() - this.top);
                } else {
                    this[this._Style.x] = Math.min(Math.max(i_x, this.minWidth), $(window).width() - this.left);
                    this[this._Style.y] = Math.min(Math.max(i_y, this.minHeight), $(window).height() - this.top);
                }

                this.containter.css(this._Style.x, this[this._Style.x] + 'px');
                this.containter.css(this._Style.y, this[this._Style.y] + 'px');
            }

            this.right = $(window).width() - this.left - this.width;
            this.bottom = $(window).height() - this.top - this.height;

            this.change(true);
        },
        /**
         * 停止改变
         * @return {void}
         */
        stop: function() {
            if (this.quirks) {
                this.fixedPosition();
            }
            this.containter.css({
                //for ie6,7,8应用此样式时，边框丢失
                //opacity: 1,
                "z-index": --this.zIndex
            });
            $(document).removeEvent('mousemove', this._tmpMove);
            $(document).removeEvent('mouseup', this._tmpStop);

            if ($.browser.msie) {
                this.containter.removeEvent('losecapture', this._tmpStop).get(0).releaseCapture();
            } else {
                $(window).removeEvent('blur', this._tmpStop);
            }
        },
        fixedPosition: function() {
            if (this.quirks) {
                var scrollTop = $(window).scrollTop();

                $(window).scrollTop(scrollTop + 1);

                this.containter.replaceIEcssText({
                    left: 'expression(eval(Math.max((document.documentElement.scrollLeft || document.body.scrollLeft), (document.documentElement.scrollLeft || document.body.scrollLeft) + (document.documentElement.clientWidth  || document.body.clientWidth ) - this.offsetWidth  - ' + this.right + ')))',
                    top: 'expression(eval(Math.max((document.documentElement.scrollTop  || document.body.scrollTop ), (document.documentElement.scrollTop  || document.body.scrollTop ) + (document.documentElement.clientHeight || document.body.clientHeight) - this.offsetHeight - ' + this.bottom + ')))'
                });

                $(window).scrollTop(scrollTop);
                $(window).scrollLeft(1);
            } else {
                this.containter.css({
                    left: this.left + "px",
                    top: this.top + "px"
                });
            }
        },
        clearExpression: function() {
            var offset = $(window).offset();

            this.containter.Expression("left", "");
            this.containter.Expression("top", "");
            this.containter.Expression("left", "");

            this.containter.replaceIEcssText({
                left: offset.left + this.left + 'px',
                top: offset.top + this.top + 'px'
            });
        },
        _for_resize: function() {
            this.left = Math.max(0, $(window).width() - this.right - this.width);
            this.top = Math.max(0, $(window).height() - this.bottom - this.height);

            if (!this.quirks) {
                this.containter.css({
                    left: this.left + 'px',
                    top: this.top + 'px'
                });
            }
        },
        /**
         * 创建窗体
         * @return {HTMLElement}
         */
        _create: function() {
            this.containter = $({
                className: this.className || 'ntalk-window-containter',
                style: $.STYLE_BODY + 'box-sizing:content-box;overflow:hidden;'
            }).appendTo(this.parent, true).css({
                position: !this.fixed ? 'absolute' : !this.quirks ? 'fixed' : 'absolute',
                border: "none",
                width: this.width + "px",
                height: this.height + "px",
                zIndex: this.zIndex
            });

            this.fixedPosition();

            this.header = $({
                className: 'ntalk-window-head',
                style: $.STYLE_BODY + 'cursor:move;position:relative;left:0;top:0;'
            }).appendTo(this.containter).css({
                width: "100%",
                height: this.dropHeight + "px"
            });

            this.buttonClose = $({
                className: 'ntalk-button-close',
                style: $.STYLE_BODY + 'width:20px;height:20px;cursor:pointer;position:static;float:right;position:relative;margin:2px 3px 0 0;line-height:20px;vertical-align:middle;background:none;'
            }).appendTo(this.header);
            this.buttonMax = $({
                className: 'ntalk-button-maxresize',
                style: $.STYLE_BODY + 'width:20px;height:20px;cursor:pointer;position:static;float:right;position:relative;margin:2px 3px 0 0;line-height:20px;vertical-align:middle;background:none;'
            }).appendTo(this.header);
            this.buttonMin = $({
                className: 'ntalk-button-min',
                style: $.STYLE_BODY + 'width:20px;height:20px;cursor:pointer;position:static;float:right;position:relative;margin:2px 3px 0 0;line-height:20px;vertical-align:middle;background:none;'
            }).appendTo(this.header);

            //left
            this.body = $({
                className: 'ntalk-window-body',
                style: $.STYLE_BODY + 'float:left;width:100%;'
            }).appendTo(this.containter);

            this.chatBody = $({
                className: 'ntalk-chat-body',
                style: $.STYLE_BODY + 'width:100%;position:relative;left:0;top:0;'
            }).appendTo(this.body);

            //right
            if (this.rightNode) {
                this.rightElement = $({
                    className: 'ntalk-window-right',
                    style: $.STYLE_BODY + 'float:left;display:none;width:100%;'
                }).appendTo(this.containter);
            }

            if (this.resize) {
                this.buttonResize = $({
                    className: 'window-resize',
                    style: $.STYLE_BODY + 'width:10px;height:10px;cursor:nw-resize;position:absolute;right:1px;bottom:1px;font-size:0;background:none;z-index:99;'
                }).appendTo(this.containter);
            }

            $({
                style: $.STYLE_BODY + 'clear:both;'
            }).appendTo(this.containter);

            this.change();

            return this.containter;
        },
        /**
         * 绑定事件
         * @return {void}
         */
        _bind: function() {
            var self = this;

            this.containter.bind('mousedown', function(event) {
                if (!self.drag) return;
                self.start.call(self, event, true);
            });

            this.buttonClose.bind('mousedown', function(event) {
                $.Event.fixEvent(event).stopPropagation();

                self.close.call(self, event);
            });
            this.buttonMax.bind('mousedown', function(event) {
                $.Event.fixEvent(event).stopPropagation();
                self.maxresize.call(self, event);
            });
            this.buttonMin.bind('mousedown', function(event) {
                $.Event.fixEvent(event).stopPropagation();
                self.minimize.call(self, event);
            });

            this.chatBody.bind('mousedown', function(event) {
                self.cancelBubble.call(self, event);
            });
            if (this.rightNode) this.rightElement.bind('mousedown', function(event) {
                self.cancelBubble.call(self, event);
            });
            if (this.resize) this.buttonResize.bind('mousedown', function(event) {
                self.start.call(self, event, false);
            });

            if (this.fixed) {
                $(window).bind('resize', function() {
                    self._for_resize();
                });
            }
            /**
             * @method _tmpStop
             * @param {Event} event
             * */
            this._tmpStop = function(event) {
                self.stop.call(self, event);
            };
            /**
             * @method _tmpMove
             * @param {Event} event
             * */
            this._tmpMove = function(event) {
                self.move.call(self, event);
            };
        }
    };
    /**
     * @desc	队列
     * @rely
     */
    $.Queue = $.Class.create();
    $.Queue.prototype = {
        list: null,
        length: 0,
        initialize: function() {
            this.list = [];
            this.length = this.list.length;
        },
        isEmpty: function() {
            return this.list.length === 0;
        },
        enQueue: function(item) {
            this.list.push(item);
            this.length = this.list.length;
            return this.list[this.length - 1];
        },
        deQueue: function() {
            var tmp;

            if (this.isEmpty()) {
                return null;
            }
            tmp = this.list.shift();
            this.length = this.list.length;
            return tmp;
        },
        queueFront: function() {
            return this.isEmpty() ? null : this.list[0];
        }
    };

    /**
     * 页面管理器
     * 打面网站页面后，每个页面会用时间戳创建一个唯一身份标识，然后定时更新，定时清除超时未更新的标识
     * 管理器通过会话级cookie管理所有页面
     * @type {[type]}
     */
    $.pageManage = $.Class.create();
    $.pageManage.prototype = {
        identid: "",
        keyid: "",
        data: null,
        interID: null,
        options: null,
        debug: false,
        inter: 0.8,
        count: 0,
        chanageCall: true,
        CON_MANAGE_PAGE_LIST: 'IM_EXIST_PAGEARR',
        //存贮页面标识
        pageStore: null,
        /**
         * 初始化页面管理器
         * @param  {Object} options
         * @param  {String} siteid
         * @return {Object}
         */
        initialize: function(options, siteid) {
            var self = this,
                arrPageList, cookiePageList, LSReadCount = 3;

            if (this.debug) {
                $.Log("pageManage.initialize():");
            }

            this.options = $.extend(this.options, {
                onChanage: emptyFunc,
                onInterval: emptyFunc,
                pageNum: 3, //维护页面数量
                timeout: 2.5, //超时时长
                inter: 0.8 //更新频率
            }, options);

            this.keyid = $.CON_MANAGE_COOKIE + (siteid ? '_' + siteid.toUpperCase() : '');
            this.identid = this._2shortTime(0, 8, 13);
            if ($.browser.chrome) {
                this.options.timeout = 5;
            } //chrome浏览器多页卡会有定时器紊乱现象
            this.options.timeout *= 10;
            this.options.inter *= 1000;
            this.inter = this.options.inter;
            this.pageStore = $.store;

            /*
             * 缓存中的页面管理
             */
            try {
                //从缓存对象中获取现存页面数组,页面缓存可能
                while (LSReadCount--) {
                    arrPageList = this.pageStore.get(this.CON_MANAGE_PAGE_LIST) || '';
                    if (arrPageList !== '') break;
                }

                //从cookie中获取现存页面数据
                cookiePageList = this._get().m;

                //打印现存页面（缓存  Cookie）
                //$.Log("arrPageList:"+arrPageList + " m: " + cookiePageList);

                //当缓存中没有数据或者初始化arrPageList
                arrPageList = arrPageList === '' || cookiePageList.length === 0 ? [] : arrPageList.split(',');

                //缓存中的对象与cookie中的对象页面数量不一致且小于3时，以cookie中为准
                if (arrPageList.length != cookiePageList.length && arrPageList.length <= this.options.pageNum) {
                    arrPageList = [];
                    for (var i = 0; i < cookiePageList.length; i++) {
                        for (var cookiePageId in cookiePageList[i]) {
                            arrPageList.push(cookiePageId);
                        }
                    }
                }

                //push进入当前页面的id
                arrPageList.push(this.identid);

                //存入本地存储中
                this.pageStore.set(this.CON_MANAGE_PAGE_LIST, arrPageList.join(','));
            } catch (e) {}

            //add or update page
            //this._update();

            var before = $.getTime();

            this.interID = setInterval(function() {
                //Regularly clear and updated
                setTimeout(function() {
                    now = $.getTime();
                    var elapsedTime = (now - before);
                    self._update(elapsedTime);
                    self.options.onInterval(self.options.timeout, self.data.m);
                    before = $.getTime();
                }, 0);
            }, this.options.inter);

            //close page clear current page//before
            $.Event.addEvent(window, "unload", function() {
                self._remove();
                setTimeout(function() {}, 500);
            });
        },
        /**
         * 获取当前域下当前打开页面数量
         * @return {number}
         */
        getIsLastPage: function() {
            return this.data.m.length;
        },
        /**
         * 获取缓存数据
         * @return {json}
         */
        _get: function() {
            var data = $.cookie.get(this.keyid) || "{}";

            return $.extend({
                m: []
            }, $.JSON.parseJSON(data));
        },
        /**
         * 保存缓存数据
         * @return {String}
         */
        _save: function() {
            var data = $.JSON.toJSONString(this.data);

            $.cookie.set(this.keyid, data, 0);

            return data;
        },
        /**
         * 移除缓存数据
         * @return {void}
         */
        _remove: function() {
            var index = this._getIndex();
            this.data.m.splice(index, 1);
            this._save();

            var pageStr = this.pageStore.get(this.CON_MANAGE_PAGE_LIST);
            if (!pageStr || pageStr === "") {
                return;
            }
            //2015.06.16 修复未移除指定页面BUG
            var pageArr = pageStr.split(",");
            for (var i = 0; i < pageArr.length; i++) {
                if (pageArr[i] == this.identid) {
                    pageArr.splice(i, 1);
                    break;
                }
            }
            pageStr = pageArr.join(",");
            if (pageStr !== "") {
                this.pageStore.set(this.CON_MANAGE_PAGE_LIST, pageStr);
            } else {
                this.pageStore.whereClear(this.CON_MANAGE_PAGE_LIST);
            }
        },
        /**
         * 更新数据
         * @return {[type]}
         */
        _update: function(intervalTime) {
            this.data = this._get();

            this._clear(intervalTime);

            var self = this,
                type = "update",
                Index = this._getIndex();

            this.data.t = $.formatDate();
            if (!this.data.m[Index]) {
                if (this.data.m.length < this.options.pageNum) {
                    type = "add";
                    this.data.m[Index] = {};
                } else {
                    //wait add
                    return;
                }
            }
            this.data.m[Index][this.identid] = this._2shortTime();

            this._save();

            if (this.debug) {
                $.Log(this.identid + ",pageCount:" + this.data.m.length + "," + type + " data:" + $.JSON.toJSONString(this.data.m));
            }
            if ((type == "add" || this.chanageCall !== true) && this.count != this.data.m.length) {
                this.options.onChanage.call(this, this.data.m.length, this.data.m);
                this.count = this.data.m.length;
            }
            this.chanageCall = false;
        },
        /**
         * 清除超时未更新的页面标识
         * @return {void}
         */
        _clear: function(intervalTime) {
            var curTime = this._2shortTime();
            if (!this.data.m.length) return;
            for (var i = 0, diff; i < this.data.m.length; i++) {
                if (!this.data.m[i]) {
                    continue;
                }
                for (var pid in this.data.m[i]) {
                    if (typeof this.data.m[i][pid] == 'function') {
                        continue;
                    }
                    diff = curTime - this.data.m[i][pid];
                    //Removes more than 2 seconds Page
                    if (Math.abs(diff) > (this.options.timeout + intervalTime / 100)) {
                        this.data.m.splice(i, 1);
                        this.chanageCall = true;

                        //debug 2015.06.16同时需要移除exist_pagearr中对应的identid
                        var pageStr = this.pageStore.get(this.CON_MANAGE_PAGE_LIST);
                        if (!pageStr || pageStr === "") {
                            return;
                        }
                        var pageArr = pageStr.split(",");
                        for (var j = 0; j < pageArr.length; j++) {
                            if (pageArr[j] == pid) {
                                pageArr.splice(j, 1);
                                break;
                            }
                        }
                        pageStr = pageArr.join(",");
                        if (pageStr !== "") {
                            this.pageStore.set(this.CON_MANAGE_PAGE_LIST, pageStr);
                        } else {
                            this.pageStore.whereClear(this.CON_MANAGE_PAGE_LIST);
                        }

                    }
                }
            }
        },
        /**
         * 获取当前页在管理器中的索引值
         * @return {number}
         */
        _getIndex: function() {
            // nt6.92 修复this.data无值的时候报错
            if (!this.data || !this.data.m.length) {
                return 0;
            }
            for (var i = 0; i < this.data.m.length; i++) {
                if (!this.data.m[i]) {
                    continue;
                }
                for (var pid in this.data.m[i]) {
                    if (!this.data.m[i] || $.isFunction(this.data.m[i][pid])) {
                        continue;
                    } else if (pid === this.identid) {
                        return i;
                    }
                }
            }
            return i;
        },
        /**
         * 获取部分时间戳为标识ID
         * @param  {Number|undefined} id
         * @param  {Number|undefined} start
         * @param  {Number|undefined} end
         * @return {String}
         */
        _2shortTime: function(id, start, end) {
            var identid = (id ? id : $.getTime()).toString();
            start = start || 5;
            end = end || 11;
            return identid.substring(start, end);
        }
    };

    /**
     * 浏览器缓存对像，支持localStorage时直接使用，不支持时(<IE8)使用userData
     * @return {Object}
     */
    $.store = (function() {
        var namespace = '__cometd__',
            store = {
                disabled: false
            },
            isStorageSupported = function() {
                var supported = null;
                try {
                    supported = window.localStorage;
                } catch (e) {
                    $.Log('localStorage:' + e.message, 3);
                    return false;
                }
                if (supported) {
                    var mod = 'test';
                    try {
                        if (localStorage.getItem(mod) !== null) {
                            localStorage.removeItem(mod);
                        }
                        localStorage.setItem(mod, mod);
                        if (localStorage.getItem(mod) == mod) {
                            localStorage.removeItem(mod);
                            return true;
                        } else {
                            return false;
                        }
                    } catch (e) {
                        $.Log('The browser localStorage is unavailable. ' + e.message, 3);
                        return false;
                    }
                }
            },
            isSupportUserData = $.browser.msie,
            storage;
        store.toJSONString = function(value) {
            return value === null ? '' : $.JSON.toJSONString(value);
        };
        store.parseJSON = function(value) {
            if (typeof value == 'object') {
                return value || undefined;
            }
            try {
                return $.JSON.parseJSON(value);
            } catch (e) {
                return value || undefined;
            }
        };

        if (isStorageSupported()) {
            storage = window.localStorage;
            store.set = function(key, val) {
                if (!val || val === undefined || val === null) {
                    return store.remove(key);
                }
                try {
                    if (typeof storage.setItem == 'function') {
                        storage.setItem(key, store.toJSONString(val));
                    } else {
                        storage[key] = store.toJSONString(val);
                    }
                } catch (e) {
                    if ((e.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {
                        store.remove(key);
                        try {
                            storage.setItem(key, store.toJSONString(val));
                        } catch (err) {
                            $.Log('store.set:' + err.message, 3);
                        }
                    }
                }
                return val;
            };
            store.get = function(key) {
                return store.parseJSON(storage.getItem(key));
            };
            store.remove = function(key) {
                try {
                    storage.removeItem(key);
                } catch (e) {
                    $.Log('store.remove:' + e.message, 3);
                }
            };
            store.clear = function() {
                try {
                    storage.clear();
                } catch (e) {
                    $.Log('store.clear:' + e.message, 3);
                }
            };
            store.getAll = function() {
                var ret = {};
                for (var i = 0; i < storage.length; ++i) {
                    var key = storage.key(i);
                    ret[key] = store.get(key);
                }
                return ret;
            };
        } else if (isSupportUserData) {
            var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
            var storageOwner, storageContainer;
            var withIEStorage = function(storeFunction) {
                    return function() {
                        var result, args = Array.prototype.slice.call(arguments, 0);
                        args.unshift(storage);
                        try {
                            storageOwner.appendChild(storage);
                        } catch (e) {
                            storageOwner.insertBefore(storage, storageOwner.firstChild);
                        }
                        if (storage.addBehavior) {
                            storage.addBehavior('#default#userData');
                        }
                        var i = 20;
                        while (i > 0) {
                            i--;
                            try {
                                storage.load('nTK-LS');
                                break;
                            } catch (e) {}
                        }
                        result = storeFunction.apply(store, args);
                        storageOwner.removeChild(storage);
                        return result;
                    };
                },
                ieKeyFix = function(key) {
                    return key.replace(forbiddenCharsRegex, '___');
                };
            try {
                storageContainer = new ActiveXObject("htmlfile");
                storageContainer.open();
                storageContainer.write("<script type=\"text/javascript\">document.w=window;<\/script><iframe src=\"/favicon.ico\"><\/iframe>");
                storageContainer.close();
                storageOwner = storageContainer.w.frames[0].document;
                storage = storageOwner.createElement("div");
            } catch (e) {
                storage = document.createElement("div");
                storageOwner = document.body || document.getElementsByTagName("head")[0] || document.documentElement;
            }

            store.set = withIEStorage(function(storage, key, val) {
                key = ieKeyFix(key);
                if (!val || val === undefined || val === null) {
                    return store.remove(key);
                }
                storage.setAttribute(key, store.toJSONString(val));
                try {
                    storage.save('nTK-LS');
                } catch (e) {}
                return val;
            });
            store.get = withIEStorage(function(storage, key) {
                key = ieKeyFix(key);
                return store.parseJSON(storage.getAttribute(key));
            });
            store.remove = withIEStorage(function(storage, key) {
                key = ieKeyFix(key);
                storage.removeAttribute(key);
                storage.save('nTK-LS');
            });
            store.clear = withIEStorage(function(storage) {
                var attributes;
                try {
                    attributes = storage.XMLDocument.documentElement.attributes;
                } catch (e) {
                    return;
                }
                storage.load('nTK-LS');
                for (var i = 0, l = attributes.length; i < l; i++) {
                    var attr = attributes[i];
                    storage.removeAttribute(attr.name);
                }
                storage.save('nTK-LS');
            });
            store.getAll = withIEStorage(function(storage) {
                var attributes;
                try {
                    attributes = storage.XMLDocument.documentElement.attributes;
                } catch (e) {
                    return;
                }
                var ret = {};
                for (var i = 0, l = attributes.length; i < l; ++i) {
                    var attr = attributes[i];
                    var key = ieKeyFix(attr.name);
                    ret[attr.name] = store.parseJSON(storage.getAttribute(key));
                }
                return ret;
            });
        } else {
            store.set = function() {
                $.Log('The browser localStorage is unavailable.', 3);
            };
            store.get = emptyFunc;
            store.remove = emptyFunc;
            store.clear = emptyFunc;
            store.getAll = emptyFunc;
        }
        try {
            store.set(namespace, namespace);
            if (store.get(namespace) != namespace) {
                store.disabled = true;
            }
            store.remove(namespace);
        } catch (e) {
            store.disabled = true;
        }
        /**
         * @method whereClear 按前缀清除缓存数据
         * @param  {string} fix
         * @return {void}
         */
        store.whereClear = function(fix) {
            var self = this;
            var data = this.getAll();
            $.each(data, function(key) {
                if (key.indexOf(fix) > -1) {
                    self.remove(key);
                }
            });
        };
        store.enabled = !store.disabled;

        return store;
    })();

    /**
     * comet连接
     * @type {Object}
     */
    $.comet = $.Class.create();
    $.comet.prototype = {
        name: 'public.comet',
        version: '2014.05.17',
        connType: 'login',
        options: null,
        fix: '',
        id: '',
        count: 0,
        sendIntervalID: null,
        _ipExpr: /^https?:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?\/(.*?)$/gi,
        _cacheElement: {},
        _connectTimeID: {},
        defaultOption: {
            muDomain: 1, //支持N个域名
            timeout: 20, //连接超时时间(秒)
            onCallback: emptyFunc,
            onComplete: emptyFunc,
            onAbnormal: emptyFunc,
            onTimeout: emptyFunc
        },
        changePort: false, //通过改变端口连接comet
        initialize: function(url /*:URL*/ , options /*json*/ ) {
            var self = this;

            this.uri = url;
            this.fix = $.randomChar();

            if (!this.uri) {
                $.Log('comet uri is null', 3);
            }

            this.callMethod = window;
            this.callbackName = 'callback_' + this.fix;

            this.callMethod[this.callbackName] = function() {
                self._connectCallback.call(self, self.id, arguments);
            };

            this.options = $.extend({}, this.defaultOption, options);

            this.initConnectionPooling();
        },
        /**
         * 初始化消息队列
         * @return {[type]} [description]
         */
        initMessageQueue: function() {
            if (!this.messageQueue) {
                this.messageQueue = new $.Queue();
                /**
                 * 添加消息至队列
                 * @param {...} obj
                 */
                this.messageQueue.addMessage = function(obj) {
                    //消息入队此处特殊处理，要判断同一消息是否已在除列中
                    for (var i = 0; i < this.length; i++) {
                        if (this.list[i].msgid == obj.msgid && this.list[i].index == obj.index) {
                            return false;
                        }
                    }
                    this.enQueue(obj);
                    return true;
                };
                /**
                 * 获取队列中的消息
                 * @param  {String} msgid
                 * @param  {Number} msgid
                 * @return
                 */
                this.messageQueue.nextMessage = function(msgid /*:String*/ , index /*:number*/ ) {
                    if (this.isEmpty()) {
                        return null;
                    } else if (!msgid) {
                        return this.queueFront();
                    }
                    for (var i = 0; i < this.length; i++) {
                        if (this.list[i].msgid == msgid && this.list[i].body.sendpacket == index) {
                            return this.list[i + 1];
                        }
                    }
                };
                /**
                 * 移除队列中的消息
                 * @param  {String} msgid
                 * @param  {Number} msgid
                 * @return
                 */
                this.messageQueue.removeMessage = function(msgid /*:String*/ , index /*:number*/ ) {
                    for (var removeIndex, i = 0; i < this.length; i++) {
                        if (this.list[i].msgid == msgid && (this.list[i].index == index || index == -1)) {
                            removeIndex = i;
                        }
                    }
                    this.list.splice(i, 1);
                    this.length = this.list.length;
                };
            }
        },
        /**
         * 初始化连接池
         * @return {[type]} [description]
         */
        initConnectionPooling: function() {
            if (!this.connectionPooling) {
                //服务器地址为IP时，多域名配置无效
                if (this._ipExpr.test(this.uri)) {
                    this.options.muDomain = 1;
                }
                this.connectionPooling = new $.Queue();
                /**
                 * 获取可用连接
                 * @return {connectURI}
                 */
                this.connectionPooling.get = function() {
                    var cpConnect, unlockConnect, earliestConnect;

                    for (var sTimesample, i = 0; i < this.list.length; i++) {
                        //-获取最早回收的域名
                        if (this.list[i].lock === false) {
                            if (!unlockConnect || unlockConnect.rTimesample > this.list[i].rTimesample) {
                                unlockConnect = this.list[i];
                            }
                        }
                        //-获得最早使用的连接-
                        if (!earliestConnect || this.list[i].sTimesample < earliestConnect.sTimesample) {
                            earliestConnect = this.list[i];
                        }
                    }
                    cpConnect = unlockConnect || earliestConnect;

                    this.recover(cpConnect.uri, true);

                    return cpConnect;
                };
                this.connectionPooling.getConnect = function() {
                    var cpConnect = this.get();

                    return {
                        uri: cpConnect.uri,
                        url: cpConnect.uri + (/\?$/ig.test(cpConnect.uri) ? "&" : "?")
                    };
                };
                /**
                 * 更新连接状态,回收连接地址
                 * @param  {[type]} uri		 URL地址
                 * @param  {[type]} lock		锁定
                 * @param  {[type]} sTimesample 开始时间
                 * @param  {[type]} rTimesample 结束时间
                 * @return {[type]}			 [description]
                 */
                this.connectionPooling.recover = function(uri, lock, sTimesample, rTimesample) {
                    for (var i = 0; i < this.list.length; i++) {
                        if (this.list[i].uri != uri) continue;

                        this.list[i].lock = lock;
                        if (lock) { //-启用连接
                            this.list[i].sTimesample = sTimesample || $.getTime();
                            this.list[i].rTimesample = 0;
                        } else { //-回收连接
                            this.list[i].rTimesample = rTimesample || $.getTime();
                        }
                        return true;
                    }
                    return false;
                };

                //初始化连接池
                //连接地址从原始地址到 -(this.options.muDomain - 1)
                for (var i = 0; i <= this.options.muDomain; i++) {
                    var httpFlag = true;
                    var usePort = false;
                    var defaultPort = 80;

                    if(this.uri.indexOf('https://') > -1) {
                      httpFlag = false;
                      defaultPort = 443;
                    }

                    var getPortUrl = this.uri.replace(/(https?:)(\/)+/ig, "");

                    if (getPortUrl.indexOf(':') > -1 && getPortUrl.indexOf(':') < getPortUrl.indexOf('/')) {
                      usePort = true;
                      defaultPort = parseInt(getPortUrl.substring(getPortUrl.indexOf(':') + 1, getPortUrl.indexOf('/')));
                    }

                    if ( i === 1 && this.changePort) {
                      if (!usePort) {
                        this.uri = (httpFlag ? 'http://' : 'https://') + getPortUrl.replace("/", ":" + (++defaultPort) + "/");
                      } else {
                        this.uri = (httpFlag ? 'http://' : 'https://') + getPortUrl.replace(":" + defaultPort, ":" + (++defaultPort));
                      }
                    }


                    this.connectionPooling.enQueue({
                        /*
                        uri: i === 0 ?
                            this.uri.toString().replace(/(https?:\/\/)(.*?)(\-\d+)?\./ig, "$1$2.") : this.uri.toString().replace(/(https?:\/\/)(.*?)(\-\d+)?\./ig, "$1$2-" + (+i - 1) + "."),
                        */
                        uri: this.uri.toString(),
                        lock: false,
                        sTimesample: 0,
                        rTimesample: 0
                    });
                }
            }
        },
        /**
         * 连接comet服务器
         * @param  {json} json 连接参数
         * @return {HtmlDOM}
         */
        connect: function(json, callName) {
            var objConnect, url, index = this.count++;

            this.connType = 'login';
            this.id = this.fix + '_' + index;

            json[callName || 'callbackname'] = this.callbackName;

            this.connectOptions = $.extend(json, {
                ts: $.getTime()
            });

            objConnect = this.connectionPooling.getConnect();

            url = objConnect.url + $.toURI(this.connectOptions);

            this._cacheElement[this.id] = this._createConnect(url, this.id, index, objConnect);
        },
        kalive: function(json, callName) {
            var objConnect, url, index = this.count++;

            this.connType = 'kalive';
            this.id = this.fix + '_' + index;

            json[callName || 'callbackname'] = this.callbackName;

            this.kaliveOptions = $.extend(this.kaliveOptions, json, {
                ts: $.getTime()
            });

            objConnect = this.connectionPooling.getConnect();

            url = objConnect.url + $.toURI(this.kaliveOptions);

            this._cacheElement[this.id] = this._createConnect(url, this.id, index, objConnect);
        },
        disconnectServer: function(json, cache) {
            var objConnect = this.connectionPooling.getConnect();
            this.flashGoServer = objConnect.url + $.toURI(cache === false ? json : $.extend(json, {
                ts: $.getTime()
            }));

            return this.flashGoServer;
        },
        disconnect: function() {
            $.require(this.flashGoServer, function(script) {
                $(script.error ? script.target : script).remove();
            });

            window[this.callbackName] = emptyFunc;
        },
        reconnect: function() {
            this.connect(this.connectOptions);
        },
        send: function(data, callback) {
            var self = this,
                objConnect = this.connectionPooling.getConnect(),
                url = this.mdyServerAddr(objConnect.url) + $.toURI(data);

            $.require(url + '#rnd', function(script) {
                //-解除锁定，回收连接
                self.connectionPooling.recover(objConnect.uri, false);
                if (callback) {
                    callback.call(self, script.error);
                }
                $(script.error ? script.target : script).remove();
            });
            return true;
        },
        /**
         * 上行服务器地址接口更新,下行接口地址为 /flashgo 上行修改为 /httpgo
         * @date 2014.09.03
         * @param {String} url
         * @return {String}
         */
        mdyServerAddr: function(url) {
            return url.replace(/\/flashgo/i, '/httpgo');
        },
        post: function(data, callback) {
            var self = this,
                objConnect = this.connectionPooling.getConnect();

            new $.POST(this.mdyServerAddr(objConnect.url), data, function() {
                //-解除锁定，回收连接
                self.connectionPooling.recover(objConnect.uri, false);
                if (callback) {
                    callback.call(self, true);
                }
            });
        },
        _createConnect: function(uri /*:URl*/ , id /*:String*/ , index /*:number*/ , connect /*:object*/ ) {
            var self = this,
                script, eventName,
                head = document.head || nTalk('head')[0] || document.documentElement;

            script = $({
                className: id,
                tag: 'script',
                type: 'text/javascript',
                async: 'async',
                src: uri,
                charset: 'utf-8'
            }).appendTo(head);

            //temp debug
            eventName = script.get(0).readyState ? 'onreadystatechange' : 'onload';

            script.get(0)[eventName] = script.get(0).onerror = function(event) {
                var reg = /^(loaded|complete|undefined)$/;
                var readyState = script.get(0).readyState;

                event = $.Event.fixEvent(event);

                if (!reg.test(readyState)) {
                    return;
                }
                //-解除锁定，回收连接
                self.connectionPooling.recover(connect.uri, false);

                //IE下需要timeout延迟ready回调
                if (event.type !== 'error') {
                    setTimeout(function() {
                        self._connectComplete(event, id);
                        script.remove();
                    }, $.browser.msie ? 8E2 : 50);
                } else {
                    self._connectAbnormal(event, id);
                    script.remove();
                }
            };

            this._connectTimeID[id] = setTimeout(function() {
                script.first().remove();

                self._connectTimeout('timeout', id);
            }, +this.options.timeout * 1E3 + 1E4);

            return script.get(0);
        },
        _connectCallback: function(id, args) {
            //$.Log('comet._connectCallback(' + id + ')', 2);
            args = Array.prototype.slice.call(args);

            $('.' + id).remove();

            //2015.03.20 区别超时或已捕获onload|onreadystatechange事件执行_stopCallComplete方法后的callback
            if (!this._cacheElement[id]) {
                this.options.onCallback.apply(self, [false, args]);
            } else {
                this._stopCallComplete(id, 'callback');

                this.options.onCallback.apply(self, [true, args]);
            }
        },
        _connectComplete: function(event, id) {
            //$.Log('comet._connectComplete(' + id + ')', 2);
            var args = Array.prototype.slice.call(arguments);

            if (!this._cacheElement[id]) {
                return;
            }
            this._stopCallComplete(id, 'complete');

            this.options.onComplete.apply(self, [this.connType].concat(args));
        },
        _connectAbnormal: function(event, id) {
            //$.Log('comet._connectAbnormal(' + id + ')', 2);
            var args = Array.prototype.slice.call(arguments);

            if (!this._cacheElement[id]) {
                return;
            }
            this._stopCallComplete(id, 'abnormal');

            this.options.onAbnormal.apply(self, [this.connType].concat(args));
        },
        _connectTimeout: function(event, id) {
            //$.Log('comet._connectTimeout(' + id + ')', 2);
            var args = Array.prototype.slice.call(arguments);

            if (!this._cacheElement[id]) {
                return;
            }
            this._stopCallComplete(id, 'timeout');

            this.options.onTimeout.apply(self, [this.connType].concat(args));
        },
        _stopCallComplete: function(id) {
            var script = this._cacheElement[id];

            if (script) {
                script.onload = script.onreadystatechange = script.onerror = emptyFunc;
            } else {
                $.Log('stop error id:' + id, 3);
            }
            delete this._cacheElement[id];
            clearTimeout(this._connectTimeID[id]);
            delete this._connectTimeID[id];
        },
        /**
         * 通过脚本创建一个PCID
         * @return {String}	返回一个PCID
         */
        _createScriptPCID: function(istemp) {
            return "guest" + [
                istemp ? 'TEMP' + $.randomChar(4) : $.randomChar(8),
                $.randomChar(4),
                $.randomChar(4),
                $.randomChar(4),
                $.randomChar(12)
            ].join("-");
        }
    };

    /*
     * mqtt协议websocket连接
     * @type
     */
    $.mqttws = $.Class.create();
    $.mqttws.prototype = {
        name: 'public.mqttws',
        version: '2015.04.10',
        connect: null,
        subscriptions: [],
        messages: [],
        connected: false,
        recCount: 0,
        waitTime: 500,
        _wsKeepaliveId: null,
        _options: {
            url: null,
            siteid: null,
            pcid: null,
            onCallback: null,
            loginMsg: null,
            timeout: 3,
            keepAliveInterval: 90
        },


        initialize: function(options) {
            var self = this;

            this.options = $.extend({}, self._options, options);
            this.options.pcid = (this.options.siteid + "_" + this.options.pcid.substring(5)).substring(0, 23);

            $.require({
                mqtt: 'mosquitto.js?siteid=' + $.extParmas.siteid
            }, function(mqtt) {
                self.connect = new $.Mosquitto();
                self.connect.onmessage = function(topic, payload, qos, retain) {
                    var data = $.JSON.parseJSON(payload);
                    self.options.onCallback.apply(this, [true, [data.method].concat(data.params)]);
                };
                self.connect.ondisconnect = function(message) {
                    if (this._wsKeepaliveId !== null) {
                        clearInterval(this._wsKeepaliveId);
                        this._wsKeepaliveId = null;
                    }
                };
                self.connect.onconnect = function(rcMsg) {
                    if (rcMsg === 0) {
                        self.connect.subscribe("foo", 0);
                        self.connect.publish("foo", self.options.loginMsg, 0, 0);
                    } else {
                        self.reconnect();
                    }
                };
                self.connect.onreconnect = function() {
                    self.reconnect();
                };
                self.connect.connect(self.options.url, self.options.keepAliveInterval, self.options.pcid);

            });

        },

        reconnect: function() {
            var self = this;
            if (++this.recCount < 3) {
                this._waitTime = 500;
            } else {
                this._waitTime = +("034567890".charAt(Math.ceil(Math.random() * 5))) * 1000;
            }
            setTimeout(function() {
                self.connect.connect(self.options.url, self.options.keepAliveInterval, self.options.pcid);
            }, this._waitTime);
        },

        disconnect: function() {
            this.connect.closeFlag = true;
            this.connect.disconnect();
        },

        kalive: function(aliveMsg) {
            var self = this;
            if (!this._wsKeepaliveId) {
                this._wsKeepaliveId = setInterval(function() {
                    self.connect.publish("foo", aliveMsg, 0, false);
                }, this.options.keepAliveInterval * 1000);
            }
        }

    };

    $.extend({
        /**
         * @method htmlToElement
         * @param  {String} strHTML
         * @return {HTMLElement}
         */
        htmlToElement: function(strHTML) {
            var tElement, rElements;
            if ($.browser.msie) {
                try {
                    tElement = new ActiveXObject('MSXml.DOMDocument');
                    tElement.loadXML(strHTML);
                    rElements = tElement.childNodes;
                } catch (e) {
                    tElement = document.createElement('DIV');
                    tElement.innerHTML = strHTML;
                    rElements = tElement.childNodes;
                }
            } else {
                tElement = document.createElement('DIV');
                tElement.innerHTML = strHTML;
                rElements = tElement.childNodes;
            }
            return rElements;
        },
        /**
         * @method elementToObject
         * @param  {Object|nTalk} elems
         * @return {Object}
         */
        elementToObject: function(elems) {
            var result = {},
                attName, elem;

            if ($.isArray(elems) || elems.talkVersion) {
                elem = elems[0];
            } else {
                elem = elems;
            }
            result[elem.tagName.toLowerCase()] = elem.innerHTML || elem.text;
            if (elem.attributes) {
                for (var i = 0; i < elem.attributes.length; i++) {
                    attName = elem.attributes[i].name;
                    if (attName)(result[attName] = elem.attributes[i].value);
                }
            } else {
                result.msg = elem.textContent;
            }
            return result;
        },
        /**
         * @method jsonToxml
         * @param  {Object|String}   json
         * @return {String}
         */
        jsonToxml: function(json) {
            //Reserved Words: text,attributes
            var self = this,
                returnXml = "",
                temp;
            if (typeof json == "object") {
                $.each(json, function(name, item) {
                    if (typeof item == "string" && name == "text")
                        returnXml = item;
                    else if ($.isArray(json))
                        returnXml += self.jsonToxml(item);
                    else {
                        returnXml += "<" + name;
                        if (typeof item.attributes == "object") {

                            for (var attrName in item.attributes) {

                                if (!item.attributes.hasOwnProperty(attrName)) continue;

                                returnXml += " " + attrName + "=\"" + item.attributes[attrName] + "\"";
                            }
                            delete item.attributes;
                        }
                        temp = self.jsonToxml(item);
                        if (item && temp) returnXml += ">" + temp + "</" + name + ">";
                        else returnXml += ">" + "</" + name + ">";
                    }
                });
            } else {
                return json;
            }
            return returnXml;
        },
        utils: {
            options: {},
            handleLinks: function(html, options, linkPatternType) {
                this.options = $.extend({}, this.options, options);
                html = html || '';

                var linkPattern;

                if (!linkPatternType) {
                    linkPattern = this.linkPatterns;
                } else {
                    linkPattern = this.linkPatternsP4;
                }

                for (var i = 0; i < linkPattern.length; i++) {
                    html = html.replace(linkPattern[i][0], linkPattern[i][1]);
                }
                return html;
            },
            linkPatternsP4: [
                // images
                [
                    /\[link\s+images=[\'\"]+([^\[\]\'\"]+)[\'\"]+\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<img width="324" height="146"  onload="globalChatHandle.scrollHistoryToBottom()" src="$1">'
                ],
                // submitPattern
                [
                    /\[link\s+submit=[\'\"]+([^\[\]\'\"]+)[\'\"]+\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<a class="specil" onclick="NTKF.chatManage.get().send(this.nextSibling.innerHTML, null, this.innerHTML);return false;" href="#">$2</a><span style="display:none;">$1</span>'
                ],
                [
                    /\[link\s+submit=([^\s\[\]\'\"]+)\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<a class="specil" onclick="NTKF.chatManage.get().send(this.nextSibling.innerHTML, null, this.innerHTML);return false;" href="#">$2</a><span style="display:none;">$1</span>'
                ],
                // defalutPattern
                [
                    /\[link\](.*?)\[\/link\]/gi,
                    '<a class="specil" onclick="NTKF.chatManage.get().send(this.innerHTML);return false;" >$1</a>'
                ],
                [
                    /<a class="specil" id="submitLink".*?>.*?<\/a>/gi,
                    function(p) {
                        return p.replace(/(http|ftp|https)/gi, '$1_');
                    }
                ],
                // urlPattern
                [
                    /\[link\s+url=[\'\"]+([^\[\]\'\"]+)[\'\"]+\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<a href="$1" target="_blank">$2</a>'
                ],
                [
                    /\[link\s+url=[\'\"]+([^\[\]\'\"]+)[\'\"]+\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<a href="$1" target="_blank">$2</a>'
                ],
                [
                    /\[link\s+url=([^\s\[\]\'\"]+)\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<a href="$1" target="_blank">$2</a>'
                ],
                // p4Pattern1
                [
                    /\[link\s+p4=[\'\"]+([^\[\]\'\"]+)[\'\"]+\s+title=[\'\"]+([^\[\]\'\"]+)[\'\"]+\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<a href="#" onclick="$client.Activity.openP4(\'$1\',\'$2\');return false;" >$3</a>'
                ],
                [
                    /\[link\s+p4=([^\s\[\]\'\"]+)\s+title=([^\s\[\]\'\"]+)\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<a href="#" onclick="$client.Activity.openP4(\'$1\',\'$2\');return false;" >$3</a>'
                ],
                // p4Pattern2
                [
                    /\[link\s+p4=[\'\"]+([^\[\]\'\"]+)[\'\"]+\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<a href="#" onclick="$client.Activity.openP4(\'$1\',\'$2\');return false;" >$2</a>'
                ],
                [
                    /\[link\s+p4=([^\s\[\]\'\"]+)\s*[^\[\]]*\]([^\[\]]+)\[\/link\]/gi,
                    '<a href="#" onclick="$client.Activity.openP4(\'$1\',\'$2\');return false;" >$2</a>'
                ],
                [
                    /(^|[^"'=])((http|https|ftp):\/\/([\w-]+\.)+[\w-]+([\w-.\/?=;!*%$]*)?([\w-&=;!*%$]*)?)/gi,
                    '$1<a href="$2" target="_new">$2</a>'
                ],
                [
                    /(http|ftp|https)_/gi,
                    '$1'
                ]
            ],
            linkPatterns: [
                //--reconnect
                [
                    /\[link\s+reconnect=([^\s\[\]'"]+)\s*[^\[\]]*]([^\[\]]+)\[\/\s*link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;" href="javascript:void(0);" onclick="nTalk.chatManage.get(\'$1\').reconnect(this);return false;" >$2</a>'
                ],
                //--message
                [
                    /\[link\s+message=([^\s\[\]'"]+)\s*[^\[\]]\s*source=([^\s\[\]'"]+)\s*[^\[\]]*]([^\[\]]+)\[\/\s*link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;font-size:' + ($.browser.mobile ? 14 : 12) + 'px;" href="javascript:void(0);" onclick="nTalk.chatManage.get(\'$1\').switchUI(\'message\', $2);return false;" >$3</a>'
                ],
                //--cancel
                [
                    /\[link\s+cancel=([^\s\[\]'"]+)\s+action=([^\s\[\]'"]+)\s*[^\[\]]*]([^\[\]]+)\[\/\s*link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;" href="javascript:void(0);" onclick="nTalk.chatManage.get(\'$1\').cancelUpload(\'$2\');return false;" >$3</a>'
                ],
                //--resend
                [
                    /\[link\s+resend=([^\s\[\]'"]+)\s+msgid=([^\s\[\]'"]+)\s*[^\[\]]*]([^\[\]]+)\[\/\s*link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;" href="javascript:void(0);" onclick="nTalk.chatManage.get(\'$1\').resend(\'$2\', this);return false;" >$3</a>'
                ],
                //--artificial
                [
                    /\[link\s*manual=([^\s\[\]'"]+)](.*?)\[\/link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;" href="javascript:void(0);" onclick="nTalk.chatManage.get(\'$1\').switchServerType(true);return false;" >$2</a>'
                ],
                [
                    /\[link\s*artificial=([^\s\[\]'"]+)](.*?)\[\/link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;" href="javascript:void(0);" onclick="nTalk.chatManage.get(\'$1\').switchServerType(true);return false;" >$2</a>'
                ],
                //--robot
                [
                    /\[link\s*robot](.*?)\[\/link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;" href="javascript:void(0);" onclick="nTalk.chatManage.get().switchServerType(false, 2);return false;" >$1</a>'
                ],
                //--robotindex
                [
                    /\[link\s*robotindex=([^\s\[\]'"]+)\s*\](.*?)\[\/link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;" href="javascript:void(0);" onclick="nTalk.chatManage.get(\'{$settingid}\').send(\'$1\');return false;">$2</a>'
                ],
                //--xnlink robotindex
                //--rightTag 2016.10.20右侧自定义标签
                [
                    /\[link\s*rightTag=true\s*url="(.*?)"\s*close=(.*?)\s*title="(.*?)"\s*\](.*?)\[\/link\]/gi,
                    '<span style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;cursor:pointer;" rightTag="true" src="$1" closeBtn="$2" title="$3">$4</span>'
                ],
                [
                    ///\[xnlink\s*robotindex=([^\s\[\]'"]+)\s*\](.*?)\[\/xnlink]/gi,
                    /\[xnlink](.*?)\[\/xnlink]/gi,
                    '<span class="robotQuestion" style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;cursor:pointer;" href="javascript:void(0);" >$1</span>'
                ],
                //--link
                [
                    /\[link\s*href=(.*?)](.*?)\[\/link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;cursor:pointer;" href="$1">$2</a>'
                ],
                //--blank link
                [
                    /\[link\s*(.*?)?](.*?)\[\/link]/gi,
                    '<a style="' + $.STYLE_BODY + 'display:inline-block;color:#005ffb;text-decoration:none;cursor:pointer;" href="javascript:void(0);"' + ($.browser.iOS ? ' href="$1" target="_blank"' : ' onclick="window.open(\'$1\')"') + '>$2</a>'
                ],
                //--other
                [
                    /\{\$(\w+)}/gi,
                    function(a, n) {
                        return $.utils.options[n] || '';
                    }
                ]
            ]
        },
        toHSL: function(c) {
            if ($.isHex(c)) return $.rgb2HSL($.hex2RGB(c));
            if ($.isRGB(c)) return $.rgb2HSL(c);
            else return c;
        },
        isHex: function(c) {
            return typeof(c) == 'string' && /^#?([0-9a-f]{3}|[0-9a-f]{6})$/ig.test(c);
        },
        isRGB: function(c) {
            return $.isObject(c) && $.isDefined(c.r) && $.isDefined(c.g) && $.isDefined(c.b);
        },
        isHSL: function(c) {
            return $.isObject(c) && $.isDefined(c.h) && $.isDefined(c.s) && $.isDefined(c.l);
        },
        hex2RGB: function(sHex) {
            var c = sHex.toString().replace('#', ''),
                a = c.split(''),
                oRGB = {};
            if (c.length == 3) {
                oRGB = {
                    r: parseInt(a[0] + a[0], 16),
                    g: parseInt(a[1] + a[1], 16),
                    b: parseInt(a[2] + a[2], 16)
                };

            } else if (c.length == 6) {
                oRGB = {
                    r: parseInt(a[0] + a[1], 16),
                    g: parseInt(a[2] + a[3], 16),
                    b: parseInt(a[4] + a[5], 16)
                };
            } else {
                oRGB = {
                    r: 0,
                    g: 0,
                    b: 0
                };
            }
            return oRGB;
        },
        rgb2HSL: function(oRGB) {
            var R, G, B, del_R, del_G, del_B, Min, Max, del_Max, oHSL = {};
            R = (oRGB.r / 255);
            G = (oRGB.g / 255);
            B = (oRGB.b / 255);
            Min = Math.min(R, G, B);
            Max = Math.max(R, G, B);
            del_Max = Max - Min;
            oHSL.l = (Max + Min) / 2;
            if (del_Max === 0) {
                oHSL.h = 0;
                oHSL.s = 0;
            } else {
                if (oHSL.l < 0.5) oHSL.s = del_Max / (Max + Min);
                else oHSL.s = del_Max / (2 - Max - Min);
                del_R = (((Max - R) / 6) + (del_Max / 2)) / del_Max;
                del_G = (((Max - G) / 6) + (del_Max / 2)) / del_Max;
                del_B = (((Max - B) / 6) + (del_Max / 2)) / del_Max;
                if (R == Max) oHSL.h = del_B - del_G;
                else if (G == Max) oHSL.h = (1 / 3) - del_B + del_R;
                else if (B == Max) oHSL.h = (2 / 3) - del_R + del_G;
                if (oHSL.h < 0) oHSL.h += 1;
                if (oHSL.h > 1) oHSL.h -= 1;
            }
            return oHSL;
        }
    });
    /**
     * Element方法扩展
     * @type {object}
     */
    $.fn.extend({
        animate: function(options, duration, callback) {
            return $.each(this, function(i, elem) {
                $.animate(elem, options, duration, callback);
            });
        },
        show: function(duration, callback) {
            if ($.isFunction(duration)) {
                callback = duration;
                duration = 500;
            }
            return this.animate({
                visibility: "visible",
                opacity: {
                    from: 0,
                    to: 1
                }
            }, duration || 500, callback);
        },
        hide: function(duration, callback) {
            if ($.isFunction(duration)) {
                callback = duration;
                duration = 500;
            }
            return this.animate({
                opacity: {
                    to: 0
                }
            }, duration || 500, callback);
        },
        /**
         * 渐变
         * @param  {String} direction 方向
         * @param  {String} scolor    开始颜色
         * @param  {String} ecolor    结束颜色
         * @return {Object}
         */
        gradient: function(direction, scolor, ecolor) {
            var dp, c;
            if (!direction) {
                return $.each(this, function(i, element) {
                    if ($.browser.oldmsie)
                        $(element).css('filter', 'none');
                    else
                        $(element).css('background-image', 'none');
                });
            } else {
                return $.each(this, function(i, element) {
                    if ($.browser.oldmsie) {
                        dp = /top|bottom/.test(direction) ? 0 : 1;
                        if (/right|bottom/.test(direction)) {
                            c = scolor;
                            scolor = ecolor;
                            ecolor = c;
                        }
                    }
                    if ($.browser.webkit) {
                        switch (direction) {
                            case 'top':
                                dp = '0% 100%,0% 0%';
                                break;
                            case 'right':
                                dp = '0% 0%,100% 0%';
                                break;
                            case 'bottom':
                                dp = '0% 0%,0% 100%';
                                break;
                            case 'left':
                                dp = '100% 0%,0% 0%';
                                break;
                        }
                        $(element).css('background-image', (!direction ? 'none' : '-webkit-gradient(linear,' + dp + ',color-stop(1, ' + scolor + '),color-stop(0, ' + ecolor + '))'));
                    } else if ($.browser.gecko) {
                        $(element).css('background-image', (!direction ? 'none' : '-moz-linear-gradient(' + direction + ', ' + scolor + ', ' + ecolor + ')'));
                    } else if ($.browser.oldmsie) {
                        var gradientExp = /progid:DXImageTransform\.Microsoft\.gradient\((.*?)\)\s*/gi;
                        element.style.filter = element.currentStyle.filter.replace(gradientExp, '') + (!direction ? '' : " progid:DXImageTransform.Microsoft.gradient(GradientType=" + dp + ",startColorstr='" + scolor + "', endColorstr='" + ecolor + "')");
                    } else if ($.browser.msie) {
                        $(element).css('background-image', (!direction ? 'none' : '-ms-linear-gradient(' + direction + ', ' + scolor + ', ' + ecolor + ')'));
                    } else {
                        $(element).css('background-image', (!direction ? 'none' : 'linear-gradient(' + direction + ', ' + scolor + ', ' + ecolor + ')'));
                    }
                });
            }
        }
    });

    $.extend({
        base64: {
            _strKey: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function(input) {
                var self = $.base64;
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = self._utf8_encode(input || '');
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output + self._strKey.charAt(enc1) + self._strKey.charAt(enc2) + self._strKey.charAt(enc3) + self._strKey.charAt(enc4);
                }
                return output;
            },
            decode: function(input) {
                var self = $.base64;
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                input = (input || '').replace(/[^A-Za-z0-9\+\/=]/g, "");
                while (i < input.length) {
                    enc1 = self._strKey.indexOf(input.charAt(i++));
                    enc2 = self._strKey.indexOf(input.charAt(i++));
                    enc3 = self._strKey.indexOf(input.charAt(i++));
                    enc4 = self._strKey.indexOf(input.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output = output + String.fromCharCode(chr1);
                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                }
                output = self._utf8_decode(output);
                return output;
            },
            _utf8_encode: function(string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            },
            _utf8_decode: function(utftext) {
                var string = "";
                var i = 0;
                var c, c2, c3;
                while (i < utftext.length) {
                    c = utftext.charCodeAt(i);
                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if ((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i + 1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i + 1);
                        c3 = utftext.charCodeAt(i + 2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                return string;
            }
        },
        FORM: { //form
            /**
             * 20150310 label添加默认文本样式
             */
            createInput: function(cfgRequiredField, appendTdParams, noNullChar) {
                var trHtml = [],
                    formField, option, checked, formTitle,
                    mobile = $.browser.mobile,
                    appendTd = $.extend({
                        id: '',
                        rowspan: 0,
                        style: ''
                    }, appendTdParams),
                    required = '<span class="ntkf-text-red" style="' + $.STYLE_BODY + 'padding:2px 5px 2px 0;color:#f00;">' + (noNullChar || '') + '</span>';
                for (var i = 0; i < cfgRequiredField.length; i++) {
                    formField = $.extend({
                        titlewidth: '80px',
                        inputwidth: 'auto',
                        input: {
                            width: '90%',
                            height: 'auto'
                        }
                    }, cfgRequiredField[i]);
                    //单选、复选默认为单行，可配置为多行
                    if (!mobile) {
                        formTitle = formField.title + (formField.title.length == $.enLength(formField.title) ? ':' : '\uff1a');
                    } else {
                        formTitle = formField.title;
                    }
                    //2015.09.19 mobile需要显示标题
                    if ((/zh_cn|zh_tw/.test($.lang.language) && $.enLength(formField.title) > 16) || formField.multipart || (/radio|checkbox/.test(formField.type) && formField.options.length > 2)) {
                        formField.multipart = true;
                        trHtml.push(mobile ? '<tr style="' + $.STYLE_BODY + '">' +
                            '<td style="' + $.STYLE_BODY + 'width:100%;"><div class="nt-mobile-form-title" style="' + $.STYLE_BODY + 'width:100%; line-height:14px; font-size:14px; font-weight:bold; text-align:center; color:#333333; margin: 15px 0px 20px 0px">' + formTitle + '</div>' : [
                                '<tr style="', $.STYLE_BODY, '">',
                                '<td style="', $.STYLE_BODY, 'vertical-align:top;line-height:28px;color:#333;" colspan="2">',
                                '<div style="', $.STYLE_BODY, 'margin:5px 10px 5px 10px;color:#5a5a5a;">', formTitle, (formField.required === true ? required : ''), '</div>',
                                '</td>',
                                '</tr>',
                                '<tr style="' + $.STYLE_BODY + '"><td style="', $.STYLE_BODY, 'padding:0 5px 0 0;text-align:right;vertical-align:top;line-height:28px;color:#333;"></td>',
                                '<td style="' + $.STYLE_BODY + 'line-height:28px;width:' + formField.inputwidth + ';">'
                            ].join(''));
                    } else {
                        trHtml.push('<tr style="' + $.STYLE_BODY + '">' +
                            (mobile ? '' :
                                '<td style="' + $.STYLE_BODY + 'padding:0 5px 0 0;text-align:right;vertical-align:top;line-height:28px;color:#333;width:' + formField.titlewidth + ';">' +
                                '<div style="' + $.STYLE_BODY + 'margin:4px 0 0 0;text-align:right;color:#5a5a5a;">' + (formField.required === true ? required : '') + formTitle + '</div></td>'
                            ) + '<td style="' + $.STYLE_BODY + 'line-height:28px;width:' + (mobile ? '100%' : formField.inputwidth) + ';">');
                    }
                    switch (formField.type) {
                        case 'select':
                            trHtml.push('<select data-index="' + i + '" name="' + formField.name + '" style="' + $.STYLE_BODY + 'border:1px solid #ccc;height:24px;color:#333;margin:0 0 4px;line-height:20px;width:' + (mobile ? '99%' : formField.input.width) + ';">');
                            trHtml.push('<option value="" style="' + $.STYLE_BODY + 'color:#ccc;">' + formField.defaultText + '</option>');
                            for (var ii = 0; ii < formField.options.length; ii++) {
                                option = formField.options[ii];
                                option = typeof(option) == "string" ? {
                                    text: option,
                                    value: option
                                } : option;
                                trHtml.push('<option value="' + option.value + '" style="' + $.STYLE_BODY + 'color:#333;">' + option.text + '</option>');
                            }
                            trHtml.push('</select>');
                            break;
                        case 'radio':
                            trHtml.push('<ul style="' + $.STYLE_BODY + 'list-style:none;">');
                            for (var j = 0, radioId; j < formField.options.length; j++) {
                                option = formField.options[j];
                                option = typeof(option) == "string" ? {
                                    text: option,
                                    value: option
                                } : option;
                                radioId = formField.name + '_' + j;
                                checked = formField.defaultText == option.value ? ' checked' : '';
                                // nt6.92 添加默认样式 -webkit-appearance:radio 防止被客户网站的 none 导致评价单选不显示
                                trHtml.push('<li class="form-item" style="' + $.STYLE_BODY + 'list-style:none;padding:0 2px 0 0;color:#000;float:left;">' +
                                    '<input type="radio" name="' + formField.name + '"id="' + radioId + '" value="' + option.value + '" _custom_text="' + option.text + '" style="' + $.STYLE_BODY + 'color:#333;outline:none;-webkit-appearance:radio"' + checked + ' />' +
                                    '<label for="' + radioId + '" style="' + $.STYLE_BODY + 'display:inline;color:#000;">' + option.text + '</label></li>');
                            }
                            trHtml.push('<li style="' + $.STYLE_BODY + 'list-style:none;clear:both;width:0;height:0;"></li>');
                            trHtml.push('</ul>');
                            break;
                        case 'checkbox':
                            trHtml.push('<ul style="' + $.STYLE_BODY + 'list-style:none;">');
                            for (var k = 0, checkboxId; k < formField.options.length; k++) {
                                option = formField.options[k];
                                option = typeof(option) == "string" ? {
                                    text: option,
                                    value: option
                                } : option;
                                checkboxId = formField.name + '_' + k;
                                checked = formField.defaultText == option.value ? ' checked' : '';
                                trHtml.push('<li class="form-item" style="' + $.STYLE_BODY + 'list-style:none;padding:0 2px 0 0;float:left;">' +
                                    '<input type="checkbox" name="' + formField.name + '" id="' + checkboxId + '" value="' + option.value + '" _custom_text="' + option.text + '" style="' + $.STYLE_BODY + 'color:#333;"' + checked + ' />' +
                                    '<label for="' + checkboxId + '" style="' + $.STYLE_BODY + 'display:inline;color:#000;">' + option.text + '</label></li>');
                            }
                            trHtml.push('<li style="' + $.STYLE_BODY + 'list-style:none;clear:both;width:0;height:0;"></li>');
                            trHtml.push('</ul>');
                            break;
                        case 'textarea':
                            trHtml.push('<textarea data-index="' + i + '" name="' + formField.name + '" style="' + $.STYLE_BODY + 'border:1px solid #ccc;color:#ccc;width:' + (mobile ? '99%' : formField.input.width) + ';height:' + formField.input.height + ';"' + ($.browser.html5 ? ' placeholder="' + formField.defaultText + '">' : '>' + formField.defaultText) + '</textarea>');
                            break;
                        default:
                            trHtml.push('<input data-index="' + i + '" type="text" name="' + formField.name + '"' + ($.browser.html5 ? ' placeholder="' + formField.defaultText + '" value=""' : ' value="' + formField.defaultText + '"') + ' maxlength="32" style="' + $.STYLE_BODY + 'border:1px solid #ccc;height:24px;width:' + (mobile ? '99%' : formField.input.width) + ';margin:0 0 4px;color:#ccc;"');
                            if (formField.verification == 'phone') {
                                trHtml.push(' onblur="this.value=this.value.replace(\/[^0-9-]+\/, \'\');" onkeyup="var keyCode=(event || window.event).keyCode; if( !/16|17|35|36|37|38|39|40/i.test(keyCode) ){this.value=this.value.replace(/[^0-9-]+/, \'\');}"');
                            }
                            trHtml.push(' />');
                            break;
                    }
                    if (formField.messageid) {
                        trHtml.push('<div style="' + $.STYLE_BODY + 'display:none;color:#EF7208;" class="form-info ' + formField.messageid + '">');
                        trHtml.push('<div style="' + $.STYLE_BODY + 'margin:2px;width:15px;height:15px;float:left;background:transparent url(' + $.sourceURI + '/images/chaticon.png) no-repeat -160px -39px;"></div>');
                        trHtml.push('<div style="' + $.STYLE_BODY + 'color:#EF7208;float:left;" class="chat-view-info"></div>');
                        trHtml.push('<div style="' + $.STYLE_BODY + 'clear:both;width:0;height:0;"></div>');
                        trHtml.push('</div>');
                    }
                    trHtml.push('</td>');
                    if (appendTd.style && i === 0) {
                        trHtml.push('<td style="' + $.STYLE_BODY + appendTd.style + '" id="' + appendTd.id + '" rowspan="' + appendTd.rowspan + '"></td></tr>');
                    }
                }
                return trHtml.join('');
            },
            bindFormEvent: function(cfgRequiredField, parent) {
                var focusfunc = function() {
                    var element = $(this).css({
                            'color': '#333',
                            'border-color': $.browser.mobile ? '#0079fe' : '#666'
                        }),
                        index = element.attr('data-index') || 0,
                        def = cfgRequiredField[index].defaultText;
                    if (def == element.val())
                        element.val('');
                }

                var blurfunc = function() {
                    var element = $(this).css('border-color', '#ccc'),
                        index = element.attr('data-index') || 0,
                        def = cfgRequiredField[index].defaultText;
                    if (element.val() === '')
                        element.val(def);
                    if (element.val() === '' || element.val() == def) {
                        element.css('color', '#ccc');
                    }
                }

                $(parent).find('input[type=text]').bind('focus', focusfunc).bind('blur', blurfunc);
                $(parent).find('textarea').bind('focus', focusfunc).bind('blur', blurfunc);
            },
            /**
             * 2015.11.01 提取公用的showError方法，分PC，mobile分别处理
             * 2016.04.20 添加验证失败回调
             * @method verificationForm
             * @param {Object}   fields
             * @param {Function} fnCallback
             * @param {HTMLElement} parentElement
             * @param {Function}  failCallback
             * @retrun {void}
             * */
            verificationForm: function(fields, fnCallback, parentElement, failCallback) {
                var element, selectElem, isNull, returnValue = [],
                    showNews, value,
                    failFlag = false,
                    phone = new RegExp("\\d{6,}", 'i'),
                    email = new RegExp("^[a-zA-Z0-9\\._-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$", 'i'),
                    self = this,
                    tmpFunc = function(ii, element) {
                        if (!element.checked) return;
                        value = {
                            value: $(element).val() || '',
                            text: $(element).attr('_custom_text')
                        };
                    },
                    displayFunc = function() {
                        $(this).display();
                    };
                for (var i = 0; i < fields.length; i++) {
                    switch (fields[i].type) {
                        case 'checkbox':
                            value = [];
                            element = $(parentElement).find('input[name=' + fields[i].name + "]");
                            selectElem = $(parentElement).find('input[name=' + fields[i].name + "][checked]");
                            for (var j = 0; j < selectElem.length; j++)
                                value.push({
                                    value: selectElem.get(j).value,
                                    text: $(selectElem.get(j)).attr('_custom_text')
                                });
                            break;
                        case 'radio':
                            value = {
                                value: '',
                                text: ''
                            };
                            element = $(parentElement).find('input[name=' + fields[i].name + "]");
                            //2014.09.22
                            //IE8下选择器返回的表单项包括默认选项与当前选项
                            $(parentElement).find('input[name=' + fields[i].name + "][checked]").each(tmpFunc);
                            break;
                        case 'select':
                            element = $(parentElement).find('select[name=' + fields[i].name + "]");
                            value = $("option[selected]", element).val() || '';
                            value = fields[i].defaultText && value == fields[i].defaultText ? '' : value;
                            break;
                        case 'textarea':
                            element = $(parentElement).find('textarea[name=' + fields[i].name + "]");
                            if (fields[i].defaultText && fields[i].defaultText == element.val()) {
                                value = '';
                                element.val('');
                            } else
                                //2017.04.18在敦煌的bug中发现当评价的输入框中存在引号时或造成评价失败，原因是服务端无法解析，提交的时候，引号直接去掉。
                                value = element.val().replace(/(\")|(\')|((^\s*)|(\s*$))/g, "");
                            break;
                        default:
                            element = $(parentElement).find('input[name=' + fields[i].name + "]");
                            if (fields[i].defaultText && fields[i].defaultText == element.val()) {
                                value = '';
                                element.val('');
                            } else
                                value = element.val().replace(/(^\s*)|(\s*$)/g, "");
                    }
                    if (typeof(value) == 'string') {
                        isNull = value === '' || !value.length;
                    } else if ($.isArray(value)) {
                        isNull = value.length === 0;
                    } else {
                        isNull = value.value === '';
                    }

                    showNews = fields[i].messageid && fields[i].message ? true : false;
                    var infodiv = $(parentElement).find('.' + fields[i].messageid);
                    var info = $(parentElement).find('.' + fields[i].messageid + ' .chat-view-info');
                    if (fields[i].required && isNull) {
                        self.showError(showNews, fields[i].message[0], info, infodiv, element, fields[i].type);
                        failFlag = true;
                    } else if (fields[i].verification == 'phone' && !isNull && !phone.test(value)) {
                        self.showError(showNews, fields[i].message[1], info, infodiv, element);
                        failFlag = true;
                    } else if (fields[i].verification == 'email' && !isNull && !email.test(value)) {
                        self.showError(showNews, fields[i].message[1], info, infodiv, element);
                        failFlag = true;
                    } else if (fields[i].min && !isNull && $.enLength(value) < fields[i].min) {
                        self.showError(showNews, fields[i].message[1], info, infodiv, element);
                        failFlag = true;
                    } else if (fields[i].max && !isNull && $.enLength(value) > fields[i].max) {
                        self.showError(showNews, fields[i].message[2], info, infodiv, element);
                        failFlag = true;
                    } else {
                        if (showNews) { /*jshint -W030 */
                            infodiv.hide(displayFunc);
                        } else if (/radio|checkbox/.test(fields[i].type))
                            element.parent().css('color', '#333');
                        else
                            element.css('border-color', '#DBD8D1');
                        if (!isNull) returnValue.push({
                            name: fields[i].name,
                            title: fields[i].title,
                            value: value
                        });
                    }
                }
                if (failFlag) {
                    if (typeof(failCallback) == 'function') failCallback();
                    return;
                } else {
                    $.Log('form submit complete, failCallback is null', 3);
                }
                if (typeof(fnCallback) == 'function') {
                    fnCallback(returnValue);
                } else {
                    $.Log('form submit complete, callback is null', 3);
                }
            },

            /**
             * 2015.11.01 公用的显示错误信息的方法
             * PC端延续旧版的处理
             * 移动端采用Toast弹出的方式来提示信息
             * 2016.05.05
             * 新增type参数
             */
            showError: function(showNews, message, info, infodiv, element, type) {
                var self = this;
                if (showNews && message) {
                    if (!$.browser.mobile) {
                        info.html(message);
                        infodiv.display(1).show();
                        element.get(0).focus();
                    } else {
                        if (this.messageErrorToast) {
                            this.messageErrorToast.remove();
                            this.messageErrorToast = null;
                            if (this.messageErrorTimeout)
                                clearTimeout(this.messageErrorTimeout);
                        }
                        var width = message.length > 10 ? 300 : 250;
                        this.messageErrorToast = new $.Toast('<div id="#message_error" style="position: relative;width: ' + (width - 50) + 'px; height:30px; line-height: 30px;z-index:100; color: #FFF; top: 30px; left: 25px; text-align:center;font-weight:bold">' + message + '</div>', {
                            width: width,
                            height: 90
                        });
                        this.messageErrorTimeout = setTimeout(function() {
                            self.messageErrorToast.remove();
                            self.messageErrorToast = null;
                            element.get(0).focus();
                        }, 2000);
                    }
                } else if (/radio|checkbox/.test(type)) {
                    element.parent().css('color', '#f00');
                } else {
                    element.css('border-color', '#f00').get(0).focus();
                }
            }
        }
    });

    /**
     * 跨域文件上传
     * @type {[type]}
     */
    $.Transfer = $.Class.create();
    $.Transfer.prototype = {
        name: 'Transfer',
        button: null,
        element: null,
        form: null,
        iframe: null,
        proxy: null,
        options: null,
        debug: true,
        fkey: "",
        initialize: function(options, button) {
            this.button = button;

            var tmpName = $.randomChar(16);
            //去掉maxsize与accept的默认传值
            this.options = $.extend({
                onError: emptyFunc,
                onChange: emptyFunc,
                callback: emptyFunc,
                name: tmpName,
                curName: '',
                compSize: 1024 * 500,
                params: {},
                target: 'iframe-transfer-' + tmpName
            }, options);

            if (!this.options.server) {
                $.Log('server is null', 3);
                return;
            }
            this.proxy = $({
                tag: 'IFRAME',
                name: "proxy-" + tmpName,
                src: this.options.server.substring(0, this.options.server.lastIndexOf('/')) + '/proxy.html?t=' + $.getTime(),
                style: $.STYLE_NBODY + 'width:0px;height:0px;display:none;'
            }).appendTo($(this.button)).get(0).contentWindow;

            var self = this,
                width = Math.max(20, this.button.width(), parseFloat(this.button.css('width'))),
                height = Math.max(20, this.button.height(), parseFloat(this.button.css('height'))),
                style = $.STYLE_BODY + 'width:' + width + 'px;height:' + height + 'px;overflow:hidden;';

            this.completed = function(event) {
                var reg = /^(?:loaded|complete|undefined)$/;
                var readyState = this.readyState;

                if (!reg.test(readyState)) return;
                self.iframe.removeEvent('readystatechange', self.completed).removeEvent('load', self.completed);
                self.transferComplete(event, self.fkey);
            };

            this.form = $({
                tag: 'FORM',
                action: '',
                method: 'POST',
                target: this.options.target,
                enctype: 'multipart/form-data',
                style: style
            }).appendTo(this.button, true);
            this.iframe = $({
                tag: 'IFRAME',
                name: this.options.target,
                src: 'about:blank',
                style: style + 'width:0;height:0;display:none;'
            }).appendTo(this.button, true);
            //允许所有类型的文件
            this.element = $({
                tag: 'INPUT',
                type: 'file',
                name: this.options.name,
                accept: this.options.accept || '*',
                style: style,
                title: this.button.attr('title') || ''
            }).appendTo(this.form, true).css('opacity', 0);

            this.element.click(function() {
                //input value
                if (this.value !== '') {
                    self.form.get(0).reset();
                }
                self.iframe.bind('readystatechange', self.completed).bind('load', self.completed);
                self.fkey = $.randomChar(16);
            }).bind('change', function(event) {
                //获取文件信息，在onChange中通知视图js，此次上传的文件名和大小
                var fileInfo = {};
                if (!this.files) {
                    fileInfo.name = this.value.substring(this.value.lastIndexOf('\\') + 1);
                    fileInfo.size = "";
                } else {
                    fileInfo.name = this.files[0].name;
                    fileInfo.size = this.files[0].size;
                }
                if (fileInfo.name) {
                    self.options.onChange(fileInfo);
                    self.fileChange(event, this.files || this.value);
                }
            });
        },
        /**
         * @method transferComplete
         * @param  {Event}    event
         * @param  {String}   fkey
         * @return {void}
         */
        transferComplete: function(event, fkey) {
            var self = this;
            if (!fkey) {
                return;
            }
            if (this.debug) {
                $.Log('$.upload.transferComplete(event, ' + fkey + ')');
            }
            $.jsonp(this.options.server + '?' + $.toURI($.extend({
                "getaction": 1,
                "fkey": fkey
            }, this.options.params)) + '#rnd', function(data) {
                if (self.debug) {
                    $.Log('get transfer file info:' + $.JSON.toJSONString(data), 1);
                }
                data.name = self.options.curName || self.options.name || '';
                self.options.callback(data);
            });
        },
        /**
         * @method fileChange 选择文件后上传
         * @param  {Event}      event Event对你
         * @param  {Object} files 文件对像或文件地址
         */
        fileChange: function(event, files) {
            var self = this;
            this.isMobileCompTransf(files, function(mFlag) {
                if (mFlag) {
                    if ($.browser.oldAndroid) {
                        $.require('jpeg_encoder_basic.js?siteid=' + self.options.params.siteid, function(encode) {
                            self.mobileCompTransf(event, files);
                        });
                    } else if ($.browser.oldIOS) {
                        $.require('megapix-image.js?siteid=' + self.options.params.siteid, function(encode) {
                            self.mobileCompTransf(event, files);
                        });
                    } else {
                        self.mobileCompTransf(event, files);
                    }
                } else {
                    self.commonTransf(event, files);
                }
            });
        },

        /**
         * 是否采用移动端压缩后上传
         * 2015.10.12 添加toLowerCase,防止大写JPG文件不压缩直接上传
         */
        isMobileCompTransf: function(files, callback) {
            if ($.browser.mobile && (window.URL || window.webkitURL) &&
                document.createElement('canvas')) {
                if (files[0].name.toLowerCase().indexOf('jpg') > -1) {
                    callback(true);
                } else if (window.FileReader && window.DataView) {
                    var self = this;
                    var fileReader = new FileReader();
                    fileReader.onload = function(e) {
                        var dataView = new DataView(e.target.result);
                        if (dataView.getUint8(0) == 0xFF && dataView.getUint8(1) == 0XD8) {
                            callback(true);
                        } else {
                            callback(false);
                        }
                    };
                    fileReader.readAsArrayBuffer(files[0]);
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        },

        /**
         * 普通上传
         * 2015.11.01 发送startUpload的状态回调
         */
        commonTransf: function(event, files) {
            //2015.11.08 判断上传文件还是图片
            var fileAction = this.options.params.action == 'uploadfile' ? true : false;
            var proxyMaxSize, proxyExt;
            try {
                proxyMaxSize = fileAction ? this.proxy.fileOptions.fileMaxSize : this.proxy.fileOptions.imageMaxSize;
                proxyExt = fileAction ? this.proxy.fileOptions.fileExt : this.proxy.fileOptions.imageExt;
            } catch (e) {
                proxyMaxSize = null;
                proxyExt = null;
            }

            var accept;
            if (typeof files === 'string') {
                if (this.debug) $.Log("Name: " + files, 2);
            } else {
                for (var reg, i = 0; i < files.length; i++) {
                    var file = files[i],
                        ext;
                    if (file.name.indexOf('.') > -1) {
                        ext = file.name.match(/\.[^\.]+$/)[0].replace(".", "").toLowerCase();
                    } else {
                        ext = "";
                    }
                    if ((this.options.maxSize && file.size > this.options.maxSize) || (proxyMaxSize && file.size > proxyMaxSize)) {
                        this.options.onError({
                            type: 9,
                            name: file.name,
                            size: file.size,
                            etype: 'SIZE',
                            maxSize: this.options.maxSize || proxyMaxSize
                        });
                        return;
                    }
                    if ((this.options.accept == '*' || !this.options.accept) && !proxyExt) {
                        //不限制
                        continue;
                    } else if (this.options.accept && this.options.accept.indexOf('/*') > -1) {
                        reg = new RegExp(this.options.accept.replace(/\//, '\\/'), 'gi');
                        if (!reg.test(file.type)) {
                            $.Log('accept:' + this.options.accept + ', type:' + file.type, 2);
                            this.options.onError({
                                type: 9,
                                name: file.name,
                                size: file.size,
                                etype: 'TYPE'
                            });
                            return;
                        }
                    } else if (this.options.accept && this.options.accept.indexOf(file.type) <= -1) {
                        $.Log('accept:' + this.options.accept + ', type:' + file.type, 2);
                        this.options.onError({
                            type: 9,
                            name: file.name,
                            size: file.size,
                            etype: 'TYPE'
                        });
                        return;
                    } else if (proxyExt && proxyExt.indexOf(ext) > -1) {
                        continue;
                    } else if (proxyExt && proxyExt.indexOf(ext) == -1) {
                        this.options.onError({
                            type: 9,
                            name: file.name,
                            size: file.size,
                            ext: proxyExt,
                            etype: 'TYPE'
                        });
                        return;
                    }
                    this.options.curName = file.name;
                    if (this.debug) $.Log("Name: " + this.options.curName);
                }
            }
            if (this.debug) {
                $.Log('$.upload.fileChange()');
            }
            this.form.attr('action', this.options.server + '?' + $.toURI($.extend({
                fkey: this.fkey,
                rnd: $.getTime()
            }, this.options.params)));

            //手机上需要发送正在上传状态
            if ($.browser.mobile) {
                this.options.callback({
                    status: 'startUpload',
                    oldfile: files[0].name
                });
            }

            this.form.get(0).submit();
        },

        /**
         * 移动端图片压缩后上传
         * 2015.11.01
         *   发送startCompress的状态回调
         *   发送startUpload的状态回调
         *   将formData转为对象的属性，便于重新上传
         */
        mobileCompTransf: function(event, files) {
            var self = this;
            this.options.callback({
                status: 'startCompress',
                oldfile: files[0].name
            });
            this.fkey = $.getTime();
            //获取图片方向后，回调生成压缩图片方法
            var Oriention = new $.ImageOrientation(files[0], function(event, orientation) {
                //获得压缩后的图片的base64 url后，发送到服务端
                var compImg = new $.CompressImg(files[0], {
                    'orientation': orientation
                }, function(event, dataurl) {
                    //使用base64进行上传
                    new $.POST(self.options.server + '?action=uploadimage', $.extend({
                        base64: dataurl,
                        fname: $.getTime() + '.png',
                        fkey: self.fkey,
                        rnd: $.getTime()
                    }, self.options.params), function(e) {
                        self.transferComplete(e, self.fkey);
                    });

                    self.options.callback({
                        status: 'startUpload',
                        oldfile: files[0].name,
                        compress: true
                    });
                });
            });

        },

        base64Transf: function(dataurl) {
            var self = this;
            this.fkey = $.getTime();
            new $.POST(this.options.server + '?action=uploadimage', $.extend({
                base64: dataurl,
                fname: $.getTime() + '.png',
                fkey: this.fkey,
                rnd: $.getTime()
            }, this.options.params), function(e) {
                self.transferComplete(e, self.fkey);
            });
        }
    };

    $.CompressImg = $.Class.create();
    $.CompressImg.prototype = {
        ctx: null,
        canvas: null,
        url: null,
        image: null,
        blob: null,
        compBlob: null,
        dataurl: null,
        resize: {
            width: null,
            height: null
        },
        options: {
            width: null,
            height: null,
            quality: 0.7
        },

        initialize: function(file, options, callback) {
            var self = this;
            this.url = window.URL || window.webkitURL;
            this.canvas = document.createElement('canvas');
            this.blob = (typeof file === 'string') ? file : this.url.createObjectURL(file);
            this.options = $.extend(options, this.options);
            this.image = new Image();
            this.image.onerror = function() {
                $.Log('加载图片失败！');
            };

            this.image.onload = function(e) {

                self.getCompImage();

                callback(e, self.dataurl);

                var timeout = $.browser.oldIOS ? 10000 : 0;

                setTimeout(function() {
                    // 释放内存
                    for (var p in self) {
                        if (!self.hasOwnProperty(p)) continue;

                        self[p] = null;
                    }
                }, timeout);
            };

            this.image.crossOrigin = "*";

            this.image.src = self.blob;
        },

        drawOldIOSCanvas: function() {
            var mpImg = new MegaPixImage(this.image);

            if ("5678".indexOf(this.options.orientation) > -1) {
                mpImg.render(this.canvas, {
                    width: this.canvas.height,
                    height: this.canvas.width,
                    orientation: this.options.orientation
                });
            } else {
                mpImg.render(this.canvas, {
                    width: this.canvas.width,
                    height: this.canvas.height,
                    orientation: this.options.orientation
                });
            }
        },

        drawCanvas: function() {
            var self = this;
            switch (self.options.orientation) {
                case 3:
                    this.ctx.rotate(180 * Math.PI / 180);
                    this.ctx.drawImage(this.image, -this.resize.width, -this.resize.height, this.resize.width, this.resize.height);
                    break;
                case 6:
                    this.ctx.rotate(90 * Math.PI / 180);
                    this.ctx.drawImage(this.image, 0, -this.resize.width, this.resize.height, this.resize.width);
                    break;
                case 8:
                    this.ctx.rotate(270 * Math.PI / 180);
                    this.ctx.drawImage(this.image, -this.resize.height, 0, this.resize.height, this.resize.width);
                    break;
                case 2:
                    this.ctx.translate(resize.width, 0);
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(this.image, 0, 0, this.resize.width, this.resize.height);
                    break;
                case 4:
                    this.ctx.translate(resize.width, 0);
                    this.ctx.scale(-1, 1);
                    this.ctx.rotate(180 * Math.PI / 180);
                    this.ctx.drawImage(this.image, -this.resize.width, -this.resize.height, this.resize.width, this.resize.height);
                    break;
                case 5:
                    this.ctx.translate(resize.width, 0);
                    this.ctx.scale(-1, 1);
                    this.ctx.rotate(90 * Math.PI / 180);
                    this.ctx.drawImage(this.image, 0, -this.resize.width, this.resize.height, this.resize.width);
                    break;
                case 7:
                    this.ctx.translate(resize.width, 0);
                    this.ctx.scale(-1, 1);
                    this.ctx.rotate(270 * Math.PI / 180);
                    this.ctx.drawImage(this.image, -this.resize.height, 0, this.resize.height, this.resize.width);
                    break;

                default:
                    this.ctx.drawImage(this.image, 0, 0, this.resize.width, this.resize.height);
            }
        },

        getCompImage: function() {
            var self = this;
            this.ctx = this.canvas.getContext('2d');
            this.resize = this._getResize();
            this.canvas.width = this.resize.width;
            this.canvas.height = this.resize.height;

            // 设置为白色背景，jpg是不支持透明的，所以会被默认为canvas默认的黑色背景。
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            if ($.browser.oldIOS) {
                this.drawOldIOSCanvas();
            } else {
                this.drawCanvas();
            }

            //old android
            if ($.browser.oldAndroid) {
                var encoder = new JPEGEncoder(),
                    img = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                this.dataurl = encoder.encode(img, this.options.quality * 100);
            } else {
                this.dataurl = this.canvas.toDataURL('image/jpeg', this.options.quality);
            }

            this.url.revokeObjectURL(self.blob);
        },

        _getResize: function() {
            var self = this,
                img = this.image,
                width = this.options.width,
                height = this.options.height;

            var ret = {
                width: img.width,
                height: img.height
            };

            if ("5678".indexOf(self.options.orientation) > -1) {
                ret.width = img.height;
                ret.height = img.width;
            }

            var scale = ret.width / ret.height;

            if (width && height) {
                if (scale >= width / height) {
                    if (ret.width > width) {
                        ret.width = width;
                        ret.height = Math.ceil(width / scale);
                    }
                } else {
                    if (ret.height > height) {
                        ret.height = height;
                        ret.width = Math.ceil(height * scale);
                    }
                }
            } else if (width) {
                if (width < ret.width) {
                    ret.width = width;
                    ret.height = Math.ceil(width / scale);
                }
            } else if (height) {
                if (height < ret.height) {
                    ret.width = Math.ceil(height * scale);
                    ret.height = height;
                }
            }

            // 超过这个值base64无法生成，在IOS上
            while (ret.width >= 3264 || ret.height >= 2448) {
                ret.width *= 0.8;
                ret.height *= 0.8;
            }

            return ret;
        }
    };

    $.ImageOrientation = $.Class.create();
    $.ImageOrientation.prototype = {

        /**
         * 初始化方法，将blob类型的文件转为二进制流
         * 得到方向信息，并调用回调函数
         */
        initialize: function(file, callback) {
            if (!window.FileReader || !window.DataView) {
                return 1;
            }
            var self = this;
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                callback($.Event.fixEvent(e), self._readImageOrientation(e.target.result));
            };


            fileReader.readAsArrayBuffer(file);
        },

        /**
         * 读取图片方向
         * 先校验图片的jpeg格式，再调用getOrientionFromExif方法
         */
        _readImageOrientation: function(file) {
            var dataView = new DataView(file);

            //jpg图片均由ffd8开头
            if (dataView.getUint8(0) != 0xFF || dataView.getUint8(1) != 0XD8) {
                return 1;
            }

            var offset = 2,
                length = file.byteLength,
                marker;

            while (offset < length) {
                if (dataView.getUint8(offset) != 0xFF) {
                    return 1;
                }

                marker = dataView.getUint8(offset + 1);

                if (marker == 225) {
                    return this._getOrientationFromExif(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);
                } else {
                    offset += 2 + dataView.getUint16(offset + 2);
                }
            }
        },

        /**
         * 从Exif信息中获取方向信息
         */
        _getOrientationFromExif: function(file, start) {
            //Not valid EXIF data!
            if (this._getStringFromDB(file, start, 4) != "Exif") {
                return 1;
            }

            var bigEnd, tags, tag, exifData, tiffOffset = start + 6;

            // test for TIFF validity and endianness
            if (file.getUint16(tiffOffset) == 0x4949) {
                bigEnd = false;
            } else if (file.getUint16(tiffOffset) == 0x4D4D) {
                bigEnd = true;
            } else {
                return 1;
            }

            if (file.getUint16(tiffOffset + 2, !bigEnd) != 0x002A) {
                return 1;
            }

            var firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);

            if (firstIFDOffset < 0x00000008) {
                return 1;
            }
            return this._getOrientationFromTag(file, tiffOffset, tiffOffset + firstIFDOffset, bigEnd);
        },

        /**
         * 从 Tag 0x0112 信息中获取方向信息
         */
        _getOrientationFromTag: function(file, tiffStart, dirStart, bigEnd) {
            var entries = file.getUint16(dirStart, !bigEnd),
                tags = {},
                entryOffset, tag, i;

            for (i = 0; i < entries; i++) {
                entryOffset = dirStart + i * 12 + 2;
                tag = file.getUint16(entryOffset, !bigEnd);
                if (tag == 0x0112) {
                    return this._getOrientationValue(file, entryOffset, tiffStart, dirStart, bigEnd);
                }
            }
            return 1;
        },

        /**
         * 解析Tag标签中的值
         */
        _getOrientationValue: function(file, entryOffset, tiffStart, dirStart, bigEnd) {
            var type = file.getUint16(entryOffset + 2, !bigEnd),
                numValues = file.getUint32(entryOffset + 4, !bigEnd),
                valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart,
                offset, vals, val, n;

            switch (type) {
                // 方向信息为short类型, 16 bit int
                case 3:
                    if (numValues == 1) {
                        return file.getUint16(entryOffset + 8, !bigEnd);
                    } else {
                        offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                        vals = [];
                        for (n = 0; n < numValues; n++) {
                            vals[n] = file.getUint16(offset + 2 * n, !bigEnd);
                        }
                        return vals;
                    }
            }
        },

        _getStringFromDB: function(buffer, start, length) {
            var outstr = "";
            for (n = start; n < start + length; n++) {
                outstr += String.fromCharCode(buffer.getUint8(n));
            }
            return outstr;
        }

    };

    /**
     * 2015.11.01
     *    支持传入minHeight，如果传入了minHeight，则使用minHeight否则最低高度为200px
     *    支持传入2个margin值
     */
    $.DialogChat = new $.Class.create();
    $.DialogChat.prototype = {
        contains: null,
        background: null,
        iframe: null,
        display: false,
        selector: '',
        def: {
            close: false,
            parent: window,
            margin: 10,
            border: 0,
            style: {
                height: 'auto'
            },
            resizeFunc: null
        },
        options: null,
        _funcResize: emptyFunc,
        initialize: function(html, options) {
            var self = this;
            this.options = $.extend({}, this.def, options);
            this.id = $.randomChar();
            this.selector = '.dialog-container-' + this.id;

            this._create();

            this._style(this.options.style);

            this.display = true;

            if (!!this.options.close) {
                html += '<div class="dialog-button-close" style="' + $.STYLE_NBODY + 'font-size:14px;position:absolute;right:10px;top:10px;width:20px;height:20px;line-height:20px;text-align:center;cursor:pointer;">x</div>';
            }
            this.container.html(html);

            setTimeout(function() {
                self.container.css({
                    top: Math.max(0, ($(self.options.parent).height() - Math.max(self.container.height(), 200)) / 2) + 'px'
                });
            }, 5);

            this._funcResize = function() {
                self.resize();
            };
            if (this.options.parent == window) {
                $(window).addEvent('resize', this._funcResize);
            }
            this.container.find('.dialog-button-close').click(function() {
                self.close();
            });
        },
        close: function() {
            var self = this;
            if (this.options.parent == window) {
                $(window).removeEvent('resize', this._funcResize);
            }
            $(this.selector).hide(function() {
                $('.dialog-iframe-' + self.id + ',.dialog-background-' + self.id).remove();
                $(self.selector).remove();

                self.display = false;
            });
        },
        resize: function(width, height) {
            width = width || $(this.options.parent).width();
            height = height || $(this.options.parent).height();

            $('.dialog-iframe-' + this.id + ',.dialog-background-' + this.id).css({
                width: width + 'px',
                height: height + 'px'
            });

            var computeHeight = this.options.style.height === 'auto' ? 'auto' : (height - this.options.margin * 2 - this.options.border * 2);

            this.container.css({
                width: (width - this.options.margin * 2 - this.options.border * 2) + 'px',
                height: computeHeight == 'auto' ? 'auto' : computeHeight + 'px',
                'max-width': width + 'px',
                'max-height': height - 40 + 'px'
            });
            this.container.css('top', Math.max(0, (height - Math.max(computeHeight == 'auto' ? this.container.height() : computeHeight, 200)) / 2) + 'px');
            if (this.options.resizeFunc) this.options.resizeFunc.call();
        },
        _create: function() {
            var body = this.options.parent == window ? document.body : this.options.parent;
            var position = this.options.parent == window ? 'fixed' : 'absolute';

            this.iframe = $({
                tag: 'IFRAME',
                className: 'dialog-iframe-' + this.id,
                style: $.STYLE_NBODY + 'position:' + position + ';display:none;left:0;top:0;margin:0;padding:0;border:0;width:100%;z-index:8888;'
            }).appendTo(body);
            this.background = $({
                tag: 'div',
                className: 'dialog-background-' + this.id,
                style: $.STYLE_NBODY + 'position:' + position + ';left:0;top:0;margin:0;padding:0;border:0;width:100%;background-color:#000;z-index:8888;'
            }).appendTo(body);
            var zIndex = $.browser.mobile ? 9000 : 2147483647;
            this.container = $({
                tag: 'div',
                className: 'dialog-container-' + this.id,
                style: $.STYLE_BODY + 'position:' + position + ';left:0;top:0;margin:0;min-height:' + (this.options.minHeight ? this.options.minHeight : 200) + 'px;border-radius:0px;z-index:' + zIndex + ';background:#fff;overflow-x:hidden;overflow-y:auto;'
            }).appendTo(body);

            //(6.8.2合版) 在评价窗背景加入不可滑动事件
            this.background.bind('touchstart', function(e) {
                var event = $.Event.fixEvent(e);
                event.stopPropagation();
                event.preventDefault();
            }).bind('touchend', function(e) {
                var event = $.Event.fixEvent(e);
                event.stopPropagation();
                event.preventDefault();
            });
        },
        _style: function(style) {
            var width = $(this.options.parent).width();
            var height = $(this.options.parent).height();

            $('.dialog-iframe-' + this.id + ',.dialog-background-' + this.id).css({
                width: width + 'px',
                height: $(this.options.parent).height() + 'px'
            });

            this.background.css({
                opacity: 0.6
            });

            var marginArray = (this.options.margin + "").split(" ");

            if (marginArray.length == 1) {
                marginArray.push(this.options.margin);
            }

            this.container.css(style).css({
                left: marginArray[0] + 'px',
                top: marginArray[1] + 'px',
                width: (width - marginArray[0] * 2 - this.options.border * 2) + 'px',
                height: this.options.style.height === 'auto' ? 'auto' : (height - marginArray[1] * 2 - this.options.border * 2) + 'px'
            });
        }
    };

    /**
     * 2015.11.01
     *   新增Toast，居中透明提示框组件
     */
    $.Toast = new $.Class.create();
    $.Toast.prototype = {
        id: null,
        container: null, //遮罩层，弹出提示框的时候，点击页面触发指定事件
        toast: null,
        options: {},

        initialize: function(html, options) {
            var self = this;

            this.id = $.randomChar();
            this.options = $.extend(this.options, options);

            //单独的透明层
            this.toastOpacity = $({
                tag: 'div',
                className: 'toast-opacity-' + this.id,
                style: $.STYLE_BODY + 'position:relative;z-index:9000;width:' + this.options.width + 'px;height:' + this.options.height + 'px;margin-left:' + ($(window).width() - this.options.width) / 2 + 'px;margin-top:' + ($(window).scrollTop() + ($(window).height() - this.options.height - 100) / 2) + 'px;background-color:#000;opacity:0.5;border-radius:5px;font-size:16px;color:white;text-align:center;line-height:' + this.options.height + 'px'
            });

            //内容层，使用相对布局使其与透明层重叠，并置于透明层下方
            this.toast = $({
                tag: 'div',
                className: 'toast-' + this.id,
                style: $.STYLE_BODY + 'position:relative;z-index:10000;width:' + this.options.width + 'px;height:' + this.options.height + 'px;margin-left:' + ($(window).width() - this.options.width) / 2 + 'px;margin-top:' + (-this.options.height) + 'px;background-color:none;border-radius:5px;font-size:16px;color:white;text-align:center;line-height:' + this.options.height + 'px'
            });

            this.toast.html(html);

            this._create();

            this._funcResize = function() {
                self.resize();
            };

            this._funRemove = function() {
                self.remove();
            };

            $(window).addEvent('resize', this._funcResize);
        },

        /**
         * 创建提示框
         * 将透明层与内容层append到body中
         */
        _create: function() {
            this.toastOpacity.appendTo(document.body);
            this.toast.appendTo(document.body);
        },

        /**
         * 改变提示框内容
         */
        change: function(html) {
            $(".toast-" + this.id).html(html);
        },

        /**
         * 窗口大小发生变更的时候，改变宽高
         */
        resize: function() {
            var width = $(window).width();
            var height = $(window).height();
            var left = (width - this.options.width) / 2 > 0 ? (width - this.options.width) / 2 : 0;
            var top = (height - this.options.height - 100) / 2 > 0 ? $(window).scrollTop() + (height - this.options.height - 100) / 2 : $(window).scrollTop();
            $(".toast-opacity-" + this.id).css({
                'margin-left': left + 'px',
                'margin-top': top + 'px',
                'max-width': width + 'px',
                'max-height': height + 'px'
            });
            $(".toast-" + this.id).css({
                'margin-left': left + 'px',
                'margin-top': -this.options.height + 'px',
                'max-width': width + 'px',
                'max-height': height + 'px'
            });
        },

        /**
         * 从body中移除掉提示框元素
         */
        remove: function() {
            $(".toast-opacity-" + this.id).remove();
            $(".toast-" + this.id).remove();
        }
    };

    $.GifTimer = $.Class.create();
    $.GifTimer.prototype = {
        id: null,
        inter: null,
        timeout: null,

        options: {
            inTimeFunc: null, //执行方法
            outTimeFunc: null, //超时后执行的方法
            doTime: null, //循环时间
            allTime: null //总共执行时间
        },

        initialize: function(options) {
            var self = this;

            this.options = $.extend(this.options, options);
            this.inter = setInterval(function() {
                self.options.inTimeFunc.call(self);
            }, this.options.doTime);
            this.timeout = setTimeout(function() {
                clearInterval(self.inter);
                self.options.outTimeFunc.call(self);
            }, this.options.allTime);
        },

        remove: function() {
            $.Log('giftimer remove');
            clearInterval(this.inter);
            clearTimeout(this.timeout);
            this.inter = null;
            this.timeout = null;
        }
    };

    /**
     * Music对象，用于播放音频
     */
    $.Music = $.Class.create();
    $.Music.prototype = {
        msgid: null,
        url: null,
        type: null,
        duration: null,
        audioFlag: true,
        musicEl: null,
        viewCallback: null,
        eventCallback: null,
        container: null,
        debugStr: '[nTalk Music]: ',

        initialize: function(msgid, url, type, duration, viewCallback, eventCallback, container) {
            this.msgid = msgid;
            this.url = url;
            this.type = type;
            this.duration = duration;
            this.viewCallback = viewCallback;
            this.eventCallback = eventCallback;
            this.container = container;
            this.audioFlag = this.canPlayAudioMP3();

            //1.支持audio标签播放MP3的情况
            if (this.audioFlag) {
                this.createAudioPlayer();
            }
            //2.使用flash播放MP3
            else {
                this.createSwfPlayer();
            }

            this.viewCallback.call(this, 'init');
            this.eventCallback.call(this, 'init');
        },

        createAudioPlayer: function() {
            var self = this;
            this.musicEl = document.createElement('audio');
            this.musicEl.src = this.url;
            this.musicEl.type = this.type;
            this.musicEl.stop = function() {
                this.pause();
                this.currentTime = 0.0;
            };
            $.Event.addEvent(this.musicEl, 'ended', function() {
                $.Log(self.debugStr + ' trigger ended stop mp3');
                self.viewCallback.call(self, 'stop');
            });
            this.musicEl.getPaused = function() {
                return this.paused;
            };
        },

        createSwfPlayer: function() {
            var self = this;
            var musicId = 'ntalker_swf_mp3Player_container_' + this.msgid;
            var id = 'ntalker_swf_mp3player_' + this.msgid;
            var swf = $.sourceURI + 'fs/music.swf';
            var html = $.flashHtml(id, swf, 'id=' + id);
            this.musicEl = document.createElement('div');
            this.musicEl.innerHTML += html;
            this.musicEl.id = musicId;
            this.container.append(this.musicEl.outerHTML);

            var flashEl = ($.browser.msie && $.browser.ieversion <= 7) ? window[id] : document[id];

            setTimeout(function() {
                flashEl.emit('load', self.url);
                flashEl.emit('stop');
                self.musicEl.play = function() {
                    flashEl.emit('play');
                };
                self.musicEl.stop = function() {
                    flashEl.emit('stop');
                };
                self.musicEl.getPaused = function() {
                    return flashEl.getPaused() === 0;
                };
            }, 1000);
        },

        emit: function() {
            if (this.musicEl.getPaused()) {
                this.play();
            } else {
                this.stop();
            }
        },

        play: function() {
            $.Log(this.debugStr + 'play mp3');
            this.musicEl.play();
            this.viewCallback.call(this, 'play');
        },

        stop: function() {
            $.Log(this.debugStr + 'stop mp3');
            this.musicEl.stop();
            this.viewCallback.call(this, 'stop');
        },

        /**
         * 检测浏览器是否能使用Audio对象播放mp3文件
         */
        canPlayAudioMP3: function() {
            //1、try catch 判定浏览器中是否有Audio对象
            try {
                var a = document.createElement('audio');
                return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
            } catch (e) {
                return false;
            }
        }
    };

    $.paste = $.Class.create();
    $.paste.prototype = {
        data: null,
        callback: null,
        debugStr: '[nTalk pasteDate]: ',
        initialize: function(pasteEvent, callback) {
            this.data = pasteEvent.clipboardData || window.clipboardData;
            this.callback = callback;
        },

        getImgBase64Str: function() {
            var self = this,
                data = this.data;

            //if the paste data is undefined or null
            if (!data) {
                return null;
            }

            //air
            if (typeof webInfoChanged == "function") {
                this.callback(data.getData("image/x-vnd.adobe.air.bitmap").toDataURL());
                //chrome || opera
            } else if ($.browser.chrome || $.browser.opera) {
                var item, types, items = data.items;
                if (items) {
                    item = items[0];

                    types = data.types || [];
                    for (var i = 0, l = types.length; i < l; i++) {
                        if (types[i] === "Files") {
                            item = items[i];
                            break;
                        }
                    }

                    //kind == file && type start with image/
                    if (item && item.kind === "file" && item.type.match(/^image\//i)) {
                        var blob = item.getAsFile(),

                            reader = new FileReader();
                        reader.onload = function(e) {
                            self.callback(e.target.result);
                        };

                        reader.readAsDataURL(blob);
                    } else {
                        this.callback();
                    }
                }
                //firefox || ie || others
            } else {
                this.callback();
            }
        }
    };
})(nTalk);

; (function ($, undefined) {
	/**
	 * IM 模块
	 * @list im, flashData, connectPresence, impresence
	 * #09.16	修改lcrm模块离开前逻辑
	 * #09.17	修改最后一页、当前页判断逻辑
	 */
	var CON_FLASH_DIV = 'nTalk-flash-element',
		CON_IM_ID = 'ntkf_flash_impresence',
		CON_IM_FIX = 'IM_',
		CON_DATA_FIX = 'JDATA_',								//缓存数据，会话
		CON_PCID_KEY = 'machineid',					//PCID		无限
		CON_CURRENT_PAGE = CON_IM_FIX + 'CURRENT_PAGE',	//当前页	无限
		CON_CUREENT_CONNECT = CON_IM_FIX + 'CUREENT_CONNECT',//IM连接	无限
		CON_PAGE_DATA = CON_IM_FIX + 'SEND_CURRENT_PAGE_DATA',//需要发送到当前页的消息（发送完成后清除）
		CON_STYLE_PUBLIC_CONTENT = 'margin:0;padding:0;border:none;float:none;font:normal normal normal 12px/160% Arial,SimSun;',
		CON_EXIST_PAGEARR = CON_IM_FIX + 'EXIST_PAGEARR'; //当前存在的页面ID

	if ($.im) {
		return;
	}
	$.tipsicon = $.sourceURI + 'images/tipsicon.' + ($.browser.msie6 ? 'gif' : 'png');

	$.extend({
		CON_LCRM_FIX: 'LCRM_',
		currentCount: 0,
		im: {
			connect: null,
			time: 3,
			args: null,
			options: null,
			tipElement: null,
			receiveMsgCount: 0,
			isInvite: false,
			start: function () {
				var self = this;

				if (this.connect) {
					$.Log('im connected', 2);
					return;
				}

				this.options = {
					siteid: $.global.siteid,
					settingid: $.global.settingid,
					surl: $.server.flashserver,
					r: $.baseURI,
					ref: $.referrer,
					fsid: $.global.trailid,
					cid: $.global.pcid,
					presenceserver: $.server.presenceserver,
					presencegoserver: $.server.presencegoserver,
					t2dstatus: $.server.t2dstatus,
					crmcenter: $.server.crmcenter,
					coopserver: $.server.coopserver,
					//是否加载NID.swf模块
					loadnid: $.CON_LOAD_MODE_NID
				};
				if ($.user.id) {
					this.options = $.merge(this.options, $.whereGet($.user, ['id', 'name'], ['u', 'n']));
				}

				$.require({ comet: 'nt2.js?siteid=' + $.extParmas.siteid }, function (comet) {
					if (!comet) {
						$.Log('Loaded $comet mode failed', 3);
						return;
					}
					//self.connect = new $.connectPresence( self.options, $.server.close_im_flash || '0' , $.server.connect_type);
					//TODO: 连接类型复用tchat配置项，tchatConnectType
					self.connect = new $.connectPresence(self.options, $.server.close_im_flash || '0', $.server.tchatConnectType);
					$.IMPRESENCE = self.connect;
					$.promptwindow.callbackFocus = function () {
						self.onPageFocus();
					};
					$.promptwindow.callbackBlur = function () {
						self.onPageBlur();
					};

					//加载IM时，一直监控鼠标移动事件
					$.listenMouseOutEvent();

					//每5秒验证一次是否存在未执行的立即显示方案
					setInterval(function () {
						self.intervalVerify();
					}, 5000);

					$.moveCheck = setInterval(
						function () {
							if ($.moveTime === 0 && $.currentCount == 1 && $.moveCheckFlag) {
								$.moveCheckFlag = false;
								setTimeout(function () {
									if ($.moveTime === 0 && $.currentCount == 1) {
										$.showBeforeLeavePlan();
									}
									$.moveCheckFlag = true;
								}, 2 * 1000);
							}
						}, 1 * 1000);
				});
			},
			/**
			 * IM收到系统消息
			 * 2015.07.22 被动接收的会话消息，直接连接客服，客服不在线时，进机器人
			 *            接收的邀请，直接连接人工客服，优先连接发起邀请的客服，接待组中所有客服不在线时，进机器人
			 *            邀请不主动连接，只在访客发送消息后，再连接客服函数im_receiveMessage，调用此函数
			 *            移动设备下,网站页内，会话消息不走PC逻辑，网站定义了
			 * @param  {[type]} data    [description]
			 * @param  {[type]} message [description]
			 * @return {[type]}         [description]
			 */
			callReceiveSysMessage: function (data, message, inviteid) {
				var chat, settingid, destid, sellerid;
				$.Log('im.callReceiveSysMessage(' + $ + ')')
				destid = data.id || '';
				if (!data.settingid && destid) {
					sellerid = destid.split('_').splice(0, 2).join('_');
					//如果打开的商户配置非默认 _9999配置时，会出现异常
					data.settingid = $.global.settingid.indexOf(sellerid) > -1 || sellerid.indexOf('kf_') ? $.global.settingid : sellerid + '_9999';
				}
				$.Log("$.IM.callReceiveSysMessage(" + $.JSON.toJSONString(arguments) + ")", 2);
				if ($.isEdu) {
					if ($.global.callbacks['ReceiveOfflineMessage']) {
						//2017.04 收到离线消息返回数据，执行回调。
						var runJson = {
							id: data.id,
							settingid: data.settingid,
							name: data.name,
							userIcon: data.userIcon,
							message: message
						}
						$.base.fire('ReceiveOfflineMessage', [runJson]);
					} else if ($.browser.mobile) {
						if (inviteid) {
							$.im_openInPageChat('', '', inviteid.wid, { edu_inviteid: inviteid.inviteid, edu_visitid: inviteid.visitid });
							$.fim_offlineMssage(message, inviteid, data);
							return;
						} else if (data) {
							$.fim_offlineMssage(message, inviteid, data);
						} else {
							return;
						}
						return;
					} else {
						if (inviteid) {
							nTalk.im_openInPageChat('', '', inviteid.wid, { edu_inviteid: inviteid.inviteid, edu_visitid: inviteid.visitid });
							return;
						} else if (data) {
							//2017.04.17
							//nTalk.im_openInPageChat('','', data.id);
							$.im.showTips(data, message);
						} else {
							return;
						}
					}
					return;
				}
				switch (data.calltype) {
					case 10:
						if ($.global.callbacks['ReceiveOfflineMessage']) {
							//2017.04 收到离线消息返回数据，执行回调。
							var runJson = {
								id: data.id,
								settingid: data.settingid,
								name: data.name,
								userIcon: data.userIcon,
								message: message
							}
							$.base.fire('ReceiveOfflineMessage', [runJson]);
						} else if ($.browser.mobile && $.global.pageinchat) {
							if ($.isFunction(im_receiveMessage)) {
								im_receiveMessage(data.settingid, message);
							}
						} else if ($.chatManage && (chat = $.chatManage.get(data.settingid, destid))) {
							//已打开聊天窗口，重新连接
							chat.reconnect(null, destid, -1);/*single*/
							$.chatManage.callReceive(chat.settingid);
						} else if ($.server.isnoim == 3) {
							//服务器返回状态autoOpen，收到消息，直接打开聊窗
							$.im_openInPageChat(data.settingid, '', destid, { single: -1, autoconnect: true }, '');
						} else {
							//未打开聊天窗口，显示tip
							// 2017.04.29 nt6.8.7_dh1000 添加eid为sellerid的判断
							if (nTalk.global.siteid == data.eid || $.inArray(data.eid, $.global.sellerid) > -1) {
								$.im.showTips(data, message);
							}
						}
						break;
					case 1:
					case 2:
						//liveCRM消息
						$.base.startLCrm(data.content);
						break;
					default:
						//邀请:0
						//2015.10.20 临时添加 isnoim值为3时，直接打开聊窗
						if ($.global.callbacks['ReceiveOfflineMessage']) {
							//2017.04 收到离线消息返回数据，执行回调。
							var runJson = {
								id: data.id,
								settingid: data.settingid,
								name: data.name,
								userIcon: data.userIcon,
								message: message
							}
							$.base.fire('ReceiveOfflineMessage', [runJson]);
						} else if (data.autoOpen || $.server.isnoim == 3) {
							//收到直接打开聊窗的邀请，算接受邀请
							if ($.im) {
								$.im.refuseInvite(destid, data.inviteid, 0);
							}
							if ($.chatManage && (chat = $.chatManage.get(data.settingid, destid))) {
								chat.reconnect(null, destid, -1);
								$.chatManage.callReceive(chat.settingid);
							} else if ($.im_openInPageChat) {
								$.im_openInPageChat(data.settingid, '', destid, { single: -1, autoconnect: 1 }, '');
							}
						} else {
							//2015.06.08 手动营销发起的邀请TIP
							this.showTips(data, message, true);
							//客服主动推送邀请
							//$.base.startInvite(data.settingid, destid, data.inviteid);
						}

						break;
				}
			},
			/**
			 * 页面获得焦点
			 * @return {[type]} [description]
			 */
			onPageFocus: function () {
				$.IMPRESENCE.setPageFocus(true, $.title, $.url, 0);

				this.intervalVerify();
			},
			/**
			 * 页面失去焦点
			 * @return {[type]} [description]
			 */
			onPageBlur: function () {
				$.IMPRESENCE.setPageFocus(false);
			},
			/**
			 * 定时验证是否存在立即执行方案
			 * @return {[type]} [description]
			 */
			intervalVerify: function () {
				var cacheData, tmpData;
				cacheData = $.loadLCrm();
				$.each(cacheData, function (index, data) {
					if (data.trigger == 1 || !$.im.connect.currentPage.get()) {
						//离开前触发方案，不在此处执行
						return;
					}
					tmpData = $.extend(data, {
						cw: $.currentCount
					});

					$.base.startLCrm(tmpData/*params*/, false/*retry*/, true/*cache*/);
					//清除缓存中当前方案数据
					$.flashData.remove($.CON_LCRM_FIX + tmpData.token);

				});
			},
			/**
			 * 显示tips消息通知
			 * @param  json     data       [description]
			 * @param  string   txtMessage [description]
			 * @param  boolean  isInvite   是否是手动营销，手动营销打开的聊窗不主动连接TCHAT
			 * @return
			 */
			showTips: function (data, txtMessage, isInvite) {
				var arrtmp;
				this.settingid = data.settingid || $.global.settingid || '';
				this.destid = data.id || '';
				this.sessionid = data.sid || '';
				this.inviteid = data.inviteid || '';
				this.isInvite = isInvite;

				if (typeof window.webInfoChanged == "function") {
					webInfoChanged(400, '{"num":' + (++this.receiveMsgCount) + ', "showNum":1}', false);
				}
				arrtmp = this.destid.split('_ISME9754_T2D_');
				this.sellerid = arrtmp[0].indexOf('kf_') > -1 || arrtmp[0] == $.global.siteid ? '' : arrtmp[0];

				$.require($.tipsicon, function (image) {
					if (image.error) $.Log('cache chat icon failure', 3);
				});
				this._createTips();

				this.tipElement.find('.ntalk-tips-body').html(txtMessage);

				this.tipElement.find('.ntalk-tips-button').html('\u7acb\u523b\u54a8\u8be2');

				//标题闪烁
				$.promptwindow.startPrompt('', $.lang.news_new, true);
			},
			/**
			 * 隐藏tip消息
			 * @return
			 */
			hideTips: function () {
				var self = this;
				if (!this.tipElement || !this.tipElement.length) {
					return;
				}
				this.tipElement.hide(500, function () {
					$(this).remove();
					self.tipElement = null;
				});
			},
			/**
			 * 通过tips打开聊天窗口
			 * @return
			 */
			openChat: function () {
				this.hideTips();
				//打开聊窗，选连接人工客服，

				if ($.browser.mobile || !$.global.pageinchat) {
					$.im_openOutPageChat(this.settingid, '', this.destid, { manual: 1 }, '', this.sellerid);
				} else {
					$.im_openInPageChat(this.settingid, '', this.destid, { single: -1, autoconnect: this.isInvite ? -1 : 1, manual: 1 }, '');
				}
			},
			/**
			 * 创建tips消息通知
			 * @return {[type]} [description]
			 */
			_createTips: function () {
				var self = this;
				if (!this.tipElement || !this.tipElement.length) {
					var html = [
						'<div class="ntalk-tips-background" style="margin:0;padding:10px;border:0;background:url(', $.tipsicon, ') no-repeat 0 0;color:#333333;font:normal 12px/160% Arial,SimSun;text-align:left;height:150px;width:205px;">',
						'<div class="ntalk-tips-body" style="margin:0;padding:0;border:0;float:left;font:normal 12px/160% Arial,SimSun;color:#333;height:60px;overflow:hidden;text-align:left;white-space:normal;width:156px;word-break:break-all;"></div>',
						'<div class="ntalk-tips-close" style="background:url(', $.tipsicon, ') no-repeat -7px -120px;margin:5px;padding:0;border:0;cursor:pointer;font:normal 1px/1px Arial;height:20px;left:166px;position:absolute;top:0px;width:20px;"></div>',
						'<div class="ntalk-tips-button" style="background:#008CD4;margin:0;padding:0;border:0;color:#FFFFFF;cursor:pointer;height:24px;left:105px;font:normal 12px/24px Arial,SimSun;position:absolute;text-align:center;top:78px;width:69px;"></div>',
						'</div>'
					].join('');

					this.tipElement = $({ className: 'ntalk-tips-container', style: CON_STYLE_PUBLIC_CONTENT + 'width:206px;height:112px;z-index:99999;' }).appendTo(true).fixed({ right: 0, bottom: 0 }).html(html);

					this.tipElement.click(function (event) {
						$.Event.fixEvent(event).stopPropagation();

						self.openChat();
					});
					this.tipElement.find('.ntalk-tips-button').click(function (event) {
						$.Event.fixEvent(event).stopPropagation();

						self.openChat();
					}).hover(function (event) {
						$(this).css('background', '#007AB9');
					}, function (event) {
						$(this).css('background', '#008CD4');
					});
					this.tipElement.find('.ntalk-tips-close').click(function (event) {
						$.Event.fixEvent(event).stopPropagation();

						self.hideTips();
					}).hover(function (event) {
						$(this).css('background-position', '-27px -120px');
					}, function (event) {
						$(this).css('background-position', '-7px -120px');
					});
				}
			},
			/**
			 * @method refuseInvite 用户响应客服邀请回执
			 * @param  {string} destid   发起邀请的客服ID
			 * @param  {string} inviteid 邀请ID
			 * @param  {number} status   状态0:接受邀请;1:拒绝邀请;
			 * @return {[type]}          [description]
			 */
			refuseInvite: function (destid, inviteid, status) {
				if (!$.server.presencegoserver) {
					$.Log('presencegoserver is null', 2);
					return;
				}

				if (!destid || !inviteid) {
					$.Log('auto invite', 1);
					return;
				}
				// 2017.04 接受邀请或拒绝邀请回调函数
				if ($.global.callbacks['AcceptInvitation'] && status == 1) {
					$.base.fire('AcceptInvitation', []);
				} else if ($.global.callbacks['RefuseInvitation'] && (status == 0 || status == 2)) {
					$.base.fire('RefuseInvitation', []);
				}
				var params = {
					action: '',
					query: 'invtrst',
					suid: $.user.id,
					duid: destid,
					rst: status,
					invid: inviteid,
					tk: $.global.userToken
				};

				$.require($.server.presencegoserver + '?' + $.toURI(params) + '#rnd');
			}
		}
	});

	$.extend({//load liveCRM DATA
		listenMouseEvent: false,
		//鼠标上次座标位置
		lcrmGoAwayClientY: 0,
		//离开视区
		lcrmGoAwayView: false,
		//移动时间
		moveTime: 0,
		//失去焦点时，检查移动定时器
		moveCheck: null,
		//
		moveCheckFlag: true,

		/**
		 * 加载缓存中离开前营销方案
		 * @return {[type]} [description]
		 */
		loadLCrm: function () {
			var data = $.flashData.get(), result = {};

			for (var name in data) {
				if (typeof (data[name]) == "function") continue;

				if (data[name] && name.indexOf($.CON_LCRM_FIX) > -1) {
					result[name] = data[name];
				}
			}

			return result;
		},
		/**
		 * 开始监控鼠标移动事件
		 * @param  boolean  remove [description]
		 * @return {[type]}        [description]
		 */
		listenMouseOutEvent: function (remove) {
			var self = this,
				_mouseover = function (e) {
					var event = $.Event.fixEvent(e);
					if ((event.relatedTarget || event.toElement) && !self.lcrmGoAwayView) {
						self.setMouseOutWindow(event, false);
					}
				},
				_mouseout = function (e) {
					var event = $.Event.fixEvent(e);
					if (!(event.relatedTarget || event.toElement)) {
						self.setMouseOutWindow(event, true);
						self.moveTime = 0;
					}
				},
				_mousemove = function (e) {
					var event = $.Event.fixEvent(e);
					self.setMouseOutWindow(event, 'mousemove');

					if ($.moveCheck !== null) {
						$.moveCheck = null;
					}
					self.moveTime = $.getTime();
				}
				;
			//已开始监控或移动设备不再监控
			if (this.listenMouseEvent || $.browser.mobile) {
				return;
			}
			this.listenMouseEvent = true;
			if (remove === true) {
				$(document).removeEvent('mouseover', _mouseover);
				$(document).removeEvent('mouseout', _mouseout);
				$(document).removeEvent('mousemove', _mousemove);
			} else {
				$(document).addEvent('mouseover', _mouseover);
				$(document).addEvent('mouseout', _mouseout);
				$(document).addEvent('mousemove', _mousemove);
			}
		},
		/**
		 * 判断鼠标是否是从窗口向上移动(准备关闭浏览器)
		 * @param {[type]} event      事件对像
		 * @param {[type]} goAwayView 是否是离开视区
		 */
		setMouseOutWindow: function (event, goAwayView) {
			var self = this;

			if (goAwayView === 'mousemove') {
				this.lcrmGoAwayClientY = event.clientY > 0 ? event.clientY : this.lcrmGoAwayClientY;
				return;
			}
			this.lcrmGoAwayView = goAwayView;

			if (event.clientY < 0 && self.lcrmGoAwayClientY < 50) {
				//$.Log('mousemove event: current open window number:' + $.currentCount, 1);

				//最后一个页面
				if ($.currentCount != 1) {
					return;
				}

				setTimeout(function () {
					if ($.moveTime === 0) {
						$.showBeforeLeavePlan();
					}
				}, 0.5 * 1000);

			}
		},

		_getExistPageList: function () {
			try {
				return $.store.get(CON_EXIST_PAGEARR).split(",");
			} catch (e) {
				return [];
			}
		},

		showBeforeLeavePlan: function () {
			var cache, tmpData;
			cache = $.loadLCrm();

			$.each(cache, function (index, data) {
				if (data.trigger === 0) {
					//立即触发类型方案，不在此处执行
					return;
				}
				tmpData = $.extend(data, {
					trigger: 0,
					cw: $.currentCount
				});

				$.base.startLCrm(tmpData/*params*/, false/*retry*/, true/*cache*/);

				//清除缓存中当前方案数据
				$.flashData.remove($.CON_LCRM_FIX + tmpData.token);
			});
		}
	});

	$.extend({//im callback
		/**
		 * IM回调函数接口
		 * @param  {number}		type
		 * @param  {strJson}	strjson
		 * @return {void}
		 * 2017-03-23 教育版
		 */
		fIM_onPresenceReceiveSysMessage: function (type, message) {
			$.Log('$.fIM_onPresenceReceiveSysMessage("' + type + '", "' + $.JSON.toJSONString(message) + '")', 1);

			setTimeout(function () {
				var json, textMessage, strJson, inviteid;
				if (message.indexOf('ntalker://') > -1) {
					textMessage = $.clearHtml(message.substr(0, message.indexOf('ntalker://')));
					strJson = message.substr(message.indexOf('ntalker://') + 10);
				} else {
					var arr = message.split('&&');
					var strJson = null;
					var strinviteid = null;
					for (var i = 0; i < arr.length; i++) {
						arr[i].indexOf('msg=') > -1 ? strJson = arr[i].replace('msg=', '') : strinviteid = arr[i].replace('inviteid=', '');
					}
				}

				try {
					json = $.JSON.parseJSON(strJson);
					if (strinviteid) {
						inviteid = $.JSON.parseJSON(strinviteid);
					}
				} catch (e) {
					$.Log('nTalk.fIM_onPresenceReceiveSysMessage():' + e.message, 3);
					return;
				}
				//2017-03-23 教育版增加个邀请id
				$.im.callReceiveSysMessage(json, textMessage, inviteid);
			}, 0);

			return true;
		},
		fIM_onGetFlashServer: function (userInfoUrl, trailUrl, historicalMsgUrl, checkURL, avServer, manageServer, fileServer) {
			return true;
		},
		connectStatus: -1,
		fIM_updateUserStatus: function (state, strMessage) {
			// 0:disconnect; 1:Are connected;2:Connection success;
			setTimeout(function () {
				$.Log('$.fIM_updateUserStatus(' + state + ', "' + strMessage + '")');

				$.connectStatus = state;
				if ($.connectStatus == 2) {
					try {
						$.IMPRESENCE.setPageFocus(true, $.title, $.url, 1);
					} catch (e) {
						$.Log(e, 3);
					}
				}
			}, 0);
			return true;
		},
		fIM_presenceSetIMSid: function (userToken) {// im connection complete
			$.Log('fIM_presenceSetIMSid(userToken:' + userToken + ')', 1);
			$.global.userToken = userToken;

			return true;
		},
		fIM_presenceSetMyClientID: function (presenceFlashGoUrl) {
			$.url_presenceFlashGoUrl = presenceFlashGoUrl;
			return true;
		},
		/**
		 * IM 数据存贮模块
		 * @type {Object}
		 */
		flashData: {
			debug: false,
			reNumber: 0,
			sessionData: null,
			checkFlash: function (fn) {
				if (!$.IMPRESENCE || !$.isFunction($.IMPRESENCE.setJSData)) {
					if (this.reNumber > 3) { return; }
					this.reNumber++;
					setTimeout(fn, 500);
				} else fn.call(this);
			},
			add: function (k, data) {
				var self = this;
				if (data) {
					data = this.filter($.JSON.toJSONString(data), true);
				}
				if (this.debug) {
					$.Log('$.flashData.add(k:' + k + ', v:' + data + ')', 1);
				}
				this.checkFlash(function () {
					try {
						$.IMPRESENCE.setJSData($.global.trailid, k, data);
						return true;
					} catch (e) {
						return false;
					}
				});
			},
			remove: function (k) {
				this.add(k, null, false);
			},
			clearAll: function () {
				this.checkFlash(function () {
					try {
						//trailID为空时，清空所有数据
						NTKF.IMPRESENCE.setJSData('', '', '');
						return true;
					} catch (e) {
						return false;
					}
				});
			},
			get: function (key) {
				var data, ret = {};
				if (!$.IMPRESENCE || !$.IMPRESENCE.getJSData) return ret;
				data = $.IMPRESENCE.getJSData($.global.trailid, (key || ''));
				//返回可能是多条数据
				try {
					data = $.JSON.parseJSON(data);
				} catch (e) {

				}
				if (typeof data == 'string') {
					ret = $.JSON.parseJSON(this.filter(data, false) || '{}');
				} else {
					for (var k in data) {
						if ($.isFunction(data[k])) continue;
						try {
							ret[k] = $.JSON.parseJSON(this.filter(data[k], false));
						} catch (e) {

						}
					}
				}
				return ret;
			},
			filter: function (data, replace) {
				return replace === true ? data.replace(/\"/gi, "{sy}") : data.replace(/\{sy\}/gi, "\"");
			}
		},
		/*
		* 教育版滚动显示邀请会话。
		* 接受邀请消息
		* message 消息
		*/
		fim_offlineMssage: function (message, data, json, boolean) {
			if ($('.nTalk-window-offLine').length == 0) {
				$.OfflineChat = new nTalk.ChatOfflineChat(data, json);
			}
			if (!message && !data && !json && boolean) {
				$.OfflineChat.count = 0;
				$.cache.set('imcount', 0);
				$.OfflineChat.offlineChatCount.css('display', 'none').html('0')
				$.OfflineChat.offlineChat.css('display', 'none');
				return;
			}
			$.OfflineChat.receiveMessage(message, "", json);
		}
	});

	/**
	 * Presence 连接对像(flash|impresence)
	 * @type {[type]}
	 */
	$.connectPresence = $.Class.create();
	$.connectPresence.prototype = {
		name: 'connectPresence',
		options: null,
		manage: null,
		debug: false,
		data: null,            //用于存储flash接收到的营销方案
		switchTimeId: null,
		_connected: false,
		currentConnectType: '',
		initialize: function (options/*:json*/, close_im_flash, connect_type) {
			var self = this, manageOptions, conType;

			this.data = $.store;

			this.options = $.extend({
				nullparam: '',
				usemqtt: 0
			}, options);

			// switch(connect_type){
			// 	case 'mqtt':
			// 		this.options.usemqtt = 1;

			// 		if( 'WebSocket' in window || 'MozWebSocket' in window ){
			// 			conType = 'websock';
			// 		}else if( close_im_flash == '1' ){
			// 			conType = 'comet';
			// 		}else{
			// 			conType = 'fssock';
			// 		}
			// 		break;
			// 	case 'rtmp':
			// 		if( close_im_flash == '1' ){
			// 			conType = 'comet';
			// 		}else if( $.flash.support ){
			// 			conType = 'rtmp';
			// 		}
			// 		break;
			// }

			// 	switch(conType){
			// 	case "websock":
			// 		this.connect = this._createMqttConnect(this.options);
			// 		break;
			// 	case "fssock":
			// 	case "rtmp":
			// 		this.connect = this._createFlashConnect( this.options );
			// 		break;
			// 	default://comet
			// 		this.options.usemqtt = 0;
			// 		this.connect = this._createCometConnect( this.options );
			// 		break;
			// }
			if (connect_type == 1 && $.server.eduimmqttserver) {
				//mqtt connect
				this.connect = this._createMqttConnect(this.options);
			} else {
				//comet connect
				this.connect = this._createCometConnect(this.options);
			}

			$.Log('new $.connectPresence(); connect_type: ' + connect_type + ', isnoim:' + $.server.isnoim);

			/**
			 * 页面管理器，管理当前已打开页面数量(最多管理三个页面)，用于最后一页判断
			 */
			if (!this.connect.manage) {
				this.manage = new $.pageManage();
			} else {
				this.manage = this.connect.manage;
			}
			this.manage.options.onChanage = function (count, data) {
				$.currentCount = count;
				$.Log('page manage callback: current open window number:' + $.currentCount, 1);
			};
			$.currentCount = this.manage.count;
			this.identid = this.manage.identid;

			if (!this.connect.currentPage) {
				$.Log('new $.CurrentPage(' + this.identid + ')', 1);

				this.currentPage = new $.CurrentPage(this.identid, this.manage);
			} else {
				this.currentPage = this.connect.currentPage;
			}
		},
		/**
		 * 连接类型切换,如果当前连接类型不为comet连接，使用comet方式创建连接
		 * @return
		 */
		switchConnect: function () {
			this.stopSwitchConnect();

			if (this.currentConnectType != $.CON_CONNECT_COMET) {
				$.Log('Flash abnormalities, switch the connection type. this.currentConnectType:' + this.currentConnectType + ' > comet', 2);
				if (this.connect && $.isFunction(this.connect.remove)) {
					//flash connect, remove flash HTMLDOM
					$.flash.remove(this.connect);
				}
				if (this.connect && $.isFunction(this.connect.disconnect)) {
					this.connect.disconnect();
				}
				//this._createCometConnect(this.options);
			} else {
				$.Log('Flash abnormalities', 2);
			}
		},
		/**
		 * 连接完成或正准备切换连接时，终止连接类型切换
		 * @return
		 */
		stopSwitchConnect: function () {
			clearTimeout(this.switchTimeId);
			this.switchTimeId = null;
		},
		/**
		 * 当前页面获取焦点
		 * @param {[type]} focus [description]
		 * @param {[type]} title [description]
		 * @param {[type]} url   [description]
		 * @param {[type]} other [description]
		 */
		setPageFocus: function (focus, title, url, other) {
			//debug 20150701 仅使用js的页面管理逻辑
			if (focus) {
				this.currentPage.set(title, url);
			}
		},
		/**
		 * 关闭Presence连接
		 * @return {[type]} [description]
		 */
		closePresence: function () {
			if (this.connect) {
				try {
					this.connect.closePresence();
				} catch (e) {
				}
			}
			//Flash连接断开时，要移除Flash对像
			if (this.currentConnectType == $.CON_CONNECT_FLASH) {
				$.flash.remove(this.connect);
			}
			this.connect = null;
			this.manage = null;
		},
		/**
		 * 存贮数据
                 * debug 20150701 connectpresence中的setJSData逻辑采取本地存储方案
		 * @param {[type]} trailid [description]
		 * @param {[type]} key     [description]
		 * @param {[type]} value   [description]
		 */
		setJSData: function (trailid, key, value) {
			//2014.07.18
			//comet连接时，存贮的数据与常规数据进行区分
			//通过此接口存贮的数据，添加前缀
			var ret;
			trailid = arguments[0];
			if (!trailid || trailid === '') {
				//trailid为空时，清除通过此接口存贮的数据
				ret = this.data.getAll();
				for (var k in ret) {
					if (!ret.hasOwnProperty(k)) continue;
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
		 * 获取数据
                 * debug 20150701 connectpresence中的getJSData逻辑采取
                 * 遍历本地存储，找到以JDADA为key值的缓存信息
		 * @param  {[type]} trailid [description]
		 * @param  {[type]} key     [description]
		 * @return {[type]}         [description]
		 */
		getJSData: function (trailid, key) {
			var ret, result = {};

			ret = this.data.getAll();
			for (var k in ret) {
				if (typeof ret[k] == 'function') continue;
				if (k.indexOf(CON_DATA_FIX) > -1) {
					result[k] = ret[k];
				}
			}
			return $.JSON.toJSONString(result);
		},
		_createFlashConnect: function (options/*:json*/) {
			$.Log('$.connectPresence._createFlashConnect()', 1);
			var flashdiv = $('#' + CON_FLASH_DIV),
				flashsrc = $.sourceURI + 'fs/impresence.swf?' + $.version.im,
				flashhtml = $.flashHtml(CON_IM_ID, flashsrc, options)
				;
			this.currentConnectType = $.CON_CONNECT_FLASH;
			if (!flashdiv.length) {
				flashdiv = $(document.body).insert('<div id="' + CON_FLASH_DIV + '" class="nTalk-hidden-element" style="position: absolute; z-index: 9996; top: -200px;"></div>');
			}

			flashdiv.insert(flashhtml);

			if ($.browser.msie) {
				flashdiv.find('#' + CON_IM_ID).display(1);
			}

			return flashdiv.find('#' + CON_IM_ID).get(0);
		},
		_createCometConnect: function (options/*:json*/) {
			$.Log('$.connectPresence._createCometConnect()', 1);
			this.currentConnectType = $.CON_CONNECT_COMET;
			return new $.IMPresence(options);
		},
		_createMqttConnect: function (options) {
			$.Log('$.connectPresence._createMqttConnect()', 1);
			this.currentConnectType = $.CON_CONNECT_COMET;
			return new $.IMConnection.Presence(options);
		}
	};

	/**
	 * comet IMPresence
	 * @type {Object}
	 */
	$.IMPresence = $.Class.create();
	$.IMPresence.prototype = {
		name: 'IMPresence',
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
		_mqttFlag: true,

		initialize: function (options) {
			var self = this;

			this._wsFlag = options.usemqtt == 1 ? true : false;

			this.options = $.extend({
				nullparam: ''
			}, $.whereGet(options,
				["siteid", "settingid", "cid", "surl", "u", "n", "s", "r", "ref", "fsid"],
				["siteid", "settingid", "pcid", "serverurl", "userid", "username", "sessionid", "resourceurl", "referrer", "flashsessionid"]
			));

			this.data = $.store;
			this._reCount = 0;

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

			this._callback('fIM_presenceFlashReady', [this.options.userid, this.options.pcid]);

			var manageOptions = {
				onInterval: function (timeout, manageData) {
					self._onInterval.call(self, timeout, manageData);
				},
				onChanage: function (count, data) {
					self._onChanage.call(self, count, data);
				}
			};
			this.manage = new $.pageManage(manageOptions);
			this.identid = this.manage.identid;

			this.currentPage = new $.CurrentPage(this.identid, this.manage);
			//首次默认先获得焦点,存贮当前页数据
			this.setPageFocus(true, $.title, $.url);
		},
		loginConnect: function () {
			var self = this, wsUrl = '', arrConnectParams = this._toArray(this.options, this.connectParams);

			if (this.debug) $.Log('im.loginConnect()');
			//开始连接
			this._callback('fIM_updateUserStatus', [1, '']);

			//获取websocket地址
			if ($.server.presenceserver) {
				var urlArr = $.server.presenceserver.split(";");
				for (var i = 0; i < urlArr.length; i++) {
					if (urlArr[i].indexOf("ws:\/\/") > -1) {
						wsUrl = urlArr[i];
					}
				}
			} else {
				return;
			}

			//2015.07.29 无mqtt地址时，切换连接为comet
			if (!wsUrl) {
				this._wsFlag = false;
			}
			//如果选择可websocket方式且wsUrl存在，采取MQTT方式连接
			if (this._wsFlag) {
				this.connect = new $.mqttws(
					{
						url: wsUrl,
						siteid: self.options.siteid,
						pcid: self.options.pcid,
						onCallback: function () {
							self._onCallback.apply(self, arguments);
						},
						loginMsg: $.JSON.toJSONString({ "method": "roomConnect", "params": arrConnectParams })
					});
			} else {
				this.connect = new $.comet($.server.presencegoserver, {
					timeout: 20,
					onCallback: function () {
						self._onCallback.apply(self, arguments);
					},
					onComplete: function (event) {
						self._onComplete.apply(self, arguments);
					},
					onAbnormal: function (event) {
						self._onAbnormal.apply(self, arguments);
					},
					onTimeout: function (event) {
						self._onTimeout.apply(self, arguments);
					}
				});

				this.connect.connect({
					action: 'conn',
					params: arrConnectParams.join(',')
				}, 'callback');
			}
		},
		/**
		 * 保持IM连接
		 * @return {void}
		 */
		kaliveConnect: function () {
			if (this.debug) $.Log('$.IMPresence.kaliveConnect()', 1);
			var self = this;
			var connectOptions;
			if (this._wsFlag) {
				connectOptions = {
					"method": 'remoteKeepAlive',
					"params": [null, this.options.userid, this.options.clientid]
				};
				this.connect.kalive($.JSON.toJSONString(connectOptions));
			} else {
				var arrConnectParams = this._toArray(this.options, this.connectParams);
				connectOptions = {
					action: 'kalive',
					params: arrConnectParams.join(','),
					clientid: this.options.clientid,
					machineid: this.options.pcid,
					token: this.options.token,
					uid: this.options.userid
				}
					;

				setTimeout(function () {
					self.connect.kalive(connectOptions, 'callback');
				}, 1000);
			}

		},
		/**
		 * 重新连接IM
		 * @return {[type]} [description]
		 */
		reconnect: function () {
			var self = this;
			//3次登录失败，3-7秒等待后再次重新连接
			if (++this._reCount <= 3) {
				this._waitTime = 500;
			} else {
				this._waitTime = +("034567890".charAt(Math.ceil(Math.random() * 5))) * 1000;
			}
			if (this.debug) $.Log('$.IMPresence.reconnect() wait:' + this._waitTime, 1);

			this._waitReconnectTimeID = setTimeout(function () {
				self.connect.reconnect();
			}, this._waitTime);
		},
		/**
		 * 断开IM连接,清除缓存数据
		 * @return {[type]} [description]
		 */
		disconnect: function () {
			var ret = this.data.getAll();
			for (var k in ret) {
				if (typeof ret[k] == 'function') continue;
				if (k.indexOf(CON_DATA_FIX) > -1) {
					this.data.remove(k);
				}
			}

			clearTimeout(this._waitReconnectTimeID);
			this._waitReconnectTimeID = null;
		},
		/**
		 * 登录完成，返回登录状态
		 * @param {boolean} login   登录状态
		 * @param {String} userid   用户ID
		 * @param {number} clientid 连接ID
		 * @param {String} token    token
		 */
		LoginResult: function (login, userid, clientid, token) {
			this.login = login;
			this.options.clientid = clientid;
			this.options.token = token;

			this._callback('fIM_updateUserStatus', [this.login ? 2 : 0, '']);

			this._callback('fIM_presenceSetIMSid', [this.login ? this.options.token : '']);
			if (this.login) {
				this.kaliveConnect('call kalive');
			} else {
				this.reconnect('login relogin');
			}
		},
		/**
		 * 分发消息
		 * @param  {String} param1    保留
		 * @param  {String} param2    保留
		 * @param  {String} param3    保留
		 * @param  {String} destuid   发送人uid
		 * @param  {String} destuname 发送人名字
		 * @param  {String} destlogo  发送人头像
		 * @param  {String} msg       消息
		 * @param  {long} time        当前时间
		 * @return {void}
		 */
		remoteNotifyChatWithGroup: function (param1, param2, param3, destuid, destuname, destlogo, msg, time) {
			var json, message, protocol;

			if (!msg) {
				if (this.debug) $.Log('message content is null', 3);
				return;
			}
			message = $.clearHtml(msg.substr(0, msg.indexOf('ntalker://')));
			protocol = msg.substr(msg.indexOf('ntalker://') + 10);

			try {
				json = $.JSON.parseJSON(protocol);
			} catch (e) { }

			//--消息发送至当前页--
			if ($.store.isStorageSupported) {
				this._sendMessage2CurrenPage(message + 'ntalker://' + protocol);
			} else {
				this._callback('fIM_onPresenceReceiveSysMessage', [1, message + 'ntalker://' + protocol]);
			}
		},

		remoteNotifyUserCode: function (args) {
			$.Log("do remoteNotifyUserCode!!!");
		},

		remoteConfirmAddFriend: function (args) {
			$.Log("do remoteConfirmAddFriend");
		},

		/**
		 * 回调此对像内部方法
		 * @param  {String} methodName   方法名
		 * @param  {Array}  methodParams 方法参数
		 * @return {[type]} [description]
		 */
		_handleResponse: function (methodName, methodParams) {
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
		_callback: function (methodName, methodParams) {
			if ($.hasOwnProperty(methodName)) {
				try {
					$[methodName].apply(this, methodParams);
				} catch (e) { }
			} else {
				$.Log('nTalk.' + methodName + '(...)', 2);
			}
		},
		/**
		 * jsonp回调,单次请求可能会返回多个回调
		 * comet对像因链接超过预设时长，会重新发超请求，超过预设时长的链接也会返回内容
		 * 所以，回调中发起下一次请求时不能重复
		 * @param {boolean} isCurrentCallBack 是否是当前回调
		 * @param {Array}   args              参数数组
		 * @return {void}
		 */
		_onCallback: function (isCurrentCallBack, args) {
			var self = this, method;

			if (this.debug) $.Log('$.IMPresence.onCallback(  )');

			if (!args.length) {
				return;
			}
			method = args[0];

			if (/LoginResult|LoginReslut/gi.test(method)) {
				if (!isCurrentCallBack) {
					//2015.03.20 修复登录超过预设时长，丢弃已超时登录结果
					return;
				} else {
					this.LoginResult.apply(self, args.slice(1));
				}
			} else {
				this._handleResponse.call(self, method, args.slice(1));

				if (isCurrentCallBack) {
					this.kaliveConnect('call kalive');
				}
			}
		},
		/**
		 * jsonp调调用结束
		 * @return {void}
		 */
		_onComplete: function () {
			var args = Array.prototype.slice.call(arguments);

			if (this.debug) $.Log('$.IMPresence.onComplete( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )');

			if (args[0] == 'kalive') {
				this.kaliveConnect('complete kalive');
			} else if (args[0] == 'login') {
				//2014.10.11 添加异常处理，comet登录连接请求成功，但无任何内容返回，重新登录
				this.reconnect('abnormal login');
			}
		},
		/**
		 * jsonp调用异常
		 * @return {void}
		 */
		_onAbnormal: function () {
			var args = Array.prototype.slice.call(arguments);

			if (this.debug) $.Log('$.IMPresence.onAbnormal( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )', 3);

			if (args[0] == 'login') {
				//登录失败, 重新登录
				this.reconnect('abnormal login');
			} else {
				this.kaliveConnect('abnormal kalive');
			}
		},
		/**
		 * jsonp调用超时
		 * @return {void}
		 */
		_onTimeout: function () {
			var args = Array.prototype.slice.call(arguments);

			if (this.debug) $.Log('$.IMPresence.onTimeout( ' + args[0] + ',' + args[1] + ',' + args[2] + ' )', 3);

			if (args[0] == 'login') {
				//登录超时, 重新登录
				this.reconnect('time login');
			} else {
				this.kaliveConnect('timeout kalive');
			}
		},
		/**
		 * 维护IM连接,最多维护三个，其中只有一个页面连接IM
		 * @param  {[Number]} timeout [description]
		 * @param  {[Array]} m      当前页面管理器数据
		 * @return {[type]}         [description]
		 */
		_onInterval: function (timeout, m) {
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
		},
		/**
		 * pageManage回调，返回当前打开页面数量
		 * @param  {[type]} pageCount [description]
		 * @param  {[type]} data      [description]
		 * @return {[type]}           [description]
		 */
		_onChanage: function (pageCount, data) {
			this.pageCount = pageCount;
			return;
		},
		/**
		 * 执行相关更新事件
		 * @param  {[type]} type [description]
		 * @return {[type]}      [description]
		 */
		_fireEvent: function (type) {

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
		_toArray: function (json, arr) {
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
		_sendMessage2CurrenPage: function (message) {
			var self = this, objectQueue,
				strdata = this.data.get(CON_PAGE_DATA)
				;

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
		_currentGetMessage: function () {
			var callCurrentPageData = this.data.get(CON_PAGE_DATA);

			if (!callCurrentPageData) {
				return;
			}
			try {
				callCurrentPageData = $.JSON.parseJSON(callCurrentPageData);
			} catch (e) {
				//$.Log('$.IMPresence._currentGetMessage:' + e, 3);
			}

			//$.Log('is current page:' + this.currentPage.get(), 2);
			//针对最后一页未获得焦点
			if (!this.currentPage.get() || !callCurrentPageData) {
				return;
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
		setPageFocus: function (focus, title, url, other) {
			if (focus === true) {
				this.currentPage.set(title, url);
			}
		},
		closePresence: function () {
			if (this._wsFlag) {
				this.connect.disconnect();
			} else {
				try {
					this.cometd.disconnect(true);
				} catch (e) { }
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
		setJSData: function () {
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
		getJSData: function () {
			var ret, result = {}, key = Array.prototype.slice.call(arguments, 0, 2).slice(0, 2).join('-');
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

	/**
	 * 是否是当前页判断
	 * @param {number}  identid  参数来自pageManage对像，页面唯一身份标识
	 */
	$.CurrentPage = $.Class.create();
	$.CurrentPage.prototype = {
		name: 'CurrentPage',
		cachePageData: null,
		identid: '',
		debug: false,
		manage: null,
		initialize: function (identid, objManage) {
			if (!identid) {
				$.Log('$.CurrentPage params failed', 3);
				return;
			}
			this.identid = identid;
			this.manage = objManage;

			//数据存贮模块
			this.data = $.store;
		},
		/**
		 * 更新当前页信息
		 * @param {[type]} title [description]
		 * @param {[type]} url   [description]
		 */
		set: function (title, url) {
			if (!title || !url) {
				$.Log('title is null, url is null');
				return false;
			}
			this.cachePageData = {
				identid: this.identid,
				title: title,
				url: url
			};
			if (this.debug) {
				$.Log('$.CurrentPage.set():' + $.JSON.toJSONString(this.cachePageData), 1);
			}

			this.data.set(CON_CURRENT_PAGE, this.cachePageData);
		},
		/**
		 * 获取是否是当前页
		 * @return {[type]} [description]
		 */
		get: function () {
			var page, exists = false;

			this.cachePageData = this.data.get(CON_CURRENT_PAGE);

			if (!this.cachePageData || $.isEmptyObject(this.cachePageData)) {
				return false;
			}
			var pageList = $._getExistPageList();

			if (pageList.length > 0) {
				for (var i = 0; i < pageList.length; i++) {
					page = pageList[i];
					if (page == this.cachePageData.identid) {
						exists = true;
						break;
					}
				}
				//缓存中的当前页不存在时,设定其它页为当前页
				if (exists === false) {
					if (this.identid == pageList[pageList.length - 1]) {
						this.set($.title, $.url);
						return true;
					}
				}
			}
			if (this.debug) {
				$.Log('::' + $.JSON.toJSONString(this.cachePageData));
				$.Log('cache page identid:' + this.cachePageData.identid + ', identid:' + this.identid + ', currentPage: ' + (this.cachePageData.identid == this.identid));
			}
			try {
				if (this.cachePageData.identid == this.identid) {
					return true;
				}
				else return false;
			} catch (e) {
				return false;
			}
		}
	};
	/*
	* 创建wap页面，后退显示
	* 后退显示离线消息
	* 2017-03-03
	* 教育版
	*
	*/
	$.ChatOfflineChat = $.Class.create();
	$.ChatOfflineChat.prototype = {
		name: 'ChatOfflineChat',
		speed: 0,
		times: 2000,
		fontSize: 1,
		times: 1,
		running: false,
		backGround: null,
		chatWidth: null,
		chatHeight: null,
		arrList: [],
		inviteid: '',
		visitid: '',
		wid: '',
		count: 0,
		store: false,
		eduStoreInfo: {},
		initialize: function (options, json) {
			if (window.localStorage) {
				this.store = true;
			}

			if ($.browser.mobile && $('meta[name=viewport]').length == 0) {
				this.fontSize = 2;
			}

			if (options) {
				this.inviteid = options.inviteid;
				this.visitid = options.visitid;
				this.wid = options.wid;
			} else {
				this.wid1 = json.id;
			}

			var icon = json.userIcon ? json.userIcon : (json.usericon ? json.usericon : json.logo);

			var name = json.externalname ? json.externalname : json.name;

			this.offlineChat = $({ tag: 'div', className: 'nTalk-window-offLine', style: 'width:94%;height:' + (106 * this.fontSize) + 'px;background:-webkit-gradient(linear,center top,center bottom,from(#ffffff), to(#ffffff));position:fixed;left:3%;bottom:' + (75 * this.fontSize) + 'px;box-sizing:border-box;padding:' + (10 * this.fontSize) + 'px ' + (10 * this.fontSize) + 'px;box-shadow:0 0 ' + (10 * this.fontSize) + 'px ' + (2 * this.fontSize) + 'px #bababa;z-index:10000;border-radius:' + (3 * this.fontSize) + 'px;' }).appendTo(true);
			this.offlineChatAngle = $({ tag: 'div', className: 'nTalk-window-offline-angle', style: 'width:0;height:0;border:' + (20 * this.fontSize) + 'px solid #fff;position:absolute;bottom:-' + (20 * this.fontSize) + 'px;right:' + (10 * this.fontSize) + 'px;border-top:' + (10 * this.fontSize) + 'px solid #fff;border-left:' + (5 * this.fontSize) + 'px solid transparent;border-right:' + (5 * this.fontSize) + 'px solid transparent;border-bottom:' + (10 * this.fontSize) + 'px solid transparent;' }).appendTo(this.offlineChat);
			this.offlineChatLogo = $({ tag: 'div', className: 'nTalk-window-offLine-logo', style: 'width:100%;height:' + (24 * this.fontSize) + 'px;background:transparent;float:left;' }).appendTo(this.offlineChat);
			this.headerLogo = $({ tag: 'img', className: 'nTalk-window-offLine-logo-header', style: 'width:' + (24 * this.fontSize) + 'px;height:' + (24 * this.fontSize) + 'px;border:none;overflow:hidden;border-radius:100%;float:left;', src: icon }).appendTo(this.offlineChatLogo);

			this.headerName = $({ tag: 'div', className: 'nTalk-window-offLine-logo-name', style: 'width:auto;height:' + (30 * this.fontSize) + 'px;float:left;overflow:hidden;font-size:' + (16 * this.fontSize) + 'px;line-height:' + (30 * this.fontSize) + 'px;font-weight:blod;background:transparent;color:#2c2c2c;' }).appendTo(this.offlineChat);
			this.headerClose = $({ tag: 'div', className: 'nTalk-window-offLine-logo-close', style: 'width:' + (12 * this.fontSize) + 'px;height:' + (12 * this.fontSize) + 'px;float:right;overflow:hidden;background:url(' + $.sourceURI + 'images/close.png) no-repeat;background-size:100%;margin-right:0px;margin-top:0px;' }).appendTo(this.offlineChatLogo);
			this.offlineChatContainer = $({ tag: 'div', className: 'nTalk-window-offline-container', style: 'width:100%;height:' + (30 * this.fontSize) + 'px;flot:left;positon:relative;overflow:hidden;background:transparent;' }).appendTo(this.offlineChat);
			this.offlineChatMessage = $({ tag: 'div', className: 'nTalk-window-offline-message', style: 'width:100%;height:' + (24 * this.fontSize) + 'px;font-size:' + (16 * this.fontSize) + 'px;line-height:' + (24 * this.fontSize) + 'px;margin:0;padding:0 ;color:#2c2c2c;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;box-sizing:border-box;' }).appendTo(this.offlineChatContainer);

			this.offlineChatBottom = $({ tag: 'div', className: 'nTalk-window-offLine-bottom', style: 'width:100%;height:' + (38 * this.fontSize) + 'px;position:fixed;bottom:0;left:0;background:#007aff;text-align:center;justify-content:center;display:flex;padding:0;margin:0;z-index:10000;' }).appendTo(true);
			this.offineChatBottomMsg = $({ tag: 'span', style: 'font-size:' + (16 * this.fontSize) + 'px;line-height:' + (38 * this.fontSize) + 'px;color:#fff;display:inline-block;height:100%;vertical-align: middle;background:url(' + $.sourceURI + 'images/inviteidicon.png) no-repeat 0 ' + (13 * this.fontSize) + 'px;background-size:' + (17 * this.fontSize) + 'px ' + (16 * this.fontSize) + 'px;padding-left:' + (20 * this.fontSize) + 'px;' }).appendTo(this.offlineChatBottom).html('来和我聊天吧');
			this.offlineChatCount = $({ tag: 'div', className: 'nTalk-window-offline-count', style: 'width:' + (20 * this.fontSize) + 'px;height:' + (20 * this.fontSize) + 'px;position:absolute;right:' + (10 * this.fontSize) + 'px;top:-' + (10 * this.fontSize) + 'px;font-size:' + (12 * this.fontSize) + 'px;line-height:' + (20 * this.fontSize) + 'px;background:#ff3b30;color:#fff;text-align:center;border-radius:100%;' }).appendTo(this.offlineChatBottom).html(++this.count);

			this.headerName.html();
			this._bind();
		},
		receiveMessage: function (message, boolean, json) {
			this.offlineChat.css('display', 'block');
			this.offlineChatBottom.css('display', 'flex');
			// fix message undefined bug
			if (message && typeof message == 'string') {
				this.count = this.count + 1;
				this.offlineChatMessage.html(message);
				this.offlineChatCount.css('display', 'block').html(this.count);
			}

			if (json && json.logo) {
				if (this.headerLogo.attr('src') != json.logo) {
					this.headerLogo.attr('src', json.logo);
				}
			}
			if (json && json.name) {
				this.headerName.html(json.name);
			}
		},
		_bind: function () {
			var self = this;
			this.offlineChat.bind('click', function () {
				if (self.wid) {
					$.im_openInPageChat('', '', self.wid, { edu_inviteid: self.inviteid, edu_visitid: self.visitid });
				} else if (self.wid1) {
					$.im_openInPageChat('', '', self.wid1);
				}
				$._showMobileInPageWindow();
				self.count = 0;
				self.offlineChatCount.css('display', 'none');
			})
			this.offlineChatBottom.bind('click', function () {
				$._showMobileInPageWindow();
				$.global.showOffline = false;
				if ($('.ntalk-mobile-inpage-window').length == 0) {
					$.im_openInPageChat('', '', self.wid);
				}

			})
			this.headerClose.bind('click', function (event) {
				var event = $.Event.fixEvent(event);
				event.preventDefault();
				event.stopPropagation();
				self.offlineChat.css('display', 'none');
				self.offlineChatCount.css('display', 'block !important');
				try {
					$.chatManage.view._callEndSession(true, false);
					$.chatManage.closeChat(self.wid || self.wid1);
				} catch (e) {
					$.Log('edu chat is already end');
				}
			})
		}

	};
})(nTalk);

;
(function($, undefined) {
    /**
     * @description Base Mode
     * @rely	nt1
     * #09.17	debug 模块名称修改，兼容老板
     */

    var CON_NOIM = ['kf_9933', 'kf_9923', 'kf_9954', 'kf_10111'],
        CON_N2ID = ['kf_9933', 'kf_9949', 'kf_9954'],
        CON_FLASH_DIV = 'nt-flash-div',
        CON_NT_ID = 'ntkf_flash_ntid',
        //统计: 0:!0|1|2|4|5|6|7|8|18|19|20|21;1:all; 2:!10|11|12|13|22|23
        CON_STATICTIS = 2,
        CON_FLASHSERVER = {
            'trailserver': '',
            'presenceserver': '',
            'presencegoserver': '',
            'crmcenter': '',
            'mcenter': '',
            'coopserver': '',
            'roboturl': '',
            't2dstatus': '',
            'isnoim': 0,
            'notrail': 0,
            'preload': 2000,
            'sessioncarry': '1',
            'enable_entrance': '0',
            'enable_invite': '0',
            'close_tchat_flash': '1',
            'close_im_flash': '0',
            'robot': '0',
            'siteid': ''
        },
        emptyFunc = function() {},
        rSiteidExp = /[a-z]{2}\_\d+/ig;

    if (!$.baseURI || $.base) {
        return;
    }

    $.extend({ //CONST
        //2014.10.14
        //可配置项，配置是否加载NID.swf模块,默认值：1(加载)
        CON_LOAD_MODE_NID: 1,
        CON_CUSTOMER_ID: 0,
        CON_GROUP_ID: 1,
        CON_VISITOR_ID: 2,
        CON_SHORT_ID: 3,
        // 尚德默认WAP页内打开
        // 教育版当中将isnoim为5定义为采用mqttim服务。同时将mobileOpenInChat值设为1
        mobileOpenInChat: parseInt($.flashserver.reversechat, 10) || parseInt($.flashserver.eduautochat, 10),
        isEdu: parseInt($.flashserver.reversechat, 10),
        isAutoEdu: parseInt($.flashserver.eduautochat, 10),
        downtserver: CON_SERVER.flashserver,
        autoEduShow: false
    });
    $.base = {
        _startBase: false,
        _identityIDReady: false,
        _connectTimeID: null,
        chatLoading: false,
        clearChatCache: false,
        /**
         * @property timeOut
         * @type {Number}
         * */
        timeOut: 2000, //超时保护
        entityList: {
            '<': '&lt;',
            '>': '&gt;'
        },
        fieldList: ['shortid', 'uid', 'uname', 'isvip', 'userlevel', 'itemid', 'itemparam', 'erpparam', 'exparams'],
        CON_LOCAL_FIX: 'NOWAIT_',
        call_trail_status: false, //update 是否已调用轨迹服务，用于notrail为2时 2015-08-10
        userIdFix: '',
        _reload_trail: false,
        identityInfoJson: {}, //调取SDK中的详细信息,obj形式 2017-05-02
        useSdkData: false, //2017.05.09 是否使用SDK传入的数据
        /**
         * @property _get_page_data
         * @type {JSON}
         */
        _get_page_data: null,
        /**
         * @desc 入口共用config
         * @property config
         * @type {JSON}
         */
        config: null,
        /**
         * 初始化页面信息，获取网站配置信息
         * @return {void}
         */
        _islogin: true,
        start: function() {
            var self = this;

            if (!$.server) {
                $.Log('Loaded $server mode failed', 3);
                return;
            }
            $.Log('nTalk.base.start()', 1);
            if (!$.cookie.enable()) {
                $.Log('Does not support cookies!', 3);
            }
            $.global.pageinchat = true;
            $.global.statictis = CON_STATICTIS;
            $.source = $.url;
            this._identityIDReady = false;

            if (this._startBase) {
                return;
            }
            //每次加载脚本时以当前时间戳创建一个当前页ID作为身份标识
            this.pageid = $.getTime();

            this._startBase = true;
            this._loadFlashServer();

            if ($.isEmptyObject(CON_RULE)) {
                //获取标准页面数据
                this.getPageData();

                this._loadIdentityID(function(uid, pcid) {
                    $.Log("PCID:" + pcid, 1);

                    // cookie中获取或通过脚本创建时
                    self.startOtherMode(uid, pcid);
                });
            } else {
                this.startData(function() {

                    this._loadIdentityID(function(uid, pcid) {
                        $.Log("PCID:" + pcid, 1);

                        // cookie中获取或通过脚本创建时
                        self.startOtherMode(uid, pcid);
                    });
                });
            }
        },
        /**
         * @method chanageUserID 2015.09.18 验证用户ID是否已发生变更
         * @return {boolean}
         */
        chanageUserID: function() {
            if (typeof NTKF_PARAM == "undefined") {
                return false;
            } else if (NTKF_PARAM.uid && this.toLongID(NTKF_PARAM.uid) && this.toLongID(NTKF_PARAM.uid) != $.user.id) {
                //3个站点，uid通过uname赋值，兼容处理
                if ($.inArray($.global.siteid, CON_N2ID) > -1 && ($.global.siteid + "_ISME9754_" + NTKF_PARAM.uname == $.user.id)) {
                    return false;
                }
                //修复uid为0时，会重载数据
                return true;
            } else {
                return false;
            }
        },
        /**
         * @method overloadedData 2015.09.18 重载集成的用户信息
         * @param  {json}     uData     重置用户数据，结构参见NTKF_PARAM
         * @param  {function} callback  获取数据完成后回调函数
         * @return {void}
         */
        overloadedData: function(uData, callback) {
            if ($.isFunction(uData)) {
                callback = uData;
                uData = null;
            }

            $.Log('nTalk.base.overloadedData()');
            if ($.isEmptyObject(CON_RULE)) {
                //重新获取常规数据
                this.getPageData(uData);

                //重载数据中用户ID为空时，继承原用户ID
                $.user.id = $.global.uid || $.user.id;
                $.user.name = $.global.uname || '';
                $.cache.set('uid', $.user.id);

                if ($.isFunction(callback))
                    callback();

                $.base.startTrail($.base._islogin, true);
            } else {
                this.startData(function() {
                    $.user.id = $.global.uid || $.user.id;
                    $.user.name = $.global.uname || '';
                    $.cache.set('uid', $.user.id);

                    if ($.isFunction(callback))
                        callback();

                    $.base.startTrail($.base._islogin, true);
                }, uData);
            }
        },
        /**
         * @method startData 加载数据模块
         * @param  function callback
         * @param  Object   uData     网站传递的数据
         * @return {void}
         */
        startData: function(callback, uData) {
            var self = this;
            $.Log('nTalk.base.startData()');

            $.require({
                data: 'data.js' + $.baseExt
            }, function(data) {
                if (!data) {
                    $.Log('Loaded $data mode failed', 3);
                    return;
                }

                var pData = $.data.start(CON_RULE);

                self._get_page_data = $.extend({}, pData, uData);

                self.getPageData(self._get_page_data);

                callback.call(self);
            });
        },
        /**
         * @method _execMode 加载数据模块
         * @param  function callback
         * @return {void}
         */
        _execMode: function() {
            var self = this;

            this._startBase = true;
            this._loadFlashServer();

        },
        /**
         * @method startTrail 加载轨迹模块
         * @param  boolean  isLogin
         * @param  boolean  isUpdate
         * @return {void}
         */
        startTrail: function(isLogin, isUpdate, uid) {
            var self = this;

            // 在sdk中
            $.require({
                trail: 'trail.js' + $.baseExt
            }, function(trail) {
                if (!trail) {
                    $.Log('Loaded $trail mode failed', 3);
                    return;
                }

                var callback = function(){};

                if (uid) {
                    callback = function() {
                        self.trailGetRegion(uid);
                    }
                }

                $.trail.start(isLogin, isUpdate, self.useSdkData, callback);
            });
        },
        /**
         * 开始创建xpush
         */
        startXPush: function() {
            var scriptList = {};

            if ($.xpush && $.xpush.connect) {
                return;
            }

            scriptList.XPUSH = 'xpush.js' + $.baseExt;

            if ($.browser.supportMqtt) {
                scriptList.MQTT = 'mqtt31.js' + $.baseExt;
            }

            $.require(scriptList, function() {
                $.xpush.init();
            });
        },
        /**
         * 开始创建IM连接
         * @return {void}
         * 2017-03-01
         * 建立mqttim连接方式
         */
        startIM: function() {
            var scriptList = {};
            //连接已创建，不再重复执行
            if ($.im && $.im.connect) {
                return;
            }
            scriptList.IM = 'im.js' + $.baseExt;
            //Opened the chat window
            if ($.browser.supportMqtt && $.server.eduimmqttserver && $.server.tchatConnectType == 1) {
                scriptList.MQTT = 'mqtt31.js' + $.baseExt;
            } else if ($.flash.support && $.server.eduimmqttserver && $.server.tchatConnectType == 1) {
                scriptList.MQTT = 'flashsock.js' + $.baseExt;
                // scriptList.Connection = 'mqtt.im.js' + $.baseExt;
            }
            scriptList.Connection = 'mqtt.im.js' + $.baseExt;
            $.require(scriptList, function() {
                $.im.start();
            });
        },
        /**
         * 执行livecrm
         * @param data	json|Array
         * @param retry	boolean		来自重载数据
         * @param cache	boolean		来自缓存的数据
         * @return {void}
         */
        startLCrm: function(data, retry, cache) {
            var receiveData = data && $.isArray(data) ? data : [data];
            $.require({
                lcrm: 'lcrm.js' + $.baseExt
            }, function(lcrm) {
                $.each(receiveData, function(index, data) {

                    $.Log('start lcrm mode', 1);
                    $.lcrm.start(data, retry, cache);
                });
            });
        },
        /**
         * @description 打开聊窗
         * @param {string} settingid
         * @param {string} destid
         * @param {string} itemid
         * @param {string} itemparam
         * @param {string} sellerid
         * @param {string} noWaitConnect
         * @param {string} single	是否是单客服 -1 为未知
         * @param {boolean} manual	是否强制进入人工客服
         * @return {void}
         */
        startChat: function(settingid, destid, itemid, itemparam, sellerid, noWaitConnect, single, manual, edu_inviteid, edu_visitid) {
            var scriptList;

            settingid = settingid || '';
            destid = destid || '';
            itemid = itemid || '';
            itemparam = itemparam || '';
            sellerid = sellerid || '';
            edu_inviteid = edu_inviteid || '';
            edu_visitid = edu_visitid || '';

            if ($.im) {
                $.im.hideTips();
            }
            if ($.base.chatLoading === true) {
                $.Log('loading......', 2);
                return;
            }
            $.Log('$.base.startChat(' + $.JSON.toJSONString(arguments) + ')', 1);

            $.base.showLoading();

            scriptList = {
                lang: ($.extParmas.lan || 'zh_cn') + '.js' + $.baseExt
            };

            //2015-05-03 增加tchatConnectType开关，用来控制是否使用mqtt
            if ($.browser.supportMqtt && $.server.tchatmqttserver && $.server.tchatConnectType == 1) {
                scriptList.MQTT = 'mqtt31.js' + $.baseExt;
                scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
            } else if ($.flash.support && $.server.tchatmqttserver && $.server.tchatConnectType == 1) {
                scriptList.MQTT = 'flashsock.js' + $.baseExt;
                scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
            } else {
                scriptList.TChat = 'comet.chat.js' + $.baseExt;
            }

            //2015.10.09 添加开发工具支持，允许在本地调用聊窗脚本
            if ($.global.themes) {
                delete nTalk['chatManageView'];
                delete $.ntView;
                scriptList.chatManage = 'chat.js' + $.baseExt;
                scriptList.chatManageView = $.global.themes + '/chat.view.in.js' + $.baseExt;
                $.themesURI = $.global.themes + '/images/';
            } else if ($.mobileOpenInChat && $.browser.mobile) {
                scriptList.chatManage = 'chat.js' + $.baseExt;
            } else {
                scriptList.chatManage = 'chat.in.js' + $.baseExt;
            }
            scriptList.Window = 'nt2.js' + $.baseExt;

            //2015.06.19 加载机器人模块
            if ($.server.robot == 1) {
                scriptList.Robot = 'robot.js' + $.baseExt;
            }

            $.require(scriptList, function() {

                $.base.hiddenLoading();

                if (!$.chatManage) {
                    $.Log('Load $chatManage mode failed', 3);
                    return;
                } else {
                    $.Log('load $chatManage mode complete');
                }
                if ($.chatManage.open(settingid, destid, itemid, itemparam, sellerid, noWaitConnect, single, manual, edu_inviteid, edu_visitid)) {
                    if (!edu_inviteid) {
                        $.cache.set('opd', 1);
                    }

                }
            });
        },
        /**
         * @method startEntrance 加载邀请模块
         * ////////////////////////////////////////////////
         * @config array entranceConfig
         *         $settingid => $entrance_file
         */
        startEntrance: function() {
            var entranceFile = $.server.entranceConfig[$.global.settingid] || "";
            $.Log('$.base.startEntrance()');

            if (!entranceFile || !$.server.entranceConfig || $.isEmptyObject($.server.entranceConfig)) {
                return;
            }

            $.require({
                entrance: entranceFile + $.baseExt
            }, function(entrance) {
                if (!entrance) {
                    $.Log('Load $.entrance mode failed', 3);
                    return;
                }
                if ($.server.enable_entrance != "0" && $.options.entrance) {
                    $.entrance.start('entrance');
                }
                if ($.server.enable_entrance != "0" && $.options.invite) {
                    $.entrance.start('invite');
                }
            });
        },
        /**
         * 显示加载中
         * @return {[type]} [description]
         */
        showLoading: function() {
            $.base.chatLoading = true;
            $.base.startTime = $.getTime();

            if (!this.loadingElement || !this.loadingElement.length) {
                this.loadingElement = $({
                        id: "ntalk-chat-loading",
                        style: $.STYLE_NBODY + "width:100%;height:33px;position:fixed:right:0;bottom:0;z-index:9999;"
                    })
                    .appendTo(true).fixed({
                        right: 0,
                        bottom: 0
                    }).html('<div style="' + $.STYLE_BODY + 'margin:0 auto;width:99px;height:33px;background:url(' + $.imageloading + ') no-repeat 0 0;"></div>');
            } else {
                this.loadingElement.display(1);
            }

            return this.loadingElement;
        },
        hiddenLoading: function() {
            this.loadingElement.display();
            $.base.endTime = $.getTime();
            $.base.chatLoading = false;

            $.Log('$.base.showLoading-hiddenLoading execute time:' + ($.base.endTime - $.base.startTime) + ' ms', 1);
        },
        /**
         * 转换为长ID
         * @param  {String}	id  用户ID
         * @return {String}    返回长用户ID
         */
        toLongID: function(id) {
            //2016.12.15 超过47位的uid会报错，这里做了截取。
            if (id.length > 47) {
                id = id.substr(0, 47);
            }
            var verify = this.checkID(id);
            if (verify === $.CON_SHORT_ID) {
                return $.global.siteid + '_ISME9754_' + id;
            } else if (verify == $.CON_VISITOR_ID) {
                return id;
            } else {
                return '';
            }
        },
        toShortID: function(id) {
            var verify = this.checkID(id);
            if (verify === $.CON_SHORT_ID) {
                return id;
            } else if (verify === $.CON_VISITOR_ID) {
                return id.replace(this.userIdFix, "");
            } else {
                return "";
            }
        },
        /**
         * 验证ID类型
         * @param  {String}   id      访客、客服、客服组，会员ID
         * @return {boolean|number}   返回ID类型
         */
        checkID: function(id) {
            id = id ? id.toString() : "";
            if (!id || id === '0') {
                return false;
            } else if (id.indexOf('_ISME9754_T2D') > -1) {
                return $.CON_CUSTOMER_ID; //destid
            } else if (id.indexOf('_ISME9754_GT2D') > -1) {
                return $.CON_GROUP_ID; //groupid
            } else if (id.indexOf($.global.siteid + '_ISME9754_') > -1) {
                return $.CON_VISITOR_ID; //uid
            } else {
                return $.CON_SHORT_ID; //shortid
            }
        },
        /*2017-02-10
         *从轨迹库收集访客的信息
         *userid
         *
         *
         *
         *
         */
        trailGetRegion: function(uid) {
            var url, callBackName, trailGetNews;
            $.global.trailGetRegion = new Object();
            $.global.trailGetRegion.success = false;
            $.global.trailGetRegion.ip = "";
            $.global.trailGetRegion.country = "";
            $.global.trailGetRegion.province = "";
            $.global.trailGetRegion.city = "";
            callBackName = "trail_getregion_" + $.randomChar();
            url = $.protocolFilter($.flashserver.trailserver) + "/userinfo.php?action=getregion&";
            trailGetNews = $.toURI({
                siteid: $.global.siteid,
                userid: uid,
                callback: callBackName
            })

            window[callBackName] = function(result) {
                if (result.success == true) {
                    $.global.trailGetRegion.success = true;
                    $.global.trailGetRegion.ip = result.data.ip;
                    $.global.trailGetRegion.country = result.data.country;
                    $.global.trailGetRegion.province = result.data.province;
                    $.global.trailGetRegion.city = result.data.city;
                }
            }
            $.require(url + trailGetNews);
        },
        /**
         * @method startOtherMode 跟据配置项，加载并执行相关模块
         * @param {String} uid    用户ID
         * @param {String} pcid   PCID
         * @return {void}
         * */
        startOtherMode: function(uid, pcid) {
            var cacheUID = $.cache.get('uid') || '',
                options, carry;

            //清除超时保护
            clearTimeout(this._connectTimeID);
            this._connectTimeID = null;
            this._identityIDReady = true;

            $.Log('cache uid:' + cacheUID + ', site uid:' + uid + ', return uid:' + uid, 1);
            if (!cacheUID) {
                this._islogin = true;
            } else {
                this._islogin = cacheUID != uid;
            }

            $.global.pcid = pcid;
            $.user.id = uid;
            if ($.isDefined($.global.uname)) {
                $.user.name = $.global.uname;
            }

            $.cache.set('uid', uid);
            $.cookie.set($.CON_PCID_KEY, pcid, 1000 * 3600 * 24 * 365 * 2);

            //update notrail: 0：默认值，直接调用轨迹服务；1：关闭轨迹服务；2：首次打开聊窗时调用轨迹；2015-08-10
            if ($.server.notrail === 0) {
                this.startTrail(this._islogin, false, uid);
            } else {
                $.Log('no load trail');
                //2017.07.05 调整轨迹调用的顺序 
                //从轨迹库手机访客信息
                this.trailGetRegion(uid);
            }


            //2014.12.10 加载entrance模块
            if ($.server.entranceConfig && ($.server.enable_entrance != "0" || $.server.enable_invite == "1")) {
                //enable_entrance为2代表，移动端不开启入口
                if ($.server.enable_entrance == "2" && $.browser.mobile) {
                    return;
                }
                this.startEntrance();
            }
            // debug
            $.server.xpush = 1;
            if ($.server.xpush == 1) {
                this.startXPush();
            } else {
                if (!$.server.isnoim || $.server.isnoim == 3 || ($.server.isnoim == 2 && $.cache.get('opd') == '1')) {
                    $.Log('nTalk.base.startIM()::' + $.im, 1);
                    this.startIM();
                } else {
                    $.Log("no load im, isnoim:" + $.server.isnoim + ', opd:' + $.cache.get('opd'), 1);
                }
            }

            if ($.browser.mobile == 1) {
                var css = ['.full-html,.full-body{',
                    'width: 100% !important;',
                    'height: 100% !important;',
                    'margin: 0 !important;',
                    'overflow: hidden !important;',
                    '}',

                    '.full-body *{',
                    'display: none !important;',
                    '}',

                    '.full-iframe {',
                    'display: block !important;',
                    '}',

                    '.full-inpage {',
                    'width: 100% !important;',
                    'height: 100% !important;',
                    'margin: 0 !important;',
                    'overflow: hidden !important;',
                    'background: rgb(243, 243, 247) !important;',
                    '}',

                    '.full-inpage > *:not(.ntalk-mobile-inpage-background) {',
                    'display: none !important;',
                    '}'
                ].join("");
                $.addMobileStyle(css);
            }

            //预加载、携带
            carry = {
                settingid: $.cache.get('carry_sid'),
                destid: $.cache.get('carry_did')
            };
            if ($.server.sessioncarry != '0' && carry.settingid && !$.browser.mobile) {
                $.Log('sessioncarry:' + $.JSON.toJSONString(carry));

                $.cache.set('carry_sid', '');
                $.cache.set('carry_did', '');

                if (carry.settingid) {
                    // 教育版直接邀请方式打开的就不在打开了。
                    if (carry.settingid.indexOf('ISME9754') > -1) {
                        return;
                    }
                    if ($.browser.mobile || !$.global.pageinchat) {
                        options = {
                            "single": -1
                        };
                        $.im_openOutPageChat(carry.settingid, '', carry.destid, options, "");
                    } else {
                        options = {
                            "autoconnect": true,
                            "single": -1
                        };
                        $.im_openInPageChat(carry.settingid, '', carry.destid, options, "");
                    }
                }
            } else if ($.server.preload > 0 && !$.global.themes) {
                this.preloadChat();
            }
        },
        /**
         * @method preloadChat 预加载聊窗模块
         * @return {void}
         */
        preloadChat: function() {
            var scriptList;

            $.Log('$.base.preloadChat()', 1);
            setTimeout(function() {
                if ($.base.chatLoading === true) {
                    return;
                }
                scriptList = {
                    lang: ($.extParmas.lan || 'zh_cn') + '.js' + $.baseExt
                };
                //2015.10.09 添加开发工具支持，允许在本地调用聊窗脚本
                if ($.global.themes) {
                    scriptList.chatManage = 'chat.js' + $.baseExt;
                    scriptList.chatManageView = $.global.themes + '/chat.view.in.js' + $.baseExt;

                    $.themesURI = $.global.themes + '/images/';
                } else if ($.mobileOpenInChat && $.browser.mobile) {
                    scriptList.chatManage = 'chat.js' + $.baseExt;
                    //教育版就不预加载聊窗的样式了
                    /*if($.flashserver.layout && $.flashserver.layout != '1' ){
                    	scriptList.chatManageView ='chat.view.wap.theme'+$.flashserver.layout+'.js' + $.baseExt;
                    }else{
                    	scriptList.chatManageView ='chat.view.wap.js' + $.baseExt;
                    }*/
                } else {
                    scriptList.chatManage = 'chat.in.js' + $.baseExt;
                }
                scriptList.Window = 'nt2.js' + $.baseExt;
                if ($.browser.supportMqtt && $.server.tchatmqttserver && $.server.tchatConnectType == 1) {
                    scriptList.MQTT = 'mqtt31.js' + $.baseExt;
                    scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
                } else if ($.flash.support && $.server.tchatConnectType == 1) {
                    scriptList.MQTT = 'flashsock.js' + $.baseExt;
                    scriptList.Connection = 'mqtt.chat.js' + $.baseExt;
                } else {
                    scriptList.TChat = 'comet.chat.js' + $.baseExt;
                }

                //2015.06.19 加载机器人模块
                if ($.server.robot == 1) {
                    scriptList.Robot = 'robot.js' + $.baseExt;
                }
                $.require(scriptList, function(lang, chatManage) {
                    if (!chatManage) {
                        $.Log('preload $chatManage mode failed', 3);
                    } else {
                        $.Log('preload $chatManage mode complete');
                    }
                });
            }, $.server.preload);
        },
        /**
         * 获取NTKF_PARAM参数
         * @param Object pageData
         * @return {Object|boolean}  页面数据
         */
        getPageData: function(pageData) {
            var data;
            $.Log('nTalk.base.getPageData()');

            data = $.extend({}, typeof NTKF_PARAM !== 'undefined' ? NTKF_PARAM : {}, pageData);

            //2014.12.27 新增传入参数exparams(object)
            //2017.04 新增传入参数。
            $.whereGetTo($.global, data, [
                'siteid', 'sellerid', 'settingid', 'uid', 'uname', 'exparams', 'themes', 'callbacks', 'backURL',
                'isvip', /*-是否是VIP-*/
                'userlevel', /*-用户级别-*/
                'itemid', 'itemparam', /*-商品(老版本)-*/
                'orderid', 'orderprice', /*-订单-*/
                'erpparam', /*-ERP参数-*/
                'ntalkerparam', /*-新版商品信息-*/
                'pagetype', /*-页面类型，特殊参数，传入轨迹服务-*/
                'title', 'lang', 'iconid',
                'usertag','userrank'    /*-2017.08.17用户标签-*/
            ], [null, null, null, 'shortid', 'uname', 'exparams', 'themes', 'callbacks', 'backURL','usertag','userrank']);

            $.global.siteid = ($.global.siteid + '').replace(/^\s+|\s+$/, '');
            $.global.settingid = ($.global.settingid + '').replace(/^\s+|\s+$/, '');
            //2015.06.02 允许页面中不传任何参数，其中siteid可以使用加载脚本时的siteid
            $.global.siteid = $.global.siteid && rSiteidExp.test($.global.siteid) ? $.global.siteid : ($.extParmas.siteid || '');
            if ($.global.siteid === '') {
                return false;
            }
            //-兼容参数中pagetype为空，URL中含页面类型参数source
            $.global.pagetype = $.params.source || '';

            //2014.11.20 添加orderid, orderprice单个的字符串，用逗号分隔的多个或数组型式多个
            $.global.sellerid = $.isArray($.global.sellerid) ?
                $.global.sellerid :
                $.global.sellerid.toString().indexOf(',') > -1 ?
                $.global.sellerid.split(',') :
                $.global.sellerid ? [$.global.sellerid] : [];
            $.global.orderid = $.isArray($.global.orderid) ?
                $.global.orderid :
                $.global.orderid.toString().indexOf(',') > -1 ?
                $.global.orderid.split(',') :
                $.global.orderid ? [$.global.orderid] : [];
            $.global.orderprice = $.isArray($.global.orderprice) ?
                $.global.orderprice :
                $.global.orderprice.toString().indexOf(',') > -1 ?
                $.global.orderprice.split(',') :
                $.global.orderprice ? [$.global.orderprice] : [];

            if ($.inArray($.global.siteid, CON_N2ID) > -1) {
                $.global.shortid = $.global.uname || '';
            }

            if (!$.global.itemid && $.global.ntalkerparam) {
                if (!$.isObject($.global.ntalkerparam)) {
                    $.Log('ntalkerparam param abnormal', 2);
                }
                //-新版商品详情页
                if ($.global.ntalkerparam.item) {
                    $.global.itemid = $.global.ntalkerparam.item.id;
                }
            }
            if (!/number|string/i.test(typeof $.global.shortid) || !/string/i.test(typeof $.global.uname)) {
                //原uid 为空，此处退出，导致异常
                $.Log("userid or username type error");
                $.global.shortid = "";
                $.global.uname = "";
            }
            $.referrer = $.enCut($.referrer, 255);
            $.global.settingid = $.global.settingid && /[a-z]{2}\_\d+\_\d+/ig.test($.global.settingid) ? $.global.settingid : '';
            $.global.iconid = $.isNumeric($.global.iconid) ? $.global.iconid : 0;
            $.global.title = $.enCut($.title, 255);
            $.global.shortid = !$.global.shortid || $.global.shortid == '0' ? '' : $.enCut($.global.shortid, 64 - $.enLength($.global.siteid) - 10);
            $.global.uname = !$.global.shortid || $.global.shortid == '0' || /^(undefined|null|0)$/gi.test($.global.uname) ? '' : $.global.uname ? $.enCut($.global.uname, 32) : $.enCut($.global.shortid, 32);
            $.global.uid = this.toLongID($.global.shortid);
            $.global.isvip = $.isNumeric($.global.isvip) ? $.global.isvip : $.isNumeric($.global.userlevel) ? $.global.userlevel : 0;
            $.global.userlevel = $.isNumeric($.global.userlevel) ? $.global.userlevel : 0;

            if ($.inArray($.global.siteid, CON_N2ID) > -1) {
                $.global.shortid = $.global.uname || "";
            }
            //过滤4字节字符
            $.global = this.filterJSONChar($.global, "");
            // 改变callbacks的类型
            this.changeDataFormat();

            $.Log('global: ' + $.JSON.toJSONString($.global), 1);

            return $.global;
        },
        /**
         * 2017.04
         * [changeDataFormat 改变NTKF_PARAM.callbacks 的数据格式]
         * @param  {[Array]} callbacks [需要处理的数组]
         * @return {[Object]}     [处理后的数组]
         */
        changeDataFormat: function() {
            var arr = $.global.callbacks,
                val = {};
            if (!$.isArray(arr) || arr.length === 0) {
                $.global.callbacks = val;
                return;
            }
            for (var i = 0; i < arr.length; i++) {
                if (!$.isArray(arr[i]) || arr[i].length < 2 || !$.isFunction(arr[i][1])) {
                    continue;
                }
                val[arr[i][0]] = arr[i][1];
            }
            $.global.callbacks = val;
        },
        /**
         * @method _filterChar  过滤四字节字符,首尾无空格
         * @param  {String}  str   需要处理的字符串
         * @param  {Boolean} clear 是否过滤
         * @return {String}        过滤后的字符串
         */
        _filterChar: function(str, clear) {
            var res = [],
                reg, tmp;
            if (clear) $.each(this.entityList, function(name, value) {
                try {
                    //$.Log(name + ' - ' + value);
                    reg = new RegExp(name, 'gi');
                    str = str.replace(reg, value);
                } catch (e) {}
            });

            for (var i = 0, len = str.length; i < len; i++) {
                try {
                    tmp = encodeURIComponent(str.charAt(i));
                    res.push(str.charAt(i));
                } catch (e) {
                    try {
                        //for no doctype 无效
                        tmp = encodeURIComponent(str.charAt(i) + str.charAt(i + 1));
                        res.push((!res.length ? '' : ' ') + tmp.replace(/%/gi, '') + (i + 2 >= len ? '' : ' '));
                        ++i;
                    } catch (e) {
                        res.push(str.charAt(i));
                    }
                }
            }
            return res.join('');
        },
        /**
         * @method filterJSONChar 过滤字符
         * @param {Object|Array|String|Number|Boolean}    data
         * @param {String|Number}  key
         * @retrun {json}
         */
        filterJSONChar: function(data, key) {
            var result, self = this;

            if ($.isObject(data)) {
                result = {};
                $.each(data, function(k, item) {
                    result[k] = self.filterJSONChar(item, k);
                });
            } else if ($.isArray(data)) {
                result = [];
                for (var i = 0; i < data.length; i++) {
                    result[i] = this.filterJSONChar(data[i], i);
                }
            } else if (typeof data == 'string') {
                result = this._filterChar(data, $.inArray(key, this.fieldList) !== -1);
            } else {
                result = data;
            }
            return result;
        },
        /**
         * @description 加载PCID,存在则直接使用，不存在则创建，等待返回
         * @param {function} callback 获取或创建PCID完成后，回调此函数
         * @return {void}
         */
        _loadIdentityID: function(callback /*:function*/ ) {
            var self = this,
                uid, diff, pcid = "";

            // 如果SDK获取不到pcid将前端的pcid传给SDK 延时200ms 2017-05-02
            var appPushUserInfo = function(uid, pcid) {
                if (typeof ntalker !== "undefined" && ntalker.pushUserInfo && !identityInfoJson.pcid) {
                    if (PushUserInfoTimeout) {
                        clearTimeout(PushUserInfoTimeout);
                    }
                    var PushUserInfoTimeout = setTimeout(ntalker.pushUserInfo({
                        pcid: pcid,
                        uid: uid,
                        shortid: $.global.shortid,
                        uname: $.global.uname
                    }), 200)
                }
            }
            //2015.12.30 添加通过SDK获取PCID
            //2017.05.02 启用新api:getIdentityInfo来获取pcid
            if (typeof ntalker !== "undefined") {
                try {
                    $.Log('get sdk pcid');

                    this.identityInfoJson = $.JSON.parseJSON(ntalker.getIdentityInfo());
                    if (this.identityInfoJson) {
                        pcid = this.identityInfoJson.pcid;
                        $.global.trailid = this.identityInfoJson.tid;
                        $.global.uid = this.identityInfoJson.uid;
                        $.user.id = this.identityInfoJson.uid;
                        $.global.shortid = this.identityInfoJson.shortid;
                        this.useSdkData = true;
                    }
                } catch (e) {
                    // identityInfoJson 获取不到走老api
                    $.Log('get sdk pcid');
                    if (ntalker.getIdentityID && typeof ntalker.getIdentityID === 'function') {
                        pcid = ntalker.getIdentityID();
                    }
                }
            }
            $.Log('ntalker type : ' + (typeof ntalker));

            if (pcid === "") {
                pcid = $.cookie.get($.CON_PCID_KEY);
            }

            // 如果使用sdk数据且trailid存在，不从cookie中读取trailid
            if (!(this.useSdkData && $.global.trailid)) {
                $.global.trailid = $.cache.get('tid');
            }

            this.userIdFix = $.global.siteid + '_ISME9754_';

            //2014.07.23
            //解决访问不关闭浏览器，会话ID跨天问题
            //2015.05.09
            //如果trailid存在，且非sdk数据的模式下，需要判断时间差清除trailid
            if ($.global.trailid && !this.useSdkData) {
                diff = Math.round(($.getTime() - +($.global.trailid.toString().substr(0, 13))) / 3600000);

                //$.Log('diff:' + diff, 2);
                // 当会话ID超过4小时，强制重新创建会话ID
                if (diff >= 4) {
                    $.global.trailid = '';
                }
            }

            if (!$.global.trailid || $.url.indexOf("livecrmtest") > -1) {
                //创建新会话ID
                $.global.trailid = $.getTime(2);

                //新会话，清除
                $.base.clearChatCache = true;

                //IM:清除缓存数据
                if ($.flashData) {
                    $.flashData.clearAll();
                }
            }

            if (pcid && pcid.length > 10) {
                //2014.09.15
                //加载的访客ID属于另一个站点的ID时，重新创建
                if ($.global.uid && $.global.uid.indexOf($.global.siteid) > -1) {
                    uid = $.global.uid;
                } else {
                    uid = this.userIdFix + pcid.substr(0, 21);
                }

                $.Log('load PCID:' + pcid + ', uid:' + uid);

                callback.call(this, uid, pcid);
                if (!this.useSdkData) {
                    appPushUserInfo(uid, pcid);
                }
            } else {

                if ($.flash.support && !$.browser.mobile) {
                    // 需要等待FlashReady

                    this._createNTID({
                        u: $.global.uid,
                        siteid: $.global.siteid,
                        //是否加载NID.swf模块
                        loadnid: $.CON_LOAD_MODE_NID
                    });

                    // 创建一个临时PCID, 预防Flash被浏览器插件禁用
                    pcid = this._createScriptPCID(true);

                    $.Log('create flash PCID, tmp pcid:' + pcid);

                    uid = $.global.uid || (this.userIdFix + pcid.substr(0, 21));

                    //预防异常,用户太快打开聊窗
                    $.global.pcid = pcid;
                    $.user.id = uid;
                    //超时未创建pcid,转comet连接
                    this._connectTimeID = setTimeout(function() {

                        $.global.connect = $.CON_CONNECT_COMET;

                        $.Log('timeout:' + self.timeOut + ' no create pcid', 2);

                        callback.call(self, uid, pcid);
                        appPushUserInfo(uid, pcid);
                    }, this.timeOut);
                } else {
                    if ($.cookie.enable()) {
                        pcid = this._createScriptPCID(false);

                        $.Log('create script PCID');

                        uid = $.global.uid || (this.userIdFix + pcid.substr(0, 21));

                        callback.call(this, uid, pcid);
                        appPushUserInfo(uid, pcid);
                    } else {
                        $.require({
                            Fingerprint2: 'fingerprint2.js' + $.baseExt
                        }, function(Fingerprint2) {
                            if (!$.Fingerprint2) {
                                $.Log('load Fingerprint2 failure');
                                return;
                            }
                            fingerprint2 = new $.Fingerprint2();

                            fingerprint2.get(function(id) {
                                pcid = ("guest-Fin" + id);

                                uid = $.global.uid || (self.userIdFix + pcid.substr(0, 21));

                                callback(uid, pcid);
                                appPushUserInfo(uid, pcid);
                            });
                        });
                    }
                }
            }

            if ($.isAutoEdu) {
                $.require({
                    auto : 'auto.js' + $.baseExt
                }, function(){});
            }

        },
        /**
         * @description 创建NTID
         * @return {void}
         */
        _createNTID: function(flashvars /*:json*/ ) {
            var flashdiv = $('#' + CON_FLASH_DIV),
                flashhtml = $.flashHtml(CON_NT_ID, $.sourceURI + 'fs/NTID.swf?' + $.version.ntid, flashvars);

            //修复IE下flash创建到body下，导致页首空行
            if (!flashdiv.length) {
                flashdiv = $(document.body).insert('<div id="' + CON_FLASH_DIV + '" style="position: absolute; z-index: 9996; top: -200px;"></div>');
            }

            flashdiv.insert(flashhtml);
        },
        /**
         * 通过脚本创建一个PCID
         * @param  {Boolean}   isTemp
         * @return {String}	返回一个PCID,8位随机数&13位时间戳&三位时间戳
         */
        _createScriptPCID: function(isTemp) {
            /*
            2014.10.27 回滚版本，使用原pcid
            return [
            	istemp ? 'T' + $.randomChar(7, 10) : $.randomChar(8, 10),
            	$.getTime(2)
            ].join('');
            */
            return "guest" + [
                isTemp ? 'TEMP' + $.randomChar(4) : $.randomChar(8),
                $.randomChar(4),
                $.randomChar(4),
                $.randomChar(4),
                //2015.11.06 修改为由时间戳生成随机串
                //$.randomChar(12)
                $.getTime().toString(16).toUpperCase().substr(-8) + $.randomChar(4)
            ].join("-");
        },
        /**
         * 加载getflashserver，获取服务器地址配置
         * @return {void}
         */
        _loadFlashServer: function() {
            $.Log('start load flashserver.');
            $.require({
                flashserver: $.server.flashserver + '/func/getflashserver.php?' + $.toURI({
                    resulttype: 1,
                    siteid: $.global.siteid,
                    callbackname: "nTalk._callFlashServer"
                }) + '#rnd'
            }, function(flashserver) {
                flashserver = $.extend({}, CON_FLASHSERVER, flashserver);

                $.server = $.protocolFilter($.extend($.server, flashserver));
            });
        },

        /**
         * 2017.04
         * [fire   兼听会话连接相关事件]
         * @param  {[string]} eventName [事件名]
         * @param  {[array]}  args       [事件发生时返回的参数]
         * @returns {Boolean}
         */
        fire: function(eventName, args) {
            if (!$.global.callbacks[eventName]) {
                return true;
            }

            return $.global.callbacks[eventName].apply(this, args);
        }
    };

    $.extend({ /*private function*/
        /**
         * flashserver回调函数
         * @param  {Object} data        json格式服务器地址
         * @param  {Number} resultType
         * @return {void}
         */
        _callFlashServer: function(data, resultType) {
            $.flashserver = data;

            $.server = $.protocolFilter($.extend($.server, $.flashserver));

            $.Log('$flashserver loading is complete. resultType:' + resultType);
        },
        /**
         * NTID 回调函数
         * @param  {String} uid		用户ID
         * @param  {String} pcid	PCID
         */
        fIM_presenceFlashReady: function(uid, pcid) {
            setTimeout(function() {
                //NTID与impresence回调都是同一接口，
                //所以添加一个_identityIDReady状态判断用以区分
                if (!$.base._identityIDReady) {
                    $.Log('>RETURN flash PCID, uid:' + uid + ', pcid:' + pcid, 1);
                    if (uid && pcid) {
                        $.base.startOtherMode(uid, pcid);
                    }
                } else {
                    $.Log('$.fIM_presenceFlashReady()');
                    if (!$.Event.fireEvent(document, 'focus')) {
                        $.Event.fireEvent(document, 'click');
                    }
                    if ($.im && $.im.connect) {
                        $.im.connect.stopSwitchConnect();
                    }
                }
            }, 0);
            return true;
        },

        /**
         * flash检查js是否ready
         */
        isJsReady: function() {
            return true;
        },

        _createMobileOpenInPageWindow: function(edu_inviteid) {
            var chatElement = $(".ntalk-mobile-inpage-window");

            if (!chatElement.length) {
                //2015.12.18 强制显示iframe
                var times = 1;
                chatElementBack = $({
                    tag: 'div',
                    className: 'ntalk-mobile-inpage-background',
                    style: 'background:rgba(0,0,0,0.3);width:100%;height:100%;position:absolute;left:0;top:0px;-webkit-overflow-scrolling: touch;overflow:hidden;z-index:1000000000000000;display:none;'
                }).appendTo(true);
                chatElement = $({
                    className: "ntalk-mobile-inpage-window",
                    "data-status": "visible",
                    style: $.STYLE_BODY + 'background:#fff;width:100%;height:100%;position:fixed;left:0;bottom:0px;-webkit-overflow-scrolling: touch;overflow:hidden;z-index:1000000000000000;display:block;'
                }).appendTo(chatElementBack);
                // debug
                chatElement.bind('touchmove', function(event) {
                    $.Event.fixEvent(event).stopPropagation();
                });
                // 在微博，微信内显示90%的聊天窗口
                if ($.browser.micromessenger || $.browser.weibo) {
                    times = 0.9;
                }
                chatElement.css({
                    'width': '100%',
                    'height': 100 * times + '%'
                });
                if (chatElement.attr("data-status") == "hidden") {
                    chatElement.css("top", 100 * times + '%');
                } else {
                    chatElement.css("bottom", "0px");
                }
                $(window).bind('resize', function() {
                    // 在微博，微信内显示90%的聊天窗口
                    var times = 1;
                    if ($.browser.micromessenger || $.browser.weibo) {
                        times = 0.9
                    }
                    chatElement.css({
                        'width': '100%',
                        'height': 100 * times + '%'
                    });
                    if (chatElement.attr("data-status") == "hidden") {
                        chatElement.css("height", 100 * times + '%');
                    } else {
                        chatElement.css("bottom", "0px");
                    }
                });
                if (!edu_inviteid) {
                    $._showMobileInPageWindow();
                }
                chatElementBack.bind('click', function() {
                    $._hideMobileInPageWindow();
                })
                chatElement.bind('click', function() {
                    $.Event.fixEvent(event).stopPropagation();
                })
                return {
                    created: true,
                    element: chatElement
                };
            } else {
                if (!edu_inviteid) {
                    $._showMobileInPageWindow();
                }

                return {
                    created: false,
                    element: chatElement
                };
            }
        },

        /**
         * @method _createMobileIframeWindow 创建移动设备页内iframe
         * @param  string name
         * @retrun Object
         */
        _createMobileIframeWindow: function(name) {
            var chatElement = $(".ntalk-mobile-iframe-window"),
                iframeElement = $("IFRAME[name=" + name + "]"),
                mChatWindow;

            if (!chatElement.length) {
                //2015.12.18 强制显示iframe
                chatElement = $({
                    className: "ntalk-mobile-iframe-window",
                    "data-status": "visible",
                    style: $.STYLE_BODY + 'background:#fff;width:100% !important;height:100% !important;position:fixed;left:0;top:0px;-webkit-overflow-scrolling: touch;overflow-y:scroll'
                }).appendTo(true);
                iframeElement = $({
                    tag: 'IFRAME',
                    name: name,
                    style: $.STYLE_BODY + 'width:100% !important;height:100% !important;display:block !important;',
                    src: 'about:blank'
                }).appendTo(".ntalk-mobile-iframe-window");

                $(window).bind('resize', function() {
                    $(iframeElement).css({
                        'width': '100%',
                        'height': $(window).height() + 'px'
                    });
                    if (chatElement.attr("data-status") == "hidden") {
                        chatElement.css("top", $(window).height() + "px");
                    } else {
                        chatElement.css("top", "0px");
                    }
                });
                mChatWindow = iframeElement[0].contentWindow;

                //message listener
                $.listenerMessage(function(data) {
                    $.Log('listenerMessage:' + data);

                    var funcName;

                    try {
                        data = $.JSON.parseJSON(data);
                        funcName = data.funcName;
                    } catch (e) {
                        funcName = data;
                    }

                    switch (funcName) {
                        case "showMobileIframeWindow":
                            $._showMobileIframeWindow(chatElement);
                            break;
                        case "hideMobileIframeWindow":
                            $._hideMobileIframeWindow(chatElement, false);
                            break;
                        case "closeMobileIframeWindow":
                            $._hideMobileIframeWindow(chatElement, true);
                            break;
                        case "closeMobileIframeWindowCallbacks":
                            $.base.fire("WapClose", []);
                        case "backMobileIframeWindowCallBacks":
                            $.base.fire("WapBack", []);
                    }

                    //for 360
                    if (data && $.isArray(data) && data.indexOf("destInfo") > -1 && typeof im_destUserInfo == "function" && data.split(",").length == 3) {
                        var destId = data.split(",")[1];
                        var destName = data.split(",")[2];
                        im_destUserInfo({
                            "id": destId,
                            "name": destName
                        });
                    }
                });

                return {
                    created: true,
                    element: chatElement
                };
            } else {
                return {
                    created: false,
                    element: chatElement
                };
            }
            $.global.openInPagechat = true;
        },
        /***/
        _showMobileIframeWindow: function(chatElement) {
            if (!(nTalk.isObject(chatElement) && chatElement.talkVersion)) {
                return;
            }
            //2015.12.18 显示时，隐藏html，body中的所有内容，仅显示chatElement的内容，并置前

            $("html").addClass("full-html");
            $("body").addClass("full-body");
            chatElement.addClass("full-iframe");
            chatElement.css('z-index', '999999999');
            if ($.browser.mobile) {
                if ($('meta[name=viewport]').length == 0) {
                    //<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
                    $({
                        tag: 'meta',
                        id: 'nTalk-window-meta',
                        name: 'viewport',
                        content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
                    }).appendTo($('head'));
                }
            }
        },
        /***/
        _hideMobileIframeWindow: function(chatElement, closeIframeWindow) {
            if (!(nTalk.isObject(chatElement) && chatElement.talkVersion)) {
                return chatElement;
            }
            //2015.12.18 隐藏时，显示html，body中的所有内容，隐藏chatElement的内容，并置后
            $("html").removeClass("full-html");
            $("body").removeClass("full-body");
            chatElement.removeClass("full-iframe");
            chatElement.css({
                'z-index': -1,
                'display': 'none'
            });
            if ($.browser.mobile) {
                $('#nTalk-window-meta').remove()
            }
            //2015.03.09 如果closeIframeWindow为true，删除iframe,同时将监听的函数清空
            if (closeIframeWindow) {
                chatElement.remove();
                $.removelistenerMessage();
            }
        },
        /**
         * 2015.12.28 手机端使用页内方式打开时，为页面添加样式块
         * (6.8.2合版) 将addMobileStyle 改为接收参数的方法，便于复用
         */
        addMobileStyle: function(css) {
            var head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
        }

    });

    $.extend({ /* 打开聊窗 */
        /**
         * @description 打开聊窗
         * @param {String}	settingId	配置ID
         * @param {String}	itemId		商品ID
         * @param {String}	destId		客服ID
         * @param {Object}	options		其它配置项
         *                  	single      请求单客服
         *                      manual      请求人工客服
         *                      autoconnect 自动连接服务器
         *                      iframechat  移动设备指定打开聊窗方式：页内浮窗；标准聊窗
         *                      header      是否显示聊窗头
         *        				edu_inviteid    2017-03 教育版邀请客服id
         *   					edu_visitid     2017-03 教育版
         * @param {String}	itemparam	商品信息附加参数
         * @return {void}
         */
        im_openInPageChat: function(settingId, itemId, destId, options, itemparam) {
            var gSellerid, cSellerid, args, sellerId;

            if (!$.base._startBase) {
                $.base.start();
                (function() {
                    args = arguments;
                    if ($.base._startBase) {
                        $.im_openInPageChat(settingId, itemId, destId, options, itemparam);
                    } else {
                        setTimeout(function() {
                            args.callee();
                        }, 50);
                    }
                })();
                return;
            }

            if ($.base.chanageUserID()) {
                //用户信息变更，重载数据(同步｜异步)
                $.base.overloadedData(function() {
                    $.im_openInPageChat(settingId, itemId, destId, options, itemparam);
                });
                return;
            }
            if ($.invite) {
                $.invite._close();
            }

            $.Log('nTalk.im_openInPageChat()', 1);
            //2017.04.14 再教育版的过程中发现直接打开指定客服的窗口方式，会造成第二次打开默认接待组是会被认为窗口已经打开了。所以不在不在穿默认值。
            if (!settingId && destId) {
                settingId = '';
            } else {
                settingId = settingId || $.global.settingid || '';
            }

            gSellerid = $.global.settingid ? $.global.settingid.split('_').splice(0, 2).join('_') : '';
            cSellerid = settingId ? settingId.split('_').splice(0, 2).join('_') : '';
            sellerId = $.global.sellerid && $.global.sellerid.length ? $.global.sellerid[0] : '';
            options = $.extend({}, options);

            if (itemId) {
                //
            } else if (!cSellerid || (cSellerid !== '' && (cSellerid == sellerId || cSellerid == gSellerid))) {
                itemId = $.global.itemid;
                itemparam = $.global.itemparam;
            } else {
                itemId = '';
                itemparam = '';
            }
            sellerId = cSellerid != $.global.siteid ? cSellerid : '';

            $.Log('settingId:' + settingId + ', itemId:' + itemId + ', itemparam:' + itemparam);

            if (($.browser.mobile || $.global.pageinchat !== true) && !$.mobileOpenInChat) {
                return this.im_openOutPageChat(settingId, itemId, destId, options, itemparam);
            } else {
                //update notrail值为2时，打开聊窗时调用轨迹 2015-08-10
                if ($.server.notrail == 2 && !$.base.call_trail_status) {
                    $.base.call_trail_status = true;
                    $.base.startTrail();
                }

                var single = options && options.single ? options.single : '';
                var manual = options && options.manual ? 1 : 0;
                var autoConnect = options && $.isDefined(options.autoconnect) ? options.autoconnect : false;
                var edu_inviteid = options && options.edu_inviteid ? options.edu_inviteid : '';
                var edu_visitid = options && options.edu_visitid ? options.edu_visitid : '';
                if ($.browser.mobile && $.mobileOpenInChat) {
                    this._createMobileOpenInPageWindow(edu_inviteid);

                    if ($.isAutoEdu && $.autoEduShow) {
                        this._hideMobileInPageWindow();
                    }
                }
                $.base.startChat(settingId, destId, itemId, itemparam, sellerId, autoConnect, single, manual, edu_inviteid, edu_visitid);

                //this.im_openOutPageChat(settingId, destId, itemId, itemparam, sellerId, autoConnect, single);
            }
        },
        /**
         * 打开页外聊天窗口
         * @param {String}  settingId 配置ID
         * @param {String}  itemId    商品ID
         * @param {String}  destId    客服(组)ID
         * @param {Object}  options   其它配置项
         *                      single      请求单客服
         *                      manual      请求人工客服
         *                      autoconnect 自动连接服务器
         *                      iframechat  移动设备指定打开聊窗方式：页内浮窗；标准聊窗
         *                      header      是否显示聊窗头
         * @param {String}  itemparam 商品信息附加参数
         * @return {window}
         */
        im_openOutPageChat: function(settingId, itemId, destId, options, itemparam) {
            var gSellerid, cSellerid, args, sellerId;

            if (!$.base._startBase) {
                $.base.start();
                (function() {
                    args = arguments;
                    if ($.base._startBase) {
                        $.im_openInPageChat(settingId, itemId, destId, options, itemparam);
                    } else {
                        setTimeout(function() {
                            args.callee();
                        }, 50);
                    }
                })();
                return;
            }

            if ($.base.chanageUserID()) {
                //用户信息变更，重载数据(同步｜异步)
                $.base.overloadedData(function() {
                    $.im_openInPageChat(settingId, itemId, destId, options, itemparam);
                });
                return;
            }

            $.Log('nTalk.im_openOutPageChat()', 1);

            settingId = settingId || $.global.settingid || '';
            gSellerid = $.global.settingid ? $.global.settingid.split('_').splice(0, 2).join('_') : '';
            cSellerid = settingId ? settingId.split('_').splice(0, 2).join('_') : '';
            sellerId = $.global.sellerid && $.global.sellerid.length ? $.global.sellerid[0] : '';
            options = $.extend({}, options);

            if (itemId) {
                //
            } else if (!cSellerid || (cSellerid !== '' && (cSellerid == sellerId || cSellerid == gSellerid))) {
                itemId = $.global.itemid;
                itemparam = $.global.itemparam;
            } else {
                itemId = '';
                itemparam = '';
            }
            sellerId = cSellerid != $.global.siteid ? cSellerid : '';

            $.Log('settingId:' + settingId + ', itemId:' + itemId + ', itemparam:' + itemparam);
            //测试POST方式，打开聊窗
            // 2017.04 将返回按钮的地址也发送过去。
            var objectResult,
                target = $.browser.mobile ? '_self' : '_blank',
                single = options && options.single ? options.single : '',
                manual = options && options.manual ? 1 : 0,
                query = {
                    v: $.version.script,
                    siteid: $.global.siteid,
                    sellerid: sellerId,
                    settingid: settingId,
                    baseuri: $.baseURI,
                    mobile: $.browser.mobile ? 1 : 0,
                    lan: $.extParmas.lan || '',
                    ref: $.enCut($.url, 255),
                    tit: $.global.title,
                    iframechat: options.iframechat || "0",
                    header: ($.isDefined(options.header) ? options.header : "1"),
                    edu_inviteid: options && options.edu_inviteid ? options.edu_inviteid : '',
                    edu_visitid: options && options.edu_visitid ? options.edu_visitid : '',
                    backURL: $.global.backURL,
                    rnd: $.getTime()
                },
                post = {
                    uid: $.user.id,
                    uname: $.user.name,
                    pcid: $.global.pcid,
                    vip: $.global.isvip,
                    ulevel: $.global.userlevel,
                    destid: destId || '',
                    single: single ? single : !destId ? -1 : destId.indexOf('GT2D') > -1 ? 0 : 1,
                    chattype: '',
                    chatvalue: '',
                    itemid: itemId,
                    itemparam: itemparam,
                    erpparam: $.global.erpparam,
                    // ref:		$.enCut($.url, 255),
                    // tit:		$.global.title,
                    "ntalker-debug": $.params['ntalker-debug'] || $.cache.get("debug"),
                    //2014.12.27 新添参数传入页外，注意与extParmas的区别
                    exparams: $.global.exparams
                };
            //open sdk chat window
            if (typeof ntalker !== "undefined" && ntalker.openChatWindow) {
                sdkQuery = $.extend({}, query, post);
                sdkQuery.uid = $.base.toShortID(sdkQuery.uid);
                sdkQuery.flashserver = $.server.flashserver;

                $.Log("call ntalker.openChatWindow()", 2);
                var result = ntalker.openChatWindow($.JSON.toJSONString(sdkQuery));
                $.Log("call ntalker.openChatWindow()>>" + result, 3);
                if (result === 0) {
                    return;
                } else {
                    $.Log("call ntalker.openChatWindow()>>" + result, 3);
                }
            }

            if ($.global.themes) {
                query.themes = $.global.themes;
            }
            if (options.iframechat) {
                target = 'ntalk-mobile-chat';

                $.require({
                    animate: 'nt2.js' + $.baseExt
                }, function(nt2) {
                    if (!$.animate) {
                        $.Log('Loaded $nt2 mode failed', 3);
                        return;
                    }
                    objectResult = $._createMobileIframeWindow(target);

                    if (!objectResult || (objectResult && objectResult.created === true)) {
                        $.objectPost = new $.POST($.server.flashserver + 'chat.php?' + $.toURI(query, true, '&'), post, function() {
                            $.Log('open chat window complete', 1);
                        }, target);
                    }

                    $._showMobileIframeWindow(objectResult.element);
                });

                return null;
            }

            if (!objectResult || (objectResult && objectResult.created === true)) {
                $.objectPost = new $.POST($.server.flashserver + 'chat.php?' + $.toURI(query, true, '&'), post, function() {
                    $.Log('open chat window complete', 1);
                }, target);
            }

            return objectResult ? objectResult.element : $.objectPost.iframeElement;
        },
        /**
         * @method im_getAppChatWindowURL APP下专用获取打开聊窗口地址
         * @param {Object} data 打开聊窗参数
         *          {String}  settingId 配置ID
         *          {String}  itemId    商品ID
         *          {String}  destId    客服(组)ID
         *          {Object}  options   其它配置项
         *                      single      请求单客服
         *                      manual      请求人工客服
         *                      autoconnect 自动连接服务器
         *                      iframechat  移动设备指定打开聊窗方式：页内浮窗；标准聊窗
         *                      header      是否显示聊窗头
         *          {String}  itemparam 商品信息附加参数
         * @param {function} callback
         * @return void
         */
        im_getAppChatWindowURL: function(data, callback) {
            var gSellerid, cSellerid, args, sellerId, destId, settingId, itemId, itemparam, options;

            if (!$.base._startBase) {
                $.base.start();
                (function() {
                    args = arguments;
                    if ($.base._startBase) {
                        $.im_getAppChatWindowURL(data, callback);
                    } else {
                        setTimeout(function() {
                            args.callee();
                        }, 50);
                    }
                })();
                return;
            }

            if ($.base.chanageUserID()) {
                //用户信息变更，重载数据(同步｜异步)
                $.base.overloadedData(function() {
                    $.im_getAppChatWindowURL(data, callback);
                });
                return;
            }

            $.Log('nTalk.im_getAppChatWindowURL()', 1);

            if (typeof data == "function") {
                callback = data;
                data = {};
            } else {
                data = $.extend({}, data);
            }

            destId = data.destid || "";
            settingId = data.settingId || $.global.settingid || '';
            gSellerid = $.global.settingid ? $.global.settingid.split('_').splice(0, 2).join('_') : '';
            cSellerid = data.settingid ? data.settingid.split('_').splice(0, 2).join('_') : '';
            sellerId = $.global.sellerid && $.global.sellerid.length ? $.global.sellerid[0] : '';
            options = $.extend({}, data.options);

            if (data.itemid) {
                itemId = data.itemid;
                itemparam = data.itemparam;
            } else if (!cSellerid || (cSellerid !== '' && (cSellerid === sellerId || cSellerid === gSellerid))) {
                itemId = $.global.itemid;
                itemparam = $.global.itemparam;
            } else {
                itemId = '';
                itemparam = '';
            }
            sellerId = cSellerid != $.global.siteid ? cSellerid : '';

            $.Log('settingId:' + settingId + ', itemId:' + itemId + ', itemparam:' + itemparam);

            //测试POST方式，打开聊窗
            var single = options && options.single ? options.single : '',
                manual = options && options.manual ? 1 : 0,
                query = {
                    v: $.version.script,
                    siteid: $.global.siteid,
                    sellerid: sellerId,
                    settingid: settingId,
                    baseuri: $.baseURI,
                    mobile: $.browser.mobile ? 1 : 0,
                    lan: $.extParmas.lan || '',
                    header: ($.isDefined(options.header) ? options.header : "1"),
                    uid: $.user.id,
                    uname: $.user.name,
                    pcid: $.global.pcid,
                    vip: $.global.isvip,
                    ulevel: $.global.userlevel,
                    destid: destId || '',
                    single: single ? single : !destId ? -1 : destId.indexOf('GT2D') > -1 ? 0 : 1,
                    chattype: '',
                    chatvalue: '',
                    itemid: itemId,
                    itemparam: itemparam,
                    erpparam: $.global.erpparam,
                    ref: $.enCut($.url, 255),
                    tit: $.global.title,
                    "ntalker-debug": $.params['ntalker-debug'] || $.cache.get("debug") || "",
                    //2014.12.27 新添参数传入页外，注意与extParmas的区别
                    exparams: $.global.exparams
                };

            if ($.isFunction(callback)) {
                callback.call(self, $.server.flashserver + 'recieve.php?' + $.toURI(query, true, '&'));
            }
        },
        /**
         * @method im_updatePageInfo 更新页面信息｜重新获取页面信息
         * @param  Object uData 网站传递的数据(可选),数据结构按照NTKF_PARAM
         * @return boolean
         */
        im_updatePageInfo: function(uData) {

            $.base.overloadedData(uData);

        },
        /**
         * 微信单页面hash值改变，提交给轨迹
         */
        im_addTrailInfo: function(title, url, uData) {
            $.referrer = $.url;
            $.title = title || document.title;
            $.url = url || document.location.href;
            $.base.overloadedData(uData);
        },
        t2d: {
            /**
             * @method openChatWindow 兼容旧版
             * @param  {String} destId
             * @param  {String} sessionId
             * @param  {String} settingId
             * @return {void} 返回打开的聊窗口是否成功
             */
            openChatWindow: function(destId, sessionId, settingId) {

                $.im_openOutPageChat(settingId, '', destId, null, '');

            }
        },
        enableDebug: function() {
            if (!$.cache.get("debug")) {
                $.cache.set("debug", 2);
            }
            if (!$.mDebug) {
                $.require({
                    mDebug: 'debug.js' + $.baseExt,
                    Window: 'nt2.js' + $.baseExt
                }, function(mDebug) {
                    if (!mDebug || mDebug.error) {
                        return;
                    }
                    $.mDebug.initialize();
                    $.Log = $.mDebug.Log;
                    $.debug = $.mDebug;
                });
            }
            return $.cache.get("debug");
        }
    });

    if (!$.isDefined(CON_SERVER)) {
        throw 'CON_SERVER is not defined';
    }

    $.imageloading = $.sourceURI + 'images/loading.gif';
    $.server = $.extend({}, $.protocolFilter(CON_SERVER));
    $.version = $.extend({}, $.version, CON_VERSION);

    $.baseExt = '?siteid=' + ($.extParmas.siteid || '') + '&v=' + $.version.dir + '&t=' + $.version.release;
    if (parseFloat($.params['ntalker-debug']) > 0 || +$.cache.get("debug") > 0) {
        $.require({
            mDebug: 'debug.js' + $.baseExt,
            Window: 'nt2.js' + $.baseExt
        }, function(mDebug) {
            if (!mDebug || mDebug.error) {
                return;
            }
            $.mDebug.initialize();
            $.Log = $.mDebug.Log;
            $.debug = $.mDebug;
            $.base.start();
        });
    } else {
        $.Log = emptyFunc;
        $.debug = {
            //未加载debug模块时，comet连接异常采用老版方式调
            Log: $.Log
        };
        $.base.start();
    }

    $._showMobileInPageWindow = function() {
            $("html").addClass("full-html");
            $("body").addClass("full-inpage");
            if ($('body').css('padding')) {
                $.rememberBodyPadding = $('body').css('padding');
                $('body').css({
                    'padding': 0
                });
            }
            $(".ntalk-mobile-inpage-background").css({
                'z-index': 999999999,
                'display': 'block'
            });
            $('.ntalk-mobile-inpage-window').css({
                'display': 'block',
                'width': '100%',
                'height': ($.isEdu && ($.browser.micromessenger || $.browser.weibo)) ? '90%' : '100%'
            });
            // if( $.browser.mobile ){
            // 	if( $('meta[name=viewport]').length == 0 ){
            // 		//<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
            // 		$({tag:'meta',id:'nTalk-window-meta',name:'viewport',content:'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'}).appendTo($('head'));
            // 	}
            // }
            // 重置未读消息数量
            //$.fim_offlineMssage('','','',true);
        },
        $._hideMobileInPageWindow = function() {
            if ($.rememberBodyPadding) {
                $('body').css({
                    'padding': $.rememberBodyPadding
                });
            }
            $("html").removeClass("full-html");
            $("body").removeClass("full-inpage");
            $(".ntalk-mobile-inpage-background").css({
                'z-index': -1,
                'display': 'none'
            });
            // if( $.browser.mobile ){
            //  		var nTalkMeta = nTalk('#nTalk-window-meta');
            //  		nTalkMeta[0].setAttribute('content','');
            //  		nTalkMeta.remove();
            //  	}
            $('.nTalk-window-offLine').css('display', 'none');
            // 重置未读消息数量
            if ($.isEdu) {
                $.fim_offlineMssage('', '', '', true);
            }
        },

        $._closeMobileInPageWindow = function() {
            if ($.rememberBodyPadding) {
                $('body').css({
                    'padding': $.rememberBodyPadding
                });
            }
            $("html").removeClass("full-html");
            $("body").removeClass("full-inpage");
            if ($('#ntalk-chat-loading').length > 0) {
                $('#ntalk-chat-loading').remove();
            }
            $(".ntalk-mobile-inpage-background").remove();
            // if( $.browser.mobile ){
            //  		var nTalkMeta = nTalk('#nTalk-window-meta');
            //  		if( nTalkMeta.length == 0 ){
            //  			return;
            //  		}
            //  		nTalkMeta[0].setAttribute('content','');
            //  		nTalkMeta.remove();
            //  	}
            $('.nTalk-window-offLine').css('display', 'none');
            // 重置未读消息数量
            //$.fim_offlineMssage('', '', '', true);
        },

        $.require($.imageloading);

    /*
    	2017.04
     */
    $.extend({
        //获取访客信息   return object
        getUserInfo: function() {
            // if( this instanceof nTalk.getUserInfo ){
            // 	this.callSelf = function(){
            // 		var self = this;
            // 		if( $.global.pcid && $.user.id ){
            // 			this.clientId=$.global.pcid;
            // 			this.userId = $.user.id;
            // 			this.userName = $.user.name;
            // 			this.shortId = $.global.shortid == "" ?$.user.id.substr($.user.id.indexOf("_ISME9754_")+10) : $.global.shortid;
            // 		}else{
            // 			setTimeout(function(){
            // 				self.callSelf();
            // 			},20)
            // 		}
            // 	}
            // 	this.callSelf();
            // }else{
            // 	return new nTalk.getUserInfo();
            // }
            if ($.global && $.global.pcid && $.user && $.user.id) {
                return {
                    clientId: $.global.pcid,
                    userId: $.user.id,
                    userName: $.user.name,
                    shortId: $.global.shortid == "" ? $.user.id.substr($.user.id.indexOf("_ISME9754_") + 10) : $.global.shortid
                }
            }
        },
        //获取轨迹会话ID  return String
        getTrailSessionId: function() {
            if ($.global && $.global.trailid) {
                return $.global.trailid;
            }
        },
        //设置返回地址。
        setBackUrl: function(url) {
            if ($.global) {
                $.global.backURL = encodeURIComponent(url);
            } else {
                setTimeout(function() {
                    nTalk.setBackUrl(url);
                }, 300)
            }
        }

    });
})(nTalk);
