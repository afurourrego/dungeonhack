"use client";

import { useState, useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';

export default function BackgroundAudio() {
  const {
    isPlaying,
    volume,
    isMuted,
    play,
    pause,
    setVolume,
    toggleMute,
    error
  } = useAudio({
    src: '/audio/background.mp3',
    volume: 0.1, // Volumen por defecto bajo (10%)
    loop: true,
    autoplay: true
  });

  const [showControls, setShowControls] = useState(false);
  const [showAudioBanner, setShowAudioBanner] = useState(false);

  // Mostrar banner cuando hay error o audio no está reproduciendo inicialmente
  useEffect(() => {
    if (error || (!isPlaying && !isMuted)) {
      setShowAudioBanner(true);
      // El banner ahora permanece hasta que el usuario haga click en el control de audio
    } else {
      // Si el audio está funcionando, ocultar el banner inmediatamente
      setShowAudioBanner(false);
    }
  }, [error, isPlaying, isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <>
      {/* Control de Audio - Posicionado discretamente en la esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          {/* Botón principal de audio */}
          <button
            onClick={() => {
              setShowControls(!showControls);
              // Ocultar banner cuando el usuario interactúa con el control de audio
              setShowAudioBanner(false);
            }}
            className="bg-gray-900/80 backdrop-blur-sm border border-amber-600/40 rounded-lg p-2 hover:border-amber-500/60 transition-all duration-200 hover:bg-gray-800/80"
            title={error ? "Enable Audio" : "Audio Controls"}
          >
            {error ? (
              // Icono de audio muted/error
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.616 0zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 011.414-1.414z" clipRule="evenodd" />
              </svg>
            ) : isMuted ? (
              // Icono de audio muted
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.616 0zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            ) : isPlaying ? (
              // Icono de audio playing
              <svg className="w-5 h-5 text-dungeon-gold animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.616 0zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 011.414-1.414z" clipRule="evenodd" />
                <path d="M12 7.5a.5.5 0 11-1 0 .5.5 0 011 0zM15 10a.5.5 0 11-1 0 .5.5 0 011 0zM12 12.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
            ) : (
              // Icono de audio paused
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.616 0zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 011.414-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Panel de controles expandido */}
          {showControls && (
            <div className="absolute top-12 right-0 bg-gray-900/95 backdrop-blur-sm border border-amber-600/40 rounded-lg p-4 min-w-[200px] shadow-xl">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-dungeon-gold text-center">Audio Controls</h3>

                {/* Error message */}
                {error && (
                  <div className="bg-red-900/30 border border-red-500 rounded p-2">
                    <p className="text-xs text-red-400 text-center">{error}</p>
                    <button
                      onClick={play}
                      className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded transition-colors"
                    >
                      Enable Audio
                    </button>
                  </div>
                )}

                {/* Play/Pause button */}
                <div className="flex justify-center">
                  <button
                    onClick={isPlaying ? pause : play}
                    className="bg-dungeon-purple hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    disabled={!!error}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>

                {/* Volume control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">Volume</span>
                    <button
                      onClick={toggleMute}
                      className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    disabled={isMuted}
                  />

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span className="text-dungeon-gold">{Math.round(volume * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="text-center">
                  <span className={`text-xs px-2 py-1 rounded ${
                    isPlaying && !isMuted
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-gray-700/50 text-gray-400'
                  }`}>
                    {isPlaying && !isMuted ? 'Playing' : 'Muted'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar controles al hacer click fuera */}
      {showControls && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowControls(false)}
        />
      )}

      {/* Banner flotante informativo para audio bloqueado */}
      {showAudioBanner && (
        <div
          className="fixed top-16 right-4 z-50 cursor-pointer"
          onClick={() => setShowAudioBanner(false)}
        >
          <div className="bg-gray-900/95 border border-gray-600 rounded-lg px-6 py-4 shadow-xl backdrop-blur-sm max-w-md">
            <div className="flex items-center space-x-3">
              {/* Icono de información */}
              <div className="text-blue-400 text-xl">ℹ️</div>

              {/* Contenido del mensaje */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-200 mb-1">
                  Audio bloqueado por el navegador
                </h3>
                <p className="text-xs text-gray-300">
                  Haz click en el control de volumen
                  <span className="inline-block mx-1 text-gray-400">🔊</span>
                  arriba para activar la música de fondo.
                </p>
              </div>

              {/* Flecha apuntando arriba */}
              <div className="text-gray-400 text-lg">⬆️</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #92400e;
          box-shadow: 0 0 4px rgba(251, 191, 36, 0.5);
        }

        .slider::-webkit-slider-thumb:hover {
          background: #f59e0b;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.8);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #92400e;
          box-shadow: 0 0 4px rgba(251, 191, 36, 0.5);
        }

      `}</style>
    </>
  );
}
