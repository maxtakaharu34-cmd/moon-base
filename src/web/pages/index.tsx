import MoonGame from '../components/MoonGame';
export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000005] via-[#050520] to-[#000005] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
          🌙 月面基地
        </h1>
        <p className="text-cyan-400/60 text-sm mt-1">Low gravity lunar platformer · 3 missions</p>
      </div>
      <MoonGame />
      <p className="text-cyan-400/20 text-xs mt-4">Collect moon crystals · Defeat aliens · Reach the rocket</p>
    </div>
  );
}
