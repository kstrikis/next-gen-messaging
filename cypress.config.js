import { defineConfig } from "cypress";
import { spawn, execSync } from 'child_process';

/* eslint-disable no-console */
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    video: false,
    screenshotOnRunFailure: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
    setupNodeEvents(on) {
      let serverProcess = null;

      // Kill any existing process on port 3001
      const cleanupPort = () => {
        console.log('Checking for processes on port 3001...');
        try {
          const processes = execSync('lsof -i:3001', { encoding: 'utf8' });
          if (processes) {
            console.log('Found processes on port 3001:');
            console.log(processes);
            console.log('Killing processes...');
            execSync('lsof -ti:3001 | xargs kill -9', { stdio: 'inherit' });
            console.log('Processes killed.');
          } else {
            console.log('No processes found on port 3001.');
          }
        } catch (error) {
          if (error.status === 1) {
            console.log('No processes found on port 3001.');
          } else {
            console.error('Error checking port:', error.message);
          }
        }
      };

      // Start server before any tests run
      console.log('Initializing test environment...');
      cleanupPort();
      
      console.log('Starting test server...');
      serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: './server',
        env: { ...process.env, NODE_ENV: 'test' },
        stdio: 'inherit',
        detached: true // This makes it easier to kill the process tree
      });

      console.log('Server process started with PID:', serverProcess.pid);

      // Clean up when tests are done
      on('after:run', () => {
        if (serverProcess) {
          console.log('Shutting down test server (PID:', serverProcess.pid, ')...');
          try {
            // Kill the entire process group
            process.kill(-serverProcess.pid);
            console.log('Server process killed successfully.');
          } catch (error) {
            console.error('Error killing server process:', error.message);
            console.log('Attempting fallback cleanup...');
            cleanupPort();
          }
          serverProcess = null;
        } else {
          console.log('No server process to clean up.');
        }
      });
    },
  },
});
