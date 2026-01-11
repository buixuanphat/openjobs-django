import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { authApis, endpoints } from "../../utils/Apis";
import { Button, Card, List, Text,Chip } from "react-native-paper";
import { FlatList, Linking, RefreshControl, View } from "react-native";
import Styles from "./Styles";

const Applications=()=>{
const[application,setApplication]=useState([]);
const[loading,setLoading]=useState(true);

const loadApplications=async()=>{
    try {
        setLoading(true);
        const token=await AsyncStorage.getItem("token");
        const res=await authApis(token).get(endpoints['applications']);
        setApplication(res.data);
    } catch (ex) {
        console.error("Lỗi tải danh sách hồ sơ: ",ex);
    }finally{
        setLoading(false);
    }
};

useEffect(()=>{
    loadApplications();
},[]);

const renderItem=({item})=>(
    <Card style={Styles.card}>
        <Card.Title 
            title={item.job_name} 
            subtitle={`Ngày nộp: ${new Date(item.created_date).toLocaleDateString()}`}
            left={(props) => <List.Icon {...props} icon="briefcase-check"/>}    
        />
        <Card.Content>
            <View style={Styles.row}>
                <Chip icon="information">{item.status_display}</Chip>
                {item.cv &&(
                    <Button mode="text" icon="file-eye" onPress={()=>Linking.openURL(item.cv)}>Xem CV</Button>
                )}
            </View>
        </Card.Content>
    </Card>
);

return(
    <View style={Styles.container}>
        <Text style={Styles.sectionTitle}>Lịch Sử Ứng Tuyển</Text>
        <FlatList 
            data={application}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadApplications} />}
            ListEmptyComponent={<Text style={Styles.emptyText}>Bạn chưa nộp hồ sơ nào</Text>}
        />
    </View>
);

};

export default Applications;