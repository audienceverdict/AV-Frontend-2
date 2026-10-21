import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {authService,database,emptyData,loadBackendData,reloadBackendData} from '../services/api';
import type {Data,User} from '../types';
const Context=createContext<{data:Data;user:User|null;admin:boolean;authLoading:boolean;authError:string;dataLoading:boolean;dataError:string;reloadData:()=>Promise<void>}>({data:database.read(),user:null,admin:false,authLoading:true,authError:'',dataLoading:true,dataError:'',reloadData:async()=>{}});
export function AppProvider({children}:{children:ReactNode}){
 const [data,setData]=useState(emptyData);const [user,setUser]=useState<User|null>(authService.current);const [authLoading,setAuthLoading]=useState(true);const [authError,setAuthError]=useState('');const [dataLoading,setDataLoading]=useState(true);const [dataError,setDataError]=useState('');
 useEffect(()=>{let active=true;const refresh=()=>setData(database.read());const checkLocation=()=>{if(!navigator.geolocation){sessionStorage.setItem('av_location_enabled','false');return;}navigator.geolocation.getCurrentPosition(()=>sessionStorage.setItem('av_location_enabled','true'),()=>sessionStorage.setItem('av_location_enabled','false'),{enableHighAccuracy:false,timeout:10000,maximumAge:300000});};const resume=()=>{if(document.visibilityState==='visible')checkLocation();};checkLocation();document.addEventListener('visibilitychange',resume);const auth=()=>{const next=authService.current();setUser(next);setAuthError('');};
 const restore=async()=>{try{await authService.restore();}catch(e){if(active&&((e as {status?:number}).status!==401)){const message=(e as Error).message;console.error('[auth] Session restore failed:',e);setAuthError(message);}}finally{if(active)setAuthLoading(false);}};
 window.addEventListener('av-change',refresh);window.addEventListener('av-auth-change',auth);window.addEventListener('storage',refresh);
 void loadBackendData().then(()=>{if(active){refresh();setDataError('');}}).catch(error=>{if(active){refresh();console.error('[api] Initial data load failed:',error);setDataError((error as Error).message);}}).finally(()=>{if(active)setDataLoading(false);});void restore();
 return()=>{active=false;document.removeEventListener('visibilitychange',resume);window.removeEventListener('av-change',refresh);window.removeEventListener('av-auth-change',auth);window.removeEventListener('storage',refresh);};},[]);
 const reloadData=async()=>{setDataLoading(true);setDataError('');try{await reloadBackendData();setData(database.read());}catch(error){setDataError((error as Error).message);}finally{setDataLoading(false);}};
 return <Context.Provider value={{data,user,admin:user?.role==='ADMIN',authLoading,authError,dataLoading,dataError,reloadData}}>{children}</Context.Provider>;
}
export const useApp=()=>useContext(Context);
