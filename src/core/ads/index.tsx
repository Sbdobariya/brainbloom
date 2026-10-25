import { colors, spacing } from "@/core/theme";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import mobileAds, {
  AdEventType,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  MaxAdContentRating,
  TestIds,
  useForeground,
} from "react-native-google-mobile-ads";
import { create } from "zustand";

/* ---------- Config ---------- */

// Apple's Kids Category does not allow third-party ads.
// Set this to false before you submit the iOS app to the Kids Category.
const IOS_ADS_ENABLED = true;

const ADS_ENABLED =
  Platform.OS === "android" || (Platform.OS === "ios" && IOS_ADS_ENABLED);

// Ad UNIT IDs from AdMob (they contain a "/"). App IDs go in app.json instead.
const ANDROID_UNITS = {
  banner: "ca-app-pub-0000000000000000/0000000000",
  interstitial: "ca-app-pub-0000000000000000/1111111111",
};
const IOS_UNITS = {
  banner: "ca-app-pub-0000000000000000/2222222222",
  interstitial: "ca-app-pub-0000000000000000/3333333333",
};
const PROD = Platform.OS === "ios" ? IOS_UNITS : ANDROID_UNITS;

// Debug builds always use Google's test ads, never your real units
const AD_UNITS = {
  banner: __DEV__ ? TestIds.BANNER : PROD.banner,
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : PROD.interstitial,
};

// Module-level constant: the same object every render, so nothing re-requests.
const REQUEST_OPTIONS = { requestNonPersonalizedAdsOnly: true };

const EVERY_N_GAMES = 3;

/* ---------- Init ---------- */

const useAdsState = create<{ ready: boolean }>(() => ({ ready: false }));
let started = false;

export async function initAds(): Promise<void> {
  if (!ADS_ENABLED || started) return; // started guards against a double call
  started = true;
  try {
    // The child-directed tags must be set BEFORE the first ad request.
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.G,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
    });
    await mobileAds().initialize();
    useAdsState.setState({ ready: true });
    loadNextInterstitial();
  } catch (e) {
    if (__DEV__) console.warn("[ads] init failed", e);
  }
}

/* ---------- Banner ---------- */

const MAX_RETRIES = 4;

function BannerSlotInner() {
  const ready = useAdsState((s) => s.ready);
  const { width } = useWindowDimensions();

  // Fixed sizes give the slot a fixed height, so it can never collapse to 0
  const wide = width >= 728;
  const size = wide ? BannerAdSize.LEADERBOARD : BannerAdSize.BANNER;
  const height = wide ? 90 : 50;

  const bannerRef = useRef<BannerAd>(null);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const attemptRef = useRef(0);
  const loadedRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // iOS: a banner can go blank after the app returns from the background
  useForeground(() => {
    if (Platform.OS === "ios") bannerRef.current?.load();
  });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onLoaded = useCallback(() => {
    if (loadedRef.current) return; // the same event can arrive twice
    loadedRef.current = true;
    attemptRef.current = 0;
    setFailed(false);
  }, []);

  const onFailed = useCallback((error: Error) => {
    if (__DEV__) console.warn("[ads] banner failed to load:", error?.message);
    loadedRef.current = false;
    setFailed(true); // collapse the empty slot instead of showing a blank bar
    if (attemptRef.current >= MAX_RETRIES || timer.current) return;
    const delay = 30_000 * 2 ** attemptRef.current; // 30s, 60s, 2m, 4m
    attemptRef.current += 1;
    timer.current = setTimeout(() => {
      timer.current = null;
      setFailed(false);
      setAttempt((a) => a + 1); // new key = one clean re-request
    }, delay);
  }, []);

  if (!ADS_ENABLED) return null; // after all hooks, so hook order never changes

  return (
    <View
      collapsable={false}
      style={[styles.slot, { height: failed ? 0 : height + spacing.sm * 2 }]}
    >
      {ready && (
        <BannerAd
          ref={bannerRef}
          key={attempt}
          unitId={AD_UNITS.banner}
          size={size}
          requestOptions={REQUEST_OPTIONS}
          onAdLoaded={onLoaded}
          onAdFailedToLoad={onFailed}
        />
      )}
    </View>
  );
}

export const BannerSlot = memo(BannerSlotInner);

/* ---------- Interstitial (plain module, no React state) ---------- */

const sessionStart = Date.now();
let current: InterstitialAd | null = null;
let loaded = false;
let loading = false;
let showing = false;
let lastShown = 0;
let gamesSinceAd = 0;
let retries = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let waiting: (() => void)[] = [];

function release() {
  const fns = waiting;
  waiting = [];
  fns.forEach((f) => f());
}

function scheduleRetry() {
  if (retryTimer || retries >= 5) return;
  const delay = Math.min(15_000 * 2 ** retries, 5 * 60_000);
  retries += 1;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    loadNextInterstitial();
  }, delay);
}

function loadNextInterstitial() {
  if (!ADS_ENABLED || loading || loaded) return;
  loading = true;
  const ad = InterstitialAd.createForAdRequest(
    AD_UNITS.interstitial,
    REQUEST_OPTIONS,
  );
  const unsubscribe: (() => void)[] = [];
  const cleanup = () => unsubscribe.forEach((f) => f());

  unsubscribe.push(
    ad.addAdEventListener(AdEventType.LOADED, () => {
      loading = false;
      loaded = true;
      retries = 0;
      current = ad;
    }),
  );
  unsubscribe.push(
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      cleanup();
      loaded = false;
      showing = false;
      current = null;
      lastShown = Date.now();
      gamesSinceAd = 0;
      release();
      loadNextInterstitial(); // preload the next one
    }),
  );
  unsubscribe.push(
    ad.addAdEventListener(AdEventType.ERROR, () => {
      cleanup();
      loading = false;
      loaded = false;
      showing = false;
      current = null;
      release(); // never leave a child waiting
      scheduleRetry();
    }),
  );
  ad.load();
}

export function noteGameCompleted(): void {
  gamesSinceAd += 1;
}

// Resolves when the ad closes, or immediately when no ad is due.
export function adBreak(): Promise<void> {
  if (!ADS_ENABLED) return Promise.resolve();

  const due = gamesSinceAd >= EVERY_N_GAMES;
  if (!due || !loaded || showing || !current) return Promise.resolve();

  showing = true;
  return new Promise<void>((resolve) => {
    waiting.push(resolve);
    current!.show().catch(() => {
      showing = false;
      release();
    });
  });
}

const styles = StyleSheet.create({
  slot: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.bg,
    marginBottom: spacing.md, // a gap between the ad and the tab bar prevents mis-taps
  },
});
