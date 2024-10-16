import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext'; 
import CustomAlert from '../../components/common/CustomAlert';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Sept.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

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
  const { businessId } = route.params;
  const [alertConfig, setAlertConfig] = useState({ isVisible: false, type: '', title: '', message: '', buttons: [] });

  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM'];
  const services = ['Masaje', 'Facial', 'Manicura'];

  useEffect(() => {
    checkLoginStatus();
    
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('error', 'Permisos requeridos', 'Se necesitan permisos para acceder a la galería de imágenes.', [
          { text: 'OK', onPress: hideAlert }
        ]);
      }
    })();

    console.log('Estado de autenticación:', { isLoggedIn, user });
  }, [isLoggedIn, user, navigation]);

  const checkLoginStatus = () => {
    if (!isLoggedIn || !user) {
      showAlert('error', 'Acceso denegado', 'Debes iniciar sesión para hacer una reservación.', [
        { text: 'Iniciar sesión', onPress: () => navigation.replace('Login') },
        { text: 'Cancelar', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const showAlert = (type, title, message, buttons) => {
    setAlertConfig({ isVisible: true, type, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, isVisible: false });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].base64);
    }
  };

  const handleReservation = async () => {
    if (!isLoggedIn || !user) {
      checkLoginStatus();
      return;
    }

    if (!termsAccepted) {
      showAlert('error', 'Error', 'Debes aceptar los términos y condiciones', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return;
    }

    if (!selectedDate || !selectedTime || !selectedService) {
      showAlert('error', 'Error', 'Por favor, completa todos los campos requeridos.', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return;
    }

    setIsLoading(true);

    const reservationData = {
      businessId, 
      selectedTime,
      date: selectedDate,
      serviceType: selectedService,
      requestDetails: petition,
      comments,
      termsAccepted,
      image: image ? `data:image/jpeg;base64,${image}` : null,
      userId: user.uid, 
    };

    console.log('Datos de reservación a enviar:', reservationData);

    try {
      const response = await fetch('https://www.jaydey.com/ServicesMovil/api/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (data.success) {
        showAlert('success', 'Éxito', data.message, [
          { text: 'OK', onPress: () => {
            hideAlert();
            navigation.navigate('HomeTabs');
          }}
        ]);
      } else {
        showAlert('error', 'Error', data.message || 'Hubo un problema al realizar la reservación', [
          { text: 'OK', onPress: hideAlert }
        ]);
      }
    } catch (error) {
      console.error('Error al enviar la reservación:', error);
      showAlert('error', 'Error', 'Hubo un problema al conectar con el servidor. Por favor, inténtalo de nuevo.', [
        { text: 'OK', onPress: hideAlert }
      ]);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.termsButton}>Términos y Condiciones</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toleranceNotice}>
        <Text style={styles.toleranceTitle}>10 Minutos de tolerancia</Text>
        <Text style={styles.toleranceDescription}>Si no puedes cumplir, alguien más tomará tu lugar...</Text>
      </View>

      <Text style={styles.sectionTitle}>Selecciona Fecha y Hora</Text>

      <Text style={styles.label}>Hora:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeContainer}>
        {times.map((time) => (
          <TouchableOpacity
            key={time}
            style={[styles.timeButton, selectedTime === time && styles.selectedTime]}
            onPress={() => setSelectedTime(time)}
          >
            <Text style={[styles.timeText, selectedTime === time && styles.selectedTimeText]}>{time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Fecha:</Text>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{[selectedDate]: {selected: true, selectedColor: 'blue'}}}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: 'orange',
          monthTextColor: 'blue',
          indicatorColor: 'blue',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16
        }}
      />

      <Text style={styles.sectionTitle}>Tipo de Servicio</Text>
      <View style={styles.serviceContainer}>
        {services.map((service) => (
          <TouchableOpacity
            key={service}
            style={[styles.serviceButton, selectedService === service && styles.selectedService]}
            onPress={() => setSelectedService(service)}
          >
            <Text style={[styles.serviceText, selectedService === service && styles.selectedServiceText]}>{service}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Petición</Text>
      <TextInput
        style={styles.petitionInput}
        placeholder="Proporciona un ejemplo de lo que deseas que te hagan al agregar tu solicitud de servicio."
        multiline
        value={petition}
        onChangeText={setPetition}
      />

      <Text style={styles.sectionTitle}>Subir Imágenes</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Seleccionar Imagen</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={styles.uploadedImage} />}

      <TextInput
        style={styles.commentsInput}
        placeholder="Agrega comentarios adicionales"
        value={comments}
        onChangeText={setComments}
      />

      <View style={styles.reminderContainer}>
        <Ionicons name="alarm-outline" size={24} color="red" />
        <Text style={styles.reminderText}>Diez minutos antes podrían evitar que pierdas la reservación</Text>
      </View>

      <Text style={styles.policyNotice}>Aviso: Revisa nuestra política de puntualidad</Text>

      <View style={styles.termsContainer}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          {termsAccepted && <Ionicons name="checkmark" size={18} color="blue" />}
        </TouchableOpacity>
        <Text style={styles.termsText}>Aceptar Términos y condiciones</Text>
        <TouchableOpacity>
          <Text style={styles.readPoliciesButton}>Leer Políticas</Text>
        </TouchableOpacity>
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
          style={[styles.reserveButton, (isLoading || !termsAccepted) && styles.disabledButton]}
          onPress={handleReservation}
          disabled={isLoading || !termsAccepted}
        >
          <Text style={styles.reserveButtonText}>
            {isLoading ? 'Reservando...' : 'Reservar'}
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
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  termsButton: {
    color: 'blue',
    fontSize: 12,
  },
  toleranceNotice: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  toleranceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  toleranceDescription: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeButton: {
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  selectedTime: {
    backgroundColor: 'blue',
  },
  timeText: {
    color: '#000',
  },
  selectedTimeText: {
    color: '#fff',
  },
  serviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  serviceButton: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    alignItems: 'center',
  },
  selectedService: {
    backgroundColor: 'blue',
  },
  serviceText: {
    color: '#000',
  },
  selectedServiceText: {
    color: '#fff',
  },
  petitionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  uploadedImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderText: {
    marginLeft: 8,
    color: 'red',
  },
  policyNotice: {
    textAlign: 'center',
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    flex: 1,
  },
  readPoliciesButton: {
    color: 'blue',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
  },
  reserveButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
    borderRadius: 4,
    marginLeft: 8,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#fff',
  },
});

export default ReservationScreen;