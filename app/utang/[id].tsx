import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Button, Card, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { showToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm";
import { actions, getDebtorBalance, useStore, type DebtTransaction } from "@/lib/store";
import { t, formatPeso, formatDateTime } from "@/lib/i18n";

export default function DebtorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const debtor = useStore((s) => s.debtors.find((d) => d.id === id));
  const transactions = useStore((s) => s.debtTransactions.filter((t) => t.debtorId === id));
  const balance = useMemo(() => getDebtorBalance(id || "", transactions), [id, transactions]);
  const [showPay, setShowPay] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (!debtor) {
    return (
      <ScreenContainer
        edges={["top", "left", "right"]}
        style={{ backgroundColor: colors.background }}
      >
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
            Walang nakitang suki.
          </Text>
          <Button title="Bumalik" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      </ScreenContainer>
    );
  }

  const sortedTxns = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  const handleDelete = () => {
    actions.deleteDebtor(debtor.id);
    showToast(`${debtor.name} ay binura.`, "info");
    router.back();
  };

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 18,
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <IconButton icon="arrow.left" onPress={() => router.back()} color="#FFFFFF" />
        <Text
          style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "700", flex: 1, lineHeight: 26 }}
          numberOfLines={1}
        >
          {debtor.name}
        </Text>
        <IconButton icon="trash" onPress={() => setShowDelete(true)} color="#FFFFFF" />
      </View>

      <FlatList
        data={sortedTxns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          gap: 10,
        }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 14 }}>
            <Card>
              <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600", lineHeight: 16 }}>
                Natitirang Utang
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "800",
                  color: balance > 0 ? colors.secondary : colors.success,
                  marginTop: 4,
                  lineHeight: 40,
                }}
              >
                {formatPeso(Math.max(balance, 0))}
              </Text>
              {debtor.notes && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    marginTop: 6,
                    fontStyle: "italic",
                    lineHeight: 16,
                  }}
                >
                  {debtor.notes}
                </Text>
              )}
            </Card>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                title={t.pay}
                iconLeft="banknote"
                onPress={() => setShowPay(true)}
                style={{ flex: 1 }}
                disabled={balance <= 0}
              />
              <Button
                title={t.addManualUtang}
                iconLeft="plus"
                variant="outline"
                onPress={() => setShowAddDebt(true)}
                style={{ flex: 1 }}
              />
            </View>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.foreground,
                marginTop: 4,
                lineHeight: 18,
              }}
            >
              {t.history}
            </Text>
          </View>
        }
        renderItem={({ item }) => <TxnRow txn={item} />}
        ListEmptyComponent={
          <Card style={{ alignItems: "center", paddingVertical: 24 }}>
            <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>
              {t.noTransactions}
            </Text>
          </Card>
        }
      />

      <AmountModal
        visible={showPay}
        title={t.pay}
        confirmLabel={t.confirm}
        confirmVariant="primary"
        onClose={() => setShowPay(false)}
        onSubmit={(amount, note) => {
          actions.recordPayment(debtor.id, amount, note);
          showToast(`Naitala ang bayad na ${formatPeso(amount)}`, "success");
          setShowPay(false);
        }}
        max={balance}
      />

      <AmountModal
        visible={showAddDebt}
        title={t.addManualUtang}
        confirmLabel={t.save}
        confirmVariant="secondary"
        onClose={() => setShowAddDebt(false)}
        onSubmit={(amount, note) => {
          actions.addManualDebt(debtor.id, amount, note);
          showToast(`Naidagdag sa utang: ${formatPeso(amount)}`, "success");
          setShowAddDebt(false);
        }}
      />

      <ConfirmDialog
        visible={showDelete}
        title={`Burahin si ${debtor.name}?`}
        message="Mawawala rin ang lahat ng kasaysayan ng utang."
        confirmLabel={t.yesDelete}
        cancelLabel={t.no}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </ScreenContainer>
  );
}

function TxnRow({ txn }: { txn: DebtTransaction }) {
  const colors = useColors();
  const isAdd = txn.type === "add";
  const color = isAdd ? colors.secondary : colors.success;
  const sign = isAdd ? "+" : "−";
  return (
    <Card style={{ paddingVertical: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: color + "22",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconSymbol
            name={isAdd ? "creditcard.fill" : "banknote"}
            size={16}
            color={color}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground, lineHeight: 17 }}>
            {isAdd ? "Inutang" : "Bayad"}
          </Text>
          {txn.description && (
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1, lineHeight: 14 }} numberOfLines={1}>
              {txn.description}
            </Text>
          )}
          <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2, lineHeight: 13 }}>
            {formatDateTime(txn.timestamp)}
          </Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: "700", color, lineHeight: 19 }}>
          {sign}
          {formatPeso(txn.amount)}
        </Text>
      </View>
    </Card>
  );
}

function AmountModal({
  visible,
  title,
  confirmLabel,
  confirmVariant,
  onClose,
  onSubmit,
  max,
}: {
  visible: boolean;
  title: string;
  confirmLabel: string;
  confirmVariant: "primary" | "secondary";
  onClose: () => void;
  onSubmit: (amount: number, note?: string) => void;
  max?: number;
}) {
  const colors = useColors();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleClose = () => {
    setAmount("");
    setNote("");
    onClose();
  };

  const handleSubmit = () => {
    const a = parseFloat(amount.replace(",", "."));
    if (isNaN(a) || a <= 0) {
      showToast("Mali ang halaga", "error");
      return;
    }
    if (max !== undefined && a > max) {
      showToast(`Hindi pwede mas malaki sa ${formatPeso(max)}`, "error");
      return;
    }
    onSubmit(a, note.trim() || undefined);
    setAmount("");
    setNote("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={handleClose}
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
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, lineHeight: 24 }}>
              {title}
            </Text>
            <IconButton icon="xmark" onPress={handleClose} color={colors.muted} />
          </View>

          <Input
            label={t.amount}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            containerStyle={{ marginBottom: 12 }}
          />
          <Input
            label={t.notesOptional}
            value={note}
            onChangeText={setNote}
            placeholder=""
            containerStyle={{ marginBottom: 16 }}
          />

          <Button
            title={confirmLabel}
            onPress={handleSubmit}
            variant={confirmVariant}
            iconLeft="checkmark"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
