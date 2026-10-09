import { useEffect, useRef, useState } from 'react';

// Replace with the generated production assets once video generation is connected.
export const cinematicSources: { hero: string | null; studio: string | null } = {
  hero: null,
  studio: null,
};

export function CinematicMedia({source,poster,alt,className='',label}:{source:string|null;poster:string;alt:string;className?:string;label:string}){
 const ref=useRef<HTMLVideoElement>(null);
 const [paused,setPaused]=useState(false);
 const [failed,setFailed]=useState(false);
 const userPaused=useRef(false);
 useEffect(()=>{
  const video=ref.current;if(!video||!source)return;
  let inView=false;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{if(!inView||reduced.matches||document.hidden||userPaused.current){video.pause();setPaused(true);}else video.play().then(()=>setPaused(false)).catch(()=>setPaused(true));};
  const obs=new IntersectionObserver(([entry])=>{inView=Boolean(entry?.isIntersecting);update();},{threshold:.15});
  obs.observe(video);reduced.addEventListener('change',update);document.addEventListener('visibilitychange',update);update();
  return()=>{obs.disconnect();reduced.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);};
 },[source]);
 const toggle=()=>{const v=ref.current;if(!v)return;if(v.paused){userPaused.current=false;v.play().then(()=>setPaused(false)).catch(()=>setPaused(true));}else{userPaused.current=true;v.pause();setPaused(true);}};
 return <div className={`cinematic-media ${className}`}>{source&&!failed?<><video ref={ref} poster={poster} loop muted playsInline preload="metadata" aria-label={alt} onError={()=>setFailed(true)}><source src={source} type="video/mp4"/></video><button className="motion-control" onClick={toggle} aria-label={`${paused?'Play':'Pause'} ${label}`}><span aria-hidden="true">{paused?'▶':'Ⅱ'}</span>{paused?'Play film':'Pause film'}</button></>:<img src={poster} alt={alt} loading={className==='hero-film'?'eager':'lazy'} fetchPriority={className==='hero-film'?'high':'auto'}/>}</div>;
}
