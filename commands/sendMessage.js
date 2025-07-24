const colors = require('../lib/colors');

module.exports = async (conn, rl) => {
    try {
        const jid = await rl.questionAsync(colors.blue('Recipient (number): '));
        const message = await rl.questionAsync(colors.blue('Message: '));
        
        const formattedJid = jid.includes('@') ? jid : `${jid}@s.whatsapp.net`;
        await conn.sendMessage(formattedJid, message, MessageType.text);
        
        console.log(colors.green('✓ Message sent'));
    } catch (error) {
        console.log(colors.red(`✗ Error: ${error.message}`));
    }
};