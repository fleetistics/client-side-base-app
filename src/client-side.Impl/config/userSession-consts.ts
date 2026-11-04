import { APP_CONFIG } from '@/client-side.Impl/config/app-config';

export const USER_SESSION_CONSTS = {
  CHECK_SESSION_URL: APP_CONFIG.BASE_API_URL + "auth/check-session",
  REFRESH_TOKEN_URL: APP_CONFIG.BASE_API_URL + "auth/refresh"
  
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
  LOGIN_URL: APP_CONFIG.BASE_API_URL + "auth/login",
  LOGOUT_URL: APP_CONFIG.BASE_API_URL + "auth/logout",
  REGISTER_URL: APP_CONFIG.BASE_API_URL + "auth/register",
  REQUEST_PASSWORD_RESET_URL: APP_CONFIG.BASE_API_URL + "auth/request-password-reset",
  RESET_PASSWORD_URL: APP_CONFIG.BASE_API_URL + "auth/reset-password",
};