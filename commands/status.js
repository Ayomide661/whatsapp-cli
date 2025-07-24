const colors = require('../lib/colors');
const fs = require('fs');
const path = require('path');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\nFetching status updates...'));
    
    // Get status updates
    const statusUpdates = await client.getStatus();
    
    if (!statusUpdates || statusUpdates.length === 0) {
      console.log(colors.yellow('No status updates found'));
      return;
    }

    console.log(colors.cyan('\nAvailable Status Updates:'));
    statusUpdates.forEach((status, index) => {
      console.log(`${colors.green(index + 1)}. ${status.author || 'Unknown'} - ${status.type}`);
      console.log(`   ${status.body || 'No text'} [${new Date(status.timestamp * 1000).toLocaleString()}]`);
    });

    const choice = await rl.questionAsync(colors.blue('\nSelect status to view (number) or 0 to go back: '));
    const selectedIndex = parseInt(choice) - 1;

    if (selectedIndex >= 0 && selectedIndex < statusUpdates.length) {
      const status = statusUpdates[selectedIndex];
      
      if (status.type === 'image' || status.type === 'video') {
        console.log(colors.yellow('\nDownloading media...'));
        const media = await client.downloadMedia(status);
        
        if (media) {
          const ext = status.type === 'image' ? 'jpg' : 'mp4';
          const filename = `status_${Date.now()}.${ext}`;
          fs.writeFileSync(filename, media.data, 'base64');
          console.log(colors.green(`✓ Saved as ${filename}`));
        } else {
          console.log(colors.red('Failed to download media'));
        }
      }
    }
  } catch (error) {
    console.log(colors.red(`Error: ${error.message}`));
  }
};