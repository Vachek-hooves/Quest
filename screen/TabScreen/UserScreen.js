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
import React, {useState, useEffect,us} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import { useAppContext } from '../../store/appContext';
import Toast from 'react-native-toast-message';
import TabLayout from '../../components/layout/TabLayout';


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
  const [hasAccount, setHasAccount] = useState(false);
  const { getGameStatistics } = useAppContext();
  const stats = getGameStatistics();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setHasAccount(true);
        
        // Show welcome toast message
        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
          text2: `Good to see you, ${parsedUser.name || 'User'}! 👋`,
          position: 'top',
          topOffset: 50,
          visibilityTime: 3000,
        });
      } else {
        setHasAccount(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsLoading(false);
      
      // Show error toast if something goes wrong
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load user data',
        position: 'top',
        topOffset: 50,
      });
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
      setHasAccount(true);
      setShowEditModal(false);

      // Show welcome toast for new users
      if (!hasAccount) {
        Toast.show({
          type: 'success',
          text1: 'Welcome!',
          text2: `Profile created successfully, ${tempUser.name}! 🎉`,
          position: 'top',
          topOffset: 50,
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your changes have been saved successfully! ✨',
          position: 'top',
          topOffset: 50,
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save profile changes',
        position: 'top',
        topOffset: 50,
      });
    }
  };

  const handleEdit = () => {
    setTempUser(user);
    setShowEditModal(true);
  };

  const renderStatistics = () => {
    return (
      <TabLayout>
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Game Statistics</Text>
        
        {/* Timed Challenge Stats */}
        {/* <LinearGradient
          colors={['#2A2A2A', '#1A1A1A']}
          style={styles.statsCard}
        > */}
          <Text style={styles.gameTitle}>Timed Challenge</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Games Played:</Text>
            <Text style={styles.statValue}>{stats.timed.gamesPlayed}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>High Score:</Text>
            <Text style={styles.statValue}>{stats.timed.highScore}</Text>
          </View>
          {/* <View style={styles.statRow}>
            <Text style={styles.statLabel}>Best Time:</Text>
            <Text style={styles.statValue}>{stats.timed.bestTime}</Text>
          </View> */}
          {/* <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Score:</Text>
            <Text style={styles.statValue}>{stats.timed.averageScore}</Text>
          </View> */}
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Played:</Text>
            <Text style={styles.statValue}>{stats.timed.lastPlayed}</Text>
          </View>
        {/* </LinearGradient> */}

        {/* Sudden Death Stats */}
        {/* <LinearGradient
          colors={['#2A2A2A', '#1A1A1A']}
          style={styles.statsCard}
        > */}
          <Text style={styles.gameTitle}>Sudden Death</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Games Played:</Text>
            <Text style={styles.statValue}>{stats.suddenDeath.gamesPlayed}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Best Streak:</Text>
            <Text style={styles.statValue}>{stats.suddenDeath.bestStreak}</Text>
          </View>
          {/* <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Streak:</Text>
            <Text style={styles.statValue}>{stats.suddenDeath.averageStreak}</Text>
          </View> */}
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Played:</Text>
            <Text style={styles.statValue}>{stats.suddenDeath.lastPlayed}</Text>
          </View>
        {/* </LinearGradient> */}
      </View>
      </TabLayout>
    );
  };

  const handleDeleteUser = async () => {
    try {
      // Delete user image if it exists
      if (user.image) {
        try {
          await RNFS.unlink(user.image);
        } catch (error) {
          console.error('Error deleting image file:', error);
        }
      }

      // Clear user data from AsyncStorage
      await AsyncStorage.setItem('userData', '');
      
      // Reset state
      setUser({
        name: '',
        image: null,
      });
      setHasAccount(false);
      setShowEditModal(false);

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Profile Deleted',
        text2: 'Your profile has been successfully deleted',
        position: 'top',
        topOffset: 50,
        visibilityTime: 3000,
      });

    } catch (error) {
      console.error('Error deleting user data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete profile',
        position: 'top',
        topOffset: 50,
      });
    }
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
    <TabLayout>
    <View style={styles.container}>
      {/* <LinearGradient
        colors={['#1A1A1A', '#2A2A2A', '#AA8A1B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}> */}
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
              <Text style={styles.editButtonText}>
                {hasAccount ? 'Edit Profile' : 'Create Profile'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {!hasAccount ? (
            <LottieView
              source={require('../../assets/animation/login.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
          ) : (
            renderStatistics()
          )}
        </ScrollView>
      {/* </LinearGradient> */}

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
          {/* <LinearGradient
            colors={['#1A1A1A', '#2A2A2A', '#AA8A1B']}
            style={styles.modalGradient}> */}
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
                      {/* <Icon name="camera" size={40} color="#D4AF37" /> */}
                      <LottieView
                        source={require('../../assets/animation/camera.json')}
                        autoPlay
                        loop
                        style={styles.lottieCamera}
                        speed={0.5}
                      />
                      {/* <Text style={styles.uploadButtonText}>Choose Photo</Text> */}
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

                {hasAccount && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteUser}>
                    <Icon name="trash-outline" size={24} color="#FF4444" />
                    <Text style={styles.deleteButtonText}>Delete Profile</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.lottieContainer}>
                  
                </View>
              </View>
            </ScrollView>
          {/* </LinearGradient> */}
        </View>
      </Modal>
    </View>
    </TabLayout>
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
  lottieCamera: {
    width: 140,
    height: 140,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  lottieAnimation: {
    width: 400, // Reduce from 400 to prevent scaling artifacts
    height: 400,
    marginVertical: 20,
    alignSelf: 'center',
    transform: [{scale: 1}], // Add this to prevent unwanted scaling
  },
  profileImage: {
    width: 300,
    height: 200,
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
    width: 160,
    height: 160,
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
  statsContainer: {
    width: '100%',
    marginTop: 30,
    padding: 20,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  statValue: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#FF4444',
    width: '100%',
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
