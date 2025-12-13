import { Slot, Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useSession } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const InitialLayout = () => {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAtRoot = pathname === '/';

    console.log('Nav State:', { session: !!session, pathname, segments, inAuthGroup });

    if (!session && !inAuthGroup && !isAtRoot) {
      // Redirect to the sign-in page if not logged in and trying to access protected route
      // But allow access to root (login page)
      router.replace('/');
    } else if (session && isAtRoot) {
      // Redirect to the chat page if logged in and on root
      router.replace('/home');
    }
  }, [session, isLoading, segments, pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
