;(function($, undefined){
//evaluateTree.js

$.EvaluateTree = function(data) {
    this.evaluateData = data;
    this.evaluateNodes = {};
    this.levelNodes = {};
    this.init();
    delete this.evaluateData;
}

$.EvaluateTree.prototype = {

    init: function(){
        var self = this;

        var initFun1 = function(evaluateData){
            var setRelate = function(id, parentid, parentIndexId, searchType) {
                var grandparentid, grandparentIndexId, grandparentSearchType;

                if(parentid) {
                    parentNode = self.evaluateNodes[parentIndexId];

                    if(!parentNode) {
                        for(var j=0, len=evaluateData.length; j<len; j++){
                            var searchData = evaluateData[j];
                            if(searchType == 'findQuestionParent' && searchData.questionid == parentid){
                                parentNode = new $.EvaluateQuestionNode(searchData);

                                //设置查找更高级节点状态
                                grandparentid = searchData.parentid;
                                grandparentIndexId = 'a' + grandparentid;
                                grandparentSearchType = 'findAnswerParent';

                                self.evaluateNodes[parentIndexId] = parentNode;
                                break;
                            } else if (searchType == 'findAnswerParent' && searchData.answerid == parentid) {
                                parentNode = new $.EvaluateAnswerNode(searchData);

                                //设置查找更高级节点状态
                                grandparentid = searchData.questionid;
                                grandparentIndexId = 'q' + grandparentid;
                                grandparentSearchType = 'findQuestionParent';

                                self.evaluateNodes[parentIndexId] = parentNode;
                                break;
                            }

                        }
                    }

                    if(parentNode) {
                        parentNode.childrenNodeIds.push(id);
                        self.evaluateNodes[id].parentNodeId = parentIndexId;
                    }

                    if(grandparentid) {
                        setRelate(parentIndexId, grandparentid, grandparentIndexId, grandparentSearchType);
                    }

                }

            }

            for (var i=0, l=evaluateData.length; i<l; i++) {
                var eData =evaluateData[i];
                var id, node, searchType, parentid, parentNode, parentIndexId;

                if(eData.answerid) {
                    id = "a" + eData.answerid;
                    if(self.evaluateNodes[id]) {
                        continue;
                    }
                    node = new $.EvaluateAnswerNode(eData);

                    parentid = eData.questionid;
                    parentIndexId = 'q' + parentid;
                    searchType = 'findQuestionParent';
                }

                if(eData.parentid) {
                    id = "q" + eData.questionid;
                    if(self.evaluateNodes[id]) {
                        continue;
                    }
                    node = new $.EvaluateQuestionNode(eData);

                    parentid = eData.parentid;
                    parentIndexId = 'a' + parentid;
                    searchType = 'findAnswerParent';
                }

                self.evaluateNodes[id] = node;

                setRelate(id, parentid, parentIndexId, searchType);
            }
        }
        //initFun(this.evaluateData, []);
        initFun1(this.evaluateData);
        this.setAllRelate();
    },

    getNode: function(id){
        return this.evaluateNodes[id];
    },

    setAllRelate: function() {
        var self = this;
        for (eIndex in this.evaluateNodes){
            // set All Children
            var childrenNodeIds = this.evaluateNodes[eIndex].childrenNodeIds;
            var tmp_allChildrenNodeIds = [].concat(childrenNodeIds);

            var setChildrenid = function(childrenNodeIds) {
                for (idIndex in childrenNodeIds) {
                    var tmpChild = self.evaluateNodes[childrenNodeIds[idIndex]];
                    tmp_allChildrenNodeIds = tmp_allChildrenNodeIds.concat(tmpChild.childrenNodeIds);

                    if(tmpChild.childrenNodeIds.length > 0){
                        setChildrenid(tmpChild.childrenNodeIds);
                    }
                }
            }

            setChildrenid(childrenNodeIds);

            this.evaluateNodes[eIndex].allChildrenNodeIds = tmp_allChildrenNodeIds;


            // set All Parent
            var parentNodeId = this.evaluateNodes[eIndex].parentNodeId;
            var tmp_allParentNodeIds = [];

            var setParentid = function(parentNodeId) {
                    var tmpParent = self.evaluateNodes[parentNodeId];

                    if(parentNodeId){
                        tmp_allParentNodeIds.push(parentNodeId);
                    }

                    if(tmpParent && tmpParent.parentNodeId) {
                        setParentid(tmpParent.parentNodeId);
                    }

            }

            setParentid(parentNodeId);

            this.evaluateNodes[eIndex].allParentNodeIds = tmp_allParentNodeIds;
        }

        for (eIndex in this.evaluateNodes){
            var level = this.evaluateNodes[eIndex].allParentNodeIds.length;

            if(!this.levelNodes[level]) {
                this.levelNodes[level] = [eIndex];
            }else {
                this.levelNodes[level].push(eIndex);
            }

            this.maxLevel = this.levelNodes.length;
        }
    },

    clearAnswerCount: function() {
        for(nodeid in this.evaluateNodes){
            var node = this.evaluateNodes[nodeid];
            if(node.nodetype == 'answer') {
                node.count = 0;    
            }
        }
    }
}

$.EvaluateQuestionNode = function(data){
    this.questionid = data.questionid;
    this.parentid = data.parentid;
    this.icon = data.icon;
    this.content = data.content;
    this.must = data.must;
    this.errorhint = data.errorhint;
    this.styleid = $.JSON.parseJSON(data.styleid);

    this.nodetype = 'question';

    this.parentNodeId = "";
    this.allParentNodeIds = [];
    this.childrenNodeIds = [];
    this.allChildrenNodeIds = [];
}

$.EvaluateAnswerNode = function(data){
    this.answerid = data.answerid
    this.questionid = data.questionid
    this.icon = data.icon;
    this.content = data.content;
    this.type = data.type;
    this.score = data.score;
    this.defaultvalue = data.defaultvalue;
    this.styleid = $.JSON.parseJSON(data.styleid);

    this.nodetype = 'answer';

    this.parentNodeId = "";
    this.allParentNodeIds = [];
    this.childrenNodeIds = [];
    this.allChildrenNodeIds = [];
    this.count = 0;
    this.max = 0;
    this.maxContent = "0/" + this.max;
}

// 树形数据，结构拆分，后数据格式变更，不采用此方式
/*
var initFun = function(evaluateData, parentNodeIds){
    for (var i=0, l=evaluateData.length; i<l; i++) {
        var eData =evaluateData[i];
        var id, node, tmp_parentNodeIds;

        eData.parentNodeIds = parentNodeIds;

        tmp_parentNodeIds = [].concat(parentNodeIds);

        if(eData.answerid) {
            id = "a" + eData.answerid;
            node = new $.EvaluateAnswerNode(eData);
        }

        if(eData.parentid) {
            id = "q" + eData.questionid;
            node = new $.EvaluateQuestionNode(eData);
        }

        if(!self.levelNodes[parentNodeIds.length]) {
            self.levelNodes[parentNodeIds.length] = [id];
        }else {
            self.levelNodes[parentNodeIds.length].push(id);
        }

        for(var j=0, len=parentNodeIds.length; j<len; j++){
            var parentNode = self.evaluateNodes[parentNodeIds[j]];
            parentNode.childrenNodeIds.push(id);
        }

        self.evaluateNodes[id] = node;

        tmp_parentNodeIds.push(id);

        if(eData.options){
            initFun(eData.options, tmp_parentNodeIds);
        }
    }
}*/

//evaluateStyle_theme.js

$.evaluateBaseInfo = {'evaluateTitle': '服务评价', 'submitButtonName': '评价', 'closeButtonName': 'X'};
$.evaluateMobileBaseInfo = {'evaluateTitle': '感谢您支持，请给予评价', 'submitButtonName': '评价', 'cancelButtonName': '取消'};

$.evaluateDomName = 'dom';

$.evaluateStyle = {
    1 : {
        'dom1' : {
            "className" : "nt-evaluation-radio-checked",
            "tag" : "img",
            "mark" : "-checked",
            "content" : {
                attr : "",
                value : $.sourceURI + "images/evaluate/radio-checked.png"
            }
        },
        'dom2' : {
            "className" : "nt-evaluation-radio-icon",
            "tag" : "img",
            "mark" : "",
            "content" : {
                attr : "icon"
            }
        },
        'dom3' : {
            "className" : "nt-evaluation-radio-content",
            "tag" : "span",
            "mark" : "",
            "content" : {
                attr : "content"
            }
        },
        'dom4' : {
            "className" : "nt-evaluation-radio-option",
            "tag" : "div",
            "mark" : "",
            "content" : [1,2,3]
        }
    },

    2 : {
        'dom1' : {
            "className" : "nt-evaluation-checkbox-content",
            "tag" : "span",
            "mark" : "",
            "content" : {
                attr : "content"
            }
        },
        'dom2' : {
            "className" : "nt-evaluation-checkbox-count",
            "tag" : "span",
            "mark" : "-count",
            "content" : {
                attr : "count"
            }
        },
        'dom3' : {
            "className" : "nt-evaluation-checkbox-option",
            "tag" : "div",
            "mark" : "",
            "content" : [1,2]
        }
    },

    3 : {
        'dom1' : {
            "className" : "nt-evaluation-textarea",
            "tag" : "textarea",
            "mark" : "",
            "content" : {
                attr : "content"
            }
        },
        'dom2' : {
            "className" : "nt-evaluation-textarea-length",
            "tag" : "div",
            "mark" : "-count",
            "content" : {
                attr : "maxContent"
            }
        },
        'dom3' : {
            "className" : "nt-evaluation-textarea-option",
            "tag" : "div",
            "mark" : "",
            "content" : [1,2]
        }
    },

    4 : {
        'dom1' : {
            "className" : "nt-evaluation-question",
            "tag" : "div",
            "mark" : "",
            "content" : {
                attr : "content"
            }
        }
    },

    5 : {
        'dom1' : {
            "className" : "nt-evaluation-question-nocontent",
            "tag" : "div",
            "mark" : "",
            "content" : {
                attr : "",
                value : ""
            }
        }
    }
};

$.evaluateMobileStyle = {
    0 : {

    },

    1 : {
        'dom1' : {
            "className" : "nt-evaluation-radio-checked",
            "tag" : "div",
            "mark" : "-checked",
            "content" : {
                attr : "",
                value : ""
            }
        },
        'dom2' : {
            "className" : "nt-evaluation-radio-unchecked",
            "tag" : "div",
            "mark" : "",
            "content" : [1]
        },
        'dom3' : {
            "className" : "nt-evaluation-radio-icon",
            "tag" : "img",
            "mark" : "",
            "content" : {
                attr : "icon"
            }
        },
        'dom4' : {
            "className" : "nt-evaluation-radio-content",
            "tag" : "span",
            "mark" : "",
            "content" : {
                attr : "content"
            }
        },
        'dom5' : {
            "className" : "nt-evaluation-radio-option",
            "tag" : "div",
            "mark" : "",
            "content" : [2,3,4]
        }
    },

    6 : {
        'dom1' : {
            "className" : "nt-evaluation-question-nocontent",
            "tag" : "div",
            "mark" : "",
            "content" : {
                attr : "",
                value : ""
            }
        }
    }
};

$.defaultStyle = {
    'evaluateWrap' :  {
        margin: 15,
        border: 0,
        style:  {
           'border-radius': '5px',
          height: 'auto'
        }
    },

    'nt-evaluation-title' : 'position: relative;top: 0px;left: 0px;width: auto;height: 44px;padding: 0px;margin: 0px 15px;text-align: center;font-size: 16px;line-height: 45px;color: #666;background: #FFF;border-bottom: 1px solid #ccc;',

    'nt-evaluation-close' : 'position: absolute;top: 10px;right: 20px;font-size:16px;color:#cdcdcd;cursor:pointer;',

    'nt-evaluation-question' : 'position: relative;top: 0px;left: 0px;width: 100%;height: 34px;padding: 0px;margin: 0px;text-align: center;font-size: 12px;line-height: 36px;color: #666;background: -webkit-gradient(linear, 0% 100%, 0% 0%, from(rgb(240, 240, 240)), to(rgb(255, 255, 255))) rgb(255, 255, 255);',

    'nt-evaluation-question-nocontent' : 'display:none',

    'nt-evaluation-radio-option' : 'position: relative;display: inline-block;*display: inline;*zoom:1;width: 50px;height: 67px;padding: 0px 8px 0px 8px;margin: 7px 0px;text-align: center;background: #FFF;cursor:pointer',

    'nt-evaluation-radio-icon' : 'width: 50px;height: 50px;display: block;margin-bottom: 4px;',

    'nt-evaluation-radio-content' : 'font-size: 12px;line-height: 12px;color: #434343;',

    'nt-evaluation-radio-checked' : 'position: absolute;width: 16px;height: 16px;top: 30px;left: 40px;',

    'nt-evaluation-section' : 'position: relative;top: 0px;left: 0px;width: 100%;height: auto;padding: 0px;margin: 0px;text-align: center;background: #FFF;font-size: 0px;',

    'nt-evaluation-checkbox-option' : 'position: relative;display: inline-block;*display: inline;*zoom:1;width: 90px;height: 28px;padding: 0px;margin: 10px 10px 0px 10px;text-align: left;font-size: 12px;line-height: 28px;color: #666;background: #FFF;border: 1px solid #99d57f;border-radius: 5px;cursor:pointer',

    'nt-evaluation-checkbox-content' : 'position: absolute;display: inline-block;*display: inline;*zoom:1;line-height: 28px;left: 20px;',

    'nt-evaluation-checkbox-count' : 'position: absolute;display: inline-block;*display: inline;*zoom:1;line-height: 28px;right: 10px;',

    'nt-evaluation-checkout-count-add' : 'position: absolute;top:-10px;right: 7px;color:#99d57f;font-weight: bold;',

    'nt-evaluation-textarea-option' : 'position: relative;top: 0px;left: 0px;width: 100%;height: auto;padding: 0px;margin: 0px;text-align: center;background: #FFF;font-size: 0px;',

    'nt-evaluation-textarea' : 'position: relative;width: 300px;height: 52px;padding: 10px;margin: 16px 0px 20px 0px;text-align: left;font-size: 12px;line-height: 12px;color: #000;background: #FFF;border: 1px solid #cdcdcd;border-radius: 5px;box-sizing: content-box;resize:none',

    'nt-evaluation-textarea-length' : 'position:absolute;right:32px;top:92px;float:right;font-size:14px;font-weight:bold;color:#ccc;',

    'nt-evaluation-bottom' : 'position: relative;top: 0px;left: 0px;width: 100%;height: 42px;text-align: center;background:#FFF;border-radius: 5px;cursor:pointer',

    'nt-evaluation-bottom-button' : 'position: relative;width: 80px;height: 32px;font-size: 14px;line-height: 14px;color: #fff;text-align:center;background: #99d57f;border: none;border-radius: 5px;cursor:pointer',

    'nt-evaluation-error' : 'position:relative; top:-68px; left:32px; width:auto; height:0px; line-height:30px; font-size:12px; color:red;display:none'
};


$.defaultMobileStyle = {
    'evaluateWrap' :  {
        margin: "39 " + top,
        border: 0,
        style: {
            'background-color': '#fbfbfb',
            'border-radius': '5px',
            'height': "auto"
        }
    },

    'nt-evaluation-background' : 'position: absolute;z-index:99999;top: 0rem;left: 0rem;width: 100%;height: 100%;background: #ccc;opacity: 0.6;',

    'nt-evaluation-wrapper' : 'position: absolute;z-index:100000;top: 50%;left: 50%;width:15rem;height:18.8rem;margin-top: -9.4rem;margin-left: -7.5rem;background:#fafafa;border-radius: 0.3rem 0.3rem 0 0;',

    'nt-evaluation-title' : 'position: relative;top: 0px;left: 0px;width: 100%;height: 1.75rem;text-align: center;font-size: 0.65rem;font-weight: bold;line-height: 1.75rem;color: #000;background: #fafafa;border-radius: 0.3rem;',

    'nt-evaluation-question-nocontent' : 'display:none',

    'nt-evaluation-section' : 'position: relative;top: 0.25rem;left: 0px;width: 100%;height: auto;padding: 0px;margin: 0px;font-size: 0px;text-align: center;background: #fafafa;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:rgba(0,0,0,0);',

    'nt-evaluation-radio-option' : 'position: relative;display: block;width: 100%;height: 2.5rem;margin-top: 0.21rem;text-align:center;display:inline-block;',

    'nt-evaluation-radio-icon' : 'position: relative;width:2.5rem;height:2.5rem;margin: 0rem 0.75rem 0rem 0.65rem;display:inline-block;',

    'nt-evaluation-radio-content' : 'position: relative;width: 2rem;height: 0.6rem;top: -0.95rem;font-size: 0.6rem;text-align: left;display:inline-block;color: #000;',

    'nt-evaluation-radio-unchecked' : 'position:relative;top:-0.7rem;right:0rem;margin-left:0.65rem;width:0.8rem;height:0.8rem;background:white;border: 0.05rem solid #cecece;border-radius:0.8rem;display:inline-block;',

    'nt-evaluation-radio-checked' : 'position:relative;top:0.05rem;left:0.05rem;width:0.6rem;height:0.6rem;background:#32aaf4;border: 0.05rem solid #cecece;border-radius:0.6rem;display:inline-block;',

    'nt-evaluation-bottom' : 'position: relative;top: 1rem;left: 0px;bottom: 0px;width: 100%;height: 2rem;line-height: 2rem;padding: 0px;margin: 0px;font-size: 0px;text-align: center;background: #fafafa;border-top: 0.05rem solid #ddd;border-radius: 0rem 0rem 0.3rem 0.3rem;',

    'nt-evaluation-bottom-submit' : 'display: inline-block;width: 49%;font-size: 0.75rem;color: #55b6f5;border-right: 0.05rem solid #ddd;',

    'nt-evaluation-bottom-cancel' : 'display: inline-block;width: 50%;font-size: 0.75rem;color: #55b6f5;border-right: 0.05rem solid #ddd;'
};

$.defaultEffect = {
    'nt-evaluation-checkbox-option': {
        'checked' : {
            'background' : '#99d57f',
            'color' : '#FFF'
        },

        'unchecked' : {
            'background' : '#FFF',
            'color' : '#000'
        }
    },

    'nt-evaluation-checkbox-count' : {
        'checked' : 1,
        'unchecked' : -1
    }

};

$.radioEffect = {};

$.radioEffect.get = function(){
    return ['display'];
}



//evaluateView.js

$.EvaluateView = function() {
    this.evaluateHtml = this.generateEvaluateHtml().join("");
}

$.EvaluateView.prototype.generateEvaluateHtml = function(labelCounts, baseInfo) {

    //评价表单 html 集合
    var htmls = [];

    //模拟的标签数据
    labelCounts = $.evaluateTree.labelCounts || {};

    //模拟的表单标题和按钮文字
    if($.browser.mobile) {
        baseInfo = $.evaluateMobileBaseInfo;
    } else {
        baseInfo = $.evaluateBaseInfo;
    }


    // 递归设置视图
    /**
     *   以1次递归为例 （即1个问题的所有子项为1个递归）
     *   第1次设置的是0级节点的视图（请您评价此次服务）
     *   第2次设置的是1级节点的视图（超赞、32个赞、凑合、吐槽、差评）
     *   第3次设置的是2级节点的视图（对Ta的印象 * 5）
     *   第4次设置的是3级节点的视图（如 态度好、耐心、回复快、热情、专业、其他 * 5）
     */
    var setView = function(html, nodeids) {
        //收集每一级节点的子节点id（设置2级节点时、会收集到30个子节点id）
        var tmp_nodeids = [];
        //存储每一级节点生成的html (临时变量)
        var tmp_htmls = "";

        //循环各级节点
        for (var i=0; i<nodeids.length; i++) {
            //存储每个节点生成的html (临时变量)
            var tmp_html = "";

            //节点id 格式为 a1(答案) q1(问题)
            var id = nodeids[i];

            //从评价树中取到节点对象
            var node = $.evaluateTree.getNode(id);

            if (node.type === 'textarea') {
                //获取多行文本答案节点的父节点中关于可输入长度最大值的信息，如果为0，则不添加长度判断节点
                var max = $.getTextAreaMaxLength(id);

                node.max = max;
                node.maxContent = "0/" + ($.lang.language.indexOf('zh_') > -1 ? (max/2) : max);

                if(max) {
                    $.relate_nodeid_max[id] = max;
                }
            }

            var style;

            if($.browser.mobile) {
                style = $.evaluateMobileStyle[node.styleid.wap];
            } else {
                style = $.evaluateStyle[node.styleid.pc];
            }

            var length = 0;

            for(var dom in style) {
                var domHtml = "";
                var domStyle = style[dom];
                var content = domStyle.content;

                if($.isArray(content)) {
                    var tmp_content = "";
                    for(var j=0; j<content.length; j++) {
                        tmp_content += style[$.evaluateDomName + content[j]].html;
                    }
                    content = tmp_content;
                } else if(content.attr){
                    if(content.attr == 'maxContent' && node.max == 0) {
                        domStyle.html = "";
                        length++;
                        continue;
                    }
                    content = node[content.attr];
                } else {
                    content = content.value;
                }

                domStyle.html = $.generateHtml(domStyle.tag, domStyle.className, id + domStyle.mark, content, node.parentNodeId);
                length++;
            }


            var lastDom = style[$.evaluateDomName + length];

            //存储每一级节点生成的html
            if(lastDom) {
                tmp_htmls += lastDom.html;
            } else {
                tmp_htmls += "";
            }


            //收集每一级节点的子节点id
            tmp_nodeids = tmp_nodeids.concat(node.childrenNodeIds);
        }

        // 包裹每级的所有节点的HTML，目前设置为相对定位，居中
        if(tmp_htmls) {
            tmp_htmls = $.generateHtml("div", "nt-evaluation-section", "section", tmp_htmls);
        }

        // 存储1次迭代的html
        html += tmp_htmls;

        // 如果仍存在子节点，在当前html基础上，继续设置视图
        if(tmp_nodeids.length > 0) {
            html = setView(html, tmp_nodeids);
        }

        // 返回1次迭代的html
        return html;
    }

    //生成标题html
    if(baseInfo.evaluateTitle) {
        var title = $.generateHtml("div", "nt-evaluation-title", "", baseInfo.evaluateTitle);
        htmls.push(title);
    }

    //生成关闭按钮html
    if(baseInfo.closeButtonName) {
        var close = $.generateHtml("div", "nt-evaluation-close", "close", baseInfo.closeButtonName);
        htmls.push(close);
    }

    //设置视图入口
    for (var j=0; j<$.evaluateTree.levelNodes["0"].length; j++) {
        var html = "";
        html = setView(html, [$.evaluateTree.levelNodes["0"][j]]);
        htmls.push(html);
    }

    //生成提交按钮html
    if($.browser.mobile) {
        var submitButton = $.generateHtml("div", "nt-evaluation-bottom-submit", "submit", baseInfo.submitButtonName);
        var cancelButton = $.generateHtml("div", "nt-evaluation-bottom-cancel", "cancel", baseInfo.cancelButtonName);
        var bottom = $.generateHtml("div", "nt-evaluation-bottom", "", cancelButton + submitButton);
        htmls.push(bottom);
    } else {
        var submitButton = $.generateHtml("button", "nt-evaluation-bottom-button", "submit", baseInfo.submitButtonName);
        var bottom = $.generateHtml("div", "nt-evaluation-bottom", "", submitButton);
        htmls.push(bottom);
    }

    var error = $.generateHtml("div", "nt-evaluation-error", "error", "");
    htmls.push(error);

    return htmls;
}

//生成html片段的小方法
$.generateHtml = function (tag, className, nodeid, content, parentNodeId){
    var style = $.defaultStyle;
    var baseStyle =  $.STYLE_BODY;
    if($.browser.mobile) {
        style = $.defaultMobileStyle;
        baseStyle = "";
    }

    if(tag == 'img') {
        return '<' + tag + ' class="' + className + '" style="' + baseStyle + " " + style[className] + '" src="' + content + '" nodeid="' + nodeid + '" el-show="show"/>';
    }else if(tag == 'textarea') {
        return '<' + tag + ' class="' + className + '" style="' + baseStyle + " " + style[className] + '" nodeid="' + nodeid +'" placeholder="' + content + '" el-show="show"></' + tag + '>';
    }else if(tag.indexOf('input') > -1){
        return '<input type="' + tag.substring(5) + '" name="' + parentNodeId + '" class="' + className + '" style="' + $.STYLE_BODY + " " + $.defaultStyle[className] + '" nodeid="' + nodeid + '" el-show="show">' + content + '</' + tag + '>';
    }else {
        return '<' + tag + ' class="' + className + '" style="' + baseStyle + " " + style[className] + '" nodeid="' + nodeid + '" el-show="show">' + content + '</' + tag + '>';
    }
}

$.getTextAreaMaxLength = function(nodeid) {
    var node = $.evaluateTree.getNode(nodeid);
    var parentNode = $.evaluateTree.getNode(node.parentNodeId);

    if(!parentNode.errorhint) {
        return 0;
    }

    var errorhint = $.JSON.parseJSON(parentNode.errorhint);
    for(var errorIndex=0; errorIndex < errorhint.length; errorIndex++) {
        var verificateMsg = errorhint[errorIndex];

        if(verificateMsg.type == $.verificateLengthStr) {
            return verificateMsg[$.verificateMaxStr];
        }
    }
    return 0;
}


//evaluateEvent.js
if(!$.relate_nodeid_display){
    $.relate_nodeid_display = {};
}

if(!$.relate_nodeid_max){
    $.relate_nodeid_max = {};
}

$.EvaluateEvent = {};
$.EvaluateEvent.bindEvaluateEvent = function() {
    var radioArr = $('.nt-evaluation-radio-option');
    var radioEffect = $.radioEffect.get();

    for(var i=0; i<radioArr.length; i++) {
        var nodeid = $(radioArr[i]).attr("nodeid");
        var node = $.evaluateTree.getNode(nodeid);
        var parentNode = $.evaluateTree.getNode(node.parentNodeId);

        var allChildrenNodeIds = node.allChildrenNodeIds;
        var defaultvalue = node.defaultvalue;

        for(j=0; j<allChildrenNodeIds.length; j++) {
            var nt_show = $("[nodeid=" + allChildrenNodeIds[j] + "]").css('display');
            $.relate_nodeid_display[allChildrenNodeIds[j]] = nt_show;
        }

        if(defaultvalue != 1) {
            hide(allChildrenNodeIds);
            unchecked(nodeid, radioEffect);
        }else {
            checked(nodeid, radioEffect);
            parentNode.answerData = [{labid: node.answerid, lab: node.content, score:node.score}];
        }
    }

    var checkboxArr = $('.nt-evaluation-checkbox-option');
    var initCheckBox = {};

    for(var i=0; i<checkboxArr.length; i++) {
        var nodeid = $(checkboxArr[i]).attr("nodeid");
        var node = $.evaluateTree.getNode(nodeid);
        var parentNode = $.evaluateTree.getNode(node.parentNodeId);

        if(!initCheckBox[node.parentNodeId]) {
            parentNode.answerData = [];
            initCheckBox[node.parentNodeId] = 1;
        }

        if(node.defaultvalue != 1) {
            unchecked(nodeid, 'display');
        }else {
            checked(nodeid, 'display');
            parentNode.answerData.push({labid: node.answerid, lab: node.content, score:node.score});
        }
    }

    var section = $('.nt-evaluation-section');

    section.click(function(event){
        event = $.Event.fixEvent(event);

        var target = event.target;

        var click = function(target) {
            if(target.className == 'nt-evaluation-section') {
                return;
            }

            if(target.className == 'nt-evaluation-radio-option') {
                var nodeid = $(target).attr("nodeid");
                var node = $.evaluateTree.getNode(nodeid);
                var parentNode = $.evaluateTree.getNode(node.parentNodeId);
                var oldRadioId = 'a' + parentNode.answerData[0].labid;

                if(oldRadioId == nodeid) {
                    return;
                } else {
                    hide($.evaluateTree.getNode(oldRadioId).allChildrenNodeIds);
                    unchecked(oldRadioId, radioEffect);

                    show($.evaluateTree.getNode(nodeid).allChildrenNodeIds);
                    checked(nodeid, radioEffect);
                    parentNode.answerData = [{labid: node.answerid, lab: node.content, score:node.score}];
                }
                return;
            }

            if(target.className == 'nt-evaluation-checkbox-option') {
                var nodeid = $(target).attr("nodeid");
                var node = $.evaluateTree.getNode(nodeid);
                var parentNode = $.evaluateTree.getNode(node.parentNodeId);
                var parentAnswer = parentNode.answerData || [];

                var answer = {labid: node.answerid, lab: node.content, score:node.score};
                var indexInParent = -1;
                for (var i=0; i<parentAnswer.length; i++) {
                    if(parentAnswer[i].labid == node.answerid) {
                        indexInParent = i;
                        break;
                    }
                }
                if(indexInParent != -1) {
                    unchecked(nodeid, ['effect']);
                    parentAnswer.splice(indexInParent, 1);
                } else {
                    checked(nodeid, ['effect']);
                    parentAnswer.push(answer);
                }

                parentNode.answerData = parentAnswer;
            }

            click($(target).parent().get(0));
        }

        click(target);
    });


    var textareaArr = $('.nt-evaluation-textarea');
    for(var i=0; i<textareaArr.length; i++) {
        var nodeid = $(textareaArr[i]).attr("nodeid");
        var node = $.evaluateTree.getNode(nodeid);
        var parentNode = $.evaluateTree.getNode(node.parentNodeId);

        parentNode.answerData =  [{labid:0, lab:$(textareaArr[i]).val(), score:0}];
    }

    var textareaEvent = function(event){
        event = $.Event.fixEvent(event);

        var target = event.target;
        var nodeid = $(target).attr("nodeid");
        var node = $.evaluateTree.getNode(nodeid);
        var parentNode = $.evaluateTree.getNode(node.parentNodeId);

        var max = $.relate_nodeid_max[nodeid];

        setTimeout(function(){
            if(max){
                var color = $.enLength($(target).val()) > max ? '#f00' : '#ccc';
                var inputText = "";
                if($.lang.language.indexOf('zh_') > -1) {
                    inputText = Math.ceil($.enLength($(target).val()) / 2) + '/' + (max / 2);
                } else {
                    inputText = Math.ceil($.enLength($(target).val())) + '/' + (max);
                }
                $(target).parent().find('.nt-evaluation-textarea-length').html(inputText).css('color', color);
            }
            parentNode.answerData =  [{labid:0, lab:$(target).val(), score:0}];
        }, 100);
    }

    textareaArr.bind('keyup', textareaEvent);
    textareaArr.bind('paste', textareaEvent);
}

function show(nodeids) {
    var node,nodeid;
    for(var i=0; i<nodeids.length; i++) {
        nodeid = nodeids[i];
        node = $("[nodeid="+nodeid+"]");
        node.css('display', $.relate_nodeid_display[nodeid] || '');
        node.attr("el-show", "show");
    }
}

function hide(nodeids) {
    var node;
    for(var i=0; i<nodeids.length; i++) {
        node = $("[nodeid="+nodeids[i]+"]");
        node.css('display', 'none');
        node.attr("el-show", "hide");
    }
}

function checked(nodeid, types) {
    for(var i=0; i<types.length; i++) {
        var type = types[i];
        switch(type) {
            case 'display':
                show([nodeid + '-checked']);
                break;
            case 'effect':
                effect([nodeid], 'checked');
                break;
            case 'radio':
                $('[nodeid=' + nodeid + '-checked]').attr('checked', 'checked');
                break;
        }
    }
}

function unchecked(nodeid, types) {
    for(var i=0; i<types.length; i++) {
        var type = types[i];
        switch(type) {
            case 'display':
                hide([nodeid + '-checked']);
                break;
            case 'effect':
                effect([nodeid], 'unchecked');
                break;
            case 'radio':
                $('[nodeid=' + nodeid + '-checked]').attr('checked', '');
                break;
        }
    }
}

function effect(nodeid, name){
    var el = $("[nodeid=" + nodeid + "]");

    for(cls in $.defaultEffect) {
        if(cls.indexOf('count') > -1) {
            var countEl = $("[nodeid=" + nodeid + "-count]");
            if(countEl.length > 0){
                var nodeEffect = $.defaultEffect[el[0].className][name];
                var countEffect = $.defaultEffect[countEl[0].className][name];
                animateCount(el, nodeid, countEffect);
                countEl.html(parseInt(countEl.html()) + countEffect);
                countEl.css(nodeEffect);
            }
            continue;
        }
        var tmpel = (el[0].className == cls) ? el : el.find('.' + cls);
        el.css($.defaultEffect[cls][name]);
    }
}

function animateCount(rootEl, nodeid, countEffect) {
    var animateHtml = $.generateHtml('span', 'nt-evaluation-checkout-count-add', nodeid + '-count-add', countEffect > 0 ? ('+' + countEffect) : countEffect);
    rootEl.insert(animateHtml);

    var animateEl = $('.nt-evaluation-checkout-count-add');
    var distance = -10;
    var inter = setInterval(function(){
        distance--;
        animateEl.css('top', (distance) + 'px');
    }, 20);

    setTimeout(function(){
        clearInterval(inter);
        animateEl.remove();
    }, 500);
}



//evaluateVerificate.js

$.verificateEmptyStr = 'empty';
$.verificateLengthStr = 'length';
$.verificateMaxStr = 'max';
var questionSelectorArr = ['.nt-evaluation-question[el-show=show]', '.nt-evaluation-question-nocontent[el-show=show]'];

$.EvaluateVerificate = {};
$.EvaluateVerificate.getEvaluateSubmitData = function() {
    var datas = [], questionArr = [];

    var errorToast = {};

    var verificateData = function(selector){
        var data = {};
        var questionEl = $(selector);
        var questionNode = $.evaluateTree.getNode(questionEl.attr("nodeid"));
        data.id = questionNode.questionid;
        data.question = questionNode.content;
        data.answer = questionNode.answerData || [];

        if(data.answer.length === 0 && questionNode.must != 1){
            return;
        }

        if(!questionNode.errorhint) {
            datas.push(data);
            return;
        }

        var errorhint = $.JSON.parseJSON(questionNode.errorhint);
        for(var errorIndex=0; errorIndex < errorhint.length; errorIndex++) {
            var errorMsg = errorhint[errorIndex];

            if(errorMsg.type == $.verificateEmptyStr) {
                if(data.answer.length === 0) {
                    errorToast[data.id] = errorMsg.content;
                    break;
                }
            }

            if(errorMsg.type == $.verificateLengthStr) {
                if($.enLength(data.answer[0].lab) > errorMsg[$.verificateMaxStr]) {
                    errorToast[data.id] = errorMsg.content;
                    break;
                }
            }
        }

        datas.push(data);
    }

    for(var i=0; i<questionSelectorArr.length; i++) {
        questionArr = $(questionSelectorArr[i]);
        for(var j=0; j<questionArr.length; j++) {
            if(questionArr[j]){
                verificateData(questionArr[j]);
            }

            if(!$.isEmptyObject(errorToast)){
                return errorToast;
            }
        }
    }

    return datas;
};


})(nTalk);