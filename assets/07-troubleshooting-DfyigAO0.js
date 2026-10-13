var e={id:`troubleshooting`,h:{en:`Troubleshooting VXLAN: five classic faults`,hi:`VXLAN troubleshooting: paanch classic faults`},body:{en:`
<p>Fixing a VXLAN fabric is like finding why a lamp does not light: the plug, the cable, the socket, the bulb and the switch each fail in a recognisable way. Five faults cause most tickets in this module's labs (<code>sre-vxlan-ts</code>). Learn each signature, then you can name the fault from one screen of output.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Fault decision tree">
<g font-size="12" class="svg-ink">
<rect x="20" y="10" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="115" y="32" text-anchor="middle">Remote MAC missing?</text>
<rect x="250" y="10" width="170" height="34" rx="6" fill="#bae6fd"/><text x="335" y="32" text-anchor="middle">Remote Lo1 reachable?</text>
<rect x="460" y="10" width="160" height="34" rx="6" fill="#fde68a"/><text x="540" y="32" text-anchor="middle">No: underlay / MTU</text>
<rect x="250" y="64" width="170" height="34" rx="6" fill="#bae6fd"/><text x="335" y="86" text-anchor="middle">nve1 Oper Up, source ok?</text>
<rect x="460" y="64" width="160" height="34" rx="6" fill="#fde68a"/><text x="540" y="86" text-anchor="middle">No: source-interface</text>
<rect x="250" y="112" width="170" height="34" rx="6" fill="#bae6fd"/><text x="335" y="134" text-anchor="middle">VNI Up and same ID?</text>
<rect x="460" y="112" width="160" height="34" rx="6" fill="#fde68a"/><text x="540" y="134" text-anchor="middle">No: VNI mismatch</text>
</g>
<g stroke="#64748b"><line x1="210" y1="27" x2="250" y2="27"/><line x1="420" y1="27" x2="460" y2="27"/><line x1="420" y1="81" x2="460" y2="81"/><line x1="420" y1="129" x2="460" y2="129"/><line x1="335" y1="44" x2="335" y2="64"/><line x1="335" y1="98" x2="335" y2="112"/></g>
</svg><p class="cap">Top to bottom: stop at the first "No". Peer list and MTU come after.</p></div>

<h3>Fault 1: VNI mismatch</h3>
<pre class="out">LEAF1# show nve vni
nve1       10010      N/A              Up         L2DP  10
LEAF2# show nve vni
nve1       <span class="hl">10001</span>      N/A              Up         L2DP  10</pre>
<p>Both leaves look healthy in isolation, and no error is logged. VLANs match but the VNIs differ, so each leaf sends packets the other does not recognise. The fix is to make both VNIs equal. Signature: peer list fine, Pkts In stays zero on both sides for that VNI.</p>

<h3>Fault 2: underlay missing a VTEP loopback</h3>
<pre class="out">LEAF1# show ip route 10.255.1.12
% Network not in table
LEAF1# show nve peers
Interface  VNI      Type Peer-IP          state
nve1       10010    L2DP 10.255.1.12      <span class="hl">DOWN</span></pre>
<p>The VTEP address is not in OSPF on LEAF2 (or the interface is shut). Fix: <code>ip ospf 1 area 0</code> on Loopback1. Signature: peer DOWN or absent, route missing.</p>

<h3>Fault 3: wrong or down source-interface</h3>
<pre class="out">LEAF2# show nve interface nve1
Interface: nve1, State: Admin Up, <span class="hl">Oper Down</span>
 source-interface: Loopback9 (primary: not configured)</pre>
<p>nve1 points at an interface with no IP address, or one that does not exist in the underlay. Fix: <code>source-interface Loopback1</code>. Signature: Oper Down, source address missing.</p>

<h3>Fault 4: MTU</h3>
<p>Small pings pass, large file copies stall. <code>ping 10.255.1.12 source Loopback1 size 1550 df-bit</code> fails while a default ping works. Raise the MTU on the failing link; repeat per link, because each hop must be fixed.</p>

<h3>Fault 5: asymmetric peer list</h3>
<p>One direction works, the other does not (see the flood-and-learn chapter). Compare the peer list per VNI on every leaf: each leaf must list all others that own the VNI.</p>

<div class="eg"><p><b>Worked example: the ticket.</b> "H3 cannot reach H4 (VLAN 20), but H1 and H2 are fine." Step 1: underlay ping between 10.255.1.12 and .13 passes. Step 2: nve1 on both leaves is Oper Up. Step 3: <code>show nve vni</code> shows 10020 on LEAF2 and 10002 on LEAF3. A one-digit typo, found on rung 3, fixed in one line.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing three things at once. If you fix the VNI, the loopback and the peer list together, you will not know which one mattered, and you cannot write a useful ticket note. One change, one verification.</p></div>

<div class="exam"><p><b>Exam trap.</b> "VLAN IDs differ between leaves" is <b>not</b> the answer to a VXLAN connectivity fault; VNIs differing is. Unless the VLAN-to-VNI binding is wrong, different VLAN IDs are harmless.</p></div>

<div class="scn"><h4>Friday night VNI typo</h4><p>A new warehouse VLAN was built on two leaves by two different engineers. One typed 10030, the other 10003. Every dashboard showed green, because the underlay and the VTEPs were healthy. The warehouse scanners could not reach their server. The on-call engineer compared <code>show nve vni</code> output and spotted the difference in half a minute.</p><p><b>Lesson:</b> add a VNI allocation sheet and diff the outputs; do not rely on memory.</p></div>

<div class="iv"><p class="q">"Hosts in the same VLAN on two leaves cannot ping. What do you check?"</p><p>Strong answer: underlay reachability and MTU between VTEP loopbacks, nve1 state and source, VNI IDs and state on both leaves, the peer list per VNI in both directions, and finally the MAC table after generating traffic. Name the commands for each step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five faults: VNI mismatch, missing Lo1 in OSPF, bad source-interface, MTU, asymmetric peers.</li>
<li>Each has a one-screen signature in show nve output.</li>
<li>Walk the ladder in order and change one thing at a time.</li>
<li>VLAN IDs may differ; VNIs may not.</li>
</ul></div>
`,hi:`
<p>VXLAN fabric theek karna lamp kyun nahi jal raha yeh dhoondhne jaisa hai: plug, cable, socket, bulb aur switch, har ek pehchaan mein aane wale tareeke se fail hota hai. Is module ke labs (<code>sre-vxlan-ts</code>) ke zyada tar tickets paanch faults se aate hain. Har signature seekh lo, phir ek screen ke output se fault ka naam bata sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Fault decision tree">
<g font-size="12" class="svg-ink">
<rect x="20" y="10" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="115" y="32" text-anchor="middle">Remote MAC missing?</text>
<rect x="250" y="10" width="170" height="34" rx="6" fill="#bae6fd"/><text x="335" y="32" text-anchor="middle">Remote Lo1 reachable?</text>
<rect x="460" y="10" width="160" height="34" rx="6" fill="#fde68a"/><text x="540" y="32" text-anchor="middle">Nahi: underlay / MTU</text>
<rect x="250" y="64" width="170" height="34" rx="6" fill="#bae6fd"/><text x="335" y="86" text-anchor="middle">nve1 Oper Up, source ok?</text>
<rect x="460" y="64" width="160" height="34" rx="6" fill="#fde68a"/><text x="540" y="86" text-anchor="middle">Nahi: source-interface</text>
<rect x="250" y="112" width="170" height="34" rx="6" fill="#bae6fd"/><text x="335" y="134" text-anchor="middle">VNI Up aur same ID?</text>
<rect x="460" y="112" width="160" height="34" rx="6" fill="#fde68a"/><text x="540" y="134" text-anchor="middle">Nahi: VNI mismatch</text>
</g>
<g stroke="#64748b"><line x1="210" y1="27" x2="250" y2="27"/><line x1="420" y1="27" x2="460" y2="27"/><line x1="420" y1="81" x2="460" y2="81"/><line x1="420" y1="129" x2="460" y2="129"/><line x1="335" y1="44" x2="335" y2="64"/><line x1="335" y1="98" x2="335" y2="112"/></g>
</svg><p class="cap">Upar se neeche: pehle "Nahi" par ruko. Peer list aur MTU baad mein.</p></div>

<h3>Fault 1: VNI mismatch</h3>
<pre class="out">LEAF1# show nve vni
nve1       10010      N/A              Up         L2DP  10
LEAF2# show nve vni
nve1       <span class="hl">10001</span>      N/A              Up         L2DP  10</pre>
<p>Dono leaves akele healthy dikhte hain, aur koi error log nahi hota. VLANs match karte hain lekin VNIs alag hain, isliye har leaf aise packets bhejta hai jo doosra pehchanta nahi. Fix: dono VNIs barabar karo. Signature: peer list theek, us VNI ke liye dono sides par Pkts In zero.</p>

<h3>Fault 2: underlay mein VTEP loopback missing</h3>
<pre class="out">LEAF1# show ip route 10.255.1.12
% Network not in table
LEAF1# show nve peers
Interface  VNI      Type Peer-IP          state
nve1       10010    L2DP 10.255.1.12      <span class="hl">DOWN</span></pre>
<p>VTEP address LEAF2 par OSPF mein nahi hai (ya interface shut hai). Fix: Loopback1 par <code>ip ospf 1 area 0</code>. Signature: peer DOWN ya absent, route missing.</p>

<h3>Fault 3: galat ya down source-interface</h3>
<pre class="out">LEAF2# show nve interface nve1
Interface: nve1, State: Admin Up, <span class="hl">Oper Down</span>
 source-interface: Loopback9 (primary: not configured)</pre>
<p>nve1 aise interface ko point karta hai jis par IP nahi hai, ya jo underlay mein exist nahi karta. Fix: <code>source-interface Loopback1</code>. Signature: Oper Down, source address missing.</p>

<h3>Fault 4: MTU</h3>
<p>Chhote pings pass hote hain, bade file copies atak jaate hain. <code>ping 10.255.1.12 source Loopback1 size 1550 df-bit</code> fail hota hai jabki default ping chalta hai. Failing link par MTU badhao; har link ke liye dohrao, kyunki har hop theek karna padta hai.</p>

<h3>Fault 5: asymmetric peer list</h3>
<p>Ek direction chalti hai, doosri nahi (flood-and-learn chapter dekho). Har leaf par per VNI peer list compare karo: har leaf ko un sab doosron ko list karna hai jinke paas woh VNI hai.</p>

<div class="eg"><p><b>Worked example: ticket.</b> "H3 H4 (VLAN 20) tak nahi pahunch raha, lekin H1 aur H2 theek hain." Step 1: 10.255.1.12 aur .13 ke beech underlay ping pass. Step 2: dono leaves par nve1 Oper Up. Step 3: <code>show nve vni</code> LEAF2 par 10020 aur LEAF3 par 10002 dikhata hai. Ek digit ka typo, rung 3 par mila, ek line mein fix.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek saath teen cheezein badalna. Agar VNI, loopback aur peer list saath mein theek karo to pata nahi chalega ki kaunsi matter ki, aur ticket note useful nahi likh sakte. Ek change, ek verification.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Leaves ke beech VLAN IDs alag hain" VXLAN connectivity fault ka answer <b>nahi</b> hai; VNIs ka alag hona hai. Jab tak VLAN-to-VNI binding galat na ho, alag VLAN IDs harmless hain.</p></div>

<div class="scn"><h4>Friday night VNI typo</h4><p>Naya warehouse VLAN do alag engineers ne do leaves par banaya. Ek ne 10030 type kiya, doosre ne 10003. Har dashboard green tha, kyunki underlay aur VTEPs healthy the. Warehouse scanners apne server tak nahi pahunch paa rahe the. On-call engineer ne <code>show nve vni</code> outputs compare kiye aur aadhe minute mein farak pakad liya.</p><p><b>Seekh:</b> VNI allocation sheet rakho aur outputs ka diff lo; yaaddasht par bharosa mat karo.</p></div>

<div class="iv"><p class="q">"Do leaves par same VLAN ke hosts ping nahi kar paa rahe. Kya check karoge?"</p><p>Strong answer: VTEP loopbacks ke beech underlay reachability aur MTU, nve1 state aur source, dono leaves par VNI IDs aur state, dono directions mein per VNI peer list, aur aakhir mein traffic generate karke MAC table. Har step ke commands ka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch faults: VNI mismatch, OSPF mein Lo1 missing, bad source-interface, MTU, asymmetric peers.</li>
<li>Har ka show nve output mein ek-screen signature hota hai.</li>
<li>Ladder order mein chalo aur ek baar mein ek cheez badlo.</li>
<li>VLAN IDs alag ho sakte hain; VNIs nahi.</li>
</ul></div>
`}};export{e as default};