import { LazyStore } from '@tauri-apps/plugin-store'

export class LocalStore {
    private static instance: LazyStore = new LazyStore("rh-chat.json"); 

    public static async setValue<T>(key: string, value: T) {
        await LocalStore.instance.set(key, value);
    }
    public static async getValue<T>(key:string){
        return await LocalStore.instance.get<T>(key);
    }
    public static async deleteValue(key:string){
        await LocalStore.instance.delete(key);
    }
    public static async save(){
        await LocalStore.instance.save();
    }
}