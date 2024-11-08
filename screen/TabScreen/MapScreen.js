import {
  StyleSheet,
  Text,
  View,
  Image,
  Modal,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import {attractions} from '../../data/attractions';
import {useState, useEffect} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAppContext} from '../../store/appContext';
import RNFS from 'react-native-fs';
import LottieView from 'lottie-react-native';
import {Animated} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const MapScreen = () => {
  const {userMarkers, addUserMarker, favorites, toggleFavorite} =
    useAppContext();
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMarker, setNewMarker] = useState({
    location: '',
    description: '',
    interest: '',
    image: null,
    coordinates: null,
  });

  const [imageExistsMap, setImageExistsMap] = useState({});

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const popupAnimation = new Animated.Value(0);

  useEffect(() => {
    const checkImages = async () => {
      const existsMap = {};
      for (const marker of userMarkers) {
        if (typeof marker.image === 'string') {
          existsMap[marker.image] = await checkImageExists(marker.image);
        }
      }
      setImageExistsMap(existsMap);
    };
    checkImages();
  }, [userMarkers]);

  useEffect(() => {
    if (showCreatePopup) {
      Animated.spring(popupAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(popupAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showCreatePopup]);

  const checkImageExists = async path => {
    try {
      return await RNFS.exists(path);
    } catch (error) {
      console.error('Error checking image:', error);
      return false;
    }
  };

  const getImageSource = image => {
    if (typeof image === 'string') {
      if (imageExistsMap[image]) {
        return {uri: `file://${image}`};
      }
      return require('../../assets/image/default-marker.png');
    }
    return image; // For pre-defined attractions
  };

  const renderMarkerImage = imagePath => {
    return (
      <Image source={getImageSource(imagePath)} style={styles.markerImage} />
    );
  };

  const handleMapPress = event => {
    console.log(event.nativeEvent);
    if (event.nativeEvent.action !== 'marker-press') {
      const {coordinate} = event.nativeEvent;
      setNewMarker(prev => ({
        ...prev,
        coordinates: coordinate,
      }));
      setShowCreatePopup(true);
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (!result.didCancel && result.assets?.[0]) {
      setNewMarker(prev => ({
        ...prev,
        image: result.assets[0].uri,
      }));
    }
  };

  const handleCreateMarker = async () => {
    if (
      newMarker.location &&
      newMarker.description &&
      newMarker.image &&
      newMarker.coordinates
    ) {
      await addUserMarker({
        ...newMarker,
        id: Date.now().toString(),
      });
      setShowCreateModal(false);
      setNewMarker({
        location: '',
        description: '',
        interest: '',
        image: null,
        coordinates: null,
      });
    }
  };

  const handleCreatePress = () => {
    setShowCreatePopup(false);
    setShowCreateModal(true);
  };

  const isFavorite = place => {
    return favorites.some(
      fav => fav.id === place.id && fav.location === place.location,
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        onPress={handleMapPress}
        initialRegion={{
          latitude: 36.4335,
          longitude: 28.2042,
          latitudeDelta: 0.4322,
          longitudeDelta: 0.1021,
        }}
        style={styles.map}>
        {newMarker.coordinates && showCreateModal && (
          <Marker coordinate={newMarker.coordinates} pinColor="#D4AF37" />
        )}

        {attractions.map(attraction => (
          <Marker
            key={attraction.id}
            coordinate={attraction.coordinates}
            title={attraction.location}
            description={attraction.description}
            onPress={e => {
              e.stopPropagation();
            }}>
            <Image source={attraction.image} style={styles.markerImage} />
            <Callout
              onPress={e => {
                e.stopPropagation();
                setSelectedAttraction(attraction);
                setShowModal(true);
              }}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{attraction.location}</Text>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={e => {
                    e.stopPropagation();
                    setSelectedAttraction(attraction);
                    setShowModal(true);
                  }}>
                  <Text style={styles.calloutButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}

        {userMarkers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinates}
            title={marker.location}
            description={marker.description}
            onPress={e => {
              e.stopPropagation();
            }}>
            {renderMarkerImage(marker.image)}
            <Callout
              onPress={e => {
                e.stopPropagation();
                setSelectedAttraction(marker);
                setShowModal(true);
              }}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{marker.location}</Text>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={e => {
                    e.stopPropagation();
                    setSelectedAttraction(marker);
                    setShowModal(true);
                  }}>
                  <Text style={styles.calloutButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {showCreatePopup && (
        <Animated.View
          style={[
            styles.createPopup,
            {
              transform: [
                {
                  scale: popupAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ],
              opacity: popupAnimation,
            },
          ]}>
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() => setShowCreatePopup(false)}>
            <Icon name="close-circle" size={28} color="#D4AF37" />
          </TouchableOpacity>
          <LottieView
            source={require('../../assets/animation/mapMarker.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <LinearGradient
            colors={['#D4AF37', '#C5A028']}
            style={styles.popupCreateButton}>
            <TouchableOpacity
              style={styles.popupCreateButtonInner}
              onPress={handleCreatePress}>
              <Text style={styles.popupCreateButtonText}>Create</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}

      {!showCreateModal && (
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>
            Tap anywhere on the map to create a new marker
          </Text>
        </View>
      )}

      {/* Updated Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => {
          setShowModal(false);
          setSelectedAttraction(null);
        }}>
        {selectedAttraction && (
          <View style={styles.modalContainer}>
            <ImageBackground
              source={getImageSource(selectedAttraction.image)}
              style={styles.modalBackground}
              blurRadius={2}>
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                style={styles.gradientOverlay}>
                <ScrollView>
                  <View style={styles.modalContent}>
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => toggleFavorite(selectedAttraction)}>
                      <Icon
                        name={
                          isFavorite(selectedAttraction)
                            ? 'heart'
                            : 'heart-outline'
                        }
                        size={40}
                        color="#D4AF37"
                      />
                    </TouchableOpacity>

                    <Image
                      source={getImageSource(selectedAttraction.image)}
                      style={styles.modalImage}
                    />
                    <Text style={styles.modalTitle}>
                      {selectedAttraction.location}
                    </Text>
                    <Text style={styles.modalDescription}>
                      {selectedAttraction.description}
                    </Text>
                    <LinearGradient
                      colors={['#D4AF37', '#C5A028']}
                      style={styles.divider}
                    />
                    <Text style={styles.modalSubtitle}>Points of Interest</Text>
                    <Text style={styles.modalText}>
                      {selectedAttraction.interest}
                    </Text>

                    {/* Back Button at bottom */}
                    <LinearGradient
                      colors={['#D4AF37', '#C5A028']}
                      style={styles.backButton}>
                      <TouchableOpacity
                        style={styles.backButtonInner}
                        onPress={() => {
                          setShowModal(false);
                          setSelectedAttraction(null);
                        }}>
                        <Text style={styles.backButtonText}>Back to Map</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                </ScrollView>
              </LinearGradient>
            </ImageBackground>
          </View>
        )}
      </Modal>

      {/* Create Marker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setShowCreateModal(false)}>
              <Icon name="close-circle" size={32} color="#D4AF37" />
            </TouchableOpacity>
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
              style={styles.gradientOverlay}>
              <ScrollView>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Create New Marker</Text>

                  <TouchableOpacity
                    onPress={pickImage}
                    style={styles.imagePickerButton}>
                    {newMarker.image ? (
                      <Image
                        source={{uri: newMarker.image}}
                        style={styles.previewImage}
                      />
                    ) : (
                      <LinearGradient
                        colors={['#D4AF37', '#C5A028']}
                        style={styles.uploadButton}>
                        <Text style={styles.uploadButtonText}>
                          Choose Image
                        </Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>

                  <TextInput
                    style={styles.input}
                    placeholder="Location Name"
                    placeholderTextColor="#888"
                    value={newMarker.location}
                    onChangeText={text =>
                      setNewMarker(prev => ({...prev, location: text}))
                    }
                  />

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description"
                    placeholderTextColor="#888"
                    multiline
                    value={newMarker.description}
                    onChangeText={text =>
                      setNewMarker(prev => ({...prev, description: text}))
                    }
                  />

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Points of Interest"
                    placeholderTextColor="#888"
                    multiline
                    value={newMarker.interest}
                    onChangeText={text =>
                      setNewMarker(prev => ({...prev, interest: text}))
                    }
                  />

                  <LinearGradient
                    colors={['#D4AF37', '#C5A028']}
                    style={styles.closeButton}>
                    <TouchableOpacity
                      style={styles.closeButtonInner}
                      onPress={handleCreateMarker}>
                      <Text style={styles.closeButtonText}>Create Marker</Text>
                    </TouchableOpacity>
                  </LinearGradient>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowCreateModal(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const additionalStyles = {
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  keyboardAvoidView:{
    flex:1
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: '#2A2A2A',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#D4AF37',
    fontSize: 16,
  },
  instructionOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginTop: 50,
  },
  instructionText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
  },
  createPopup: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 200, // Set fixed width for smaller popup
    paddingTop: 10,
  },
  lottieAnimation: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  popupCreateButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  popupCreateButtonInner: {
    padding: 12,
    alignItems: 'center',
  },
  popupCreateButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 30, // Add more padding at bottom for the back button
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#D4AF37',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  divider: {
    height: 2,
    marginVertical: 20,
    borderRadius: 1,
  },
  modalSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#D4AF37',
  },
  modalText: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  closeButton: {
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
  },
  closeButtonInner: {
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    borderRadius: 10,
    marginTop: 30,
    overflow: 'hidden',
    marginBottom: 20, // Add space below the button
  },
  backButtonInner: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  markerImage: {
    width: 70,
    height: 70,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  calloutContainer: {
    width: 200,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#D4AF37',
  },
  calloutButton: {
    backgroundColor: '#D4AF37',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    width: '100%',
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ...additionalStyles,
});

export default MapScreen;
