
import React, { useRef, useEffect } from "react";
import { motion, useTransform, useMotionValue, useSpring, useTime } from "framer-motion";
import { Link } from "react-router-dom";
import { useGame } from "@contexts/GameContext";
import { UsersIcon, ZapIcon, ShieldIcon, TrophyIcon, PlayIcon, ArrowRightIcon, StarIcon, GamepadIcon, TagIcon, InfectionIcon, HideAndSeekIcon, HeistIcon } from "@components/icons";

const features = [
  { icon: <UsersIcon className="w-8 h-8" />, title: "8 Unique Game Modes", description: "From classic Tag to strategic Spy & Decode - endless variety awaits" },
  { icon: <ZapIcon className="w-8 h-8" />, title: "Real-Time Multiplayer", description: "Lightning-fast gameplay with up to 8 players in seamless sync" },
  { icon: <ShieldIcon className="w-8 h-8" />, title: "Cross-Platform Ready", description: "Perfect experience on desktop, tablet, and mobile devices" },
  { icon: <TrophyIcon className="w-8 h-8" />, title: "Competitive Scoring", description: "Track your victories and climb the leaderboards" },
];

const gameHighlights = [
  { title: "Tag", description: "Classic chase gameplay with modern twists", color: "hsl(var(--error-hsl))", icon: <TagIcon className="w-10 h-10" /> },
  { title: "Infection Arena", description: "Survive the virus or spread the chaos", color: "hsl(var(--accent-hsl))", icon: <InfectionIcon className="w-10 h-10" /> },
  { title: "Hide & Seek", description: "Strategic stealth in dynamic mazes", color: "hsl(var(--primary-hsl))", icon: <HideAndSeekIcon className="w-10 h-10" /> },
  { title: "Heist Panic", description: "Crack codes under pressure to escape", color: "hsl(var(--warning-hsl))", icon: <HeistIcon className="w-10 h-10" /> },
];

const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const style = getComputedStyle(document.documentElement);
    const primaryColorHsl = style.getPropertyValue('--primary-hsl').trim();

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles: Particle[] = [];
    const mouse = { x: width / 2, y: height / 2 };

    class Particle {
      x: number; y: number; size: number; baseX: number; baseY: number; density: number;
      constructor() {
        this.x = Math.random() * width; this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 1;
        this.baseX = this.x; this.baseY = this.y;
        this.density = Math.random() * 30 + 1;
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = `hsla(${primaryColorHsl}, 0.5)`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
      }
      update() {
        let dx = mouse.x - this.x; let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance; let forceDirectionY = dy / distance;
        let maxDistance = 100; let force = (maxDistance - distance) / maxDistance;
        let directionX = (forceDirectionX * force * this.density); let directionY = (forceDirectionY * force * this.density);

        if (distance < maxDistance) {
          this.x -= directionX; this.y -= directionY;
        } else {
          if (this.x !== this.baseX) { let dx = this.x - this.baseX; this.x -= dx / 10; }
          if (this.y !== this.baseY) { let dy = this.y - this.baseY; this.y -= dy / 10; }
        }
      }
    }
    const init = () => { particles = Array.from({ length: 100 }, () => new Particle()); };
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };
    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        init();
    };
    const handleMouseMove = (event: MouseEvent) => { mouse.x = event.x; mouse.y = event.y; };

    init(); animate();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} id="interactive-bg-canvas" className="fixed top-0 left-0 w-full h-full -z-10" />;
};

