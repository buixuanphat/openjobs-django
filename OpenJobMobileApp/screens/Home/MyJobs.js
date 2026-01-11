import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { authApis, endpoints } from "../../utils/Apis";
import { ActivityIndicator, Button, Card, Divider, List } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { FlatList, RefreshControl, View,Text, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    const renderItem=({item})=>(
        <Card style={MyStyles.margin}>
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
            <Card.Actions>
                <Button mode="outline" onPress={()=>nav.navigate("Home",
                    {screen:"JobDetails",params:{jobId:item.id}})}>Chi tiết</Button>
                <Button mode="outline" icon="account-search" onPress={()=>nav.navigate("Home",
                    {screen:"ViewApplications",params:{jobId:item.id}})}>
                    Xem ứng viên
                </Button>
            </Card.Actions>
        </Card>
    );

    return(
        <View style={MyStyles.container}>
            <Text style={MyStyles.title}>QUẢN LÝ TIN ĐĂNG</Text>
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