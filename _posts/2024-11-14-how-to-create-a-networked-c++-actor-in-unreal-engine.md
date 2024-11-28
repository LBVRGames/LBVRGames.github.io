---
layout: post
title: How to create a networked C++ actor in Unreal Engine 
author: wout
date: 2024-11-14 00:00:00 Europe/Brussels
category: [How-to]
published: true
---

## Setup
* CPU: Intel Core i5-13600KF
* GPU: Inno3D GeForce RTX 4070 TWIN X2
* RAM: 64 GB
* OS:  Windows 10 Pro 22H2
* UE:  5.4
* IDE: Visual Studio 2022 Community Edition

## Summary
This tutorial explains how to implement a C++ version of the pistol from Unreal Engine's Virtual Reality (VR) template in a multiplayer environment. Since this tutorial assumes familiarity with the VR template, I will not explain its internal workings beyond what is necessary to understand the changes being made. By the end of this tutorial, you will understand how to implement networked VR objects using C++. If you have any questions, feel free to [email us](mailto:tutorials@lbvrgames.com).

## Download multiplayer virtual reality template
The C++ pistol will be integrated into the multiplayer virtual reality template, which you can download from the [Unreal Engine Marketplace](https://www.unrealengine.com/marketplace/en-US/store). A tutorial explaining the multiplayer implementation of this template can be found here [here](./unreal-engine-multiplayer-virtual-reality).

Once you have downloaded the template, rename the project from MultiplayerVR.uproject to VRTutorial.uproject.

## Generate Visual Studio project files
To open the multiplayer virtual reality template in Visual Studio, right-click on the  VRTutorial.uproject file and select Generate Visual Studio project files. However, when you do this, you will notice the following pop-up window appear.

<div align="center">
    <img src="/assets/images/2024-11-14/GenerateVisualStudioProjectFiles/ErrorPop-Up.png" alt="Error pop-up window" title="Error pop-up">
</div>

The pop-up window informs us that we cannot generate Visual Studio project files because the project doesn't contain any source code (i.e. C++ files). To resolve this, we can add C++ files through the Unreal Editor.

## GrabType
The first C++ file we will add is a header file containing the **CustomGrabType** enum. To do this, open the project in the Unreal Editor. Navigate to Tools > New C++ Class... > Common Classes > None, and click Next. In the following window, you will see a number of settings. Let's take a look at them.

<div align="center">
    <img src="/assets/images/2024-11-14/GenerateVisualStudioProjectFiles/AddC++Class.png" alt="Add C++ class window" title="Add C++ class">
</div>

First, we can choose a class type. Notice that initially, no class type is selected, and it is not required to select one. However, once you choose either Private or Public, you can toggle between these two options, but you cannot deselect both. This option determines the folder where the C++ files are placed. Before selecting an option, the path is */PathToProjectDirectory/Source/\<ModuleName\>/MyClass.(h)(cpp)*. After selecting Public, the header file will be placed in */PathToProjectDirectory/Source/\<ModuleName\>/Public/MyClass.h*, while the source file goes to */PathToProjectDirectory/Source/\<ModuleName\>/Private/MyClass.h*. If you select Private, both the header and source files are placed in */PathToProjectDirectory/Source/\<ModuleName\>/Private/*.

You might be wondering what the difference is between the Private and Public options. If you hover over each option, a small description appears:
* **Public**: A public class can be included and used inside other modules in addition to the module it resides in.
* **Private**: A private class can only be included and used within the module it resides in.

A more detailed explanation of the differences between these options can be found on [UE Casts](https://www.youtube.com/watch?v=T8D3AhNd9Ww&ab_channel=UECasts). Additionally, [SaxonRah](https://forums.unrealengine.com/t/what-public-and-private-mean-on-c-wizard/50336/5) discusses the reasons for using public and private classes on the Unreal Engine forum.

The first class we will create is the **CustomGrabType** class, which we will set as Private. Therefore, name the class **CustomGrabType**. After the name field, you will see a dropdown menu that allows you to select the target module for your new class. Since we currently have only one module, you can leave this as it is. The other options can remain at their default values. Finally, click on Create Class. Once the class is created, you will see a message indicating that you need to build the project from your IDE (i.e. Visual Studio).

<div align="center">
    <img src="/assets/images/2024-11-14/GenerateVisualStudioProjectFiles/BuildFromIDEPop-UpMessage.png" alt="Build from IDE pop-up message window" title="Build from IDE pop-up message">
</div>

Click OK. Next, a new message will appear, confirming that our class has been successfully added, but we must recompile our module before it will appear in the Content Browser.

<div align="center">
    <img src="/assets/images/2024-11-14/GenerateVisualStudioProjectFiles/RecompilePop-UpMessage.png" alt="Recompile pop-up message window" title="Recompile pop-up message">
</div>

Click Yes. The Visual Studio project will open, displaying both the source and header files for **CustomGrabType**. To ensure everything compiles correctly at this point, right-click on the project in the Solution Explorer and select Build. If you did not close the Unreal Editor before building and the build configuration is set to Development Editor, you may encounter the following error.

```
The command ""C:\W\Epic Games\UE_5.4\Engine\Build\BatchFiles\Build.bat" VRTutorialEditor Win64 Development -Project="E:\Unreal Projects\VRTutorial\VRTutorial.uproject" -WaitMutex -FromMsBuild -architecture=x64" exited with code 6.
```

Close the Unreal Editor and build the project again. Once the project is built, right-click on the project again, but this time select Debug > Start New Instance. This will launch the Development Editor, provided that this is selected as the build configuration from the Solution Configurations list. After confirming that it works, you can close the Unreal Engine editor.

The difference between Build and Start New Instance is that the former compiles the code without running it, while the latter compiles the code (if necessary) and then runs it. You can also click on Local Windows Debugger at the top. This performs the same function as Start New Instance. The only difference is that you can run only one instance with Local Windows Debugger, whereas Start New Instance allows multiple instances.

Since **CustomGrabType** is just an enum, we can remove the source file and keep only the header file. Remove the source file from both the Solution Explorer and the source directory. The implementation of **CustomGrabType** should resemble the following:

```c
// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CustomGrabType.generated.h"

UENUM(BlueprintType)
enum class ECustomGrabType : uint8
{
    None UMETA(DisplayName = "None"),
    Free UMETA(DisplayName = "Free"),
    Snap UMETA(DisplayName = "Snap"),
    Custom UMETA(DisplayName = "Custom")
};
```

Build the project to include the **CustomGrabType**.

### Time to explain a few things
I will not explain every aspect of this class, but it's worth noting that the Unreal Engine utilizes macros that are not part of the C++ language standard. Let’s break this down:

The line `#include "CustomGrabType.generated.h"` includes another header file called `CustomGrabType.generated.h`, which is generated by the [UnrealHeaderTool](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-header-tool-for-unreal-engine). This command-line tool is used by the Unreal Engine to generate additional code and metadata for Unreal Engine types defined in header files.

The line `UENUM(BlueprintType)` is a macro provided by the Unreal Engine. It defines an enumeration that can be utilized in Unreal Engine's Blueprint visual scripting system.

The line `enum class ECustomGrabType : uint8` begins the definition of the enumeration `ECustomGrabType`. This declaration specifies that `ECustomGrabType` is an enumeration with a fixed underlying type of `uint8`, allowing it to hold values ranging from 0 to 255. Note that the class name is prefixed with an "E" (i.e. `ECustomGrabType`) instead of simply being called `CustomGrabType`. This naming convention follows the Epic C++ [Coding Standard](https://dev.epicgames.com/documentation/en-us/unreal-engine/epic-cplusplus-coding-standard-for-unreal-engine) for Unreal Engine.

The subsequent lines define the individual enumeration values: `None`, `Free`, `Snap`, and `Custom`. Each value is assigned a display name using the `UMETA(DisplayName = "...")` macro. These display names enhance readability and can be accessed within Unreal Engine's Blueprint system.

## GrabComponent
Next, we will implement the **GrabComponent** in C++. Begin by opening your project in the Unreal Editor. Navigate to Tools > New C++ Class... > Common Classes > Scene Component and click Next. Set the class type to Private and name the class **CustomGrabComponent**. Then, click Create Class.

Visual Studio will open, and you may need to reload your project files. After that, build your project. If you did not start the Unreal Editor from Visual Studio by selecting Start New Instance, but instead opened the project file from your file explorer or launched the editor from the Epic Games Launcher, you might encounter the following error:

```
The command ""C:\W\Epic Games\UE_5.4\Engine\Build\BatchFiles\Build.bat" VRTutorialEditor Win64 Development -Project="E:\Unreal Projects\VRTutorial\VRTutorial.uproject" -WaitMutex -FromMsBuild -architecture=x64" exited with code 6.
```

To resolve this error, close the Unreal Editor and build the project again.

### CustomGrabComponent.h
```c
// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

// Unreal Engine headers
#include "CoreMinimal.h"
#include "Components/SceneComponent.h"
#include "MotionControllerComponent.h"
#include "Haptics/HapticFeedbackEffect_Base.h"
#include "Kismet/GameplayStatics.h"
#include "Net/UnrealNetwork.h"

// Project headers
#include "CustomGrabType.h"

// The .generated.h file must be the last include
#include "CustomGrabComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FGrabEvent);	// https://www.reddit.com/r/unrealengine/comments/zygcku/ue51_is_unable_to_find_delegate_in_same_file/

UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class UCustomGrabComponent : public USceneComponent
{
	GENERATED_BODY()

public:
	// Sets default values for this component's properties
	UCustomGrabComponent();

	// Called every frame
	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	UFUNCTION(BlueprintCallable, Category = "Default")
	bool TryGrab(UMotionControllerComponent* MotionController, AActor* Actor);

	UFUNCTION(BlueprintCallable, Category = "Default")
	bool TryRelease();

	UFUNCTION(BlueprintCallable, Category = "Default")
	void SetShouldSimulateOnDrop();

	UFUNCTION(BlueprintCallable, Category = "Default")
	void SetPrimitiveCompPhysics(bool bSimulate);

	UFUNCTION(BlueprintPure, Category = "Grab Component")
	const EControllerHand GetHeldByHand() const;

	UPROPERTY(BlueprintAssignable)
	FGrabEvent OnGrabbed;

	UPROPERTY(BlueprintAssignable)
	FGrabEvent OnDropped;

protected:
	// Called when the game starts
	virtual void BeginPlay() override;

private:
	bool AttachParentToMotionController(USceneComponent* MotionController);

	// Client function for setting the MotionControllerRef and owner on the client side
	UFUNCTION(Client, Reliable)
	void ClientSetMotionControllerRefAndOwner(UMotionControllerComponent* MotionController, AActor* Owner);

	// Client function for removing the MotionControllerRef and owner on the client side
	UFUNCTION(Client, Reliable)
	void ClientRemoveMotionControllerRefAndOwner();

	// Server function for grabbing
	UFUNCTION(Server, Reliable)
	void ServerGrab();

	// Client function for playing the OnGrabHapticEffect on the client side
	UFUNCTION(Client, Unreliable)
	void ClientPlayOnGrabHapticEffect();

	UPROPERTY(EditAnywhere, Category = "Default")
	ECustomGrabType GrabType = ECustomGrabType::Free;

	//The haptic effect played when this GrabComponent is grabbed
	UPROPERTY(EditAnywhere, Category = "Default")
	UHapticFeedbackEffect_Base* OnGrabHapticEffect = nullptr;

	UPROPERTY(EditAnywhere, Category = "Default", Transient, AdvancedDisplay)
	bool bIsHeld = false;

	// Property to replicate with RepNotify
	UPROPERTY(EditAnywhere, Category = "Default", AdvancedDisplay)
	UMotionControllerComponent* MotionControllerRef = nullptr;

	UPROPERTY(EditAnywhere, Category = "Default", AdvancedDisplay)
	UCustomGrabComponent* PrimaryGrabComponent = nullptr;

	UPROPERTY(EditAnywhere, Category = "Default", Transient, AdvancedDisplay)
	FRotator PrimaryGrabRelativeRotation = FRotator::ZeroRotator;

	UPROPERTY(EditAnywhere, Category = "Default", AdvancedDisplay)
	bool bSimulateOnDrop = false;
};
```

### CustomGrabComponent.cpp
```c
// Fill out your copyright notice in the Description page of Project Settings.

#include "CustomGrabComponent.h"

// Sets default values for this component's properties
UCustomGrabComponent::UCustomGrabComponent()
{
	// Set this component to be initialized when the game starts, and to be ticked every frame.  You can turn these features
	// off to improve performance if you don't need them.
	PrimaryComponentTick.bCanEverTick = true;

	// ...
	OnGrabHapticEffect = LoadObject<UHapticFeedbackEffect_Base>(nullptr, TEXT("/Game/VRTemplate/Haptics/GrabHapticEffect"));

	// Replicate this component
	SetIsReplicatedByDefault(true);
}

// Called every frame
void UCustomGrabComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	// ...
}

bool UCustomGrabComponent::TryGrab(UMotionControllerComponent* MotionController, AActor* Actor)
{
	switch (GrabType)
	{
	case ECustomGrabType::None:
		break;
	case ECustomGrabType::Free:
		SetPrimitiveCompPhysics(false);
		AttachParentToMotionController(MotionController);
		bIsHeld = true;
		break;
	case ECustomGrabType::Snap:
	{
		SetPrimitiveCompPhysics(false);
		AttachParentToMotionController(MotionController);
		bIsHeld = true;
		GetAttachParent()->SetRelativeRotation(this->GetRelativeRotation().GetInverse(), false, nullptr, ETeleportType::TeleportPhysics);
		FVector NewLocation = (this->GetComponentLocation() - GetAttachParent()->GetComponentLocation()) * (-1.0f) + MotionController->GetComponentLocation();
		GetAttachParent()->SetWorldLocation(NewLocation, false, nullptr, ETeleportType::TeleportPhysics);

		break;
	}
	case ECustomGrabType::Custom:
		bIsHeld = true;
		break;
	}

	if (bIsHeld)
	{
		GetOwner()->SetOwner(Actor);
		MotionControllerRef = MotionController;
		ClientSetMotionControllerRefAndOwner(MotionController, Actor);
	}

	return bIsHeld;
}

bool UCustomGrabComponent::TryRelease()
{

	switch (GrabType)
	{
	case ECustomGrabType::None:
		break;
	case ECustomGrabType::Free:
	case ECustomGrabType::Snap:
	{
		if (bSimulateOnDrop)
		{
			SetPrimitiveCompPhysics(true);
		}

		FDetachmentTransformRules DetachmentRules(
			EDetachmentRule::KeepWorld,
			EDetachmentRule::KeepWorld,
			EDetachmentRule::KeepWorld,
			true
		);

		GetAttachParent()->DetachFromComponent(DetachmentRules);
		bIsHeld = false;
		break;
	}
	case ECustomGrabType::Custom:
		bIsHeld = false;
		break;
	}

	if (!bIsHeld)
	{
		OnDropped.Broadcast();
		MotionControllerRef = nullptr;
		ClientRemoveMotionControllerRefAndOwner(); // I don't think this is necessary.
	}

	return !bIsHeld;
}

void UCustomGrabComponent::SetShouldSimulateOnDrop()
{
	UPrimitiveComponent* PrimitiveComp = Cast<UPrimitiveComponent>(GetAttachParent());

	if (PrimitiveComp && PrimitiveComp->IsAnySimulatingPhysics())
	{
		bSimulateOnDrop = true;
	}
}

void UCustomGrabComponent::SetPrimitiveCompPhysics(bool bSimulate)
{
	UPrimitiveComponent* PrimitiveComp = Cast<UPrimitiveComponent>(GetAttachParent());

	if (PrimitiveComp)
	{
		PrimitiveComp->SetSimulatePhysics(bSimulate);
	}
	else
	{
#if UE_BUILD_DEVELOPMENT
		FString ErrorMessage = "GrabComponent->SetSimulatingParent->Cast To PrimitiveComponent FAILED";
		GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red, ErrorMessage);
		UE_LOG(LogTemp, Warning, TEXT("%s"), *ErrorMessage);
#endif
	}
}

const EControllerHand UCustomGrabComponent::GetHeldByHand() const
{
	if (MotionControllerRef->MotionSource == "LeftGrip")
	{
		return EControllerHand::Left;
	}
	else
	{
		return EControllerHand::Right;
	}
}

// Called when the game starts
void UCustomGrabComponent::BeginPlay()
{
	Super::BeginPlay();

	SetShouldSimulateOnDrop();

	if (UPrimitiveComponent* PrimitiveComp = Cast<UPrimitiveComponent>(GetAttachParent()))
	{
		PrimitiveComp->SetCollisionProfileName(FName("PhysicsActor"), true);
	}
}

bool UCustomGrabComponent::AttachParentToMotionController(USceneComponent* MotionController)
{
	FAttachmentTransformRules AttachmentRules(
		EAttachmentRule::KeepWorld,
		EAttachmentRule::KeepWorld,
		EAttachmentRule::KeepWorld,
		true
	);

	if (!GetAttachParent()->AttachToComponent(MotionController, AttachmentRules))
	{
#if UE_BUILD_DEVELOPMENT
		FString ErrorMessage = "Attaching" + GetAttachParent()->GetName() + "to" + MotionController->GetName() + "FAILED - object not grabbed";
		GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red, ErrorMessage);
		UE_LOG(LogTemp, Warning, TEXT("%s"), *ErrorMessage);
#endif

		return false;
	}

	return true;
}

void UCustomGrabComponent::ClientSetMotionControllerRefAndOwner_Implementation(UMotionControllerComponent* MotionController, AActor* Owner)
{
	if (GetOwnerRole() != ROLE_Authority)
	{
		/*
		   Set the VRPawn as the owner of this actor's owner. If we don't do this then the function ServerGrab() will not be executed on the server because the owner is not set.
		   For the listen server client we don't have this problem because the owner is already set in the TryGrab() function and this function is executed on the server.
		*/
		GetOwner()->SetOwner(Owner);
	}

	MotionControllerRef = MotionController;
	ServerGrab();
}

