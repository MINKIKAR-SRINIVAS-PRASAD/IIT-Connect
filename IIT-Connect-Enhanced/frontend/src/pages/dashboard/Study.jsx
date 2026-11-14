import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none'
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300'

const emptyForm = {
  title: '',
  subject: '',
  description: '',
  branch: '',
  semester: '',
  iit: '',
  resourceType: 'Notes',
  tags: '',
  links: ''
}

function ResourceCard({ post }) {
  const author = post.authorId?.profile?.name || 'IIT Connect student'
  const links = (post.links || []).filter((url) => /^https?:\/\//i.test(url))

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">{post.title}</div>
          <div className="mt-1 text-sm text-slate-400">{post.subject}{post.semester ? ` • Semester ${post.semester}` : ''}{post.branch ? ` • ${post.branch}` : ''}</div>
        </div>
        <span className="rounded-full border border-emerald-700/50 bg-emerald-950/50 px-3 py-1 text-xs text-emerald-300">{post.resourceType || 'Resource'}</span>
      </div>
      {post.description ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{post.description}</p> : null}
      {(post.tags || []).length ? <div className="mt-3 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300">#{tag}</span>)}</div> : null}
      {links.length ? <div className="mt-4 flex flex-wrap gap-2">{links.map((url, index) => <a key={url + index} href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-indigo-600/15 px-3 py-2 text-sm text-indigo-300 hover:bg-indigo-600/25">Open resource {index + 1} ↗</a>)}</div> : null}
      <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">Shared by {author}{post.iit ? ` • ${post.iit}` : ''}</div>
    </article>
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
    if (!form.title.trim() || !form.subject.trim()) {
      toast.error('Please enter a title and subject')
      return
    }
    const links = form.links.split('\n').map((value) => value.trim()).filter(Boolean)
    if (links.some((url) => !/^https?:\/\//i.test(url))) {
      toast.error('Resource links must start with https:// or http://')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/study', {
        title: form.title.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
        branch: form.branch.trim(),
        semester: form.semester.trim(),
        iit: form.iit.trim(),
        resourceType: form.resourceType,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        links
      })
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-950/70 via-slate-950 to-slate-950 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Learn together</div>
            <h1 className="mt-2 text-3xl font-bold text-white">Study Hub</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Discover notes, assignments, books, practice material and useful learning links shared by students across IITs.</p>
          </div>
          <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 hover:bg-indigo-500">{showForm ? 'Close form' : '+ Share a resource'}</button>
        </div>
      </section>

      {showForm ? (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div><h2 className="text-xl font-semibold text-white">Share study material</h2><p className="mt-1 text-sm text-slate-400">Your resource will appear publicly in the Study Hub after admin approval.</p></div>
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
        </form>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-white">Explore resources</h2><p className="mt-1 text-sm text-slate-400">Admin-approved study material from the community</p></div><button type="button" onClick={load} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900">Refresh</button></div>
        <input className={inputClass} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, subject, branch, institute or tag..." />
        {loading ? <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-400">Loading study resources...</div> : filteredPosts.length ? <div className="grid gap-4 lg:grid-cols-2">{filteredPosts.map((post) => <ResourceCard key={post._id} post={post} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center"><div className="text-lg font-semibold text-slate-200">No resources found</div><p className="mt-2 text-sm text-slate-400">{search ? 'Try another search term.' : 'Be the first to share useful study material with the IIT community.'}</p></div>}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-lg font-semibold text-white">My submissions</h2>
        <p className="mt-1 text-sm text-slate-400">Track the approval status of resources you have shared.</p>
        {mine.length ? <div className="mt-4 space-y-3">{mine.map((post) => <div key={post._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 p-3"><div><div className="font-medium text-slate-200">{post.title}</div><div className="text-xs text-slate-500">{post.subject}</div></div><span className={`rounded-full px-3 py-1 text-xs ${post.status === 'Approved' ? 'bg-emerald-950 text-emerald-300' : post.status === 'Rejected' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'}`}>{post.status}</span></div>)}</div> : <p className="mt-4 text-sm text-slate-500">You have not submitted any resources yet.</p>}
      </section>
    </div>
  )
}
