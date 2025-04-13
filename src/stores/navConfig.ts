// 角色类型定义
export type UserRole = 'student' | 'teacher' | 'admin' | '*'

// 导航项类型
export interface NavItem {
    name: string
    path: string
    roles: UserRole[] // 允许访问的角色
    requireAuth?: boolean // 是否需要登录
}

export const navItems: NavItem[] = [
    {
        name: 'AI备课',
        path: '/chat',
        roles: ['teacher'],
        requireAuth: true
    },
    {
        name: '我的习题',
        path: '/quizView',
        roles: ['teacher', 'admin'],
        requireAuth: true
    },
    {
      name: '我的习题',
      path:'/studentQuizView',
      roles: ['student'],
      requireAuth: true
    },
    {
        name: '管理后台',
        path: '/admin',
        roles: ['admin'],
        requireAuth: true
    },
    {
        name: '发布习题',
        path: '/quizRelease',
        roles: ['teacher'],
        requireAuth: true
    },
    {
        name:"班级管理",
        path:"/classManagement",
        roles:["teacher"],
        requireAuth: true
    },
    {
        name:"智能学情分析页面",
        path:"/studyAnalyse",
        roles:["teacher"],
        requireAuth: true
    }


]