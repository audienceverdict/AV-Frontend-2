const windows1252Chars='€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ';
const windows1252Bytes=new Map(Array.from(windows1252Chars).map((char,index)=>[char,index+0x80]));
const mojibakePattern=/Ã|Â|â€|ðŸ|ï¿½|à¤|à¦|à¨|à°/g;

function score(value:string){return (value.match(mojibakePattern)||[]).length;}

function decodeLegacyUtf8(value:string):string|null{
 const bytes:number[]=[];
 for(const char of value){
  const code=char.codePointAt(0)!;
  if(code<0x80){bytes.push(code);continue;}
  const mapped=windows1252Bytes.get(char);
  if(mapped!==undefined){bytes.push(mapped);continue;}
  if(code>=0xa0&&code<=0xff){bytes.push(code);continue;}
  return null;
 }
 return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
}

function repairToken(token:string):string{
 let current=token;
 for(let pass=0;pass<4;pass++){
  if(!mojibakePattern.test(current)){mojibakePattern.lastIndex=0;break;}
  mojibakePattern.lastIndex=0;
  const decoded=decodeLegacyUtf8(current);
  if(!decoded||score(decoded)>=score(current))break;
  current=decoded;
 }
 return current;
}

export function repairTextEncoding(value:string):string{
 return value.split(/(\s+)/).map(part=>/^\s+$/.test(part)?part:repairToken(part)).join('');
}

export function repairTextTree<T>(value:T):T{
 if(typeof value==='string')return repairTextEncoding(value) as T;
 if(Array.isArray(value))return value.map(repairTextTree) as T;
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,repairTextTree(item)])) as T;
 return value;
}
