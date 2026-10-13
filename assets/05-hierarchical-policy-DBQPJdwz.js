var e={id:`hqos`,h:{en:`Hierarchical policy: a parent shaper with a child LLQ and CBWFQ`,hi:`Hierarchical policy: parent shaper aur uske andar child LLQ aur CBWFQ`},body:{en:`
<p>Chapter 4 gave you a shaper, and a shaper alone has one weakness: it treats every packet the same. When it holds back the excess it simply queues it in one line, so a voice packet stands behind the bulk copy. What you want is a shaper that <i>creates</i> the bottleneck and a second policy that decides <i>who goes first</i> inside it. That two-level design is a <b>hierarchical policy</b>, and it is the single most useful QoS pattern at a WAN edge.</p>

<h3>The idea in one picture: a toll gate with a VIP lane</h3>
<p>Imagine a highway that narrows to one toll gate. The gate lets cars through at a fixed rate (the <b>parent</b>, the shaper). Cars waiting for the gate are not in one dumb queue: an ambulance lane goes first, a bus lane gets a guaranteed share, and everyone else takes turns (the <b>child</b>, LLQ and CBWFQ). Without the gate the road is wide and nobody queues, so the ambulance lane would never be used. The gate is what makes the lanes matter.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Parent shaper with a child policy">
<rect x="20" y="30" width="130" height="190" rx="8" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="85" y="22" text-anchor="middle" class="svg-ink" font-size="12">Traffic from LAN</text>
<text x="85" y="70" text-anchor="middle" class="svg-ink" font-size="11">Voice (EF)</text>
<text x="85" y="110" text-anchor="middle" class="svg-ink" font-size="11">Billing (AF31)</text>
<text x="85" y="150" text-anchor="middle" class="svg-ink" font-size="11">Bulk copy</text>
<text x="85" y="190" text-anchor="middle" class="svg-muted" font-size="11">66 Mbps offered</text>
<line x1="150" y1="65" x2="215" y2="65" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="105" x2="215" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="145" x2="215" y2="145" stroke="#64748b" stroke-width="2"/>
<rect x="215" y="30" width="250" height="190" rx="8" fill="none" stroke="#2563eb" stroke-width="2"/>
<text x="340" y="22" text-anchor="middle" class="svg-ink" font-size="12">Parent WAN-SHAPE: shape average 19 Mbps</text>
<rect x="230" y="48" width="220" height="34" rx="4" fill="#16a34a"/><text x="340" y="70" text-anchor="middle" fill="#ffffff" font-size="11">VOICE: priority 2000 kbps (first)</text>
<rect x="230" y="92" width="220" height="34" rx="4" fill="#2563eb"/><text x="340" y="114" text-anchor="middle" fill="#ffffff" font-size="11">ERP: bandwidth 6000 kbps (guaranteed)</text>
<rect x="230" y="136" width="220" height="34" rx="4" fill="#f59e0b"/><text x="340" y="158" text-anchor="middle" fill="#000000" font-size="11">class-default: fair-queue (the rest)</text>
<text x="340" y="198" text-anchor="middle" class="svg-muted" font-size="11">Child WAN-CHILD inside the parent</text>
<line x1="465" y1="125" x2="540" y2="125" stroke="#2563eb" stroke-width="3"/>
<rect x="540" y="85" width="85" height="80" rx="8" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="582" y="120" text-anchor="middle" class="svg-ink" font-size="11">Provider</text>
<text x="582" y="138" text-anchor="middle" class="svg-ink" font-size="11">20 Mbps</text>
</svg><p class="cap">The parent creates the 19 Mbps bottleneck. The child decides what is served and what is dropped when the parent is full.</p></div>

<h3>How it is configured</h3>
<p>The child is an ordinary policy-map with LLQ and CBWFQ. The parent has only <code>class-default</code>, a <code>shape average</code>, and the line <code>service-policy CHILD</code> that nests the child. Only the parent is attached to the interface.</p>
<pre class="code">class-map match-any VOICE
 match dscp ef
class-map match-any ERP
 match dscp af31
!
policy-map WAN-CHILD
 class VOICE
  priority 2000
 class ERP
  bandwidth 6000
 class class-default
  fair-queue
!
policy-map WAN-SHAPE
 class class-default
  shape average 19000000
  service-policy WAN-CHILD
!
interface GigabitEthernet0/0
 service-policy output WAN-SHAPE</pre>

<div class="eg"><p><b>Worked example.</b> Pune offers 66 Mbps: bulk 60 Mbps, billing 5 Mbps, voice 0.6 Mbps. The parent lets 19 Mbps out. Voice is served first (0.6 of 2 Mbps priority used), billing takes its 5 Mbps (guarantee is 6 Mbps), and class-default gets what remains: 19 - 0.6 - 5 = 13.4 Mbps. The bulk flow offered 60 and gets about 13.4, so about 46.6 Mbps of bulk is dropped on R1. Voice and billing lose nothing.</p></div>

<h3>What the router shows</h3>
<p>This is the real output from the simulator after the lab load. Read it top down: the parent first, then the nested child with its own counters.</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/0 output
  Service-policy output: WAN-SHAPE
    Class-map: class-default (match-any)
      <span class="hl">shape (average) cir 19000000, bc 76000, be 76000</span>
      Service-policy : WAN-CHILD
        Class-map: VOICE (match-any)
          8000 packets, 1600000 bytes
          Priority: 2000 kbps, burst bytes 50000, <span class="hl">b/w exceed drops: 0</span>
          (queue depth/total drops/no-buffer drops) 0/0/0
        Class-map: class-default (match-any)
          400000 packets, 80000000 bytes
          30 second offered rate 42666667 bps, drop rate 23200000 bps
          (queue depth/total drops/no-buffer drops) 0/<span class="hl">217500</span>/0
          Fair-queue: per-flow queue limit 16 packets</pre>
<p>The drops are in the child class-default, on R1, exactly where you chose to put them. The provider policer on R2 now shows <code>exceeded 0 packets</code>, because the parent never sends more than 19 Mbps.</p>

<h3>Rules that decide whether it works</h3>
<ul>
<li><b>Child rates are relative to the parent shape rate</b>, not to the port speed. A 1 Gbps port does not help; the pipe is 19 Mbps.</li>
<li><b>Admission control.</b> The router refuses a child whose priority plus bandwidth cannot fit in the parent. The simulator prints <code>requested bandwidth 25000 (kbps), available only 19000 (kbps)</code> and <code>Service policy not attached</code>. Keep guarantees well below the parent so that class-default and routing protocols keep some capacity.</li>
<li><b>Only the parent is attached.</b> You cannot attach a child with a shaper to the interface and hope; the nesting line is what links them.</li>
<li><b>The parent is class-default only.</b> It shapes everything as one aggregate. If you need a separate shaper per destination (hub with many spokes), the parent has one class per destination, shown in chapter 7.</li>
<li><b>The priority class is also a policer</b> under congestion. If voice sends more than its priority rate while the parent is full, the excess is dropped (<code>b/w exceed drops</code>), so size it for the real call count with headroom.</li>
</ul>

<div class="note"><p><b>Junos note.</b> The same shape is hierarchical scheduling. A shaping-rate on the interface is the parent and the scheduler-map with a strict-high queue and transmit-rate queues is the child:</p>
<pre class="code">set class-of-service interfaces ge-0/0/0 shaping-rate 19m
set class-of-service interfaces ge-0/0/0 scheduler-map WAN-SCHED
set class-of-service schedulers S-VOICE priority strict-high
set class-of-service schedulers S-ERP transmit-rate 6m
set class-of-service schedulers S-BE transmit-rate remainder</pre>
<p>Here the child does not have to be nested by name: the scheduler-map belongs to the same interface that carries the shaping-rate.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Attaching the child to the interface and the parent never, so no shaper exists. (2) Shaping at the full contract (20 Mbps) so a small burst still reaches the provider policer. (3) A priority of 25 Mbps on a 19 Mbps parent: rejected. (4) Matching voice on cs5 when the phones send ef; the voice packets then fall into class-default and the priority queue shows 0 packets. (5) Forgetting that the child only works when the parent is congested; with traffic below 19 Mbps nothing is queued and no class is ever dropped.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a hierarchical policy you attach the <b>parent</b>, never the child. The parent shaper can only be in class-default for a single aggregate, and percent values in the child are percent of the parent shape rate.</p></div>

<div class="scn"><h4>The Pune billing outage on backup night</h4><p>Bharat Retail Pune has a 20 Mbps service on a 1 Gbps handoff. Every night at 1 am the bulk copy starts, the IP phones break up and the billing database drops sessions. The engineer sees the provider policer on R2 with 400,000 exceeded packets, so the provider is dropping at random. He builds WAN-CHILD with priority 2000 for ef and bandwidth 6000 for af31, nests it under WAN-SHAPE at 19 Mbps and attaches the parent on Gi0/0. The next night the drops are all in class-default on R1, the R2 policer shows zero exceeded, voice is clean and billing completes.</p><p><b>Lesson:</b> make the router own the bottleneck, then let the child choose the victims.</p></div>
<div class="iv"><p class="q">"Why a hierarchical policy and not just a shaper with LLQ?"</p><p>A shaper alone puts all traffic in one queue, and LLQ alone does nothing when the router thinks it has a 1 Gbps port. The parent shaper at just below the circuit rate creates the congestion on my device, and the nested child with a priority class for voice and a guaranteed class for business data decides who is served and who is dropped. Only the parent is attached to the interface and child rates are relative to the parent rate.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parent = class-default with shape average; child = LLQ, CBWFQ and fair-queue nested by service-policy.</li>
<li>Attach only the parent, outbound, on the interface that faces the slow service.</li>
<li>Child priority and bandwidth are measured against the parent rate; oversize requests are refused.</li>
<li>With the parent below the CIR, drops move from the provider to the lowest class on your router.</li>
<li>Check the nested counters: voice and billing with zero drops, bulk with the drops.</li>
</ul></div>
`,hi:`
<p>Chapter 4 ne aapko shaper diya, aur akele shaper mein ek kamzori hai: woh har packet ko ek jaisa maanta hai. Jab woh excess ko rokta hai to use ek hi line mein queue kar deta hai, isliye voice packet bulk copy ke peeche khada hota hai. Aap chahte ho ki shaper bottleneck <i>banaye</i> aur doosri policy tay kare ki uske andar <i>pehle kaun jaaye</i>. Yeh do-level design <b>hierarchical policy</b> hai, aur WAN edge par yeh sabse kaam ka QoS pattern hai.</p>

<h3>Ek tasveer mein idea: VIP lane wala toll gate</h3>
<p>Ek highway sochiye jo ek toll gate par sankri ho jaati hai. Gate gaadiyon ko ek tay raftaar se jaane deta hai (<b>parent</b>, shaper). Gate ka intezaar karti gaadiyan ek bewakoof queue mein nahi hain: ambulance lane pehle jaati hai, bus lane ko guaranteed hissa milta hai, aur baaki sab baari-baari se jaate hain (<b>child</b>, LLQ aur CBWFQ). Gate ke bina sadak chaudi hai aur koi queue nahi lagta, isliye ambulance lane kabhi use hi nahi hoti. Gate hi lanes ko matlab deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Parent shaper aur child policy">
<rect x="20" y="30" width="130" height="190" rx="8" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="85" y="22" text-anchor="middle" class="svg-ink" font-size="12">LAN ka traffic</text>
<text x="85" y="70" text-anchor="middle" class="svg-ink" font-size="11">Voice (EF)</text>
<text x="85" y="110" text-anchor="middle" class="svg-ink" font-size="11">Billing (AF31)</text>
<text x="85" y="150" text-anchor="middle" class="svg-ink" font-size="11">Bulk copy</text>
<text x="85" y="190" text-anchor="middle" class="svg-muted" font-size="11">66 Mbps offered</text>
<line x1="150" y1="65" x2="215" y2="65" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="105" x2="215" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="145" x2="215" y2="145" stroke="#64748b" stroke-width="2"/>
<rect x="215" y="30" width="250" height="190" rx="8" fill="none" stroke="#2563eb" stroke-width="2"/>
<text x="340" y="22" text-anchor="middle" class="svg-ink" font-size="12">Parent WAN-SHAPE: shape average 19 Mbps</text>
<rect x="230" y="48" width="220" height="34" rx="4" fill="#16a34a"/><text x="340" y="70" text-anchor="middle" fill="#ffffff" font-size="11">VOICE: priority 2000 kbps (pehle)</text>
<rect x="230" y="92" width="220" height="34" rx="4" fill="#2563eb"/><text x="340" y="114" text-anchor="middle" fill="#ffffff" font-size="11">ERP: bandwidth 6000 kbps (guaranteed)</text>
<rect x="230" y="136" width="220" height="34" rx="4" fill="#f59e0b"/><text x="340" y="158" text-anchor="middle" fill="#000000" font-size="11">class-default: fair-queue (baaki)</text>
<text x="340" y="198" text-anchor="middle" class="svg-muted" font-size="11">Parent ke andar child WAN-CHILD</text>
<line x1="465" y1="125" x2="540" y2="125" stroke="#2563eb" stroke-width="3"/>
<rect x="540" y="85" width="85" height="80" rx="8" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="582" y="120" text-anchor="middle" class="svg-ink" font-size="11">Provider</text>
<text x="582" y="138" text-anchor="middle" class="svg-ink" font-size="11">20 Mbps</text>
</svg><p class="cap">Parent 19 Mbps ka bottleneck banata hai. Parent full ho to child tay karta hai kaun serve hoga aur kaun drop.</p></div>

<h3>Ise configure kaise karte hain</h3>
<p>Child ek aam policy-map hai jisme LLQ aur CBWFQ hai. Parent mein sirf <code>class-default</code>, ek <code>shape average</code>, aur child ko nest karne wali line <code>service-policy CHILD</code> hoti hai. Interface par sirf parent lagta hai.</p>
<pre class="code">class-map match-any VOICE
 match dscp ef
class-map match-any ERP
 match dscp af31
!
policy-map WAN-CHILD
 class VOICE
  priority 2000
 class ERP
  bandwidth 6000
 class class-default
  fair-queue
!
policy-map WAN-SHAPE
 class class-default
  shape average 19000000
  service-policy WAN-CHILD
!
interface GigabitEthernet0/0
 service-policy output WAN-SHAPE</pre>

<div class="eg"><p><b>Worked example.</b> Pune 66 Mbps offer karta hai: bulk 60 Mbps, billing 5 Mbps, voice 0.6 Mbps. Parent 19 Mbps nikalne deta hai. Voice pehle serve hoti hai (2 Mbps priority mein se 0.6 use), billing apne 5 Mbps leti hai (guarantee 6 Mbps hai), aur class-default ko jo bacha woh milta hai: 19 - 0.6 - 5 = 13.4 Mbps. Bulk flow ne 60 offer kiya aur lagbhag 13.4 paya, yaani R1 par lagbhag 46.6 Mbps bulk drop hota hai. Voice aur billing kuch nahi khoti.</p></div>

<h3>Router kya dikhata hai</h3>
<p>Yeh lab load ke baad simulator ka asli output hai. Upar se neeche padho: pehle parent, phir nested child apne counters ke saath.</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/0 output
  Service-policy output: WAN-SHAPE
    Class-map: class-default (match-any)
      <span class="hl">shape (average) cir 19000000, bc 76000, be 76000</span>
      Service-policy : WAN-CHILD
        Class-map: VOICE (match-any)
          8000 packets, 1600000 bytes
          Priority: 2000 kbps, burst bytes 50000, <span class="hl">b/w exceed drops: 0</span>
          (queue depth/total drops/no-buffer drops) 0/0/0
        Class-map: class-default (match-any)
          400000 packets, 80000000 bytes
          30 second offered rate 42666667 bps, drop rate 23200000 bps
          (queue depth/total drops/no-buffer drops) 0/<span class="hl">217500</span>/0
          Fair-queue: per-flow queue limit 16 packets</pre>
<p>Drops child ki class-default mein hain, R1 par, bilkul wahan jahan aapne unhe rakhna chaha. R2 ka provider policer ab <code>exceeded 0 packets</code> dikhata hai, kyunki parent kabhi 19 Mbps se zyada nahi bhejta.</p>

<h3>Woh niyam jo tay karte hain ki yeh chalega ya nahi</h3>
<ul>
<li><b>Child rates parent shape rate ke relative hote hain</b>, port speed ke nahi. 1 Gbps port se madad nahi milti; pipe 19 Mbps ki hai.</li>
<li><b>Admission control.</b> Router aise child ko mana kar deta hai jiska priority aur bandwidth parent mein fit nahi hota. Simulator <code>requested bandwidth 25000 (kbps), available only 19000 (kbps)</code> aur <code>Service policy not attached</code> chhapta hai. Guarantees ko parent se kaafi neeche rakho taaki class-default aur routing protocols ke liye kuch capacity bache.</li>
<li><b>Sirf parent attach hota hai.</b> Aap shaper wale child ko interface par lagakar umeed nahi kar sakte; nesting wali line hi dono ko jodti hai.</li>
<li><b>Parent sirf class-default hota hai.</b> Woh sab kuch ek aggregate ki tarah shape karta hai. Agar har destination ke liye alag shaper chahiye (bahut spokes wala hub), to parent mein har destination ki ek class hoti hai, jo chapter 7 mein hai.</li>
<li><b>Congestion mein priority class policer bhi hai.</b> Parent full ho aur voice apne priority rate se zyada bheje to excess drop hota hai (<code>b/w exceed drops</code>), isliye use asli call count ke hisaab se headroom ke saath size karo.</li>
</ul>

<div class="note"><p><b>Junos note.</b> Wahi shape hierarchical scheduling hai. Interface par shaping-rate parent hai aur strict-high queue wala scheduler-map aur transmit-rate queues child hain:</p>
<pre class="code">set class-of-service interfaces ge-0/0/0 shaping-rate 19m
set class-of-service interfaces ge-0/0/0 scheduler-map WAN-SCHED
set class-of-service schedulers S-VOICE priority strict-high
set class-of-service schedulers S-ERP transmit-rate 6m
set class-of-service schedulers S-BE transmit-rate remainder</pre>
<p>Yahan child ko naam se nest nahi karna padta: scheduler-map usi interface ka hai jis par shaping-rate hai.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Child ko interface par lagana aur parent kabhi nahi, to koi shaper hota hi nahi. (2) Poore contract (20 Mbps) par shape karna, isliye chhota burst bhi provider policer tak pahunch jaata hai. (3) 19 Mbps parent par 25 Mbps ka priority: reject ho jaata hai. (4) Voice ko cs5 par match karna jabki phones ef bhejte hain; voice packets class-default mein girte hain aur priority queue 0 packets dikhati hai. (5) Yeh bhoolna ki child tabhi kaam karta hai jab parent congested ho; 19 Mbps se kam traffic mein kuch queue nahi hota aur koi class kabhi drop nahi hoti.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hierarchical policy mein <b>parent</b> attach hota hai, child kabhi nahi. Parent shaper ek single aggregate ke liye sirf class-default mein ho sakta hai, aur child ke percent values parent shape rate ke percent hain.</p></div>

<div class="scn"><h4>Backup raat ko Pune billing outage</h4><p>Bharat Retail Pune ki 20 Mbps service 1 Gbps handoff par hai. Har raat 1 baje bulk copy shuru hoti hai, IP phones toot-te hain aur billing database ke sessions gir jaate hain. Engineer R2 par provider policer mein 400,000 exceeded packets dekhta hai, yaani provider random drop kar raha hai. Woh ef ke liye priority 2000 aur af31 ke liye bandwidth 6000 wala WAN-CHILD banata hai, use WAN-SHAPE ke andar 19 Mbps par nest karta hai aur parent ko Gi0/0 par lagata hai. Agli raat saare drops R1 ki class-default mein hain, R2 policer zero exceeded dikhata hai, voice saaf hai aur billing poori hoti hai.</p><p><b>Lesson:</b> bottleneck router ka ho, phir child tay kare kaun shikaar banega.</p></div>
<div class="iv"><p class="q">"Sirf LLQ wale shaper ki jagah hierarchical policy kyun?"</p><p>Akela shaper saare traffic ko ek queue mein rakhta hai, aur akeli LLQ kuch nahi karti jab router ko lagta hai ki uske paas 1 Gbps port hai. Circuit rate se thoda neeche parent shaper congestion mere device par banata hai, aur nested child, jisme voice ke liye priority class aur business data ke liye guaranteed class hai, tay karta hai kaun serve hoga aur kaun drop. Interface par sirf parent attach hota hai aur child rates parent rate ke relative hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parent = shape average wali class-default; child = LLQ, CBWFQ aur fair-queue, service-policy se nest.</li>
<li>Sirf parent attach karo, outbound, slow service ki taraf wale interface par.</li>
<li>Child priority aur bandwidth parent rate ke against naape jaate hain; oversize request reject hoti hai.</li>
<li>CIR se neeche parent hone par drops provider se hatkar aapke router ki sabse neeche wali class mein aate hain.</li>
<li>Nested counters dekho: voice aur billing zero drops, bulk mein drops.</li>
</ul></div>
`}};export{e as default};