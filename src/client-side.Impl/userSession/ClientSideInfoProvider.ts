import DeviceInfo from 'react-native-device-info';
import { Platform } from "react-native";
import { ClientSideInfo } from '@/client-side.Commons/userSession/userSessionDto';

export class ClientSideInfoProvider {
    public static GetInstance(): ClientSideInfoProvider {
        if (!this._instance) {
            this._instance = new ClientSideInfoProvider();
            //initi code
        }
        return this._instance;
    }
    public async GetInfo(): Promise<ClientSideInfo> {
        return {
            ClientApplicationId:1,
            DeviceUID: await DeviceInfo.getUniqueId(),
            AppUID: DeviceInfo.getBundleId(),
            AppVersion: DeviceInfo.getVersion() + ' ' + (Platform.OS == 'ios' ? 'i-' : 'a-') + DeviceInfo.getBuildNumber(),
            CodeVersion:"1.0.0",
            PlatformName: Platform.OS,
            PlatformId: Platform.OS == 'ios' ? 1 : 2,
            FCM_FID: this.mNotificationToken??""

        }
    }
    /**
     * Human-readable platform/device description for troubleshooting, e.g.
     *  iOS 17.4 | Apple iPhone14,2 (iPhone 13 Pro)
     *  Android 14 (API 34) | Google Pixel 7 (panther) [emulator]
     */
    public GetPlatformDescription(): string {
        try {
            const isIos = Platform.OS === 'ios';
            const os = isIos
                ? `iOS ${DeviceInfo.getSystemVersion()}`
                : `Android ${DeviceInfo.getSystemVersion()} (API ${DeviceInfo.getApiLevelSync()})`;

            const brand = DeviceInfo.getBrand();
            const model = DeviceInfo.getModel();
            const deviceId = DeviceInfo.getDeviceId();
            // iOS: deviceId is the hardware identifier (iPhone14,2), model is the marketing name.
            // Android: model is the marketing name, deviceId is the board/codename.
            const device = isIos
                ? `${brand} ${deviceId} (${model})`
                : `${brand} ${model} (${deviceId})`;

            return `${os} | ${device}${DeviceInfo.isEmulatorSync() ? ' [emulator]' : ''}`;
        } catch (e) {
            return `${Platform.OS} ${Platform.Version} | unknown device`;
        }
    }
    public SetNotificationToken(token: string) {
        if (this.mNotificationToken) {
            console.warn('SetNotificationToken for the second time ' + (this.mNotificationToken != token))
        }
        else this.mNotificationToken = token;
    }
    private mNotificationToken?: string;
    private static _instance: ClientSideInfoProvider;
}