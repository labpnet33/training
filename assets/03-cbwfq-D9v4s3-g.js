var e={id:`cbwfq`,h:{en:`CBWFQ: bandwidth in kbps, percent and remaining percent`,hi:`CBWFQ: bandwidth kbps, percent aur remaining percent mein`},body:{en:`
<p>Class-Based Weighted Fair Queuing gives each class of traffic its own queue and a <b>guaranteed minimum share</b> of the link during congestion. It is built with the Modular QoS CLI (MQC) that you met in the previous module: class-maps say <i>what</i> belongs to a class, a policy-map says <i>what happens</i> to the class, and a service-policy attaches the policy to an interface. In this chapter the "what happens" is the <code>bandwidth</code> command.</p>

<h3>Think of a shared office lift</h3>
<p>Imagine a building where three companies share a lift. The contract says: company A is guaranteed 40 percent of the lift's capacity at busy times, company B 30 percent, and everyone else shares the rest. If company A is on holiday, its seats are not wasted: B and the others may use them. But the moment A returns, its 40 percent is protected again. That is CBWFQ: <b>a guaranteed minimum, not a fixed limit</b>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="CBWFQ classes sharing a 10 Mbps link">
<rect x="10" y="20" width="130" height="34" rx="6" fill="#fde68a"/><text x="75" y="42" text-anchor="middle" class="svg-ink" font-size="13">ERP-Q  AF21</text>
<rect x="10" y="68" width="130" height="34" rx="6" fill="#fed7aa"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="13">BKP-Q  AF11</text>
<rect x="10" y="116" width="130" height="34" rx="6" fill="#e2e8f0"/><text x="75" y="138" text-anchor="middle" class="svg-ink" font-size="13">class-default</text>
<path d="M140 37 H210 M140 85 H210 M140 133 H210" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="210" y="14" width="190" height="142" rx="10" fill="#bae6fd"/><text x="305" y="40" text-anchor="middle" class="svg-ink" font-size="14">Scheduler</text>
<text x="305" y="65" text-anchor="middle" class="svg-muted" font-size="12">ERP-Q  at least 4000 kbps</text><text x="305" y="88" text-anchor="middle" class="svg-muted" font-size="12">BKP-Q  at least 3000 kbps</text><text x="305" y="111" text-anchor="middle" class="svg-muted" font-size="12">default: the rest, fair per flow</text>
<path d="M400 85 H470" stroke="#64748b" stroke-width="6" fill="none"/>
<rect x="470" y="50" width="160" height="70" rx="10" fill="#ddd6fe"/><text x="550" y="82" text-anchor="middle" class="svg-ink" font-size="14">Gi0/0 WAN</text><text x="550" y="102" text-anchor="middle" class="svg-muted" font-size="12">10000 kbps</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">unused bandwidth is shared; guarantees return the moment a class needs them</text>
</svg><p class="cap">One queue per class, served by weight. The numbers are floors, not ceilings.</p></div>

<h3>The three forms of bandwidth</h3>
<table class="cmp"><tr><th>Command</th><th>Meaning</th><th>When to use</th></tr>
<tr><td><code>bandwidth 4000</code></td><td>4000 kbps guaranteed</td><td>You know the exact figure</td></tr>
<tr><td><code>bandwidth percent 40</code></td><td>40 percent of the interface bandwidth</td><td>One policy reused on circuits of different size</td></tr>
<tr><td><code>bandwidth remaining percent 60</code></td><td>60 percent of what is left after priority classes</td><td>Designs with an LLQ in the same policy</td></tr>
</table>
<p>Three rules to remember. First, all classes in one policy-map that use <code>bandwidth</code> must use the <b>same unit</b>, kbps or percent. Mixing them is refused. Second, a class cannot have both <code>priority</code> and <code>bandwidth</code>; Chapter 4 explains why. Third, a <b>percent</b> is taken from the bandwidth of the interface the policy is attached to, so a 10 Mbps WAN with <code>bandwidth percent 40</code> guarantees 4000 kbps, and the same policy on a 100 Mbps circuit guarantees 40,000 kbps. On real routers that value is the interface <code>bandwidth</code> setting, which you can see as BW in <code>show interfaces</code>, so a wrong bandwidth statement on a sub-interface silently changes your guarantees.</p>

<h3>How the share is calculated</h3>
<p>While the link is not full, every class gets what it asks for. When the sum of offered traffic exceeds the link, the scheduler first lets each class send up to its guarantee. Whatever bandwidth is left over, because some class used less than its guarantee, is shared among classes that want more, <b>in proportion to their configured bandwidth</b>. <b>class-default</b> receives the remainder that nobody reserved, and with <code>fair-queue</code> its flows share that remainder fairly.</p>

<div class="eg"><p><b>Worked example.</b> The Pune circuit is 10,000 kbps. ERP-Q has <code>bandwidth percent 40</code> (4000 kbps) and BKP-Q has <code>bandwidth percent 30</code> (3000 kbps). At 21:00 the ERP offers 3500 kbps, the backup offers 9000 kbps and other traffic offers 2500 kbps: 15,000 kbps into a 10,000 kbps pipe. The ERP offers less than its 4000 kbps guarantee, so <b>all 3500 kbps pass with no loss</b>. That leaves 6500 kbps, which the backup and class-default divide between them; the backup is certain to receive at least its 3000 kbps. The backup's own packets are the ones dropped. If the ERP later grows to 5000 kbps, it is entitled to 4000 kbps and then competes for extra bandwidth in proportion to its weight, still ahead of the default traffic.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! 1. Say which packets belong to each class (marking was done earlier)</span>
class-map match-any ERP-Q
 match dscp af21
class-map match-any BKP-Q
 match dscp af11
<span class="c">! 2. Say what happens to each class when the link is busy</span>
policy-map WAN-OUT
 class ERP-Q
  bandwidth percent 40
 class BKP-Q
  bandwidth percent 30
 class class-default
  fair-queue
<span class="c">! 3. Attach on the OUTPUT of the slow interface</span>
interface GigabitEthernet0/0
 service-policy output WAN-OUT</pre>

<h3>Class order and class-default</h3>
<p>The router tests a packet against the classes <b>from top to bottom</b> and uses the <b>first match</b>. A packet that matches no class falls into <code>class-default</code>, which is always the last class even if you do not write it. When you add a class later, IOS places it above class-default. Chapter 8 shows what happens when a broad class sits above a narrow one.</p>

<h3>Reading the result</h3>
<p>After a 20 second test with the three flows above, the simulator prints counters like these (excerpt of <code>show policy-map interface GigabitEthernet0/0</code>):</p>
<pre class="out">    Class-map: ERP-Q (match-any)
      6260 packets, 8764000 bytes
      Match: dscp af21 (18)
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/<span class="hl">0</span>/0
      <span class="hl">bandwidth 40% (4000 kbps)</span>

    Class-map: BKP-Q (match-any)
      112500 packets, 22500000 bytes
      Match: dscp af11 (10)
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/<span class="hl">33148</span>/0
      bandwidth 30% (3000 kbps)

    Class-map: class-default (match-any)
      31260 packets, 6252000 bytes
      Queueing
      (queue depth/total drops/no-buffer drops) 0/<span class="hl">4239</span>/0
      Fair-queue: per-flow queue limit 16 packets</pre>
<p>Read it like this: ERP-Q has zero drops because it stayed within its guarantee; BKP-Q and class-default took all the drops. The line <code>bandwidth 40% (4000 kbps)</code> confirms how the percent was converted.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Treating <code>bandwidth</code> as a limit: it is a floor, and a class can use more when others are quiet. (2) Using kbps in one class and percent in another. (3) Attaching the policy with <code>service-policy input</code>: queuing is output only. (4) Reserving 100 percent so that routing protocols and class-default have nothing left; many platforms recommend keeping 25 percent free, see Chapter 6.</p></div>

<div class="exam"><p><b>Exam trap.</b> "A class has bandwidth 2000 and the link is idle. How much can it send?" Up to the full line rate: the guarantee applies only during congestion. "What is the default class called and where does it sit?" class-default, always last.</p></div>

<div class="scn"><h4>ERP safe, backup slower</h4><p>At the Pune campus the network engineer created ERP-Q with 40 percent and BKP-Q with 30 percent, attached WAN-OUT outbound on the WAN, and ran a load test: ERP 3500 kbps, backup 9000 kbps, plus 2500 kbps of other traffic. The ERP flow finished with 0.0 percent loss while the backup flow showed heavy loss. The students noticed nothing at the fee counter, and the backup simply finished 40 minutes later. The IT head asked whether the backup was broken; the engineer showed the drops counters and explained that the backup had been told to wait its turn.</p><p><b>Lesson:</b> CBWFQ does not make traffic faster. It decides whose packets wait, and it makes the answer predictable.</p></div>

<div class="iv"><p class="q">"What does the bandwidth command guarantee, and when?"</p><p>It guarantees a minimum share to the class, but only during congestion; when the link is idle or other classes are quiet, the class may use more. Percent values are relative to the interface bandwidth. All classes must use the same unit, and unused bandwidth is redistributed in proportion to the configured values.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CBWFQ = one queue per class, each with a guaranteed minimum from the bandwidth command.</li>
<li>Three forms: kbps, percent of interface bandwidth, and remaining percent after priority classes.</li>
<li>Guarantees apply during congestion; spare bandwidth is shared in proportion to the weights.</li>
<li>Classes are matched top to bottom, first match wins, class-default is last.</li>
<li>Attach with service-policy output on the slow interface and verify with show policy-map interface.</li>
</ul></div>
`,hi:`
<p>Class-Based Weighted Fair Queuing traffic ki har class ko apni queue aur congestion ke dauran link ka <b>guaranteed minimum hissa</b> deta hai. Yeh Modular QoS CLI (MQC) se banta hai jo aap pichhle module mein mil chuke ho: class-maps batate hain <i>kya</i> class mein aata hai, policy-map batata hai class ke saath <i>kya hota hai</i>, aur service-policy policy ko interface par lagata hai. Is chapter mein "kya hota hai" ka kaam <code>bandwidth</code> command karta hai.</p>

<h3>Shared office lift ki tarah socho</h3>
<p>Ek building sochiye jahan teen companies ek lift share karti hain. Contract kehta hai: company A ko busy time par lift ki capacity ka 40 percent guaranteed hai, company B ko 30 percent, aur baaki sab baaki hissa share karte hain. Agar company A chhutti par hai to uski seats bekaar nahi jaatin: B aur doosre unhe use kar sakte hain. Lekin jaise hi A wapas aati hai, uska 40 percent phir protected ho jaata hai. Yahi CBWFQ hai: <b>guaranteed minimum, fixed limit nahi</b>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="CBWFQ classes sharing a 10 Mbps link">
<rect x="10" y="20" width="130" height="34" rx="6" fill="#fde68a"/><text x="75" y="42" text-anchor="middle" class="svg-ink" font-size="13">ERP-Q  AF21</text>
<rect x="10" y="68" width="130" height="34" rx="6" fill="#fed7aa"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="13">BKP-Q  AF11</text>
<rect x="10" y="116" width="130" height="34" rx="6" fill="#e2e8f0"/><text x="75" y="138" text-anchor="middle" class="svg-ink" font-size="13">class-default</text>
<path d="M140 37 H210 M140 85 H210 M140 133 H210" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="210" y="14" width="190" height="142" rx="10" fill="#bae6fd"/><text x="305" y="40" text-anchor="middle" class="svg-ink" font-size="14">Scheduler</text>
<text x="305" y="65" text-anchor="middle" class="svg-muted" font-size="12">ERP-Q  kam se kam 4000 kbps</text><text x="305" y="88" text-anchor="middle" class="svg-muted" font-size="12">BKP-Q  kam se kam 3000 kbps</text><text x="305" y="111" text-anchor="middle" class="svg-muted" font-size="12">default: baaki, flow ke hisaab se fair</text>
<path d="M400 85 H470" stroke="#64748b" stroke-width="6" fill="none"/>
<rect x="470" y="50" width="160" height="70" rx="10" fill="#ddd6fe"/><text x="550" y="82" text-anchor="middle" class="svg-ink" font-size="14">Gi0/0 WAN</text><text x="550" y="102" text-anchor="middle" class="svg-muted" font-size="12">10000 kbps</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">unused bandwidth share hoti hai; class ko zaroorat ho to guarantee turant laut aati hai</text>
</svg><p class="cap">Har class ki ek queue, weight ke hisaab se serve. Numbers floor hain, ceiling nahi.</p></div>

<h3>Bandwidth ke teen roop</h3>
<table class="cmp"><tr><th>Command</th><th>Matlab</th><th>Kab use karein</th></tr>
<tr><td><code>bandwidth 4000</code></td><td>4000 kbps guaranteed</td><td>Aapko exact figure pata hai</td></tr>
<tr><td><code>bandwidth percent 40</code></td><td>Interface bandwidth ka 40 percent</td><td>Ek policy alag-alag size ke circuits par reuse karni ho</td></tr>
<tr><td><code>bandwidth remaining percent 60</code></td><td>Priority classes ke baad jo bacha uska 60 percent</td><td>Jab usi policy mein LLQ ho</td></tr>
</table>
<p>Teen niyam yaad rakho. Pehla, ek policy-map ki jin classes mein <code>bandwidth</code> hai woh sab <b>ek hi unit</b> use karein, kbps ya percent. Mix karna mana hai. Doosra, ek class mein <code>priority</code> aur <code>bandwidth</code> dono nahi ho sakte; Chapter 4 batata hai kyun. Teesra, <b>percent</b> us interface ki bandwidth se nikalta hai jis par policy lagi hai, isliye 10 Mbps WAN par <code>bandwidth percent 40</code> 4000 kbps guarantee karta hai, aur wahi policy 100 Mbps circuit par 40,000 kbps. Asli routers par woh value interface ka <code>bandwidth</code> setting hoti hai, jo <code>show interfaces</code> mein BW ke roop mein dikhti hai, isliye sub-interface par galat bandwidth statement chupke se aapki guarantees badal deta hai.</p>

<h3>Hissa kaise calculate hota hai</h3>
<p>Jab tak link bhara nahi, har class ko woh milta hai jo woh maangti hai. Jab offered traffic ka jod link se zyada ho jaata hai, scheduler pehle har class ko uski guarantee tak bhejne deta hai. Jo bandwidth bach jaati hai, kyunki kisi class ne guarantee se kam use ki, woh un classes mein baanti jaati hai jo zyada chahti hain, <b>unki configured bandwidth ke anupaat mein</b>. <b>class-default</b> ko woh remainder milta hai jo kisi ne reserve nahi kiya, aur <code>fair-queue</code> ke saath uske flows us remainder ko fairly baantte hain.</p>

<div class="eg"><p><b>Worked example.</b> Pune circuit 10,000 kbps ka hai. ERP-Q ke paas <code>bandwidth percent 40</code> (4000 kbps) aur BKP-Q ke paas <code>bandwidth percent 30</code> (3000 kbps) hai. Raat 21:00 baje ERP 3500 kbps offer karta hai, backup 9000 kbps aur baaki traffic 2500 kbps: 10,000 kbps ke pipe mein 15,000 kbps. ERP apni 4000 kbps guarantee se kam offer karta hai, isliye <b>poore 3500 kbps bina loss ke nikalte hain</b>. Bachte hain 6500 kbps, jo backup aur class-default aapas mein baantte hain; backup ko kam se kam uski 3000 kbps zaroor milti hai. Drop backup ke apne packets hote hain. Agar ERP baad mein 5000 kbps tak badhe, to woh 4000 kbps ka hakdaar hai aur phir extra bandwidth ke liye apne weight ke hisaab se compete karta hai, phir bhi default traffic se aage.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! 1. Batao kaun se packets kis class ke hain (marking pehle ho chuki)</span>
class-map match-any ERP-Q
 match dscp af21
class-map match-any BKP-Q
 match dscp af11
<span class="c">! 2. Batao link busy ho to har class ke saath kya hoga</span>
policy-map WAN-OUT
 class ERP-Q
  bandwidth percent 40
 class BKP-Q
  bandwidth percent 30
 class class-default
  fair-queue
<span class="c">! 3. Slow interface ke OUTPUT par lagao</span>
interface GigabitEthernet0/0
 service-policy output WAN-OUT</pre>

<h3>Class order aur class-default</h3>
<p>Router packet ko classes se <b>upar se neeche</b> test karta hai aur <b>pehla match</b> use karta hai. Jo packet kisi class se match nahi karta woh <code>class-default</code> mein girta hai, jo hamesha aakhri class hoti hai, chahe aap use na likho. Jab aap baad mein class jodte ho, IOS use class-default ke upar rakhta hai. Chapter 8 dikhata hai ki jab broad class narrow class ke upar baithe to kya hota hai.</p>

<h3>Result padhna</h3>
<p>Upar ke teen flows ke 20 second ke test ke baad simulator aise counters chhaapta hai (<code>show policy-map interface GigabitEthernet0/0</code> ka excerpt):</p>
<pre class="out">    Class-map: ERP-Q (match-any)
      6260 packets, 8764000 bytes
      Match: dscp af21 (18)
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/<span class="hl">0</span>/0
      <span class="hl">bandwidth 40% (4000 kbps)</span>

    Class-map: BKP-Q (match-any)
      112500 packets, 22500000 bytes
      Match: dscp af11 (10)
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/<span class="hl">33148</span>/0
      bandwidth 30% (3000 kbps)

    Class-map: class-default (match-any)
      31260 packets, 6252000 bytes
      Queueing
      (queue depth/total drops/no-buffer drops) 0/<span class="hl">4239</span>/0
      Fair-queue: per-flow queue limit 16 packets</pre>
<p>Aise padho: ERP-Q mein zero drops hain kyunki woh apni guarantee ke andar raha; BKP-Q aur class-default ne saare drops liye. <code>bandwidth 40% (4000 kbps)</code> line confirm karti hai ki percent kaise convert hua.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>bandwidth</code> ko limit samajhna: yeh floor hai, aur doosre shaant hon to class zyada use kar sakti hai. (2) Ek class mein kbps aur doosri mein percent. (3) Policy ko <code>service-policy input</code> se lagana: queuing sirf output hai. (4) 100 percent reserve kar dena taaki routing protocols aur class-default ke liye kuch na bache; kai platforms 25 percent khali rakhne ki salah dete hain, Chapter 6 dekho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Class ki bandwidth 2000 hai aur link khali hai. Woh kitna bhej sakti hai?" Poore line rate tak: guarantee sirf congestion mein lagti hai. "Default class ka naam kya hai aur woh kahan baithti hai?" class-default, hamesha aakhri.</p></div>

<div class="scn"><h4>ERP surakshit, backup dheema</h4><p>Pune campus mein network engineer ne ERP-Q ko 40 percent aur BKP-Q ko 30 percent diya, WAN-OUT ko WAN par outbound lagaya, aur load test chalaya: ERP 3500 kbps, backup 9000 kbps, aur 2500 kbps baaki traffic. ERP flow 0.0 percent loss ke saath khatam hua jabki backup flow mein bhaari loss dikha. Fee counter par students ko kuch pata nahi chala, aur backup bas 40 minute der se khatam hua. IT head ne poocha ki kya backup kharab hai; engineer ne drops counters dikhaye aur samjhaya ki backup ko apni baari ka intezaar karne ko kaha gaya tha.</p><p><b>Lesson:</b> CBWFQ traffic ko tez nahi banata. Yeh tay karta hai ki kiske packets ruken, aur jawab ko predictable banata hai.</p></div>

<div class="iv"><p class="q">"Bandwidth command kya guarantee karta hai, aur kab?"</p><p>Yeh class ko minimum hissa guarantee karta hai, lekin sirf congestion mein; link khali ho ya doosri classes shaant hon to class zyada use kar sakti hai. Percent values interface bandwidth ke relative hoti hain. Sab classes ko same unit use karna hota hai, aur unused bandwidth configured values ke anupaat mein baanti jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CBWFQ = har class ki ek queue, bandwidth command se guaranteed minimum ke saath.</li>
<li>Teen roop: kbps, interface bandwidth ka percent, aur priority classes ke baad remaining percent.</li>
<li>Guarantees congestion mein lagti hain; spare bandwidth weights ke anupaat mein baanti jaati hai.</li>
<li>Classes upar se neeche match hoti hain, pehla match jeet-ta hai, class-default aakhri hai.</li>
<li>Slow interface par service-policy output se lagao aur show policy-map interface se verify karo.</li>
</ul></div>
`}};export{e as default};