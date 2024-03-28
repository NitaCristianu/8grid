"use client"
import { motion } from "framer-motion";
import style from "./styles.module.css";
import { useAtom } from "jotai";
import { ACCENT, GRID_POSITION, MODE, PLACING, POINT_RADIUS, SECONDARY, SELECTED, VARIABLES, blocks as placement } from "@/app/data/globals";
import { useEffect, useRef, useState } from "react";
import useResize from "@/app/hooks/useResize";
import { AddPoint, DoesSegmentExist, GetAnyHoveringPoint, GetHoveringPoint, ObtainPosition, getCoords, getUniqueTag, toGlobal, toLocal, transparent } from "@/app/data/management";
import { Anchors, ePoints_Calc_data, ePoints_data, eSegments_data, labels_data } from "@/app/data/elements";
import { v4 } from "uuid";
import { tips } from "@/app/data/props";
import { BACKGROUND } from '../../../data/globals';

export default function EuclidianGallery() {
    const [placing, setPlacing] = useAtom(PLACING);
    const [current_mode, set_mode] = useAtom(MODE);

    const essentials: placement[] = ["ePoint", "eSegment", "text", "graph", "anchor"];
    const construct: placement[] = ["eCenter", "ePerpendicular"];

    const [accent, __] = useAtom(ACCENT);
    const [sec] = useAtom(SECONDARY);
    const [bgr, ___] = useAtom(BACKGROUND);

    const canvas_ref = useRef<HTMLCanvasElement>(null);
    const gallery_ref = useRef<HTMLDivElement>(null);
    const size = useResize();
    const [mpos, set_mpos] = useState({ 'x': 0, 'y': 0 });
    const [offset, _] = useAtom(GRID_POSITION);

    const [points_data, set_points_data] = useAtom(ePoints_data);
    const [points_calc_data, set_points_calc_data] = useAtom(ePoints_Calc_data);
    const [segments_data, set_segmments_data] = useAtom(eSegments_data);
    const [anchor_data, set_anchor_data] = useAtom(Anchors);
    const [labels, set_labels] = useAtom(labels_data);
    const [inuse, set_inuse] = useState<string[]>([]);
    const [variables, set_variables] = useAtom(VARIABLES);

    useEffect(() => {
        const canvas = canvas_ref.current as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = size.x;
        canvas.height = size.y;

        ctx.fillStyle = accent;
        ctx.strokeStyle = accent;
        ctx.shadowBlur = 10;
        ctx.shadowColor = accent;
        ctx.lineWidth = 5;

        const offseted_mpos = toGlobal(mpos, offset);
        const { isHovering, Hovering_id, isCalculated } = GetAnyHoveringPoint(offseted_mpos, points_data, points_calc_data, variables);

        if (current_mode != "euclidian") return;
        ctx.beginPath();

        if ((placing == "eCenter" || placing == "ePerpendicular" || placing == "eSegment") && inuse.length > 0) {
            var index = points_data.findIndex(p => p.id == inuse.at(inuse.length - 1));
            var coords;
            if (index == -1) {
                index = points_calc_data.findIndex(p => p.id == inuse.at(inuse.length - 1));
                coords = ObtainPosition(points_calc_data[index].formula, points_data, points_calc_data, variables);
            } else {
                coords = getCoords(points_data[index]);
            }
            coords = toLocal(coords, offset);
            ctx.moveTo(coords.x, coords.y);
            var lineto = { x: 0, y: 0 };
            if (isHovering) {
                let index = (points_data.findIndex(p => p.id == Hovering_id))
                var x, y;
                if (isCalculated) {
                    index = points_calc_data.findIndex(p => p.id == Hovering_id);
                    const pos = ObtainPosition(points_calc_data[index].formula, points_data, points_calc_data, variables);
                    x = pos.x;
                    y = pos.y;
                } else {
                    const pos = getCoords(points_data[index]);
                    x = pos.x;
                    y = pos.y;
                }
                const transformed = toLocal({ x: x, y: y }, offset);
                lineto = transformed;
            } else
                lineto = mpos;

            if (placing == "eCenter") {
                ctx.arc((coords.x + lineto.x) / 2, (coords.y + lineto.y) / 2, 10, 3, 2 * Math.PI);
            }
            ctx.stroke();
        }

        ctx.moveTo(mpos.x, mpos.y);
        if (!isHovering)
            ctx.arc(mpos.x, mpos.y, POINT_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
    }, [inuse, size, mpos, placing, offset, points_data, eSegments_data])

    useEffect(() => {
        const mouseDown = (event: MouseEvent) => {
            if (current_mode != "euclidian") return;
            if (event.clientX < 7 * 16) return;
            const rect = gallery_ref.current != null ? gallery_ref.current.getBoundingClientRect() : null;
            if (rect && rect.left < event.clientX &&
                rect.right > event.clientX &&
                rect.top < event.clientY &&
                rect.bottom > event.clientY) return;
            const offseted_mpos = toGlobal(mpos, offset);
            const { isHovering, Hovering_id, isCalculated } = GetAnyHoveringPoint(offseted_mpos, points_data, points_calc_data, variables);
            if (placing == "ePoint" && event.button == 0) {
                if (!isHovering) {
                    set_points_data(prev => [...prev, {
                        x: offseted_mpos.x,
                        y: offseted_mpos.y,
                        id: v4(),
                        color: accent,
                        tag: getUniqueTag(points_data, points_calc_data)
                    }]);
                }
            } else if (placing == "eSegment" && event.button == 0) {
                if (inuse.length > 0 && event.button == 0) {
                    if (isHovering) {
                        const segment = {
                            from: inuse.at(inuse.length - 1) || "",
                            to: Hovering_id,
                            id: v4(),
                            color: "white",
                            renderMode: "only-segment"
                        }
                        if (!DoesSegmentExist(segment, segments_data)) {
                            set_segmments_data(prev => [...prev, segment])
                            set_inuse(prev => [...prev, Hovering_id]);
                        }

                    } else {
                        const new_point_id = v4();
                        // no need to verify wheter the semgent exists because a new unique point is created
                        set_points_data(prev => [...prev, {
                            x: offseted_mpos.x,
                            y: offseted_mpos.y,
                            id: new_point_id,
                            color: "white",
                            tag: getUniqueTag(points_data, points_calc_data)
                        }])
                        set_segmments_data(prev => [...prev, {
                            from: inuse.at(inuse.length - 1) || "",
                            to: new_point_id,
                            id: v4(),
                            color: "white",
                            renderMode: "only-segment"
                        }])
                        set_inuse(prev => [...prev, new_point_id]);
                    }
                }
            } else if (placing == "eCenter" && event.button == 0) {
                if (inuse.length > 0 && event.button == 0 && Hovering_id) {
                    const id = v4();
                    var formula: string;
                    const p_from_index = points_data.findIndex(p => p.id == Hovering_id);
                    const c_from_index = points_calc_data.findIndex(p => p.id == Hovering_id);
                    const p_to_index = points_data.findIndex(p => p.id == inuse.at(inuse.length - 1));
                    const c_to_index = points_calc_data.findIndex(p => p.id == inuse.at(inuse.length - 1));
                    var fromTag, toTag;
                    fromTag = p_from_index > -1 ? points_data[p_from_index].tag : points_calc_data[c_from_index].tag;
                    toTag = p_to_index > -1 ? points_data[p_to_index].tag : points_calc_data[c_to_index].tag;
                    formula = `(${fromTag} + ${toTag})/2`;
                    if (Hovering_id != inuse.at(inuse.length - 1)) {
                        set_points_calc_data(prev => [...prev, {
                            formula: formula,
                            id: id,
                            tag: getUniqueTag(points_data, points_calc_data),
                            color: "white"
                        }])
                        set_inuse(prev => [...prev, id]);
                    }
                }
            } else if (placing == "ePerpendicular" && event.button == 0) {
                if (inuse.length > 0 && event.button == 0 && Hovering_id) {
                    const id = v4();
                    var formula: string;
                    const p_from_index = points_data.findIndex(p => p.id == Hovering_id);
                    const c_from_index = points_calc_data.findIndex(p => p.id == Hovering_id);
                    const p_to_index = points_data.findIndex(p => p.id == inuse.at(inuse.length - 1));
                    const c_to_index = points_calc_data.findIndex(p => p.id == inuse.at(inuse.length - 1));
                    var fromTag, toTag;
                    fromTag = p_from_index > -1 ? points_data[p_from_index].tag : points_calc_data[c_from_index].tag;
                    toTag = p_to_index > -1 ? points_data[p_to_index].tag : points_calc_data[c_to_index].tag;
                    const angle = Math.PI;
                    formula = `
                    x: ${fromTag}.x + (${toTag}.x + (${fromTag}.x*-1)) * Math.cos(${angle}) - (${toTag}.y + (${fromTag}.y) * -1) * Math.sin(${angle})
                    y: ${fromTag}.y + (${toTag}.x + (${fromTag}.x*-1)) * Math.sin(${angle}) + (${toTag}.y + (${fromTag}.y) * -1) * Math.cos(${angle})`
                        ;
                    if (Hovering_id != inuse.at(inuse.length - 1)) {
                        set_points_calc_data(prev => [...prev, {
                            formula: formula,
                            id: id,
                            tag: getUniqueTag(points_data, points_calc_data),
                            visible: false,
                            color: "white"
                        }])
                        set_inuse(prev => [...prev, id]);
                        set_segmments_data(prev => [...prev, {
                            from: Hovering_id,
                            to: id,
                            id: v4(),
                            color: "white",
                            renderMode: "only-line",

                        }])
                    }
                }
            } else if (placing == "text" && event.button == 0) {
                set_labels(prev => [...prev, {
                    top: offseted_mpos.y,
                    left: offseted_mpos.x,
                    content: "double click to edit me",
                    id: v4()
                }])
            } else if (placing == "anchor" && event.button == 0) {
                set_anchor_data(prev => [...prev, {
                    name: "new anchor",
                    x: offseted_mpos.x,
                    y: offseted_mpos.y
                }])
            }
            if (isHovering && inuse.findIndex(id => id == Hovering_id) == -1 && event.button == 0) set_inuse(prev => [...prev, Hovering_id]);
            if (event.button == 2) set_inuse([]);

        }
        const mousemove = (event: MouseEvent) => {
            set_mpos({ 'x': event.clientX, 'y': event.clientY });
        }
        window.addEventListener("mousedown", mouseDown);
        window.addEventListener("mousemove", mousemove);
        return () => {
            window.removeEventListener("mousedown", mouseDown);
            window.removeEventListener("mousemove", mousemove);
        }
    }, [points_data, inuse, mpos, size, eSegments_data]);
    return (
        <>
            <canvas
                ref={canvas_ref}
                style={{
                    width: '100%',
                    height: '100%',
                    position: "fixed"
                }}
            />
            <motion.p style={{
                position: 'fixed',
                width: '100%',
                fontFamily: "Poppins",
                textAlign: 'center',
                top: "100%",
                zIndex: 10,
            }}
                animate={{
                    top: current_mode == "euclidian" ? "95%" : "100%",
                }}
            >{placing != null ? tips[placing] : "Select any element from the gallery"}
            </motion.p>
            <motion.div
                className={style.EuclidianGallery}
                ref={gallery_ref}
                style={{
                    left: current_mode == "euclidian" ? "calc(70% - 1rem)" : "100%",
                    border: `2px solid ${accent}`,
                    zIndex: 10,
                }}

            >
                <h1 className={style.Title1} style={{ color: accent }} >ESSENTIALS</h1>
                <br />
                <br />
                <br />
                <motion.div
                    style={{
                        width: "100%",
                        flexDirection: 'row',
                        display: 'flex',
                        alignContent: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: "2rem",
                    }}
                >

                    {...essentials.map(type =>
                        <motion.div
                            className={style.Card}
                            key={type}
                            style={{
                                boxShadow: placing == type ? `0 0 10px 2px ${accent}` : "",
                                background: transparent(sec, .3)
                            }}
                            whileHover={{
                                scale: 1.1
                            }}
                            whileTap={{
                                scale: 0.9
                            }}
                            onTap={() => {
                                setPlacing(type);
                            }}
                        >
                            <div style={{ scale: 0.5 }}>
                                {type == "ePoint" ?
                                    <div>
                                        <h1 style={{
                                            position: "fixed",
                                            color: bgr,
                                            fontSize: `calc(2.4rem)`,
                                            lineHeight: '147%',
                                            fontFamily: "Poppins",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            width: "100%",
                                            height: "100%",
                                            userSelect: "none"
                                        }} >A</h1>
                                        <svg fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="-1.5 -2 3 3">
                                            <path d="M 0 -2 A 1 1 0 0 0 0 1 A 1 1 0 0 0 0 -2 M 0 -2" />
                                        </svg>
                                    </div> : null}
                                {type == "eSegment" ? <svg fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="Flat">
                                    <path d="M214.62793,86.62695a32.0716,32.0716,0,0,1-38.88245,4.94141L91.56836,175.74561a32.00172,32.00172,0,1,1-50.19629-6.37256l.00049-.001a32.05731,32.05731,0,0,1,38.88208-4.94043l84.177-84.17725a32.00172,32.00172,0,1,1,50.19629,6.37256Z" />
                                </svg> : null}
                                {type == "text" ? <div style={{
                                    marginTop: -15,
                                    fontSize: "3.5rem",
                                    fontFamily: "sans-serif",
                                    userSelect: 'none',
                                    color: "white"
                                }} >T</div> : null}
                                {type == "graph" ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 5V19C4 19.5523 4.44772 20 5 20H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M18 9L13 13.9999L10.5 11.4998L7 14.9998" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg> : null}
                                {type == "anchor" ? <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 52 52" >
                                    <path d="M48,35.7l-2.4-10.2c-0.3-1.1-1.7-1.5-2.5-0.8l-7.7,7.1c-0.9,0.8-0.5,2.2,0.6,2.5l3.3,1c-0.3,0.7-0.6,1.4-1,2  c-1.8,3-4.7,4.9-9.3,5.5v-25c2.6-1.1,4.4-3.7,4.4-6.7c0-4-3.3-7.3-7.3-7.3c-4.1,0-7.3,3.3-7.3,7.3c0,3,1.8,5.5,4.4,6.7v25  c-4.6-0.6-7.5-2.5-9.3-5.5c-0.4-0.7-0.7-1.3-1-2l3.3-1c1.1-0.3,1.4-1.8,0.6-2.5l-7.8-7c-0.9-0.8-2.2-0.4-2.5,0.8L4,35.7  c-0.3,1.1,0.8,2.1,1.9,1.8l2.6-0.8c0.4,1.1,0.8,2.1,1.4,3.1c2.9,4.9,8.2,7.8,16,7.8s13-2.9,16-7.8c0.6-1,1.1-2.1,1.4-3.1l2.6,0.8  C47.2,37.8,48.2,36.8,48,35.7z M26,14.2c-1.6,0-2.9-1.3-2.9-2.9s1.3-2.9,2.9-2.9s2.9,1.3,2.9,2.9S27.6,14.2,26,14.2z" />
                                </svg> : null}
                            </div>
                        </motion.div>)}

                </motion.div>
                <h1 className={style.Title1} style={{ color: accent }} >CONSTRUCT</h1>
                <br />
                <br />
                <br />
                <motion.div
                    style={{
                        width: "100%",
                        flexDirection: 'row',
                        display: 'flex',
                        alignContent: "center",
                        justifyContent: "center",
                        gap: "2rem"
                    }}
                >

                    {...construct.map(type =>
                        <motion.div
                            className={style.Card}
                            key={type}
                            style={{
                                boxShadow: placing == type ? `0 0 10px 2px ${accent}` : "",
                                background: transparent(sec, .3)
                            }}
                            whileHover={{
                                scale: 1.1
                            }}
                            whileTap={{
                                scale: 0.9
                            }}
                            onTap={() => {
                                setPlacing(type);
                            }}
                        >
                            <div style={{ scale: 0.5 }}>
                                {type == "eCenter" ? <svg fill="white" style={{ scale: 1.2 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                    <g id="turf-midpoint">
                                        <circle cx="49.331" cy="50.493" r="6.845" />
                                        <path scale={1.9} d="M85.331,23.338c-4.877,0-8.845-3.968-8.845-8.845c0-4.877,3.968-8.845,8.845-8.845s8.845,3.968,8.845,8.845   C94.176,19.37,90.208,23.338,85.331,23.338z M85.331,9.648c-2.672,0-4.845,2.173-4.845,4.845c0,2.671,2.173,4.845,4.845,4.845   s4.845-2.173,4.845-4.845C90.176,11.821,88.003,9.648,85.331,9.648z" />
                                        <path d="M14.331,94.338c-4.877,0-8.845-3.968-8.845-8.845s3.968-8.845,8.845-8.845c4.877,0,8.845,3.968,8.845,8.845   S19.208,94.338,14.331,94.338z M14.331,80.648c-2.672,0-4.845,2.173-4.845,4.845s2.173,4.845,4.845,4.845   c2.671,0,4.845-2.173,4.845-4.845S17.002,80.648,14.331,80.648z" />
                                    </g>
                                    <g id="Layer_1">
                                    </g>
                                </svg> : null}
                                {type == "ePerpendicular" ? <svg fill="white" style={{ scale: 1.2 }} xmlns="http://www.w3.org/2000/svg" viewBox="1.05451 1.77808 45.02 32.87">
                                    <path d="M 9.9079 21.5135 A 1 1 75 0 0 1.1453 19.7204 A 1 1 75 0 0 9.9079 21.5135 M 9 20 L 8 23 L 30 27 M 8 23 L 29 30 L 30 27 M 9.9079 21.5135 A 1 1 75 0 0 1.1453 19.7204 A 1 1 75 0 0 9.9079 21.5135 M 37.1619 26.6342 A 1 1 75 0 0 29.5039 32.8272 A 1 1 75 0 0 37.1619 26.6342 M 36 27 L 42 10 L 39 9 L 33 26 M 37.074 6.9875 A 1 1 75 0 0 46.0261 5.624 A 1 1 75 0 0 37.074 6.9875" fill="" />
                                </svg> : null}

                            </div>
                        </motion.div>)}

                </motion.div>


            </motion.div>
        </>)
}