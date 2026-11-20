//import { MobileSessionKeyStore } from "./MobileSessionKeyStore";
import DeviceInfo from 'react-native-device-info';
//import { v4 as uuidv4 } from 'uuid';

export class MobileGpsDeviceProvider {
    public static async GetDeviceSerialNumber():Promise<string> {
        // if ( await MobileSessionKeyStore.GetInstance().HasGpsDeviceSerial()) {
        //     const serial = await MobileSessionKeyStore.GetInstance().GetGpsDeviceSerial();
        //     if (serial) return serial;
        // }
        // // Device id + a random v4 GUID (uuid uses crypto.getRandomValues, polyfilled by
        // // react-native-get-random-values in index.js), so the serial is unique even if the
        // // platform id is shared or reset.
        // const serial = `${await DeviceInfo.getUniqueId()}-${uuidv4()}`;


        // await MobileSessionKeyStore.GetInstance().SaveGpsDeviceSerial(serial);
        // return serial;
        return await DeviceInfo.getUniqueId();
    }
}
    