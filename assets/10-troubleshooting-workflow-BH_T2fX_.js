var e={id:`workflow`,h:{en:`A capture-based troubleshooting workflow`,hi:`Capture-based troubleshooting workflow`},body:{en:`
<p>A good detective does not search every room of the house at random. She asks precise questions, decides where the evidence must be, collects it without disturbing it, and only then names the culprit, with proof that stands up in court. Capture troubleshooting is the same discipline. Random captures produce thousands of packets and no answer; a structured workflow produces one packet that ends the ticket.</p>

<h3>The eight steps</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Eight step workflow">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 Define</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 Hypothesis</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 Place</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 Capture</text>
<rect x="490" y="120" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="147" text-anchor="middle" class="svg-ink" font-size="13">5 Filter</text>
<rect x="330" y="120" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="147" text-anchor="middle" class="svg-ink" font-size="13">6 Pair</text>
<rect x="170" y="120" width="140" height="44" rx="8" fill="#fde68a"/><text x="240" y="147" text-anchor="middle" class="svg-ink" font-size="13">7 Localise, fix</text>
<rect x="10" y="120" width="140" height="44" rx="8" fill="#fde68a"/><text x="80" y="147" text-anchor="middle" class="svg-ink" font-size="13">8 Prove</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="560" y2="120" stroke="#64748b" stroke-width="2"/><line x1="490" y1="142" x2="470" y2="142" stroke="#64748b" stroke-width="2"/><line x1="330" y1="142" x2="310" y2="142" stroke="#64748b" stroke-width="2"/><line x1="170" y1="142" x2="150" y2="142" stroke="#64748b" stroke-width="2"/>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">If step 8 fails, go back to step 3 with a new capture point</text>
</svg><p class="cap">Define, hypothesise, place, capture, filter, pair, localise and fix, prove.</p></div>
<ol>
<li><b>Define the problem precisely.</b> Who (source IP), what (destination IP and port or protocol), since when, always or sometimes, what exact error ("refused" or "timed out" already hints at the answer). "SSH to 10.9.9.1 from 10.9.9.10 is refused, ping works" is a problem you can capture. "The network is slow" is not yet.</li>
<li><b>Form a hypothesis with show commands.</b> Check the easy layers first: interface status, ARP, routes, neighbours. The capture then proves or kills the hypothesis instead of replacing thinking.</li>
<li><b>Choose the capture point.</b> Closest to the symptom first, then both sides of the suspect device. In the labs, choose one link in the selector.</li>
<li><b>Start the capture, then reproduce.</b> Capture broadly (no capture filter unless the link is huge), note the time, trigger the failure: ping, <code>ssh</code>, a DHCP renew, a flapped interface.</li>
<li><b>Filter to the conversation.</b> Protocol first (<code>arp</code>, <code>icmp</code>, <code>tcp</code>, <code>ospf</code>), then the flow (<code>ip.addr == …</code>, <code>tcp.port == …</code>). Watch the Displayed counter.</li>
<li><b>Pair every request with its answer.</b> ARP request with reply, echo with echo reply, SYN with SYN-ACK, Discover with Offer, Hello with the neighbour's Hello. Find the <b>first</b> request without the expected answer, or the first abnormal answer.</li>
<li><b>Localise, then fix one thing.</b> Look at who sent the abnormal answer (source IP, port, TTL) or at where the request stops appearing. Confirm on that device with a show command, and change one thing.</li>
<li><b>Prove the fix with a new capture.</b> The same filter should now show complete pairs. Save the .pcap before and after and attach both to the ticket.</li>
</ol>

<h3>The signature table</h3>
<table class="cmp"><tr><th>Evidence in the capture</th><th>Points to</th></tr>
<tr><td>ARP requests, no reply</td><td>Target down, wrong VLAN, wrong IP or mask, wrong gateway IP on the host</td></tr>
<tr><td>Echo requests leave, no replies, no ICMP errors</td><td>Silent drop or missing return route; capture further along</td></tr>
<tr><td>ICMP type 3 code 0/1</td><td>Routing: no route, or the last router cannot reach the host</td></tr>
<tr><td>ICMP type 3 code 13</td><td>An ACL or firewall denied it; the ICMP source names the device</td></tr>
<tr><td>ICMP type 11, same packet circling</td><td>Routing loop</td></tr>
<tr><td>SYN → RST, ACK from the server</td><td>Path fine; service not listening or refusing (vty transport, wrong port)</td></tr>
<tr><td>SYNs at 0, 1, 3, 7 s, no answer</td><td>Silent drop by ACL or firewall, or no return path</td></tr>
<tr><td>Retransmissions, duplicate ACKs</td><td>Loss on the path: check errors, duplex, congestion</td></tr>
<tr><td>DHCP Discovers, no Offer</td><td>Missing relay, wrong VLAN, snooping, server or pool problem</td></tr>
<tr><td>DNS response "No such name"</td><td>Wrong or missing DNS record, typo</td></tr>
<tr><td>OSPF Hellos both ways, empty Active Neighbor</td><td>Area, timer, mask, authentication or stub mismatch</td></tr>
</table>

<h3>The module's labs as tickets</h3>
<div class="eg"><p><b>Ticket A (Lab 1): "new PC2 cannot be reached".</b> Define: PC1 10.5.5.11 to PC2 10.5.5.12. Place: <code>PC1 eth0 ↔ SW1 Gi0/1</code>. Filter <code>arp || icmp</code>. Pair: ARP request (broadcast, opcode 1) answered by ARP reply (opcode 2), echo request answered by echo reply. Before PC2 had an address there was no ARP reply; after <code>ip 10.5.5.12/24 10.5.5.1</code> every pair completes. Proof: <code>show arp</code> on PC1 maps 10.5.5.12 to PC2's real MAC, and the echo to 192.0.2.1 carries R1 Gi0/0's MAC.</p></div>
<div class="eg"><p><b>Ticket B (Lab 2): "SSH to R1 refused".</b> The error word "refused" predicts a reset. Place: PC1 link. Filter <code>tcp</code>. Pair: SYN to port 22 answered by RST, ACK from 10.9.9.1 port 22. Localise: the router itself refuses; <code>show running-config | section line vty</code> shows <code>transport input telnet</code>. Fix: <code>transport input ssh</code>. Prove: SYN, SYN-ACK, ACK on port 22, and a new RST from port 23 when Telnet is tried.</p></div>
<div class="eg"><p><b>Ticket C (Lab 3): "no OSPF neighbours anywhere".</b> Two links, two captures. Filter <code>ospf</code>. Pair: Hellos flow both ways but no Active Neighbor. Compare fields: R2 sends Hello 5/Dead 20 toward R1; R3 sends Area 0.0.0.1 toward R2. Fix each odd side separately, one at a time, re-capturing after each. Prove: Hellos list each other, DBD/LSR/LSU/LSAck appear, neighbours FULL, R1 pings 3.3.3.3.</p></div>

<h3>Good habits and responsibilities</h3>
<p>Captures can contain passwords sent in clear text (Telnet, simple OSPF authentication), personal data and business secrets. Capture only on networks you are authorised to troubleshoot, keep capture files as long as the ticket needs them, store them securely, and share only the filtered packets that prove the point. This is one more reason to prefer SSH and cryptographic authentication: what a capture can read, an attacker with a capture can read too.</p>

<div class="warn"><p><b>Common mistake.</b> Changing several things at once after a capture points somewhere. If the problem disappears, you do not know which change fixed it, and you may have added a new problem. One change, one new capture.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting questions often give you a packet summary and ask for the cause. Read the source address of the answer and the type of answer (reply, RST, ICMP code, nothing) before looking at the options. Most wrong options describe a problem at a different layer from the evidence.</p></div>

<div class="scn"><h4>Two captures, one answer</h4><p>Users at a branch could open some internal sites but not the new HR portal. A capture on the branch user's port showed SYNs to 10.40.5.20 port 443 repeating with no answer. A second capture, taken simultaneously on the data center switch port of the HR server, showed the SYNs arriving and SYN-ACKs leaving, destined for the branch. So the reply was dying on the way back. <code>show ip route</code> on the data center core had no route to the new branch subnet; the default route pointed to the internet firewall, which dropped the unsolicited SYN-ACKs. Adding the branch route fixed it.</p><p><b>Lesson:</b> when requests leave and nothing returns, capture at the far end too. If the far end answers, the return path is broken.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot an application connectivity issue with packet captures."</p><p>Strong answer: define source, destination, port and exact error; check the basics with show commands; capture close to the client with no capture filter; reproduce; display-filter to the flow; pair requests with replies and find the first missing or abnormal one; identify which device sent the abnormal answer or where the request stops; confirm on that device and make one change; re-capture to prove it and attach before and after captures to the ticket. Mention capturing at two points when replies are missing, and handling captures securely.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: define, hypothesise, place, capture, filter, pair, localise and fix, prove.</li>
<li>The first request without the expected answer marks the edge of the problem.</li>
<li>Who sent the abnormal answer, or where the request disappears, localises the fault.</li>
<li>Change one thing at a time and prove every fix with a new capture.</li>
<li>Captures hold sensitive data: capture only with authorisation and store them securely.</li>
</ul></div>
`,hi:`
<p>Ek achhi detective ghar ka har kamra random tareeke se nahi chhaanti. Woh sateek sawaal poochti hai, tay karti hai ki saboot kahan hona chahiye, use bina chhede ikattha karti hai, aur tabhi culprit ka naam leti hai, aise saboot ke saath jo court mein tike. Capture troubleshooting bhi yahi discipline hai. Random captures hazaaron packets dete hain aur koi jawab nahi; structured workflow ek packet deta hai jo ticket khatam kar deta hai.</p>

<h3>Aath steps</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Aath step workflow">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 Define</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 Hypothesis</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 Place</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 Capture</text>
<rect x="490" y="120" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="147" text-anchor="middle" class="svg-ink" font-size="13">5 Filter</text>
<rect x="330" y="120" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="147" text-anchor="middle" class="svg-ink" font-size="13">6 Pair</text>
<rect x="170" y="120" width="140" height="44" rx="8" fill="#fde68a"/><text x="240" y="147" text-anchor="middle" class="svg-ink" font-size="13">7 Localise, fix</text>
<rect x="10" y="120" width="140" height="44" rx="8" fill="#fde68a"/><text x="80" y="147" text-anchor="middle" class="svg-ink" font-size="13">8 Prove</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="560" y2="120" stroke="#64748b" stroke-width="2"/><line x1="490" y1="142" x2="470" y2="142" stroke="#64748b" stroke-width="2"/><line x1="330" y1="142" x2="310" y2="142" stroke="#64748b" stroke-width="2"/><line x1="170" y1="142" x2="150" y2="142" stroke="#64748b" stroke-width="2"/>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Step 8 fail ho to naye capture point ke saath step 3 par wapas jao</text>
</svg><p class="cap">Define, hypothesis, place, capture, filter, pair, localise aur fix, prove.</p></div>
<ol>
<li><b>Problem ko sateek define karo.</b> Kaun (source IP), kya (destination IP aur port ya protocol), kab se, hamesha ya kabhi kabhi, exact error kya hai ("refused" ya "timed out" pehle se jawab ka ishara deta hai). "10.9.9.10 se 10.9.9.1 par SSH refuse hota hai, ping chalta hai" aisi problem hai jise capture kar sakte ho. "Network slow hai" abhi nahi.</li>
<li><b>Show commands se hypothesis banao.</b> Pehle aasaan layers check karo: interface status, ARP, routes, neighbours. Phir capture hypothesis ko prove ya khatam karta hai, sochne ki jagah nahi leta.</li>
<li><b>Capture point chuno.</b> Pehle symptom ke sabse paas, phir suspect device ke dono sides. Labs mein selector mein ek link chuno.</li>
<li><b>Capture start karo, phir reproduce karo.</b> Broad capture karo (link bahut bada na ho to capture filter nahi), time note karo, failure trigger karo: ping, <code>ssh</code>, DHCP renew, interface flap.</li>
<li><b>Baatcheet tak filter karo.</b> Pehle protocol (<code>arp</code>, <code>icmp</code>, <code>tcp</code>, <code>ospf</code>), phir flow (<code>ip.addr == …</code>, <code>tcp.port == …</code>). Displayed counter dekhte raho.</li>
<li><b>Har request ko uske jawab se jodo.</b> ARP request ko reply se, echo ko echo reply se, SYN ko SYN-ACK se, Discover ko Offer se, Hello ko neighbour ke Hello se. <b>Pehli</b> request dhoondho jiska expected jawab nahi aaya, ya pehla abnormal jawab.</li>
<li><b>Localise karo, phir ek cheez fix karo.</b> Dekho abnormal jawab kisne bheja (source IP, port, TTL) ya request kahan dikhna band hoti hai. Us device par show command se confirm karo, aur ek cheez badlo.</li>
<li><b>Naye capture se fix prove karo.</b> Wahi filter ab poori jodiyan dikhana chahiye. Pehle aur baad ka .pcap save karo aur dono ticket mein attach karo.</li>
</ol>

<h3>Signature table</h3>
<table class="cmp"><tr><th>Capture mein saboot</th><th>Kis taraf ishara</th></tr>
<tr><td>ARP requests, koi reply nahi</td><td>Target down, galat VLAN, galat IP ya mask, host par galat gateway IP</td></tr>
<tr><td>Echo requests nikalti hain, replies nahi, ICMP errors nahi</td><td>Silent drop ya missing return route; aage capture karo</td></tr>
<tr><td>ICMP type 3 code 0/1</td><td>Routing: route nahi, ya aakhri router host tak nahi pahunch pata</td></tr>
<tr><td>ICMP type 3 code 13</td><td>ACL ya firewall ne deny kiya; ICMP source device ka naam batata hai</td></tr>
<tr><td>ICMP type 11, same packet ghoomta hua</td><td>Routing loop</td></tr>
<tr><td>SYN → server se RST, ACK</td><td>Path theek; service listen nahi kar rahi ya refuse kar rahi (vty transport, galat port)</td></tr>
<tr><td>0, 1, 3, 7 s par SYNs, koi jawab nahi</td><td>ACL ya firewall ka silent drop, ya return path nahi</td></tr>
<tr><td>Retransmissions, duplicate ACKs</td><td>Path par loss: errors, duplex, congestion check karo</td></tr>
<tr><td>DHCP Discovers, koi Offer nahi</td><td>Missing relay, galat VLAN, snooping, server ya pool problem</td></tr>
<tr><td>DNS response "No such name"</td><td>Galat ya missing DNS record, typo</td></tr>
<tr><td>Dono taraf OSPF Hellos, khaali Active Neighbor</td><td>Area, timer, mask, authentication ya stub mismatch</td></tr>
</table>

<h3>Module ki labs tickets ke roop mein</h3>
<div class="eg"><p><b>Ticket A (Lab 1): "naya PC2 reach nahi hota".</b> Define: PC1 10.5.5.11 se PC2 10.5.5.12. Place: <code>PC1 eth0 ↔ SW1 Gi0/1</code>. Filter <code>arp || icmp</code>. Pair: ARP request (broadcast, opcode 1) ka jawab ARP reply (opcode 2), echo request ka jawab echo reply. PC2 ke paas address hone se pehle koi ARP reply nahi tha; <code>ip 10.5.5.12/24 10.5.5.1</code> ke baad har jodi poori hoti hai. Proof: PC1 par <code>show arp</code> 10.5.5.12 ko PC2 ke asli MAC se map karta hai, aur 192.0.2.1 wale echo mein R1 Gi0/0 ka MAC hai.</p></div>
<div class="eg"><p><b>Ticket B (Lab 2): "R1 par SSH refuse".</b> Error ka shabd "refused" reset ki bhavishyavani karta hai. Place: PC1 link. Filter <code>tcp</code>. Pair: port 22 ke SYN ka jawab 10.9.9.1 port 22 se RST, ACK. Localise: router khud refuse karta hai; <code>show running-config | section line vty</code> mein <code>transport input telnet</code> hai. Fix: <code>transport input ssh</code>. Prove: port 22 par SYN, SYN-ACK, ACK, aur Telnet try karne par port 23 se naya RST.</p></div>
<div class="eg"><p><b>Ticket C (Lab 3): "kahin bhi OSPF neighbours nahi".</b> Do links, do captures. Filter <code>ospf</code>. Pair: Hellos dono taraf chalte hain lekin koi Active Neighbor nahi. Fields compare karo: R2 R1 ki taraf Hello 5/Dead 20 bhejta hai; R3 R2 ki taraf Area 0.0.0.1 bhejta hai. Har alag side ko ek ek karke fix karo, har baar dobara capture karke. Prove: Hellos ek dusre ko list karte hain, DBD/LSR/LSU/LSAck dikhte hain, neighbours FULL, R1 3.3.3.3 ping karta hai.</p></div>

<h3>Achhi aadatein aur zimmedariyan</h3>
<p>Captures mein clear text mein bheje passwords (Telnet, simple OSPF authentication), personal data aur business secrets ho sakte hain. Sirf un networks par capture karo jinhe troubleshoot karne ka aapko authorisation hai, capture files utni hi der rakho jitni ticket ko chahiye, unhe securely store karo, aur sirf woh filtered packets share karo jo point prove karte hain. SSH aur cryptographic authentication pasand karne ki yeh ek aur wajah hai: jo capture padh sakta hai, woh capture wala attacker bhi padh sakta hai.</p>

<div class="warn"><p><b>Common galti.</b> Capture kisi taraf ishara kare to ek saath kai cheezein badal dena. Problem gayab ho jaaye to aapko pata nahi ki kis change ne fix kiya, aur shayad aapne nayi problem jod di. Ek change, ek naya capture.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting sawaal aksar packet summary dete hain aur wajah poochte hain. Options dekhne se pehle jawab ka source address aur jawab ka type (reply, RST, ICMP code, kuch nahi) padho. Zyada tar galat options saboot se alag layer ki problem batate hain.</p></div>

<div class="scn"><h4>Do captures, ek jawab</h4><p>Ek branch ke users kuch internal sites khol pa rahe the lekin naya HR portal nahi. Branch user ke port par capture mein 10.40.5.20 port 443 ko SYNs bina jawab ke repeat hote dikhe. Ek saath data center mein HR server ke switch port par liye dusre capture mein SYNs aate aur branch ke liye SYN-ACKs nikalte dikhe. Yaani reply wapas aate hue mar raha tha. Data center core par <code>show ip route</code> mein naye branch subnet ka route nahi tha; default route internet firewall ki taraf tha, jo bina maange aaye SYN-ACKs drop kar deta tha. Branch route jodne se fix hua.</p><p><b>Seekh:</b> jab requests nikalti hain aur kuch wapas nahi aata, to door wale end par bhi capture karo. Agar door wala end jawab deta hai, to return path toota hai.</p></div>

<div class="iv"><p class="q">"Packet captures se application connectivity issue kaise troubleshoot karte ho, step by step batao."</p><p>Strong answer: source, destination, port aur exact error define karo; show commands se basics check karo; client ke paas bina capture filter ke capture karo; reproduce karo; flow tak display-filter karo; requests ko replies se jodo aur pehla missing ya abnormal dhoondho; pata karo kis device ne abnormal jawab bheja ya request kahan rukti hai; us device par confirm karke ek change karo; dobara capture karke prove karo aur pehle aur baad ke captures ticket mein attach karo. Replies missing hon to do points par capture karna, aur captures ko securely handle karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: define, hypothesis, place, capture, filter, pair, localise aur fix, prove.</li>
<li>Pehli request jiska expected jawab nahi aaya, problem ka kinara mark karti hai.</li>
<li>Abnormal jawab kisne bheja, ya request kahan gayab hoti hai, isse fault localise hota hai.</li>
<li>Ek baar mein ek cheez badlo aur har fix ko naye capture se prove karo.</li>
<li>Captures mein sensitive data hota hai: sirf authorisation ke saath capture karo aur securely store karo.</li>
</ul></div>
`}};export{e as default};