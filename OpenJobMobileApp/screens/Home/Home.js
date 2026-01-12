import { View,Text } from "react-native"
import MyStyles from "../../styles/MyStyles"
import Styles from "./Styles";
import Categories from "../../components/Categories";
import Jobs from "../../components/Jobs";
import React, { useContext, useMemo, useState } from "react";
import JobFilter from "../../components/JobFilter";
import { MyUserContext } from "../../utils/MyContexts";
import { ScrollView } from "react-native";
import { UserSearchStrategy, CandidateSearchStrategy } from "../../utils/SearchStrategies";
import { useFocusEffect } from "@react-navigation/native";

const Home=()=>{
    const [cateId, setCateId] = useState(null);
    const [name,setName]=useState(null);
    const [location,setLocation]=useState(null);
    const [min_salary,setMinSalary]=useState(null);
    const [working_time,setWorkingTime]=useState(null);
    const [user]=useContext(MyUserContext);

    const finalParams = useMemo(() => {
        const baseParams = { cateId, name, location, working_time, min_salary };
        let strategy;
            try {
                if (user && user.role === 'candidate') {
                    strategy = new CandidateSearchStrategy(); 
                } else {
                    strategy = new UserSearchStrategy();
                }
                return strategy.buildParams(baseParams);
            } catch (ex) {
                console.error("Lỗi Strategy:", ex);
                return {};
            }
    }, [user, cateId, name, location, min_salary, working_time]);

    

    return (   
        <>
            <Categories setCateId={setCateId}/>
                {user && user.role==='candidate' &&(
                    <JobFilter
                        name={name} setName={setName}
                        location={location} setLocation={setLocation}
                        min_salary={min_salary} setMinSalary={setMinSalary}
                        working_time={working_time} setWorkingTime={setWorkingTime}/>
                    )}
                    <Jobs {...finalParams}/>
        </>  
    )
}

export default Home;