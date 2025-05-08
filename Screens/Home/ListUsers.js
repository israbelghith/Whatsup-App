import React, { useState, useEffect } from "react"; // Ajout de useEffect


import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import firebase from "../../Config"; // Importation de la config Firebase

export default function ListUsers(props) {
  const currentUserId=props.route.params.currentUserId;

  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);

  //recupere des data

  


  useEffect(() => {
    const fetchData = async () => {
      firebase
        .database()
        .ref("ListComptes")
        .on("value", (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const userList = Object.keys(data)
              .map((key) => ({
                id: key,
                ...data[key],
              }))
              .filter(user => user.id !== currentUserId); // 🔥 Exclure le compte connecté
            
            setUsers(userList);
          }
        });
    };
  
    fetchData();
  
    // Nettoyer l'écouteur quand le composant se démonte
    return () => {
      firebase.database().ref("ListComptes").off("value");
    };
  }, []);
  

  return (
    <ImageBackground
      source={require("../../assets/back1.jpg")}
      style={styles.container}
    >
      <Text style={styles.title}>List users</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            {/* Profil picture */}
            <TouchableHighlight onPress={() => props.navigation.navigate("Chat", { currentid: currentUserId, secondid: item.id })}
            >
              <Image
                source={item.urlimage?{uri:item.urlimage}:require("../../assets/iconprofil.png")}
                style={styles.avatar}
              />
            </TouchableHighlight>

            {/* User pseudo */}
            <Text style={styles.pseudo}>{item.pseudo}</Text>
            <View style={{
              width:20,
              height:20,
              borderRadius:10,
              backgroundColor:item.connected?"green":"red",
            }}>

            </View>

            {/* Call icon */}
            <TouchableHighlight
              style={styles.iconButton}
              onPress={() => {
                const phoneURL =
                  Platform.OS === "android"
                    ? "tel:" + item.numero
                    : "telprompt:" + item.numero;
                Linking.openURL(phoneURL);
              }}
            >
              <Icon name="call" size={24} color="#11A" />
            </TouchableHighlight>

            {/* Chat icon */}
            <TouchableHighlight
              style={styles.iconButton}
              onPress={() => props.navigation.navigate("Chat", { currentid: currentUserId, secondid: item.id })}
            >
              <Icon name="chatbubbles" size={24} color="#11A" />
            </TouchableHighlight>
          </View>
        )}
        style={styles.list}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 60,
    fontSize: 32,
    color: "#11A",
    fontWeight: "bold",
  },
  list: {
    backgroundColor: "#0004",
    width: "98%",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
    margin: 3,
    borderRadius: 5,
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  pseudo: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
  iconButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 50,
    backgroundColor: "transparent",
  },
});
