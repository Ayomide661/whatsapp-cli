const fs = require('fs');
const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\nMedia Tools'));
    console.log('1. Download Media from Chat');
    console.log('2. Send Media');
    
    const choice = await rl.questionAsync(colors.blue('Select option: '));
    
    switch(choice) {
      case '1':
        const chatId = await rl.questionAsync(colors.blue('Chat ID: '));
        const limit = await rl.questionAsync(colors.blue('Last N messages (10): ')) || 10;
        
        const chat = await client.getChatById(chatId);
        const messages = await chat.fetchMessages({ limit: parseInt(limit) });
        
        let mediaCount = 0;
        for (const msg of messages) {
          if (msg.hasMedia) {
            const media = await msg.downloadMedia();
            const ext = media.mimetype.split('/')[1];
            fs.writeFileSync(`media_${Date.now()}.${ext}`, media.data, 'base64');
            mediaCount++;
          }
        }
        console.log(colors.green(`Downloaded ${mediaCount} files`));
        break;
        
      case '2':
        const to = await rl.questionAsync(colors.blue('Recipient: '));
        const filePath = await rl.questionAsync(colors.blue('File path: '));
        
        const media = MessageMedia.fromFilePath(filePath);
        await client.sendMessage(`${to}@c.us`, media);
        console.log(colors.green('Media sent'));
        break;
        
      default:
        console.log(colors.red('Invalid choice'));
    }
  } catch (error) {
    console.log(colors.red('Error:', error.message));
  }
};