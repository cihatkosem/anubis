const error = require("./error");

module.exports = async (client, guildId, type) => {
    const guild = client.guilds.cache.get(guildId);
    const entry = await guild?.fetchAuditLogs({ type }).then((audit) => audit.entries.first()).catch((e) => error(e));
    return entry;
}