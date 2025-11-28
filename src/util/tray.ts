import { image } from "@tauri-apps/api"
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from "@tauri-apps/api/menu";
import { TrayIcon } from "@tauri-apps/api/tray";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { exit, relaunch } from "@tauri-apps/plugin-process";
import { Http } from "./http";
import { API } from '../assets/default.json';
import { Notification } from "./notification";

export const createTray = async () => {
    let icon : image.Image;
    const defaultIcon = await defaultWindowIcon();
    if (defaultIcon === null||defaultIcon === undefined) {
        icon = await image.Image.fromPath("../assets/vue.svg");
    } else {
        icon = defaultIcon;
    }
    return await TrayIcon.new({
        icon:icon,
        tooltip:"RH-Chat",
        showMenuOnLeftClick:false,
        action: async (event) =>{
            if(event.type === "Click"){
                await showMainWindow();
            }
        },
        menu:await Menu.new({
            items:[
                {
                    id:"showMainWindow",
                    text:"显示主窗口",
                    action:async () =>{
                        await showMainWindow();
                    } 
                },
                {
                    id:"Restart",
                    text:"重启应用",
                    action:async () =>{
                        await relaunch();
                    }
                },
                {
                    id:"Exit",
                    text:"退出",
                    action:async () =>{
                        try{
                            let response = await Http.HttpInstance().request({
                            method:"GET",
                            url:API.LOGOUT,
                        });
                        const data = await response.json();
                        if(data.code !== 200){
                            throw new Error(data.message);
                        }
                        Notification.sendNotification(
                            {
                                icon:Notification.SUCCESS,
                                body:data.message,
                            }
                        );
                        }catch(error:any){
                            Notification.sendNotification({
                                icon:Notification.ERROR,
                                body:error.message || String(error),
                            });
                        } finally{
                            await exit(0);
                        }
                    }    
                }
            ]
        })
    })
}

async function showMainWindow(){
    const mainWindow = await getCurrentWindow();
    if(!(await mainWindow.isVisible())){
        await mainWindow.show();
    } else {
        if((await mainWindow.isMinimized())){
            await mainWindow.unminimize();
        }
    }
    await mainWindow.setFocus();
}