import { BASE_URL } from "@server-side-base-url";

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
  ClientAppId: 1
};
