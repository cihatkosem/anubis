const { Colors } = require("discord.js");
const { client, CustomEvents } = require("../../../server");
const { logModel } = require("../../../models");

client.on(CustomEvents.GuildMemberBlock, async (datas) => {
    const { user, executor, punishment } = datas;

    const loggingData = await logModel.findOne({ name: CustomEvents.GuildMemberBlock });
    const logChannel = client.channels.cache.get(loggingData?.channelId);

    if (!loggingData || !logChannel) return;

    let embed = {
        color: Colors.White,
        title: '\`🔒\` Üye Banlandı!',
        description: `\`🤓\` **${user.username}** adlı üyeye ban cezası verildi!`,
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
            }
        ]
    }

    logChannel.send({ embeds: [embed] });
})