const db = require('../database'); // database modülünü dahil edin
const locales = {
    en: require('../locales/en.json'),
    tr: require('../locales/tr.json')
};

module.exports = {
    name: 'language',
    description: 'Sets the bot\'s language',
    execute(message, args) {
        const guildId = message.guild.id;
        const language = args[0];

        if (!language || !locales[language]) {
            return message.reply('Lütfen geçerli bir dil girin: en veya tr');
        }

        db.run(`UPDATE guild_settings SET language = ? WHERE guild_id = ?`, [language, guildId], function(err) {
            if (err) {
                console.error(err);
                return message.reply(locales['en'].database_error);  // Varsayılan olarak İngilizce hata mesajı
            }

            const locale = locales[language];
            message.reply(locale.language_set);
        });
    }
};
