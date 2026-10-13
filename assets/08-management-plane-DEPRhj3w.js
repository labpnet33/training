var e={id:`management-plane`,h:{en:`Management plane: registration, deployment failures, health alerts and troubleshoot files`,hi:`Management plane: registration, deployment failures, health alerts aur troubleshoot files`},body:{en:`
<p>Every tool so far assumed one thing: the device runs the policy you see in the Management Center. That assumption depends on the <b>management plane</b>, the relationship between head office and the airport. If the device never registered, cannot reach the Management Center, failed its last deployment, or is sick, then no amount of rule editing helps. This chapter covers the four management-plane problems the exam and real life love: registration, deployment, health and troubleshoot files.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Management plane">
<rect x="10" y="60" width="170" height="80" rx="8" fill="#fde68a"/><text x="95" y="92" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="95" y="112" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.50</text>
<rect x="460" y="60" width="170" height="80" rx="8" fill="#bae6fd"/><text x="545" y="92" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD mgmt</text><text x="545" y="112" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.20</text>
<line x1="180" y1="85" x2="460" y2="85" stroke="#64748b" stroke-width="2"/><line x1="180" y1="115" x2="460" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">policy, deploy  →</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">←  events, health</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">sftunnel: TLS over TCP 8305</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Needs: reachability, matching reg key / NAT ID, synced time, compatible versions</text>
</svg><p class="cap">One encrypted tunnel carries policy down and events and health data up. When it breaks, deployments fail and events stop.</p></div>

<h3>1. Registration problems</h3>
<p>Registration is a handshake that needs the same secret on both sides. On the device:</p>
<pre class="code"><span class="c">! Tell the device which manager to trust and the one-time registration key</span>
&gt; configure manager add 192.0.2.50 Nk-RegKey-01
<span class="c">! If the manager cannot reach the device's address (device behind NAT), use DONTRESOLVE + NAT ID</span>
&gt; configure manager add DONTRESOLVE Nk-RegKey-01 NK-NATID-01
&gt; show managers</pre>
<pre class="out">Type                      : Manager
Host                      : 192.0.2.50
Display name              : 192.0.2.50
<span class="hl">Registration              : Pending</span></pre>
<p>Then in the Management Center, Devices → Device Management → Add → Device, with the device address, the same registration key (and NAT ID if used), an access control policy and licenses. "Pending" that never becomes "Completed" usually means one of these:</p>
<ul>
<li><b>Reachability:</b> TCP <b>8305</b> blocked between the management interfaces, a wrong management IP or gateway (<code>show network</code> on the device).</li>
<li><b>Mismatched secret:</b> registration key or NAT ID typed differently on the two sides (they are case-sensitive).</li>
<li><b>Time:</b> clocks far apart break the certificate-based tunnel; use NTP on both.</li>
<li><b>Version:</b> the Management Center must run the same or a newer version than the device.</li>
<li><b>DNS:</b> if you used hostnames, they must resolve.</li>
</ul>
<p><code>sftunnel-status-brief</code> on the device shows whether the tunnel to the peer is up and whether registration completed. If you made a mistake, <code>configure manager delete</code> and add it again.</p>

<h3>2. Deployment failures</h3>
<p>The deployment status of each device appears in Devices → Device Management and in the Deploy menu: <b>Up to date</b> or <b>Out of date</b>. A failed deployment raises a notification in the Message Center. Open <b>Deploy → Deployment History</b>, select the job and open the <b>transcript</b>: it lists the commands pushed to LINA and the exact line that failed. Typical causes:</p>
<ul>
<li>The device is unreachable (management tunnel down) or busy with another task.</li>
<li>Interfaces changed on the device and the Management Center was not synced (Devices → Interfaces → Sync Device).</li>
<li>Configuration that LINA rejects, for example overlapping or conflicting NAT, or objects referencing removed interfaces.</li>
<li>Policy too large for the platform's memory after a big rule or object expansion.</li>
</ul>
<p>Before deploying, <b>Preview</b> (in the advanced deploy view) shows what will change. After a bad deployment, <b>Deployment History</b> offers a <b>rollback</b> to a previous successful version. Remember that some changes restart Snort; the deploy window warns you, and traffic during the restart follows the Snort fail-open settings.</p>

<h3>3. Health monitoring and alerts</h3>
<p>The <b>health policy</b> (System → Health → Policy) decides which health modules run on each device and their thresholds. <b>Health Monitor</b> (System → Health → Monitor) shows each device as normal, warning or critical. Modules worth knowing: CPU and memory usage, <b>Disk Usage</b>, <b>Interface Status</b>, <b>Appliance Heartbeat</b> (the manager stopped hearing from the device), Snort and data-plane statistics, threat data and Security Intelligence updates, time synchronisation, and Smart Licensing. Health alerts can also be sent out as syslog, SNMP traps or email through alert responses.</p>
<div class="eg"><p><b>Worked example.</b> Monday 07:30, Health Monitor shows NK-FTD critical: Appliance Heartbeat missing and Disk Usage 96%. Events from the device stopped at 02:10. The disk filled with unsent events because the management link failed overnight. Fixing the link let the backlog drain; the disk returned to normal and events reappeared, with a gap that you note in the incident report.</p></div>

<h3>4. Troubleshoot files for TAC</h3>
<p>When you need Cisco TAC, they will ask for a <b>troubleshoot file</b>: a bundle of logs, configuration, process and Snort information. Generate it from the Management Center (Health Monitor → select the device → Generate Troubleshooting Files, choosing all data or selected types) and download it from the Message Center tasks, or on the device:</p>
<pre class="code">&gt; system generate-troubleshoot all
<span class="c">! Builds the bundle on the device; it can take several minutes</span></pre>
<p>Send it with the device version (<code>show version</code>), the exact timestamps of the failure, and your captures. Troubleshoot files contain configuration and addresses, so handle and share them according to your organisation's data-handling policy.</p>

<div class="warn"><p><b>Common mistakes.</b> Editing rules for an hour when the device shows "Out of date" or the last deployment failed. Opening only port 443 between manager and device (the tunnel needs TCP 8305). Re-registering a device to fix a deploy error without reading the transcript first. Ignoring disk and heartbeat alerts until events vanish.</p></div>

<div class="exam"><p><b>Exam trap.</b> Registration uses <code>configure manager add</code> with a registration key, plus a NAT ID when either side is behind NAT. The management tunnel (sftunnel) uses TCP 8305. Deployment problems are diagnosed in Deployment History transcripts; rollback is available there. Troubleshoot files come from Health Monitor or <code>system generate-troubleshoot</code>.</p></div>

<div class="scn"><h4>The registration that waited all afternoon</h4><p>A new branch FTD stayed "Pending". The engineer checked <code>show network</code> (correct), pinged the manager (fine), then captured on the branch router: SYNs to TCP 8305 left, nothing came back. A security group in the data centre allowed 443 and 22 from branches but not 8305. Opening TCP 8305 between the two management addresses completed registration in a minute.</p><p><b>Lesson:</b> ping working proves nothing about the management tunnel; check TCP 8305 explicitly.</p></div>

<div class="iv"><p class="q">"An FTD will not register to the Management Center. What do you check?"</p><p>Management IP, mask and gateway (<code>show network</code>); TCP 8305 reachability in both directions; the registration key and NAT ID match exactly; NTP and DNS; version compatibility (manager same or newer); licensing on the manager. Use <code>show managers</code> and <code>sftunnel-status-brief</code> on the device, and if the entry is wrong, delete and re-add it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Registration needs reachability on TCP 8305, a matching key (and NAT ID), synced time and compatible versions.</li>
<li>Deployment failures are explained in the Deployment History transcript; rollback is there too.</li>
<li>Health Monitor alerts (heartbeat, disk, interface, CPU, updates) warn you before users do.</li>
<li>Troubleshoot files come from Health Monitor or <code>system generate-troubleshoot all</code>; handle them as sensitive.</li>
<li>Always confirm "Up to date" before debugging the data plane.</li>
</ul></div>
`,hi:`
<p>Ab tak ke har tool ne ek cheez maan li thi: device wahi policy chala raha hai jo aap Management Center mein dekhte ho. Yeh maanna <b>management plane</b> par depend karta hai, yaani head office aur airport ka rishta. Agar device kabhi register hi nahi hua, Management Center tak nahi pahunch sakta, uska pichla deployment fail hua, ya woh beemar hai, to kitni bhi rule editing kaam nahi aayegi. Yeh chapter woh chaar management-plane problems cover karta hai jo exam aur real life dono ko pasand hain: registration, deployment, health aur troubleshoot files.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Management plane">
<rect x="10" y="60" width="170" height="80" rx="8" fill="#fde68a"/><text x="95" y="92" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="95" y="112" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.50</text>
<rect x="460" y="60" width="170" height="80" rx="8" fill="#bae6fd"/><text x="545" y="92" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD mgmt</text><text x="545" y="112" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.20</text>
<line x1="180" y1="85" x2="460" y2="85" stroke="#64748b" stroke-width="2"/><line x1="180" y1="115" x2="460" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">policy, deploy  →</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">←  events, health</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">sftunnel: TCP 8305 par TLS</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Chahiye: reachability, matching reg key / NAT ID, synced time, compatible versions</text>
</svg><p class="cap">Ek encrypted tunnel policy neeche le jaata hai aur events aur health data upar. Jab yeh tootta hai, deployments fail hote hain aur events ruk jaate hain.</p></div>

<h3>1. Registration problems</h3>
<p>Registration ek handshake hai jise dono taraf same secret chahiye. Device par:</p>
<pre class="code"><span class="c">! Device ko batao kis manager par trust karna hai aur one-time registration key</span>
&gt; configure manager add 192.0.2.50 Nk-RegKey-01
<span class="c">! Agar manager device ke address tak nahi pahunch sakta (device NAT ke peeche), DONTRESOLVE + NAT ID use karo</span>
&gt; configure manager add DONTRESOLVE Nk-RegKey-01 NK-NATID-01
&gt; show managers</pre>
<pre class="out">Type                      : Manager
Host                      : 192.0.2.50
Display name              : 192.0.2.50
<span class="hl">Registration              : Pending</span></pre>
<p>Phir Management Center mein, Devices → Device Management → Add → Device, device address, wahi registration key (aur use hua ho to NAT ID), ek access control policy aur licenses ke saath. "Pending" jo kabhi "Completed" nahi hota, aam taur par inmein se ek hota hai:</p>
<ul>
<li><b>Reachability:</b> management interfaces ke beech TCP <b>8305</b> blocked, galat management IP ya gateway (device par <code>show network</code>).</li>
<li><b>Mismatched secret:</b> registration key ya NAT ID dono taraf alag type hue (yeh case-sensitive hain).</li>
<li><b>Time:</b> clocks mein bada farak certificate-based tunnel tod deta hai; dono par NTP use karo.</li>
<li><b>Version:</b> Management Center device jitna ya usse naya version chalaye.</li>
<li><b>DNS:</b> agar hostnames use kiye, to woh resolve hone chahiye.</li>
</ul>
<p>Device par <code>sftunnel-status-brief</code> dikhata hai ki peer tak tunnel up hai ya nahi aur registration complete hua ya nahi. Galti hui ho to <code>configure manager delete</code> karo aur dobara add karo.</p>

<h3>2. Deployment failures</h3>
<p>Har device ka deployment status Devices → Device Management aur Deploy menu mein dikhta hai: <b>Up to date</b> ya <b>Out of date</b>. Failed deployment Message Center mein notification uthata hai. <b>Deploy → Deployment History</b> kholo, job select karo aur <b>transcript</b> kholo: yeh LINA ko push hue commands aur exactly woh line list karta hai jo fail hui. Typical causes:</p>
<ul>
<li>Device unreachable hai (management tunnel down) ya doosre task mein busy hai.</li>
<li>Device par interfaces badle aur Management Center sync nahi hua (Devices → Interfaces → Sync Device).</li>
<li>Aisi configuration jise LINA reject karta hai, jaise overlapping ya conflicting NAT, ya hataye gaye interfaces ko refer karte objects.</li>
<li>Bade rule ya object expansion ke baad policy platform ki memory ke liye bahut badi.</li>
</ul>
<p>Deploy karne se pehle <b>Preview</b> (advanced deploy view mein) dikhata hai kya badlega. Kharaab deployment ke baad <b>Deployment History</b> pichle successful version par <b>rollback</b> deta hai. Yaad rakho kuch changes Snort restart karte hain; deploy window aapko warn karti hai, aur restart ke dauraan traffic Snort fail-open settings follow karta hai.</p>

<h3>3. Health monitoring aur alerts</h3>
<p><b>Health policy</b> (System → Health → Policy) decide karti hai ki har device par kaunse health modules chalein aur unke thresholds kya hon. <b>Health Monitor</b> (System → Health → Monitor) har device ko normal, warning ya critical dikhata hai. Jaanne layak modules: CPU aur memory usage, <b>Disk Usage</b>, <b>Interface Status</b>, <b>Appliance Heartbeat</b> (manager ko device ki aawaaz aani band ho gayi), Snort aur data-plane statistics, threat data aur Security Intelligence updates, time synchronisation, aur Smart Licensing. Health alerts alert responses ke through syslog, SNMP traps ya email ke roop mein bhi bheje ja sakte hain.</p>
<div class="eg"><p><b>Worked example.</b> Monday 07:30, Health Monitor NK-FTD ko critical dikhata hai: Appliance Heartbeat missing aur Disk Usage 96%. Device se events 02:10 par ruk gaye the. Raat mein management link fail hone se disk unsent events se bhar gayi. Link theek karne se backlog nikal gaya; disk normal hui aur events wapas aaye, ek gap ke saath jise aap incident report mein note karte ho.</p></div>

<h3>4. TAC ke liye troubleshoot files</h3>
<p>Jab aapko Cisco TAC chahiye, woh <b>troubleshoot file</b> maangenge: logs, configuration, process aur Snort information ka bundle. Ise Management Center se generate karo (Health Monitor → device select karo → Generate Troubleshooting Files, saara data ya selected types chunkar) aur Message Center tasks se download karo, ya device par:</p>
<pre class="code">&gt; system generate-troubleshoot all
<span class="c">! Device par bundle banata hai; kuch minute lag sakte hain</span></pre>
<p>Ise device version (<code>show version</code>), failure ke exact timestamps aur apne captures ke saath bhejo. Troubleshoot files mein configuration aur addresses hote hain, isliye unhe apni organisation ki data-handling policy ke hisaab se handle aur share karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Ghante bhar rules edit karna jabki device "Out of date" dikha raha hai ya pichla deployment fail hua. Manager aur device ke beech sirf port 443 kholna (tunnel ko TCP 8305 chahiye). Transcript padhe bina deploy error theek karne ke liye device ko re-register karna. Disk aur heartbeat alerts ko tab tak ignore karna jab tak events gayab na ho jaayein.</p></div>

<div class="exam"><p><b>Exam trap.</b> Registration registration key ke saath <code>configure manager add</code> use karta hai, plus NAT ID jab koi bhi side NAT ke peeche ho. Management tunnel (sftunnel) TCP 8305 use karta hai. Deployment problems Deployment History transcripts mein diagnose hoti hain; rollback wahin available hai. Troubleshoot files Health Monitor ya <code>system generate-troubleshoot</code> se aati hain.</p></div>

<div class="scn"><h4>Woh registration jo poori dopahar intezaar karta raha</h4><p>Ek nayi branch ka FTD "Pending" par atka raha. Engineer ne <code>show network</code> check kiya (sahi), manager ko ping kiya (theek), phir branch router par capture kiya: TCP 8305 ke SYN nikle, wapas kuch nahi aaya. Data centre ke ek security group ne branches se 443 aur 22 allow kiye the par 8305 nahi. Dono management addresses ke beech TCP 8305 kholne se ek minute mein registration complete ho gaya.</p><p><b>Seekh:</b> ping chalna management tunnel ke baare mein kuch prove nahi karta; TCP 8305 explicitly check karo.</p></div>

<div class="iv"><p class="q">"Ek FTD Management Center mein register nahi ho raha. Aap kya check karoge?"</p><p>Management IP, mask aur gateway (<code>show network</code>); dono direction mein TCP 8305 reachability; registration key aur NAT ID exactly match karein; NTP aur DNS; version compatibility (manager same ya naya); manager par licensing. Device par <code>show managers</code> aur <code>sftunnel-status-brief</code> use karo, aur entry galat ho to delete karke dobara add karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Registration ko TCP 8305 par reachability, matching key (aur NAT ID), synced time aur compatible versions chahiye.</li>
<li>Deployment failures Deployment History transcript mein samjhaaye jaate hain; rollback bhi wahin hai.</li>
<li>Health Monitor alerts (heartbeat, disk, interface, CPU, updates) users se pehle aapko warn karte hain.</li>
<li>Troubleshoot files Health Monitor ya <code>system generate-troubleshoot all</code> se aati hain; unhe sensitive maankar handle karo.</li>
<li>Data plane debug karne se pehle hamesha "Up to date" confirm karo.</li>
</ul></div>
`}};export{e as default};