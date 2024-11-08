import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext'; 
import CustomAlert from '../../components/common/CustomAlert';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Sept.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

// Componente TimeSlots
const getReservationsForDate = async (businessId, selectedDate) => {
  try {
    const response = await fetch(
      `https://www.jaydey.com/ServicesMovil/api/business-reservations/${businessId}/${selectedDate}`
    );
    const data = await response.json();
    if (data.success) {
      // Solo filtrar las reservaciones aceptadas o concluidas
      return data.reservations.filter(res => 
        res.estado === 'aceptada' || res.estado === 'concluido'
      );
    }
    return [];
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
};

const TimeSlots = ({ businessId, businessHours, selectedDate, onSelectTime }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const loadTimeSlots = async () => {
      if (selectedDate && businessHours) {
        const reservations = await getReservationsForDate(businessId, selectedDate);
        const slots = generateTimeSlots(businessHours, reservations);
        setTimeSlots(slots);
        setSelectedTime('');
      }
    };

    loadTimeSlots();
  }, [selectedDate, businessHours, businessId]);

  const handleTimeSelection = (time) => {
    if (time.available) {
      setSelectedTime(time.value);
      onSelectTime(time.value);
    }
  };

  const generateTimeSlots = (businessHours, existingReservations = []) => {
    if (!businessHours) return [];
  
    const slots = [];
    const reservedTimes = new Set(
      existingReservations.map(reservation => reservation.hora_seleccionada)
    );
  
    const addTimeSlots = (timeRange) => {
      const [start, end] = timeRange.split(' - ');
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);
  
      let currentTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
  
      while (currentTimeInMinutes <= endTimeInMinutes - 60) {
        let currentHour = Math.floor(currentTimeInMinutes / 60);
        let currentMinute = currentTimeInMinutes % 60;
        
        let formattedHour = currentHour.toString().padStart(2, '0');
        let formattedMinute = currentMinute.toString().padStart(2, '0');
        let timeString = `${formattedHour}:${formattedMinute}`;
        
        let period = currentHour >= 12 ? 'PM' : 'AM';
        let displayHour = currentHour > 12 ? currentHour - 12 : currentHour;
        displayHour = displayHour === 0 ? 12 : displayHour;
        
        const isTimeAvailable = !reservedTimes.has(timeString);
        
        if (currentTimeInMinutes + 60 <= endTimeInMinutes) {
          slots.push({
            value: timeString,
            display: `${displayHour}:${formattedMinute} ${period}`,
            available: isTimeAvailable
          });
        }
  
        currentTimeInMinutes += 60;
      }
    };
  
    if (businessHours.turno_1) addTimeSlots(businessHours.turno_1);
    if (businessHours.turno_2) addTimeSlots(businessHours.turno_2);
  
    return slots.sort((a, b) => {
      const [aHour, aMinute] = a.value.split(':').map(Number);
      const [bHour, bMinute] = b.value.split(':').map(Number);
      return (aHour * 60 + aMinute) - (bHour * 60 + bMinute);
    });
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.timeScrollView}
    >
      {timeSlots.map((slot, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.timeCard,
            !slot.available && styles.unavailableTimeCard,
            selectedTime === slot.value && styles.selectedTimeCard
          ]}
          onPress={() => handleTimeSelection(slot)}
          disabled={!slot.available}
        >
          <Text style={[
            styles.timeText,
            !slot.available && styles.unavailableTimeText,
            selectedTime === slot.value && styles.selectedTimeText
          ]}>
            {slot.display}
          </Text>
          {!slot.available && (
            <Text style={styles.reservedText}>Reservado</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Componente principal ReservationScreen
const ReservationScreen = ({ route, navigation }) => {
  const { isLoggedIn, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [image, setImage] = useState(null);
  const [petition, setPetition] = useState('');
  const [comments, setComments] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [businessHours, setBusinessHours] = useState(null);
  const { businessId } = route.params;
  const [alertConfig, setAlertConfig] = useState({ 
    isVisible: false, 
    type: '', 
    title: '', 
    message: '', 
    buttons: [] 
  });

  const services = [
    { id: 1, name: 'Corte de Cabello', icon: 'cut', description: 'Corte y estilo' },
    { id: 2, name: 'Tinte', icon: 'color-palette', description: 'Coloración completa' },
    { id: 3, name: 'Mechas', icon: 'contrast', description: 'Mechas y rayitos' },
    { id: 4, name: 'Peinado', icon: 'brush', description: 'Peinados para eventos' },
    { id: 5, name: 'Alisado', icon: 'resize', description: 'Alisado permanente' },
    { id: 6, name: 'Tratamiento', icon: 'water', description: 'Tratamientos capilares' },
    { id: 7, name: 'Lavado', icon: 'water-outline', description: 'Lavado y secado' },
    { id: 8, name: 'Barba', icon: 'man', description: 'Corte y arreglo de barba' }
  ];

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Cleanup si es necesario
      };
    }, [])
  );

  useEffect(() => {
    checkLoginStatus();
    fetchBusinessHours();
    requestImagePermissions();
  }, []);

  const requestImagePermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          'error',
          'Permisos requeridos',
          'Necesitamos acceso a tu galería para agregar imágenes de referencia.',
          [{ text: 'OK', onPress: hideAlert }]
        );
      }
    }
  };

  const checkLoginStatus = () => {
    if (!isLoggedIn || !user) {
      showAlert(
        'error',
        'Acceso denegado',
        'Debes iniciar sesión para hacer una reservación.',
        [
          { text: 'Iniciar sesión', onPress: () => navigation.replace('Login') },
          { text: 'Cancelar', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const showAlert = (type, title, message, buttons) => {
    setAlertConfig({ isVisible: true, type, title, message, buttons });
    console.log('Mostrando alerta:', { type, title, message });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, isVisible: false });
  };

  const fetchBusinessHours = async () => {
    try {
      const response = await fetch(
        `https://www.jaydey.com/ServicesMovil/api/business/${businessId}`
      );
      const data = await response.json();
      if (data.success && data.business.opening_hours) {
        setBusinessHours(data.business.opening_hours);
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
      showAlert(
        'error',
        'Error',
        'No se pudieron cargar los horarios del negocio.',
        [{ text: 'OK', onPress: hideAlert }]
      );
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert(
        'error',
        'Error',
        'No se pudo cargar la imagen. Intenta de nuevo.',
        [{ text: 'OK', onPress: hideAlert }]
      );
    }
  };

  const validateReservation = () => {
    if (!selectedDate) {
      showAlert('error', 'Campos requeridos', 'Por favor selecciona una fecha.', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return false;
    }
    if (!selectedTime) {
      showAlert('error', 'Campos requeridos', 'Por favor selecciona una hora.', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return false;
    }
    if (!selectedService) {
      showAlert('error', 'Campos requeridos', 'Por favor selecciona un servicio.', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return false;
    }
    if (!petition.trim()) {
      showAlert('error', 'Campos requeridos', 'Por favor proporciona los detalles del servicio que deseas.', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return false;
    }
    if (!termsAccepted) {
      showAlert('error', 'Términos y condiciones', 'Debes aceptar los términos y condiciones para continuar.', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return false;
    }
    return true;
  };

  const handleReservation = async () => {
    if (!isLoggedIn || !user) {
      checkLoginStatus();
      return;
    }

    if (!validateReservation()) {
      return;
    }

    setIsLoading(true);

    const reservationData = {
      businessId,
      userId: user.uid,
      date: selectedDate,
      selectedTime,
      serviceType: selectedService,
      requestDetails: petition.trim(),
      comments: comments.trim(),
      termsAccepted,
      image: image ? `data:image/jpeg;base64,${image}` : null,
    };

    try {
      const response = await fetch('https://www.jaydey.com/ServicesMovil/api/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      const data = await response.json();

      if (response.status === 409) {
        showAlert(
          'error',
          'Reservación duplicada',
          'Ya tienes una reservación para esta fecha y hora en este negocio.',
          [{ text: 'OK', onPress: hideAlert }]
        );
        return;
      }

      if (data.success) {
        showAlert(
          'success',
          '¡Reservación exitosa!',
          'Tu cita ha sido programada correctamente.',
          [
            {
              text: 'Ver mis reservaciones',
              onPress: () => {
                hideAlert();
                navigation.navigate('HomeTabs', { screen: 'Reservaciones' });
              }
            }
          ]
        );
      } else {
        throw new Error(data.message || 'Error al procesar la reservación');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      showAlert(
        'error',
        'Error',
        'No se pudo procesar tu reservación. Por favor, intenta de nuevo.',
        [{ text: 'OK', onPress: hideAlert }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <View style={styles.container}>
        <CustomAlert
          isVisible={alertConfig.isVisible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.toleranceCard}>
        <Ionicons name="time" size={24} color="#FF69B4" style={styles.toleranceIcon} />
        <View style={styles.toleranceTextContainer}>
          <Text style={styles.toleranceTitle}>10 Minutos de tolerancia</Text>
          <Text style={styles.toleranceDescription} numberOfLines={2}>
            Por favor llega a tiempo. Después del tiempo de tolerancia, tu cita podría ser reasignada.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedService === service.name && styles.selectedServiceCard
              ]}
              onPress={() => setSelectedService(service.name)}
            >
              <Ionicons 
                name={service.icon} 
                size={24} 
                color={selectedService === service.name ? 'white' : '#FF69B4'} 
              />
              <Text style={[
                styles.serviceText,
                selectedService === service.name && styles.selectedServiceText
              ]}>
                {service.name}
              </Text>
              <Text style={[
                styles.serviceDescription,
                selectedService === service.name && styles.selectedServiceText
              ]}>
                {service.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fecha de la Cita</Text>
        <Calendar
          minDate={new Date().toISOString().split('T')[0]}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { 
              selected: true, 
              selectedColor: '#FF69B4',
              selectedTextColor: 'white'
            }
          }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#666666',
            selectedDayBackgroundColor: '#FF69B4',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#FF69B4',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            monthTextColor: '#FF69B4',
            indicatorColor: '#FF69B4',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horarios Disponibles</Text>
        <TimeSlots 
          businessId={businessId}
          businessHours={businessHours}
          selectedDate={selectedDate}
          onSelectTime={setSelectedTime}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Servicio</Text>
        <TextInput
          style={styles.petitionInput}
          placeholder="Proporciona un ejemplo de lo que deseas que te hagan al agregar tu solicitud de servicio."
          multiline
          value={petition}
          onChangeText={setPetition}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.commentsInput}
          placeholder="Agrega comentarios adicionales"
          multiline
          value={comments}
          onChangeText={setComments}
          placeholderTextColor="#999"
        />
        
        <TouchableOpacity 
          style={styles.imageUploadButton} 
          onPress={pickImage}
        >
          <Ionicons name="image" size={24} color="#FF69B4" />
          <Text style={styles.imageUploadText}>
            {image ? 'Cambiar imagen de referencia' : 'Agregar imagen de referencia'}
          </Text>
        </TouchableOpacity>
        
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: `data:image/jpeg;base64,${image}` }} 
              style={styles.imagePreview} 
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setImage(null)}
            >
              <Ionicons name="close-circle" size={24} color="#FF69B4" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.termsSection}>
        <View style={styles.policiesContainer}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkedBox]}>
              {termsAccepted && <Ionicons name="checkmark" size={18} color="white" />}
            </View>
            <Text style={styles.termsText}>Aceptar</Text>
          </TouchableOpacity>

          <View style={styles.policiesLinks}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('TermsAndPrivacy', { viewType: 'terms' })}
              style={styles.policyLinkContainer}
            >
              <Text style={styles.policyLink}>Términos y condiciones</Text>
            </TouchableOpacity>
            <Text style={styles.policyDivider}>|</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('TermsAndPrivacy', { viewType: 'privacy' })}
              style={styles.policyLinkContainer}
            >
              <Text style={styles.policyLink}>Políticas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.reserveButton,
            (!termsAccepted || isLoading) && styles.disabledButton
          ]}
          onPress={handleReservation}
          disabled={!termsAccepted || isLoading}
        >
          <Text style={styles.reserveButtonText}>
            {isLoading ? 'Reservando...' : 'Confirmar Reservación'}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        isVisible={alertConfig.isVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  toleranceCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'flex-start',
  },
  toleranceIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  toleranceTextContainer: {
    flex: 1,
  },
  toleranceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  toleranceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 80) / 2,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF69B4',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedServiceCard: {
    backgroundColor: '#FF69B4',
  },
  serviceText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedServiceText: {
    color: 'white',
  },
  timeScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  timeCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF69B4',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unavailableTimeCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  selectedTimeCard: {
    backgroundColor: '#FF69B4',
  },
  timeText: {
    fontSize: 16,
    color: '#FF69B4',
    fontWeight: '500',
  },
  unavailableTimeText: {
    color: '#999',
  },
  selectedTimeText: {
    color: 'white',
  },
  reservedText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  petitionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F9FA',
    marginBottom: 16,
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F9FA',
    marginBottom: 16,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF69B4',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF69B4',
  },
  imagePreviewContainer: {
    marginTop: 16,
    position: 'relative',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePreview: {
    width: width - 64,
    height: (width - 64) * 0.75,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  termsSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  policiesContainer: {
    alignItems: 'center',
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF69B4',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkedBox: {
    backgroundColor: '#FF69B4',
  },
  termsText: {
    fontSize: 16,
    color: '#333',
  },
  policiesLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  policyLinkContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  policyLink: {
    fontSize: 14,
    color: '#FF69B4',
    textDecorationLine: 'underline',
    paddingHorizontal: 8,
  },
  policyDivider: {
    color: '#666',
    paddingHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  reserveButton: {
    flex: 2,
    backgroundColor: '#FF69B4',
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#FFB6C1',
    opacity: 0.7,
  },
  reserveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ReservationScreen;