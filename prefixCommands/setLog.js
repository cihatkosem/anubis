const { Colors, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config');
const { logModel } = require('../models');
const { error } = require('../functions');

module.exports = {
    id: 'log',
    names: ["log"],
    permission: 'dependent',
    description: 'Log kanalı ayarlamak için kullanılır.',
    run: async (client, command, message, args) => {
        const operation = args[0]?.toLowerCase();

        if (operation == 'yardım') {
            let embed = {
                color: Colors.White,
                description: `\`✅\` **Log Komutları**`,
                fields: [
                    { name: `\`➡️\` \`${config.prefix}log aç [kanal]\``, value: '\`❇️\` Log kanalını ayarlar.' },
                    { name: `\`➡️\` \`${config.prefix}log kapat\``, value: '\`❇️\` Log kanalını kapatır.' },
                    { name: `\`➡️\` \`${config.prefix}log listele\``, value: '\`❇️\` Bilgilendirme yapılan olayları listeler.' },
                    { name: `\`➡️\` \`${config.prefix}log bilgi\``, value: '\`❇️\` Olay bilgilerini gösterir.' },
                ]
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'listele') {
            const logs = await logModel.find();

            if (logs.length == 0) return message.reply({ content: '\`⚠️\` Hiç Log kanalı ayarlanmamış.' });

            let embed = {
                color: Colors.White,
                title: 'Bilgilendirme yapılan olaylar:',
                fields: logs.map(log => ({
                    name: `\`❇️\` **${require('../logs').flat().find(f => f.value == log.name).label}**`,
                    value: `\`➡️\` <#${log.channelId}>`,
                    inline: true
                }))
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'bilgi') {
            const logs = require('../logs');
            let components = [];

            logs.forEach((log, index) => {
                const logSelect = new StringSelectMenuBuilder()
                    .setCustomId(`logInfo-${index + 1}`)
                    .setPlaceholder('☝️ Olay seçiniz.')
                    .addOptions(log);

                const actionRow = new ActionRowBuilder().addComponents(logSelect);
                components.push(actionRow);
            })

            const _message = await message.reply({ content: `\`☝️\` **Log bilgisini görmek istediğiniz olayı seçin.**`, components });

            return setTimeout(() => {
                if (_message.components.length > 0)
                    _message.edit({ content: '\`⚠️\` İşlem zaman aşımına uğradı!', components: [] })
                        .catch((e) => error(e));
            }, 15000);
        }

        if (operation == 'aç' || operation == 'kapat') {
            const logs = require('../logs');
            let components = [];

            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel;

            logs.forEach((log, index) => {
                const logSelect = new StringSelectMenuBuilder()
                    .setCustomId(`logSelect-${index + 1}-${operation}-${channel?.id}`)
                    .setPlaceholder('☝️ Olay seçiniz.')
                    .addOptions(log);

                const actionRow = new ActionRowBuilder().addComponents(logSelect);
                components.push(actionRow);
            })

            const _message = await message.reply({ content: `\`☝️\` **Log\'u ${operation}ılacak olayı seçin.**`, components });

            return setTimeout(() => {
                if (_message.components.length > 0)
                    _message.edit({ content: '\`⚠️\` İşlem zaman aşımına uğradı!', components: [] })
                        .catch((e) => error(e));
            }, 15000);
        }

        return message.reply({ content: command.help });
    }
}