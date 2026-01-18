import { useContext, useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appbar, Button, Chip, HelperText, Menu, TextInput } from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';

import Apis, { authApis, endpoints } from "../../utils/Apis";
import MyStyles from "../../styles/MyStyles";
import MyColor from "../../utils/MyColor";
import { MyTokenContext, MyUserContext } from "../../utils/MyContexts";
import { PostJobSchema } from "../../utils/Schemas";

const PostJobs = ({ route }) => {
    const jobId = route.params?.jobId;
    const nav = useNavigation();
    const [token] = useContext(MyTokenContext);
    const [user] = useContext(MyUserContext);

    const [showDate, setShowDate] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [workingTimes, setWorkingTimes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [initialValues, setInitialValues] = useState({
        name: '',
        description: '',
        skills: '',
        min_salary: '',
        max_salary: '',
        location: '',
        map_url: '',
        deadline: '',
        payment_type: 'monthly',
        duration: '1_month',
        working_time_ids: [],
        category_ids: []
    });

    useEffect(() => {
        const loadInitData = async () => {
            if (!token) return;
            try {
                const [resCat, resTimes] = await Promise.all([
                    Apis.get(endpoints['categories']),
                    authApis(token).get(endpoints['getShifts'])
                ]);
                setCategories(resCat.data);
                setWorkingTimes(resTimes.data);

                if (jobId) {
                    setLoading(true);
                    let resJob = await authApis(token).get(endpoints['job-details'](jobId));
                    const data = resJob.data;
                    
                    setInitialValues({
                        ...data,
                        min_salary: String(data.min_salary),
                        max_salary: String(data.max_salary),
                        category_ids: data.categories ? data.categories.map(c => c.id) : [],
                        working_time_ids: data.shifts ? data.shifts.map(t => t.id) : (data.working_times ? data.working_times.map(t => t.id) : []),
                    });
                }
            } catch (ex) {
                console.error("Lỗi load dữ liệu:", ex);
            } finally {
                setLoading(false);
            }
        };
        loadInitData();
    }, [jobId, token]);

    const handleSubmitForm = async (values, { resetForm }) => {
        setLoading(true);
        try {
            const currentToken = token || await AsyncStorage.getItem("token");
            const dataToSend = {
                ...values,
                shifts: values.working_time_ids 
            };

            let res;
            if (jobId) {
                res = await authApis(currentToken).patch(endpoints['job-details'](jobId), dataToSend);
            } else {
                res = await authApis(currentToken).post(endpoints['jobs'], dataToSend);
            }

            if (res.status === 201 || res.status === 200) {
                Alert.alert("Thành công", jobId ? "Cập nhật thành công!" : "Tin tuyển dụng đã được đăng!");
                resetForm();
                nav.navigate("MyJobs", { reload: true });
            }
        } catch (error) {
            console.error("Error details:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Không thể lưu dữ liệu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <Appbar.Header style={styles.appbar}>
                <Appbar.Content title={jobId ? "Chỉnh sửa tin" : "Đăng tin mới"} titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <Formik
                    enableReinitialize={true}
                    initialValues={initialValues}
                    validationSchema={PostJobSchema}
                    onSubmit={handleSubmitForm}
                >
                    {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                        <View style={{ paddingBottom: 40 }}>
                            <TextInput
                                label="Tiêu đề *"
                                mode="outlined"
                                style={MyStyles.margin}
                                onChangeText={handleChange('name')}
                                onBlur={handleBlur('name')}
                                value={values.name}
                                error={touched.name && errors.name}
                            />
                            {touched.name && errors.name && <HelperText type="error">{errors.name}</HelperText>}

                            <TextInput
                                label="Mô tả công việc *"
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                                style={MyStyles.margin}
                                onChangeText={handleChange('description')}
                                onBlur={handleBlur('description')}
                                value={values.description}
                                error={touched.description && errors.description}
                            />
                            <TextInput
                                label="Kỹ năng *"
                                mode="outlined"
                                style={MyStyles.margin}
                                onChangeText={handleChange('skills')}
                                onBlur={handleBlur('skills')}
                                value={values.skills}
                                error={touched.skills && errors.skills}
                            />
                            {touched.skills && errors.skills && <HelperText type="error">{errors.skills}</HelperText>}


                            <Text style={styles.labelSection}>Danh mục bài đăng:</Text>
                            <View style={styles.chipContainer}>
                                {categories.map(c => (
                                    <Chip
                                        key={c.id}
                                        selected={values.category_ids.includes(c.id)}
                                        onPress={() => {
                                            const next = values.category_ids.includes(c.id)
                                                ? values.category_ids.filter(id => id !== c.id)
                                                : [...values.category_ids, c.id];
                                            setFieldValue('category_ids', next);
                                        }}
                                        style={{ margin: 2 }}
                                    >
                                        {c.name}
                                    </Chip>
                                ))}
                            </View>
                
                            <TextInput
                                label="Địa chỉ làm việc *"
                                mode="outlined"
                                style={MyStyles.margin}
                                onChangeText={handleChange('location')}
                                onBlur={handleBlur('location')}
                                value={values.location}
                                error={touched.location && errors.location}
                            />
                            {touched.location && errors.location && <HelperText type="error">{errors.location}</HelperText>}

                            <TextInput
                                label="Link Google Map *"
                                placeholder="https://maps.google.com..."
                                mode="outlined"
                                style={MyStyles.margin}
                                onChangeText={handleChange('map_url')}
                                onBlur={handleBlur('map_url')}
                                value={values.map_url}
                                error={touched.map_url && errors.map_url}
                            />
                            {touched.map_url && errors.map_url && <HelperText type="error">{errors.map_url}</HelperText>}


                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TextInput
                                    label="Lương Min"
                                    mode="outlined"
                                    keyboardType="numeric"
                                    style={[MyStyles.margin, { flex: 1 }]}
                                    onChangeText={handleChange('min_salary')}
                                    value={values.min_salary}
                                />
                                <TextInput
                                    label="Lương Max"
                                    mode="outlined"
                                    keyboardType="numeric"
                                    style={[MyStyles.margin, { flex: 1 }]}
                                    onChangeText={handleChange('max_salary')}
                                    value={values.max_salary}
                                />
                            </View>

                            <TouchableOpacity onPress={() => setShowDate(true)}>
                                <TextInput
                                    label="Hạn nộp hồ sơ *"
                                    value={values.deadline || "Chọn ngày"}
                                    mode="outlined"
                                    editable={false}
                                    style={MyStyles.margin}
                                    right={<TextInput.Icon icon="calendar" />}
                                />
                            </TouchableOpacity>
                            {showDate && (
                                <DateTimePicker
                                    value={values.deadline ? new Date(values.deadline) : new Date()}
                                    mode="date"
                                    minimumDate={new Date()}
                                    onChange={(event, selectedDate) => {
                                        setShowDate(false);
                                        if (selectedDate) {
                                            setFieldValue('deadline', selectedDate.toISOString().split('T')[0]);
                                        }
                                    }}
                                />
                            )}

                            <Text style={styles.labelSection}>Ca làm việc:</Text>
                            <View style={styles.chipContainer}>
                                {workingTimes.map(t => (
                                    <Chip
                                        key={t.id}
                                        selected={values.working_time_ids.includes(t.id)}
                                        onPress={() => {
                                            const next = values.working_time_ids.includes(t.id)
                                                ? values.working_time_ids.filter(id => id !== t.id)
                                                : [...values.working_time_ids, t.id];
                                            setFieldValue('working_time_ids', next);
                                        }}
                                        style={{ margin: 2 }}
                                    >
                                        {t.name}
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
                                            value={values.payment_type === 'monthly' ? 'Theo tháng' : 
                                                values.payment_type === 'weekly' ? 'Theo tuần' : 'Theo giờ'}
                                            mode="outlined"
                                            editable={false}
                                            style={MyStyles.margin}
                                            right={<TextInput.Icon icon="chevron-down" />}
                                        />
                                    </TouchableOpacity>
                                }
                            >
                                <Menu.Item onPress={() => { setFieldValue("payment_type", "hourly"); setShowMenu(false); }} title="Theo giờ" />
                                <Menu.Item onPress={() => { setFieldValue("payment_type", "weekly"); setShowMenu(false); }} title="Theo tuần" />
                                <Menu.Item onPress={() => { setFieldValue("payment_type", "monthly"); setShowMenu(false); }} title="Theo tháng" />
                            </Menu>
                                                
                            <Button 
                                mode="contained" 
                                onPress={handleSubmit} 
                                loading={loading}
                                disabled={loading}
                                style={{ marginTop: 20 }}
                                buttonColor={MyColor.primary}
                            >
                                {jobId ? "Cập nhật tin" : "Đăng Tin"}
                            </Button>
                        </View>
                    )}
                </Formik>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: MyColor.background, flex: 1 },
    formContainer: { flex: 1, padding: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    appbar: { backgroundColor: '#fff' },
    labelSection: { marginTop: 15, fontWeight: 'bold', marginBottom: 5 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }
});

export default PostJobs;