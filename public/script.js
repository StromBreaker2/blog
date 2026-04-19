document.addEventListener('DOMContentLoaded', () => {
  const postForm = document.getElementById('post-form');
  const titleInput = document.getElementById('title');
  const contentInput = document.getElementById('content');
  const postsContainer = document.getElementById('posts-container');
  const postCount = document.getElementById('post-count');
  const submitBtn = document.getElementById('submit-btn');

  // Load posts on startup
  fetchPosts();

  // Handle form submission
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) return;

    setLoading(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) throw new Error('Failed to create post');

      // Clear form
      titleInput.value = '';
      contentInput.value = '';
      
      // Reload posts
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Could not create post. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Publishing...';
    } else {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Publish Post';
    }
  }

  async function fetchPosts() {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const posts = await response.json();
      renderPosts(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      postsContainer.innerHTML = `
        <div class="empty-state">
          <p>Failed to load posts. Please check if the server is running.</p>
        </div>
      `;
    }
  }

  window.deletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete post');
      
      // Remove from UI immediately for better UX
      const postElement = document.querySelector(`[data-id="${id}"]`);
      if (postElement) {
        postElement.style.opacity = '0';
        setTimeout(() => {
          fetchPosts(); // Refresh list to ensure sync and update count
        }, 300);
      } else {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Could not delete post. Please try again.');
    }
  };

  function renderPosts(posts) {
    postCount.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''}`;

    if (posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <p>No posts yet. Be the first to share something!</p>
        </div>
      `;
      return;
    }

    postsContainer.innerHTML = posts.map(post => {
      // Format date
      const date = new Date(post.created_at);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);

      // Escape HTML to prevent XSS
      const safeTitle = escapeHTML(post.title);
      const safeContent = escapeHTML(post.content);

      return `
        <article class="post-item" data-id="${post.id}">
          <div class="post-header">
            <div>
              <h3 class="post-title">${safeTitle}</h3>
              <time class="post-meta" datetime="${post.created_at}">${formattedDate}</time>
            </div>
            <button class="btn btn-icon" onclick="deletePost(${post.id})" aria-label="Delete post" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
          <div class="post-content">${safeContent}</div>
        </article>
      `;
    }).join('');
  }

  // Utility to prevent XSS
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
