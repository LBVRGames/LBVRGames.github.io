---
layout: post
title: Unreal Engine Networked Pistol C++ Implementation
author: wout
date: 2024-10-11 11:20:00 +0200
category: [Tutorials]
published: false
---

## Setup
* CPU: Intel Core i5-13600KF
* GPU: Inno3D GeForce RTX 4070 TWIN X2
* RAM: 64 GB
* OS:  Windows 10 Pro 22H2
* UE:  5.4
* IDE: Visual Studio 2022 Community Edition

## Summary
This tutorial explains how to implement the pistol of the Unreal Engine's Virtual Reality (VR) template in C++. Since this tutorial assumes familiarity with the VR template, I will not explain its internal workings beyond what is necessary to understand the changes being made. By the end of this tutorial, you should have an understanding of how to implement networked VR objects in C++. If you have any questions, feel free to [email us](mailto:tutorials@lbvrgames.com).

## Generate Visual Studio project files
To open the Unreal Engine's Virtual Reality template in Visual Studio we can right-click on the **\*.uproject** name and select **Generate Visual Studio project files**. However, if we do this you will notice the following pop-up window appear.

<div align="center">
    <img src="/assets/images/NetworkedPistolC++/GenerateVisualStudioProjectFiles/ErrorPop-Up.png" alt="Error pop-up window" title="Error pop-up">
</div>

The pop-up window let's us know that we cannot generate Visual Studio project files because the project doesn't contain any source code (i.e. C++ files). To mitigate this we can open the project in the Unreal Editor. Go to Tools > New C++ class... > Common Classes > None and click Next. In the following window there are a number of settings. Let's have a look at them.

<div align="center">
    <img src="/assets/images/NetworkedPistolC++/GenerateVisualStudioProjectFiles/AddC++Class.png" alt="Add C++ class window" title="Add C++ class">
</div>

