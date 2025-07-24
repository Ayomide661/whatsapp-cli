const colors = require('../lib/colors');
const sessionManager = require('../lib/sessionManager');

module.exports = async (client, rl) => {
    try {
        console.log(colors.cyan('\nInitializing status viewer...'));
        
        // Initialize Baileys
        const baileysConn = await sessionManager.getBaileysConnection();
        
        // Connect Baileys
        if (!baileysConn.user) {
            console.log(colors.yellow('\nPlease authenticate Baileys:'));
            await baileysConn.connect();
        } else {
            console.log(colors.green('\nUsing existing Baileys session'));
        }

        // Get status updates
        console.log(colors.cyan('\nFetching status updates...'));
        const statusUpdates = await baileysConn.fetchStatusUpdates();
        
        if (!statusUpdates || statusUpdates.length === 0) {
            console.log(colors.yellow('No status updates found'));
            return;
        }

        // Display statuses
        console.log(colors.cyan('\nRecent Status Updates (last 24 hours):'));
        const now = Date.now() / 1000;
        statusUpdates
            .filter(status => now - status.timestamp < 86400)
            .slice(0, 20)
            .forEach((status, index) => {
                console.log(`${colors.green(index + 1)}. ${status.name || 'Unknown'}`);
                console.log(`   ${status.status || 'No text status'}`);
                console.log(`   Last updated: ${new Date(status.timestamp * 1000).toLocaleString()}`);
            });

        // Close connection
        await baileysConn.close();
    } catch (error) {
        console.log(colors.red(`Error: ${error.message}`));
    }
};