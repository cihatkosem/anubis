const { Events, AuditLogEvent, Colors } = require("discord.js");
const { logModel, rollbackModel } = require('../../models');
const { getEntry, error } = require("../../functions");
const { client } = require("../../server");
const config = require("../../config");

client.on(Events.ChannelCreate, async (channel) => {
    if (channel.guild.id !== config.serverId) return;
    const entry = await getEntry(client, channel.guild.id, AuditLogEvent.ChannelCreate);
    const member = channel.guild.members.cache.get(entry.executor.id);

    if (client.user.id == entry.executor.id) return;

    const rollbacking = await rollbackModel.findOne({ name: Events.ChannelCreate });
    const loggingData = await logModel.findOne({ name: Events.ChannelCreate });

    let message, embed;
    if (loggingData) {
        const logChannel = client.channels.cache.get(loggingData.channelId);
        if (!logChannel) return error(Events.ChannelCreate + ' log ayarlanmış fakat kanal bulunamadı!')

        embed = {
            color: Colors.White,
            title: `\`✅\` Kanal Oluşturuldu!`,
            description: `\`✅\` **${channel.name}** adlı kanal oluşturuldu! <t:${Math.floor(Date.now() / 1000)}:R>`,
            fields: [
                {
                    name: "\`🫡\` Oluşturan",
                    value: `\`❇️\` <@${entry.executor.id}> \`${entry.executor.tag}\` \`${entry.executor.id}\` `,
                },
                {
                    name: "\`⏹️\` Kanal",
                    value: `\`❇️\` <#${channel.id}> \`${channel.name}\` \`${channel.id}\``,
                }
            ]
        }

        message = await logChannel.send({ embeds: [embed] }).catch((e) => error(e));
    }

    if (!rollbacking) return;
    if (rollbacking.excluded.find(f => f.type == 'user' && f.id == entry.executor.id)) return;
    if (rollbacking.excluded.filter(f => member._roles.includes(f.id)).length > 0) return;

    channel.delete()
        .then(() => {
            if (!message) return;
            embed.title = `\`🗑️\` Oluşturulan kanal silindi!`;
            embed.description = `\`🗑️\` **${channel.name}** adlı kanal silindi! <t:${Math.floor(Date.now() / 1000)}:R>`;
            message.edit({ embeds: [embed] }).catch((e) => error(e));
        })
        .catch((e) => {
            if (!message) return;
            embed.title = `\`❎\` Oluşturulan kanal silinemedi!`;
            embed.description = `\`❎\` **${channel.name}** adlı kanal silinemedi! <t:${Math.floor(Date.now() / 1000)}:R>`;
            message.edit({ embeds: [embed] }).catch((e) => error(e));
            error(e)
        })
})
