import { AppUserSettingsEnum } from "@/app.Commons/configs/user-settings-enum";
import { LocationService } from "@/app.Commons/services/location/locationService";
import { IPrivateModeChangeListener, myUserLocationPrivacyApi, SetPrivateModeChangeListener } from "@/client-side.Commons/dataLayer/api/user/myUserLocationPrivacyApi";
import { userApi } from "@/client-side.Commons/dataLayer/api/user/myUserApi";
import { store } from "@/client-side.Commons/dataLayer/core/store";
import { StaticAppSettings } from "@/client-side.Commons/lib/StaticAppSettings";
import { UserSessionContext } from "@/client-side.Commons/userSession/userSessionContext";

export class LocationReportEnabledManager implements IPrivateModeChangeListener {
    public static GetInstance(): LocationReportEnabledManager {
        return this._instance ??= new LocationReportEnabledManager();
    }
    public async Init(): Promise<boolean> {
        const privacyRequest = store.dispatch(myUserLocationPrivacyApi.endpoints.getMyUserLocationPrivacy.initiate());
        try {
            const privacy = await privacyRequest.unwrap();
            this.mIsPrivateMode = (privacy?.PrivacyMode ?? 0) > 0;
            this.mIsReportEnabled = UserSessionContext.CompanyId != undefined;

            SetPrivateModeChangeListener(this);
            return this.shouldDeviceReportLocation();
        } finally {
            // The values are held by this instance now; don't keep the queries subscribed.
            privacyRequest.unsubscribe();
        }
    }

    private constructor() {}

    protected shouldDeviceReportLocation(): boolean {
        return !this.mIsPrivateMode && this.mIsReportEnabled;
        //return !this.mIsPrivateMode && (this.mIsReportEnabled || StaticAppSettings.getBoolAppSettings(AppUserSettingsEnum.doReportLocationWithoutCompany, false) );
    }

    SetPrivateMode(isPrivate: boolean): void {
        this.mIsPrivateMode = isPrivate;
        LocationService.GetInstance().UpdateLocationReportState(this.shouldDeviceReportLocation());
    }
    IsReportEnabled(): boolean {
        return this.mIsReportEnabled;
    }
    SetReportEnabled(value: boolean): void {
        this.mIsReportEnabled = value;
        LocationService.GetInstance().UpdateLocationReportState(this.shouldDeviceReportLocation());
    }
    private mIsPrivateMode = false;
    private mIsReportEnabled = false;

    private static _instance: LocationReportEnabledManager | undefined;
}
