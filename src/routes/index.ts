import { Router } from 'express'
import * as controller from '../controllers'
import * as authController from '../controllers/auth.controller'
import { requireAuth, requireAdmin, forbidGuest } from '../middleware/auth'

const router = Router()

router.get('/health', controller.health)

router.get('/orders', requireAuth, controller.listOrders)
router.get('/orders/:id', requireAuth, controller.getOrderById)
router.patch('/orders/:id', requireAuth, forbidGuest, controller.updateOrder)

router.get('/contacts', requireAuth, controller.listContactMessages)
router.get('/contacts/:id', requireAuth, controller.getContactMessageById)
router.patch('/contacts/:id', requireAuth, forbidGuest, controller.updateContactMessage)
router.delete('/contacts/:id', requireAuth, requireAdmin, controller.deleteContactMessage)

router.post('/auth/login', authController.login)
router.get('/auth/me', requireAuth, authController.me)

export default router
