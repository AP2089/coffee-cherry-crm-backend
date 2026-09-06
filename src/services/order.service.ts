import { Order } from '../models/Order'
import { AppError } from '../middleware/errorHandler'
import type { IOrder, OrderStatus, PaginatedList, UpdateOrderPayload } from '../types'

export type OrderDTO = IOrder & { _id: string }

const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 100

function clampPageSize(limit?: number): number {
  const value = limit ?? PAGE_SIZE_DEFAULT
  return Math.min(Math.max(value, 1), PAGE_SIZE_MAX)
}

function toOrderDTO(doc: unknown): OrderDTO {
  const raw = doc as IOrder & { _id: unknown }
  return {
    _id: String(raw._id),
    items: raw.items,
    customer: raw.customer,
    totalPrice: raw.totalPrice,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export async function getOrderById(id: string): Promise<OrderDTO> {
  const order = await Order.findById(id).lean().exec()

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  return toOrderDTO(order)
}

export async function listOrders(options?: {
  limit?: number
  offset?: number
  status?: OrderStatus
}): Promise<PaginatedList<OrderDTO>> {
  const limit = clampPageSize(options?.limit)
  const offset = Math.max(options?.offset ?? 0, 0)
  const filter = options?.status ? { status: options.status } : {}

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean().exec(),
    Order.countDocuments(filter).exec(),
  ])

  return {
    items: items.map((item) => toOrderDTO(item)),
    total,
    hasMore: offset + items.length < total,
  }
}

export async function updateOrder(id: string, payload: UpdateOrderPayload): Promise<OrderDTO> {
  const allowed: Array<NonNullable<UpdateOrderPayload['status']>> = [
    'pending',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
  ]

  if (payload.status && !allowed.includes(payload.status)) {
    throw new AppError('Invalid order status', 400)
  }

  const order = await Order.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean().exec()

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  return toOrderDTO(order)
}
