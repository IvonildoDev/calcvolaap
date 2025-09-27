import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Linking,
    TouchableOpacity,
    Image
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { COLORS, SPACING, FONTS, SHADOWS, CARD_STYLES } from '../theme/theme';

const AboutScreen = () => {
    const appVersion = "1.0.0";
    const openLink = (url) => {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            }
        });
    };
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.logoSection}>
                <Logo size="large" />
                <Text style={styles.version}>Versão {appVersion}</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="information-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.cardTitle}>Sobre o Aplicativo</Text>
                </View>
                <Text style={styles.description}>
                    CalcVol é um aplicativo especializado para cálculo de volumes em operações de
                    desparafinação térmica e passagem de pig em linhas de produção de petróleo.
                </Text>
                <Text style={styles.description}>
                    Projetado para profissionais do setor petrolífero, o aplicativo fornece cálculos
                    precisos de volume com base no diâmetro do tubo e distância, permitindo um planejamento
                    operacional mais eficiente.
                </Text>
            </View>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="tools" size={24} color={COLORS.primary} />
                    <Text style={styles.cardTitle}>Funcionalidades</Text>
                </View>
                <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="calculator-variant" size={22} color={COLORS.secondary} />
                    <Text style={styles.featureText}>
                        Cálculo de volume para tubulações de vários diâmetros
                    </Text>
                </View>
                <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="history" size={22} color={COLORS.secondary} />
                    <Text style={styles.featureText}>
                        Histórico de cálculos realizados
                    </Text>
                </View>
                <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="pipe" size={22} color={COLORS.secondary} />
                    <Text style={styles.featureText}>
                        Consulta de dados de poços e linhas
                    </Text>
                </View>
                <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="barrel" size={22} color={COLORS.secondary} />
                    <Text style={styles.featureText}>
                        Conversão automática entre litros e barris (BBL)
                    </Text>
                </View>
            </View>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="code-tags" size={24} color={COLORS.primary} />
                    <Text style={styles.cardTitle}>Tecnologias Utilizadas</Text>
                </View>
                <View style={styles.techItem}>
                    <MaterialCommunityIcons name="react" size={24} color="#61DAFB" />
                    <View style={styles.techInfo}>
                        <Text style={styles.techName}>React Native</Text>
                        <Text style={styles.techDesc}>Framework para desenvolvimento de aplicações móveis</Text>
                    </View>
                </View>
                <View style={styles.techItem}>
                    <MaterialCommunityIcons name="language-javascript" size={24} color="#F7DF1E" />
                    <View style={styles.techInfo}>
                        <Text style={styles.techName}>JavaScript</Text>
                        <Text style={styles.techDesc}>Linguagem de programação</Text>
                    </View>
                </View>
                <View style={styles.techItem}>
                    <MaterialIcons name="storage" size={24} color="#4CAF50" />
                    <View style={styles.techInfo}>
                        <Text style={styles.techName}>AsyncStorage</Text>
                        <Text style={styles.techDesc}>Sistema de armazenamento local de dados</Text>
                    </View>
                </View>
                <View style={styles.techItem}>
                    <MaterialCommunityIcons name="navigation" size={24} color="#FF9800" />
                    <View style={styles.techInfo}>
                        <Text style={styles.techName}>React Navigation</Text>
                        <Text style={styles.techDesc}>Biblioteca para navegação entre telas</Text>
                    </View>
                </View>
            </View>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
                    <Text style={styles.cardTitle}>Desenvolvedor</Text>
                </View>
                <View style={styles.developerContainer}>
                    <View style={styles.developerAvatar}>
                        <MaterialCommunityIcons name="account-circle" size={60} color={COLORS.primary} />
                    </View>
                    <View style={styles.developerInfo}>
                        <Text style={styles.developerName}>Ivonildo Lima</Text>
                        <Text style={styles.developerRole}>Desenvolvedor de Aplicativos</Text>
                        <TouchableOpacity
                            style={styles.contactButton}
                            onPress={() => openLink('mailto:contato@exemplo.com')}
                        >
                            <MaterialCommunityIcons name="email-outline" size={18} color={COLORS.surface} />
                            <Text style={styles.contactButtonText}>Contato</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={styles.footer}>
                <Text style={styles.copyright}>© 2025 CalcVol - Todos os direitos reservados</Text>
                <Text style={styles.footerText}>Desenvolvido por Ivonildo Lima</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.md,
    },
    contentContainer: {
        paddingBottom: SPACING.xl,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingVertical: SPACING.lg,
    },
    version: {
        fontSize: FONTS.size.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    },
    card: {
        ...CARD_STYLES.container,
        marginBottom: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    cardTitle: {
        fontSize: FONTS.size.lg,
        fontWeight: FONTS.weight.semiBold,
        color: COLORS.primary,
        marginLeft: SPACING.xs,
    },
    description: {
        fontSize: FONTS.size.md,
        color: COLORS.text,
        marginBottom: SPACING.sm,
        lineHeight: 22,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    featureText: {
        fontSize: FONTS.size.md,
        color: COLORS.text,
        marginLeft: SPACING.sm,
        flex: 1,
    },
    techItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    techInfo: {
        marginLeft: SPACING.sm,
        flex: 1,
    },
    techName: {
        fontSize: FONTS.size.md,
        fontWeight: FONTS.weight.medium,
        color: COLORS.text,
    },
    techDesc: {
        fontSize: FONTS.size.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    developerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    developerAvatar: {
        marginRight: SPACING.md,
    },
    developerInfo: {
        flex: 1,
    },
    developerName: {
        fontSize: FONTS.size.lg,
        fontWeight: FONTS.weight.semiBold,
        color: COLORS.text,
    },
    developerRole: {
        fontSize: FONTS.size.md - 2,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    contactButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    contactButtonText: {
        color: COLORS.surface,
        marginLeft: SPACING.xs,
        fontWeight: FONTS.weight.medium,
    },
    footer: {
        marginTop: SPACING.lg,
        alignItems: 'center',
    },
    copyright: {
        fontSize: FONTS.size.xs,
        color: COLORS.textLight,
        marginBottom: SPACING.xs,
    },
    footerText: {
        fontSize: FONTS.size.sm,
        color: COLORS.textSecondary,
    }
});

export default AboutScreen;