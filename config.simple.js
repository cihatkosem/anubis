module.exports = {
    token: "",
    mongoURL: "",
    prefix: "!",

    serverId: "1106589638677770330",
    admins: ["500527985061789711"],
    moveAdminRoles: [],

    welcomeChannelId: "1106589639986393142",
    tag: "♆",
    defaultTag: "✦",

    registeredManRoles: ["1106589638707118128"],
    registeredWomanRoles: ["1106589638707118130"],
    
    tagRole: "1106589638786809876",
    unregisterRole: "1106589638732288161",
    eventsRole: '1106589638757462049',
    giveawayRole: '1106589638719713347',
    tagDeletedRoles: [],
    staffMainRoleId: "1106589638707118123",

    streamVoiceChannels: [],
    publicVoiceChannels: [],
    chatTextChannels: ["1106589639986393146"],

    /*
        Ceza İşlemleri için Notlar:
        1.  Metin Kanallarında Susturma işlemininin gerçekleşebilmesi için bu kuralın kullanılacağı
            kanallarda bu rolün mesaj yazabilme yetkisinin kapatılması gerekmektedir.
        2.  Sesli Kanallarda Susturma işlemininin gerçekleşebilmesi için bu kuralın kullanılacağı
            kanallarda bu rolün sesli konuşma yetkisinin kapatılması gerekmektedir.
        3.  Jail işleminin gerçekleşebilmesi için bu kuralın kullanılacağı belirli bir kanal olması gerekir.
            Jail rolüne sahip olan kişiler ise sadece bu kanalı görebilir.
            Jail sürelidir süre bitinci kullanıcı jailden çıkar.
        4.  Ban işleminin gerçekleşebilmesi için bu kuralın kullanılacağı belirli bir kanal olması gerekir.
            Ban rolüne sahip olan kişiler ise sadece bu kanalı görebilir.
            Ban süresizdir. Yetkili kaldırmadığı sürece kullanıcı banlanmış olarak kalır.
    */
    chatMuteRole: "1106589638707118124",
    voiceMuteRole: "1106589638707118125",
    jailRole: "1106589638707118122",
    banRole: "1096423019427135588",
    boosterRole: "1106589638707118127",

    punishmentOtherRoles: ["1106589638786809879"],

    eventBuyLogChannel: "1106589639374024807",
    sendingEventMessageCount: 5,//etkinlik mesajı gönderme sayısı
    eventMinCoin: 0.10,//etkinlik başına minimum coin miktarı
    eventMaxCoin: 0.50,//etkinlik başına maksimum coin miktarı

    coinChatId: "1106589639374024806",//coin kazanma kanalı
    coinInfoChannelId: "1106589639374024806",//coin bilgi kanalı
    chatCoin: 0.1,//her mesaj başına verilecek coin miktarı
    voiceCoin: 0.1,//her dakika başına verilecek coin miktarı_
}