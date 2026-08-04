type CloudflareEnv = Record<string, unknown>;

type OpenNextModule = {
  getCloudflareContext?: (opts?: { async?: boolean }) =>
    | { env?: CloudflareEnv }
    | Promise<{ env?: CloudflareEnv }>;
};

async function loadOpenNext(): Promise<OpenNextModule | null> {
  try {
    // Avoid a static import so builds succeed without the optional adapter.
    const importer = new Function(
      "return import('@opennextjs/cloudflare')",
    ) as () => Promise<OpenNextModule>;
    return await importer();
  } catch {
    return null;
  }
}

/**
 * Read a Cloudflare Pages/Workers runtime secret or env var.
 *
 * Encrypted dashboard secrets are not available at `next build`, so static
 * `process.env.FOO` access can be inlined as undefined. Prefer the Workers
 * binding via OpenNext, then dynamic `process.env[name]` for local/dev.
 */
export async function getRuntimeEnv(name: string): Promise<string | undefined> {
  const mod = await loadOpenNext();
  if (mod?.getCloudflareContext) {
    try {
      const ctx = await mod.getCloudflareContext({ async: true });
      const fromBinding = ctx?.env?.[name];
      if (typeof fromBinding === "string" && fromBinding.trim()) {
        return fromBinding.trim();
      }
    } catch {
      // Local next dev without OpenNext bindings.
    }
  }

  const fromProcess = process.env[name];
  if (typeof fromProcess === "string" && fromProcess.trim()) {
    return fromProcess.trim();
  }

  return undefined;
}
