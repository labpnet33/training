var e={id:`primary-election`,h:{en:`How the cluster elects its primary: monitored ports, age, priority, override`,hi:`Cluster primary kaise chunta hai: monitored ports, age, priority, override`},body:{en:`
<p>When two identical firewalls start, somebody has to be in charge. FGCP settles this with a fixed <b>primary election</b>. If you know the order of the criteria, you can predict which unit will win in any situation, and you can explain odd behaviour such as "why did the cluster fail back by itself?" or "why did it not fail back?". This is one of the most tested HA topics.</p>

<h3>The election criteria, in order</h3>
<p>Each unit compares itself with its peers using these criteria, from first to last. The first criterion that differs decides the winner.</p>
<ol>
<li><b>Number of connected monitored interfaces.</b> The unit with more working monitored interfaces wins. A unit that lost its WAN link loses here, no matter how high its priority is.</li>
<li><b>HA uptime (age).</b> The unit that has been up longer, in HA terms, wins, but only if the difference is larger than the age margin, 300 seconds by default (<code>ha-uptime-diff-margin</code>). Smaller differences are ignored.</li>
<li><b>Device priority.</b> The higher number wins (default 128, range 0 to 255).</li>
<li><b>Serial number.</b> The unit with the higher serial number wins. This is the final tie-breaker, so a cluster always elects exactly one primary.</li>
</ol>
<p>The big switch is the <code>override</code> setting. With <b>override disabled</b> (the default) the order above applies: monitored interfaces, then age, then priority, then serial. With <b>override enabled</b>, device priority moves ahead of age: monitored interfaces, then priority, then age, then serial. In practice, override disabled means "whoever has been primary stays primary", and override enabled means "the preferred unit takes control back whenever it is healthy".</p>

<table class="cmp"><tr><th>Step</th><th>Override disabled (default)</th><th>Override enabled</th></tr>
<tr><td>1</td><td>Monitored interfaces up</td><td>Monitored interfaces up</td></tr>
<tr><td>2</td><td>HA age (beyond margin)</td><td>Device priority</td></tr>
<tr><td>3</td><td>Device priority</td><td>HA age</td></tr>
<tr><td>4</td><td>Serial number</td><td>Serial number</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Primary election order">
<rect x="10" y="40" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Monitored</text><text x="80" y="84" text-anchor="middle" class="svg-muted" font-size="12">interfaces up</text>
<rect x="170" y="40" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Age or</text><text x="240" y="84" text-anchor="middle" class="svg-muted" font-size="12">priority (override)</text>
<rect x="330" y="40" width="140" height="60" rx="10" fill="#fde68a"/><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Priority or</text><text x="400" y="84" text-anchor="middle" class="svg-muted" font-size="12">age (override)</text>
<rect x="490" y="40" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Serial</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="12">number</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">The first criterion that differs decides the winner</text>
</svg><p class="cap">Order of comparison; override swaps steps 2 and 3.</p></div>

<h3>What "age" really means</h3>
<p>HA uptime is the time since the unit last joined or since its HA state last reset, not the time since boot. A unit that has just rebooted after a failure starts with a very small age, so with override disabled it will <b>not</b> take the primary role back: the unit that kept the network alive keeps it. You can reset the age on purpose with <code>diagnose sys ha reset-uptime</code>, which is a common, controlled way to force a failover during a test.</p>

<h3>Choosing override</h3>
<p>Override disabled is the safer default for most sites. A failover happens once, when something breaks, and then the network is quiet. You schedule the failback in a maintenance window, for example by resetting uptime or rebooting the current primary. Override enabled suits designs where one unit is larger or better placed and should always lead. The risk is <b>flapping</b>: if the preferred unit boots, takes the role, and then fails again, the cluster can bounce between units, each switch costing a short interruption. Use override only with stable hardware and with monitoring that you trust.</p>

<h3>Priority and the group ID</h3>
<p>Set a higher priority on the unit you want to lead, for example 200 on FGT-A and 100 on FGT-B. Priority is one of the few HA settings that is <b>not</b> synchronised, because each unit needs its own value. The <b>group ID</b> (0 to 255) matters when more than one cluster shares a Layer 2 network: it is built into the virtual MAC address, so two clusters with the same group ID on the same VLAN will fight over MAC addresses. Give every cluster on a segment a different group ID.</p>

<div class="eg"><p><b>Worked example.</b> FGT-A priority 200, FGT-B priority 100, override disabled. Both boot at the same time, ages are within the margin, so priority decides and FGT-A becomes primary. FGT-A's WAN cable is cut: it now has one fewer connected monitored interface, so FGT-B wins on criterion 1 and becomes primary. The cable is repaired and FGT-A rejoins healthy. With override disabled FGT-B keeps the role because FGT-A's age is now small. With override enabled FGT-A would take back control at once.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting the higher-priority unit to always win while override is disabled. Setting the same priority on both units and being surprised by serial-number outcomes. Enabling override on a flapping link. Giving two clusters the same group ID on one VLAN.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam asks "which unit becomes primary?" and gives priorities, ages and interface counts. Always apply: monitored interfaces first. Then check whether override is enabled before comparing age and priority.</p></div>

<div class="scn"><h4>The unit that would not take back the job</h4><p>After a power cut at a branch, FGT-A (priority 200) came back about two hours after FGT-B (priority 100) had already taken over. The engineer wanted FGT-A to resume at once and changed nothing, so FGT-B stayed primary. The engineer realised that override was disabled and age came before priority, so the older FGT-B was correct. In the weekend window they reset the uptime on FGT-B and FGT-A became primary cleanly.</p><p><b>Lesson:</b> with override off, the incumbent stays; schedule failback deliberately.</p></div>

<div class="iv"><p class="q">"Walk me through how a FortiGate cluster elects its primary."</p><p>First the number of connected monitored interfaces, then, with override disabled, HA age beyond the 300 second margin, then device priority, then the higher serial number. With override enabled, priority comes before age. I would add that priority is not synchronised and that I can force a failover test with <code>diagnose sys ha reset-uptime</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Election order: monitored interfaces, age, priority, serial; override moves priority ahead of age.</li>
<li>The age margin is 300 seconds by default.</li>
<li>Priority is per-unit and not synchronised; default 128.</li>
<li>Use different group IDs for clusters sharing a Layer 2 segment.</li>
<li>Override disabled prevents flapping and keeps the incumbent.</li>
</ul></div>
`,hi:`
<p>Jab do identical firewalls start hote hain to koi ek charge mein hona chahiye. FGCP yeh ek fixed <b>primary election</b> se tay karta hai. Agar criteria ka order aapko pata hai to aap kisi bhi situation mein predict kar sakte ho ki kaunsa unit jeetega, aur ajeeb behaviour explain kar sakte ho jaise "cluster apne aap fail back kyun kar gaya?" ya "fail back kyun nahi hua?". Yeh sabse zyada test hone wale HA topics mein se ek hai.</p>

<h3>Election criteria, kram se</h3>
<p>Har unit apne peers se in criteria par pehle se aakhir tak compare karta hai. Jo pehla criterion alag aata hai wahi winner tay karta hai.</p>
<ol>
<li><b>Connected monitored interfaces ki sankhya.</b> Jis unit ke zyada working monitored interfaces hain woh jeetta hai. Jis unit ka WAN link gaya woh yahin haar jaata hai, chahe uski priority kitni bhi zyada ho.</li>
<li><b>HA uptime (age).</b> Jo unit HA ke hisaab se zyada der se up hai woh jeetta hai, lekin sirf tab jab difference age margin se bada ho, default 300 seconds (<code>ha-uptime-diff-margin</code>). Chhote differences ignore hote hain.</li>
<li><b>Device priority.</b> Bada number jeetta hai (default 128, range 0 se 255).</li>
<li><b>Serial number.</b> Jis unit ka serial number bada ho woh jeetta hai. Yeh aakhri tie-breaker hai, isliye cluster hamesha theek ek primary chunta hai.</li>
</ol>
<p>Bada switch <code>override</code> setting hai. <b>Override disabled</b> (default) ho to upar wala order lagta hai: monitored interfaces, phir age, phir priority, phir serial. <b>Override enabled</b> ho to device priority age se aage aa jaati hai: monitored interfaces, phir priority, phir age, phir serial. Practice mein override disabled ka matlab "jo primary hai wahi primary rahega", aur override enabled ka matlab "preferred unit jaise hi healthy ho control wapas le leta hai".</p>

<table class="cmp"><tr><th>Step</th><th>Override disabled (default)</th><th>Override enabled</th></tr>
<tr><td>1</td><td>Monitored interfaces up</td><td>Monitored interfaces up</td></tr>
<tr><td>2</td><td>HA age (margin ke upar)</td><td>Device priority</td></tr>
<tr><td>3</td><td>Device priority</td><td>HA age</td></tr>
<tr><td>4</td><td>Serial number</td><td>Serial number</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Primary election ka order">
<rect x="10" y="40" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Monitored</text><text x="80" y="84" text-anchor="middle" class="svg-muted" font-size="12">interfaces up</text>
<rect x="170" y="40" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Age ya</text><text x="240" y="84" text-anchor="middle" class="svg-muted" font-size="12">priority (override)</text>
<rect x="330" y="40" width="140" height="60" rx="10" fill="#fde68a"/><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Priority ya</text><text x="400" y="84" text-anchor="middle" class="svg-muted" font-size="12">age (override)</text>
<rect x="490" y="40" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Serial</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="12">number</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Jo pehla criterion alag aaye wahi winner tay karta hai</text>
</svg><p class="cap">Comparison ka order; override step 2 aur 3 ko swap karta hai.</p></div>

<h3>"Age" ka asli matlab</h3>
<p>HA uptime woh time hai jab se unit last join hua ya uski HA state last reset hui, boot ke baad ka time nahi. Failure ke baad abhi reboot hua unit bahut chhoti age se start karta hai, isliye override disabled ho to woh primary role wapas <b>nahi</b> leta: jis unit ne network zinda rakha wahi role rakhta hai. Aap <code>diagnose sys ha reset-uptime</code> se age jaan-boojhkar reset kar sakte ho, jo test ke dauran failover force karne ka common, controlled tareeka hai.</p>

<h3>Override kaise chunein</h3>
<p>Zyadatar sites ke liye override disabled safer default hai. Failover ek baar hota hai, jab kuch tootta hai, aur phir network shaant rehta hai. Failback ko aap maintenance window mein schedule karte ho, jaise uptime reset karke ya current primary reboot karke. Override enabled un designs ke liye hai jahan ek unit bada ya better placed hai aur hamesha lead karna chahiye. Risk <b>flapping</b> ka hai: preferred unit boot hoke role le aur phir fail ho jaaye to cluster units ke beech uchhalta reh sakta hai, har switch par chhota interruption. Override sirf stable hardware aur bharose layak monitoring ke saath use karo.</p>

<h3>Priority aur group ID</h3>
<p>Jis unit ko lead karwana hai uski priority zyada rakho, jaise FGT-A par 200 aur FGT-B par 100. Priority un gine-chune HA settings mein se hai jo synchronise <b>nahi</b> hote, kyunki har unit ko apni value chahiye. <b>Group ID</b> (0 se 255) tab matter karta hai jab ek Layer 2 network par ek se zyada cluster hon: yeh virtual MAC address mein build hota hai, isliye ek hi VLAN par same group ID wale do clusters MAC addresses ke liye ladenge. Ek segment par har cluster ko alag group ID do.</p>

<div class="eg"><p><b>Worked example.</b> FGT-A priority 200, FGT-B priority 100, override disabled. Dono ek saath boot hote hain, ages margin ke andar hain, to priority decide karti hai aur FGT-A primary banta hai. FGT-A ka WAN cable kat jaata hai: ab uska ek connected monitored interface kam hai, isliye FGT-B criterion 1 par jeet jaata hai aur primary ban jaata hai. Cable repair hota hai aur FGT-A healthy rejoin karta hai. Override disabled hone se FGT-B role rakhta hai kyunki FGT-A ki age ab chhoti hai. Override enabled hota to FGT-A turant control wapas le leta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Override disabled hote hue bhi umeed karna ki zyada-priority wala unit hamesha jeetega. Dono units par same priority daalna aur serial-number wale outcomes se hairan hona. Flapping link par override enable karna. Ek VLAN par do clusters ko same group ID dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochta hai "kaunsa unit primary banega?" aur priorities, ages aur interface counts deta hai. Hamesha lagao: pehle monitored interfaces. Phir age aur priority compare karne se pehle dekho ki override enabled hai ya nahi.</p></div>

<div class="scn"><h4>Woh unit jisne kaam wapas nahi liya</h4><p>Branch mein power cut ke baad FGT-A (priority 200) FGT-B (priority 100) ke takeover karne ke lagbhag do ghante baad wapas aaya. Engineer chahta tha ki FGT-A turant resume kare aur usne kuch nahi badla, to FGT-B primary raha. Engineer ko samajh aaya ki override disabled tha aur age priority se pehle aati hai, isliye purana FGT-B sahi tha. Weekend window mein unhone FGT-B par uptime reset kiya aur FGT-A saaf tareeke se primary ban gaya.</p><p><b>Lesson:</b> override off ho to incumbent rehta hai; failback soch-samajhkar schedule karo.</p></div>

<div class="iv"><p class="q">"FortiGate cluster apna primary kaise chunta hai, samjhao."</p><p>Pehle connected monitored interfaces ki sankhya, phir override disabled ho to 300 second margin se zyada HA age, phir device priority, phir bada serial number. Override enabled ho to priority age se pehle aati hai. Main yeh bhi jodunga ki priority synchronise nahi hoti aur <code>diagnose sys ha reset-uptime</code> se failover test force kar sakta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Election order: monitored interfaces, age, priority, serial; override priority ko age se aage kar deta hai.</li>
<li>Age margin default mein 300 seconds hai.</li>
<li>Priority per-unit hai aur synchronise nahi hoti; default 128.</li>
<li>Ek Layer 2 segment share karne wale clusters ko alag group IDs do.</li>
<li>Override disabled flapping rokta hai aur incumbent ko rakhta hai.</li>
</ul></div>
`}};export{e as default};