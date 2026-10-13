var e={id:`capwap-join`,h:{en:`CAPWAP and how an AP finds and joins the controller`,hi:`CAPWAP aur AP controller ko kaise dhoondhta aur join karta hai`},body:{en:`
<p>An AP plugged into a switch port knows nothing about your company. It has to learn an IP address, find a controller, build a tunnel and download its configuration. This chapter explains that sequence, because every "AP will not join" ticket is a failure of one step in it.</p>

<h3>Analogy: a new employee on day one</h3>
<p>A new employee arrives at a big office. First she gets a badge (an IP address). Then she must find HR (the controller's address). She walks to the desk, introduces herself (join request), and HR hands her a job description (configuration). Only then can she start working. If any step fails, she stands in the lobby doing nothing.</p>

<h3>CAPWAP in plain words</h3>
<p><b>CAPWAP</b> (Control And Provisioning of Wireless Access Points) is the tunnelling protocol between AP and controller. It carries two kinds of traffic, each on its own UDP port:</p>
<dl class="terms">
<dt>CAPWAP control</dt><dd>UDP port 5246. Discovery, join, configuration, monitoring and keepalives. Protected with DTLS, so the control channel is encrypted and mutually authenticated with certificates.</dd>
<dt>CAPWAP data</dt><dd>UDP port 5247. Carries client traffic from the AP to the controller when the WLAN uses central switching, which is the default in this module. Data DTLS is optional.</dd>
<dt>Split-MAC</dt><dd>The division of work from chapter 1: AP handles real-time frames, controller handles management. CAPWAP is the glue.</dd>
</dl>
<p>Because CAPWAP is a layer 3 tunnel, the AP and controller can be in different subnets and even different buildings. That is why our AP VLAN 10 and controller VLAN 99 can differ. They only need IP reachability and open UDP 5246 and 5247 along the way.</p>

<h3>The join sequence</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="AP join steps">
<rect x="10" y="20" width="110" height="44" rx="8" fill="#fde68a"/><text x="65" y="46" text-anchor="middle" class="svg-ink" font-size="12">1 Get IP (DHCP)</text>
<rect x="140" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="195" y="46" text-anchor="middle" class="svg-ink" font-size="12">2 Find WLC</text>
<rect x="270" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="325" y="46" text-anchor="middle" class="svg-ink" font-size="12">3 DTLS session</text>
<rect x="400" y="20" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="455" y="46" text-anchor="middle" class="svg-ink" font-size="12">4 Join + image</text>
<rect x="530" y="20" width="100" height="44" rx="8" fill="#fed7aa"/><text x="580" y="46" text-anchor="middle" class="svg-ink" font-size="12">5 Config, RUN</text>
<line x1="120" y1="42" x2="140" y2="42" stroke="#64748b"/><line x1="250" y1="42" x2="270" y2="42" stroke="#64748b"/><line x1="380" y1="42" x2="400" y2="42" stroke="#64748b"/><line x1="510" y1="42" x2="530" y2="42" stroke="#64748b"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Discovery methods in step 2</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">DHCP option 43  |  DNS name CISCO-CAPWAP-CONTROLLER  |  broadcast on own subnet</text>
<text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">previously known controller  |  static address entered on the AP console</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Lab: DHCP pool AP-POOL carries option 43 = 10.10.99.10</text>
</svg><p class="cap">An AP walks these steps in order. It stops at the first step that fails.</p></div>
<ol>
<li><b>Get an IP address.</b> The AP does DHCP on its switch port. In the lab AP1 and AP2 are in VLAN 10 and R1 serves pool AP-POOL.</li>
<li><b>Find a controller.</b> Typical sources, roughly in this order (the exact order and list depend on the release): a controller it remembers, DHCP option 43, a DNS lookup of <code>CISCO-CAPWAP-CONTROLLER</code> followed by your domain, and a broadcast on its own subnet. A broadcast cannot cross a router, so for APs in other subnets use option 43 or DNS.</li>
<li><b>Build the DTLS tunnel.</b> The AP and controller check each other's certificates. This is a security gate: only genuine APs join.</li>
<li><b>Join.</b> The AP sends a join request. The controller answers, may tell the AP to download a software image that matches the controller, and the AP reboots if needed.</li>
<li><b>Receive configuration.</b> The AP asks for its configuration, which includes its tags (chapter 5), and moves to the <b>Run</b> state. It is now <b>Registered</b>.</li>
</ol>

<h3>Option 43 decoded</h3>
<p>Cisco APs read vendor-specific option 43 as a small structure: a type byte <code>f1</code>, a length byte (4 for each controller address, so <code>04</code> for one), and the controller address in hex. For 10.10.99.10 the hex is 0a 0a 63 0a, because 10 = 0a and 99 = 63. So the pool carries <code>f104.0a0a.630a</code>. Two controllers would use type f1, length 08 and eight address bytes.</p>
<pre class="code"><span class="c">! On R1 (the DHCP server), this is the value from the lab</span>
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 option 43 hex f104.0a0a.630a</pre>

<h3>AP modes (preview)</h3>
<p>The AP default is <b>local</b> mode: all WLANs are tunnelled to the controller and the AP also scans channels. Other modes (FlexConnect, monitor, sniffer, bridge) exist, but they are outside this module. Coming up: module wl-flex (FlexConnect). FlexConnect and local switching are concepts only and are not simulated in the lab.</p>

<div class="eg"><p><b>Worked example.</b> AP1 gets 10.10.10.21 from R1. R1's option 43 says 10.10.99.10. AP1 sends a CAPWAP discovery to that address on UDP 5246. The controller replies, DTLS comes up, AP1 joins and the controller shows it Registered. If R1's option 43 were missing, AP1 would broadcast, nobody in VLAN 10 would answer, and AP1 would sit in Discovery forever.</p></div>

<pre class="out">WLC1# show ap summary

Number of APs: 2

AP Name              Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
------------------------------------------------------------
AP1                  2      C9120AXI-D    <span class="hl">aaaa.bb01.0001</span>  aaaa.bb01.0010  IN  10.10.10.21     <span class="hl">Registered</span>
AP2                  2      C9120AXI-D    aaaa.bb01.0002  aaaa.bb01.0020  IN  10.10.10.22     Registered</pre>
<p>States you will meet: <b>Discovery</b> (still looking), <b>Down</b> (was joined, link lost) and <b>Registered</b> (joined and running). MAC values here are examples.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Expecting broadcast discovery to work across routers. (2) Writing option 43 in decimal or with a wrong length byte. (3) Blocking UDP 5246 or 5247 on a firewall between AP and controller. (4) Wrong system clock or certificate lifetime on real hardware, which breaks DTLS (concept, not simulated in the lab).</p></div>
<div class="exam"><p><b>Exam trap.</b> CAPWAP control is UDP 5246 and CAPWAP data is UDP 5247. Do not confuse them with the older LWAPP or with the mobility ports used between controllers.</p></div>

<div class="scn"><h4>The pool that forgot option 43</h4><p>A new floor was cabled and its APs got addresses, but none registered. The controller looked healthy and answered pings. On the DHCP server the new floor's pool had no option 43, and the VLAN had no router broadcast reach to the controller. Adding the option and renewing the AP leases brought all eight APs up in two minutes.</p><p><b>Lesson:</b> healthy controller plus unjoined APs usually means discovery, not the controller.</p></div>

<div class="iv"><p class="q">"Walk me through how an AP joins a controller."</p><p>Strong answer: DHCP address, controller discovery (option 43, DNS, broadcast, remembered), DTLS tunnel with certificate check on UDP 5246, join and optional image download, configuration pushed, then Run. Mention that data uses UDP 5247 and that the AP can be in a different subnet from the controller.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CAPWAP control is UDP 5246 with DTLS; data is UDP 5247.</li>
<li>An AP gets an IP, finds a controller, builds DTLS, joins, takes configuration, then runs.</li>
<li>DHCP option 43 f104.0a0a.630a means one controller at 10.10.99.10.</li>
<li>Broadcast discovery cannot cross a router; use option 43 or DNS.</li>
<li>The AP does not have to share a subnet with the controller.</li>
</ul></div>
`,hi:`
<p>Switch port mein plug kiya hua AP aapki company ke baare mein kuch nahi jaanta. Use IP address seekhna padta hai, controller dhoondhna padta hai, tunnel banana padta hai aur configuration download karni padti hai. Yeh chapter us sequence ko explain karta hai, kyunki har "AP join nahi ho raha" ticket us sequence ke ek step ki failure hota hai.</p>

<h3>Analogy: naya employee pehle din</h3>
<p>Ek naya employee bade office mein aati hai. Pehle use badge milta hai (IP address). Phir use HR dhoondhna hota hai (controller ka address). Woh desk par jaati hai, apna parichay deti hai (join request), aur HR use job description deta hai (configuration). Tabhi woh kaam shuru kar sakti hai. Koi step fail ho to woh lobby mein khadi rehti hai.</p>

<h3>CAPWAP seedhe shabdon mein</h3>
<p><b>CAPWAP</b> (Control And Provisioning of Wireless Access Points) AP aur controller ke beech ka tunnelling protocol hai. Yeh do tarah ka traffic le jaata hai, har ek apne UDP port par:</p>
<dl class="terms">
<dt>CAPWAP control</dt><dd>UDP port 5246. Discovery, join, configuration, monitoring aur keepalives. DTLS se protected, yaani control channel encrypted hai aur certificates se mutually authenticated hai.</dd>
<dt>CAPWAP data</dt><dd>UDP port 5247. Jab WLAN central switching use karta hai (is module mein default) tab client traffic AP se controller tak le jaata hai. Data DTLS optional hai.</dd>
<dt>Split-MAC</dt><dd>Chapter 1 ka kaam ka batwara: AP real-time frames sambhalta hai, controller management. CAPWAP glue hai.</dd>
</dl>
<p>CAPWAP layer 3 tunnel hai, isliye AP aur controller alag subnets aur alag buildings mein ho sakte hain. Isi wajah se hamara AP VLAN 10 aur controller VLAN 99 alag ho sakte hain. Bas IP reachability aur raaste mein UDP 5246 aur 5247 khule chahiye.</p>

<h3>Join sequence</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="AP join steps">
<rect x="10" y="20" width="110" height="44" rx="8" fill="#fde68a"/><text x="65" y="46" text-anchor="middle" class="svg-ink" font-size="12">1 IP lena (DHCP)</text>
<rect x="140" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="195" y="46" text-anchor="middle" class="svg-ink" font-size="12">2 WLC dhoondho</text>
<rect x="270" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="325" y="46" text-anchor="middle" class="svg-ink" font-size="12">3 DTLS session</text>
<rect x="400" y="20" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="455" y="46" text-anchor="middle" class="svg-ink" font-size="12">4 Join + image</text>
<rect x="530" y="20" width="100" height="44" rx="8" fill="#fed7aa"/><text x="580" y="46" text-anchor="middle" class="svg-ink" font-size="12">5 Config, RUN</text>
<line x1="120" y1="42" x2="140" y2="42" stroke="#64748b"/><line x1="250" y1="42" x2="270" y2="42" stroke="#64748b"/><line x1="380" y1="42" x2="400" y2="42" stroke="#64748b"/><line x1="510" y1="42" x2="530" y2="42" stroke="#64748b"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Step 2 ke discovery methods</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">DHCP option 43  |  DNS name CISCO-CAPWAP-CONTROLLER  |  apne subnet par broadcast</text>
<text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">pehle se yaad controller  |  AP console par static address</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Lab: DHCP pool AP-POOL mein option 43 = 10.10.99.10</text>
</svg><p class="cap">AP in steps ko order mein chalta hai. Jo pehla step fail ho wahin ruk jaata hai.</p></div>
<ol>
<li><b>IP address lena.</b> AP apne switch port par DHCP karta hai. Lab mein AP1 aur AP2 VLAN 10 mein hain aur R1 pool AP-POOL serve karta hai.</li>
<li><b>Controller dhoondhna.</b> Aam sources, lagbhag is order mein (exact order aur list release par depend karti hai): yaad rakha hua controller, DHCP option 43, <code>CISCO-CAPWAP-CONTROLLER</code> ka DNS lookup (aapke domain ke saath), aur apne subnet par broadcast. Broadcast router paar nahi karta, isliye dusre subnets ke APs ke liye option 43 ya DNS use karo.</li>
<li><b>DTLS tunnel banana.</b> AP aur controller ek dusre ke certificates check karte hain. Yeh security gate hai: sirf genuine APs join karte hain.</li>
<li><b>Join.</b> AP join request bhejta hai. Controller jawab deta hai, AP ko controller se match karti software image download karne ko keh sakta hai, aur zaroorat ho to AP reboot hota hai.</li>
<li><b>Configuration lena.</b> AP apni configuration maangta hai jismein uske tags shamil hain (chapter 5), aur <b>Run</b> state mein jaata hai. Ab woh <b>Registered</b> hai.</li>
</ol>

<h3>Option 43 decode</h3>
<p>Cisco APs vendor-specific option 43 ko chhote structure ki tarah padhte hain: type byte <code>f1</code>, length byte (har controller address ke liye 4, yaani ek ke liye <code>04</code>), aur controller address hex mein. 10.10.99.10 ka hex 0a 0a 63 0a hai, kyunki 10 = 0a aur 99 = 63. Isliye pool mein <code>f104.0a0a.630a</code> hota hai. Do controllers ke liye type f1, length 08 aur aath address bytes.</p>
<pre class="code"><span class="c">! R1 par (DHCP server), lab ki value</span>
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 option 43 hex f104.0a0a.630a</pre>

<h3>AP modes (preview)</h3>
<p>AP ka default <b>local</b> mode hai: saare WLANs controller tak tunnel hote hain aur AP channels scan bhi karta hai. Doosre modes (FlexConnect, monitor, sniffer, bridge) hain, lekin is module ke bahar. Aage aane wala module: wl-flex (FlexConnect). FlexConnect aur local switching sirf concepts hain aur lab mein simulated nahi.</p>

<div class="eg"><p><b>Worked example.</b> AP1 ko R1 se 10.10.10.21 milta hai. R1 ka option 43 10.10.99.10 batata hai. AP1 us address par UDP 5246 par CAPWAP discovery bhejta hai. Controller jawab deta hai, DTLS up hota hai, AP1 join karta hai aur controller use Registered dikhata hai. Agar R1 ka option 43 missing hota, AP1 broadcast karta, VLAN 10 mein koi jawab nahi deta, aur AP1 hamesha Discovery mein rehta.</p></div>

<pre class="out">WLC1# show ap summary

Number of APs: 2

AP Name              Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
------------------------------------------------------------
AP1                  2      C9120AXI-D    <span class="hl">aaaa.bb01.0001</span>  aaaa.bb01.0010  IN  10.10.10.21     <span class="hl">Registered</span>
AP2                  2      C9120AXI-D    aaaa.bb01.0002  aaaa.bb01.0020  IN  10.10.10.22     Registered</pre>
<p>States jo milenge: <b>Discovery</b> (abhi dhoondh raha), <b>Down</b> (join tha, link gaya) aur <b>Registered</b> (joined aur running). MAC values yahan examples hain.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Umeed karna ki broadcast discovery routers ke paar chalega. (2) Option 43 decimal mein ya galat length byte ke saath likhna. (3) AP aur controller ke beech firewall par UDP 5246 ya 5247 block karna. (4) Real hardware par galat system clock ya certificate lifetime, jo DTLS tod deta hai (concept, lab mein simulated nahi).</p></div>
<div class="exam"><p><b>Exam trap.</b> CAPWAP control UDP 5246 hai aur CAPWAP data UDP 5247. Inhe purane LWAPP ya controllers ke beech ke mobility ports se confuse mat karo.</p></div>

<div class="scn"><h4>Option 43 bhoolne wala pool</h4><p>Ek nayi floor cable hui aur uske APs ko addresses mile, lekin koi register nahi hua. Controller healthy tha aur ping ka jawab deta tha. DHCP server par nayi floor ke pool mein option 43 nahi tha, aur VLAN ka broadcast controller tak nahi pahunchta tha. Option add karke AP leases renew karne se aath ke aath APs do minute mein up aa gaye.</p><p><b>Seekh:</b> healthy controller aur unjoined APs ka matlab aam taur par discovery hai, controller nahi.</p></div>

<div class="iv"><p class="q">"Batao AP controller ko kaise join karta hai."</p><p>Strong answer: DHCP address, controller discovery (option 43, DNS, broadcast, remembered), UDP 5246 par certificate check ke saath DTLS tunnel, join aur optional image download, configuration push, phir Run. Bolo ki data UDP 5247 use karta hai aur AP controller se alag subnet mein ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CAPWAP control UDP 5246 DTLS ke saath hai; data UDP 5247.</li>
<li>AP IP leta hai, controller dhoondhta hai, DTLS banata hai, join karta hai, configuration leta hai, phir run karta hai.</li>
<li>DHCP option 43 f104.0a0a.630a ka matlab 10.10.99.10 par ek controller.</li>
<li>Broadcast discovery router paar nahi karta; option 43 ya DNS use karo.</li>
<li>AP ko controller ke saath same subnet mein hone ki zaroorat nahi.</li>
</ul></div>
`}};export{e as default};