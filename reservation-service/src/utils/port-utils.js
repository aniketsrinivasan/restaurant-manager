const net = require('net');

async function findAvailablePort(startPort = 5002, maxAttempts = 10) {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    try {
      const available = await isPortAvailable(port);
      if (available) {
        return port;
      }
    } catch (error) {
      continue;
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts - 1}`);
}

async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

module.exports = { findAvailablePort, isPortAvailable }; 