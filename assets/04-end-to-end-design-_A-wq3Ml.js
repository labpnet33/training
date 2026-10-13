var e={id:`end-to-end-design`,h:{en:`End-to-end design: one QoS language from phone to WAN`,hi:`End-to-end design: phone se WAN tak ek hi QoS bhasha`},body:{en:`<h3>The rule: mark once, trust everywhere, queue at every bottleneck</h3>
<p>A call crosses many devices: phone, access switch, branch router, provider cloud, head-office router, server. If each device invented its own markings, a packet marked EF in one place could be treated as best effort in the next. A good design therefore uses <b>one QoS language</b> everywhere: the same classes, the same DSCP values, the same names. Three steps repeat on every path.</p>
<ol><li><b>Classify and mark</b> at the edge, where traffic enters the network you control (the trust boundary).</li>
<li><b>Trust the mark</b> inside the network; queue by DSCP at every <b>bottleneck</b>, which means every link that is slower than the sum of what can arrive.</li>
<li><b>Verify</b> the mark survives the provider and the return path.</li></ol>
<h3>An eight-class model</h3>
<p>Many designs fail because they try to have twenty classes. Eight cover almost every enterprise.</p>
<table class="cmp"><tr><th>Class</th><th>DSCP</th><th>Typical traffic</th><th>Queue treatment (10 Mbps circuit)</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>RTP voice bearer</td><td>priority 1000 kbps (10 percent)</td></tr>
<tr><td>Interactive video</td><td>AF41 (34)</td><td>meetings, video conference</td><td>bandwidth 3000 kbps (30 percent)</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>SIP, Skinny</td><td>bandwidth 300 kbps</td></tr>
<tr><td>Network control</td><td>CS6 (48)</td><td>routing protocols, keepalives</td><td>bandwidth 5 percent</td></tr>
<tr><td>Critical data</td><td>AF21 (18)</td><td>ERP, CRM, databases</td><td>bandwidth 20 percent, WRED</td></tr>
<tr><td>Bulk data</td><td>AF11 (10)</td><td>backups, file copy</td><td>bandwidth 5 percent, policed or WRED</td></tr>
<tr><td>Scavenger</td><td>CS1 (8)</td><td>updates, streaming media, non-business</td><td>smaller than best effort, may be policed</td></tr>
<tr><td>Best effort</td><td>default (0)</td><td>everything else</td><td>class-default, fair-queue</td></tr></table>
<p>The labs use the first three plus bulk and class-default, because that is where the call quality is decided. Network control (CS6) is marked by the router itself and is protected by default on real platforms.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Where mark and queue happen on a path">
<rect x="20" y="40" width="90" height="50" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">Phone / PC</text>
<rect x="150" y="40" width="90" height="50" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="195" y="70" text-anchor="middle" class="svg-ink" font-size="12">Access SW</text>
<rect x="280" y="40" width="100" height="50" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="330" y="70" text-anchor="middle" class="svg-ink" font-size="12">Branch router</text>
<rect x="420" y="40" width="80" height="50" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="460" y="70" text-anchor="middle" class="svg-ink" font-size="12">Provider</text>
<rect x="540" y="40" width="80" height="50" rx="6" fill="#fde68a" stroke="#64748b"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">Hub router</text>
<line x1="110" y1="65" x2="150" y2="65" stroke="#64748b" stroke-width="2"/><line x1="240" y1="65" x2="280" y2="65" stroke="#64748b" stroke-width="2"/><line x1="380" y1="65" x2="420" y2="65" stroke="#64748b" stroke-width="2"/><line x1="500" y1="65" x2="540" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="195" y="125" text-anchor="middle" class="svg-accent" font-size="12">1 trust boundary</text>
<text x="330" y="125" text-anchor="middle" class="svg-accent" font-size="12">2 mark IN, queue OUT</text>
<text x="460" y="125" text-anchor="middle" class="svg-accent" font-size="12">3 honour DSCP</text>
<text x="580" y="125" text-anchor="middle" class="svg-accent" font-size="12">4 same policy</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">The return path needs the same four steps: QoS is per direction</text></svg><p class="cap">Four places where design is decided: trust boundary, branch edge, provider, hub.</p></div>
<h3>Campus first, then WAN</h3>
<p>Inside a campus the links are fast and congestion is rare, so the campus policy is mostly <b>marking and trust</b>, with simple queues on uplinks. The WAN edge is where queues really build, because a 1 Gbps LAN meets a 10 Mbps circuit. That is why the lab places the marking policy <b>inbound on the LAN interface</b> and the queueing policy <b>outbound on the WAN interface</b>.</p>
<h3>Crossing a provider</h3>
<p>A provider with MPLS or a managed WAN has its own classes. Typical contracts offer three or four classes (real-time, business, best effort). Read the contract, then <b>map your DSCP to theirs</b> at the customer edge. In the quality lab the provider honours CS5 for its real-time class and rewrites other markings, so the customer edge sets <code>set dscp cs5</code> on voice as it leaves, after the priority queue decision has been made. Remember that the provider may also reset DSCP to 0 at its ingress if you do not match the contract, which is the most common reason "QoS works in the lab and not across the WAN". Inside an MPLS core the DSCP is copied or mapped into the 3-bit MPLS traffic class field (EF usually to 5, AF41 to 4, CS3 to 3), and the original DSCP is restored at the egress when the provider runs uniform or pipe mode.</p>
<h3>Both directions, every circuit</h3>
<p>QoS is applied per interface and per direction. A policy on R-PUN protects Pune to Mumbai only. Mumbai to Pune needs the same policy on R-MUM, otherwise the return voice queues behind the backup in the head-end router and the user hears one-way degradation. Likewise a backup circuit needs the policy too, because after failover it carries the whole load (lab mq-voice-video-backup). Tunnels need thought: the outer header copies the DSCP of the inner one by default on most routers, so the WAN policy can still see it, but an encrypted tunnel hides the inner ports from classification, so classify by DSCP on the WAN, not by port.</p>
<div class="eg"><p><b>Worked example: Zenith Logistics.</b> LAN edge (inbound, Gi0/1): VOICE (UDP 16384-32767) to EF, VIDEO (UDP 5004-5005) to AF41, SIGNALLING (SIP) to CS3, BULK (TCP 445) to AF11, everything else to default. WAN edge (outbound, Gi0/0): EF priority 1000, AF41 bandwidth 3000, CS3 bandwidth 300, class-default fair-queue. The same two policies, with the same names, run on R-MUM, R-PUN and R-DEL.</p></div>
<pre class="code"><span class="c">! LAN edge: classify, mark, re-mark the rest to default (untrusted)</span>
policy-map MARK-IN
 class VOICE
  set dscp ef
 class VIDEO
  set dscp af41
 class SIGNALLING
  set dscp cs3
 class BULK
  set dscp af11
 class class-default
  set dscp default
<span class="c">! WAN edge: queue by the DSCP written at the edge</span>
policy-map WAN-OUT
 class EF-Q
  priority 1000
 class AF41-Q
  bandwidth 3000
 class CS3-Q
  bandwidth 300
 class class-default
  fair-queue</pre>
<div class="note"><p><b>Junos note.</b> The same design in Junos CoS: a multifield classifier (a firewall filter with <code>forwarding-class</code> and <code>loss-priority</code> actions) marks at the edge, a scheduler map with <code>priority strict-high</code> for the voice forwarding class and <code>transmit-rate</code> for the others is attached under <code>set class-of-service interfaces ge-0/0/0 scheduler-map WAN-MAP</code>, and a rewrite rule sets the DSCP on egress.</p></div>
<div class="warn"><p><b>Common mistake.</b> Trusting the DSCP that arrives from user ports. A PC can mark everything EF and take the priority queue. Re-mark at the trust boundary, trust only a verified phone, and let class-default re-mark the rest to 0.</p></div>
<div class="exam"><p><b>Exam trap.</b> The priority queue should not exceed about one third (33 percent) of a link, and the sum of all guaranteed classes about 75 percent, which leaves room for routing protocols and best effort. A design with 60 percent priority is wrong even if the router accepts it.</p></div>
<div class="scn"><h4>Scenario: QoS only worked one way</h4><p>After the Pune rollout the branch reported perfect calls to Mumbai, but Mumbai users heard stutter from Pune during the evening backup. R-PUN had the policy; R-MUM, deployed by another team, had none. The engineer copied the two policies to R-MUM and added the same names to the change record so the next site would not forget.</p><p><b>Lesson:</b> A one-direction policy is half a design. Check both ends and both circuits.</p></div>
<div class="iv"><p class="q">"Design QoS for voice, video and data across a three-site WAN."</p><p>Start with the classes and DSCP values, say where you mark (ingress at the trust boundary) and where you queue (egress of every slow link, both directions, backup circuit included). Mention the provider mapping, the 33 percent priority rule, and that you will verify with counters and test traffic before closing the change.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>One QoS language everywhere: same classes, same DSCP, same names.</li><li>Eight classes are enough: EF, AF41, CS3, CS6, AF21, AF11, CS1, default.</li><li>Mark inbound at the trust boundary; queue outbound at every bottleneck.</li><li>Map your DSCP to the provider classes at the edge; verify the mark survives.</li><li>Apply the policy to both directions and to the backup circuit.</li></ul></div>`,hi:`<h3>Rule: ek baar mark karo, andar sab par bharosa karo, har bottleneck par queue lagao</h3>
<p>Ek call kai devices se guzarti hai: phone, access switch, branch router, provider cloud, head-office router, server. Agar har device apni khud ki markings banaye to ek jagah EF mark hua packet agli jagah best effort ki tarah treat ho sakta hai. Isliye achha design har jagah <b>ek hi QoS bhasha</b> use karta hai: wahi classes, wahi DSCP values, wahi naam. Teen steps har path par dohrate hain.</p>
<ol><li>Edge par <b>classify aur mark</b> karo, jahan traffic us network mein aata hai jo aap control karte ho (trust boundary).</li>
<li>Andar <b>mark par bharosa</b> karo; har <b>bottleneck</b> par DSCP se queue lagao, yaani har woh link jo us se slow hai jitna aa sakta hai.</li>
<li><b>Verify</b> karo ki mark provider aur return path se bach kar nikalti hai.</li></ol>
<h3>Aath-class model</h3>
<p>Bahut se designs isliye fail hote hain kyunki woh bees classes banate hain. Aath classes lagbhag har enterprise ko cover karti hain.</p>
<table class="cmp"><tr><th>Class</th><th>DSCP</th><th>Aam traffic</th><th>Queue treatment (10 Mbps circuit)</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>RTP voice bearer</td><td>priority 1000 kbps (10 percent)</td></tr>
<tr><td>Interactive video</td><td>AF41 (34)</td><td>meetings, video conference</td><td>bandwidth 3000 kbps (30 percent)</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>SIP, Skinny</td><td>bandwidth 300 kbps</td></tr>
<tr><td>Network control</td><td>CS6 (48)</td><td>routing protocols, keepalives</td><td>bandwidth 5 percent</td></tr>
<tr><td>Critical data</td><td>AF21 (18)</td><td>ERP, CRM, databases</td><td>bandwidth 20 percent, WRED</td></tr>
<tr><td>Bulk data</td><td>AF11 (10)</td><td>backups, file copy</td><td>bandwidth 5 percent, policed ya WRED</td></tr>
<tr><td>Scavenger</td><td>CS1 (8)</td><td>updates, streaming media, non-business</td><td>best effort se chhoti, police ho sakti hai</td></tr>
<tr><td>Best effort</td><td>default (0)</td><td>baaki sab</td><td>class-default, fair-queue</td></tr></table>
<p>Labs pehli teen classes plus bulk aur class-default use karte hain, kyunki call quality wahin tay hoti hai. Network control (CS6) router khud mark karta hai aur real platforms par default se protected hota hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Path par mark aur queue kahan hote hain">
<rect x="20" y="40" width="90" height="50" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">Phone / PC</text>
<rect x="150" y="40" width="90" height="50" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="195" y="70" text-anchor="middle" class="svg-ink" font-size="12">Access SW</text>
<rect x="280" y="40" width="100" height="50" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="330" y="70" text-anchor="middle" class="svg-ink" font-size="12">Branch router</text>
<rect x="420" y="40" width="80" height="50" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="460" y="70" text-anchor="middle" class="svg-ink" font-size="12">Provider</text>
<rect x="540" y="40" width="80" height="50" rx="6" fill="#fde68a" stroke="#64748b"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">Hub router</text>
<line x1="110" y1="65" x2="150" y2="65" stroke="#64748b" stroke-width="2"/><line x1="240" y1="65" x2="280" y2="65" stroke="#64748b" stroke-width="2"/><line x1="380" y1="65" x2="420" y2="65" stroke="#64748b" stroke-width="2"/><line x1="500" y1="65" x2="540" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="195" y="125" text-anchor="middle" class="svg-accent" font-size="12">1 trust boundary</text>
<text x="330" y="125" text-anchor="middle" class="svg-accent" font-size="12">2 mark IN, queue OUT</text>
<text x="460" y="125" text-anchor="middle" class="svg-accent" font-size="12">3 DSCP maano</text>
<text x="580" y="125" text-anchor="middle" class="svg-accent" font-size="12">4 wahi policy</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Return path ko bhi wahi chaar steps chahiye: QoS har direction ke liye alag hai</text></svg><p class="cap">Chaar jagah jahan design tay hota hai: trust boundary, branch edge, provider, hub.</p></div>
<h3>Pehle campus, phir WAN</h3>
<p>Campus ke andar links tez hain aur congestion kam hoti hai, isliye campus policy zyadatar <b>marking aur trust</b> hai, uplinks par simple queues ke saath. WAN edge par queues sach mein banti hain, kyunki 1 Gbps LAN 10 Mbps circuit se milta hai. Isliye lab marking policy ko <b>LAN interface par inbound</b> aur queueing policy ko <b>WAN interface par outbound</b> rakhta hai.</p>
<h3>Provider ko paar karna</h3>
<p>MPLS ya managed WAN wale provider ki apni classes hoti hain. Aam contracts teen ya chaar classes dete hain (real-time, business, best effort). Contract padho, phir customer edge par <b>apna DSCP unke DSCP se map</b> karo. Quality lab mein provider apni real-time class ke liye CS5 maanta hai aur baaki markings badal deta hai, isliye customer edge nikalte waqt voice par <code>set dscp cs5</code> lagata hai, priority queue ka faisla hone ke baad. Yaad rakho ki agar aap contract se match nahi karte to provider apne ingress par DSCP ko 0 bhi kar sakta hai, jo "QoS lab mein chalta hai aur WAN par nahi" ka sabse aam karan hai. MPLS core ke andar DSCP 3-bit MPLS traffic class field mein copy ya map hota hai (EF aam taur par 5, AF41 4, CS3 3), aur provider uniform ya pipe mode chalaye to egress par original DSCP wapas aa jaata hai.</p>
<h3>Dono direction, har circuit</h3>
<p>QoS har interface aur har direction ke liye alag lagta hai. R-PUN par policy sirf Pune se Mumbai ko bachati hai. Mumbai se Pune ko wahi policy R-MUM par chahiye, warna return voice head-end router mein backup ke peeche queue hoti hai aur user ek taraf ki bigdi hui quality sunta hai. Isi tarah backup circuit ko bhi policy chahiye, kyunki failover ke baad woh poora load uthata hai (lab mq-voice-video-backup). Tunnels par sochna padta hai: aksar routers par outer header inner ka DSCP copy kar leta hai, isliye WAN policy use dekh sakti hai, lekin encrypted tunnel inner ports ko classification se chhupa deta hai, isliye WAN par port se nahi, DSCP se classify karo.</p>
<div class="eg"><p><b>Worked example: Zenith Logistics.</b> LAN edge (inbound, Gi0/1): VOICE (UDP 16384-32767) EF, VIDEO (UDP 5004-5005) AF41, SIGNALLING (SIP) CS3, BULK (TCP 445) AF11, baaki sab default. WAN edge (outbound, Gi0/0): EF priority 1000, AF41 bandwidth 3000, CS3 bandwidth 300, class-default fair-queue. Wahi do policies, wahi naamon ke saath, R-MUM, R-PUN aur R-DEL par chalti hain.</p></div>
<pre class="code"><span class="c">! LAN edge: classify, mark, baaki ko default re-mark (untrusted)</span>
policy-map MARK-IN
 class VOICE
  set dscp ef
 class VIDEO
  set dscp af41
 class SIGNALLING
  set dscp cs3
 class BULK
  set dscp af11
 class class-default
  set dscp default
<span class="c">! WAN edge: edge par likhe DSCP se queue lagao</span>
policy-map WAN-OUT
 class EF-Q
  priority 1000
 class AF41-Q
  bandwidth 3000
 class CS3-Q
  bandwidth 300
 class class-default
  fair-queue</pre>
<div class="note"><p><b>Junos note.</b> Wahi design Junos CoS mein: multifield classifier (firewall filter jisme <code>forwarding-class</code> aur <code>loss-priority</code> actions hon) edge par mark karta hai, voice forwarding class ke liye <code>priority strict-high</code> aur baaki ke liye <code>transmit-rate</code> wala scheduler map <code>set class-of-service interfaces ge-0/0/0 scheduler-map WAN-MAP</code> ke neeche lagta hai, aur rewrite rule egress par DSCP set karta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> User ports se aane wale DSCP par bharosa karna. PC sab kuch EF mark karke priority queue le sakta hai. Trust boundary par re-mark karo, sirf verified phone par trust karo, aur class-default se baaki ko 0 re-mark karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Priority queue link ka lagbhag ek tihai (33 percent) se zyada nahi honi chahiye, aur saari guaranteed classes ka jod lagbhag 75 percent, taaki routing protocols aur best effort ke liye jagah bache. 60 percent priority wala design galat hai chaahe router use accept kar le.</p></div>
<div class="scn"><h4>Scenario: QoS sirf ek taraf chala</h4><p>Pune rollout ke baad branch ne Mumbai ki perfect calls batayi, lekin shaam ke backup ke dauran Mumbai users ne Pune se stutter suna. R-PUN par policy thi; R-MUM, jo doosri team ne deploy kiya, par nahi thi. Engineer ne dono policies R-MUM par copy ki aur wahi naam change record mein jode taaki agli site bhoole nahi.</p><p><b>Lesson:</b> Ek direction ki policy aadha design hai. Dono ends aur dono circuits check karo.</p></div>
<div class="iv"><p class="q">"Teen-site WAN par voice, video aur data ke liye QoS design karo."</p><p>Classes aur DSCP values se shuru karo, batao kahan mark karte ho (trust boundary par ingress) aur kahan queue (har slow link ka egress, dono direction, backup circuit sahit). Provider mapping, 33 percent priority rule ka zikr karo, aur kaho ki change band karne se pehle counters aur test traffic se verify karoge.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Har jagah ek QoS bhasha: wahi classes, wahi DSCP, wahi naam.</li><li>Aath classes kaafi hain: EF, AF41, CS3, CS6, AF21, AF11, CS1, default.</li><li>Trust boundary par inbound mark karo; har bottleneck par outbound queue lagao.</li><li>Edge par apna DSCP provider classes se map karo; verify karo ki mark bachti hai.</li><li>Policy dono directions aur backup circuit par lagao.</li></ul></div>`}};export{e as default};