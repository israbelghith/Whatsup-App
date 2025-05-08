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
import React, { useState } from 'react';
//import Settings from './Home/Settings'; // ou le chemin correct vers Settings


import firebase from "../Config";
const auth = firebase.auth();
const database=firebase.database();
const ref_database=database.ref();
const ref_listComptes=ref_database.child("ListComptes");

export default function NewAccount(props) {
  const [email, setemail] = useState();
  const [password, setpassword] = useState();
  const [confirmpassword, setconfirmpassword] = useState();
  return (
    <ImageBackground
      source={require("../assets/back1.jpg")}
      style={styles.container}
    >
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
        <Text
          style={{
            fontSize: 34,
            fontWeight: "bold",
            color: "purple",
          }}
        >
          Create New Account
        </Text>

        <TextInput
          onChangeText={(ch) => setemail(ch)}
          style={styles.input}
          placeholderTextColor={"white"}
          placeholder="email@gmail.com"
        ></TextInput>
        <TextInput
          onChangeText={(ch) => setpassword(ch)}
          style={styles.input}
          placeholderTextColor={"white"}
          placeholder="Confirm Password"
        ></TextInput>
        <TextInput
          onChangeText={(ch) => setconfirmpassword(ch)}
          style={styles.input}
          placeholderTextColor={"white"}
          placeholder="password"
        ></TextInput>

        <View style={{ flexDirection: "row", gap: 15 }}>
          <Button
            onPress={() => {
              props.navigation.goBack();
            }}
            title="Back"
            color="darkgrey"
          >
            {" "}
          </Button>
          <Button
            onPress={() => {
              if (password == confirmpassword) {
                auth.createUserWithEmailAndPassword(email,password).then(
                  (userCredential) => {
                    const currentUserId=auth.currentUserId.uid;

                    const ref_uncompte=ref_listComptes.child(currentUserId);
                    ref_uncompte.set({
                      id:currentUserId,
                      connected:true,
                    });
                    props.navigation.replace("Settings",{currentUserId})}
                ).catch((error)=>{alert(error)});
              } else {
                alert("verifier les motes de passe");
              }
            }}
            title="CREATE"
            color="lightblue"
          >
            {" "}
            CREATE
          </Button>
        </View>

        <Text
          style={{
            width: "100%",
            fontStyle: "italic",
            textAlign: "right",
            marginTop: 15,
            color: "#ccc",
            marginRight: 20,
          }}
        >
          don't have account
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
    backgroundColor: "lightpink",
  },
});
