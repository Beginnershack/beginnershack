import { useLayoutEffect, useRef, useState } from "react";

// デザインは402px幅のキャンバスを前提に作られている。
// スマホの実幅は機種によって320px〜430pxほどとバラバラなので、
// 402pxとの比率で縦横比を保ったままキャンバスごと拡大縮小し、
// どの機種でも画面の幅・高さいっぱいに(余白なく)表示する。
// 640px以上(タブレット/PC)では402px幅で中央寄せ表示に切り替える。
//
// 幅の判定はTailwindのCSS(クラスの反映タイミングに依存する)を使わず、
// window.innerWidthから直接・同期的に計算する。読み込み直後の
// 一瞬(TailwindのCDN版はクラスをJITで後から反映する)でも
// ズレが起きないようにするため。
const DESIGN_WIDTH = 402;
const BREAKPOINT = 640; // Tailwindのsmブレークポイントに合わせる

function computeOuterWidth() {
  if (typeof window === "undefined") return DESIGN_WIDTH;
  return window.innerWidth < BREAKPOINT ? window.innerWidth : DESIGN_WIDTH;
}

function computeViewportHeight() {
  if (typeof window === "undefined") return 0;
  return window.visualViewport?.height || window.innerHeight;
}

export default function ResponsiveFrame({ children, className = "" }) {
  const contentRef = useRef(null);
  const [outerWidth, setOuterWidth] = useState(computeOuterWidth);
  const [viewportHeight, setViewportHeight] = useState(computeViewportHeight);
  const [naturalHeight, setNaturalHeight] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      setOuterWidth(computeOuterWidth());
      setViewportHeight(computeViewportHeight());
    };
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  // コンテンツ本来の高さ。min-heightのみを与えた素の要素で測るので、
  // 画像読み込みや後からのスタイル反映で高さが変わっても正しく追従する。
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setNaturalHeight(el.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  });

  const scale = outerWidth / DESIGN_WIDTH;
  const neededHeight = scale > 0 ? viewportHeight / scale : 0;

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ width: outerWidth, height: naturalHeight * scale || undefined }}
    >
      <div style={{ width: DESIGN_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <div
          ref={contentRef}
          className="bg-white"
          style={{ minHeight: neededHeight || undefined, "--rf-fill-height": `${neededHeight || 0}px` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
