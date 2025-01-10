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

      logger.info('Initializing test environment...');
      cleanupPort();
      
      logger.info('Starting test server...');
      serverProcess = spawn('npm', ['run', 'dev:server'], {
        stdio: 'pipe',
        detached: true,
        env: {
          ...process.env,
          NODE_ENV: 'test',
          PORT: '3001',
          DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/chatgenius_test?schema=public',
          LOG_LEVEL: 'info',
          RATE_LIMIT_WINDOW_MS: '0',
          RATE_LIMIT_MAX_REQUESTS: '0'
        }
      });

      serverProcess.stdout.on('data', (data) => {
        logger.info('Server output:', { data: data.toString() });
      });

      serverProcess.stderr.on('data', (data) => {
        logger.error('Server error output:', { data: data.toString() });
      });

      serverProcess.on('error', (err) => {
        logger.error('Server process error:', { error: err.message });
        throw err;
      });

      if (!serverProcess.pid) {
        logger.error('Failed to start server process');
        throw new Error('Server process failed to start');
      }

      logger.info('Server process started with PID:', { pid: serverProcess.pid });

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
