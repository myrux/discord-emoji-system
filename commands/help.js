const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { getLocale } = require('../localization');

module.exports = {
    name: 'help',
    description: 'Shows the list of commands and their descriptions.',
    async execute(message, args) {
        const locale = getLocale('tr');
        if (!locale) return message.reply('Dil dosyası yüklenemedi.');

        const commands = Array.from(message.client.commands.values()).map(command => ({
            name: command.name,
            description: command.description || 'Açıklama bulunamadı.' // Varsayılan açıklama ekliyoruz
        }));

        const itemsPerPage = 5;
        const pages = [];

        for (let i = 0; i < commands.length; i += itemsPerPage) {
            pages.push(commands.slice(i, i + itemsPerPage));
        }

        let currentPage = 0;

        const createEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setTitle(locale.help.help_title || 'Yardım Menüsü')
                .setDescription(locale.help.help_description || 'Mevcut komutların listesi:')
                .setFooter({ text: `Sayfa ${page + 1} / ${pages.length}` });

            pages[page].forEach(command => {
                embed.addFields({ name: `\`${command.name}\``, value: command.description });
            });

            return embed;
        };

        const createButtons = () => {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel(locale.help.previous_page || 'Önceki Sayfa')
                    .setStyle('Primary')
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel(locale.help.next_page || 'Sonraki Sayfa')
                    .setStyle('Primary')
                    .setDisabled(currentPage === pages.length - 1)
            );
            return row;
        };

        const embedMessage = await message.reply({ embeds: [createEmbed(currentPage)], components: [createButtons()] });

        const collector = embedMessage.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', interaction => {
            if (interaction.user.id !== message.author.id) return;

            if (interaction.customId === 'previous') {
                currentPage--;
            } else if (interaction.customId === 'next') {
                currentPage++;
            }

            interaction.update({ embeds: [createEmbed(currentPage)], components: [createButtons()] });
        });

        collector.on('end', collected => {
            embedMessage.edit({ components: [] });
        });
    }
};
