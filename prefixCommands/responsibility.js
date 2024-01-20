const { StringSelectMenuBuilder, ActionRowBuilder, Colors } = require('discord.js');
const { responsibilities } = require('../staffs');
const { error } = require('../functions');

module.exports = {
    id: 'responsibility',
    names: ["sorumluluk"],
    permission: 'dependend',
    description: 'Kişiyi sorumluluk verir.',
    run: async (client, command, message, args) => {
        const roleName = (id) => message.guild.roles.cache.get(id)?.name || 'Bulunamadı.';

        const subOperation = args[0];//ekle, çıkar
        const user = message.mentions.users.first() || client.users.cache.get(args[1]);
        const member = message.guild.members.cache.get(user?.id);

        if (!['ekle', 'çıkar'].includes(subOperation))
            return message.reply({ content: '\`⚠️\` Lütfen geçerli bir işlem belirtin. \`ekle\` veya \`çıkar\`.' });

        if (!user) return message.reply({ content: '\`⚠️\` Lütfen bir kullanıcı belirtin.' });

        const _responsibilities = responsibilities.filter(s => message.member._roles.includes(s.authRole)).sort((a, b) => a.id - b.id);

        if ((_responsibilities?.length || 0) == 0)
            return message.reply({ content: '\`⚠️\` Bu komutu kullanmak için yetkiniz bulunmamaktadır.' });

        if (subOperation == 'ekle' && _responsibilities.filter(f => member._roles.includes(f.roleId)).length == _responsibilities.length)
            return message.reply({ content: '\`⚠️\` Bu kullanıcı zaten verebileceğiniz tüm sorumluluklara sahip.' });

        if (subOperation == 'çıkar' && _responsibilities.filter(f => member._roles.includes(f.roleId)).length == 0)
            return message.reply({ content: '\`⚠️\` Bu kullanıcıdan çıkarabileceğiniz tüm sorumluluklar daha önceden çıkarılmış.' });

        const embed = {
            color: Colors.White,
            description:
                `\`➡️\` ${subOperation == 'ekle' ? 'Eklenebilir' : 'Çıkarılabilir'} Yetkili Sorumlulukları aşağıda listelenmiştir. \n` +
                `\`⏳\` Sorumluluk seçilmez ise işlem <t:${Math.floor(Date.now() / 1000) + 31}:R> iptal edilecektir.`
        }

        const selectMenuId = `staff_responsibility_menu-${subOperation == 'ekle' ? 'add' : 'remove'}-${user.id}`;
        const rolesSelect = new StringSelectMenuBuilder()
            .setCustomId(selectMenuId)
            .setPlaceholder('☝️ Sorumluluk seçiniz.')
            .addOptions(
                _responsibilities
                    .filter(f => subOperation == 'ekle' ? !member._roles.includes(f.roleId) : member._roles.includes(f.roleId))
                    .map((responsibility, i) => ({ label: `${i + 1}. ${roleName(responsibility.roleId)}`, value: responsibility.roleId }))
            );

        const actionRow = new ActionRowBuilder().addComponents(rolesSelect);

        let msg = await message.reply({ embeds: [embed], components: [actionRow] })
        return setTimeout(() => {
            const menu = msg?.components[0]?.components?.find(f => f?.data?.custom_id == selectMenuId)
            if (!menu) return;
            embed.description = '\`⌛\` Sorumluluk seçimi zaman aşımına uğradı.';
            return msg.edit({ embeds: [embed], components: [] }).catch((e) => error(e));
        }, 30000);
    }
}