import { useContext, useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { MyTokenContext } from "../../utils/MyContexts"
import { authApis, endpoints } from "../../utils/Apis"
import { FlatList, View } from "react-native"
import RatingItem from "../../components/RatingItem"

const EmployerRatings = ({ route }) => {

    const [token] = useContext(MyTokenContext)
    const [ratings, setRating] = useState([])
    const [loading, setLoading] = useState(false)


    const loadRatings = async () => {
        try {
            setLoading(true)
            let res = await authApis(token).get(endpoints['getAppreciation'](route.params.employerId))
            setRating(res.data)
        }
        catch (e) {
            console.log("Lỗi khi load EmployerRatings", e)
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRatings()
    }, [])

    return (
        <View>
            <FlatList
                data={ratings}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <RatingItem rating={item} />}
            />
        </View>
    )
}
export default EmployerRatings