import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Step = {
    id: number;
    label: string;
    completed: boolean;
};

type ProgressTrackerProps = {
    steps: Step[];
    currentStep: number;
    completionPercentage: number;
};

export default function ProgressTracker({
    steps,
    currentStep,
    completionPercentage,
}: ProgressTrackerProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.header}>
                <Text style={[styles.title, isDark && styles.titleDark]}>
                    Listing Progress
                </Text>
                <View style={styles.percentageBadge}>
                    <Text style={styles.percentageText}>{completionPercentage}%</Text>
                </View>
            </View>

            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${completionPercentage}%` },
                    ]}
                />
            </View>

            <View style={styles.stepsContainer}>
                {steps.map((step, index) => (
                    <View key={step.id} style={styles.stepWrapper}>
                        <View style={styles.stepItem}>
                            <View
                                style={[
                                    styles.stepCircle,
                                    step.completed && styles.stepCircleCompleted,
                                    index === currentStep && styles.stepCircleCurrent,
                                    isDark && !step.completed && styles.stepCircleDark,
                                ]}
                            >
                                {step.completed ? (
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                ) : (
                                    <Text
                                        style={[
                                            styles.stepNumber,
                                            index === currentStep && styles.stepNumberCurrent,
                                        ]}
                                    >
                                        {index + 1}
                                    </Text>
                                )}
                            </View>

                            <Text
                                style={[
                                    styles.stepLabel,
                                    step.completed && styles.stepLabelCompleted,
                                    index === currentStep && styles.stepLabelCurrent,
                                    isDark && styles.stepLabelDark,
                                ]}
                                numberOfLines={2}
                            >
                                {step.label}
                            </Text>
                        </View>

                        {index < steps.length - 1 && (
                            <View
                                style={[
                                    styles.stepConnector,
                                    step.completed && styles.stepConnectorCompleted,
                                    isDark && styles.stepConnectorDark,
                                ]}
                            />
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    containerDark: {
        backgroundColor: '#1F2937',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    titleDark: {
        color: '#F9FAFB',
    },
    percentageBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FB902E',
        borderRadius: 4,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stepWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepItem: {
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepCircleDark: {
        backgroundColor: '#374151',
    },
    stepCircleCompleted: {
        backgroundColor: '#10B981',
    },
    stepCircleCurrent: {
        backgroundColor: '#FB902E',
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    stepNumberCurrent: {
        color: '#FFFFFF',
    },
    stepLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 16,
    },
    stepLabelDark: {
        color: '#9CA3AF',
    },
    stepLabelCompleted: {
        color: '#10B981',
        fontWeight: '600',
    },
    stepLabelCurrent: {
        color: '#FB902E',
        fontWeight: '600',
    },
    stepConnector: {
        width: 20,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginTop: 19,
    },
    stepConnectorDark: {
        backgroundColor: '#374151',
    },
    stepConnectorCompleted: {
        backgroundColor: '#10B981',
    },
});