void UCustomGrabComponent::ClientRemoveMotionControllerRefAndOwner_Implementation()
{
	if (GetOwnerRole() != ROLE_Authority)
	{
		// Set the owner to nullptr
		GetOwner()->SetOwner(nullptr);
	}

	MotionControllerRef = nullptr;
}

void UCustomGrabComponent::ServerGrab_Implementation()
{
	OnGrabbed.Broadcast();
	ClientPlayOnGrabHapticEffect();
}

void UCustomGrabComponent::ClientPlayOnGrabHapticEffect_Implementation()
{
	if (OnGrabHapticEffect)
	{
		UGameplayStatics::GetPlayerController(GetWorld(), 0)->PlayHapticEffect(OnGrabHapticEffect, GetHeldByHand());
	}
}
```

When you compile your code, the following linker error appears:

```
unresolved external symbol "__declspec(dllimport) class UClass * __cdecl Z_Construct_UClass_UMotionControllerComponent_NoRegister(void)" (__imp_?Z_Construct_UClass_UMotionControllerComponent_NoRegister@@YAPEAVUClass@@XZ) referenced in function "void __cdecl `dynamic initializer for 'public: static struct UECodeGen_Private::FObjectPropertyParams const Z_Construct_UFunction_UCustomGrabComponent_ClientSetMotionControllerRefAndOwner_Statics::NewProp_MotionController''(void)" (??__E?NewProp_MotionController@Z_Construct_UFunction_UCustomGrabComponent_ClientSetMotionControllerRefAndOwner_Statics@@2UFObjectPropertyParams@UECodeGen_Private@@B@@YAXXZ)	

