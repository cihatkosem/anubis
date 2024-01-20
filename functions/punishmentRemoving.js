const config = require("../config");
const { userStatMutesModel, userStatJailsModel } = require("../models");
const error = require("./error");

module.exports = async (_client) => {
    async function loop(client) {
        const members = (roleId) => {
            const guild = client.guilds.cache.get(config.serverId);
            const members = guild.members.cache.map(m => m).filter(m => m._roles.includes(roleId));
            return members;
        };
    
        //chatmutes
        for (let member of members(config.chatMuteRole)) {
            const memberStatMutesData = await userStatMutesModel.findOne({ id: member.user.id });
            const memberChatMutes = memberStatMutesData?.mutes?.filter(m => m.type == 'chat_mute');
            if (!memberChatMutes || memberChatMutes.length == 0) continue;
            const lastChatMute = memberChatMutes.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
            if (Number(lastChatMute.endDate) < Date.now()) 
                member.roles.remove(config.chatMuteRole).catch((e) => error(e));
        }

        //voicemutes
        for (let member of members(config.voiceMuteRole)) {
            const memberStatMutesData = await userStatMutesModel.findOne({ id: member.user.id });
            const memberVoiceMutes = memberStatMutesData?.mutes?.filter(m => m.type == 'voice_mute');
            if (!memberVoiceMutes || memberVoiceMutes.length == 0) continue;
            const lastVoiceMute = memberVoiceMutes.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
            if (Number(lastVoiceMute.endDate) < Date.now()) {
                member.roles.remove(config.voiceMuteRole).catch((e) => error(e));
                if (member.voice.channel) member.voice.setMute(false).catch((e) => error(e));
            }
        }

        //jails
        for (let member of members(config.jailRole)) {
            const memberStatJailsData = await userStatJailsModel.findOne({ id: member.user.id });
            const memberJails = memberStatJailsData?.jails;
            if (!memberJails || memberJails.length == 0) continue;
            const lastJail = memberJails.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
            if (Number(lastJail.endDate) < Date.now())
                member.roles.set(lastJail.oldRoles).catch((e) => error(e));
        }

        //bans otomatik kaldırma sistemi bulunmamaktadır.

        return setTimeout(() => loop(client), 1000 * 10);
    }

    return await loop(_client)
        .catch(e => {
            error(e);
            setTimeout(async () => loop(_client), 1000 * 10);
        });
}