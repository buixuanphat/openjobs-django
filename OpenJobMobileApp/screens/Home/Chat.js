import { SafeAreaView } from "react-native-safe-area-context";
import { collection, addDoc, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useEffect } from "react";

const Chat = () => {

    // Thêm tin nhắn
    const addUser = async () => {
        try {
            const res = await addDoc(collection(db, "users"), {
                name: "Phát",
                age: 21,
                createdAt: new Date(),
            });
            console.log("add ok:", res.id);
        } catch (e) {
            console.log("add lỗi:", e);
        }
    };

    // Lấy tin nhắn
    const getUsers = async () => {
        try {
            const snapshot = await getDocs(collection(db, "users"));
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            console.log("users:", users);
        } catch (e) {
            console.log("get lỗi:", e);
        }
    };


    // Cập nhật thay đổi
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "users"), snapshot => {
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            console.log(users);
        });

        return () => unsub();
    }, []);




    return (
        <SafeAreaView style={{ flex: 1 }}>
        </SafeAreaView>
    );
};

export default Chat;
