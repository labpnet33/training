var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the AP join ladder`,hi:`Troubleshooting workflow: AP join ladder`},body:{en:`
<h3>Analogy: a doctor does not guess</h3>
<p>A good doctor follows a routine: ask where it hurts, measure the vital signs, order the right test and treat only after the cause is clear. Wireless troubleshooting works the same way. The most expensive habit is to start changing settings because a symptom looks familiar. The AP join ladder below gives you an order, a command for each step and a decision at each step. Use it every time.</p>

<h3>The ladder</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Join ladder">
<rect x="150" y="10" width="340" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="12">1. Is the AP registered? show ap summary</text>
<rect x="150" y="58" width="340" height="38" rx="8" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">2. Does the AP have a lease in VLAN 10? (port, PoE, DHCP)</text>
<rect x="150" y="106" width="340" height="38" rx="8" fill="#bae6fd"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">3. Does it know the controller? (option 43, DNS, primed)</text>
<rect x="150" y="154" width="340" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="12">4. Can it reach it? (gateway, trunk, ACL, UDP 5246/5247)</text>
<rect x="150" y="202" width="340" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="12">5. Does it trust it? (time, certificates; concept)</text>
<rect x="150" y="250" width="340" height="38" rx="8" fill="#fde68a"/><text x="320" y="274" text-anchor="middle" class="svg-ink" font-size="12">6. Is it allowed to radiate and serve? (country, tags, RF)</text>
<text x="320" y="318" text-anchor="middle" class="svg-muted" font-size="12">Stop at the first step that fails. Fix the owner of that step.</text>
</svg><p class="cap">Work top to bottom. Registered APs skip steps 2 to 5 and go to 6.</p></div>

<h3>Step by step, with the command and the owner</h3>
<table class="cmp"><tr><th>Step</th><th>Evidence command</th><th>If it fails, the owner is</th></tr>
<tr><td>1 Registered?</td><td>WLC1: show ap summary</td><td>Decides which branch to follow</td></tr>
<tr><td>2 Lease?</td><td>Switch: show vlan brief, show interfaces status; DHCP pool and AP console</td><td>SW1 port or R1 DHCP pool</td></tr>
<tr><td>3 Knows controller?</td><td>R1: show running-config | section dhcp</td><td>R1 (option 43) or DNS or AP priming</td></tr>
<tr><td>4 Reaches controller?</td><td>WLC1: ping the AP gateway; SW1: show interfaces trunk; any firewall rules</td><td>SW1 trunk, R1 routing, firewall or ACL</td></tr>
<tr><td>5 Trusts controller?</td><td>Controller log, clock</td><td>Time or certificates (concept)</td></tr>
<tr><td>6 Allowed to serve?</td><td>show ap summary (country), show ap tag summary, show wireless country configured</td><td>AP profile, tags, RF profile</td></tr>
</table>

<h3>Reading the symptoms</h3>
<p>The first command splits the problem in two. <b>Zero APs registered</b> points to steps 2 to 5: the AP never formed a control tunnel. <b>APs registered but no SSID</b> points to step 6 or to the WLAN mapping of the earlier module. Then use the next clue:</p>
<ul>
<li>All APs gone at the same moment: a shared dependency changed (trunk, gateway, DHCP, firewall, controller).</li>
<li>Only new APs fail: the DHCP hint, access port VLAN or option 43 for that pool is missing.</li>
<li>Only one AP fails: that cable, port, PoE or AP hardware.</li>
<li>APs registered, radios silent: country or RF profile shutdown, not the join.</li>
</ul>

<h3>The three lab faults mapped to the ladder</h3>
<div class="eg"><p><b>wl-ap-discovery.</b> Step 1: zero APs. Step 2: APs hold 10.10.10.x leases (the AP console confirms). Step 3: R1 pool has no option 43. Owner: R1. Fix: option 43 hex f104.0a0a.630a, then ip dhcp on each AP.<br><b>wl-mgmt-trunk.</b> Step 1: zero APs, but they had joined before (recent change). Step 3 passes (option 43 present). Step 4: ping 10.10.99.1 from WLC1 fails; show interfaces trunk lists only 20,40. Owner: SW1. Fix: allowed vlan add 99.<br><b>wl-country-profile.</b> Step 1: both APs Registered. Step 6: Country column US versus allowed list IN. Owner: the AP profile on WLC1. Fix: country IN in AP-PROF-US.</p></div>

