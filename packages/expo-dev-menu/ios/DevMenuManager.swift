// Copyright 2015-present 650 Industries. All rights reserved.

class Dispatch {
  static func mainSync<T>(_ closure: () -> T) -> T {
    if Thread.isMainThread {
      return closure()
    } else {
      var result: T?
      DispatchQueue.main.sync {
        result = closure()
      }
      return result!
    }
  }
}

/**
 A container for dev menu items array.
 NSMapTable requires the second generic type to be a class, so `[DevMenuItem]` is not allowed.
 */
class DevMenuItemsContainer {
  fileprivate let items: [DevMenuItem]

  fileprivate init(items: [DevMenuItem]) {
    self.items = items
  }
}

/**
 A hash map storing an array of dev menu items for specific extension.
 */
private let extensionToDevMenuItemsMap = NSMapTable<DevMenuExtensionProtocol, DevMenuItemsContainer>.weakToStrongObjects()

/**
 Manages the dev menu and provides most of the public API.
 */
@objc
open class DevMenuManager: NSObject {
  /**
   Shared singleton instance.
   */
  @objc
  static public let shared = DevMenuManager()

  /**
   User defaults key used to store bool value whether the user finished onboarding.
   */
  static private let IsOnboardingFinishedUserDefaultsKey = "IsOnboardingFinishedUserDefaultsKey"

  /**
   Returns `true` only if the user finished onboarding, `false` otherwise.
   */
  @objc
  static var isOnboardingFinished: Bool {
    get {
      return UserDefaults.standard.bool(forKey: IsOnboardingFinishedUserDefaultsKey)
    }
    set {
      UserDefaults.standard.set(newValue, forKey: IsOnboardingFinishedUserDefaultsKey)
    }
  }

  /**
   Returns bool value whether the dev menu shake gestures are being intercepted.
   */
  @objc
  static public var interceptsMotionGestures: Bool {
    get {
      return DevMenuMotionInterceptor.isInstalled
    }
    set {
      DevMenuMotionInterceptor.isInstalled = newValue
    }
  }

  /**
   Returns bool value whether the dev menu touch gestures are being intercepted.
   */
  @objc
  static public var interceptsTouchGestures: Bool {
    get {
      return DevMenuTouchInterceptor.isInstalled
    }
    set {
      DevMenuTouchInterceptor.isInstalled = newValue
    }
  }

  /**
   Returns bool value whether the dev menu key commands are being intercepted.
   */
  @objc
  static public var interceptsKeyCommands: Bool {
    get {
      return DevMenuKeyCommandsInterceptor.isInstalled
    }
    set {
      DevMenuKeyCommandsInterceptor.isInstalled = newValue
    }
  }

  /**
   The window that controls and displays the dev menu view.
   */
  var window: DevMenuWindow?

  /**
   `DevMenuAppInstance` instance that is responsible for initializing and managing React Native context for the dev menu.
   */
  var appInstance: DevMenuAppInstance?

  /**
   The delegate of `DevMenuManager` implementing `DevMenuDelegateProtocol`.
   */
  @objc
  public var delegate: DevMenuDelegateProtocol?

  override init() {
    super.init()
    self.window = DevMenuWindow(manager: self)
    self.appInstance = DevMenuAppInstance(manager: self)

    initializeInterceptors()
  }

  /**
   Whether the dev menu window is visible on the device screen.
   */
  @objc
  public var isVisible: Bool {
    return Dispatch.mainSync { !(window?.isHidden ?? true) }
  }

  /**
   Opens up the dev menu.
   */
  @objc
  @discardableResult
  public func openMenu() -> Bool {
    return setVisibility(true)
  }

  /**
   Sends an event to JS to start collapsing the dev menu bottom sheet.
   */
  @objc
  @discardableResult
  public func closeMenu() -> Bool {
    guard let appInstance = appInstance else {
      return false
    }
    appInstance.sendCloseEvent()
    return true
  }

  /**
   Forces the dev menu to hide. Called by JS once collapsing the bottom sheet finishes.
   */
  @objc
  @discardableResult
  public func hideMenu() -> Bool {
    return setVisibility(false)
  }

  /**
   Toggles the visibility of the dev menu.
   */
  @objc
  @discardableResult
  public func toggleMenu() -> Bool {
    return isVisible ? closeMenu() : openMenu()
  }

  // MARK: internals

  func dispatchAction(withId actionId: String) {
    guard let extensions = extensions else {
      return
    }
    for ext in extensions {
      guard let devMenuItems = loadDevMenuItems(forExtension: ext) else {
        continue
      }
      for item in devMenuItems {
        if let action = item as? DevMenuAction, action.actionId == actionId {
          if delegate?.devMenuManager?(self, willDispatchAction: action) ?? true {
            action.action()
          }
          return
        }
      }
    }
  }

