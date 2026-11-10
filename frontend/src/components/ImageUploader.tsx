import React, { useState } from 'react';
import axios from 'axios';
import { FaUpload } from 'react-icons/fa';

const ImageUploader = ({ value, onChange, label = 'Choose Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await axios.post('/api/courses/upload-thumbnail', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(res.data.data.url);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {preview && (
        <img src={preview} alt="preview"
          style={{ width: '100%', maxHeight: 220, objectFit: 'cover',
                   borderRadius: 12, marginBottom: 8 }} />
      )}
      <label className="icon-btn icon-btn-outline"
        style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
        <FaUpload /> {uploading ? 'Uploading…' : label}
        <input type="file" accept="image/*" hidden
               onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
};

export default ImageUploader;