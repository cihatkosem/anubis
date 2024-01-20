const config = require("./config.js");
const { log, files, setInvites, punishmentRemoving, error } = require("./functions");
const { commandModel, userStatMutesModel, userStatJailsModel, userStatBansModel } = require('./models');

const { Client, Collection, GatewayIntentBits, Partials, Events } = require("discord.js");
const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    partials: Object.keys(Partials)
});

const mongoose = require('mongoose');

const CustomEvents = {
    MemberTagAdd: "userTagAdd",
    MemberTagRemove: "userTagRemove",
    GuildMemberJail: "guildMemberJail",
    GuildMemberMute: "guildMemberMute",
    GuildMemberBlock: "guildMemberBlock",
    GuildMemberUnjail: "guildMemberUnjail",
    GuildMemberUnmute: "guildMemberUnmute",
    GuildMemberUnblock: "guildMemberUnblock",
    GuildMemberVoice: "guildMemberVoice",
}

module.exports = { client, CustomEvents }

async function loader() {
    log({ text: `System starts with ${files().length} file.`, color: "yellow", time: true })
    const collections = ['prefixCommands']
    for (let collection of collections) client[collection] = new Collection()

    for (let file of files('./events')) require(file)

    for (let collection of collections) {
        for (let file of files(`./${collection}`).filter(f => f.endsWith('.js'))) {
            const command = require(`./${file}`)
            const name = command?.name || (command?.names?.length || 0) > 0 ? command?.names[0] : 'system';
            client[collection].set(name, command)
        }
    }

    const commandsDatas = await commandModel.find();

    const deletingCommands = commandsDatas.filter(c => !client['prefixCommands'].find(i => i.id == c.id))
    for (let command of deletingCommands) await commandModel.deleteOne({ id: command.id })

    for (let command of client['prefixCommands']?.map(m => m)) {
        const commandData = await commandModel.findOne({ id: command.id });
        const { id, names, permission, description } = command;
        if (commandData) {
            const { authorities, available } = commandData;
            const data = { names, authorities, available, permission, description };
            await commandModel.updateOne({ id }, data, { upsert: true }).catch((e) => error(e))
        } else {
            await commandModel({ id, names, authorities: [], available: false }).save().catch((e) => null);
        }
    }

    for (let id of client.guilds.cache.get(config.serverId).members.cache.filter(f => f._roles.length == 0).map(m => m.user.id)) {
        const member = client.guilds.cache.get(config.serverId).members.cache.get(id);

        if (!member) continue;

        let userStatMuteData = await userStatMutesModel.findOne({ id });
        let userStatJailData = await userStatJailsModel.findOne({ id });
        let userStatBanData = await userStatBansModel.findOne({ id });

        let _memberPunishments = [];

        if (userStatMuteData?.mutes?.length > 0) memberPunishments = [...memberPunishments, ...userStatMuteData?.mutes];
        if (userStatJailData?.bans?.length > 0) memberPunishments = [...memberPunishments, ...userStatJailData?.bans?.map(m => ({ type: 'ban', ...m }))];
        if (userStatBanData?.jails?.length > 0) memberPunishments = [...memberPunishments, ...userStatBanData?.jails?.map(m => ({ type: 'jail', ...m }))];

        const memberPunishments = _memberPunishments.sort((a, b) => Number(b?.date) - Number(a?.date));

        const notPunishment = memberPunishments?.filter(f => f.type == 'ban' || f.type == 'jail' && Number(f?.endDate) > Date.now()).length == 0;
        if (memberPunishments || memberPunishments.length > 0) {
            const chatMute = memberPunishments?.filter(f => f.type == 'chat_mute').sort((a, b) => Number(b.date) - Number(a.date))[0] || null;
            const voiceMute = memberPunishments?.filter(f => f.type == 'voice_mute').sort((a, b) => Number(b.date) - Number(a.date))[0] || null;
            const jail = memberPunishments?.filter(f => f.type == 'jail').sort((a, b) => Number(b.date) - Number(a.date))[0] || null;
            const ban = memberPunishments?.filter(f => f.type == 'ban').sort((a, b) => Number(b.date) - Number(a.date))[0] || null;

            let roles = [];

            if (chatMute && chatMute?.endDate > Date.now()) roles.push(config.chatMuteRole)
            if (voiceMute && voiceMute?.endDate > Date.now()) roles.push(config.voiceMuteRole)
            if (jail && jail?.endDate > Date.now()) roles.push(config.jailRole)
            if (ban) roles.push(config.banRole);

            member.roles.set(roles).catch((e) => error(e))

            if (ban)
                member.setNickname(`Yasaklı - ${member.user.username}`).catch((e) => error(e))
            else if (jail && jail?.endDate > Date.now())
                member.setNickname(`Jailed - ${member.user.username}`).catch((e) => error(e))
        }

        if (notPunishment) {
            let addingRoles = [config.unregisterRole, config.eventsRole, config.giveawayRole]
            if (member?.user?.username?.includes(config?.tag)) addingRoles.push(config.tagRole)
            member.roles.set(addingRoles).catch((e) => error(e))
            member.setNickname(`${config.defaultTag} İsim | Yaş`).catch((e) => error(e))
        }
    }
}

mongoose.set('strictQuery', true)
mongoose.connect(config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => log({ text: `MongoDB connected.`, color: "green", time: true }))
    .catch((e) => error(e))

client.login(config.token)
    .then(() => loader().catch((e) => error(e)))
    .then(async () => await setInvites(client, config.serverId).catch((e) => error(e)))
    .then(() => punishmentRemoving(client))
    .catch((e) => error(e))