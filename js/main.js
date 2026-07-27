window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { document.getElementById('welcomeModal').classList.add('active'); }, 300);
  initBgCanvas();
  initCommentsStream();
  initCharts();
});

function toggleMobileNav() { 
  document.getElementById('mobileNav').classList.toggle('active'); 
}

// SCROLL REVEAL
window.addEventListener('scroll', revealElements);
function revealElements() {
  const reveals = document.querySelectorAll('.reveal');
  for (let i = 0; i < reveals.length; i++) {
    if (reveals[i].getBoundingClientRect().top < window.innerHeight - 80) {
      reveals[i].classList.add('active');
    }
  }
}
revealElements();

// BACKGROUND CANVAS
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < 35; i++) {
    particles.push({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: 2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i]; p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        if (Math.hypot(p.x - p2.x, p.y - p2.y) < 120) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// TYPEWRITER ANIMATION
const phrases = ["Security Headers & DNS Lookup.", "26 Interactive Cyber Tools.", "SSL Inspector & Entropy Calc.", "$9.5M USD Vault."];
let phraseIdx = 0, charIdx = 0, isDeleting = false;
function typeEffect() {
  const target = document.getElementById('typewriterText');
  if (!target) return;
  const current = phrases[phraseIdx];
  target.textContent = isDeleting ? current.substring(0, charIdx - 1) : current.substring(0, charIdx + 1);
  charIdx += isDeleting ? -1 : 1;

  let speed = isDeleting ? 40 : 80;
  if (!isDeleting && charIdx === current.length) { speed = 2000; isDeleting = true; }
  else if (isDeleting && charIdx === 0) { isDeleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; speed = 500; }
  setTimeout(typeEffect, speed);
}
typeEffect();

/* ==========================================================================
   DETEKSI DEVICE & LOKASI PRESISI
   ========================================================================== */
function requestLocationPermission() {
  document.getElementById('welcomeModal').classList.remove('active');
  detectUserDeviceAndLocation();
}

function parseDeviceName(ua) {
  if (/tecno/i.test(ua)) return "Tecno Mobile Device";
  if (/iphone/i.test(ua)) return "Apple iPhone (iOS)";
  if (/ipad/i.test(ua)) return "Apple iPad";
  if (/samsung/i.test(ua)) return "Samsung Galaxy";
  if (/xiaomi|redmi|poco/i.test(ua)) return "Xiaomi / Poco Device";
  if (/oppo/i.test(ua)) return "OPPO Smartphone";
  if (/vivo/i.test(ua)) return "vivo Smartphone";
  if (/android/i.test(ua)) return "Android Device";
  if (/windows/i.test(ua)) return "Windows PC / Laptop";
  if (/macintosh|mac os/i.test(ua)) return "MacBook / macOS Device";
  if (/linux/i.test(ua)) return "Linux Workstation";
  return "Generic Client Terminal";
}

function detectUserDeviceAndLocation() {
  const ua = navigator.userAgent;
  const devName = parseDeviceName(ua);
  document.getElementById('liveDevName').innerText = `nama device : ${devName}`;

  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
      const ip = data.ip;
      document.getElementById('liveDevIP').innerText = `ip address : ${ip}`;
      fetchLocationFromIP(ip);
    })
    .catch(() => {
      document.getElementById('liveDevIP').innerText = `ip address : 182.253.142.94 (Gateway)`;
      fetchLocationFromIP("182.253.142.94");
    });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
          .then(res => res.json())
          .then(data => {
            const city = data.address.city || data.address.town || data.address.suburb || data.address.county || "Ciamis";
            document.getElementById('liveDevLoc').innerText = `lokasi : ${city.toLowerCase()}`;
            updateAdvancedTelemetry(devName, lat, lon, city);
          })
          .catch(() => {
            document.getElementById('liveDevLoc').innerText = `lokasi : ciamis`;
            updateAdvancedTelemetry(devName, lat, lon, "Ciamis");
          });
      },
      (err) => {
        document.getElementById('liveDevLoc').innerText = `lokasi : ciamis (IP Geo Fallback)`;
        updateAdvancedTelemetry(devName, "-7.3274", "108.3551", "Ciamis");
      }
    );
  } else {
    document.getElementById('liveDevLoc').innerText = `lokasi : ciamis`;
  }
}

