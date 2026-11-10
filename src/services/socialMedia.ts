import {backendRequest,backendUpload} from './api';

export type Platform='INSTAGRAM'|'FACEBOOK'|'YOUTUBE'|string;
export interface ApplicationVideo {id:string;title:string;description?:string;created_at?:string;updated_at?:string}
export interface Upload {id:number;platform:Platform;account_id?:number;external_content_id?:string;title?:string;permalink?:string;engagement_metadata?:string;retrieved_at?:string;video_id?:string;video_title?:string}
export interface Account {id:number;platform:Platform;external_account_id?:string;account_name?:string;enabled?:boolean}
export interface Comment {id:number;content_id?:number;external_comment_id?:string;parent_external_id?:string;author_id?:string;author_name?:string;comment_text?:string;published_at?:string;provider_updated_at?:string;retrieved_at?:string;like_count?:number;reply_count?:number;resolved_at?:string;resolved_by?:string;platform?:Platform;account_id?:number;external_content_id?:string;permalink?:string;external_account_id?:string;account_name?:string}
export interface ReplyJob {id:string;comment_id:number;request_key?:string;reply_text:string;actor?:string;status:string;external_reply_id?:string;reconciled_by?:string;error_message?:string;attempts?:number;next_attempt_at?:string;started_at?:string;created_at?:string;updated_at?:string}
export interface SavedContent {id:string;title:string;caption?:string;content_type?:string;media_type?:string;media_size?:number;youtube_privacy?:string;created_at?:string;publications?:Publication[]}
export interface Publication {id:string;platform:string;external_account_id?:string;status:string;external_content_id?:string;permalink?:string;error_message?:string;attempts?:number;updated_at?:string}
export interface CommentSyncTask {id:number;content_id:number;parent_external_id?:string;page_cursor?:string;status?:string;due_at?:string;last_success_at?:string;error_message?:string;pages_fetched?:number}
export interface AssignmentAudit {id:number;content_id:number;old_video_id?:string;new_video_id?:string;changed_at?:string}
export interface MetricTask {task_id:number;account_id?:number;content_id?:number;platform:string;operation:string;enabled?:boolean;status:string;last_attempt_at?:string;last_success_at?:string;due_at?:string;error_message?:string;result?:Record<string,unknown>}
export interface MetricSnapshot {id:number;task_id?:number;account_id?:number;content_id?:number;platform:string;operation:string;snapshot_bucket?:string;observed_at?:string;window_from?:string;window_to?:string;result?:Record<string,unknown>}
export type PostCategory = {topic:'MOVIE';movieName:string}|{topic:'AV';applicationVideoName:string};
export interface CreateContentMetadata {title:string;caption:string;type:'TEXT'|'IMAGE'|'VIDEO';draft:boolean;youtubePrivacy?:'public'|'private'|'unlisted';category:PostCategory}
export interface PendingContentUpload {key:string;metadata:CreateContentMetadata;applicationVideoId?:string;file?:File}
export interface PortalVideoAsset {mediaUrl:string;mediaType?:string;type?:string;mimeType?:string;thumbnailUrl?:string;position?:number;order?:number}
export interface PortalVideo {id:string|number;platform:string;title?:string;caption?:string;tags?:string|string[];thumbnailUrl?:string;permalink?:string;assets?:PortalVideoAsset[];createdAt?:string;publishedAt?:string;accountName?:string;accountId?:number;account_id?:number;externalAccountId?:string;external_account_id?:string;movieTitle?:string;topic?:'MOVIE'|'AV';categoryName?:string;applicationVideoName?:string;approvalStatus?:string;assigned?:boolean;isAssigned?:boolean;assignedToUser?:boolean;applicationVideoId?:string;application_video_id?:string;videoId?:string;video_id?:string;applicationVideo?:{id?:string|number;title?:string};assignmentStatus?:string;contentId?:string|number;content_id?:string|number;externalContentId?:string;external_content_id?:string;engagement_metadata?:string|Record<string,unknown>;views?:number;viewCount?:number;view_count?:number;likes?:number;likeCount?:number;like_count?:number;comments?:number;commentCount?:number;comment_count?:number;shares?:number;shareCount?:number;share_count?:number;reach?:number;impressions?:number;assignedUserId?:string|number;recipientUserId?:string|number;assignedUserIds?:Array<string|number>;recipientUserIds?:Array<string|number>;assignedUsers?:Array<{id?:string|number;mobile?:string;name?:string}>;recipients?:Array<{id?:string|number;mobile?:string;name?:string}>}
export interface PortalVideoPage {items:PortalVideo[];page:number;size:number;totalElements:number;totalPages:number;hasNext:boolean}
export interface AudienceAssignmentUpload {id:number|string;platform?:string;platformName?:string;platform_name?:string;title?:string;uploadTitle?:string;upload_title?:string;permalink?:string;permalinkUrl?:string;permalink_url?:string;thumbnailUrl?:string;thumbnail_url?:string;mediaUrl?:string;media_url?:string;assets?:PortalVideoAsset[];caption?:string;accountName?:string;account_name?:string;views?:number;likes?:number;comments?:number;shares?:number;engagement_metadata?:string|Record<string,unknown>;[key:string]:unknown}
export interface VideoAssignment {id:string|number;userId?:string|number;assignedBy?:string;source?:string;videoId?:string|number;video_id?:string|number;applicationVideoId?:string|number;application_video_id?:string|number;video?:ApplicationVideo;applicationVideo?:ApplicationVideo;videoTitle?:string;applicationVideoName?:string;title?:string;description?:string;uploads?:AudienceAssignmentUpload[];assignedAt?:string;createdAt?:string;status?:string}
export interface VideoAssignmentPage {items:VideoAssignment[];page:number;size:number;totalElements:number;totalPages:number;hasNext:boolean}

