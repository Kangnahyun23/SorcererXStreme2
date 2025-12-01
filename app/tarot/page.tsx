'use client';

import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Text, useTexture } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, Heart, Search, BookOpen, Send, Sparkles } from 'lucide-react';
import { Sidebar, useSidebarCollapsed } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FormattedContent } from '@/components/ui/FormattedContent';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { TAROT_DECK, TarotCard } from '@/lib/tarotData';
import * as THREE from 'three';

// Types
type ReadingMode = 'overview' | 'question' | 'love' | null;
type ReadingPhase = 'selection' | 'question_input' | 'shuffling' | 'picking' | 'reveal';

// 3D Card Component
const Card3D = ({
  position,
  rotation,
  onClick,
  hovered,
  setHover,
  index,
  phase,
  isSelected
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  onClick?: () => void;
  hovered?: boolean;
  setHover?: (h: boolean) => void;
  index: number;
  phase: ReadingPhase;
  isSelected: boolean;
}) => {
  const mesh = useRef<THREE.Group>(null);
  // Load texture
  const texture = useTexture('/tarot/card_back.png');

  // Smooth animation for position and rotation
  useFrame((state, delta) => {
    if (!mesh.current) return;

    // Slower damp for smoother, heavier feel
    const damp = 3;

    // Target scale
    const targetScale = hovered || isSelected ? 1.15 : 1;

    // Lerp position
    mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, position[0], delta * damp);
    mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, position[1], delta * damp);
    mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, position[2], delta * damp);

    // Lerp rotation
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, rotation[0], delta * damp);
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, rotation[1], delta * damp);
    mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, rotation[2], delta * damp);

    // Lerp scale
    mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, targetScale, delta * damp);
    mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, targetScale, delta * damp);
    mesh.current.scale.z = THREE.MathUtils.lerp(mesh.current.scale.z, targetScale, delta * damp);
  });

  return (
    <group
      ref={mesh}
      onClick={onClick}
      onPointerOver={() => setHover && setHover(true)}
      onPointerOut={() => setHover && setHover(false)}
    >
      {/* Card Body (Thickness) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 3.5, 0.02]} />
        <meshStandardMaterial
          color="#1e1b4b" // Dark indigo side
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Card Back with Texture */}
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[1.9, 3.4]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.4}
          metalness={0.2}
          emissive="#4c1d95"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Gold Border */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2, 3.5]} />
        <meshStandardMaterial
          color="#fbbf24" // Gold
          roughness={0.2}
          metalness={1}
        />
      </mesh>

      {/* Selection Glow */}
      {(hovered || isSelected) && (
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[2.2, 3.7]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};

// Scene Controller for managing card positions
const TarotScene = ({
  phase,
  onCardPick,
  selectedIndices
}: {
  phase: ReadingPhase;
  onCardPick: (index: number) => void;
  selectedIndices: number[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate positions based on phase
  const cards = useMemo(() => {
    // 20 cards for display
    return Array.from({ length: 20 }).map((_, i) => {
      let pos: [number, number, number] = [0, 0, -10];
      let rot: [number, number, number] = [0, 0, 0];

      if (phase === 'shuffling') {
        // Gentle floating stack
        const time = Date.now() * 0.001;
        // Cards float in a loose stack
        pos = [
          Math.sin(time + i * 0.1) * 0.5, // Slight X wobble
          Math.cos(time * 0.8 + i * 0.1) * 0.5, // Slight Y wobble
          i * 0.02 // Stacked in Z
        ];
        // Very slight rotation
        rot = [0, 0, Math.sin(time * 0.5 + i * 0.1) * 0.1];

      } else if (phase === 'picking') {
        // Clean horizontal arc (Fan)
        const totalCards = 20;
        const width = 14; // Total width of the spread
        const x = (i - (totalCards - 1) / 2) * (width / totalCards);

        // Arch effect
        const y = -Math.pow(x * 0.15, 2) + 1; // Parabola for gentle arc

        const isSelected = selectedIndices.includes(i);
        const isHovered = hoveredIndex === i;

        pos = [
          x,
          y,
          isSelected ? 2 : (isHovered ? 0.5 : i * 0.01) // Bring forward if selected/hovered
        ];

        if (isSelected) {
          pos[1] += 1; // Move up
        }

        if (isHovered && !isSelected) {
          pos[1] += 0.5; // Slight lift on hover
          pos[2] = 1; // Ensure it pops over neighbors
        }

        // Slight rotation to face center, but keep it readable
        // If hovered, straighten it out
        rot = [0, 0, isHovered ? 0 : -x * 0.05];
      }

      return { pos, rot };
    });
  }, [phase, hoveredIndex, selectedIndices]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {cards.map((card, i) => (
        <Card3D
          key={i}
          index={i}
          phase={phase}
          position={card.pos}
          rotation={card.rot}
          hovered={hoveredIndex === i}
          setHover={(h) => setHoveredIndex(h ? i : null)}
          onClick={() => phase === 'picking' && onCardPick(i)}
          isSelected={selectedIndices.includes(i)}
        />
      ))}
    </>
  );
};

export default function TarotPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const sidebarCollapsed = useSidebarCollapsed();
  const [readingMode, setReadingMode] = useState<ReadingMode>(null);
  const [phase, setPhase] = useState<ReadingPhase>('selection');
  const [selectedCards, setSelectedCards] = useState<(TarotCard & { isReversed: boolean })[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]); // Deck đã shuffle
  const [question, setQuestion] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const startReading = (mode: ReadingMode) => {
    setReadingMode(mode);
    if (mode === 'question') {
      setPhase('question_input');
    } else {
      beginShuffling();
    }
  };

  const beginShuffling = () => {
    // Shuffle deck một lần duy nhất
    const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    setShuffledDeck(shuffled);
    setPhase('shuffling');
    // Shuffle animation duration
    setTimeout(() => {
      setPhase('picking');
    }, 3000);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    beginShuffling();
  };

  const handleCardPick = async (index: number) => {
    // Xác định số lá bài cần chọn dựa trên mode
    const requiredCards = readingMode === 'question' ? 1 : 3;
    
    if (selectedIndices.length >= requiredCards || selectedIndices.includes(index)) return;

    const newIndices = [...selectedIndices, index];
    setSelectedIndices(newIndices);

    // Lấy lá bài từ shuffled deck theo index đã chọn
    const pickedCard = shuffledDeck[index];
    const isReversed = Math.random() > 0.8; // 20% chance reversed

    const newCard = { ...pickedCard, isReversed } as TarotCard & { isReversed: boolean };
    const newSelectedCards = [...selectedCards, newCard];
    setSelectedCards(newSelectedCards);

    // Khi đã chọn đủ số lá bài yêu cầu
    if (newIndices.length === requiredCards) {
      setTimeout(async () => {
        setPhase('reveal');
        await fetchTarotAnalysis(newSelectedCards);
      }, 1500);
    }
  };

  const fetchTarotAnalysis = async (cards: (TarotCard & { isReversed: boolean })[]) => {
    if (!token || !user) return;

    setIsLoadingAnalysis(true);

    try {
      const featureType = readingMode === 'question' ? 'question' : 'overview';
      
      const cardsDrawn = cards.map((card, index) => ({
        card_name: card.name,
        is_upright: !card.isReversed,
        // Nếu là question mode (1 lá): position = "answer"
        // Nếu là overview/love (3 lá): position = past/present/future
        position: readingMode === 'question' 
          ? 'answer' 
          : (index === 0 ? 'past' : index === 1 ? 'present' : 'future')
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tarot/reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          domain: 'tarot',
          feature_type: featureType,
          user_context: {
            name: user.name || '',
            gender: user.gender || 'other',
            birth_date: user.birth_date || ''
          },
          data: {
            question: question || null,
            cards_drawn: cardsDrawn
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.analysis || data.reading || '');
      } else {
        console.error('Failed to fetch tarot analysis');
      }
    } catch (error) {
      console.error('Error fetching tarot analysis:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const resetReading = () => {
    setReadingMode(null);
    setPhase('selection');
    setSelectedCards([]);
    setSelectedIndices([]);
    setShuffledDeck([]);
    setQuestion('');
    setAiAnalysis('');
    setIsLoadingAnalysis(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans text-white">
      <AnimatedBackground />
      <Sidebar />

      <main 
        className="flex-1 flex flex-col transition-all duration-200 relative z-10"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}
      >
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-6 z-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent" style={{ fontFamily: 'Pacifico, cursive' }}>
                Bói Bài Tarot
              </h1>
              <p className="text-sm text-gray-400 font-light mt-1">Khám phá định mệnh qua 78 lá bài huyền bí</p>
            </div>
            {phase !== 'selection' && (
              <Button
                onClick={resetReading}
                variant="secondary"
                className="border-white/20 hover:bg-white/10 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Trải bài mới
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === 'selection' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                  {/* Daily Reading */}
                  <ReadingOption
                    icon={<BookOpen className="w-8 h-8 text-white" />}
                    title="Tổng Quan Ngày Mới"
                    desc="Xem vận mệnh, công việc và tình cảm trong ngày của bạn qua 3 lá bài."
                    color="purple"
                    onClick={() => startReading('overview')}
                  />
                  {/* Question Reading */}
                  <ReadingOption
                    icon={<Search className="w-8 h-8 text-white" />}
                    title="Hỏi Đáp Cụ Thể"
                    desc="Đặt một câu hỏi cụ thể và nhận lời khuyên từ những lá bài Tarot."
                    color="blue"
                    onClick={() => startReading('question')}
                  />
                  {/* Love Reading */}
                  <ReadingOption
                    icon={<Heart className="w-8 h-8 text-white" />}
                    title="Bói Tình Yêu"
                    desc="Khám phá chuyện tình cảm, mối quan hệ và tương lai lứa đôi."
                    color="pink"
                    onClick={() => startReading('love')}
                  />
                </div>
              </motion.div>
            )}

            {phase === 'question_input' && (
              <motion.div
                key="question_input"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute inset-0 flex items-center justify-center p-8 z-50"
              >
                <div className="bg-black/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 max-w-2xl w-full shadow-2xl">
                  <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Hãy đặt câu hỏi của bạn
                  </h2>
                  <p className="text-gray-300 text-center mb-8">
                    Tập trung vào vấn đề bạn đang thắc mắc và nhập câu hỏi bên dưới.
                    Hãy hít thở sâu và giữ tâm trí tĩnh lặng.
                  </p>
                  <form onSubmit={handleQuestionSubmit} className="space-y-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ví dụ: Công việc của tôi trong tháng tới sẽ thế nào?"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-6 py-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        autoFocus
                      />
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="submit"
                        disabled={!question.trim()}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-lg font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Bắt đầu trải bài <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {(phase === 'shuffling' || phase === 'picking') && (
              <motion.div
                key="deck"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <div className="absolute top-8 left-0 right-0 text-center z-20 pointer-events-none">
                  <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                    {phase === 'shuffling' ? 'Đang tráo bài...' : (readingMode === 'question' ? 'Hãy chọn 1 lá bài' : 'Hãy chọn 3 lá bài')}
                  </h2>
                  <p className="text-gray-300 drop-shadow-md">
                    {phase === 'shuffling' ? 'Tập trung vào năng lượng của bạn' : `Đã chọn: ${selectedIndices.length}/${readingMode === 'question' ? 1 : 3}`}
                  </p>
                  {question && (
                    <div className="mt-4 inline-block bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                      <p className="text-blue-300 italic">"{question}"</p>
                    </div>
                  )}
                </div>

                <div className="w-full h-full">
                  <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
                    <TarotScene
                      phase={phase}
                      onCardPick={handleCardPick}
                      selectedIndices={selectedIndices}
                    />
                  </Canvas>
                </div>
              </motion.div>
            )}

            {phase === 'reveal' && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 overflow-auto p-8"
              >
                <div className="max-w-6xl mx-auto pb-20">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Pacifico, cursive' }}>
                      Kết Quả Trải Bài
                    </h2>
                    {question && (
                      <div className="inline-block bg-blue-500/10 border border-blue-500/20 px-8 py-4 rounded-2xl backdrop-blur-sm">
                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Câu hỏi của bạn</p>
                        <p className="text-xl text-blue-300 font-medium italic">"{question}"</p>
                      </div>
                    )}
                  </div>

                  <div className={`grid grid-cols-1 ${selectedCards.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : 'md:grid-cols-3'} gap-8 mb-12`}>
                    {selectedCards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50, rotateY: 90 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                        transition={{ delay: index * 0.3, duration: 0.8, type: "spring" }}
                        className="relative group perspective"
                      >
                        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all shadow-2xl">
                          {/* Card Image Placeholder */}
                          <div className="aspect-[2/3] bg-gray-900 rounded-xl mb-6 relative overflow-hidden shadow-inner border border-white/5 group-hover:shadow-purple-500/20 transition-all">
                            <div className={`absolute inset-0 bg-gradient-to-br ${getCardGradient(card.suit)} opacity-20`} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                              <span className="text-4xl mb-2">{getSuitIcon(card.suit)}</span>
                              <h4 className="text-xl font-serif font-bold text-white/90">{card.name}</h4>
                              {card.image && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-white">Image Placeholder</span>
                                </div>
                              )}
                            </div>

                            {/* Reversed Label */}
                            {/* @ts-ignore */}
                            {card.isReversed && (
                              <div className="absolute top-2 right-2 bg-red-500/80 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                Ngược
                              </div>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            {card.name}
                          </h3>

                          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                            <div className="p-3 bg-white/5 rounded-lg">
                              <span className="text-purple-400 font-semibold block mb-1 uppercase text-xs tracking-wider">Ý nghĩa chung</span>
                              {/* @ts-ignore */}
                              {card.isReversed ? card.meaning.reversed : card.meaning.upright}
                            </div>
                            {readingMode === 'love' && (
                              <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
                                <span className="text-pink-400 font-semibold block mb-1 uppercase text-xs tracking-wider">Tình yêu</span>
                                {card.meaning.love}
                              </div>
                            )}
                            {readingMode === 'overview' && (
                              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <span className="text-blue-400 font-semibold block mb-1 uppercase text-xs tracking-wider">Công việc</span>
                                {card.meaning.career}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* AI Analysis Section */}
                  {(isLoadingAnalysis || aiAnalysis) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="mb-12 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 shadow-2xl"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        <h3 className="text-2xl font-bold text-white">Phân Tích Chuyên Sâu từ AI</h3>
                      </div>
                      {isLoadingAnalysis ? (
                        <div className="flex items-center justify-center py-8">
                          <LoadingSpinner size="md" />
                          <span className="ml-3 text-gray-300">AI đang phân tích lá bài của bạn...</span>
                        </div>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <FormattedContent content={aiAnalysis} />
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex justify-center">
                    <Button
                      onClick={resetReading}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-500/20 text-lg font-medium transition-all hover:scale-105"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Trải bài khác
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Helper Components & Functions

const ReadingOption = ({ icon, title, desc, color, onClick }: any) => {
  const colorMap: any = {
    purple: "from-purple-500 to-indigo-500 hover:border-purple-500/50 shadow-purple-500/30 text-purple-300",
    blue: "from-blue-500 to-cyan-500 hover:border-blue-500/50 shadow-blue-500/30 text-blue-300",
    pink: "from-pink-500 to-rose-500 hover:border-pink-500/50 shadow-pink-500/30 text-pink-300"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, translateY: -10 }}
      className={`group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 transition-all cursor-pointer overflow-hidden ${colorMap[color].split(' ')[2]}`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color].split(' ')[0]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className={`w-16 h-16 bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} rounded-2xl flex items-center justify-center mb-6 shadow-lg ${colorMap[color].split(' ')[3]}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 mb-6">{desc}</p>
        <div className={`flex items-center font-medium ${colorMap[color].split(' ')[4]}`}>
          Bắt đầu ngay <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

function getCardGradient(suit: string | undefined) {
  switch (suit) {
    case 'wands': return 'from-orange-500 to-red-600';
    case 'cups': return 'from-blue-400 to-cyan-600';
    case 'swords': return 'from-gray-300 to-slate-500';
    case 'pentacles': return 'from-yellow-400 to-amber-600';
    default: return 'from-purple-500 to-indigo-600'; // Major
  }
}

function getSuitIcon(suit: string | undefined) {
  switch (suit) {
    case 'wands': return '🔥';
    case 'cups': return '🏆';
    case 'swords': return '⚔️';
    case 'pentacles': return '🪙';
    default: return '✨'; // Major
  }
}
