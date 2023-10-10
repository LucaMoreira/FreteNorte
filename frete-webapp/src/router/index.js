import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/view.vue' 
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/firebaseConfig'
import { inject } from 'vue'

const auth = getAuth(firebaseApp)  

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: false,
        title: 'Home'
      }
    },
    { 
        name: 'login',
        path: '/login',
        component: () => import('@/views/PerfilLogin.vue'),
      meta: {
        requiresAuth: false,
        title: "Login"
      }
    },
    {
      path: '/items', 
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/items/view.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          name: 'items',
          path: '',
          component: () => import('@/views/items/home.vue'),
          meta: { title: "Items"}
        },
        {
          name: 'items-ambiente',
          path: 'ambiente/:ambiente',
          component: () => import('@/views/items/ambiente.vue'),
          meta: { title: "Items por Ambiente"}
        },
        {
          name: 'items-ambiente-print',
          path: 'ambiente/:ambiente/print',
          component: () => import('@/views/items/ambiente-print.vue'),
          meta: { title: "Items por Ambiente - Impressão"}
        },
        {
          name: 'item-codigo',
          path: 'cod/:codigo',
          component: () => import('../views/items/cod.vue'),
          meta: { title: "Item por código"}
        },
        {
          name: 'item-codigo-localizacao',
          path: 'cod/:codigo/localizacao',
          component: () => import('../views/items/cod-local.vue'),
          meta: { title: "Item - Ajustar localização"}

        },
        {
          name: 'item-codigo-partes',
          path: 'cod/:codigo/partes',
          component: () => import('../views/items/codpartes.vue'),
          meta: { title: "Items por código - partes"}
        },
        {
          name: 'item-descricao',
          path: 'descricao',
          component: () => import('../views/items/descricao.vue'),
          meta: { title: "Items por descrição"}
        },
        {
          name: 'item-add',
          path: 'add',
          component: () => import('../views/items/add.vue'),
          meta: {title: "Adicionar item"}
        }
      ]
    },
    {
      path: '/volumes',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/volumes/view.vue'),
      meta: {
        requiresAuth: true
      },
      children:[
        {
          path: '',
          name: 'volumes',
          component: () => import('../views/volumes/home.vue'),
          meta: { title: "Volumes"}
        },
        {
          path: 'print',
          name: 'volumes-print',
          component: () => import('../views/volumes/print.vue'),
          meta: { title: "Volumes Impressão"}
        },
        {
          path: 'cod/:codigo',
          name: 'volume-codigo',
          component: () => import('../views/volumes/codigo.vue'),
          meta: { title: "Volume por código"}
        },
        {
          path: 'edit/:codigo',
          name: 'volume-edit',
          component: () => import('../views/volumes/edit.vue'),
          meta: { title: "Editar volume"}
        },
        {
          path: 'add',
          name: 'volume-add',
          component: () => import('../views/volumes/add.vue'),
          meta: { title: "Adicionar Volume"}
        }
      ]
    },
    {
      path: '/qrscan',
      name: 'qrcode',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ScanearView.vue'),
      meta: {
        requiresAuth: true,
        title: "Ler QR Code"
      }
    },
    {
      path: '/ajuda',
      name: 'ajuda',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AjudaView.vue'),
      meta: {
        requiresAuth: true,
        title: "Ajuda"
      }
    }
  ]
})


export default router
