const { Events, AuditLogEvent, Colors } = require("discord.js");
const { channelModel, logModel, rollbackModel } = require('../../models');
const { channelDatas, getEntry, toCompare, error } = require("../../functions");
const { client } = require("../../server");
const config = require("../../config");

client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
    if (oldChannel.guildId !== config.serverId) return;

    const oldChannelDatas = channelDatas(oldChannel), newChannelDatas = channelDatas(newChannel);
    const compares = toCompare(oldChannelDatas, newChannelDatas);
    const channelData = await channelModel.findOne({ id: oldChannel.id });
    const onlyRawPosition = compares.find(f => f.key == 'rawPosition') && compares.length == 1;
    let entry;
    if (compares.find(f => f.key == 'permissionOverwrites'))
        entry = await getEntry(client, oldChannel.guildId, AuditLogEvent.ChannelOverwriteUpdate);
    else
        entry = await getEntry(client, oldChannel.guildId, AuditLogEvent.ChannelUpdate);

    if (client.user.id == entry.executor.id) return;
    const member = oldChannel.guild.members.cache.get(entry.executor.id);

    const rollbacking = await rollbackModel.findOne({ name: Events.ChannelUpdate });
    const loggingData = await logModel.findOne({ name: Events.ChannelUpdate });

    let message, embed;
    if (loggingData) {
        const logChannel = client.channels.cache.get(loggingData.channelId);
        if (!logChannel) return error(Events.ChannelUpdate + ' log ayarlanmış fakat kanal bulunamadı!')

        embed = {
            color: Colors.White,
            title: `\`🔃\` Kanal Düzenlendi!`,
            description: `**${oldChannel.name}** adlı ayarları düzenlendi! <t:${Math.floor(Date.now() / 1000)}:R>`,
            fields: [
                {
                    name: "\`🔃\` Değiştirilen Bilgiler",
                    value: compares.map((x) => {
                        if (x.key == 'permissionOverwrites') {
                            return `\`❇️\` Kanal izinleri değiştirildi!`
                        } else {
                            return `\`❇️\` \`${x.key}\` \`|\` \`${x.old}\` \`➡️\` \`${x.new}\``
                        }
                    }).join("\n"),
                }
            ]
        }

        if (!onlyRawPosition && entry.createdTimestamp > Date.now() - 5000) {
            embed.fields = [
                {
                    name: "\`🫡\` Düzenleyen",
                    value: `\`❇️\` <@${entry.executor.id}> \`${entry.executor.tag}\` \`${entry.executor.id}\` `,
                },
                ...embed.fields
            ]
        }

        message = await logChannel.send({ embeds: [embed] }).catch((e) => error(e));
    }

    if (!rollbacking) return;
    if (rollbacking.excluded.find(f => f.type == 'user' && f.id == entry.executor.id)) return;
    if (rollbacking.excluded.filter(f => member._roles.includes(f.id)).length > 0) return;

    if (onlyRawPosition) {
        if (channelData.position == newChannelDatas.position) return;
        newChannel.setPosition(channelData.position - 1)
            .then(() => {
                if (!message) return;
                embed.title = "\`✅\` Düzenlenen kanal eski haline getirildi!"
                embed.fields.push({ name: "\`✅\` İşlem", value: "\`❇️\` Eski haline getirildi." })
                message.edit({ embeds: [embed] }).catch((e) => error(e));
            })
            .catch((e) => {
                if (!message) return;
                embed.title = "\`❎\` Düzenlenen kanal eski haline getirilemedi!"
                embed.fields.push({ name: "\`❎\` İşlem", value: "\`❇️\` Eski haline getirilemedi." })
                message.edit({ embeds: [embed] }).catch((e) => error(e));
                error(e)
            })
        return;
    }

    newChannel.edit(channelDatas(oldChannel))
        .then(() => {
            if (!message) return;
            embed.title = "\`✅\` Düzenlenen kanal eski haline getirildi!"
            embed.fields.push({ name: "\`✅\` İşlem", value: "\`❇️\` Eski haline getirildi." })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
        })
        .catch((e) => {
            if (!message) return;
            embed.title = "\`❎\` Düzenlenen kanal eski haline getirilemedi!"
            embed.fields.push({ name: "\`❎\` İşlem", value: "\`❇️\` Eski haline getirilemedi." })
            message.edit({ embeds: [embed] }).catch((e) => error(e));
            error(e)
        })
})