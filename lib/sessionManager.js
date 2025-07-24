const fs = require('fs');
const path = require('path');
const { WAConnection } = require('@adiwajshing/baileys');
const { Client } = require('whatsapp-web.js');

class SessionManager {
    constructor() {
        this.sessionPath = path.join(__dirname, '../.wwebjs_auth/session.json');
    }

    async getWWebJSSession(client) {
        // Save whatsapp-web.js session
        const session = await client.getSession();
        fs.writeFileSync(this.sessionPath, JSON.stringify(session));
        return session;
    }

    async getBaileysConnection() {
        const baileysConn = new WAConnection();
        
        // Load session if exists
        if (fs.existsSync(this.sessionPath)) {
            const session = JSON.parse(fs.readFileSync(this.sessionPath));
            baileysConn.loadAuthInfo(session);
        }

        baileysConn.on('qr', qr => {
            console.log('Scan this QR with your phone:');
            require('qrcode-terminal').generate(qr, { small: true });
        });

        return baileysConn;
    }

    async connectBoth(client, baileysConn) {
        // Connect both clients with shared session
        const session = await this.getWWebJSSession(client);
        baileysConn.loadAuthInfo(session);
        await baileysConn.connect();
    }
}

module.exports = new SessionManager();