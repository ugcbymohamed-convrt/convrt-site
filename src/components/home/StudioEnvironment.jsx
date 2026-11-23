/* THE STUDIO ENVIRONMENT behind the English homepage's client-work stage: the curved, dark architectural room, the sweeping lime ring light in the ceiling, the lit olive wall, the dark floor and the
   raised two-tier podium. Everything is layered CSS (gradients, borders, shadows): no image, canvas or WebGL, nothing animates, and it is purely decorative (aria-hidden).

   It is drawn on a fixed design grid of 1280 x 740 (the reference's 1436 x 560 scaled by K) and positioned in PERCENTAGES of the scene, so the whole room scales with the scene. The numbers below are measured from the approved reference
   (ring light across the ceiling, podium 835 px wide with a lit rim, lower tier wider than the upper, olive wall on the right, glossy dark floor). The podium stays still while the videos rotate. */
const W = 1280
const H = 740
/* The room was measured on the reference's 1436 x 560 grid (stage centred at x = 765, featured video 200 px wide). The videos are now centred and 310 px wide, so the room is scaled by K about the scene's
   centre (CX), with a small vertical offset (OY): `b()` maps a box given in reference coordinates, and `S()` scales every px length in a shadow / border / blur string the same way, so the podium keeps its proportions. */
const K = 1.55
const CX = 640
const OY = 20
const REF_CX = 765
const b = (x, y, w, h) => ({ left: `${(((CX + (x - REF_CX) * K) / W) * 100).toFixed(3)}%`, top: `${(((y * K + OY) / H) * 100).toFixed(3)}%`, width: `${(((w * K) / W) * 100).toFixed(3)}%`, height: `${(((h * K) / H) * 100).toFixed(3)}%` })
const S = (str) => str.replace(/(-?\d*\.?\d+)px/g, (_, n) => `${+(Number(n) * K).toFixed(1)}px`)

