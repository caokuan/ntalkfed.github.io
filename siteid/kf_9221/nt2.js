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
