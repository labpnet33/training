var e={id:`narrow-vs-wide`,h:{en:`Narrow versus wide metrics: the TLVs behind the trap`,hi:`Narrow versus wide metrics: trap ke peeche ke TLVs`},body:{en:`
<p>Two TLV families carry IS-IS reachability. The <b>old (narrow) style</b> uses TLV 2 (IS Reachability) and TLV 128 (IP Internal Reachability). Its metric field is <b>6 bits</b> on an interface, so the largest link metric is <b>63</b>, and a whole path may add up to at most <b>1023</b>. The <b>new (wide) style</b> uses TLV 22 (Extended IS Reachability) and TLV 135 (Extended IP Reachability). Its link metric is <b>24 bits</b> (up to 16,777,215) and the path metric is 32 bits. Wide TLVs also carry sub-TLVs, which is how traffic engineering and segment routing attach their data. That is why every modern provider core uses wide.</p>

<h3>Analogy: two languages in one meeting</h3>
<p>A router that speaks only narrow is a delegate who understands only Hindi. A router that is wide-only speaks only English. They can shake hands (hellos are language neutral) and sit in the same room, but neither follows the other's speeches. A <b>transition</b> delegate speaks both: it advertises both TLV sets and reads both.</p>

<h3>The four metric-style choices on IOS XE</h3>
<table class="cmp"><tr><th>Command</th><th>Sends</th><th>Reads</th></tr>
<tr><td>metric-style narrow (default)</td><td>narrow TLVs</td><td>narrow only</td></tr>
<tr><td>metric-style wide</td><td>wide TLVs</td><td>wide only</td></tr>
<tr><td>metric-style transition</td><td>narrow and wide</td><td>both</td></tr>
<tr><td>metric-style narrow transition / wide transition</td><td>one style</td><td>both</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Narrow and wide TLV sets">
<rect x="30" y="30" width="270" height="150" rx="12" fill="#fde68a"/><text x="165" y="58" text-anchor="middle" class="svg-ink" font-size="15">Narrow</text>
<text x="165" y="86" text-anchor="middle" class="svg-ink" font-size="12">TLV 2 IS Reachability</text><text x="165" y="108" text-anchor="middle" class="svg-ink" font-size="12">TLV 128 IP Internal</text><text x="165" y="136" text-anchor="middle" class="svg-muted" font-size="12">6-bit metric, max 63</text><text x="165" y="158" text-anchor="middle" class="svg-muted" font-size="12">path max 1023</text>
<rect x="340" y="30" width="270" height="150" rx="12" fill="#bbf7d0"/><text x="475" y="58" text-anchor="middle" class="svg-ink" font-size="15">Wide</text>
<text x="475" y="86" text-anchor="middle" class="svg-ink" font-size="12">TLV 22 Extended IS</text><text x="475" y="108" text-anchor="middle" class="svg-ink" font-size="12">TLV 135 Extended IP</text><text x="475" y="136" text-anchor="middle" class="svg-muted" font-size="12">24-bit metric, sub-TLVs</text><text x="475" y="158" text-anchor="middle" class="svg-muted" font-size="12">TE and SR ready</text>
</svg><p class="cap">Two TLV families: a router sees only the family its metric style reads.</p></div>

<h3>Seeing the mismatch in the lab</h3>
<p>The first lab's R1 is Cisco with the default narrow style. Its database shows its own LSP with <code>IS</code> and <code>IP</code> entries (narrow) but the Juniper LSPs with <code>IS-Extended</code> and a slash prefix (wide):</p>
<pre class="out">R1# show isis database detail
...
R1.00-00            * 0x00000001   0x142F        1170/*                 0/0/0
  Metric: 10        <span class="hl">IS</span> JR1
  Metric: 10        <span class="hl">IS</span> R2
  Metric: 10        IP 10.2.1.0 255.255.255.0
JR1.00-00             0x00000001   0xEF4E        1170/1200              0/0/0
  Metric: 10        <span class="hl">IS-Extended</span> R1
  Metric: 10        <span class="hl">IS-Extended</span> JR2
  Metric: 10        IP 10.2.1.0/24</pre>
<p>(Output shortened: R2 and JR2 LSPs and some lines are omitted.) The key: the LSP is <i>in the database</i> (a flooding success) but R1's SPF cannot use the <code>IS-Extended</code> neighbours. The result is the route table you saw in chapter 1 with no Juniper loopbacks.</p>

<h3>The fix and the proof</h3>
<p>The lab asks you to set wide on both Cisco routers. Reference configuration (the lab's own fix):</p>
<pre class="code">router isis
 <span class="hl">metric-style wide</span></pre>
<p>After the change, R1 learns everything. Real output after the lab solution (which also sets a metric of 100 on Gi0/0, explained in chapter 4):</p>
<pre class="out">R1# show ip route isis
i L2     10.2.2.0/24 [115/30] via 10.2.4.1, 00:00:35, GigabitEthernet0/1
i L2     10.2.3.0/24 [115/20] via 10.2.4.1, 00:00:38, GigabitEthernet0/1
i L2     10.2.255.2/32 [115/10] via 10.2.4.1, 00:00:38, GigabitEthernet0/1
i L2     10.2.255.11/32 [115/30] via 10.2.4.1, 00:00:35, GigabitEthernet0/1
i L2     10.2.255.12/32 [115/20] via 10.2.4.1, 00:00:35, GigabitEthernet0/1</pre>
<p>(Output shortened: the header and codes legend are omitted.)</p>

<div class="eg"><p><b>Worked example.</b> A 10 Gbps link and a 100 Mbps link both need distinct metrics. With narrow you can only use 1 to 63, so you squeeze everything into 63 values and lose granularity. With wide you may use 10, 100, 1000 and so on, and keep the same value on both vendors.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using <code>metric-style transition</code> forever. It doubles LSP size and hides the problem. Use it only as a short step during migration, then move to wide.</p></div>
<div class="exam"><p><b>Exam trap.</b> Narrow limits are 63 per interface and 1023 per path. Wide allows 16,777,215 per interface. Also remember wide is required for MPLS TE and for segment routing extensions.</p></div>

<div class="scn"><h4>The metric that did not apply</h4><p>An engineer set <code>isis metric 200</code> on a Cisco link while the router was still narrow. The narrow style cannot advertise a metric above 63, so the intended metric did not apply and traffic did not shift. After moving to wide, the value took effect.</p><p><b>Lesson:</b> check the metric style before designing any metric above 63.</p></div>

<div class="iv"><p class="q">"What is the maximum metric on an interface with narrow and wide styles?"</p><p>Narrow is 63 per interface and 1023 for a path, because the field is 6 bits. Wide is 24 bits per interface, 16,777,215, with a 32-bit path metric, and it also carries sub-TLVs for TE and segment routing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Narrow: TLV 2 and 128, 6-bit metric, max 63 per link and 1023 per path.</li>
<li>Wide: TLV 22 and 135, 24-bit metric, sub-TLVs, needed for TE and SR.</li>
<li>IOS XE defaults to narrow; wide-only Junos routers are invisible to it.</li>
<li>Proof: show isis database detail shows IS versus IS-Extended.</li>
<li>Transition is a temporary step, not a destination.</li>
</ul></div>
`,hi:`
<p>IS-IS reachability do TLV families carry karti hain. <b>Purana (narrow) style</b> TLV 2 (IS Reachability) aur TLV 128 (IP Internal Reachability) use karta hai. Iska metric field interface par <b>6 bits</b> ka hai, isliye sabse bada link metric <b>63</b> hai, aur poora path adhiktam <b>1023</b> tak jod sakta hai. <b>Naya (wide) style</b> TLV 22 (Extended IS Reachability) aur TLV 135 (Extended IP Reachability) use karta hai. Iska link metric <b>24 bits</b> (16,777,215 tak) hai aur path metric 32 bits. Wide TLVs mein sub-TLVs bhi hote hain, jinse traffic engineering aur segment routing apna data attach karte hain. Isi liye har modern provider core wide use karta hai.</p>

<h3>Analogy: ek meeting mein do bhashayein</h3>
<p>Sirf narrow bolne wala router us delegate jaisa hai jo sirf Hindi samajhta hai. Wide-only router sirf English bolta hai. Woh haath mila sakte hain (hellos bhasha-neutral hain) aur ek hi kamre mein baith sakte hain, par koi doosre ka bhashan nahi samajhta. <b>Transition</b> delegate dono bolta hai: dono TLV sets advertise karta hai aur dono padhta hai.</p>

<h3>IOS XE par metric style ke chaar choices</h3>
<table class="cmp"><tr><th>Command</th><th>Bhejta hai</th><th>Padhta hai</th></tr>
<tr><td>metric-style narrow (default)</td><td>narrow TLVs</td><td>sirf narrow</td></tr>
<tr><td>metric-style wide</td><td>wide TLVs</td><td>sirf wide</td></tr>
<tr><td>metric-style transition</td><td>narrow aur wide</td><td>dono</td></tr>
<tr><td>metric-style narrow transition / wide transition</td><td>ek style</td><td>dono</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Narrow aur wide TLV sets">
<rect x="30" y="30" width="270" height="150" rx="12" fill="#fde68a"/><text x="165" y="58" text-anchor="middle" class="svg-ink" font-size="15">Narrow</text>
<text x="165" y="86" text-anchor="middle" class="svg-ink" font-size="12">TLV 2 IS Reachability</text><text x="165" y="108" text-anchor="middle" class="svg-ink" font-size="12">TLV 128 IP Internal</text><text x="165" y="136" text-anchor="middle" class="svg-muted" font-size="12">6-bit metric, max 63</text><text x="165" y="158" text-anchor="middle" class="svg-muted" font-size="12">path max 1023</text>
<rect x="340" y="30" width="270" height="150" rx="12" fill="#bbf7d0"/><text x="475" y="58" text-anchor="middle" class="svg-ink" font-size="15">Wide</text>
<text x="475" y="86" text-anchor="middle" class="svg-ink" font-size="12">TLV 22 Extended IS</text><text x="475" y="108" text-anchor="middle" class="svg-ink" font-size="12">TLV 135 Extended IP</text><text x="475" y="136" text-anchor="middle" class="svg-muted" font-size="12">24-bit metric, sub-TLVs</text><text x="475" y="158" text-anchor="middle" class="svg-muted" font-size="12">TE aur SR ready</text>
</svg><p class="cap">Do TLV families: router wahi family dekhta hai jo uska metric style padhta hai.</p></div>

<h3>Lab mein mismatch dekhna</h3>
<p>Pehle lab ka R1 Cisco hai aur default narrow style par hai. Uske database mein uska apna LSP <code>IS</code> aur <code>IP</code> entries (narrow) ke saath dikhta hai, par Juniper LSPs <code>IS-Extended</code> aur slash prefix (wide) ke saath:</p>
<pre class="out">R1# show isis database detail
...
R1.00-00            * 0x00000001   0x142F        1170/*                 0/0/0
  Metric: 10        <span class="hl">IS</span> JR1
  Metric: 10        <span class="hl">IS</span> R2
  Metric: 10        IP 10.2.1.0 255.255.255.0
JR1.00-00             0x00000001   0xEF4E        1170/1200              0/0/0
  Metric: 10        <span class="hl">IS-Extended</span> R1
  Metric: 10        <span class="hl">IS-Extended</span> JR2
  Metric: 10        IP 10.2.1.0/24</pre>
<p>(Output chhota kiya gaya: R2 aur JR2 ke LSPs aur kuch lines hata di gayi hain.) Mukhya baat: LSP <i>database mein hai</i> (flooding safal) par R1 ka SPF <code>IS-Extended</code> neighbours use nahi kar sakta. Natija wahi route table hai jo chapter 1 mein dekhi, bina Juniper loopbacks ke.</p>

<h3>Fix aur proof</h3>
<p>Lab dono Cisco routers par wide set karne ko kehta hai. Reference configuration (lab ka apna fix):</p>
<pre class="code">router isis
 <span class="hl">metric-style wide</span></pre>
<p>Badlaav ke baad R1 sab seekh leta hai. Lab solution ke baad real output (jo Gi0/0 par metric 100 bhi set karta hai, chapter 4 mein samjhaya gaya):</p>
<pre class="out">R1# show ip route isis
i L2     10.2.2.0/24 [115/30] via 10.2.4.1, 00:00:35, GigabitEthernet0/1
i L2     10.2.3.0/24 [115/20] via 10.2.4.1, 00:00:38, GigabitEthernet0/1
i L2     10.2.255.2/32 [115/10] via 10.2.4.1, 00:00:38, GigabitEthernet0/1
i L2     10.2.255.11/32 [115/30] via 10.2.4.1, 00:00:35, GigabitEthernet0/1
i L2     10.2.255.12/32 [115/20] via 10.2.4.1, 00:00:35, GigabitEthernet0/1</pre>
<p>(Output chhota kiya gaya: header aur codes legend hata diye gaye hain.)</p>

<div class="eg"><p><b>Worked example.</b> 10 Gbps aur 100 Mbps link dono ko alag metrics chahiye. Narrow mein sirf 1 se 63 use kar sakte ho, to sab 63 values mein sikodna padta hai aur granularity kho jaati hai. Wide mein 10, 100, 1000 aadi use kar sakte ho aur dono vendors par wahi value rakh sakte ho.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>metric-style transition</code> hamesha ke liye rakhna. Yeh LSP size double karta hai aur problem chhupata hai. Ise sirf migration ke chhote step ke taur par use karo, phir wide par jao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Narrow limits 63 per interface aur 1023 per path hain. Wide mein 16,777,215 per interface. Yaad rakho MPLS TE aur segment routing extensions ke liye wide zaroori hai.</p></div>

<div class="scn"><h4>Jo metric lagu nahi hua</h4><p>Engineer ne Cisco link par <code>isis metric 200</code> set kiya jabki router abhi narrow tha. Narrow style 63 se upar ka metric advertise nahi kar sakta, isliye iccha ka metric lagu nahi hua aur traffic shift nahi hua. Wide par jaane ke baad value lagu hui.</p><p><b>Lesson:</b> 63 se upar koi metric design karne se pehle metric style check karo.</p></div>

<div class="iv"><p class="q">"Narrow aur wide styles mein interface par maximum metric kya hai?"</p><p>Narrow mein interface par 63 aur path ke liye 1023, kyunki field 6 bits ka hai. Wide mein interface par 24 bits, yaani 16,777,215, aur 32-bit path metric, aur yeh TE tatha segment routing ke liye sub-TLVs bhi carry karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Narrow: TLV 2 aur 128, 6-bit metric, link par max 63 aur path par 1023.</li>
<li>Wide: TLV 22 aur 135, 24-bit metric, sub-TLVs, TE aur SR ke liye zaroori.</li>
<li>IOS XE default narrow hai; wide-only Junos routers use invisible rehte hain.</li>
<li>Proof: show isis database detail mein IS versus IS-Extended dikhta hai.</li>
<li>Transition ek asthayi step hai, manzil nahi.</li>
</ul></div>
`}};export{e as default};