var e={id:`route-types`,h:{en:`EVPN route types 1 to 5 and how to read them`,hi:`EVPN route types 1 se 5 aur unhe kaise padhein`},body:{en:`
<p>EVPN is BGP carrying a new kind of prefix. Instead of an IP network, each prefix (called an <b>NLRI</b>, network layer reachability information) describes a Layer 2 fact: "this VTEP serves this VNI", "this MAC lives behind this VTEP". There are five route types, and the exam expects you to know what each one is for. Types 2 and 3 are the ones you will see in every lab; types 1 and 4 appear when a server is dual-homed (chapter 7); type 5 carries IP prefixes for routed designs.</p>

<h3>The five route types</h3>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>Junos prefix pattern</th><th>Job</th></tr>
<tr><td>1</td><td>Ethernet auto-discovery (AD)</td><td>per EVI and per ES, carries the ESI</td><td>Multihoming: aliasing and fast mass withdrawal</td></tr>
<tr><td>2</td><td>MAC/IP advertisement</td><td><code>2:RD::VNI::MAC</code> and <code>2:RD::VNI::MAC::IP</code></td><td>A host MAC (and IP) learned on a local port</td></tr>
<tr><td>3</td><td>Inclusive multicast Ethernet tag (IM)</td><td><code>3:RD::VNI::VTEP</code></td><td>"I serve this VNI": builds the flood list for BUM traffic</td></tr>
<tr><td>4</td><td>Ethernet segment (ES)</td><td>carries the ESI and the originating VTEP</td><td>Finds the other leaves on the same segment and elects the designated forwarder</td></tr>
<tr><td>5</td><td>IP prefix</td><td>IP prefix with a gateway</td><td>Routing between tenant VRFs, external connectivity</td></tr></table>
<p>The rest of the chapter reads real type-2 and type-3 routes from the "Build a two-leaf fabric" lab. The type-1, 4 and 5 rows are explained but not shown as output, because the labs do not configure multihoming or Layer 3 gateways.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Type 3 and type 2">
<rect x="20" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="260" y="30" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="320" y="71" text-anchor="middle" class="svg-muted" font-size="11">route reflector</text>
<rect x="500" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<line x1="140" y1="55" x2="260" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="500" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="200" y="100" text-anchor="middle" class="svg-accent" font-size="12">type 3: I serve VNI 1010</text>
<text x="440" y="100" text-anchor="middle" class="svg-accent" font-size="12">type 2: MAC of PC2 is here</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Next hop stays the originating leaf loopback</text>
</svg><p class="cap">Type 3 builds the VTEP list; type 2 says where each MAC lives.</p></div>

<h3>Reading bgp.evpn.0</h3>
<p>After the leaves are configured and PC1 pings PC2, LEAF1 holds six routes. Three are type 3 or type 2 from itself (protocol EVPN), three come from LEAF2 via the spine (protocol BGP):</p>
<pre class="out">lab@LEAF1&gt; show route table bgp.evpn.0
bgp.evpn.0: 6 destinations, 6 routes (6 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both
2:10.30.255.11:1::1010::00:50:7f:06:6d:01/304 MAC/IP
                   *[EVPN/170] 00:00:33
                       Indirect
2:10.30.255.11:1::1010::00:50:7f:06:6d:01::10.30.10.21/304 MAC/IP
                   *[EVPN/170] 00:00:33
                       Indirect
2:10.30.255.12:1::1010::00:50:80:06:6e:01/304 MAC/IP
                   *[BGP/170] 00:00:05, localpref 100, from 10.30.255.1
                      AS path: I (Originator), validation-state: unverified
                    &gt;  to 10.30.0.0 via ge-0/0/0.0
<span class="hl">3:10.30.255.12:1::1010::10.30.255.12/248 IM</span>
                   *[BGP/170] 00:00:05, localpref 100, from 10.30.255.1
                      AS path: I (Originator), validation-state: unverified
                    &gt;  to 10.30.0.0 via ge-0/0/0.0</pre>
<p>(Two routes omitted for length: the MAC+IP route of PC2 and LEAF1's own type 3.) Decode one line at a time:</p>
<ul>
<li><code>2:10.30.255.12:1::1010::00:50:80:06:6e:01/304</code> : type <b>2</b>, route distinguisher <code>10.30.255.12:1</code> (LEAF2's loopback plus 1), VNI <b>1010</b>, MAC address of PC2. The suffix /304 is the NLRI length in bits for a MAC route; MAC+IP routes show the IP after the MAC.</li>
<li><code>3:10.30.255.12:1::1010::10.30.255.12/248 IM</code> : type <b>3</b>, the last field is the VTEP address of the originator. IM means inclusive multicast.</li>
<li><code>[EVPN/170]</code> marks a route created locally; <code>[BGP/170]</code> marks one learned from the spine. <code>from 10.30.255.1</code> is the route reflector.</li>
<li><code>AS path: I (Originator)</code> shows the reflector kept the originator: the route really came from LEAF2.</li>
</ul>

<h3>Inside a type-2 route</h3>
<pre class="out">lab@LEAF1&gt; show route table bgp.evpn.0 match-prefix 2:* extensive
2:10.30.255.12:1::1010::00:50:80:06:6e:01/304 MAC/IP (1 entry, 1 announced)
        *BGP    Preference: 170/-101
                Route Distinguisher: 10.30.255.12:1
                Next hop type: Indirect
                Source: 10.30.255.1
                <span class="hl">Protocol next hop: 10.30.255.12</span>
                Local AS: 65030 Peer AS: 65030
                AS path: I (Originator)
                Cluster list:  10.30.255.1
                Originator ID: 10.30.255.12
                <span class="hl">Communities: target:65030:1 encapsulation:vxlan(0x8)</span>
                Import Accepted
                <span class="hl">Route Label: 1010</span>
                ESI: 00:00:00:00:00:00:00:00:00:00
                Secondary Tables: default-switch.evpn.0</pre>
<p>(Fields trimmed.) Four details to memorise. The <b>protocol next hop</b> is the VTEP loopback of the leaf that learned the MAC, not the spine, so the tunnel goes straight to LEAF2. The <b>community</b> carries the route target (which decides who imports it) and <code>encapsulation:vxlan</code>. The <b>route label</b> carries the VNI. The <b>ESI</b> is all zeros because PC2 is single-homed; a dual-homed server would show a real ESI here. <code>Import Accepted</code> and <code>Secondary Tables: default-switch.evpn.0</code> say the route passed the import policy and was copied into the instance.</p>

<h3>Type 3 and the flood list</h3>
<p>A type-3 route has a PMSI attribute that tells receivers how BUM (broadcast, unknown unicast, multicast) traffic is delivered. Here, taken from the spine in the troubleshooting lab:</p>
<pre class="out">3:10.50.255.11:1::1010::10.50.255.11/248 IM (1 entry, 1 announced)
        *BGP    Preference: 170/-101
                Route Distinguisher: 10.50.255.11:1
                Protocol next hop: 10.50.255.11
                Communities: target:65050:1 encapsulation:vxlan(0x8)
                <span class="hl">PMSI: Flags 0x0: Label 1010: Type INGRESS-REPLICATION 10.50.255.11</span></pre>
<p><b>Ingress replication</b> means no multicast is needed in the underlay: the ingress leaf sends one unicast VXLAN copy of each BUM frame to every VTEP that announced a type 3 for that VNI.</p>

<div class="eg"><p><b>Worked example.</b> PC1 ARPs for PC2. LEAF1 looks at the type-3 routes for VNI 1010. It has one from LEAF2 (10.30.255.12), so it sends one VXLAN copy of the ARP to that VTEP. LEAF2 delivers it and PC2 replies. LEAF1 had already advertised PC1's MAC in a type 2 as soon as it learned it, so LEAF2 already knows PC1 is behind 10.30.255.11 and sends the reply as a single unicast VXLAN packet.</p><p>Note the contrast: the ARP request was flooded using type 3, while the reply was forwarded using type 2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading the RD as the next hop. (2) Expecting type 2 routes before any host traffic: they appear only after a MAC is learned. (3) Confusing the RD (uniqueness) with the route target (import policy).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which route type builds the flood list?" Type 3. "Which carries a MAC?" Type 2. "Which finds the other leaves on a segment?" Type 4. "Which enables aliasing?" Type 1 per EVI. Type 5 is for IP prefixes. Memorise the five jobs.</p></div>

<div class="scn"><h4>Hosts reachable by IP only after a ping</h4><p>An engineer saw no type-2 routes on a freshly built leaf and feared a fault. The hosts behind it were silent: no ARP, no frames, so no MAC had been learned. Once a host sent traffic the type-2 routes appeared within seconds. The type-3 routes had been there from the start.</p><p><b>Lesson:</b> type 3 appears when the VNI is configured; type 2 appears when a MAC is learned.</p></div>

<div class="iv"><p class="q">"What are EVPN route types 2 and 3 used for?"</p><p>Type 3, inclusive multicast, announces that a VTEP serves a VNI and, with its PMSI attribute, how BUM traffic should be replicated; every leaf builds its per-VNI flood list from it. Type 2 advertises a MAC, optionally with its IP, together with the VNI label, route target and the originating VTEP as next hop, so remote leaves install it in the MAC table pointing at the right tunnel.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five types: 1 AD, 2 MAC/IP, 3 inclusive multicast, 4 Ethernet segment, 5 IP prefix.</li>
<li>Type 3 announces VNI membership and ingress replication; type 2 announces a MAC.</li>
<li>Protocol next hop is the originating leaf loopback; the route label is the VNI.</li>
<li><code>[EVPN/170]</code> is local, <code>[BGP/170]</code> is learned; the spine reflects but does not change the next hop.</li>
<li>Use <code>match-prefix 2:*</code> or <code>3:*</code> to filter the table.</li>
</ul></div>
`,hi:`
<p>EVPN naye kism ka prefix le jaane wala BGP hai. IP network ki jagah har prefix (jise <b>NLRI</b>, network layer reachability information kehte hain) ek Layer 2 fact batata hai: "yeh VTEP yeh VNI serve karta hai", "yeh MAC is VTEP ke peeche hai". Paanch route types hain, aur exam mein har ek ka kaam aana chahiye. Types 2 aur 3 har lab mein dikhenge; types 1 aur 4 tab aate hain jab server dual-homed ho (chapter 7); type 5 routed designs ke liye IP prefixes le jaata hai.</p>

<h3>Paanch route types</h3>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Junos prefix pattern</th><th>Kaam</th></tr>
<tr><td>1</td><td>Ethernet auto-discovery (AD)</td><td>per EVI aur per ES, ESI le jaata hai</td><td>Multihoming: aliasing aur fast mass withdrawal</td></tr>
<tr><td>2</td><td>MAC/IP advertisement</td><td><code>2:RD::VNI::MAC</code> aur <code>2:RD::VNI::MAC::IP</code></td><td>Local port par seekha host MAC (aur IP)</td></tr>
<tr><td>3</td><td>Inclusive multicast Ethernet tag (IM)</td><td><code>3:RD::VNI::VTEP</code></td><td>"Main yeh VNI serve karta hoon": BUM traffic ki flood list banata hai</td></tr>
<tr><td>4</td><td>Ethernet segment (ES)</td><td>ESI aur originating VTEP le jaata hai</td><td>Same segment ke doosre leaves dhoondta hai aur designated forwarder chunta hai</td></tr>
<tr><td>5</td><td>IP prefix</td><td>Gateway ke saath IP prefix</td><td>Tenant VRFs ke beech routing, external connectivity</td></tr></table>
<p>Chapter ka baaki hissa "Do-leaf fabric banao" lab ke asli type-2 aur type-3 routes padhta hai. Type-1, 4 aur 5 ki rows samjhayi gayi hain lekin output ke roop mein nahi dikhayi gayi, kyunki labs multihoming ya Layer 3 gateways configure nahi karte.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Type 3 and type 2">
<rect x="20" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="260" y="30" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="320" y="71" text-anchor="middle" class="svg-muted" font-size="11">route reflector</text>
<rect x="500" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<line x1="140" y1="55" x2="260" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="500" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="200" y="100" text-anchor="middle" class="svg-accent" font-size="12">type 3: main VNI 1010 serve karta hoon</text>
<text x="440" y="100" text-anchor="middle" class="svg-accent" font-size="12">type 2: PC2 ka MAC yahan hai</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Next hop originating leaf ka loopback hi rehta hai</text>
</svg><p class="cap">Type 3 VTEP list banata hai; type 2 batata hai har MAC kahan hai.</p></div>

<h3>bgp.evpn.0 padhna</h3>
<p>Leaves configure hone aur PC1 ke PC2 ko ping karne ke baad LEAF1 ke paas chhe routes hain. Teen khud ke type 3 ya type 2 (protocol EVPN), teen LEAF2 ke spine ke through (protocol BGP):</p>
<pre class="out">lab@LEAF1&gt; show route table bgp.evpn.0
bgp.evpn.0: 6 destinations, 6 routes (6 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both
2:10.30.255.11:1::1010::00:50:7f:06:6d:01/304 MAC/IP
                   *[EVPN/170] 00:00:33
                       Indirect
2:10.30.255.11:1::1010::00:50:7f:06:6d:01::10.30.10.21/304 MAC/IP
                   *[EVPN/170] 00:00:33
                       Indirect
2:10.30.255.12:1::1010::00:50:80:06:6e:01/304 MAC/IP
                   *[BGP/170] 00:00:05, localpref 100, from 10.30.255.1
                      AS path: I (Originator), validation-state: unverified
                    &gt;  to 10.30.0.0 via ge-0/0/0.0
<span class="hl">3:10.30.255.12:1::1010::10.30.255.12/248 IM</span>
                   *[BGP/170] 00:00:05, localpref 100, from 10.30.255.1
                      AS path: I (Originator), validation-state: unverified
                    &gt;  to 10.30.0.0 via ge-0/0/0.0</pre>
<p>(Lambai ki wajah se do routes hata diye: PC2 ka MAC+IP route aur LEAF1 ka apna type 3.) Ek-ek line decode karo:</p>
<ul>
<li><code>2:10.30.255.12:1::1010::00:50:80:06:6e:01/304</code> : type <b>2</b>, route distinguisher <code>10.30.255.12:1</code> (LEAF2 ka loopback aur 1), VNI <b>1010</b>, PC2 ka MAC address. /304 MAC route ke liye NLRI ki bits mein lambai hai; MAC+IP routes mein MAC ke baad IP dikhta hai.</li>
<li><code>3:10.30.255.12:1::1010::10.30.255.12/248 IM</code> : type <b>3</b>, aakhri field originator ka VTEP address hai. IM ka matlab inclusive multicast.</li>
<li><code>[EVPN/170]</code> locally bana route hai; <code>[BGP/170]</code> spine se seekha hua. <code>from 10.30.255.1</code> route reflector hai.</li>
<li><code>AS path: I (Originator)</code> dikhata hai ki reflector ne originator rakha: route asal mein LEAF2 se aaya.</li>
</ul>

<h3>Type-2 route ke andar</h3>
<pre class="out">lab@LEAF1&gt; show route table bgp.evpn.0 match-prefix 2:* extensive
2:10.30.255.12:1::1010::00:50:80:06:6e:01/304 MAC/IP (1 entry, 1 announced)
        *BGP    Preference: 170/-101
                Route Distinguisher: 10.30.255.12:1
                Next hop type: Indirect
                Source: 10.30.255.1
                <span class="hl">Protocol next hop: 10.30.255.12</span>
                Local AS: 65030 Peer AS: 65030
                AS path: I (Originator)
                Cluster list:  10.30.255.1
                Originator ID: 10.30.255.12
                <span class="hl">Communities: target:65030:1 encapsulation:vxlan(0x8)</span>
                Import Accepted
                <span class="hl">Route Label: 1010</span>
                ESI: 00:00:00:00:00:00:00:00:00:00
                Secondary Tables: default-switch.evpn.0</pre>
<p>(Fields trim kiye gaye.) Chaar baatein yaad rakho. <b>Protocol next hop</b> us leaf ka VTEP loopback hai jisne MAC seekha, spine nahi, isliye tunnel seedha LEAF2 tak jaata hai. <b>Community</b> route target (jo tay karta hai kaun import karega) aur <code>encapsulation:vxlan</code> le jaati hai. <b>Route label</b> VNI le jaata hai. <b>ESI</b> sab zero hai kyunki PC2 single-homed hai; dual-homed server yahan asli ESI dikhata. <code>Import Accepted</code> aur <code>Secondary Tables: default-switch.evpn.0</code> batate hain ki route import policy se guzra aur instance mein copy hua.</p>

<h3>Type 3 aur flood list</h3>
<p>Type-3 route ke paas PMSI attribute hota hai jo receivers ko batata hai ki BUM (broadcast, unknown unicast, multicast) traffic kaise deliver hoga. Yahan troubleshooting lab ke spine se liya gaya:</p>
<pre class="out">3:10.50.255.11:1::1010::10.50.255.11/248 IM (1 entry, 1 announced)
        *BGP    Preference: 170/-101
                Route Distinguisher: 10.50.255.11:1
                Protocol next hop: 10.50.255.11
                Communities: target:65050:1 encapsulation:vxlan(0x8)
                <span class="hl">PMSI: Flags 0x0: Label 1010: Type INGRESS-REPLICATION 10.50.255.11</span></pre>
<p><b>Ingress replication</b> ka matlab underlay mein multicast ki zaroorat nahi: ingress leaf har BUM frame ki ek unicast VXLAN copy us har VTEP ko bhejta hai jisne us VNI ke liye type 3 announce kiya.</p>

<div class="eg"><p><b>Worked example.</b> PC1 PC2 ke liye ARP karta hai. LEAF1 VNI 1010 ke type-3 routes dekhta hai. Uske paas LEAF2 (10.30.255.12) ka ek hai, to woh ARP ki ek VXLAN copy us VTEP ko bhejta hai. LEAF2 deliver karta hai aur PC2 reply karta hai. LEAF1 ne PC1 ka MAC seekhte hi type 2 se advertise kar diya tha, isliye LEAF2 ko pehle se pata hai ki PC1 10.30.255.11 ke peeche hai aur reply ek single unicast VXLAN packet mein bhejta hai.</p><p>Farq dekho: ARP request type 3 se flood hua, jabki reply type 2 se forward hua.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) RD ko next hop padhna. (2) Host traffic se pehle type 2 routes ki umeed: woh MAC seekhne ke baad hi aate hain. (3) RD (uniqueness) ko route target (import policy) se milana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Flood list kaun sa route type banata hai?" Type 3. "MAC kaun le jaata hai?" Type 2. "Segment ke doosre leaves kaun dhoondta hai?" Type 4. "Aliasing kaun enable karta hai?" Type 1 per EVI. Type 5 IP prefixes ke liye hai. Paanchon ke kaam yaad karo.</p></div>

<div class="scn"><h4>Hosts sirf ping ke baad dikhe</h4><p>Ek engineer ko naye bane leaf par koi type-2 route nahi dikha aur usne fault samjha. Uske peeche ke hosts chup the: na ARP, na frames, isliye koi MAC seekha hi nahi gaya tha. Host ke traffic bhejte hi type-2 routes kuch seconds mein aa gaye. Type-3 routes shuru se maujood the.</p><p><b>Lesson:</b> type 3 VNI configure hote hi aata hai; type 2 MAC seekhne par aata hai.</p></div>

<div class="iv"><p class="q">"EVPN route types 2 aur 3 kis liye hote hain?"</p><p>Type 3, inclusive multicast, announce karta hai ki VTEP ek VNI serve karta hai aur apne PMSI attribute se batata hai ki BUM traffic kaise replicate hoga; har leaf isi se apni per-VNI flood list banata hai. Type 2 MAC (optionally IP ke saath) VNI label, route target aur originating VTEP ko next hop ke saath advertise karta hai, taaki remote leaves use MAC table mein sahi tunnel ki taraf point karke install karein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch types: 1 AD, 2 MAC/IP, 3 inclusive multicast, 4 Ethernet segment, 5 IP prefix.</li>
<li>Type 3 VNI membership aur ingress replication announce karta hai; type 2 MAC announce karta hai.</li>
<li>Protocol next hop originating leaf loopback hai; route label VNI hai.</li>
<li><code>[EVPN/170]</code> local hai, <code>[BGP/170]</code> seekha hua; spine reflect karta hai lekin next hop nahi badalta.</li>
<li>Table filter karne ke liye <code>match-prefix 2:*</code> ya <code>3:*</code> use karo.</li>
</ul></div>
`}};export{e as default};