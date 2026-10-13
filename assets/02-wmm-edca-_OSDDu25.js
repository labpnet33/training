var e={id:`wmm-edca`,h:{en:`WMM, EDCA and the four access categories`,hi:`WMM, EDCA aur chaar access categories`},body:{en:`
<p>Picture a meeting where only one person may speak at a time. Before talking, you must wait for silence and then a short random pause, so two people do not start together. If every person waits the same pause, a manager with an urgent warning waits as long as someone telling a joke. Wi-Fi QoS gives urgent speakers a <b>shorter pause</b>. They do not get a reserved microphone, they just win the floor more often.</p>

<h3>Why Wi-Fi needs its own QoS</h3>
<p>A wired switch port is full duplex and the switch decides what to send next. Wi-Fi is <b>half duplex and shared</b>: the AP and every client contend for the same channel using <b>CSMA/CA</b> (listen first, wait, then transmit). The AP cannot schedule what clients send. So wireless QoS cannot be a strict scheduler. It changes the <b>contention rules</b> per traffic type.</p>

<h3>802.11e, WMM and EDCA</h3>
<p><b>802.11e</b> is the IEEE amendment that added QoS. The Wi-Fi Alliance certifies a practical subset called <b>WMM</b> (Wi-Fi Multimedia). WMM uses <b>EDCA</b> (Enhanced Distributed Channel Access): four queues called <b>access categories (AC)</b>, each with its own contention numbers.</p>
<dl class="terms">
<dt>AIFSN</dt><dd>Arbitration inter-frame space number: the fixed wait after the channel goes idle. Voice and video wait the least.</dd>
<dt>CWmin and CWmax</dt><dd>The contention window: the random backoff is drawn from this range. A smaller window means a shorter average wait.</dd>
<dt>TXOP</dt><dd>Transmit opportunity: how long a station may keep sending after it wins. Video and voice get a TXOP, best effort and background send one frame.</dd>
<dt>User Priority (UP)</dt><dd>A 3-bit value 0 to 7 in the QoS Control field of every WMM frame. It selects the AC.</dd>
</dl>

<table class="cmp"><tr><th>Access category</th><th>User priority</th><th>Traffic</th><th>Typical EDCA (OFDM client)</th></tr>
<tr><td>AC_VO voice</td><td>7, 6</td><td>voice</td><td>AIFSN 2, CW 3 to 7, TXOP 1.504 ms</td></tr>
<tr><td>AC_VI video</td><td>5, 4</td><td>video</td><td>AIFSN 2, CW 7 to 15, TXOP 3.008 ms</td></tr>
<tr><td>AC_BE best effort</td><td>0, 3</td><td>normal data</td><td>AIFSN 3, CW 15 to 1023</td></tr>
<tr><td>AC_BK background</td><td>2, 1</td><td>bulk, scavenger</td><td>AIFSN 7, CW 15 to 1023</td></tr></table>
<p>The numbers are the usual defaults; they are <b>concept only</b> here because the lab model does not simulate contention, only which AC a frame lands in. Notice that UP 0 and UP 3 are both best effort and that UP 1 and 2 are <i>below</i> best effort.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Four access categories">
<rect x="20" y="20" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">AC_VO  UP 7, 6</text>
<rect x="20" y="70" width="130" height="40" rx="8" fill="#bae6fd"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">AC_VI  UP 5, 4</text>
<rect x="20" y="120" width="130" height="40" rx="8" fill="#fde68a"/><text x="85" y="145" text-anchor="middle" class="svg-ink" font-size="13">AC_BE  UP 0, 3</text>
<rect x="20" y="170" width="130" height="34" rx="8" fill="#e2e8f0"/><text x="85" y="192" text-anchor="middle" class="svg-ink" font-size="13">AC_BK  UP 2, 1</text>
<line x1="150" y1="40" x2="300" y2="40" stroke="#64748b" stroke-width="2"/><line x1="150" y1="90" x2="300" y2="90" stroke="#64748b" stroke-width="2"/><line x1="150" y1="140" x2="300" y2="140" stroke="#64748b" stroke-width="2"/><line x1="150" y1="187" x2="300" y2="187" stroke="#64748b" stroke-width="2"/>
<rect x="300" y="20" width="110" height="184" rx="10" fill="#ddd6fe"/><text x="355" y="105" text-anchor="middle" class="svg-ink" font-size="13">one radio</text><text x="355" y="123" text-anchor="middle" class="svg-muted" font-size="12">internal contest</text>
<text x="500" y="45" class="svg-accent" font-size="12">shortest wait</text><text x="500" y="145" class="svg-muted" font-size="12">normal wait</text><text x="500" y="192" class="svg-muted" font-size="12">longest wait</text>
</svg><p class="cap">Four queues inside each station, one radio: the queue with the smallest wait wins most often.</p></div>

<h3>WMM mode on the WLAN</h3>
<p>The WLAN decides how the controller treats WMM. In the lab the command is under the WLAN, and the WLAN must be shut while it changes:</p>
<pre class="code"><span class="c">! WLAN must be shut before the edit</span>
wlan NK-VOICE
 shutdown
 wmm require
 no shutdown</pre>
<table class="cmp"><tr><th>Mode</th><th>What happens</th></tr>
<tr><td><code>wmm allowed</code> (default)</td><td>WMM clients get QoS, non-WMM clients still join.</td></tr>
<tr><td><code>wmm require</code></td><td>A client without WMM is <b>refused</b> at association.</td></tr>
<tr><td><code>wmm disabled</code></td><td>QoS is off: everything is best effort. A client that <b>needs</b> WMM (802.11n, ac, ax) is refused.</td></tr></table>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>, open the WLAN, <b>Advanced</b> tab, <b>WMM Policy</b>. The shortcut <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b> has a WMM tab that shuts the WLAN, changes the mode and enables it again for you.</p>

<pre class="out">WLC1# show wlan name NK-VOICE
WLAN Profile Name     : NK-VOICE
Status                : Enabled
  <span class="hl">WMM Policy                      : Required</span></pre>

<div class="eg"><p><b>Worked example.</b> A 2.4 GHz-only barcode scanner has no WMM. On NK-STAFF (<code>wmm allowed</code>) it joins and uses best effort. If someone sets <code>wmm require</code> on NK-STAFF, the scanner is rejected with the log line that the WLAN requires WMM. On a voice-only WLAN <code>require</code> is a good choice: a phone that cannot do WMM would give poor calls anyway.</p></div>

<div class="warn"><p><b>Common mistakes:</b> forgetting to shut the WLAN before <code>wmm</code> (the edit is refused), and setting <code>wmm disabled</code> as a "fix" for an old device: a modern 11n/ac/ax client then cannot join at all, and voice loses its priority.</p></div>
<div class="exam"><p><b>Exam trap:</b> WMM is mandatory for 802.11n and later rates. WMM is about the <b>air</b> (UP and AC). DSCP is about the <b>IP header</b>. They are different fields linked by a mapping (chapter 3).</p></div>

<div class="scn"><h4>The "tidy-up" that broke voice</h4><p>After a cleanup, handsets on NK-VOICE sound choppy at busy times. The engineer reads <code>show wlan name NK-VOICE</code> and sees WMM Policy: Disabled. Phones are associated, but all frames use AC_BE. The fix: shut the WLAN, set <code>wmm require</code>, enable it again, then reconnect the phone.</p><p><b>Lesson:</b> a client can be associated and still be unprioritised. Always check the WMM line.</p></div>

<div class="iv"><p class="q">"What are the four access categories and how do they get priority?"</p><p>AC_VO, AC_VI, AC_BE, AC_BK, selected by the 3-bit UP. Each has its own AIFSN, contention window and TXOP, so voice waits less. Add that it is statistical, not guaranteed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WMM is the certified form of 802.11e; EDCA gives four access categories.</li>
<li>UP 7,6 = voice; 5,4 = video; 0,3 = best effort; 2,1 = background.</li>
<li>Priority is statistical: shorter AIFSN and contention window, not a reservation.</li>
<li>wmm allowed, require, disabled; the WLAN must be shut to change it.</li>
<li>EDCA timing is concept only in the lab; the AC choice is traced.</li>
</ul></div>
`,hi:`
<p>Ek meeting socho jahan ek time par sirf ek insaan bol sakta hai. Bolne se pehle khamoshi ka wait aur phir ek chhota random pause karna padta hai, taaki do log saath na shuru hon. Agar sab ka pause barabar ho, to urgent warning wale manager ko utna hi wait karna padta hai jitna joke sunane wale ko. Wi-Fi QoS urgent speakers ko <b>chhota pause</b> deta hai. Unhe reserved microphone nahi milta, bas woh floor zyada baar jeette hain.</p>

<h3>Wi-Fi ko apna QoS kyun chahiye</h3>
<p>Wired switch port full duplex hota hai aur switch decide karta hai ki agla kya bheje. Wi-Fi <b>half duplex aur shared</b> hai: AP aur har client <b>CSMA/CA</b> (pehle suno, wait karo, phir transmit karo) se same channel ke liye contend karte hain. AP yeh schedule nahi kar sakta ki clients kya bhejenge. Isliye wireless QoS strict scheduler nahi ho sakta. Woh traffic type ke hisaab se <b>contention rules</b> badalta hai.</p>

<h3>802.11e, WMM aur EDCA</h3>
<p><b>802.11e</b> woh IEEE amendment hai jisne QoS joda. Wi-Fi Alliance uska ek practical subset certify karta hai jise <b>WMM</b> (Wi-Fi Multimedia) kehte hain. WMM <b>EDCA</b> (Enhanced Distributed Channel Access) use karta hai: chaar queues jinhe <b>access categories (AC)</b> kehte hain, har ek ke apne contention numbers.</p>
<dl class="terms">
<dt>AIFSN</dt><dd>Arbitration inter-frame space number: channel idle hone ke baad fixed wait. Voice aur video sabse kam wait karte hain.</dd>
<dt>CWmin aur CWmax</dt><dd>Contention window: random backoff isi range se nikalta hai. Chhoti window ka matlab chhota average wait.</dd>
<dt>TXOP</dt><dd>Transmit opportunity: jeetne ke baad station kitni der bhejta rehta hai. Video aur voice ko TXOP milta hai, best effort aur background ek frame bhejte hain.</dd>
<dt>User Priority (UP)</dt><dd>Har WMM frame ke QoS Control field mein 3-bit value 0 se 7. Yeh AC chunti hai.</dd>
</dl>

<table class="cmp"><tr><th>Access category</th><th>User priority</th><th>Traffic</th><th>Typical EDCA (OFDM client)</th></tr>
<tr><td>AC_VO voice</td><td>7, 6</td><td>voice</td><td>AIFSN 2, CW 3 se 7, TXOP 1.504 ms</td></tr>
<tr><td>AC_VI video</td><td>5, 4</td><td>video</td><td>AIFSN 2, CW 7 se 15, TXOP 3.008 ms</td></tr>
<tr><td>AC_BE best effort</td><td>0, 3</td><td>normal data</td><td>AIFSN 3, CW 15 se 1023</td></tr>
<tr><td>AC_BK background</td><td>2, 1</td><td>bulk, scavenger</td><td>AIFSN 7, CW 15 se 1023</td></tr></table>
<p>Yeh numbers usual defaults hain; yahan yeh <b>concept only</b> hain kyunki lab model contention simulate nahi karta, sirf yeh dikhata hai ki frame kaun si AC mein jaata hai. Dhyan do: UP 0 aur UP 3 dono best effort hain aur UP 1, 2 best effort se <i>neeche</i> hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Chaar access categories">
<rect x="20" y="20" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">AC_VO  UP 7, 6</text>
<rect x="20" y="70" width="130" height="40" rx="8" fill="#bae6fd"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">AC_VI  UP 5, 4</text>
<rect x="20" y="120" width="130" height="40" rx="8" fill="#fde68a"/><text x="85" y="145" text-anchor="middle" class="svg-ink" font-size="13">AC_BE  UP 0, 3</text>
<rect x="20" y="170" width="130" height="34" rx="8" fill="#e2e8f0"/><text x="85" y="192" text-anchor="middle" class="svg-ink" font-size="13">AC_BK  UP 2, 1</text>
<line x1="150" y1="40" x2="300" y2="40" stroke="#64748b" stroke-width="2"/><line x1="150" y1="90" x2="300" y2="90" stroke="#64748b" stroke-width="2"/><line x1="150" y1="140" x2="300" y2="140" stroke="#64748b" stroke-width="2"/><line x1="150" y1="187" x2="300" y2="187" stroke="#64748b" stroke-width="2"/>
<rect x="300" y="20" width="110" height="184" rx="10" fill="#ddd6fe"/><text x="355" y="105" text-anchor="middle" class="svg-ink" font-size="13">ek radio</text><text x="355" y="123" text-anchor="middle" class="svg-muted" font-size="12">andar ka muqabla</text>
<text x="500" y="45" class="svg-accent" font-size="12">sabse chhota wait</text><text x="500" y="145" class="svg-muted" font-size="12">normal wait</text><text x="500" y="192" class="svg-muted" font-size="12">sabse lamba wait</text>
</svg><p class="cap">Har station ke andar chaar queues, ek radio: sabse chhote wait wali queue sabse zyada jeetti hai.</p></div>

<h3>WLAN par WMM mode</h3>
<p>WLAN decide karta hai ki controller WMM ko kaise treat kare. Lab mein command WLAN ke andar hai, aur badalte waqt WLAN shut hona chahiye:</p>
<pre class="code"><span class="c">! edit se pehle WLAN shut hona chahiye</span>
wlan NK-VOICE
 shutdown
 wmm require
 no shutdown</pre>
<table class="cmp"><tr><th>Mode</th><th>Kya hota hai</th></tr>
<tr><td><code>wmm allowed</code> (default)</td><td>WMM clients ko QoS milta hai, non-WMM clients bhi join karte hain.</td></tr>
<tr><td><code>wmm require</code></td><td>WMM ke bina client association par <b>refuse</b> hota hai.</td></tr>
<tr><td><code>wmm disabled</code></td><td>QoS band: sab best effort. Jis client ko WMM <b>chahiye</b> (802.11n, ac, ax) woh refuse hota hai.</td></tr></table>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>, WLAN kholo, <b>Advanced</b> tab, <b>WMM Policy</b>. Shortcut <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b> mein WMM tab hai jo WLAN shut karta hai, mode badalta hai aur phir enable kar deta hai.</p>

<pre class="out">WLC1# show wlan name NK-VOICE
WLAN Profile Name     : NK-VOICE
Status                : Enabled
  <span class="hl">WMM Policy                      : Required</span></pre>

<div class="eg"><p><b>Worked example.</b> Sirf 2.4 GHz wala barcode scanner WMM nahi karta. NK-STAFF (<code>wmm allowed</code>) par woh join karta hai aur best effort use karta hai. Agar koi NK-STAFF par <code>wmm require</code> lagaye, to scanner reject ho jaata hai aur log mein likha aata hai ki WLAN ko WMM chahiye. Sirf voice WLAN par <code>require</code> achha choice hai: jo phone WMM nahi karta woh waise bhi kharab calls dega.</p></div>

<div class="warn"><p><b>Common mistakes:</b> <code>wmm</code> se pehle WLAN shut karna bhoolna (edit refuse hota hai), aur purane device ke "fix" ke liye <code>wmm disabled</code> lagana: modern 11n/ac/ax client tab join hi nahi kar sakta, aur voice ki priority chali jaati hai.</p></div>
<div class="exam"><p><b>Exam trap:</b> WMM 802.11n aur usse upar ke rates ke liye mandatory hai. WMM <b>air</b> (UP aur AC) ke baare mein hai. DSCP <b>IP header</b> ke baare mein hai. Yeh alag fields hain jo mapping se jude hain (chapter 3).</p></div>

<div class="scn"><h4>"Tidy-up" jisne voice tod di</h4><p>Cleanup ke baad NK-VOICE ke handsets busy time par choppy lagte hain. Engineer <code>show wlan name NK-VOICE</code> padhta hai aur WMM Policy: Disabled dekhta hai. Phones associated hain, lekin sab frames AC_BE use karte hain. Fix: WLAN shut karo, <code>wmm require</code> lagao, phir enable karo, aur phone reconnect karo.</p><p><b>Lesson:</b> client associated hokar bhi unprioritised ho sakta hai. WMM line hamesha check karo.</p></div>

<div class="iv"><p class="q">"Chaar access categories kaun si hain aur unhe priority kaise milti hai?"</p><p>AC_VO, AC_VI, AC_BE, AC_BK, jo 3-bit UP se chuni jaati hain. Har ek ke apne AIFSN, contention window aur TXOP hain, isliye voice kam wait karta hai. Jodo ki yeh statistical hai, guaranteed nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WMM 802.11e ka certified roop hai; EDCA chaar access categories deta hai.</li>
<li>UP 7,6 = voice; 5,4 = video; 0,3 = best effort; 2,1 = background.</li>
<li>Priority statistical hai: chhota AIFSN aur contention window, reservation nahi.</li>
<li>wmm allowed, require, disabled; badalne ke liye WLAN shut hona chahiye.</li>
<li>EDCA timing lab mein concept only hai; AC ka choice trace hota hai.</li>
</ul></div>
`}};export{e as default};