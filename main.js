#!/usr/bin/env node
const { useMultiFileAuthState, makeWASocket, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Proper color functions
const chalk = {
    green: text => `\x1b[32m${text}\x1b[0m`,
    red: text => `\x1b[31m${text}\x1b[0m`,
    yellow: text => `\x1b[33m${text}\x1b[0m`,
    cyan: text => `\x1b[36m${text}\x1b[0m`,
    blue: text => `\x1b[34m${text}\x1b[0m`,
    bold: text => `\x1b[1m${text}\x1b[0m`,
    prompt: '\x1b[34m>\x1b[0m '
};

// Readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.prompt
});

// Main connection function
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: state,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log(chalk.yellow('\nScan QR Code:'));
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log(chalk.green('\n✓ Connected to WhatsApp'));
            showMainMenu(sock);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log(chalk.yellow(`\nConnection closed. ${shouldReconnect ? 'Reconnecting...' : 'Please restart the app.'}`));
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

// Menu system
function showMainMenu(sock) {
    console.log(chalk.cyan(`
    ===== ${chalk.bold('WhatsApp CLI (Baileys)')} =====
    1. Send Message
    2. Chat History
    3. Contacts
    4. Groups
    5. Media Tools
    6. Status Updates
    7. Backup Chats
    0. Exit
    `));
    rl.question(chalk.blue('Select option: '), (choice) => handleMenuChoice(choice, sock));
}

async function handleMenuChoice(choice, sock) {
    const commands = {
        '1': require('./commands/sendMessage'),
        '2': require('./commands/chatHistory'),
        '3': require('./commands/contacts'),
        '4': require('./commands/groups'),
        '5': require('./commands/media'),
        '6': require('./commands/status'),
        '7': require('./commands/backup')
    };

    if (commands[choice.trim()]) {
        try {
            await commands[choice.trim()](sock, rl, chalk);
        } catch (error) {
            console.log(chalk.red(`✗ Error: ${error.message}`));
        }
    } else if (choice.trim() === '0') {
        console.log(chalk.yellow('\nExiting...'));
        process.exit(0);
    } else {
        console.log(chalk.red('Invalid choice'));
    }

    showMainMenu(sock);
}

// Start the application
(async () => {
    try {
        console.log(chalk.cyan('Starting WhatsApp CLI...'));
        await connectToWhatsApp();
    } catch (error) {
        console.log(chalk.red(`Fatal error: ${error.message}`));
        process.exit(1);
    }
})();