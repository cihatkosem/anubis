const { ChannelType } = require("discord.js");

module.exports = (channel) => {
    if (!channel) return null;
    const getPermissionOverwrites = (channel) => channel.permissionOverwrites.cache.map(x => ({ id: x.id, type: x.type, allow: x.allow.bitfield, deny: x.deny.bitfield }));

    const voice = {
        name: channel.name, type: channel.type, bitrate: channel.bitrate, userLimit: channel.userLimit, 
        parent: channel.parent, position: channel.position + 1, rawPosition: channel.rawPosition + 1,
        permissionOverwrites: getPermissionOverwrites(channel)
    }

    const text = {
        name: channel.name, type: channel.type, topic: channel.topic, nsfw: channel.nsfw, 
        parent: channel.parent, position: channel.position + 1, rawPosition: channel.rawPosition + 1,
        rateLimitPerUser: channel.rateLimitPerUser,
        permissionOverwrites: getPermissionOverwrites(channel)
    }

    switch (channel.type) {
        case ChannelType.GuildVoice:
            return voice;
        case ChannelType.GuildText:
            return text;
        default:
            return { 
                name: channel.name,
                type: channel.type, 
                position: channel.position + 1,
                rawPosition: channel.rawPosition + 1 ,
                permissionOverwrites: getPermissionOverwrites(channel)
            };
    }
}