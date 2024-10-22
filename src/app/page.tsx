"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "./lib/Canvas";
import GLOBALS from "./lib/globals";
import { Game } from "./lib/Game";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameCanvas = useRef<Canvas>(null);
  const [ready, setReady] = useState(false);
  const gameRef = useRef<Game>(null);

  const draw = useCallback(() => {
    if (!gameCanvas.current) {
      return;
    }
    gameRef.current?.tick();
  }, []);

  useEffect(() => {
    async function init() {
      gameCanvas.current = new Canvas(canvasRef.current);

      gameRef.current = new Game(gameCanvas.current);
      await gameRef.current.init("littleroot/overworld");

      canvasRef.current.width =
        GLOBALS.viewPortWidth * gameCanvas.current.tileSize;
      canvasRef.current.height =
        GLOBALS.viewPortHeight * gameCanvas.current.tileSize;

      setReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    let animationFrameId: number;
    const render = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, ready]);

  const onKeyDown = (e) => {
    gameRef.current?.onKeyDown(e.code);
  };

  const onKeyUp = (e) => {
    gameRef.current?.onKeyUp(e.code);
  };

  return (
    <div onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={-1}>
      <canvas ref={canvasRef} />
    </div>
  );
}
