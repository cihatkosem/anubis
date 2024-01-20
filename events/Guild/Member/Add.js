const { Events, Colors, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { client } = require("../../../server");
const { logModel, inviteModel, userStatInviteModel, userStatMutesModel, userStatJailsModel, userStatBansModel } = require('../../../models');
const config = require("../../../config");
const { error } = require("../../../functions");

client.on(Events.GuildMemberAdd, async (member) => {
    if (member.guild.id !== config.serverId) return;
    if (client.user.id == member.user.id) return;

    let userStatMuteData = await userStatMutesModel.findOne({ id: member.user.id });
    let userStatJailData = await userStatJailsModel.findOne({ id: member.user.id });
    let userStatBanData = await userStatBansModel.findOne({ id: member.user.id });

    const _memberPunishments = [
        ...(userStatMuteData?.mutes || []), 
        ...(userStatJailData?.bans?.map(m => ({ type: 'ban', ...m })) || []), 
        ...(userStatBanData?.jails?.map(m => ({ type: 'jail', ...m })) || []),
    ];

    const memberPunishments = _memberPunishments?.sort((a, b) => Number(b.date) - Number(a.date));

    const giveLoginInfo = memberPunishments?.filter(f => f.type == 'ban' || f.type == 'jail' && Number(f?.endDate) > Date.now()).length == 0;
    if (memberPunishments || memberPunishments.length > 0) {
        const chatMute = memberPunishments?.filter(f => f.type == 'chat_mute')?.sort((a, b) => Number(b.date) - Number(a.date))[0] || null;
        const voiceMute = memberPunishments?.filter(f => f.type == 'voice_mute')?.sort((a, b) => Number(b.date) - Number(a.date))[0] || null;
        const jail = memberPunishments?.filter(f => f.type == 'jail')?.sort((a, b) => Number(b.date) - Number(a.date))[0] || null;
        const ban = memberPunishments?.filter(f => f.type == 'ban')?.sort((a, b) => Number(b.date) - Number(a.date))[0] || null;

        let roles = [];

        if (chatMute && chatMute?.endDate > Date.now()) roles.push(config.chatMuteRole)
        if (voiceMute && voiceMute?.endDate > Date.now()) roles.push(config.voiceMuteRole)
        if (jail && jail?.endDate > Date.now()) roles.push(config.jailRole)
        if (ban) roles.push(config.banRole);

        member.roles.set(roles).catch((e) => error(e));

        if (ban)
            member.setNickname(`Yasaklı - ${member.user.username}`).catch((e) => error(e));
        else if (jail && jail?.endDate > Date.now())
            member.setNickname(`Jailed - ${member.user.username}`).catch((e) => error(e));
    }

    if (giveLoginInfo) {
        const manButton = new ButtonBuilder().setCustomId(`register-person-man-${member.user.id}`).setLabel('👦 Erkek').setStyle(ButtonStyle.Success);
        const womanButton = new ButtonBuilder().setCustomId(`register-person-woman-${member.user.id}`).setLabel('👩 Kadın').setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder().setCustomId(`register-stop-${member.user.id}`).setLabel('❌ İptal').setStyle(ButtonStyle.Danger);
        const actionRow = new ActionRowBuilder().addComponents(manButton, womanButton, cancelButton);

        const memberCreatedDate = Math.floor(member.user.createdAt / 1000)

        let addingRoles = [config.unregisterRole, config.eventsRole, config.giveawayRole]
        if (member?.user?.username?.includes(config?.tag)) addingRoles.push(config.tagRole)
        member.roles.set(addingRoles).catch((e) => error(e));
        member.setNickname(`${config.defaultTag} İsim | Yaş`).catch((e) => error(e));

        const channel = client.channels.cache.get(config.welcomeChannelId);
        channel.send({
            content:
                `${member} \`${member.user.id}\` **${member.guild.name}** sunucumuza hoş geldin.\n` +
                `Hesabın <t:${memberCreatedDate}:R> <t:${memberCreatedDate}:F> tarihinde oluşturulmuş! \n` +
                `Seninle birlikte **${member.guild.memberCount}** kişiye ulaştık! \n` +
                `Sol Taraftaki \`Registered\` odalarından birisine girerek kayıt olabilirsin. \n` +
                `Sunucu kurallarımızı <#1011849558772420688> kanalından okumayı unutmamalısın. \n\n` +
                '<@&1088810631131578439>',
            components: [actionRow]
        }).catch((e) => error(e));
    }

    const guild = client.guilds.cache.get(config.serverId);
    const invites = await guild.invites?.fetch().then((i) => i.map(m => m)).catch(() => []) || [];

    const _invitesDatas = await inviteModel.find({ guildId: member.guildId, deleted: false });
    const invitesDatas = _invitesDatas.filter(invite => invite.maxUses == 0 || invite.uses <= invite.maxUses);

    const _inviteData = invitesDatas.find(f => f.uses + 1 == invites.find(i => i.code === f.code)?.uses) || null;

    if (_inviteData) {
        let inviteData = await inviteModel.findOne({ _id: _inviteData?._id });
        if (inviteData) {
            const usesOthers = inviteData?.usesUsers?.filter(f => f.id !== member.user.id);

            const invData = { id: member.user.id, timestamp: `${Date.now()}` }
            inviteData.usesUsers = [...usesOthers, invData]
            inviteData.uses = inviteData.uses + 1;
            await inviteData.save().catch((e) => null);

            let inviterStatInviteData = await userStatInviteModel.findOne({ id: inviteData?.inviterId });
            if (!inviterStatInviteData && inviteData?.inviterId)
                inviterStatInviteData = await userStatInviteModel({ id: inviteData?.inviterId }).save()
                    .catch((e) => error(e));

            const inviteOthers = inviterStatInviteData?.invites?.filter(f => f.id !== member.user.id) || [];
            inviterStatInviteData.invites = [...inviteOthers, invData]
            await inviterStatInviteData.save().catch((e) => null);
        }
    }

    const loggingData = await logModel.findOne({ name: Events.GuildMemberAdd });
    const logChannel = client.channels.cache.get(loggingData?.channelId);
    if (!loggingData || !logChannel) return;

    let embed = {
        color: Colors.White,
        title: `\`➡️\` Üye Katıldı!`,
        description: `\`🤓\` **${member.user.username}** adlı üye katıldı! <t:${Math.floor(Date.now() / 1000)}:R>`,
        fields: [
            {
                name: "\`🤓\`Hesap Oluşturma Tarihi",
                value: `\`❇️\` <t:${Math.floor(member.user.createdAt / 1000)}:R>`,
            },
            {
                name: "\`🫡\` Davet Eden",
                value: '\`❇️\` ' +
                    _inviteData && _inviteData?.inviterId ?
                    `<@${_inviteData?.inviterId}> \`${_inviteData?.inviterId}\`` :
                    "Bilinmiyor",
            },
            {
                name: "\`🫡\` Davet Edenin Davet Sayısı",
                value: '\`❇️\` ' +
                    _inviteData && _inviteData?.usesUsers.length > 0 ?
                    _inviteData?.usesUsers?.filter(f => guild.members.cache.get(f.id)).length :
                    "Bilinmiyor",
            },
            {
                name: "\`🫡\` Davet Kodu",
                value: '\`❇️\` ' +
                    _inviteData && _inviteData?.code ?
                    `https://discord.gg/${_inviteData.code}` :
                    "Bilinmiyor",
            }
        ]
    }

    logChannel.send({ embeds: [embed] })
})