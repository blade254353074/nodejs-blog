var hbs = require('hbs');

hbs.registerHelper('timeFormatter', function(date, format) {
    if (!date) return;
    if (typeof format !== 'string') format = "yyyy-MM-dd HH:mm:ss";
    date = new Date(date);
    if (!date instanceof Date) return;
    var dict = {
        "yyyy": date.getFullYear(),
        "M": date.getMonth() + 1,
        "d": date.getDate(),
        "H": date.getHours(),
        "m": date.getMinutes(),
        "s": date.getSeconds(),
        "MM": ("" + (date.getMonth() + 101)).substr(1),
        "dd": ("" + (date.getDate() + 100)).substr(1),
        "HH": ("" + (date.getHours() + 100)).substr(1),
        "mm": ("" + (date.getMinutes() + 100)).substr(1),
        "ss": ("" + (date.getSeconds() + 100)).substr(1)
    };
    return format.replace(/(yyyy|MM?|dd?|HH?|ss?|mm?)/g, function() {
        return dict[arguments[0]];
    });
});

hbs.registerHelper('dateDiff', function(hisTime, nowTime) {
    if (!arguments.length) return '';
    var arg = arguments,
        now = arg[1] instanceof Date ? arg[1] : new Date().getTime(),
        diffValue = now - new Date(arg[0]).getTime(),
        result = '',

        minute = 1000 * 60,
        hour = minute * 60,
        day = hour * 24,
        halfamonth = day * 15,
        month = day * 30,
        year = month * 12,

        _year = diffValue / year,
        _month = diffValue / month,
        _week = diffValue / (7 * day),
        _day = diffValue / day,
        _hour = diffValue / hour,
        _min = diffValue / minute;

    if (_year >= 1) result = parseInt(_year) + "年前";
    else if (_month >= 1) result = parseInt(_month) + "个月前";
    else if (_week >= 1) result = parseInt(_week) + "周前";
    else if (_day >= 1) result = parseInt(_day) + "天前";
    else if (_hour >= 1) result = parseInt(_hour) + "个小时前";
    else if (_min >= 1) result = parseInt(_min) + "分钟前";
    else result = "刚刚";
    return result;
});

hbs.registerHelper('paging', function(total, pn, link) {
    var html,
        max,
        p;
    if (typeof total === 'undefined' || typeof total === 'undefined') {
        return '';
    }
    html = '';
    max = parseInt(pn) + 4;

    html += '<nav class="text-center"><div class="pagination">';
    if (link === undefined) {
        link = '#/link/';
    }
    if (total > 1) {
        if (pn <= 1) {
            html += '<li class="disabled"><a href="javascript:;" class="prev" aria-label="上一页"><span aria-hidden="true">&laquo; 上一页</span></a></li>\n';
        } else {
            html += '<li><a href="' + link + (parseInt(pn) - 1) + '" class="prev" aria-label="上一页"><span aria-hidden="true">&laquo; 上一页</span></a></li>\n';
        }
        if (total > 10) {
            if (pn <= 5) {
                max = 10;
                p = 1;
            } else {
                if (max >= total) {
                    max = total;
                }
                p = pn - 5;
            }

            for (p; p <= max; p++) {
                if (pn == p) {
                    html += '<li class="active"><a class="page-link" data-pn="' + p + '">' + p + ' <span class="sr-only">(当前页)</span></a></li>\n';
                } else {
                    html += '<li><a href="' + link + p + '" class="page-link" data-pn="' + p + '">' + p + ' </a></li>\n';
                }
            }
        } else {
            for (p = 1; p <= total; p++) {
                if (pn == p) {
                    html += '<li class="active"><a class="page-link" data-pn="' + p + '">' + p + ' <span class="sr-only">(当前页)</span></a></li>\n';
                } else {
                    html += '<li><a href="' + link + p + '" class="page-link" data-pn="' + p + '">' + p + ' </a></li>\n';
                }
            }
        }
        if (pn == total) {
            html += '<li class="disabled"><a href="javascript:;" class="next" aria-label="下一页"><span aria-hidden="true">下一页 &raquo;</span></a></li>\n';
        } else {
            html += '<li><a href="' + link + (parseInt(pn) + 1) + '" class="next" aria-label="下一页"><span aria-hidden="true">下一页 &raquo;</span></a></li>\n';
        }
    }
    html += '</nav></div>';
    return html;
});


module.exports = hbs;
