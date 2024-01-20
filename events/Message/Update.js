const { Events, Colors } = require("discord.js");
const { client } = require("../../server");
const { logModel } = require("../../models");
const config = require("../../config");

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    if (oldMessage.guildId !== config.serverId) return;
    if (oldMessage.author.id == client.user.id) return;
    if (oldMessage.author.bot) return;

    const loggingData = await logModel.findOne({ name: Events.MessageUpdate });
    if (!loggingData) return;

    const logChannel = client.channels.cache.get(loggingData.channelId);
    if (!logChannel) return;

    let embed = {
        color: Colors.White,
        title: `Mesaj Düzenlendi!`,
        description: `**${oldMessage.author.tag}** adlı kullanıcının mesajı düzenlendi! <t:${Math.floor(Date.now() / 1000)}:R>`,
        fields: [
            {
                name: "Eski Mesaj",
                value: `\`\`\`fix\n${oldMessage.content}\`\`\``,
            },
            {
                name: "Yeni Mesaj",
                value: `\`\`\`fix\n${newMessage.content}\`\`\``,
            }
        ]
    }

    logChannel.send({ embeds: [embed] })
})