<h3>Evidence before change</h3>
<p>Take a snapshot before you edit anything: copy show ap summary, the relevant running-config section and the log. Change one thing at a time. After the change, repeat the first command to prove the result. This habit protects you from the classic trap: two fixes at once leave you unsure which one worked, and one of them may have been harmful.</p>
<pre class="out">WLC1# show logging | include AP
%CAPWAP-5-JOIN_REQ: Join request received from 10.10.10.21
<span class="hl">%CAPWAP-3-ERRORLOG: Discovery request ignored: no valid controller address configured</span></pre>
<p>Log messages are hints, not proof. They vary by software version. Use them to choose the next command, then confirm with the configuration or state.</p>

<h3>Tools and their limits</h3>
<ul>
<li>Controller: show ap summary, show ap tag summary, show wireless management interface, show wireless country configured, show logging.</li>
<li>Switch: show interfaces trunk, show vlan brief, show interfaces status, show power inline.</li>
<li>Router: show running-config | section dhcp, show ip dhcp binding, ping.</li>
<li>AP console: show IP address and CAPWAP state; in the lab, ip dhcp renews a lease.</li>
</ul>
<p>Packet captures and RA traces on the controller are real and very useful for DTLS or CAPWAP errors, but they are <b>not simulated in the lab</b>. Coming up: module wl-diag (Troubleshooting like a CCIE).</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Starting at step 6 because the user says "no Wi-Fi". (2) Rebooting everything to see what happens. (3) Fixing on the wrong device (for example adding VLAN 99 on the controller when SW1 owns the trunk). (4) Declaring victory without proving with show ap summary and a client test.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often give you a symptom and ask the first command or the owning device. Think: registered or not, then reachability versus policy. "APs registered but no SSID" is a tag, policy or country problem, never DHCP.</p></div>

<div class="scn"><h4>Four tickets, one root cause</h4><p>At 09:10 a retailer reported four unrelated stores with no Wi-Fi. The team started four investigations. A fifth engineer asked a different question: what changed overnight? A firewall policy push had dropped UDP 5246 for a shared management subnet. One rule change restored all four stores.</p><p><b>Lesson:</b> when several APs fail together, look for the shared dependency before you chase symptoms.</p></div>

<div class="iv"><p class="q">"How do you troubleshoot an AP that will not join?"</p><p>Confirm it is really unregistered with show ap summary. Then walk the ladder: link, PoE and VLAN, DHCP lease, controller knowledge (option 43, DNS, primed), reachability of UDP 5246 and 5247 (gateway, trunk, ACL), trust (time, certificates) and finally country and tags. State that you collect evidence first, change one thing on the owning device and verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a fixed ladder: registered, lease, knows controller, reaches it, trusts it, allowed to serve.</li>
<li>Zero APs means a join problem; registered APs with no SSID means policy, tag or country.</li>
<li>Simultaneous failure means a shared dependency changed.</li>
<li>Collect evidence, change one thing, repair on the owning device, prove the result.</li>
<li>Packet captures and certificate details are concept only in the lab.</li>
</ul></div>
`,hi:`
<h3>Analogy: doctor andaaza nahi lagata</h3>
<p>Achha doctor ek routine follow karta hai: kahan dard hai poochho, vital signs naapo, sahi test karao aur cause clear hone ke baad hi treat karo. Wireless troubleshooting bhi aise hi chalti hai. Sabse mehengi aadat hai symptom familiar lagne par settings badalna shuru kar dena. Neeche ki AP join ladder aapko order, har step ka command aur har step ka decision deti hai. Har baar ise use karo.</p>

