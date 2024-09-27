import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReservationItem = ({ service, time, appointmentDate, status }) => (
  <View style={styles.itemContainer}>
    <View style={styles.serviceRow}>
      {service === 'Corte de Pelo' ? (
        <Ionicons name="cut-outline" size={24} style={styles.icon} />
      ) : service === 'Arreglo de Uñas Multicolores' ? (
        <Ionicons name="color-palette-outline" size={24} style={styles.icon} />
      ) : (
        <Ionicons name="hand-left-outline" size={24} style={styles.icon} />
      )}
      <View>
        <Text style={styles.serviceName}>{service}</Text>
        <Text style={styles.serviceDetails}>Hora: {time}</Text>
        <Text style={styles.serviceDetails}>Fecha: {appointmentDate}</Text>
      </View>
    </View>
    <View style={styles.statusRow}>
      <View style={[
        styles.statusBadge,
        status === 'Espera' ? styles.statusWaiting :
        status === 'Aprobado' ? styles.statusApproved :
        styles.statusRejected
      ]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
    <View style={styles.buttonRow}>
      <TouchableOpacity>
        <Text style={styles.cancelButton}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.detailsButton}>Detalles</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ReservationsInterface = () => {
  const reservations = [
    {
      date: '18 abril, 2024',
      service: 'Arreglo de Uñas Multicolores',
      time: '9:00 a.m',
      appointmentDate: '14 de mayo 2024',
      status: 'Espera',
    },
    {
      date: '12 abril, 2024',
      service: 'Corte de Pelo',
      time: '9:00 a.m',
      appointmentDate: '18 de abril 2024',
      status: 'Aprobado',
    },
    {
      date: '13 abril, 2024',
      service: 'Corte de Uñas',
      time: '9:00 a.m',
      appointmentDate: '19 de abril 2024',
      status: 'Rechazado',
    },
  ];

  const renderItem = ({ item }) => (
    <>
      <Text style={styles.dateHeader}>{item.date}</Text>
      <ReservationItem {...item} />
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservaciones</Text>
      <FlatList
        data={reservations}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity style={styles.viewMoreButton}>
        <Text style={styles.viewMoreText}>Ver mas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDetails: {
    fontSize: 14,
    color: '#666',
  },
  statusRow: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusWaiting: {
    backgroundColor: '#e0e0e0',
  },
  statusApproved: {
    backgroundColor: '#c8e6c9',
  },
  statusRejected: {
    backgroundColor: '#ffcdd2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    color: 'red',
    marginRight: 16,
  },
  detailsButton: {
    color: 'blue',
  },
  viewMoreButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ReservationsInterface;