var e={id:`embedded-capture`,h:{en:`Embedded Packet Capture: proving what crossed the wire`,hi:`Embedded Packet Capture: wire par kya cross hua yeh prove karna`},body:{en:`
<p>A trace tells you what the controller <i>thinks</i>. A packet capture tells you what really <i>happened on the cable</i>. Imagine a delivery dispute: the shop says "we sent it", the customer says "we never got it". The only fair judge is the courier's scan log at the sorting hub. <b>Embedded Packet Capture</b> (EPC) is that scan log, built into the controller: a sniffer you start and stop from the CLI or the web UI, with no extra hardware and no mirror port.</p>

<h3>When a capture beats a trace</h3>
<p>The trace is a list of software messages. It can say "DHCP DISCOVER sent 4 times, no OFFER", but only a capture can show that the Discover really left on the uplink, and that nothing came back. That proof lets you walk to the DHCP team with evidence: "the request left WLC1 at 17:12:58 on VLAN 20; no Offer returned."</p>

<h3>Define, start, stop, read, export</h3>
<p>A capture has a name (or number), an <b>attachment point</b> (an interface or the control plane), an optional <b>filter</b> and <b>limits</b>. You cannot change the definition while it is active.</p>
<pre class="code">WLC1# monitor capture CAP-DHCP interface GigabitEthernet1 both
WLC1# monitor capture CAP-DHCP match any
WLC1# monitor capture CAP-DHCP buffer size 10
WLC1# monitor capture CAP-DHCP limit duration 120
WLC1# monitor capture CAP-DHCP start
<span class="c">! ... reproduce: LAPTOP1 connects to NK-STAFF ...</span>
WLC1# monitor capture CAP-DHCP stop
WLC1# show monitor capture CAP-DHCP
WLC1# show monitor capture CAP-DHCP buffer brief
WLC1# monitor capture CAP-DHCP export flash:CAP-DHCP.pcap
WLC1# monitor capture CAP-DHCP clear
WLC1# no monitor capture CAP-DHCP</pre>
<dl class="terms">
<dt>interface GigabitEthernet1 both</dt><dd>Attachment point and direction: <code>in</code>, <code>out</code> or <code>both</code>. In the lab WLC1 has one physical port, GigabitEthernet1, the trunk to SW1. A real 9800 can also capture on a port-channel or on the <code>control-plane</code> (traffic to and from the controller CPU, for example RADIUS and CAPWAP control).</dd>
<dt>match any | match ipv4 ...</dt><dd>The filter. <code>match ipv4 any host 10.10.60.20</code> keeps only packets towards the RADIUS server. <code>inner mac 0050.2fe9.9a01</code> filters on the client MAC inside CAPWAP, so a client's frames can be found even when they travel in a tunnel (the lab accepts it; a real unit decapsulates the CAPWAP data to match).</dd>
<dt>buffer size</dt><dd>Memory in MB (the lab accepts 1 to 100). When the buffer is full, a capture limited by duration or packets stops; a circular buffer keeps only the newest.</dd>
<dt>limit duration | limit packets</dt><dd>Auto-stop after N seconds or N packets. Use it so a forgotten capture does not run for days.</dd>
<dt>export flash:name.pcap</dt><dd>Writes the buffer to a file you can copy off and open in Wireshark (chapter 11). The lab export is a <b>text summary</b>, not a real pcap file.</dd>
</dl>
<p><b>Web UI:</b> <b>Troubleshooting &gt; Packet Capture</b> offers the same steps: pick the interface, filter, buffer, Start, Stop, Export. The CLI lines are the reference.</p>

<div class="note"><p><b>Learning approximation.</b> The lab capture does not sniff real packets. The buffer is <b>synthesised</b> from events the simulator recorded: CAPWAP join, CAPWAP echo every 30 s, EAPOL 4-way handshake, EAP identity, RADIUS Access-Request and Accept or Reject (with retransmits), DHCP Discover, Offer, Request, ACK and station add or delete. A real capture also holds ARP, ICMP, LLDP and data traffic, and access-list filters and hex dumps exist there but are not modelled. Every lab buffer print starts with a "Learning approximation" line.</p></div>

<h3>What the lab buffer looks like</h3>
<pre class="out">WLC1# show monitor capture CAP-DHCP buffer brief
Learning approximation: the packets below are synthesised ... It is not a real capture.
 ----------------------------------------------------------------------------------------------------
 #   size  timestamp  source            destination        dscp    protocol  info (learning-model column)
 ----------------------------------------------------------------------------------------------------
 1   342   0.000000   0.0.0.0     -&gt;  255.255.255.255    0 BE    UDP       <span class="hl">DHCP Discover</span> - Transaction ID ...
 2   342   1.998312   0.0.0.0     -&gt;  255.255.255.255    0 BE    UDP       <span class="hl">DHCP Discover</span> - Transaction ID ...
 3   342   4.001870   0.0.0.0     -&gt;  255.255.255.255    0 BE    UDP       <span class="hl">DHCP Discover</span> - Transaction ID ...</pre>
<p>Three Discovers, no Offer. Compare a healthy exchange: rows <code>DHCP Discover</code>, <code>DHCP Offer</code>, <code>DHCP Request</code>, <code>DHCP ACK</code> in that order. The tasks of the labs ask for exactly this comparison.</p>

<h3>Where the capture sits matters</h3>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Capture points">
<rect x="10" y="60" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="55" y="90" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text>
<rect x="140" y="60" width="70" height="50" rx="8" fill="#bae6fd"/><text x="175" y="90" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="250" y="60" width="70" height="50" rx="8" fill="#e2e8f0"/><text x="285" y="90" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="360" y="60" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="82" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="405" y="100" text-anchor="middle" class="svg-muted" font-size="11">Gi1 EPC here</text>
<rect x="500" y="60" width="70" height="50" rx="8" fill="#fde68a"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="13">R1 DHCP</text>
<line x1="100" y1="85" x2="140" y2="85" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="210" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="85" x2="360" y2="85" stroke="#64748b" stroke-width="2"/><line x1="450" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="120" y="75" text-anchor="middle" class="svg-muted" font-size="11">radio</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">The controller sees the client request leave and any reply return.</text>
<text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">It cannot see inside R1, only that R1 did not answer.</text>
</svg><p class="cap">An uplink capture proves where the conversation stops, but not why the far device is silent.</p></div>

<div class="eg"><p><b>Worked example.</b> Capture CAP-DHCP shows three Discovers on VLAN 20 and no Offer. Conclusion: stages 1 to 4 are fine and the controller sends the request. Next question: which device should answer? The DHCP server lives behind R1, so you check <code>show ip interface brief</code> on R1 and find <code>GigabitEthernet0/0.20</code> administratively down. One <code>no shutdown</code>, then a second capture CAP-OK shows Discover, Offer, Request, ACK.</p></div>

<div class="warn"><p><b>Common mistake.</b> Capturing with <code>match any</code> on a busy production uplink with a big buffer and no limit. You flood the buffer with data traffic, hide the one packet you want and consume memory. Filter and limit.</p></div>
<div class="exam"><p><b>Exam trap.</b> An EPC on the controller shows the packets that reach <b>that attachment point</b>. DTLS-encrypted CAPWAP control messages are visible as UDP 5246 packets but their content is not readable. EPC is not RA trace: it records packets, not software decisions.</p></div>

<div class="scn"><h4>"The firewall dropped it"</h4><p>Users on a new VLAN got no addresses. The network team blamed the controller; the wireless team blamed DHCP. An EPC on the uplink with <code>match ipv4 any any</code> and a 60 second limit showed Discovers leaving with the helper path correct and no Offers returning. The DHCP team then found the new VLAN missing from the scope list.</p><p><b>Lesson:</b> a capture ends the blame game because both teams can read the same evidence.</p></div>

<div class="iv"><p class="q">"How do you prove the DHCP server is not answering?"</p><p>I capture on the WLC uplink (or control plane) for the client VLAN with a duration limit, reproduce the connection and show Discovers without Offers. Then I repeat after the fix and show the full Discover, Offer, Request, ACK exchange. I name the captures and export them for the evidence pack.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EPC is a built-in sniffer: interface or control plane, filter, limits, then start, stop and read.</li>
<li>Use it to prove a packet left or never returned.</li>
<li>Always set a filter or limit; export to a file for Wireshark.</li>
<li>The lab buffer is synthesised from known exchanges, an approximation.</li>
<li>Web UI: Troubleshooting &gt; Packet Capture.</li>
</ul></div>
`,hi:`
<p>Trace batata hai ki controller kya <i>sochta hai</i>. Packet capture batata hai ki cable par asal mein kya <i>hua</i>. Delivery dispute socho: shop kehti hai "humne bheja", customer kehta hai "humein kabhi nahi mila". Sirf ek nishpaksh judge hai: sorting hub ka courier scan log. <b>Embedded Packet Capture</b> (EPC) wahi scan log hai, controller ke andar bana hua: ek sniffer jise aap CLI ya web UI se start aur stop karte ho, bina extra hardware aur mirror port ke.</p>

<h3>Kab capture trace se behtar hai</h3>
<p>Trace software messages ki list hai. Woh keh sakta hai "DHCP DISCOVER 4 baar bheja, OFFER nahi", lekin sirf capture dikha sakta hai ki Discover sach mein uplink par nikla, aur kuch wapas nahi aaya. Yeh proof aapko DHCP team ke paas evidence ke saath jaane deta hai: "request 17:12:58 par VLAN 20 par WLC1 se nikli; koi Offer wapas nahi aaya."</p>

<h3>Define, start, stop, read, export</h3>
<p>Capture ka ek naam (ya number), ek <b>attachment point</b> (interface ya control plane), optional <b>filter</b> aur <b>limits</b> hote hain. Active hone par aap definition nahi badal sakte.</p>
<pre class="code">WLC1# monitor capture CAP-DHCP interface GigabitEthernet1 both
WLC1# monitor capture CAP-DHCP match any
WLC1# monitor capture CAP-DHCP buffer size 10
WLC1# monitor capture CAP-DHCP limit duration 120
WLC1# monitor capture CAP-DHCP start
<span class="c">! ... reproduce: LAPTOP1 NK-STAFF se connect karta hai ...</span>
WLC1# monitor capture CAP-DHCP stop
WLC1# show monitor capture CAP-DHCP
WLC1# show monitor capture CAP-DHCP buffer brief
WLC1# monitor capture CAP-DHCP export flash:CAP-DHCP.pcap
WLC1# monitor capture CAP-DHCP clear
WLC1# no monitor capture CAP-DHCP</pre>
<dl class="terms">
<dt>interface GigabitEthernet1 both</dt><dd>Attachment point aur direction: <code>in</code>, <code>out</code> ya <code>both</code>. Lab mein WLC1 ka ek hi physical port hai, GigabitEthernet1, SW1 ka trunk. Real 9800 port-channel ya <code>control-plane</code> par bhi capture kar sakta hai (controller CPU ke aane-jaane wala traffic, jaise RADIUS aur CAPWAP control).</dd>
<dt>match any | match ipv4 ...</dt><dd>Filter. <code>match ipv4 any host 10.10.60.20</code> sirf RADIUS server ki taraf ke packets rakhta hai. <code>inner mac 0050.2fe9.9a01</code> CAPWAP ke andar ke client MAC par filter karta hai, taaki tunnel mein bhi client ke frames mil jayein (lab accept karta hai; real unit match karne ke liye CAPWAP data decapsulate karta hai).</dd>
<dt>buffer size</dt><dd>MB mein memory (lab 1 se 100 accept karta hai). Buffer bharne par duration ya packets se limited capture ruk jata hai; circular buffer sirf naye packets rakhta hai.</dd>
<dt>limit duration | limit packets</dt><dd>N second ya N packets ke baad auto-stop. Isse bhoola hua capture dino tak nahi chalta.</dd>
<dt>export flash:name.pcap</dt><dd>Buffer ko file mein likhta hai jise aap copy karke Wireshark mein khol sakte ho (chapter 11). Lab export <b>text summary</b> hai, real pcap file nahi.</dd>
</dl>
<p><b>Web UI:</b> <b>Troubleshooting &gt; Packet Capture</b> wahi steps deta hai: interface chuno, filter, buffer, Start, Stop, Export. CLI lines reference hain.</p>

<div class="note"><p><b>Learning approximation.</b> Lab capture real packets sniff nahi karta. Buffer un events se <b>synthesise</b> hota hai jo simulator ne record kiye: CAPWAP join, har 30 s par CAPWAP echo, EAPOL 4-way handshake, EAP identity, RADIUS Access-Request aur Accept ya Reject (retransmits ke saath), DHCP Discover, Offer, Request, ACK aur station add ya delete. Real capture mein ARP, ICMP, LLDP aur data traffic bhi hota hai, aur wahan access-list filters aur hex dumps hote hain jo model nahi hain. Har lab buffer print "Learning approximation" line se shuru hota hai.</p></div>

<h3>Lab buffer kaisa dikhta hai</h3>
<pre class="out">WLC1# show monitor capture CAP-DHCP buffer brief
Learning approximation: the packets below are synthesised ... It is not a real capture.
 ----------------------------------------------------------------------------------------------------
 #   size  timestamp  source            destination        dscp    protocol  info (learning-model column)
 ----------------------------------------------------------------------------------------------------
 1   342   0.000000   0.0.0.0     -&gt;  255.255.255.255    0 BE    UDP       <span class="hl">DHCP Discover</span> - Transaction ID ...
 2   342   1.998312   0.0.0.0     -&gt;  255.255.255.255    0 BE    UDP       <span class="hl">DHCP Discover</span> - Transaction ID ...
 3   342   4.001870   0.0.0.0     -&gt;  255.255.255.255    0 BE    UDP       <span class="hl">DHCP Discover</span> - Transaction ID ...</pre>
<p>Teen Discovers, Offer nahi. Healthy exchange se compare karo: rows <code>DHCP Discover</code>, <code>DHCP Offer</code>, <code>DHCP Request</code>, <code>DHCP ACK</code> isi order mein. Labs ke tasks yehi comparison maangte hain.</p>

<h3>Capture kahan baitha hai yeh matter karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Capture points">
<rect x="10" y="60" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="55" y="90" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text>
<rect x="140" y="60" width="70" height="50" rx="8" fill="#bae6fd"/><text x="175" y="90" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="250" y="60" width="70" height="50" rx="8" fill="#e2e8f0"/><text x="285" y="90" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="360" y="60" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="82" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="405" y="100" text-anchor="middle" class="svg-muted" font-size="11">Gi1 EPC yahan</text>
<rect x="500" y="60" width="70" height="50" rx="8" fill="#fde68a"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="13">R1 DHCP</text>
<line x1="100" y1="85" x2="140" y2="85" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="210" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="85" x2="360" y2="85" stroke="#64748b" stroke-width="2"/><line x1="450" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="120" y="75" text-anchor="middle" class="svg-muted" font-size="11">radio</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">Controller client ki request nikalte aur reply aate dekhta hai.</text>
<text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">R1 ke andar nahi dekh sakta, sirf yeh ki R1 ne jawab nahi diya.</text>
</svg><p class="cap">Uplink capture prove karta hai ki baat kahan ruki, lekin yeh nahi ki door ka device chup kyun hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Capture CAP-DHCP VLAN 20 par teen Discovers dikhata hai aur Offer nahi. Conclusion: stages 1 se 4 theek hain aur controller request bhejta hai. Agla sawaal: kaunsa device jawab dega? DHCP server R1 ke peeche hai, to aap R1 par <code>show ip interface brief</code> check karte ho aur <code>GigabitEthernet0/0.20</code> administratively down paate ho. Ek <code>no shutdown</code>, phir doosra capture CAP-OK Discover, Offer, Request, ACK dikhata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Busy production uplink par <code>match any</code>, bade buffer aur bina limit ke capture karna. Buffer data traffic se bhar jata hai, jo ek packet chahiye woh chhup jata hai aur memory khaata hai. Filter aur limit lagao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Controller par EPC <b>us attachment point</b> tak pahunchne wale packets dikhata hai. DTLS-encrypted CAPWAP control messages UDP 5246 packets ki tarah dikhte hain lekin unka content padha nahi ja sakta. EPC RA trace nahi hai: yeh packets record karta hai, software decisions nahi.</p></div>

<div class="scn"><h4>"Firewall ne drop kiya"</h4><p>Naye VLAN ke users ko address nahi mile. Network team ne controller ko blame kiya; wireless team ne DHCP ko. Uplink par <code>match ipv4 any any</code> aur 60 second limit wale EPC ne Discovers nikalte dikhaye, helper path sahi, aur koi Offer wapas nahi. Phir DHCP team ne dekha ki naya VLAN scope list se missing tha.</p><p><b>Lesson:</b> capture blame game khatam karta hai kyunki dono teams ek hi evidence padh sakti hain.</p></div>

<div class="iv"><p class="q">"Kaise prove karoge ki DHCP server jawab nahi de raha?"</p><p>Main WLC uplink (ya control plane) par client VLAN ke liye duration limit ke saath capture karta hoon, connection reproduce karta hoon aur Offer ke bina Discovers dikhata hoon. Fix ke baad dobara karke poora Discover, Offer, Request, ACK exchange dikhata hoon. Captures ko naam deta hoon aur evidence pack ke liye export karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EPC built-in sniffer hai: interface ya control plane, filter, limits, phir start, stop aur read.</li>
<li>Isse prove karo ki packet nikla ya wapas nahi aaya.</li>
<li>Hamesha filter ya limit lagao; Wireshark ke liye file mein export karo.</li>
<li>Lab buffer known exchanges se synthesise hota hai, approximation.</li>
<li>Web UI: Troubleshooting &gt; Packet Capture.</li>
</ul></div>
`}};export{e as default};