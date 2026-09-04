import { APP_CONFIG } from '@/app.Impl/configs/app-config';

export const USER_SESSION_CONSTS = {
  CHECK_SESSION_URL: APP_CONFIG.BASE_API_URL + "auth_auto/check-session",
  REFRESH_TOKEN_URL: APP_CONFIG.BASE_API_URL + "auth_auto/refresh",
  LOGIN_URL: "",
  LOGOUT_URL: ""
};

export const USER_SESSION_auto_device_CONSTS = {
  CHECK_SESSION_URL: APP_CONFIG.BASE_API_URL + "auth_auto/check-session",
  REFRESH_TOKEN_URL: APP_CONFIG.BASE_API_URL + "auth_auto/refresh",
  LOGIN_URL: "",
  LOGOUT_URL: ""
};

export const USER_SESSION_login_CONSTS = {
  CHECK_SESSION_URL: APP_CONFIG.BASE_API_URL + "auth/check-session",
  REFRESH_TOKEN_URL: APP_CONFIG.BASE_API_URL + "auth/refresh",
  LOGIN_URL: APP_CONFIG.BASE_API_URL + "auth/login",
  LOGOUT_URL: APP_CONFIG.BASE_API_URL + "auth/logout",
};