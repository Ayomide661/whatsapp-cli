const fs = require('fs');
const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = async (client, rl) => {
  console.log(colors.cyan(`
  🖼️  Media Tools
  1. Download Media from Chat
  2. Send Media File
  3. Bulk Download All Media
  `));

  const choice = await rl.questionAsync(colors.blue('Select option: '));

  switch (choice) {
    case '1':
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

        console.log(colors.cyan(`Found ${mediaMessages.length} media items:`));
        mediaMessages.forEach((msg, i) => {
          console.log(`${i + 1}. [${new Date(msg.timestamp * 1000).toLocaleString()}] ${msg.type}`);
        });

        const selection = await rl.questionAsync(colors.blue('Which to download? (number/all): '));
        if (selection === 'all') {
          for (const msg of mediaMessages) {
            await downloadMedia(msg);
          }
        } else {
          await downloadMedia(mediaMessages[parseInt(selection) - 1]);
        }
      } catch (error) {
        console.log(colors.red(`✗ Error: ${error.message}`));
      }
      break;

    case '2':
      try {
        const query = await rl.questionAsync(colors.blue('Recipient (name/number): '));
        const chat = await findContact(client, rl, query);
        const filePath = await rl.questionAsync(colors.blue('File path: '));
        
        const media = MessageMedia.fromFilePath(filePath);
        await client.sendMessage(chat.id._serialized, media);
        console.log(colors.green('✓ Media sent'));
      } catch (error) {
        console.log(colors.red(`✗ Error: ${error.message}`));
      }
      break;

    default:
      console.log(colors.red('Invalid choice'));
  }
};

async function downloadMedia(message) {
  const media = await message.downloadMedia();
  const ext = media.mimetype.split('/')[1] || 'dat';
  const filename = `media_${message.id.id}.${ext}`;
  fs.writeFileSync(filename, media.data, 'base64');
  console.log(colors.green(`✓ Saved ${filename}`));
}