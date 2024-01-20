const { Events, Colors } = require("discord.js");
const { client, CustomEvents } = require("../server");
const { userModel, logModel, userStatVoiceModel, userStatMutesModel } = require('../models');
const config = require("../config");
const { toCompare, error } = require("../functions");

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (oldState.guild.id !== config.serverId) return;

    const date = new Date().toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const joinChannel = oldState.channelId !== newState.channelId && newState.channelId && !oldState.channelId;
    const leaveChannel = oldState.channelId !== newState.channelId && oldState.channelId && !newState.channelId;
    const changeChannel = oldState.channelId !== newState.channelId && newState.channelId && oldState.channelId;

    const member = newState.guild.members.cache.get(newState.id);
    let userData = await userModel.findOne({ id: oldState.id });
    if (!userData) userData = await userModel({ id: oldState.id }).save().catch((e) => null);

    let userStatMuteData = await userStatMutesModel.findOne({ id: oldState.id });
    let userStatVoiceData = await userStatVoiceModel.findOne({ id: oldState.id });

    if (!userStatMuteData) userStatMuteData = await userStatMutesModel({ id: oldState.id }).save().catch((e) => null);
    if (!userStatVoiceData) userStatVoiceData = await userStatVoiceModel({ id: oldState.id }).save().catch((e) => null);

    let voiceDatas = userStatVoiceData?.voices || [];

    if (joinChannel) {
        const voiceData = voiceDatas?.find(f => f.channelId == newState.channelId && f.date == date) || null;

        userStatVoiceData.voices = [
            {
                date: voiceData?.date || date,
                channelId: voiceData?.channelId || newState.channelId,
                start: `${Date.now()}`,
                timespand: voiceData?.timespand || 0
            },
            ...userStatVoiceData?.voices?.filter(f => f !== voiceData)
        ];

        await userStatVoiceData.save().catch((e) => null);

        const voiceMutes = userStatMuteData?.mutes?.filter(f => f.type == 'voice_mute') || [];
        const lastVoiceMute = voiceMutes.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
        if (lastVoiceMute && Number(lastVoiceMute.endDate) < Date.now())
            newState.member.voice.setMute(false).catch((e) => error(e))
    }

    if (leaveChannel) {
        const voiceData = voiceDatas?.find(f => f.channelId == oldState.channelId && f.date == date) || null;

        if (voiceData) {
            userStatVoiceData.voices = [
                {
                    channelId: voiceData.channelId,
                    date: voiceData.date,
                    timespand: voiceData.timespand + (Number(Date.now()) - Number(voiceData.start))
                },
                ...(userStatVoiceData?.voices?.filter(f => f !== voiceData) || [])
            ]

            await userStatVoiceData.save().catch((e) => null);
        }
    }

    if (changeChannel) {
        const oldvoiceData = voiceDatas?.find(f => f.channelId === oldState.channelId && f.date === date) || null;

        const newvoiceData = voiceDatas?.find(f => f.channelId === newState.channelId && f.date === date) || null;

        if (oldvoiceData) {
            userStatVoiceData.voices = [
                {
                    channelId: oldvoiceData.channelId,
                    date: oldvoiceData.date,
                    timespand: oldvoiceData.timespand + (Number(Date.now()) - Number(oldvoiceData.start))
                },
                ...(userStatVoiceData?.voices?.filter(f => f !== oldvoiceData) || [])
            ];
        }

        userStatVoiceData.voices = [
            {
                channelId: newvoiceData?.channelId || newState.channelId,
                date: newvoiceData?.date || date,
                start: `${Date.now()}`,
                timespand: newvoiceData?.timespand || 0
            },
            ...(userStatVoiceData?.voices?.filter(f => f !== newvoiceData) || [])
        ];

        await userStatVoiceData.save().catch((e) => null);
    }

    if (leaveChannel || changeChannel) {
        const oldvoiceData = voiceDatas?.find(f => f.channelId == oldState.channelId && f.date == date) || null;

        if (oldvoiceData) {
            const time = (ms) => {
                const seconds = Math.floor(ms / 1000) % 60;
                const minutes = Math.floor(ms / (1000 * 60)) % 60;
                const hours = Math.floor(ms / (1000 * 60 * 60));

                const hour = hours > 0 ? `${hours} saat` : null;
                const minute = minutes > 0 ? `${minutes} dakika` : null;
                const second = seconds > 0 ? `${seconds} saniye` : null;

                return [hour, minute, second].filter(f => f).join(', ');
            }

            let milisecond = Number(Date.now()) - Number(oldvoiceData?.start || Date.now())
            let earnedCoin = config.voiceCoin * (milisecond / (1000 * 60))
            let userData = await userModel.findOne({ id: oldState.id });
            if (!userData) userData = await userModel({ id: oldState.id }).save().catch((e) => null);
            userData._coin = (userData._coin || 0) + earnedCoin
            await userData.save().catch((e) => null);

            const channel = client.channels.cache.get(config.coinInfoChannelId);
            const embed = {
                color: Colors.White,
                description: `<@${oldState.id}> adlı kullanıcı ses kanalında \`${time(milisecond)}\` kaldığından dolayı \`${Number(earnedCoin.toFixed(2))} TL\` kazandı!`
            }

            if (channel && (milisecond / (1000 * 60)) >= 1)
                channel.send({ embeds: [embed] }).catch((e) => error(e))
        }
    }

    const keys = ['serverDeaf', 'serverMute', 'selfDeaf', 'selfMute', 'selfVideo', 'streaming', 'channelId']
    const changedDatas = toCompare(oldState, newState).filter(f => keys.includes(f.key))

    if (changedDatas.length > 0) client.emit(CustomEvents.GuildMemberVoice, member.user, changedDatas);
})

