import { Schema, model, type Document, type Model } from 'mongoose'
import type { ICustomer, IOrder, IOrderItem, OrderStatus } from '../types'

export interface OrderDocument extends IOrder, Document {}

const orderItemSchema = new Schema<IOrderItem>(
  {
    coffeeId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    weight: { type: Number, required: true, enum: [250, 500, 1000] },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    comment: { type: String, trim: true, default: '' },
  },
  { _id: false },
)

const orderSchema = new Schema<OrderDocument>(
  {
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v: IOrderItem[]) => v.length > 0, 'Order must have items'],
    },
    customer: { type: customerSchema, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] satisfies OrderStatus[],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Order: Model<OrderDocument> = model<OrderDocument>('Order', orderSchema)
