const { Colors } = require("discord.js");
const { client, CustomEvents } = require("../../../server");
const { logModel } = require("../../../models");

client.on(CustomEvents.GuildMemberUnmute, async (datas) => {
    const { user, executor, punishment } = datas;

    const loggingData = await logModel.findOne({ name: CustomEvents.GuildMemberUnmute });
    const logChannel = client.channels.cache.get(loggingData?.channelId);

    if (!loggingData || !logChannel) return;

    let embed = {
        color: Colors.White,
        title: '\`🔒\` Üye Susturulması Kaldırıldı!',
        description: `\`🤓\` **${user.username}** adlı üyeden ${punishment.type.includes('chat') ? 'Chat Mute' : 'Voice Mute'} cezası kaldırıldı!`,
        fields: [
            {
                name: "\`🫡\` Cezayı Kaldıran",
                value: `\`❇️\` <@${executor.id}> \`${executor.id}\``,
            },
            {
                name: "\`🥸\` Cezayı Veren",
                value: `\`❇️\` <@${punishment.executorId}> \`${punishment.executorId}\``,
            },
            {
                name: "\`🆔\` Ceza Kimliği",
                value: `\`❇️\` \`${punishment._id}\``,
            },
            {
                name: "\`📄\` Cezalandırma Sebebi",
                value: `\`❇️\` ${punishment.reason}`,
            }
        ]
    }

    logChannel.send({ embeds: [embed] });
})