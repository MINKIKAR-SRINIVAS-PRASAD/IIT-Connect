import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none'
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300'
const emptyForm = { title: '', subject: '', description: '', branch: '', semester: '', iit: '', resourceType: 'Notes', tags: '', links: '' }

function ResourceCard({ post, onOpen }) {
  const author = post.authorId?.profile?.name || 'IIT Connect student'
  return (
    <button type="button" onClick={() => onOpen(post)} className="group w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-indigo-500/70 hover:bg-slate-900 hover:shadow-xl hover:shadow-indigo-950/30 focus:outline-none focus:ring-2 focus:ring-indigo-500">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-white transition group-hover:text-indigo-200">{post.title}</div>
          <div className="mt-1 text-sm text-slate-400">{post.subject}{post.semester ? ` • Semester ${post.semester}` : ''}{post.branch ? ` • ${post.branch}` : ''}</div>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-700/50 bg-emerald-950/50 px-3 py-1 text-xs text-emerald-300">{post.resourceType || 'Resource'}</span>
      </div>
      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">{post.description || 'Open this resource to view the full details and shared material.'}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
        <span className="text-xs text-slate-500">By {author}{post.iit ? ` • ${post.iit}` : ''}</span>
        <span className="text-xs font-semibold text-indigo-300 transition group-hover:translate-x-1">View details →</span>
      </div>
    </button>
  )
}

