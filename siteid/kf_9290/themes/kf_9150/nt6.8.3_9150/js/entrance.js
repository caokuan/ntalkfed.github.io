(function($, underfined){
    /*jshint scripturl:true*/
    var SCRIPT_URL = "javascript:void(0);";
    
    $.extend({
        isColor: function(color){
            if( /^#[0-9A-F]{6}$/i.test(color) ){
                return true;
            }
            else{
                return false;
            }
        },
        /**
         * @function 判断是否是图片地址或图片base64字符串
         * @param string data
         */
        isImage: function(data){
            var reBase64 = /data:image\/(.*);base64,/i;
            var reUrl    = /^http:\/\/.*?\/.*?\.(jpg|png|gif|jpeg|bmp)/i;
            if( reBase64.test(data) || reUrl.test(data) ){
                return true;
            }
            return false;
        },
        entrance: {
            __hash: new $.HASH(),
            /**
             * @function 入口、邀请
             * @param string type  入口类型[invite:邀请窗;entrance:咨询入口;]
             */
            start: function(type){
                var objEntrance, options;
                
                if( $.browser.mobile ){
                    if( type === "entrance" ){
                        options     = $.options && $.isDefined( $.options[type] ) ? $.options[type] : null;
                        objEntrance = new $.MobileEntrance(type, options);
                        objEntrance.show();
                        this.__hash.add(type, objEntrance);
                    }
                }else{
                    options     = $.options && $.isDefined( $.options[type] ) ? $.options[type] : null;
                    objEntrance = new $.Entrance(type, options);
                    objEntrance.show();
                    this.__hash.add(type, objEntrance);
                }
            },
            get: function(type){
                return this.__hash.contains(type) ? this.__hash.items(type) : null;
            },
            close: function(type){
                var objEntrance;
                if( type ){
                    objEntrance = this.__hash.items(type);
                    if(objEntrance) objEntrance.closeElement();
                }else{
                    this.__hash.each(function(type, objEntrance){
                        objEntrance.closeElement();
                    });
                }
            }
        },
        invite: {
            _close: function(){
                $.entrance.close("invite");
            }
        }
    });
    
    /**
     * @name Entrance
     * @type class
     * @desc PC页入口
     */
    $.Entrance = new $.Class.create();
    $.Entrance.prototype = {
        CON_GLOBAL:    1,
        CON_LI_NODE:   2,
        CON_A_LINK:    3,
        CON_ICON_NODE: 4,
        /**
         * @property 
         */
        debug: false,
        element: null,
        timeoutID: null,
        type: "",
        options: null,
        stopTimeoutComplete: false,
        showCount: 0,
        _default:{
            background: "",              //全局背景或颜色,图片可众向平铺[image|color]
            position: "center-center",   //九宫格定位
            width: 75,                  //入口宽度
            height: "auto",             //入口高度,支持auto\实际值
            xoff: 0,                    //入口偏移位置
            yoff: 0,                    //入口偏移位置
            isfixed: 0,                 //定位方式
            opacity: "",                //透明度
            childs:[]
        },
        fixPngSelector: [],
        /**
         * 入口、邀请共用模块
         */
        initialize: function(type, options){
            this.type    = type;
            this.options = $.extend({}, this._default, options);
            
            $.Log(this.type + ">$.Entrance.initialize()", 1);
            
            this.pretreatment();
        },
        show: function(){
            if( this.type == "entrance" ){
                this.createContainer();
            }
            else{
                this.where();
            }
        },
        /**
         * 按条件定时重新验证创建邀请框
         * @method where
         * @return void
         */
        where: function(){
            var timeout, self = this;
            
            if( !$.isDefined( this.options.where ) ){
                return;
            }
            //判断条件
            timeout = this.options.where.waittime;
            
            this.startTimeout(timeout*1000);
            
            this.startInterval();
        },
        startInterval: function(){
            var self = this;
            
            this.stopInterval();
                
            this.timeoutID = setInterval(function(){
                var chatCount = $.chatManage&&$.chatManage.hash ? $.chatManage.hash.count() : 0;
                
                if( self.debug ){
                    $.Log("ver create invite>chatCount:" + chatCount + ", inviteElement:" + self.element);
                }
                
                if( chatCount === 0 && !self.element && !self.createTimeID ){
                    
                    self.startTimeout(self.options.where.intervals*1000);
                }
            }, 1000);
        },
        startTimeout: function(time){
            var self = this;
            
            if( self.debug ){
                $.Log("$.Entrance.startTimeout(" + time + ")");
            }
            this.createTimeID = setTimeout(function(){
                clearTimeout(self.createTimeID);
                self.createTimeID = null;
                
                self.createContainer();
            }, time);
        },
        /**
         * @function 清除timeOut
         * @return void
         */
        stopInterval: function(){
            if( this.timeoutID ){
                clearInterval(this.timeoutID);
                this.timeoutID = null;
            }
        },
        /**
         * @function 预处理数据、图片
         * @return void
         */
        pretreatment: function(){
            var self = this, result = [],
                parentWidth = this.options.width,
                parentHeight= this.options.height,
                imageurl
            ;
            if( !$.isNumeric(parentHeight) || parentHeight == "0" ){
                //get global height
                parentHeight = 0;
                $.each(this.options.childs, function(i, child){
                    parentHeight += $.isNumeric(child.height) ? parseFloat(child.height) 
                        : $.isNumeric(child.effect.height) ? parseFloat(child.effect.height)
                        : 0;
                });
                this.options.height = parentHeight;
            }
            $.each(this.options.childs, function(i, child){
                var attr = ["width", "height"];
                
                $.each(attr, function(j, name){
                    //init effect width, height
                    if( /\d+%/i.test( child.effect[name] ) ){     // for *%
                        self.options.childs[i].effect[ name ] = (child[ name ] * parseFloat( child.effect[name] ) )/100;
                    }
                    else if( !$.isNumeric( child.effect[name] ) || child.effect[name] == "0"  ){// for "","auto",0
                        self.options.childs[i].effect[ name ] = child[ name ];
                    }
                });
                
                child.effect.pleft = child.xoff;
                child.effect.ptop  = child.yoff;
                //二维码图片预加载
                if( child.targettype == "image" || child.targettype == "img"){
                    imageurl = child.target;
                }
            });
            if( !imageurl ){
                return;
            }
/*            $.require(imageurl + "#image", function(image){
                self.imageWidth  = image.width;
                self.imageHeight = image.height;
            });*/
        },
        /**
         * @function 邀请框关闭处理函数
         * @param Boolean stop 关闭后是否允许重复激活邀请
         */
        closeElement: function(stop){
            var self = this, chat;
            
            stop = stop === true || this.stopTimeoutComplete ? true : false;

            if(this.element) this.element.hide(function(){
                if( self.element ){
                    self.element.remove();
                }
                self.element = null;
            });
            
            if( this.options.where.onlyone == 1 ){
                $.Log(this.type + ">onlyone: repeats > " + this.showCount + ", timeout > " + this.options.where.intervals);
                this.stopInterval();
                return;
            }
            else if( stop === true || this.showCount >= this.options.where.repeats ){
                this.stopTimeoutComplete = true;
                $.Log(this.type + ">stop: repeats > " + this.showCount + ", timeout > " + this.options.where.intervals);
                this.stopInterval();
                return;
            }
            else{
                $.Log(this.type + ">: repeats > " + this.showCount + ", timeout > " + this.options.where.intervals);
            }
        },
        /**
         * @function 创建主节点对像
         * @return void
         */
        createContainer: function(){
            var self  = this;
            var ulElement, opt, objectCss = this.getStyle(this.options, this.CON_GLOBAL);
            
            if( this.element ){
                return;
            }
            
            this.showCount++;
            
            $.Log(this.type + ">container " + $.JSON.toJSONString(objectCss));
            this.element = $({className: "ui-entrance-container ui-" + this.type, style: $.STYLE_NBODY + "z-index:99999;min-height:10px;"})
                .appendTo(true)
                .css( objectCss );
            
            ulElement = $({tag:"UL", className: "ui-entrance-ul", style: $.STYLE_NBODY + "list-style:none;"})
                .appendTo(this.element, true);
            
            $.each(this.options.childs, function(index, child){
                self.createElement(ulElement, index, child);
            });
            
            this.element.hover(function(event){
                event = $.Event.fixEvent(event);
                self.hoverElement(event, true);
            }, function(event){
                event = $.Event.fixEvent(event);
                self.hoverElement(event, false);
            }).click(function(event){
                event = $.Event.fixEvent(event);
                self.clickElement(event);
            });
            
            var resizeTimeID = null,
                __for_resize = function(event){
                    event = $.Event.fixEvent(event);
                    
                    clearTimeout(resizeTimeID);
                    resizeTimeID = setTimeout(function(){
                        self.resizeElement(event);
                    }, 200);
                };
            $.Event.addEvent(window, "resize", __for_resize, this.type);
            
            if( this.options.isfixed && this.element ){
                opt = this.getPosition(this.options, this.CON_GLOBAL, false);
                this.element.fixed( opt );
            }

            if( $('.ui-invite').length > 0 ) {
                $('.ui-invite').css('opacity', this.options.opacity/100);
            }
            /*
            setTimeout(function(){
                if( !DD_belatedPNG ){
                    return;
                }
                DD_belatedPNG.fix( ".ui-entrance-header,.ui-invite,.ui-button-close,.ui-invite .ui-entrance-button" );
            }, 0);
            */
        },
        /**
         * @function 创建各类型按钮
         * @param DOMElement ul     父级节点对像
         * @param Number     index  索引值
         * @param Object     child  配置参数
         * @return DOMElement
         */
        createElement: function(ul, index, child){
            var typeClass   = "ui-entrance-" + child.type;
            var targetClass = "ui-button-" + child.targettype;
            var cssText     = child.type === "separator" ? $.STYLE_NBODY : $.STYLE_BODY;
            var liElement,aElement, objectCss = this.getStyle(child, this.CON_LI_NODE);
            
            if( this.debug ){
                $.Log(this.type + ">" + targetClass + ">LI " + $.JSON.toJSONString(objectCss));
            }
            liElement = $({tag:"LI", className:typeClass + " " + targetClass, style: $.STYLE_NBODY + "list-style:none;" })
                .appendTo(ul)
                .attr("data-index", index)
                .css( objectCss );
            
            objectCss = this.getStyle(child, this.CON_A_LINK);
            
            if( this.debug ){
                $.Log(this.type + ">" + targetClass + ">A " + $.JSON.toJSONString(objectCss));
            }
            aElement  = $({tag: "A", href: SCRIPT_URL, style: cssText + "display:inline-block;color:#fff;"})
                .appendTo(liElement)
                .css( objectCss );
            
            $({className: "ui-entrance-hover-show", style: cssText + "position:absolute;display:none;left:0px;top:0px;"})
                .appendTo(aElement)
                .css("left", child.width + "px")
                .html( (child.targettype == "image" || child.targettype == "img") ? '<img src="' + child.target + '" style="' + cssText + '" />' : "" );
            
            objectCss = this.getStyle(child, this.CON_ICON_NODE);
            
            if( this.debug ){
                $.Log(this.type + ">" + targetClass + ">div.icon " + $.JSON.toJSONString(objectCss));
            }
            $({className: "ui-button-icon", style: cssText + "display:block;cursor:pointer;color:#fff;text-align:center;text-decoration:none;"})
                .appendTo(aElement)
                .css( objectCss )
                .html( !$.isImage( child.content ) ? child.content : "" );
            
            //$({tag: "SPAN", className: "ui-button-text", style: cssText}).appendTo(aElement);
            
            //超连接采用标准方式打开，其它类型采用事件监听方式处理
            if( child.targettype === "link" ){
                aElement.attr("href", child.target);
                aElement.attr("target", "_blank");
            }
            else if( child.targettype === "settingid" ){
                liElement.attr("data-settingid", child.target);
            }
            
            return liElement;
        },
        /**
         * @function 节点hover样式处理
         * @param Event event 事件对像
         */
        hoverElement: function(event, isHover){
            var target = event.target;
            var objectCss;
            
            while( target.tagName && target.tagName.toString().toUpperCase() !== "LI" ){
                if( $(target).indexOfClass("ui-entrance-container") ){
                    return false;
                }
                target = target.parentNode;
            }
            
            var index = $(target).attr("data-index") || "0";
            var child = this.options.childs[index];
            if( event.type == "mouseover" ){
                child = $.extend({}, child, this.options.childs[index].effect);
            }
            
            objectCss = this.getStyle(child, this.CON_LI_NODE, isHover);
            if( this.debug ){
                //temp debug
                if( event.type == "mouseover" ){
                    objectCss["background-color"] = "#000";
                    objectCss.opacity             = 0.5;
                }else{
                    objectCss["background-color"] = "";
                    objectCss.opacity             = "";
                }
                $.Log(this.type + ">>LI" + (isHover ? ":hover" : "") + " " + $.JSON.toJSONString(objectCss), 2);
            }
            $(target).css(objectCss);
            objectCss = this.getStyle(child, this.CON_A_LINK, isHover);
            
            if( this.debug ){
                $.Log(this.type + ">>A " + $.JSON.toJSONString(objectCss));
            }
            $(target).find("a").css(objectCss);
            objectCss = this.getStyle(child, this.CON_ICON_NODE, isHover);
            
            if( this.debug ){
                $.Log(this.type + ">>div.icon " + $.JSON.toJSONString(objectCss));
            }
            $(target).find("div.ui-button-icon").css(objectCss);
            
            if( $(target).indexOfClass("ui-button-image") || $(target).indexOfClass("ui-button-img") ){
                var width,height;
                $(target).find(".ui-entrance-hover-show img").display(1);
                if($(target).find(".ui-entrance-hover-show img")[0]){
                    var image = new Image();
                    image.src = $(target).find(".ui-entrance-hover-show img")[0].src;
                    width = image.width;
                    height = image.height;
                    image = null;
                }else {
                    width = child.width;
                    height = child.height;
                }
                $(target).find(".ui-entrance-hover-show").css({
                    //右侧显示二维码left:button.width
                    //左侧显示二维码left:-image.width
                    "left": (/^left\-/i.test(this.options.position) ? child.width : 0 - width) + "px",
                    "top":  (child.height - height) + "px"
                }).display( event.type == "mouseover");
            }
            
            return false;
        },
        /**
         * @function 浏览器大小变更处理
         * @param Event event 事件对像
         */
        resizeElement: function(event){
            var opt = this.getPosition(this.options, this.CON_GLOBAL, false);
            
            //$.Log(this.type + ">$.Entrance.resizeElement():" + $.JSON.toJSONString(pos), 1);
            
            if( this.options.isfixed && this.element){
                this.element.fixed( opt );
            }
            
            if( this.element ){
                this.element.css({
                    left: opt.left + "px",
                    top:  opt.top + "px"
                });
            }
        },
        /**
         * @function 功能按钮点击事件处理
         * @param Event event 事件对像
         */
        clickElement: function(event){
            var target = event.target, stop = false;
            
            while( target.tagName && target.tagName.toString().toUpperCase() !== "LI" ){
                target = target.parentNode;
            }
            var settingid = $(target).attr("data-settingid") || "";
            var className = target.className || "";
            
            if( $(target).indexOfClass("ui-button-settingid") ){
                
                if( $.isDefined(this.options.where) && this.options.where.session_disable == "1" ){
                    $.Log("$.Entrance.clickElement(): stop: true", 1);
                    stop = true;
                }
                
                $.im_openInPageChat( settingid );
            }
            else if( $(target).indexOfClass("ui-button-settingidout") ){
                settingid = $(target).attr("data-settingid") || "";
                
                if( $.isDefined(this.options.where) && this.options.where.session_disable == "1" ){
                    $.Log("$.Entrance.clickElement(): stop: true", 1);
                    stop = true;
                }
                
                $.im_openOutPageChat( settingid );
            }
            else if( $(target).indexOfClass("ui-button-image") || $(target).indexOfClass("ui-button-img") ){
                //二维码图片
                return false;
            }
            else if( $(target).indexOfClass("ui-button-close") ){
                if( $.isDefined(this.options.where) && this.options.where.refusal_disable == "1" ){
                    //拒绝后不再邀请
                    $.Log("$.Entrance.clickElement(): stop: true", 1);
                    stop = true;
                }
            }
            else if( $(target).indexOfClass("ui-button-cancel") ){
                //cancel
            }
            else if( $(target).indexOfClass("ui-button-link") ){
                //link
            }
            if( className ) {
                $.Log("$.Entrance.clickElement(" + stop + "): " + className + ", settingid:" + settingid, 2);
                if( this.type !== "entrance" ){
                    this.closeElement(stop);
                }
            }
            
            return false;
        },
        /**
         * @function 获取节点定位位置
         * @param Object  data    配置信息
         * @param Number  level   节点级别
         * @param Boolean isHover 是否是获取hover定位
         */
        getPosition: function(data, level, isHover){
            var winWidth = $(window).width(),
                winHeight= $(window).height(),
                result = {
                    left:0,top:0
                };
            if( level === this.CON_GLOBAL ){
                //定位
                switch( data.position ){
                case 'left-top':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(10, 0 + data.xoff));
                    result.top  = Math.max(0, 0 + data.yoff);
                    break;
                case 'left-center':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(10, 0 + data.xoff));
                    result.top  = Math.max(0, (winHeight - data.height)/2) + data.yoff;
                    break;
                case 'left-bottom':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(10, 0 + data.xoff));
                    result.top  = Math.max(0, winHeight - data.height) + data.yoff;
                    break;
                case 'center-top':
                    result.left = Math.max(0, (winWidth - data.width)/2) + data.xoff;
                    result.top  = Math.max(0, 0 + data.yoff);
                    break;
                case 'center-center':
                    result.left = Math.max(0, (winWidth - data.width)/2) + data.xoff;
                    result.top  = Math.max(0, (winHeight - data.height)/2) + data.yoff;
                    break;
                case 'center-bottom':
                    result.left = Math.max(0, (winWidth - data.width)/2) + data.xoff;
                    result.top  = Math.max(0, winHeight - data.height) + data.yoff;
                    break;
                case 'right-top':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(0, winWidth - data.width + data.xoff));
                    result.top  = 0 + data.yoff;
                    break;
                case 'right-bottom':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(0, winWidth - data.width + data.xoff));
                    result.top  = Math.max(0, winHeight - data.height) + data.yoff;
                    break;
                default://'right-center'
                    data.position = 'right-center';
                    result.left = Math.min(winWidth - data.width - 10, Math.max(0, winWidth - data.width + data.xoff));
                    result.top  = Math.max(0, (winHeight - data.height)/2) + data.yoff;
                    break;
                }
            }
            else if( isHover ){
                result.left = data.x;
                result.top  = data.y;
            }
            else{
                result.left = data.xoff;
                result.top  = data.yoff;
            }
            result.right  = winWidth  - result.left - data.width;
            result.bottom = winHeight - result.top - data.width;
            return result;
        },
        /**
         * 获取样式信息
         * @param Object data     全局或按钮配置
         * @param number level 
         * @param string isHover  
         */
        getStyle: function(data, level, isHover){
            var style = {};
            var background;
            
            if( level == this.CON_GLOBAL || level == this.CON_LI_NODE ){
                background = data.background;
            }else if( level === this.CON_ICON_NODE ){
                background = $.isImage(data.content) ? data.content : "";
            }else{
                background = "";
            }
            this.pushPng(background, level, data.type);
            
            if( $.isColor(background) ){
                style["background-color"] = background;
            }else if( background && level == this.CON_GLOBAL ){
                //咨询入口背景支持众向平铺，不支持png透明
                style["background-image"] = "url(" + background + ")";
                style["background-repeat"] = "repeat-y";
            }else if( background ){
                style["background-image"] = "url(" + background + ")";
                style["background-repeat"] = "no-repeat";
                style["background-position"] = "0 0";
            }else{
                style["background-color"] = "transparent";
            }
            
            if( $.isDefined( data.color ) ){
                style.color = data.color || "#ffffff";
            }
            
            data = $.extend({}, data, this.getPosition(data, level, isHover));
            style.width       = data.width + "px";
            style.height      = data.height + "px";
            style["line-height"] = (data.height - 2) + "px";
            
            if( isHover === true ){
                if( level == this.CON_LI_NODE ){
                    style.left = (parseFloat(data.pleft) + parseFloat(data.effect.x) ) + "px";
                    style.top  = (parseFloat(data.ptop)  + parseFloat(data.effect.y) ) + "px";
                }
            }else{
                if( level == this.CON_LI_NODE ){
                    style.position = this.type === "invite" ? "absolute" : "relative";
                    style.left     = data.left + "px";
                    style.top      = data.top + "px";
                    
                }else if( level == this.CON_GLOBAL ){
                    style.position = !$.isDefined(data.isfixed) ? "relative" :
                        data.isfixed&&!$.browser.Quirks&&$.browser.ieversion!==6 ? "fixed" : "absolute";
                    style.left     = data.left + "px";
                    style.top      = data.top + "px";
                }else{
                    style.position = "relative";
                    style.left     = "0px";
                    style.top      = "0px";
                }
                
                if( $.isDefined(data.radius) && data.radius ){
                    style["border-radius"] = data.radius;
                }
            }
            
            return style;
        },
        pushPng: function(background, level, type){
            var regPNG1 = /\.png(\?.*|$)/i;
            var regPNG2 = background.indexOf("image/png");
            if( !($.browser.msie && $.browser.ieversion == 6) ){
                return;
            }
            /*
            if( background && (regPNG1.test(background) || regPNG2) ){
                this.fixPngSelector.push( this.CON_GLOBAL===level ? ".ui-entrance-container" 
                    : this.CON_LI_NODE===level ? "li.ui-entrance-" + type
                    : this.CON_ICON_NODE===level ? "li.ui-entrance-" + type + " div.ui-button-icon" : "");
            }
            */
        }
    };
    
    /**
     * @name Entrance
     * @type class
     * @desc PC页入口
     */
    $.MobileEntrance = new $.Class.create();
    $.MobileEntrance.prototype = {
        /**
         * @property 
         */
        debug: false,
        element: null,
        bgelement: null,
        timeoutID: null,
        type: "",
        options: null,
        showCount: 0,
        buttonCount:0,
        showing: false,
        _default:{
            position: "right-bottom",
            width:  45,                  //入口宽度
            height: 45,                  //入口高度,支持auto\实际值
            xoff: 0,                    //入口偏移位置
            yoff: -60,                    //入口偏移位置
            isfixed: 0,                 //定位方式
            opacity: ""                 //透明度
        },
        /**
         * 入口、邀请共用模块
         */
        initialize: function(type, options){
            this.type    = type;
            this.options = $.extend({}, options, this._default);
            
            this.pretreatment();
        },
        show: function(){
            this.createContainer();
        },
        close: function(){
            return;
        },
        /**
         * @function 预处理数据
         * @return void
         */
        pretreatment: function(){
            var self = this, result = [],
                childHeight = this.options.height,
                parentWidth = this.options.width,
                parentHeight= 0
            ;
            
            $.each(this.options.childs, function(i, child){
                if( child.type === 'button' && child.targettype === 'settingid' ){
                    result.push( child );
                }
            });
            this.options.childs = result;
            $.each(this.options.childs, function(i, child){
                self.options.childs[i].width  = parentWidth;
                self.options.childs[i].height = childHeight;
                
                parentHeight += childHeight;
            });
            this.options.height = parentHeight;
            if( this.options.childs.length > 1 ){
                this.options.height += this.options.childs[0].height;
            }
        },
        createContainer: function(){
            var self  = this;
            var ulElement, pos = this.getPosition(this.options);
            
            this.element = $({className: "ui-mobile-container", style: $.STYLE_NBODY + "z-index:99999;min-height:10px;"})
                .appendTo(true)
                .css({
                    "width":  this.options.width  + 'px',
                    "height": this.options.height + 'px',
                    "min-height": this.options.height + 'px',
                    "position": "fixed",
                    "bottom": pos.bottom + 'px',
                    "right":  pos.right + 'px'
                });
            this.bgelement = $({className: "ui-mobile-background", style: $.STYLE_NBODY + "z-index:99998;display:none;background:#000;position:fixed;left:0;top:0;"})
                .appendTo(true)
                .css({
                    "width":  $(window).width() + "px",
                    "height": $(window).height() + "px",
                    "opacity": 0.6
                });
            
            ulElement = $({tag:"UL", className: "ui-mobile-ul", style: $.STYLE_NBODY + "display:block;height:" + this.options.height + "px;list-style:none;"})
                .appendTo(this.element, true);
            
            this.element.click(function(event){
                event = $.Event.fixEvent(event);
                self.clickElement(event);
            });
            this.bgelement.click(function(event){
                event = $.Event.fixEvent(event);
                self.showElements( false );
            });
            
            if( !this.options.childs.length ){
                return;
            }else if( this.options.childs.length == 1 ){
                this.createElement(ulElement, 0, this.options.childs[0]);
            }else{
                this.createElement(ulElement, "", this.options.childs[0], 'group');
                //
                $.each(this.options.childs, function(index, child){
                    self.createElement(ulElement, index, child, "item");
                });
            }
            var __for_resize = function(event){
                event = $.Event.fixEvent(event);
                self.bgelement.css({
                    "width":  $(window).width() + "px",
                    "height": $(window).height() + "px"
                });
            };
            $.Event.addEvent(window, "resize", __for_resize, this.type);
        },
        /**
         * @function 创建各类型按钮
         * @param DOMElement   ul     父级节点对像
         * @param Number       index  索引值
         * @param ObjectString child  配置参数或默认入口组
         * @param String       groupNode
         * @return DOMElement
         */
        createElement: function(ul, index, child, groupNode){
            var typeClass   = "ui-mobile-" + (groupNode==="group" ? "default" :  child.type);
            var iconurl     = $.sourceURI + "images/mobile/" + (groupNode==="group" ? "6" : (++this.buttonCount)) + ".png";
            var liElement, aElement, objectCss = this.getStyle(child);

            liElement = $({tag:"LI", className:typeClass, style: $.STYLE_NBODY + "list-style:none;position:relative;left:0;" + (groupNode==="group" ? "bottom:0;": "top:0px;") })
                .appendTo(ul, groupNode=="item" ? true : false)
                .attr("data-index", index)
                .css( objectCss )
                .css("background", "url(" + iconurl + ") no-repeat center center");
            
            aElement = $({tag: "A", href: SCRIPT_URL, style: $.STYLE_BODY + "position:relative;left:0;top:0;display:inline-block;color:#fff;"})
                .appendTo(liElement)
                .css( objectCss );
            
            if( child.name && groupNode !== "group" ){
                $({className: "ui-entrance-hover-show", style: $.STYLE_BODY + "padding:3px;height:20px;width:100px;text-align:right;overflow:hidden;color:#fff;position:absolute;right:auto;display:block;left:auto;top:" + (child.height - 24)/2 + "px;"})
                    .appendTo(aElement)
                    .css(this.options.position.indexOf("right-") > -1 ? "right" : "left", child.width + "px")
                    .html( child.name );
            }
            
            if( groupNode !== "group" ){
                liElement.attr("data-settingid", child.target);
                
                if( groupNode == "item" ){
                    liElement.display(0);
                }
            }else{
                liElement.css({
                    position: "absolute",
                    bottom: "0px"
                });
            }
            
            if( this.buttonCount >= 5 ){
                this.buttonCount = 0;
            }
            
            return liElement;
        },
        clickElement: function(event){
            var target = event.target, display;
            
            while( target.tagName && target.tagName.toString().toUpperCase() !== "LI" ){
                target = target.parentNode;
            }

            if( $(target).indexOfClass("ui-mobile-default") ){
                
                this.showElements( $(target).attr('data-display') !== "1" );
                
            }else if( $(target).indexOfClass("ui-mobile-button") ){
                
                var settingid = $(target).attr("data-settingid") || "";
                
                if ( settingid ){
                    $.im_openInPageChat( settingid );
                }
            }
        },
        showElements: function(visibility){
            var self = this;
            
            if( this.showing === true ){
                return;
            }
            this.showing = true;
            if( visibility ){
                this.bgelement.display(1).animate({
                    opacity: {
                        form: 0,
                        to: 0.6
                    }
                }, 100, function(){
                    /*
                    self.element.find('.ui-mobile-button').each(function(){
                        var target   = this;
                        var startTop = (parseFloat($(target).attr("data-index")) + 1) * 50;
                        $(target).animate({
                            display: "block",
                            opacity: {
                                form: 0,
                                to: 1
                            },
                            top: {
                                form: startTop + "px",
                                to: "0px"
                            }
                        }, 600, function(){
                            if( $(target).attr("data-index") == self.element.find('.ui-mobile-button').length - 1 ){
                                self.showing = false;
                            }
                        });
                    });
                    */
                    self.element.find('.ui-mobile-button').css("left", "90px").animate({
                        display: "block",
                        opacity: {
                            form: 0,
                            to: 1
                        },
                        left: {
                            form: "90px",
                            to: "0px"
                        }
                    }, 300, function(){
                        self.showing = false;
                    });
                });
            }
            else{
                this.element.find('.ui-mobile-button').animate({
                    opacity: {
                        form: 1,
                        to: 0
                    },
                    left: {
                        form: "0px",
                        to: "90px"
                    }
                }, 300, function(){
                    $(this).display(0);
                    self.bgelement.animate({
                        opacity: {
                            form: 0.6,
                            to: 0
                        }
                    }, 100, function(){
                        $(this).display(0);
                        self.showing = false;
                    });
                });
            }
            
            this.element.find(".ui-mobile-default").attr("data-display", visibility ? 1 : 0);
        },
        /**
         * @function 获取节点定位位置
         * @param Object  data    配置信息
         * @param Number  level   节点级别
         * @param Boolean isHover 是否是获取hover定位
         */
        getPosition: function(data, level, isHover){
            var winWidth = $(window).width(),
                winHeight= $(window).height(),
                result = {
                    left:0,top:0
                };
            if( level === this.CON_GLOBAL ){
                //定位
                switch( data.position ){
                case 'left-top':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(10, 0 + data.xoff));
                    result.top  = Math.max(0, 0 + data.yoff);
                    break;
                case 'left-center':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(10, 0 + data.xoff));
                    result.top  = Math.max(0, (winHeight - data.height)/2) + data.yoff;
                    break;
                case 'left-bottom':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(10, 0 + data.xoff));
                    result.top  = Math.max(0, winHeight - data.height) + data.yoff;
                    break;
                case 'center-top':
                    result.left = Math.max(0, (winWidth - data.width)/2) + data.xoff;
                    result.top  = Math.max(0, (winHeight - data.height)/2) + data.yoff;
                    break;
                case 'center-center':
                    result.left = Math.max(0, (winWidth - data.width)/2) + data.xoff;
                    result.top  = Math.max(0, (winHeight - data.height)/2) + data.yoff;
                    break;
                case 'center-bottom':
                    result.left = Math.max(0, (winWidth - data.width)/2) + data.xoff;
                    result.top  = Math.max(0, winHeight - data.height) + data.yoff;
                    break;
                case 'right-top':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(0, winWidth - data.width + data.xoff));
                    result.top  = 0 + data.yoff;
                    break;
                case 'right-bottom':
                    result.left = Math.min(winWidth - data.width - 10, Math.max(0, winWidth - data.width + data.xoff));
                    result.top  = Math.max(0, winHeight - data.height) + data.yoff;
                    break;
                default://'right-center'
                    data.position = 'right-center';
                    result.left = Math.min(winWidth - data.width - 10, Math.max(0, winWidth - data.width + data.xoff));
                    result.top  = Math.max(0, (winHeight - data.height)/2) + data.yoff;
                    break;
                }
            }
            else if( isHover ){
                result.left = data.x;
                result.top  = data.y;
            }
            else{
                result.left = data.xoff;
                result.top  = data.yoff;
            }
            result.right  = winWidth  - result.left - data.width;
            result.bottom = winHeight - result.top - data.width;
            return result;
        },
        getStyle: function(data){
            var style = {};
            style.width       = data.width + "px";
            style.height      = data.height + "px";
            style["line-height"] = data.height + "px";
            style["background-color"] = "transparent";
            return style;
        }
    };
})(nTalk);