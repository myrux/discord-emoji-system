const { EmbedBuilder } = require('discord.js');
const db = require('../database'); // Include the database module

module.exports = {
    name: 'botinfo',
    description: 'Displays information about the bot.',
    async execute(message) {
        const { client } = message;
        const owner = await client.users.fetch('1239245942452912281'); // Replace with the bot owner's ID

        // SQL query to get the number of servers with the emoji system enabled
        db.get('SELECT COUNT(*) AS count FROM guild_settings WHERE emoji_system_enabled = 1', async (err, row) => {
            if (err) {
                console.error(err);
                return message.reply('Database error.');
            }

            const activeEmojiSystemGuilds = row.count;

            const embed = new EmbedBuilder()
                .setTitle('Bot Information')
                .setColor('#0099ff')
                .addFields(
                    { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
                    { name: 'Server Count', value: `${client.guilds.cache.size}`, inline: true },
                    { name: 'User Count', value: `${client.users.cache.size}`, inline: true },
                    { name: 'Bot Owner', value: `${owner.tag}`, inline: true },
                    { name: 'Bot Uptime', value: `${Math.floor(client.uptime / (1000 * 60 * 60))} hours ${Math.floor((client.uptime / (1000 * 60)) % 60)} minutes`, inline: true },
                    { name: 'Servers with Emoji System Enabled', value: `${activeEmojiSystemGuilds}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.reply({ embeds: [embed] });
        });
    }
};
