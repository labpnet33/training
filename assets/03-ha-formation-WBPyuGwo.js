var e={id:`ha-formation`,h:{en:`Forming the cluster: identity, heartbeat and status`,hi:`Cluster banana: identity, heartbeat aur status`},body:{en:`
<p>Forming an FGCP cluster is like two people meeting in a crowded station. They must know the same <b>meeting code</b>, they must be able to shout to each other, and then they compare notes to decide who leads. In FortiOS the meeting code is the group settings, the shouting is the <b>heartbeat</b>, and the notes are the election you will study in chapter 5. This chapter prepares lab <b>n7-ha-build</b>, tasks 1 and 2.</p>

<h3>The identity: group-id, group-name, password</h3>
<p>Units join the same cluster only if <code>mode</code>, <code>group-id</code>, <code>group-name</code> and <code>password</code> are the same (and so are the encryption and authentication settings of the heartbeat). A mismatch does not produce an error message on the wire; the units simply ignore each other and each becomes its own primary. This is <b>split brain</b>, covered in chapter 4.</p>
<ul>
<li><b>group-id</b> (0-255) is also part of the <b>virtual MAC</b>. Two clusters on the same broadcast domain need different group-ids.</li>
<li><b>group-name</b> labels the cluster and shows in every status output.</li>
<li><b>password</b> authenticates cluster members to each other.</li>
</ul>

<h3>The heartbeat devices</h3>
<p><code>hbdev</code> lists the interfaces used for the heartbeat, each with a priority. FortiOS uses the interface with the <b>highest priority</b> that is up for cluster traffic and keeps the others as a spare. In the lab: <code>set hbdev "port3" 100 "port4" 50</code>. port3 carries the heartbeat as long as it is up, and port4 takes over if port3 fails. Heartbeat packets use their own Ethernet types and do not need an IP address on the interface.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Cluster identity and heartbeat">
<rect x="30" y="40" width="190" height="120" rx="10" fill="#bae6fd"/><text x="125" y="64" text-anchor="middle" class="svg-ink" font-size="14">FGT-A</text>
<text x="125" y="86" text-anchor="middle" class="svg-muted" font-size="12">group-id 20</text><text x="125" y="104" text-anchor="middle" class="svg-muted" font-size="12">NILGIRI-HA, a-p</text><text x="125" y="122" text-anchor="middle" class="svg-muted" font-size="12">priority 200</text><text x="125" y="142" text-anchor="middle" class="svg-muted" font-size="12">hbdev port3 100, port4 50</text>
<rect x="420" y="40" width="190" height="120" rx="10" fill="#ddd6fe"/><text x="515" y="64" text-anchor="middle" class="svg-ink" font-size="14">FGT-B</text>
<text x="515" y="86" text-anchor="middle" class="svg-muted" font-size="12">group-id 20</text><text x="515" y="104" text-anchor="middle" class="svg-muted" font-size="12">NILGIRI-HA, a-p</text><text x="515" y="122" text-anchor="middle" class="svg-muted" font-size="12">priority 100</text><text x="515" y="142" text-anchor="middle" class="svg-muted" font-size="12">hbdev port3 100, port4 50</text>
<line x1="220" y1="85" x2="420" y2="85" stroke="#64748b" stroke-width="5"/><text x="320" y="78" text-anchor="middle" class="svg-accent" font-size="12">port3 (in use)</text>
<line x1="220" y1="125" x2="420" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">port4 (spare)</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Everything except host name, priority and serial must match</text>
</svg><p class="cap">Two units become one cluster when identity matches and a heartbeat link carries their hellos.</p></div>

<h3>Building it in the lab</h3>
<p>FGT-A is a live box with traffic, so you configure HA there first. Then FGT-B, a factory-reset unit with only a host name, is configured with the same group data and the lower priority. When it joins, it overwrites its own configuration with the primary's, so policy 1 <code>LAN-to-WAN</code> appears on FGT-B without typing it.</p>
<pre class="code"><span class="c">! FGT-A (priority 200)</span>
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set password Nilgiri-HA-2026
    set hbdev "port3" 100 "port4" 50
    set priority 200
    set monitor "port1" "port2"
end

<span class="c">! FGT-B (factory unit, same identity, lower priority)</span>
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set password Nilgiri-HA-2026
    set hbdev "port3" 100 "port4" 50
    set priority 100
end</pre>
<div class="warn"><p><b>Common mistake.</b> Joining a factory unit while its host name is still the default. Set the host name first, because it is not synchronised and you need it to tell the units apart in the CLI prompt.</p></div>

<h3>Virtual MAC and gratuitous ARP</h3>
<p>The cluster presents one network identity. The primary answers on every non-heartbeat data interface with a <b>virtual MAC</b> shaped <code>00:09:0f:09:&lt;group-id in hex&gt;:&lt;index&gt;</code>. For group-id 20, hex <code>14</code>, so the addresses look like <code>00:09:0f:09:14:00</code> on port1 and <code>00:09:0f:09:14:01</code> on port2. The secondary keeps its hardware MAC. At a failover the new primary takes over the virtual MAC and sends <b>gratuitous ARP</b> packets, so the switches learn the new port at once and hosts keep using the same gateway MAC. This is why PC-LAN keeps its ARP entry for 10.10.1.1 across a failover.</p>
<div class="eg"><p><b>Worked example.</b> A second cluster is added to the same WAN VLAN and by mistake also uses group-id 20. Both primaries claim <code>00:09:0f:09:14:00</code>. The switch flaps the MAC between two ports and traffic is intermittent. A different group-id fixes it.</p></div>

<h3>Reading <code>get system ha status</code></h3>
<pre class="out">FGT-A # get system ha status
<span class="hl">HA Health Status: OK</span>
Model: FortiGate-VM64
<span class="hl">Mode: HA A-P</span>
Group Name: NILGIRI-HA
Group ID: 20
Cluster Uptime: 0 days 1:00:36
Primary selected using:
    &lt;2026/10/04 21:13:00&gt; vcluster-1: FGVMEV1NU41WS000 is selected as the primary because its priority is larger than peer member FGVMEV1OO2UZP000.
override: disable
Configuration Status:
    FGVMEV1NU41WS000(updated 1 seconds ago): in-sync
    FGVMEV1OO2UZP000(updated 2 seconds ago): in-sync
<span class="hl">Primary     : FGT-A           , FGVMEV1NU41WS000, HA cluster index = 0</span>
<span class="hl">Secondary   : FGT-B           , FGVMEV1OO2UZP000, HA cluster index = 1</span>
number of vcluster: 1</pre>
<ul>
<li><b>HA Health Status</b>: <code>OK</code>, or a <code>WARNING</code> text. A lone unit says <code>WARNING: only one member is present, the heartbeat finds no peer</code>.</li>
<li><b>Mode, Group Name, Group ID</b>: confirm the identity you typed.</li>
<li><b>Primary selected using</b>: the election history; the newest line is on top.</li>
<li><b>Configuration Status</b>: <code>in-sync</code> per serial. Anything else needs chapter 8.</li>
<li><b>Primary / Secondary</b>: host names and serials. The primary has index 0.</li>
</ul>
<p>Also use <code>get system status</code> to map serial to host name: <code>Current HA mode: a-p, primary</code>. The lab asks you to prove the join with <code>diagnose sys ha checksum cluster</code>: the line <code>is_manage_primary()=1</code> belongs to the primary.</p>
<div class="note"><p>Honest scope: the simulator shows the cluster state at once. Real units need a few seconds to join, and the output has more fields (for example the real <code>hb-interval</code> timers).</p></div>

<div class="exam"><p><b>Exam trap.</b> A higher number is not always better: in <code>hbdev</code> the higher priority is the preferred heartbeat port, but the interface you give the highest weight may not be the one you want on a busy switch. And the secondary does not use the virtual MAC.</p></div>

<div class="scn"><h4>Two clusters, one VLAN</h4><p>After a branch rollout, users in two sites sharing a stretched VLAN had random gateway timeouts. Both FortiGate pairs were built from the same template with group-id 20. The switch kept moving the virtual MAC between two primaries. The engineer compared <code>get system ha status</code> on all four units, saw the same group ID, and changed one pair to group-id 21 in a window. The timeouts vanished.</p><p><b>Lesson:</b> group-id is part of the MAC address; it must be unique per broadcast domain.</p></div>

<div class="iv"><p class="q">"Two FortiGates will not form a cluster. What do you check first?"</p><p>Check mode, group-id, group-name and password on both units, then the heartbeat link: cable, interface listed in <code>hbdev</code>, and link state. Mention that a mismatch gives two primaries, not an error, and that you confirm with <code>get system ha status</code> on each unit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cluster identity = mode, group-id, group-name, password (plus heartbeat encryption and authentication).</li>
<li><code>hbdev</code> priorities choose the active heartbeat port; the rest are spares.</li>
<li>The primary uses virtual MAC 00:09:0f:09:&lt;group-id hex&gt;:&lt;index&gt; and sends gratuitous ARP on takeover.</li>
<li>A joining unit takes the primary's configuration, except host name and priority.</li>
<li><code>get system ha status</code> shows health, election reason, sync state and roles.</li>
</ul></div>
`,hi:`
<p>FGCP cluster banana aisa hai jaise do log bheed bhare station par milte hain. Dono ko wahi <b>meeting code</b> pata hona chahiye, ek doosre ko awaaz de sakna chahiye, aur phir notes compare karke decide karte hain ki lead kaun karega. FortiOS mein meeting code group settings hain, awaaz dena <b>heartbeat</b> hai, aur notes woh election hai jo aap chapter 5 mein padhoge. Yeh chapter lab <b>n7-ha-build</b>, tasks 1 aur 2 ki taiyari karta hai.</p>

<h3>Identity: group-id, group-name, password</h3>
<p>Units tabhi same cluster join karte hain jab <code>mode</code>, <code>group-id</code>, <code>group-name</code> aur <code>password</code> same ho (aur heartbeat ki encryption aur authentication settings bhi). Mismatch par wire par koi error message nahi aata; units bas ek doosre ko ignore karte hain aur har ek apna primary ban jaata hai. Yahi <b>split brain</b> hai, chapter 4 mein.</p>
<ul>
<li><b>group-id</b> (0-255) <b>virtual MAC</b> ka bhi hissa hai. Same broadcast domain ke do clusters ko alag group-id chahiye.</li>
<li><b>group-name</b> cluster ko label karta hai aur har status output mein dikhta hai.</li>
<li><b>password</b> cluster members ko ek doosre se authenticate karta hai.</li>
</ul>

<h3>Heartbeat devices</h3>
<p><code>hbdev</code> un interfaces ki list hai jo heartbeat ke liye use hote hain, har ek ki priority ke saath. FortiOS cluster traffic ke liye <b>sabse high priority</b> wala up interface use karta hai aur baaki ko spare rakhta hai. Lab mein: <code>set hbdev "port3" 100 "port4" 50</code>. port3 jab tak up hai heartbeat carry karta hai, aur port3 fail ho to port4 sambhal leta hai. Heartbeat packets apne Ethernet types use karte hain aur interface par IP address ki zaroorat nahi hoti.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Cluster identity and heartbeat">
<rect x="30" y="40" width="190" height="120" rx="10" fill="#bae6fd"/><text x="125" y="64" text-anchor="middle" class="svg-ink" font-size="14">FGT-A</text>
<text x="125" y="86" text-anchor="middle" class="svg-muted" font-size="12">group-id 20</text><text x="125" y="104" text-anchor="middle" class="svg-muted" font-size="12">NILGIRI-HA, a-p</text><text x="125" y="122" text-anchor="middle" class="svg-muted" font-size="12">priority 200</text><text x="125" y="142" text-anchor="middle" class="svg-muted" font-size="12">hbdev port3 100, port4 50</text>
<rect x="420" y="40" width="190" height="120" rx="10" fill="#ddd6fe"/><text x="515" y="64" text-anchor="middle" class="svg-ink" font-size="14">FGT-B</text>
<text x="515" y="86" text-anchor="middle" class="svg-muted" font-size="12">group-id 20</text><text x="515" y="104" text-anchor="middle" class="svg-muted" font-size="12">NILGIRI-HA, a-p</text><text x="515" y="122" text-anchor="middle" class="svg-muted" font-size="12">priority 100</text><text x="515" y="142" text-anchor="middle" class="svg-muted" font-size="12">hbdev port3 100, port4 50</text>
<line x1="220" y1="85" x2="420" y2="85" stroke="#64748b" stroke-width="5"/><text x="320" y="78" text-anchor="middle" class="svg-accent" font-size="12">port3 (use mein)</text>
<line x1="220" y1="125" x2="420" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">port4 (spare)</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Host name, priority aur serial ke alawa sab match hona chahiye</text>
</svg><p class="cap">Do units ek cluster tab banate hain jab identity match kare aur heartbeat link unke hellos carry kare.</p></div>

<h3>Lab mein build karna</h3>
<p>FGT-A live box hai jis par traffic chal raha hai, isliye HA pehle wahan configure hota hai. Phir FGT-B, jo factory-reset unit hai aur jisme sirf host name hai, same group data aur kam priority ke saath configure hota hai. Join hone par woh apni configuration ko primary ki configuration se overwrite kar deta hai, isliye policy 1 <code>LAN-to-WAN</code> FGT-B par bina type kiye aa jaati hai.</p>
<pre class="code"><span class="c">! FGT-A (priority 200)</span>
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set password Nilgiri-HA-2026
    set hbdev "port3" 100 "port4" 50
    set priority 200
    set monitor "port1" "port2"
end

<span class="c">! FGT-B (factory unit, same identity, kam priority)</span>
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set password Nilgiri-HA-2026
    set hbdev "port3" 100 "port4" 50
    set priority 100
end</pre>
<div class="warn"><p><b>Common mistake.</b> Factory unit ko default host name ke saath join karna. Pehle host name set karo, kyunki woh synchronise nahi hota aur CLI prompt mein units ko alag pehchanne ke liye aapko woh chahiye.</p></div>

<h3>Virtual MAC aur gratuitous ARP</h3>
<p>Cluster ek hi network identity dikhata hai. Primary har non-heartbeat data interface par ek <b>virtual MAC</b> se jawab deta hai jiski shape <code>00:09:0f:09:&lt;group-id in hex&gt;:&lt;index&gt;</code> hai. group-id 20 ka hex <code>14</code> hai, isliye addresses port1 par <code>00:09:0f:09:14:00</code> aur port2 par <code>00:09:0f:09:14:01</code> jaise dikhte hain. Secondary apna hardware MAC rakhta hai. Failover par naya primary virtual MAC le leta hai aur <b>gratuitous ARP</b> packets bhejta hai, jisse switches naya port turant seekh lete hain aur hosts same gateway MAC use karte rehte hain. Isi wajah se PC-LAN failover ke baad bhi 10.10.1.1 ki ARP entry rakhta hai.</p>
<div class="eg"><p><b>Worked example.</b> Same WAN VLAN mein doosra cluster jodte waqt galti se group-id 20 hi use ho gaya. Dono primaries <code>00:09:0f:09:14:00</code> claim karte hain. Switch MAC ko do ports ke beech flap karta hai aur traffic intermittent ho jaata hai. Alag group-id lagane se theek ho jaata hai.</p></div>

<h3><code>get system ha status</code> padhna</h3>
<pre class="out">FGT-A # get system ha status
<span class="hl">HA Health Status: OK</span>
Model: FortiGate-VM64
<span class="hl">Mode: HA A-P</span>
Group Name: NILGIRI-HA
Group ID: 20
Cluster Uptime: 0 days 1:00:36
Primary selected using:
    &lt;2026/10/04 21:13:00&gt; vcluster-1: FGVMEV1NU41WS000 is selected as the primary because its priority is larger than peer member FGVMEV1OO2UZP000.
override: disable
Configuration Status:
    FGVMEV1NU41WS000(updated 1 seconds ago): in-sync
    FGVMEV1OO2UZP000(updated 2 seconds ago): in-sync
<span class="hl">Primary     : FGT-A           , FGVMEV1NU41WS000, HA cluster index = 0</span>
<span class="hl">Secondary   : FGT-B           , FGVMEV1OO2UZP000, HA cluster index = 1</span>
number of vcluster: 1</pre>
<ul>
<li><b>HA Health Status</b>: <code>OK</code>, ya <code>WARNING</code> text. Akela unit kehta hai <code>WARNING: only one member is present, the heartbeat finds no peer</code>.</li>
<li><b>Mode, Group Name, Group ID</b>: jo identity aapne type ki thi use confirm karte hain.</li>
<li><b>Primary selected using</b>: election history; sabse nayi line upar hoti hai.</li>
<li><b>Configuration Status</b>: har serial ke liye <code>in-sync</code>. Kuch aur dikhe to chapter 8 chahiye.</li>
<li><b>Primary / Secondary</b>: host names aur serials. Primary ka index 0 hota hai.</li>
</ul>
<p>Serial se host name map karne ke liye <code>get system status</code> bhi use karo: <code>Current HA mode: a-p, primary</code>. Lab aapse join ko <code>diagnose sys ha checksum cluster</code> se prove karwata hai: <code>is_manage_primary()=1</code> wali line primary ki hoti hai.</p>
<div class="note"><p>Honest scope: simulator cluster state turant dikhata hai. Real units ko join hone mein kuch seconds lagte hain, aur output mein zyada fields hote hain (jaise real <code>hb-interval</code> timers).</p></div>

<div class="exam"><p><b>Exam trap.</b> Bada number hamesha behtar nahi hota: <code>hbdev</code> mein high priority preferred heartbeat port hai, lekin jis interface ko aap sabse zyada weight dete ho woh busy switch par wahi na ho jo aap chahte ho. Aur secondary virtual MAC use nahi karta.</p></div>

<div class="scn"><h4>Do clusters, ek VLAN</h4><p>Branch rollout ke baad, stretched VLAN share karne wali do sites ke users ko random gateway timeouts aa rahe the. Dono FortiGate pairs ek hi template se group-id 20 ke saath bane the. Switch virtual MAC ko do primaries ke beech move karta rehta tha. Engineer ne chaaron units par <code>get system ha status</code> compare kiya, same group ID dekha, aur window mein ek pair ko group-id 21 kar diya. Timeouts khatam ho gaye.</p><p><b>Lesson:</b> group-id MAC address ka hissa hai; har broadcast domain mein unique hona chahiye.</p></div>

<div class="iv"><p class="q">"Do FortiGates cluster nahi ban rahe. Sabse pehle kya check karoge?"</p><p>Dono units par mode, group-id, group-name aur password check karo, phir heartbeat link: cable, <code>hbdev</code> mein listed interface, aur link state. Batao ki mismatch par error nahi, do primaries milte hain, aur aap har unit par <code>get system ha status</code> se confirm karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cluster identity = mode, group-id, group-name, password (plus heartbeat encryption aur authentication).</li>
<li><code>hbdev</code> priorities active heartbeat port chunti hain; baaki spare hain.</li>
<li>Primary virtual MAC 00:09:0f:09:&lt;group-id hex&gt;:&lt;index&gt; use karta hai aur takeover par gratuitous ARP bhejta hai.</li>
<li>Join karne wala unit primary ki configuration leta hai, host name aur priority ko chhodkar.</li>
<li><code>get system ha status</code> health, election reason, sync state aur roles dikhata hai.</li>
</ul></div>
`}};export{e as default};