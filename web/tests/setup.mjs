// Loaded via `node --import ./tests/setup.mjs --test ...` (see the "test" script).
// Node runs the TypeScript directly; this hook only teaches it to resolve imports
// the way Next does: the "@/" path alias, extensionless relative imports, and package
// files without an exports map (e.g. "next/cache" → next/cache.js).
import { registerHooks } from "node:module";

const ROOT = new URL("../", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) specifier = new URL(specifier.slice(2), ROOT).href;
    try {
      return nextResolve(specifier, context);
    } catch (err) {
      if (err?.code !== "ERR_MODULE_NOT_FOUND") throw err;
      const local = specifier.startsWith(".") || specifier.startsWith("file:");
      return nextResolve(`${specifier}.${local ? "ts" : "js"}`, context);
    }
  },
});
