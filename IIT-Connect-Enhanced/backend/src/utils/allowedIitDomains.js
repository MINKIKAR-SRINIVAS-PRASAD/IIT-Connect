// Option B: allow root + subdomain emails.
// Rule: emailDomain is allowed if it equals or endsWith one of these.
// Based on MoE official IIT websites list (23 IITs) + common aliases requested.
// Source: https://www.education.gov.in/en/technical-education-2

export const ALLOWED_IIT_DOMAINS = [
  // MoE list (roots)
  'iitgn.ac.in',
  'iitbbs.ac.in',
  'iitm.ac.in',
  'iitg.ernet.in',
  'iiti.ac.in',
  'iitk.ac.in',
  'iitj.ac.in',
  'iitkgp.ac.in',
  'iith.ac.in',
  'iitb.ac.in',
  'iitp.ac.in',
  'iitd.ac.in',
  'iitrpr.ac.in',
  'iitmandi.ac.in',
  'iitr.ac.in',
  'iitbhu.ac.in',
  'iitjammu.ac.in',
  'iitpkd.ac.in',
  'iittp.ac.in',
  'iitgoa.ac.in',
  'iitbhilai.ac.in',
  'iitdh.ac.in',
  'iitism.ac.in',

  // Requested common aliases
  'iitg.ac.in',
  'iitbhubaneswar.ac.in'
]

export function isAllowedIitEmail(email) {
  if (!email || !email.includes('@')) return false
  const domain = email.split('@').pop().toLowerCase().trim()
  return ALLOWED_IIT_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))
}


export function getIitForEmail(email) {
  const domain = String(email || '').trim().toLowerCase().split('@').pop()
  const known = ALLOWED_IIT_DOMAINS.find(d => domain === d || domain.endsWith('.' + d))
  return known || domain || ''
}
