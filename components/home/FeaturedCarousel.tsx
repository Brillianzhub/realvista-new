import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import images from '@/constants/images';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselItem {
    id: string;
    title: string;
    image: any; // for local images
    description: string;
}

export default function FeaturedCarousel() {
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const nextSlide = (activeSlide + 1) % carouselItems.length;
            setActiveSlide(nextSlide);
            scrollViewRef.current?.scrollTo({
                x: nextSlide * screenWidth,
                animated: true,
            });
        }, 4000);

        return () => clearInterval(timer);
    }, [activeSlide]);

    // Define carousel items inside this component
    const carouselItems: CarouselItem[] = [
        {
            id: '1',
            title: 'Boost Your Sales',
            image: images.carouselOne,
            description: 'Learn proven strategies to increase your revenue and close more deals.',
        },
        {
            id: '2',
            title: 'Set & Achieve Targets',
            image: images.carouselTwo,
            description: 'Plan your goals and track your progress using our Target Calculator.',
        },

        {
            id: '3',
            title: 'Real Estate Investment',
            image: images.carouselThree,
            description: 'Invest in premium real estate opportunities',
        },
        {
            id: '4',
            title: 'Start Your Property Journey',
            image: images.carouselFour,
            description: 'Invest in real estate with as little as you need and grow your portfolio.',
        },
        {
            id: '5',
            title: 'Invest Together',
            image: images.carouselFive,
            description: 'Pool resources with friends and grow your investment portfolio collectively.',
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            const nextSlide = (activeSlide + 1) % carouselItems.length;
            setActiveSlide(nextSlide);
            scrollViewRef.current?.scrollTo({
                x: nextSlide * screenWidth,
                animated: true,
            });
        }, 4000);

        return () => clearInterval(timer);
    }, [activeSlide, carouselItems.length]);

    return (
        <View style={styles.carouselContainer}>
            <Text style={styles.carouselTitle}>Featured Opportunities</Text>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                    setActiveSlide(slideIndex);
                }}
            >
                {carouselItems.map((item) => (
                    <View key={item.id} style={styles.carouselItem}>
                        <Image source={item.image} style={styles.carouselImage} />
                        <View style={styles.carouselContent}>
                            <Text style={styles.carouselItemTitle}>{item.title}</Text>
                            <Text style={styles.carouselItemDescription}>{item.description}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.pagination}>
                {carouselItems.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            index === activeSlide
                                ? styles.activeDot
                                : styles.inactiveDot,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    carouselContainer: {
        marginTop: 24,
        marginBottom: 32,
    },
    carouselTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 20,
        marginBottom: 16,
    },
    carouselItem: {
        width: screenWidth - 32,
        marginHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
    },
    carouselImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    carouselContent: {
        padding: 20,
    },
    carouselItemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    carouselItemDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 24, // rectangular width
        height: 8,
        borderRadius: 4, // slightly rounded corners
        backgroundColor: 'rgba(53, 139, 139, 1)',
    },
    inactiveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d1d5db',
    },
});
