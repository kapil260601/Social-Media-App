'use client';
import { useEffect, useState } from 'react';
import API from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get('/posts');
        setPosts(res.data);
      } catch (error) {
        toast.error('Failed to fetch posts');
      }
    };
    fetchPosts();
  }, []);

  const likePost = async (postId) => {
    try {
      const res = await API.post(`/posts/${postId}/like`);
      toast.success('Post liked!');
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: res.data.likes } : post
        )
      );
    } catch (error) {
      toast.error('Already liked!');
    }
  };

  const handleFollow = async (userId) => {
    try {
      const res = await API.post(`/users/${userId}/follow`);
      console.log(res, 'res');
      toast.success('User followed!');
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.user_id === userId
            ? { ...post, is_following: !post.is_following }
            : post
        )
      );
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.message || 'Something went wrong';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('No response from the server');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Social Feed</h1>
      <div className="w-full max-w-4xl space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                  {post.username[0].toUpperCase()}
                </div>
                <h3 className="text-xl font-semibold">{post.username}</h3>
              </div>
              <span className="text-sm text-gray-500">{post.timestamp}</span>
            </div>
            <p className="text-gray-700 text-base">{post.content}</p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => likePost(post.id)}
                className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 15l7 7 7-7"
                  />
                </svg>
                <span>{post.likes} Like</span>
              </button>
              <button
                onClick={() => handleFollow(post.user_id)}
                className={`flex items-center space-x-2 ${
                  post.is_following ? 'text-red-500' : 'text-blue-500'
                } hover:text-blue-700 focus:outline-none`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
                <span>{post.is_following ? 'Unfollow' : 'Follow'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
}