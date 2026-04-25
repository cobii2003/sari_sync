// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "cart.fill": "shopping-cart",
  "chart.bar.fill": "bar-chart",
  "gear": "settings",
  "trash.fill": "delete",
  "trash": "delete-outline",
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "minus": "remove",
  "camera.fill": "camera-alt",
  "photo.on.rectangle": "photo-library",
  "person.2.fill": "people",
  "person.fill": "person",
  "creditcard.fill": "payment",
  "banknote": "attach-money",
  "bell.fill": "notifications",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "xmark": "close",
  "exclamationmark.triangle.fill": "warning",
  "tag.fill": "label",
  "list.bullet": "list",
  "magnifyingglass": "search",
  "pencil": "edit",
  "calendar": "calendar-today",
  "clock.fill": "schedule",
  "info.circle": "info",
  "arrow.left": "arrow-back",
  "square.and.arrow.up": "ios-share",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
