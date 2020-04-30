// Copyright 2015-present 650 Industries. All rights reserved.

#import "EXAppLoader.h"
#import "EXEnvironment.h"
#import "EXFileDownloader.h"
#import "EXHomeModuleManager.h"
#import "EXManifestResource.h"
#import "EXKernel.h"
#import "EXKernelLinkingManager.h"
#import "EXReactAppManager.h"

@implementation EXHomeModuleManager

// TODO: (@tsapeta) Move all of those dev menu methods out of here and make them independent of the kernel.

- (BOOL)homeModuleShouldEnableDevtools:(__unused EXHomeModule *)module
{
  EXKernelAppRecord *visibleApp = [EXKernel sharedInstance].visibleApp;
  return (
    visibleApp != [EXKernel sharedInstance].appRegistry.homeAppRecord &&
    [visibleApp.appManager enablesDeveloperTools]
  );
  return NO;
}

- (void)homeModule:(__unused EXHomeModule *)module didOpenUrl:(NSString *)url
{
  [[EXKernel sharedInstance].serviceRegistry.linkingManager openUrl:url isUniversalLink:NO];
}

@end
