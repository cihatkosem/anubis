const { Colors, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const roles = require("../roles");
const { error } = require("../functions");

module.exports = {
    id: 'role',
    names: ["rol"],
    permission: 'dependend',
    description: 'Kullanıcıya rol verme veya kullanıcıdan rol alma komutudur.',
    run: async (client, command, message, args) => {
        const operation = args[0];//ver, al
        const user = message.mentions.users.first() || client.users.cache.get(args[1]);
        const member = message.guild.members.cache.get(user?.id);

        if (!operation || !['al', 'ver'].includes(operation))
            return message.reply({ content: '\`⚠️\` Lütfen bir işlem belirtin. \`ver\` veya \`al\`' });

        if (!user) return message.reply({ content: '\`⚠️\` Lütfen bir kullanıcı belirtin.' });
        if (!member) return message.reply({ content: '\`⚠️\` Bu kullanıcı sunucuda bulunmamaktadır.' });

        const auth = roles.filter(s => message.member._roles.includes(s.roleId)).sort((a, b) => a.id - b.id)[0];
        if (!auth) return message.reply({ content: '\`⚠️\` Bu komutu kullanmak için yetkiniz bulunmamaktadır.' });

        const roleName = (id) => message.guild.roles.cache.get(id)?.name || 'Bulunamadı.';

        if (operation == 'ver' && auth.authRoles.filter(id => member._roles.includes(id)).length == auth.authRoles.length)
            return message.reply({ content: '\`⚠️\` Bu kullanıcıya verebileceğiniz tüm rolleri vermişsiniz.' });

        if (operation == 'al' && auth.authRoles.filter(id => !member._roles.includes(id)).length == auth.authRoles.length)
            return message.reply({ content: '\`⚠️\` Bu kullanıcıdan alabileceğiniz tüm rolleri almışsınız.' });

        const selectMenuId = `member_role-${operation == 'ver' ? 'add' : 'remove'}-${user.id}`;
        const rolesSelect = new StringSelectMenuBuilder()
            .setCustomId(selectMenuId)
            .setPlaceholder('☝️ Rol seçiniz.')
            .addOptions(
                auth.authRoles
                    .filter(id => operation == 'ver' ? !member._roles.includes(id) : member._roles.includes(id))
                    .map((id, i) => ({ label: `${i + 1}. ${roleName(id)}`, value: id }))
            );

        const actionRow = new ActionRowBuilder().addComponents(rolesSelect);

        const embed = {
            color: Colors.White,
            description:
                `\`➡️\` ${user} kullanıcısın rol ${operation == 'ver' ? 'vermek' : 'almak'} için aşağıdaki menüden rol seçiniz. \n` +
                `\`⏳\` Sorumluluk seçilmez ise işlem <t:${Math.floor(Date.now() / 1000) + 31}:R> iptal edilecektir.`
        }

        let msg = await message.reply({ embeds: [embed], components: [actionRow] })
        return setTimeout(() => {
            const menu = msg?.components[0]?.components?.find(f => f?.data?.custom_id == selectMenuId)
            if (!msg || !menu) return;
            embed.description = '\`⌛\` Rol seçimi zaman aşımına uğradı.';
            return msg.edit({ embeds: [embed], components: [] }).catch((e) => error(e));
        }, 30000);
    }
}