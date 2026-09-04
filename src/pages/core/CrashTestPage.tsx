import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function CrashTestPage() {
  const [shouldCrash, setShouldCrash] = useState(false);

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
    </View>
  );
}
