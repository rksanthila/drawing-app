import { Tooltip } from "antd";
import { useRef, useState, useEffect } from "react";
import { BiSquareRounded } from "react-icons/bi";
import { BsEraser } from "react-icons/bs";
import { FaPencil, FaPenFancy, FaRegCircle } from "react-icons/fa6";
import { GrRedo, GrUndo } from "react-icons/gr";
import { LiaMarkerSolid } from "react-icons/lia";
import { LuRectangleHorizontal } from "react-icons/lu";

const tools = [
  { id: "pencil", icon: <FaPencil />, title: "Pencil", lineWidth: 1 },
  { id: "pen", icon: <FaPenFancy />, title: "Pen", lineWidth: 3 },
  { id: "marker", icon: <LiaMarkerSolid />, title: "Marker", lineWidth: 5 },
  { id: "eraser", icon: <BsEraser />, title: "Eraser" },
  // { id: "rectangle", icon: <LuRectangleHorizontal />, title: "Rectangle" },
  // { id: "square", icon: <BiSquareRounded />, title: "Square" },
  // { id: "circle", icon: <FaRegCircle />, title: "Circle" },
];

const DrawingTool = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [redosteps, SetRedoSteps] = useState(true);
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [lineWidth, setLineWidth] = useState(1);
  const [color, setColor] = useState("#000000");
  // const [shapes, setShapes] = useState([]);
  //   const [selectedShape, setSelectedShape] = useState(null);
//   const [startX, setStartX] = useState(0); // Start X for drawing shapes
//   const [startY, setStartY] = useState(0);
  // Initialize the canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Set initial canvas size
    const setCanvasSize = () => {
      // const parent = canvas.parentElement;
      canvas.width = window.innerWidth / 1.5; // Set canvas width to parent width
      canvas.height = window.innerHeight / 1.3; // Set canvas height to 80% of parent height
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize); // Update canvas size on window resize
    setContext(ctx);
    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", setCanvasSize);
  }, []);
  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, imageData]);
    // setFuture([]); // Clear redo history after a new action
  };
  console.log('history',history);
  const undo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 2]; // Get the previous state
      setFuture((prev) => [...prev, history[history.length - 1]]); // Move current state to redo
      setHistory((prev) => prev.slice(0, -1));
      SetRedoSteps(false);
      if(lastState){
        context.putImageData(lastState, 0, 0); // Restore the previous state
      }
      else{
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    else{
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHistory([]);
    }
  };

  // Redo the last undone action
  console.log('future',future)
  const redo = () => {
    if (future.length !== 0) {
      const nextState = future[future.length - 1]; // Get the next state
      setHistory((prev) => [...prev, nextState]); // Move next state to history
      setFuture((prev) => prev.slice(0, -1));
      context.putImageData(nextState, 0, 0); // Restore the next state
      if(future.length === 1) return SetRedoSteps(true);
    } else {
      SetRedoSteps(true);
    }
  };
  // Start drawing
  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    context.lineWidth = lineWidth;
    context.strokeStyle = selectedTool === "eraser" ? "#FFFFFF" : color;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // Draw while moving the mouse
  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  // Stop drawing
  const stopDrawing = () => {
    context.closePath();
    saveCanvasState();
    setIsDrawing(false);
  };

  // Clear the canvas
  const clearCanvas = () => {
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setFuture([]);
    setHistory([]);
    SetRedoSteps(true);
  };
  const handleTool = (tool) => {
    setSelectedTool(tool?.id);
    setLineWidth(tool?.lineWidth);
    const x = 300; // Change this to your desired X coordinate
    const y = 200; // Change this to your desired Y coordinate
    const shapeSize = 100; // Square size (100x100)
    const shapeWidth = 150; // Rectangle width
    const shapeHeight = 100; // Rectangle height
    const circleRadius = 50; // Circle radius

    if (context) {
        context.lineWidth = 3;
        context.strokeStyle = tool?.id === "eraser" ? "#FFFFFF" : color;
        if (tool?.id === "rectangle") {
            context.strokeRect(x - shapeWidth / 2, y - shapeHeight / 2, shapeWidth, shapeHeight);
            saveCanvasState();
        } else if (tool?.id === "square") {
            context.strokeRect(x - shapeSize / 2, y - shapeSize / 2, shapeSize, shapeSize);
            saveCanvasState();
        } else if (tool?.id === "circle") {
            context.beginPath();
            context.arc(x, y, circleRadius, 0, Math.PI * 2);
            context.stroke();
            saveCanvasState();
        }
    }
  };
const download = () => {
    var canvas = document.getElementById("canvas");
    var url = canvas.toDataURL("image/png");
    var link = document.createElement('a');
    link.download = 'mydrawing.png';
    link.href = url;
    link.click();
  }
  return (
    <>
      <div
        style={{
          maxWidth: "300px",
          margin: "10px",
          padding: "20px",
          background: "#fff",
          borderRadius: "15px",
          boxShadow: "0px 10px 50px rgba(0, 0, 0, 0.32)",
          textAlign: "center",
          fontFamily: "cursive",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Tools</h3>
        {tools &&
          tools.map((tool) => (
            <div
              key={tool?.id}
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  selectedTool === tool.id ? "black" : "transparent",
                color: selectedTool === tool.id ? "white" : "black",
                transition: "0.3s",
              }}
              onClick={() => handleTool(tool)}
            >
              <Tooltip placement="rightTop" title={tool?.title}>
                {tool?.icon}
              </Tooltip>
            </div>
          ))}
        <Tooltip placement="rightTop" title={"Color"}>
          <input
          style={{marginTop:'10px'}}
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </Tooltip>
      </div>
      <div
        style={{
          margin: "10px",
          borderRadius: "15px",
          boxShadow: "0px 10px 50px rgba(0, 0, 0, 0.32)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontFamily: "cursive",
          }}
        >
          <div>
            <button onClick={clearCanvas} style={{ margin: "0px 10px" }}>
              Clear
            </button>
            <button
              onClick={undo}
              disabled={history.length === 0}
              style={{ margin: "0px 10px" }}
            >
              <GrUndo />
            </button>
            <button
              onClick={redo}
              disabled={redosteps}
              style={{ margin: "0px 10px" }}
            >
              <GrRedo />
            </button>
            <button onClick={download} style={{ margin: "0px 10px" }}>
              Download
            </button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
        />
      </div>
    </>
  );
};

export default DrawingTool;
