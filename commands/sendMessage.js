const colors = require('../lib/colors');

module.exports = async (sock, rl) => {
    try {
        const jid = await rl.questionAsync(colors.blue('Recipient (number): '));
        const message = await rl.questionAsync(colors.blue('Message: '));
        
        const formattedJid = jid.includes('@') ? jid : `${jid}@s.whatsapp.net`;
        await sock.sendMessage(formattedJid, { text: message });
        
        console.log(colors.green('✓ Message sent'));
    } catch (error) {
        console.log(colors.red(`✗ Error: ${error.message}`));
    }
};