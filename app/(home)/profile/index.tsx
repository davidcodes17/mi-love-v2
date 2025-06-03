import NativeButton from '@/components/ui/native-button';
import NativeText from '@/components/ui/native-text';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Page() {
  return (
   <SafeAreaView style={{padding : 20}}>
    <NativeText>profile</NativeText>
    <NativeButton href={"/(entry)"} text={"Logout"} mode='fill' />
   </SafeAreaView>
  );
}
