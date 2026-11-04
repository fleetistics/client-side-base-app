import { AppUserSettingsEnum } from "@/app.Commons/configs/user-settings-enum";
import { LocationService } from "@/app.Commons/services/location/locationService";
import { SetPrivateModeChangeListener } from "@/client-side.Commons/dataLayer/api/user/myUserLocationPrivacyApi";
import { IPrivateModeChangeListener } from "@/client-side.Commons/lib/private-mode-change-listener";
import { StaticAppSettings } from "@/client-side.Commons/lib/StaticAppSettings";

export class LocationReportEnabledManager implements IPrivateModeChangeListener {
    public static GetInstance(): LocationReportEnabledManager {

        return this._instance;
    }
    public static Init(isPrivateMode: boolean, hasCompany:boolean) {
        this._instance = new LocationReportEnabledManager(isPrivateMode, hasCompany);
        SetPrivateModeChangeListener(this._instance);
    }
    constructor(isPrivateMode: boolean, hasCompany:boolean) {
        this._hasCompany = hasCompany;
        this._isPrivateMode = isPrivateMode;
    }
    public ShouldReportLocation(): boolean {
        return !this._isPrivateMode && ( this._hasCompany || StaticAppSettings.getBoolAppSettings(AppUserSettingsEnum.doReportLocationWithoutCompany, false) );
    }
    SetPrivateMode(isPrivate: boolean): void {
        this._isPrivateMode = isPrivate;
        LocationService.GetInstance().UpdateLocationReportState(this.ShouldReportLocation());
    }
    SetHasCompany(hasCompany: boolean): void {
        this._hasCompany = hasCompany;
        LocationService.GetInstance().UpdateLocationReportState(this.ShouldReportLocation());
    }
    private _hasCompany: boolean;
    private _isPrivateMode: boolean;

    private static _instance: LocationReportEnabledManager;
}