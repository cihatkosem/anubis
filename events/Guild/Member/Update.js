const { AuditLogEvent, Colors, Events } = require("discord.js");
const { logModel, userModel, rollbackModel, userStatChancedNamesModel } = require('../../../models');
const { toCompare, getEntry, memberDatas, error } = require("../../../functions");
const { client, CustomEvents } = require("../../../server");
const config = require("../../../config");

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (oldMember.guild.id !== config.serverId) return;

    const changedKeys = toCompare(memberDatas(oldMember), memberDatas(newMember));
    const AuditLog = changedKeys.find(f => f.key == '_roles') ? AuditLogEvent.MemberRoleUpdate : AuditLogEvent.MemberUpdate;
    const entry = await getEntry(client, oldMember.guild.id, AuditLog);
    const member = newMember.guild.members.cache.get(entry.executor?.id);

    if (entry.executor?.id === client.user.id) return;

    const rollbacking = await rollbackModel.findOne({ name: Events.GuildMemberUpdate });
    const loggingData = await logModel.findOne({ name: Events.GuildMemberUpdate });

    let message, embed;
    if (loggingData) {
        const logChannel = client.channels.cache.get(loggingData.channelId);
        if (!logChannel) return error(Events.GuildMemberUpdate + ' log ayarlanmış fakat kanal bulunamadı!')

        embed = {
            color: Colors.White,
            title: '\`✅\` Üye bilgileri güncellendi!',
            description: `\`✅\` **${oldMember.user.tag}** adlı üyenin bilgileri güncellendi! <t:${Math.floor(Date.now() / 1000)}:R>`,
            fields: [
                {
                    name: "\`✅\` İşlemi Yapan",
                    value: `\`▶️\` <@${entry.executor.id}> \`${entry.executor.id}\` `,
                },
                {
                    name: "\`✅\` Güncellenen Üye",
                    value: `\`▶️\` <@${oldMember.id}> \`${oldMember.id}\``
                },
                {
                    name: "\`🔄️\` Değişen Bilgiler:",
                    value: changedKeys.map(m => {
                        let key = m.key, oldV = m.old, newV = m.new;
                        if (key == '_roles') {
                            const status = oldV.length > newV.length ? 'Rol Çıkarıldı' : 'Rol Eklendi';
                            const xs = oldV.length > newV.length ? oldV.filter(f => !newV.includes(f)) : newV.filter(f => !oldV.includes(f));
                            return `\`❇️\` \`${status}\` \n\`➡️\` ${xs.map(f => `<@&${f}>`).join(', ')}`
                        }
                        if (key == 'displayName') {
                            key = 'Görünen Ad';
                            oldV = oldV || newMember.user.username;
                            newV = newV || newMember.user.username;
                        }

                        return `\`❇️\` \`${key}\` \n\`➖\` ${oldV} \n\`➕\` ${newV}`
                    }).join('\n')
                }
            ]
        }

        message = await logChannel.send({ embeds: [embed] }).catch((e) => error(e));
    }

    const changedRoles = changedKeys.find(f => f.key == "_roles")
    const changedNickname = changedKeys.find(f => f.key == "displayName")

    const userData = await userModel.findOne({ id: oldMember.id });
    if (userData && (changedRoles || changedNickname)) {
        if (changedRoles) userData.roles = changedRoles.new;
        if (changedNickname) {
            userData.displayname = changedNickname.new;

            let memberChangedNamesStatData = await userStatChancedNamesModel.findOne({ id: oldMember.id });
            if (!memberChangedNamesStatData)
                memberChangedNamesStatData = await userStatChancedNamesModel({ id: oldMember.id }).save().catch((e) => null);

            memberChangedNamesStatData.chancedNames.push({
                old: changedNickname.old,
                new: changedNickname.new,
                date: `${Date.now()}`,
                executorId: entry.executor.id
            });

            await memberChangedNamesStatData.save().catch((e) => null);
        }
        await userData.save().catch((e) => null);
    }

    if (!rollbacking) return;
    if (rollbacking.excluded.find(f => f.type == 'user' && f.id == entry.executor.id)) return;

    if (rollbacking.excluded.filter(f => member._roles.includes(f.id)).length > 0) return;

    if (changedRoles) oldMember.roles.set(changedRoles.old).catch((e) => error(e))
    if (changedNickname) oldMember.setNickname(oldMember.displayName).catch((e) => error(e))

    if (userData && (changedRoles || changedNickname)) {
        if (changedRoles) userData.roles = changedRoles.old;
        if (changedNickname) userData.displayname = changedNickname.old;
        await userData.save().catch((e) => null);
    }

    embed.title = '\`✅\` Değiştirilen üye bilgileri geri alındı!';
    embed.description = `\`✅\` **${oldMember.user.tag}** adlı üyenin değiştirilen bilgileri geri alındı! <t:${Math.floor(Date.now() / 1000)}:R>`;
    message.edit({ embeds: [embed] }).catch((e) => error(e));
})

