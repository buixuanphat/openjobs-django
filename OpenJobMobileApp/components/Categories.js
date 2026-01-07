import { useEffect, useState } from "react";
import Apis, {endpoints} from "../utils/Apis";
import { Chip } from "react-native-paper";
import { View } from "react-native";
import MyStyles from "../styles/MyStyles";

const Categories=()=>{
    const [categories,setCategories]=useState([]);

    const loadCates=async()=>{
        let res=await Apis.get(endpoints['categories']);
        setCategories(res.data);

        

    }

    useEffect(()=>{
        loadCates();
    },[]);

    return (
       <View style={MyStyles.row}>
            {categories.map(c=>
                <Chip style={MyStyles.margin} key={c.id} icon='label'>{c.name}</Chip>)}
       </View>
    );
}

export default Categories;