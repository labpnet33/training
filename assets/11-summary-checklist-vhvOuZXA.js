var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one picture</h3>
<p>A lightweight AP is only as good as its relationship with the controller. It must <b>know</b> the controller (DHCP option 43, DNS, primed), <b>reach</b> it (VLAN 10 to VLAN 99 through R1 and the SW1 trunk, UDP 5246 and 5247 open), <b>trust</b> it (DTLS and certificates, correct time), and then be <b>allowed to serve</b> (country, tags, RF). Each step has an owner, and each owner has one or two commands.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary">
<rect x="10" y="30" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="58" text-anchor="middle" class="svg-ink" font-size="13">Know</text><text x="70" y="80" text-anchor="middle" class="svg-muted" font-size="11">option 43 / DNS</text>
<rect x="140" y="30" width="120" height="70" rx="8" fill="#bae6fd"/><text x="200" y="58" text-anchor="middle" class="svg-ink" font-size="13">Reach</text><text x="200" y="80" text-anchor="middle" class="svg-muted" font-size="11">trunk, gateway</text>
<rect x="270" y="30" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="330" y="58" text-anchor="middle" class="svg-ink" font-size="13">Trust</text><text x="330" y="80" text-anchor="middle" class="svg-muted" font-size="11">DTLS, time</text>
<rect x="400" y="30" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="455" y="58" text-anchor="middle" class="svg-ink" font-size="13">Join</text><text x="455" y="80" text-anchor="middle" class="svg-muted" font-size="11">Registered</text>
<rect x="520" y="30" width="110" height="70" rx="8" fill="#fde68a"/><text x="575" y="58" text-anchor="middle" class="svg-ink" font-size="13">Serve</text><text x="575" y="80" text-anchor="middle" class="svg-muted" font-size="11">country, tags</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Labs: discovery (Know), trunk (Reach), country (Serve)</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Trust is concept only in the lab</text>
</svg><p class="cap">Five stages from plugging in the AP to a working SSID.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready for the module exam and interviews when you can do each of these without notes:</p>
<ul>
<li>Explain split MAC and name what runs on the AP and what runs on the controller.</li>
<li>State CAPWAP ports: control UDP 5246, data UDP 5247, and which one is always DTLS-protected.</li>
<li>List the join states: discovery, DTLS, join, image data, config, run.</li>
<li>List discovery methods and say which cross subnets (all except broadcast).</li>
<li>List controller selection order: primary, secondary, tertiary, backups, master, least loaded.</li>
<li>Encode a controller IP into option 43 and write the R1 command.</li>
<li>Explain why AP VLAN and controller VLAN differ and how R1 connects them.</li>
<li>Read show interfaces trunk and add a missing VLAN without removing others.</li>
<li>Explain regulatory domain versus country code and what a country mismatch does.</li>
<li>Name the three tags and what each points to.</li>
<li>Walk the join ladder and name the owner of each step.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AP profile</dt><dd>Controller object with AP-level settings such as country, attached through a site tag.</dd>
<dt>CAPWAP</dt><dd>Tunnel protocol between AP and controller: UDP 5246 control, UDP 5247 data.</dd>
<dt>DTLS</dt><dd>TLS for UDP, protects the control tunnel.</dd>
<dt>Option 43</dt><dd>Vendor-specific DHCP option carrying controller IPs (Cisco type f1).</dd>
<dt>Primed AP</dt><dd>AP preloaded with controller names or IPs.</dd>
<dt>MIC / LSC</dt><dd>Manufacturer or locally issued AP certificate.</dd>
<dt>Regulatory domain</dt><dd>Hardware region class of an AP.</dd>
<dt>Country code</dt><dd>Configured country that selects legal channels and power.</dd>
<dt>Site tag</dt><dd>Tag that points to an AP profile.</dd>
<dt>Split MAC</dt><dd>Real-time work on the AP, management on the controller.</dd>
<dt>Wireless management interface</dt><dd>The controller SVI used for AP join and management (Vlan99 in the lab).</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>CAPWAP ports</td><td>5246 control (DTLS), 5247 data</td></tr>
<tr><td>Option 43 for 10.10.99.10</td><td>f104.0a0a.630a (type f1, length 04)</td></tr>
<tr><td>DNS name</td><td>CISCO-CAPWAP-CONTROLLER in the AP domain</td></tr>
<tr><td>Broadcast discovery</td><td>Only inside the AP's own subnet</td></tr>
<tr><td>Join order</td><td>DHCP, discovery, DTLS, join, image, config, run</td></tr>
<tr><td>Trunk fix</td><td>switchport trunk allowed vlan add 99</td></tr>
<tr><td>Radios off</td><td>AP country not in the controller allowed list</td></tr>
<tr><td>Default policy tag</td><td>No WLANs, so no SSID</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! controller</span>
show ap summary
show ap tag summary
show wireless management interface
show wireless country configured
show logging
ap profile AP-PROF-US  /  country IN
wireless management interface Vlan99

