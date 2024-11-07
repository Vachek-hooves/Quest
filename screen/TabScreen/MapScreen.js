import { StyleSheet, Text, View, Image, Modal, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import { attractions } from '../../data/attractions';
import { useState } from 'react';

const MapScreen = () => {
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={{
          latitude: 36.4335,
          longitude: 28.2042,
          latitudeDelta: 0.4322,
          longitudeDelta: 0.1021,
        }}
        style={styles.map}>
        {attractions.map(attraction => (
          <Marker
            key={attraction.id}
            coordinate={attraction.coordinates}
            title={attraction.location}
            description={attraction.description}>
            <Image source={attraction.image} style={styles.markerImage} />
            <Callout onPress={() => {
              setSelectedAttraction(attraction);
              setShowModal(true);
            }}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{attraction.location}</Text>
                <TouchableOpacity 
                  style={styles.calloutButton}
                  onPress={() => {
                    setSelectedAttraction(attraction);
                    setShowModal(true);
                  }}>
                  <Text style={styles.calloutButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        {selectedAttraction && (
          <View style={styles.modalContainer}>
            <ImageBackground 
              source={selectedAttraction.image}
              style={styles.modalBackground}
              blurRadius={2}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                style={styles.gradientOverlay}>
                <ScrollView>
                  <View style={styles.modalContent}>
                    <Image 
                      source={selectedAttraction.image} 
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
                        onPress={() => setShowModal(false)}>
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
    </View>
  );
};

export default MapScreen;

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
});
