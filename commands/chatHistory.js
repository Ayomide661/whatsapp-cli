const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');

module.exports = async (client, rl) => {
  try {
    const query = await rl.questionAsync(colors.blue('Contact/group name: '));
    const limit = await rl.questionAsync(colors.blue('Message limit (20): ')) || 20;
    
    const chat = await findContact(client, rl, query);
    const messages = await chat.fetchMessages({ limit: parseInt(limit) });
    
    console.log(colors.cyan(`\nLast ${messages.length} messages with ${chat.name || chat.id.user}:`));
    messages.reverse().forEach(msg => {
      const timestamp = new Date(msg.timestamp * 1000).toLocaleString();
      console.log(`[${timestamp}] ${colors.yellow(msg.fromMe ? 'You' : msg.author || chat.name)}: ${msg.body}`);
    });
  } catch (error) {
    console.log(colors.red(`✗ Error: ${error.message}`));
  }
};