var e={id:`placement`,h:{en:`Controller placement, sizing, high availability and AP join`,hi:`Controller placement, sizing, high availability aur AP join`},body:{en:`
<p><b>Analogy.</b> Think of controllers as airport control towers. You can have one big tower for the whole region, or several smaller ones close to each runway. One tower is simple but a failure grounds everything. Many towers cost more but isolate failures. Placing and sizing a controller is the same decision.</p>

<h3>The case: Summit Medical Group</h3>
<p>Summit Medical Group is a fictional hospital network. It has a main hospital with 3 buildings (1,300 APs), a second hospital 40 km away (500 APs), and 12 clinics with 6 APs each (72 APs). Today it has 1,872 APs and about 14,000 concurrent clients, with clinical staff using voice badges and infusion pumps. The board approves a 25 percent AP growth over three years. Rules from the CISO: no single controller failure may drop patient-care Wi-Fi, and no AP may join a controller that is not approved.</p>

<h3>Step 1: size with growth and with HA in mind</h3>
<div class="eg"><p><b>Worked sizing.</b> Planned APs = 1,872 x 1.25 = 2,340. Clients: assume 14,000 now and 40 percent growth, about 19,600. Compare with controller limits (check the datasheet; typical published figures are about 2,000 APs for a C9800-40 and about 6,000 APs for a C9800-80). 2,340 APs is above one C9800-40, so the choice is a <b>C9800-80 HA pair</b> at each hospital, or two C9800-40 pairs split by site. Remember: in <b>SSO HA</b> the second unit is a hot standby, so the pair has the capacity of <b>one</b> unit, not two.</p></div>
<p>Always size on three numbers: <b>APs</b>, <b>clients</b> and <b>throughput</b> (forwarding capacity for centrally switched traffic). A design that fits on APs may still fail on throughput if everything is tunnelled through one controller.</p>

<h3>Step 2: pick the placement model</h3>
<table class="cmp"><tr><th>Model</th><th>Where controllers sit</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>Centralised</b></td><td>One or two data centers</td><td>Easy to operate, one policy point</td><td>Latency for remote sites; WAN cost; big failure domain</td></tr>
<tr><td><b>Distributed</b></td><td>One controller or pair per campus or region</td><td>Low latency, small failure domain</td><td>More boxes, more licences, mobility groups to manage</td></tr>
<tr><td><b>Cloud / virtual</b></td><td>9800-CL in a private or public cloud</td><td>Fast to grow, no hardware</td><td>Cloud path latency; sized by VM template</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Controller placement for Summit Medical">
<rect x="20" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="145" y="40" text-anchor="middle" class="svg-ink" font-size="13">Main hospital</text>
<rect x="40" y="55" width="90" height="40" rx="8" fill="#bae6fd"/><text x="85" y="79" text-anchor="middle" class="svg-ink" font-size="12">9800 active</text>
<rect x="150" y="55" width="100" height="40" rx="8" fill="#bae6fd"/><text x="200" y="79" text-anchor="middle" class="svg-ink" font-size="12">9800 standby</text>
<line x1="130" y1="75" x2="150" y2="75" stroke="#16a34a" stroke-width="3"/>
<rect x="40" y="120" width="210" height="34" rx="8" fill="#bbf7d0"/><text x="145" y="142" text-anchor="middle" class="svg-ink" font-size="12">1,300 APs, local mode</text>
<line x1="145" y1="95" x2="145" y2="120" stroke="#64748b"/>
<rect x="370" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="495" y="40" text-anchor="middle" class="svg-ink" font-size="13">Second hospital</text>
<rect x="390" y="55" width="90" height="40" rx="8" fill="#bae6fd"/><text x="435" y="79" text-anchor="middle" class="svg-ink" font-size="12">9800 active</text>
<rect x="500" y="55" width="100" height="40" rx="8" fill="#bae6fd"/><text x="550" y="79" text-anchor="middle" class="svg-ink" font-size="12">9800 standby</text>
<line x1="480" y1="75" x2="500" y2="75" stroke="#16a34a" stroke-width="3"/>
<rect x="390" y="120" width="210" height="34" rx="8" fill="#bbf7d0"/><text x="495" y="142" text-anchor="middle" class="svg-ink" font-size="12">500 APs, local mode</text>
<line x1="495" y1="95" x2="495" y2="120" stroke="#64748b"/>
<line x1="270" y1="75" x2="370" y2="75" stroke="#64748b" stroke-dasharray="5 3"/><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">Mobility</text>
<rect x="230" y="200" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="224" text-anchor="middle" class="svg-ink" font-size="12">12 clinics, FlexConnect</text>
<line x1="320" y1="200" x2="145" y2="170" stroke="#64748b"/><line x1="320" y1="200" x2="495" y2="170" stroke="#64748b"/>
<text x="20" y="262" class="svg-muted" font-size="11">Green line = HA link (SSO). Dashed = mobility tunnel between hospitals.</text>
</svg><p class="cap">Distributed placement: one HA pair per hospital, clinics join over the WAN as FlexConnect.</p></div>

<h3>Step 3: high availability choices</h3>
<ul>
<li><b>SSO HA pair:</b> two controllers in one logical unit. The standby has the configuration and the AP and client state, so a switchover is fast and clients keep their sessions. Both units must be the same model and software, joined by a redundancy port.</li>
<li><b>N+1:</b> one spare controller backs up several primary controllers. The APs rejoin the backup after a failure, which takes longer and clients reconnect. It is cheaper but slower.</li>
<li><b>AP failover priority:</b> you decide which APs (for example, emergency-ward APs) rejoin first when capacity is short.</li>
</ul>

<h3>Step 4: make sure APs can find the controller</h3>
<p>An AP learns its controller through, in order of common use: a stored primary/secondary/tertiary controller, DHCP option 43, DNS name <code>CISCO-CAPWAP-CONTROLLER</code> in the local domain, or broadcast on the local VLAN. For campus designs, <b>DHCP option 43</b> is the standard method.</p>
<pre class="code"><span class="c">! IOS DHCP pool for the AP VLAN, controller 192.0.2.10</span>
ip dhcp pool AP-VLAN-110
 network 10.110.0.0 255.255.255.0
 default-router 10.110.0.1
 dns-server 198.51.100.53
 option 43 hex f104.c000.020a</pre>
<p>The value <code>f1</code> is the sub-option type for IPv4 controllers, <code>04</code> is the length (four bytes per controller address) and <code>c000020a</code> is 192.0.2.10. Add more controllers by repeating four bytes and raising the length.</p>
<p>Other joining design points: APs need <b>time</b> (NTP) right for certificate checks; the AP-to-controller path must carry <b>CAPWAP UDP 5246 and 5247</b>; and the <b>MTU</b> must allow CAPWAP packets, or fragmentation will hurt performance. Keep AP management on its own VLAN, separate from client VLANs.</p>

<div class="warn"><p><b>Common mistakes.</b> Counting an HA pair as double capacity. Sizing for today instead of three years. Putting remote clinics on local mode across a 90 ms WAN. Forgetting that APs may join the wrong controller if a lab controller is reachable on the same network.</p></div>
<div class="exam"><p><b>Exam trap.</b> If the question mentions fast switchover with client state preserved, the answer is SSO; if it mentions one backup for many controllers, it is N+1. Do not mix them.</p></div>

<div class="scn"><h4>The new switch that nobody could join</h4><p>Summit replaced the access switches on floor 4 over a weekend. On Monday 38 APs on that floor stayed offline. The engineer saw that the APs got addresses but the join failed. The cause: the new AP VLAN had a DHCP scope with no option 43 and the DNS name had not been created for that subnet's domain, so the APs had no controller address. Adding option 43 to the scope brought all APs back in minutes. The team then added an AP-VLAN checklist to every switch-replacement change.</p><p><b>Lesson:</b> join depends on DHCP, DNS, time and reachable UDP 5246, so test them in every new AP VLAN.</p></div>

<div class="iv"><p class="q">"How do you size a wireless controller for a hospital?"</p><p>Strong answer: count APs and clients today, apply the growth plan, compare against the datasheet limits for APs, clients and throughput, remember an HA pair has the capacity of one unit, then choose placement from latency and failure domain. Add how APs will discover the controller and which AP groups must fail over first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Size on APs, clients and throughput, with growth added.</li>
<li>Placement models: centralised, distributed, cloud; pick by latency and failure domain.</li>
<li>SSO HA keeps client state; N+1 is cheaper but slower; an HA pair equals one unit of capacity.</li>
<li>AP discovery: stored controller, DHCP option 43, DNS, broadcast.</li>
<li>Check NTP, UDP 5246 and 5247, MTU and a separate AP VLAN.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Controllers ko airport ke control towers samjho. Poore region ke liye ek bada tower ho sakta hai, ya har runway ke paas kai chhote towers. Ek tower simple hai par uske fail hone par sab grounded ho jata hai. Kai towers mehenge hain par failures ko alag rakhte hain. Controller placement aur sizing bhi wahi decision hai.</p>

<h3>Case: Summit Medical Group</h3>
<p>Summit Medical Group ek fictional hospital network hai. Iska main hospital 3 buildings ka hai (1,300 APs), doosra hospital 40 km door hai (500 APs), aur 12 clinics hain jinmein 6-6 APs hain (72 APs). Aaj iske paas 1,872 APs aur lagbhag 14,000 concurrent clients hain, jahan clinical staff voice badges aur infusion pumps use karta hai. Board teen saal mein 25 percent AP growth approve karta hai. CISO ke rules: koi bhi ek controller failure patient-care Wi-Fi ko na girae, aur koi AP aise controller se join na kare jo approved nahi hai.</p>

<h3>Step 1: growth aur HA ko dhyan mein rakhkar size karo</h3>
<div class="eg"><p><b>Worked sizing.</b> Planned APs = 1,872 x 1.25 = 2,340. Clients: abhi 14,000 aur 40 percent growth maano, lagbhag 19,600. Controller limits se compare karo (datasheet check karo; typical published figures lagbhag C9800-40 ke liye 2,000 APs aur C9800-80 ke liye 6,000 APs hain). 2,340 APs ek C9800-40 se zyada hain, to choice hai har hospital mein <b>C9800-80 HA pair</b>, ya site ke hisaab se do C9800-40 pairs. Yaad rakho: <b>SSO HA</b> mein doosri unit hot standby hoti hai, isliye pair ki capacity <b>ek</b> unit ke barabar hoti hai, do ke nahi.</p></div>
<p>Hamesha teen numbers par size karo: <b>APs</b>, <b>clients</b> aur <b>throughput</b> (centrally switched traffic ke liye forwarding capacity). Jo design APs par fit hota hai, wo throughput par fail ho sakta hai agar sab kuch ek controller se tunnel hota ho.</p>

<h3>Step 2: placement model chuno</h3>
<table class="cmp"><tr><th>Model</th><th>Controllers kahan hain</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>Centralised</b></td><td>Ek ya do data centers</td><td>Operate karna aasan, ek policy point</td><td>Remote sites ke liye latency; WAN cost; bada failure domain</td></tr>
<tr><td><b>Distributed</b></td><td>Har campus ya region mein ek controller ya pair</td><td>Kam latency, chhota failure domain</td><td>Zyada boxes, zyada licences, mobility groups manage karne padte hain</td></tr>
<tr><td><b>Cloud / virtual</b></td><td>Private ya public cloud mein 9800-CL</td><td>Jaldi grow, hardware nahi</td><td>Cloud path latency; VM template se size hota hai</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Summit Medical ke liye controller placement">
<rect x="20" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="145" y="40" text-anchor="middle" class="svg-ink" font-size="13">Main hospital</text>
<rect x="40" y="55" width="90" height="40" rx="8" fill="#bae6fd"/><text x="85" y="79" text-anchor="middle" class="svg-ink" font-size="12">9800 active</text>
<rect x="150" y="55" width="100" height="40" rx="8" fill="#bae6fd"/><text x="200" y="79" text-anchor="middle" class="svg-ink" font-size="12">9800 standby</text>
<line x1="130" y1="75" x2="150" y2="75" stroke="#16a34a" stroke-width="3"/>
<rect x="40" y="120" width="210" height="34" rx="8" fill="#bbf7d0"/><text x="145" y="142" text-anchor="middle" class="svg-ink" font-size="12">1,300 APs, local mode</text>
<line x1="145" y1="95" x2="145" y2="120" stroke="#64748b"/>
<rect x="370" y="20" width="250" height="150" rx="10" fill="#e2e8f0"/><text x="495" y="40" text-anchor="middle" class="svg-ink" font-size="13">Doosra hospital</text>
<rect x="390" y="55" width="90" height="40" rx="8" fill="#bae6fd"/><text x="435" y="79" text-anchor="middle" class="svg-ink" font-size="12">9800 active</text>
<rect x="500" y="55" width="100" height="40" rx="8" fill="#bae6fd"/><text x="550" y="79" text-anchor="middle" class="svg-ink" font-size="12">9800 standby</text>
<line x1="480" y1="75" x2="500" y2="75" stroke="#16a34a" stroke-width="3"/>
<rect x="390" y="120" width="210" height="34" rx="8" fill="#bbf7d0"/><text x="495" y="142" text-anchor="middle" class="svg-ink" font-size="12">500 APs, local mode</text>
<line x1="495" y1="95" x2="495" y2="120" stroke="#64748b"/>
<line x1="270" y1="75" x2="370" y2="75" stroke="#64748b" stroke-dasharray="5 3"/><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">Mobility</text>
<rect x="230" y="200" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="224" text-anchor="middle" class="svg-ink" font-size="12">12 clinics, FlexConnect</text>
<line x1="320" y1="200" x2="145" y2="170" stroke="#64748b"/><line x1="320" y1="200" x2="495" y2="170" stroke="#64748b"/>
<text x="20" y="262" class="svg-muted" font-size="11">Green line = HA link (SSO). Dashed = hospitals ke beech mobility tunnel.</text>
</svg><p class="cap">Distributed placement: har hospital mein ek HA pair, clinics WAN ke upar FlexConnect ke roop mein join karte hain.</p></div>

<h3>Step 3: high availability ke choices</h3>
<ul>
<li><b>SSO HA pair:</b> do controllers ek logical unit mein. Standby ke paas configuration aur AP aur client state hoti hai, isliye switchover fast hota hai aur clients ke sessions bane rehte hain. Dono units ka model aur software same hona chahiye, aur redundancy port se jude hone chahiye.</li>
<li><b>N+1:</b> ek spare controller kai primary controllers ka backup hota hai. Failure ke baad APs backup se rejoin karte hain, jisme zyada time lagta hai aur clients reconnect karte hain. Yeh sasta hai par slow.</li>
<li><b>AP failover priority:</b> aap decide karte ho ki capacity kam hone par kaunse APs (jaise emergency-ward ke APs) pehle rejoin karein.</li>
</ul>

<h3>Step 4: pakka karo ki APs controller dhoondh sakein</h3>
<p>AP apna controller in tareekon se seekhta hai (common use ke order mein): stored primary/secondary/tertiary controller, DHCP option 43, local domain mein DNS name <code>CISCO-CAPWAP-CONTROLLER</code>, ya local VLAN par broadcast. Campus designs ke liye <b>DHCP option 43</b> standard method hai.</p>
<pre class="code"><span class="c">! IOS DHCP pool for the AP VLAN, controller 192.0.2.10</span>
ip dhcp pool AP-VLAN-110
 network 10.110.0.0 255.255.255.0
 default-router 10.110.0.1
 dns-server 198.51.100.53
 option 43 hex f104.c000.020a</pre>
<p>Value <code>f1</code> IPv4 controllers ka sub-option type hai, <code>04</code> length hai (har controller address ke liye chaar bytes) aur <code>c000020a</code> matlab 192.0.2.10. Aur controllers jodne ke liye chaar bytes repeat karo aur length badhao.</p>
<p>Joining ke baaki design points: certificate checks ke liye APs ko sahi <b>time</b> (NTP) chahiye; AP se controller ke path par <b>CAPWAP UDP 5246 aur 5247</b> jaana chahiye; aur <b>MTU</b> CAPWAP packets allow kare, warna fragmentation performance bigaad dega. AP management ko client VLANs se alag apni VLAN mein rakho.</p>

<div class="warn"><p><b>Common mistakes.</b> HA pair ko double capacity ginna. Aaj ke liye size karna, teen saal ke liye nahi. 90 ms WAN ke upar remote clinics ko local mode mein rakhna. Yeh bhoolna ki agar same network par lab controller reachable ho to AP galat controller se join kar sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar question mein client state ke saath fast switchover hai to answer SSO hai; agar kai controllers ke liye ek backup hai, to N+1. Dono ko mix mat karo.</p></div>

<div class="scn"><h4>Naya switch jisse koi join nahi kar paya</h4><p>Summit ne weekend par floor 4 ke access switches badle. Monday ko us floor ke 38 APs offline rahe. Engineer ne dekha ki APs ko address mil raha tha par join fail ho raha tha. Wajah: nayi AP VLAN ke DHCP scope mein option 43 nahi tha aur us subnet ke domain mein DNS name bana hi nahi tha, isliye APs ke paas controller address nahi tha. Scope mein option 43 add karne se saare APs kuch minutes mein wapas aa gaye. Team ne phir har switch-replacement change mein AP-VLAN checklist jod di.</p><p><b>Lesson:</b> join DHCP, DNS, time aur reachable UDP 5246 par depend karta hai, isliye har nayi AP VLAN mein inhe test karo.</p></div>

<div class="iv"><p class="q">"Hospital ke liye wireless controller ko size kaise karte ho?"</p><p>Strong answer: aaj ke APs aur clients ginte ho, growth plan lagate ho, APs, clients aur throughput ke datasheet limits se compare karte ho, yaad rakhte ho ki HA pair ki capacity ek unit ke barabar hai, phir latency aur failure domain se placement choose karte ho. Yeh bhi jodo ki APs controller kaise discover karenge aur kaunse AP groups pehle failover karenge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Growth jodkar APs, clients aur throughput par size karo.</li>
<li>Placement models: centralised, distributed, cloud; latency aur failure domain se chuno.</li>
<li>SSO HA client state rakhta hai; N+1 sasta par slow hai; HA pair ek unit ki capacity ke barabar hai.</li>
<li>AP discovery: stored controller, DHCP option 43, DNS, broadcast.</li>
<li>NTP, UDP 5246 aur 5247, MTU aur alag AP VLAN check karo.</li>
</ul></div>
`}};export{e as default};