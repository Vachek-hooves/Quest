import { 
    StyleSheet, 
    Text, 
    View, 
    Image, 
    ScrollView, 
    TouchableOpacity,
    SafeAreaView 
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../../store/appContext';

const FavoriteDetailsScreen = ({ route, navigation }) => {
    const { place } = route.params;
    
    const { toggleFavorite } = useAppContext();

    const getImageSource = (image) => {
        if (typeof image === 'string') {
            return { uri: `file://${image}` };
        }
        return image;
    };

    // Check if coordinates exist and are valid
    const hasValidCoordinates = place.coordinates && 
        typeof place.coordinates.latitude !== 'undefined' && 
        typeof place.coordinates.longitude !== 'undefined';

    return (
        <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={styles.container}
        >
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    {/* Header Image */}
                    <View style={styles.imageContainer}>
                        <Image 
                            source={getImageSource(place.image)}
                            style={styles.headerImage}
                        />
                        <LinearGradient
                            colors={['rgba(0,0,0,0.7)', 'transparent']}
                            style={styles.headerOverlay}
                        >
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Icon name="arrow-back" size={28} color="#D4AF37" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.favoriteButton}
                                onPress={() => toggleFavorite(place)}
                            >
                                <Icon name="heart" size={28} color="#D4AF37" />
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.title}>{place.location || 'Unnamed Location'}</Text>
                        
                        {place.description && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Description</Text>
                                <Text style={styles.description}>{place.description}</Text>
                            </View>
                        )}

                        {place.interest && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Points of Interest</Text>
                                <Text style={styles.text}>{place.interest}</Text>
                            </View>
                        )}

                        {hasValidCoordinates && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Location</Text>
                                <View style={styles.coordinatesContainer}>
                                    <View style={styles.coordinateRow}>
                                        <Icon name="location" size={20} color="#D4AF37" />
                                        <Text style={styles.coordinateLabel}>Latitude: {place.coordinates.latitude}</Text>
                                        
                                    </View>
                                    <View style={styles.coordinateRow}>
                                        <Icon name="location" size={20} color="#D4AF37" />
                                        <Text style={styles.coordinateLabel}>Longitude:{place.coordinates.longitude} </Text>
                                        
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        height: 600,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#FFFFFF',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        padding: 15,
        borderRadius: 10,
    },
    text: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 5,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        padding: 15,
        borderRadius: 10,
    },
    coordinatesContainer: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
    },
    coordinateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    coordinateLabel: {
        fontSize: 16,
        color: '#FFFFFF',
        marginLeft: 10,
    },
    coordinateValue: {
        fontSize: 16,
        color: '#D4AF37',
        fontWeight: 'bold',
    },
});

export default FavoriteDetailsScreen;