```

This error indicates that the definition for `UMotionControllerComponent` could not be found. The class `UMotionControllerComponent` is defined in the [`HeadMountedDisplay`](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/HeadMountedDisplay) module. To resolve this, you need to add this module to the `PrivateDependencyModuleNames` array in the VRTutorial.Build.cs file.

```c#
// Fill out your copyright notice in the Description page of Project Settings.

using UnrealBuildTool;

public class VRTutorial : ModuleRules
{
	public VRTutorial(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore" });

		PrivateDependencyModuleNames.AddRange(new string[] { "HeadMountedDisplay" });

		// Uncomment if you are using Slate UI
		// PrivateDependencyModuleNames.AddRange(new string[] { "Slate", "SlateCore" });

		// Uncomment if you are using online features
		// PrivateDependencyModuleNames.Add("OnlineSubsystem");

		// To include OnlineSubsystemSteam, add it to the plugins section in your uproject file with the Enabled attribute set to true
	}
}
```

After adding the module and recompiling your code, the linker error should be resolved. If the C++ Classes folder does not appear in the Content Browser, open the VRTutorial.uproject file in a text editor and add the following:

```
"Modules": [
	{
		"Name": "VRTutorial",
		"Type": "Runtime",
		"LoadingPhase": "Default",
		"AdditionalDependencies": [
			"Engine"
		]
	}
],
```
If you didn't name the project VRTutorial, replace it with your project's name. A quick shoutout to [fkrstevski](https://forums.unrealengine.com/t/c-classes-not-showing-up-in-content-browser/86053/24) for this solution.

### Time to explain a few things
When you examine the **CustomGrabComponent** code, you'll notice it closely resembles the Blueprint **GrabComponent** from our [previous tutorial](./unreal-engine-multiplayer-virtual-reality). However, this time we set the entire **MotionControllerRef** on the client side, instead of just the result of the **GetHeldByHand** function.

To explain how I arrived at the current implementation and why we should use the approach from the previous tutorial instead, we need to establish a starting point. In the previous tutorial, we set the result of the **GetHeldByHand** function on the client side as follows.

<div align="center">
    <img src="/assets/images/2024-11-14/CustomGrabComponent/OnGrabbedAndOnDroppedFromPreviousTutorial.png" alt="Blueprint OnGrabbed and OnDropped events in the Pistol event graph from the previous tutorial" title="On grabbed and on dropped from previous tutorial">
</div>

By replicating the **MotionControllerRef** variable from the **CustomGrabComponent** class, we eliminate the need to pass the result of the **GetHeldByHand** function to the **GrabOnOwningClient** and **DropOnOwningClient** RPCs. This simplifies the logic on the **Pistol** event graph

<div align="center">
    <img src="/assets/images/2024-11-14/CustomGrabComponent/PistolNetworkedOnGrabbedAndOnDropped.png" alt="A simplified version of the Blueprint OnGrabbed and OnDropped events in the Pistol event graph" title="Simplified on grabbed and on dropped">
</div>

To replicate the **MotionControllerRef** variable from the **CustomGrabComponent** class, we need to add the `Replicated` specifier to the `UPROPERTY`. However, even though the property will be replicated, there is no guarantee that the replication will occur before the **GrabOnOwningClient** RPC is called, or before the **GetHeldByHand** function is executed in the **Pistol**’s event graph. This can happen even though the **MotionControllerRef** is set before the **OnGrabbed** event dispatcher is called in the **TryGrab** function.

<div align="center">
    <img src="/assets/images/2024-11-14/CustomGrabComponent/TryGrabFromPreviousTutorial.png" alt="Blueprint TryGrab function from the previous tutorial" title="Try grab from previous tutorial">
</div>

If the **GetHeldByHand** function is called before the **MotionControllerRef** is set on the client side, it will result in the following warning and error:

```
LogScript: Warning: Accessed None trying to read property MotionControllerRef
    GrabComponent_C /Game/VRTemplate/Maps/UEDPIE_1_VRTemplateMap.VRTemplateMap:PersistentLevel.Pistol_00.GrabComponentSnap
    Function /Game/VRTemplate/Blueprints/GrabComponent.GrabComponent_C:GetHeldByHand:0047
