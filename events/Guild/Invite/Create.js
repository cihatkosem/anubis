const { Events, Colors } = require("discord.js");
const { logModel } = require('../../../models');
const { setInvites } = require("../../../functions");
const { client } = require("../../../server");
const config = require("../../../config");

client.on(Events.InviteCreate, async (invite) => {
    if (invite.guild.id !== config.serverId) return;
    await setInvites(client, invite.guild.id)

    if (client.user.id == invite.inviterId) return;

    const loggingData = await logModel.findOne({ name: Events.InviteCreate });
    if (!loggingData) return;

    const logChannel = client.channels.cache.get(loggingData.channelId);
    if (!logChannel) return;

    let embed = {
        color: Colors.White,
        title: `\`✅\` Davet Oluşturuldu!`,
        description: `\`❇️\` **${invite.code}** kodlu davet oluşturuldu! <t:${Math.floor(Date.now() / 1000)}:R>`,
        fields: [
            {
                name: "\`🫡\` Oluşturan",
                value: `\`❇️\` <@${invite.inviterId}> \`${invite.inviterId}\``,
            },
            {
                name: "\`🔗\` Davet Linki",
                value: `\`❇️\` https://discord.gg/${invite.code} \`${invite.code}\``,
            }
        ]
    }

    logChannel.send({ embeds: [embed] })
})