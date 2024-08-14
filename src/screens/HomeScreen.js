import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, RefreshControl} from 'react-native';
import { FontAwesome } from '@expo/vector-icons'

const BusinessRating = ({ business }) => {
  const renderStars = () => {
    const starCount = Math.min(Math.floor(business.numero_gustas / 10), 5);
    const stars = [];

    for (let i = 0; i < 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i < starCount ? 'star' : 'star-o'}
          size={20}
          color={i < starCount ? '#FFD700' : '#C0C0C0'}
        />
      );
    }

    return stars;
  };

  return (
    <View style={styles.ratingContainer}>
      {renderStars()}
    </View>
  );
};

const NewBusinessBanner = ({ business }) => (
  <View style={styles.newBusinessBanner}>
    <Image source={{ uri: business.profile_images[0] }} style={styles.newIcon} />
    <View style={styles.newBusinessInfo}>
      <Text style={styles.newBusinessName}>{business.business_name}</Text>
      <Text style={styles.newBusinessAddress}>{business.business_address}</Text>
    </View>
  </View>
);

const BusinessCard = ({ business, navigation }) => (
  <View style={styles.businessCard}>
    <Image 
      source={{ uri: business.business_images[0] }} 
      style={styles.businessImage} 
    />
    <Text style={styles.businessName}>{business.business_name}</Text>
    <Text style={styles.businessAddress}>{business.business_address}</Text>
    <View style={styles.userInfo}>
    <BusinessRating business={business} />
    </View>
    <View style={styles.businessActions}>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Ver mas</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, styles.reserveButton]}
        onPress={() => navigation.navigate('Reservation', { businessId: business.email })}
      >
        <Text style={[styles.actionButtonText, styles.reserveButtonText]}>Reservar</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.userInfo}>
    <Image source={{ uri: business.profile_images[0] }} style={styles.newIconInfo} />
      <Text style={styles.userName}>{business.owner_name}</Text>
    </View>
    <View style={styles.socialActions}>
      <TouchableOpacity>
        <Image source={require('../../assets/logo.png')} style={styles.socialIcon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image source={require('../../assets/logo.png')} style={styles.socialIcon} />
      </TouchableOpacity>
    </View>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const [businesses, setBusinesses] = useState([]);
  const [newBusinesses, setNewBusinesses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = () => {
    setRefreshing(true);
    fetch('https://jaydey.pythonanywhere.com/Services/api/businesses')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const sortedBusinesses = data.businesses.sort((a, b) => 
            new Date(b.fecha_registro) - new Date(a.fecha_registro)
          );
          setNewBusinesses(sortedBusinesses.slice(0,1));
          setBusinesses(sortedBusinesses);
        }
      })
      .catch(error => {
        console.error('Error fetching businesses:', error);
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  
  const onRefresh = () => {
    fetchBusinesses();
  };

  return (
    <View style={styles.container}>
      <View style={styles.categories}>
        <TouchableOpacity style={styles.categoryButton}>
          <Image source={require('../../assets/manicurista.png')} style={styles.icon} />
          <Text style={styles.textcat}>Manicuristas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Image source={require('../../assets/maquillista2.png')} style={styles.icon} />
          <Text style={styles.textcat}>Maquillista</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Image source={require('../../assets/Estilista.png')} style={styles.icon} />
          <Text style={styles.textcat}>Estilista</Text>
        </TouchableOpacity>
      </View>
     <FlatList
  ListHeaderComponent={
    <>
      {newBusinesses.map((business, index) => (
        <NewBusinessBanner key={index} business={business} />
      ))}
    </>
  }
  data={businesses}
  renderItem={({ item }) => <BusinessCard business={item} navigation={navigation} />}
  keyExtractor={(item) => item.email}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#9Bd35A", "#689F38"]}
    />
  }
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15
  },
  headerinfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainerinfo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarinfo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headerTextinfo: {
    marginLeft: 15,
    flex: 1,
  },
  nameinfo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  professioninfo: {
    fontSize: 14,
    color: '#888',
  },
  editButtoninfo: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
  },
  editButtonTextinfo: {
    fontSize: 12,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 2,
    marginBottom: 5,
  },
  categoryButton: {
    alignItems: 'center',
  },
  icon: {
    width: 15,
    height: 15,
    marginBottom: 5,
  },
  textcat: {
    fontSize: 16,
  },
  newBusinessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  newIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 100
  },
  newBusinessInfo: {
    flex: 1,
  },
  newBusinessName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  newBusinessAddress: {
    fontSize: 14,
    color: 'gray',
  },
  businessCard: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  businessAddress: {
    fontSize: 14,
    color: 'gray',
    paddingHorizontal: 10,
  },
  businessServices: {
    fontSize: 14,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  businessActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  actionButton: {
    padding: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000',
  },
  reserveButton: {
    backgroundColor: '#000',
  },
  reserveButtonText: {
    color: '#fff',
  },
  userInfo: {
    padding: 10,
  },
  newIconInfo: {
    width: 24,
    height: 24,
    marginLeft :10,
    borderRadius: 100
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
  },
  socialActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 10,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
});

export default HomeScreen;