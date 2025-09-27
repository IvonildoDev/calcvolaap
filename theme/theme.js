export const COLORS = {
    primary: '#1976D2',
    secondary: '#FF9800',
    background: '#F5F6FA',
    surface: '#FFFFFF',
    text: '#222B45',
    textSecondary: '#6E7582',
    textLight: '#B0B7C3',
    border: '#E4E9F2',
    borderLight: '#F1F2F6',
    error: '#E53935',
    success: '#4CAF50',
    info: '#2196F3',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const FONTS = {
    size: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
    },
    weight: {
        regular: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
    },
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 2,
    },
};

export const CARD_STYLES = {
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
    },
    title: {
        fontSize: FONTS.size.lg,
        fontWeight: FONTS.weight.semiBold,
        color: COLORS.primary,
        marginBottom: SPACING.sm,
    },
};

export const INPUT_STYLES = {
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONTS.size.md,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: SPACING.sm,
        fontSize: FONTS.size.md,
        color: COLORS.text,
        backgroundColor: COLORS.surface,
    },
};

export const BUTTON_STYLES = {
    primary: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontWeight: FONTS.weight.medium,
        fontSize: FONTS.size.md,
        marginLeft: 6,
    },
};
