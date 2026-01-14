import { useContext } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { MyUserContext } from "../utils/MyContexts"
import { Avatar } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"

const ConversationItem = ({ conversation }) => {
    const [user] = useContext(MyUserContext)
    const nav = useNavigation()

    return (
        <TouchableOpacity
            onPress={() => nav.navigate("Home", {
                screen: "ChatDetails",
                params: { conversation: conversation }
            })}
            style={{ flex: 1, backgroundColor: 'white', flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 12, gap: 16, borderRadius: 16, marginHorizontal: 16, marginVertical: 8 }} >
            <Avatar.Image size={55} source={{ uri: user?.role == 'employer' ? conversation.candidateAvatar : conversation.employerLogo }} />
            <View style={{ flex: 1, justifyContent: 'center' }} >
                <Text style={{ fontSize: 16, fontWeight: 600 }} numberOfLines={1}>{user?.role == 'employer' ? conversation.candidateName : conversation.employerName}</Text>
                <Text>{conversation.lastMessage}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default ConversationItem