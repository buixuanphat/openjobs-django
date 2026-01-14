import { use, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Alert } from "react-native";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";
import { Button, Chip, HelperText, Menu, TextInput } from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';

import Styles from "./Styles";
import { PostJobSchema } from "../../utils/Schemas";

const PostJobs=({route})=>{
    const jobId = route.params?.jobId;

    const [showDate, setShowDate] = useState(false); 
    const [showMenu, setShowMenu] = useState(false);
    const [workingTimes, setWorkingTimes] = useState([]); 
    const [categories, setCategories] = useState([]);
    const [loading,setLoading]=useState(false);
    const nav=useNavigation();

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
        working_time_ids: [],
        category_ids: []
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resCat, resTimes] = await Promise.all([
                    Apis.get(endpoints['categories']),
                    Apis.get(endpoints['working-times'])
                ]);
                setCategories(resCat.data);
                setWorkingTimes(resTimes.data);

                if(jobId){
                    let resJob=await Apis.get(endpoints['job-details'](jobId));
                    const selectedCategoryIds = resJob.data.categories ? resJob.data.categories.map(c => c.id) : [];
                    const selectedWorkingTimeIds = resJob.data.working_times ? resJob.data.working_times.map(t => t.id) : [];
                    setInitialValues({
                        ...resJob.data,
                        min_salary: String(resJob.data.min_salary),
                        max_salary: String(resJob.data.max_salary),
                        category_ids: selectedCategoryIds,
                        working_time_ids: selectedWorkingTimeIds,
                    });
                }
            } catch (ex) {
                console.error("Lỗi", ex);
            }
        };
        loadData();
    }, [jobId]);

    const handleSubmitForm=async(values,{resetForm})=>{
        setLoading(true);
        try {
            const token=await AsyncStorage.getItem("token");

            let res = jobId 
                ? await authApis(token).patch(endpoints['job-details'](jobId), values)
                : await authApis(token).post(endpoints['jobs'], values);

            if (res.status === 201 || res.status === 200) {
                Alert.alert("Thành công", "Dữ liệu đã được lưu!");
                resetForm();
                nav.navigate("MyJobs", { reload: true });
            }

        } catch (error) {
            // console.log("Error details:", error.response?.data);
            Alert.alert("Lỗi", "Không thể lưu dữ liệu!");
        }finally{
            setLoading(false);
        }
    };

    return(
        <ScrollView style={Styles.padding}>
            <Text style={Styles.formTitle}>{jobId ? "CHỈNH SỬA TIN" : "ĐĂNG TIN MỚI"}</Text>
            <Formik 
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={PostJobSchema}
                onSubmit={handleSubmitForm}
            >
                {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                    <View>
                        <HelperText type="error" visible={touched.name && errors.name}>
                            {errors.name}
                        </HelperText>
                        <TextInput
                            label="Tiêu đề *"
                            mode="outlined"
                            style={Styles.inputMargin}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            value={values.name}
                            error={touched.name && errors.name}
                        />
                        <HelperText type="error" visible={touched.description && errors.description}>
                            {errors.description}
                        </HelperText>
                        <TextInput
                            label="Mô tả công việc *"
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            style={Styles.inputMargin}
                            onChangeText={handleChange('description')}
                            onBlur={handleBlur('description')}
                            value={values.description}
                            error={touched.description && errors.description}
                        />
                        <HelperText type="error" visible={touched.category_ids && errors.category_ids}>
                            {errors.category_ids}
                        </HelperText>
                        <Text style={Styles.label}>Danh mục bài đăng:</Text>
                        <View style={Styles.chipContainer}>
                            {categories.map(c => (
                                <Chip
                                    key={c.id}
                                    onPress={() => {
                                        const current = values.category_ids;
                                        const next = current.includes(c.id)
                                            ? current.filter(id => id !== c.id)
                                            : [...current, c.id];
                                        setFieldValue('category_ids', next);
                                    }}
                                    style={{ margin: 2 }}
                                    selected={(values.category_ids || []).includes(c.id)}
                                    icon={(values.category_ids || []).includes(c.id) ? "check" : "tag"}
                                >
                                    {c.name}
                                </Chip>
                            ))}
                        </View>
                        <HelperText type="error" visible={touched.skills && errors.skills}>
                            {errors.skills}
                        </HelperText>
                        <TextInput
                            label="Kỹ năng *"
                            mode="outlined"
                            style={Styles.inputMargin}
                            onChangeText={handleChange('skills')}
                            onBlur={handleBlur('skills')}
                            value={values.skills}
                        />
                        
                        <View style={Styles.salaryRow}>
                            <View style={Styles.salaryInput}>
                                <HelperText type="error" visible={touched.min_salary && !!errors.min_salary}>
                                    {errors.min_salary}
                                </HelperText>
                                <TextInput
                                    label="Lương Min *"
                                    mode="outlined"
                                    keyboardType="numeric"
                                    onChangeText={handleChange('min_salary')}
                                    value={values.min_salary}
                                />
                            </View>
                            <View style={Styles.salaryInput}>
                                <HelperText type="error" visible={touched.max_salary && !!errors.max_salary}>
                                    {errors.max_salary}
                                </HelperText>
                                <TextInput
                                    label="Lương Max *"
                                    mode="outlined"
                                    keyboardType="numeric"
                                    onChangeText={handleChange('max_salary')}
                                    value={values.max_salary}
                                />
                            </View>
                        </View>
                        <HelperText type="error" visible={touched.location && errors.location}>
                            {errors.location}
                        </HelperText>
                        <TextInput
                            label="Địa chỉ *"
                            mode="outlined"
                            style={Styles.inputMargin}
                            onChangeText={handleChange('location')}
                            value={values.location}
                        />
                        <HelperText type="error" visible={touched.map_url && errors.map_url}>
                            {errors.map_url}
                        </HelperText>
                        <TextInput
                            label="Link Google Map *"
                            mode="outlined"
                            style={Styles.inputMargin}
                            onChangeText={handleChange('map_url')}
                            value={values.map_url}
                        />
                        <HelperText type="error" visible={touched.deadline && errors.deadline}>
                            {errors.deadline}
                        </HelperText>
                        <TouchableOpacity onPress={() => setShowDate(true)}>
                            <TextInput
                                label="Hạn nộp hồ sơ *"
                                value={values.deadline || "Nhấn để chọn ngày"}
                                mode="outlined"
                                editable={false}
                                style={Styles.inputMargin}
                                right={<TextInput.Icon icon="calendar" onPress={() => setShowDate(true)} />}
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
                        <HelperText type="error" visible={touched.working_time_ids && errors.working_time_ids}>
                            {errors.working_time_ids}
                        </HelperText>
                        <Text style={Styles.label}>Thời gian làm việc:</Text>
                        <View style={Styles.chipContainer}>
                            {workingTimes.map(t => (
                                <Chip
                                    key={t.id}
                                    onPress={() => {
                                        const current = values.working_time_ids || [];
                                        const next = current.includes(t.id)
                                            ? current.filter(id => id !== t.id)
                                            : [...current, t.id];   
                                        setFieldValue('working_time_ids', next);
                                    }}
                        
                                    style={{ margin: 2 }}
                                    selected={(values.working_time_ids|| []).includes(t.id)}
                                    icon={(values.working_time_ids || []).includes(t.id) ? "check" : "clock"}
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
                                        style={Styles.inputMargin}
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
                            loading={loading} 
                            disabled={loading}
                            icon={jobId ? "pencil" : "check"} 
                            onPress={handleSubmit}
                            style={Styles.submitButton}
                        >
                            {jobId ? "Cập nhật tin" : "Đăng Tin"}
                        </Button>
                    </View>
                )}
            </Formik>
        </ScrollView>
    );
};

export default PostJobs;