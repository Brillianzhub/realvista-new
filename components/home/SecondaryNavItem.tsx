// // SecondaryNavItem.tsx
// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'; // Add Image import
// import { Href } from "expo-router";

// interface SecondaryNavItemProps {
//     title: string;
//     icon: React.ComponentType<any>;
//     color: string;
//     route: Href;
//     onPress: () => void;
// }

// const SecondaryNavItem: React.FC<SecondaryNavItemProps> = ({
//     title,
//     icon,
//     color,
//     onPress
// }) => {
//     return (
//         <TouchableOpacity
//             style={styles.itemContainer}
//             onPress={onPress}
//             activeOpacity={0.7}
//         >
//             <View style={[styles.iconContainer, { backgroundColor: color }]}>
//                 <item.icon size={24} color="#ffffff" />
//             </View>
//             <Text style={styles.itemText}>{title}</Text>
//         </TouchableOpacity>
//     );
// };

// const styles = StyleSheet.create({
//     itemContainer: {
//         width: '33.333%',
//         alignItems: 'center',
//         paddingVertical: 16,
//         minHeight: 100,
//     },
//     iconContainer: {
//         width: 56,
//         height: 56,
//         borderRadius: 16,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 8,
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2
//         },
//         shadowOpacity: 0.15,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     itemText: {
//         fontSize: 12,
//         fontWeight: '600',
//         color: '#374151',
//         textAlign: 'center',
//         marginTop: 4,
//     },
// });

// export default SecondaryNavItem;