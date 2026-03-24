import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 📌 Referral detection
const urlParams = new URLSearchParams(window.location.search);
const ref = urlParams.get("ref");
if (ref) localStorage.setItem("referralCode", ref);

// 🎯 Generate affiliate code
function generateCode() {
  return "EPY" + Math.floor(10000 + Math.random() * 90000);
}

// ✅ Signup
window.signup = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  await setDoc(doc(db, "users", user.uid), {
    username,
    email,
    points: 0,
    streak: 0,
    rank: "Bronze",
    affiliateCode: generateCode(),
    referredBy: localStorage.getItem("referralCode") || null,
    earnings: 0,
    totalReferrals: 0,
    subscription: {
      active: false,
      expiresAt: null
    },
    createdAt: new Date()
  });

  alert("Signup done");
};

// 🏆 Rank system
const ranks = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 1000 },
  { name: "Gold", min: 5000 },
  { name: "Platinum", min: 15000 },
  { name: "Diamond", min: 30000 },
  { name: "Heroic", min: 50000 },
  { name: "Master", min: 100000 },
  { name: "Elite", min: 150000 },
  { name: "Grandmaster", min: 200000 }
];

function getRank(points) {
  let r = "Bronze";
  ranks.forEach(rank => {
    if (points >= rank.min) r = rank.name;
  });
  return r;
}

// ✅ Complete task
window.completeTask = async () => {
  const user = auth.currentUser;
  const ref = doc(db, "users", user.uid);

  const snap = await getDoc(ref);
  const data = snap.data();

  let points = data.points + 20;

  await updateDoc(ref, {
    points,
    rank: getRank(points)
  });

  alert("+20 points");
};

// 🥇 Leaderboard
window.loadLeaderboard = async () => {
  const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
  const snap = await getDocs(q);

  const list = document.getElementById("leaderboard");
  list.innerHTML = "";

  snap.forEach(doc => {
    const u = doc.data();
    list.innerHTML += `<li>${u.username} - ${u.points}</li>`;
  });
};

// 💳 Payment
window.payNow = async () => {
  const res = await fetch("/create-order", { method: "POST" });
  const data = await res.json();

  const options = {
    key: "YOUR_RAZORPAY_KEY",
    amount: data.amount,
    currency: "INR",
    order_id: data.id,
    handler: async function (response) {
      await fetch("/verify-payment", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(response)
      });

      alert("Payment success");
    }
  };

  new Razorpay(options).open();
};

// 👤 Profile
window.loadProfile = async () => {
  const user = auth.currentUser;
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data();

  document.getElementById("code").innerText = data.affiliateCode;
  document.getElementById("earnings").innerText = "₹" + data.earnings;
  document.getElementById("referrals").innerText = data.totalReferrals;

  document.getElementById("refLink").value =
    `https://yourdomain.com?ref=${data.affiliateCode}`;
};

// 📤 Copy link
window.copyLink = () => {
  const input = document.getElementById("refLink");
  input.select();
  document.execCommand("copy");
  alert("Copied!");
};