<h3>Ladder</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Join ladder">
<rect x="150" y="10" width="340" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="12">1. Kya AP registered hai? show ap summary</text>
<rect x="150" y="58" width="340" height="38" rx="8" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">2. Kya AP ko VLAN 10 mein lease mila? (port, PoE, DHCP)</text>
<rect x="150" y="106" width="340" height="38" rx="8" fill="#bae6fd"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">3. Kya use controller pata hai? (option 43, DNS, primed)</text>
<rect x="150" y="154" width="340" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="12">4. Kya woh pahunch sakta hai? (gateway, trunk, ACL, UDP 5246/5247)</text>
<rect x="150" y="202" width="340" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="12">5. Kya woh trust karta hai? (time, certificates; concept)</text>
<rect x="150" y="250" width="340" height="38" rx="8" fill="#fde68a"/><text x="320" y="274" text-anchor="middle" class="svg-ink" font-size="12">6. Kya radiate aur serve karne ki ijazat hai? (country, tags, RF)</text>
<text x="320" y="318" text-anchor="middle" class="svg-muted" font-size="12">Pehle fail hone wale step par ruko. Us step ke owner ko fix karo.</text>
</svg><p class="cap">Upar se neeche kaam karo. Registered APs steps 2 se 5 skip karke 6 par jaate hain.</p></div>

<h3>Step by step, command aur owner ke saath</h3>
<table class="cmp"><tr><th>Step</th><th>Evidence command</th><th>Fail ho to owner hai</th></tr>
<tr><td>1 Registered?</td><td>WLC1: show ap summary</td><td>Decide karta hai kaun si branch follow karni hai</td></tr>
<tr><td>2 Lease?</td><td>Switch: show vlan brief, show interfaces status; DHCP pool aur AP console</td><td>SW1 port ya R1 DHCP pool</td></tr>
<tr><td>3 Controller pata hai?</td><td>R1: show running-config | section dhcp</td><td>R1 (option 43) ya DNS ya AP priming</td></tr>
<tr><td>4 Controller tak pahunchta hai?</td><td>WLC1: AP gateway ping karo; SW1: show interfaces trunk; koi firewall rules</td><td>SW1 trunk, R1 routing, firewall ya ACL</td></tr>
<tr><td>5 Controller par trust?</td><td>Controller log, clock</td><td>Time ya certificates (concept)</td></tr>
<tr><td>6 Serve karne ki ijazat?</td><td>show ap summary (country), show ap tag summary, show wireless country configured</td><td>AP profile, tags, RF profile</td></tr>
</table>

<h3>Symptoms padhna</h3>
<p>Pehla command problem ko do hisson mein baant deta hai. <b>Zero APs registered</b> steps 2 se 5 ki taraf ishara karta hai: AP ne control tunnel banaya hi nahi. <b>APs registered lekin SSID nahi</b> step 6 ki taraf ya pichhle module ke WLAN mapping ki taraf ishara karta hai. Phir agla clue use karo:</p>
<ul>
<li>Saare APs ek hi moment par gayab: koi shared dependency badli (trunk, gateway, DHCP, firewall, controller).</li>
<li>Sirf naye APs fail: us pool ka DHCP hint, access port VLAN ya option 43 missing hai.</li>
<li>Sirf ek AP fail: woh cable, port, PoE ya AP hardware.</li>
<li>APs registered, radios chup: country ya RF profile shutdown, join nahi.</li>
</ul>

<h3>Teen lab faults ladder par</h3>
<div class="eg"><p><b>wl-ap-discovery.</b> Step 1: zero APs. Step 2: APs ke paas 10.10.10.x leases hain (AP console confirm karta hai). Step 3: R1 pool mein option 43 nahi. Owner: R1. Fix: option 43 hex f104.0a0a.630a, phir har AP par ip dhcp.<br><b>wl-mgmt-trunk.</b> Step 1: zero APs, lekin pehle join the (recent change). Step 3 pass (option 43 maujood). Step 4: WLC1 se ping 10.10.99.1 fail; show interfaces trunk sirf 20,40 dikhata hai. Owner: SW1. Fix: allowed vlan add 99.<br><b>wl-country-profile.</b> Step 1: dono APs Registered. Step 6: Country column US versus allowed list IN. Owner: WLC1 par AP profile. Fix: AP-PROF-US mein country IN.</p></div>

