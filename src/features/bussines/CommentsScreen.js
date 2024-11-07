import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../../components/common/CustomAlert';

const API_URL = 'https://www.jaydey.com/ServicesMovil';

const CommentItem = ({ comment }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      
      return localDate.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  };

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Image 
          source={{ uri: comment.user_image }} 
          style={styles.userImage} 
        />
        <View style={styles.commentInfo}>
          <Text style={styles.userName}>{comment.user_name}</Text>
          <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
        </View>
      </View>
      <Text style={styles.commentText}>{comment.comment_text}</Text>
    </View>
  );
};

const CommentsScreen = ({ route, navigation }) => {
  const { businessId, businessName } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const [alertConfig, setAlertConfig] = useState({
    isVisible: false,
    type: '',
    title: '',
    message: '',
    buttons: []
  });

  const showAlert = (type, title, message, buttons = [{ text: 'OK', onPress: () => {} }]) => {
    setAlertConfig({ isVisible: true, type, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, isVisible: false });
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/comments/${businessId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showAlert('error', 'Error', 'No se pudieron cargar los comentarios.');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [businessId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchComments();
    setIsRefreshing(false);
  };

  const handleSubmitComment = async () => {
    if (!user) {
      showAlert('error', 'Iniciar sesión requerido', 'Para comentar, por favor inicia sesión o regístrate.', [
        {
          text: 'Cancelar',
          onPress: hideAlert,
          style: 'cancel',
        },
        {
          text: 'Iniciar Sesión',
          onPress: () => {
            hideAlert();
            navigation.navigate('Login');
          },
        },
      ]);
      return;
    }

    if (!newComment.trim()) {
      showAlert('error', 'Error', 'Por favor escribe un comentario.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          user_id: user.uid,
          comment_text: newComment.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        
        if (data.comment) {
          const formattedComment = {
            ...data.comment,
            created_at: new Date().toISOString()
          };
          setComments(prevComments => [formattedComment, ...prevComments]);
        } else {
          await fetchComments();
        }
        
        showAlert('success', 'Éxito', 'Comentario publicado correctamente');
      } else {
        throw new Error(data.message || 'No se pudo publicar el comentario.');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      if (error.message.includes('Permission denied')) {
        setNewComment('');
        await fetchComments();
        showAlert('success', 'Éxito', 'Comentario publicado correctamente');
      } else {
        showAlert('error', 'Error', 'No se pudo publicar el comentario. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputContainer = () => {
    if (!user) {
      return (
        <TouchableOpacity 
          style={styles.loginPromptContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginPromptText}>
            Inicia sesión o regístrate para comentar
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un comentario..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={isLoading || !newComment.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={({ item }) => <CommentItem comment={item} />}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay comentarios aún</Text>
          </View>
        )}
      />

      {renderInputContainer()}

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loginPromptContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  loginPromptText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CommentsScreen;