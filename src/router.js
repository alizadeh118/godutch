import Vue from 'vue'
import Router from 'vue-router'

import Add from './views/Add.vue'
import List from './views/List.vue'
import Receipt from './views/Receipt.vue'
import PersonReceipt from './views/PersonReceipt.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/add'
    },
    {
      path: '/add',
      name: 'add',
      component: Add
    },
    {
      path: '/items',
      name: 'items',
      component: List
    },
    {
      path: '/receipt',
      name: 'receipt',
      component: Receipt
    },
    {
      path: '/receipt/:personId',
      name: 'receipt-per-person',
      component: PersonReceipt,
      props: true
    }
  ]
})
