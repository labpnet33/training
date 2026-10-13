var e={id:`provider`,h:{en:`Provider interplay: CIR, provider classes, remarking and per-spoke shaping`,hi:`Provider interplay: CIR, provider classes, remarking aur per-spoke shaping`},body:{en:`
<p>Everything so far lived on your own router. But the WAN edge is a contract between two parties, and the other party has its own policy. If your design ignores what the provider does, you can have perfect configuration and still lose voice. This chapter covers the three places where your policy and the provider policy meet: the <b>rate</b> (CIR), the <b>classes</b>, and the <b>markings</b>.</p>

<h3>The idea in one picture: the post office with a weight limit</h3>
<p>You hand parcels to a courier company. The company says: we carry up to 20 kg an hour for you. A fast driver arrives and you load 60 kg. At the counter a clerk takes the first 20 kg and throws the rest away, without checking which parcels were medicine. If you sort the parcels yourself and send medicine first, never more than 19 kg an hour, everything important arrives. The clerk is the provider policer, your sorting is your child policy, and the 19 kg limit is your parent shaper.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Three cities and the provider">
<rect x="20" y="20" width="150" height="70" rx="8" fill="none" stroke="#64748b" stroke-width="2"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="12">Mumbai CE-MUM</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="11">CIR 100 Mbps (hub)</text>
<rect x="20" y="115" width="150" height="70" rx="8" fill="none" stroke="#64748b" stroke-width="2"/><text x="95" y="143" text-anchor="middle" class="svg-ink" font-size="12">Pune CE-PUN</text><text x="95" y="163" text-anchor="middle" class="svg-muted" font-size="11">CIR 20 Mbps</text>
<rect x="20" y="210" width="150" height="70" rx="8" fill="none" stroke="#64748b" stroke-width="2"/><text x="95" y="238" text-anchor="middle" class="svg-ink" font-size="12">Delhi CE-DEL</text><text x="95" y="258" text-anchor="middle" class="svg-muted" font-size="11">CIR 30 Mbps</text>
<line x1="170" y1="55" x2="300" y2="140" stroke="#2563eb" stroke-width="3"/>
<line x1="170" y1="150" x2="300" y2="150" stroke="#2563eb" stroke-width="3"/>
<line x1="170" y1="245" x2="300" y2="160" stroke="#2563eb" stroke-width="3"/>
<text x="220" y="88" class="svg-muted" font-size="10">1 Gbps handoff</text>
<rect x="300" y="105" width="150" height="90" rx="10" fill="none" stroke="#dc2626" stroke-width="2"/><text x="375" y="135" text-anchor="middle" class="svg-ink" font-size="12">MPLS-PE</text><text x="375" y="155" text-anchor="middle" class="svg-muted" font-size="11">policer per port</text><text x="375" y="175" text-anchor="middle" class="svg-muted" font-size="11">at each site CIR</text>
<line x1="450" y1="150" x2="520" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="580" y="140" text-anchor="middle" class="svg-ink" font-size="12">Provider</text><text x="580" y="158" text-anchor="middle" class="svg-ink" font-size="12">cloud</text>
</svg><p class="cap">Three cities, one MPLS service. Every handoff is 1 Gbps; every contract is different. The PE polices each port at that city CIR.</p></div>

<h3>1. The rate: shape each CE to its own CIR</h3>
<p>Each city has its own contract, so each CE gets its own parent shaper just below its own CIR: about 19 Mbps in Pune and 29 Mbps in Delhi. Mumbai is more interesting. It has a 100 Mbps contract but it talks to two spokes that are slower than it is. If Mumbai sends 60 Mbps to Pune, the Pune port policer in the provider drops everything above 20 Mbps, even though Mumbai is far below its own 100. So the hub needs <b>one shaper per destination</b>: a parent policy with one class per spoke, matched by an ACL on the destination network, and each class shapes to just below that spoke CIR with the same child nested.</p>
<pre class="code">ip access-list extended TO-PUNE
 permit ip any 10.1.2.0 0.0.0.255
ip access-list extended TO-DELHI
 permit ip any 10.1.3.0 0.0.0.255
class-map match-any TO-PUNE
 match access-group name TO-PUNE
class-map match-any TO-DELHI
 match access-group name TO-DELHI
!
policy-map MUM-HUB
 class TO-PUNE
  shape average 19000000
  service-policy WAN-CHILD
 class TO-DELHI
  shape average 29000000
  service-policy WAN-CHILD
!
interface GigabitEthernet0/0
 service-policy output MUM-HUB</pre>
<p>The spokes each need only the simple parent from chapter 5 (one class-default, one shape rate). Only the hub needs the multi-class parent, because only the hub has more than one destination with a different rate.</p>
<pre class="out">CE-MUM#show policy-map interface GigabitEthernet0/0 output
  Service-policy output: MUM-HUB
    Class-map: TO-PUNE (match-any)
      Match: access-group name TO-PUNE
      shape (average) cir <span class="hl">19000000</span>, bc 76000, be 76000
      Service-policy : WAN-CHILD
        Class-map: class-default (match-any)
          (queue depth/total drops/no-buffer drops) 0/<span class="hl">417500</span>/0
    Class-map: TO-DELHI (match-any)
      shape (average) cir <span class="hl">29000000</span>, bc 116000, be 116000
      Service-policy : WAN-CHILD</pre>
<p>Now the proof on the provider side. After the same load, the PE port that faces Pune shows zero exceeded packets, because the hub never sent Pune more than 19 Mbps:</p>
<pre class="out">MPLS-PE#show policy-map interface GigabitEthernet0/1 output
  Service-policy output: CIR-20M
    Class-map: class-default (match-any)
      police:
          cir 20000000 bps, bc 2500000 bytes
        conformed 190500 packets, 38100000 bytes; actions:
          transmit
        <span class="hl">exceeded 0 packets, 0 bytes</span>; actions:
          drop</pre>
<div class="eg"><p><b>Worked example.</b> Mumbai sends bulk 60 Mbps to Pune, bulk 50 Mbps to Delhi and some voice to each. Pune shaper 19 Mbps, Delhi shaper 29 Mbps. Total out of the 1 Gbps port is 48 Mbps, far below the 100 Mbps contract, and still every packet toward Pune stays within 20 Mbps. Without per-spoke shapers the same 48 Mbps would put 60 Mbps of demand on a 20 Mbps Pune port.</p></div>

<h3>2. The classes: the provider has its own queues</h3>
<p>Many MPLS services sell classes of service (for example a real-time, a business and a best-effort class), each with its own share of the CIR and its own drop behaviour. The provider decides which class a packet belongs to by its DSCP at the edge. So you need three things in writing: the <b>list of provider classes</b>, the <b>DSCP values that map to each</b>, and the <b>rate of each class</b>. Your child policy then uses the same names and values. If the provider real-time class is 2 Mbps and you put 6 Mbps of EF in your priority queue, the extra 4 Mbps arrives in the provider as out-of-contract and is dropped or remarked.</p>

<h3>3. The markings: trust, remark and the missing EF</h3>
<p>The most common provider-side surprise is <b>remarking</b>. A PE port can trust the DSCP you send, or it can rewrite it to a default (often 0) or to a class value it prefers. Symptoms: the voice class is full on the sending CE but the receiving CE shows voice in class-default; a capture at the far site shows DSCP 0. Your end-to-end design then breaks halfway even though both policies are perfect.</p>
<ul>
<li><b>Ask</b> whether the PE trusts DSCP on your port, and what happens to a DSCP that is not in the table.</li>
<li><b>Map</b> on the CE: send the value the provider expects (for example mark voice cs5 if their real-time class is cs5), and map back on the receiving CE if the provider rewrites it.</li>
<li><b>Verify</b> with the DSCP counters at both ends, not only at the sender.</li>
<li><b>Stop gap</b> if the provider will not trust: classify at the far end by address and port instead of by DSCP.</li>
</ul>

<h3>Backup path: the Internet circuit</h3>
<p>Each city also has an Internet circuit (a second port on the CE). It has its own rate and no provider classes, since the Internet does not honour DSCP across carriers. It needs its own parent shaper below its own rate and, ideally, the same child policy, so that voice is still protected after a failover. A backup circuit without a policy is a very common incident.</p>

<div class="note"><p><b>Junos note.</b> On a Junos PE or CE the contract is a policer applied as a firewall filter or an interface policer, and the shape is the shaping-rate per logical interface or per VLAN:</p>
<pre class="code">set firewall policer CIR-20M if-exceeding bandwidth-limit 20m burst-size-limit 2500k
set firewall policer CIR-20M then discard
set interfaces ge-0/0/1 unit 0 family inet policer input CIR-20M
set class-of-service interfaces ge-0/0/0 unit 100 shaping-rate 19m</pre>
<p>On a hub, one logical unit (or VLAN) per spoke each with its own shaping-rate is the same idea as one class per spoke in MQC.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Shaping the hub at its own contract (100 Mbps) so the spokes are flooded past their policers. (2) Using one common shape rate on all spokes. (3) Not getting the provider class map and DSCP table in writing. (4) A priority class bigger than the provider real-time class. (5) Testing only one direction: each PE port policer works both ways and the return direction needs its own shaper on the other CE. (6) Forgetting the Internet backup circuit.</p></div>
<div class="exam"><p><b>Exam trap.</b> The shape rate is set by the <b>destination</b> contract, not by the sending site. A big hub sending to a small spoke must be shaped to the spoke rate. Shape just below the CIR; never above.</p></div>

<div class="scn"><h4>Deccan Broadcast: the hub that flooded the small spokes</h4><p>Deccan Broadcast joins Mumbai (100 Mbps), Pune (20) and Delhi (30) over MPLS. The Pune editors complain that edit sessions to the Mumbai server stall every afternoon when a large render is copied from Mumbai. The Mumbai CE has one shaper at 95 Mbps and the Pune PE port shows 400,000 exceeded packets. The engineer replaces it with MUM-HUB: TO-PUNE at 19 Mbps and TO-DELHI at 29 Mbps with the child nested in each. After the same copy the Pune port shows zero exceeded, the drops are in the Mumbai class-default for TO-PUNE, and the edit sessions no longer stall.</p><p><b>Lesson:</b> the contract that matters is the one at the receiving port.</p></div>
<div class="iv"><p class="q">"You have a hub with 100 Mbps and spokes with 20 and 30. How do you shape?"</p><p>One parent class per spoke on the hub, matched by destination network, each shaped to just below that spoke CIR with the same child policy nested, so the traffic to a slow spoke never exceeds what the provider will accept there. Each spoke gets a single parent shaper just below its own CIR for the return direction. I get the provider class map in writing and prove it by checking that no PE port shows exceeded packets under load.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The provider policer is at the CIR of each port; shape every CE just below its own CIR.</li>
<li>A hub that sends to slower spokes needs one shaped class per spoke, matched by destination.</li>
<li>Get the provider class names, DSCP mapping and rates in writing and mirror them in the child policy.</li>
<li>Remarking at the PE shows as voice in class-default at the far site; compare DSCP counters at both ends.</li>
<li>The Internet backup circuit needs its own shaper and child policy too.</li>
</ul></div>
`,hi:`
<p>Ab tak sab kuch aapke apne router par tha. Lekin WAN edge do parties ke beech contract hai, aur doosri party ki apni policy hai. Agar aapka design provider ke kaam ko ignore karta hai, to configuration perfect hone par bhi voice khoyi ja sakti hai. Yeh chapter un teen jagahon ko cover karta hai jahan aapki policy aur provider ki policy milti hain: <b>rate</b> (CIR), <b>classes</b>, aur <b>markings</b>.</p>

<h3>Ek tasveer mein idea: weight limit wala post office</h3>
<p>Aap courier company ko parcels dete ho. Company kehti hai: hum aapke liye ghante mein 20 kg tak le jaayenge. Tez driver aata hai aur aap 60 kg load kar dete ho. Counter par clerk pehle 20 kg le leta hai aur baaki phenk deta hai, yeh dekhe bina ki kaun se parcels dawai ke the. Agar aap parcels khud sort karke dawai pehle bhejo, ghante mein 19 kg se zyada kabhi nahi, to saari zaroori cheezein pahunchti hain. Clerk provider policer hai, aapki sorting child policy hai, aur 19 kg ki limit aapka parent shaper hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Teen shehar aur provider">
<rect x="20" y="20" width="150" height="70" rx="8" fill="none" stroke="#64748b" stroke-width="2"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="12">Mumbai CE-MUM</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="11">CIR 100 Mbps (hub)</text>
<rect x="20" y="115" width="150" height="70" rx="8" fill="none" stroke="#64748b" stroke-width="2"/><text x="95" y="143" text-anchor="middle" class="svg-ink" font-size="12">Pune CE-PUN</text><text x="95" y="163" text-anchor="middle" class="svg-muted" font-size="11">CIR 20 Mbps</text>
<rect x="20" y="210" width="150" height="70" rx="8" fill="none" stroke="#64748b" stroke-width="2"/><text x="95" y="238" text-anchor="middle" class="svg-ink" font-size="12">Delhi CE-DEL</text><text x="95" y="258" text-anchor="middle" class="svg-muted" font-size="11">CIR 30 Mbps</text>
<line x1="170" y1="55" x2="300" y2="140" stroke="#2563eb" stroke-width="3"/>
<line x1="170" y1="150" x2="300" y2="150" stroke="#2563eb" stroke-width="3"/>
<line x1="170" y1="245" x2="300" y2="160" stroke="#2563eb" stroke-width="3"/>
<text x="220" y="88" class="svg-muted" font-size="10">1 Gbps handoff</text>
<rect x="300" y="105" width="150" height="90" rx="10" fill="none" stroke="#dc2626" stroke-width="2"/><text x="375" y="135" text-anchor="middle" class="svg-ink" font-size="12">MPLS-PE</text><text x="375" y="155" text-anchor="middle" class="svg-muted" font-size="11">har port par policer</text><text x="375" y="175" text-anchor="middle" class="svg-muted" font-size="11">us site ke CIR par</text>
<line x1="450" y1="150" x2="520" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="580" y="140" text-anchor="middle" class="svg-ink" font-size="12">Provider</text><text x="580" y="158" text-anchor="middle" class="svg-ink" font-size="12">cloud</text>
</svg><p class="cap">Teen shehar, ek MPLS service. Har handoff 1 Gbps ka hai; har contract alag hai. PE har port ko us shehar ke CIR par police karta hai.</p></div>

<h3>1. Rate: har CE ko uske apne CIR par shape karo</h3>
<p>Har shehar ka apna contract hai, isliye har CE ko apne CIR se thoda neeche apna parent shaper milta hai: Pune mein lagbhag 19 Mbps aur Delhi mein 29 Mbps. Mumbai zyada dilchasp hai. Uska 100 Mbps ka contract hai lekin woh do aise spokes se baat karta hai jo us se dheeme hain. Agar Mumbai Pune ko 60 Mbps bheje, to provider ka Pune port policer 20 Mbps se upar sab kuch drop kar deta hai, bhale Mumbai apne 100 se kaafi neeche ho. Isliye hub ko <b>har destination ke liye ek shaper</b> chahiye: parent policy jisme har spoke ki ek class ho, destination network ke ACL se match, aur har class us spoke ke CIR se thoda neeche shape kare, wahi child nested ho.</p>
<pre class="code">ip access-list extended TO-PUNE
 permit ip any 10.1.2.0 0.0.0.255
ip access-list extended TO-DELHI
 permit ip any 10.1.3.0 0.0.0.255
class-map match-any TO-PUNE
 match access-group name TO-PUNE
class-map match-any TO-DELHI
 match access-group name TO-DELHI
!
policy-map MUM-HUB
 class TO-PUNE
  shape average 19000000
  service-policy WAN-CHILD
 class TO-DELHI
  shape average 29000000
  service-policy WAN-CHILD
!
interface GigabitEthernet0/0
 service-policy output MUM-HUB</pre>
<p>Har spoke ko sirf chapter 5 ka simple parent chahiye (ek class-default, ek shape rate). Multi-class parent sirf hub ko chahiye, kyunki sirf hub ke paas alag rate wali ek se zyada destinations hain.</p>
<pre class="out">CE-MUM#show policy-map interface GigabitEthernet0/0 output
  Service-policy output: MUM-HUB
    Class-map: TO-PUNE (match-any)
      Match: access-group name TO-PUNE
      shape (average) cir <span class="hl">19000000</span>, bc 76000, be 76000
      Service-policy : WAN-CHILD
        Class-map: class-default (match-any)
          (queue depth/total drops/no-buffer drops) 0/<span class="hl">417500</span>/0
    Class-map: TO-DELHI (match-any)
      shape (average) cir <span class="hl">29000000</span>, bc 116000, be 116000
      Service-policy : WAN-CHILD</pre>
<p>Ab provider side ka saboot. Wahi load dene ke baad Pune ki taraf wala PE port zero exceeded packets dikhata hai, kyunki hub ne Pune ko kabhi 19 Mbps se zyada nahi bheja:</p>
<pre class="out">MPLS-PE#show policy-map interface GigabitEthernet0/1 output
  Service-policy output: CIR-20M
    Class-map: class-default (match-any)
      police:
          cir 20000000 bps, bc 2500000 bytes
        conformed 190500 packets, 38100000 bytes; actions:
          transmit
        <span class="hl">exceeded 0 packets, 0 bytes</span>; actions:
          drop</pre>
<div class="eg"><p><b>Worked example.</b> Mumbai Pune ko 60 Mbps bulk, Delhi ko 50 Mbps bulk aur har ek ko kuch voice bhejta hai. Pune shaper 19 Mbps, Delhi shaper 29 Mbps. 1 Gbps port se kul 48 Mbps nikalta hai, 100 Mbps contract se kaafi neeche, phir bhi Pune ki taraf har packet 20 Mbps ke andar rehta hai. Per-spoke shapers ke bina wahi demand 20 Mbps ke Pune port par 60 Mbps ka load daalti.</p></div>

<h3>2. Classes: provider ki apni queues hoti hain</h3>
<p>Bahut si MPLS services class of service bechti hain (jaise real-time, business aur best-effort class), har ek ka CIR mein apna hissa aur apna drop behaviour. Provider edge par DSCP dekhkar tay karta hai ki packet kis class ka hai. Isliye aapko teen cheezein likhit mein chahiye: <b>provider classes ki list</b>, <b>har ek se map hone wale DSCP values</b>, aur <b>har class ka rate</b>. Aapki child policy phir wahi naam aur values use karti hai. Agar provider ki real-time class 2 Mbps ki hai aur aap apni priority queue mein 6 Mbps EF daalo, to extra 4 Mbps provider mein out-of-contract pahunchta hai aur drop ya remark hota hai.</p>

<h3>3. Markings: trust, remark aur gayab EF</h3>
<p>Provider side ka sabse aam jhatka <b>remarking</b> hai. PE port aapka bheja DSCP trust kar sakta hai, ya use default (aksar 0) ya apni pasand ki class value mein badal sakta hai. Lakshan: bhejne wale CE par voice class bhari hoti hai lekin receive karne wala CE voice ko class-default mein dikhata hai; door ki site ka capture DSCP 0 dikhata hai. Aapka end-to-end design beech raaste tut jaata hai, bhale dono policies perfect hon.</p>
<ul>
<li><b>Poocho</b> ki PE aapke port par DSCP trust karta hai ya nahi, aur jo DSCP table mein nahi hai uska kya hota hai.</li>
<li><b>Map karo</b> CE par: wahi value bhejo jo provider expect karta hai (jaise provider ki real-time class cs5 hai to voice ko cs5 mark karo), aur provider rewrite kare to receive karne wale CE par wapas map karo.</li>
<li><b>Verify karo</b> dono sire par DSCP counters se, sirf sender par nahi.</li>
<li><b>Stop gap</b> agar provider trust nahi karta: door ke end par DSCP ki jagah address aur port se classify karo.</li>
</ul>

<h3>Backup path: Internet circuit</h3>
<p>Har shehar mein ek Internet circuit bhi hai (CE ka doosra port). Uska apna rate hai aur provider classes nahi, kyunki Internet carriers ke beech DSCP ko nahi maanta. Use apne rate se neeche apna parent shaper aur, behtar, wahi child policy chahiye, taaki failover ke baad bhi voice protected rahe. Policy ke bina backup circuit bahut aam incident hai.</p>

<div class="note"><p><b>Junos note.</b> Junos PE ya CE par contract firewall filter ya interface policer ke roop mein lagta hai, aur shape logical interface ya VLAN ka shaping-rate hai:</p>
<pre class="code">set firewall policer CIR-20M if-exceeding bandwidth-limit 20m burst-size-limit 2500k
set firewall policer CIR-20M then discard
set interfaces ge-0/0/1 unit 0 family inet policer input CIR-20M
set class-of-service interfaces ge-0/0/0 unit 100 shaping-rate 19m</pre>
<p>Hub par har spoke ke liye ek logical unit (ya VLAN) apne shaping-rate ke saath wahi idea hai jo MQC mein har spoke ke liye ek class hai.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Hub ko apne contract (100 Mbps) par shape karna, isliye spokes apne policers se aage tak bhar jaate hain. (2) Sab spokes par ek hi shape rate. (3) Provider class map aur DSCP table likhit mein na lena. (4) Provider real-time class se bada priority class. (5) Sirf ek direction test karna: har PE port policer dono taraf kaam karta hai aur return direction ko doosre CE par apna shaper chahiye. (6) Internet backup circuit bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shape rate <b>destination</b> ke contract se tay hota hai, bhejne wali site se nahi. Bade hub ko chhote spoke ko bhejte waqt spoke rate par shape karna padta hai. CIR se thoda neeche shape karo; kabhi upar nahi.</p></div>

<div class="scn"><h4>Deccan Broadcast: jis hub ne chhote spokes ko bhar diya</h4><p>Deccan Broadcast Mumbai (100 Mbps), Pune (20) aur Delhi (30) ko MPLS se jodta hai. Pune ke editors shikayat karte hain ki har dopahar Mumbai se bada render copy hota hai to Mumbai server ke edit sessions atak jaate hain. Mumbai CE par ek shaper 95 Mbps ka hai aur Pune PE port 400,000 exceeded packets dikhata hai. Engineer use MUM-HUB se badalta hai: TO-PUNE 19 Mbps aur TO-DELHI 29 Mbps, har ek mein child nested. Wahi copy ke baad Pune port zero exceeded dikhata hai, drops Mumbai ki TO-PUNE class-default mein hain, aur edit sessions ab nahi atakte.</p><p><b>Lesson:</b> jo contract matter karta hai woh receive karne wale port ka hai.</p></div>
<div class="iv"><p class="q">"Aapke paas 100 Mbps ka hub hai aur 20 aur 30 ke spokes. Shaping kaise karoge?"</p><p>Hub par har spoke ke liye ek parent class, destination network se match, har ek us spoke ke CIR se thoda neeche shape, wahi child policy nested, taaki dheeme spoke ki taraf traffic kabhi us se zyada na ho jo provider wahan accept karega. Return direction ke liye har spoke ko apne CIR se thoda neeche ek parent shaper milta hai. Main provider class map likhit mein leta hoon aur load mein check karke sabit karta hoon ki koi PE port exceeded packets nahi dikhata.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Provider policer har port ke CIR par hai; har CE ko apne CIR se thoda neeche shape karo.</li>
<li>Dheeme spokes ko bhejne wale hub ko har spoke ki ek shaped class chahiye, destination se match.</li>
<li>Provider class names, DSCP mapping aur rates likhit mein lo aur child policy mein wahi dohrao.</li>
<li>PE par remarking door ki site par class-default mein voice ke roop mein dikhti hai; dono sire ke DSCP counters milao.</li>
<li>Internet backup circuit ko bhi apna shaper aur child policy chahiye.</li>
</ul></div>
`}};export{e as default};