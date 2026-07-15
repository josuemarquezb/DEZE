// components/PhotoPreview.jsx — full-screen modal photo viewer with
// previous/next navigation. Used by PhotoGallery when a thumbnail is clicked.

import { useEffect, useState } from 'react';

function PhotoPreview({ photos, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [photos.length, onClose]);

  if (!photos.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-300 hover:text-white"
      >
        ✕
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i - 1 + photos.length) % photos.length);
          }}
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-900/80 p-3 text-2xl text-zinc-300 hover:text-white sm:left-4"
        >
          ‹
        </button>
      )}

      <img
        src={photos[index]}
        alt={`Photo ${index + 1} of ${photos.length}`}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {photos.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i + 1) % photos.length);
          }}
          aria-label="Next photo"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-900/80 p-3 text-2xl text-zinc-300 hover:text-white sm:right-4"
        >
          ›
        </button>
      )}

      {photos.length > 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-zinc-400">
          {index + 1} / {photos.length}
        </p>
      )}
    </div>
  );
}

export default PhotoPreview;
