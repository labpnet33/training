var e={id:`overview`,h:{en:`Diagnostics on FortiGate: what you will learn and the big picture`,hi:`FortiGate diagnostics: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn the three tools that a FortiGate engineer reaches for on almost every ticket: the <b>packet sniffer</b> (did the packets arrive and leave, and on which ports?), the <b>debug flow</b> (why did the kernel accept or drop this packet, and which policy decided?) and the <b>session table</b> (what session was built, which policy owns it and what was translated?). Around them you will use the <code>get</code> and <code>diagnose</code> toolbox for routes, ARP, interfaces and logs. This maps to the Diagnostics and troubleshooting objectives of the Fortinet NSE 4 / FortiOS Administrator 7.6 exam.</p>
<p><b>Prerequisites.</b> You should understand firewall policies and NAT from the <b>nse4-policy</b> and <b>nse4-nat</b> modules and basic routing. No prior experience with the diagnostic commands is needed.</p>

<div class="note"><p><b>Everything in this module runs in the simulator.</b> Unlike the profile modules, the output you see here was <b>captured from the simulator</b> by running the commands on the same lab devices you will use: FGT1 (the Pune FortiGate), PC1, WEB, ISP and INET-SRV. Two labs go with this module: <i>fgt-debug-flow</i> (a NOC ticket) and <i>fgt-sniffer-sessions</i> (document the traffic flow). The simulator is educational and is not FortiOS, so details such as version strings and timing can differ from real devices.</p></div>

<h3>Analogy: a shopping mall security room</h3>
<p>Think of the FortiGate as a mall with three entrances. The <b>sniffer</b> is the CCTV pointed at each door: it shows who walked in at which door and who walked out of which door. The <b>debug flow</b> is the guard's notebook: for each visitor he writes why he let them through or turned them away ("not on the guest list", "no such shop on this floor"). The <b>session table</b> is the visitor register: everyone currently inside, which pass they used, and which name tag they were given at the door (NAT). A good engineer checks CCTV first, the notebook second and the register third.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Diagnostic tools">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.9">Sniffer</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.9">packets in and out</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.9">Debug flow</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.9">why: route, policy, NAT</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.9">Session table</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.9">what was built</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.9">Fix</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.9">then verify</text>
</svg><p class="cap">The usual order of tools on a ticket.</p></div>

<h3>The lab network</h3>
<p>All examples use one topology so you can compare outputs from chapter to chapter.</p>
<table class="cmp"><tr><th>Device</th><th>Interface</th><th>Address</th><th>Role</th></tr>
<tr><td>FGT1</td><td>port1</td><td>203.0.113.2/30</td><td>WAN, next hop 203.0.113.1 (ISP)</td></tr>
<tr><td>FGT1</td><td>port2</td><td>10.0.1.1/24</td><td>LAN (PC1 is 10.0.1.10)</td></tr>
<tr><td>FGT1</td><td>port3</td><td>10.0.2.1/24</td><td>DMZ (WEB is 10.0.2.10)</td></tr>
<tr><td>INET-SRV</td><td>eth0</td><td>8.8.8.8/24</td><td>"Internet" test server</td></tr></table>

<h3>The packet path in one picture</h3>
<p>For each packet entering a FortiGate the kernel does roughly this: check for an existing <b>session</b> (if found, forward it using the session); if not, do the <b>routing</b> lookup, then the <b>policy</b> lookup, then <b>NAT</b> if the policy says so, create a session, and send the packet out. The debug flow prints exactly these steps. Keeping this sequence in mind makes every ticket a short checklist.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) cannot ping 8.8.8.8. Sniffer on <code>any</code> shows the echo request arriving on <code>port2</code> but never leaving <code>port1</code>: the FortiGate dropped it. Debug flow shows "no route to host, drop": the default route is missing. After the static route is restored, the sniffer shows the request leaving <code>port1</code> with the source translated to 203.0.113.2, and the session table shows policy 1 with SNAT. Three tools, one story.</p></div>

<div class="warn"><p><b>Common mistake.</b> Starting with the debug flow and no filter on a busy firewall. Output floods the console and loads the CPU. Always set a filter and a count, and switch debug off when done.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam asks which tool answers which question: sniffer for what crosses the interfaces, debug flow for why a packet was accepted or dropped, session table for existing sessions and NAT, and routing table for the egress choice.</p></div>

<div class="scn"><h4>Three tools, five minutes</h4><p>A user reported that the intranet page on the DMZ server never loaded, although ping worked. A junior engineer spent an hour changing routes. A senior engineer ran the sniffer (SYN arrives, nothing leaves), then the debug flow (denied by policy 0), then added HTTP to the policy. Total time: five minutes.</p><p><b>Lesson:</b> let the tools tell you which layer is at fault before you change anything.</p></div>

<div class="iv"><p class="q">"A user cannot reach a server through the FortiGate. How do you start?"</p><p>I confirm addresses and the expected path, then run a sniffer on the ingress and egress interfaces to see whether the packet arrives and leaves. If it arrives but does not leave, I use the debug flow with a filter to see whether routing, policy or NAT dropped it. I check the session table for the policy and translations, fix the cause and retest, then turn debug off.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sniffer shows packets, debug flow shows decisions, session table shows built sessions.</li>
<li>Packet path: session lookup, route, policy, NAT, session creation, egress.</li>
<li>Always filter and limit debug; disable and reset afterwards.</li>
<li>Every output in this module was captured from the simulator labs.</li>
<li>Labs: fgt-debug-flow and fgt-sniffer-sessions.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap woh teen tools seekhoge jinhe FortiGate engineer lagbhag har ticket par uthata hai: <b>packet sniffer</b> (packets aaye aur gaye ya nahi, aur kis ports par?), <b>debug flow</b> (kernel ne packet kyun accept ya drop kiya, aur kaunsi policy ne decide kiya?) aur <b>session table</b> (kaunsa session bana, kaunsi policy ka hai aur kya translate hua?). Inke saath aap routes, ARP, interfaces aur logs ke liye <code>get</code> aur <code>diagnose</code> toolbox use karoge. Yeh Fortinet NSE 4 / FortiOS Administrator 7.6 exam ke Diagnostics and troubleshooting objectives se match karta hai.</p>
<p><b>Prerequisites.</b> Aapko <b>nse4-policy</b> aur <b>nse4-nat</b> modules se firewall policies aur NAT, aur basic routing aani chahiye. Diagnostic commands ka pehle se experience zaroori nahi.</p>

<div class="note"><p><b>Is module ka sab kuch simulator mein chalta hai.</b> Profile modules se alag, yahan jo output dikhta hai woh <b>simulator se capture</b> kiya gaya hai, usi lab devices par commands chalakar jo aap use karoge: FGT1 (Pune FortiGate), PC1, WEB, ISP aur INET-SRV. Is module ke saath do labs hain: <i>fgt-debug-flow</i> (NOC ticket) aur <i>fgt-sniffer-sessions</i> (traffic flow document karo). Simulator educational hai aur FortiOS nahi hai, isliye version strings aur timing jaisi details real devices se alag ho sakti hain.</p></div>

<h3>Analogy: mall ka security room</h3>
<p>FortiGate ko teen entrances wala mall samjho. <b>Sniffer</b> har darwaze par laga CCTV hai: kaun kis darwaze se andar aaya aur kis se bahar gaya. <b>Debug flow</b> guard ki notebook hai: har visitor ke liye woh likhta hai ki use kyun jaane diya ya wapas kiya ("guest list mein nahi", "is floor par aisi koi dukaan nahi"). <b>Session table</b> visitor register hai: abhi andar kaun hai, kaunsa pass use kiya, aur darwaze par kaunsa naam ka tag diya gaya (NAT). Accha engineer pehle CCTV, phir notebook, phir register dekhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Diagnostic tools">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Sniffer</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">packets in aur out</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Debug flow</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">kyun: route, policy, NAT</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Session table</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">kya bana</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Fix</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">phir verify</text>
</svg><p class="cap">Ticket par tools ka usual order.</p></div>

<h3>Lab network</h3>
<p>Saare examples ek hi topology use karte hain taaki aap chapter se chapter outputs compare kar sako.</p>
<table class="cmp"><tr><th>Device</th><th>Interface</th><th>Address</th><th>Role</th></tr>
<tr><td>FGT1</td><td>port1</td><td>203.0.113.2/30</td><td>WAN, next hop 203.0.113.1 (ISP)</td></tr>
<tr><td>FGT1</td><td>port2</td><td>10.0.1.1/24</td><td>LAN (PC1 10.0.1.10 hai)</td></tr>
<tr><td>FGT1</td><td>port3</td><td>10.0.2.1/24</td><td>DMZ (WEB 10.0.2.10 hai)</td></tr>
<tr><td>INET-SRV</td><td>eth0</td><td>8.8.8.8/24</td><td>"Internet" test server</td></tr></table>

<h3>Packet path ek picture mein</h3>
<p>FortiGate mein aane wale har packet ke liye kernel lagbhag yeh karta hai: pehle existing <b>session</b> check karo (mile to session se forward karo); nahi mile to <b>routing</b> lookup, phir <b>policy</b> lookup, policy kahe to <b>NAT</b>, session banao, aur packet bahar bhejo. Debug flow exactly yahi steps print karta hai. Yeh sequence yaad rakhne se har ticket chhoti checklist ban jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) 8.8.8.8 ko ping nahi kar pa raha. <code>any</code> par sniffer dikhata hai ki echo request <code>port2</code> par aaya lekin <code>port1</code> se kabhi gaya nahi: FortiGate ne drop kiya. Debug flow "no route to host, drop" dikhata hai: default route missing hai. Static route wapas aane ke baad sniffer dikhata hai ki request <code>port1</code> se source 203.0.113.2 mein translate hokar jaa rahi hai, aur session table policy 1 SNAT ke saath dikhata hai. Teen tools, ek kahani.</p></div>

<div class="warn"><p><b>Common mistake.</b> Busy firewall par bina filter ke debug flow se shuru karna. Output console bhar deta hai aur CPU load karta hai. Hamesha filter aur count set karo, aur kaam ke baad debug off karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochta hai kaunsa tool kis sawaal ka jawab deta hai: sniffer interfaces par kya guzarta hai, debug flow packet kyun accept ya drop hua, session table existing sessions aur NAT, aur routing table egress choice.</p></div>

<div class="scn"><h4>Teen tools, paanch minute</h4><p>Ek user ne bataya ki DMZ server ka intranet page kabhi load nahi hota, jabki ping chalta hai. Junior engineer ne ek ghanta routes badalne mein lagaya. Senior engineer ne sniffer chalaya (SYN aaya, kuch nahi gaya), phir debug flow (denied by policy 0), phir policy mein HTTP joda. Kul time: paanch minute.</p><p><b>Lesson:</b> kuch badalne se pehle tools ko batane do ki kaunsi layer galat hai.</p></div>

<div class="iv"><p class="q">"User FortiGate ke through server tak nahi pahunch pa raha. Kaise shuru karoge?"</p><p>Main addresses aur expected path confirm karta hoon, phir ingress aur egress interfaces par sniffer chalata hoon ki packet aata aur jaata hai ya nahi. Aaye lekin na jaaye to filter ke saath debug flow se dekhta hoon ki routing, policy ya NAT ne drop kiya. Session table mein policy aur translations check karta hoon, cause fix karke retest karta hoon, phir debug off karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sniffer packets dikhata hai, debug flow decisions, session table bane sessions.</li>
<li>Packet path: session lookup, route, policy, NAT, session creation, egress.</li>
<li>Debug hamesha filter aur limit ke saath; baad mein disable aur reset.</li>
<li>Is module ka har output simulator labs se capture hua hai.</li>
<li>Labs: fgt-debug-flow aur fgt-sniffer-sessions.</li>
</ul></div>
`}};export{e as default};