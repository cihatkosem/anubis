const { Colors } = require("discord.js");
const config = require("../config");

module.exports = {
    id: "deleteMessage",
    names: ["sil", "temizle"],
    description: 'Belirtilen miktarda mesajı silmek için kullanılır.',
    permission: 'dependent',
    run: async (client, command, message, args) => {
        if (args[0] == 'yardım') {
            const embed = {
                color: Colors.White,
                description: `**Sil Komutları**`,
                fields: [
                    { name: `\`➡️\` \`${config.prefix}sil [miktar]\``, value: '\`❇️\` Belirtilen miktarda mesajı siler.' },
                    {
                        name: `\`➡️\` \`${config.prefix}sil [miktar] [kullanıcı]\``,
                        value: '\`❇️\` Belirtilen miktarda mesajı belirtilen kullanıcıya ait mesajları siler.'
                    },
                ]
            }

            return await message.reply({ embeds: [embed] });
        }

        const quantity = parseInt(args[0]);

        if (quantity) {
            const user = message.mentions.users.first() || client.users.cache.get(args[1]) || null;
            const limiting = "\`⚠️\` Tek seferde en fazla 100 mesaj silinebilir."
            const txt = (deleted) => `${quantity > 100 && deleted.size == 100 ? `\n ${limiting}` +
                `\n Buyüzden fazla gelen ${quantity - 100} mesaj silinemedi.` : ""}`

            if (args[1]) {
                if (!user?.id) return message.channel.send({ content: `\`⚠️\` <@${message.author.id}>, \`${args[1]}\` bilgisi ile Kullanıcı bulunamadı!` })

                const messages = await message.channel.messages.fetch({ limit: 100 });
                const userMessages = messages.filter((msg) => msg.author.id == user.id).map(m => m).slice(1, quantity)

                return await message.channel.bulkDelete(userMessages, true).then(async (deleted) => {
                    if (deleted <= 0) return message.channel.send({ content: "\`⚠️\` Hiç mesaj silinemedi!" })
                    await message.channel.send({
                        content: `\`✅\` <@${message.author.id}> isteğiniz üzerine <@${user.id}> \`${user.id}\` kullanıcısına ait toplam \`${deleted.size + 1}\` mesajı sildim.` + txt(deleted)
                    }).catch((e) => error(e))
                })
            }

            return await message.channel.bulkDelete(quantity >= 100 ? 100 : quantity, true).then(async (deleted) => {
                if (deleted <= 0) return message.channel.send({ content: "\`⚠️\` Hiç mesaj silinemedi!" })
                message.channel.send({ content: `\`✅\` <@${message.author.id}> isteğiniz üzerine toplam \`${deleted.size + 1}\` mesajı sildim.` + txt(deleted) }).catch((e) => error(e))
            })
        }

        return message.reply({ content: command.help });
    }
}