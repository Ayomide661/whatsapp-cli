const colors = require('../lib/colors');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\nContact Management'));
    console.log('1. List Contacts');
    console.log('2. Add Contact');
    console.log('3. Block Contact');
    
    const choice = await rl.questionAsync(colors.blue('Select option: '));
    
    switch(choice) {
      case '1':
        const contacts = await client.getContacts();
        contacts.forEach(contact => {
          if (contact.isMyContact) {
            console.log(`${colors.green(contact.name)}: ${contact.number}`);
          }
        });
        break;
        
      case '2':
        const number = await rl.questionAsync(colors.blue('Phone number: '));
        const name = await rl.questionAsync(colors.blue('Contact name: '));
        // Note: WhatsApp Web API doesn't directly support adding contacts
        console.log(colors.yellow('Feature not directly available via API'));
        break;
        
      case '3':
        const toBlock = await rl.questionAsync(colors.blue('Number to block: '));
        await client.blockContact(`${toBlock}@c.us`);
        console.log(colors.green('Contact blocked'));
        break;
        
      default:
        console.log(colors.red('Invalid choice'));
    }
  } catch (error) {
    console.log(colors.red('Error:', error.message));
  }
};