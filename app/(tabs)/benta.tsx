import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Card } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useStore, useHydration, type Sale } from "@/lib/store";
import { t, formatPeso, formatDateTime } from "@/lib/i18n";

type Period = "daily" | "weekly" | "monthly" | "quarterly";

const PERIOD_LABELS: { key: Period; label: string; days: number }[] = [
  { key: "daily", label: t.periodDaily, days: 1 },
  { key: "weekly", label: t.periodWeekly, days: 7 },
  { key: "monthly", label: t.periodMonthly, days: 30 },
  { key: "quarterly", label: t.periodQuarterly, days: 90 },
];

export default function BentaScreen() {
  const colors = useColors();
  useHydration();
  const sales = useStore((s) => s.sales);
  const [period, setPeriod] = useState<Period>("daily");

  const periodConfig = PERIOD_LABELS.find((p) => p.key === period)!;

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = now - periodConfig.days * 24 * 60 * 60 * 1000;
    return sales.filter((s) => s.timestamp >= cutoff);
  }, [sales, periodConfig.days]);

  const totals = useMemo(() => {
    let total = 0;
    let cash = 0;
    let credit = 0;
    let count = filtered.length;
    filtered.forEach((s) => {
      total += s.total;
      if (s.type === "cash") cash += s.total;
      else credit += s.total;
    });
    return { total, cash, credit, count };
  }, [filtered]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; total: number }>();
    filtered.forEach((s) => {
      const cur = map.get(s.productId) || { name: s.productName, qty: 0, total: 0 };
      cur.qty += s.quantity;
      cur.total += s.total;
      map.set(s.productId, cur);
    });
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filtered]);

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
          {t.bentaTitle}
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          gap: 12,
        }}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 14 }}>
            {/* Period selector */}
            <View
              style={{
                flexDirection: "row",
                gap: 6,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 4,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {PERIOD_LABELS.map((p) => {
                const active = period === p.key;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => setPeriod(p.key)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: active ? colors.primary : "transparent",
                      alignItems: "center",
                      opacity: pressed && !active ? 0.6 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: active ? "#FFFFFF" : colors.muted,
                        fontSize: 12,
                        fontWeight: "600",
                        lineHeight: 16,
                      }}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Total card */}
            <Card>
              <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600", lineHeight: 16 }}>
                {t.totalSales}
              </Text>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "800",
                  color: colors.primary,
                  marginTop: 4,
                  lineHeight: 38,
                }}
              >
                {formatPeso(totals.total)}
              </Text>
              <View style={{ flexDirection: "row", gap: 14, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 14 }}>
                    {t.transactionCount}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, lineHeight: 22 }}>
                    {totals.count}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.success, lineHeight: 14 }}>
                    {t.cashSales}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, lineHeight: 18 }}>
                    {formatPeso(totals.cash)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.secondary, lineHeight: 14 }}>
                    {t.creditSales}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, lineHeight: 18 }}>
                    {formatPeso(totals.credit)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Top products */}
            {topProducts.length > 0 && (
              <Card>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.foreground,
                    marginBottom: 10,
                    lineHeight: 18,
                  }}
                >
                  {t.topProducts}
                </Text>
                <View style={{ gap: 8 }}>
                  {topProducts.map((p, i) => (
                    <View
                      key={p.name + i}
                      style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: colors.primary,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700", lineHeight: 14 }}>
                          {i + 1}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: colors.foreground,
                            lineHeight: 17,
                          }}
                          numberOfLines={1}
                        >
                          {p.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 14 }}>
                          {p.qty} pcs · {formatPeso(p.total)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Recent transactions header */}
            {filtered.length > 0 && (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.foreground,
                  marginTop: 4,
                  lineHeight: 18,
                }}
              >
                {t.recentTransactions}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => <SaleRow sale={item} />}
        ListEmptyComponent={
          <Card style={{ alignItems: "center", paddingVertical: 28 }}>
            <IconSymbol name="chart.bar.fill" size={36} color={colors.muted} />
            <Text
              style={{
                marginTop: 10,
                color: colors.muted,
                textAlign: "center",
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {t.noSales}
            </Text>
          </Card>
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

function SaleRow({ sale }: { sale: Sale }) {
  const colors = useColors();
  const isCash = sale.type === "cash";
  return (
    <Card style={{ paddingVertical: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: (isCash ? colors.success : colors.secondary) + "22",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconSymbol
            name={isCash ? "banknote" : "creditcard.fill"}
            size={18}
            color={isCash ? colors.success : colors.secondary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, lineHeight: 18 }}
            numberOfLines={1}
          >
            {sale.productName} × {sale.quantity}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2, lineHeight: 14 }}>
            {formatDateTime(sale.timestamp)}
            {sale.debtorName ? ` · ${sale.debtorName}` : ""}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: isCash ? colors.success : colors.secondary,
            lineHeight: 18,
          }}
        >
          {formatPeso(sale.total)}
        </Text>
      </View>
    </Card>
  );
}
