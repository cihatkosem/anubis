const { Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const config = require("../config");
const { userStatTagModel } = require("../models");
const { error } = require("../functions");

module.exports = {
    id: 'user-taged',
    names: ["taglı"],
    permission: 'dependent',
    description: 'Sunucuda üyeyi taglı yapmak için kullanılır.',
    run: async (client, command, message, args) => {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send('Bir üye belirtmelisin.');

        const memberTagData = await userStatTagModel.findOne({ userId: member.user.id });

        if (memberTagData) {
            const embed = {
                color: Colors.White,
                description: `\`❇️\` ${member} adlı üye zaten <@${memberTagData.executorId}> tarafından taglı yapılmış!`,
            }

            return message.channel.send({ embeds: [embed] });
        }
        
        const buttonId = (type) => `user_taged-${type}-${message.author.id}-${member.user.id}`;
        const verifyButton = new ButtonBuilder().setCustomId(buttonId('verify')).setLabel('✅ Onayla').setStyle(ButtonStyle.Success)
        const cancelButton = new ButtonBuilder().setCustomId(buttonId('cancel')).setLabel('❌ İptal').setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder().addComponents(verifyButton, cancelButton);

        let embed = {
            color: Colors.White,
            description: `\`❇️\` Hey <@${member.user.id}>, ${message.author} sizi taglı yapmak istiyor. Kabul ediyor musunuz? \n` +
                `\`⌛\` Kabul etmezseniz <t:${Math.floor(Date.now() / 1000) + 31}:R> iptal edilecek.`,
        }

        const msg = await message.reply({ content: `<@${member.user.id}>`, embeds: [embed], components: [row] });

        return setTimeout(() => {
            const isThereVerifyButton = msg.components[0]?.components?.find(f => f.data.custom_id == buttonId('verify'));
            const isThereCancelButton = msg.components[0]?.components?.find(f => f.data.custom_id == buttonId('cancel'));
            if (!isThereVerifyButton && !isThereCancelButton) return;
            embed.description = `\`⌛\` Hey <@${member.user.id}>, ${message.author} sizi taglı yapacaktı fakat işlemi zaman aşımına uğradı.`;
            return msg.edit({ embeds: [embed], components: [] }).catch((e) => error(e));
        }, 1000 * 30);
    }
}