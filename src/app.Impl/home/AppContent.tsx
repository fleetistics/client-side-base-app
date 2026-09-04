import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserSession } from '@/app.Commons/userSession/userSession_ValidSession';
import { MainRouter } from '@/navigator/main-router';
import { Text } from '@/components/ui/text';

export function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const { UserId, SessionId } = useUserSession();

  return (
    <View style={styles.container}>
      <View style={[styles.sessionInfo, { paddingTop: safeAreaInsets.top + 8 }]}>
        <Text className="text-sm text-muted-foreground">
          User ID: {UserId} · Session ID: {SessionId}
        </Text>
      </View>
      <View style={styles.router}>
        <MainRouter />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sessionInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  router: {
    flex: 1,
  },
});
