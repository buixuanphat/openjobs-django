import { ActivityIndicator } from "react-native-paper"
import MyColor from '../utils/MyColor'

const MyIndicator = () => {
    return (
        <ActivityIndicator size='large' color={MyColor.primary} />
    )
}
export default MyIndicator