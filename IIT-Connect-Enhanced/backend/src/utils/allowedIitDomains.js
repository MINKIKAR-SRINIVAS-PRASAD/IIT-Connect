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


// Canonical institute names are derived only from an approved institute email domain.
const IIT_NAMES_BY_DOMAIN = {
  'iitgn.ac.in': 'IIT Gandhinagar', 'iitbbs.ac.in': 'IIT Bhubaneswar', 'iitbhubaneswar.ac.in': 'IIT Bhubaneswar',
  'iitm.ac.in': 'IIT Madras', 'iitg.ernet.in': 'IIT Guwahati', 'iitg.ac.in': 'IIT Guwahati',
  'iiti.ac.in': 'IIT Indore', 'iitk.ac.in': 'IIT Kanpur', 'iitj.ac.in': 'IIT Jodhpur',
  'iitkgp.ac.in': 'IIT Kharagpur', 'iith.ac.in': 'IIT Hyderabad', 'iitb.ac.in': 'IIT Bombay',
  'iitp.ac.in': 'IIT Patna', 'iitd.ac.in': 'IIT Delhi', 'iitrpr.ac.in': 'IIT Ropar',
  'iitmandi.ac.in': 'IIT Mandi', 'iitr.ac.in': 'IIT Roorkee', 'iitbhu.ac.in': 'IIT (BHU) Varanasi',
  'iitjammu.ac.in': 'IIT Jammu', 'iitpkd.ac.in': 'IIT Palakkad', 'iittp.ac.in': 'IIT Tirupati',
  'iitgoa.ac.in': 'IIT Goa', 'iitbhilai.ac.in': 'IIT Bhilai', 'iitdh.ac.in': 'IIT Dharwad',
  'iitism.ac.in': 'IIT (ISM) Dhanbad'
}

export function getIitNameFromEmail(email) {
  if (!email || !String(email).includes('@')) return ''
  const domain = String(email).trim().toLowerCase().split('@').pop()
  const matchedDomain = ALLOWED_IIT_DOMAINS.find((root) => domain === root || domain.endsWith(`.${root}`))
  return matchedDomain ? (IIT_NAMES_BY_DOMAIN[matchedDomain] || '') : ''
}
