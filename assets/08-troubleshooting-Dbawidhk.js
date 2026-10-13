var e={id:`troubleshooting`,h:{en:`Troubleshooting Layer 2 VPNs: a layered workflow`,hi:`Layer 2 VPNs troubleshoot karna: layered workflow`},body:{en:`
<p>When an Ethernet service fails, the customer says "the line is down" and you must find which layer is broken. A pseudowire or an EVPN service is a stack: the attachment circuit, the PE service instance, the signalling, the transport LSP, and the underlay. Test them in order, from the bottom up for reachability and from the service down for configuration. There are no labs for this module in the simulator, so use the method here and practise the underlay checks (IGP, LDP, LSP) in spcor-mpls-ldp and spcor-l3vpn, and the EVPN control-plane checks in jncip-evpn and dc-evpn.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="L2VPN troubleshooting stack">
<rect x="120" y="10" width="400" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">1 Attachment circuit up, tags and MTU right</text>
<rect x="120" y="54" width="400" height="36" rx="6" fill="#fde68a"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">2 PE service instance configured and up</text>
<rect x="120" y="98" width="400" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">3 Signalling: LDP session or BGP EVPN routes</text>
<rect x="120" y="142" width="400" height="36" rx="6" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">4 Transport LSP between PE loopbacks</text>
<rect x="120" y="186" width="400" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">5 Underlay: IGP, interfaces, MTU</text>
</svg><p class="cap">Check each layer of the service stack in turn.</p></div>
<ol>
<li><b>Attachment circuit.</b> Is the port up? Does the VLAN or encapsulation on the PE match what the customer sends? Is there a tag-rewrite mismatch (pop versus push)? Is the AC MTU right?</li>
<li><b>PE service instance.</b> Is the xconnect, bridge domain, VFI or EVI configured and in the up state? Is the AC attached to it? Is the VPN ID or PW ID correct on both PEs?</li>
<li><b>Signalling.</b> LDP: is the targeted session established to the right loopback, and do both PEs show matching PW ID, type and MTU, with labels assigned? EVPN: is the BGP l2vpn evpn session up, and are route targets and ESI as designed, with type 2, 3 and 1 routes present?</li>
<li><b>Transport.</b> Is there an LSP from PE to PE loopback? Check the IGP route, the LDP label binding or SR label, and that the loopback is a /32. Is a traceroute or LSP ping to the loopback successful?</li>
<li><b>Underlay and MTU.</b> Are all core links up and with enough MTU for labels, control word and tags?</li>
</ol>

<h3>Symptom to cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>PW down, LDP session up</td><td>PW ID, type or MTU mismatch; AC down</td></tr>
<tr><td>PW down, no targeted LDP session</td><td>No route to peer loopback, ACL blocking TCP 646, wrong LDP router ID</td></tr>
<tr><td>Small frames pass, large frames drop</td><td>MTU budget too small or tag count wrong</td></tr>
<tr><td>VPLS: some MACs unreachable, others fine</td><td>Stale MAC entries after a topology change; missing MAC flush</td></tr>
<tr><td>VPLS: sudden CPU spike, many sites slow</td><td>Customer loop or broadcast storm; no storm control</td></tr>
<tr><td>EVPN: MACs not learned remotely</td><td>Route target mismatch, EVPN family not negotiated, missing advertise-mac</td></tr>
<tr><td>EVPN multihoming: duplicate BUM or one link idle</td><td>ESI mismatch, DF election problem, wrong load-balancing mode</td></tr>
<tr><td>Q-in-Q: spanning tree weirdness between sites</td><td>STP BPDUs tunnelled unintentionally or dropped</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Pune to Mumbai E-Line is down." Step 1: the AC at Pune PE is up. At Mumbai, the AC sub-interface expects VLAN 100 but the customer sends VLAN 110, so the AC is never matched. This is found in step 1. The fix is to correct the encapsulation. The engineer did not need to look at LDP, because the pseudowire status showed the remote AC as down, and that signal, carried in the PW status TLV, pointed at the far end.</p></div>

<h3>Tools that work on any platform</h3>
<ul>
<li><b>Ping and traceroute</b> between PE loopbacks, and MPLS LSP ping or traceroute to test the transport label path.</li>
<li><b>Ethernet OAM</b>: CFM loopback and linktrace on the service, to prove the path and find the failed hop.</li>
<li><b>MAC table inspection</b> on the bridge domain: is the customer MAC learned on the expected AC or PW?</li>
<li><b>Counters</b> on the AC and the PW, read twice to see whether packets are flowing in each direction.</li>
<li><b>Configuration comparison</b> of the two PEs, side by side.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Starting at the pseudowire when the AC is wrong; testing only with small pings; forgetting that both directions are separate (one PE may forward while the other drops); and changing both ends at once so you cannot tell what fixed it.</p></div>
<div class="exam"><p><b>Exam trap.</b> A pseudowire needs the transport LSP between loopbacks. If the IGP has no /32 for the peer, or LDP advertises labels only for a different prefix set, the targeted session or the data path fails even though links are up.</p></div>

<div class="scn"><h4>MAC flush that nobody did</h4><p>A VPLS customer had one site reachable again after a failover, but a second site still could not reach a server for about five minutes. The switch behind a failed link had sent a topology change, but the PE did not flush its MAC table toward the pseudowire, so frames kept going to the wrong place until the entries aged out. Enabling MAC withdrawal and a shorter aging time reduced the outage to seconds. In an EVPN service the type 2 withdrawal and MAC mobility handle this automatically.</p><p><b>Lesson:</b> stale MACs cause partial outages after failover.</p></div>

<div class="iv"><p class="q">"A pseudowire is down. How do you troubleshoot?"</p><p>Check the attachment circuit and encapsulation first, then that the PW is configured on both PEs with the same ID, type and MTU, then the targeted LDP session and label exchange, then the transport LSP and IGP /32 route between loopbacks, then the underlay MTU. Use PW status to see which end reports the AC down.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test the stack: AC, service instance, signalling, transport LSP, underlay.</li>
<li>PW down with LDP up usually means ID, type or MTU mismatch.</li>
<li>Large frames dropping points to MTU.</li>
<li>Stale MACs cause partial outages; EVPN withdrawals avoid it.</li>
<li>Use OAM (CFM) to prove the service path.</li>
</ul></div>
`,hi:`
<p>Jab Ethernet service fail hoti hai, customer kehta hai "line down hai" aur aapko dhoondhna hota hai kaunsi layer toot gayi. Pseudowire ya EVPN service ek stack hai: attachment circuit, PE service instance, signalling, transport LSP aur underlay. Inhe order mein test karo, reachability ke liye neeche se upar aur configuration ke liye service se neeche. Is module ke liye simulator mein labs nahi hain, isliye yahan ka method use karo aur underlay checks (IGP, LDP, LSP) spcor-mpls-ldp tatha spcor-l3vpn mein, aur EVPN control-plane checks jncip-evpn tatha dc-evpn mein practise karo.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="L2VPN troubleshooting stack">
<rect x="120" y="10" width="400" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">1 Attachment circuit up, tags aur MTU sahi</text>
<rect x="120" y="54" width="400" height="36" rx="6" fill="#fde68a"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">2 PE service instance configured aur up</text>
<rect x="120" y="98" width="400" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">3 Signalling: LDP session ya BGP EVPN routes</text>
<rect x="120" y="142" width="400" height="36" rx="6" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">4 PE loopbacks ke beech transport LSP</text>
<rect x="120" y="186" width="400" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">5 Underlay: IGP, interfaces, MTU</text>
</svg><p class="cap">Service stack ki har layer ek ke baad ek check karo.</p></div>
<ol>
<li><b>Attachment circuit.</b> Port up hai? PE par VLAN ya encapsulation woh hai jo customer bhejta hai? Tag-rewrite mismatch (pop versus push) hai? AC MTU sahi hai?</li>
<li><b>PE service instance.</b> xconnect, bridge domain, VFI ya EVI configured aur up state mein hai? AC usse attached hai? Dono PEs par VPN ID ya PW ID sahi hai?</li>
<li><b>Signalling.</b> LDP: targeted session sahi loopback tak established hai, aur dono PEs matching PW ID, type aur MTU dikhate hain, labels assigned ke saath? EVPN: BGP l2vpn evpn session up hai, aur route targets tatha ESI design ke mutabik hain, type 2, 3 aur 1 routes maujood hain?</li>
<li><b>Transport.</b> PE se PE loopback tak LSP hai? IGP route, LDP label binding ya SR label check karo, aur yeh ki loopback /32 hai. Loopback tak traceroute ya LSP ping successful hai?</li>
<li><b>Underlay aur MTU.</b> Saare core links up hain aur labels, control word aur tags ke liye kaafi MTU hai?</li>
</ol>

<h3>Symptom se cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>PW down, LDP session up</td><td>PW ID, type ya MTU mismatch; AC down</td></tr>
<tr><td>PW down, targeted LDP session nahi</td><td>Peer loopback ka route nahi, ACL TCP 646 block kar rahi hai, galat LDP router ID</td></tr>
<tr><td>Chhote frames pass, bade drop</td><td>MTU budget bahut chhota ya tag count galat</td></tr>
<tr><td>VPLS: kuch MACs unreachable, baaki theek</td><td>Topology change ke baad stale MAC entries; MAC flush missing</td></tr>
<tr><td>VPLS: achanak CPU spike, kai sites slow</td><td>Customer loop ya broadcast storm; storm control nahi</td></tr>
<tr><td>EVPN: MACs remotely learn nahi hote</td><td>Route target mismatch, EVPN family negotiate nahi hui, advertise-mac missing</td></tr>
<tr><td>EVPN multihoming: duplicate BUM ya ek link idle</td><td>ESI mismatch, DF election problem, galat load-balancing mode</td></tr>
<tr><td>Q-in-Q: sites ke beech spanning tree ajeeb</td><td>STP BPDUs anjaane mein tunnel ya drop ho gaye</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Pune se Mumbai E-Line down hai." Step 1: Pune PE par AC up hai. Mumbai par AC sub-interface VLAN 100 expect karta hai lekin customer VLAN 110 bhejta hai, isliye AC kabhi match nahi hota. Yeh step 1 mein mil gaya. Fix encapsulation sudharna hai. Engineer ko LDP dekhne ki zaroorat nahi padi, kyunki pseudowire status ne remote AC down dikhaya, aur PW status TLV mein aaya woh signal far end ki taraf ishara karta tha.</p></div>

<h3>Tools jo kisi bhi platform par kaam karte hain</h3>
<ul>
<li>PE loopbacks ke beech <b>Ping aur traceroute</b>, aur transport label path test karne ke liye MPLS LSP ping ya traceroute.</li>
<li><b>Ethernet OAM</b>: service par CFM loopback aur linktrace, path prove karne aur failed hop dhoondne ke liye.</li>
<li>Bridge domain par <b>MAC table inspection</b>: customer MAC expected AC ya PW par learn hua hai?</li>
<li>AC aur PW par <b>counters</b>, do baar padho dekhne ke liye ki har direction mein packets chal rahe hain.</li>
<li>Dono PEs ka side by side <b>configuration comparison</b>.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> AC galat hone par pseudowire se shuru karna; sirf chhote pings se test karna; yeh bhoolna ki dono directions alag hain (ek PE forward kare aur doosra drop); aur dono sirey ek saath badalna jisse pata nahi chalta kisne fix kiya.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pseudowire ko loopbacks ke beech transport LSP chahiye. Agar IGP mein peer ka /32 nahi, ya LDP kisi aur prefix set ke liye labels advertise karta hai, to links up hone ke bawajood targeted session ya data path fail hota hai.</p></div>

<div class="scn"><h4>MAC flush jo kisi ne nahi kiya</h4><p>VPLS customer ki ek site failover ke baad wapas reachable ho gayi, lekin doosri site lagbhag paanch minute tak server tak nahi pahunch pa rahi thi. Failed link ke peeche ke switch ne topology change bheja tha, lekin PE ne pseudowire ki taraf apni MAC table flush nahi ki, isliye frames galat jagah jaate rahe jab tak entries age out nahi huin. MAC withdrawal aur chhota aging time enable karne se outage seconds mein aa gaya. EVPN service mein type 2 withdrawal aur MAC mobility yeh khud handle karte hain.</p><p><b>Lesson:</b> stale MACs failover ke baad partial outages banate hain.</p></div>

<div class="iv"><p class="q">"Pseudowire down hai. Kaise troubleshoot karoge?"</p><p>Pehle attachment circuit aur encapsulation, phir yeh ki PW dono PEs par same ID, type aur MTU ke saath configured hai, phir targeted LDP session aur label exchange, phir loopbacks ke beech transport LSP aur IGP /32 route, phir underlay MTU. PW status se dekho kaun sa sirey AC down report kar raha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stack test karo: AC, service instance, signalling, transport LSP, underlay.</li>
<li>LDP up ke saath PW down aam taur par ID, type ya MTU mismatch hai.</li>
<li>Bade frames ka drop hona MTU ki taraf ishara karta hai.</li>
<li>Stale MACs partial outages banate hain; EVPN withdrawals isse bachate hain.</li>
<li>Service path prove karne ke liye OAM (CFM) use karo.</li>
</ul></div>
`}};export{e as default};