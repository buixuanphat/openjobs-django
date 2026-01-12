import { use, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Alert } from "react-native";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";
import { Button, Chip, Menu, TextInput } from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';

const PostJobs=({route})=>{
    const jobId = route.params?.jobId;

    const [job,setJob]=useState({payment_type: 'monthly'});
    const [showDate, setShowDate] = useState(false); 
    const [date, setDate] = useState(new Date());
    const [showMenu, setShowMenu] = useState(false);
    const [workingTimes, setWorkingTimes] = useState([]); 
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [loading,setLoading]=useState(false);
    const nav=useNavigation();

    useEffect(() => {
        const loadWorkingTimes = async () => {
            try {
                let res = await Apis.get(endpoints['working-times']); 
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

    const update=(field,value)=>{
        setJob(c=>{
            return {...c,[field]:value};
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

    useEffect(()=>{
        const loadJobDetails=async()=>{
            if(jobId){
                try {
                    setLoading(true);
                    let res=await Apis.get(endpoints['job-details'](jobId));
                    setJob(res.data);

                    if(res.data.deadline)
                        setDate(new Date(res.data.deadline));
            
                } catch (ex) {
                    console.error("Lỗi load chi tiết job:", ex);
                    Alert.alert("Lỗi", "Không thể lấy thông tin tin đăng cũ!");
                }finally{
                    setLoading(false);
                }
            }
        };
        loadJobDetails();
    },[jobId]);

    const postJob=async()=>{
        if(!job.name||!job.min_salary||!job.location||!job.deadline){
            Alert.alert("Vui lòng nhập các trường bắt buộc!");
            return;
        }

        setLoading(true);
        try {
            const token=await AsyncStorage.getItem("token");

            // let res=await authApis(token).post(endpoints['jobs'],job);
            const dataToSend = { 
            ...job, 
            working_time_ids: selectedTimes 
            };

            let res;
            if (jobId) {
                res = await authApis(token).patch(endpoints['job-details'](jobId),dataToSend);
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
        }finally{
            setLoading(false);
        }
    };

    return(
        <ScrollView style={MyStyles.padding}>
            <Text style={MyStyles.title}>{jobId ? "CHỈNH SỬA TIN" : "ĐĂNG TIN MỚI"}</Text>
            <TextInput 
                style={MyStyles.margin}
                value={job.name} 
                mode="outlined"
                onChangeText={t=>update("name",t)}
                label="Tiêu đề"
            />
            <TextInput
                style={MyStyles.margin}
                value={job.description}
                mode="outlined"
                onChangeText={t=>update("description",t)}
                label="Mô tả công việc"
            />
            <TextInput
                style={MyStyles.margin}
                value={job.skills}
                mode="outlined"
                onChangeText={t=>update("skills",t)}
                label="Kỹ năng"
            />
            <View style={MyStyles.margin}>
                <TextInput 
                    value={job.min_salary}
                    mode="outlined"
                    onChangeText={t=>update("min_salary",t)}
                    label="Lương tối thiểu"
                />
                <TextInput 
                    value={job.max_salary}
                    mode="outlined"
                    onChangeText={t=>update("max_salary",t)}
                    label="Lương tối đa"
                />
            </View>
            <TextInput 
                style={MyStyles.margin}
                value={job.location}
                mode="outlined"
                onChangeText={t=>update("location",t)}
                label="Địa chỉ"
            />
            <TextInput 
                style={MyStyles.margin}
                value={job.map_url}
                mode="outlined"
                onChangeText={t=>update("map_url",t)}
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
            <Text style={{marginTop: 10, fontWeight: 'bold'}}>Thời gian làm việc (Chọn các ca):</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10}}>
                {workingTimes.map(t => (
                    <Chip
                        key={t.id} 
                        style={{margin: 2}}
                        selected={selectedTimes.includes(t.id)}
                        onPress={() => toggleTime(t.id)}
                        icon={selectedTimes.includes(t.id) ? "check" : "clock"}
                    >
                        {t.name} ({t.start_time.substring(0,5)} - {t.end_time.substring(0,5)})
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
            <Button style={{marginBottom:100}} 
                    mode="contained" 
                    icon={jobId ? "pencil" : "check"} 
                    loading={loading} 
                    onPress={postJob}>{jobId ? "Cập nhật tin" : "Đăng Tin"}</Button>
        </ScrollView>
    );
};

export default PostJobs;