import type {Account,PortalVideo,Upload} from '../services/socialMedia';

export function permalinkContentId(platform:string,value?:string){
 if(!value)return '';
 try{
  const url=new URL(value);const host=url.hostname.toLowerCase();const path=url.pathname.split('/').filter(Boolean);
  if(platform.toUpperCase()==='YOUTUBE'){
   if(host==='youtu.be')return path[0]||'';
   if(path[0]==='watch')return url.searchParams.get('v')||'';
   if(['shorts','embed','live'].includes(path[0]||''))return path[1]||'';
  }
  if(platform.toUpperCase()==='INSTAGRAM'&&['p','reel','tv'].includes(path[0]||''))return path[1]||'';
  if(platform.toUpperCase()==='FACEBOOK')return url.searchParams.get('story_fbid')||url.searchParams.get('fbid')||path.find((part,index)=>['posts','videos','reel'].includes(path[index-1]||''))||'';
  return '';
 }catch{return '';}
}

/** Resolve a feed post to a local upload row. Provider IDs are used only for lookup. */
export function resolveLocalUpload(video:PortalVideo,uploads:Upload[],accounts:Account[]):Upload|undefined{
 const platform=video.platform.toUpperCase();
 const providerIds=new Set([video.externalContentId,video.external_content_id,permalinkContentId(platform,video.permalink),typeof video.id==='string'?video.id:undefined].filter((value):value is string=>Boolean(value)));
 if(!providerIds.size)return undefined;
 const providedAccountId=video.accountId??video.account_id;
 const providedExternalAccountId=String(video.externalAccountId??video.external_account_id??'');
 let account=providedAccountId!=null?accounts.find(row=>row.id===Number(providedAccountId)&&row.platform.toUpperCase()===platform):providedExternalAccountId?accounts.find(row=>row.external_account_id===providedExternalAccountId&&row.platform.toUpperCase()===platform):undefined;
 if(!account&&video.accountName){const matchingAccounts=accounts.filter(row=>row.platform.toUpperCase()===platform&&row.account_name?.trim().toLowerCase()===video.accountName?.trim().toLowerCase());if(matchingAccounts.length===1)account=matchingAccounts[0];}
 if((providedAccountId!=null||providedExternalAccountId)&&!account)return undefined;
 let candidates=uploads.filter(upload=>upload.platform.toUpperCase()===platform&&Boolean(upload.external_content_id&&providerIds.has(upload.external_content_id)));
 if(account)candidates=candidates.filter(upload=>upload.account_id===account!.id);
 return candidates.length===1?candidates[0]:undefined;
}
