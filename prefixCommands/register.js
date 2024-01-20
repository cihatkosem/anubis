const { ActionRowBuilder, Colors, ButtonStyle, ButtonBuilder } = require("discord.js");
const { userModel } = require("../models");
const config = require("../config");
const { error } = require("../functions");

module.exports = {
    id: 'register',
    names: ["kayıt"],
    permission: 'dependent',
    description: 'Kayıt işlemleri için kullanılır.',
    run: async (client, command, message, args) => {
        const operation = args[0] || 'ekle'; //ekle, yardım, sistem
        const user = message.mentions.users.first() || client.users.cache.get(args.filter(f => f !== operation)[0]) || null;
        const member = message.guild.members.cache.get(user?.id) || null;

        if (!member) return message.reply({ content: `\`❓\` Kullanıcı sunucuda bulunamadı.` });

        if (operation == 'yardım') {
            let embed = {
                color: Colors.White,
                title: 'Kayıt Yardım',
                fields: [
                    { name: `\`➡️\` \`${config.prefix}kayıt ekle [kullanıcı]\``, value: 'Kullanıcıyı kayıt eder.' },
                    { name: `\`➡️\` \`${config.prefix}kayıt güncelle [kullanıcı]\``, value: 'Kullanıcının kayıt bilgilerini günceller.' },
                    { name: `\`➡️\` \`${config.prefix}kayıt listele\``, value: 'Yaptığınız kayıtları listeler.' },
                    { name: `\`➡️\` \`${config.prefix}kayıt listele detaylı\``, value: 'Yaptığınız kayıtları listeler.' },
                ]
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'ekle') {
            if (!user) return message.reply({ content: `\`❓\` Kullanıcı belirtiniz.` });

            const userData = await userModel.findOne({ id: user.id });

            if ((userData?.register?.name?.length || 0) > 1) {
                const date = Math.floor(Number(userData.register.date) / 1000);

                const embed = {
                    color: Colors.White,
                    title: '✍️ Kayıt Ekle',
                    description:
                        `\`❓\` Bu kullanıcı <t:${date}:R> <@${userData.register.executorId}> tarafından kayıt edilmiş.\n` +
                        `\`❇️\` Kullanıcı kayıt güncellemek için: \`${config.prefix}kayıt güncelle [kullanıcı]\``
                }

                return message.reply({ embeds: [embed] });
            }
            
            const embed = {
                color: Colors.White,
                title: '✍️ Kayıt Ekle',
                description: 
                    `\`🤓\` ${user} kayıt etmek istiyor musunuz? \n` +
                    `\`💁\` Kayıt işleminde kullanıcının ismini ve yaşını isteyeceğiz. \n` +
                    `\`❌\` Kayıt işlemini iptal etmek isterseniz 1 dakika içerisinde \`İptal\` butonuna basabilirsiniz. \n` +
                    `\`✅\` Kayıt işlemine devam etmek için \`👦 Erkek\` veya \`👩 Kadın\` butonuna basabilirsiniz.`
            }

            const manButton = new ButtonBuilder().setCustomId(`register-person-man-${member.user.id}`).setLabel('👦 Erkek').setStyle(ButtonStyle.Success);
            const womanButton = new ButtonBuilder().setCustomId(`register-person-woman-${member.user.id}`).setLabel('👩 Kadın').setStyle(ButtonStyle.Success);
            const cancelButton = new ButtonBuilder().setCustomId(`register-stop-${member.user.id}`).setLabel('❌ İptal').setStyle(ButtonStyle.Danger);
            const actionRow = new ActionRowBuilder().addComponents(manButton, womanButton, cancelButton);

            return message.reply({ embeds: [embed], components: [actionRow] }).then(msg => {
                setTimeout(() => {
                    const stop = msg?.components[0]?.components?.find(f => f.data.custom_id.includes('register-stop'));
                    if (stop) msg.edit({ content: '\`⏳\` Kayıt işlemi zaman aşımına uğradı.', embeds: [], components: [] })
                        .catch((e) => error(e));
                }, 60000);
            })
        }

        if (operation == 'güncelle') {
            if (!user) return message.reply({ content: `\`❓\` Kullanıcı belirtiniz.` });

            const userData = await userModel.findOne({ id: user.id });

            if ((userData?.register?.name?.length || 0) < 1)
                return message.reply({ content: `\`❓\` Bu kullanıcı kayıt edilmemiş.` });

            const embed = {
                color: Colors.White,
                title: '✍️ Kayıt Güncelle',
                description: 
                    `\`🤓\` ${user} kişisinin kayıt bilgilerini güncellemek istiyor musunuz? \n` +
                    `\`💁\` Kayıt güncelleme işleminde kullanıcının ismini ve yaşını isteyeceğiz. \n` +
                    `\`❌\` Kayıt güncelleme işlemini iptal etmek isterseniz 1 dakika içerisinde \`İptal\` butonuna basabilirsiniz. \n` +
                    `\`✅\` Kayıt güncelleme işlemine devam etmek için \`👦 Erkek\` veya \`👩 Kadın\` butonuna basabilirsiniz.`
            }

            const manButton = new ButtonBuilder().setCustomId(`register-person-man-${member.user.id}-update`).setLabel('👦 Erkek').setStyle(ButtonStyle.Success);
            const womanButton = new ButtonBuilder().setCustomId(`register-person-woman-${member.user.id}-update`).setLabel('👩 Kadın').setStyle(ButtonStyle.Success);
            const cancelButton = new ButtonBuilder().setCustomId(`register-stop-${member.user.id}`).setLabel('❌ İptal').setStyle(ButtonStyle.Danger);
            const actionRow = new ActionRowBuilder().addComponents(manButton, womanButton, cancelButton);

            return message.reply({ embeds: [embed], components: [actionRow] }).then(msg => {
                setTimeout(() => {
                    const stop = msg?.components[0]?.components?.find(f => f.data.custom_id.includes('register-stop'));
                    if (stop) msg.edit({ content: '\`⏳\` Kayıt işlemi zaman aşımına uğradı.', embeds: [], components: [] })
                        .catch((e) => error(e));
                }, 60000);
            })
        }

        return message.reply({ content: command.help });
    }
}