function ResourceDetails({ post, onClose, isOwner, onDelete }) {
  if (!post) return null
  const links = (post.links || []).filter((url) => /^https?:\/\//i.test(url))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="study-resource-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 p-5 shadow-2xl shadow-black/50 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Study material details</div><h2 id="study-resource-title" className="mt-2 text-2xl font-bold text-white">{post.title}</h2><p className="mt-1 text-sm text-slate-400">{post.subject}</p></div>
          <button type="button" onClick={onClose} aria-label="Close details" className="rounded-xl border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800">✕</button>
        </div>
        <div className="mt-5 grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-2">
          <div><div className="text-xs uppercase text-slate-500">Resource type</div><div className="mt-1 text-sm text-white">{post.resourceType || 'Other'}</div></div>
          <div><div className="text-xs uppercase text-slate-500">Institute scope</div><div className="mt-1 text-sm text-white">{post.iit || 'All IITs'}</div></div>
          <div><div className="text-xs uppercase text-slate-500">Branch</div><div className="mt-1 text-sm text-white">{post.branch || 'All branches'}</div></div>
          <div><div className="text-xs uppercase text-slate-500">Semester</div><div className="mt-1 text-sm text-white">{post.semester || 'Not specified'}</div></div>
          <div><div className="text-xs uppercase text-slate-500">Shared by</div><div className="mt-1 text-sm text-white">{post.authorId?.profile?.name || 'IIT Connect student'}</div></div>
          <div><div className="text-xs uppercase text-slate-500">Date shared</div><div className="mt-1 text-sm text-white">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}</div></div>
        </div>
        <div className="mt-5"><h3 className="text-sm font-semibold text-white">About this material</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">{post.description || 'No description provided.'}</p></div>
        {(post.tags || []).length > 0 && <div className="mt-5"><h3 className="text-sm font-semibold text-white">Topics and tags</h3><div className="mt-2 flex flex-wrap gap-2">{post.tags.map((tag, index) => <span key={tag + index} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300">#{tag}</span>)}</div></div>}
        <div className="mt-5"><h3 className="text-sm font-semibold text-white">Study material links</h3>{links.length ? <div className="mt-2 space-y-2">{links.map((url, index) => <a key={url + index} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200 hover:bg-indigo-500/20"><span className="break-all">Resource {index + 1}: {url}</span><span className="shrink-0">↗</span></a>)}</div> : <p className="mt-2 text-sm text-slate-500">No external links were added.</p>}</div>
        {isOwner && <div className="mt-6 flex justify-end border-t border-slate-800 pt-4"><button type="button" onClick={() => onDelete(post)} className="rounded-xl border border-rose-500/40 px-4 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-500/10">Delete for everyone</button></div>}
      </section>
    </div>
  )
}

export default function Study() {
  const [posts, setPosts] = useState([])
  const [mine, setMine] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [approved, own] = await Promise.all([api.get('/study'), api.get('/study/mine')])
      setPosts(approved.data.posts || [])
      setMine(own.data.posts || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not load study resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const mineIds = useMemo(() => new Set(mine.map((post) => String(post._id))), [mine])
  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return posts
    return posts.filter((post) => [post.title, post.subject, post.description, post.branch, post.iit, ...(post.tags || [])].join(' ').toLowerCase().includes(term))
  }, [posts, search])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.subject.trim()) return toast.error('Please enter a title and subject')
    const links = form.links.split('\n').map((value) => value.trim()).filter(Boolean)
    if (links.some((url) => !/^https?:\/\//i.test(url))) return toast.error('Resource links must start with https:// or http://')
    setSubmitting(true)
    try {
      await api.post('/study', { title: form.title.trim(), subject: form.subject.trim(), description: form.description.trim(), branch: form.branch.trim(), semester: form.semester.trim(), iit: form.iit.trim(), resourceType: form.resourceType, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), links })
      toast.success('Study resource submitted for admin approval')
      setForm(emptyForm)
      setShowForm(false)
      await load()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not submit resource')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteResource(post) {
    if (!window.confirm(`Delete "${post.title}" for everyone? This cannot be undone.`)) return
    setDeletingId(String(post._id))
    try {
      await api.delete(`/study/${post._id}`)
      toast.success('Study resource deleted for everyone. Admin has been notified.')
      setSelected(null)
      await load()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not delete this resource')
    } finally {
      setDeletingId('')
    }
  }

  const isSelectedOwner = selected && mineIds.has(String(selected._id))
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-950/70 via-slate-950 to-slate-950 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Learn together</div><h1 className="mt-2 text-3xl font-bold text-white">Study Hub</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Discover notes, assignments, books, practice material and useful learning links shared by students across IITs.</p></div><button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 hover:bg-indigo-500">{showForm ? 'Close form' : '+ Share a resource'}</button></div>
      </section>

      {showForm && <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div><h2 className="text-xl font-semibold text-white">Share study material</h2><p className="mt-1 text-sm text-slate-400">Your resource will appear in the Study Hub after admin approval.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className={labelClass}>Resource title *</span><input className={inputClass} maxLength={120} required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Thermodynamics complete notes" /></label>
          <label><span className={labelClass}>Subject *</span><input className={inputClass} maxLength={80} required value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="e.g. Engineering Thermodynamics" /></label>
          <label><span className={labelClass}>Resource type</span><select className={inputClass} value={form.resourceType} onChange={(e) => update('resourceType', e.target.value)}>{['Video', 'Notes', 'Assignment', 'Book', 'Practice', 'Other'].map((type) => <option key={type}>{type}</option>)}</select></label>
          <label><span className={labelClass}>Institute (optional)</span><input className={inputClass} maxLength={100} value={form.iit} onChange={(e) => update('iit', e.target.value)} placeholder="e.g. IIT Bhubaneswar or leave blank for all IITs" /></label>
          <label><span className={labelClass}>Branch (optional)</span><input className={inputClass} maxLength={80} value={form.branch} onChange={(e) => update('branch', e.target.value)} placeholder="e.g. Mechanical Engineering" /></label>
          <label><span className={labelClass}>Semester (optional)</span><input className={inputClass} maxLength={30} value={form.semester} onChange={(e) => update('semester', e.target.value)} placeholder="e.g. 3" /></label>
        </div>
        <label className="block"><span className={labelClass}>Description</span><textarea className={inputClass + ' min-h-28'} maxLength={2000} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="What does this resource cover? Who will find it useful?" /></label>
        <label className="block"><span className={labelClass}>Tags (comma separated)</span><input className={inputClass} maxLength={250} value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="thermodynamics, exam preparation, formulas" /></label>
        <label className="block"><span className={labelClass}>Resource links (one URL per line)</span><textarea className={inputClass + ' min-h-24'} value={form.links} onChange={(e) => update('links', e.target.value)} placeholder={'https://drive.google.com/...\nhttps://youtube.com/...'} /></label>
        <div className="flex flex-wrap items-center gap-3"><button disabled={submitting} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit for approval'}</button><span className="text-xs text-slate-500">Only share material you have permission to distribute.</span></div>
      </form>}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-white">Explore resources</h2><p className="mt-1 text-sm text-slate-400">Click any card to see its complete details and material links.</p></div><button type="button" onClick={load} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900">Refresh</button></div>
        <input className={inputClass} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, subject, branch, institute or tag..." />
        {loading ? <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-400">Loading study resources...</div> : filteredPosts.length ? <div className="grid gap-4 lg:grid-cols-2">{filteredPosts.map((post) => <ResourceCard key={post._id} post={post} onOpen={setSelected} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center"><div className="text-lg font-semibold text-slate-200">No resources found</div><p className="mt-2 text-sm text-slate-400">{search ? 'Try another search term.' : 'Be the first to share useful study material with the IIT community.'}</p></div>}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-lg font-semibold text-white">My submissions</h2><p className="mt-1 text-sm text-slate-400">Track approval status or delete a resource you submitted.</p>
        {mine.length ? <div className="mt-4 space-y-3">{mine.map((post) => <div key={post._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 p-3"><button type="button" onClick={() => setSelected(post)} className="min-w-0 flex-1 text-left"><div className="font-medium text-slate-200 hover:text-indigo-300">{post.title}</div><div className="text-xs text-slate-500">{post.subject} · Click for details</div></button><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs ${post.status === 'Approved' ? 'bg-emerald-950 text-emerald-300' : post.status === 'Rejected' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'}`}>{post.status}</span><button type="button" disabled={deletingId === String(post._id)} onClick={() => deleteResource(post)} className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50">{deletingId === String(post._id) ? 'Deleting…' : 'Delete'}</button></div></div>)}</div> : <p className="mt-4 text-sm text-slate-500">You have not submitted any resources yet.</p>}
      </section>
      <ResourceDetails post={selected} onClose={() => setSelected(null)} isOwner={Boolean(isSelectedOwner)} onDelete={deleteResource} />
    </div>
  )
}