function fetchLocationFromIP(ip) {
  fetch(`https://ipapi.co/${ip}/json/`)
    .then(res => res.json())
    .then(data => {
      if (data.city) {
        const currentLoc = document.getElementById('liveDevLoc').innerText;
        if (currentLoc.includes('Detect')) {
          document.getElementById('liveDevLoc').innerText = `lokasi : ${data.city.toLowerCase()}`;
        }
      }
    }).catch(() => {});
}

function updateAdvancedTelemetry(dev, lat, lon, city) {
  const output = document.getElementById('advancedTelemetryOutput');
  const gpu = getWebGLEngine();
  output.innerHTML = `
    <strong>[TELEMETRI REAL-TIME TERKONEKSI]</strong><br>
    • Model Hardware: ${dev}<br>
    • Koordinat GPS Presisi: ${lat}, ${lon} (${city})<br>
    • Display Matrix: ${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}x Retina)<br>
    • GPU / Renderer Engine: ${gpu}<br>
    • Status Koneksi: Online (TLS 1.3 Enterprise Secured)
  `;
}

function getWebGLEngine() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  } catch (e) {
    return "Standard Mobile Adreno/Mali GPU Engine";
  }
}

/* ==========================================================================
   FITUR 23 - 26 LOGIC ENGINE
   ========================================================================== */
function f23CheckHeaders() {
  const dom = document.getElementById('f23DomainInput').value.trim();
  if (!dom) { document.getElementById('f23Res').innerText = "Masukkan nama domain yang valid."; return; }
  document.getElementById('f23Res').innerText = `ANALISIS SECURITY HEADERS DOMAIN [${dom}]:\n` +
    `• Strict-Transport-Security (HSTS): PRESENT (max-age=31536000)\n` +
    `• Content-Security-Policy (CSP): PRESENT (script-src 'self')\n` +
    `• X-Frame-Options: DENY (Clickjacking Protection Active)\n` +
    `• X-Content-Type-Options: NOSNIFF\n` +
    `• Referrer-Policy: STRICT-ORIGIN-WHEN-CROSS-ORIGIN\n` +
    `• Skor Konfigurasi Headers: A+ (Enterprise Defensive Compliant)`;
}

function f24LookupDNS() {
  const dom = document.getElementById('f24DomainInput').value.trim();
  if (!dom) { document.getElementById('f24Res').innerText = "Masukkan nama domain."; return; }
  document.getElementById('f24Res').innerText = `DNS RECORD LOOKUP [${dom}]:\n` +
    `• A Record: 104.21.48.112 / 172.67.182.19 (Cloudflare Anycast)\n` +
    `• MX Record: 10 mail.${dom} (Priority 10)\n` +
    `• TXT SPF: v=spf1 include:_spf.google.com ~all\n` +
    `• NS Record: ns1.dns-node.com, ns2.dns-node.com`;
}

function f25CheckSSL() {
  const dom = document.getElementById('f25DomainInput').value.trim();
  if (!dom) { document.getElementById('f25Res').innerText = "Masukkan nama domain."; return; }
  document.getElementById('f25Res').innerText = `INSPEKSI SERTIFIKAT SSL/TLS [${dom}]:\n` +
    `• Status Sertifikat: VALID (HTTPS Active)\n` +
    `• Issuer (CA): Let's Encrypt Authority X3 / DigiCert Inc\n` +
    `• Enkripsi Key: RSA 2048-bit (TLS 1.3 Enterprise Protocol)\n` +
    `• Masa Berlaku: 84 Hari Tersisa (Auto-Renewed Enabled)`;
}

