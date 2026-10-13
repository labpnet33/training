var e={id:`where-to-apply-hqos`,h:{en:`Where to apply policies, and hierarchical QoS`,hi:`Policies kahan lagayein, aur hierarchical QoS`},body:{en:`
<p>A city's traffic police do not stand at random corners. They put a checkpoint where cars <b>enter</b> the city to check papers once, and traffic lights at the junctions where roads <b>narrow</b>. QoS placement follows the same logic: mark and police where traffic enters your network, queue and shape where it leaves onto a slower link.</p>

<h3>The placement rules</h3>
<ol>
<li><b>Classify and mark inbound, as close to the source as possible</b>, at the trust boundary. In the lab: MARK-IN, input on R1 Gi0/1.</li>
<li><b>Police inbound at the edge</b> for traffic you want to limit before it uses any resources: scavenger traffic, a guest VLAN, a backup class (BULK in the lab).</li>
<li><b>Queue outbound at every congestion point</b>, above all the WAN egress. In the lab: WAN-OUT, output on R1 Gi0/0.</li>
<li><b>Shape outbound</b> when the real bottleneck is downstream of your interface (a sub-rate service, see below).</li>
<li><b>Apply QoS in both directions of the WAN.</b> The branch router protects branch-to-HQ traffic. HQ-to-branch traffic congests at the HQ router's egress or inside the provider, so HQ needs its own egress policy and the provider must honour your markings.</li>
</ol>

<table class="cmp"><tr><th>Place</th><th>Direction</th><th>Typical actions</th></tr>
<tr><td>Access port (phone, PC)</td><td>input</td><td>conditional trust, classify, mark, police</td></tr>
<tr><td>Access switch uplink</td><td>output</td><td>egress priority queue and shared queues</td></tr>
<tr><td>Distribution and core</td><td>both</td><td>trust DSCP, queue on congested uplinks</td></tr>
<tr><td>WAN edge towards provider</td><td>output</td><td>LLQ/CBWFQ, WRED, shaping (HQoS)</td></tr>
<tr><td>WAN edge from provider</td><td>input</td><td>optional re-mark to the enterprise plan</td></tr>
<tr><td>Control plane</td><td>input</td><td>CoPP policing (device security module)</td></tr></table>
<p>On Catalyst 9000 switches, every port has egress queues with up to two priority levels, configured with the same MQC (<code>priority level 1</code>), and <code>auto qos voip cisco-phone</code> can generate a complete access-port policy as a starting point.</p>

<h3>The sub-rate problem</h3>
<p>Many WAN services are delivered on a fast Ethernet port but sold at a lower rate: a 1 Gbps handoff with a 50 Mbps contract. The provider enforces 50 Mbps with a policer or shaper on its side. Your router's interface runs at 1 Gbps, so <b>its</b> output queue never fills and your LLQ never activates. The congestion, and the random drops, happen inside the provider, where your voice has no priority at all.</p>
<p>The fix is <b>hierarchical QoS (HQoS)</b>: a <b>parent</b> policy that shapes all traffic to the contracted rate, with a <b>child</b> policy under it that does the queuing. The shaper creates an artificial bottleneck at 50 Mbps <b>on your router</b>, so the child sees congestion at the right rate and makes the right choices.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Hierarchical QoS">
<rect x="20" y="20" width="400" height="190" rx="12" fill="#e2e8f0"/><text x="220" y="42" text-anchor="middle" class="svg-ink" font-size="13">parent SHAPE-50M: class-default, shape average 50 Mbps</text>
<rect x="45" y="60" width="350" height="135" rx="10" fill="#bae6fd"/><text x="220" y="80" text-anchor="middle" class="svg-ink" font-size="13">child WAN-OUT</text>
<rect x="65" y="95" width="100" height="36" rx="6" fill="#bbf7d0"/><text x="115" y="118" text-anchor="middle" class="svg-ink" font-size="12">EF priority</text>
<rect x="175" y="95" width="100" height="36" rx="6" fill="#fde68a"/><text x="225" y="118" text-anchor="middle" class="svg-ink" font-size="12">AF bandwidth</text>
<rect x="285" y="95" width="100" height="36" rx="6" fill="#fed7aa"/><text x="335" y="118" text-anchor="middle" class="svg-ink" font-size="12">default FQ</text>
<text x="220" y="170" text-anchor="middle" class="svg-muted" font-size="12">queues see congestion at 50 Mbps</text>
<line x1="420" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="3"/>
<rect x="480" y="90" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="112" text-anchor="middle" class="svg-ink" font-size="12">Gi0/0 1 Gbps</text><text x="550" y="128" text-anchor="middle" class="svg-muted" font-size="12">50 Mbps contract</text>
</svg><p class="cap">HQoS: the parent shaper sets the real rate; the child LLQ/CBWFQ decides who goes first inside it.</p></div>

<pre class="code"><span class="c">! child: the same WAN-OUT as in the lab</span>
policy-map WAN-OUT
 class EF-Q
  priority percent 30
 class AF11-Q
  bandwidth remaining percent 40
 class class-default
  fair-queue
<span class="c">! parent: shape to the contract, nest the child</span>
policy-map SHAPE-50M
 class class-default
  shape average 50000000
  service-policy WAN-OUT
interface GigabitEthernet0/0
 service-policy output SHAPE-50M</pre>
<p>Rules for HQoS on routers: the parent normally has only <code>class-default</code> with <code>shape</code>; the child does the queuing; percentages in the child are calculated from the <b>shaped rate</b>, not from the interface speed.</p>

<pre class="out">R1# show policy-map interface GigabitEthernet0/0 output
 GigabitEthernet0/0

  Service-policy output: SHAPE-50M

    Class-map: class-default (match-any)
      412880 packets, 301228400 bytes
      30 second offered rate 48710000 bps, drop rate 0000 bps
      Match: any
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 412880/301228400
<span class="hl">      shape (average) cir 50000000, bc 200000, be 200000</span>
      target shape rate 50000000

<span class="hl">      Service-policy : WAN-OUT</span>

        Class-map: EF-Q (match-any)
          ...
          Priority: 30% (15000 kbps), burst bytes 375000, b/w exceed drops: 0</pre>

<div class="eg"><p><b>Worked example.</b> Shaped rate 50 Mbps. <code>priority percent 30</code> gives EF 15 Mbps, enough for about 170 G.711 calls at 87.2 kbps each. <code>bandwidth remaining percent 40</code> guarantees AF11 40% of what is left after priority traffic: if voice uses 10 Mbps, AF11 is guaranteed 16 Mbps. In the lab you do not need a parent shaper, because R1 Gi0/0 is set to <code>speed 10</code> and the physical interface itself is the 10 Mbps bottleneck.</p></div>

<div class="warn"><p><b>Common mistake.</b> Applying LLQ directly to a 1 Gbps interface that feeds a 50 Mbps service. The policy attaches without errors, the counters show traffic, but queue drops stay at zero because the interface never congests, while calls break up inside the provider network.</p></div>

<div class="exam"><p><b>Exam trap.</b> Marking and policing can be input; queuing and shaping are output. HQoS = parent shaper plus child queuing, with <code>service-policy</code> nested under the parent's class. Child percentages are relative to the parent's shaped rate.</p></div>

<div class="scn"><h4>Zero drops, broken calls</h4><p>A branch on a 100 Mbps service over a 1 Gbps port had LLQ configured, yet calls broke up whenever backups ran. <code>show policy-map interface</code> showed thousands of EF packets and zero drops in every class, which looked perfect. The provider's portal, however, showed heavy policer drops on the circuit. The router was sending up to 1 Gbps and the provider's 100 Mbps policer was dropping voice and data alike. Wrapping the existing policy in a 95 Mbps parent shaper moved the congestion back onto the router, where LLQ protected voice.</p><p><b>Lesson:</b> no drops in your policy does not mean no drops on the path. Queue where the bottleneck really is, and create it with a shaper if needed.</p></div>

<div class="iv"><p class="q">"You have a 1 Gbps port to your provider but pay for 50 Mbps. How do you configure QoS?"</p><p>Strong answer: a queuing policy on the physical 1 Gbps interface never sees congestion, so I would build hierarchical QoS: a parent policy with class-default shaped to 50 Mbps (or slightly less to absorb overhead), and the LLQ/CBWFQ child nested under it with service-policy. The shaper moves the bottleneck onto my router so priority and guarantees take effect. I would also ask the provider to honour my DSCP markings and apply an egress policy at HQ for the reverse direction.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mark and police inbound near the source; queue and shape outbound at congestion points.</li>
<li>Protect both directions of the WAN; the far end needs its own egress policy.</li>
<li>On sub-rate services, the physical interface never congests; use HQoS.</li>
<li>HQoS = parent <code>shape average</code> in class-default plus a nested child queuing policy.</li>
<li>Child percentages are calculated from the parent's shaped rate.</li>
</ul></div>
`,hi:`
<p>Shehar ki traffic police random kono par khadi nahi hoti. Woh ek baar papers check karne ke liye wahan checkpoint lagati hai jahan gaadiyan shehar mein <b>ghusti</b> hain, aur traffic lights un junctions par jahan sadakein <b>patli</b> hoti hain. QoS placement bhi isi logic par chalta hai: jahan traffic aapke network mein ghusta hai wahan mark aur police karo, jahan woh dheeme link par nikalta hai wahan queue aur shape karo.</p>

<h3>Placement ke rules</h3>
<ol>
<li><b>Source ke jitna paas ho sake, inbound classify aur mark karo</b>, trust boundary par. Lab mein: MARK-IN, R1 Gi0/1 par input.</li>
<li><b>Edge par inbound police karo</b> us traffic ke liye jise koi resource use karne se pehle limit karna hai: scavenger traffic, guest VLAN, backup class (lab mein BULK).</li>
<li><b>Har congestion point par outbound queue karo</b>, sabse upar WAN egress. Lab mein: WAN-OUT, R1 Gi0/0 par output.</li>
<li><b>Outbound shape karo</b> jab asli bottleneck aapke interface ke aage ho (sub-rate service, neeche dekho).</li>
<li><b>WAN ki dono directions mein QoS lagao.</b> Branch router branch-to-HQ traffic bachata hai. HQ-to-branch traffic HQ router ke egress par ya provider ke andar congest hota hai, isliye HQ ko apni egress policy chahiye aur provider ko aapki markings maanni chahiye.</li>
</ol>

<table class="cmp"><tr><th>Jagah</th><th>Direction</th><th>Aam actions</th></tr>
<tr><td>Access port (phone, PC)</td><td>input</td><td>conditional trust, classify, mark, police</td></tr>
<tr><td>Access switch uplink</td><td>output</td><td>egress priority queue aur shared queues</td></tr>
<tr><td>Distribution aur core</td><td>dono</td><td>DSCP trust, congested uplinks par queue</td></tr>
<tr><td>Provider ki taraf WAN edge</td><td>output</td><td>LLQ/CBWFQ, WRED, shaping (HQoS)</td></tr>
<tr><td>Provider se WAN edge</td><td>input</td><td>optional, enterprise plan par re-mark</td></tr>
<tr><td>Control plane</td><td>input</td><td>CoPP policing (device security module)</td></tr></table>
<p>Catalyst 9000 switches par har port ki egress queues hoti hain jinmein do priority levels tak hote hain, same MQC (<code>priority level 1</code>) se configure, aur <code>auto qos voip cisco-phone</code> starting point ke roop mein poori access-port policy bana sakta hai.</p>

<h3>Sub-rate problem</h3>
<p>Kai WAN services fast Ethernet port par di jaati hain par kam rate par bechi jaati hain: 1 Gbps handoff, 50 Mbps contract. Provider apni taraf policer ya shaper se 50 Mbps lagu karta hai. Aapke router ka interface 1 Gbps par chalta hai, isliye <b>uski</b> output queue kabhi nahi bharti aur aapki LLQ kabhi active nahi hoti. Congestion, aur random drops, provider ke andar hote hain, jahan aapki voice ki koi priority nahi.</p>
<p>Fix hai <b>hierarchical QoS (HQoS)</b>: ek <b>parent</b> policy jo saare traffic ko contract rate par shape kare, aur uske neeche ek <b>child</b> policy jo queuing kare. Shaper <b>aapke router par</b> 50 Mbps ka artificial bottleneck banata hai, isliye child ko sahi rate par congestion dikhta hai aur woh sahi faisle leti hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Hierarchical QoS">
<rect x="20" y="20" width="400" height="190" rx="12" fill="#e2e8f0"/><text x="220" y="42" text-anchor="middle" class="svg-ink" font-size="13">parent SHAPE-50M: class-default, shape average 50 Mbps</text>
<rect x="45" y="60" width="350" height="135" rx="10" fill="#bae6fd"/><text x="220" y="80" text-anchor="middle" class="svg-ink" font-size="13">child WAN-OUT</text>
<rect x="65" y="95" width="100" height="36" rx="6" fill="#bbf7d0"/><text x="115" y="118" text-anchor="middle" class="svg-ink" font-size="12">EF priority</text>
<rect x="175" y="95" width="100" height="36" rx="6" fill="#fde68a"/><text x="225" y="118" text-anchor="middle" class="svg-ink" font-size="12">AF bandwidth</text>
<rect x="285" y="95" width="100" height="36" rx="6" fill="#fed7aa"/><text x="335" y="118" text-anchor="middle" class="svg-ink" font-size="12">default FQ</text>
<text x="220" y="170" text-anchor="middle" class="svg-muted" font-size="12">queues ko 50 Mbps par congestion dikhta hai</text>
<line x1="420" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="3"/>
<rect x="480" y="90" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="112" text-anchor="middle" class="svg-ink" font-size="12">Gi0/0 1 Gbps</text><text x="550" y="128" text-anchor="middle" class="svg-muted" font-size="12">50 Mbps contract</text>
</svg><p class="cap">HQoS: parent shaper asli rate tay karta hai; child LLQ/CBWFQ uske andar decide karti hai ki pehle kaun jaaye.</p></div>

<pre class="code"><span class="c">! child: lab wali hi WAN-OUT</span>
policy-map WAN-OUT
 class EF-Q
  priority percent 30
 class AF11-Q
  bandwidth remaining percent 40
 class class-default
  fair-queue
<span class="c">! parent: contract par shape, child ko nest karo</span>
policy-map SHAPE-50M
 class class-default
  shape average 50000000
  service-policy WAN-OUT
interface GigabitEthernet0/0
 service-policy output SHAPE-50M</pre>
<p>Routers par HQoS ke rules: parent mein normally sirf <code>class-default</code> <code>shape</code> ke saath hoti hai; child queuing karti hai; child ke percentages <b>shaped rate</b> se calculate hote hain, interface speed se nahi.</p>

<pre class="out">R1# show policy-map interface GigabitEthernet0/0 output
 GigabitEthernet0/0

  Service-policy output: SHAPE-50M

    Class-map: class-default (match-any)
      412880 packets, 301228400 bytes
      30 second offered rate 48710000 bps, drop rate 0000 bps
      Match: any
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 412880/301228400
<span class="hl">      shape (average) cir 50000000, bc 200000, be 200000</span>
      target shape rate 50000000

<span class="hl">      Service-policy : WAN-OUT</span>

        Class-map: EF-Q (match-any)
          ...
          Priority: 30% (15000 kbps), burst bytes 375000, b/w exceed drops: 0</pre>

<div class="eg"><p><b>Worked example.</b> Shaped rate 50 Mbps. <code>priority percent 30</code> EF ko 15 Mbps deta hai, har ek 87.2 kbps par lagbhag 170 G.711 calls ke liye kaafi. <code>bandwidth remaining percent 40</code> AF11 ko priority traffic ke baad bache hisse ka 40% guarantee karta hai: agar voice 10 Mbps use kare, to AF11 ko 16 Mbps guaranteed hai. Lab mein aapko parent shaper nahi chahiye, kyunki R1 Gi0/0 <code>speed 10</code> par set hai aur physical interface khud 10 Mbps ka bottleneck hai.</p></div>

<div class="warn"><p><b>Common galti.</b> 50 Mbps service ko feed karne wale 1 Gbps interface par seedhe LLQ lagana. Policy bina errors ke attach hoti hai, counters traffic dikhate hain, par queue drops zero rehte hain kyunki interface kabhi congest nahi hota, jabki calls provider network ke andar toot-ti hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Marking aur policing input ho sakte hain; queuing aur shaping output hain. HQoS = parent shaper plus child queuing, parent ki class ke neeche nested <code>service-policy</code> ke saath. Child percentages parent ke shaped rate ke relative hote hain.</p></div>

<div class="scn"><h4>Zero drops, tooti calls</h4><p>1 Gbps port par 100 Mbps service wali ek branch mein LLQ configured thi, phir bhi backups chalte hi calls toot-ti thi. <code>show policy-map interface</code> mein hazaaron EF packets aur har class mein zero drops the, jo perfect lagta tha. Lekin provider ke portal par circuit par bhaari policer drops the. Router 1 Gbps tak bhej raha tha aur provider ka 100 Mbps policer voice aur data dono drop kar raha tha. Existing policy ko 95 Mbps parent shaper mein lapetne se congestion wapas router par aa gaya, jahan LLQ ne voice ko bachaya.</p><p><b>Seekh:</b> aapki policy mein drops na hona iska matlab nahi ki path par drops nahi. Wahan queue karo jahan bottleneck sach mein hai, aur zaroorat ho to use shaper se banao.</p></div>

<div class="iv"><p class="q">"Aapke paas provider ki taraf 1 Gbps port hai par aap 50 Mbps ka paisa dete ho. QoS kaise configure karoge?"</p><p>Strong answer: physical 1 Gbps interface par queuing policy ko kabhi congestion nahi dikhta, isliye main hierarchical QoS banaunga: class-default ke saath parent policy jo 50 Mbps (ya overhead ke liye thoda kam) par shape kare, aur uske neeche service-policy se nested LLQ/CBWFQ child. Shaper bottleneck ko mere router par le aata hai taaki priority aur guarantees asar karein. Main provider se apni DSCP markings maanne ko bhi kahunga aur ulti direction ke liye HQ par egress policy lagaunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Source ke paas inbound mark aur police karo; congestion points par outbound queue aur shape karo.</li>
<li>WAN ki dono directions bachao; doosre sire ko apni egress policy chahiye.</li>
<li>Sub-rate services par physical interface kabhi congest nahi hota; HQoS use karo.</li>
<li>HQoS = class-default mein parent <code>shape average</code> plus nested child queuing policy.</li>
<li>Child percentages parent ke shaped rate se calculate hote hain.</li>
</ul></div>
`}};export{e as default};