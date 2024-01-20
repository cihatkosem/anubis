const { Events } = require("discord.js");
const { client } = require("../server");
const { toCompare } = require("../functions");
const config = require("../config");

client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
    if (oldPresence?.guild?.id !== config.serverId) return;

    const channel = client.channels.cache.get("1096423020089835571");

    const checkClientsStatus = toCompare(oldPresence, newPresence)?.find(f => f.key == "clientStatus")

    if (checkClientsStatus) {
        const web = Object.keys(checkClientsStatus.new).find(f => f == "web")
        //if (web) return channel.send({ content: `\`${oldPresence.userId}\` bloklandı!` })
        //else return channel.send({ content: `\`${oldPresence.userId}\` blok açıldı!` })
    }
})