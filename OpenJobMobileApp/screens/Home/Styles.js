import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 10,
    },
    card: {
        marginBottom: 15,
        borderRadius: 12,
        elevation: 4,
        backgroundColor: "#fff",
        overflow: 'hidden', 
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a73e8",
        marginVertical: 10,
        textAlign: 'center',
    },
    chip: {
        backgroundColor: "#e3f2fd",
    },
    margin:{
        marginTop:20,
    },

    
    jobs: {
        fontSize: 30,
        color: "purple",
        fontWeight: 'bold',
    },
    sectionTitleJobDetail:{
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a73e8",
        marginVertical: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2c3e50",
    },
    descriptionContainer: {
        padding: 15,
        backgroundColor: "#fff",
        minHeight: 200,
    },
    descriptionText: {
        lineHeight: 24,
        color: "#444",
        textAlign: "justify",
    },

   
    applyContainer: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed', 
    },
    buttonApply: {
        marginTop: 10,
        padding: 5,
    },
    buttonUpload: {
        marginVertical: 10,
        borderRadius: 8,
        borderColor: '#1a73e8',
    },
    infoText: {
        fontSize: 14,
        color: '#2e7d32', 
        textAlign: 'center',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    warningText: {
        fontSize: 14,
        color: '#d32f2f', 
        textAlign: 'center',
        marginBottom: 10,
    },

    // --- STYLES CHO DANH SÁCH HỒ SƠ (APPLICATIONS) ---
    statusBadge: {
        alignSelf: 'flex-start',
        borderRadius: 20,
        marginTop: 5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#7f8c8d',
        fontSize: 16,
    },
});