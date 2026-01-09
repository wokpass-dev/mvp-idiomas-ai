import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Volume2 } from 'lucide-react-native';

const BACKEND_URL = 'https://mvp-idiomas-client.onrender.com'; // Adjust if needed

export default function TalkmeScreen() {
    const [recording, setRecording] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastTranslation, setLastTranslation] = useState(null); // { original, translated }
    const [activeButton, setActiveButton] = useState(null); // 'source' or 'target'

    // Request permissions on mount
    useEffect(() => {
        (async () => {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
        })();
    }, []);

    const playSound = async (base64Audio) => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: `data:audio/mp3;base64,${base64Audio}` },
                { shouldPlay: true }
            );
            // sound.playAsync(); // createAsync with shouldPlay:true already plays it
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };

    const startRecording = async (lang) => {
        try {
            setActiveButton(lang);

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            // Haptic or Sound feedback here if possible
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async (fromLang, toLang) => {
        if (!recording) return;

        setIsProcessing(true);
        setActiveButton(null);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            // Send to Backend
            const formData = new FormData();
            formData.append('audio', {
                uri: uri,
                type: 'audio/m4a', // Expo High Quality preset uses m4a
                name: 'upload.m4a',
            });
            formData.append('userId', 'mobile-guest'); // TODO: Get real ID
            formData.append('fromLang', fromLang);
            formData.append('toLang', toLang);

            const response = await fetch(`${BACKEND_URL}/api/translate`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.error) {
                Alert.alert('Error', data.message || 'Error en traducción');
            } else {
                setLastTranslation({
                    original: data.originalText,
                    translated: data.translatedText
                });
                // Auto Play
                if (data.audioBase64) {
                    await playSound(data.audioBase64);
                }
            }

        } catch (error) {
            console.error('Error sending audio', error);
            Alert.alert('Error', 'No se pudo conectar con el servidor.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Log */}
            <View style={styles.logContainer}>
                {lastTranslation ? (
                    <View>
                        <Text style={styles.logOriginal}>"{lastTranslation.original}"</Text>
                        <Text style={styles.logTranslated}>"{lastTranslation.translated}"</Text>
                    </View>
                ) : (
                    <Text style={styles.placeholderText}>Presiona un botón para hablar...</Text>
                )}
            </View>

            {/* Main Controls */}
            <View style={styles.controlsContainer}>

                {/* TARGET BUTTON (Top / Inverted) */}
                <TouchableOpacity
                    style={[
                        styles.pttButton,
                        styles.targetButton,
                        activeButton === 'target' && styles.activeButton,
                        isProcessing && styles.disabledButton
                    ]}
                    disabled={isProcessing || (activeButton && activeButton !== 'target')}
                    onPressIn={() => startRecording('target')}
                    onPressOut={() => stopRecording('en', 'es')}
                >
                    <View style={{ transform: [{ rotate: '180deg' }] }}>
                        <Text style={styles.buttonLabel}>ENGLISH (ELLOS)</Text>
                        {activeButton === 'target' ? (
                            <Text style={styles.buttonStatus}>GRABANDO...</Text>
                        ) : (
                            <Mic color="white" size={32} style={{ alignSelf: 'center', marginTop: 8 }} />
                        )}
                    </View>
                </TouchableOpacity>

                {/* SOURCE BUTTON (Bottom) */}
                <TouchableOpacity
                    style={[
                        styles.pttButton,
                        styles.sourceButton,
                        activeButton === 'source' && styles.activeButton,
                        isProcessing && styles.disabledButton
                    ]}
                    disabled={isProcessing || (activeButton && activeButton !== 'source')}
                    onPressIn={() => startRecording('source')}
                    onPressOut={() => stopRecording('es', 'en')}
                >
                    <Text style={styles.buttonLabel}>ESPAÑOL (YO)</Text>
                    {activeButton === 'source' ? (
                        <Text style={styles.buttonStatus}>GRABANDO...</Text>
                    ) : (
                        <Mic color="white" size={32} style={{ alignSelf: 'center', marginTop: 8 }} />
                    )}
                </TouchableOpacity>

            </View>

            {/* Loading Overlay */}
            {isProcessing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#06b6d4" />
                    <Text style={styles.loadingText}>Traduciendo...</Text>
                </View>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Slate 900
    },
    logContainer: {
        height: '20%',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    logOriginal: {
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    logTranslated: {
        color: '#22d3ee', // Cyan 400
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    placeholderText: {
        color: '#475569',
        fontSize: 16,
    },
    controlsContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    pttButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 8,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    targetButton: {
        backgroundColor: '#ef4444', // Red 500
        marginBottom: 4,
    },
    sourceButton: {
        backgroundColor: '#0ea5e9', // Sky 500
        marginTop: 4,
    },
    activeButton: {
        backgroundColor: '#10b981', // Emerald 500 (Recording state)
        transform: [{ scale: 0.98 }]
    },
    disabledButton: {
        opacity: 0.5
    },
    buttonLabel: {
        color: 'white',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1,
        textAlign: 'center',
    },
    buttonStatus: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
    }

});
