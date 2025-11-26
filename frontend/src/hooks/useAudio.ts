"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface AudioHookOptions {
  src: string;
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
}

interface AudioHookReturn {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  play: () => Promise<void>;
  pause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  error: string | null;
}

export function useAudio({
  src,
  volume = 0.1, // Volumen por defecto bajo (10%)
  loop = true,
  autoplay = true
}: AudioHookOptions): AudioHookReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración guardada
  useEffect(() => {
    const savedVolume = localStorage.getItem('dungeon-audio-volume');
    const savedMuted = localStorage.getItem('dungeon-audio-muted');

    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setCurrentVolume(Math.max(0, Math.min(1, vol)));
    }

    if (savedMuted) {
      setIsMuted(savedMuted === 'true');
    }
  }, []);

  // Inicializar audio
  useEffect(() => {
    try {
      const audio = new Audio();
      audio.src = src;
      audio.loop = loop;
      audio.volume = isMuted ? 0 : currentVolume;
      audio.preload = 'auto';

      // Manejar eventos
      audio.addEventListener('canplaythrough', () => {
        if (autoplay) {
          // Intentar autoplay (puede fallar en algunos browsers)
          audio.play().catch((err) => {
            console.warn('Autoplay prevented:', err);
            setError('Audio autoplay was prevented by browser. Click to enable audio.');
          });
        }
      });

      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setError(null);
      });

      audio.addEventListener('pause', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setError('Failed to load audio file');
      });

      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = '';
      };
    } catch (err) {
      console.error('Failed to create audio element:', err);
      setError('Failed to initialize audio');
    }
  }, [src, loop, autoplay]);

  // Actualizar volumen cuando cambie
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : currentVolume;
    }
  }, [currentVolume, isMuted]);

  const play = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setError(null);
    } catch (err) {
      console.error('Failed to play audio:', err);
      setError('Failed to play audio');
      throw err;
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setCurrentVolume(clampedVolume);
    localStorage.setItem('dungeon-audio-volume', clampedVolume.toString());

    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clampedVolume;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('dungeon-audio-muted', newMuted.toString());

    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : currentVolume;
    }
  }, [isMuted, currentVolume]);

  return {
    audio: audioRef.current,
    isPlaying,
    volume: currentVolume,
    isMuted,
    play,
    pause,
    setVolume,
    toggleMute,
    error
  };
}
