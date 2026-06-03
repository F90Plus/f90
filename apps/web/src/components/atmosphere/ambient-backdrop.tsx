/**
 * Page-wide ambient atmosphere — the whole experience sits inside a night stadium.
 * Ultra-subtle: drifting + breathing floodlight glows and a faint broadcast grid,
 * fixed behind all content. Pure CSS; reduced-motion neutralizes the movement.
 */
export function AmbientBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* faint broadcast grid, fading toward the top */}
      <div className="bg-broadcast-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(125%_125%_at_50%_0%,black,transparent_72%)]" />

      {/* floodlight glows: one drifting, two slowly breathing */}
      <div className="animate-glow-drift absolute -top-1/4 left-1/4 h-[42rem] w-[42rem] rounded-full bg-led-500/[0.07] blur-[170px]" />
      <div className="animate-breathe absolute top-1/3 -right-40 h-[34rem] w-[34rem] rounded-full bg-volt-500/[0.05] blur-[170px]" />
      <div
        className="animate-breathe absolute -bottom-20 left-0 h-[30rem] w-[30rem] rounded-full bg-pitch-500/[0.045] blur-[170px]"
        style={{ animationDelay: '-4.5s' }}
      />
    </div>
  );
}
