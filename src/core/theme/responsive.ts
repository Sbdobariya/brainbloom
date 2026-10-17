import { useWindowDimensions } from "react-native";

export type DeviceClass = "small" | "phone" | "tablet";

const MAX_CONTENT_WIDTH = 900; // keeps layouts from stretching on big tablets

export function useResponsive() {
  const { width, height, fontScale } = useWindowDimensions();
  const shortSide = Math.min(width, height);

  const deviceClass: DeviceClass =
    shortSide < 360 ? "small" : shortSide >= 600 ? "tablet" : "phone";

  // 390 is a typical modern phone width; clamp so nothing gets tiny or huge
  const scale = Math.min(Math.max(shortSide / 390, 0.85), 1.3);
  const s = (n: number) => Math.round(n * scale);

  const columns = deviceClass === "tablet" ? (width >= 900 ? 4 : 3) : 2;
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const padding = s(16);
  const gap = s(12);
  const cardWidth = Math.floor(
    (contentWidth - padding * 2 - gap * (columns - 1)) / columns,
  );

  return {
    width,
    height,
    fontScale,
    deviceClass,
    isTablet: deviceClass === "tablet",
    isLandscape: width > height,
    columns,
    contentWidth,
    padding,
    gap,
    cardWidth,
    s, // scaled size: s(24) gives a number that fits the device
  };
}
