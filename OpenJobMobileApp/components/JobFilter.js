import { useEffect, useState } from "react";
import Apis, { endpoints } from "../utils/Apis";
import { ScrollView, View } from "react-native";
import { Chip, Searchbar } from "react-native-paper";
import MyStyles from "../styles/MyStyles";

const JobFilter=({name, setName, location, setLocation, min_salary, setMinSalary, working_time, setWorkingTime})=>{
    const [showLoc, setShowLoc] = useState(false);
    const [showSal, setShowSal] = useState(false);
    const [showWT, setShowWT]=useState(false);
    return(
        <View>
             <Searchbar placeholder="Tìm việc làm..." value={name} onChangeText={setName}/>
             <ScrollView horizontal >
                <Chip icon="map-marker" style={[MyStyles.margin,MyStyles.padding]} onPress={() => {
                    setShowLoc(!showLoc);
                }}>{location || "Địa điểm"}</Chip>
                <Chip icon="cash" style={[MyStyles.margin,MyStyles.padding]} onPress={() => {
                    setShowSal(!showSal);
                }}>{min_salary? `Lương từ: ${min_salary}tr` :"Mức lương"}</Chip>
                <Chip icon="clock" style={[MyStyles.margin,MyStyles.padding]} onPress={() => {
                    setShowWT(!showWT);
                }}>{working_time ||"Thời gian làm việc"}</Chip>
            </ScrollView>
            {showLoc &&(
                <Searchbar placeholder="Nhập địa điểm..." value={location} 
                onChangeText={setLocation} icon="close" onIconPress={()=>{
                    setLocation("");
                    setShowLoc(false);
                }}/>
            )}
            {showSal && (
                <Searchbar placeholder="Lương tối thiểu..." value={min_salary}
                onChangeText={setMinSalary} icon="close" onIconPress={()=>{
                    setMinSalary("");
                    setShowSal(false);
                }}/>
            )}
            {showWT && (
                <Searchbar placeholder="Nhập thời gian làm việc..." value={working_time}
                    onChangeText={setWorkingTime} icon="close" onIconPress={()=>{
                        setWorkingTime("");
                        setShowWT(false);
                }}/>
            )}
        </View>
    );
}

export default JobFilter;