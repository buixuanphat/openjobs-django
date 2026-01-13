import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../utils/MyContexts";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../utils/Apis";
import { Alert, Linking, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Card, Chip, Divider, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Styles from "./Styles";
import * as DocumentPicker from 'expo-document-picker';
import MyButton from "../../components/MyButton";
import MyStyles from "../../styles/MyStyles";
import { Image } from "react-native";

const JobDetails = ({ route }) => {
    const jobId = route.params?.jobId;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user] = useContext(MyUserContext);
    const [applied, setApplied] = useState(false);
    const [showApply, setShowApply] = useState(false);
    const [cvFile, setCvFile] = useState(null);
    const nav = useNavigation();


    const loadJob = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints['job-details'](jobId));
            setJob(res.data);
            console.log("Chi tiết công việc: ", res.data)
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJob();
    }, [jobId]);

    const openGoogleMaps = () => {
        if (job?.map_url) {
            Linking.openURL(job.map_url).catch((err) =>
                Alert.alert("Thông báo", "Không thể mở được map!")
            );
        } else {
            Alert.alert("Thông báo", "Công việc này chưa được cập nhật map!");
        }
    };

    const pickerDocument = async () => {
        let res = await DocumentPicker.getDocumentAsync({
            type: "application/pdf"
        });
        if (res.canceled === false) {
            setCvFile(res.assets[0]);
            console.info("Đã chọn file:", res.assets[0].name);
        } else {
            console.info("Đã hủy!");
        }
    };

    const handleApply = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Thông báo", "Vui lòng đăng nhập để ứng tuyển!");
                return;
            }
            setLoading(true);
            let formData = new FormData();
            formData.append("job", jobId);

            if (cvFile) {
                formData.append("cv", {
                    uri: cvFile.uri,
                    name: cvFile.name,
                    type: "application/pdf"
                });
            } else if (user?.cv) {
                formData.append("cv", user.cv);
            } else {
                Alert.alert("Thông báo", "Vui long chọn file CV!");
                setLoading(false);
                return;
            }

            const res = await authApis(token).post(endpoints['applications'], formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.status === 201) {
                setApplied(true);
                Alert.alert("Thông báo", "Ứng tuyển thành công!");
                setCvFile(null);
            }
        } catch (ex) {
            if (ex.response?.status === 400) {
                setApplied(true);
                Alert.alert("Thông báo", "Bạn đã ứng tuyển công việc này rồi!");
            } else {
                console.error(ex);
                Alert.alert("Lỗi", "Hệ thống lỗi!");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderApplySection = () => {
        if (user?.role !== 'candidate') return null;

        if (!showApply) {
            return (
                <View style={Styles.margin}>
                    <Divider style={{ marginVertical: 15 }} />
                    <Button
                        style={Styles.buttonApply}
                        mode="contained"
                        icon="send"
                        onPress={() => setShowApply(true)}
                        disabled={applied}
                    >
                        {applied ? "BẠN ĐÃ NỘP HỒ SƠ" : "BẮT ĐẦU ỨNG TUYỂN"}
                    </Button>
                </View>
            );
        }

        return (
            <View style={Styles.applyContainer}>
                <View>
                    <Text style={Styles.sectionTitle}>Hồ sơ ứng tuyển</Text>
                    <TouchableOpacity onPress={() => setShowApply(false)}>
                        <Text>Thu gọn</Text>
                    </TouchableOpacity>
                </View>

                <Divider />

                {user?.cv && !cvFile ? (
                    <View>
                        <Text style={Styles.infoText}>
                            Hệ thống sẽ dùng CV mặc định của bạn.
                        </Text>
                        <Button mode="contained" onPress={handleApply} disabled={applied}>
                            NỘP CV TRONG PROFILE
                        </Button>
                        <Button mode="text" onPress={pickerDocument} style={Styles.margin}>
                            Hoặc chọn file PDF khác?
                        </Button>
                    </View>
                ) : (
                    <View>
                        <Button
                            style={Styles.buttonUpload}
                            mode="outlined"
                            icon="file-pdf-box"
                            onPress={pickerDocument}
                        >
                            {cvFile ? `File: ${cvFile.name}` : "CHỌN FILE CV (PDF)"}
                        </Button>

                        {cvFile && (
                            <Button mode="contained" onPress={handleApply} disabled={applied}>
                                XÁC NHẬN NỘP FILE NÀY
                            </Button>
                        )}
                        {!cvFile && !user?.cv && (
                            <Text style={Styles.warningText}>
                                Vui lòng chọn file CV để ứng tuyển
                            </Text>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={Styles.container}>
            {job && (
                <View>
                    <Card style={Styles.card}>
                        <Card.Cover source={{ uri: job.employer_logo }} />
                        <Card.Content>
                            <Text style={Styles.title}>{job.name}</Text>
                            <Text style={Styles.row}>{job.employer_name}</Text>
                            <View style={Styles.row}>
                                <Chip icon="cash" style={Styles.chip}>{job.min_salary}-{job.max_salary}</Chip>
                                <Chip icon="map-marker" style={Styles.chip}>{job.location}</Chip>
                                <Chip icon="clock" style={Styles.chip}>Hạn: {job.deadline}</Chip>
                                <Chip icon="calendar-check" style={Styles.chip}>Trả lương: {job.payment_type}</Chip>
                                <TouchableOpacity onPress={openGoogleMaps}>
                                    <Chip icon="google-maps" style={Styles.chip}>Xem vị trí map</Chip>
                                </TouchableOpacity>
                            </View>
                        </Card.Content>
                        <View style={Styles.descriptionContainer}>
                            <Text style={Styles.sectionTitleJobDetail}>Skills</Text>
                            <Divider style={{ marginBottom: 10 }} />
                            <Text style={Styles.descriptionText}>{job.skills}</Text>

                            <Text style={Styles.sectionTitleJobDetail}>Mô tả công việc</Text>
                            <Divider style={{ marginBottom: 10 }} />
                            <Text style={Styles.descriptionText}>{job.description}</Text>

                            {renderApplySection()}
                        </View>
                        <View style={Styles.descriptionContainer}>
                            <Text style={Styles.sectionTitleJobDetail}>Ảnh môi trường làm việc:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {job.company_images && job.company_images.map((imgUrl, index) => (
                                    <Image
                                        key={index}
                                        source={{ uri: imgUrl }}
                                        style={{ width: 100, height: 80, marginRight: 10, borderRadius: 10 }}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    </Card>
                    {user?.role == 'candidate' &&
                        <View style={{ marginBottom: 50 }} >
                            <MyButton onPress={() => nav.navigate("Chat", {
                                employer: {
                                    id: job.employer.user.id,
                                    logo: job.employer.logo,
                                    name: job.employer.company_name
                                }
                            })} label="Liên hệ" icon="message-text" />
                        </View>
                    }

                </View>
            )}
        </ScrollView>
    );
};

export default JobDetails;