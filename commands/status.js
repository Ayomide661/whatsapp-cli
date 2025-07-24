const colors = require('../lib/colors');
const sessionManager = require('../lib/sessionManager');
const { WAConnection } = require('@adiwajshing/baileys');

module.exports = async (client, rl) => {
    try {
        console.log(colors.cyan('\nInitializing status viewer...'));
        
        // Initialize Baileys with shared session
        const baileysConn = await sessionManager.getBaileysConnection();
        await sessionManager.connectBoth(client, baileysConn);

        // Get status updates
        console.log(colors.cyan('\nFetching status updates...'));
        const statusUpdates = await baileysConn.getStatusUpdates();
        
        if (!statusUpdates || statusUpdates.length === 0) {
            console.log(colors.yellow('No status updates found'));
            return;
        }

        // Display statuses
        console.log(colors.cyan('\nRecent Status Updates:'));
        statusUpdates.slice(0, 20).forEach((status, index) => {
            console.log(`${colors.green(index + 1)}. ${status.name || 'Unknown'}`);
            console.log(`   ${status.status || 'No text status'}`);
            console.log(`   Last updated: ${new Date(status.timestamp * 1000).toLocaleString()}`);
        });

        // Clean up
        await baileysConn.close();
    } catch (error) {
        console.log(colors.red(`Error: ${error.message}`));
    }
};