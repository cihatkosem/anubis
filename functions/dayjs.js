const DayJs = require("dayjs");
require('dayjs/locale/tr')

DayJs.extend(require('dayjs/plugin/relativeTime'))
DayJs.extend(require('dayjs/plugin/utc'));
DayJs.extend(require('dayjs/plugin/timezone'));
DayJs.locale('tr');

/**
 * 
 * @param {*} format valueOf | DD/MM/YYYY HH:mm:ss:SSS | DD/MM/YYYY | HH:mm:ss:SSS etc.
 * @param {*} date If date value is there, data value converting to your format else current date converting to your format.
 * @returns 
 */
module.exports = (format, date, utc = true) => {
    if (format == "valueOf") return DayJs(date).valueOf()
    if (!utc) return DayJs(date).format(format)
    return DayJs(date).utcOffset(180).format(format)
}
/**
 * 
 * @param {*} date from now to date;
 * @returns 
 */
module.exports.fromNow = (date) => DayJs().to(DayJs(date))

module.exports.dateToNumber = (date) => new Date(date.split(".").reverse().join('-') + "T00:00:00-00:01").getTime();