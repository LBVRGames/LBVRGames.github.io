---
layout: post
title: How to deploy a mobile VR application to the Meta Quest 3S
author: wout
date: 2024-11-28 00:00:00 Europe/Brussels
category: [Tutorials]
published: true
---

## Setup
* CPU: Intel Core i5-13600KF
* GPU: Inno3D GeForce RTX 4070 TWIN X2
* RAM: 64 GB
* OS:  Windows 10 Pro 22H2
* UE:  5.4
* HMD: Meta Quest 3S

## Summary
This tutorial explains how to deploy a mobile VR application to the Meta Quest 3S. We will use the VRTemplate as the application to be deployed. By the end of the tutorial, you will be able to run the VRTemplate as a mobile application on the Meta Quest 3S. If you have any questions, feel free to [email us](mailto:tutorials@lbvrgames.com).

## Set Up Android SDK and NDK
The Meta Quest 3S is an Android-based standalone headset, so the Unreal Engine will need to be configured for Android development. I started with UE 5.4 but when trying to install the Vive Wave SDK I discovered that there was no support for UE 5.4. The latest supported version is UE 5.3. Despite using UE 5.4 for the Android SDK and NDK setup I had no issues switching to UE 5.3 when installing the Vive Wave SDK. The advantage of using UE 5.4 or newer is that the Android Turnkey installation can be used which simplifies the installation process. To set up the Android SDK and NDK in UE 5.4 follow the next steps:

* Open the Epic Games Launcher and go to Unreal Engine > Library.
* Click on the arrow next to the Launch button, select Options > Target Platforms > Android and click Apply.
* Install Android Studio and the necessary SDK components. Follow [Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/set-up-android-sdk-ndk-and-android-studio-using-turnkey-for-unreal-engine?application_version=5.4)'s documentation for this. Under the section *Finalize and Verify Your SDK Setup* it is stated that you only need to close the Unreal Editor or command line. That didn't work for me. I had to reboot my computer.

## Install the Meta XR Plugin
Follow the steps under the [The Meta XR plugin and UE 5.x](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-metaxr-plugin/#the-meta-xr-plugin-and-ue-5x) section.

## Configure the headset for app development
Follow the steps on the [Configuring your headset for app development](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-config-headset) webpage. If you read the documentation then you will end up on the [Use Link for App Development](https://developers.meta.com/horizon/documentation/unreal/unreal-link) webpage. Under the Configure feature settings for development section it is stated that you need to select **Set Meta Quest Link as active** which sets the Meta Quest Link as the active OpenXR runtime. However, if I do this while the Meta XR plugin is enabled the Unreal Editor keeps crashing with the following crash report:

<div align="center">
    <img src="/assets/images/2024-11-28/Crashes/MobileVRMetaQuest3SCrashReporter.png" alt="MobileVRMetaQuest3S Crash Reporter window." title="MobileVRMetaQuest3S Crash Reporter">
</div>

[S-ed](https://forums.unrealengine.com/t/error-when-launching-engine/1181504/11) suggests to use the `-nohmd` parameter when starting the engine but this resulted in a **Failed to open descriptor file** message. Therefore, that I switched back to the SteamVR OpenXR runtime. If you have already enabled the Meta Quest Link then you can set SteamVR as the OpenXR runtime in the SteamVR settings.

## Configure the Unreal project
* Follow the steps on the [Setting up the Meta XR plugin for your project](https://developers.meta.com/horizon/documentation/unreal/unreal-setting-up-metaxr-plugin) webpage.
    - The final section is called **Configure the Meta XR Platform window**. This part can be skipped since it is dealing with [uploading your Unreal Engine apps for Quest devices to the Meta Horizon platform](https://developers.meta.com/horizon/documentation/unreal/unreal-plugin-settings#general-meta-xr-settings). We will upload our apps directly to the headset. Therefore, this is not needed.
    - An overview of the Meta XR plugin settings can be found [here](https://developers.meta.com/horizon/documentation/unreal/unreal-plugin-settings). For now everything can be left at their default setting.
* Go to Project Settings > Platforms > Android and enable [Package game data inside .apk](https://dev.epicgames.com/community/learning/tutorials/y4vB/unreal-engine-5-4-x-for-meta-quest-vr).

## Launch the app on a Meta Quest headset
* Package your app by going to Platforms > Android > Package Project where the Flavor Selection is set to Android (ASTC). 
* Once the package is ready you plug in the headset to your PC.
* Open a command prompt in the package directory and type `adb devices`.
    - If `adb devices` doesn't show the headset then install the [Oculus ADB Drivers](https://developers.meta.com/horizon/downloads/package/oculus-adb-drivers/) and try it again.
    - If the device is `unauthorized` then put on the headset go to settings > system > developers > allow checkbox "MTP Notifications". Reboot headset. Connect USB Cable. Allow USB debug. [Source](https://www.reddit.com/r/sidequest/comments/jbt4ug/comment/lt4x6c4/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button)
* Install the application by running the command `adb install <apk-path>` or `adb install -r <apk-path>` if an application with the same name already exists on the device.

The following approaches didn't work for me:
* [Launching your app on a Meta Quest headset](https://developers.meta.com/horizon/documentation/unreal/unreal-packaging-and-preparing-your-new-project#launching-your-app-on-a-meta-quest-headset).
* Launch a project [directly](https://developers.meta.com/horizon/documentation/unreal/unreal-ide-guide-android#launching-a-project-directly-onto-your-headset) onto your headset from the Unreal Editor.

## Setting up a new Unreal project after installation
If you create a new project after setting up the Unreal Engine for Meta Quest development then it is no longer necessary to follow all the above steps. The only steps you need to take are:
* Go to Edit > Plugins > Meta XR plugin and enable the plugin.
* Restart the Unreal Editor.
* Go to Edit > Project Settings > Plugins > Meta XR > Launch Meta XR Project Setup Tool.
* Click on Apply All for the Required Rules. Do this for all devices you want to develop for.
* Go to Edit > Project Settings > Platforms > Android
* Click on Configure Now when you see that your project is not configured for the Android/Google Play services platform.
* Enable Package game data inside .apk.

## Useful links
[Unreal Engine 5.4.x for Meta Quest VR](https://dev.epicgames.com/community/learning/tutorials/y4vB/unreal-engine-5-4-x-for-meta-quest-vr)
[How To: Game Development Best Practices for Quest 3 using Unreal Engine 5](https://forums.unrealengine.com/t/how-to-game-development-best-practices-for-quest-3-using-unreal-engine-5/2056737)