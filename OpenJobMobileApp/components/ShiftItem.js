import { Text, View, StyleSheet } from "react-native"
import { Icon } from "react-native-paper"

const ShiftItem = ({ shift }) => {
    return (
        <View style={styles.container}>
            <Icon size={28} source="clock-time-four" />

            <View style={styles.info}>
                <Text style={styles.name}>{shift.name}</Text>

                <Text style={styles.time}>
                    {shift.start_time} - {shift.end_time}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        marginVertical: 6,
        borderRadius: 10,
        gap: 8
    },
    info: {
        flexDirection: 'column'
    },
    name: {
        fontSize: 16,
        fontWeight: '600'
    },
    time: {
        marginTop: 4,
        color: '#666'
    }
})

export default ShiftItem
