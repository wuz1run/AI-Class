import { useMainStore } from "../stores";
import pinia from "../stores/createPinia";
import { storeToRefs } from "pinia";
import { createRouter,createWebHistory } from "vue-router";
import {navItems, UserRole} from '../stores/navConfig';
import { studentQuizView,quizView,login, register, findPassword, changePassword, AIChat, home, userInfo, myResources, lessonPreparationMaterials, classManagement,quizRelease,studentHome,studentTestView ,studyAnalyse} from "../views"
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
        component: login
    },
    {
        path: "/studentQuizView",
        component: studentQuizView
    },
    {
        path: "/studentTestView/:id",
        name: "studentTestView",
        component: studentTestView
    },
    {
        path: "/studyAnalyse",
        component: studyAnalyse
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

    // 首页重定向逻辑
    if (to.path === '/') {
        if (!loginStore.loginSession) {
            return '/login'
        } else {
            const role = userStore.userInfo.character as UserRole || 'student'
            if (role === 'student') {
                return '/studentQuizView'
            } else if (role === 'teacher') {
                return '/chat'
            } else {
                return '/home' // 默认跳转（可按需修改）
            }
        }
    }

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
            return '/unauthorized'
        }
    }
})


export default router;