client.on(Events.UserUpdate, async (oldUser, newUser) => {
    if (oldUser.username == newUser.username || oldUser.bot) return;

    const thereIs = oldUser.username.includes(config.tag) && newUser.username.includes(config.tag)
    const addTag = !oldUser.username.includes(config.tag) && newUser.username.includes(config.tag)
    const removeTag = oldUser.username.includes(config.tag) && !newUser.username.includes(config.tag)

    const member = client.guilds.cache.get(config.serverId).members.cache.get(oldUser.id);
    const changedUsername = { old: oldUser.username, new: newUser.username };
    if (thereIs) return;
    if (addTag && member) client.emit(CustomEvents.MemberTagAdd, ({ member, changedUsername }));
    if (removeTag && member) client.emit(CustomEvents.MemberTagRemove, ({ member, changedUsername }));
})

client.on(CustomEvents.MemberTagAdd, async ({ member, changedUsername }) => {
    member.roles.add(config.tagRole).catch((e) => error(e));
    if (!member.displayName.includes(config.tag))
        member.setNickname(member.displayName.replace(config.defaultTag, config.tag))
            .catch((e) => error(e));

    const loggingData = await logModel.findOne({ name: CustomEvents.MemberTagAdd });
    const logChannel = client.channels.cache.get(loggingData?.channelId);

    if (loggingData && logChannel) {
        const embed = {
            color: Colors.White,
            title: '\`✅\` Kullanıcı tag durumunu güncelledi!',
            description:
                `\`✅\` <@${member.user.id}> adlı üye tagını aldı! <t:${Math.floor(Date.now() / 1000)}:R> \n` +
                `\`✅\` Eski Kullanıcı Adı: \`${changedUsername.old.replaceAll('`', '').replaceAll('*', '')}\` \n` +
                `\`✅\` Yeni Kullanıcı Adı: \`${changedUsername.new.replaceAll('`', '').replaceAll('*', '')}\` \n` +
                `\`✅\` Kullanıcı ID: \`${member.user.id}\` \n` +
                `\`✅\` Kullanıcıya verilen rol: <@&${config.tagRole}>`
        }

        await logChannel.send({ embeds: [embed] }).catch((e) => error(e));
    }
})

client.on(CustomEvents.MemberTagRemove, async ({ member, changedUsername }) => {
    const roles = [config.tagRole, ...config?.tagDeletedRoles]
    const loggingData = await logModel.findOne({ name: CustomEvents.MemberTagRemove });
    const logChannel = client.channels.cache.get(loggingData?.channelId);

    if (loggingData && logChannel) {
        const embed = {
            color: Colors.White,
            title: '\`✅\` Kullanıcı tag durumunu güncelledi!',
            description:
                `\`✅\` <@${member.user.id}> adlı üye tagını çıkardı! <t:${Math.floor(Date.now() / 1000)}:R> \n` +
                `\`✅\` Eski Kullanıcı Adı: \`${changedUsername.old.replaceAll('`', '').replaceAll('*', '')}\` \n` +
                `\`✅\` Yeni Kullanıcı Adı: \`${changedUsername.new.replaceAll('`', '').replaceAll('*', '')}\` \n` +
                `\`✅\` Kullanıcı ID: \`${member.user.id}\` \n` +
                `\`✅\` Kullanıcıdan alınan roller: ${roles.filter(f => member._roles.includes(f)).map(f => `<@&${f}>`).join(', ')}`
        }

        await logChannel.send({ embeds: [embed] }).catch((e) => error(e));
    }

    if (member.displayName.includes(config.tag))
        member.setNickname(member.displayName.replace(config.tag, config.defaultTag))
            .catch((e) => error(e));
    member.roles.remove(roles).catch((e) => error(e));
})