import React, {useEffect, useState} from "react";
import {theme} from "../../themes/theme";

export default function ProblemConnections({containerRef, connections}) {
    const [paths, setPaths] = useState([]);

    useEffect(()=>{
        function buildPaths(){
            if(!containerRef.current) return;
            const parent = containerRef.current.getBoundingClientRect();

            const newPaths = connections.map(([startRef, endRef])=>{
                if(!startRef.current || !endRef.current) return null;

                const start = startRef.current.getBoundingClientRect();
                const end = endRef.current.getBoundingClientRect();
                const sx = start.left + start.width / 2 - parent.left;
                const sy = start.top + start.height / 2 - parent.top;
                const ex = end.left + end.width / 2 - parent.left;
                const ey = end.top + end.height / 2 - parent.top;
                const dx = Math.abs(ex - sx) * 0.5;

                return `
                    M ${sx} ${sy}
                    C ${sx + dx} ${sy},
                      ${ex - dx} ${ey},
                      ${ex} ${ey}
                `;
            });
            setPaths(newPaths.filter(Boolean));
        }

        buildPaths();
        window.addEventListener("resize", buildPaths);
        const observer = new ResizeObserver(buildPaths);
        if(containerRef.current){
            observer.observe(containerRef.current);
        }
        
        return ()=>{
            observer.disconnect();
            window.removeEventListener("resize", buildPaths);
        };
    }, [containerRef, connections]);

    return (
        <svg width="100%" height="100%"
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: -100
            }}
        >
            <defs>
                <filter id="connectionGlow">
                    <feGaussianBlur stdDeviation="20" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            {
                paths.map((d, index)=>(
                    <React.Fragment key={index}>
                        {/* Dotted Path */}
                        <path
                            d={d}
                            fill="none"
                            stroke={theme.primary}
                            strokeWidth="3"
                            strokeDasharray="4 10"
                            strokeLinecap="round"
                            opacity="0.2"
                        />
                        {/* Moving encrypted packets */}
                        {
                            [0, 1, 2].map(packet=>(
                                <circle key={packet} r="3" fill={theme.primary} filter="url(#connectionGlow)">
                                    <animateMotion
                                        dur={`${4 + index * 0.3}s`}
                                        begin={`${packet * 1.3}s`}
                                        repeatCount="indefinite"
                                        path={d}
                                    />
                                </circle>
                            ))
                        }
                    </React.Fragment>
                ))
            }
        </svg>
    );
}
