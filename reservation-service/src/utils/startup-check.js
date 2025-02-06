const fs = require('fs');
const path = require('path');
const { findAvailablePort } = require('./port-utils');

async function checkRequiredFiles() {
  const requiredPaths = {
    pythonScript: path.join(__dirname, '../scripts/generate_message.py'),
    backendDir: path.join(__dirname, '../../../backend'),
  };

  for (const [key, filepath] of Object.entries(requiredPaths)) {
    if (!fs.existsSync(filepath)) {
      throw new Error(`Required ${key} not found at: ${filepath}`);
    }
  }

  // Find an available port if the configured one is in use
  const requestedPort = parseInt(process.env.PORT || '5002');
  const availablePort = await findAvailablePort(requestedPort);
  process.env.PORT = availablePort.toString();
}

function checkEnvironment() {
  const required = ['OPENAI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { checkRequiredFiles, checkEnvironment }; 