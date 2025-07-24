#!/usr/bin/env node
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const path = require('path');

// Color functions (fallback if chalk not available)
const colors = {
  blue: text => `\x1b[34m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`,
  bold: text => `\x1b[1m${text}\x1b[0m`,
  prompt: '\x1b[34m\x1b[1mWhatsApp> \x1b[0m'
};

// Initialize readline with promise support
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colors.prompt
});

// Add promise-based question function to readline
rl.questionAsync = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

// Add this helper function right after rl initialization
function formatContactList(contacts) {
  return contacts.map(chat => {
    return {
      name: chat.name || chat.id.user,
      id: chat.id._serialized,
      isGroup: chat.isGroup
    };
  });
}

// Load commands
const commands = {
  send: require('./commands/sendMessage'),
  history: require('./commands/chatHistory'),
  contacts: require('./commands/contacts'),
  groups: require('./commands/groups'),
  media: require('./commands/media'),
  schedule: require('./commands/scheduler'),
  backup: require('./commands/backup'),
  settings: require('./commands/settings')
};

// Initialize client with proper LocalAuth
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "cli-client" }),
  puppeteer: { 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Client Events
client.on('qr', qr => {
  console.log(colors.yellow('\nScan QR Code:'));
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log(colors.green('\n✓ Authenticated'));
});

client.on('ready', () => {
  console.log(colors.green('\n✓ Client Ready'));
  showMainMenu();
});

// Menu System
function showMainMenu() {
  console.log(colors.cyan(`
  ===== ${colors.bold('WhatsApp CLI')} =====
  1. Send Message
  2. Chat History
  3. Manage Contacts
  4. Group Tools
  5. Media Downloader
  6. Message Scheduler
  7. Backup/Restore
  8. Settings
  9. View status
  0. Exit
  `));
  rl.question(colors.blue('Select option: '), handleMenuChoice);
}

async function handleMenuChoice(choice) {
  switch(choice.trim()) {
    case '1': await commands.send(client, rl); break;
    case '2': await commands.history(client, rl); break;
    case '3': await commands.contacts(client, rl); break;
    case '4': await commands.groups(client, rl); break;
    case '5': await commands.media(client, rl); break;
    case '6': await commands.schedule(client, rl); break;
    case '7': await commands.backup(client, rl); break;
    case '8': await commands.settings(client, rl); break;
    case '9': await commands.status(client, rl); break;
    case '0': exitApp(); break;
    default: console.log(colors.red('Invalid choice'));
  }
  showMainMenu();
}

function exitApp() {
  console.log(colors.yellow('\nClosing WhatsApp CLI...'));
  client.destroy();
  process.exit(0);
}

// Start
client.initialize();