'use client';
import { useState } from 'react';
import API from '../../utils/api';

export default function CreatePost() {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/posts', { content });
      alert('Post created!');
    } catch (error) {
      alert('Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit">Post</button>
    </form>
  );
}
