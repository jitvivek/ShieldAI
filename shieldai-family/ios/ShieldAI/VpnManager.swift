import Foundation
import NetworkExtension

class VpnManager {
    static let shared = VpnManager()
    
    func setupFilterConfiguration(completion: @escaping (Bool) -> Void) {
        NEFilterManager.shared().loadFromPreferences { error in
            if let error = error {
                print("ShieldAI: Failed to load filter config: \(error)")
                completion(false)
                return
            }
            let config = NEFilterManager.shared()
            config.localizedDescription = "ShieldAI Content Filter"
            config.isEnabled = true
            config.saveToPreferences { error in
                completion(error == nil)
            }
        }
    }
    
    func isFilterActive() -> Bool {
        return NEFilterManager.shared().isEnabled
    }
    
    func disableFilter(completion: @escaping (Bool) -> Void) {
        NEFilterManager.shared().loadFromPreferences { error in
            NEFilterManager.shared().isEnabled = false
            NEFilterManager.shared().saveToPreferences { error in
                completion(error == nil)
            }
        }
    }
}
