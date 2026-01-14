import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Avatar, Button, Card, Divider, List } from "react-native-paper";
import { use, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../utils/MyContexts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Styles from "../Home/Styles";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from 'expo-document-picker';
import { authApis, endpoints } from "../../utils/Apis";
import MyButton from "../../components/MyButton";
import MyColor from "../../utils/MyColor";

const Profile = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();

    const logout = async () => {
        await AsyncStorage.removeItem("token");

        dispatch({
            "type": "logout"
        });
    }

    const loadCurrentUser = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (token) {
                const res = await authApis(token).get(endpoints['current-user']);
                console.log(res.data)
                dispatch({
                    type: "login",
                    payload: res.data
                });
            }
        } catch (ex) {
            console.error("Lỗi tải thông tin user:", ex);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadCurrentUser();
    }, []);

    const updateCV = async () => {
        let res = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
        if (res.canceled === false) {
            const file = res.assets[0];
            try {
                const token = await AsyncStorage.getItem("token");
                let formData = new FormData();

                formData.append("cv", {
                    uri: file.uri,
                    name: file.name,
                    type: "application/pdf"
                });

                const response = await authApis(token).patch(endpoints['current-user'], formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.status === 200) {
                    await loadCurrentUser();
                    Alert.alert("Thành công", "Đã cập nhật CV của bạn!");
                }
            } catch (ex) {
                console.error(ex);
                Alert.alert("Lỗi", "Không thể cập nhật CV lúc này.");
            }
        }
    };

    return (
        <ScrollView style={Styles.container} refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadCurrentUser} />}>
            <View style={{ alignItems: 'center', justifyContent: 'center', margin: 8 }}>
                <Image style={MyStyles.avatarProfile} source={{ uri: user.avatar }} />
                <Text style={styles.name}>{user.last_name} {user.first_name}</Text>
                <Text style={styles.email}>{user.email}</Text>
            </View>



            <Card style={Styles.card}>
                <List.Section>
                    <List.Subheader style={Styles.title}>Hồ Sơ Của Tôi</List.Subheader>
                    <List.Item
                        title="Thông tin cá nhân"
                        left={props => <List.Icon {...props} icon="account-edit" />}
                        onPress={() => nav.navigate('Home', { screen: 'UserDetails' })}
                    />


                    <Divider />
                    <List.Item
                        title="Cập nhật CV"
                        description={(user && user.cv) ? "Đã có CV trên hệ thống!" : "Chưa cập nhật CV!"}
                        left={props => <List.Icon {...props} icon="file-pdf-box" />}
                        onPress={updateCV}
                    />



                    {user.role == 'employer' &&
                        <View>
                            <Divider />
                            <List.Item
                                title="Ca làm việc"
                                left={props => <List.Icon {...props} icon="clock-time-four" />}
                                onPress={() => nav.navigate("Home", {
                                    screen: "Shift"
                                })}
                            />
                        </View>
                    }



                    {user.role == 'employer' &&
                        <View>
                            <Divider />
                            <List.Item
                                title="Nhân viên"
                                left={props => <List.Icon {...props} icon="account" />}
                                onPress={() => nav.navigate("Home", {
                                    screen: "CandidateManagement"
                                })}
                            />
                        </View>
                    }





                    {user.role == 'candidate' &&
                        <View>
                            <Divider />
                            <List.Item
                                title="Công việc của tôi"
                                left={props => <List.Icon {...props} icon="clock-time-four" />}
                                onPress={() => nav.navigate("Home", {
                                    screen: "MyEmployment"
                                })}
                            />
                        </View>
                    }
                </List.Section>
            </Card>





            <Card style={Styles.card}>
                <List.Section>
                    <List.Subheader style={Styles.title}>Hoạt động</List.Subheader>
                    {user?.role === 'candidate' ? (
                        <List.Item
                            title="Lịch Sử Ứng Tuyển"
                            description="Theo dõi trạng thái các công việc đã nộp"
                            left={props => <List.Icon {...props} icon="history" color="#1a73e8" />}
                            onPress={() => nav.navigate('Home', { screen: 'Applications' })}
                        />
                    ) : user?.role === 'employer' ? (
                        <List.Item
                            title="Lịch sử Tin Đăng"
                            description="Xem lại các tin từng đăng"
                            left={props => <List.Icon {...props} icon="history" color="#1a73e8" />}
                            onPress={() => nav.navigate('Home', { screen: 'JobHistory' })}
                        />
                    ) : null}
                </List.Section>
            </Card>
            <MyButton onPress={logout} backGroundColor={MyColor.red50} label="Đăng xuất" icon="logout" borderColor={MyColor.red} labelColor={MyColor.red} iconColor={MyColor.red} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    name:
    {
        fontSize: 20,
        fontWeight: 700,
        color: 'black'
    },
    email:
    {
        fontSize: 14,
        fontWeight: 600,
        color: MyColor.darkGrey
    }
})

export default Profile;