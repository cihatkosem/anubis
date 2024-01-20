const { StringSelectMenuBuilder, ActionRowBuilder, Colors } = require('discord.js');
const config = require('../config');
const { authorities } = require('../staffs');

module.exports = {
    id: 'staff',
    names: ["yetkili"],
    permission: 'dependend',
    description: 'Kişiyi yetkili yapar.',
    run: async (client, command, message, args) => {
        const user = message.mentions.users.first() || client.users.cache.get(args[0]);
        const member = message.guild.members.cache.get(user?.id);
        const roleName = (id) => message.guild.roles.cache.get(id)?.name || 'Bulunamadı.';

        if (!user) return message.reply({ content: '\`⚠️\` Lütfen bir kullanıcı belirtin.' });

        const authority = authorities.filter(s => message.member._roles.includes(s.roleId)).sort((a, b) => a.id - b.id)[0];
        if (!authority) return message.reply({ content: '\`⚠️\` Bu komutu kullanmak için yetkiniz bulunmamaktadır.' });

        const isThereTagRole = member._roles.includes(config.tagRole);
        if (!isThereTagRole) return message.reply({ content: '\`⚠️\` Bu kullanıcı taglı değil.' });

        const AuthorityAuth = authorities.sort((a, b) => a.id - b.id).find(m => m.authRoles.filter(f => member._roles.includes(f)))
        const AuthorityAuthRoleId = AuthorityAuth.authRoles.filter(f => member._roles.includes(f))[0];

        if (AuthorityAuthRoleId) return message.reply({ content: '\`⚠️\` Bu kullanıcı zaten yetkili.' });

        const selectMenuId = `staff_add_member_menu-${user.id}`;
        const rolesSelect = new StringSelectMenuBuilder()
            .setCustomId(selectMenuId)
            .setPlaceholder('☝️ Yetki seçiniz.')
            .addOptions(authority.authRoles.map((roleId, i) =>
                ({ label: `${i + 1}. ${roleName(roleId)} Yetkisi`, value: roleId })
            ));

        const actionRow = new ActionRowBuilder().addComponents(rolesSelect);

        let embed = {
            color: Colors.White,
            description:
                `\`➡️\` ${message.member}, ${user} kullanıcısına verilecek olan yetkiyi seçiniz. \n` +
                `\`⌛\` Yetki seçilmez ise işlem <t:${Math.floor(Date.now() / 1000) + 31}:R> iptal edilecektir.`
        }

        return await message.reply({ embeds: [embed], components: [actionRow] })
            .then(msg => {
                setTimeout(() => {
                    if (!msg) return;
                    const rolesSelectMenu = msg?.components[0]?.components.find(c => c.customId == selectMenuId);
                    embed.description = '\`⌛\` Yetki seçimi zaman aşımına uğradı.';
                    if (rolesSelectMenu) return msg.edit({ embeds: [embed], components: [] }).catch((e) => error(e));
                }, 30000);
            })

    }
}