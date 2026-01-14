import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { MyTokenContext } from "../../utils/MyContexts";
import ShiftItem from "../../components/ShiftItem";
import { authApis, endpoints } from "../../utils/Apis";
import MyButton from "../../components/MyButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Portal } from "react-native-paper";
import MyTextInput from "../../components/MyTextInput";
import MyText from "../../components/MyText";
import dayjs from "dayjs";

const Shift = () => {

    const [token] = useContext(MyTokenContext)
    const [shifts, setShifts] = useState([])
    const [startTime, setStartTime] = useState(new Date())
    const [endTime, setEndTime] = useState(new Date())
    const [showStartTime, setShowStartTime] = useState(false)
    const [showEndTime, setShowEndTime] = useState(false)
    const [showModel, setShowModel] = useState(false)
    const [name, setName] = useState('')


    const loadShifts = async () => {
        try {

            let res = await authApis(token).get(endpoints['getShifts']);
            console.log(res.data)
            setShifts(res.data);
        } catch (ex) {
            console.error("Lỗi lấy ca làm việc:", ex);
        }
    };

    const createShift = async () => {
        try {
            let res = await authApis(token).post(endpoints['createShift'], {
                "name": name,
                "start_time": dayjs(startTime).format("HH:mm"),
                "end_time": dayjs(endTime).format("HH:mm")
            })
            setShowModel(false)
            loadShifts()
        }
        catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        loadShifts()
    }, [])

    return (
        <View style={style.container} >
            <ScrollView style={style.shiftContainer} >
                {shifts && shifts.map((s) => <ShiftItem key={s.id} shift={s} />)}
            </ScrollView>

            <View>
                <MyButton label="Thêm" icon='plus' onPress={() => setShowModel(true)} />
            </View>


            <Portal>
                <Modal visible={showModel} onDismiss={() => setShowModel(false)}>
                    <View style={style.model}>
                        <Text style={style.title}>Thêm ca làm việc</Text>

                        <MyTextInput placeholder="Tên ca làm việc" onChangeText={(value) => setName(value)} />

                        <Text style={style.label} >Thời gian bắt đầu</Text>
                        <TouchableOpacity onPress={() => setShowStartTime(true)} >
                            <MyText label={dayjs(startTime).format("HH:mm")} />
                        </TouchableOpacity>

                        <Text style={style.label}>Thời gian kết thúc</Text>
                        <TouchableOpacity onPress={() => setShowEndTime(true)} >
                            <MyText label={dayjs(endTime).format("HH:mm")} />
                        </TouchableOpacity>

                        <View style={{ marginTop: 16 }} >
                            <MyButton label="Lưu" onPress={createShift} />
                        </View>



                        {showStartTime == true &&
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                is24Hour={true}
                                onChange={(e, value) => {
                                    setShowStartTime(false)
                                    value && setStartTime(value)
                                }}
                            />
                        }

                        {showEndTime == true &&
                            <DateTimePicker
                                value={endTime}
                                mode="time"
                                is24Hour={true}
                                onChange={(e, value) => {
                                    setShowEndTime(false)
                                    value && setEndTime(value)
                                }}
                            />
                        }
                    </View>
                </Modal>
            </Portal>

        </View>
    )
}

const style = StyleSheet.create({
    container:
    {
        marginHorizontal: 16,
        marginVertical: 8,
        flex: 1
    },
    shiftContainer:
    {
        flex: 1
    },
    model:
    {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        margin: 16,
    },
    title:
    {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 12
    },
    label:
    {
        marginBottom: 4,
        marginTop: 12
    }
})

export default Shift