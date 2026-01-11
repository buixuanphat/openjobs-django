import { useEffect, useState } from "react";
import Apis, {endpoints} from "../utils/Apis";
import { Chip } from "react-native-paper";
import { ScrollView, TouchableOpacity, View } from "react-native";
import MyStyles from "../styles/MyStyles";

const Categories=({setCateId})=>{
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
            <TouchableOpacity onPress={() => setCateId(null)}>
                <Chip style={MyStyles.margin}  icon='label'>Tất cả</Chip>
            </TouchableOpacity>
            <ScrollView horizontal>
                {categories.map(c=><TouchableOpacity key={c.id} onPress={() => setCateId(c.id)}>
                     <Chip style={MyStyles.margin} key={c.id} icon='label'>{c.name}</Chip>
                </TouchableOpacity>
                )}               
            </ScrollView>
       </View>
    );
}

export default Categories;