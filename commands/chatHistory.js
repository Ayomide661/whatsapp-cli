const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');

module.exports = async (client, rl) => {
  try {
    const query = await rl.questionAsync(colors.blue('Contact number/name: '));
    const limit = await rl.questionAsync(colors.blue('Message limit (20): ')) || 20;
    
    const chat = await findContact(client, query);
    const messages = await chat.fetchMessages({ limit: parseInt(limit) });
    
    console.log(colors.cyan(`\nLast ${messages.length} messages:`));
    messages.reverse().forEach(msg => {
      console.log(`[${msg.timestamp}] ${msg.fromMe ? 'You' : msg.author}: ${msg.body}`);
    });
  } catch (error) {
    console.log(colors.red('✗ Error:', error.message));
  }
};