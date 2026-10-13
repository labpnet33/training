var e={id:`join-process`,h:{en:`The AP join process: from power-on to Run state`,hi:`AP join process: power-on se Run state tak`},body:{en:`
<h3>Analogy: the first day at a new job</h3>
<p>A new employee arrives at a large company. First they need an <b>ID and a desk</b> (power and an IP address). Then they must <b>find the HR office</b> (discovery). HR checks that the person is genuine and that they came to the right company (authentication). The employee then receives the current <b>handbook</b> (software image) and their <b>role description</b> (configuration). Only then do they start work (Run). The AP join follows exactly this order.</p>

<h3>The AP boot and join sequence</h3>
<p>When a lightweight AP is powered through PoE or a power injector, it follows a fixed sequence:</p>
<ol>
<li><b>Boot and link.</b> The AP loads its own small operating system and brings up its Ethernet port. It needs PoE budget on the switch port, or it will reboot in a loop.</li>
<li><b>DHCP.</b> The AP broadcasts a DHCP request in its VLAN and obtains an IP address, subnet mask, default gateway and possibly DHCP option 43 or a DNS server. If there is no DHCP, the AP may fall back to a static IP stored from an earlier run.</li>
<li><b>Discovery.</b> The AP sends CAPWAP Discovery Requests (UDP 5246) to every controller address it can learn. Controllers answer with a Discovery Response containing their name, load and number of APs.</li>
<li><b>Controller selection.</b> The AP chooses one controller from the responses using a fixed priority order (explained below).</li>
<li><b>DTLS setup.</b> The AP and controller authenticate each other with certificates and build the encrypted control tunnel. Wrong time or an unaccepted certificate fails here.</li>
<li><b>Join.</b> The AP sends a Join Request and the controller sends a Join Response if it accepts the AP.</li>
<li><b>Image data.</b> The AP compares its software version with the controller. If different, it downloads the controller image, reboots and joins again. This is why a new AP often joins twice.</li>
<li><b>Configuration.</b> The controller sends tags, profiles, name, country and radio settings.</li>
<li><b>Run.</b> Radios come up, WLANs are broadcast and the AP sends heartbeat keepalives.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="AP join states">
<rect x="10" y="30" width="86" height="50" rx="8" fill="#bae6fd"/><text x="53" y="60" text-anchor="middle" class="svg-ink" font-size="12">DHCP</text>
<rect x="110" y="30" width="86" height="50" rx="8" fill="#bae6fd"/><text x="153" y="60" text-anchor="middle" class="svg-ink" font-size="12">Discovery</text>
<rect x="210" y="30" width="86" height="50" rx="8" fill="#ddd6fe"/><text x="253" y="60" text-anchor="middle" class="svg-ink" font-size="12">DTLS</text>
<rect x="310" y="30" width="86" height="50" rx="8" fill="#ddd6fe"/><text x="353" y="60" text-anchor="middle" class="svg-ink" font-size="12">Join</text>
<rect x="410" y="30" width="96" height="50" rx="8" fill="#fde68a"/><text x="458" y="60" text-anchor="middle" class="svg-ink" font-size="12">Image data</text>
<rect x="520" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="12">Config - Run</text>
<line x1="96" y1="55" x2="110" y2="55" stroke="#64748b"/><line x1="196" y1="55" x2="210" y2="55" stroke="#64748b"/><line x1="296" y1="55" x2="310" y2="55" stroke="#64748b"/><line x1="396" y1="55" x2="410" y2="55" stroke="#64748b"/><line x1="506" y1="55" x2="520" y2="55" stroke="#64748b"/>
<text x="153" y="115" text-anchor="middle" class="svg-muted" font-size="12">no controller known</text>
<text x="253" y="115" text-anchor="middle" class="svg-muted" font-size="12">time or certificate</text>
<text x="458" y="115" text-anchor="middle" class="svg-muted" font-size="12">version differs: reboot</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Where the AP is stuck tells you which layer to check</text>
</svg><p class="cap">An AP stuck in discovery has a name-or-address problem. An AP stuck at DTLS has a trust or time problem. One that never leaves DHCP has a switchport, PoE or VLAN problem.</p></div>

<h3>Controller selection: how an AP chooses</h3>
<p>Discovery can produce several candidate controllers. The AP decides in this order:</p>
<ol>
<li>The <b>primary, secondary and tertiary</b> controller names configured on the AP (a high-availability setting that you can prime in advance).</li>
<li>If none of those answers, the <b>primary, secondary or tertiary backup controller</b> defined globally (a fallback list).</li>
<li>A <b>master controller</b>, if one is marked (used mainly for freshly unconfigured APs).</li>
<li>Otherwise the controller with the <b>lowest load</b>, meaning the fewest joined APs relative to its capacity.</li>
</ol>
<p>This is different from discovery. <b>Discovery gathers candidates; selection picks the winner.</b> Both are exam favourites.</p>

<h3>Staying alive: the heartbeat</h3>
<p>After Run, the AP and controller exchange keepalives (CAPWAP echo requests) on the control tunnel, by default every 30 seconds. If several in a row are missed, each side declares the tunnel dead. The AP then restarts discovery and, if configured, tries its secondary or tertiary controller. Clients on a centrally switched WLAN lose service during that window, which is why <b>AP failover</b> design matters. HA SSO and N+1 designs are concepts here, <b>not simulated in the lab</b>. Coming up: module wl-mobility (Mobility and high availability).</p>

<h3>What you can see in the lab</h3>
<p>The simulator shows the end result of a join. The main verification on the controller is:</p>
<pre class="out">WLC1# show ap summary
Number of APs: 0</pre>
<p>This output is exactly what the first lab shows at the start: the controller is healthy, but zero APs are registered. After the repair, the same command lists AP1 and AP2 as Registered. The lab AP consoles also accept <code>ip dhcp</code>, which makes an AP request a fresh lease. That is the lab equivalent of rebooting an AP, or of waiting for the lease to expire.</p>

<div class="eg"><p><b>Worked example: reading the stage.</b> AP1 has address 10.10.10.21 and its LED pattern says "looking for controller". The WLC shows no entry. Conclusion: DHCP worked (it has an IP), discovery failed (no controller known or reachable). Next question: how could AP1 learn 10.10.99.10 from VLAN 10? That points to DHCP option 43, DNS or a primed address, and you will study each in the next chapter.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Rebooting the AP again and again without reading what stage it is in. (2) Forgetting that a version mismatch makes the AP download an image and reboot: do not unplug it. (3) Treating the heartbeat timeout as a controller fault when the real cause is packet loss on the path.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order of states: discovery, DTLS setup, join, image data, config, run. Selection order is primed primary/secondary/tertiary, then backups, then master, then least loaded. Do not mix up discovery methods with the selection algorithm.</p></div>

<div class="scn"><h4>AP that rebooted twice</h4><p>A technician mounted a new AP and saw it join, vanish for four minutes and join again. They suspected a faulty AP and began an RMA. A senior engineer looked at the controller log: the AP had a different software version, downloaded the controller image and rebooted by design.</p><p><b>Lesson:</b> a first join with image download is normal. Learn the stages before replacing hardware.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when an AP is plugged in."</p><p>Give the sequence: PoE and boot, DHCP lease, discovery requests to learned controllers, controller selection, DTLS handshake, join, image comparison and possible download, configuration, then Run with heartbeats. Add one troubleshooting hint for each stage.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Join states: DHCP, discovery, DTLS, join, image data, config, run.</li>
<li>Discovery collects candidate controllers; selection chooses one by priority and load.</li>
<li>A new AP often joins, downloads an image and rejoins: this is normal.</li>
<li>Heartbeats on the control tunnel detect a dead path or controller.</li>
<li>The stage where the AP stops tells you which layer to troubleshoot.</li>
</ul></div>
`,hi:`
<h3>Analogy: naye job ka pehla din</h3>
<p>Ek bade company mein naya employee aata hai. Pehle use <b>ID aur desk</b> chahiye (power aur IP address). Phir use <b>HR office dhundna</b> hai (discovery). HR check karta hai ki banda asli hai aur sahi company mein aaya hai (authentication). Phir employee ko current <b>handbook</b> (software image) aur apna <b>role description</b> (configuration) milta hai. Tabhi kaam shuru hota hai (Run). AP join bilkul isi order mein chalta hai.</p>

<h3>AP boot aur join sequence</h3>
<p>Lightweight AP ko jab PoE ya power injector se power milti hai, woh ek fixed sequence follow karta hai:</p>
<ol>
<li><b>Boot aur link.</b> AP apna chhota operating system load karta hai aur Ethernet port up karta hai. Switch port par PoE budget chahiye, nahi to AP reboot loop mein jaata hai.</li>
<li><b>DHCP.</b> AP apne VLAN mein DHCP request broadcast karta hai aur IP address, subnet mask, default gateway aur ho sake to DHCP option 43 ya DNS server leta hai. DHCP na ho to AP pichhli run ka stored static IP use kar sakta hai.</li>
<li><b>Discovery.</b> AP jitne controller addresses seekh sake un sabko CAPWAP Discovery Requests (UDP 5246) bhejta hai. Controllers Discovery Response se jawab dete hain jisme unka naam, load aur APs ki sankhya hoti hai.</li>
<li><b>Controller selection.</b> AP responses mein se ek controller fixed priority order se chunta hai (neeche samjhaya hai).</li>
<li><b>DTLS setup.</b> AP aur controller certificates se ek doosre ko authenticate karte hain aur encrypted control tunnel banate hain. Galat time ya unaccepted certificate yahin fail karta hai.</li>
<li><b>Join.</b> AP Join Request bhejta hai aur controller agar AP accept kare to Join Response bhejta hai.</li>
<li><b>Image data.</b> AP apna software version controller se compare karta hai. Alag ho to controller image download karke reboot hota hai aur dobara join karta hai. Isi liye naya AP aksar do baar join karta hai.</li>
<li><b>Configuration.</b> Controller tags, profiles, name, country aur radio settings bhejta hai.</li>
<li><b>Run.</b> Radios up hote hain, WLANs broadcast hote hain aur AP heartbeat keepalives bhejta hai.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="AP join states">
<rect x="10" y="30" width="86" height="50" rx="8" fill="#bae6fd"/><text x="53" y="60" text-anchor="middle" class="svg-ink" font-size="12">DHCP</text>
<rect x="110" y="30" width="86" height="50" rx="8" fill="#bae6fd"/><text x="153" y="60" text-anchor="middle" class="svg-ink" font-size="12">Discovery</text>
<rect x="210" y="30" width="86" height="50" rx="8" fill="#ddd6fe"/><text x="253" y="60" text-anchor="middle" class="svg-ink" font-size="12">DTLS</text>
<rect x="310" y="30" width="86" height="50" rx="8" fill="#ddd6fe"/><text x="353" y="60" text-anchor="middle" class="svg-ink" font-size="12">Join</text>
<rect x="410" y="30" width="96" height="50" rx="8" fill="#fde68a"/><text x="458" y="60" text-anchor="middle" class="svg-ink" font-size="12">Image data</text>
<rect x="520" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="12">Config - Run</text>
<line x1="96" y1="55" x2="110" y2="55" stroke="#64748b"/><line x1="196" y1="55" x2="210" y2="55" stroke="#64748b"/><line x1="296" y1="55" x2="310" y2="55" stroke="#64748b"/><line x1="396" y1="55" x2="410" y2="55" stroke="#64748b"/><line x1="506" y1="55" x2="520" y2="55" stroke="#64748b"/>
<text x="153" y="115" text-anchor="middle" class="svg-muted" font-size="12">controller pata nahi</text>
<text x="253" y="115" text-anchor="middle" class="svg-muted" font-size="12">time ya certificate</text>
<text x="458" y="115" text-anchor="middle" class="svg-muted" font-size="12">version alag: reboot</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">AP kahan atka hai, yeh batata hai kaun si layer check karni hai</text>
</svg><p class="cap">Discovery mein atka AP name-ya-address problem hai. DTLS par atka AP trust ya time problem hai. DHCP se aage na badhne wale AP ki problem switchport, PoE ya VLAN hai.</p></div>

<h3>Controller selection: AP kaise chunta hai</h3>
<p>Discovery se kai candidate controllers mil sakte hain. AP is order mein decide karta hai:</p>
<ol>
<li>AP par configured <b>primary, secondary aur tertiary</b> controller names (ek high-availability setting jo aap pehle se prime kar sakte ho).</li>
<li>Agar inme se koi jawab na de, to globally defined <b>primary, secondary ya tertiary backup controller</b> (fallback list).</li>
<li>Agar koi <b>master controller</b> mark hai to woh (mainly fresh unconfigured APs ke liye).</li>
<li>Nahi to sabse <b>kam load</b> wala controller, yaani capacity ke hisaab se sabse kam joined APs.</li>
</ol>
<p>Yeh discovery se alag hai. <b>Discovery candidates jama karta hai; selection winner chunta hai.</b> Dono exam ke favourites hain.</p>

<h3>Zinda rehna: heartbeat</h3>
<p>Run ke baad AP aur controller control tunnel par keepalives (CAPWAP echo requests) exchange karte hain, default roop se har 30 seconds mein. Agar lagatar kai miss ho jayein to dono side tunnel ko dead declare karte hain. Phir AP discovery dobara shuru karta hai aur configured ho to secondary ya tertiary controller try karta hai. Is window mein centrally switched WLAN ke clients service kho dete hain, isliye <b>AP failover</b> design matter karta hai. HA SSO aur N+1 designs yahan concepts hain, <b>lab mein simulate nahi hote</b>. Aage aane wala module: wl-mobility (Mobility and high availability).</p>

<h3>Lab mein kya dikhta hai</h3>
<p>Simulator join ka end result dikhata hai. Controller par main verification yeh hai:</p>
<pre class="out">WLC1# show ap summary
Number of APs: 0</pre>
<p>Pehle lab ke start mein yahi output dikhta hai: controller healthy hai, lekin zero APs registered hain. Repair ke baad wahi command AP1 aur AP2 ko Registered dikhata hai. Lab ke AP consoles <code>ip dhcp</code> bhi accept karte hain, jisse AP naya lease maangta hai. Yeh lab mein AP reboot karne, ya lease expire hone ka intezaar karne ke barabar hai.</p>

<div class="eg"><p><b>Worked example: stage padhna.</b> AP1 ke paas address 10.10.10.21 hai aur LED pattern kehta hai "looking for controller". WLC par koi entry nahi. Conclusion: DHCP chala (IP hai), discovery fail hui (koi controller pata nahi ya reachable nahi). Agla sawaal: AP1 VLAN 10 se 10.10.99.10 kaise seekhe? Yeh DHCP option 43, DNS ya primed address ki taraf ishara karta hai, aur agle chapter mein har ek padhoge.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) AP ko baar baar reboot karna bina yeh padhe ki woh kis stage mein hai. (2) Bhool jaana ki version mismatch par AP image download karke reboot hota hai: use unplug mat karo. (3) Heartbeat timeout ko controller fault maan lena jabki asli wajah path par packet loss hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> States ka order: discovery, DTLS setup, join, image data, config, run. Selection order primed primary/secondary/tertiary, phir backups, phir master, phir least loaded. Discovery methods ko selection algorithm se mix mat karo.</p></div>

<div class="scn"><h4>Do baar reboot hone wala AP</h4><p>Ek technician ne naya AP mount kiya aur dekha ki woh join hua, chaar minute ke liye gayab hua aur dobara join hua. Unhone socha AP faulty hai aur RMA shuru kar diya. Senior engineer ne controller log dekha: AP ka software version alag tha, usne controller image download ki aur design ke mutabiq reboot hua.</p><p><b>Seekh:</b> image download ke saath pehla join normal hai. Hardware replace karne se pehle stages seekho.</p></div>

<div class="iv"><p class="q">"AP plug karne par kya hota hai, walk me through."</p><p>Sequence batao: PoE aur boot, DHCP lease, learned controllers ko discovery requests, controller selection, DTLS handshake, join, image comparison aur possible download, configuration, phir heartbeats ke saath Run. Har stage ke liye ek troubleshooting hint add karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Join states: DHCP, discovery, DTLS, join, image data, config, run.</li>
<li>Discovery candidate controllers jama karta hai; selection priority aur load se ek chunta hai.</li>
<li>Naya AP aksar join, image download aur rejoin karta hai: yeh normal hai.</li>
<li>Control tunnel ke heartbeats dead path ya controller detect karte hain.</li>
<li>AP jis stage par ruke, wahi batata hai kaun si layer troubleshoot karni hai.</li>
</ul></div>
`}};export{e as default};