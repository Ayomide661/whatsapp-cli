const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');

module.exports = async (client, rl) => {
  console.log(colors.cyan(`
  👥 Group Management
  1. List All Groups
  2. Group Info
  3. Add Participant
  `));

  const choice = await rl.questionAsync(colors.blue('Select option: '));

  switch (choice) {
    case '1':
      try {
        const groups = await client.getChats({ isGroup: true });
        console.log(colors.cyan('\nYour Groups:'));
        groups.forEach(group => {
          console.log(`${colors.green(group.name)} (${group.id._serialized})`);
        });
      } catch (error) {
        console.log(colors.red(`✗ Error: ${error.message}`));
      }
      break;

    case '2':
      try {
        const query = await rl.questionAsync(colors.blue('Group name: '));
        const group = await findContact(client, rl, query);
        console.log(colors.cyan(`\nGroup Info:`));
        console.log(`Name: ${group.name}`);
        console.log(`ID: ${group.id._serialized}`);
        console.log(`Participants: ${group.participants.length}`);
      } catch (error) {
        console.log(colors.red(`✗ Error: ${error.message}`));
      }
      break;

    case '3':
      try {
        const groupQuery = await rl.questionAsync(colors.blue('Group name: '));
        const group = await findContact(client, rl, groupQuery);
        const userQuery = await rl.questionAsync(colors.blue('User to add (number): '));
        await client.addParticipant(group.id._serialized, `${userQuery}@c.us`);
        console.log(colors.green('✓ User added to group'));
      } catch (error) {
        console.log(colors.red(`✗ Error: ${error.message}`));
      }
      break;

    default:
      console.log(colors.red('Invalid choice'));
  }
};