const { Colors } = require("discord.js");
const { client, CustomEvents } = require("../../../server");
const { logModel } = require("../../../models");

client.on(CustomEvents.GuildMemberMute, async (datas) => {
    const { user, executor, punishment } = datas;

    const loggingData = await logModel.findOne({ name: CustomEvents.GuildMemberMute });
    const logChannel = client.channels.cache.get(loggingData?.channelId);

    if (!loggingData || !logChannel) return;

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
        title: `\`🔒\` Üyeye Susturuldu!`,
        description: `\`🤓\` **${user.username}** adlı üyeye ${punishment.type.includes('chat') ? 'Chat Mute' : 'Voice Mute'} cezası verildi!`,
        fields: [
            {
                name: "\`🫡\` Cezalandıran",
                value: `\`❇️\` <@${executor.id}> \`${executor.id}\``,
            },
            {
                name: "\`🆔\` Ceza Kimliği",
                value: `\`❇️\` \`${punishment._id}\``,
            },
            {
                name: "\`🗓️\` Ceza Tarihi",
                value: `\`❇️\` <t:${Math.floor(Date.now() / 1000)}:R>`,
            },
            {
                name: "\`📄\` Cezalandırma Sebebi",
                value: `\`❇️\` ${punishment.reason}`,
            },
            {
                name: "\`⌛\` Ceza Süresi",
                value:
                    `\`❇️\` \`${time(punishment.time)}\`\n` +
                    `\`❇️\` Bitiş: <t:${Math.floor(punishment.endDate / 1000)}:R>`,
            }
        ]
    }

    logChannel.send({ embeds: [embed] });
})