import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, ImageBackground, TouchableOpacity, Modal, Button } from 'react-native';
import firebase from "../../Config";
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Forums(props) {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState('');
  const [newMember, setNewMember] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const groupsRef = firebase.database().ref('groups');
    groupsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const loadedGroups = [];
      for (let key in data) {
        loadedGroups.push({
          id: key,
          name: data[key].name,
        });
      }
      setGroups(loadedGroups);
      console.log('Loaded groups:', loadedGroups); // Debug: Verify groups
    });
    return () => groupsRef.off('value');
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      const membersRef = firebase.database().ref(`groups/${selectedGroup}/members`);
      membersRef.on('value', (snapshot) => {
        const membersData = snapshot.val();
        const membersList = membersData
          ? Object.keys(membersData).map((key) => ({
              id: key,
              name: membersData[key],
            }))
          : [];
        setGroupMembers(membersList);
        console.log('Group members:', membersList); // Debug: Verify members
      });

      return () => membersRef.off('value');
    }
  }, [selectedGroup]);

  const addGroup = () => {
    if (newGroup.trim() !== '') {
      const groupsRef = firebase.database().ref('groups');
      const newGroupRef = groupsRef.push();
      newGroupRef.set({ name: newGroup })
        .then(() => {
          setNewGroup('');
          Alert.alert('Groupe ajouté', `Le groupe ${newGroup} a été créé.`);
        })
        .catch((error) => console.log('Erreur lors de l\'ajout du groupe : ', error));
    } else {
      Alert.alert('Erreur', 'Veuillez entrer un nom valide pour le groupe.');
    }
  };

  const addMemberToGroup = () => {
    if (selectedGroup && newMember.trim() !== '') {
      firebase
        .database()
        .ref(`groups/${selectedGroup}/members`)
        .push(newMember)
        .then(() => {
          setNewMember('');
          Alert.alert('Membre ajouté', `Le membre ${newMember} a été ajouté au groupe.`);
        })
        .catch((error) => console.log('Erreur lors de l\'ajout du membre : ', error));
    } else {
      Alert.alert('Erreur', 'Veuillez entrer un nom valide pour le membre.');
    }
  };

  const deleteGroup = (groupId) => {
    Alert.alert("Confirmation", "Supprimer ce groupe ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          firebase.database().ref(`groups/${groupId}`).remove();
        },
      },
    ]);
  };

  const deleteMember = (memberId, memberName) => {
    Alert.alert("Confirmation", `Supprimer ${memberName} du groupe ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          firebase.database().ref(`groups/${selectedGroup}/members/${memberId}`).remove();
        },
      },
    ]);
  };

  const startEditGroup = (group) => {
    setEditingGroup(group);
    setEditName(group.name);
  };

  const confirmEditGroup = () => {
    if (editName.trim() !== '') {
      firebase.database().ref(`groups/${editingGroup.id}`).update({ name: editName })
        .then(() => {
          setEditingGroup(null);
          setEditName('');
        });
    }
  };

  const finishAddingMembers = () => {
    setSelectedGroup(null);
    setNewMember('');
    setGroupMembers([]);
  };

  const goToChatGroup = (groupId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const currentid = currentUser ? currentUser.uid : null;

    if (!currentid) {
      Alert.alert('Erreur', 'Utilisateur non authentifié.');
      return;
    }

    console.log('Navigating to ChatGroup with groupId:', groupId, 'currentid:', currentid);
    props.navigation.navigate('ChatGroup', {
      groupId,
      currentid
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/back1.jpg")}
      style={styles.container}
    >
      <Text style={styles.title}>List Of Groups</Text>

      <View style={styles.addGroupContainer}>
        <TextInput
          style={styles.groupInput}
          placeholder="Add New Group"
          value={newGroup}
          onChangeText={setNewGroup}
        />
        <TouchableOpacity onPress={addGroup} style={styles.iconButton}>
          <Icon name="plus-circle" size={30} color="#28a745" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <TouchableOpacity onPress={() => goToChatGroup(item.id)}>
              <Text style={styles.groupName}>{item.name}</Text>
            </TouchableOpacity>
            <View style={styles.groupActions}>
              <TouchableOpacity onPress={() => setSelectedGroup(item.id)} style={styles.iconButton}>
                <Icon name="user" size={20} color="#9866C7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => startEditGroup(item)} style={styles.iconButton}>
                <Icon name="edit" size={20} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteGroup(item.id)} style={styles.iconButton}>
                <Icon name="trash" size={20} color="#C9184A" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {selectedGroup && (
        <View style={styles.formContainer}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Membres :</Text>
          {groupMembers.map((member) => (
            <View key={member.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <Text>{member.name}</Text>
              <TouchableOpacity onPress={() => deleteMember(member.id, member.name)}>
                <Icon name="trash" size={18} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Member's name"
            value={newMember}
            onChangeText={setNewMember}
          />
          <Button title="Add to the group" onPress={addMemberToGroup} color="#9866C7" />
          <Button title="Cancel" onPress={finishAddingMembers} color="#C9184A" />
        </View>
      )}

      <Modal visible={!!editingGroup} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit the groupe name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="New name"
            />
            <Button title="Save" color='#9866C7' onPress={confirmEditGroup} />
            <Button title="Cancel" color='#C9184A'  onPress={() => setEditingGroup(null)}  />
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#11A',
    marginTop: 50,
    fontSize: 32,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  iconButton: {
    paddingHorizontal: 8,
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  groupName: {
    fontSize: 16,
    color: '#11A',
    fontWeight: "bold",
  },
  groupActions: {
    flexDirection: 'row',
    gap: 10,
  },
  formContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  addGroupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  groupInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
});