  /**
   Returns a dictionary of additional app info or nil if not available.
   */
  func currentAppInfo() -> [String : Any]? {
    var appInfo = delegate?.appInfo?(forDevMenuManager: self) ?? [:]

    if let infoDictionary = Bundle.main.infoDictionary {
      if appInfo["appName"] == nil {
        appInfo["appName"] = infoDictionary["CFBundleDisplayName"] ?? infoDictionary["CFBundleExecutable"]
      }
      if appInfo["appVersion"] == nil {
        appInfo["appVersion"] = infoDictionary["CFBundleVersion"]
      }
      if appInfo["appIcon"] == nil {
        appInfo["appIcon"] = DevMenuManager.self.createLocalUrl(forImageNamed: "AppIcon")
      }
    }
    if let appBridge = delegate?.appBridge?(forDevMenuManager: self) {
      if appInfo["packagerUrl"] == nil {
        appInfo["packagerUrl"] = appBridge.bundleURL?.absoluteString
      }
    }
    return appInfo
  }

  static func createLocalUrl(forImageNamed name: String) -> URL? {

      let fileManager = FileManager.default
      let cacheDirectory = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)[0]
      let url = cacheDirectory.appendingPathComponent("\(name).png")
      let path = url.path

      guard fileManager.fileExists(atPath: path) else {
          guard
              let image = UIImage(named: name),
            let data = image.pngData()
              else { return nil }

          fileManager.createFile(atPath: path, contents: data, attributes: nil)
          return url
      }

      return url
  }

  /**
   Returns an array of modules conforming to `DevMenuExtensionProtocol`.
   Bridge may register multiple modules with the same name – in this case it returns only the one that overrides the others.
   */
  var extensions: [DevMenuExtensionProtocol]? {
    guard let appBridge = delegate?.appBridge?(forDevMenuManager: self) else {
      debugPrint("DevMenuManager: Dev menu delegate is unset or application bridge is not available.")
      return nil
    }
    let allExtensions = appBridge.modulesConforming(toProtocol: DevMenuExtensionProtocol.self) as! [DevMenuExtensionProtocol]
    let uniqueExtensionNames: [String] = Array(Set(allExtensions.map({ type(of: $0).moduleName() })))

    return uniqueExtensionNames
      .map({ appBridge.module(forName: stripRCT($0)) })
      .filter({ $0 is DevMenuExtensionProtocol }) as! [DevMenuExtensionProtocol]
  }

  /**
   Gathers `DevMenuItem`s from all dev menu extensions and returns them as an array.
   */
  var devMenuItems: [DevMenuItem] {
    var items: [DevMenuItem] = []

    extensions?.forEach({ ext in
      if let extensionItems = loadDevMenuItems(forExtension: ext) {
        items.append(contentsOf: extensionItems)
      }
    })
    return items.sorted { $0.importance > $1.importance }
  }

  /**
   Returns an array of `DevMenuAction`s returned by the dev menu extensions.
   */
  var devMenuActions: [DevMenuAction] {
    return devMenuItems.filter { $0 is DevMenuAction } as! [DevMenuAction]
  }

  /**
   Returns an array of dev menu items serialized to the dictionary.
   */
  func serializedDevMenuItems() -> [[String : Any]] {
    return devMenuItems.map({ $0.serialize() })
  }

  // MARK: delegate stubs

  func canChangeVisibility(to visible: Bool) -> Bool {
    if isVisible == visible {
      return false
    }
    return delegate?.devMenuManager?(self, canChangeVisibility: visible) ?? true
  }

  /**
   Returns bool value whether the onboarding view should be displayed by the dev menu view.
   */
  func shouldShowOnboarding() -> Bool {
    return delegate?.shouldShowOnboarding?(manager: self) ?? !DevMenuManager.self.isOnboardingFinished
  }

  @available(iOS 12.0, *)
  var userInterfaceStyle: UIUserInterfaceStyle {
    return delegate?.userInterfaceStyle?(forDevMenuManager: self) ?? UIUserInterfaceStyle.unspecified
  }

  // MARK: private

  private func initializeInterceptors() {
    DevMenuMotionInterceptor.initialize()
    DevMenuTouchInterceptor.initialize()
    DevMenuKeyCommandsInterceptor.initialize()
  }

  private func loadDevMenuItems(forExtension ext: DevMenuExtensionProtocol) -> [DevMenuItem]? {
    if let itemsContainer = extensionToDevMenuItemsMap.object(forKey: ext) {
      return itemsContainer.items
    }
    if let items = ext.devMenuItems?() {
      let container = DevMenuItemsContainer(items: items)
      extensionToDevMenuItemsMap.setObject(container, forKey: ext)
      return items
    }
    return nil
  }

  private func setVisibility(_ visible: Bool) -> Bool {
    if !canChangeVisibility(to: visible) {
      return false
    }
    DispatchQueue.main.async {
      if visible {
        self.window?.makeKeyAndVisible()
      } else {
        self.window?.isHidden = true;
      }
    }
    return true
  }
}

func stripRCT(_ str: String) -> String {
  return str.starts(with: "RCT") ? String(str.dropFirst(3)) : str
}
