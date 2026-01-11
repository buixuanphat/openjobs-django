import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container:{
        flex: 1,
        marginTop: 60,
    },
    row:{
        flexDirection: "row",
        flexWrap:"wrap",
    },
    margin:{
        margin:5,
    },
    padding:{
        padding:8,
       
    },
    logo:{
        width: 50,
        height: 50,
        borderRadius: 10
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#1A73E8",
        alignSelf: "center",
        textAlign: "center",
    },
   avatar:{
        width: 60,
        height: 60,
        borderRadius: 50
   },radioContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        backgroundColor: "#e8deecff",
    },
    radioLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    radioItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
    },pickerBtn: {
        backgroundColor: "#e8deecff",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "#666",
        marginVertical: 10,
    },
    pickerText: {
        color: "black",
        fontWeight: "600",
    },
    contentContainer:{
        paddingBottom:100
    },
    avatarProfile:{
        width: 120,
        height: 120,
        borderRadius: 90,
    },

})