const { Colors } = require("discord.js");
const { userModel, userStatChancedNamesModel, userStatRegisteredUsersModel } = require("../models");
const config = require("../config");
const { error } = require("../functions");

module.exports = {
    id: 'unregister',
    names: ["kayıtsız"],
    permission: 'dependent',
    description: 'Kullanıcıyı kayıtsıza atar.',
    run: async (client, command, message, args) => {
        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || null;
        const member = message.guild.members.cache.get(user?.id) || null;

        if (!user)
            return message.reply({ content: `\`❓\` Bir kullanıcı belirtmelisin.` });

        const userData = await userModel.findOne({ id: user?.id });
        let userStatChangedNames = await userStatChancedNamesModel.findOne({ id: user.id });
        if (!userStatChangedNames) userStatChangedNames = await userStatChancedNamesModel({ id: user.id }).save().catch((e) => null);

        if ((userData?.register?.name?.length || 0) < 1)
            return message.reply({ content: `\`❓\` Bu kullanıcı kayıtlı değil.` });

        const executorStatRegisteredUsersData = await userStatRegisteredUsersModel.findOne({ id: userData.register.executorId });

        if (executorStatRegisteredUsersData) {
            executorStatRegisteredUsersData.registeredUsers = executorStatRegisteredUsersData.registeredUsers.filter(f => f.id !== user.id);
            await executorStatRegisteredUsersData.save().catch((e) => null);
        }

        if (userStatChangedNames) {
            userStatChangedNames.chancedNames.push({ 
                old: userData?.register?.name || null, 
                new: '✦ İsim | Yaş', 
                executorId: message.author.id, 
                date: `${Date.now()}`
            });
            await userStatChangedNames.save().catch((e) => null);
        }

        userData.register = { name: null, age: null, gender: null, date: null, executorId: null };
        await userData.save().catch((e) => null);

        if (member) {
            member.setNickname(`✦ İsim | Yaş`).catch((e) => error(e));
            member.roles.set([config.unregisterRole]).catch((e) => error(e));
        }

        const embed = {
            color: Colors.White,
            description: `<@${user.id}> \`${user.id}\` kullanıcı kayıtsıza atıldı.`,
            footer: { text: `${message.author.tag} tarafından kayıtsıza atıldı.` },
        }

        return message.reply({ embeds: [embed] });
    }
}