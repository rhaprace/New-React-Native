import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/theme";

const {width} = Dimensions.get("window");

export const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer:{
        flex: 1,
    },
    header:{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomColor: COLORS.surface,
    },
    headerTitle:{
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.white,
    },
    contentDisabled: {
        opacity: 0.7,
    },
    shareButton:{
        paddingHorizontal: 12,
        paddingVertical: 6,
        minWidth: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    shareButtonDisabled: {
        opacity: 0.5,
    },
    shareText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "600",
    },
    shareTextDisabled: {
        color: COLORS.gray,
    },
})