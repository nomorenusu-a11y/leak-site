import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { workersCacheCdnAdapter } from "@vinext/cloudflare/cache/workers-cache-cdn-adapter";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import path from "node:path";

export default defineConfig({
  plugins: [
    vinext({
      cache: {
        // Page responses use Workers Cache, avoiding one KV write per rendered page.
        cdn: workersCacheCdnAdapter(),
        data: kvDataAdapter(),
      },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],

  resolve: {
    alias: {
      sharp: path.resolve(__dirname, "empty-stub.js"),
    },
  },
});
