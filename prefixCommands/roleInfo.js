const { ButtonStyle, ButtonBuilder, ActionRowBuilder, Colors } = require("discord.js");
const config = require("../config");

module.exports = {
    id: 'roleInfo',
    names: ["rolbilgi"],
    permission: 'dependent',
    description: 'Bir rol hakkında bilgi alırsınız.',
    run: async (client, command, message, args) => {
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply("Bir rol etiketle veya rol id gir.");

        const guildMembers = message.guild.members.cache.map(m => ({
            id: m.id,
            roles: m._roles,
            status: m?.presence?.status || 'offline',
            voice: m?.voice?.channel?.id || null
        }));

        const hasRoleMembers = guildMembers.filter(f => f.roles.includes(role.id));
        
        const backButton = new ButtonBuilder().setCustomId(`role_info-${role.id}-back_users`).setLabel('⬅️').setStyle(ButtonStyle.Primary).setDisabled(true);
        const cancelButton = new ButtonBuilder().setCustomId(`role_info-${role.id}-cancel`).setLabel('❎').setStyle(ButtonStyle.Danger);
        const nextButton = new ButtonBuilder().setCustomId(`role_info-${role.id}-next_users`).setLabel('➡️').setStyle(ButtonStyle.Primary);
        const actionRow = new ActionRowBuilder().addComponents(backButton, cancelButton, nextButton);

        const embed = {
            color: Colors.White,
            description: 
                `<@&${role.id}> \`${role.id}\` rolüne ait bilgiler: \n` +
                `\`❇️\` Roldeki Üye Sayısı: \`${hasRoleMembers.length}\` \n` +
                `\`❇️\` Role Sahip Aktif Üye Sayısı: \`${hasRoleMembers.filter(f => f.status !== 'offline').length}\` \n` +
                `\`❇️\` Role Sahip Sesteki Üye Sayısı: \`${hasRoleMembers.filter(f => f.voice).length}\``
        }

        return await message.reply({ embeds: [embed], components: [actionRow] });
    }
}