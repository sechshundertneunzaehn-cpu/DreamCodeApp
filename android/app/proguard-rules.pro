# DreamCode ProGuard Rules — Capacitor Standard

# --------------- Capacitor Core ---------------
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.PluginMethod *;
}

# --------------- WebView JavaScript Interface ---------------
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# --------------- Google Play Services / Firebase ---------------
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# --------------- Kotlin ---------------
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings { <fields>; }
-keepclassmembers class kotlin.Metadata { public <methods>; }

# --------------- Stack Traces lesbar halten ---------------
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# --------------- Coroutines ---------------
-keepclassmembers class kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**