<span class="c">! router R1</span>
show running-config | section dhcp
ip dhcp pool AP-POOL  /  option 43 hex f104.0a0a.630a

<span class="c">! switch SW1</span>
show interfaces trunk
interface GigabitEthernet0/1  /  switchport trunk allowed vlan add 99

<span class="c">! lab AP console and client</span>
ip dhcp
wifi status  /  ping 10.10.60.20</pre>

<h3>Concept only (not simulated in the lab)</h3>
<p>FlexConnect and local switching, certificates, trustpoints and AP authorization, HA SSO and N+1, DNS discovery, packet captures and RA traces, and real RRM. Coming up: wl-flex (FlexConnect) and wl-mobility (Mobility and high availability). They are on the exam and in interviews, so know the idea even though the simulator does not model them.</p>

<div class="warn"><p><b>Common mistakes to avoid.</b> Fixing on the wrong device, replacing instead of adding trunk VLANs, widening the country list to hide a profile error, forgetting to renew AP leases, and declaring success without show ap summary.</p></div>
<div class="exam"><p><b>Exam trap.</b> Zero APs registered versus registered APs without SSID decides your branch of the ladder. Do not mix discovery (finding candidates) with selection (choosing one).</p></div>

<div class="scn"><h4>The final interview whiteboard</h4><p>In a final interview a candidate was told: "Floor 3 APs do not show up on the controller after a VLAN re-design". He drew the ladder, asked whether APs held leases, asked what changed, tested the controller gateway, checked the trunk and found VLAN 99 pruned. The interviewer stopped him after four minutes: he had the job.</p><p><b>Lesson:</b> a calm, ordered method impresses more than memorised commands.</p></div>

