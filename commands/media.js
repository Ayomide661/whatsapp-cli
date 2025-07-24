const fs = require('fs');
const path = require('path');
const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = async (client, rl) => {
  console.log(colors.cyan(`
  🖼️  ${colors.bold('Media Tools')}
  1. Download Media from Chat
  2. Send Media File
  3. Bulk Download All Media
  `));

  const choice = await rl.questionAsync(colors.blue('Select option: '));

  switch (choice) {
    case '1':
      await downloadFromChat(client, rl);
      break;
    case '2':
      await sendMedia(client, rl);
      break;
    case '3':
      await bulkDownload(client, rl);
      break;
    default:
      console.log(colors.red('Invalid choice'));
  }
};

async function downloadFromChat(client, rl) {
  try {
    const query = await rl.questionAsync(colors.blue('Contact/group name: '));
    const chat = await findContact(client, rl, query);
    const limit = await rl.questionAsync(colors.blue('Last N messages (10): ')) || 10;

    const messages = await chat.fetchMessages({ limit: parseInt(limit) });
    const mediaMessages = messages.filter(msg => msg.hasMedia);

    if (mediaMessages.length === 0) {
      console.log(colors.yellow('No media found in recent messages'));
      return;
    }

    console.log(colors.cyan(`\nFound ${mediaMessages.length} media items:`));
    mediaMessages.forEach((msg, i) => {
      console.log(`${i + 1}. [${new Date(msg.timestamp * 1000).toLocaleString()}] ${msg.type}${msg.type === 'document' ? ` (${msg.body})` : ''}`);
    });

    const selection = await rl.questionAsync(colors.blue('Which to download? (number/all): '));
    
    if (selection === 'all') {
      for (const msg of mediaMessages) {
        await downloadMedia(msg);
      }
    } else {
      const index = parseInt(selection) - 1;
      if (index >= 0 && index < mediaMessages.length) {
        await downloadMedia(mediaMessages[index]);
      } else {
        console.log(colors.red('Invalid selection'));
      }
    }
  } catch (error) {
    console.log(colors.red(`✗ Error: ${error.message}`));
  }
}

async function bulkDownload(client, rl) {
  try {
    const query = await rl.questionAsync(colors.blue('Contact/group name: '));
    const chat = await findContact(client, rl, query);
    const outputDir = `media_${chat.name || chat.id.user}_${Date.now()}`.replace(/[^\w]/g, '_');
    
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(colors.yellow(`⏳ Scanning ${chat.name || 'chat'} for media...`));

    let mediaCount = 0;
    let messageCount = 0;
    let lastMessageId = null;
    let processedMessages = new Set();

    while (true) {
      const messages = await chat.fetchMessages({ 
        limit: 50, 
        before: lastMessageId 
      });

      if (messages.length === 0) break;

      const newMessages = messages.filter(msg => !processedMessages.has(msg.id._serialized));
      if (newMessages.length === 0) break;

      for (const msg of newMessages) {
        processedMessages.add(msg.id._serialized);
        messageCount++;

        if (msg.hasMedia) {
          process.stdout.write(`\rProcessing message ${messageCount} (${mediaCount} media found)...`);
          const success = await downloadMedia(msg, outputDir);
          if (success) mediaCount++;
        }
      }

      lastMessageId = messages[messages.length - 1].id._serialized;
    }

    console.log(colors.green(`\n✅ Saved ${mediaCount} media files to ${outputDir}/`));
  } catch (error) {
    console.log(colors.red(`\n✗ Error: ${error.message}`));
  }
}

async function downloadMedia(message, outputDir = '.') {
  try {
    // Try normal download first
    let media = await message.downloadMedia();
    
    // Special handling for videos
    if (!media && message.type === 'video') {
      media = await new Promise(resolve => {
        setTimeout(async () => {
          try {
            resolve(await message.downloadMedia());
          } catch {
            resolve(null);
          }
        }, 2000);
      });
    }

    if (!media) throw new Error('Media download failed');

    // Determine file extension
    let extension;
    if (media.mimetype) {
      extension = media.mimetype.split('/')[1];
    } else if (message.type === 'document') {
      extension = message.body.split('.').pop() || 'bin';
    } else {
      const typeExtensions = {
        'image': 'jpg',
        'video': 'mp4',
        'sticker': 'webp',
        'audio': 'ogg',
        'ptt': 'ogg'
      };
      extension = typeExtensions[message.type] || 'dat';
    }

    // Create safe filename
    const cleanId = message.id.id.replace(/\W/g, '');
    const timestamp = new Date(message.timestamp * 1000).toISOString().replace(/[:.]/g, '-');
    const filename = path.join(outputDir, `media_${timestamp}_${cleanId}.${extension}`);

    fs.writeFileSync(filename, media.data, 'base64');
    return true;
  } catch (error) {
    console.log(colors.yellow(`\n⚠ Could not download ${message.type}: ${error.message}`));
    return false;
  }
}

async function sendMedia(client, rl) {
  try {
    const query = await rl.questionAsync(colors.blue('Recipient (name/number): '));
    const chat = await findContact(client, rl, query);
    const filePath = await rl.questionAsync(colors.blue('File path: '));
    const caption = await rl.questionAsync(colors.blue('Caption (optional): '));

    const media = MessageMedia.fromFilePath(filePath);
    await client.sendMessage(chat.id._serialized, media, { caption });
    console.log(colors.green('✓ Media sent!'));
  } catch (error) {
    console.log(colors.red(`✗ Error: ${error.message}`));
  }
}