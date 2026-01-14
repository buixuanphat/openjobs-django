import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import MyText from '../components/MyText'
import MyButton from '../components/MyButton'
import { useContext, useState } from "react"
import { Avatar, Button, Dialog, Modal, Portal } from "react-native-paper"
import MyTextInput from '../components/MyTextInput'
import { Rating } from "react-native-ratings"
import { authApis, endpoints } from "../utils/Apis"
import { MyTokenContext, MyUserContext } from "../utils/MyContexts"
import MyColor from "../utils/MyColor"

const EmploymentItem = ({ employment, reload }) => {

    const [showModel, setShowModel] = useState(false)
    const [content, setContent] = useState('')
    const [rating, setRating] = useState(5)
    const [token] = useContext(MyTokenContext)
    const [user] = useContext(MyUserContext)
    const [showTeminatedDialog, setShowTeminatedDialog] = useState(false)

    const rate = async () => {
        let data = {
            "job": employment.job.id,
            "rating": rating,
            "content": content
        }
        try {
            let res = authApis(token).post(endpoints['appreciations'], data)
            setShowModel(false)
            reload()
        }
        catch (e) {
            console.log("Lỗi khi tạo đánh giá", e)
        }
    }


    const terminate = async () => {
        try {
            let res = await authApis(token).patch(endpoints['terminate'](employment.id))
            reload()
        }
        catch (e) {
            console.log("Lỗi khi kết thúc hợp đồng: ", e)
        }
    }

    return (
        <View style={styles.container} >
            <View style={{ flexDirection: 'row', gap: 8 }} >
                <Avatar.Image source={{ uri: employment.user.avatar }} />
                <View style={{ justifyContent: 'center' }} >
                    <Text style={{ fontWeight: 700 }} >{employment.user.last_name} {employment.user.first_name}</Text>
                    <Text style={{ color: MyColor.darkGrey }} >{employment.user.email}</Text>
                    <Text>{employment.job.name}</Text>
                </View>
            </View>

            <MyText backgroundColor='white' label={`Ngày bắt đầu làm việc: ${employment.start_date}`} />
            <MyText backgroundColor='white' label={`Ngày hết hạn hợp đồng: ${employment.end_date}`} />
            {(employment.status == 'terminated' || Date.now() > new Date(employment.end_date).getTime()) &&
                <View style={{ padding: 8, backgroundColor: MyColor.red50, borderRadius: 8 , width:100}}>
                    <Text style={{color:MyColor.redError, textAlign:'center'}} >Đã kết thúc</Text>
                </View>
            }
            {(employment.status == 'terminated' || Date.now() > new Date(employment.end_date).getTime()) && employment.is_rating == false && user.role == 'candidate' &&
                <MyButton onPress={() => setShowModel(true)} label="Đánh giá" />
            }

            {employment.status == 'active' && Date.now() < new Date(employment.end_date).getTime() && user.role == 'employer' &&
                <MyButton onPress={() => setShowTeminatedDialog(true)} labelColor={MyColor.red} borderColor={MyColor.red} backGroundColor={MyColor.red50} label="Kết thúc hợp đồng" />
            }

            <Portal>
                <Modal visible={showModel} onDismiss={() => setShowModel(false)} contentContainerStyle={null}>
                    <View style={styles.modelContainer}>
                        <Text style={styles.label} >Đánh giá công việc</Text>
                        <Rating
                            type="star"
                            ratingCount={5}
                            imageSize={24}
                            startingValue={rating}
                            onFinishRating={setRating}
                            fractions={1}
                        />
                        <MyTextInput onChangeText={setContent} placeholder="Bạn cảm thấy công việc này thế nào" />
                        <MyButton icon='send' label="Gửi" onPress={rate} />
                    </View>
                </Modal>
            </Portal>

            <Portal>
                <Dialog visible={showTeminatedDialog} onDismiss={() => setShowTeminatedDialog(false)}>
                    <Dialog.Title>Thông báo</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Bạn chắn chắn muốn kết thúc hợp đồng với nhân viên này</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setShowTeminatedDialog(false)
                            terminate()
                        }}
                        >Xác nhận</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
}
const styles = StyleSheet.create({
    modelContainer:
    {
        margin: 16,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        gap: 8
    },
    label:
    {
        fontSize: 18,
        fontWeight: 700,
        textAlign: 'center'
    },
    container:
    {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        padding: 8
    }
})
export default EmploymentItem