<div class="iv"><p class="q">"Summarise how a lightweight AP comes into service."</p><p>It boots, gets an IP in the AP VLAN, learns controller addresses (option 43, DNS, primed), picks one, builds the DTLS-protected CAPWAP control tunnel on UDP 5246, joins, downloads an image if needed, receives config including country and tags, and enters Run, serving SSIDs through tags and sending client data over UDP 5247.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know, reach, trust, join and serve: five stages, each with an owner.</li>
<li>Option 43, trunk allowed list and AP profile country are the three lab repairs.</li>
<li>Always verify with show ap summary and a client test.</li>
<li>Know the concept-only topics for the exam even though they are not simulated.</li>
</ul></div>
`,hi:`
<h3>Module ek picture mein</h3>
<p>Lightweight AP utna hi achha hai jitna controller ke saath uska relationship. Use controller ko <b>jaanna</b> hoga (DHCP option 43, DNS, primed), uske tak <b>pahunchna</b> hoga (VLAN 10 se VLAN 99, R1 aur SW1 trunk ke zariye, UDP 5246 aur 5247 khule), us par <b>trust</b> karna hoga (DTLS aur certificates, sahi time), aur phir <b>serve karne ki ijazat</b> milni chahiye (country, tags, RF). Har step ka owner hai, aur har owner ke paas ek ya do commands hain.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary">
<rect x="10" y="30" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="58" text-anchor="middle" class="svg-ink" font-size="13">Jaano</text><text x="70" y="80" text-anchor="middle" class="svg-muted" font-size="11">option 43 / DNS</text>
<rect x="140" y="30" width="120" height="70" rx="8" fill="#bae6fd"/><text x="200" y="58" text-anchor="middle" class="svg-ink" font-size="13">Pahuncho</text><text x="200" y="80" text-anchor="middle" class="svg-muted" font-size="11">trunk, gateway</text>
<rect x="270" y="30" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="330" y="58" text-anchor="middle" class="svg-ink" font-size="13">Trust</text><text x="330" y="80" text-anchor="middle" class="svg-muted" font-size="11">DTLS, time</text>
<rect x="400" y="30" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="455" y="58" text-anchor="middle" class="svg-ink" font-size="13">Join</text><text x="455" y="80" text-anchor="middle" class="svg-muted" font-size="11">Registered</text>
<rect x="520" y="30" width="110" height="70" rx="8" fill="#fde68a"/><text x="575" y="58" text-anchor="middle" class="svg-ink" font-size="13">Serve</text><text x="575" y="80" text-anchor="middle" class="svg-muted" font-size="11">country, tags</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Labs: discovery (Jaano), trunk (Pahuncho), country (Serve)</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Trust lab mein sirf concept hai</text>
</svg><p class="cap">AP plug karne se working SSID tak paanch stages.</p></div>

<h3>Can-do checklist</h3>
<p>Aap module exam aur interviews ke liye tab ready ho jab bina notes ke yeh sab kar sako:</p>
<ul>
<li>Split MAC explain karo aur batao AP par kya chalta hai aur controller par kya.</li>
<li>CAPWAP ports batao: control UDP 5246, data UDP 5247, aur kaun sa hamesha DTLS-protected hai.</li>
<li>Join states list karo: discovery, DTLS, join, image data, config, run.</li>
<li>Discovery methods list karo aur batao kaun subnets cross karte hain (broadcast ke alawa sab).</li>
<li>Controller selection order list karo: primary, secondary, tertiary, backups, master, least loaded.</li>
<li>Controller IP ko option 43 mein encode karo aur R1 command likho.</li>
<li>Explain karo AP VLAN aur controller VLAN alag kyun hain aur R1 unhe kaise jodta hai.</li>
<li>show interfaces trunk padho aur doosre VLANs hataye bina missing VLAN add karo.</li>
<li>Regulatory domain versus country code explain karo aur country mismatch kya karta hai.</li>
<li>Teen tags ke naam aur har ek kiski taraf point karta hai batao.</li>
<li>Join ladder chalo aur har step ka owner batao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AP profile</dt><dd>Controller object jisme country jaisi AP-level settings hoti hain, site tag se attach hota hai.</dd>
<dt>CAPWAP</dt><dd>AP aur controller ke beech tunnel protocol: UDP 5246 control, UDP 5247 data.</dd>
<dt>DTLS</dt><dd>UDP ke liye TLS, control tunnel ko protect karta hai.</dd>
<dt>Option 43</dt><dd>Vendor-specific DHCP option jo controller IPs carry karta hai (Cisco type f1).</dd>
<dt>Primed AP</dt><dd>AP jisme controller names ya IPs pehle se load hain.</dd>
<dt>MIC / LSC</dt><dd>Manufacturer ya locally issued AP certificate.</dd>
<dt>Regulatory domain</dt><dd>AP ka hardware region class.</dd>
<dt>Country code</dt><dd>Configured country jo legal channels aur power chunti hai.</dd>
<dt>Site tag</dt><dd>Tag jo AP profile ki taraf point karta hai.</dd>
<dt>Split MAC</dt><dd>Real-time kaam AP par, management controller par.</dd>
<dt>Wireless management interface</dt><dd>Controller SVI jo AP join aur management ke liye use hota hai (lab mein Vlan99).</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>CAPWAP ports</td><td>5246 control (DTLS), 5247 data</td></tr>
<tr><td>10.10.99.10 ke liye option 43</td><td>f104.0a0a.630a (type f1, length 04)</td></tr>
<tr><td>DNS name</td><td>AP domain mein CISCO-CAPWAP-CONTROLLER</td></tr>
<tr><td>Broadcast discovery</td><td>Sirf AP ke apne subnet ke andar</td></tr>
<tr><td>Join order</td><td>DHCP, discovery, DTLS, join, image, config, run</td></tr>
<tr><td>Trunk fix</td><td>switchport trunk allowed vlan add 99</td></tr>
<tr><td>Radios off</td><td>AP country controller allowed list mein nahi</td></tr>
<tr><td>Default policy tag</td><td>Koi WLAN nahi, isliye SSID nahi</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! controller</span>
show ap summary
show ap tag summary
show wireless management interface
show wireless country configured
show logging
ap profile AP-PROF-US  /  country IN
wireless management interface Vlan99

