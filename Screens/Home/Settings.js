import React, { useEffect, useState } from "react";
import {
  Button,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";
import firebase from "../../Config";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../Config";

// Firebase setup
const database = firebase.database();
const ref_database = database.ref();
const ref_listComptes = ref_database.child("ListComptes");
const auth = firebase.auth();

export default function Settings(props) {
  const currentUserId = props.route.params.currentUserId;
  const ref_uncompte = ref_listComptes.child(currentUserId);

  const [pseudo, setPseudo] = useState("");
  const [numero, setNumero] = useState("");
  const [uriImage, seturiImage] = useState(null);

  // Fetch personal data
  useEffect(() => {
    const onValueChange = ref_uncompte.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNumero(data.numero || "");
        setPseudo(data.pseudo || "");
        seturiImage(data.urlimage || null);
      }
    });

    return () => {
      ref_uncompte.off("value", onValueChange);
    };
  }, []);

  // Upload image to storage
  async function uploadImage(file) {
    const fileExt = file.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `image/${fileName}`;

    const response = await fetch(file);
    const blob = await response.blob();
    const arraybuffer = await new Response(blob).arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("image")
      .upload(filePath, arraybuffer, { upsert: true });

    if (uploadError) {
      console.error("Erreur pendant l’upload:", uploadError.message);
      return null;
    }

    const { data: publicUrlData, error: publicUrlError } = supabase.storage
      .from("image")
      .getPublicUrl(filePath);

    if (publicUrlError) {
      console.error("Erreur pour obtenir l’URL publique:", publicUrlError.message);
      return null;
    }

    const imageUrl = `${publicUrlData.publicUrl}`;
    console.log("🆕 Nouvelle image URL:", imageUrl);
    return imageUrl;
  }

  // Pick an image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      seturiImage(result.assets[0].uri);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/back1.jpg")}
      style={styles.container}
    >
      <Text style={styles.title}>Settings</Text>

      <TouchableHighlight onPress={pickImage}>
        <Image
          source={uriImage ? { uri: uriImage } : require("../../assets/iconprofil.png")}
          style={styles.profileImage}
        />
      </TouchableHighlight>

      <TextInput
        onChangeText={setPseudo}
        value={pseudo}
        style={styles.input}
        placeholderTextColor={"white"}
        placeholder="le pseudo"
      />

      <TextInput
        onChangeText={setNumero}
        value={numero}
        style={styles.input}
        placeholderTextColor={"white"}
        placeholder="le numero"
      />
<View style={[styles.buttonContainer, { marginTop: 25 }]}>
      <Button 
        title="Submit"
        color='#02B126'
        onPress={async () => {
          const linkimage = uriImage ? await uploadImage(uriImage) : null;
          ref_uncompte.update({
            id: currentUserId,
            pseudo,
            numero,
            urlimage: linkimage,
          });
          alert("Données mises à jour !");
        }}
      />
</View>
      <View style={[styles.buttonContainer]}>
        <Button
          onPress={() => {
            auth.signOut().then(() => {
              // Mettre à jour le statut de l'utilisateur en "déconnecté"
              const ref_account = ref_listComptes.child(currentUserId);
              ref_account.update({
                connected: false, // Mettre à jour le champ connected
              })
              .then(() => {
                // Naviguer vers l'écran d'authentification après la mise à jour
                props.navigation.replace("Auth");
              })
              .catch((error) => {
                console.error("Erreur lors de la mise à jour du statut : ", error);
              });
            }).catch((error) => {
              console.error("Erreur lors de la déconnexion : ", error);
            });
          }}
          color="#C9184A"
          title="SignOut"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop:40,
    fontSize: 32,
    color: "#11A",
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileImage: {
    width: 250,
    height: 250,
    backgroundColor: "#0052",
    borderRadius: 40,
    marginBottom: 50,
  },
 input: {
    color: "white",
    borderWidth: 2,
    borderColor: "white",
    height: 50,
    width: "90%",
    backgroundColor: "#0007",
    marginBottom: 15,
    borderRadius: 15, // Increased for a more rounded look
    textAlign: "center",
    paddingHorizontal: 10, // Added for better text spacing
    fontSize: 16, // Ensure readable text
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
   buttonContainer: {
    width: "60%", // Match input width
    borderWidth: 2,
    borderColor: "white", // Match input border
    borderRadius: 15, // Match input rounded corners
    overflow: "hidden", // Ensure button corners are clipped to rounded container
    marginBottom: 15, // Match input spacing
  },
});
