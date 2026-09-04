import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import type { NavigatorPages } from '@/navigator/pages-config';

export function RootPage() {
  const navigation = useNavigation<NativeStackNavigationProp<NavigatorPages>>();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <Text className="text-lg font-medium">RootPage</Text>
      <Button onPress={() => navigation.navigate('EditUserProfile')}>
        <Text>Edit Profile</Text>
      </Button>
      <Button onPress={() => navigation.navigate('ReportIssuePage')}>
        <Text>Report an Issue</Text>
      </Button>
      <Button variant="outline" onPress={() => navigation.navigate('CrashTestPage')}>
        <Text>Crash Test</Text>
      </Button>
    </View>
  );
}
