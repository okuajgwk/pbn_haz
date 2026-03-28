import {
  arrayUnion,
  collection,
  doc, getDoc,
  getDocs,
  query,
  setDoc, updateDoc,
  where
} from 'firebase/firestore';


import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

// Culorile disponibile pentru echipe — atribuite automat în ordine
const TEAM_COLORS = ['#ff00ff', '#00ffff', '#ff3366', '#ffff00', '#00ff88', '#ff6600'];

// Generează un cod de invitație de 5 caractere (ex: "XK93P")
const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
};

// Alege o culoare automată pe baza timestamp-ului
const pickColor = (): string => {
  return TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
};

// ============================================================
// TIPURI — ce forme au datele noastre
// ============================================================

interface Team {
  name: string;
  color: string;
  leaderId: string;
  inviteCode: string;
  members: string[];
}

// ============================================================
// COMPONENTA PRINCIPALĂ
// ============================================================

export default function TeamScreen() {
  // "loading" = verificăm dacă userul e deja într-o echipă
  const [loading, setLoading] = useState(true);
  // "team" = datele echipei dacă există, null dacă nu
  const [team, setTeam] = useState<Team | null>(null);
  // "teamName" = ce scrie userul în input când creează echipă
  const [teamName, setTeamName] = useState('');
  // "creating" = dezactivăm butonul cât așteptăm Firestore
  const [creating, setCreating] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const user = auth.currentUser;

  // ============================================================
  // LA MONTARE — verificăm dacă userul e deja într-o echipă
  // ============================================================

  useEffect(() => {
    if (!user) return;
    checkUserTeam();
  }, []);

  const checkUserTeam = async () => {
    if (!user) return;

    try {
      // Citim documentul userului din Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists() && userDoc.data().teamId) {
        // Userul are un teamId — citim și datele echipei
        const teamId = userDoc.data().teamId;
        const teamDoc = await getDoc(doc(db, 'teams', teamId));

        if (teamDoc.exists()) {
          setTeam(teamDoc.data() as Team);
        }
      }
      // Dacă nu are teamId, team rămâne null și afișăm formularul
    } catch (error) {
      console.error('Eroare la citirea echipei:', error);
    } finally {
      // Indiferent de rezultat, oprim loading-ul
      setLoading(false);
    }
  };

  // ============================================================
  // CREARE ECHIPĂ
  // ============================================================

  const handleCreateTeam = async () => {
    if (!user) return;

    if (teamName.trim().length < 3) {
      Alert.alert('Eroare', 'Numele echipei trebuie să aibă cel puțin 3 caractere.');
      return;
    }

    setCreating(true);

    try {
      const teamRef = doc(collection(db, 'teams'));
      const teamId = teamRef.id;
      const inviteCode = generateInviteCode();
      const color = pickColor();

      const newTeam: Team = {
        name: teamName.trim(),
        color,
        leaderId: user.uid,
        inviteCode,
        members: [user.uid],
      };

      // Pasul 1 — Creăm documentul echipei în colecția "teams"
      await setDoc(teamRef, newTeam);

      // Pasul 2 — Salvăm teamId pe documentul userului
      // setDoc cu merge:true creează documentul dacă nu există
      await setDoc(
        doc(db, 'users', user.uid),
        { email: user.email, teamId },
        { merge: true }  // nu suprascrie alte câmpuri existente
      );

      // Actualizăm starea locală — ecranul se va re-randa cu datele echipei
      setTeam(newTeam);
    } catch (error: any) {
      Alert.alert('Eroare', 'Nu am putut crea echipa: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

    const handleJoinTeam = async () => {
  if (!user) return;

  if (inviteCode.trim().length < 5) {
    Alert.alert('Eroare', 'Codul de invitație trebuie să aibă 5 caractere.');
    return;
  }

  setJoining(true);

  try {
    // Căutăm echipa cu codul introdus
    // const { collection, query, where, getDocs } = await import('firebase/firestore');
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('inviteCode', '==', inviteCode.trim().toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      Alert.alert('Eroare', 'Cod de invitație invalid. Verifică și încearcă din nou.');
      setJoining(false);
      return;
    }

    // Am găsit echipa
    const teamDoc = snapshot.docs[0];
    const teamId = teamDoc.id;
    const teamData = teamDoc.data() as Team;

    // Verificăm dacă e deja membru
    if (teamData.members.includes(user.uid)) {
      Alert.alert('Info', 'Ești deja în această echipă.');
      setJoining(false);
      return;
    }

    // Pasul 1 — Adăugăm userul în members[] pe echipă
    await updateDoc(doc(db, 'teams', teamId), {
      members: arrayUnion(user.uid),
    });

    // Pasul 2 — Salvăm teamId pe documentul userului
    await setDoc(
      doc(db, 'users', user.uid),
      { email: user.email, teamId },
      { merge: true }
    );

    // Actualizăm starea locală cu echipa găsită
    setTeam({
      ...teamData,
      members: [...teamData.members, user.uid],
    });

  } catch (error: any) {
    console.error('Eroare join echipă:', error);
    Alert.alert('Eroare', error.message);
  } finally {
    setJoining(false);
  }
};

  // ============================================================
  // RANDARE — 3 stări
  // ============================================================

  // Starea 1: Loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#00ffff" size="large" />
      </View>
    );
  }

  // Starea 3: Userul e deja în echipă
  if (team) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>ECHIPA TA</Text>
        <Text style={[styles.teamName, { color: team.color }]}>{team.name}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>COD DE INVITAȚIE</Text>
          <Text style={styles.inviteCode}>{team.inviteCode}</Text>
          <Text style={styles.infoHint}>Trimite acest cod coechipierilor tăi</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>MEMBRI ({team.members.length})</Text>
          {team.members.map((memberId) => (
            <Text key={memberId} style={styles.memberItem}>
              • {memberId === user?.uid ? 'Tu (lider)' : memberId}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  return (
  <View style={styles.container}>

    {/* Formularul de CREARE — era deja aici */}
    <Text style={styles.label}>NICIO ECHIPĂ</Text>
    <Text style={styles.subtitle}>Creează o echipă nouă sau alătură-te uneia existente.</Text>

    <TextInput
      style={styles.input}
      placeholder="Numele echipei..."
      placeholderTextColor="#555"
      value={teamName}
      onChangeText={setTeamName}
      maxLength={20}
    />

    <TouchableOpacity
      style={[styles.button, creating && styles.buttonDisabled]}
      onPress={handleCreateTeam}
      disabled={creating}
    >
      <Text style={styles.buttonText}>
        {creating ? 'SE CREEAZĂ...' : 'CREEAZĂ ECHIPĂ'}
      </Text>
    </TouchableOpacity>

    {/* Separator */}
    <View style={styles.separator}>
      <View style={styles.separatorLine} />
      <Text style={styles.separatorText}>SAU</Text>
      <View style={styles.separatorLine} />
    </View>

    {/* Formularul de JOIN — nou */}
    <Text style={styles.label}>AI DEJA UN COD?</Text>

    <TextInput
      style={styles.input}
      placeholder="Introdu codul (ex: XK93P)"
      placeholderTextColor="#555"
      value={inviteCode}
      onChangeText={setInviteCode}
      maxLength={5}
      autoCapitalize="characters"
    />

    <TouchableOpacity
      style={[styles.button, { borderColor: '#ff00ff' }, joining && styles.buttonDisabled]}
      onPress={handleJoinTeam}
      disabled={joining}
    >
      <Text style={[styles.buttonText, { color: '#ff00ff' }]}>
        {joining ? 'SE VERIFICĂ...' : 'ALĂTURĂ-TE ECHIPEI'}
      </Text>
    </TouchableOpacity>

  </View>
);

}

// ============================================================
// STILURI
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 24,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#555',
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 30,
  },
  subtitle: {
    color: '#555',
    fontSize: 14,
    marginBottom: 30,
    lineHeight: 20,
  },
  input: {
    height: 55,
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  button: {
    borderWidth: 2,
    borderColor: '#00ffff',
    paddingVertical: 15,
    alignItems: 'center',
    transform: [{ skewX: '-10deg' }],
  },
  buttonDisabled: {
    borderColor: '#333',
  },
  buttonText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  infoCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  infoLabel: {
    color: '#555',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
  },
  inviteCode: {
    color: '#00ffff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  infoHint: {
    color: '#555',
    fontSize: 12,
  },
  memberItem: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  separator: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 24,
},
separatorLine: {
  flex: 1,
  height: 1,
  backgroundColor: '#222',
},
separatorText: {
  color: '#555',
  fontSize: 12,
  letterSpacing: 2,
  marginHorizontal: 12,
},
});