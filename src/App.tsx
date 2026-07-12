/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, 
  Heart, 
  Share2, 
  Copy, 
  Sun, 
  Moon, 
  MessageSquare, 
  Check, 
  X, 
  ChevronUp, 
  Grid, 
  List, 
  Sparkles, 
  ExternalLink, 
  Eye, 
  ThumbsUp, 
  BookOpen, 
  Clock, 
  User, 
  Calendar,
  ChevronRight,
  UtensilsCrossed,
  Flame,
  CheckCircle2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { INITIAL_CHATBOTS } from "./data/chatbots";
import { Chatbot, Feedback } from "./types";

// Helper function to remove Vietnamese diacritics / accents and normalize string
const removeDiacritics = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
};

// Procedural Cozy Sound Synthesizer (AudioContext-based offline night background audio)
class CozyDinerSynth {
  private ctx: AudioContext | null = null;
  public isPlaying = false;
  private masterGain: GainNode | null = null;
  private isFirstPlay = true;

  // Active interval/timeout tracking for proper cleanup on stop()
  private cricketsInterval: any = null;
  private windInterval: any = null;
  private chimesInterval: any = null;
  private brothInterval: any = null;
  private lanternInterval: any = null;
  private cupsInterval: any = null;
  private lofiInterval: any = null;

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      
      // Master volume capped at 20% as requested
      this.masterGain.gain.setValueAtTime(0.20, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isPlaying = true;

      // 7. 🚪 Wooden Door Opening sound: play once on first activation
      if (this.isFirstPlay) {
        this.playDoorOpen();
        this.isFirstPlay = false;
      }

      // Start all procedural atmospheric sound engines:

      // 1. 🦗 Crickets Chirping (Tiếng dế kêu đêm): High pitch pulses (3.8k-4kHz) every 4-7 seconds
      const triggerCrickets = () => {
        if (!this.isPlaying || !this.ctx || this.ctx.state === "closed") return;
        const now = this.ctx.currentTime;
        const pulsesCount = 4 + Math.floor(Math.random() * 3);
        const baseFreq = 3800 + Math.random() * 250;

        for (let i = 0; i < pulsesCount; i++) {
          const start = now + i * 0.08;
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(baseFreq + (Math.sin(i * 1.5) * 40), start);
          
          gainNode.gain.setValueAtTime(0, start);
          gainNode.gain.linearRampToValueAtTime(0.015, start + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, start + 0.07);
          
          osc.connect(gainNode);
          gainNode.connect(this.masterGain!);
          
          osc.start(start);
          osc.stop(start + 0.08);
        }
        
        // Schedule next chirp train
        const nextDelay = 3500 + Math.random() * 3500;
        this.cricketsInterval = setTimeout(triggerCrickets, nextDelay);
      };
      triggerCrickets();

      // 2. 🌬 Night Wind (Gió đêm): Soft white noise lowpass filter frequency modulated slowly
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = "lowpass";
      windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      whiteNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.masterGain);
      whiteNoise.start();

      // Wind modulation loop (swells and frequency shifts)
      const modulateWind = () => {
        if (!this.isPlaying || !this.ctx || this.ctx.state === "closed") return;
        const now = this.ctx.currentTime;
        const nextCutoff = 180 + Math.random() * 220;
        const nextGain = 0.015 + Math.random() * 0.045;
        const transitionTime = 4 + Math.random() * 4;

        windFilter.frequency.exponentialRampToValueAtTime(nextCutoff, now + transitionTime);
        windGain.gain.linearRampToValueAtTime(nextGain, now + transitionTime);

        this.windInterval = setTimeout(modulateWind, transitionTime * 1000);
      };
      modulateWind();

      // 3. 🔔 Wind Chimes (Chuông gió): Gentle high metallic resonance, randomly every 6-12s
      const triggerWindChimes = () => {
        if (!this.isPlaying || !this.ctx || this.ctx.state === "closed") return;
        const now = this.ctx.currentTime;
        const frequencies = [880, 1174, 1318, 1568, 1760, 1975];
        const notesCount = 1 + Math.floor(Math.random() * 3);

        for (let idx = 0; idx < notesCount; idx++) {
          const delay = idx * (0.1 + Math.random() * 0.3);
          const freq = frequencies[Math.floor(Math.random() * frequencies.length)] * (0.98 + Math.random() * 0.04);
          
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(freq, now + delay);

          // Add inharmonic high partial for metallic bell chime texture
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(freq * 1.51 + 5, now + delay);

          chimeGain.gain.setValueAtTime(0, now + delay);
          chimeGain.gain.linearRampToValueAtTime(0.02, now + delay + 0.01);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.8);

          osc1.connect(chimeGain);
          osc2.connect(chimeGain);
          chimeGain.connect(this.masterGain!);

          osc1.start(now + delay);
          osc1.stop(now + delay + 3.0);
          osc2.start(now + delay);
          osc2.stop(now + delay + 3.0);
        }

        const nextDelay = 6000 + Math.random() * 7000;
        this.chimesInterval = setTimeout(triggerWindChimes, nextDelay);
      };
      triggerWindChimes();

      // 4. 🍜 Boiling Broth Bubbling (Nồi nước dùng sôi lục bục): Low pops and warm rumbles
      const triggerBoiling = () => {
        if (!this.isPlaying || !this.ctx || this.ctx.state === "closed") return;
        const now = this.ctx.currentTime;
        
        // Randomly trigger individual bubbles popping
        if (Math.random() > 0.2) {
          const osc = this.ctx.createOscillator();
          const bubbleGain = this.ctx.createGain();
          
          osc.type = "sine";
          const startFreq = 110 + Math.random() * 90;
          osc.frequency.setValueAtTime(startFreq, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

          bubbleGain.gain.setValueAtTime(0, now);
          bubbleGain.gain.linearRampToValueAtTime(0.025, now + 0.008);
          bubbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

          osc.connect(bubbleGain);
          bubbleGain.connect(this.masterGain!);

          osc.start(now);
          osc.stop(now + 0.08);
        }

        const nextDelay = 120 + Math.random() * 240;
        this.brothInterval = setTimeout(triggerBoiling, nextDelay);
      };
      triggerBoiling();

      // 5. 🏮 Lantern Swaying & Va Nhẹ: resonant, woody hollow clink every 9-18 seconds
      const triggerLanternSway = () => {
        if (!this.isPlaying || !this.ctx || this.ctx.state === "closed") return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const lanternGain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(180 + Math.random() * 80, now);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(260, now);
        filter.Q.setValueAtTime(3.5, now);

        lanternGain.gain.setValueAtTime(0, now);
        lanternGain.gain.linearRampToValueAtTime(0.02, now + 0.015);
        lanternGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(filter);
        filter.connect(lanternGain);
        lanternGain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 0.4);

        const nextDelay = 9000 + Math.random() * 9000;
        this.lanternInterval = setTimeout(triggerLanternSway, nextDelay);
      };
      triggerLanternSway();

      // 6. ☕ Cups/Dishes Clinking (Tiếng ly chén rất nhỏ): Occasional crystal-clean ringing
      const triggerCupsClink = () => {
        if (!this.isPlaying || !this.ctx || this.ctx.state === "closed") return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const cupGain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(4600 + Math.random() * 1200, now);

        cupGain.gain.setValueAtTime(0, now);
        cupGain.gain.linearRampToValueAtTime(0.008, now + 0.002);
        cupGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

        osc.connect(cupGain);
        cupGain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 0.1);

        const nextDelay = 15000 + Math.random() * 12000;
        this.cupsInterval = setTimeout(triggerCupsClink, nextDelay);
      };
      triggerCupsClink();

      // Relaxing Background Lofi Chord Progression (soft accompaniment, volume kept low)
      const chords = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 329.63], // G6
        [164.81, 196.00, 246.94, 293.66], // Em7
        [220.00, 261.63, 329.63, 392.00]  // Am7
      ];
      let chordIndex = 0;

      const playNextChord = () => {
        if (!this.isPlaying || !this.ctx || this.ctx.state === "closed") return;
        const now = this.ctx.currentTime;
        const notes = chords[chordIndex];
        chordIndex = (chordIndex + 1) % chords.length;

        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          
          osc.type = "sine";
          const startDelay = idx * 0.22;
          osc.frequency.setValueAtTime(freq, now + startDelay);
          
          oscGain.gain.setValueAtTime(0, now + startDelay);
          oscGain.gain.linearRampToValueAtTime(0.02, now + startDelay + 1.5);
          oscGain.gain.setValueAtTime(0.02, now + startDelay + 3.5);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, now + startDelay + 6.5);

          osc.connect(oscGain);
          oscGain.connect(this.masterGain!);
          
          osc.start(now + startDelay);
          osc.stop(now + startDelay + 6.5);
        });
      };

      playNextChord();
      this.lofiInterval = setInterval(playNextChord, 8000);

    } catch (e) {
      console.error("Failed to start procedural sound synth:", e);
    }
  }

  // 7. 🚪 Wooden door creaking & rumbling sliding open effect
  private playDoorOpen() {
    if (!this.ctx || this.ctx.state === "closed") return;
    const now = this.ctx.currentTime;

    // A. Cozy wooden friction low sliding rumble
    const oscRumble = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    oscRumble.type = "triangle";
    oscRumble.frequency.setValueAtTime(95, now);
    oscRumble.frequency.linearRampToValueAtTime(55, now + 1.3);

    rumbleGain.gain.setValueAtTime(0, now);
    rumbleGain.gain.linearRampToValueAtTime(0.05, now + 0.1);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

    oscRumble.connect(rumbleGain);
    rumbleGain.connect(this.masterGain!);
    oscRumble.start(now);
    oscRumble.stop(now + 1.4);

    // B. Wooden creak squeak (high friction vibrato-modulated tone)
    const oscCreak = this.ctx.createOscillator();
    const creakGain = this.ctx.createGain();
    oscCreak.type = "sawtooth";
    oscCreak.frequency.setValueAtTime(310, now + 0.08);
    oscCreak.frequency.linearRampToValueAtTime(330, now + 0.9);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(850, now);

    // Speed vibrato simulation for the friction texture
    const fmOsc = this.ctx.createOscillator();
    const fmGain = this.ctx.createGain();
    fmOsc.type = "sine";
    fmOsc.frequency.setValueAtTime(34, now); 
    fmGain.gain.setValueAtTime(45, now); 

    fmOsc.connect(fmGain);
    fmGain.connect(oscCreak.frequency);

    creakGain.gain.setValueAtTime(0, now + 0.08);
    creakGain.gain.linearRampToValueAtTime(0.012, now + 0.18);
    creakGain.gain.setValueAtTime(0.012, now + 0.55);
    creakGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    oscCreak.connect(highpass);
    highpass.connect(creakGain);
    creakGain.connect(this.masterGain!);

    fmOsc.start(now + 0.08);
    oscCreak.start(now + 0.08);

    fmOsc.stop(now + 1.15);
    oscCreak.stop(now + 1.15);
  }

  stop() {
    this.isPlaying = false;
    
    // Clear all timeouts/intervals
    if (this.cricketsInterval) clearTimeout(this.cricketsInterval);
    if (this.windInterval) clearTimeout(this.windInterval);
    if (this.chimesInterval) clearTimeout(this.chimesInterval);
    if (this.brothInterval) clearTimeout(this.brothInterval);
    if (this.lanternInterval) clearTimeout(this.lanternInterval);
    if (this.cupsInterval) clearTimeout(this.cupsInterval);
    if (this.lofiInterval) clearInterval(this.lofiInterval);

    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
    }
  }
}

