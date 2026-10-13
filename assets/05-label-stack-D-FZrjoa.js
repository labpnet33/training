var e={id:`label-stack`,h:{en:`The two-label stack, hop by hop`,hi:`Do-label stack, hop by hop`},body:{en:`
<p>Picture a letter inside an envelope inside a courier bag. The courier bag says which depot to deliver to; the envelope says which customer. Only the final depot opens the bag. In the VPN, the transport label is the bag and the VPN label is the envelope.</p>

<h3>The journey of one packet</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Label operations hop by hop">
<g font-size="12">
<rect x="10" y="30" width="90" height="40" rx="8" fill="#fde68a"/><text x="55" y="55" text-anchor="middle" class="svg-ink">CE1: IP</text>
<rect x="140" y="30" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="195" y="55" text-anchor="middle" class="svg-ink">PE1: push 2</text>
<rect x="290" y="30" width="100" height="40" rx="8" fill="#bae6fd"/><text x="340" y="55" text-anchor="middle" class="svg-ink">P1: pop outer</text>
<rect x="430" y="30" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink">PE2: pop VPN</text>
<rect x="570" y="30" width="60" height="40" rx="8" fill="#fde68a"/><text x="600" y="55" text-anchor="middle" class="svg-ink">CE2</text>
</g>
<g stroke="#64748b" stroke-width="2"><line x1="100" y1="50" x2="140" y2="50"/><line x1="250" y1="50" x2="290" y2="50"/><line x1="390" y1="50" x2="430" y2="50"/><line x1="540" y1="50" x2="570" y2="50"/></g>
<text x="195" y="110" text-anchor="middle" class="svg-accent" font-size="11">[16005][24][IP]</text>
<text x="340" y="110" text-anchor="middle" class="svg-accent" font-size="11">[24][IP]</text>
<text x="485" y="110" text-anchor="middle" class="svg-accent" font-size="11">[IP]</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Top of stack on the left. P1 is the penultimate hop and removes the outer label.</text>
</svg><p class="cap">The stack at each segment of the path (labels shown left to right, top first).</p></div>

<h3>Operation by operation</h3>
<ol>
<li><b>PE1</b> receives plain IP in VRF CUST_A, finds the VPN route with label 24 and next hop 10.0.255.5, then pushes 24 and then 16005.</li>
<li><b>P1</b> sees 16005 on top, which belongs to its neighbor PE2. It pops (penultimate hop popping) and forwards. It never sees label 24.</li>
<li><b>PE2</b> receives label 24. That label belongs to CUST_A, so PE2 pops it and sends the IP packet to CE2.</li>
</ol>

<h3>How to verify each step</h3>
<pre class="out">PE1# show ip cef vrf CUST_A 172.16.2.0/24 detail
172.16.2.0/24, nexthop 10.0.255.5
  <span class="hl">label [24|16005]</span> via GigabitEthernet0/1
PE1# traceroute vrf CUST_A 172.16.2.10
 1 10.0.12.2 [MPLS: Labels 16005/24] 4 msec
 2 192.168.2.1 3 msec</pre>
<p>The CEF output shows both labels at once, the traceroute shows the labels in flight. If you see only one label, the VPN label is missing; if you see none, the transport label is missing.</p>

<h3>Why the core never learns customers</h3>
<p>P routers keep only one table: the label table with the five loopbacks. The number of customers or routes can grow to millions without changing P router state. That is the scale benefit of the two-label design.</p>

<div class="eg"><b>Worked example.</b> Suppose the VPN label were 24 on PE2 but PE1 had stored 25. PE2 receives label 25, which belongs to nothing, and drops the packet. The first time you see this is a ping that fails from the CE but a traceroute that dies at the last hop.</div>

<div class="warn"><b>Common mistake.</b> Using plain <code>ping</code> from the PE to test the VPN. Without <code>vrf CUST_A</code> the packet goes through the global table and tells you nothing about the VPN.</div>

<div class="exam"><b>Exam trap.</b> With penultimate hop popping, the egress PE receives only the VPN label, not the transport label. Questions about "what label arrives at PE2" expect the VPN label alone.</div>

<div class="scn"><h4>Dead at the last hop</h4><p>A customer ping failed and the traceroute stopped at PE2. The engineer checked the label sent by PE1 against the label advertised by PE2. They differed after PE2 had been reloaded and had allocated new labels while PE1 still held the old route. Clearing the VPNv4 session refreshed the route.</p><p><b>Lesson:</b> after a PE reload, refresh the VPNv4 routes if labels disagree.</p></div>

<div class="iv"><p class="q">"What does a P router see in an L3VPN?"</p><p>Only the transport label (or the VPN label after PHP) and the IP-less forwarding entry for it. It holds no customer routes and no VRFs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outer label: reach the PE. Inner label: pick the VRF.</li>
<li>PHP removes the outer label at the last P router.</li>
<li><code>show ip cef vrf</code> shows both labels at the ingress.</li>
<li>P routers hold no customer state.</li>
</ul></div>
`,hi:`
<p>Ek courier bag ke andar ek envelope ke andar ek chitthi socho. Bag batata hai kaunse depot par deliver karna hai; envelope batata hai kaunsa customer. Sirf aakhri depot bag kholta hai. VPN mein transport label bag hai aur VPN label envelope.</p>

<h3>Ek packet ka safar</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Label operations hop by hop">
<g font-size="12">
<rect x="10" y="30" width="90" height="40" rx="8" fill="#fde68a"/><text x="55" y="55" text-anchor="middle" class="svg-ink">CE1: IP</text>
<rect x="140" y="30" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="195" y="55" text-anchor="middle" class="svg-ink">PE1: push 2</text>
<rect x="290" y="30" width="100" height="40" rx="8" fill="#bae6fd"/><text x="340" y="55" text-anchor="middle" class="svg-ink">P1: pop outer</text>
<rect x="430" y="30" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink">PE2: pop VPN</text>
<rect x="570" y="30" width="60" height="40" rx="8" fill="#fde68a"/><text x="600" y="55" text-anchor="middle" class="svg-ink">CE2</text>
</g>
<g stroke="#64748b" stroke-width="2"><line x1="100" y1="50" x2="140" y2="50"/><line x1="250" y1="50" x2="290" y2="50"/><line x1="390" y1="50" x2="430" y2="50"/><line x1="540" y1="50" x2="570" y2="50"/></g>
<text x="195" y="110" text-anchor="middle" class="svg-accent" font-size="11">[16005][24][IP]</text>
<text x="340" y="110" text-anchor="middle" class="svg-accent" font-size="11">[24][IP]</text>
<text x="485" y="110" text-anchor="middle" class="svg-accent" font-size="11">[IP]</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Stack ka top left par. P1 penultimate hop hai aur bahar wala label hata deta hai.</text>
</svg><p class="cap">Path ke har hisse par stack (labels left se right, top pehle).</p></div>

<h3>Operation ek ek karke</h3>
<ol>
<li><b>PE1</b> VRF CUST_A mein plain IP receive karta hai, label 24 aur next hop 10.0.255.5 wala VPN route dhoondhta hai, phir 24 push karta hai aur phir 16005.</li>
<li><b>P1</b> upar 16005 dekhta hai, jo uske padosi PE2 ka hai. Woh pop karta hai (penultimate hop popping) aur forward karta hai. Use label 24 kabhi dikhta nahi.</li>
<li><b>PE2</b> ko label 24 milta hai. Woh label CUST_A ka hai, isliye PE2 use pop karke IP packet CE2 ko bhejta hai.</li>
</ol>

<h3>Har step verify kaise karein</h3>
<pre class="out">PE1# show ip cef vrf CUST_A 172.16.2.0/24 detail
172.16.2.0/24, nexthop 10.0.255.5
  <span class="hl">label [24|16005]</span> via GigabitEthernet0/1
PE1# traceroute vrf CUST_A 172.16.2.10
 1 10.0.12.2 [MPLS: Labels 16005/24] 4 msec
 2 192.168.2.1 3 msec</pre>
<p>CEF output dono labels ek saath dikhata hai, traceroute raaste mein labels dikhata hai. Agar sirf ek label dikhe to VPN label missing hai; agar koi nahi dikhe to transport label missing hai.</p>

<h3>Core customers ko kabhi kyun nahi seekhta</h3>
<p>P routers sirf ek table rakhte hain: paanch loopbacks wali label table. Customers ya routes ki sankhya lakhon tak badh sakti hai bina P router ki state badle. Do-label design ka scale faayda yahi hai.</p>

<div class="eg"><b>Worked example.</b> Maan lo PE2 par VPN label 24 tha par PE1 ne 25 store kiya. PE2 ko label 25 milta hai, jo kisi cheez ka nahi hai, aur woh packet drop kar deta hai. Yeh pehli baar aise dikhta hai: CE se ping fail, aur traceroute aakhri hop par dam todta hai.</div>

<div class="warn"><b>Common mistake.</b> VPN test karne ke liye PE se plain <code>ping</code> use karna. <code>vrf CUST_A</code> ke bina packet global table se jaata hai aur VPN ke baare mein kuch nahi batata.</div>

<div class="exam"><b>Exam trap.</b> Penultimate hop popping ke saath egress PE ko sirf VPN label milta hai, transport label nahi. "PE2 par kaunsa label aata hai" wale sawaal sirf VPN label expect karte hain.</div>

<div class="scn"><h4>Aakhri hop par dead</h4><p>Customer ka ping fail hua aur traceroute PE2 par ruk gaya. Engineer ne PE1 ke bheje label ko PE2 ke advertise kiye label se milaya. PE2 reload ke baad naye labels allocate kar chuka tha jabki PE1 purana route pakde tha, isliye woh alag the. VPNv4 session clear karne se route refresh ho gaya.</p><p><b>Lesson:</b> PE reload ke baad agar labels mismatch hon to VPNv4 routes refresh karo.</p></div>

<div class="iv"><p class="q">"L3VPN mein P router kya dekhta hai?"</p><p>Sirf transport label (ya PHP ke baad VPN label) aur uski IP-rahit forwarding entry. Uske paas na customer routes hain na VRFs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bahar wala label: PE tak pahunchao. Andar wala: VRF chuno.</li>
<li>PHP aakhri P router par bahar wala label hata deta hai.</li>
<li><code>show ip cef vrf</code> ingress par dono labels dikhata hai.</li>
<li>P routers customer state nahi rakhte.</li>
</ul></div>
`}};export{e as default};