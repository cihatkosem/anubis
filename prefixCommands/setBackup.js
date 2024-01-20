const { channelModel, roleModel } = require('../models');
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, Colors, ComponentType, ChannelType } = require('discord.js');
const { channelDatas, error } = require('../functions');
const config = require('../config');

module.exports = {
    id: 'backup',
    names: ["yedek"],
    permission: 'dependent',
    description: 'Yedekleme işlemleri için kullanılır.',
    run: async (client, command, message, args) => {
        const operation = args[0]?.toLowerCase();

        if (operation == 'yardım') {
            let embed = {
                color: Colors.White,
                description: `**Yedekleme Komutları**`,
                fields: [
                    { name: `\`➡️\` \`${config.prefix}yedek oluştur [sebep]\``, value: '\`❇️\` Yedekleme oluşturur.' },
                    { name: `\`➡️\` \`${config.prefix}yedek sil tümü\``, value: '\`❇️\` Tüm yedekleri siler.' },
                    { name: `\`➡️\` \`${config.prefix}yedek sil [yedek id]\``, value: '\`❇️\` Belirtilen yedeklemeyi siler.' },
                    { name: `\`➡️\` \`${config.prefix}yedek yükle [yedek id]\``, value: '\`❇️\` Belirtilen yedeklemeyi yükler.' },
                    { name: `\`➡️\` \`${config.prefix}yedek bilgi [yedek id]\``, value: '\`❇️\` Yedekleme hakkında bilgi alınır.' },
                    { name: `\`➡️\` \`${config.prefix}yedek listele\``, value: '\`❇️\` Yedeklemeleri listeler.' },
                ]
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'sil') {
            if (args[1] == 'tümü') {
                const channelsDatas = await channelModel.find();
                const rolesDatas = await roleModel.find();

                const oldBackups = [...new Set([...channelsDatas, ...rolesDatas].map(m => m.backup.id))];

                await channelModel.deleteMany({});
                await roleModel.deleteMany({});

                return message.reply({ content: `\`✅\` ${oldBackups.map(m => `\`${m}\``).join(', ')} id'li eski yedekler silindi.` });
            } else {
                if (!args[1]) return message.reply({ content: '\`❓\` Yedekleme ID\'si belirtilmedi.' });
                const channelsDatas = await channelModel.find();
                const rolesDatas = await roleModel.find();

                const backup = channelsDatas.find(m => m.backup.id == args[1]) || rolesDatas.find(m => m.backup.id == args[1]);
                if (!backup) return message.reply({ content: '\`❓\` Belirtilen yedekleme bulunamadı.' });

                await channelModel.deleteMany({ 'backup.id': args[1] });
                await roleModel.deleteMany({ 'backup.id': args[1] });

                return message.reply({ content: `\`✅\` Belirtilen \`${args[1]}\` id'sine sahip yedekleme silindi.` });
            }
        }

        if (operation == 'yükle') {
            if (!args[1]) return message.reply({ content: '\`❓\` Yedekleme ID\'si belirtilmedi.' });
            const channelsDatas = await channelModel.find({ 'backup.id': args[1] });
            const rolesDatas = await roleModel.find({ 'backup.id': args[1] });

            if (channelsDatas?.length == 0 && rolesDatas?.length == 0)
                return message.reply({ content: '\`❓\` Belirtilen yedekleme bulunamadı.' });

            message.reply({ content: `\`✅\` Belirtilen \`${args[1]}\` id'sine sahip yedekleme yükleniyor...` });
            
            let serverChannels = message.guild.channels.cache.map(m => m.id);
            let serverChannelsLength = serverChannels?.length || 0;
            let serverRoles = message.guild.roles.cache.map(m => m.id);
            let serverRolesLength = serverRoles?.length || 0;


            deleteChannels(0, 6)
            deleteRoles(0, 6)

            function deleteChannels(x, y) {
                for (let channelId of serverChannels.slice(x, y))
                    message.guild.channels.cache.get(channelId).delete()
                        .then(() => serverChannelsLength--)
                        .catch((e) => error(e));

                if (serverChannels.slice(x + 6, y + 6).length == 0) return;
                return deleteChannels(x + 6, y + 6);
            }

            function deleteRoles(x, y) {
                for (let roleId of serverRoles.slice(x, y))
                    message.guild.roles.cache.get(roleId).delete()
                        .then(() => serverRolesLength--)
                        .catch((e) => error(e));
                
                if (serverRoles.slice(x + 6, y + 6).length == 0) return;
                return deleteRoles(x + 6, y + 6);
            }

            let channelsDatasLenght = channelsDatas?.length || 0;
            let rolesDatasLenght = rolesDatas?.length || 0;

            createRoles(0, 6);

            function createChannels(x, y) {
                for (let channelData of channelsDatas.slice(x, y)) {
                    message.guild.channels.create({
                        name: channelData?.name,
                        type: channelData?.type,
                        topic: channelData?.topic,
                        nsfw: channelData?.nsfw,
                        parent: channelData?.parent,
                        bitrate: channelData?.bitrate,
                        userLimit: channelData?.userLimit,
                        rateLimitPerUser: channelData?.rateLimitPerUser,
                        permissionOverwrites: channelData?.permissionOverwrites
                    }).then((newChannel) => {
                        newChannel.setPosition(channelData?.position)
                        channelsDatasLenght--
                    }).catch((e) => error(e));
                }

                if (channelsDatas.slice(x + 6, y + 6).length == 0) return;
                return createChannels(x + 6, y + 6);
            }

            function createRoles(x, y) {
                for (let roleData of rolesDatas.slice(x, y)) {
                    message.guild.roles.create({
                        icon: roleData?.icon,
                        unicodeEmoji: roleData?.unicodeEmoji,
                        name: roleData?.name,
                        color: roleData?.color,
                        hoist: roleData?.hoist,
                        permissions: roleData?.permissions,
                        managed: roleData?.managed,
                        mentionable: roleData?.mentionable,
                        tags: roleData?.tags
                    }).then((newRole) => {
                        newRole.setPosition(roleData?.rawPosition)
                        rolesDatasLenght--
                    }).catch((e) => error(e));
                }

                if (rolesDatas.slice(x + 6, y + 6).length == 0) return createChannels(0, 6);
                return createRoles(x + 6, y + 6);
            }

            let interval = setInterval(() => {
                if (channelsDatasLenght == 0 && rolesDatasLenght == 0 && serverChannelsLength == 0 && serverRolesLength == 0) {
                    const channel = message.guild.channels.cache.find(f => f.type == ChannelType.GuildText);
                    channel.send({ content: `\`✅\` Hey <@${message.author.id}>, \`${args[1]}\` id'sine sahip yedekleme başarıyla yüklendi.` });
                    return clearInterval(interval);
                }
            }, 3000);
            return;
        }

        if (operation == 'bilgi') {
            if (!args[1]) return message.reply({ content: '\`❓\` Yedekleme ID\'si belirtilmedi.' });
            const channelsDatas = await channelModel.find({ 'backup.id': args[1] });
            const rolesDatas = await roleModel.find({ 'backup.id': args[1] });

            if (!channelsDatas.length && !rolesDatas.length)
                return message.reply({ content: '\`❓\` Belirtilen yedekleme bulunamadı.' });

            const backup = channelsDatas[0]?.backup || rolesDatas[0]?.backup;
            const backupDate = Math.floor(Number(backup.date) / 1000);

            let embed = {
                color: Colors.White,
                description: `\`✅\` \`${args[1]}\` yedeği hakkında bilgiler:`,
                fields: [
                    { name: '\`➡️\` Kanallar', value: `\`❇️\` ${channelsDatas.length} adet kanal bulundu.` },
                    { name: '\`➡️\` Roller', value: `\`❇️\` ${rolesDatas.length} adet rol bulundu.` },
                    { name: '\`➡️\` Yedekleyen', value: `\`❇️\` <@${backup.authorId}>` },
                    { name: '\`➡️\` Yedekleme Tarihi', value: `\`❇️\` <t:${backupDate}>` }
                ]
            }

            if (backup.reason) embed.fields.push({ name: '\`➡️\` Yedekleme Sebebi', value: `\`❇️\` \`${backup.reason}\`` })

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'listele') {
            let backups = [];
            const channelsDatas = await channelModel.find();
            const rolesDatas = await roleModel.find();
            const backupDate = (x) => Math.floor(Number(x) / 1000);

            for (let channel of channelsDatas) !backups.find(f => f.id == channel.backup.id) ? backups.push(channel.backup) : null;
            for (let role of rolesDatas) !backups.find(f => f.id == role.backup.id) ? backups.push(role.backup) : null;

            if (backups?.length == 0) return message.reply({ content: '\`❓\` Yedekleme bulunamadı.' });

            let embed = {
                color: Colors.White,
                description: `\`✅\` **Yedeklemeler**`,
                fields: backups.map(backup => ({ name: `\`➡️\` \`${backup.id}\``, value: `\`❇️\` Yedekleme Tarihi: <t:${backupDate(backup.date)}>` }))
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'oluştur') {
            const channels = message.guild.channels.cache.map(m => m);
            const roles = message.guild.roles.cache.map(m => m);
            const backup = {
                id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                authorId: message.author.id,
                date: Number(Date.now()),
                reason: args.slice(1).join(' ')
            }

            let embed = { description: '\`🔄️\` **Yedekleme:** İşlem başlatılıyor...', color: Colors.White }
            const msg = await message.reply({ embeds: [embed] });

            embed.description = '\`🔄️\` **Yedekleme:** Kanallar yedekleniyor...';
            msg.edit({ embeds: [embed] }).catch((e) => error(e));

            for (let channel of channels) {
                const _channel = await channelModel.findOne({ id: channel.id });
                let _channelDatas = channelDatas(channel);
                _channelDatas.backup = backup;

                if (!_channel) await channelModel({ id: channel.id, ..._channelDatas }).save().catch((e) => null);
                else channelModel.findOneAndUpdate({ id: channel.id }, _channelDatas, { upsert: true }).catch((e) => error(e))
            }

            embed.description = '\`🔄️\` **Yedekleme:** Roller yedekleniyor...';
            msg.edit({ embeds: [embed] }).catch((e) => error(e));

            for (let role of roles) {
                const _role = await roleModel.findOne({ id: role.id });
                const { icon, unicodeEmoji, name, color, hoist, rawPosition, permissions, managed, mentionable, tags } = role;
                let roleDatas = { icon, unicodeEmoji, name, color, hoist, rawPosition, permissions: permissions.serialize(), managed, mentionable, tags };
                roleDatas.backup = backup;

                if (!_role) await roleModel({ id: role.id, ...roleDatas }).save().catch((e) => null);
                else roleModel.findOneAndUpdate({ id: role.id }, roleDatas, { upsert: true }).catch((e) => error(e))
            }

            const id = `delete-otherbackup-${backup.id}`
            const deleteButton = new ButtonBuilder().setCustomId(id).setLabel('Eski Yedekleri Sil!').setStyle(ButtonStyle.Danger);
            const actionRow = new ActionRowBuilder().addComponents(deleteButton);

            embed.description = `\`✅\` **Yedekleme tamamlandı.** Yedek ID: \`${backup.id}\``;
            msg.edit({ embeds: [embed], components: [actionRow] }).catch((e) => error(e));
            return setTimeout(() => msg.edit({ components: [] }).catch((e) => error(e)), 10000);
        }

        return message.reply({ content: command.help });
    }
}