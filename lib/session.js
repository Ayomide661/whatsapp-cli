const fs = require('fs');
const path = require('path');

module.exports = {
    saveSession: (conn) => {
        const sessionPath = path.join(__dirname, '../.baileys_auth/session.json');
        fs.mkdirSync(path.dirname(sessionPath), { recursive: true });
        fs.writeFileSync(sessionPath, JSON.stringify(conn.base64EncodedAuthInfo()));
    },

    loadSession: () => {
        const sessionPath = path.join(__dirname, '../.baileys_auth/session.json');
        if (fs.existsSync(sessionPath)) {
            return JSON.parse(fs.readFileSync(sessionPath));
        }
        return null;
    }
};