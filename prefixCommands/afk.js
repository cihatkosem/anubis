const { userModel } = require("../models");

module.exports = {
    id: 'user_afk',
    names: ["afk"],
    permission: 'dependent',
    description: 'Kullanıcıyı AFK yapar.',
    run: async (client, command, message, args) => {
        if (!args[0]) return message.reply({ content: 'Lütfen bir sebep belirtin.' });
        
        message.delete().catch((e) => error(e));

        const userData = await userModel.findOne({ id: message.author.id });
        if (!userData) userData = await userModel({ id: message.author.id }).save().catch((e) => null);

        userData.afk.status = true;
        userData.afk.reason = args.join(' ');
        await userData.save().catch((e) => null);
        
        return message.channel.send({ content: `\`💤\` ${message.member}, \`${args.join(' ')}\` sebebiyle afk oldunuz...` })
            .then(msg => setTimeout(() => { if (message.deletable) msg.delete().catch((e) => error(e)) }, 10000))
    }
}