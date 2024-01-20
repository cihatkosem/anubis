const { Events } = require("discord.js");
const { client } = require("../server");
const { log } = require("../functions");
const config = require("../config");

client.on(Events.ClientReady, async () => {
    client.user.setStatus('online');
    let activityes = [
        { text: "Anubis", waitSecond: 5, inCare: false },
        { text: "Anubis", waitSecond: 5, inCare: false },
    ]

    await setActivity(activityes, 0)

    async function setActivity(activityes, number) {
        if (!activityes[number]) return setActivity(activityes, 0)
        client.user.setActivity(activityes[number]?.text)
        setTimeout(() => setActivity(activityes, number + 1), Number(activityes[number].waitSecond * 1000))
    }

    log({ text: `Logged in as ${client.user.tag}!`, color: "green", time: true })
})