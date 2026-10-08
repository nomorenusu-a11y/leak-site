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
      VINEXT_KV_CACHE: bindings.kv({ id: "c6c86a1377104ab38c35a5c6a84c3522" }),
    },
  }),
});
