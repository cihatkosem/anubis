const { Colors } = require('discord.js');
const config = require('../config');
const { commandModel } = require('../models');

module.exports = {
    id: 'command',
    names: ["komut"],
    permission: 'admins',
    description: 'Yönetici komut işlemleri için kullanılır.',
    run: async (client, command, message, args) => {
        const operation = args[0]?.toLowerCase();

        if (operation == 'yardım') {
            let embed = {
                color: Colors.White,
                description: `\`✅\` **Yardım Komutları**`,
                fields: [
                    { name: `\`➡️\` \`${config.prefix}komut bilgi [komut adı]\``, value: '\`❇️\` Komut hakkında bilgi alınır.' },
                    { name: `\`➡️\` \`${config.prefix}komut yetki ekle [komut adı] [rol/kullanıcı]\``, value: '\`❇️\` Komuta yetkili ekler.' },
                    { name: `\`➡️\` \`${config.prefix}komut yetki kaldır [komut adı] [rol/kullanıcı]\``, value: '\`❇️\` Komuttan yetkili kaldırır.' },
                    { name: `\`➡️\` \`${config.prefix}komut kanal ekle [komut adı] [kanal]\``, value: '\`❇️\` Komuta kanal ekler.' },
                    { name: `\`➡️\` \`${config.prefix}komut kanal kaldır [komut adı] [kanal]\``, value: '\`❇️\` Komuttan kanal kaldırır.' },
                    { name: `\`➡️\` \`${config.prefix}komut aç [komut adı]\``, value: '\`❇️\` Komutu kullanıma açar.' },
                    { name: `\`➡️\` \`${config.prefix}komut kapat [komut adı]\``, value: '\`❇️\` Komutu kullanıma kapatır.' },
                    { name: `\`➡️\` \`${config.prefix}komut listele\``, value: '\`❇️\` Komutları listeler.' },
                ]
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'yetki') {
            const subOperation = args[1]?.toLowerCase();
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[3]);
            const user = message.mentions.users.first() || message.guild.members.cache.get(args[3])?.user;
            const useText = `\`⚠️\` \`${config.prefix}komut ${operation} ${subOperation} [komut adı] [rol/kullanıcı]\` şeklinde kullandığınıza emin olun.`;

            if (subOperation == 'ekle') {
                if (!args[2]) return message.reply({ content: `\`⚠️\` **Komut adı belirtilmedi.** \n` + useText });

                const command = client['prefixCommands'].map(m => m).find(c => c.names.includes(args[2]));
                if (!command) return message.reply({ content: `\`⚠️\` **Belirtilen komut bulunamadı.** \n` + useText });

                const commandData = await commandModel.findOne({ names: { $in: [args[2]] } });
                if (!commandData) return message.reply({ content: `\`⚠️\` **Belirtilen komut verisi bulunamadı.** \n` + useText });

                if (!role && !user) return message.reply({ content: `\`⚠️\` **Rol veya kullanıcı belirtilmedi.** \n` + useText });

                commandData.authorities.push({
                    type: role ? 'role' : user ? 'user' : null,
                    id: role ? role.id : user ? user.id : null
                })

                commandData.save().catch((e) => null);

                return message.reply({
                    content: `\`✅\` ${role ? `<@&${role.id}> rolü` : user ? `<@${user.id}> kullanıcısı` : '\` error \`'} \`${args[2]}\` komutu kullanabilirler listesine eklendi.`
                });
            }

            if (subOperation == 'kaldır') {
                if (!args[2]) return message.reply({ content: `\`⚠️\` **Komut adı belirtilmedi.** \n` + useText });

                const command = client['prefixCommands'].map(m => m).find(c => c.names.includes(args[2]));
                if (!command) return message.reply({ content: `\`⚠️\` **Belirtilen komut bulunamadı.** \n` + useText });

                const commandData = await commandModel.findOne({ names: { $in: [args[2]] } });
                if (!commandData) return message.reply({ content: `\`⚠️\` **Belirtilen komut verisi bulunamadı.** \n` + useText });

                const authority = commandData.authorities.find(a => a.id == (role?.id || user?.id));
                if (!authority) return message.reply({ content: `\`⚠️\` **Belirtilen yetki bulunamadı.** \n` + useText });

                commandData.authorities = commandData.authorities.filter(a => a.id != (role?.id || user?.id));

                commandData.save().catch((e) => null);

                return message.reply({
                    content: `\`✅\` ${role ? `<@&${role.id}> rolü` : user ? `<@${user.id}> kullanıcısı` : '\` error \`'} \`${args[2]}\` komutu kullanabilirler listesinden silindi.`
                });
            }
        }

        if (operation == 'kanal') {
            const subOperation = args[1]?.toLowerCase();
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[3]);
            const useText = `\`⚠️\` \`${config.prefix}komut ${operation} ${subOperation} [komut adı] [kanal]\` şeklinde kullandığınıza emin olun.`;

            if (subOperation == 'ekle') {
                if (!args[2]) return message.reply({ content: `\`⚠️\` **Komut adı belirtilmedi.** \n` + useText });

                const command = client['prefixCommands'].map(m => m).find(c => c.names.includes(args[2]));
                if (!command) return message.reply({ content: `\`⚠️\` **Belirtilen komut bulunamadı.** \n` + useText });

                const commandData = await commandModel.findOne({ names: { $in: [args[2]] } });
                if (!commandData) return message.reply({ content: `\`⚠️\` **Belirtilen komut verisi bulunamadı.** \n` + useText });

                if (!channel) return message.reply({ content: `\`⚠️\` **Kanal belirtilmedi.** \n` + useText });

                commandData.channels.push(channel.id)

                commandData.save().catch((e) => null);

                return message.reply({
                    content: `\`✅\` <#${channel.id}> kanalı \`${args[2]}\` komutunun kullanabilir kanallar listesine eklendi.`
                });
            }

            if (subOperation == 'kaldır') {
                if (!args[2]) return message.reply({ content: `\`⚠️\` **Komut adı belirtilmedi.** \n` + useText });

                const command = client['prefixCommands'].map(m => m).find(c => c.names.includes(args[2]));
                if (!command) return message.reply({ content: `\`⚠️\` **Belirtilen komut bulunamadı.** \n` + useText });

                const commandData = await commandModel.findOne({ names: { $in: [args[2]] } });
                if (!commandData) return message.reply({ content: `\`⚠️\` **Belirtilen komut verisi bulunamadı.** \n` + useText });

                const channel = commandData.channels.find(a => f == channel.id);
                if (!channel) return message.reply({ content: `\`⚠️\` **Belirtilen kanal bulunamadı.** \n` + useText });

                commandData.channels = commandData.channels.filter(a => a != channel.id);

                commandData.save().catch((e) => null);

                return message.reply({
                    content: `\`✅\` ${role ? `<@&${role.id}> rolü` : user ? `<@${user.id}> kullanıcısı` : '\` error \`'} \`${args[2]}\` komutu kullanabilirler listesinden silindi.`
                });
            }
        }

        if (operation == 'aç') {
            const useText = `\`➡️\` \`${config.prefix}komut aç [komut adı]\` şeklinde kullanınız.`;
            if (!args[1]) return message.reply({ content: `\`⚠️\` Komut adı belirtilmedi.\n${useText}` });

            const command = client['prefixCommands'].map(m => m).find(c => c.names.includes(args[1]));
            if (!command) return message.reply({ content: '\`❓\` Belirtilen komut bulunamadı.' });

            const commandData = await commandModel.findOne({ names: { $in: [args[1]] } });
            if (!commandData) return message.reply({ content: '\`❓\` Belirtilen komut verisi bulunamadı.' });

            commandData.available = true;
            commandData.save().catch((e) => null);

            return message.reply({ content: `\`✅\` \`${args[1]}\` komutu izin verilen kullanıcılara/rollere kullanabilir hale getirildi.` });
        }

        if (operation == 'kapat') {
            const useText = `\`➡️\` \`${config.prefix}komut kapat [komut adı]\` şeklinde kullanınız.`;
            if (!args[1]) return message.reply({ content: `\`⚠️\` Komut adı belirtilmedi.\n${useText}` });

            const command = client['prefixCommands'].map(m => m).find(c => c.names.includes(args[1]));
            if (!command) return message.reply({ content: '\`❓\` Belirtilen komut bulunamadı.' });

            const commandData = await commandModel.findOne({ names: { $in: [args[1]] } });
            if (!commandData) return message.reply({ content: '\`❓\` Belirtilen komut verisi bulunamadı.' });

            commandData.available = false;
            commandData.save().catch((e) => null);

            return message.reply({ content: `\`✅\` \`${args[1]}\` komutu izin verilen kullanıcılara/rollere kullanılamaz hale getirildi.` });
        }

        if (operation == 'bilgi') {
            if (!args[1]) return message.reply({ content: '\`❓\` Komut adı belirtilmedi.' });

            const command = client['prefixCommands'].map(m => m).find(c => c.names.includes(args[1]));
            if (!command) return message.reply({ content: '\`⚠️\` Belirtilen komut bulunamadı.' });

            const commandData = await commandModel.findOne({ names: { $in: [args[1]] } });
            if (!commandData) return message.reply({ content: '\`⚠️\` Belirtilen komut verisi bulunamadı.' });

            let embed = {
                color: Colors.White,
                description: `\`✅\` **\`${args[1]}\` Komut Bilgileri**`,
                fields: [
                    { name: '\`❇️\` Açıklama', value: '\`➡️\` ' + commandData.description },
                    { name: '\`❇️\` Kullanılabilirlik', value: commandData.available ? '\`🟢\` Açık' : '\`🔴\` Kapalı' },
                    { name: '\`❇️\` Yetkili Kişiler', value: commandData.authorities.filter(f => f.type == 'user').map(a => `<@${a.id}>`).join(', ') || 'Yok' },
                    { name: '\`❇️\` Yetkili Roller', value: commandData.authorities.filter(f => f.type == 'role').map(a => `<@&${a.id}>`).join(', ') || 'Yok' },
                    { name: '\`❇️\` Kullanılabilir Kanallar', value: commandData.channels.map(a => `<#${a}>`).join(', ') || 'Yok' }
                ]
            }

            if (commandData.names.length > 1)
                embed.fields = [
                    { name: '\`❇️\` Kullanımlar', value: '\`➡️\` ' + commandData.names.map(n => `\`${n}\``).join(', ') },
                    ...embed.fields
                ]

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'listele') {
            const commands = await commandModel.find({});

            let embed = {
                color: Colors.White,
                description: `\`✅\` **Komut Listesi**`,
                fields: []
            }

            for (cmd of commands.filter(f => f.permission == 'dependent' || f.permission == 'everyone')) {
                const otherNames = cmd.names.length > 1 ? '\`(' + cmd.names.slice(1).join(', ') + ')\`' : '';
                const Fname = `\`${cmd.available ? '🟢' : '🔴'}\` \`${cmd.names[0]}\` ` + otherNames + '\n'
                const Fvalue = `\`➡️\` \`${cmd.description}\``
                embed.fields.push({ name: Fname, value: Fvalue })
            }

            return message.reply({ embeds: [embed] });
        }

        return message.reply({ content: command.help });
    }
}