import { TextInput, TextInputProps, View, Text, StyleProp, ViewStyle } from "react-native";

import { useColors } from "@/hooks/use-colors";

type Props = Omit<TextInputProps, "style"> & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({ label, error, containerStyle, ...rest }: Props) {
  const colors = useColors();
  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            color: colors.muted,
            fontSize: 12,
            marginBottom: 4,
            marginLeft: 4,
            fontWeight: "500",
            lineHeight: 16,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={colors.muted}
        {...rest}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? colors.error : colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: colors.foreground,
          minHeight: 46,
        }}
      />
      {error && (
        <Text
          style={{
            color: colors.error,
            fontSize: 11,
            marginTop: 4,
            marginLeft: 4,
            lineHeight: 14,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
