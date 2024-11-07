import { StyleSheet, Text, View, Image, Modal, TouchableOpacity, ScrollView, ImageBackground, TextInput } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import { attractions } from '../../data/attractions';
import { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppContext } from '../../store/appContext';

const MapScreen = () => {
  const { userMarkers, addUserMarker } = useAppContext();
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMarker, setNewMarker] = useState({
    location: '',
    description: '',
    interest: '',
    image: null,
    coordinates: null
  });

  const handleMapPress = (event) => {
    console.log(event.nativeEvent);
    if (event.nativeEvent.action !== 'marker-press') {
      const { coordinate } = event.nativeEvent;
      setNewMarker(prev => ({
        ...prev,
        coordinates: coordinate
      }));
      setShowCreateModal(true);
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
        image: result.assets[0].uri
      }));
    }
  };

  const handleCreateMarker = async () => {
    if (newMarker.location && newMarker.description && newMarker.image && newMarker.coordinates) {
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
        coordinates: null
      });
    }
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
          <Marker
            coordinate={newMarker.coordinates}
            pinColor="#D4AF37"
          />
        )}

        {attractions.map(attraction => (
          <Marker
            key={attraction.id}
            coordinate={attraction.coordinates}
            title={attraction.location}
            description={attraction.description}
            onPress={(e) => {
              e.stopPropagation();
            }}>
            <Image source={attraction.image} style={styles.markerImage} />
            <Callout
              onPress={(e) => {
                e.stopPropagation();
                setSelectedAttraction(attraction);
                setShowModal(true);
              }}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{attraction.location}</Text>
                <TouchableOpacity 
                  style={styles.calloutButton}
                  onPress={(e) => {
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
            onPress={(e) => {
              e.stopPropagation();
            }}>
            <Image source={{ uri: marker.image }} style={styles.markerImage} />
            <Callout
              onPress={(e) => {
                e.stopPropagation();
                setSelectedAttraction(marker);
                setShowModal(true);
              }}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{marker.location}</Text>
                <TouchableOpacity 
                  style={styles.calloutButton}
                  onPress={(e) => {
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

      {!showCreateModal && (
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>
            Tap anywhere on the map to create a new marker
          </Text>
        </View>
      )}

      {/* Details Modal */}
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
              source={typeof selectedAttraction.image === 'string' 
                ? { uri: selectedAttraction.image } 
                : selectedAttraction.image}
              style={styles.modalBackground}
              blurRadius={2}>
              <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
                style={styles.gradientOverlay}>
                <ScrollView>
                  <View style={styles.modalContent}>
                    <Image 
                      source={typeof selectedAttraction.image === 'string' 
                        ? { uri: selectedAttraction.image } 
                        : selectedAttraction.image}
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
                    <Text style={styles.modalSubtitle}>
                      Points of Interest
                    </Text>
                    <Text style={styles.modalText}>
                      {selectedAttraction.interest}
                    </Text>
                    <LinearGradient
                      colors={['#D4AF37', '#C5A028']}
                      style={styles.closeButton}>
                      <TouchableOpacity 
                        style={styles.closeButtonInner}
                        onPress={() => {
                          setShowModal(false);
                          setSelectedAttraction(null);
                        }}>
                        <Text style={styles.closeButtonText}>Close</Text>
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
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
            style={styles.gradientOverlay}>
            <ScrollView>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Create New Marker</Text>
                
                <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                  {newMarker.image ? (
                    <Image source={{ uri: newMarker.image }} style={styles.previewImage} />
                  ) : (
                    <LinearGradient
                      colors={['#D4AF37', '#C5A028']}
                      style={styles.uploadButton}>
                      <Text style={styles.uploadButtonText}>Choose Image</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="Location Name"
                  placeholderTextColor="#888"
                  value={newMarker.location}
                  onChangeText={(text) => setNewMarker(prev => ({...prev, location: text}))}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
                  placeholderTextColor="#888"
                  multiline
                  value={newMarker.description}
                  onChangeText={(text) => setNewMarker(prev => ({...prev, description: text}))}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Points of Interest"
                  placeholderTextColor="#888"
                  multiline
                  value={newMarker.interest}
                  onChangeText={(text) => setNewMarker(prev => ({...prev, interest: text}))}
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
    paddingTop: 40,
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
  ...additionalStyles,
});

export default MapScreen;
