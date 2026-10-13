var e={id:`components`,h:{en:`ACI components: APIC cluster, spines, leaves and management`,hi:`ACI components: APIC cluster, spines, leaves aur management`},body:{en:`
<p>Think of an airport. The <b>control tower</b> decides who lands and takes off, but no passenger ever walks through it. The <b>runways and taxiways</b> (spines) move aircraft between terminals. The <b>gates</b> (leaves) are where passengers actually board. Some gates are special: the international gate with immigration (border leaf), or a small regional terminal in another city run by the same tower (remote leaf). ACI has exactly these roles.</p>

<h3>The APIC cluster</h3>
<p>The <b>APIC</b> (Application Policy Infrastructure Controller) is a dedicated server appliance (Cisco sells physical APIC appliances; recent releases also offer a virtual APIC option). It stores the whole policy, pushes it to the switches, collects faults and statistics, and offers the GUI, REST API and CLI.</p>
<ul>
<li><b>Cluster size:</b> production fabrics run a cluster of <b>at least three</b> APICs. Larger fabrics can use more (up to seven) for scale, not for extra redundancy. A single APIC is acceptable only in a lab.</li>
<li><b>Connection:</b> each APIC connects with two data interfaces to <b>two different leaves</b> (bonded active/standby), plus an out-of-band management port and its CIMC port.</li>
<li><b>Standby APIC:</b> an extra APIC can be kept as a cold standby and promoted if an active one dies.</li>
</ul>

<h3>Sharding: how three APICs share one database</h3>
<p>The policy database is split into many pieces called <b>shards</b>. Each shard is stored as <b>three replicas</b> on three different APICs; one replica is the <b>leader</b> (accepts writes) and the others are followers. A change is committed only when a <b>majority</b> of the replicas agree.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Shards replicated on three APICs">
<rect x="20" y="20" width="180" height="150" rx="10" fill="#ddd6fe"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="14">APIC 1</text>
<rect x="230" y="20" width="180" height="150" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">APIC 2</text>
<rect x="440" y="20" width="180" height="150" rx="10" fill="#ddd6fe"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="14">APIC 3</text>
<rect x="40" y="60" width="140" height="28" rx="5" fill="#fde68a"/><text x="110" y="79" text-anchor="middle" class="svg-ink" font-size="12">Shard A (leader)</text>
<rect x="40" y="96" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="110" y="115" text-anchor="middle" class="svg-ink" font-size="12">Shard B</text>
<rect x="40" y="132" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="110" y="151" text-anchor="middle" class="svg-ink" font-size="12">Shard C</text>
<rect x="250" y="60" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="320" y="79" text-anchor="middle" class="svg-ink" font-size="12">Shard A</text>
<rect x="250" y="96" width="140" height="28" rx="5" fill="#fde68a"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">Shard B (leader)</text>
<rect x="250" y="132" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="320" y="151" text-anchor="middle" class="svg-ink" font-size="12">Shard C</text>
<rect x="460" y="60" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="530" y="79" text-anchor="middle" class="svg-ink" font-size="12">Shard A</text>
<rect x="460" y="96" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="530" y="115" text-anchor="middle" class="svg-ink" font-size="12">Shard B</text>
<rect x="460" y="132" width="140" height="28" rx="5" fill="#fde68a"/><text x="530" y="151" text-anchor="middle" class="svg-ink" font-size="12">Shard C (leader)</text>
<text x="320" y="198" text-anchor="middle" class="svg-accent" font-size="12">Every shard has 3 replicas; writes need a majority (2 of 3)</text>
</svg><p class="cap">Leaders are spread across the cluster, so the work of writing policy is shared.</p></div>

<p>Consequences you must know: with one APIC down, every shard still has two of three replicas, so the fabric is fully configurable. With <b>two APICs down</b>, the survivor holds a minority of each shard, so its data becomes <b>read-only</b>: you can look, but you cannot change policy. Traffic is unaffected in both cases.</p>

<h3>Spines</h3>
<p><b>Spines</b> connect only to leaves (and, in Multi-Pod or Multi-Site designs, to the inter-pod or inter-site network). Nothing else plugs into a spine. Spines carry traffic between leaves, hold the <b>COOP endpoint database</b> used by the <b>spine proxy</b>, and act as <b>MP-BGP route reflectors</b> for external routes. Typical models: fixed N9K-C9364C or N9K-C9332C, or modular Nexus 9500 chassis with ACI spine line cards.</p>

<h3>Leaves and their roles</h3>
<p><b>Leaves</b> are where everything attaches: servers, hypervisors, storage, firewalls, load balancers, routers and the APICs themselves. Leaves enforce policy (contracts), act as the <b>default gateway</b> for endpoints and encapsulate traffic into VXLAN towards other leaves. A leaf's role is only a name for what you connect to it:</p>
<table class="cmp"><tr><th>Role</th><th>What connects</th></tr>
<tr><td>Compute leaf</td><td>Servers and hypervisors</td></tr>
<tr><td>Border leaf</td><td>External routers, WAN, core, via an L3Out</td></tr>
<tr><td>Service leaf</td><td>Firewalls and load balancers</td></tr>
<tr><td>Remote leaf</td><td>A leaf in another location (small DC, colo) reached over a routed network, managed by the main APIC cluster, with no local spine</td></tr>
</table>
<p>Recent releases also support <b>tier-2 leaves</b> (leaves hanging off other leaves) for large campus-style buildings, but the classic two-tier design is what the exam expects.</p>

<h3>Cabling rules</h3>
<ul>
<li>Every leaf connects to every spine (for bandwidth and redundancy).</li>
<li>Leaves do not connect to other leaves for transport, and spines do not connect to each other.</li>
<li>A vPC pair of leaves needs <b>no vPC peer-link</b> in ACI: the peers talk through the fabric.</li>
</ul>

<h3>Management: out-of-band and in-band</h3>
<p><b>Out-of-band (OOB)</b> management uses the dedicated mgmt0 port of every switch and APIC, connected to a separate management network. You give each node a static OOB address in the <b>mgmt</b> tenant (Tenants → mgmt → Node Management Addresses). <b>In-band</b> management carries management traffic through the fabric itself, using an in-band EPG and a VLAN in the mgmt tenant; it is useful when you want to reach nodes through the production network or export telemetry. Many customers configure both.</p>

<pre class="out">APIC1# show version
 Role        Pod         Node        Name                      Version
 ----------  ----------  ----------  ------------------------  ------------------
 controller  1           1           apic1                     6.0(5h)
 controller  1           2           apic2                     6.0(5h)
 controller  1           3           apic3                     6.0(5h)
 <span class="hl">leaf        1           101         LEAF101                   n9000-16.0(5h)</span>
 leaf        1           102         LEAF102                   n9000-16.0(5h)
 spine       1           201         SPINE201                  n9000-16.0(5h)</pre>

<div class="eg"><p><b>Worked example.</b> A medium fabric: 3 APICs, 2 spines (N9K-C9364C, 64 x 100G), 8 leaves (N9K-C93180YC-FX, 48 x 25G down, 6 x 100G up). Each leaf uses 2 x 100G uplinks, one to each spine: 16 spine ports used, 48 left for growth. Server ports: 8 x 48 = 384 x 25G. Oversubscription per leaf = 1,200G down / 200G up = 6:1. APIC 1 is cabled to leaves 101 and 102, APIC 2 to 103 and 104, APIC 3 to 105 and 106, so no single leaf failure isolates two controllers.</p></div>

<div class="warn"><p><b>Common mistake.</b> Cabling all three APICs to the same pair of leaves, or powering them from the same PDU. Spread the controllers across leaves, racks and power feeds, exactly as you would spread the members of any cluster.</p></div>

<div class="exam"><p><b>Exam trap.</b> "With a 3-node APIC cluster, how many APICs can fail before you lose the ability to make changes?" One. With two failed, the remaining APIC is in the minority and read-only. Also remember: endpoints never connect to spines.</p></div>

<div class="scn"><h4>Two controllers in one rack</h4><p>A bank placed APIC 1 and APIC 2 in the same rack to save cabling. A rack PDU failure took both down. The operations team could still see the fabric on APIC 3, but every attempt to create an EPG for an urgent release failed because the data was read-only. Traffic ran normally. The fix was to restore power, then move APIC 2 to a different rack on a different power feed and a different leaf pair.</p><p><b>Lesson:</b> the cluster protects the policy database only if its members fail independently.</p></div>

<div class="iv"><p class="q">"Why does ACI need three APICs, and what happens if two fail?"</p><p>Strong answer: the policy database is sharded, and each shard has three replicas on three APICs with one leader. Writes need a majority, so a three-node cluster tolerates one failure with full read-write. If two fail, the surviving APIC is in the minority and its shards become read-only; the data plane is unaffected because the APIC is not in the forwarding path. Mention spreading APICs across leaves, racks and power, and the option of a standby APIC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Production ACI uses an APIC cluster of at least three; each APIC is dual-homed to two leaves.</li>
<li>The database is sharded with three replicas per shard; losing two APICs makes the rest read-only.</li>
<li>Spines connect only to leaves, hold the COOP database and are BGP route reflectors.</li>
<li>Leaves connect everything else; border, service, compute and remote leaf are roles, not different products.</li>
<li>Manage nodes out-of-band (mgmt0) and/or in-band through the mgmt tenant.</li>
</ul></div>
`,hi:`
<p>Ek airport ke baare mein socho. <b>Control tower</b> decide karta hai kaun land kare aur kaun udde, lekin koi passenger kabhi usse hokar nahi guzarta. <b>Runways aur taxiways</b> (spines) aircraft ko terminals ke beech le jaate hain. <b>Gates</b> (leaves) woh jagah hain jahan passengers asal mein board karte hain. Kuch gates special hote hain: immigration wala international gate (border leaf), ya doosre shehar mein ek chhota regional terminal jo same tower chalata hai (remote leaf). ACI mein bilkul yahi roles hain.</p>

<h3>APIC cluster</h3>
<p><b>APIC</b> (Application Policy Infrastructure Controller) ek dedicated server appliance hai (Cisco physical APIC appliances bechta hai; recent releases mein virtual APIC option bhi hai). Yeh poori policy store karta hai, use switches par push karta hai, faults aur statistics collect karta hai, aur GUI, REST API aur CLI deta hai.</p>
<ul>
<li><b>Cluster size:</b> production fabrics mein <b>kam se kam teen</b> APIC ka cluster chalta hai. Bade fabrics scale ke liye zyada (saat tak) use kar sakte hain, extra redundancy ke liye nahi. Single APIC sirf lab mein theek hai.</li>
<li><b>Connection:</b> har APIC do data interfaces se <b>do alag leaves</b> se judta hai (active/standby bond), plus ek out-of-band management port aur uska CIMC port.</li>
<li><b>Standby APIC:</b> ek extra APIC cold standby ki tarah rakh sakte ho aur active wala mar jaaye to use promote kar sakte ho.</li>
</ul>

<h3>Sharding: teen APIC ek database kaise share karte hain</h3>
<p>Policy database bahut saare tukdon mein bata hota hai jinhe <b>shards</b> kehte hain. Har shard teen alag APICs par <b>teen replicas</b> ki tarah store hota hai; ek replica <b>leader</b> hota hai (writes accept karta hai) aur baaki followers. Change tabhi commit hota hai jab replicas ka <b>majority</b> agree kare.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Teen APICs par replicate hue shards">
<rect x="20" y="20" width="180" height="150" rx="10" fill="#ddd6fe"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="14">APIC 1</text>
<rect x="230" y="20" width="180" height="150" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">APIC 2</text>
<rect x="440" y="20" width="180" height="150" rx="10" fill="#ddd6fe"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="14">APIC 3</text>
<rect x="40" y="60" width="140" height="28" rx="5" fill="#fde68a"/><text x="110" y="79" text-anchor="middle" class="svg-ink" font-size="12">Shard A (leader)</text>
<rect x="40" y="96" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="110" y="115" text-anchor="middle" class="svg-ink" font-size="12">Shard B</text>
<rect x="40" y="132" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="110" y="151" text-anchor="middle" class="svg-ink" font-size="12">Shard C</text>
<rect x="250" y="60" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="320" y="79" text-anchor="middle" class="svg-ink" font-size="12">Shard A</text>
<rect x="250" y="96" width="140" height="28" rx="5" fill="#fde68a"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">Shard B (leader)</text>
<rect x="250" y="132" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="320" y="151" text-anchor="middle" class="svg-ink" font-size="12">Shard C</text>
<rect x="460" y="60" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="530" y="79" text-anchor="middle" class="svg-ink" font-size="12">Shard A</text>
<rect x="460" y="96" width="140" height="28" rx="5" fill="#e2e8f0"/><text x="530" y="115" text-anchor="middle" class="svg-ink" font-size="12">Shard B</text>
<rect x="460" y="132" width="140" height="28" rx="5" fill="#fde68a"/><text x="530" y="151" text-anchor="middle" class="svg-ink" font-size="12">Shard C (leader)</text>
<text x="320" y="198" text-anchor="middle" class="svg-accent" font-size="12">Har shard ke 3 replicas; writes ko majority (3 mein se 2) chahiye</text>
</svg><p class="cap">Leaders poore cluster mein faile hote hain, isliye policy likhne ka kaam share hota hai.</p></div>

<p>Jo consequences aapko pata hone chahiye: ek APIC down ho to har shard ke paas teen mein se do replicas hain, isliye fabric poori tarah configurable hai. <b>Do APIC down</b> ho to bacha hua APIC har shard ka minority rakhta hai, isliye uska data <b>read-only</b> ho jaata hai: dekh sakte ho, lekin policy change nahi kar sakte. Dono cases mein traffic par koi asar nahi.</p>

<h3>Spines</h3>
<p><b>Spines</b> sirf leaves se judte hain (aur Multi-Pod ya Multi-Site designs mein inter-pod ya inter-site network se). Spine mein aur kuch plug nahi hota. Spines leaves ke beech traffic le jaate hain, <b>spine proxy</b> ke liye use hone wala <b>COOP endpoint database</b> rakhte hain, aur external routes ke liye <b>MP-BGP route reflectors</b> ka kaam karte hain. Typical models: fixed N9K-C9364C ya N9K-C9332C, ya ACI spine line cards wale modular Nexus 9500 chassis.</p>

<h3>Leaves aur unke roles</h3>
<p><b>Leaves</b> par sab kuch attach hota hai: servers, hypervisors, storage, firewalls, load balancers, routers aur khud APICs. Leaves policy (contracts) enforce karte hain, endpoints ke liye <b>default gateway</b> bante hain aur doosre leaves ki taraf traffic ko VXLAN mein encapsulate karte hain. Leaf ka role bas naam hai is baat ka ki aap usse kya jodte ho:</p>
<table class="cmp"><tr><th>Role</th><th>Kya judta hai</th></tr>
<tr><td>Compute leaf</td><td>Servers aur hypervisors</td></tr>
<tr><td>Border leaf</td><td>External routers, WAN, core, L3Out ke through</td></tr>
<tr><td>Service leaf</td><td>Firewalls aur load balancers</td></tr>
<tr><td>Remote leaf</td><td>Doosri location (chhota DC, colo) mein leaf jo routed network se pahuncha jaata hai, main APIC cluster se managed, local spine ke bina</td></tr>
</table>
<p>Recent releases bade campus-style buildings ke liye <b>tier-2 leaves</b> (doosre leaves se latke leaves) bhi support karte hain, lekin exam classic two-tier design expect karta hai.</p>

<h3>Cabling rules</h3>
<ul>
<li>Har leaf har spine se judta hai (bandwidth aur redundancy ke liye).</li>
<li>Leaves transport ke liye doosre leaves se nahi judte, aur spines aapas mein nahi judte.</li>
<li>ACI mein vPC pair of leaves ko <b>vPC peer-link nahi chahiye</b>: peers fabric ke through baat karte hain.</li>
</ul>

<h3>Management: out-of-band aur in-band</h3>
<p><b>Out-of-band (OOB)</b> management har switch aur APIC ka dedicated mgmt0 port use karta hai, jo alag management network se juda hota hai. Aap har node ko <b>mgmt</b> tenant mein static OOB address dete ho (Tenants → mgmt → Node Management Addresses). <b>In-band</b> management, management traffic ko khud fabric ke through le jaata hai, mgmt tenant mein in-band EPG aur VLAN use karke; yeh tab useful hai jab aap production network se nodes tak pahunchna chahte ho ya telemetry export karni ho. Bahut saare customers dono configure karte hain.</p>

<pre class="out">APIC1# show version
 Role        Pod         Node        Name                      Version
 ----------  ----------  ----------  ------------------------  ------------------
 controller  1           1           apic1                     6.0(5h)
 controller  1           2           apic2                     6.0(5h)
 controller  1           3           apic3                     6.0(5h)
 <span class="hl">leaf        1           101         LEAF101                   n9000-16.0(5h)</span>
 leaf        1           102         LEAF102                   n9000-16.0(5h)
 spine       1           201         SPINE201                  n9000-16.0(5h)</pre>

<div class="eg"><p><b>Worked example.</b> Ek medium fabric: 3 APICs, 2 spines (N9K-C9364C, 64 x 100G), 8 leaves (N9K-C93180YC-FX, 48 x 25G neeche, 6 x 100G upar). Har leaf 2 x 100G uplinks use karta hai, har spine ko ek: 16 spine ports used, 48 growth ke liye bache. Server ports: 8 x 48 = 384 x 25G. Har leaf ka oversubscription = 1,200G neeche / 200G upar = 6:1. APIC 1 leaves 101 aur 102 se cabled hai, APIC 2 103 aur 104 se, APIC 3 105 aur 106 se, taaki koi single leaf failure do controllers ko isolate na kare.</p></div>

<div class="warn"><p><b>Common galti.</b> Teeno APIC ko same leaf pair se cable karna, ya same PDU se power dena. Controllers ko leaves, racks aur power feeds par failao, bilkul waise jaise kisi bhi cluster ke members ko failate ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "3-node APIC cluster mein kitne APIC fail ho sakte hain jab tak changes karne ki ability na jaaye?" Ek. Do fail hone par bacha APIC minority mein hai aur read-only hai. Yeh bhi yaad rakho: endpoints kabhi spines se nahi judte.</p></div>

<div class="scn"><h4>Ek rack mein do controllers</h4><p>Ek bank ne cabling bachane ke liye APIC 1 aur APIC 2 ko same rack mein rakha. Rack PDU fail hone se dono band ho gaye. Operations team APIC 3 par fabric dekh pa rahi thi, lekin urgent release ke liye EPG banane ki har koshish fail hui kyunki data read-only tha. Traffic normal chala. Fix tha power restore karna, phir APIC 2 ko alag power feed aur alag leaf pair wale alag rack mein shift karna.</p><p><b>Seekh:</b> cluster policy database ko tabhi protect karta hai jab uske members independently fail hon.</p></div>

<div class="iv"><p class="q">"ACI ko teen APIC kyun chahiye, aur do fail ho jaayein to kya hota hai?"</p><p>Strong answer: policy database sharded hai, aur har shard ke teen APICs par teen replicas hain jinmein ek leader hai. Writes ko majority chahiye, isliye three-node cluster ek failure full read-write ke saath jhel leta hai. Do fail hon to bacha APIC minority mein hai aur uske shards read-only ho jaate hain; data plane par asar nahi kyunki APIC forwarding path mein nahi hai. APICs ko leaves, racks aur power par failane aur standby APIC ke option ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Production ACI kam se kam teen APIC ka cluster use karta hai; har APIC do leaves se dual-homed hai.</li>
<li>Database sharded hai, har shard ke teen replicas; do APIC khone par baaki read-only ho jaata hai.</li>
<li>Spines sirf leaves se judte hain, COOP database rakhte hain aur BGP route reflectors hain.</li>
<li>Baaki sab leaves se judta hai; border, service, compute aur remote leaf roles hain, alag products nahi.</li>
<li>Nodes ko out-of-band (mgmt0) aur/ya mgmt tenant ke through in-band manage karo.</li>
</ul></div>
`}};export{e as default};