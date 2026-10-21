import i18next from 'i18next';
import { initI18n } from '@/client-side.Commons/i18n/i18n';
import { reactNativeI18nPlatform } from '@/app.Commons/i18n/platform';

test('test mode t() returns the text it was asked to translate', async () => {
  await initI18n(reactNativeI18nPlatform, { noTranslation: true });
  expect(i18next.t('Team Name')).toBe('Team Name');
  expect(i18next.t('Invalid phone format. Expected:')).toBe('Invalid phone format. Expected:');
});
