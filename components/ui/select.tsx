import { useState } from "react";
import { Pressable, Text, View, Modal, FlatList, StyleProp, ViewStyle } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./icon-symbol";

type Option = { label: string; value: string };

type Props = {
  label?: string;
  value?: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Select({ label, value, options, onChange, placeholder, containerStyle }: Props) {
  const colors = useColors();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

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
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          minHeight: 46,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            color: selected ? colors.foreground : colors.muted,
            fontSize: 15,
            lineHeight: 20,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {selected?.label || placeholder || "Pumili..."}
        </Text>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} style={{ transform: [{ rotate: "90deg" }] }} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              width: "100%",
              maxWidth: 360,
              maxHeight: "70%",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 16,
                  fontWeight: "600",
                  lineHeight: 20,
                }}
              >
                {label || "Pumili"}
              </Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isActive = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 18,
                      paddingVertical: 14,
                      backgroundColor: isActive ? colors.primary + "15" : pressed ? colors.border + "60" : "transparent",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    })}
                  >
                    <Text
                      style={{
                        color: isActive ? colors.primary : colors.foreground,
                        fontSize: 15,
                        lineHeight: 20,
                        fontWeight: isActive ? "600" : "400",
                      }}
                    >
                      {item.label}
                    </Text>
                    {isActive && <IconSymbol name="checkmark" size={18} color={colors.primary} />}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
