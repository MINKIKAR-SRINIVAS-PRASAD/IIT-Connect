import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import PlacementCreate from '../../components/placement/PlacementCreate.jsx'
import PlacementFilters from '../../components/placement/PlacementFilters.jsx'
import PlacementCard from '../../components/placement/PlacementCard.jsx'
import Loader from '../../components/common/Loader.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { api } from '../../utils/api'

export default function Placement() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})

  async function load(nextFilters = filters) {
    setLoading(true)
    try {
      const { data } = await api.get('/placements', { params: nextFilters })
      setPosts(data.posts)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load placements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load({})
  }, [])

  return (
    <div className="space-y-4">
      <PlacementCreate onCreated={() => toast('Awaiting admin approval')} />
      <PlacementFilters
        onApply={(f) => {
          setFilters(f)
          load(f)
        }}
      />

      {loading ? (
        <Loader />
      ) : posts.length ? (
        <div className="space-y-3">
          {posts.map((p) => (
            <PlacementCard key={p._id} post={p} />
          ))}
        </div>
      ) : (
        <EmptyState title="No approved posts yet" subtitle="Submit one or adjust filters." />
      )}
    </div>
  )
}
