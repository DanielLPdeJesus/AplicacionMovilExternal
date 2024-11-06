import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CustomAlert = ({ isVisible, type, title, message, buttons, onClose }) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { colors: ['#4CAF50', '#45a049'], icon: 'check-circle-outline' };
      case 'error':
        return { colors: ['#e99f9f', '#f1708a'], icon: 'alert-circle-outline' };
      case 'info':
        return { colors: ['#2196F3', '#1E88E5'], icon: 'information-outline' };
      default:
        return { colors: ['#FFA000', '#FF8F00'], icon: 'bell-outline' };
    }
  };

  const alertStyle = getAlertStyle();

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} backdropOpacity={0.5}>
      <Animated.View style={[styles.alertContainer, { transform: [{ scale: scaleValue }] }]}>
        <LinearGradient
          colors={alertStyle.colors}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={alertStyle.icon} size={50} color="white" />
          </View>
        </LinearGradient>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, { backgroundColor: button.color || alertStyle.colors[0] }]}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}
              >
                <Text style={styles.buttonText}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradientBackground: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomAlert;