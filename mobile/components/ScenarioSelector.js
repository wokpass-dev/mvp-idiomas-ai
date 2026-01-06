import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function ScenarioSelector({ scenarios, selectedScenario, onSelect }) {
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {scenarios.map((scenario) => {
                    const isSelected = selectedScenario?.id === scenario.id;
                    return (
                        <TouchableOpacity
                            key={scenario.id}
                            onPress={() => onSelect(scenario)}
                            style={[
                                styles.card,
                                isSelected ? styles.selectedCard : styles.unselectedCard
                            ]}
                        >
                            <Text style={styles.emoji}>{scenario.emoji}</Text>
                            <Text style={[styles.title, isSelected ? styles.selectedText : styles.unselectedText]}>
                                {scenario.title}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 90,
        backgroundColor: '#0f172a',
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    scrollContent: {
        padding: 15,
        gap: 10,
    },
    card: {
        padding: 12,
        borderRadius: 12,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 90,
        borderWidth: 1,
    },
    selectedCard: {
        backgroundColor: '#2563eb',
        borderColor: '#3b82f6',
    },
    unselectedCard: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    emoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    title: {
        fontSize: 10,
        fontWeight: '600',
    },
    selectedText: {
        color: '#fff',
    },
    unselectedText: {
        color: '#94a3b8',
    },
});
