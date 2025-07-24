const schedule = require('node-schedule');
const colors = require('../lib/colors');
const { findContact } = require('../utils/contactFinder');
const { DateTime } = require('luxon');

module.exports = async (client, rl) => {
  console.log(colors.cyan(`
  ⏰ ${colors.bold('Message Scheduler')}
  1. Schedule One-Time Message
  2. Schedule Recurring Message
  3. View Scheduled
  4. Cancel Scheduled
  `));

  const choice = await rl.questionAsync(colors.blue('Select option: '));

  switch (choice) {
    case '1': // One-time message
      await scheduleOneTime(client, rl);
      break;
    case '2': // Recurring (cron)
      await scheduleRecurring(client, rl);
      break;
    case '3': // List jobs
      listScheduledJobs();
      break;
    case '4': // Cancel job
      await cancelScheduledJob(rl);
      break;
    default:
      console.log(colors.red('Invalid choice'));
  }
};

// --- Helper Functions ---
async function scheduleOneTime(client, rl) {
  try {
    const to = await askRecipient(client, rl);
    const message = await rl.questionAsync(colors.blue('Message: '));
    const timeStr = await rl.questionAsync(colors.blue('When (YYYY-MM-DD HH:MM): '));

    const scheduledTime = DateTime.fromFormat(timeStr, 'yyyy-MM-dd HH:mm');
    if (!scheduledTime.isValid) throw new Error('Invalid date format');

    const job = schedule.scheduleJob(scheduledTime.toJSDate(), async () => {
      await client.sendMessage(to, message);
    });

    console.log(colors.green(`✅ Scheduled for ${scheduledTime.toLocaleString(DateTime.DATETIME_FULL)}`));
    console.log(colors.gray(`Job ID: ${job.name}`));
  } catch (error) {
    console.log(colors.red(`❌ Error: ${error.message}`));
  }
}

async function scheduleRecurring(client, rl) {
  try {
    const to = await askRecipient(client, rl);
    const message = await rl.questionAsync(colors.blue('Message: '));
    const cronPattern = await rl.questionAsync(colors.blue('Cron pattern (e.g., "0 9 * * *" for daily at 9 AM): '));

    const job = schedule.scheduleJob(cronPattern, async () => {
      await client.sendMessage(to, message);
    });

    console.log(colors.green(`✅ Recurring job scheduled!`));
    console.log(colors.gray(`Next run: ${job.nextInvocation()}`));
  } catch (error) {
    console.log(colors.red(`❌ Invalid cron pattern or error: ${error.message}`));
  }
}

async function askRecipient(client, rl) {
  const query = await rl.questionAsync(colors.blue('Recipient (name/number): '));
  const chat = await findContact(client, query);
  return chat.id._serialized;
}

function listScheduledJobs() {
  const jobs = schedule.scheduledJobs;
  if (Object.keys(jobs).length === 0) {
    console.log(colors.yellow('No scheduled jobs'));
    return;
  }
  console.log(colors.cyan('\nActive Jobs:'));
  Object.entries(jobs).forEach(([id, job]) => {
    console.log(`${colors.green(id)} → Next: ${job.nextInvocation()}`);
  });
}

async function cancelScheduledJob(rl) {
  listScheduledJobs();
  const jobId = await rl.questionAsync(colors.blue('Enter Job ID to cancel: '));
  const job = schedule.scheduledJobs[jobId];
  if (job) {
    job.cancel();
    console.log(colors.green('🗑️ Job cancelled'));
  } else {
    console.log(colors.red('Job not found'));
  }
}