export default function App() {
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [chatbots, setChatbots] = useState<Chatbot[]>(INITIAL_CHATBOTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Tất cả");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isCopiedMain, setIsCopiedMain] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Force dark theme/nighttime theme by default!
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  // New Immersion States
  const [isMuted, setIsMuted] = useState(true);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [clockTime, setClockTime] = useState(new Date());
  const [catPos, setCatPos] = useState({ x: -120, status: "hidden" });
  const [servingBot, setServingBot] = useState<Chatbot | null>(null);
  const [isSteamRising, setIsSteamRising] = useState(false);

  // Sound Synthesizer reference
  const synthRef = useRef<CozyDinerSynth | null>(null);

  // Create synth instance
  useEffect(() => {
    synthRef.current = new CozyDinerSynth();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  // Sync mute state with synth
  const handleToggleSound = () => {
    if (isMuted) {
      if (synthRef.current) synthRef.current.start();
      setIsMuted(false);
    } else {
      if (synthRef.current) synthRef.current.stop();
      setIsMuted(true);
    }
  };

  // Clock ticks
  useEffect(() => {
    const t = setInterval(() => {
      setClockTime(new Date());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Scrolling light fade calculation (walking deeper into the shop alleyway)
  useEffect(() => {
    const handleScrollLight = () => {
      const scrollY = window.scrollY;
      const opacity = Math.max(0.12, 1 - scrollY / 620);
      setScrollOpacity(opacity);
    };
    window.addEventListener("scroll", handleScrollLight);
    return () => window.removeEventListener("scroll", handleScrollLight);
  }, []);

  // Kitten moving sequence controller
  useEffect(() => {
    const runCatSequence = () => {
      // Start moving from left
      setCatPos({ x: -80, status: "walking" });

      // Walk to the porch / middle
      setTimeout(() => {
        setCatPos({ x: 340, status: "sitting" });
      }, 5000);

      // Play / sleep on the porch
      setTimeout(() => {
        setCatPos({ x: 340, status: "sleeping" });
      }, 9500);

      // Get up and walk again
      setTimeout(() => {
        setCatPos({ x: 360, status: "walking" });
      }, 15000);

      // Walk off-screen to the right
      setTimeout(() => {
        setCatPos({ x: 1100, status: "hidden" });
      }, 19000);
    };

    // Trigger cat walkthrough every 40 seconds
    const interval = setInterval(runCatSequence, 40000);
    
    // Initial cat trigger after 6 seconds
    const delayTimeout = setTimeout(runCatSequence, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(delayTimeout);
    };
  }, []);
  
  // Feedback form state
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  // Add Chatbot form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isPasscodeVerified, setIsPasscodeVerified] = useState(false);
  const [passcodeError, setPasscodeError] = useState("");
  const [newBotName, setNewBotName] = useState("");
  const [newBotAvatar, setNewBotAvatar] = useState("");
  const [newBotGenre, setNewBotGenre] = useState("");
  const [newBotTags, setNewBotTags] = useState("");
  const [newBotShortDesc, setNewBotShortDesc] = useState("");
  const [newBotBackstory, setNewBotBackstory] = useState("");
  const [newBotOpenScene, setNewBotOpenScene] = useState("");
  const [newBotPlayLink, setNewBotPlayLink] = useState("");
  const [newBotAuthor, setNewBotAuthor] = useState("");
  const [newBotLength, setNewBotLength] = useState("Dài");
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  // Pick a random chatbot and open its detail modal
  const handleRandomSelect = () => {
    if (chatbots.length === 0) return;
    const randomIndex = Math.floor(Math.random() * chatbots.length);
    const randomBot = chatbots[randomIndex];
    setSelectedChatbot(randomBot);
    // Add confetti for celebration
    triggerConfetti();
  };

  // Submit new chatbot to the list and persist in Local Storage
  const handleAddChatbotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim() || !newBotGenre.trim() || !newBotShortDesc.trim() || !newBotPlayLink.trim()) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    // Process tags
    const parsedTags = newBotTags
      ? newBotTags.split(",").map(t => t.trim()).filter(t => t.length > 0)
      : [];

    // Add main genre to tags if not already present
    const mainGenres = newBotGenre.split(",").map(g => g.trim()).filter(Boolean);
    mainGenres.forEach(g => {
      if (!parsedTags.some(t => t.toLowerCase() === g.toLowerCase())) {
        parsedTags.push(g);
      }
    });

    const newBot: Chatbot = {
      id: Date.now(),
      name: newBotName.trim(),
      avatar: newBotAvatar.trim() || "https://cdn.phototourl.com/free/2026-07-12-fc9013c2-5249-4c5c-933b-75f074f8c425.jpg",
      genre: newBotGenre.trim(),
      tags: parsedTags,
      shortDescription: newBotShortDesc.trim(),
      backstory: newBotBackstory.trim() || `Rất lâu về trước, câu chuyện của ${newBotName.trim()} đã được thêu dệt nên trong lòng tiệm trà nhỏ...`,
      openScene: newBotOpenScene.trim() || `Lời mở đầu của ${newBotName.trim()} đang chờ đợi bước chân đầu tiên của bạn...`,
      playLink: newBotPlayLink.trim(),
      author: newBotAuthor.trim() || "Dương Tiệm Trưởng",
      length: newBotLength,
      views: 0,
      likes: 0
    };

    const updatedList = [...chatbots, newBot];
    setChatbots(updatedList);
    localStorage.setItem("tiem_ga_chatbots", JSON.stringify(updatedList));

    // Clear form states
    setNewBotName("");
    setNewBotAvatar("");
    setNewBotGenre("");
    setNewBotTags("");
    setNewBotShortDesc("");
    setNewBotBackstory("");
    setNewBotOpenScene("");
    setNewBotPlayLink("");
    setNewBotAuthor("");
    setNewBotLength("Dài");

    setIsAddModalOpen(false);
    setIsPasscodeVerified(false);
    setPasscodeInput("");
    setPasscodeError("");
    setShowAddSuccess(true);
    triggerConfetti();
  };

  // Submit passcode for authorization
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === "Odaycojq123") {
      setIsPasscodeVerified(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Mật mã không chính xác! Hãy kiểm tra lại nhé ✍️");
    }
  };

  // Reset custom list back to initial default list
  const resetChatbotsToDefault = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục danh sách món ăn gốc của Tiệm không? Tất cả món tự thêm sẽ bị xoá.")) {
      setChatbots(INITIAL_CHATBOTS);
      localStorage.setItem("tiem_ga_chatbots", JSON.stringify(INITIAL_CHATBOTS));
      triggerConfetti();
    }
  };

  // Trigger a massive celebratory confetti firework effect
  const triggerConfetti = () => {
    // Left burst
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.15, y: 0.75 },
      colors: ["#EF4444", "#FFA726", "#FFD54F", "#3B82F6", "#EC4899", "#FFFFFF"]
    });
    // Right burst
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.85, y: 0.75 },
      colors: ["#EF4444", "#FFA726", "#FFD54F", "#3B82F6", "#EC4899", "#FFFFFF"]
    });
    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 110,
        origin: { x: 0.5, y: 0.55 },
        colors: ["#EF4444", "#FFA726", "#FFD54F", "#FFFFFF"]
      });
    }, 200);
  };

  // Loading screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Hydrate chatbots, favorites and feedbacks from Local Storage
  useEffect(() => {
    try {
      const storedBots = localStorage.getItem("tiem_ga_chatbots");
      let parsedBots: Chatbot[] = [];
      if (storedBots) {
        parsedBots = JSON.parse(storedBots);
      } else {
        parsedBots = [...INITIAL_CHATBOTS];
      }

      // Check if "Dương Thừa Huân" is in the list
      let hasHuan = false;
      const updatedBots = parsedBots.map(bot => {
        if (bot.name.trim().toLowerCase() === "dương thừa huân") {
          hasHuan = true;
          return {
            ...bot,
            genre: "Hệ thống, Hài hước, Healing, Tổng tài, Xuyên không",
            tags: ["Hệ thống", "Hài hước", "Healing", "Tổng tài", "Xuyên không"]
          };
        }
        return bot;
      });

      if (hasHuan) {
        setChatbots(updatedBots);
        localStorage.setItem("tiem_ga_chatbots", JSON.stringify(updatedBots));
      } else {
        const huanExists = parsedBots.some(bot => bot.name.trim().toLowerCase() === "dương thừa huân" || bot.id === 3);
        if (!huanExists) {
          const huanBot = INITIAL_CHATBOTS.find(bot => bot.name.trim().toLowerCase() === "dương thừa huân");
          if (huanBot) {
            parsedBots.push(huanBot);
            setChatbots(parsedBots);
            localStorage.setItem("tiem_ga_chatbots", JSON.stringify(parsedBots));
          } else {
            setChatbots(parsedBots);
          }
        } else {
          setChatbots(updatedBots);
          localStorage.setItem("tiem_ga_chatbots", JSON.stringify(updatedBots));
        }
      }

      const storedFavs = localStorage.getItem("tiem_ga_favorites");
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
      const storedFeedbacks = localStorage.getItem("tiem_ga_feedbacks");
      if (storedFeedbacks) {
        setFeedbacks(JSON.parse(storedFeedbacks));
      }
    } catch (e) {
      console.error("Lỗi đọc dữ liệu từ LocalStorage:", e);
    }
  }, []);

  // Handle dark mode class on html tag
  useEffect(() => {
    const isDark = localStorage.getItem("tiem_ga_dark_mode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("tiem_ga_dark_mode", String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Listen to scroll to show/hide Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    let updated: number[];
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("tiem_ga_favorites", JSON.stringify(updated));
  };

  // Copy chatbot play link
  const copyPlayLink = (e: React.MouseEvent, bot: Chatbot) => {
    e.stopPropagation();
    navigator.clipboard.writeText(bot.playLink);
    setCopiedId(bot.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy link in details modal
  const copyModalLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setIsCopiedMain(true);
    setTimeout(() => setIsCopiedMain(false), 2000);
  };

  // Submit feedback
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      name: feedbackName.trim() || "Thực khách ẩn danh",
      content: feedbackContent.trim(),
      timestamp: new Date().toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };

    const updatedFeedbacks = [newFeedback, ...feedbacks];
    setFeedbacks(updatedFeedbacks);
    localStorage.setItem("tiem_ga_feedbacks", JSON.stringify(updatedFeedbacks));
    
    // Clear form and show modal
    setFeedbackName("");
    setFeedbackContent("");
    setShowFeedbackSuccess(true);
    triggerConfetti();
  };

  // Clear feedbacks (for administrator / testing convenience)
  const clearFeedbacks = () => {
    if (confirm("Bạn có muốn dọn dẹp tất cả lưu bút phản hồi không?")) {
      setFeedbacks([]);
      localStorage.removeItem("tiem_ga_feedbacks");
    }
  };

  // Cozy Restaurant Menu mapping helper
  const getMenuDetails = (botId: number) => {
    switch (botId) {
      case 1:
        return { code: "GA-01", price: "Miễn Phí 0đ 🍼", spice: "🌶️ Ấm áp", desc: "Single Dad bỏ phố về quê cùng em bé 3 tháng tuổi" };
      case 2:
        return { code: "GA-02", price: "Miễn Phí 0đ 🍊", spice: "🌶️ Ngọt mát", desc: "Mối duyên thanh mai trúc mã đáng yêu giữa Cam Nhỏ và Táo Nhỏ" };
      default:
        return { code: "GA-XX", price: "Miễn Phí 0đ", spice: "🌶️ Cay vừa", desc: "Món đặc sản gia truyền của Tiệm Gà Họ Dương" };
    }
  };

  // Search and filter logic
  const filteredChatbots = useMemo(() => {
    return chatbots.filter((bot) => {
      // 1. Search term matches name, tags, genre, or shortDescription
      let matchesSearch = true;
      if (searchTerm.trim()) {
        const queryTokens = searchTerm
          .toLowerCase()
          .split(/[\s,]+/)
          .filter(Boolean);

        const normName = removeDiacritics(bot.name);
        const normGenre = removeDiacritics(bot.genre || "");
        const normDesc = removeDiacritics(bot.shortDescription || "");
        const normTags = (bot.tags || []).map(tag => removeDiacritics(tag));

        const nameLower = bot.name.toLowerCase();
        const genreLower = (bot.genre || "").toLowerCase();
        const descLower = (bot.shortDescription || "").toLowerCase();
        const tagsLower = (bot.tags || []).map(tag => tag.toLowerCase());

        // All tokens in the search term must match somewhere in the chatbot's properties
        matchesSearch = queryTokens.every(token => {
          // Check original lowercase representation
          const matchesOriginal = 
            nameLower.includes(token) ||
            genreLower.includes(token) ||
            tagsLower.some(tag => tag.includes(token)) ||
            descLower.includes(token);

          if (matchesOriginal) return true;

          // Check normalized representation (without diacritics)
          const normToken = removeDiacritics(token);
          const matchesNormalized = 
            normName.includes(normToken) ||
            normGenre.includes(normToken) ||
            normTags.some(tag => tag.includes(normToken)) ||
            normDesc.includes(normToken);

          return matchesNormalized;
        });
      }

      if (!matchesSearch) return false;

      // 2. Genre / Custom filters matching (with robust case-insensitivity and accent-insensitivity)
      if (selectedGenre === "Tất cả") {
        return true;
      }
      if (selectedGenre === "Yêu thích ⭐") {
        return favorites.includes(bot.id);
      }
      
      const g = selectedGenre.toLowerCase().trim();
      const normG = removeDiacritics(g);
      
      // Match genre parts or tags
      const genreMatch = bot.genre
        ? bot.genre.split(",").some(part => {
            const p = part.trim().toLowerCase();
            return p === g || p.includes(g) || removeDiacritics(p).includes(normG);
          })
        : false;

      const tagMatch = bot.tags
        ? bot.tags.some(t => {
            const tagVal = t.trim().toLowerCase();
            return tagVal === g || tagVal.includes(g) || removeDiacritics(tagVal).includes(normG);
          })
        : false;

      return genreMatch || tagMatch;
    });
  }, [chatbots, searchTerm, selectedGenre, favorites]);

  // List of all genres with cute icons for filters, dynamically updated from the chatbot list!
  const filterOptions = useMemo(() => {
    const baseNames = ["Slice of Life", "Fantasy", "Hiện đại", "Idol", "Kinh dị", "Zombie", "Học đường", "Open World"];
    const dynamicSet = new Set<string>();

    chatbots.forEach((bot) => {
      if (bot.genre) {
        bot.genre.split(",").forEach(g => {
          const trimmed = g.trim();
          if (trimmed && trimmed.toLowerCase() !== "tất cả") {
            dynamicSet.add(trimmed);
          }
        });
      }
      if (bot.tags && Array.isArray(bot.tags)) {
        bot.tags.forEach(t => {
          const trimmed = t.trim();
          if (trimmed && trimmed.toLowerCase() !== "tất cả") {
            dynamicSet.add(trimmed);
          }
        });
      }
    });

    const uniqueNames: string[] = [];
    const seen = new Set<string>();

    const addName = (name: string) => {
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueNames.push(name);
      }
    };

    // Add base names first to keep their ordering
    baseNames.forEach(addName);

    // Add any other dynamic names
    dynamicSet.forEach(addName);

    // Icon map for all categories
    const ICON_MAP: Record<string, string> = {
      "slice of life": "🌸",
      "fantasy": "🧙‍♂️",
      "hiện đại": "🏙️",
      "idol": "🎤",
      "kinh dị": "👻",
      "zombie": "🧟",
      "học đường": "🏫",
      "open world": "🗺️",
      "healing": "🌿",
      "thanh mai trúc mã": "🍊",
      "bạn thân": "👫",
      "single dad": "🍼",
      "baby": "👶",
      "comedy": "😂",
      "romance": "💖",
      "drama": "🎭",
      "action": "💥",
      "mystery": "🔍",
      "adventure": "🧭",
      "hệ thống": "🤖",
      "hài hước": "😂",
      "tổng tài": "💼",
      "xuyên không": "🌀",
      "xuyên thư": "📖",
      "vô hạn lưu": "♾️",
    };

    const options = uniqueNames.map(name => {
      const lower = name.toLowerCase();
      const icon = ICON_MAP[lower] || "🏷️";
      return { name, icon };
    });

    return [
      { name: "Tất cả", icon: "🍗" },
      ...options,
      { name: "Yêu thích ⭐", icon: "❤️" }
    ];
  }, [chatbots]);

  return (
    <div className="relative min-h-screen bg-[#0B132B] text-[#FFF8E7] transition-colors duration-300 selection:bg-[#F4D35E] selection:text-[#1E293B]">
      
      {/* ----------------- AMBIENT SHOOTING STARS / METEORS ----------------- */}
      <div className="absolute top-0 inset-x-0 h-[200vh] pointer-events-none overflow-hidden z-0 select-none">
        <div className="meteor-star top-12 left-[80%]" style={{ animationDelay: "1s", animationDuration: "14s" }} />
        <div className="meteor-star top-48 left-[60%]" style={{ animationDelay: "5s", animationDuration: "18s" }} />
        <div className="meteor-star top-20 left-[40%]" style={{ animationDelay: "9s", animationDuration: "16s" }} />
        <div className="meteor-star top-72 left-[90%]" style={{ animationDelay: "14s", animationDuration: "20s" }} />
        <div className="meteor-star top-96 left-[25%]" style={{ animationDelay: "3s", animationDuration: "15s" }} />
      </div>

      {/* ----------------- GRAPH PAPER BACKGROUND GRID ----------------- */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />

      {/* ----------------- DINER / FOOD STALL RED CANOPY & GLOWING LANTERNS ----------------- */}
      <div className="relative w-full overflow-visible pointer-events-none z-30 select-none mb-4">
        {/* Traditional Food Stall Red Canopy (Mái hiên vải xếp đỏ sẫm của quán ăn) */}
        <div className="w-full h-8 md:h-12 bg-red-700 dark:bg-red-800 flex relative border-b-4 border-chicken-charcoal/90 shadow-md">
          {/* Canopy stripes */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${
                i % 2 === 0 ? "bg-[#B91C1C] dark:bg-[#991B1B]" : "bg-[#EA580C] dark:bg-[#C2410C]"
              } relative`}
            >
              {/* Scallop bottom curve */}
              <div
                className={`absolute -bottom-4 md:-bottom-6 left-0 right-0 h-4 md:h-6 rounded-b-full border-b-4 border-chicken-charcoal/90 ${
                  i % 2 === 0 ? "bg-[#B91C1C]" : "bg-[#EA580C]"
                }`}
              />
              {/* Highlight / Shading */}
              <div className="absolute inset-y-0 left-0 w-1/3 bg-white/10" />
            </div>
          ))}
        </div>

        {/* String of hanging warm lantern lights / splaying ropes */}
        <div className="absolute top-8 md:top-12 left-0 w-full flex justify-around px-8 md:px-16 z-40 h-16 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center relative" style={{ transform: `translateY(${i % 2 === 0 ? '4px' : '-4px'})` }}>
              {/* Cord / Rope */}
              <div className="w-[1.5px] h-6 md:h-8 bg-chicken-charcoal/60 dark:bg-amber-100/20" />
              {/* Light bulb / Lantern */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.85, 1, 0.85],
                  rotate: [i % 2 === 0 ? -4 : 4, i % 2 === 0 ? 4 : -4, i % 2 === 0 ? -4 : 4]
                }}
                transition={{
                  duration: 2.5 + (i % 3) * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  i % 2 === 0 
                    ? "bg-[#FFCA28] shadow-[0_0_15px_#f59e0b]" 
                    : "bg-[#EA580C] shadow-[0_0_15px_#ea580c]"
                } border border-white/30`}
              >
                <span className="text-[8px] opacity-75">✨</span>
              </motion.div>
              {/* Soft glow halo */}
              <div className={`absolute top-8 w-10 h-10 rounded-full opacity-20 filter blur-xs ${
                i % 2 === 0 ? "bg-amber-300" : "bg-orange-400"
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* ----------------- DECORATIVE CORNER WAVES (FROM USER IMAGE) ----------------- */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-chicken-red/10 dark:fill-chicken-red/5">
          <path d="M0,0 C30,10 40,50 0,90 Z" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-40 h-40 md:w-56 md:h-56 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-chicken-yellow/15 dark:fill-chicken-yellow/5">
          <path d="M100,0 C60,20 50,60 100,80 Z" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-36 h-36 md:w-48 md:h-48 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-chicken-yellow/10 dark:fill-chicken-yellow/5">
          <path d="M0,100 C30,90 20,60 0,40 Z" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 md:w-44 md:h-44 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-chicken-red/10 dark:fill-chicken-red/5">
          <path d="M100,100 C70,90 80,50 100,30 Z" />
        </svg>
      </div>

      {/* ----------------- SHORT LOADING SCREEN ----------------- */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            id="loading-screen"
            className="fixed inset-0 bg-chicken-cream dark:bg-chicken-dark-bg z-50 flex flex-col items-center justify-center p-4 bg-grid"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <div className="relative mb-6">
              {/* Cute Jumping Fried Chicken Drumstick SVG */}
              <motion.div
                animate={{ 
                  y: [0, -30, 0],
                  rotate: [15, -15, 15]
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-24 h-24 text-chicken-yellow-dark"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                  {/* Bone */}
                  <path d="M25,75 L35,65" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
                  <path d="M25,75 C21,79 14,79 10,75 C6,71 6,64 10,60" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" fill="none" />
                  <path d="M25,75 C29,71 29,64 25,60 C21,56 14,56 10,60" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" fill="none" />
                  {/* Crispy meat */}
                  <path d="M35,65 C45,55 40,30 60,20 C80,10 95,25 90,45 C85,65 60,60 50,70 C40,80 30,70 35,65 Z" fill="#F59E0B" />
                  {/* Texture spots */}
                  <circle cx="55" cy="40" r="2" fill="#D97706" />
                  <circle cx="65" cy="35" r="3" fill="#D97706" />
                  <circle cx="70" cy="45" r="2.5" fill="#D97706" />
                  <circle cx="60" cy="52" r="2" fill="#D97706" />
                  {/* Highlights */}
                  <path d="M50,28 C60,20 70,22 75,25" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </motion.div>
              {/* Spinning Plate Shadow */}
              <div className="w-16 h-2 bg-black/10 dark:bg-white/5 rounded-full mx-auto blur-[1px] mt-2 animate-pulse-soft" />
            </div>
            
            <h2 className="text-2xl font-bold font-display text-chicken-red dark:text-chicken-yellow text-center max-w-xs md:max-w-md animate-pulse">
              Tiệm Gà Họ Dương đang sưởi ấm lò nướng... 🍗
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Vui lòng đợi giây lát nha~
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- MAIN APP CONTROLLER ----------------- */}
      {!isLoading && (
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-12 flex flex-col gap-8 md:gap-12">
          
          {/* ----------------- TOP NAVBAR / CONTROL TOOLBAR ----------------- */}
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              {/* 'Món đặc biệt hôm nay' button */}
              <motion.button
                id="random-chatbot-btn"
                onClick={handleRandomSelect}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F4D35E] hover:bg-[#FFE8A3] text-[#1E293B] border-2 border-[#B85C38] text-sm font-black shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                title="Chọn ngẫu nhiên một món đặc biệt hôm nay"
              >
                <Sparkles className="w-4 h-4 text-[#B85C38] animate-pulse" />
                <span>Món đặc biệt hôm nay 🎲</span>
              </motion.button>

              {/* 'Đóng góp món mới' button */}
              <motion.button
                id="add-chatbot-btn"
                onClick={() => {
                  setPasscodeInput("");
                  setPasscodeError("");
                  setIsPasscodeVerified(false);
                  setIsAddModalOpen(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F5E6D3] hover:bg-[#FFF8E7] border-2 border-[#8D7B68] text-[#1E293B] text-sm font-bold shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
                title="Đóng góp chatbot mới vào thực đơn"
              >
                <span>Đóng góp món mới ✍️</span>
              </motion.button>

              {/* 'Khôi phục mặc định' button (Only show if chatbots are customized) */}
              {chatbots.length !== INITIAL_CHATBOTS.length && (
                <motion.button
                  id="reset-chatbots-btn"
                  onClick={resetChatbotsToDefault}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#2B1E16] text-[#FFF8E7]/70 text-xs font-semibold hover:bg-[#3D2B1F] hover:text-[#FFF8E7] cursor-pointer transition-all border border-slate-700"
                  title="Khôi phục thực đơn mặc định của Tiệm"
                >
                  <span>Khôi phục mặc định 🔄</span>
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Procedural Ambient Sound controller toggle */}
              <motion.button
                id="cozy-ambient-audio-toggle"
                onClick={handleToggleSound}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-2xl border cursor-pointer shadow-sm transition-all duration-200 flex items-center gap-1.5 font-semibold text-xs ${
                  !isMuted 
                    ? "bg-yellow-400/20 border-yellow-400 text-yellow-300 shadow-[0_0_8px_rgba(244,211,94,0.3)]"
                    : "bg-white dark:bg-chicken-dark-card border-gray-100 dark:border-chicken-dark-border text-gray-400 hover:text-yellow-300"
                }`}
                title={isMuted ? "Mở cửa & Bật âm thanh đêm (dế kêu, gió, chuông gió, nồi nước dùng sôi, chén clink...)" : "Tắt âm thanh"}
              >
                <span className="text-base">{isMuted ? "🔇" : "🎐"}</span>
                <span>{isMuted ? "Bật âm thanh đêm 🌌" : "Âm Thanh Đêm: ON"}</span>
              </motion.button>

              {/* Dark Mode toggle button */}
              <motion.button
                id="dark-mode-toggle"
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl bg-white dark:bg-chicken-dark-card border border-gray-100 dark:border-chicken-dark-border text-chicken-yellow-dark hover:text-chicken-yellow shadow-sm hover:shadow cursor-pointer transition-all duration-200"
                aria-label="Chuyển chế độ sáng tối"
                title={darkMode ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6 text-chicken-charcoal" />}
              </motion.button>
            </div>
          </div>

          {/* ----------------- TRADITIONAL HANGING SIGNBOARD & NEON LAMP & BANNER ----------------- */}
          <header className="relative w-full max-w-5xl mx-auto mb-8 select-none px-4 md:px-0 flex flex-col items-center">
            
            {/* Hanging wood Signboard */}
            <div className="relative w-full flex flex-col items-center mb-6">
              {/* Suspended Ropes */}
              <div className="flex justify-between w-64 md:w-96 relative z-10 -mb-2">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-[#2B1E16] border-2 border-slate-600 shadow-inner" />
                  <div className="rope" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-[#2B1E16] border-2 border-slate-600 shadow-inner" />
                  <div className="rope" />
                </div>
              </div>

              {/* Wooden Signboard with Slow Swaying Animation */}
              <motion.div
                id="main-wooden-signboard"
                className="animate-sway relative w-full max-w-2xl bg-gradient-to-r from-[#3D2B1F] via-[#4E3629] to-[#3D2B1F] border-8 border-[#2B1E16] rounded-[2.5rem] p-6 md:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_45px_rgba(244,211,94,0.15),inset_0_0_20px_rgba(0,0,0,0.8)] transition-shadow duration-300 group cursor-pointer overflow-hidden flex flex-col items-center text-center border-t-[10px] border-b-[10px]"
              >
                {/* Glow reflections hắt lên mặt gỗ */}
                <div className="absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors duration-300 pointer-events-none" />
                <div className="absolute -top-12 left-1/4 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl pointer-events-none group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute -top-12 right-1/4 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl pointer-events-none group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating Fireflies / Dust particles inside the signboard */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="firefly-particle" style={{ left: "12%", bottom: "12%", animationDelay: "0s", animationDuration: "12s" }} />
                  <div className="firefly-particle" style={{ left: "35%", bottom: "22%", animationDelay: "3.5s", animationDuration: "9s" }} />
                  <div className="firefly-particle" style={{ left: "50%", bottom: "8%", animationDelay: "1.8s", animationDuration: "14s" }} />
                  <div className="firefly-particle" style={{ left: "72%", bottom: "28%", animationDelay: "6.2s", animationDuration: "8.5s" }} />
                  <div className="firefly-particle" style={{ left: "88%", bottom: "18%", animationDelay: "4.8s", animationDuration: "11s" }} />
                </div>

                {/* Left & Right warm glowing light lamps hắt sáng hờ */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFD54F] border-2 border-amber-600 animate-pulse shadow-[0_0_15px_#FFD54F,0_0_30px_#FFD54F] z-20 pointer-events-none" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFD54F] border-2 border-amber-600 animate-pulse shadow-[0_0_15px_#FFD54F,0_0_30px_#FFD54F] z-20 pointer-events-none" />

                {/* Custom chalkboard handwritten fonts */}
                <h1 className="text-3xl md:text-5xl font-chalk font-extrabold tracking-wide mb-2 neon-text-bloom select-none">
                  Tiệm Gà Họ Dương
                </h1>
                
                <div className="w-2/3 h-[2px] bg-dashed border-t border-white/20 my-1 md:my-2" />

                <p className="text-sm md:text-lg font-chalk text-[#FFFBEB]/90 italic tracking-wide drop-shadow-[0_1px_3px_rgba(255,255,255,0.2)] select-none">
                  &ldquo; Mời mọi người chọn món ăn ngon tại tiệm &rdquo;
                </p>
              </motion.div>
            </div>

            {/* Neon Status Lamp for OPEN / CLOSED */}
            {(() => {
              const hour = clockTime.getHours();
              const isStoreOpen = hour >= 18 || hour < 5;
              return (
                <div className="mb-4">
                  <div className="relative flex items-center gap-2.5 px-6 py-2 bg-[#10141E] border-2 border-slate-700 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">Cửa hiệu:</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-full ${
                        isStoreOpen 
                          ? "bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80,0_0_20px_#4ade80]" 
                          : "bg-red-500 shadow-[0_0_10px_#f87171,0_0_20px_#f87171]"
                      }`} />
                      <span className={`text-xs font-black tracking-widest font-mono uppercase ${
                        isStoreOpen 
                          ? "text-green-400 drop-shadow-[0_0_8px_#4ade80]" 
                          : "text-red-500 drop-shadow-[0_0_8px_#f87171]"
                      }`}>
                        {isStoreOpen ? "NEON: OPEN" : "NEON: CLOSED"}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-200/80 font-mono ml-2 border-l border-slate-700 pl-2">
                      ({isStoreOpen ? "Mở cửa đêm muộn" : "Đóng cửa - Menu mở 24/7"})
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Simple elegant image banner */}
            <motion.div
              id="header-banner"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[#334155] bg-[#1E293B]"
            >
              <img
                src="https://cdn.phototourl.com/member/2026-07-12-20daa638-a4d2-47cb-aba4-3cb2d651d34f.jpg"
                alt="Tiệm Gà Họ Dương Banner"
                className="w-full h-auto object-contain block"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </header>

          {/* Main bento-grid layout: Sidebar + Main Content */}
          <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
            
            {/* Sidebar Column: Search, Categories & Feedback Form */}
            <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
              
              {/* Blackboard / Chalkboard Announcement widget */}
              <div className="bg-[#2E2520] dark:bg-[#1E1714] border-8 border-[#8D6E63] rounded-3xl p-5 shadow-md relative text-[#FBEFE7] overflow-hidden">
                <div className="absolute -right-2 -bottom-2 text-6xl opacity-10 rotate-12 select-none pointer-events-none">
                  📋
                </div>
                <div className="border border-dashed border-[#FBEFE7]/20 p-3 rounded-xl flex flex-col gap-2">
                  <h3 className="font-display font-extrabold text-sm text-[#FFD54F] tracking-wide text-center uppercase border-b border-dashed border-[#FBEFE7]/20 pb-1.5 flex items-center justify-center gap-1">
                    <span>✏️</span> BẢNG ĐEN TIỆM GÀ
                  </h3>
                  <div className="text-[11px] font-medium leading-relaxed flex flex-col gap-3 text-[#ECE3DB]">
                    <p className="flex items-start gap-2">
                      <span className="text-[#FFD54F]">🔔</span>
                      <span>Món ăn trên menu đa dạng, hãy xem xét theo khẩu vị cá nhân</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[#FFD54F]">🍬</span>
                      <span>Ưu Đãi: Mỗi món tinh thần tặng kèm 1 nụ cười miễn phí!</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[#FFD54F]">🌃</span>
                      <span>Giờ mở: 24/7 xuyên đêm xoa dịu tâm hồn đói cần ăn ngay</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Search & Filters Container */}
              <div className="bg-white dark:bg-chicken-dark-card rounded-[2rem] p-6 shadow-sm border border-chicken-yellow/30 dark:border-chicken-dark-border flex flex-col gap-5">
                
                {/* Custom Styled Search Box */}
                <div className="relative">
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Tìm kiếm chatbot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-white/75 text-chicken-charcoal placeholder-gray-500/70 rounded-2xl text-xs focus:outline-none border border-transparent focus:border-chicken-red-light focus:bg-white transition-all font-medium shadow-inner"
                  />
                  <span className="absolute left-3.5 top-3 text-sm opacity-60">🔍</span>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-chicken-red transition-colors"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Genre Categories Tag Cloud */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-60 text-chicken-charcoal dark:text-gray-400 font-mono">
                      Thực đơn thể loại
                    </h3>
                    {selectedGenre !== "Tất cả" && (
                      <button 
                        onClick={() => setSelectedGenre("Tất cả")}
                        className="text-[10px] font-bold text-chicken-red dark:text-chicken-yellow hover:underline cursor-pointer"
                      >
                        Đặt lại ↺
                      </button>
                    )}
                  </div>
                  
                  {/* Active Custom Filter Badge */}
                  {!filterOptions.some(opt => opt.name === selectedGenre) && selectedGenre !== "Tất cả" && (
                    <div className="mb-3 p-2 bg-chicken-yellow/20 dark:bg-chicken-yellow/10 border border-chicken-yellow/35 rounded-xl flex items-center justify-between text-xs font-bold text-chicken-charcoal dark:text-chicken-yellow">
                      <span>Đang lọc: #{selectedGenre}</span>
                      <button 
                        onClick={() => setSelectedGenre("Tất cả")}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full cursor-pointer flex items-center justify-center"
                        title="Xóa bộ lọc"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {filterOptions.map((opt) => {
                      const isActive = selectedGenre === opt.name;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => {
                            setSelectedGenre(opt.name);
                            setSearchTerm("");
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-chicken-yellow text-chicken-charcoal shadow-xs scale-[1.03]"
                              : "bg-chicken-yellow-light/30 dark:bg-chicken-dark-bg/60 text-chicken-charcoal/80 dark:text-gray-300 hover:bg-chicken-yellow hover:text-chicken-charcoal"
                          }`}
                        >
                          <span className="mr-1">{opt.icon}</span>
                          <span>{opt.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Cozy Feedback Form Block in Sidebar */}
              <div className="bg-[#F5E6D3] rounded-[2rem] p-6 shadow-md relative overflow-hidden border-2 border-[#8D7B68] text-[#1E293B]">
                <div className="absolute -right-4 -top-4 opacity-10 select-none">
                  <span className="text-8xl">🍵</span>
                </div>
                <h3 className="font-extrabold mb-1.5 flex items-center gap-1.5 text-base font-display text-[#1E293B]">
                  🍵 Để lại lời nhắn cho đầu bếp
                </h3>
                <p className="text-xs mb-4 opacity-90 leading-relaxed text-[#1E293B]/90">
                  Nếu món ăn hôm nay khiến bạn mỉm cười, hoặc còn điều gì chưa hợp khẩu vị, hãy để lại lời nhắn nhé.
                </p>
                
                <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-2.5 relative z-10">
                  <input
                    id="feedback-name"
                    type="text"
                    placeholder="Biệt danh của bạn..."
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    maxLength={50}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white/75 text-chicken-charcoal placeholder-gray-500/70 outline-none border border-transparent focus:border-chicken-red-light focus:bg-white transition-all font-medium shadow-inner"
                  />
                  <textarea
                    id="feedback-content"
                    required
                    rows={3}
                    placeholder="Chia sẻ cảm nhận..."
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    maxLength={1000}
                    className="w-full h-20 px-3 py-2 rounded-xl text-xs bg-white/75 text-chicken-charcoal placeholder-gray-500/70 outline-none border border-transparent focus:border-chicken-red-light focus:bg-white resize-none transition-all leading-relaxed shadow-inner"
                  />
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-[#F4D35E] hover:bg-[#FFE8A3] text-[#1E293B] rounded-xl text-xs font-black hover:opacity-95 active:scale-98 transition-all shadow-md cursor-pointer border border-[#B85C38]/20"
                  >
                    Gửi lời nhắn 🍲
                  </button>
                </form>
              </div>

            </aside>

            {/* Main Column: Chatbot Catalog Grid & Guestbook list */}
            <main className="flex-1 w-full flex flex-col gap-6">
              
              {/* Header block with search details & layout switch */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-extrabold text-chicken-charcoal dark:text-chicken-dark-text font-display flex items-center gap-2">
                    <span className="text-xl">🔥</span> Đang nóng hổi
                  </h2>
                  <span className="text-[10px] font-bold font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Hiện có: {filteredChatbots.length} món ăn tinh thần
                  </span>
                </div>
                
                <div className="flex bg-white dark:bg-chicken-dark-card rounded-lg p-1 shadow-sm border border-chicken-yellow/10 dark:border-chicken-dark-border">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      viewMode === "grid" 
                        ? "bg-chicken-cream dark:bg-chicken-dark-bg text-chicken-charcoal dark:text-chicken-yellow" 
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    }`}
                    title="Dạng lưới"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      viewMode === "list" 
                        ? "bg-chicken-cream dark:bg-chicken-dark-bg text-chicken-charcoal dark:text-chicken-yellow" 
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    }`}
                    title="Dạng danh sách"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chatbots display (Grid or List view modes) */}
              <div id="chatbot-list-container">
                {filteredChatbots.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white dark:bg-chicken-dark-card rounded-[2.5rem] border border-chicken-yellow/15 dark:border-chicken-dark-border p-6 shadow-xs"
                  >
                    <div className="w-20 h-20 bg-chicken-yellow/10 dark:bg-chicken-yellow/5 text-chicken-yellow-dark rounded-full flex items-center justify-center text-4xl animate-bounce">
                      🍽️
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      Món ăn này hiện chưa có trên thực đơn!
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                      Vui lòng thử tìm kiếm với từ khóa khác, hoặc chọn lại bộ lọc thể loại khác để thưởng thức nhé.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedGenre("Tất cả");
                      }}
                      className="px-6 py-2.5 bg-chicken-yellow hover:bg-chicken-yellow-dark text-chicken-charcoal font-bold rounded-2xl shadow-sm hover:shadow transition-all text-sm cursor-pointer"
                    >
                      Xem lại thực đơn chính
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    layout
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                        : "flex flex-col gap-6"
                    }
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredChatbots.map((bot) => {
                        const isFav = favorites.includes(bot.id);
                        const isCopied = copiedId === bot.id;
                        const menuInfo = getMenuDetails(bot.id);
                        
                        return (
                          <motion.article
                            layout
                            id={`chatbot-card-${bot.id}`}
                            key={bot.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ y: -6, scale: 1.01 }}
                            className={`group relative bg-white dark:bg-chicken-dark-card rounded-[2.5rem] border border-chicken-yellow/10 dark:border-chicken-dark-border shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col p-5`}
                          >
                            
                            {/* Favorite Button Overlay */}
                            <div className="absolute top-4 right-4 z-20">
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(bot.id);
                                }}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.8 }}
                                className={`p-2 rounded-full backdrop-blur-sm cursor-pointer shadow-sm transition-colors duration-200 ${
                                  isFav
                                    ? "bg-red-50 dark:bg-red-950/40 text-chicken-red-light"
                                    : "bg-gray-100/80 dark:bg-chicken-dark-bg/80 text-gray-400 hover:text-chicken-red"
                                }`}
                                title={isFav ? "Xóa khỏi món yêu thích" : "Lưu vào món yêu thích"}
                              >
                                <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                              </motion.button>
                            </div>

                            {/* Cozy food menu pricing line */}
                            <div className="flex items-center justify-between text-[11px] font-bold font-mono text-chicken-yellow-dark dark:text-[#FFD54F] mb-3 border-b border-dashed border-chicken-yellow/25 dark:border-chicken-dark-border/60 pb-2 select-none">
                              <span className="flex items-center gap-1">🍽️ Mã món: <span className="underline">{menuInfo.code}</span></span>
                              <span className="bg-chicken-cream dark:bg-chicken-dark-bg px-2.5 py-0.5 rounded-full text-chicken-charcoal dark:text-[#FFE082] text-[10px] shadow-xs">
                                Giá: {menuInfo.price}
                              </span>
                            </div>

                            {/* Card Content Row */}
                            <div className="flex gap-4 mb-4 items-start">
                              
                              {/* Avatar Block */}
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-chicken-cream dark:bg-chicken-dark-bg overflow-hidden flex-shrink-0 p-1 border border-chicken-yellow-light/30 flex items-center justify-center">
                                <img
                                  src={bot.avatar}
                                  alt={bot.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover rounded-2xl shadow-inner transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>

                              {/* Information Block */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    bot.genre === "Slice of Life" ? "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300" :
                                    bot.genre === "Fantasy" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                                    bot.genre === "Idol" ? "bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300" :
                                    bot.genre === "Zombie" ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300" :
                                    bot.genre === "Học đường" ? "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300" :
                                    "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                                  }`}>
                                    {bot.genre}
                                  </span>
                                  
                                  {bot.length && (
                                    <span className="text-[9px] font-mono font-medium text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" /> {bot.length}
                                    </span>
                                  )}
                                </div>

                                <h3 className="font-extrabold text-base md:text-lg text-chicken-charcoal dark:text-chicken-dark-text leading-tight mb-1 group-hover:text-chicken-red dark:group-hover:text-chicken-yellow transition-colors duration-200 truncate">
                                  {bot.name}
                                </h3>

                                <p className="text-xs text-chicken-charcoal/60 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                  {bot.shortDescription}
                                </p>
                              </div>

                            </div>

                            {/* Tag Badges */}
                            <div className="flex flex-wrap gap-1 mb-4">
                              {bot.tags.map((tag) => (
                                <button 
                                  key={tag} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchTerm("");
                                    const matchingOption = filterOptions.find(opt => opt.name.toLowerCase() === tag.toLowerCase());
                                    if (matchingOption) {
                                      setSelectedGenre(matchingOption.name);
                                    } else {
                                      setSelectedGenre(tag);
                                    }
                                  }}
                                  className="text-[10px] font-bold text-chicken-charcoal/60 dark:text-gray-400 bg-chicken-cream dark:bg-chicken-dark-bg/60 hover:bg-chicken-yellow hover:text-chicken-charcoal px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                                  title={`Lọc theo tag #${tag}`}
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>

                            {/* Bottom Interactive Action Buttons */}
                            <div className="mt-auto flex gap-2 pt-2 border-t border-chicken-yellow/10 dark:border-chicken-dark-border/40">
                              
                              {/* Copy Link Button */}
                              <motion.button
                                onClick={(e) => copyPlayLink(e, bot)}
                                whileTap={{ scale: 0.95 }}
                                className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                                  isCopied 
                                    ? "bg-green-50 dark:bg-green-950/40 border-green-200 text-green-600" 
                                    : "bg-chicken-cream dark:bg-chicken-dark-bg hover:bg-chicken-yellow/10 border-transparent text-chicken-charcoal/50 dark:text-gray-400 hover:text-chicken-charcoal dark:hover:text-white"
                                }`}
                                title="Sao chép liên kết trò chuyện"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </motion.button>

                              {/* Details button */}
                              <button
                                onClick={() => setSelectedChatbot(bot)}
                                className="px-3.5 py-2 bg-chicken-cream dark:bg-chicken-dark-bg/70 text-chicken-charcoal/80 dark:text-gray-300 font-bold text-xs rounded-xl border border-chicken-yellow/10 dark:border-chicken-dark-border hover:bg-chicken-yellow/10 hover:text-chicken-charcoal transition-all cursor-pointer"
                              >
                                Chi tiết
                              </button>

                              {/* Play Link button */}
                              <button
                                onClick={() => setServingBot(bot)}
                                className="flex-1 py-2 bg-chicken-yellow hover:bg-chicken-yellow-dark text-chicken-charcoal font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                              >
                                🍲 Thưởng thức
                              </button>

                            </div>

                          </motion.article>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* Guestbook Board: Scrolling feed of customer memories (Preserved & Styled elegantly) */}
              {feedbacks.length > 0 && (
                <div className="bg-white dark:bg-chicken-dark-card rounded-[2rem] p-6 shadow-sm border border-chicken-yellow/15 dark:border-chicken-dark-border flex flex-col gap-4 mt-4">
                  <div className="flex items-center justify-between border-b border-chicken-yellow/10 dark:border-chicken-dark-border/40 pb-2.5">
                    <h3 className="text-sm font-extrabold text-chicken-charcoal dark:text-chicken-dark-text font-display flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-chicken-yellow-dark" /> Lưu bút từ Thực khách ({feedbacks.length})
                    </h3>
                    <button 
                      onClick={clearFeedbacks}
                      className="text-[10px] font-bold text-gray-400 hover:text-chicken-red cursor-pointer transition-colors"
                    >
                      Dọn dẹp lưu bút
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                    {feedbacks.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-4 bg-chicken-cream/40 dark:bg-chicken-dark-bg/40 rounded-2xl border border-chicken-yellow/5 dark:border-chicken-dark-border text-xs flex flex-col gap-1.5 hover:bg-chicken-cream/70 dark:hover:bg-chicken-dark-bg/60 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-chicken-charcoal dark:text-chicken-dark-text text-[13px] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-chicken-yellow shadow-xs" /> {item.name}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-chicken-charcoal/85 dark:text-gray-300 whitespace-pre-wrap leading-relaxed italic pl-3 border-l border-chicken-yellow/30">
                          &ldquo; {item.content} &rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </main>

          </div>

          {/* ----------------- FOOTER SECTION ----------------- */}
          <footer className="border-t border-gray-100 dark:border-chicken-dark-border pt-8 pb-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left select-none text-sm text-gray-500 dark:text-gray-400 font-medium">
            <div className="flex flex-col gap-1">
              <span className="font-extrabold font-display text-base text-chicken-red dark:text-chicken-yellow">
                Tiệm Gà Họ Dương
              </span>
              <span>Cảm ơn vì đã ghé Tiệm Gà Họ Dương. Hy vọng món ăn hôm nay hợp khẩu vị của bạn. ❤️</span>
            </div>

            {/* Social profiles if active */}
            <div className="flex items-center gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-xl bg-gray-100 dark:bg-chicken-dark-card hover:bg-chicken-yellow/20 hover:text-chicken-yellow-dark transition-colors"
                title="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-xl bg-gray-100 dark:bg-chicken-dark-card hover:bg-chicken-yellow/20 hover:text-chicken-yellow-dark transition-colors"
                title="Discord"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                </svg>
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-xl bg-gray-100 dark:bg-chicken-dark-card hover:bg-chicken-yellow/20 hover:text-chicken-yellow-dark transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                </svg>
              </a>
            </div>
          </footer>

          {/* ----------------- CHATBOT DETAILS MODAL ----------------- */}
          <AnimatePresence>
            {selectedChatbot && (
              <div 
                id="chatbot-detail-modal"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                onClick={() => setSelectedChatbot(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-chicken-dark-card rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 dark:border-chicken-dark-border flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header & Close button */}
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-chicken-dark-border bg-gray-50/50 dark:bg-chicken-dark-bg/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍲</span>
                      <span className="font-bold text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-mono">
                        Thực đơn chi tiết
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedChatbot(null)}
                      className="p-2 rounded-xl text-gray-400 hover:text-chicken-red hover:bg-gray-100 dark:hover:bg-chicken-dark-border cursor-pointer transition-colors"
                      title="Đóng cửa sổ"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body Container (Two Columns responsive) */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    
                    {/* Left Column (Stats, Avatar, Tags & Major Action Buttons) */}
                    <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">
                      
                      {/* Big Avatar Frame */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-chicken-yellow-light/10 to-transparent border border-gray-100 dark:border-chicken-dark-border flex items-center justify-center p-4">
                        <img
                          src={selectedChatbot.avatar}
                          alt={selectedChatbot.name}
                          className="w-10/12 h-10/12 object-cover rounded-2xl shadow-md border-4 border-white dark:border-chicken-dark-border"
                        />
                        <span className="absolute top-3 left-3 bg-chicken-yellow text-chicken-charcoal font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                          {selectedChatbot.genre}
                        </span>
                      </div>

                      {/* Bot Info Cards (Author, Length, Genre) */}
                      <div className="bg-gray-50 dark:bg-chicken-dark-bg/60 p-4 rounded-2xl border border-gray-100 dark:border-chicken-dark-border flex flex-col gap-3 text-xs font-semibold">
                        <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-chicken-dark-border/40">
                          <span className="text-gray-400 font-medium flex items-center gap-1">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-chicken-yellow-dark" /> Mã số món:
                          </span>
                          <span className="text-chicken-charcoal dark:text-[#FFE082] font-bold font-mono">
                            #{getMenuDetails(selectedChatbot.id).code}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-chicken-dark-border/40">
                          <span className="text-gray-400 font-medium flex items-center gap-1">
                            💵 Giá đề xuất:
                          </span>
                          <span className="text-green-600 dark:text-green-400 font-bold">
                            {getMenuDetails(selectedChatbot.id).price}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-chicken-dark-border/40">
                          <span className="text-gray-400 font-medium flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-chicken-red-light" /> Độ cay kịch tính:
                          </span>
                          <span className="text-chicken-red dark:text-chicken-yellow">
                            {getMenuDetails(selectedChatbot.id).spice}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-chicken-dark-border/40">
                          <span className="text-gray-400 font-medium flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> Bếp Trưởng:
                          </span>
                          <span className="text-gray-800 dark:text-gray-200">
                            {selectedChatbot.author || "Dương Tiệm Trưởng"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-chicken-dark-border/40">
                          <span className="text-gray-400 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Thơm lâu:
                          </span>
                          <span className="text-gray-800 dark:text-gray-200 bg-chicken-yellow/20 text-chicken-charcoal px-2 py-0.5 rounded">
                            {selectedChatbot.length || "Dài"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Đã đặt mua:
                          </span>
                          <span className="font-mono text-gray-800 dark:text-gray-200">
                            {selectedChatbot.views?.toLocaleString() || "1,000"} lượt +
                          </span>
                        </div>
                      </div>

                      {/* Tag pillbox */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          Thẻ liên quan
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedChatbot.tags.map((tag) => (
                            <button 
                              key={tag} 
                              onClick={() => {
                                setSearchTerm("");
                                const matchingOption = filterOptions.find(opt => opt.name.toLowerCase() === tag.toLowerCase());
                                if (matchingOption) {
                                  setSelectedGenre(matchingOption.name);
                                } else {
                                  setSelectedGenre(tag);
                                }
                                setSelectedChatbot(null); // Close the modal to see results
                              }}
                              className="text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-chicken-dark-bg px-2.5 py-1 rounded-lg cursor-pointer hover:bg-chicken-yellow hover:text-chicken-charcoal transition-colors"
                              title={`Lọc theo tag #${tag}`}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons (Play & Copy Link) */}
                      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-chicken-dark-border">
                        <button
                          onClick={() => {
                            setServingBot(selectedChatbot);
                            setSelectedChatbot(null);
                          }}
                          className="w-full py-3.5 bg-chicken-yellow hover:bg-chicken-yellow-dark text-chicken-charcoal font-extrabold text-sm rounded-xl shadow-sm hover:shadow transition-all duration-200 text-center flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Thưởng thức món ăn 🍲
                        </button>
                        
                        <button
                          onClick={() => copyModalLink(selectedChatbot.playLink)}
                          className={`w-full py-3 border rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                            isCopiedMain 
                              ? "bg-green-50 dark:bg-green-950/40 border-green-200 text-green-600" 
                              : "bg-gray-50 dark:bg-chicken-dark-bg hover:bg-gray-100 dark:hover:bg-chicken-dark-border border-gray-100 dark:border-chicken-dark-border text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {isCopiedMain ? (
                            <>
                              <Check className="w-4 h-4" /> Đã sao chép!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Sao chép link
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                    {/* Right Column (Backstory & Novel-styled Open Scene) */}
                    <div className="flex-1 flex flex-col gap-6 md:border-l md:border-gray-100 md:dark:border-chicken-dark-border md:pl-8">
                      
                      {/* Name of Chatbot */}
                      <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-display leading-tight">
                          {selectedChatbot.name}
                        </h2>
                        <span className="text-xs font-mono font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                          Thể loại chính: <strong className="text-chicken-red dark:text-chicken-yellow font-semibold">{selectedChatbot.genre}</strong>
                        </span>
                      </div>

                      {/* Character Backstory */}
                      <div className="flex flex-col gap-2.5">
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 dark:border-chicken-dark-border pb-1.5">
                          <BookOpen className="w-4 h-4 text-chicken-yellow-dark" /> Giới thiệu nhân vật
                        </h4>
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {selectedChatbot.backstory}
                        </p>
                      </div>

                      {/* Character Open Scene (Novel Format) */}
                      <div className="flex flex-col gap-3 bg-chicken-cream/80 dark:bg-chicken-dark-bg/40 p-5 md:p-6 rounded-2xl border border-chicken-yellow-light/30 dark:border-chicken-dark-border/40 mt-2 relative overflow-hidden">
                        
                        {/* Quote icon watermarks */}
                        <span className="absolute top-2 left-2 text-3xl font-serif text-chicken-yellow-dark/20 pointer-events-none select-none">&ldquo;</span>
                        <span className="absolute bottom-1 right-2 text-3xl font-serif text-chicken-yellow-dark/20 pointer-events-none select-none">&rdquo;</span>
                        
                        <h4 className="text-xs font-bold text-chicken-yellow-dark uppercase tracking-widest mb-1 select-none flex items-center gap-1 font-mono">
                          <Sparkles className="w-3.5 h-3.5" /> Lời mở đầu (Open Scene)
                        </h4>
                        
                        {/* Novel-styled formatting */}
                        <div className="text-sm md:text-base text-gray-800 dark:text-gray-100 leading-relaxed font-serif whitespace-pre-wrap pl-3 border-l-2 border-chicken-yellow-dark/50">
                          {selectedChatbot.openScene}
                        </div>
                      </div>

                    </div>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ----------------- FEEDBACK SUCCESS POPUP MODAL ----------------- */}
          <AnimatePresence>
            {showFeedbackSuccess && (
              <div 
                id="feedback-success-popup"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowFeedbackSuccess(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-chicken-dark-card rounded-3xl p-6 md:p-8 max-w-sm text-center shadow-xl border border-gray-100 dark:border-chicken-dark-border flex flex-col items-center gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 text-green-500 rounded-full flex items-center justify-center text-3xl animate-bounce">
                    ❤️
                  </div>
                  <h3 className="text-xl font-bold font-display text-chicken-red dark:text-chicken-yellow">
                    Gửi thành công!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Cảm ơn bạn đã ghé Tiệm Gà Họ Dương ❤️. Ý kiến đóng góp quý báu của bạn đã được ghi nhận thành công!
                  </p>
                  <button
                    onClick={() => setShowFeedbackSuccess(false)}
                    className="w-full py-2.5 bg-chicken-yellow hover:bg-chicken-yellow-dark text-chicken-charcoal font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
                  >
                    Đóng cửa sổ 🍗
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ----------------- ADD CHATBOT MODAL ----------------- */}
          <AnimatePresence>
            {isAddModalOpen && (
              <div 
                id="add-chatbot-modal"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
                onClick={() => setIsAddModalOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-chicken-dark-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 dark:border-chicken-dark-border flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-chicken-dark-border bg-gray-50/50 dark:bg-chicken-dark-bg/30 select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✍️</span>
                      <span className="font-bold text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-mono">
                        Đóng góp món mới cho thực đơn
                      </span>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="p-2 rounded-xl text-gray-400 hover:text-chicken-red hover:bg-gray-100 dark:hover:bg-chicken-dark-border cursor-pointer transition-colors"
                      title="Đóng cửa sổ"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Scrollable Form Body */}
                  {!isPasscodeVerified ? (
                    <form onSubmit={handlePasscodeSubmit} className="p-6 md:p-8 flex flex-col gap-5 items-center justify-center text-center select-none my-4">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center text-3xl shadow-md border border-amber-200">
                        🔑
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <h3 className="text-base md:text-lg font-black font-display text-[#1E293B] dark:text-[#FFF8E7]">
                          Yêu cầu mật mã đầu bếp!
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          Bạn đang mở mục đóng góp món ăn mới. Vui lòng nhập đúng mật mã của Tiệm Gà Họ Dương để tiếp tục.
                        </p>
                      </div>
                      
                      <div className="w-full max-w-sm flex flex-col gap-2">
                        <input
                          type="password"
                          required
                          value={passcodeInput}
                          onChange={(e) => setPasscodeInput(e.target.value)}
                          placeholder="Nhập mật mã của Tiệm..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/50 dark:bg-chicken-dark-bg/50 text-chicken-charcoal dark:text-white focus:border-[#F4D35E] outline-none text-center font-bold tracking-widest text-sm transition-all shadow-inner animate-fade-in"
                        />
                        {passcodeError && (
                          <p className="text-red-500 text-[11px] font-bold animate-pulse">
                            ⚠️ {passcodeError}
                          </p>
                        )}
                      </div>

                      <div className="w-full max-w-sm flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="flex-1 py-2.5 border border-gray-200 dark:border-chicken-dark-border hover:bg-gray-50 dark:hover:bg-chicken-dark-bg text-gray-600 dark:text-gray-300 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-[#F4D35E] hover:bg-[#FFE8A3] text-[#1E293B] font-black rounded-xl shadow-md transition-all cursor-pointer text-xs"
                        >
                          Xác nhận 🗝️
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleAddChatbotSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 text-xs md:text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Tên Nhân Vật *</label>
                        <input
                          type="text"
                          required
                          value={newBotName}
                          onChange={(e) => setNewBotName(e.target.value)}
                          placeholder="Nhập tên chatbot (Ví dụ: Cam Nhỏ, v.v.)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/30 dark:bg-chicken-dark-bg/30 text-chicken-charcoal dark:text-white focus:border-chicken-yellow outline-none transition-colors font-medium"
                        />
                      </div>

                      {/* Genre */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Thể loại chính *</label>
                        <input
                          type="text"
                          required
                          value={newBotGenre}
                          onChange={(e) => setNewBotGenre(e.target.value)}
                          placeholder="Ví dụ: Slice of Life, Healing"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/30 dark:bg-chicken-dark-bg/30 text-chicken-charcoal dark:text-white focus:border-chicken-yellow outline-none transition-colors font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tags */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Thẻ từ khóa (phân tách bằng dấu phẩy)</label>
                        <input
                          type="text"
                          value={newBotTags}
                          onChange={(e) => setNewBotTags(e.target.value)}
                          placeholder="Ví dụ: Bạn thân, Thanh mai trúc mã, Ngọt"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/30 dark:bg-chicken-dark-bg/30 text-chicken-charcoal dark:text-white focus:border-chicken-yellow outline-none transition-colors font-medium"
                        />
                      </div>

                      {/* Avatar Link */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Link ảnh đại diện (để trống nếu dùng ảnh mặc định)</label>
                        <input
                          type="url"
                          value={newBotAvatar}
                          onChange={(e) => setNewBotAvatar(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/30 dark:bg-chicken-dark-bg/30 text-chicken-charcoal dark:text-white focus:border-chicken-yellow outline-none transition-colors font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Play Link */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Link Trò Chuyện (Play Link) *</label>
                        <input
                          type="url"
                          required
                          value={newBotPlayLink}
                          onChange={(e) => setNewBotPlayLink(e.target.value)}
                          placeholder="https://kommodo.ai/chat/..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/30 dark:bg-chicken-dark-bg/30 text-chicken-charcoal dark:text-white focus:border-chicken-yellow outline-none transition-colors font-medium"
                        />
                      </div>

                      {/* Author */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700 dark:text-gray-300">Bếp trưởng (Tác giả)</label>
                        <input
                          type="text"
                          value={newBotAuthor}
                          onChange={(e) => setNewBotAuthor(e.target.value)}
                          placeholder="Ví dụ: Dương Tiệm Trưởng"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/30 dark:bg-chicken-dark-bg/30 text-chicken-charcoal dark:text-white focus:border-chicken-yellow outline-none transition-colors font-medium"
                        />
                      </div>
                    </div>

                    {/* Short Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-700 dark:text-gray-300">Mô tả ngắn *</label>
                      <input
                        type="text"
                        required
                        value={newBotShortDesc}
                        onChange={(e) => setNewBotShortDesc(e.target.value)}
                        placeholder="Ví dụ: Một đôi bạn thân cùng lớn lên từ con ngõ nhỏ Thanh Đảo..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/30 dark:bg-chicken-dark-bg/30 text-chicken-charcoal dark:text-white focus:border-chicken-yellow outline-none transition-colors font-medium"
                      />
                    </div>

                    {/* Backstory */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-700 dark:text-gray-300">Giới thiệu nhân vật / Backstory</label>
                      <textarea
                        rows={3}
                        value={newBotBackstory}
                        onChange={(e) => setNewBotBackstory(e.target.value)}
                        placeholder="Thông tin tiểu sử chi tiết của nhân vật..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/30 dark:bg-chicken-dark-bg/30 text-chicken-charcoal dark:text-white focus:border-chicken-yellow outline-none transition-colors font-medium resize-none"
                      />
                    </div>

                    {/* Open Scene */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-700 dark:text-gray-300">Lời mở đầu (Open Scene)</label>
                      <textarea
                        rows={3}
                        value={newBotOpenScene}
                        onChange={(e) => setNewBotOpenScene(e.target.value)}
                        placeholder="Câu thoại chào mừng ngọt ngào mở đầu trò chuyện..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-chicken-dark-border bg-gray-50/30 dark:bg-chicken-dark-bg/30 text-chicken-charcoal dark:text-white focus:border-chicken-yellow outline-none transition-colors font-medium resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-gray-100 dark:border-chicken-dark-border flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="flex-1 py-3 border border-gray-200 dark:border-chicken-dark-border hover:bg-gray-50 dark:hover:bg-chicken-dark-bg text-gray-600 dark:text-gray-300 font-bold rounded-xl transition-colors cursor-pointer text-center text-xs md:text-sm"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-chicken-yellow hover:bg-chicken-yellow-dark text-chicken-charcoal font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer text-center text-xs md:text-sm"
                      >
                        Thêm món mới 🍗
                      </button>
                    </div>

                  </form>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ----------------- ADD CHATBOT SUCCESS POPUP ----------------- */}
          <AnimatePresence>
            {showAddSuccess && (
              <div 
                id="add-success-popup"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowAddSuccess(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-chicken-dark-card rounded-3xl p-6 md:p-8 max-w-sm text-center shadow-xl border border-gray-100 dark:border-chicken-dark-border flex flex-col items-center gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-16 h-16 bg-chicken-yellow/10 dark:bg-chicken-yellow/5 text-chicken-yellow-dark rounded-full flex items-center justify-center text-3xl animate-bounce">
                    🍗
                  </div>
                  <h3 className="text-xl font-bold font-display text-chicken-red dark:text-chicken-yellow">
                    Thêm món thành công!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Chatbot của bạn đã được thêm thành công vào thực đơn! Bạn có thể lọc theo thể loại và các thẻ của chatbot đó ngay bây giờ.
                  </p>
                  <button
                    onClick={() => setShowAddSuccess(false)}
                    className="w-full py-2.5 bg-chicken-yellow hover:bg-chicken-yellow-dark text-chicken-charcoal font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
                  >
                    Thưởng thức ngay! 😋
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ----------------- CHEF SERVING OVERLAY ----------------- */}
          <AnimatePresence>
            {servingBot && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/95 backdrop-blur-md overflow-hidden select-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -30 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-xl text-center bg-[#1E293B] border-2 border-yellow-300/40 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(244,211,94,0.15)] relative flex flex-col items-center gap-6"
                >
                  {/* Glowing Hanging Lantern decor in overlay */}
                  <div className="absolute top-[-20px] left-8 w-1 h-12 bg-amber-200/20" />
                  <div className="absolute top-[20px] left-6 w-5 h-5 rounded-full bg-[#FFD54F] animate-pulse shadow-[0_0_15px_#FFD54F]" />

                  <div className="absolute top-[-20px] right-8 w-1 h-12 bg-amber-200/20" />
                  <div className="absolute top-[20px] right-6 w-5 h-5 rounded-full bg-[#FFD54F] animate-pulse shadow-[0_0_15px_#FFD54F]" />

                  {/* Traditional Wood Counter Plate Rendering */}
                  <div className="relative w-48 h-48 md:w-56 md:h-56 mt-4 flex items-center justify-center">
                    
                    {/* Wooden Counter Line base */}
                    <div className="absolute bottom-2 w-full h-4 bg-amber-800 rounded-full shadow-md" />
                    
                    {/* Steaming Bowl Container */}
                    <motion.div 
                      initial={{ y: -60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 10, stiffness: 80, delay: 0.5 }}
                      className="relative z-10 flex flex-col items-center"
                    >
                      {/* Steam elements */}
                      <div className="absolute top-[-40px] flex gap-3.5 z-20">
                        <motion.span 
                          animate={{ y: [-5, -25], opacity: [0, 0.8, 0], scale: [1, 1.3] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          className="text-2xl text-amber-100/60 font-serif filter blur-[1px]"
                        >
                          ♨
                        </motion.span>
                        <motion.span 
                          animate={{ y: [0, -30], opacity: [0, 0.9, 0], scale: [0.9, 1.4] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                          className="text-xl text-amber-200/50 font-serif filter blur-[1.5px]"
                        >
                          ♨
                        </motion.span>
                        <motion.span 
                          animate={{ y: [-5, -20], opacity: [0, 0.7, 0], scale: [1.1, 1.5] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                          className="text-2xl text-amber-100/40 font-serif filter blur-[1px]"
                        >
                          ♨
                        </motion.span>
                      </div>

                      {/* Steaming hot anime dish illustration using standard HTML/CSS and emojis */}
                      <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 p-3 shadow-lg border-4 border-[#FFF8E7] flex items-center justify-center animate-float relative">
                        <span className="text-6xl md:text-7xl">🍲</span>
                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white font-extrabold text-xs px-2 py-1 rounded-full shadow-md">
                          NÓNG HỔI
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Shiny glow behind dish */}
                    <div className="absolute inset-0 bg-yellow-300/10 rounded-full filter blur-xl animate-pulse" />
                  </div>

                  {/* Chef's Message Board */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-xs font-bold tracking-widest text-amber-300 uppercase font-mono">
                      👨‍🍳 ĐẦU BẾP ĐANG ĐẶT MÓN LÊN QUẦY...
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#FFF8E7] font-display">
                      Thực Đơn Tinh Thần: {servingBot.name}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-md italic mt-1 px-4">
                      &ldquo; Mỗi món ăn tại tiệm là một câu chuyện ấm áp để xoa dịu tâm hồn bạn. Món &lsquo;{servingBot.name}&rsquo; của quý khách đã chuẩn bị xong, hãy thưởng thức khi còn nóng hổi. &rdquo;
                    </p>
                  </div>

                  {/* Action button to confirm and open link */}
                  <div className="w-full flex gap-3 mt-4">
                    <button
                      onClick={() => setServingBot(null)}
                      className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-[#FFF8E7] border border-slate-600 font-bold rounded-2xl transition-colors cursor-pointer text-xs"
                    >
                      Chọn món khác ↺
                    </button>
                    <button
                      onClick={() => {
                        triggerConfetti();
                        // Open chatbot link
                        window.open(servingBot.playLink, "_blank", "referrer");
                        setServingBot(null);
                      }}
                      className="flex-2 py-3.5 bg-[#F4D35E] hover:bg-[#FFE8A3] text-[#1E293B] font-extrabold rounded-2xl shadow-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-xs md:text-sm"
                    >
                      🍵 Thưởng thức ngay câu chuyện
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ----------------- FLOATING BACK-TO-TOP BUTTON ----------------- */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                id="back-to-top"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-6 right-6 z-40 p-3.5 bg-chicken-yellow text-chicken-charcoal hover:bg-chicken-yellow-dark rounded-full shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200"
                title="Quay về đầu trang"
              >
                <ChevronUp className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
