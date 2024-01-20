const config = require("../config");
const { error } = require("../functions");
const { userStatChancedNamesModel } = require("../models");

module.exports = {
    id: 'booster_nick',
    names: ["booster"],
    permission: 'dependent',
    description: 'Kullanıcı kendi ismini değiştirebilir.',
    run: async (client, command, message, args) => {
        const tag = message.author.username.includes(config.tag) ? config.tag : config.defaultTag;
        if (!message.member?.premiumSinceTimestamp) 
            return message.reply({ content: `\`❌\` Bu komutu kullanabilmek için sunucumuza boost basmalısın.` });

        if (!args[0]) return message.reply({ content: '\`❓\` Yeni isminizi yazmayı unuttunuz.' });
        if (args.length > 1) return message.reply({ content: '\`❓\` İsminizde boşluk olmamalıdır.' });
        if (args[0].length > 32) return message.reply({ content: '\`❓\` İsminiz 32 karakterden uzun olmamalıdır.' });

        let userStatChancedNamesData = await userStatChancedNamesModel.findOne({ id: message.author.id });
        if (!userStatChancedNamesData) userStatChancedNamesData = await userStatChancedNamesData({ id: message.author.id }).save().catch((e) => null);

        const newName = message?.content?.split(' ')[1];

        userStatChancedNamesData.chancedNames.push({ 
            old: message.member.displayName, 
            new: `${tag} ${newName}`,
            date: `${Date.now()}`,
            executorId: message.author.id
        });

        await userStatChancedNamesData.save().catch((e) => null);

        message.member.setNickname(`${tag} ${newName}`).catch((e) => error(e))
        
        return message.reply({ content: `\`✅\` İsminiz başarıyla \`${tag} ${newName}\` olarak değiştirildi.` });
    }
}