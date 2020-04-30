// Copyright 2015-present 650 Industries. All rights reserved.

import UIKit

class DevMenuKeyCommandsInterceptor {
  /**
   User defaults key under which the current state is saved.
   */
  static let userDefaultsKey = "EXDevMenuKeyCommandsEnabled"

  /**
   Returns bool value whether touch interceptor is currently installed.
   */
  static var isInstalled: Bool = false {
    willSet {
      if isInstalled != newValue {
        // Capture touch gesture from any window by swizzling default implementation from UIWindow.
        swizzle()

        // Update value in user defaults.
        UserDefaults.standard.set(newValue, forKey: userDefaultsKey)
      }
    }
  }

  static func initialize() {
    UserDefaults.standard.register(defaults: [
      userDefaultsKey : true
    ])
    isInstalled = UserDefaults.standard.bool(forKey: userDefaultsKey)
  }
  
  static private func swizzle() {
    DevMenuUtils.swizzle(
      selector: #selector(getter: UIResponder.keyCommands),
      withSelector: #selector(getter: UIResponder.EXDevMenu_keyCommands),
      forClass: UIResponder.self
    )
  }

  static let globalKeyCommands: [UIKeyCommand] = [
    UIKeyCommand(input: "d", modifierFlags: .command, action: #selector(UIResponder.EXDevMenu_toggleDevMenu(_:)))
  ]
}

/**
 Extend `UIResponder` so we can put our key commands to all responders.
 */
extension UIResponder {
  // NOTE: throttle the key handler because on iOS 9 the handleKeyCommand:
  // method gets called repeatedly if the command key is held down.
  static private var lastKeyCommandExecutionTime: TimeInterval = 0

  @objc
  var EXDevMenu_keyCommands: [UIKeyCommand] {
    let actionsWithKeyCommands = DevMenuManager.shared.devMenuActions.filter { $0.keyCommand != nil }
    var keyCommands = actionsWithKeyCommands.map { $0.keyCommand! }
    keyCommands.insert(contentsOf: DevMenuKeyCommandsInterceptor.globalKeyCommands, at: 0)
    keyCommands.append(contentsOf: self.EXDevMenu_keyCommands)
    return keyCommands
  }

  @objc
  func EXDevMenu_handleKeyCommand(_ key: UIKeyCommand) {
    if CACurrentMediaTime() - UIResponder.lastKeyCommandExecutionTime > 0.5 {
      let actions = DevMenuManager.shared.devMenuActions
      let action = actions.first { $0.keyCommand == key }

      action?.action()
      UIResponder.lastKeyCommandExecutionTime = CACurrentMediaTime()
    }
  }

  @objc
  func EXDevMenu_toggleDevMenu(_ key: UIKeyCommand) {
    DevMenuManager.shared.toggleMenu()
  }
}
