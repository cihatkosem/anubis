const { Events, AuditLogEvent, Colors } = require("discord.js");
const { client } = require("../../../server");
const { logModel, rollbackModel } = require("../../../models");
const config = require("../../../config");
const { toCompare, getEntry, roleDatas, error } = require("../../../functions");

client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
    if (oldRole.guild.id !== config.serverId) return;
    const entry = await getEntry(client, oldRole.guild.id, AuditLogEvent.RoleUpdate);

    if (client.user.id == entry.executor.id || !entry) return;
    const rollbacking = await rollbackModel.findOne({ name: Events.GuildRoleUpdate });
    const loggingData = await logModel.findOne({ name: Events.GuildRoleUpdate });
    const changedKeys = toCompare(roleDatas(oldRole), roleDatas(newRole))
    const member = oldRole.guild.members.cache.get(entry?.executor?.id);

    let message, embed;
    if (loggingData) {
        const logChannel = client.channels.cache.get(loggingData.channelId);
        if (!logChannel) return error(Events.GuildRoleUpdate + ' log ayarlanmış fakat kanal bulunamadı!')

        embed = {
            color: Colors.White,
            title: `\`🔃\` Rol Güncellendi!`,
            description: `\`🔃\` **${oldRole.name}** adlı rol güncellendi! <t:${Math.floor(Date.now() / 1000)}:R>`,
            fields: [
                {
                    name: "\`🔃\` Güncelleyen",
                    value: `<@${entry?.executor?.id}> \`${entry?.executor?.tag}\` \`${entry?.executor?.id}\` `,
                },
                {
                    name: "\`🔃\` Güncellenen Rol",
                    value: `<@&${oldRole.id}> \`${oldRole.name}\` \`${oldRole.id}\``,
                },
                {
                    name: "\`🔃\` Değişen Alanlar",
                    value: changedKeys.map(m => {
                        if (m.key == 'permissions') {
                            const oldPerms = m.old.sort() || [], newPerms = m.new.sort() || [];
                            const changes1 = newPerms.filter(p => !oldPerms.includes(p));
                            const changes2 = oldPerms.filter(p => !newPerms.includes(p));

                            return (changes1.length > 0 ? `\`➕\` ${changes1.map(c => `\`${c}\``).join(', ')} \n` : '') +
                                (changes2.length > 0 ? `\`➖\` ${changes2.map(c => `\`${c}\``).join(', ')} \n` : '')
                        }

                        return `\`❇️\` \`${m.key}\` \n\`➖\` ${m.old} \n\`➕\` ${m.new}`
                    }).join('\n')
                }
            ]
        }

        message = await logChannel.send({ embeds: [embed] }).catch((e) => error(e));
    }

    if (!rollbacking) return;
    if (rollbacking.excluded.find(f => f.type == 'user' && f.id == entry?.executor?.id)) return;
    if (rollbacking.excluded.filter(f => member._roles.includes(f.id)).length > 0) return;

    const _roleDatas = {
        name: oldRole.name,
        color: oldRole.color,
        hoist: oldRole.hoist,
        mentionable: oldRole.mentionable,
        permissions: oldRole.permissions,
        position: oldRole.position
    }

    newRole.edit(_roleDatas)
        .then(() => {
            if (!message) return;
            embed.title = `\`↩️\` Düzenlenen Rol Verileri Geri Alındı!`;
            embed.description = `\`↩️\` Güncellenen **${oldRole.name}** adlı rol tekrar eski haline getirildi! <t:${Math.floor(Date.now() / 1000)}:R>`;
            embed.fields.push({ name: "\`✅\` İşlem", value: "\`❇️\` Rol geri alındı." })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
        })
        .catch((e) => {
            if (!message) return;
            embed.title = `\`❎\` Düzenlenen Rol Verileri Geri Alınamadı!`;
            embed.description = `\`❎\` Güncellenen **${oldRole.name}** adlı rol geri alınamadı! <t:${Math.floor(Date.now() / 1000)}:R>`;
            embed.fields.push({ name: "\`❎\` İşlem", value: "\`❇️\` Rol geri alınamadı." })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
            error(e)
        })
})