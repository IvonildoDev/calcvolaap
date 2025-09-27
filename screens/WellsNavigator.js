import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import WellsScreen from './WellsScreen';
import AddWellScreen from './AddWellScreen';
import { COLORS } from '../theme/theme';

const Stack = createStackNavigator();

const WellsNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="WellsList"
                component={WellsScreen}
                options={{
                    title: 'Lista de Poços',
                }}
            />
            <Stack.Screen
                name="AddWell"
                component={AddWellScreen}
                options={{
                    title: 'Cadastrar Poço',
                }}
            />
        </Stack.Navigator>
    );
};

export default WellsNavigator;