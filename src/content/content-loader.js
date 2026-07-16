// Classic content-script shim. The manifest injects this tiny loader, which
// dynamically imports the real ES module bundle (content.js).
//
// Why: content scripts declared in the manifest run as classic scripts sharing
// one isolated-world scope, so a bundle's top-level `const`s collide if the
// script is ever evaluated twice (e.g. re-injected after an extension reload
// without a tab refresh) — "Identifier '...' has already been declared".
//
// An ES module keeps its declarations in module scope and is evaluated only
// once per URL, so importing content.js here is idempotent: re-running this
// loader resolves the cached module and never redeclares anything. The loader
// itself has no top-level bindings, so re-injecting it is harmless too.
import(chrome.runtime.getURL('content.mjs'));
