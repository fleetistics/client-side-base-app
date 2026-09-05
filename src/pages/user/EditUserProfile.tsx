import * as React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { ControlField } from '@/components/ui/form/control-field';
import { SubmitButton } from '@/components/ui/form/submit-button';
import { MediaSelector } from '@/components/ui/image/media-selector';
import { GetPatchValue } from '@/components/ui/form/get-patch-value';
import { useGetMyUser, usePatchUser } from '@/app.DataLayer/user/userApi';
import type { User, UserPatch } from '@/app.DataLayer/user/userDto';
import { useRef } from 'react';
import { BuildPatchValue, StartMediaUpload } from '@/client-side.Commons/helpers/form-helper';


export function EditUserProfile() {
  // Sample usage of the shared i18n setup (see client-side.Commons/i18n): t()'s argument is the
  // English source string itself — the translations backend keys resources by that text,
  // not by a separate id — so it doubles as the untranslated fallback with zero setup.
  const { t } = useTranslation();
  const { data: currentEntity, isLoading } = useGetMyUser();
  const [patchUser] = usePatchUser();
  const isSubmittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields, isSubmitting },
  } = useForm<User>({
    defaultValues: { },
  });

  const fieldsEditable = !isLoading && !isSubmitting;

  React.useEffect(() => {
    if (currentEntity) {
      reset(currentEntity);
    }
  }, [currentEntity, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!currentEntity || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      console.log(`EditUserProfile::onSubmit values, dirtyFields`, values, dirtyFields);
      const patch = BuildPatchValue<UserPatch>(values, dirtyFields);
      console.log(`EditUserProfile::onSubmit patch`, patch);
      if (patch) {
        await patchUser({ userId: currentEntity.Id, patch }).unwrap();
        console.log(`EditUserProfile::onSubmit success`);
        reset(values);
        StartMediaUpload(patch);
      }
    } finally {
      isSubmittingRef.current = false;
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? undefined : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
        {isLoading && (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" />
            <Text className="text-sm text-muted-foreground">{t('Loading')}</Text>
          </View>
        )}
        <MediaSelector
          control={control}
          name="Medias"
          label={t('Avatar')}
          singleMode
          hideVideo
          readOnly={!fieldsEditable}
        />
        <ControlField control={control} name="DisplayName" label={t('Display Name')} editable={fieldsEditable} />
        <ControlField control={control} name="FullName" label={t('Full Name')} editable={fieldsEditable} />
        <ControlField control={control} name="Phone" label={t('Phone')} editable={fieldsEditable} />
        <ControlField control={control} name="Email" label={t('Email')} editable={fieldsEditable} />
        <SubmitButton onPress={() => onSubmit()} isSubmitting={isSubmitting} disabled={isLoading}>
          <Text>{t('Save')}</Text>
        </SubmitButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