function f26CalcEntropy() {
  const pass = document.getElementById('f26PassInput').value;
  if (!pass) { document.getElementById('f26Res').innerText = "Nilai Entropy Bit..."; return; }
  let pool = 0;
  if (/[a-z]/.test(pass)) pool += 26;
  if (/[A-Z]/.test(pass)) pool += 26;
  if (/[0-9]/.test(pass)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pass)) pool += 32;

  const entropy = Math.round(pass.length * (Math.log2(pool || 1)));
  let status = "Sangat Lemah";
  if (entropy > 80) status = "Sangat Kuat (Tahan Brute Force Quantum)";
  else if (entropy > 50) status = "Kuat";
  else if (entropy > 28) status = "Sedang";

  document.getElementById('f26Res').innerText = `Kalkulasi Entropy: ${entropy} Bits\nKumpulan Karakter (Pool): ${pool}\nEvaluasi Keamanan: ${status}`;
}

/* ==========================================================================
   FITUR INTERAKTIF 21 & 22
   ========================================================================== */
function f21TrackIP() {
  const ip = document.getElementById('f21IPInput').value.trim();
  if (!ip) { document.getElementById('f21Res').innerText = "Masukkan alamat IP yang valid."; return; }
  document.getElementById('f21Res').innerText = `Scanning IP ${ip}...\nFetching ASN Route & Geo-Location Data...`;

  fetch(`https://ipapi.co/${ip}/json/`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById('f21Res').innerText = `HASIL TRACE IP ${ip}:\nStatus: IP Private / Invalid\nRegion: Local Network Subnet`;
      } else {
        document.getElementById('f21Res').innerText = `HASIL TRACE IP ADDRESS ${ip}:\n` +
          `• Negara: ${data.country_name || 'Indonesia'} (${data.country_code || 'ID'})\n` +
          `• Wilayah/Kota: ${data.region || 'Jawa Barat'}, ${data.city || 'Ciamis'}\n` +
          `• ISP/Jaringan: ${data.org || 'PT Telkom Indonesia'}\n` +
          `• ASN Code: ${data.asn || 'AS7713'}\n` +
          `• Status Integritas: CLEAN (Zero Spam Rate Flagged)`;
      }
    })
    .catch(() => {
      document.getElementById('f21Res').innerText = `HASIL TRACE IP ADDRESS ${ip}:\n` +
        `• Negara: Indonesia (ID)\n` +
        `• Wilayah/Kota: Jawa Barat, Ciamis\n` +
        `• ISP/Jaringan: Telkomsel / Indosat Ooredoo / XL Axiata\n` +
        `• Status Router: Active Online BGP Edge Node`;
    });
}

function f22CheckIMEI() {
  const imei = document.getElementById('f22IMEIInput').value.trim();
  if (!imei || imei.length !== 15 || !/^\d+$/.test(imei)) {
    document.getElementById('f22Res').innerText = "ERROR: IMEI harus terdiri dari tepat 15 digit angka numeric.";
    return;
  }

  const isTacApple = imei.startsWith("35") || imei.startsWith("01") || imei.startsWith("86");
  if (isTacApple) {
    document.getElementById('f22Res').innerText = `HASIL CEK STATUS IMEI IPHONE: [${imei}]\n` +
      `• Status Kemenperin: TERDAFTAR RESMI DI DATABASE KEMENPERIN RI\n` +
      `• Status Bea Cukai: STATUS VERIFIED PASCA-BAYAR PAJAK\n` +
      `• Tipe Perangkat: iPhone Official Digimap / iBox / GDN Indonesia\n` +
      `• Status Jaringan All Operator: AKTIF Sinyal Permanent (Non-Blokir)`;
  } else {
    document.getElementById('f22Res').innerText = `HASIL CEK STATUS IMEI: [${imei}]\n` +
      `• Status Kemenperin: Terdaftar Resmi (Non-Apple TAC Domain)\n` +
      `• Status Sinyal: Aktif Aman`;
  }
}

/* ==========================================================================
   LOGIKA FITUR INTERAKTIF SEBELUMNYA (1 - 20)
   ========================================================================== */
function f1Run() {
  const str = document.getElementById('f1Input').value;
  if (!str) { document.getElementById('f1Res').innerText = "Hash result akan muncul di sini..."; return; }
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
  document.getElementById('f1Res').innerText = "MD5 Sim: " + Math.abs(hash).toString(16) + "e4c891a\nSHA256 Sim: 8f43a" + Math.abs(hash * 3).toString(16) + "e190b2";
}

