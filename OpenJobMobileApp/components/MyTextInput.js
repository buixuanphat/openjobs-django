import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Icon } from "react-native-paper"
import MyColor from "../utils/MyColor"
import { useState } from "react"

const MyTextInput = ({ icon, placeholder, secure, value, onChangeText, background }) => {

    const [isSecure, setIsSecure] = useState(true)

    const Styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            backgroundColor: background || MyColor.background,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: MyColor.greyLight,
            alignItems: 'center',
            gap: 4,
            padding: 4
        },
        input:
        {
            flex: 1
        }
    })

    return (
        <View style={Styles.container} >
            {secure &&
                <TouchableOpacity onPress={() => setIsSecure(!isSecure)} >
                    <Icon size={24} source={isSecure == true ? 'lock' : 'lock-off'} />
                </TouchableOpacity>
            }
            {icon && <Icon size={24} source={icon} />}
            {secure ? <TextInput secureTextEntry={isSecure} style={Styles.input} placeholder={placeholder} value={value} onChangeText={onChangeText} /> :
                <TextInput style={Styles.input} placeholder={placeholder} value={value} onChangeText={onChangeText} />
            }
        </View>
    )
}

export default MyTextInput