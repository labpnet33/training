var e={id:`llq`,h:{en:`LLQ: priority, the implicit policer and why to size it`,hi:`LLQ: priority, implicit policer aur size kyun sochna chahiye`},body:{en:`
<p>CBWFQ guarantees bandwidth, but voice needs something else as well: <b>low delay and low jitter</b>. A call is made of small packets sent every 20 milliseconds, and the listener hears every wait. <b>Low Latency Queuing (LLQ)</b> solves this by adding one <b>strict-priority queue</b> to CBWFQ. Packets in that queue are always sent first. You switch it on with a single command: <code>priority</code>.</p>

<h3>Think of the airport fast lane</h3>
<p>At an airport, business-class passengers use a fast lane and walk straight to security. If every passenger were allowed into it, the fast lane would be as slow as the normal one, and economy passengers would never be screened. So airports limit the lane: it is only for a few people per minute, and anyone above that number goes back to the ordinary line. LLQ works the same way. Voice enters a fast lane, but the lane has a <b>speed limit</b>, so it can never take the whole link.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="LLQ: priority queue served first, CBWFQ queues share the rest">
<rect x="10" y="14" width="140" height="34" rx="6" fill="#ddd6fe"/><text x="80" y="36" text-anchor="middle" class="svg-ink" font-size="13">VOICE-Q  EF</text>
<rect x="10" y="74" width="140" height="34" rx="6" fill="#fde68a"/><text x="80" y="96" text-anchor="middle" class="svg-ink" font-size="13">ERP-Q  AF21</text>
<rect x="10" y="122" width="140" height="34" rx="6" fill="#e2e8f0"/><text x="80" y="144" text-anchor="middle" class="svg-ink" font-size="13">class-default</text>
<rect x="190" y="8" width="90" height="46" rx="6" fill="#fecaca"/><text x="235" y="28" text-anchor="middle" class="svg-ink" font-size="12">policer</text><text x="235" y="44" text-anchor="middle" class="svg-muted" font-size="11">1000 kbps</text>
<path d="M150 31 H190 M280 31 H340 M150 91 H340 M150 139 H340" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="340" y="8" width="130" height="150" rx="10" fill="#bae6fd"/><text x="405" y="34" text-anchor="middle" class="svg-ink" font-size="13">Scheduler</text>
<text x="405" y="62" text-anchor="middle" class="svg-accent" font-size="12">1. priority first</text><text x="405" y="90" text-anchor="middle" class="svg-muted" font-size="12">2. then CBWFQ</text><text x="405" y="108" text-anchor="middle" class="svg-muted" font-size="12">by weight</text>
<path d="M470 83 H520" stroke="#64748b" stroke-width="6" fill="none"/>
<rect x="520" y="55" width="110" height="56" rx="10" fill="#bbf7d0"/><text x="575" y="80" text-anchor="middle" class="svg-ink" font-size="13">WAN</text><text x="575" y="98" text-anchor="middle" class="svg-muted" font-size="11">10000 kbps</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">excess EF above 1000 kbps is dropped while the link is congested</text>
</svg><p class="cap">The priority queue is served first but capped by its own policer, so it cannot starve the other classes.</p></div>

<h3>Configuring the priority class</h3>
<pre class="code">class-map match-any VOICE-Q
 match dscp ef
policy-map WAN-LLQ
 class VOICE-Q
  priority 1000
 class ERP-Q
  bandwidth percent 40
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output WAN-LLQ</pre>
<p>Three forms are available: <code>priority 1000</code> (kbps), <code>priority percent 10</code> (percent of the interface bandwidth) and plain <code>priority</code> (no rate). You can add a burst in bytes, for example <code>priority 1000 25000</code>; the default burst is about 200 ms of the rate, which for 1000 kbps is 25,000 bytes. A class with <code>priority</code> cannot also have <code>bandwidth</code>: the priority rate already is its guarantee and its ceiling. The simulator refuses the second command:</p>
<pre class="out">R1(config-pmap-c)# bandwidth percent 10
<span class="hl">% Remove the priority command from this class before configuring bandwidth</span></pre>

<h3>The implicit policer</h3>
<p>When you give the priority class a rate, IOS adds a <b>policer</b> in front of it. During <b>congestion</b>, traffic in the class above the configured rate is dropped, so the other classes keep their guarantees. When the link is <b>not</b> congested, the priority class may use more than its rate, because nobody else needs the bandwidth. This is called <b>conditional policing</b>. Two consequences follow. First, a test that shows voice exceeding its rate on an idle link proves nothing. Second, to see the policer work you must keep a second bulk flow running so that the link is full.</p>

<h3>Why you must size the priority class</h3>
<p>If the priority queue had no limit, a faulty or unmarked sender could fill it, as the old <b>PQ</b> did, and every other class would starve. Rate-limiting it protects the rest. But the rate must also be big enough: if the voice you carry is larger than the rate, <b>the voice itself is dropped</b>, and the callers hear chopped audio even though the class is "priority". Sizing therefore needs arithmetic.</p>
<table class="cmp"><tr><th>Codec</th><th>Packets per second</th><th>IP packet size</th><th>Per call (IP)</th><th>Per call on Ethernet (+18 B)</th></tr>
<tr><td>G.711, 20 ms</td><td>50</td><td>200 B (160 + 40)</td><td>80 kbps</td><td>87.2 kbps</td></tr>
<tr><td>G.729, 20 ms</td><td>50</td><td>60 B (20 + 40)</td><td>24 kbps</td><td>31.2 kbps</td></tr>
</table>
<p>The 40 bytes are IP (20) + UDP (8) + RTP (12). Check on your platform whether the priority policer counts Layer 2 overhead; when in doubt, use the larger figure.</p>

<div class="eg"><p><b>Worked example.</b> The Pune campus has 5 phones in call at the busiest moment, using G.711. That is 5 x 80 = 400 kbps at IP level, about 436 kbps with Ethernet headers. <code>priority 1000</code> covers up to 12 simultaneous calls (12 x 80 = 960 kbps) with room for a video-call burst. On the 10 Mbps WAN this is 10 percent of the link, comfortably below the common guideline of keeping all priority traffic under about one third of the link. If the university adds 40 phones, 40 x 80 = 3200 kbps is already 32 percent: time to ask for a bigger circuit rather than raise the priority rate indefinitely.</p></div>

<h3>Proof by test: voice survives, the faulty camera does not</h3>
<p>On the lab network, a 400 kbps EF call crosses the congested WAN together with a 12,000 kbps flood. The call arrives with 0.0 percent loss and class-default pays for the congestion. Then a faulty camera starts streaming 3000 kbps marked EF for 15 seconds. Only 1000 kbps of EF fits into the priority class, so the excess is dropped:</p>
<pre class="out">    Class-map: VOICE-Q (match-any)
      28125 packets, 5625000 bytes
      Match: dscp ef (46)
      <span class="hl">Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 17500</span>
      Queueing
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/17500/0
      (pkts output/bytes output) 10625/2125000</pre>
<p>The line <code>b/w exceed drops</code> is the policer's counter. It is the first place to look when a priority class is dropping packets. The lesson is also about marking: the priority class polices everything marked EF as a whole, so a camera marked EF does not just lose its own packets, it can push down voice that shares the class. The real cure is correct marking at the edge, which the previous module taught.</p>

<div class="note"><p><b>In the simulator.</b> Plain <code>priority</code> without a rate is accepted and prints <code>Priority: Strict</code> with no policer. On real routers such a class can take the whole link and starve every other class, whereas the simulator still honours the bandwidth guarantees of the other classes. Treat the unlimited form as a configuration error, and look for <code>Priority: Strict</code> in the output when auditing a policy.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>priority</code> without a rate. (2) A rate smaller than the real voice load. (3) Putting video and voice in the same priority class without adding their rates. (4) Marking too many applications EF, so the priority queue stops being special. (5) Testing on an idle link and concluding the policer does not work.</p></div>

<div class="exam"><p><b>Exam trap.</b> "What happens to priority traffic above its configured rate?" It is dropped, but only during congestion. "Can a class have both priority and bandwidth?" No. "How many calls fit in 1000 kbps of G.711?" About 12 at 80 kbps each.</p></div>

<div class="scn"><h4>Choppy calls although the class was "priority"</h4><p>After a branch added 30 IP phones, helpdesk tickets said calls broke up during the nightly backup. The network engineer saw that VOICE-Q still had <code>priority 1000</code>, copied from the original 8-phone design. At the busiest hour, 30 calls need about 2400 kbps; the policer was dropping everything above 1000 kbps, which hit random calls. The counter <code>b/w exceed drops</code> was climbing steadily. The engineer resized the class to 3000 kbps for the 30 calls plus headroom (still 30 percent of the link) and asked the carrier about a larger circuit.</p><p><b>Lesson:</b> a priority queue is protected from starvation, but its rate is a promise you must keep sizing.</p></div>

<div class="iv"><p class="q">"How does LLQ avoid starving the other queues?"</p><p>The priority queue is limited by an implicit policer set to the priority rate. While the link is congested, traffic above the rate is dropped; when it is idle the class can burst. Add that the rate must be sized from the number of calls times the per-call bandwidth, and that the total priority traffic should stay below roughly a third of the link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLQ = CBWFQ plus one strict-priority queue created by the priority command.</li>
<li>With a rate, the priority class is policed during congestion; without one it is an unprotected queue.</li>
<li>A class cannot hold both priority and bandwidth.</li>
<li>Size it: G.711 is about 80 kbps per call at IP level, G.729 about 24 kbps; keep priority under about a third of the link.</li>
<li>b/w exceed drops in show policy-map interface shows the policer working.</li>
</ul></div>
`,hi:`
<p>CBWFQ bandwidth guarantee karta hai, lekin voice ko ek aur cheez bhi chahiye: <b>low delay aur low jitter</b>. Call chhote packets se banti hai jo har 20 millisecond par bheje jaate hain, aur sunne wala har intezaar sunta hai. <b>Low Latency Queuing (LLQ)</b> CBWFQ mein ek <b>strict-priority queue</b> jod kar yeh solve karti hai. Us queue ke packets hamesha pehle bheje jaate hain. Ise ek hi command se on karte hain: <code>priority</code>.</p>

<h3>Airport ki fast lane ki tarah socho</h3>
<p>Airport par business-class passengers fast lane se seedhe security tak jaate hain. Agar har passenger ko usme aane diya jaaye, to fast lane bhi normal jitni dheemi ho jaayegi aur economy passengers kabhi screen hi nahi honge. Isliye airports lane ko limit karte hain: yeh sirf har minute kuch logon ke liye hai, aur us sankhya ke upar wale wapas aam line mein jaate hain. LLQ bhi aise hi kaam karta hai. Voice fast lane mein jaati hai, lekin lane ki ek <b>speed limit</b> hai, isliye woh poora link kabhi nahi le sakti.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="LLQ: priority queue served first, CBWFQ queues share the rest">
<rect x="10" y="14" width="140" height="34" rx="6" fill="#ddd6fe"/><text x="80" y="36" text-anchor="middle" class="svg-ink" font-size="13">VOICE-Q  EF</text>
<rect x="10" y="74" width="140" height="34" rx="6" fill="#fde68a"/><text x="80" y="96" text-anchor="middle" class="svg-ink" font-size="13">ERP-Q  AF21</text>
<rect x="10" y="122" width="140" height="34" rx="6" fill="#e2e8f0"/><text x="80" y="144" text-anchor="middle" class="svg-ink" font-size="13">class-default</text>
<rect x="190" y="8" width="90" height="46" rx="6" fill="#fecaca"/><text x="235" y="28" text-anchor="middle" class="svg-ink" font-size="12">policer</text><text x="235" y="44" text-anchor="middle" class="svg-muted" font-size="11">1000 kbps</text>
<path d="M150 31 H190 M280 31 H340 M150 91 H340 M150 139 H340" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="340" y="8" width="130" height="150" rx="10" fill="#bae6fd"/><text x="405" y="34" text-anchor="middle" class="svg-ink" font-size="13">Scheduler</text>
<text x="405" y="62" text-anchor="middle" class="svg-accent" font-size="12">1. priority pehle</text><text x="405" y="90" text-anchor="middle" class="svg-muted" font-size="12">2. phir CBWFQ</text><text x="405" y="108" text-anchor="middle" class="svg-muted" font-size="12">weight se</text>
<path d="M470 83 H520" stroke="#64748b" stroke-width="6" fill="none"/>
<rect x="520" y="55" width="110" height="56" rx="10" fill="#bbf7d0"/><text x="575" y="80" text-anchor="middle" class="svg-ink" font-size="13">WAN</text><text x="575" y="98" text-anchor="middle" class="svg-muted" font-size="11">10000 kbps</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">link congested ho to 1000 kbps se upar ka EF excess drop hota hai</text>
</svg><p class="cap">Priority queue pehle serve hoti hai lekin apne policer se capped hai, isliye baaki classes ko starve nahi kar sakti.</p></div>

<h3>Priority class configure karna</h3>
<pre class="code">class-map match-any VOICE-Q
 match dscp ef
policy-map WAN-LLQ
 class VOICE-Q
  priority 1000
 class ERP-Q
  bandwidth percent 40
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output WAN-LLQ</pre>
<p>Teen roop available hain: <code>priority 1000</code> (kbps), <code>priority percent 10</code> (interface bandwidth ka percent) aur sirf <code>priority</code> (bina rate ke). Aap bytes mein burst bhi jod sakte ho, jaise <code>priority 1000 25000</code>; default burst rate ka lagbhag 200 ms hota hai, jo 1000 kbps ke liye 25,000 bytes hai. <code>priority</code> wali class mein <code>bandwidth</code> bhi nahi ho sakta: priority rate hi uski guarantee aur ceiling dono hai. Simulator doosra command mana kar deta hai:</p>
<pre class="out">R1(config-pmap-c)# bandwidth percent 10
<span class="hl">% Remove the priority command from this class before configuring bandwidth</span></pre>

<h3>Implicit policer</h3>
<p>Jab aap priority class ko rate dete ho, IOS uske aage ek <b>policer</b> laga deta hai. <b>Congestion</b> ke dauran class ka configured rate se upar ka traffic drop hota hai, taaki doosri classes ki guarantees bani rahein. Jab link <b>congested nahi</b> hota, priority class apne rate se zyada use kar sakti hai, kyunki bandwidth ki kisi aur ko zaroorat nahi. Ise <b>conditional policing</b> kehte hain. Do nateeje nikalte hain. Pehla, khali link par voice ka rate se upar jaana kuch sabit nahi karta. Doosra, policer ko kaam karte dekhne ke liye doosra bulk flow chalu rakhna padega taaki link bhara rahe.</p>

<h3>Priority class ka size kyun sochna chahiye</h3>
<p>Agar priority queue par koi limit na ho, to koi kharab ya unmarked sender use bhar sakta hai, jaise purana <b>PQ</b> karta tha, aur baaki saari classes starve ho jaengi. Rate-limit lagana baaki ko bachata hai. Lekin rate itna bada bhi hona chahiye: agar aap jitni voice le jaate ho woh rate se zyada hai, to <b>voice khud drop hoti hai</b>, aur callers ko kati hui audio sunai deti hai, chahe class "priority" ho. Isliye sizing ke liye hisaab chahiye.</p>
<table class="cmp"><tr><th>Codec</th><th>Packets per second</th><th>IP packet size</th><th>Har call (IP)</th><th>Har call Ethernet par (+18 B)</th></tr>
<tr><td>G.711, 20 ms</td><td>50</td><td>200 B (160 + 40)</td><td>80 kbps</td><td>87.2 kbps</td></tr>
<tr><td>G.729, 20 ms</td><td>50</td><td>60 B (20 + 40)</td><td>24 kbps</td><td>31.2 kbps</td></tr>
</table>
<p>40 bytes matlab IP (20) + UDP (8) + RTP (12). Apne platform par check karo ki priority policer Layer 2 overhead ginta hai ya nahi; shak ho to bada figure use karo.</p>

<div class="eg"><p><b>Worked example.</b> Pune campus mein sabse busy waqt 5 phones call mein hain, G.711 par. Yeh IP level par 5 x 80 = 400 kbps hai, Ethernet headers ke saath lagbhag 436 kbps. <code>priority 1000</code> ek saath 12 calls tak cover karta hai (12 x 80 = 960 kbps), video-call burst ke liye gunjaish ke saath. 10 Mbps WAN par yeh link ka 10 percent hai, jo sabhi priority traffic ko link ke lagbhag ek tihayi se neeche rakhne ki aam guideline se aaram se neeche hai. Agar university 40 phones jode, to 40 x 80 = 3200 kbps pehle se 32 percent hai: priority rate ko hamesha badhane ki jagah bade circuit ke liye kehne ka waqt.</p></div>

<h3>Test se saboot: voice bachti hai, kharab camera nahi</h3>
<p>Lab network par 400 kbps ki EF call congested WAN se 12,000 kbps ke flood ke saath guzarti hai. Call 0.0 percent loss ke saath pahunchti hai aur congestion ki keemat class-default chukati hai. Phir ek kharab camera 15 second ke liye 3000 kbps EF mark ke saath stream karta hai. Priority class mein EF ka sirf 1000 kbps fit hota hai, isliye excess drop hota hai:</p>
<pre class="out">    Class-map: VOICE-Q (match-any)
      28125 packets, 5625000 bytes
      Match: dscp ef (46)
      <span class="hl">Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 17500</span>
      Queueing
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/17500/0
      (pkts output/bytes output) 10625/2125000</pre>
<p>Line <code>b/w exceed drops</code> policer ka counter hai. Jab priority class packets drop kar rahi ho to sabse pehle yahi dekhna hai. Seekh marking ke baare mein bhi hai: priority class EF mark wali har cheez ko ek saath police karti hai, isliye EF mark wala camera sirf apne packets nahi khota, woh us class mein baithi voice ko bhi dabaa sakta hai. Asli ilaaj edge par sahi marking hai, jo pichhle module ne sikhayi.</p>

<div class="note"><p><b>Simulator mein.</b> Bina rate ka plain <code>priority</code> accept hota hai aur <code>Priority: Strict</code> chhaapta hai, bina policer ke. Asli routers par aisi class poora link le kar baaki har class ko starve kar sakti hai, jabki simulator doosri classes ki bandwidth guarantees phir bhi nibhata hai. Unlimited roop ko configuration error maano, aur policy audit karte waqt output mein <code>Priority: Strict</code> dhundo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Bina rate ka <code>priority</code>. (2) Asli voice load se chhota rate. (3) Voice aur video ko ek hi priority class mein bina unke rates jode rakhna. (4) Bahut saari applications ko EF mark kar dena, jisse priority queue special nahi rehti. (5) Khali link par test karke maan lena ki policer kaam nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Configured rate se upar ke priority traffic ka kya hota hai?" Drop hota hai, lekin sirf congestion mein. "Kya ek class mein priority aur bandwidth dono ho sakte hain?" Nahi. "1000 kbps G.711 mein kitni calls fit hoti hain?" Lagbhag 12, har ek 80 kbps.</p></div>

<div class="scn"><h4>Class "priority" thi phir bhi calls kat rahi thin</h4><p>Branch ne 30 IP phones jode to helpdesk tickets aaye ki raat ke backup mein calls tootti hain. Network engineer ne dekha ki VOICE-Q ke paas ab bhi <code>priority 1000</code> tha, jo original 8-phone design se copy hua tha. Sabse busy ghante mein 30 calls ko lagbhag 2400 kbps chahiye; policer 1000 kbps se upar sab kuch drop kar raha tha, jo random calls par padta tha. Counter <code>b/w exceed drops</code> lagatar badh raha tha. Engineer ne class ko 30 calls plus headroom ke liye 3000 kbps kiya (phir bhi link ka 30 percent) aur carrier se bade circuit ke baare mein poocha.</p><p><b>Lesson:</b> priority queue starvation se surakshit hai, lekin uska rate ek vaada hai jise aapko size karte rehna padta hai.</p></div>

<div class="iv"><p class="q">"LLQ baaki queues ko starve hone se kaise bachata hai?"</p><p>Priority queue ek implicit policer se limited hoti hai jo priority rate par set hota hai. Link congested ho to rate se upar ka traffic drop hota hai; khali ho to class burst kar sakti hai. Yeh bhi jodo ki rate calls ki sankhya guna per-call bandwidth se size hona chahiye, aur total priority traffic link ke lagbhag ek tihayi se neeche rehna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLQ = CBWFQ plus ek strict-priority queue jo priority command se banti hai.</li>
<li>Rate ke saath priority class congestion mein police hoti hai; bina rate ke woh bina suraksha ki queue hai.</li>
<li>Ek class mein priority aur bandwidth dono nahi ho sakte.</li>
<li>Size karo: G.711 IP level par lagbhag 80 kbps per call, G.729 lagbhag 24 kbps; priority ko link ke lagbhag ek tihayi se neeche rakho.</li>
<li>show policy-map interface mein b/w exceed drops policer ko kaam karte dikhata hai.</li>
</ul></div>
`}};export{e as default};