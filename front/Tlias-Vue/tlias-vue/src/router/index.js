import { createRouter, createWebHistory } from 'vue-router'

import IndexView from '@/views/index/index.vue'
import ClazzView from '@/views/clazz/index.vue'
import DeptView from '@/views/dept/index.vue'
import EmpView from '@/views/emp/index.vue'
import LogView from '@/views/log/index.vue'
import StuView from '@/views/stu/index.vue'
import EmpReportView from '@/views/report/emp/index.vue'
import StuReportView from '@/views/report/stu/index.vue'
import LayoutView from '@/views/layout/index.vue'
import LoginView from '@/views/login/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
     path: '/',       //layout组件和login组件同级，会匹配到App.vue下
     name: '',
     component: LayoutView,
     redirect: '/index', //重定向
     children: [      //嵌套子体，会嵌入到Layout内的router-view下
      {path: 'index', name: 'index', component: IndexView},
      {path: 'clazz', name: 'clazz', component: ClazzView},
      {path: 'stu', name: 'stu', component: StuView},
      {path: 'dept', name: 'dept', component: DeptView},
      {path: 'emp', name: 'emp', component: EmpView},
      {path: 'log', name: 'log', component: LogView},
      {path: 'empReport', name: 'empReport', component: EmpReportView},
      {path: 'stuReport', name: 'stuReport', component: StuReportView}
     ]
    },
    // 这个放在外面是因为login不能放入在layout内部显示，要单独显示
    {path: '/login', name: 'login', component: LoginView}
  ]
})

export default router


//嵌套路由：https://router.vuejs.org/zh/guide/essentials/nested-routes.html

// const routes = [
//   {
//     path: '/user/:id',
//     component: User,       嵌套母体
//     children: [            嵌套子体
//       {
//         // 当 /user/:id/profile 匹配成功
//         // UserProfile 将被渲染到 User 的 <router-view> 内部
//         path: 'profile',
//         component: UserProfile,
//       },
//       {
//         // 当 /user/:id/posts 匹配成功
//         // UserPosts 将被渲染到 User 的 <router-view> 内部
//         path: 'posts',
//         component: UserPosts,
//       },
//     ],
//   },
// ]