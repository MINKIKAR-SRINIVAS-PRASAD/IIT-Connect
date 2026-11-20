import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import PushSubscription from '../models/PushSubscription.js'
import { getVapidPublicKey } from '../services/pushNotifications.js'

export const publicKey = asyncHandler(async (_req, res) => {
  const key = getVapidPublicKey()
  if (!key) throw new ApiError(503, 'Push notifications are not configured yet')
  res.json({ success: true, publicKey: key })
})

export const saveSubscription = asyncHandler(async (req, res) => {
  const subscription = req.body?.subscription
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    throw new ApiError(400, 'A valid push subscription is required')
  }
  await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      $set: {
        userId: req.user._id,
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth }
      }
    },
    { upsert: true, new: true, runValidators: true }
  )
  res.status(201).json({ success: true })
})

export const removeSubscription = asyncHandler(async (req, res) => {
  const endpoint = req.body?.endpoint
  if (!endpoint || typeof endpoint !== 'string') throw new ApiError(400, 'Subscription endpoint is required')
  await PushSubscription.deleteOne({ userId: req.user._id, endpoint })
  res.json({ success: true })
})

export const subscriptionStatus = asyncHandler(async (req, res) => {
  const count = await PushSubscription.countDocuments({ userId: req.user._id })
  res.json({ success: true, enabled: count > 0 })
})
