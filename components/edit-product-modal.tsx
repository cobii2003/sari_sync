import { useMemo, useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { showToast } from "@/components/ui/toast";
import { actions, useStore, type Product } from "@/lib/store";
import { t } from "@/lib/i18n";
import { pickFromCamera, pickFromGallery } from "@/lib/image-picker";

export function EditProductModal({
  product,
  visible,
  onClose,
}: {
  product: Product;
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  const categories = useStore((s) => s.categories);

  const [name, setName] = useState(product.name);
  const initialCatId = useMemo(
    () => categories.find((c) => c.name === product.category)?.id ?? categories[0]?.id ?? "",
    [categories, product.category],
  );
  const [categoryId, setCategoryId] = useState(initialCatId);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [imageUri, setImageUri] = useState<string | undefined>(product.imageUri);

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  const handleCamera = async () => {
    const uri = await pickFromCamera();
    if (uri) setImageUri(uri);
  };
  const handleGallery = async () => {
    const uri = await pickFromGallery();
    if (uri) setImageUri(uri);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const priceNum = parseFloat(price.replace(",", "."));
    const stockNum = parseInt(stock, 10);

    if (!trimmedName) return showToast("Kailangan ng pangalan", "error");
    if (!categoryId) return showToast("Pumili ng kategorya", "error");
    if (isNaN(priceNum) || priceNum < 0) return showToast("Mali ang presyo", "error");
    if (isNaN(stockNum) || stockNum < 0) return showToast("Mali ang stok", "error");

    const cat = categories.find((c) => c.id === categoryId);
    actions.updateProduct(product.id, {
      name: trimmedName,
      category: cat?.name || product.category,
      price: priceNum,
      stock: stockNum,
      imageUri,
    });
    showToast(t.saved, "success");
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
            maxHeight: "92%",
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
              {t.edit} {t.productName}
            </Text>
            <IconButton icon="xmark" onPress={onClose} color={colors.muted} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {imageUri && (
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                <View style={{ position: "relative" }}>
                  <Image
                    source={{ uri: imageUri }}
                    style={{
                      width: 90,
                      height: 90,
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
              containerStyle={{ marginBottom: 12 }}
            />
            <Select
              label={t.category}
              value={categoryId}
              options={categoryOptions}
              onChange={setCategoryId}
              containerStyle={{ marginBottom: 12 }}
            />
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              <Input
                label={t.price}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                containerStyle={{ flex: 1 }}
              />
              <Input
                label={t.stock}
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
                containerStyle={{ flex: 1 }}
              />
            </View>

            <Button title={t.updateProduct} iconLeft="checkmark" onPress={handleSave} fullWidth />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
