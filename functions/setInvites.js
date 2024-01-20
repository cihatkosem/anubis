const { inviteModel } = require('../models');
const error = require('./error');

module.exports = async (client, serverId) => {
    const guild = client.guilds.cache.get(serverId);
    const invites = await guild.invites?.fetch().then((i) => i.map(m => m)).catch(() => []) || [];

    const invitesDatas = await inviteModel.find();
    const isNotThere = invitesDatas.filter(c => !invites.find(i => i.code === c.code))

    for (let invite of isNotThere) {
        const inviteData = await inviteModel.findOne({ code: invite.code });
        if (inviteData) {
            inviteData.deleted = true;
            await inviteData.save().catch((e) => null);
        }
    }

    for (let invite of invites) {
        const inviteData = await inviteModel.findOne({ code: invite.code })
        const { code, maxAge, uses, maxUses, inviterId, guildId, channelId, createdTimestamp, usesUsers } = invite;
        if (!inviteData)
            await inviteModel({ code, maxAge, uses, maxUses, inviterId, guildId, channelId, createdTimestamp, usesUsers, deleted: false }).save()
                .catch((e) => error(e))
    }
}