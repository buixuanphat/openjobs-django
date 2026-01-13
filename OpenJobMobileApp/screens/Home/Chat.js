import { SafeAreaView } from "react-native-safe-area-context";
import { collection, addDoc, getDocs, onSnapshot, doc, getDoc, setDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../utils/MyContexts";
import { FlatList } from "react-native";
import ConversationItem from "../../components/ConversationItem";
import { useNavigation } from "@react-navigation/native";

const Chat = ({ route }) => {

    const [user] = useContext(MyUserContext)
    const [myConversations, setMyConversations] = useState([])
    const nav = useNavigation()

    // Thêm tin nhắn
    const createConversation = async (employer) => {
        try {
            if (!user?.id || !employer?.id) return;

            const conversationId = `${user.id}_${employer.id}`;

            const conversationRef = doc(db, "conversations", conversationId);
            const snap = await getDoc(conversationRef);

            if (!snap.exists()) {
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

                console.log("Tạo đoạn chat:", conversationId);
            } else {
                console.log("Đoạn chat đã tồn tại");
            }

            return conversationId;
        } catch (e) {
            console.log("Lỗi khi tạo đoạn chat:", e);
        }
    };




    useEffect(() => {
        if (route?.params?.employer) {
            createConversation(route.params.employer)
        }
    }, [])


    useEffect(() => {
        if (!user?.id) return;

        const q = query(
            collection(db, "conversations"),
            where("members", "array-contains", user.id),
            orderBy("updatedAt", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const conversations = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setMyConversations(conversations)
            console.log("Danh sách đoạn chat:", conversations);
        });

        return () => unsub();
    }, [user]);





    return (
        <SafeAreaView style={{ flex: 1 }}>
            <FlatList
                data={myConversations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <ConversationItem conversation={item} />}
            />
        </SafeAreaView>
    );
};

export default Chat;
