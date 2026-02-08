# 🎭 Discord Emoji Transfer Bot (v13)

[English](#english) | [Türkçe](#türkçe)

---

<a name="english"></a>
## 🇺🇸 English

A simple and useful Discord bot built with **Discord.js v13**. This bot allows you to easily browse emojis from other servers the bot is in and add them to your own server.

### 🌟 Features
* **Easy Transfer:** Copy emojis from one server to another seamlessly.
* **Toggle System:** Turn the emoji system on or off as needed.
* **Server Listing:** Browse servers and select specific emojis to add.
* **Status Check:** View the current system status and transfer logs.

### 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/username/project-name.git](https://github.com/username/project-name.git)
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configuration:**
    Open the `config.js` file and fill in your bot token and other necessary details.
    ```javascript
    // config.js example
    module.exports = {
        token: "YOUR_BOT_TOKEN_HERE",
        prefix: "!",
        ownerID: "YOUR_ID"
    }
    ```
4.  **Run the bot:**
    ```bash
    node index.js
    ```

### 💻 Commands

| Command | Description |
| :--- | :--- |
| `!emojisystem` | Turns the emoji system **ON** or **OFF**. |
| `!list` | Lists the available servers. From here, you can select and add emojis to your server. |
| `!system` | Shows the current status of the emoji system and transfer information. |

---

<a name="türkçe"></a>
## 🇹🇷 Türkçe

**Discord.js v13** altyapısı ile hazırlanmış, sunucular arası kolayca emoji transfer etmenizi sağlayan gelişmiş bir bot. Botun bulunduğu diğer sunuculardaki emojileri listeleyip kendi sunucunuza tek tıkla ekleyebilirsiniz.

### 🌟 Özellikler
* **Kolay Transfer:** İstediğiniz sunucudan emoji seçip kendi sunucunuza ekleyin.
* **Sistem Kontrolü:** Emoji sistemini istediğiniz zaman açıp kapatabilirsiniz.
* **Sunucu Listeleme:** Botun olduğu sunucuları ve emojileri listeleyin.
* **Durum Bilgisi:** Sistem durumu ve transfer bilgilerini görüntüleyin.

### 🛠️ Kurulum

1.  **Projeyi indirin:**
    ```bash
    git clone [https://github.com/kullaniciadi/proje-adi.git](https://github.com/kullaniciadi/proje-adi.git)
    ```
2.  **Gerekli modülleri yükleyin:**
    ```bash
    npm install
    ```
3.  **Ayarlamalar:**
    `config.js` dosyasını açın ve bot tokeniniz ile diğer bilgileri girin.
    ```javascript
    // config.js örneği
    module.exports = {
        token: "BOT_TOKENINIZ_BURAYA",
        prefix: "!",
        sahipID: "SIZIN_IDNIZ"
    }
    ```
4.  **Botu başlatın:**
    ```bash
    node index.js
    ```

### 💻 Komutlar

| Komut | Açıklama |
| :--- | :--- |
| `!emojisystem` | Emoji sistemini **AÇAR** veya **KAPATIR**. |
| `!list` | Sunucuları listeler. Buradan emojileri seçip sunucunuza ekleyebilirsiniz. |
| `!system` | Emoji sisteminin durumunu ve emoji transfer bilgilerini gösterir. |

---

Developed with ❤️ by [myruxx]
