const config = require("../config");

module.exports = {
    id: 'server-tag',
    names: ["tag"],
    permission: 'everyone',
    description: 'Sunucu tagını gösterir.',
    run: async (client, command, message, args) => {
        return message.channel.send({ content: config.tag });
    }
}