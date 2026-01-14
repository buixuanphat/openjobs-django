import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { authApis, endpoints } from "../../utils/Apis";
import { ActivityIndicator, Button, Card, Chip, Divider, List } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { FlatList, RefreshControl, View,Text, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Styles from "./Styles";

const MyJobs=()=>{
    const [jobs,setJobs]=useState([]);
    const[loading,setLoading]=useState(true);
    const [refreshing, setRefreshing]=useState(false);
    const nav=useNavigation();

    const loadMyJobs=async()=>{
        try {
            const token = await AsyncStorage.getItem("token");
            let res = await authApis(token).get(`${endpoints['jobs']}my-jobs/`); 
            setJobs(res.data.results || res.data); 
        } catch (ex) {
            console.error(ex);
            Alert.alert("Thông báo", "Lỗi khi tải danh sách tin của bạn!");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadMyJobs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadMyJobs();
    };

    const handleDelete=(jobId)=>{
        Alert.alert("Xác nhận","Bạn có chắc muốn xóa tin này?",[
            {text:"Hủy"},
            {text:"Xóa", 
                onPress:async()=>{
                    try {
                        setLoading(true);
                        const token=await AsyncStorage.getItem("token");
                        const res=await authApis(token).delete(endpoints['job-details'](jobId));
                        if (res.status === 204 || res.status === 200) {
                            Alert.alert("Thành công", "Đã gỡ bỏ tin tuyển dụng!");
                            await loadMyJobs(); 
                        }
                    } catch (ex) {
                        console.error(ex);
                        const errorMsg = ex.response?.data?.detail || "Không có quyền thực hiện hoặc lỗi hệ thống!";
                        Alert.alert("Lỗi", errorMsg);
                    }finally{
                        setLoading(false);
                    }
                }
            }
        ]);

    };

    const renderItem=({item})=>(
       <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => nav.navigate("Home", { screen: "JobDetails", params: { jobId: item.id } })}>
            <Card style={Styles.margin}>
                <Card.Title 
                    title={item.name}
                    subtitle={`Đăng ngày: ${new Date(item.created_date).toLocaleDateString()}`}
                    left={(props) => <List.Icon {...props} icon="briefcase-check" />}
                />
                <Card.Content>
                    <Text>Địa điểm: {item.location}</Text>
                    <Text>Lương: {item.min_salary}tr - {item.max_salary}tr</Text>
                </Card.Content>
                <Divider style={{marginVertical: 10}} />
                <Card.Actions style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    <Button 
                        compact 
                        mode="outlined" 
                        icon="account-search" 
                        style={{ margin: 2 }} 
                        onPress={() => nav.navigate("Home", { screen: "ViewApplications", params: { jobId: item.id } })}
                    >Xem ứng viên</Button>
                    <Button 
                        compact 
                        mode="outlined" 
                        style={{ margin: 2 }} 
                        onPress={() => nav.navigate("Home", { screen: "PostJobs", params: { jobId: item.id } })}
                    >Sửa</Button>
                    <Button 
                        compact 
                        mode="outlined" 
                        style={{ margin: 2 }}
                        onPress={() => handleDelete(item.id)}
                    >Xóa</Button>
                </Card.Actions>
        </Card>
       </TouchableOpacity>
    );

    return(
        <View style={[Styles.padding, { flex: 1, marginBottom: 20 }]}>
            <Text style={Styles.formTitle}>QUẢN LÝ TIN ĐĂNG</Text>
            {loading && !refreshing?(
                <ActivityIndicator />
            ):(
                <FlatList 
                    data={jobs}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
                />
            )}
        </View>
    );
};

export default MyJobs;