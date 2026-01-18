
import { View, Text, Alert } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Button, HelperText, TextInput } from "react-native-paper";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { MyTokenContext, MyUserContext } from "../../utils/MyContexts";
import { OAUTH2_CONFIG } from "../../AppConfig";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from "formik";
import { LoginSchema } from "../../utils/Schemas";

const Login = ({ route }) => {
    const [errMsg, setErrMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [, dispatch] = useContext(MyUserContext);
    const [, tokenDispatch] = useContext(MyTokenContext);
    const nav = useNavigation();

    const handleLogin = async (values) => {
        try {
            setLoading(true);
            setErrMsg("");

            const body =
                `username=${encodeURIComponent(values.username)}` +
                `&password=${encodeURIComponent(values.password)}` +
                `&grant_type=password` +
                `&client_id=${OAUTH2_CONFIG.client_id}` +
                `&client_secret=${OAUTH2_CONFIG.client_secret}`;

            console.log(body)

            let res = await Apis.post(endpoints['login'], body);
            const accessToken = res.data.access_token;


            await AsyncStorage.setItem("token", accessToken);
            tokenDispatch({
                "type": "login",
                "payload": accessToken
            });

            let userRes = await authApis(accessToken).get(endpoints['current-user']);

            dispatch({
                "type": "login",
                "payload": userRes.data
            });

        } catch (ex) {
            console.error("Lỗi đăng nhập:", ex);

            if (ex.response && ex.response.data) {
                if (ex.response.data.error === "invalid_grant") {
                    Alert.alert(
                        "Thông báo",
                        "Tài khoản chưa được duyệt hoặc sai mật khẩu. Vui lòng kiểm tra lại!"
                    );
                } else {
                    setErrMsg("Lỗi hệ thống xác thực: " + ex.response.data.error);
                    console.log(ex.response?.data)
                }
            } else {
                setErrMsg("Tài khoản hoặc mật khẩu không chính xác!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={MyStyles.padding}>
            <Text style={MyStyles.title}>ĐĂNG NHẬP NGƯỜI DÙNG</Text>

            {errMsg ? (
                <HelperText type="error" visible={true}>
                    {errMsg}
                </HelperText>
            ) : null}

            <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={handleLogin}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View>

                        <TextInput
                            label="Tên đăng nhập"
                            style={MyStyles.margin}
                            mode="outlined"
                            left={<TextInput.Icon icon="account" />}
                            onChangeText={handleChange('username')}
                            onBlur={handleBlur('username')}
                            value={values.username}
                            error={touched.username && errors.username}
                        />
                        <HelperText type="error" visible={touched.username && errors.username}>
                            {errors.username}
                        </HelperText>


                        <TextInput
                            label="Mật khẩu"
                            style={MyStyles.margin}
                            mode="outlined"
                            secureTextEntry
                            left={<TextInput.Icon icon="lock" />}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            error={touched.password && errors.password}
                        />
                        <HelperText type="error" visible={touched.password && errors.password}>
                            {errors.password}
                        </HelperText>


                        <Button
                            loading={loading}
                            disabled={loading}
                            mode="contained"
                            icon="login"
                            onPress={handleSubmit}
                            style={{ marginTop: 20 }}
                        >
                            Đăng nhập
                        </Button>


                        <Button
                            mode="text"
                            onPress={() => nav.navigate("Register")}
                            style={{ marginTop: 10 }}
                        >
                            Chưa có tài khoản? Đăng ký ngay
                        </Button>
                    </View>
                )}
            </Formik>
        </View>
    );
}

export default Login;