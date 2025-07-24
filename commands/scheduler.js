const schedule = require('node-schedule');
const colors = require('../lib/colors');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\nMessage Scheduler'));
    console.log('1. Schedule Message');
    console.log('2. View Scheduled');
    console.log('3. Cancel Scheduled');
    
    const choice = await rl.questionAsync(colors.blue('Select option: '));
    
    switch(choice) {
      case '1':
        const to = await rl.questionAsync(colors.blue('Recipient: '));
        const message = await rl.questionAsync(colors.blue('Message: '));
        const time = await rl.questionAsync(colors.blue('When (YYYY-MM-DD HH:MM): '));
        
        const job = schedule.scheduleJob(new Date(time), async () => {
          await client.sendMessage(`${to}@c.us`, message);
        });
        
        console.log(colors.green(`Scheduled with ID: ${job.name}`));
        break;
        
      case '2':
        const jobs = schedule.scheduledJobs;
        Object.keys(jobs).forEach(id => {
          console.log(`${colors.cyan(id)}: ${jobs[id].nextInvocation()}`);
        });
        break;
        
      case '3':
        const jobId = await rl.questionAsync(colors.blue('Job ID to cancel: '));
        const jobToCancel = schedule.scheduledJobs[jobId];
        if (jobToCancel) {
          jobToCancel.cancel();
          console.log(colors.green('Job cancelled'));
        } else {
          console.log(colors.red('Job not found'));
        }
        break;
        
      default:
        console.log(colors.red('Invalid choice'));
    }
  } catch (error) {
    console.log(colors.red('Error:', error.message));
  }
};