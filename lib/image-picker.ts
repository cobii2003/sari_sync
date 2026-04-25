import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export async function pickFromCamera(): Promise<string | null> {
  if (Platform.OS === "web") {
    // Fall back to gallery on web
    return pickFromGallery();
  }
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: "images",
    allowsEditing: true,
    quality: 0.7,
    aspect: [1, 1],
  });
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

export async function pickFromGallery(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted && Platform.OS !== "web") return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    quality: 0.7,
    aspect: [1, 1],
  });
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
