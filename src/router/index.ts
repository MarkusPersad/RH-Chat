import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history:createWebHashHistory(),
    routes:[
        {
            path:"/",
            component:()=>import("../page/login.vue")
        },
        {
            path:"/home",
            component:()=>import("../page/home.vue"),
            children:[]
        }
    ]
})

export {router}