import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, FlatList, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { getScenarios, sendMessage } from './services/api';
import { supabase } from './services/supabase';
import LoginScreen from './screens/LoginScreen';
import AudioRecorder from './components/AudioRecorder';
import ScenarioSelector from './components/ScenarioSelector';

export default function App() {
  const [session, setSession] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // AUTH INIT
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleGuestLogin = () => {
    setGuestMode(true);
  };

  if (!initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {session || guestMode ? (
        <ChatInterface session={session} guestMode={guestMode} onLogout={() => setGuestMode(false)} />
      ) : (
        <LoginScreen onGuestLogin={handleGuestLogin} />
      )}
    </View>
  );
}

// --- CHAT INTERFACE COMPONENT ---
function ChatInterface({ session, guestMode, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const flatListRef = useRef();

  // Load scenarios
  useEffect(() => {
    getScenarios().then(data => {
      setScenarios(data);
      // Default to first scenario or generic
      if (data && data.length > 0) {
        handleScenarioSelect(data[0]);
      }
    });
  }, []);

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    setMessages([
      { role: 'system', content: scenario.system_prompt },
      { role: 'assistant', content: `¡Hola! Vamos a practicar: ${scenario.title}.` }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(newMessages, selectedScenario?.id);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioComplete = async (uri) => {
    // Placeholder for Phase 3 Audio Upload
    // We would need to update API to accept Multipart Form Data
    Alert.alert("¡Grabado!", "Audio capturado correctamente. (La función de envío al servidor vendrá en la siguiente actualización).");
  };

  const handleLogout = async () => {
    if (guestMode) {
      onLogout();
    } else {
      await supabase.auth.signOut();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Idiomas AI</Text>
          <Text style={styles.headerSubtitle}>
            {guestMode ? 'Modo Invitado' : session?.user?.email}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* SCENARIO SELECTOR (New Phase 2 Feature) */}
      <ScenarioSelector
        scenarios={scenarios}
        selectedScenario={selectedScenario}
        onSelect={handleScenarioSelect}
      />

      {/* CHAT LIST */}
      <FlatList
        ref={flatListRef}
        data={messages.filter(m => m.role !== 'system')}
        keyExtractor={(item, index) => index.toString()}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        style={styles.chatList}
        renderItem={({ item }) => (
          <View style={[
            styles.bubble,
            item.role === 'user' ? styles.userBubble : styles.botBubble
          ]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
            {item.feedback && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackTitle}>Teacher Tip:</Text>
                <Text style={styles.feedbackText}>{item.feedback}</Text>
              </View>
            )}
          </View>
        )}
      />

      {/* INPUT AREA */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        {/* Audio Button (New Phase 2 Feature) */}
        <AudioRecorder onRecordingComplete={handleAudioComplete} isProcessing={loading} />

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={loading}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate 900
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginTop: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  headerTitle: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 11,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  logoutText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chatList: {
    flex: 1,
    padding: 15,
  },
  bubble: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 16,
  },
  feedbackBox: {
    marginTop: 10,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  feedbackTitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feedbackText: {
    color: '#fde68a',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 25,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
