import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { useColors } from '@/hooks/useColors';

const SIGNA_URL = 'http://37.153.158.218:8002';

export default function SignaWebViewScreen() {
  const colors = useColors();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!canGoBack) return false;
        webViewRef.current?.goBack();
        return true;
      },
    );

    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigationChange = useCallback(
    (navigation: WebViewNavigation) => {
      setCanGoBack(navigation.canGoBack);
    },
    [],
  );

  const retry = useCallback(() => {
    setHasLoadError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <StatusBar style="dark" />
      <WebView
        ref={webViewRef}
        testID="signa-webview"
        source={{ uri: SIGNA_URL }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        pullToRefreshEnabled={Platform.OS === 'android'}
        allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
        onLoadStart={() => {
          setHasLoadError(false);
          setIsLoading(true);
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasLoadError(true);
          setIsLoading(false);
        }}
        onNavigationStateChange={handleNavigationChange}
        style={[styles.webView, { backgroundColor: colors.background }]}
      />

      {isLoading && !hasLoadError && (
        <View
          style={[styles.loadingOverlay, { backgroundColor: colors.background }]}
          pointerEvents="none"
          accessibilityLabel="Loading SIGNA"
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {hasLoadError && (
        <View
          style={[styles.errorOverlay, { backgroundColor: colors.background }]}
          accessibilityRole="alert"
        >
          <Ionicons name="cloud-offline-outline" size={34} color={colors.mutedForeground} />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>
            SIGNA couldn’t be reached
          </Text>
          <Text style={[styles.errorMessage, { color: colors.mutedForeground }]}>
            Check your connection, then try again.
          </Text>
          <Pressable
            testID="retry-loading-signa"
            accessibilityRole="button"
            accessibilityLabel="Try loading SIGNA again"
            onPress={retry}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 },
            ]}
          >
            <Ionicons name="refresh" size={18} color={colors.primaryForeground} />
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>
              Try again
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  errorTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 48,
    paddingHorizontal: 20,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
