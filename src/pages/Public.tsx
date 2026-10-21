import {useEffect,useRef,useState,type ChangeEvent} from 'react';
import {Link,useLocation,useNavigate,useParams,useSearchParams} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,Play,Star,Ticket,MessageSquare,Users,Film,Search,Check,Globe,Heart,Eye,BarChart3,FileText,Megaphone,CalendarDays,RotateCcw,UserRound,Ban,ShieldCheck,LockKeyhole,ChevronDown,ExternalLink,Image as ImageIcon,Clapperboard,Info,UsersRound,MessageCircle,Instagram,Facebook,Youtube,Twitter,Building2,Coins,Activity,MapPin,X} from 'lucide-react';
import {useApp} from '../context/AppContext';
import {MovieCard,SectionHeading,ReviewCard,Empty,Poster,Video,MediaImage,Modal,date} from '../components/Common';
import {getAvailableSeatCount,getWaitingList,resolveMediaImageUrl} from '../services/api';
import {brandImages, heroBrandImage} from '../data/brandImages';
import {featuredFilmVideo,operatingSystemPages,operatingSystemImageTitles,frameworkChapters} from '../data/operatingSystemAssets';
import moviesHeroImage from '../../images/movies-discovery-hero.png?url';
import homeConceptImage from '../../images/WhatsApp Image 2026-09-28 at 1.38.08 PM.jpeg?url';
import aboutCinemaHero from '../../images/about-cinema-hero.png?url';
import aboutProductionArt from '../../images/about-film-production.png?url';
import aavFrameworkClosingImage from '../../images/aav-framework-closing.png?url';
import {embedUrl,listMovieCredits,listMovieMedia,resolveMediaUrl} from '../services/api';
import type {Movie,Review} from '../types';
import {filterMovies,paginateMovies} from '../services/movieCatalog';
export function Home(){
 const {data,user}=useApp();
 const navigate=useNavigate();
 const [homeSearch,setHomeSearch]=useState('');
 const [trailer,setTrailer]=useState(false);
 const [slide,setSlide]=useState(0);
 const [waitlistAlerts,setWaitlistAlerts]=useState<any[]>([]);
 const [dismissedOffers,setDismissedOffers]=useState<string[]>([]);
 const movies=[...data.movies].reverse().sort((a,b)=>{
  const aCreated='createdAt' in a&&typeof a.createdAt==='string'?Date.parse(a.createdAt):NaN;
  const bCreated='createdAt' in b&&typeof b.createdAt==='string'?Date.parse(b.createdAt):NaN;
  return Number.isFinite(aCreated)&&Number.isFinite(bCreated)?bCreated-aCreated:0;
 });
 const featured=movies.find(movie=>movie.status==='ACTIVE')||movies[0];
 const spotlightMovies=movies.slice(0,5);
 const heroMovies=movies.slice(0,4);
 const posterSlides=heroMovies.flatMap(movie=>[...new Set([movie.posterUrl,...(movie.posterImages||[])].filter(Boolean))].map(posterUrl=>({movie,posterUrl})));
 useEffect(()=>{
  if(posterSlides.length<2)return;
  const timer=window.setInterval(()=>setSlide(current=>(current+1)%posterSlides.length),5000);
  return()=>window.clearInterval(timer);
 },[posterSlides.length]);
 const active=posterSlides[slide]?.movie||featured;
 useEffect(()=>{if(!user){setWaitlistAlerts([]);return;}let active=true;const refresh=async()=>{try{const entries=await getWaitingList();const waiting=entries.filter((entry:any)=>['WAITING','OFFERED'].includes(String(entry.status).toUpperCase()));const showIds=[...new Set(waiting.map((entry:any)=>String(entry.showId)))];const counts=await Promise.all(showIds.map(async showId=>[showId,await getAvailableSeatCount(showId)] as const));const available=new Map(counts.filter(([,count])=>count>0));const alerts=waiting.filter((entry:any)=>available.has(String(entry.showId))).map((entry:any)=>({...entry,availableSeatCount:available.get(String(entry.showId))}));if(active)setWaitlistAlerts(alerts);}catch{if(active)setWaitlistAlerts([]);}};void refresh();const timer=window.setInterval(()=>void refresh(),10000);const onVisible=()=>{if(document.visibilityState==='visible')void refresh();};document.addEventListener('visibilitychange',onVisible);return()=>{active=false;window.clearInterval(timer);document.removeEventListener('visibilitychange',onVisible);};},[user?.id]);
 return <>
      
  <section className="hero" style={active?{backgroundImage:`linear-gradient(90deg,rgba(12,13,16,.08) 0%,rgba(12,13,16,.02) 45%,transparent 100%),linear-gradient(0deg,rgba(17,17,19,.26) 0%,transparent 38%),url("${resolveMediaImageUrl(active.backdropUrl||active.posterUrl)||active.backdropUrl||active.posterUrl}")`}:undefined}>
   {!!waitlistAlerts.filter((entry:any)=>!dismissedOffers.includes(String(entry.id))).length&&<aside className="home-waitlist-offers" aria-label="Waitlist seat availability" aria-live="polite">{waitlistAlerts.filter((entry:any)=>!dismissedOffers.includes(String(entry.id))).map((entry:any)=>{const show=data.shows.find(item=>item.id===entry.showId);const movie=movies.find(item=>item.id===show?.movieId);const theatre=data.theatres.find(item=>item.id===show?.theatreId);const count=Number(entry.availableSeatCount)||0;return <article className="home-waitlist-offer-card" key={entry.id}><button type="button" className="home-waitlist-dismiss" aria-label="Dismiss seat availability alert" onClick={()=>setDismissedOffers(current=>[...current,String(entry.id)])}><X size={20}/></button><span className="eyebrow"><Ticket size={20}/> WAITLIST SEAT ALERT</span><h2>Seats are available for your show</h2><p>{movie?.title||'Your screening'}{theatre?` · ${theatre.name}`:''}{show?` · ${show.date} ${show.startTime}`:''}. {count} {count===1?'seat is':'seats are'} currently available to everyone. Check the live layout before booking.</p>{movie&&<Link className="button home-waitlist-book" to={`/movie/${movie.id}/book?show=${encodeURIComponent(show?.id||'')}&waitlistEntryId=${encodeURIComponent(entry.id)}`}>Open show and select seats <ArrowRight size={18}/></Link>}</article>;})}</aside>}
   <div className="brand-mosaic" aria-hidden="true">{brandImages.map((image,index)=><span key={image} style={{backgroundImage:`url("${image}")`,animationDelay:`-${index*.35}s`}}/>)}</div>
   <div className="hero-brand-mark" aria-hidden="true" style={{backgroundImage:`url("${heroBrandImage}")`}}/>
   <div className="hero-grain"/>
    <div className="hero-content">
    <div className="eyebrow hero-kicker"><span/> REAL AUDIENCES. REAL OPINIONS.</div>
    <h1>Every movie has a story.<br/>Every audience has<br/>a <em>verdict.</em></h1>
     <form className="home-catalog-search" role="search" aria-label="Search movies" onSubmit={event=>{event.preventDefault();navigate(`/movies${homeSearch.trim()?`?search=${encodeURIComponent(homeSearch.trim())}`:''}`);}}><label><Search size={18}/><input aria-label="Search movie titles" placeholder="Search movies, cast, or director" value={homeSearch} onChange={event=>setHomeSearch(event.target.value)}/></label><button className="button" type="submit">Find a movie <ArrowRight size={16}/></button></form>
   </div>
   <div className="hero-movie-carousel" aria-label="Recently added movies">
    {active?<>
     <div className="hero-movie-slides">{posterSlides.map(({movie,posterUrl},index)=><div key={`${movie.id}-${index}`} className={`hero-movie-slide ${index===slide?'active':''}`} aria-hidden={index!==slide}>
      <Link to={`/movie/${movie.id}`} className="hero-movie-detail-link" aria-label={`View ${movie.title}`} tabIndex={index===slide?0:-1}>
       <MediaImage className="hero-movie-poster" url={posterUrl} alt={`${movie.title} poster ${index+1}`} showFallbackLink={false}/>
       <span className="hero-movie-shade"/>
       <span className="hero-movie-info"><small>{movie.status==='ACTIVE'?'NOW SHOWING':movie.status==='UPCOMING'?'COMING SOON':'MOVIE SPOTLIGHT'}</small><strong>{movie.title}</strong><span>{movie.genre.join(' Ã‚Â· ')}</span></span>
      </Link>
      <Link to={`/movie/${movie.id}/book`} className="hero-poster-book" tabIndex={index===slide?0:-1}><Ticket size={18}/> Book Your Ticket Free <ArrowUpRight size={18}/></Link>
     </div>)}</div>
     {posterSlides.length>1&&<div className="hero-movie-dots" aria-label="Choose movie">{posterSlides.map(({movie},index)=><button type="button" key={`${movie.id}-${index}`} className={index===slide?'active':''} aria-label={`Show ${movie.title}`} aria-pressed={index===slide} onClick={()=>setSlide(index)}/>)}</div>}
     {active.trailerUrl&&<button className="hero-movie-trailer" type="button" aria-label={`Watch ${active.title} trailer`} onClick={()=>setTrailer(true)}><Play size={16} fill="currentColor"/></button>}
    </>:<div className="hero-empty-slide"><Film size={34}/><strong>New movies</strong><span>Recently added films will appear here.</span></div>}
   </div>
   {trailer&&active&&<Modal title={`${active.title} Ã¢â‚¬â€ Trailer`} onClose={()=>setTrailer(false)}><Video url={active.trailerUrl} title={`${active.title} trailer`}/></Modal>}
  </section>
  <div className="value-strip"><span><Users size={18}/> Real people. Honest opinions.</span><i/><span><Ticket size={18}/> More than a movie ticket.</span><i/><span><MessageSquare size={18}/> Your voice. The audience verdict.</span></div>
  
  {!!movies.length&&<section className="home-movie-ticker" aria-label="Movies at Audience Verdict"><span className="home-movie-ticker-label">NOW SHOWING</span><div className="home-movie-ticker-window"><div className="home-movie-ticker-track">{[...movies,...movies].map((movie,index)=><Link key={`${movie.id}-${index}`} to={`/movie/${movie.id}`}><Film size={15}/>{movie.title}<span>Ã¢â‚¬Â¢</span></Link>)}</div></div></section>}
  <div className="container"><section className="section"><SectionHeading eyebrow="YOUR NEXT BIG-SCREEN EXPERIENCE" title="In the spotlight" description="Discover the films. Feel the experience. Make your verdict count." to="/movies" link="Explore all movies"/><div className="movie-grid">{spotlightMovies.map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div>{!data.movies.length&&<Empty title="No movies are currently available."/>}</section><section className="concept-panel"><div className="concept-art"><img src={homeConceptImage} alt="Antahkarana Audience Verdict Ã¢â‚¬â€ We show. You decide."/></div><div className="concept-copy"><div className="eyebrow">NOT JUST WATCHED. EXPERIENCED.</div><h2>The credits roll.<br/>The conversation begins.</h2><p>A great movie doesn't end at the screen. Audience Verdict brings real movie lovers together to experience films, share honest opinions, and discover what audiences really think.</p><Link to="/audience-verdict" className="button concept-learn-more">Learn more <ArrowUpRight size={17}/></Link></div></section><HomeCollections movies={movies} reviews={data.reviews}/><section className="section"><SectionHeading eyebrow="THE SPOTLIGHT IS ON YOU" title="Real voices. Unfiltered verdicts." description="See what audiences are saying across social media." to="/reviews" link="All audience reviews"/><div className="review-grid">{data.reviews.filter(review=>review.platform!=='OTHER'&&review.isHighlighted&&review.status==='APPROVED').slice(0,3).map(review=><ReviewCard key={review.id} review={review}/>)}</div>{!data.reviews.some(review=>review.platform!=='OTHER'&&review.isHighlighted&&review.status==='APPROVED')&&<p className="muted">Social media reviews from Instagram, Facebook, and YouTube will appear here soon.</p>}<div className="video-grid">{data.reviews.filter(review=>review.platform!=='OTHER'&&review.isHighlighted&&review.status==='APPROVED'&&review.videoUrl).map(review=><ReviewCard key={review.id} review={review}/>)}</div></section><HowItWorks/><section className="join-banner"><div><div className="eyebrow">THE NEXT VERDICT COULD BE YOURS</div><h2>Don't just watch it. Be part of it.</h2><p>Your next movie experience is waiting.</p></div><Link className="button" to="/movies">Find your next movie <ArrowUpRight size={18}/></Link></section></div>
 </>;
}function HomeCollections({movies,reviews}:{movies:Movie[];reviews:Review[]}){
 const active=movies.filter(movie=>movie.status==='ACTIVE').slice(0,5);const upcoming=movies.filter(movie=>movie.status==='UPCOMING').slice(0,5);
 const topRated=filterMovies(movies,{sort:'rating'},reviews).filter(movie=>reviews.some(review=>review.movieId===movie.id&&review.status==='APPROVED'&&review.platform!=='OTHER'&&review.rating>0)).slice(0,5);
 const genres=[...new Set(movies.flatMap(movie=>movie.genre||[]))].slice(0,3);
 const shelf=(title:string,eyebrow:string,items:Movie[])=>items.length?<section className="section"><SectionHeading eyebrow={eyebrow} title={title} to="/movies" link="Explore all movies"/><div className="movie-grid">{items.map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div></section>:null;
 return <>
  {shelf('Now screening','ON THE BIG SCREEN',active)}{shelf('Coming soon','UP NEXT',upcoming)}{shelf('Audience favourites','REAL AUDIENCE RATINGS',topRated)}{genres.map(genre=>shelf(genre,'EXPLORE BY GENRE',movies.filter(movie=>(movie.genre||[]).includes(genre)).slice(0,5)))}</>;
}function HowItWorks(){return <section className="section how-section"><SectionHeading eyebrow="FROM THE FIRST FRAME TO YOUR FINAL WORD" title="Your movie. Your experience. Your verdict."/><div className="steps">{[[Search,'Find your film','Discover a story that speaks to you.'],[Film,'Explore the movie','Watch the trailer. Get to know the story.'],[Ticket,'Save your seat','Choose your screening and book.'],[Play,'Live the experience','Let the big screen take you places.'],[MessageSquare,'Share your verdict','Tell the world what you think.']].map(([Icon,title,body],i)=>{const I=Icon as typeof Search;return <div className="step" key={i}><div><I size={23}/><span>0{i+1}</span></div><h3>{String(title)}</h3><p>{String(body)}</p></div>})}</div></section>}
export function Movies(){
 const {data,dataLoading,dataError,reloadData}=useApp();
 const location=useLocation();
 const catalogVisit=useRef('');
 useEffect(()=>{if(catalogVisit.current===location.key)return;catalogVisit.current=location.key;void reloadData();},[location.key]);
 const [searchParams,setSearchParams]=useSearchParams();
 const [query,setQuery]=useState(()=>searchParams.get('search')||'');
 useEffect(()=>{setQuery(searchParams.get('search')||'');setPage(0);},[searchParams]);
 const [genre,setGenre]=useState('');
 const [language,setLanguage]=useState('');
 const [certification,setCertification]=useState('');
 const [year,setYear]=useState('');
 const [status,setStatus]=useState('');
 const [sort,setSort]=useState<'featured'|'release'|'title'|'rating'>('featured');
 const [page,setPage]=useState(0);
 const matchingMovies=filterMovies(data.movies,{search:query,genre,language,certification,year,status,sort},data.reviews);
 const pagination=paginateMovies(matchingMovies,page,12);
 const movies=pagination.items;
 const change=(setter:(value:string)=>void)=>(event:ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>{setter(event.target.value);setPage(0);};
 const clearFilters=()=>{setQuery('');setGenre('');setLanguage('');setCertification('');setYear('');setStatus('');setSort('featured');setPage(0);};
 return <div className="movies-page">
  <section className="movies-hero" style={{backgroundImage:`linear-gradient(90deg,#05090ee8 0%,#05090eb0 42%,#05090e10 78%),linear-gradient(0deg,#070b10e8 0%,transparent 55%),url("${moviesHeroImage}")`}}>
   <div className="movies-hero-inner"><div className="eyebrow">A WORLD OF STORIES</div><h1>Find your <span>next movie.</span></h1><p>Big-screen experiences. Honest audience opinions. Your next favourite awaits.</p></div>
  </section>
  <section className="container movies-content" aria-label="Browse movies">
    <form className="filters movies-filters" onSubmit={event=>{event.preventDefault();setSearchParams(query.trim()?{search:query.trim()}:{});setPage(0);}}>
     <label className="search-box"><Search size={18}/><input aria-label="Search movies" placeholder="Search titles, cast, or director..." value={query} onChange={change(setQuery)}/></label>
     <select aria-label="Genre" value={genre} onChange={change(setGenre)}><option value="">All genres</option>{[...new Set(data.movies.flatMap(movie=>movie.genre||[]))].sort().map(value=><option key={value}>{value}</option>)}</select>
     <select aria-label="Language" value={language} onChange={change(setLanguage)}><option value="">All languages</option>{[...new Set(data.movies.map(movie=>movie.language).filter(Boolean))].sort().map(value=><option key={value}>{value}</option>)}</select>
     <select aria-label="Certification" value={certification} onChange={change(setCertification)}><option value="">All certifications</option>{[...new Set(data.movies.map(movie=>movie.certification).filter(Boolean))].sort().map(value=><option key={value}>{value}</option>)}</select>
     <select aria-label="Release year" value={year} onChange={change(setYear)}><option value="">All release years</option>{[...new Set(data.movies.map(movie=>movie.releaseDate?.slice(0,4)).filter(Boolean))].sort((a,b)=>b.localeCompare(a)).map(value=><option key={value}>{value}</option>)}</select>
     <select aria-label="Status" value={status} onChange={change(setStatus)}><option value="">All statuses</option><option value="ACTIVE">Now screening</option><option value="UPCOMING">Coming soon</option><option value="ENDED">Ended</option></select>
     <select aria-label="Sort movies" value={sort} onChange={event=>{setSort(event.target.value as typeof sort);setPage(0);}}><option value="featured">Featured first</option><option value="release">Newest release</option><option value="title">Title AÃ¢â‚¬â€œZ</option><option value="rating">Audience rating</option></select>
    <button className="movies-search-button" type="submit">Search <ArrowRight size={16}/></button>
   </form>
    {dataError&&<div className="catalog-load-error" role="alert"><span>We couldnÃ¢â‚¬â„¢t load the movie catalogue. {dataError}</span><button type="button" className="button secondary" onClick={()=>void reloadData()}>Retry</button></div>}
    {dataLoading?<p className="muted catalog-loading" role="status">Loading moviesÃ¢â‚¬Â¦</p>:<><p className="muted result-count">{matchingMovies.length} movies to discover</p>
    {matchingMovies.length?<><div className="movie-grid">{movies.map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div>{pagination.pages>1&&<nav className="catalog-pagination" aria-label="Movie catalogue pages"><button type="button" className="button secondary" disabled={pagination.page===0} onClick={()=>setPage(pagination.page-1)}>Previous</button><span aria-live="polite">Page {pagination.page+1} of {pagination.pages}</span><button type="button" className="button secondary" disabled={pagination.page+1>=pagination.pages} onClick={()=>setPage(pagination.page+1)}>Next</button></nav>}</>:<Empty title={dataError?'Movie catalogue is unavailable.':'No movies match your search.'}><p className="movies-empty-hint">Try adjusting your filters or search for something else.</p><button className="movies-clear-button" type="button" onClick={clearFilters}>Clear filters</button></Empty>}</>}
  </section>
  <section className="movies-benefits" aria-label="Why explore with Audience Verdict"><div className="movies-benefits-inner">
   <article><span><Film size={23}/></span><div><h2>Discover</h2><p>Explore new releases<br/>and classics</p></div></article><i/>
   <article><span><Star size={23} fill="currentColor"/></span><div><h2>Real Opinions</h2><p>See what the audience<br/>really thinks</p></div></article><i/>
   <article><span><ArrowUpRight size={23}/></span><div><h2>Make Better Choices</h2><p>Find movies that match<br/>your taste</p></div></article>
  </div></section>
 </div>;
}
function youtubeVideoId(url:string):string|null{
 try{
  const parsed=new URL(url);
  const host=parsed.hostname.replace(/^www\./,'');
  if(host==='youtu.be')return parsed.pathname.split('/').filter(Boolean)[0]||null;
  if(host==='youtube.com'||host==='m.youtube.com'||host==='youtube-nocookie.com')return parsed.searchParams.get('v')||parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1]||null;
 }catch{}
 return null;
}
function youtubeThumbnail(url:string):string|null{
 const id=youtubeVideoId(url);
 return id?`https://img.youtube.com/vi/${id}/maxresdefault.jpg`:null;
}
function safeExternalUrl(raw:string):string|null{return resolveMediaUrl(raw);}
type YouTubePlayerApi={Player:new(iframe:HTMLIFrameElement,options:{events:{onStateChange:(event:{data:number})=>void;onError:()=>void}})=>{destroy:()=>void}};
function loadYouTubePlayerApi():Promise<YouTubePlayerApi>{
 const target=window as Window&{YT?:YouTubePlayerApi;onYouTubeIframeAPIReady?:()=>void};
 if(target.YT?.Player)return Promise.resolve(target.YT);
 return new Promise(resolve=>{
  const previous=target.onYouTubeIframeAPIReady;
  target.onYouTubeIframeAPIReady=()=>{try{previous?.();}finally{if(target.YT)resolve(target.YT);}};
  if(!document.querySelector('script[data-av-youtube-api]')){
   const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.dataset.avYoutubeApi='true';document.head.appendChild(script);
  }
 });
}
export function MovieDetails(){
 const {movieId}=useParams();
 const {data,dataLoading,dataError,reloadData}=useApp();
 const movie=data.movies.find(item=>item.id===movieId);
 const [trailerPhase,setTrailerPhase]=useState<'idle'|'playing'>('idle');
 const [showFloatingBook,setShowFloatingBook]=useState(false);
 const [selectedPoster,setSelectedPoster]=useState('');
 const [expandedCredits,setExpandedCredits]=useState<Set<string>>(()=>new Set());
 const [selectedCredit,setSelectedCredit]=useState<{name:string;role:string;department?:string;image?:string;entries:[string,string][]}|null>(null);
 const [selectedMedia,setSelectedMedia]=useState<{title:string;url:string;image:boolean}|null>(null);
 const [activeProfileTab,setActiveProfileTab]=useState('movie-overview');
 const [creditTab,setCreditTab]=useState('overview');
 const [liveMovieCredits,setLiveMovieCredits]=useState<Record<string,unknown>[]|null>(null);
 const [liveMovieMedia,setLiveMovieMedia]=useState<Record<string,unknown>[]|null>(null);
 const [trailerThumbnail,setTrailerThumbnail]=useState(()=>movie?youtubeThumbnail(movie.externalTrailerUrl||movie.trailerUrl)||movie.backdropUrl||movie.posterUrl:'');
 const trailerFrameRef=useRef<HTMLIFrameElement|null>(null);
 const trailerPlayerRef=useRef<{destroy:()=>void}|null>(null);
 useEffect(()=>{
  setSelectedPoster('');

  setTrailerThumbnail(movie?youtubeThumbnail(movie.externalTrailerUrl||movie.trailerUrl)||movie.backdropUrl||movie.posterUrl:'');
  setTrailerPhase('idle');
 },[movie?.id]);
 useEffect(()=>{let active=true;setLiveMovieCredits(null);if(!movie?.id||movie.id.startsWith('demo-'))return;listMovieCredits(movie.id).then(items=>{if(active)setLiveMovieCredits(items as Record<string,unknown>[]);}).catch(error=>{console.warn('Could not load movie credit profiles:',error);});return()=>{active=false;};},[movie?.id]);
 useEffect(()=>{let active=true;setLiveMovieMedia(null);if(!movie?.id||movie.id.startsWith('demo-'))return;listMovieMedia(movie.id).then(items=>{if(active)setLiveMovieMedia(items as Record<string,unknown>[]);}).catch(error=>{console.warn('Could not load movie media:',error);});return()=>{active=false;};},[movie?.id]);
 useEffect(()=>{const updateFloatingBook=()=>setShowFloatingBook(window.scrollY>420);updateFloatingBook();window.addEventListener('scroll',updateFloatingBook,{passive:true});return()=>window.removeEventListener('scroll',updateFloatingBook);},[]);
 useEffect(()=>{
  if(trailerPhase!=='playing'||!movie||!youtubeVideoId(movie.externalTrailerUrl||movie.trailerUrl)||!trailerFrameRef.current)return;
  let cancelled=false;
  let player:{destroy:()=>void}|null=null;
  void loadYouTubePlayerApi().then(api=>{
   if(cancelled||!trailerFrameRef.current)return;
   player=new api.Player(trailerFrameRef.current,{events:{onStateChange:event=>{if(event.data===0)setTrailerPhase('idle');},onError:()=>setTrailerPhase('idle')}});
   trailerPlayerRef.current=player;
  });
  return()=>{cancelled=true;player?.destroy();if(trailerPlayerRef.current===player)trailerPlayerRef.current=null;};
 },[trailerPhase,movie?.id]);
  if(!movie){if(dataLoading)return <div className="container page"><p className="muted" role="status">Loading movie profileÃ¢â‚¬Â¦</p></div>;if(dataError)return <Empty title="Movie details could not be loaded."><p className="muted">{dataError}</p><button className="button secondary" onClick={()=>void reloadData()}>Retry</button></Empty>;return <Empty title="Movie not found"><Link to="/movies" className="button">Explore movies</Link></Empty>;}
 const reviews=data.reviews.filter(review=>review.movieId===movieId&&review.status==='APPROVED'&&review.platform!=='OTHER');
 const ratings=reviews.filter(review=>review.rating>0);
 const richMedia=liveMovieMedia??(Array.isArray(movie.media)?movie.media:[]);
 const imageMedia=richMedia.filter(item=>/IMAGE|PHOTO|POSTER|STILL/.test(String(item.mediaType||'').toUpperCase())&&typeof (item.mediaUrl||item.url)==='string').map(item=>String(item.mediaUrl||item.url));
 const posterGallery=[...new Set([movie.posterUrl,...(movie.posterImages||[]),...imageMedia].filter((value):value is string=>typeof value==='string'&&Boolean(value.trim())))];
 const trailerUrl=[movie.externalTrailerUrl,movie.trailerUrl].find(candidate=>Boolean(candidate&&(embedUrl(candidate)||safeExternalUrl(candidate))))||'';
 const trailerEmbed=trailerUrl?embedUrl(trailerUrl):null;
 const isYouTubeTrailer=Boolean(youtubeVideoId(trailerUrl));
 const autoplayTrailer=trailerEmbed?`${trailerEmbed}${trailerEmbed.includes('?')?'&':'?'}autoplay=1&rel=0${isYouTubeTrailer?`&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`:''}`:'';
 const currentPoster=selectedPoster||movie.posterUrl||posterGallery[0]||'';
 const genres=movie.genre?.length?movie.genre:movie.genres||[];
 const languages=[...new Set([...(movie.languages||[]),movie.language,movie.originalLanguage].filter((value):value is string=>typeof value==='string'&&Boolean(value.trim())))];
 const runtime=movie.duration||movie.durationMinutes||0;
 const castCredits=liveMovieCredits?liveMovieCredits.filter(credit=>String(credit.creditType||'CAST').toUpperCase()==='CAST'):(Array.isArray(movie.castCredits)?movie.castCredits:[]);
 const castEntries:Record<string,unknown>[]=castCredits.length?castCredits:movie.cast.map((name,index)=>({name,roleTitle:'Cast',personId:`cast-${index}`}));
 const crewDepartments:any[]=liveMovieCredits?Object.values(liveMovieCredits.filter(credit=>String(credit.creditType||'').toUpperCase()==='CREW').reduce<Record<string,{department:string;departmentName:string;credits:Record<string,unknown>[] }>>((groups,credit)=>{const department=String(credit.department||'Crew');groups[department]??={department,departmentName:department,credits:[]};groups[department].credits.push(credit);return groups;},{})):(Array.isArray(movie.crewByDepartment)?movie.crewByDepartment:[]);
 const propertyEntries=(value:unknown,prefix=''):[string,string][]=>{if(value==null||typeof value==='string'&&!value.trim())return[];if(typeof value==='string'||typeof value==='number'||typeof value==='boolean'){const text=String(value);if(!text||/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(text))return[];return [[prefix,text]];}if(Array.isArray(value))return value.flatMap(item=>propertyEntries(item,prefix));if(typeof value==='object')return Object.entries(value as Record<string,unknown>).flatMap(([key,item])=>{if(key==='id'||key.toLowerCase().endsWith('id'))return[];const label=prefix?`${prefix} Ã‚Â· ${key.replace(/([A-Z])/g,' $1')}`:key.replace(/([A-Z])/g,' $1');return propertyEntries(item,label);});return[];};
 const value=(key:keyof Movie)=>{const entries=propertyEntries(movie[key]);return entries.map(([,text])=>text).join(', ');};
 const collectionValue=(items:unknown)=>Array.isArray(items)?items.map(item=>{if(typeof item==='string'||typeof item==='number')return String(item);if(item&&typeof item==='object'){const record=item as Record<string,unknown>;return String(record.name||record.fullName||record.title||propertyEntries(item).map(([,text])=>text).join(' '));}return '';}).filter(Boolean).join(', '):'';
 const socialIcon=(label:string)=>{const key=label.toLowerCase();if(key.includes('instagram'))return <Instagram size={16}/>;if(key.includes('facebook'))return <Facebook size={16}/>;if(key.includes('youtube'))return <Youtube size={16}/>;if(key==='x'||key.includes('twitter'))return <Twitter size={16}/>;if(key.includes('website')||key.includes('web site'))return <Globe size={16}/>;return <ExternalLink size={16}/>;};
 const metadataLabel=(label:string)=>{const key=label.toLowerCase();const Icon=/date|added|updated|start|end/.test(key)?CalendarDays:/description|synopsis/.test(key)?FileText:/production|distributor/.test(key)?Building2:/website|url/.test(key)?Globe:/origin|location/.test(key)?MapPin:/budget|currency/.test(key)?Coins:/status/.test(key)?Activity:Info;return <small className="movie-profile-meta-label"><Icon size={15}/>{label}</small>;};
 const personLinks=(person:Record<string,unknown>)=>{const social=person.socialLinks&&typeof person.socialLinks==='object'?person.socialLinks as Record<string,unknown>:{};return [...Object.entries(social),...(typeof person.officialWebsite==='string'?[['Official website',person.officialWebsite] as [string,unknown]]:[])].filter((entry):entry is [string,string]=>typeof entry[1]==='string'&&Boolean(safeExternalUrl(entry[1])));};
 const personLabel=(credit:Record<string,unknown>)=>{const person=credit.person&&typeof credit.person==='object'?credit.person as Record<string,unknown>:{};return String(person.fullName||credit.fullName||credit.name||credit.roleTitle||'');};
 const toggleCredit=(key:string)=>setExpandedCredits(current=>{const next=new Set(current);if(next.has(key))next.delete(key);else next.add(key);return next;});
 const isExpanded=(key:string)=>expandedCredits.has(key);
 const similarMovies=data.movies.filter(candidate=>candidate.id!==movie.id&&(candidate.genre||candidate.genres||[]).some(genre=>genres.includes(genre))).slice(0,6);
 const profileSections:{id:string;label:string;Icon:typeof Info;visible:boolean}[]=[{id:'movie-overview',label:'Overview',Icon:Info,visible:true},{id:'movie-cast',label:'Cast & Characters',Icon:UsersRound,visible:true},{id:'movie-crew',label:'Crew',Icon:Users,visible:true},{id:'movie-media',label:'Media',Icon:ImageIcon,visible:true},{id:'movie-reviews',label:'Reviews',Icon:MessageCircle,visible:true},{id:'movie-similar',label:'Similar Movies',Icon:Clapperboard,visible:true}];
 const creditTabs=[{id:'overview',label:'Overview'},{id:'biography',label:'Biography'},{id:'character',label:'Character details'},{id:'filmography',label:'Filmography'},{id:'social',label:'Social links'}];
 const creditTabEntries=(tab:string)=>{const entries=selectedCredit?.entries||[];return entries.filter(([label])=>{const key=label.toLowerCase();if(tab==='social')return /social|instagram|facebook|youtube|twitter|(^| Ã‚Â· )x$/.test(key);if(tab==='biography')return /biography|date of birth|nationality|skills/.test(key);if(tab==='character')return /character|screen time|billing|cameo|voice role|main cast|relationship/.test(key);if(tab==='overview')return !/biography|date of birth|nationality|skills|character|screen time|billing|cameo|voice role|main cast|relationship|social|instagram|facebook|youtube|twitter|(^| Ã‚Â· )x$/.test(key);return false;});};
 const thumbnailFallback=()=>setTrailerThumbnail(current=>{
  if(current.includes('maxresdefault'))return current.replace('maxresdefault','hqdefault');
  if(movie.backdropUrl&&current!==movie.backdropUrl)return movie.backdropUrl;
  if(movie.posterUrl&&current!==movie.posterUrl)return movie.posterUrl;
  return '';
 });
 return <div className="movie-profile-page">
  <section className={`movie-profile-hero container${trailerPhase!=='idle'?' is-trailer-active':''}`}>
    {trailerThumbnail&&<div className="movie-profile-atmosphere" aria-hidden="true" style={{backgroundImage:`url("${resolveMediaImageUrl(movie.backdropUrl||trailerThumbnail)||movie.backdropUrl||trailerThumbnail}")`}}/>}
    <div className={`movie-profile-gallery${posterGallery.length>1?' has-thumbnails':''}`}>
     {posterGallery.length>1&&<div className="movie-profile-thumbnails" aria-label={`${movie.title} images`}>{posterGallery.map((image,index)=><button key={`${image}-${index}`} type="button" className={currentPoster===image?'active':''} onClick={()=>{setSelectedPoster(image);}} aria-label={`Show poster image ${index+1}`}><MediaImage className="movie-profile-thumbnail-image" url={image} alt={`${movie.title} image ${index+1}`} showFallbackLink={false}/></button>)}</div>}
     <MediaImage className="movie-profile-poster" url={currentPoster} alt={`${movie.title} poster`}/>
    </div>
    <article className="movie-profile-copy">
     <div className="movie-profile-breadcrumb"><Link to="/">Home</Link><ArrowRight size={12}/><Link to="/movies">Movies</Link><ArrowRight size={12}/><span>{movie.title}</span></div>
     <span className="movie-profile-eyebrow">AUDIENCE VERDICT <i/> MOVIE PROFILE</span>
     <span className={`movie-profile-status ${movie.status.toLowerCase()}`}>{movie.status==='ACTIVE'?'NOW SCREENING':movie.status==='UPCOMING'?'COMING SOON':'ENDED'}</span>
      <h1>{movie.title}</h1>
      {movie.originalTitle&&movie.originalTitle!==movie.title&&<p className="movie-profile-original-title">{movie.originalTitle}</p>}
      {movie.tagline&&<p className="movie-profile-tagline">{movie.tagline}</p>}
      <div className="movie-profile-meta">{languages.length>0&&<span><Film size={17}/>{languages.join(' / ')}</span>}{runtime>0&&<span><span className="movie-meta-clock">Ã¢â€”Â·</span>{runtime} min</span>}{movie.certification&&<span><ShieldCheck size={16}/>{movie.certification}</span>}{genres.length>0&&<span><Star size={16}/>{genres.join(' / ')}</span>}</div>
     {(movie.releaseDate||movie.announcementDate||movie.releaseStatus)&&<p className="movie-profile-release">{movie.releaseDate&&`Released ${date(movie.releaseDate)}`}{movie.announcementDate&&` Ã‚Â· Announced ${date(movie.announcementDate)}`}{movie.releaseStatus&&` Ã‚Â· ${movie.releaseStatus}`}</p>}
     {(movie.synopsis||movie.description)&&<p className="movie-profile-synopsis">{movie.synopsis||movie.description}</p>}
      <div className="movie-profile-actions"><Link className="button" to={`/movie/${movie.id}/book`}><Ticket size={17}/> Book Ticket</Link><Link className="button secondary" to={`/movie/${movie.id}/reviews`}><MessageSquare size={17}/> Reviews</Link>{trailerEmbed?<button className="button glass" type="button" onClick={()=>setTrailerPhase('playing')}><Play size={17}/> Watch Trailer</button>:safeExternalUrl(trailerUrl)&&<a className="button glass" href={safeExternalUrl(trailerUrl)!} target="_blank" rel="noopener noreferrer"><Play size={17}/> Open trailer</a>}</div>
    </article>
    <div className="movie-trailer-banner" aria-label={`${movie.title} ${trailerUrl?'trailer preview':'backdrop'}`}>
     {trailerThumbnail?<MediaImage className="movie-trailer-thumbnail" url={trailerThumbnail} alt={`${movie.title} trailer thumbnail`} onError={thumbnailFallback} showFallbackLink={false}/>:<div className="movie-trailer-fallback"><Film size={36}/><span>{movie.title}</span></div>}
     {trailerEmbed&&<button className="movie-profile-preview-play" type="button" onClick={()=>setTrailerPhase('playing')} aria-label={`Play ${movie.title} trailer`}><Play size={24} fill="currentColor"/></button>}
     <span className="movie-profile-preview-label"><Play size={14}/>{trailerUrl?'TRAILER PREVIEW':'FILM BACKDROP'}</span>
    </div>
    {trailerPhase!=='idle'&&<div className="movie-profile-trailer-stage">
     <iframe ref={trailerFrameRef} src={autoplayTrailer} title={`${movie.title} trailer`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>{safeExternalUrl(trailerUrl)&&<a href={safeExternalUrl(trailerUrl)!} target="_blank" rel="noopener noreferrer" className="text-link">Open trailer on the original site <ArrowUpRight size={16}/></a>}
     <button type="button" className="movie-profile-trailer-close" onClick={()=>setTrailerPhase('idle')} aria-label="Stop trailer">Stop trailer</button>
    </div>}
  </section>
  <section className="container page movie-profile-below">
   <div className="movie-profile-highlights" aria-label="Movie highlights">{[ratings.length?{label:'Audience rating',value:`${(ratings.reduce((total,review)=>total+review.rating,0)/ratings.length).toFixed(1)} / 5`}:null,movie.releaseDate?{label:'Release date',value:date(movie.releaseDate)}:null,runtime>0?{label:'Runtime',value:`${runtime} min`}:null,languages[0]?{label:'Language',value:languages[0]}:null,genres.length?{label:'Genre',value:genres.join(' / ')}:null].filter((item):item is {label:string;value:string}=>Boolean(item)).map((item,index)=><div key={item.label}><span className="movie-profile-highlight-icon">{[<Star size={18}/>,<CalendarDays size={18}/>,<Film size={18}/>,<Globe size={18}/>,<Users size={18}/>][index]}</span><small>{item.label}</small><strong>{item.value}</strong></div>)}</div>
   <nav className="movie-profile-tabs" aria-label="Movie profile sections" role="tablist">{profileSections.map(({id,label,Icon},index)=><button key={id} id={`${id}-tab`} type="button" role="tab" aria-selected={activeProfileTab===id} aria-controls={`${id}-panel`} tabIndex={activeProfileTab===id?0:-1} onClick={()=>setActiveProfileTab(id)} onKeyDown={event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%profileSections.length;else if(event.key==='ArrowLeft')next=(index+profileSections.length-1)%profileSections.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=profileSections.length-1;else return;event.preventDefault();setActiveProfileTab(profileSections[next].id);document.getElementById(`${profileSections[next].id}-tab`)?.focus();}}><Icon size={15}/><span>{label}</span></button>)}</nav>
   <section id="movie-overview-panel" role="tabpanel" aria-labelledby="movie-overview-tab" hidden={activeProfileTab!=='movie-overview'} className="section movie-profile-overview"><SectionHeading eyebrow="THE FILM" title="Movie overview" description="Story, production details, and the people behind the film."/><div className="movie-profile-facts">
    {movie.backdropUrl&&<div className="movie-profile-backdrop-card"><MediaImage url={movie.backdropUrl} alt={`${movie.title} backdrop`}/>{metadataLabel('BACKDROP IMAGE')}<button type="button" onClick={()=>setSelectedMedia({title:`${movie.title} backdrop`,url:movie.backdropUrl||'',image:true})} aria-label="View backdrop" title="View backdrop"><ImageIcon size={17}/></button></div>}
    {movie.description&&(!movie.synopsis||movie.description.trim()!==movie.synopsis.trim())&&<div className="movie-profile-description">{metadataLabel('DESCRIPTION')}<span>{movie.description}</span></div>}
    {movie.releaseDate&&<div>{metadataLabel('RELEASE DATE')}<span>{date(movie.releaseDate)}</span></div>}
    {movie.announcementDate&&<div>{metadataLabel('ANNOUNCEMENT DATE')}<span>{date(movie.announcementDate)}</span></div>}
    {movie.director&&!castCredits.some(credit=>personLabel(credit)===movie.director)&&!crewDepartments.some(department=>JSON.stringify(department).includes(movie.director))&&<div>{metadataLabel('DIRECTOR')}<span>{movie.director}</span></div>}
    {!castCredits.length&&movie.cast?.length>0&&<div>{metadataLabel('CAST')}<span>{movie.cast.join(', ')}</span></div>}
    {movie.production&&!propertyEntries(movie.productionCompanies).some(([,text])=>text===movie.production)&&<div>{metadataLabel('PRODUCTION')}<span>{movie.production}</span></div>}
    {movie.productionStatus&&<div>{metadataLabel('PRODUCTION STATUS')}<span>{movie.productionStatus}</span></div>}
    {movie.productionStartDate&&<div>{metadataLabel('PRODUCTION START')}<span>{date(movie.productionStartDate)}</span></div>}
    {movie.productionEndDate&&<div>{metadataLabel('PRODUCTION END')}<span>{date(movie.productionEndDate)}</span></div>}
    {movie.distributor&&<div>{metadataLabel('DISTRIBUTOR')}<span>{movie.distributor}</span></div>}
    {movie.officialWebsite&&safeExternalUrl(movie.officialWebsite)&&<div className="movie-profile-icon-link">{metadataLabel('OFFICIAL WEBSITE')}<a href={safeExternalUrl(movie.officialWebsite)!} target="_blank" rel="noopener noreferrer" aria-label="Open official website" title="Open official website"><ExternalLink size={18}/></a></div>}
    {movie.countryOfOrigin&&propertyEntries(movie.countryOfOrigin).length>0&&<div>{metadataLabel('COUNTRY OF ORIGIN')}<span>{value('countryOfOrigin')}</span></div>}
    {movie.budget!=null&&movie.budget!==''&&<div>{metadataLabel('BUDGET')}<span>{movie.currencyCode?`${movie.currencyCode} `:''}{typeof movie.budget==='number'?movie.budget.toLocaleString('en-US'):movie.budget}</span></div>}
    {movie.filmingLocations&&collectionValue(movie.filmingLocations)&&<div>{metadataLabel('FILMING LOCATIONS')}<span>{collectionValue(movie.filmingLocations)}</span></div>}
    {movie.productionCompanies&&collectionValue(movie.productionCompanies)&&<div>{metadataLabel('PRODUCTION COMPANIES')}<span>{collectionValue(movie.productionCompanies)}</span></div>}
    {movie.createdAt&&<div>{metadataLabel('ADDED')}<span>{date(movie.createdAt)}</span></div>}
    {movie.updatedAt&&<div>{metadataLabel('LAST UPDATED')}<span>{date(movie.updatedAt)}</span></div>}
   </div></section>
   <section id="movie-cast-panel" role="tabpanel" aria-labelledby="movie-cast-tab" hidden={activeProfileTab!=='movie-cast'} className="section"><SectionHeading eyebrow="ON SCREEN" title="Cast & characters" description="Meet the performers and the characters they bring to life."/>{castEntries.length>0?<div className="movie-profile-people">{castEntries.map((credit,index)=>{const person=credit.person&&typeof credit.person==='object'?credit.person as Record<string,unknown>:{};const name=personLabel(credit);const entries=propertyEntries(credit);const image=person.profileImageUrl||credit.characterImageUrl;const role=String(credit.roleTitle||credit.characterName||'');return <article className="movie-profile-person" key={String(credit.personId||name||index)}>{typeof image==='string'&&image?<MediaImage className="movie-profile-person-image" url={image} alt={name||'Cast profile'} showFallbackLink={false}/>:<span className="movie-profile-avatar" aria-hidden="true">{name.split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase()}</span>}<div className="movie-profile-person-copy">{name&&<h3>{name}</h3>}{role&&<p className="movie-profile-person-role">{role}</p>}{typeof credit.characterCategory==='string'&&<span className="movie-profile-chip">{credit.characterCategory}</span>}{typeof credit.characterDescription==='string'&&<p className="movie-profile-person-summary">{credit.characterDescription}</p>}<div className="movie-profile-social-icons">{personLinks(person).map(([label,url])=><a key={`${label}-${url}`} href={safeExternalUrl(url)!} target="_blank" rel="noopener noreferrer" aria-label={`${name} ${label}`} title={label}>{socialIcon(label)}</a>)}</div><button className="movie-profile-more" type="button" onClick={()=>{setCreditTab('overview');setSelectedCredit({name,role,image:typeof image==='string'?image:undefined,entries});}}>View Profile <ArrowRight size={14}/></button></div></article>;})}</div>:<Empty title="Cast information is not available."/>}</section>
   <section id="movie-crew-panel" role="tabpanel" aria-labelledby="movie-crew-tab" hidden={activeProfileTab!=='movie-crew'} className="section"><SectionHeading eyebrow="BEHIND THE CAMERA" title="Crew by department" description="The creative teams behind the film."/>{crewDepartments.length>0?<div className="movie-profile-crew">{crewDepartments.flatMap((department:any,index:number)=>{const credits=Array.isArray(department.credits)?department.credits:[];const departmentName=String(department.departmentName||department.department||department.name||'Crew');const members=credits.length?credits:[department];return members.map((credit:Record<string,unknown>,creditIndex:number)=>{const item=credit&&typeof credit==='object'?credit as Record<string,unknown>:{};const person=item.person&&typeof item.person==='object'?item.person as Record<string,unknown>:{};const name=personLabel(item);const details=propertyEntries(item);const image=person.profileImageUrl;return <article className="movie-profile-crew-card" key={`crew-${index}-${creditIndex}-${name}`}>{typeof image==='string'&&image?<MediaImage className="movie-profile-crew-image" url={image} alt={name} showFallbackLink={false}/>:<span className="movie-profile-crew-avatar">{name.split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase()}</span>}<div><small>{departmentName}</small>{name&&<strong>{name}</strong>}{typeof item.roleTitle==='string'&&<span>{item.roleTitle}</span>}<div className="movie-profile-social-icons">{personLinks(person).map(([label,url])=><a key={`${label}-${url}`} href={safeExternalUrl(url)!} target="_blank" rel="noopener noreferrer" aria-label={`${name} ${label}`} title={label}>{socialIcon(label)}</a>)}</div><button className="movie-profile-more" type="button" onClick={()=>{setCreditTab('overview');setSelectedCredit({name,role:String(item.roleTitle||''),department:departmentName,image:typeof image==='string'?image:undefined,entries:details});}}>View Profile <ArrowRight size={14}/></button></div></article>;});})}</div>:<Empty title="Crew information is not available."/>}</section>
   <section id="movie-media-panel" role="tabpanel" aria-labelledby="movie-media-tab" hidden={activeProfileTab!=='movie-media'} className="section"><SectionHeading title="Media gallery" description={`Videos, images, and other media from ${movie.title}.`}/>{richMedia.length>0?<div className="movie-profile-media">{richMedia.map((item,index)=>{const rawUrl=typeof item.mediaUrl==='string'?item.mediaUrl:typeof item.url==='string'?item.url:'';const mediaUrl=safeExternalUrl(rawUrl)||'';const safeUrl=safeExternalUrl(mediaUrl);const title=String(item.title||item.mediaType||`Media ${index+1}`);const previewRaw=String(item.thumbnailUrl||item.thumbnail||'');const preview=safeExternalUrl(previewRaw)||previewRaw;const key=`media-${index}-${title}`;const isImage=/IMAGE|PHOTO|POSTER|BACKDROP|STILL/.test(String(item.mediaType||'').toUpperCase());return <article className="movie-profile-media-card" key={key}>{(preview||safeUrl)&&<button type="button" className="movie-profile-media-open" onClick={()=>safeUrl&&setSelectedMedia({title,url:safeUrl,image:isImage})} aria-label={`${isImage?'View':'Play'} ${title}`} disabled={!safeUrl}><MediaImage className="movie-profile-media-thumb" url={(isImage?safeUrl:preview)||safeUrl||movie.backdropUrl||movie.posterUrl} alt={title} showFallbackLink={false}/>{!isImage&&<span><Play size={19} fill="currentColor"/></span>}{isImage&&<span><ImageIcon size={18}/></span>}</button>}<strong>{title}</strong>{typeof item.mediaType==='string'&&<small>{item.mediaType}</small>}{isExpanded(key)&&propertyEntries(item).map(([label,text],entryIndex)=><p className="movie-profile-detail" key={`${label}-${entryIndex}`}><small>{label}</small>{safeExternalUrl(text)?<a className="movie-profile-detail-link" href={safeExternalUrl(text)!} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label}`} title={`Open ${label}`}><ExternalLink size={16}/></a>:text}</p>)}{isExpanded(key)&&safeUrl&&<a className="movie-profile-media-link" href={safeUrl} target="_blank" rel="noopener noreferrer" aria-label={isImage?'Open image in new tab':'Open media in new tab'} title={isImage?'Open image':'Open media'}>{isImage?<ImageIcon size={16}/>:<Play size={16}/>}</a>}<button className="movie-profile-more" type="button" aria-expanded={isExpanded(key)} onClick={()=>toggleCredit(key)}>{isExpanded(key)?'View less':'Details'} <ArrowRight size={14}/></button></article>;})}</div>:<Empty title="No movie media is available."/>}</section>
   <div id="movie-reviews-panel" role="tabpanel" aria-labelledby="movie-reviews-tab" hidden={activeProfileTab!=='movie-reviews'}><section className="panel verdict-panel"><div><div className="eyebrow">THE AUDIENCE HAS A VOICE</div><h2>Audience Verdict</h2><p className="muted">Opinions shared by our community, not a representative poll.</p></div><div className="verdict-score"><Star fill="currentColor"/><strong>{ratings.length?(ratings.reduce((total,review)=>total+review.rating,0)/ratings.length).toFixed(1):'Ã¢â‚¬â€'}</strong><span>/ 5<br/>{ratings.length} ratings Ã‚Â· {reviews.length} reviews</span></div><div className="rating-bars">{[5,4,3,2,1].map(value=><div key={value}><span>{value} star</span><i><b style={{width:`${ratings.length?ratings.filter(review=>review.rating===value).length/ratings.length*100:0}%`}}/></i><span>{ratings.filter(review=>review.rating===value).length}</span></div>)}</div></section><section className="section movie-profile-reviews"><SectionHeading eyebrow="COMMUNITY VOICES" title="Audience reviews" to={`/movie/${movie.id}/reviews`} link="All reviews"/><div className="review-grid">{reviews.slice(0,3).map(review=><ReviewCard key={review.id} review={review}/>)}</div>{!reviews.length&&<Empty title="No audience reviews yet."><p className="movie-review-empty-hint">Be the first to share a review of {movie.title}.</p><Link className="button secondary" to={`/movie/${movie.id}/reviews`}>Explore reviews</Link></Empty>}</section></div>
   <section id="movie-similar-panel" role="tabpanel" aria-labelledby="movie-similar-tab" hidden={activeProfileTab!=='movie-similar'} className="section"><SectionHeading eyebrow="YOU MAY ALSO LIKE" title="Similar movies" description="More films you may enjoy."/>{similarMovies.length>0?<div className="movie-grid">{similarMovies.map(candidate=><MovieCard key={candidate.id} movie={candidate}/>)}</div>:<Empty title="No similar movies are available."/>}</section>
  </section>
  {selectedCredit&&<Modal title={selectedCredit.name||'Movie credit details'} onClose={()=>setSelectedCredit(null)}><article className="movie-profile-detail-page">{selectedCredit.image?<MediaImage className="movie-profile-detail-portrait" url={selectedCredit.image} alt={selectedCredit.name} showFallbackLink={false}/>:<span className="movie-profile-detail-avatar">{selectedCredit.name.split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase()}</span>}<header><span className="movie-profile-eyebrow">{selectedCredit.department||'CAST & CHARACTERS'}</span><h2>{selectedCredit.name}</h2>{selectedCredit.role&&<p>{selectedCredit.role}</p>}</header><div className="movie-profile-detail-grid">{selectedCredit.entries.map(([label,text],index)=><section key={`${label}-${index}`}><small>{label}</small><p>{text}</p></section>)}</div></article></Modal>}
  {selectedCredit&&<Modal title={selectedCredit.name||'Movie credit details'} onClose={()=>setSelectedCredit(null)}><article className="movie-profile-detail-page">{selectedCredit.image?<img className="movie-profile-detail-portrait" src={selectedCredit.image} alt={selectedCredit.name}/>:<span className="movie-profile-detail-avatar">{selectedCredit.name.split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase()}</span>}<header><span className="movie-profile-eyebrow">{selectedCredit.department||'CAST & CHARACTERS'}</span><h2>{selectedCredit.name}</h2>{selectedCredit.role&&<p>{selectedCredit.role}</p>}<div className="movie-profile-social-icons">{selectedCredit.entries.filter(([label,text])=>safeExternalUrl(text)&&/social|instagram|facebook|youtube|twitter|(^| Ã‚Â· )x$/.test(label.toLowerCase())).map(([label,url],index)=><a key={`${label}-${index}`} href={safeExternalUrl(url)!} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label}`} title={label}>{socialIcon(label)}</a>)}</div></header><nav className="movie-profile-detail-tabs" role="tablist" aria-label="Profile details">{creditTabs.filter(({id})=>id==='overview'||creditTabEntries(id).length>0).map(({id,label})=><button key={id} type="button" role="tab" aria-selected={creditTab===id} onClick={()=>setCreditTab(id)}>{label}</button>)}</nav><div className="movie-profile-detail-grid" role="tabpanel">{creditTabEntries(creditTab).map(([label,text],index)=><section key={`${label}-${index}`}><small>{label.replace(/ Ã‚Â· social links Ã‚Â· /i,' Ã‚Â· ')}</small>{safeExternalUrl(text)?<a className="movie-profile-detail-link" href={safeExternalUrl(text)!} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label}`} title={`Open ${label}`}>{socialIcon(label)}</a>:<p>{text}</p>}</section>)}{!creditTabEntries(creditTab).length&&<p className="movie-profile-empty-tab">No {creditTabs.find(tab=>tab.id===creditTab)?.label.toLowerCase()} details are available.</p>}</div></article></Modal>}
  {selectedMedia&&<Modal title={selectedMedia.title} onClose={()=>setSelectedMedia(null)}>{selectedMedia.image?<MediaImage className="movie-profile-media-viewer-image" url={selectedMedia.url} alt={selectedMedia.title}/>:<Video url={selectedMedia.url} title={selectedMedia.title}/>}</Modal>}
  {showFloatingBook&&<Link className="movie-profile-floating-book" to={`/movie/${movie.id}/book`}><Ticket size={18}/><span>Book Tickets</span><ArrowRight size={16}/></Link>}
 </div>;
}
export function AudienceVerdict(){
 const location=useLocation();
 const heroRef=useRef<HTMLElement|null>(null);
 const audioRef=useRef<HTMLAudioElement|null>(null);
 const [selectedImage,setSelectedImage]=useState<{src:string;alt:string}|null>(null);
 const videoRef=useRef<HTMLVideoElement>(null);
 const closeImage=()=>setSelectedImage(null);
 useEffect(()=>{
  const hero=heroRef.current;const audio=audioRef.current;if(!hero||!audio)return;
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){audio.pause();return;}void audio.play().catch(()=>{});},{threshold:.25});
  observer.observe(hero);
  return()=>{observer.disconnect();audio.pause();audio.currentTime=0;};
 },[location.pathname]);
 useEffect(()=>{
  if(!selectedImage)return;
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')closeImage();};
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[selectedImage]);
 return <div className="audience-verdict-page" id="audience-verdict">
  <audio ref={audioRef} src="https://drive.google.com/uc?export=download&amp;id=1UxVIRHkJL1reodQmjfyV1qZNwEZfBsyb" preload="auto"/>
  <section ref={heroRef} className="av-story-hero" id="featured-film">
   <video ref={videoRef} className="av-story-video" src={featuredFilmVideo} controls playsInline preload="metadata" aria-label="Audience Verdict film story"/>
   <div className="av-story-overlay"><span className="av-story-eyebrow">01 / FEATURED FILM</span><h1>The AAV Story</h1><p>Discover the philosophy, operating model and execution framework behind Audience Verdict.</p><a href="#overview" className="av-story-link">Explore the framework <ArrowRight size={17}/></a></div>
   <div className="av-story-caption"><span>AUDIENCE-LED FILM SUCCESS</span><i/><span>THE OPERATING SYSTEM</span></div>
  </section>
  <div className="av-chapters">
   <section className="av-overview" id="overview"><div className="av-overview-copy"><span className="av-story-eyebrow">02 / THE FRAMEWORK</span><h2>One operating model.<br/>Every audience voice.</h2><p>A clear, audience-first approach brings film teams, theatres, platforms, and movie lovers together around a shared experience.</p></div><button type="button" className="av-overview-art" onClick={()=>setSelectedImage({src:operatingSystemPages[0],alt:operatingSystemImageTitles[0]})}><img src={operatingSystemPages[0]} alt={operatingSystemImageTitles[0]} loading="lazy"/><span>Open overview <ArrowUpRight size={15}/></span></button></section>
   {frameworkChapters.map((chapter,index)=><section className={`av-chapter ${index%2?'reverse':''}`} id={chapter.id} key={chapter.id}><div className="av-chapter-copy"><span className="av-story-eyebrow">{chapter.eyebrow}</span><h2>{chapter.title}</h2><p>{chapter.description}</p><a className="av-story-link" href={index<frameworkChapters.length-1?`#${frameworkChapters[index+1].id}`:'#av-closing'}>{chapter.link} <ArrowRight size={17}/></a></div><div className="av-chapter-art">{chapter.pages.map(pageIndex=><figure key={pageIndex}><button type="button" onClick={()=>setSelectedImage({src:operatingSystemPages[pageIndex+1],alt:operatingSystemImageTitles[pageIndex+1]})} aria-label={`View ${operatingSystemImageTitles[pageIndex+1]}`}><img src={operatingSystemPages[pageIndex+1]} alt={operatingSystemImageTitles[pageIndex+1]} loading="lazy"/></button><figcaption><span>DIAGRAM {String(pageIndex+1).padStart(2,'0')}</span><strong>{operatingSystemImageTitles[pageIndex+1]}</strong></figcaption></figure>)}</div><nav className="av-section-controls" aria-label={`Navigate ${chapter.title}`}><a href={index===0?'#overview':`#${frameworkChapters[index-1].id}`}><ArrowRight className="av-prev-arrow" size={16}/> Previous section</a><a href={index<frameworkChapters.length-1?`#${frameworkChapters[index+1].id}`:'#av-closing'}>Next section <ArrowRight size={16}/></a></nav></section>)}
   <section className="av-closing" id="av-closing"><img src={aavFrameworkClosingImage} alt="Audience Verdict Ã¢â‚¬â€ a new chapter for every audience voice" loading="lazy"/><div><span className="av-story-eyebrow">THE NEXT CHAPTER</span><h2>Make every audience voice count.</h2><p>Explore the films, meet the audience, and build a stronger conversation around cinema.</p><Link to="/movies" className="av-story-link">Explore movies <ArrowRight size={17}/></Link></div></section>
  </div>
  {selectedImage&&<div className="av-lightbox" role="dialog" aria-modal="true" aria-label={selectedImage.alt} onClick={closeImage}><button type="button" onClick={closeImage} aria-label="Close image">Ãƒâ€”</button><img src={selectedImage.src} alt={selectedImage.alt} onClick={event=>event.stopPropagation()}/></div>}
 </div>;
}
export function About(){
 const [showGuide,setShowGuide]=useState(false);
 const [activePolicy,setActivePolicy]=useState('Booking Rules');
 const features=[
  {icon:Ticket,title:'Book Tickets',text:'Discover and book tickets for the latest movies in your city.'},
  {icon:Star,title:'Share Reviews',text:'Share your honest reviews and help others choose.'},
  {icon:Users,title:'Build a Community',text:'Join a community of real movie lovers.'},
  {icon:Film,title:'Support Movies',text:'Help good cinema reach more audiences.'}
 ];
 const benefits=[
  {icon:Eye,title:'Reach Real Audiences',text:'Showcase your movie to genuine movie lovers.'},
  {icon:Ticket,title:'Enable Ticket Bookings',text:'Let audiences book tickets directly.'},
  {icon:MessageSquare,title:'Get Authentic Reviews',text:'Collect real feedback from verified users.'},
  {icon:BarChart3,title:'Track Performance',text:'Understand audience response and engagement.'}
 ];
 const steps=[
  {icon:FileText,title:'Submit Your Movie',text:'Share your movie details, posters, trailer and other required information.'},
  {icon:Check,title:'Review & Verification',text:'Our team reviews the submitted details to ensure content quality and guidelines compliance.'},
  {icon:Megaphone,title:'Get Listed on AV',text:'Your movie will be listed on Audience Verdict with full details, showtimes (if applicable) and booking options.'},
  {icon:Users,title:'Reach Audience & Collect Reviews',text:'Audiences can book tickets, watch your movie and share their genuine reviews.'}
 ];
 const policies=[
  {title:'Booking Rules',icon:CalendarDays,points:['Tickets can be booked only through the official Audience Verdict platform.','Users must provide accurate details during booking.','Each booking is subject to theatre availability and seat selection.','Booking confirmation will be sent via email and/or SMS.','Please carry a valid ID and booking proof to the theatre.','Audience Verdict is only a ticketing platform and does not own or operate theatres.','The prices, showtimes and seat availability are provided by the respective theatres.']},
  {title:'Cancellation & Refund',icon:RotateCcw,points:['Cancellation and refund eligibility follows the terms shown before checkout.','Convenience fees may be non-refundable where stated.','Approved refunds are returned to the original payment method.','For a cancelled show, follow the instructions in your booking notification.']},
  {title:'User Responsibilities',icon:UserRound,points:['Use accurate contact details and keep your account credentials private.','Present your booking confirmation at the venue when requested.','Respect theatre staff, other guests and venue policies.']},
  {title:'Prohibited Activities',icon:Ban,points:['Do not create fraudulent bookings or misuse promotional offers.','Do not interfere with the platform or attempt unauthorized access.','Harassment, abusive content and impersonation are not permitted.']},
  {title:'Theatre & Event Rules',icon:ShieldCheck,points:['Theatre entry, age restrictions and event rules are set by the venue.','Arrive before the listed showtime and follow staff instructions.','Showtimes and event details may change; check your booking updates.']},
  {title:'Privacy Policy',icon:LockKeyhole,points:['We use account and booking details to provide the requested services.','We do not display private account details in public reviews.','Contact support to request help with your account information.']},
  {title:'Content Guidelines',icon:MessageSquare,points:['Reviews should describe your genuine experience.','Avoid personal information, hate speech, threats and spam.','Content may be moderated when it violates these guidelines.']}
 ];
 const policyTabs=['Booking Rules','Terms & Conditions','Privacy Policy','Content Guidelines'];
 const currentPolicy=policies.find(item=>item.title===activePolicy)||policies[0];
 const faqs=[
  {q:'How can I release my movie in Audience Verdict?',a:'Use the creator enquiry or start process option to share your movie details. Our team will review the submission and contact you about the next steps.'},
  {q:'What types of movies are accepted?',a:'We welcome films across languages and genres. Submissions are reviewed for completeness, rights and platform guidelines.'},
  {q:'How does the ticket booking process work?',a:'Choose an available movie and show, select seats when offered, and complete the booking through the listed theatre options.'},
  {q:'How are reviews verified?',a:'Reviews are moderated and may be associated with verified platform activity to help keep audience feedback useful.'}
 ];
 return <div className="about-page">
  <section className="about-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(7,12,15,.9) 0%,rgba(7,12,15,.76) 37%,rgba(7,12,15,.08) 72%),linear-gradient(0deg,rgba(6,10,13,.48),transparent 45%),url("${aboutCinemaHero}")`}}>
   <div className="about-screen-brand" aria-hidden="true"><strong><span>A</span><i>V</i></strong><b>AUDIENCE<br/>VERDICT.</b><em>Movies<br/>live through<br/>people</em></div>
   <div className="about-hero-inner"><div className="about-hero-copy"><span className="about-eyebrow">ABOUT AUDIENCE VERDICT</span><h1>Great movies<br/>start conversations.</h1><p className="about-lead">Audience Verdict is a platform where movies meet real audiences.</p><p>We bring movie lovers, creators, and theatres together Ã¢â‚¬â€ enabling ticket bookings, genuine audience reviews, and meaningful discussions.</p><div className="about-actions"><Link className="about-primary" to="/movies"><Play size={15} fill="currentColor"/> Explore Movies</Link><button className="about-secondary" type="button" onClick={()=>setShowGuide(true)}><Play size={15}/> Watch How It Works</button></div></div></div>
  </section>
  <section className="about-features" aria-label="What you can do"><div className="about-feature-grid">{features.map(({icon:Icon,title,text})=><article className="about-feature" key={title}><span className="about-icon"><Icon size={25} fill={title==='Share Reviews'?'currentColor':'none'}/></span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div></section>
  <section className="about-creators"><div className="about-production-image" style={{backgroundImage:`url("${aboutProductionArt}")`}} role="img" aria-label="Film production camera and movie reels"/><div className="about-creator-copy"><span className="about-eyebrow">FOR CREATORS &amp; PRODUCERS</span><h2>Release your movie<br/>in Audience Verdict?</h2><p>Bring your story to the audience. Get visibility, ticket bookings, real reviews, and community engagement Ã¢â‚¬â€ all in one platform.</p><Link to="/login" className="about-primary">Start the Process <ArrowRight size={16}/></Link></div><div className="about-benefits">{benefits.map(({icon:Icon,title,text})=><article className="about-benefit" key={title}><span className="about-icon"><Icon size={23}/></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
  <section className="about-process" id="about-process"><div className="about-section-heading"><span className="about-eyebrow">HOW IT WORKS</span><h2>Our Process</h2></div><div className="about-process-grid">{steps.map((step,index)=>{const Icon=step.icon;return <article className="about-step" key={step.title}><span className="about-step-number">{index+1}</span><span className="about-step-icon"><Icon size={25}/></span><h3>{step.title}</h3><p>{step.text}</p>{index<steps.length-1&&<ArrowRight className="about-step-arrow" size={22}/>}</article>})}</div></section>
  <section className="about-policies" id="about-policies"><div className="about-policy-heading"><div className="about-section-heading"><span className="about-eyebrow">RULES &amp; POLICIES</span><h2>Important Information</h2></div><div className="about-policy-tabs" role="tablist" aria-label="Policy categories">{policyTabs.map(tab=><button key={tab} type="button" role="tab" aria-selected={tab===activePolicy||((tab==='Terms & Conditions')&&['Cancellation & Refund','User Responsibilities','Prohibited Activities','Theatre & Event Rules'].includes(activePolicy))} className={tab===activePolicy||((tab==='Terms & Conditions')&&['Cancellation & Refund','User Responsibilities','Prohibited Activities','Theatre & Event Rules'].includes(activePolicy))?'active':''} onClick={()=>setActivePolicy(tab==='Terms & Conditions'?'Cancellation & Refund':tab)}>{tab}</button>)}</div></div><div className="about-policy-panel"><nav className="about-policy-menu" aria-label="Policy topics">{policies.map(({title,icon:Icon})=><button type="button" key={title} className={currentPolicy.title===title?'active':''} onClick={()=>setActivePolicy(title)}><Icon size={18}/>{title}</button>)}</nav><article className="about-policy-content"><h3>{currentPolicy.title}</h3><ul>{currentPolicy.points.map(point=><li key={point}>{point}</li>)}</ul><Ticket className="about-policy-watermark" size={100}/></article></div></section>
  <section className="about-faq" id="about-faq"><div className="about-faq-intro"><span className="about-eyebrow">FREQUENTLY ASKED QUESTIONS</span><h2>Got questions?</h2><p>Find answers to common questions about our platform, booking process and more.</p><a className="about-faq-link" href="#about-policies">View All FAQs <ArrowRight size={15}/></a></div><div className="about-faq-list">{faqs.map(item=><details key={item.q}><summary>{item.q}<ChevronDown size={17}/></summary><p>{item.a}</p></details>)}</div></section>
  {showGuide&&<Modal title="How Audience Verdict works" onClose={()=>setShowGuide(false)}><video className="about-guide-video" controls autoPlay playsInline preload="metadata"><source src={featuredFilmVideo} type="video/mp4"/>Your browser does not support video playback.</video></Modal>}
 </div>;
}



