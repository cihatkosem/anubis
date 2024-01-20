const { Events, Colors, AuditLogEvent } = require("discord.js");
const { logModel, rollbackModel, userModel } = require("../../../models");
const { getEntry, log, error } = require("../../../functions");
const { client } = require("../../../server");
const config = require("../../../config");

client.on(Events.GuildRoleDelete, async (role) => {
    if (role.guild.id !== config.serverId) return;
    const entry = await getEntry(client, role.guild.id, AuditLogEvent.RoleDelete);
    const member = role.guild.members.cache.get(entry.executor.id);

    if (client.user.id == entry.executor.id) return;

    const rollbacking = await rollbackModel.findOne({ name: Events.GuildRoleDelete });
    const loggingData = await logModel.findOne({ name: Events.GuildRoleDelete });

    let message, embed;
    if (loggingData) {
        const logChannel = client.channels.cache.get(loggingData.channelId);
        if (!logChannel) return error(Events.GuildRoleDelete + ' log ayarlanmış fakat kanal bulunamadı!')

        const rolePermissions = role.permissions.toArray();
        embed = {
            color: Colors.White,
            title: `\`🗑️\` Rol Silindi!`,
            description: `\`🗑️\` **${role.name}** adlı rol silindi! <t:${Math.floor(Date.now() / 1000)}:R>`,
            fields: [
                {
                    name: "\`🫡\` Silen",
                    value: `\`❇️\` <@${entry.executor.id}> \`${entry.executor.tag}\` \`${entry.executor.id}\` `,
                },
                {
                    name: "\`📇\` Silinen Rol",
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

    const roleDatas = {
        name: role.name,
        color: role.color,
        hoist: role.hoist,
        mentionable: role.mentionable,
        permissions: role.permissions,
        position: role.position
    }

    const roleUsers = await userModel.find({ roles: { $in: [role.id] } });

    for (let user of roleUsers) {
        const userData = await userModel.findOne({ _id: user._id });
        userData.roles = userData.roles.filter(r => r != role.id);
        userData.save().catch((e) => null);
    }

    role.guild.roles.create(roleDatas)
        .then(async (newRole) => {
            if (!message) return;
            embed.title = `\`✅\` Silinen Rol Tekrar Oluşturuldu!`;
            embed.description = `\`✅\` Silinen **${role.name}** adlı rol tekrar oluşturuldu! <t:${Math.floor(Date.now() / 1000)}:R>`;
            embed.fields.push({ name: "\`✅\` İşlem", value: "\`❇️\` Rol geri alındı." })
            for (let user of roleUsers) {
                const guildMember = role.guild.members.cache.get(user.id);
                const userData = await userModel.findOne({ _id: user._id });
                userData.roles.push(newRole.id)
                userData.save().catch((e) => null);
                if (guildMember) guildMember.roles.add(newRole.id).catch((e) => error(e));
            }
            message.edit({ embeds: [embed] }).catch((e) => error(e));
        })
        .catch((e) => {
            if (!message) return;
            embed.title = `\`❎\` Silinen Rol Tekrar Oluşturulamadı!`;
            embed.description = `\`❎\` Silinen **${role.name}** adlı rol geri alınamadı! <t:${Math.floor(Date.now() / 1000)}:R>`;
            embed.fields.push({ name: "\`❎\` İşlem", value: "\`❇️\` Rol geri alınamadı." })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
            error(e)
        })
})