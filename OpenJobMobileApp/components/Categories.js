import { useEffect, useState } from "react";
import Apis, {endpoints} from "../utils/Apis";
import { Chip } from "react-native-paper";
import { View } from "react-native";

const Categories=()=>{
    const [categories,setCatetogories]=useState([]);

    const loadCates=async()=>{
        let res=await Apis.get(endpoints['categories']);
        setCatetogories(res.data);
    }

    useEffect(()=>{
        loadCates();
    },[]);

    return (
       <View>
            {categories.map(c=>
                <Chip key={c.id} icon='label'>{c.name}</Chip>)}
       </View>
    );
}

export default Categories;