import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, SHADOWS, CARD_STYLES, BUTTON_STYLES } from '../theme/theme';

const ReportScreen = () => {
    const [calculations, setCalculations] = useState([]);

    // Load calculations when the screen is focused
    useFocusEffect(
        React.useCallback(() => {
            loadCalculations();
            return () => { };
        }, [])
    );

    const loadCalculations = async () => {
        try {
            const calculationsJSON = await AsyncStorage.getItem('calculations');
            if (calculationsJSON) {
                const parsedCalculations = JSON.parse(calculationsJSON);
                // Sort by most recent first
                parsedCalculations.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
                setCalculations(parsedCalculations);
            }
        } catch (error) {
            console.error('Error loading calculations:', error);
            Alert.alert(
                'Erro',
                'Não foi possível carregar o histórico de cálculos.',
                [{ text: 'OK' }]
            );
        }
    };

    const clearHistory = async () => {
        Alert.alert(
            'Limpar histórico',
            'Tem certeza que deseja apagar todo o histórico de cálculos?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Confirmar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('calculations');
                            setCalculations([]);
                        } catch (error) {
                            console.error('Error clearing history:', error);
                            Alert.alert(
                                'Erro',
                                'Não foi possível limpar o histórico de cálculos.',
                                [{ text: 'OK' }]
                            );
                        }
                    }
                }
            ]
        );
    };

    const deleteCalculation = async (id) => {
        try {
            const updatedCalculations = calculations.filter(calc => calc.id !== id);
            await AsyncStorage.setItem('calculations', JSON.stringify(updatedCalculations));
            setCalculations(updatedCalculations);
        } catch (error) {
            console.error('Error deleting calculation:', error);
            Alert.alert(
                'Erro',
                'Não foi possível excluir o cálculo.',
                [{ text: 'OK' }]
            );
        }
    };

    const renderCalculationItem = ({ item }) => (
        <View style={styles.calculationItem}>
            <View style={styles.calculationHeader}>
                <View style={styles.dateContainer}>
                    <MaterialCommunityIcons name="calendar-clock" size={16} color={COLORS.primary} />
                    <Text style={styles.calculationDate}>{item.date}</Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteCalculation(item.id)}
                >
                    <MaterialIcons name="delete-outline" size={22} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.calculationDetails}>
                {item.wellName && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <MaterialCommunityIcons name="barrel" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.detailLabel}>Poço:</Text>
                        </View>
                        <Text style={styles.detailValue}>{item.wellName}</Text>
                    </View>
                )}

                {item.operationType && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailLabelContainer}>
                            <MaterialCommunityIcons name="wrench" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.detailLabel}>Operação:</Text>
                        </View>
                        <Text style={styles.detailValue}>{item.operationType}</Text>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                        <MaterialIcons name="straighten" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.detailLabel}>Distância:</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.distance} metros</Text>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                        <MaterialCommunityIcons name="pipe" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.detailLabel}>Tubo:</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.pipeType}</Text>
                </View>

                <View style={styles.resultSummary}>
                    <View style={styles.volumeContainer}>
                        <View style={styles.volumeBadge}>
                            <MaterialCommunityIcons name="water" size={16} color={COLORS.primary} />
                            <Text style={styles.volumeText}>{Math.round(item.volumeLiters)} Litros</Text>
                        </View>

                        <View style={styles.volumeBadge}>
                            <MaterialCommunityIcons name="barrel" size={16} color={COLORS.secondary} />
                            <Text style={[styles.volumeText, { color: COLORS.secondary }]}>{Math.round(item.volumeBBL)} BBL</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={[styles.header, { marginTop: Platform.OS === 'android' ? 32 : 0 }]}>
                    <View style={styles.headerTitleContainer}>
                        <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={COLORS.primary} />
                        <Text style={styles.headerText}>Histórico de Cálculos</Text>
                    </View>

                    {calculations.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearHistoryButton}
                            onPress={clearHistory}
                        >
                            <MaterialIcons name="delete-sweep" size={20} color={COLORS.error} />
                            <Text style={styles.clearHistoryText}>Limpar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {calculations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="history" size={70} color={COLORS.borderLight} />
                        <Text style={styles.emptyText}>Nenhum cálculo no histórico</Text>
                        <Text style={styles.emptySubText}>Os cálculos realizados aparecerão aqui</Text>
                    </View>
                ) : (
                    <FlatList
                        data={calculations}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCalculationItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        fontSize: FONTS.size.lg,
        fontWeight: FONTS.weight.semiBold,
        color: COLORS.text,
        marginLeft: SPACING.xs,
    },
    clearHistoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: 16,
        ...SHADOWS.small,
    },
    clearHistoryText: {
        color: COLORS.error,
        marginLeft: 4,
        fontWeight: FONTS.weight.medium,
        fontSize: FONTS.size.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: FONTS.size.lg,
        fontWeight: FONTS.weight.semiBold,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
    emptySubText: {
        fontSize: FONTS.size.md,
        color: COLORS.textLight,
        marginTop: SPACING.xs,
    },
    listContainer: {
        paddingBottom: SPACING.lg,
    },
    calculationItem: {
        ...CARD_STYLES.container,
        marginBottom: SPACING.md,
    },
    calculationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        paddingBottom: SPACING.xs,
        marginBottom: SPACING.sm,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    calculationDate: {
        fontSize: FONTS.size.sm,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    deleteButton: {
        padding: SPACING.xs,
    },
    calculationDetails: {
        marginTop: SPACING.xs,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.xs,
    },
    detailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: FONTS.size.md - 2,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    detailValue: {
        fontSize: FONTS.size.md - 2,
        fontWeight: FONTS.weight.medium,
        color: COLORS.text,
        maxWidth: '60%',
        textAlign: 'right',
    },
    resultSummary: {
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    volumeContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
    },
    volumeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: 16,
        marginLeft: SPACING.sm,
        marginBottom: SPACING.xs,
        ...SHADOWS.small,
    },
    volumeText: {
        fontSize: FONTS.size.sm,
        fontWeight: FONTS.weight.semiBold,
        color: COLORS.primary,
        marginLeft: SPACING.xs,
    },
});

export default ReportScreen;