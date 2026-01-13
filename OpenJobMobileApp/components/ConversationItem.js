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
            style={{ flex: 1, backgroundColor: 'white', flexDirection: 'row', padding: 8, gap: 16, justifyContent: 'center', alignItems: 'center' }} >
            <Avatar.Image source={{ uri: user?.role == 'employer' ? conversation.candidateAvatar : conversation.employerLogo }} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                <Text style={{ flex: 1, fontSize: 16, fontWeight: 600 }} numberOfLines={1} ellipsizeMode="tail" >{user?.role == 'employer' ? conversation.candidateName : conversation.employerName}</Text>
                <Text>{conversation.lastMessage}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default ConversationItem