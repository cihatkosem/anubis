const { Colors } = require("discord.js");
const { deletedMsgModel } = require("../models");

module.exports = {
    id: 'snipe',
    names: ["snipe"],
    permission: 'dependent',
    description: 'En son silinen mesajı gösterir.',
    run: async (client, command, message, args) => {
        const deletedMsgs = await deletedMsgModel.find({ channelId: message.channel.id });
        const lastDeletedMsg = deletedMsgs.sort((a, b) => Number(b.deletedDate) - Number(a.deletedDate))[0];

        if (!lastDeletedMsg) return message.reply({ content: '\`⚠️\` Hiç mesaj silinmemiş.' });

        const embed = {
            color: Colors.White,
            title: 'En son silinen mesaj:',
            fields: [
                { name: '\`❇️\` Mesaj Sahibi:', value: `<@${lastDeletedMsg.authorId}>`, inline: true },
                { name: '\`❇️\` Mesajı Silen:', value: `<@${lastDeletedMsg.executorId}>`, inline: true },   
                { name: '\`❇️\` Mesajın Silindiği Tarih:', value: `<t:${Math.floor(lastDeletedMsg.deletedDate / 1000)}:R>`, inline: true },
                { name: '\`❇️\` Mesajın İçeriği:', value: `\`\`\`${lastDeletedMsg.content.replaceAll('`', '')}\`\`\`` },
            ],
            footer: {
                text: `Bu mesaj ${message.author.tag} tarafından istendi.`
            }
        }

        message.delete().catch((e) => error(e));
        return message.channel.send({ embeds: [embed] })
            .then(msg => setTimeout(() => { if (message.deletable) msg.delete().catch((e) => error(e)) }, 10000))
            .catch((e) => error(e));
    }
}