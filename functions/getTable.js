module.exports = (obj1, obj2, aFront = "", aBack = "", bFront = "", bBack = "") => {
    const getSpace = (obj, i) => ` `.repeat(obj.reduce((a, b) => a.length > b.length ? a : b).length - i + 1);
    const table = obj1.map((m, i) =>
        aFront + m + aBack + 
        getSpace(obj1, m.length) +
        bFront + obj2[i] + bBack
    ).join('\n');
    return table;
}