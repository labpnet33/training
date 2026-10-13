var e={id:`troubleshooting`,h:{en:`Troubleshooting method: INC-40211 and the layered approach`,hi:`Troubleshooting method: INC-40211 aur layered approach`},body:{en:`
<p>Tools matter less than order. A reliable method saves you from random commands and from "fixing" the wrong layer. This chapter gives a layered method and walks through the lab incident INC-40211 using the outputs you have already met.</p>

<h3>The method: from the packet's point of view</h3>
<ol>
<li><b>Define the flow</b>: source, destination, protocol, port, when it started. Write it down.</li>
<li><b>Layer 1 and 2</b>: interface up, ARP entry present.</li>
<li><b>Routing</b>: is there a route to the destination, and one back to the source?</li>
<li><b>Does the packet arrive?</b> Sniffer on the ingress interface.</li>
<li><b>Policy and flow</b>: policy lookup, then debug flow.</li>
<li><b>Does it leave?</b> Sniffer on the egress interface, with the NAT address in mind.</li>
<li><b>Does the answer come back?</b> Reply packets and the session counters.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Layered method">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Define</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">the flow</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Arrive</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">ingress sniffer</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Decide</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">route, policy</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Leave</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">egress sniffer</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Return</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">reply, session</text>
</svg><p class="cap">Follow the packet through the box; the first step that fails is your fault domain.</p></div>

<h3>Walkthrough: INC-40211</h3>
<p><b>Ticket:</b> "PC1 (10.0.1.10) can ping the intranet web server (10.0.2.10) but the page does not open."</p>
<ol>
<li><b>Define:</b> TCP 80 from 10.0.1.10 to 10.0.2.10 via FGT1 port2 to port3.</li>
<li><b>Interfaces and route:</b> port2 and port3 are up; the route to 10.0.2.0/24 is connected on port3 (chapter 7).</li>
<li><b>Policy lookup:</b> <code>diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2</code> returns policy id 0. Already suspicious.</li>
<li><b>Debug flow:</b> the trace in chapter 4 ends with <code>Denied by forward policy check (policy 0)</code>, after a correct route <code>via port3</code> and <code>in-[port2], out-[port3]</code>.</li>
<li><b>Conclusion:</b> routing is correct; the policy for this flow does not allow the service. Ping works because the allowing policy has PING.</li>
<li><b>Fix:</b> add HTTP to the service list of the policy for this path (a change you make through the policy editor), then repeat the test.</li>
<li><b>Verify:</b> the debug flow shows <code>Allowed by Policy-2:</code>, and the session list shows <code>policy_id=2</code>, <code>proto_state=01</code> and counters in both directions.</li>
</ol>

<h3>The second case: NAT and the sniffer</h3>
<p>In the <i>fgt-sniffer-sessions</i> lab the question is "is PC1 reaching the Internet, and as which address?". The sniffer on port1 showed echo requests from <b>203.0.113.2</b> to 8.8.8.8 with replies, and the session list showed <code>act=snat ... (203.0.113.2:40001)</code> with <code>policy_id=1</code>. So the packet left, was translated, and returned. A ticket claiming "the Internet is down" for that user is not a firewall path problem.</p>

<h3>The third case: no route</h3>
<p>If the same ping fails and the debug flow reports <code>no route to host, drop</code> with <code>via none</code>, stop looking at policy. Check <code>get router info routing-table all</code>: the default route is missing. Add or restore it, then test with a destination you have not used before.</p>

<h3>Writing it up</h3>
<p>A good ticket note has three lines: the evidence (command and the line that proves it), the cause, and the change made. "Debug flow: Denied by forward policy check (policy 0); web service missing from policy; added; verified Allowed by Policy-2" is a note the next engineer can trust.</p>

<div class="eg"><p><b>Worked example.</b> Three tickets in one morning: (a) "cannot open web page", debug flow denied, policy fix. (b) "nothing reaches the Internet", debug flow no route, routing fix. (c) "server sees wrong address", session list shows SNAT to 203.0.113.2, so the address is correct and the server ACL needs the NAT address. Same tools, three different layers.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing a policy first and diagnosing second. If the change does not help you have lost the original evidence. Capture a debug flow or a session line first, then change one thing, then compare.</p></div>
<div class="exam"><p><b>Exam trap.</b> Work the path in order: arrival, route, policy, NAT, return. If the sniffer shows the packet arriving but not leaving, the drop is inside the firewall and the debug flow names it. If it leaves but never returns, look beyond the firewall.</p></div>

<div class="scn"><h4>Return traffic that never came</h4><p>The egress sniffer showed requests leaving with source 203.0.113.2 but no replies. The session counters showed packets in the original direction only. The firewall had done its job; the upstream device had no return route to the NAT address.</p><p><b>Lesson:</b> counters in one direction only mean the problem is outside the firewall or on the return path.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a user who cannot reach a server through a FortiGate."</p><p>I define the flow, check interfaces and routes, then run a policy lookup. If needed I sniff the ingress interface to confirm arrival, run the debug flow to see the route and policy decision, and sniff the egress interface to confirm it leaves with the right NAT address. Session counters show whether replies return.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the packet: arrive, route, policy, NAT, leave, return.</li>
<li>The first failing step is the fault domain.</li>
<li>INC-40211: ping works, web fails, policy 0, fix the service in the policy.</li>
<li>No route and policy 0 look similar to users but need different fixes.</li>
<li>Capture evidence before changing anything.</li>
</ul></div>
`,hi:`
<p>Tools se zyada order matter karta hai. Reliable method random commands aur galat layer "fix" karne se bachata hai. Yeh chapter layered method deta hai aur lab incident INC-40211 ko un outputs se walk through karta hai jo aap dekh chuke ho.</p>

<h3>Method: packet ke nazariye se</h3>
<ol>
<li><b>Flow define karo</b>: source, destination, protocol, port, kab shuru hua. Likh lo.</li>
<li><b>Layer 1 aur 2</b>: interface up, ARP entry maujood.</li>
<li><b>Routing</b>: destination ka route hai, aur source tak wapas ka bhi?</li>
<li><b>Packet aata hai?</b> Ingress interface par sniffer.</li>
<li><b>Policy aur flow</b>: policy lookup, phir debug flow.</li>
<li><b>Nikalta hai?</b> Egress interface par sniffer, NAT address dhyan mein rakhke.</li>
<li><b>Jawab wapas aata hai?</b> Reply packets aur session counters.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Layered method">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Define</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">flow</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Arrive</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">ingress sniffer</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Decide</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">route, policy</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Leave</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">egress sniffer</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Return</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">reply, session</text>
</svg><p class="cap">Packet ke saath box ke andar chalo; pehla fail hone wala step aapka fault domain hai.</p></div>

<h3>Walkthrough: INC-40211</h3>
<p><b>Ticket:</b> "PC1 (10.0.1.10) intranet web server (10.0.2.10) ko ping kar sakta hai lekin page nahi khulta."</p>
<ol>
<li><b>Define:</b> 10.0.1.10 se 10.0.2.10 TCP 80, FGT1 port2 se port3.</li>
<li><b>Interfaces aur route:</b> port2 aur port3 up; 10.0.2.0/24 ka route port3 par connected hai (chapter 7).</li>
<li><b>Policy lookup:</b> <code>diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2</code> policy id 0 deta hai. Pehle hi shak.</li>
<li><b>Debug flow:</b> chapter 4 ka trace sahi route <code>via port3</code> aur <code>in-[port2], out-[port3]</code> ke baad <code>Denied by forward policy check (policy 0)</code> par khatam hota hai.</li>
<li><b>Conclusion:</b> routing sahi hai; is flow ki policy service allow nahi karti. Ping isliye chalta hai ki allow karne wali policy mein PING hai.</li>
<li><b>Fix:</b> is path ki policy ki service list mein HTTP jodo (policy editor se kiya jaane wala change), phir test dohrao.</li>
<li><b>Verify:</b> debug flow <code>Allowed by Policy-2:</code> dikhata hai, aur session list <code>policy_id=2</code>, <code>proto_state=01</code> aur dono directions ke counters dikhati hai.</li>
</ol>

<h3>Doosra case: NAT aur sniffer</h3>
<p><i>fgt-sniffer-sessions</i> lab mein sawaal hai "PC1 Internet tak pahunch raha hai, aur kis address ke roop mein?". Port1 ke sniffer ne <b>203.0.113.2</b> se 8.8.8.8 ko echo requests aur replies dikhaye, aur session list ne <code>act=snat ... (203.0.113.2:40001)</code> aur <code>policy_id=1</code> dikhaya. Matlab packet nikla, translate hua, aur lauta. Us user ke liye "Internet down hai" wala ticket firewall path ki problem nahi hai.</p>

<h3>Teesra case: no route</h3>
<p>Wahi ping fail ho aur debug flow <code>no route to host, drop</code> <code>via none</code> ke saath bataye, to policy dekhna band karo. <code>get router info routing-table all</code> check karo: default route gayab hai. Use add ya restore karo, phir aisi destination se test karo jo pehle use nahi hui.</p>

<h3>Likhna</h3>
<p>Achhe ticket note mein teen lines hoti hain: evidence (command aur woh line jo saabit kare), karan, aur kiya gaya change. "Debug flow: Denied by forward policy check (policy 0); web service policy mein nahi tha; add kiya; verified Allowed by Policy-2" aisa note hai jis par agla engineer bharosa kar sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek subah teen tickets: (a) "web page nahi khulta", debug flow denied, policy fix. (b) "Internet tak kuch nahi pahunchta", debug flow no route, routing fix. (c) "server ko galat address dikhta hai", session list SNAT 203.0.113.2 dikhati hai, yaani address sahi hai aur server ACL ko NAT address chahiye. Wahi tools, teen alag layers.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehle policy badalna aur baad mein diagnose karna. Change se madad na mile to original evidence kho chuke ho. Pehle debug flow ya session line capture karo, phir ek cheez badlo, phir compare karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Path ko order mein chalo: arrival, route, policy, NAT, return. Sniffer packet ko aata dikhaye lekin jaata nahi, to drop firewall ke andar hai aur debug flow naam batata hai. Nikle lekin lauta nahi, to firewall ke baahar dekho.</p></div>

<div class="scn"><h4>Return traffic jo aaya hi nahi</h4><p>Egress sniffer ne source 203.0.113.2 ke saath requests nikalte dikhaye lekin koi replies nahi. Session counters sirf original direction ke packets dikha rahe the. Firewall ne apna kaam kiya tha; upstream device ke paas NAT address ka return route nahi tha.</p><p><b>Lesson:</b> sirf ek direction ke counters matlab problem firewall ke baahar ya return path par hai.</p></div>

<div class="iv"><p class="q">"Batao FortiGate ke through server tak na pahunch paane wale user ko kaise troubleshoot karte ho."</p><p>Main flow define karta hoon, interfaces aur routes check karta hoon, phir policy lookup chalata hoon. Zaroorat ho to ingress interface par sniff karke arrival confirm karta hoon, debug flow se route aur policy decision dekhta hoon, aur egress interface par sniff karke confirm karta hoon ki sahi NAT address ke saath nikalta hai. Session counters dikhate hain ki replies lautte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet follow karo: arrive, route, policy, NAT, leave, return.</li>
<li>Pehla failing step fault domain hai.</li>
<li>INC-40211: ping chalta hai, web fail, policy 0, policy mein service theek karo.</li>
<li>No route aur policy 0 users ko ek jaise lagte hain par fix alag hain.</li>
<li>Kuch badalne se pehle evidence capture karo.</li>
</ul></div>
`}};export{e as default};