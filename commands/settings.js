const fs = require('fs');
const colors = require('../lib/colors');

module.exports = async (client, rl) => {
  try {
    console.log(colors.cyan('\nSettings'));
    console.log('1. Toggle Debug Mode');
    console.log('2. Clear Session');
    console.log('3. View Config');
    
    const choice = await rl.questionAsync(colors.blue('Select option: '));
    
    switch(choice) {
      case '1':
        const config = require('../lib/config');
        config.debugMode = !config.debugMode;
        fs.writeFileSync('./lib/config.json', JSON.stringify(config, null, 2));
        console.log(colors.green(`Debug mode ${config.debugMode ? 'ON' : 'OFF'}`));
        break;
        
      case '2':
        fs.rmSync('./.wwebjs_auth', { recursive: true, force: true });
        console.log(colors.green('Session cleared. Restart to reauthenticate'));
        break;
        
      case '3':
        const currentConfig = require('../lib/config');
        console.log(colors.cyan(JSON.stringify(currentConfig, null, 2)));
        break;
        
      default:
        console.log(colors.red('Invalid choice'));
    }
  } catch (error) {
    console.log(colors.red('Error:', error.message));
  }
};