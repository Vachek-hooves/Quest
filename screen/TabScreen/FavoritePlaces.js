import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import {useAppContext} from '../../store/appContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';
import TabLayout from '../../components/layout/TabLayout';

const FavoritePlaces = () => {
  const navigation = useNavigation();
  const {favorites, toggleFavorite} = useAppContext();

  const getImageSource = image => {
    if (typeof image === 'string') {
      return {uri: `file://${image}`};
    }
    return image;
  };

  const handlePlacePress = place => {
    navigation.navigate('FavoriteDetailsScreen', {place});
  };

  if (favorites.length === 0) {
    return (
      <TabLayout>
        <View style={styles.emptyContainer}>
          <Icon name="heart-outline" size={80} color="#D4AF37" />
          <Text style={styles.emptyText}>No favorite places yet</Text>
          <Text style={styles.emptySubText}>
            Add places to your favorites from the map
          </Text>
        </View>
      </TabLayout>
    );
  }

  return (
    //   <LinearGradient
    //         colors={['#1A1A1A', '#2A2A2A']}
    //         style={styles.container}
    //     >
    <TabLayout>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {favorites.map(place => (
            <TouchableOpacity
              key={place.id}
              style={styles.card}
              onPress={() => handlePlacePress(place)}>
              <Image
                source={getImageSource(place.image)}
                style={styles.cardImage}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                style={styles.cardOverlay}>
                <Text style={styles.cardTitle}>{place.location}</Text>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={e => {
                    e.stopPropagation();
                    toggleFavorite(place);
                  }}>
                  <Icon name="heart" size={24} color="#D4AF37" />
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
      {/* </LinearGradient> */}
    </TabLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    height: 200,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    // backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default FavoritePlaces;
