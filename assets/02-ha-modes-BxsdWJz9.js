var e={id:`ha-modes`,h:{en:`Active-passive, active-active and the other ways to clone a firewall`,hi:`Active-passive, active-active aur firewall ko clone karne ke doosre tareeke`},body:{en:`
<p>Before you configure anything you must choose a <b>mode</b>. The mode decides who forwards traffic, how much of the second firewall you actually use, and how complicated troubleshooting becomes. FGCP offers <b>active-passive (a-p)</b> and <b>active-active (a-a)</b>. FortiOS also has a <b>standalone</b> mode, which simply means HA is off.</p>

<h3>Active-passive: one works, one waits</h3>
<p>In <b>active-passive</b> mode the primary unit handles all traffic. The secondary is fully configured and synchronised but forwards nothing. If the primary fails, the secondary becomes primary and starts forwarding. It is the simplest mode, the easiest to troubleshoot, and the one most companies deploy. Think of a spare tyre: it sits there doing nothing until you need it, and when you need it you are glad it is there.</p>
<ul>
<li>The secondary does not process traffic, so it cannot be overloaded by the cluster's workload.</li>
<li>Any traffic type is supported, including everything that is hard to share between two units.</li>
<li>Capacity is that of one firewall, not two.</li>
</ul>

<h3>Active-active: both work, but not for everything</h3>
<p>In <b>active-active</b> mode the primary receives all sessions and then <b>load balances</b> some of them to the secondary over the heartbeat link. The secondary does the security inspection work (for example antivirus or IPS on proxy-based or UTM sessions) and returns results. The key surprise for newcomers is this: by default only security-profile (UTM) traffic is distributed. Plain TCP, UDP and ICMP sessions stay on the primary unless you enable load balancing for them. The load-balancing algorithm is configurable (for example <code>round-robin</code>, <code>weight-round-robin</code>, <code>least-connection</code>, <code>ip</code>), and each unit can be given a weight.</p>
<ul>
<li>Useful when inspection CPU is the bottleneck and you want both units to share it.</li>
<li>More moving parts: the primary is still the single entry point, and the heartbeat links carry real traffic, so they need enough bandwidth.</li>
<li>Failures are harder to reason about, because a session may be touched by two units.</li>
</ul>

<table class="cmp"><tr><th>Question</th><th>Active-passive</th><th>Active-active</th></tr>
<tr><td>Who forwards?</td><td>Primary only</td><td>Primary, plus offloaded sessions on the secondary</td></tr>
<tr><td>Capacity</td><td>One unit</td><td>Up to about two units for inspected traffic</td></tr>
<tr><td>Complexity</td><td>Low</td><td>Higher</td></tr>
<tr><td>Typical use</td><td>Most branches and data centers</td><td>Heavy UTM inspection</td></tr>
<tr><td>Heartbeat load</td><td>Config and sync only</td><td>Config, sync and distributed traffic</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Active-passive and active-active traffic">
<rect x="20" y="30" width="270" height="110" rx="10" fill="#e2e8f0"/><text x="155" y="22" text-anchor="middle" class="svg-ink" font-size="13">Active-passive</text>
<rect x="40" y="60" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="12">Primary 100%</text>
<rect x="170" y="60" width="100" height="50" rx="8" fill="#fde68a"/><text x="220" y="90" text-anchor="middle" class="svg-ink" font-size="12">Standby 0%</text>
<rect x="350" y="30" width="270" height="110" rx="10" fill="#e2e8f0"/><text x="485" y="22" text-anchor="middle" class="svg-ink" font-size="13">Active-active</text>
<rect x="370" y="60" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="420" y="90" text-anchor="middle" class="svg-ink" font-size="12">Primary</text>
<rect x="500" y="60" width="100" height="50" rx="8" fill="#bae6fd"/><text x="550" y="90" text-anchor="middle" class="svg-ink" font-size="12">Secondary</text>
<line x1="470" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/><text x="485" y="130" text-anchor="middle" class="svg-muted" font-size="12">UTM sessions shared</text>
</svg><p class="cap">Active-passive keeps one unit working; active-active shares inspection work.</p></div>

<h3>Virtual clusters and other terms</h3>
<p>A <b>virtual cluster</b> (VDOM partitioning) lets you split VDOMs between the two units, so unit A is primary for VDOM-1 and unit B is primary for VDOM-2. This gives per-VDOM load sharing while staying active-passive in each virtual cluster. It needs multiple VDOMs and is an advanced topic; for the exam know the idea and that it exists.</p>
<p>Do not confuse FGCP with two other mechanisms. <b>FGSP</b> (FortiGate Session Life Support Protocol) synchronises sessions between firewalls that each have their own configuration, usually behind asymmetric routing or a load balancer. <b>VRRP</b> lets FortiGates share a gateway address with a neighbour or with each other but does not synchronise configuration. FGCP is the one that gives you a true cluster.</p>

<h3>What must be identical</h3>
<p>All cluster members must be the <b>same hardware model</b>, run the <b>same FortiOS firmware version and build</b>, be in the same operating mode (NAT or transparent) and VDOM mode, and have the same HA settings: <b>group name, password, group ID and mode</b>. On virtual machines each unit also needs its own valid licence. If these differ, the units do not form a cluster or, worse, form a cluster that behaves unpredictably.</p>

<div class="eg"><p><b>Worked example.</b> A branch with 60 users and light inspection chooses active-passive: FGT-A primary, FGT-B standby. A large campus with deep inspection pushing 80 percent CPU chooses active-active with <code>load-balance-all</code> off, so only UTM sessions are shared and the primary stays predictable. After the change, the firewall team watches CPU on both units with <code>get system performance status</code> to confirm the sharing.</p></div>

<div class="warn"><p><b>Common mistake.</b> Choosing active-active because it sounds twice as good. If your traffic is mostly plain forwarding with little UTM, nothing is shared and you only gained complexity. Also, in active-active, if each unit runs near full load, a failure doubles the load on the survivor and may cause an outage anyway.</p></div>
<div class="exam"><p><b>Exam trap.</b> "In active-active, which sessions are load balanced by default?" The answer is UTM (proxy and inspection) sessions only; TCP, UDP and ICMP are not load balanced unless enabled.</p></div>

<div class="scn"><h4>The "active-active" cluster that used one firewall</h4><p>A team built an active-active pair and proudly reported two-firewall capacity. Monitoring showed the secondary at 3 percent CPU while the primary sat near 90 percent. The traffic was almost all plain routed TCP with no security profiles, so nothing was ever offloaded. They moved to active-passive, simpler and equally effective, and bought a bigger model for the capacity they really needed.</p><p><b>Lesson:</b> active-active only helps when there is inspection work to share.</p></div>

<div class="iv"><p class="q">"Active-passive or active-active: which would you choose?"</p><p>Active-passive by default, because it is simpler, predictable and easier to troubleshoot. I would pick active-active only when inspection CPU is the proven bottleneck. I would add that a-a offloads UTM sessions by default, not all traffic, and that a failure must still be survivable by one unit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Active-passive: primary forwards, secondary waits; the common choice.</li>
<li>Active-active: primary distributes UTM sessions to the secondary; plain sessions stay on primary by default.</li>
<li>Members need the same model, firmware, HA group name, password and mode.</li>
<li>FGSP and VRRP are different features from an FGCP cluster.</li>
<li>Size the survivor to carry the whole load.</li>
</ul></div>
`,hi:`
<p>Kuch bhi configure karne se pehle aapko ek <b>mode</b> chunna hota hai. Mode decide karta hai ki traffic kaun forward karega, doosre firewall ka asal mein kitna use hoga, aur troubleshooting kitni mushkil hogi. FGCP <b>active-passive (a-p)</b> aur <b>active-active (a-a)</b> deta hai. FortiOS mein <b>standalone</b> mode bhi hai, jiska matlab bas HA off hai.</p>

<h3>Active-passive: ek kaam karta hai, ek intezaar</h3>
<p><b>Active-passive</b> mode mein primary unit saara traffic handle karta hai. Secondary poori tarah configured aur synchronised hota hai lekin kuch forward nahi karta. Primary fail ho to secondary primary ban jaata hai aur forward karna shuru karta hai. Yeh sabse simple mode hai, troubleshoot karna sabse aasaan hai, aur zyadatar companies yahi lagati hain. Spare tyre ki tarah socho: jab tak zaroorat nahi, woh bas padha rehta hai, aur zaroorat padne par aap khush hote ho ki woh wahan hai.</p>
<ul>
<li>Secondary traffic process nahi karta, isliye cluster ke workload se overload nahi ho sakta.</li>
<li>Har traffic type support hota hai, woh bhi jo do units ke beech share karna mushkil hai.</li>
<li>Capacity ek firewall ki hai, do ki nahi.</li>
</ul>

<h3>Active-active: dono kaam karte hain, lekin har cheez ke liye nahi</h3>
<p><b>Active-active</b> mode mein primary saare sessions receive karta hai aur kuch sessions ko heartbeat link par secondary ko <b>load balance</b> karta hai. Secondary security inspection ka kaam karta hai (jaise proxy-based ya UTM sessions par antivirus ya IPS) aur result wapas bhejta hai. Newcomers ke liye sabse badi hairaani yeh hai: default mein sirf security-profile (UTM) traffic distribute hota hai. Plain TCP, UDP aur ICMP sessions primary par hi rehte hain jab tak aap unke liye load balancing enable na karo. Load-balancing algorithm configurable hai (jaise <code>round-robin</code>, <code>weight-round-robin</code>, <code>least-connection</code>, <code>ip</code>), aur har unit ko weight diya ja sakta hai.</p>
<ul>
<li>Tab kaam aata hai jab inspection CPU bottleneck ho aur aap chahte ho dono units share karein.</li>
<li>Zyada moving parts: primary phir bhi single entry point hai, aur heartbeat links par asli traffic chalta hai, isliye unhe kaafi bandwidth chahiye.</li>
<li>Failures samajhna mushkil hai, kyunki ek session do units ko chhu sakta hai.</li>
</ul>

<table class="cmp"><tr><th>Sawaal</th><th>Active-passive</th><th>Active-active</th></tr>
<tr><td>Forward kaun karta hai?</td><td>Sirf primary</td><td>Primary, plus secondary par offload hue sessions</td></tr>
<tr><td>Capacity</td><td>Ek unit</td><td>Inspected traffic ke liye lagbhag do units tak</td></tr>
<tr><td>Complexity</td><td>Kam</td><td>Zyada</td></tr>
<tr><td>Typical use</td><td>Zyadatar branches aur data centers</td><td>Heavy UTM inspection</td></tr>
<tr><td>Heartbeat load</td><td>Sirf config aur sync</td><td>Config, sync aur distributed traffic</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Active-passive aur active-active traffic">
<rect x="20" y="30" width="270" height="110" rx="10" fill="#e2e8f0"/><text x="155" y="22" text-anchor="middle" class="svg-ink" font-size="13">Active-passive</text>
<rect x="40" y="60" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="12">Primary 100%</text>
<rect x="170" y="60" width="100" height="50" rx="8" fill="#fde68a"/><text x="220" y="90" text-anchor="middle" class="svg-ink" font-size="12">Standby 0%</text>
<rect x="350" y="30" width="270" height="110" rx="10" fill="#e2e8f0"/><text x="485" y="22" text-anchor="middle" class="svg-ink" font-size="13">Active-active</text>
<rect x="370" y="60" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="420" y="90" text-anchor="middle" class="svg-ink" font-size="12">Primary</text>
<rect x="500" y="60" width="100" height="50" rx="8" fill="#bae6fd"/><text x="550" y="90" text-anchor="middle" class="svg-ink" font-size="12">Secondary</text>
<line x1="470" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/><text x="485" y="130" text-anchor="middle" class="svg-muted" font-size="12">UTM sessions share hote hain</text>
</svg><p class="cap">Active-passive mein ek unit kaam karta hai; active-active inspection ka kaam share karta hai.</p></div>

<h3>Virtual clusters aur doosre terms</h3>
<p><b>Virtual cluster</b> (VDOM partitioning) se aap VDOMs ko do units ke beech baant sakte ho, jaise unit A VDOM-1 ke liye primary aur unit B VDOM-2 ke liye primary. Isse har virtual cluster active-passive rehte hue per-VDOM load sharing milti hai. Isme multiple VDOMs chahiye aur yeh advanced topic hai; exam ke liye idea aur yeh ki yeh exist karta hai, itna jaanna kaafi hai.</p>
<p>FGCP ko do aur mechanisms se confuse mat karo. <b>FGSP</b> (FortiGate Session Life Support Protocol) un firewalls ke beech sessions sync karta hai jinki apni-apni configuration hoti hai, aksar asymmetric routing ya load balancer ke peeche. <b>VRRP</b> FortiGates ko neighbour ke saath ya aapas mein gateway address share karne deta hai lekin configuration sync nahi karta. FGCP wahi hai jo asli cluster deta hai.</p>

<h3>Kya identical hona chahiye</h3>
<p>Saare cluster members ka <b>same hardware model</b> hona chahiye, <b>same FortiOS firmware version aur build</b>, same operating mode (NAT ya transparent) aur VDOM mode, aur same HA settings: <b>group name, password, group ID aur mode</b>. Virtual machines par har unit ko apna valid licence bhi chahiye. Inme se kuch alag ho to units cluster nahi banate ya, aur bura, aisa cluster banate hain jo unpredictably behave karta hai.</p>

<div class="eg"><p><b>Worked example.</b> 60 users aur halki inspection wala branch active-passive chunta hai: FGT-A primary, FGT-B standby. Deep inspection se 80 percent CPU wala bada campus active-active chunta hai aur <code>load-balance-all</code> off rakhta hai, taaki sirf UTM sessions share hon aur primary predictable rahe. Change ke baad firewall team <code>get system performance status</code> se dono units ka CPU dekhti hai ki sharing sach mein ho rahi hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Active-active isliye chunna kyunki woh doguna accha lagta hai. Agar aapka traffic zyadatar plain forwarding hai aur UTM kam hai to kuch share nahi hota aur sirf complexity badhti hai. Aur active-active mein agar har unit full load ke paas chalti hai to ek failure survivor par load doguna kar deta hai aur phir bhi outage ho sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Active-active mein default mein kaun se sessions load balance hote hain?" Jawab hai sirf UTM (proxy aur inspection) sessions; TCP, UDP aur ICMP tab tak nahi jab tak enable na karo.</p></div>

<div class="scn"><h4>Woh "active-active" cluster jo ek hi firewall use karta tha</h4><p>Ek team ne active-active pair banaya aur garv se do-firewall capacity report ki. Monitoring mein secondary 3 percent CPU par tha jabki primary 90 percent ke paas. Traffic lagbhag poora plain routed TCP tha bina security profiles ke, isliye kuch offload hi nahi hua. Unhone active-passive par shift kiya, jo simple aur utna hi effective tha, aur asli zaroorat wali capacity ke liye bada model liya.</p><p><b>Lesson:</b> active-active tab hi kaam aata hai jab share karne layak inspection ka kaam ho.</p></div>

<div class="iv"><p class="q">"Active-passive ya active-active: aap kaunsa chunoge?"</p><p>Default mein active-passive, kyunki yeh simple, predictable aur troubleshoot karne mein aasaan hai. Active-active tab chunoonga jab inspection CPU proven bottleneck ho. Yeh bhi jodunga ki a-a default mein UTM sessions offload karta hai, saara traffic nahi, aur ek unit ko failure survive karna aana chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Active-passive: primary forward karta hai, secondary intezaar; common choice.</li>
<li>Active-active: primary UTM sessions secondary ko distribute karta hai; plain sessions default mein primary par rehte hain.</li>
<li>Members ka same model, firmware, HA group name, password aur mode hona chahiye.</li>
<li>FGSP aur VRRP, FGCP cluster se alag features hain.</li>
<li>Survivor ko poora load uthane layak size karo.</li>
</ul></div>
`}};export{e as default};