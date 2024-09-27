import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const stilos = [
  { id: '1', name: 'Afro', description: '*Descripción', image: require('../../../assets/logodani.jpg') },
  { id: '2', name: 'Moicano', description: '*Descripción', image: require('../../../assets/logodani.jpg') },
  { id: '3', name: 'Pelon', description: '*Descripción', image: require('../../../assets/logodani.jpg') },
  { id: '4', name: 'Corte Militar', description: '*Descripción', image: require('../../../assets/logodani.jpg') },
  { id: '5', name: 'Rastas', description: '*Descripción', image: require('../../../assets/logodani.jpg') },
];

const GaleriaEstilos = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.avisoContainer}>
        <Text style={styles.avisoTitle}>Aviso</Text>
        <Text style={styles.avisoText}>Prueba los Diseños con IA</Text>
        <Text style={styles.avisoSubtext}>Dele click al nombre del corte para probarlo...</Text>
      </View>
      
      <Text style={styles.sectionTitle}>Cortes Bonitos</Text>
      
   
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Text>Cortes de Cabello</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text>Tintes</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
  },
  avisoContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  avisoTitle: {
    fontWeight: 'bold',
  },
  avisoText: {
    fontWeight: 'bold',
  },
  avisoSubtext: {
    fontSize: 12,
    color: 'gray',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
  },
  description: {
    color: 'gray',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  footerButton: {
    padding: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
});

export default GaleriaEstilos;