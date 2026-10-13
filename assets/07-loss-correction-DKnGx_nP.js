var e={id:`loss-correction`,h:{en:`Beating loss and latency: FEC, packet duplication and TCP optimization`,hi:`Loss aur latency se ladna: FEC, packet duplication aur TCP optimization`},body:{en:`
<p>AAR moves traffic <i>away</i> from a bad path. But what if both paths are mediocre, or the only decent path has a little loss? Catalyst SD-WAN has data-policy actions that <b>repair</b> the traffic on the path it is using. They are the second half of "application-aware": steer when you can, repair when you must.</p>

<h3>Analogy: sending an important letter</h3>
<p>You can protect an important letter in two ways. Add a short <b>recovery note</b> with every four letters, so that if one is lost the receiver rebuilds it from the other three plus the note: that is <b>forward error correction (FEC)</b>. Or send two <b>photocopies</b> by two different couriers, and the receiver keeps whichever arrives first: that is <b>packet duplication</b>. Both cost extra bandwidth. Both are used on selected traffic, not on everything.</p>

<h3>Forward error correction (FEC)</h3>
<p>For every <b>group of 4 data packets</b> the sender computes one <b>parity packet</b> and sends it too. If the receiver gets at least 3 of the 4 data packets and the parity packet, it can rebuild <b>one</b> lost packet in that group, without any retransmission. The cost is about 25% extra traffic for the protected flows.</p>
<ul>
<li><b>FEC Always</b>: parity packets are sent all the time. Predictable, but the overhead is permanent.</li>
<li><b>FEC Adaptive</b>: parity packets are sent only while the measured loss on the tunnel is above a threshold, and stop when it recovers. Less waste, but protection starts after the edge has detected the loss.</li>
</ul>
<p>FEC is ideal for real-time UDP traffic such as voice and video, where a retransmission arrives too late to be useful. It is configured as a <b>Loss Correction</b> action of a data policy and works for IPv4 traffic over IPv4 tunnels on IOS XE WAN Edges (newer releases add IPv6 combinations).</p>

<h3>Packet duplication</h3>
<p>The sender copies each protected packet onto a <b>second tunnel</b> (an alternate path to the same destination). The receiving edge forwards the first copy and <b>discards the duplicate</b>. It protects against a link that suddenly drops a burst, and against failover gaps. It uses more bandwidth than FEC (a full second copy), so it is reserved for small, critical flows such as signalling or a trading feed. Newer releases prefer a duplicate tunnel with a <b>different local color</b>, so the two copies really take different transports.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! on VSMART: protect voice with adaptive FEC</span>
policy
 data-policy DP-PUNE
  vpn-list CORP
   sequence 10
    match
     app-list VOICE-APPS
    action accept
     count VOICE-FEC
     loss-protect fec-adaptive
   default-action accept

<span class="c">! alternative for a critical low-rate flow</span>
   sequence 15
    match
     destination-port 5060
     protocol 17
    action accept
     loss-protect packet-duplication</pre>
<p>In Manager this is the <b>Loss Correction</b> action in the Traffic Data Policy (QoS sequence type) with the choices FEC Adaptive, FEC Always and Packet Duplication. Packet duplication cannot be combined with a local or remote TLOC action in the same sequence, and both ends of the tunnel must be IOS XE WAN Edges running compatible releases.</p>

<h3>Verification</h3>
<pre class="out">E-BR1# show sdwan tunnel statistics fec
tunnel stats ipsec 203.0.113.10 203.0.113.6 12346 12346
 fec-tx-data-pkts      52110
 <span class="hl">fec-tx-parity-pkts    13027</span>
 fec-rx-data-pkts      51873
 fec-rx-parity-pkts    12968
 <span class="hl">fec-reconstruct-pkts   142</span>

E-BR1# show sdwan tunnel statistics pkt-dup
 pktdup-tx             8321
 pktdup-rx-fwd         8302</pre>
<p>Parity packets are roughly one quarter of the data packets, as the design says. A non-zero <code>fec-reconstruct-pkts</code> is the proof: that many lost packets were rebuilt and the user never noticed. Note that these counters are a CLI feature; do not expect them in the Manager dashboards.</p>

<h3>TCP optimization</h3>
<p>Not all pain is loss. A TCP session between Pune and a cloud SaaS application over a long, slightly lossy path is slow because TCP's window grows slowly and every loss halves it. <b>TCP optimization</b> makes the WAN Edge act as a <b>TCP proxy</b>: it terminates the client's TCP session locally, carries the data over an optimised leg, and opens a second session towards the server. Throughput improves on long-distance links and for SaaS. The data-policy action <code>tcp-optimization</code> selects which flows to optimise. It needs the AppQoE service on the router (a service node with enough memory; commonly at least 16 GB DRAM on supported platforms), so it is a platform decision as well as a policy decision.</p>

<h3>Choosing the right tool</h3>
<table class="cmp"><tr><th>Symptom</th><th>Best tool</th></tr>
<tr><td>One transport is bad, another is good</td><td>App-route policy with SLA class</td></tr>
<tr><td>Small steady loss on real-time traffic, no better path</td><td>FEC (adaptive or always)</td></tr>
<tr><td>Link failover glitches on a critical small flow</td><td>Packet duplication</td></tr>
<tr><td>Slow bulk TCP over a long path</td><td>TCP optimization</td></tr>
<tr><td>Voice stuttering because bulk data fills the queue</td><td>QoS (queues, shaping) in the next module</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling FEC Always or duplication for everything and paying double bandwidth on a link that was already tight. (2) Expecting loss correction to fix <i>latency</i> or <i>jitter</i>; it only repairs loss. (3) Combining packet duplication with a TLOC-setting action in one sequence. (4) Forgetting that the far-end edge must support the same feature.</p></div>

<div class="exam"><p><b>Exam trap.</b> FEC recovers <b>one lost packet per group</b> using a parity packet (it sends extra packets, no retransmission). Packet duplication sends the <b>whole packet twice</b> over two tunnels and the receiver drops the extra copy. If the question says "a single transport with 2% loss, real-time traffic", FEC is the answer; "avoid a gap during failover", duplication.</p></div>

<div class="scn"><h4>The 2% loss that nobody could fix</h4><p>A small Bharat Retail kiosk site in Nashik had only a broadband link with steady 2% loss, so AAR had nothing to move to. Voice calls were choppy. The ISP would not fix the line for weeks. The engineer added a data policy sequence for the voice app-list with <code>loss-protect fec-adaptive</code> and applied it from-service to the Nashik site. The FEC counters showed parity packets being sent and hundreds of packets reconstructed per hour, and the calls became clear. After the ISP finally repaired the line, adaptive FEC quietly stopped sending parity packets.</p><p><b>Lesson:</b> when you cannot move the traffic, repair it. Adaptive FEC costs bandwidth only while loss exists.</p></div>

<div class="iv"><p class="q">"What is the difference between FEC and packet duplication in SD-WAN, and when would you use each?"</p><p>FEC sends one parity packet per group of four, so one lost packet per group can be rebuilt; overhead is about 25%, and adaptive mode only runs when loss is detected. Packet duplication copies each packet onto another tunnel and drops the extra at the receiver; overhead is 100% for the protected flow, so use it for small critical flows. Use FEC for real-time traffic on a lossy single path, duplication to hide failovers, and AAR when a better path exists.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loss correction is a data-policy action (loss-protect): fec-adaptive, fec-always or packet-duplication.</li>
<li>FEC adds one parity packet per 4 data packets and can rebuild one lost packet per group; adaptive mode starts only when loss is detected.</li>
<li>Packet duplication sends a full second copy over another tunnel; the receiver discards the duplicate.</li>
<li>TCP optimization turns the edge into a TCP proxy and needs the AppQoE service and enough memory.</li>
<li>Check <code>show sdwan tunnel statistics fec</code> and <code>pkt-dup</code>; steer when you can, repair when you must.</li>
</ul></div>
`,hi:`
<p>AAR traffic ko kharab path se <i>door</i> le jaata hai. Lekin agar dono paths average hon, ya jo ek achcha path hai usme thoda loss ho, tab? Catalyst SD-WAN ke paas data-policy actions hain jo traffic ko usi path par jo woh use kar raha hai <b>repair</b> karte hain. Yeh "application-aware" ka doosra hissa hai: jab ho sake steer karo, jab zaroori ho repair karo.</p>

<h3>Analogy: zaroori letter bhejna</h3>
<p>Zaroori letter ko aap do tareekon se protect kar sakte ho. Har chaar letters ke saath ek chhota <b>recovery note</b> jod do, taaki agar ek kho jaaye to receiver baaki teen aur note se use rebuild kar le: yeh <b>forward error correction (FEC)</b> hai. Ya do <b>photocopies</b> do alag couriers se bhejo, aur receiver jo pehle aaye woh rakh le: yeh <b>packet duplication</b> hai. Dono extra bandwidth lete hain. Dono chune hue traffic par use hote hain, sab par nahi.</p>

<h3>Forward error correction (FEC)</h3>
<p>Har <b>4 data packets ke group</b> ke liye sender ek <b>parity packet</b> compute karke woh bhi bhejta hai. Agar receiver ko 4 mein se kam se kam 3 data packets aur parity packet mil jaayein, to woh us group ka <b>ek</b> lost packet bina retransmission ke rebuild kar leta hai. Keemat protected flows par lagbhag 25% extra traffic hai.</p>
<ul>
<li><b>FEC Always</b>: parity packets hamesha bheje jaate hain. Predictable, lekin overhead permanent.</li>
<li><b>FEC Adaptive</b>: parity packets sirf tab bheje jaate hain jab tunnel par measured loss threshold se upar ho, aur recover hone par band ho jaate hain. Kam waste, lekin protection tab shuru hoti hai jab edge loss detect kar chuka ho.</li>
</ul>
<p>FEC voice aur video jaise real-time UDP traffic ke liye ideal hai, jahan retransmission bahut der se aata hai. Yeh data policy ke <b>Loss Correction</b> action ke roop mein configure hota hai aur IOS XE WAN Edges par IPv4 over IPv4 tunnels ke liye kaam karta hai (naye releases IPv6 combinations jodte hain).</p>

<h3>Packet duplication</h3>
<p>Sender har protected packet ko <b>doosre tunnel</b> (usi destination ka alternate path) par bhi copy karta hai. Receiving edge pehli copy forward karta hai aur <b>duplicate discard</b> kar deta hai. Yeh us link se bachata hai jo achanak burst drop kare, aur failover gaps se bhi. Yeh FEC se zyada bandwidth leta hai (poori doosri copy), isliye chhote, critical flows jaise signalling ya trading feed ke liye reserve hai. Naye releases <b>alag local color</b> wala duplicate tunnel prefer karte hain, taaki dono copies sach mein alag transports se jaayein.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! on VSMART: protect voice with adaptive FEC</span>
policy
 data-policy DP-PUNE
  vpn-list CORP
   sequence 10
    match
     app-list VOICE-APPS
    action accept
     count VOICE-FEC
     loss-protect fec-adaptive
   default-action accept

<span class="c">! alternative for a critical low-rate flow</span>
   sequence 15
    match
     destination-port 5060
     protocol 17
    action accept
     loss-protect packet-duplication</pre>
<p>Manager mein yeh Traffic Data Policy (QoS sequence type) ka <b>Loss Correction</b> action hai, jisme FEC Adaptive, FEC Always aur Packet Duplication ke choices hain. Packet duplication ko ek hi sequence mein local ya remote TLOC action ke saath combine nahi kar sakte, aur tunnel ke dono ends compatible releases wale IOS XE WAN Edges hone chahiye.</p>

<h3>Verification</h3>
<pre class="out">E-BR1# show sdwan tunnel statistics fec
tunnel stats ipsec 203.0.113.10 203.0.113.6 12346 12346
 fec-tx-data-pkts      52110
 <span class="hl">fec-tx-parity-pkts    13027</span>
 fec-rx-data-pkts      51873
 fec-rx-parity-pkts    12968
 <span class="hl">fec-reconstruct-pkts   142</span>

E-BR1# show sdwan tunnel statistics pkt-dup
 pktdup-tx             8321
 pktdup-rx-fwd         8302</pre>
<p>Parity packets data packets ka lagbhag ek chauthai hain, jaisa design kehta hai. Non-zero <code>fec-reconstruct-pkts</code> saboot hai: itne lost packets rebuild hue aur user ko pata bhi nahi chala. Dhyan rahe, yeh counters CLI feature hain; Manager dashboards mein unki ummeed mat rakho.</p>

<h3>TCP optimization</h3>
<p>Har dard loss nahi hota. Pune aur cloud SaaS application ke beech lambe, thode lossy path par TCP session isliye slow hota hai kyunki TCP ki window dheere badhti hai aur har loss use aadha kar deta hai. <b>TCP optimization</b> WAN Edge ko <b>TCP proxy</b> banata hai: woh client ka TCP session locally terminate karta hai, data optimised leg par le jaata hai, aur server ki taraf doosra session kholta hai. Lambi distance ke links aur SaaS par throughput badhta hai. Data-policy action <code>tcp-optimization</code> chunta hai ki kaunse flows optimise hon. Ise router par AppQoE service chahiye (kaafi memory wala service node; supported platforms par aam taur par kam se kam 16 GB DRAM), isliye yeh policy ke saath saath platform ka decision bhi hai.</p>

<h3>Sahi tool chunna</h3>
<table class="cmp"><tr><th>Symptom</th><th>Best tool</th></tr>
<tr><td>Ek transport kharab hai, doosra achcha</td><td>SLA class wali app-route policy</td></tr>
<tr><td>Real-time traffic par chhota steady loss, behtar path nahi</td><td>FEC (adaptive ya always)</td></tr>
<tr><td>Critical chhote flow par link failover ke glitches</td><td>Packet duplication</td></tr>
<tr><td>Lambe path par slow bulk TCP</td><td>TCP optimization</td></tr>
<tr><td>Bulk data queue bharne se voice stutter</td><td>QoS (queues, shaping), agle module mein</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) Sab kuch par FEC Always ya duplication on karna aur pehle se tight link par double bandwidth dena. (2) Loss correction se <i>latency</i> ya <i>jitter</i> theek hone ki ummeed rakhna; woh sirf loss repair karta hai. (3) Packet duplication ko ek hi sequence mein TLOC-setting action ke saath combine karna. (4) Yeh bhool jaana ki far-end edge ko bhi wahi feature support karna chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> FEC parity packet se <b>ek group mein ek lost packet</b> recover karta hai (extra packets bhejta hai, retransmission nahi). Packet duplication <b>poora packet do baar</b> do tunnels par bhejta hai aur receiver extra copy drop kar deta hai. Agar sawaal kahe "ek single transport par 2% loss, real-time traffic", to jawab FEC; "failover ke dauran gap se bachna", to duplication.</p></div>

<div class="scn"><h4>2% loss jise koi theek nahi kar paaya</h4><p>Bharat Retail ki Nashik ki chhoti kiosk site ke paas sirf ek broadband link tha jisme steady 2% loss tha, isliye AAR ke paas move karne ko kuch nahi tha. Voice calls choppy thi. ISP hafton tak line theek nahi kar raha tha. Engineer ne voice app-list ke liye <code>loss-protect fec-adaptive</code> wala data policy sequence joda aur Nashik site par from-service apply kiya. FEC counters mein parity packets jaate dikhe aur ghante mein sainkdon packets reconstruct hue, aur calls saaf ho gayi. ISP ke line theek karne ke baad adaptive FEC ne chupchaap parity packets bhejna band kar diya.</p><p><b>Lesson:</b> jab traffic move nahi kar sakte, to use repair karo. Adaptive FEC bandwidth tabhi leta hai jab loss ho.</p></div>

<div class="iv"><p class="q">"SD-WAN mein FEC aur packet duplication mein kya difference hai, aur kab kaunsa use karoge?"</p><p>FEC har chaar ke group ke liye ek parity packet bhejta hai, to group ka ek lost packet rebuild ho sakta hai; overhead lagbhag 25%, aur adaptive mode tabhi chalta hai jab loss detect ho. Packet duplication har packet ko doosre tunnel par copy karta hai aur receiver extra drop karta hai; protected flow ke liye overhead 100%, isliye chhote critical flows ke liye. Lossy single path par real-time traffic ke liye FEC, failovers chhupane ke liye duplication, aur behtar path exist kare to AAR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loss correction data-policy action (loss-protect) hai: fec-adaptive, fec-always ya packet-duplication.</li>
<li>FEC har 4 data packets par ek parity packet jodta hai aur group ka ek lost packet rebuild kar sakta hai; adaptive mode tabhi shuru hota hai jab loss detect ho.</li>
<li>Packet duplication doosre tunnel par poori copy bhejta hai; receiver duplicate discard karta hai.</li>
<li>TCP optimization edge ko TCP proxy banata hai aur AppQoE service aur kaafi memory chahiye.</li>
<li><code>show sdwan tunnel statistics fec</code> aur <code>pkt-dup</code> check karo; jab ho sake steer karo, jab zaroori ho repair karo.</li>
</ul></div>
`}};export{e as default};