PIE: Error: Blueprint Runtime Error: "Accessed None trying to read property MotionControllerRef". Node:  Return Node Graph:  GetHeldByHand Function:  Get Held by Hand Blueprint:  GrabComponent
```

#### RepNotify to the rescue!
To ensure that the **MotionControllerRef** is set before the **OnGrabbed** event dispatcher is called, we can use a **RepNotify**. This **RepNotify** function can then trigger a server RPC that calls the **OnGrabbed** event dispatcher. At this point, you might want to stop me, as you may have started to notice that we are going to perform two network calls for something we previously accomplished with just one. But you [can't stop me now](https://www.youtube.com/watch?v=RKmKEow9ues&ab_channel=%21K7Records). We are at the entrance of a very interesting rabbit hole.

First, it’s important to note the [differences](https://vorixo.github.io/devtricks/stateful-events-multiplayer/#onreps) between **RepNotify** in Blueprint and C++. In Blueprint, the **RepNotify** is executed on both the client and the server. In contrast, in C++, the **RepNotify** is only executed on the clients. Additionally, if the variable remains unchanged, the **RepNotify** is not called in both Blueprint and C++. In C++, we can change a variable by setting a pointer to nullptr. In Blueprint, a variable can be cleared by setting it without any input. Unfortunately, when I attempted this method in both C++ and Blueprint, the **RepNotify** was not called, even though the variable's value had changed. However, in C++, you have the [option](https://dev.epicgames.com/documentation/en-us/unreal-engine/replicate-actor-properties-in-unreal-engine?application_version=5.4) to force the **RepNotify** to execute on every call, even when the variable doesn’t change. This can be achieved by setting the flag `REPNOTIFY_Always` in the `DOREPLIFETIME_CONDITION_NOTIFY()` function. This did the trick.

Unfortunately, a **RepNotify** will not work in this scenario for two reasons. First, as mentioned earlier, the **RepNotify** is executed only on the clients and not on the server in C++. A potential solution might be to call the **RepNotify** function manually for the client acting as the listen server. However, it's impossible to distinguish between a "normal" client and the listen server client, which means you would need to call the **RepNotify** for every client. You can see the call hierarchy in the following code snippet.

```c
bool UCustomGrabComponent::TryGrab(UMotionControllerComponent* MotionController, AActor* Actor)
{
	...

	if (bIsHeld)
	{
		GetOwner()->SetOwner(Actor);
		MotionControllerRef = MotionController;
		OnRep_MotionControllerRefUpdate();
	}

	...
}

