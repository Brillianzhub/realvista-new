import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Modal,
} from "react-native";
import { Image } from "expo-image";
import Carousel from "react-native-reanimated-carousel";
import moment from "moment";

const { width: screenWidth } = Dimensions.get("window");
const aspectRatio = 1.5;
const carouselImageHeight = screenWidth / aspectRatio;

interface ImageItem {
    file: string;
}

interface ImageCarouselProps {
    images: ImageItem[];
    listed_date?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
    images,
    listed_date,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);

    const formattedDate = listed_date ? moment(listed_date).fromNow() : "";

    if (!images || images.length === 0) {
        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>No images available</Text>
            </View>
        );
    }

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {images.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        index === activeIndex ? styles.activeDot : styles.inactiveDot,
                    ]}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.carouselContainer}>
            {/* Inline carousel */}
            <Carousel
                width={screenWidth}
                height={carouselImageHeight}
                data={images}
                loop={false}
                onSnapToItem={(index) => setActiveIndex(index)}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Image
                            source={{ uri: item.file }}
                            style={styles.carouselImage}
                            contentFit="cover"
                        />
                        {listed_date && (
                            <View style={styles.listedDateContainer}>
                                <Text style={styles.listedDateText}>Listed - {formattedDate}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            />

            {renderDots()}

            {/* Fullscreen modal carousel */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Carousel
                        width={screenWidth}
                        height={Dimensions.get("window").height}
                        data={images}
                        loop={false}
                        defaultIndex={activeIndex}
                        onSnapToItem={(index) => setActiveIndex(index)}
                        renderItem={({ item }) => (
                            <View style={styles.slide}>
                                <Image
                                    source={{ uri: item.file }}
                                    style={styles.fullScreenImage}
                                    contentFit="contain"
                                />
                            </View>
                        )}
                    />

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default ImageCarousel;

const styles = StyleSheet.create({
    carouselContainer: {
        width: "100%",
        height: carouselImageHeight,
    },
    carouselImage: {
        width: "100%",
        height: carouselImageHeight,
        borderRadius: 10,
    },
    listedDateContainer: {
        position: "absolute",
        bottom: 10,
        left: 10,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
    },
    listedDateText: {
        color: "#fff",
        fontSize: 12,
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: "#358B8B",
    },
    inactiveDot: {
        backgroundColor: "#ccc",
    },
    placeholderContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: carouselImageHeight,
        backgroundColor: "#f0f0f0",
    },
    placeholderText: {
        fontSize: 16,
        color: "#888",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
    },
    slide: {
        width: screenWidth,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    fullScreenImage: {
        width: screenWidth,
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.7)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
    },
});
