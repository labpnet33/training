var e={id:`port-roles`,h:{en:`Root, designated and blocked ports: worked examples`,hi:`Root, designated aur blocked ports: worked examples`},body:{en:`
<p>Once the root bridge is known, every switch answers two questions. "Which of my ports is my way home to the root?" and "On each cable, who is responsible for sending traffic away from the root?" Think of a family tree: each person has exactly one parent link upward (the <b>root port</b>), and each branch has exactly one person responsible for it (the <b>designated port</b>). Any cable that would give someone a second parent is cut (the <b>blocked</b> or <b>alternate</b> port).</p>

<h3>The three rules</h3>
<ol>
<li><b>The root bridge</b>: all its working ports are <b>designated</b>. It has no root port.</li>
<li><b>Every non-root switch</b> picks exactly <b>one root port (RP)</b>, the port with the best path to the root. Tie-breakers, in order:
<ol><li>lowest root path cost (BPDU cost + receiving port cost);</li>
<li>lowest <b>sender (neighbour) Bridge ID</b>;</li>
<li>lowest <b>sender (neighbour) Port ID</b>, the port priority and number inside the neighbour's BPDU;</li>
<li>lowest local Port ID (only with a hub or a loopback cable).</li></ol></li>
<li><b>Every link (segment)</b> has exactly <b>one designated port (DP)</b>: the port on the switch that advertises the lowest root path cost onto that link. Ties go to the lower Bridge ID, then the lower Port ID.</li>
</ol>
<p>Every remaining port is <b>non-designated</b>: blocking in 802.1D, <b>alternate</b> (or backup) and discarding in RSTP.</p>
<p>A <b>Port ID</b> is 16 bits: a 4-bit port priority (0 to 240 in steps of 16, default <b>128</b>) and a 12-bit port number. IOS shows it as <code>128.2</code>.</p>

<h3>Worked example 1: the lab with default priorities</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Lab triangle with default roles">
<rect x="60" y="30" width="160" height="50" rx="8" fill="#fde68a"/><text x="140" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1 root</text><text x="140" y="70" text-anchor="middle" class="svg-muted" font-size="12">32778 5254.0023.a200</text>
<rect x="420" y="30" width="160" height="50" rx="8" fill="#bae6fd"/><text x="500" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="500" y="70" text-anchor="middle" class="svg-muted" font-size="12">32778 5254.ff23.a000</text>
<rect x="240" y="190" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">32778 5254.fe23.9f00</text>
<line x1="220" y1="55" x2="420" y2="55" stroke="#64748b" stroke-width="3"/>
<line x1="150" y1="80" x2="270" y2="190" stroke="#64748b" stroke-width="3"/>
<line x1="490" y1="80" x2="370" y2="190" stroke="#64748b" stroke-width="3"/>
<text x="235" y="48" class="svg-accent" font-size="12">DP</text><text x="390" y="48" class="svg-accent" font-size="12">RP</text>
<text x="160" y="112" class="svg-accent" font-size="12">DP</text><text x="240" y="178" class="svg-accent" font-size="12">RP</text>
<text x="480" y="112" class="svg-ink" font-size="12">ALT (blocks)</text><text x="385" y="178" class="svg-accent" font-size="12">DP</text>
<line x1="468" y1="100" x2="486" y2="116" stroke="#64748b" stroke-width="5"/>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="12">SW2-SW3 tie at cost 4: SW3 has the lower MAC, so SW3 owns the DP</text>
</svg><p class="cap">With defaults the blocked port lands on distribution switch SW2, not on access switch SW3.</p></div>

<div class="eg"><p><b>Walk through it.</b></p>
<ul>
<li>Root: SW1 (lowest MAC, chapter 5). Both SW1 ports are designated.</li>
<li>SW2 root port: via Gi0/1 directly to SW1 = 0 + 4 = 4; via Gi0/2 through SW3 = 4 + 4 = 8. RP = <b>Gi0/1</b>.</li>
<li>SW3 root port: via Gi0/1 to SW1 = 4; via Gi0/2 through SW2 = 8. RP = <b>Gi0/1</b>.</li>
<li>Segment SW2-SW3: SW2 advertises root path cost 4, SW3 advertises 4. Tie. Next, lower Bridge ID: both 32778, MAC 5254.fe23... (SW3) is lower than 5254.ff23... (SW2). SW3 Gi0/2 is <b>designated</b>; SW2 Gi0/2 is <b>alternate, discarding</b>.</li>
</ul></div>

<pre class="out">SW2# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.2    P2p
<span class="hl">Gi0/2               Altn BLK 4         128.3    P2p</span>

SW3# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.2    P2p
Gi0/2               Desg FWD 4         128.3    P2p
Gi0/5               Desg FWD 4         128.6    P2p</pre>
<p>This is legal but ugly: traffic between SW2 and SW3 must go through SW1, and if SW2 were a gateway, SW3 would become a transit switch. That is exactly why chapter 9 sets priorities on purpose. Note too that in the lab, "which SW3 port is blocking?" has a surprising answer with defaults: <b>none</b>.</p>

<h3>Worked example 2: the square from chapter 5</h3>
<p>SWA is root. Root path costs: SWB 2, SWC 4, SWD 6 (through SWB).</p>
<ul>
<li>Root ports: SWB toward SWA, SWC toward SWA, SWD toward SWB.</li>
<li>Segment SWA-SWB and SWA-SWC: SWA advertises 0, so SWA's ports are DPs.</li>
<li>Segment SWB-SWD: SWB advertises 2, SWD advertises 6. SWB's port is DP; SWD's end is its root port.</li>
<li>Segment SWC-SWD: SWC advertises 4, SWD advertises 6. SWC's port is DP, so SWD's port toward SWC is <b>alternate</b> and discards.</li>
</ul>
<p>Check yourself: one root port per non-root switch (3), one DP per link (4), and exactly one blocked port because the square contains exactly one loop.</p>

<h3>Worked example 3: two parallel cables</h3>
<p>ACC-SW2 has two 1 Gbps links to DIST-SW1, which is root. Both give cost 4, both lead to the same neighbour Bridge ID, so the tie-breaker is the <b>sender port ID</b> in DIST-SW1's BPDUs, not ACC-SW2's own numbers. DIST-SW1 Gi0/1 sends 128.2 and Gi0/2 sends 128.3, so whichever ACC-SW2 port is cabled to DIST-SW1 Gi0/1 becomes the root port. If the cables are crossed (DIST-SW1 Gi0/1 to ACC-SW2 Gi0/2), ACC-SW2 <b>Gi0/2</b> becomes root port. To influence the choice you change <code>port-priority</code> on the <b>upstream</b> switch (chapter 9); the real-world fix is usually an EtherChannel (next module).</p>

<div class="tip"><p><b>Exam recipe.</b> 1) Find the root (lowest BID). 2) Write root path cost next to every switch. 3) Mark one RP per non-root switch. 4) For each link, mark the DP (lower advertised cost, then lower BID). 5) Every unmarked port blocks. The number of blocked ports equals the number of independent loops.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming the port that blocks is always on the access switch or on the "farthest" switch. On a tied segment, the switch with the <b>higher Bridge ID</b> blocks, wherever it is.</p></div>

<div class="exam"><p><b>Exam trap.</b> For the root port, the switch compares the <b>neighbour's</b> Bridge ID and Port ID carried in the BPDU. Answers that say "the lowest local port number" are only right as the final tie-breaker. Also remember: the root bridge never has a root port.</p></div>

<div class="scn"><h4>The gateway behind a blocked port</h4><p>A school's two distribution switches, DIST-A and DIST-B, both had default priority, so DIST-A became root by lowest MAC. The library access switch had a lower MAC than DIST-B, so on the DIST-B to library link the library switch won the designated port and <b>DIST-B's</b> end blocked. DIST-B was the active HSRP gateway for the library VLAN, so every library frame to the gateway travelled library, DIST-A, DIST-B, crossing an inter-distribution link already busy with backups. Users saw slow pages at night. The team made DIST-B <code>root primary</code> for the library VLAN and DIST-A <code>root secondary</code>; the library switch's direct uplink to DIST-B became its root port and the gateway path became one hop.</p><p><b>Lesson:</b> with default priorities, MAC addresses decide where blocking happens; design it instead.</p></div>

<div class="iv"><p class="q">"How does STP decide which port on a link becomes designated?"</p><p>Strong answer: on every segment the switch advertising the lowest root path cost wins the designated port. If the costs tie, the lower sender Bridge ID wins, then the lower sender Port ID. The losing end becomes non-designated: blocking in 802.1D, alternate discarding in RSTP. Add that the root bridge's ports are always designated and every non-root switch has exactly one root port.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Root bridge: all ports designated. Non-root switch: exactly one root port.</li>
<li>Root port tie-breakers: lowest cost, lowest neighbour BID, lowest neighbour port ID, lowest local port ID.</li>
<li>Designated port per link: lowest advertised root path cost, then lowest BID, then lowest port ID.</li>
<li>Everything else is blocking (802.1D) or alternate/backup discarding (RSTP).</li>
<li>With defaults, the lab blocks SW2 Gi0/2 in VLAN 10, because SW3's MAC is lower than SW2's.</li>
</ul></div>
`,hi:`
<p>Root bridge pata chalte hi har switch do sawaalon ka jawab deta hai. "Mere kaunse port se root tak ghar ka raasta hai?" aur "Har cable par, root se door traffic bhejne ki zimmedari kiski hai?" Ek family tree socho: har insaan ka upar ki taraf bilkul ek parent link hota hai (<b>root port</b>), aur har branch ka bilkul ek zimmedar insaan hota hai (<b>designated port</b>). Jo cable kisi ko doosra parent de deti, use kaat diya jaata hai (<b>blocked</b> ya <b>alternate</b> port).</p>

<h3>Teen rules</h3>
<ol>
<li><b>Root bridge</b>: iske saare chalte ports <b>designated</b> hote hain. Iska koi root port nahi hota.</li>
<li><b>Har non-root switch</b> bilkul <b>ek root port (RP)</b> chunta hai, jiska root tak path sabse accha ho. Tie-breakers, is order mein:
<ol><li>sabse kam root path cost (BPDU cost + receiving port cost);</li>
<li>sabse kam <b>sender (neighbour) Bridge ID</b>;</li>
<li>sabse kam <b>sender (neighbour) Port ID</b>, neighbour ke BPDU ke andar ki port priority aur number;</li>
<li>sabse kam local Port ID (sirf hub ya loopback cable ke saath).</li></ol></li>
<li><b>Har link (segment)</b> par bilkul <b>ek designated port (DP)</b> hota hai: us switch ka port jo us link par sabse kam root path cost advertise karta hai. Tie ho to kam Bridge ID, phir kam Port ID.</li>
</ol>
<p>Baaki har port <b>non-designated</b> hai: 802.1D mein blocking, RSTP mein <b>alternate</b> (ya backup) aur discarding.</p>
<p><b>Port ID</b> 16 bits ka hai: 4-bit port priority (0 se 240, 16 ke steps mein, default <b>128</b>) aur 12-bit port number. IOS ise <code>128.2</code> ki tarah dikhata hai.</p>

<h3>Worked example 1: default priorities ke saath lab</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Default roles ke saath lab triangle">
<rect x="60" y="30" width="160" height="50" rx="8" fill="#fde68a"/><text x="140" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1 root</text><text x="140" y="70" text-anchor="middle" class="svg-muted" font-size="12">32778 5254.0023.a200</text>
<rect x="420" y="30" width="160" height="50" rx="8" fill="#bae6fd"/><text x="500" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="500" y="70" text-anchor="middle" class="svg-muted" font-size="12">32778 5254.ff23.a000</text>
<rect x="240" y="190" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">32778 5254.fe23.9f00</text>
<line x1="220" y1="55" x2="420" y2="55" stroke="#64748b" stroke-width="3"/>
<line x1="150" y1="80" x2="270" y2="190" stroke="#64748b" stroke-width="3"/>
<line x1="490" y1="80" x2="370" y2="190" stroke="#64748b" stroke-width="3"/>
<text x="235" y="48" class="svg-accent" font-size="12">DP</text><text x="390" y="48" class="svg-accent" font-size="12">RP</text>
<text x="160" y="112" class="svg-accent" font-size="12">DP</text><text x="240" y="178" class="svg-accent" font-size="12">RP</text>
<text x="480" y="112" class="svg-ink" font-size="12">ALT (block)</text><text x="385" y="178" class="svg-accent" font-size="12">DP</text>
<line x1="468" y1="100" x2="486" y2="116" stroke="#64748b" stroke-width="5"/>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="12">SW2-SW3 par cost 4 ka tie: SW3 ka MAC chhota, isliye DP SW3 ka</text>
</svg><p class="cap">Defaults ke saath blocked port distribution switch SW2 par aata hai, access switch SW3 par nahi.</p></div>

<div class="eg"><p><b>Step by step.</b></p>
<ul>
<li>Root: SW1 (sabse chhota MAC, chapter 5). SW1 ke dono ports designated.</li>
<li>SW2 root port: Gi0/1 se seedha SW1 = 0 + 4 = 4; Gi0/2 se SW3 ke through = 4 + 4 = 8. RP = <b>Gi0/1</b>.</li>
<li>SW3 root port: Gi0/1 se SW1 = 4; Gi0/2 se SW2 ke through = 8. RP = <b>Gi0/1</b>.</li>
<li>Segment SW2-SW3: SW2 root path cost 4 advertise karta hai, SW3 bhi 4. Tie. Agla, kam Bridge ID: dono 32778, MAC 5254.fe23... (SW3) 5254.ff23... (SW2) se chhota hai. SW3 Gi0/2 <b>designated</b> hai; SW2 Gi0/2 <b>alternate, discarding</b> hai.</li>
</ul></div>

<pre class="out">SW2# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.2    P2p
<span class="hl">Gi0/2               Altn BLK 4         128.3    P2p</span>

SW3# show spanning-tree vlan 10 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.2    P2p
Gi0/2               Desg FWD 4         128.3    P2p
Gi0/5               Desg FWD 4         128.6    P2p</pre>
<p>Yeh legal hai par bura hai: SW2 aur SW3 ke beech traffic ko SW1 se hokar jaana padta hai, aur agar SW2 gateway hota to SW3 transit switch ban jaata. Isiliye chapter 9 priorities jaan-boojh kar set karta hai. Yeh bhi dekho ki lab mein defaults ke saath "SW3 ka kaunsa port block ho raha hai?" ka jawab surprising hai: <b>koi nahi</b>.</p>

<h3>Worked example 2: chapter 5 ka square</h3>
<p>SWA root hai. Root path costs: SWB 2, SWC 4, SWD 6 (SWB ke through).</p>
<ul>
<li>Root ports: SWB SWA ki taraf, SWC SWA ki taraf, SWD SWB ki taraf.</li>
<li>Segment SWA-SWB aur SWA-SWC: SWA 0 advertise karta hai, isliye SWA ke ports DPs hain.</li>
<li>Segment SWB-SWD: SWB 2 advertise karta hai, SWD 6. SWB ka port DP hai; SWD ka end uska root port hai.</li>
<li>Segment SWC-SWD: SWC 4 advertise karta hai, SWD 6. SWC ka port DP hai, isliye SWD ka SWC ki taraf wala port <b>alternate</b> hai aur discard karta hai.</li>
</ul>
<p>Khud check karo: har non-root switch ka ek root port (3), har link ka ek DP (4), aur bilkul ek blocked port kyunki square mein bilkul ek loop hai.</p>

<h3>Worked example 3: do parallel cables</h3>
<p>ACC-SW2 ke DIST-SW1 tak do 1 Gbps links hain, aur DIST-SW1 root hai. Dono cost 4 dete hain, dono same neighbour Bridge ID tak jaate hain, isliye tie-breaker DIST-SW1 ke BPDUs mein aane wala <b>sender port ID</b> hai, ACC-SW2 ke apne numbers nahi. DIST-SW1 Gi0/1 128.2 bhejta hai aur Gi0/2 128.3, isliye ACC-SW2 ka jo bhi port DIST-SW1 Gi0/1 se cabled hai woh root port banta hai. Agar cables cross hain (DIST-SW1 Gi0/1 se ACC-SW2 Gi0/2), to ACC-SW2 <b>Gi0/2</b> root port banta hai. Choice influence karne ke liye aap <b>upstream</b> switch par <code>port-priority</code> badalte ho (chapter 9); real-world fix aam taur par EtherChannel hai (agla module).</p>

<div class="tip"><p><b>Exam recipe.</b> 1) Root dhoondho (sabse kam BID). 2) Har switch ke paas root path cost likho. 3) Har non-root switch par ek RP mark karo. 4) Har link par DP mark karo (kam advertised cost, phir kam BID). 5) Har unmarked port block karta hai. Blocked ports ki ginti independent loops ki ginti ke barabar hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Maan lena ki block hone wala port hamesha access switch par ya "sabse door" wale switch par hota hai. Tied segment par <b>zyada Bridge ID</b> wala switch block karta hai, chahe woh kahin bhi ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Root port ke liye switch BPDU mein aaya <b>neighbour</b> ka Bridge ID aur Port ID compare karta hai. "Sabse chhota local port number" wale answers sirf aakhri tie-breaker ke roop mein sahi hain. Yeh bhi yaad rakho: root bridge ka kabhi root port nahi hota.</p></div>

<div class="scn"><h4>Blocked port ke peeche gateway</h4><p>Ek school ke do distribution switches, DIST-A aur DIST-B, dono default priority par the, isliye DIST-A sabse chhote MAC se root ban gaya. Library access switch ka MAC DIST-B se chhota tha, isliye DIST-B se library link par library switch ne designated port jeet liya aur <b>DIST-B</b> ka end block ho gaya. DIST-B library VLAN ka active HSRP gateway tha, isliye gateway ki taraf har library frame library, DIST-A, DIST-B hokar jaata tha, aur woh inter-distribution link cross karta tha jo pehle se backups se busy tha. Users ko raat mein pages slow dikhte the. Team ne library VLAN ke liye DIST-B ko <code>root primary</code> aur DIST-A ko <code>root secondary</code> banaya; library switch ka DIST-B wala direct uplink uska root port ban gaya aur gateway path ek hop ka ho gaya.</p><p><b>Seekh:</b> default priorities ke saath MAC addresses decide karte hain ki blocking kahan hogi; ise design karo.</p></div>

<div class="iv"><p class="q">"STP kaise decide karta hai ki link par kaunsa port designated banega?"</p><p>Strong answer: har segment par jo switch sabse kam root path cost advertise karta hai woh designated port jeetta hai. Costs tie hon to kam sender Bridge ID jeetta hai, phir kam sender Port ID. Haarne wala end non-designated banta hai: 802.1D mein blocking, RSTP mein alternate discarding. Jodo ki root bridge ke ports hamesha designated hote hain aur har non-root switch ka bilkul ek root port hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Root bridge: saare ports designated. Non-root switch: bilkul ek root port.</li>
<li>Root port tie-breakers: sabse kam cost, sabse kam neighbour BID, sabse kam neighbour port ID, sabse kam local port ID.</li>
<li>Har link ka designated port: sabse kam advertised root path cost, phir sabse kam BID, phir sabse kam port ID.</li>
<li>Baaki sab blocking (802.1D) ya alternate/backup discarding (RSTP) hai.</li>
<li>Defaults ke saath lab VLAN 10 mein SW2 Gi0/2 block karta hai, kyunki SW3 ka MAC SW2 se chhota hai.</li>
</ul></div>
`}};export{e as default};