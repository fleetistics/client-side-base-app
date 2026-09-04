import { Pressable, ScrollView, Text, View } from 'react-native';
import { InitAppBackground } from './init-app-background';

export function InitError(props: {
  title?: string;
  errorMsg?: string;
  retryFunc?: () => void;
  onReportError?: () => void;
}) {
  return (
    <InitAppBackground>
      <View style={{ alignItems: 'center', gap: 8, width: '100%', paddingHorizontal: 16 }}>
        <Text style={{ fontWeight: 'bold', color: '#dc2626' }}>{props.title ?? 'Operation failed'}</Text>
        {props.errorMsg && (
          <View
            style={{
              maxHeight: 300,
              width: '100%',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              backgroundColor: '#f8d7da',
              padding: 12,
            }}
          >
            <ScrollView>
              <Text selectable style={{ color: '#721c24' }}>
                {props.errorMsg}
              </Text>
            </ScrollView>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {props.retryFunc && (
            <Pressable onPress={props.retryFunc}>
              <Text style={{ color: '#2563eb' }}>Try again</Text>
            </Pressable>
          )}
          {props.onReportError && (
            <Pressable onPress={props.onReportError}>
              <Text style={{ color: '#2563eb' }}>Report error</Text>
            </Pressable>
          )}
        </View>
      </View>
    </InitAppBackground>
  );
}
