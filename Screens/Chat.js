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
    const listener = ref_Messages.on("value", (snapshot) => {
      const d = [];
      snapshot.forEach((un_msg) => {
        d.push(un_msg.val());
      });
      setMessages(d);
    });

    return () => {
      ref_Messages.off("value", listener);
    };
  }, []);

  useEffect(() => {
    const listener = ref_otherTyping.on("value", (snapshot) => {
      setIsTyping(snapshot.val() === true);
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
    <ImageBackground style={styles.background} resizeMode="cover">
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
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '70%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#57BFEC', // Gris clair pour l'autre utilisateur
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
  },
  typingIndicator: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 5,
    marginLeft: 10,
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
    backgroundColor: '#007bff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
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