// Remove recipient data written by an earlier UI-only implementation. Assignments
// must come from backend APIs; browser storage is never an assignment source.
try{globalThis.localStorage?.removeItem('av_social_upload_recipients_v1')}catch{}

/** Social Media Operator API calls. Administrator-only operations use the existing session JWT. */
async function operatorRequest<T>(path:string,init:RequestInit={},responseType:'json'|'blob'='json'):Promise<T>{
 const backendPath=path.replace(/^\/api(?=\/)/,'');
 return backendRequest<T>(`/social${backendPath}`,init,responseType);
}
function uploadDatabase():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{if(typeof indexedDB==='undefined'){reject(new Error('This browser cannot keep an upload ready to resume after refresh.'));return;}const request=indexedDB.open('av-social-publishing',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('pending'))request.result.createObjectStore('pending');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('Could not open persistent upload storage.'));});}
export async function savePendingContentUpload(upload:PendingContentUpload){const db=await uploadDatabase();await new Promise<void>((resolve,reject)=>{const transaction=db.transaction('pending','readwrite');transaction.objectStore('pending').put(upload,'active');transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error||new Error('Could not save the upload for refresh recovery.'));transaction.onabort=()=>reject(transaction.error||new Error('Upload recovery save was interrupted.'));});db.close();}
export async function getPendingContentUpload():Promise<PendingContentUpload|null>{const db=await uploadDatabase();const value=await new Promise<PendingContentUpload|null>((resolve,reject)=>{const request=db.transaction('pending','readonly').objectStore('pending').get('active');request.onsuccess=()=>resolve((request.result as PendingContentUpload|undefined)||null);request.onerror=()=>reject(request.error||new Error('Could not read the saved upload.'));});db.close();return value;}
export async function clearPendingContentUpload(){const db=await uploadDatabase();await new Promise<void>((resolve,reject)=>{const transaction=db.transaction('pending','readwrite');transaction.objectStore('pending').delete('active');transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error||new Error('Could not clear the recovered upload.'));});db.close();}
const enc=(value:string|number)=>encodeURIComponent(String(value));
const operatorPath=(path:string)=>`/social${path.replace(/^\/api(?=\/)/,'')}`;
const page=(params:{offset?:number;limit?:number})=>`?offset=${params.offset??0}&limit=${params.limit??50}`;
const cursor=(params:{afterId?:number;limit?:number})=>`?afterId=${params.afterId??0}&limit=${params.limit??100}`;
async function allOffsetPages<T>(load:(offset:number,limit:number)=>Promise<T[]>,limit=200){const rows:T[]=[];for(let offset=0;;offset+=limit){const pageRows=await load(offset,limit);rows.push(...pageRows);if(pageRows.length<limit)break;}return rows;}
export const socialMedia={
 createAssignments:(videoIds:string[],userIds:string[])=>operatorRequest<{created:number;alreadyAssigned:number}>('/api/video-assignments',{method:'POST',body:JSON.stringify({videoIds,userIds})}),
 selfAssign:(videoIds:string[])=>operatorRequest<{created:number;alreadyAssigned:number}>('/api/me/video-assignments',{method:'POST',body:JSON.stringify({videoIds})}),
 selfUnassign:(videoIds:string[])=>operatorRequest<{removed:number;alreadyUnassigned:number}>('/api/me/video-assignments',{method:'DELETE',body:JSON.stringify({videoIds})}),
 myVideoAssignments:(pageNumber=0,size=20)=>operatorRequest<VideoAssignmentPage>(`/api/me/video-assignments?page=${pageNumber}&size=${size}`),
 allVideoAssignments:(pageNumber=0,size=20,filters:{userId?:string;videoId?:string;assignedBy?:string;source?:string}={})=>{const query=new URLSearchParams({page:String(pageNumber),size:String(size)});for(const [key,value] of Object.entries(filters))if(value)query.set(key,value);return operatorRequest<VideoAssignmentPage>(`/api/video-assignments?${query.toString()}`);},
 adminUnassign:(videoIds:string[],userIds:string[])=>operatorRequest<{removed:number;alreadyUnassigned:number}>('/api/video-assignments',{method:'DELETE',body:JSON.stringify({videoIds,userIds})}),
 userVideoAssignments:(userId:string|number,pageNumber=0,size=20)=>operatorRequest<VideoAssignmentPage>(`/api/users/${enc(userId)}/video-assignments?page=${pageNumber}&size=${size}`),
 videoAssignedUsers:(videoId:string|number,pageNumber=0,size=20)=>operatorRequest<VideoAssignmentPage>(`/api/videos/${enc(videoId)}/assigned-users?page=${pageNumber}&size=${size}`),
 portalVideos:(pageNumber=0,size=20,platform?:string,filter?:{topic?:'MOVIE'|'AV';categoryName?:string})=>{const query=new URLSearchParams({page:String(pageNumber),size:String(size)});if(platform)query.set('platform',platform.toLowerCase());if(filter?.topic)query.set('topic',filter.topic);if(filter?.categoryName)query.set('categoryName',filter.categoryName);return operatorRequest<PortalVideoPage>(`/api/portal/videos?${query.toString()}`);},
 videos:(offset=0,limit=50)=>operatorRequest<ApplicationVideo[]>(`/api/videos${page({offset,limit})}`),
 allVideos:()=>allOffsetPages((offset,limit)=>socialMedia.videos(offset,limit),200),
 createVideo:(payload:{title:string;description?:string})=>operatorRequest<ApplicationVideo>('/api/videos',{method:'POST',body:JSON.stringify(payload)}),
 video:(id:string)=>operatorRequest<ApplicationVideo>(`/api/videos/${enc(id)}`),
 unassigned:(offset=0,limit=50,platform?:string)=>{const query=new URLSearchParams();if(platform)query.set('platform',platform);query.set('offset',String(offset));query.set('limit',String(limit));return operatorRequest<Upload[]>(`/api/uploads/unassigned?${query.toString()}`);},
 uploads:(videoId:string)=>operatorRequest<Upload[]>(`/api/videos/${enc(videoId)}/uploads`),
 allUploads:async()=>{const videos=await allOffsetPages((offset,limit)=>socialMedia.videos(offset,limit),200);const assigned:Upload[]=[];for(let index=0;index<videos.length;index+=8){const groups=await Promise.all(videos.slice(index,index+8).map(async video=>(await socialMedia.uploads(video.id)).map(upload=>({...upload,video_id:video.id,video_title:video.title}))));assigned.push(...groups.flat());}return [...new Map(assigned.map(upload=>[upload.id,upload])).values()];},
 assignedUploads:async()=>{const videos=await allOffsetPages((offset,limit)=>socialMedia.videos(offset,limit));const assigned:Array<{video:ApplicationVideo;upload:Upload}>=[];for(let index=0;index<videos.length;index+=8){const groups=await Promise.all(videos.slice(index,index+8).map(async video=>(await socialMedia.uploads(video.id)).map(upload=>({video,upload}))));assigned.push(...groups.flat());}return [...new Map(assigned.map(row=>[`${row.video.id}:${row.upload.id}`,row])).values()];},
 assign:(videoId:string,contentId:number)=>operatorRequest<void>(`/api/videos/${enc(videoId)}/uploads/${enc(contentId)}`,{method:'PUT'}),
 unlink:(videoId:string,contentId:number)=>operatorRequest<void>(`/api/videos/${enc(videoId)}/uploads/${enc(contentId)}`,{method:'DELETE'}),
 reassign:(videoId:string,contentId:number)=>operatorRequest<void>(`/api/videos/${enc(videoId)}/uploads/${enc(contentId)}/reassign`,{method:'PUT'}),
 accounts:()=>operatorRequest<Account[]>('/api/statistics/accounts'),
 // GET /api/comments uses the exclusive local comment ID cursor. Keep the
 // optional filters absent unless supplied, and constrain the page size to
 // the backend's documented 1-200 range.
 comments:(filters:{platform?:string;accountId?:number;videoId?:string;needsReply?:boolean;afterId?:number;limit?:number}={})=>{const query=new URLSearchParams();if(filters.platform)query.set('platform',filters.platform);if(filters.accountId!==undefined)query.set('accountId',String(filters.accountId));if(filters.videoId)query.set('videoId',filters.videoId);if(filters.needsReply!==undefined)query.set('needsReply',String(filters.needsReply));query.set('afterId',String(Math.max(0,Math.trunc(filters.afterId??0))));query.set('limit',String(Math.min(200,Math.max(1,Math.trunc(filters.limit??50)))));return operatorRequest<Comment[]>(`/api/comments?${query.toString()}`);},
 createComment:(uploadId:number,text:string,key=`comment-${crypto.randomUUID()}`)=>operatorRequest<Comment>(`/api/uploads/${enc(uploadId)}/comments`,{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify({text})}),
 resolve:(id:number,resolved:boolean)=>operatorRequest<void>(`/api/comments/${enc(id)}/resolution`,{method:'PUT',body:JSON.stringify({resolved})}),
 reply:(id:number,text:string,key:string)=>operatorRequest<ReplyJob>(`/api/comments/${enc(id)}/replies`,{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify({text})}),
 metrics:(videoId:string,afterId=0,limit=100)=>operatorRequest<MetricTask[]>(`/api/videos/${enc(videoId)}/metrics${cursor({afterId,limit})}`),
 createContent:(metadata:CreateContentMetadata,file:File|undefined,idempotencyKey=`content-${crypto.randomUUID()}`,onProgress?:(percent:number)=>void)=>{const form=new FormData();form.append('metadata',new Blob([JSON.stringify(metadata)],{type:'application/json'}));if(file)form.append('file',file);return backendUpload<SavedContent>(operatorPath('/api/content'),form,{'Idempotency-Key':idempotencyKey},onProgress);},
 content:(id:string)=>operatorRequest<SavedContent>(`/api/content/${enc(id)}`),
 contentMedia:(id:string)=>operatorRequest<Blob>(`/api/content/${enc(id)}/media`,{},'blob'),
 publish:(id:string)=>operatorRequest<SavedContent>(`/api/content/${enc(id)}/publish`,{method:'POST'}),
 retryPublication:(id:string)=>operatorRequest<void>(`/api/publications/${enc(id)}/retry`,{method:'POST'}),
 commentThread:(id:number)=>operatorRequest<{comment:Comment;comments:Comment[];replies:ReplyJob[]}>(`/api/comments/${enc(id)}/thread`),
 getReply:(id:string)=>operatorRequest<ReplyJob>(`/api/comment-replies/${enc(id)}`),
 confirmReply:(id:string,externalReplyId:string)=>operatorRequest<void>(`/api/comment-replies/${enc(id)}/confirm`,{method:'POST',body:JSON.stringify({externalReplyId})}),
 retryReply:(id:string)=>operatorRequest<void>(`/api/comment-replies/${enc(id)}/retry`,{method:'POST'}),
 assignmentAudit:(id:string,offset=0,limit=50)=>operatorRequest<AssignmentAudit[]>(`/api/videos/${enc(id)}/assignment-audit${page({offset,limit})}`),
 commentSync:(id:string)=>operatorRequest<CommentSyncTask[]>(`/api/videos/${enc(id)}/comment-sync`),
 resetCommentSync:(id:number)=>operatorRequest<void>(`/api/uploads/${enc(id)}/comment-sync/reset`,{method:'POST'}),
 videoComments:(id:string,afterId=0,limit=50)=>operatorRequest<Comment[]>(`/api/videos/${enc(id)}/comments${cursor({afterId,limit:Math.min(limit,200)})}`),
 uploadMetrics:(id:number,afterId=0,limit=100)=>operatorRequest<MetricTask[]>(`/api/uploads/${enc(id)}/metrics${cursor({afterId,limit})}`),
 allUploadMetrics:async(id:number)=>{const rows:MetricTask[]=[];let afterId=0;for(let pageNo=0;pageNo<100;pageNo++){const batch=await socialMedia.uploadMetrics(id,afterId,100);rows.push(...batch);if(batch.length<100)break;const next=batch.at(-1)?.task_id??afterId;if(next<=afterId)break;afterId=next;}return rows;},
 accountMetrics:(id:number,afterId=0,limit=100)=>operatorRequest<MetricTask[]>(`/api/accounts/${enc(id)}/metrics${cursor({afterId,limit})}`),
 videoMetricHistory:(id:string,afterId=0,limit=100)=>operatorRequest<MetricSnapshot[]>(`/api/videos/${enc(id)}/metrics/history${cursor({afterId,limit})}`),
 uploadMetricHistory:(id:number,afterId=0,limit=100)=>operatorRequest<MetricSnapshot[]>(`/api/uploads/${enc(id)}/metrics/history${cursor({afterId,limit})}`),
 allUploadMetricHistory:async(id:number)=>{const rows:MetricSnapshot[]=[];let afterId=0;for(let pageNo=0;pageNo<100;pageNo++){const batch=await socialMedia.uploadMetricHistory(id,afterId,100);rows.push(...batch);if(batch.length<100)break;const next=batch.at(-1)?.id??afterId;if(next<=afterId)break;afterId=next;}return rows;},
 accountMetricHistory:(id:number,afterId=0,limit=100)=>operatorRequest<MetricSnapshot[]>(`/api/accounts/${enc(id)}/metrics/history${cursor({afterId,limit})}`),
};
