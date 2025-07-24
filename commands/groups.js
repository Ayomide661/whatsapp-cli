const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');

module.exports = async (client, rl) => {
  console.log(colors.cyan(`
  👥 ${colors.bold('Group Management')}
  1. List All Groups
  2. Group Info
  3. Add Participant
  4. Create Group
  `));

  const choice = await rl.questionAsync(colors.blue('Select option: '));

  switch (choice) {
    case '1':
      await listAllGroups(client);
      break;
    case '2':
      await groupInfo(client, rl);
      break;
    case '3':
      await addParticipant(client, rl);
      break;
    case '4':
      await createGroup(client, rl);
      break;
    default:
      console.log(colors.red('Invalid choice'));
  }
};

// Only shows @g.us groups
async function listAllGroups(client) {
  try {
    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.id._serialized.endsWith('@g.us'));
    
    if (groups.length === 0) {
      console.log(colors.yellow('No groups found'));
      return;
    }

    console.log(colors.cyan('\nYour Groups:'));
    groups.forEach((group, index) => {
      console.log(`${colors.green(index + 1)}. ${group.name} (${group.id._serialized})`);
      console.log(`   Participants: ${group.participants.length}`);
    });
  } catch (error) {
    console.log(colors.red(`Error: ${error.message}`));
  }
}

async function groupInfo(client, rl) {
  try {
    const query = await rl.questionAsync(colors.blue('Group name or ID: '));
    const chat = await findContact(client, rl, query);
    
    if (!chat.id._serialized.endsWith('@g.us')) {
      throw new Error('This is not a group');
    }

    console.log(colors.cyan('\nGroup Info:'));
    console.log(`Name: ${chat.name}`);
    console.log(`ID: ${chat.id._serialized}`);
    console.log(`Participants: ${chat.participants.length}`);
    console.log(`Created: ${new Date(chat.groupMetadata.creation * 1000).toLocaleString()}`);
  } catch (error) {
    console.log(colors.red(`Error: ${error.message}`));
  }
}

async function addParticipant(client, rl) {
  try {
    const groupQuery = await rl.questionAsync(colors.blue('Group name or ID: '));
    const group = await findContact(client, rl, groupQuery);
    
    if (!group.id._serialized.endsWith('@g.us')) {
      throw new Error('This is not a group');
    }

    const userQuery = await rl.questionAsync(colors.blue('Phone number to add (with country code): '));
    await client.addParticipant(group.id._serialized, `${userQuery}@c.us`);
    console.log(colors.green('✓ User added to group'));
  } catch (error) {
    console.log(colors.red(`Error: ${error.message}`));
  }
}

async function createGroup(client, rl) {
  try {
    const name = await rl.questionAsync(colors.blue('Group name: '));
    const participantsInput = await rl.questionAsync(colors.blue('Participants (comma separated phone numbers with country codes): '));
    
    const participants = participantsInput.split(',')
      .map(num => num.trim())
      .filter(num => num.length > 5)
      .map(num => `${num}@c.us`);

    if (participants.length < 1) {
      throw new Error('You need at least 1 participant');
    }

    const group = await client.createGroup(name, participants);
    console.log(colors.green(`✓ Group created: ${group.gid._serialized}`));
  } catch (error) {
    console.log(colors.red(`Error: ${error.message}`));
  }
}