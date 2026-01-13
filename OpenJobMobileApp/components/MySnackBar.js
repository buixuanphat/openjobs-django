import { useState } from "react";
import { Snackbar } from "react-native-paper";
import MyColor from "../utils/MyColor";

const MySnackBar = ({ label, visible, setVisible, isSuccess }) => {

    return (
        <Snackbar
            style={{ backgroundColor: isSuccess ? MyColor.success : MyColor.red }}
            visible={visible}
            onDismiss={setVisible}
            duration={3000}
        >
            {label}
        </Snackbar>
    );
};

export default MySnackBar;
