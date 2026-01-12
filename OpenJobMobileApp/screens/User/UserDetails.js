import { useContext } from "react";
import { MyUserContext } from "../../utils/MyContexts";
import { Image, ScrollView, View,Text } from "react-native";
import { Card, Chip, Divider, List } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import moment from 'moment';
import Styles from "../Home/Styles";

const UserDetails=()=>{
    const [user]=useContext(MyUserContext);

    return(
        <ScrollView style={[MyStyles.container,MyStyles.padding,MyStyles.margin]}>
            <View style={MyStyles.margin}>
                <Chip icon="shield-check" style={{ marginTop: 10 }}>
                    {user.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                </Chip>
            </View>
            <Card>
                <List.Section>
                    <List.Subheader style={Styles.subheader}>Thông Tin Cơ Bản</List.Subheader>
                    <List.Item 
                        title="Họ và tên"
                        description={`${user.first_name} ${user.last_name}`}
                        left={props => <List.Icon {...props} icon="account"/>}
                    />
                    <Divider/>
                    <List.Item 
                        title="Giới tính"
                        description={user.gender}
                        left={props => <List.Icon {...props} icon="gender-male-female"/>}
                    />
                    <Divider/>
                    <List.Item 
                        title="Ngày sinh"
                        description={user.date_of_birth ? moment(user.date_of_birth).format('DD/MM/YYYY') : "Chưa cập nhật"}
                        left={props => <List.Icon {...props} icon="calendar-range"/>}
                    />
                    <List.Item
                        title="Email"
                        description={user.email}
                        left={props => <List.Icon {...props} icon="email-outline" />}
                    />
                    <Divider />

                    <List.Item
                        title="Số điện thoại"
                        description={user.phone_number}
                        left={props => <List.Icon {...props} icon="phone-outline" />}
                    />
                </List.Section>
            </Card>
            <Divider/>
            {user.role==='employer'&&(
                <Card style={MyStyles.margin}>
                    <Card.Content>
                        <List.Section>
                            <List.Subheader style={Styles.subheader}>Thông tin doanh nghiệp</List.Subheader>
                            <List.Item
                                title="Tên công ty"
                                description={user.company_name }
                                left={props => <List.Icon {...props} icon="domain" />}
                            />
                            <Divider />
                            <List.Item
                                title="Mã số thuế"
                                description={user.tax_code}
                                left={props => <List.Icon {...props} icon="file-certificate" />}
                            />
                            <Divider />
                            <List.Item
                                title="Địa chỉ"
                                description={user.address}
                                left={props => <List.Icon {...props} icon="map-marker" />}
                            />
                        </List.Section>
                    </Card.Content>
                    <View style={MyStyles.margin}>
                        <Text style={Styles.subheader}>Ảnh môi trường làm việc:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {user.company_images.map((imgUrl, index) => (
                                <Image
                                    key={index} 
                                    source={{ uri: imgUrl }} 
                                    style={{ width: 100, height: 80, marginRight: 10, borderRadius: 10 }} 
                                />
                            ))}
                        </ScrollView>
                    </View>
                </Card>
            )}
        </ScrollView>
    );
};

export default UserDetails;