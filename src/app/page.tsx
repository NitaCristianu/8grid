"use client"
import Euclidian from "./components/main/Geometry/Euclidian";
import Grid from "./components/main/Grid/Grid";
import Taskbar from "./components/main/Taskbar/Taskbar";
import EuclidianGallery from "./components/main/Tabs/EuclidianGallery";
import Actions from "./components/main/Tabs/Actions";
import Text from "./components/main/Text/Text";
import Menu from "./components/main/Tabs/Menu";
import GraphGallery from "./components/main/Tabs/GraphGallery";
import Graphs from "./components/main/Geometry/Graphs";
import { motion } from "framer-motion";

export default function Home() {
  // postgres
  // each world element is structured inside one string
  return (<>
    {/* <Grid />
    <Euclidian />
    <Text/>
    <Graphs />
    <Taskbar />
    <EuclidianGallery />
    <GraphGallery />
    <Menu />
    <Actions /> */}
    <div
      style={{
        width: "40%",
        left: '10%',
        height: '100%',
        position: "fixed"
      }}
    >
      <motion.div
        style={{
          height: "40%",
          top: "20%",
          position: "fixed",
          display: "flex",
          flexDirection: "row",
          gap: '5%',
        }}
      >
        <motion.button
          style={{
            background: "rgb(200, 76, 76)",
            color: "rgb(253, 253, 253)",
            width: '20rem',
            height: '3rem'
          }}
          whileHover={{
            scale: 1.1
          }}
        >ENTER WORLD</motion.button>
        <motion.textarea
          style={{
            background: "rgb(146, 50, 50)",
            color: "rgb(253, 253, 253)",
            width: '20rem',
            height: '3rem',
            resize: 'none',
            textAlign: "center",
          }}
          whileHover={{
            scale: 1.1
          }}
          value={""}
        />


      </motion.div>
      <motion.div
        style={{
          height: "40%",
          top: "30%",
          position: "fixed",
          display: "flex",
          flexDirection: "row",
          gap: '5%',
        }}
      >
        <motion.button
          style={{
            background: "rgb(76, 117, 200)",
            color: "rgb(253, 253, 253)",
            width: '20rem',
            height: '3rem'
          }}
          whileHover={{
            scale: 1.1
          }}
        >CREATE NEW WORLD</motion.button>

      </motion.div>

    </div>
  </>)
}