import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Button, Divider, HelperText, RadioButton, TextInput } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Apis, { endpoints } from "../../utils/Apis";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from "formik";
import { RegisterSchema } from "../../utils/Schemas";
import * as DocumentPicker from 'expo-document-picker';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('candidate');
    const [showDate, setShowDate] = useState(false);
    const [images, setImages] = useState([]);
    const [logo, setLogo] = useState();
    const [license, setLicense] = useState()
    const [avatar, setAvatar] = useState(null);
    const nav = useNavigation();

    const [initialValues, setInitialValues] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        phone_number: '',
        gender: 'male',
        date_of_birth: new Date().toISOString().split('T')[0],
        role: role,
        company_name: '',
        tax_code: '',
        address: ''
    });

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
                    setImages(res.assets);
                else if (type === 'logo')
                    setLogo(res.assets[0]);
                else
                    setAvatar(res.assets[0]);
        } else
            Alert.alert("Quyền truy cập bị từ chối!");
    }


    const pickLicense = async () => {
        const res = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            copyToCacheDirectory: true,
        });

        if (res.canceled) return;

        const file = res.assets[0];
        setLicense(file);
    };


    const handleRegister = async (values) => {
        if (!avatar)
            return Alert.alert("Lỗi", "Vui lòng chọn ảnh đại diện!");
        if (role === 'employer' && !logo)
            return Alert.alert("Lỗi", "Vui lòng chọn logo công ty!");

        try {
            setLoading(true);
            let form = new FormData();
            Object.keys(values).forEach(key => {
                if (key !== 'confirm_password')
                    form.append(key, values[key]);
            });
            if (avatar) {
                form.append('avatar', {
                    uri: avatar.uri,
                    name: 'avatar.jpg',
                    type: 'image/jpeg'
                });
            }
            if (role === 'employer' && license) {
                form.append('license', {
                    uri: license.uri,
                    name: license.name || 'license.pdf',
                    type: license.mimeType || 'application/pdf'
                });
            }

            form.append('role', role);
            if (role === 'employer') {
                if (logo) {
                    form.append('logo', { uri: logo.uri, name: 'logo.jpg', type: 'image/jpeg' });
                }
                images.forEach((img, index) => {
                    form.append('images', {
                        uri: img.uri,
                        name: `env_${index}.jpg`,
                        type: 'image/jpeg'
                    });
                });
            }
            const endpoint = role === 'candidate' ? endpoints['register-candidate'] : endpoints['register-employer'];
            let res = await Apis.post(endpoint, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.status === 201) {
                Alert.alert("Thành công", "Đăng ký thành công!");
                nav.navigate('Login');
            }
        } catch (ex) {
            Alert.alert("Lỗi", "Tài khoản hoặc email đã tồn tại!");
            console.log(ex)
        } finally {
            setLoading(false);
        }
    };



    return (
        <View style={[MyStyles.contentContainer, MyStyles.padding]}>
            <Text style={MyStyles.title}>ĐĂNG KÍ NGƯỜI DÙNG</Text>
            <Formik
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={RegisterSchema}
                onSubmit={handleRegister}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <ScrollView>
                        <TextInput
                            label="Tên"
                            mode="outlined"
                            style={MyStyles.margin}
                            onChangeText={handleChange('first_name')}
                            value={values.first_name}
                            error={touched.first_name && errors.first_name} />
                        <TextInput
                            label="Họ và tên lót"
                            mode="outlined"
                            style={MyStyles.margin}
                            onChangeText={handleChange('last_name')}
                            value={values.last_name}
                            error={touched.last_name && errors.last_name} />
                        <TextInput
                            label="Tên đăng nhập"
                            mode="outlined"
                            style={MyStyles.margin}
                            onChangeText={handleChange('username')}
                            value={values.username}
                        />
                        <HelperText type="error" visible={touched.username && errors.username}>
                            {errors.username}</HelperText>
                        <TextInput
                            label="Mật khẩu"
                            secureTextEntry
                            mode="outlined"
                            style={MyStyles.margin}
                            onChangeText={handleChange('password')}
                            value={values.password} />
                        <TextInput
                            label="Xác nhận mật khẩu"
                            secureTextEntry
                            mode="outlined"
                            style={MyStyles.margin}
                            onChangeText={handleChange('confirm_password')}
                            value={values.confirm_password}
                            error={touched.confirm_password && errors.confirm_password} />
                        <HelperText type="error" visible={touched.confirm_password && errors.confirm_password}>
                            {errors.confirm_password}</HelperText>

                        <TextInput
                            label="Email"
                            mode="outlined"
                            style={MyStyles.margin}
                            onChangeText={handleChange('email')}
                            value={values.email}
                            keyboardType="email-address" />
                        <TextInput
                            label="Số điện thoại"
                            mode="outlined"
                            style={MyStyles.margin}
                            onChangeText={handleChange('phone_number')}
                            value={values.phone_number}
                            keyboardType="phone-pad" />
                        <RadioButton.Group onValueChange={v => setFieldValue('gender', v)} value={values.gender}>
                            <View style={MyStyles.radioItem}>
                                <RadioButton.Item label="Nam" value="male" />
                                <RadioButton.Item label="Nữ" value="female" />
                            </View>
                        </RadioButton.Group>
                        <TouchableOpacity onPress={() => setShowDate(true)}>
                            <TextInput
                                label="Ngày sinh"
                                value={values.date_of_birth}
                                editable={false} mode="outlined"
                                style={MyStyles.margin}
                                right={<TextInput.Icon icon="calendar" />} />
                        </TouchableOpacity>
                        {showDate && <DateTimePicker
                            value={new Date(values.date_of_birth)}
                            mode="date"
                            onChange={(e, d) => {
                                setShowDate(false);
                                if (d) setFieldValue('date_of_birth', d.toISOString().split('T')[0])
                            }}
                        />
                        }
                        <Button
                            icon="camera"
                            onPress={() => picker('avatar')}
                            style={MyStyles.margin}>Chọn ảnh đại diện</Button>
                        {avatar && <Image source={{ uri: avatar.uri }} style={MyStyles.avatar} />}
                        <Divider style={MyStyles.margin} />
                        <RadioButton.Group onValueChange={v => setRole(v)} value={role}>
                            <View style={MyStyles.radioItem}>
                                <RadioButton.Item label="Ứng viên" value="candidate" />
                                <RadioButton.Item label="Nhà tuyển dụng" value="employer" />
                            </View>
                        </RadioButton.Group>
                        {role === 'employer' && (
                            <View>
                                <TextInput
                                    label="Tên công ty"
                                    mode="outlined"
                                    style={MyStyles.margin}
                                    onChangeText={handleChange('company_name')}
                                    value={values.company_name}
                                    error={touched.company_name && errors.company_name} />
                                <TextInput
                                    label="Mã số thuế"
                                    mode="outlined"
                                    style={MyStyles.margin}
                                    onChangeText={handleChange('tax_code')}
                                    value={values.tax_code} />
                                <TextInput
                                    label="Địa chỉ"
                                    mode="outlined"
                                    style={MyStyles.margin}
                                    onChangeText={handleChange('address')}
                                    value={values.address} />


                                <Button icon="file-pdf-box" onPress={pickLicense}>
                                    Chọn giấy phép kinh doanh (PDF)
                                </Button>
                                {license && (
                                    <Text style={{ marginLeft: 10 }}>
                                        📄 {license.name}
                                    </Text>
                                )}



                                <Button icon="briefcase" onPress={() => picker('logo')}>Chọn Logo</Button>
                                {logo && <Image source={{ uri: logo.uri }} style={MyStyles.logo} />}

                                <Button icon="image-multiple" onPress={() => picker('images')}>
                                    Ảnh môi trường ({images.length})</Button>
                                <ScrollView horizontal contentContainerStyle={{ gap: 10, paddingVertical: 10 }}>
                                    {images.map((img, i) => <Image key={i} source={{ uri: img.uri }} style={MyStyles.logo} />)}
                                </ScrollView>
                            </View>
                        )}
                        <Button
                            loading={loading}
                            disabled={loading}
                            mode="contained"
                            onPress={handleSubmit}
                            style={MyStyles.margin}
                        >Đăng ký {role === 'candidate' ? 'Ứng viên' : 'Nhà tuyển dụng'}</Button>
                    </ScrollView>
                )}
            </Formik>
        </View>
    );
}
export default Register;