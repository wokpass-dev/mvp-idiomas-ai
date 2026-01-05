import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, FlatList, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { getScenarios, sendMessage } from './services/api';

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful language tutor.' },
    { role: 'assistant', content: '¡Hola! Soy tu tutor de IA. ¿En qué escenario practicamos hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  // Load scenarios just to wake up API (optional for now)
  useEffect(() => {
    getScenarios().then(data => console.log('Scenarios loaded:', data.length));
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Use default scenario (or null) for generic chat first
      const response = await sendMessage(newMessages, null);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Idiomas AI Mobile</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages.filter(m => m.role !== 'system')}
        keyExtractor={(item, index) => index.toString()}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
        style={styles.chatList}
        renderItem={({ item }) => (
          <View style={[
            styles.bubble,
            item.role === 'user' ? styles.userBubble : styles.botBubble
          ]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
            {/* Feedback Visualization (Optimization #2) */}
            {item.feedback && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackTitle}>Teacher Tip:</Text>
                <Text style={styles.feedbackText}>{item.feedback}</Text>
              </View>
            )}
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={loading}>
          <Text style={styles.sendButtonText}>{loading ? '...' : 'Enviar'}</Text>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    alignItems: 'center',
    marginTop: 30, // Safe area top
  },
  headerTitle: {
    color: '#38bdf8', // Sky 400
    fontSize: 20,
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
    backgroundColor: '#2563eb', // Blue 600
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    backgroundColor: '#1e293b', // Slate 800
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 16,
  },
  feedbackBox: {
    marginTop: 10,
    backgroundColor: 'rgba(234, 179, 8, 0.1)', // Yellow 500/10
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  feedbackTitle: {
    color: '#fbbf24', // Amber 400
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feedbackText: {
    color: '#fde68a', // Amber 100
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#fff',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
