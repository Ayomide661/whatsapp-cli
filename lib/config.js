const fs = require('fs');
const path = require('path');

const defaultConfig = {
  clientOptions: {
    authStrategy: {
      clientId: "cli-client"
    },
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  },
  debugMode: false
};

const configPath = path.join(__dirname, 'config.json');

try {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  }
  module.exports = require(configPath);
} catch (error) {
  module.exports = defaultConfig;
}