var e={id:`fec-lsr-lsp`,h:{en:`FEC, LSR roles and the label switched path`,hi:`FEC, LSR roles aur label switched path`},body:{en:`
<p>Picture a railway network. Passengers going to the same city buy tickets of the same colour; that group is a <b>forwarding class</b>. Big junction stations where passengers first board or finally leave are <b>edge stations</b>; smaller stations in between only change the train's line number and wave it through. The route one train takes from origin to destination is fixed in advance and runs in <b>one direction</b>; the return journey is a different train on its own route. Keep this picture: it maps onto FEC, LSR roles and LSP almost word for word.</p>

<h3>FEC: Forwarding Equivalence Class</h3>
<p>A <b>FEC</b> is a group of packets that are forwarded the same way: same path, same treatment. In the MPLS you meet on ENARSI, a FEC is almost always <b>"every packet whose destination matches IGP prefix X"</b>, for example 4.4.4.4/32. All packets to 4.4.4.4, whatever their source, port or application, belong to the same FEC and get the same label.</p>
<p>The key idea is that the decision "which FEC does this packet belong to?" is made <b>once</b>, at the ingress. After that, the label stands for the FEC. In more advanced designs a FEC can also be defined by QoS class, a TE tunnel or a VPN route, but for LDP think "one IGP prefix = one FEC = one label per router".</p>

<h3>LSR: Label Switching Router</h3>
<p>An <b>LSR</b> is any router that understands labels: it runs a label distribution protocol and forwards labelled packets. Depending on its position on a path, an LSR plays one of three roles:</p>
<table class="cmp"><tr><th>Role</th><th>Other names</th><th>What it does to the packet</th></tr>
<tr><td>Ingress LSR</td><td>Ingress LER, ingress PE, headend</td><td>Receives an unlabelled IP packet, classifies it into a FEC, <b>pushes</b> (imposes) a label</td></tr>
<tr><td>Intermediate LSR</td><td>Transit LSR, P router</td><td>Receives a labelled packet, <b>swaps</b> the top label, forwards it; never looks at the IP header</td></tr>
<tr><td>Egress LSR</td><td>Egress LER, egress PE, tailend</td><td>Removes the last label (or receives the packet already popped) and forwards by IP or by VRF</td></tr></table>
<p><b>LER</b> means Label Edge Router, which is the same as an edge LSR. In service provider language the edge routers are <b>PE</b> (provider edge) routers and the core routers are <b>P</b> (provider) routers. The customer's router is a <b>CE</b> (customer edge); it does not run MPLS at all.</p>
<p>Roles belong to a <b>path</b>, not to a box. PE1 is the ingress for traffic to PE2, and the egress for traffic from PE2. A P router can even be an ingress for its own locally generated packets, such as a traceroute it originates.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="LSR roles and LSPs">
<rect x="20" y="100" width="80" height="40" rx="8" fill="#fde68a"/><text x="60" y="125" text-anchor="middle" class="svg-ink" font-size="13">CE / PC1</text>
<rect x="130" y="100" width="90" height="40" rx="8" fill="#bae6fd"/><text x="175" y="125" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="260" y="100" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="305" y="125" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="390" y="100" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="435" y="125" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="520" y="100" width="90" height="40" rx="8" fill="#bae6fd"/><text x="565" y="125" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<line x1="100" y1="120" x2="130" y2="120" stroke="#64748b" stroke-width="2"/><line x1="220" y1="120" x2="260" y2="120" stroke="#64748b" stroke-width="2"/><line x1="350" y1="120" x2="390" y2="120" stroke="#64748b" stroke-width="2"/><line x1="480" y1="120" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="175" y1="80" x2="565" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#a3)"/>
<text x="370" y="68" text-anchor="middle" class="svg-accent" font-size="12">LSP for FEC 4.4.4.4/32</text>
<line x1="565" y1="165" x2="175" y2="165" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#a3)"/>
<text x="370" y="185" text-anchor="middle" class="svg-muted" font-size="12">separate LSP for FEC 1.1.1.1/32</text>
<text x="175" y="220" text-anchor="middle" class="svg-ink" font-size="12">ingress LER</text><text x="370" y="220" text-anchor="middle" class="svg-ink" font-size="12">transit LSRs</text><text x="565" y="220" text-anchor="middle" class="svg-ink" font-size="12">egress LER</text>
<defs><marker id="a3" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
</svg><p class="cap">Roles for traffic from PE1 to PE2. The return traffic uses a completely separate LSP.</p></div>

<h3>LSP: Label Switched Path</h3>
<p>An <b>LSP</b> is the sequence of LSRs a FEC follows from ingress to egress. Three facts matter:</p>
<ul>
<li>An LSP is <b>unidirectional</b>. Two-way traffic between PE1 and PE2 needs two LSPs, one for 4.4.4.4/32 and one for 1.1.1.1/32. They usually follow the same links but use unrelated label values.</li>
<li>With LDP, the LSP follows the <b>IGP best path</b> hop by hop. If OSPF changes its path, the LSP moves too. LDP never chooses a path by itself.</li>
<li>With MPLS TE, the LSP is signalled explicitly by RSVP-TE and can differ from the IGP path. That is beyond ENARSI; just know the difference.</li>
</ul>

<h3>Control plane and data plane</h3>
<p>MPLS splits cleanly into two planes, and interviewers love this question:</p>
<ul>
<li><b>Control plane</b>: the IGP (OSPF, IS-IS, EIGRP) builds routes; LDP (or BGP, or RSVP-TE) assigns and exchanges labels for them. Result: the LIB and the tables that feed forwarding.</li>
<li><b>Data plane</b>: CEF uses the FIB to push labels on incoming IP packets, and the LFIB to swap or pop labels on incoming labelled packets.</li>
</ul>
<p>Chapter 4 explains those tables. For now remember: control plane = "who gets which label"; data plane = "what I do with a packet that arrives".</p>

<div class="eg"><p><b>Worked example.</b> PC1 (192.168.1.10) pings PC2 (192.168.2.10). The FEC is 192.168.2.0/24, owned by PE2. PE1 is the ingress LER: it receives a plain IP packet on Gi0/0, finds 192.168.2.0/24 in its FIB with an outgoing label, and pushes it. P1 and P2 are transit LSRs for this FEC. PE2 is the egress LER and delivers the packet on Gi0/0. The echo reply from PC2 to PC1 belongs to a different FEC, 192.168.1.0/24, on the reverse LSP where PE2 is ingress and PE1 is egress.</p></div>

<div class="warn"><p><b>Common mistake.</b> Saying "the LSP between PE1 and PE2 is down" as if it were one bidirectional tunnel. Always check both directions: the LSP to 4.4.4.4 can be fine while the one to 1.1.1.1 is broken, which gives one-way traffic and very confusing symptoms.</p></div>

<div class="exam"><p><b>Exam trap.</b> The ingress router <b>pushes</b> (imposes), a transit router <b>swaps</b>, and with PHP the <b>penultimate</b> router pops, not the egress. Also: a CE router is not an LSR; it runs no label protocol.</p></div>

<div class="scn"><h4>One-way voice across the core</h4><p>After a maintenance window, IP phones at a branch behind PE1 could hear callers at head office behind PE2, but the head office heard nothing. The NOC checked the LSP PE1 → PE2 with a traceroute from PE1 to 4.4.4.4 and saw labels on every hop, so they closed the ticket. A second engineer ran the traceroute from PE2 to 1.1.1.1 and found the traffic leaving P1 unlabelled toward PE1, where an ACL on a newly added interface filtered it. Removing the ACL fixed the reverse LSP.</p><p><b>Lesson:</b> LSPs are unidirectional; test both directions before you close an MPLS ticket.</p></div>

<div class="iv"><p class="q">"What is the difference between an LSR and an LER, and between P and PE routers?"</p><p>Every MPLS router is an LSR. An LER, or edge LSR, sits at the boundary: it pushes labels on traffic entering the MPLS domain and removes them on traffic leaving it. In provider terms these are PE routers; the core routers that only swap labels are P routers. Add that roles are per LSP and that the CE runs no MPLS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A FEC is a group of packets forwarded identically; with LDP it is one IGP prefix.</li>
<li>Ingress LER pushes, transit LSR swaps, egress LER (or the penultimate hop) removes the label.</li>
<li>PE = provider edge (LER), P = provider core (transit LSR), CE = customer router without MPLS.</li>
<li>An LSP is unidirectional and, with LDP, follows the IGP best path.</li>
<li>Control plane assigns labels (IGP + LDP); data plane uses FIB and LFIB to forward.</li>
</ul></div>
`,hi:`
<p>Ek railway network socho. Ek hi sheher jaane wale passengers ek hi rang ke tickets kharidte hain; yeh group ek <b>forwarding class</b> hai. Bade junction stations jahan passengers pehli baar chadhte hain ya aakhir mein utarte hain, woh <b>edge stations</b> hain; beech ke chhote stations sirf train ka line number badalte hain aur use aage bhej dete hain. Ek train origin se destination tak jo route leti hai woh pehle se fix hai aur <b>ek direction</b> mein chalta hai; wapsi ka safar ek alag train apne route par karti hai. Yeh tasveer yaad rakho: yeh FEC, LSR roles aur LSP par lagbhag shabd-dar-shabd fit hoti hai.</p>

<h3>FEC: Forwarding Equivalence Class</h3>
<p><b>FEC</b> packets ka woh group hai jo ek hi tarike se forward hota hai: same path, same treatment. ENARSI wale MPLS mein FEC lagbhag hamesha <b>"har woh packet jiska destination IGP prefix X se match karta hai"</b> hota hai, jaise 4.4.4.4/32. 4.4.4.4 jaane wale saare packets, unka source, port ya application kuch bhi ho, ek hi FEC mein aate hain aur unhe same label milta hai.</p>
<p>Main idea yeh hai ki "yeh packet kis FEC ka hai?" wala decision sirf <b>ek baar</b>, ingress par hota hai. Uske baad label hi FEC ko represent karta hai. Advanced designs mein FEC QoS class, TE tunnel ya VPN route se bhi define ho sakta hai, par LDP ke liye socho "ek IGP prefix = ek FEC = har router par ek label".</p>

<h3>LSR: Label Switching Router</h3>
<p><b>LSR</b> koi bhi router hai jo labels samajhta hai: woh label distribution protocol chalata hai aur labelled packets forward karta hai. Path par apni position ke hisaab se LSR teen mein se ek role nibhata hai:</p>
<table class="cmp"><tr><th>Role</th><th>Doosre naam</th><th>Packet ke saath kya karta hai</th></tr>
<tr><td>Ingress LSR</td><td>Ingress LER, ingress PE, headend</td><td>Unlabelled IP packet leta hai, use FEC mein classify karta hai, label <b>push</b> (impose) karta hai</td></tr>
<tr><td>Intermediate LSR</td><td>Transit LSR, P router</td><td>Labelled packet leta hai, top label <b>swap</b> karta hai, forward karta hai; IP header kabhi nahi dekhta</td></tr>
<tr><td>Egress LSR</td><td>Egress LER, egress PE, tailend</td><td>Aakhri label hataata hai (ya packet pehle se popped milta hai) aur IP ya VRF se forward karta hai</td></tr></table>
<p><b>LER</b> ka matlab Label Edge Router hai, jo edge LSR hi hai. Service provider ki bhasha mein edge routers <b>PE</b> (provider edge) routers hain aur core routers <b>P</b> (provider) routers. Customer ka router <b>CE</b> (customer edge) hai; woh MPLS bilkul nahi chalata.</p>
<p>Roles ek <b>path</b> ke hote hain, box ke nahi. PE2 jaane wale traffic ke liye PE1 ingress hai, aur PE2 se aane wale traffic ke liye egress. Ek P router bhi apne locally generated packets, jaise khud ka traceroute, ke liye ingress ban sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="LSR roles and LSPs">
<rect x="20" y="100" width="80" height="40" rx="8" fill="#fde68a"/><text x="60" y="125" text-anchor="middle" class="svg-ink" font-size="13">CE / PC1</text>
<rect x="130" y="100" width="90" height="40" rx="8" fill="#bae6fd"/><text x="175" y="125" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="260" y="100" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="305" y="125" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="390" y="100" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="435" y="125" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="520" y="100" width="90" height="40" rx="8" fill="#bae6fd"/><text x="565" y="125" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<line x1="100" y1="120" x2="130" y2="120" stroke="#64748b" stroke-width="2"/><line x1="220" y1="120" x2="260" y2="120" stroke="#64748b" stroke-width="2"/><line x1="350" y1="120" x2="390" y2="120" stroke="#64748b" stroke-width="2"/><line x1="480" y1="120" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="175" y1="80" x2="565" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#b3)"/>
<text x="370" y="68" text-anchor="middle" class="svg-accent" font-size="12">FEC 4.4.4.4/32 ka LSP</text>
<line x1="565" y1="165" x2="175" y2="165" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#b3)"/>
<text x="370" y="185" text-anchor="middle" class="svg-muted" font-size="12">FEC 1.1.1.1/32 ka alag LSP</text>
<text x="175" y="220" text-anchor="middle" class="svg-ink" font-size="12">ingress LER</text><text x="370" y="220" text-anchor="middle" class="svg-ink" font-size="12">transit LSRs</text><text x="565" y="220" text-anchor="middle" class="svg-ink" font-size="12">egress LER</text>
<defs><marker id="b3" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
</svg><p class="cap">PE1 se PE2 jaane wale traffic ke roles. Wapsi ka traffic bilkul alag LSP use karta hai.</p></div>

<h3>LSP: Label Switched Path</h3>
<p><b>LSP</b> LSRs ka woh sequence hai jis par ek FEC ingress se egress tak chalta hai. Teen baatein zaroori hain:</p>
<ul>
<li>LSP <b>unidirectional</b> hota hai. PE1 aur PE2 ke beech do-tarfa traffic ke liye do LSPs chahiye, ek 4.4.4.4/32 ke liye aur ek 1.1.1.1/32 ke liye. Aam taur par yeh same links par chalte hain par label values ka koi rishta nahi hota.</li>
<li>LDP ke saath LSP hop by hop <b>IGP best path</b> follow karta hai. Agar OSPF apna path badle, to LSP bhi badal jaata hai. LDP khud kabhi path nahi chunta.</li>
<li>MPLS TE ke saath LSP RSVP-TE se explicitly signal hota hai aur IGP path se alag ho sakta hai. Yeh ENARSI se bahar hai; bas farak pata hona chahiye.</li>
</ul>

<h3>Control plane aur data plane</h3>
<p>MPLS saaf taur par do planes mein bant'ta hai, aur interviewers ko yeh sawaal bahut pasand hai:</p>
<ul>
<li><b>Control plane</b>: IGP (OSPF, IS-IS, EIGRP) routes banata hai; LDP (ya BGP, ya RSVP-TE) unke liye labels assign aur exchange karta hai. Result: LIB aur woh tables jo forwarding ko feed karti hain.</li>
<li><b>Data plane</b>: CEF aane wale IP packets par labels push karne ke liye FIB use karta hai, aur aane wale labelled packets par labels swap ya pop karne ke liye LFIB.</li>
</ul>
<p>Chapter 4 in tables ko samjhata hai. Abhi ke liye yaad rakho: control plane = "kisko kaunsa label milega"; data plane = "jo packet aaya uske saath main kya karun".</p>

<div class="eg"><p><b>Worked example.</b> PC1 (192.168.1.10) PC2 (192.168.2.10) ko ping karta hai. FEC 192.168.2.0/24 hai, jiska maalik PE2 hai. PE1 ingress LER hai: woh Gi0/0 par plain IP packet leta hai, apni FIB mein 192.168.2.0/24 outgoing label ke saath dhoondhta hai, aur use push karta hai. Is FEC ke liye P1 aur P2 transit LSRs hain. PE2 egress LER hai aur packet Gi0/0 par deliver karta hai. PC2 se PC1 ka echo reply ek alag FEC, 192.168.1.0/24, ka hai, reverse LSP par jahan PE2 ingress hai aur PE1 egress.</p></div>

<div class="warn"><p><b>Common galti.</b> "PE1 aur PE2 ke beech LSP down hai" aise bolna jaise yeh ek bidirectional tunnel ho. Hamesha dono directions check karo: 4.4.4.4 wala LSP theek ho sakta hai jabki 1.1.1.1 wala toota ho, jisse one-way traffic aur bahut confusing symptoms aate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ingress router <b>push</b> (impose) karta hai, transit router <b>swap</b> karta hai, aur PHP ke saath <b>penultimate</b> router pop karta hai, egress nahi. Aur: CE router LSR nahi hai; woh koi label protocol nahi chalata.</p></div>

<div class="scn"><h4>Core ke paar one-way voice</h4><p>Ek maintenance window ke baad, PE1 ke peeche branch ke IP phones PE2 ke peeche head office ke callers ko sun sakte the, par head office ko kuch sunai nahi deta tha. NOC ne PE1 se 4.4.4.4 tak traceroute se PE1 → PE2 LSP check kiya, har hop par labels dikhe, to unhone ticket band kar diya. Ek doosre engineer ne PE2 se 1.1.1.1 tak traceroute chalaya aur paaya ki traffic P1 se PE1 ki taraf bina label ke nikal raha tha, jahan ek naye interface par ACL use filter kar raha tha. ACL hatane se reverse LSP theek ho gaya.</p><p><b>Seekh:</b> LSPs unidirectional hote hain; MPLS ticket band karne se pehle dono directions test karo.</p></div>

<div class="iv"><p class="q">"LSR aur LER mein, aur P aur PE routers mein kya farak hai?"</p><p>Har MPLS router LSR hai. LER, ya edge LSR, boundary par baithta hai: MPLS domain mein aane wale traffic par labels push karta hai aur jaane wale traffic se hataata hai. Provider terms mein yeh PE routers hain; core routers jo sirf labels swap karte hain woh P routers hain. Jodo ki roles har LSP ke hisaab se hote hain aur CE koi MPLS nahi chalata.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FEC ek jaise forward hone wale packets ka group hai; LDP ke saath yeh ek IGP prefix hai.</li>
<li>Ingress LER push karta hai, transit LSR swap karta hai, egress LER (ya penultimate hop) label hataata hai.</li>
<li>PE = provider edge (LER), P = provider core (transit LSR), CE = bina MPLS ka customer router.</li>
<li>LSP unidirectional hai aur LDP ke saath IGP best path follow karta hai.</li>
<li>Control plane labels assign karta hai (IGP + LDP); data plane FIB aur LFIB se forward karta hai.</li>
</ul></div>
`}};export{e as default};