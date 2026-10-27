import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './models';
import config from "./config/config";
import { startLifecycleBackgroundTimer } from './services/subscriptionLifecycleService';

dotenv.config();

const PORT = config.server.port || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Start automated in-process background lifecycle scheduler (every 6 hours)
    startLifecycleBackgroundTimer(6);
  });
});

// FleetFlow server entrypoint - reloaded v7
