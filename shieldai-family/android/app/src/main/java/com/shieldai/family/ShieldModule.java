package com.shieldai.family;

import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.text.TextUtils;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ShieldModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public ShieldModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        setupTextListener();
    }

    @Override
    public String getName() {
        return "ShieldModule";
    }

    private void setupTextListener() {
        ShieldAccessibilityService.setOnTextCapturedListener((packageName, text, timestamp) -> {
            WritableMap params = Arguments.createMap();
            params.putString("packageName", packageName);
            params.putString("text", text);
            params.putDouble("timestamp", timestamp);
            sendEvent("onTextCaptured", params);
        });
    }

    private void sendEvent(String eventName, WritableMap params) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    @ReactMethod
    public void isAccessibilityEnabled(Promise promise) {
        try {
            String enabledServices = Settings.Secure.getString(
                reactContext.getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            );
            boolean enabled = !TextUtils.isEmpty(enabledServices)
                && enabledServices.contains(reactContext.getPackageName());
            promise.resolve(enabled);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openAccessibilitySettings() {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void openOverlaySettings() {
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void openUsageAccessSettings() {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void openBatteryOptimizationSettings() {
        Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void addListener(String eventName) {}

    @ReactMethod
    public void removeListeners(Integer count) {}
}
