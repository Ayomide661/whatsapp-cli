const colors = require('../lib/colors');

module.exports = async (conn, rl) => {
    try {
        console.log(colors.cyan('\nFetching status updates...'));
        
        const statusUpdates = await conn.fetchStatusUpdates();
        if (!statusUpdates || statusUpdates.length === 0) {
            console.log(colors.yellow('No status updates found'));
            return;
        }

        console.log(colors.cyan('\nRecent Status Updates:'));
        statusUpdates.slice(0, 20).forEach((status, index) => {
            console.log(`${colors.green(index + 1)}. ${status.name || 'Unknown'}`);
            console.log(`   ${status.status || 'No text status'}`);
            console.log(`   Last updated: ${new Date(status.timestamp * 1000).toLocaleString()}`);
        });
    } catch (error) {
        console.log(colors.red(`Error: ${error.message}`));
    }
};