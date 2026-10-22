plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.detekt)
}

android {
    namespace = "net.ptcookie.patina.gallery"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "net.ptcookie.patina.gallery"
        minSdk = 31
        targetSdk = 37
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
    }

    sourceSets {
        getByName("main") {
            // The library as `pnpm build` serves it: the hand-written files plus the generated tokens and icons.
            kotlin.directories.add("../../../public/android")
        }
    }
}

kotlin {
    jvmToolchain(17)
}

// The library is linted with the defaults of both tools (ktlint in Android Studio style, detekt with its default rule
// set), which is what an app that vendors it runs. The only addition is the one every Compose app makes: composables
// are PascalCase (config/detekt/detekt.yml and .editorconfig). ktlint finds the library through the source set above;
// detekt has to be pointed at it. `pnpm android:lint` builds the library and runs both.
ktlint {
    android.set(true)
}

detekt {
    buildUponDefaultConfig = true
    config.setFrom("$rootDir/config/detekt/detekt.yml")
    source.setFrom(file("../../../public/android"))
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
}
