const { Events, AuditLogEvent, Colors, ChannelType } = require("discord.js");
const { client } = require("../../../server");
const { logModel, rollbackModel } = require('../../../models');
const config = require("../../../config");
const { getEntry, error } = require("../../../functions");

client.on(Events.GuildBanAdd, async (member) => {
    if (member.guild.id !== config.serverId) return;
    const entry = await getEntry(client, member.guild.id, AuditLogEvent.MemberBanAdd);
    const _member = member.guild.members.cache.get(entry.executor.id);
    if (client.user.id == entry.executor.id) return;

    const rollbacking = await rollbackModel.findOne({ name: Events.GuildBanAdd });
    const loggingData = await logModel.findOne({ name: Events.GuildBanAdd });

    let message, embed;
    if (loggingData) {
        const logChannel = client.channels.cache.get(loggingData.channelId);
        if (!logChannel) return error(Events.GuildBanAdd + ' log ayarlanmış fakat kanal bulunamadı!')

        embed = {
            color: Colors.White,
            title: 'Kullanıcı Yasaklandı!',
            description: `\`🚫\` **${member.user.tag}** adlı kullanıcı yasaklandı! <t:${Math.floor(Date.now() / 1000)}:R>`,
            fields: [
                {
                    name: "\`🫡\` Yasaklayan",
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

    member.guild.members.unban(member.user.id)
        .then(async () => {
            if (!message) return;
            const channel = member.guild.channels.cache.filter(c => c.type == ChannelType.GuildText).first();
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 1 }).then(invite => invite);
            const inviteLink = `https://discord.gg/${invite.code}`;
            const user = client.users.cache.get(member.user.id);

            user.send({ content: `Bir hata sebebiyle sunucudan atıldınız. Bunun için üzgünüz. \nGeri gelebilirseniz mutlu oluruz. ${inviteLink}` })
                .then(() => {
                    embed.fields.push({ name: "\`↩️\` Geri Davet", value: `\`✅\` Kullanıcıya Direk Mesaj gönderildi.` })
                })
                .catch((e) => {
                    embed.fields.push({ name: "\`↩️\` Geri Davet", value: `\`❎\` Kullanıcıya Direk Mesaj gönderilemedi. Kullanıcı Direk Mesajları kapatmış olabilir.` })
                });

            embed.title = 'Kullanıcı Yasaklanması Kaldırıldı!';
            embed.description = `\`✅\` **${member.user.tag}** adlı kullanıcının yasağı kaldırıldı! <t:${Math.floor(Date.now() / 1000)}:R>`;
            message.edit({ embeds: [embed] }).catch((e) => error(e));
        })
        .catch((e) => {
            if (!message) return;
            embed.title = 'Kullanıcı Yasaklandı Fakat Yasak Kaldırılamadı!';
            embed.description = `\`❎\` **${member.user.tag}** adlı kullanıcının yasağı kaldırılamadı! <t:${Math.floor(Date.now() / 1000)}:R>`;
            embed.fields.push({ name: "\`↩️\` Geri Davet", value: '\`❎\` Ban kaldırılamadığı için gönderilmedi!' })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
            error(e)
        })
})