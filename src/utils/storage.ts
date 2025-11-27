import type { PlakaPost } from '../types';

const STORAGE_KEY = 'plaka_posts';

export const savePlakaPost = (post: PlakaPost): void => {
  try {
    const existingPosts = getPlakaPosts();
    const updatedPosts = [post, ...existingPosts];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  } catch (error) {
    console.error('Error saving plaka post:', error);
  }
};

export const getPlakaPosts = (): PlakaPost[] => {
  try {
    const posts = localStorage.getItem(STORAGE_KEY);
    if (posts) {
      return JSON.parse(posts).map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting plaka posts:', error);
    return [];
  }
};

export const deletePlakaPost = (id: number): void => {
  try {
    const posts = getPlakaPosts();
    const filteredPosts = posts.filter(post => post.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPosts));
  } catch (error) {
    console.error('Error deleting plaka post:', error);
  }
};
