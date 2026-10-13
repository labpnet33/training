var e={id:`localized-policy`,h:{en:`The localized policy toolbox: class map, scheduler, QoS map, rewrite rule, policer`,hi:`Localized policy toolbox: class map, scheduler, QoS map, rewrite rule, policer`},body:{en:`
<p>Think of a restaurant kitchen. The order slip says what the dish is (classification). A chart on the wall says which counter prepares it (the class map: dish type to counter). Each counter has a rule: the grill gets 40 percent of the chefs, the salad counter 10 percent (the scheduler). The whole chart together is the kitchen plan (the QoS map). A final rule on the pass decides how the dish is labelled for the delivery boy (the rewrite rule). In Catalyst SD-WAN these are the parts of a <b>localized policy</b>.</p>

<h3>What is a localized policy?</h3>
<p>A <b>localized policy</b> is configuration that is applied on the edge itself and affects only that router's local behaviour: QoS, ACLs, route policy for BGP and OSPF, and policers. It is built in Manager under <b>Configuration &gt; Policies &gt; Localized Policy</b> and then attached to a device template (legacy model) or applied through the configuration group (modern model, see the sdw-templates module). Unlike centralized policy, the Controller does not distribute it. The policy wizard has stages: groups of interest, forwarding classes and QoS, ACLs, route policy and policy settings. This chapter covers the QoS pieces.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Localized policy QoS building blocks">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Class map</text><text x="85" y="60" text-anchor="middle" class="svg-muted" font-size="12">class to queue</text>
<rect x="180" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="245" y="42" text-anchor="middle" class="svg-ink" font-size="13">QoS scheduler</text><text x="245" y="60" text-anchor="middle" class="svg-muted" font-size="12">bandwidth, drops</text>
<rect x="340" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="42" text-anchor="middle" class="svg-ink" font-size="13">QoS map</text><text x="405" y="60" text-anchor="middle" class="svg-muted" font-size="12">up to 8 schedulers</text>
<rect x="500" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">Rewrite rule</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">class to DSCP</text>
<rect x="100" y="120" width="130" height="50" rx="8" fill="#fed7aa"/><text x="165" y="142" text-anchor="middle" class="svg-ink" font-size="13">ACL</text><text x="165" y="160" text-anchor="middle" class="svg-muted" font-size="12">match, class, DSCP</text>
<rect x="260" y="120" width="130" height="50" rx="8" fill="#fed7aa"/><text x="325" y="142" text-anchor="middle" class="svg-ink" font-size="13">Policer</text><text x="325" y="160" text-anchor="middle" class="svg-muted" font-size="12">rate and burst</text>
<rect x="150" y="200" width="340" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">Template: interface gets QoS map, rewrite rule, shaping rate, ACL</text>
<line x1="150" y1="45" x2="180" y2="45" stroke="#64748b" stroke-width="2"/><line x1="310" y1="45" x2="340" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="405" y1="70" x2="330" y2="200" stroke="#64748b" stroke-width="1.5"/><line x1="560" y1="70" x2="480" y2="200" stroke="#64748b" stroke-width="1.5"/><line x1="165" y1="170" x2="230" y2="200" stroke="#64748b" stroke-width="1.5"/><line x1="325" y1="170" x2="325" y2="200" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Five objects are defined once in the localized policy; the interface template then picks the ones it needs.</p></div>

<h3>Class map: forwarding class to queue</h3>
<p>The <b>class map</b> gives each forwarding class a name and an output <b>queue number</b>. A router has <b>eight queues, 0 to 7</b>. Queue 0 is special: it carries control traffic (the router's own protocol traffic) and is the <b>low-latency queue (LLQ)</b>. Any class mapped to queue 0 <b>must</b> use LLQ scheduling and tail drop. Queues 1 to 7 use weighted round robin. If you configure no QoS, everything goes to queue 2. Traffic that matches no class falls into the built-in class-default, which also uses queue 2 (see the Cisco note on class-default behaviour; the Manager GUI does not show statistics for it, so many designers create an explicit DEFAULT class on queue 2).</p>
<pre class="code">policy
 class-map
  class VOICE queue 0
  class VIDEO queue 1
  class DEFAULT queue 2
  class CRITICAL queue 3
  class BULK queue 4
 !
!</pre>

<h3>QoS scheduler and QoS map: how each queue is served</h3>
<p>A <b>QoS scheduler</b> describes one queue: which class it serves, its <b>bandwidth percent</b> and <b>buffer percent</b>, the <b>scheduling</b> type (<code>llq</code> or <code>wrr</code>) and the <b>drop</b> type (<code>tail-drop</code> or <code>red-drop</code>). A <b>QoS map</b> is the list of schedulers applied together to one interface. Chapter 4 explains the meaning of every field.</p>
<pre class="code">policy
 qos-scheduler VOICE-SCH
  class              VOICE
  bandwidth-percent  20
  buffer-percent     20
  scheduling         llq
  drops              tail-drop
 !
 qos-scheduler VIDEO-SCH
  class              VIDEO
  bandwidth-percent  25
  buffer-percent     25
  scheduling         wrr
  drops              red-drop
 !
 qos-map QOS-5Q
  qos-scheduler VOICE-SCH
  qos-scheduler VIDEO-SCH
  <span class="c">! ...CRITICAL-SCH, DEFAULT-SCH, BULK-SCH follow the same pattern</span>
 !
!</pre>

<h3>Rewrite rule: class and loss priority to DSCP on the way out</h3>
<p>A <b>rewrite rule</b> changes the DSCP (and Layer 2 CoS) of packets as they leave the interface, based on forwarding class and <b>packet loss priority (PLP)</b>. PLP is <i>low</i> by default and becomes <i>high</i> when a policer marks excess traffic with <code>exceed remark</code>. You use a rewrite rule to speak the provider's language (chapter 7).</p>
<pre class="code">policy
 rewrite-rule RW-TO-MPLS
  class VOICE low dscp 46
  class VIDEO low dscp 34
  class CRITICAL low dscp 18
  class CRITICAL high dscp 20
  class BULK low dscp 8
  class DEFAULT low dscp 0
 !
!</pre>

<h3>Policer: a hard limit on a flow of traffic</h3>
<p>A <b>policer</b> measures traffic against a <b>rate</b> (bits per second) and a <b>burst</b> (bytes, minimum 15,000) and either <b>drops</b> the excess or <b>remarks</b> it (sets PLP to high). It is referenced from an ACL action. Cisco documents that the router calculates the burst on a 250 ms tolerance and uses the higher of the calculated and the configured value, so a 100 Mbps policer gets a 3,125,000 byte default burst.</p>
<pre class="code">policy
 policer POL-BULK-5M
  rate   5000000
  burst  100000
  exceed drop
 !
 access-list ACL-LIMIT-BACKUP
  sequence 10
   match
    destination-port 873
    protocol 6
   !
   action accept
    policer POL-BULK-5M
    class BULK
   !
  !
  default-action accept
 !
!</pre>

<h3>Attaching to the interface through the template</h3>
<p>The policy objects do nothing until the interface references them. In a feature template this is the <b>VPN Interface Ethernet</b> template, section <b>ACL/QoS</b>: <i>Shaping Rate</i>, <i>QoS Map</i>, <i>Rewrite Rule</i> and the <i>ingress ACL</i>. The WAN interface (VPN 0) gets the QoS map, shaping rate and rewrite rule; the LAN interface (service VPN) gets the classifying ACL inbound. The localized policy itself must also be selected in the device template (Additional Templates, Policy field), otherwise the template push fails because the named objects do not exist.</p>

<div class="eg"><p><b>Worked example.</b> Edge E-DEL-1 has WAN interface GigabitEthernet1 (biz-internet, 100 Mbps) and LAN GigabitEthernet4 in VPN 10. The template for GigabitEthernet1 sets <i>QoS Map = QOS-5Q</i>, <i>Rewrite Rule = RW-TO-MPLS</i> and <i>Shaping Rate = 100000 kbps</i>. The template for GigabitEthernet4 sets <i>Ingress ACL = ACL-CLASSIFY</i> from chapter 2. One policy, one template group, hundreds of branches.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deleting or renaming a class that is still used by an ACL, scheduler or rewrite rule. Manager blocks the change or the push fails. Change names consistently across all objects, and remember that a scheduler can serve exactly one class.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <b>class map</b> maps a class to a queue; the <b>QoS scheduler</b> defines queue behaviour; the <b>QoS map</b> groups schedulers and is what the interface references; the <b>rewrite rule</b> changes DSCP on egress; the <b>policer</b> is invoked from an ACL. Queue 0 must be LLQ with tail drop.</p></div>

<div class="scn"><h4>Template push fails after a QoS change</h4><p>An engineer renamed class VOIP to VOICE in the class map but not in the rewrite rule. Manager refused to push the template to 40 branches with a reference error on the rewrite rule. The fix was to edit the rewrite rule to use VOICE, then re-attach. No branch was changed because the push is validated before it is sent.</p><p><b>Lesson:</b> localized policy objects reference each other by name; keep them consistent.</p></div>

<div class="iv"><p class="q">"Name the QoS objects of a localized policy and say what each does."</p><p>Class map: forwarding class to queue number. QoS scheduler: bandwidth, buffer, scheduling (LLQ or WRR) and drop type for one class. QoS map: the set of schedulers applied to an interface. Rewrite rule: DSCP and CoS written on egress by class and PLP. Policer: rate and burst limit with drop or remark, invoked from an ACL. All are attached to interfaces through the template.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Localized policy is applied on the edge; the Controller does not distribute it.</li>
<li>Eight queues: queue 0 is LLQ (and control traffic); queues 1 to 7 are WRR; unclassified traffic uses queue 2.</li>
<li>Scheduler = one queue's rules; QoS map = group of schedulers on an interface.</li>
<li>Rewrite rules act on egress by class and PLP; policers act from ACLs.</li>
<li>The interface template must reference the objects, and the policy must be in the device template.</li>
</ul></div>
`,hi:`
<p>Restaurant ka kitchen socho. Order slip batati hai dish kya hai (classification). Deewar par chart batata hai kaun sa counter use banayega (class map: dish type se counter). Har counter ka rule hota hai: grill ko 40 percent chef milte hain, salad counter ko 10 percent (scheduler). Poora chart milkar kitchen plan hai (QoS map). Pass par ek aakhri rule tay karta hai ki delivery boy ke liye dish par kya label lage (rewrite rule). Catalyst SD-WAN mein yeh <b>localized policy</b> ke hisse hain.</p>

<h3>Localized policy kya hai?</h3>
<p><b>Localized policy</b> woh configuration hai jo edge par hi lagta hai aur sirf us router ke local behaviour ko affect karta hai: QoS, ACLs, BGP aur OSPF ke liye route policy, aur policers. Yeh Manager mein <b>Configuration &gt; Policies &gt; Localized Policy</b> mein banti hai aur phir device template (legacy model) se attach hoti hai ya configuration group (modern model, sdw-templates module dekho) se lagti hai. Centralized policy se alag, Controller ise distribute nahi karta. Policy wizard ke stages hain: groups of interest, forwarding classes aur QoS, ACLs, route policy aur policy settings. Yeh chapter QoS ke hisson ko cover karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Localized policy QoS building blocks">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Class map</text><text x="85" y="60" text-anchor="middle" class="svg-muted" font-size="12">class se queue</text>
<rect x="180" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="245" y="42" text-anchor="middle" class="svg-ink" font-size="13">QoS scheduler</text><text x="245" y="60" text-anchor="middle" class="svg-muted" font-size="12">bandwidth, drops</text>
<rect x="340" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="42" text-anchor="middle" class="svg-ink" font-size="13">QoS map</text><text x="405" y="60" text-anchor="middle" class="svg-muted" font-size="12">8 tak schedulers</text>
<rect x="500" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">Rewrite rule</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">class se DSCP</text>
<rect x="100" y="120" width="130" height="50" rx="8" fill="#fed7aa"/><text x="165" y="142" text-anchor="middle" class="svg-ink" font-size="13">ACL</text><text x="165" y="160" text-anchor="middle" class="svg-muted" font-size="12">match, class, DSCP</text>
<rect x="260" y="120" width="130" height="50" rx="8" fill="#fed7aa"/><text x="325" y="142" text-anchor="middle" class="svg-ink" font-size="13">Policer</text><text x="325" y="160" text-anchor="middle" class="svg-muted" font-size="12">rate aur burst</text>
<rect x="150" y="200" width="340" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">Template: interface ko QoS map, rewrite, shaping, ACL milta hai</text>
<line x1="150" y1="45" x2="180" y2="45" stroke="#64748b" stroke-width="2"/><line x1="310" y1="45" x2="340" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="405" y1="70" x2="330" y2="200" stroke="#64748b" stroke-width="1.5"/><line x1="560" y1="70" x2="480" y2="200" stroke="#64748b" stroke-width="1.5"/><line x1="165" y1="170" x2="230" y2="200" stroke="#64748b" stroke-width="1.5"/><line x1="325" y1="170" x2="325" y2="200" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Paanch objects localized policy mein ek baar define hote hain; interface template unmein se zaroori wale chunta hai.</p></div>

<h3>Class map: forwarding class se queue</h3>
<p><b>Class map</b> har forwarding class ko naam aur ek output <b>queue number</b> deta hai. Router mein <b>aath queues, 0 se 7</b> hoti hain. Queue 0 khaas hai: yeh control traffic (router ka apna protocol traffic) ko carry karti hai aur <b>low-latency queue (LLQ)</b> hai. Queue 0 par map hui koi bhi class <b>zaroor</b> LLQ scheduling aur tail drop use kare. Queues 1 se 7 weighted round robin use karti hain. Agar QoS configure nahi kiya to sab kuch queue 2 mein jaata hai. Jo traffic kisi class se match nahi karta woh built-in class-default mein girta hai, jo bhi queue 2 use karta hai (Cisco ka class-default note dekho; Manager GUI iske statistics nahi dikhata, isliye kai designers queue 2 par explicit DEFAULT class banate hain).</p>
<pre class="code">policy
 class-map
  class VOICE queue 0
  class VIDEO queue 1
  class DEFAULT queue 2
  class CRITICAL queue 3
  class BULK queue 4
 !
!</pre>

<h3>QoS scheduler aur QoS map: har queue kaise serve hoti hai</h3>
<p><b>QoS scheduler</b> ek queue ko describe karta hai: kaunsi class serve karta hai, uska <b>bandwidth percent</b> aur <b>buffer percent</b>, <b>scheduling</b> type (<code>llq</code> ya <code>wrr</code>) aur <b>drop</b> type (<code>tail-drop</code> ya <code>red-drop</code>). <b>QoS map</b> ek interface par saath lagne wale schedulers ki list hai. Har field ka matlab chapter 4 mein samjhaya gaya hai.</p>
<pre class="code">policy
 qos-scheduler VOICE-SCH
  class              VOICE
  bandwidth-percent  20
  buffer-percent     20
  scheduling         llq
  drops              tail-drop
 !
 qos-scheduler VIDEO-SCH
  class              VIDEO
  bandwidth-percent  25
  buffer-percent     25
  scheduling         wrr
  drops              red-drop
 !
 qos-map QOS-5Q
  qos-scheduler VOICE-SCH
  qos-scheduler VIDEO-SCH
  <span class="c">! ...CRITICAL-SCH, DEFAULT-SCH, BULK-SCH isi pattern par</span>
 !
!</pre>

<h3>Rewrite rule: jaate waqt class aur loss priority se DSCP</h3>
<p><b>Rewrite rule</b> interface se nikalte packets ka DSCP (aur Layer 2 CoS) forwarding class aur <b>packet loss priority (PLP)</b> ke hisaab se badalta hai. PLP by default <i>low</i> hota hai aur policer jab <code>exceed remark</code> se excess traffic mark kare to <i>high</i> ho jaata hai. Rewrite rule se aap provider ki bhasha bolte ho (chapter 7).</p>
<pre class="code">policy
 rewrite-rule RW-TO-MPLS
  class VOICE low dscp 46
  class VIDEO low dscp 34
  class CRITICAL low dscp 18
  class CRITICAL high dscp 20
  class BULK low dscp 8
  class DEFAULT low dscp 0
 !
!</pre>

<h3>Policer: traffic par hard limit</h3>
<p><b>Policer</b> traffic ko <b>rate</b> (bits per second) aur <b>burst</b> (bytes, minimum 15,000) se naapta hai aur excess ko ya to <b>drop</b> karta hai ya <b>remark</b> (PLP high set) karta hai. Ise ACL action se refer karte hain. Cisco document karta hai ki router burst ko 250 ms tolerance par calculate karta hai aur calculated aur configured mein se bada value use karta hai, isliye 100 Mbps policer ko 3,125,000 byte default burst milta hai.</p>
<pre class="code">policy
 policer POL-BULK-5M
  rate   5000000
  burst  100000
  exceed drop
 !
 access-list ACL-LIMIT-BACKUP
  sequence 10
   match
    destination-port 873
    protocol 6
   !
   action accept
    policer POL-BULK-5M
    class BULK
   !
  !
  default-action accept
 !
!</pre>

<h3>Template ke zariye interface par lagana</h3>
<p>Policy objects tab tak kuch nahi karte jab tak interface unhe reference na kare. Feature template mein yeh <b>VPN Interface Ethernet</b> template ka <b>ACL/QoS</b> section hai: <i>Shaping Rate</i>, <i>QoS Map</i>, <i>Rewrite Rule</i> aur <i>ingress ACL</i>. WAN interface (VPN 0) ko QoS map, shaping rate aur rewrite rule milta hai; LAN interface (service VPN) ko classify karne wala ACL inbound milta hai. Localized policy ko device template mein bhi select karna padta hai (Additional Templates, Policy field), warna template push fail hota hai kyunki named objects maujood nahi hote.</p>

<div class="eg"><p><b>Worked example.</b> Edge E-DEL-1 ka WAN interface GigabitEthernet1 (biz-internet, 100 Mbps) aur LAN GigabitEthernet4 VPN 10 mein hai. GigabitEthernet1 ka template <i>QoS Map = QOS-5Q</i>, <i>Rewrite Rule = RW-TO-MPLS</i> aur <i>Shaping Rate = 100000 kbps</i> set karta hai. GigabitEthernet4 ka template chapter 2 ka <i>Ingress ACL = ACL-CLASSIFY</i> set karta hai. Ek policy, ek template group, saikdon branches.</p></div>

<div class="warn"><p><b>Common mistake.</b> Aisi class ko delete ya rename karna jo abhi ACL, scheduler ya rewrite rule mein use ho rahi hai. Manager change block karta hai ya push fail hota hai. Naam saare objects mein ek jaisa badlo, aur yaad rakho ki ek scheduler sirf ek class ko serve karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Class map</b> class ko queue se map karta hai; <b>QoS scheduler</b> queue ka behaviour define karta hai; <b>QoS map</b> schedulers ko group karta hai aur interface use reference karta hai; <b>rewrite rule</b> egress par DSCP badalta hai; <b>policer</b> ACL se invoke hota hai. Queue 0 LLQ aur tail drop honi chahiye.</p></div>

<div class="scn"><h4>QoS change ke baad template push fail</h4><p>Ek engineer ne class map mein class VOIP ko VOICE rename kiya lekin rewrite rule mein nahi. Manager ne 40 branches par template push karne se mana kar diya, rewrite rule mein reference error ke saath. Fix: rewrite rule mein VOICE use karna, phir re-attach. Kisi branch mein change nahi hua kyunki push bhejne se pehle validate hota hai.</p><p><b>Lesson:</b> localized policy objects ek dusre ko naam se refer karte hain; unhe consistent rakho.</p></div>

<div class="iv"><p class="q">"Localized policy ke QoS objects ke naam batao aur har ek ka kaam."</p><p>Class map: forwarding class se queue number. QoS scheduler: ek class ke liye bandwidth, buffer, scheduling (LLQ ya WRR) aur drop type. QoS map: interface par lagne wale schedulers ka set. Rewrite rule: egress par class aur PLP se DSCP aur CoS likhta hai. Policer: ACL se invoke hone wali rate aur burst limit, drop ya remark ke saath. Sab template se interfaces par attach hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Localized policy edge par lagti hai; Controller ise distribute nahi karta.</li>
<li>Aath queues: queue 0 LLQ (aur control traffic); queues 1 se 7 WRR; unclassified traffic queue 2.</li>
<li>Scheduler = ek queue ke rules; QoS map = interface par schedulers ka group.</li>
<li>Rewrite rules egress par class aur PLP se chalte hain; policers ACLs se.</li>
<li>Interface template objects ko reference kare, aur policy device template mein ho.</li>
</ul></div>
`}};export{e as default};