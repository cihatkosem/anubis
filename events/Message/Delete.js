const { Events, AuditLogEvent, Colors, AttachmentBuilder } = require("discord.js");
const { logModel, deletedMsgModel } = require("../../models");
const { getEntry, error } = require("../../functions");
const { client } = require("../../server");
const config = require("../../config");

client.on(Events.MessageDelete, async (message) => {
    if (message.guildId !== config.serverId) return;
    if (message.author.bot) return;

    const entry = await getEntry(client, message.guildId, AuditLogEvent.MessageDelete);
    const author = Date.now() - entry?.createdTimestamp > 2000 ? message.author : entry.executor;

    await deletedMsgModel({
        id: message.id,
        channelId: message.channelId,
        authorId: message.author.id,
        executorId: author.id,
        content: message.content,
        date: message.createdTimestamp,
        deletedDate: Date.now()
    }).save().catch((e) => null);

    const loggingData = await logModel.findOne({ name: Events.MessageDelete });
    if (!loggingData) return;

    const logChannel = client.channels.cache.get(loggingData.channelId);
    if (!logChannel) return;

    let embedTXT = '\n';
    if (message.embeds[0]) {
        for (let e of message.embeds) {
            if (e?.title) embedTXT += `title: ${e?.title}\n`;
            if (e.fields.length > 0) embedTXT += `fields:\n`;

            for (let i = 0; i < e.fields.length; i++) {
                const value = e.fields[i].value
                    .replaceAll('```', `'`).replaceAll('`', `'`)
                    .replace('fix', '').replaceAll('\n', '');
                embedTXT += `${i + 1} - name: ${e.fields[i].name}\n`;
                embedTXT += `${i + 1} - value: ${value}\n`;
            }

            if (e?.description) embedTXT += `description: ${e?.description}\n`;
            if (e?.footer?.text) embedTXT += `footer: ${e?.footer?.text}\n`;
            if (e?.image?.url) embedTXT += `image: ${e?.image?.url}\n`;
            if (e?.thumbnail?.url) embedTXT += `thumbnail: ${e?.thumbnail?.url}\n`;
            if (e?.author?.name) embedTXT += `author: ${e?.author?.name}\n`;
            if (e?.timestamp) embedTXT += `timestamp: ${e?.timestamp}\n`;
            if (e?.url) embedTXT += `url: ${e?.url}\n`;
            if (e?.video?.url) embedTXT += `video: ${e?.video?.url}\n`;
        }
    }

    let text = `+ User: ${message.author.tag} (${message.author.id})\n- Content:\n${message.content}`;
    if (embedTXT.length > 0) text += `\n- Embeds:\n${embedTXT}`;
    const buffer = Buffer.from(text, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: 'deletedMessage.diff' });
    const files = message.content.length > 1024 ? [attachment] : [];

    let embed = {
        color: Colors.White,
        title: `Mesaj Silindi!`,
        description: `<@${message.author.id}> adlı kullanıcının mesajı silindi! <t:${Math.floor(Date.now() / 1000)}:R>`,
        fields: [
            {
                name: "Silen",
                value: `<@${author.id}> \`${author.id}\``,
            }
        ]
    }

    if (message.content?.length + embedTXT.length !== 0 && message.content?.length + embedTXT.length < 1024)
        embed.fields.push({
            name: "Mesaj", value: `\`\`\`fix
            ${message.content}\n${embedTXT}\`\`\``.replaceAll('    ', '')
        })

    logChannel.send({ embeds: [embed] })
        .then(msg => files.length > 0 ? msg.reply({ files }) : null)
})