export default function StudioEnvironment() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 11%, #000 89%, transparent 100%)', maskImage: 'linear-gradient(90deg, transparent 0, #000 11%, #000 89%, transparent 100%)' }}
    >
      {/* room: the base is a dark olive-black (measured from the reference); the two walls are curved shapes that turn toward the stage */}
      <div
        className="absolute inset-0"
        style={{ background: ['radial-gradient(ellipse 50% 30% at 50% 10%, rgba(66,76,22,0.2), transparent 72%)', 'linear-gradient(180deg, #11120b 0%, #16170d 55%, #0e0f09 100%)'].join(',') }}
      />
      {/* left wall: near-black, ending in a curved edge with a thin lit seam */}
      <div className="absolute rounded-[50%]" style={{ ...b(-420, 30, 890, 400), background: 'radial-gradient(ellipse 70% 80% at 20% 50%, #030304 0%, #07080a 55%, #12140a 100%)', boxShadow: S('inset -2px 0 0 rgba(150,170,60,0.12), 6px 0 30px rgba(110,125,40,0.1)') }} />
      {/* right wall: lit olive, brightest at the far edge, with a curved leading edge */}
      <div className="absolute rounded-[50%]" style={{ ...b(1035, 20, 760, 440), background: 'radial-gradient(ellipse 80% 80% at 80% 46%, #556022 0%, #363c17 46%, #1a1d0e 100%)', boxShadow: S('inset 2px 0 0 rgba(170,190,70,0.12), -8px 0 34px rgba(120,135,40,0.1)') }} />
      <div className="absolute" style={{ ...b(1040, 60, 120, 320), background: 'linear-gradient(90deg, rgba(110,122,40,0.3), transparent)', filter: S('blur(8px)') }} />

      {/* ceiling: the outer soffit arc, then the sweeping lime ring light with its olive glow */}
      <div className="absolute rounded-[50%]" style={{ ...b(235, -110, 1036, 190), borderBottom: S('2px solid rgba(255,255,255,0.09)'), background: 'radial-gradient(ellipse at 50% 100%, rgba(66,74,22,0.34), transparent 66%)' }} />
      <div
        className="absolute rounded-[50%]"
        style={{
          ...b(354, -52, 816, 136),
          borderBottom: S('8px solid rgba(244,255,190,0.99)'),
          background: 'radial-gradient(ellipse 70% 100% at 50% 100%, rgba(120,146,30,0.24), rgba(70,84,18,0.08) 55%, transparent 80%)',
          filter: S('drop-shadow(0 0 9px rgba(213,255,64,0.85)) drop-shadow(0 5px 18px rgba(180,225,40,0.34)) drop-shadow(0 -8px 22px rgba(160,200,30,0.34))'),
          WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0, #000 12%, #000 88%, rgba(0,0,0,0.6) 100%)',
          maskImage: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0, #000 12%, #000 88%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      {/* light falling from the ring onto the upper part of the videos */}
      <div className="absolute" style={{ ...b(580, 70, 370, 190), background: 'radial-gradient(ellipse at 50% 0%, rgba(190,235,60,0.1), transparent 70%)' }} />

      {/* floor: a dark glossy olive-grey that falls off toward the viewer, olive light pooling at the left, lime spill from the podium */}
      <div className="absolute" style={{ ...b(0, 340, W, 220), background: 'linear-gradient(180deg, rgba(14,15,10,0) 0, rgba(30,32,20,0.95) 14%, rgba(30,32,20,0.9) 34%, rgba(18,18,16,0.96) 78%, #101010 100%)' }} />
      <div className="absolute" style={{ ...b(0, 396, 480, 164), background: 'linear-gradient(100deg, rgba(120,126,52,0.5), rgba(80,86,32,0.26) 60%, transparent)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 22%, transparent 100%)', maskImage: 'linear-gradient(180deg, transparent 0, #000 22%, transparent 100%)' }} />
      <div className="absolute" style={{ ...b(1000, 396, 436, 164), background: 'linear-gradient(260deg, rgba(80,88,32,0.34), transparent 70%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 22%, transparent 100%)', maskImage: 'linear-gradient(180deg, transparent 0, #000 22%, transparent 100%)' }} />
      <div className="absolute rounded-[50%]" style={{ ...b(345, 420, 800, 46), borderTop: S('3px solid rgba(190,240,70,0.42)'), filter: S('blur(2px)'), opacity: 0.85 }} />
      <div className="absolute" style={{ ...b(240, 372, 1020, 170), background: 'radial-gradient(ellipse 50% 50% at 50% 22%, rgba(205,245,70,0.3), rgba(120,150,30,0.1) 48%, transparent 74%)' }} />

      {/* the podium's own shadow on the floor, then the glossy floor beyond it */}
      <div className="absolute rounded-[50%]" style={{ ...b(300, 404, 900, 62), background: 'radial-gradient(ellipse, rgba(0,0,0,0.78), transparent 72%)', filter: S('blur(10px)') }} />
      {/* podium, lower tier (wider): a glossy lit top, a clearly visible front face, a faint lit lip */}
      <div
        className="absolute rounded-[50%]"
        style={{
          ...b(352, 350, 830, 54),
          background: 'linear-gradient(90deg, #5a5e38 0%, #383c20 14%, #23261a 50%, #383c20 86%, #5a5e38 100%)',
          borderBottom: S('4px solid rgba(196,232,84,0.7)'),
          boxShadow: S('inset 0 3px 9px rgba(222,232,160,0.42), 0 9px 0 -1px #2e321e, 0 18px 0 -1px #181a0f, 0 26px 0 -1px #0a0b07, 0 27px 0 -1px rgba(150,182,48,0.4), 0 40px 44px -6px rgba(0,0,0,0.95)'),
        }}
      />
      {/* podium, upper tier: a continuous bright rim, a thick front face, lime light spilling onto the lower tier */}
      <div
        className="absolute rounded-[50%]"
        style={{
          ...b(408, 322, 715, 40),
          background: 'linear-gradient(90deg, #6b7048 0%, #3a3f22 12%, #1f2312 50%, #3a3f22 88%, #6b7048 100%)',
          borderBottom: S('5px solid rgba(244,255,196,0.99)'),
          boxShadow: S('inset 0 5px 12px rgba(225,240,150,0.34), 0 9px 0 -1px #343920, 0 18px 0 -1px #1c1f11, 0 27px 0 -1px #0b0c07, 0 0 46px rgba(190,240,60,0.5), 0 46px 46px -10px #000'),
        }}
      />
      {/* a glossy sheen across the upper tier's top surface */}
      <div className="absolute rounded-[50%]" style={{ ...b(412, 324, 700, 34), background: 'linear-gradient(180deg, rgba(255,255,225,0.2), rgba(255,255,225,0.03) 55%, transparent)' }} />
      {/* glossy reflections of the videos on the top surface, and the shadows they cast */}
      <div className="absolute rounded-[50%]" style={{ ...b(660, 338, 212, 30), background: 'radial-gradient(ellipse, rgba(0,0,0,0.7), transparent 72%)', filter: S('blur(5px)') }} />
      <div className="absolute rounded-[50%]" style={{ ...b(470, 330, 160, 22), background: 'radial-gradient(ellipse, rgba(0,0,0,0.5), transparent 72%)', filter: S('blur(5px)') }} />
      <div className="absolute rounded-[50%]" style={{ ...b(913, 330, 160, 22), background: 'radial-gradient(ellipse, rgba(0,0,0,0.5), transparent 72%)', filter: S('blur(5px)') }} />
      <div className="absolute rounded-[50%]" style={{ ...b(690, 346, 150, 12), background: 'radial-gradient(ellipse, rgba(213,255,64,0.34), transparent 72%)', filter: S('blur(5px)') }} />

      {/* the scene melts into the page: top and bottom fade to the page colour */}
      <div className="absolute inset-x-0 top-0 h-[14%]" style={{ background: 'linear-gradient(180deg, #0a0a0b, rgba(10,10,11,0))' }} />
      <div className="absolute inset-x-0 bottom-0 h-[12%]" style={{ background: 'linear-gradient(0deg, #0a0a0b, rgba(10,10,11,0))' }} />
    </div>
  )
}
