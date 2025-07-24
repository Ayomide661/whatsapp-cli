const schedule = require('node-schedule');
const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\nMessage Scheduler'));
    console.log('1. Schedule Message');
    console.log('2. View Scheduled');
    console.log('3. Cancel Scheduled');
    
    const choice = await rl.questionAsync(colors.blue('Select option: '));
    
    switch(choice) {
      case '1':
        try {
          const to = await rl.questionAsync(colors.blue('Recipient (name/number): '));
          const message = await rl.questionAsync(colors.blue('Message: '));
          const time = await rl.questionAsync(colors.blue('When (YYYY-MM-DD HH:MM): '));
          
          const chat = await findContact(client, to);
          const job = schedule.scheduleJob(new Date(time), async () => {
            await client.sendMessage(chat.id._serialized, message);
          });
          
          console.log(colors.green(`✓ Scheduled with ID: ${job.name}`));
          console.log(colors.green(`Will run at: ${job.nextInvocation()}`));
        } catch (e) {
          console.log(colors.red('✗ Error scheduling:', e.message));
        }
        break;
        
      case '2':
        const jobs = schedule.scheduledJobs;
        if (Object.keys(jobs).length === 0) {
          console.log(colors.yellow('No scheduled messages'));
        } else {
          console.log(colors.cyan('\nScheduled Messages:'));
          Object.entries(jobs).forEach(([id, job]) => {
            console.log(`${colors.green(id)}: ${job.nextInvocation()}`);
          });
        }
        break;
        
      case '3':
        const jobId = await rl.questionAsync(colors.blue('Job ID to cancel: '));
        const job = schedule.scheduledJobs[jobId];
        if (job) {
          job.cancel();
          console.log(colors.green('✓ Job cancelled'));
        } else {
          console.log(colors.red('✗ Job not found'));
        }
        break;
        
      default:
        console.log(colors.red('✗ Invalid choice'));
    }
  } catch (error) {
    console.log(colors.red('✗ Error:', error.message));
  }
};