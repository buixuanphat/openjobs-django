import { Text, View } from "react-native"
import { Avatar } from "react-native-paper"
import { Rating } from "react-native-ratings"

const RatingItem = ({ rating }) => {
    return (
        <View style={{ marginHorizontal: 16, marginVertical: 8, backgroundColor: 'white', padding: 8, borderRadius: 8, alignItems: 'flex-start', gap: 8 }} >
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }} >
                <Avatar.Image size={24} source={{ uri: rating.user.avatar }} />
                <Text style={{fontWeight:600}} >{rating.user.first_name}</Text>
            </View>
            <Rating
                type="star"
                ratingCount={5}
                imageSize={24}
                startingValue={rating.rating}
                readonly
            />
            <Text>{rating.content}</Text>
        </View>
    )
}
export default RatingItem