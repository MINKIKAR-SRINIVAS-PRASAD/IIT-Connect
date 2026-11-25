import { Router } from 'express'
import ExternalNews from '../models/ExternalNews.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { createCampusNews, listApprovedCampusNews, listMyCampusNews, deleteCampusNews } from '../controllers/news.controller.js'

const router = Router()
const feeds = [
 {category:'international',source:'BBC News · World',url:'https://feeds.bbci.co.uk/news/world/rss.xml'},
 {category:'international',source:'Al Jazeera English',url:'https://www.aljazeera.com/xml/rss/all.xml'},
 {category:'international',source:'Deutsche Welle',url:'https://rss.dw.com/xml/rss-en-all'},
 {category:'international',source:'France 24 · English',url:'https://www.france24.com/en/rss'},
 {category:'international',source:'The Guardian · World',url:'https://www.theguardian.com/world/rss'},
 {category:'international',source:'Reuters · Google News',url:'https://news.google.com/rss/search?q=site%3Areuters.com+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen'},
 {category:'linkedin',source:'LinkedIn · Publicly indexed posts',url:'https://news.google.com/rss/search?q=site%3Alinkedin.com%2Fposts+%28technology+OR+research+OR+innovation%29+when%3A7d&hl=en-US&gl=US&ceid=US%3Aen'}
]
const decode=(s='')=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g,' ').trim()
const readTag=(xml,name)=>{const re=new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>','i');return xml.match(re)?.[1]||''}
const parseFeed=(xml,feed)=>{
 const blocks=[...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(m=>m[2])
 return blocks.slice(0,25).map((block,i)=>{
  const title=decode(readTag(block,'title'))
  const href=block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1]
  const url=href||decode(readTag(block,'link'))
  const description=decode(readTag(block,'description')||readTag(block,'summary')||readTag(block,'content:encoded')).slice(0,360)
  const rawDate=decode(readTag(block,'pubDate')||readTag(block,'published')||readTag(block,'updated'))
  return {id:feed.source+'-'+url,category:feed.category,source:feed.source,title,description,url,date:rawDate&&!Number.isNaN(Date.parse(rawDate))?new Date(rawDate).toISOString():null}
 }).filter(x=>x.title&&/^https?:\/\//i.test(x.url))
}
router.get('/campus',listApprovedCampusNews)
router.get('/mine',requireAuth,listMyCampusNews)
router.post('/campus',requireAuth,createCampusNews)
router.delete('/campus/:id',requireAuth,deleteCampusNews)
// Persist every discovered external article in MongoDB. Feed refresh is throttled
// so the UI's 10-second polling does not hammer publishers' RSS endpoints.
let lastExternalRefresh=0
let externalRefreshPromise=null
const refreshExternalArchive=async()=>{
 if(Date.now()-lastExternalRefresh<10*60*1000)return 0
 if(externalRefreshPromise)return externalRefreshPromise
 externalRefreshPromise=(async()=>{
  const settled=await Promise.allSettled(feeds.map(async feed=>{
   const response=await fetch(feed.url,{headers:{'User-Agent':'IITStudentsOS-News/1.0 (RSS reader)'},signal:AbortSignal.timeout(9000)})
   if(!response.ok)throw new Error('RSS unavailable: '+response.status)
   return parseFeed(await response.text(),feed)
  }))
  let saved=0
  for(const result of settled){
   if(result.status!=='fulfilled')continue
   const operations=result.value.map(item=>({updateOne:{filter:{id:item.id},update:{$set:{...item,date:item.date?new Date(item.date):null}},upsert:true}}))
   if(operations.length){const result=await ExternalNews.bulkWrite(operations,{ordered:false});saved+=result.upsertedCount||0}
  }
  lastExternalRefresh=Date.now()
  return settled.filter(x=>x.status==='rejected').length
 })().finally(()=>{externalRefreshPromise=null})
 return externalRefreshPromise
}
router.get('/external',async(_req,res)=>{
 let failed=0
 try{failed=await refreshExternalArchive()}catch(error){failed=feeds.length}
 const items=await ExternalNews.find().sort({date:-1,createdAt:-1}).lean()
 res.json({items,partialFailure:failed>0,sourcesFailed:failed,updatedAt:new Date().toISOString(),archived:true})
})
export default router
