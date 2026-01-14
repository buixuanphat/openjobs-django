import { SafeAreaView } from "react-native-safe-area-context";
import { collection, addDoc, getDocs, onSnapshot, doc, getDoc, setDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../utils/MyContexts";
import { FlatList } from "react-native";
import ConversationItem from "../../components/ConversationItem";
import { useNavigation } from "@react-navigation/native";
import Empty from "../../components/Empty";
import { View } from "react-native";
import MyIndicator from "../../components/MyIndicator";

const Chat = ({ route }) => {

    const [user] = useContext(MyUserContext)
    const [myConversations, setMyConversations] = useState([])
    const nav = useNavigation()
    const [loading, setLoading] = useState(false)
    const [isFirsts, setIsFirst] = useState(true)





    useEffect(() => {
        if (!user?.id) return;
        if (isFirsts)
            setLoading(true)
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
            setLoading(false)
            setIsFirst(false)
            console.log("Danh sách đoạn chat:", conversations);
        },

            (error) => {
                console.error("Lỗi load conversations:", error);
                setLoading(false);
            });

        return () => unsub();
    }, [user]);





    return (
        <View style={{ flex: 1 }}>
            <FlatList
                ListHeaderComponent={loading && <MyIndicator />}
                ListEmptyComponent={!loading && <Empty />}
                data={myConversations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <ConversationItem conversation={item} />}
            />
        </View>
    );
};

export default Chat;
