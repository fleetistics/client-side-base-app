import { ClientSideInfoProvider } from "@/client-side.Commons/userSession/ClientSideInfoProvider";
import DeviceInfo from 'react-native-device-info';
import { PixelRatio, Platform } from "react-native";
import { APP_HASH } from "@app-hash";
import { APP_ID } from "../../../app-id";

export class MobileClientSideInfoProvider extends ClientSideInfoProvider {
    public static Register(): MobileClientSideInfoProvider {
        const instance = new MobileClientSideInfoProvider();
        ClientSideInfoProvider.SetInstance(instance);
        return instance;
    }
    protected constructor() {
        super();
        this.mApplicationId = APP_ID;
        this.mAppHash = APP_HASH;
        this.mAppVersion = DeviceInfo.getVersion() + '.' + DeviceInfo.getBuildNumber();
        this.mPlatformId = Platform.OS === 'ios' ? 2 : 1;
        this.mPlatformDetails = MobileClientSideInfoProvider.BuildPlatformDetails();
    }

    /** Device UID / MAC / IP / device name are intentionally not collected. */
    private static BuildPlatformDetails(): string {
        try {
            const rn = Platform.constants.reactNativeVersion;
            const locale = Intl.DateTimeFormat().resolvedOptions();
            return JSON.stringify({
                os: Platform.OS,
                osVersion: DeviceInfo.getSystemVersion(),
                apiLevel: Platform.OS === 'android' ? Platform.Version : undefined,
                brand: DeviceInfo.getBrand(),
                model: DeviceInfo.getModel(),
                deviceId: DeviceInfo.getDeviceId(),
                emulator: DeviceInfo.isEmulatorSync(),
                ramMB: Math.round(DeviceInfo.getTotalMemorySync() / (1024 * 1024)),
                fontScale: PixelRatio.getFontScale(),
                installer: DeviceInfo.getInstallerPackageNameSync(),
                rn: `${rn.major}.${rn.minor}.${rn.patch}`,
                locale: locale.locale,
                tz: locale.timeZone,
                time: new Date().toISOString(),   // captured at startup, not per request
            });
        } catch (e) {
            return JSON.stringify({ os: Platform.OS, error: String(e) });
        }
    }
}
