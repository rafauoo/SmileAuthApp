import { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SFSymbol, SymbolView } from "expo-symbols";
import React from 'react'
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";

interface IconButtonProps {
  iosName: SFSymbol;
  androidName: ComponentProps<typeof Ionicons>["name"];
  containerPadding: number;
  containerWidth: number;
  iconSize: number;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  color: string
}

export default function IconButton({
  onPress,
  androidName,
  containerPadding,
  containerWidth,
  iconSize,
  iosName,
  containerStyle,
  color,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      style={[
        {
          backgroundColor: "#00000050",
          padding: containerPadding,
          borderRadius: (containerWidth + containerPadding * 2) / 2,
          width: containerWidth,
          height: containerWidth,
        },
        containerStyle,
      ]}
    >
      <SymbolView
        name={iosName}
        size={iconSize}
        tintColor={color}
        fallback={
          <Ionicons
            size={iconSize}
            name={androidName}
            style={{}}
            color={color}
          />
        }
      />
    </TouchableOpacity>
  );
}
