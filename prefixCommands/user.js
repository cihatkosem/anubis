const { Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { userModel, inviteModel, userStatMessageModel, userStatVoiceModel, userStatInviteModel, userStatStaffedUsersModel, userStatRegisteredUsersModel, userStatChancedNamesModel, userStatMutesModel, userStatBansModel, userStatJailsModel } = require("../models");
const config = require("../config");
const { authorities, responsibilities } = require("../staffs");
const { dayjs, error } = require("../functions");
const { dateToNumber } = require("../functions/dayjs");

module.exports = {
    id: 'user',
    names: ["kullanıcı", "k", "me", "bakiye", "yetki", "yetkililerim"],
    permission: 'dependent',
    description: 'Kullanıcı bilgilerini gösterir.',
    run: async (client, command, message, args) => {
        const usedCommand = message.content.split(' ')[0].slice(1).toLowerCase();
        const operations = [
            "yardım", "genel", "davetlerim", "davet", "isimler", "kayıtlar", "cezalarım", "cezalar", //kullanıcı işlemleri
            "gönder", "yardım"//bakiye işlemler
        ];
        const operation = operations.includes(args[0]) ? args[0] : "genel";
        const user = message.mentions.users.first() || message.guild.members.cache.get(args.filter(f => f !== operation)[0])?.user || message.author;
        const member = message.guild.members.cache.get(user.id) || null;

        if (!user) return message.reply({ content: `\`⚠️\` Kullanıcı bulunamadı.` });

        let userData = await userModel.findOne({ id: user.id });

        let inviteData = await inviteModel.findOne({ usesUsers: { $elemMatch: { id: user.id } } });
        let memberInvites = await inviteModel.find({ inviterId: user.id });

        if (!userData) userData = await userModel({ id: user.id }).save().catch((e) => null);

        if (usedCommand == 'me' && user.id !== message.author.id)
            return message.reply({ content: `\`⚠️\` \`${config.prefix}me\` komutu ile kendinize ait olmayan bilgileri göremezsiniz.` });

        if (usedCommand == 'yetkililerim') {
            if (user.id !== message.author.id)
                return message.reply({ content: `\`⚠️\` \`${config.prefix}yetkililerim\` komutu ile kendinize ait olmayan bilgileri göremezsiniz.` });

            const userStatStaffedUsersData = await userStatStaffedUsersModel.findOne({ id: user.id });

            if (userStatStaffedUsersData?.staffedUsers?.length == 0)
                return message.reply({ content: `\`⚠️\` Hiçbir kişiye yetki vermemişsiniz.` });

            const officersSize = 5;

            let backButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`my_officers-back-${user.id}`)
                .setLabel('⬅️')
                .setDisabled(true)

            let cancelButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setCustomId(`my_officers-cancel-${user.id}`)
                .setLabel('❎')

            let nextButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`my_officers-next-${user.id}-${officersSize}-${officersSize * 2}`)
                .setLabel('➡️')

            if (userStatStaffedUsersData?.staffedUsers?.length <= officersSize)
                nextButton.setDisabled(true)

            const actionRow = new ActionRowBuilder().addComponents(backButton, cancelButton, nextButton);

            let embed = {
                color: Colors.White,
                title: `Yetkililerim (0-${officersSize})`,
                description: userStatStaffedUsersData.staffedUsers.sort((a, b) => Number(b.date) - Number(a.date)).slice(0, officersSize).map((m, i) => {
                    let authorityRole = m.user?.authorityRoleId ? `<@&${m.user?.authorityRoleId}> yetkisi` : '';
                    let and = authorityRole && m.user?.responsibilityRoleId ? ' ve ' : '';
                    let responsibilityRole = m.user?.responsibilityRoleId ? `<@&${m.user?.responsibilityRoleId}> sorumluluğu` : '';
                    return `\`${i + 1}.\` <@${m.user.id}> kullanıcısına <t:${Math.floor(m.date / 1000)}:R>;\n\`➡️\` ${authorityRole}${and}${responsibilityRole} verilmiş.`
                }).join('\n\n')
            }

            return message.reply({ embeds: [embed], components: [actionRow] });
        }

        if (usedCommand == 'bakiye') {
            if (operation == 'yardım') {
                let embed = {
                    color: Colors.White,
                    title: 'Kullanıcı Yardım',
                    fields: [
                        { name: `\`➡️\` \`${config.prefix}bakiye\``, value: 'Bakiyenizi gösterir.' },
                        {
                            name: `\`➡️\` \`${config.prefix}bakiye gönder [doğrulanmış/doğrulanmamış] [miktar] [kullanıcı]\``,
                            value: 'Bakiyenizi belirttiğini kullanıcıya gönderir.'
                        },
                    ]
                }

                return message.reply({ embeds: [embed] });
            }

            if (operation == 'gönder') {
                const coinType = args[1] || 'x';
                if (!["doğrulanmış", "doğrulanmamış"].includes(coinType))
                    return message.reply({ content: `\`⚠️\` Lütfen geçerli bir para türü giriniz. \`doğrulanmış\` veya \`doğrulanmamış\`` });

                const isAmountNumber = !isNaN(Number(args[2]))
                const amount = Number(args[2]);
                if (!isAmountNumber) return message.reply({ content: `\`⚠️\` Lütfen geçerli bir miktar giriniz.` });
                if (amount <= 0) return message.reply({ content: `\`⚠️\` Lütfen geçerli bir miktar giriniz.` });

                const senderIsAdmin = config.admins.includes(message.author.id);
                let userData = await userModel.findOne({ id: message.author.id });
                if (!userData) userData = new userModel({ id: message.author.id.id }).save().catch((e) => null);
                if (!senderIsAdmin && amount > (userData?._coin || 0)) return message.reply({ content: `\`⚠️\` Bakiyeniz yetersiz.` });

                const sendingUser = message.mentions.users.first() || message.guild.members.cache.get(args[3])?.user || null;
                if (!sendingUser) return message.reply({ content: `\`⚠️\` Kullanıcı bulunamadı.` });
                if (!senderIsAdmin && sendingUser.id == message.author.id) return message.reply({ content: `\`⚠️\` Kendinize para gönderemezsiniz.` });

                let sendingUserData = await userModel.findOne({ id: sendingUser.id });
                if (!sendingUserData) sendingUserData = new userModel({ id: sendingUser.id }).save().catch((e) => null);

                const areYouSureButton = new ButtonBuilder().setLabel('Evet, Gönder').setStyle(ButtonStyle.Success).setEmoji('✅')
                    .setCustomId(`coin_sending_yes-${message.author.id}-${sendingUser.id}-${amount}-${coinType}`);
                const ActionRow = new ActionRowBuilder().addComponents(areYouSureButton);

                const embed = {
                    color: Colors.Green,
                    description:
                        `\`✅\` ${message.author} \`${message.author.id}\` kullanıcısı <@${sendingUser.id}> \`${sendingUser.id}\` kullanıcısına \`${coinType} ${amount} TL\` gönderilecek. \n\n` +
                        `\`💸\` Göndereceğiniz paradan **10%** komisyon alınacaktır. \n` +
                        `\`💸\` Komisyon tutarı: \`${amount / 100 * 10}\` \n` +
                        `\`💸\` Karşı tarafa gönderilecek para miktarı: \`${amount - (amount / 100 * 10)}\` \n\n` +
                        `\`❓\` Onaylıyor musunuz? (<t:${Math.floor(Date.now() / 1000) + 11}:R>) saniiye içinde onaylamazsanız işlem iptal edilecektir.`
                }

                return message.reply({ embeds: [embed], components: [ActionRow] }).then(async msg => {
                    setTimeout(() => {
                        if (!msg || !msg?.components[0]) return;
                        embed.description = `\`❌\` Para gönderim işlemi zaman aşımına uğradı.`;
                        const isThereAreYouSureButton = msg?.components[0]?.components?.find(f => f.customId.startsWith('coin_sending_yes'));
                        if (isThereAreYouSureButton) return msg.edit({ embeds: [embed], components: [] }).catch((e) => error(e));   
                    }, 10000);
                })
            }

            if (operation && !operations.includes(operation)) return message.reply({ content: command.help });

            const coin = Number((userData.coin || 0).toFixed(2));
            const _coin = Number((userData._coin || 0).toFixed(2));

            const embed = {
                color: Colors.White,
                title: 'Bakiye',
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL({ dynamic: true })
                },
                thumbnail: {
                    url: user.avatarURL({ dynamic: true })
                },
                description:
                    `\`💵\` Doğrulanmış Bakiyeniz: \`${coin} TL\` \n` +
                    `\`💴\` Doğrulanmamış Bakiyeniz: \`${_coin} TL\` \n\n` +
                    `\`❇️\` Bununla Ne Yapabilirim? \n` +
                    `\`➡️\` Arkadaşlarına para gönderebilirsin. \n` +
                    `\`➡️\` Sunucu içerisindeki marketten ürün satın alabilirsin. \n` +
                    `\`➡️\` Kumar oynayabilirsin.`

            }

            return message.reply({ embeds: [embed] });
        }

        if (usedCommand == 'yetki') {
            const staff = userData.staff.authority.roleId ? userData.staff : null;
            if (!staff) return message.reply({ content: `\`⚠️\` Bu kullanıcı yetkili değil.` });

            const streamStat = 'streamer-stat';
            const voiceStat = 'voice-stat';
            const chatStat = 'chat-stat';
            const inviteStat = 'invite-stat';
            const recruitmentStat = 'recruitment-stat';
            const registerStat = 'register-stat';

            let userStatVoiceData = await userStatVoiceModel.findOne({ id: message.author.id });
            if (!userStatVoiceData) userStatVoiceData = await userStatVoiceModel({ id: message.author.id }).save().catch((e) => null);

            let streamVoice = userStatVoiceData?.voices
                .filter(f => Date.now() < Number(staff.authority.date) + 1000 * 60 * 60 * 24 * 7)
                .filter(f => dateToNumber(f.date) > Number(staff.authority.date))
            if (config?.streamVoiceChannels?.length > 0)
                streamVoice = streamVoice.filter(f => config?.streamVoiceChannels?.includes(f.channelId))

            let voices = userStatVoiceData?.voices
                .filter(f => Date.now() < Number(staff.authority.date) + 1000 * 60 * 60 * 24 * 7)
                .filter(f => dateToNumber(f.date) > Number(staff.authority.date))

            if (config?.voiceChannels?.length > 0)
                voices = voices.filter(f => config?.publicVoiceChannels?.includes(f.channelId));

            let userStatMessageData = await userStatMessageModel.findOne({ id: user.id });
            if (!userStatMessageData) userStatMessageData = await userStatMessageModel({ id: user.id }).save().catch((e) => null);

            let messages = userStatMessageData?.messages
                .filter(f => Date.now() < Number(staff.authority.date) + 1000 * 60 * 60 * 24 * 7)
                .filter(f => dateToNumber(f.date) > Number(staff.authority.date))

            if (config?.chatTextChannels?.length > 0)
                messages = messages.filter(f => config?.chatTextChannels?.includes(f.channelId))

            let userStatInviteData = await userStatInviteModel.findOne({ id: user.id });
            if (!userStatInviteData) userStatInviteData = await userStatInviteModel({ id: user.id }).save().catch((e) => null);

            let invites = userStatInviteData?.invites
                .filter(f => Date.now() < Number(staff.authority.date) + 1000 * 60 * 60 * 24 * 7)
                .filter(f => Number(f.timestamp) > Number(staff.authority.date))

            let userStatStaffedUsersData = await userStatStaffedUsersModel.findOne({ id: user.id });
            if (!userStatStaffedUsersData) userStatStaffedUsersData = await userStatStaffedUsersModel({ id: user.id }).save().catch((e) => null);

            const staffedUsers = userStatStaffedUsersData?.staffedUsers
                .filter(f => Date.now() < Number(staff.authority.date) + 1000 * 60 * 60 * 24 * 7)
                .filter(f => Number(f.date) > Number(staff.authority.date))
                .filter(f => f?.user?.authorityRoleId)

            let userStatRegisteredUsersData = await userStatRegisteredUsersModel.findOne({ id: user.id });
            if (!userStatRegisteredUsersData) userStatRegisteredUsersData = await userStatRegisteredUsersModel({ id: user.id }).save().catch((e) => null);

            const registeredUsers = userStatRegisteredUsersData?.registeredUsers
                .filter(f => Date.now() < Number(staff.authority.date) + 1000 * 60 * 60 * 24 * 7)
                .filter(f => Number(f.date) > Number(staff.authority.date))

            const auth = authorities.find(m => m.roleId == staff.authority.roleId);
            const works = staff.responsibilities.map(m => {
                const work = responsibilities.find(f => f.roleId == m.roleId);
                if (!work) return { roleId: m.roleId, musts: [] };
                let musts = []
                try {
                    auth[work.type]?.map(mm => {
                        const name = mm.id.split('-').map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' ');
                        if (mm.id == streamStat) {
                            const currentValue = streamVoice?.reduce((a, b) => a + b.timespand, 0) || 0;
                            musts.push({ id: mm.id, name, minValue: mm.value, currentValue });
                        }
                        if (mm.id == voiceStat) {
                            const currentValue = voices?.reduce((a, b) => a + b.timespand, 0) || 0;
                            musts.push({ id: mm.id, name, minValue: mm.value, currentValue });
                        }
                        if (mm.id == chatStat) {
                            const currentValue = messages?.reduce((a, b) => a + b.count, 0) || 0;
                            musts.push({ id: mm.id, name, minValue: mm.value, currentValue });
                        }
                        if (mm.id == registerStat) {
                            const currentValue = registeredUsers?.length || 0;
                            musts.push({ id: mm.id, name, minValue: mm.value, currentValue });
                        }
                        if (mm.id == recruitmentStat) {
                            const currentValue = staffedUsers?.length || 0;
                            musts.push({ id: mm.id, name, minValue: mm.value, currentValue });
                        }
                        if (mm.id == inviteStat) {
                            const currentValue = invites?.length || 0;
                            musts.push({ id: mm.id, name, minValue: mm.value, currentValue });
                        }
                    })
                } catch (error) { }
                return { roleId: m.roleId, musts };
            });

            const time = (ms) => {
                const seconds = Math.floor(ms / 1000) % 60;
                const minutes = Math.floor(ms / (1000 * 60)) % 60;
                const hours = Math.floor(ms / (1000 * 60 * 60));

                const hour = hours > 0 ? `${hours} saat` : null;
                const minute = minutes > 0 ? `${minutes} dakika` : null;
                const second = seconds > 0 ? `${seconds} saniye` : null;

                if (!hour && !minute && !second) return '0 saniye';
                if (hour && minute) return [hour, minute].filter(f => f).join(', ');
                return [hour, minute, second].filter(f => f).join(', ');
            }

            const musts = (workRoleId) => works.find(f => f.roleId == workRoleId)?.musts || [];

            const embed = {
                color: Colors.White,
                title: 'Yetki Bilgileri',
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL({ dynamic: true }),
                },
                thumbnail: {
                    url: user.avatarURL({ dynamic: true }),
                },
                description:
                    `\`🔰\` Yetki: <@&${staff.authority.roleId}> (<t:${Math.floor(Number(staff.authority.date) / 1000)}:R>)\n\n` +
                    staff.responsibilities
                        .map((r, i) =>
                            `\`${i + 1}.\` Sorumluluk: <@&${r.roleId}> (<t:${Math.floor(Number(r.date) / 1000)}:R>) \n` +
                            musts(r.roleId)
                                .map((m, ii) => {
                                    if (m.id == voiceStat || m.id == streamStat)
                                        return `\`➡️ ${ii + 1}.\` ${m.name} Görevi: \`${time(m.currentValue)}/${time(m.minValue * 1000)}\``
                                    else
                                        return `\`➡️ ${ii + 1}.\` ${m.name} Görevi: \`${m.currentValue}/${m.minValue} Adet\``
                                }).join('\n')
                        )
                        .join('\n')
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'yardım') {
            let embed = {
                color: Colors.White,
                title: 'Kullanıcı Yardım',
                fields: [
                    { name: `\`➡️\` \`${config.prefix}kullanıcı\``, value: 'Kullanıcı bilgilerini gösterir.' },
                    { name: `\`➡️\` \`${config.prefix}kullanıcı isimler\``, value: 'Kullanıcının isimlerini gösterir.' },
                    { name: `\`➡️\` \`${config.prefix}kullanıcı kayıtlar\``, value: 'Kullanıcının kayıtlarını gösterir.' },
                    { name: `\`➡️\` \`${config.prefix}kullanıcı davetlerim\``, value: 'Kullanıcının davetlerini gösterir.' },
                    { name: `\`➡️\` \`${config.prefix}kullanıcı davet [davet-kodu]\``, value: 'Kullanıcının davet bilgilerini gösterir.' }
                ]
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'genel') {
            const texts = {
                inviter: 'Davet Eden: ' + (inviteData?.inviterId ? `<@${inviteData.inviterId}>` : '\`Bulunamadı\`'),
                code: 'Davet Kodu: ' + (inviteData?.code ? `[${inviteData.code}](http://discord.gg/${inviteData.code})` : '\`Bulunamadı\`'),
            }

            const customStatus = member.presence?.activities?.find(f => f.type == 4);
            const status = member.presence?.status?.replace('idle', 'Boşta').replace('dnd', 'Rahatsız Etmeyin').replace('online', 'Çevrimiçi').replace('offline', 'Çevrimdışı') || 'Çevrimdışı';
            const embed = {
                color: Colors.White,
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL({ dynamic: true }),
                },
                thumbnail: {
                    url: user.avatarURL({ dynamic: true }),
                },
                fields: [
                    {
                        name: '\`➡️\` Kullanıcı Bilgileri',
                        value:
                            `\`❇️\` Kimlik: \`${user.id}\` \n` +
                            `\`❇️\` Durum: \`${status}\` \n` +
                            `\`❇️\` Durum Mesajı: \`${customStatus ? customStatus.state : 'Yok'}\` \n` +
                            `\`❇️\` Cihazları: ${member.presence?.clientStatus ? Object.keys(member.presence?.clientStatus).map(m => '\`' + m.replace('mobile', 'Mobil').replace('desktop', 'Bilgisayar').replace('web', 'Web') + '\`').join(', ') : 'Yok'} \n` +
                            `\`❇️\` Hesap Oluşturma: <t:${Math.floor(Number(user.createdTimestamp) / 1000)}:R>`
                    },
                    {
                        name: '\`➡️\` Davet Bilgileri',
                        value:
                            `\`❇️\` ${texts.inviter} \n` +
                            `\`❇️\` ${texts.code}`
                    },
                    {
                        name: '\`➡️\` Üyelik Bilgileri',
                        value:
                            `\`❇️\` Sunucudaki adı: \`${member.displayName}\` \n` +
                            `\`❇️\` Katılım Tarihi: <t:${Math.floor(Number(member.joinedTimestamp) / 1000)}:R> \n` +
                            `\`❇️\` Kayıt Tarihi: ${userData?.register?.date ? `<t:${Math.floor(Number(userData?.register?.date) / 1000)}:R>` : '\`Bilinmiyor\`'} \n` +
                            `\`❇️\` Kayıt Eden Yetkili: ${userData?.register?.executorId ? `<@${userData.register.executorId}>` : '\`Bilinmiyor\`'} \n` +
                            `\`❇️\` Cinsiyeti: \`${userData?.register?.gender ? userData?.register?.gender == 'man' ? 'Erkek' : 'Kadın' :
                                config.registeredManRoles.filter(f => member._roles.find(r => r == f)).length > 0 ? 'Erkek' :
                                    config.registeredWomanRoles.filter(f => member._roles.find(r => r == f)).length > 0 ? 'Kadın' : 'Bilinmiyor'
                            }\` \n` +
                            `\`❇️\` Roller: ${member._roles.map(m => `<@&${m}>`).join(', ')}`
                    }
                ],
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'davetlerim') {
            const embed = {
                color: Colors.White,
                title: `${user.tag} davetleri`,
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL({ dynamic: true }),
                },
                thumbnail: {
                    url: user.avatarURL({ dynamic: true }),
                },
                fields: memberInvites.length > 0 ? memberInvites.map((m, i) => {
                    let membersLength = m.usesUsers.filter(f => !f.left).length;
                    let leftMembersLength = m.usesUsers.filter(f => f.left).length;
                    return {
                        name: `\`${i + 1}.\` ${m.code} daveti:`,
                        value: `\`⏲️\` <t:${Math.floor(Number(m.createdTimestamp) / 1000)}:R> oluşturuldu. \n` +
                            `\`❇️\` \`${m.usesUsers.length}\` kez kullanıldı. \n` +
                            (membersLength > 0 ? `\`➡️\` ${membersLength} kişi sunucuda. \n` : '') +
                            (leftMembersLength > 0 ? `\`⬅️\` ${leftMembersLength} kişi sunucudan ayrıldı.` : '')
                    }
                }) : [{ name: 'Davet bulunamadı.', value: 'Bu kullanıcının davetleri bulunamadı.' }]
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'davet') {
            const inviteCode = message.content.split('davet')[1].slice(1).split(' ')[0];
            if (!inviteCode) return message.reply({ content: '\`⚠️\` Lütfen bir davet kodu giriniz.' });
            const invite = await inviteModel.findOne({ code: inviteCode });
            if (!invite) return message.reply({ content: '\`❓\` Bu davet kodu bulunamadı.' });

            let embed = {
                color: Colors.White,
                title: `${invite.code} daveti`,
                fields: [
                    {
                        name: '\`➡️\` Davet Bilgileri',
                        value: `\`⏲️\` <t:${Math.floor(Number(invite.createdTimestamp) / 1000)}:R> oluşturuldu. \n` +
                            `\`❇️\` \`${invite.usesUsers.length}\` kez kullanıldı. \n` +
                            `\`❇️\` \`${invite.usesUsers.filter(f => !f.left).length}\` kişi sunucuda. \n` +
                            `\`❇️\` \`${invite.usesUsers.filter(f => f.left).length}\` kişi sunucudan ayrıldı.`
                    }
                ]
            }

            if (invite.usesUsers.filter(f => !f.left).length > 0) {
                const value = invite.usesUsers.filter(f => !f.left).map((m) => `<@${m.id}>`).join(', ')
                embed.fields.push({ name: '\`➡️\` Sunucuda olanlar', value })
            }

            if (invite.usesUsers.filter(f => f.left).length > 0) {
                const value = invite.usesUsers.filter(f => f.left).map((m) => `<@${m.id}>`).join(', ')
                embed.fields.push({ name: '\`➡️\` Sunucudan ayrılanlar', value })
            }


            return message.reply({ embeds: [embed] });
        }

        if (operation == 'isimler') {
            const userStatChangedNamesData = await userStatChancedNamesModel.findOne({ id: user.id });
            const chancedNames = userStatChangedNamesData.chancedNames;
            if (!chancedNames || chancedNames.length <= 0) return message.reply({ content: '\`❓\` Bu kullanıcının isimleri bulunamadı.' });

            const embed = {
                color: Colors.White,
                title: `${user.tag} isimleri`,
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL({ dynamic: true }),
                },
                thumbnail: {
                    url: user.avatarURL({ dynamic: true }),
                },
                description: chancedNames.map((m, i) =>
                    `\`${i + 1}.\` <t:${Math.floor(Number(m?.date) / 1000)}:R> \`|\` \`${m?.old}\` \`⇾\` \`${m?.new}\` \`|\` <@${m?.executorId}>`
                ).join('\n')
            }

            return message.reply({ embeds: [embed] });
        }

        if (operation == 'kayıtlar') {
            const userStatRegisteredUsersData = await userStatRegisteredUsersModel.findOne({ id: user.id });
            const registeredUsers = userStatRegisteredUsersData.registeredUsers;
            if (!registeredUsers || registeredUsers.length <= 0)
                return message.reply({ content: '\`❓\` Bu kullanıcının kayıtları bulunamadı.' });

            const listingUsersButton = new ButtonBuilder()
                .setCustomId(`registered-stat-list-${user.id}`)
                .setLabel('💁 Kullanıcıları Listele')
                .setStyle(ButtonStyle.Success);

            const actionRow = new ActionRowBuilder().addComponents(listingUsersButton);

            const embed = {
                color: Colors.White,
                title: `${user.tag} kayıtları`,
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL({ dynamic: true }),
                },
                thumbnail: {
                    url: user.avatarURL({ dynamic: true }),
                },
                description:
                    `\`❇️\` Toplam kayıt: \`${registeredUsers.length}\` \n` +
                    `\`❇️\` Toplam erkek kayıt: \`${registeredUsers.filter(f => f.gender == 'man').length}\` \n` +
                    `\`❇️\` Toplam kadın kayıt: \`${registeredUsers.filter(f => f.gender == 'woman').length}\``
            }

            return message.reply({ embeds: [embed], components: [actionRow] });
        }

        if (operation == 'cezalarım') {
            const userStatMutesData = await userStatMutesModel.findOne({ id: user.id });
            const userStatJailsData = await userStatJailsModel.findOne({ id: user.id });
            const userStatBansData = await userStatBansModel.findOne({ id: user.id });

            const punishments = [
                ...(userStatMutesData?.mutes || []), ,
                ...(userStatJailsData?.bans?.map(m => ({ type: 'ban', ...m })) || []),
                ...(userStatBansData?.jails?.map(m => ({ type: 'jail', ...m })) || [])
            ].sort((a, b) => Number(b.date) - Number(a.date));

            if (!punishments || punishments.length <= 0)
                return message.reply({ content: '\`❓\` Bu kişinin sicili temiz.' });

            let allPunishments = new ButtonBuilder().setLabel('Tüm Cezaları Göster').setStyle(ButtonStyle.Primary)
                .setCustomId(`me_punishments-see_user-${user.id}`)
            let ActionRow = new ActionRowBuilder().addComponents(allPunishments)

            const embed = {
                color: Colors.White,
                title: `${user.tag} cezaları`,
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL({ dynamic: true }),
                },
                thumbnail: {
                    url: user.avatarURL({ dynamic: true }),
                },
                description:
                    `\`❇️\` Toplam ceza: \`${punishments.length}\` \n` +
                    `\`❇️\` Toplam chat mute: \`${punishments.filter(f => f.type == 'chat_mute').length}\` \n` +
                    `\`❇️\` Toplam voice mute: \`${punishments.filter(f => f.type == 'voice_mute').length}\` \n` +
                    `\`❇️\` Toplam ban: \`${punishments.filter(f => f.type == 'ban').length}\` \n` +
                    `\`❇️\` Toplam jail: \`${punishments.filter(f => f.type == 'jail').length}\``
            }

            return message.reply({ embeds: [embed], components: [ActionRow] });
        }

        if (operation == 'cezalar') {
            let mutedUsers = await userStatMutesModel.find({ 'mutes.executorId': user.id });
            let jailedUsers = await userStatJailsModel.find({ 'jails.executorId': user.id });
            let banedUsers = await userStatBansModel.find({ 'bans.executorId': user.id });

            let muteds = [], jaileds = [], baneds = [];
            for (userData of mutedUsers)
                muteds = [...muteds, ...userData?.mutes?.filter(x => x.executorId === user.id)?.map(m => ({ ...m, id: userData.id }))]

            for (userData of jailedUsers)
                jaileds = [...jaileds, ...userData?.jails?.filter(x => x.executorId === user.id)?.map(m => ({ ...m, id: userData.id, type: "jail" }))]

            for (userData of banedUsers)
                baneds = [...baneds, ...userData?.bans?.filter(x => x.executorId === user.id)?.map(m => ({ ...m, id: userData.id, type: "ban" }))]

            const işlemler = [...muteds, ...jaileds, ...baneds].sort((a, b) => Number(b.date) - Number(a.date))

            if (!işlemler || işlemler.length <= 0)
                return message.reply({ content: '\`❓\` Bu kişi hiç ceza vermemiş.' });

            let allPunishments = new ButtonBuilder().setLabel('Uyguladığı Tüm Cezalar').setStyle(ButtonStyle.Primary)
                .setCustomId(`punishments-see_user-${user.id}`)

            let ActionRow = new ActionRowBuilder().addComponents(allPunishments)

            const embed = {
                color: Colors.White,
                title: `${user.tag} uyguladığı cezalar`,
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL({ dynamic: true }),
                },
                thumbnail: {
                    url: user.avatarURL({ dynamic: true }),
                },
                description:
                    `\`❇️\` Toplam ceza: \`${işlemler.length}\` \n` +
                    `\`❇️\` Toplam chat mute: \`${işlemler.filter(f => f.type == 'chat_mute').length}\` \n` +
                    `\`❇️\` Toplam voice mute: \`${işlemler.filter(f => f.type == 'voice_mute').length}\` \n` +
                    `\`❇️\` Toplam ban: \`${işlemler.filter(f => f.type == 'ban').length}\` \n` +
                    `\`❇️\` Toplam jail: \`${işlemler.filter(f => f.type == 'jail').length}\``
            }

            return message.reply({ embeds: [embed], components: [ActionRow] });
        }

        return message.reply({ content: command.help });
    }
}