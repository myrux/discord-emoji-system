const fs = require('fs');
const path = require('path');

module.exports = {
    getLocale: (locale) => {
        try {
            const localePath = path.join(__dirname, 'locales', `${locale}.json`);
            if (fs.existsSync(localePath)) {
                return JSON.parse(fs.readFileSync(localePath, 'utf8'));
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Locale file loading error: ${error}`);
            return null;
        }
    }
};
