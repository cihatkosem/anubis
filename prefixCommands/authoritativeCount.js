const { Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const config = require("../config");

module.exports = {
    id: 'authoritative-count',
    names: ["ysay"],
    permission: 'dependent',
    description: 'Yetkili sayısını gösterir.',
    run: async (client, command, message, args) => {
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0] || config.staffMainRoleId)

        const members = message.guild.members.cache.filter(m => m._roles.includes(role?.id));
        const onlineMembers = members.filter(m => m?.presence?.status);
        const inVoicesMembers = members.filter(m => m?.voice?.channel);
        const speakerMembers = inVoicesMembers.filter(m => !m?.voice?.serverMute && !m?.voice?.serverDeaf);
        const streamerMembers = inVoicesMembers.filter(m => m?.voice?.streaming);
        const onlineButNotInVoicesMembers = onlineMembers.filter(m => !m?.voice?.channel);

        const onlineButNotInVoicesMembersButton = new ButtonBuilder()
            .setCustomId(`yetkili_say-onlineButNotInVoicesMembers-${role?.id}`)
            .setLabel(`Listele`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🤬')

        const ActionRow = new ActionRowBuilder().addComponents(onlineButNotInVoicesMembersButton)

        let embed = {
            color: Colors.White,
            title: `\`📊\` ${role?.name} rolüne sahip yetkililer`,
            description:
                `\`❇️\` **Genel Bilgiler;**\n` +
                `\`🆔\` Rol: <@&${role?.id}>\n` +
                `\`😁\` Toplam yetkili sayısı: **${members?.size}**\n` +
                `\`🟢\` Çevrimiçi yetkili sayısı: **${onlineMembers?.size}**\n\n` +
                `\`🔈\` **Ses Kanallarında;**\n` +
                `\`😋\` Bulunanlar: **${inVoicesMembers?.size}**\n` +
                `\`🤬\` Aktif ve Bulunmayanlar: **${onlineButNotInVoicesMembers?.size}**\n` +
                `\`🎙️\` Mikrofonu Açık Olanlar: **${speakerMembers?.size}**\n` +
                `\`📺\` Yayın Yapanlar: **${streamerMembers?.size}**`
        }

        return message.reply({ embeds: [embed], components: [ActionRow] })
    }
}