const { ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const config = require("../config");
const { error } = require("../functions");

module.exports = {
    id: 'move',
    names: ["çek"],
    permission: 'dependent',
    description: 'Bir kişiyi ses kanalından yanınıza çekersiniz.',
    run: async (client, command, message, args) => {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.reply({ content: "\`❓\` Bir üye etiketle veya üye id giriniz." });

        const authorVoiceChannel = message.member.voice.channel;
        if (!authorVoiceChannel) return message.reply({ content: "\`❓\` Bir ses kanalında olman gerekiyor." });

        const memberVoiceChannel = member.voice.channel;
        if (!memberVoiceChannel) return message.reply({ content: "\`❓\` Etiketlediğin üye bir ses kanalında değil." });

        if (authorVoiceChannel.id === memberVoiceChannel.id) 
            return message.reply({ content: "\`❓\` Etiketlediğin üye ile aynı ses kanalındasın." });

        if (config.admins.includes(message.author.id) || config.moveAdminRoles.some(r => message.member.roles.cache.has(r))) {
            member.voice.setChannel(authorVoiceChannel.id)
                .then(() => message.reply({ content: `\`✅\` ${member} adlı üye <#${authorVoiceChannel.id}> kanalına çekildi.` }))
                .catch(() => message.reply({ content: "\`❌\` Etiketlediğin üyeyi çekemiyorum." }));
            return;
        }

        const verifyId = `move_command-verify-${message.author.id}-${member.user.id}-${authorVoiceChannel.id}`;
        const cancelId = `move_command-cancel-${message.author.id}-${member.user.id}-${authorVoiceChannel.id}`;

        const verifyButton = new ButtonBuilder().setCustomId(verifyId)
            .setLabel('✅ Onayla').setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder().setCustomId(cancelId)
            .setLabel('❌ İptal').setStyle(ButtonStyle.Danger);
        
        const row = new ActionRowBuilder().addComponents(verifyButton, cancelButton);

        const msg = await message.reply({ 
            content: 
                `\`❓\` ${member}, ${message.member} adlı üye sizi <#${authorVoiceChannel.id}> kanalına çekmek istiyor. Gitmek ister misin? \n` +
                `\`⌛\` Eğer <t:${Math.floor(Date.now() / 1000) + 16}:R> saniye içinde cevap vermezseniz işlem iptal edilecektir.`, 
            components: [row] 
        });

        return setTimeout(() => {
            if (!msg) return;
            const isThereVerifyButton = msg?.components[0]?.components?.find(c => c.customId == verifyId);
            const isThereCancelButton = msg?.components[0]?.components?.find(c => c.customId == cancelId);
            if (!isThereVerifyButton || !isThereCancelButton) return;
            msg.edit({ 
                content: `\`⌛\` ${member}, ${message.member} <#${authorVoiceChannel.id}> kanalına çekme isteği zaman aşımına uğradı!`,
                components: []
            }).catch((e) => error(e));
        }, 15000);
    }
}