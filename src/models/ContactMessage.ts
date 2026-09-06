import { Schema, model, type Document, type Model } from 'mongoose'
import type { ContactMessageStatus, IContactMessage } from '../types'

export interface ContactMessageDocument extends IContactMessage, Document {}

const contactMessageSchema = new Schema<ContactMessageDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ['new', 'read', 'archived'] satisfies ContactMessageStatus[],
      default: 'new',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'contacts',
  },
)

contactMessageSchema.index({ createdAt: -1 })

export const ContactMessage: Model<ContactMessageDocument> = model<ContactMessageDocument>(
  'ContactMessage',
  contactMessageSchema,
)
