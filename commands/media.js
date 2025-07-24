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
      console.log(`${i + 1}. [${new Date(msg.timestamp * 1000).toLocaleString()}] ${msg.type}`);
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

async function downloadMedia(message) {
  try {
    const media = await message.downloadMedia();
    if (!media) throw new Error('Media download failed');

    // Determine file extension based on type
    let extension;
    if (media.mimetype) {
      extension = media.mimetype.split('/')[1];
    } else {
      // Fallback extensions by message type
      const typeMap = {
        'image': 'jpg',
        'video': 'mp4',
        'sticker': 'webp',
        'document': 'bin',
        'audio': 'ogg'
      };
      extension = typeMap[message.type] || 'dat';
    }

    const filename = `media_${message.id.id}.${extension}`;
    fs.writeFileSync(filename, media.data, 'base64');
    console.log(colors.green(`✓ Saved ${filename} (${message.type})`));
  } catch (error) {
    console.log(colors.yellow(`⚠ Could not download ${message.type} (${message.id.id}): ${error.message}`));
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

async function bulkDownload(client, rl) {
  try {
    const query = await rl.questionAsync(colors.blue('Contact/group name: '));
    const chat = await findContact(client, rl, query);
    const outputDir = `media_${chat.id.user}_${Date.now()}`;
    
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(colors.yellow(`⏳ Scanning ${chat.name} for media...`));

    let mediaCount = 0;
    let lastMessageId = null;
    let batchCount = 0;

    while (true) {
      const messages = await chat.fetchMessages({ limit: 20, before: lastMessageId });
      if (messages.length === 0) break;

      for (const msg of messages) {
        if (msg.hasMedia) {
          try {
            await downloadMedia(msg, outputDir);
            mediaCount++;
          } catch (e) {
            console.log(colors.yellow(`⚠ Skipped ${msg.id.id}`));
          }
        }
      }

      lastMessageId = messages[messages.length - 1].id._serialized;
      batchCount += messages.length;
      process.stdout.write(`\rScanned ${batchCount} messages, found ${mediaCount} media files`);
    }

    console.log(colors.green(`\n✅ Downloaded ${mediaCount} files to ${outputDir}/`));
  } catch (error) {
    console.log(colors.red(`✗ Error: ${error.message}`));
  }
}