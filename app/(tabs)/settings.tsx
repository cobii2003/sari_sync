import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Button, Card, IconButton } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm";
import { showToast } from "@/components/ui/toast";
import { actions, useStore, useHydration } from "@/lib/store";
import { ensurePermissions } from "@/lib/notifications";
import { t } from "@/lib/i18n";

export default function SettingsScreen() {
  const colors = useColors();
  useHydration();

  const settings = useStore((s) => s.settings);
  const categories = useStore((s) => s.categories);

  const [thresholdInput, setThresholdInput] = useState(String(settings.lowStockThreshold));
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveThreshold = () => {
    const n = parseInt(thresholdInput, 10);
    if (isNaN(n) || n < 0) {
      showToast("Mali ang numero", "error");
      return;
    }
    actions.updateSettings({ lowStockThreshold: n });
    showToast(t.saved, "success");
  };

  const handleToggleNotif = async (val: boolean) => {
    if (val) {
      const ok = await ensurePermissions();
      if (!ok) {
        showToast("Walang permiso para sa abiso", "error");
        return;
      }
    }
    actions.updateSettings({ notificationsEnabled: val });
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      showToast("Kailangan ng pangalan", "error");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      showToast("May ganitong kategorya na", "error");
      return;
    }
    actions.addCategory(name);
    setNewCategoryName("");
    showToast("Naidagdag", "success");
  };

  const handleSaveCategory = (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    actions.updateCategory(id, name);
    setEditingCategoryId(null);
    setEditingName("");
    showToast(t.saved, "success");
  };

  const handleDeleteCategory = () => {
    if (!deleteCategoryId) return;
    actions.deleteCategory(deleteCategoryId);
    setDeleteCategoryId(null);
    showToast("Burado na", "info");
  };

  const handleClearAll = () => {
    actions.clearAll();
    setShowClearConfirm(false);
    showToast(t.dataCleared, "info");
  };

  const deleteCategory = categories.find((c) => c.id === deleteCategoryId);

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      style={{ backgroundColor: colors.background }}
    >
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
          {t.settingsTitle}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: colors.foreground,
                  lineHeight: 20,
                }}
              >
                {t.enableNotifications}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginTop: 4,
                  lineHeight: 16,
                }}
              >
                {t.notificationsHelp}
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotif}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Low stock threshold */}
        <Card>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: colors.foreground,
              lineHeight: 20,
            }}
          >
            {t.lowStockThreshold}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginTop: 4,
              marginBottom: 12,
              lineHeight: 16,
            }}
          >
            {t.lowStockHelp}
          </Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-end" }}>
            <Input
              value={thresholdInput}
              onChangeText={setThresholdInput}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
              placeholder="5"
            />
            <Button title={t.save} onPress={handleSaveThreshold} size="md" />
          </View>
        </Card>

        {/* Manage categories */}
        <Card>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: colors.foreground,
              lineHeight: 20,
            }}
          >
            {t.manageCategories}
          </Text>
          <View style={{ marginTop: 10, gap: 6 }}>
            {categories.map((c) => {
              const isEditing = editingCategoryId === c.id;
              return (
                <View
                  key={c.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    backgroundColor: colors.background,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    gap: 8,
                  }}
                >
                  {isEditing ? (
                    <>
                      <TextInput
                        value={editingName}
                        onChangeText={setEditingName}
                        autoFocus
                        style={{
                          flex: 1,
                          color: colors.foreground,
                          fontSize: 14,
                          paddingVertical: 4,
                          lineHeight: 18,
                        }}
                        returnKeyType="done"
                        onSubmitEditing={() => handleSaveCategory(c.id)}
                      />
                      <IconButton
                        icon="checkmark"
                        size={18}
                        color={colors.success}
                        onPress={() => handleSaveCategory(c.id)}
                      />
                      <IconButton
                        icon="xmark"
                        size={18}
                        color={colors.muted}
                        onPress={() => {
                          setEditingCategoryId(null);
                          setEditingName("");
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <IconSymbol name="tag.fill" size={16} color={colors.primary} />
                      <Text
                        style={{
                          flex: 1,
                          color: colors.foreground,
                          fontSize: 14,
                          lineHeight: 18,
                        }}
                      >
                        {c.name}
                      </Text>
                      <IconButton
                        icon="pencil"
                        size={18}
                        color={colors.muted}
                        onPress={() => {
                          setEditingCategoryId(c.id);
                          setEditingName(c.name);
                        }}
                      />
                      <IconButton
                        icon="trash"
                        size={18}
                        color={colors.error}
                        onPress={() => setDeleteCategoryId(c.id)}
                      />
                    </>
                  )}
                </View>
              );
            })}
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12, alignItems: "flex-end" }}>
            <Input
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder={t.categoryName}
              containerStyle={{ flex: 1 }}
            />
            <Button
              title={t.addCategory}
              onPress={handleAddCategory}
              iconLeft="plus"
              size="md"
            />
          </View>
        </Card>

        {/* About */}
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <IconSymbol name="info.circle" size={20} color={colors.primary} />
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, lineHeight: 20 }}>
              {t.about}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.muted, marginTop: 8, lineHeight: 18 }}>
            Sari Sync ay para sa mga sari-sari store owner. Pamahalaan ang inyong imbentaryo, benta, at utang ng mga suki — lokal sa inyong device.
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 8, lineHeight: 14 }}>
            Bersyon 1.0.0
          </Text>
        </Card>

        {/* Danger zone */}
        <Card style={{ borderColor: colors.error + "55" }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: colors.error,
              lineHeight: 20,
            }}
          >
            {t.clearAllData}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginTop: 6,
              marginBottom: 12,
              lineHeight: 16,
            }}
          >
            Buburahin nito ang lahat ng paninda, benta, at utang.
          </Text>
          <Button
            title={t.clearAllData}
            iconLeft="trash"
            variant="danger"
            onPress={() => setShowClearConfirm(true)}
          />
        </Card>
      </ScrollView>

      <ConfirmDialog
        visible={showClearConfirm}
        title={t.clearAllData}
        message={t.clearDataConfirm}
        confirmLabel={t.yesDelete}
        cancelLabel={t.no}
        destructive
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />

      <ConfirmDialog
        visible={!!deleteCategoryId}
        title={`Burahin ang "${deleteCategory?.name}"?`}
        message="Hindi ito makakaapekto sa mga existing na paninda."
        confirmLabel={t.yesDelete}
        cancelLabel={t.no}
        destructive
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCategoryId(null)}
      />
    </ScreenContainer>
  );
}
