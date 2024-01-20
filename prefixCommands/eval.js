const { Events, AttachmentBuilder } = require("discord.js");
const { CustomEvents } = require("../server");
const { inspect } = require("util");

module.exports = {
    id: 'eval',
    names: ["eval"],
    permission: 'admins',
    description: 'Test komutudur.',
    run: async (client, command, message, args) => {
        if (!args[0]) return message.react("❌");
        
        const code = message.content.split(" ").slice(1).join(" ");
        let output;
        
        try { output = await eval(code) } 
        catch (error) { output = String(error) }
        
        if (output === true || output === false) return message.react(output ? "✅" : "❌");

        const buffer = Buffer.from(inspect(output, { depth: 0 }), 'utf-8');
        const attachment = new AttachmentBuilder(buffer, { name: `eval-${Date.now()}.js` });

        return message.channel.send({ files: [attachment] });
    }
}
