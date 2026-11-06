import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "leak-site",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-07",
    // Admin diagnostics must reach the public Worker, not an absent origin (522).
    compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
    workersDev: true,
    exports: {
      default: { type: "worker", cache: { enabled: false } },
      VinextCachedResponse: { type: "worker", cache: { enabled: true } },
      VinextUncachedResponse: { type: "worker", cache: { enabled: false } },
    },
    assets: { notFoundHandling: "none" },
    domains: ["nomorenusu.com", "www.nomorenusu.com"],
    env: {
      ASSETS: bindings.assets(),
      CF_VERSION_METADATA: bindings.versionMetadata(),
      VINEXT_KV_CACHE: bindings.kv({ id: "c6c86a1377104ab38c35a5c6a84c3522" }),
    },
  }),
});
