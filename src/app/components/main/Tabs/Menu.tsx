"use client"
import { ACCENT, BACKGROUND, MODE, SECONDARY, SHOW_GRID, WORLD_ID, WORLD_NAME } from "@/app/data/globals";
import { useAtom } from "jotai";
import { motion } from 'framer-motion';
import style from "./styles.module.css";
import { modify, parseRGB, RGB2string, transparent } from "@/app/data/management";
import { themes } from "@/app/data/elements";
import React from "react";

export default function Menu() {
    const [current_mode, set_mode] = useAtom(MODE);
    const [accent, set_accent] = useAtom(ACCENT);
    const [secondary, set_secondary] = useAtom(SECONDARY);
    const [bgr, set_bgr] = useAtom(BACKGROUND);
    const [grid, set_grid] = useAtom(SHOW_GRID);
    const [world_name, SET_WORLD_NAME] = useAtom(WORLD_NAME);

    const SaveWorld = ()=>{
        // SAVE WORLD LOGIC
        
    }

    return (<motion.div
        className={style.Menu}
        style={{
            left: current_mode == "menu" ? "calc(76% - 1rem)" : "100%",
            zIndex: 10,
            border: `2px solid white`,
            display : "flex",
            flexDirection : "column"
        }}
    >
        <motion.textarea
            className={style.Title1}
            contentEditable
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                if (!event.target.value) return;
                if (event.target.value.length > 15) return;
                SET_WORLD_NAME(event.target.value);

            }}
            value={world_name}
        />
        <motion.p
            style={{
                textAlign: 'center',
                color: transparent(modify(bgr, 1.3), 0.3),
                marginBottom: '8%',
                fontFamily: "Poppins"
            }}
        >{WORLD_ID}</motion.p>
        <motion.div
            style={{
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                padding: '1rem',
                borderRadius: "0.8rem",
            }}
            animate={{
                background: transparent(secondary, 0.3),

            }}
        >

            {...themes.map(t => (<motion.div
                style={{
                    background: RGB2string(t.background),
                    width: 50,
                    aspectRatio: 1,
                    borderRadius: "0.8rem",
                }}
                onTap={() => {
                    set_bgr(RGB2string(t.background));
                    set_accent(RGB2string(t.accent));
                    set_secondary(RGB2string(t.secondary))
                }}
                whileHover={{
                    scale: 1.1
                }}
                whileTap={{
                    scale: 0.9
                }}
            />))}
        </motion.div>

        <motion.div
            style={{
                alignSelf : "end",
                background : "rgba(48, 237, 98, .3)",
                borderRadius : '.8rem',
                padding : 10,
                width : '100%',
                marginTop : 'auto',
                textAlign : 'center',
                userSelect : 'none'
            }}
            whileHover={{scale : 1.05}}
            whileTap={{scale : .9}}
            onClick={SaveWorld}
        >SAVE</motion.div>
    </motion.div >)
}