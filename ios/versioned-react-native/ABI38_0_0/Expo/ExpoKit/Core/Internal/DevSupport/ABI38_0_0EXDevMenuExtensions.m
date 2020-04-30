// Copyright 2015-present 650 Industries. All rights reserved.

#import "ABI38_0_0EXDevMenuExtensions.h"

@implementation ABI38_0_0EXDevMenuExtensions

+ (NSString *)moduleName
{
  return @"ExpoDevMenuExtensions";
}

- (NSArray<DevMenuItem *> *)devMenuItems
{
  DevMenuAction *reload = [[DevMenuAction alloc] initWithId:@"reload" action:^{
    [EXKernel.sharedInstance reloadVisibleApp];
  }];
  reload.label = ^NSString * { return @"Reload Expo project"; };
  reload.glyphName = ^NSString * { return @"reload"; };
  reload.importance = DevMenuItemImportanceHighest;
  [reload registerKeyCommandWithInput:@"r" modifiers:UIKeyModifierCommand];

  DevMenuAction *copyToClipboard = [[DevMenuAction alloc] initWithId:@"clipboard" action:^{
    [EXKernel.sharedInstance copyManifestUrlToClipboard];
  }];
  copyToClipboard.label = ^NSString * { return @"Copy link to clipboard"; };
  copyToClipboard.glyphName = ^NSString * { return @"clipboard-text"; };
  copyToClipboard.importance = DevMenuItemImportanceLowest;

  DevMenuAction *goToHome = [[DevMenuAction alloc] initWithId:@"home" action:^{
    dispatch_async(dispatch_get_main_queue(), ^{
      [EXKernel.sharedInstance.browserController moveHomeToVisible];
    });
  }];
  goToHome.label = ^NSString * { return @"Go to Home"; };
  goToHome.glyphName = ^NSString * { return @"home"; };
  goToHome.importance = DevMenuItemImportanceHigh;
  [goToHome registerKeyCommandWithInput:@"h" modifiers:UIKeyModifierCommand | UIKeyModifierControl];

  return @[reload, copyToClipboard, goToHome];
}

@end
