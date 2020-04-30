// Copyright 2015-present 650 Industries. All rights reserved.

import EXDevMenu

@objc(EXDevMenuExtensions)
open class EXDevMenuExtensions: NSObject, RCTBridgeModule, DevMenuExtensionProtocol {
  // MARK: RCTBridgeModule

  @objc
  public static func moduleName() -> String! {
    return "ExpoDevMenuExtensions"
  }

  @objc
  open var bridge: RCTBridge?

  // MARK: DevMenuExtensionProtocol

  @objc
  open func devMenuItems() -> [DevMenuItem]? {
    guard let devSettings = bridge?.module(forName: "DevSettings") as? RCTDevSettings else {
      return nil
    }

    let reload = DevMenuAction(withId: "reload") {
      EXKernel.sharedInstance().reloadVisibleApp()
    }
    reload.label = { "Reload" }
    reload.glyphName = { "reload" }
    reload.importance = DevMenuItem.ImportanceHighest
    reload.registerKeyCommand(input: "r", modifiers: .command)

    let copyToClipboard = DevMenuAction(withId: "copy-to-clipboard") {
      EXKernel.sharedInstance().copyManifestUrlToClipboard()
    }
    copyToClipboard.label = { "Copy link to clipboard" }
    copyToClipboard.glyphName = { "clipboard-text" }
    copyToClipboard.importance = DevMenuItem.ImportanceLowest

    let goToHome = DevMenuAction(withId: "go-to-home") {
      DispatchQueue.main.async {
        EXKernel.sharedInstance().browserController.moveHomeToVisible()
      }
    }
    goToHome.label = { "Go to Home" }
    goToHome.glyphName = { "home" }
    goToHome.importance = DevMenuItem.ImportanceHigh
    goToHome.registerKeyCommand(input: "h", modifiers: [.command, .control])

    let inspector = DevMenuAction(withId: "dev-inspector") {
      devSettings.toggleElementInspector()
    }
    inspector.isEnabled = { devSettings.isElementInspectorShown }
    inspector.label = { inspector.isEnabled() ? "Hide Element Inspector" : "Show Element Inspector" }
    inspector.glyphName = { "border-style" }
    inspector.importance = DevMenuItem.ImportanceHigh
    inspector.registerKeyCommand(input: "i", modifiers: .command)

    let remoteDebug = DevMenuAction(withId: "dev-remote-debug") {
      devSettings.isDebuggingRemotely = !devSettings.isDebuggingRemotely
    }
    remoteDebug.isAvailable = { devSettings.isRemoteDebuggingAvailable }
    remoteDebug.isEnabled = { devSettings.isDebuggingRemotely }
    remoteDebug.label = { remoteDebug.isAvailable() ? remoteDebug.isEnabled() ? "Stop Remote Debugging" : "Debug Remote JS" : "Remote Debugger Unavailable" }
    remoteDebug.glyphName = { "remote-desktop" }
    remoteDebug.importance = DevMenuItem.ImportanceLow

    let fastRefresh = DevMenuAction(withId: "dev-fast-refresh") {
      devSettings.isHotLoadingEnabled = !devSettings.isHotLoadingEnabled
    }
    fastRefresh.isAvailable = { devSettings.isHotLoadingAvailable }
    fastRefresh.isEnabled = { devSettings.isHotLoadingEnabled }
    fastRefresh.label = { fastRefresh.isAvailable() ? fastRefresh.isEnabled() ? "Disable Fast Refresh" : "Enable Fast Refresh" : "Fast Refresh Unavailable" }
    fastRefresh.glyphName = { "run-fast" }
    fastRefresh.importance = DevMenuItem.ImportanceLow

    let perfMonitor = DevMenuAction(withId: "dev-perf-monitor") {
      if let perfMonitorModule = self.bridge?.module(forName: "PerfMonitor") as? RCTPerfMonitor {
        DispatchQueue.main.async {
          devSettings.isPerfMonitorShown ? perfMonitorModule.hide() : perfMonitorModule.show()
          devSettings.isPerfMonitorShown = !devSettings.isPerfMonitorShown
        }
      }
    }
    perfMonitor.isAvailable = { self.bridge?.module(forName: "PerfMonitor") != nil }
    perfMonitor.isEnabled = { devSettings.isPerfMonitorShown }
    perfMonitor.label = { perfMonitor.isAvailable() ? perfMonitor.isEnabled() ? "Hide Performance Monitor" : "Show Performance Monitor" : "Performance Monitor Unavailable" }
    perfMonitor.glyphName = { "speedometer" }
    perfMonitor.importance = DevMenuItem.ImportanceHigh
    perfMonitor.registerKeyCommand(input: "p", modifiers: .command)

    return [
      reload,
      copyToClipboard,
      goToHome,
      inspector,
      remoteDebug,
      fastRefresh,
      perfMonitor
    ]
  }
}
