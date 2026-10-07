import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "leak-site",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-07",
    compatibilityFlags: ["nodejs_compat"],
    workersDev: true,
    assets: { notFoundHandling: "none" },
    domains: ["nomorenusu.com", "www.nomorenusu.com"],
    env: {
      ASSETS: bindings.assets(),
    },
  }),
});
