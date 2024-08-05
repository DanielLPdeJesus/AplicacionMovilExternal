import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = () => {
    fetch('https://jaydey.pythonanywhere.com/Services/api/businesses')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setBusinesses(data.businesses);
        }
      })
      .catch(error => {
        console.error('Error fetching businesses:', error);
      });
  };

  const renderBusinessItem = ({ item }) => (
    <TouchableOpacity style={styles.businessItem}>
      <Image 
        source={{ uri: item.business_images[0] }} 
        style={styles.businessImage} 
      />
      <Text style={styles.businessName}>{item.business_name}</Text>
      <Text style={styles.businessAddress}>{item.business_address}</Text>
      <Text style={styles.businessServices}>{item.services_offered}</Text>
      <TouchableOpacity style={styles.reserveButton}  onPress={() => navigation.navigate('Reservation')}>
        <Text style={styles.reserveButtonText}>Reservar cita</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Inicio</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.profileText}>Perfil</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.categories}>
        <TouchableOpacity style={styles.categoryButton}>
          <Text>Manicuristas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Text>Maquillaje</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Text>Estilista</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={businesses}
        renderItem={renderBusinessItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileText: {
    fontSize: 16,
    color: 'blue',
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  categoryButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  businessItem: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  businessImage: {
    width: '100%',
    height: 200,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  businessAddress: {
    fontSize: 14,
    color: 'gray',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  businessServices: {
    fontSize: 14,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  reserveButton: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  reserveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;