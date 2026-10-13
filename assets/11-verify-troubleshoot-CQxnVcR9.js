var e={id:`verify-troubleshoot`,h:{en:`Verification and troubleshooting workflow (both labs)`,hi:`Verification aur troubleshooting workflow (dono labs)`},body:{en:`
<p>A doctor does not prescribe medicine because the patient "looks unwell". She checks temperature, pulse and blood pressure in a fixed order, because the order finds the cause fastest. QoS troubleshooting works the same way. Most QoS faults are not exotic: the policy is on the wrong interface or direction, traffic falls into the wrong class, or the queue is not where the congestion is. A fixed workflow and one command, <code>show policy-map interface</code>, find almost all of them.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="QoS troubleshooting workflow">
<rect x="5" y="30" width="115" height="56" rx="8" fill="#bae6fd"/><text x="62" y="54" text-anchor="middle" class="svg-ink" font-size="12">1 reproduce</text><text x="62" y="72" text-anchor="middle" class="svg-muted" font-size="12">under load</text>
<rect x="132" y="30" width="115" height="56" rx="8" fill="#bae6fd"/><text x="189" y="54" text-anchor="middle" class="svg-ink" font-size="12">2 congestion</text><text x="189" y="72" text-anchor="middle" class="svg-muted" font-size="12">point?</text>
<rect x="259" y="30" width="115" height="56" rx="8" fill="#bbf7d0"/><text x="316" y="54" text-anchor="middle" class="svg-ink" font-size="12">3 attached?</text><text x="316" y="72" text-anchor="middle" class="svg-muted" font-size="12">intf + direction</text>
<rect x="386" y="30" width="115" height="56" rx="8" fill="#bbf7d0"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="12">4 classified</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="12">and marked?</text>
<rect x="513" y="30" width="122" height="56" rx="8" fill="#fde68a"/><text x="574" y="54" text-anchor="middle" class="svg-ink" font-size="12">5 queued right?</text><text x="574" y="72" text-anchor="middle" class="svg-muted" font-size="12">drops per class</text>
<line x1="120" y1="58" x2="132" y2="58" stroke="#64748b" stroke-width="2"/><line x1="247" y1="58" x2="259" y2="58" stroke="#64748b" stroke-width="2"/><line x1="374" y1="58" x2="386" y2="58" stroke="#64748b" stroke-width="2"/><line x1="501" y1="58" x2="513" y2="58" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="110" width="260" height="40" rx="8" fill="#fed7aa"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">6 prove the fix under the same load</text>
<line x1="574" y1="86" x2="450" y2="125" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Six steps, in order. Most faults are found at step 3 or 4.</p></div>
<ol>
<li><b>Reproduce under load.</b> QoS only acts during congestion, so an idle test proves nothing. Generate the traffic mix that hurts.</li>
<li><b>Find the congestion point.</b> <code>show interfaces</code>: look at txload and "Total output drops". The queue must be where the drops are.</li>
<li><b>Is the policy attached to that interface, in the right direction?</b> <code>show policy-map interface</code> prints "Service-policy input:" or "Service-policy output:".</li>
<li><b>Is traffic classified and marked?</b> Do the per-class packet counters of the right class increase? Does "Packets marked" increase?</li>
<li><b>Is it queued correctly?</b> Queue drops only in low-priority classes, zero in EF, b/w exceed drops zero.</li>
<li><b>Prove the fix</b> with the same load and the same counters.</li>
</ol>

<h3>Lab 1 walkthrough: mark and queue voice over a busy WAN</h3>
<p>After configuring MARK-IN (input, Gi0/1) and WAN-OUT (output, Gi0/0), load the link: <code>traffic 10.20.0.100 udp/20000 400 30</code> on PHONE, and <code>traffic 10.20.0.100 tcp/445 6000 30</code> plus <code>traffic 10.20.0.100 udp/5001 8000 30</code> on PC-DATA. After 30 seconds, check the call first:</p>
<pre class="out">PHONE> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
<span class="hl">1   10.20.0.100        udp/20000  0     400      30/30 7500      7500       0.0%</span>
(* = still running)</pre>
<p>The DSCP column shows 0 because the phone itself does not mark; R1 marks at the trust boundary. Now read the WAN policy class by class:</p>
<pre class="out">R1# show policy-map interface GigabitEthernet0/0
 GigabitEthernet0/0

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)
<span class="hl">      7500 packets, 1500000 bytes</span>
      30 second offered rate 400000 bps, drop rate 0000 bps
      Match: dscp ef (46)
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      (queue depth/total drops/no-buffer drops) 0/0/0

    Class-map: AF11-Q (match-any)
      8036 packets, 11250400 bytes
      30 second offered rate 3000000 bps, drop rate 0000 bps
      Match: dscp af11 (10)
      (queue depth/total drops/no-buffer drops) 0/0/0
      bandwidth 2000 kbps

    Class-map: class-default (match-any)
      150000 packets, 30000000 bytes
      30 second offered rate 8000000 bps, drop rate 1400000 bps
      Match: any
<span class="hl">      (queue depth/total drops/no-buffer drops) 0/26250/0</span>
      (pkts output/bytes output) 123750/24750000</pre>
<p>Read it like this: EF-Q counted all 7500 voice packets, so marking and classification work; zero drops and zero b/w exceed drops, so the priority rate is big enough. AF11-Q received only 3 Mbps because the inbound policer already cut the 6 Mbps backup in half. The answer to the lab's last question is the class with drops: <b>class-default</b>.</p>

<h3>Lab 2 walkthrough: the priority queue that never fills</h3>
<p><b>Step 1, reproduce.</b> Run a call from PHONE and a 12 Mbps bulk flow from PC-DATA. The call breaks up. <b>Step 3, check attachment.</b> The WAN policy is on Gi0/0 output, correct, but EF-Q shows zero:</p>
<pre class="out">R1# show policy-map interface GigabitEthernet0/0 output
    Class-map: EF-Q (match-any)
<span class="hl">      0 packets, 0 bytes</span>
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: dscp ef (46)</pre>
<p>Zero packets in EF-Q means no packet leaves R1 marked EF. So look upstream, at the marking policy:</p>
<pre class="out">R1# show policy-map interface GigabitEthernet0/1
 GigabitEthernet0/1

<span class="hl">  Service-policy output: MARK-IN</span>

    Class-map: VOICE (match-any)
      0 packets, 0 bytes</pre>
<p>There it is: MARK-IN is attached <b>output</b> on the LAN interface. It only sees packets going <b>towards</b> the phones, so voice leaving the branch is never marked, arrives at WAN-OUT as DSCP 0, and lands in class-default with the bulk traffic. The fix does not touch the policies, only the attachment:</p>
<pre class="code">interface GigabitEthernet0/1
 no service-policy output MARK-IN
 service-policy input MARK-IN</pre>
<p><b>Step 6, prove it.</b> Repeat the same 20-second call with the 12 Mbps flow. EF-Q now counts the voice packets with zero drops, class-default shows the drops, and <code>traffic show</code> on PHONE reports 0.0% loss for the new flow.</p>

<h3>Symptom to cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Right class shows 0 packets</td><td>wrong direction or interface, marking missing upstream, class order, match-all</td></tr>
<tr><td>EF packets counted, b/w exceed drops rising</td><td>priority rate too small, or non-voice traffic marked EF</td></tr>
<tr><td>No drops anywhere, but calls still break</td><td>congestion elsewhere: sub-rate provider, far end, Wi-Fi profile</td></tr>
<tr><td>Policy rejected when attached</td><td>queuing action on input, or guarantees exceed the interface bandwidth</td></tr>
<tr><td>Voice fine one way, bad the other</td><td>no egress policy at the far end or in the provider</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Reading <code>show running-config</code> and declaring the QoS "correct". Configuration shows intent; <code>show policy-map interface</code> counters show reality. Also, clear or note the counters before a test with <code>clear counters</code> so old numbers do not mislead you.</p></div>

<div class="exam"><p><b>Exam trap.</b> In exhibit questions, look first at the "Service-policy input/output" line and the per-class packet counters. A class with 0 packets while traffic flows means classification or direction, not queuing, is the problem.</p></div>

<div class="scn"><h4>The contractor's QoS</h4><p>This is lab 2 in real life. A contractor left a tidy QoS configuration and a note saying "voice prioritised". Weeks later, calls still broke up during backups. The on-call engineer ran one command on the WAN interface, saw 0 packets in the priority class, then one more on the LAN interface and saw MARK-IN attached as output. Two lines fixed it; the proof took 20 seconds of load.</p><p><b>Lesson:</b> counters first, theories later. A priority class with zero packets is a classification or attachment problem.</p></div>

<div class="iv"><p class="q">"Users say voice is bad during backups even though QoS is configured. How do you troubleshoot?"</p><p>Strong answer: reproduce during congestion, find where the output drops are with show interfaces, then use show policy-map interface on that interface: is the policy attached in the right direction, do the voice class counters increase, are packets marked EF upstream, are there queue or b/w exceed drops in the priority class. Then check the other direction and any provider or wireless segment. Prove the fix by repeating the load and comparing counters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Always test QoS under load; it does nothing on an idle link.</li>
<li>Workflow: reproduce, find congestion, check attachment and direction, check classification and marking, check queue drops, prove.</li>
<li><code>show policy-map interface</code> is the key command: service-policy direction, per-class packets, marks, drops.</li>
<li>Zero packets in the priority class means marking or attachment is wrong upstream.</li>
<li>Lab 2's fault: MARK-IN attached output instead of input on Gi0/1.</li>
</ul></div>
`,hi:`
<p>Doctor sirf isliye dawa nahi likhti ki patient "bimaar dikhta hai". Woh ek fixed kram mein temperature, pulse aur blood pressure check karti hai, kyunki woh kram wajah sabse jaldi dhoondhta hai. QoS troubleshooting bhi aise hi kaam karta hai. Zyada tar QoS faults anokhe nahi hote: policy galat interface ya direction par hai, traffic galat class mein girta hai, ya queue wahan nahi jahan congestion hai. Ek fixed workflow aur ek command, <code>show policy-map interface</code>, lagbhag sab pakad lete hain.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="QoS troubleshooting workflow">
<rect x="5" y="30" width="115" height="56" rx="8" fill="#bae6fd"/><text x="62" y="54" text-anchor="middle" class="svg-ink" font-size="12">1 reproduce</text><text x="62" y="72" text-anchor="middle" class="svg-muted" font-size="12">load mein</text>
<rect x="132" y="30" width="115" height="56" rx="8" fill="#bae6fd"/><text x="189" y="54" text-anchor="middle" class="svg-ink" font-size="12">2 congestion</text><text x="189" y="72" text-anchor="middle" class="svg-muted" font-size="12">point?</text>
<rect x="259" y="30" width="115" height="56" rx="8" fill="#bbf7d0"/><text x="316" y="54" text-anchor="middle" class="svg-ink" font-size="12">3 attached?</text><text x="316" y="72" text-anchor="middle" class="svg-muted" font-size="12">intf + direction</text>
<rect x="386" y="30" width="115" height="56" rx="8" fill="#bbf7d0"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="12">4 classified</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="12">aur marked?</text>
<rect x="513" y="30" width="122" height="56" rx="8" fill="#fde68a"/><text x="574" y="54" text-anchor="middle" class="svg-ink" font-size="12">5 sahi queue?</text><text x="574" y="72" text-anchor="middle" class="svg-muted" font-size="12">har class ke drops</text>
<line x1="120" y1="58" x2="132" y2="58" stroke="#64748b" stroke-width="2"/><line x1="247" y1="58" x2="259" y2="58" stroke="#64748b" stroke-width="2"/><line x1="374" y1="58" x2="386" y2="58" stroke="#64748b" stroke-width="2"/><line x1="501" y1="58" x2="513" y2="58" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="110" width="260" height="40" rx="8" fill="#fed7aa"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">6 same load mein fix sabit karo</text>
<line x1="574" y1="86" x2="450" y2="125" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Chhe steps, kram se. Zyada tar faults step 3 ya 4 par milte hain.</p></div>
<ol>
<li><b>Load mein reproduce karo.</b> QoS sirf congestion mein kaam karta hai, isliye idle test kuch sabit nahi karta. Woh traffic mix banao jo nuksaan karta hai.</li>
<li><b>Congestion point dhoondho.</b> <code>show interfaces</code>: txload aur "Total output drops" dekho. Queue wahin honi chahiye jahan drops hain.</li>
<li><b>Kya policy us interface par, sahi direction mein attached hai?</b> <code>show policy-map interface</code> "Service-policy input:" ya "Service-policy output:" print karta hai.</li>
<li><b>Kya traffic classify aur mark ho raha hai?</b> Kya sahi class ke per-class packet counters badh rahe hain? Kya "Packets marked" badh raha hai?</li>
<li><b>Kya sahi tarah queue ho raha hai?</b> Queue drops sirf low-priority classes mein, EF mein zero, b/w exceed drops zero.</li>
<li><b>Fix sabit karo</b> same load aur same counters ke saath.</li>
</ol>

<h3>Lab 1 walkthrough: busy WAN par voice mark aur queue karo</h3>
<p>MARK-IN (input, Gi0/1) aur WAN-OUT (output, Gi0/0) configure karne ke baad link load karo: PHONE par <code>traffic 10.20.0.100 udp/20000 400 30</code>, aur PC-DATA par <code>traffic 10.20.0.100 tcp/445 6000 30</code> plus <code>traffic 10.20.0.100 udp/5001 8000 30</code>. 30 seconds baad pehle call check karo:</p>
<pre class="out">PHONE> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
<span class="hl">1   10.20.0.100        udp/20000  0     400      30/30 7500      7500       0.0%</span>
(* = still running)</pre>
<p>DSCP column 0 dikhata hai kyunki phone khud mark nahi karta; R1 trust boundary par mark karta hai. Ab WAN policy class by class padho:</p>
<pre class="out">R1# show policy-map interface GigabitEthernet0/0
 GigabitEthernet0/0

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)
<span class="hl">      7500 packets, 1500000 bytes</span>
      30 second offered rate 400000 bps, drop rate 0000 bps
      Match: dscp ef (46)
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      (queue depth/total drops/no-buffer drops) 0/0/0

    Class-map: AF11-Q (match-any)
      8036 packets, 11250400 bytes
      30 second offered rate 3000000 bps, drop rate 0000 bps
      Match: dscp af11 (10)
      (queue depth/total drops/no-buffer drops) 0/0/0
      bandwidth 2000 kbps

    Class-map: class-default (match-any)
      150000 packets, 30000000 bytes
      30 second offered rate 8000000 bps, drop rate 1400000 bps
      Match: any
<span class="hl">      (queue depth/total drops/no-buffer drops) 0/26250/0</span>
      (pkts output/bytes output) 123750/24750000</pre>
<p>Ise aise padho: EF-Q ne saare 7500 voice packets gine, isliye marking aur classification kaam kar rahe hain; zero drops aur zero b/w exceed drops, isliye priority rate kaafi bada hai. AF11-Q ko sirf 3 Mbps mila kyunki inbound policer ne 6 Mbps backup ko pehle hi aadha kar diya. Lab ke aakhri sawaal ka jawab drops wali class hai: <b>class-default</b>.</p>

<h3>Lab 2 walkthrough: woh priority queue jo kabhi bharti nahi</h3>
<p><b>Step 1, reproduce.</b> PHONE se call aur PC-DATA se 12 Mbps bulk flow chalao. Call toot-ti hai. <b>Step 3, attachment check.</b> WAN policy Gi0/0 output par hai, sahi, par EF-Q zero dikhata hai:</p>
<pre class="out">R1# show policy-map interface GigabitEthernet0/0 output
    Class-map: EF-Q (match-any)
<span class="hl">      0 packets, 0 bytes</span>
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: dscp ef (46)</pre>
<p>EF-Q mein zero packets ka matlab hai ki R1 se koi packet EF marked hokar nahi nikalta. Isliye upstream dekho, marking policy par:</p>
<pre class="out">R1# show policy-map interface GigabitEthernet0/1
 GigabitEthernet0/1

<span class="hl">  Service-policy output: MARK-IN</span>

    Class-map: VOICE (match-any)
      0 packets, 0 bytes</pre>
<p>Yeh raha: MARK-IN LAN interface par <b>output</b> attached hai. Yeh sirf phones <b>ki taraf</b> jaane wale packets dekhti hai, isliye branch se nikalti voice kabhi mark nahi hoti, WAN-OUT par DSCP 0 ke saath pahunchti hai, aur bulk traffic ke saath class-default mein girti hai. Fix policies ko nahi chhoota, sirf attachment ko:</p>
<pre class="code">interface GigabitEthernet0/1
 no service-policy output MARK-IN
 service-policy input MARK-IN</pre>
<p><b>Step 6, sabit karo.</b> 12 Mbps flow ke saath wahi 20-second call dobara chalao. Ab EF-Q voice packets zero drops ke saath ginta hai, class-default drops dikhata hai, aur PHONE par <code>traffic show</code> naye flow ke liye 0.0% loss batata hai.</p>

<h3>Lakshan se wajah</h3>
<table class="cmp"><tr><th>Lakshan</th><th>Sambhavit wajah</th></tr>
<tr><td>Sahi class 0 packets dikhati hai</td><td>galat direction ya interface, upstream marking gayab, class order, match-all</td></tr>
<tr><td>EF packets gine gaye, b/w exceed drops badh rahe</td><td>priority rate bahut chhota, ya non-voice traffic EF marked</td></tr>
<tr><td>Kahin drops nahi, phir bhi calls toot-ti</td><td>congestion kahin aur: sub-rate provider, doosra sira, Wi-Fi profile</td></tr>
<tr><td>Attach karte waqt policy reject</td><td>input par queuing action, ya guarantees interface bandwidth se zyada</td></tr>
<tr><td>Voice ek taraf theek, doosri taraf kharab</td><td>doosre sire par ya provider mein egress policy nahi</td></tr></table>

<div class="warn"><p><b>Common galti.</b> <code>show running-config</code> padhkar QoS ko "sahi" ghoshit kar dena. Configuration iraada dikhati hai; <code>show policy-map interface</code> ke counters asliyat dikhate hain. Test se pehle <code>clear counters</code> se counters clear ya note bhi karo taaki purane numbers aapko gumraah na karein.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exhibit questions mein pehle "Service-policy input/output" line aur per-class packet counters dekho. Traffic chalte hue 0 packets wali class ka matlab problem classification ya direction mein hai, queuing mein nahi.</p></div>

<div class="scn"><h4>Contractor ka QoS</h4><p>Yeh asli zindagi mein lab 2 hai. Ek contractor ek saaf-suthri QoS configuration aur ek note chhod gaya ki "voice prioritised". Hafton baad bhi backups ke dauran calls toot-ti thi. On-call engineer ne WAN interface par ek command chalaya, priority class mein 0 packets dekhe, phir LAN interface par ek aur aur MARK-IN ko output attached dekha. Do lines ne theek kar diya; saboot mein 20 second ka load laga.</p><p><b>Seekh:</b> pehle counters, theories baad mein. Zero packets wali priority class classification ya attachment ki problem hai.</p></div>

<div class="iv"><p class="q">"Users kehte hain QoS configured hone ke bawajood backups ke dauran voice kharab hai. Aap kaise troubleshoot karoge?"</p><p>Strong answer: congestion ke dauran reproduce karo, show interfaces se output drops kahan hain dhoondho, phir us interface par show policy-map interface use karo: kya policy sahi direction mein attached hai, kya voice class ke counters badh rahe hain, kya packets upstream EF mark ho rahe hain, kya priority class mein queue ya b/w exceed drops hain. Phir doosri direction aur koi bhi provider ya wireless segment check karo. Load dohra kar aur counters compare karke fix sabit karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS hamesha load mein test karo; idle link par yeh kuch nahi karta.</li>
<li>Workflow: reproduce, congestion dhoondho, attachment aur direction check, classification aur marking check, queue drops check, sabit karo.</li>
<li><code>show policy-map interface</code> key command hai: service-policy direction, per-class packets, marks, drops.</li>
<li>Priority class mein zero packets matlab upstream marking ya attachment galat hai.</li>
<li>Lab 2 ka fault: Gi0/1 par MARK-IN input ki jagah output attached tha.</li>
</ul></div>
`}};export{e as default};