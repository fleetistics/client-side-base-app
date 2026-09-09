import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Camera, CameraType } from 'react-native-camera-kit';
import { Alert, AlertDescription } from '@/app.Commons/components/controls/alert';
import { Button } from '@/app.Commons/components/controls/button';
import { Input } from '@/app.Commons/components/controls/input';
import { Label } from '@/app.Commons/components/controls/label';
import { SubmitButton } from '@/app.Commons/components/form/submit-button';
import { Text } from '@/app.Commons/components/controls/text';
import { GlobalToast } from '@/app.Commons/utils/global-toast';
import TeamUtils from '@/app.Commons/utils/team-utils';
import { QrCode } from '@/components/ui/icons';
import type { NavigatorPages } from '@/navigator/pages-config';

type JoinTeamFormValues = {
  joinKey: string;
};

export function JoinTeamPage() {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<NavigatorPages, 'JoinTeamPage'>>();
  const [isPending, setIsPending] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const isSubmittingRef = useRef(false);

  const form = useForm<JoinTeamFormValues>({
    defaultValues: { joinKey: route.params?.joinKey ?? '' },
    mode: 'onChange',
  });

  const doJoinKeyCheck = async (joinKey: string) => {
    const parsedJoinKey = TeamUtils.ParseJoinCode(joinKey);
    if (!TeamUtils.IsValidJoinCode(parsedJoinKey)) {
      const errorMsg = t('Invalid join code format');
      GlobalToast.ShowError(errorMsg);
      form.setError('joinKey', { type: 'manual', message: errorMsg });
      return;
    }
  };

  // Runs once for the deep-link case (?joinKey=...); doJoinKeyCheck is intentionally excluded
  // since it closes over form/t and would otherwise re-run this on every render.
  useEffect(() => {
    if (route.params?.joinKey) {
      doJoinKeyCheck(route.params.joinKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsPending(true);
    try {
      const isValid = await form.trigger();
      if (isValid) await doJoinKeyCheck(form.getValues().joinKey);
    } finally {
      isSubmittingRef.current = false;
      setIsPending(false);
    }
  };

  const joinKeyError = form.formState.errors.joinKey?.message;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? undefined : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-4 p-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-lg font-medium">{t('Join a Team')}</Text>
        <Text className="text-sm text-muted-foreground">
          {t('Enter the join code shared by your team, or scan their QR code.')}
        </Text>

        <View className="gap-1.5">
          <Label nativeID="joinKey">{t('Join Code')}</Label>
          <Controller
            control={form.control}
            name="joinKey"
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                aria-labelledby="joinKey"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="characters"
                placeholder={t('e.g. 38FRZVBX')}
                editable={!isPending}
              />
            )}
          />
        </View>

        {joinKeyError && (
          <Alert variant="destructive">
            <AlertDescription>{joinKeyError}</AlertDescription>
          </Alert>
        )}

        {isScanning && (
          <Camera
            style={{ width: '100%', height: 240, borderRadius: 12 }}
            cameraType={CameraType.Back}
            scanBarcode
            onReadCode={async (e) => {
              setIsScanning(false);
              const code = e.nativeEvent.codeStringValue;
              if (code) {
                form.setValue('joinKey', code);
                await doJoinKeyCheck(code);
              }
            }}
            showFrame
          />
        )}

        <Button variant="outline" onPress={() => setIsScanning((v) => !v)}>
          <View className="flex-row items-center gap-2">
            <QrCode className="text-foreground" size={18} />
            <Text>{isScanning ? t('Stop Scanning') : t('Scan QR Code')}</Text>
          </View>
        </Button>

        <SubmitButton onPress={handleJoin} isSubmitting={isPending} disabled={isPending}>
          <Text>{isPending ? t('Joining...') : t('Join Team')}</Text>
        </SubmitButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
