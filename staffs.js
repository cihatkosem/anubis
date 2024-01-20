/*

Görevler: streamer-stat?saniye, voice-stat?saniye, chat-stat?adet, register-stat?adet, recruitment-stat?adet, invite-stat?adet

*/

module.exports.authorities = [
    {
        id: 1,
        roleId: '1087041641505898576',//A N U B I S
        public: [
            { id: 'voice-stat', value: 100 * 60 * 60 },
            { id: 'chat-stat', value: 1000 },
            { id: 'invite-stat', value: 45 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 100 * 60 * 60 },
            { id: 'chat-stat', value: 1000 },
            { id: 'invite-stat', value: 45 }
        ],
        chat: [
            { id: 'chat-stat', value: 8000 },
            { id: 'invite-stat', value: 45 },
            { id: 'voice-stat', value: 45 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 125 },
            { id: 'invite-stat', value: 85 },
            { id: 'voice-stat', value: 45 * 60 * 60 },
            { id: 'chat-stat', value: 1000 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 20 },
            { id: 'voice-stat', value: 45 * 60 * 60 },
            { id: 'chat-stat', value: 1000 },
            { id: 'invite-stat', value: 45 }
        ],
        invite: [
            { id: 'invite-stat', value: 110 },
            { id: 'voice-stat', value: 45 * 60 * 60 },
            { id: 'chat-stat', value: 1000 }
        ],
        authRoles: ['1088137351336820796', '1088137063297208321', '1088137066451308628', '1088097103202496602', '1088093595254390904', '1088093691698229298', '1088136876973629491', '1088093780122542141', '1088136883046977647', '1088136880064839750', '1088136886134001724', '1088136976093413466', '1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 2,
        roleId: '1088137351336820796',//THE ANUBIS
        public: [
            { id: 'voice-stat', value: 95 * 60 * 60 },
            { id: 'chat-stat', value: 950 },
            { id: 'invite-stat', value: 40 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 95 * 60 * 60 },
            { id: 'chat-stat', value: 950 },
            { id: 'invite-stat', value: 40 }
        ],
        chat: [
            { id: 'chat-stat', value: 7500 },
            { id: 'invite-stat', value: 40 },
            { id: 'voice-stat', value: 40 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 120 },
            { id: 'invite-stat', value: 80 },
            { id: 'voice-stat', value: 80 * 60 * 60 },
            { id: 'chat-stat', value: 950 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 19 },
            { id: 'voice-stat', value: 40 * 60 * 60 },
            { id: 'chat-stat', value: 950 },
            { id: 'invite-stat', value: 40 }
        ],
        invite: [
            { id: 'invite-stat', value: 105 },
            { id: 'voice-stat', value: 40 * 60 * 60 },
            { id: 'chat-stat', value: 950 }
        ],
        authRoles: ['1088137063297208321', '1088137066451308628', '1088097103202496602', '1088093595254390904', '1088093691698229298', '1088136876973629491', '1088093780122542141', '1088136883046977647', '1088136880064839750', '1088136886134001724', '1088136976093413466', '1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 3,
        roleId: '1088137063297208321',//GODS OF ANUBIS
        public: [
            { id: 'voice-stat', value: 90 * 60 * 60 },
            { id: 'chat-stat', value: 900 },
            { id: 'invite-stat', value: 38 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 90 * 60 * 60 },
            { id: 'chat-stat', value: 900 },
            { id: 'invite-stat', value: 38 }
        ],
        chat: [
            { id: 'chat-stat', value: 7000 },
            { id: 'invite-stat', value: 38 },
            { id: 'voice-stat', value: 38 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 115 },
            { id: 'invite-stat', value: 75 },
            { id: 'voice-stat', value: 38 * 60 * 60 },
            { id: 'chat-stat', value: 900 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 18 },
            { id: 'voice-stat', value: 38 * 60 * 60 },
            { id: 'chat-stat', value: 900 },
            { id: 'invite-stat', value: 38 }
        ],
        invite: [
            { id: 'invite-stat', value: 100 },
            { id: 'voice-stat', value: 38 * 60 * 60 },
            { id: 'chat-stat', value: 900 }
        ],
        authRoles: ['1088093780122542141', '1088136883046977647', '1088136880064839750', '1088136886134001724', '1088136976093413466', '1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 4,
        roleId: '1088137066451308628',//MAJESTY OF ANUBIS
        public: [
            { id: 'voice-stat', value: 85 * 60 * 60 },
            { id: 'chat-stat', value: 850 },
            { id: 'invite-stat', value: 35 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 85 * 60 * 60 },
            { id: 'chat-stat', value: 850 },
            { id: 'invite-stat', value: 35 }
        ],
        chat: [
            { id: 'chat-stat', value: 6500 },
            { id: 'invite-stat', value: 35 },
            { id: 'voice-stat', value: 35 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 110 },
            { id: 'invite-stat', value: 70 },
            { id: 'voice-stat', value: 35 * 60 * 60 },
            { id: 'chat-stat', value: 850 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 17 },
            { id: 'voice-stat', value: 35 * 60 * 60 },
            { id: 'chat-stat', value: 850 },
            { id: 'invite-stat', value: 35 }
        ],
        invite: [
            { id: 'invite-stat', value: 95 },
            { id: 'voice-stat', value: 35 * 60 * 60 },
            { id: 'chat-stat', value: 850 }
        ],
        authRoles: ['1088093780122542141', '1088136883046977647', '1088136880064839750', '1088136886134001724', '1088136976093413466', '1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 5,
        roleId: '1088097103202496602',//Owner of Anubis
        public: [
            { id: 'voice-stat', value: 80 * 60 * 60 },
            { id: 'chat-stat', value: 800 },
            { id: 'invite-stat', value: 33 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 80 * 60 * 60 },
            { id: 'chat-stat', value: 800 },
            { id: 'invite-stat', value: 33 }
        ],
        chat: [
            { id: 'chat-stat', value: 6000 },
            { id: 'invite-stat', value: 33 },
            { id: 'voice-stat', value: 33 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 105 },
            { id: 'invite-stat', value: 65 },
            { id: 'voice-stat', value: 33 * 60 * 60 },
            { id: 'chat-stat', value: 800 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 16 },
            { id: 'voice-stat', value: 33 * 60 * 60 },
            { id: 'chat-stat', value: 800 },
            { id: 'invite-stat', value: 33 }
        ],
        invite: [
            { id: 'invite-stat', value: 90 },
            { id: 'voice-stat', value: 33 * 60 * 60 },
            { id: 'chat-stat', value: 800 }
        ],
        authRoles: ['1088093780122542141', '1088136883046977647', '1088136880064839750', '1088136886134001724', '1088136976093413466', '1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 6,
        roleId: '1088093595254390904',//Emperor of Anubis
        public: [
            { id: 'voice-stat', value: 75 * 60 * 60 },
            { id: 'chat-stat', value: 750 },
            { id: 'invite-stat', value: 30 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 75 * 60 * 60 },
            { id: 'chat-stat', value: 750 },
            { id: 'invite-stat', value: 30 }
        ],
        chat: [
            { id: 'chat-stat', value: 5500 },
            { id: 'invite-stat', value: 30 },
            { id: 'voice-stat', value: 30 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 100 },
            { id: 'invite-stat', value: 60 },
            { id: 'voice-stat', value: 30 * 60 * 60 },
            { id: 'chat-stat', value: 750 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 15 },
            { id: 'voice-stat', value: 30 * 60 * 60 },
            { id: 'chat-stat', value: 750 },
            { id: 'invite-stat', value: 30 }
        ],
        invite: [
            { id: 'invite-stat', value: 85 },
            { id: 'voice-stat', value: 30 * 60 * 60 },
            { id: 'chat-stat', value: 750 }
        ],
        authRoles: ['1088136886134001724', '1088136976093413466', '1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 7,
        roleId: '1088093691698229298',//King of Anubis
        public: [
            { id: 'voice-stat', value: 70 * 60 * 60 },
            { id: 'chat-stat', value: 700 },
            { id: 'invite-stat', value: 28 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 70 * 60 * 60 },
            { id: 'chat-stat', value: 700 },
            { id: 'invite-stat', value: 28 }
        ],
        chat: [
            { id: 'chat-stat', value: 5000 },
            { id: 'invite-stat', value: 28 },
            { id: 'voice-stat', value: 28 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 95 },
            { id: 'invite-stat', value: 55 },
            { id: 'voice-stat', value: 28 * 60 * 60 },
            { id: 'chat-stat', value: 700 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 14 },
            { id: 'voice-stat', value: 28 * 60 * 60 },
            { id: 'chat-stat', value: 700 },
            { id: 'invite-stat', value: 28 }
        ],
        invite: [
            { id: 'invite-stat', value: 80 },
            { id: 'voice-stat', value: 28 * 60 * 60 },
            { id: 'chat-stat', value: 700 }
        ],
        authRoles: ['1088136886134001724', '1088136976093413466', '1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 8,
        roleId: '1088136876973629491',//Hestia of Anubis
        public: [
            { id: 'voice-stat', value: 65 * 60 * 60 },
            { id: 'chat-stat', value: 650 },
            { id: 'invite-stat', value: 25 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 65 * 60 * 60 },
            { id: 'chat-stat', value: 650 },
            { id: 'invite-stat', value: 25 }
        ],
        chat: [
            { id: 'chat-stat', value: 5000 },
            { id: 'invite-stat', value: 25 },
            { id: 'voice-stat', value: 25 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 90 },
            { id: 'invite-stat', value: 50 },
            { id: 'voice-stat', value: 25 * 60 * 60 },
            { id: 'chat-stat', value: 650 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 13 },
            { id: 'voice-stat', value: 25 * 60 * 60 },
            { id: 'chat-stat', value: 650 },
            { id: 'invite-stat', value: 25 }
        ],
        invite: [
            { id: 'invite-stat', value: 75 },
            { id: 'voice-stat', value: 25 * 60 * 60 },
            { id: 'chat-stat', value: 650 }
        ],
        authRoles: ['1088136976093413466', '1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 9,
        roleId: '1088093780122542141',//Mithra of Anubis
        public: [
            { id: 'voice-stat', value: 60 * 60 * 60 },
            { id: 'chat-stat', value: 600 },
            { id: 'invite-stat', value: 23 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 60 * 60 * 60 },
            { id: 'chat-stat', value: 600 },
            { id: 'invite-stat', value: 23 }
        ],
        chat: [
            { id: 'chat-stat', value: 4500 },
            { id: 'invite-stat', value: 23 },
            { id: 'voice-stat', value: 23 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 85 },
            { id: 'invite-stat', value: 45 },
            { id: 'voice-stat', value: 23 * 60 * 60 },
            { id: 'chat-stat', value: 600 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 12 },
            { id: 'voice-stat', value: 23 * 60 * 60 },
            { id: 'chat-stat', value: 600 },
            { id: 'invite-stat', value: 23 }
        ],
        invite: [
            { id: 'invite-stat', value: 70 },
            { id: 'voice-stat', value: 23 * 60 * 60 },
            { id: 'chat-stat', value: 600 }
        ],
        authRoles: ['1088136976093413466', '1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 10,
        roleId: '1088136883046977647',//Methis of Anubis
        public: [
            { id: 'voice-stat', value: 55 * 60 * 60 },
            { id: 'chat-stat', value: 500 },
            { id: 'invite-stat', value: 20 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 55 * 60 * 60 },
            { id: 'chat-stat', value: 550 },
            { id: 'invite-stat', value: 20 }
        ],
        chat: [
            { id: 'chat-stat', value: 4000 },
            { id: 'invite-stat', value: 20 },
            { id: 'voice-stat', value: 20 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 80 },
            { id: 'invite-stat', value: 40 },
            { id: 'voice-stat', value: 20 * 60 * 60 },
            { id: 'chat-stat', value: 550 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 11 },
            { id: 'voice-stat', value: 20 * 60 * 60 },
            { id: 'chat-stat', value: 550 },
            { id: 'invite-stat', value: 20 }
        ],
        invite: [
            { id: 'invite-stat', value: 65 },
            { id: 'voice-stat', value: 20 * 60 * 60 },
            { id: 'chat-stat', value: 550 }
        ],
        authRoles: ['1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 11,
        roleId: '1088136880064839750',//Minerva of Anubis
        public: [
            { id: 'voice-stat', value: 50 * 60 * 60 },
            { id: 'chat-stat', value: 450 },
            { id: 'invite-stat', value: 18 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 50 * 60 * 60 },
            { id: 'chat-stat', value: 500 },
            { id: 'invite-stat', value: 18 }
        ],
        chat: [
            { id: 'chat-stat', value: 3500 },
            { id: 'invite-stat', value: 18 },
            { id: 'voice-stat', value: 18 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 75 },
            { id: 'invite-stat', value: 35 },
            { id: 'voice-stat', value: 18 * 60 * 60 },
            { id: 'chat-stat', value: 500 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 10 },
            { id: 'voice-stat', value: 18 * 60 * 60 },
            { id: 'chat-stat', value: 500 },
            { id: 'invite-stat', value: 18 }
        ],
        invite: [
            { id: 'invite-stat', value: 60 },
            { id: 'voice-stat', value: 18 * 60 * 60 },
            { id: 'chat-stat', value: 500 }
        ],
        authRoles: ['1088136972817661984', '1088136970217209978', '1088136966744322189']
    },
    {
        id: 12,
        roleId: '1088136886134001724',//Belenus of Anubis
        public: [
            { id: 'voice-stat', value: 45 * 60 * 60 },
            { id: 'chat-stat', value: 450 },
            { id: 'invite-stat', value: 15 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 45 * 60 * 60 },
            { id: 'chat-stat', value: 450 },
            { id: 'invite-stat', value: 15 }
        ],
        chat: [
            { id: 'chat-stat', value: 3000 },
            { id: 'invite-stat', value: 15 },
            { id: 'voice-stat', value: 15 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 70 },
            { id: 'invite-stat', value: 30 },
            { id: 'voice-stat', value: 15 * 60 * 60 },
            { id: 'chat-stat', value: 450 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 9 },
            { id: 'voice-stat', value: 15 * 60 * 60 },
            { id: 'chat-stat', value: 450 },
            { id: 'invite-stat', value: 15 }
        ],
        invite: [
            { id: 'invite-stat', value: 55 },
            { id: 'voice-stat', value: 15 * 60 * 60 },
            { id: 'chat-stat', value: 450 }
        ],
        authRoles: ['1088136970217209978', '1088136966744322189']
    },
    {
        id: 13,
        roleId: '1088136976093413466',//Belisama of Anubis
        public: [
            { id: 'voice-stat', value: 40 * 60 * 60 },
            { id: 'chat-stat', value: 400 },
            { id: 'invite-stat', value: 12 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 40 * 60 * 60 },
            { id: 'chat-stat', value: 400 },
            { id: 'invite-stat', value: 12 }
        ],
        chat: [
            { id: 'chat-stat', value: 2500 },
            { id: 'invite-stat', value: 12 },
            { id: 'voice-stat', value: 12 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 65 },
            { id: 'invite-stat', value: 25 },
            { id: 'voice-stat', value: 12 * 60 * 60 },
            { id: 'chat-stat', value: 400 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 8 },
            { id: 'voice-stat', value: 12 * 60 * 60 },
            { id: 'chat-stat', value: 400 },
            { id: 'invite-stat', value: 12 }
        ],
        invite: [
            { id: 'invite-stat', value: 50 },
            { id: 'voice-stat', value: 12 * 60 * 60 },
            { id: 'chat-stat', value: 400 }
        ],
        authRoles: ['1088136970217209978', '1088136966744322189']
    },
    {
        id: 14,
        roleId: '1088136972817661984',//Freya of Anubis
        public: [
            { id: 'voice-stat', value: 35 * 60 * 60 },
            { id: 'chat-stat', value: 350 },
            { id: 'invite-stat', value: 10 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 35 * 60 * 60 },
            { id: 'chat-stat', value: 350 },
            { id: 'invite-stat', value: 10 }
        ],
        chat: [
            { id: 'chat-stat', value: 2000 },
            { id: 'invite-stat', value: 10 },
            { id: 'voice-stat', value: 10 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 60 },
            { id: 'invite-stat', value: 20 },
            { id: 'voice-stat', value: 10 * 60 * 60 },
            { id: 'chat-stat', value: 350 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 7 },
            { id: 'voice-stat', value: 10 * 60 * 60 },
            { id: 'chat-stat', value: 350 },
            { id: 'invite-stat', value: 10 }
        ],
        invite: [
            { id: 'invite-stat', value: 45 },
            { id: 'voice-stat', value: 10 * 60 * 60 },
            { id: 'chat-stat', value: 350 }
        ],
        authRoles: ['1088136966744322189']
    },
    {
        id: 15,
        roleId: '1088136970217209978',//Sedna of Anubis
        public: [
            { id: 'voice-stat', value: 30 * 60 * 60 },
            { id: 'chat-stat', value: 300 },
            { id: 'invite-stat', value: 8 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 30 * 60 * 60 },
            { id: 'chat-stat', value: 300 },
            { id: 'invite-stat', value: 8 }
        ],
        chat: [
            { id: 'chat-stat', value: 1500 },
            { id: 'invite-stat', value: 8 },
            { id: 'voice-stat', value: 8 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 55 },
            { id: 'invite-stat', value: 15 },
            { id: 'voice-stat', value: 8 * 60 * 60 },
            { id: 'chat-stat', value: 300 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 6 },
            { id: 'voice-stat', value: 8 * 60 * 60 },
            { id: 'chat-stat', value: 300 },
            { id: 'invite-stat', value: 8 }
        ],
        invite: [
            { id: 'invite-stat', value: 40 },
            { id: 'voice-stat', value: 8 * 60 * 60 },
            { id: 'chat-stat', value: 300 }
        ],
        authRoles: ['1088136966744322189']
    },
    {
        id: 16,
        roleId: '1088136966744322189',//Rytia of Anubis
        public: [
            { id: 'voice-stat', value: 25 * 60 * 60 },
            { id: 'chat-stat', value: 250 },
            { id: 'invite-stat', value: 5 }
        ],
        streamer: [
            { id: 'streamer-stat', value: 25 * 60 * 60 },
            { id: 'chat-stat', value: 250 },
            { id: 'invite-stat', value: 5 }
        ],
        chat: [
            { id: 'chat-stat', value: 1000 },
            { id: 'invite-stat', value: 5 },
            { id: 'voice-stat', value: 5 * 60 * 60 }
        ],
        register: [
            { id: 'register-stat', value: 50 },
            { id: 'invite-stat', value: 10 },
            { id: 'voice-stat', value: 5 * 60 * 60 },
            { id: 'chat-stat', value: 250 }
        ],
        recruitment: [
            { id: 'recruitment-stat', value: 5 },
            { id: 'voice-stat', value: 5 * 60 * 60 },
            { id: 'chat-stat', value: 250 },
            { id: 'invite-stat', value: 5 }
        ],
        invite: [
            { id: 'invite-stat', value: 35 },
            { id: 'voice-stat', value: 5 * 60 * 60 },
            { id: 'chat-stat', value: 250 }
        ],
        authRoles: ['1088136966744322189']
    }
]

module.exports.responsibilities = [
    {
        type: 'public',
        authRole: "1092060001553629214",//public lideri
        roleId: '1092060062094204958',//public sorumlusu
        channels: [],//sorumluluk yeri
    },
    {
        type: 'streamer',
        authRole: "1090769125145591919",//streamer lideri
        roleId: '1090769019306528858',//streamer sorumlusu
        channels: [],//sorumluluk yeri
    },
    {
        type: 'chat',
        authRole: "1092906017492324353",//chat lideri
        roleId: '1092906144898498572',//chat sorumlusu
        channels: ["1087325732985913374"],//sorumluluk yeri
    },
    {
        type: 'register',
        authRole: "1092012031890165870",//kayıt lideri
        roleId: '1088810631131578439',//kayıt sorumlusu
        channels: [],//sorumluluk yeri
    },
    {
        type: 'recruitment',
        authRole: "1090782217422250066",//yetkili lideri
        roleId: '1090782277304340550',//yetkili sorumlusu
        channels: [],//sorumluluk yeri
    },
    {
        type: 'invite',
        authRole: "1092906283927085076",//invite lideri
        roleId: '1096809199788359680',//invite sorumlusu
        channels: [],//sorumluluk yeri
    }
]