import { BASE_URL } from "@server-side-base-url";

/** How the server identifies users for registration and password reset (server setting Auth:EmailMode). */
export type EmailMode = 'UniqueUserName' | 'UniqueEmail';

export const APP_CONFIG = {
  APP_NAME: "Flt Proto App",
  BASE_URL,
  BASE_API_URL: BASE_URL + "/api/",
  InstandMediaUpload: true,
  ReportLocationMode: false,
  BASE_TEAM_JOIN_LINK:"team://",
  // How often TeamContextService polls GET .../context/delta while a team is active
  // and the app is foregrounded.
  TeamContextUpdatePeriodMs: 15000,
  // Fixed IDs assigned by the backend for this app/platform build — must match
  // the values registered server-side. Not derived at runtime.
  ClientAppId: 1,
  // Must match the server's Auth:EmailMode. 'UniqueEmail': e-mail is the login name, so the
  // forms ask for an e-mail only; 'UniqueUserName': they also ask for a user name.
  EmailMode: 'UniqueUserName' as EmailMode,
};
