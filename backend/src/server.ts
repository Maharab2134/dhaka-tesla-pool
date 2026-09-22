import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚗⚡ Dhaka Tesla Pool API running on port ${env.PORT} [${env.NODE_ENV}]`);
  console.log(`   Health check available at http://localhost:${env.PORT}/api/health`);
});