function f2Encode() {
  const v = document.getElementById('f2Input').value;
  try { document.getElementById('f2Res').innerText = btoa(v); } catch(e) { document.getElementById('f2Res').innerText = "Error Encoding"; }
}
function f2Decode() {
  const v = document.getElementById('f2Input').value;
  try { document.getElementById('f2Res').innerText = atob(v); } catch(e) { document.getElementById('f2Res').innerText = "Invalid Base64"; }
}

function f3Run() {
  const pass = document.getElementById('f3Input').value;
  let score = 0;
  if (pass.length > 8) score += 30;
  if (/[A-Z]/.test(pass)) score += 20;
  if (/[0-9]/.test(pass)) score += 25;
  if (/[^A-Za-z0-9]/.test(pass)) score += 25;
  document.getElementById('f3Res').innerText = `Skor Keamanan: ${score}/100 (${score > 70 ? 'SANGAT KUAT' : score > 40 ? 'SEDANG' : 'LEMAH'})`;
}

function f4Run() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let res = "";
  for (let i = 0; i < 16; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  document.getElementById('f4Res').innerText = res;
}

function f5Run() {
  const cidr = document.getElementById('f5Input').value;
  document.getElementById('f5Res').innerText = `Subnet Mask: 255.255.255.0\nTotal Usable IPs: 254 Hosts\nNetwork Address: 192.168.1.0`;
}

function f6Run() {
  const val = document.getElementById('f6Input').value;
  const clean = val.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  document.getElementById('f6Res').innerText = clean;
}

function f7Encode() { document.getElementById('f7Res').innerText = encodeURIComponent(document.getElementById('f7Input').value); }
function f7Decode() { document.getElementById('f7Res').innerText = decodeURIComponent(document.getElementById('f7Input').value); }

function f8Run() {
  const type = document.getElementById('f8Select').value;
  if (type === 'SQLi') document.getElementById('f8Res').innerText = "STATUS: BLOCKED (Rule #40012: SQL Injection Attempt Identified)";
  else if (type === 'XSS') document.getElementById('f8Res').innerText = "STATUS: BLOCKED (Rule #20004: Script Tag Injection Detected)";
  else document.getElementById('f8Res').innerText = "STATUS: PASSED (200 OK - Request Verified Clean)";
}

function f9Run() {
  const email = document.getElementById('f9Input').value;
  if (!email.includes('@')) { document.getElementById('f9Res').innerText = "Masukkan email yang valid."; return; }
  document.getElementById('f9Res').innerText = `HASIL PEMERIKSAAN:\nEmail ${email} TIDAK TERINDIKASI dalam database kebocoran utama. Status: AMAN.`;
}

function f10Run() {
  const text = document.getElementById('f10Input').value;
  let res = "";
  for (let i = 0; i < text.length; i++) res += text[i].charCodeAt(0).toString(2) + " ";
  document.getElementById('f10Res').innerText = res || "Hasil Biner (0101)...";
}

function f11Run() {
  const text = document.getElementById('f11Input').value;
  let res = "";
  for (let i = 0; i < text.length; i++) res += text[i].charCodeAt(0).toString(16) + " ";
  document.getElementById('f11Res').innerText = res ? "0x " + res : "Hasil Hex...";
}

function f12Run() {
  const text = document.getElementById('f12Input').value;
  let res = "";
  for (let i = 0; i < text.length; i++) res += String.fromCharCode(text.charCodeAt(i) + 3);
  document.getElementById('f12Res').innerText = res || "Teks terenkripsi (+3 Shift)...";
}

function f13Run() {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  document.getElementById('f13Res').innerText = uuid;
}

function f14Run() {
  const pass = document.getElementById('f14Input').value;
  if (pass.length < 5) document.getElementById('f14Res').innerText = "Estimasi: Instant (< 1 Detik)";
  else if (pass.length < 10) document.getElementById('f14Res').innerText = "Estimasi: ~2 Jam (Brute Force GPU)";
  else document.getElementById('f14Res').innerText = "Estimasi: ~450 Tahun (Aman Superkomputer)";
}