void UCustomGrabComponent::OnRep_MotionControllerRefUpdate()
{
	// Call OnGrabbed on server
	ServerGrab();
}

void UCustomGrabComponent::ServerGrab_Implementation()
{
	OnGrabbed.Broadcast();
	UGameplayStatics::GetPlayerController(GetWorld(), 0)->PlayHapticEffect(OnGrabHapticEffect, GetHeldByHand());
}

void ACustomPistol::ClientGrab_Implementation()
{
    if (APlayerController* PlayerController = Cast<APlayerController>(GetWorld()->GetFirstPlayerController()))
    {
        // Enable input for the player controller
        EnableInput(PlayerController);

        if (ULocalPlayer* LocalPlayer = PlayerController->GetLocalPlayer())
        {
            if (UEnhancedInputLocalPlayerSubsystem* InputSubSystem = LocalPlayer->GetSubsystem<UEnhancedInputLocalPlayerSubsystem>())
            {
                const TCHAR* Name = (GrabComponentSnap->GetHeldByHand() == EControllerHand::Right) ? TEXT("/Game/VRTemplate/Input/IMC_Weapon_Right.IMC_Weapon_Right") : TEXT("/Game/VRTemplate/Input/IMC_Weapon_Left.IMC_Weapon_Left");

                // Hard reference load
                if (UInputMappingContext* InputMappingContext = LoadObject<UInputMappingContext>(nullptr, Name))
                {
                    // Add the InputMappingContext to the Subsystem
                    InputSubSystem->AddMappingContext(InputMappingContext, 1);

                    BindPistolInputActions();
                }
            }
        }
    }
}

const EControllerHand UCustomGrabComponent::GetHeldByHand() const
{
	if (MotionControllerRef->MotionSource == "LeftGrip")
	{
		return EControllerHand::Left;
	}
	else
	{
		return EControllerHand::Right;
	}
}
```

Problem solved, right? Well, not exactly. The **RepNotify** function is called when the **MotionControllerRef** is set on the client. If we manually call the **RepNotify** function, it can be executed before the **MotionControllerRef** is set. This isn't an issue for the listen server client, as the **MotionControllerRef** is already set on the server and, consequently, on the client since they are the same. However, it becomes more complicated for other clients. There’s a chance that the replicated variable is not yet set on those clients when it's requested (as seen in the `GetHeldByHand()` function), which could lead to a crash due to a nullptr. While the listen server doesn't face this problem, as the replicated variable is set on the server and directly accessible by the client, distinguishing between the listen server client and other clients to call the **RepNotify** function selectively is not feasible.

Remember when I mentioned that there are two reasons why a **RepNotify** will not work? So far, we've only covered the first reason. Don't worry! I’ll keep it brief for the second reason. The **RepNotify** function needs to call the server RPC responsible for calling the **OnGrabbed** event dispatcher. This server RPC will be executed for the client acting as the listen server, but it won't run for other clients. The issue arises because the owner of the **CustomGrabComponent**'s owner is not set on these clients. Furthermore, since **RepNotify** functions cannot have parameters, we cannot pass an owner to be set on the client side.

#### RPCs then?
The only viable option left is to use an RPC that runs on the owning client, sets the owner, and calls the server RPC upon a successful grab. Similarly, on a successful drop, an RPC runs on the owning client to remove the owner.

By now, you can probably see why it would be much easier and better to simply send the result of the **GetHeldByHand** function as an argument with the **GrabOnOwningClient** and **DropOnOwningClient** RPCs.

## Pistol
Next, we will implement the **Pistol** in C++. Begin by opening your project in the Unreal Editor. Navigate to Tools > New C++ Class... > Common Classes > Actor, then click Next. Set the class type to Public and name the class **CustomPistol**. Click Create Class. Visual Studio will open, and you may need to reload all the project files. Once that's done, build the project.

### CustomPistol.h

```c
// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

// Unreal Engine headers
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "EnhancedInputSubsystems.h"
#include "InputMappingContext.h"
#include "EnhancedInputComponent.h"
#include "Engine/StreamableManager.h"
#include "Engine/AssetManager.h"

// Project headers
#include "CustomGrabComponent.h"

// The .generated.h file must be the last include
#include "CustomPistol.generated.h"

UCLASS()
class VRTUTORIAL_API ACustomPistol : public AActor
{
	GENERATED_BODY()

public:
	// Sets default values for this actor's properties
	ACustomPistol();

	// Called every frame
	virtual void Tick(float DeltaTime) override;

protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

private:
	// Client function for grabbing
	UFUNCTION(Client, Reliable)
	void ClientGrab();

	void BindPistolInputActions();

	// Client funtion for dropping
	UFUNCTION(Client, Reliable)
	void ClientDrop();

	void RemovePistolInputActions();

	UFUNCTION(Server, Unreliable)
	void ServerShootLeft();

	UFUNCTION(Server, Unreliable)
	void ServerShootRight();

	void Shoot();

	UFUNCTION(Client, Unreliable)
	void ClientPlayPistolFireHapticEffect();

	UPROPERTY(VisibleInstanceOnly)
	USkeletalMeshComponent* SkeletalMeshGun = nullptr;

	UPROPERTY(VisibleInstanceOnly)
	UCustomGrabComponent* GrabComponentSnap = nullptr;

	UPROPERTY(VisibleInstanceOnly)
	USceneComponent* MuzzleLocation = nullptr;

	UHapticFeedbackEffect_Base* PistolFireHapticEffect = nullptr;

	const FInputBindingHandle* ShootLeftBindingHandle;

	const FInputBindingHandle* ShootRightBindingHandle;
};
```

### CustomPistol.cpp

```c
// Fill out your copyright notice in the Description page of Project Settings.

#include "CustomPistol.h"

