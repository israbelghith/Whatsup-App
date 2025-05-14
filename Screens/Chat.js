import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ImageBackground } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import firebase from '../Config';

const database = firebase.database();
const ref_database = database.ref();
const ref_lesdiscussions = ref_database.child("Listes_discussion");

export default function Chat(props) {
  const currentid = props.route.params?.currentid;
  const secondid = props.route.params?.secondid;
  const [pseudo, setPseudo] = useState('Utilisateur inconnu');

  if (!currentid || !secondid) {
    console.error("Erreur : ID(s) manquant(s)", { currentid, secondid });
    return null;
  }

  const idDesc = currentid > secondid ? `${currentid}_${secondid}` : `${secondid}_${currentid}`;
  const ref_unediscussion = ref_lesdiscussions.child(idDesc);
  const ref_Messages = ref_unediscussion.child("Messages");

  const ref_otherTyping = ref_unediscussion.child(secondid + "_istyping");
  const ref_myTyping = ref_unediscussion.child(currentid + "_istyping");

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Fetch pseudonym for secondid
    firebase.database().ref(`ListComptes/${secondid}`).once('value')
      .then(snapshot => {
        const userData = snapshot.val();
        setPseudo(userData ? userData.pseudo : 'Utilisateur inconnu');
        console.log('Second user pseudo:', userData?.pseudo); // Debug: Verify pseudo
      })
      .catch(error => console.error('Error fetching second user data:', error));

    const listener = ref_Messages.on("value", (snapshot) => {
      const d = [];
      snapshot.forEach((un_msg) => {
        d.push(un_msg.val());
      });
      setMessages(d);
      console.log('Messages:', d); // Debug: Verify messages
    });

    return () => {
      ref_Messages.off("value", listener);
    };
  }, [secondid]);

  useEffect(() => {
    const listener = ref_otherTyping.on("value", (snapshot) => {
      setIsTyping(snapshot.val() === true);
      console.log('Other user typing:', snapshot.val()); // Debug: Verify typing
    });

    return () => {
      ref_otherTyping.off("value", listener);
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const key = ref_Messages.push().key;
    const ref_unmsg = ref_Messages.child(key);
    ref_unmsg.set({
      text: message,
      time: new Date().toLocaleString(),
      sender: currentid,
      receiver: secondid,
    });

    setMessage('');
    ref_myTyping.set(false);
  };

  return (
    <ImageBackground
      source={require("../assets/forg+dinner.jpg")} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => props.navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>{pseudo}</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.messageContainer, item.sender === currentid ? styles.myMessage : styles.theirMessage]}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
          )}
        />

        {isTyping && (
          <View style={styles.typingBubble}>
            <Text style={styles.typingText}>is typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            onFocus={() => ref_myTyping.set(true)}
            onBlur={() => ref_myTyping.set(false)}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  navbar: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    padding: 5,
  },
  navbarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#11A', // Match ChatGroup.js title color
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '70%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', // Match ChatGroup.js
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#57BFEC', // Keep original color
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f1f1f1',
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#007bff', // Match ChatGroup.js button color
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 10,
    marginBottom: 5,
    maxWidth: '70%',
  },
  typingText: {
    fontSize: 13,
    color: '#555',
  },
});