const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');
const { getLocale } = require('../localization');

module.exports = {
    name: 'list',
    description: 'List servers, select your emoji and add it to your server',
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

            // Komutun kullanıldığı sunucunun emoji sistemi ayarını kontrol et
            db.get(`SELECT emoji_system_enabled FROM guild_settings WHERE guild_id = ?`, [guildId], async (err, row) => {
                if (err) {
                    console.error(err);
                    return message.reply(locale.database.error);
                }

                if (!row || !row.emoji_system_enabled) {
                    return message.reply(locale.liste.emojiSystemNotEnabled);
                }

                // Emoji sistemi açık olan sunucuları veritabanından alın
                db.all(`SELECT guild_id FROM guild_settings WHERE emoji_system_enabled = 1`, async (err, rows) => {
                    if (err) {
                        console.error(err);
                        return message.reply(locale.database.error);
                    }

                    const enabledGuildIds = rows.map(row => row.guild_id);

                    // Yalnızca emoji sistemi açık olan sunucuları listele
                    const guilds = message.client.guilds.cache
                        .filter(guild => guild.id !== guildId && enabledGuildIds.includes(guild.id)) // Komut yazılan sunucuyu hariç tut ve emoji sistemi açık olanları dahil et
                        .map(guild => ({
                            label: guild.name,
                            value: guild.id,
                            description: locale.liste.guildDescription
                                .replace('{{total}}', guild.emojis.cache.size)
                                .replace('{{animated}}', guild.emojis.cache.filter(e => e.animated).size)
                                .replace('{{static}}', guild.emojis.cache.filter(e => !e.animated).size)
                        }));

                    const pages = [];
                    for (let i = 0; i < guilds.length; i += 25) {
                        pages.push(guilds.slice(i, i + 25));
                    }

                    let currentPage = 0;
                    const createSelectMenuRow = () => {
                        const selectMenu = new StringSelectMenuBuilder()
                            .setCustomId('select-guild')
                            .setPlaceholder(locale.liste.selectGuildPlaceholder)
                            .addOptions(pages[currentPage]); // Mevcut sayfadan 25 sunucu

                        return new ActionRowBuilder().addComponents(selectMenu);
                    };

                    const embed = new EmbedBuilder()
                        .setTitle(locale.liste.guilds)
                        .setDescription(locale.liste.selectGuildDescription)
                        .addFields(pages[currentPage].map(guild => ({
                            name: guild.label,
                            value: guild.description,
                            inline: true
                        })));

                    message.reply({ embeds: [embed], components: [createSelectMenuRow()] }).then(msg => {
                        const filter = (interaction) => interaction.customId === 'select-guild' && interaction.user.id === message.author.id;
                        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                        collector.on('collect', async (interaction) => {
                            const selectedGuildId = interaction.values[0];
                            const guild = message.client.guilds.cache.get(selectedGuildId);

                            if (!guild) {
                                return interaction.reply({ content: locale.liste.guildNotAccessible, ephemeral: true });
                            }

                            // Seçilen sunucuya kaç emoji eklendiğini kontrol et
                            db.get(`SELECT COUNT(*) as count FROM emoji_transfers WHERE target_guild_id = ?`, [selectedGuildId], async (err, result) => {
                                if (err) {
                                    console.error(err);
                                    return interaction.reply({ content: locale.database.error, ephemeral: true });
                                }

                                const emojisTransferred = result ? result.count : 0;

                                const emojis = guild.emojis.cache.map(emoji => ({
                                    label: emoji.name,
                                    value: emoji.id,
                                    description: `${emoji} (${emoji.name})`
                                }));

                                if (emojis.length === 0) {
                                    await interaction.reply({ content: locale.liste.noEmojis, ephemeral: true });
                                    return interaction.message.edit({ embeds: [embed], components: [createSelectMenuRow()] }); // Listeye geri dön
                                }

                                const emojiPages = [];
                                for (let i = 0; i < emojis.length; i += 25) {
                                    emojiPages.push(emojis.slice(i, i + 25));
                                }

                                let currentEmojiPage = 0;

                                const createEmojiMenuRow = () => {
                                    const emojiMenu = new StringSelectMenuBuilder()
                                        .setCustomId('select-emoji')
                                        .setPlaceholder(locale.liste.selectEmojiPlaceholder)
                                        .addOptions(emojiPages[currentEmojiPage]); // Mevcut sayfadan 25 emoji

                                    return new ActionRowBuilder().addComponents(emojiMenu);
                                };

                                const backButton = new ButtonBuilder()
                                    .setCustomId('back-to-guilds')
                                    .setLabel(locale.liste.selectGuildButton)
                                    .setStyle('Secondary');

                                const emojiEmbed = new EmbedBuilder()
                                    .setTitle(locale.liste.guildEmojisTitle.replace('{{guildName}}', guild.name))
                                    .setDescription(locale.liste.guildEmojisDescription.replace('{{emojisTransferred}}', emojisTransferred))
                                    .setThumbnail(guild.iconURL()) // Sunucunun profil resmini ekle
                                    .addFields(emojiPages[currentEmojiPage].map(emoji => ({
                                        name: emoji.label,
                                        value: emoji.description,
                                        inline: true
                                    })));

                                await interaction.update({ embeds: [emojiEmbed], components: [createEmojiMenuRow(), new ActionRowBuilder().addComponents(backButton)] });

                                const emojiFilter = (i) => i.customId === 'select-emoji' && i.user.id === message.author.id;
                                const emojiCollector = interaction.message.createMessageComponentCollector({ filter: emojiFilter, time: 60000 });

                                emojiCollector.on('collect', async (emojiInteraction) => {
                                    const selectedEmojiId = emojiInteraction.values[0];
                                    const selectedEmoji = guild.emojis.cache.get(selectedEmojiId);

                                    if (!selectedEmoji) {
                                        return emojiInteraction.reply({ content: locale.liste.emojiNotFound, ephemeral: true });
                                    }

                                    // Sunucuda aynı isimde bir emoji var mı kontrol et
                                    const existingEmoji = message.guild.emojis.cache.find(e => e.name === selectedEmoji.name);
                                    if (existingEmoji) {
                                        return emojiInteraction.reply({ content: locale.liste.emojiAlreadyExists.replace('{{emojiName}}', selectedEmoji.name), ephemeral: true });
                                    }

                                    // Seçilen emojiyi sunucuya ekle
                                    try {
                                        const emojiURL = selectedEmoji.url || selectedEmoji.imageURL();
                                        const newEmoji = await message.guild.emojis.create({ attachment: emojiURL, name: selectedEmoji.name });

                                        // Emoji transfer kaydı ekleyin
                                        db.run(`INSERT INTO emoji_transfers (source_guild_id, target_guild_id, emoji_id) VALUES (?, ?, ?)`, [selectedGuildId, guildId, selectedEmojiId], (err) => {
                                            if (err) {
                                                console.error(err);
                                            }
                                        });

                                        await emojiInteraction.update({ content: locale.liste.emojiAdded.replace('{{selectedEmoji}}', selectedEmoji).replace('{{selectedEmojiName}}', selectedEmoji.name).replace('{{newEmoji}}', newEmoji), components: [] });
                                    } catch (error) {
                                        console.error(error);
                                        await emojiInteraction.reply({ content: locale.liste.emojiAddError, ephemeral: true });
                                    }
                                });

                                const backFilter = (i) => i.customId === 'back-to-guilds' && i.user.id === message.author.id;
                                const backCollector = interaction.message.createMessageComponentCollector({ filter: backFilter, time: 60000 });

                                backCollector.on('collect', async (backInteraction) => {
                                    await backInteraction.update({ embeds: [embed], components: [createSelectMenuRow()] });
                                });
                            });
                        });

                        collector.on('end', collected => {
                            if (collected.size === 0) {
                                msg.edit({ content: locale.liste.timeout, components: [] });
                            }
                        });
                    });
                });
            });
        });
    }
};
