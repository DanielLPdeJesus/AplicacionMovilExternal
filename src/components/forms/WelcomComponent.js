import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const WelcomeComponent = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>Encantado de verte!</Text>
        <Text style={styles.subText}>"¡Reserva tu primera cita de belleza al instante!"</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 35,
    backgroundColor: 'white',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  mainText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center'
  },
});

export default WelcomeComponent;