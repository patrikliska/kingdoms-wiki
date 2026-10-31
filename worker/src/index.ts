/** Cloudflare Worker entry. Config: ../wrangler.toml, secrets via `wrangler secret put`. */
import { handleReport, type ReportEnv } from './handler.ts';

export default {
  fetch: (request: Request, env: ReportEnv): Promise<Response> => handleReport(request, env),
};
