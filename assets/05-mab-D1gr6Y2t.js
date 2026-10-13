var e={id:`mab`,h:{en:`MAC filtering and MAB: identification, not authentication`,hi:`MAC filtering aur MAB: identification, authentication nahi`},body:{en:`
<p>Imagine a building where the guard lets in anyone whose <b>face is on a list</b>, with no ID check. It is quick, and it works for the cleaning robot that cannot carry a badge. But if someone wears a mask that looks like a listed face, the guard cannot tell. <b>MAC Authentication Bypass (MAB)</b> is that guard: the network recognises a device by its MAC address, because the device cannot run 802.1X.</p>

<h3>What a MAC address is, and why that is weak</h3>
<p>Every network card has a 48-bit hardware address written as 12 hexadecimal digits, for example <code>0050.7966.6801</code> or <code>00:50:79:66:68:01</code>. It is sent in clear text in every frame. Anyone who can hear the radio can read the MAC addresses of nearby clients, and software can change the MAC a device presents. So a MAC is an <b>identifier</b>, not a <b>secret</b>. MAB proves nothing about the device; it only says "this address is on my list". Use it for headless devices that cannot do 802.1X (printers, sensors, cameras, medical carts), and always put them in a low-privilege VLAN with a tight ACL.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Local list versus RADIUS MAB">
<rect x="10" y="70" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="98" text-anchor="middle" class="svg-ink" font-size="13">IoT device</text>
<rect x="250" y="70" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="315" y="90" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="315" y="106" text-anchor="middle" class="svg-muted" font-size="11">mac-filtering MAB-LIST</text>
<rect x="500" y="20" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="565" y="48" text-anchor="middle" class="svg-ink" font-size="12">Local MAC list</text>
<rect x="500" y="130" width="130" height="46" rx="8" fill="#fde68a"/><text x="565" y="158" text-anchor="middle" class="svg-ink" font-size="12">RADIUS (RAD1)</text>
<line x1="120" y1="93" x2="250" y2="93" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="82" x2="500" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="104" x2="500" y2="152" stroke="#64748b" stroke-width="2"/>
<text x="185" y="84" text-anchor="middle" class="svg-muted" font-size="11">associate (MAC seen)</text>
<text x="440" y="60" text-anchor="middle" class="svg-muted" font-size="11">authz list: local</text>
<text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="11">authz list: group</text>
</svg><p class="cap">The authorization method list chooses where the MAC is checked.</p></div>

<h3>Configuring MAB on the controller</h3>
<p>MAB uses an <b>authorization</b> method list (not a login list as web auth does). Two designs:</p>
<pre class="code"><span class="c">! Design 1: local list on the controller (small sites, lab)</span>
aaa new-model
aaa authorization network MAB-LIST local
username 005079666801 mac
<span class="c">! the 12-hex MAC, no dots or colons, lowercase or uppercase</span>

<span class="c">! Design 2: RADIUS decides (scales; ISE or RAD1)</span>
aaa authorization network MAB-LIST group RADIUS-GRP

<span class="c">! WLAN: turn MAC filtering on and name the list (disable the WLAN first)</span>
wlan NK-IOT 5 NK-IOT
 shutdown
 mac-filtering MAB-LIST
 no shutdown
 exit</pre>
<p>With a RADIUS list the controller sends an Access-Request whose user name and password are the MAC address; the server answers accept or reject and can return attributes (VLAN with AAA override, ACL name, tag). On RAD1 a known endpoint is an entry in the MAB policy, or a user whose name and password both equal the MAC. Web UI: <b>Configuration &gt; Security &gt; AAA</b> (method list, tab AAA Method List, type Authorization), and <b>Configuration &gt; Security &gt; Web Auth &gt; WLAN Security</b> for the per-WLAN MAC filter in this build. Unconfirmed items: the precise <code>mac-filtering</code> syntax can differ by release, so compare with your release guide.</p>

<h3>Reading MAB failures</h3>
<p>Each failure reason has its own log line, which makes triage fast:</p>
<pre class="out">WLC1# show logging
%MAB-4-AUTH_FAIL: Client 0050.7966.6803 rejected on WLAN 5 (NK-IOT): MAC not in the local list
%MAB-4-AUTH_FAIL: Client 0050.7966.6804 rejected on WLAN 5 (NK-IOT): RADIUS server not responding
%MAB-4-AUTH_FAIL: Client 0050.7966.6805 rejected on WLAN 5 (NK-IOT): RADIUS Access-Reject
<span class="hl">%MAB-4-AUTH_FAIL: Client 0050.7966.6806 rejected on WLAN 5 (NK-IOT): authorization list MAB-LIST is not defined</span></pre>
<p>Typical causes: the list name on the WLAN does not match the AAA command; <code>aaa new-model</code> missing; MAC typed with a typo or with separators; RADIUS server down or wrong shared secret (timeout); endpoint not in the server's database (reject).</p>

<h3>MAC randomization: a modern wrinkle</h3>
<p>Phones and laptops now use a <b>private (randomized) MAC address</b> per SSID, and sometimes rotate it. A MAB list that holds the phone's real hardware address will never match, and a rotating address would force you to re-add it again and again. This is why MAB is for <b>fixed IoT devices</b>, which can be set to use their hardware MAC, and not for personal phones. For people, use 802.1X or web authentication. (Effects of randomization on ISE profiling are concept only here.)</p>

<div class="eg"><p><b>Worked example.</b> A factory has 40 barcode scanners that only support WPA2-PSK. The team creates NK-IOT with PSK plus MAC filtering against RADIUS. A visitor who learns the PSK still cannot join, because their MAC is not known. But an insider who copies a scanner's MAC could. So the scanners sit in VLAN 70 with an ACL allowing only the inventory server, limiting the damage of a spoofed address.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling MAB "authentication" in a design document. Typing MACs with separators in a <code>username ... mac</code> entry. Using MAB for personal phones with randomized addresses. Giving MAB devices a privileged VLAN. Forgetting that the WLAN must be shut down before adding <code>mac-filtering</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> MAB is the fallback for devices without a supplicant; it uses the MAC as both user name and password in RADIUS. It uses an authorization method list. It is spoofable, so pair it with a restricted VLAN or ACL and, where possible, device profiling.</p></div>

<div class="scn"><h4>The printer that stopped printing</h4><p>After a firmware update a branch printer lost Wi-Fi. The controller log said "MAC not in the local list". The update had switched the printer to a randomized MAC. Instead of adding the new address, the engineer disabled MAC randomization on the printer so its stable hardware address matched the list again, and noted the setting in the device standard.</p><p><b>Lesson:</b> MAB depends on a stable MAC. Document that for every device class you put on MAB.</p></div>

<div class="iv"><p class="q">"What is MAB, and why do security teams call it weak?"</p><p>MAB identifies a device by MAC address when it has no 802.1X supplicant. The MAC travels in clear and can be spoofed, so it is identification, not authentication. Limit the damage with a restricted VLAN, ACL or tag, and use certificates (EAP-TLS) wherever the device supports it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAB checks a MAC against a local list or RADIUS; it is for devices without 802.1X.</li>
<li>Configure an authorization method list and <code>mac-filtering &lt;list&gt;</code> on the WLAN.</li>
<li>Log messages separate five failures: no list, AAA off, not listed, server down, reject.</li>
<li>MACs can be spoofed and randomized: fixed IoT only, in a restricted VLAN.</li>
<li>MAB is also the first step of CWA (chapter 3).</li>
</ul></div>
`,hi:`
<p>Ek aisi building socho jahan guard har us insaan ko andar jaane deta hai jiska <b>chehra list mein hai</b>, koi ID check nahi. Yeh tez hai, aur cleaning robot ke liye chalta hai jo badge nahi le ja sakta. Lekin agar koi aisa mask pehne jo listed chehre jaisa dikhe, to guard fark nahi bata sakta. <b>MAC Authentication Bypass (MAB)</b> wahi guard hai: network device ko uske MAC address se pehchaanta hai, kyunki device 802.1X nahi chala sakta.</p>

<h3>MAC address kya hai, aur woh kamzor kyun hai</h3>
<p>Har network card ka 48-bit hardware address hota hai jo 12 hexadecimal digits mein likha jata hai, jaise <code>0050.7966.6801</code> ya <code>00:50:79:66:68:01</code>. Yeh har frame mein clear text mein jata hai. Jo bhi radio sun sakta hai woh paas ke clients ke MAC addresses padh sakta hai, aur software device ka dikhaya MAC badal sakta hai. To MAC ek <b>identifier</b> hai, <b>secret</b> nahi. MAB device ke baare mein kuch prove nahi karta; sirf kehta hai "yeh address meri list mein hai". Ise headless devices ke liye use karo jo 802.1X nahi kar sakte (printers, sensors, cameras, medical carts), aur hamesha unhe low-privilege VLAN aur tight ACL mein rakho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Local list versus RADIUS MAB">
<rect x="10" y="70" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="98" text-anchor="middle" class="svg-ink" font-size="13">IoT device</text>
<rect x="250" y="70" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="315" y="90" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="315" y="106" text-anchor="middle" class="svg-muted" font-size="11">mac-filtering MAB-LIST</text>
<rect x="500" y="20" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="565" y="48" text-anchor="middle" class="svg-ink" font-size="12">Local MAC list</text>
<rect x="500" y="130" width="130" height="46" rx="8" fill="#fde68a"/><text x="565" y="158" text-anchor="middle" class="svg-ink" font-size="12">RADIUS (RAD1)</text>
<line x1="120" y1="93" x2="250" y2="93" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="82" x2="500" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="104" x2="500" y2="152" stroke="#64748b" stroke-width="2"/>
<text x="185" y="84" text-anchor="middle" class="svg-muted" font-size="11">associate (MAC dikha)</text>
<text x="440" y="60" text-anchor="middle" class="svg-muted" font-size="11">authz list: local</text>
<text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="11">authz list: group</text>
</svg><p class="cap">Authorization method list tay karti hai ki MAC kahan check hoga.</p></div>

<h3>Controller par MAB configure karna</h3>
<p>MAB <b>authorization</b> method list use karta hai (web auth ki tarah login list nahi). Do designs:</p>
<pre class="code"><span class="c">! Design 1: controller par local list (chhoti sites, lab)</span>
aaa new-model
aaa authorization network MAB-LIST local
username 005079666801 mac
<span class="c">! 12-hex MAC, bina dots ya colons ke, lowercase ya uppercase</span>

<span class="c">! Design 2: RADIUS decide karta hai (scale hota hai; ISE ya RAD1)</span>
aaa authorization network MAB-LIST group RADIUS-GRP

<span class="c">! WLAN: MAC filtering on karo aur list ka naam do (pehle WLAN disable karo)</span>
wlan NK-IOT 5 NK-IOT
 shutdown
 mac-filtering MAB-LIST
 no shutdown
 exit</pre>
<p>RADIUS list ke saath controller Access-Request bhejta hai jiska user name aur password MAC address hota hai; server accept ya reject karta hai aur attributes return kar sakta hai (AAA override ke saath VLAN, ACL naam, tag). RAD1 par known endpoint MAB policy ki entry hai, ya aisa user jiska naam aur password dono MAC ke barabar hain. Web UI: <b>Configuration &gt; Security &gt; AAA</b> (method list, tab AAA Method List, type Authorization), aur is build mein per-WLAN MAC filter ke liye <b>Configuration &gt; Security &gt; Web Auth &gt; WLAN Security</b>. Unconfirmed items: <code>mac-filtering</code> ka precise syntax release ke hisaab se alag ho sakta hai, apni release guide se compare karo.</p>

<h3>MAB failures padhna</h3>
<p>Har failure reason ki apni log line hai, isliye triage tez hota hai:</p>
<pre class="out">WLC1# show logging
%MAB-4-AUTH_FAIL: Client 0050.7966.6803 rejected on WLAN 5 (NK-IOT): MAC not in the local list
%MAB-4-AUTH_FAIL: Client 0050.7966.6804 rejected on WLAN 5 (NK-IOT): RADIUS server not responding
%MAB-4-AUTH_FAIL: Client 0050.7966.6805 rejected on WLAN 5 (NK-IOT): RADIUS Access-Reject
<span class="hl">%MAB-4-AUTH_FAIL: Client 0050.7966.6806 rejected on WLAN 5 (NK-IOT): authorization list MAB-LIST is not defined</span></pre>
<p>Typical causes: WLAN par list ka naam AAA command se match nahi karta; <code>aaa new-model</code> missing; MAC typo ke saath ya separators ke saath type hua; RADIUS server down ya shared secret galat (timeout); endpoint server ke database mein nahi (reject).</p>

<h3>MAC randomization: ek modern jhanjhat</h3>
<p>Phones aur laptops ab har SSID ke liye <b>private (randomized) MAC address</b> use karte hain, aur kabhi kabhi use rotate bhi karte hain. Jis MAB list mein phone ka real hardware address hai woh kabhi match nahi karegi, aur rotating address aapko baar baar dobara add karne par majboor karega. Isiliye MAB <b>fixed IoT devices</b> ke liye hai, jinhe hardware MAC use karne par set kiya ja sakta hai, personal phones ke liye nahi. Logon ke liye 802.1X ya web authentication use karo. (ISE profiling par randomization ka asar yahan concept only hai.)</p>

<div class="eg"><p><b>Worked example.</b> Ek factory mein 40 barcode scanners hain jo sirf WPA2-PSK support karte hain. Team NK-IOT banati hai PSK plus RADIUS ke against MAC filtering ke saath. Jo visitor PSK jaan jaye woh bhi join nahi kar sakta, kyunki uska MAC known nahi. Lekin koi insider jo scanner ka MAC copy kare, kar sakta hai. Isliye scanners VLAN 70 mein hain aur ACL sirf inventory server allow karta hai, taaki spoofed address ka nuksan limited rahe.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Design document mein MAB ko "authentication" kehna. <code>username ... mac</code> entry mein MACs separators ke saath type karna. Randomized addresses wale personal phones ke liye MAB use karna. MAB devices ko privileged VLAN dena. Yeh bhool jana ki <code>mac-filtering</code> add karne se pehle WLAN shut down hona chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> MAB un devices ke liye fallback hai jinke paas supplicant nahi; RADIUS mein MAC hi user name aur password dono hota hai. Yeh authorization method list use karta hai. Yeh spoof ho sakta hai, isliye restricted VLAN ya ACL ke saath use karo aur jahan ho sake device profiling.</p></div>

<div class="scn"><h4>Printer jo print karna band kar gaya</h4><p>Firmware update ke baad ek branch printer ka Wi-Fi chala gaya. Controller log ne kaha "MAC not in the local list". Update ne printer ko randomized MAC par switch kar diya tha. Naya address add karne ki jagah engineer ne printer par MAC randomization disable kiya taaki uska stable hardware address list se phir match kare, aur setting ko device standard mein note kiya.</p><p><b>Lesson:</b> MAB stable MAC par depend karta hai. Jis device class ko MAB par rakho uske liye yeh document karo.</p></div>

<div class="iv"><p class="q">"MAB kya hai, aur security teams ise kamzor kyun kehti hain?"</p><p>MAB device ko MAC address se identify karta hai jab uske paas 802.1X supplicant nahi hota. MAC clear mein jata hai aur spoof ho sakta hai, isliye yeh identification hai, authentication nahi. Nuksan restricted VLAN, ACL ya tag se limit karo, aur jahan device support kare wahan certificates (EAP-TLS) use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAB MAC ko local list ya RADIUS se check karta hai; yeh 802.1X-less devices ke liye hai.</li>
<li>Authorization method list aur WLAN par <code>mac-filtering &lt;list&gt;</code> configure karo.</li>
<li>Log messages paanch failures alag karte hain: no list, AAA off, not listed, server down, reject.</li>
<li>MACs spoof aur randomize ho sakte hain: sirf fixed IoT, restricted VLAN mein.</li>
<li>MAB CWA ka pehla step bhi hai (chapter 3).</li>
</ul></div>
`}};export{e as default};