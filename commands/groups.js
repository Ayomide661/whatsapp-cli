const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\nGroup Management'));
    console.log('1. List Groups');
    console.log('2. Create Group');
    console.log('3. Add to Group');
    
    const choice = await rl.questionAsync(colors.blue('Select option: '));
    
    switch(choice) {
      case '1':
        const groups = await client.getChats({ isGroup: true });
        groups.forEach(group => {
          console.log(`${colors.green(group.name)} (${group.id._serialized})`);
        });
        break;
        
      case '2':
        const groupName = await rl.questionAsync(colors.blue('Group name: '));
        const participantsInput = await rl.questionAsync(colors.blue('Participants (comma separated): '));
        const participants = participantsInput.split(',').map(p => `${p.trim()}@c.us`);
        
        const group = await client.createGroup(groupName, participants);
        console.log(colors.green(`Created group: ${group.gid._serialized}`));
        break;
        
      case '3':
        const groupId = await rl.questionAsync(colors.blue('Group ID: '));
        const participant = await rl.questionAsync(colors.blue('Number to add: '));
        await client.addParticipant(groupId, `${participant}@c.us`);
        console.log(colors.green('Participant added'));
        break;
        
      default:
        console.log(colors.red('Invalid choice'));
    }
  } catch (error) {
    console.log(colors.red('Error:', error.message));
  }
};