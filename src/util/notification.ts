import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification"
import { platform } from "@tauri-apps/plugin-os";
import { invoke } from '@tauri-apps/api/core';
import { Command } from '@tauri-apps/plugin-shell';

export class Notification{
    private static readonly CURRENT_PLATFORM : string = platform() ;
    public static SUCCESS: string
    public static WARNING: string
    public static ERROR: string
    public static INFO: string
    static {
        Notification.SUCCESS = Notification.CURRENT_PLATFORM === 'linux' ? 'dialog-ok':'assets/sucess.png';
        Notification.WARNING = Notification.CURRENT_PLATFORM === 'linux' ? 'dialog-warning':'assets/warning.png';
        Notification.ERROR = Notification.CURRENT_PLATFORM === 'linux' ? 'dialog-error':'assets/error.png';
        Notification.INFO = Notification.CURRENT_PLATFORM === 'linux' ? 'dialog-information':'assets/info.png';
    }
    public static async sendNotification(content : {
        icon: typeof Notification.SUCCESS | typeof Notification.WARNING | typeof Notification.ERROR | typeof Notification.INFO,
        body: any,
    }){
        const desktopEnv: string = await invoke('get_desktop_environment');
        if(desktopEnv === 'gnome'){
            await Command.create('notify-send', [
                '-u',
                'critical',
                '-i',
                content.icon,
                'RH-Chat',
                content.body
            ]).execute();
        }else {
            let permissionGranted = await isPermissionGranted();
            if(!permissionGranted){
                const permission = await requestPermission();
                permissionGranted = permission === "granted";
            }
            if(permissionGranted){
                sendNotification({
                    title: "RH-Chat",
                    icon: content.icon,
                    body:content.body,
                })
            }
        }
    }
}