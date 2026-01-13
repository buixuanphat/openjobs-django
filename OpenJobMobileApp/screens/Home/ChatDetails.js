import { useContext, useEffect, useState } from "react"
import { FlatList, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity } from "react-native"
import { Appbar, Avatar, Icon } from "react-native-paper"
import { MyUserContext } from "../../utils/MyContexts"
import { addDoc, collection, doc, updateDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { View } from "react-native";
import MyTextInput from "../../components/MyTextInput";
import { db } from "../../utils/firebaseConfig";
import MyColor from "../../utils/MyColor";
import MessageItem from "../../components/MessageItem";


const ChatDetails = ({ route }) => {

    const [user] = useContext(MyUserContext)
    let conversation = route?.params?.conversation
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])



    const sendMessage = async () => {
        if (!message.trim()) return;
        setMessage("")
        try {
            await addDoc(
                collection(db, "conversations", conversation.id, "messages"),
                {
                    senderId: user.id,
                    text: message,
                    createdAt: serverTimestamp(),
                }
            );
            await updateDoc(
                doc(db, "conversations", conversation.id),
                {
                    lastMessage: message,
                    updatedAt: serverTimestamp(),
                }
            );

        } catch (e) {
            console.log("Gửi tin nhắn lỗi:", e);
        }
    };


    useEffect(() => {
        if (!conversation) return;

        const q = query(
            collection(db, "conversations", conversation.id, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setMessages(msgs);
            console.log("Danh sách tin nhắn nè: ", msgs)
        });

        return () => unsub();
    }, [conversation]);


    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <Appbar.Header style={styles.appbar} >
                <Avatar.Image size={50} source={{ uri: user.role == 'employer' ? conversation.candidateAvatar : conversation.employerLogo }} />
                <View style={{ flex: 1 }} >
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>{user.role == 'employer' ? conversation.candidateName : conversation.employerName}</Text>
                </View>
            </Appbar.Header>
            <FlatList style={styles.chatsContainer}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <MessageItem message={item} />}
            />
            <View style={styles.inputContainer} >
                <View style={{ flex: 1 }}>
                    <MyTextInput value={message} placeholder="Nhập nội dung tin nhắn" onChangeText={(value) => setMessage(value)} />
                </View>
                <TouchableOpacity onPress={sendMessage} >
                    <Icon color={MyColor.primary} source='send' size={24} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>

    )
}
const styles = StyleSheet.create({
    container:
    {
        flex: 1
    },
    inputContainer:
    {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 4,
        gap: 8,
        alignItems: 'center'
    },
    chatsContainer:
    {
        flex: 1
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a'
    },
    appbar: {
        backgroundColor: '#fff',
        margin: 8,
        gap: 8,
        elevation: 4
    },
})
export default ChatDetails