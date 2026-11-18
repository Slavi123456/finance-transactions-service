import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgres://transactions:transactions@localhost:5434/transactions_test",
      JWT_ACCESS_SECRET: "38714bfc5a5c46e89a137f145b8728ea4fd566b8e622ad3806106bc0a1b6df6a",
    },
    fileParallelism: false, // integration tests share one database
  },
});