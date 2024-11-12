import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const WelcomeComponent = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/iconresulocion.png')}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>Encantado de verle!</Text>
        <Text style={styles.subText}>"¡Reserve su primera cita de belleza al instante!"</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',  
    justifyContent: 'center',  
    padding: 35,
    backgroundColor: 'white',
  },
  image: {
    width: 100,  
    height: 100,
    marginBottom: 20,  
  },
  textContainer: {
    alignItems: 'center',  
  },
  mainText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,  
  },
});

export default WelcomeComponent;
