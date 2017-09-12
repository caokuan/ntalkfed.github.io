(function() {
    var $ = NTKF;

    //初始化配置项
    var defaultConfig = {
        autoOpenTimeout: parseInt($.flashserver.eduautoopentimeout, 10),
        domainMatchArr: $.flashserver.eduautoopendomains ? $.flashserver.eduautoopendomains.split(",") : [],
        strMatchArr: $.flashserver.eduautoopenstrs ? $.flashserver.eduautoopenstrs.split(",") : [],
    };

    //主函数
    function nFrame(conf) {
        //获得当前窗口url地址
        var url = window.location.href;
        var flag = false;

        //判断页面是否具备自动打开的条件
        var domainMatchArr = conf.domainMatchArr;
        for (var i = 0, l = domainMatchArr.length; i < l; i++) {
          var httpStr = "http://" + domainMatchArr[i];
          var httpsStr = "https://" + domainMatchArr[i];
          if (url.indexOf(httpStr) > -1 || url.indexOf(httpsStr) > -1) {
            flag = true;
            break;
          }
        }

        if (!flag) {
          var strMatchArr = conf.strMatchArr;
          for (var m = 0, n = strMatchArr.length; m < n; m++) {
            if (url.indexOf(strMatchArr[m]) > -1) {
              flag = true;
              break;
            }
          }
        }

        if (!flag) return;

        setTimeout(function() {
            if ($.autoEduShow !== 'complete') {
                 $.autoEduShow = true; 
                 $.im_openInPageChat();
            }
        }, conf.autoOpenTimeout);
    }

    //判断脚本初始化状态
    var tryTime = 0;
    var maxTryTime = 5;

    function nPopup() {
        if (typeof NTKF !== "undefined" && NTKF.base._identityIDReady === true) {
            nFrame(defaultConfig);
        } else {
            if (tryTime < maxTryTime) {
                tryTime++;
                setTimeout(function() {
                    nPopup();
                }, 1000);
            }
        }
    }

    nPopup();

})();
