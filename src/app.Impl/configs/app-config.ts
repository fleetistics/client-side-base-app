import { BASE_URL } from "../../../server-side-base-url";

export const APP_CONFIG = {
  APP_NAME: "Flt Proto App",
  BASE_URL,
  BASE_API_URL: BASE_URL + "/api/",
  InstandMediaUpload: true
};
// export class AppConfig {

//   public static get APP_NAME() {
//     return "Flt Proto App";
//   }
//   public static get BASE_URL() {
//     return "http://192.168.100.180:7225";
//   }
//   // Endpoint for client-side diagnostic log uploads (flight recorder).
//   // Empty means the default `${BASE_URL}/api/client-log`.
//   public static get LOG_UPLOAD_URL() {
//     return AppConfig.BASE_URL + "/api/client-log";
//   }
//   public static get USER_SESSION_CHECK_SESSION_URI() {
//     return "/api/auth/CheckSession";
//   }
//   public static get USER_SESSION_REFRESH_TOKEN_URI() {
//     return "/api/auth/CheckSession";
//   }
//   public static get USER_SESSION_LOGIN_URI() {
//     return "/api/auth/login";
//   }
// }