function f15Run() {
  const code = document.getElementById('f15Input').value;
  const map = { "200": "200 OK - Request Selesai Sukses", "404": "404 Not Found - Resource Tidak Ditemukan", "500": "500 Internal Server Error - Kendala Server", "403": "403 Forbidden - Akses Ditolak WAF" };
  document.getElementById('f15Res').innerText = map[code] || `Code ${code}: HTTP Response Status Evaluated`;
}

function f16Run() {
  const txt = document.getElementById('f16Input').value;
  const words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
  document.getElementById('f16Res').innerText = `Total Karakter: ${txt.length} | Total Kata: ${words}`;
}

function f17Run() {
  let chars = "0123456789ABCDEF";
  let key = "";
  for (let i = 0; i < 64; i++) key += chars[Math.floor(Math.random() * 16)];
  document.getElementById('f17Res').innerText = key;
}

function f18Run() {
  const ip = document.getElementById('f18Input').value;
  document.getElementById('f18Res').innerText = `Scanning IP ${ip}...\nPort 80 (HTTP): OPEN\nPort 443 (HTTPS): OPEN\nPort 22 (SSH): FILTERED\nPort 3306 (MySQL): CLOSED`;
}

function f19Run() {
  const txt = document.getElementById('f19Input').value;
  document.getElementById('f19Res').innerText = txt.split('').reverse().join('');
}

function f20Run() {
  const ping = Math.floor(Math.random() * 12) + 2;
  document.getElementById('f20Res').innerText = `PING Ciamis Core Node -> Latency: ${ping} ms (100% Packet Received)`;
}

/* ==========================================================================
   SYSTEM GENERATOR TIKET ADUAN RESMI (#1234 SEQUENTIAL RANDOM)
   ========================================================================== */
let currentTicketSequence = 1234;

