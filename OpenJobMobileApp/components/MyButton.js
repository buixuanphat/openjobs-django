import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Icon } from "react-native-paper"
import MyColor from "../utils/MyColor"

const MyButton = ({ icon, label, labelColor, backGroundColor, borderColor, iconColor, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: 'row',
                gap: 8,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 8,
                borderRadius: 8,
                backgroundColor: backGroundColor || MyColor.primary,
                borderColor: borderColor || MyColor.primary,
                borderWidth: 1
            }}>
            <Icon color={iconColor || 'white'} size={24} source={icon} />
            <Text style={{
                fontSize: 18,
                fontWeight: 700,
                color: labelColor || 'white'
            }}>
                {label}
            </Text>
        </TouchableOpacity>
    )
}
export default MyButton