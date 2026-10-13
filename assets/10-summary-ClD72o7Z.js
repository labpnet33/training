var e={id:`summary`,h:{en:`Summary, exam traps and cheat sheet`,hi:`Summary, exam traps aur cheat sheet`},body:{en:`
<p>Before an exam, a good pilot runs a checklist, not a memory test. This chapter is that checklist for topic 4.7: the whole story on one page, the numbers you must know cold, the traps that cost marks, and the commands that prove a policy works. Read it the night before and again in the corridor.</p>

<h3>The whole story in six sentences</h3>
<ol>
<li>A link has finite bandwidth, so when traffic arrives faster than it can leave, packets queue, wait and get dropped: delay, jitter and loss.</li>
<li>Voice needs 150 ms one-way delay or less, 30 ms jitter or less and 1% loss or less; bulk data can wait and recover.</li>
<li>DiffServ sorts traffic into classes, marks it (CoS at Layer 2, DSCP at Layer 3) and every router applies a per-hop behavior to the mark.</li>
<li>Classify and mark at the edge, at the trust boundary; inside the network just read the mark.</li>
<li>On the congested output interface, queuing (CBWFQ guarantees bandwidth, LLQ adds a policed priority queue for voice) decides who goes first; WRED drops early; policing drops or re-marks excess; shaping buffers it.</li>
<li>You configure it with MQC (class-map, policy-map, service-policy) and prove it with <code>show policy-map interface</code>.</li>
</ol>

<h3>Cheat sheet: values and numbers</h3>
<div class="tbl"><table>
<tr><th>Item</th><th>Value</th></tr>
<tr><td>Voice targets</td><td>One-way delay 150 ms or less, jitter 30 ms or less, loss 1% or less</td></tr>
<tr><td>CoS</td><td>3 bits in the 802.1Q tag, 0 to 7, Layer 2, trunks only</td></tr>
<tr><td>IP Precedence</td><td>First 3 bits of the ToS byte, 0 to 7</td></tr>
<tr><td>DSCP</td><td>First 6 bits of the ToS byte, 0 to 63; ECN is the last 2 bits</td></tr>
<tr><td>Voice bearer</td><td>EF = 46 = 101110 = ToS 184 (0xB8), CoS 5</td></tr>
<tr><td>Call signalling</td><td>CS3 = 24</td></tr>
<tr><td>Interactive video</td><td>AF41 = 34</td></tr>
<tr><td>Network control</td><td>CS6 = 48</td></tr>
<tr><td>Default</td><td>0</td></tr>
<tr><td>AF formula</td><td>DSCP = 8 x class + 2 x drop precedence; AFx3 is dropped first</td></tr>
<tr><td>ToS byte to DSCP</td><td>Divide by 4</td></tr>
<tr><td>Priority queue size</td><td>Keep it to about one third of the link, voice only</td></tr>
<tr><td>Default police Bc</td><td>CIR / 32 bytes (3 Mbps gives 93,750)</td></tr>
</table></div>

<h3>Cheat sheet: which tool for which job</h3>
<div class="tbl"><table>
<tr><th>Goal</th><th>Tool</th><th>MQC</th><th>Direction</th></tr>
<tr><td>Decide what a packet is</td><td>Classification</td><td><code>class-map</code>, <code>match</code></td><td>Input mainly</td></tr>
<tr><td>Write a value into the packet</td><td>Marking</td><td><code>set dscp</code></td><td>Input at the edge</td></tr>
<tr><td>Guarantee minimum bandwidth</td><td>CBWFQ</td><td><code>bandwidth</code></td><td>Output</td></tr>
<tr><td>Give voice low delay</td><td>LLQ</td><td><code>priority</code></td><td>Output</td></tr>
<tr><td>Fair sharing of the rest</td><td>WFQ</td><td><code>fair-queue</code></td><td>Output</td></tr>
<tr><td>Avoid TCP synchronisation</td><td>WRED</td><td><code>random-detect</code></td><td>Output</td></tr>
<tr><td>Enforce a limit, drop or re-mark excess</td><td>Policing</td><td><code>police</code></td><td>Input or output</td></tr>
<tr><td>Smooth traffic to a contract rate</td><td>Shaping</td><td><code>shape average</code></td><td>Output</td></tr>
</table></div>

<h3>The final configuration, as the router stores it</h3>
<p>The branch policy from chapter 8 looks like this in the running configuration. This is the block you would copy to another router.</p>
<pre class="code">R1# show running-config | section policy-map</pre>
<pre class="out">policy-map MARK-IN
 class VOICE
  set dscp ef
 class BULK
  police cir 3000000
    conform-action transmit 
    exceed-action drop 
  set dscp af11
 class class-default
  set dscp default
policy-map WAN-OUT
 class EF-Q
  priority 1000
 class AF11-Q
  bandwidth 2000
 class class-default
  fair-queue</pre>

<div class="eg"><p><b>Worked example: 60-second self-test.</b> Question: "A router receives a packet with ToS 0xB8 and has an LLQ with a class matching DSCP 46 and priority 500. The voice offered is 900 kbps on a congested link. What happens?" Answer: 0xB8 = 184, divide by 4, DSCP 46 = EF, so it goes into the priority queue. The queue is policed to 500 kbps during congestion, so about 400 kbps worth of packets are dropped and the counter <code>b/w exceed drops</code> grows; the rest leaves first, with minimal delay. The fix is to raise the priority rate or reduce the calls, not to remove the policer.</p></div>

<h3>Exam traps, all in one place</h3>
<ul>
<li><b>Policing vs shaping</b>: policing drops or re-marks and can be inbound or outbound; shaping buffers, adds delay and is outbound only.</li>
<li><b>Queuing is output only</b>; classification and marking happen mostly on input.</li>
<li><b>CBWFQ vs LLQ</b>: CBWFQ guarantees bandwidth; LLQ adds a strict priority queue for low delay, and polices it to avoid starvation.</li>
<li><b>ACL in a class-map</b> selects traffic; permit means "in the class", nothing is blocked.</li>
<li><b>match-all is AND, match-any is OR</b>; the default is match-all.</li>
<li><b>CoS does not cross a router</b>; DSCP does (unless a hop rewrites it).</li>
<li><b>EF is 46, not 40</b>; CS5 is 40. CS3 is 24 and AF41 is 34.</li>
<li><b>AF drop precedence</b>: higher number, dropped first. AF class number alone is not priority.</li>
<li><b>QoS only matters under congestion</b>; it does not add bandwidth.</li>
<li><b>DiffServ is per hop</b>; every router needs a policy, or the mark is wasted.</li>
<li>A policy that is not <b>attached</b> does nothing; verify with <code>show policy-map interface</code>.</li>
<li>Do not put video or bulk into the priority queue.</li>
</ul>

<div class="warn"><p><b>Common mistakes on the exam.</b> Choosing "increase the bandwidth" when the question describes bursts (QoS is the answer) or choosing QoS when the link is always full (capacity is the answer). Picking policing because the question says "smooth" or "buffer". Confusing the trust boundary with the firewall. Forgetting that WRED is for TCP, not voice.</p></div>

<div class="exam"><p><b>CCNA 200-301 v2.0 note.</b> From 3 February 2027 the exam is more troubleshooting-heavy. For QoS that means reading <code>show policy-map interface</code> output and spotting the fault: wrong direction, class with zero packets, drops in the wrong class, or a priority rate smaller than the voice load. Practise reading counters, not just writing configuration.</p></div>

<div class="scn"><h4>The interview that turned on one command</h4><p>A candidate was asked: "Calls are bad every evening and the QoS config looks right. What is your first command?" He answered <code>show policy-map interface</code> on the WAN output port and explained that he would look at the EF class counters: zero means the mark is not arriving, drops with "b/w exceed" mean the priority rate is too small, and a clean EF class with a full class-default means QoS is working and the problem is elsewhere. He was hired on that answer alone.</p><p><b>Lesson:</b> a command plus how you read its output beats a memorised definition.</p></div>

<div class="iv"><p class="q">"Summarise QoS in one minute."</p><p>Say: links get congested; QoS decides who waits. We classify and mark at the trust boundary with DSCP, EF for voice. On the congested output we use LLQ with a policed priority queue for voice, CBWFQ for guaranteed bandwidth and fair queue for the rest, and WRED to drop early for TCP. Policing limits and re-marks, shaping smooths to the contract rate. We configure with MQC and verify with show policy-map interface and test traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the story: congestion, class, mark, queue, police or shape, verify.</li>
<li>Know the numbers: voice 150 ms, 30 ms, 1%; EF 46, CS3 24, AF41 34, CS6 48; ToS = DSCP x 4; AF = 8x + 2y.</li>
<li>Know the directions: queue and shape on output; mark and classify on input; police on either.</li>
<li>Know the proof: <code>show policy-map interface</code> and a traffic test.</li>
<li>ENCOR goes deeper into hierarchical QoS, WRED tuning and wireless QoS. SD-WAN and cloud QoS reuse these same ideas.</li>
</ul></div>
`,hi:`
<p>Exam se pehle achha pilot checklist chalata hai, memory test nahi. Yeh chapter topic 4.7 ki wahi checklist hai: poori kahani ek page par, woh numbers jo aapko ratne hain, woh traps jo marks khaate hain, aur woh commands jo policy ka kaam karna sabit karte hain. Ise raat se pehle padho aur corridor mein phir se.</p>

<h3>Poori kahani chhe sentences mein</h3>
<ol>
<li>Link ki bandwidth limited hai, isliye jab traffic nikalne se tez aata hai, packets queue mein rukte hain, wait karte hain aur drop hote hain: delay, jitter aur loss.</li>
<li>Voice ko 150 ms ya kam one-way delay, 30 ms ya kam jitter aur 1% ya kam loss chahiye; bulk data wait aur recover kar sakta hai.</li>
<li>DiffServ traffic ko classes mein baanta hai, mark karta hai (Layer 2 par CoS, Layer 3 par DSCP) aur har router mark par per-hop behavior lagata hai.</li>
<li>Edge par, trust boundary par classify aur mark karo; network ke andar bas mark padho.</li>
<li>Congested output interface par queuing (CBWFQ bandwidth guarantee karta hai, LLQ voice ke liye police hui priority queue jodta hai) tay karti hai kaun pehle jaaye; WRED jaldi drop karta hai; policing excess ko drop ya re-mark karti hai; shaping use buffer karti hai.</li>
<li>Ise MQC (class-map, policy-map, service-policy) se configure karte ho aur <code>show policy-map interface</code> se sabit karte ho.</li>
</ol>

<h3>Cheat sheet: values aur numbers</h3>
<div class="tbl"><table>
<tr><th>Item</th><th>Value</th></tr>
<tr><td>Voice targets</td><td>One-way delay 150 ms ya kam, jitter 30 ms ya kam, loss 1% ya kam</td></tr>
<tr><td>CoS</td><td>802.1Q tag ke 3 bits, 0 se 7, Layer 2, sirf trunks</td></tr>
<tr><td>IP Precedence</td><td>ToS byte ke pehle 3 bits, 0 se 7</td></tr>
<tr><td>DSCP</td><td>ToS byte ke pehle 6 bits, 0 se 63; ECN aakhri 2 bits</td></tr>
<tr><td>Voice bearer</td><td>EF = 46 = 101110 = ToS 184 (0xB8), CoS 5</td></tr>
<tr><td>Call signalling</td><td>CS3 = 24</td></tr>
<tr><td>Interactive video</td><td>AF41 = 34</td></tr>
<tr><td>Network control</td><td>CS6 = 48</td></tr>
<tr><td>Default</td><td>0</td></tr>
<tr><td>AF formula</td><td>DSCP = 8 x class + 2 x drop precedence; AFx3 pehle drop</td></tr>
<tr><td>ToS byte se DSCP</td><td>4 se bhaag do</td></tr>
<tr><td>Priority queue size</td><td>Link ke lagbhag ek tihai tak, sirf voice</td></tr>
<tr><td>Default police Bc</td><td>CIR / 32 bytes (3 Mbps ka 93,750)</td></tr>
</table></div>

<h3>Cheat sheet: kaunsa tool kaunsa kaam</h3>
<div class="tbl"><table>
<tr><th>Goal</th><th>Tool</th><th>MQC</th><th>Direction</th></tr>
<tr><td>Tay karna packet kya hai</td><td>Classification</td><td><code>class-map</code>, <code>match</code></td><td>Mainly input</td></tr>
<tr><td>Packet mein value likhna</td><td>Marking</td><td><code>set dscp</code></td><td>Edge par input</td></tr>
<tr><td>Minimum bandwidth guarantee</td><td>CBWFQ</td><td><code>bandwidth</code></td><td>Output</td></tr>
<tr><td>Voice ko low delay</td><td>LLQ</td><td><code>priority</code></td><td>Output</td></tr>
<tr><td>Baaki ka fair sharing</td><td>WFQ</td><td><code>fair-queue</code></td><td>Output</td></tr>
<tr><td>TCP synchronisation se bachna</td><td>WRED</td><td><code>random-detect</code></td><td>Output</td></tr>
<tr><td>Limit enforce, excess drop ya re-mark</td><td>Policing</td><td><code>police</code></td><td>Input ya output</td></tr>
<tr><td>Traffic ko contract rate tak smooth karna</td><td>Shaping</td><td><code>shape average</code></td><td>Output</td></tr>
</table></div>

<h3>Final configuration, router jaise store karta hai</h3>
<p>Chapter 8 ki branch policy running configuration mein aisi dikhti hai. Yahi block aap doosre router par copy karoge.</p>
<pre class="code">R1# show running-config | section policy-map</pre>
<pre class="out">policy-map MARK-IN
 class VOICE
  set dscp ef
 class BULK
  police cir 3000000
    conform-action transmit 
    exceed-action drop 
  set dscp af11
 class class-default
  set dscp default
policy-map WAN-OUT
 class EF-Q
  priority 1000
 class AF11-Q
  bandwidth 2000
 class class-default
  fair-queue</pre>

<div class="eg"><p><b>Worked example: 60-second self-test.</b> Sawaal: "Router ko ToS 0xB8 wala packet milta hai aur uska LLQ hai jisme DSCP 46 match karne wali class mein priority 500 hai. Congested link par voice 900 kbps offered hai. Kya hota hai?" Jawab: 0xB8 = 184, 4 se bhaag do, DSCP 46 = EF, isliye woh priority queue mein jaata hai. Queue congestion mein 500 kbps par police hoti hai, isliye lagbhag 400 kbps ke packets drop hote hain aur <code>b/w exceed drops</code> counter badhta hai; baaki minimal delay ke saath pehle nikalta hai. Fix hai priority rate badhana ya calls kam karna, policer hatana nahi.</p></div>

<h3>Exam traps, ek jagah</h3>
<ul>
<li><b>Policing vs shaping</b>: policing drop ya re-mark karti hai aur inbound ya outbound ho sakti hai; shaping buffer karti hai, delay jodti hai aur sirf outbound hai.</li>
<li><b>Queuing sirf output mein</b>; classification aur marking zyada tar input par.</li>
<li><b>CBWFQ vs LLQ</b>: CBWFQ bandwidth guarantee karta hai; LLQ low delay ke liye strict priority queue jodta hai, aur starvation rokne ke liye use police karta hai.</li>
<li><b>Class-map mein ACL</b> traffic chunta hai; permit ka matlab "class mein", kuch block nahi hota.</li>
<li><b>match-all AND hai, match-any OR hai</b>; default match-all hai.</li>
<li><b>CoS router paar nahi karta</b>; DSCP karta hai (jab tak koi hop rewrite na kare).</li>
<li><b>EF 46 hai, 40 nahi</b>; CS5 40 hai. CS3 24 aur AF41 34.</li>
<li><b>AF drop precedence</b>: bada number, pehle drop. Akela AF class number priority nahi.</li>
<li><b>QoS sirf congestion mein matter karta hai</b>; bandwidth nahi badhata.</li>
<li><b>DiffServ per hop hai</b>; har router ko policy chahiye, warna mark bekaar.</li>
<li><b>Attach</b> na ki gayi policy kuch nahi karti; <code>show policy-map interface</code> se verify karo.</li>
<li>Priority queue mein video ya bulk mat daalo.</li>
</ul>

<div class="warn"><p><b>Exam mein common galtiyan.</b> Jab sawaal bursts bataye (QoS jawab hai) tab "bandwidth badhao" chunna, ya link hamesha full ho (capacity jawab hai) tab QoS chunna. Sawaal "smooth" ya "buffer" kahe tab policing chunna. Trust boundary ko firewall se confuse karna. Bhool jaana ki WRED TCP ke liye hai, voice ke liye nahi.</p></div>

<div class="exam"><p><b>CCNA 200-301 v2.0 note.</b> 3 February 2027 se exam troubleshooting-heavy hai. QoS ke liye iska matlab hai <code>show policy-map interface</code> ka output padhna aur fault pehchanna: galat direction, zero packets wali class, galat class mein drops, ya voice load se chhota priority rate. Sirf configuration likhne ki nahi, counters padhne ki practice karo.</p></div>

<div class="scn"><h4>Interview jo ek command par tika</h4><p>Ek candidate se pucha gaya: "Har shaam calls kharab hain aur QoS config sahi dikhti hai. Aapka pehla command kya hoga?" Usne WAN output port par <code>show policy-map interface</code> bola aur samjhaya ki woh EF class counters dekhega: zero matlab mark aa hi nahi raha, "b/w exceed" ke saath drops matlab priority rate chhota hai, aur saaf EF class ke saath full class-default matlab QoS kaam kar rahi hai aur problem kahin aur hai. Sirf is jawab par use select kar liya gaya.</p><p><b>Seekh:</b> command aur uska output padhne ka tareeka, ratti hui definition se behtar hai.</p></div>

<div class="iv"><p class="q">"QoS ek minute mein summarise karo."</p><p>Bolo: links congested hote hain; QoS tay karta hai kaun wait kare. Trust boundary par DSCP se classify aur mark karte hain, voice ke liye EF. Congested output par voice ke liye police hui priority queue wala LLQ, guaranteed bandwidth ke liye CBWFQ aur baaki ke liye fair queue, aur TCP ke liye jaldi drop karne ko WRED. Policing limit aur re-mark karti hai, shaping contract rate tak smooth karti hai. MQC se configure aur show policy-map interface aur test traffic se verify karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kahani jaano: congestion, class, mark, queue, police ya shape, verify.</li>
<li>Numbers jaano: voice 150 ms, 30 ms, 1%; EF 46, CS3 24, AF41 34, CS6 48; ToS = DSCP x 4; AF = 8x + 2y.</li>
<li>Directions jaano: output par queue aur shape; input par mark aur classify; police dono par.</li>
<li>Saboot jaano: <code>show policy-map interface</code> aur traffic test.</li>
<li>ENCOR hierarchical QoS, WRED tuning aur wireless QoS mein aur gehra jaata hai. SD-WAN aur cloud QoS yahi ideas dobara use karte hain.</li>
</ul></div>
`}};export{e as default};