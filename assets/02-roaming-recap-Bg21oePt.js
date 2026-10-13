var e={id:`roaming-recap`,h:{en:`Roaming recap: who decides, what a controller sees, the four outcomes`,hi:`Roaming recap: kaun decide karta hai, controller kya dekhta hai, chaar outcomes`},body:{en:`
<p>The module wl-roaming already taught the roaming types in depth. This chapter is a short recap from the point of view that matters here: <b>what the controllers do when a client moves</b>. If anything feels new, go back to the roaming types chapter in wl-roaming first.</p>

<h3>The client decides, the network helps</h3>
<p>An 802.11 client chooses when to leave an AP. There is no command a controller can send that forces a normal client to roam. The client watches its signal (RSSI), its signal-to-noise ratio, its retry rate and sometimes the load it hears advertised, and when the current AP looks worse than another it sends a <b>reassociation request</b> to the new AP. A fresh join is an <b>association</b>; moving while already connected is a <b>reassociation</b>. The network can only <i>help</i>: 802.11k tells the client where the neighbours are, 802.11v suggests a better AP, and 802.11r makes the security step quick. Chapter 3 covers those three.</p>
<p>Clients that hold on to a weak AP too long are called <b>sticky clients</b>. They are one of the most common causes of "Wi-Fi is slow when I walk around" complaints.</p>

<h3>What the controller sees</h3>
<p>From the controller side a roam is simply an association event arriving from a different AP. The controller now asks three questions, in this order:</p>
<ol>
<li><b>Do I already know this client?</b> If it is already on this controller, this is an intra-controller roam and the client keeps its address.</li>
<li><b>If not, does a mobility peer know it?</b> The controller asks the members of its mobility group. If one of them owns the client, the two controllers coordinate.</li>
<li><b>If nobody knows it, it is a new client.</b> It authenticates, gets an address from the VLAN of the policy profile, and the old session is gone.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Roam decision">
<rect x="220" y="10" width="200" height="34" rx="6" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client reassociates to a new AP</text>
<rect x="20" y="90" width="170" height="44" rx="6" fill="#bbf7d0"/><text x="105" y="108" text-anchor="middle" class="svg-ink" font-size="12">Same controller</text><text x="105" y="124" text-anchor="middle" class="svg-ink" font-size="12">Intra-controller roam</text>
<rect x="235" y="90" width="170" height="44" rx="6" fill="#bae6fd"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">Peer controller, same VLAN</text><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">Inter-controller L2 roam</text>
<rect x="450" y="90" width="170" height="44" rx="6" fill="#ddd6fe"/><text x="535" y="108" text-anchor="middle" class="svg-ink" font-size="12">Peer controller, other VLAN</text><text x="535" y="124" text-anchor="middle" class="svg-ink" font-size="12">Inter-controller L3 roam</text>
<rect x="220" y="200" width="200" height="44" rx="6" fill="#fed7aa"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="12">No peer / no tunnel / WLAN differs</text><text x="320" y="234" text-anchor="middle" class="svg-ink" font-size="12">Hard roam: new address</text>
<line x1="320" y1="44" x2="105" y2="90" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="90" stroke="#64748b"/><line x1="320" y1="44" x2="535" y2="90" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="200" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="330" y="165" class="svg-muted" font-size="12">otherwise</text>
</svg><p class="cap">Four outcomes of a reassociation. The first three keep the client's IP address; the last one does not.</p></div>

<table class="cmp"><tr><th>Roam</th><th>Where the new AP is</th><th>Address</th><th>Mobility needed?</th></tr>
<tr><td>Intra-AP (band steering)</td><td>Same AP, other radio</td><td>Kept</td><td>No</td></tr>
<tr><td>Intra-controller</td><td>Another AP, same controller</td><td>Kept</td><td>No</td></tr>
<tr><td>Inter-controller Layer 2</td><td>Other controller, same VLAN and subnet</td><td>Kept</td><td>Yes (peer Up)</td></tr>
<tr><td>Inter-controller Layer 3</td><td>Other controller, different subnet</td><td>Kept (tunnel to anchor)</td><td>Yes (peer Up)</td></tr>
<tr><td>Hard roam</td><td>Anything without a working peer</td><td>New</td><td>Not available</td></tr>
</table>

<h3>The time budget</h3>
<p>Voice and video tolerate very little interruption. The usual design figure is <b>150 ms end to end</b> for a voice roam, and many guides aim for under 50 ms of actual gap. A full 802.1X exchange with RADIUS can take several hundred milliseconds, which is why fast-roaming methods exist. A hard roam adds a DHCP exchange on top and breaks TCP sessions. The simulator does not measure roam time; it proves the <b>result</b> of a roam (type, address kept or not, anchor and foreign roles).</p>

<div class="eg"><p><b>Worked example.</b> Staff laptop on AP1 (WLC1, VLAN 20) walks to AP2. Same controller, so the controller just updates the AP in the client's record: address kept, no tunnel, no mobility group involved. Later the laptop reaches AP3, which joined WLC2. WLC2 does not know the laptop. It asks its peers, WLC1 answers, and because VLAN 120 differs from VLAN 20 the roam becomes Layer 3. Two walks, two different roam types, one address.</p></div>

<h3>What the roam preview in the lab looks like</h3>
<p>In lab <b>wl-mob-roam</b> you use the simulator helper <code>wifi walk &lt;AP name&gt;</code> on a client console. Real clients roam by themselves; the helper only moves the laptop next to an AP and lets it reassociate. The controller then logs the event:</p>
<pre class="out">WLC2# show logging | include MOBILITY
<span class="hl">%MOBILITY-6-CLIENT_ROAM: client 0050.7966.6801 L3 Roam from AP2 (WLC1) to AP3 (WLC2), address 10.10.20.55 kept, anchored on WLC1</span></pre>
<p>You will read this line again in chapters 6 and 11.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking the controller can force a client to roam: it can only deauthenticate it or suggest an AP. (2) Assuming two APs on the same SSID always means a seamless roam: if the APs belong to controllers that are not mobility peers, or the WLAN profile differs, you get a hard roam. (3) Mixing up "roaming" (the client) with "mobility" (the controllers).</p></div>

<div class="exam"><p><b>Exam trap.</b> A roam between two APs on the same controller needs no mobility peer at all. Candidates sometimes answer "mobility group" for an intra-controller roam. Mobility matters only when the new AP sits on a different controller.</p></div>

<div class="scn"><h4>The sticky laptop</h4><p>A user in a warehouse complained that video calls were choppy while walking to the loading bay. Controller logs showed the laptop staying on an AP at -78 dBm although an AP at -55 dBm was nearby. The client simply refused to roam. The fix was not on the controller: the engineer enabled 802.11v BSS transition and 802.11k neighbour lists on the WLAN so capable clients were nudged, and adjusted the minimum data rates so the weak AP stopped looking attractive.</p><p><b>Lesson:</b> when the roam does not happen, look at the client behaviour first; the controller cannot force it.</p></div>

<div class="iv"><p class="q">"A client walks between two APs and the call drops. How do you decide whether it is an RF problem, a mobility problem or a client problem?"</p><p>Look at the client record on the controller: did the roam happen at all, and what type was it? If it was a hard roam, check mobility peer state, WLAN and policy consistency. If it was a clean L2 or L3 roam but the call still had a gap, look at the security step (fast roaming) and RF overlap. If the client never roamed, it is sticky: use 802.11k and v, review minimum data rates and AP power.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The client decides to roam; the controller can only help or deauthenticate.</li>
<li>Same controller roams need no mobility; different controller roams need a Up mobility peer.</li>
<li>Four outcomes: intra-controller, inter-controller L2, inter-controller L3, hard roam.</li>
<li>Only the hard roam changes the address.</li>
<li>Voice budget is about 150 ms end to end; a hard roam always misses it.</li>
</ul></div>
`,hi:`
<p>wl-roaming module ne roaming types pehle hi gehraai se sikha diye hain. Yeh chapter ek chhota recap hai us nazariye se jo yahan zaroori hai: <b>jab client move karta hai to controllers kya karte hain</b>. Agar kuch naya lage to pehle wl-roaming ka roaming types wala chapter dekho.</p>

<h3>Client decide karta hai, network madad karta hai</h3>
<p>802.11 client khud decide karta hai ki AP kab chhodna hai. Controller aisa koi command nahi bhej sakta jo normal client ko roam karne par majboor kare. Client apna signal (RSSI), signal-to-noise ratio, retry rate aur kabhi kabhi advertised load dekhta hai, aur jab current AP kisi aur se kharab lagta hai to woh naye AP ko <b>reassociation request</b> bhejta hai. Fresh join <b>association</b> hota hai; connected rehte hue move karna <b>reassociation</b> hota hai. Network sirf <i>madad</i> kar sakta hai: 802.11k client ko neighbours batata hai, 802.11v behtar AP suggest karta hai, aur 802.11r security step ko tez banata hai. Chapter 3 in teeno ko cover karta hai.</p>
<p>Jo clients kamzor AP ko zyada der pakad ke rakhte hain unhe <b>sticky clients</b> kehte hain. "Chalte waqt Wi-Fi slow ho jata hai" wali complaints ka yeh sabse common karan hai.</p>

<h3>Controller kya dekhta hai</h3>
<p>Controller ke nazariye se roam bas ek association event hai jo doosre AP se aaya. Controller ab teen sawal is order mein poochta hai:</p>
<ol>
<li><b>Kya main is client ko pehle se jaanta hoon?</b> Agar client pehle se isi controller par hai to yeh intra-controller roam hai aur client apna address rakhta hai.</li>
<li><b>Nahi, to kya koi mobility peer jaanta hai?</b> Controller apne mobility group ke members se poochta hai. Agar koi client ka maalik hai to dono controllers coordinate karte hain.</li>
<li><b>Agar koi nahi jaanta, to yeh naya client hai.</b> Woh authenticate hota hai, policy profile ke VLAN se address leta hai, aur purana session khatam.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Roam decision">
<rect x="220" y="10" width="200" height="34" rx="6" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client naye AP par reassociate karta hai</text>
<rect x="20" y="90" width="170" height="44" rx="6" fill="#bbf7d0"/><text x="105" y="108" text-anchor="middle" class="svg-ink" font-size="12">Same controller</text><text x="105" y="124" text-anchor="middle" class="svg-ink" font-size="12">Intra-controller roam</text>
<rect x="235" y="90" width="170" height="44" rx="6" fill="#bae6fd"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">Peer controller, same VLAN</text><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">Inter-controller L2 roam</text>
<rect x="450" y="90" width="170" height="44" rx="6" fill="#ddd6fe"/><text x="535" y="108" text-anchor="middle" class="svg-ink" font-size="12">Peer controller, alag VLAN</text><text x="535" y="124" text-anchor="middle" class="svg-ink" font-size="12">Inter-controller L3 roam</text>
<rect x="220" y="200" width="200" height="44" rx="6" fill="#fed7aa"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="12">Peer nahi / tunnel nahi / WLAN alag</text><text x="320" y="234" text-anchor="middle" class="svg-ink" font-size="12">Hard roam: naya address</text>
<line x1="320" y1="44" x2="105" y2="90" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="90" stroke="#64748b"/><line x1="320" y1="44" x2="535" y2="90" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="200" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="330" y="165" class="svg-muted" font-size="12">warna</text>
</svg><p class="cap">Reassociation ke chaar outcomes. Pehle teen client ka IP address rakhte hain; aakhri nahi rakhta.</p></div>

<table class="cmp"><tr><th>Roam</th><th>Naya AP kahan hai</th><th>Address</th><th>Mobility chahiye?</th></tr>
<tr><td>Intra-AP (band steering)</td><td>Same AP, doosra radio</td><td>Kept</td><td>Nahi</td></tr>
<tr><td>Intra-controller</td><td>Doosra AP, same controller</td><td>Kept</td><td>Nahi</td></tr>
<tr><td>Inter-controller Layer 2</td><td>Doosra controller, same VLAN aur subnet</td><td>Kept</td><td>Haan (peer Up)</td></tr>
<tr><td>Inter-controller Layer 3</td><td>Doosra controller, alag subnet</td><td>Kept (anchor tak tunnel)</td><td>Haan (peer Up)</td></tr>
<tr><td>Hard roam</td><td>Koi bhi jagah jahan working peer nahi</td><td>Naya</td><td>Available nahi</td></tr>
</table>

<h3>Time budget</h3>
<p>Voice aur video bahut kam interruption sehte hain. Design figure aam taur par voice roam ke liye <b>150 ms end to end</b> hai, aur kai guides actual gap 50 ms se kam rakhne ka target karte hain. RADIUS ke saath poora 802.1X exchange kai sau milliseconds le sakta hai, isiliye fast-roaming methods bane hain. Hard roam mein upar se DHCP exchange bhi judta hai aur TCP sessions toot jaate hain. Simulator roam time measure nahi karta; woh roam ka <b>result</b> prove karta hai (type, address kept ya nahi, anchor aur foreign roles).</p>

<div class="eg"><p><b>Worked example.</b> Staff laptop AP1 (WLC1, VLAN 20) se AP2 tak chalta hai. Same controller hai, to controller bas client ke record mein AP update karta hai: address kept, tunnel nahi, mobility group involve nahi. Baad mein laptop AP3 tak pahunchta hai, jo WLC2 par joined hai. WLC2 laptop ko nahi jaanta. Woh peers se poochta hai, WLC1 jawab deta hai, aur kyunki VLAN 120, VLAN 20 se alag hai roam Layer 3 ban jaata hai. Do walks, do alag roam types, ek address.</p></div>

<h3>Lab mein roam preview kaisa dikhta hai</h3>
<p>Lab <b>wl-mob-roam</b> mein aap client console par simulator helper <code>wifi walk &lt;AP name&gt;</code> use karte ho. Asli clients khud roam karte hain; helper sirf laptop ko AP ke paas le jaata hai aur use reassociate karne deta hai. Phir controller event log karta hai:</p>
<pre class="out">WLC2# show logging | include MOBILITY
<span class="hl">%MOBILITY-6-CLIENT_ROAM: client 0050.7966.6801 L3 Roam from AP2 (WLC1) to AP3 (WLC2), address 10.10.20.55 kept, anchored on WLC1</span></pre>
<p>Yeh line aap chapter 6 aur 11 mein phir padhoge.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Sochna ki controller client ko roam karne par force kar sakta hai: woh sirf deauthenticate kar sakta hai ya AP suggest kar sakta hai. (2) Maan lena ki same SSID wale do APs ka matlab hamesha seamless roam hai: agar APs aise controllers ke hain jo mobility peers nahi hain, ya WLAN profile alag hai, to hard roam milta hai. (3) "Roaming" (client) aur "mobility" (controllers) ko mix karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Same controller ke do APs ke beech roam ko mobility peer ki zaroorat hi nahi. Candidates kabhi kabhi intra-controller roam ke liye "mobility group" jawab dete hain. Mobility tabhi matter karti hai jab naya AP doosre controller par ho.</p></div>

<div class="scn"><h4>Sticky laptop</h4><p>Warehouse mein ek user ne complain kiya ki loading bay tak chalte waqt video calls choppy ho jaati hain. Controller logs mein laptop -78 dBm par ek AP se chipka dikha jabki -55 dBm ka AP paas tha. Client roam karne se hi mana kar raha tha. Fix controller par nahi tha: engineer ne WLAN par 802.11v BSS transition aur 802.11k neighbour lists enable ki taaki capable clients ko nudge mile, aur minimum data rates adjust kiye taaki kamzor AP attractive na lage.</p><p><b>Lesson:</b> jab roam hota hi nahi, pehle client behaviour dekho; controller force nahi kar sakta.</p></div>

<div class="iv"><p class="q">"Client do APs ke beech chalta hai aur call drop ho jaati hai. Aap kaise decide karoge ki yeh RF problem hai, mobility problem hai ya client problem?"</p><p>Controller par client record dekho: roam hua bhi, aur kis type ka? Agar hard roam tha to mobility peer state, WLAN aur policy consistency check karo. Agar clean L2 ya L3 roam tha phir bhi gap aaya, to security step (fast roaming) aur RF overlap dekho. Agar client ne roam kiya hi nahi, to woh sticky hai: 802.11k aur v use karo, minimum data rates aur AP power review karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Client roam karne ka decision leta hai; controller sirf madad ya deauthenticate kar sakta hai.</li>
<li>Same controller roams ko mobility nahi chahiye; alag controller ke roams ko Up mobility peer chahiye.</li>
<li>Chaar outcomes: intra-controller, inter-controller L2, inter-controller L3, hard roam.</li>
<li>Sirf hard roam address badalta hai.</li>
<li>Voice budget lagbhag 150 ms end to end hai; hard roam hamesha ise miss karta hai.</li>
</ul></div>
`}};export{e as default};