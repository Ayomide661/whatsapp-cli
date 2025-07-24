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
    case '1': // Single download
      await downloadMediaFromChat(client, rl);
      break;
    case '2': // Send media
      await sendMediaFile(client, rl);
      break;
    case '3': // Bulk download
      await bulkDownloadMedia(client, rl);
      break;
    default:
      console.log(colors.red('Invalid choice'));
  }
};

// --- Helper Functions ---
async function downloadMediaFromChat(client, rl) {
  try {
    const chat = await askForChat(client, rl);
    const limit = parseInt(await rl.questionAsync(colors.blue('Last N messages (10): ')) || 10);

    const messages = (await chat.fetchMessages({ limit })).filter(m => m.hasMedia);
    if (messages.length === 0) {
      console.log(colors.yellow('No media found in last messages'));
      return;
    }

    console.log(colors.cyan(`Found ${messages.length} media messages:`));
    messages.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.timestamp}] ${msg.type.toUpperCase()}`);
    });

    const selected = await rl.questionAsync(colors.blue('Which to download? (number/all): '));
    if (selected === 'all') {
      await downloadAllMedia(messages);
    } else {
      await downloadMedia(messages[parseInt(selected) - 1]);
    }
  } catch (error) {
    console.log(colors.red(`❌ Error: ${error.message}`));
  }
}

async function bulkDownloadMedia(client, rl) {
  try {
    const chat = await askForChat(client, rl);
    const outputDir = `media_${chat.id.user}_${Date.now()}`;
    fs.mkdirSync(outputDir);

    console.log(colors.yellow('⏳ Scanning chat for media (this may take a while)...'));

    let mediaCount = 0;
    let lastMessageId = null;
    while (true) {
      const messages = await chat.fetchMessages({ limit: 20, before: lastMessageId });
      if (messages.length === 0) break;

      for (const msg of messages.filter(m => m.hasMedia)) {
        try {
          const media = await msg.downloadMedia();
          const ext = media.mimetype.split('/')[1] || 'dat';
          fs.writeFileSync(
            path.join(outputDir, `${msg.timestamp}_${msg.id.id}.${ext}`),
            media.data, 
            'base64'
          );
          mediaCount++;
        } catch (e) {
          console.log(colors.yellow(`⚠ Failed to download ${msg.id.id}`));
        }
      }
      lastMessageId = messages[messages.length - 1].id._serialized;
    }

    console.log(colors.green(`✅ Downloaded ${mediaCount} files to ${outputDir}/`));
  } catch (error) {
    console.log(colors.red(`❌ Error: ${error.message}`));
  }
}

async function sendMediaFile(client, rl) {
  try {
    const chat = await askForChat(client, rl);
    const filePath = await rl.questionAsync(colors.blue('File path: '));
    const caption = await rl.questionAsync(colors.blue('Caption (optional): '));

    const media = MessageMedia.fromFilePath(filePath);
    await client.sendMessage(chat.id._serialized, media, { caption });
    console.log(colors.green('✅ Media sent!'));
  } catch (error) {
    console.log(colors.red(`❌ Error: ${error.message}`));
  }
}

async function askForChat(client, rl) {
  const query = await rl.questionAsync(colors.blue('Contact/Group name: '));
  return await findContact(client, query);
}

async function downloadAllMedia(messages) {
  let success = 0;
  for (const msg of messages) {
    try {
      await downloadMedia(msg);
      success++;
    } catch (e) {
      console.log(colors.yellow(`⚠ Failed to download ${msg.id.id}`));
    }
  }
  console.log(colors.green(`✅ Downloaded ${success}/${messages.length} files`));
}

async function downloadMedia(message) {
  const media = await message.downloadMedia();
  const ext = media.mimetype.split('/')[1] || 'dat';
  const filename = `media_${message.timestamp}.${ext}`;
  fs.writeFileSync(filename, media.data, 'base64');
  console.log(colors.green(`⬇️ Saved ${filename}`));
}