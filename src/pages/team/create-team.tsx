import { useEffect, useRef } from 'react';
import { UserPatchDto, TeamPatchDto, TeamDetailsPatchDto, TeamMemberUserPatchDto } from '@/client-side.Commons/dataLayer/open-api';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/app.Commons/components/controls/button';
import { Text } from '@/app.Commons/components/controls/text';
import { ControlField } from '@/app.Commons/components/form/control-field';
import { PhoneField } from '@/app.Commons/components/form/phone-field';
import { SubmitButton } from '@/app.Commons/components/form/submit-button';
import { MediaSelector } from '@/app.Commons/components/image/media-selector';
import { MapIconPicker } from '@/app.Commons/components/team/map-icon-picker';
import { useCreateTeam, useGetCreatingTeamQuery, usePatchCreatingTeam } from '@/client-side.Commons/dataLayer/api/team/teamApi';
import { useGetMyUser } from '@/client-side.Commons/dataLayer/api/user/myUserApi';

import { GlobalToast } from '@/client-side.Commons/lib/global-toast';
import { GlobalAlert } from '@/client-side.Commons/lib/global-alert';
import { getErrorMessage } from '@/client-side.Commons/dataLayer/core/apiError';
import type { ScreenProps } from '@/navigator/pages-config';
import { EditTeamCreate } from '@/client-side.Commons/dataLayer/model/team/edit-team-create';
import { EditUser, EditUserGroupKey, EditUserHelper } from '@/client-side.Commons/dataLayer/model/user/edit-user';
import { TeamCreatePatchDto } from '@/client-side.Commons/dataLayer/open-api/models/TeamCreatePatchDto';
import { BuildFormPatchValue } from '@/client-side.Commons/helpers/form-helper';
import { StartMediaUpload } from '@/app.Commons/services/media-uploader/mediaUploadService';


