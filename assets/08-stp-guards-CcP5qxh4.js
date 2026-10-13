var e={id:`stp-guards`,h:{en:`STP takeover attacks: BPDU guard, root guard and root placement`,hi:`STP takeover attacks: BPDU guard, root guard aur root placement`},body:{en:`
<p>Imagine a company where the rule for choosing the chief executive is "whoever shows the lowest employee number". Every decision is routed to the chief. One morning a visitor walks in with a badge printed "Employee number 0". By the rules, he is now in charge, and every decision flows through his desk. <b>Spanning Tree Protocol</b> elects its <b>root bridge</b> by exactly such a rule, and a rogue device that advertises a better number can take over the forwarding topology of the whole VLAN.</p>

<h3>STP recap</h3>
<p>STP prevents Layer 2 loops by electing one <b>root bridge</b> per VLAN (per instance) and blocking redundant paths. The root is the switch with the lowest <b>bridge ID</b>: priority (default 32768 plus the VLAN number) followed by the MAC address. Switches exchange <b>BPDUs</b> (Bridge Protocol Data Units); a BPDU announcing a lower root bridge ID is <b>superior</b> and is adopted. All forwarding paths are then built toward the root.</p>

<h3>The attack at recognition level</h3>
<p>A device on an access port sends BPDUs with priority 0 (or a very low bridge ID). The switches accept it as the new root and recalculate. Consequences:</p>
<ul>
<li>Traffic between distribution and access layers may now flow through the attacker's link, giving a man-in-the-middle position, or through a slow link, degrading everyone.</li>
<li>Every recalculation causes topology changes; each <b>topology change</b> shortens MAC aging, so switches flood more traffic while they relearn.</li>
<li>Repeated forged BPDUs keep the network unstable: a denial of service.</li>
</ul>
<p>Accidents look the same: a user connects a small switch with a low priority, or loops two wall sockets together with a cheap switch.</p>
<p><b>What the defender sees:</b> the root bridge ID changes to an unknown MAC, the topology change counter climbs, and the source port is an access port.</p>
<pre class="out">DSW# show spanning-tree vlan 10 detail | include topology|occurred|from
  Number of topology changes 57 last change occurred 00:00:12 ago
<span class="hl">          from GigabitEthernet0/2</span></pre>

<h3>Step 1: put the root where you want it</h3>
<p>Configure the root deliberately on the core or distribution switch, for example <code>spanning-tree vlan 10,20 root primary</code> or <code>spanning-tree vlan 10,20 priority 4096</code>. A root left to the default election is decided by the oldest MAC address, which is no design at all. Then protect that choice with the guards.</p>

<h3>BPDU guard: for edge ports</h3>
<p>An edge port connects an end host, which never sends BPDUs. With <b>BPDU guard</b>, the first BPDU received err-disables the port. Enable it per port with <code>spanning-tree bpduguard enable</code>, or globally with <code>spanning-tree portfast bpduguard default</code>, which applies it to every port that is operationally in PortFast.</p>
<pre class="out"><span class="hl">%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi0/2 with BPDU Guard enabled. Disabling port.</span>
%PM-4-ERR_DISABLE: bpduguard error detected on Gi0/2, putting Gi0/2 in err-disable state</pre>

<h3>Root guard: for ports toward switches that must never be root</h3>
<p>Some ports must accept BPDUs (they connect other switches) but must never lead to a new root, for example distribution ports facing access switches, or ports toward a customer's or another team's switches. With <b>root guard</b> (<code>spanning-tree guard root</code>), a superior BPDU puts the port into <b>root-inconsistent</b> state for that VLAN: it blocks, but it is not err-disabled. When the superior BPDUs stop, the port recovers automatically.</p>
<pre class="out"><span class="hl">%SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port GigabitEthernet0/23 on VLAN0010.</span>

DSW# show spanning-tree inconsistentports
Name                 Interface              Inconsistency
-------------------- ---------------------- ------------------
<span class="hl">VLAN0010             GigabitEthernet0/23    Root Inconsistent</span>

Number of inconsistent ports (segments) in the system : 1</pre>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Where BPDU guard and root guard go">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">DSW</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="12">intended root</text>
<rect x="450" y="120" width="140" height="50" rx="8" fill="#bae6fd"/><text x="520" y="150" text-anchor="middle" class="svg-ink" font-size="14">ASW</text>
<line x1="390" y1="55" x2="470" y2="120" stroke="#64748b" stroke-width="4"/><text x="480" y="80" class="svg-accent" font-size="12">Gi0/23: root guard</text>
<rect x="60" y="170" width="150" height="50" rx="8" fill="#fed7aa"/><text x="135" y="192" text-anchor="middle" class="svg-ink" font-size="13">ATK / user</text><text x="135" y="209" text-anchor="middle" class="svg-muted" font-size="12">end host</text>
<line x1="280" y1="70" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><text x="60" y="130" class="svg-accent" font-size="12">Gi0/2: PortFast + BPDU guard</text>
</svg><p class="cap">BPDU guard on edge ports (no BPDU expected at all); root guard on switch-facing ports that must never lead to a new root.</p></div>

<h3>Lab 3 walkthrough, parts 2 and 3</h3>
<pre class="code"><span class="c">! task 2 on DSW: edge port and root guard</span>
interface g0/2
 switchport mode access
 switchport nonegotiate
 spanning-tree portfast
 spanning-tree bpduguard enable
 exit
interface g0/23
 spanning-tree guard root
 exit
<span class="c">! production: make DSW the root on purpose</span>
spanning-tree vlan 10,20 root primary</pre>
<p>Now run <code>attack dtp</code>, <code>attack double-tag 20</code> and <code>attack stp-root</code> on ATK. The forged BPDU arrives on Gi0/2, BPDU guard err-disables it, and the root never moves:</p>
<pre class="out">DSW# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/2                        err-disabled bpduguard</span>

DSW# show spanning-tree interface g0/2 portfast
VLAN0010            enable</pre>
<p>Recover the port after removing the offending device with <code>shutdown</code> / <code>no shutdown</code>, or automatically with <code>errdisable recovery cause bpduguard</code>.</p>

<h3>What about BPDU filter and loop guard?</h3>
<p><b>BPDU filter</b> stops a port sending (and, when configured per interface, receiving) BPDUs. Per interface it effectively turns STP off on that port, so a looped cable creates a real loop. It is not a security control; prefer BPDU guard. <b>Loop guard</b> protects against a unidirectional link where BPDUs stop arriving on a blocking port; it is a reliability feature and cannot be combined with root guard on the same port.</p>

<div class="eg"><p><b>Worked example: who wins?</b> DSW has priority 4096 + VLAN 10 = 4106 and MAC 5254.0012.3401. ASW has default 32778. A rogue BPDU claims priority 0 + 10 = 10. Without guards, 10 beats 4106 and the rogue becomes root. On an edge port with BPDU guard the BPDU never gets that far: the port is disabled. On Gi0/23 with root guard, a superior BPDU from ASW's side blocks VLAN 10 on that port instead of accepting the new root.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling root guard on the port that leads <b>toward</b> the real root (for example on an access switch's uplink). The legitimate root's BPDUs are superior by design, so the uplink goes root-inconsistent and the access switch is cut off. Root guard belongs on ports pointing <b>away</b> from the root.</p></div>

<div class="exam"><p><b>Exam trap.</b> BPDU guard reacts to <b>any</b> BPDU with <b>err-disable</b>. Root guard reacts only to a <b>superior</b> BPDU with <b>root-inconsistent</b> (blocking) and recovers by itself. The global <code>spanning-tree portfast bpduguard default</code> applies only to ports operating in PortFast.</p></div>

<div class="scn"><h4>The desk switch that became root</h4><p>An office suffered 30-second outages several times a day. <code>show spanning-tree vlan 10</code> on the distribution switch showed a root bridge with priority 4096 and a MAC nobody recognised; the root port pointed to an access switch, and from there to a desk port. A user had plugged in a spare managed switch from a previous project that still had priority 4096 configured. Every time it rebooted, STP recalculated. Enabling BPDU guard globally for PortFast ports and giving the core an explicit priority of 0 stopped it for good; the desk port went err-disabled the next time the switch was connected, with a clear log.</p><p><b>Lesson:</b> set the root deliberately and guard the edges; otherwise any device with a low priority can reshape your network.</p></div>

<div class="iv"><p class="q">"Where do you use BPDU guard versus root guard?"</p><p>Strong answer: BPDU guard on PortFast edge ports that connect end hosts; any BPDU there is unexpected, so the port is err-disabled. Root guard on designated ports that connect to switches which may send BPDUs but must never become root, such as distribution downlinks; a superior BPDU puts the port in root-inconsistent blocking state and it recovers automatically. Both only make sense once the root bridge is placed deliberately with a low priority. Add that BPDU filter is not a security control.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A forged superior BPDU can make a rogue device the root, causing MITM paths, instability and flooding.</li>
<li>Place the root deliberately (root primary or a low priority) on core or distribution switches.</li>
<li>BPDU guard: edge ports, any BPDU, err-disable (reason bpduguard).</li>
<li>Root guard: switch-facing ports away from the root, superior BPDU, root-inconsistent, automatic recovery.</li>
<li>BPDU filter disables STP protection on a port; loop guard is for unidirectional links.</li>
</ul></div>
`,hi:`
<p>Ek aisi company socho jahan chief executive chunne ka rule hai "jo sabse kam employee number dikhaaye". Har faisla chief tak jaata hai. Ek subah ek visitor "Employee number 0" chhapa badge lekar aata hai. Rules ke hisaab se ab woh boss hai, aur har faisla uski desk se hokar jaata hai. <b>Spanning Tree Protocol</b> apna <b>root bridge</b> bilkul aise hi rule se chunta hai, aur jo rogue device behtar number advertise kare woh poore VLAN ki forwarding topology par kabza kar sakta hai.</p>

<h3>STP recap</h3>
<p>STP har VLAN (har instance) ke liye ek <b>root bridge</b> chunkar aur redundant paths block karke Layer 2 loops rokta hai. Root woh switch hai jiska <b>bridge ID</b> sabse kam ho: priority (default 32768 plus VLAN number) aur uske baad MAC address. Switches <b>BPDUs</b> (Bridge Protocol Data Units) exchange karte hain; jo BPDU kam root bridge ID announce kare woh <b>superior</b> hai aur apna liya jaata hai. Phir saare forwarding paths root ki taraf bante hain.</p>

<h3>Attack recognition level par</h3>
<p>Access port par ek device priority 0 (ya bahut kam bridge ID) wale BPDUs bhejta hai. Switches use naya root maan lete hain aur recalculate karte hain. Nateeje:</p>
<ul>
<li>Distribution aur access layers ke beech ka traffic ab attacker ke link se jaa sakta hai, jisse man-in-the-middle position milti hai, ya slow link se, jisse sab dheeme ho jaate hain.</li>
<li>Har recalculation topology changes laata hai; har <b>topology change</b> MAC aging chhota karta hai, isliye switches dobara seekhte waqt zyada traffic flood karte hain.</li>
<li>Baar baar nakli BPDUs network ko unstable rakhte hain: denial of service.</li>
</ul>
<p>Accidents bhi aise hi dikhte hain: user kam priority wala chhota switch jod deta hai, ya sasti switch se do wall sockets ka loop bana deta hai.</p>
<p><b>Defender ko kya dikhta hai:</b> root bridge ID kisi anjaan MAC mein badal jaata hai, topology change counter badhta hai, aur source port ek access port hai.</p>
<pre class="out">DSW# show spanning-tree vlan 10 detail | include topology|occurred|from
  Number of topology changes 57 last change occurred 00:00:12 ago
<span class="hl">          from GigabitEthernet0/2</span></pre>

<h3>Step 1: root wahan rakho jahan aap chahte ho</h3>
<p>Root ko jaan boojhkar core ya distribution switch par configure karo, jaise <code>spanning-tree vlan 10,20 root primary</code> ya <code>spanning-tree vlan 10,20 priority 4096</code>. Default election par chhoda gaya root sabse purane MAC address se decide hota hai, jo koi design hi nahi hai. Phir us choice ko guards se protect karo.</p>

<h3>BPDU guard: edge ports ke liye</h3>
<p>Edge port end host ko jodta hai, jo kabhi BPDUs nahi bhejta. <b>BPDU guard</b> ke saath, pehla BPDU aate hi port err-disable ho jaata hai. Ise per port <code>spanning-tree bpduguard enable</code> se enable karo, ya globally <code>spanning-tree portfast bpduguard default</code> se, jo har us port par lagta hai jo operationally PortFast mein hai.</p>
<pre class="out"><span class="hl">%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi0/2 with BPDU Guard enabled. Disabling port.</span>
%PM-4-ERR_DISABLE: bpduguard error detected on Gi0/2, putting Gi0/2 in err-disable state</pre>

<h3>Root guard: un switches ki taraf ke ports ke liye jo kabhi root nahi hone chahiye</h3>
<p>Kuch ports ko BPDUs accept karne padte hain (woh doosre switches jodte hain) par unse kabhi naya root nahi banna chahiye, jaise access switches ki taraf ke distribution ports, ya kisi customer ya doosri team ke switches ki taraf ke ports. <b>Root guard</b> (<code>spanning-tree guard root</code>) ke saath, superior BPDU port ko us VLAN ke liye <b>root-inconsistent</b> state mein daal deta hai: woh block hota hai, par err-disabled nahi. Jab superior BPDUs ruk jaate hain, port apne aap recover ho jaata hai.</p>
<pre class="out"><span class="hl">%SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port GigabitEthernet0/23 on VLAN0010.</span>

DSW# show spanning-tree inconsistentports
Name                 Interface              Inconsistency
-------------------- ---------------------- ------------------
<span class="hl">VLAN0010             GigabitEthernet0/23    Root Inconsistent</span>

Number of inconsistent ports (segments) in the system : 1</pre>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="BPDU guard aur root guard kahan lagte hain">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">DSW</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="12">chaha gaya root</text>
<rect x="450" y="120" width="140" height="50" rx="8" fill="#bae6fd"/><text x="520" y="150" text-anchor="middle" class="svg-ink" font-size="14">ASW</text>
<line x1="390" y1="55" x2="470" y2="120" stroke="#64748b" stroke-width="4"/><text x="480" y="80" class="svg-accent" font-size="12">Gi0/23: root guard</text>
<rect x="60" y="170" width="150" height="50" rx="8" fill="#fed7aa"/><text x="135" y="192" text-anchor="middle" class="svg-ink" font-size="13">ATK / user</text><text x="135" y="209" text-anchor="middle" class="svg-muted" font-size="12">end host</text>
<line x1="280" y1="70" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><text x="60" y="130" class="svg-accent" font-size="12">Gi0/2: PortFast + BPDU guard</text>
</svg><p class="cap">Edge ports par BPDU guard (koi BPDU expected hi nahi); switch-facing ports par root guard jinse kabhi naya root nahi banna chahiye.</p></div>

<h3>Lab 3 walkthrough, parts 2 aur 3</h3>
<pre class="code"><span class="c">! DSW par task 2: edge port aur root guard</span>
interface g0/2
 switchport mode access
 switchport nonegotiate
 spanning-tree portfast
 spanning-tree bpduguard enable
 exit
interface g0/23
 spanning-tree guard root
 exit
<span class="c">! production: DSW ko jaan boojhkar root banao</span>
spanning-tree vlan 10,20 root primary</pre>
<p>Ab ATK par <code>attack dtp</code>, <code>attack double-tag 20</code> aur <code>attack stp-root</code> chalao. Nakli BPDU Gi0/2 par aata hai, BPDU guard use err-disable kar deta hai, aur root kabhi nahi hilta:</p>
<pre class="out">DSW# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/2                        err-disabled bpduguard</span>

DSW# show spanning-tree interface g0/2 portfast
VLAN0010            enable</pre>
<p>Offending device hatane ke baad port ko <code>shutdown</code> / <code>no shutdown</code> se recover karo, ya automatically <code>errdisable recovery cause bpduguard</code> se.</p>

<h3>BPDU filter aur loop guard ka kya?</h3>
<p><b>BPDU filter</b> port ko BPDUs bhejne se (aur per interface configure ho to lene se bhi) rokta hai. Per interface yeh us port par STP ko effectively band kar deta hai, isliye loop wala cable asli loop banata hai. Yeh security control nahi hai; BPDU guard prefer karo. <b>Loop guard</b> unidirectional link se bachata hai jahan blocking port par BPDUs aana band ho jaate hain; yeh reliability feature hai aur same port par root guard ke saath combine nahi ho sakta.</p>

<div class="eg"><p><b>Worked example: kaun jeetta hai?</b> DSW ki priority 4096 + VLAN 10 = 4106 aur MAC 5254.0012.3401 hai. ASW ka default 32778 hai. Rogue BPDU priority 0 + 10 = 10 ka daava karta hai. Bina guards ke, 10 4106 ko harata hai aur rogue root ban jaata hai. BPDU guard wale edge port par BPDU wahan tak pahunchta hi nahi: port disable ho jaata hai. Root guard wale Gi0/23 par, ASW ki side se aaya superior BPDU naye root ko accept karne ki jagah us port par VLAN 10 block kar deta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Root guard ko us port par enable karna jo asli root ki <b>taraf</b> jaata hai (jaise access switch ka uplink). Legitimate root ke BPDUs design se superior hote hain, isliye uplink root-inconsistent ho jaata hai aur access switch kat jaata hai. Root guard root se <b>door</b> point karne wale ports par lagta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> BPDU guard <b>kisi bhi</b> BPDU par <b>err-disable</b> se react karta hai. Root guard sirf <b>superior</b> BPDU par <b>root-inconsistent</b> (blocking) se react karta hai aur khud recover hota hai. Global <code>spanning-tree portfast bpduguard default</code> sirf PortFast mein chal rahe ports par lagta hai.</p></div>

<div class="scn"><h4>Desk switch jo root ban gaya</h4><p>Ek office mein din mein kai baar 30-second ke outages hote the. Distribution switch par <code>show spanning-tree vlan 10</code> ne priority 4096 aur ek anjaan MAC wala root bridge dikhaya; root port ek access switch ki taraf tha, aur wahan se ek desk port tak. Ek user ne pichhle project ka spare managed switch lagaya tha jisme abhi bhi priority 4096 configured thi. Har baar jab woh reboot hota, STP recalculate hota. PortFast ports ke liye globally BPDU guard enable karne aur core ko explicit priority 0 dene se yeh hamesha ke liye ruk gaya; agli baar switch connect hone par desk port saaf log ke saath err-disabled ho gaya.</p><p><b>Seekh:</b> root jaan boojhkar set karo aur edges ko guard karo; warna kam priority wala koi bhi device aapka network badal sakta hai.</p></div>

<div class="iv"><p class="q">"BPDU guard aur root guard kahan use karte ho?"</p><p>Strong answer: BPDU guard un PortFast edge ports par jo end hosts jodte hain; wahan koi bhi BPDU unexpected hai, isliye port err-disable hota hai. Root guard un designated ports par jo aise switches jodte hain jo BPDUs bhej sakte hain par kabhi root nahi banne chahiye, jaise distribution downlinks; superior BPDU port ko root-inconsistent blocking state mein daalta hai aur woh apne aap recover hota hai. Dono ka matlab tabhi hai jab root bridge kam priority ke saath jaan boojhkar rakha gaya ho. Jodo ki BPDU filter security control nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nakli superior BPDU rogue device ko root bana sakta hai, jisse MITM paths, instability aur flooding hoti hai.</li>
<li>Root ko core ya distribution switches par jaan boojhkar rakho (root primary ya kam priority).</li>
<li>BPDU guard: edge ports, koi bhi BPDU, err-disable (reason bpduguard).</li>
<li>Root guard: root se door ke switch-facing ports, superior BPDU, root-inconsistent, automatic recovery.</li>
<li>BPDU filter port par STP protection band kar deta hai; loop guard unidirectional links ke liye hai.</li>
</ul></div>
`}};export{e as default};