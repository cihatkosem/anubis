const { Colors, StringSelectMenuBuilder, ActionRowBuilder, Events } = require('discord.js');
const config = require('../config');
const { rollbackModel } = require('../models');
const { CustomEvents } = require('../server');
const { error } = require('../functions');


module.exports = {
    id: 'rollback',
    names: ["rollback"],
    permission: 'dependent',
    description: 'Rollback (işlemi geri alma) ayarlamak için kullanılır.',
    run: async (client, command, message, args) => {
        const operation = args[0]?.toLowerCase();

        if (operation == 'yardım') {
            let embed = {
                color: Colors.White,
                title: 'Rollback Komutları',
                fields: [
                    { name: `\`➡️\` \`${config.prefix}rollback aç\``, value: '\`❇️\` Rollback işlemi açar.' },
                    { name: `\`➡️\` \`${config.prefix}rollback kapat\``, value: '\`❇️\` Rollback işlemini kapatır.' },
                    { name: `\`➡️\` \`${config.prefix}rollback listele\``, value: '\`❇️\` Rollback işlemlerini listeler.' },
                    { name: `\`➡️\` \`${config.prefix}rollback bilgi\``, value: '\`❇️\` Rollback bilgilerini gösterir.' },
                    { name: `\`➡️\` \`${config.prefix}rollback dışlama ekle [kullanıcı/rol]\``, value: '\`❇️\` Rollback işlemine dışlama ekler.' },
                    { name: `\`➡️\` \`${config.prefix}rollback dışlama çıkar [kullanıcı/rol]\``, value: '\`❇️\` Rollback işleminden dışlama kaldırır.' },
                ]
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'listele') {
            const rollbacks = await rollbackModel.find();

            if (rollbacks.length == 0) return message.reply({ content: '\`⚠️\` Hiç rollback işlemi bulunamadı.' });

            let embed = {
                color: Colors.White,
                title: 'Geri alınacak işlemler',
                fields: rollbacks.map(m => {
                    return {
                        name: `\`❇️\` ${require('../logs').flat().find(f => f.value == m.name).label}`,
                        value: `\`➡️\` <t:${Math.floor(Number(m.date) / 1000)}:R> açıldı.`,
                        inline: true
                    }
                })
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'bilgi') {
            const others = [
                Events.GuildMemberAdd, Events.GuildMemberRemove,
                Events.InviteCreate, Events.InviteDelete,
                Events.MessageBulkDelete, Events.MessageDelete, Events.MessageUpdate,
                Events.MessageReactionAdd, Events.MessageReactionRemove, Events.MessageReactionRemoveAll,
            ]

            let components = [];

            require('../logs').forEach((log, index) => {
                log = log.filter(f => !others.includes(f.value))
                const logSelect = new StringSelectMenuBuilder()
                    .setCustomId(`rollbackInfo-${index + 1}`)
                    .setPlaceholder('☝️ Olay seçiniz.')
                    .addOptions(log);

                const actionRow = new ActionRowBuilder().addComponents(logSelect);
                components.push(actionRow);
            })

            const _message = await message.reply({ content: `\`☝️\` **Rollback bilgisini görmek istediğiniz olayı seçin.**`, components });

            return setTimeout(() => {
                if (_message.components.length > 0)
                    _message.edit({ content: '\`⚠️\` İşlem zaman aşımına uğradı!', components: [] })
                        .catch((e) => error(e));
            }, 15000);
        }

        if (operation == 'aç' || operation == 'kapat') {
            const others = [
                Events.GuildMemberAdd, Events.GuildMemberRemove,
                Events.InviteCreate, Events.InviteDelete,
                Events.MessageBulkDelete, Events.MessageDelete, Events.MessageUpdate,
                Events.MessageReactionAdd, Events.MessageReactionRemove, Events.MessageReactionRemoveAll,
                CustomEvents.MemberTagAdd, CustomEvents.MemberTagRemove,
            ]

            const logs = require('../logs');
            let components = [];

            logs.forEach((log, index) => {
                log = log.filter(f => !others.includes(f.value))

                const logSelect = new StringSelectMenuBuilder()
                    .setCustomId(`rollbackSelect-${index + 1}-${operation}`)
                    .setPlaceholder('☝️ Olay seçiniz.')
                    .addOptions(log);

                const actionRow = new ActionRowBuilder().addComponents(logSelect);
                components.push(actionRow);
            })

            const _message = await message.reply({
                content: `\`☝️\` **Rollback olayı ${operation}ılacak olayı seçin.**`, components
            });

            return setTimeout(() => {
                if (_message.components.length > 0)
                    _message.edit({ content: '\`⚠️\` İşlem zaman aşımına uğradı!', components: [] })
                        .catch((e) => error(e));
            }, 15000);
        }

        if (operation == 'dışlama') {
            const subOperation = args[1]?.toLowerCase();

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[3]);
            const user = message.mentions.users.first() || message.guild.members.cache.get(args[3])?.user;

            if (!user?.id && !role?.id)
                return message.reply({ content: '\`❓\` **Lütfen bir kullanıcı/rol belirterek komutu kullanınız.**' });

            const others = [
                Events.GuildMemberAdd, Events.GuildMemberRemove,
                Events.InviteCreate, Events.InviteDelete,
                Events.MessageBulkDelete, Events.MessageDelete, Events.MessageUpdate,
                Events.MessageReactionAdd, Events.MessageReactionRemove, Events.MessageReactionRemoveAll,
                CustomEvents.MemberTagAdd, CustomEvents.MemberTagRemove,
                CustomEvents.GuildMemberJail, CustomEvents.GuildMemberUnjail,
                CustomEvents.GuildMemberMute, CustomEvents.GuildMemberUnmute,
                CustomEvents.GuildMemberBlock, CustomEvents.GuildMemberUnblock,
                CustomEvents.GuildMemberVoice,
            ]

            const logs = require('../logs');
            let components = [];

            logs.forEach((log, index) => {
                log = log.filter(f => !others.includes(f.value))

                const logSelect = new StringSelectMenuBuilder()
                    .setCustomId(`rollbacExcluded-${index + 1}-${subOperation}-${role?.id ? role.id : user.id}-${role?.id ? 'role' : 'user'}`)
                    .setPlaceholder('☝️ Olay seçiniz.')
                    .addOptions(log);

                const actionRow = new ActionRowBuilder().addComponents(logSelect);
                components.push(actionRow);
            })

            if (subOperation == 'ekle' || subOperation == 'çıkar') {
                const operation = subOperation == 'ekle' ? 'eklenecek' : 'çıkarılacak';
                const _message = await message.reply({ content: `\`☝️\` **Rollback dışlama ${operation} istediğiniz olayı seçin.**`, components });

                return setTimeout(() => {
                    if (_message.components.length > 0)
                        _message.edit({ content: '\`⚠️\` İşlem zaman aşımına uğradı!', components: [] })
                            .catch((e) => error(e));
                }, 15000);
            }
        }

        return message.reply({ content: command.help });
    }
}