// Sets default values
ACustomPistol::ACustomPistol()
{
    // Set this actor to call Tick() every frame.  You can turn this off to improve performance if you don't need it.
    PrimaryActorTick.bCanEverTick = true;

    // Create and attach the SkeletalMeshGun to the actor
    SkeletalMeshGun = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("SkeletalMeshGun"));
    RootComponent = SkeletalMeshGun;

    // Load the SkeletalMesh and Material
    if (USkeletalMesh* SkeletalMesh = LoadObject<USkeletalMesh>(nullptr, TEXT("/Game/FPWeapon/Mesh/SK_FPGun")))
    {
        //SkeletalMeshGun->SetSkeletalMesh(SkeletalMesh);
		SkeletalMeshGun->SetSkeletalMeshAsset(SkeletalMesh);
    }

    if (UMaterialInterface* SkeletalMeshMaterial = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/FPWeapon/Materials/M_FPGun_C++")))
    {
        SkeletalMeshGun->SetMaterial(0, SkeletalMeshMaterial);
    }

    // Scale the SkeletalMeshGun
    SkeletalMeshGun->SetWorldScale3D(FVector(0.5f, 0.5f, 0.5f));

    // Set the SkeletalMeshGun's physics settings
    SkeletalMeshGun->SetSimulatePhysics(true);

    // Set the SkeletalMeshGun's collision settings
    SkeletalMeshGun->SetGenerateOverlapEvents(true);
    SkeletalMeshGun->SetCollisionProfileName(FName("PhysicsActor"));

    // Create and attach the GrabComponentSnap to the actor
    GrabComponentSnap = CreateDefaultSubobject<UCustomGrabComponent>(TEXT("GrabComponentSnap"));
    GrabComponentSnap->SetupAttachment(SkeletalMeshGun);

    // Set the GrabComponentSnap's location and rotation
    GrabComponentSnap->SetWorldLocation(FVector(0.000012, -1.449529, 0.700515));
    GrabComponentSnap->SetWorldRotation(FRotator(80.000183, 90.000099, -0.000064));

    // Create and attach the MuzzleLocation to the actor
    MuzzleLocation = CreateDefaultSubobject<USceneComponent>(TEXT("MuzzleLocation"));
    MuzzleLocation->SetupAttachment(SkeletalMeshGun);

    // Set the MuzzleLocation's location and rotation
    MuzzleLocation->SetWorldLocation(FVector(0.000000, 55.000000, 11.000000));
    MuzzleLocation->SetWorldRotation(FRotator(0.000000, 90.000137, 0.000000));

    // Load the PistolFireHapticEffect
    PistolFireHapticEffect = LoadObject<UHapticFeedbackEffect_Base>(nullptr, TEXT("/Game/VRTemplate/Haptics/PistolFireHapticEffect"));

    // Set the Replicates variable to true
    bReplicates = true;

    // Set the ReplicateMovement variable to true
    SetReplicateMovement(true);

    // Set the IsReplicated variable to true
    SkeletalMeshGun->SetIsReplicated(true);
}

// Called every frame
void ACustomPistol::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

}

// Called when the game starts or when spawned
void ACustomPistol::BeginPlay()
{
    Super::BeginPlay();

    // Add ClientGrab to the OnGrabbed event dispatcher
    GrabComponentSnap->OnGrabbed.AddDynamic(this, &ACustomPistol::ClientGrab);
    GrabComponentSnap->OnDropped.AddDynamic(this, &ACustomPistol::ClientDrop);
}

void ACustomPistol::ClientGrab_Implementation()
{
    if (APlayerController* PlayerController = Cast<APlayerController>(GetWorld()->GetFirstPlayerController()))
    {
        // Enable input for the player controller
        EnableInput(PlayerController);

        if (ULocalPlayer* LocalPlayer = PlayerController->GetLocalPlayer())
        {
            if (UEnhancedInputLocalPlayerSubsystem* InputSubSystem = LocalPlayer->GetSubsystem<UEnhancedInputLocalPlayerSubsystem>())
            {
                /*
                    Get the InputMappingContext from the existing file

                    "/Game/VRTemplate/Input/IMC_Weapon_Right.IMC_Weapon_Right"
                    ----------------------------------------------------------
                    This is the fully qualified reference to both the package and the specific object within that package. The part before the period refers to the package (the .uasset file).
                    The part after the period (.) explicitly refers to the name of the object inside that package.
                    It's useful when you want to be absolutely certain about loading a specific object, especially if the package contains multiple assets.

                    "/Game/VRTemplate/Input/IMC_Weapon_Right"
                    -----------------------------------------
                    This path is simplified and refers to the package or asset, assuming that the asset's name inside the package matches the package's name (which is usually the case).
                    It omits the explicit reference to the object within the package. Unreal assumes that you're referring to the object whose name matches the package name
                    (in this case, IMC_Weapon_Right inside the IMC_Weapon_Right.uasset package).
                */
                const TCHAR* Name = (GrabComponentSnap->GetHeldByHand() == EControllerHand::Right) ? TEXT("/Game/VRTemplate/Input/IMC_Weapon_Right.IMC_Weapon_Right") : TEXT("/Game/VRTemplate/Input/IMC_Weapon_Left.IMC_Weapon_Left");

                // Hard reference load
                if (UInputMappingContext* InputMappingContext = LoadObject<UInputMappingContext>(nullptr, Name))
                {
                    // Add the InputMappingContext to the Subsystem
                    InputSubSystem->AddMappingContext(InputMappingContext, 1);

                    BindPistolInputActions();
                }

                /*
                // Set the soft object pointer path
                TSoftObjectPtr<UInputMappingContext> InputMappingContext = TSoftObjectPtr<UInputMappingContext>(FSoftObjectPath(Name));

                // Soft reference synchronous load
                InputMappingContext.LoadSynchronous();

                // Add the input mapping context to the input system
                if (InputMappingContext.IsValid())
                {
                    InputSubSystem->AddMappingContext(InputMappingContext.Get(), 1);
                }
                */

                /*
                // Set the soft object pointer path
                TSoftObjectPtr<UInputMappingContext> InputMappingContext = TSoftObjectPtr<UInputMappingContext>(FSoftObjectPath(Name));

                // Soft reference asynchronous load
                TSharedPtr<FStreamableHandle> Handle = UAssetManager::GetStreamableManager().RequestAsyncLoad(InputMappingContext.ToSoftObjectPath(), FStreamableDelegate::CreateLambda([=]()
                {
                    if (InputMappingContext.IsValid())
                    {
                        InputSubSystem->AddMappingContext(InputMappingContext.Get(), 1);
                        UE_LOG(LogTemp, Log, TEXT("Asset Loaded: %s"), *InputMappingContext.Get()->GetName());
                    }
                }));
                */
            }
        }
    }

    UE_LOG(LogTemp, Warning, TEXT("ClientGrab_Implementation"));
}

