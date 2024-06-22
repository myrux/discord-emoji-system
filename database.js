const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        emoji_system_enabled INTEGER,
        language TEXT DEFAULT 'en'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS emoji_transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_guild_id TEXT NOT NULL,
        target_guild_id TEXT NOT NULL,
        emoji_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;
