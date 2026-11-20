import { APP_CONFIG } from '@/client-side.Impl/config/app-config';

export const USER_SESSION_CONSTS = {
  AUTO_LOGIN_MODE: true,
  SESSION_CREDENTIALS_MODE: 'omit' as RequestCredentials_,
  CHECK_SESSION_URL: APP_CONFIG.BASE_API_URL + "auth/check-session",
  REFRESH_TOKEN_URL: APP_CONFIG.BASE_API_URL + "auth/refresh",
  LOGIN_URL: APP_CONFIG.BASE_API_URL + "auth/app_auto_login",
  LOGOUT_URL: APP_CONFIG.BASE_API_URL + "auth/logout",
  
};

export const USER_SESSION_auto_device_CONSTS = {
  CHECK_SESSION_URL: APP_CONFIG.BASE_API_URL + "auth_auto/check-session",
  REFRESH_TOKEN_URL: APP_CONFIG.BASE_API_URL + "auth_auto/refresh"
};

export const USER_SESSION_login_CONSTS = {
  CHECK_SESSION_URL: APP_CONFIG.BASE_API_URL + "auth/check-session",
  REFRESH_TOKEN_URL: APP_CONFIG.BASE_API_URL + "auth/refresh"
};

/** Anonymous account endpoints: registration and the password-reset flow. */
export const USER_ACCOUNT_CONSTS = {
  REGISTER_URL: APP_CONFIG.BASE_API_URL + "user/app_register",
  REQUEST_PASSWORD_RESET_URL: APP_CONFIG.BASE_API_URL + "auth/request-password-reset",
  RESET_PASSWORD_URL: APP_CONFIG.BASE_API_URL + "auth/reset-password",
};