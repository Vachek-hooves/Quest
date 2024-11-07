import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

const UserScreen = () => {
  const [user, setUser] = useState({
    name: '',
    image: null,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempUser, setTempUser] = useState({
    name: '',
    image: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsLoading(false);
    }
  };

  const saveImageToStorage = async imageUri => {
    try {
      const fileName = `profile_image_${Date.now()}.jpg`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.copyFile(imageUri, destPath);
      return destPath;
    } catch (error) {
      console.error('Error saving image:', error);
      return null;
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (!result.didCancel && result.assets?.[0]) {
      setTempUser(prev => ({
        ...prev,
        image: result.assets[0].uri,
      }));
    }
  };

  const handleSave = async () => {
    try {
      let savedImagePath = tempUser.image;
      if (tempUser.image && tempUser.image !== user.image) {
        savedImagePath = await saveImageToStorage(tempUser.image);
      }

      const updatedUser = {
        name: tempUser.name,
        image: savedImagePath,
      };

      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleEdit = () => {
    setTempUser(user);
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../../assets/animation/login.json')}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
        style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {user.image ? (
            <Image
              source={{uri: `file://${user.image}`}}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="person" size={60} color="#D4AF37" />
            </View>
          )}

          <Text style={styles.userName}>{user.name || 'Add Your Name'}</Text>

          <LinearGradient
            colors={['#D4AF37', '#C5A028']}
            style={styles.editButton}>
            <TouchableOpacity
              style={styles.editButtonInner}
              onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </LinearGradient>
          <LottieView
            source={require('../../assets/animation/login.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </ScrollView>
      </LinearGradient>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseIcon}
            onPress={() => setShowEditModal(false)}>
            <Icon name="close-circle" size={32} color="#D4AF37" />
          </TouchableOpacity>
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
            style={styles.modalGradient}>
            <ScrollView>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>

                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.imagePickerButton}>
                  {tempUser.image ? (
                    <Image
                      source={{uri: tempUser.image}}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.uploadButton}>
                      <Icon name="camera" size={40} color="#D4AF37" />
                      <Text style={styles.uploadButtonText}>Choose Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#888"
                  value={tempUser.name}
                  onChangeText={text =>
                    setTempUser(prev => ({...prev, name: text}))
                  }
                />

                <LinearGradient
                  colors={['#D4AF37', '#C5A028']}
                  style={styles.saveButton}>
                  <TouchableOpacity
                    style={styles.saveButtonInner}
                    onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </LinearGradient>
                <LottieView
                  source={require('../../assets/animation/form.json')}
                  autoPlay
                  loop
                  style={{height: 200, width: 100}}
                />
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
};

export default UserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  lottieAnimation: {
    width: 400,
    height: 400,
    marginVertical: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 30,
  },
  editButton: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '80%',
  },
  editButtonInner: {
    padding: 15,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(26,26,26,0.7)',
    borderRadius: 16,
  },
  modalGradient: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 30,
  },
  imagePickerButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 30,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#D4AF37',
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    marginBottom: 20,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  saveButtonInner: {
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
