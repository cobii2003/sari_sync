import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Button, Card, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm";
import { showToast } from "@/components/ui/toast";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { actions, isLowStock, isOutOfStock, useStore, useHydration, type Product } from "@/lib/store";
import { t, formatPeso } from "@/lib/i18n";
import { pickFromCamera, pickFromGallery } from "@/lib/image-picker";
import { SellModal } from "@/components/sell-modal";
import { EditProductModal } from "@/components/edit-product-modal";
import { notifyLowStock } from "@/lib/notifications";

export default function ImbentaryoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  useHydration();

  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const threshold = useStore((s) => s.settings.lowStockThreshold);
  const notificationsEnabled = useStore((s) => s.settings.notificationsEnabled);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();

  const [sellTarget, setSellTarget] = useState<Product | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setPrice("");
    setStock("");
    setImageUri(undefined);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const priceNum = parseFloat(price.replace(",", "."));
    const stockNum = parseInt(stock, 10);

    if (!trimmedName) {
      showToast("Kailangan ng pangalan ng paninda", "error");
      return;
    }
    if (!categoryId) {
      showToast("Pumili ng kategorya", "error");
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      showToast("Mali ang presyo", "error");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      showToast("Mali ang stok", "error");
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    actions.addProduct({
      name: trimmedName,
      category: cat?.name || "Iba pa",
      price: priceNum,
      stock: stockNum,
      imageUri,
    });
    showToast(t.saved, "success");
    resetForm();
  };

  const handleCamera = async () => {
    const uri = await pickFromCamera();
    if (uri) setImageUri(uri);
  };

  const handleGallery = async () => {
    const uri = await pickFromGallery();
    if (uri) setImageUri(uri);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    actions.deleteProduct(deleteTarget.id);
    showToast(`${deleteTarget.name} ay binura.`, "info");
    setDeleteTarget(null);
  };

  const handleSellComplete = (productId: string, newStock: number) => {
    const product = products.find((p) => p.id === productId);
    if (product && notificationsEnabled && newStock > 0 && newStock <= threshold) {
      void notifyLowStock({ ...product, stock: newStock });
    }
  };

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName=""
      safeAreaClassName=""
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
          {t.imbentaryoTitle}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            gap: 12,
          }}
          ListHeaderComponent={
            <View style={{ gap: 16, marginBottom: 16 }}>
              {/* Add product card */}
              <Card>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.foreground,
                    marginBottom: 6,
                    lineHeight: 22,
                  }}
                >
                  {t.addNewProduct}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    marginBottom: 14,
                    lineHeight: 16,
                  }}
                >
                  Tip: {t.cameraTip}
                </Text>

                {/* Image preview */}
                {imageUri && (
                  <View style={{ alignItems: "center", marginBottom: 12 }}>
                    <View style={{ position: "relative" }}>
                      <Image
                        source={{ uri: imageUri }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      />
                      <IconButton
                        icon="xmark"
                        onPress={() => setImageUri(undefined)}
                        bg={colors.error}
                        color="#FFFFFF"
                        size={14}
                        style={{ position: "absolute", top: -8, right: -8 }}
                      />
                    </View>
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                  <Button
                    title={t.scanWithCamera}
                    variant="outline"
                    iconLeft="camera.fill"
                    onPress={handleCamera}
                    size="sm"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={t.pickFromGallery}
                    variant="outline"
                    iconLeft="photo.on.rectangle"
                    onPress={handleGallery}
                    size="sm"
                    style={{ flex: 1 }}
                  />
                </View>

                <Input
                  label={t.productName}
                  value={name}
                  onChangeText={setName}
                  placeholder={t.productName}
                  containerStyle={{ marginBottom: 12 }}
                />
                <Select
                  label={t.category}
                  value={categoryId}
                  options={categoryOptions}
                  onChange={setCategoryId}
                  placeholder="Pumili ng kategorya"
                  containerStyle={{ marginBottom: 12 }}
                />
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
                  <Input
                    label={t.price}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    containerStyle={{ flex: 1 }}
                  />
                  <Input
                    label={t.stock}
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="number-pad"
                    placeholder="0"
                    containerStyle={{ flex: 1 }}
                  />
                </View>

                <Button
                  title={t.saveProduct}
                  iconLeft="plus"
                  onPress={handleSave}
                  fullWidth
                />
              </Card>

              {/* Section header */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.foreground,
                    lineHeight: 20,
                  }}
                >
                  Mga Paninda ({products.length})
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              threshold={threshold}
              onSell={() => setSellTarget(item)}
              onEdit={() => setEditTarget(item)}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
          ListEmptyComponent={
            <Card style={{ alignItems: "center", paddingVertical: 28 }}>
              <IconSymbol name="list.bullet" size={36} color={colors.muted} />
              <Text
                style={{
                  marginTop: 10,
                  color: colors.muted,
                  textAlign: "center",
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {t.noProducts}
              </Text>
            </Card>
          }
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>

      {sellTarget && (
        <SellModal
          product={sellTarget}
          visible={!!sellTarget}
          onClose={(result) => {
            if (result?.newStock !== undefined && result.productId) {
              handleSellComplete(result.productId, result.newStock);
            }
            setSellTarget(null);
          }}
        />
      )}

      {editTarget && (
        <EditProductModal
          product={editTarget}
          visible={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title={`Burahin ang "${deleteTarget?.name}"?`}
        message="Hindi na mababawi ang aksiyon na ito."
        confirmLabel={t.yesDelete}
        cancelLabel={t.no}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </ScreenContainer>
  );
}

function ProductCard({
  product,
  threshold,
  onSell,
  onEdit,
  onDelete,
}: {
  product: Product;
  threshold: number;
  onSell: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const lowStock = isLowStock(product, threshold);
  const outOfStock = isOutOfStock(product);

  return (
    <Card>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {product.imageUri ? (
          <Image
            source={{ uri: product.imageUri }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        ) : (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 10,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSymbol name="tag.fill" size={26} color={colors.muted} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: colors.foreground,
              lineHeight: 20,
            }}
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2, lineHeight: 14 }}>
            {product.category}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
              marginTop: 4,
              lineHeight: 18,
            }}
          >
            {formatPeso(product.price)} {t.perUnit}
          </Text>
          <View style={{ marginTop: 4 }}>
            {outOfStock ? (
              <Text style={{ color: colors.error, fontSize: 12, fontWeight: "700", lineHeight: 16 }}>
                {t.outOfStock}
              </Text>
            ) : lowStock ? (
              <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: "700", lineHeight: 16 }}>
                {product.stock} {t.lowStockBadge}
              </Text>
            ) : (
              <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 16 }}>
                Stok: {product.stock}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginTop: 12,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.6 : 1,
          })}
          hitSlop={6}
        >
          <IconSymbol name="pencil" size={20} color={colors.muted} />
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.6 : 1,
          })}
          hitSlop={6}
        >
          <IconSymbol name="trash" size={20} color={colors.error} />
        </Pressable>
        <Button
          title={t.sell}
          iconLeft="cart.fill"
          onPress={onSell}
          size="sm"
          disabled={outOfStock}
        />
      </View>
    </Card>
  );
}
