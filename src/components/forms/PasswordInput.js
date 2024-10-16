import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PasswordInput = ({ value, onChangeText }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.passwordContainer}>
            <TextInput
                style={styles.passwordInput}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
            >
                <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="black" 
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        padding: 15,
        color: 'black',
    },
    eyeIcon: {
        padding: 15,
    },
});

export default PasswordInput;