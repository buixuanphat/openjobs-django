import { useContext } from "react"
import { Text, View } from "react-native"
import { MyUserContext } from "../utils/MyContexts"
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const MessageItem = ({ message }) => {

    const [user] = useContext(MyUserContext)

    return (
        <View style={{ marginHorizontal: 16, marginVertical: 8, alignItems: message.senderId === user.id ? 'flex-end' : 'flex-start' }}>
            <View style={{ maxWidth: screenWidth * 0.7, backgroundColor: 'white', borderRadius: 100, padding: 12, }} >
                <Text>{message.text}</Text>
            </View>

        </View>
    )
}
export default MessageItem