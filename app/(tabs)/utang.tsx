import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Button, Card } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useStore, useHydration, getDebtorBalance, type Debtor } from "@/lib/store";
import { t, formatPeso } from "@/lib/i18n";
import { AddDebtorModal } from "@/components/add-debtor-modal";

export default function UtangScreen() {
  const colors = useColors();
  useHydration();
  const debtors = useStore((s) => s.debtors);
  const debtTransactions = useStore((s) => s.debtTransactions);
  const [showAdd, setShowAdd] = useState(false);

  const debtorRows = useMemo(() => {
    return debtors
      .map((d) => ({ debtor: d, balance: getDebtorBalance(d.id, debtTransactions) }))
      .sort((a, b) => b.balance - a.balance);
  }, [debtors, debtTransactions]);

  const totalUtang = debtorRows.reduce((sum, r) => sum + Math.max(r.balance, 0), 0);
  const activeDebtorCount = debtorRows.filter((r) => r.balance > 0).length;

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 18,
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700", lineHeight: 28 }}>
          {t.utangTitle}
        </Text>
      </View>

      <FlatList
        data={debtorRows}
        keyExtractor={(item) => item.debtor.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          gap: 10,
        }}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 14 }}>
            {/* Total summary */}
            <Card>
              <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600", lineHeight: 16 }}>
                {t.totalUtang}
              </Text>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "800",
                  color: colors.secondary,
                  marginTop: 4,
                  lineHeight: 38,
                }}
              >
                {formatPeso(totalUtang)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 16 }}>
                {activeDebtorCount} {t.debtorCount}
              </Text>
            </Card>

            <Button
              title={t.addDebtor}
              iconLeft="plus"
              onPress={() => setShowAdd(true)}
              variant="primary"
              fullWidth
            />
          </View>
        }
        renderItem={({ item }) => (
          <DebtorRow debtor={item.debtor} balance={item.balance} />
        )}
        ListEmptyComponent={
          <Card style={{ alignItems: "center", paddingVertical: 28 }}>
            <IconSymbol name="person.2.fill" size={36} color={colors.muted} />
            <Text
              style={{
                marginTop: 10,
                color: colors.muted,
                textAlign: "center",
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {t.noDebtors}
            </Text>
          </Card>
        }
        showsVerticalScrollIndicator={false}
      />

      <AddDebtorModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </ScreenContainer>
  );
}

function DebtorRow({ debtor, balance }: { debtor: Debtor; balance: number }) {
  const colors = useColors();
  const hasDebt = balance > 0;

  return (
    <Pressable
      onPress={() => router.push(`/utang/${debtor.id}` as any)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Card style={{ paddingVertical: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: (hasDebt ? colors.secondary : colors.success) + "22",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: hasDebt ? colors.secondary : colors.success,
                fontSize: 16,
                fontWeight: "700",
                lineHeight: 20,
              }}
            >
              {debtor.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.foreground,
                lineHeight: 19,
              }}
              numberOfLines={1}
            >
              {debtor.name}
            </Text>
            {debtor.notes && (
              <Text
                style={{ fontSize: 11, color: colors.muted, marginTop: 2, lineHeight: 14 }}
                numberOfLines={1}
              >
                {debtor.notes}
              </Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: hasDebt ? colors.secondary : colors.success,
                lineHeight: 20,
              }}
            >
              {formatPeso(Math.max(balance, 0))}
            </Text>
            {!hasDebt && (
              <Text style={{ fontSize: 10, color: colors.success, marginTop: 2, lineHeight: 12 }}>
                Bayad na
              </Text>
            )}
          </View>
          <IconSymbol name="chevron.right" size={18} color={colors.muted} />
        </View>
      </Card>
    </Pressable>
  );
}
