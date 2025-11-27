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
            children:[
                {
                    path:"",
                    component:()=>import("../page/home/chat.vue")
                },
                {
                    path:"people",
                    component:() => import("../page/home/People.vue")
                }
            ]
        }
    ]
})

export {router}