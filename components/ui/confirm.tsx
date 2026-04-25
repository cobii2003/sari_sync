import { Modal, Text, View, Pressable } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { Button } from "./button";

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Oo",
  cancelLabel = "Hindi",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const colors = useColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
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
            padding: 22,
            width: "100%",
            maxWidth: 360,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 8,
              lineHeight: 22,
            }}
          >
            {title}
          </Text>
          {message && (
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                lineHeight: 20,
                marginBottom: 18,
              }}
            >
              {message}
            </Text>
          )}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              title={cancelLabel}
              variant="ghost"
              onPress={onCancel}
              style={{ flex: 1, borderWidth: 1, borderColor: colors.border }}
            />
            <Button
              title={confirmLabel}
              variant={destructive ? "danger" : "primary"}
              onPress={onConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
