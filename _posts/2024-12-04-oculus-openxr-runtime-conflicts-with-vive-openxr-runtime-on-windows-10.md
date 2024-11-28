---
layout: post
title: Oculus OpenXR runtime conflicts with Vive OpenXR runtime on Windows 10
author: wout
date: 2024-12-04 00:00:00 Europe/Brussels
category: [Explanation]
published: true
---

When the Oculus OpenXR Runtime is set as active and your Unreal project uses the Meta XR plugin, the following crash report may appear.

<div align="center">
    <img src="/assets/images/2024-12-04/Crashes/OculusOpenXRRuntimeCrashReporter.png" alt="Oculus OpenXR Runtime Crash Reporter window." title="Oculus OpenXR Runtime Crash Reporter">
</div>

For me, the issue lies with the Vive OpenXR runtime, which is part of the Vive Streaming application. This application is used to connect Vive standalone headsets, such as the Vive Focus 3, to your PC (i.e. for PCVR). When I delete the Vive Streaming application, I can start the Unreal project without any issues.

Of course, it would be quite inconvenient to uninstall the Vive Streaming application every time I want to use the Meta Quest and reinstall it when switching back to the Vive Focus 3. Fortunately, there’s another option.

Open the Registry Editor in Windows and navigate to: <span class ="break-at-backslash"> Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Khronos\OpenXR\1\ApiLayers\Implicit </span>

You should see the following entries:

<div align="center">
    <img src="/assets/images/2024-12-04/WindowsRegistry/ViveOpenXRRegistryEntries.png" border="1" alt="Vive OpenXR registry entries." title="Vive OpenXR registry entries">
</div>

Delete the entry for <span class ="break-at-backslash">C:\W\VIVE Business Streaming\OpenXR\ViveVR_openxr\ViveOpenXRMR\ViveOpenXRMR.json </span>. Your Unreal project should now open without any issues.

## What does the ViveOpenXRMR do?
*ChatGPT generated*

The ViveOpenXRMR runtime is part of HTC's OpenXR integration and is designed to enable Mixed Reality (MR) and Virtual Reality (VR) functionalities for HTC devices like the Vive XR Elite and Focus 3. This runtime acts as a bridge between applications built using OpenXR (an open standard for VR/AR development) and the specific hardware features of HTC headsets. The ViveOpenXRMR runtime provides several key functions:

1. **Controller and Hand Tracking**: It supports interaction profiles for HTC-specific controllers and hand-tracking features.
2. **Passthrough and MR Features**: The runtime enables mixed reality features such as passthrough, allowing virtual objects to be placed within the user's physical environment, similar to what is offered by Meta Quest.
3. **Facial and Eye Tracking Extensions**: HTC's OpenXR runtime includes optional extensions to support advanced features like facial and eye tracking for more immersive applications.
4. **System Compatibility**: It integrates with HTC's VIVE SRanipal system and other tools to optimize performance and ensure compatibility with HTC's ecosystem​.

When you see references to this runtime in your logs, it indicates that the system is recognizing it as the active OpenXR runtime, even if you're developing for another platform like Meta Quest. This might lead to compatibility issues, so it's crucial to ensure the correct OpenXR runtime is selected based on your target hardware.

**ChatGPT sources**
1. Vive Developers - How to Use SR_Runtime - Developer Resources [[link](https://developer.vive.com/resources/openxr/openxr-pcvr/tutorials/how-use-sr_runtime/)]
2. Vive Wave - Build Unreal Engine 5 OpenXR Applications on VIVE XR Devices [[link](https://dl.vive.com/SDK/openxr/openXRforAIO/[ViveFocus3]Build_UE5_OpenXR_for_Wave_Runtime_v1.0.5.pdf)]
3. Vive Developers - Overview: OpenXR for PC - Developer Resources [[link](https://developer.vive.com/resources/openxr/openxr-pcvr/overview/)]
4. Vive Download - Unity Tutorials \| Vive OpenXR - Developer Resources [[link](https://developer.vive.com/resources/openxr/unity/tutorials/)]