// @vitest-environment jsdom
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {socialMedia} from './socialMedia';

beforeEach(()=>{
 localStorage.clear();
 sessionStorage.clear();
 localStorage.setItem('av_access_token','audience-session-token');
});
afterEach(()=>vi.unstubAllGlobals());

describe('audience video self-assignment',()=>{
 it('posts application video IDs to the authenticated self-assignment route',async()=>{
  const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({created:1,alreadyAssigned:0}),{status:200,headers:{'Content-Type':'application/json'}}));
  vi.stubGlobal('fetch',fetchMock);

  const result=await socialMedia.selfAssign(['application-video-42']);

  expect(result).toEqual({created:1,alreadyAssigned:0});
  expect(String(fetchMock.mock.calls[0][0])).toContain('/api/v1/social/me/video-assignments');
  expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({videoIds:['application-video-42']});
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer audience-session-token');
 });
});
