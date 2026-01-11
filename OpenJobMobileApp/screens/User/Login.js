import { View,Text, ScrollView, Alert } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Button, HelperText, TextInput } from "react-native-paper";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../utils/MyContexts";
import { OAUTH2_CONFIG } from "../../AppConfig";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login=({route})=>{

    const info=[{
        title:"Tên đăng nhập",
        field:"username",
        icon:"account"
    },{
        title:"Mật khẩu",
        field:"password",
        secureTextEntry:true,
        icon:"eye"
    }];

    const [user, setUser] = useState({});
    const [errMsg, setErrMsg] = useState();
    const [loading, setLoading] = useState(false);
    const [,dispatch] = useContext(MyUserContext);
    const nav = useNavigation();

    const validate = () => {
        if (!user.username) {
            setErrMsg("Vui lòng nhập username!");
            return false;
        }
        if (!user.password) {
            setErrMsg("Vui lòng nhập password!");
            return false;
        }

        setErrMsg(null);

        return true;
    }

    const login = async () => {
        if (validate()) {
            try {
                setLoading(true);

                const params = new URLSearchParams();
                params.append('username', user.username);
                params.append('password', user.password);
                for (let k in OAUTH2_CONFIG) params.append(k, OAUTH2_CONFIG[k]);
                let res = await Apis.post(endpoints['login'], params.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });


                // let res = await Apis.post(endpoints['login'], {
                //     ...user,
                //     ...OAUTH2_CONFIG
                    
                // });
                console.info(res.data);
                // Alert.alert("Thông báo","Đăng nhập thành công!");
                await AsyncStorage.setItem("token", res.data.access_token);

                setTimeout(async () => {
                    try {
                        let user = await authApis(res.data.access_token).get(endpoints['current-user']);
                        console.info(user.data);

                        dispatch({
                            "type": "login",
                            "payload": user.data
                        });

                        const next = route.params?.next;
                        if (next)
                            nav.navigate(next||"Home");

                    } catch (err) {
                        console.info("Lỗi lấy User:", err);
                        setErrMsg("Đăng nhập thành công nhưng không lấy được thông tin người dùng!");
            }}, 500);
                
            } catch (ex) {
                console.info(ex);
                if (ex.response && ex.response.data) {
                    if (ex.response.data.error === "invalid_grant") {
                        Alert.alert(
                            "Thông báo",
                            "Tài khoản của bạn chưa được duyệt hoặc sai mật khẩu. Vui lòng kiểm tra lại!"
                        );
                    } else {
                        setErrMsg("Lỗi hệ thống xác thực!");
                    }
                }else
                    setErrMsg("Tài khoản hoặc mật khẩu không chính xác!");
            }
            finally {
                setLoading(false);
            }
        }
    }


    return (
        <View style={MyStyles.padding}>
            <Text style={MyStyles.title}>ĐĂNG NHẬP NGƯỜI DÙNG</Text>
             <HelperText type="error" visible={errMsg}>
                {errMsg}
            </HelperText>

            {info.map(i => <TextInput key={i.field} style={MyStyles.margin}
                            label={i.title}
                            secureTextEntry={i.secureTextEntry}
                            right={<TextInput.Icon icon={i.icon} />}
                            value={user[i.field]}
                            onChangeText={t => setUser({...user, [i.field]: t})} />)}

          
            {user.avatar && <Image  source={{uri: user.avatar.uri}} width={250} style={[MyStyles.avatar, MyStyles.margin]} />}

            <Button loading={loading} disabled={loading} mode="contained" icon="account" onPress={login}>Đăng nhập</Button>
        </View>
            
        );
    }
    export default Login;