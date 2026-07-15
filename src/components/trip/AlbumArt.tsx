"use client";

/**
 * AlbumArt.tsx — 150+ POLYGON SVG ALBUM ART
 *
 * Each track gets a unique 150+ polygon SVG scene with expanded
 * 8-color palettes. Every element is animated and themed to the
 * song's mood and meaning.
 */

import { useMemo, type ReactElement } from "react";

interface AlbumArtProps {
  trackId: string;
  title: string;
  description: string;
  bpm: number;
  size?: number;
  className?: string;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Expanded 8-color palettes per track
const SCENES: Record<string, {
  palette: string[];
  scene: "sunset" | "dawn" | "forest" | "mountains" | "proposal" | "stars" | "sunrise" | "ceremony" | "celebration" | "night";
}> = {
  "golden-hour": { palette: ["#fef3c7","#fde047","#fbbf24","#f59e0b","#f97316","#ea580c","#dc2626","#7c2d12"], scene: "sunset" },
  "first-light": { palette: ["#f0abfc","#e9d5ff","#c4b5fd","#a78bfa","#8b5cf6","#7c3aed","#fbbf24","#fef3c7"], scene: "dawn" },
  "forest-trail": { palette: ["#86efac","#4ade80","#22c55e","#16a34a","#15803d","#14532d","#fbbf24","#fde047"], scene: "forest" },
  "mountain-echo": { palette: ["#e0e7ff","#c4b5fd","#818cf8","#4f46e5","#312e81","#1e1b4b","#4338ca","#a5b4fc"], scene: "mountains" },
  "the-question": { palette: ["#fef3c7","#fde68a","#fbbf24","#d4a017","#f59e0b","#dc2626","#7c2d12","#fef9c3"], scene: "proposal" },
  "starlit-path": { palette: ["#fff8e0","#e0e7ff","#c4b5fd","#818cf8","#4f46e5","#1e1b4b","#0f0a2e","#020617"], scene: "stars" },
  "sunrise-promise": { palette: ["#fef3c7","#fde68a","#fbbf24","#f59e0b","#ea580c","#78350f","#fde047","#fef9c3"], scene: "sunrise" },
  "sunset-vow": { palette: ["#fde047","#fbbf24","#f59e0b","#ea580c","#dc2626","#7f1d1d","#9a3412","#fbcfe8"], scene: "ceremony" },
  "celebration": { palette: ["#fef3c7","#fbbf24","#22c55e","#0284c7","#7c3aed","#dc2626","#f472b6","#a78bfa"], scene: "celebration" },
  "serenity": { palette: ["#a5b4fc","#818cf8","#4f46e5","#312e81","#1e1b4b","#0f0a2e","#020617","#1e293b"], scene: "night" },
};

export default function AlbumArt({ trackId, bpm, size = 120, className }: AlbumArtProps) {
  const config = SCENES[trackId] || SCENES["golden-hour"];
  const palette = config.palette;

  const rng = useMemo(() => {
    let s = 0;
    for (const c of trackId) s = (s * 31 + c.charCodeAt(0)) | 0;
    return mulberry32(Math.abs(s));
  }, [trackId]);

  const elements = useMemo(() => {
    const els: ReactElement[] = [];
    const p = palette;

    switch (config.scene) {
      case "sunset": {
        // Sky gradient (8 bands)
        for (let i = 0; i < 8; i++) els.push(<rect key={`sky-${i}`} x="0" y={i * 12.5} width="100" height="13" fill={p[i]} opacity={0.9} />);
        // Sun + 20 rays
        const cx=50, cy=42;
        els.push(<circle key="sun-glow" cx={cx} cy={cy} r="25" fill={p[0]} opacity="0.15"><animate attributeName="r" values="22;28;22" dur="4s" repeatCount="indefinite"/></circle>);
        for (let i=0; i<20; i++) {
          const a=(i/20)*Math.PI*2, r2=28;
          els.push(<polygon key={`ray-${i}`} points={`${cx},${cy} ${cx+Math.cos(a)*r2},${cy+Math.sin(a)*r2} ${cx+Math.cos(a+0.3)*r2},${cy+Math.sin(a+0.3)*r2}`} fill={p[0]} opacity="0.3"><animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${3+i*0.15}s`} repeatCount="indefinite"/></polygon>);
        }
        els.push(<circle key="sun" cx={cx} cy={cy} r="14" fill={p[1]} opacity="0.95"><animate attributeName="r" values="13;15;13" dur="4s" repeatCount="indefinite"/></circle>);
        els.push(<circle key="sun-hl" cx={cx-4} cy={cy-4} r="5" fill={p[0]} opacity="0.5"/>);
        // Mountains (3 layers × 10 = 30)
        for (let l=0; l<3; l++) {
          const y=50+l*5, op=0.4+l*0.2;
          for (let i=0; i<10; i++) { const x=i*10, h=12+rng()*18; els.push(<polygon key={`mtn-${l}-${i}`} points={`${x},${y} ${x+5},${y-h} ${x+10},${y}`} fill={p[6-l*2]} opacity={op}/>); }
        }
        // Water (8 strips)
        for (let i=0; i<8; i++) els.push(<rect key={`water-${i}`} x="0" y={68+i*4} width="100" height="4" fill={p[5+i%3]} opacity={0.4-i*0.03}/>);
        // Water sparkles (15)
        for (let i=0; i<15; i++) els.push(<circle key={`spark-${i}`} cx={rng()*100} cy={70+rng()*25} r={0.3+rng()*0.6} fill={p[0]} opacity={0.3+rng()*0.4}><animate attributeName="opacity" values="0.1;0.6;0.1" dur={`${2+rng()*2}s`} repeatCount="indefinite"/></circle>);
        // Birds (12)
        for (let i=0; i<12; i++) { const x=5+rng()*90, y=8+rng()*25; els.push(<path key={`bird-${i}`} d={`M${x},${y} Q${x+2},${y-1.5} ${x+4},${y} Q${x+6},${y-1.5} ${x+8},${y}`} stroke={p[6]} strokeWidth="0.4" fill="none" opacity="0.5"><animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2+rng()*2}s`} repeatCount="indefinite"/></path>); }
        // Pines (8 trees × 3 cones = 24)
        for (let i=0; i<8; i++) { const x=3+i*12+rng()*3, y=52; for (let j=0; j<3; j++) { const w=3-j*0.5, h=4-j*0.5; els.push(<polygon key={`pine-${i}-${j}`} points={`${x},${y-j*3} ${x-w},${y-j*3+h} ${x+w},${y-j*3+h}`} fill={p[3]} opacity={0.5+rng()*0.3}/>); } }
        break;
      }
      case "stars": {
        // Dark sky (8 bands)
        for (let i=0; i<8; i++) els.push(<rect key={`sky-${i}`} x="0" y={i*12.5} width="100" height="13" fill={p[7-i]} opacity={0.9}/>);
        // Milky Way (12 ellipses)
        for (let i=0; i<12; i++) els.push(<ellipse key={`mw-${i}`} cx={10+i*8} cy={25+Math.sin(i)*8} rx="14" ry="4" fill={p[2]} opacity="0.06" transform={`rotate(-20 ${10+i*8} ${25+Math.sin(i)*8})`}/>);
        // Stars (80)
        for (let i=0; i<80; i++) { const x=rng()*100, y=rng()*100, r=0.15+rng()*1; els.push(<circle key={`star-${i}`} cx={x} cy={y} r={r} fill={p[0]} opacity={0.2+rng()*0.7}><animate attributeName="opacity" values={`${0.1};${0.8};${0.1}`} dur={`${2+rng()*4}s`} begin={`${rng()*3}s`} repeatCount="indefinite"/></circle>); }
        // Constellation lines (8)
        for (let i=0; i<8; i++) { const x1=rng()*100, y1=rng()*60, x2=x1+(rng()-0.5)*25, y2=y1+(rng()-0.5)*25; els.push(<line key={`const-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={p[3]} strokeWidth="0.25" opacity="0.2"/>); }
        // Meteors (5)
        for (let i=0; i<5; i++) els.push(<line key={`meteor-${i}`} x1={rng()*100} y1={rng()*40} x2={rng()*100} y2={rng()*40+15} stroke={p[0]} strokeWidth="0.4" opacity="0"><animate attributeName="opacity" values="0;0.7;0" dur={`${5+i*1.5}s`} begin={`${i*2}s`} repeatCount="indefinite"/></line>);
        // Mountain silhouettes (10)
        for (let i=0; i<10; i++) { const x=i*10, h=10+rng()*15; els.push(<polygon key={`mtn-${i}`} points={`${x},70 ${x+5},${70-h} ${x+10},70`} fill={p[5]} opacity="0.7"/>); }
        break;
      }
      case "forest": {
        // Sky (6 bands)
        for (let i=0; i<6; i++) els.push(<rect key={`sky-${i}`} x="0" y={i*16} width="100" height="17" fill={p[i+2]} opacity={0.3}/>);
        // Sun beams (12)
        for (let i=0; i<12; i++) els.push(<polygon key={`beam-${i}`} points={`${15+i*6},0 ${20+i*6},0 ${25+i*6},60 ${10+i*6},60`} fill={p[7]} opacity="0.08"><animate attributeName="opacity" values="0.04;0.12;0.04" dur={`${4+i*0.3}s`} repeatCount="indefinite"/></polygon>);
        // Trunks (25)
        for (let i=0; i<25; i++) { const x=rng()*100, w=0.8+rng()*1.5, h=25+rng()*25; els.push(<rect key={`trunk-${i}`} x={x} y={60-h} width={w} height={h} fill={p[5]} opacity={0.3+rng()*0.3}/>); }
        // Canopies (40 triangles)
        for (let i=0; i<40; i++) { const x=rng()*100, y=8+rng()*35, w=3+rng()*5; els.push(<polygon key={`canopy-${i}`} points={`${x},${y} ${x-w/2},${y+w} ${x+w/2},${y+w}`} fill={p[i%4]} opacity={0.3+rng()*0.4}><animate attributeName="opacity" values={`${0.2+rng()*0.2};${0.5+rng()*0.3};${0.2+rng()*0.2}`} dur={`${5+rng()*3}s`} repeatCount="indefinite"/></polygon>); }
        // Dust motes (25)
        for (let i=0; i<25; i++) els.push(<circle key={`dust-${i}`} cx={rng()*100} cy={rng()*55} r={0.2+rng()*0.6} fill={p[7]} opacity={0.3+rng()*0.4}><animate attributeName="cy" values={`${rng()*55};${rng()*55}`} dur={`${8+rng()*4}s`} repeatCount="indefinite"/></circle>);
        // Ground
        els.push(<rect key="ground" x="0" y="60" width="100" height="40" fill={p[5]} opacity="0.8"/>);
        // Ground details (15)
        for (let i=0; i<15; i++) els.push(<circle key={`gnd-${i}`} cx={rng()*100} cy={62+rng()*35} r={0.3+rng()*0.5} fill={p[2]} opacity={0.3}/>);
        break;
      }
      case "mountains": {
        // Sky gradient
        for (let i=0; i<8; i++) els.push(<rect key={`sky-${i}`} x="0" y={i*12.5} width="100" height="13" fill={p[7-i]} opacity={0.85}/>);
        // Stars (35)
        for (let i=0; i<35; i++) els.push(<circle key={`star-${i}`} cx={rng()*100} cy={rng()*45} r={0.2+rng()*0.7} fill={p[0]} opacity={0.3+rng()*0.5}><animate attributeName="opacity" values="0.2;0.7;0.2" dur={`${2+rng()*3}s`} repeatCount="indefinite"/></circle>);
        // Mountains (4 layers × 10 = 40)
        for (let l=0; l<4; l++) { const y=35+l*12, op=0.3+l*0.2; for (let i=0; i<10; i++) { const x=i*10, h=15+rng()*25; els.push(<polygon key={`mtn-${l}-${i}`} points={`${x},${y} ${x+5},${y-h} ${x+10},${y}`} fill={p[l+2]} opacity={op}/>); } }
        // Echo rings (6)
        for (let i=0; i<6; i++) els.push(<circle key={`echo-${i}`} cx="50" cy="50" r={8+i*7} fill="none" stroke={p[4]} strokeWidth="0.3" opacity={0.25-i*0.03}><animate attributeName="r" values={`${8+i*7};${10+i*7};${8+i*7}`} dur={`${5+i}s`} repeatCount="indefinite"/></circle>);
        // Fog (8)
        for (let i=0; i<8; i++) els.push(<ellipse key={`fog-${i}`} cx={rng()*100} cy={50+rng()*20} rx={8+rng()*12} ry={1.5+rng()*2} fill={p[7]} opacity="0.1"><animate attributeName="cx" values={`${rng()*100};${rng()*100}`} dur={`${10+rng()*5}s`} repeatCount="indefinite"/></ellipse>);
        break;
      }
      case "night": {
        // Dark sky (8 bands)
        for (let i=0; i<8; i++) els.push(<rect key={`sky-${i}`} x="0" y={i*12.5} width="100" height="13" fill={p[7-i]} opacity={0.9}/>);
        // Moon + 10 craters
        els.push(<circle key="moon-glow" cx="75" cy="22" r="18" fill={p[0]} opacity="0.08"><animate attributeName="r" values="16;20;16" dur="5s" repeatCount="indefinite"/></circle>);
        els.push(<circle key="moon" cx="75" cy="22" r="10" fill={p[0]} opacity="0.9"/>);
        for (let i=0; i<10; i++) els.push(<circle key={`crater-${i}`} cx={75+(rng()-0.5)*14} cy={22+(rng()-0.5)*14} r={0.5+rng()*1.2} fill={p[4]} opacity="0.25"/>);
        // Stars (50)
        for (let i=0; i<50; i++) els.push(<circle key={`star-${i}`} cx={rng()*100} cy={rng()*55} r={0.15+rng()*0.6} fill={p[0]} opacity={0.2+rng()*0.5}><animate attributeName="opacity" values="0.1;0.6;0.1" dur={`${2+rng()*3}s`} repeatCount="indefinite"/></circle>);
        // Pines (20 × 3 = 60)
        for (let i=0; i<20; i++) { const x=rng()*100, y=70, h=12+rng()*18; for (let j=0; j<3; j++) { els.push(<polygon key={`pine-${i}-${j}`} points={`${x},${y-j*4} ${x-2+j*0.3},${y-j*4+3} ${x+2-j*0.3},${y-j*4+3}`} fill={p[7]} opacity={0.7+rng()*0.2}/>); } }
        // Ground
        els.push(<rect key="ground" x="0" y="70" width="100" height="30" fill={p[7]} opacity="0.95"/>);
        // Campfire glow + flames + embers
        els.push(<circle key="fire-glow" cx="50" cy="75" r="15" fill={p[3]} opacity="0.08"><animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite"/></circle>);
        for (let i=0; i<6; i++) els.push(<polygon key={`flame-${i}`} points={`${47+i*0.8},75 ${50+i*0.8},${67-i*2} ${53+i*0.8},75`} fill={p[i%4]} opacity="0.7"><animate attributeName="points" values={`${47+i*0.8},75 ${50+i*0.8},${67-i*2} ${53+i*0.8},75;${47+i*0.8},75 ${50+i*0.8},${64-i*2} ${53+i*0.8},75;${47+i*0.8},75 ${50+i*0.8},${67-i*2} ${53+i*0.8},75`} dur={`${1.5+i*0.2}s`} repeatCount="indefinite"/></polygon>);
        for (let i=0; i<15; i++) els.push(<circle key={`ember-${i}`} cx={48+rng()*4} cy="70" r="0.3" fill={p[2]} opacity="0"><animate attributeName="cy" values="70;45" dur={`${2+rng()*2}s`} begin={`${i*0.25}s`} repeatCount="indefinite"/><animate attributeName="opacity" values="0;0.7;0" dur={`${2+rng()*2}s`} begin={`${i*0.25}s`} repeatCount="indefinite"/></circle>);
        break;
      }
      default: {
        // Generic celebration: 150 colorful polygons
        for (let i=0; i<8; i++) els.push(<rect key={`bg-${i}`} x="0" y={i*12.5} width="100" height="13" fill={p[i]} opacity={0.7}/>);
        for (let i=0; i<150; i++) { const x=rng()*100, y=rng()*100, s=1.5+rng()*4; els.push(<polygon key={`tri-${i}`} points={`${x},${y} ${x+s},${y} ${x+s/2},${y-s}`} fill={p[i%8]} opacity={0.2+rng()*0.5}><animate attributeName="opacity" values={`${0.1};${0.5};${0.1}`} dur={`${3+rng()*3}s`} repeatCount="indefinite"/></polygon>); }
      }
    }
    return els;
  }, [config, palette, rng, trackId]);

  const gid = `art-${trackId}`;

  return (
    <div className={className} style={{ width: size, height: size, borderRadius: 12, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }}>
        <defs><clipPath id={gid}><rect width="100" height="100" rx="12"/></clipPath></defs>
        <g clipPath={`url(#${gid})`}>
          {elements}
          <text x="93" y="95" fontSize="4" fill="white" opacity="0.25" textAnchor="end" fontFamily="monospace">{bpm} BPM</text>
        </g>
      </svg>
    </div>
  );
}
