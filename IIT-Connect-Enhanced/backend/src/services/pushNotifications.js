import webpush from 'web-push'
import PushSubscription from '../models/PushSubscription.js'

const publicKey = process.env.VAPID_PUBLIC_KEY || ''
const privateKey = process.env.VAPID_PRIVATE_KEY || ''
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@iit-connect.in'

let configured = false
if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
}

export function getVapidPublicKey() {
  return configured ? publicKey : ''
}

export async function sendPushToUser(userId, notification) {
  if (!configured) return
  const subscriptions = await PushSubscription.find({ userId }).lean()
  const payload = JSON.stringify({
    title: notification.title || 'IIT Connect',
    body: notification.body || 'You have a new notification',
    url: notification.url || '/app'
  })

  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: subscription.keys
      }, payload)
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await PushSubscription.deleteOne({ _id: subscription._id })
      } else {
        console.error('Push delivery failed:', error.statusCode || error.message)
      }
    }
  }))
}
