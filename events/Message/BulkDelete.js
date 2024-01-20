const { Events, AuditLogEvent, Colors, AttachmentBuilder } = require("discord.js");
const { logModel } = require("../../models");
const { getEntry } = require("../../functions");
const { client } = require("../../server");
const config = require("../../config");

client.on(Events.MessageBulkDelete, async (messages) => {
    const guild = client.guilds.cache.get(config.serverId);
    if (messages.map(m => m)[0].guildId !== config.serverId) return;
    const entry = await getEntry(client, guild.id, AuditLogEvent.MessageBulkDelete);

    const loggingData = await logModel.findOne({ name: Events.MessageBulkDelete });
    if (!loggingData) return;

    const logChannel = client.channels.cache.get(loggingData.channelId);
    if (!logChannel) return;

    const text = messages.reverse().map((message) => `User: ${message.author.tag} (${message.author.id})\nContent: ${message.content}`).join("\n\n");
    const buffer = Buffer.from(text, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: 'deletedMessages.txt' });

    let embed = {
        color: Colors.White,
        title: `Mesajlar Silindi!`,
        description: `**${messages.size}** adet mesaj silindi! <t:${Math.floor(Date.now() / 1000)}:R>`,
        fields: [
            {
                name: "Silen",
                value: `<@${entry.executor?.id}> \`${entry.executor?.id}\``,
            }
        ]
    }

    logChannel.send({ embeds: [embed] })
        .then(msg => attachment ? msg.reply({ files: [attachment] }) : null)
})