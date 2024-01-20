const { Events } = require("discord.js");
const { client } = require("../server");
const { log } = require("../functions");

client.on(Events.Debug, (info) => {
    //log({ text: `❇️ ${info}`, color: "yellow", time: true })
    //const used = process.memoryUsage().heapUsed / 1024 / 1024;
    //log({ text: `➡️ Memory Usage: ${Math.round(used * 100) / 100} MB`, color: "yellow", time: true })
})

client.on(Events.Error, (error) => {
    console.error(error);
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    log({ text: `➡️ Memory Usage: ${Math.round(used * 100) / 100} MB`, color: "yellow", time: true })
})

client.on(Events.Warn, (info) => {
    console.warn(info);
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    log({ text: `➡️ Memory Usage: ${Math.round(used * 100) / 100} MB`, color: "yellow", time: true })
})