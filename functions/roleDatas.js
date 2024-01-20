module.exports = (role) => {
    if (!role) return null;
    return {
        icon: role.icon,
        unicodeEmoji: role.unicodeEmoji,
        name: role.name,
        hexColor: role.hexColor,
        hoist: role.hoist,
        rawPosition: role.rawPosition,
        permissions: role.permissions.toArray(),
        managed: role.managed,
        mentionable: role.mentionable
    }
}