import { useContext, useEffect, useState } from "react"
import { FlatList, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity } from "react-native"
import { Appbar, Avatar, Icon } from "react-native-paper"
import { MyUserContext } from "../../utils/MyContexts"
import { addDoc, collection, doc, updateDoc, serverTimestamp, query, orderBy, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { View } from "react-native";
import MyTextInput from "../../components/MyTextInput";
import { db } from "../../utils/firebaseConfig";
import MyColor from "../../utils/MyColor";
import MessageItem from "../../components/MessageItem";
import MyIndicator from "../../components/MyIndicator";


const ChatDetails = ({ route }) => {

    const [user] = useContext(MyUserContext)

    const [conversation, setConversation] = useState(route?.params?.conversation)
    const [employer, setEmployer] = useState(route?.params?.employer)

    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])

    const [loading, setLoading] = useState(false)
    const [isFirsts, setIsFirst] = useState(true)

    let conversationId = conversation? conversation.id : `${user.id}_${employer.id}`


    const createConversation = async (employer) => {
        try {
            if (!user?.id || !employer?.id) return;

            const conversationRef = doc(db, "conversations", conversationId);

            await setDoc(conversationRef, {
                candidate: user.id,
                employer: employer.id,
                members: [user.id, employer.id],
                candidateAvatar: user.avatar,
                employerLogo: employer.logo,
                candidateName: user.first_name,
                employerName: employer.name,
                lastMessage: "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

        } catch (e) {
            console.log("Lỗi khi tạo đoạn chat:", e);
        }
    };



    const sendMessage = async () => {

        if (!conversation) await createConversation(employer)

        if (!message.trim()) return;
        setMessage("")
        try {
            await addDoc(
                collection(db, "conversations", conversationId, "messages"),
                {
                    senderId: user.id,
                    text: message,
                    createdAt: serverTimestamp(),
                }
            );
            await updateDoc(
                doc(db, "conversations", conversationId),
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
       if(!user) return

        setLoading(true);

        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsub = onSnapshot(
            q,
            (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMessages(msgs);
                setLoading(false);
                setIsFirst(false);
            },
            (error) => {
                console.error("Lỗi load messages:", error);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [conversationId]);



    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <Appbar.Header style={styles.appbar} >
                {conversation ?
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }} >
                        <Avatar.Image size={50} source={{ uri: user?.role == 'employer' ? conversation.candidateAvatar : conversation.employerLogo }} />
                        <View style={{ flex: 1 }} >
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>{user?.role == 'employer' ? conversation.candidateName : conversation.employerName}</Text>
                        </View>
                    </View>
                    :
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }} >
                        <Avatar.Image size={50} source={{ uri: employer.logo }} />
                        <View style={{ flex: 1 }} >
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>{employer.name}</Text>
                        </View>
                    </View>
                }

            </Appbar.Header>
            <FlatList style={styles.chatsContainer}
                ListHeaderComponent={loading && <MyIndicator />}
                contentContainerStyle={{ flex: 1 }}
                ListEmptyComponent={
                    !loading &&
                    <View style={styles.full} >
                        <Text style={styles.headerTitle}>Hãy bắt đầu cuộc trò chuyện</Text>
                    </View>}
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
    full:
    {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
export default ChatDetails