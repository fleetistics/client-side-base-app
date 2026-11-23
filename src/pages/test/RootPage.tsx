import { useState } from 'react';
import { DevSettings, Platform, Switch, View } from 'react-native';
import { Text } from '@/app.Commons/components/controls/text';
import { Button } from '@/app.Commons/components/controls/button';
import { GlobalToast } from '@/client-side.Commons/lib/global-toast';
import { useLogoutMutation } from '@/client-side.Commons/userSession/userSessionApi';
import { LocationReportEnabledManager } from '@/client-side.Impl/services/location-report-enabler';
import { MobileSessionKeyStore } from '@/client-side.Impl/userSession/MobileSessionKeyStore';
import type { ScreenProps } from '@/navigator/pages-config';

export function RootPage({ navigation }: ScreenProps<'RootPage'>) {
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  // null = the device has no (enrolled) biometrics: the switch is disabled.
  const biometryType = MobileSessionKeyStore.GetBiometryType();
  const [isBiometryEnabled, setIsBiometryEnabled] = useState(() => MobileSessionKeyStore.IsBiometryEnabled());
  const [isBiometryBusy, setIsBiometryBusy] = useState(false);

  const toggleBiometry = async (enabled: boolean) => {
    setIsBiometryBusy(true);
    try {
      await MobileSessionKeyStore.GetInstance().SetBiometricsEnabled(enabled);
    } catch (error) {
      GlobalToast.ShowError('Could not change the biometric setting');
      console.warn('[RootPage] SetBiometricsEnabled failed', error);
    } finally {
      // Show what was actually stored: the store falls back to non-biometric storage if the write fails.
      setIsBiometryEnabled(MobileSessionKeyStore.IsBiometryEnabled());
      setIsBiometryBusy(false);
    }
  };

  const [isReportEnabled, setIsReportEnabled] = useState(() => LocationReportEnabledManager.GetInstance().IsReportEnabled());
  const toggleReportEnabled = (enabled: boolean) => {
    LocationReportEnabledManager.GetInstance().SetReportEnabled(enabled);
    setIsReportEnabled(enabled);
  };

  // Reloads the JS bundle (not a native process restart). DevSettings.reload only works in dev builds.
  const restart = () => {
    if (Platform.OS === 'web') (globalThis as any).location.reload();
    else DevSettings.reload();
  };

  const wipe = async () => {
    try {
      await MobileSessionKeyStore.GetInstance().Wipe();
      GlobalToast.ShowSuccess('Session data wiped');
    } catch (error) {
      GlobalToast.ShowError('Could not wipe the session data');
      console.warn('[RootPage] Wipe failed', error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <Text className="text-lg font-medium">RootPage</Text>
      <Button onPress={() => navigation.navigate('EditUserProfile')}>
        <Text>Edit Profile</Text>
      </Button>
      <Button onPress={() => navigation.navigate('ReportIssuePage')}>
        <Text>Report an Issue</Text>
      </Button>
      <Button onPress={() => navigation.navigate('CreateTeamPage')}>
        <Text>Create Team</Text>
      </Button>
      <Button variant="outline" onPress={() => navigation.navigate('CrashTestPage')}>
        <Text>Crash Test</Text>
      </Button>
      <Button testID="nav-map-button" onPress={() => navigation.navigate('MainMap')}>
        <Text>Map</Text>
      </Button>
      <View className="flex-row items-center gap-3">
        <Text>Unlock with biometrics</Text>
        <Switch
          testID="biometry-switch"
          value={isBiometryEnabled}
          disabled={biometryType == null || isBiometryBusy}
          onValueChange={toggleBiometry}
        />
      </View>
      <View className="flex-row items-center gap-3">
        <Text>Location report enabled</Text>
        <Switch
          testID="location-report-enabled-switch"
          value={isReportEnabled}
          onValueChange={toggleReportEnabled}
        />
      </View>
      <Button variant="destructive" disabled={isLoggingOut} onPress={() => logout()}>
        <Text>Logout</Text>
      </Button>
      <Button testID="restart-button" variant="outline" onPress={restart}>
        <Text>Restart</Text>
      </Button>
      <Button testID="wipe-button" variant="destructive" onPress={wipe}>
        <Text>Wipe</Text>
      </Button>
    </View>
  );
}
