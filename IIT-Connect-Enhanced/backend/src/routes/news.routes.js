import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import ExternalNews from '../models/ExternalNews.js'
import { createCampusNews, listApprovedCampusNews, listMyCampusNews } from '../controllers/news.controller.js'

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
  return {id:feed.source+'-'+i+'-'+url,category:feed.category,source:feed.source,title,description,url,date:rawDate&&!Number.isNaN(Date.parse(rawDate))?new Date(rawDate).toISOString():null}
 }).filter(x=>x.title&&/^https?:\/\//i.test(x.url))
}
router.get('/campus',listApprovedCampusNews)
router.get('/mine',requireAuth,listMyCampusNews)
router.post('/campus',requireAuth,createCampusNews)
router.get('/external',async(_req,res)=>{
 const settled=await Promise.allSettled(feeds.map(async feed=>{
  const response=await fetch(feed.url,{headers:{'User-Agent':'IITStudentsOS-News/1.0 (RSS reader)'},signal:AbortSignal.timeout(9000)})
  if(!response.ok)throw new Error('RSS unavailable: '+response.status)
  return parseFeed(await response.text(),feed)
 }))
 const now=new Date()
 const fresh=settled.flatMap(x=>x.status==='fulfilled'?x.value:[])
 const failed=settled.filter(x=>x.status==='rejected').length
 if(fresh.length){
  await ExternalNews.bulkWrite(fresh.map(item=>({
   updateOne:{
    filter:{sourceKey:item.source+'|'+item.url},
    update:{$set:{
     sourceKey:item.source+'|'+item.url,
     category:item.category,
     source:item.source,
     title:item.title,
     description:item.description,
     url:item.url,
     date:item.date?new Date(item.date):null,
     lastSeenAt:now
    },$setOnInsert:{firstSeenAt:now}},
    upsert:true
   }
  })),{ordered:false})
 }
 // Never prune an article merely because its RSS provider stops returning it.
 // The collection is an archive of every item observed by this endpoint.
 const archived=await ExternalNews.find({}).sort({date:-1,firstSeenAt:-1}).limit(5000).lean()
 const items=archived.map(item=>({
  id:item.sourceKey,
  category:item.category,
  source:item.source,
  title:item.title,
  description:item.description,
  url:item.url,
  date:item.date?new Date(item.date).toISOString():null
 }))
 res.json({items,partialFailure:failed>0,sourcesFailed:failed,updatedAt:now.toISOString(),archived:true})
})
export default router
