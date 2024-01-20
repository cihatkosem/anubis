module.exports = function (error) {
    const date = new Date().toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" });
    const time = new Date().toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul" });
    return console.log(`[${date} ${time}]`, error);
}