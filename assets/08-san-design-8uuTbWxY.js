var e={id:`design`,h:{en:`SAN design: dual fabrics, multipathing and ALUA, topologies and oversubscription`,hi:`SAN design: dual fabrics, multipathing aur ALUA, topologies aur oversubscription`},body:{en:`
<p>A hospital does not run its operating theatre on one power line. It has two separate feeds from two substations, and every critical machine has two plugs. If a digger cuts one cable, the surgeon does not even notice. A production SAN follows exactly this rule: <b>two completely separate fabrics</b>, and every host and array connected to both.</p>

<h3>Dual fabric A and B</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Dual fabric with multipathing">
<rect x="220" y="10" width="200" height="54" rx="8" fill="#bbf7d0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">ESX01 (multipathing)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">vmhba1 | vmhba2</text>
<rect x="60" y="105" width="190" height="50" rx="8" fill="#bae6fd"/><text x="155" y="127" text-anchor="middle" class="svg-ink" font-size="13">MDS-A</text><text x="155" y="145" text-anchor="middle" class="svg-muted" font-size="12">VSAN 10, ZS-FABRIC-A</text>
<rect x="390" y="105" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="485" y="127" text-anchor="middle" class="svg-ink" font-size="13">MDS-B</text><text x="485" y="145" text-anchor="middle" class="svg-muted" font-size="12">VSAN 20, ZS-FABRIC-B</text>
<line x1="270" y1="64" x2="170" y2="105" stroke="#64748b" stroke-width="2"/><line x1="370" y1="64" x2="470" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="195" y="82" text-anchor="middle" class="svg-muted" font-size="12">fc1/1</text><text x="445" y="82" text-anchor="middle" class="svg-muted" font-size="12">fc1/1</text>
<rect x="200" y="195" width="240" height="54" rx="8" fill="#fde68a"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">ARRAY1, LUN 0</text><text x="320" y="237" text-anchor="middle" class="svg-muted" font-size="12">spa0 (SPA) | spb0 (SPB)</text>
<line x1="155" y1="155" x2="260" y2="195" stroke="#64748b" stroke-width="2"/><line x1="485" y1="155" x2="380" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">no ISL between A and B</text>
</svg><p class="cap">Lab 3: the same LUN is reached through two independent fabrics. Losing either one leaves one working path.</p></div>
<ul>
<li>Fabric A and fabric B use <b>separate switches</b>, separate power, separate VSAN numbers (10 and 20 in our lab), and are <b>never connected</b>.</li>
<li>Every host has at least one HBA port in each fabric; every array controller has ports in each fabric.</li>
<li>You zone the same host <b>twice</b>: HBA1 with the array's A-side port on MDS-A, HBA2 with the B-side port on MDS-B.</li>
<li>Because the fabrics are separate, device aliases, zones and zonesets exist separately on each fabric (lab 3: MDS-B needs its own aliases).</li>
</ul>
<p>Why not one fabric with two VSANs? Two VSANs on the same switches still share the same supervisors, the same software and the same administrators. A firmware bug, a mistaken change or a power problem could hit both. Physical separation removes that shared failure domain, and it lets you upgrade fabric A on Tuesday and fabric B on Thursday.</p>

<h3>Completing fabric B (lab 3)</h3>
<pre class="code"><span class="c">! MDS-B: enable the host port, then aliases, zone, zoneset</span>
MDS-B# configure terminal
MDS-B(config)# interface fc1/1
MDS-B(config-if)# switchport mode F
MDS-B(config-if)# no shutdown
MDS-B(config-if)# exit
MDS-B(config)# device-alias database
MDS-B(config-device-alias-db)# device-alias name ESX01-HBA2 pwwn 20:00:00:25:b5:bb:00:01
MDS-B(config-device-alias-db)# device-alias name ARRAY1-SPB0 pwwn 50:06:01:68:3e:a0:12:34
MDS-B(config-device-alias-db)# exit
MDS-B(config)# device-alias commit
MDS-B(config)# zone name ESX01_ARRAY1 vsan 20
MDS-B(config-zone)# member device-alias ESX01-HBA2
MDS-B(config-zone)# member device-alias ARRAY1-SPB0
MDS-B(config-zone)# zoneset name ZS-FABRIC-B vsan 20
MDS-B(config-zoneset)# member ESX01_ARRAY1
MDS-B(config-zoneset)# zoneset activate name ZS-FABRIC-B vsan 20
MDS-B(config)# end
MDS-B# copy running-config startup-config</pre>

<h3>Multipathing on the host</h3>
<p>After a rescan the host sees LUN 0 twice, once per HBA. <b>Multipathing</b> software recognises that both paths lead to the same LUN (same NAA ID) and presents one disk to the OS. It handles failover and, where allowed, load balancing. Examples: VMware <b>NMP</b> (Native Multipathing Plugin, with a SATP that knows the array type and a PSP that picks paths), Linux <b>dm-multipath</b> (<code>multipath -ll</code>), Windows <b>MPIO</b>.</p>
<p>With an asymmetric array, <b>ALUA</b> tells the host which paths are best. Paths through the controller that owns the LUN are <b>active/optimized</b>; paths through the other controller are <b>active/non-optimized</b> (they work, but the I/O crosses the internal link between controllers). The host's path policy (for VMware usually Round Robin, <code>VMW_PSP_RR</code>) spreads I/O across the optimized paths only, and falls back to non-optimized ones if all optimized paths die.</p>
<pre class="out">[root@esx01:~] esxcli storage core path list | grep -E "Runtime Name|State:"
   Runtime Name: vmhba1:C0:T0:L0
   State: active
<span class="hl">   Runtime Name: vmhba2:C0:T0:L0
   State: active</span></pre>

<h3>Topologies</h3>
<ul>
<li><b>Collapsed core</b>: hosts and arrays connect to the same switch (one per fabric). Simple, lowest latency, no ISLs. Fits up to a few hundred ports with director-class MDS chassis.</li>
<li><b>Core-edge</b>: arrays connect to core switches; hosts connect to edge switches; edges connect to the core with ISLs (often port channels). Scales to thousands of ports.</li>
<li><b>Edge-core-edge</b>: hosts on host-edge switches, arrays on storage-edge switches, a core in the middle. Used in very large fabrics.</li>
</ul>

<h3>Fan-out, fan-in and oversubscription</h3>
<p>Cisco defines <b>fan-out</b> as the number of host ports served by one storage port, and <b>fan-in</b> as the number of storage ports one host port uses. Some vendors swap the words, so always say the direction ("host ports per storage port"). Array vendors publish a recommended maximum fan-out per port; values between 8:1 and 16:1 are common for flash arrays.</p>
<div class="eg"><p><b>Worked example: oversubscription math.</b> An edge MDS in fabric A has 48 host ports at 32G and 4 ISLs of 32G to the core in a port channel. Host-side bandwidth = 48 × 32 = 1,536 Gb/s. ISL bandwidth = 4 × 32 = 128 Gb/s. <b>ISL oversubscription = 1,536 ÷ 128 = 12:1.</b> If the hosts average 2 Gb/s each at peak, they need 96 Gb/s: fine. If a backup job pushes 20 hosts to 10 Gb/s each, they need 200 Gb/s and the ISL congests; add ISLs (8 ISLs = 6:1) or connect backup hosts on the core. On the array side: 64 host ports on 4 array ports is a fan-out of 16:1.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Plugging both HBAs of a host into the same fabric (two paths, but one failure domain). Zoning fabric A and forgetting fabric B, so the host runs on a single path until the day fabric A has maintenance. Connecting A and B "for flexibility". Using a path policy that ignores ALUA, sending I/O through the non-optimized controller.</p></div>
<div class="exam"><p><b>Exam tip.</b> Dual physically separate fabrics; hosts multipath across them. ALUA states: active/optimized, active/non-optimized, standby, unavailable. Core-edge scales; collapsed core is simplest. Oversubscription = edge bandwidth ÷ ISL bandwidth.</p></div>

<div class="scn"><h4>Only half the paths</h4><p>After a maintenance window, vCenter reported "lost storage path redundancy" on every datastore of one cluster. <code>esxcli storage core path list</code> showed every vmhba1 path active and every vmhba2 path dead. All vmhba2 ports connect to fabric B, so the engineer went straight to MDS-B: the ports were up and logged in, but <code>show zoneset active vsan 20</code> showed a zoneset called ZS-TEST with two zones. During the window someone had activated a test zoneset instead of ZS-FABRIC-B. Reactivating ZS-FABRIC-B restored all paths within a minute, with no outage because fabric A carried the load.</p><p><b>Lesson:</b> when one HBA's paths are dead on every host, the problem is that fabric, not the hosts; and dual fabrics turned a disaster into a warning.</p></div>

<div class="iv"><p class="q">"Why do we build two separate SAN fabrics, and how does the host use them?"</p><p>Strong answer: to remove every shared failure domain: separate switches, power, software and change windows, so a failure or mistake in one fabric cannot take down storage. Each host HBA and each array controller connects to both; each fabric is zoned independently. On the host, multipathing (NMP, dm-multipath, MPIO) sees the same LUN by NAA ID on several paths, uses ALUA to prefer active/optimized paths, round-robins across them and fails over when a path dies. Mention that one fabric with two VSANs is not equivalent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Production SANs use two physically separate fabrics that are never connected; zone each host on both.</li>
<li>Aliases, zones and zonesets are separate per fabric (VSAN 10 on MDS-A, VSAN 20 on MDS-B).</li>
<li>Multipathing merges paths by NAA ID; ALUA marks optimized and non-optimized paths.</li>
<li>Collapsed core is simplest; core-edge and edge-core-edge scale with ISLs.</li>
<li>Oversubscription = host-side bandwidth ÷ ISL bandwidth; size ISLs for peak, not average.</li>
</ul></div>
`,hi:`
<p>Hospital apna operation theatre ek power line par nahi chalata. Uske paas do substations se do alag feeds hote hain, aur har critical machine ke do plugs hote hain. Agar koi JCB ek cable kaat de, surgeon ko pata bhi nahi chalta. Production SAN bilkul yahi rule follow karta hai: <b>do bilkul alag fabrics</b>, aur har host aur array dono se jude hue.</p>

<h3>Dual fabric A aur B</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Multipathing ke saath dual fabric">
<rect x="220" y="10" width="200" height="54" rx="8" fill="#bbf7d0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">ESX01 (multipathing)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">vmhba1 | vmhba2</text>
<rect x="60" y="105" width="190" height="50" rx="8" fill="#bae6fd"/><text x="155" y="127" text-anchor="middle" class="svg-ink" font-size="13">MDS-A</text><text x="155" y="145" text-anchor="middle" class="svg-muted" font-size="12">VSAN 10, ZS-FABRIC-A</text>
<rect x="390" y="105" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="485" y="127" text-anchor="middle" class="svg-ink" font-size="13">MDS-B</text><text x="485" y="145" text-anchor="middle" class="svg-muted" font-size="12">VSAN 20, ZS-FABRIC-B</text>
<line x1="270" y1="64" x2="170" y2="105" stroke="#64748b" stroke-width="2"/><line x1="370" y1="64" x2="470" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="195" y="82" text-anchor="middle" class="svg-muted" font-size="12">fc1/1</text><text x="445" y="82" text-anchor="middle" class="svg-muted" font-size="12">fc1/1</text>
<rect x="200" y="195" width="240" height="54" rx="8" fill="#fde68a"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">ARRAY1, LUN 0</text><text x="320" y="237" text-anchor="middle" class="svg-muted" font-size="12">spa0 (SPA) | spb0 (SPB)</text>
<line x1="155" y1="155" x2="260" y2="195" stroke="#64748b" stroke-width="2"/><line x1="485" y1="155" x2="380" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">A aur B ke beech koi ISL nahi</text>
</svg><p class="cap">Lab 3: same LUN tak do independent fabrics se pahuncha jaata hai. Koi bhi ek khone par ek kaam karta path bachta hai.</p></div>
<ul>
<li>Fabric A aur fabric B <b>alag switches</b>, alag power, alag VSAN numbers (hamare lab mein 10 aur 20) use karte hain, aur <b>kabhi jude nahi hote</b>.</li>
<li>Har host ka har fabric mein kam se kam ek HBA port hota hai; har array controller ke ports har fabric mein hote hain.</li>
<li>Aap same host ko <b>do baar</b> zone karte ho: MDS-A par HBA1 ko array ke A-side port ke saath, MDS-B par HBA2 ko B-side port ke saath.</li>
<li>Kyunki fabrics alag hain, device aliases, zones aur zonesets har fabric par alag exist karte hain (lab 3: MDS-B ko apne aliases chahiye).</li>
</ul>
<p>Do VSANs wala ek fabric kyun nahi? Same switches par do VSANs abhi bhi same supervisors, same software aur same administrators share karte hain. Ek firmware bug, galat change ya power problem dono ko hit kar sakta hai. Physical separation woh shared failure domain hata deta hai, aur aapko fabric A ko Tuesday aur fabric B ko Thursday upgrade karne deta hai.</p>

<h3>Fabric B poora karna (lab 3)</h3>
<pre class="code"><span class="c">! MDS-B: host port enable karo, phir aliases, zone, zoneset</span>
MDS-B# configure terminal
MDS-B(config)# interface fc1/1
MDS-B(config-if)# switchport mode F
MDS-B(config-if)# no shutdown
MDS-B(config-if)# exit
MDS-B(config)# device-alias database
MDS-B(config-device-alias-db)# device-alias name ESX01-HBA2 pwwn 20:00:00:25:b5:bb:00:01
MDS-B(config-device-alias-db)# device-alias name ARRAY1-SPB0 pwwn 50:06:01:68:3e:a0:12:34
MDS-B(config-device-alias-db)# exit
MDS-B(config)# device-alias commit
MDS-B(config)# zone name ESX01_ARRAY1 vsan 20
MDS-B(config-zone)# member device-alias ESX01-HBA2
MDS-B(config-zone)# member device-alias ARRAY1-SPB0
MDS-B(config-zone)# zoneset name ZS-FABRIC-B vsan 20
MDS-B(config-zoneset)# member ESX01_ARRAY1
MDS-B(config-zoneset)# zoneset activate name ZS-FABRIC-B vsan 20
MDS-B(config)# end
MDS-B# copy running-config startup-config</pre>

<h3>Host par multipathing</h3>
<p>Rescan ke baad host LUN 0 ko do baar dekhta hai, har HBA par ek baar. <b>Multipathing</b> software pehchanta hai ki dono paths same LUN (same NAA ID) tak jaate hain aur OS ko ek hi disk present karta hai. Yeh failover aur, jahan allowed ho, load balancing handle karta hai. Examples: VMware <b>NMP</b> (Native Multipathing Plugin, ek SATP ke saath jo array type jaanta hai aur ek PSP jo paths chunta hai), Linux <b>dm-multipath</b> (<code>multipath -ll</code>), Windows <b>MPIO</b>.</p>
<p>Asymmetric array ke saath <b>ALUA</b> host ko batata hai kaunse paths best hain. LUN own karne wale controller ke through paths <b>active/optimized</b> hain; doosre controller ke through paths <b>active/non-optimized</b> hain (kaam karte hain, lekin I/O controllers ke beech internal link cross karta hai). Host ki path policy (VMware ke liye aam taur par Round Robin, <code>VMW_PSP_RR</code>) I/O sirf optimized paths par failati hai, aur agar saare optimized paths mar jaayein to non-optimized par fall back karti hai.</p>
<pre class="out">[root@esx01:~] esxcli storage core path list | grep -E "Runtime Name|State:"
   Runtime Name: vmhba1:C0:T0:L0
   State: active
<span class="hl">   Runtime Name: vmhba2:C0:T0:L0
   State: active</span></pre>

<h3>Topologies</h3>
<ul>
<li><b>Collapsed core</b>: hosts aur arrays same switch se judte hain (har fabric mein ek). Simple, sabse kam latency, koi ISL nahi. Director-class MDS chassis ke saath kuch sau ports tak fit hota hai.</li>
<li><b>Core-edge</b>: arrays core switches se judte hain; hosts edge switches se; edges core se ISLs (aksar port channels) se judte hain. Hazaaron ports tak scale karta hai.</li>
<li><b>Edge-core-edge</b>: hosts host-edge switches par, arrays storage-edge switches par, beech mein core. Bahut bade fabrics mein use hota hai.</li>
</ul>

<h3>Fan-out, fan-in aur oversubscription</h3>
<p>Cisco <b>fan-out</b> ko ek storage port se serve hone wale host ports ki ginti, aur <b>fan-in</b> ko ek host port dwara use kiye jaane wale storage ports ki ginti ki tarah define karta hai. Kuch vendors shabd ulte use karte hain, isliye hamesha direction bolo ("har storage port par host ports"). Array vendors har port ka recommended maximum fan-out publish karte hain; flash arrays ke liye 8:1 se 16:1 ke beech ki values common hain.</p>
<div class="eg"><p><b>Worked example: oversubscription math.</b> Fabric A ke ek edge MDS mein 32G ke 48 host ports hain aur core tak port channel mein 32G ke 4 ISLs. Host-side bandwidth = 48 × 32 = 1,536 Gb/s. ISL bandwidth = 4 × 32 = 128 Gb/s. <b>ISL oversubscription = 1,536 ÷ 128 = 12:1.</b> Agar peak par hosts average 2 Gb/s each hain, to unhe 96 Gb/s chahiye: theek hai. Agar backup job 20 hosts ko 10 Gb/s each tak le jaaye, to unhe 200 Gb/s chahiye aur ISL congest hoga; ISLs jodo (8 ISLs = 6:1) ya backup hosts ko core par connect karo. Array side par: 4 array ports par 64 host ports ka matlab 16:1 fan-out.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Host ke dono HBAs same fabric mein lagana (do paths, lekin ek failure domain). Fabric A zone karna aur fabric B bhool jaana, jisse host single path par chalta hai us din tak jab fabric A ka maintenance ho. "Flexibility ke liye" A aur B ko jodna. Aisi path policy use karna jo ALUA ignore kare, aur I/O non-optimized controller se bheje.</p></div>
<div class="exam"><p><b>Exam tip.</b> Do physically alag fabrics; hosts unke across multipath karte hain. ALUA states: active/optimized, active/non-optimized, standby, unavailable. Core-edge scale karta hai; collapsed core sabse simple hai. Oversubscription = edge bandwidth ÷ ISL bandwidth.</p></div>

<div class="scn"><h4>Sirf aadhe paths</h4><p>Ek maintenance window ke baad vCenter ne ek cluster ke har datastore par "lost storage path redundancy" report kiya. <code>esxcli storage core path list</code> ne har vmhba1 path active aur har vmhba2 path dead dikhaya. Saare vmhba2 ports fabric B se judte hain, isliye engineer seedha MDS-B par gaya: ports up aur logged in the, lekin <code>show zoneset active vsan 20</code> ne do zones wala ZS-TEST naam ka zoneset dikhaya. Window ke dauraan kisi ne ZS-FABRIC-B ke bajaye test zoneset activate kar diya tha. ZS-FABRIC-B reactivate karne se ek minute mein saare paths wapas aa gaye, bina outage ke kyunki fabric A load utha raha tha.</p><p><b>Seekh:</b> jab har host par ek HBA ke paths dead hon, problem us fabric mein hai, hosts mein nahi; aur dual fabrics ne disaster ko warning mein badal diya.</p></div>

<div class="iv"><p class="q">"Hum do alag SAN fabrics kyun banate hain, aur host unhe kaise use karta hai?"</p><p>Strong answer: har shared failure domain hatane ke liye: alag switches, power, software aur change windows, taaki ek fabric ka failure ya galti storage ko down na kar sake. Har host HBA aur har array controller dono se judta hai; har fabric independently zone hota hai. Host par multipathing (NMP, dm-multipath, MPIO) same LUN ko NAA ID se kai paths par dekhti hai, active/optimized paths prefer karne ke liye ALUA use karti hai, unpar round-robin karti hai aur path marne par failover karti hai. Batao ki do VSANs wala ek fabric equivalent nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Production SANs do physically alag fabrics use karte hain jo kabhi jude nahi hote; har host ko dono par zone karo.</li>
<li>Aliases, zones aur zonesets har fabric par alag hain (MDS-A par VSAN 10, MDS-B par VSAN 20).</li>
<li>Multipathing paths ko NAA ID se merge karti hai; ALUA optimized aur non-optimized paths mark karta hai.</li>
<li>Collapsed core sabse simple hai; core-edge aur edge-core-edge ISLs ke saath scale karte hain.</li>
<li>Oversubscription = host-side bandwidth ÷ ISL bandwidth; ISLs ko peak ke liye size karo, average ke liye nahi.</li>
</ul></div>
`}};export{e as default};