module.exports = (member) => {
    if (!member) return null;
    return {
        user: member.user,
        avatar: member.avatar,
        displayName: member.displayName,
        _roles: member._roles,
        flags: member.flags,
        pending: member.pending,
        premiumSinceTimestamp: member.premiumSinceTimestamp,
        communicationDisabledUntilTimestamp: member.communicationDisabledUntilTimestamp,
    }
}