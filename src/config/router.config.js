// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view')
}

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/overview',
    children: [
      // Overview - 一级目录
      {
        path: '/overview',
        name: 'Data Center',
        component: () => import('@/views/dashboard/Analysis'),
        meta: { title: 'Data Center', keepAlive: false, icon: bxAnaalyse, permission: ['dashboard'] }
      },

     // Account Management
      {
        path: '/merchant',
        redirect: '/merchant/admission',
        component: RouteView,
        meta: { title: 'Merchant Management', icon: 'form' },
        children: [
          {
            path: '/admission',
            name: 'AdmissionApproval',
            meta: {
              title: 'Admission Approval',
              auth: true
            },
            component: () => import('@/views/merchant/admission')
          },
          {
            path: '/accountSettings',
            name: 'accountSettings',
            meta: {
              title: 'Account Settings',
              auth: true
            },
            component: () => import('@/views/merchant/accountSettings')
          },
          {
            path: '/ExchangeManagement',
            name: 'ExchangeManagement',
            meta: {
              title: 'Exchange Management',
              auth: true
            },
            component: () => import('@/views/merchant/exchangeManagement')
          }

        ]
      },

      // Order Management

       {
        path: '/order',
        redirect: '/order/exchange',
        component: RouteView,
        meta: { title: 'Order Management', icon: 'form' },
        children: [
          {
            path: '/exchange',
            name: 'Exchange Processing',
            meta: {
              title: 'Exchange Processing',
              auth: true
            },
            component: () => import('@/views/order/exchange')
          }
        ]
        }

    ]
  },

  // KYB - 移出 BasicLayout，使用 BlankLayout
  {
    path: '/approvalAudit',
    component: BlankLayout,
    redirect: '/merchant/approvalAudit',
    hidden: true,
    meta: { title: 'approvalAudit', icon: 'form' },
    children: [
      {
        path: '/merchant/approvalAudit',
        name: 'approvalAudit',
        meta: {
          title: 'approvalAudit',
          auth: true
        },
        component: () => import('@/views/merchant/approvalAudit')
      }
    ]
  },

  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/newLogin')
      },
      {
        path: 'signup',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
