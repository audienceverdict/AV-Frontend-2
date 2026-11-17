import {describe,expect,it} from 'vitest';
import {groupMovieCredits,searchMovieCredits} from './movieCreditGroups';

const credits=[
 {id:'cast-1',creditType:'CAST',department:'ACTING',roleTitle:'Lead',person:{fullName:'Asha Rao'}},
 {id:'crew-1',creditType:'CREW',department:'DIRECTING',roleTitle:'Director',person:{fullName:'Dev Kumar'}},
 {id:'crew-2',creditType:'CREW',department:'CINEMATOGRAPHY',roleTitle:'DOP',person:{fullName:'Mira Das'}},
 {id:'crew-3',creditType:'CREW',department:'UNLISTED_DEPARTMENT',roleTitle:'Specialist',person:{fullName:'Sam Lee'}},
];

describe('movie credit departments',()=>{
 it('groups credits into the required departments and keeps unknown departments',()=>{
  const groups=groupMovieCredits(credits);
  expect(groups.find(group=>group.id==='cast')?.credits.map(item=>item.id)).toEqual(['cast-1']);
  expect(groups.find(group=>group.id==='direction')?.credits.map(item=>item.id)).toEqual(['crew-1']);
  expect(groups.find(group=>group.id==='camera')?.credits.map(item=>item.id)).toEqual(['crew-2']);
  expect(groups.find(group=>group.id==='other-crew')?.credits.map(item=>item.id)).toEqual(['crew-3']);
 });

 it('combines department and text filters',()=>{
  expect(searchMovieCredits(credits,'mira','camera').map(item=>item.id)).toEqual(['crew-2']);
  expect(searchMovieCredits(credits,'lead','direction')).toEqual([]);
 });
});
