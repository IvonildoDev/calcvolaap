import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, CARD_STYLES, INPUT_STYLES, BUTTON_STYLES } from '../theme/theme';
import { addWell } from '../services/database';

const AddWellScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        de: '',
        para: '',
        diam: '',
        comp: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Opções de diâmetro disponíveis
    const diameterOptions = [
        { label: 'Selecione o diâmetro', value: '' },
        { label: 'Tubo (2 3/8)', value: '2 3/8' },
        { label: 'Tubo (2 7/8)', value: '2 7/8' },
        { label: 'Tubo (3 1/2)', value: '3 1/2' },
        { label: '3 polegadas', value: '3' },
        { label: '4 polegadas', value: '4' },
        { label: '6 polegadas', value: '6' },
        { label: '8 polegadas', value: '8' }
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.de.trim()) {
            newErrors.de = 'Nome do poço (DE) é obrigatório';
        }

        if (!formData.para.trim()) {
            newErrors.para = 'Destino (PARA) é obrigatório';
        }

        if (!formData.diam) {
            newErrors.diam = 'Diâmetro do tubo é obrigatório';
        }

        if (!formData.comp.trim()) {
            newErrors.comp = 'Comprimento é obrigatório';
        } else {
            const compValue = parseFloat(formData.comp);
            if (isNaN(compValue) || compValue <= 0) {
                newErrors.comp = 'Comprimento deve ser um número positivo';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Remove o erro do campo quando o usuário começa a digitar
        setErrors(prev => {
            if (prev[field]) {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            }
            return prev;
        });
    }, []);

    // Callbacks individuais para cada campo para evitar re-renderizações
    const handleDeChange = useCallback((text) => handleInputChange('de', text), []);
    const handleParaChange = useCallback((text) => handleInputChange('para', text), []);
    const handleCompChange = useCallback((text) => handleInputChange('comp', text), []);

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert('Erro de Validação', 'Por favor, corrija os erros no formulário.');
            return;
        }

        setIsLoading(true);

        try {
            const wellData = {
                de: formData.de.trim().toUpperCase(),
                para: formData.para.trim().toUpperCase(),
                diam: parseInt(formData.diam),
                comp: parseFloat(formData.comp)
            };

            await addWell(wellData);

            Alert.alert(
                'Sucesso!',
                'Poço cadastrado com sucesso!',
                [
                    {
                        text: 'Cadastrar Outro',
                        onPress: clearForm
                    },
                    {
                        text: 'Ver Lista',
                        onPress: () => navigation.navigate('Wells')
                    }
                ]
            );
        } catch (error) {
            console.error('Erro ao salvar poço:', error);
            Alert.alert(
                'Erro',
                'Não foi possível cadastrar o poço. Tente novamente.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const clearForm = () => {
        setFormData({
            de: '',
            para: '',
            diam: '',
            comp: ''
        });
        setErrors({});
    };

    const InputField = React.memo(({ label, value, onChangeText, placeholder, keyboardType = 'default', error, icon }) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>
                <MaterialIcons name={icon} size={18} color={COLORS.primary} /> {label}:
            </Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor={COLORS.textLight}
                keyboardType={keyboardType}
                autoCapitalize={keyboardType === 'default' ? 'characters' : 'none'}
                blurOnSubmit={false}
                autoCorrect={false}
                spellCheck={false}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    ), (prevProps, nextProps) => {
        return prevProps.value === nextProps.value &&
            prevProps.error === nextProps.error &&
            prevProps.label === nextProps.label;
    });

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <MaterialCommunityIcons name="plus-circle" size={32} color={COLORS.primary} />
                        <Text style={styles.headerTitle}>Cadastrar Novo Poço</Text>
                        <Text style={styles.headerSubtitle}>
                            Adicione um novo poço ao sistema
                        </Text>
                    </View>
                </View>

                {/* Formulário */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Informações do Poço</Text>

                    <InputField
                        label="Nome do Poço (DE)"
                        value={formData.de}
                        onChangeText={handleDeChange}
                        placeholder="Ex: PIR-001"
                        error={errors.de}
                        icon="location-pin"
                    />

                    <InputField
                        label="Destino (PARA)"
                        value={formData.para}
                        onChangeText={handleParaChange}
                        placeholder="Ex: SAT-05 ou EPPIR"
                        error={errors.para}
                        icon="place"
                    />

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            <MaterialCommunityIcons name="pipe" size={18} color={COLORS.primary} /> Diâmetro do Tubo:
                        </Text>
                        <View style={[styles.pickerContainer, errors.diam && styles.inputError]}>
                            <Picker
                                selectedValue={formData.diam}
                                onValueChange={(value) => handleInputChange('diam', value)}
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
                        {errors.diam ? <Text style={styles.errorText}>{errors.diam}</Text> : null}
                    </View>

                    <InputField
                        label="Comprimento (metros)"
                        value={formData.comp}
                        onChangeText={handleCompChange}
                        placeholder="Ex: 1500"
                        keyboardType="numeric"
                        error={errors.comp}
                        icon="straighten"
                    />
                </View>

                {/* Botões */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearForm}
                        disabled={isLoading}
                    >
                        <MaterialIcons name="clear" size={20} color={COLORS.text} />
                        <Text style={[styles.buttonText, { color: COLORS.text }]}>Limpar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <MaterialIcons name="save" size={20} color="white" />
                        )}
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Salvando...' : 'Salvar Poço'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Informações adicionais */}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
    },
    backButton: {
        padding: SPACING.sm,
        marginRight: SPACING.sm,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.sm,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
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

export default AddWellScreen;