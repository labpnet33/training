var e={id:`config-session-sync`,h:{en:`Configuration sync and session pickup: what is copied and what is not`,hi:`Configuration sync aur session pickup: kya copy hota hai aur kya nahi`},body:{en:`
<p>The secondary is only useful if it is ready to take over with the same rules as the primary. FGCP keeps it ready with two kinds of synchronisation: <b>configuration sync</b>, which is always on, and <b>session sync</b> (also called session pickup), which you enable. Knowing exactly what is and is not copied is a favourite exam area and a favourite source of surprises in production.</p>

<h3>Configuration synchronisation</h3>
<p>The primary is the source of truth. When you change anything on it, through the GUI or CLI, the change is sent to the secondary over the heartbeat links. You do not repeat the change on the secondary, and you should not make changes on the secondary directly because they would be overwritten. The cluster also runs a periodic <b>configuration checksum</b> comparison. If the checksums differ, the cluster reports that the units are out of sync and tries to resynchronise.</p>
<p>A few settings are deliberately <b>not synchronised</b>, because each unit needs its own value:</p>
<ul>
<li>The <b>host name</b> of each unit (so you can tell them apart in logs and the prompt).</li>
<li>The <b>HA device priority</b> and the reserved management interface settings.</li>
<li>Per-unit hardware details such as the licence of a virtual machine and its serial number.</li>
</ul>
<p>Everything else, including interfaces, policies, objects, routes, VPN settings, certificates and admin accounts, is synchronised. Because the sync is immediate, a mistake made on the primary reaches the secondary within seconds. That is why <b>configuration backups</b> and change control still matter in a cluster.</p>

<h3>Session synchronisation (session pickup)</h3>
<p>Without session sync, failover keeps the network working but the secondary has an empty session table. Every existing TCP connection arrives at a firewall that has never seen it and is dropped. Users see downloads fail and applications reconnect. With <code>session-pickup enable</code>, the primary copies its session table to the secondary, so after failover the secondary already knows the connections and traffic continues.</p>
<ul>
<li><code>session-pickup</code> enables the feature for TCP sessions.</li>
<li><code>session-pickup-connectionless</code> also syncs UDP and ICMP.</li>
<li><code>session-pickup-expectation</code> syncs expectation sessions used by protocols such as FTP and SIP helpers.</li>
<li><code>session-pickup-nat</code> syncs NAT sessions.</li>
<li><code>session-pickup-delay</code> waits (about thirty seconds) before syncing a new TCP session, so very short sessions do not flood the heartbeat link.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="What is synchronised">
<rect x="20" y="30" width="170" height="110" rx="10" fill="#bbf7d0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="13">Primary</text><text x="105" y="85" text-anchor="middle" class="svg-muted" font-size="12">configuration</text><text x="105" y="105" text-anchor="middle" class="svg-muted" font-size="12">session table</text>
<rect x="450" y="30" width="170" height="110" rx="10" fill="#fde68a"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">Secondary</text><text x="535" y="85" text-anchor="middle" class="svg-muted" font-size="12">configuration copy</text><text x="535" y="105" text-anchor="middle" class="svg-muted" font-size="12">session copy</text>
<line x1="190" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">config sync (always)</text>
<line x1="190" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">session sync (optional)</text>
</svg><p class="cap">Config sync is always on; session sync is a setting.</p></div>

<h3>What is not carried across a failover</h3>
<p>Session sync is powerful but not complete. Things to remember:</p>
<ul>
<li>Sessions handled by <b>proxy-based inspection</b> (for example proxy-mode antivirus, web filtering or SSL deep inspection that terminates the session) are not synchronised. Flow-based sessions are, but inspection state such as a half-scanned file is not.</li>
<li><b>SSL VPN sessions</b> are not synchronised: remote users must log in again after a failover.</li>
<li><b>IPsec</b> is handled better: the IKE and IPsec security associations are synchronised, so site-to-site tunnels normally keep running. Check the behaviour for your version and design.</li>
<li>Some session types and short-lived traffic may be dropped around the failover moment regardless.</li>
</ul>
<p>Session pickup also costs something: heartbeat bandwidth and some CPU. On a very busy firewall, test the load before enabling it everywhere.</p>

<h3>Checking synchronisation</h3>
<p>In the CLI, <code>diagnose sys ha checksum cluster</code> shows the configuration checksums of every unit; they must match. <code>diagnose sys ha checksum show</code> shows the checksums per configuration object, which helps find the part that differs. <code>get system ha status</code> reports whether the configuration is in sync. If a secondary stays out of sync, the first checks are heartbeat health, firmware versions and matching HA settings; the troubleshooting chapter gives the full workflow.</p>

<div class="eg"><p><b>Worked example.</b> HQ enables <code>session-pickup</code> and <code>session-pickup-connectionless</code>. A staff member is on a long video call (UDP) and a file transfer (TCP). The primary loses power. The secondary becomes primary, already holding both sessions, and the call glitches for a moment but continues. A remote user connected over SSL VPN is disconnected and has to sign in again, because those sessions are not synchronised.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Making a change on the secondary and being surprised when it disappears. Assuming session pickup protects everything, including SSL VPN and proxy-based inspection. Enabling session pickup for NAT and connectionless traffic on a link with too little heartbeat bandwidth.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which of these is not synchronised?" Typical answers: host name, HA priority, proxy-based inspection sessions and SSL VPN sessions. The configuration itself is always synchronised from the primary.</p></div>

<div class="scn"><h4>The change that vanished</h4><p>An engineer logged in to the secondary by mistake and added a policy. Ten minutes later the policy was gone. The primary's configuration had overwritten it. The engineer re-added the policy on the primary through the proper session, and it appeared on both units. The team added the reserved management addresses to the runbook with a note that real changes are always made on the primary.</p><p><b>Lesson:</b> the primary is the source of truth for configuration.</p></div>

<div class="iv"><p class="q">"What is synchronised in an FGCP cluster, and what is not?"</p><p>The whole configuration is synchronised from the primary, except per-unit items such as host name and HA priority. The session table is synchronised only when session pickup is enabled, and proxy-based inspection sessions and SSL VPN sessions are not carried over. I verify with the checksum commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configuration sync is automatic and one-way, primary to secondary.</li>
<li>Host name and HA priority are not synchronised.</li>
<li>Session pickup is optional and has sub-options for UDP/ICMP, NAT and expectation sessions.</li>
<li>Proxy-based inspection state and SSL VPN sessions do not survive a failover.</li>
<li>Use the checksum commands to prove the units are in sync.</li>
</ul></div>
`,hi:`
<p>Secondary tabhi kaam ka hai jab woh primary ke same rules ke saath takeover ke liye ready ho. FGCP use ready rakhta hai do tarah ki synchronisation se: <b>configuration sync</b>, jo hamesha on rehta hai, aur <b>session sync</b> (session pickup bhi kehte hain), jo aap enable karte ho. Exactly kya copy hota hai aur kya nahi, yeh exam ka favourite area hai aur production mein surprises ka favourite source bhi.</p>

<h3>Configuration synchronisation</h3>
<p>Primary source of truth hai. Aap uspar kuch bhi badlo, GUI ya CLI se, change heartbeat links par secondary ko bhej diya jaata hai. Aap change secondary par dobara nahi karte, aur secondary par seedhe change nahi karna chahiye kyunki woh overwrite ho jaayega. Cluster periodic <b>configuration checksum</b> comparison bhi chalata hai. Checksums alag hon to cluster report karta hai ki units out of sync hain aur dobara synchronise karne ki koshish karta hai.</p>
<p>Kuch settings jaan-boojhkar <b>synchronise nahi</b> hoti, kyunki har unit ko apni value chahiye:</p>
<ul>
<li>Har unit ka <b>host name</b> (taaki logs aur prompt mein dono ko alag pehchaan sako).</li>
<li><b>HA device priority</b> aur reserved management interface settings.</li>
<li>Per-unit hardware details jaise virtual machine ka licence aur uska serial number.</li>
</ul>
<p>Baaki sab, jisme interfaces, policies, objects, routes, VPN settings, certificates aur admin accounts shamil hain, synchronise hota hai. Sync turant hota hai, isliye primary par hui galti kuch seconds mein secondary tak pahunch jaati hai. Isi wajah se cluster mein bhi <b>configuration backups</b> aur change control zaroori hain.</p>

<h3>Session synchronisation (session pickup)</h3>
<p>Session sync ke bina failover network ko chalta rakhta hai lekin secondary ki session table khaali hoti hai. Har existing TCP connection aise firewall tak pahunchta hai jisne use kabhi dekha hi nahi, aur drop ho jaata hai. Users ke downloads fail hote hain aur applications reconnect karti hain. <code>session-pickup enable</code> ke saath primary apni session table secondary ko copy karta hai, isliye failover ke baad secondary connections pehle se jaanta hai aur traffic chalta rehta hai.</p>
<ul>
<li><code>session-pickup</code> TCP sessions ke liye feature enable karta hai.</li>
<li><code>session-pickup-connectionless</code> UDP aur ICMP bhi sync karta hai.</li>
<li><code>session-pickup-expectation</code> FTP aur SIP helpers jaise protocols ke expectation sessions sync karta hai.</li>
<li><code>session-pickup-nat</code> NAT sessions sync karta hai.</li>
<li><code>session-pickup-delay</code> nayi TCP session sync karne se pehle (lagbhag tees second) intezaar karta hai, taaki bahut chhote sessions heartbeat link ko flood na karein.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Kya synchronise hota hai">
<rect x="20" y="30" width="170" height="110" rx="10" fill="#bbf7d0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="13">Primary</text><text x="105" y="85" text-anchor="middle" class="svg-muted" font-size="12">configuration</text><text x="105" y="105" text-anchor="middle" class="svg-muted" font-size="12">session table</text>
<rect x="450" y="30" width="170" height="110" rx="10" fill="#fde68a"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="13">Secondary</text><text x="535" y="85" text-anchor="middle" class="svg-muted" font-size="12">configuration copy</text><text x="535" y="105" text-anchor="middle" class="svg-muted" font-size="12">session copy</text>
<line x1="190" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">config sync (hamesha)</text>
<line x1="190" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">session sync (optional)</text>
</svg><p class="cap">Config sync hamesha on hai; session sync ek setting hai.</p></div>

<h3>Failover mein kya carry nahi hota</h3>
<p>Session sync powerful hai lekin poora nahi. Yaad rakhne wali baatein:</p>
<ul>
<li><b>Proxy-based inspection</b> se handle hue sessions (jaise proxy-mode antivirus, web filtering ya SSL deep inspection jo session terminate karta hai) synchronise nahi hote. Flow-based sessions hote hain, lekin inspection state, jaise aadhi scan hui file, nahi.</li>
<li><b>SSL VPN sessions</b> synchronise nahi hote: failover ke baad remote users ko dobara login karna padta hai.</li>
<li><b>IPsec</b> behtar handle hota hai: IKE aur IPsec security associations synchronise hote hain, isliye site-to-site tunnels aam taur par chalte rehte hain. Apne version aur design ke liye behaviour check karo.</li>
<li>Kuch session types aur short-lived traffic failover ke moment ke aas-paas drop ho sakta hai.</li>
</ul>
<p>Session pickup ki kuch keemat bhi hai: heartbeat bandwidth aur thoda CPU. Bahut busy firewall par har jagah enable karne se pehle load test karo.</p>

<h3>Synchronisation check karna</h3>
<p>CLI mein <code>diagnose sys ha checksum cluster</code> har unit ke configuration checksums dikhata hai; woh match hone chahiye. <code>diagnose sys ha checksum show</code> configuration object ke hisaab se checksums dikhata hai, jisse woh hissa dhoondhna aasaan hota hai jo alag hai. <code>get system ha status</code> batata hai ki configuration in sync hai ya nahi. Secondary out of sync rahe to pehle checks heartbeat health, firmware versions aur matching HA settings hain; troubleshooting chapter poora workflow deta hai.</p>

<div class="eg"><p><b>Worked example.</b> HQ <code>session-pickup</code> aur <code>session-pickup-connectionless</code> enable karta hai. Ek staff member lambi video call (UDP) aur file transfer (TCP) par hai. Primary ki power chali jaati hai. Secondary primary ban jaata hai, dono sessions pehle se uske paas hain, aur call ek pal ke liye glitch karti hai lekin chalti rehti hai. SSL VPN se connected remote user disconnect ho jaata hai aur use dobara sign in karna padta hai, kyunki woh sessions synchronise nahi hote.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Secondary par change karna aur uske gayab hone par hairan hona. Maan lena ki session pickup sab kuch bacha leta hai, SSL VPN aur proxy-based inspection bhi. Kam heartbeat bandwidth wale link par NAT aur connectionless traffic ke liye session pickup enable karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Inme se kaunsa synchronise nahi hota?" Typical answers: host name, HA priority, proxy-based inspection sessions aur SSL VPN sessions. Configuration khud hamesha primary se synchronise hoti hai.</p></div>

<div class="scn"><h4>Woh change jo gayab ho gaya</h4><p>Ek engineer galti se secondary par login hua aur ek policy add ki. Das minute baad policy gayab thi. Primary ki configuration ne use overwrite kar diya tha. Engineer ne policy sahi session se primary par dobara add ki, aur woh dono units par dikhi. Team ne runbook mein reserved management addresses ke saath yeh note jodaa ki asli changes hamesha primary par hote hain.</p><p><b>Lesson:</b> configuration ke liye primary source of truth hai.</p></div>

<div class="iv"><p class="q">"FGCP cluster mein kya synchronise hota hai aur kya nahi?"</p><p>Poori configuration primary se synchronise hoti hai, sirf per-unit items jaise host name aur HA priority ko chhodkar. Session table tabhi synchronise hoti hai jab session pickup enabled ho, aur proxy-based inspection sessions aur SSL VPN sessions carry nahi hote. Main checksum commands se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configuration sync automatic aur one-way hai, primary se secondary.</li>
<li>Host name aur HA priority synchronise nahi hote.</li>
<li>Session pickup optional hai aur uske UDP/ICMP, NAT aur expectation sessions ke sub-options hain.</li>
<li>Proxy-based inspection state aur SSL VPN sessions failover mein bach nahi paate.</li>
<li>Units in sync hain yeh prove karne ke liye checksum commands use karo.</li>
</ul></div>
`}};export{e as default};