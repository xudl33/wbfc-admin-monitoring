    //设置cookies
    function setHistoryK(ids, carNames) {
        //alert(123);
        var len = 0;
        var canAdd = true;
        var historyData, json1;
        var firstStr = "[" +
            " {\"carName\":\"" + carNames + "\"," +
            " \"id\":\"" + ids + "\"}" +
            " ]";
        //delCookie("carInfo");
        var jsonFirstStr = JSON.stringify(firstStr);

        if (!getCookie("carInfo")) { //第一次的时候需要初始化
            setCookie("carInfo", jsonFirstStr);
        } else { //已经存在
            historyData = getCookie("carInfo");
            json1 = eval("(" + historyData + ")");
            if (typeof(json1) == "string") {
                json1 = JSON.parse(json1);
            }
            len = json1.length;
            //console.log(len);
            //console.log(json1);
            $(json1).each(function() {
                if (this.id == ids) {
                    canAdd = false;
                    return false;
                }
            });

            if (canAdd == true) {
                if (len > 3) {
                    json1.splice(0, 1);
                }
                var newJsonStr = {
                        "carName": carNames,
                        "id": ids
                    },
                    jsonSetStr;
                json1.push(newJsonStr); //添加一个新的记录
                jsonSetStr = JSON.stringify(json1);
                setCookie("carInfo", jsonSetStr);
                console.log(jsonSetStr);
            }
        }
    };

    //设置cookie
    function setCookie(name, value) {
        var hours = 12;
        var exp = new Date();
        exp.setTime(exp.getTime() + hours * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() +"; path=/";//"; path=/"是为了保证不会出现多个key
    };

    //获取cookies
    function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    };

    //检查cookies
    function checkCookie(c_name) {
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=")
            if (c_start > 0)
                var arr = new Array();
            arr = document.cookie.split(";");
            return arr.length
        }
    };


    //删除cookies
    function delCookie(name) {
        var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
        if (keys) {
            for (var i = keys.length; i--;)
                document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
        }
    };

    export default {
        setHistoryK,
        getCookie,
        setCookie,
        delCookie
    }