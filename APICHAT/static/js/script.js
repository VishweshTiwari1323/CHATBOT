document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('chat-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const input = document.getElementById('message');
      if(!input) return;
      const msg = input.value.trim();
      if(!msg) return;
      const win = document.getElementById('chat-window');
      const el = document.createElement('div');
      el.textContent = 'You: ' + msg;
      win.appendChild(el);
      input.value = '';
    });
  }
});
