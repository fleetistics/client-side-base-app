import { APP_CONFIG } from '@/app.Impl/configs/app-config';

const BASE_USERS_URL = APP_CONFIG.BASE_API_URL + 'users';
const EMERGENCY_ALERT_URL = BASE_USERS_URL + '/me/emergency-alert';

export const APP_URLS = {
  UPLOAD_URL: APP_CONFIG.BASE_API_URL + "media/upload",
  CLIENT_LOG_PACK_URL: APP_CONFIG.BASE_API_URL + "client-log-pack",
  LOCATION_REPORT_URL: APP_CONFIG.BASE_API_URL + "mobile-gps/location-report",
  BASE_USERS_URL,
  ACTIVE_EMERGENCY_ALERT_URL: BASE_USERS_URL + '/me/active-emergency-alert',
  EMERGENCY_ALERT_URL,
  COMPLETE_EMERGENCY_ALERT_URL: EMERGENCY_ALERT_URL + '/complete',
};