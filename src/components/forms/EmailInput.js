import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const EmailInput = ({ value, onChangeText }) => {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.emailInput}
                placeholder="Ingrese su correo"
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChangeText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCompleteType="email"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        marginBottom: 15,
    },
    emailInput: {
        flex: 1,
        padding: 15,
        color: 'black',
    },
});

export default EmailInput;
