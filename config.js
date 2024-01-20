module.exports = {
    token: "***",
    mongoURL: "mongodb+srv://***.mongodb.net/anubis",
    prefix: ".",

    serverId: "970704343391158372",
    admins: ["745503568857006211"],
    moveAdminRoles: ["1087041641505898576", "1092026103620702259"],

    welcomeChannelId: "1087243220427218955",
    tag: "♆",
    defaultTag: "✦",

    registeredWomanRoles: ["1087244680518967397", "1087280563100069888"],
    registeredManRoles: ["1087280545333006356", "1087244700932644896"],
    
    tagRole: "1087286427030650920",
    unregisterRole: "1087242085553414194",
    eventsRole: '1087284442663506050',
    giveawayRole: '1087283986671353938',
    tagDeletedRoles: ["1087287731807330425", "1092906144898498572", "1096809199788359680", "1091857126177116180", "1090782277304340550", "1090769019306528858", "1090765850430148708", "1088810631131578439", "1092026247510495302", "1092027267242262568", "1092026186831507498", "1092026147115651154", "1092114369883688990", "1092028197341769728", "1092012031890165870", "1092906283927085076", "1090782217422250066", "1090769125145591919", "1090765957846290594", "1092060001553629214", "1092906017492324353", "1102154982934990929", "1088136966744322189", "1088136970217209978", "1088136972817661984", "1088136976093413466", "1088136886134001724", "1088136880064839750", "1088136883046977647", "1088093780122542141", "1088136876973629491", "1088093691698229298", "1088093595254390904", "1088097103202496602", "1088137066451308628", "1088137063297208321", "1088137351336820796", "1087041641505898576", "1089134668185608332", "1092026103620702259", "1102203199160602667"],
    staffMainRoleId: "1087287731807330425",

    streamVoiceChannels: ["1092025372897443911", "1092025399099265074", "1092025421559763064", "1092025448499793962", "1092025469051875338"],
    publicVoiceChannels: ["1087326289788158013", "1102972362237952031", "1088142806507343892", "1087326025416970240", "1087326317801914398", "1090615748474454077", "1087326298667487312", "1090615608036577341", "1090615679255859250"],
    chatTextChannels: ["1087325732985913374"],

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
    chatMuteRole: "1087329159736475731",
    voiceMuteRole: "1087329132439932979",
    jailRole: "1092007257488769054",
    banRole: "1108865314088833178",
    boosterRole: "970706568326836245",

    punishmentOtherRoles: ["1089134668185608332", "1092026103620702259"],

    eventBuyLogChannel: "1106589639374024807",
    sendingEventMessageCount: 1000,//etkinlik mesajı gönderme sayısı
    eventMinCoin: 0.5,//etkinlik başına minimum coin miktarı
    eventMaxCoin: 0.25,//etkinlik başına maksimum coin miktarı

    coinChatId: "1087325732985913374",//coin kazanma kanalı
    coinInfoChannelId: "1108871240787181660",//coin bilgi kanalı
    chatCoin: 0.001,//her mesaj başına verilecek coin miktarı
    voiceCoin: 0.0040,//her dakika başına verilecek coin miktarı
}