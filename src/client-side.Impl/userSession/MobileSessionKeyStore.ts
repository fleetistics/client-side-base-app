import * as Keychain from 'react-native-keychain';
import type { AuthenticationPrompt } from 'react-native-keychain';
import type { SessionKeyStorage } from '@/client-side.Commons/userSession/sessionKeyStore';
import { SetSessionKeyStore } from '@/client-side.Commons/userSession/userSessionApi';

export interface MobileSessionKeyStoreOptions {
    /** Keychain service name prefix. Default: 'fleetistics.session'. */
    Service?: string;
    /** Text of the system biometric prompt shown when the (biometric-protected) session key is read. */
    AuthenticationPrompt?: AuthenticationPrompt;
}

/** The rotating part of the session: what the server hands back on every check-session / refresh. */
export interface RotationKey {
    SessionSign: string;
    RotationCounter: number;
}
export interface SessionInfo {
    SessionKey?: string;
    AutoUserName?: string;
    AutoPassword?: string;
}

const BASE_SERVICE_NAME = 'fleetistics.session';
const NonBioAccessible = { accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

/**
 * Secure storage (iOS Keychain / Android Keystore, via react-native-keychain) for the values the
 * session layer keeps on the device. Each value has its own keychain entry (own `service` name):
 *
 *   SessionKey     `<service>.sessionKey`      or `<service>.sessionKey.bio` when biometrics are on
 *   RotationKey    `<service>.rotationKey`     never biometric
 *   GpsDeviceSerial `<service>.gpsSerial`      never biometric
 *
 * Only the session key can be put behind biometrics. Everything else is readable without a prompt
 * (after the first unlock following a reboot), so background work never triggers a Face ID dialog.
 *
 * It is also the app's SessionKeyStorage (the synchronous-getter view the session layer uses): the
 * three values are loaded into memory once by CheckDataLoaded(), and WriteRotation() writes through
 * to the entries above. Biometrics are off unless SetBiometricsEnabled(true) is called.
 */
export class MobileSessionKeyStore implements SessionKeyStorage {
    /** Creates the store and registers it with the user-session layer. Call once at startup. */
    public static Register(autoDeviceLoginMode?: boolean, authenticationPrompt?: AuthenticationPrompt) {
        this._instance = new MobileSessionKeyStore(autoDeviceLoginMode ?? false, authenticationPrompt);
        SetSessionKeyStore(this._instance);
    }

    public constructor(autoDeviceLoginMode: boolean, authenticationPrompt?: AuthenticationPrompt) {
        this.mAutoDeviceLoginMode = autoDeviceLoginMode;
        this.mReadSessionPrompt = authenticationPrompt ?? { title: 'Unlock your session', cancel: 'Cancel' };
        this.mSaveSessionPrompt = authenticationPrompt ?? { title: 'Save your session', cancel: 'Cancel' };
    }

    // ---- SessionKeyStorage (in-memory view, written through to the entries below) ----

    public get SessionKey(): string {
        return this.mSessionKey;
    }
    public get SessionSign(): string {
        return this.mSessionSign;
    }
    public get RotationCounter(): number {
        return this.mRotationCounter;
    }

    /**
     * Loads the stored values into memory once (single-flight). If the session key is biometric this
     * shows the prompt. A cancelled / failed unlock leaves the store empty ("signed out") and the next
     * call retries; nothing is applied from a half-readable state.
     */
    public async CheckSessionDataLoaded(): Promise<boolean> {
        if (this.mDataStatus != -1) return (this.mDataStatus == 1);
        try {
            this.mBiometryType = await Keychain.getSupportedBiometryType();
            const hasRotation = await Keychain.hasGenericPassword(this.RotationKeyOptions());
            const hasSessionInfo = await Keychain.hasGenericPassword(this.SessionInfoOptions());
            const hasBioSessionInfo = await Keychain.hasGenericPassword(this.BioSessionInfoOptions());
            if (hasRotation && (hasSessionInfo || hasBioSessionInfo)) {
                if (await this.loadRotationKey()) {
                    const keyResult = await this.loadSessionKey(hasBioSessionInfo);
                    if (keyResult === 1) {
                        this.mIsBiometryEnabled = hasBioSessionInfo;
                        this.mDataStatus = 1; // loaded
                        return true;
                    }
                    // Don't keep a rotation key in memory without the session key it belongs to.
                    this.mSessionSign = '';
                    this.mRotationCounter = -1;
                    if (keyResult === -1) {
                        // The read was rejected (biometric cancelled / locked out / failed): the key may
                        // still be there, so leave the status "unknown" and let the next check retry.
                        this.mDataStatus = -1;
                        return false;
                    }
                }
            }

        } catch (err) {
            console.error('MobileSessionKeyStore::CheckSessionDataLoaded Failed to check session data', err);
        }
        this.mDataStatus = 0; // not loaded
        return false;

    }
    private async loadRotationKey(): Promise<boolean> {
        try {
            const creds = await Keychain.getGenericPassword(this.RotationKeyOptions());
            if (creds) {
                const res = JSON.parse(creds.password) as RotationKey;
                this.mSessionSign = res.SessionSign;
                this.mRotationCounter = res.RotationCounter;
                return true
            }

        } catch {
        }
        this.mSessionSign = '';
        this.mRotationCounter = -1;
        return false;
    }

    /**
     * Reads the session key into memory.
     * Returns 1 = the key was read, 0 = there is no usable key (nothing stored / empty / corrupt),
     * -1 = the read was rejected (e.g. biometric prompt cancelled, lockout, auth failure).
     */
    private async loadSessionKey(isBio: boolean): Promise<1 | 0 | -1> {
        this.mSessionKey = '';
        try {
            const creds = await Keychain.getGenericPassword({
                ... (isBio ? this.BioSessionInfoOptions() : this.SessionInfoOptions()),
                authenticationPrompt: this.mReadSessionPrompt,
            });
            if (!creds) return 0;
            const res = JSON.parse(creds.password) as SessionInfo;
            if (!res?.SessionKey) return 0;
            this.mSessionKey = res.SessionKey;
            return 1;
        } catch (err) {
            // The keychain rejected the read. Log the code so a cancel can be told from a lockout.
            console.warn('MobileSessionKeyStore::loadSessionKey rejected', (err as { code?: string } | null)?.code ?? err);
            return -1;
        }
    }
    /** Signs out locally: forgets the session key and rotation key. The GPS device serial is kept. */
    public Clear(): Promise<void> {
        this.mSessionKey = '';
        this.mSessionSign = '';
        this.mRotationCounter = -1;
        this.mDataStatus = 0;
        if (this.mAutoDeviceLoginMode) return this.Enqueue(async () => {
            await Promise.all([
                Keychain.resetGenericPassword(this.RotationKeyOptions()),
            ]);
        });
        else return this.Enqueue(async () => {
            await Promise.all([
                Keychain.resetGenericPassword(this.RotationKeyOptions()),
                Keychain.resetGenericPassword(this.SessionInfoOptions()),
                Keychain.resetGenericPassword(this.BioSessionInfoOptions()),
            ]);
        });
    }
    public Wipe(): Promise<void> {
        this.mSessionKey = '';
        this.mSessionSign = '';
        this.mRotationCounter = -1;
        this.mDataStatus = 0;
        return this.Enqueue(async () => {
            await Promise.all([
                Keychain.resetGenericPassword(this.RotationKeyOptions()),
                Keychain.resetGenericPassword(this.SessionInfoOptions()),
                Keychain.resetGenericPassword(this.BioSessionInfoOptions()),
            ]);
        });
    }




    public WriteRotation(SessionSign: string, RotationCounter: number): Promise<void> {
        this.mSessionSign = SessionSign;
        this.mRotationCounter = RotationCounter;
        return this.Enqueue(async () => {
            // Memory already holds the new values and the server has already rotated, so a failed save
            // must not fail the request that carried the rotation (worst case: next launch loads an older one).
            try {
                const saved = await Keychain.setGenericPassword('RotationKey', JSON.stringify({ SessionSign, RotationCounter } as RotationKey), {
                    ...this.RotationKeyOptions(), ...NonBioAccessible
                });
                if (!saved) console.error('keychain refused to save the rotation key');
            } catch (err) {
                console.error('MobileSessionKeyStore::WriteRotation failed to persist the rotation key', err);
            }
        });
    }

    public async SaveSessionData(SessionKey: string, SessionSign: string, RotationCounter: number, doEnableBiometry: boolean): Promise<void> {
        await this.WriteSessionKey(SessionKey, doEnableBiometry);
        await this.WriteRotation(SessionSign, RotationCounter);
        this.mDataStatus = 1;
    }
    private async WriteSessionKey(SessionKey: string, doEnableBiometry: boolean): Promise<void> {
        if (this.mBiometryType === null) doEnableBiometry = false;
        let tryNonBio = !doEnableBiometry;
        const payload = JSON.stringify({ SessionKey } as SessionInfo);

        if (doEnableBiometry) {
            try {
                const savedBio = await Keychain.setGenericPassword('SessionInfo', payload, {
                    ...this.BioSessionInfoOptions(),
                    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
                    authenticationPrompt: this.mSaveSessionPrompt,
                    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                    // Android: RSA encrypts with the public key (no prompt on write); only decrypt needs the biometric.
                    storage: Keychain.STORAGE_TYPE.RSA,

                });
                if (!savedBio) {
                    console.error('MobileSessionKeyStore::WriteSessionKey keychain refused to BIO save the session key');
                    tryNonBio = true;
                }

            }
            catch (err) {
                console.error('MobileSessionKeyStore::WriteSessionKey Failed to save sessionKey data with biometry', err);
                tryNonBio = true;
            }
        }
        if (tryNonBio) {
            doEnableBiometry = false; // fallback to non-biometric storage
            const saved = await Keychain.setGenericPassword('SessionInfo', payload, {
                ...this.SessionInfoOptions(),
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY

            });
            if (!saved) {
                console.error('MobileSessionKeyStore::WriteSessionKey keychain refused to save the session key');
                throw new Error('keychain refused to save the session key');
            }

        }
        await Keychain.resetGenericPassword(
            doEnableBiometry ? this.SessionInfoOptions() : this.BioSessionInfoOptions());
        this.mSessionKey = SessionKey;
        this.mIsBiometryEnabled = doEnableBiometry;

    }
    //------------- auto login --------------
    public async GetSessionInfo(): Promise<SessionInfo | null> {
        const hasSessionInfo = await Keychain.hasGenericPassword(this.SessionInfoOptions());
        const hasBioSessionInfo = await Keychain.hasGenericPassword(this.BioSessionInfoOptions());
        if (!hasSessionInfo && !hasBioSessionInfo) return null;
        try {
            const creds = await Keychain.getGenericPassword({
                ... (hasBioSessionInfo ? this.BioSessionInfoOptions() : this.SessionInfoOptions()),
                authenticationPrompt: this.mReadSessionPrompt,
            });
            if (!creds) return null;
            this.mIsBiometryEnabled = hasBioSessionInfo;
            return JSON.parse(creds.password) as SessionInfo;
        } catch (err) {
            // The keychain rejected the read. Log the code so a cancel can be told from a lockout.
            console.warn('MobileSessionKeyStore::loadSessionKey rejected', (err as { code?: string } | null)?.code ?? err);
            return null;
        }
    }
    public async WriteSessionInfo(sessionInfo: SessionInfo): Promise<void> {
        let doEnableBiometry = this.mIsBiometryEnabled && this.mBiometryType !== null;
        let tryNonBio = !doEnableBiometry;
        const payload = JSON.stringify(sessionInfo);

        if (doEnableBiometry) {
            try {
                const savedBio = await Keychain.setGenericPassword('SessionInfo', payload, {
                    ...this.BioSessionInfoOptions(),
                    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
                    authenticationPrompt: this.mSaveSessionPrompt,
                    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                    // Android: RSA encrypts with the public key (no prompt on write); only decrypt needs the biometric.
                    storage: Keychain.STORAGE_TYPE.RSA,

                });
                if (!savedBio) {
                    console.error('MobileSessionKeyStore::WriteSessionKey keychain refused to BIO save the session key');
                    tryNonBio = true;
                }

            }
            catch (err) {
                console.error('MobileSessionKeyStore::WriteSessionKey Failed to save sessionKey data with biometry', err);
                tryNonBio = true;
            }
        }
        if (tryNonBio) {
            doEnableBiometry = false; // fallback to non-biometric storage
            const saved = await Keychain.setGenericPassword('SessionInfo', payload, {
                ...this.SessionInfoOptions(),
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY

            });
            if (!saved) {
                console.error('MobileSessionKeyStore::WriteSessionKey keychain refused to save the session key');
                throw new Error('keychain refused to save the session key');
            }

        }
        await Keychain.resetGenericPassword(
            doEnableBiometry ? this.SessionInfoOptions() : this.BioSessionInfoOptions());
        this.mSessionKey = sessionInfo.SessionKey ? sessionInfo.SessionKey : '';
        this.mIsBiometryEnabled = doEnableBiometry;
    }
    public async SaveAutoSessionData(sessionInfo: SessionInfo, SessionSign: string, RotationCounter: number): Promise<void> {
        await this.WriteSessionInfo(sessionInfo);
        await this.WriteRotation(SessionSign, RotationCounter);
        this.mDataStatus = 1;
    }    
    //-------------------------------------------------

    public HasGpsDeviceSerial(): Promise<boolean> {
        return Keychain.hasGenericPassword(this.GpsSerialOptions());
    }

    /** The saved serial, or null when none is saved. */
    public async GetGpsDeviceSerial(): Promise<string | null> {
        const creds = await Keychain.getGenericPassword(this.GpsSerialOptions());
        return creds ? creds.password : null;
    }

    public async SaveGpsDeviceSerial(serial: string | null): Promise<void> {
        if (serial === null) {
            await Keychain.resetGenericPassword(this.GpsSerialOptions());
            return;
        }
        else {
            const saved = await Keychain.setGenericPassword('GpsDeviceSerial', serial, { ...this.GpsSerialOptions(), ...NonBioAccessible });
            if (!saved) throw new Error('keychain refused to save the GPS device serial');
        }
    }


    //-----------------------------------------------------------




    public async SetBiometricsEnabled(enabled: boolean): Promise<void> {
        if (this.mDataStatus == 1 && this.mSessionKey && this.mIsBiometryEnabled != enabled) {
            await this.WriteSessionKey(this.mSessionKey, enabled);
        }
    }










    private SessionInfoOptions(): Keychain.BaseOptions {
        return { service: BASE_SERVICE_NAME + '.sessionKey' };
    }
    private BioSessionInfoOptions(): Keychain.BaseOptions {
        return { service: BASE_SERVICE_NAME + '.sessionKey.bio' };
    }

    private RotationKeyOptions(): Keychain.BaseOptions {
        return { service: BASE_SERVICE_NAME + '.rotationKey' };
    }

    private GpsSerialOptions(): Keychain.BaseOptions {
        return { service: BASE_SERVICE_NAME + '.gpsSerial' };
    }

    /** Serialises session-key writes so Save and SetBiometricsEnabled can't interleave. */
    private Enqueue<T>(job: () => Promise<T>): Promise<T> {
        const run = this.mQueue.then(job, job);
        this.mQueue = run.then(
            () => undefined,
            () => undefined
        );
        return run;
    }


    public static GetBiometryType(): Keychain.BIOMETRY_TYPE | null {
        return this._instance!.mBiometryType;
    }

    public static IsBiometryEnabled(): boolean {
        return this._instance!.mIsBiometryEnabled;
    }
    public static SetBiometryEnabled(value: boolean) {

    }

    public static GetInstance(): MobileSessionKeyStore {
        return this._instance!;
    }
    private mIsBiometryEnabled: boolean = false;
    private mBiometryType: Keychain.BIOMETRY_TYPE | null = null;
    private mDataStatus: number = -1;
    private mSessionKey = '';
    private mSessionSign = '';
    private mRotationCounter = 0;
    //private readonly mPrompt: AuthenticationPrompt;
    private mReadSessionPrompt: AuthenticationPrompt;
    private mSaveSessionPrompt: AuthenticationPrompt;
    private readonly mAutoDeviceLoginMode: boolean = false;

    private mQueue: Promise<void> = Promise.resolve();

    private static _instance: MobileSessionKeyStore | null = null;
}