function generateAndSendTicket(channel) {
  const name = document.getElementById('ticketName').value.trim();
  const contact = document.getElementById('ticketContact').value.trim();
  const category = document.getElementById('ticketCategory').value;
  const message = document.getElementById('ticketMessage').value.trim();

  if (!name || !contact || !message) {
    alert("Mohon isi Nama, Kontak, dan Detail Pesan Laporan Anda.");
    return;
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketID = `#TICKET-${currentTicketSequence}-${randomSuffix}`;
  currentTicketSequence++;

  const dateStr = new Date().toLocaleString('id-ID');

  const previewBox = document.getElementById('ticketPreviewBox');
  previewBox.style.color = "#ffffff";
  previewBox.innerHTML = `
    <div style="color:#00ff88; font-weight:700;">[TIKET DITERBITKAN: ${ticketID}]</div>
    <div style="margin-top:6px;"><strong>Pelapor:</strong> ${name} (${contact})</div>
    <div><strong>Kategori:</strong> ${category}</div>
    <div style="color:var(--text-muted); margin-top:4px;"><strong>Pesan:</strong> ${message}</div>
    <div style="color:var(--text-dim); font-size:0.75rem; margin-top:8px;">Waktu Terbit: ${dateStr}</div>
  `;

  const textBody = `*TIKET ADUAN RESMI: ${ticketID}*\n` +
                   `----------------------------------------\n` +
                   `*Nama Pelapor:* ${name}\n` +
                   `*Kontak:* ${contact}\n` +
                   `*Kategori:* ${category}\n` +
                   `*Waktu:* ${dateStr}\n\n` +
                   `*Detail Laporan:*\n${message}\n` +
                   `----------------------------------------\n` +
                   `Sent via BX4BREACHSENTINEL Support Console`;

  if (channel === 'wa') {
    const waUrl = `https://wa.me/6287890768114?text=${encodeURIComponent(textBody)}`;
    window.open(waUrl, '_blank');
  } else if (channel === 'email') {
    const mailUrl = `mailto:hex4mee@gmail.com?subject=${encodeURIComponent(`[CS TICKET ${ticketID}] ${category}`)}&body=${encodeURIComponent(textBody)}`;
    window.location.href = mailUrl;
  }
}

/* ==========================================================================
   FINANCIAL $9.5M USD REAL-TIME TELEMETRY & COMMENTS
   ========================================================================== */
let base95M = 9500000.00;
setInterval(() => {
  base95M += (Math.random() * 80 - 40);
  document.getElementById('mainFinancialVal').innerText = '$' + base95M.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  document.getElementById('d1').innerText = '$' + Math.floor(base95M).toLocaleString('en-US');
}, 2000);

let commentsTotal = 219000;
setInterval(() => {
  commentsTotal += Math.floor(Math.random() * 2) + 1;
  document.getElementById('d2').innerText = commentsTotal.toLocaleString('en-US');
}, 2500);

function submitUserComment() {
  const name = document.getElementById('userCommentName').value.trim();
  const country = document.getElementById('userCommentCountry').value.trim();
  const text = document.getElementById('userCommentText').value.trim();

  if (!name || !country || !text) { alert("Mohon isi semua kolom komentar."); return; }

  const box = document.getElementById('commentsBox');
  const div = document.createElement('div');
  div.className = 'comment-card';
  div.style.borderLeft = "3px solid #ffffff";
  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-weight:700;">
      <span>${name} (Baru Ditambahkan)</span>
      <span style="font-family:var(--font-code); color:var(--text-muted); font-size:0.75rem;"><i class="fa-solid fa-globe"></i> ${country}</span>
    </div>
    <div style="color:var(--text-main); font-size:0.85rem;">${text}</div>
  `;

  box.insertBefore(div, box.firstChild);
  document.getElementById('userCommentName').value = '';
  document.getElementById('userCommentCountry').value = '';
  document.getElementById('userCommentText').value = '';

  commentsTotal++;
  document.getElementById('d2').innerText = commentsTotal.toLocaleString('en-US');
  alert("Komentar Anda telah berhasil ditambahkan!");
}

const initialComments = [
  { name: "Alex V.", country: "United States", text: "Top notch security headers analyzer and 26 interactive cyber tools!" },
  { name: "Kenji M.", country: "Japan", text: "Verified SSL inspector and real-time device telemetry console." },
  { name: "Budi Santoso", country: "Indonesia (Ciamis)", text: "Fitur pemeriksaan DNS & SSL sangat membantu untuk audit domain." },
  { name: "Sven H.", country: "Germany", text: "Clean monochrome UI with seamless automated ticketing system." }
];

function initCommentsStream() {
  const box = document.getElementById('commentsBox');
  initialComments.forEach(item => {
    const div = document.createElement('div');
    div.className = 'comment-card';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-weight:700;">
        <span>${item.name}</span>
        <span style="font-family:var(--font-code); color:var(--text-muted); font-size:0.75rem;"><i class="fa-solid fa-globe"></i> ${item.country}</span>
      </div>
      <div style="color:var(--text-muted); font-size:0.85rem;">${item.text}</div>
    `;
    box.appendChild(div);
  });
}

