import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  TextInput,
  ActivityIndicator 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/common/CustomAlert';

const API_URL = 'https://www.jaydey.com/ServicesMovil';

const BusinessRating = ({ business }) => {
  const calculateRating = (likes, dislikes) => {
    const total = likes + dislikes;
    if (total === 0) return 0;
    return (likes / total) * 5;
  };

  const renderStars = () => {
    const rating = calculateRating(
      business.numero_gustas || 0,
      business.no_me_gustas || 0
    );
    const starCount = Math.round(rating);
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
      <Text style={styles.ratingText}>
        {calculateRating(
          business.numero_gustas || 0,
          business.no_me_gustas || 0
        ).toFixed(1)}
      </Text>
    </View>
  );
};

const NewBusinessBanner = ({ business }) => (
  <View style={styles.newBusinessBanner}>
    <Image 
      source={{ uri: business.perfiles_imagenes }} 
      style={styles.newIcon} 
    />
    <View style={styles.newBusinessInfo}>
      <Text style={styles.newBusinessName}>{business.nombre_negocio}</Text>
      <Text style={styles.newBusinessAddress}>{business.direccion_negocio}</Text>
    </View>
  </View>
);

const BusinessCard = ({ business, navigation }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(business.numero_gustas || 0);
  const [dislikeCount, setDislikeCount] = useState(business.no_me_gustas || 0);
  const [isInteracting, setIsInteracting] = useState(false);
  const { user } = useAuth();
  const [alertConfig, setAlertConfig] = useState({
    isVisible: false,
    type: '',
    title: '',
    message: '',
    buttons: []
  });

  const showAlert = (type, title, message, buttons) => {
    setAlertConfig({
      isVisible: true,
      type,
      title,
      message,
      buttons
    });
  };

  useEffect(() => {
    if (user) {
      checkUserInteraction();
    }
  }, [user?.uid, business.id]);

  const checkUserInteraction = async () => {
    if (!user || !business.id) return;
    
    try {
      const response = await fetch(
        `${API_URL}/api/business-interactions/${business.id}/${user.uid}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.ok) {
        setIsLiked(false);
        setIsDisliked(false);
        return;
      }
  
      const data = await response.json();
      
      if (data.success && data.interaction) {
        setIsLiked(data.interaction.type === 'like');
        setIsDisliked(data.interaction.type === 'dislike');
      } else {
        setIsLiked(false);
        setIsDisliked(false);
      }
    } catch (error) {
      setIsLiked(false);
      setIsDisliked(false);
    }
  };
  
  const handleInteraction = async (type) => {
    if (!user) {
      showAlert('error', 'Inicio de sesión requerido, Para reaccionar a los negocios, por favor inicie sesión o regístrese.', [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setAlertConfig(prev => ({ ...prev, isVisible: false }))
        },
        {
          text: 'Iniciar Sesión',
          onPress: () => {
            setAlertConfig(prev => ({ ...prev, isVisible: false }));
            navigation.navigate('Login');
          }
        }
      ]);
      return;
    }
  
    if (isInteracting) return;
    setIsInteracting(true);
  
    try {
      if (type === 'like') {
        if (isLiked) {
          setLikeCount(prev => Math.max(0, prev - 1));
          setIsLiked(false);
        } else {
          setLikeCount(prev => prev + 1);
          if (isDisliked) {
            setDislikeCount(prev => Math.max(0, prev - 1));
            setIsDisliked(false);
          }
          setIsLiked(true);
        }
      } else {
        if (isDisliked) {
          setDislikeCount(prev => Math.max(0, prev - 1));
          setIsDisliked(false);
        } else {
          setDislikeCount(prev => prev + 1);
          if (isLiked) {
            setLikeCount(prev => Math.max(0, prev - 1));
            setIsLiked(false);
          }
          setIsDisliked(true);
        }
      }
  
      const response = await fetch(`${API_URL}/api/business-interactions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: business.id,
          user_id: user.uid,
          type: type === 'like' ? 
            (isLiked ? 'remove' : 'like') : 
            (isDisliked ? 'remove' : 'dislike')
        })
      });
  
      const data = await response.json();
      
      if (response.ok && data.success) {
        setLikeCount(data.data.numero_gustas);
        setDislikeCount(data.data.no_me_gustas);
      } else {
        await checkUserInteraction();
      }
    } catch (error) {
      await checkUserInteraction();
    } finally {
      setIsInteracting(false);
    }
  };

  const handleLike = () => handleInteraction('like');
  const handleDislike = () => handleInteraction('dislike');

  const handleComment = () => {
    navigation.navigate('CommentsScreen', { 
      businessId: business.id,
      businessName: business.nombre_negocio
    });
  };

  const handleReservation = () => {
    if (!business.pagado) {
      showAlert(
        'info',
        'Negocio en Proceso',
        'El negocio no está disponible para reservaciones en este momento. Próximamente podrá atender sus reservaciones.',
        [{
          text: 'Entendido',
          onPress: () => setAlertConfig(prev => ({ ...prev, isVisible: false }))
        }]
      );
    } else {
      navigation.navigate('Reservation', { businessId: business.id });
    }
  };

  const handleCardPress = () => {
    navigation.navigate('ViewBussinesScreen', { businessId: business.id });
  };

  return (
    <TouchableOpacity 
      style={styles.businessCard}
      onPress={handleCardPress}
      activeOpacity={0.97}
    >
      <Image 
        source={{ uri: business.negocios_imagenes[0] }} 
        style={styles.businessImage} 
      />
      <Text style={styles.businessName}>{business.nombre_negocio}</Text>
      <Text style={styles.businessAddress}>{business.direccion_negocio}</Text>
      
      <View style={styles.userInfo}>
        <BusinessRating business={business} />
      </View>

      <View 
        style={styles.businessActions}
        onStartShouldSetResponder={() => true}
        onTouchEnd={e => e.stopPropagation()}
      >
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('ViewBussinesScreen', { businessId: business.id })}
        >
          <Text style={styles.actionButtonText}>Ver más</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.reserveButton,
            !business.pagado && styles.disabledButton
          ]}
          onPress={handleReservation}
        >
          <Text style={[styles.actionButtonText, styles.reserveButtonText]}>
            {business.pagado ? 'Reservar' : 'No disponible'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.userInfo}>
        <Image source={{ uri: business.perfiles_imagenes }} style={styles.newIconInfo} />
        <Text style={styles.userName}>{business.nombre_propietario}</Text>
      </View>

      <View 
        style={styles.socialBar}
        onStartShouldSetResponder={() => true}
        onTouchEnd={e => e.stopPropagation()}
      >
        <View style={styles.socialButtonContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, isLiked && styles.activeSocialButton]} 
            onPress={handleLike}
            disabled={isInteracting}
          >
            <FontAwesome 
              name={isLiked ? "heart" : "heart-o"} 
              size={24} 
              color={isLiked ? "#FF0000" : "#666"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.socialButtonContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, isDisliked && styles.activeSocialButton]} 
            onPress={handleDislike}
            disabled={isInteracting}
          >
            <FontAwesome 
              name={isDisliked ? "thumbs-down" : "thumbs-o-down"} 
              size={24} 
              color={isDisliked ? "#666" : "#666"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.socialButtonContainer}>
          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={handleComment}
          >
            <FontAwesome name="comment-o" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.socialCount}>{business.numero_resenas || 0}</Text>
        </View>
      </View>

      <CustomAlert
        isVisible={alertConfig.isVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig(prev => ({ ...prev, isVisible: false }))}
      />
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const [businesses, setBusinesses] = useState([]);
  const [newBusinesses, setNewBusinesses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBusinesses = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/businesses`);
      const data = await response.json();
      
      if (data.success) {
        const sortedBusinesses = data.businesses.sort((a, b) => 
          new Date(b.fecha_registro) - new Date(a.fecha_registro)
        );
        setNewBusinesses(sortedBusinesses.slice(0, 1));
        setBusinesses(sortedBusinesses);
      } else {
        throw new Error(data.message || 'Error al cargar los negocios');
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError('No se pudieron cargar los negocios. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBusinesses();
  };

  const handleRetry = () => {
    setError(null);
    fetchBusinesses();
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.nombre_negocio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'Todos' ? true : 
      selectedFilter === 'Salones' ? 
        !['Estética', 'Peluquería'].includes(business.servicios_ofrecidos) :
        business.servicios_ofrecidos === selectedFilter;
    
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
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FontAwesome name="sliders" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      {isFilterOpen && (
        <View style={styles.filterOptionsContainer}>
          <Text style={styles.filterTitle}>Filtrar por tipo de servicio:</Text>
          <View style={styles.filterOptions}>
            {['Todos', 'Estetica', 'Peluqueria', 'Salon'].map((filter) => (
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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        renderItem={({ item }) => (
          <BusinessCard business={item} navigation={navigation} />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9Bd35A", "#689F38"]}
          />
        }
        ListEmptyComponent={null}
        contentContainerStyle={filteredBusinesses.length === 0 ? styles.emptyListContent : null}
      />

      {isLoading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando negocios...</Text>
        </View>
      )}
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
    overflow: 'hidden',
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
    marginBottom: 5,
  },
  socialBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  socialButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 45,
  },
  socialButton: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSocialButton: {
    opacity: 0.8,
    transform: [{ scale: 1.1 }],
  },
  socialCount: {
    marginLeft: 3,
    fontSize: 12,
    color: '#666',
    minWidth: 20,
  },
  businessActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#fff',
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  reserveButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  reserveButtonText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  userInfo: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  newIconInfo: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 100,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyListContent: {
    flexGrow: 1,
  }
});

export default HomeScreen;