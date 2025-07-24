const colors = require('../lib/colors');
const fs = require('fs');
const path = require('path');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\n⚠️ Status viewing requires direct WhatsApp connection'));
    console.log(colors.yellow('This feature is not available via WhatsApp Web API'));
    console.log(colors.cyan('\nWorkaround Options:'));
    console.log('1. Use WhatsApp mobile app for status viewing');
    console.log('2. Implement screenshot automation (requires additional setup)');
    
    // Alternative approach to get basic status info
    try {
      const chats = await client.getChats();
      const statusUpdates = chats.filter(chat => chat.isGroup === false)
                                .map(chat => ({
                                  name: chat.name,
                                  lastSeen: chat.timestamp ? new Date(chat.timestamp * 1000) : null,
                                  status: chat.contact ? chat.contact.status : null
                                }));
      
      console.log(colors.cyan('\nLast Seen & Status Info:'));
      statusUpdates.forEach(contact => {
        if (contact.status || contact.lastSeen) {
          console.log(`${colors.green(contact.name || 'Unknown')}:`);
          if (contact.status) console.log(`   Status: ${contact.status}`);
          if (contact.lastSeen) console.log(`   Last Seen: ${contact.lastSeen.toLocaleString()}`);
        }
      });
    } catch (error) {
      console.log(colors.yellow('\nCould not fetch contact status info'));
    }
  } catch (error) {
    console.log(colors.red(`Error: ${error.message}`));
  }
};