const Atom = () => {
  const ref = useRef(null);
  const time = useTime();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ['17deg', '-17deg']), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ['-17deg', '17deg']), springConfig);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) / (width / 2);
    const y = (clientY - (top + height / 2)) / (height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };
  
  const ring1Rotation = useTransform(time, [0, 4000], [0, 360], { clamp: false });
  const ring2Rotation = useTransform(time, [0, 5000], [0, 360], { clamp: false });
  const ring3Rotation = useTransform(time, [0, 6000], [0, 360], { clamp: false });

  return (
    <motion.div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="w-full h-64 flex items-center justify-center [perspective:1000px]">
      <motion.div className="w-48 h-48 relative [transform-style:preserve-3d]" style={{ rotateX, rotateY }}>
        {/* Core */}
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/80 shadow-[0_0_20px_theme(colors.primary.DEFAULT)]" />

        {/* Rings */}
        <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateZ: ring1Rotation }}>
          <div className="absolute inset-0 rounded-full border-2 border-primary/50" style={{ transform: 'rotateY(70deg)' }} />
        </motion.div>
        <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateY: ring2Rotation }}>
          <div className="absolute inset-0 rounded-full border-2 border-accent-secondary/50" style={{ transform: 'rotateX(70deg)' }} />
        </motion.div>
         <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateX: ring3Rotation }}>
          <div className="absolute inset-0 rounded-full border-2 border-accent/50" style={{ transform: 'rotateZ(0deg)' }} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};


const GameShowcase: React.FC = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    return (
        <section className="py-24 px-4 bg-background">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Explore the Arena</h2>
                    <p className="text-xl text-text-secondary max-w-3xl mx-auto">Diverse game modes for every type of player. Find your favorite.</p>
                </motion.div>
                <div ref={carouselRef} className="overflow-x-auto scrollbar-thin pb-8 -mb-8">
                    <motion.div className="flex gap-8 w-max pr-8">
                        {gameHighlights.map((game, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, amount: 0.3 }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                              whileHover="hover"
                              className="relative w-72 h-80 rounded-2xl p-6 flex flex-col justify-end overflow-hidden group bg-surface-100 border border-border"
                               style={{'--glow-color': game.color} as React.CSSProperties}
                            >
                                <motion.div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 20px 3px var(--glow-color)' }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"/>
                                <motion.div variants={{hover: {scale: 1.1, color: game.color}}} transition={{duration: 0.3}} className="absolute top-6 left-6 text-text-secondary">
                                    {game.icon}
                                </motion.div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-text-primary mb-2">{game.title}</h3>
                                    <p className="text-text-secondary h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300">{game.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

const LandingPage: React.FC = () => {
  const { user } = useGame();

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      <InteractiveBackground />
      <section className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-background/50" />
        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto flex flex-col items-center">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.3 } } }}
                className="mb-4 text-center"
            >
                <div className="inline-flex items-center gap-3 bg-surface-100/50 backdrop-blur-sm border border-border rounded-full px-6 py-3 mb-8 animate-fade-in">
                    <StarIcon className="w-5 h-5 text-warning" />
                    <span className="text-sm font-medium">Now with 8 Game Modes</span>
                </div>

                 <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 text-text-primary relative">
                     <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }} className="block bg-gradient-to-r from-primary to-accent-secondary bg-clip-text text-transparent">
                        PIXEL
                     </motion.span>
                     <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2, ease: "easeOut" } } }} className="block">
                        ARENA
                     </motion.span>
                </h1>

                <motion.p
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.5, duration: 0.8 } } }}
                    className="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed"
                >
                    The ultimate multiplayer gaming experience. Battle friends in real-time across 8 unique game modes.
                    <span className="text-primary font-semibold"> No downloads required.</span>
                </motion.p>
            </motion.div>
            <Atom />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
          >
            <Link to={user ? "/lobby" : "/login"}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px hsla(var(--primary-hsl), 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="group bg-primary hover:bg-primary-hover text-on-primary px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg shadow-primary/25"
              >
                <PlayIcon className="w-6 h-6" />
                {user ? "Enter Lobby" : "Start Playing"}
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px hsla(var(--surface-200-hsl), 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="bg-surface-200 backdrop-blur-sm hover:bg-surface-100 text-text-primary px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 border border-border"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              <GamepadIcon className="w-6 h-6" />
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 bg-background border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Why Choose <span className="text-primary">Pixel Arena</span>?</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">Built for competitive multiplayer gaming with cutting-edge technology</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group bg-surface-100 border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
              >
                <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GameShowcase/>
      
       <footer className="py-12 px-4 bg-background border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-black mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PIXEL ARENA
            </span>
          </div>
          <p className="text-text-secondary">The ultimate multiplayer gaming experience. Built with ❤️ for gamers.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
