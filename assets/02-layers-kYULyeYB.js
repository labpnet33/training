var e={id:`layers`,h:{en:`The layers of a Wi-Fi session and the command that proves each one`,hi:`Wi-Fi session ki layers aur har layer ko prove karne wala command`},body:{en:`
<p>A courier delivers a parcel in stages: the shop packs it, the truck collects it, the sorting hub routes it, the van brings it to your street, you open the door. If the parcel is late, the tracking page tells you <b>which stage</b> it is stuck in. A Wi-Fi connection also moves through stages. Wireless troubleshooting is the art of reading the tracking page.</p>

<h3>The ordered stages</h3>
<p>A client that "cannot connect" is stuck at one of these stages. They always happen in this order, so a failure at stage 4 proves that stages 1 to 3 passed.</p>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Wi-Fi session layers">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="40" y="34" class="svg-ink" font-size="13">1 AP and RF: AP joined, radio on, SSID heard, signal good</text>
<rect x="20" y="54" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="40" y="78" class="svg-ink" font-size="13">2 WLAN and policy: WLAN enabled, policy tag maps it, policy enabled</text>
<rect x="20" y="98" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="40" y="122" class="svg-ink" font-size="13">3 Association and Layer 2 authentication: PSK, SAE or 802.1X</text>
<rect x="20" y="142" width="600" height="38" rx="6" fill="#fde68a"/><text x="40" y="166" class="svg-ink" font-size="13">4 Policy placement: VLAN exists, switching mode fits the AP mode</text>
<rect x="20" y="186" width="600" height="38" rx="6" fill="#fed7aa"/><text x="40" y="210" class="svg-ink" font-size="13">5 IP learn: DHCP offer, gateway, DNS</text>
<rect x="20" y="230" width="600" height="38" rx="6" fill="#e2e8f0"/><text x="40" y="254" class="svg-ink" font-size="13">6 Run: traffic flows; services (ACL, QoS, roaming) behave</text>
<text x="320" y="289" text-anchor="middle" class="svg-muted" font-size="12">Before all six: the AP must have joined the controller (CAPWAP)</text>
</svg><p class="cap">Six client stages. The AP join sits underneath all of them and is covered in chapter 8.</p></div>

<h3>Which tool proves which stage</h3>
<table class="cmp"><tr><th>Stage</th><th>Question</th><th>Proof</th></tr>
<tr><td>AP join</td><td>Is the AP registered?</td><td><code>show ap summary</code>, <code>show ap join stats summary</code></td></tr>
<tr><td>1 AP and RF</td><td>Is the radio on and heard?</td><td><code>show ap dot11 5ghz summary</code>, client scan</td></tr>
<tr><td>2 WLAN and policy</td><td>Is the SSID served by this AP?</td><td><code>show wlan summary</code>, <code>show ap tag summary</code>, <code>show wireless tag policy detailed</code></td></tr>
<tr><td>3 Authentication</td><td>Did the key or EAP succeed?</td><td>Radioactive Trace, <code>show aaa servers</code></td></tr>
<tr><td>4 Placement</td><td>Is the VLAN known?</td><td><code>show vlan brief</code>, <code>show wireless profile policy detailed</code>, trace</td></tr>
<tr><td>5 IP learn</td><td>Did DHCP answer?</td><td>Embedded packet capture, trace, <code>show wireless client mac-address ... detail</code></td></tr>
<tr><td>6 Run</td><td>Why was it deleted?</td><td><code>show wireless stats client delete reasons</code></td></tr></table>

<h3>The scope-to-layer shortcut</h3>
<ul>
<li><b>Everybody on every SSID, one AP</b>: stages AP join or RF on that AP (tags, radio, power).</li>
<li><b>Everybody on one SSID</b>: WLAN, policy, AAA server or the VLAN and DHCP of that SSID.</li>
<li><b>Everybody on the whole network</b>: the controller, the uplink trunk or the management VLAN.</li>
<li><b>One client, all SSIDs</b>: the client (driver, stored credentials, 5 GHz support) or an exclusion entry.</li>
<li><b>One client, one SSID</b>: that user's credentials, a per-user policy or the client MAC.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> LAPTOP1 reports "connected, no internet". You look at stage 5. A real laptop shows a self-assigned 169.254.x.x address, and in the lab <code>wifi status</code> shows IP address: none. Both mean DHCP never answered. You have proven stages 1 to 4 passed (the client is associated and authenticated; otherwise it would not even show an AP). The next tool is a packet capture at the controller uplink, not a change of the WLAN key.</p></div>

<h3>Reading a failed stage like a detective</h3>
<p>Two rules make the table practical.</p>
<ol>
<li><b>The last stage reached is the evidence.</b> A client that shows an AP and a BSSID reached association. A client that shows nothing, not even the SSID, never got a probe response: stage 1 or 2.</li>
<li><b>Absence of an answer is also evidence.</b> "DHCP Discover sent, no Offer" proves the request left the controller and no server answered: the fault is beyond the controller, not in the WLAN.</li>
</ol>
<pre class="out">LAPTOP1# wifi scan
SSID              BSSID              Band    Ch   Signal   Security              AP
NK-STAFF          0050.56aa.1001     5 GHz   36   -52 dBm  WPA2-PSK              AP1
LAPTOP1# <span class="hl">wifi status</span>
SSID        : NK-STAFF
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -52 dBm
IP address  : <span class="hl">none</span></pre>
<p>The scan shows the SSID, so stages 1 and 2 pass. The status shows an AP, so association succeeded. The missing IP puts you in stage 5.</p>

<div class="warn"><p><b>Common mistake.</b> Starting at the top of the table every time. If the client already associates, checking AP power is wasted time. Start at the layer the symptom proves.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Client connects but cannot reach the internet" is <b>not</b> an authentication problem. Authentication already succeeded. Likewise "SSID not visible" is not a RADIUS problem: no client ever reached authentication.</p></div>

<div class="scn"><h4>The invisible SSID</h4><p>After a weekend change, staff could not find NK-STAFF on floor 2. Floor 1 was fine. The scope pointed at one AP, so the engineer checked <code>show ap tag summary</code> and found AP2 using <code>default-policy-tag</code> with Tag Source "Default": a reload had lost its static tag. One command (<code>ap name AP2 policy-tag PT-CAMPUS</code>) restored the SSID; AP2 rejoined briefly and served NK-STAFF again.</p><p><b>Lesson:</b> scope told her the layer; a show command proved it; one change fixed it. No trace was needed because the client never reached association.</p></div>

<div class="iv"><p class="q">"How do you decide between a trace and a packet capture?"</p><p>A trace shows the controller's own view of one client's state machine; use it when the client reaches the controller and you need the reason it was rejected. A capture shows what really crossed a wire; use it to prove a packet never left or never came back, for example a DHCP Discover with no Offer. Often you use both.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A session moves through ordered stages; the last stage reached is your evidence.</li>
<li>Scope (one client, one AP, one SSID, all) points to the layer before any command.</li>
<li>Each stage has one best proving command or tool.</li>
<li>No answer is evidence too: a Discover without an Offer proves the fault is beyond the controller.</li>
<li>The AP join sits under all stages; if the AP is not joined, nothing above it works.</li>
</ul></div>
`,hi:`
<p>Courier parcel ko stages mein deliver karta hai: shop pack karta hai, truck collect karta hai, sorting hub route karta hai, van aapki gali tak laati hai, aap darwaza kholte ho. Parcel late ho to tracking page batata hai ki woh <b>kaunse stage</b> mein atka hai. Wi-Fi connection bhi stages se guzarta hai. Wireless troubleshooting tracking page padhne ki kala hai.</p>

<h3>Ordered stages</h3>
<p>Jo client "connect nahi ho paata" woh in stages mein se kisi ek par atka hota hai. Yeh hamesha isi order mein hote hain, isliye stage 4 par failure prove karta hai ki stage 1 se 3 pass hue.</p>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Wi-Fi session layers">
<rect x="20" y="10" width="600" height="38" rx="6" fill="#bae6fd"/><text x="40" y="34" class="svg-ink" font-size="13">1 AP aur RF: AP joined, radio on, SSID sunai de, signal achha</text>
<rect x="20" y="54" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="40" y="78" class="svg-ink" font-size="13">2 WLAN aur policy: WLAN enabled, policy tag map kare, policy enabled</text>
<rect x="20" y="98" width="600" height="38" rx="6" fill="#ddd6fe"/><text x="40" y="122" class="svg-ink" font-size="13">3 Association aur Layer 2 authentication: PSK, SAE ya 802.1X</text>
<rect x="20" y="142" width="600" height="38" rx="6" fill="#fde68a"/><text x="40" y="166" class="svg-ink" font-size="13">4 Policy placement: VLAN exist kare, switching mode AP mode se mile</text>
<rect x="20" y="186" width="600" height="38" rx="6" fill="#fed7aa"/><text x="40" y="210" class="svg-ink" font-size="13">5 IP learn: DHCP offer, gateway, DNS</text>
<rect x="20" y="230" width="600" height="38" rx="6" fill="#e2e8f0"/><text x="40" y="254" class="svg-ink" font-size="13">6 Run: traffic chale; services (ACL, QoS, roaming) theek rahein</text>
<text x="320" y="289" text-anchor="middle" class="svg-muted" font-size="12">Chhaon se pehle: AP ne controller join kiya hona chahiye (CAPWAP)</text>
</svg><p class="cap">Chhe client stages. AP join sabke neeche baitha hai aur chapter 8 mein cover hota hai.</p></div>

<h3>Kaunsa tool kaunsa stage prove karta hai</h3>
<table class="cmp"><tr><th>Stage</th><th>Sawaal</th><th>Proof</th></tr>
<tr><td>AP join</td><td>AP registered hai?</td><td><code>show ap summary</code>, <code>show ap join stats summary</code></td></tr>
<tr><td>1 AP aur RF</td><td>Radio on hai aur sunai deta hai?</td><td><code>show ap dot11 5ghz summary</code>, client scan</td></tr>
<tr><td>2 WLAN aur policy</td><td>Kya yeh AP SSID serve karta hai?</td><td><code>show wlan summary</code>, <code>show ap tag summary</code>, <code>show wireless tag policy detailed</code></td></tr>
<tr><td>3 Authentication</td><td>Key ya EAP succeed hua?</td><td>Radioactive Trace, <code>show aaa servers</code></td></tr>
<tr><td>4 Placement</td><td>VLAN pata hai?</td><td><code>show vlan brief</code>, <code>show wireless profile policy detailed</code>, trace</td></tr>
<tr><td>5 IP learn</td><td>DHCP ne jawab diya?</td><td>Embedded packet capture, trace, <code>show wireless client mac-address ... detail</code></td></tr>
<tr><td>6 Run</td><td>Delete kyun hua?</td><td><code>show wireless stats client delete reasons</code></td></tr></table>

<h3>Scope se layer ka shortcut</h3>
<ul>
<li><b>Ek AP par sab log, har SSID</b>: stage AP join ya us AP ka RF (tags, radio, power).</li>
<li><b>Ek SSID par sab log</b>: WLAN, policy, AAA server ya us SSID ka VLAN aur DHCP.</li>
<li><b>Poore network par sab log</b>: controller, uplink trunk ya management VLAN.</li>
<li><b>Ek client, saare SSID</b>: client (driver, stored credentials, 5 GHz support) ya exclusion entry.</li>
<li><b>Ek client, ek SSID</b>: us user ke credentials, per-user policy ya client MAC.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> LAPTOP1 kehta hai "connected, internet nahi". Aap stage 5 dekhte ho. Real laptop self-assigned 169.254.x.x address dikhata hai, aur lab mein <code>wifi status</code> IP address: none dikhata hai. Dono ka matlab DHCP ne kabhi jawab nahi diya. Aapne prove kar diya ki stage 1 se 4 pass hue (client associated aur authenticated hai; warna AP bhi nahi dikhta). Agla tool controller uplink par packet capture hai, WLAN key badalna nahi.</p></div>

<h3>Failed stage ko detective ki tarah padhna</h3>
<p>Do rules table ko practical banate hain.</p>
<ol>
<li><b>Aakhri reach kiya hua stage hi evidence hai.</b> Jo client AP aur BSSID dikhata hai woh association tak pahuncha. Jo client kuch nahi dikhata, SSID bhi nahi, use probe response nahi mila: stage 1 ya 2.</li>
<li><b>Jawab ka na aana bhi evidence hai.</b> "DHCP Discover bheja, Offer nahi aaya" prove karta hai ki request controller se nikli aur koi server nahi bola: fault controller ke aage hai, WLAN mein nahi.</li>
</ol>
<pre class="out">LAPTOP1# wifi scan
SSID              BSSID              Band    Ch   Signal   Security              AP
NK-STAFF          0050.56aa.1001     5 GHz   36   -52 dBm  WPA2-PSK              AP1
LAPTOP1# <span class="hl">wifi status</span>
SSID        : NK-STAFF
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -52 dBm
IP address  : <span class="hl">none</span></pre>
<p>Scan SSID dikhata hai, to stage 1 aur 2 pass. Status AP dikhata hai, to association succeed hua. IP ka na hona aapko stage 5 mein rakhta hai.</p>

<div class="warn"><p><b>Common mistake.</b> Har baar table ke upar se shuru karna. Agar client already associate karta hai to AP power check karna time waste hai. Us layer se shuru karo jo symptom prove karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Client connect hota hai lekin internet tak nahi pahunchta" <b>authentication</b> problem nahi hai. Authentication pehle hi succeed ho chuka. Isi tarah "SSID visible nahi" RADIUS problem nahi hai: koi client authentication tak pahuncha hi nahi.</p></div>

<div class="scn"><h4>Invisible SSID</h4><p>Weekend change ke baad floor 2 par staff ko NK-STAFF nahi mila. Floor 1 theek tha. Scope ek AP ki taraf point kar raha tha, to engineer ne <code>show ap tag summary</code> check kiya aur AP2 ko <code>default-policy-tag</code> par paya, Tag Source "Default": reload mein uska static tag chala gaya tha. Ek command (<code>ap name AP2 policy-tag PT-CAMPUS</code>) ne SSID wapas kar diya; AP2 thodi der rejoin hua aur NK-STAFF dubara serve karne laga.</p><p><b>Lesson:</b> scope ne layer batayi; show command ne prove kiya; ek change ne fix kiya. Trace ki zaroorat nahi padi kyunki client association tak pahuncha hi nahi tha.</p></div>

<div class="iv"><p class="q">"Trace aur packet capture mein se kaise chunte ho?"</p><p>Trace ek client ki state machine ka controller ka apna view dikhata hai; tab use karo jab client controller tak pahunchta hai aur aapko reject hone ka reason chahiye. Capture dikhata hai ki wire par asal mein kya cross hua; tab use karo jab prove karna ho ki packet kabhi nikla nahi ya wapas nahi aaya, jaise DHCP Discover bina Offer ke. Aksar dono use hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Session ordered stages se guzarta hai; aakhri reach kiya stage aapka evidence hai.</li>
<li>Scope (ek client, ek AP, ek SSID, sab) command se pehle layer point karta hai.</li>
<li>Har stage ka ek best proving command ya tool hota hai.</li>
<li>Jawab na aana bhi evidence hai: Offer ke bina Discover prove karta hai ki fault controller ke aage hai.</li>
<li>AP join sab stages ke neeche hai; AP joined nahi to uske upar kuch kaam nahi karta.</li>
</ul></div>
`}};export{e as default};