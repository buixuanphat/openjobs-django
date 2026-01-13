import { use, useContext, useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Alert } from "react-native";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";
import { Appbar, Button, Chip, Menu, TextInput } from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';
import MyTextInput from "../../components/MyTextInput"
import MyButton from "../../components/MyButton"
import MyColor from "../../utils/MyColor";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyTokenContext, MyUserContext } from "../../utils/MyContexts";

const PostJobs = ({ route }) => {
    const jobId = route.params?.jobId;

    const [job, setJob] = useState({ payment_type: 'monthly' });
    const [showDate, setShowDate] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showMenu, setShowMenu] = useState(false);
    const [workingTimes, setWorkingTimes] = useState([]);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDuration, setShowDuration] = useState(false)
    const nav = useNavigation();

    const token = useContext(MyTokenContext)
    const [user] = useContext(MyUserContext)

    useEffect(() => {
        const loadWorkingTimes = async () => {
            try {

                let res = await authApis(token).get(endpoints['getShifts']);
                console.log(res.data)
                setWorkingTimes(res.data);
            } catch (ex) {
                console.error("Lỗi lấy ca làm việc:", ex);
            }
        };
        loadWorkingTimes();
    }, []);

    const toggleTime = (timeId) => {
        if (selectedTimes.includes(timeId)) {
            setSelectedTimes(selectedTimes.filter(id => id !== timeId));
        } else {
            setSelectedTimes([...selectedTimes, timeId]);
        }
    };

    const update = (field, value) => {
        setJob(c => {
            return { ...c, [field]: value };
        });
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDate(false);
        if (selectedDate) {
            setDate(selectedDate);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            update("deadline", formattedDate);
        }
    };

    useEffect(() => {
        const loadJobDetails = async () => {
            if (jobId) {
                try {
                    setLoading(true);
                    let res = await Apis.get(endpoints['job-details'](jobId));
                    setJob(res.data);

                    if (res.data.deadline)
                        setDate(new Date(res.data.deadline));

                } catch (ex) {
                    console.error("Lỗi load chi tiết job:", ex);
                    Alert.alert("Lỗi", "Không thể lấy thông tin tin đăng cũ!");
                } finally {
                    setLoading(false);
                }
            }
        };
        loadJobDetails();
    }, [jobId]);

    const postJob = async () => {
        if (!job.name || !job.min_salary || !job.location || !job.deadline) {
            Alert.alert("Vui lòng nhập các trường bắt buộc!");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");

            // let res=await authApis(token).post(endpoints['jobs'],job);

            const dataToSend = {
                ...job,
                shifts: selectedTimes
            };
            console.log(dataToSend)

            let res;
            if (jobId) {
                res = await authApis(token).patch(endpoints['job-details'](jobId), dataToSend);
            } else {
                res = await authApis(token).post(endpoints['jobs'], dataToSend);
            }

            if (res.status === 201 || res.status === 200) {
                Alert.alert("Thông báo", jobId ? "Cập nhật thành công!" : "Tin tuyển dụng đã được đăng!");
                nav.navigate("MyJobs", { reload: true });
            }
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding" >
            <Appbar.Header style={styles.appbar}>
                <Appbar.Content title={jobId ? "Chỉnh sửa tin" : "Đăng tin mới"} titleStyle={styles.headerTitle} />
            </Appbar.Header>
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <TextInput
                    style={MyStyles.margin}
                    value={job.name}
                    mode="outlined"
                    onChangeText={t => update("name", t)}
                    label="Tiêu đề"
                />
                <TextInput
                    style={MyStyles.margin}
                    value={job.description}
                    mode="outlined"
                    onChangeText={t => update("description", t)}
                    label="Mô tả công việc"
                />
                <TextInput
                    style={MyStyles.margin}
                    value={job.skills}
                    mode="outlined"
                    onChangeText={t => update("skills", t)}
                    label="Kỹ năng"
                />
                <View style={MyStyles.margin}>
                    <TextInput
                        value={job.min_salary}
                        mode="outlined"
                        onChangeText={t => update("min_salary", t)}
                        label="Lương tối thiểu"
                    />
                    <TextInput
                        value={job.max_salary}
                        mode="outlined"
                        onChangeText={t => update("max_salary", t)}
                        label="Lương tối đa"
                    />
                </View>
                <TextInput
                    style={MyStyles.margin}
                    value={job.location}
                    mode="outlined"
                    onChangeText={t => update("location", t)}
                    label="Địa chỉ"
                />
                <TextInput
                    style={MyStyles.margin}
                    value={job.map_url}
                    mode="outlined"
                    onChangeText={t => update("map_url", t)}
                    label="Link Google Map"
                />
                <TouchableOpacity onPress={() => setShowDate(true)}>
                    <TextInput
                        label="Hạn nộp hồ sơ"
                        value={job.deadline || "Nhấn để chọn ngày"}
                        mode="outlined"
                        editable={false}
                        style={MyStyles.margin}
                        right={<TextInput.Icon icon="calendar" onPress={() => setShowDate(true)} />}
                    />
                </TouchableOpacity>
                {showDate && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={onChangeDate}
                    />
                )}


                {/* THỜI GIAN LÀM VIỆC */}
                <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Thời gian làm việc (Chọn các ca):</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 }}>
                    {workingTimes.map(t => (
                        <Chip
                            key={t.id}
                            style={{ margin: 2 }}
                            selected={selectedTimes.includes(t.id)}
                            onPress={() => toggleTime(t.id)}
                            icon={selectedTimes.includes(t.id) ? "check" : "clock"}
                        >
                            {t.name} ({t.start_time.substring(0, 5)} - {t.end_time.substring(0, 5)})
                        </Chip>
                    ))}
                </View>




                <Menu
                    visible={showMenu}
                    onDismiss={() => setShowMenu(false)}
                    anchor={
                        <TouchableOpacity onPress={() => setShowMenu(true)}>
                            <TextInput
                                label="Hình thức trả lương *"
                                value={job.payment_type === 'monthly' ? 'Theo tháng' :
                                    job.payment_type === 'weekly' ? 'Theo tuần' : 'Theo giờ'}
                                mode="outlined"
                                editable={false}
                                style={MyStyles.margin}
                                right={<TextInput.Icon icon="chevron-down" onPress={() => setShowMenu(true)} />}
                            />
                        </TouchableOpacity>
                    }
                >
                    <Menu.Item onPress={() => { update("payment_type", "hourly"); setShowMenu(false); }} title="Theo giờ" />
                    <Menu.Item onPress={() => { update("payment_type", "weekly"); setShowMenu(false); }} title="Theo tuần" />
                    <Menu.Item onPress={() => { update("payment_type", "monthly"); setShowMenu(false); }} title="Theo tháng" />
                </Menu>

                <Menu
                    visible={showDuration}
                    onDismiss={() => setShowDuration(false)}
                    anchor={
                        <TouchableOpacity onPress={() => setShowDuration(true)}>
                            <TextInput
                                value={job.duration}
                                label="Thời hạn hợp đồng"
                                mode="outlined"
                                editable={false}
                                style={MyStyles.margin}
                                right={<TextInput.Icon icon="chevron-down" onPress={() => setShowDuration(true)} />}
                            />
                        </TouchableOpacity>
                    }
                >
                    <Menu.Item onPress={() => { update("duration", "1_month"); setShowDuration(false); }} title="Một tháng" />
                    <Menu.Item onPress={() => { update("duration", "2_month"); setShowDuration(false); }} title="Ba tháng" />
                    <Menu.Item onPress={() => { update("duration", "3_month"); setShowDuration(false); }} title="Sáu tháng" />
                    <Menu.Item onPress={() => { update("duration", "1_year"); setShowDuration(false); }} title="Một năm" />
                    <Menu.Item onPress={() => { update("duration", "2_year"); setShowDuration(false); }} title="Hai năm" />
                </Menu>
            </ScrollView>
            <View style={styles.buttonContainer} >
                <MyButton label='Đăng' icon='upload' onPress={postJob} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container:
    {
        backgroundColor: MyColor.background,
        flex: 1,
    },
    formContainer:
    {
        flex: 1,
        padding: 16
    },
    buttonContainer:
    {
        marginVertical: 8,
        marginHorizontal: 16
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a'
    },
    appbar: {
        backgroundColor: '#fff',
    },
})

export default PostJobs;