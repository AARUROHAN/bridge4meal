/* Shared client-side auth + helpers
   - Uses localStorage: b4m_users, b4m_current
   - Functions used by signup/login/index/booking pages
*/

emailjs.init("HWCoTybKtzkaS17Gh"); // keep public key
const EMAIL_SERVICE = "service_4jhdrif";
const EMAIL_TEMPLATE = "template_nhc5g66";

// localStorage helpers
function getUsers(){ return JSON.parse(localStorage.getItem('b4m_users')||'[]'); }
function setUsers(u){ localStorage.setItem('b4m_users', JSON.stringify(u)); }
function setCurrentUser(obj){ localStorage.setItem('b4m_current', JSON.stringify(obj)); }
function getCurrentUser(){ return JSON.parse(localStorage.getItem('b4m_current')||'null'); }
function clearCurrentUser(){ localStorage.removeItem('b4m_current'); }

// Register used by signup page (returns {ok,msg})
function signupPageRegister({name,email,mobile,password}){
  const users = getUsers();
  if(users.find(u=>u.email===email || u.mobile===mobile))
    return {ok:false, msg:'Email or mobile already registered. Please sign in.'};

  users.push({name,email,mobile,password,role:'customer',createdAt:new Date().toISOString()});
  setUsers(users);

  // optional registration email
  emailjs.send(EMAIL_SERVICE, EMAIL_TEMPLATE, {
    subject: 'New Customer Registration',
    message: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\nSigned Up: ${new Date().toLocaleString()}`
  }).catch(()=>{/*silent*/});

  return {ok:true};
}

// Authenticate used by login page
function signinPageAuthenticate(email,password){
  const users = getUsers();
  const u = users.find(x=>x.email===email && x.password===password);
  if(!u) return {ok:false, msg:'Invalid credentials'};
  setCurrentUser({name:u.name, email:u.email, mobile:u.mobile});
  return {ok:true};
}

// Called by index.html "Book Now" buttons
function serviceClickHandler(serviceName){
  const cur = getCurrentUser();
  if(cur){
    // if logged in, go directly to booking page with service param
    window.location.href = `booking.html?service=${encodeURIComponent(serviceName)}`;
  } else {
    // send to signup page with service saved
    window.location.href = `signup.html?service=${encodeURIComponent(serviceName)}`;
  }
}

// WhatsApp Order button
function orderOnWhatsapp(serviceName){
  const number = "+916263112992"; // your number stays
  const msg = `Hi, I want to book: ${serviceName}`;
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, "_blank");
}

// small UI helpers for index (logout button + mobile menu)
document.addEventListener('DOMContentLoaded', function(){
  // mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if(mobileBtn && mobileMenu){
    mobileBtn.addEventListener('click', ()=> mobileMenu.classList.toggle('hidden'));
  }

  // logout & UI
  const cur = getCurrentUser();
  const logoutBtn = document.getElementById('logoutBtn');
  const navSign = document.getElementById('navSign');
  const mobileSign = document.getElementById('mobileSign');

  if(cur){
    if(logoutBtn){ 
      logoutBtn.classList.remove('hidden');
      logoutBtn.addEventListener('click', ()=> { 
        clearCurrentUser(); 
        alert('Logged out'); 
        location.href='index.html'; 
      }); 
    }
    if(navSign){ navSign.textContent = `Hi, ${cur.name}`; navSign.href = 'booking.html'; }
    if(mobileSign){ mobileSign.textContent = `Hi, ${cur.name}`; mobileSign.href = 'booking.html'; }
  } else {
    if(logoutBtn) logoutBtn.classList.add('hidden');
    if(navSign) { navSign.textContent = 'Sign In / Sign Up'; navSign.href = 'login.html'; }
    if(mobileSign) { mobileSign.textContent = 'Sign In / Sign Up'; mobileSign.href = 'login.html'; }
  }
});
