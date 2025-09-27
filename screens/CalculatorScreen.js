import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Keyboard,
    Alert,
    FlatList,
    Modal,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { COLORS, SPACING, FONTS, CARD_STYLES, INPUT_STYLES, BUTTON_STYLES } from '../theme/theme';
import { searchWells } from '../services/database';

const CalculatorScreen = ({ navigation }) => {
    const [wellName, setWellName] = useState('');
    const [distance, setDistance] = useState('');
    const [selectedPipe, setSelectedPipe] = useState('');
    const [selectedOperation, setSelectedOperation] = useState('');
    const [result, setResult] = useState(null);

    // Estados para busca de poços
    const [wellSuggestions, setWellSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Constants for pipe types and their volume conversion factors - matching the web version
    const PIPE_CONSTANTS = {
        '1': { name: 'Tubo (2 3/8)', constant: 2.019 },
        '2': { name: 'Tubo (2 7/8)', constant: 3.020 },
        '3': { name: 'Tubo (3 1/2)', constant: 4.531 }
    };

    // Operation types
    const OPERATION_TYPES = {
        '1': 'Desparafinação Térmica',
        '2': 'Passagem de Pig',
        '3': 'Desparafinação Térmica e Passagem de Pig',
        '4': 'Preenchimento de Linha de produção',
        '5': 'Preenchimento de coluna',
        '6': 'Teste de estanquidade',
        '7': 'Teste hidrostático',
    };

    // Barrel conversion constant
    const LITERS_TO_BBL = 159; // 159 liters = 1 bbl

    // Função para buscar poços conforme o usuário digita
    const handleWellNameChange = async (text) => {
        setWellName(text);

        if (text.trim().length >= 2) {
            setIsSearching(true);
            try {
                const suggestions = await searchWells(text.trim());
                // Limita a 10 sugestões e remove duplicatas baseadas em 'de'
                const uniqueSuggestions = suggestions
                    .filter((item, index, self) =>
                        index === self.findIndex(t => t.de === item.de)
                    )
                    .slice(0, 10);
                setWellSuggestions(uniqueSuggestions);
                setShowSuggestions(uniqueSuggestions.length > 0);
            } catch (error) {
                console.error('Erro ao buscar poços:', error);
                setWellSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsSearching(false);
            }
        } else {
            setWellSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Função para selecionar um poço das sugestões
    const selectWell = (well) => {
        setWellName(well.de);
        setShowSuggestions(false);
        setWellSuggestions([]);

        // Se existir uma distância conhecida entre os poços, pode preencher automaticamente
        if (well.comp) {
            setDistance(well.comp.toString());
        }
    };

    const calculateVolume = () => {
        if (!wellName || !distance || !selectedPipe || !selectedOperation) {
            Alert.alert(
                'Campos obrigatórios',
                'Por favor, preencha todos os campos para calcular o volume.',
                [{ text: 'OK' }]
            );
            return;
        }

        const distanceValue = parseFloat(distance);
        if (isNaN(distanceValue) || distanceValue <= 0) {
            Alert.alert(
                'Valor inválido',
                'Por favor, insira um valor numérico válido para a distância.',
                [{ text: 'OK' }]
            );
            return;
        }

        const pipeConstant = PIPE_CONSTANTS[selectedPipe].constant;
        const operationType = OPERATION_TYPES[selectedOperation];

        // Cálculo do volume em litros
        const volumeInLiters = distanceValue * pipeConstant;

        // Conversão para barris
        const volumeInBarrels = volumeInLiters / LITERS_TO_BBL;

        const calculationResult = {
            wellName,
            distance: distanceValue,
            pipeType: PIPE_CONSTANTS[selectedPipe].name,
            operationType,
            volumeInLiters: Math.round(volumeInLiters * 100) / 100,
            volumeInBarrels: Math.round(volumeInBarrels * 100) / 100,
            date: new Date().toLocaleString('pt-BR')
        };

        setResult(calculationResult);
        Keyboard.dismiss();

        // Salva o cálculo no histórico
        saveCalculation(calculationResult);
    };

    const saveCalculation = async (calculationResult) => {
        try {
            // Gerar um ID único para o cálculo
            const calculationId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

            const calculationToSave = {
                id: calculationId,
                wellName: calculationResult.wellName,
                distance: calculationResult.distance,
                pipeType: calculationResult.pipeType,
                operationType: calculationResult.operationType,
                volumeLiters: calculationResult.volumeInLiters,
                volumeBBL: calculationResult.volumeInBarrels,
                date: calculationResult.date
            };

            // Recuperar cálculos existentes
            const existingCalculationsJSON = await AsyncStorage.getItem('calculations');
            let calculations = [];

            if (existingCalculationsJSON) {
                calculations = JSON.parse(existingCalculationsJSON);
            }

            // Adicionar o novo cálculo
            calculations.unshift(calculationToSave); // Adiciona no início da lista

            // Limitar a 50 cálculos no histórico
            if (calculations.length > 50) {
                calculations = calculations.slice(0, 50);
            }

            // Salvar de volta no AsyncStorage
            await AsyncStorage.setItem('calculations', JSON.stringify(calculations));

            console.log('Cálculo salvo com sucesso:', calculationToSave);
        } catch (error) {
            console.error('Erro ao salvar cálculo:', error);
            Alert.alert(
                'Aviso',
                'Cálculo realizado, mas não foi possível salvar no histórico.',
                [{ text: 'OK' }]
            );
        }
    };

    const clearFields = () => {
        setWellName('');
        setDistance('');
        setSelectedPipe('');
        setSelectedOperation('');
        setResult(null);
        setWellSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={[styles.logoContainer, { marginTop: Platform.OS === 'android' ? 32 : 0 }]}>
                    <Logo size="large" horizontal={true} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Dados da Operação</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            <MaterialCommunityIcons name="barrel" size={18} color={COLORS.primary} /> Nome do Poço:
                        </Text>
                        <View style={styles.wellInputContainer}>
                            <TextInput
                                style={[styles.input, showSuggestions && styles.inputWithSuggestions]}
                                placeholder="Digite o nome do poço (ex: PIR-01)"
                                value={wellName}
                                onChangeText={handleWellNameChange}
                                placeholderTextColor={COLORS.textLight}
                                onFocus={() => {
                                    if (wellName.trim().length >= 2 && wellSuggestions.length > 0) {
                                        setShowSuggestions(true);
                                    }
                                }}
                            />
                            {isSearching && (
                                <View style={styles.searchingIndicator}>
                                    <MaterialIcons name="search" size={16} color={COLORS.primary} />
                                </View>
                            )}

                            {/* Modal para sugestões */}
                            <Modal
                                visible={showSuggestions}
                                transparent={true}
                                animationType="fade"
                                onRequestClose={() => setShowSuggestions(false)}
                            >
                                <TouchableOpacity
                                    style={styles.modalOverlay}
                                    activeOpacity={1}
                                    onPress={() => setShowSuggestions(false)}
                                >
                                    <View style={styles.suggestionsContainer}>
                                        <View style={styles.suggestionsHeader}>
                                            <Text style={styles.suggestionsTitle}>Poços Encontrados</Text>
                                            <TouchableOpacity
                                                onPress={() => setShowSuggestions(false)}
                                                style={styles.closeButton}
                                            >
                                                <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                        <FlatList
                                            data={wellSuggestions}
                                            keyExtractor={(item, index) => `${item.de}-${index}`}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.suggestionItem}
                                                    onPress={() => selectWell(item)}
                                                >
                                                    <View style={styles.suggestionContent}>
                                                        <Text style={styles.suggestionWellName}>{item.de}</Text>
                                                        <Text style={styles.suggestionDetails}>
                                                            Para: {item.para} | Diâm: {item.diam}" | Comp: {item.comp}m
                                                        </Text>
                                                    </View>
                                                    <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
                                                </TouchableOpacity>
                                            )}
                                            style={styles.suggestionsList}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            <MaterialIcons name="straighten" size={18} color={COLORS.primary} /> Distância (Metros):
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite a distância"
                            keyboardType="numeric"
                            value={distance}
                            onChangeText={setDistance}
                            placeholderTextColor={COLORS.textLight}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            <MaterialCommunityIcons name="pipe" size={18} color={COLORS.primary} /> Diâmetro do Tubo:
                        </Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedPipe}
                                onValueChange={(itemValue) => setSelectedPipe(itemValue)}
                                style={styles.picker}
                                dropdownIconColor={COLORS.primary}
                            >
                                <Picker.Item label="Selecione o diâmetro do tubo" value="" color={COLORS.textLight} />
                                <Picker.Item label="Tubo (2 3/8)" value="1" color={COLORS.text} />
                                <Picker.Item label="Tubo (2 7/8)" value="2" color={COLORS.text} />
                                <Picker.Item label="Tubo (3 1/2)" value="3" color={COLORS.text} />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            <MaterialCommunityIcons name="wrench" size={18} color={COLORS.primary} /> Tipo de Operação:
                        </Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedOperation}
                                onValueChange={(itemValue) => setSelectedOperation(itemValue)}
                                style={styles.picker}
                                dropdownIconColor={COLORS.primary}
                            >
                                <Picker.Item label="Selecione o tipo de operação" value="" color={COLORS.textLight} />
                                <Picker.Item label="Desparafinação Térmica" value="1" color={COLORS.text} />
                                <Picker.Item label="Passagem de Pig" value="2" color={COLORS.text} />
                                <Picker.Item label="Desparafinação Térmica e Passagem de Pig" value="3" color={COLORS.text} />
                                <Picker.Item label="Preenchimento de Linha de produção" value="4" color={COLORS.text} />
                                <Picker.Item label="Preenchimento de coluna" value="5" color={COLORS.text} />
                                <Picker.Item label="Teste de estanquidade" value="6" color={COLORS.text} />
                                <Picker.Item label="Teste hidrostático" value="7" color={COLORS.text} />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.calculateButton} onPress={calculateVolume}>
                            <MaterialCommunityIcons name="calculator" size={20} color="white" />
                            <Text style={styles.buttonText}>Calcular Volume</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.clearButton} onPress={clearFields}>
                            <MaterialIcons name="clear" size={20} color={COLORS.text} />
                            <Text style={[styles.buttonText, { color: COLORS.text }]}>Limpar Campos</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {result && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
                            <Text style={styles.resultTitle}>Resultado do Cálculo</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.resultInfo}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Poço:</Text>
                                <Text style={styles.resultValue}>{result.wellName}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Distância:</Text>
                                <Text style={styles.resultValue}>{result.distance}m</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Tubo:</Text>
                                <Text style={styles.resultValue}>{result.pipeType}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Operação:</Text>
                                <Text style={styles.resultValue}>{result.operationType}</Text>
                            </View>
                        </View>

                        <View style={styles.volumeResults}>
                            <View style={styles.volumeItem}>
                                <MaterialCommunityIcons name="barrel" size={32} color={COLORS.primary} />
                                <Text style={styles.volumeValue}>{result.volumeInLiters}</Text>
                                <Text style={styles.volumeUnit}>LITROS</Text>
                            </View>

                            <View style={styles.volumeDivider} />

                            <View style={styles.volumeItem}>
                                <MaterialCommunityIcons name="oil-barrel" size={32} color={COLORS.primary} />
                                <Text style={styles.volumeValue}>{result.volumeInBarrels}</Text>
                                <Text style={styles.volumeUnit}>BARRIS</Text>
                            </View>
                        </View>

                        <Text style={styles.calculationDate}>
                            Calculado em: {result.date}
                        </Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Desenvolvido para otimização de operações petrolíferas
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flexGrow: 1,
        padding: SPACING.md,
        backgroundColor: COLORS.background,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
        marginTop: SPACING.sm,
    },
    card: {
        ...CARD_STYLES.container,
    },
    cardTitle: {
        ...CARD_STYLES.title,
        textAlign: 'center',
    },
    inputContainer: {
        ...INPUT_STYLES.container,
    },
    label: {
        ...INPUT_STYLES.label,
        fontSize: 14,
        marginBottom: SPACING.xs,
        fontWeight: '500',
        color: COLORS.text,
    },
    wellInputContainer: {
        position: 'relative',
    },
    inputWithSuggestions: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
    },
    searchingIndicator: {
        position: 'absolute',
        right: 12,
        top: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    suggestionsContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        maxHeight: '70%',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    suggestionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    suggestionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    suggestionsList: {
        maxHeight: 300,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionWellName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    suggestionDetails: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    input: {
        ...INPUT_STYLES.input,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: COLORS.text,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
        gap: SPACING.sm,
    },
    calculateButton: {
        ...BUTTON_STYLES.primary,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
    },
    clearButton: {
        ...BUTTON_STYLES.secondary,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    resultCard: {
        ...CARD_STYLES.container,
        marginTop: SPACING.md,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginLeft: SPACING.sm,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.sm,
    },
    resultInfo: {
        marginBottom: SPACING.sm,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    resultLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    resultValue: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
    },
    volumeResults: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        marginVertical: SPACING.sm,
    },
    volumeDivider: {
        width: 1,
        height: '80%',
        backgroundColor: COLORS.borderLight,
    },
    volumeItem: {
        alignItems: 'center',
        flex: 1,
    },
    volumeValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: SPACING.xs,
    },
    volumeUnit: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '500',
    },
    calculationDate: {
        fontSize: 11,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: SPACING.sm,
        fontStyle: 'italic',
    },
    footer: {
        marginTop: SPACING.lg,
        alignItems: 'center',
        paddingBottom: SPACING.md,
    },
    footerText: {
        fontSize: 11,
        color: COLORS.textLight,
        textAlign: 'center',
    },
});

export default CalculatorScreen;