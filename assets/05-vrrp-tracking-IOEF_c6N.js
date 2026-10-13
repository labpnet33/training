var e={id:`vrrp-tracking`,h:{en:`VRRP tracking, preemption and a real failover test`,hi:`VRRP tracking, preemption aur asli failover test`},body:{en:`
<p>Plain VRRP has a blind spot. It protects the hosts against the loss of the <i>router</i>, but not against the loss of the router's <i>uplink</i>. Picture R1, the master, with its LAN side healthy and its WAN cable pulled out. R1 keeps sending advertisements, so R2 never takes over, and the hosts send all their traffic to a gateway that has nowhere to forward it. The LAN looks fine, the Internet is gone. <b>Tracking</b> fixes this.</p>

<h3>Tracking in one sentence</h3>
<p>Tracking makes the VRRP priority depend on something else: when the tracked object fails, the router lowers its own priority by a configured <b>priority-cost</b>, so that a healthier backup wins the election.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Tracking lowers VRRP priority">
<rect x="20" y="30" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="95" y="56" text-anchor="middle" class="svg-ink" font-size="13">R1 configured 200</text><text x="95" y="76" text-anchor="middle" class="svg-muted" font-size="12">uplink ge-0/0/0 UP</text>
<text x="215" y="66" text-anchor="middle" class="svg-ink" font-size="20">&#8594;</text>
<rect x="260" y="30" width="170" height="60" rx="10" fill="#fed7aa"/><text x="345" y="56" text-anchor="middle" class="svg-ink" font-size="13">uplink DOWN</text><text x="345" y="76" text-anchor="middle" class="svg-muted" font-size="12">cost 150 applied</text>
<text x="470" y="66" text-anchor="middle" class="svg-ink" font-size="20">&#8594;</text>
<rect x="500" y="30" width="125" height="60" rx="10" fill="#fde68a"/><text x="562" y="56" text-anchor="middle" class="svg-ink" font-size="13">R1 now 50</text><text x="562" y="76" text-anchor="middle" class="svg-muted" font-size="12">200 minus 150</text>
<rect x="150" y="125" width="340" height="50" rx="10" fill="#bae6fd"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">R2 priority 100 is higher than 50</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">R2 preempts and becomes master</text>
</svg><p class="cap">The cost must be large enough that the tracked router drops below the backup's priority.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R1: track the WAN uplink; if it fails, subtract 150 from priority</span>
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 track interface ge-0/0/0 priority-cost 150
commit</pre>
<ul>
<li>You can track an <b>interface</b> (<code>track interface ge-0/0/0 priority-cost 150</code>) or a <b>route</b> (<code>track route 0.0.0.0/0 routing-instance default priority-cost 50</code>). Route tracking is better when the uplink can be up while the path beyond it is dead.</li>
<li>The arithmetic matters. 200 - 150 = 50, which is lower than the backup's 100, so the backup wins. With a cost of only 50 R1 would land on 150 and stay master, and the tracking would do nothing. Always check that <i>configured priority minus cost</i> is below the backup's priority.</li>
<li>Tracking applies only to the master role; the standby is normally untracked in a simple design.</li>
</ul>

<h3>The failover test, step by step</h3>
<p>Never trust an HA design you have not broken on purpose. In the Kochi lab:</p>
<ol>
<li>Baseline. R1 master, R2 backup. R1's tracking shows the uplink up with cost 0.</li>
<li>Fail the uplink: <code>set interfaces ge-0/0/0 disable</code> on R1, commit.</li>
<li>Observe R1 dropping to 50 and R2 becoming master.</li>
<li>Check PC1 still reaches the Internet through the same gateway address.</li>
<li>Restore the uplink and confirm preemption returns the role to R1.</li>
</ol>
<p>Baseline output on R1 (before the failure):</p>
<pre class="out">lab@R1&gt; show vrrp track
Track Int/Route      State    Speed  VRRP Int      Group  VR State  Current prio  Cost
ge-0/0/0.0           up       1g     ge-0/0/1.0       10  master             <span class="hl">200</span>     0</pre>
<p>After the uplink is disabled, again real output:</p>
<pre class="out">lab@R1&gt; show vrrp track
Track Int/Route      State    Speed  VRRP Int      Group  VR State  Current prio  Cost
ge-0/0/0.0           <span class="hl">down</span>     0      ge-0/0/1.0       10  <span class="hl">backup</span>              <span class="hl">50</span>   <span class="hl">150</span>

lab@R1&gt; show vrrp
Interface     State       Group   VR state VR Mode   Timer    Type   Address
ge-0/0/1.0    up             10   backup   Active    D 3.805  lcl    172.16.10.2
                                                              vip    172.16.10.1
                                                              mas    172.16.10.3

lab@R2&gt; show vrrp
Interface     State       Group   VR state VR Mode   Timer    Type   Address
ge-0/0/1.0    up             10   <span class="hl">master</span>   Active    A 1.000  lcl    172.16.10.3
                                                              vip    172.16.10.1</pre>
<p>The lab asks for R1's current priority at this moment. Use <code>show vrrp detail</code>, which spells out the tracking arithmetic:</p>
<pre class="out">lab@R1&gt; show vrrp detail
  Interface state: up, Group: 10, State: backup, VRRP Mode: Active
  Priority: <span class="hl">50</span>, Advertisement interval: 1, Authentication type: none
  Preempt: yes, Accept-data mode: yes, VIP count: 1, VIP: 172.16.10.1
  Dead timer: 3.805s, Master priority: 100, Master router: 172.16.10.3
  Virtual Mac: 00:00:5e:00:01:0a
  Tracking: enabled
    Current priority: <span class="hl">50</span>, Configured priority: 200
    Interface tracking: enabled, Interface count: 1
      Interface        Int state  Int speed  Incurred priority cost
      ge-0/0/0.0       down       0          150</pre>
<p>"Current priority 50, Configured priority 200, Incurred priority cost 150" is the whole story in three numbers. PC1 pings 172.16.10.1 and 198.51.100.1 successfully because R2 now answers for the VIP.</p>

<h3>Restoring and preemption</h3>
<pre class="code">delete interfaces ge-0/0/0 disable
commit</pre>
<p>The cost is removed, R1 returns to 200, and because <b>preempt</b> is on it takes the master role back from R2, as <code>show vrrp</code> on R1 confirms (<code>master</code>, timer A 1.000). Preemption is usually what you want because the primary router is the intended path. In some designs it causes a second brief outage after recovery; there is an optional preempt hold-time to delay it, and <code>no-preempt</code> turns it off. Choose deliberately.</p>

<div class="eg"><p><b>Worked example.</b> R1 priority 180 with <code>track interface ge-0/0/0 priority-cost 100</code>; R2 priority 100. The uplink fails: R1 = 80, below R2's 100, so R2 becomes master. If the cost had been 50, R1 would be 130 and stay master, still forwarding into a dead uplink. The same arithmetic, different outcome.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A priority-cost too small to drop below the backup; tracking the wrong interface; tracking only an interface when the path beyond it can fail (use route tracking); testing nothing. Another: forgetting that preempt is on, so a flapping uplink produces a flapping master.</p></div>
<div class="exam"><p><b>Exam trap.</b> "R1 priority 200, track cost 150, R2 priority 100: who is master when the tracked interface fails?" R2, because 50 is below 100. Always do the subtraction. The same question with cost 50 gives R1.</p></div>

<div class="scn"><h4>Master with no Internet</h4><p>A warehouse lost its WAN fibre on the primary router. The LAN stayed green, the VRRP master kept advertising, and users lost every external service for an hour. After the incident, the team added <code>track interface</code> for the uplink with a cost large enough to drop below the backup, then pulled the cable during a maintenance window. The backup took over in about four seconds.</p><p><b>Lesson:</b> VRRP without tracking protects the box, not the path.</p></div>

<div class="iv"><p class="q">"Why add tracking to VRRP, and how do you choose the cost?"</p><p>Without tracking the master keeps its role even when its uplink is down. Tracking subtracts a priority-cost when the interface or route fails. I choose the cost so that configured priority minus cost is below the backup's priority, then test by failing the uplink and checking <code>show vrrp detail</code> and <code>show vrrp track</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tracking lowers priority by priority-cost when an interface or route fails.</li>
<li>Check the arithmetic: configured priority minus cost must be below the backup's priority.</li>
<li>Verify with <code>show vrrp track</code> and <code>show vrrp detail</code> (current vs configured priority).</li>
<li>Preemption returns the role to the higher-priority router after recovery.</li>
<li>Always test a failover by really breaking the uplink.</li>
</ul></div>
`,hi:`
<p>Seedhe VRRP mein ek blind spot hai. Yeh hosts ko <i>router</i> ke jaane se bachata hai, lekin router ke <i>uplink</i> ke jaane se nahi. Socho R1, master, ki LAN side theek hai aur WAN cable nikal gaya. R1 advertisements bhejta rehta hai, isliye R2 kabhi takeover nahi karta, aur hosts apna saara traffic aise gateway ko bhejte hain jiske paas aage bhejne ki jagah nahi. LAN theek dikhta hai, Internet gayab. <b>Tracking</b> yeh theek karta hai.</p>

<h3>Tracking ek line mein</h3>
<p>Tracking VRRP priority ko kisi aur cheez par depend karata hai: tracked object fail ho to router apni priority configured <b>priority-cost</b> se ghata deta hai, taaki zyada healthy backup election jeete.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Tracking VRRP priority ghataata hai">
<rect x="20" y="30" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="95" y="56" text-anchor="middle" class="svg-ink" font-size="13">R1 configured 200</text><text x="95" y="76" text-anchor="middle" class="svg-muted" font-size="12">uplink ge-0/0/0 UP</text>
<text x="215" y="66" text-anchor="middle" class="svg-ink" font-size="20">&#8594;</text>
<rect x="260" y="30" width="170" height="60" rx="10" fill="#fed7aa"/><text x="345" y="56" text-anchor="middle" class="svg-ink" font-size="13">uplink DOWN</text><text x="345" y="76" text-anchor="middle" class="svg-muted" font-size="12">cost 150 lagi</text>
<text x="470" y="66" text-anchor="middle" class="svg-ink" font-size="20">&#8594;</text>
<rect x="500" y="30" width="125" height="60" rx="10" fill="#fde68a"/><text x="562" y="56" text-anchor="middle" class="svg-ink" font-size="13">R1 ab 50</text><text x="562" y="76" text-anchor="middle" class="svg-muted" font-size="12">200 minus 150</text>
<rect x="150" y="125" width="340" height="50" rx="10" fill="#bae6fd"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">R2 priority 100, 50 se zyada</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">R2 preempt karke master ban jaata hai</text>
</svg><p class="cap">Cost itni badi honi chahiye ki tracked router backup ki priority se neeche aa jaaye.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R1: WAN uplink track karo; fail ho to priority se 150 ghatao</span>
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 track interface ge-0/0/0 priority-cost 150
commit</pre>
<ul>
<li>Aap <b>interface</b> (<code>track interface ge-0/0/0 priority-cost 150</code>) ya <b>route</b> (<code>track route 0.0.0.0/0 routing-instance default priority-cost 50</code>) track kar sakte ho. Route tracking tab behtar hai jab uplink up ho lekin uske aage ka path mara ho.</li>
<li>Hisaab matter karta hai. 200 - 150 = 50, jo backup ke 100 se kam hai, isliye backup jeetta hai. Sirf 50 cost ke saath R1 150 par aata aur master rehta, aur tracking kuch nahi karta. Hamesha check karo ki <i>configured priority minus cost</i> backup ki priority se neeche hai.</li>
<li>Tracking sirf master role par apply hoti hai; simple design mein standby aam taur par untracked hota hai.</li>
</ul>

<h3>Failover test, step by step</h3>
<p>Jis HA design ko aapne jaanbujhkar toda nahi, us par bharosa mat karo. Kochi lab mein:</p>
<ol>
<li>Baseline. R1 master, R2 backup. R1 ki tracking uplink up aur cost 0 dikhati hai.</li>
<li>Uplink fail karo: R1 par <code>set interfaces ge-0/0/0 disable</code>, commit.</li>
<li>Dekho R1 50 par gir raha hai aur R2 master ban raha hai.</li>
<li>Check karo PC1 wahi gateway address se Internet tak pahunch raha hai.</li>
<li>Uplink restore karo aur confirm karo ki preemption role R1 ko lauta deta hai.</li>
</ol>
<p>R1 par baseline output (failure se pehle):</p>
<pre class="out">lab@R1&gt; show vrrp track
Track Int/Route      State    Speed  VRRP Int      Group  VR State  Current prio  Cost
ge-0/0/0.0           up       1g     ge-0/0/1.0       10  master             <span class="hl">200</span>     0</pre>
<p>Uplink disable hone ke baad, phir real output:</p>
<pre class="out">lab@R1&gt; show vrrp track
Track Int/Route      State    Speed  VRRP Int      Group  VR State  Current prio  Cost
ge-0/0/0.0           <span class="hl">down</span>     0      ge-0/0/1.0       10  <span class="hl">backup</span>              <span class="hl">50</span>   <span class="hl">150</span>

lab@R1&gt; show vrrp
Interface     State       Group   VR state VR Mode   Timer    Type   Address
ge-0/0/1.0    up             10   backup   Active    D 3.805  lcl    172.16.10.2
                                                              vip    172.16.10.1
                                                              mas    172.16.10.3

lab@R2&gt; show vrrp
Interface     State       Group   VR state VR Mode   Timer    Type   Address
ge-0/0/1.0    up             10   <span class="hl">master</span>   Active    A 1.000  lcl    172.16.10.3
                                                              vip    172.16.10.1</pre>
<p>Lab is waqt R1 ki current priority poochta hai. <code>show vrrp detail</code> use karo, jo tracking ka hisaab saaf likhta hai:</p>
<pre class="out">lab@R1&gt; show vrrp detail
  Interface state: up, Group: 10, State: backup, VRRP Mode: Active
  Priority: <span class="hl">50</span>, Advertisement interval: 1, Authentication type: none
  Preempt: yes, Accept-data mode: yes, VIP count: 1, VIP: 172.16.10.1
  Dead timer: 3.805s, Master priority: 100, Master router: 172.16.10.3
  Virtual Mac: 00:00:5e:00:01:0a
  Tracking: enabled
    Current priority: <span class="hl">50</span>, Configured priority: 200
    Interface tracking: enabled, Interface count: 1
      Interface        Int state  Int speed  Incurred priority cost
      ge-0/0/0.0       down       0          150</pre>
<p>"Current priority 50, Configured priority 200, Incurred priority cost 150" teen numbers mein poori kahani hai. PC1 172.16.10.1 aur 198.51.100.1 ko successfully ping karta hai kyunki ab R2 VIP ka jawab deta hai.</p>

<h3>Restore aur preemption</h3>
<pre class="code">delete interfaces ge-0/0/0 disable
commit</pre>
<p>Cost hat jaati hai, R1 wapas 200 par aata hai, aur <b>preempt</b> on hone ki wajah se woh R2 se master role wapas le leta hai, jaise R1 par <code>show vrrp</code> confirm karta hai (<code>master</code>, timer A 1.000). Preemption aam taur par wahi hai jo aap chahte ho kyunki primary router intended path hai. Kuch designs mein recovery ke baad doosra chhota outage hota hai; ise der se karne ke liye optional preempt hold-time hai, aur <code>no-preempt</code> ise band karta hai. Soch samajhkar chuno.</p>

<div class="eg"><p><b>Worked example.</b> R1 priority 180 aur <code>track interface ge-0/0/0 priority-cost 100</code>; R2 priority 100. Uplink fail: R1 = 80, R2 ke 100 se neeche, isliye R2 master. Cost 50 hoti to R1 130 hota aur master rehta, mare hue uplink mein forward karta. Wahi hisaab, alag natija.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Backup se neeche na le jaane wala chhota priority-cost; galat interface track karna; sirf interface track karna jabki uske aage ka path fail ho sakta hai (route tracking use karo); kuch bhi test na karna. Ek aur: yaad na rakhna ki preempt on hai, isliye flapping uplink flapping master banata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "R1 priority 200, track cost 150, R2 priority 100: tracked interface fail hone par master kaun?" R2, kyunki 50, 100 se kam hai. Hamesha ghatana karo. Cost 50 ke saath wahi sawal R1 deta hai.</p></div>

<div class="scn"><h4>Master jiske paas Internet nahi</h4><p>Ek warehouse ka primary router ka WAN fibre chala gaya. LAN green raha, VRRP master advertise karta raha, aur users ek ghante tak har external service kho baithe. Incident ke baad team ne uplink ke liye <code>track interface</code> jodi aisi cost ke saath jo backup se neeche le jaaye, phir maintenance window mein cable kheencha. Backup lagbhag chaar second mein aa gaya.</p><p><b>Lesson:</b> Tracking ke bina VRRP box ko bachata hai, path ko nahi.</p></div>

<div class="iv"><p class="q">"VRRP mein tracking kyun jodte ho, aur cost kaise chunte ho?"</p><p>Tracking ke bina master apna role rakhta hai chahe uska uplink down ho. Tracking interface ya route fail hone par priority-cost ghatati hai. Main cost aisi chunta hoon ki configured priority minus cost backup ki priority se neeche ho, phir uplink fail karke test karta hoon aur <code>show vrrp detail</code> aur <code>show vrrp track</code> check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tracking interface ya route fail hone par priority-cost se priority ghatati hai.</li>
<li>Hisaab check karo: configured priority minus cost backup ki priority se neeche ho.</li>
<li><code>show vrrp track</code> aur <code>show vrrp detail</code> (current banaam configured priority) se verify karo.</li>
<li>Preemption recovery ke baad role zyada priority wale router ko lauta deta hai.</li>
<li>Failover hamesha uplink sach mein todkar test karo.</li>
</ul></div>
`}};export{e as default};