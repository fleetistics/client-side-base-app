import { GetPhoneCountries, ParsePhoneInput, SplitStoredPhone, FormatPhoneForStorage, GetPhoneFormatHint, DetectDeviceRegion } from '@/app.Commons/helpers/phone-countries';

describe('phone-countries', () => {
  it('lists countries', () => {
    const c = GetPhoneCountries();
    expect(c.length).toBeGreaterThan(200);
    expect(c.find((x) => x.region === 'GB')?.dialCode).toBe('+44');
  });
  it('follows the typed international number', () => {
    expect(ParsePhoneInput('+44 20 7946 0958', 'US')).toEqual({ text: '020 7946 0958', region: 'GB', isValid: true });
    expect(ParsePhoneInput('813555', 'US').isValid).toBe(false);
    expect(ParsePhoneInput('2015550123', 'US')).toMatchObject({ text: '(201) 555-0123', region: 'US', isValid: true });
    expect(ParsePhoneInput('12', 'US')).toEqual({ text: '12', region: 'US', isValid: false });
  });
  it('round trips storage', () => {
    expect(FormatPhoneForStorage('(201) 555-0123', 'US')).toBe('+1 201-555-0123');
    expect(SplitStoredPhone('+1 201-555-0123')).toEqual({ region: 'US', national: '(201) 555-0123' });
    expect(SplitStoredPhone('+44 20 7946 0958').region).toBe('GB');
    expect(FormatPhoneForStorage('', 'US')).toBeNull();
    expect(GetPhoneFormatHint('US')).toContain('(+1)');
    expect(typeof DetectDeviceRegion()).toBe('string');
  });
});
