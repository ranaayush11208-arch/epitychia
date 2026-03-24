// Fade-in animation
const elements = document.querySelectorAll('.fade');

window.addEventListener('scroll', () => {
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      el.classList.add('show');
    }
  });
});

// Fake AI Chat
function fakeChat() {
  const chat = document.getElementById('chat');

  const user = document.createElement('div');
  user.className = "user-msg";
  user.innerText = "What is AI?";

  const ai = document.createElement('div');
  ai.className = "ai-msg";
  ai.innerText = "AI allows machines to simulate human intelligence.";

  chat.appendChild(user);
  chat.appendChild(ai);
  chat.scrollTop = chat.scrollHeight;
}