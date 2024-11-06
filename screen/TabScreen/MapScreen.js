import { StyleSheet, Text, View, Image } from 'react-native'
import MapView, { Marker } from 'react-native-maps';
import { attractions } from '../../data/attractions';

const INITIAL_POSITION = {
    latitude: 36.835833,
    longitude: 27.142857,
    latitudeDelta: 0.4322,
    longitudeDelta: 0.1021
}

const MapScreen = () => {
  // Convert string coordinates to numbers
  const getCoordinates = (coordString) => {
    const [lat, long] = coordString.split(',').map(coord => {
      return parseFloat(coord.replace('° N', '').replace('° E', '').trim());
    });
    return { latitude: lat, longitude: long };
  };

  return (
    <View style={styles.container}>
        <MapView 
          initialRegion={{
            latitude: 36.4335,
            longitude: 28.2042,
            latitudeDelta: 0.4322,
            longitudeDelta: 0.1021
          }} 
          style={styles.map}
        >
          {attractions.map((attraction) => (
            <Marker
              key={attraction.id}
              coordinate={attraction.coordinates}
              title={attraction.location}
              description={attraction.description}
            >
              <Image 
                source={attraction.image}
                style={styles.markerImage}
              />
            </Marker>
          ))}
        </MapView>
    </View>
  )
}

export default MapScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1
    },
    markerImage: {
        width: 60,
        height: 60,
        borderRadius: 17.5,
        borderWidth: 2,
        borderColor: 'white'
    }
})
