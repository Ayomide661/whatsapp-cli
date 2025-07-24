const fs = require('fs');
const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\nMedia Tools'));
    console.log('1. Download Media from Chat');
    console.log('2. Send Media');
    
    const choice = await rl.questionAsync(colors.blue('Select option: '));
    
    switch(choice) {
      case '1':
        try {
          const query = await rl.questionAsync(colors.blue('Contact/Group name: '));
          const limit = await rl.questionAsync(colors.blue('Last N messages (10): ')) || 10;
          
          const chat = await findContact(client, query);
          const messages = await chat.fetchMessages({ limit: parseInt(limit) });
          
          let downloaded = 0;
          for (const msg of messages) {
            if (msg.hasMedia) {
              try {
                const media = await msg.downloadMedia();
                const ext = media.mimetype.split('/')[1] || 'bin';
                const filename = `media_${Date.now()}_${downloaded}.${ext}`;
                fs.writeFileSync(filename, media.data, 'base64');
                console.log(colors.green(`✓ Saved ${filename}`));
                downloaded++;
              } catch (e) {
                console.log(colors.yellow(`⚠ Couldn't download media from message ${msg.id}`));
              }
            }
          }
          console.log(colors.cyan(`\nDownloaded ${downloaded} media files`));
        } catch (e) {
          console.log(colors.red('✗ Error:', e.message));
        }
        break;
        
      case '2':
        try {
          const to = await rl.questionAsync(colors.blue('Recipient (name/number): '));
          const filepath = await rl.questionAsync(colors.blue('File path: '));
          
          const chat = await findContact(client, to);
          const media = MessageMedia.fromFilePath(filepath);
          await client.sendMessage(chat.id._serialized, media);
          console.log(colors.green('✓ Media sent'));
        } catch (e) {
          console.log(colors.red('✗ Error sending media:', e.message));
        }
        break;
        
      default:
        console.log(colors.red('✗ Invalid choice'));
    }
  } catch (error) {
    console.log(colors.red('✗ Error:', error.message));
  }
};