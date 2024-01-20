const { Events, AuditLogEvent, Colors } = require("discord.js");
const { logModel, rollbackModel } = require('../../../models');
const { getEntry, error } = require("../../../functions");
const { client } = require("../../../server");
const config = require("../../../config");

client.on(Events.GuildBanRemove, async (member) => {
    if (member.guild.id !== config.serverId) return;
    const entry = await getEntry(client, member.guild.id, AuditLogEvent.MemberBanRemove);
    const _member = member.guild.members.cache.get(entry.executor.id);
    if (client.user.id == entry.executor.id) return;

    const rollbacking = await rollbackModel.findOne({ name: Events.GuildBanRemove });
    const loggingData = await logModel.findOne({ name: Events.GuildBanRemove });

    let message, embed;
    if (loggingData) {
        const logChannel = client.channels.cache.get(loggingData.channelId);
        if (!logChannel) return error(Events.GuildBanRemove + ' log ayarlanmış fakat kanal bulunamadı!')
    
        embed = {
            color: Colors.White,
            title: `\`✅\` Yasak Kaldırıldı!`,
            description: `\`✅\` **${member.user.tag}** adlı kullanıcının yasağı kaldırıldı! <t:${Math.floor(Date.now() / 1000)}:R>`,
            fields: [
                {
                    name: "\`🫡\` Yasağı Kaldıran",
                    value: `\`➡️\` <@${entry.executor.id}> \`${entry.executor.tag}\` \`${entry.executor.id}\` `,
                },
                {
                    name: "\`🤓\` Kullanıcı",
                    value: `\`➡️\` <@${member.user.id}> \`${member.user.tag}\` \`${member.user.id}\``,
                }
            ]
        }

        message = await logChannel.send({ embeds: [embed] }).catch((e) => error(e));
    }

    if (!rollbacking) return;
    if (rollbacking.excluded.find(f => f.type == 'user' && f.id == entry.executor.id)) return;
    if (rollbacking.excluded.filter(f => _member._roles.includes(f.id)).length > 0) return;

    member.guild.members.ban(member.user.id)
        .then(() => {
            if (!message) return;
            embed.title = `\`🚫\` Yaşağı kaldırılan kullanıcı tekrar yasaklandı!`
            embed.description = `\`🚫\` Yasağı kaldırılan **${member.user.tag}** adlı kullanıcının tekrar yasaklandı! <t:${Math.floor(Date.now() / 1000)}:R>`;
            embed.fields.push({ name: "\`❇️\` İşlem", value: "\`➡️\` Yasağı kaldırılan kullanıcı tekrar yasaklandı." })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
        })
        .catch((e) => {
            if (!message) return;
            embed.title = `\`❎\` Yaşağı kaldırılan kullanıcı tekrar yasaklanamadı!`
            embed.description = `\`❎\` Yasağı kaldırılan **${member.user.tag}** adlı kullanıcının tekrar yasaklanamadı! <t:${Math.floor(Date.now() / 1000)}:R>`;
            embed.fields.push({ name: "\`❇️\` İşlem", value: "\`➡️\` Yasağı kaldırılan kullanıcı tekrar yasaklanamadı." })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
            error(e)
        })
})