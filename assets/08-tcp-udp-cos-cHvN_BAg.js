var e={id:`tcp-udp-cos`,h:{en:`TCP, UDP and class of service basics`,hi:`TCP, UDP aur class of service ki basics`},body:{en:`
<p>Addresses get a packet to the right device. <b>Ports and transport protocols</b> get the data to the right application on that device. And <b>class of service</b> decides whose packet goes first when the road is full. This chapter covers both, as required by the JNCIA-Junos blueprint.</p>

<h3>Connection-oriented and connectionless</h3>
<p>Think of two ways to send a document. TCP is registered courier: you agree with the receiver first, every parcel is numbered, and lost parcels are sent again. UDP is dropping a postcard in the box: fast and simple, but nobody promises it arrives.</p>
<table class="cmp"><tr><th></th><th>TCP (connection-oriented)</th><th>UDP (connectionless)</th></tr>
<tr><td>Setup</td><td>Three-way handshake: SYN, SYN-ACK, ACK</td><td>None, just send</td></tr>
<tr><td>Reliability</td><td>Sequence numbers, acknowledgements, retransmission</td><td>No delivery guarantee</td></tr>
<tr><td>Flow control</td><td>Sliding window</td><td>None</td></tr>
<tr><td>Overhead</td><td>Higher</td><td>Lower, so good for real time</td></tr>
<tr><td>Examples</td><td>SSH 22, Telnet 23, HTTP 80, HTTPS 443, BGP 179</td><td>DNS 53, DHCP 67/68, NTP 123, SNMP 161, syslog 514, traceroute probes</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="TCP three-way handshake">
<rect x="40" y="10" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="95" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="490" y="10" width="110" height="34" rx="6" fill="#bae6fd"/><text x="545" y="32" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="95" y1="44" x2="95" y2="210" stroke="#64748b" stroke-width="2"/><line x1="545" y1="44" x2="545" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="95" y1="75" x2="545" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">1. SYN</text>
<line x1="545" y1="125" x2="95" y2="155" stroke="#64748b" stroke-width="2"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">2. SYN-ACK</text>
<line x1="95" y1="170" x2="545" y2="195" stroke="#64748b" stroke-width="2"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">3. ACK, data may flow</text>
</svg><p class="cap">TCP agrees on a connection first; UDP skips this step.</p></div>
<p>IP itself is connectionless: each packet is routed independently. Some protocols do not use TCP or UDP at all: OSPF runs directly on IP (protocol 89) and ICMP is protocol 1. A <b>port number</b> (0 to 65535) identifies the application; clients use a random high source port and servers listen on a well-known port such as 22 or 443.</p>

<h3>Class of service (CoS)</h3>
<p>Normally all packets are equal ("best effort"). When a link is congested, voice calls must not wait behind a large backup. CoS lets you treat traffic differently. The Junos CoS pipeline has four stages:</p>
<ol><li><b>Classification:</b> a <b>behaviour aggregate (BA) classifier</b> reads the DSCP, IP precedence or 802.1p bits already in the packet, or a <b>multifield (MF) classifier</b> (a firewall filter) matches addresses and ports, and places the packet in a <b>forwarding class</b>.</li>
<li><b>Policing:</b> limits the rate of a class; excess traffic is dropped or re-marked.</li>
<li><b>Scheduling:</b> each forwarding class maps to an <b>output queue</b>; <b>schedulers</b> give each queue a share of bandwidth and a priority.</li>
<li><b>Rewrite:</b> marks outgoing packets so the next device can classify them.</li></ol>
<p>Default Junos forwarding classes: <code>best-effort</code> (queue 0), <code>expedited-forwarding</code> (queue 1), <code>assured-forwarding</code> (queue 2) and <code>network-control</code> (queue 3). Voice is normally marked DSCP EF (46). CoS only matters during congestion; on an idle link every packet goes out immediately.</p>
<pre class="code">lab@R1&gt; show class-of-service interface ge-0/0/0
Physical interface: ge-0/0/0, Index: 148
Queues supported: 8, Queues in use: 4
  Scheduler map: &lt;default&gt;, Index: 2
  Classifier: dscp-default, Code point type: dscp</pre>

<div class="eg"><p><b>Worked example.</b> A branch link of 10 Mbit/s carries video backups and VoIP. Voice arrives marked EF and is classified into expedited-forwarding; the scheduler gives that queue strict priority so voice delay stays low. The backup is best-effort and fills the remaining bandwidth. Without CoS, a burst of backup packets would delay voice and calls would break up.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking CoS creates bandwidth; it only decides who is served first when there is a shortage. Trusting markings from untrusted ports without rewriting them at the edge.</p></div>

<div class="exam"><p><b>Exam traps.</b> TCP is reliable and ordered, UDP is not; DNS uses UDP 53 for normal queries. BA classifiers use packet markings, multifield classifiers use filters. The order is classification, policing, scheduling, rewrite.</p></div>

<div class="scn"><h4>Choppy calls at 4 pm</h4><p>Every afternoon at 4 pm the sales team's IP phones were choppy. Interface counters showed a branch uplink running at 100 percent when the nightly software mirror started early. The team marked VoIP as DSCP EF at the phones, used a BA classifier on the router, and gave the expedited-forwarding queue priority. Calls became clear, and the backup simply took a little longer.</p><p><b>Lesson:</b> CoS protects delay-sensitive traffic during congestion; it is not a substitute for adding bandwidth when links are always full.</p></div>

<div class="iv"><p class="q">"What is the difference between TCP and UDP, and when would you use each?"</p><p>TCP is connection-oriented with a three-way handshake, sequencing, acknowledgements and flow control, used for web, SSH and BGP. UDP is connectionless with low overhead, used where speed matters more than perfect delivery: DNS, voice, video, syslog. Add that applications on top of UDP can add their own reliability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TCP: handshake, reliable, ordered, flow control. UDP: no setup, no guarantees.</li>
<li>Ports identify applications; learn 22, 53, 80, 123, 161, 179, 443, 514.</li>
<li>CoS pipeline: classify, police, schedule (queues), rewrite.</li>
<li>BA classifiers read markings; multifield classifiers use filters.</li>
<li>CoS matters only under congestion; EF (46) is typical for voice.</li>
</ul></div>
`,hi:`
<p>Addresses packet ko sahi device tak pahunchate hain. <b>Ports aur transport protocols</b> data ko us device ki sahi application tak pahunchate hain. Aur <b>class of service</b> tay karta hai ki raasta bhara ho to kiska packet pehle jaaye. Yeh chapter dono cover karta hai, jaisa JNCIA-Junos blueprint mein chahiye.</p>

<h3>Connection-oriented aur connectionless</h3>
<p>Document bhejne ke do tareeke socho. TCP registered courier hai: pehle receiver se tay hota hai, har parcel numbered hai, aur kho gaye parcel dobara bheje jaate hain. UDP postcard letter box mein daalna hai: tez aur simple, lekin pahunchne ki koi guarantee nahi.</p>
<table class="cmp"><tr><th></th><th>TCP (connection-oriented)</th><th>UDP (connectionless)</th></tr>
<tr><td>Setup</td><td>Three-way handshake: SYN, SYN-ACK, ACK</td><td>Koi nahi, seedha bhejo</td></tr>
<tr><td>Reliability</td><td>Sequence numbers, acknowledgements, retransmission</td><td>Delivery ki guarantee nahi</td></tr>
<tr><td>Flow control</td><td>Sliding window</td><td>Nahi</td></tr>
<tr><td>Overhead</td><td>Zyada</td><td>Kam, isliye real time ke liye achha</td></tr>
<tr><td>Examples</td><td>SSH 22, Telnet 23, HTTP 80, HTTPS 443, BGP 179</td><td>DNS 53, DHCP 67/68, NTP 123, SNMP 161, syslog 514, traceroute probes</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="TCP three-way handshake">
<rect x="40" y="10" width="110" height="34" rx="6" fill="#bbf7d0"/><text x="95" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="490" y="10" width="110" height="34" rx="6" fill="#bae6fd"/><text x="545" y="32" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="95" y1="44" x2="95" y2="210" stroke="#64748b" stroke-width="2"/><line x1="545" y1="44" x2="545" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="95" y1="75" x2="545" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">1. SYN</text>
<line x1="545" y1="125" x2="95" y2="155" stroke="#64748b" stroke-width="2"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">2. SYN-ACK</text>
<line x1="95" y1="170" x2="545" y2="195" stroke="#64748b" stroke-width="2"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">3. ACK, ab data chal sakta hai</text>
</svg><p class="cap">TCP pehle connection tay karta hai; UDP yeh step chhod deta hai.</p></div>
<p>IP khud connectionless hai: har packet alag se route hota hai. Kuch protocols TCP ya UDP bilkul use nahi karte: OSPF seedha IP par chalta hai (protocol 89) aur ICMP protocol 1 hai. <b>Port number</b> (0 se 65535) application ko pehchanta hai; clients random high source port use karte hain aur servers 22 ya 443 jaise well-known port par sunte hain.</p>

<h3>Class of service (CoS)</h3>
<p>Aam taur par saare packets barabar hote hain ("best effort"). Link congested ho to voice calls ko bade backup ke peeche intezaar nahi karna chahiye. CoS traffic ko alag treat karne deta hai. Junos CoS pipeline ke chaar stages hain:</p>
<ol><li><b>Classification:</b> <b>behaviour aggregate (BA) classifier</b> packet mein pehle se maujood DSCP, IP precedence ya 802.1p bits padhta hai, ya <b>multifield (MF) classifier</b> (firewall filter) addresses aur ports match karta hai, aur packet ko ek <b>forwarding class</b> mein daalta hai.</li>
<li><b>Policing:</b> class ka rate limit karta hai; zyada traffic drop ya re-mark.</li>
<li><b>Scheduling:</b> har forwarding class ek <b>output queue</b> se judi hai; <b>schedulers</b> har queue ko bandwidth share aur priority dete hain.</li>
<li><b>Rewrite:</b> bahar jaate packets ko mark karta hai taaki agla device unhe classify kar sake.</li></ol>
<p>Default Junos forwarding classes: <code>best-effort</code> (queue 0), <code>expedited-forwarding</code> (queue 1), <code>assured-forwarding</code> (queue 2) aur <code>network-control</code> (queue 3). Voice aam taur par DSCP EF (46) mark hoti hai. CoS sirf congestion mein matter karta hai; khaali link par har packet turant nikal jaata hai.</p>
<pre class="code">lab@R1&gt; show class-of-service interface ge-0/0/0
Physical interface: ge-0/0/0, Index: 148
Queues supported: 8, Queues in use: 4
  Scheduler map: &lt;default&gt;, Index: 2
  Classifier: dscp-default, Code point type: dscp</pre>

<div class="eg"><p><b>Worked example.</b> 10 Mbit/s ka branch link video backups aur VoIP dono le jaata hai. Voice EF mark hokar aati hai aur expedited-forwarding mein classify hoti hai; scheduler us queue ko strict priority deta hai taaki voice delay kam rahe. Backup best-effort hai aur bachi bandwidth bharta hai. CoS ke bina backup packets ka burst voice ko late kar deta aur calls toot-ti.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sochna ki CoS bandwidth banata hai; woh sirf tay karta hai ki kami hone par pehle kise serve karna hai. Untrusted ports ki markings par bharosa karna bina edge par rewrite kiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> TCP reliable aur ordered hai, UDP nahi; DNS normal queries ke liye UDP 53 use karta hai. BA classifiers packet markings use karte hain, multifield classifiers filters. Order hai classification, policing, scheduling, rewrite.</p></div>

<div class="scn"><h4>Shaam 4 baje choppy calls</h4><p>Har dopahar 4 baje sales team ke IP phones choppy ho jaate the. Interface counters ne dikhaya ki jab nightly software mirror jaldi shuru hota tha to branch uplink 100 percent par chalta tha. Team ne phones par VoIP ko DSCP EF mark kiya, router par BA classifier use kiya, aur expedited-forwarding queue ko priority di. Calls saaf ho gayi, aur backup bas thoda zyada time leta tha.</p><p><b>Lesson:</b> CoS congestion mein delay-sensitive traffic ko bachata hai; jab links hamesha bhare rahein to yeh bandwidth badhane ka vikalp nahi.</p></div>

<div class="iv"><p class="q">"TCP aur UDP mein kya fark hai, aur kab kaunsa use karoge?"</p><p>TCP connection-oriented hai: three-way handshake, sequencing, acknowledgements aur flow control, web, SSH aur BGP ke liye. UDP connectionless hai, kam overhead, jahan speed perfect delivery se zyada zaroori ho: DNS, voice, video, syslog. Jodo ki UDP ke upar applications apni reliability bhi jod sakti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TCP: handshake, reliable, ordered, flow control. UDP: koi setup nahi, koi guarantee nahi.</li>
<li>Ports applications ko pehchante hain; 22, 53, 80, 123, 161, 179, 443, 514 yaad rakho.</li>
<li>CoS pipeline: classify, police, schedule (queues), rewrite.</li>
<li>BA classifiers markings padhte hain; multifield classifiers filters use karte hain.</li>
<li>CoS sirf congestion mein matter karta hai; voice ke liye EF (46) typical hai.</li>
</ul></div>
`}};export{e as default};