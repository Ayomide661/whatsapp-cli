const colors = require('../lib/colors');

module.exports = {
  findContact: async (client, rl, query) => {
    try {
      // Try exact number match first
      const cleanNumber = query.replace(/\D/g, '');
      if (cleanNumber.length > 5) {
        try {
          const formattedNumber = `${cleanNumber}@c.us`;
          const chat = await client.getChatById(formattedNumber);
          return chat;
        } catch (e) {
          // Fall through to name search
        }
      }

      // Search by name if number search fails
      const allChats = await client.getChats();
      const matchingChats = allChats.filter(chat => {
        const chatName = chat.name?.toLowerCase() || '';
        const contactNumber = chat.id.user.toLowerCase();
        const queryLower = query.toLowerCase();
        
        return chatName.includes(queryLower) || 
               contactNumber.includes(queryLower) ||
               chat.id._serialized.includes(queryLower);
      });

      if (matchingChats.length === 0) {
        console.log(colors.yellow('\nNo contacts/groups found. Available chats:'));
        allChats.slice(0, 10).forEach(chat => {
          console.log(`- ${chat.name || chat.id.user} (${chat.isGroup ? 'Group' : 'Contact'})`);
        });
        throw new Error('No matches found');
      }

      if (matchingChats.length === 1) {
        return matchingChats[0];
      }

      // Handle multiple matches
      console.log(colors.cyan('\nMultiple matches found:'));
      matchingChats.forEach((chat, index) => {
        console.log(`${index + 1}. ${chat.name || chat.id.user} (${chat.isGroup ? 'Group' : 'Contact'})`);
      });

      const choice = await rl.questionAsync(colors.blue('Select contact/group (1-' + matchingChats.length + '): '));
      const selectedIndex = parseInt(choice) - 1;
      
      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= matchingChats.length) {
        throw new Error('Invalid selection');
      }

      return matchingChats[selectedIndex];
    } catch (error) {
      throw new Error(`Contact lookup failed: ${error.message}`);
    }
  }
};