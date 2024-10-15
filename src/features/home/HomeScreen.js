import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, RefreshControl, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

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
    <Image source={{ uri: business.perfiles_imagenes }} style={styles.newIcon} />
    <View style={styles.newBusinessInfo}>
      <Text style={styles.newBusinessName}>{business.nombre_negocio}</Text>
      <Text style={styles.newBusinessAddress}>{business.direccion_negocio}</Text>
    </View>
  </View>
);

const BusinessCard = ({ business, navigation }) => (
  <View style={styles.businessCard}>
    <Image 
      source={{ uri: business.negocios_imagenes[0] }} 
      style={styles.businessImage} 
    />
    <Text style={styles.businessName}>{business.nombre_negocio}</Text>
    <Text style={styles.businessAddress}>{business.direccion_negocio}</Text>
    <View style={styles.userInfo}>
      <BusinessRating business={business} />
    </View>
    <View style={styles.businessActions}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('ViewBussinesScreen', { businessId: business.id })}
      >
        <Text style={styles.actionButtonText}>Ver mas</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, styles.reserveButton]}
        onPress={() => navigation.navigate('Reservation', { businessId: business.id })}
      >
        <Text style={[styles.actionButtonText, styles.reserveButtonText]}>Reservar</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.userInfo}>
      <Image source={{ uri: business.perfiles_imagenes }} style={styles.newIconInfo} />
      <Text style={styles.userName}>{business.nombre_propietario}</Text>
    </View>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const [businesses, setBusinesses] = useState([]);
  const [newBusinesses, setNewBusinesses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = () => {
    setRefreshing(true);
    fetch('https://www.jaydey.com/ServicesMovil/api/businesses')
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

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Image 
        source={require('../../../assets/notfout.jpg')} 
        style={styles.emptyStateImage} 
      />
      <Text style={styles.emptyStateText}>No se encontraron negocios</Text>
    </View>
  );

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.nombre_negocio.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = false;
    
    if (selectedFilter === 'Todos') {
      matchesFilter = true;
    } else if (selectedFilter === 'Salones') {
      matchesFilter = !['Estetica', 'Peluqueria'].includes(business.servicios_ofrecidos);
    } else {
      matchesFilter = business.servicios_ofrecidos === selectedFilter;
    }
    
    return matchesSearch && matchesFilter;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar negocios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterOpen(!isFilterOpen)}>
          <FontAwesome name="sliders" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      {isFilterOpen && (
        <View style={styles.filterOptionsContainer}>
          <Text style={styles.filterTitle}>Filtrar por tipo de servicio:</Text>
          <View style={styles.filterOptions}>
            {['Todos', 'Estetica', 'Peluqueria', 'Salones'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  selectedFilter === filter && styles.selectedFilter
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.selectedFilterText
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            {renderHeader()}
            {newBusinesses.map((business, index) => (
              <NewBusinessBanner key={index} business={business} />
            ))}
          </>
        }
        data={filteredBusinesses}
        renderItem={({ item }) => <BusinessCard business={item} navigation={navigation} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9Bd35A", "#689F38"]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={filteredBusinesses.length === 0 ? styles.emptyListContent : null}
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
  header: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    padding: 10,
  },
  filterOptionsContainer: {
    marginTop: 10,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  selectedFilterText: {
    color: '#fff',
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
    marginBottom: 10,
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
    height: 130,
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
  businessActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  newIconInfo: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 100
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  emptyListContent: {
    flexGrow: 1,
  },
});

export default HomeScreen;