var e={id:`fast-roaming`,h:{en:`Fast roaming: 802.11r, 802.11k, 802.11v and sticky clients`,hi:`Fast roaming: 802.11r, 802.11k, 802.11v aur sticky clients`},body:{en:`
<h3>Why a roam can be slow</h3>
<p>Imagine changing trains with luggage. You step off train A, walk to platform B, show your ticket again, and only then board. If the ticket check takes 3 seconds, you miss your connection. For Wi-Fi the "ticket check" is the security handshake. With WPA2-Enterprise (802.1X), a full authentication to RADIUS can take hundreds of milliseconds, far too long for a voice call, which tolerates about 50 ms of gap. With WPA2-PSK the handshake is shorter (the 4-way handshake only) but still costs time. Fast roaming features remove or shorten that step, and help the client pick the right AP and the right moment.</p>
<div class="note"><p><b>Not simulated in the lab.</b> 802.11r, 802.11k and 802.11v exchanges, PMK caching, OKC and sticky-client behaviour are concepts only. Coming up: module wl-mobility (Mobility and high availability). The lab never sends Fast Transition frames and never lets you "enable 11r". You are expected to know them for the exam and for real deployments.</p></div>

<h3>The three amendments</h3>
<dl class="terms">
<dt>802.11k (radio resource measurement)</dt><dd>Gives the client a <b>neighbour report</b>: a short list of nearby APs and their channels. The client does not need to scan all channels, so it finds the next AP faster and saves battery. Think of it as a station map handed to the traveller.</dd>
<dt>802.11v (BSS transition management)</dt><dd>Lets the AP send a <b>BSS transition request</b>: "AP2 is better for you, please move". The client may accept or ignore it. Also enables features like wireless network management and load balancing hints.</dd>
<dt>802.11r (Fast BSS Transition, FT)</dt><dd>Lets the client and the new AP complete the key handshake in advance or in a single exchange, using a key hierarchy derived from the first full authentication. This avoids going back to RADIUS on each roam. Two methods: <b>over-the-air</b> (client talks directly to the target AP) and <b>over-the-DS</b> (client talks through the current AP).</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Roam steps with and without fast roaming">
<text x="20" y="25" class="svg-ink" font-size="13">Without fast roaming (802.1X)</text>
<rect x="20" y="35" width="90" height="34" rx="6" fill="#bae6fd"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="12">scan</text>
<rect x="115" y="35" width="90" height="34" rx="6" fill="#ddd6fe"/><text x="160" y="57" text-anchor="middle" class="svg-ink" font-size="12">reassoc</text>
<rect x="210" y="35" width="250" height="34" rx="6" fill="#fed7aa"/><text x="335" y="57" text-anchor="middle" class="svg-ink" font-size="12">full 802.1X to RADIUS + 4-way</text>
<rect x="465" y="35" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="510" y="57" text-anchor="middle" class="svg-ink" font-size="12">traffic</text>
<text x="20" y="115" class="svg-ink" font-size="13">With 802.11k + 802.11r</text>
<rect x="20" y="125" width="40" height="34" rx="6" fill="#bae6fd"/><text x="40" y="147" text-anchor="middle" class="svg-ink" font-size="11">k</text>
<rect x="65" y="125" width="140" height="34" rx="6" fill="#ddd6fe"/><text x="135" y="147" text-anchor="middle" class="svg-ink" font-size="12">FT reassoc (keys)</text>
<rect x="210" y="125" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="255" y="147" text-anchor="middle" class="svg-ink" font-size="12">traffic</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">gap shrinks from hundreds of ms to tens of ms</text>
</svg><p class="cap">Fast roaming removes the slow RADIUS round trip and the blind scanning.</p></div>

<h3>Older tools: PMK caching and OKC</h3>
<p>Before 802.11r existed, vendors cached the key material. <b>PMK caching</b> lets a client return to an AP it already visited without a new 802.1X exchange. <b>Opportunistic Key Caching (OKC)</b> lets the controller hand the key to the next AP in advance. OKC is widely supported by older devices but is not standardised, so mixed clients may behave differently. 802.11r is the standard answer.</p>

<h3>Configuration on the 9800 (concept view)</h3>
<p>On a real Catalyst 9800 the fast-transition setting lives in the <b>WLAN profile</b> security section, not in the policy profile. A typical design looks like this (shown for understanding only; the lab model does not accept these lines):</p>
<pre class="code"><span class="c">! real 9800 only, not accepted by the lab model</span>
wlan NK-CORP 2 NK-CORP
 shutdown
 security ft adaptive
 security wpa akm ft dot1x
 no shutdown</pre>
<p>The word <b>adaptive</b> means the WLAN advertises the FT AKM in a way that most modern clients can use while older clients still connect normally. The rule you must remember: security settings of a WLAN can only be changed while the WLAN is shut down, exactly like in the lab. Also remember that enabling FT on an SSID that old clients cannot handle can cause association failures, which is why a pilot with real device types is always done first.</p>

<h3>What the controller can and cannot do</h3>
<table class="cmp"><tr><th>Controller can</th><th>Controller cannot</th></tr>
<tr><td>Advertise neighbours (11k) and send transition hints (11v)</td><td>Force a client to roam; the client driver decides</td></tr>
<tr><td>Cache keys so the next AP skips RADIUS (11r, OKC)</td><td>Fix a coverage hole or a high noise floor</td></tr>
<tr><td>Keep the same policy on every AP via tags</td><td>Make a client keep its IP if the VLAN differs between APs</td></tr></table>
<p>This is the heart of <b>sticky clients</b>. A sticky client stays glued to a far AP with a poor RSSI (for example -80 dBm) when a much better AP (-55 dBm) is nearby. The client thinks the current link is "good enough" because it still gets frames. Symptoms: slow speed, retries, ticket says "Wi-Fi is bad near the stairs" while another phone works fine. Mitigations: sensible AP power (smaller cells, see the RF module), minimum data rates, 11k/11v enabled, and updated client drivers. The most common real reason is simply that the client chooses not to move.</p>

<h3>What you can still verify in the lab</h3>
<p>The lab cannot show you FT frames, but it shows the facts that decide whether a roam can be seamless: which AP serves the client, which VLAN the client is in and which policy tag is on each AP.</p>
<pre class="out">WLC1# show wireless client mac-address 0050.7966.6801 detail

Client MAC Address : 0050.7966.6801
Client IPv4 Address: 10.10.20.55
AP Name            : AP1
WLAN Profile Name  : NK-STAFF
Policy Profile     : PP-STAFF
Policy Tag         : PT-CAMPUS
<span class="hl">VLAN               : 20</span>
Radio / Channel    : 5 GHz / 36
RSSI               : -58 dBm</pre>
<p>If the same client later shows <span class="hl">Policy Profile : PP-STAFF</span> and VLAN 20 on AP2 as well, even the fastest FT roam will keep the address. If it shows a different VLAN, fast roaming only makes the break happen faster.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Expecting 802.11r to fix coverage holes. (2) Turning on strict FT for every SSID and breaking old handhelds. (3) Setting the AP power so high that cells overlap too much and clients never see a reason to move. (4) Forgetting that the WLAN must be disabled before editing security.</p></div>
<div class="exam"><p><b>Exam trap.</b> 11k = neighbour lists, 11v = transition requests, 11r = fast key exchange. Do not swap them. And remember: 11v is a suggestion, not a command.</p></div>

<div class="scn"><h4>Voice dropouts at the stairwell</h4><p>Handsets lose 2 seconds of audio when staff walk through the stairwell. Logs show a full 802.1X every time. The team enables 802.11r (adaptive) after confirming all handset models support it, turns on 11k, and lowers 5 GHz power. Roam gaps drop to tens of milliseconds. One old scanner no longer connects and is moved to a separate SSID.</p><p><b>Lesson:</b> fast roaming helps, but it is a feature rollout with client compatibility testing, not a checkbox.</p></div>

<div class="iv"><p class="q">"A user says Wi-Fi is slow when walking, but the AP next to them is fine. Why?"</p><p>Likely a sticky client holding a distant AP. Check RSSI on the serving AP, check whether 11k/11v are enabled, check AP power and minimum rates, update the client driver, and prove which AP the client actually uses with the client detail view.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.11k gives neighbour lists, 802.11v gives transition hints, 802.11r speeds up the key handshake.</li>
<li>PMK caching and OKC are older shortcuts; OKC is not a standard.</li>
<li>The client decides; the controller assists.</li>
<li>11r/k/v and sticky behaviour are not simulated in the lab.</li>
<li>Fast roaming only helps if the VLAN and policy match on both APs.</li>
</ul></div>
`,hi:`
<h3>Roam slow kyun ho sakta hai</h3>
<p>Socho aap luggage ke saath train badal rahe ho. Train A se utarte ho, platform B tak chalte ho, ticket dobara dikhate ho, tab chadhte ho. Agar ticket check mein 3 second lagen to connection chhoot jaata hai. Wi-Fi mein "ticket check" security handshake hai. WPA2-Enterprise (802.1X) mein RADIUS tak full authentication mein sau-kai milliseconds lag sakte hain, jo voice call ke liye bahut zyada hai, kyunki voice lagbhag 50 ms ka gap sehti hai. WPA2-PSK mein handshake chhota hota hai (sirf 4-way handshake) lekin phir bhi time lagta hai. Fast roaming features us step ko hata dete hain ya chhota kar dete hain, aur client ko sahi AP aur sahi time chunne mein madad karte hain.</p>
<div class="note"><p><b>Not simulated in the lab.</b> 802.11r, 802.11k aur 802.11v exchanges, PMK caching, OKC aur sticky-client behaviour sirf concepts hain. Aage aane wala module: wl-mobility (Mobility and high availability). Lab kabhi Fast Transition frames nahi bhejti aur aap "11r enable" nahi kar sakte. Exam aur real deployments ke liye aapko inhe jaanna zaroori hai.</p></div>

<h3>Teen amendments</h3>
<dl class="terms">
<dt>802.11k (radio resource measurement)</dt><dd>Client ko <b>neighbour report</b> deta hai: paas ke APs aur unke channels ki chhoti list. Client ko saare channels scan nahi karne padte, isliye woh agla AP jaldi dhoondhta hai aur battery bachata hai. Samjho musafir ko station ka map de diya.</dd>
<dt>802.11v (BSS transition management)</dt><dd>AP <b>BSS transition request</b> bhej sakta hai: "AP2 tumhare liye better hai, please move karo". Client accept ya ignore kar sakta hai. Wireless network management aur load balancing hints bhi isse milte hain.</dd>
<dt>802.11r (Fast BSS Transition, FT)</dt><dd>Client aur naya AP key handshake ko pehle se ya ek hi exchange mein complete kar sakte hain, pehli full authentication se nikli key hierarchy use karke. Isse har roam par RADIUS tak wapas nahi jaana padta. Do methods: <b>over-the-air</b> (client seedha target AP se baat karta hai) aur <b>over-the-DS</b> (client current AP ke through baat karta hai).</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Roam steps with and without fast roaming">
<text x="20" y="25" class="svg-ink" font-size="13">Fast roaming ke bina (802.1X)</text>
<rect x="20" y="35" width="90" height="34" rx="6" fill="#bae6fd"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="12">scan</text>
<rect x="115" y="35" width="90" height="34" rx="6" fill="#ddd6fe"/><text x="160" y="57" text-anchor="middle" class="svg-ink" font-size="12">reassoc</text>
<rect x="210" y="35" width="250" height="34" rx="6" fill="#fed7aa"/><text x="335" y="57" text-anchor="middle" class="svg-ink" font-size="12">full 802.1X to RADIUS + 4-way</text>
<rect x="465" y="35" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="510" y="57" text-anchor="middle" class="svg-ink" font-size="12">traffic</text>
<text x="20" y="115" class="svg-ink" font-size="13">802.11k + 802.11r ke saath</text>
<rect x="20" y="125" width="40" height="34" rx="6" fill="#bae6fd"/><text x="40" y="147" text-anchor="middle" class="svg-ink" font-size="11">k</text>
<rect x="65" y="125" width="140" height="34" rx="6" fill="#ddd6fe"/><text x="135" y="147" text-anchor="middle" class="svg-ink" font-size="12">FT reassoc (keys)</text>
<rect x="210" y="125" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="255" y="147" text-anchor="middle" class="svg-ink" font-size="12">traffic</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">gap sau ms se ghatkar kuch tens of ms</text>
</svg><p class="cap">Fast roaming slow RADIUS round trip aur andhe scanning ko hata deti hai.</p></div>

<h3>Purane tools: PMK caching aur OKC</h3>
<p>802.11r se pehle vendors key material cache karte the. <b>PMK caching</b> client ko aise AP par wapas aane deta hai jahan woh pehle ja chuka hai, bina naye 802.1X exchange ke. <b>Opportunistic Key Caching (OKC)</b> controller ko agle AP ko key pehle se dene deta hai. OKC purane devices mein bahut supported hai lekin standardised nahi hai, isliye mixed clients alag behave kar sakte hain. 802.11r standard jawab hai.</p>

<h3>9800 par configuration (concept view)</h3>
<p>Real Catalyst 9800 par fast-transition setting <b>WLAN profile</b> ke security section mein hoti hai, policy profile mein nahi. Ek typical design aisa dikhta hai (sirf samajhne ke liye; lab model yeh lines accept nahi karta):</p>
<pre class="code"><span class="c">! real 9800 only, not accepted by the lab model</span>
wlan NK-CORP 2 NK-CORP
 shutdown
 security ft adaptive
 security wpa akm ft dot1x
 no shutdown</pre>
<p>Shabd <b>adaptive</b> ka matlab hai WLAN FT AKM ko aise advertise karta hai ki zyadatar modern clients use kar sakein jabki purane clients normal tarah connect hote rahein. Yaad rakhne wala rule: WLAN ki security settings sirf tab badli ja sakti hain jab WLAN shut down ho, bilkul lab ki tarah. Yeh bhi yaad rakho ki jo SSID purane clients handle nahi kar sakte uspar FT enable karne se association failures ho sakte hain, isliye real device types ke saath pilot hamesha pehle kiya jaata hai.</p>

<h3>Controller kya kar sakta hai aur kya nahi</h3>
<table class="cmp"><tr><th>Controller kar sakta hai</th><th>Controller nahi kar sakta</th></tr>
<tr><td>Neighbours advertise karna (11k) aur transition hints bhejna (11v)</td><td>Client ko roam karne par force karna; client driver decide karta hai</td></tr>
<tr><td>Keys cache karna taaki agla AP RADIUS skip kare (11r, OKC)</td><td>Coverage hole ya high noise floor fix karna</td></tr>
<tr><td>Tags se har AP par same policy rakhna</td><td>Agar APs ke beech VLAN alag hai to client ka IP bachana</td></tr></table>
<p>Yahi <b>sticky clients</b> ka dil hai. Sticky client door ke AP se chipka rehta hai jiska RSSI kharab hai (jaise -80 dBm) jabki paas mein bahut better AP (-55 dBm) hai. Client sochta hai current link "kaafi achha" hai kyunki frames abhi bhi mil rahe hain. Symptoms: slow speed, retries, ticket mein likha "stairs ke paas Wi-Fi kharab hai" jabki doosra phone theek chal raha hai. Mitigations: sensible AP power (chhote cells, RF module dekho), minimum data rates, 11k/11v enabled, aur updated client drivers. Sabse common real reason yeh hai ki client khud move nahi karna chahta.</p>

<h3>Lab mein aap kya verify kar sakte ho</h3>
<p>Lab FT frames nahi dikha sakti, lekin woh facts dikhati hai jo decide karte hain ki roam seamless ho sakta hai ya nahi: client ko kaunsa AP serve kar raha hai, client kaunse VLAN mein hai aur har AP par kaunsa policy tag hai.</p>
<pre class="out">WLC1# show wireless client mac-address 0050.7966.6801 detail

Client MAC Address : 0050.7966.6801
Client IPv4 Address: 10.10.20.55
AP Name            : AP1
WLAN Profile Name  : NK-STAFF
Policy Profile     : PP-STAFF
Policy Tag         : PT-CAMPUS
<span class="hl">VLAN               : 20</span>
Radio / Channel    : 5 GHz / 36
RSSI               : -58 dBm</pre>
<p>Agar wahi client baad mein AP2 par bhi <span class="hl">Policy Profile : PP-STAFF</span> aur VLAN 20 dikhaye, to sabse fast FT roam bhi address rakhega. Agar alag VLAN dikhaye, to fast roaming sirf break ko tezi se karata hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) 802.11r se coverage holes fix hone ki ummeed. (2) Har SSID par strict FT on karke purane handhelds todna. (3) AP power itna high rakhna ki cells bahut overlap karein aur clients ko move karne ki wajah hi na mile. (4) Yeh bhoolna ki security edit karne se pehle WLAN disable karna padta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> 11k = neighbour lists, 11v = transition requests, 11r = fast key exchange. Inhe swap mat karo. Aur yaad rakho: 11v suggestion hai, command nahi.</p></div>

<div class="scn"><h4>Stairwell par voice dropouts</h4><p>Staff stairwell se guzarte hain to handsets 2 second ka audio kho dete hain. Logs har baar full 802.1X dikhate hain. Team sab handset models ke support confirm karke 802.11r (adaptive) enable karti hai, 11k on karti hai, aur 5 GHz power kam karti hai. Roam gaps tens of milliseconds tak aa jaate hain. Ek purana scanner ab connect nahi hota aur use alag SSID par move kiya jaata hai.</p><p><b>Lesson:</b> fast roaming madad karti hai, lekin yeh client compatibility testing ke saath feature rollout hai, checkbox nahi.</p></div>

<div class="iv"><p class="q">"User kehta hai chalte waqt Wi-Fi slow hai, lekin uske paas wala AP theek hai. Kyun?"</p><p>Sambhavtah sticky client door ke AP ko pakde hua hai. Serving AP par RSSI check karo, dekho 11k/11v enabled hain ya nahi, AP power aur minimum rates check karo, client driver update karo, aur client detail view se prove karo ki client actually kaunsa AP use kar raha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.11k neighbour lists deta hai, 802.11v transition hints, 802.11r key handshake tez karta hai.</li>
<li>PMK caching aur OKC purane shortcuts hain; OKC standard nahi hai.</li>
<li>Client decide karta hai; controller assist karta hai.</li>
<li>11r/k/v aur sticky behaviour lab mein simulate nahi hote.</li>
<li>Fast roaming tabhi madad karti hai jab dono APs par VLAN aur policy match karein.</li>
</ul></div>
`}};export{e as default};