void ACustomPistol::BindPistolInputActions()
{
    if (APlayerController* PlayerController = Cast<APlayerController>(GetWorld()->GetFirstPlayerController()))
    {
        if (UEnhancedInputComponent* EnhancedInput = Cast<UEnhancedInputComponent>(PlayerController->InputComponent))
        {
            if (UInputAction* IA_Shoot_Left = LoadObject<UInputAction>(nullptr, TEXT("/Game/VRTemplate/Input/Actions/IA_Shoot_Left.IA_Shoot_Left")))
            {
                ShootLeftBindingHandle = &EnhancedInput->BindAction(IA_Shoot_Left, ETriggerEvent::Started, this, &ACustomPistol::ServerShootLeft);
            }

            if (UInputAction* IA_Shoot_Right = LoadObject<UInputAction>(nullptr, TEXT("/Game/VRTemplate/Input/Actions/IA_Shoot_Right.IA_Shoot_Right")))
            {
                ShootRightBindingHandle = &EnhancedInput->BindAction(IA_Shoot_Right, ETriggerEvent::Started, this, &ACustomPistol::ServerShootRight);
            }
        }
    }
}

void ACustomPistol::ClientDrop_Implementation()
{
    if (APlayerController* PlayerController = Cast<APlayerController>(GetWorld()->GetFirstPlayerController()))
    {
        // Disable input for the player controller
        DisableInput(PlayerController);

        if (ULocalPlayer* LocalPlayer = PlayerController->GetLocalPlayer())
        {
            if (UEnhancedInputLocalPlayerSubsystem* InputSubSystem = LocalPlayer->GetSubsystem<UEnhancedInputLocalPlayerSubsystem>())
            {
                // Get the InputMappingContext from the existing file
                const TCHAR* Name = (GrabComponentSnap->GetHeldByHand() == EControllerHand::Right) ? TEXT("/Game/VRTemplate/Input/IMC_Weapon_Right.IMC_Weapon_Right") : TEXT("/Game/VRTemplate/Input/IMC_Weapon_Left.IMC_Weapon_Left");

                // Hard reference load
                if (UInputMappingContext* InputMappingContext = LoadObject<UInputMappingContext>(nullptr, Name))
                {
                    // Remove the InputMappingContext from the Subsystem
                    InputSubSystem->RemoveMappingContext(InputMappingContext);

                    RemovePistolInputActions();
                }
            }
        }
    }
}

void ACustomPistol::RemovePistolInputActions()
{
    if (APlayerController* PlayerController = Cast<APlayerController>(GetWorld()->GetFirstPlayerController()))
    {
        if (UEnhancedInputComponent* EnhancedInput = Cast<UEnhancedInputComponent>(PlayerController->InputComponent))
        {
            if (ShootLeftBindingHandle)
            {
                if (EnhancedInput->RemoveBinding(*ShootLeftBindingHandle))
                    UE_LOG(LogTemp, Log, TEXT("ShootLeftBindingHandle removed"));
            }

            if (ShootRightBindingHandle)
            {
                if (EnhancedInput->RemoveBinding(*ShootRightBindingHandle))
                    UE_LOG(LogTemp, Log, TEXT("ShootRightBindingHandle removed"));
            }

            //EnhancedInput->ClearBindingsForObject(this);
        }
    }
}

void ACustomPistol::ServerShootLeft_Implementation()
{
    if (GrabComponentSnap->GetHeldByHand() == EControllerHand::Left)
    {
        Shoot();
    }
}

void ACustomPistol::ServerShootRight_Implementation()
{
    if (GrabComponentSnap->GetHeldByHand() == EControllerHand::Right)
    {
        Shoot();
    }
}

void ACustomPistol::Shoot()
{
    // Set the MuzzleLocation's location and rotation
    FTransform ProjectileTransform = FTransform(MuzzleLocation->GetComponentRotation(), MuzzleLocation->GetComponentLocation(), FVector(1.000000, 1.000000, 1.000000));

    // Spawn parameters for the projectile
    FActorSpawnParameters SpawnParams;
    SpawnParams.Owner = this;
    SpawnParams.Instigator = GetWorld()->GetFirstPlayerController()->GetPawn();

    /*
        In Unreal Engine, every Blueprint has a unique path, and to access it in C++, you need the correct path including the _C suffix.
        If you try to load a Blueprint without the _C suffix, you are loading the Blueprint asset, not the class.
    */
    if (UClass* ProjectileClass = LoadClass<AActor>(nullptr, TEXT("/Game/VRTemplate/Blueprints/Projectile.Projectile_C")))
    {
        // Spawn the projectile
        GetWorld()->SpawnActor<AActor>(ProjectileClass, ProjectileTransform, SpawnParams);
    }

    // Play the haptic effect on the owning client
    ClientPlayPistolFireHapticEffect();
}

void ACustomPistol::ClientPlayPistolFireHapticEffect_Implementation()
{
    if (PistolFireHapticEffect)
    {
        UGameplayStatics::GetPlayerController(GetWorld(), 0)->PlayHapticEffect(PistolFireHapticEffect, GrabComponentSnap->GetHeldByHand());
    }
}
```

If you try to build your project at this point, you will get the following error:

```
Cannot open include file: 'EnhancedInputSubsystems.h': No such file or directory
```

To resolve this, you need to add `"EnhancedInput"` to `PublicDependencyModuleNames` in the VRTutorial.Build.cs file.

```c#
// Fill out your copyright notice in the Description page of Project Settings.

using UnrealBuildTool;

