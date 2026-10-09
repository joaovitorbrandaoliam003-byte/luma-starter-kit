import { useEffect, useRef, useState } from 'react';
import { ImplantScene } from './ImplantScene';

export const cinematicSources: { hero: string | null; studio: string | null } = {
  hero: null,
  studio: null,
};

export function CinematicMedia({source,poster,alt,className='',label}:{source:string|null;poster:string;alt:string;className?:string;label:string}) {
  const ref=useRef<HTMLVideoElement>(null);
  const container=useRef<HTMLDivElement>(null);
  const [paused,setPaused]=useState(false);
  const [failed,setFailed]=useState(false);
  const userPaused=useRef(false);
  useEffect(()=>{
    const element=container.current;if(!element)return;
    let inView=false;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{
      const shouldPause=!inView||reduced.matches||document.hidden||userPaused.current;
      setPaused(shouldPause);
      const video=ref.current;
      if(video){if(shouldPause)video.pause();else video.play().catch(()=>setPaused(true));}
    };
    const obs=new IntersectionObserver(([entry])=>{inView=Boolean(entry?.isIntersecting);update();},{threshold:.15});
    obs.observe(element);reduced.addEventListener('change',update);document.addEventListener('visibilitychange',update);
    return()=>{obs.disconnect();reduced.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);};
  },[source]);
  const toggle=()=>{
    userPaused.current=!paused;setPaused(!paused);
    const video=ref.current;if(video){if(!paused)video.pause();else video.play().catch(()=>setPaused(true));}
  };
  const hero=className==='hero-film';
  return <div ref={container} className={`cinematic-media ${className} ${paused?'motion-paused':''}`}>
    {source&&!failed?<video ref={ref} poster={poster} loop muted playsInline preload="metadata" aria-label={alt} onError={()=>setFailed(true)}><source src={source} type="video/mp4"/></video>:hero?<><img className="sequence-poster" src={poster} alt={alt} fetchPriority="high"/><div className="continuous-scene"><ImplantScene paused={paused}/><div className="natural-smile"><img src="/images/luma-smile-v2.svg" alt=""/></div></div></>:<div className="studio-camera"><img src={poster} alt={alt} loading="lazy"/><span className="studio-camera-light" aria-hidden="true"/></div>}
    <button type="button" className="motion-control" onClick={toggle} aria-label={`${paused?'Play':'Pause'} ${label}`} aria-pressed={paused}><span aria-hidden="true">{paused?'▶':'Ⅱ'}</span>{paused?'Play motion':'Pause motion'}</button>
  </div>;
}
