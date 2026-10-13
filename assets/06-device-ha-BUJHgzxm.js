var e={id:`device-ha`,h:{en:`Device-level high availability: SSO, NSF, NSR, graceful restart and StackWise`,hi:`Device-level high availability: SSO, NSF, NSR, graceful restart aur StackWise`},body:{en:`
<p>A plane has two pilots. If the captain falls ill, the first officer is already in the cockpit, already knows the altitude, speed and route, and simply takes the controls. The engines never stop. Air-traffic control keeps talking to the same flight number. Network devices have exactly this idea inside one chassis: a second <b>supervisor</b> (the pilot) that knows the full state, <b>hardware</b> that keeps forwarding (the engines), and <b>neighbours</b> that are told not to panic (air-traffic control). This chapter covers the tools that make a single box, or a pair acting as one box, survive its own failures.</p>

<h3>Layers of redundancy</h3>
<p>So far you have protected against <b>link</b> failures (EtherChannel, dual uplinks), <b>gateway</b> failures (HSRP, VRRP, GLBP) and <b>path</b> failures (OSPF ECMP). Device-level HA protects against failures <b>inside</b> a device: a supervisor engine crash, a software fault, a stack member dying. It matters most where a single box is a single point of failure, such as a modular core chassis or an access switch with users attached.</p>

<h3>Supervisor redundancy modes: RPR, RPR+ and SSO</h3>
<p>A modular switch (for example a Catalyst 9400 or 9600) can hold two supervisors: one <b>active</b>, one <b>standby</b>. How ready the standby is depends on the redundancy mode:</p>
<table class="cmp"><tr><th>Mode</th><th>Standby state</th><th>Switchover impact</th></tr>
<tr><td>RPR</td><td>Partially booted, not synchronised</td><td>Line cards reset; minutes of outage</td></tr>
<tr><td>RPR+</td><td>Fully booted, configuration synchronised</td><td>Links stay up but state is rebuilt; tens of seconds</td></tr>
<tr><td><b>SSO</b></td><td>Fully booted, configuration <b>and state</b> synchronised (STANDBY HOT)</td><td>Layer 2 state and links kept; typically around a second or less</td></tr>
</table>
<p><b>SSO (stateful switchover)</b> continuously copies the running configuration and protocol state (interface state, MAC tables, STP, LACP, and more) to the standby. On failure the standby takes over with no link flaps and no spanning-tree reconvergence.</p>
<pre class="code">redundancy
 mode sso</pre>
<pre class="out">CORE1# show redundancy states
<span class="hl">       my state = 13 -ACTIVE</span>
<span class="hl">     peer state = 8  -STANDBY HOT</span>
           Mode = Duplex
Redundancy Mode (Operational) = sso
Redundancy Mode (Configured)  = sso</pre>

<h3>NSF: keep forwarding while routing restarts</h3>
<p>SSO synchronises Layer 2 state, but routing protocol adjacencies traditionally restart on the new supervisor. <b>NSF (non-stop forwarding)</b> lets the hardware keep forwarding packets using the <b>last known FIB</b> while the new active supervisor rebuilds its routing table. To stop neighbours from tearing down adjacencies and rerouting around the switch, the routing protocol uses <b>graceful restart (GR)</b>: the restarting router signals that it is restarting, and <b>NSF-aware (helper)</b> neighbours keep its routes and adjacency for a grace period while databases resynchronise.</p>
<ul>
<li><b>NSF-capable</b>: the device that can restart gracefully (dual supervisors with SSO).</li>
<li><b>NSF-aware / helper</b>: a neighbour that understands graceful restart and keeps forwarding towards the restarting device. Most modern IOS XE devices are NSF-aware by default.</li>
</ul>
<pre class="code">router ospf 1
 nsf                        <span class="c">! Cisco NSF; "nsf ietf" for the RFC version</span>
router bgp 65001
 bgp graceful-restart</pre>

<h3>NSR: neighbours never notice</h3>
<p><b>NSR (non-stop routing)</b> goes one step further. The standby supervisor keeps a live copy of the routing protocol state itself: adjacencies, databases, BGP sessions and TCP state. After a switchover the new active continues the conversation as if nothing happened, so <b>no helper is needed</b> and neighbours never see a restart. NSR is useful when neighbours are not NSF-aware or belong to another organisation, such as a service provider.</p>
<pre class="code">router ospf 1
 nsr</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Switchover timeline with SSO, NSF and GR">
<line x1="30" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="40" width="130" height="40" rx="6" fill="#fed7aa"/><text x="95" y="65" text-anchor="middle" class="svg-ink" font-size="12">Active sup fails</text>
<rect x="175" y="40" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="240" y="65" text-anchor="middle" class="svg-ink" font-size="12">SSO: standby active</text>
<rect x="320" y="40" width="140" height="40" rx="6" fill="#bae6fd"/><text x="390" y="65" text-anchor="middle" class="svg-ink" font-size="12">GR: helpers wait</text>
<rect x="475" y="40" width="135" height="40" rx="6" fill="#ddd6fe"/><text x="542" y="65" text-anchor="middle" class="svg-ink" font-size="12">Routes resynced</text>
<rect x="175" y="125" width="435" height="36" rx="6" fill="#fde68a"/><text x="392" y="148" text-anchor="middle" class="svg-ink" font-size="12">NSF: hardware keeps forwarding with the last FIB</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">With NSR, the GR step is not needed: state is already on the standby</text>
</svg><p class="cap">SSO keeps Layer 2 state, NSF keeps packets moving, graceful restart keeps neighbours from rerouting.</p></div>

<h3>StackWise: many switches, one brain</h3>
<p><b>StackWise</b> (for example StackWise-480 on Catalyst 9300) joins up to eight access switches with stack cables into one logical switch with one management IP and one configuration. One member is <b>active</b>, one is <b>standby</b> (SSO between them), the rest are members. You can build a <b>cross-stack EtherChannel</b> with uplinks on different members, so losing a member does not isolate the stack. The member with the highest stack priority (1 to 15) becomes active.</p>
<pre class="out">ACC-STACK# show switch
Switch#   Role    Mac Address     Priority Version  State
-------------------------------------------------------------
<span class="hl">*1       Active   00aa.bb00.1100     15     V01     Ready</span>
<span class="hl"> 2       Standby  00aa.bb00.2200     14     V01     Ready</span>
 3       Member   00aa.bb00.3300     1      V01     Ready</pre>

<h3>StackWise Virtual: two chassis, one logical switch</h3>
<p><b>StackWise Virtual (SVL)</b> joins two distribution or core switches (Catalyst 9400, 9500 or 9600) over a <b>StackWise Virtual link</b> of one or more Ethernet ports. The pair has one control plane (active plus hot standby with SSO) and two data planes, both forwarding. Access switches connect with a <b>multichassis EtherChannel</b>, so no STP blocking and no FHRP are needed. A separate <b>dual-active detection (DAD)</b> link prevents both switches from becoming active if the SVL fails.</p>
<pre class="code">stackwise-virtual
 domain 10
interface range TenGigabitEthernet1/0/47 - 48
 stackwise-virtual link 1
interface TenGigabitEthernet1/0/46
 stackwise-virtual dual-active-detection
<span class="c">! save and reload both switches to form the pair; verify with show stackwise-virtual</span></pre>

<div class="eg"><p><b>Worked example.</b> A core chassis handles 40 Gbps. Without SSO, a supervisor crash takes about three minutes to recover: 40 Gbps x 180 s of dropped traffic and every OSPF neighbour reroutes twice. With SSO and NSF, Layer 2 state survives, the ASICs keep forwarding with the last FIB, and NSF-aware neighbours keep their routes; the users see at most a sub-second blip. Add ISSU (in-service software upgrade, which relies on SSO) and even planned upgrades avoid an outage window.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Buying dual supervisors but leaving the mode at RPR, or running different software versions that force a lower mode. Combining NSF with very aggressive hello timers or BFD, so neighbours declare the router dead before graceful restart can begin. Forgetting the DAD link on StackWise Virtual.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>SSO</b> keeps state on the standby; <b>NSF</b> keeps forwarding during the switchover and needs <b>graceful restart</b> with NSF-aware helpers; <b>NSR</b> keeps routing state on the standby so no helper is needed. HSRP/VRRP protect the gateway between two boxes; SSO protects inside one box.</p></div>

<div class="scn"><h4>The switchover that still dropped routes</h4><p>A bank enabled SSO and NSF on its new core chassis and tested a supervisor failover in a change window. Layer 2 stayed up, but the two old WAN routers dropped their OSPF adjacencies and rerouted all branch traffic for about 40 seconds. <code>show ip ospf neighbor</code> history and the logs showed the WAN routers ran old software that was not NSF-aware, so they ignored the grace signal. The team upgraded the WAN routers to NSF-aware software and enabled NSR on the core for the BGP sessions with the service provider, whose routers they did not control. The next test showed no routing change at all.</p><p><b>Lesson:</b> NSF works only when neighbours help; NSR works even when they cannot.</p></div>

<div class="iv"><p class="q">"Explain the difference between SSO, NSF and NSR."</p><p>SSO synchronises configuration and state to a hot standby supervisor so a switchover keeps links and Layer 2 state. NSF lets the data plane keep forwarding with the last FIB during that switchover, and uses graceful restart so NSF-aware neighbours keep adjacencies and routes while the new active rebuilds. NSR keeps the routing protocol state itself on the standby, so neighbours do not need to help and never see a restart. Add StackWise and StackWise Virtual as the switch-level equivalents that use SSO between members.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSO: standby supervisor is STANDBY HOT with synchronised config and state; configure with redundancy / mode sso.</li>
<li>NSF: forwarding continues on the last FIB; needs graceful restart and NSF-aware helper neighbours.</li>
<li>NSR: routing state lives on the standby too; no helper required.</li>
<li>StackWise joins up to eight access switches into one; StackWise Virtual joins two chassis with SVL and DAD.</li>
<li>With StackWise Virtual and MEC, access uplinks do not block and no FHRP is needed.</li>
</ul></div>
`,hi:`
<p>Plane mein do pilots hote hain. Agar captain beemar pad jaaye, to first officer pehle se cockpit mein hai, altitude, speed aur route pehle se jaanta hai, aur bas controls sambhaal leta hai. Engines kabhi nahi rukte. Air-traffic control same flight number se baat karta rehta hai. Network devices mein ek chassis ke andar bilkul yahi idea hai: doosra <b>supervisor</b> (pilot) jo poora state jaanta hai, <b>hardware</b> jo forward karta rehta hai (engines), aur <b>neighbours</b> jinhe ghabrane se mana kiya jaata hai (air-traffic control). Yeh chapter woh tools cover karta hai jo ek box, ya ek box ki tarah kaam karne wale pair, ko apne hi failures jhelne dete hain.</p>

<h3>Redundancy ki layers</h3>
<p>Ab tak aapne <b>link</b> failures (EtherChannel, dual uplinks), <b>gateway</b> failures (HSRP, VRRP, GLBP) aur <b>path</b> failures (OSPF ECMP) se bachaav kiya hai. Device-level HA device ke <b>andar</b> ke failures se bachata hai: supervisor engine crash, software fault, stack member ka marna. Yeh sabse zyada wahan matter karta hai jahan ek box single point of failure hai, jaise modular core chassis ya users wala access switch.</p>

<h3>Supervisor redundancy modes: RPR, RPR+ aur SSO</h3>
<p>Modular switch (jaise Catalyst 9400 ya 9600) mein do supervisors ho sakte hain: ek <b>active</b>, ek <b>standby</b>. Standby kitna ready hai yeh redundancy mode par depend karta hai:</p>
<table class="cmp"><tr><th>Mode</th><th>Standby state</th><th>Switchover ka asar</th></tr>
<tr><td>RPR</td><td>Aadha booted, synchronised nahi</td><td>Line cards reset; minutes ka outage</td></tr>
<tr><td>RPR+</td><td>Poora booted, configuration synchronised</td><td>Links up rehte hain lekin state dobara banta hai; das-bees seconds</td></tr>
<tr><td><b>SSO</b></td><td>Poora booted, configuration <b>aur state</b> synchronised (STANDBY HOT)</td><td>Layer 2 state aur links bane rehte hain; aam taur par lagbhag ek second ya kam</td></tr>
</table>
<p><b>SSO (stateful switchover)</b> lagataar running configuration aur protocol state (interface state, MAC tables, STP, LACP, aur bhi) standby ko copy karta hai. Failure par standby bina link flaps aur bina spanning-tree reconvergence ke takeover karta hai.</p>
<pre class="code">redundancy
 mode sso</pre>
<pre class="out">CORE1# show redundancy states
<span class="hl">       my state = 13 -ACTIVE</span>
<span class="hl">     peer state = 8  -STANDBY HOT</span>
           Mode = Duplex
Redundancy Mode (Operational) = sso
Redundancy Mode (Configured)  = sso</pre>

<h3>NSF: routing restart ke dauraan forward karte raho</h3>
<p>SSO Layer 2 state synchronise karta hai, lekin routing protocol adjacencies traditionally naye supervisor par restart hoti hain. <b>NSF (non-stop forwarding)</b> hardware ko <b>last known FIB</b> se packets forward karte rehne deta hai jab tak naya active supervisor apni routing table dobara banata hai. Neighbours adjacencies tod kar switch ke around reroute na karein, iske liye routing protocol <b>graceful restart (GR)</b> use karta hai: restart hone wala router signal karta hai ki woh restart ho raha hai, aur <b>NSF-aware (helper)</b> neighbours grace period tak uske routes aur adjacency rakhte hain jab tak databases resync hote hain.</p>
<ul>
<li><b>NSF-capable</b>: woh device jo gracefully restart kar sakta hai (SSO ke saath dual supervisors).</li>
<li><b>NSF-aware / helper</b>: woh neighbour jo graceful restart samajhta hai aur restart hote device ki taraf forward karta rehta hai. Zyada tar modern IOS XE devices default mein NSF-aware hote hain.</li>
</ul>
<pre class="code">router ospf 1
 nsf                        <span class="c">! Cisco NSF; RFC version ke liye "nsf ietf"</span>
router bgp 65001
 bgp graceful-restart</pre>

<h3>NSR: neighbours ko kabhi pata nahi chalta</h3>
<p><b>NSR (non-stop routing)</b> ek kadam aage jaata hai. Standby supervisor khud routing protocol state ki live copy rakhta hai: adjacencies, databases, BGP sessions aur TCP state. Switchover ke baad naya active baatcheet aise jaari rakhta hai jaise kuch hua hi nahi, isliye <b>helper ki zaroorat nahi</b> aur neighbours ko restart kabhi nahi dikhta. NSR tab kaam aata hai jab neighbours NSF-aware nahi hain ya kisi aur organisation ke hain, jaise service provider.</p>
<pre class="code">router ospf 1
 nsr</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SSO, NSF aur GR ke saath switchover timeline">
<line x1="30" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="40" width="130" height="40" rx="6" fill="#fed7aa"/><text x="95" y="65" text-anchor="middle" class="svg-ink" font-size="12">Active sup fail</text>
<rect x="175" y="40" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="240" y="65" text-anchor="middle" class="svg-ink" font-size="12">SSO: standby active</text>
<rect x="320" y="40" width="140" height="40" rx="6" fill="#bae6fd"/><text x="390" y="65" text-anchor="middle" class="svg-ink" font-size="12">GR: helpers rukte</text>
<rect x="475" y="40" width="135" height="40" rx="6" fill="#ddd6fe"/><text x="542" y="65" text-anchor="middle" class="svg-ink" font-size="12">Routes resync</text>
<rect x="175" y="125" width="435" height="36" rx="6" fill="#fde68a"/><text x="392" y="148" text-anchor="middle" class="svg-ink" font-size="12">NSF: hardware last FIB se forward karta rehta hai</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">NSR ke saath GR step ki zaroorat nahi: state pehle se standby par hai</text>
</svg><p class="cap">SSO Layer 2 state rakhta hai, NSF packets chalate rakhta hai, graceful restart neighbours ko reroute karne se rokta hai.</p></div>

<h3>StackWise: kai switches, ek dimaag</h3>
<p><b>StackWise</b> (jaise Catalyst 9300 par StackWise-480) aath tak access switches ko stack cables se ek logical switch mein jodta hai, ek management IP aur ek configuration ke saath. Ek member <b>active</b>, ek <b>standby</b> (unke beech SSO), baaki members. Aap alag members par uplinks ke saath <b>cross-stack EtherChannel</b> bana sakte ho, taaki ek member khone se stack isolate na ho. Sabse zyada stack priority (1 se 15) wala member active banta hai.</p>
<pre class="out">ACC-STACK# show switch
Switch#   Role    Mac Address     Priority Version  State
-------------------------------------------------------------
<span class="hl">*1       Active   00aa.bb00.1100     15     V01     Ready</span>
<span class="hl"> 2       Standby  00aa.bb00.2200     14     V01     Ready</span>
 3       Member   00aa.bb00.3300     1      V01     Ready</pre>

<h3>StackWise Virtual: do chassis, ek logical switch</h3>
<p><b>StackWise Virtual (SVL)</b> do distribution ya core switches (Catalyst 9400, 9500 ya 9600) ko ek ya zyada Ethernet ports ke <b>StackWise Virtual link</b> par jodta hai. Pair ka ek control plane hota hai (active plus SSO ke saath hot standby) aur do data planes, dono forward karte hain. Access switches <b>multichassis EtherChannel</b> se judte hain, isliye na STP blocking, na FHRP ki zaroorat. Alag <b>dual-active detection (DAD)</b> link SVL fail hone par dono switches ko active banne se rokta hai.</p>
<pre class="code">stackwise-virtual
 domain 10
interface range TenGigabitEthernet1/0/47 - 48
 stackwise-virtual link 1
interface TenGigabitEthernet1/0/46
 stackwise-virtual dual-active-detection
<span class="c">! pair banane ke liye save karke dono switches reload karo; show stackwise-virtual se verify karo</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek core chassis 40 Gbps handle karta hai. SSO ke bina supervisor crash recover hone mein lagbhag teen minute lagte hain: 40 Gbps x 180 s dropped traffic aur har OSPF neighbour do baar reroute karta hai. SSO aur NSF ke saath Layer 2 state bacha rehta hai, ASICs last FIB se forward karte rehte hain, aur NSF-aware neighbours apne routes rakhte hain; users ko zyada se zyada sub-second blip dikhta hai. ISSU (in-service software upgrade, jo SSO par depend karta hai) jodo to planned upgrades bhi outage window ke bina ho jaate hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Dual supervisors khareedna lekin mode RPR par chhod dena, ya alag software versions chalana jo kam mode force karte hain. NSF ko bahut aggressive hello timers ya BFD ke saath milana, jisse graceful restart shuru hone se pehle neighbours router ko dead declare kar dete hain. StackWise Virtual par DAD link bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>SSO</b> standby par state rakhta hai; <b>NSF</b> switchover ke dauraan forwarding chalu rakhta hai aur use NSF-aware helpers ke saath <b>graceful restart</b> chahiye; <b>NSR</b> routing state standby par rakhta hai isliye helper nahi chahiye. HSRP/VRRP do boxes ke beech gateway protect karte hain; SSO ek box ke andar protect karta hai.</p></div>

<div class="scn"><h4>Woh switchover jisne phir bhi routes giraye</h4><p>Ek bank ne apne naye core chassis par SSO aur NSF enable kiya aur change window mein supervisor failover test kiya. Layer 2 up raha, lekin do purane WAN routers ne apni OSPF adjacencies gira di aur saara branch traffic lagbhag 40 seconds tak reroute kiya. <code>show ip ospf neighbor</code> history aur logs ne dikhaya ki WAN routers purana software chala rahe the jo NSF-aware nahi tha, isliye unhone grace signal ignore kiya. Team ne WAN routers ko NSF-aware software par upgrade kiya aur service provider ke saath BGP sessions ke liye core par NSR enable kiya, jinke routers unke control mein nahi the. Agle test mein koi routing change nahi hua.</p><p><b>Seekh:</b> NSF tabhi kaam karta hai jab neighbours madad karein; NSR tab bhi kaam karta hai jab woh na kar sakein.</p></div>

<div class="iv"><p class="q">"SSO, NSF aur NSR mein fark samjhao."</p><p>SSO configuration aur state ko hot standby supervisor par synchronise karta hai taaki switchover mein links aur Layer 2 state bane rahein. NSF us switchover ke dauraan data plane ko last FIB se forward karte rehne deta hai, aur graceful restart use karta hai taaki NSF-aware neighbours adjacencies aur routes rakhein jab tak naya active rebuild karta hai. NSR routing protocol state ko hi standby par rakhta hai, isliye neighbours ko madad nahi karni padti aur unhe restart kabhi nahi dikhta. StackWise aur StackWise Virtual ko switch-level equivalents ki tarah jodo jo members ke beech SSO use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSO: standby supervisor synchronised config aur state ke saath STANDBY HOT; redundancy / mode sso se configure.</li>
<li>NSF: last FIB par forwarding chalti rehti hai; graceful restart aur NSF-aware helper neighbours chahiye.</li>
<li>NSR: routing state bhi standby par rehta hai; helper ki zaroorat nahi.</li>
<li>StackWise aath tak access switches ko ek banata hai; StackWise Virtual SVL aur DAD ke saath do chassis jodta hai.</li>
<li>StackWise Virtual aur MEC ke saath access uplinks block nahi hote aur FHRP ki zaroorat nahi.</li>
</ul></div>
`}};export{e as default};