var e={id:`workflow-labs`,h:{en:`A structured troubleshooting workflow, walked through both labs`,hi:`Ek structured troubleshooting workflow, dono labs ke saath`},body:{en:`
<p>A good doctor does not prescribe medicine the moment a patient says "it hurts". She asks where, since when, and how much; she takes the temperature; she orders one test; she reads the result; only then does she treat, and she books a follow-up. Firewall troubleshooting is the same discipline. In this chapter the four questions from chapter 1 become an eight-step workflow, and then we walk it end to end through both labs of this module with the exact commands and output.</p>

<h3>The eight-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Eight-step workflow">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">1 Define flow</text><text x="80" y="60" text-anchor="middle" class="svg-muted" font-size="12">src, dst, port</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">2 Capture in</text><text x="240" y="60" text-anchor="middle" class="svg-muted" font-size="12">did it arrive?</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">3 packet-tracer</text><text x="400" y="60" text-anchor="middle" class="svg-muted" font-size="12">which phase?</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">4 Live state</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">conn, xlate, nat</text>
<rect x="490" y="140" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="162" text-anchor="middle" class="svg-ink" font-size="13">5 Logs</text><text x="560" y="180" text-anchor="middle" class="svg-muted" font-size="12">syslog, asp drop</text>
<rect x="330" y="140" width="140" height="50" rx="8" fill="#bae6fd"/><text x="400" y="162" text-anchor="middle" class="svg-ink" font-size="13">6 Capture out</text><text x="400" y="180" text-anchor="middle" class="svg-muted" font-size="12">left? replied?</text>
<rect x="170" y="140" width="140" height="50" rx="8" fill="#fed7aa"/><text x="240" y="162" text-anchor="middle" class="svg-ink" font-size="13">7 One change</text><text x="240" y="180" text-anchor="middle" class="svg-muted" font-size="12">smallest fix</text>
<rect x="10" y="140" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="162" text-anchor="middle" class="svg-ink" font-size="13">8 Verify, clean</text><text x="80" y="180" text-anchor="middle" class="svg-muted" font-size="12">no capture, notes</text>
<line x1="150" y1="45" x2="170" y2="45" stroke="#64748b" stroke-width="2"/><line x1="310" y1="45" x2="330" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="70" x2="560" y2="140" stroke="#64748b" stroke-width="2"/><line x1="490" y1="165" x2="470" y2="165" stroke="#64748b" stroke-width="2"/><line x1="330" y1="165" x2="310" y2="165" stroke="#64748b" stroke-width="2"/><line x1="170" y1="165" x2="150" y2="165" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-accent" font-size="12">After step 8, if it still fails, loop back to step 2 with the new evidence</text>
</svg><p class="cap">Evidence first, one change, then verify. Every fault found sends you round the loop again.</p></div>
<ol>
<li><b>Define the flow</b>: source, destination (the address the client really uses), protocol and port.</li>
<li><b>Capture on the ingress interface</b>: zero packets means the problem is before the ASA.</li>
<li><b>packet-tracer</b> with the same five-tuple: find the phase that says DROP.</li>
<li><b>Live state</b>: <code>show nat</code>, <code>show xlate</code>, <code>show conn</code>, <code>show access-list</code> counters.</li>
<li><b>Logs</b>: <code>show logging</code> and <code>show asp drop</code> for what really happened.</li>
<li><b>Capture on the egress interface</b>: did the packet leave, translated correctly, and did the server reply?</li>
<li><b>Make the smallest change</b> that the evidence supports.</li>
<li><b>Verify, clean up and document</b>: retest, remove captures, write what you found.</li>
</ol>

<h3>Lab 1: NOC ticket INC-7788, the partner portal is unreachable</h3>
<p><b>Step 1.</b> Flow: PARTNER 198.51.100.10 to 203.0.113.3 on TCP 443; the portal runs on WEB 10.0.2.10 in the dmz. <b>Step 2.</b> Capture on outside while the partner retries the portal over HTTPS.</p>
<pre class="code">capture CAP interface outside match tcp any host 203.0.113.3
show capture CAP</pre>
<pre class="out"><span class="hl">3 packets captured</span>
   1: 10:14:02.118204  198.51.100.10.40112 &gt; 203.0.113.3.443: S 2771546913:2771546913(0) win 64240
   2: 10:14:03.121880  198.51.100.10.40112 &gt; 203.0.113.3.443: S 2771546913:2771546913(0) win 64240
   3: 10:14:05.137522  198.51.100.10.40112 &gt; 203.0.113.3.443: S 2771546913:2771546913(0) win 64240
3 packets shown</pre>
<p>Repeated SYNs, no answer: traffic arrives, so the ASA is involved. <b>Step 3.</b></p>
<pre class="code">packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443</pre>
<pre class="out">Phase: 1
Type: ROUTE-LOOKUP
Subtype: Resolve Egress Interface
Result: ALLOW
Additional Information:
<span class="hl">found next-hop 203.0.113.3 using egress ifc  outside</span>

Phase: 2
Type: ACCESS-LIST
Result: DROP
Config:
Implicit Rule
...
Action: drop
Drop-reason: (acl-drop) Flow is denied by configured rule</pre>
<p>The key clue is what is <b>missing</b>: there is no UN-NAT phase, so no rule owns 203.0.113.3 and the egress interface is outside itself. <b>Step 4.</b></p>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
<span class="hl">1 (dmz) to (outside) source static WEB 203.0.113.5</span>
    translate_hits = 0, untranslate_hits = 0
2 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 14, untranslate_hits = 0</pre>
<p>WEB is published on 203.0.113.5, but DNS says 203.0.113.3. <b>Step 7</b>, the smallest fix: <code>object network WEB</code> then <code>nat (dmz,outside) static 203.0.113.3</code>; the new statement replaces the old one. Re-running packet-tracer now shows <code>UN-NAT ... Untranslate 203.0.113.3/443 to 10.0.2.10/443</code> and HTTP on port 80 is allowed, but 443 still ends at the Implicit Rule. Round the loop again: <b>step 5</b>.</p>
<pre class="out">NK-ASA# show logging
<span class="hl">%ASA-4-106023: Deny tcp src outside:198.51.100.10/40118 dst dmz:10.0.2.10/443 by access-group "OUTSIDE_IN" [0x0, 0x0]</span></pre>
<p>106023 names the ACL, and the destination is the <b>real</b> address because UN-NAT happened first. OUTSIDE_IN only permits <code>eq www</code>. Fix and verify:</p>
<pre class="code">configure terminal
access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
end
show logging
show conn address 10.0.2.10
no capture CAP</pre>
<pre class="out">%ASA-6-302013: Built inbound TCP connection 5121 for outside:198.51.100.10/40122 (198.51.100.10/40122) to dmz:10.0.2.10/443 (203.0.113.3/443)
<span class="hl">TCP outside  198.51.100.10:40122 dmz  10.0.2.10:443, idle 0:00:02, bytes 3874, flags UIO</span></pre>
<p>302013 shows both the real and mapped address, and UIO proves data in both directions. The capture is removed and the ticket notes list two faults: wrong static address and missing HTTPS permit.</p>
<div class="note"><p>In the lab the SYNs reach the ASA even before the fix. On a real network, if no NAT rule owns 203.0.113.3, the ASA also does not answer ARP for it, so the capture could stay empty; <code>show nat</code> would still reveal the same mismatch.</p></div>

<h3>Lab 2: prove NAT with captures on both sides</h3>
<pre class="code">capture CIN interface inside match icmp host 10.0.1.10 host 8.8.8.8
capture COUT interface outside match icmp any host 8.8.8.8
<span class="c">! ping 8.8.8.8 from PC1, then:</span>
show capture CIN
show capture COUT
show xlate
no capture CIN
no capture COUT</pre>
<pre class="out">NK-ASA# show capture CIN
   1: 11:02:10.412210  10.0.1.10 &gt; 8.8.8.8 icmp: echo request
   2: 11:02:10.414402  8.8.8.8 &gt; 10.0.1.10 icmp: echo reply
NK-ASA# show capture COUT
   <span class="hl">1: 11:02:10.413021  203.0.113.2 &gt; 8.8.8.8 icmp: echo request</span>
   2: 11:02:10.414318  8.8.8.8 &gt; 203.0.113.2 icmp: echo reply
NK-ASA# show xlate
ICMP PAT from inside:10.0.1.10/1 to outside:203.0.113.2/1 flags ri idle 0:00:01 timeout 0:00:30</pre>
<div class="eg"><p><b>Worked example.</b> Same echo request, two views, less than one millisecond apart (10.412 on inside, 10.413 on outside). Inside the source is 10.0.1.10; outside it is 203.0.113.2, the interface PAT address. The outside capture filter uses <code>any</code> as the source on purpose: after NAT the real address no longer exists on that wire. This is the auditor's evidence that 10.0.1.0/24 never leaves the building.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing two things at once, so you never know which fixed it. Stopping after the first fault when the ticket has two. Filtering the outside capture on the real inside address. Forgetting <code>no capture</code> at the end.</p></div>

<div class="exam"><p><b>Exam traps.</b> A packet-tracer with no UN-NAT phase for a published address means no NAT rule matched the destination. 106023 shows the real (untranslated) destination. Capture filters match both directions, so replies appear in the same capture.</p></div>

<div class="scn"><h4>Two faults, one ticket</h4><p>A retail chain's supplier portal failed after a firewall migration. The first engineer found the wrong static NAT address, fixed it, saw HTTP work and closed the ticket. The partner reopened it an hour later: the portal forced HTTPS. The second engineer ran the loop again, found 106023 for port 443 in <code>show logging</code>, added the permit and confirmed UIO in <code>show conn</code> before closing.</p><p><b>Lesson:</b> verify with the exact flow in the ticket, and go round the loop until that flow works.</p></div>

<div class="iv"><p class="q">"Walk me through how you would work a P1 'server unreachable through the ASA' ticket."</p><p>Give the loop: define the five-tuple, capture on ingress, packet-tracer to find the dropping phase, <code>show nat</code>/<code>show xlate</code>/<code>show conn</code>/ACL counters, syslog and <code>show asp drop</code>, capture on egress to see whether the server replies, one change, verify with the same flow, remove captures, document. Mention that one ticket can hide several faults.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Eight steps: define, capture in, packet-tracer, live state, logs, capture out, one change, verify and clean up.</li>
<li>A missing UN-NAT phase points straight at <code>show nat</code>.</li>
<li>106023 names the ACL and shows the real destination address.</li>
<li>Captures on both interfaces prove NAT: real address inside, mapped address outside.</li>
<li>Repeat the loop until the exact ticket flow works, then remove every capture.</li>
</ul></div>
`,hi:`
<p>Ek achhi doctor patient ke "dard ho raha hai" kehte hi dawai nahi likhti. Woh poochti hai kahan, kab se, aur kitna; temperature leti hai; ek test karwati hai; result padhti hai; tab jaakar ilaaj karti hai, aur follow-up book karti hai. Firewall troubleshooting bhi yahi discipline hai. Is chapter mein chapter 1 ke chaar sawaal ek aath-step workflow ban jaate hain, aur phir hum use is module ki dono labs mein shuru se aakhir tak exact commands aur output ke saath chalate hain.</p>

<h3>Aath-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Aath-step workflow">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">1 Flow define</text><text x="80" y="60" text-anchor="middle" class="svg-muted" font-size="12">src, dst, port</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">2 Capture in</text><text x="240" y="60" text-anchor="middle" class="svg-muted" font-size="12">kya aaya?</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">3 packet-tracer</text><text x="400" y="60" text-anchor="middle" class="svg-muted" font-size="12">kaunsa phase?</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">4 Live state</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">conn, xlate, nat</text>
<rect x="490" y="140" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="162" text-anchor="middle" class="svg-ink" font-size="13">5 Logs</text><text x="560" y="180" text-anchor="middle" class="svg-muted" font-size="12">syslog, asp drop</text>
<rect x="330" y="140" width="140" height="50" rx="8" fill="#bae6fd"/><text x="400" y="162" text-anchor="middle" class="svg-ink" font-size="13">6 Capture out</text><text x="400" y="180" text-anchor="middle" class="svg-muted" font-size="12">nikla? reply?</text>
<rect x="170" y="140" width="140" height="50" rx="8" fill="#fed7aa"/><text x="240" y="162" text-anchor="middle" class="svg-ink" font-size="13">7 Ek change</text><text x="240" y="180" text-anchor="middle" class="svg-muted" font-size="12">sabse chhota fix</text>
<rect x="10" y="140" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="162" text-anchor="middle" class="svg-ink" font-size="13">8 Verify, saaf</text><text x="80" y="180" text-anchor="middle" class="svg-muted" font-size="12">no capture, notes</text>
<line x1="150" y1="45" x2="170" y2="45" stroke="#64748b" stroke-width="2"/><line x1="310" y1="45" x2="330" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="70" x2="560" y2="140" stroke="#64748b" stroke-width="2"/><line x1="490" y1="165" x2="470" y2="165" stroke="#64748b" stroke-width="2"/><line x1="330" y1="165" x2="310" y2="165" stroke="#64748b" stroke-width="2"/><line x1="170" y1="165" x2="150" y2="165" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-accent" font-size="12">Step 8 ke baad bhi fail ho, to naye evidence ke saath step 2 par wapas jao</text>
</svg><p class="cap">Pehle evidence, ek change, phir verify. Har mila hua fault aapko loop mein dobara bhejta hai.</p></div>
<ol>
<li><b>Flow define karo</b>: source, destination (woh address jo client sach mein use karta hai), protocol aur port.</li>
<li><b>Ingress interface par capture</b>: zero packets matlab problem ASA se pehle hai.</li>
<li>Usi five-tuple ke saath <b>packet-tracer</b>: woh phase dhoondho jo DROP bolta hai.</li>
<li><b>Live state</b>: <code>show nat</code>, <code>show xlate</code>, <code>show conn</code>, <code>show access-list</code> counters.</li>
<li><b>Logs</b>: asal mein kya hua uske liye <code>show logging</code> aur <code>show asp drop</code>.</li>
<li><b>Egress interface par capture</b>: kya packet nikla, sahi translate hua, aur kya server ne reply kiya?</li>
<li>Evidence jitna support kare utna <b>sabse chhota change</b> karo.</li>
<li><b>Verify karo, saaf karo aur document karo</b>: retest, captures hatao, jo mila woh likho.</li>
</ol>

<h3>Lab 1: NOC ticket INC-7788, partner portal unreachable hai</h3>
<p><b>Step 1.</b> Flow: PARTNER 198.51.100.10 se 203.0.113.3 tak TCP 443; portal dmz mein WEB 10.0.2.10 par chalta hai. <b>Step 2.</b> Jab partner HTTPS par portal retry kare, tab outside par capture karo.</p>
<pre class="code">capture CAP interface outside match tcp any host 203.0.113.3
show capture CAP</pre>
<pre class="out"><span class="hl">3 packets captured</span>
   1: 10:14:02.118204  198.51.100.10.40112 &gt; 203.0.113.3.443: S 2771546913:2771546913(0) win 64240
   2: 10:14:03.121880  198.51.100.10.40112 &gt; 203.0.113.3.443: S 2771546913:2771546913(0) win 64240
   3: 10:14:05.137522  198.51.100.10.40112 &gt; 203.0.113.3.443: S 2771546913:2771546913(0) win 64240
3 packets shown</pre>
<p>Baar baar SYNs, koi jawab nahi: traffic aa raha hai, to ASA involved hai. <b>Step 3.</b></p>
<pre class="code">packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443</pre>
<pre class="out">Phase: 1
Type: ROUTE-LOOKUP
Subtype: Resolve Egress Interface
Result: ALLOW
Additional Information:
<span class="hl">found next-hop 203.0.113.3 using egress ifc  outside</span>

Phase: 2
Type: ACCESS-LIST
Result: DROP
Config:
Implicit Rule
...
Action: drop
Drop-reason: (acl-drop) Flow is denied by configured rule</pre>
<p>Asli clue woh hai jo <b>gayab</b> hai: koi UN-NAT phase nahi hai, yaani koi rule 203.0.113.3 ki maalik nahi aur egress interface khud outside hai. <b>Step 4.</b></p>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
<span class="hl">1 (dmz) to (outside) source static WEB 203.0.113.5</span>
    translate_hits = 0, untranslate_hits = 0
2 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 14, untranslate_hits = 0</pre>
<p>WEB 203.0.113.5 par publish hai, lekin DNS 203.0.113.3 batata hai. <b>Step 7</b>, sabse chhota fix: <code>object network WEB</code> phir <code>nat (dmz,outside) static 203.0.113.3</code>; naya statement purane ki jagah le leta hai. Ab packet-tracer dobara chalane par <code>UN-NAT ... Untranslate 203.0.113.3/443 to 10.0.2.10/443</code> dikhta hai aur port 80 par HTTP allow hota hai, lekin 443 ab bhi Implicit Rule par khatam hota hai. Loop mein dobara: <b>step 5</b>.</p>
<pre class="out">NK-ASA# show logging
<span class="hl">%ASA-4-106023: Deny tcp src outside:198.51.100.10/40118 dst dmz:10.0.2.10/443 by access-group "OUTSIDE_IN" [0x0, 0x0]</span></pre>
<p>106023 ACL ka naam batata hai, aur destination <b>real</b> address hai kyunki UN-NAT pehle ho chuka tha. OUTSIDE_IN sirf <code>eq www</code> permit karti hai. Fix aur verify:</p>
<pre class="code">configure terminal
access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
end
show logging
show conn address 10.0.2.10
no capture CAP</pre>
<pre class="out">%ASA-6-302013: Built inbound TCP connection 5121 for outside:198.51.100.10/40122 (198.51.100.10/40122) to dmz:10.0.2.10/443 (203.0.113.3/443)
<span class="hl">TCP outside  198.51.100.10:40122 dmz  10.0.2.10:443, idle 0:00:02, bytes 3874, flags UIO</span></pre>
<p>302013 real aur mapped dono address dikhata hai, aur UIO dono directions mein data saabit karta hai. Capture hata diya jaata hai aur ticket notes mein do faults likhe jaate hain: galat static address aur missing HTTPS permit.</p>
<div class="note"><p>Lab mein SYNs fix se pehle bhi ASA tak pahunchte hain. Real network par, agar koi NAT rule 203.0.113.3 ki maalik nahi hai, to ASA uske liye ARP ka jawab bhi nahi deta, isliye capture khaali reh sakta hai; <code>show nat</code> phir bhi wahi mismatch dikha deta.</p></div>

<h3>Lab 2: dono taraf captures se NAT saabit karo</h3>
<pre class="code">capture CIN interface inside match icmp host 10.0.1.10 host 8.8.8.8
capture COUT interface outside match icmp any host 8.8.8.8
<span class="c">! PC1 se 8.8.8.8 ping karo, phir:</span>
show capture CIN
show capture COUT
show xlate
no capture CIN
no capture COUT</pre>
<pre class="out">NK-ASA# show capture CIN
   1: 11:02:10.412210  10.0.1.10 &gt; 8.8.8.8 icmp: echo request
   2: 11:02:10.414402  8.8.8.8 &gt; 10.0.1.10 icmp: echo reply
NK-ASA# show capture COUT
   <span class="hl">1: 11:02:10.413021  203.0.113.2 &gt; 8.8.8.8 icmp: echo request</span>
   2: 11:02:10.414318  8.8.8.8 &gt; 203.0.113.2 icmp: echo reply
NK-ASA# show xlate
ICMP PAT from inside:10.0.1.10/1 to outside:203.0.113.2/1 flags ri idle 0:00:01 timeout 0:00:30</pre>
<div class="eg"><p><b>Worked example.</b> Wahi echo request, do views, ek millisecond se bhi kam ke antar par (inside par 10.412, outside par 10.413). Inside par source 10.0.1.10 hai; outside par 203.0.113.2, yaani interface PAT address. Outside capture filter jaan-boojhkar source mein <code>any</code> use karta hai: NAT ke baad real address us wire par exist hi nahi karta. Yahi auditor ke liye saboot hai ki 10.0.1.0/24 kabhi building se bahar nahi jaata.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek saath do cheezein badalna, jisse kabhi pata nahi chalta ki kisne fix kiya. Pehle fault ke baad ruk jaana jabki ticket mein do hain. Outside capture ko real inside address par filter karna. Aakhir mein <code>no capture</code> bhool jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Published address ke liye packet-tracer mein UN-NAT phase na ho to matlab koi NAT rule destination se match nahi hui. 106023 real (untranslated) destination dikhata hai. Capture filters dono directions match karte hain, isliye replies usi capture mein dikhte hain.</p></div>

<div class="scn"><h4>Do faults, ek ticket</h4><p>Ek retail chain ka supplier portal firewall migration ke baad fail ho gaya. Pehle engineer ne galat static NAT address dhoondha, theek kiya, HTTP chalta dekha aur ticket close kar diya. Partner ne ek ghante baad use reopen kiya: portal HTTPS force karta tha. Doosre engineer ne loop dobara chalaya, <code>show logging</code> mein port 443 ke liye 106023 paaya, permit joda aur close karne se pehle <code>show conn</code> mein UIO confirm kiya.</p><p><b>Seekh:</b> ticket ke exact flow se verify karo, aur tab tak loop ghumao jab tak woh flow na chale.</p></div>

<div class="iv"><p class="q">"Mujhe bataiye aap ek P1 'ASA ke through server unreachable' ticket kaise solve karoge."</p><p>Loop batao: five-tuple define karo, ingress par capture, drop karne wala phase dhoondhne ke liye packet-tracer, <code>show nat</code>/<code>show xlate</code>/<code>show conn</code>/ACL counters, syslog aur <code>show asp drop</code>, server reply karta hai ya nahi dekhne ke liye egress par capture, ek change, usi flow se verify, captures hatao, document karo. Mention karo ki ek ticket mein kai faults chhupe ho sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aath steps: define, capture in, packet-tracer, live state, logs, capture out, ek change, verify aur saaf karo.</li>
<li>Gayab UN-NAT phase seedha <code>show nat</code> ki taraf ishara karta hai.</li>
<li>106023 ACL ka naam batata hai aur real destination address dikhata hai.</li>
<li>Dono interfaces par captures NAT saabit karte hain: inside par real address, outside par mapped address.</li>
<li>Jab tak exact ticket flow na chale loop dohrao, phir har capture hatao.</li>
</ul></div>
`}};export{e as default};