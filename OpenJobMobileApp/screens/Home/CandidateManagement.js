import { useContext, useEffect, useState } from "react"
import { FlatList, View } from "react-native"
import { MyTokenContext } from "../../utils/MyContexts"
import { authApis, endpoints } from "../../utils/Apis"
import EmploymentItem from "../../components/EmploymentItem"

const CandidateManagement = () => {
    const [employments, setEmployments] = useState([])

    const [token] = useContext(MyTokenContext)

    const loadEmployments = async () => {
        try {
            let res = await authApis(token).get(endpoints['getMyCandidate'])
            setEmployments(res.data)
        }
        catch (e) {
            console.log("Lỗi khi tải candidate")
        }
    }

    useEffect(() => {
        loadEmployments()
    }, [])

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
export default CandidateManagement