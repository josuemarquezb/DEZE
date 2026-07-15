// components/PhotoGallery.jsx — responsive photo grid with hover-to-delete
// and click-to-preview (via PhotoPreview). Used anywhere a set of photo URLs
// needs to be displayed: equipment photos, verification docs, job before/after.

import { useState } from 'react';
import PhotoPreview from './PhotoPreview.jsx';
import { toAssetUrl } from '../services/api.js';

const SKELETON_COUNT = 4;

/**
 * @param {string[]} photos
 * @param {boolean} [loading]
 * @param {(url: string) => void} [onDelete] - omit to render a read-only gallery
 * @param {string} [emptyText]
 */
function PhotoGallery({ photos = [], loading = false, onDelete, emptyText = 'No photos yet.' }) {
  const [previewIndex, setPreviewIndex] = useState(null);
  const [deletingUrl, setDeletingUrl] = useState(null);

  const handleDelete = async (e, url) => {
    e.stopPropagation();
    if (!window.confirm('Delete this photo? This cannot be undone.')) return;
    setDeletingUrl(url);
    try {
      await onDelete(url);
    } finally {
      setDeletingUrl(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-lg bg-zinc-800" />
        ))}
      </div>
    );
  }

  if (!photos.length) {
    return <p className="text-sm text-zinc-500">{emptyText}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((url, i) => (
          <div
            key={url}
            onClick={() => setPreviewIndex(i)}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
          >
            <img src={toAssetUrl(url)} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            {onDelete && (
              <button
                type="button"
                onClick={(e) => handleDelete(e, url)}
                disabled={deletingUrl === url}
                aria-label="Delete photo"
                className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1.5 text-xs text-white opacity-0 transition-opacity hover:bg-red-500/80 disabled:opacity-100 group-hover:opacity-100"
              >
                {deletingUrl === url ? '…' : '✕'}
              </button>
            )}
          </div>
        ))}
      </div>

      {previewIndex !== null && (
        <PhotoPreview photos={photos.map(toAssetUrl)} initialIndex={previewIndex} onClose={() => setPreviewIndex(null)} />
      )}
    </>
  );
}

export default PhotoGallery;
