#!/usr/bin/env node
const { Client, LocalAuth } = require('whatsapp-web.js');
const readline = require('readline');
const colors = require('./lib/colors');
const config = require('./lib/config');
require('../utils/inputHelper')(rl);

// Load all commands
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

const client = new Client(config.clientOptions);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colors.prompt
});

// Initialize client events
client.on('qr', qr => {
  console.log(colors.yellow('\nScan QR Code:'));
  require('qrcode-terminal').generate(qr, { small: true });
});

client.on('ready', () => {
  console.log(colors.green('\n✓ Client Ready'));
  showMainMenu();
});

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
    case '0': process.exit(0);
    default: console.log(colors.red('Invalid choice'));
  }
  showMainMenu();
}

client.initialize();