First, we can choose a class type. Notice that at the moment a class type is not selected and that it is not necessary to select one. However, once we select Private or Public we can toggle between these two options but we cannot deselect them both. This option defines in which folder the C++ files are placed. Before selection one of the options the path is **/PathToProjectDirectory/Source/\<ModuleName\>/MyClass.(h)(cpp)**. After selecting Public the header file will be placed in **/PathToProjectDirectory/Source/\<ModuleName\>/Public/MyClass.h** while the source file will be placed in **/PathToProjectDirectory/Source/\<ModuleName\>/Private/MyClass.h**. If you select Private both the header and source file are placed in **/PathToProjectDirectory/Source/\<ModuleName\>/Private/**.

You are probably wondering what the difference is between the Private and Public options. If you hover over both options you will see a small description appear.
* Public: A public class can be included and used inside other modules in addition to the module it resides in.
* Private: A private class can only be included and used within the module it resides in.

A more elaborated explanation on the difference between both options is made on the [UE Cast](https://www.youtube.com/watch?v=T8D3AhNd9Ww&ab_channel=UECasts) YouTube channel. On the Unreal Engine forum [SaxonRah](https://forums.unrealengine.com/t/what-public-and-private-mean-on-c-wizard/50336/5) explains why you should use public and private classes.

The first class we will make is the CustomGrabType class. We will make this class Private. Next, we can name our class. Name it CustomGrabType. After the name field you will see a dropdown menu. This let's you select the target module for your new class. At the moment we only have one module so you can leave it as it is. The other options can be left on their default values. Finally, we can click on Create Class.

## GrabType
When the class is created we will see the message that we need to build the project from our IDE (i.e. Visual Studio).

<div align="center">
    <img src="/assets/images/NetworkedPistolC++/GenerateVisualStudioProjectFiles/BuildFromIDEPop-UpMessage.png" alt="Build from IDE pop-up message window" title="Build from IDE pop-up message">
</div>

Click OK. Next, a new message appears stating that our class is succesfully added but that we must recompile our module before it will appear in the Content Browser.

<div align="center">
    <img src="/assets/images/NetworkedPistolC++/GenerateVisualStudioProjectFiles/RecompilePop-UpMessage.png" alt="Recompile pop-up message window" title="Recompile pop-up message">
</div>

Click Yes. The Visual Studio project will be opened and both the CustomGrabType source and header files are displayed. To make sure everything compiles at this point, right-click on the project in the Solution Explorer and select Build. If you did not close the Unreal Editor prior to building while the build configuration is set to Development Editor then the following error will appear.

```
The command ""C:\W\Epic Games\UE_5.4\Engine\Build\BatchFiles\Build.bat" VRTutorialEditor Win64 Development -Project="E:\Unreal Projects\VRTutorial\VRTutorial.uproject" -WaitMutex -FromMsBuild -architecture=x64" exited with code 6.
```

Close the Unreal Editor and build the project again. Once the project is build you right-click again on the project but this time you select Debug > Start New Instance. This will launch the Development Editor if this is selected as the build configuration from the Solution Configurations list. Once this works you can close the Unreal Engine editor. The difference between Build and Start New Instance is that the former compiles the code but does not run it while the latter compiles the code, if necessary, and then runs it.

Since the CustomGrabType is just an enum value we can remove the source file and keep the header file. Remove the source file both in the Solution Explorer and in the source directory. The implementation of the CustomGrabType should look similar to this:

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

Let's break this down.
* `#pragma once` makes sure that this header file is included only once to adhere to the One Definition Rule and avoid issues such as circular dependencies. It is not part of the C++ language standard, but rather a compiler extension. However, it has become widely adopted and is considered a best practice for header file inclusion in modern C++ development. Another techique would be to use header guards (i.e. `#ifndef`, `#define` and `#endif`). The difference between the two is that `#pragma once` offers a simpler syntax, improved readability, and potential compilation efficiency, while header guards are more portable and guaranteed to work on any compliant compiler.
* The line `#include "CustomGrabType.generated.h"` includes another header file called `CustomGrabType.generated.h` which is generated by the [UnrealHeaderTool](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-header-tool-for-unreal-engine). the UnrealHeaderTool is a command-line tool used by Unreal Engine to generate additional code and metadata for Unreal Engine types defined in header files.  
* The line `UENUM(BlueprintType)` is a macro provided by Unreal Engine. It is used to define an enumeration that can be used in Unreal Engine's Blueprint visual scripting system.
* The line `enum class ECustomGrabType : uint8` starts the definition of the enumeration `ECustomGrabType`. It specifies that `ECustomGrabType` is an enumeration with a fixed underlying type of `uint8`, which means it can hold values from 0 to 255. Notice that the class name is not `CustomGrabType` but `ECustomGrabType`. This is done to adhere to the Epic C++ Coding [Standard](https://dev.epicgames.com/documentation/en-us/unreal-engine/epic-cplusplus-coding-standard-for-unreal-engine) for Unreal Engine.
* The subsequent lines define the individual enumeration values: `None`, `Free`, `Snap`, and `Custom`. Each value is assigned a display name using the `UMETA(DisplayName = "...")` macro. These display names are used for better readability and can be accessed in Unreal Engine's Blueprint system.

Build the project to include the CustomGrabType.

## GrabComponent
Next, we are going to implement the GrabComponent in C++. Let's start with opening our project in the Unreal Editor. This time go to Tools > New C++ Class... > Common Classes > Scene Component and click Next. Set the class type to Private and name the class CustomGrabComponent. Click on Create Class. Visual Studio will open and probably you have to reload your project files. Build your project. If you didn't start the Unreal Editor from Visual Studio by starting a new instance but clicked on the project file in your file explorer or started the editor from the Epic Games Launcher then you probably receive the following error.

```
The command ""C:\W\Epic Games\UE_5.4\Engine\Build\BatchFiles\Build.bat" VRTutorialEditor Win64 Development -Project="E:\Unreal Projects\VRTutorial\VRTutorial.uproject" -WaitMutex -FromMsBuild -architecture=x64" exited with code 6.
```

To resolve this error, close your editor and build the project again. If the C++ Classes folder doesn't appear in the Content Drawer then open the *.uproject file and add the following:
```
"Modules": [
	{
		"Name": "VRTemplate",
		"Type": "Runtime",
		"LoadingPhase": "Default",
		"AdditionalDependencies": [
			"Engine"
		]
	}
],
```
Replace VRTemplate with the name of your project. A quick shout out to [fkrstevski](https://forums.unrealengine.com/t/c-classes-not-showing-up-in-content-browser/86053/24) for this solution.

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

When you compile your code the following linker error appears:

```
unresolved external symbol "__declspec(dllimport) class UClass * __cdecl Z_Construct_UClass_UMotionControllerComponent_NoRegister(void)" (__imp_?Z_Construct_UClass_UMotionControllerComponent_NoRegister@@YAPEAVUClass@@XZ) referenced in function "void __cdecl `dynamic initializer for 'public: static struct UECodeGen_Private::FObjectPropertyParams const Z_Construct_UFunction_UCustomGrabComponent_ClientSetMotionControllerRefAndOwner_Statics::NewProp_MotionController''(void)" (??__E?NewProp_MotionController@Z_Construct_UFunction_UCustomGrabComponent_ClientSetMotionControllerRefAndOwner_Statics@@2UFObjectPropertyParams@UECodeGen_Private@@B@@YAXXZ)	

```

This means that the definition for UMotionController could not be found. The class UMotionController is defined in the [HeadMountedDisplay](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/HeadMountedDisplay) module. This module can be added to the private dependency module names in the *.Build.cs file.

```
PrivateDependencyModuleNames.AddRange(new string[] { "HeadMountedDisplay" });
```

When you compile your code again the linker error should be resolved.

### Time To Explain A Few Things
If you look at the CustomGrabComponent code then you will notice that it looks almost the same as the Blueprint GrabComponent of our [previous tutorial](./unreal-engine-multiplayer-virtual-reality). However, this time we set the entire MotionControllerRef on the client side instead of only the result of the GetHeldByHand() function.

To explain how I ended up with the current implementation and why we should better use the approach from the previous tutorial we need to establish a baseline from where to start. In the previous tutorial we set the result of the GetHeldByHand() function on the client side as follow.

<div align="center">
    <img src="/assets/images/NetworkedPistolC++/CustomGrabComponent/OnGrabbedAndOnDroppedFromPreviousTutorial.png" alt="Blueprint OnGrabbed and OnDropped events in the Pistol event graph from the previous tutorial" title="On grabbed and on dropped from previous tutorial">
</div>

If we replicate the MotionControllerRef variable from the CustomGrabComponent class then we don't need to pass the result of the GetHeldByHand() function to the GrabOnOwningClient and DropOnOwningClient RPCs. This simplifies things on the side of the Pistol event graph.

<div align="center">
    <img src="/assets/images/NetworkedPistolC++/CustomGrabComponent/PistolNetworkedOnGrabbedAndOnDropped.png" alt="A simplified version of the Blueprint OnGrabbed and OnDropped events in the Pistol event graph" title="Pistol networked on grabbed and on dropped">
</div>

To replicate the MotionControllerRef variable from the CustomGrabComponent class we need to add Replicated to the UPROPERTY. Although the property will be replicated there is no guarantee that the replication happens before the GrabOnOwningClient RPC is called, and therefore before the GetHeldByHand() function in the Pistol's event graph, despite that the MotionControllerRef is set before the OnGrabbed event dispatcher is called in the TryGrab function.

<div align="center">
    <img src="/assets/images/NetworkedPistolC++/CustomGrabComponent/TryGrabFromPreviousTutorial.png" alt="Blueprint TryGrab function from the previous tutorial" title="Try grab from previous tutorial">
</div>

If the GetHeldByHand() function is called while the MotionControllerRef is not yet set on the client side then this results in a "No owning client for ... " warning.

#### RepNotify to the rescue!
To make sure that the MotionControllerRef is set before the OnGrabbed event dispatcher is called we can use a RepNotify. The RepNotify function can then be used to call a server RPC which calls the OnGrabbed event dispatcher. At this point you should already stop me because as you probably start to notice we are going to perfrom two network calls for something that we did previously with only one network call. But you [can't stop me now](https://www.youtube.com/watch?v=RKmKEow9ues&ab_channel=%21K7Records) we are at the entrance of a very interesting rabbit hole.

First of all there is a difference between a RepNotify in Blueprint and C++. In Blueprint the RepNotify is executed on both the client and the server. However, in C++ the RepNotify is only executed on the clients. Also, when the variable is not changed then the RepNotify is not called. This is the case for both Blueprint and C++. However, in C++ you can force the RepNotify to be executed on every single call even when the variable doesn't change. This can be done by setting the flag REPNOTIFY_Always in the DOREPLIFETIME_CONDITION_NOTIFY() function.

Unfortunately, a RepNotify will not work. The reason is twofold. As I mentioned in the previous paragraphd the RepNotify will only be executed on the clients and not on the server in C++. A possible solution would be to call the RepNotify function manually for the client acting as the listen server. However, it is not possible to distinguish between a "normal" client and the listen server client. Therefore, you have to call the RepNotify for every client. You can see the call hierarchy in the following code snippet.

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

Problem solved! Right? Well, not exactly. You see the RepNotify function is called when the MotionControllerRef is set on the client. If we call the RepNotify function manually then the function can be executed before the MotionControllerRef is set. This is not a problem for the listen server client because the MotionControllerRef is set already on the server and therefore also on the client because they are the same. However, for the other clients it is not this simple. There is the chance that the replicated variable is not yet set on the client and is already requested on the client side (see GetHeldByHand() function) resulting in a crash (nullptr). On the listen server you would not have this problem since the replicated variable is set on the server and therefore directly accesable by the client. But what if we just make the distinction between the listen server client and the other clients and only call the RepNotify function for the listen server client? Well, on paper it is a good idea. Unfortunately, it is not possible to distinguish between a “normal” client and the listen server client.  

Remember that I said that there are two reasons why a RepNotify will not work? So far we have only covered the first reason. Don't worry I will keep it short for the second reason. The RepNotify function needs to call the server RPC responsible for calling the OnGrabbed event dispatcher. This server RPC will be called for the client acting as the listen server but for the other clients the server RPC will not be executed. The reason is because the owner of the CustomGrabComponent's owner is not set on these clients. And since RepNotify functions can't have parameters we can't pass an owner to the be set on the client-side. 


#### RPCs then?
The only viable option that remains is to use a RPC that runs on the owning client, sets the owner and calls the server RPC on a successful grab. On a succesful drop a RPC runs on the owning client to remove the owner.

By now you probably see why it would be a lot easier and also better to just sent the GetHeldByHand() result as an argument with the GrabOnOwningClient and DropOnOwningClient RPCs.

## Pistol
Next, we are going to implement the Pistol in C++. Let's start with opening our project in the Unreal Editor. This time go to Tools > New C++ Class... > Common Classes > Actor and click Next. Set the class type to Public and name the class CustomPistol. Click on Create Class. Visual Studio will open and probably you have to reload all your project files. Build your project.

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

If you try to build your project at this point then you will get the following error:

```
Cannot open include file: 'EnhancedInputSubsystems.h': No such file or directory
```
To resolve this you need to add `"EnhancedInput"` to `PublicDependencyModuleNames` in the MyProject.Build.cs.

```c#
// Fill out your copyright notice in the Description page of Project Settings.

using UnrealBuildTool;

public class Construct : ModuleRules
{
	public Construct(ReadOnlyTargetRules Target) : base(Target)
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

(Regenerate Visual Studio Project files after changing *.Build.cs) -> Not sure if necessary.

### Time To Explain A Few Things

The IMC_Default, IMC_Hands, IMC_Menu, IMC_Weapon_Left and IMC_Weapon_Right are applied immediately when the EI subsystem is ready. We can disable add immediately for Input Mapping Contexts in Project Settings under Enhanced Input since we add the mapping contexts ourselves.

Notice that in the RemovePistolInputActions() function the binding handles are used to remove the pistol's input actions. When I was working on the C++ Pistol I ran into a fault where the input actions were bind twice. As a result the ShootLeftBindingHandle and ShootRightBindingHandle were overwritten in the BindPistolInputActions() function. Therefore, when removing the input actions not all handles were removed. As a result when you grab the right weapon first, release the weapon and then grab the left weapon then a handle is still present for the right weapon and when you try to shoot this handle will call the ServerShootRight() function. This function calls the GetHeldByHand() function which uses the MotionControllerRef to determine by which hand the pistol is held. However, the MotionControllerRef is set to a nullptr when you dropped the right weapon and therefore the program crashed. To mitigate such errors you can opt to clear all bindings for the pistol object. The code snippet for this is placed in comment in the RemovePistolInputActions() function.

Another issue that I ran into was that if a CustomPistol was duplicated inside the Unreal Editor then for some reason you could not shoot with the duplicated pistol (i.e. no projectiles were spawned). It turned out that this was related to the OnGrabbed delegate. Calling the AddDynamic() function in the BeginPlay() function instead of the constructor seemed to fix the issue. I came accros the solution [here](https://forums.unrealengine.com/t/adddynamic-not-working/299247/13).

### Update The Blueprint Code
So far we have created a C++ networked pistol. However, if we use this weapon to replace the Blueprint version and you try to grab our CustomPistol then you will notice that nothing happens. Why is that? Well, when we try to grab an object only objects which have a grab component of the class GrabComponent are taken in consideration. A correct approach would be to create a GrabComponent base class and make the CustomGrabComponent and the Blueprint GrabComponent derived classes from this base class. However, for now I will just replace the Blueprint GrabComponent references by CustomGrabComponent. To do this set ComponentClass parameter of the GetComponentsByClass function in the GetGrabComponentNearMotionController function of the VRPawn class to CustomGrabComponent.

<div align="center">
    <img src="/assets/images/NetworkedPistolC++/UpdateTheBlueprintCode/ChangeComponentClass.png" alt="Blueprint code of the GetGrabComponentNearMotionController function of the VRPawn class where the ComponentClass argument of the GetComponentsByClass function is changed to CustomGrabComponent" title="Change component class">
</div>

If we compile the Blueprint code we will get errors that CustomGrabComponent is not compatible with GrabComponent. Resolve all errors one by one. This includes updating all references to GrabComponent in the GetGrabComponentNearMotionController function and the VRPawn event graph.

When you have fixed all the errors and run the project you will notice that the pistols don't snap to you hand as they used to. This is because the GrabType is set to Free by default and since the original GrabComponent Blueprint didn't have a SetGrabType() function I didn't implement this in C++. Therefore, the GrabType need to be set in the Unreal Editor. You can do this by clicking on the pistol in your level and search for GrabType in the details panel and set it to Snap.

Another thing you may have observed is that the collision profile name is set to PhysicsActor for the SkeletalMeshGun in the CustomPistol constructor. However, in the CustomGrabComponent BeginPlay() function this is done again and in the case of the pistol the SkeletalMeshGun is the parent of the CustomGrabComponent so the collision profile name is set again to PhysicsActor. As a result I thought I could remove the SetCollisionProfileName call in the CustomPistol constructor. However, when I did this then the function call to IsAnySimulatingPhysics() in the SetShouldSimulateOnDrop() function returned false although the SetSimulatePhysics(true) is called for the SkeletalMeshGun in the CustomPistol constructor.

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

The reason is that the Bodies array is empty. However, if we set the collision profile name to PhysicsActor for the SkeletalMeshGun in the CustomPistol constructor then the Bodies array is not empty. At the moment I don't know exactly why this happens. So if you know this please reach out.

## Grabbable Small Cube
Since, we are know only looking for the CustomGrabComponent to grab objects the grabbable small cubes are no longer grabbable. To resolve this we can replace the GrabComponent of the Grabbable_SmallCube to CustomGrabComponent. Or we can duplicate the Grabbable_SmallCube and replace the GrabComponent with CustomGrabComponent in the duplicated version. The cubes in the VRTemplate level can then be replaced with the duplicated version. To do this follow these steps:
1. Duplicate the Grabbable_SmallCube Blueprint and rename it to Custom_Grabbable_SmallCube.
2. Add the CustomGrab as a component and rename it to CustomGrabComponent.
3. Set the scale of the CustomGrabComponentSnap to the same as GrabComponent.
4. Delete the GrabComponent.
5. Compile the Custom_Grabbable_SmallCube Blueprint class.
6. Select all instances of the Grabbable_SmallCube in the Outliner on the right-hand side of the VRTemplateMap. Right-click on the selected items > Replace Selected Actors with > Custom_Grabbable_SmallCube. If the [scale values](https://forums.unrealengine.com/t/replace-selected-actor-does-not-apply-scale-values/1902492) are not applied correctly then you need to replace the actors manually.

The Cube_FireLogs and the SM_Ball_01 also have a grab component but don't have a Blueprint class. If you want to be able to grab those than select them in the Outliner of the VRTemplateMap and replace the GrabComponent with a CustomGrabComponent in their respective details panels.