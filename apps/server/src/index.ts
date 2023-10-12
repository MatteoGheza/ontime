import { initAssets, startIntegrations, startOSCServer, startServer } from './app.js';
import { loadSheet } from './adapters/SheetsAdapter.js';
async function startOntime() {
  try {
    console.log('Starting Ontime');
    console.log('Loading Assets');
    await initAssets();
    console.log('Starting Server');
    await startServer();
    console.log('Starting OSC Server');
    await startOSCServer();
    console.log('Starting Sheets');
    await loadSheet();
    console.log('Starting Integrations');
    await startIntegrations();
  } catch (error) {
    console.log('Error starting Ontime');
    console.log(error);
  }
}

startOntime();
