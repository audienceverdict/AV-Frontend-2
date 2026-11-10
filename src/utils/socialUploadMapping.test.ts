import {describe,expect,it} from 'vitest';
import type {Account,PortalVideo,Upload} from '../services/socialMedia';
import {permalinkContentId,resolveLocalUpload} from './socialUploadMapping';

const accounts:Account[]=[
 {id:11,platform:'YOUTUBE',external_account_id:'yt-channel',account_name:'YouTube'},
 {id:22,platform:'INSTAGRAM',external_account_id:'ig-account',account_name:'Instagram'},
 {id:33,platform:'FACEBOOK',external_account_id:'fb-page',account_name:'Facebook'}
];
const uploads:Upload[]=[
 {id:101,platform:'YOUTUBE',account_id:11,external_content_id:'yt-video-1'},
 {id:202,platform:'INSTAGRAM',account_id:22,external_content_id:'ig-shortcode'},
 {id:303,platform:'FACEBOOK',account_id:33,external_content_id:'fb-post-3'}
];

describe('social feed to local upload ID mapping',()=>{
 it('maps a YouTube provider ID to the local numeric upload ID',()=>{
  const post:PortalVideo={id:'yt-video-1',platform:'YOUTUBE',account_id:11};
  expect(resolveLocalUpload(post,uploads,accounts)?.id).toBe(101);
 });

 it('extracts an Instagram shortcode from its permalink and returns the local upload ID',()=>{
  expect(permalinkContentId('INSTAGRAM','https://www.instagram.com/reel/ig-shortcode/')).toBe('ig-shortcode');
  const post:PortalVideo={id:'feed-row-2',platform:'INSTAGRAM',permalink:'https://www.instagram.com/reel/ig-shortcode/',external_account_id:'ig-account'};
  expect(resolveLocalUpload(post,uploads,accounts)?.id).toBe(202);
 });

 it('extracts a Facebook story ID from its permalink and returns the local upload ID',()=>{
  expect(permalinkContentId('FACEBOOK','https://www.facebook.com/page/posts/fb-post-3')).toBe('fb-post-3');
  const post:PortalVideo={id:'feed-row-3',platform:'FACEBOOK',permalink:'https://www.facebook.com/page/posts/fb-post-3',accountName:'Facebook'};
  expect(resolveLocalUpload(post,uploads,accounts)?.id).toBe(303);
 });

 it('does not use a title or an ambiguous provider ID as a mapping',()=>{
  const duplicate:Upload={id:404,platform:'YOUTUBE',account_id:99,external_content_id:'yt-video-1'};
  expect(resolveLocalUpload({id:'feed',platform:'YOUTUBE',title:'same title'},uploads,accounts)).toBeUndefined();
  expect(resolveLocalUpload({id:'yt-video-1',platform:'YOUTUBE'},[...uploads,duplicate],accounts)).toBeUndefined();
 });
});
