const { Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const config = require("../config");
const { userStatTagModel } = require("../models");

module.exports = {
    id: 'user-tageds',
    names: ["taglılarım"],
    permission: 'dependent',
    description: 'Sunucuda hangi üyeleri taglı yaptığın gösterir.',
    run: async (client, command, message, args) => {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

        const memberTagDatas = await userStatTagModel.find({ executorId: member.user.id });

        if (memberTagDatas.length == 0) {
            const embed = {
                color: Colors.White,
                description: `\`❇️\` ${member} adlı üye hiç kimseyi taglı yapmamış!`,
            }

            return message.channel.send({ embeds: [embed] });
        }

        const limit = 10;
        const buttonId = (type, x, y) => `user_list_tageds-${type}-${member.user.id}-${x}-${y}`;
        let backButton = new ButtonBuilder().setCustomId(buttonId('back', 0, 0)).setLabel('⬅️').setStyle(ButtonStyle.Success).setDisabled(true)
        let cancelButton = new ButtonBuilder().setCustomId(buttonId('cancel', 0, 0)).setLabel('❎').setStyle(ButtonStyle.Danger)
        let nextButton = new ButtonBuilder().setCustomId(buttonId('next', limit, limit * 2)).setLabel('➡️').setStyle(ButtonStyle.Success)

        if (memberTagDatas.length <= limit)
            nextButton.setDisabled(true);

        const row = new ActionRowBuilder().addComponents(backButton, cancelButton, nextButton);

        let embed = {
            color: Colors.White,
            description:
                `\`❇️\` ${member} adlı üye toplamda ${memberTagDatas.length} kişiyi taglı yapmış! (0-${limit})\n\n` +
                memberTagDatas
                    .sort((a, b) => Number(b.date) - Number(a.date))
                    .slice(0, limit)
                    .map((x, index) => `\`${index + 1}.\` <@${x.userId}> <t:${Math.floor(x.date / 1000)}:R>`).join('\n'),
        }

        return await message.reply({ embeds: [embed], components: [row] });
    }
}