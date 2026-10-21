import { View } from 'react-native';
import { Text } from '@/app.Commons/components/controls/text';
import { Button } from '@/app.Commons/components/controls/button';
import type { ScreenProps } from '@/navigator/pages-config';

export function RootPage({ navigation }: ScreenProps<'RootPage'>) {
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
    </View>
  );
}
