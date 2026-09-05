import { Pressable, Text } from "react-native";
import { BaseToastProps } from "react-native-toast-message";

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}
export const toastConfig = {
  error: ({ text1, text2, onPress }: CustomToastProps) => (
    <Pressable
      onPress={onPress}
      style={{
        width:"80%",
        backgroundColor: '#FEF3F2',
        borderColor: '#D92D20',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#D92D20', fontSize: 16 }}>{text1}</Text>

    </Pressable>
  ),
  warning: ({ text1, text2, onPress }: CustomToastProps) => (
    <Pressable
      onPress={onPress}
      style={{
        width:"80%",
        backgroundColor: '#FFFBEA',
        borderColor: '#F7C948',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#a88012ff', fontSize: 16 }}>{text1}</Text>

    </Pressable>
  ),
  success: ({ text1, text2, onPress }: CustomToastProps) => (

    <Pressable
      onPress={onPress}
      style={{
        width:"80%",
        backgroundColor: '#E6F9ED',
        borderColor: '#2ECC40',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
        <Text style={{ textAlign: 'center', fontSize: 16 }}>{text1}</Text>

    </Pressable>

  )
};