use detect_desktop_environment::DesktopEnvironment;
use tauri::command;

#[command]
pub fn get_desktop_environment() -> String {
    if let Some(desktop) = DesktopEnvironment::detect() {
        match desktop {
            DesktopEnvironment::Kde => "kde".to_string(),
            DesktopEnvironment::Gnome => "gnome".to_string(),
            DesktopEnvironment::Mate => "mate".to_string(),
            DesktopEnvironment::Xfce => "xfce".to_string(),
            DesktopEnvironment::Cinnamon => "cinnamon".to_string(),
            DesktopEnvironment::Unity => "unity".to_string(),
            DesktopEnvironment::Cosmic => "cosmic".to_string(),
            DesktopEnvironment::CosmicEpoch => "CosmicEpoch".to_string(),
            DesktopEnvironment::Lxde => "lxde".to_string(),
            DesktopEnvironment::Lxqt => "lxqt".to_string(),
            DesktopEnvironment::Enlightenment => "enlightenment".to_string(),
            DesktopEnvironment::Dde => "dde".to_string(),
            DesktopEnvironment::Hyprland => "hyprland".to_string(),
            DesktopEnvironment::Tde => "tde".to_string(),
            DesktopEnvironment::Sway => "sway".to_string(),
            DesktopEnvironment::Rox => "rox".to_string(),
            DesktopEnvironment::Razor => "razor".to_string(),
            DesktopEnvironment::Pantheon => "pantheon".to_string(),
            DesktopEnvironment::Old => "old".to_string(),
            DesktopEnvironment::Ede => "ede".to_string(),
            DesktopEnvironment::Endless => "endless".to_string(),
            _ => "unknown".to_string(),
        }
    } else {
        "unknown".to_string()
    }
}
