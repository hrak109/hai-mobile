import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useSession } from '../context/AuthContext';
import { loginWithGoogle } from '../services/auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const { signIn } = useSession();
    const router = useRouter();
    const [isSigninInProgress, setIsSigninInProgress] = useState(false);

    useEffect(() => {
        // Configure Google Sign-In
        GoogleSignin.configure({
            // IMPORTANT: Use your Web Client ID from Google Cloud Console
            // This is NOT the same as your Android Client ID
            webClientId: '801464542210-1fkf9io7j3dklo1shs6vhim6q1v893d3.apps.googleusercontent.com',
            offlineAccess: false,
            // Request ID token explicitly
            scopes: ['openid', 'profile', 'email'],
        });
    }, []);

    const handleGoogleLogin = async () => {
        setIsSigninInProgress(true);
        try {
            // Check if device supports Google Play Services
            await GoogleSignin.hasPlayServices();

            // Trigger the sign-in flow
            const userInfo = await GoogleSignin.signIn();

            // Debug: Log the response structure
            console.log('Google Sign-In Response:', JSON.stringify(userInfo, null, 2));

            // Extract the ID token - try both possible paths
            const idToken = userInfo.data?.idToken || userInfo.idToken;

            if (!idToken) {
                console.error('userInfo structure:', userInfo);
                throw new Error('No ID token received from Google. Check console for userInfo structure.');
            }

            // Send ID token to your backend for verification
            await handleBackendLogin(idToken);

        } catch (error: any) {
            console.error('Google Sign-In Error:', error);

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // User cancelled the login flow
                console.log('User cancelled sign-in');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // Sign-in is already in progress
                console.log('Sign-in already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                alert('Google Play Services not available');
            } else {
                alert('Login failed: ' + error.message);
            }
        } finally {
            setIsSigninInProgress(false);
        }
    };

    const handleBackendLogin = async (idToken: string) => {
        try {
            const accessToken = await loginWithGoogle(idToken);
            await signIn(accessToken);
            router.replace('/chat');
        } catch (error) {
            console.error('Backend Login error:', error);
            alert('Backend authentication failed.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hai Mobile</Text>
                <Text style={styles.subtitle}>Secure AI Chat</Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleGoogleLogin}
                disabled={isSigninInProgress}
            >
                {isSigninInProgress ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Sign in with Google</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        marginBottom: 50,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
    button: {
        backgroundColor: '#4285F4',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 5,
        elevation: 3,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
