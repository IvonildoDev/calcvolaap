import * as SQLite from 'expo-sqlite';

// Abrir/criar banco de dados
let db;

// Função para inicializar o banco de dados
const initDB = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('calcvol.db');
    }
    return db;
};

// Inicializar banco de dados
export const initDatabase = async () => {
    try {
        const database = await initDB();

        // Criar tabela de poços
        await database.execAsync(`
            CREATE TABLE IF NOT EXISTS wells (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                de TEXT NOT NULL,
                para TEXT NOT NULL,
                diam INTEGER NOT NULL,
                comp REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Criar tabela de cálculos
        await database.execAsync(`
            CREATE TABLE IF NOT EXISTS calculations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                well_name TEXT NOT NULL,
                distance REAL NOT NULL,
                pipe_type TEXT NOT NULL,
                operation_type TEXT NOT NULL,
                volume_liters REAL NOT NULL,
                volume_bbl REAL NOT NULL,
                date TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        return database;
    } catch (error) {
        console.error('Erro ao criar tabelas:', error);
        throw error;
    }
};

// Inserir dados dos poços (seed data)
export const seedWellsData = async (wellsData) => {
    try {
        const database = await initDB();

        // Verificar se já existem dados
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM wells;');
        const count = result.count;

        if (count === 0) {

            // Inserir dados dos poços
            for (const well of wellsData) {
                await database.runAsync(
                    'INSERT INTO wells (de, para, diam, comp) VALUES (?, ?, ?, ?);',
                    [well.de, well.para, well.diam, well.comp]
                );
            }

        }
    } catch (error) {
        console.error('Erro ao popular dados dos poços:', error);
        throw error;
    }
};

// Buscar todos os poços
export const getAllWells = async () => {
    try {
        const database = await initDB();
        const result = await database.getAllAsync('SELECT * FROM wells ORDER BY de;');
        return result;
    } catch (error) {
        console.error('Erro ao buscar todos os poços:', error);
        throw error;
    }
};

// Buscar poços por termo de busca
export const searchWells = async (searchTerm) => {
    try {
        const database = await initDB();
        const result = await database.getAllAsync(
            'SELECT * FROM wells WHERE de LIKE ? OR para LIKE ? ORDER BY de;',
            [`%${searchTerm}%`, `%${searchTerm}%`]
        );
        return result;
    } catch (error) {
        console.error('Erro ao buscar poços:', error);
        throw error;
    }
};

// Salvar cálculo no banco
export const saveCalculation = async (calculation) => {
    try {
        const database = await initDB();
        const result = await database.runAsync(
            `INSERT INTO calculations (well_name, distance, pipe_type, operation_type, volume_liters, volume_bbl, date) 
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
                calculation.wellName,
                calculation.distance,
                calculation.pipeType,
                calculation.operationType,
                calculation.volumeLiters,
                calculation.volumeBbl,
                calculation.date
            ]
        );
        return { insertId: result.lastInsertRowId };
    } catch (error) {
        console.error('Erro ao salvar cálculo:', error);
        throw error;
    }
};

// Buscar todos os cálculos
export const getAllCalculations = async () => {
    try {
        const database = await initDB();
        const result = await database.getAllAsync('SELECT * FROM calculations ORDER BY created_at DESC;');
        return result;
    } catch (error) {
        console.error('Erro ao buscar cálculos:', error);
        throw error;
    }
};

// Deletar cálculo
export const deleteCalculation = async (id) => {
    try {
        const database = await initDB();
        const result = await database.runAsync('DELETE FROM calculations WHERE id = ?;', [id]);
        return result.changes > 0;
    } catch (error) {
        console.error('Erro ao deletar cálculo:', error);
        throw error;
    }
};

// Deletar todos os cálculos
export const deleteAllCalculations = async () => {
    try {
        const database = await initDB();
        const result = await database.runAsync('DELETE FROM calculations;');
        return result.changes;
    } catch (error) {
        console.error('Erro ao deletar todos os cálculos:', error);
        throw error;
    }
};

// Adicionar um novo poço à base de dados
export const addWell = async (wellData) => {
    try {
        const database = await initDB();

        // Verifica se já existe um poço com o mesmo nome (de)
        const existingWell = await database.getFirstAsync(
            'SELECT * FROM wells WHERE de = ?;',
            [wellData.de]
        );

        if (existingWell) {
            throw new Error(`Poço ${wellData.de} já existe no sistema`);
        }

        const result = await database.runAsync(
            'INSERT INTO wells (de, para, diam, comp) VALUES (?, ?, ?, ?);',
            [wellData.de, wellData.para, wellData.diam, wellData.comp]
        );

        return result;
    } catch (error) {
        console.error('Erro ao adicionar poço:', error);
        throw error;
    }
};

// Atualizar dados de um poço existente
export const updateWell = async (id, wellData) => {
    try {
        const database = await initDB();
        const result = await database.runAsync(
            'UPDATE wells SET de = ?, para = ?, diam = ?, comp = ? WHERE id = ?;',
            [wellData.de, wellData.para, wellData.diam, wellData.comp, id]
        );

        if (result.changes === 0) {
            throw new Error('Poço não encontrado');
        }

        return result;
    } catch (error) {
        console.error('Erro ao atualizar poço:', error);
        throw error;
    }
};

// Deletar um poço
export const deleteWell = async (id) => {
    try {
        const database = await initDB();
        const result = await database.runAsync('DELETE FROM wells WHERE id = ?;', [id]);

        if (result.changes === 0) {
            throw new Error('Poço não encontrado');
        }

        return result;
    } catch (error) {
        console.error('Erro ao deletar poço:', error);
        throw error;
    }
};