<h3>Change se pehle evidence</h3>
<p>Kuch edit karne se pehle snapshot lo: show ap summary, relevant running-config section aur log copy karo. Ek baar mein ek cheez badlo. Change ke baad pehla command dobara chalao taaki result prove ho. Yeh aadat classic trap se bachati hai: ek saath do fixes se aapko pata nahi chalta kaun sa kaam kiya, aur ek harmful bhi ho sakta hai.</p>
<pre class="out">WLC1# show logging | include AP
%CAPWAP-5-JOIN_REQ: Join request received from 10.10.10.21
<span class="hl">%CAPWAP-3-ERRORLOG: Discovery request ignored: no valid controller address configured</span></pre>
<p>Log messages hints hain, proof nahi. Yeh software version ke hisaab se badalte hain. Inhe agla command chunne ke liye use karo, phir configuration ya state se confirm karo.</p>

<h3>Tools aur unki limits</h3>
<ul>
<li>Controller: show ap summary, show ap tag summary, show wireless management interface, show wireless country configured, show logging.</li>
<li>Switch: show interfaces trunk, show vlan brief, show interfaces status, show power inline.</li>
<li>Router: show running-config | section dhcp, show ip dhcp binding, ping.</li>
<li>AP console: IP address aur CAPWAP state dikhana; lab mein ip dhcp lease renew karta hai.</li>
</ul>
<p>Controller par packet captures aur RA traces real hain aur DTLS ya CAPWAP errors ke liye bahut useful hain, lekin yeh <b>lab mein simulate nahi hote</b>. Aage aane wala module: wl-diag (Troubleshooting like a CCIE).</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Step 6 se shuru karna kyunki user kehta hai "Wi-Fi nahi". (2) Dekhne ke liye sab kuch reboot karna. (3) Galat device par fix karna (jaise controller par VLAN 99 add karna jabki trunk SW1 ka hai). (4) show ap summary aur client test se prove kiye bina jeet declare karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions aksar symptom dete hain aur pehla command ya owning device poochhte hain. Socho: registered ya nahi, phir reachability versus policy. "APs registered lekin SSID nahi" tag, policy ya country problem hai, kabhi DHCP nahi.</p></div>

<div class="scn"><h4>Chaar tickets, ek root cause</h4><p>09:10 par ek retailer ne chaar unrelated stores mein Wi-Fi na hone ki report ki. Team ne chaar investigations shuru kiye. Paanchve engineer ne alag sawaal poochha: raat ko kya badla? Firewall policy push ne ek shared management subnet ke liye UDP 5246 drop kar diya tha. Ek rule change ne chaaron stores restore kar diye.</p><p><b>Seekh:</b> jab kai APs saath fail hon, symptoms ke peeche bhagne se pehle shared dependency dhundo.</p></div>

<div class="iv"><p class="q">"Jo AP join nahi ho raha usse troubleshoot kaise karoge?"</p><p>Pehle show ap summary se confirm karo ki woh sach mein unregistered hai. Phir ladder chalo: link, PoE aur VLAN, DHCP lease, controller knowledge (option 43, DNS, primed), UDP 5246 aur 5247 ki reachability (gateway, trunk, ACL), trust (time, certificates) aur ant mein country aur tags. Kaho ki pehle evidence collect karte ho, owning device par ek cheez badalte ho aur verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed ladder use karo: registered, lease, controller pata, pahunchta, trust, serve ki ijazat.</li>
<li>Zero APs ka matlab join problem; registered APs aur SSID nahi ka matlab policy, tag ya country.</li>
<li>Ek saath failure ka matlab shared dependency badli.</li>
<li>Evidence collect karo, ek cheez badlo, owning device par repair karo, result prove karo.</li>
<li>Packet captures aur certificate details lab mein sirf concept hain.</li>
</ul></div>
`}};export{e as default};