<span class="c">! router R1</span>
show running-config | section dhcp
ip dhcp pool AP-POOL  /  option 43 hex f104.0a0a.630a

<span class="c">! switch SW1</span>
show interfaces trunk
interface GigabitEthernet0/1  /  switchport trunk allowed vlan add 99

<span class="c">! lab AP console and client</span>
ip dhcp
wifi status  /  ping 10.10.60.20</pre>

<h3>Sirf concept (lab mein simulate nahi)</h3>
<p>FlexConnect aur local switching, certificates, trustpoints aur AP authorization, HA SSO aur N+1, DNS discovery, packet captures aur RA traces, aur real RRM. Aage aane wale: wl-flex (FlexConnect) aur wl-mobility (Mobility and high availability). Yeh exam aur interviews mein aate hain, isliye idea jaano bhale hi simulator unhe model na kare.</p>

<div class="warn"><p><b>Bachne wali common mistakes.</b> Galat device par fix karna, trunk VLANs add karne ki jagah replace karna, profile error chhupane ke liye country list widen karna, AP leases renew karna bhool jaana, aur show ap summary ke bina success declare karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Zero APs registered versus registered APs bina SSID ke aapki ladder ki branch decide karta hai. Discovery (candidates dhundna) ko selection (ek chunna) se mix mat karo.</p></div>

<div class="scn"><h4>Final interview whiteboard</h4><p>Final interview mein candidate ko bola gaya: "VLAN re-design ke baad Floor 3 ke APs controller par nahi dikh rahe". Usne ladder draw ki, poochha ki APs ke paas leases the ya nahi, poochha kya badla, controller gateway test kiya, trunk check kiya aur VLAN 99 pruned paya. Interviewer ne chaar minute mein roka: use job mil gayi thi.</p><p><b>Seekh:</b> shaant, ordered method yaad kiye commands se zyada impress karta hai.</p></div>

<div class="iv"><p class="q">"Lightweight AP service mein kaise aata hai, summarise karo."</p><p>Woh boot hota hai, AP VLAN mein IP leta hai, controller addresses seekhta hai (option 43, DNS, primed), ek chunta hai, UDP 5246 par DTLS-protected CAPWAP control tunnel banata hai, join karta hai, zaroorat ho to image download karta hai, country aur tags samet config receive karta hai, aur Run mein jaata hai, tags ke zariye SSIDs serve karta hai aur client data UDP 5247 par bhejta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Jaano, pahuncho, trust, join aur serve: paanch stages, har ek ka owner.</li>
<li>Option 43, trunk allowed list aur AP profile country teen lab repairs hain.</li>
<li>Hamesha show ap summary aur client test se verify karo.</li>
<li>Concept-only topics exam ke liye jaano bhale hi simulate nahi hote.</li>
</ul></div>
`}};export{e as default};