import { StatusBar } from "expo-status-bar";
import {
  BackHandler,
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import firebase from "../Config";
import { useState } from "react";
const auth=firebase.auth();
const database=firebase.database();
const ref_database=database.ref();
const ref_listComptes=ref_database.child("ListComptes");
export default function Auth(props) {
  const [email, setEmail] = useState("Isra@gmail.com")//Isra@gmail.com
const [password, setPassword] = useState("123456")//123456
  return (
    <ImageBackground
      source={require("../assets/back1.jpg")}
      style={styles.container}
    >
      <Text
          style={{
           
            fontSize: 34,
            fontWeight: "bold",
            color: "purple",
            marginBottom:20
          }}
        >
          Welcome
        </Text>
      <View
        style={{
          width: "98%",
          height: 320,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0004",
          borderRadius: 20,
        }}
      >
        

        <TextInput
        onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor={"white"}
          placeholder="email@gmail.com"
        ></TextInput>
        <TextInput
        onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor={"white"}
          placeholder="password"
        ></TextInput>

        <View style={{ flexDirection: "row", gap: 15 }}>
          <Button
            onPress={() => {
              BackHandler.exitApp();
            }}
            title="Exit"
            color="darkgrey"
          >
            {" "}
            Connect
          </Button>
          <Button
            onPress={() => {
              auth
                .signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                  const currentUserId = auth.currentUser.uid;

                  const ref_uncompte=ref_listComptes.child(currentUserId);
                    ref_uncompte.update({
                      id:currentUserId,
                      connected:true,
                    });

                  props.navigation.navigate("Home", { currentUserId });
                })
                .catch((error) => {
                  alert(error);
                });
            }}
            title="connect"
            color="#0B6E"
          >
            {" "}
            Connect
          </Button>
        </View>

        <Text
          onPress={() => {
            props.navigation.navigate("NewAccount");
          }}
          style={{
            width: "100%",
            fontStyle: "italic",
            textAlign: "right",
            marginTop: 15,
            color: "#ccc",
            marginRight: 20,
          }}
        >
          Don't have account
        </Text>
      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}
//   <StatusBar style="auto" /> delet i f u want to excluded from screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center", //align horiz
    justifyContent: "center", // align vertical
  },
  input: {
    width: "98%",
    height: 50,
    marginBottom: 15,
    textAlign: "center",
    borderRadius: 4,
    backgroundColor: "#9E7BB5",
  },
});
