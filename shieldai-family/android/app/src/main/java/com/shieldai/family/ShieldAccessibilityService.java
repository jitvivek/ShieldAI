package com.shieldai.family;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.content.Intent;
import android.util.Log;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class ShieldAccessibilityService extends AccessibilityService {
    private static final String TAG = "ShieldAI";
    private static ShieldAccessibilityService instance;
    private static OnTextCapturedListener listener;

    private static final Set<String> MONITORED_PACKAGES = new HashSet<>(Arrays.asList(
        "com.openai.chatgpt",
        "com.google.android.apps.bard",
        "com.microsoft.copilot",
        "com.anthropic.claude",
        "com.perplexity.ask"
    ));

    public interface OnTextCapturedListener {
        void onTextCaptured(String packageName, String text, long timestamp);
    }

    public static void setOnTextCapturedListener(OnTextCapturedListener l) {
        listener = l;
    }

    public static ShieldAccessibilityService getInstance() {
        return instance;
    }

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
                | AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
                | AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS;
        info.notificationTimeout = 300;
        setServiceInfo(info);
        Log.i(TAG, "Accessibility service connected");
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
        if (!MONITORED_PACKAGES.contains(packageName)) return;

        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return;

        StringBuilder textBuilder = new StringBuilder();
        extractText(rootNode, textBuilder);
        rootNode.recycle();

        String extractedText = textBuilder.toString().trim();
        if (!extractedText.isEmpty() && listener != null) {
            listener.onTextCaptured(packageName, extractedText, System.currentTimeMillis());
        }
    }

    private void extractText(AccessibilityNodeInfo node, StringBuilder builder) {
        if (node == null) return;
        if (node.getText() != null) {
            builder.append(node.getText().toString()).append("\n");
        }
        if (node.getContentDescription() != null) {
            builder.append(node.getContentDescription().toString()).append("\n");
        }
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                extractText(child, builder);
                child.recycle();
            }
        }
    }

    @Override
    public void onInterrupt() {
        Log.w(TAG, "Accessibility service interrupted");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
    }
}
