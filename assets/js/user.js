/* Shows the signed-in user's name in the sidebar. The name is saved to localStorage ("n2q-user") by auth.js at signup/login. */
(function(){
  var u=null;try{u=JSON.parse(localStorage.getItem("n2q-user"))}catch(e){}
  if(!u||!u.name)return;
  document.querySelectorAll(".me b").forEach(function(b){b.textContent=u.name});
})();
