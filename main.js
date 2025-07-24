#!/usr/bin/env node
const { WAConnection, MessageType, Presence } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Color setup
const colors = {
    green: text => `\x1b[32m${text}\x1b[0m`,
    red: text => `\x1b[31m${text}\x1b[0m`,
    yellow: text => `\x1b[33m${text}\x1b[0m`,
    cyan: text => `\x1b[36m${text}\x1b[0m`,
    prompt: '\x1b[34m>\x1b[0m '
};

// Initialize Baileys
const conn = new WAConnection();

// Session configuration
conn.version = [3, 3234, 9]; // WhatsApp version
conn.autoReconnect = true;
conn.connectOptions = {
    maxRetries: 5,
    delayReconnectMs: 1000
};

// Readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colors.prompt
});

// Load commands
const commands = {
    send: require('./commands/sendMessage'),
    chat: require('./commands/chatHistory'),
    contacts: require('./commands/contacts'),
    groups: require('./commands/groups'),
    media: require('./commands/media'),
    status: require('./commands/status'),
    backup: require('./commands/backup')
};

// Event handlers
conn.on('qr', qr => {
    console.log(colors.yellow('\nScan QR Code:'));
    qrcode.generate(qr, { small: true });
});

conn.on('open', () => {
    console.log(colors.green('\n✓ Connected to WhatsApp'));
    showMainMenu();
});

conn.on('close', () => {
    console.log(colors.yellow('\nConnection closed'));
});

// Menu system
function showMainMenu() {
    console.log(colors.cyan(`
    ===== WhatsApp CLI (Baileys) =====
    1. Send Message
    2. Chat History
    3. Contacts
    4. Groups
    5. Media Tools
    6. Status Updates
    7. Backup Chats
    0. Exit
    `));
    rl.question(colors.blue('Select option: '), handleMenuChoice);
}

async function handleMenuChoice(choice) {
    switch(choice.trim()) {
        case '1': await commands.send(conn, rl); break;
        case '2': await commands.chat(conn, rl); break;
        case '3': await commands.contacts(conn, rl); break;
        case '4': await commands.groups(conn, rl); break;
        case '5': await commands.media(conn, rl); break;
        case '6': await commands.status(conn, rl); break;
        case '7': await commands.backup(conn, rl); break;
        case '0': 
            await conn.close();
            process.exit(0);
        default:
            console.log(colors.red('Invalid choice'));
    }
    showMainMenu();
}

// Start connection
(async () => {
    try {
        await conn.connect();
    } catch (error) {
        console.log(colors.red(`Connection error: ${error.message}`));
        process.exit(1);
    }
})();