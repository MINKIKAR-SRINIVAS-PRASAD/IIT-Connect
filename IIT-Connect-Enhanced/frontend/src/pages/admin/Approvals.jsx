import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import { api } from '../../utils/api'

function Detail({ label, children }) {
  if (children === undefined || children === null || children === '') return null
  return (
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm text-slate-200">{String(children)}</div>
    </div>
  )
}

function StudentDetails({ author }) {
  if (!author) {
    return <div className="text-sm text-amber-300">Submitter account details are unavailable.</div>
  }
  const profile = author.profile || {}
  return (
    <section className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
      <div className="mb-3 flex items-center gap-3">
        {profile.photoUrl ? (
          <img src={profile.photoUrl} alt="Student profile" className="h-12 w-12 rounded-full border border-slate-700 object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 font-semibold text-slate-300">
            {(profile.name || author.email || 'S').slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-white">{profile.name || 'Name not provided'}</div>
          <div className="break-all text-xs text-indigo-200">{author.email || 'Student email unavailable'}</div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Institute" >{profile.iit}</Detail>
        <Detail label="Branch">{profile.branch}</Detail>
        <Detail label="Batch">{profile.batch}</Detail>
        <Detail label="Role">{author.role}</Detail>
        <Detail label="Account created">{author.createdAt ? new Date(author.createdAt).toLocaleDateString() : ''}</Detail>
        <Detail label="Student bio">{profile.bio}</Detail>
      </div>
    </section>
  )
}

function ApprovalCard({ item, type, onAction }) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const author = item.authorId && typeof item.authorId === 'object' ? item.authorId : null

  async function submit(status) {
    setBusy(true)
    try {
      await onAction(status, reason)
    } finally {
      setBusy(false)
    }
  }

  const title = type === 'Gallery' || type === 'Community Gallery'
    ? item.caption || 'Gallery post'
    : type === 'Placement'
      ? [item.companyName, item.role].filter(Boolean).join(' • ')
      : type === 'Event' || type === 'Campus News' || type === 'Faculty Post'
        ? item.title
        : type === 'Trip' || type === 'Community Trip'
          ? [item.destination, item.location].filter(Boolean).join(' · ')
          : type === 'Transport Booking'
            ? item.transportType + ' booking'
          : item.title

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">{type} approval request</span>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">Pending</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-white">{title || `${type} submission`}</h3>

      {(type === 'Gallery' || type === 'Community Gallery') && item.imageUrl ? (
        <img src={item.imageUrl} alt="Submitted gallery post" className="mt-4 max-h-72 w-full rounded-xl border border-slate-800 object-contain" />
      ) : null}

      <div className="mt-4 grid gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {(type === 'Gallery' || type === 'Community Gallery') && <>
          <Detail label="Caption">{item.caption}</Detail>
          <Detail label="Institute on post">{item.iit}</Detail>
          <Detail label="Submitted">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Detail>
        </>}
        {type === 'Placement' && <>
          <Detail label="Company">{item.companyName}</Detail>
          <Detail label="Role">{item.role}</Detail>
          <Detail label="CTC / Package">{item.ctc}</Detail>
          <Detail label="Interview rounds">{Array.isArray(item.rounds) ? item.rounds.join(', ') : item.rounds}</Detail>
          <Detail label="Interview questions">{Array.isArray(item.interviewQuestions) ? item.interviewQuestions.join(' | ') : item.interviewQuestions}</Detail>
          <Detail label="Tips">{item.tips}</Detail>
        </>}
        {type === 'Event' && <>
          <Detail label="Event title">{item.title}</Detail>
          <Detail label="Institute">{item.iit}</Detail>
          <Detail label="Date and time">{item.datetime ? new Date(item.datetime).toLocaleString() : ''}</Detail>
          <Detail label="Venue">{item.venue}</Detail>
          <Detail label="Registration link">{item.registrationLink}</Detail>
          <Detail label="Description">{item.description}</Detail>
          {item.posterUrl ? <div className="sm:col-span-2"><img src={item.posterUrl} alt="Event poster" className="max-h-64 rounded-lg object-contain" /></div> : null}
        </>}
        {(type === 'Trip' || type === 'Community Trip') && <>
          <Detail label="Destination">{item.destination}</Detail>
          <Detail label="Location / State">{item.location}</Detail>
          <Detail label="Category">{item.category}</Detail>
          <Detail label="Travel date">{item.travelDate ? new Date(item.travelDate).toLocaleDateString() : 'Not specified'}</Detail>
          <Detail label="Budget per person">{item.budget || 'Not specified'}</Detail>
          <Detail label="Maximum members">{item.maxMembers || item.members}</Detail>
          <Detail label="Travel mode">{item.travelMode}</Detail>
          <Detail label="From">{item.from}</Detail>
          <Detail label="To">{item.to}</Detail>
          <Detail label="Contact preference">{item.contactPreference}</Detail>
          {item.booking && <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[.04] p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-200">Private booking details · Admin only</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(item.booking).map(([key,value]) => value ? <Detail key={key} label={key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}>{value}</Detail> : null)}
            </div>
          </div>}
          <Detail label="Legacy seat details">{item.seatDetails}</Detail>
          <div className="sm:col-span-2 lg:col-span-3"><Detail label="Trip description / notes">{item.description || item.notes}</Detail></div>
        </>}
        {type === 'Transport Booking' && <><Detail label="Transport type">{item.transportType}</Detail><Detail label="Approval status">{item.approvalStatus}</Detail><Detail label="Booking fields">{item.booking ? Object.entries(item.booking).map(([k,v])=>`${k}: ${v}`).join(' · ') : ''}</Detail></>}
        {type === 'Faculty Post' && <><Detail label="Faculty section">{item.section}</Detail><Detail label="Description / abstract">{item.description}</Detail><Detail label="Post link">{item.link}</Detail><Detail label="Submitted">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Detail></>}
        {type === 'Campus News' && <>
          <Detail label="Institute">{item.institute}</Detail><Detail label="Category">{item.category}</Detail>
          <Detail label="Story">{item.body}</Detail><Detail label="Source link">{item.sourceUrl}</Detail>
          <Detail label="Submitted">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Detail>
        </>}
        {type === 'Study' && <>
          <Detail label="Resource title">{item.title}</Detail>
          <Detail label="Subject">{item.subject}</Detail>
          <Detail label="Institute scope">{item.iit || 'All IITs'}</Detail>
          <Detail label="Branch">{item.branch}</Detail>
          <Detail label="Semester">{item.semester}</Detail>
          <Detail label="Resource type">{item.resourceType}</Detail>
          <Detail label="Tags">{Array.isArray(item.tags) ? item.tags.join(', ') : ''}</Detail>
          <div className="sm:col-span-2 lg:col-span-3"><Detail label="Description">{item.description}</Detail></div>
          <div className="sm:col-span-2 lg:col-span-3"><Detail label="Resource links">{Array.isArray(item.links) ? item.links.join(' | ') : ''}</Detail></div>
        </>}
      </div>

      <StudentDetails author={author} />

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <Button disabled={busy} onClick={() => submit('Approved')}>{busy ? 'Please wait…' : 'Approve'}</Button>
        <div className="flex gap-2">
          <Input className="min-w-0 flex-1" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason (optional)" />
          <Button disabled={busy} variant="danger" onClick={() => submit('Rejected')}>Reject</Button>
        </div>
      </div>
    </article>
  )
}

