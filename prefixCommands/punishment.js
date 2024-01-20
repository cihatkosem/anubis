const { Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { commandModel, userStatMutesModel, userStatJailsModel, userStatBansModel } = require("../models");
const config = require("../config");
const { error } = require("../functions");

module.exports = {
    id: 'punishment',
    names: ["ceza"],
    permission: 'dependent',
    description: 'Kullanıcıya ceza işlemleri için kullanılır.',
    run: async (client, command, message, args) => {
        const operation = args[0];//yetki, kaldır
        if (operation == 'yetki') {
            if (!config.admins.includes(message.author.id))
                return message.reply({ content: `\`❌\` Bu komutu kullanabilmek için gerekli yetkiye sahip değilsin.` });

            const operation = args[1];//ekle, sil, listele
            if (!operation) return message.reply({ content: `\`❓\` Bir işlem belirtmelisin.` });

            const punishment = args[2];//chatmute, voicemute, jail, ban
            if (!punishment && operation !== 'listele') return message.reply({ content: `\`❓\` Bir ceza türü belirtmelisin.` });

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[3]);
            const user = message.mentions.users.first() || message.guild.members.cache.get(args[3])?.user;
            if (!role && !user && operation !== 'listele') return message.reply({ content: `\`❓\` Bir rol veya kullanıcı belirtmelisin.` });

            const punishmentCMD = await commandModel.findOne({ id: 'punishment' });
            if (operation == 'ekle') {
                punishmentCMD.subAuthorites.push({
                    punishment,
                    type: role ? 'role' : user ? 'user' : null,
                    id: role ? role.id : user ? user.id : null
                })
                punishmentCMD.save().catch((e) => null);

                return message.reply({ content: `\`✅\` ${punishment} cezası için ${role ? `<@&${role.id}>` : user ? `<@${user.id}>` : null} ${role ? 'rolü' : user ? 'kullanıcısı' : null} başarıyla eklendi.` });
            }

            if (operation == 'sil') {
                punishmentCMD.subAuthorites = punishmentCMD.subAuthorites.filter(f => f.id !== (role ? role.id : user ? user.id : null));
                punishmentCMD.save().catch((e) => null);

                return message.reply({ content: `\`✅\` ${punishment} cezası için ${role ? `<@&${role.id}>` : user ? `<@${user.id}>` : null} ${role ? 'rolü' : user ? 'kullanıcısı' : null} başarıyla silindi.` });
            }

            if (operation == 'listele') {
                const punishments = punishmentCMD.subAuthorites.filter(f => f.punishment == punishment);
                if (!punishments.length) return message.reply({ content: `\`❌\` Herhangi bir veri bulunamadı.` });

                const embed = {
                    color: Colors.White,
                    description: punishments.map(m => `${m.type == 'role' ? `<@&${m.id}>` : m.type == 'user' ? `<@${m.id}>` : null}`).join('\n')
                }

                return message.reply({ embeds: [embed] });
            }
        }

        if (operation == 'kaldır') {
            const user = message.mentions.users.first() || client.users.cache.get(args[1]) || null;
            const member = message.guild.members.cache.get(user?.id) || null;

            if (!user) return message.reply({ content: `\`❓\` Bir kullanıcı belirtmelisin.` });
            if (user.id == message.author.id) return message.reply({ content: `\`❓\` Kendine ceza işlemi uygulayamazsın.` });

            if (member) {
                const memberRoles = member.roles.cache.map(m => m).sort((a, b) => b.rawPosition - a.rawPosition)
                    .filter(f => !config.punishmentOtherRoles.includes(f.id));
                const adminRoles = message.member.roles.cache.map(m => m).sort((a, b) => b.rawPosition - a.rawPosition)
                    .filter(f => !config.punishmentOtherRoles.includes(f.id));

                if (adminRoles[0].rawPosition <= memberRoles[0].rawPosition)
                    return message.reply({ content: `\`❌\` Bu kullanıcı senden üst/aynı pozisyonda.` });
            }

            let userStatMuteData = await userStatMutesModel.findOne({ id: user.id });
            let userStatJailData = await userStatJailsModel.findOne({ id: user.id });
            let userStatBanData = await userStatBansModel.findOne({ id: user.id });

            if (userStatMuteData.mutes.length + userStatJailData.jails.length + userStatBanData.bans.length == 0)
                return message.reply({ content: `\`❌\` Bu kullanıcının herhangi bir cezası bulunmuyor.` });

            const punishmentCMD = await commandModel.findOne({ id: 'punishment' });
            const ChatMutes = userStatMuteData?.mutes?.filter(f => f?.type == 'chat_mute' && f?.validity == true)?.sort((a, b) => Number(b?.endDate) - Number(a?.endDate))[0];
            const VoiceMutes = userStatMuteData?.mutes?.filter(f => f?.type == 'voice_mute' && f?.validity == true)?.sort((a, b) => Number(b?.endDate) - Number(a?.endDate))[0];
            const Jails = userStatJailData?.jails?.filter(f => f?.validity == true)?.sort((a, b) => Number(b?.endDate) - Number(a?.endDate))[0];
            const validityBans = userStatBanData?.bans?.filter(f => f.validity == true)[0];

            let ChatMuteButton = new ButtonBuilder()
                .setCustomId(`unpunishment-user-chat_mute-${user.id}`).setStyle(ButtonStyle.Success).setLabel('💭 Chat Mute')

            let VoiceMuteButton = new ButtonBuilder()
                .setCustomId(`unpunishment-user-voice_mute-${user.id}`).setStyle(ButtonStyle.Success).setLabel('🔉 Voice Mute')

            let JailButton = new ButtonBuilder()
                .setCustomId(`unpunishment-user-jail-${user.id}`).setStyle(ButtonStyle.Success).setLabel('🟠 Jail')

            let BanButton = new ButtonBuilder()
                .setCustomId(`unpunishment-user-ban-${user.id}`).setStyle(ButtonStyle.Success).setLabel('🔴 Ban')

            if (!ChatMutes || ChatMutes.length == 0) ChatMuteButton = ChatMuteButton.setDisabled(true);
            if (!VoiceMutes || VoiceMutes.length == 0) VoiceMuteButton = VoiceMuteButton.setDisabled(true);
            if (!Jails || Jails.length == 0) JailButton = JailButton.setDisabled(true);
            if (!validityBans || validityBans.length == 0) BanButton = BanButton.setDisabled(true);

            const subAuth = punishmentCMD.subAuthorites;
            const chatMuteAdmins = subAuth.filter(f => f.punishment == 'chatmute');
            const voiceMuteAdmins = subAuth.filter(f => f.punishment == 'voicemute');
            const jailAdmins = subAuth.filter(f => f.punishment == 'jail');
            const banAdmins = subAuth.filter(f => f.punishment == 'ban');

            if (chatMuteAdmins.length == 0) ChatMuteButton = ChatMuteButton.setDisabled(true);
            if (voiceMuteAdmins.length == 0) VoiceMuteButton = VoiceMuteButton.setDisabled(true);
            if (jailAdmins.length == 0) JailButton = JailButton.setDisabled(true);
            if (banAdmins.length == 0) BanButton = BanButton.setDisabled(true);

            if (!chatMuteAdmins.find(f => f.id == message.author.id) && chatMuteAdmins.filter(f => message.member._roles.includes(f.id)) == 0)
                ChatMuteButton = ChatMuteButton.setDisabled(true);

            if (!voiceMuteAdmins.find(f => f.id == message.author.id) && voiceMuteAdmins.filter(f => message.member._roles.includes(f.id)) == 0)
                VoiceMuteButton = VoiceMuteButton.setDisabled(true);

            if (!jailAdmins.find(f => f.id == message.author.id) && jailAdmins.filter(f => message.member._roles.includes(f.id)) == 0)
                JailButton = JailButton.setDisabled(true);

            if (!banAdmins.find(f => f.id == message.author.id) && banAdmins.filter(f => message.member._roles.includes(f.id)) == 0)
                BanButton = BanButton.setDisabled(true);

            const actionRow = new ActionRowBuilder().addComponents(ChatMuteButton, VoiceMuteButton, JailButton, BanButton);

            const embed = {
                color: Colors.White,
                description:
                    `<@${user.id}> \`${user.id}\` kullanıcısına ceza işlemi uygulanacaktır. \n\n` +
                    `\`➡️\` Kaldırılmasını istediğiniz ceza türünü seçiniz. \n` +
                    `\`❇️\` Bu işlemi gerçekleştirmezseniz <t:${Math.floor(Date.now() / 1000) + 31}:R> işlem iptal edilecektir.`,
                footer: { text: `${message.author.tag} tarafından ceza işlemi uygulanacak.` },
            }

            let msg = await message.reply({ embeds: [embed], components: [actionRow] }).catch((e) => error(e));

            return setTimeout(() => {
                if (!msg) return;
                const buttons = msg.components[0]?.components?.filter(f => f.data.custom_id.includes('punishment-user')).length == 4;
                if (buttons) {
                    embed.description = `\`❌\` Bu işlemi gerçekleştirmek için süreniz doldu.`;
                    embed.footer = { text: `${message.author.tag} tarafından ceza işlemi uygulanacaktı.` };
                    return msg?.edit({ embeds: [embed], components: [] }).catch((e) => error(e));
                }
            }, 30000);
        }

        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || null;
        const member = message.guild.members.cache.get(user?.id) || null;
        
        let userStatMuteData = await userStatMutesModel.findOne({ id: user?.id });
        let userStatJailData = await userStatJailsModel.findOne({ id: user?.id });
        let userStatBanData = await userStatBansModel.findOne({ id: user?.id });

        if (!userStatMuteData) userStatMuteData = await userStatMutesModel({ id: user?.id }).save().catch((e) => null);
        if (!userStatJailData) userStatJailData = await userStatJailsModel({ id: user?.id }).save().catch((e) => null);
        if (!userStatBanData) userStatBanData = await userStatBansModel({ id: user?.id }).save().catch((e) => null);

        if (!user) return message.reply({ content: `\`❓\` Bir kullanıcı belirtmelisin.` });
        if (user.id == message.author.id) return message.reply({ content: `\`❓\` Kendine ceza işlemi uygulayamazsın.` });

        if (member) {
            const memberRoles = member.roles.cache.map(m => m).sort((a, b) => b.rawPosition - a.rawPosition)
                .filter(f => !config.punishmentOtherRoles.includes(f.id));
            const adminRoles = message.member.roles.cache.map(m => m).sort((a, b) => b.rawPosition - a.rawPosition)
                .filter(f => !config.punishmentOtherRoles.includes(f.id));

            if (adminRoles[0].rawPosition <= memberRoles[0].rawPosition)
                return message.reply({ content: `\`❌\` Bu kullanıcı senden üst/aynı pozisyonda.` });
        }

        const punishmentCMD = await commandModel.findOne({ id: 'punishment' });
        const lastChatMute = userStatMuteData?.mutes?.filter(f => f.type == 'chat_mute' && f.validity == true)?.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
        const lastVoiceMute = userStatMuteData?.mutes?.filter(f => f.type == 'voice_mute' && f.validity == true)?.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
        const lastJail = userStatJailData?.jails?.filter(f => f.validity == true)?.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
        const validityBan = userStatBanData?.bans?.filter(f => f.validity == true)[0];

        //.setEmoji('123456789012345678');
        //.setEmoji('🔴');
        let ChatMuteButton = new ButtonBuilder()
            .setCustomId(`punishment-user-chat_mute-${user.id}`).setStyle(ButtonStyle.Success).setLabel('💭 Chat Mute')

        let VoiceMuteButton = new ButtonBuilder()
            .setCustomId(`punishment-user-voice_mute-${user.id}`).setStyle(ButtonStyle.Success).setLabel('🔉 Voice Mute')

        let JailButton = new ButtonBuilder()
            .setCustomId(`punishment-user-jail-${user.id}`).setStyle(ButtonStyle.Success).setLabel('🟠 Jail')

        let BanButton = new ButtonBuilder()
            .setCustomId(`punishment-user-ban-${user.id}`).setStyle(ButtonStyle.Success).setLabel('🔴 Ban')

        if (lastChatMute && Number(lastChatMute.endDate) > Date.now()) ChatMuteButton = ChatMuteButton.setDisabled(true);
        if (lastVoiceMute && Number(lastVoiceMute.endDate) > Date.now()) VoiceMuteButton = VoiceMuteButton.setDisabled(true);
        if (lastJail && Number(lastJail.endDate) > Date.now()) JailButton = JailButton.setDisabled(true);
        if (validityBan) BanButton = BanButton.setDisabled(true);

        const subAuth = punishmentCMD.subAuthorites;
        const chatMuteAdmins = subAuth.filter(f => f.punishment == 'chatmute');
        const voiceMuteAdmins = subAuth.filter(f => f.punishment == 'voicemute');
        const jailAdmins = subAuth.filter(f => f.punishment == 'jail');
        const banAdmins = subAuth.filter(f => f.punishment == 'ban');

        if (chatMuteAdmins.length == 0) ChatMuteButton = ChatMuteButton.setDisabled(true);
        if (voiceMuteAdmins.length == 0) VoiceMuteButton = VoiceMuteButton.setDisabled(true);
        if (jailAdmins.length == 0) JailButton = JailButton.setDisabled(true);
        if (banAdmins.length == 0) BanButton = BanButton.setDisabled(true);

        if (!chatMuteAdmins.find(f => f.id == message.author.id) && chatMuteAdmins.filter(f => message.member._roles.includes(f.id)) == 0)
            ChatMuteButton = ChatMuteButton.setDisabled(true);

        if (!voiceMuteAdmins.find(f => f.id == message.author.id) && voiceMuteAdmins.filter(f => message.member._roles.includes(f.id)) == 0)
            VoiceMuteButton = VoiceMuteButton.setDisabled(true);

        if (!jailAdmins.find(f => f.id == message.author.id) && jailAdmins.filter(f => message.member._roles.includes(f.id)) == 0)
            JailButton = JailButton.setDisabled(true);

        if (!banAdmins.find(f => f.id == message.author.id) && banAdmins.filter(f => message.member._roles.includes(f.id)) == 0)
            BanButton = BanButton.setDisabled(true);

        const actionRow = new ActionRowBuilder().addComponents(ChatMuteButton, VoiceMuteButton, JailButton, BanButton);

        const embed = {
            color: Colors.White,
            description:
                `<@${user.id}> \`${user.id}\` kullanıcısına ceza işlemi uygulanacaktır. \n\n` +
                `\`💭\` **Chat Mute:** Kullanıcıyı sohbet kanallarında susturur. \n` +
                `\`🔉\` **Voice Mute:** Kullanıcıyı sesli kanallarda susturur. \n` +
                `\`🟠\` **Jail:** Kullanıcıyı cezalıya atar. \n` +
                `\`🔴\` **Ban:** Kullanıcıyı sunucudan yasaklar.\n\n` +
                `\`❇️\` Bu işlemi gerçekleştirmezseniz <t:${Math.floor(Date.now() / 1000) + 31}:R> işlem iptal edilecektir.`,
            footer: { text: `${message.author.tag} tarafından ceza işlemi uygulanacak.` },
        }

        let msg = await message.reply({ embeds: [embed], components: [actionRow] }).catch((e) => error(e));

        return setTimeout(() => {
            if (!msg) return;
            const buttons = msg.components[0]?.components?.filter(f => f.data.custom_id.includes('punishment-user')).length == 4;
            if (buttons) {
                embed.description = `\`❌\` Bu işlemi gerçekleştirmek için süreniz doldu.`;
                embed.footer = { text: `${message.author.tag} tarafından ceza işlemi uygulanacaktı.` };
                return msg?.edit({ embeds: [embed], components: [] }).catch((e) => error(e));
            }
        }, 30000);
    }
}