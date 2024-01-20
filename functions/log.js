const dayjs = require("./dayjs");

module.exports = ({ text, color, time, version }) => {
    if (!text) return;
    const colors = [
        { name: "red", color: '\x1b[31m%s\x1b[0m' },
        { name: "green", color: '\x1b[32m%s\x1b[0m' },
        { name: "yellow", color: '\x1b[33m%s\x1b[0m' },
        { name: "blue", color: '\x1b[34m%s\x1b[0m' },
        { name: "magenta", color: '\x1b[35m%s\x1b[0m' },
        { name: "cyan", color: '\x1b[36m%s\x1b[0m' }
    ]
    const _color = colors.find(f => f.name == (color || 'blue')).color;
    const timeText = time ? `${dayjs('HH:mm:ss:SSS')} | ` : '';
    const versionText = version ? `[${version}] | ` : '';
    console.log(_color, versionText + timeText + text)
}