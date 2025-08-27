
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment-timezone';
import messaging from '@react-native-firebase/messaging';
import { createSchedule } from './src/firestore';
import { scheduleNotification } from './src/notifications';

export default function App() {
  const [question, setQuestion] = useState('');
  const [date, setDate] = useState(new Date());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    // Request permission & get token
    async function initFCM() {
      const authStatus = await messaging().requestPermission();
      if (authStatus) {
        const token = await messaging().getToken();
        setFcmToken(token);
        console.log('FCM Token:', token);
      }
    }
    initFCM();

    messaging().onTokenRefresh(token => {
      setFcmToken(token);
      console.log('FCM Token refreshed:', token);
    });
  }, []);

  const handleSchedule = async () => {
    if (!question.trim()) return Alert.alert('⚠️ Enter a question');
    if (!date) return Alert.alert('⚠️ Pick date & time');
    if (!fcmToken) return Alert.alert('⚠️ FCM token not ready');

    const scheduleId = await createSchedule({
      title: question,
      scheduledAt: date,
      fcmToken,
    });

    await scheduleNotification({ id: scheduleId, title: question, date });

    Alert.alert('✅ Notification scheduled!', moment(date).format('LLLL'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📅 Schedule Your Reminder</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter question (e.g. Did you eat lunch?)"
        value={question}
        onChangeText={setQuestion}
      />

      <TouchableOpacity style={styles.button} onPress={() => setPickerVisible(true)}>
        <Text style={styles.buttonText}>📌 Pick Date & Time</Text>
      </TouchableOpacity>

      <Text style={styles.selected}>Selected: {moment(date).tz('Asia/Karachi').format('LLLL')}</Text>

      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="datetime"
        minimumDate={new Date()}
        onConfirm={date => {
          setDate(date);
          setPickerVisible(false);
        }}
        onCancel={() => setPickerVisible(false)}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: '#28a745' }]} onPress={handleSchedule}>
        <Text style={styles.buttonText}>🚀 Schedule Notification</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
     backgroundColor: '#f8f9fa',
      justifyContent: 'center',
       padding: 20 
      },
  heading: { 
    fontSize: 22, 
    fontWeight: 'bold',
     textAlign: 'center', 
     marginBottom: 20, color: '#333'
     },
  input: {
     borderWidth: 1,
      borderColor: '#ccc', 
      padding: 12, 
      borderRadius: 10,
       marginBottom: 15,
        backgroundColor: '#fff'
       },
  button: {
     backgroundColor: '#007bff',
     padding: 14,
      borderRadius: 10,
       alignItems: 'center', 
       marginTop: 15 
      },
  buttonText: {
     color: '#fff',
      fontWeight: 'bold', 
      fontSize: 16 
    },
  selected: { 
    marginTop: 10, 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#444'
   },
});
