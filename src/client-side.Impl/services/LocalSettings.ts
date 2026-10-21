import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_SETTINGS_KEY = 'AppUserSettings.Local';
const SESSION_SETTINGS_KEY = 'AppUserSettings.Session';

export class LocalSettings {
    public static GetSettings(): Promise<string | null> {
        return AsyncStorage.getItem(LOCAL_SETTINGS_KEY);
    }

    public static async SaveSettings(json: string): Promise<void> {
        await AsyncStorage.setItem(LOCAL_SETTINGS_KEY, json);
    }

    public static GetSessionSettings(): Promise<string | null> {
        return AsyncStorage.getItem(SESSION_SETTINGS_KEY);
    }

    public static async SaveSessionSettings(json: string): Promise<void> {
        await AsyncStorage.setItem(SESSION_SETTINGS_KEY, json);
    }
}