client.on(CustomEvents.GuildMemberVoice, async (user, changedDatas) => {
    const loggingData = await logModel.findOne({ name: CustomEvents.GuildMemberVoice });
    const logChannel = client.channels.cache.get(loggingData?.channelId);

    if (loggingData && logChannel) {
        let embed = {
            color: Colors.White,
            title: 'Ses Durumu Değişti',
            description: `\`🔃\` <@${user.id}> kullanıcısının ses durumu değişti. (<t:${Math.floor(Date.now() / 1000)}:R>)\n\n`
        }

        const keyToStatus = (key, x, y) => {
            if (key == 'serverDeaf')
                return !x && y ? '\`🎧\` Sunucuda Sağırlaştırıldı' : '\`🎧\` Sunucudaki Sağırlaştırılması Kaldırıldı';
            else if (key == 'serverMute')
                return !x && y ? '\`🎤\` Sunucuda Susturuldu' : '\`🎤\` Sunucudaki Susturulması Kaldırıldı';
            else if (key == 'selfDeaf')
                return !x && y ? '\`🎧\` Kendini Sağırlaştırdı' : '\`🎧\` Kendindeki Sağırlaşturmayı Kaldırıldı';
            else if (key == 'selfMute')
                return !x && y ? '\`🎤\` Kendini Susturdu' : '\`🎤\` Kendindeki Susturmayı Kaldırıldı';
            else if (key == 'selfVideo')
                return !x && y ? '\`📸\` Kamerasını Açtı' : '\`📸\` Kamerasını Kapattı';
            else if (key == 'streaming')
                return !x && y ? '\`📺\` Yayın Açtı' : '\`📺\` Yayın Kapattı';
            else if (key == 'channelId')
                return !x && y ? `\`🔊\` <#${y}> kanalına Katıldı` : x && !y ? `\`🔊\` <#${x}> kanalından Ayrıldı` : `\`🔊\` <#${x}> kanalından <#${y}> kanalına geçti`;
            else return '\`❓\` ' + key;
        }

        embed.description += changedDatas.map((m, i) => `\`${i + 1}.\` ${keyToStatus(m.key, m?.old, m?.new)}`).join('\n')

        logChannel.send({ embeds: [embed] }).catch((e) => error(e))
    }
})
