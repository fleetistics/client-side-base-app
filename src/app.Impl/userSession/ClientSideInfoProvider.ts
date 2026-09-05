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
            DeviceUID: await DeviceInfo.getUniqueId(),
            AppUID: DeviceInfo.getBundleId(),
            AppVersion: DeviceInfo.getVersion() + ' ' + (Platform.OS == 'ios' ? 'i-' : 'a-') + DeviceInfo.getBuildNumber(),
            CodeVersion:"1.0.0",
            PlatformName: Platform.OS,
            FCMToken: this.mNotificationToken??""

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