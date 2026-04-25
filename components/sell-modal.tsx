import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { showToast } from "@/components/ui/toast";
import { actions, useStore, type Product } from "@/lib/store";
import { t, formatPeso } from "@/lib/i18n";

type SellResult = { productId: string; newStock: number } | undefined;

export function SellModal({
  product,
  visible,
  onClose,
}: {
  product: Product;
  visible: boolean;
  onClose: (result?: SellResult) => void;
}) {
  const colors = useColors();
  const debtors = useStore((s) => s.debtors);

  const [quantity, setQuantity] = useState("1");
  const [mode, setMode] = useState<"choose" | "utang">("choose");
  const [debtorId, setDebtorId] = useState<string>("");
  const [newDebtorMode, setNewDebtorMode] = useState(false);
  const [newDebtorName, setNewDebtorName] = useState("");

  const qtyNum = parseInt(quantity, 10) || 0;
  const total = qtyNum * product.price;

  const debtorOptions = useMemo(
    () => debtors.map((d) => ({ label: d.name, value: d.id })),
    [debtors],
  );

  const reset = () => {
    setQuantity("1");
    setMode("choose");
    setDebtorId("");
    setNewDebtorMode(false);
    setNewDebtorName("");
  };

  const handleClose = (result?: SellResult) => {
    reset();
    onClose(result);
  };

  const validateQty = (): boolean => {
    if (qtyNum <= 0) {
      showToast("Mali ang bilang", "error");
      return false;
    }
    if (qtyNum > product.stock) {
      showToast(t.insufficientStock, "error");
      return false;
    }
    return true;
  };

  const handleCash = () => {
    if (!validateQty()) return;
    const r = actions.recordSale({
      productId: product.id,
      quantity: qtyNum,
      type: "cash",
    });
    if ("error" in r) {
      showToast(r.error, "error");
      return;
    }
    showToast(t.saleSuccess, "success");
    handleClose({ productId: product.id, newStock: r.product.stock });
  };

  const handleUtangSubmit = () => {
    if (!validateQty()) return;

    let chosenDebtorId = debtorId;
    let chosenDebtorName = "";

    if (newDebtorMode) {
      const trimmed = newDebtorName.trim();
      if (!trimmed) {
        showToast("Ilagay ang pangalan ng suki", "error");
        return;
      }
      const newDebtor = actions.addDebtor(trimmed);
      chosenDebtorId = newDebtor.id;
      chosenDebtorName = newDebtor.name;
    } else {
      if (!chosenDebtorId) {
        showToast("Pumili ng suki", "error");
        return;
      }
      const found = debtors.find((d) => d.id === chosenDebtorId);
      chosenDebtorName = found?.name || "";
    }

    const r = actions.recordSale({
      productId: product.id,
      quantity: qtyNum,
      type: "utang",
      debtorId: chosenDebtorId,
      debtorName: chosenDebtorName,
    });
    if ("error" in r) {
      showToast(r.error, "error");
      return;
    }
    showToast(`Naidagdag sa utang ni ${chosenDebtorName}`, "success");
    handleClose({ productId: product.id, newStock: r.product.stock });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => handleClose()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={() => handleClose()}
          style={{
            ...StyleAbsoluteFill,
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
            maxHeight: "90%",
          }}
        >
          {/* Drag handle */}
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <View
              style={{
                width: 38,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
              }}
            />
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
              {t.sellTitle}
            </Text>
            <IconButton icon="xmark" onPress={() => handleClose()} color={colors.muted} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Product summary */}
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, lineHeight: 20 }}>
                {product.name}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 }}>
                {product.category} · Stok: {product.stock}
              </Text>
              <Text style={{ fontSize: 14, color: colors.foreground, marginTop: 6, lineHeight: 18 }}>
                {formatPeso(product.price)} {t.perUnit}
              </Text>
            </View>

            <Input
              label={t.quantity}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="1"
              containerStyle={{ marginBottom: 12 }}
            />

            <View
              style={{
                backgroundColor: colors.primary + "12",
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18, fontWeight: "600" }}>
                {t.total}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.primary, lineHeight: 26 }}>
                {formatPeso(total)}
              </Text>
            </View>

            {mode === "choose" ? (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Button
                  title={t.payCash}
                  iconLeft="banknote"
                  onPress={handleCash}
                  style={{ flex: 1 }}
                />
                <Button
                  title={t.addToUtang}
                  iconLeft="creditcard.fill"
                  variant="secondary"
                  onPress={() => setMode("utang")}
                  style={{ flex: 1 }}
                />
              </View>
            ) : (
              <View>
                {!newDebtorMode ? (
                  <>
                    {debtorOptions.length > 0 && (
                      <Select
                        label={t.selectDebtor}
                        value={debtorId}
                        options={debtorOptions}
                        onChange={setDebtorId}
                        placeholder="Pumili ng suki"
                        containerStyle={{ marginBottom: 10 }}
                      />
                    )}
                    <Button
                      title={t.newDebtor}
                      variant="outline"
                      onPress={() => setNewDebtorMode(true)}
                      iconLeft="plus"
                      size="sm"
                      style={{ marginBottom: 14, alignSelf: "flex-start" }}
                    />
                  </>
                ) : (
                  <View style={{ marginBottom: 14 }}>
                    <Input
                      label={t.debtorName}
                      value={newDebtorName}
                      onChangeText={setNewDebtorName}
                      placeholder={t.debtorName}
                      containerStyle={{ marginBottom: 8 }}
                    />
                    <Pressable onPress={() => setNewDebtorMode(false)}>
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: 12,
                          textAlign: "right",
                          lineHeight: 16,
                        }}
                      >
                        Bumalik sa listahan ng suki
                      </Text>
                    </Pressable>
                  </View>
                )}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Button
                    title={t.cancel}
                    variant="ghost"
                    onPress={() => setMode("choose")}
                    style={{ flex: 1, borderWidth: 1, borderColor: colors.border }}
                  />
                  <Button
                    title={t.confirm}
                    iconLeft="checkmark"
                    variant="secondary"
                    onPress={handleUtangSubmit}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const StyleAbsoluteFill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
