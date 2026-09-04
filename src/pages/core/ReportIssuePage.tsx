import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Alert as StatusAlert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/form/submit-button';
import { Text } from '@/components/ui/text';
import { submitIssueReport } from '@/app.Impl/services/logging/logUploadService';

export function ReportIssuePage() {
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const onReport = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setStatus(undefined);
    setErrorMessage(undefined);
    try {
      await submitIssueReport(description);
      setStatus('success');
      setDescription('');
    } catch (err) {
      console.error('ReportIssuePage::onReport failed', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? undefined : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
        <Text className="text-lg font-medium">Report an Issue</Text>

        <View className="gap-1.5">
          <Label nativeID="issueDescription">Describe the issue</Label>
          <Input
            aria-labelledby="issueDescription"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="h-32"
            editable={!isSubmitting}
          />
        </View>

        {status === 'success' && (
          <StatusAlert>
            <AlertDescription>Thanks — your report was sent.</AlertDescription>
          </StatusAlert>
        )}
        {status === 'error' && (
          <StatusAlert variant="destructive">
            <AlertDescription>Failed to send report{errorMessage ? `: ${errorMessage}` : ''}</AlertDescription>
          </StatusAlert>
        )}

        <SubmitButton onPress={onReport} isSubmitting={isSubmitting} disabled={isSubmitting || !description.trim()}>
          <Text>Report</Text>
        </SubmitButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
