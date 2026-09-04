import * as React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { ControlField } from '@/components/ui/form/control-field';
import { SubmitButton } from '@/components/ui/form/submit-button';
import { MediaSelector } from '@/components/ui/image/media-selector';
import { GetPatchValue } from '@/components/ui/form/get-patch-value';
import { useGetMyUser, usePatchUser } from '@/app.DataLayer/user/userApi';
import type { User, UserPatch } from '@/app.DataLayer/user/userDto';
import { useRef } from 'react';
import { BuildPatchValue, StartMediaUpload } from '@/app.Commons/helpers/form-helper';


export function EditUserProfile() {
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
            <Text className="text-sm text-muted-foreground">Loading</Text>
          </View>
        )}
        <MediaSelector
          control={control}
          name="Medias"
          label="Avatar"
          singleMode
          hideVideo
          readOnly={!fieldsEditable}
        />
        <ControlField control={control} name="DisplayName" label="Display Name" editable={fieldsEditable} />
        <ControlField control={control} name="FullName" label="Full Name" editable={fieldsEditable} />
        <ControlField control={control} name="Phone" label="Phone" editable={fieldsEditable} />
        <ControlField control={control} name="Email" label="Email" editable={fieldsEditable} />
        <SubmitButton onPress={() => onSubmit()} isSubmitting={isSubmitting} disabled={isLoading}>
          <Text>Save</Text>
        </SubmitButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
