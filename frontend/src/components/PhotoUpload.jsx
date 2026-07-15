// components/PhotoUpload.jsx — drag & drop (or click-to-browse) photo uploader.
// Purely a widget: validates files client-side, shows a preview + progress
// bar per file, and delegates the actual network call to `onUpload`. Caller
// decides what "upload" means (which endpoint, single vs. multi-file).

import { useRef, useState } from 'react';
import { toAssetUrl } from '../services/api.js';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB — keep in sync with backend utils/upload.js
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

let nextId = 0;

const validateFile = (file) => {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ACCEPTED_TYPES.includes(file.type) || !ACCEPTED_EXTENSIONS.includes(ext)) {
    return 'Please upload a JPG or PNG image.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'Image must be smaller than 5MB.';
  }
  return null;
};

/**
 * @param {string} [label]
 * @param {boolean} [multiple] - allow selecting/uploading more than one file at once
 * @param {string} [currentPhotoUrl] - shown as the preview until a new file is chosen (single mode)
 * @param {(file: File, onProgress: (pct: number) => void) => Promise<any>} onUpload
 * @param {() => void} [onUploaded] - called once after each file finishes uploading successfully
 */
function PhotoUpload({ label, multiple = false, currentPhotoUrl, onUpload, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState([]); // [{ id, file, previewUrl, progress, status: 'uploading'|'done'|'error', error }]
  const inputRef = useRef(null);

  const uploadOne = (item) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i)));

    onUpload(item.file, (pct) => {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, progress: pct } : i)));
    })
      .then(() => {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'done', progress: 100 } : i)));
        onUploaded?.();
      })
      .catch((err) => {
        const message = err.response?.data?.message || 'Upload failed. Please try again.';
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: message } : i)));
      });
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []).slice(0, multiple ? undefined : 1);
    if (!files.length) return;

    const newItems = files.map((file) => {
      const error = validateFile(file);
      return {
        id: nextId++,
        file,
        previewUrl: URL.createObjectURL(file),
        status: error ? 'error' : 'uploading',
        progress: 0,
        error,
      };
    });

    setItems((prev) => (multiple ? [...prev, ...newItems] : newItems));
    newItems.filter((i) => !i.error).forEach(uploadOne);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const dismiss = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const singlePreview = !multiple && items[0]?.status !== 'error' ? items[0]?.previewUrl : null;

  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-zinc-300">{label}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? 'border-accent bg-accent/5' : 'border-zinc-700 hover:border-zinc-600'
        }`}
      >
        {!multiple &&
          (singlePreview || currentPhotoUrl ? (
            <img src={singlePreview || toAssetUrl(currentPhotoUrl)} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
              No photo
            </div>
          ))}
        <p className="text-sm text-zinc-400">
          Drag &amp; drop {multiple ? 'images' : 'an image'}, or click to browse
        </p>
        <p className="text-xs text-zinc-600">JPG or PNG, up to 5MB{multiple ? ' each' : ''}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
              <img src={item.previewUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-zinc-400">{item.file.name}</p>
                {item.status === 'uploading' && (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full bg-accent transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
                {item.status === 'done' && <p className="text-xs text-green-400">Uploaded</p>}
                {item.status === 'error' && <p className="text-xs text-red-400">{item.error}</p>}
              </div>
              {item.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className="shrink-0 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Dismiss
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PhotoUpload;
