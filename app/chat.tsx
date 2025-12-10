import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { useSession } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../services/api';

const BOT_USER: User = {
    _id: 2,
    name: 'Hai AI',
    avatar: 'https://placeimg.com/140/140/tech',
};

export default function ChatScreen() {
    const { signOut } = useSession();
    const router = useRouter();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedModel, setSelectedModel] = useState('hbb-llama3.2:3b');

    useEffect(() => {
        setMessages([
            {
                _id: 1,
                text: 'Hello! How can I help you today?',
                createdAt: new Date(),
                user: BOT_USER,
            },
        ]);
    }, []);

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
        const text = newMessages[0].text;
        handleSendQuestion(text);
    }, []);

    const handleSendQuestion = async (text: string) => {
        setIsTyping(true);
        try {
            // Send question
            const res = await api.post('/ask', {
                q_text: text,
                // auth_params is handled by backend via user context now, 
                // but we can pass model info if backend supports it later.
                // For now, backend uses default or hardcoded logic, 
                // but let's assume we might want to pass it.
                // The current private_api.py doesn't use 'model' field in Question model,
                // so we just send q_text.
            });

            const { question_id } = res.data;
            pollAnswer(question_id);
        } catch (error) {
            console.error('Error sending question:', error);
            setIsTyping(false);
            appendBotMessage('Sorry, I encountered an error sending your message.');
        }
    };

    const pollAnswer = async (qid: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/get_answer/${qid}`);
                const data = res.data;

                if (data.status === 'answered') {
                    clearInterval(interval);
                    setIsTyping(false);
                    appendBotMessage(data.answer);
                }
            } catch (error) {
                console.error('Polling error:', error);
                // Don't clear interval immediately on transient errors, but maybe add timeout logic
            }
        }, 2000);

        // Timeout after 2 minutes
        setTimeout(() => {
            clearInterval(interval);
            if (isTyping) {
                setIsTyping(false);
                appendBotMessage('Response timed out.');
            }
        }, 120000);
    };

    const appendBotMessage = (text: string) => {
        const msg: IMessage = {
            _id: Math.round(Math.random() * 1000000),
            text,
            createdAt: new Date(),
            user: BOT_USER,
        };
        setMessages((previousMessages) => GiftedChat.append(previousMessages, [msg]));
    };

    const handleSignOut = async () => {
        await signOut();
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.modelSelector}>
                    <Text style={styles.modelText}>{selectedModel}</Text>
                </View>
                <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <GiftedChat
                messages={messages}
                onSend={(messages) => onSend(messages)}
                user={{
                    _id: 1,
                }}
                isTyping={isTyping}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modelSelector: {
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 20,
    },
    modelText: {
        fontWeight: '600',
        color: '#333',
    },
    logoutButton: {
        padding: 8,
    },
    logoutText: {
        color: 'red',
    },
});
