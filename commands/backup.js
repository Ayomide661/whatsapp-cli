const fs = require('fs');
const colors = require('../lib/colors');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\nBackup & Restore'));
    console.log('1. Backup Chats');
    console.log('2. Restore Chats');
    
    const choice = await rl.questionAsync(colors.blue('Select option: '));
    
    switch(choice) {
      case '1':
        const chats = await client.getChats();
        const backupData = chats.map(chat => ({
          id: chat.id._serialized,
          name: chat.name,
          isGroup: chat.isGroup,
          lastMessage: chat.lastMessage?.body
        }));
        
        fs.writeFileSync('whatsapp-backup.json', JSON.stringify(backupData));
        console.log(colors.green(`Backed up ${chats.length} chats`));
        break;
        
      case '2':
        // Note: Restore is limited as API doesn't support direct message restoration
        console.log(colors.yellow('Restore functionality is limited'));
        break;
        
      default:
        console.log(colors.red('Invalid choice'));
    }
  } catch (error) {
    console.log(colors.red('Error:', error.message));
  }
};