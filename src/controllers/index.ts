import type { NextFunction, Request, Response } from 'express'
import { isDatabaseConnected } from '../config/database'
import * as orderService from '../services/order.service'
import * as contactService from '../services/contact.service'
import type {
  ContactMessageStatus,
  OrderStatus,
  UpdateContactMessagePayload,
  UpdateOrderPayload,
} from '../types'

function parseQueryNumber(value: unknown): number | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseContactStatus(value: unknown): ContactMessageStatus | undefined {
  if (value === 'new' || value === 'read' || value === 'archived') return value
  return undefined
}

function parseOrderStatus(value: unknown): OrderStatus | undefined {
  if (
    value === 'pending' ||
    value === 'confirmed' ||
    value === 'shipped' ||
    value === 'delivered' ||
    value === 'cancelled'
  ) {
    return value
  }
  return undefined
}

export async function health(_req: Request, res: Response): Promise<void> {
  const dbOk = isDatabaseConnected()

  if (!dbOk) {
    res.status(503).json({
      status: 'error',
      mongodb: 'disconnected',
    })
    return
  }

  res.status(200).json({
    status: 'ok',
  })
}

export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.getOrderById(req.params.id)
    res.json({ success: true, data: order })
  } catch (error) {
    next(error)
  }
}

export async function updateOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = req.body as UpdateOrderPayload
    const order = await orderService.updateOrder(req.params.id, payload)
    res.json({ success: true, data: order })
  } catch (error) {
    next(error)
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const orders = await orderService.listOrders({
      limit: parseQueryNumber(req.query.limit),
      offset: parseQueryNumber(req.query.offset),
      status: parseOrderStatus(req.query.status),
    })
    res.json({ success: true, data: orders })
  } catch (error) {
    next(error)
  }
}

export async function listContactMessages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const messages = await contactService.listContactMessages({
      limit: parseQueryNumber(req.query.limit),
      offset: parseQueryNumber(req.query.offset),
      status: parseContactStatus(req.query.status),
    })
    res.json({ success: true, data: messages })
  } catch (error) {
    next(error)
  }
}

export async function getContactMessageById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const message = await contactService.getContactMessageById(req.params.id)
    res.json({ success: true, data: message })
  } catch (error) {
    next(error)
  }
}

export async function updateContactMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = req.body as UpdateContactMessagePayload
    const message = await contactService.updateContactMessage(req.params.id, payload)
    res.json({ success: true, data: message })
  } catch (error) {
    next(error)
  }
}

export async function deleteContactMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await contactService.deleteContactMessage(req.params.id)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
