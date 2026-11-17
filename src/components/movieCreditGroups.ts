export interface MovieCreditLike {
 creditType?:unknown;
 department?:unknown;
 roleTitle?:unknown;
 characterName?:unknown;
 personId?:unknown;
 person?:{fullName?:unknown;profileImageUrl?:unknown}|null;
 fullName?:unknown;
}

export const MOVIE_CREDIT_DEPARTMENTS=[
 {id:'cast',label:'Cast'},
 {id:'direction',label:'Direction'},
 {id:'production',label:'Production'},
 {id:'camera',label:'Camera / Cinematography'},
 {id:'editing',label:'Editing'},
 {id:'music',label:'Music'},
 {id:'writing',label:'Writing'},
 {id:'art',label:'Art'},
 {id:'sound',label:'Sound'},
 {id:'costume-makeup',label:'Costume & Makeup'},
 {id:'vfx-di',label:'VFX / DI'},
 {id:'other-crew',label:'Other Crew'},
] as const;

export type MovieCreditDepartmentId=typeof MOVIE_CREDIT_DEPARTMENTS[number]['id'];
export type GroupedMovieCredit<T extends MovieCreditLike=MovieCreditLike>={id:MovieCreditDepartmentId;label:string;credits:T[]};

function departmentGroup(credit:MovieCreditLike):MovieCreditDepartmentId{
 if(String(credit.creditType||'').toUpperCase()==='CAST')return 'cast';
 const rawDepartment=String(credit.department||'').trim().toLowerCase();
 if(rawDepartment==='di')return 'vfx-di';
 const value=rawDepartment.replace(/[_&/]+/g,' ').replace(/\s+/g,' ');
 if(/direction|direct|assistant director/.test(value))return 'direction';
 if(/production|producer|line producer|executive producer/.test(value))return 'production';
 if(/camera|cinematograph|dop|director of photography/.test(value))return 'camera';
 if(/edit/.test(value))return 'editing';
 if(/music|score|composer/.test(value))return 'music';
 if(/writ|screenplay|story/.test(value))return 'writing';
 if(/^(art|art direction|art department|production design|set design|property)$/.test(value)||/^(art_direction|production_design|set_design)$/.test(rawDepartment))return 'art';
 if(/sound|audio|mix|dubbing/.test(value))return 'sound';
 if(/costume|makeup|hair|wardrobe/.test(value))return 'costume-makeup';
 if(/vfx|visual effect|digital intermediate/.test(value)||value==='di')return 'vfx-di';
 return 'other-crew';
}

export function groupMovieCredits<T extends MovieCreditLike>(credits:T[]):GroupedMovieCredit<T>[] {
 const groups=new Map<MovieCreditDepartmentId,T[]>(MOVIE_CREDIT_DEPARTMENTS.map(group=>[group.id,[]]));
 for(const credit of credits)groups.get(departmentGroup(credit))!.push(credit);
 return MOVIE_CREDIT_DEPARTMENTS.map(group=>({id:group.id,label:group.label,credits:groups.get(group.id)!}));
}

export function searchMovieCredits<T extends MovieCreditLike>(credits:T[],query:string,department='all'):T[]{
 const term=query.trim().toLocaleLowerCase();
 return credits.filter(credit=>(department==='all'||departmentGroup(credit)===department)&&(!term||[
  credit.person?.fullName,credit.fullName,credit.characterName,credit.roleTitle,credit.department,
 ].some(value=>String(value||'').toLocaleLowerCase().includes(term))));
}
