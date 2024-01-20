const { Colors } = require("discord.js");
const { userStatMessageModel, userStatVoiceModel, userStatInviteModel } = require("../models");
const { dayjs, error } = require("../functions");

module.exports = {
    id: 'top10Stat',
    names: ["top10"],
    permission: 'dependent',
    description: 'Stat verisi en yüksek 10 kişiyi gösterir.',
    run: async (client, command, message, args) => {
        const operation = args.filter(f => f == 'genel' || f == 'haftalık' || f == 'günlük')[0] || "genel";

        if (operation == 'yardım') {
            let embed = {
                color: Colors.White,
                description: `\`✅\` **Top 10 Komutları**`,
                fields: [
                    { name: `\`➡️\` \`${config.prefix}top10\``, value: '\`❇️\` Genel istatistikleri gösterir.' },
                    { name: `\`➡️\` \`${config.prefix}top10 haftalık\``, value: '\`❇️\` Haftalık istatistikleri gösterir.' },
                    { name: `\`➡️\` \`${config.prefix}top10 günlük\``, value: '\`❇️\` Günlük istatistikleri gösterir.' },
                ]
            }

            return message.reply({ embeds: [embed] });
        }

        const dateToNumber = (date) => dayjs('valueOf', date.split('.').reverse().join('-'))
        const countFix = (count) => count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
            title: `\`📊\` ${operation[0].toUpperCase() + operation.slice(1)} Top 10`,
            description: '\`🔁\` Veriler yükleniyor...',
            fields: [],
            footer: { text: `➡️ Komut ${message.author.tag} (${message.author.id}) tarafından kullanıldı.` }
        }

        let msg;
        if (['genel', 'haftalık', 'günlük'.includes(operation)]) {
            msg = await message.reply({ embeds: [embed] });
            embed.description = null;

            const usersStatMessageData = await userStatMessageModel.find();
            const usersStatVoiceData = await userStatVoiceModel.find();
            const usersStatInviteDatas = await userStatInviteModel.find();

            if (usersStatMessageData?.length + usersStatVoiceData?.length + usersStatInviteDatas?.length == 0) {
                embed.description = '\`❓\` Hiç veri bulunamadı.';
                return msg.edit({ embeds: [embed] }).catch((e) => error(e));
            }

            const messagesUsers = usersStatMessageData.filter(f => f.messages.length > 0).map(m => ({ id: m.id, messages: m.messages }));
            const voicesUsers = usersStatVoiceData.filter(f => f.voices.length > 0).map(m => ({ id: m.id, voices: m.voices }));
            const invitesUsers = usersStatInviteDatas.filter(f => f.invites.length > 0).map(m => ({ id: m.id, invites: m.invites }));

            if (operation === 'genel') {
                const top10MessageUser = messagesUsers
                    .map(data => ({ id: data.id, count: data.messages.reduce((a, b) => a + b.count, 0) || 0 }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                const top10VoiceUser = voicesUsers
                    .map(data => ({ id: data.id, timespand: data.voices.reduce((a, b) => a + b.timespand, 0) || 0 }))
                    .sort((a, b) => b.timespand - a.timespand)
                    .slice(0, 10);

                const top10InviteUser = invitesUsers
                    .map(data => ({ id: data.id, count: data.invites.filter(f => !f?.left).length || 0 }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                if (top10MessageUser.length > 0) {
                    embed.fields.push({
                        name: '\`📈\` Top 10 Mesaj',
                        value: top10MessageUser.map((m, i) => {
                            return `\`${i + 1 == 1 ? '👑' : `${i + 1}.`}\` <@${m.id}> : \`${countFix(m.count)} mesaj\``
                        }).join("\n")
                    })
                }

                if (top10VoiceUser.length > 0) {
                    embed.fields.push({
                        name: '\`📈\` Top 10 Ses',
                        value: top10VoiceUser.map((m, i) => {
                            return `\`${i + 1 == 1 ? '👑' : `${i + 1}.`}\` <@${m.id}> : \`${time(m.timespand).length > 0 ? time(m.timespand) : '0 saniye'}\``
                        }).join("\n")
                    })
                }

                if (top10InviteUser.length > 0) {
                    embed.fields.push({
                        name: `\`📈\` Top 10 Davet`,
                        value: top10InviteUser.map((m, i) => {
                            return `\`${i + 1 == 1 ? '👑' : `${i + 1}.`}\` <@${m.id}> : \`${countFix(m.count)} davet\``
                        }).join("\n")
                    })
                }

                return msg.edit({ embeds: [embed] }).catch((e) => error(e));
            }

            if (operation === 'haftalık') {
                const haftalıkTop10MessageUser = messagesUsers
                    .map(data => {
                        const weeklyAgoDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
                        const weeklyMessages = data.messages.filter(f => dateToNumber(f.date) > dateToNumber(weeklyAgoDate));
                        return { id: data.id, count: weeklyMessages.reduce((a, b) => a + b.count, 0) || 0 }
                    })
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                const haftalıkTop10VoiceUser = voicesUsers
                    .map(data => {
                        const weeklyAgoDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
                        const weeklyVoices = data.voices.filter(f => dateToNumber(f.date) > dateToNumber(weeklyAgoDate));
                        return { id: data.id, timespand: weeklyVoices.reduce((a, b) => a + b.timespand, 0) || 0 }
                    })
                    .sort((a, b) => b.timespand - a.timespand)
                    .slice(0, 10);

                const haftalıkTop10InviteUser = invitesUsers
                    .map(data => {
                        const weeklyAgoDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
                        const weeklyInvites = data.invites.filter(f => Number(f.timestamp) > dateToNumber(weeklyAgoDate));
                        return { id: data.id, count: weeklyInvites.filter(f => !f?.left).length || 0 }
                    })
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                if (haftalıkTop10MessageUser.length > 0) {
                    embed.fields.push({
                        name: '\`📈\` Haftalık Top 10 Mesaj',
                        value: haftalıkTop10MessageUser.map((m, i) => {
                            return `\`${i + 1 == 1 ? '👑' : `${i + 1}.`}\` <@${m.id}> : \`${countFix(m.count)} mesaj\``
                        }).join('\n')
                    })
                }

                if (haftalıkTop10VoiceUser.length > 0) {
                    embed.fields.push({
                        name: '\`📈\` Haftalık Top 10 Ses',
                        value: haftalıkTop10VoiceUser.map((m, i) => {
                            return `\`${i + 1 == 1 ? '👑' : `${i + 1}.`}\` <@${m.id}> : \`${time(m.timespand).length > 0 ? time(m.timespand) : '0 saniye'}\``
                        }).join('\n')
                    })
                }

                if (haftalıkTop10InviteUser.length > 0) {
                    embed.fields.push({
                        name: `\`📈\` Haftalık Top 10 Davet`,
                        value: haftalıkTop10InviteUser.map((m, i) => {
                            return `\`${i + 1 == 1 ? '👑' : `${i + 1}.`}\` <@${m.id}> : \`${countFix(m.count)} davet\``
                        }).join('\n')
                    })
                }

                return msg.edit({ embeds: [embed] }).catch((e) => error(e));
            }

            if (operation === 'günlük') {
                const günlükTop10MessageUser = messagesUsers
                    .map(data => {
                        const dailyAgoDate = new Date(Date.now() - (24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
                        const dailyMessages = data.messages.filter(f => dateToNumber(f.date) > dateToNumber(dailyAgoDate));
                        return { id: data.id, count: dailyMessages.reduce((a, b) => a + b.count, 0) || 0 }
                    })
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                const günlükTop10VoiceUser = voicesUsers
                    .map(data => {
                        const dailyAgoDate = new Date(Date.now() - (24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
                        const dailyVoices = data.voices.filter(f => dateToNumber(f.date) > dateToNumber(dailyAgoDate));
                        return { id: data.id, timespand: dailyVoices.reduce((a, b) => a + b.timespand, 0) || 0 }
                    })
                    .sort((a, b) => b.timespand - a.timespand)
                    .slice(0, 10);

                const günlükTop10InviteUser = invitesUsers
                    .map(data => {
                        const dailyAgoDate = new Date(Date.now() - (24 * 60 * 60 * 1000)).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
                        const dailyInvites = data.invites.filter(f => Number(f.timestamp) > dateToNumber(dailyAgoDate));
                        return { id: data.id, count: dailyInvites.filter(f => !f?.left).length || 0 }
                    })
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                if (günlükTop10MessageUser.length > 0) {
                    embed.fields.push({
                        name: '\`📈\` Günlük Top 10 Mesaj',
                        value: günlükTop10MessageUser.map((m, i) => {
                            return `\`${i + 1 == 1 ? '👑' : `${i + 1}.`}\` <@${m.id}>: \`${countFix(m.count)} mesaj\``
                        }).join("\n")
                    })
                }

                if (günlükTop10VoiceUser.length > 0) {
                    embed.fields.push({
                        name: '\`📈\` Günlük Top 10 Ses',
                        value: günlükTop10VoiceUser.map((m, i) => {
                            return `\`${i + 1 == 1 ? '👑' : `${i + 1}.`}\` <@${m.id}>: \`${time(m.timespand).length > 0 ? time(m.timespand) : '0 saniye'}\``
                        }).join("\n")
                    })
                }

                if (günlükTop10InviteUser.length > 0) {
                    embed.fields.push({
                        name: `\`📈\` Günlük Top 10 Davet`,
                        value: günlükTop10InviteUser.map((m, i) => {
                            return `\`${i + 1 == 1 ? '👑' : `${i + 1}.`}\` <@${m.id}>: \`${countFix(m.count)} davet\``
                        }).join("\n")
                    })
                }

                return msg.edit({ embeds: [embed] }).catch((e) => error(e));
            }
        }

        return message.reply({ content: command.help });
    }
}