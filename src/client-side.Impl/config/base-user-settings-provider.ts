import { CommonUserSettings } from "@/client-side.Commons/configs/user-settings";
import ObjectUtils from "@/client-side.Commons/helpers/ObjectUtils";
import { UserSettings } from "./user-settings";
import { AppUserSettings } from "@/app.Commons/configs/user-settings";

export class BaseUserSettingsProvider {
    /** Default values of all settings: common, then app, then platform (later ones win). */
    public static GetSettings() {
        const res = {} as any;
        ObjectUtils.extendEntity(CommonUserSettings.GetSettings(), res);
        ObjectUtils.extendEntity(AppUserSettings.GetSettings(), res);
        ObjectUtils.extendEntity(UserSettings.GetSettings(), res);

        return res;
    }
}
