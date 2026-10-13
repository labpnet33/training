var e={id:`ap-failover-rrm`,h:{en:`AP join order, failover priority, RRM and monitoring`,hi:`AP join order, failover priority, RRM aur monitoring`},body:{en:`
<h3>The case: Kestrel Logistics</h3>
<p>Kestrel Logistics runs a 250,000 square foot distribution centre with 900 APs. Barcode scanners, forklift tablets and a small office share the wireless network. The design uses two Catalyst 9800 controllers in an <b>N+N</b> layout: WLC-K1 carries 600 APs (warehouse floor) and WLC-K2 carries 300 APs (office and docks). Each controller can hold all 900 APs, but only if licences and capacity are planned for it.</p>
<p>One night WLC-K1 lost power. All 600 APs went looking for a new controller at the same moment. Some joined WLC-K2, some tried the wrong address, and the office APs, which joined first, filled the licence headroom. Forklift scanners stayed dark for 25 minutes while the office had perfect Wi-Fi. This chapter explains why, and how to design it right.</p>

<h3>Requirements and constraints</h3>
<ul>
<li>After a controller loss, <b>critical APs</b> (warehouse floor) must join before <b>non-critical</b> ones (office, canteen).</li>
<li>No re-pointing of APs by hand; the design must be repeatable for a new warehouse.</li>
<li>The channel plan and transmit power must stay stable when APs move controller.</li>
<li>Operations needs to see an AP-down or join-failure event within a minute, not from a user phone call.</li>
</ul>

<h3>How an AP decides where to join</h3>
<p>An AP that has lost its controller runs a fixed order. It first tries the controllers configured on <i>that AP</i>: <b>primary</b>, then <b>secondary</b>, then <b>tertiary</b>. If none answer, it tries the <b>backup controllers</b> configured globally (a primary backup and a secondary backup). If those fail, it runs discovery again: DHCP option 43, a DNS name such as <code>CISCO-CAPWAP-CONTROLLER.example</code>, or a local broadcast, and joins a controller that answers, preferring the least loaded one. A lost AP never stops looking. It detects a dead controller through the CAPWAP <b>heartbeat</b>, which defaults to 30 seconds and can be tightened with the fast heartbeat setting on supported platforms. Tight timers detect failure faster but can cause false failovers on a lossy path, so use them for local controllers, not for long WAN links.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="AP join order">
<rect x="20" y="100" width="110" height="50" rx="10" fill="#bbf7d0"/><text x="75" y="130" text-anchor="middle" class="svg-ink" font-size="13">AP loses WLC</text>
<rect x="190" y="20" width="170" height="40" rx="8" fill="#bae6fd"/><text x="275" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 Primary (AP config)</text>
<rect x="190" y="75" width="170" height="40" rx="8" fill="#bae6fd"/><text x="275" y="100" text-anchor="middle" class="svg-ink" font-size="13">2 Secondary</text>
<rect x="190" y="130" width="170" height="40" rx="8" fill="#bae6fd"/><text x="275" y="155" text-anchor="middle" class="svg-ink" font-size="13">3 Tertiary</text>
<rect x="190" y="185" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="275" y="210" text-anchor="middle" class="svg-ink" font-size="13">4 Global backup WLCs</text>
<rect x="420" y="100" width="190" height="50" rx="10" fill="#fde68a"/><text x="515" y="122" text-anchor="middle" class="svg-ink" font-size="13">5 Discovery</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">Option 43, DNS, broadcast</text>
<line x1="130" y1="125" x2="190" y2="40" stroke="#64748b" stroke-width="2"/><line x1="130" y1="125" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="130" y1="125" x2="190" y2="150" stroke="#64748b" stroke-width="2"/><line x1="130" y1="125" x2="190" y2="205" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="205" x2="420" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="245" width="14" height="14" fill="#bae6fd"/><text x="40" y="257" class="svg-muted" font-size="12">Per-AP list</text>
<rect x="130" y="245" width="14" height="14" fill="#ddd6fe"/><text x="150" y="257" class="svg-muted" font-size="12">Global list</text>
<rect x="240" y="245" width="14" height="14" fill="#fde68a"/><text x="260" y="257" class="svg-muted" font-size="12">Last resort</text>
</svg><p class="cap">The AP walks down the list in order. Anything configured on the AP wins over anything learned by discovery.</p></div>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Approach</th><th>Pro</th><th>Con</th></tr>
<tr><td>No per-AP primary/secondary, rely on discovery</td><td>Zero admin effort</td><td>Unpredictable: APs pile on one controller, channel plan changes</td></tr>
<tr><td>Per-AP primary and secondary, no priority</td><td>Predictable destination</td><td>If the backup is full, join order is first come, first served</td></tr>
<tr><td>Per-AP list plus <b>AP failover priority</b></td><td>Critical APs displace low-priority ones when the backup is full</td><td>Needs a priority plan and discipline</td></tr>
</table>
<p><b>AP failover priority</b> assigns each AP a level: critical, high, medium or low (low is the default). When the failover feature is enabled on the controller and the controller is at its AP limit, a higher-priority AP joining can force a lower-priority AP to leave. This is how Kestrel protects the warehouse floor. Priority only matters when the backup is full, so first size the backup properly; priority is the safety net, not a replacement for capacity.</p>

<h3>The chosen design</h3>
<p>Warehouse APs get primary WLC-K1, secondary WLC-K2, and priority <b>critical</b> or <b>high</b>. Office APs get primary WLC-K2, secondary WLC-K1, priority <b>low</b>. Both controllers use the <b>same RF group name</b>, so when APs move, RRM keeps one channel plan and one power plan instead of starting a new one. Both are in the same mobility group. A DNS entry and DHCP option 43 point to WLC-K1 and WLC-K2 as the discovery fallback for new or replacement APs. <b>AP fallback</b> (APs returning to their primary when it comes back) stays on, but the team verifies the primary is stable before the AP returns, because a fallback is a second brief outage for those APs.</p>

<h3>RRM and coverage-hole behaviour during a failure</h3>
<p>When an AP dies, its neighbours do not magically cover its area. RRM (Radio Resource Management) can raise transmit power through TPC and flag a <b>coverage hole</b> through coverage hole detection. A hole is flagged when enough clients report a signal below a threshold (defaults: -80 dBm for data and -75 dBm for voice, with at least 3 clients and a 25 percent exception level), and RRM can then increase the power of nearby APs. This helps, but it is a repair, not a guarantee. Voice areas should be designed so that the loss of one AP still leaves about -67 dBm coverage. That is a survey and design decision, covered in the survey module, not something RRM fixes after the fact.</p>
<div class="eg"><p><b>Worked example.</b> Aisle 14 has APs spaced 18 m apart at -62 dBm cell edge. Remove one AP and the gap is 36 m; the neighbours at +3 dB power reach about -71 dBm in the middle. Data scanners work, but voice badges would not. The fix is a design choice: add one extra AP at the end of the aisle, not a higher RRM maximum power.</p></div>

<h3>Monitoring so you know first</h3>
<p>Use Catalyst Center Assurance to see AP down events, join failures and client onboarding failures, and send controller syslog and SNMP traps to the operations tools. For fast, structured data, the 9800 can stream model-driven telemetry. Alert on <i>AP count dropping by more than a set percentage</i>, not only on single AP events.</p>
<pre class="out">Kestrel-K2#show ap summary
Number of APs: 900
AP Name        Slots  AP Model     Ethernet MAC    IP Address     State
WH-A14-AP03    2      C9130AXI-E   0011.2233.4401  10.20.14.13    <span class="hl">Registered</span>
OF-02-AP01     2      C9120AXI-E   0011.2233.7702  10.20.40.11    Registered</pre>

<div class="warn"><p><b>Post-mortem.</b> Kestrel had set secondary controllers but never set priority, and had given the backup licence headroom for only 700 APs. The first 700 to join were whoever was fastest. Fixes: licence and capacity for the full 900, priority on every AP, and an alert at 5 percent AP loss.</p></div>
<div class="exam"><p><b>Exam traps.</b> AP-specific primary, secondary and tertiary override global backups. Priority matters only when the controller is full. Aggressive heartbeat timers on a WAN cause false failovers.</p></div>

<div class="scn"><h4>The channel plan that reset itself</h4><p>After a failover test at a bottling plant, all APs jumped to new channels and some cells became unusable. The backup controller had a different RF group name, so the moved APs formed a new RF group and ran fresh DCA. The team matched RF group names and pinned channels in the three critical cells.</p><p><b>Lesson:</b> design the backup controller's RF settings as carefully as the primary's.</p></div>

<div class="iv"><p class="q">"How do you make sure the most important APs survive a controller failure when the backup is nearly full?"</p><p>Strong answer: size the backup for the full load first. Then set per-AP primary and secondary, enable AP failover priority and mark critical areas as critical or high, so lower-priority APs make room. Keep the RF group the same, alert on mass AP loss, and test it in a maintenance window.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Join order: AP primary, secondary, tertiary, then global backups, then discovery.</li>
<li>AP failover priority protects critical APs only when the backup is full; capacity comes first.</li>
<li>Use the same RF group name on backup controllers to avoid a channel plan reset.</li>
<li>RRM and coverage hole detection repair gaps; they do not replace N-1 coverage design.</li>
<li>Monitor AP count and join failures with Catalyst Center Assurance, syslog and telemetry.</li>
</ul></div>
`,hi:`
<h3>Case: Kestrel Logistics</h3>
<p>Kestrel Logistics ka 250,000 square foot ka distribution centre hai jismein 900 APs hain. Barcode scanners, forklift tablets aur ek chhota office ek hi wireless network share karte hain. Design mein do Catalyst 9800 controllers <b>N+N</b> layout mein hain: WLC-K1 600 APs (warehouse floor) carry karta hai aur WLC-K2 300 APs (office aur docks). Har controller sabhi 900 APs hold kar sakta hai, lekin tabhi jab licences aur capacity uske hisaab se plan ho.</p>
<p>Ek raat WLC-K1 ki power chali gayi. 600 APs ek hi waqt par naya controller dhoondhne lage. Kuch WLC-K2 se jude, kuch galat address try karte rahe, aur office ke APs, jo pehle join hue, licence headroom bhar gaye. Forklift scanners 25 minute andhere mein rahe jabki office mein perfect Wi-Fi tha. Yeh chapter batata hai kyun, aur ise sahi kaise design karein.</p>

<h3>Requirements aur constraints</h3>
<ul>
<li>Controller loss ke baad <b>critical APs</b> (warehouse floor) ko <b>non-critical</b> APs (office, canteen) se pehle join karna chahiye.</li>
<li>APs ko haath se re-point nahi karna; design naye warehouse ke liye repeatable ho.</li>
<li>APs ke controller badalne par channel plan aur transmit power stable rehne chahiye.</li>
<li>Operations ko AP-down ya join-failure event ek minute mein dikhna chahiye, user ke phone call se nahi.</li>
</ul>

<h3>AP kaise decide karta hai ki kahan join kare</h3>
<p>Jo AP apna controller kho deta hai woh ek fixed order chalata hai. Pehle woh <i>us AP par</i> configured controllers try karta hai: <b>primary</b>, phir <b>secondary</b>, phir <b>tertiary</b>. Koi na mile to global backup controllers (ek primary backup aur ek secondary backup). Woh bhi fail hon to dobara discovery chalata hai: DHCP option 43, DNS name jaise <code>CISCO-CAPWAP-CONTROLLER.example</code>, ya local broadcast, aur jo controller jawab de usse join karta hai, least loaded ko prefer karte hue. Khoya hua AP dhoondhna kabhi band nahi karta. Woh dead controller ko CAPWAP <b>heartbeat</b> se detect karta hai, jo default mein 30 seconds hai aur supported platforms par fast heartbeat setting se tight kiya ja sakta hai. Tight timers failure jaldi detect karte hain lekin lossy path par false failover kara sakte hain, isliye inhe local controllers ke liye use karo, lambi WAN links ke liye nahi.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="AP join order">
<rect x="20" y="100" width="110" height="50" rx="10" fill="#bbf7d0"/><text x="75" y="130" text-anchor="middle" class="svg-ink" font-size="13">AP ne WLC khoya</text>
<rect x="190" y="20" width="170" height="40" rx="8" fill="#bae6fd"/><text x="275" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 Primary (AP config)</text>
<rect x="190" y="75" width="170" height="40" rx="8" fill="#bae6fd"/><text x="275" y="100" text-anchor="middle" class="svg-ink" font-size="13">2 Secondary</text>
<rect x="190" y="130" width="170" height="40" rx="8" fill="#bae6fd"/><text x="275" y="155" text-anchor="middle" class="svg-ink" font-size="13">3 Tertiary</text>
<rect x="190" y="185" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="275" y="210" text-anchor="middle" class="svg-ink" font-size="13">4 Global backup WLCs</text>
<rect x="420" y="100" width="190" height="50" rx="10" fill="#fde68a"/><text x="515" y="122" text-anchor="middle" class="svg-ink" font-size="13">5 Discovery</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">Option 43, DNS, broadcast</text>
<line x1="130" y1="125" x2="190" y2="40" stroke="#64748b" stroke-width="2"/><line x1="130" y1="125" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="130" y1="125" x2="190" y2="150" stroke="#64748b" stroke-width="2"/><line x1="130" y1="125" x2="190" y2="205" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="205" x2="420" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="245" width="14" height="14" fill="#bae6fd"/><text x="40" y="257" class="svg-muted" font-size="12">Per-AP list</text>
<rect x="130" y="245" width="14" height="14" fill="#ddd6fe"/><text x="150" y="257" class="svg-muted" font-size="12">Global list</text>
<rect x="240" y="245" width="14" height="14" fill="#fde68a"/><text x="260" y="257" class="svg-muted" font-size="12">Aakhri raasta</text>
</svg><p class="cap">AP list mein order se neeche jaata hai. AP par jo configured hai woh discovery se seekhe hue se upar rehta hai.</p></div>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Approach</th><th>Fayda</th><th>Nuksaan</th></tr>
<tr><td>Per-AP primary/secondary nahi, discovery par bharosa</td><td>Zero admin effort</td><td>Unpredictable: APs ek controller par dher ho jaate hain, channel plan badal jaata hai</td></tr>
<tr><td>Per-AP primary aur secondary, priority nahi</td><td>Predictable destination</td><td>Backup full ho to join order first come, first served hota hai</td></tr>
<tr><td>Per-AP list ke saath <b>AP failover priority</b></td><td>Backup full hone par critical APs low-priority APs ko hata dete hain</td><td>Priority plan aur discipline chahiye</td></tr>
</table>
<p><b>AP failover priority</b> har AP ko ek level deti hai: critical, high, medium ya low (low default hai). Jab controller par failover feature enabled ho aur controller apni AP limit par ho, to higher-priority AP ke join karne par lower-priority AP ko chhodna pad sakta hai. Isi tarah Kestrel warehouse floor ko protect karta hai. Priority tabhi matter karti hai jab backup full ho, isliye pehle backup ko sahi size karo; priority safety net hai, capacity ka replacement nahi.</p>

<h3>Chosen design</h3>
<p>Warehouse APs ko primary WLC-K1, secondary WLC-K2 aur priority <b>critical</b> ya <b>high</b> milti hai. Office APs ko primary WLC-K2, secondary WLC-K1 aur priority <b>low</b>. Dono controllers ka <b>RF group name same</b> hai, isliye APs ke move hone par RRM naya plan shuru nahi karta, ek hi channel aur power plan chalata hai. Dono ek hi mobility group mein hain. Naye ya replacement APs ke liye discovery fallback ke roop mein DNS entry aur DHCP option 43 WLC-K1 aur WLC-K2 ko point karte hain. <b>AP fallback</b> (primary wapas aane par APs ka laut jaana) on rehta hai, lekin team verify karti hai ki primary stable hai tabhi AP wapas jaye, kyunki fallback un APs ke liye doosra chhota outage hai.</p>

<h3>Failure ke dauran RRM aur coverage-hole behaviour</h3>
<p>Jab AP mar jaata hai, uske neighbours uska area apne aap cover nahi karte. RRM (Radio Resource Management) TPC se transmit power badha sakta hai aur coverage hole detection se <b>coverage hole</b> flag kar sakta hai. Hole tab flag hota hai jab kaafi clients threshold se neeche signal report karein (defaults: data ke liye -80 dBm aur voice ke liye -75 dBm, kam se kam 3 clients aur 25 percent exception level), aur tab RRM paas ke APs ka power badha sakta hai. Yeh madad karta hai, lekin yeh repair hai, guarantee nahi. Voice areas aise design hone chahiye ki ek AP ke jaane par bhi lagbhag -67 dBm coverage bachi rahe. Yeh survey aur design ka faisla hai, survey module mein cover hua hai, RRM baad mein ise fix nahi karta.</p>
<div class="eg"><p><b>Worked example.</b> Aisle 14 mein APs 18 m ke gap par hain aur cell edge -62 dBm hai. Ek AP hatao to gap 36 m ho jaata hai; +3 dB power par neighbours beech mein lagbhag -71 dBm tak pahunchte hain. Data scanners chalte hain, lekin voice badges nahi. Fix design choice hai: aisle ke end par ek extra AP lagao, RRM ka maximum power badhana nahi.</p></div>

<h3>Monitoring taaki aap pehle jaano</h3>
<p>AP down events, join failures aur client onboarding failures dekhne ke liye Catalyst Center Assurance use karo, aur controller syslog aur SNMP traps operations tools ko bhejo. Tez, structured data ke liye 9800 model-driven telemetry stream kar sakta hai. Sirf single AP events par nahi, <i>AP count ke ek set percentage se zyada girne</i> par alert lagao.</p>
<pre class="out">Kestrel-K2#show ap summary
Number of APs: 900
AP Name        Slots  AP Model     Ethernet MAC    IP Address     State
WH-A14-AP03    2      C9130AXI-E   0011.2233.4401  10.20.14.13    <span class="hl">Registered</span>
OF-02-AP01     2      C9120AXI-E   0011.2233.7702  10.20.40.11    Registered</pre>

<div class="warn"><p><b>Post-mortem.</b> Kestrel ne secondary controllers set kiye the lekin priority kabhi set nahi ki, aur backup mein licence headroom sirf 700 APs ka tha. Pehle jo 700 join hue woh sabse tez the. Fixes: poore 900 ke liye licence aur capacity, har AP par priority, aur 5 percent AP loss par alert.</p></div>
<div class="exam"><p><b>Exam traps.</b> AP-specific primary, secondary aur tertiary global backups ko override karte hain. Priority tabhi matter karti hai jab controller full ho. WAN par aggressive heartbeat timers false failover karate hain.</p></div>

<div class="scn"><h4>Channel plan jo khud reset ho gaya</h4><p>Ek bottling plant par failover test ke baad saare APs naye channels par chale gaye aur kuch cells unusable ho gaye. Backup controller ka RF group name alag tha, isliye move hue APs ne naya RF group banaya aur fresh DCA chalaya. Team ne RF group names match kiye aur teen critical cells mein channels pin kiye.</p><p><b>Seekh:</b> backup controller ki RF settings utni hi dhyan se design karo jitni primary ki.</p></div>

<div class="iv"><p class="q">"Backup lagbhag full ho to kaise sunishchit karoge ki sabse zaroori APs controller failure mein bach jaayein?"</p><p>Strong answer: pehle backup ko poore load ke liye size karo. Phir per-AP primary aur secondary set karo, AP failover priority enable karo aur critical areas ko critical ya high mark karo, taaki lower-priority APs jagah banayein. RF group same rakho, mass AP loss par alert lagao, aur maintenance window mein test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Join order: AP primary, secondary, tertiary, phir global backups, phir discovery.</li>
<li>AP failover priority critical APs ko tabhi bachati hai jab backup full ho; capacity pehle aati hai.</li>
<li>Channel plan reset se bachne ke liye backup controllers par same RF group name use karo.</li>
<li>RRM aur coverage hole detection gaps repair karte hain; N-1 coverage design ka replacement nahi.</li>
<li>AP count aur join failures ko Catalyst Center Assurance, syslog aur telemetry se monitor karo.</li>
</ul></div>
`}};export{e as default};