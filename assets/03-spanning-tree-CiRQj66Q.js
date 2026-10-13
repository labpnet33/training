var e={id:`spanning-tree`,h:{en:`Spanning tree: loops, RSTP, the root bridge and BPDU guard`,hi:`Spanning tree: loops, RSTP, root bridge aur BPDU guard`},body:{en:`
<h3>Why a loop is dangerous</h3>
<p>Imagine a roundabout with no road rules where every car that enters keeps circling and a new copy of it is made at every exit. That is a <b>switching loop</b>. Ethernet frames have no hop count (no TTL). If two switches are joined by two cables, a broadcast frame leaves switch A on cable 1, arrives at switch B, is flooded back on cable 2 to A, flooded again, and so on forever. The copies multiply and fill every link, which is called a <b>broadcast storm</b>. The CPU of every switch climbs, MAC tables flap and the whole site stops. A loop can be made by a single careless cable: someone plugs a patch lead between two wall sockets.</p>
<p>Yet you <i>want</i> redundant cables, because one cable can fail. <b>Spanning tree protocol (STP)</b> gives you both: it keeps the redundant links, but <b>blocks</b> some of them so that the active topology is a loop-free tree. If an active link fails, a blocked one is unblocked.</p>

<h3>RSTP in plain words</h3>
<p>Classic STP takes tens of seconds to react. <b>RSTP</b> (rapid spanning tree) does the same job in about a second or two, and it is what modern switches run. The switches talk by sending small control frames called <b>BPDUs</b> (bridge protocol data units). From these they elect a leader and decide each port's role.</p>
<ol>
<li><b>Elect a root bridge.</b> The switch with the <b>lowest bridge priority</b> becomes the root. If priorities tie, the lowest MAC address wins. Priority is a number set in steps (4096 is common), where <b>lower is better</b>. The allowed values and the default come from the vendor documentation.</li>
<li><b>Choose the best path to the root</b> on every other switch; that port is the <b>root port</b>.</li>
<li><b>Block</b> any extra path that would form a loop.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Root bridge and a blocked redundant link">
<rect x="250" y="15" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">SW-MUM (core)</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">priority 4096: ROOT</text>
<rect x="40" y="165" width="150" height="56" rx="8" fill="#bae6fd"/><text x="115" y="188" text-anchor="middle" class="svg-ink" font-size="13">Access switch A</text><text x="115" y="206" text-anchor="middle" class="svg-muted" font-size="12">priority 32768</text>
<rect x="450" y="165" width="150" height="56" rx="8" fill="#bae6fd"/><text x="525" y="188" text-anchor="middle" class="svg-ink" font-size="13">Access switch B</text><text x="525" y="206" text-anchor="middle" class="svg-muted" font-size="12">priority 32768</text>
<line x1="280" y1="71" x2="140" y2="165" stroke="#16a34a" stroke-width="3"/><line x1="360" y1="71" x2="500" y2="165" stroke="#16a34a" stroke-width="3"/>
<line x1="190" y1="195" x2="450" y2="195" stroke="#ef4444" stroke-width="3" stroke-dasharray="6 5"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="12">blocked: would form a loop</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Illustration: access switches A and B are examples; our sites each have one switch</text>
</svg><p class="cap">Green links forward, the red dashed link is blocked until a green link fails.</p></div>

<h3>Designing the root at the core</h3>
<p>By default every switch has the same priority, so the root is chosen by lowest MAC address, which can be a cheap old switch in a cupboard. That is a bad root: every path then leads through it. The design rule is: <b>set the priority yourself so the root is the core</b>. In Bharat Retail Co the core is SW-MUM, so give it the lowest priority; all other switches keep a higher number. Then traffic flows toward the core, which is also where the servers and routed interfaces live. The <b>Switch ACL and STP</b> page lists the switches with their priority and role.</p>
<pre class="out">Switch ACL and STP  (network: Mumbai HQ)
Protocol : RSTP
Switch    Priority   Role
SW-MUM    <span class="hl">4096</span>       <span class="hl">root</span>

Alerts and events
10:02  event  Atul changed SW-MUM bridge priority 32768 to 4096</pre>
<p>If a switch other than the intended core becomes root, the dashboard raises an <b>STP root change</b> alert. Treat it as a design violation: find which switch took over and why, usually a newly added switch with a lower priority or a lost core.</p>

<h3>BPDU guard and err-disabled ports</h3>
<p>Access ports face users, and users must never take part in spanning tree. If someone plugs a small switch or a looped patch lead into an access port, BPDUs arrive where none should. <b>BPDU guard</b> is protection for such ports: if the port receives a BPDU, the switch <b>err-disables</b> the port (error-disabled: shut down automatically) so a rogue device cannot change the topology or cause a loop. Put it on every access port, never on trunk uplinks.</p>
<pre class="out">Switch ports  (SW-BLR)
Port  Name     Type    VLAN  BPDU guard  Status
3     PC-BLR   access  10    on          <span class="hl">err-disabled</span>

Alerts and events
14:21  alert  SW-BLR port 3 err-disabled: BPDU received on a BPDU guard port</pre>
<p>To recover: first <b>remove the cause</b> (unplug the rogue switch), then re-enable the port. Whether the port can recover automatically after a timer is product-specific; check the vendor documentation. If you re-enable before removing the device, the port goes straight back to err-disabled.</p>

<div class="eg"><p><b>Worked example.</b> A store manager at Bengaluru plugs a 5-port desktop switch into the wall socket by the PC (SW-BLR port 3). The small switch sends BPDUs. BPDU guard shuts port 3 within a second. PC-BLR loses its link, the alert fires, and the tech finds the device, removes it and re-enables the port. The rest of Bengaluru never noticed.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Bridge priority changes which switch is elected root and thereby the tree and the blocked links. BPDU guard changes what the port does when a BPDU arrives: it shuts down instead of joining the tree. No VLANs or addresses change.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Leaving every switch at the default so a random switch wins; BPDU guard on a trunk uplink (it would err-disable the link to the next switch); re-enabling a port without removing the cause; thinking STP is needed only when there are loops (it protects you when a loop happens by mistake).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which switch is root?" The lowest priority; on a tie, the lowest MAC address. "Lower is better."</p></div>

<div class="scn"><h4>The storm in the storeroom</h4><p>A contractor tidied a wall plate and linked two sockets together with a short lead. At a site without BPDU guard, the network collapsed: all PCs timed out. After the lead was found and removed, the team enabled BPDU guard on all access ports and set the core priority. A later repeat of the same mistake err-disabled one port and was fixed in minutes.</p><p><b>Lesson:</b> assume cables will be misplugged; build the protection in advance.</p></div>

<div class="iv"><p class="q">"How does spanning tree choose the root, and how would you design it?"</p><p>Strong answer: the lowest bridge priority wins, MAC address breaks ties. I would set the core, SW-MUM, to a low priority, leave others higher, enable RSTP, and turn on BPDU guard on access ports so a user plugging a switch is err-disabled rather than changing the topology.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loops cause broadcast storms because Ethernet frames have no TTL.</li>
<li>STP and RSTP keep redundant links but block the ones that would loop; RSTP is fast.</li>
<li>Lowest bridge priority is root; set it on the core on purpose.</li>
<li>BPDU guard err-disables an access port that receives a BPDU.</li>
<li>Remove the cause before re-enabling an err-disabled port.</li>
</ul></div>
`,hi:`
<h3>Loop khatarnak kyun hai</h3>
<p>Ek roundabout socho jahan koi road rules nahi, har car jo andar aati hai chakkar lagati rehti hai aur har exit par uski nayi copy ban jaati hai. Yahi <b>switching loop</b> hai. Ethernet frames mein hop count (TTL) nahi hota. Agar do switches do cables se jude hain, to broadcast frame switch A se cable 1 par nikalta hai, switch B tak pahunchta hai, cable 2 par wapas A ko flood hota hai, phir flood hota hai, hamesha. Copies badhti jaati hain aur har link bhar deti hain, ise <b>broadcast storm</b> kehte hain. Har switch ka CPU chadhta hai, MAC tables flap karti hain aur poori site ruk jaati hai. Ek laparwah cable se loop ban sakta hai: koi do wall sockets ke beech patch lead laga de.</p>
<p>Phir bhi aap redundant cables <i>chahte</i> ho, kyunki ek cable fail ho sakta hai. <b>Spanning tree protocol (STP)</b> dono deta hai: redundant links rakhta hai, lekin kuch ko <b>block</b> kar deta hai taaki active topology loop-free tree rahe. Agar koi active link fail ho to blocked link unblock ho jaata hai.</p>

<h3>RSTP seedhe shabdon mein</h3>
<p>Classic STP react karne mein kai second leta hai. <b>RSTP</b> (rapid spanning tree) wahi kaam ek-do second mein karta hai, aur modern switches yahi chalate hain. Switches chhote control frames bhejte hain jinhe <b>BPDUs</b> (bridge protocol data units) kehte hain. Unse woh leader chunte hain aur har port ka role tay karte hain.</p>
<ol>
<li><b>Root bridge elect karo.</b> Jis switch ki <b>bridge priority sabse kam</b> hai woh root banta hai. Tie ho to sabse kam MAC address jeetta hai. Priority steps mein set hone wala number hai (4096 common hai), jahan <b>kam behtar hai</b>. Allowed values aur default vendor documentation se aate hain.</li>
<li>Har doosre switch par root tak <b>sabse achha path</b> chuno; woh port <b>root port</b> hai.</li>
<li>Jo bhi extra path loop banayega use <b>block</b> karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Root bridge aur blocked redundant link">
<rect x="250" y="15" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">SW-MUM (core)</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">priority 4096: ROOT</text>
<rect x="40" y="165" width="150" height="56" rx="8" fill="#bae6fd"/><text x="115" y="188" text-anchor="middle" class="svg-ink" font-size="13">Access switch A</text><text x="115" y="206" text-anchor="middle" class="svg-muted" font-size="12">priority 32768</text>
<rect x="450" y="165" width="150" height="56" rx="8" fill="#bae6fd"/><text x="525" y="188" text-anchor="middle" class="svg-ink" font-size="13">Access switch B</text><text x="525" y="206" text-anchor="middle" class="svg-muted" font-size="12">priority 32768</text>
<line x1="280" y1="71" x2="140" y2="165" stroke="#16a34a" stroke-width="3"/><line x1="360" y1="71" x2="500" y2="165" stroke="#16a34a" stroke-width="3"/>
<line x1="190" y1="195" x2="450" y2="195" stroke="#ef4444" stroke-width="3" stroke-dasharray="6 5"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="12">blocked: loop banata</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Illustration: access switches A aur B examples hain; humari sites mein ek-ek switch hai</text>
</svg><p class="cap">Green links forward karte hain, red dashed link tab tak blocked hai jab tak green link fail na ho.</p></div>

<h3>Root ko core par design karna</h3>
<p>Default mein har switch ki priority same hoti hai, isliye root sabse kam MAC address se chuna jaata hai, jo almari mein pada purana sasta switch bhi ho sakta hai. Woh bura root hai: har path uske through jaata hai. Design rule: <b>priority khud set karo taaki root core ho</b>. Bharat Retail Co mein core SW-MUM hai, to use sabse kam priority do; baaki switches ka number zyada rahe. Phir traffic core ki taraf bahta hai, jahan servers aur routed interfaces bhi hain. <b>Switch ACL and STP</b> page switches ko unki priority aur role ke saath list karta hai.</p>
<pre class="out">Switch ACL and STP  (network: Mumbai HQ)
Protocol : RSTP
Switch    Priority   Role
SW-MUM    <span class="hl">4096</span>       <span class="hl">root</span>

Alerts and events
10:02  event  Atul changed SW-MUM bridge priority 32768 to 4096</pre>
<p>Agar intended core ke alawa koi switch root ban jaye, to dashboard <b>STP root change</b> alert deta hai. Ise design violation maano: dhoondho kaunsa switch le gaya aur kyun, aksar naya switch jiski priority kam ho ya core ka chala jaana.</p>

<h3>BPDU guard aur err-disabled ports</h3>
<p>Access ports users ki taraf hote hain, aur users ko spanning tree mein kabhi hissa nahi lena chahiye. Agar koi chhota switch ya looped patch lead access port mein laga de, to BPDUs wahan aate hain jahan nahi aane chahiye. <b>BPDU guard</b> aise ports ki suraksha hai: agar port ko BPDU mile, to switch port ko <b>err-disable</b> kar deta hai (error-disabled: automatically shut) taaki rogue device topology na badal sake ya loop na bana sake. Har access port par lagao, trunk uplinks par kabhi nahi.</p>
<pre class="out">Switch ports  (SW-BLR)
Port  Name     Type    VLAN  BPDU guard  Status
3     PC-BLR   access  10    on          <span class="hl">err-disabled</span>

Alerts and events
14:21  alert  SW-BLR port 3 err-disabled: BPDU received on a BPDU guard port</pre>
<p>Recover karne ke liye: pehle <b>cause hatao</b> (rogue switch nikalo), phir port re-enable karo. Port timer ke baad automatically recover ho sakta hai ya nahi, yeh product-specific hai; vendor documentation dekho. Agar device hataye bina re-enable karoge to port seedha dobara err-disabled ho jaayega.</p>

<div class="eg"><p><b>Worked example.</b> Bengaluru mein store manager PC ke paas wall socket (SW-BLR port 3) mein 5-port desktop switch laga deta hai. Chhota switch BPDUs bhejta hai. BPDU guard ek second ke andar port 3 band kar deta hai. PC-BLR ka link chala jaata hai, alert fire hota hai, aur tech device dhoondh kar hatata hai aur port re-enable karta hai. Bengaluru ke baaki hisse ko pata bhi nahi chala.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Bridge priority badalti hai ki kaunsa switch root elect hota hai aur isse tree aur blocked links. BPDU guard badalta hai ki BPDU aane par port kya karta hai: tree mein shamil hone ki jagah shut ho jaata hai. VLANs ya addresses nahi badalte.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Har switch default par chhodna taaki koi bhi random switch jeet jaye; trunk uplink par BPDU guard (woh agle switch ka link err-disable kar dega); cause hataye bina port re-enable karna; yeh sochna ki STP sirf tab chahiye jab loops hon (galti se loop ban jaye to yeh aapko bachata hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Root kaunsa switch hai?" Sabse kam priority; tie par sabse kam MAC address. "Kam behtar hai."</p></div>

<div class="scn"><h4>Storeroom ka storm</h4><p>Ek contractor ne wall plate tidy kiya aur do sockets ko chhote lead se jod diya. BPDU guard ke bina site par network collapse ho gaya: saare PCs time out. Lead mil kar hatane ke baad team ne saare access ports par BPDU guard enable kiya aur core priority set ki. Baad mein wahi galti dohrayi gayi to ek port err-disabled hua aur minutes mein fix ho gaya.</p><p><b>Seekh:</b> maan lo cables galat lagenge; protection pehle se banao.</p></div>

<div class="iv"><p class="q">"Spanning tree root kaise chunta hai, aur aap design kaise karoge?"</p><p>Strong answer: sabse kam bridge priority jeetti hai, tie MAC address se tootta hai. Main core SW-MUM ko kam priority dunga, baaki ko zyada, RSTP rakhunga, aur access ports par BPDU guard on karunga taaki user ka switch lagana topology badalne ki jagah err-disabled ho jaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet frames mein TTL nahi, isliye loops broadcast storm banate hain.</li>
<li>STP aur RSTP redundant links rakhte hain lekin loop banane wale block karte hain; RSTP fast hai.</li>
<li>Sabse kam bridge priority root hai; core par jaanbujhkar set karo.</li>
<li>BPDU guard BPDU receive karne wale access port ko err-disable karta hai.</li>
<li>Err-disabled port re-enable karne se pehle cause hatao.</li>
</ul></div>
`}};export{e as default};