const colors = require('../lib/colors');

module.exports = {
  findContact: async (client, query) => {
    // Try by exact number match first
    const cleanNumber = query.replace(/\D/g, '');
    if (cleanNumber.length > 5) {
      try {
        return await client.getChatById(`${cleanNumber}@c.us`);
      } catch (e) {
        // Fall through to name search
      }
    }
    
    // Search by name
    const chats = await client.getChats();
    const matches = chats.filter(chat => 
      chat.name?.toLowerCase().includes(query.toLowerCase()) ||
      chat.id.user.toLowerCase().includes(query.toLowerCase())
    );
    
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      console.log(colors.cyan('\nMultiple matches:'));
      matches.forEach((chat, i) => {
        console.log(`${i+1}. ${chat.name || chat.id.user}`);
      });
      const choice = await rl.questionAsync(colors.blue('Select (1-' + matches.length + '): '));
      return matches[parseInt(choice) - 1];
    }
    throw new Error('Contact not found');
  }
};