import { createApp } from "./app.js";
import { env } from "./config/env.js";

createApp().listen(env.PORT, () => {
  console.log(`Transactions service listening on port ${env.PORT}`);
});