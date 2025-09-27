import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, CARD_STYLES, INPUT_STYLES, BUTTON_STYLES } from '../theme/theme';
import { addWell } from '../services/database';

export default function RegisterWellScreen({ navigation }) {
    const [de, setDe] = useState('');
    const [para, setPara] = useState('');
    const [diam, setDiam] = useState('');
    const [comp, setComp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const diameterOptions = [
        { label: 'Selecione o diâmetro', value: '' },
        { label: 'Tubo (2 3/8)', value: '2 3/8' },
        { label: 'Tubo (2 7/8)', value: '2 7/8' },
        { label: 'Tubo (3 1/2)', value: '3 1/2' },

    ];

    const validate = () => {
        const newErrors = {};
        if (!de.trim()) newErrors.de = 'Nome do poço (DE) é obrigatório';
        if (!para.trim()) newErrors.para = 'Destino (PARA) é obrigatório';
        if (!diam) newErrors.diam = 'Diâmetro do tubo é obrigatório';
        if (!comp.trim()) newErrors.comp = 'Comprimento é obrigatório';
        else if (isNaN(parseFloat(comp)) || parseFloat(comp) <= 0) newErrors.comp = 'Comprimento deve ser um número positivo';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearForm = () => {
        setDe('');
        setPara('');
        setDiam('');
        setComp('');
        setErrors({});
    };

    const handleSave = async () => {
        if (!validate()) {
            Alert.alert('Erro de Validação', 'Por favor, corrija os erros no formulário.');
            return;
        }
        setIsLoading(true);
        try {
            const wellData = {
                de: de.trim().toUpperCase(),
                para: para.trim().toUpperCase(),
                diam: parseInt(diam),
                comp: parseFloat(comp),
            };
            await addWell(wellData);
            Alert.alert('Sucesso!', 'Poço cadastrado com sucesso!', [
                { text: 'Cadastrar Outro', onPress: clearForm },
                { text: 'Ver Lista', onPress: () => navigation.navigate('Wells') },
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível cadastrar o poço. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always">
                <View style={[styles.header, { marginTop: Platform.OS === 'android' ? 32 : 0 }]}>
                    <MaterialCommunityIcons name="plus-circle" size={32} color={COLORS.primary} />
                    <Text style={styles.headerTitle}>Cadastrar Novo Poço</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Informações do Poço</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nome do Poço (DE):</Text>
                        <TextInput
                            style={[styles.input, errors.de && styles.inputError]}
                            placeholder="Ex: PIR-001"
                            value={de}
                            onChangeText={setDe}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            spellCheck={false}
                            placeholderTextColor={COLORS.textLight}
                        />
                        {errors.de && <Text style={styles.errorText}>{errors.de}</Text>}
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Destino (PARA):</Text>
                        <TextInput
                            style={[styles.input, errors.para && styles.inputError]}
                            placeholder="Ex: SAT-05 ou EPPIR"
                            value={para}
                            onChangeText={setPara}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            spellCheck={false}
                            placeholderTextColor={COLORS.textLight}
                        />
                        {errors.para && <Text style={styles.errorText}>{errors.para}</Text>}
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Diâmetro do Tubo:</Text>
                        <View style={[styles.pickerContainer, errors.diam && styles.inputError]}>
                            <Picker
                                selectedValue={diam}
                                onValueChange={setDiam}
                                style={styles.picker}
                                dropdownIconColor={COLORS.primary}
                            >
                                {diameterOptions.map((option) => (
                                    <Picker.Item
                                        key={option.value}
                                        label={option.label}
                                        value={option.value}
                                        color={option.value === '' ? COLORS.textLight : COLORS.text}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {errors.diam && <Text style={styles.errorText}>{errors.diam}</Text>}
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Comprimento (metros):</Text>
                        <TextInput
                            style={[styles.input, errors.comp && styles.inputError]}
                            placeholder="Ex: 1500"
                            value={comp}
                            onChangeText={setComp}
                            keyboardType="numeric"
                            autoCorrect={false}
                            spellCheck={false}
                            placeholderTextColor={COLORS.textLight}
                        />
                        {errors.comp && <Text style={styles.errorText}>{errors.comp}</Text>}
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.clearButton} onPress={clearForm} disabled={isLoading}>
                        <MaterialIcons name="clear" size={20} color={COLORS.text} />
                        <Text style={[styles.buttonText, { color: COLORS.text }]}>Limpar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.saveButton, isLoading && styles.buttonDisabled]} onPress={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <MaterialIcons name="save" size={20} color="white" />
                        )}
                        <Text style={styles.buttonText}>{isLoading ? 'Salvando...' : 'Salvar Poço'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.infoCard}>
                    <MaterialIcons name="info" size={24} color={COLORS.info} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Dicas para o cadastro:</Text>
                        <Text style={styles.infoText}>
                            • Use nomes padronizados (ex: PIR-001, SAT-05){'\n'}
                            • O comprimento deve ser em metros{'\n'}
                            • Verifique os dados antes de salvar{'\n'}
                            • Poços duplicados não serão aceitos
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
        gap: SPACING.md,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    card: {
        ...CARD_STYLES.container,
        marginBottom: SPACING.lg,
    },
    cardTitle: {
        ...CARD_STYLES.title,
        textAlign: 'center',
        marginBottom: SPACING.lg,
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
    input: {
        ...INPUT_STYLES.input,
    },
    inputError: {
        borderColor: COLORS.error,
        borderWidth: 1,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: SPACING.xs,
        marginLeft: SPACING.xs,
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
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    clearButton: {
        ...BUTTON_STYLES.secondary,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
    },
    saveButton: {
        ...BUTTON_STYLES.primary,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.info,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoContent: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});
