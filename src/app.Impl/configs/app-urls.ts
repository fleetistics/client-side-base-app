import { APP_CONFIG } from '@/app.Impl/configs/app-config';

export const APP_URLS = {
  UPLOAD_URL: APP_CONFIG.BASE_API_URL + "media/upload",
  CLIENT_LOG_PACK_URL: APP_CONFIG.BASE_API_URL + "client-log-pack",
  LOCATION_REPORT_URL: APP_CONFIG.BASE_API_URL + "mobile-gps/location-report",
};