import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, Button, StyleSheet, Alert,
  TouchableOpacity, Modal, ImageBackground, Image
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../Config';

const emojiOptions = ['👍', '❤️', '🥰','😂', '😐', '😮', '😢', '😡'];

export default function ChatGroup(props) {
  const { groupId, currentid } = props.route.params; // Access params from route
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(currentid || '');
  const [currentUserName, setCurrentUserName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [selectedMessageForEmoji, setSelectedMessageForEmoji] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    console.log('groupId:', groupId, 'currentid:', currentid); // Debug: Verify params
    if (!groupId) {
      console.error('Invalid groupId, redirecting');
      Alert.alert('Erreur', 'Aucun groupe sélectionné');
      props.navigation.goBack();
      return;
    }
    if (!currentUserId) {
      console.error('No authenticated user, redirecting to login');
      props.navigation.navigate('Login'); // Adjust to your login screen
      return;
    }

    firebase.database().ref(`ListComptes/${currentUserId}`).once('value')
      .then(snapshot => {
        const userData = snapshot.val();
        setCurrentUserName(userData ? userData.pseudo : 'Utilisateur inconnu');
      })
      .catch(error => console.error('Error fetching user data:', error));

    firebase.database().ref(`groups/${groupId}`).once('value')
      .then(snapshot => {
        const groupData = snapshot.val();
        setGroupName(groupData ? groupData.name : 'Groupe inconnu');
        console.log('Group data:', groupData); // Debug: Verify group data
      })
      .catch(error => console.error('Error fetching group data:', error));

    const messagesRef = firebase.database().ref(`groups/${groupId}/messages`);
    messagesRef.orderByChild('timestamp').on('value', snapshot => {
      const data = snapshot.val();
      console.log('Firebase messages data:', data); // Debug: Verify raw data
      const loadedMessages = [];
      if (data) {
        for (let key in data) {
          loadedMessages.push({
            id: key,
            ...data[key]
          });
        }
      }
      console.log('Processed messages:', loadedMessages); // Debug: Verify processed messages
      setMessages(loadedMessages.reverse());
    }, error => {
      console.error('Error fetching messages:', error); // Debug: Catch listener errors
    });

    return () => messagesRef.off('value');
  }, [groupId, currentid, props.navigation]);

  useEffect(() => {
    if (isEditModalVisible) {
      console.log('Modal opened, editMessageText:', editMessageText);
    }
  }, [isEditModalVisible, editMessageText]);

  async function uploadImage(file) {
    const fileExt = file.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `chat_images/${fileName}`;

    try {
      const response = await fetch(file);
      const blob = await response.blob();
      const arraybuffer = await new Response(blob).arrayBuffer();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('image')
        .upload(filePath, arraybuffer, { upsert: true });

      if (uploadError) {
        console.error('Erreur pendant l’upload:', uploadError.message);
        return null;
      }

      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from('image')
        .getPublicUrl(filePath);

      if (publicUrlError) {
        console.error('Erreur pour obtenir l’URL publique:', publicUrlError.message);
        return null;
      }

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.userId === currentUserId;

    const reactions = item.reactions && typeof item.reactions === 'object'
      ? Object.values(item.reactions)
      : [];

    return (
      <TouchableOpacity
        onLongPress={() => {
          if (item.userId === currentUserId) {
            Alert.alert('Options', 'Take an action below..', [
              {
                text: 'Edit',
                onPress: () => {
                  console.log('Opening edit modal for messageId:', item.id, 'with text:', item.text);
                  setEditMessageId(item.id);
                  setEditMessageText(item.text || '');
                  setEditModalVisible(true);
                }
              },
              {
                text: 'Delete',
                onPress: () => {
                  Alert.alert('Confirmation', 'Do you really wnat to delete this message ?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        firebase.database().ref(`groups/${groupId}/messages/${item.id}`).remove();
                      }
                    }
                  ]);
                }
              },
              {
                text: 'Interact',
                onPress: () => setSelectedMessageForEmoji(item.id)
              },
              { text: 'Cancel', style: 'cancel' },
            ]);
          } else {
            setSelectedMessageForEmoji(item.id);
          }
        }}
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={styles.messageUser}>{item.userName}</Text>
        {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.messageImage}
            resizeMode="contain"
          />
        ) : null}
        <Text style={styles.messageTimestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>

        {reactions.length > 0 && (
          <View style={styles.reactionContainer}>
            {reactions.map((reaction, index) => (
              <Text key={index} style={styles.reaction}>{reaction}</Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/kirby.jpg")}
      style={styles.container}
    >
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => props.navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>back</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>{groupName}</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        inverted
      />

      <View style={styles.inputContainer}>
        {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity
          onPress={async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled) {
              setSelectedImage(result.assets[0].uri);
            }
          }}
          style={styles.imageButton}
        >
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>
        <Button
          title="Send"
          color="#03D12B"
          onPress={async () => {
            let imageUrl = null;
            if (selectedImage) {
              imageUrl = await uploadImage(selectedImage);
              if (!imageUrl) {
                Alert.alert('Erreur', 'Échec de l’upload de l’image.');
                return;
              }
            }

            if (newMessage.trim() || imageUrl) {
              firebase.database().ref(`groups/${groupId}/messages`).push({
                userId: currentUserId,
                userName: currentUserName,
                text: newMessage.trim() || '',
                imageUrl: imageUrl || null,
                timestamp: Date.now(),
                reactions: []
              });
              setNewMessage('');
              setSelectedImage(null);
            } else {
              Alert.alert('Erreur', 'Veuillez entrer un message ou sélectionner une image.');
            }
          }}
        />
      </View>

      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le message</Text>
            <TextInput
              style={styles.modalInput}
              value={editMessageText}
              onChangeText={setEditMessageText}
              placeholder="Write the modified message..."
              multiline
              numberOfLines={4}
            />
            <Button
              title="Save changes"
              color="#9866C7"
              onPress={() => {
                if (editMessageText.trim()) {
                  firebase.database().ref(`groups/${groupId}/messages/${editMessageId}`).update({
                    text: editMessageText.trim(),
                  });
                  setEditModalVisible(false);
                  setEditMessageId(null);
                  setEditMessageText('');
                } else {
                  Alert.alert('Erreur', 'This message must not be empty.');
                }
              }}
            />
            <Button
              title="Cancel"
              color="#C9184A"
              onPress={() => {
                setEditModalVisible(false);
                setEditMessageId(null);
                setEditMessageText('');
              }}
            />
          </View>
        </View>
      </Modal>
<Modal visible={!!selectedMessageForEmoji} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.emojiPicker}>
      {emojiOptions.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => {
            if (selectedMessageForEmoji) {
              firebase
                .database()
                .ref(`groups/${groupId}/messages/${selectedMessageForEmoji}/reactions`)
                .update({
                  [currentUserId]: emoji,
                })
                .then(() => {
                  setSelectedMessageForEmoji(null);
                });
            }
          }}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={() => setSelectedMessageForEmoji(null)}
        style={styles.cancelIconButton}
      >
        <Text style={styles.cancelIcon}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  navbar: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: { position: 'absolute', left: 10, padding: 5 },
  backIcon: { fontSize: 14 },
  navbarTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageButton: { padding: 10 },
  imageButtonText: { fontSize: 24 },
  previewImage: { width: 100, height: 100, marginBottom: 10, borderRadius: 5 },
  messageContainer: { padding: 10, marginVertical: 5, borderRadius: 5, maxWidth: '80%' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#ECECEC' },
  messageUser: { fontWeight: 'bold' },
  messageText: { fontSize: 16 },
  messageImage: { width: 200, height: 200, marginTop: 5, borderRadius: 5 },
  messageTimestamp: { fontSize: 10, color: '#888', marginTop: 4 },
  reactionContainer: { flexDirection: 'row', marginTop: 4 },
  reaction: { fontSize: 18, marginRight: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  emojiPicker: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emoji: { fontSize: 30, margin: 10 },
  cancelIconButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
   // backgroundColor: '#C9184A', // Same color as the original button
    borderRadius: 5,
    marginTop: 10,
  },
  cancelIcon: {
    fontSize: 15, // Adjust size as needed
    color: '#C9184A', // Contrast with the background
  },
});