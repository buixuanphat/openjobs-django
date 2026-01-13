import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Button, RadioButton, TextInput } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Apis, { endpoints } from "../../utils/Apis";
import DateTimePicker from '@react-native-community/datetimepicker';

const Register = () => {
    const info = [{
        title: "Tên",
        field: "first_name",
        icon: "text"
    }, {
        title: "Họ và tên lót",
        field: "last_name",
        icon: "text"
    }, {
        title: "Tên đăng nhập",
        field: "username",
        icon: "account"
    }, {
        title: "Mật khẩu",
        field: "password",
        secureTextEntry: true,
        icon: "eye"
    }, {
        title: "Xác nhận Mật khẩu",
        field: "confirm_password",
        secureTextEntry: true,
        icon: "eye"
    }, {
        title: "Email",
        field: "email",
        icon: "email"
    }, {
        title: "Số điện thoại",
        field: "phone_number",
        icon: "phone"
    }];

    const employerInfor = [{
        title: "Tên công ty",
        field: "company_name",
        icon: "office-building"
    }, {
        title: "Mã số thuế",
        field: "tax_code",
        icon: "card-account-details"
    }, {
        title: "Địa chỉ",
        field: "address",
        icon: "map-marker"
    }];


    const [user, setUser] = useState({ "gender": "male", "date_of_birth": new Date().toISOString().split('T')[0] });
    const [errMsg, setErrMsg] = useState();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('candidate');
    const [showDate, setShowDate] = useState(false);
    const [image, setImage] = useState([]);
    const [logo, setLogo] = useState();
    const nav = useNavigation();

    const change = (field, value) => {
        setUser(c => ({ ...c, [field]: value }));
    }

    const onDateChange = (event, selectedDate) => {
        setShowDate(false);
        if (selectedDate) {
            change("date_of_birth", selectedDate.toISOString().split('T')[0]);
        }

    }

    const picker = async (type) => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (granted) {
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: type === 'images',
                selectionLimit: type === 'images' ? 5 : 1,
                quality: 1,
            });

            if (!res.canceled)
                if (type === 'images')
                    setImage(res.assets);
                else if (type === 'logo')
                    setLogo(res.assets[0]);
                else
                    setUser({ ...user, "avatar": res.assets[0] });
        } else
            Alert.alert("Quyền truy cập bị từ chối!");
    }

    const validate = () => {
        if (!user.password || user.password !== user.confirm_password) {
            setErrMsg("Mật khẩu KHÔNG khớp!");
            Alert.alert("Mật khẩu xác nhận không khớp.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (user.email && !emailRegex.test(user.email)) {
            setErrMsg("Email không hợp lệ (thiếu @ hoặc sai định dạng)!");
            return false;
        }

        setErrMsg(null);
        return true;
    }

    const register = async () => {
        if (validate() === true) {
            try {
                setLoading(true);
                let form = new FormData();

                for (let key in user) {
                    if (key !== 'confirm_password') {
                        if (key === 'avatar') {
                            form.append(key, {
                                uri: user.avatar.uri,
                                name: user.avatar.fileName || 'avatar.jpg',
                                type: "image/jpeg"
                            });
                        }
                        else
                            form.append(key, user[key]);
                    }
                }

                if (role === 'employer') {
                    if (logo) {
                        form.append('logo', {
                            uri: logo.uri,
                            name: 'logo.jpg',
                            type: 'image/jpeg'
                        });
                    } else {
                        Alert.alert("Vui lòng chọn Logo công ty!");
                        setLoading(false);
                        return;
                    }

                    image.forEach((img, index) => {
                        form.append('images', {
                            uri: img.uri,
                            name: `env_${index}.jpg`,
                            type: 'image/jpeg'
                        });
                    });
                }


                form.append('role', role);
                const endpoint = role === 'candidate' ? endpoints['register-candidate'] : endpoints['register-employer'];

                let res = await Apis.post(endpoint, form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.status === 201) {
                    Alert.alert("Thành công", "Đăng ký tài khoản thành công.");
                    nav.navigate('Login');
                } else
                    setErrMsg("Đăng ký thất bại. Vui lòng thử lại sau!");
            } catch (ex) {
                console.log(ex)
                setErrMsg("Đăng ký thất bại. Vui lòng thử lại sau!");
                console.info(ex);
            } finally {
                setLoading(false);
            }
        }
    }



    return (
        <View style={[MyStyles.contentContainer, MyStyles.padding]}>
            <Text style={MyStyles.title}>ĐĂNG KÍ NGƯỜI DÙNG</Text>
            <ScrollView>
                {info.map(i => <TextInput style={MyStyles.margin} key={i.field} value={user[i.field]}
                    onChangeText={(t) => setUser({ ...user, [i.field]: t })}
                    label={i.title}
                    secureTextEntry={i.secureTextEntry}
                    right={<TextInput.Icon icon={i.icon} />}
                />)}

                <View style={MyStyles.radioContainer}>
                    <Text style={MyStyles.radioLabel}>Giới tính</Text>
                    <RadioButton.Group onValueChange={v => change("gender", v)} value={user.gender}>
                        <View style={MyStyles.radioItem}>
                            <RadioButton.Item label="Nam" value="male" />
                            <RadioButton.Item label="Nữ" value="female" />
                        </View>
                    </RadioButton.Group>
                </View>

                <TouchableOpacity onPress={() => setShowDate(true)}>
                    <TextInput style={MyStyles.margin} label="Ngày sinh" value={user.date_of_birth}
                        editable={false} right={<TextInput.Icon icon="calendar" />}
                    />
                </TouchableOpacity>
                {showDate && (
                    <DateTimePicker value={new Date(user.date_of_birth)}
                        mode="date" display="default" onChange={onDateChange}
                    />
                )}

                <TouchableOpacity style={MyStyles.pickerBtn} onPress={() => picker('avatar')}>
                    <Text style={MyStyles.pickerText}>Chọn ảnh đại diện...</Text>
                </TouchableOpacity>
                {user.avatar && <Image source={{ uri: user.avatar.uri }} style={MyStyles.avatar} />}

                <View style={MyStyles.radioContainer}>
                    <Text style={MyStyles.radioLabel}>Bạn là </Text>
                    <RadioButton.Group onValueChange={value => setRole(value)} value={role}>
                        <View style={MyStyles.radioItem}>
                            <RadioButton.Item label="Ứng viên" value="candidate" />
                            <RadioButton.Item label="Nhà tuyển dụng" value="employer" />
                        </View>
                    </RadioButton.Group>
                </View>

                {role === 'employer' && (
                    <>
                        <Text style={MyStyles.radioLabel}>Thông tin doanh nghiệp</Text>
                        {employerInfor.map(i => (
                            <TextInput style={MyStyles.margin} key={i.field} value={user[i.field]}
                                onChangeText={(t) => change(i.field, t)}
                                label={i.title}
                                right={<TextInput.Icon icon={i.icon} />}
                            />))}
                        <TouchableOpacity style={MyStyles.pickerBtn} onPress={() => picker('logo')}>
                            <Text style={MyStyles.pickerText}>Chọn logo...</Text>
                        </TouchableOpacity>
                        {logo && <Image source={{ uri: logo.uri }} style={MyStyles.logo} />}
                        <TouchableOpacity style={MyStyles.pickerBtn} onPress={() => picker('images')}>
                            <Text style={MyStyles.pickerText}>
                                Chọn ảnh môi trường làm việc...{image.length})
                            </Text>
                        </TouchableOpacity>
                        {image.length > 0 && (
                            <ScrollView horizontal>
                                {image.map((img, index) =>
                                    <Image key={index} source={{ uri: img.uri }} style={MyStyles.logo} />
                                )}
                            </ScrollView>
                        )}
                    </>
                )}

                {errMsg && <Text style={MyStyles.errorMsg}>{errMsg}</Text>}

                <Button loading={loading} disabled={loading}
                    icon="account" mode="contained"
                    onPress={register}>
                    Đăng Ký {role === 'candidate' ? 'Ứng Viên' : 'Nhà Tuyển Dụng'}
                </Button>
            </ScrollView>
        </View>
    );
}
export default Register;