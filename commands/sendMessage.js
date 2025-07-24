const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');

module.exports = async (client, rl) => {
  try {
    const query = await rl.questionAsync(colors.blue('Recipient (name/number): '));
    const message = await rl.questionAsync(colors.blue('Message: '));
    
    const chat = await findContact(client, rl, query);
    await client.sendMessage(chat.id._serialized, message);
    console.log(colors.green(`✓ Message sent to ${chat.name || chat.id.user}`));
  } catch (error) {
    console.log(colors.red(`✗ Error: ${error.message}`));
  }
};