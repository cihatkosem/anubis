const { Events, AuditLogEvent, Colors } = require("discord.js");
const { inviteModel, logModel, userStatInviteModel } = require('../../../models');
const { getEntry } = require("../../../functions");
const { client } = require("../../../server");
const config = require("../../../config");

client.on(Events.GuildMemberRemove, async (member) => {
    if (member.guild.id !== config.serverId) return;
    if (client.user.id == member.user.id) return;

    const loggingData = await logModel.findOne({ name: Events.GuildMemberAdd });
    const logChannel = client.channels.cache.get(loggingData?.channelId);

    const entry = await getEntry(client, member.guild.id, AuditLogEvent.MemberKick);

    let inviteData = await inviteModel.findOne({ usesUsers: { $elemMatch: { id: member.user.id } } });
    let userInviteData = inviteData?.usesUsers?.find(u => u.id == member.user.id);

    if (inviteData && userInviteData) {
        let x = userInviteData;
        let others = inviteData.usesUsers.filter(f => f !== x);
        inviteData.usesUsers = [...others, { id: x.id, timestamp: x.timestamp, left: true, leftTimestamp: `${Date.now()}` }]
        await inviteData.save().catch((e) => null);

        let inviterStatInviteData = await userStatInviteModel.findOne({ id: inviteData.inviterId });
        if (inviterStatInviteData && inviterStatInviteData.invites.find(f => f.id == member.user.id)) {
            let others = inviterStatInviteData.invites.filter(f => f.id !== member.user.id) || [];
            inviterStatInviteData.invites = [...others, { id: member.user.id, timestamp: x.timestamp, left: true, leftTimestamp: `${Date.now()}` }]
            await inviterStatInviteData.save().catch((e) => null);
        }
    }

    let embed = {
        color: Colors.White,
        title: '\`⬅️\` Üye Ayrıldı!',
        description: `\`🤓\` **${member.user.username}** adlı üye ayrıldı! <t:${Math.floor(Date.now() / 1000)}:R>`,
        fields: [
            {
                name: "\`🤓\` Hesap Oluşturma Tarihi",
                value: `\`❇️\` <t:${Math.floor(member.user.createdAt / 1000)}:R>`,
            },
            {
                name: "\`🫡\` Davet Eden",
                value: '\`❇️\` ' + inviteData && inviteData?.inviterId ?
                    `<@${inviteData?.inviterId}> \`${inviteData?.inviterId}\`` :
                    "Bilinmiyor",
            }
        ]
    }

    if (entry.target.id == member.user.id && Date.now() - entry.createdTimestamp < 2000) {
        embed.title = "\`🦵\` Üye Atıldı!";
        embed.description = `\`🤓\` **${member.user.username}** adlı üye atıldı! <t:${Math.floor(Date.now() / 1000)}:R>`;
        embed.fields.push({
            name: "\`🫡\` Atan",
            value: `\`❇️\` <@${entry.executor.id}> \`${entry.executor.id}\``,
        })
    }

    if (loggingData && logChannel) logChannel.send({ embeds: [embed] })
})