import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';

export const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#D4AF37',
        marginTop: 20,
        width: '90%',
        height: 70,
      }}
      contentContainerStyle={{
        backgroundColor: '#2A2A2A',
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D4AF37',
      }}
      text2Style={{
        fontSize: 16,
        color: '#FFFFFF',
      }}
      text2NumberOfLines={2}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#FF4444',
        backgroundColor: '#2A2A2A',
        marginTop: 20,
        width: '90%',
        height: 70,
      }}
      contentContainerStyle={{
        backgroundColor: '#2A2A2A',
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF4444',
      }}
      text2Style={{
        fontSize: 16,
        color: '#FFFFFF',
      }}
      text2NumberOfLines={2}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3498db',
        marginTop: 20,
        width: '90%',
        height: 70,
      }}
      contentContainerStyle={{
        backgroundColor: '#2A2A2A',
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3498db',
      }}
      text2Style={{
        fontSize: 16,
        color: '#FFFFFF',
      }}
      text2NumberOfLines={2}
    />
  ),
};
