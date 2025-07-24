const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');

module.exports = async (client, rl) => {
  try {
    const to = await rl.questionAsync(colors.blue('Recipient (number/name): '));
    const content = await rl.questionAsync(colors.blue('Message: '));
    
    const chat = await findContact(client, to);
    await client.sendMessage(chat.id._serialized, content);
    console.log(colors.green(`✓ Sent to ${chat.name || chat.id.user}`));
  } catch (error) {
    console.log(colors.red('✗ Error:', error.message));
  }
};