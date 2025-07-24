const fs = require('fs');
const path = require('path');
const { WAConnection } = require('@adiwajshing/baileys');
const { LocalAuth } = require('whatsapp-web.js');

class SessionManager {
    constructor() {
        this.sessionPath = path.join(__dirname, '../.wwebjs_auth/session.json');
        this.baileysSessionPath = path.join(__dirname, '../.baileys_auth/session.json');
    }

    async saveWWebJSSession(sessionData) {
        fs.mkdirSync(path.dirname(this.sessionPath), { recursive: true });
        fs.writeFileSync(this.sessionPath, JSON.stringify(sessionData));
    }

    async getWWebJSSession() {
        if (fs.existsSync(this.sessionPath)) {
            return JSON.parse(fs.readFileSync(this.sessionPath));
        }
        return null;
    }

    async saveBaileysSession(sessionData) {
        fs.mkdirSync(path.dirname(this.baileysSessionPath), { recursive: true });
        fs.writeFileSync(this.baileysSessionPath, JSON.stringify(sessionData));
    }

    async getBaileysConnection() {
        const baileysConn = new WAConnection();
        
        // Configure Baileys
        baileysConn.version = [3, 3234, 9]; // WhatsApp version
        baileysConn.autoReconnect = true;
        baileysConn.connectOptions = {
            maxRetries: 3,
            delayReconnectMs: 1000
        };

        // Load session if exists
        if (fs.existsSync(this.baileysSessionPath)) {
            const session = JSON.parse(fs.readFileSync(this.baileysSessionPath));
            baileysConn.loadAuthInfo(session);
        }

        // Event handlers
        baileysConn.on('qr', qr => {
            console.log('Scan this QR with your phone:');
            require('qrcode-terminal').generate(qr, { small: true });
        });

        baileysConn.on('open', () => {
            console.log('✓ Baileys connected');
            this.saveBaileysSession(baileysConn.base64EncodedAuthInfo());
        });

        return baileysConn;
    }
}

module.exports = new SessionManager();