import React, { Children, useContext, useEffect, useState } from "react"
import { FlatList, ScrollView, View } from "react-native";
import { ActivityIndicator, Avatar, Card, Chip, IconButton, List, Searchbar, Text } from "react-native-paper";
import Apis, { authApis, endpoints } from "../utils/Apis";
import { Image } from "react-native";
import MyStyles from "../styles/MyStyles";
import { TouchableOpacity } from "react-native";
import JobFilter from "./JobFilter";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MyTokenContext } from "../utils/MyContexts";


const Jobs = ({ category_id, name, location, min_salary, working_time_id }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const nav = useNavigation();
    const [token] = useContext(MyTokenContext)

    const loadJobs = async (targetPage = page) => {

        if (targetPage <= 0) return;

        try {
            setLoading(true);
            let url = `${endpoints['jobs']}?page=${targetPage}`;

            if (name)
                url = `${url}&name=${name}`;
            if (location)
                url = `${url}&location=${location}`;
            if (min_salary)
                url = `${url}&min_salary=${min_salary}`;
            if (working_time_id)
                url = `${url}&working_time_id=${working_time_id}`;
            if (category_id)
                url = `${url}&category_id=${category_id}`;

            // console.info("URL GỬI ĐI:", url);
            let res = await authApis(token).get(url);

            if (targetPage === 1)
                setJobs(res.data.results);
            else
                setJobs(prev => [...prev, ...res.data.results]);

            if (res.data.next == null)
                setPage(0);
        } catch (ex) {
            console.error("Lỗi khi loadjobs", ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer = setTimeout(() => {
            setJobs([]);
            setPage(1);
            loadJobs(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [name, category_id, location, min_salary, working_time_id]);

    useEffect(() => {
        if (page > 1) {
            loadJobs(page);
        }
    }, [page]);

    const loadMore = () => {
        if (page > 0 && !loading && jobs.length > 0)
            setPage(page + 1);
    };

    return (
        <View style={[MyStyles.padding, { flex: 1 }]}>
            <FlatList onEndReached={loadMore} onEndReachedThreshold={0.1}
                ListEmptyComponent={!loading && <Text>Không tìm thấy việc làm phù hợp!</Text>}
                ListFooterComponent={loading && <ActivityIndicator size="large" />}
                data={jobs}
                renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => nav.navigate("JobDetails", { "jobId": item.id })}>
                        <Card style={MyStyles.margin}>
                            <Card.Title
                                key={item.id}
                                title={item.name}
                                subtitle={item.employer_name}
                                left={() => <Image style={MyStyles.logo} source={{ uri: item.employer.logo }} />}
                            />
                            <Card.Content>
                                <View style={MyStyles.row}>
                                    <Chip icon="cash" style={MyStyles.margin}>{Math.round(item.min_salary)}tr-{Math.round(item.max_salary)}tr</Chip>
                                    <Chip icon="map-marker" style={MyStyles.margin}>{item.location}</Chip>
                                    {item.shifts && item.shifts.map((shift) => (
                                        <Chip 
                                            key={shift.id} 
                                            icon="clock-outline" 
                                            style={MyStyles.margin}
                                        >
                                            {shift.name}  
                                        </Chip>
                                    ))}
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                }
            />
        </View>
    );
}

export default Jobs;