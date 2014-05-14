// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt)
{
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}
/**
 * 获取当月第一天
 * @param date
 * @returns {*|Date}
 */
Date.firstDayOfMonth = function(date){
    if(typeof date != 'object') date = null;
    var _date = date || new Date();
    _date.setDate(1);
    return _date;
}
/**
 * 获取当月最后一天
 * @param date
 * @returns {*|Date}
 */
Date.lastDayOfMonth = function(date){
    if(typeof date != 'object') date = null;
    var _date = date || new Date();
    _date.setMonth(_date.getMonth() + 1);
    _date.setDate(1);
    _date.setDate(_date.getDate() - 1);
    return _date;
}
/**
 * 获取本周第一天（周日为起始）
 * @param date
 * @returns {*|Date}
 */
Date.firstDayOfWeek = function(date){
    if(typeof date != 'object') date = null;
    var _date = date || new Date();
    _date.setDate(_date.getDate() - _date.getDay());
    return _date;
}
/**
 * 获取本周最后一天（周六为终止）
 * @param date
 * @returns {*|Date}
 */
Date.lastDayOfWeek = function(date) {
    if(typeof date != 'object') date = null;
    var _date = date || new Date();
    _date.setDate(_date.getDate() - _date.getDay() + 6);
    return _date;
};

