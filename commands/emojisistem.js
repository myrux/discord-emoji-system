const db = require('../database');
const { getLocale } = require('../localization');

module.exports = {
    name: 'emojisystem',
    aliases: ['emojisistem'], 
    description: 'Turns the emoji system on or off',
    async execute(message, args) {
        const guildId = message.guild.id;

        db.get(`SELECT language FROM guild_settings WHERE guild_id = ?`, [guildId], async (err, row) => {
            if (err) {
                console.error(err);
                return message.reply('Database error.');
            }

            const language = row ? row.language : 'en';
            const locale = getLocale(language);

            if (!locale) return message.reply('Language file could not be loaded.');

            db.get(`SELECT emoji_system_enabled FROM guild_settings WHERE guild_id = ?`, [guildId], (err, row) => {
                if (err) {
                    console.error(err);
                    return message.reply(locale.database.error);
                }

                if (!row) {
                    db.run(`INSERT INTO guild_settings (guild_id, emoji_system_enabled) VALUES (?, ?)`, [guildId, 1], err => {
                        if (err) {
                            console.error(err);
                            return message.reply(locale.database.error);
                        }
                        return message.reply(locale.emoji_system_enabled);
                    });
                } else {
                    const newStatus = row.emoji_system_enabled ? 0 : 1;
                    db.run(`UPDATE guild_settings SET emoji_system_enabled = ? WHERE guild_id = ?`, [newStatus, guildId], err => {
                        if (err) {
                            console.error(err);
                            return message.reply(locale.database.error);
                        }
                        const status = newStatus ? locale.emoji_system_enabled : locale.emoji_system_disabled;
                        return message.reply(status);
                    });
                }
            });
        });
    }
};
