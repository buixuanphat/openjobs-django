import { Text, View } from "react-native"
import MyColor from "../utils/MyColor"

const MyText = ({ label, size, color, backgroundColor }) => {
    return (
        <View style={{ backgroundColor: backgroundColor || MyColor.background, borderRadius: 8, padding: 8 }} >
            <Text style={{ fontSize: size || 16, color: color || 'black' }} >{label}</Text>
        </View>
    )
}
export default MyText