export default function Approvals() {
  const [loading, setLoading] = useState(true)
  const [gallery, setGallery] = useState([])
  const [communityGallery, setCommunityGallery] = useState([])
  const [communityTrips, setCommunityTrips] = useState([])
  const [transportBookings, setTransportBookings] = useState([])
  const [placements, setPlacements] = useState([])
  const [events, setEvents] = useState([])
  const [travel, setTravel] = useState([])
  const [study, setStudy] = useState([])
  const [campusNews, setCampusNews] = useState([])
  const [facultyPosts, setFacultyPosts] = useState([])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/approvals/pending')
      setGallery(data.gallery || [])
      setCommunityGallery(data.communityGallery || [])
      setCommunityTrips(data.communityTrips || [])
      setTransportBookings(data.transportBookings || [])
      setPlacements(data.placements || [])
      setEvents(data.events || [])
      setTravel(data.travel || [])
      setStudy(data.study || [])
      setCampusNews(data.campusNews || [])
      setFacultyPosts(data.facultyPosts || [])
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }

  async function act(kind, id, status, rejectionReason) {
    const endpoint = {
      Gallery: `/admin/approvals/gallery/${id}`,
      'Community Gallery': `/admin/approvals/community-gallery/${id}`,
      'Community Trip': `/admin/approvals/community-trips/${id}`,
      'Transport Booking': `/admin/approvals/transport-bookings/${id}`,
      Placement: `/admin/approvals/placements/${id}`,
      Event: `/admin/approvals/events/${id}`,
      Trip: `/admin/approvals/travel/${id}`,
      Study: `/admin/approvals/study/${id}`,
      'Campus News': `/admin/approvals/news/${id}`,
      'Faculty Post': `/admin/approvals/faculty/${id}`
    }[kind]
    try {
      await api.put(endpoint, { status, rejectionReason })
      toast.success(`${kind} ${status.toLowerCase()}`)
      await load()
    } catch (e) {
      toast.error(e?.response?.data?.message || `Failed to update ${kind.toLowerCase()} request`)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <Loader />

  const sections = [
    { type: 'Gallery', items: gallery },
    { type: 'Community Gallery', items: communityGallery },
    { type: 'Community Trip', items: communityTrips },
    { type: 'Transport Booking', items: transportBookings },
    { type: 'Placement', items: placements },
    { type: 'Events', items: events, cardType: 'Event' },
    { type: 'Trip', items: travel },
    { type: 'Study Resources', items: study, cardType: 'Study' },
    { type: 'Campus News', items: campusNews, cardType: 'Campus News' },
    { type: 'Faculty Posts', items: facultyPosts, cardType: 'Faculty Post' }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Content approvals</h1>
        <p className="mt-1 text-sm text-slate-400">Review submitted content before it is published to the campus community. Trip booking identifiers are visible to admins only.</p>
      </div>
      {sections.map((section) => (
        <section key={section.type}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Pending {section.type}</h2>
            <span className="text-xs text-slate-400">{section.items.length} pending</span>
          </div>
          {section.items.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {section.items.map((item) => {
                const type = section.cardType || section.type
                return <ApprovalCard key={item._id} item={type==='Faculty Post'?{...item,authorId:item.facultyId}:type==='Transport Booking'?{...item,authorId:item.userId}:item} type={type} onAction={(status, reason) => act(type, item._id, status, reason)} />
              })}
            </div>
          ) : <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">No pending {section.type.toLowerCase()} requests.</div>}
        </section>
      ))}
    </div>
  )
}
