const { Colors } = require("discord.js");
const { userStatMessageModel, userStatVoiceModel, userStatInviteModel } = require("../models");
const { dayjs } = require("../functions");

module.exports = {
    id: 'userStat',
    names: ["stat"],
    permission: 'dependent',
    description: 'Kullanıcı istatistiklerini gösterir.',
    run: async (client, command, message, args) => {
        const operation = args.filter(f => f == 'genel' || f == 'haftalık' || f == 'günlük')[0] || "genel";
        const userId = args.filter(f => f !== operation)[0]?.replace('<@', '').replace('>', '') || message.author.id;
        const user = message.guild.members.cache.get(userId)?.user || message.author;

        if (operation == 'yardım') {
            let embed = {
                color: Colors.White,
                description: `\`✅\` **Stat Komutları**`,
                fields: [
                    { name: `\`➡️\` \`${config.prefix}stat\``, value: '\`❇️\` Kullanıcının tüm zamanlardaki istatistiklerini gösterir.' },
                    { name: `\`➡️\` \`${config.prefix}stat haftalık\``, value: '\`❇️\` Kullanıcının haftalık istatistiklerini gösterir.' },
                    { name: `\`➡️\` \`${config.prefix}stat günlük\``, value: '\`❇️\` Kullanıcının günlük istatistiklerini gösterir.' },
                ]
            }

            return message.reply({ embeds: [embed] });
        }

        const dateToNumber = (date) => dayjs('valueOf', date.split('.').reverse().join('-'))
        const time = (ms) => {
            const seconds = Math.floor(ms / 1000) % 60;
            const minutes = Math.floor(ms / (1000 * 60)) % 60;
            const hours = Math.floor(ms / (1000 * 60 * 60));
        
            const hour = hours > 0 ? `${hours} saat` : null;
            const minute = minutes > 0 ? `${minutes} dakika` : null;
            const second = seconds > 0 ? `${seconds} saniye` : null;
        
            return [hour, minute, second].filter(f => f).join(', ');
        }

        let embed = {
            color: Colors.White,
            author: {
                name: user.tag,
                icon_url: user.avatarURL({ dynamic: true }),
            },
            thumbnail: {
                url: user.avatarURL({ dynamic: true }),
            },
            fields: [],
        }

        if (message.author.id !== user.id) 
            embed.footer = { text: `➡️ Komut ${message.author.tag} (${message.author.id}) tarafından kullanıldı.` };

            
        const userStatMessageData = await userStatMessageModel.findOne({ id: user.id });
        const userStatVoiceData = await userStatVoiceModel.findOne({ id: user.id });
        const userStatInviteData = await userStatInviteModel.findOne({ id: user.id });

        const messages = userStatMessageData?.messages || [];
        const voices = userStatVoiceData?.voices || [];
        const invites = userStatInviteData?.invites || [];

        if (operation === 'genel') {
            let _channelsDatas = [];
            let _voicesDatas = [];

            for (const data of messages) {
                const savedData = _channelsDatas.find(c => c.channelId == data.channelId);
                if (!savedData) _channelsDatas.push({ channelId: data.channelId, count: data.count });
                else savedData.count += data.count;
            }

            for (const data of voices) {
                const savedData = _voicesDatas.find(c => c.channelId == data.channelId);
                if (!savedData) _voicesDatas.push({ channelId: data.channelId, timespand: data.timespand });
                else savedData.timespand += data.timespand;
            }

            const channelsDatas = _channelsDatas.sort((a, b) => b.count - a.count).slice(0, 10);
            const voicesDatas = _voicesDatas.sort((a, b) => b.timespand - a.timespand).slice(0, 10);
            const invitesDatasLenght = invites.filter(f => !f?.left).length || 0;
            const leftInvitesDatasLenght = invites.filter(f => f?.left).length || 0;

            const totalVoice = time(voices.reduce((a, b) => a + b.timespand, 0) || 0);
            embed.description = `\`📈\` **Toplam Mesaj** : \`${messages.reduce((a, b) => a + b.count, 0) || 0} mesaj\`\n`;
            embed.description += `\`📈\` **Toplam Ses** : \`${totalVoice.length > 0 ? totalVoice : '0 saniye'}\``;

            if (messages.length > 0) {
                embed.fields.push({
                    name: '\`📈\` Top 10 Mesaj Kanalı',
                    value: channelsDatas.map(m => `\`💭\` <#${m.channelId}> : \`${m.count} mesaj\``).join("\n")
                })
            }

            if (voices.length > 0) {
                embed.fields.push({
                    name: '\`📈\` Top 10 Ses Kanalı',
                    value: voicesDatas.map(m => `\`🔉\` <#${m.channelId}> : \`${time(m.timespand).length > 0 ? time(m.timespand) : '0 saniye'}\``).join("\n")
                })
            }

            if (invites.length > 0) {
                embed.fields.push({
                    name: `\`#️⃣\` **Toplam Davet** : \`${invitesDatasLenght + leftInvitesDatasLenght}\``,
                    value: (invitesDatasLenght > 0 ? `\`➡️\` \`${invitesDatasLenght}\` kişi hala sunucuda.\n` : '') +
                        (leftInvitesDatasLenght > 0 ? `\`⬅️\` \`${leftInvitesDatasLenght}\` kişi ayrıldı.` : '')
                })
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation === 'haftalık') {
            const WeekAgoDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
            const weeklyMessages = messages.filter(f => dateToNumber(f.date) > dateToNumber(WeekAgoDate));
            const weeklyVoices = voices.filter(f => dateToNumber(f.date) > dateToNumber(WeekAgoDate));
            const weeklyInvites = invites.filter(f => Number(f.timestamp) > dateToNumber(WeekAgoDate));

            let _channelsDatas = [];
            let _voicesDatas = [];

            for (const data of weeklyMessages) {
                const savedData = _channelsDatas.find(c => c.channelId == data.channelId);
                if (!savedData) _channelsDatas.push({ channelId: data.channelId, count: data.count });
                else savedData.count += data.count;
            }
            
            for (const data of weeklyVoices) {
                const savedData = _voicesDatas.find(c => c.channelId == data.channelId);
                if (!savedData) _voicesDatas.push({ channelId: data.channelId, timespand: data.timespand });
                else savedData.timespand += data.timespand;
            }

            const channelsDatas = _channelsDatas.sort((a, b) => b.count - a.count).slice(0, 10);
            const voicesDatas = _voicesDatas.sort((a, b) => b.timespand - a.timespand).slice(0, 10);
            const invitesDatasLenght = weeklyInvites.filter(f => !f?.left).length || 0;
            const leftInvitesDatasLenght = weeklyInvites.filter(f => f?.left).length || 0;
            
            const totalVoice = time(voicesDatas.reduce((a, b) => a + b.timespand, 0) || 0);
            embed.description = `\`📈\` **Haftalık Mesaj** : \`${channelsDatas.reduce((a, b) => a + b.count, 0) || 0} mesaj\`\n`;
            embed.description += `\`📈\` **Haftalık Ses** : \`${totalVoice.length > 0 ? totalVoice : '0 saniye'}\``;

            if (channelsDatas.length > 0) {
                embed.fields.push({
                    name: '\`📈\` Haftalık Top 10 Mesaj Kanalı',
                    value: channelsDatas.map(m => `\`💭\` <#${m.channelId}> : \`${m.count} mesaj\``).join("\n")
                })
            }

            if (voicesDatas.length > 0) {
                embed.fields.push({
                    name: '\`📈\` Haftalık Top 10 Ses Kanalı',
                    value: voicesDatas.map(m => `\`🔉\` <#${m.channelId}> : \`${time(m.timespand).length > 0 ? time(m.timespand) : '0 saniye'}\``).join("\n")
                })
            }

            if (weeklyInvites.length > 0) {
                embed.fields.push({
                    name: `\`#️⃣\` **Haftalık Davet** : \`${invitesDatasLenght + leftInvitesDatasLenght}\``,
                    value: (invitesDatasLenght > 0 ? `\`➡️\` \`${invitesDatasLenght}\` kişi hala sunucuda.\n` : '') +
                        (leftInvitesDatasLenght > 0 ? `\`⬅️\` \`${leftInvitesDatasLenght}\` kişi ayrıldı.` : '')
                })
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation === 'günlük') {
            const DayAgoDate = new Date(Date.now() - (24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
            const dailyMessages = messages.filter(f => dateToNumber(f.date) > dateToNumber(DayAgoDate));
            const dailyVoices = voices.filter(f => dateToNumber(f.date) > dateToNumber(DayAgoDate));
            const dailyInvites = invites.filter(f => Number(f.timestamp) > dateToNumber(DayAgoDate));

            let _channelsDatas = [];
            let _voicesDatas = [];

            for (const data of dailyMessages) {
                const savedData = _channelsDatas.find(c => c.channelId == data.channelId);
                if (!savedData) _channelsDatas.push({ channelId: data.channelId, count: data.count });
                else savedData.count += data.count;
            }

            for (const data of dailyVoices) {
                const savedData = _voicesDatas.find(c => c.channelId == data.channelId);
                if (!savedData) _voicesDatas.push({ channelId: data.channelId, timespand: data.timespand });
                else savedData.timespand += data.timespand;
            }

            const channelsDatas = _channelsDatas.sort((a, b) => b.count - a.count).slice(0, 10);
            const voicesDatas = _voicesDatas.sort((a, b) => b.timespand - a.timespand).slice(0, 10);
            const invitesDatasLenght = dailyInvites.filter(f => !f?.left).length || 0;
            const leftInvitesDatasLenght = dailyInvites.filter(f => f?.left).length || 0;
            
            const totalVoice = time(voicesDatas.reduce((a, b) => a + b.timespand, 0) || 0);
            embed.description = `\`📈\` **Günlük Mesaj** : \`${channelsDatas.reduce((a, b) => a + b.count, 0) || 0} mesaj\`\n`;
            embed.description += `\`📈\` **Günlük Ses** : \`${totalVoice.length > 0 ? totalVoice : '0 saniye'}\``;

            if (channelsDatas.length > 0) {
                embed.fields.push({
                    name: '\`📈\` Günlük Top 10 Mesaj Kanalı',
                    value: channelsDatas.map(m => `\`💭\` <#${m.channelId}> : \`${m.count} mesaj\``).join("\n")
                })
            }

            if (voicesDatas.length > 0) {
                embed.fields.push({
                    name: '\`📈\` Günlük Top 10 Ses Kanalı',
                    value: voicesDatas.map(m => `\`🔉\` <#${m.channelId}> : \`${time(m.timespand).length > 0 ? time(m.timespand) : '0 saniye'}\``).join("\n")
                })
            }

            if (dailyInvites.length > 0) {
                embed.fields.push({
                    name: `\`#️⃣\` **Günlük Davet** : \`${invitesDatasLenght + leftInvitesDatasLenght}\``,
                    value: (invitesDatasLenght > 0 ? `\`➡️\` \`${invitesDatasLenght}\` kişi hala sunucuda.\n` : '') +
                        (leftInvitesDatasLenght > 0 ? `\`⬅️\` \`${leftInvitesDatasLenght}\` kişi ayrıldı.` : '')
                })
            }

            return message.reply({ embeds: [embed] });
        }

        return message.reply({ content: command.help });
    }
}