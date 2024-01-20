const { Events } = require('discord.js')
const { CustomEvents } = require('./server')

module.exports = [
    [
        { label: 'Kanal Oluşturuldu', value: Events.ChannelCreate, description: 'Kanal oluşturulduğunda loglanır.' },
        { label: 'Kanal Silindi', value: Events.ChannelDelete , description: 'Kanal silindiğinde loglanır.' },
        { label: 'Kanal Güncellendi', value: Events.ChannelUpdate, description: 'Kanal güncellendiğinde loglanır.' },
        { label: 'Rol Oluşturuldu', value: Events.GuildRoleCreate, description: 'Rol oluşturulduğunda loglanır.' },
        { label: 'Rol Silindi', value: Events.GuildRoleDelete, description: 'Rol silindiğinde loglanır.' },
        { label: 'Rol Güncellendi', value: Events.GuildRoleUpdate, description: 'Rol güncellendiğinde loglanır.' },
        { label: 'Mesaj Silindi', value: Events.MessageDelete, description: 'Mesaj silindiğinde loglanır.' },
        { label: 'Toplu Mesaj Silindi', value: Events.MessageBulkDelete, description: 'Toplu mesaj silindiğinde loglanır.' },
        { label: 'Mesaj Güncellendi', value: Events.MessageUpdate, description: 'Mesaj güncellendiğinde loglanır.' },
        { label: 'Davet Oluşturuldu', value: Events.InviteCreate, description: 'Davet oluşturulduğunda loglanır.' },
        { label: 'Davet Silindi', value: Events.InviteDelete, description: 'Davet silindiğinde loglanır.' }
    ], 
    [
        { label: 'Üye Banlandı', value: Events.GuildBanAdd, description: 'Üye banlandığında loglanır.' },
        { label: 'Üye Banı Kaldırıldı', value: Events.GuildBanRemove, description: 'Üyenin banı kaldırıldığında loglanır.' },
        { label: 'Üye Katıldı', value: Events.GuildMemberAdd, description: 'Üye sunucuya katıldığında loglanır.' },
        { label: 'Üye Ayrıldı', value: Events.GuildMemberRemove, description: 'Üye sunucudan ayrıldığında loglanır.' },
        { label: 'Üye Güncellendi', value: Events.GuildMemberUpdate, description: 'Üye güncellendiğinde loglanır.' },
        { label: 'Üye Tag Ekledi', value: CustomEvents.MemberTagAdd, description: 'Üye tag eklediğinde loglanır.' },
        { label: 'Üye Tag Çıkardı', value: CustomEvents.MemberTagRemove, description: 'Üye tag çıkardığında loglanır.' },
        { label: 'Üye Ses İşlemi', value: CustomEvents.GuildMemberVoice, description: 'Üye ses işlemi yaptığında loglanır.' },// Custom event
        { label: 'Üye Hapsedildi', value: CustomEvents.GuildMemberJail, description: 'Üye jail\'e atıldığında loglanır.' },// Custom event
        { label: 'Üye Hapisten Çıkarıldı', value: CustomEvents.GuildMemberUnjail, description: 'Üyenin jail\'den çıkarıldığında loglanır.' },// Custom event
        { label: 'Üye Susturuldu', value: CustomEvents.GuildMemberMute, description: 'Üye mute\'lendiğinde loglanır.' },// Custom event
        { label: 'Üye Susturulması Kaldırıldı', value: CustomEvents.GuildMemberUnmute, description: 'Üyenin mute\'den çıkarıldığında loglanır.' },// Custom event
        { label: 'Üye Yasaklandı', value: CustomEvents.GuildMemberBlock, description: 'Üye yasaklandığında loglanır.' },// Custom event
        { label: 'Üye Yasaklanması Kaldırıldı', value: CustomEvents.GuildMemberUnblock, description: 'Üyenin yasaklanması kaldırıldığında loglanır.' },// Custom event
    ]
]