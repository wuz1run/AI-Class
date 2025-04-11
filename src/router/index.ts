import { useMainStore } from "../stores";
import pinia from "../stores/createPinia";
import { storeToRefs } from "pinia";
import { createRouter,createWebHistory } from "vue-router";
import {navItems, UserRole} from '../stores/navConfig';
import { studentQuizView,quizView,login, register, findPassword, changePassword, AIChat, home, userInfo, myResources, lessonPreparationMaterials, classManagement,quizRelease,studentHome,studentTestView } from "../views"
const routes = [
    {
        path: "/login",
        component: login
    },
    {

        path: "/register",
        component: register
    },
    {
        path: "/login/findPassword",
        component: findPassword
    },
    {
        path: "/user/changePassword",
        component: changePassword
    },
    {
        path: "/chat",
        component: AIChat
    },
    {
        path: "/home",
        component: home
    },
    {
        path: "/userInfo",
        component: userInfo
    },
    {
        path: "/myResources",
        component: myResources,
    },
    {
        path: "/lessonPreparationMaterials",
        component: lessonPreparationMaterials,
    },
    {
        path: "/classManagement",
        component: classManagement,
    },
    {
        path: "/quizRelease",
        component: quizRelease,
    },
    {
        path:"/quizView",
        component: quizView,
    },
    {
        path: "/student",
        component: studentHome
    },
    {
        path: "/",
        component: home
    },
    {
        path: "/studentQuizView",
        component: studentQuizView
    },
    {
        path: "/studentTestView/:id",
        name: "studentTestView",
        component: studentTestView
    }

]

const router = createRouter({
    history:createWebHistory(),
    routes:routes
})

router.beforeEach((to) => {
    const userStore = useMainStore().userInfoStore()
    const loginStore = useMainStore().loginStore()
    const requiredAuth = navItems.find(item => item.path === to.path)?.requireAuth

    // 需要登录但未登录
    if (requiredAuth && !loginStore.loginSession) {
        return '/login'
    }

    // 角色验证
    const routeConfig = navItems.find(item => item.path === to.path)
    if (routeConfig) {
        const userRole = userStore.userInfo.character as UserRole || 'student'
        const hasPermission = routeConfig.roles.includes('*') ||
            routeConfig.roles.includes(userRole)

        if (!hasPermission) {
            return '/unauthorized' // 添加无权限页面
        }
    }
})

export default router;