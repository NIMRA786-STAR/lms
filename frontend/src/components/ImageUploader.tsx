import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { FaUpload } from 'react-icons/fa';
import { notify } from '../utils/notify';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ value = '', onChange, label = 'Choose Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await axios.post('/api/courses/upload-thumbnail', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.data.url);
      setPreview(res.data.data.url); 
      notify.success('Image uploaded successfully');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Upload failed';
      notify.error(msg || 'Upload failed');
      setPreview(value);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div>
      {preview && (
        <img src={preview} alt="preview"
          style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 8 }} />
      )}
      <label className="icon-btn icon-btn-outline"
        style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
        <FaUpload /> {uploading ? 'Uploading…' : label}
        <input type="file" accept="image/*" hidden onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
};

export default ImageUploader;