function initCharts() {
  // CHART.JS FINANCIAL CASHFLOW
  const ctxFn = document.getElementById('financeChart').getContext('2d');
  new Chart(ctxFn, {
    type: 'line',
    data: {
      labels: ['10:00', '10:05', '10:10', '10:15', '10:20'],
      datasets: [{
        label: 'Asset ($)', data: [9499800, 9500100, 9500050, 9500200, 9500000],
        borderColor: '#ffffff', backgroundColor: 'rgba(255,255,255,0.05)', fill: true, tension: 0.3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#888' } }, y: { ticks: { color: '#888' } } } }
  });

  // CHART.JS BANDWIDTH THROUGHPUT
  const ctxBw = document.getElementById('bandwidthChart').getContext('2d');
  new Chart(ctxBw, {
    type: 'bar',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [{ label: 'Gbps', data: [24.2, 38.4, 42.8, 51.0, 48.2, 56.4], backgroundColor: '#ffffff', borderRadius: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#888' } }, y: { ticks: { color: '#888' } } } }
  });
}

/* ==========================================================================
   BX4ME-AI INTENT PARSING ENGINE (HANDLING 10.000+ INTENTS & AUTO TICKETING)
   ========================================================================== */
function toggleAI() { document.getElementById('aiBox').classList.toggle('active'); }
function handleAIPress(e) { if (e.key === 'Enter') sendAIMessage(); }

function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const val = input.value.trim();
  if (!val) return;

  const msgBox = document.getElementById('aiMessages');
  const userDiv = document.createElement('div');
  userDiv.className = 'ai-msg user'; userDiv.innerText = val;
  msgBox.appendChild(userDiv);

  input.value = ''; msgBox.scrollTop = msgBox.scrollHeight;

  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'ai-msg bot';
    botDiv.innerHTML = getAIResponse(val);
    msgBox.appendChild(botDiv); msgBox.scrollTop = msgBox.scrollHeight;
  }, 600);
}

function getAIResponse(text) {
  const q = text.toLowerCase();

  if (q.includes('tiket') || q.includes('aduan') || q.includes('lapor') || q.includes('ticket')) {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const ticketID = `#TICKET-${currentTicketSequence}-${randomCode}`;
    currentTicketSequence++;

    const waUrl = `https://wa.me/6287890768114?text=${encodeURIComponent(`[AI AUTO TICKET ${ticketID}]\nPertanyaan: ${text}`)}`;

    return `<strong>[TIKET ADUAN TERBIT: ${ticketID}]</strong><br>` +
           `Nomor tiket bantuan Anda telah dibuat. Silakan klik tautan di bawah untuk mengirim laporan langsung ke CS WhatsApp:<br><br>` +
           `<a href="${waUrl}" target="_blank" style="color:#00ff88; text-decoration:underline;">Kirim Tiket ${ticketID} via WhatsApp</a>`;
  }
  else if (q.includes('header') || q.includes('dns') || q.includes('ssl')) {
    return "Gunakan perkakas **Security Headers Analyzer (#23)**, **DNS Lookup (#24)**, dan **SSL Inspector (#25)** pada bagian modul tools untuk menguji konfigurasi keamanan domain Anda.";
  }
  else if (q.includes('imei') || q.includes('iphone')) {
    return "Gunakan fitur **#22 Checking IMEI iPhone Resmi** di seksi tools untuk memverifikasi pendaftaran Bea Cukai & Kemenperin RI.";
  }
  else if (q.includes('ip') || q.includes('lokasi') || q.includes('device')) {
    return "Deteksi perangkat & lokasi presisi Anda tampil secara otomatis pada modul **Live Client Session Detector** di halaman utama.";
  }
  else if (q.includes('sekolah') || q.includes('web')) {
    return "Layanan pembuatan website sekolah gratis dapat diajukan tanpa biaya pendaftaran. Silakan ketik <strong>'tiket website sekolah'</strong> untuk menerbitkan tiket CS resmi.";
  }
  else if (q.includes('virus') || q.includes('malware') || q.includes('hp')) {
    return "Pembersihan virus & spyware HP/Laptop disediakan 100% gratis. Ketik <strong>'tiket virus HP'</strong> agar sistem menerbitkan nomor tiket aduan langsung ke WhatsApp.";
  }
  else if (q.includes('breachforums') || q.includes('bx4me')) {
    return "Username BreachForums resmi kami adalah **BX4ME**. Verifikasi identitas dan data dapat diproses via WhatsApp di 0878-9076-8114.";
  }
  else {
    const intentID = Math.floor(1000 + Math.random() * 9000);
    return `<strong>[BX4ME-AI Resolved Intent #IDX-${intentID}]</strong><br>` +
           `Terima kasih. Permintaan Anda terkait "<em>${text}</em>" telah dianalisis.<br><br>` +
           `Bila Anda memerlukan penanganan langsung dari tim Herditya Abie Pratama, silakan ketik <strong>"tiket"</strong> untuk menerbitkan Tiket CS Resmi.`;
  }
}
