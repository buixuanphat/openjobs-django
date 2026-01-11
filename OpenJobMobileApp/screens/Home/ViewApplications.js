import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { authApis, endpoints } from "../../utils/Apis";
import { ActivityIndicator, Button, Card, Chip, List } from "react-native-paper";
import { FlatList, View,Text, Linking, Alert } from "react-native";
import MyStyles from "../../styles/MyStyles";

const ViewApplications=({route})=>{
    const{jobId}=route.params;
    const[applications,setApplications]=useState([]);
    const [loading,setLoading]=useState(true);

    const loadApplications = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            let res = await authApis(token).get(`${endpoints['applications']}?job_id=${jobId}`);
            setApplications(res.data.results || res.data);
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Không thể tải danh sách ứng viên.");
        } finally {
            setLoading(false);
        }
    };

    

    const changeStatus=async(appId,newStatus)=>{
        try {
            const token=await AsyncStorage.getItem("token");
            let res=await authApis(token).patch(endpoints['change-status'](appId),{"status":newStatus});
            Alert.alert("Thành công",res.data.msg);
            loadApplications();
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái hồ sơ!");
        }
    };

    useEffect(() => {
        loadApplications();
    }, [jobId]);

    const renderItem = ({ item }) => (
        <Card style={MyStyles.margin}>
            <List.Item
                title={item.user_name}
                subtitle={`Ngày nộp: ${new Date(item.created_date).toLocaleDateString()}`}
                left={props => <List.Icon {...props} icon="account" />}
                right={() => <Chip>{item.status_display}</Chip>}
            />
            <Card.Actions>
                <Button icon="file-pdf-box" onPress={() => item.cv && Linking.openURL(item.cv)}>
                    Xem CV
                </Button>
                {item.status==='pending' &&(
                    <>
                        <Button textColor="green" onPress={() => changeStatus(item.id, 'accepted')}>Duyệt </Button> 
                        <Button textColor="red" onPress={() => changeStatus(item.id, 'rejected')}>Từ chối </Button>                      
                    </>
                )}
            </Card.Actions>
        </Card>
    );

    return (
        <View style={MyStyles.container}>
            <Text style={[MyStyles.title, {textAlign: 'center'}]}>DANH SÁCH ỨNG VIÊN</Text>
            {loading ? <ActivityIndicator /> : (
                <FlatList
                    data={applications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>Chưa có ai ứng tuyển.</Text>}
                />
            )}
        </View>
    );
};

export default ViewApplications;