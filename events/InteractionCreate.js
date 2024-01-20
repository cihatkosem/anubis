const config = require("../config");
const { client, CustomEvents } = require("../server");
const { channelModel, roleModel, logModel, rollbackModel, userModel, commandModel, marketModel, userStatTagModel, userStatRegisteredUsersModel, userStatBansModel, userStatStaffedUsersModel, userStatMutesModel, userStatJailsModel, userStatChancedNamesModel } = require('../models');
const { InteractionType, Events, Colors, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { responsibilities, authorities } = require("../staffs");
const { error } = require("../functions");

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction) return;
    interaction.member = interaction.guild.members.cache.get(interaction.user.id)

    if (interaction.isButton()) {
        if (interaction.customId.startsWith('delete-otherbackup')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: 'Bu işlem sizin için değildir!', ephemeral: true });

            const backupId = interaction.customId.split('-')[2];
            const channelsDatas = await channelModel.find();
            const rolesDatas = await roleModel.find();

            const oldBackups = [
                ...channelsDatas.filter(f => f.backup.id !== backupId).map(m => m.backup.id),
                ...rolesDatas.filter(f => f.backup.id !== backupId).map(m => m.backup.id)
            ]

            interaction.message.edit({ components: [] }).catch((e) => error(e))

            if (oldBackups.length == 0)
                return interaction.reply({ content: "Eski yedek bulunamadı.", ephemeral: true })

            let embed = {
                color: interaction.message.embeds[0].color,
                description: interaction.message.embeds[0].description + `\n\n\`🔃\` Eski Yedekler siliniyor...`,
            }

            interaction.message.edit({ embeds: [embed] }).catch((e) => error(e))

            for (let data of channelsDatas) data.backup.id !== backupId ? await channelModel.deleteOne({ _id: data._id }) : null;
            for (let data of rolesDatas) data.backup.id !== backupId ? await roleModel.deleteOne({ _id: data._id }) : null;

            const newText = `\`✅\` ${oldBackups.map(m => `\`${m}\``).join(', ')} id'li eski yedek(ler) silindi.`
            embed.description = embed.description.replace('\`🔃\` Eski Yedekler siliniyor...', newText)

            return interaction.message.edit({ embeds: [embed] }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('register-person')) {
            const registerCommandData = await commandModel.findOne({ id: 'register' });
            const registerAdminRoles = registerCommandData.authorities.filter(f => f.type == 'role').map(m => m.id);
            const registerAdminUsers = registerCommandData.authorities.filter(f => f.type == 'user').map(m => m.id);
            const isAuthorAdmin = registerAdminRoles.some(r => interaction.member.roles.cache.has(r)) || registerAdminUsers.includes(interaction.user.id);

            if (!isAuthorAdmin) return interaction.reply({
                content: '\`⚠️\` Bu işlemi sadece kayıt komutunu kullanabilen yetkililer kullanabilir!',
                ephemeral: true
            });

            const isUpdate = interaction.customId.includes('update');

            const gender = interaction.customId.split('-')[2];
            const userId = interaction.customId.split('-')[3];
            const _name = new TextInputBuilder()
                .setCustomId('register-name').setStyle(TextInputStyle.Short)
                .setLabel('Kullanıcının ismini giriniz.')
                .setMinLength(2).setMaxLength(60).setRequired(true)

            const _age = new TextInputBuilder()
                .setCustomId('register-age').setStyle(TextInputStyle.Short)
                .setLabel('Kullanıcının yaşını giriniz.')
                .setMinLength(1).setMaxLength(2).setRequired(true)

            const name = new ActionRowBuilder().addComponents(_name)
            const age = new ActionRowBuilder().addComponents(_age)

            const modal = new ModalBuilder()
                .setCustomId(`register-modal-${gender}-${userId}${isUpdate ? '-update' : ''}`)
                .setTitle(`Kullanıcı Kayıt ${isUpdate ? 'Güncelleme ' : ''}İşlemi`)
                .addComponents(name, age)

            return await interaction.showModal(modal);
        }

        if (interaction.customId.startsWith('register-stop')) {
            const registerCommandData = await commandModel.findOne({ id: 'register' });
            const registerAdminRoles = registerCommandData.authorities.filter(f => f.type == 'role').map(m => m.id);
            const registerAdminUsers = registerCommandData.authorities.filter(f => f.type == 'user').map(m => m.id);
            const isAuthorAdmin = registerAdminRoles.some(r => interaction.member.roles.cache.has(r)) || registerAdminUsers.includes(interaction.user.id);

            if (!isAuthorAdmin) return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            return interaction.message.edit({ content: '\`✅\` Kayıt işlemi iptal edildi!', embeds: [], components: [] })
                .catch((e) => error(e))
        }

        if (interaction.customId.startsWith('registered-stat-list')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const userId = interaction.customId.split('-')[3];
            const userSize = 20;
            const s1 = Number(interaction.customId.split('-')[4]) || 0, s2 = Number(interaction.customId.split('-')[5]) || userSize;
            const user = client.users.cache.get(userId);

            const userStatRegisteredUsersData = await userStatRegisteredUsersModel.findOne({ id: userId });
            const registeredUsers = userStatRegisteredUsersData.registeredUsers;

            if (!userStatRegisteredUsersData) {
                await interaction.deferUpdate();
                return interaction.message.edit({ content: '\`⚠️\` Kullanıcı verisi bulunamadı!', embeds: [], components: [] })
                    .catch((e) => error(e))
            }

            if (!registeredUsers || registeredUsers.length == 0) {
                await interaction.deferUpdate();
                return interaction.message.edit({ content: '\`⚠️\` Kullanıcının kayıt yaptığı biri bulunamadı!', embeds: [], components: [] })
                    .catch((e) => error(e))
            }

            let backButton = new ButtonBuilder()
                .setCustomId(`registered-stat-list-${userId}-${s1 - userSize}-${s2 - userSize}`)
                .setLabel('⬅️ Önceki Sayfa')
                .setStyle(ButtonStyle.Success);

            let nextButton = new ButtonBuilder()
                .setCustomId(`registered-stat-list-${userId}-${s1 + userSize}-${s2 + userSize}`)
                .setLabel('➡️ Sonraki Sayfa')
                .setStyle(ButtonStyle.Success);

            if (s1 - 1 < 0) backButton = backButton.setDisabled(true);
            if (s2 + 1 > registeredUsers.length) nextButton = nextButton.setDisabled(true);

            const actionRow = new ActionRowBuilder().addComponents(backButton, nextButton);

            const embed = {
                color: Colors.White,
                title: `${user.tag} kayıtları`,
                author: {
                    name: user.tag,
                    icon_url: user.avatarURL({ dynamic: true })
                },
                thumbnail: {
                    url: user.avatarURL({ dynamic: true })
                },
                description: registeredUsers.slice(s1, s2).map(m =>
                    `\`${m.gender == 'man' ? '👦' : '👩'}\` <@${m.id}> <t:${Math.floor(Number(m.date) / 1000)}:R> \`${m.id}\``
                ).join("\n")
            }

            await interaction.deferUpdate();
            return interaction.message.edit({ embeds: [embed], components: [actionRow] })
                .catch((e) => error(e))
        }

        if (interaction.customId.startsWith('punishment-user')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const pCommandData = await commandModel.findOne({ id: 'punishment' });
            const pAdminRoles = pCommandData.authorities.filter(f => f.type == 'role').map(m => m.id);
            const pAdminUsers = pCommandData.authorities.filter(f => f.type == 'user').map(m => m.id);
            const isAuthorAdmin = pAdminRoles.some(r => interaction.member.roles.cache.has(r)) || pAdminUsers.includes(interaction.user.id);

            if (!isAuthorAdmin) return interaction.reply({
                content: '\`⚠️\` Bu işlemi sadece kayıt komutunu kullanabilen yetkililer kullanabilir!',
                ephemeral: true
            });

            const operation = interaction.customId.split('-')[2];
            const userId = interaction.customId.split('-')[3];

            const userStatMutesData = await userStatMutesModel.findOne({ id: userId });
            const userStatJailsData = await userStatJailsModel.findOne({ id: userId });
            const userStatBansData = await userStatBansModel.findOne({ id: userId });

            const selectMenuOptions = require('../punishment').filter(f => f.type == operation.replace('_', ''))
            const SelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`punishment-user-${operation}-${userId}`)
                .setPlaceholder('Sebep Seçiniz!')
                .addOptions(selectMenuOptions.map(m => ({ label: m.name, description: m.description, value: m.id })));

            const ActionRow = new ActionRowBuilder().addComponents(SelectMenu);
            const DeleteMessage = (m, embed, author) => {
                setTimeout(() => {
                    if (!m) return;
                    const buttons = m.components[0]?.components?.filter(f => f.data.custom_id.includes('punishment-user')).length == 1;
                    if (buttons) {
                        embed.description = `\`❌\` Bu işlemi gerçekleştirmek için süreniz doldu.`;
                        embed.footer = { text: `${author.tag} tarafından ceza işlemi uygulanacaktı.` };
                        return m?.edit({ embeds: [embed], components: [] }).catch((e) => error(e));
                    }
                }, 30000);
            }


            if (operation.includes('mute')) {
                const lastMute = userStatMutesData?.mutes?.filter(f => f.validity == true)?.filter(f => f.type == operation.split('_')[0])?.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
                if (lastMute && Number(lastMute.endDate) > Date.now())
                    return interaction.reply({ content: '\`⚠️\` Kullanıcı zaten susturulmuş!', ephemeral: true });

                if (operation == 'voice_mute') {
                    const embed = {
                        color: Colors.White,
                        description:
                            `<@${userId}> \`${userId}\` kullanıcısına ceza işlemi uygulanacaktır. \n\n` +
                            `\`🔉\` Voice Mute işlemi için sebep seçiniz. \n` +
                            `\`❇️\` Bu işlemi gerçekleştirmezseniz <t:${Math.floor(Date.now() / 1000) + 31}:R> işlem iptal edilecektir.`,
                        footer: { text: `${author.tag} tarafından ceza işlemi uygulanacak.` },
                    }

                    await interaction.deferUpdate();
                    return interaction.message.edit({ embeds: [embed], components: [ActionRow] })
                        .then(m => DeleteMessage(m, embed, author))
                        .catch((e) => error(e))
                }

                if (operation == 'chat_mute') {
                    const embed = {
                        color: Colors.White,
                        description:
                            `<@${userId}> \`${userId}\` kullanıcısına ceza işlemi uygulanacaktır. \n\n` +
                            `\`🔇\` Chat Mute işlemi için sebep seçiniz. \n` +
                            `\`❇️\` Bu işlemi gerçekleştirmezseniz <t:${Math.floor(Date.now() / 1000) + 31}:R> işlem iptal edilecektir.`,
                        footer: { text: `${author.tag} tarafından ceza işlemi uygulanacak.` },
                    }

                    await interaction.deferUpdate();
                    return interaction.message.edit({ embeds: [embed], components: [ActionRow] })
                        .then(m => DeleteMessage(m, embed, author))
                        .catch((e) => error(e))
                }
            }

            if (operation == 'jail') {
                const lastJail = userStatJailsData?.jails?.filter(f => f.validity == true)?.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
                if (lastJail && Number(lastJail.endDate) > Date.now())
                    return interaction.reply({ content: '\`⚠️\` Kullanıcı zaten hapiste!', ephemeral: true });

                const embed = {
                    color: Colors.White,
                    description:
                        `<@${userId}> \`${userId}\` kullanıcısına ceza işlemi uygulanacaktır. \n\n` +
                        `\`🔒\` Jail işlemi için sebep seçiniz. \n` +
                        `\`❇️\` Bu işlemi gerçekleştirmezseniz <t:${Math.floor(Date.now() / 1000) + 31}:R> işlem iptal edilecektir.`,
                    footer: { text: `${author.tag} tarafından ceza işlemi uygulanacak.` },
                }

                await interaction.deferUpdate();
                return interaction.message.edit({ embeds: [embed], components: [ActionRow] })
                    .then(m => DeleteMessage(m, embed, author))
                    .catch((e) => error(e))
            }

            if (operation == 'ban') {
                const validityBan = userStatBansData?.bans?.filter(f => f.validity == true)[0];
                if (validityBan) return interaction.reply({ content: '\`⚠️\` Kullanıcı zaten yasaklanmış!', ephemeral: true });
            }

            const _time = new TextInputBuilder()
                .setCustomId('time').setStyle(TextInputStyle.Short)
                .setLabel('Süre giriniz.')
                .setPlaceholder('Dakika cinsinden bir değer giriniz.')
                .setMinLength(1).setMaxLength(5).setRequired(true)

            const _reason = new TextInputBuilder()
                .setCustomId('reason').setStyle(TextInputStyle.Paragraph)
                .setLabel('Sebep giriniz.')
                .setMinLength(1).setMaxLength(300).setRequired(true)

            const time = new ActionRowBuilder().addComponents(_time)
            const reason = new ActionRowBuilder().addComponents(_reason)

            const opName = operation.split('_').map(m => m[0].toUpperCase() + m.slice(1).toLowerCase()).join(' ');
            const muteModal = (op, id, comps) => new ModalBuilder()
                .setCustomId(`punishment-modal-${op}-${id}`)
                .setTitle(`${opName} İşlemi`)
                .addComponents(...comps)

            if (operation == 'ban')
                return await interaction.showModal(muteModal(operation, userId, [reason]));

            return await interaction.showModal(muteModal(operation, userId, [time, reason]));
        }

        if (interaction.customId.startsWith('unpunishment-user')) {
            const operation = interaction.customId.split('-')[2];
            const userId = interaction.customId.split('-')[3];

            const _id = new TextInputBuilder()
                .setCustomId('id').setStyle(TextInputStyle.Short)
                .setLabel('Ceza ID\'si nedir?')
                .setMinLength(1).setMaxLength(300).setRequired(true)

            const id = new ActionRowBuilder().addComponents(_id)

            const opName = operation.split('_').map(m => m[0].toUpperCase() + m.slice(1).toLowerCase()).join(' ');
            const modal = new ModalBuilder()
                .setCustomId(`unpunishment-modal-${operation}-${userId}`)
                .setTitle(`${opName} İşlemi`)
                .addComponents(id)

            return await interaction.showModal(modal);
        }

        if (interaction.customId.startsWith('role_info')) {
            const roleId = interaction.customId.split('-')[1];
            const operation = interaction.customId.split('-')[2];

            await interaction.deferUpdate();

            const guildMembers = interaction.guild.members.cache.map(m => ({
                id: m.id,
                roles: m._roles,
                status: m?.presence?.status || 'offline',
                voice: m?.voice?.channel?.id || null
            }));

            const hasRoleMembers = guildMembers.filter(f => f.roles.includes(roleId));

            if (operation == 'cancel') {
                const embed = {
                    color: Colors.White,
                    description: `\`❎\` Rol bilgisi işlemi iptal edildi.`,
                }

                return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
            }

            const userSize = 10;
            const s1 = Number(interaction.customId.split('-')[3]) || 0, s2 = Number(interaction.customId.split('-')[4]) || userSize;

            let backButton = new ButtonBuilder().setCustomId(`role_info-${roleId}-back_users-${s1 - userSize}-${s2 - userSize}`)
                .setLabel('⬅️').setStyle(ButtonStyle.Primary)
            let cancelButton = new ButtonBuilder().setCustomId(`role_info-${roleId}-cancel`)
                .setLabel('❎').setStyle(ButtonStyle.Danger);
            let nextButton = new ButtonBuilder().setCustomId(`role_info-${roleId}-next_users-${s1 + userSize}-${s2 + userSize}`)
                .setLabel('➡️').setStyle(ButtonStyle.Primary);

            if (s1 - 1 < 0) backButton = backButton.setDisabled(true);
            if (s2 + 1 > hasRoleMembers.length) nextButton = nextButton.setDisabled(true);

            const actionRow = new ActionRowBuilder().addComponents(backButton, cancelButton, nextButton);
            const statusText = (x) => x == 'online' ? 'Çevrimiçi' : x == 'idle' ? 'Boşta' : x == 'dnd' ? 'Rahatsız Etmeyin' : 'Çevrimdışı';
            const embed = {
                color: Colors.White,
                description:
                    `<@&${roleId}> \`${roleId}\` rolüne sahip kullanıcılar. \`(${s1}-${s2})\` \n\n` +
                    hasRoleMembers.slice(s1, s2).map(m =>
                        `<@${m.id}> \`${m.id}\` \`${statusText(m.status)}\`${m.voice ? ` <#${m.voice}>` : ''}`
                    ).join('\n'),
            }

            return interaction.message.edit({ embeds: [embed], components: [actionRow] }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('me_punishments-see_user')) {
            const userId = interaction.customId.split('-')[2];

            const userStatMutesData = await userStatMutesModel.findOne({ id: userId });
            const userStatJailsData = await userStatJailsModel.findOne({ id: userId });
            const userStatBansData = await userStatBansModel.findOne({ id: userId });

            const punishments = [
                ...(userStatMutesData?.mutes || []),
                ...(userStatJailsData?.bans?.map(m => ({ ...m, type: 'ban' })) || []),
                ...(userStatBansData?.jails?.map(m => ({ ...m, type: 'jail' })) || []),
            ].sort((a, b) => Number(b.date) - Number(a.date));

            let embed = interaction.message.embeds[0].data;
            if (interaction.customId.split('-')[3] == 'cancel') {
                embed.description = `\`❎\` Kullanıcı ceza bilgisi işlemi iptal edildi.`;
                return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
            }

            const punishmentSize = 5;
            const s1 = Number(interaction.customId.split('-')[3]) || 0, s2 = Number(interaction.customId.split('-')[4]) || punishmentSize;

            let backButton = new ButtonBuilder().setCustomId(`me_punishments-see_user-${userId}-${s1 - punishmentSize}-${s2 - punishmentSize}`)
                .setLabel('⬅️').setStyle(ButtonStyle.Primary)
            let cancelButton = new ButtonBuilder().setCustomId(`me_punishments-see_user-${userId}-cancel`)
                .setLabel('❎').setStyle(ButtonStyle.Danger);
            let nextButton = new ButtonBuilder().setCustomId(`me_punishments-see_user-${userId}-${s1 + punishmentSize}-${s2 + punishmentSize}`)
                .setLabel('➡️').setStyle(ButtonStyle.Primary);

            if (s1 - 1 < 0) backButton = backButton.setDisabled(true);
            if (s2 + 1 > punishments.length) nextButton = nextButton.setDisabled(true);

            let ActionRow = new ActionRowBuilder().addComponents(backButton, cancelButton, nextButton);

            const typeText = (t) => t == 'chat_mute' ? 'Susturma' : t == 'voice_mute' ? 'Sesli Susturma' : t == 'jail' ? 'Hapsetme' : 'Yasaklama';
            embed.description =
                `\`➡️\` Kullanıcıya uygulanan cezalar. \`(${s1}-${s2})\` \n\n` +
                punishments.slice(s1, s2).map((m, i) =>
                    `\`${i + 1 + s1}.\` \`${typeText(m.type)}\` <t:${Math.floor(Number(m.date) / 1000)}:R> ${m?.endDate ? `(Bitiş: <t:${Math.floor(Number(m?.endDate) / 1000)}:R>)` : ''}\n` +
                    `<@${m.executorId}> \`${m.executorId}\` tarafından \`${m._id}\` kimliği kullanılarak \n\`${m.reason}\` nedeniyle uygulandı.` +
                    `${Number(m.endDate) > Date.now() ? ` (Aktif)` : ''}`
                ).join('\n\n')

            await interaction.deferUpdate();
            return interaction.message.edit({ embeds: [embed], components: [ActionRow] }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('punishments-see_user')) {
            const userId = interaction.customId.split('-')[2];
            let mutedUsers = await userStatMutesModel.find({ 'mutes.executorId': userId });
            let jailedUsers = await userStatJailsModel.find({ 'jails.executorId': userId });
            let banedUsers = await userStatBansModel.find({ 'bans.executorId': userId });

            let muteds = [], jaileds = [], baneds = [];
            for (userData of mutedUsers)
                muteds = [...muteds, ...userData?.mutes?.filter(x => x.executorId === userId)?.map(m => ({ ...m, id: userData.id }))]

            for (userData of jailedUsers)
                jaileds = [...jaileds, ...userData?.jails?.filter(x => x.executorId === userId)?.map(m => ({ ...m, id: userData.id, type: "jail" }))]

            for (userData of banedUsers)
                baneds = [...baneds, ...userData?.bans?.filter(x => x.executorId === userId)?.map(m => ({ ...m, id: userData.id, type: "ban" }))]

            const transactions = [...muteds, ...jaileds, ...baneds].sort((a, b) => Number(b.date) - Number(a.date))

            let embed = interaction.message.embeds[0].data;
            if (interaction.customId.split('-')[3] == 'cancel') {
                embed.description = `\`❎\` Kullanıcı ceza bilgisi işlemi iptal edildi.`;
                return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
            }

            const punishmentSize = 5;
            const s1 = Number(interaction.customId.split('-')[3]) || 0, s2 = Number(interaction.customId.split('-')[4]) || punishmentSize;

            let backButton = new ButtonBuilder().setCustomId(`punishments-see_user-${userId}-${s1 - punishmentSize}-${s2 - punishmentSize}`)
                .setLabel('⬅️').setStyle(ButtonStyle.Primary)
            let cancelButton = new ButtonBuilder().setCustomId(`punishments-see_user-${userId}-cancel`)
                .setLabel('❎').setStyle(ButtonStyle.Danger);
            let nextButton = new ButtonBuilder().setCustomId(`punishments-see_user-${userId}-${s1 + punishmentSize}-${s2 + punishmentSize}`)
                .setLabel('➡️').setStyle(ButtonStyle.Primary);

            if (s1 - 1 < 0) backButton = backButton.setDisabled(true);
            if (s2 + 1 > transactions.length) nextButton = nextButton.setDisabled(true);

            let ActionRow = new ActionRowBuilder().addComponents(backButton, cancelButton, nextButton);
            const typeText = (t) => t == 'chat_mute' ? 'Susturma' : t == 'voice_mute' ? 'Sesli Susturma' : t == 'jail' ? 'Hapsetme' : 'Yasaklama';
            embed.description =
                `\`➡️\` Kullanıcıya uygulanan cezalar. \`(${s1}-${s2})\` \n\n` +
                transactions.slice(s1, s2).map((m, i) =>
                    `\`${i + 1 + s1}.\` \`${typeText(m.type)}\` <t:${Math.floor(Number(m.date) / 1000)}:R> ${m?.endDate ? `(Bitiş: <t:${Math.floor(Number(m?.endDate) / 1000)}:R>)` : ''}\n` +
                    `<@${m.id}> \`${m.id}\` üyesine \`${m._id}\` kimliği kullanılarak \n\`${m.reason}\` nedeniyle uygulandı.` +
                    `${Number(m.endDate) > Date.now() ? ` (Aktif)` : ''}`
                ).join('\n\n')

            await interaction.deferUpdate();
            return interaction.message.edit({ embeds: [embed], components: [ActionRow] }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('eventButton')) {
            const clicker = interaction.user;
            try {
                await interaction.message.delete().catch(null);
                await interaction.deferUpdate();
            } catch (error) { }

            const _randomTL = Math.random() * (config.eventMaxCoin - config.eventMinCoin) + config.eventMinCoin;
            const randomTL = Number(_randomTL.toFixed(2))

            let userData = await userModel.findOne({ id: clicker.id });
            if (!userData) userData = await userModel({ id: clicker.id });
            userData._coin = (userData._coin || 0) + randomTL;
            await userData.save().catch((e) => null);


            const embed = {
                color: interaction.message.embeds[0].color,
                description: `<@${clicker.id}> \`${clicker.id}\` kullanıcısı \`${randomTL} TL\` kazandı!`,
            }

            return await interaction.message.channel.send({ embeds: [embed] })
        }

        if (interaction.customId.startsWith('coin_sending_yes')) {
            const author = interaction.message.mentions.users.first();
            if (author.id !== interaction.user.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir.', ephemeral: true });

            await interaction.deferUpdate();
            const senderId = interaction.customId.split('-')[1];
            const sendingId = interaction.customId.split('-')[2];
            const amount = interaction.customId.split('-')[3];
            const coinType = interaction.customId.split('-')[4];
            const senderIsAdmin = config.admins.includes(senderId);

            let senderData = await userModel.findOne({ id: senderId });
            let sendingUserData = await userModel.findOne({ id: sendingId });

            if (!senderIsAdmin) {
                if (coinType == 'doğrulanmış') senderData.coin = (senderData.coin || 0) - amount;
                if (coinType == 'doğrulanmamış') senderData._coin = (senderData._coin || 0) - amount;
                senderData.save().catch((e) => null);
            }

            const taxTL = amount / 100 * 10
            if (coinType == 'doğrulanmış') sendingUserData.coin = (sendingUserData.coin || 0) + (amount - taxTL);
            if (coinType == 'doğrulanmamış') sendingUserData._coin = (sendingUserData._coin || 0) + (amount - taxTL);
            sendingUserData.save().catch((e) => null);

            const embed = {
                color: interaction.message.embeds[0].color,
                description:
                    `\`✅\` <@${senderId}> \`${senderId}\` kullanıcısı <@${sendingId}> \`${sendingId}\` kullanıcısına \`${coinType} ${(amount - taxTL).toFixed(2)} TL\` gönderdi.`
            }

            return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('market')) {
            const author = interaction.message.mentions.users.first();
            if (author.id !== interaction.user.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir.', ephemeral: true });

            const operation = interaction.customId.split('-')[1];

            if (operation == 'list_items') {
                await interaction.deferUpdate();
                const subOperation = interaction.customId.split('-')[2];
                if (subOperation == 'cancel') {
                    const embed = {
                        color: interaction.message.embeds[0].color,
                        title: interaction.message.embeds[0].title,
                        description: `\`✅\` Marketten çıktınız.`
                    }
                    return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
                }

                if (subOperation == 'buy') {
                    const itemId = interaction.customId.split('-')[3];
                    const itemData = await marketModel.findOne({ id: itemId });

                    let userData = await userModel.findOne({ id: interaction.user.id });
                    if (!userData) userData = await userModel({ id: interaction.user.id });

                    if (userData.coin < itemData.price || (userData.coin || 0) - itemData.price < 0) {
                        const embed = {
                            color: interaction.message.embeds[0].color,
                            title: interaction.message.embeds[0].title,
                            description:
                                `\`⚠️\` Yanlızca doğrulanmış TL bakiyeniz ile alışveriş yapabilirsiniz.\n` +
                                `\`⚠️\` Yeterli paranız yok.`
                        }
                        return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
                    }

                    userData.coin = (userData.coin || 0) - itemData.price;
                    userData.save().catch((e) => null);

                    const embed = {
                        color: interaction.message.embeds[0].color,
                        title: interaction.message.embeds[0].title,
                        description:
                            `\`✅\` <@${interaction.user.id}> \`${interaction.user.id}\` kullanıcısı ürün satın aldı. \n` +
                            `\`✅\` Ürün: \`${itemData.name}\` \n` +
                            `\`✅\` Fiyat: \`${itemData.price} TL\``
                    }

                    let logChannel = interaction.guild.channels.cache.get(config.eventBuyLogChannel);
                    if (logChannel) logChannel.send({ embeds: [embed] });
                    return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
                }

                const items = await marketModel.find();

                if (!items || items.length == 0) {
                    const embed = {
                        color: interaction.message.embeds[0].color,
                        title: interaction.message.embeds[0].title,
                        description: `\`❓\` Markette hiç ürün yok.`
                    }
                    return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
                }

                const itemsSize = 1;
                const s1 = Number(interaction.customId.split('-')[2]) || 0, s2 = Number(interaction.customId.split('-')[3]) || itemsSize;

                let item = items.slice(s1, s2)[0];
                let backButton = new ButtonBuilder().setCustomId(`market-list_items-${s1 - itemsSize}-${s2 - itemsSize}`)
                    .setLabel('⬅️').setStyle(ButtonStyle.Primary)
                let buyButton = new ButtonBuilder().setCustomId(`market-list_items-buy-${items.slice(s1, s2)[0]?.id}`)
                    .setLabel('🛒').setStyle(ButtonStyle.Success);
                let cancelButton = new ButtonBuilder().setCustomId(`market-list_items-cancel`)
                    .setLabel('❎').setStyle(ButtonStyle.Danger);
                let nextButton = new ButtonBuilder().setCustomId(`market-list_items-${s1 + itemsSize}-${s2 + itemsSize}`)
                    .setLabel('➡️').setStyle(ButtonStyle.Primary);

                if (s1 - 1 < 0) backButton = backButton.setDisabled(true);
                if (s2 + 1 > items.length) nextButton = nextButton.setDisabled(true);

                let ActionRow = new ActionRowBuilder().addComponents(backButton, buyButton, cancelButton, nextButton);

                const embed = {
                    color: interaction.message.embeds[0].color,
                    description:
                        `Ürünün ID'si: \`${item.id}\`\n` +
                        `Ürünün adı: \`${item.name}\`\n` +
                        `Ürünün fiyatı: \`${item.price} TL\`\n` +
                        `Ürünü satın almak için \`🛒\` butonuna basınız.`
                }

                return interaction.message.edit({ embeds: [embed], components: [ActionRow] }).catch((e) => error(e))
            }

            if (operation == 'add_item') {
                const name = new TextInputBuilder()
                    .setCustomId('name')
                    .setLabel("Ürünün adı nedir?")
                    .setStyle(TextInputStyle.Short).setRequired(true)

                const price = new TextInputBuilder()
                    .setCustomId('price')
                    .setLabel("Ürünün fiyatı nedir?")
                    .setStyle(TextInputStyle.Short).setRequired(true)


                const nameActionRow = new ActionRowBuilder().addComponents(name);
                const priceActionRow = new ActionRowBuilder().addComponents(price);

                const modal = new ModalBuilder()
                    .setCustomId('market_model-add_item')
                    .setTitle('Markete Ürün Ekleme')
                    .addComponents(nameActionRow, priceActionRow);

                return await interaction.showModal(modal);
            }

            if (operation == 'remove_item') {
                const id = new TextInputBuilder()
                    .setCustomId('id')
                    .setLabel("Silinecek olan ürün kimliği nedir?")
                    .setStyle(TextInputStyle.Short).setRequired(true)

                const idActionRow = new ActionRowBuilder().addComponents(id);

                const modal = new ModalBuilder()
                    .setCustomId('market_model-remove_item')
                    .setTitle('Markete Ürün Silme')
                    .addComponents(idActionRow);

                return await interaction.showModal(modal);
            }
        }

        if (interaction.customId.startsWith('move_command')) {
            const operation = interaction.customId.split('-')[1];
            const authorId = interaction.customId.split('-')[2];
            const memberId = interaction.customId.split('-')[3];
            const channelId = interaction.customId.split('-')[4];

            if (interaction.user.id !== memberId)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const authorMember = interaction.guild.members.cache.get(authorId);
            const movingMember = interaction.guild.members.cache.get(memberId);

            const authorMemberChannelId = authorMember.voice.channelId;
            const movingMemberChannelId = movingMember.voice.channelId;

            await interaction.deferUpdate();

            if (operation == 'verify') {
                if (!authorMemberChannelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${movingMember}, Yanına gideceğiniz kullanıcı ses kanalından ayrılmış!`, components: [] })
                        .catch((e) => error(e))

                if (authorMemberChannelId !== channelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${movingMember}, Yanına gideceğiniz kullanıcı farklı bir sesli kanalda bulunuyor!`, components: [] })
                        .catch((e) => error(e))

                if (!movingMemberChannelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${movingMember}, Ses Kanalında kanalında değilsin!`, components: [] })
                        .catch((e) => error(e))

                if (movingMemberChannelId == channelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${movingMember}, Zaten gideceğiniz kanaldasınız!`, components: [] })
                        .catch((e) => error(e))

                if (authorMemberChannelId == movingMemberChannelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${movingMember}, Zaten gideceğiniz kullanıcının yanındasınız!`, components: [] })
                        .catch((e) => error(e))

                movingMember.voice.setChannel(authorMemberChannelId)
                    .then(() => interaction.message.edit({ content: `\`✅\` ${movingMember} adlı üye <#${authorMemberChannelId}> kanalına çekildi.`, components: [] }).catch((e) => error(e)))
                    .catch(() => interaction.message.edit({ content: "\`❌\` Etiketlediğin üyeyi çekemiyorum.", components: [] }).catch((e) => error(e)));
            }

            if (operation == 'cancel')
                return interaction.message.edit({ content: `\`❌\` İşlem iptal edildi.`, components: [] })
                    .catch((e) => error(e))
        }

        if (interaction.customId.startsWith('gonear_command')) {
            const operation = interaction.customId.split('-')[1];
            const authorId = interaction.customId.split('-')[2];
            const memberId = interaction.customId.split('-')[3];
            const channelId = interaction.customId.split('-')[4];

            if (interaction.user.id !== memberId)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const authorMember = interaction.guild.members.cache.get(authorId);
            const movingMember = interaction.guild.members.cache.get(memberId);

            const authorMemberChannelId = authorMember.voice.channelId;
            const movingMemberChannelId = movingMember.voice.channelId;

            await interaction.deferUpdate();

            if (operation == 'verify') {
                if (!movingMemberChannelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${authorMember}, Yanına gideceğiniz kullanıcı ses kanalından ayrılmış!`, components: [] })
                        .catch((e) => error(e))

                if (movingMemberChannelId !== channelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${authorMember}, Yanına gideceğiniz kullanıcı farklı bir sesli kanalda bulunuyor!`, components: [] })
                        .catch((e) => error(e))

                if (!movingMemberChannelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${authorMember}, Ses kanalında değilsin!`, components: [] })
                        .catch((e) => error(e))

                if (movingMemberChannelId == channelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${authorMember}, Zaten gideceğiniz kanaldasınız!`, components: [] })
                        .catch((e) => error(e))

                if (authorMemberChannelId == movingMemberChannelId)
                    return interaction.message.edit({ content: `\`⚠️\` ${authorMember}, Zaten gideceğiniz kullanıcının yanındasınız!`, components: [] })
                        .catch((e) => error(e))

                authorMember.voice.setChannel(movingMemberChannelId)
                    .then(() => interaction.message.edit({ content: `\`✅\` ${authorMember} adlı üye <#${movingMemberChannelId}> kanalına gitti.`, components: [] }).catch((e) => error(e)))
                    .catch(() => interaction.message.edit({ content: "\`❌\` Etiketlediğin üyenin yanına seni çekemiyorum.", components: [] }).catch((e) => error(e)));
            }

            if (operation == 'cancel')
                return interaction.message.edit({ content: `\`❌\` İşlem iptal edildi.`, components: [] })
                    .catch((e) => error(e))
        }

        if (interaction.customId.startsWith('staff_add_member_button')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const userId = interaction.customId.split('-')[1];
            const authorityRoleId = interaction.customId.split('-')[2]
            const responsibilityRoleId = interaction.customId.split('-')[3];

            if (userId == 'null') {
                const embed = {
                    color: Colors.White,
                    description: `\`✅\` İşlem iptal edildi!`
                }
                return interaction.message.edit({ embeds: [embed], components: [] })
                    .catch((e) => error(e))
            }

            const member = interaction.guild.members.cache.get(userId);
            const authorityRole = interaction.guild.roles.cache.get(authorityRoleId);
            const responsibilityRole = interaction.guild.roles.cache.get(responsibilityRoleId);

            if (!member) {
                let embed = interaction.message.embeds[0];
                embed.description = `\`⚠️\` \`${userId}\` id'li kullanıcı sunucuda bulunamadı!`;
                return interaction.message.edit({ embeds: [embed], components: [] })
                    .catch((e) => error(e))
            }

            if (!authorityRole) {
                let embed = interaction.message.embeds[0];
                embed.description = `\`⚠️\` \`${authorityRoleId}\` id'li rol sunucuda bulunamadı!`;
                return interaction.message.edit({ embeds: [embed], components: [] })
                    .catch((e) => error(e))
            }

            if (!responsibilityRole) {
                let embed = interaction.message.embeds[0];
                embed.description = `\`⚠️\` \`${responsibilityRoleId}\` id'li rol sunucuda bulunamadı!`;
                return interaction.message.edit({ embeds: [embed], components: [] })
                    .catch((e) => error(e))
            }

            await interaction.deferUpdate();

            if (member.roles.cache.has(authorityRoleId) && member.roles.cache.has(responsibilityRoleId)) {
                let embed = interaction.message.embeds[0];
                embed.description = `\`⚠️\` <@&${responsibilityRoleId}> ve <@&${responsibilityRoleId}> rolleri zaten kullanıcıda bulunuyor!`;
            }

            let embed = {
                color: Colors.White,
                description:
                    `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                    `\`🫡\` Yetki: <@&${authorityRoleId}> \n` +
                    `\`🗨️\` Sorumluluk: <@&${responsibilityRoleId}> \n` +
                    `\`✅\` Rolleri verildi, İşlem tamamlandı.`
            }

            let userData = await userModel.findOne({ id: userId });
            if (!userData) userData = await userModel({ id: userId }).save().catch((e) => null);

            let adminUserData = await userModel.findOne({ id: interaction.user.id });
            if (!adminUserData) adminUserData = await userModel({ id: interaction.user.id }).save().catch((e) => null);

            let adminStatStaffedUsersData = await userStatStaffedUsersModel.findOne({ id: interaction.user.id });
            if (!adminStatStaffedUsersData) adminStatStaffedUsersData = await userStatStaffedUsersModel({ id: interaction.user.id }).save().catch((e) => null);

            const lastAuthorityAuth = authorities.sort((a, b) => a.id - b.id).find(m => m.authRoles.filter(f => member._roles.includes(f)))
            const works = userData?.staff?.responsibilities?.map(m => {
                const type = responsibilities.find(f => f.roleId == m.roleId)?.type;
                if (type) return lastAuthorityAuth[type].map(m => m.id);
            }).flat().filter((v, i, a) => a.indexOf(v) === i)
            const _authorityRoleId = adminUserData?.staff?.authority?.roleId || null;

            adminStatStaffedUsersData.staffedUsers.push({
                date: `${Date.now()}`,
                authorityRoleId: _authorityRoleId,
                works: works,
                user: {
                    id: userId,
                    authorityRoleId,
                    responsibilityRoleId
                }
            })

            await adminStatStaffedUsersData.save().catch((e) => null);

            userData.staff = {
                authority: {
                    roleId: authorityRoleId,
                    date: Date.now(),
                    executorId: interaction.user.id
                },
                responsibilities: [
                    {
                        date: `${Date.now()}`,
                        roleId: responsibilityRoleId,
                        executorId: interaction.user.id
                    }
                ]
            }

            await userData.save().then(() => {
                let roles = [config.staffMainRoleId, authorityRoleId, responsibilityRoleId];
                if (member._roles.length > 0) roles = [...roles, ...member._roles]

                member.roles.set(roles)
                    .then(async () => {
                        interaction.message.edit({ embeds: [embed], components: [] })
                            .catch((e) => error(e))
                    })
                    .catch(() => {
                        embed.description =
                            `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                            `\`🫡\` Yetki: <@&${authorityRoleId}> \n` +
                            `\`🗨️\` Sorumluluk: <@&${responsibilityRoleId}> \n` +
                            `\`❌\` Roller verilemedi! İşlem tamamlanamadı!`
                        interaction.message.edit({ embeds: [embed], components: [] })
                            .catch((e) => error(e))
                    });
            }).catch(() => {
                embed.description =
                    `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                    `\`🫡\` Yetki: <@&${authorityRoleId}> \n` +
                    `\`🗨️\` Sorumluluk: <@&${responsibilityRoleId}> \n` +
                    `\`❌\` Veriler Düzenlenemedi! Roller verilemedi! İşlem tamamlanamadı!`
                interaction.message.edit({ embeds: [embed], components: [] })
                    .catch((e) => error(e))
            })
        }

        if (interaction.customId.startsWith('my_officers')) {
            const operation = interaction.customId.split('-')[1];
            const userId = interaction.customId.split('-')[2];

            if (interaction.user.id !== userId) {
                let embed = {
                    color: Colors.White,
                    description: `\`⚠️\` Bu işlem sizin için değildir!`
                }
                return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
            }

            if (operation == 'cancel') {
                let embed = {
                    color: Colors.White,
                    description: `\`❌\` <@${userId}> menü kapatıldı!`
                }
                return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
            }

            await interaction.deferUpdate();

            const userStatStaffedUsersData = await userStatStaffedUsersModel.find({ id: userId });

            if (!userStatStaffedUsersData) {
                let embed = {
                    color: Colors.White,
                    description: `\`⚠️\` <@${userId}> kullanıcı veritabanında bulunamadı!`
                }
                return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
            }

            const officersSize = 5;
            const s1 = Number(interaction.customId.split('-')[3]) || 0, s2 = Number(interaction.customId.split('-')[4]) || officersSize;

            let backButton = new ButtonBuilder().setCustomId(`my_officers-back-${userId}-${s1 - officersSize}-${s2 - officersSize}`)
                .setLabel('⬅️').setStyle(ButtonStyle.Primary)
            let cancelButton = new ButtonBuilder().setCustomId(`my_officers-cancel-${userId}`)
                .setLabel('❎').setStyle(ButtonStyle.Danger);
            let nextButton = new ButtonBuilder().setCustomId(`my_officers-next-${userId}-${s1 + officersSize}-${s2 + officersSize}`)
                .setLabel('➡️').setStyle(ButtonStyle.Primary);

            if (s1 - 1 < 0) backButton = backButton.setDisabled(true);
            if (s2 + 1 > userStatStaffedUsersData?.staffedUsers?.length) nextButton = nextButton.setDisabled(true);

            const actionRow = new ActionRowBuilder().addComponents(backButton, cancelButton, nextButton);

            let embed = {
                color: Colors.White,
                title: `Yetkililerim (${s1}-${s2})`,
                description: userStatStaffedUsersData?.staffedUsers?.sort((a, b) => Number(b.date) - Number(a.date)).slice(s1, s2).map((m, i) => {
                    let authorityRole = m.user?.authorityRoleId ? `<@&${m.user?.authorityRoleId}> yetkisi` : '';
                    let and = authorityRole && m.user?.responsibilityRoleId ? ' ve ' : '';
                    let responsibilityRole = m.user?.responsibilityRoleId ? `<@&${m.user?.responsibilityRoleId}> sorumluluğu` : '';
                    return `\`${i + 1 + s1}.\` <@${m.user.id}> kullanıcısına <t:${Math.floor(m.date / 1000)}:R>;\n\`➡️\` ${authorityRole}${and}${responsibilityRole} verilmiş.`
                }).join('\n\n')
            }

            return interaction.message.edit({ embeds: [embed], components: [actionRow] }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('user_taged')) {
            const operation = interaction.customId.split('-')[1];
            const executorId = interaction.customId.split('-')[2];
            const userId = interaction.customId.split('-')[3];
            const member = interaction.guild.members.cache.get(userId);

            if (interaction.user.id !== userId) {
                let embed = {
                    color: Colors.White,
                    description: `\`⚠️\` Bu işlem sizin için değildir!`
                }
                return interaction.reply({ embeds: [embed], ephemeral: true }).catch((e) => error(e))
            }

            await interaction.deferUpdate();
            if (operation == 'cancel') {
                let embed = {
                    color: Colors.White,
                    description: `\`❌\` <@${executorId}> kullanıcısının taglı yapma isteği <@${member.user.id}> kullanıcısı tarafından reddedildi.`
                }
                return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
            }

            const memberTagData = await userStatTagModel.findOne({ userId });

            if (memberTagData) {
                let embed = {
                    color: Colors.White,
                    description: `\`❇️\` <@${userId}> adlı üye zaten <${executorId}> tarafından taglı yapılmış!`,
                }
                return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
            }

            await userStatTagModel({ userId, executorId, date: Number(Date.now()) }).save().catch((e) => null);
            member.setNickname(member.displayName.replace(config.defaultTag, config.tag)).catch((e) => error(e));

            let embed = {
                color: Colors.White,
                description: `\`✅\` <@${userId}> adlı üye <@${executorId}> tarafından taglı yapıldı!`,
            }

            return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('user_list_tageds')) {
            const operation = interaction.customId.split('-')[1];
            const userId = interaction.customId.split('-')[2];
            const member = interaction.guild.members.cache.get(userId);

            if (!member) {
                let embed = {
                    color: Colors.White,
                    description: `\`⚠️\` <@${userId}> kullanıcısı bulunamadı!`
                }
                return interaction.reply({ embeds: [embed], ephemeral: true }).catch((e) => error(e))
            }

            const memberTagDatas = await userStatTagModel.find({ executorId: member.user.id });

            if (!memberTagDatas.length) {
                let embed = {
                    color: Colors.White,
                    description: `\`⚠️\` <@${member.user.id}> kullanıcısının taglı yaptığı kullanıcılar bulunamadı!`
                }

                return interaction.reply({ embeds: [embed], ephemeral: true }).catch((e) => error(e))
            }

            await interaction.deferUpdate();

            if (operation == 'cancel') {
                let embed = {
                    color: Colors.White,
                    description: `\`❌\` <@${userId}> kullanıcısının taglı yapma isteği menüsü kapatıldı!`
                }
                return interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e))
            }

            const limit = 10;
            const s1 = Number(interaction.customId.split('-')[3]) || 0, s2 = Number(interaction.customId.split('-')[4]) || limit;

            const buttonId = (type, x, y) => `${interaction.customId.split('-')[0]}-${type}-${member.user.id}-${x}-${y}`;
            let backButton = new ButtonBuilder().setCustomId(buttonId('back', s1 - limit, s2 - limit))
                .setLabel('⬅️').setStyle(ButtonStyle.Success)
            let cancelButton = new ButtonBuilder().setCustomId(buttonId('cancel', 0, 0))
                .setLabel('❎').setStyle(ButtonStyle.Danger)
            let nextButton = new ButtonBuilder().setCustomId(buttonId('next', s1 + limit, s2 + limit))
                .setLabel('➡️').setStyle(ButtonStyle.Success)

            if (s1 - 1 < 0) backButton = backButton.setDisabled(true);
            if (s2 + 1 > memberTagDatas?.length) nextButton = nextButton.setDisabled(true);

            const actionRow = new ActionRowBuilder().addComponents(backButton, cancelButton, nextButton);

            let embed = {
                color: Colors.White,
                description:
                    `\`❇️\` ${member} adlı üye toplamda ${memberTagDatas.length} kişiyi taglı yapmış! (${s1}-${s2})\n\n` +
                    memberTagDatas
                        .sort((a, b) => Number(b.date) - Number(a.date))
                        .slice(s1, s2)
                        .map((m, i) => `\`${i + 1 + s1}.\` <@${m.userId}> tarafından <t:${Math.floor(m.date / 1000)}:R> taglı yapılmış.`).join('\n')
            }

            return interaction.message.edit({ embeds: [embed], components: [actionRow] }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('yetkili_say')) {
            const operation = interaction.customId.split('-')[1];
            const roleId = interaction.customId.split('-')[2];

            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            interaction.message.edit({ components: [] }).catch((e) => error(e));

            if (operation == 'onlineButNotInVoicesMembers') {
                const members = interaction.guild.members.cache
                    .filter(m => m.roles.cache.has(roleId))
                    .filter(m => m.presence?.status)
                    .filter(m => !m.voice.channel)

                if (members.length == 0)
                    return interaction.reply({
                        content: 'Sunucuda online olup ses kanalında olmayan üye bulunamadı!',
                        ephemeral: true
                    });

                return interaction.reply({
                    content: '# Seste Olmayan Yetkililer: #\n' + members.map(m => `<@${m.id}>`).join(', '),
                })
            }
        }
    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith('logSelect')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const operation = interaction.customId.split('-')[2];
            const channelId = interaction.customId.split('-')[3];

            const logs = require('../logs');

            const findLog = await logModel.findOne({ name: interaction.values[0] });
            const infoLabel = logs.flat().find(f => f.value == interaction.values[0]).label;

            if (operation == 'aç') {
                interaction.deferUpdate();
                const datas = { channelId, authorId: author.id, date: Number(Date.now()) }
                if (findLog) await logModel.updateOne({ name: interaction.values[0] }, datas, { upsert: true }).catch((e) => error(e))
                else await logModel(({ name: interaction.values[0], ...datas })).save().catch((e) => null);
                interaction.message.edit({ content: `\`✅\` **${infoLabel}** bilgilendirmesi için <#${channelId}> kanalı ayarlandı.`, components: [] })
                    .catch((e) => error(e))
            }

            if (operation == 'kapat') {
                if (!findLog) return interaction.reply({ content: `\`❓\` **${infoLabel} Olay bilgilendirme henüz eklenmemiş.**`, ephemeral: true });
                interaction.deferUpdate();
                await logModel.deleteOne({ name: interaction.values[0] })
                    .catch((e) => error(e))
                interaction.message.edit({ content: `\`✅\` **${infoLabel}** bilgilendirmesi için ayarlanan kanal kaldırıldı.`, components: [] })
                    .catch((e) => error(e))
            }

            return;
        }

        if (interaction.customId.startsWith('logInfo')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const logs = require('../logs');

            const findLog = await logModel.findOne({ name: interaction.values[0] });
            const infoLabel = logs.flat().find(f => f.value == interaction.values[0]).label;

            if (!findLog || !infoLabel)
                return interaction.message.edit({ content: `\`❓\` **${infoLabel} Olay bilgilendirme henüz eklenmemiş.**`, components: [] })
                    .catch((e) => error(e))

            const embed = {
                color: Colors.White,
                title: 'Olay bilgileri',
                fields: [
                    { name: '\`📋\` Olay', value: `\`➡️\` ${infoLabel}` },
                    { name: '\`📣\` Bilgilendirme Kanalı', value: `\`➡️\` <#${findLog.channelId}> \`${findLog.channelId}\`` },
                    { name: '\`🫡\` Ekleyen', value: `\`➡️\` <@${findLog.authorId}> \`${findLog.authorId}\`` },
                    { name: '\`🕑\` Eklenme tarihi', value: `\`➡️\` <t:${Math.floor(Number(findLog.date) / 1000)}:R>` },
                ]
            }

            return interaction.message.edit({ content: null, embeds: [embed], components: [] })
                .catch((e) => error(e))
        }

        if (interaction.customId.startsWith('rollbackSelect')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const operation = interaction.customId.split('-')[2];

            const logs = require('../logs');

            const findRollback = await rollbackModel.findOne({ name: interaction.values[0] });
            const infoLabel = logs.flat().find(f => f.value == interaction.values[0]).label;

            if (operation == 'aç') {
                interaction.deferUpdate();
                const datas = { authorId: author.id, date: Number(Date.now()), excluded: [] }
                if (findRollback) return interaction.message.edit({ content: `\`⚠️\` **${infoLabel} olayı için rollback zaten ayarlanmış.**`, components: [] })
                    .catch((e) => error(e))
                await rollbackModel(({ name: interaction.values[0], ...datas })).save().catch((e) => null);
                interaction.message.edit({ content: `\`✅\` **${infoLabel}** olayı için rollback açıldı.`, components: [] })
                    .catch((e) => error(e))
            }

            if (operation == 'kapat') {
                if (!findRollback) return interaction.message.edit({ content: `\`⚠️\` **${infoLabel} olayı için rollback ayarlanmamış.**`, components: [] })
                    .catch((e) => error(e))
                interaction.deferUpdate();
                await rollbackModel.deleteOne({ name: interaction.values[0] }).catch((e) => error(e))
                interaction.message.edit({ content: `\`✅\` **${infoLabel}** olayı için rollback kapatıldı.`, components: [] })
                    .catch((e) => error(e))
            }

            return;
        }

        if (interaction.customId.startsWith('rollbackInfo')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const logs = require('../logs');

            const findRollback = await rollbackModel.findOne({ name: interaction.values[0] });
            const infoLabel = logs.flat().find(f => f.value == interaction.values[0]).label;

            if (!findRollback || !infoLabel)
                return interaction.message.edit({ content: `\`❓\` **${infoLabel} Olay bilgilendirme henüz eklenmemiş.**`, components: [] })
                    .catch((e) => error(e))

            const excludedRoles = findRollback.excluded.filter(f => f.type == 'role').map(m => `<@&${m.id}>`).join(', ');
            const excludedUsers = findRollback.excluded.filter(f => f.type == 'user').map(m => `<@${m.id}>`).join(', ');

            const embed = {
                color: Colors.White,
                title: 'Geri alınma olayı bilgileri',
                fields: [
                    { name: '\`📋\` Olay', value: `\`➡️\` ${infoLabel}` },
                    { name: '\`🫡\` Ekleyen', value: `\`➡️\` <@${findRollback.authorId}> \`${findRollback.authorId}\`` },
                    { name: '\`🕑\` Eklenme tarihi', value: `\`➡️\` <t:${Math.floor(Number(findRollback.date) / 1000)}:R>` },
                    {
                        name: '\`❇️\` Dışlananlar',
                        value:
                            findRollback.excluded.length > 0 ?
                                (excludedUsers ? excludedUsers + '\n' : '') + (excludedRoles ? excludedRoles + '\n' : '') :
                                `\`➡️\` Dışlanan kullanıcı/rol yok.`
                    }

                ]
            }

            return interaction.message.edit({ content: null, embeds: [embed], components: [] })
                .catch((e) => error(e))
        }

        if (interaction.customId.startsWith('rollbacExcluded')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            const operation = interaction.customId.split('-')[2];
            const id = interaction.customId.split('-')[3];
            const type = interaction.customId.split('-')[4];

            const logs = require('../logs');

            const findRollback = await rollbackModel.findOne({ name: interaction.values[0] });
            const excluded = findRollback.excluded;
            const infoLabel = logs.flat().find(f => f.value == interaction.values[0]).label;

            if (operation == 'ekle') {
                if (!findRollback) return interaction.message.edit({ content: `\`⚠️\` **${infoLabel} olayı için rollback ayarlanmamış.**`, components: [] })
                    .catch((e) => error(e))
                if (findRollback.excluded.find(f => f.id == id && f.type == type))
                    return interaction.message.edit({ content: `\`⚠️\` **${infoLabel} olayı için zaten dışlanmışsınız.**`, components: [] })
                        .catch((e) => error(e))
                findRollback.excluded.push({ id, type });
                interaction.message.edit({ content: `\`✅\` **${infoLabel}** rollback için <@${type == 'role' ? '&' : ''}${id}> dışlancaklar listesine eklendi.`, components: [] })
                    .catch((e) => error(e))
            }

            if (operation == 'çıkar') {
                if (!findRollback)
                    return interaction.message.edit({ content: `\`⚠️\` **${infoLabel} olayı için rollback ayarlanmamış.**`, components: [] })
                        .catch((e) => error(e))
                if (!excluded.find(f => f.id == id && f.type == type))
                    return interaction.message.edit({ content: `\`⚠️\` **${infoLabel} olayı için zaten dışlanmamışsınız.**`, components: [] })
                        .catch((e) => error(e))
                findRollback.excluded = excluded.filter(f => f.id !== id);
                interaction.message.edit({ content: `\`✅\` **${infoLabel}** rollback için <@${type == 'role' ? '&' : ''}${id}> dışlancaklar listesinden kaldırıldı.`, components: [] })
                    .catch((e) => error(e))
            }

            findRollback.save().catch((e) => null);
        }

        if (interaction.customId.startsWith('punishment-user')) {
            const operation = interaction.customId.split('-')[2];
            const userId = interaction.customId.split('-')[3];
            const member = interaction.guild.members.cache.get(userId);
            const punishment = require('../punishment').find(f => f.id == interaction.values[0]);

            let userStatMutesData = await userStatMutesModel.findOne({ id: userId });
            let userStatJailsData = await userStatJailsModel.findOne({ id: userId });
            let userStatBansData = await userStatBansModel.findOne({ id: userId });

            if (!userStatMutesData)
                userStatMutesData = await userStatMutesModel({ id: userId }).save().catch((e) => null);
            if (!userStatJailsData)
                userStatJailsData = await userStatJailsModel({ id: userId }).save().catch((e) => null);
            if (!userStatBansData)
                userStatBansData = await userStatBansModel({ id: userId }).save().catch((e) => null);

            if (operation.includes('mute')) {
                const lastMute = userStatMutesData?.mutes?.filter(f => f.validity == true)?.filter(f => f.type == operation.split('_')[0])?.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
                if (lastMute && Number(lastMute.endDate) > Date.now())
                    return interaction.reply({ content: '\`⚠️\` Kullanıcı zaten susturulmuş!', ephemeral: true });

                const _id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

                userStatMutesData.mutes.push({
                    _id,
                    type: operation,
                    time: punishment.time * 1000,
                    endDate: `${Date.now() + (punishment.time * 1000)}`,
                    executorId: interaction.user.id,
                    date: `${Date.now()}`,
                    reason: punishment.name,
                    validity: true
                })

                const datas = {
                    user: member.user,
                    executor: interaction.user,
                    punishment: {
                        _id,
                        type: operation,
                        reason: punishment.name,
                        time: punishment.time * 1000,
                        endDate: `${Date.now() + (punishment.time * 1000)}`,
                    }
                }

                client.emit(CustomEvents.GuildMemberMute, datas)

                const oldMutes = userStatMutesData?.mutes;
                if (((oldMutes?.length || 0) + 1) % 10 == 0) {
                    const reason = 'Üst üste susturulmadan dolayı jail cezası sistem tarafından otomatik verildi.'
                    const __id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                    userStatJailsData.jails.push({
                        _id: __id,
                        time: punishment.time * 1000,
                        endDate: `${Date.now() + (punishment.time * 1000)}`,
                        executorId: interaction.user.id,
                        date: `${Date.now()}`,
                        oldRoles: member._roles,
                        reason,
                        validity: true
                    })

                    if (member) member.roles.set([config.jailRole]).catch((e) => error(e))
                    if (member?.voice?.channel) member.voice.disconnect().catch((e) => error(e))

                    const _datas = {
                        user: member.user,
                        executor: interaction.user,
                        punishment: {
                            _id: __id,
                            reason,
                            time: punishment.time * 1000,
                            endDate: `${Date.now() + (punishment.time * 1000)}`,
                        }
                    }

                    client.emit(CustomEvents.GuildMemberJail, _datas)
                } else {
                    if (member) {
                        if (operation == 'chat_mute') member.roles.add(config.chatMuteRole).catch((e) => error(e))
                        if (operation == 'voice_mute') {
                            if (member.voice.channel) member.voice.setMute(true).catch((e) => error(e))
                            member.roles.add(config.voiceMuteRole).catch((e) => error(e))
                        }
                    }
                }
            }

            if (operation.includes('jail')) {
                const lastJail = userStatJailsData?.jails?.filter(f => f.validity == true)?.sort((a, b) => Number(b.endDate) - Number(a.endDate))[0];
                if (lastJail && Number(lastJail.endDate) > Date.now())
                    return interaction.reply({ content: '\`⚠️\` Kullanıcı zaten cezalı!', ephemeral: true });

                const _id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

                userStatJailsData.jails.push({
                    _id,
                    time: punishment.time * 1000,
                    endDate: `${Date.now() + (punishment.time * 1000)}`,
                    executorId: interaction.user.id,
                    date: `${Date.now()}`,
                    oldRoles: member._roles,
                    reason: punishment.name,
                    validity: true
                })

                if (member) {
                    member.setNickname(`Jailed - ${member.user.username}`).catch((e) => error(e))
                    member.roles.set([config.jailRole]).catch((e) => error(e))
                    if (member?.voice?.channel) member.voice.disconnect().catch((e) => error(e))
                }

                const datas = {
                    user: member.user,
                    executor: interaction.user,
                    punishment: {
                        _id,
                        reason: punishment.name,
                        time: punishment.time * 1000,
                        endDate: `${Date.now() + (punishment.time * 1000)}`,
                    }
                }

                client.emit(CustomEvents.GuildMemberJail, datas)
            }

            userStatMutesData.save().catch((e) => null);
            userStatJailsData.save().catch((e) => null);

            const opName = operation.split('_').map(m => m[0].toUpperCase() + m.slice(1).toLowerCase()).join(' ');
            await interaction.deferUpdate();
            return interaction.message.edit({
                embeds: [{
                    color: Colors.White,
                    description:
                        `\`🤓\` ${member} \`${member.user.id}\` üyesine ${opName} işlemi uygulandı. \n` +
                        `\`🫡\` **Yetkili:** <@${interaction.user.id}> \`${interaction.user.id}\` \n` +
                        `\`🗨️\` **Sebep:** \`${punishment.name}\` \n` +
                        `\`⏳\` **Süre:** \`${punishment.time / 60} dakika\` \n` +
                        `\`⏭️\` **Bitiş Tarihi:** <t:${Math.floor(Date.now() / 1000) + (punishment.time)}:R> \n` +
                        `\`📅\` **Tarih:** <t:${Math.floor(Date.now() / 1000)}:R>`
                }],
                components: []
            }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('staff_add_member_menu')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlemi yapan yetkili değilsiniz.', ephemeral: true });

            const userId = interaction.customId.split('-')[1];
            let authorityRoleId = interaction.customId.split('-')[2] || interaction.values[0];
            let responsibilityRoleId = interaction.customId.split('-')[3] || authorityRoleId !== interaction.values[0] ? interaction.values[0] : null;
            const roleName = (id) => interaction.guild.roles.cache.get(id)?.name || 'Bulunamadı.';

            await interaction.deferUpdate();

            if (authorityRoleId && !responsibilityRoleId) {
                const role = interaction.guild.roles.cache.get(authorityRoleId);

                if (!role)
                    return interaction.message.edit({
                        embeds: [{ color: Colors.White, description: `\`⚠️\` Seçilen rol sunucuda bulunamadı.` }], components: []
                    }).catch((e) => error(e))

                const rolesSelect = new StringSelectMenuBuilder()
                    .setCustomId(`${interaction.customId}-${role.id}`)
                    .setPlaceholder('☝️ Sorumluluk seçiniz.')
                    .addOptions(responsibilities.map((responsibility, i) =>
                        ({ label: `${i + 1}. ${roleName(responsibility.roleId)} Yetkisi`, value: responsibility.roleId })
                    ));

                const actionRow = new ActionRowBuilder().addComponents(rolesSelect);

                let embed = {
                    color: Colors.White,
                    description:
                        `\`➡️\` ${interaction.member}, <@${userId}> kullanıcısına <@&${role.id}> yetkisi verilecek. Lütfen sorumluluğunu seçiniz. \n` +
                        `\`⌛\` Sorumluluk seçilmez ise işlem <t:${Math.floor(Date.now() / 1000) + 31}:R> iptal edilecektir.`
                }

                return interaction.message.edit({ embeds: [embed], components: [actionRow] })
                    .then(msg => {
                        setTimeout(() => {
                            if (!msg) return;
                            const rolesSelectMenu = msg?.components[0]?.components?.find(c => c.customId == `${interaction.customId}-${role.id}`);
                            if (!rolesSelectMenu) return;
                            embed.description = '\`⌛\` Yetki seçildi fakat sorumluluk seçim zaman aşımına uğradığı için işlem iptal edildi.';
                            return interaction.message.edit({ embeds: [embed], components: [] })
                                .catch((e) => error(e))
                        }, 30000);
                    })
                    .catch((e) => error(e))
            }

            if (authorityRoleId && responsibilityRoleId) {
                const role = interaction.guild.roles.cache.get(responsibilityRoleId);

                if (!role)
                    return interaction.message.edit({
                        embeds: [{ color: Colors.White, description: `\`⚠️\` Seçilen rol sunucuda bulunamadı.` }], components: []
                    }).catch((e) => error(e))

                const verifyId = `staff_add_member_button-${userId}-${authorityRoleId}-${responsibilityRoleId}`
                const cancelId = `staff_add_member_button-null`

                const verifyButton = new ButtonBuilder().setCustomId(verifyId).setLabel('✅ Onayla').setStyle(ButtonStyle.Success);
                const cancelButton = new ButtonBuilder().setCustomId(cancelId).setLabel('❌ İptal').setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(verifyButton, cancelButton);

                let embed = {
                    color: Colors.White,
                    description:
                        `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                        `\`🫡\` Yetki: <@&${authorityRoleId}> \n` +
                        `\`🗨️\` Sorumluluk: <@&${role.id}> \n` +
                        `\`❓\` ${interaction.member} bu işlemi onaylıyor musunuz? \n` +
                        `\`⌛\` İşlem onaylanmaz ise <t:${Math.floor(Date.now() / 1000) + 31}:R> iptal edilecektir.`
                }

                return interaction.message.edit({ embeds: [embed], components: [row] })
                    .then(msg => {
                        setTimeout(() => {
                            if (!msg) return;
                            const verifyButton = msg?.components[0]?.components?.find(c => c.customId == verifyId);
                            if (!verifyButton) return;
                            embed.description = '\`⌛\` Yetki ve sorumluluk seçildi fakat 30 saniye içerisinde onaylanmadığı için işlem iptal edildi.';
                            return interaction.message.edit({ embeds: [embed], components: [] })
                                .catch((e) => error(e))
                        }, 30000);
                    })
                    .catch((e) => error(e))
            }
        }

        if (interaction.customId.startsWith('staff_responsibility_menu')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlemi yapan yetkili değilsiniz.', ephemeral: true });

            await interaction.deferUpdate();
            interaction.message.edit({ components: [] })
                .catch((e) => error(e))

            const operation = interaction.customId.split('-')[1];
            const userId = interaction.customId.split('-')[2];
            const roleId = interaction.values[0];

            const member = interaction.guild.members.cache.get(userId);
            const role = interaction.guild.roles.cache.get(roleId);

            if (!member) {
                const embed = { color: Colors.White, description: `\`⚠️\` Seçilen üye sunucuda bulunamadı.` }
                return interaction.message.edit({ embeds: [embed] })
                    .catch((e) => error(e))
            }

            if (!role) {
                const embed = { color: Colors.White, description: `\`⚠️\` Seçilen üye sunucuda bulunamadı.` }
                return interaction.message.edit({ embeds: [embed] })
                    .catch((e) => error(e))
            }

            let embed = {
                color: Colors.White,
                description:
                    `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                    `\`🗨️\` Sorumluluk: <@&${roleId}> \n` +
                    `\`✅\` Rolü ${operation == 'add' ? 'verildi' : 'alındı'}, İşlem tamamlandı.`
            }

            let userData = await userModel.findOne({ id: userId });
            if (!userData) userData = await userModel({ id: userId }).save().catch((e) => null);

            let adminUserData = await userModel.findOne({ id: interaction.user.id });
            if (!adminUserData) adminUserData = await userModel({ id: interaction.user.id }).save().catch((e) => null);

            let adminStatStaffedUsersData = await userStatStaffedUsersModel.findOne({ id: interaction.user.id });
            if (!adminStatStaffedUsersData) adminStatStaffedUsersData = await userStatStaffedUsersModel({ id: interaction.user.id }).save().catch((e) => null);

            if (operation == 'add' && userData.staff.responsibilities.find(f => f.roleId == roleId))
                return interaction.message.edit({ embeds: [{ color: Colors.White, description: `\`⚠️\` Seçilen üye zaten bu sorumluluğa sahip.` }], components: [] })
                    .catch((e) => error(e))

            if (operation == 'remove' && !userData.staff.responsibilities.find(f => f.roleId == roleId))
                return interaction.message.edit({ embeds: [{ color: Colors.White, description: `\`⚠️\` Seçilen üye bu sorumluluğa sahip değil.` }], components: [] })
                    .catch((e) => error(e))

            const lastAuthorityAuth = authorities.sort((a, b) => a.id - b.id).find(m => m.authRoles.filter(f => member._roles.includes(f)))
            const works = userData?.staff?.responsibilities?.map(m => {
                const type = responsibilities.find(f => f.roleId == m.roleId)?.type;
                if (type) return lastAuthorityAuth[type].map(m => m.id);
            }).flat().filter((v, i, a) => a.indexOf(v) === i);

            if (operation == 'add') {
                adminStatStaffedUsersData.staffedUsers.push({
                    date: `${Date.now()}`,
                    authorityRoleId: adminUserData?.staff?.authority?.roleId || null,
                    works: works,
                    user: { id: userId, responsibilityRoleId: roleId }
                })

                userData.staff.responsibilities.push({
                    date: `${Date.now()}`,
                    roleId,
                    executorId: interaction.user.id
                })
            } else if (operation == 'remove') {
                userData.staff.responsibilities = userData.staff.responsibilities.filter(f => f.roleId !== roleId);
            }

            await adminStatStaffedUsersData.save().catch((e) => null);
            return await userData.save().then(() => {
                if (operation == 'add') member.roles.add(roleId)
                    .then(() => interaction.message.edit({ embeds: [embed], components: [] }))
                    .catch(() => {
                        embed.description =
                            `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                            `\`🗨️\` Sorumluluk: <@&${roleId}> \n` +
                            `\`❌\` Rol verilemedi veya alınamadı! İşlem tamamlanamadı!`
                        interaction.message.edit({ embeds: [embed], components: [] })
                            .catch((e) => error(e))
                    });
                if (operation == 'remove') member.roles.remove(roleId)
                    .then(() => interaction.message.edit({ embeds: [embed], components: [] }).catch((e) => error(e)))
                    .catch(() => {
                        embed.description =
                            `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                            `\`🗨️\` Sorumluluk: <@&${roleId}> \n` +
                            `\`❌\` Rol verilemedi veya alınamadı! İşlem tamamlanamadı!`
                        interaction.message.edit({ embeds: [embed], components: [] })
                            .catch((e) => error(e))
                    });
            }).catch(() => {
                embed.description =
                    `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                    `\`🗨️\` Sorumluluk: <@&${roleId}> \n` +
                    `\`❌\` Veriler Düzenlenemedi! Rol verilemedi veya alınamadı! İşlem tamamlanamadı!`
                interaction.message.edit({ embeds: [embed], components: [] })
                    .catch((e) => error(e))
            })
        }

        if (interaction.customId.startsWith('member_role')) {
            const author = interaction.message.mentions.users.first();
            if (interaction.user.id !== author.id)
                return interaction.reply({ content: '\`⚠️\` Bu işlem sizin için değildir!', ephemeral: true });

            await interaction.deferUpdate();
            interaction.message.edit({ components: [] }).catch((e) => error(e))

            const operation = interaction.customId.split('-')[1];
            const userId = interaction.customId.split('-')[2];
            const roleId = interaction.values[0];

            const member = interaction.guild.members.cache.get(userId);
            const role = interaction.guild.roles.cache.get(roleId);

            let embed = {
                color: Colors.White,
                description:
                    `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                    `\`🗨️\` Rol: <@&${roleId}> \n` +
                    `\`✅\` Rolü ${operation == 'add' ? 'verildi' : 'alındı'}, İşlem tamamlandı.`
            }

            if (!member) {
                embed.description = `\`⚠️\` Üye sunucuda bulunamadı!`
                return interaction.message.edit({ embeds: [embed] })
                    .catch((e) => error(e))
            }

            if (!role) {
                embed.description = `\`⚠️\` Rol sunucuda bulunamadı!`
                return interaction.message.edit({ embeds: [embed] })
                    .catch((e) => error(e))
            }

            if (operation == 'add') {
                member.roles.add(roleId)
                    .then(() => interaction.message.edit({ embeds: [embed] }).catch((e) => error(e)))
                    .catch(() => {
                        embed.description =
                            `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                            `\`🗨️\` Rol: <@&${roleId}> \n` +
                            `\`❌\` Rol verilemedi! İşlem tamamlanamadı!`
                        interaction.message.edit({ embeds: [embed] })
                            .catch((e) => error(e))
                    });
            }

            if (operation == 'remove') {
                member.roles.remove(roleId)
                    .then(() => interaction.message.edit({ embeds: [embed] }))
                    .catch(() => {
                        embed.description =
                            `\`➡️\` <@${userId}> kullanıcısı için;\n` +
                            `\`🗨️\` Rol: <@&${roleId}> \n` +
                            `\`❌\` Rol alınamadı! İşlem tamamlanamadı!`
                        interaction.message.edit({ embeds: [embed] });
                    });
            }
        }
    }

    if (interaction.type === InteractionType.ModalSubmit) {
        if (interaction.customId.startsWith('register-modal')) {
            const datas = interaction.fields.fields.map(m => ({ name: m.customId.split('-')[1], value: m.value }))
            const getValue = (name) => datas.find(f => f.name == name).value;
            const executor = interaction.user;
            const gender = interaction.customId.split('-')[2];
            const member = interaction.guild.members.cache.get(interaction.customId.split('-')[3]);
            let executorStatData = await userStatRegisteredUsersModel.findOne({ id: executor.id });
            let memberData = member ? await userModel.findOne({ id: member.user.id }) : null;
            let memberStatData = member ? await userStatChancedNamesModel.findOne({ id: member.user.id }) : null;

            const isUpdate = interaction.customId.includes('update');
            if (!member) {
                await interaction.deferUpdate();
                return interaction.message.edit({ 
                    content: '\`⚠️\` Kayıt yapılacak kişi sunucuda olmadığı için işlem sonlandırıldı.', 
                    components: [] 
                }).catch((e) => error(e))
            }

            if (!memberData)
                memberData = await userModel({ id: member.user.id }).save().catch((e) => null);

            if (!executorStatData)
                executorStatData = await userStatRegisteredUsersModel({ id: executor.id }).save().catch((e) => null);

            if (!memberStatData)
                memberStatData = await userStatChancedNamesModel({ id: member.user.id }).save().catch((e) => null);

            const isAge = !isNaN(Number(getValue('age'))) && Number(getValue('age')) >= 15;
            const isName = !(getValue('name').split('').filter(f => !'abcçdefgğhıijklmnoöprsştuüvyzwxq'.split('').includes(f.toLowerCase())).length > 0)
            const isNameLength = getValue('name').length <= 32;
            const isNameSpaces = getValue('name').split(' ').length == 1;

            if (!isAge || !isName || !isNameLength) {
                let content = '';
                if (!isNameSpaces) content += `\`⚠️\` **Lütfen isim yazarken boşluk kullanmayınız.**\n`;
                if (!isNameLength) content += `\`⚠️\` **Lütfen isim bilgisini 32 karakterden az yazınız.**\n`;
                if (!isName) content += `\`⚠️\` **Lütfen isim bilgisini sadece harflerden oluşacak şekilde yazınız.**\n`;
                if (!isAge) content += `\`⚠️\` **Lütfen yaş bilgisini sayı olarak ve 15 yaş yada üzeri yazınız.**`;
                return await interaction.reply({ content, ephemeral: true });
            }

            await interaction.deferUpdate();

            memberData.register = {
                name: getValue('name'),
                age: parseInt(getValue('age')),
                gender,
                executorId: executor.id,
                date: `${Date.now()}`
            }

            const tag = member.user.username.includes(config.tag) ? config.tag : config.defaultTag;
            const _name = getValue('name')?.split(' ')[0] || getValue('name');
            const name = _name?.slice(0, 1)?.toUpperCase() + _name?.slice(1)?.toLowerCase();
            const addingRoles = gender == 'man' ? config.registeredManRoles : gender == 'woman' ? config.registeredWomanRoles : [];
            const memberRoles = member?.roles?.cache?.map(m => m.id)?.filter(f => f !== config.unregisterRole) || [];
            const roles = [...addingRoles, ...memberRoles]

            member.setNickname(`${tag} ${name} | ${getValue('age')}`).catch((e) => error(e))
            member.roles.set(roles).catch((e) => error(e))

            memberData.displayname = `${tag} ${name} | ${getValue('age')}`;
            memberData.roles = roles;
            memberData.save().catch((e) => null);

            const _oldData = executorStatData.registeredUsers.find(f => f.id == member.user.id);
            if (_oldData) executorStatData.registeredUsers = executorStatData.registeredUsers.filter(f => f !== _oldData);

            let userData = await userModel.findOne({ id: member.user.id });
            if (!userData) userData = await userModel({ id: member.user.id }).save()
                .catch((e) => error(e))

            executorStatData.registeredUsers.push({ id: member.user.id, gender, date: `${Date.now()}` })

            executorStatData.save().catch((e) => null);

            memberStatData.chancedNames.push({
                old: member.displayName,
                new: `${tag} ${name} | ${getValue('age')}`,
                date: `${Date.now()}`,
                executorId: executor.id
            })

            await memberStatData.save().catch((e) => null);

            const statusText = isUpdate ? 'kaydı güncellendi.' : 'kayıt edildi.';
            return interaction.message.edit({
                content: `\`✅\` ${member} \`${member.user.id}\` üyesi <@${executor.id}> \`${executor.id}\` adlı yetkili tarafından ${statusText}`,
                embeds: [],
                components: []
            }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('punishment-modal')) {
            const datas = interaction.fields.fields.map(m => ({ name: m.customId, value: m.value }))
            const reason = datas.find(f => f.name == 'reason').value;

            const pCommandData = await commandModel.findOne({ id: 'punishment' });
            const pAdminRoles = pCommandData.authorities.filter(f => f.type == 'role').map(m => m.id);
            const pAdminUsers = pCommandData.authorities.filter(f => f.type == 'user').map(m => m.id);
            const isAuthorAdmin = pAdminRoles.some(r => interaction.member.roles.cache.has(r)) || pAdminUsers.includes(interaction.user.id);

            if (!isAuthorAdmin) {
                await interaction.deferUpdate();
                return interaction.message.edit({ content: '\`⚠️\` Bu işlemi yapmaya yetkiniz yok.', components: [] })
                    .catch((e) => error(e))
            }

            const operation = interaction.customId.split('-')[2];
            const userId = interaction.customId.split('-')[3];
            const member = interaction.guild.members.cache.get(userId) || null;
            let userStatBansData = await userStatBansModel.findOne({ id: userId });

            if (!userStatBansData) userStatBansData = await userStatBansData({ id: userId }).save().catch((e) => null);

            if (operation !== 'ban') return await interaction.reply({ content: '\`⚠️\` Geçersiz işlem.', ephemeral: true });

            const _id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            userStatBansData.bans.push({
                _id,
                executorId: interaction.user.id,
                date: `${Date.now()}`,
                oldRoles: member?._roles ? member._roles : [],
                reason,
                validity: true
            })

            if (member) {
                member.setNickname(`Yasaklı - ${member.user.username}`).catch((e) => error(e))
                member.roles.set([config.banRole]).catch((e) => error(e))
                if (member?.voice?.channel) member.voice.disconnect().catch((e) => error(e))
            }

            await userStatBansData.save().catch((e) => null);

            const _datas = {
                user: member.user,
                executor: interaction.user,
                punishment: {
                    _id,
                    reason
                }
            }

            client.emit(CustomEvents.GuildMemberBlock, _datas)

            const opName = operation.split('_').map(m => m[0].toUpperCase() + m.slice(1).toLowerCase()).join(' ');
            await interaction.deferUpdate();
            return interaction.message.edit({
                embeds: [{
                    color: Colors.White,
                    description: `\`🤓\` ${member} \`${member.user.id}\` üyesine ${opName} işlemi uygulandı. \n` +
                        `\`🫡\` **Yetkili:** <@${interaction.user.id}> \`${interaction.user.id}\` \n` +
                        `\`🗨️\` **Sebep:** \`${reason}\` \n` +
                        `\`📅\` **Tarih:** <t:${Math.floor(Date.now() / 1000)}:R>`
                }],
                components: []
            }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('unpunishment-modal')) {
            const datas = interaction.fields.fields.map(m => ({ name: m.customId, value: m.value }))
            const id = datas.find(f => f.name == 'id').value;
            const operation = interaction.customId.split('-')[2];
            const userId = interaction.customId.split('-')[3];
            const userData = await userModel.findOne({ id: userId });
            const member = interaction.guild.members.cache.get(userId);

            let userStatMutesData = await userStatMutesModel.findOne({ id: userId });
            let userStatJailsData = await userStatJailsModel.findOne({ id: userId });
            let userStatBansData = await userStatBansModel.findOne({ id: userId });

            const unPunishment = (event, user, executor, punishment) => client.emit(event, { user, executor, punishment })

            if (operation == 'chat_mute') {
                const mute = userStatMutesData?.mutes?.filter(f => f.type == operation).find(f => f._id == id);

                if (!mute) return await interaction.reply({ content: '\`❓\` Bu id\'ye sahip bir ceza bulunamadı.', ephemeral: true });

                const punishment = { _id: mute._id, type: operation, reason: mute.reason, executorId: mute.executorId }
                unPunishment(CustomEvents.GuildMemberUnmute, member.user, interaction.user, punishment)

                userStatMutesData.mutes = userStatMutesData.mutes.filter(f => f !== mute);
                await userStatMutesData.save().catch((e) => null);

                if (member) member.roles.remove(config.chatMuteRole).catch((e) => error(e))
            }

            if (operation == 'voice_mute') {
                const mute = userStatMutesData?.mutes?.filter(f => f.type == operation).find(f => f._id == id);

                if (!mute) return await interaction.reply({ content: '\`❓\` Bu id\'ye sahip bir ceza bulunamadı.', ephemeral: true });

                const punishment = { _id: mute._id, type: operation, reason: mute.reason, executorId: mute.executorId }
                unPunishment(CustomEvents.GuildMemberUnmute, member.user, interaction.user, punishment)

                userStatMutesData.mutes = userStatMutesData.mutes.filter(f => f !== mute);
                await userStatMutesData.save().catch((e) => null);

                if (member) member.roles.remove(config.voiceMuteRole).catch((e) => error(e))
            }

            if (operation == 'jail') {
                let jail = userStatJailsData?.jails?.find(f => f._id == id);
                const otherJails = userStatJailsData?.jails?.filter(f => f !== jail);

                if (!jail) return await interaction.reply({ content: '\`❓\` Bu id\'ye sahip bir ceza bulunamadı.', ephemeral: true });

                const punishment = { _id: jail._id, reason: jail.reason, executorId: jail.executorId }
                unPunishment(CustomEvents.GuildMemberUnjail, member.user, interaction.user, punishment)

                userStatJailsData.jails = otherJails;
                await userStatJailsData.save().catch((e) => null);

                let addingRoles = userData?.register?.gender ?
                    userData.register.gender == 'man' ? config.registeredManRoles :
                        userData.register.gender == 'woman' ? config.registeredWomanRoles : [] : [];
                if (member.premiumSinceTimestamp) addingRoles.push(config.boosterRole);

                if (member) {
                    if (addingRoles.length > 0) {
                        const tag = member.user.username.includes(config.tag) ? config.tag : config.defaultTag;
                        member.setNickname(`${tag} ${userData?.register?.name} | ${userData?.register?.age}`)
                            .catch((e) => error(e))
                        member.roles.set(addingRoles)
                            .catch((e) => error(e))
                    }
                    else member.roles.set([config.unregisterRole, config.boosterRole])
                        .catch((e) => error(e))
                }
            }

            if (operation == 'ban') {
                let ban = userStatBansData?.bans?.find(f => f._id == id);
                const otherBans = userStatBansData?.bans?.filter(f => f !== ban);

                if (!ban) return await interaction.reply({ content: '\`❓\` Bu id\'ye sahip bir ceza bulunamadı.', ephemeral: true });

                const punishment = { _id: ban._id, reason: ban.reason, executorId: ban.executorId }
                unPunishment(CustomEvents.GuildMemberUnblock, member.user, interaction.user, punishment)

                userStatBansData.bans = otherBans;
                await userStatBansData.save().catch((e) => null);

                let addingRoles = userData?.register?.gender ?
                    userData.register.gender == 'man' ? config.registeredManRoles :
                        userData.register.gender == 'woman' ? config.registeredWomanRoles : [] : [];
                if (member.premiumSinceTimestamp) addingRoles.push(config.boosterRole);

                if (member) {
                    if (addingRoles.length > 0) {
                        const tag = member.user.username.includes(config.tag) ? config.tag : config.defaultTag;
                        member.setNickname(`${tag} ${userData?.register?.name} | ${userData?.register?.age}`)
                            .catch((e) => error(e))
                        member.roles.set(addingRoles)
                            .catch((e) => error(e))
                    }
                    else member.roles.set([config.unregisterRole, config.boosterRole])
                        .catch((e) => error(e))
                }
            }

            await interaction.deferUpdate();
            return interaction.message.edit({
                embeds: [{
                    color: Colors.White,
                    description: `\`🤓\` <@${userId}> \`${userId}\` üyesinin cezası kaldırıldı. \n` +
                        `\`🫡\` **Yetkili:** <@${interaction.user.id}> \`${interaction.user.id}\``
                }],
                components: []
            }).catch((e) => error(e))
        }

        if (interaction.customId.startsWith('market_model')) {
            const datas = interaction.fields.fields.map(m => ({ name: m.customId, value: m.value }));
            const getValue = (name) => datas.find(f => f.name == name).value;
            const operation = interaction.customId.split('-')[1];

            if (operation == 'add_item') {
                const price = parseInt(getValue('price'));
                if (!price) return await interaction.reply({ content: '\`⚠️\` Lütfen geçerli bir fiyat giriniz.', ephemeral: true });

                let addedItem = await marketModel({
                    id: Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 6),
                    name: getValue('name'),
                    price
                }).save().catch((e) => null);

                await interaction.deferUpdate();

                const embed = {
                    color: Colors.White,
                    description: `\`✅\` \`${addedItem?.id}\` ID'li ürün başarıyla eklendi. \n` +
                        `\`📦\` **Ürün Adı:** \`${addedItem?.name}\` \n` +
                        `\`💰\` **Ürün Fiyatı:** \`${addedItem?.price}\``
                }

                return interaction.message.edit({ embeds: [embed], components: [] })
                    .catch((e) => error(e))
            }

            if (operation == 'remove_item') {
                const isThereItem = await marketModel.findOne({ id: getValue('id') });
                if (!isThereItem) return await interaction.reply({ content: '\`⚠️\` Böyle bir ürün bulunamadı.', ephemeral: true });

                await marketModel.deleteOne({ id: getValue('id') }).catch((e) => error(e))

                await interaction.deferUpdate();

                const embed = {
                    color: Colors.White,
                    description: `\`✅\` \`${getValue('id')}\` ID'li ürün başarıyla silindi.`
                }

                return interaction.message.edit({ embeds: [embed], components: [] })
                    .catch((e) => error(e))
            }
        }
    }
})