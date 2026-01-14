import { Text, View } from "react-native"
import MyColor from '../utils/MyColor'

const Empty = () => {
    return (
        <View style={{ padding: 16, borderRadius: 8, backgroundColor: MyColor.red50 }} >
            <Text style={{ color: { MyColor } }} >Không tìm thấy dữ liệu</Text>
        </View>
    )
}
export default Empty