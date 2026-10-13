var e={id:`ha-models`,h:{en:`The three HA models: active/standby, active/active and clustering`,hi:`Teen HA models: active/standby, active/active aur clustering`},body:{en:`
<p>Think of a toll plaza. In the simplest design there is one open booth and one spare booth with a cashier sitting ready: if the open booth breaks, the spare opens. That is <b>active/standby</b>. A busier plaza opens two booths, one per direction, and each cashier is trained to run both directions if the other goes home: that is <b>active/active</b>. A motorway plaza opens twelve booths behind one big sign and a controller who sends cars to any free booth: that is <b>clustering</b>. Cisco Secure Firewall offers all three models; this chapter tells you when each one fits.</p>

<h3>Model 1: active/standby failover</h3>
<p>Two identical units. One is <b>Active</b> and passes all traffic; the other is <b>Standby Ready</b> and passes none. The standby holds a synchronised copy of the configuration and, with stateful failover, of the connection state. This is the model used by the vast majority of internet edges and branches, it works in single context and multiple context mode, and it is the only failover model that Secure Firewall Threat Defense (FTD) supports. Everything you configure in the labs of this module is active/standby.</p>
<ul>
<li><b>Pros:</b> simple, predictable, easy to size (the standby is identical, so it can always carry the full load), supported everywhere.</li>
<li><b>Cons:</b> half of the hardware you bought sits idle most of the time.</li>
</ul>

<h3>Model 2: active/active failover (ASA only)</h3>
<p>Active/active is not "both units forward the same traffic". It needs <b>multiple context mode</b>, where one physical ASA is divided into several virtual firewalls called <b>security contexts</b>, each with its own interfaces, policy and routing table. You then group the contexts into exactly two <b>failover groups</b>:</p>
<ul>
<li><b>Failover group 1</b> is normally active on the primary unit. The <b>admin context</b> always belongs to group 1, and new contexts join group 1 by default.</li>
<li><b>Failover group 2</b> is normally active on the secondary unit.</li>
</ul>
<p>Each unit is therefore active for some contexts and standby for the others, so both boxes forward traffic at the same time. Failover happens <b>per group</b>: if the secondary fails, group 2 moves to the primary, which now runs every context.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Active/active failover groups">
<rect x="40" y="30" width="240" height="170" rx="10" fill="#e2e8f0"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="14">Primary unit</text>
<rect x="360" y="30" width="240" height="170" rx="10" fill="#e2e8f0"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="14">Secondary unit</text>
<rect x="60" y="70" width="200" height="50" rx="8" fill="#bae6fd"/><text x="160" y="92" text-anchor="middle" class="svg-ink" font-size="13">Group 1: admin, CUST-A</text><text x="160" y="110" text-anchor="middle" class="svg-accent" font-size="12">Active</text>
<rect x="60" y="135" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="160" y="157" text-anchor="middle" class="svg-ink" font-size="13">Group 2: CUST-B</text><text x="160" y="175" text-anchor="middle" class="svg-muted" font-size="12">Standby</text>
<rect x="380" y="70" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="480" y="92" text-anchor="middle" class="svg-ink" font-size="13">Group 1: admin, CUST-A</text><text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="12">Standby</text>
<rect x="380" y="135" width="200" height="50" rx="8" fill="#bae6fd"/><text x="480" y="157" text-anchor="middle" class="svg-ink" font-size="13">Group 2: CUST-B</text><text x="480" y="175" text-anchor="middle" class="svg-accent" font-size="12">Active</text>
<line x1="280" y1="115" x2="360" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">failover link</text>
<text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">Both units forward traffic, each for a different failover group</text>
</svg><p class="cap">Active/active: failover group 1 is active on the primary, group 2 on the secondary. Each context belongs to one group.</p></div>

<p>The configuration lives in the <b>system execution space</b>:</p>
<pre class="code"><span class="c">! system context of an ASA in multiple context mode</span>
failover group 1
 primary
 preempt
failover group 2
 secondary
 preempt
context CUST-A
 join-failover-group 1
context CUST-B
 join-failover-group 2</pre>
<p>Note the <code>preempt</code> keyword: in active/active each group can be told to return to its preferred unit when that unit comes back. Active/standby has no such command, as chapter 10 explains.</p>

<div class="eg"><p><b>Worked example: the 50 % rule.</b> Two ASAs each rated at 10 Gbps run active/active. CUST-A (group 1) peaks at 6 Gbps and CUST-B (group 2) at 5 Gbps. Day to day each box is below its limit. But when the secondary fails, the primary must carry 6 + 5 = 11 Gbps, which is more than 10 Gbps, and users suffer exactly during the failure you built HA for. For real redundancy the combined load of both groups must fit into one unit, so each unit should run at or below about 50 % of its capacity.</p></div>

<p>Two more details that appear in exams: <b>asymmetric routing</b> between the units (a reply arriving on the unit where the context is standby) is handled with <code>asr-group</code> on the interfaces, which redirects the packet to the unit that owns the session; and because the same physical interface may be shared by several contexts, you give each context unique MAC addresses (for example with <code>mac-address auto</code>).</p>

<h3>Model 3: clustering</h3>
<p>A cluster joins several units (up to 16 on platforms such as the Firepower 4100/9300 and Secure Firewall 3100/4200, depending on software version) into <b>one logical firewall</b> with one configuration. All members forward traffic and share connection state over a <b>cluster control link</b> (CCL). One member is the <b>control node</b> (formerly called master); the rest are <b>data nodes</b> (formerly slaves). Clustering adds throughput and redundancy at the same time; chapter 11 covers its interface modes and flow roles at concept level.</p>

<table class="cmp"><tr><th></th><th>Active/standby</th><th>Active/active</th><th>Clustering</th></tr>
<tr><td>Units</td><td>2</td><td>2</td><td>2 up to 16 (platform dependent)</td></tr>
<tr><td>Who forwards</td><td>active unit only</td><td>both, for different contexts</td><td>all members</td></tr>
<tr><td>Context mode</td><td>single or multiple</td><td>multiple only</td><td>single or multiple (ASA)</td></tr>
<tr><td>Threat Defense support</td><td>yes</td><td>no</td><td>yes</td></tr>
<tr><td>Preemption</td><td>no</td><td>optional per group</td><td>control node election by priority</td></tr>
<tr><td>Typical use</td><td>internet edge, branch, DMZ</td><td>multi-tenant ASA, service providers</td><td>data centre, high throughput</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Choosing active/active "to use both boxes" and then loading each unit to 80 %. The first real failure overloads the survivor. If you cannot keep each unit under half load, use active/standby with bigger boxes or a cluster.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active/active requires multiple context mode and uses two failover groups; there is no active/active in single context mode and none on Threat Defense. Also remember: the admin context is always in failover group 1.</p></div>

<div class="scn"><h4>The hosting provider's Monday morning</h4><p>A hosting provider ran twenty customer contexts in active/active, ten per group. Over two years customer traffic grew and both units averaged 70 % CPU. When a power supply failed on the secondary, group 2 moved to the primary, CPU hit 100 % and every customer saw packet loss. The engineer checked <code>show cpu usage</code> and <code>show traffic</code> history, which showed the combined load had been above one unit's capacity for months. The fix was a hardware refresh and a monitoring alarm at 45 % CPU per unit.</p><p><b>Lesson:</b> active/active is only redundant if either unit can carry both groups alone.</p></div>

<div class="iv"><p class="q">"What does active/active failover need, and how is it different from load balancing?"</p><p>Strong answer: it needs multiple context mode and two failover groups; group 1 (with the admin context) is active on the primary, group 2 on the secondary. Each context is active on only one unit at a time, so it is not per-packet load balancing, it is splitting contexts between units. Size each unit for the combined load, use asr-group for asymmetric routing, and note that Threat Defense does not support it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Active/standby: two units, one forwards; the default model and the only failover model on Threat Defense.</li>
<li>Active/active: multiple contexts in two failover groups, each group active on a different unit.</li>
<li>Admin context is always in group 1; groups can be set to preempt.</li>
<li>Size active/active so that one unit can carry both groups (about 50 % each).</li>
<li>Clustering: up to 16 units as one logical firewall with a control node and data nodes.</li>
</ul></div>
`,hi:`
<p>Ek toll plaza socho. Sabse simple design mein ek khula booth hota hai aur ek spare booth jismein cashier taiyaar baitha hai: khula booth toote to spare khul jaata hai. Yeh <b>active/standby</b> hai. Zyada busy plaza do booths kholta hai, har direction ke liye ek, aur har cashier ko sikhaya gaya hai ki doosra ghar chala jaaye to dono directions chala sake: yeh <b>active/active</b> hai. Motorway plaza ek bade board ke peeche baarah booths kholta hai aur ek controller cars ko kisi bhi khaali booth par bhejta hai: yeh <b>clustering</b> hai. Cisco Secure Firewall teeno models deta hai; yeh chapter batata hai ki kaunsa kab fit hota hai.</p>

<h3>Model 1: active/standby failover</h3>
<p>Do identical units. Ek <b>Active</b> hota hai aur saara traffic pass karta hai; doosra <b>Standby Ready</b> hota hai aur kuch pass nahi karta. Standby ke paas configuration ki synchronised copy hoti hai aur, stateful failover ke saath, connection state ki bhi. Zyada tar internet edges aur branches yahi model use karte hain, yeh single context aur multiple context dono modes mein chalta hai, aur Secure Firewall Threat Defense (FTD) sirf yahi failover model support karta hai. Is module ke labs mein aap jo bhi configure karte ho woh active/standby hai.</p>
<ul>
<li><b>Pros:</b> simple, predictable, size karna aasaan (standby identical hai, isliye hamesha poora load utha sakta hai), har jagah supported.</li>
<li><b>Cons:</b> aapka khareeda hua aadha hardware zyada tar samay khaali baitha rehta hai.</li>
</ul>

<h3>Model 2: active/active failover (sirf ASA)</h3>
<p>Active/active ka matlab "dono units same traffic forward karte hain" nahi hai. Ise <b>multiple context mode</b> chahiye, jismein ek physical ASA kai virtual firewalls mein bant jaata hai jinhe <b>security contexts</b> kehte hain, har ek ke apne interfaces, policy aur routing table ke saath. Phir aap contexts ko bilkul do <b>failover groups</b> mein rakhte ho:</p>
<ul>
<li><b>Failover group 1</b> normally primary unit par active hota hai. <b>Admin context</b> hamesha group 1 mein hota hai, aur naye contexts default se group 1 join karte hain.</li>
<li><b>Failover group 2</b> normally secondary unit par active hota hai.</li>
</ul>
<p>Isliye har unit kuch contexts ke liye active aur baaki ke liye standby hota hai, aur dono boxes ek saath traffic forward karte hain. Failover <b>per group</b> hota hai: agar secondary fail ho, group 2 primary par chala jaata hai, jo ab har context chalata hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Active/active failover groups">
<rect x="40" y="30" width="240" height="170" rx="10" fill="#e2e8f0"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="14">Primary unit</text>
<rect x="360" y="30" width="240" height="170" rx="10" fill="#e2e8f0"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="14">Secondary unit</text>
<rect x="60" y="70" width="200" height="50" rx="8" fill="#bae6fd"/><text x="160" y="92" text-anchor="middle" class="svg-ink" font-size="13">Group 1: admin, CUST-A</text><text x="160" y="110" text-anchor="middle" class="svg-accent" font-size="12">Active</text>
<rect x="60" y="135" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="160" y="157" text-anchor="middle" class="svg-ink" font-size="13">Group 2: CUST-B</text><text x="160" y="175" text-anchor="middle" class="svg-muted" font-size="12">Standby</text>
<rect x="380" y="70" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="480" y="92" text-anchor="middle" class="svg-ink" font-size="13">Group 1: admin, CUST-A</text><text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="12">Standby</text>
<rect x="380" y="135" width="200" height="50" rx="8" fill="#bae6fd"/><text x="480" y="157" text-anchor="middle" class="svg-ink" font-size="13">Group 2: CUST-B</text><text x="480" y="175" text-anchor="middle" class="svg-accent" font-size="12">Active</text>
<line x1="280" y1="115" x2="360" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">failover link</text>
<text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">Dono units traffic forward karte hain, har ek alag failover group ke liye</text>
</svg><p class="cap">Active/active: failover group 1 primary par active hai, group 2 secondary par. Har context ek group ka hota hai.</p></div>

<p>Configuration <b>system execution space</b> mein rehti hai:</p>
<pre class="code"><span class="c">! multiple context mode wale ASA ka system context</span>
failover group 1
 primary
 preempt
failover group 2
 secondary
 preempt
context CUST-A
 join-failover-group 1
context CUST-B
 join-failover-group 2</pre>
<p><code>preempt</code> keyword par dhyaan do: active/active mein har group ko bola ja sakta hai ki uska preferred unit wapas aaye to woh wahan laut jaaye. Active/standby mein aisi koi command nahi hai, jaisa chapter 10 samjhata hai.</p>

<div class="eg"><p><b>Worked example: 50 % rule.</b> Do ASAs, har ek 10 Gbps rated, active/active chalate hain. CUST-A (group 1) ka peak 6 Gbps aur CUST-B (group 2) ka 5 Gbps hai. Roz ke kaam mein har box apni limit se neeche hai. Lekin jab secondary fail hota hai, primary ko 6 + 5 = 11 Gbps uthana padta hai, jo 10 Gbps se zyada hai, aur users theek usi failure ke samay pareshan hote hain jiske liye aapne HA banaya tha. Asli redundancy ke liye dono groups ka combined load ek unit mein fit hona chahiye, isliye har unit ko apni capacity ke lagbhag 50 % ya usse kam par chalna chahiye.</p></div>

<p>Do aur details jo exams mein aati hain: units ke beech <b>asymmetric routing</b> (reply us unit par aaye jahan context standby hai) interfaces par <code>asr-group</code> se handle hoti hai, jo packet ko us unit par redirect karta hai jiska session hai; aur kyunki ek hi physical interface kai contexts share kar sakte hain, aap har context ko unique MAC addresses dete ho (jaise <code>mac-address auto</code> se).</p>

<h3>Model 3: clustering</h3>
<p>Cluster kai units ko (Firepower 4100/9300 aur Secure Firewall 3100/4200 jaise platforms par software version ke hisaab se 16 tak) ek configuration wale <b>ek logical firewall</b> mein jodta hai. Saare members traffic forward karte hain aur <b>cluster control link</b> (CCL) par connection state share karte hain. Ek member <b>control node</b> hota hai (pehle master kehte the); baaki <b>data nodes</b> (pehle slaves). Clustering ek saath throughput aur redundancy dono deti hai; chapter 11 iske interface modes aur flow roles concept level par cover karta hai.</p>

<table class="cmp"><tr><th></th><th>Active/standby</th><th>Active/active</th><th>Clustering</th></tr>
<tr><td>Units</td><td>2</td><td>2</td><td>2 se 16 tak (platform ke hisaab se)</td></tr>
<tr><td>Kaun forward karta hai</td><td>sirf active unit</td><td>dono, alag contexts ke liye</td><td>saare members</td></tr>
<tr><td>Context mode</td><td>single ya multiple</td><td>sirf multiple</td><td>single ya multiple (ASA)</td></tr>
<tr><td>Threat Defense support</td><td>haan</td><td>nahi</td><td>haan</td></tr>
<tr><td>Preemption</td><td>nahi</td><td>har group ke liye optional</td><td>priority se control node election</td></tr>
<tr><td>Typical use</td><td>internet edge, branch, DMZ</td><td>multi-tenant ASA, service providers</td><td>data centre, high throughput</td></tr></table>

<div class="warn"><p><b>Common galti.</b> "Dono boxes use karne ke liye" active/active chunna aur phir har unit ko 80 % tak load karna. Pehla asli failure bache hue unit ko overload kar deta hai. Agar aap har unit ko aadhe load se neeche nahi rakh sakte, to bade boxes ke saath active/standby ya cluster use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active/active ko multiple context mode chahiye aur yeh do failover groups use karta hai; single context mode mein active/active nahi hai aur Threat Defense par bhi nahi. Yeh bhi yaad rakho: admin context hamesha failover group 1 mein hota hai.</p></div>

<div class="scn"><h4>Hosting provider ki Monday morning</h4><p>Ek hosting provider active/active mein bees customer contexts chalata tha, har group mein das. Do saal mein customer traffic badha aur dono units ka average CPU 70 % ho gaya. Jab secondary ki power supply fail hui, group 2 primary par gaya, CPU 100 % hua aur har customer ko packet loss dikha. Engineer ne <code>show cpu usage</code> aur <code>show traffic</code> history check ki, jisse pata chala ki combined load mahino se ek unit ki capacity se upar tha. Fix tha hardware refresh aur har unit par 45 % CPU par monitoring alarm.</p><p><b>Seekh:</b> active/active tabhi redundant hai jab koi bhi unit akela dono groups utha sake.</p></div>

<div class="iv"><p class="q">"Active/active failover ko kya chahiye, aur yeh load balancing se kaise alag hai?"</p><p>Strong answer: ise multiple context mode aur do failover groups chahiye; group 1 (admin context ke saath) primary par active hota hai, group 2 secondary par. Har context ek samay mein sirf ek unit par active hota hai, isliye yeh per-packet load balancing nahi, balki contexts ko units ke beech baantna hai. Har unit ko combined load ke liye size karo, asymmetric routing ke liye asr-group use karo, aur batao ki Threat Defense ise support nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Active/standby: do units, ek forward karta hai; default model aur Threat Defense par akela failover model.</li>
<li>Active/active: do failover groups mein multiple contexts, har group alag unit par active.</li>
<li>Admin context hamesha group 1 mein; groups ko preempt par set kiya ja sakta hai.</li>
<li>Active/active ko aise size karo ki ek unit dono groups utha sake (har ek lagbhag 50 %).</li>
<li>Clustering: control node aur data nodes ke saath 16 tak units ek logical firewall ki tarah.</li>
</ul></div>
`}};export{e as default};