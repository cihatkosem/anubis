const { Events, AuditLogEvent, Colors } = require("discord.js");
const { logModel, rollbackModel } = require("../../../models");
const { getEntry, error } = require("../../../functions");
const { client } = require("../../../server");
const config = require("../../../config");

client.on(Events.GuildRoleCreate, async (role) => {
    if (role.guild.id !== config.serverId) return;
    const entry = await getEntry(client, role.guild.id, AuditLogEvent.RoleCreate);

    const member = role.guild.members.cache.get(entry.executor.id);

    if (client.user.id == entry.executor.id) return;

    const rollbacking = await rollbackModel.findOne({ name: Events.ChannelCreate });
    const loggingData = await logModel.findOne({ name: Events.GuildRoleCreate });

    let message, embed;
    if (loggingData) {
        const logChannel = client.channels.cache.get(loggingData.channelId);
        if (!logChannel) return error(Events.GuildRoleCreate + ' log ayarlanmış fakat kanal bulunamadı!')

        const rolePermissions = role.permissions.toArray();
        embed = {
            color: Colors.White,
            title: `\`✅\` Rol Oluşturuldu!`,
            description: `\`✅\` **${role.name}** adlı rol oluşturuldu! <t:${Math.floor(Date.now() / 1000)}:R>`,
            fields: [
                {
                    name: "\`🫡\` Oluşturan",
                    value: `\`❇️\` <@${entry.executor.id}> \`${entry.executor.tag}\` \`${entry.executor.id}\` `,
                },
                {
                    name: "\`📇\` Oluşturulan Rol",
                    value: `\`❇️\` <@&${role.id}> \`${role.name}\` \`${role.id}\``,
                }
            ]
        }

        if (rolePermissions > 0)
            embed.fields.push({ name: "\`🗒️\` Yetkileri", value: `\`\`\`md\n${rolePermissions.map(m => `- ` + m).join('\n')}\`\`\`` })

        message = await logChannel.send({ embeds: [embed] }).catch((e) => error(e));
    }

    if (!rollbacking) return;
    if (rollbacking.excluded.find(f => f.type == 'user' && f.id == entry.executor.id)) return;
    if (rollbacking.excluded.filter(f => member._roles.includes(f.id)).length > 0) return;

    role.delete()
        .then(() => {
            if (!message) return;
            embed.title = `\`🗑️\` Oluşturulan Rol Silindi!`
            embed.description = `\`🗑️\` **${role.name}** adlı rol silindi! <t:${Math.floor(Date.now() / 1000)}:R>`;
            embed.fields.push({ name: "\`✅\` İşlem", value: "\`❇️\` Rol silindi." })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
        })
        .catch((e) => {
            if (!message) return;
            embed.title = `\`❎\` Oluşturulan Rol Silinemedi!`
            embed.description = `\`❎\` **${role.name}** adlı rol silinemedi! <t:${Math.floor(Date.now() / 1000)}:R>`;
            embed.fields.push({ name: "\`❎\` İşlem", value: "\`❇️\` Rol silinemedi." })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
            error(e)
        })
})