public class VRTutorial : ModuleRules
{
	public VRTutorial(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] { "EnhancedInput", "Core", "CoreUObject", "Engine", "InputCore" });

		PrivateDependencyModuleNames.AddRange(new string[] { "HeadMountedDisplay" });

		// Uncomment if you are using Slate UI
		// PrivateDependencyModuleNames.AddRange(new string[] { "Slate", "SlateCore" });

		// Uncomment if you are using online features
		// PrivateDependencyModuleNames.Add("OnlineSubsystem");

		// To include OnlineSubsystemSteam, add it to the plugins section in your uproject file with the Enabled attribute set to true
	}
}
```

Once you have done this, recompile your code.

### Time to explain a few things
The **IMC_Default**, **IMC_Hands**, **IMC_Menu**, **IMC_Weapon_Left**, and **IMC_Weapon_Right** contexts are applied immediately when the Enhanced Input subsystem is ready. To prevent automatic addition of Input Mapping Contexts, you can disable 'Add Immediately' under Enhanced Input in the Project Settings, as we manage the mapping contexts manually.

<div align="center">
    <img src="/assets/images/2024-11-14/CustomPistol/InputMappingContextsAddImmediatelyDisabled.png" alt="Unreal Editor project settings where add immediately is disabled for the input mapping contexts" title="Input mapping contexts add immediately disabled">
</div>

Notice that in the `RemovePistolInputActions()` function, the binding handles are used to remove the pistol's input actions. While working on the C++ **Pistol**, I encountered a bug where the input actions were bound twice. As a result, the `ShootLeftBindingHandle` and `ShootRightBindingHandle` were overwritten in the `BindPistolInputActions()` function. This led to not all handles being properly removed when removing input actions. For example, if you grab the right weapon first, release it, then grab the left weapon, the handle for the right weapon remains. When you attempt to shoot, the lingering handle still calls the `ServerShootRight()` function. This function calls `GetHeldByHand()`, which uses `MotionControllerRef` to determine which hand holds the pistol. However, since `MotionControllerRef` is set to nullptr after dropping the right weapon, the program crashes. To prevent such errors, you can opt to clear all bindings for the pistol object. A code snippet for this solution is commented out in the `RemovePistolInputActions()` function.

Another issue I encountered was that if a **CustomPistol** was duplicated inside the Unreal Editor, you couldn't shoot with the duplicated pistol (i.e. no projectiles were spawned). This problem was related to the **OnGrabbed** delegate. Moving the `AddDynamic()` function call from the constructor to the `BeginPlay()` function appeared to resolve the issue. I came across the solution [here](https://forums.unrealengine.com/t/adddynamic-not-working/299247/6).

### Update the Blueprint code
So far, we have created a C++ networked pistol. However, if you replace the Blueprint version with our **CustomPistol** and try to grab it, you will notice that nothing happens. Why is that? When attempting to grab an object, only those with a grab component of the class **GrabComponent** are considered. A better approach would be to create a base class for **GrabComponent** and derive both **CustomGrabComponent** and the Blueprint **GrabComponent** from it. However, for now, I will simply replace the Blueprint **GrabComponent** references with **CustomGrabComponent**. To do this, set the **ComponentClass** parameter of the **GetComponentsByClass** function in the **GetGrabComponentNearMotionController** function of the **VRPawn** class to **CustomGrabComponent**.

<div align="center">
    <img src="/assets/images/2024-11-14/UpdateTheBlueprintCode/ChangeComponentClass.png" alt="Blueprint code of the GetGrabComponentNearMotionController function of the VRPawn class where the ComponentClass argument of the GetComponentsByClass function is changed to CustomGrabComponent" title="Change component class">
</div>

If we compile the Blueprint code, we will encounter errors indicating that **CustomGrabComponent** is not compatible with **GrabComponent**. To resolve these errors, address them one by one. This process includes updating all references to **GrabComponent** in the **GetGrabComponentNearMotionController** function and the event graph of the **VRPawn**.

Once you've resolved all the errors and run the project, you will notice that the pistols don't snap to your hand as they used to. This occurs because the **GrabType** is set to **Free** by default, and since the original **GrabComponent** Blueprint didn't include a **SetGrabType** function, I did not implement it in C++. Therefore, you will need to set the **GrabType** in the Unreal Editor. To do this, click on the pistol in your level, search for **GrabType** in the Details panel, and set it to **Snap**.

Another thing you may have noticed is that the collision profile name for the `SkeletalMeshGun` is set to `PhysicsActor` in the **CustomPistol** constructor. However, this is repeated in the `BeginPlay()` function of **CustomGrabComponent**, as the `SkeletalMeshGun` is the parent of **CustomGrabComponent**. This led me to believe I could remove the `SetCollisionProfileName` call from the **CustomPistol** constructor. However, when I did so, the function call to `IsAnySimulatingPhysics()` in the `SetShouldSimulateOnDrop()` function returned false, even though `SetSimulatePhysics(true)` is called for the `SkeletalMeshGun` in the **CustomPistol** constructor.

```c
bool USkeletalMeshComponent::IsAnySimulatingPhysics() const
{
	for ( int32 BodyIndex=0; BodyIndex<Bodies.Num(); ++BodyIndex )
	{
		if (Bodies[BodyIndex]->IsInstanceSimulatingPhysics())
		{
			return true;
		}
	}

	return false;
}
```

The reason for this behavior is that the `Bodies` array is empty. However, when we set the collision profile name to `PhysicsActor` for the `SkeletalMeshGun` in the **CustomPistol** constructor, the `Bodies` array is populated. At this point, I am not entirely sure why this occurs. If you have insights on this, please reach out.

## Grabbable_SmallCube
Since we are now only looking for the **CustomGrabComponent** to grab objects, the **Grabbable_SmallCube** instances are no longer grabbable. To resolve this, we can either replace the **GrabComponent** of the **Grabbable_SmallCube** with **CustomGrabComponent** or duplicate the **Grabbable_SmallCube** and update the component in the duplicated version. The cubes in the **VRTemplateMap** can then be replaced with the duplicated version. We will opt for the latter option. To do this, follow these steps:

1. Duplicate the **Grabbable_SmallCube** Blueprint and rename it to **Custom_Grabbable_SmallCube**.
2. Add the **CustomGrab** as a component and rename it to **CustomGrabComponent**.
3. Set the scale of the **CustomGrabComponent** to match that of the original **GrabComponent**.
4. Delete the **GrabComponent**.
5. Compile the **Custom_Grabbable_SmallCube** Blueprint class.
6. In the Outliner on the right-hand side of the **VRTemplateMap**, select all instances of the **Grabbable_SmallCube**. Right-click on the selected items and choose Replace Selected Actors with > **Custom_Grabbable_SmallCube**. If the [scale values](https://forums.unrealengine.com/t/replace-selected-actor-does-not-apply-scale-values/1902492) are not applied correctly, you may need to replace the actors manually or adjust the scale manually. The latter option is likely to require less work.

The **Cube_FireLogs** and **SM_Ball_01** also have a grab component but do not have a Blueprint class. If you want to make these objects grabbable, select them in the Outliner of the **VRTemplateMap** and replace the **GrabComponent** with a **CustomGrabComponent** in their respective details panels.