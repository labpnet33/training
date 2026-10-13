var e={id:`asp-drop`,h:{en:`Drop counters: show asp drop and hit counters`,hi:`Drop counters: show asp drop aur hit counters`},body:{en:`
<p>At the end of a shift, the airport security desk does not list every passenger it refused. It keeps a <b>tally sheet</b>: 41 refused for liquids, 3 for expired passports, 1 for a prohibited item. The tally does not tell you who, but it tells you instantly <b>why</b> people are being turned away and whether that number is growing right now. <code>show asp drop</code> is the ASA's tally sheet. Every packet the data plane discards increments a counter named after the reason.</p>

<h3>Reading show asp drop</h3>
<pre class="out">NK-ASA# show asp drop

Frame drop:
  No route to host (no-route)                                                  9
  Reverse-path verify failed (rpf-violated)                                    3
  <span class="hl">Flow is denied by configured rule (acl-drop)                               418</span>
  First TCP packet not SYN (tcp-not-syn)                                      37
  Slowpath security checks failed (sp-security-failed)                        12
  NAT reverse path failed (nat-rpf-failed)                                     6
  No valid adjacency (no-adjacency)                                            4
  Interface is down (interface-down)                                           1

Last clearing: 09:12:03 UTC Sep 30 2026 by enable_15

Flow drop:
  NAT failed (nat-failed)                                                      2

Last clearing: 09:12:03 UTC Sep 30 2026 by enable_15</pre>
<p>There are two sections. <b>Frame drops</b> are individual packets discarded. <b>Flow drops</b> are whole connections torn down or refused. Each line shows a readable description, the <b>reason code</b> in brackets, and the count since the last clearing. Only reasons with a non-zero count are listed.</p>

<h3>Where each reason happens</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Drop reasons along the packet flow">
<rect x="10" y="30" width="95" height="40" rx="6" fill="#e2e8f0"/><text x="57" y="55" text-anchor="middle" class="svg-ink" font-size="12">Ingress</text>
<rect x="115" y="30" width="95" height="40" rx="6" fill="#bae6fd"/><text x="162" y="55" text-anchor="middle" class="svg-ink" font-size="12">Conn lookup</text>
<rect x="220" y="30" width="95" height="40" rx="6" fill="#ddd6fe"/><text x="267" y="55" text-anchor="middle" class="svg-ink" font-size="12">UN-NAT, route</text>
<rect x="325" y="30" width="95" height="40" rx="6" fill="#fed7aa"/><text x="372" y="55" text-anchor="middle" class="svg-ink" font-size="12">ACL</text>
<rect x="430" y="30" width="95" height="40" rx="6" fill="#ddd6fe"/><text x="477" y="55" text-anchor="middle" class="svg-ink" font-size="12">NAT</text>
<rect x="535" y="30" width="95" height="40" rx="6" fill="#e2e8f0"/><text x="582" y="55" text-anchor="middle" class="svg-ink" font-size="12">Egress</text>
<line x1="105" y1="50" x2="115" y2="50" stroke="#64748b" stroke-width="2"/><line x1="210" y1="50" x2="220" y2="50" stroke="#64748b" stroke-width="2"/><line x1="315" y1="50" x2="325" y2="50" stroke="#64748b" stroke-width="2"/><line x1="420" y1="50" x2="430" y2="50" stroke="#64748b" stroke-width="2"/><line x1="525" y1="50" x2="535" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="57" y="100" text-anchor="middle" class="svg-accent" font-size="12">interface-down</text>
<text x="162" y="100" text-anchor="middle" class="svg-accent" font-size="12">tcp-not-syn</text>
<text x="162" y="118" text-anchor="middle" class="svg-accent" font-size="12">tcp-seq-past-win</text>
<text x="267" y="100" text-anchor="middle" class="svg-accent" font-size="12">no-route</text>
<text x="267" y="118" text-anchor="middle" class="svg-accent" font-size="12">rpf-violated</text>
<text x="267" y="136" text-anchor="middle" class="svg-accent" font-size="12">sp-security-failed</text>
<text x="372" y="100" text-anchor="middle" class="svg-accent" font-size="12">acl-drop</text>
<text x="477" y="100" text-anchor="middle" class="svg-accent" font-size="12">nat-rpf-failed</text>
<text x="477" y="118" text-anchor="middle" class="svg-accent" font-size="12">nat-failed</text>
<text x="582" y="100" text-anchor="middle" class="svg-accent" font-size="12">no-adjacency</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">A reason code points to the step of the packet flow that refused the packet</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Pair the counter with a syslog ID and an asp-drop capture to see which packets</text>
</svg><p class="cap">The most common drop reasons placed on the packet flow from chapter 2.</p></div>

<table class="cmp"><tr><th>Reason code</th><th>Typical cause</th><th>Matching evidence</th></tr>
<tr><td><code>acl-drop</code></td><td>An ACE or the implicit deny refused a new flow.</td><td>Syslog 106023; packet-tracer ACCESS-LIST DROP.</td></tr>
<tr><td><code>tcp-not-syn</code></td><td>A non-SYN TCP packet with no connection: asymmetric routing, a connection cleared or timed out, a failover without state.</td><td>Syslog 106015 "Deny TCP (no connection)".</td></tr>
<tr><td><code>rpf-violated</code></td><td>Unicast RPF (<code>ip verify reverse-path interface</code>) failed: spoofed source or asymmetric path.</td><td>Syslog 106021.</td></tr>
<tr><td><code>nat-rpf-failed</code></td><td>Return traffic matches a different NAT rule than the forward flow: overlapping rules.</td><td>Syslog 305013.</td></tr>
<tr><td><code>no-route</code></td><td>No route to the destination.</td><td><code>show route</code>; packet-tracer ROUTE-LOOKUP DROP.</td></tr>
<tr><td><code>no-adjacency</code></td><td>Next hop does not answer ARP.</td><td><code>show arp</code>.</td></tr>
<tr><td><code>sp-security-failed</code></td><td>Slow-path sanity checks, for example traffic that would leave the interface it entered without <code>same-security-traffic permit intra-interface</code>.</td><td>packet-tracer; the traffic design.</td></tr>
<tr><td><code>tcp-seq-past-win</code></td><td>TCP sequence numbers outside the expected window: often asymmetric paths or broken middleboxes.</td><td>Captures on both sides.</td></tr></table>

<h3>The delta method</h3>
<p>Counters are global and cumulative. A big number might be from last month. The professional way is to compare <b>before and after</b> reproducing the problem:</p>
<pre class="code"><span class="c">! 1. snapshot (or clear, if your change process allows it)</span>
show asp drop
clear asp drop
<span class="c">! 2. ask the user to retry once</span>
<span class="c">! 3. look again: which counter moved?</span>
show asp drop
<span class="c">! 4. see WHICH packets, for that reason only</span>
capture ACLDROP type asp-drop acl-drop
show capture ACLDROP
no capture ACLDROP</pre>

<h3>Policy hit counters</h3>
<p>The ASA also counts successes. <code>show access-list</code> shows a <code>hitcnt</code> for every ACE, expanded to real addresses when objects are used; <code>show nat</code> shows translate and untranslate hits per rule.</p>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 2 elements; name hash: 0xd54a0c42
access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=0) 0x83dae885
  access-list OUTSIDE_IN line 1 extended permit tcp any host 10.0.2.10 eq www (hitcnt=0) 0x83dae885
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB eq h&#116;tps <span class="hl">(hitcnt=2)</span> 0xfb78b863
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq h&#116;tps (hitcnt=2) 0xfb78b863</pre>
<p>A hit counter that does not move while the user retries tells you the flow never reached that line: it matched an earlier line, arrived on another interface, or rode an existing connection. Remember that the implicit deny at the end of every ACL has no counter here; its drops show up as <code>acl-drop</code> and syslog 106023.</p>

<div class="eg"><p><b>Worked example.</b> Users report intermittent resets to an internal app after a routing change. Snapshot: <code>tcp-not-syn</code> is 37. The user retries three times; the counter is now 58, while <code>acl-drop</code> did not change. Syslog shows many 106015 "Deny TCP (no connection)" messages with flags ACK from the app servers. The return path now bypasses the ASA for SYN-ACKs and comes back through it only for later packets. The fix is to restore symmetric routing, not to touch any ACL.</p></div>

<div class="warn"><p><b>Common mistake.</b> Seeing a large <code>acl-drop</code> count and assuming it is your user. On an internet edge, background scanning produces thousands of ACL drops per hour. Only the <b>change</b> in the counter while the user retries, or an asp-drop capture filtered on the flow, connects it to your ticket.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show asp drop</code> gives counts per reason, never addresses. To see addresses, use <code>capture NAME type asp-drop</code> or syslog. And <code>tcp-not-syn</code> is the classic sign of asymmetric routing through a stateful firewall.</p></div>

<div class="scn"><h4>The second ISP link</h4><p>A company added a second ISP on a router in front of the ASA and enabled load sharing. Web browsing became slow and some sites failed. <code>show asp drop</code> showed <code>tcp-not-syn</code> climbing by hundreds per minute, and syslog was full of 106015. Replies for some flows were coming back through a path that reached a different firewall interface than the one the SYN left. The team removed per-packet load sharing, kept each flow on one path, and the counter stopped moving.</p><p><b>Lesson:</b> stateful firewalls need both directions of a flow to pass through them. When <code>tcp-not-syn</code> climbs, draw the return path.</p></div>

<div class="iv"><p class="q">"What is show asp drop and how do you use it on a ticket?"</p><p>It shows counters of packets and flows discarded by the ASA data plane (the Accelerated Security Path), per reason code, split into frame and flow drops. On a ticket you take a snapshot or clear it, reproduce the problem, and see which counter moved. Then you confirm with an asp-drop capture for that reason and the matching syslog ID. Name a few codes: acl-drop, tcp-not-syn, rpf-violated, nat-rpf-failed, no-route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show asp drop</code>: frame and flow drops, per reason code, since last clearing.</li>
<li>Use deltas: snapshot, reproduce, compare.</li>
<li>acl-drop = policy; tcp-not-syn = asymmetric routing or lost state; rpf-violated = uRPF; nat-rpf-failed = conflicting NAT.</li>
<li>Counters have no addresses; use an asp-drop capture or syslog for who.</li>
<li><code>show access-list</code> hitcnt and <code>show nat</code> hits prove which rules traffic uses.</li>
</ul></div>
`,hi:`
<p>Shift ke end mein airport security desk har us passenger ki list nahi banata jise usne roka. Woh ek <b>tally sheet</b> rakhta hai: liquids ki wajah se 41 roke gaye, expired passports ki wajah se 3, ek prohibited item ki wajah se 1. Tally yeh nahi batati ki kaun, par turant batati hai ki logon ko <b>kyun</b> lautaya jaa raha hai aur kya woh number abhi badh raha hai. <code>show asp drop</code> ASA ki tally sheet hai. Data plane jo bhi packet discard karta hai, woh reason ke naam wale counter ko badhata hai.</p>

<h3>show asp drop padhna</h3>
<pre class="out">NK-ASA# show asp drop

Frame drop:
  No route to host (no-route)                                                  9
  Reverse-path verify failed (rpf-violated)                                    3
  <span class="hl">Flow is denied by configured rule (acl-drop)                               418</span>
  First TCP packet not SYN (tcp-not-syn)                                      37
  Slowpath security checks failed (sp-security-failed)                        12
  NAT reverse path failed (nat-rpf-failed)                                     6
  No valid adjacency (no-adjacency)                                            4
  Interface is down (interface-down)                                           1

Last clearing: 09:12:03 UTC Sep 30 2026 by enable_15

Flow drop:
  NAT failed (nat-failed)                                                      2

Last clearing: 09:12:03 UTC Sep 30 2026 by enable_15</pre>
<p>Do sections hain. <b>Frame drops</b> discard hue individual packets hain. <b>Flow drops</b> poore connections hain jo tode gaye ya mana kiye gaye. Har line ek padhne layak description, brackets mein <b>reason code</b>, aur last clearing ke baad ka count dikhati hai. Sirf non-zero count wale reasons list hote hain.</p>

<h3>Har reason kahan hota hai</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Drop reasons along the packet flow">
<rect x="10" y="30" width="95" height="40" rx="6" fill="#e2e8f0"/><text x="57" y="55" text-anchor="middle" class="svg-ink" font-size="12">Ingress</text>
<rect x="115" y="30" width="95" height="40" rx="6" fill="#bae6fd"/><text x="162" y="55" text-anchor="middle" class="svg-ink" font-size="12">Conn lookup</text>
<rect x="220" y="30" width="95" height="40" rx="6" fill="#ddd6fe"/><text x="267" y="55" text-anchor="middle" class="svg-ink" font-size="12">UN-NAT, route</text>
<rect x="325" y="30" width="95" height="40" rx="6" fill="#fed7aa"/><text x="372" y="55" text-anchor="middle" class="svg-ink" font-size="12">ACL</text>
<rect x="430" y="30" width="95" height="40" rx="6" fill="#ddd6fe"/><text x="477" y="55" text-anchor="middle" class="svg-ink" font-size="12">NAT</text>
<rect x="535" y="30" width="95" height="40" rx="6" fill="#e2e8f0"/><text x="582" y="55" text-anchor="middle" class="svg-ink" font-size="12">Egress</text>
<line x1="105" y1="50" x2="115" y2="50" stroke="#64748b" stroke-width="2"/><line x1="210" y1="50" x2="220" y2="50" stroke="#64748b" stroke-width="2"/><line x1="315" y1="50" x2="325" y2="50" stroke="#64748b" stroke-width="2"/><line x1="420" y1="50" x2="430" y2="50" stroke="#64748b" stroke-width="2"/><line x1="525" y1="50" x2="535" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="57" y="100" text-anchor="middle" class="svg-accent" font-size="12">interface-down</text>
<text x="162" y="100" text-anchor="middle" class="svg-accent" font-size="12">tcp-not-syn</text>
<text x="162" y="118" text-anchor="middle" class="svg-accent" font-size="12">tcp-seq-past-win</text>
<text x="267" y="100" text-anchor="middle" class="svg-accent" font-size="12">no-route</text>
<text x="267" y="118" text-anchor="middle" class="svg-accent" font-size="12">rpf-violated</text>
<text x="267" y="136" text-anchor="middle" class="svg-accent" font-size="12">sp-security-failed</text>
<text x="372" y="100" text-anchor="middle" class="svg-accent" font-size="12">acl-drop</text>
<text x="477" y="100" text-anchor="middle" class="svg-accent" font-size="12">nat-rpf-failed</text>
<text x="477" y="118" text-anchor="middle" class="svg-accent" font-size="12">nat-failed</text>
<text x="582" y="100" text-anchor="middle" class="svg-accent" font-size="12">no-adjacency</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="12">Reason code packet flow ke us step ki taraf ishaara karta hai jisne packet mana kiya</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Kaunse packets, yeh dekhne ke liye counter ko syslog ID aur asp-drop capture se jodo</text>
</svg><p class="cap">Sabse common drop reasons chapter 2 ke packet flow par rakhe hue.</p></div>

<table class="cmp"><tr><th>Reason code</th><th>Typical wajah</th><th>Matching evidence</th></tr>
<tr><td><code>acl-drop</code></td><td>Kisi ACE ya implicit deny ne naya flow mana kiya.</td><td>Syslog 106023; packet-tracer ACCESS-LIST DROP.</td></tr>
<tr><td><code>tcp-not-syn</code></td><td>Bina connection ka non-SYN TCP packet: asymmetric routing, connection clear ya timeout hua, bina state ke failover.</td><td>Syslog 106015 "Deny TCP (no connection)".</td></tr>
<tr><td><code>rpf-violated</code></td><td>Unicast RPF (<code>ip verify reverse-path interface</code>) fail hua: spoofed source ya asymmetric path.</td><td>Syslog 106021.</td></tr>
<tr><td><code>nat-rpf-failed</code></td><td>Return traffic forward flow se alag NAT rule se match karta hai: overlapping rules.</td><td>Syslog 305013.</td></tr>
<tr><td><code>no-route</code></td><td>Destination tak koi route nahi.</td><td><code>show route</code>; packet-tracer ROUTE-LOOKUP DROP.</td></tr>
<tr><td><code>no-adjacency</code></td><td>Next hop ARP ka jawab nahi deta.</td><td><code>show arp</code>.</td></tr>
<tr><td><code>sp-security-failed</code></td><td>Slow-path sanity checks, jaise woh traffic jo <code>same-security-traffic permit intra-interface</code> ke bina usi interface se nikalta jisse aaya.</td><td>packet-tracer; traffic design.</td></tr>
<tr><td><code>tcp-seq-past-win</code></td><td>Expected window se bahar TCP sequence numbers: aksar asymmetric paths ya toote middleboxes.</td><td>Dono taraf captures.</td></tr></table>

<h3>Delta method</h3>
<p>Counters global aur cumulative hote hain. Bada number pichhle mahine ka ho sakta hai. Professional tareeka hai problem reproduce karne se <b>pehle aur baad</b> compare karna:</p>
<pre class="code"><span class="c">! 1. snapshot (ya clear, agar aapka change process allow kare)</span>
show asp drop
clear asp drop
<span class="c">! 2. user se ek baar retry karwao</span>
<span class="c">! 3. phir dekho: kaunsa counter hila?</span>
show asp drop
<span class="c">! 4. KAUNSE packets, sirf us reason ke liye</span>
capture ACLDROP type asp-drop acl-drop
show capture ACLDROP
no capture ACLDROP</pre>

<h3>Policy hit counters</h3>
<p>ASA successes bhi ginta hai. <code>show access-list</code> har ACE ka <code>hitcnt</code> dikhata hai, objects use hone par real addresses mein expand karke; <code>show nat</code> har rule ke translate aur untranslate hits dikhata hai.</p>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 2 elements; name hash: 0xd54a0c42
access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=0) 0x83dae885
  access-list OUTSIDE_IN line 1 extended permit tcp any host 10.0.2.10 eq www (hitcnt=0) 0x83dae885
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB eq h&#116;tps <span class="hl">(hitcnt=2)</span> 0xfb78b863
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq h&#116;tps (hitcnt=2) 0xfb78b863</pre>
<p>User ke retry karte waqt jo hit counter nahi hilta, woh batata hai ki flow us line tak kabhi pahuncha hi nahi: woh pehle ki line se match hua, doosre interface par aaya, ya existing connection par sawaar tha. Yaad rakho ki har ACL ke end ke implicit deny ka yahan koi counter nahi; uske drops <code>acl-drop</code> aur syslog 106023 mein dikhte hain.</p>

<div class="eg"><p><b>Worked example.</b> Routing change ke baad users ek internal app par beech beech mein resets report karte hain. Snapshot: <code>tcp-not-syn</code> 37 hai. User teen baar retry karta hai; counter ab 58 hai, jabki <code>acl-drop</code> nahi badla. Syslog app servers se flags ACK ke saath kai 106015 "Deny TCP (no connection)" messages dikhata hai. Return path ab SYN-ACKs ke liye ASA ko bypass karta hai aur sirf baad ke packets ke liye usse wapas aata hai. Fix symmetric routing wapas laana hai, kisi ACL ko chhoona nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Bada <code>acl-drop</code> count dekh kar maan lena ki yeh aapka user hai. Internet edge par background scanning har ghante hazaaron ACL drops paida karti hai. Sirf user ke retry ke dauran counter ka <b>badlaav</b>, ya flow par filtered asp-drop capture, use aapke ticket se jodta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show asp drop</code> har reason ke counts deta hai, kabhi addresses nahi. Addresses dekhne ke liye <code>capture NAME type asp-drop</code> ya syslog use karo. Aur <code>tcp-not-syn</code> stateful firewall ke through asymmetric routing ka classic sign hai.</p></div>

<div class="scn"><h4>Doosra ISP link</h4><p>Ek company ne ASA ke saamne ek router par doosra ISP joda aur load sharing enable ki. Web browsing slow ho gayi aur kuch sites fail hone lagi. <code>show asp drop</code> ne <code>tcp-not-syn</code> ko har minute saikdon se badhta dikhaya, aur syslog 106015 se bhara tha. Kuch flows ke replies aise path se wapas aa rahe the jo firewall ke us interface se alag interface par pahunchta tha jisse SYN nikla tha. Team ne per-packet load sharing hatayi, har flow ko ek path par rakha, aur counter ruk gaya.</p><p><b>Seekh:</b> stateful firewalls ko flow ki dono directions apne through chahiye. Jab <code>tcp-not-syn</code> badhe, return path draw karo.</p></div>

<div class="iv"><p class="q">"show asp drop kya hai aur ticket par aap ise kaise use karte ho?"</p><p>Yeh ASA data plane (Accelerated Security Path) dwara discard kiye gaye packets aur flows ke counters dikhata hai, har reason code ke hisaab se, frame aur flow drops mein baanta hua. Ticket par aap snapshot lete ho ya clear karte ho, problem reproduce karte ho, aur dekhte ho kaunsa counter hila. Phir us reason ke asp-drop capture aur matching syslog ID se confirm karte ho. Kuch codes naam lo: acl-drop, tcp-not-syn, rpf-violated, nat-rpf-failed, no-route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show asp drop</code>: last clearing ke baad se, har reason code ke frame aur flow drops.</li>
<li>Deltas use karo: snapshot, reproduce, compare.</li>
<li>acl-drop = policy; tcp-not-syn = asymmetric routing ya khoya state; rpf-violated = uRPF; nat-rpf-failed = conflicting NAT.</li>
<li>Counters mein addresses nahi hote; kaun, yeh jaanne ke liye asp-drop capture ya syslog use karo.</li>
<li><code>show access-list</code> hitcnt aur <code>show nat</code> hits saabit karte hain ki traffic kaunse rules use karta hai.</li>
</ul></div>
`}};export{e as default};