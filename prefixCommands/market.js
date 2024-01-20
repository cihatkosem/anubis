const { ButtonBuilder, ButtonStyle, ActionRowBuilder, Colors } = require("discord.js");
const config = require("../config");
const { marketModel } = require("../models");

module.exports = {
    id: 'market',
    names: ["market"],
    permission: 'dependent',
    description: 'Market komutudur.',
    run: async (client, command, message, args) => {
        const listItemsButton = new ButtonBuilder().setCustomId('market-list_items').setLabel('📦 Ürünleri Listele').setStyle(ButtonStyle.Primary);
        const addItemButton = new ButtonBuilder().setCustomId('market-add_item').setLabel('➕ Ürün Ekle').setStyle(ButtonStyle.Success);
        const removeItemButton = new ButtonBuilder().setCustomId('market-remove_item').setLabel('➖ Ürün Sil').setStyle(ButtonStyle.Danger);
        let ActionRow = new ActionRowBuilder().addComponents(listItemsButton);

        if (config.admins.includes(message.author.id))
            ActionRow = new ActionRowBuilder().addComponents(listItemsButton, addItemButton, removeItemButton);

        const items = await marketModel.find();

        const embed = {
            color: Colors.White,
            title: 'Market',
            description: 
                `\`📦\` Marketteki ürün sayısı: \`${items.length || 0}\` \n` +
                `\`📄\` Marketteki ürünleri yanlızca doğrulanmış bakiyeniz ile satın alabilirsiniz. \n` +
                `\`📄\` Ürünleri listelemek için \`📦 Ürünleri Listele\` butonuna tıklayınız. \n` +
                `\`📄\` Ürünler Listelendikten sonra satın almak için \`🛒\` butonuna basabilirsiniz.`
        }

        return message.reply({ embeds: [embed], components: [ActionRow] });
    }
}