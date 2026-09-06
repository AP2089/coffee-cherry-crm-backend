import { ContactMessage } from '../models/ContactMessage'
import { AppError } from '../middleware/errorHandler'
import type {
  ContactMessageStatus,
  CreateContactMessagePayload,
  IContactMessage,
  PaginatedList,
  UpdateContactMessagePayload,
} from '../types'

export type ContactMessageDTO = IContactMessage & { _id: string }

const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 100

function clampPageSize(limit?: number): number {
  const value = limit ?? PAGE_SIZE_DEFAULT
  return Math.min(Math.max(value, 1), PAGE_SIZE_MAX)
}

function toContactMessageDTO(doc: unknown): ContactMessageDTO {
  const raw = doc as IContactMessage & { _id: unknown }
  return {
    _id: String(raw._id),
    name: raw.name,
    email: raw.email,
    message: raw.message,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export async function createContactMessage(
  payload: CreateContactMessagePayload,
): Promise<ContactMessageDTO> {
  const name = payload.name?.trim()
  const email = payload.email?.trim().toLowerCase()
  const message = payload.message?.trim()

  if (!name || name.length < 2) {
    throw new AppError('Name must be at least 2 characters', 400)
  }

  if (!email) {
    throw new AppError('Email is required', 400)
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) {
    throw new AppError('Invalid email address', 400)
  }

  if (!message || message.length < 10) {
    throw new AppError('Message must be at least 10 characters', 400)
  }

  const contactMessage = await ContactMessage.create({
    name,
    email,
    message,
    status: 'new',
  })

  return toContactMessageDTO(contactMessage.toObject())
}

export async function listContactMessages(options?: {
  limit?: number
  offset?: number
  status?: ContactMessageStatus
}): Promise<PaginatedList<ContactMessageDTO>> {
  const limit = clampPageSize(options?.limit)
  const offset = Math.max(options?.offset ?? 0, 0)
  const filter = options?.status ? { status: options.status } : {}

  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean().exec(),
    ContactMessage.countDocuments(filter).exec(),
  ])

  return {
    items: items.map((item) => toContactMessageDTO(item)),
    total,
    hasMore: offset + items.length < total,
  }
}

export async function getContactMessageById(id: string): Promise<ContactMessageDTO> {
  const contactMessage = await ContactMessage.findById(id).lean().exec()

  if (!contactMessage) {
    throw new AppError('Contact message not found', 404)
  }

  return toContactMessageDTO(contactMessage)
}

export async function updateContactMessage(
  id: string,
  payload: UpdateContactMessagePayload,
): Promise<ContactMessageDTO> {
  const allowed: ContactMessageStatus[] = ['new', 'read', 'archived']

  if (payload.status && !allowed.includes(payload.status)) {
    throw new AppError('Invalid contact message status', 400)
  }

  if (!payload.status) {
    throw new AppError('No fields to update', 400)
  }

  const contactMessage = await ContactMessage.findByIdAndUpdate(
    id,
    { $set: { status: payload.status } },
    { new: true },
  )
    .lean()
    .exec()

  if (!contactMessage) {
    throw new AppError('Contact message not found', 404)
  }

  return toContactMessageDTO(contactMessage)
}

export async function deleteContactMessage(id: string): Promise<void> {
  const result = await ContactMessage.findByIdAndDelete(id).exec()

  if (!result) {
    throw new AppError('Contact message not found', 404)
  }
}
