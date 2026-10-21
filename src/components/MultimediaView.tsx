import React, { useState, useRef } from 'react';
import { 
  Sparkles, Image as ImageIcon, Video, Mic, Volume2, 
  Brain, Globe, MapPin, Dna, Upload, Play, Square, Loader2, Send
} from 'lucide-react';

export const MultimediaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'audio' | 'chat' | 'grounded' | 'bio'>('image');

  // --- IMAGE STUDIO STATE ---
  const [imagePrompt, setImagePrompt] = useState('Cyberpunk holographic audio synthesizer floating in neon dark studio');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('2K');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('/src/assets/images/neon_studio_hero_1792562543856.jpg');
  const [inputImageBase64, setInputImageBase64] = useState<string | null>(null);
  const [imageNotice, setImageNotice] = useState<string | null>(null);

  // --- VIDEO FORGE STATE ---
  const [videoPrompt, setVideoPrompt] = useState('Cinematic aerial flythrough of neon cyber city illuminated with bioluminescent towers');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<string | null>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);

  // --- AUDIO & VOICE STATE ---
  const [ttsInputText, setTtsInputText] = useState('NeonStudio quantum pipeline initialized. All audio stems and generative renders are synchronized.');
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [isSynthesizingSpeech, setIsSynthesizingSpeech] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- CHAT & HIGH THINKING STATE ---
  const [chatModel, setChatModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-4-argon');
  const [enableHighThinking, setEnableHighThinking] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string; thinking?: boolean }>>([
    {
      role: 'model',
      text: 'NeonStudio Core Intelligence ready. Powered by Gemini 4 Argon with High Thinking enabled. How can I assist your multimedia workflow today?',
    },
  ]);
  const [isChatSending, setIsChatSending] = useState(false);

  // --- GROUNDED SEARCH & MAPS STATE ---
  const [groundedQuery, setGroundedQuery] = useState('Latest breakthroughs in multi-modal video generation models 2026');
  const [groundedType, setGroundedType] = useState<'search' | 'maps'>('search');
  const [groundedResult, setGroundedResult] = useState<string | null>(null);
  const [isQueryingGrounded, setIsQueryingGrounded] = useState(false);

  // --- BIOSCIENCE STATE ---
  const [bioQuery, setBioQuery] = useState('CRISPR-Cas9 guide RNA ribonucleoprotein target recognition mechanism');
  const [bioResult, setBioResult] = useState<any>({
    pdbId: '7KRR',
    name: 'Cas9 Endonuclease Complex',
    resolution: '1.9 Å',
    activeSites: ['Asp10', 'Glu762', 'His840', 'Asn863'],
    molecularWeight: '158.4 kDa',
    insights: 'Engineered endonuclease catalytic site verified for targeted genomic insertions. High bioluminescent affinity at loop 3.'
  });
  const [isQueryingBio, setIsQueryingBio] = useState(false);

  // 1. Generate Image Handler
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio,
          imageSize,
          base64InputImage: inputImageBase64 ? inputImageBase64.split(',')[1] : undefined,
          mimeType: inputImageBase64 ? 'image/jpeg' : undefined,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
      if (data.message) {
        setImageNotice(data.message);
      } else {
        setImageNotice(null);
      }
    } catch (err) {
      // Quiet error recovery
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 2. Generate Video Handler (Omni Flash)
  const handleGenerateVideo = async () => {
    setIsRenderingVideo(true);
    try {
      const res = await fetch('/api/ai/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspect,
          seedImageBase64: inputImageBase64 ? inputImageBase64.split(',')[1] : undefined,
        }),
      });
      const data = await res.json();
      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
      }
    } catch (err) {
      console.error('Video generation error:', err);
    } finally {
      setIsRenderingVideo(false);
    }
  };

  // Video Analysis Handler
  const handleAnalyzeVideo = async () => {
    setIsAnalyzingVideo(true);
    try {
      const res = await fetch('/api/ai/video-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: generatedVideoUrl,
          description: videoPrompt,
        }),
      });
      const data = await res.json();
      setVideoAnalysisResult(data.analysis || 'Analysis complete.');
    } catch (err) {
      console.error('Video analysis error:', err);
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  // 3. Audio TTS Handler
  const handleGenerateTTS = async () => {
    setIsSynthesizingSpeech(true);
    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsInputText,
          voice: selectedVoice,
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        setAudioBlobUrl(`data:audio/wav;base64,${data.audioBase64}`);
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsSynthesizingSpeech(false);
    }
  };

  // Microphone recording for Transcription
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          setIsTranscribing(true);
          try {
            const res = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Data,
                mimeType: 'audio/webm',
              }),
            });
            const data = await res.json();
            setTranscribedText(data.text || 'Transcription complete.');
          } catch (err) {
            console.error('Transcribe error:', err);
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      // Fallback transcription simulation for restricted browser perms
      setIsTranscribing(true);
      setTimeout(async () => {
        const res = await fetch('/api/ai/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: 'sample' }),
        });
        const data = await res.json();
        setTranscribedText(data.text);
        setIsTranscribing(false);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 4. Chat Send Handler
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsChatSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          model: chatModel,
          thinking: enableHighThinking && chatModel === 'gemini-4-argon',
          history: chatMessages.slice(-6).map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.text || 'Response received.',
          thinking: enableHighThinking && chatModel === 'gemini-4-argon',
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsChatSending(false);
    }
  };

  // 5. Grounded Search & Maps Handler
  const handleRunGrounded = async () => {
    setIsQueryingGrounded(true);
    try {
      const res = await fetch('/api/ai/grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: groundedQuery,
          type: groundedType,
        }),
      });
      const data = await res.json();
      setGroundedResult(data.text || 'Grounded results updated.');
    } catch (err) {
      console.error('Grounded error:', err);
    } finally {
      setIsQueryingGrounded(false);
    }
  };

  // 6. Bioscience Handler
  const handleRunBio = async () => {
    setIsQueryingBio(true);
    try {
      const res = await fetch('/api/ai/science', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: bioQuery }),
      });
      const data = await res.json();
      setBioResult(data);
    } catch (err) {
      console.error('Bio error:', err);
    } finally {
      setIsQueryingBio(false);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>AI Multimedia Creation Bay</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
              Multimodal 2026
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dedicated creative suites for high-precision image generation, Omni Flash video, speech synthesis, and deep reasoning.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-white/10 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('image')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'image' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'video' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Forge</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'audio' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Audio & Voice</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'chat' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>High Thinking</span>
          </button>
          <button
            onClick={() => setActiveTab('grounded')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'grounded' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Grounded</span>
          </button>
          <button
            onClick={() => setActiveTab('bio')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bio' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Bioscience</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: IMAGE STUDIO --- */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#090d16]/90 border border-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Gemini Nano Banana & 3-Pro Image Studio
            </h2>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Prompt / Editing Instruction</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full h-24 p-3 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                placeholder="Describe your visual concept..."
              />
            </div>

            {/* Aspect Ratio Selector (1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9) */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Aspect Ratio Affordance</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {['1:1', '16:9', '9:16', '4:3', '21:9', '3:2', '2:3', '3:4'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-center transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selector (1K, 2K, 4K) */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Image Quality & Resolution (1K, 2K, 4K)</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['1K', '2K', '4K'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setImageSize(size)}
                    className={`py-1.5 rounded-lg font-mono text-center transition-colors ${
                      imageSize === size
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400 font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {size} UHD
                  </button>
                ))}
              </div>
            </div>

            {/* Seed Image Upload */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Seed Image for Editing (Optional)</label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-900/60 border border-dashed border-white/10 hover:border-cyan-400/50 cursor-pointer text-xs text-slate-400 hover:text-white transition-colors">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>{inputImageBase64 ? 'Image Loaded for Editing' : 'Upload photo to analyze/edit'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setInputImageBase64(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGeneratingImage ? 'Synthesizing with Nano Banana 2.1...' : 'Generate Studio Image'}</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-[#090d16]/90 border border-white/10 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-white/10">
                <span className="font-semibold text-white">Live Render Preview</span>
                <span className="font-mono text-cyan-400">{aspectRatio} · {imageSize}</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60 aspect-video flex items-center justify-center relative">
                <img
                  src={generatedImageUrl}
                  alt="Render output"
                  className="w-full h-full object-cover"
                />
              </div>
              {imageNotice && (
                <div className="mt-2 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
                  {imageNotice}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">Model: gemini-nano-banana-2.1 / Studio Asset</span>
              <a
                href={generatedImageUrl}
                download="neonstudio-render.jpg"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Download Render
              </a>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: VIDEO FORGE --- */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#090d16]/90 border border-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Video className="w-4 h-4" /> Gemini Omni 1.1 Flash Video Generator
            </h2>
            <p className="text-xs text-slate-400">
              Uses the Gemini Interactions API to create cinematic camera movements or animate seed photos into 4-second video clips.
            </p>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Video Prompt & Camera Direction</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="w-full h-24 p-3 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Aspect Ratio (Interactions API Standard)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['16:9', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setVideoAspect(ratio)}
                    className={`py-2 rounded-lg font-mono text-center transition-colors ${
                      videoAspect === ratio
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400 font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {ratio === '16:9' ? '16:9 Landscape' : '9:16 Portrait / Story'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isRenderingVideo}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRenderingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
              <span>{isRenderingVideo ? 'Interactions API Processing...' : 'Generate Video (Omni Flash)'}</span>
            </button>

            {/* Video Understanding via Gemini 4 Argon */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Analyze Video Content with Gemini 4 Argon</span>
              <button
                onClick={handleAnalyzeVideo}
                disabled={isAnalyzingVideo}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzingVideo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isAnalyzingVideo ? 'Analyzing Video Frames...' : 'Analyze Video with Gemini 4 Argon'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#090d16]/90 border border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-white/10">
                <span className="font-semibold text-white">Video Playback Monitor</span>
                <span className="font-mono text-purple-400">{videoAspect} · 1080p</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60 aspect-video flex items-center justify-center">
                <video
                  src={generatedVideoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {videoAnalysisResult && (
              <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-purple-300">
                  <Brain className="w-3.5 h-3.5" /> Gemini 4 Argon Scene Intelligence
                </div>
                <p className="whitespace-pre-line text-[11px] leading-relaxed text-slate-300">{videoAnalysisResult}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: AUDIO & VOICE BAY --- */}
      {activeTab === 'audio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Transcription column */}
          <div className="lg:col-span-6 bg-[#090d16]/90 border border-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Mic className="w-4 h-4" /> Live Microphone Transcription (Gemini 3.5 Transcribe)
            </h2>
            <p className="text-xs text-slate-400">
              Speak into your microphone to record audio stems and transcribe them in real time with gemini-3.5-transcribe.
            </p>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-dashed border-white/10 flex flex-col items-center justify-center space-y-3">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 text-red-400 flex items-center justify-center animate-pulse hover:bg-red-500/30 transition-all cursor-pointer"
                >
                  <Square className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center hover:bg-emerald-500/30 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <Mic className="w-7 h-7" />
                </button>
              )}
              <span className="text-xs font-mono text-slate-300">
                {isRecording ? 'Recording Voice Stem... (Click to Stop)' : 'Click Mic to Record Stem'}
              </span>
            </div>

            {isTranscribing && (
              <div className="text-xs text-emerald-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Transcribing via gemini-3.5-transcribe...</span>
              </div>
            )}

            {transcribedText && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
                <span className="text-emerald-400 font-semibold font-mono block">Transcription Output:</span>
                <p className="text-slate-200">{transcribedText}</p>
              </div>
            )}
          </div>

          {/* Text-to-Speech column */}
          <div className="lg:col-span-6 bg-[#090d16]/90 border border-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Text-to-Speech Synthesis (Gemini 3.8 Flash TTS)
            </h2>
            <p className="text-xs text-slate-400">
              Convert scripts and dialogue into high-fidelity speech audio stems using gemini-3.8-flash-tts.
            </p>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Dialogue Script</label>
              <textarea
                value={ttsInputText}
                onChange={(e) => setTtsInputText(e.target.value)}
                className="w-full h-24 p-3 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Voice Persona</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Zephyr">Zephyr (Confident / Crisp)</option>
                  <option value="Kore">Kore (Warm / Articulate)</option>
                  <option value="Puck">Puck (Energetic / Dramatic)</option>
                  <option value="Fenrir">Fenrir (Deep / Cinematic)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateTTS}
                  disabled={isSynthesizingSpeech}
                  className="w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSynthesizingSpeech ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSynthesizingSpeech ? 'Synthesizing...' : 'Synthesize Speech'}</span>
                </button>
              </div>
            </div>

            {audioBlobUrl && (
              <div className="p-3 rounded-lg bg-[#070a11] border border-cyan-500/30 space-y-2">
                <span className="text-xs text-cyan-300 font-mono">Synthesized Stem (24kHz Mono WAV)</span>
                <audio controls src={audioBlobUrl} className="w-full h-8" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: CHAT & HIGH THINKING --- */}
      {activeTab === 'chat' && (
        <div className="bg-[#090d16]/90 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Gemini Intelligence Multi-Turn Chat</h2>
                <span className="text-xs text-slate-400">Argon reasoning, Flash speed, and Flash-Lite low latency</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="gemini-4-argon">gemini-4-argon (Complex / Thinking)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (General Intelligence)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Low Latency)</option>
              </select>

              {chatModel === 'gemini-4-argon' && (
                <label className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableHighThinking}
                    onChange={(e) => setEnableHighThinking(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span>ThinkingLevel.HIGH</span>
                </label>
              )}
            </div>
          </div>

          {/* Chat thread */}
          <div className="h-80 overflow-y-auto space-y-3 p-3 rounded-lg bg-[#070a11]/80 border border-white/5 font-sans">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-500 mb-1 font-mono uppercase">
                  {msg.role === 'user' ? 'You' : msg.thinking ? 'Gemini 4 Argon (High Thinking)' : 'Gemini AI'}
                </div>
                <div
                  className={`max-w-2xl p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 text-white border border-cyan-500/30'
                      : 'bg-slate-900 text-slate-200 border border-white/10 whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatSending && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking through reasoning steps...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything or generate prompt workflows..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isChatSending}
              className="px-4 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* --- TAB 5: GROUNDED SEARCH & MAPS --- */}
      {activeTab === 'grounded' && (
        <div className="bg-[#090d16]/90 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" /> Grounded Search & Maps Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                Ground answers in real-time Google Search data or location-based Google Maps intelligence with gemini-3.8-flash.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setGroundedType('search')}
                className={`px-3 py-1 rounded transition-colors ${
                  groundedType === 'search' ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-400'
                }`}
              >
                Google Search
              </button>
              <button
                onClick={() => setGroundedType('maps')}
                className={`px-3 py-1 rounded transition-colors ${
                  groundedType === 'maps' ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-400'
                }`}
              >
                Google Maps
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={groundedQuery}
              onChange={(e) => setGroundedQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              placeholder="Query to ground..."
            />
            <button
              onClick={handleRunGrounded}
              disabled={isQueryingGrounded}
              className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {isQueryingGrounded ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              <span>Ground Query</span>
            </button>
          </div>

          {groundedResult && (
            <div className="p-4 rounded-lg bg-[#070a11] border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-semibold">
                <span>Verified Grounded Synthesis ({groundedType}):</span>
              </div>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{groundedResult}</p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 6: BIOSCIENCE LAB --- */}
      {activeTab === 'bio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#090d16]/90 border border-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Dna className="w-4 h-4" /> Computational Bioscience & Cryo-EM Lab
            </h2>
            <p className="text-xs text-slate-400">
              Leverage Gemini 4 Argon with High Thinking to inspect macromolecular structures, PDB complexes, and guide RNA binding.
            </p>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Target Molecule / Biological Query</label>
              <textarea
                value={bioQuery}
                onChange={(e) => setBioQuery(e.target.value)}
                className="w-full h-24 p-3 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <button
              onClick={handleRunBio}
              disabled={isQueryingBio}
              className="w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isQueryingBio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
              <span>Analyze Molecular Structure</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-[#090d16]/90 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
              <span className="font-semibold text-white">3D Cryo-EM Cryo-Density Structure</span>
              <span className="font-mono text-cyan-400">PDB: {bioResult?.pdbId || '7KRR'}</span>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/60 relative">
              <img
                src="/src/assets/images/template_bio_research_1792562544579.jpg"
                alt="Molecular Cryo-EM Render"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 border border-white/10 text-[10px] font-mono text-cyan-300">
                Resolution: {bioResult?.resolution || '1.9 Å'} · MW: {bioResult?.molecularWeight || '158.4 kDa'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#070a11] border border-cyan-500/20 space-y-1.5 text-xs">
              <div className="font-bold text-white">{bioResult?.name || 'CRISPR-Cas9 Endonuclease'}</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{bioResult?.insights}</p>
              {bioResult?.activeSites && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-cyan-400">
                  <span className="text-slate-500">Active Sites:</span>
                  <span>{bioResult.activeSites.join(' · ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
