// Copyright 2015-present 650 Industries. All rights reserved.

#import <React/RCTEventDispatcher.h>

#import "EXEnvironment.h"
#import "EXHomeModule.h"
#import "EXSession.h"
#import "EXUnversioned.h"
#import "EXClientReleaseType.h"
#import "EXKernel.h"

#ifndef EX_DETACHED
@import EXDevMenu;
#endif

@interface EXHomeModule ()

@property (nonatomic, assign) BOOL hasListeners;
@property (nonatomic, strong) NSMutableDictionary *eventSuccessBlocks;
@property (nonatomic, strong) NSMutableDictionary *eventFailureBlocks;
@property (nonatomic, strong) NSArray * _Nonnull sdkVersions;
@property (nonatomic, weak) id<EXHomeModuleDelegate> delegate;

@end

@implementation EXHomeModule

+ (NSString *)moduleName { return @"ExponentKernel"; }

- (instancetype)initWithExperienceId:(NSString *)experienceId kernelServiceDelegate:(id)kernelServiceInstance params:(NSDictionary *)params
{
  if (self = [super initWithExperienceId:experienceId kernelServiceDelegate:kernelServiceInstance params:params]) {
    _eventSuccessBlocks = [NSMutableDictionary dictionary];
    _eventFailureBlocks = [NSMutableDictionary dictionary];
    _sdkVersions = params[@"constants"][@"supportedExpoSdks"];
    _delegate = kernelServiceInstance;
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (NSDictionary *)constantsToExport
{
  return @{ @"sdkVersions": _sdkVersions,
            @"IOSClientReleaseType": [EXClientReleaseType clientReleaseType] };
}

#pragma mark - RCTEventEmitter methods

- (NSArray<NSString *> *)supportedEvents
{
  return @[];
}

/**
 *  Override this method to avoid the [self supportedEvents] validation
 */
- (void)sendEventWithName:(NSString *)eventName body:(id)body
{
  // Note that this could be a versioned bridge!
  [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter.emit"
                        args:body ? @[eventName, body] : @[eventName]];
}

#pragma mark -

- (void)dispatchJSEvent:(NSString *)eventName body:(NSDictionary *)eventBody onSuccess:(void (^)(NSDictionary *))success onFailure:(void (^)(NSString *))failure
{
  NSString *qualifiedEventName = [NSString stringWithFormat:@"ExponentKernel.%@", eventName];
  NSMutableDictionary *qualifiedEventBody = (eventBody) ? [eventBody mutableCopy] : [NSMutableDictionary dictionary];
  
  if (success && failure) {
    NSString *eventId = [[NSUUID UUID] UUIDString];
    [_eventSuccessBlocks setObject:success forKey:eventId];
    [_eventFailureBlocks setObject:failure forKey:eventId];
    [qualifiedEventBody setObject:eventId forKey:@"eventId"];
  }
  
  [self sendEventWithName:qualifiedEventName body:qualifiedEventBody];
}

/**
 *  Duplicates Linking.openURL but does not validate that this is an exponent URL;
 *  in other words, we just take your word for it and never hand it off to iOS.
 *  Used by the home screen URL bar.
 */
RCT_EXPORT_METHOD(openURL:(NSURL *)URL
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(__unused RCTPromiseRejectBlock)reject)
{
  if (URL) {
    [_delegate homeModule:self didOpenUrl:URL.absoluteString];
    resolve(@YES);
  } else {
    NSError *err = [NSError errorWithDomain:EX_UNVERSIONED(@"EXKernelErrorDomain") code:-1 userInfo:@{ NSLocalizedDescriptionKey: @"Cannot open a nil url" }];
    reject(@"E_INVALID_URL", err.localizedDescription, err);
  }
}

RCT_REMAP_METHOD(getDevMenuSettingsAsync,
                 getDevMenuSettingsAsync:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
#ifndef EX_DETACHED
  resolve(@{
    @"motionGestureEnabled": @(DevMenuManager.interceptsMotionGestures),
    @"touchGestureEnabled": @(DevMenuManager.interceptsTouchGestures),
  });
#else
  resolve(@{});
#endif
}

RCT_REMAP_METHOD(setDevMenuSettingAsync,
                 setDevMenuSetting:(NSString *)key
                 withValue:(id)value
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
#ifndef EX_DETACHED
  if ([key isEqualToString:@"motionGestureEnabled"]) {
    DevMenuManager.interceptsMotionGestures = [value boolValue];
  } else if ([key isEqualToString:@"touchGestureEnabled"]) {
    DevMenuManager.interceptsTouchGestures = [value boolValue];
  } else {
    return reject(@"ERR_DEV_MENU_SETTING_NOT_EXISTS", @"Specified dev menu setting doesn't exist.", nil);
  }
#endif
  resolve(nil);
}

RCT_REMAP_METHOD(getSessionAsync,
                 getSessionAsync:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSDictionary *session = [[EXSession sharedInstance] session];
  resolve(session);
}

RCT_REMAP_METHOD(setSessionAsync,
                 setSessionAsync:(NSDictionary *)session
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSError *error;
  BOOL success = [[EXSession sharedInstance] saveSessionToKeychain:session error:&error];
  if (success) {
    resolve(nil);
  } else {
    reject(@"ERR_SESSION_NOT_SAVED", @"Could not save session", error);
  }
}

RCT_REMAP_METHOD(removeSessionAsync,
                 removeSessionAsync:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSError *error;
  BOOL success = [[EXSession sharedInstance] deleteSessionFromKeychainWithError:&error];
  if (success) {
    resolve(nil);
  } else {
    reject(@"ERR_SESSION_NOT_REMOVED", @"Could not remove session", error);
  }
}

/**
 * Called when the native event has succeeded on the JS side.
 */
RCT_REMAP_METHOD(onEventSuccess,
                 eventId:(NSString *)eventId
                 body:(NSDictionary *)body)
{
  void (^success)(NSDictionary *) = [_eventSuccessBlocks objectForKey:eventId];
  if (success) {
    success(body);
    [_eventSuccessBlocks removeObjectForKey:eventId];
    [_eventFailureBlocks removeObjectForKey:eventId];
  }
}

/**
 * Called when the native event has failed on the JS side.
 */
RCT_REMAP_METHOD(onEventFailure,
                 eventId:(NSString *)eventId
                 message:(NSString *)message)
{
  void (^failure)(NSString *) = [_eventFailureBlocks objectForKey:eventId];
  if (failure) {
    failure(message);
    [_eventSuccessBlocks removeObjectForKey:eventId];
    [_eventFailureBlocks removeObjectForKey:eventId];
  }
}

@end
