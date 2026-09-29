import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/app.Commons/components/controls/button';
import { Text } from '@/app.Commons/components/controls/text';
import { GlobalToast } from '@/app.Commons/utils/global-toast';
import { GlobalAlert } from '@/app.Commons/utils/global-alert';
import { useGetUserPrivacyMode, useSwitchUserPrivacyMode } from '@/app.Commons/dataLayer/api/user/myUserApi';

export function CrashTestPage() {
  const [shouldCrash, setShouldCrash] = useState(false);
  const { data: isPrivacyModeOn, isLoading: isPrivacyModeLoading } = useGetUserPrivacyMode();
  const [, privacySync, togglePrivacyMode] = useSwitchUserPrivacyMode();

  // Thrown during render (not inside the onPress handler) so React's error boundary
  // actually catches it — a throw inside an event handler is not a React render error
  // and would just propagate as an uncaught exception instead.
  if (shouldCrash) {
    throw new Error('Simulated unhandled exception from CrashTestPage');
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <Text className="text-lg font-medium">Crash Test</Text>
      <Text className="text-center text-sm text-muted-foreground">
        Triggers a render-time exception to verify the app-wide error boundary.
      </Text>
      <Button variant="destructive" onPress={() => setShouldCrash(true)}>
        <Text>Throw unhandled exception</Text>
      </Button>
      <Text>PrivacyMode: {isPrivacyModeLoading ? 'loading...' : isPrivacyModeOn ? 'on' : 'off'}</Text>
      <Text testID="privacy-sync-state">
        Sync: {privacySync.failed ? `failed (${privacySync.failed.lastError})` : privacySync.isSending ? 'sending...' : privacySync.isPending ? 'pending' : 'synced'}
      </Text>
      <Button
        // No need to block while a change is queued: repeated switches coalesce to the latest value.
        disabled={isPrivacyModeLoading}
        onPress={() => togglePrivacyMode()}
      >
        <Text>Switch Privacy Mode</Text>
      </Button>
      <Button onPress={() => GlobalToast.ShowError('This is a test error toast message')}>
        <Text>Show Error Toast</Text>
      </Button>
      <Button onPress={() => GlobalToast.ShowWarning('This is a test warning toast message')}>
        <Text>Show Warning Toast</Text>
      </Button>
      <Button onPress={() => GlobalToast.ShowSuccess('This is a test success toast message')}>
        <Text>Show Success Toast</Text>
      </Button>
      <Button onPress={() => GlobalAlert.ShowInfo('This is a test info alert message')}>
        <Text>Show Info Alert</Text>
      </Button>
      <Button onPress={() => GlobalAlert.ShowWarning('This is a test warning alert message')}>
        <Text>Show Warning Alert</Text>
      </Button>
      <Button
        onPress={() =>
          GlobalAlert.ShowWarningQuestion(
            'This is a test warning question message',
            'Are you sure?',
            'Yes',
            () => GlobalToast.ShowSuccess('Warning question confirmed')
          )
        }
      >
        <Text>Show Warning Question Alert</Text>
      </Button>
      <Button
        variant="destructive"
        onPress={() => GlobalAlert.ShowError('This is a test error alert message')}
      >
        <Text>Show Error Alert</Text>
      </Button>
    </View>
  );
}
