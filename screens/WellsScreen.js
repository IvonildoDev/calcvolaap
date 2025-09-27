import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAllWells, searchWells as searchWellsDB } from '../services/database';

export default function WellsScreen({ navigation }) {
    const [wells, setWells] = useState([]);
    const [filteredWells, setFilteredWells] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar dados quando a tela ganhar foco
    useFocusEffect(
        React.useCallback(() => {
            loadWellsData();
            return () => { };
        }, [])
    );

    const loadWellsData = async () => {
        try {
            setIsLoading(true);
            const wellsData = await getAllWells();
            setWells(wellsData);
            setFilteredWells(wellsData);
        } catch (error) {
            console.error('Erro ao carregar dados dos poços:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados dos poços');
        } finally {
            setIsLoading(false);
        }
    };

    // Função para buscar poços
    const handleSearch = async (text) => {
        try {
            setIsSearching(true);
            if (text.trim() === '') {
                setFilteredWells(wells);
            } else {
                const wells = await searchWellsDB(text.trim());
                setFilteredWells(wells);
            }
        } catch (error) {
            console.error('Erro na busca:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Componente para cabeçalho da tabela
    const TableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1 }]}>DE</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>PARA</Text>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>DIÂM.</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>COMP.</Text>
        </View>
    );

    // Componente para renderizar cada item da lista
    const renderWellItem = ({ item, index }) => (
        <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }]}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.de}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.para}</Text>
            <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center' }]}>{item.diam}"</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.comp}m</Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Carregando dados dos poços...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { marginTop: Platform.OS === 'android' ? 32 : 0 }]}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="oil-barrel" size={32} color="#007bff" />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Cadastro de Poços</Text>
                        <Text style={styles.headerSubtitle}>
                            {filteredWells.length} poço{filteredWells.length !== 1 ? 's' : ''} encontrado{filteredWells.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
                {/* Botão de cadastro removido */}
            </View>

            {/* Campo de busca */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={24} color="#6c757d" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar poços (DE ou PARA)..."
                    placeholderTextColor="#6c757d"
                    onChangeText={handleSearch}
                />
                {isSearching && (
                    <ActivityIndicator size="small" color="#007bff" style={styles.searchLoader} />
                )}
            </View>

            {/* Tabela de poços */}
            <View style={styles.tableContainer}>
                <TableHeader />
                <FlatList
                    data={filteredWells}
                    renderItem={renderWellItem}
                    keyExtractor={(item, index) => `${item.de}-${item.para}-${index}`}
                    style={styles.flatList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="search-off" size={48} color="#6c757d" />
                            <Text style={styles.emptyText}>Nenhum poço encontrado</Text>
                        </View>
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 16,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#007bff',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#212529',
        paddingVertical: 4,
    },
    searchLoader: {
        marginLeft: 12,
    },
    tableContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#007bff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    headerCell: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    flatList: {
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        minHeight: 48,
        alignItems: 'center',
    },
    tableCell: {
        fontSize: 13,
        color: '#495057',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
        marginTop: 16,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6c757d',
        marginTop: 16,
        textAlign: 'center',
    },
});