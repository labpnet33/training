var e={id:`why-qos`,h:{en:`Why QoS exists: bandwidth, delay, jitter and loss`,hi:`QoS kyun chahiye: bandwidth, delay, jitter aur loss`},body:{en:`
<p>Picture the security check at an airport. There is one scanner, but a flight departing in twenty minutes, a crowd of leisure travellers and a crew that must board right now all arrive together. If the lane is strictly first come, first served, the crew misses the flight and nobody is happy. Airports solve this with a fast-track lane and a few simple rules. A network link has exactly the same problem. <b>Quality of Service (QoS)</b> is the set of rules that decides who goes first, who waits and who is turned away when a link cannot carry everything that wants to cross it. CCNA exam topic 4.7 asks you to explain how that works: classification, marking, queuing, congestion, policing and shaping.</p>

<h3>Bandwidth is finite and traffic arrives in bursts</h3>
<p>In a branch office the LAN runs at 1 Gbps, but the WAN circuit to head office may be only 10 Mbps. Every packet that leaves the branch must squeeze through that narrow exit. When packets arrive faster than the interface can send them, the extra packets wait in a <b>queue</b> in router memory. When the queue is full, new packets are <b>dropped</b>. This happens at the point where a fast link feeds a slow one, and also whenever many ports feed one uplink.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Fast LAN feeding a slow WAN">
<rect x="10" y="60" width="150" height="70" rx="6" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="13">Branch LAN</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps per port</text>
<rect x="250" y="60" width="140" height="70" rx="6" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">output queue</text>
<rect x="278" y="114" width="12" height="12" fill="#94a3b8"/><rect x="294" y="114" width="12" height="12" fill="#94a3b8"/><rect x="310" y="114" width="12" height="12" fill="#94a3b8"/><rect x="326" y="114" width="12" height="12" fill="#94a3b8"/>
<rect x="480" y="60" width="150" height="70" rx="6" fill="#bae6fd"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="13">WAN to HQ</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">10 Mbps</text>
<path d="M160 95 H250" stroke="#64748b" stroke-width="6" fill="none"/><path d="M390 95 H480" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="205" y="80" text-anchor="middle" class="svg-muted" font-size="11">wide</text><text x="435" y="80" text-anchor="middle" class="svg-muted" font-size="11">narrow</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Congestion happens here, at the exit of the fast side</text>
</svg><p class="cap">The queue forms on the router's WAN output interface, not on the LAN.</p></div>
<p>You can confirm the speed the router believes in. The simulator's WAN port is a 10 Mbps circuit, and the interface counters say so.</p>
<pre class="code">R1# show interfaces GigabitEthernet0/0 | include output|drops|BW|rate</pre>
<pre class="out">  MTU 1500 bytes, BW 10000 Kbit/sec, DLY 10 usec,
  5 minute input rate 0 bits/sec, 0 packets/sec
  5 minute output rate 0 bits/sec, 0 packets/sec
     41 packets output, 10624 bytes, 0 underruns
     0 output errors, 0 collisions, 0 interface resets</pre>
<p><code>BW 10000 Kbit/sec</code> is the number QoS percentages are calculated from. Remember it: later, <code>priority percent 20</code> will mean 2000 kbps on this link.</p>

<h3>The three enemies: delay, jitter and loss</h3>
<dl class="terms">
<dt>Delay (latency)</dt><dd>How long a packet takes to cross the network. It is the sum of <b>serialization</b> (clocking the bits onto the wire), <b>propagation</b> (the speed of light in fibre), <b>queuing</b> (waiting behind other packets) and <b>processing</b> (the router's lookup). Queuing is the part QoS can control.</dd>
<dt>Jitter</dt><dd>The variation in delay between packets of the same flow. If packet 1 takes 40 ms, packet 2 takes 40 ms and packet 3 takes 90 ms, the jitter is large even if the average is fine. Voice receivers use a small <b>de-jitter buffer</b>, so a packet that arrives too late is as useless as a lost one.</dd>
<dt>Loss</dt><dd>Packets that never arrive, mostly because a queue was full (tail drop) or a policer discarded them. TCP notices and resends; a live voice call cannot wait for a resend.</dd>
<dt>Bandwidth</dt><dd>How much the link can carry per second. QoS does not create more of it; it divides what exists.</dd>
</dl>

<h3>What each kind of traffic needs</h3>
<div class="tbl"><table>
<tr><th>Traffic</th><th>Typical example</th><th>One-way delay</th><th>Jitter</th><th>Loss</th><th>Bandwidth</th></tr>
<tr><td>Voice (RTP)</td><td>IP phone call</td><td>150 ms or less</td><td>30 ms or less</td><td>1% or less</td><td>Small and steady: about 80 to 90 kbps per G.711 call, about 30 kbps for G.729</td></tr>
<tr><td>Interactive video</td><td>Teams or Zoom meeting</td><td>150 ms or less</td><td>30 ms or less</td><td>1% or less</td><td>Large and bursty: 1 to 4 Mbps or more per stream</td></tr>
<tr><td>Streaming video</td><td>Recorded training</td><td>Seconds are fine</td><td>Buffered</td><td>5% or less</td><td>Large but can buffer ahead</td></tr>
<tr><td>Interactive data</td><td>ERP, SSH, web apps</td><td>Users notice above 1 to 2 s</td><td>Tolerant</td><td>Low, TCP recovers</td><td>Moderate</td></tr>
<tr><td>Bulk data</td><td>Backups, software updates, SMB copy</td><td>Tolerant</td><td>Tolerant</td><td>TCP recovers</td><td>Will take whatever is free</td></tr>
</table></div>
<p>Notice the contrast. Voice needs very little bandwidth but cannot tolerate waiting. Bulk transfers need huge bandwidth but do not care if they take a minute longer. A fair queue treats them identically, which is exactly the wrong thing to do. QoS lets the network treat unequal needs unequally.</p>

<div class="eg"><p><b>Worked example.</b> A 1500-byte packet is 12,000 bits. Serialization delay is bits divided by link speed: at 1 Gbps it is 0.012 ms, at 10 Mbps it is <b>1.2 ms</b>, at 1 Mbps it is 12 ms, and on a 128 kbps link it is <b>93.75 ms</b>. A voice packet that arrives just behind one bulk packet on the slow link waits almost 94 ms before it even starts, and the voice budget is 150 ms for the entire path. That is why QoS matters most on slow links. Capacity planning: if voice may use about one third of the 10 Mbps WAN, that is 3.3 Mbps. At roughly 87 kbps per G.711 call including Ethernet overhead, the link can carry about 37 calls before voice itself needs more bandwidth, no matter how well it is prioritised.</p></div>

<h3>Where does the delay come from?</h3>
<p>Bandwidth, delay and loss are linked. A full queue adds delay (packets wait) and then loss (the queue overflows). Adding a bigger buffer to avoid loss increases delay, so there is no free lunch. The practical aim of QoS is to guarantee the rare, important packets a short wait and a seat in the queue, and to let the bulk traffic absorb the delay and the loss because it can recover from them.</p>

<div class="warn"><p><b>Common mistakes.</b> Believing QoS adds bandwidth: if the link is full all day, buy more capacity; QoS helps with congestion that comes and goes. Thinking QoS matters on every uncongested link: with empty queues every packet leaves immediately and markings change nothing. Forgetting jitter: an average delay of 40 ms with spikes to 120 ms still ruins a call.</p></div>

<div class="exam"><p><b>Exam traps.</b> Know the voice numbers: one-way delay 150 ms or less, jitter 30 ms or less, loss 1% or less. Voice is delay and loss sensitive but needs little bandwidth; bulk data is the reverse. Queuing delay is the only delay component QoS can shape. QoS is applied when there is congestion; it does not speed up an idle link.</p></div>

<div class="scn"><h4>Pune calls break at 9 AM</h4><p>Every morning at nine the Pune branch complained of choppy calls. The WAN graph showed the 10 Mbps link touching 100% for about twenty minutes: laptops were downloading OS updates just as everyone logged in. The calls themselves were fine at 8 AM, so the phones, codecs and cabling were not the problem. The engineer marked voice and gave it a priority queue (you will build exactly that in this module). The updates still took the same total time, but the calls stayed clean.</p><p><b>Lesson:</b> the fault was short-term congestion, which is what QoS is for. A permanently full link needs more bandwidth.</p></div>

<div class="iv"><p class="q">"Why does voice need QoS when it uses so little bandwidth?"</p><p>Because voice is sensitive to waiting, not to size. Say that one data packet in front of a voice packet adds serialization delay (94 ms at 128 kbps), that jitter and loss break the call, and quote the 150 ms, 30 ms, 1% targets. Finish with how QoS gives voice a short, bounded wait while bulk traffic takes the delay.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS decides who waits and who is dropped when a link is congested; it does not create bandwidth.</li>
<li>Congestion appears where a fast link or many ports feed a slower exit, in the output queue.</li>
<li>The four characteristics: bandwidth, delay, jitter, loss. Voice targets: 150 ms one-way, 30 ms jitter, 1% loss.</li>
<li>Voice is small but intolerant; bulk data is large but tolerant. Treat them differently.</li>
<li>Serialization delay = bits / link speed; it is large on slow links and is why QoS matters most there.</li>
</ul></div>
`,hi:`
<p>Airport ka security check socho. Scanner ek hi hai, lekin bees minute mein nikalne wali flight, aaram se ghoomne wale travellers ki bheed aur ek crew jise abhi board karna hai, sab ek saath aate hain. Agar lane strictly first come, first served ho, to crew flight chhod deta hai aur koi khush nahi hota. Airports iska hal fast-track lane aur kuch simple rules se nikaalte hain. Network link ka bilkul yahi problem hai. <b>Quality of Service (QoS)</b> un rules ka set hai jo tay karta hai ki jab link woh sab carry nahi kar sakta jo cross karna chahta hai, to kaun pehle jaayega, kaun wait karega aur kise wapas kiya jaayega. CCNA exam topic 4.7 aapse yeh samjhane ko kehta hai ki yeh kaise kaam karta hai: classification, marking, queuing, congestion, policing aur shaping.</p>

<h3>Bandwidth limited hai aur traffic bursts mein aata hai</h3>
<p>Branch office mein LAN 1 Gbps par chalta hai, lekin head office tak WAN circuit sirf 10 Mbps ho sakta hai. Branch se nikalne wala har packet us patle exit se guzarna padta hai. Jab packets interface ke bhejne se tez aate hain, to extra packets router memory ki ek <b>queue</b> mein wait karte hain. Queue full ho jaye, to naye packets <b>drop</b> ho jaate hain. Yeh wahan hota hai jahan fast link slow link ko feed karta hai, aur tab bhi jab bahut saare ports ek uplink ko feed karte hain.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Fast LAN slow WAN ko feed karta hai">
<rect x="10" y="60" width="150" height="70" rx="6" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="13">Branch LAN</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps per port</text>
<rect x="250" y="60" width="140" height="70" rx="6" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">output queue</text>
<rect x="278" y="114" width="12" height="12" fill="#94a3b8"/><rect x="294" y="114" width="12" height="12" fill="#94a3b8"/><rect x="310" y="114" width="12" height="12" fill="#94a3b8"/><rect x="326" y="114" width="12" height="12" fill="#94a3b8"/>
<rect x="480" y="60" width="150" height="70" rx="6" fill="#bae6fd"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="13">WAN to HQ</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">10 Mbps</text>
<path d="M160 95 H250" stroke="#64748b" stroke-width="6" fill="none"/><path d="M390 95 H480" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="205" y="80" text-anchor="middle" class="svg-muted" font-size="11">chauda</text><text x="435" y="80" text-anchor="middle" class="svg-muted" font-size="11">patla</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Congestion yahan hota hai, fast side ke exit par</text>
</svg><p class="cap">Queue router ke WAN output interface par banti hai, LAN par nahi.</p></div>
<p>Aap confirm kar sakte ho ki router kaunsi speed maanta hai. Simulator ka WAN port 10 Mbps circuit hai, aur interface counters yahi batate hain.</p>
<pre class="code">R1# show interfaces GigabitEthernet0/0 | include output|drops|BW|rate</pre>
<pre class="out">  MTU 1500 bytes, BW 10000 Kbit/sec, DLY 10 usec,
  5 minute input rate 0 bits/sec, 0 packets/sec
  5 minute output rate 0 bits/sec, 0 packets/sec
     41 packets output, 10624 bytes, 0 underruns
     0 output errors, 0 collisions, 0 interface resets</pre>
<p><code>BW 10000 Kbit/sec</code> woh number hai jisse QoS percentages nikalte hain. Yaad rakho: aage <code>priority percent 20</code> ka matlab is link par 2000 kbps hoga.</p>

<h3>Teen dushman: delay, jitter aur loss</h3>
<dl class="terms">
<dt>Delay (latency)</dt><dd>Packet ko network cross karne mein kitna time lagta hai. Yeh <b>serialization</b> (bits ko wire par clock karna), <b>propagation</b> (fibre mein light ki speed), <b>queuing</b> (dusre packets ke peeche wait) aur <b>processing</b> (router ka lookup) ka jod hai. Queuing woh hissa hai jise QoS control kar sakta hai.</dd>
<dt>Jitter</dt><dd>Ek hi flow ke packets ke beech delay ka farq. Agar packet 1 ko 40 ms, packet 2 ko 40 ms aur packet 3 ko 90 ms lage, to average theek hone par bhi jitter bada hai. Voice receivers chhota <b>de-jitter buffer</b> use karte hain, isliye bahut late aaya packet utna hi bekaar hai jitna khoya hua packet.</dd>
<dt>Loss</dt><dd>Jo packets kabhi pahunchte hi nahi, aam taur par kyunki queue full thi (tail drop) ya policer ne discard kar diya. TCP notice karke dobara bhejta hai; live voice call resend ka intezaar nahi kar sakti.</dd>
<dt>Bandwidth</dt><dd>Link ek second mein kitna carry kar sakta hai. QoS ise badhata nahi; jo hai use baantta hai.</dd>
</dl>

<h3>Har traffic ko kya chahiye</h3>
<div class="tbl"><table>
<tr><th>Traffic</th><th>Example</th><th>One-way delay</th><th>Jitter</th><th>Loss</th><th>Bandwidth</th></tr>
<tr><td>Voice (RTP)</td><td>IP phone call</td><td>150 ms ya kam</td><td>30 ms ya kam</td><td>1% ya kam</td><td>Chhota aur steady: G.711 call ke liye lagbhag 80 se 90 kbps, G.729 ke liye lagbhag 30 kbps</td></tr>
<tr><td>Interactive video</td><td>Teams ya Zoom meeting</td><td>150 ms ya kam</td><td>30 ms ya kam</td><td>1% ya kam</td><td>Bada aur bursty: har stream 1 se 4 Mbps ya zyada</td></tr>
<tr><td>Streaming video</td><td>Recorded training</td><td>Kuch seconds chalte hain</td><td>Buffered</td><td>5% ya kam</td><td>Bada, lekin aage buffer kar sakta hai</td></tr>
<tr><td>Interactive data</td><td>ERP, SSH, web apps</td><td>Users 1 se 2 s ke upar notice karte hain</td><td>Tolerant</td><td>Kam, TCP recover karta hai</td><td>Moderate</td></tr>
<tr><td>Bulk data</td><td>Backups, software updates, SMB copy</td><td>Tolerant</td><td>Tolerant</td><td>TCP recover karta hai</td><td>Jo free hai woh le lega</td></tr>
</table></div>
<p>Contrast dekho. Voice ko bandwidth bahut kam chahiye lekin woh intezaar bardasht nahi karti. Bulk transfers ko bahut bandwidth chahiye lekin ek minute zyada lage to unhe farq nahi padta. Fair queue dono ke saath ek jaisa bartaav karti hai, jo bilkul galat hai. QoS network ko anbarabar zaroorat ke saath anbarabar bartaav karne deta hai.</p>

<div class="eg"><p><b>Worked example.</b> 1500-byte packet 12,000 bits ka hota hai. Serialization delay = bits / link speed: 1 Gbps par 0.012 ms, 10 Mbps par <b>1.2 ms</b>, 1 Mbps par 12 ms, aur 128 kbps link par <b>93.75 ms</b>. Slow link par ek bulk packet ke theek peeche aaya voice packet shuru hone se pehle lagbhag 94 ms wait karta hai, jabki poore path ke liye voice ka budget 150 ms hai. Isliye slow links par QoS sabse zyada matter karta hai. Capacity planning: agar voice 10 Mbps WAN ka lagbhag ek tihai (3.3 Mbps) use kare, aur Ethernet overhead ke saath G.711 call lagbhag 87 kbps leti hai, to link lagbhag 37 calls carry kar sakta hai; usse zyada calls ke liye bandwidth hi badhani padegi, chahe priority kitni bhi achhi ho.</p></div>

<h3>Delay aata kahan se hai?</h3>
<p>Bandwidth, delay aur loss aapas mein jude hain. Full queue pehle delay badhati hai (packets wait karte hain), phir loss (queue overflow hoti hai). Loss bachane ke liye bada buffer lagao to delay badhta hai, yaani muft kuch nahi milta. QoS ka practical maqsad hai: kam lekin zaroori packets ko chhota wait aur queue mein seat dena, aur bulk traffic ko delay aur loss absorb karne dena kyunki woh recover kar sakta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Maan lena ki QoS bandwidth badhata hai: agar link poore din full hai to capacity kharido; QoS un congestion ke liye hai jo aate jaate hain. Sochna ki har uncongested link par QoS matter karta hai: khali queues mein har packet turant nikal jaata hai aur markings se kuch nahi badalta. Jitter bhool jaana: 40 ms average delay ke saath 120 ms tak ke spikes bhi call kharab kar dete hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Voice ke numbers yaad rakho: one-way delay 150 ms ya kam, jitter 30 ms ya kam, loss 1% ya kam. Voice delay aur loss sensitive hai lekin bandwidth kam leti hai; bulk data iska ulta hai. Delay ka sirf queuing hissa QoS shape kar sakta hai. QoS tab lagta hai jab congestion ho; idle link ko tez nahi karta.</p></div>

<div class="scn"><h4>Pune mein 9 baje calls toot-ti hain</h4><p>Har subah nau baje Pune branch calls choppy hone ki shikayat karta tha. WAN graph mein 10 Mbps link lagbhag bees minute 100% tak jaata dikha: sab ke login karte hi laptops OS updates download kar rahe the. 8 baje calls bilkul theek thi, isliye phones, codecs aur cabling problem nahi the. Engineer ne voice ko mark kiya aur use priority queue di (yahi aap is module mein khud banaoge). Updates ka total time same raha, lekin calls saaf rahi.</p><p><b>Seekh:</b> fault short-term congestion tha, jiske liye QoS bana hai. Permanently full link ko zyada bandwidth chahiye.</p></div>

<div class="iv"><p class="q">"Voice bandwidth to kam leti hai, phir QoS kyun chahiye?"</p><p>Kyunki voice wait karne se sensitive hai, size se nahi. Bolo ki voice packet ke aage ek data packet serialization delay badhata hai (128 kbps par 94 ms), jitter aur loss call tod dete hain, aur 150 ms, 30 ms, 1% targets quote karo. Ant mein batao ki QoS voice ko chhota, bounded wait deta hai jabki bulk traffic delay uthata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS tay karta hai ki congested link par kaun wait karega aur kaun drop hoga; yeh bandwidth create nahi karta.</li>
<li>Congestion wahan banta hai jahan fast link ya bahut ports ek slow exit ko feed karte hain, output queue mein.</li>
<li>Chaar characteristics: bandwidth, delay, jitter, loss. Voice targets: 150 ms one-way, 30 ms jitter, 1% loss.</li>
<li>Voice chhoti lekin intolerant hai; bulk data badi lekin tolerant hai. Dono se alag bartaav karo.</li>
<li>Serialization delay = bits / link speed; slow links par bada hota hai aur isiliye wahan QoS sabse zyada matter karta hai.</li>
</ul></div>
`}};export{e as default};