export function CreateTeamPage({ navigation }: ScreenProps<'CreateTeamPage'>) {
  const { t } = useTranslation();
  const myUser = useGetMyUser();
  const creatingTeam = useGetCreatingTeamQuery();
  const [createTeam] = useCreateTeam();
  const [patchTeam] = usePatchCreatingTeam();

  const isSubmittingRef = useRef(false);
  const formInitializedRef = useRef(false);
  const loadErrorShownRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields, isSubmitting },
  } = useForm<EditTeamCreate>({

  });

  // "Loaded" means the request succeeded - creatingTeam.data is null (not an error) when the
  // user has no team in progress yet, so the data itself can't be used to tell.
  const isLoaded = myUser.isSuccess && creatingTeam.isSuccess;
  const loadError = myUser.isError ? myUser.error : creatingTeam.isError ? creatingTeam.error : undefined;
  const hasLoadError = myUser.isError || creatingTeam.isError;
  const isLoading = !isLoaded && !hasLoadError;

  const fieldsEditable = isLoaded && !isSubmitting;

  // A failed load leaves nothing to edit: tell the user, and send them back to the initial page
  // once they close the alert.
  useEffect(() => {
    if (!hasLoadError || loadErrorShownRef.current) return;
    loadErrorShownRef.current = true;
    GlobalAlert.ShowError(getErrorMessage(loadError), t('Could not load the team data'), undefined, () =>
      navigation.navigate('InitialPage')
    );
  }, [hasLoadError, loadError, navigation, t]);

  // Runs once, when both myUser and creatingTeam have loaded successfully. Not re-run on later
  // cache refreshes (createTeam/patch upsert creatingTeam), which would wipe what the user typed.
  useEffect(() => {
    if (!isLoaded || formInitializedRef.current) return;
    formInitializedRef.current = true;
    console.log("CreateTeamPage::form initialization myUser.data", myUser.data);
    const creatorUser = { ...myUser.data } as EditUser;
    console.log("CreateTeamPage::form initialization before PrepareMediasToEdit creatorUser", creatorUser);
    EditUserHelper.PrepareMediasToEdit(creatorUser);
    console.log("CreateTeamPage::form initialization after PrepareMediasToEdit creatorUser", creatorUser);
    const teamToEdit: EditTeamCreate = { ...(creatingTeam.data ?? {}), CreatorUser: creatorUser };
    console.log("CreateTeamPage::form initialization before  teamToEdit", teamToEdit);
    reset(teamToEdit);
  }, [isLoaded, myUser.data, creatingTeam.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      console.log(`CreateTeamPage::onSubmit values`, values);
      const patch = {} as TeamCreatePatchDto;
      patch.Team = BuildFormPatchValue<TeamPatchDto>(values.Team, dirtyFields.Team);
      patch.TeamDetails = BuildFormPatchValue<TeamDetailsPatchDto>(values.TeamDetails, dirtyFields.TeamDetails);
      //const { Medias: _photoDirty, ...creatorUserDirty } = dirtyFields.CreatorUser ?? {};
      patch.CreatorUser = BuildFormPatchValue<UserPatchDto>(values.CreatorUser, dirtyFields.CreatorUser);
      patch.CreatorTeamMemberUser = BuildFormPatchValue<TeamMemberUserPatchDto>(values.CreatorTeamMemberUser, dirtyFields.CreatorTeamMemberUser);
      console.log(`CreateTeamPage::onSubmit patch`, patch);
      const teamId = creatingTeam.data?.Team?.Id;
      if (teamId) {
        await patchTeam({ teamId, patch }).unwrap();
        GlobalToast.ShowSuccess(t('Team updated'));
      }
      else {
        const createdTeamId = await createTeam(patch).unwrap();
        console.log(`CreateTeamPage::onSubmit created team`, createdTeamId);
        GlobalToast.ShowSuccess(t('Team created'));
      }
      reset(values);
      // The patch is nested per entity, so each section carries its own InsertMedias.
      StartMediaUpload(patch.CreatorUser);
      StartMediaUpload(patch.TeamDetails);
      
      navigation.navigate('TeamDetailsPage');
    } catch (e) {
      console.warn(`CreateTeamPage::onSubmit failed`, e);
      // unwrap() rejects with the RTK error, whose body carries the server's description of what
      // went wrong (validation message, ProblemDetails detail...) - show that, not a generic text.
      GlobalAlert.ShowError(getErrorMessage(e, t('Unknown error')), t('Could not create the team'));
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
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-4 p-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-center text-xl font-semibold">{t('Team Setup')}</Text>
        {isLoading && (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" />
            <Text className="text-sm text-muted-foreground">{t('Loading')}</Text>
          </View>
        )}

        <ControlField
          control={control}
          name="Team.TeamName"
          label={t('Team Name')}
          editable={fieldsEditable}
          rules={{ validate: (v) => !!String(v ?? '').trim() || t('Team name is required') }}
        />
        <ControlField
          control={control}
          name="TeamDetails.IncidentName"
          label={t('Incident Name')}
          editable={fieldsEditable}
        />
        <ControlField
          control={control}
          name="CreatorUser.DisplayName"
          label={t('Your Name')}
          editable={fieldsEditable}
          rules={{ validate: (v) => !!String(v ?? '').trim() || t('Your name is required') }}
        />
        <PhoneField
          control={control}
          name="CreatorUser.Phone"
          label={t('Phone Number')}
          editable={fieldsEditable}
        />
        {/* Shown to match the design, but its value is not part of the create request. */}
        <MediaSelector
          control={control}
          name="CreatorUser.Medias"
          label={t('ID Photo')}
          groupKey={EditUserGroupKey.GovID}
          singleMode
          hideVideo
          readOnly={!fieldsEditable}
        />
        <MapIconPicker control={control} name="CreatorTeamMemberUser.IconKey" label={t('Map Icon')} editable={fieldsEditable} />

        <View className="flex-row gap-3">
          <Button variant="secondary" className="flex-1" onPress={() => navigation.goBack()} disabled={isSubmitting}>
            <Text>{t('Back')}</Text>
          </Button>
          <SubmitButton
            className="flex-1"
            onPress={() => onSubmit()}
            isSubmitting={isSubmitting}
            disabled={!fieldsEditable}
          >
            <Text>{t('Create')}</Text>
          </SubmitButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
