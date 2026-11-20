import { MobileSessionKeyStore, SessionInfo } from "./MobileSessionKeyStore";
import DeviceInfo from 'react-native-device-info';
import { v4 as uuidv4 } from 'uuid';

export class AutoLoginProvider {
    public static async GetAutoLoginInfo():Promise<SessionInfo> {
        var sessionInfo = await MobileSessionKeyStore.GetInstance().GetSessionInfo();
        if (!sessionInfo?.AutoUserName || !sessionInfo.AutoPassword) {
            var deiceUID = await DeviceInfo.getUniqueId();
            sessionInfo = {} as SessionInfo;
            sessionInfo.AutoUserName = uuidv4() + "-|-" +deiceUID;
            sessionInfo.AutoPassword = uuidv4();    
            await MobileSessionKeyStore.GetInstance().WriteSessionInfo(sessionInfo);
        }
        return sessionInfo;
    }
}