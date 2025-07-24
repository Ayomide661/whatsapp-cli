const colors = require('../lib/colors');

module.exports = {
  findContact: async (client, rl, query) => {
    try {
      // Clean and validate input
      query = query.trim();
      if (!query) throw new Error('No search query provided');

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

      // Search all chats
      const allChats = await client.getChats();
      
      // Find matches (case insensitive)
      const matchingChats = allChats.filter(chat => {
        const chatName = (chat.name || '').toLowerCase();
        const contactNumber = chat.id.user.toLowerCase();
        const queryLower = query.toLowerCase();
        
        return chatName.includes(queryLower) || 
               contactNumber.includes(queryLower) ||
               chat.id._serialized.includes(queryLower);
      });

      // No matches found
      if (matchingChats.length === 0) {
        console.log(colors.yellow('\nNo exact matches. Showing first 10 chats:'));
        allChats.slice(0, 10).forEach((chat, index) => {
          const type = chat.isGroup ? 'Group' : 'Contact';
          console.log(`${index + 1}. ${chat.name || chat.id.user} (${type})`);
        });
        
        const choice = await rl.questionAsync(colors.blue('\nSelect a chat (1-10) or press Enter to cancel: '));
        if (choice && !isNaN(choice)) {
          const selectedIndex = parseInt(choice) - 1;
          if (selectedIndex >= 0 && selectedIndex < 10) {
            return allChats[selectedIndex];
          }
        }
        throw new Error('No chat selected');
      }

      // Single match found
      if (matchingChats.length === 1) {
        return matchingChats[0];
      }

      // Multiple matches found
      console.log(colors.cyan('\nMultiple matches found:'));
      matchingChats.forEach((chat, index) => {
        const type = chat.isGroup ? 'Group' : 'Contact';
        console.log(`${index + 1}. ${chat.name || chat.id.user} (${type})`);
      });

      const choice = await rl.questionAsync(colors.blue('\nSelect contact/group (1-' + matchingChats.length + '): '));
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