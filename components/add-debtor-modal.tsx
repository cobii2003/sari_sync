import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { actions } from "@/lib/store";
import { t } from "@/lib/i18n";

export function AddDebtorModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      showToast("Kailangan ng pangalan", "error");
      return;
    }
    actions.addDebtor(name, notes);
    showToast(`${name.trim()} ay naidagdag`, "success");
    setName("");
    setNotes("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        />
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 28,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.foreground,
                lineHeight: 24,
              }}
            >
              {t.addDebtor}
            </Text>
            <IconButton icon="xmark" onPress={onClose} color={colors.muted} />
          </View>

          <Input
            label={t.debtorName}
            value={name}
            onChangeText={setName}
            placeholder="Hal: Aling Maria"
            containerStyle={{ marginBottom: 12 }}
          />
          <Input
            label={t.notesOptional}
            value={notes}
            onChangeText={setNotes}
            placeholder="Hal: Kapitbahay"
            multiline
            containerStyle={{ marginBottom: 16 }}
          />

          <Button title={t.save} iconLeft="checkmark" onPress={handleSave} fullWidth />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
