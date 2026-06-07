export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-black z-[-1]">
      {/* Dark Ambient Gradient Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,10,14,0.4)_0%,#000_100%)]" />

      {/* Animated Glowing Orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-ai-purple/15 mix-blend-screen filter blur-[130px] opacity-75 animate-blob" />
      <div className="absolute top-[25%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-ai-blue/12 mix-blend-screen filter blur-[130px] opacity-75 animate-blob" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-[-25%] left-[15%] w-[75vw] h-[75vw] rounded-full bg-indigo-500/10 mix-blend-screen filter blur-[150px] opacity-60 animate-blob" style={{ animationDelay: '6s' }} />
      
      {/* Refined Technical Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_15%,#000_30%,transparent_100%)]" />
      
      {/* Ambient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,transparent_30%,rgba(0,0,0,0.8)_80%)]" />
    </div>
  );
}
