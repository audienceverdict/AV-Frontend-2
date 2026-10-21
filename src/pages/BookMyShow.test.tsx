// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {AppProvider} from '../context/AppContext';
import {authService} from '../services/auth';
import {BookMyShow} from './BookMyShow';

const showId='930f7072-c02f-4823-994b-5dd97270c895';
const seatId='e2fea446-ac8a-42c3-bfc3-53f534dfbfc5';
const movieId='movie-a';
const theatreId='theatre-a';
const screenId='screen-a';
let container:HTMLDivElement;let root:Root;

beforeEach(()=>{
 (globalThis as Record<string,unknown>).IS_REACT_ACT_ENVIRONMENT=true;
 localStorage.clear();sessionStorage.clear();authService.logout();
 sessionStorage.setItem('av_location_enabled','true');
 localStorage.setItem('av_access_token','test-token');
 Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition:(success:PositionCallback)=>success({coords:{latitude:0,longitude:0} as GeolocationCoordinates,timestamp:Date.now(),toJSON:()=>({})})}});
 Element.prototype.scrollIntoView=vi.fn();
 container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();authService.logout();vi.unstubAllGlobals();});

async function click(node:Element){await act(async()=>{node.dispatchEvent(new MouseEvent('click',{bubbles:true}));});}
async function flush(){await act(async()=>{await new Promise(resolve=>setTimeout(resolve,25));});}

it('shows A10 while sending its backend ID in hold and booking requests',async()=>{
 const requests:{url:string;method:string;body:any}[]=[];
 const user={id:'user-a',name:'Giri',email:'giri@example.com',mobile:'9876543210',role:'USER',enabled:true,createdAt:'2026-01-01T00:00:00Z'};
 const movie={id:movieId,title:'Test Film',posterUrl:'',genres:['Drama'],language:'TELUGU',duration:110,releaseDate:'2026-01-01',certification:'U',director:'',cast:[],production:'',synopsis:'',externalTrailerUrl:'',status:'ACTIVE'};
 const theatre={id:theatreId,name:'Test Cinemas',address:'Main Road',city:'Hyderabad',state:'Telangana',status:'ACTIVE'};
 const show={id:showId,movieId,theatreId,screenId,date:'2099-10-13',startTime:'18:00:00',endTime:'21:00:00',ticketType:'FREE',ticketPrice:0,maxTicketsPerMobile:4,holdMinutes:1,layoutVersion:2,seatPrices:{REGULAR:250},requireAdminConfirmation:false,status:'OPEN'};
 const availability={availableSeatCount:1,layout:{seats:[
  {id:seatId,label:'A10',rowNumber:1,columnNumber:10,category:'REGULAR',color:'#8B7A91',disabled:false,state:'AVAILABLE',clickable:true,holdExpiresAt:null},
  {id:'not-clickable-id',label:'A11',rowNumber:1,columnNumber:11,category:'REGULAR',color:'#8B7A91',disabled:false,state:'HELD',clickable:false,holdExpiresAt:null}
 ],version:{id:'version-a',name:'Layout V2'}},screen:{id:screenId,name:'Screen 1',rows:6,seatsPerRow:11},show,bookedSeatIds:[],reservedSeatIds:[],heldSeatIds:[]};
 const fetchMock=vi.fn(async(input:string|URL|Request,init:RequestInit={})=>{
  const url=String(input);const method=init.method||'GET';const body=init.body?JSON.parse(String(init.body)):null;requests.push({url,method,body});
  let response:any={};
  if(url.endsWith('/movies?size=200'))response={content:[movie]};
  else if(url.endsWith('/theatres?size=200'))response={content:[theatre]};
  else if(url.endsWith('/shows'))response=[show];
  else if(url.endsWith('/reviews'))response=[];
  else if(url.endsWith('/auth/me'))response=user;
  else if(url.endsWith(`/theatres/${theatreId}/screens`))response={content:[]};
  else if(url.endsWith(`/waiting-list/shows/${showId}/my-offer`))response=null;
  else if(url.endsWith(`/shows/${showId}/availability`))response=availability;
  else if(url.includes('/bookings/seat-holds?'))response=[];
  else if(url.endsWith('/bookings/seat-holds'))response=[{expiresAt:new Date(Date.now()+60_000).toISOString()}];
  else if(url.endsWith('/bookings/seat-holds/release'))response={};
  else if(url.endsWith('/bookings'))response={id:'booking-a',userId:user.id,showId,seatIds:[seatId],ticketCount:1,totalAmount:0,status:'CONFIRMED',confirmationStatus:'AUTO',createdAt:'2099-01-01T00:00:00Z',attended:false,movie:movie.title,theatre:theatre.name,screen:'Screen 1',date:show.date,time:show.startTime,mobile:user.mobile,email:user.email};
  else throw new Error(`Unexpected request ${method} ${url}`);
  return new Response(JSON.stringify(response),{status:200,headers:{'Content-Type':'application/json'}});
 });
 vi.stubGlobal('fetch',fetchMock);
 await act(async()=>root.render(<AppProvider><MemoryRouter initialEntries={[`/movie/${movieId}/book`]}><Routes><Route path="/movie/:movieId/book" element={<BookMyShow/>}/><Route path="/booking/:bookingId" element={<p>Booking complete</p>}/></Routes></MemoryRouter></AppProvider>));
 await flush();

 const showButton=Array.from(container.querySelectorAll<HTMLButtonElement>('.booking-times button')).find(button=>button.textContent?.includes('18:00'))!;
 expect(showButton).toBeTruthy();await click(showButton);await flush();
 const a10=container.querySelector<HTMLButtonElement>('button[aria-label^="A10,"]')!;
 const a11=container.querySelector<HTMLButtonElement>('button[aria-label^="A11,"]')!;
 expect(a10.textContent).toBe('A10');expect(a10.disabled).toBe(false);expect(a11.disabled).toBe(true);
 await click(a11);expect(requests.filter(request=>request.url.endsWith('/bookings/seat-holds'))).toHaveLength(0);
 await click(a10);await flush();
 expect(container.textContent).toContain('A10');
 await click(container.querySelector('aside .booking-proceed')!);
 await flush();
 const hold=requests.find(request=>request.method==='POST'&&request.url.endsWith('/bookings/seat-holds'))!;
 expect(hold.body).toEqual({showId,seatIds:[seatId]});

 const terms=Array.from(container.querySelectorAll<HTMLButtonElement>('.terms-pagination button'));
 for(const [index,button] of terms.entries()){
  await click(button);
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,1500));});
  await flush();
  const term=container.querySelectorAll<HTMLElement>('.booking-term-card')[index];
  const checkbox=term.querySelector<HTMLInputElement>('.booking-term-accept input')!;
  expect(checkbox.disabled).toBe(false);
  await click(checkbox);
 }
 await click(container.querySelector('.terms-confirm-action .booking-proceed')!);await flush();
 const booking=requests.find(request=>request.method==='POST'&&request.url.endsWith('/bookings'))!;
 expect(booking.body).toMatchObject({showId,seatIds:[seatId],termsAccepted:true});
 expect(container.textContent).toContain('Booking complete');
},15000);
