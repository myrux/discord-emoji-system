const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const db = require("./database");
const locales = {
    en: require("./locales/en.json"),
    tr: require("./locales/tr.json"),
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
}

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log("Bot çalışmaya hazır.");
    updateActivity();
    setInterval(updateActivity, 60000); // 60 saniyede bir durumu güncelle
});

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(config.prefix) || message.author.bot)
        return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    const guildId = message.guild.id;

    db.get(
        `SELECT language FROM guild_settings WHERE guild_id = ?`,
        [guildId],
        (err, row) => {
            if (err) {
                console.error(err);
                return message.reply(locales["en"].database_error);
            }

            const language = row ? row.language : null;
            const locale = language ? locales[language] : locales["en"];

            if (!language) {
                return message.reply(locale.selectLanguage);
            }

            try {
                command.execute(message, args, locale);
            } catch (error) {
                console.error(
                    `Komut yürütülürken bir hata oluştu: ${commandName}`,
                    error,
                );
                message.reply(
                    locale.command.error.replace("{{error}}", error.message),
                );
            }
        },
    );
});

client.on("guildCreate", async (guild) => {
    const defaultLanguage = "en";
    db.run(
        `INSERT INTO guild_settings (guild_id, language) VALUES (?, ?)`,
        [guild.id, defaultLanguage],
        (err) => {
            if (err) {
                console.error(`Veritabanı hatası (guildCreate): ${err}`);
            } else {
                guild.systemChannel.send(
                    "Please set the bot language using the command: `!language [en|tr]`",
                );
            }
        },
    );

    // Bot sunucuya eklendiğinde log gönderme
    const logChannelId = "1253997194751508511";
    const channel = client.channels.cache.get(logChannelId);

    if (channel) {
        channel.send(
            `Bot has been added to ${guild.name}. Server ID: ${guild.id}`,
        );
    }
    console.log(
        `Bot has been added to ${guild.name}. Server ID: ${guild.id}`,
    );
});

client.on("guildDelete", async (guild) => {
    // Bot sunucudan çıkarıldığında log gönderme
    const logChannelId = "1253997232709963857";
    const channel = client.channels.cache.get(logChannelId);

    if (channel) {
        channel.send(
            `Bot has been removed from ${guild.name}. Server ID: ${guild.id}`,
        );
    }
    console.log(
        `Bot has been removed from ${guild.name}. Server ID: ${guild.id}`,
    );
});

client.login(config.token);

// Oynuyor kısmını güncelleyen işlev
const activities = [
    "!help",
    "",
    "",
    "",
    ""
];

function updateActivity() {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    client.user.setActivity(activity, { type: "PLAYING" });
}

