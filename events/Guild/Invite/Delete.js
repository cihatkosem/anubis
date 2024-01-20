const { Events, Colors, AuditLogEvent } = require("discord.js");
const { logModel, inviteModel } = require('../../../models');
const { setInvites } = require("../../../functions");
const { client } = require("../../../server");
const config = require("../../../config");

client.on(Events.InviteDelete, async (invite) => {
    if (invite.guild.id !== config.serverId) return;
    await setInvites(client, invite.guild.id)

    if (client.user.id == invite.inviterId) return;

    const entry = await invite.guild.fetchAuditLogs({ type: AuditLogEvent.InviteDelete }).then(audit => audit.entries.first());
    const loggingData = await logModel.findOne({ name: Events.InviteDelete });
    const inviteData = await inviteModel.findOne({ code: invite.code });
    const logChannel = client.channels.cache.get(loggingData?.channelId);
    if (!loggingData || !logChannel) return;

    let embed = {
        color: Colors.White,
        title: `\`🗑️\` Davet Silindi!`,
        description: `\`❇️\` **${invite.code}** kodlu davet silindi! <t:${Math.floor(Date.now() / 1000)}:R>`,
        fields: [
            {
                name: "\`🫡\` Silen",
                value: `\`❇️\` <@${entry?.executor?.id}> \`${entry?.executor?.id}\``,
            },
            {
                name: "\`🤓\` Davet Sahibi",
                value: `\`❇️\` <@${inviteData?.inviterId}> \`${inviteData?.inviterId}\``,
            }
        ]
    }

    logChannel.send({ embeds: [embed] })
})