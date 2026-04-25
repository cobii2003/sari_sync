import { ActivityIndicator, Pressable, Text, View, ViewStyle, StyleProp } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./icon-symbol";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ComponentProps<typeof IconSymbol>["name"];
  iconRight?: React.ComponentProps<typeof IconSymbol>["name"];
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  loading,
  disabled,
  style,
  fullWidth,
}: Props) {
  const colors = useColors();

  const sizeMap = {
    sm: { paddingV: 8, paddingH: 12, font: 13, icon: 16 },
    md: { paddingV: 12, paddingH: 16, font: 15, icon: 18 },
    lg: { paddingV: 16, paddingH: 20, font: 17, icon: 20 },
  }[size];

  const variantStyles: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: "#FFFFFF" },
    secondary: { bg: colors.secondary, fg: "#FFFFFF" },
    outline: { bg: "transparent", fg: colors.primary, border: colors.primary },
    ghost: { bg: "transparent", fg: colors.foreground },
    danger: { bg: colors.error, fg: "#FFFFFF" },
  };
  const v = variantStyles[variant];

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: sizeMap.paddingV,
          paddingHorizontal: sizeMap.paddingH,
          borderRadius: 12,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
          alignSelf: fullWidth ? "stretch" : "auto",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <>
          {iconLeft && <IconSymbol name={iconLeft} size={sizeMap.icon} color={v.fg} />}
          <Text
            style={{
              color: v.fg,
              fontSize: sizeMap.font,
              fontWeight: "600",
              lineHeight: sizeMap.font * 1.3,
            }}
          >
            {title}
          </Text>
          {iconRight && <IconSymbol name={iconRight} size={sizeMap.icon} color={v.fg} />}
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  color,
  size = 22,
  bg,
  disabled,
  style,
}: {
  icon: React.ComponentProps<typeof IconSymbol>["name"];
  onPress: () => void;
  color?: string;
  size?: number;
  bg?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const fg = color || colors.foreground;
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: size + 18,
          height: size + 18,
          borderRadius: (size + 18) / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg || "transparent",
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <IconSymbol name={icon} size={size} color={fg} />
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
