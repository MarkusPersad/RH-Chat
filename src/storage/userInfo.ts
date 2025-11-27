import { defineStore } from "pinia";
import { Ref, ref } from "vue";

interface UserInfo{
    userName:string;
    uuid:string;
}

export const useUserInfo = defineStore("userInfo",()=>{
    const currentUser:Ref<UserInfo | undefined> = ref();

    const setUserInfo = (userInfo:UserInfo)=>{
        currentUser.value = userInfo;
    }
    const getUserInfo = ()=>{
        return currentUser.value;
    }
    return{setUserInfo,getUserInfo}
})