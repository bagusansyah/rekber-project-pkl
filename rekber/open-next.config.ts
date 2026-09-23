// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
	// Using default memory cache instead of R2 for simpler deployment
	// To use R2 cache, create an R2 bucket and configure wrangler.toml
});
