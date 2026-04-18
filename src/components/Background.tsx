export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-ai-dark z-[-1]">
      {/* Animated Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-ai-purple/10 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-ai-blue/10 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob" style={{ animationDelay: '4s' }} />
      
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
}
