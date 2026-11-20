export function isProfileComplete(user) {
  const profile = user?.profile || {}
  return Boolean(
    typeof profile.name === 'string' && profile.name.trim() &&
    typeof profile.iit === 'string' && profile.iit.trim() &&
    typeof profile.branch === 'string' && profile.branch.trim() &&
    typeof profile.batch === 'string' && profile.batch.trim() &&
    typeof profile.photoUrl === 'string' && profile.photoUrl.trim()
  )
}
