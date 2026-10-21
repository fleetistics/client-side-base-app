import { useEffect, useRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/app.Commons/components/controls/button';
import { Text } from '@/app.Commons/components/controls/text';
import { ControlField } from '@/app.Commons/components/form/control-field';
import { SubmitButton } from '@/app.Commons/components/form/submit-button';
import { MediaSelector } from '@/app.Commons/components/image/media-selector';
import { useGetCreatingTeamQuery, usePatchCreatingTeam, useStartTeam } from '@/client-side.Commons/dataLayer/api/team/teamApi';
import { EditTeamDetailsForm, EditTeamDetailsHelper } from '@/client-side.Commons/dataLayer/model/team/edit-team-details';
import { TeamMediaGroupKey } from '@/client-side.Commons/dataLayer/model/team/team-const';
import type { TeamDetailsPatchDto } from '@/client-side.Commons/dataLayer/open-api';
import type { TeamCreatePatchDto } from '@/client-side.Commons/dataLayer/open-api/models/TeamCreatePatchDto';
import { LocationService } from '@/app.Commons/services/location/locationService';
import { StartMediaUpload } from '@/app.Commons/services/media-uploader/mediaUploadService';
import { TeamContextService } from '@/app.Commons/services/team/teamContextService';
import {
  createStandaloneRefreshApi,
  notifyAuthLost,
  refreshAccessToken,
} from '@/client-side.Commons/dataLayer/core/apiSlice';
import { getErrorMessage } from '@/client-side.Commons/dataLayer/core/apiError';
import { BuildFormPatchValue } from '@/client-side.Commons/helpers/form-helper';
import { GlobalAlert } from '@/client-side.Commons/lib/global-alert';
import { GlobalToast } from '@/client-side.Commons/lib/global-toast';
import type { ScreenProps } from '@/navigator/pages-config';

export function TeamDetailsPage({ navigation }: ScreenProps<'TeamDetailsPage'>) {
  const { t } = useTranslation();
  const creatingTeam = useGetCreatingTeamQuery();
  const [patchTeam] = usePatchCreatingTeam();
  const [startTeam] = useStartTeam();

  const isSubmittingRef = useRef(false);
  const formInitializedRef = useRef(false);
  const loadErrorShownRef = useRef(false);
  // Once the details patch is saved a failed start must not send it (and its new medias) again.
  const patchSavedRef = useRef(false);
  // Same for the start itself: if a step after it fails, a retry must not start the team twice.
  const teamStartedRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields, isSubmitting },
  } = useForm<EditTeamDetailsForm>({});

  // creatingTeam.data is null (not an error) when the user has no team in progress.
  const isLoaded = creatingTeam.isSuccess;
  const hasLoadError = creatingTeam.isError;
  const isLoading = !isLoaded && !hasLoadError;
  const teamId = creatingTeam.data?.Team?.Id;

  const fieldsEditable = isLoaded && !!teamId && !isSubmitting;

  // A failed load leaves nothing to edit: tell the user, and send them back to the initial page
  // once they close the alert.
  useEffect(() => {
    if (!hasLoadError || loadErrorShownRef.current) return;
    loadErrorShownRef.current = true;
    GlobalAlert.ShowError(getErrorMessage(creatingTeam.error), t('Could not load the team data'), undefined, () =>
      navigation.navigate('InitialPage')
    );
  }, [hasLoadError, creatingTeam.error, navigation, t]);

  // Runs once, when creatingTeam has loaded successfully. Not re-run on later cache refreshes
  // (patch/start upsert creatingTeam), which would wipe what the user typed - or, after start,
  // find no team at all.
  useEffect(() => {
    if (!isLoaded || formInitializedRef.current) return;
    formInitializedRef.current = true;
    if (!teamId) {
      GlobalAlert.ShowError(
        t('Create the team before adding its details'),
        t('No team in progress'),
        undefined,
        () => navigation.navigate('CreateTeamPage')
      );
      return;
    }
    reset({ TeamDetails: EditTeamDetailsHelper.PrepareToEdit(creatingTeam.data?.TeamDetails) });
  }, [isLoaded, teamId, creatingTeam.data, navigation, reset, t]);

  const onSubmit = handleSubmit(async (values) => {
    if (!teamId || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      console.log(`TeamDetailsPage::onSubmit values`, values);
      if (!patchSavedRef.current) {
        const teamDetails = BuildFormPatchValue<TeamDetailsPatchDto>(values.TeamDetails, dirtyFields.TeamDetails);
        console.log(`TeamDetailsPage::onSubmit patch`, teamDetails);
        if (teamDetails) {
          const patch: TeamCreatePatchDto = { TeamDetails: teamDetails };
          await patchTeam({ teamId, patch }).unwrap();
          reset(values);
          StartMediaUpload(teamDetails);
        }
        patchSavedRef.current = true;
      }
      if (!teamStartedRef.current) {
        await startTeam(teamId).unwrap();
        teamStartedRef.current = true;
      }
      // The team is active now: get a token that reflects it, start reporting this user's location
      // and begin tracking the team's context. Shares apiSlice's single-flight refresh latch.
      const refreshed = await refreshAccessToken(createStandaloneRefreshApi('teamDetails'), {});
      if (!refreshed) {
        notifyAuthLost();
        return;
      }
      LocationService.SetReportLocationMode(true);
      TeamContextService.StartTeam(teamId);
      GlobalToast.ShowSuccess(t('Mission started'));
      navigation.replace('MainMap');
    } catch (e) {
      console.warn(`TeamDetailsPage::onSubmit failed`, e);
      // unwrap() rejects with the RTK error, whose body carries the server's description of what
      // went wrong (validation message, ProblemDetails detail...) - show that, not a generic text.
      GlobalAlert.ShowError(getErrorMessage(e, t('Unknown error')), t('Could not start the mission'));
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
        <Text className="text-center text-xl font-semibold">{t('Team Details')}</Text>
        {isLoading && (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" />
            <Text className="text-sm text-muted-foreground">{t('Loading')}</Text>
          </View>
        )}

        <ControlField
          control={control}
          name="TeamDetails.Notes"
          label={t('Notes')}
          editable={fieldsEditable}
          multiline
        />
        <MediaSelector
          control={control}
          name="TeamDetails.Medias"
          label={t('Photos and Videos')}
          groupKey={TeamMediaGroupKey.CommonDetails}
          readOnly={!fieldsEditable}
        />

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
            <Text>{t('Start Mission')}</Text>
          </SubmitButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
