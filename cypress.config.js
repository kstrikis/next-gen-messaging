import { defineConfig } from 'cypress';
import { spawn, execSync } from 'child_process';
import tcpPortUsed from 'tcp-port-used';
import logger from './server/src/config/logger.js';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on) {
      let serverProcess = null;

      // Kill any existing process on port 3001
      const cleanupPort = () => {
        try {
          const processes = execSync('lsof -i:3001', { encoding: 'utf8' });
          if (processes) {
            logger.info('Found processes on port 3001, cleaning up...');
            execSync('lsof -ti:3001 | xargs kill -9', { stdio: 'inherit' });
            logger.info('Existing processes killed.');
          }
        } catch (error) {
          // Error code 1 means no processes found, which is fine
          if (error.status !== 1) {
            logger.error('Error cleaning up port:', { error: error.message });
          }
        }
      };

      on('before:run', async () => {
        logger.info('Initializing test environment...');

        // Check and cleanup port
        logger.info('Checking for processes on port 3001...');
        const inUse = await tcpPortUsed.check(3001);
        
        if (inUse) {
          logger.warn('Port 3001 is in use, attempting cleanup...');
          cleanupPort();
          // Wait a bit for the port to be released
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        logger.info('Starting test server...');

        // Start server process using dev:server to match development environment
        serverProcess = spawn('npm', ['run', 'dev'], {
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_ENV: 'test',
            PORT: '3001',
          },
          detached: true, // Make it easier to kill the process tree
        });

        logger.info('Server process started with PID:', { pid: serverProcess.pid });

        // Wait for server to be ready
        try {
          await tcpPortUsed.waitUntilUsed(3001, 500, 30000);
        } catch (error) {
          logger.error('Server failed to start:', { error: error.message });
          throw error;
        }
      });

      on('after:run', async () => {
        if (serverProcess) {
          logger.info('Shutting down test server', { pid: serverProcess.pid });
          
          // Kill the server process and its children
          try {
            process.kill(-serverProcess.pid); // Kill the process group
          } catch (error) {
            logger.error('Error killing server process:', { error: error.message });
          }
          
          // Wait for port to be released
          try {
            await tcpPortUsed.waitUntilFree(3001, 500, 30000);
            logger.info('Server process killed successfully.');
          } catch (error) {
            logger.error('Error shutting down server:', { error: error.message });
            // Attempt force cleanup if normal shutdown fails
            cleanupPort();
          }
        }
      });
    },
  },
});
