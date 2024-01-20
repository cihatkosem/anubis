const error = require("./error");
const log = require("./log");

module.exports = compareObjects;

function compareObjects(firstObject, secondObject, loop = 0) {
    if (loop >= 5) return [];
    let comparison = [];
    try {
        for (let addedKey of Object.keys(secondObject).filter(f => !Object.keys(firstObject).find(ff => ff == f)))
            comparison.push({ key: addedKey, old: null, new: secondObject[addedKey] })

        for (let firstKey of Object.keys(firstObject)) {
            const key = firstKey;
            const oldV = firstObject[key] || null;
            const newV = secondObject[Object.keys(secondObject).find(k => k == key)] || null;
            const KeyType = typeof oldV == typeof newV ? typeof oldV : null;

            if (!oldV && !newV) continue;

            if (!oldV || !newV) {
                comparison.push({ key, old: oldV, new: newV });
            } else if (['number', 'bigint', 'string', 'boolean'].includes(KeyType)) {
                if (oldV.toString() != newV.toString()) comparison.push({ key, old: oldV, new: newV });
            } else if (KeyType == 'object') {
                const compares = compareObjects(oldV, newV, loop + 1);
                if (compares.length > 0) comparison.push({ key, old: oldV, new: newV });
            } else {
                comparison.push({ key, old: oldV, new: newV });
            }
        }
    } catch (e) {
        error('compareObjects fonksiyonunda hata oluştu!', e)
    }

    return comparison;
}