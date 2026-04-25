import { useEffect, useRef, useState } from "react";
import { Animated, View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/use-colors";

type ToastVariant = "success" | "error" | "info" | "warning";
type ToastMsg = { id: number; text: string; variant: ToastVariant };

const listeners = new Set<(msg: ToastMsg) => void>();
let counter = 0;

export function showToast(text: string, variant: ToastVariant = "info") {
  const msg: ToastMsg = { id: ++counter, text, variant };
  listeners.forEach((l) => l(msg));
}

export function ToastHost() {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const colors = useColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const handler = (m: ToastMsg) => {
      setMsg(m);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      const timeout = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
          setMsg(null);
        });
      }, 2200);
      return () => clearTimeout(timeout);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [opacity]);

  if (!msg) return null;

  const bg =
    msg.variant === "success"
      ? colors.success
      : msg.variant === "error"
      ? colors.error
      : msg.variant === "warning"
      ? colors.warning
      : colors.primary;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.host,
        {
          opacity,
          top: insets.top + (Platform.OS === "web" ? 16 : 24),
        },
      ]}
    >
      <View
        style={{
          backgroundColor: bg,
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 24,
          maxWidth: "90%",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "600",
            lineHeight: 20,
            textAlign: "center",
          }}
        >
          {msg.text}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
});
