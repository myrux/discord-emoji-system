const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'invite',
    description: 'Provides the bot invite link and support server link.',
    execute(message, args, locale) {
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${message.client.user.id}&permissions=8&scope=bot%20applications.commands`;
        const supportServerLink = config.supportServerLink;

        const embed = new EmbedBuilder()
            .setTitle(locale.invite.title)
            .setDescription(locale.invite.description)
            .setColor('#0099ff');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(locale.invite.inviteButton)
                    .setURL(inviteLink)
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel(locale.invite.supportButton)
                    .setURL(supportServerLink)
                    .setStyle(ButtonStyle.Link),
            );

        message.reply({ embeds: [embed], components: [row] });
    },
};

