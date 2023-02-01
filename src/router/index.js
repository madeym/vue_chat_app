import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginPage from '../views/LoginPage/LoginPage.vue'
import RegisterPage from '../views/RegisterPage/RegisterPage.vue'
import ChatPage from '../views/ChatPage/ChatPage.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: {auth: false},
    },{
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: {auth: false}
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatPage,
      meta: {auth: true}
    }
  ]
})

router.beforeEach((to, from, next) => {
  var isAuth = localStorage.getItem('isAuth');
  console.log(isAuth);
  if (to.meta.auth && isAuth) {
    next();
  }else if (to.meta.auth && !isAuth) {
    next('/login');
  }else if (!to.meta.auth && isAuth){
    next('/chat');
  }else {
    next();
  }
});

export default router
