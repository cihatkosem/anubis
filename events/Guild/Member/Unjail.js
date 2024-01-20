const { Colors } = require("discord.js");
const { client, CustomEvents } = require("../../../server");
const { logModel } = require("../../../models");

client.on(CustomEvents.GuildMemberUnjail, async (datas) => {
    const { user, executor, punishment } = datas;

    const loggingData = await logModel.findOne({ name: CustomEvents.GuildMemberUnjail });
    const logChannel = client.channels.cache.get(loggingData?.channelId);

    if (!loggingData || !logChannel) return;

    let embed = {
        color: Colors.White,
        title: '\`🔒\` Üye Jaili Kaldırıldı!',
        description: `\`🤓\` **${user.username}** adlı üyeden jail cezası kaldırıldı!`,
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