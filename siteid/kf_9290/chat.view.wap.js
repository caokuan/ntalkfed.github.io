(function($, undefined) {
    var CON_NULL = /[\r\n]/gi,
        CON_FLASH_DIV = 'nTalk-flash-element',
        CON_TCHAT_ID = 'ntkf-flash-tchat',
        CON_UPLOAD_ID = 'ntkf-flash-upload';
    var emptyFunc = function() {};
    /*jshint scripturl:true*/
    var SCRIPT_URL = "javascript:void();";
    $.STYLE_BODY += 'font-size:14px;';

    //2016.04.18
    var newWapTheme = {
        return_style: "&#xe619;",
        return_color: "#E56060",
        close_style: "&#xe626;",
        close_color: "#E56060",
        background: "#f3f3f7",
        bubble: "#CEF2FF",
        bubble_text: "#000000",
        timestamp: "#ABABAB"
    };

    var downtserver = $.downtserver ? $.downtserver : '.';
    var isEdu = $.isEdu || $.isAutoEdu;

    //2016.04.07
    var css = [
        '@font-face {',
        'font-family: iconfont;',
        'src: url("'+downtserver  +'/fontIcon/iconfont.eot");', /* IE9*/
        'src: url("'+downtserver+'/fontIcon/iconfont.eot?#iefix") format("embedded-opentype"),', /* IE6-IE8 */
        'url("'+downtserver+'/fontIcon/iconfont.woff") format("woff"),', /* chrome、firefox */
        'url("'+downtserver+'/fontIcon/iconfont.ttf") format("truetype"),', /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
         'url("'+downtserver+'/fontIcon/iconfont.svg#iconfont") format("svg");', /* iOS 4.1- */
        '}',
        '.iconfont{',
        'font-family:"iconfont" !important;',
        'font-size:16px;font-style:normal;',
        '-webkit-font-smoothing: antialiased;',
        '-webkit-text-stroke-width: 0.2px;',
        '-moz-osx-font-smoothing: grayscale;',
        '}'
    ].join("");

    $.addMobileStyle(css);

    /** 2015.11.01 手势识别 */
    var pos = {
        start: null, //起始位置
        move: null, //移动位置
        end: null //结束位置
    };

    //开始时间
    var startTime = 0;

    //手指数
    var fingers = 0;

    //开始、移动，结束事件
    var startEvent = null,
        moveEvent = null,
        endEvent = null;

    //是否开始 swipe(滑动) pinch(捏合) hold(长按) 事件
    var startSwiping = false,
        startPinch = false,
        startHold = false;


    var _offset = {};

    //是否开始 _touchStart(触摸) _tapped(已点击) _lastTapEndTime(最后一次点击时间)
    var _touchStart = false;
    var _tapped = false;
    var _lastTapEndTime = null;

    //定时器 _holdTimer(检测长按) _tapTimer(检测双击)
    var _holdTimer = null;
    var _tapTimer = null;

    //上一次点击结束时间、位置
    var _prev_tapped_end_time = 0,
        _prev_tapped_pos = null;

    //手势对象
    var Gesture = {

        version: '1.0.0',

        date: '2015.10.19',

        toast: null, //手势触发的提示框对象

        //配置项
        config: {
            tapMaxDistance: 15, //点击最大位移距离
            tapTime: 200, //点击延迟时间
            holdTime: 650, //长按最小触发时间
            maxDoubleTapInterval: 300, //连击最大间隔时间
            swipeTime: 300, //滑动最小持续时间
            swipeMinDistance: 20 //滑动最小移动距离
        },

        //默认监测事件
        events: {
            'tap': 'touchstart touchend', //点击
            'doubletap': 'touchstart touchend', //双击
            'swipe': 'touchmove touchend', //滑动
            'pinch': 'touchmove touchend' //捏合
        },

        //手势触发时，记录的方向位移信息
        record: {
            'direction': null,
            'swipedistance': null,
            'swipeEl': null,
            'holdEl': null
        },

        //工具方法
        util: {
            //是否支持触屏
            hasTouch: ('ontouchstart' in window),

            //获取事件的触点个数
            getFingers: function(ev) {
                return ev.touches ? ev.touches.length : 1;
            },

            //获取两个坐标之间的直线距离
            getDistance: function(pos1, pos2) {
                var x = pos2.x - pos1.x,
                    y = pos2.y - pos1.y;
                return Math.sqrt((x * x) + (y * y));
            },

            //获取事件触发的位置
            getPosOfEvent: function(ev) {
                if (this.hasTouch) {
                    var posi = [],
                        src = null;
                    for (var t = 0, len = ev.touches.length; t < len; t++) {
                        src = ev.touches[t];
                        posi.push({
                            x: src.pageX,
                            y: src.pageY
                        });
                    }
                    return posi;
                } else {
                    return [{
                        x: ev.pageX,
                        y: ev.pageY
                    }];
                }
            },

            //获取两个坐标之间的角度
            getAngle: function(p1, p2) {
                return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
            },

            //从角度判断手势方向
            getDirectionFromAngle: function(agl) {
                var directions = {
                    up: agl < -45 && agl > -135,
                    down: agl >= 45 && agl < 135,
                    left: agl >= 135 || agl <= -135,
                    right: agl >= -45 && agl <= 45
                };
                for (var key in directions) {
                    if (directions[key]) return key;
                }
                return null;
            },

            //是否为移动事件
            isTouchMove: function(ev) {
                return (ev.type === 'touchmove' || ev.type === 'mousemove');
            },

            //是否为结束触碰事件
            isTouchEnd: function(ev) {
                return (ev.type === 'touchend' || ev.type === 'mouseup' || ev.type === 'touchcancel');
            },

            //下一次计算手势时，将参与计算的变量至空
            reset: function() {
                startEvent = moveEvent = endEvent = null;
                _tapped = _touchStart = startSwiping = startPinch = startHold = false;
                pos = {};
            }
        },

        //初始化方法，未document绑定（开始触碰，持续触碰，结束触碰）事件
        init: function() {

            var self = this,
                utils = this.util,
                mouseEvents = 'mouseup mousedown mousemove mouseout',
                touchEvents = 'touchstart touchmove touchend touchcancel',
                bindingEvents = (utils.hasTouch && $.browser.mobile) ? touchEvents : mouseEvents;

            $.each(bindingEvents.split(" "), function(i, evt) {
                switch (evt) {
                    case 'touchstart':
                    case 'mousedown':
                        $.Event.addEvent(document, evt, self.touchstart);
                        break;
                    case 'touchmove':
                    case 'mousemove':
                        $.Event.addEvent(document, evt, self.touchmove);
                        break;
                    case 'touchend':
                    case 'touchcancel':
                    case 'mouseup':
                    case 'mouseout':
                        $.Event.addEvent(document, evt, self.touchend);
                        break;
                }

            });
        },

        /**
         * 开始触碰事件
         */
        touchstart: function(ev) {
            var el = ev.target,
                utils = Gesture.util;

            //记录开始时间、位置，将_touchStart置为true，为startEvent赋值，触发hold定时器
            startTime = Date.now();

            if (!pos.start || pos.start.length < 2) {
                pos.start = utils.getPosOfEvent(ev);
            }

            _touchStart = true;

            startEvent = ev;

            _offset = {};

            var box = el.getBoundingClientRect();
            var docEl = document.documentElement;
            _offset = {
                top: box.top + (window.pageYOffset || docEl.scrollTop) - (docEl.clientTop || 0),
                left: box.left + (window.pageXOffset || docEl.scrollLeft) - (docEl.clientLeft || 0)
            };

            Gesture.hold(ev);

            if (Gesture.fullScreen) {
                $.Event.fixEvent(ev).preventDefault();
                $.Event.fixEvent(ev).stopPropagation();
            }
        },

        /**
         * 结束触碰事件
         */
        touchend: function(ev) {
            var utils = Gesture.util,
                record = Gesture.record;

            //如果没有_touchStart 此次事件作废
            if (!_touchStart) return;
            endEvent = ev;

            //依据条件，执行相应的事件
            if (startSwiping && ev.target == record.swipeEl) {
                Gesture.swipe(ev);
            } else if (startHold && ev.target == record.holdEl) {
                Gesture.hold(ev);
            } else {
                Gesture.tap(ev);
            }

            //重置手势计算
            if (record.swipeEl === null && record.holdEl === null) {
                utils.reset();
            }

            if (utils.getFingers(ev) === 1) {
                _touchStart = true;
            }

            if (Gesture.fullScreen) {
                $.Event.fixEvent(ev).preventDefault();
                $.Event.fixEvent(ev).stopPropagation();
            }
        },


        /**
         * 持续触碰事件
         * 判断手势是否符合pinch或swipe事件
         */
        touchmove: function(ev) {
            try {
                navigator.control.gesture(false);
            } catch (e) {}
            var utils = Gesture.util,
                config = Gesture.config;

            if (Gesture.toast) {
                $.Event.fixEvent(ev).preventDefault();
            }

            if (Gesture.fullScreen) {
                $.Event.fixEvent(ev).preventDefault();
                $.Event.fixEvent(ev).stopPropagation();
            }

            if (!_touchStart || !pos.start) return;

            pos.move = utils.getPosOfEvent(ev);

            if (utils.getFingers(ev) >= 2) {
                //$.Gesture.pinch(ev); 暂未实现
            } else {
                var distance = utils.getDistance(pos.start[0], pos.move[0]);
                if (distance > config.tapMaxDistance) {
                    Gesture.swipe(ev);
                }
            }
        },


        /**
         * 点击事件
         */
        tap: function(ev) {

            var el = ev.target,
                now = Date.now(),
                utils = this.util,
                config = this.config;

            if (!pos.start || this.record.swipeEl !== null || this.record.holdEl !== null) {
                return;
            }

            var distance = utils.getDistance(pos.start[0], pos.move ? pos.move[0] : pos.start[0]);

            //clearTimeout(_holdTimer);

            var isDoubleTap = (function() {
                if (_prev_tapped_pos && (startTime - _prev_tapped_end_time) < config.maxDoubleTapInterval) {
                    var doubleDis = utils.getDistance(_prev_tapped_pos, pos.start[0]);
                    if (doubleDis < 16) return true;
                }
                return false;
            })();

            if (isDoubleTap) {
                clearTimeout(_tapTimer);
                $.Event.fireEvent(el, 'doubletap');
                return;
            }

            if (config.tapMaxDistance < distance) return;

            if (config.holdTime > (now - startTime) && utils.getFingers(ev) <= 1) {
                _tapped = true;
                _prev_tapped_end_time = now;
                _prev_tapped_pos = pos.start[0];
                _tapTimer = setTimeout(function() {
                    $.Event.fireEvent(el, 'tap');
                }, config.tapTime);
            }
        },

        /**
         * 滑动事件
         */
        swipe: function(ev) {
            var el = ev.target,
                now = Date.now(),
                utils = this.util,
                config = this.config,
                touchTime = now - startTime;

            if (!_touchStart || !pos.move || utils.getFingers(ev) > 1 || (this.record.swipe && this.record.swipe !=
                    el)) {
                return;
            }

            var distance = utils.getDistance(pos.start[0], pos.move[0]);
            var position = {
                x: pos.move[0].x - _offset.left,
                y: pos.move[0].y - _offset.top
            };
            var angle = utils.getAngle(pos.start[0], pos.move[0]);
            var direction = utils.getDirectionFromAngle(angle);
            var touchSecond = touchTime / 1000;
            var eventObj = {
                type: "swipe",
                originEvent: ev,
                position: position,
                direction: direction,
                distance: distance,
                distanceX: pos.move[0].x - pos.start[0].x,
                distanceY: pos.move[0].y - pos.start[0].y,
                x: pos.move[0].x - pos.start[0].x,
                y: pos.move[0].y - pos.start[0].y,
                angle: angle,
                duration: touchTime,
                fingersCount: utils.getFingers(ev)
            };

            this.record.direction = direction;
            this.record.distance = distance;

            var swipeTo = function() {
                if (direction) {
                    $.Event.fireEvent(el, "swipe" + direction);
                }
            };

            if (!startSwiping) {
                eventObj.fingerStatus = eventObj.swipe = 'start';
                startSwiping = true;
                this.record.swipeEl = ev.target;
                $.Event.fireEvent(this.record.swipeEl, "swipestart");
            } else if (utils.isTouchMove(ev)) {
                eventObj.fingerStatus = eventObj.swipe = 'move';
                $.Event.fireEvent(this.record.swipeEl, "swiping");

                if (touchTime > config.swipeTime && touchTime < config.swipeTime + 50 && distance > config.swipeMinDistance) {
                    swipeTo();
                    $.Event.fireEvent(this.record.swipeEl, "swipe");
                }
            } else if (utils.isTouchEnd(ev) || ev.type === 'mouseout') {
                eventObj.fingerStatus = eventObj.swipe = 'end';
                $.Event.fireEvent(this.record.swipeEl, "swipeend");
                if (config.swipeTime > touchTime && distance > config.swipeMinDistance) {
                    swipeTo();
                    $.Event.fireEvent(this.record.swipeEl, "swipe");
                }
                this.record.swipeEl = null;
                this.record.holdEl = null;
            }
        },

        /**
         * 长按事件
         */
        hold: function(ev) {
            var el = ev.target,
                utils = this.util,
                config = this.config;
            self = this;
            if ((this.record.holdEl && this.record.holdEl != el)) {
                return;
            }
            if (ev.type == 'touchstart') {
                clearTimeout(_holdTimer);
                startHold = false;

                _holdTimer = setTimeout(function() {
                        startHold = true;
                        if (!pos.start) return;
                        var distance = utils.getDistance(pos.start[0], pos.move ? pos.move[0] : pos.start[0]);
                        if (config.tapMaxDistance < distance) return;
                        if (!_tapped) {
                            self.record.holdEl = el;
                            $.Event.fireEvent(el, "hold");
                        }
                    },
                    config.holdTime);
            } else if (ev.type == 'touchend') {
                $.Event.fireEvent(this.record.holdEl, "holdup");
                this.record.swipeEl = null;
                this.record.holdEl = null;
            } else if (ev.type == 'touchcancel') {
                $.Event.fireEvent(this.record.holdEl, "holdcancel");
                this.record.swipeEl = null;
                this.record.holdEl = null;
            }
        }
    };

    $.fn.extend({
        //2015.11.10 tap事件
        tap: function(fn) {
            return this.bind('tap', fn);
        },

        /**
         * 2015.11.10 gesture方法 支持绑定下列事件
         * tap doubletap hold swipe(left|right|up|down|start|end|ing)
         */
        gesture: function(eName, fn) {
            return this.bind(eName, fn);
        },

        /**
         * 修改background中x或y的值
         */
        editBackgroundPosition: function(position) {
            var xyPxArr = [0, 0];
            var xyPxReg = /\-?[0-9]+\.?[0-9]*/g;
            if (this.css('background-position')) {
                xyPxArr = this.css('background-position').match(xyPxReg);
            }
            if (position.x) {
                xyPxArr[0] = position.x;
            }
            if (position.y) {
                xyPxArr[1] = position.y;
            }
            this.css('background-position', xyPxArr[0] + 'px ' + xyPxArr[1] + 'px');
        },

        textareaAutoHeight: function(options) {
            this._options = {
                minHeight: 0,
                maxHeight: 1000
            };

            this.init = function() {
                var self = this;

                $.each(options, function(p, value) {
                    self._options[p] = value;
                });
                if (this._options.minHeight === 0) {
                    this._options.minHeight = parseFloat($(this).height());
                }
                $.each(this._options, function(p, value) {
                    if (!$(self).attr(p)) {
                        $(self).attr(p, value);
                    }
                });
                $(this).bind('keyup', this.resetHeight).bind('change', this.resetHeight).tap(this.resetHeight);

                this.resetHeight.call(this.get(0));
            };

            this.resetHeight = function(event) {
                var _minHeight = parseFloat($(this).attr("minHeight"));
                var _maxHeight = parseFloat($(this).attr("maxHeight"));

                if (!$.browser.msie) {
                    $(this).height(0);
                }
                //2016.05.04
                //（6.8.2合版）输入框增加样式padding:10px
                var currentHeight = parseFloat(this.scrollHeight - 20);
                currentHeight = Math.min(Math.max(currentHeight, _minHeight), _maxHeight);
                $(this).css('height', currentHeight + 'px').scrollTop(0);

                if (currentHeight >= _maxHeight) {
                    $(this).css("overflow-y", "scroll");
                } else {
                    //（6.8.2合版）输入框删除退行，高度自适应
                    $(this).css({
                        'overflow-y': 'hidden',
                        'height': 'auto'
                    });
                    var tempHeight = parseFloat(this.scrollHeight - 20);
                    tempHeight = Math.min(Math.max(tempHeight, _minHeight), _maxHeight);
                    $(this).css('height', tempHeight + 'px').scrollTop(0);
                }
            };

            this.init();

            return this;
        }
    });

    /** ====================================================================================================================================================
     * [chatView description]
     * @type {[type]}
     */
    var chatView = $.Class.create();
    chatView.prototype = {
        name: 'chatView',
        contains: null,
        loadElement: null,
        chatElement: null,
        messageElement: null,
        displayiFrame: null,
        chatHistory: null,
        objFile: null,
        objImage: null,
        _tempHeader: null,
        _chatsHeader: null,
        _chatsElement: null,
        _maxNumber: 50,
        _sendKey: 'Enter',
        _editorStart: 0,
        _initFace: false,
        _eventFunction: emptyFunc,
        scroll: null,
        _listenTimeID: null,
        buttonSelectors: null,
        isZoom: false, //是否放大
        // 2015.09.19
        timeHash: {}, //记录已出现的时间，格式{时间：记录条数}，每次出现相同的时间，记录条数加1
        timeArray: [], //记录出现的时间
        imageHash: {}, //2015.11.01 记录已出现的图片的msgid
        audioMsgidHash: {}, //2015.11.01 记录已加载的音频msgid
        voiceLoadingInter: {}, //2015.11.01 音频加载定时器
        voicePlayInter: {}, //2015.11.10 音频播放定时器
        recordKfName: null, //记录聊窗打开网页前的客服名称
        evalRepeatClick: true, //2016.02.14 预防重复点击评价
        mode: null,
        options: null,
        siteid: '',
        settingid: '',
        initialize: function(options, mode) {
            this.options = options;
            this.siteid = this.options.siteid;
            this.settingid = this.options.settingid;
            this.mode = mode;

            this.buttonSelectors = {
                'face': 'chat-view-face',
                'image': 'chat-view-image',
                'audio': 'chat-view-button-audio',
                'file': 'chat-view-file',
                'history': 'chat-view-history',
                'loadhistory': 'chat-view-load-history',
                'evaluate': 'chat-view-evaluate',
                'capture': 'chat-view-capture',
                'capoptions': 'chat-view-capture-options',
                'csr': 'chat-view-change-csr',
                'manual': 'chat-view-switch-manual',
                'submit': 'chat-view-submit',
                'exp': 'chat-view-exp',
                'xiaonengver': 'chat-view-xiaoneng-version'
            };

            if (!this.mode) {
                $.Log('mode is null', 3);
                return;
            }

            //2015.11.01 手势初始化
            Gesture.init();

            this._create();

            this._bind();

            this._initAudio();
        },
        /**
         * @method _create 创建聊天窗体
         * @return {void}
         */
        _create: function() {
            var self = this,
                bodyHeight = +$(window).height() - 92;

            //（6.8.2合版）提取背景色到公共变量
            //2016.04
            var background_whole = newWapTheme.background;
            var color_RegExp = /^#[0-9a-f]{6}$/i;
            //2016.04.08 判断是否是图片或颜色
            var nowData = new Date().getTime();
            var background_whole_exp = color_RegExp.test(background_whole) ? 'background-color:' + background_whole + '' : 'background-image:url(' + background_whole + '?' + nowData + ');background-repeat:no-repeat;background-size:cover';

            this.contains = $.mobileOpenInChat ? $('.ntalk-mobile-inpage-window') : $(document.body);

            this.loadElement = $({
                className: 'chat-view-load',
                style: $.STYLE_BODY + 'width:100%;height:100%;' + background_whole_exp + ';min-height:' + bodyHeight + 'px;display:block;text-align:center;position:relative;'
            }).appendTo(this.contains).html(this._getViewHtml('load'));


            //2015.11.01 chat-view-window 背景色 #F3F3F7
            this.chatElement = $({
                className: 'chat-view-window',
                style: $.STYLE_BODY + 'width:100%;/*min-height:' + bodyHeight + 'px;*/display:none;overflow-y:scroll;position:absolute;top:0px;bottom:50px;-webkit-overflow-scrolling:touch;overflow-x:hidden;' + background_whole_exp + ''
            }).appendTo(this.contains).html(this._getViewHtml('window'));


            //2015.11.01 chat-view-message 背景色 #F3F3F7
            this.messageElement = $({
                className: 'chat-view-message',
                style: $.STYLE_BODY + 'width:100%;min-height:' + bodyHeight + 'px;display:none;position:absolute;top:55px;background:#F3F3F7;bottom:0px;-webkit-overflow-scrolling:touch;overflow-x:hidden'
            }).appendTo(this.contains).html(this._getViewHtml('message'));

            //2015.11.01 底部工具栏背景色 #F9F9F9
            var position = ($.params.iframechat == "1") ? 'absolute' : 'fixed';
            this.bottomElement = $({
                className: 'chat-view-window-bottom',
                style: $.STYLE_NBODY + 'background:#fff;width:100%;height:auto;min-height:49px;border-top:1px solid #F9F9F9;z-index:886;position:' + position + ';bottom:0px;background-color:#F9F9F9'
            }).appendTo(this.contains).html(this._getViewHtml('bottom'));

            this.displayiFrame = $({
                tag: 'iframe',
                id: 'chat-view-submit-iframe',
                name: 'chat-view-submit-iframe',
                className: 'chat-view-submit-iframe',
                style: $.STYLE_NBODY + 'width:0px;height:0px;display:none;'
            }).appendTo(this.contains);

            this.contains.append(this._getViewHtml('alert'));

            this.chatHistory = this.chatElement.find('.chat-view-window-history');

            if (isEdu) {
                this.chatHistory.css('padding-top', '50px');
            }

            //2015.05.11 Android 下滚动页面，会出现fixed节点实际位置与渲看到的置不一，导致按钮不可点
            var fixedAndroid = function() {
                if ($.browser.android) {
                    self.bottomElement.css({
                        position: 'fixed',
                        bottom: '0px'
                    });
                }
            };

            var inter = setInterval(function() {
                fixedAndroid();
            }, 30);

            setTimeout(function() {
                clearInterval(inter);
            }, 1000);

            $(window).bind('touchmove', fixedAndroid).bind('touchend', function(ev) {
                //隐藏控制栏
                //2015.11.01 点击聊窗区域时，关闭工具栏
                var target = $(ev.target);
                while (target) {
                    if (target.attr('class') == 'chat-view-window') {
                        self._showActionList(null, true);
                    }
                    target = target.parent();
                }
                if (ev.target.tagName.toLowerCase() != 'textarea' && $.browser.iPhone) {
                    setTimeout(function() {
                        self.bottomElement.find('textarea')[0].blur();
                    }, 300);
                }

            });

            $(window).bind('resize', function() {
                var ret = $(window);
                self.callChatResize(ret.width(), ret.height());
            });
        },
        /**
         * @method close 关闭
         * @return {void}
         */
        close: function() {
            this.contains.remove();
            this.contains = null;
        },
        /**
         * @method minimize 最小化
         * @return {void}
         */
        minimize: function() {
            this.contains.css({
                width: ($.browser.msie && $.browser.ieversion <= 7 ? 1 : 0) + 'px',
                height: ($.browser.msie && $.browser.ieversion <= 7 ? 1 : 0) + 'px'
            });
        },
        /**
         * @method maximize 还原
         * @return {void}
         */
        maximize: function() {
            this.contains.css({
                width: '100%',
                height: 'auto'
            });
        },
        /**
         * @method switchUI 切换视图[加载｜会话｜留言]
         * @return {void}
         */
        switchUI: function(type) {
            if (!this.contains) return;

            switch (type) {
                case this.mode.CON_VIEW_WINDOW:
                    this.contains.find('.chat-view-load, .chat-view-message').display();
                    this.contains.find('.chat-view-window').display(1);
                    this.contains.find('.chat-view-window-header').css('height', '55px').display(1);
                    this.contains.find('.chat-view-window-header-message-title').display(0);
                    this.contains.find('.chat-view-window-bottom').display(1);
                    break;
                case this.mode.CON_VIEW_MESSAGE:
                    this.contains.find('.chat-view-load, .chat-view-window').display();
                    this.contains.find('.chat-view-message').display(1);
                    this.contains.find('.chat-view-window-header').css('height', '55px').display(1);
                    this.contains.find('.chat-view-window-header-message-title').display(1);
                    this.contains.find('.chat-view-window-header-title').display(0);
                    this.contains.find('.chat-view-window-header-title').display(0);
                    this.contains.find('.chat-view-window-bottom').display();
                    if (isEdu) {
                        this.contains.find('.chat-header-name').display(0);
                        this.contains.find('.chat-header-sign').display(0);
                    }
                    break;
                case this.mode.CON_VIEW_ERROR:
                    this.contains.find('.chat-view-window, .chat-view-message').display();
                    this.contains.find('.chat-view-load').display(1);
                    this.contains.find('.chat-view-reload').display(1).tap(function() {
                        window.location.reload();
                    });
                    this.contains.find('.chat-view-load-icon, .chat-view-load-info').display();
                    this.contains.find('.chat-view-load-error').display(1).find('span');
                    this.contains.find('.chat-view-window-header').display();
                    this.contains.find('.chat-view-window-bottom').display();

                    //加载失败
                    //confirm($.lang.chat_info_failure);
                    //window.history.go(-1);
                    break;
                default:
                    this.contains.find('.chat-view-reload').display();
                    this.contains.find('.chat-view-window, .chat-view-message').display();
                    this.contains.find('.chat-view-load').display(1);
                    this.contains.find('.chat-view-load-error').display();
                    this.contains.find('.chat-view-load-icon, .chat-view-load-info').display(1);
                    this.contains.find('.chat-view-window-header').display();
                    this.contains.find('.chat-view-window-bottom').display();
                    break;
            }
        },
        /**
         * 添加消息, 按消息显示位置分类: first|goods|left|right|bottom|system
         * @param {string} type
         * @param {json}   data
         * 添加消息排序,06.17 添加多客服系统消息排序
         */
        showMessage: function(position, data) {
            var self = this,
                liElement, style, cstyle, selector, before, compare, beforeCount = 1;

            //2015.11.01 调整背景颜色以及padding距离
            //（6.8.2合版）将整个消息体改为透明色，为了能够兼容聊窗背景为图片的情况
            style = [
                $.STYLE_NBODY + 'list-style:none outside none;display:block;margin:0;padding:5px 10px 5px 10px;background:transparent',
                $.STYLE_NBODY + 'list-style:none outside none;display:block;margin:0;padding:5px 10px 5px 10px;background:transparent',
                $.STYLE_NBODY + 'list-style:none outside none;display:block;margin:0;padding:5px 10px 5px 10px;text-align:center;background:transparent'
            ];

            //消息区为示消息上限
            while (this.chatHistory.find('li[class]').length >= this._maxNumber) {
                this.chatHistory.find('li[class]').first().remove();
            }

            switch (position) {
                case 'left':
                    cstyle = style[0];
                    selector = data.msgid;
                    break;
                case 'bottom': //客服输入状态消息
                    cstyle = style[0];
                    selector = 'systembottom';
                    break;
                case 'right':
                    cstyle = style[1];
                    selector = data.msgid;
                    break;
                case 'goods': //商品信息
                    cstyle = style[2];
                    selector = 'first';
                    break;
                case 'system': //系统提示消息
                    cstyle = style[2] + 'margin-top:20px;';
                    selector = 'system';
                    break;
                case 'info': //系统提示消息
                    cstyle = style[2] + 'margin-top:20px;';
                    selector = data.msgid;
                    break;
                case 'otherinfo': //faq信息
                    cstyle = style[0];
                    selector = data.msgid;
                    break;
                default: //欢迎消息
                    cstyle = style[2];
                    selector = 'first';
                    break;
            }

            if (this.chatHistory.find('li.' + selector).length && selector != 'system') {
                //已存在客服输入状态时，直接显示
                if (selector == 'systembottom') {
                    this.chatHistory.find('li.' + selector).css('visibility', 'visible');
                }
                liElement = this.chatHistory.find('li.' + selector).html(this._getMessageHtml(position, this._contentFilter(data)));
            } else if (!data) {
                //用于清除消息
                this.chatHistory.find('li.' + selector).remove();
            } else {
                //系统消息，直接替换
                if (selector === 'system') {
                    this.chatHistory.find('li.' + selector).remove();
                }
                //置顶消息
                if (selector === 'first' && this.chatHistory.find('ul li').length > 1) {
                    before = this.chatHistory.find('li').eq(0);
                }
                //消息排序，排序规则
                else {
                    compare = this.chatHistory.find('li').eq(0 - beforeCount);
                    if (compare.indexOfClass('first')) {
                        before = null;
                    } else {
                        if (compare.indexOfClass('systembottom')) {
                            beforeCount++;
                            before = compare;
                            compare = this.chatHistory.find('li').eq(0 - beforeCount);
                        }

                        if (selector === 'system' && this.mode.enterUserId) {
                            while (compare && compare.attr("userid") == this.mode.enterUserId) {
                                if (beforeCount >= 5) {
                                    break;
                                }
                                beforeCount++;
                                before = compare;

                                compare = this.chatHistory.find('li').eq(0 - beforeCount);
                            }
                            this.mode.enterUserId = "";
                        }

                        while (compare && !compare.indexOfClass('first') && !compare.indexOfClass('system') && compare.attr("localtime") && beforeCount <= this.chatHistory.find('li').length && parseFloat(compare.attr("localtime")) >= data.localtime) {
                            if (beforeCount >= 5) {
                                break;
                            }
                            beforeCount++;
                            before = compare;

                            compare = this.chatHistory.find('li').eq(0 - beforeCount);
                        }
                    }
                }
                /* 2015.09.19 判断上条消息时间是否存在且在分钟级别上是否与本次消息的事件一致
                 * 如果一致，将消息的showTime属性置为true
                 * 2015.09.21 逻辑修正为存分钟级别键值与该分钟数据的条数
                 */

                //2016.05.06增加时间间隔为5分钟
                //历史消息时取数组中最后一条消息，正常消息取第一条消息和最后一条消息的最大值
                //（6.8.2合版）修改消息时间戳显示频率为5分钟
                var lastArrayTime;
                if (this.timeArray) {
                    lastArrayTime = (data.history == 1) ? (this.timeArray[this.timeArray.length - 1]) : Math.max(this.timeArray[0], this.timeArray[this.timeArray.length - 1]);
                }

                var inFiveMinute = ((Math.abs(data.timerkeyid - lastArrayTime) <= 300000) && data.timerkeyid - lastArrayTime > 0);

                if (this.timeArray && inFiveMinute) {
                    data.showTime = true;
                } else {
                    data.showTime = false;
                }

                //当消息内容不为空的时候，当前消息时间戳减去上次消息时间超过5分钟，进行存储
                if ((data.msg !== '' && data.type !== 9) || data.type == 2 || data.type == 4 || data.type == 6) {
                    if (!inFiveMinute) {
                        this.timeArray.push(data.timerkeyid);
                    }
                }

                //分钟级别的键值
                /* var timeKey = $.formatDate(data.localtime, 'yyyy-MM-dd hh:mm');
                 //如果timeHash不为空且，此分钟级别键值有数据，则消息的inMinute属性置为true
                 if (this.timeHash && this.timeHash[timeKey]) {
                     data.inMinute = true;
                 } else {
                     data.inMinute = false;
                 }
                 //当消息内容不为空的时候，记录分钟级别键值对应的数据条数
                 if ((data.msg !== '' && data.type !== 9) || data.type == 2 || data.type == 4 || data.type == 6) {
                     if (this.timeHash[timeKey]) {
                         this.timeHash[timeKey] += 1;
                     } else {
                         this.timeHash[timeKey] = 1;
                     }
                 }*/
                try {
                    liElement = $({
                        tag: 'li',
                        className: selector,
                        localtime: data.localtime,
                        userid: data.userid,
                        style: cstyle,
                        history: data.history || '0'
                    }).appendTo(this.chatHistory.find('ul'), before);
                    //2015.11.01 系统消息样式不对，在此再次对背景赋值
                    //2016.04.08 注释掉
                    //  liElement.css('background-color', background_whole);
                    liElement.insert(this._getMessageHtml(position, this._contentFilter(data)));
                } catch (e) {
                    $.Log(e, 3);
                }

                //2016.9.10 debug解决机器人反向引导中含有空格时跳到新的空白页面
                if (data.xnlink) {
                    setTimeout(function() {
                        var el = liElement.find('.robotQuestion');
                        el.tap(function(event) {
                            var event = $.Event.fixEvent(event);
                            event.preventDefault();
                            event.stopPropagation();
                            nTalk.chatManage.get(this.settingid).send($(this).html().replace(/[[0-9]*]\s/, ""));
                            return false;
                        });
                    }, 200);
                }

                if (selector != 'system' && !/2|4/i.test(data.type)) {
                    //消息区连接打开方式处理
                    //采用浮层iframe方式打开URL，保留带返回上一页按钮的标题头
                    liElement.find('a').click(function(event) {
                        //2015.11.10 如果A链接有onclick属性，则不执行此方法
                        if (this.onclick) return;
                        if (self.mode.config.waphref === 0) {
                            self._addHrefOpenListener(event, this);
                        } else {
                            var href = $(this).attr('_href') || $(this).attr('href');
                            if (!$.browser.iOS) {
                                //iOS APP下 window.open方式打开内容无效，暂无其它解决方案，目前只能让所有iOS下都采用常规连接方式打开
                                $(this).attr('_href', href).attr('target', '').attr('href', '###');
                                window.open(href);
                            }
                        }
                        return false;
                    });
                }

                if (data.type == 1 && position == 'left') {
                    //收到消息时，隐藏输入状态
                    this.chatHistory.find('li.systembottom').css('visibility', 'hidden');
                }
            }

            //for mobile: 加载客服头像
            this.setDescIcon(liElement, data.userid);

            //客服输入状态消息3秒后隐藏
            if (selector == 'systembottom') {
                clearTimeout(this.inputTimerid);
                this.inputTimerid = null;
                this.inputTimerid = setTimeout(function() {
                    self.chatHistory.find('li.systembottom').css('visibility', 'hidden');
                }, 3E3);
            }

            this.scrollBottom();

            //2015.09.28 加载链接URL解析内容
            if (data && data.type == 1) {
                this.loadLinkContainer(data.msgid);
            }

            if (data && /^(1|2|4|6|13|8)$/i.test(data.type)) {
                this.updateMessage(data.msgid, data.type, data, position === 'left');
            }

            return selector;
        },
        /**
         * 移除消息
         * @return {[type]}
         */
        removeMessage: function(msgid) {
            this.chatHistory.find('.' + msgid).remove();
        },
        /**
         * 更新消息状态\内容
         * @param  string  msgid
         * @param  bumber  type
         * @param  json    data
         * @param  boolean receive
         * @return {void}
         * debug 提取公用的showImageUpload方法
         */
        updateMessage: function(msgid, type, data, receive) {
            var self = this,
                position,
                liElement = this.chatHistory.find('.' + msgid).last(),
                bodyElement = liElement.find('.view-history-body').last();

            //2016.04.06bububble #CEF2FF 图片的气泡颜色
            //（6.8.2合版）消息的背景、边框，单独提取到变量中
            var bubble = newWapTheme.bubble;
            var bubble_border = bubble;

            switch (type + '') {
                case "1":
                    if (typeof data === 'string') {
                        //消息发送失败时，显示可以重新发送的连接
                        this._showResend(msgid, data).tap(function(event) {
                            $.Event.fixEvent(event).stopPropagation();

                            $(this).parent().parent().display();
                            self.mode.resend(msgid);
                        });
                    } else if (bodyElement.find('.ntalk-preview').length) {
                        //2015.03.28 常规消息中含图片时预加载图片，显示小图，点击可查看大图
                        //2015.05.06 机器人版本，用户配置的消息可能含存在同一条消息中有多个超大图片
                        bodyElement.find('.ntalk-preview').each(function(i) {
                            var imageElement = this,
                                imageurl = $(imageElement).attr('sourceurl');

                            var hzm = '#image';

                            if ($(imageElement).attr('robotImg')) {
                                hzm = '#robotImg#image';
                            }

                            $.require(imageurl + hzm, function(image) {
                                if (image.error) {
                                    $(imageElement).display();
                                } else {
                                    var attr = $.zoom(image, 332, 500);
                                    $(imageElement).attr({
                                        width: attr.width,
                                        height: attr.height,
                                        src: image.src
                                    }).click(function(event) {
                                        self._fullScreenImage(this);
                                    }).css({
                                        width: attr.width + 'px',
                                        height: attr.height + 'px',
                                        cursor: 'pointer'
                                    });
                                }
                            });
                        });
                    }
                    break;
                case "13":
                    //展示商品信息
                    var attr, k, html = [],
                        options, json = data.msg.item || data.msg.items || {};

                    if (!json || $.isEmptyObject(json)) {
                        return;
                    }
                    json.url = json.url || SCRIPT_URL;
                    if (json.name) {
                        html.push('<a style="' + $.STYLE_BODY + 'color:#0479D9;font-weight:bold;"');
                        if (json.url) {
                            html.push($.browser.iOS ? ' href="' + json.url + '" target="_blank"' : ' onclick="window.open(\'' + json.url + '\')"');
                        }
                        html.push('>' + json.name + '</a>');
                    }
                    $.each(json, function(k, productAttr) {
                        if ($.isArray(productAttr)) {
                            productAttr[1] = (k.indexOf('price') > -1 && json.currency && (productAttr[1] + '').indexOf(json.currency) <= -1 ? json.currency : '') + '' + productAttr[1];

                            html.push('<div style="' + $.STYLE_BODY + '"><span>' + productAttr[0] + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + '</span>' + productAttr[1] + '</div>');

                            $.Log(productAttr[0] + ': ' + productAttr[1]);
                        } else if ($.isObject(productAttr)) {
                            productAttr.v = (k.indexOf('price') > -1 && json.currency && (productAttr.v + '').indexOf(json.currency) <= -1 ? json.currency : '') + '' + productAttr.v;

                            html.push('<div style="' + $.STYLE_BODY + '"><span>' + productAttr.k + (/zh_cn|zh_tw/i.test($.lang.language) ? '&#65306;' : ':') + '</span>' + productAttr.v + '</div>');

                            $.Log(productAttr.k + ': ' + productAttr.v);
                        } else if ($.lang.goodsinfo[k]) {
                            //添加货币符号
                            productAttr = (k.indexOf('price') > -1 && json.currency && (productAttr + '').indexOf(json.currency) <= -1 ? json.currency : '') + productAttr;

                            html.push('<div style="' + $.STYLE_BODY + '"><span>' + $.lang.goodsinfo[k] + ' </span>' + productAttr + '</div>');

                            $.Log($.lang.goodsinfo[k] + '' + productAttr);
                        }
                    });
                    if (json.imageurl) $.require(json.imageurl + '#image', function(image) {
                        if (!image.error) {
                            attr = $.zoom(image, 150, 145);
                            self.chatHistory.find('.view-history-goods-image').html('<a href="' + json.url + '" target="_blank" style="' + $.STYLE_BODY + '"><img src="' + json.imageurl + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_NBODY + 'width:' + attr.width + 'px;height:' + attr.height + 'px;" /></a>');
                        }
                        if (self.scroll) {
                            self.scroll.scrollBottom();
                        }
                    });
                    if (self.scroll) {
                        self.scroll.scrollBottom();
                    }
                    this.chatHistory.find('.view-history-goods-info').html(html.join(''));
                    break;
                    //2016.08.11 蜜芽定制，添加视频消息
                case "8":
                    var html = [],
                        sourceurl = data.url,
                        imgurl = data.pictureurl;

                    if (imgurl) {
                        html.push(['<span class="ntkf-video-button" style="display:block;width:88px;height:88px;background:url(' + $.button + ') center no-repeat;position:absolute;left:48px;top:72px;"></span>',
                            '<video src="' + sourceurl + '" style="' + $.STYLE_BODY + 'width:100%;height:100%;position:relative;display:none;" loop controls></video>'
                        ].join(''));
                        bodyElement.parent().css({
                            'padding': '0px',
                            //'line-height':'0'
                        });
                        bodyElement.css({
                            'background': 'url(' + imgurl + ') center no-repeat',
                            'background-size': '100%'
                        }).html(html);
                        $('.view-history-body').click(function(event) {
                            event.stopPropagation();

                            $(this).find('video').css('display', 'block').get(0).play();

                            $(this).css('background', 'none');

                            $(this).find('.ntkf-video-button').css('display', 'none');

                        });
                    } else {
                        html.push(['<span class="ntkf-video-button" style="display:block;width:180px;height:240px;background:url(' + $.button2 + ') center no-repeat;position:absolute;left:0px;top:0px;"></span>',

                            '<video src="' + sourceurl + '" style="' + $.STYLE_BODY + 'width:100%;height:100%;position:relative;display:none;" loop controls></video>'
                        ].join(''));
                        $('.view-history-body').click(function(event) {
                            event.stopPropagation();

                            $(this).find('video').css('display', 'block').get(0).play();

                            $(this).css('background', 'none');

                            $(this).find('.ntkf-video-button').css('display', 'none');

                        })
                    }
                    bodyElement.parent().css('padding', '0px');
                    bodyElement.css({
                        'width': '180px',
                        'height': '240px',
                        'line-height': '0',
                        'padding': '0',
                        'position': 'relative',
                        'border-radius': '3px',
                        'box-shadow': ' 0px 1px 1px #999'
                    }).html(html).attr('video', 'video');
                    window.addEventListener('touchmove', function() {
                        for (var i = 0; i < $('.view-history-body[video=video]').find('video').length; i++) {
                            $('.view-history-body[video=video]').css({
                                'background': 'url(' + imgurl + ') center no-repeat',
                                'background-size': '100%'
                            }).find('video').css('display', 'none')[i].pause();
                            $('.view-history-body[video=video]').find('.ntkf-video-button').css('display', 'block');
                        }
                    }, true)
                    break;
                case "2":
                case "4":
                    if (data.type == 2 && data.emotion == 1) {
                        //2015.02.06, 加载自定义表情
                        $.require(data.sourceurl + '#image', function(image) {
                            if (image.error) {
                                $.Log('emotion file failure.', 3);

                                if (data.msgid) self.removeMessage(data.msgid);
                            } else {
                                var attr = $.zoom(image, 100, 85);
                                bodyElement.css({
                                    'background': 'none',
                                    'cursor': 'auto',
                                    'border': 'none',
                                    'height': attr.height + 'px'
                                }).html('<img src="' + data.sourceurl + '" sourceurl="' + data.sourceurl + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_BODY + 'width:' + attr.width + 'px;height:' + attr.height + 'px;vertical-align:middle;" />');
                            }
                        });
                    } else if (data.status == 'COMPRESS') {
                        //2015.11.01 添加移动端图片压缩状态下的页面交互处理
                        this._showCompress(msgid);
                    } else if (data.status == 'UPLOADING') {
                        //2015.11.01 开始上传
                        this._showUploading(msgid, bodyElement);
                    } else if ($.isNumeric(data) && data > 0 && data <= 100) {
                        //正在上传
                    } else if (data < 0 || data.error) {
                        //2015.11.01 不能设置宽高为auto 需要显示失败图片
                        /*if (type == 2) {
                            bodyElement.css({
                                width: 'auto',
                                height: 'auto'
                            });
                        }*/
                        if (data == -1) {
                            this._transCancel(msgid);
                        } else {
                            this._showFailure(msgid, receive.etype);
                        }
                        liElement.find('.view-history-progress').display();
                    } else if ($.isObject(data) && data.url) {
                        //隐藏控制栏
                        this._showActionList(null, true);

                        //2015.11.01 需要显示的图片，将msgid放入imageMsgIdArr中
                        self.imageHash[msgid] = 0;

                        //文件、图片上传完成
                        if (type == 2) { //图片
                            $.require(data.url + '#image', function(image) {
                                if (image.error) {
                                    $.Log('upload file failure.', 3);

                                    bodyElement.css({
                                        'background': 'url(' + $.imageicon + ') no-repeat -440px -12px'
                                    });
                                    //debugger
                                    //2015.05.15 发送失败时刷新页面时的显示结果
                                    bodyElement.html('');
                                    bodyElement.css({
                                        'border': 'solid 0px #a1cce8'
                                    });
                                    liElement.find('.view-chat-angle').display(0);

                                } else {
                                    //$.Log('upload file success:' + data.url);
                                    var attr = $.zoom(image, 140, 110);
                                    liElement.find('.view-chat-angle').display(1);

                                    //2015.11.01 判断属于访客或客服的ID，设置不同的颜色
                                    var dest = $.base.checkID(liElement.attr('userid')) <= 1,
                                        userid = liElement.attr('userid'),
                                        //2016.04.06更改颜色值
                                        backgroundColor = (dest && userid) ? '#FFFFFF' : bubble,
                                        border = (dest && userid) ? '#ffffff' : bubble_border;

                                    bodyElement.css({
                                        'border': '1px solid ' + border,
                                        'padding': '2px',
                                        'background': backgroundColor,
                                        'cursor': 'pointer',
                                        'height': attr.height + 'px'
                                    }).html('<img src="' + data.url + '" sourceurl="' + data.sourceurl + '" width="' + attr.width + '" height="' + attr.height + '" style="' + $.STYLE_NBODY + 'vertical-align:middle;border-radius:5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;-ms-border-radius: 5px;" />').find('img').tap(function(event) {
                                        self._fullScreenImage(this, msgid);
                                    });
                                    self.scrollBottom();
                                    self._hideUploading(msgid);
                                    //2015.11.01 成功展现的将在imageHash中的msgid对应的value值置为1
                                    self.imageHash[msgid] = 1;
                                }
                            });
                        } else {
                            this._showDownload(msgid, receive, data).tap(function(event) {
                                var downurl = data.sourceurl || data.url;
                                $.Event.fixEvent(event).stopPropagation();

                                self.displayiFrame.attr('src', downurl + '&rnd=' + $.getTime());

                                return false;
                            });
                        }
                        liElement.find('.view-history-progress').display();
                    }
                    break;
                case "6":
                    //创建音频消息播放器
                    var musicEl = new $.Music(msgid, data.url, 'audio/mpeg', (data.duration || data.length), this.audioView, this.audioBindEvent, this.contains);
                    break;
                default:
                    bodyElement.html(data);
                    break;
            }
        },
        /**
         * @method loadLinkContainer 查询加载消息区连接地址
         * @param  {string} msgid
         * @return {void}
         */
        loadLinkContainer: function(msgid) {
            var self = this,
                linkContains = this.chatHistory.find('.' + msgid).last().find('.view-history-body').find('.ntalk-link-contains');
            if (!linkContains.length) return;

            linkContains.each(function(i, aElement) {
                var url = $(aElement).attr('data-source');
                var selector = $(aElement).attr('class');
                if (url) {
                    self.mode.loadLink(url, '.' + selector.replace(/ntalk\-link\-contains\s+/gi, ''));
                }
            });
        },
        /**
         * @method viewLinkContainer 显示连接信息
         * @param  {json|string} data
         * @return {void}
         */
        viewLinkContainer: function(data, selector) {
            var self = this,
                root = $(selector),
                linkImage;
            if (self.siteid == "kf_9739") {
                var flag = true;
                for (var i = 0; i < root[0].parentElement.childNodes.length; i++) {
                    if (root[0].parentElement.childNodes[i].nodeType == 3) {
                        flag = false;
                    }
                }
                if (flag) {
                    for (var j = 0; j < $(root[0].parentElement).find('div').length; j++) {
                        if (nTalk(root[0].parentElement).find("div").eq(j)[0].className == "") {
                            nTalk(root[0].parentElement).find("div").eq(j).find('a').css("display", "none");
                        }
                    }
                }
            }
            if (typeof data == 'string') {
                try {
                    data = $.JSON.parseJSON(data);
                    data.url = $.protocolFilter(data.url);
                    data.imageurl = $.protocolFilter(data.imageurl);
                } catch (e) {}
            }

            root.css({
                "margin": "5px",
                "border-radius": "5px",
                "border": "1px solid #CCC",
                "background-color": "#FAFAFA",
                "width": $.browser.mobile ? "auto" : "300px",
                'max-width': $.browser.mobile ? ($(window).width() - 150) + "px" : "300px"
            });
            linkImage = $({
                className: 'link-image',
                style: $.STYLE_BODY + 'margin:10px;background-color:#fff;width:77px;height:77px;overflow:hidden;float:left;display:inline-block;'
            }).appendTo(root);
            container = $({
                className: 'link-container',
                style: $.STYLE_BODY + 'overflow:hidden;zoom:1;'
            }).appendTo(root);

            $({
                className: 'link-title',
                style: $.STYLE_BODY + 'margin:24px 0 0 0;width:100%;height:24px;white-space:nowrap;text-overflow:ellipsis;-o-text-overflow:ellipsis;overflow:hidden;'
            }).appendTo(container).html(
                ['<a href="', data.url, '" target="_blank">', $.enCut(data.title, 30), '</a>'].join('')
            );
            data.description && $({
                className: 'link-desc',
                style: $.STYLE_BODY + 'margin:5px 0 10px 0;width:100%;max-height:60px;overflow:hidden;'
            }).appendTo(container).html($.enCut(data.description, 96, 1) + '&nbsp;');
            $({
                className: 'link-customer',
                style: $.STYLE_BODY + 'margin:5px 0 10px 0;width:100%;max-height:60px;overflow:hidden;'
            }).appendTo(container).html(data.customer);
            $({
                className: 'link-clear',
                style: $.STYLE_BODY + 'clear:both;'
            }).appendTo(root);

            linkImage.css('margin', ((root.height() - linkImage.height()) / 2 + 'px') + ' 10px');

            root.find('a').click(function(event) {
                if (self.mode.config.waphref === 0) {
                    self._addHrefOpenListener(event, this);
                } else {
                    var href = $(this).attr('_href') || $(this).attr('href');
                    if (!$.browser.iOS) {
                        //iOS APP下 window.open方式打开内容无效，暂无其它解决方案，目前只能让所有iOS下都采用常规连接方式打开
                        $(this).attr('_href', href).attr('target', '').attr('href', '###');
                        window.open(href);
                    }
                }
            });

            //load image
            $.require(data.imageurl + '#image', function(image) {
                var attr = $.zoom(image, 75, 75);
                var margin = (75 - attr.height) / 2 + 'px ' + (75 - attr.width) / 2 + 'px';
                linkImage.html(
                    ['<img src="', data.imageurl, '" style="', $.STYLE_NBODY, 'margin:' + margin + ';width:' + attr.width + 'px;height:' + attr.height + 'px;"/>'].join('')
                );
            });
        },
        /**
         * @method scrollBottom 消息区向下滚动
         * @return {void}
         * 6.1.7.* 修改
         */
        scrollBottom: function() {
            var scrollTop = Math.max($(document.body).height() - $(window).height(), this.chatHistory.scrollHeight());
            $(this.chatElement).scrollTop(scrollTop);
        },
        /**
         * @method suggest 显示输入建议
         * (6.8.2合版) wap暂时不做输入引导
         * @param  {array}  data
         */
        suggest: function(data) {
            /*            var self = this,
                            list = this.bottomElement.find('.chat-view-hidden-area .chat-view-suggest-list');
                        list.find('ul li').remove();

                        $.each(data, function(i, message) {
                            $({
                                tag: 'LI',
                                talk_index: i,
                                className: '',
                                style:$.STYLE_BODY + 'padding:0 0 0 20px;list-style:none;line-height:28px;height:28px;overflow:hidden;cursor:pointer;'
                            }).appendTo(list.find('ul')).html(message).hover(function(event) {
                                $(this).css({
                                    'color': '#fff',
                                    'background-color': '#4297e0'
                                });
                            }, function(event) {
                                $(this).css({
                                    'color': '#000',
                                    'background-color': '#fafafa'
                                });
                            }).tap(function(event, type) {
                                $.Event.fixEvent(event).stopPropagation();

                                //2015.04.15 点击建议消息后发送index类型消息,值为索引
                                var index = parseFloat($(this).attr('talk_index')) + 1;
                                self.mode.send({
            						msg: !type ? index : message,
                                    botindex: 'index'
                                });
                                self.textEditor.val('');

                                list.css('display', 'none');
                            });
                        });

                        list.css({
                            'display': 'block',
                            'width': ($(window).width() - 5) + 'px',
                            'top': (0 - 18 - 26 * data.length) + 'px'
                        });*/
        },
        /**
         * 开始分配置客服
         * 2015.11.01 分配成功时，将header颜色置为透明
         * debug
         * @param  {[type]} display [description]
         * @param  {[type]} message [description]
         * @return {[type]}         [description]
         */
        displayStatusInfo: function(display, message, messageCss, closeDisplay) {
            var self = this;

            if (message) {
                this.chatElement.find('.chat-view-system-message').html(message);
                if (messageCss) this.chatElement.find('.chat-view-system-message').css(messageCss);
            }
            if (display) {
                if ($.browser.iPhone6 || $.browser.iPhone6Plus) {
                    this.chatElement.find('.chat-view-window-status-info').css({
                        'position': 'absolute',
                        'top': '0px'
                    });
                }
                this.chatElement.find('.chat-view-window-status-info').display(1);
                this.chatElement.find('.chat-view-system-close').display(closeDisplay ? 1 : 0);
                this.chatElement.find('.chat-view-system-close').tap(function(event) {
                    self.displayStatusInfo(false);
                });
            } else {
                this.chatElement.find('.chat-view-window-status-info').hide(function() {
                    $(this).css({
                        'display': 'none',
                        'opacity': 1
                    });
                    if (self.mode._Enableevaluation && !isEdu) {
                        $('.chat-view-window-header-ev-close').display(1);
                    }
                });
            }
        },
        /**
         * 2015.11.01 客服输入状态样式调整
         * 客服正在输入,在聊窗中创建一条新消息占位，此消息会一直在最新位置
         * @param {number} position 位置
         * @return {void}
         */
        showInputState: function(position) {
            if (!$.browser.iPhone) {
                $('.chat-view-window-history').css('padding-bottom', '0px');
            } else {
                $('.chat-view-window-history').css('padding-bottom', '80px');
            }

            if (this._inputStateTimeID && position === undefined) {
                return;
            }
            position = position ? position : -22;

            var self = this,
                elementWait = this.chatHistory.find('.view-history-body-wait');

            elementWait.html($.lang.system_printing || '').css({
                'position': 'relative',
                'width': '60px',
                'left': '10px',
                'font-size': '14px',
                'line-height': '20px'
            });

            $({
                tag: 'span',
                style: 'display:block; left: -24px; top:-20px; position:relative; width:20px; height:20px; background: url(' + $.imageicon + ') -110px -70px no-repeat'
            }).appendTo(elementWait);
            $({
                id: 'show-input-status-loading',
                tag: 'span',
                style: 'display:block; left: -14px; top:-38px; position:relative; width:20px; height:20px'
            }).html(this.loadingPoint ? this.loadingPoint : '...').appendTo(elementWait);

            var count = 3;
            if (!this._inputStatusLoadingInter) {
                this._inputStatusLoadingInter = setInterval(function() {
                    self.loadingPoint = '';
                    count--;
                    for (var i = 0; i < count; i++) {
                        self.loadingPoint += '.';
                    }
                    $('#show-input-status-loading').html(self.loadingPoint);
                    if (count == -1) {
                        count = 4;
                    }
                }, 1000);
            }

            this._inputStateTimeID = setTimeout(function() {

                if (!elementWait.length) {
                    clearTimeout(self._inputStateTimeID);
                    clearInterval(self._inputStatusLoadingInter);
                    self._inputStateTimeID = null;
                    return;
                }

                position = position <= -52 ? -22 : position - 10;
                elementWait.css('background-position', position + 'px -250px');

                self.showInputState(position);
            }, 5E2);
        },
        /**
         * 2015.11.01 重写发送消息样式调整
         * @method _showResend 显示重新发送消息
         * @param  {string} msgid 消息ID
         * @param  {string} msg   消息内容
         * @return {[type]}       [description]
         */
        _showResend: function(msgid, msg) {
            var el = this.chatHistory.find('.' + msgid).last();

            el.find('.view-history-status').css('left', '-50px').display(1);
            el.find('.view-history-status-loading').display(0);
            return el.find('.view-history-status-icon').css('background-position', '-228px -18px').display(1);
        },
        /**
         * @method _showCancel 显示取消文件上传消息
         * @param  {string}  msgid   消息ID
         * @param  {boolean} receive 是否是接收消息
         * @return {[type]}         [description]
         */
        _showCancel: function(msgid, receive) {
            this.chatHistory.find('.' + msgid).last().find('.view-history-status').css('left', receive ? '-60px' : '-110px').display(1);
            this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display();
            return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html('<span style="' + $.STYLE_BODY + 'cursor:pointer;color:#005ffb;text-decoration:none;">' + $.lang.news_cancel_trans + '</span>').find('span');
        },
        /**
         * @method _showDownload 显示文件下载连接与文件名
         * @param  {string}  msgid   [description]
         * @param  {boolean} receive [description]
         * @param  {json}    data    [description]
         * @return {HtmlDom}         [description]
         */
        _showDownload: function(msgid, receive, data) {
            var liElement = this.chatHistory.find('.' + msgid).last();
            var downurl = data.sourceurl || data.url;
            liElement.find('.view-history-body .view-download-icon').css('background', 'url(' + $.imageicon + ') no-repeat -57px -90px');
            if (!$.browser.iOS) {
                liElement.find('.view-history-body a').css('visibility', 'visible');
            }
            if ($.browser.ua.indexOf('baidubrowser') > -1) {
                //百度手机浏览器通过iframe不能下载文件
                liElement.find('.view-history-body a').attr({
                    target: "_blank",
                    href: downurl
                });
            }
            return liElement.find('.view-history-body a');
        },
        _toFileName: function(fName) {
            fName = fName || '';
            return $.enLength(fName) < 16 ? fName : $.enCut(fName, 10) + '..' + fName.substr(fName.length - 4, 4);
        },

        /**
         * 2015.11.01 图片压缩时需要一段时间，界面需要有回应，避免假死现象
         * 1、显示预置图片
         * 2、提示语：正在压缩
         * 3、注意调整定位
         * 4、隐藏尖角
         * language
         */
        _showCompress: function(msgid) {
            //获取元素
            var liEl = this.chatHistory.find('.' + msgid).last();
            var bodyEl = this.chatHistory.find('.' + msgid + ' .view-history-body');
            var picStatusEl = liEl.find('.view-history-pic-status');

            //设置背景为预置图片，设置提示语为正在压缩
            bodyEl.css({
                'background': 'url(' + $.imageicon + ') no-repeat -355px -12px',
                'border': 'none'
            });

            //隐藏尖角 05-06
            liEl.find('.view-chat-angle').display(0);

            picStatusEl.display(1).html($.lang.system_upload_compress);
        },

        /**
         * 2015.11.01 图片上传时的界面交互
         * language
         */
        _showUploading: function(msgid) {
            var self = this;
            var liEl = this.chatHistory.find('.' + msgid).last();
            var bodyEl = liEl.find('.view-history-body');

            //设置背景为预置图片，设置提示语为正在上传，隐藏重新发送按钮，显示loading图标
            bodyEl.css({
                'background': 'url(' + $.imageicon + ') no-repeat -355px -12px',
                'border': 'none'
            });

            liEl.find('.view-history-pic-status').display(1).html($.lang.system_upload_start);
            liEl.find('.view-history-status').css({
                'left': '-50px',
                'top': '-40px'
            }).display(1);
            liEl.find('.view-history-status-icon').display(0);
            liEl.find('.view-history-status-loading').display(1);
            //2016.05.06
            liEl.find('.view-chat-angle').display(0);

            setTimeout(function() {
                self._outTimeResend(msgid);
            }, 20 * 1000);
        },

        /**
         * 2015.11.01 发送图片超时后的界面交互
         */
        _outTimeResend: function(msgid) {
            var liEl = $('.' + msgid),
                bodyEl = liEl.find('.view-history-body'),
                self = this;

            //重传界面变动
            liEl.find('.view-history-status-loading').display(0);
            liEl.find('.view-history-status-icon').display(0); //（6.8.2） （6.8.1中为display(1)）
            liEl.find('.view-history-pic-status').html($.lang.news_trans_failure);
            bodyEl.css('background-position', '-440px -12px');

            //重发按钮事件,重写此逻辑后，再开放重新上传功能（6.8.2）
            /*liEl.find('.view-history-status-icon').tap(function() {
                self.removeMessage(msgid);
                self.objImage.iframe.bind('readystatechange', self.objImage.completed).bind('load', self.objImage.completed);
                self.objImage.fileChange(null, self.objImage.element[0].files);
            });*/
        },

        /**
         * 完成上传后，隐藏状态栏，load定时器
         */
        _hideUploading: function(msgid) {
            var liEl = this.chatHistory.find('.' + msgid).last();
            liEl.find('.view-history-status').display(0);
            liEl.find('.view-history-pic-status').display(0);

        },

        _showFailure: function(msgid, eType) {
            var liElement = this.chatHistory.find('.' + msgid).last();
            var bodyElement = this.chatHistory.find('.' + msgid + ' .view-history-body');
            liElement.find('.view-history-status-loading').display(0);
            liElement.find('.view-history-status-icon').display(0);
            liElement.find('.view-history-pic-status').display(1).html(eType == 'TYPE' ? $.lang.system_picture_error_type : $.lang.system_picture_error_size);
            return bodyElement.css('background', 'url(' + $.imageicon + ') -440px -12px transparent');
        },
        _transCancel: function(msgid) {
            this.chatHistory.find('.' + msgid).last().find('.view-history-status').css('left', '-130px').display(1);
            this.chatHistory.find('.' + msgid).last().find('.view-history-status-icon').display(1);
            return this.chatHistory.find('.' + msgid).last().find('.view-history-status-link').html($.lang.news_trans_cancel);
        },
        /**
         * 获取输入框中光标位置
         * @param  element input
         * @return {[type]}
         */
        _getPositionForTextArea: function(input) {
            var start = 0;
            if (document.selection) {
                input.focus();
                var rang = document.selection.createRange();
                var dup = rang.duplicate();
                dup.moveToElementText(input);
                start = -1;
                while (dup.inRange(rang)) {
                    dup.moveStart('character');
                    start++;
                }
            } else if (input.selectionStart || input.selectionStart == '0') {
                start = input.selectionStart;
            }
            return start;
        },
        /**
         * 设置光标位置
         * @param {HTMLDOM} input
         * @param {number}  pos
         */
        _setCursorPosition: function(input, pos) {
            this._editorStart = pos;
            if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(pos, pos);
            } else if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        },
        _insertText: function(content) {
            var input = this.textEditor.get(0),
                text = input.value || '',
                start = Math.min(text.length, this._editorStart);
            start = start <= 0 ? text.length : start;
            if (content === true) {
                input.value = text.substr(0, start).replace(/\[[a-z]{2}\]$/, '');
            } else {
                input.value = text.substr(0, start) + content + text.substr(start, text.length);
            }

            this.sendButton.display(input.value !== '');
        },
        /**
         * 2015.11.01 客服头像在切图中位置调整
         * 展示客服信息
         * @param String destId
         * @return
         */
        showDestInfo: function(destId) {
            var self = this,
                dialogElement, attr, html, offset,
                dest = this.mode.hashDest.items(destId);

            if (!dest) {
                return;
            }
            $.Log('dest:' + $.JSON.toJSONString(dest));
            html = [
                '<div class="alert-header" style="', $.STYLE_BODY, 'height:44px;border-bottom:1px solid #ccc;">',
                '<input type="button" class="alert-header-back" style="', $.STYLE_BODY, 'padding:0 10px;margin:8px 0 8px 20px;cursor:auto;border-radius:3px;background:#0079fe;color:#fff;height:28px;line-height:28px;-webkit-appearance: none;" value="', $.lang.back_button_text, '" />',
                '</div>',
                '<div class="alert-body-info" style="', $.STYLE_NBODY, 'margin:0 10px;padding:10px 0;border-bottom:1px solid #ccc;">',
                '<div class="alert-body-icon" style="', $.STYLE_NBODY, 'width:35px;height:35px;border:1px solid #cc;float:left;background:url(', $.imageicon, ') no-repeat scroll -228px -18px;">',
                //'<img src="',dest.icon,'" border="0" style="',$.STYLE_NBODY,'" />',
                '</div>',
                '<div class="alert-body-name" style="', $.STYLE_BODY, 'float:left;margin:20px 0 0 10px;">', dest.name, '</div>',
                '<div style="', $.STYLE_NBODY, 'clear:both;"></div>',
                '</div>',
                '<div class="alert-body-info" style="', $.STYLE_NBODY, 'margin:0 10px;padding:10px 0;border-bottom:1px solid #ccc;">',
                '<div class="alert-body-sign" style="', $.STYLE_BODY, '">',
                $.lang.dest_sign_text, ':', dest.sign,
                '</div>',
                '</div>',
                '<div class="alert-body-bottom" style="', $.STYLE_NBODY, 'margin:0 10px;padding:10px 0;text-align:center;">',
                '<input type="button" class="alert-body-back" style="', $.STYLE_BODY, 'padding:0 10px;cursor:auto;border-radius:3px;background:#0079fe;color:#fff;height:28px;line-height:28px;-webkit-appearance: none" value="', $.lang.send_button_text, '" />',
                '</div>'
            ].join('');

            //显示弹出消息框
            if (!this.evalDialog) {
                this.evalDialog = new $.DialogChat(html, {
                    margin: 0,
                    border: 0,
                    parent: this.contains,
                    style: {
                        height: $(window).height() + 'px'
                    }
                });
            }
            dialogElement = this.evalDialog.container;

            //preload
            $.require(dest.logo + '#image', function(image) {
                if (image.error) {
                    self.contains.find('.alert-body-icon').css('background-image', 'url(' + $.imageicon + ')');
                    $.Log('load user logo failure', 3);
                } else {
                    attr = $.zoom(image, 35, 35);
                    self.contains.find('.alert-body-icon').html('<img src="' + image.src + '" width="' + attr.width + '" height="' + attr.height + '" border="0" style="' + $.STYLE_NBODY + 'margin:' + (35 - attr.height) / 2 + 'px ' + (35 - attr.width) / 2 + 'px;width:' + attr.width + 'px;height:' + attr.height + 'px;" />');

                    self.contains.find('.alert-body-icon').css('background-image', '');
                }
            });
            //back button
            dialogElement.find('.alert-header-back,.alert-body-back').tap(function(event) {
                //self._hiddenDialog();
                self.evalDialog.close();
                self.evalDialog = null;
            });

            return dialogElement;
        },
        /**
         * @method createEvaluation 评价窗口内容
         * @param  {json}   formOptions 表单配置项
         * @param  {string} title       标题
         * @param  {string} startColor  颜色
         * @param  {string} endColor    颜色
         * @param  {function} callback  回调
         * @return {HTMLDOM}
         * 09.28   ???
         */
        createEvaluation: function(formOptions, title, startColor, endColor, callback) {
            $.browser.iPhone5 = $.browser.iOS && $(window).height() > 500 && 　$(window).height() <= 570

            if ($.browser.iPhone5) {
                return this.createEvaluationLowThanIPhone5(formOptions, title, startColor, endColor, callback);
            }

            var self = this,
                dialogElement,
                html = [
                    '<table border="0" cellpadding="0" cellspacing="0" style="', $.STYLE_NBODY, 'margin:0px 0 5px 0;width:100%;">',
                    /*
                    //6.1.7.2 WAP评价取消原标题栏
                    '<tr style="',$.STYLE_NBODY,'">',
                    '<td style="',$.STYLE_BODY,'text-align:center;height:39px;">',
                    '<span style="',$.STYLE_BODY,'font-weight:bold;font-size:18px;color:#000;">' + title + '</span>',
                    '</td></tr>',
                    */
                    $.FORM.createInput(formOptions),
                    '<tr style="', $.STYLE_NBODY, '">',
                    '<td style="', $.STYLE_NBODY, '">',
                    //6.1.7.2 按钮位置变更
                    '<span style="', $.STYLE_NBODY, 'display:inline-block;width:49%;text-align:center;border-top:1px solid #cecece;border-right:1px solid #cecece;padding:2px 0;">',
                    '<input type="button" class="ntkf-alert-cancel" value="' + $.lang.evaluation_button_cancel + '" style="', $.STYLE_BODY, 'text-align:center;padding:5px 0;width:100%;color:#32a8f5;font:normal 14px/28px Arial,SimSun;background:#fbfbfb;-webkit-appearance: none;" />',
                    '</span>',
                    '<span style="', $.STYLE_NBODY, 'display:inline-block;width:50%;text-align:center;border-top:1px solid #cecece;padding:2px 0;">',
                    '<input type="button" class="view-alert-submit" value="' + $.lang.evaluation_button_submit + '" style="', $.STYLE_BODY, 'text-align:center;padding:5px 0;width:100%;color:#32a8f5;font:normal 14px/28px Arial,SimSun;background:#fbfbfb;-webkit-appearance: none;" />',
                    '</span>',
                    '</td></tr>',
                    '</table>',
                ].join('');

            //全屏查看图片
            this._hideScreenImage();

            //评价配置的选项不同时，距离顶部的高度也不同
            var evaluationHeight = (self.options.length == 2 ? 416 : 501);
            var top = ($(window).height() - evaluationHeight) / 2;

            if (!this.evalDialog) {
                this.evalDialog = new $.DialogChat(html, {
                    margin: "39 " + top,
                    border: 0,
                    parent: this.contains,
                    style: {
                        'background-color': '#fbfbfb',
                        'border-radius': '5px',
                        'height': "auto"
                    }
                });
            }

            dialogElement = this.evalDialog.container;
            //针对屏幕太小时无法展示所有内容加入滚动条。 2017-02-17 zlc
            dialogElement.css('overflow-y', 'auto');
            this.evalDialog.options.resizeFunc = function() {
                if ($.browser.iPhone) {
                    setTimeout(function() {
                        dialogElement.css('top', (isEdu ? '65px' : '20px'));
                    });
                }
            };

            dialogElement.find('.ntkf-alert-cancel').tap(function(event) {
                self.evalDialog.close();
                self.evalDialog = null;
            });

            //修正单选项样式
            dialogElement.find('ul').css('margin', '0 5%');
            dialogElement.find('ul li.form-item').css({
                'width': '100%',
                'padding': '0'
            });
            //多行输入框高度自适应
            dialogElement.find('textarea').textareaAutoHeight({
                minHeight: 52,
                maxHeight: 180
            }).css({
                'background-color': '#fbfbfb',
                'margin': '0 10% 15px 10%',
                //2016.05.03 修改padding值
                'padding': '10px 0',
                'line-height': '17px',
                'width': '80%',
                'border': '1px solid #cecece'
            }).tap(function(e) {
                //2015.09.19 点击输入框时，将评价窗口的滚动条置底，边框颜色变更
                $(this).css({
                    'outline': 'none',
                    'border': '1px solid #32a8f5'
                });

                setTimeout(function() {
                    //2015.09.19 如果scrollTop并没有发生改变，1秒后再执行一次
                    var inter = setInterval(function() {
                        dialogElement.scrollTop(dialogElement.scrollHeight());
                    }, 200);

                    setTimeout(function() {
                        clearInterval(inter);
                    }, 1200);
                }, 200);

            }).bind('blur', function() {
                //2015.09.19 失去焦点，还原边框颜色
                dialogElement.find('textarea').css('border', '1px solid #cecece');
            });
            dialogElement.find('.ntkf-alert-close').display();

            //2015.09.19 更改li元素的行高与字体颜色?
            dialogElement.find('li').each(function(i, element) {
                if ($(element).find('input').length > 0) {
                    $(element).css({
                        'position': ($(element).find('input[name=problem]').length > 0 ? 'static' : 'relative'),
                        'height': '35px',
                        'color': '#666666'
                    });
                }
            });
            //绑定单选项事件
            dialogElement.find('input[type=radio]').css({
                'visibility': 'hidden',
                'margin-left': '30px'
            }).each(function(i, element) {
                $(element).parent().click(function(event) {
                    self._selectedRadio(dialogElement, element);
                });
                //2015.09.19 对满意度选项进行样式处理
                if (element.id.indexOf('problem_') == -1) {
                    $(element).parent().find('label').css({
                        'margin-left': '15px'
                    });
                    //2015.09.19 外心圆
                    $(element).parent().append('<div class="chat-radio-item" style="' + $.STYLE_NBODY + 'position:absolute;left:20px;top:-1px;width:20px;height:20px;background:white;border: 1px solid #cecece;border-radius:10px;-webkit-border-radius:10px;-o-border-radius:10px;-moz-border-radius:10px;-ms-border-radius:10px"></div>');
                    //2015.09.19 内心圆
                    $(element).parent().append('<div class="chat-radio-checked" style="' + $.STYLE_NBODY + 'position:absolute;left:22px;top:1px;width:16px;height:16px;background:#32a8f5;border: 1px solid #32a8f5;border-radius:8px;-webkit-border-radius:8px;-o-border-radius:8px;-moz-border-radius:8px;-ms-border-radius:8px;background:#32a8f5;display:none"></div>');
                }
            });

            //修正 "是否解决问题" 的样式
            var problemElement = dialogElement.find('input[type=radio][name=problem]');
            if (problemElement.length > 0) {
                var arrForms = problemElement.parent(2).find('li');
                arrForms.css({
                    'margin': '0px auto',
                    'text-align': 'center',
                    'width': '33%'
                }).find('input').css({
                    'display': 'none'
                });
                arrForms.find('label').css({
                    'padding': '5px 10px',
                    'border-radius': '10px',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    '-o-border-radius': '10px',
                    '-ms-border-radius': '10px',
                    'border': '1px solid #cecece'
                });
            }

            //selected default
            if (dialogElement.find("input[type=radio][checked]").length) {
                dialogElement.find("input[type=radio][checked]").each(function(i, element) {
                    self._selectedRadio(dialogElement, element);
                });
            }

            //输入框可输入字符数提示
            /*            for (var areaElement, i = 0; i < formOptions.length; i++) {
                            if (formOptions[i].type == 'textarea') {
                                areaElement = dialogElement.find('table textarea[name=' + formOptions[i].name + ']').parent();
                                //2014.11.26 输入字数提示节点需要父级节点为相对定位
                                areaElement.css('position', 'relative');
                                $({
                                    className: 'textarea-' + formOptions[i].name,
                                    maxsize: formOptions[i].max,
                                    style: $.STYLE_BODY + 'font-size:16px;font-weight:bold;color:#ccc;float:right;position:absolute;right:10%;bottom:20px;'
                                }).appendTo(areaElement).html('0/' + formOptions[i].max);
                            }
                        }*/
            /*            dialogElement.find('table textarea').bind('keyup', function(event) {
                            var selector = 'table .textarea-' + $(this).attr('name');
                            var color = $.enLength($(this).val()) > dialogElement.find(selector).attr('maxsize') ? '#f00' : '#ccc';
                            var inputText = $.enLength($(this).val()) + '/' + dialogElement.find(selector).attr('maxsize');

                            dialogElement.find(selector).html(inputText).css('color', color);
                        });*/

            //bind form event
            $.FORM.bindFormEvent(formOptions, dialogElement);

            //set evaluation form focus
            dialogElement.find('input[type!=hidden],textarea').get(0).focus();

            dialogElement.find('.view-alert-submit').click(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                //2016.02.14 预防重复点击评价
                //2016.04.20 失败没有回调，导致1次评价，提示输入错误后，无法再次评价
                if (self.evalRepeatClick && self.evalDialog) {
                    self.evalRepeatClick = false;
                    self.mode.submitEvaluationForm(function() {
                        if ($.isFunction(callback)) callback();

                        self.evalDialog.close();
                        self.evalDialog = null;
                        self.evalRepeatClick = true;
                    }, function() {
                        self.evalRepeatClick = true;
                    });
                }
            });

            this.evalDialog.resize();

            //关闭附加功能接钮区
            this._showActionList(null, true);

            //opera浏览器，有输入框的时候弹出评价框
            if ($.browser.opera) {
                setTimeout(function() {
                    window.scroll(0, $(document.body).height());
                }, 50);
            }
            //教育版header比较高，所以重新设置下高度。
            setTimeout(function() {
                dialogElement.css('top', (isEdu ? '65px' : '20px'));
            }, 50)

            //2017.04.26教育版加一个绑定事件，根据窗口改变评价区域的大小。
            if (isEdu) {
                $(window).bind('resize', function() {
                    dialogElement.css('height', ($(window).height() - 162) + 'px')
                })
            }
            return dialogElement;
        },

        //迫不得已，权宜之计，不要怪我
        createEvaluationLowThanIPhone5: function(formOptions, title, startColor, endColor, callback) {
            var self = this,
                dialogElement,
                html = [
                    '<table border="0" cellpadding="0" cellspacing="0" style="', $.STYLE_NBODY, 'margin:0px 0 5px 0;width:100%;">',
                    /*
                    //6.1.7.2 WAP评价取消原标题栏
                    '<tr style="',$.STYLE_NBODY,'">',
                    '<td style="',$.STYLE_BODY,'text-align:center;height:39px;">',
                    '<span style="',$.STYLE_BODY,'font-weight:bold;font-size:18px;color:#000;">' + title + '</span>',
                    '</td></tr>',
                    */
                    $.FORM.createInput(formOptions),
                    '<tr style="', $.STYLE_NBODY, '">',
                    '<td style="', $.STYLE_NBODY, '">',
                    //6.1.7.2 按钮位置变更
                    '<span style="', $.STYLE_NBODY, 'display:inline-block;width:49%;text-align:center;border-top:1px solid #cecece;border-right:1px solid #cecece;padding:0;">',
                    '<input type="button" class="ntkf-alert-cancel" value="' + $.lang.evaluation_button_cancel + '" style="', $.STYLE_BODY, 'text-align:center;padding:2px 0;width:100%;color:#32a8f5;font:normal 14px/28px Arial,SimSun;background:#fbfbfb;-webkit-appearance: none;" />',
                    '</span>',
                    '<span style="', $.STYLE_NBODY, 'display:inline-block;width:50%;text-align:center;border-top:1px solid #cecece;padding:0;">',
                    '<input type="button" class="view-alert-submit" value="' + $.lang.evaluation_button_submit + '" style="', $.STYLE_BODY, 'text-align:center;padding:2px 0;width:100%;color:#32a8f5;font:normal 14px/28px Arial,SimSun;background:#fbfbfb;-webkit-appearance: none;" />',
                    '</span>',
                    '</td></tr>',
                    '</table>',
                ].join('');

            //全屏查看图片
            this._hideScreenImage();

            //评价配置的选项不同时，距离顶部的高度也不同
            var evaluationHeight = (self.options.length == 2 ? 416 : 501);
            var top = ($(window).height() - evaluationHeight) / 2;

            if (!this.evalDialog) {
                this.evalDialog = new $.DialogChat(html, {
                    margin: "15 0",
                    border: 0,
                    parent: this.contains,
                    style: {
                        'background-color': '#fbfbfb',
                        'border-radius': '5px',
                        'height': "auto"
                    }
                });
            }

            dialogElement = this.evalDialog.container;
            this.evalDialog.options.resizeFunc = function() {
                if ($.browser.iPhone) {
                    setTimeout(function() {
                        dialogElement.css('top', self.options.length == 2 ? '30px' : '10px');
                    });
                }
            };

            dialogElement.find('.ntkf-alert-cancel').tap(function(event) {
                self.evalDialog.close();
                self.evalDialog = null;
            });

            if ($.browser.iPhone4) {
                dialogElement.find('.nt-mobile-form-title').css({
                    'margin': '10px 0px',
                });
            } else {
                dialogElement.find('.nt-mobile-form-title').css({
                    'margin': '15px 0px',
                });
            }

            //修正单选项样式
            dialogElement.find('ul').css('margin', '0 5%');
            dialogElement.find('ul li.form-item').css({
                'width': '100%',
                'padding': '0'
            });
            //多行输入框高度自适应
            dialogElement.find('textarea').textareaAutoHeight({
                minHeight: 52,
                maxHeight: 180
            }).css({
                'background-color': '#fbfbfb',
                'margin': '0 10% ' + ($.browser.iPhone4 ? 10 : 15) + 'px 10%',
                //2016.05.03 修改padding值
                'padding': '10px 0',
                'line-height': '17px',
                'width': '80%',
                'border': '1px solid #cecece'
            }).tap(function(e) {
                //2015.09.19 点击输入框时，将评价窗口的滚动条置底，边框颜色变更
                $(this).css({
                    'outline': 'none',
                    'border': '1px solid #32a8f5'
                });

                setTimeout(function() {
                    //2015.09.19 如果scrollTop并没有发生改变，1秒后再执行一次
                    var inter = setInterval(function() {
                        dialogElement.scrollTop(dialogElement.scrollHeight());
                    }, 200);

                    setTimeout(function() {
                        clearInterval(inter);
                    }, 1200);
                }, 200);

            }).bind('blur', function() {
                //2015.09.19 失去焦点，还原边框颜色
                dialogElement.find('textarea').css('border', '1px solid #cecece');
            });
            dialogElement.find('.ntkf-alert-close').display();

            //2015.09.19 更改li元素的行高与字体颜色?
            dialogElement.find('li').each(function(i, element) {
                if ($(element).find('input').length > 0) {
                    $(element).css({
                        'position': ($(element).find('input[name=problem]').length > 0 ? 'static' : 'relative'),
                        'height': ($.browser.iPhone4 ? 28 : 30) + 'px',
                        'color': '#666666'
                    });
                }
            });
            //绑定单选项事件
            dialogElement.find('input[type=radio]').css({
                'visibility': 'hidden',
                'margin-left': '30px'
            }).each(function(i, element) {
                $(element).parent().click(function(event) {
                    self._selectedRadio(dialogElement, element);
                });
                //2015.09.19 对满意度选项进行样式处理
                if (element.id.indexOf('problem_') == -1) {
                    $(element).parent().find('label').css({
                        'margin-left': '15px'
                    });
                    //2015.09.19 外心圆
                    $(element).parent().append('<div class="chat-radio-item" style="' + $.STYLE_NBODY + 'position:absolute;left:20px;top:-1px;width:20px;height:20px;background:white;border: 1px solid #cecece;border-radius:10px;-webkit-border-radius:10px;-o-border-radius:10px;-moz-border-radius:10px;-ms-border-radius:10px"></div>');
                    //2015.09.19 内心圆
                    $(element).parent().append('<div class="chat-radio-checked" style="' + $.STYLE_NBODY + 'position:absolute;left:22px;top:1px;width:16px;height:16px;background:#32a8f5;border: 1px solid #32a8f5;border-radius:8px;-webkit-border-radius:8px;-o-border-radius:8px;-moz-border-radius:8px;-ms-border-radius:8px;background:#32a8f5;display:none"></div>');
                }
            });

            //修正 "是否解决问题" 的样式
            var problemElement = dialogElement.find('input[type=radio][name=problem]');
            if (problemElement.length > 0) {
                var arrForms = problemElement.parent(2).find('li');
                arrForms.css({
                    'margin': '0px auto',
                    'text-align': 'center',
                    'width': '33%'
                }).find('input').css({
                    'display': 'none'
                });
                arrForms.find('label').css({
                    'padding': '5px 10px',
                    'border-radius': '10px',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    '-o-border-radius': '10px',
                    '-ms-border-radius': '10px',
                    'border': '1px solid #cecece'
                });
            }

            //selected default
            if (dialogElement.find("input[type=radio][checked]").length) {
                dialogElement.find("input[type=radio][checked]").each(function(i, element) {
                    self._selectedRadio(dialogElement, element);
                });
            }

            //bind form event
            $.FORM.bindFormEvent(formOptions, dialogElement);

            //set evaluation form focus
            dialogElement.find('input[type!=hidden],textarea').get(0).focus();

            dialogElement.find('.view-alert-submit').click(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                //2016.02.14 预防重复点击评价
                //2016.04.20 失败没有回调，导致1次评价，提示输入错误后，无法再次评价
                if (self.evalRepeatClick && self.evalDialog) {
                    self.evalRepeatClick = false;
                    self.mode.submitEvaluationForm(function() {
                        if ($.isFunction(callback)) callback();

                        self.evalDialog.close();
                        self.evalDialog = null;
                        self.evalRepeatClick = true;
                    }, function() {
                        self.evalRepeatClick = true;
                    });
                }
            });

            this.evalDialog.resize();

            //关闭附加功能接钮区
            this._showActionList(null, true);

            return dialogElement;
        },

        createEvaluationVersion2: function(evaluateTree, callback) {
            var self = this,
                dialogElement;
            if ($('.nt-evaluation-wrapper').length == 0) {
                var evaluteHtml = new $.EvaluateView(evaluateTree).evaluateHtml;

                var wrapperClassName = 'nt-evaluation-wrapper';
                var backgroundClassName = 'nt-evaluation-background';
                var background = '<div class="' + backgroundClassName + '" style="' + $.defaultMobileStyle[backgroundClassName] + '"></div>"';
                var wrapper = '<div class="' + wrapperClassName + '" style="' + $.defaultMobileStyle[wrapperClassName] + '">' + evaluteHtml + "</div>";

                $(document.body).append(background);
                $(document.body).append(wrapper);

                if ($.browser.iOS) {
                    $('.' + wrapperClassName).css('margin-top', '-13rem');
                }

                $.EvaluateEvent.bindEvaluateEvent();
            }

            $('[nodeid=submit]').tap(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                //2016.02.14 预防重复点击评价
                //2016.04.20 失败没有回调，导致1次评价，提示输入错误后，无法再次评价
                if (self.evalRepeatClick && $('.nt-evaluation-wrapper').length > 0) {
                    self.evalRepeatClick = false;
                    self.mode.submitEvaluationForm(function() {
                        if ($.isFunction(callback)) callback();

                        $('.nt-evaluation-wrapper').remove();
                        $('.nt-evaluation-background').remove();
                        self.evalDialog = null;
                        self.evalRepeatClick = true;
                    }, function() {
                        self.evalRepeatClick = true;
                    });
                }
            });

            $('[nodeid=cancel]').tap(function(event) {
                $('.nt-evaluation-wrapper').remove();
                $('.nt-evaluation-background').remove();
            });
        },

        /**
         * 2015.11.01
         * @method createGiveupQueue 放弃排队
         * //language
         */
        createGiveupQueue: function(title, startColor, endColor, callback) {
            var self = this,
                dialogElement,
                html = [
                    '<table border="0" cellpadding="0" cellspacing="0" style="', $.STYLE_NBODY, 'margin:0px 0 10px 0;width:100%;">',
                    '<tr style="', $.STYLE_NBODY, '">',
                    '<td style="', $.STYLE_BODY, 'text-align:center;height:80px;">',
                    '<span style="', $.STYLE_BODY, 'font-weight:bold;font-size:18px;color:#000;">', $.lang.system_giveup_wait, '</span>',
                    '</td></tr>',

                    '<tr style="', $.STYLE_NBODY, '">',
                    '<td style="', $.STYLE_NBODY, '">',
                    '<span style="', $.STYLE_NBODY, 'display:inline-block;width:49%;text-align:center;border-top:1px solid #cecece;border-right:1px solid #cecece;padding:2px 0;">',
                    '<input type="button" class="ntkf-giveup-cancel" value="' + $.lang.evaluation_button_cancel + '" style="', $.STYLE_BODY, 'text-align:center;padding:5px 0;width:100%;color:#32a8f5;font:normal 14px/28px Arial,SimSun;background:#fbfbfb;-webkit-appearance: none;" />',
                    '</span>',
                    '<span style="', $.STYLE_NBODY, 'display:inline-block;width:50%;text-align:center;border-top:1px solid #cecece;padding:2px 0;">',
                    '<input type="button" class="view-giveup-submit" value="' + $.lang.system_giveup_submit + '" style="', $.STYLE_BODY, 'text-align:center;padding:5px 0;width:100%;color:#32a8f5;font:normal 14px/28px Arial,SimSun;background:#fbfbfb;-webkit-appearance: none;" />',
                    '</span>',
                    '</td></tr>',
                    '</table>'
                ].join('');

            this._hideScreenImage();

            if (!this.giveupDialog) {
                this.giveupDialog = new $.DialogChat(html, {
                    margin: 50,
                    border: 0,
                    parent: this.contains,
                    style: {
                        'background-color': '#fbfbfb',
                        'border-radius': '10px',
                        'minHeight': '100px',
                        'height': 'auto'
                    }
                });
            }

            dialogElement = this.giveupDialog.container;

            dialogElement.find('.view-giveup-submit').tap(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                self.mode.manageMode.view._callEndSession(true);
            });

            dialogElement.find('.ntkf-giveup-cancel').tap(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                self.giveupDialog.close();
                self.giveupDialog = null;
            });

            return dialogElement;
        },

        /**
         * @method _selectedRadio 选择单选按钮组
         * @param {HTMLDOM} dialogElement
         * @param {HTMLDOM} element
         * @return {void}
         */
        _selectedRadio: function(dialogElement, element) {
            var inputElement = dialogElement.find('input[type=radio][name=' + (element.name || '') + ']');
            inputElement.parent(2).find('li').each(function(i, element) {
                if ($(element).find('input').length) {
                    $(element).find('input[type=radio]').attr('checked', '');
                    $(element).find('label').css('color', '#666666');
                    //2015.09.19 还原到初态，是否解决问题将背景变白，满意度隐藏内心圆
                    if ($(element).find('input').attr('id').indexOf('problem_') != -1) {
                        $(element).find('label').css('background-color', '#ffffff');
                    } else {
                        $(element).find('.chat-radio-checked').css('display', 'none');
                    }
                }
            });
            $(element).attr('checked', 'checked');
            //选中时，是否解决问题字体变白。背景变蓝，满意度内心圆显示，字体变蓝
            if (element.id.indexOf('problem_') != -1) {
                $(element).parent().find('label').css('color', '#FFFFFF');
                $(element).parent().find('label').css('background-color', '#32a8f5');
            } else {
                $(element).parent().find('.chat-radio-checked').css('display', 'block');
                $(element).parent().find('label').css('color', '#32a8f5');
            }
        },
        /**
         * @method createFileButton 创建文件、图片上传按钮
         * @param  {json} server
         */
        createFileButton: function(server) {

            this.objImage = this._createUpload(server, 'uploadimage', this.bottomElement.find('.chat-view-image .chat-view-button-image'), 1024 * 1024 * 10, 'image/*');
        },
        /**
         * 创建文件图片上传Flash
         * @param  {json}        server
         * @param  {json}        action
         * @param  {HTMLElement} parent
         * @param  {Number}      maxSize
         * @param  {String}      accept
         * @return {void}
         */
        _createUpload: function(server, action, parent, maxSize, accept) {
            var self = this;
            var options = {
                action: action,
                roomid: 'T2D',
                siteid: this.mode.siteid,
                settingid: this.mode.settingid,
                charset: $.charset
            };

            return !server.filetranserver ? null : new $.Transfer({
                server: server.filetranserver + '/imageupload.php',
                name: 'userfile',
                maxSize: maxSize,
                accept: accept || '*',
                params: options,
                onError: function(result) {
                    //2015.11.01 关闭附加功能接钮区
                    self._showActionList(null, true, true);
                    //上传文件失败:类型不支持、超出最尺寸
                    //$.fIM_receiveUploadFailure('', options.action, result, options.settingid);

                    var chat = $.chatManage.get(options.settingid);
                    if (chat) chat.uploadFailure(options.action, result);
                },
                onChange: function() {
                    //2015.11.01 关闭附加功能接钮区
                    self._showActionList(null, true, true);
                },
                callback: function(result) {
                    $.Log(options.settingid + '::jsonp: ' + $.JSON.toJSONString(result));

                    var chat = $.chatManage.get(options.settingid);

                    //2015.11.01 添加压缩和开始上传的回调处理
                    if (result.status == 'startCompress') {
                        if (chat) chat.startCompress(options.action, result.oldfile);
                    } else if (result.status == 'startUpload') {
                        //如果已经压缩了，说明消息区域已创建，直接调用_showUploading方法变更消息区域样式
                        if (result.compress) {
                            self._showUploading(chat.uploadmsgid);
                        } else {
                            if (chat) chat.startUpload(options.action, result.oldfile);
                        }

                    } else if (result == 'error') {
                        self._outTimeResend(chat.uploadmsgid);
                    } else if (result.result == -2 || result.type == 9) {
                        //$.fIM_receiveUploadFailure('', options.action, {name: '', error: result.error}, options.settingid);
                        if (chat) chat.uploadFailure(options.action, {
                            name: result.name || '',
                            etype: result.etype || '',
                            error: result.error
                        });
                    } else {
                        //$.fIM_startSendFile('', options.action, result.oldfile, options.settingid);
                        //2015.11.01 提前处理startupload
                        //chat && chat.startUpload(options.action, result.oldfile);

                        setTimeout(function() {
                            //$.fIM_receiveUploadSuccess('', options.action, result, options.settingid);
                            if (chat) chat.uploadSuccess(options.action, result);
                        });
                    }
                }
            }, parent);
        },
        /**
         * 2015.11.01 调整样式，处理左右滑动，查阅上下张图片
         * @method _fullScreenImage 全屏查看图片
         * @param  {Image}  image 图片DOM节点
         * @return {void}
         * 09.28   ???
         * language debug可优化
         */
        _fullScreenImage: function(image, msgid) {
            var self = this,
                hashMsgId, timeSub, hashTime, time,
                container = this._createfullScreen(image),
                src = $(image).attr('sourceurl') || image.src;

            this.isZoom = false;
            Gesture.fullScreen = true;

            $.Log(this.settingid + ':chatView._fullScreenImage(), src:' + src, 1);

            $('.view-full-background').css('opacity', 0.6);

            if (this.swipeend && this.doubletap && this.tap) {
                container.removeEvent('swipeend', this.swipeend);
                container.removeEvent('doubletap', this.doubletap);
                container.removeEvent('tap', this.tap);
            }
            this.swipeend = function(event) {
                var record = Gesture.record;
                if (self.picShowToast) {
                    self.picShowToast.remove();
                    self.picShowToast = null;
                }

                if (self.isZoom) {
                    return;
                }
                if (record.direction == 'left' && record.distance > Gesture.config.swipeMinDistance) {

                    var nextMsgId = 0;
                    timeSub = 10000000;
                    for (hashMsgId in self.imageHash) {
                        hashTime = parseInt(hashMsgId.substr(0, msgid.length - 1));
                        time = parseInt(msgid.substr(0, msgid.length - 1));
                        if (hashTime - time > 0 && hashTime - time < timeSub) {
                            nextMsgId = hashMsgId;
                            timeSub = (hashTime - time);
                        }
                    }
                    if (nextMsgId === 0) {
                        self.picShowToast = new $.Toast('<div style="position: relative;width: 200px; height:30px; line-height: 30px;z-index:100; color: #FFF; top: 30px; left: 25px; text-align:center;font-weight:bold">' + $.lang.system_no_next_picture + '</div>', {
                            width: 250,
                            height: 90
                        });
                        setTimeout(function() {
                            if (self.picShowToast) self.picShowToast.remove();
                        }, 2000);
                    } else {
                        self._fullScreenImage($('.' + nextMsgId).find('.view-history-body').find('img'), nextMsgId);
                    }
                } else if (record.direction == 'right' && record.distance > Gesture.config.swipeMinDistance) {
                    var lastMsgId = 0;
                    timeSub = -10000000;
                    for (hashMsgId in self.imageHash) {
                        hashTime = parseInt(hashMsgId.substr(0, msgid.length - 1));
                        time = parseInt(msgid.substr(0, msgid.length - 1));
                        if (hashTime - time < 0 && hashTime - time > timeSub) {
                            lastMsgId = hashMsgId;
                            timeSub = (hashTime - time);
                        }
                    }
                    if (lastMsgId === 0) {
                        self.picShowToast = new $.Toast('<div style="position: relative;width: 200px; height:30px; line-height: 30px;z-index:100; color: #FFF; top: 30px; left: 25px; text-align:center;font-weight:bold">' + $.lang.system_no_prev_picture + '</div>', {
                            width: 250,
                            height: 90
                        });
                        setTimeout(function() {
                            if (self.picShowToast) self.picShowToast.remove();
                        }, 2000);
                    } else {
                        self._fullScreenImage($('.' + lastMsgId).find('.view-history-body').find('img'), lastMsgId);
                    }
                }
            };

            this.doubletap = function(event) {
                if (self.isZoom) {
                    self.isZoom = false;
                    $.require(src + '#image', function(element) {
                        var maxw = $(window).width(),
                            maxh = $(window).height(),
                            attr = $.zoom(element, maxw - 10, maxh);
                        Gesture.fullScreen = false;
                        container.find('td').html('<img src="' + src + '" width="' + Math.floor(attr.width) + '" height="' + Math.floor(attr.height) + '" style="' + $.STYLE_BODY + 'width:' + Math.floor(attr.width) + 'px;height:' + Math.floor(attr.height) + 'px;margin:0 auto;" />');
                    });
                    return;
                }
                self.isZoom = true;
                $.require(src + '#image', function(element) {
                    var startX,
                        startY,
                        attr = element;
                    container.find('td').html('<img id="zoomImage" src="' + src + '" width="' + Math.floor(attr.width) + '" height="' + Math.floor(attr.height) + '" style="' + $.STYLE_BODY + 'width:' + Math.floor(attr.width) + 'px;height:' + Math.floor(attr.height) + 'px;margin:0 auto;-ms-transform: translate3d(0px, 0px, 0px);-o-transform: translate3d(0px, 0px, 0px);-moz-transform: translate3d(0px, 0px, 0px);-webkit-transform: translate3d(0px, 0px, 0px);transform: translate3d(0px, 0px, 0px)" />');

                    xBorder = -(attr.width - $(window).width() < 0 ? 0 : (attr.width - $(window).width()) / 2);
                    yBorder = -(attr.height - $(window).height() < 0 ? 0 : (attr.height - $(window).height()) / 2);

                    var imageEl = $('#zoomImage')[0];

                    $('#zoomImage').bind('touchstart', function(e) {
                        $.Event.fixEvent(e).preventDefault();

                        //用来记录上次的transform移动定位
                        var xyPxArr = [0, 0];
                        var xyPxReg = /\-?[0-9]+\.?[0-9]*/g;
                        //获取transform x轴，y轴移动距离
                        if (imageEl.style.transform) {
                            xyPxArr = imageEl.style.transform.match(xyPxReg);
                        } else if (imageEl.style.webkitTransform) {
                            xyPxArr = imageEl.style.webkitTransform.match(xyPxReg);
                        } else if (imageEl.style.msTransform) {
                            xyPxArr = imageEl.style.msTransform.match(xyPxReg);
                        } else if (imageEl.style.mozTransform) {
                            xyPxArr = imageEl.style.mozTransform.match(xyPxReg);
                        } else if (imageEl.style.oTransform) {
                            xyPxArr = imageEl.style.oTransform.match(xyPxReg);
                        }
                        //记录触点的起始位置
                        startX = e.targetTouches[0].pageX - parseFloat(xyPxArr[0]);
                        startY = e.targetTouches[0].pageY - parseFloat(xyPxArr[1]);

                        return false;
                    }).bind('touchmove', function(e) {

                        //记录触点的变更位置
                        var y = e.changedTouches[0].pageY - startY;
                        var x = e.changedTouches[0].pageX - startX;

                        //移动图片
                        self.move(x, y, xBorder, yBorder);

                        return false;
                    });

                    self.move(xBorder, yBorder, xBorder, yBorder);

                    container.find('td').css('background', 'none');
                });

            };

            this.tap = function(event) {
                if (!self.isZoom) {
                    self._hideScreenImage();
                }
            };

            container.gesture('swipeend', this.swipeend);
            container.gesture('tap', this.tap);
            container.gesture('doubletap', this.doubletap);

            container.css('opacity', 1).find('.view-full-close').tap(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                $(this).css('background-color', '#bf3127');
                self._hideScreenImage();
            });

            container.find('.view-full-download').display();
            //?任意键隐藏全屏
            if ($.browser.oupeng) {
                $(document).tap(function(event) {
                    if ($.Event.fixEvent(event).keyCode != 27) {
                        return;
                    }
                });
            } else {
                $(document).bind('keypress', function(event) {
                    if ($.Event.fixEvent(event).keyCode != 27) {
                        return;
                    }
                    self._hideScreenImage();
                });
            }
            $(window).bind('resize', function(event) {
                $('.view-full-background,.view-full-iframe,.view-full-container').css({
                    width: $(window).width() + 'px',
                    height: $(window).height() + 'px'
                });
            });

            if (container.find('img').attr('src') == src) {
                return;
            }

            //loading效果生命周期
            $('.big-image-loading').display(1);
            var loadingGifTimer = new $.GifTimer({
                allTime: 10000, //loading总时长 10s
                doTime: 125, //每次更换图片的时间125ms
                x: -14, //初始位于切图中的时间
                inTimeFunc: function() {
                    this.options.x -= 32;
                    $('.big-image-loading').editBackgroundPosition({
                        x: this.options.x
                    });
                    if (this.options.x == -238) {
                        this.options.x = 18;
                    }
                },
                outTimeFunc: function() {}
            });

            $.require(src + '#image', function(element) {
                var maxw = $(window).width(),
                    maxh = $(window).height(),
                    attr = $.zoom(element, maxw - 10, maxh);
                $('.big-image-loading').display(0);
                loadingGifTimer.remove();
                loadingGifTimer = null;
                container.find('td').append('<img src="' + src + '" width="' + Math.floor(attr.width) + '" height="' + Math.floor(attr.height) + '" style="' + $.STYLE_BODY + 'width:' + Math.floor(attr.width) + 'px;height:' + Math.floor(attr.height) + 'px;margin:0 auto;" />');
            });
        },
        /**
         * @method move 全屏查看图片时移动图片
         * @param {number} x
         * @param {number} y
         * @param {number} xBorder
         * @param {number} yBorder
         */
        move: function(x, y, xBorder, yBorder) {
            //设置移动边界
            if (x > 0) {
                x = 0;
            }
            if (x < 2 * xBorder) {
                x = 2 * xBorder;
            }
            if (y > 0) {
                y = 0;
            }
            if (y < 2 * yBorder) {
                y = 2 * yBorder;
            }

            var xPx = x + "px",
                yPx = y + "px";

            var style = $('#zoomImage')[0].style;

            if (style.transform) {
                style.transform = 'translate(' + xPx + ', ' + yPx + ')';
            } else if (style.webkitTransform) {
                style.webkitTransform = 'translate(' + xPx + ', ' + yPx + ')';
            } else if (style.msTransform) {
                style.msTransform = 'translate(' + xPx + ', ' + yPx + ')';
            } else if (style.mozTransform) {
                style.mozTransform = 'translate(' + xPx + ', ' + yPx + ')';
            } else if (style.oTransform) {
                style.oTransform = 'translate(' + xPx + ', ' + yPx + ')';
            }
        },
        /**
         * 2015.10.09 为链接绑定自定义打开事件
         */
        _addHrefOpenListener: function(event, aElement) {
            var href = $(aElement).attr('_href') || $(aElement).attr('href');

            //2017.08.16 链接中有tel:不创建遮罩层直接打开拨号器
            if(!href || href.indexOf("tel:") > -1) {
                return;
            }

            //2015.09.19 阻止链接的默认行为
            $.Event.fixEvent(event).preventDefault();
            $.Event.fixEvent(event).stopPropagation();

            if (!href) {
                return;
            }

            //2015.09.19 创造一个遮罩层，里面有一个iframe用于展现链接内容
            this._createShowWebIframe(href);
            return false;
        },
        /**
         * 2015.09.19 创建用于展现网页的iframe
         */
        _createShowWebIframe: function(url) {
            var self = this,
                width = $(window).width(),
                height = $(window).height() - 42;
            //创建iframe
            if (!$('.view-website-iframe').length) {
                $({
                    tag: 'iframe',
                    className: 'view-website-iframe',
                    style: 'display:none; left:0px; top:42px; right:0px; bottom: 0px'
                }).appendTo(this.contains).fixed();
            }

            if (!self.header) {
                self.header = $('.chat-view-window-header');
            }
            //设置样式
            var websiteIframe = $('.view-website-iframe');
            websiteIframe.attr('src', url);
            websiteIframe.css({
                'width': '100%',
                'height': '100%',
                'left': 0,
                'right': 0,
                'bottom': 0,
                'top': '0',
                'padding-top': '55px',
                'background-color': 'white',
                'border': 'none',
                'z-index': '888',
                'display': 'block'
            });
            //记录客服名称
            this.recordKfName = self.header.find('.chat-view-window-header-title').html();
            if (self.mode._Enableevaluation) {
                self.header.find('.chat-view-window-header-ev-close').display(0);
            }

            //变更标题框
            self.header.css({
                'background-color': '#0589f3',
                'height': '55px'
            });
            self.header.find('.chat-view-window-header-message-title').html($.lang.chat_show_website).display(1);
            self.header.find('.chat-view-window-header-back').css('display', 'none');
            self.header.find('.chat-view-window-header-close').html('X').css({
                'background': '',
                'border': 'none',
                'color': 'white'
            }).click(function() {
                //2015.10.16 点击关闭时，将iframe移除
                self.contains.find('.view-website-iframe').remove();
                self.header.find('.chat-view-window-header-message-title').html('').display(0);
                self.header.find('.chat-view-window-header-back').display(1);
                self.header.find('.chat-view-window-header-close').display(0);
                //2017.04.12 将背景颜色改为蓝色
                self.header.css({
                    'background': '#0589f3',
                    'height': '0px'
                });
                if (self.mode._Enableevaluation && !isEdu) {
                    self.header.find('.chat-view-window-header-ev-close').display(1);
                }
            }).display(1);
        },
        /**
         * 2015.11.01 留言表单样式变更
         * 创建留言表单
         * @param  表单配置 formOptions         [description]
         * @param  {[type]} disable_message [description]
         * @param  {[type]} announcement    [description]
         * @return {[type]}                 [description]
         * language
         */
        createMessageForm: function(formOptions, disable_message, announcement, data) {
            var self = this,
                i, html;

            if (this.messageElement.find('.chat-view-message-table table').length) {
                return;
            }

            //set message div\style
            for (i = 0; i < formOptions.length; i++) {
                formOptions[i] = $.extend(formOptions[i], {
                    defaultText: formOptions[i].required ? formOptions[i].defaultText + $.lang.message_no_null_char : formOptions[i].defaultText,
                    titlewidth: /zh_cn|en_us/ig.test($.lang.language) ? '80px' : '140px',
                    input: {
                        height: (formOptions[i].type == 'textarea' ? '140px' : 'auto')
                    },
                    messageid: 'chat-view-message-' + formOptions[i].name
                });

            }

            this.messageElement.find('.chat-view-message-table').html([
                '<table cellspacing="0" cellpadding="0" border="0" style="' + $.STYLE_NBODY + 'width:100%;">',
                '<tbody style="' + $.STYLE_NBODY + '">',
                '<tr style="' + $.STYLE_NBODY + '"><td colspan="', ($.browser.mobile ? 1 : 2), '" style="' + $.STYLE_BODY + 'padding:0 0 15px 0;color:#333;vertical-align:top;">', announcement, '</td></tr>', (disable_message ?
                    '' : [$.FORM.createInput(formOptions),
                        '<tr style="' + $.STYLE_NBODY + '">',
                        //移动端不显示表单文本
                        ($.browser.mobile ? '' : '<td style="' + $.STYLE_NBODY + '"></td>'),
                        '<td style="' + $.STYLE_BODY + 'padding:20px 0px 0px;color:#090;">',
                        '<input type="button" class="chat-view-button chat-view-submit-submit" value="' + $.lang.message_button_submit + '" style="' + $.STYLE_BODY + 'font-size:16px;padding:0 20px;background:#32A8F5;line-height:50px;color:#fff;height:50px;width:90%;border-radius:5px;text-align:center;-webkit-appearance: none">',
                        '<span class="submit_message_complete" style="' + $.STYLE_BODY + 'color:#090;display:none;">', $.lang.message_success, '</span>',
                        '</td></tr>'
                    ].join('')),
                '</tbody></table>'
            ].join(''));

            if (!this.header) {
                this.header = $('.chat-view-window-header');
            }

            if (!this.titleEl) {
                this.titleEl = $('.chat-view-window-header-message-title');
            }

            this.messageElement.find('input[name=myuid]').val(data.myuid);
            this.messageElement.find('input[name=destuid]').val(data.destid);
            this.messageElement.find('input[name=ntkf_t2d_sid]').val(data.sessionid);
            this.messageElement.find('input[name=source]').val(data.source);

            //头部颜色 2017.04.12
            this.header.css({
                'height': '55px',
                'background-color': isEdu ? '#0589f3' : '#EBEBEC'
            });

            //字体颜色
            this.titleEl.display(1).html($.lang.system_leave_message).css({
                color: isEdu ? 'white' : '#333333'
            });

            //input框样式
            this.messageElement.find('input[type=text],textarea').css({
                'font-size': '12px',
                'border': '1px solid #E9E9E9',
                'padding': '8px 2%',
                'color': '#7C7C7C',
                'background': '#FFFFFF',
                'width': '96%',
                'margin-top': '8px'
            });

            //输入框可输入字符数
            for (i = 0; i < formOptions.length; i++) {
                if (formOptions[i].type == 'textarea') {
                    $({
                        className: 'textarea-' + formOptions[i].name,
                        maxsize: formOptions[i].max,
                        style: $.STYLE_BODY + 'font-size:16px;font-weight:bold;color:#ccc;float:right;position:static;right:15px;top:310px;'
                    }).appendTo(this.messageElement.find('table textarea[name=' + formOptions[i].name + ']').parent()).html('0/' + formOptions[i].max);
                }
            }
            this.messageElement.find('table textarea').css('padding-right', '10px').bind('keyup', function(event) {
                var selector = 'table .textarea-' + $(this).attr('name');
                var inputText = $.enLength($(this).val()) + '/' + self.messageElement.find(selector).attr('maxsize');

                self.messageElement.find(selector).html(inputText);
            });

            this.messageElement.find('.chat-view-submit-submit').show(function() {
                $(this).css('display', $.browser.oldmsie ? 'inline-block' : 'block');
            });
            this.messageElement.find('.submit_message_complete').display();

            //bind event
            $.FORM.bindFormEvent(formOptions, this.messageElement);

            this.messageElement.find('.chat-view-submit-submit').click(function(event) {
                self.mode.submitMessageForm();
            });
            //连接服务器失败时，消息放入留言框(默认留言表单只有一个多行文本框)
            this.messageElement.find('textarea').val(data.content);
            //debug
            this.messageElement.find(".textarea-msg_content").css('font-size', '12px');

            return this.messageElement.find('.chat-view-message-table');
        },
        /**
         * 提交留言表单
         * @param  {json}    formOptions     表单配置
         * @param {string}   actionUrl       提交地址
         * @return {void}
         */
        submitMessageForm: function(formOptions, actionUrl) {
            var self = this;

            $.FORM.verificationForm(formOptions, function() {
                self.messageElement.find('.chat-view-message-form').attr('action', actionUrl);
                self.messageElement.find('.chat-view-message-form').get(0).submit();
                $.Log('chatView.submitMessageForm complete', 1);

                self.messageElement.find('input[type=text],textarea,select').attr("disabled", true);
                self.messageElement.find('.chat-view-submit-submit').display();
                var toast = new $.Toast('<div style="position: relative;width: 200px; height:30px; line-height: 30px;z-index:100; color: #FFF; top: 30px; left: 25px; text-align:center;font-weight:bold">' + $.lang.message_success + '</div>', {
                    width: 250,
                    height: 90
                });
                setTimeout(function() {
                    toast.remove();
                    element.get(0).focus();
                }, 2000);
            }, this.messageElement);
        },
        /**
         * 关闭全屏图片查看
         * @param ImageDOM image
         */
        _hideScreenImage: function(image) {
            $('.view-full-container').animate({
                opacity: {
                    from: 1,
                    to: 0
                }
            }, 500);
            $('.view-full-background').animate({
                opacity: {
                    from: 0.6,
                    to: 0
                }
            }, 500, function() {
                $('.view-full-iframe,.view-full-background,.view-full-container').remove();
            });
            Gesture.fullScreen = false;
        },

        /**
         * 2015.11.01 调整全屏查看图片关闭按钮样式
         */
        _createfullScreen: function() {
            var self = this,
                width = $(window).width(),
                height = $(window).height();

            if (!$('.view-full-iframe').length) {
                $({
                    tag: 'iframe',
                    className: 'view-full-iframe',
                    style: $.STYLE_NBODY + 'display:none;width:' + width + 'px;height:' + height + 'px;'
                }).appendTo(this.contains).fixed();
            }
            if ($('.view-full-background').length) {
                $('.view-full-background').display(1);
            } else {
                $({
                    className: 'view-full-background',
                    style: $.STYLE_BODY + 'background:#000;opacity:0.6;filter:alpha(opacity=60);width:' + width + 'px;height:' + height + 'px;position:absolute;top:0;left:0;z-index:1500;'
                }).appendTo(this.contains).fixed();
            }
            if ($('.view-full-container').length) {
                //2014.09.25 全屏查看图片时，清除上一次图片
                $('.view-full-container img').remove();
                $('.view-full-container').display(1);
            } else {
                $({
                    className: 'view-full-container',
                    style: $.STYLE_BODY + 'width:' + width + 'px;height:' + height + 'px;text-align:center;position:absolute;top:0px;left:0;z-index:3000;overflow:hidden;transform: translate3d(0px, 0px, 0px)'
                }).appendTo(this.contains).html([
                    '<table style="' + $.STYLE_BODY + 'margin:auto;width:100%;height:100%;">',
                    '<tbody style="' + $.STYLE_BODY + '">',
                    '<tr style="' + $.STYLE_BODY + '">',
                    '<td valign="middle" align="center" style="' + $.STYLE_BODY + 'width:100%;vertical-align:middle;text-align:center;">',
                    '<div class="big-image-loading" style="width:32px;height:32px;margin-left:', ($(window).width() - 32) / 2, 'px;background:url(', $.imageicon, ') no-repeat -14px -121px;"></div>',
                    '</td></tr></tbody></table>',
                    '<span class="view-full-close" style="' + $.STYLE_BODY + 'position:absolute;width:32px;height:32px;border-radius:50%;color:#ccc;margin:10px 15px 0 0;top:0;right:0;cursor:pointer;background:#df3b31 url(', $.imageicon, ') no-repeat scroll -201px -56px;z-index:3000;display:none;"></span>',
                    '<span class="view-full-download"  style="' + $.STYLE_BODY + 'position:absolute;width:28px;height:28px;color:#ccc;margin:20px 20px 0 0;top:0;right:50px;cursor:pointer;background:url(', $.imageicon, ') no-repeat scroll -144px -244px;z-index:3000;"></span>'
                ].join('')).fixed();
            }

            return $('.view-full-container');
        },
        /**
         * 聊窗消息模板
         * @param  {[type]} type
         * @param  {[type]} data
         * @return {[type]}
         * 调整样式，支持多语言
         * 2015.09.19 添加对数据的showTime属性的判断，若为真则不显示时间
         * 2015.11.01 大量的样式调整(时间、头像、客服名、相关状态)
         */
        _getMessageHtml: function(type, data) {
            var l, fix = '';
            //2016.04.06 添加bubble表示为访客的气泡颜色#facdb2  bubble_text 气泡字体的颜色#000000 bubble_border边框的颜色值#a1cce8 timestamp表示时间戳的颜色#ABABAB
            var bubble = newWapTheme.bubble;
            var bubble_text = newWapTheme.bubble_text;
            var bubble_border = bubble; //令bubble 与bubble_border颜色一致
            var timestamp = newWapTheme.timestamp;

            // 2017.08.16 对手机号做处理
            try {
                if(data.type == 1) {
                    data.msg = this.getTel(data.msg);
                }
            } catch (e) {
            }
            // 2017.08.16 对和固话号码做处理
            try {
                if(data.type == 1) {
                    data.msg = this.getPhone(data.msg);
                }
            } catch (e) {
            }

            if (data.type == 7) data.type = 1;

            return type === 'right' ? [ //发送的消息
                    '<table style="', $.STYLE_NBODY, 'float:right;_float:none;width:100%;" class="view-history-right" cellpadding="0" cellspacing="0" border="0" class="table">',
                    '<tbody style="', $.STYLE_NBODY, 'text-align:center;">',
                    '<tr><td style="', $.STYLE_BODY, 'text-align:center;">', (data.showTime ? '' : ['<span class="view-history-time" style="', $.STYLE_BODY, ';color:' + timestamp + ';font-size:12px;line-height:26px;">',
                        this.formatMessageTime(data.timerkeyid),
                        '</span>'
                    ].join('')),
                    '</td></tr>',
                    '</tbody>',
                    '</table>',
                    '<table style="', $.STYLE_NBODY, 'float:right;_float:none;" class="view-history-right" cellpadding="0" cellspacing="0" border="0" class="table">',
                    '<tbody style="', $.STYLE_NBODY, 'text-align:right;">',
                    '<tr>',
                    '<td class="view-history-send-tbody" style="', $.STYLE_BODY, '">',
                    (
                        //发送文件时
                        4 == data.type ? ['<div class="view-history-body" type="', data.type, '" style="', $.STYLE_NBODY, 'word-break:break-all;word-wrap:break-word;padding:8px;border-radius:5px;background:' + bubble + ';border:1px solid #ffffff;border-color:' + bubble_border + '">',
                            '<div class="view-download-icon" style="', $.STYLE_BODY, 'margin:5px 0;float:left;width:20px;height:20px;"></div>',
                            '<span style="', $.STYLE_BODY, 'float:left;margin:5px;line-height:160%;">',
                            data.oldfile + ' <a href="javascript:void(0);"' + (data.url ? ' url="' + data.url + '" style="' + (data.url ? '' : 'visibility:hidden;') + '"' : '') + '>' + $.lang.news_download + '</a>',
                            '</span>',
                            '</div>'
                        ].join('') :
                        6 == data.type ? ['<div class="view-history-body" type="', data.type, '" style="', $.STYLE_NBODY, '">',
                            '</div>'
                        ].join('') :
                        //消息或图片
                        //2016.04.06
                        ['<div class="view-history-body" type="', data.type, '" style="', $.STYLE_BODY, 'line-height:160%;', (data.type == 2 ? 'color:' + bubble_text + ';text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;width:65px;height:65px;*font-size:0px;*line-heihgt:0px;*font-family:Arial;padding:2px;background:none;border-radius:5px;' : 'display:block;'), 'word-break:break-all;word-wrap:break-word;padding:6px;color:' + bubble_text + ';background:' + bubble + ';border:1px solid #a1cce8;border-color:' + bubble_border + ';border-radius:5px;margin-left:50px;">', (/^(1|9)$/i.test(data.type) ? data.msg : ''),
                            '</div>',
                            //2016.05.16 修改top值和高度值
                            '<div class="view-history-pic-status" style="position: relative; top: -15px; margin:0px; left:-2px; font-size:12px;padding:0px; text-align:center; display:none"></div>'
                        ].join('')
                    ),
                    //==相关状态==
                    '<span class="view-chat-hidden-area" style="', $.STYLE_NBODY, 'float:left;width:1px;height:1px;overflow:visible;position:relative;">',
                    '<div class="view-history-status" style="', $.STYLE_BODY, 'display:none;color:#010002;line-height:22px;width:150px;*width:130px;_width:130px;position:absolute;left:-50px;top:-25px;">',
                    '<div class="view-history-status-icon" style="', $.STYLE_NBODY, 'float:left;display:block;width:35px;height:35px;position:absolute;top:', (data.type == 2 || data.type == 6) ? '-50' : '-5', 'px;left:', (data.type == 2 || data.type == 6) ? '20' : '40', 'px;background:url(', $.imageicon, ') no-repeat -228px -18px;"></div>',
                    '<img class="view-history-status-loading" src="', $.sourceURI + 'images/m-loading.gif', '" style="', $.STYLE_NBODY, 'float:left;display:block;width:22px;height:22px;position:absolute;top:-35px;left:30px"></img>',
                    '<div class="view-history-status-link" style="', $.STYLE_BODY, 'float:left;margin-top:10px;"></div>',
                    '</div>',
                    '</span>',
                    '</td>',
                    //==尖角==
                    (data.type == 2 ? ['<td class="view-chat-angle" valign="top" style="display:none;padding-right:5px;z-index:100;">',
                        '<svg height="10px" width="6px" id="svg" style="margin-top:13px">',
                        '<path d="M6,5 L0,0 L0,10 L6,5" style="stroke-width:1;fill:' + bubble + ';stroke:' + bubble + ';" />',
                        '</svg>',
                        '</td>'
                    ].join("") : ['<td valign="top" style="padding-right:5px;z-index:100;">',
                        '<svg height="10px" width="6px" id="svg" style="margin-top:13px">',
                        '<path d="M6,5 L0,0 L0,10 L6,5" style="stroke-width:1;fill:' + bubble + ';stroke:' + bubble + ';" />',
                        '</svg>',
                        '</td>'
                    ].join("")),
                    //访客头像 10.27 在背景图中的位置变更
                    '<td style="', $.STYLE_NBODY, 'vertical-align:top;text-align:center;width:40px;height:auto;min-height:40px;">',
                    '<div style="', $.STYLE_NBODY, 'text-align:center;width:35px;height:35px;border-radius:5px;background:url(', $.imageicon, ') no-repeat -309px -12px;overflow:hidden;"></div>',
                    '</td>',
                    '</tr>',
                    '</tbody>',
                    '</table>',
                    '<br style="', $.STYLE_NBODY, 'clear:both;" />'
                ].join('') :
                /left|bottom/gi.test(type) ? [ //接收的消息
                    '<table style="', $.STYLE_NBODY, 'width:100%;" class="view-history-left" cellpadding="0" cellspacing="0" border="0" class="table">',
                    '<tbody style="', $.STYLE_NBODY, 'text-align:center;">',
                    '<tr><td style="', $.STYLE_BODY, 'text-align:center;">', (type == 'bottom' || data.showTime ? '' : ['<span class="view-history-time" style="', $.STYLE_BODY, 'color:' + timestamp + ';font-size:12px;line-height:26px;">',
                        this.formatMessageTime(data.timestamp || data.timerkeyid),
                        '</span>'
                    ].join('')),
                    /*//接收到非当前客服的消息时，显示客服名
                    (data.userid && !this.mode.isVisitor(data.userid) && this.mode.dest.id != data.userid ? ['<span class="view-history-destname" style="', $.STYLE_BODY, 'margin-left:10px;color:#b9b9c1;line-height:26px;">',
                            data.name,
                            '<span>'
                        ].join('') :
                        ''),*/
                    '</td></tr>',
                    '</tbody>',
                    '</table>',
                    '<table style="', $.STYLE_NBODY, 'float:none;" class="view-history-left" cellpadding="0" cellspacing="0" border="0" class="table">',
                    '<tbody style="', $.STYLE_NBODY, '">',
                    '<tr>',
                    //头像 2015.10.27 默认头像位置变更
                    '<td rowspan="2" style="', $.STYLE_NBODY, 'vertical-align:top;text-align:center;width:40px;_width:40px;height:auto;min-height:40px;">',
                    '<div class="view-history-icon-div" style="', $.STYLE_NBODY, 'text-align:center;width:35px;height:35px;border-radius:5px;border:1px solid #ffffff;background:url(', $.imageicon, ') no-repeat -307px -55px;overflow:hidden;">', (data.logo ? ['<img data-single="1" onerror="nTalk.loadImageAbnormal(this, event)" class="view-history-receive-icon" userid="', data.userid, '" src="', data.logo, '" style="', $.STYLE_NBODY, 'width:35px; height:35px" />'].join('') : ''),
                    '</div>',
                    '</td>',
                    //客服名称
                    '<td colspan="2"><div style="color:' + timestamp + '; font-size:12px; padding-left:10px; height:20px; line-height:20px; margin-top:-3px">', (data.name || this.mode.dest.name), '</div></td>',
                    '</tr>',
                    '<tr>',
                    //==尖角==
                    ['<td valign="top" class="view-chat-angle" style="padding-left:5px;', data.type == 2 ? 'display:none;' : '', '">',
                        '<svg height="10px" width="6px" id="svg" style="margin-top:11px;">',
                        '<path d="M0,5 L6,0 L6,10 L0,5" style="stroke-width:1;fill:#ffffff;stroke:#ffffff;" />',
                        '</svg> ',
                        '</td>'
                    ].join(""),
                    '<td class="view-history-receive-tbody" style="', $.STYLE_BODY, '">',
                    (
                        //收到文件时
                        4 == data.type ? ['<div class="view-history-body" style="', $.STYLE_BODY, 'word-break:break-all;word-wrap:break-word;border-radius:5px;padding:8px 0;background:white;border:1px solid #ffffff;">',
                            //上面的整个div
                            '<div style="', $.STYLE_NBODY, 'margin:0 8px;height:auto;clear:both;">',
                            '<div style="', $.STYLE_NBODY, 'float:left;width:42px;height:42px;background-color:#1294e2;text-align:center;border-radius: 5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;-o-border-radius: 5px; -ms-border-radius: 5px;">',
                            //文件的后缀名称
                            '<span style="', $.STYLE_BODY, 'color:#ffffff;line-height:42px;font-size:14px;text-align:center;">', (data.oldfile).substring(data.oldfile.lastIndexOf('.') + 1), '</span>',
                            '</div>',
                            '<span style="', $.STYLE_BODY, 'padding:5px 0 5px 8px;line-height:42px;color:#999999;max-width:px;">', data.oldfile, ' </span>',
                            '</div>',
                            //下面的下载
                            ((!$.browser.iOS) ? ['<div style="', $.STYLE_BODY, 'margin-top:8px;border-top:solid 1px #cccccc;height:30px;text-align:center;line-height:40px;"><a style="color:#1294e2;text-decoration:none;" href="javascript:void(0);" url="', data.url, '">', $.lang.news_download, '</a></div>'].join('') : [''].join('')),
                            '</div>'
                        ].join('') :
                        //消息或图片
                        ['<div class="view-history-body" type="', data.type, '" style="', $.STYLE_BODY, '', (data.type == 2 ? 'color:#6C6C6C;text-align:center;display:table-cell;*display:inline-block;vertical-align:middle;width:65px;height:65px;*font-size:0px;*line-heihgt:0px;*font-family:Arial;' : 'display:block;'), 'word-break:break-all;word-wrap:break-word;padding:6px;background:white;border-radius:5px;color:#6C6C6C;border:1px solid ffffff;margin-right:52px">',
                            //==消息
                            (/^(1|9)$/i.test(data.type) ? data.msg : ''),
                            '</div>'
                        ].join('')
                    ),
                    //==相关状态==
                    '<span class="view-chat-hidden-area" style="', $.STYLE_NBODY, 'float:right;width:1px;height:1px;overflow:visible;position:relative;">',
                    '<div class="view-history-status" style="', $.STYLE_BODY, 'display:none;color:#010002;line-height:22px;width:150px;*width:130px;_width:130px;position:absolute;left:10px;top:25px;">',
                    '<div class="view-history-status-icon" style="', $.STYLE_NBODY, 'margin:5px 3px;float:left;display:block;width:10px;height:10px;background:url(', $.imageicon, ') no-repeat -228px -18px"></div>',
                    '<div class="view-history-status-loading" style="', $.STYLE_NBODY, 'margin:5px 3px;float:left;display:block;width:10px;height:10px;background:url(', $.imageicon, ') no-repeat -14px -121px;"></div>',
                    '<div class="view-history-status-link" style="', $.STYLE_BODY, 'float:left;">', (data.type == 2 || data.type == 4 ? ['<a href="javascript:void(0);">', $.lang.news_download, '</a>'].join('') : [''].join('')),
                    '</div>',
                    '</div>',
                    '</span>',
                    //==相关状态==
                    '</td>',
                    '</tr>',
                    '</tbody>',
                    '</table>',
                    '<br style="', $.STYLE_NBODY, 'clear:both;" />'
                ].join('') :
                type === 'first' ? [ //系统消息:接通客服
                    '<div class="view-history-system" style="', $.STYLE_BODY, 'height:20px;line-height:180%;marign:0 auto;text-align:center;word-break:break-all;word-wrap:break-word;">',
                    data.msg,
                    '</div>',
                    '<br style="', $.STYLE_NBODY, 'clear:both;" />'
                ].join('') :
                type === 'goods' ? [ //商品信息
                    '<table style="', $.STYLE_NBODY, 'width:100%;border-radius:10px;border:1px solid #ccc;" class="view-history-goods" cellpadding="0" cellspacing="0" border="0" class="table">',
                    '<tbody style="', $.STYLE_NBODY, 'text-align:center;">',
                    '<tr>',
                    '<td style="', $.STYLE_NBODY, 'width:50%;text-align:center;">',
                    '<div class="view-history-goods-image" style="', $.STYLE_NBODY, 'text-align:center;margin:0 auto;width:150px;height:145px;">',
                    '<div style="', $.STYLE_NBODY, 'background:url(', $.imageicon, ') no-repeat -110px -172px;width:85px;height:67px;margin:42px 39px"></div>',
                    '</div>',
                    '</td>',
                    '<td class="view-history-goods-info" style="', $.STYLE_BODY, 'width:50%;text-align:left;"></td>',
                    '</tr>',
                    '</tbody>',
                    '</table>',
                    '<br style="', $.STYLE_NBODY, 'clear:both;" />'
                ].join('') : [ //系统消息:排队
                    '<div class="view-history-system" style="', $.STYLE_NBODY, 'marign:20px 0;text-align:center;color:#706E6F;">',
                    '<fieldset style="', $.STYLE_NBODY, 'text-align:center;border:0;border-top:0px solid #ccc;">',
                    '<legend style="', $.STYLE_BODY, 'padding:0 10px;text-align:center;word-break:break-all;border-radius:10px;word-wrap:break-word;color:#464647;background-color:#E0E0E4;width:auto;" align="center">', data.msg, '</legend>',
                    '</fieldset>',
                    '</div>',
                    '<br style="', $.STYLE_NBODY, 'clear:both;" />'
                ].join('');
        },
        /**
        * 2017.08.16 wap过滤手机号码点击进入拨号器
        * @param {string} msg
        */
        getTel: function(msg) {
            var arr = [],str,reg = new RegExp(/1[0-9]{10}/gi);
            arr = msg.match(reg);
            for(var i = 0;i < arr.length;i++) {
                str = '<a href="tel:'+arr[i]+'" style="text-decoration:none;out-line: none;" >'+arr[i]+'</a>';
                msg = msg.replace(arr[i].substr(0,arr[i].length),str);
            }
            return msg;
        },
        /**
        * 2017.08.16 wap过滤固话点击进入拨号器
        * @param {string} msg
        */
        getPhone: function(msg) {
            // /0\d{2,3}-?\d{7,8}/
            var arr = [],str,reg = new RegExp(/(^0\d{2}-?\d{8}$)|(^0\d{3}-?\d{7}$)|(^\(0\d{2}\)-?\d{8}$)|(^\(0\d{3}\)-?\d{7}$)/gi);
            arr = msg.match(reg);
            for(var i = 0;i < arr.length;i++) {
                str = '<a href="tel:'+arr[i]+'" style="text-decoration:none;out-line: none;" >'+arr[i]+'</a>';
                msg = msg.replace(arr[i].substr(0,arr[i].length),str);
            }
            return msg;
        },
        /**
         * 2015.11.01 使用svg代替切图
         * @method _getViewHtml  聊窗HTML
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         * language
         */
        _getViewHtml: function(type) {
            //2016.05.06 添加发送按钮的背景颜色
            var bubble = newWapTheme.bubble;
            var bubble_text = newWapTheme.bubble_text;
            return type == 'load' ? [
                    '<div class="chat-view-load-icon" style="', $.STYLE_NBODY, 'margin:0 auto;width:30px;height:33px;background:url(', $.imageicon, ') no-repeat -14px -121px;"></div>',
                    '<div class="chat-view-load-info" style="', $.STYLE_BODY, 'text-align:center;">', $.lang.chat_info_loading, '</div>',
                    '<div class="chat-view-reload" style="', $.STYLE_BODY, 'text-align:center;width:50px;height:50px;top:35%;position:absolute;display:none;background: url(', $.imageicon, ') -323px -108px no-repeat; left:', ($(window).width() - 50) / 2, 'px"></div>',
                    '<div class="chat-view-load-error" style="', $.STYLE_BODY, 'text-align:center;width:100%;min-height:200px;height:100%;top:45%;position:absolute;display:none;color:#A4A4A5;background-color:#F3F3F3">',
                    $.lang.system_config_error,
                    '<!--<span style="', $.STYLE_BODY, 'cursor:pointer;color:#005ffb;text-decoration:none;">', $.lang.chat_info_reload, '</span>--></div>'
                ].join('') :
                type === 'window' ? [
                    //分配客服时状态消息
                    '<div class="chat-view-window-status-info" style="', $.STYLE_BODY, 'overflow:hidden;background:#f9efda;width:100%;line-height:55px;height:55px;position:fixed;top:-44px;display:none;z-index:300">',
                    '<div class="chat-view-system-message" style="', $.STYLE_BODY, 'margin:0 0 0 0px;text-align:center;line-height:55px;font-size:16px;color:#85837A"></div>',
                    '<div class="chat-view-system-close" style="', $.STYLE_NBODY, 'position:absolute;right:15px;top:15px;width:20px;height:20px;line-height:20px;font-size:20px;display:none;color:#85837A">X</div>',
                    '</div>',
                    '<div class="chat-view-window-history" style="', $.STYLE_BODY, 'width:100%;padding:0px 0 ', ($.browser.iPhone ? '132px' : '52px'), ' 0">',
                    //2016更改将背景设置为透明的
                    '<ul style="', $.STYLE_BODY, 'list-style:none;margin:0px 5px;background:transparent">',
                    //'<li style="',$.STYLE_BODY,'list-style:none;margin:0;"></li>',
                    '</ul>',
                    '</div>'
                ].join('') :
                type == 'bottom' ? [
                    //音频区
                    (
                        (this.mode.options.config.robot_version == 2) ?
                        ($.Audio && $.Audio.support() ? '<div class="chat-view-window-audio" style="' + $.STYLE_NBODY + 'position:relative;display:none;">' + '<div class="chat-view-button-text" style="' + $.STYLE_NBODY + 'width:32px;height:32px;position:absolute;left:45px;top:5px;cursor:pointer;">' + [
                                '<svg width="32" height="32">',
                                '<circle cx="16" cy="16" r="15" stroke-width="1" stroke="#808080" fill="#F9F9F9"></circle>',
                                '<rect x="8" y="10" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="13" y="10" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="18" y="10" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="23" y="10" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="8" y="16" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="13" y="16" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="18" y="16" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="23" y="16" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="9" y="22.5" width="15" height="2" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '</svg>'
                            ].join('') +
                            '</div>' + '<div style="' + $.STYLE_NBODY + 'margin:5px 105px 5px 85px;">' + '<input class="chat-audioInput" disabled="disabled" type="button" style="' + $.STYLE_BODY + 'height:37px;width:100%;resize:none;border:1px solid #d4d4d4;outline:none;border-radius:5px;text-align:center;" value="' + $.lang.chat_button_audio + '" />' + '</div>' + '</div>' : '') :
                        ($.Audio && $.Audio.support() ? '<div class="chat-view-window-audio" style="' + $.STYLE_NBODY + 'position:relative;display:none;">' + '<div class="chat-view-button-text" style="' + $.STYLE_NBODY + 'width:32px;height:32px;position:absolute;left:5px;top:5px;cursor:pointer;">' + [
                                '<svg width="32" height="32">',
                                '<circle cx="16" cy="16" r="15" stroke-width="1" stroke="#808080" fill="#F9F9F9"></circle>',
                                '<rect x="8" y="10" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="13" y="10" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="18" y="10" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="23" y="10" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="8" y="16" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="13" y="16" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="18" y="16" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="23" y="16" width="2" height="3" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '<rect x="9" y="22.5" width="15" height="2" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                                '</svg>'
                            ].join('') +
                            '</div>' + '<div style="' + $.STYLE_NBODY + 'margin:5px 105px 5px 45px;">' + '<input class="chat-audioInput" disabled="disabled" type="button" style="' + $.STYLE_BODY + 'height:37px;width:100%;resize:none;border:1px solid #d4d4d4;outline:none;border-radius:5px;text-align:center;" value="' + $.lang.chat_button_audio + '" />' + '</div>' + '</div>' : '')
                    ),
                    //输入区
                    /*2016.09.18 移动端机器人2.0 样式修改*/
                    '<div class="chat-view-window-editor" style="', $.STYLE_NBODY, 'position:relative;display:block;">', (

                        (this.mode.options.config.robot_version == 2) ?
                        ((($.Audio && $.Audio.support()) ?
                            '<div class="chat-view-button-audio" style="' + $.STYLE_NBODY + 'width:32px;height:32px;position:absolute;top:5px;left:45px;cursor:pointer">' + [
                                '<svg width="32px" height="32px">',
                                '<circle cx="16" cy="16" r="15" stroke-width="1" stroke="#808080" fill="#F9F9F9"></circle>',
                                '<circle cx="10.5" cy="16" r="1" stroke-width="1" stroke="#808080" fill="#808080"></circle>',
                                '<path d="M13 10 C 18.7 13, 18.7 19, 13 22" stroke="#808080" fill="transparent" stroke-width="2"></path>',
                                '<path d="M16.5 5.5 C 25.5 11,25.5 21, 16.5 26.5" stroke="#808080" fill="transparent" stroke-width="2"></path>',
                                '</svg>'
                            ].join("") +
                            '</div>' + '<div class="chat-view-textarea" style="' + $.STYLE_NBODY + 'margin:5px 105px 5px 85px;padding:0">' : '<div class="chat-view-textarea" style="' + $.STYLE_NBODY + 'margin:5px 105px 5px 5px;padding:0">') + [
                            //2016.04.27修改line-height的高度
                            '<textarea placeholder="', $.lang.default_textarea_text, '" style="', $.STYLE_BODY, 'background:#fff;height:17px;line-height:17px;width:100%;resize:none;outline:none;padding:10px 0 10px 5px;border:1px solid #d4d4d4;border-radius:5px"></textarea>',
                            '</div>',
                            '</div>',
                            '<div class="chat-view-button-face" style="' + $.STYLE_BODY + 'background:#F9F9F9;width:32px;height:32px;position:absolute;right:55px;top:8px;cursor:pointer;-webkit-tap-highlight-color:rgba(0,0,0,0);">',
                            '<svg width="32" height="32">',
                            '<circle class="bkg" cx="16" cy="16" r="15" stroke-width="1" stroke="#808080" fill="#F9F9F9"></circle>',
                            '<ellipse  cx="16" cy="19" rx="9" ry="7" stroke-width="1" stroke="#808080" fill="#808080"></ellipse>',
                            '<rect x="6" y="10" width="20" height="8" stroke-width="1" stroke="#F9F9F9" fill="#F9F9F9"></rect>',
                            '<circle cx="11" cy="10" r="2" stroke-width="1" stroke="#808080" fill="#808080"></circle>',
                            '<circle cx="21" cy="10" r="2" stroke-width="1" stroke="#808080" fill="#808080"></circle>',
                            '</svg>',
                            '</div>',

                            //2016.02.19  人工客服的图片
                            '<div class="chat-view-switch-manual" title="', $.lang.button_wap_switch_manual, '" style="' + $.STYLE_BODY + 'background:url(' + $.rengong + ') no-repeat center -6px;background-size:30px 30px;width:36px;height:36px;margin:10px 0px;position:absolute;left:5px;top:0px;text-align:center;cursor:pointer">',
                            '<span style="text-indent:-4px;width:36px;height:32px;font-size:12px;line-height:52px;color:#696d6c;display:inline-block;transform:scale(0.8,0.8);-ms-transform:scale(0.8,0.8);-moz-transform:scale(0.8,0.8);-webkit-transform:scale(0.8,0.8);-o-transform:scale(0.8,0.8);">' + $.lang.button_wap_switch_manual + '</span>',
                            '</div>',
                        ].join("")) :
                        ((($.Audio && $.Audio.support()) ?
                            '<div class="chat-view-button-audio" style="' + $.STYLE_NBODY + 'background:url(' + $.rengong + ') no-repeat center -6px;background-size:30px 30px;width:32px;height:32px;position:absolute;top:5px;left:5px;cursor:pointer">' + [
                                '<svg width="32px" height="32px">',
                                '<circle cx="16" cy="16" r="15" stroke-width="1" stroke="#808080" fill="#F9F9F9"></circle>',
                                '<circle cx="10.5" cy="16" r="1" stroke-width="1" stroke="#808080" fill="#808080"></circle>',
                                '<path d="M13 10 C 18.7 13, 18.7 19, 13 22" stroke="#808080" fill="transparent" stroke-width="2"></path>',
                                '<path d="M16.5 5.5 C 25.5 11,25.5 21, 16.5 26.5" stroke="#808080" fill="transparent" stroke-width="2"></path>',
                                '</svg>'
                            ].join("") +

                            '</div>' + '<div class="chat-view-textarea" style="' + $.STYLE_NBODY + 'margin:5px 105px 5px 45px;padding:0">' : '<div class="chat-view-textarea" style="' + $.STYLE_NBODY + 'margin:5px 105px 5px 5px;padding:0">') + [
                            //2016.04.27修改line-height的高度
                            '<textarea placeholder="', $.lang.default_textarea_text, '" style="', $.STYLE_BODY, 'background:#fff;height:17px;line-height:17px;width:100%;resize:none;outline:none;padding:10px 0 10px 5px;border:1px solid #d4d4d4;border-radius:5px"></textarea>',
                            '</div>',
                            '</div>',
                            '<div class="chat-view-button-face" style="' + $.STYLE_BODY + 'background:#F9F9F9;width:32px;height:32px;position:absolute;right:55px;top:8px;cursor:pointer;-webkit-tap-highlight-color:rgba(0,0,0,0);">',
                            '<svg width="32" height="32">',
                            '<circle class="bkg" cx="16" cy="16" r="15" stroke-width="1" stroke="#808080" fill="#F9F9F9"></circle>',
                            '<ellipse  cx="16" cy="19" rx="9" ry="7" stroke-width="1" stroke="#808080" fill="#808080"></ellipse>',
                            '<rect x="6" y="10" width="20" height="8" stroke-width="1" stroke="#F9F9F9" fill="#F9F9F9"></rect>',
                            '<circle cx="11" cy="10" r="2" stroke-width="1" stroke="#808080" fill="#808080"></circle>',
                            '<circle cx="21" cy="10" r="2" stroke-width="1" stroke="#808080" fill="#808080"></circle>',
                            '</svg>',
                            '</div>',

                            //2016.02.19  人工客服的图片
                            '<div class="chat-view-switch-manual" title="', $.lang.button_wap_switch_manual, '" style="' + $.STYLE_BODY + 'background:url(' + $.rengong + ') no-repeat center -6px;background-size:30px 30px;width:32px;height:32px;margin:8px 4px;position:absolute;right:10px;top:0px;text-align:center;cursor:pointer">',
                            '<span style="text-indent:-4px;width:36px;height:32px;font-size:12px;line-height:52px;color:#696d6c;display:inline-block;transform:scale(0.8,0.8);-ms-transform:scale(0.8,0.8);-moz-transform:scale(0.8,0.8);-webkit-transform:scale(0.8,0.8);-o-transform:scale(0.8,0.8);">' + $.lang.button_wap_switch_manual + '</span>',
                            '</div>',
                        ].join(""))
                    ),

                    //2015.02.19将新添加的东西放在了上面，避免刚进入时被刷掉
                    '<div class="chat-view-button-action" style="' + $.STYLE_BODY + 'background:#F9F9F9;width:32px;height:32px;margin:8px 4px;position:absolute;right:10px;top:0px;-webkit-tap-highlight-color:rgba(0,0,0,0);text-align:center;cursor:pointer">',
                    '<svg width="32" height="32">',
                    '<circle cx="16" cy="16" r="15" stroke-width="1" stroke="#808080" fill="#F9F9F9"></circle>',
                    '<rect x="15" y="6" rx="15" ry="6" width="1" height="20" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                    '<rect x="6" y="15" rx="6" ry="15" width="20" height="1" stroke-width="1" stroke="#808080" fill="#808080"></rect>',
                    '</svg>',
                    '</div>',
                    //2016.02.19 将人工客服的字体删除
                    //'<div class="chat-view-switch-manual" title="', $.lang.button_switch_manual, '" style="', $.STYLE_BODY, 'background:#fff;padding:0 5px;width:auto;height:30px;line-height:30px;font-size:12px;margin:3px 4px;position:absolute;right:57px;top:6px;text-align:center;cursor:pointer;border:1px solid #ccc;border-radius:5px;background:/*url(', $.imageicon, ') no-repeat -87px -17px*/;display:none;">', $.lang.button_switch_manual, '</div>',
                    '<div class="chat-view-button-send" style="' + $.STYLE_BODY + 'width:auto;margin:8px 10px 5px 0px;padding:0 5px;border:1px solid #d4d4d4;border-radius:7px;position:absolute;right:0px;top:0px;height:32px;line-height:32px;text-align:center;cursor:pointer;display:none;border-color:' + bubble + ';background:' + bubble + ';color:' + bubble_text + '">' + $.lang.chat_button_send + '</div>',

                    '<div class="chat-view-window-face" style="', $.STYLE_NBODY, 'border-top:1px solid #ccc;display:none;">',
                    //表情图片选择区
                    '</div>',
                    '<div class="chat-view-window-action" style="', $.STYLE_NBODY, 'border-top:1px solid #ccc;display:none;">',
                    //评价按钮
                    '<div class="chat-view-action-button chat-view-evaluate" style="', $.STYLE_NBODY, 'margin:5px 5px 0 20px;float:left;width:56px;position:relative;">',
                    '<div class="chat-view-button-image" style="', $.STYLE_BODY, 'text-align:center;width:56px;height:56px;background:#e8e8e8 url(', $.imageicon, ') no-repeat -47px -50px; border:1px solid #e8e8e8;border-radius:10px;"></div>',
                    '<div style="', $.STYLE_BODY, 'text-align:center;overflow-x:hidden">', $.lang.button_evaluation, '</div>',
                    '</div>',
                    //上传图片、文件
                    '<div class="chat-view-action-button chat-view-image" style="', $.STYLE_NBODY, 'margin:5px 5px 0 20px;float:left;width:56px;height:auto;position:relative;background:none;">',
                    '<div class="chat-view-button-image" style="', $.STYLE_BODY, 'text-align:center;width:56px;height:56px;background:#e8e8e8 url(', $.imageicon, ') no-repeat -3px -50px; border:1px solid #e8e8e8;border-radius:10px;"></div>',
                    '<div style="', $.STYLE_BODY, 'position:relative;bottom:0;text-align:center;overflow-x:hidden">', $.lang.button_image, '</div>',
                    '</div>',
                    /*
                    '<div class="chat-view-action-button chat-view-transfer-file" style="',$.STYLE_NBODY,'margin:5px 5px 0 20px;float:left;width:56px;height:auto;position:relative;background:none;">',
                    	'<div class="chat-view-file-button" style="',$.STYLE_BODY,'text-align:center;width:56px;height:56px;background:url(',$.imageicon,') no-repeat -357px -0;border:1px solid #ccc;border-radius:10px;"></div>',
                    	'<div style="',$.STYLE_BODY,'position:relative;bottom:0;text-align:center;">',$.lang.button_file,'</div>',
                    '</div>',
                    */
                    //查看聊天记录
                    /*'<div class="chat-view-action-button chat-view-load-history" style="', $.STYLE_NBODY, 'margin:5px 5px 0 20px;float:left;width:56px;height:auto;position:relative;background:none;">',
                    '<div class="chat-view-button-image" style="', $.STYLE_BODY, 'text-align:center;width:56px;height:56px;background:#e8e8e8 url(', $.imageicon, ') no-repeat -99px -84px;border:1px solid #e8e8e8;border-radius:10px;"></div>',
                    '<div style="', $.STYLE_BODY, 'position:relative;bottom:0;text-align:center;">', $.lang.button_view, '</div>',
                    '</div>',*/
                    '<div style="', $.STYLE_NBODY, 'clear:both;"></div>',
                    '</div>'
                ].join('') :
                type == 'message' ? [
                    '<div class="chat-view-message-body" style="', $.STYLE_BODY, ' background-color:#F3F3F7">',
                    '<form name="chat-view-message-form" action="" enctype="multipart/form-data" target="chat-view-submit-iframe" method="post" class="chat-view-message-form" style="', $.STYLE_NBODY, 'display:block;">',
                    '<input type="hidden" value="' + $.charset + '" name="charset" />',
                    '<input type="hidden" value="' + $.source + '" name="parentpageurl" />',
                    '<input type="hidden" value="" name="myuid" />',
                    '<input type="hidden" value="" name="destuid" />',
                    '<input type="hidden" value="" name="ntkf_t2d_sid" />',
                    '<input type="hidden" value="" name="source" />',
                    '<input type="hidden" value="' + this.mode.settingid + '" name="settingid" />',
                    '<div class="chat-view-message-table" style="', $.STYLE_BODY, 'padding:20px;overflow:hidden;"></div>',
                    '</form>',
                    '</div>'
                ].join('') : [
                    //Alter
                    '<iframe class="ntkf-alert-iframe" style="', $.STYLE_BODY, 'display:none;position:fixed;left:0;top:0;margin:0;padding:0;border:0;width:100%;height:', $(window).height(), 'px;-moz-opacity:0;opacity:0;filter:alpha(opacity=0);z-index:88888;border:none;">',
                    '</iframe>',
                    '<div class="ntkf-alert-background" style="', $.STYLE_BODY, 'display:none;position:fixed;left:0;top:0;margin:0;padding:0;border:0;width:100%;height:', $(window).height(), 'px;background:#000;-moz-opacity:0.35;opacity:0.35;filter:alpha(opacity=35);z-index:99999;border:none;">',
                    '</div>',
                    '<div class="ntkf-alert-container" style="', $.STYLE_BODY, 'display:none;position:fixed;left:39px;top:100px;width:', (+$(window).width() - 78), 'px;height:auto;border-radius:10px;-moz-opacity:1;opacity:1;filter:alpha(opacity=100);z-index:3000;background:#fff;">',
                    '</div>'
                ].join('');
        },
        /**
         * @method formatMessageTime 格式化时间
         * @param {string} timestamp 日期时间字符串
         * @return {String} 当天时间返回 HH:mm 隔天时间返回 yyyy-MM-dd HH:mm
         */
        formatMessageTime: function(timestamp) {
            var dataArr = ($.formatDate('yyyy-MM-dd') + ' 00:00:00').split(/[- :]/);
            var d = new Date(dataArr[0], dataArr[1] - 1, dataArr[2], dataArr[3], dataArr[4], dataArr[5]);
            return $.formatDate(timestamp, timestamp >= d.getTime() ? 'HH:mm' : 'yyyy-MM-dd HH:mm');
        },
        /**
         * 为工具栏按钮绑定事件
         */
        _bind: function() {
            var self = this,
                offset, disable = true;

            var bubble = newWapTheme.bubble;
            this._listenTextEditor();

            //表情按钮
            this.faceButton = this.bottomElement.find('.chat-view-button-face').bind('touchstart', function(event) {
                $(this).find('svg').find('circle').first().attr('fill', '#e5e4e4');
                $(this).find('svg').find('rect').first().attr('fill', '#e5e4e4');
            }).tap(function(event) {
                //表情统计点
                self.mode.callTrack("10-02-02");
                $(this).find('svg').find('circle').first().attr('fill', '#F9F9F9');
                $(this).find('svg').find('rect').first().attr('fill', '#F9F9F9');
                self.bottomElement.find('.chat-view-window-audio').display(false);
                self.bottomElement.find('.chat-view-window-editor').display(true).show();
                var that = this;
                self._initFaceGroup();
                self._showActionList(that);
                return false;
            });
            //打开功能区按钮
            this.actionButton = this.bottomElement.find('.chat-view-button-action').bind('touchstart', function(event) {
                $(this).find('svg').find('circle').first().attr('fill', '#e5e4e4');
            }).tap(function(event) {
                self.bottomElement.find('.chat-view-action-button').each(function(i, element) {
                    if ($(this).css('display') == 'block') disable = false;
                });
                $(this).find('svg').find('circle').first().attr('fill', '#F9F9F9');
                if (disable === true) {
                    return;
                }

                self._showActionList(this);
                return false;
            });
            //发送的消息按钮
            //不需要使用tap，在ios上会穿透
            this.sendButton = this.bottomElement.find('.chat-view-button-send').click(function(event) {
                self._send();

                if (self.faceElement && self.faceElement.css('display') == 'block') {
                    self.faceElement.display(0);
                }
                //2016.02.25 延迟显示，防止点击击穿
                setTimeout(function() {
                    if (self.mode.robotKf || self.mode.requestRobot) {
                        self.switchManualButton.display(1);
                    }
                }, 200);

                return false;
            });
            //2016.02.29 转人工按钮
            this.switchManualButton = this.bottomElement.find('.chat-view-switch-manual');

            //图片、评价功能按钮，初始为#E8E8E8, 点击为#D6D6D6
            this.bottomElement.find('.chat-view-action-button').bind('touchstart', function(event) {
                if ($(this).attr('talk_disable') == 'disable') {
                    return;
                }
                $(this).find('.chat-view-button-image, .chat-view-file-button').css({
                    'background-color': '#d6d6d6',
                    'border-color': '#d6d6d6',
                    'outline': 'none'
                });
            }).bind('touchend', function(event) {
                if ($(this).attr('talk_disable') == 'disable') {
                    return;
                }
                $(this).find('.chat-view-button-image, .chat-view-file-button').css({
                    'background-color': '#e8e8e8',
                    'border-color': '#e8e8e8'
                });
            }).tap(function(event) {
                if ($(this).attr('talk_disable') == 'disable') {
                    return;
                }
                if ($(this).indexOfClass('chat-view-evaluate')) {
                    //评价统计点
                    self.mode.callTrack("10-02-09");

                    //打开评价窗
                    self._evaluate();
                } else if ($(this).indexOfClass('chat-view-load-history')) {
                    //显示聊天记录
                    self._viewHistory(true);
                }
            });
            this.bottomElement.find('.chat-view-switch-manual').click(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                if ($(this).attr('talk_disable')) return;
                self._switchManual(event);
            });
            //消息输入框
            this.textEditor = this.bottomElement.find('.chat-view-window-editor textarea').attr('rows', '1').textareaAutoHeight({
                minHeight: 17,
                maxHeight: 240
            }).bind('keypress', function(event) {
                event = $.Event.fixEvent(event);
                event.stopPropagation();

                if (event.keyCode == 13 && event.shitfKey) {
                    //Enter
                } else if (self._sendKey == 'Enter') {
                    if ((event.keyCode == 13 && event.ctrlKey) || event.keyCode == 10) {
                        //--IE下\r\n后无字符时，用户只看到一个空格，未换行
                        self.textEditor.val(self.textEditor.val() + "\r\n");
                    } else if (event.keyCode == 13) {
                        event.preventDefault();
                        self._send();
                    }
                }
            }).bind('keyup', function(event) {
                //2016.04.28 将输入汉字后获取光标的位置
                self._editorStart = self._getPositionForTextArea(this);
                var enLength = $.enLength($(this).val());
                if (enLength > self.mode.inputMaxByte) {
                    $(this).val($.enCut($(this).val(), self.mode.inputMaxByte));
                }
                self.sendButton.display($(this).val() !== '');
                /*2016.09.19如果事机器人状态，机器人不隐藏*/
                if (self.mode.robotKf || self.mode.requestRobot) {
                    if (self.mode.config.robot_version == 2 && self.switchManualButton[0].style.display == 'block') {
                        self.switchManualButton.display(true);
                    } else {
                        self.switchManualButton.display($(this).val() === '');
                    }

                }
            }).tap(function() {
                self._editorStart = self._getPositionForTextArea(this);
            }).bind('focus', function(event) {
                $(this).css({
                    'border': '1px solid #a1cce8',
                    'border-color': bubble,
                    'outline': 'none'
                });
                $.promptwindow.stopPrompt();

                self._hiddenFloatMenu();

                if ($.browser.iPhone && $.params.iframechat != "1") {
                    self.bottomElement.css({
                        'position': 'absolute'
                    });
                }

                var inter = setInterval(function() {
                    window.scrollTo(0, document.body.scrollHeight);
                }, 200);

                setTimeout(function() {
                    clearInterval(inter);
                }, 1000);

            }).bind('blur', function(event) {
                $(this).css({
                    'border': '1px solid #d4d4d4',
                    'outline': 'none'
                });
                if ($.browser.iPhone && $.params.iframechat != "1") {
                    self.bottomElement.css({
                        'position': 'fixed',
                        'bottom': '0px'
                    });
                }

                setTimeout(function() {
                    self.bottomElement.css({
                        'display': 'none'
                    });
                }, 80);
                setTimeout(function() {
                    if ($('.chat-view-message').css('display') == 'none') {
                        self.bottomElement.css({
                            'display': 'block'
                        });
                        window.scrollTo(0, 1);
                    }
                }, 280);
            });
        },

        //language
        _initAudio: function() {
            if (!$.Audio) {
                return;
            }
            var self = this;
            //音频&文本输入方式转换
            this.bottomElement.find('.chat-view-button-audio').bind('touchstart', function() {
                $(this).find('svg').find('circle').first().attr('fill', '#e5e4e4');
            }).tap(function() {

                if (!$.Audio.inited) {
                    self.mode.audioInit();
                }

                self.bottomElement.find('.chat-view-window-editor').display(false);

                self.bottomElement.find('.chat-view-window-audio').display(true).show();

                $(this).find('svg').find('circle').first().attr('fill', '#F9F9F9');
            });

            this.bottomElement.find('.chat-view-button-text').bind('touchstart', function() {
                $(this).find('svg').find('circle').first().attr('fill', '#e5e4e4');
            }).tap(function(e) {

                self.bottomElement.find('.chat-view-window-audio').display(false);

                self.bottomElement.find('.chat-view-window-editor').display(true).show();

                $(this).find('svg').find('circle').first().attr('fill', '#F9F9F9');
            });

            var voiceHtml = ['<div id="voiceContainer" style="position:relative;top:42px;left:45px;width:60px;height:110px;background: url(', $.imageicon, ') no-repeat -168px -151px; z-index:100">',
                '<div id="voice_volumn" style="opacity:1;position:absolute;bottom:15px;left:70px;width:45px;height:80px;background: url(', $.sourceURI + 'images/m-voice.gif', ') no-repeat;z-index:10"></div>',
                '</div>',
                '<div style="position: relative;width: 180px; height:30px; line-height: 30px;z-index:100; color: #FFF; top: 46px; left: 10px; text-align:center;font-weight:bold">', $.lang.chat_button_audio_fingerup, '</div>'
            ].join('');

            var fingerUpHtml = ['<div id="voice_cancel" style="position:relative;top: 42px;left:65px;width:60px;height:110px;background:url(', $.imageicon, ') no-repeat -100px -151px; z-index:100">',
                '</div>',
                '<div style="position:relative;width:180px;height:30px;line-height:30px;z-index:100; color:white; top:46px; left:10px; text-align:center;font-weight:bold; background-color:#A84B4B; border-radius:5px">', $.lang.chat_button_audio_freefinger, '</div>'
            ].join('');

            var shortTimeHtml = ['<div style="position:relative;top: 42px;left:55px;width:90px;height:110px;background:url(', $.imageicon, ') no-repeat -0px -151px; z-index:100">',
                '</div>',
                '<div style="position:relative;width:180px;height:30px;line-height:30px;z-index:100; color:white; top:46px; left:10px; text-align:center;font-weight:bold;">', $.lang.chat_button_audio_shorttime, '</div>'
            ].join('');

            var voiceTimeoutHtml = '<div id="voice_countDown" style="opacity: 1; position: absolute; bottom: 72px; left: 60px; width: 45px; height:80px; z-index: 10;font-size:105px;font-weight:100;font-family:Arial">9</div>';

            var startTime = 0;
            var endTime = 0;

            var voiceTimeout = null,
                voiceTimeoutInter = null,
                removeGestureTimeout = null,
                holdup = function() {
                    //语音不可用，直接返回
                    if (self.audioDisable()) {
                        return;
                    }
                    $.Log('Audio up');

                    var button = $('.chat-audioInput');

                    $(button).css({
                        'background': '#fafafa',
                        'border': '1px solid #d4d4d4',
                        'outline': 'none'
                    }).val($.lang.chat_button_audio);

                    if (Date.now() - startTime < 1000) {
                        removeGestureTimeout = setTimeout(self.removeGestureToast, 2000);
                        Gesture.toast.change(shortTimeHtml);
                        self.clearAudioData();
                        return;
                    } else {
                        self.removeGestureToast();
                    }

                    var randomId = parseInt(Math.random() * 1000 + 1);
                    if (!$.Audio) return;
                    $.Audio.end(function(e) {
                        self.mode.audioUpload(e, randomId);
                    });

                    if (voiceTimeout) {
                        clearTimeout(voiceTimeout);
                        voiceTimeout = null;
                    }
                    if (voiceTimeoutInter) {
                        clearInterval(voiceTimeoutInter);
                        voiceTimeoutInter = null;
                    }
                };

            this.bottomElement.find('.chat-view-window-audio input').gesture('hold', function() {
                if (removeGestureTimeout) {
                    clearTimeout(removeGestureTimeout);
                    removeGestureTimeout = null;
                }
                self.removeGestureToast();

                //语音不可用，直接返回
                if (self.audioDisable()) {
                    Gesture.toast = new $.Toast('<div style="position: relative;width: 200px; height:30px; line-height: 30px;z-index:100; color: #FFF; top: 30px; left: 25px; text-align:center;font-weight:bold">' + $.lang.chat_button_audio_error + '</div>', {
                        width: 250,
                        height: 90
                    });
                    removeGestureTimeout = setTimeout(function() {
                        Gesture.toast.remove();
                    }, 2000);
                    return;
                }
                $.Log('Audio hold');

                $(this).css({
                    'background': '#e0e0e0',
                    'border': '1px solid #d4d4d4',
                    'outline': 'none'
                }).val($.lang.chat_button_audio_fingerup);

                Gesture.toast = new $.Toast(voiceHtml, {
                    width: 200,
                    height: 200
                });

                startTime = Date.now();

                if ($.Audio && false === $.Audio.record()) {
                    $.Log('$.Audio not init', 3);
                }

                if (voiceTimeout) {
                    clearTimeout(voiceTimeout);
                    voiceTimeout = null;
                }
                if (voiceTimeoutInter) {
                    clearInterval(voiceTimeoutInter);
                    voiceTimeoutInter = null;
                }

                voiceTimeout = setTimeout(function() {
                    $('#voice_volumn').remove();
                    $('#voiceContainer').append(voiceTimeoutHtml);
                    setTimeout(function() {
                        voiceTimeoutInter = setInterval(function() {
                            if (parseInt($('#voice_countDown').html()) === 0) {
                                clearTimeout(voiceTimeout);
                                clearInterval(voiceTimeoutInter);
                                voiceTimeout = null;
                                voiceTimeoutInter = null;
                            }
                            $('#voice_countDown').html(parseInt($('#voice_countDown').html(), 10) - 1);
                        }, 1000);
                    }, 500);
                    setTimeout(function() {
                        clearTimeout(voiceTimeout);
                        clearInterval(voiceTimeoutInter);
                        Gesture.util.reset();
                        Gesture.record.swipeEl = null;
                        Gesture.record.holdEl = null;
                        holdup.call();
                    }, 10 * 1000);
                }, 20 * 1000);

            }).gesture('holdup', holdup).gesture('swiping', function() {
                //语音不可用，直接返回
                if (self.audioDisable()) {
                    return;
                }

                var record = Gesture.record;
                var tsy = null;
                if (record.direction == 'up' && record.distance > ($(window).height() / 4)) {
                    if ($('#voice_volumn').length !== 0) {
                        Gesture.toast.change(fingerUpHtml);
                    }
                    tsy = $.lang.chat_button_audio_freefinger;
                } else if (record.direction == 'up' && record.distance < ($(window).height() / 4)) {
                    if ($('#voice_cancel').length !== 0) {
                        Gesture.toast.change(voiceHtml);
                    }
                    tsy = $.lang.chat_button_audio_fingerup;
                }
                $(this).css({
                    'border': '1px solid #d4d4d4',
                    'outline': 'none'
                }).val(tsy);
            }).gesture('swipeend', function() {
                //语音不可用，直接返回
                if (self.audioDisable()) {
                    return;
                }

                $(this).css({
                    'background': '#fafafa',
                    'border': '1px solid #d4d4d4',
                    'outline': 'none'
                }).val($.lang.chat_button_audio);

                var randomId = parseInt(Math.random() * 1000 + 1);
                if ($('#voice-volumn').length > 0 || $('#voice-countDown').length > 0) {
                    if (!$.Audio) return;
                    $.Audio.end(function(e) {
                        self.mode.audioUpload(e, randomId);
                    });
                } else {
                    self.clearAudioData();
                }
                self.removeGestureToast();

                if (voiceTimeout) {
                    clearTimeout(voiceTimeout);
                    voiceTimeout = null;
                }
                if (voiceTimeoutInter) {
                    clearInterval(voiceTimeoutInter);
                    voiceTimeoutInter = null;
                }
            }).gesture('holdcancel', function() {
                //语音不可用，直接返回
                if (self.audioDisable()) {
                    return;
                }

                $(this).css({
                    'background': '#fafafa',
                    'border': '1px solid #d4d4d4',
                    'outline': 'none'
                }).val($.lang.chat_button_audio);

                self.removeGestureToast();
                self.clearAudioData();

                holdCancelToast = new $.Toast('<div style="position: relative;width: 200px; height:30px; line-height: 30px;z-index:100; color: #FFF; top: 30px; left: 25px; text-align:center;font-weight:bold">' + $.lang.chat_audio_orientation_stop + '</div>', {
                    width: 250,
                    height: 90
                });
                removeGestureTimeout = setTimeout(function() {
                    holdCancelToast.remove();
                }, 2000);

                if (voiceTimeout) {
                    clearTimeout(voiceTimeout);
                    voiceTimeout = null;
                }
                if (voiceTimeoutInter) {
                    clearInterval(voiceTimeoutInter);
                    voiceTimeoutInter = null;
                }
            });
        },

        audioDisable: function() {
            if ($('.chat-audioInput').attr('disabled') == 'disabled') {
                return true;
            } else {
                return false;
            }
        },

        clearAudioData: function() {
            try {
                $.Audio.rec.stop();
                $.Audio.rec.clear();
            } catch (e) {
                $.Log(e, 3);
            }
        },

        removeGestureToast: function() {
            if (Gesture.toast) {
                Gesture.toast.remove();
                Gesture.toast = null;
            }
        },

        showAudioResult: function(msgid, el) {
            var liEl = el ? el : this.chatHistory.find('.' + msgid).last();
            liEl.find('.view-history-status-loading').display(0);
        },

        audioProgress: function(msgid, progress) {
            var bodyElement = this.chatHistory.find('.' + msgid + ' .view-history-body');

            var self = this;
            var liEl = this.chatHistory.find('.' + msgid).last();
            var bodyEl = liEl.find('.view-history-body');

            //设置背景为预置图片，设置提示语为正在上传，隐藏重新发送按钮，显示loading图标
            liEl.find('.view-history-status').css({
                'left': '-60px',
                'top': '23px'
            }).display(1);
            liEl.find('.view-history-status-icon').display(0);
            liEl.find('.view-history-status-loading').display(1);
        },

        _hiddenFloatMenu: function() {
            this.bottomElement.find('.chat-view-window-face').display();
            this.bottomElement.find('.chat-view-window-action').display();
        },

        /**
         * @method _showActionList 显示功能区
         * @param  {HTMLDom} element
         * @param  {boolean} hidden    隐藏|显示控制区域
         * @param  {boolean} sBottom   滚动到最新消息区
         * @return {void}
         */
        _showActionList: function(element, hidden, sBottom) {
            var display;
            element = element || this.actionButton.get(0);
            if (element.className.indexOf('action') > -1 || hidden === true) {
                this.bottomElement.find('.chat-view-window-face').display(0);

                display = this.bottomElement.find('.chat-view-window-action').css('display');
                this.bottomElement.find('.chat-view-window-action').display(display == 'block' || hidden ? 0 : 1);
            } else {
                this.bottomElement.find('.chat-view-window-action').display(0);

                display = this.bottomElement.find('.chat-view-window-face').css('display');
                this.bottomElement.find('.chat-view-window-face').display(display == 'block' ? 0 : 1);
            }

            //this.scrollBottom();
        },
        /**
         * 禁用或启用按钮功能
         * 2016.02.14 添加对图片、文件上传的处理
         * @param  string|array   buttonName
         * @param  boolen         disable
         * @return boolen
         */
        disableButton: function(buttonName, disable) {
            var self = this,
                selector = [];

            buttonName = $.isArray(buttonName) ? buttonName : [buttonName];
            $.each(buttonName, function(i, name) {
                selector.push('.' + self.buttonSelectors[name]);
            });
            selector = selector.join(',');

            $.Log('nTalk.chatView.disableButton(' + selector + ', ' + disable + ')');
            if (disable) {
                this.bottomElement.find(selector).attr('talk_disable', 'disable').css('opacity', '0.4');
                if (selector.indexOf("chat-view-image") > -1 || selector.indexOf("chat-view-transfer-file") > -1) {
                    this.bottomElement.find(selector).find('input').each(function(i) {
                        $(this).attr("disabled", "disabled");
                    });
                }
                return false;
            } else {
                this.bottomElement.find(selector).attr('talk_disable', '').css('opacity', 1);
                if (selector.indexOf("chat-view-image") > -1 || selector.indexOf("chat-view-transfer-file") > -1) {
                    this.bottomElement.find(selector).find('input').each(function(i) {
                        $(this).attr("disabled", "");
                    });
                }
                return true;
            }
        },
        /**
         * 显示功能按钮
         * @param  string|array   buttonName
         * @param  boolen         display
         * @return boolen
         */
        displayButton: function(buttonName, display) {
            var self = this,
                selector = [];

            buttonName = $.isArray(buttonName) ? buttonName : [buttonName];

            $.each(buttonName, function(i, name) {
                selector.push('.' + self.buttonSelectors[name]);
            });
            selector = selector.join(',');

            this.bottomElement.find(selector).display(!display);
        },
        disabledAudioButton: function(disabled) {
            this.bottomElement.find('.chat-view-window-audio input').attr({
                'disabled': disabled ? 'disabled' : ''
            }).css({
                'color': disabled ? '#ccc' : '#000'
            });
        },
        displayEvClose: function(show) {
            if (isEdu) {
                return;
            }
            if ($('.chat-view-window-status-info').css('display') == 'none' && $('.view-website-iframe').length === 0) {
                $('.chat-view-window-header-ev-close').display(show);
            }
        },
        /**
         * 2015.11.11 隐藏语音按钮，将input框距离左部距离调整为5px
         */
        hideAudioButton: function() {
            $('.chat-view-button-audio').css('display', 'none');
            $('.chat-view-textarea').css({
                'margin-left': '5px'
            });
            if (this.mode.config.robot_version == 2) {
                $('.chat-view-textarea').css({
                    'margin-left': '45px',
                });
            }
        },
        _listenTextEditor: function() {
            //消息预知
            var self = this;
            setInterval(function() {
                var Listen = self.textEditor.val();
                var cacheListen = self._cacheListen;

                if (Listen == $.lang.default_textarea_text) {
                    return;
                }
                //输放内容超出限制时
                if ($.enLength(Listen) > 500) {
                    Listen = $.enCut(Listen, 500);
                    self.textEditor.val(Listen);

                    self.textEditor.scrollTop(self.textEditor.scrollHeight());
                }

                if ((Listen && cacheListen !== Listen) ||
                    (!Listen && cacheListen)) {
                    self.mode.predictMessage(Listen);
                }
                self._cacheListen = Listen;
            }, 2E3);

            //2014.11.08
            //for browser no keypress event BUG
            setInterval(function() {
                var editorContent = self.textEditor.val();
                if (editorContent == $.lang.default_textarea_text) {
                    return;
                }
                self.sendButton.display(editorContent !== '');
            }, 6E2);
        },
        /**
         * @method _initFaceGroup 初始化表情列表
         * @return {[type]}         [description]
         */
        _initFaceGroup: function() {
            var self = this,
                k, cstyle,
                style = 'outline:0;diplay:block;float:left;width:23px;height:23px;display:inline;box-sizing:content-box;';
            if (this._initFace) {
                return;
            }
            this._initFace = true;

            //表情图片区
            this.faceElement = this.bottomElement.find('.chat-view-window-face');
            if (!this.faceElement.find('.chat-view-face-tags').length) {
                this.faceElement.append(['<div class="chat-view-face-tags" style="', $.STYLE_NBODY, 'background:#F1F1F1;clear:both;padding:0 5px;height:38px;border-top:1px solid #D4D4D4;"></div>'].join(''));
            }
            $.each(this.mode.config.faces, function(i, cFace) {
                var groupClass = 'chat-view-face-group-' + i;
                var tagClass = 'chat-view-face-tag-' + i;
                //表情组
                if (!self.faceElement.find('.' + groupClass).length) {
                    self.faceElement.insert('<div class="' + groupClass + ' chat-view-face-group" style="' + $.STYLE_NBODY + (i === 0 ? '' : 'display:none;') + 'overflow-x:hidden;overflow-y:auto;margin:10px 0px 10px 10px;clear:left;height:auto;max-height:100px;"></div>', 'afterbegin');
                }
                if (cFace.pics === undefined) {
                    cFace.pics = [];
                }
                $.each(cFace.pics, function(faceIndex, jsonFace) {
                    var j = faceIndex + 1;
                    var alt = i === 0 ? ' title="' + jsonFace.sourceurl + '"' : ' title="" sourceurl="' + jsonFace.sourceurl + '"';
                    cstyle = style + 'margin:0;padding:3px;border:none;background:none;';

                    self.faceElement.find('.' + groupClass).append('<span style="' + $.STYLE_BODY + 'cursor:pointer;width:14.2%;padding:2px 0;dislay:block;float:left;text-align:center;"><img src="' + jsonFace.url + '" ' + alt + ' border="0" style="' + cstyle + '" /></span>');
                });

                //组标签
                if (i === 0) {
                    $({
                        className: 'chat-view-face-tag ' + tagClass + ' tag-selected',
                        title: cFace.name,
                        index: '0',
                        style: $.STYLE_NBODY + 'margin:0 0 0 5px;float:left;clear:right;background:#fff;position:relative;top:-1px;border-left:1px solid #D4D4D4;border-right:1px solid #D4D4D4;'
                    }).appendTo(self.faceElement.find('.chat-view-face-tags')).append('<img src="' + cFace.icon + '" border="0" style="' + style + 'margin:0;padding:8px;border:none;" />');
                } else {
                    $({
                        className: 'chat-view-face-tag ' + tagClass,
                        title: cFace.name,
                        index: i,
                        style: $.STYLE_NBODY + 'margin:0 0 0 5px;float:left;clear:right;background:none;position:relative;top:0px;border-left:1px solid #f1f1f1;border-right:1px solid #f1f1f1;'
                    }).appendTo(self.faceElement.find('.chat-view-face-tags')).append('<img src="' + cFace.icon + '" border="0" style="' + style + 'margin:0;padding:8px;border:none;" />');
                }
            });

            this.faceElement.find('.chat-view-face-group span').hover(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                $(this).css({
                    "background-color": '#EEE'
                });
            }, function(event) {
                $.Event.fixEvent(event).stopPropagation();
                $(this).css({
                    "background-color": ''
                });
            }).tap(function(event) {
                $.Event.fixEvent(event).stopPropagation();

                if ($(this).parent().indexOfClass('chat-view-face-group-0')) {
                    //select default face
                    self._insertText($(this).find('img').attr('title') ? '[' + $(this).find('img').attr('title') + ']' : true);
                    //2016.04.26 将输入汉字后获取光标的位置
                    self._editorStart = self._getPositionForTextArea(this);
                    //2016.04.29
                    self.textEditor.textareaAutoHeight({
                        minHeight: 17,
                        maxHeight: 240
                    });
                } else {
                    self.faceElement.display();
                    $.Log('selected current face:' + $(this).find('img').attr('sourceurl'));
                    //current faces
                    self.mode.send({
                        type: 2,
                        emotion: 1,
                        msg: "current face",
                        url: $(this).find('img').attr('src'),
                        sourceurl: $(this).find('img').attr('sourceurl'),
                        oldfile: "",
                        size: "",
                        extension: ""
                    });
                }
            });

            //tag event bind
            this.faceElement.find('.chat-view-face-tags div').hover(function(event) {
                $.Event.fixEvent(event).stopPropagation();

                if ($(this).indexOfClass('tag-selected')) return;

                $(this).css({
                    'background-color': '#fafafa',
                    'top': '-1px',
                    'border-left': '1px solid #D4D4D4',
                    'border-right': '1px solid #D4D4D4'
                });
            }, function(event) {
                $.Event.fixEvent(event).stopPropagation();

                if ($(this).indexOfClass('tag-selected')) return;
                $(this).css({
                    'background-color': '',
                    'top': '0px',
                    'border-left': '1px solid #f1f1f1',
                    'border-right': '1px solid #f1f1f1'
                });
            }).tap(function(event) {
                $.Event.fixEvent(event).stopPropagation();

                self.faceElement.find('.chat-view-face-tag').css({
                    'background-color': '',
                    'top': '0px',
                    'border-left': '1px solid #f1f1f1',
                    'border-right': '1px solid #f1f1f1'
                }).removeClass('tag-selected');
                self.faceElement.find('.chat-view-face-group').display();

                $(this).css({
                    'background-color': '#fff',
                    'top': '-1px',
                    'border-left': '1px solid #D4D4D4',
                    'border-right': '1px solid #D4D4D4'
                });
                self.faceElement.find('.chat-view-face-group-' + $(this).attr('index')).display(1);
                $(this).addClass('tag-selected');
            });
        },
        /**
         * 消息内容过滤,表情转换，url转换
         * @return {[type]}
         */
        _contentFilter: function(data) {
            if (typeof data.msg !== 'string' || /<.*?>/gi.test(data.msg) || data.type == 7) {

                //2015.03.28 添加消息内容中含图片时，默认显示小图，点击后显示大图
                if ((data.type === 1 || data.type == 7) && /<img(.*?)src=([^\s]+)(.*?)>/gi.test(data.msg)) {
                    data.msg = data.msg.replace(/<img(.*?)src=([^\s]+)(.*?)>/gi, '<img style="max-width:220px;max-height:160px" class="ntalk-preview" ' + (data.type == 7 ? " robotImg='true' " : "") + ' src="' + $.imageloading + '" sourceurl=$2 />');
                }

                if(data.type == 7) {
                  data.msg = $.utils.handleLinks(data.msg, null, 'p4');
                }

                return data;
            }
            data.msg = data.msg.replace(/[\r\n]/ig, ' <br>');
            if (data.msg && data.msg.indexOf('xnlink') === -1) {
                data.msg = data.msg.replace(/(\s{2})/ig, ' {$null}');
            }

            //替换连接
            //右侧自定义标签wap不支持
            data.msg = data.msg.replace(/\[link\s*rightTag=true\s*url="(.*?)"\s*close=(.*?)\s*title="(.*?)"\s*\](.*?)\[\/link\]/gi, "$1" + "$4");
            data.msg = $.myString(data.msg).linkFilter1($.STYLE_BODY + 'color:#0a8cd2;');
            data.msg = data.msg.replace(/\{\$null\}/ig, '&nbsp;&nbsp;');
            data.msg = data.msg.replace(/\t/ig, '&nbsp;&nbsp;&nbsp;&nbsp;');
            //机器人快速回复连接
            data.msg = $.utils.handleLinks(data.msg, {
                settingid: this.settingid
            });
            data.msg = this._faceFilter(data.msg);

            return data;
        },
        _faceFilter: function(str) {
            var m = str.match(/\[([a-z]+)\]/ig),
                _gIndex = function(text) {
                    var ret = null;
                    $.each($.lang.editorFaceAlt, function(k, ftext) {
                        if (ftext && new RegExp(text.replace(/\[/, "\\[").replace(/\]/, "\\]"), "gi").test('[' + ftext + ']')) ret = k;
                    });
                    return ret;
                };
            if (!m || !str) {
                return str;
            }
            for (var k, i = 0; i < m.length; i++) {
                if (!(k = _gIndex(m[i]))) {
                    continue;
                }
                str = str.replace(m[i], '<img src="' + $.sourceURI + 'images/faces/' + k + ($.browser.msie6 ? '.gif' : '.png') + '" style="' + $.STYLE_NBODY + 'width:23px;height:23px;margin:0 2px;padding:0;display:inline;vertical-align:text-bottom" />');
            }
            return str;
        },
        /**
         * 查看聊天记录(2014.11.11)
         * @params {Boolean}  showView 查看聊天记录或关闭聊天记录
         * @return {[type]}
         */
        _viewHistory: function(showView) {
            var self = this,
                dialogElement, attr, html, funcResizeDialog;

            if (!this.mode.viewHistory) {
                return;
            }

            html = [
                '<div class="alert-header" style="', $.STYLE_BODY, 'height:44px;border-bottom:1px solid #ccc;">',
                '<input type="button" class="alert-header-back" style="', $.STYLE_BODY, 'padding:0 10px;margin:8px 0 8px 20px;cursor:auto;border-radius:3px;background:#0079fe;color:#fff;height:28px;line-height:28px;" value="', $.lang.back_button_text, '" />',
                '</div>',
                '<div class="chat-view-float-history" style="', $.STYLE_BODY, 'width:100%;height:', ($(window).height() - 44), 'px;background:#fff;z-index:99;display:block;">',
                '<iframe scrolling="no" frameborder="0" class="chat-view-float-iframe" style="' + $.STYLE_BODY + 'display:block;width:100%;height:100%;">',
                '</iframe>',
                '</div>'
            ].join('');

            if (!this.evalDialog) {
                this.evalDialog = new $.DialogChat(html, {
                    margin: 0,
                    border: 0,
                    parent: this.contains,
                    style: {
                        height: $(window).height() + 'px'
                    }
                });
            }
            dialogElement = this.evalDialog.container;

            /*
            //查看聊天记录需要自适应，关闭时，清除自适应
            funcResizeDialog = function(event){
            	self._resizeDialog(event);
            };
            */
            dialogElement.find('.alert-header-back,.alert-body-back').tap(function(event) {
                $(window).removeEvent('resize', funcResizeDialog);

                self.evalDialog.close();
                self.evalDialog = null;
            });

            $(window).bind('resize', funcResizeDialog);

            if (showView) {
                this.mode.viewHistory(this.settingid, this.contains.find('.chat-view-float-iframe').get(0));
            }

            //关闭附加功能接钮区
            this._showActionList();
        },
        /**
         * 评价
         * @return {[type]}
         */
        _evaluate: function() {
            if (!this.mode.showEvaluation) {
                return;
            }
            this.mode.showEvaluation();
        },
        /**
         * 开始截图
         * @return {[type]}
         */
        _capture: function() {
            if (!this.mode.startCapture) {
                return;
            }
            this.mode.startCapture(this.settingid);
        },
        /**
         * @method _switchManual 转人工客服
         */
        _switchManual: function() {
            if (!this.mode.switchServerType) {
                return;
            }

            this.mode.switchServerType(true, this.settingid);
        },
        /**
         * @method _changeCsr 更换客服
         */
        _changeCsr: function() {
            if (!this.mode.changeCustomerServiceInfo) {
                return;
            }
            this.mode.changeCustomerServiceInfo();
        },
        /**
         * 展开或收缩侧边栏
         * @param {event} event
         * @return {void}
         */
        _expansion: function(event) {

            this.options.toggleExpansion(this.settingid);
        },
        updateMore: function(extend) {

            this.chatElement.find('.chat-view-exp').html($.lang.button_more + (extend ? ' &lt;' : ' &gt;'));
        },
        /**
         * @method switchToolbar 工具条效果转换，人工客服工具条与机器人工具条
         * @param {boolean} 是否转换为人工客服工具条
         * @param {string}  source       来源
         */
        switchToolbar: function(manual, source) {
            $.Log('nTalk.chat.view.switchToolbar(' + manual + ')');
            if (manual) {
                this.bottomElement.find('.chat-view-textarea').css({
                    'padding-right': '0px',
                    'margin-left': ($.Audio && $.Audio.support() && this.mode.config.enable_audio == 1) ? '45px' : '5px',
                    //2016.02.23新增textaea的距离
                    'margin-right': '105px'
                });
                this.bottomElement.find('.chat-view-button-send').css('padding', '0 5px');
                this.bottomElement.find(".chat-view-button-face").display(1);
                this.bottomElement.find('.chat-view-button-audio').display((this.mode.config.enable_audio == 1));
                //2016.02.19 下面两个上下变换位置

                this.bottomElement.find('.chat-view-switch-manual').display();
                this.bottomElement.find('.chat-view-button-action').display(1);


                /*2016.09.17判断是否事机器人2.0*/
                if (this.mode.config.robot_version == 2) {
                    this.bottomElement.find('.chat-view-button-audio').css('left', '5px');
                    this.bottomElement.find('.chat-view-window-audio').find('.chat-audioInput').parent().css('margin-left', '45px');
                    this.bottomElement.find('.chat-view-window-audio').find('.chat-view-button-text').css('left', '5px');
                }
            } else {
                this.bottomElement.find('.chat-view-textarea').css({
                    'padding-right': '15px',
                    'margin-left': '5px',
                    //2016.02.19新增textaea的距离
                    'margin-right': '50px'
                });
                this.bottomElement.find('.chat-view-button-send').css('padding', '0 5px');
                this.bottomElement.find(".chat-view-button-face,.chat-view-button-audio").display();
                //2016.02.19添加隐藏加号
                this.bottomElement.find('.chat-view-button-action').display();
                this.bottomElement.find('.chat-view-switch-manual').display(1);

                // if( this.mode._sendNum === 0 ){
                //     $.Log("disable manual button: sendNum:" + this.mode._sendNum, 2);
                //     //2016.02.04 机器人会话时，转人工按钮初始不可用，当用户发送消息后再转为可用
                //     this.disableButton("manual", true);
                // }
                /*
                if( /OFFLINE|BUSY/i.test(source) ){
                	//由客服忙碌、离线转向机器人客服时，不能再转向人工客服
                	this.disableButton('manual', true);
                }
                */
                if (this.mode.config.robot_version == 2) {
                    this.bottomElement.find('.chat-view-button-face').display(1);
                    this.bottomElement.find('.chat-view-button-action').display(1);
                    this.bottomElement.find('.chat-view-switch-manual').display(1);
                    this.bottomElement.find('.chat-view-textarea').css({
                        'padding-right': '15px',
                        'margin-left': '45px',
                        //2016.02.19新增textaea的距离
                        'margin-right': '95px'
                    });
                }
            }
        },
        /**
         * 发送消息
         * @return {void}
         */
        _send: function() {
            if (/QUERY|QUEUE/i.test(this.mode.statusConnectT2D)) {
                return false;
            }
            var textContent = this._clearEditor();
            if (textContent.length && textContent != $.lang.default_textarea_text) {
                this.mode.send(textContent);

                // $.Log("enable manual button: sendNum:" + this.mode._sendNum, 2);
                // //2016.02.04 机器人会话时，转人工按钮初始不可用，当用户发送消息后再转为可用
                // this.disableButton("manual", false);
            }
        },
        _endSession: function() {
            this.mode.endSession();
        },
        _clearEditor: function() {
            var textContent = this.textEditor.val().replace(/(^\s*)|(\s*$)/g, "");
            //2016.04.27 修改高度值
            this.textEditor.val('').css('height', '17px');
            this.sendButton.display();
            return textContent;
        },
        _resizeDialog: function() {
            $.Log('nTalk._resizeDialog()', 2);
            this.contains.find('.ntkf-alert-container').css({
                width: $(window).width() + 'px',
                height: $(window).height() + 'px'
            });
        },
        /**
         * 加载客服头像,绑定查看客服信息事件
         * @param	HTMLDom		parentElement
         * @param	String		userid
         * @return
         * debug
         */
        setDescIcon: function(parentElement, userid) {
            var self = this,
                attr, dest = this.mode.hashDest.items(userid);

            if (parentElement.find('.view-history-icon-div').attr('data-userid') || $.base.checkID(userid) !== $.CON_CUSTOMER_ID) {
                //非客服头像不更新
                return;
            }
            //bind event2016.04.22 注释该事件
            /*parentElement.find('.view-history-icon-div').attr('data-userid', userid).click(function(event) {
                var alertElement = self.showDestInfo(userid || $(this).attr('data-userid'));

                //self.mode.manageMode.view.updataSkin(self.mode.config.backgroundImage, self.mode.config.startColor, self.mode.config.endColor, alertElement.find('.alert-header'));
            });*/

            if (!dest || this.mode.isVisitor(userid) || !dest.logo) {
                // 无历史消息客户信息,头像任然显示
                //2016-04-28 hashDest已收集当前会话所有客服信息
                // parentElement.find('.view-history-icon-div .view-history-receive-icon').remove();
            } else {
                var icon = parentElement.find('.view-history-icon-div .view-history-receive-icon');

                if (icon.attr("src") == dest.logo) {
                    return;
                }
                $.require(dest.logo + '#image', function(image) {
                    if (image.error !== true) {
                        attr = $.zoom(image, 35, 35);
                        if (!icon.length) {
                            icon = $({
                                tag: 'img',
                                className: 'view-history-receive-icon',
                                src: $.sourceURI + 'images/blank.gif',
                                style: $.STYLE_NBODY
                            }).appendTo(parentElement.find('.view-history-icon-div'));
                        }
                        icon.attr({
                            width: attr.width || 35,
                            height: attr.height || 35,
                            src: dest.logo
                        }).css({
                            width: (attr.width || 35) + 'px',
                            height: (attr.height || 35) + 'px'
                        }).parent().css('background', '');
                    } else {
                        parentElement.find('.view-history-icon-div .view-history-receive-icon').remove();
                    }
                });
            }
        },
        /**
         * @method callChatResize 会话窗口resize
         * @return {void}
         */
        callChatResize: function(width, height) {
            //this.chatHistory.css('height', 'auto');
            //在教育版的过程中发现聊窗关闭但是this.contains 的dom已经销毁但是this.contains的值还没有变为空
            if ($('.' + this.contains.get(0).className).length == 0) {
                return;
            }
            this.contains.find('.ntkf-alert-iframe,.ntkf-alert-background,.chat-view-load').css('height', (height - 95) + 'px');
            this.contains.find('.chat-view-message').css('height', (height - 115) + 'px');
            $('.ntkf-alert-container,.ntkf-alert-background,.ntkf-alert-iframe,.chat-view-float-history').css('height', height + 'px');
            //查看聊天记录
            $('.chat-view-float-history iframe').css('height', (height - 45) + 'px');
        },

        /**
         * 更改排队样式
         */
        changeQueueStyle: function() {
            $('.chat-view-queue-num').parent().css('font-size', '12px');
            $('.chat-view-queue-num').css({
                'color': '#E97D3A',
                'font-size': '12px'
            });
            $('.chat-view-queue-num').parent().find('a').css('color', '#1F99E2');
        },


        /**
         * audio view 回调
         * @param {Object} msgid 消息id
         * @param {Object} type 需要回调type (init|play|stop)
         */
        audioView: function(type) {
            /*
             * 如果没有传递msgid且musicEl存在，改变musicEl的状态
             */
            if (!this.msgid && $.musicEl) {
                $.musicEl.emit();
                $.musicEl = null;
                return;
            }

            var self = this;
            var img, msgid = self.msgid;
            var duration = self.duration;
            var bodyEl = $('.' + msgid).find('.view-history-body');
            var kf = msgid.toLowerCase().indexOf("j") > -1 ? false : true;
            var pngArs, gifArs, bgColor, borderColor, align;
            if (kf) {
                pngArs = $.sourceURI + 'images/kfSound.png';
                gifArs = $.sourceURI + 'images/kfSound.gif';
                bgColor = '#FFFFFF';
                align = 'right';
                durationAlign = 'left';
            } else {
                pngArs = $.sourceURI + 'images/mySound.png';
                gifArs = $.sourceURI + 'images/mySound.gif';
                bgColor = '#CEF2FF';
                align = 'left';
                durationAlign = 'right';
            }

            switch (type) {
                case "init":
                    $.Log('[nTalk music]: mp3 view init, msgid is ' + msgid);
                    if (bodyEl.find('.duration_' + msgid).length > 0) {
                        $('.duration_' + msgid).innerHTML = duration + '\'\'';
                    } else {
                        var html = ['<div id="duration_', msgid, '" style="', $.STYLE_BODY, 'height:24px;line-height:24px;padding:4px 4px 0px;float:', durationAlign, '" >', duration, '\'\'</div>',
                            '<div id="player_', msgid, '" style="', $.STYLE_BODY, ' width:80px;height:24px;padding:4px 0;background:', bgColor, ';border-radius:5px;border:none;text-align:', align, '">',
                            '<img width="24px" height="24px" src="', pngArs, '"/>',
                            '</div>'
                        ].join("");
                        bodyEl.css('padding', '0px');
                        bodyEl.append(html);
                    }
                    break;
                case "play":
                    $.Log('[nTalk music]: mp3 view play, msgid is ' + msgid);
                    if ($.musicEl) {
                        $.Log('[nTalk music]: stop playing mp3 view, msgid is ' + $.playMsgid, 2);
                        $.musicEl.emit();
                    }
                    $.musicEl = self;
                    img = $('#player_' + msgid + ' img')[0];
                    img.src = img.src.replace("png", "gif");
                    break;
                case "stop":
                    $.Log('[nTalk music]: mp3 view stop, msgid is ' + msgid);
                    $.musicEl = null;
                    img = $('#player_' + msgid + ' img')[0];
                    img.src = img.src.replace("gif", "png");
                    break;
            }
        },

        /**
         *
         * @param {Object} msgid
         */
        audioBindEvent: function(type) {
            var msgid = this.msgid;
            switch (type) {
                case "init":
                    $.Log('[nTalk music]: mp3 event init, msgid is ' + msgid);
                    var self = this;
                    var player = $('#player_' + msgid);
                    player.click(function() {
                        $.Log('[nTalk music]: mp3 trigger click, msgid is ' + msgid);
                        self.emit();
                    });
                    break;
            }
        },

        starLevel: function() {
            return;
        }
    };
    /**
     * 自动弹出的WAP教育版窗口
     */
    var eduWapAutoView = $.Class.create();
    eduWapAutoView.prototype = {
        fontSize: 1,
        settingid: '',
        count: 0,
        initialize: function(settingid) {
            this.settingid = settingid;
            this._createView();
            this._bind();
            $.autoEduShow = 'complete';
        },
        /**
         * 创建视图
         */
        _createView: function() {
            /*---- 此处为消息区域的元素，默认不展示，接收到消息后再展示 ----*/
            //自动弹出的消息区域
            this.wapAutoChat = $({
                tag: 'div',
                className: 'nTalk-window-eduWapAuto',
                style: 'display:none;width:94%;height:' + (106 * this.fontSize) + 'px;background:-webkit-gradient(linear,center top,center bottom,from(#ffffff), to(#ffffff));position:fixed;left:3%;bottom:' + (75 * this.fontSize) + 'px;box-sizing:border-box;padding:' + (10 * this.fontSize) + 'px ' + (10 * this.fontSize) + 'px;box-shadow:0 0 ' + (10 * this.fontSize) + 'px ' + (2 * this.fontSize) + 'px #bababa;z-index:10000;border-radius:' + (3 * this.fontSize) + 'px;'
            }).appendTo(true);
            //消息区域的尖角
            this.wapAutoChatAngle = $({
                tag: 'div',
                className: 'nTalk-window-wapAuto-angle',
                style: 'width:0;height:0;border:' + (20 * this.fontSize) + 'px solid #fff;position:absolute;bottom:-' + (20 * this.fontSize) + 'px;right:' + (10 * this.fontSize) + 'px;border-top:' + (10 * this.fontSize) + 'px solid #fff;border-left:' + (5 * this.fontSize) + 'px solid transparent;border-right:' + (5 * this.fontSize) + 'px solid transparent;border-bottom:' + (10 * this.fontSize) + 'px solid transparent;'
            }).appendTo(this.wapAutoChat);
            //消息区域的客服logo
            this.wapAutoChatHeader = $({
                tag: 'div',
                className: 'nTalk-window-wapAuto-logo',
                style: 'width:100%;height:' + (24 * this.fontSize) + 'px;background:transparent;float:left;'
            }).appendTo(this.wapAutoChat);
            //头部的logo
            this.headerLogo = $({
                tag: 'img',
                className: 'nTalk-window-wapAuto-logo-header',
                style: 'width:' + (24 * this.fontSize) + 'px;height:' + (24 * this.fontSize) + 'px;border:none;overflow:hidden;border-radius:100%;float:left;',
                src: $.sourceURI + 'images/blank.gif'
            }).appendTo(this.wapAutoChatHeader);
            //头部的客服名称
            this.headerName = $({
                tag: 'div',
                className: 'nTalk-window-offLine-logo-name',
                style: 'width:auto;float:left;overflow:hidden;font-size:' + (16 * this.fontSize) + 'px;margin-top:' + (2 * this.fontSize) + 'px;margin-left:' + (5 * this.fontSize) + 'px;font-weight:blod;background:transparent;color:#2c2c2c;'
            }).appendTo(this.wapAutoChatHeader);
            //头部的关闭按钮
            this.headerClose = $({
                tag: 'div',
                className: 'nTalk-window-wapAuto-logo-close',
                style: 'width:' + (12 * this.fontSize) + 'px;height:' + (12 * this.fontSize) + 'px;float:right;overflow:hidden;background:url(' + $.sourceURI + 'images/close.png) no-repeat;background-size:100%;margin-right:0px;margin-top:0px;'
            }).appendTo(this.wapAutoChatHeader);
            //消息的wrapper
            this.wapAutoChatMessageWrapper = $({
                tag: 'div',
                className: 'nTalk-window-wapAuto-container',
                style: 'width:100%;height:' + (30 * this.fontSize) + 'px;margin-top:' + (30 * this.fontSize) + 'px;flot:left;positon:relative;background:transparent;'
            }).appendTo(this.wapAutoChat);
            //展示消息
            this.wapAutoChatMessage = $({
                tag: 'div',
                className: 'nTalk-window-wapAuto-message',
                style: 'width:100%;height:' + (48 * this.fontSize) + 'px;font-size:' + (16 * this.fontSize) + 'px;line-height:' + (24 * this.fontSize) + 'px;margin:0;padding:0 ;color:#2c2c2c;overflow:hidden;display:block;display: -webkit-box;-webkit-box-orient: vertical;text-overflow: ellipsis;-webkit-line-clamp: 2;word-break:break-all;box-sizing:border-box;'
            }).appendTo(this.wapAutoChatMessageWrapper);

            // ------------------------- 华丽的分割线 --------------------------//

            /*---- 此处为底部打开聊窗的元素，默认显示 ----*/
            // 底部定位，居底蓝条
            this.wapAutoChatBottom = $({
                tag: 'div',
                className: 'nTalk-window-wapAuto-bottom',
                style: 'width:100%;height:' + (38 * this.fontSize) + 'px;position:fixed;bottom:0;left:0;background:#007aff;text-align:center;justify-content:center;display:flex;padding:0;margin:0;z-index:10000;'
            }).appendTo(true);
            // 来和我聊天吧，文字提示
            this.offineChatBottomMsg = $({
                tag: 'span',
                style: 'font-size:' + (16 * this.fontSize) + 'px;line-height:' + (38 * this.fontSize) + 'px;color:#fff;display:inline-block;height:100%;vertical-align: middle;background:url(' + $.sourceURI + 'images/inviteidicon.png) no-repeat 0 ' + (13 * this.fontSize) + 'px;background-size:' + (17 * this.fontSize) + 'px ' + (16 * this.fontSize) + 'px;padding-left:' + (20 * this.fontSize) + 'px;'
            }).appendTo(this.wapAutoChatBottom).html('来和我聊天吧');
            // 未读消息数量，默认不显示
            this.wapAutoChatCount = $({
                tag: 'div',
                className: 'nTalk-window-wapAuto-count',
                style: 'display:none;width:' + (20 * this.fontSize) + 'px;height:' + (20 * this.fontSize) + 'px;position:absolute;right:' + (10 * this.fontSize) + 'px;top:-' + (10 * this.fontSize) + 'px;font-size:' + (12 * this.fontSize) + 'px;line-height:' + (20 * this.fontSize) + 'px;background:#ff3b30;color:#fff;text-align:center;border-radius:100%;'
            }).appendTo(this.wapAutoChatBottom);
        },
        /**
         * 更新客服信息
         */
        update: function(destinfo) {
            if (destinfo && destinfo.logo) {
                if (this.headerLogo.attr('src') != destinfo.logo) {
                    this.headerLogo.attr('src', destinfo.logo);
                }
            }
            if (destinfo && destinfo.name) {
                this.headerName.html(destinfo.name);
            }
        },
        /**
         * 展示消息
         */
        showMessage: function(message) {
            if (!message) return;

            // 更新客服信息
            this.update(message);

            var msg = this._getMessageContent(message)
            if (msg) {
                this.wapAutoChat.css('display', 'block');
                this.wapAutoChatBottom.css('display', 'flex');
                this.wapAutoChatMessage.html(msg);
                this.wapAutoChatCount.css('display', 'block').html(this.count = this.count + 1);
            }
        },
        clear: function() {
            //隐藏消息区域
            this.wapAutoChat.display(0);
            //将未读消息清空
            this.wapAutoChatCount.display(self.count = 0);
        },
        /**
         * 获取消息内容
         */
        _getMessageContent: function(message) {
            if (!message) return '';
            switch(message.type) {
                case '1':
                    return message.msg;
                case '2':
                    return '收到一条图片消息';
                case '4':
                    return '收到一条文件消息';
                case '6':
                    return '收到一条语音消息';
                default:
                    return '';
            }
        },
        // 绑定事件
        _bind: function() {
            var self = this;
            var openChat = function() {
                //此处缺少展示聊窗的方法
                $._showMobileInPageWindow();
                //隐藏消息区域
                self.wapAutoChat.display(0);
                //将未读消息清空
                self.wapAutoChatCount.display(self.count = 0);
            }
            this.wapAutoChat.bind('click', openChat);
            this.wapAutoChatBottom.bind('click', openChat);
            this.headerClose.bind('click', function (event) {
                var event = $.Event.fixEvent(event);
                event.preventDefault();
                event.stopPropagation();
                self.wapAutoChat.display(0);
                self.wapAutoChatCount.display(1);
                try {
                    $.chatManage.view._callEndSession(true, false);
                    $.chatManage.closeChat(self.settingid);
                } catch (e) {
                    $.Log('edu chat is already end');
                }
            });
        }
    };
    /** ====================================================================================================================================================
     * 最小化窗体状态条
     * @type {class}
     */
    var minimizeView = $.Class.create();
    minimizeView.prototype = {
        element: null,
        title: '',
        status: 0,
        count: 0,
        initialize: function(dest, isMessageView, callback) {},
        /**
         * @method online 更改为在线状态
         * @return {void}
         */
        online: function() {},
        /**
         * @method offline 更改为离线状态
         * @return {void}
         */
        offline: function() {},
        /**
         * @method update 更新状态条信息
         * @return {void}
         */
        update: function(name, logo) {},
        /**
         * @method remove 关闭状态条
         * @return {void}
         */
        remove: function() {},
        /**
         * @method startFlicker 收到消息时，开始闪烁
         * @param  {boolean} highlight
         * @param  {number}  count
         * @return {void}
         */
        startFlicker: function(highlight, count) {},
        /**
         * @method stopFlicker 终止闪烁
         * @param  {boolean}   startNewFlicker 开始新闪烁时终止
         * @return {void}
         */
        stopFlicker: function(startNewFlicker) {}
    };
    /** ====================================================================================================================================================
     * [chatManageView description]
     * @type {[type]}
     */
    var chatManageView = $.Class.create();
    chatManageView.prototype = {
        name: 'chatManageView',
        _manageMode: null,
        //当前窗体标识、标题
        tagKey: '',
        tagTitle: '',
        extended: null,
        options: null,
        header: null,
        body: null,
        leftContent: null,
        leftElement: null,
        chatBody: null,
        chatContainter: null,
        rightElement: null,

        chatWidth: 0,
        chatHeight: 0,

        initialize: function(options, manageMode, nTheme) {
            this.options = $.extend({}, this.defaultOptions, options);

            this._manageMode = manageMode;

            this.extended = {
                rightElement: false,
                leftElement: false
            };

            //2016.04.18
            if (nTheme) {
                //newWapTheme.title=nTheme.title ? nTheme.title : newWapTheme.title;
                newWapTheme.return_style = nTheme.return_style ? nTheme.return_style : newWapTheme.return_style;
                newWapTheme.return_color = nTheme.return_color ? nTheme.return_color : newWapTheme.return_color;
                newWapTheme.close_style = nTheme.close_style ? nTheme.close_style : newWapTheme.close_style;
                newWapTheme.close_color = nTheme.close_color ? nTheme.close_color : newWapTheme.close_color;
                // newWapTheme.titlename=nTheme.titlename?nTheme.titlename:newWapTheme.titlename;
                newWapTheme.background = nTheme.background ? nTheme.background : newWapTheme.background;
                newWapTheme.bubble = nTheme.bubble ? nTheme.bubble : newWapTheme.bubble;
                newWapTheme.bubble_text = nTheme.bubble_text ? nTheme.bubble_text : newWapTheme.bubble_text;
                newWapTheme.timestamp = nTheme.timestamp ? nTheme.timestamp : newWapTheme.timestamp;
            }

            this._create();
        },
        close: function() {
            return;
        },
        /**
         * 添加标签
         * @param {[type]} key
         */
        addChatTag: function(key) {
            return;
        },
        /**
         * 移除标签
         * @param  {[type]} key
         * @return {[type]}
         */
        removeChatTag: function(key) {
            return;
        },
        /*
         *2017.04.01
         *更新电话信息教育版
         *
         */
        setPhoneNumber: function(data) {
            if (isEdu) {
                this.header.find('.chat-view-window-header-iphone a').attr('href', 'tel:' + data).css('display', 'block');
            }
        },
        /**
         * 更新当前聊窗状态\客服信息
         * @param  {string} key
         * @param  {json}   data
         * @return
         */
        updateChatTag: function(key, data) {
            var chat;
            if (data.logo == $.CON_MULTIPLAYER_SESSION) {
                //多人会话
                data.logo = '';
            }

            if (isEdu) {
                this.headName.html(data.title || data.name).css({
                    top: (data.sign ? '6px' : '16px')
                });
                this.headSign.html(data.sign || "");
            } else {
                this.header.find('.chat-view-window-header-title').html(data.title || data.name);
            }

            //for mobile: 加载客服头像
            chat = this._manageMode.get();
            if (chat && $('.welcome').length && $.base.checkID(data.id) == $.CON_CUSTOMER_ID) {
                chat.view.setDescIcon($('.welcome'), data.id);
            }

            return;
        },
        /**
         * 切换标签
         * @param  {[type]} settingid
         * @return {[type]}
         */
        switchChatTag: function(settingid) {},
        /**
         * 展开或收缩左或右侧边栏
         * @param  {string} attr leftElement|rightElement
         * @param  {boolen} extend
         * @return {boolean}
         */
        toggleExpansion: function(attr, extend) {},
        /**
         * 更新聊窗当前侧边栏数据
         * @param  {string} settingid
         * @param  {array}  data
         * @return {[type]}
         */
        updateRightData: function(settingid, data) {
            return;
        },
        /**
         * @method updataSkin 更新聊窗皮肤
         * @param  {string} backgroundImage
         * @param  {string} startColor
         * @param  {string} endColor
         * @return {void}
         */
        updataSkin: function(backgroundImage, startColor, endColor, element) {
            /*            var colorExp = /^#[0-9a-f]{6}$/i;

                        element = element || this.header;
                        if (startColor == endColor) {
                            //自定义皮肤
                            if (colorExp.test(startColor)) {
                                //背景颜色
                                var hsl = $.toHSL(startColor).l;
                                element.css({
                                    'background': startColor,
                                    'color': hsl < 0.75 ? '#fff' : '#525252'
                                });
                            } else {
                                //背景图片
                                element.css({
                                    'background': 'url(' + startColor + ') repeat'
                                });
                            }
                        } else {
                            //默认皮肤
                            element.gradient("top", startColor, endColor);
                        }*/
            return false;
            /*
            if( colorExp.test(backgroundImage) ){

            }else if( backgroundImage ){

            }
            */
        },
        /**
         * @method updateViewStatus 更新ManageView状态效果
         * @param  {boolean} status
         * @return {void}
         */
        updateViewStatus: function(status) {
            var btnClose = this.header.find('.chat-view-window-header-close');

            //2015.09.19 处于查看网页状态时，不切换按钮状态
            if (btnClose.html() == 'X') {
                return;
            }

            btnClose.attr('status', status === true ? 'start' : 'end').html(status === true ? $.lang.button_start_session : $.lang.button_end_session);
        },
        /**
         * @method _callEndSession 移动设备转用会话结束
         * @param {Boolean} validation
         * @param {num}  1表示back,2表示close
         * @return {void}
         */
        _callEndSession: function(validation, isHideWindow, type) {
            var self = this,
                chat = this._manageMode.get(),
                closeChatManage = function() {
                    if (isHideWindow && $.params.iframechat == "1") {
                        setTimeout(function() {
                            $.postMessage(window.parent, $.JSON.toJSONString({
                                funcName: "",
                                destinfo: self._manageMode.get().dest
                            }), "*");
                            $.postMessage(window.parent, "closeMobileIframeWindow", "*");
                            if (type == 1) {
                                $.postMessage(window.parent, "backMobileIframeWindowCallBacks", "*");
                            } else {
                                $.postMessage(window.parent, "closeMobileIframeWindowCallbacks", "*");
                            }
                        }, 200);
                        $.mobileShow = false;
                        return;
                    }

                    if (chat && chat.eduWapAutoView) {
                        chat.eduWapAutoView.clear();
                    }

                    if (isHideWindow && $.mobileOpenInChat) {
                        setTimeout(function() {
                            $._hideMobileInPageWindow();
                        }, 200);
                        return;
                    }
                    self.updateViewStatus(true);
                    chat.statusConnectTChat = 'CLOSECHAT';
                    chat.statusConnectT2D = 'WAIT';
                    chat.disconnect();

                    chat._stopQueue();

                    //2015.11.19 打开聊窗时可以通过参数控制是否显示返回按钮
                    if ($.params["return"] == "0" || $.params.header == "0") {
                        return;
                    }

                    setTimeout(function() {
                        if ($.params.iframechat == "1") {
                            //添加页内打开WAP聊窗关闭支持
                            $.postMessage(window.parent, "closeMobileIframeWindow", "*");
                            if (type == 1) {
                                $.postMessage(window.parent, "backMobileIframeWindowCallBacks", "*");
                            } else {
                                $.postMessage(window.parent, "closeMobileIframeWindowCallbacks", "*");
                            }
                        } else if ($.mobileOpenInChat) {
                            $._closeMobileInPageWindow();
                            //教育版，移动端清除掉chatManage中的值
                            try {
                                self._manageMode.hash.hashIndex = [];
                                self._manageMode.hash.hashTable = new Object();
                            } catch (e) {

                            }

                        } else {
                            if ($.global.backURL) {
                                document.location = decodeURIComponent(nTalk.global.backURL);
                            } else {
                                history.go(-1);
                            }
                        }
                    }, 200);
                };

            if (validation && chat.config && !chat._submitRating && chat._currentView == chat.CON_VIEW_WINDOW && chat.config.enableevaluation == 1 && chat._Enableevaluation) {
                if (chat.showEvaluation(0, function() {
                        //评价完成后，关闭聊窗
                        closeChatManage();
                    }) === false) {
                    //已评价,取消评价，直接关闭聊窗
                    try {
                        closeChatManage();
                    } catch (e) {
                        $.Log(e, 3);
                    }
                }
            } else {
                closeChatManage();
            }
        },
        /**
         * 重新开始会话
         * @return {[type]}
         */
        _callStartSession: function() {
            var chat = this._manageMode.get();
            if (!$.browser.mobile) return;

            if (chat._currentView == chat.CON_VIEW_WINDOW) {
                this.updateViewStatus(false);
                chat.reconnect();
            } else {
                window.location.reload();
            }
        },
        /**
		 * 自动弹窗
		 */
		_callEduWapAutoView: function(){
			this._manageMode.callEduWapAutoView();
		},
        /**
         * 创建聊窗管理器视图界面
         * @return {[type]}
         */
        _create: function() {
            var return_color = newWapTheme.return_color;
            var return_style = newWapTheme.return_style;
            var close_color = newWapTheme.close_color;
            var close_style = newWapTheme.close_style;
            //2016.04.12 匹配图片还是颜色值
            var title = newWapTheme.title;

            var self = this,
                titleHtml = (!isEdu ? ['<div class="chat-view-window-header-title" style="', $.STYLE_BODY, 'display:none;color:#FFF;margin:0 85px;font-size:16px;font-weight:bold;text-align:center;line-height:55px;height:55px;overflow:hidden;"></div>'].join("") :
                    ['<div class="chat-view-window-header-title" style="', $.STYLE_BODY, 'display:block;color:#FFF;margin:0 18px;font-size:14px;font-weight:normal;text-align:left;line-height:55px;height:55px;overflow:hidden;"></div>'].join("")
                );

            var html = [
                '<div class="chat-view-window-header-message-title" style="', $.STYLE_BODY, 'display:none;color:#FFF;margin:0 85px;font-size:16px;text-align:center;line-height:55px;height:55px;overflow:hidden;"></div>',
                titleHtml,
                '<div class="chat-view-window-header-close" style="', $.STYLE_BODY, 'display:none;border-radius:3px;padding:0 8px;width:auto;height:29px;line-height:29px;position:absolute;right:10px;top:14px;border:1px solid #d4d4d4;cursor:pointer;background:none;font-size:16px;z-index:100">', $.lang.button_end_session, '</div>'
            ].join('');

            this.header = $({
                className: 'chat-view-window-header',
                style: $.STYLE_NBODY + 'background:' + (isEdu ? '#0589f3' : 'transparent') + ';width:99.9%;height:47px;border-bottom:0px solid #5F6467;position:fixed;left:0;top:' + ((isEdu && ($.browser.weibo || $.browser.micromessenger)) ? '10%' : '0') + ';z-index:1000000000;'
            }).appendTo($.mobileOpenInChat ? $('.ntalk-mobile-inpage-window') : true).html(html).fixed({
                width: '100%',
                left: '0px',
                top: '0px'
            });

            this.headName = $({tag: 'span', className:'chat-header-name', style: $.STYLE_BODY + 'position:absolute;top:16px;left:18px;font-size:14px;color:#fff'}).appendTo(this.header).html('');
			this.headSign = $({tag: 'span', className:'chat-header-sign', style: $.STYLE_BODY + 'position:absolute;top:26px;left:18px;font-size:14px;color:#fff'}).appendTo(this.header);

            if (isEdu) {
                this.header.css('height', '55px');
                $('.chat-view-window-history') && $('.chat-view-window-history').css('padding-top', '50px');
            }

            //2016.04.06 添加字段
            var return_close_style_css = 'line-height:20px;height:20px;width:20px;text-align:center;text-align:center;font-size:20px;font-family:iconfont;opacity:1;z-index:10;padding:6px 5px 4px 5px;';
            var backButtonHtml = [
                '<div class="chat-view-window-header-back" style="position: absolute; width:30px; height:30px; z-index:50; border-radius:' + (isEdu ? '0' : '15px') + '; ' + (isEdu ? 'right: 15px;' : 'left: 15px;') + 'top: 12px">',
                //2016.04.7更改成为符号
                '<div style="width:30px;height:30px;border-radius:50%;background-color:' + (isEdu ? 'transparent' : '#FFF') + ';opacity:0.7;">',
                isEdu ? '<div style="width:30px;height:30px;background:url(' + $.sourceURI + 'images/mobile/back_wap.png) no-repeat 6px 12px;background-size:15px 8px;"></div>' : '<div style="' + return_close_style_css + 'opacity:1;z-index:10;color:' + return_color + '">' + return_style + '</div>',
                '</div></div>'
            ].join("");
            /* '<svg width="32" height="32">',
                 '<circle cx="16" cy="16" r="15" fill="#FFF" style="fill-opacity:0.7"></circle>',
                 '<polyline points="20,8 10,16 20,24" style="stroke:'+return_color+';stroke-width:1.5;fill:#FFF;fill-opacity:0.7"/>',
             '</svg></div>'].join("");*/


            var closeButtonHtml = [
                "<div class='chat-view-window-header-ev-close' style='position: absolute; width:30px; height:30px; z-index:50; border-radius:" + (isEdu ? '0' : '15px') + "; right: 15px; top: 12px;display:none;'>",
                //2016.04.7
                '<div style="width:30px;height:30px;border-radius:50%;background-color:' + (isEdu ? 'transparent' : '#FFF') + ';opacity:0.7;">',
                isEdu ? '<div style="width:30px;height:30px;background:url(' + $.sourceURI + 'images/mobile/close_wap.png) no-repeat 0 7px;background-size:15px;"></div>' : '<div style="' + return_close_style_css + 'opacity:1;z-index:10;color:' + close_color + '">' + close_style + '</div>',
                '</div></div>'
            ].join("");
            //2017教育版加入打电话功能
            var iphoneButtonHtml = [
                '<div class="chat-view-window-header-iphone" style="position:absolute;width:30px;height:30px;z-index:50;right:60px;top:15px;display:block;overflow:hidden;">',
                ' <a href="" style="display:none;"><img width="25" height="25" src="' + $.sourceURI + 'images/mobile/phone_wap.png" style="border:none;outline:none;"/></a>',
                '</div>'
            ].join('');


            this.header.append(backButtonHtml).append(closeButtonHtml).append(iphoneButtonHtml);

            this.header.find('.chat-view-window-header-close').attr('status', 'end').gradient('top', '#ededed', '#ffffff');
            this.header.find('.chat-view-window-header-back').tap(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                if (/QUERY|QUEUE/i.test(self._manageMode.chat.statusConnectT2D) && $('.chat-view-message')[0].style.display == 'none') {
                    self._manageMode.chat.view.createGiveupQueue();
                    return;
                }
                //window.history.go(self._manageMode.getHistoryPageCount());
                //2015.12.28 移动端页内打开时，_callEndSession的第二参数传递为true
                if ($.params.iframechat == "1" || $.mobileOpenInChat) {
                    self._callEndSession(isEdu ? true : false, true, 1);
                } else {
                    self._callEndSession(false);
                }

            });
            this.header.find('.chat-view-window-header-ev-close').tap(function(event) {
                $.Event.fixEvent(event).stopPropagation();
                self._callEndSession(true, false);
            });

            //2015.11.19 打开聊窗时可以通过参数控制是否显示返回按钮
            if ($.params["return"] == '0' || $.params.header == "0") {
                this.header.find('.chat-view-window-header-back').display();
            }
        }
    };
    //2016.04.14
    //view 导出
    if (typeof $.ntView === "undefined") {
        $.ntView = {
            "chatView": chatView,
            "minimizeView": minimizeView,
            "eduWapAutoView": eduWapAutoView,
            "chatManageView": chatManageView
        };
    }
})(nTalk);
