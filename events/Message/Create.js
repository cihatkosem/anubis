const { Events, ChannelType, ButtonBuilder, ButtonStyle, Colors, ActionRowBuilder } = require("discord.js");
const { client } = require("../../server");
const config = require("../../config");
const { commandModel, userModel, userStatMessageModel } = require("../../models");
const { error } = require("../../functions");

client.on(Events.MessageCreate, async (message) => {
    if (message.author.id == client.user.id) return;
    if (message.author.bot) return;

    let content = message.content.toLowerCase();

    if (message.channel.type == ChannelType.DM) {
        let embed = {
            title: `${client.user.username}'a Özelden Mesaj Gönderildi!`,
            color: 0xffee51,
            fields: [
                {
                    name: "Mesajı Gönderen",
                    value: `\`\`\`${message.author.tag}\`\`\``,
                },
                {
                    name: "Mesajı Gönderenin ID",
                    value: `\`\`\`${message.author.id}\`\`\``,
                },
                {
                    name: `Gönderilen Mesaj`,
                    value: `\`\`\`${message.content}\`\`\``
                },
            ],
            thumbnail: {
                url: message.author.avatarURL()
            }

        }

        let channel = client.channels.cache.get("")
        if (message.content?.slice(1)) return channel.send({ embeds: [embed] });
        else return;
    }

    const userData = await userModel.findOne({ id: message.author.id });
    if (!userData) await userModel({ id: message.author.id }).save().catch((e) => null);

    if (userData?.afk?.status) {
        userData.afk.status = false;
        userData.afk.reason = null;
        await userData.save().catch((e) => null);
        message.channel.send({ content: `\`💤\` ${message.member}, afk modundan çıktınız.` })
            .then(msg => setTimeout(() => msg.delete().catch((e) => error(e)), 5000))
    }

    const mentionUser = message.mentions.users.first();
    if (mentionUser) {
        const mentionUserData = await userModel.findOne({ id: mentionUser.id });
        if (mentionUserData?.afk?.status) {
            message.channel.send({ content: `\`💤\` ${message.member}, etiketlediğin kullanıcı şu anda \`${mentionUserData.afk.reason}\` sebebiyle afk!` })
                .then(msg => setTimeout(() => msg.delete().catch((e) => error(e)), 5000))
        }
    }

    if (message.content.length >= 5) {
        const date = new Date().toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
        const id = Math.random().toString(36).substring(2, 15) + `${Date.now()}` + Math.random().toString(36).substring(5, 9);
        let userStatMessageData = await userStatMessageModel.findOne({ id: message.author.id });
        if (!userStatMessageData) userStatMessageData = await userStatMessageModel({ id: message.author.id }).save().catch((e) => null);

        let messagesDatas = userStatMessageData?.messages || [];

        const data = messagesDatas?.find(f => f.channelId == message.channelId && f.date == date) || null
        const channelId = data?.channelId || message.channelId;
        const count = (data?.count || 0) + 1;

        userStatMessageData.messages.push({ id, channelId, count, date })
        if (data) userStatMessageData.messages = userStatMessageData?.messages?.filter(f => f.id !== data?.id)

        await userStatMessageData.save().catch((e) => null);

        if (message.channel.id == config.coinChatId) {
            let _userData = await userModel.findOne({ id: message.author.id });
            if (!_userData) _userData = await userModel({ id: message.author.id }).save().catch((e) => null);
            _userData._coin = (_userData._coin || 0) + config.chatCoin;
            await _userData.save().catch((e) => null);
        }

        const messagesInChannelData = await userStatMessageModel.find({ "messages.channelId": message.channel.id });
        const messages = messagesInChannelData.map(m => m.messages.filter(f => f.channelId === message.channel.id))
            .flat().reduce((a, b) => a + b.count, 0);

        if (messages % config.sendingEventMessageCount == 0) {
            const eventButton = new ButtonBuilder().setCustomId("eventButton").setLabel("Kazan").setStyle(ButtonStyle.Primary).setEmoji("🎉");
            const eventRow = new ActionRowBuilder().addComponents(eventButton);

            const embed = {
                color: Colors.White,
                description: `\`🎉\` İlk Butona tıklayan ödülü kazanacaktır!`
            }

            const channel = client.channels.cache.get(config.coinChatId);
            let msg = channel.send({ embeds: [embed], components: [eventRow] });

            setTimeout(async () => {
                if (msg) {
                    try {
                        const isThereEventButton = msg?.components[0]?.components?.find(f => f.customId == "eventButton");
                        if (isThereEventButton) msg?.edit({ components: [] }).catch((e) => error(e));
                    } catch (error) { }
                }
            }, 5000)
        }

    }

    if (!content.startsWith(config.prefix) || !content.slice(1)) return;

    const command = content.split(" ")[0].slice(1);
    const args = content.split(" ").slice(1);

    let commandFile = client['prefixCommands'].find(f => f.names?.includes(command))
    if (!commandFile) return message.reply({ content: "\`❓\` Yazmış olduğunuz komut sistemde bulunamadı.", ephemeral: true })

    if (commandFile.permission == "admins" && !config.admins?.includes(message.author.id))
        return message.reply({ content: "\`⚠️\` Bu komutu kullanmak için yetkiniz bulunmuyor.", ephemeral: true });

    if (commandFile.permission == "dependent") {
        const commandData = await commandModel.findOne({ names: commandFile.names });
        if (!commandData) return message.reply({ content: "\`❓\` Yazdığınız komut sistemde bulunamadı.", ephemeral: true });
        if (!commandData.available)
            return message.reply({ content: "\`⚠️\` Yazdığınız komut şuanda kullanıma kapalıdır." })
                .then(m => setTimeout(() => { if (m.deletable) m.delete() }, 3000))
                .catch(null);

        if (!commandData?.channels?.includes(message.channel.id))
            return message.reply({ content: "\`⚠️\` Yazdığınız komutun kullanılabilir kanallar listesinde bu kanal bulunmuyor." })
                .then(m => setTimeout(() => { if (m.deletable) m.delete() }, 3000))
                .catch(null);


        const availableUser = commandData.authorities.find(a => a.id == message.author.id) ? true : false;
        const availableRole = message.member._roles.filter(f => commandData.authorities.find(a => a.id == f)).length > 0 ? true : false;

        if (!availableUser && !availableRole)
            return message.reply({ content: "\`⚠️\` Yazdığınız komutu kullanabilmek için bu sunucuda daha üst yetkilere sahip olmanız gerekmektedir." })
                .then(m => setTimeout(() => { if (m.deletable) m.delete() }, 3000))
                .catch(null);
    }

    commandFile.help = `\`⚠️\` **Geçersiz işlem.** \n` +
        `\`❇️\` \`${config.prefix}${command} yardım\` komutunu kullanarak detaylı bilgi alabilirsiniz.`

    commandFile.run(client, commandFile, message, args).catch(async (err) => {
        try {
            let errData = error.stack.split('\n').slice(1).map(r => r.match(/\((?<file>.*):(?<line>\d+):(?<pos>\d+)\)/))[0]
            let errLine = errData ? errData.groups.line + ":" + errData.groups.pos : null

            let embed = {
                color: 0xff0000,
                description: `**BAZI SORUNLAR OLUŞTU!** \n\n` +
                    `**Hatanın konumu** :\n` +
                    `**"${command}"** Satır Numarası: **${errLine || "Bulunamadı"}**\n\n` +
                    `**Hata** :\n` +
                    `${error}`,
                footer: {
                    text: `Help: me@cihatksm.com`,
                }
            }

            return await message.reply({ embeds: [embed], ephemeral: true }).catch((e) => error(e))
        }
        catch (errr) { }
        finally { error(err) }
    })
});