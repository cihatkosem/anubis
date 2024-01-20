const { ChannelType, Attachment, AttachmentBuilder } = require("discord.js");
const { writeFileSync, readFileSync } = require("fs");

module.exports = {
    id: 'test',
    names: ["test"],
    permission: 'admins',
    description: 'Test komutudur.',
    run: async (client, command, message, args) => {

        message.channel.send({ content: 'deneme' })
            .then(msg => {
                msg.react('👍')
                msg.react('👎')
            })

        return;
    }
}