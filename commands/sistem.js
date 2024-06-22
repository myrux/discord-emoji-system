const { EmbedBuilder } = require('discord.js');
const db = require('../database');
const { getLocale } = require('../localization');

module.exports = {
    name: 'system',
    aliases: ['sistem'], 
    description: 'Shows emoji system status and emoji transfer information',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Kullanıcının dilini belirleyin
        db.get(`SELECT language FROM guild_settings WHERE guild_id = ?`, [guildId], async (err, row) => {
            if (err) {
                console.error(err);
                return message.reply('Veritabanı hatası.');
            }

            const language = row ? row.language : 'en';
            const locale = getLocale(language);

            if (!locale) return message.reply('Dil dosyası yüklenemedi.');

            // Sunucunun emoji sistemi durumunu veritabanından kontrol et
            db.get(`SELECT emoji_system_enabled FROM guild_settings WHERE guild_id = ?`, [guildId], async (err, row) => {
                if (err) {
                    console.error(err);
                    return message.reply(locale.database.error);
                }

                const emojiSystemEnabled = row ? row.emoji_system_enabled : false;

                // Bu sunucudan diğer sunuculara kaç emoji eklendiğini kontrol et
                db.get(`SELECT COUNT(*) as count FROM emoji_transfers WHERE source_guild_id = ?`, [guildId], (err, resultFrom) => {
                    if (err) {
                        console.error(err);
                        return message.reply(locale.database.error);
                    }

                    const emojisSent = resultFrom ? resultFrom.count : 0;

                    // Diğer sunuculardan bu sunucuya kaç emoji eklendiğini kontrol et
                    db.get(`SELECT COUNT(*) as count FROM emoji_transfers WHERE target_guild_id = ?`, [guildId], (err, resultTo) => {
                        if (err) {
                            console.error(err);
                            return message.reply(locale.database.error);
                        }

                        const emojisReceived = resultTo ? resultTo.count : 0;

                        // Embed mesajını oluştur
                        const embed = new EmbedBuilder()
                            .setTitle(locale.emoji_system_status)
                            .setDescription(`${locale.server}: **${message.guild.name}**`)
                            .addFields(
                                { name: locale.emoji_system_status, value: emojiSystemEnabled ? locale.ss : loce.ss2, inline: true },
                                { name: locale.emojis_sent, value: `${emojisSent}`, inline: true },
                                { name: locale.emojis_received, value: `${emojisReceived}`, inline: true }
                            )
                            .setThumbnail(message.guild.iconURL());

                        message.reply({ embeds: [embed] });
                    });
                });
            });
        });
    }
};
