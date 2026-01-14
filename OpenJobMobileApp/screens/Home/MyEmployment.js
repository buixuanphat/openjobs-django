import { useContext, useEffect, useState } from "react"
import { FlatList, Text, View } from "react-native"
import { MyTokenContext } from "../../utils/MyContexts"
import { authApis, endpoints } from "../../utils/Apis"
import EmploymentItem from "../../components/EmploymentItem"

const MyEmployment = () => {
    const [token] = useContext(MyTokenContext)

    const [employments, setEmloyments] = useState([])

    const loadEmployments = async () => {
        try {
            let res = await authApis(token).get(endpoints['employments'])
            setEmloyments(res.data)
        }
        catch (e) {
            console.log("Lỗi khi load my employment", e)
        }
    }

    useEffect(() => {
        loadEmployments()
    }, [token])

    return (
        <View>
            <FlatList
                data={employments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <EmploymentItem employment={item} reload={loadEmployments} />}
            />
        </View>
    )
}
export default MyEmployment