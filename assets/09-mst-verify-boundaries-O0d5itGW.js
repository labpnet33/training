var e={id:`mst-verify-boundaries`,h:{en:`Verifying MST, region boundaries and interoperation with PVST+`,hi:`MST verify karna, region boundaries aur PVST+ ke saath interoperation`},body:{en:`
<p>Picture two countries with different traffic codes. Inside each country, cars follow the local detailed routes. At the border crossing, the details stop: every car, whatever its local route, uses the one main road agreed between the two countries. Border posts must also check that both sides agree which side the capital is on, or cars get sent in circles. MST <b>boundary ports</b> are those border posts, and <b>PVST simulation</b> is the check.</p>

<h3>Verifying the Lab 1 region</h3>
<p>Start with the identity. If the digest differs, nothing else matters.</p>
<pre class="out">SW3# show spanning-tree mst configuration digest
Name      [NK-CAMPUS]
Revision  1     Instances configured 3
<span class="hl">Digest          0x5D1E8A3C47B2F6019E44C0D7A18B3F2E</span></pre>
<p>Run the same on SW1 (Lab 1, task 5): the three lines must be identical. Then look at each instance from the access switch:</p>
<pre class="out">SW3# show spanning-tree mst 1

##### MST1    vlans mapped:   10,20
Bridge        address 5254.0003.0000  priority      32769 (32768 sysid 1)
<span class="hl">Root          address 5254.0001.0000  priority      24577 (24576 sysid 1)</span>
              port    Gi0/1            cost          20000     rem hops 19

Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/1            Root FWD 20000     128.1    P2p</span>
<span class="hl">Gi0/2            Altn BLK 20000     128.2    P2p</span>
Gi0/5            Desg FWD 20000     128.5    P2p Edge</pre>
<pre class="out">SW3# show spanning-tree mst 2

##### MST2    vlans mapped:   30,40
Bridge        address 5254.0003.0000  priority      32770 (32768 sysid 2)
<span class="hl">Root          address 5254.0002.0000  priority      24578 (24576 sysid 2)</span>
              port    Gi0/2            cost          20000     rem hops 19

Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/1            Altn BLK 20000     128.1    P2p</span>
<span class="hl">Gi0/2            Root FWD 20000     128.2    P2p</span>
Gi0/6            Desg FWD 20000     128.6    P2p Edge</pre>
<p>Gi0/1 forwards MST1 and discards MST2; Gi0/2 does the opposite. That is Lab 1 task 3. Note <b>rem hops 19</b>: the root sent 20, one hop was used. Two more useful views:</p>
<pre class="out">SW3# show spanning-tree mst interface GigabitEthernet0/1

GigabitEthernet0/1 of MST0 is root forwarding
Edge port: no             (default)        port guard : none        (default)
Link type: point-to-point (auto)           bpdu filter: disable     (default)
<span class="hl">Boundary : internal</span>                        bpdu guard : disable     (default)
Bpdus sent 14, received 412

Instance Role Sts Cost      Prio.Nbr Vlans mapped
-------- ---- --- --------- -------- -------------------------------
0        Root FWD 20000     128.1    1-9,11-19,21-29,31-39,41-4094
1        Root FWD 20000     128.1    10,20
2        Altn BLK 20000     128.1    30,40</pre>
<p><code>show spanning-tree vlan 30</code> prints the header <b>MST0002</b>, the fastest way to answer "which instance carries this VLAN?". And the MST0 view shows both roots of the CIST:</p>
<pre class="out">SW3# show spanning-tree mst 0

##### MST0    vlans mapped:   1-9,11-19,21-29,31-39,41-4094
Bridge        address 5254.0003.0000  priority      32768 (32768 sysid 0)
Root          address 5254.0001.0000  priority      24576 (24576 sysid 0)
              port    Gi0/1            path cost     0
Regional Root address 5254.0001.0000  priority      24576 (24576 sysid 0)
                                       internal cost 20000     rem hops 19</pre>
<p><b>path cost 0</b> is the <b>external</b> cost to the CIST root: zero because the CIST root is inside this region. The <b>internal cost</b> is the cost inside the region to the regional root.</p>

<h3>Boundary ports</h3>
<p>A port whose neighbour is in a different region, or runs Rapid PVST+, RSTP or 802.1D, is a <b>boundary port</b>. At the boundary:</p>
<ul>
<li>MSTIs stop. The port takes its <b>CIST role and state for every instance</b>; it cannot forward MST1 and block MST2.</li>
<li>The whole region looks like <b>one bridge</b> to the outside. The switch in the region with the best path to the CIST root becomes the <b>CIST regional root</b>; its boundary port toward the CIST root shows role <b>Mstr</b> (master) in every MSTI.</li>
<li>The Type column shows the neighbour's protocol: <code>P2p Bound(RSTP)</code>, <code>P2p Bound(PVST)</code> or <code>P2p Bound(STP)</code>, and <code>show spanning-tree mst interface</code> shows <code>Boundary : boundary</code>.</li>
</ul>
<p>An intended boundary (the edge of your campus) is fine. An accidental one, caused by a region mismatch, silently removes your MSTI load sharing because every VLAN falls back to the CIST.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MST to PVST+ boundary">
<rect x="20" y="30" width="300" height="170" rx="12" fill="#e2e8f0"/><text x="170" y="52" text-anchor="middle" class="svg-ink" font-size="13">MST region (core)</text>
<rect x="60" y="80" width="110" height="40" rx="8" fill="#bae6fd"/><text x="115" y="105" text-anchor="middle" class="svg-ink" font-size="12">CIST root</text>
<rect x="190" y="140" width="110" height="40" rx="8" fill="#bae6fd"/><text x="245" y="165" text-anchor="middle" class="svg-ink" font-size="12">DSW2</text>
<rect x="430" y="140" width="170" height="40" rx="8" fill="#fed7aa"/><text x="515" y="165" text-anchor="middle" class="svg-ink" font-size="12">legacy PVST+ switch</text>
<line x1="300" y1="160" x2="430" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="365" y="150" text-anchor="middle" class="svg-accent" font-size="12">Bound(PVST)</text>
<text x="365" y="200" text-anchor="middle" class="svg-muted" font-size="12">IST BPDU copied into every VLAN</text>
<text x="515" y="215" text-anchor="middle" class="svg-muted" font-size="12">its priorities must be worse</text>
</svg><p class="cap">PVST simulation: the region speaks PVST+ on the boundary, and every VLAN must agree that the root is inside the region.</p></div>

<h3>Interoperation with PVST+: PVST simulation</h3>
<p>A PVST+ switch sends one BPDU per VLAN; the region has one CIST. On a boundary port toward PVST+, the MST switch <b>replicates its CIST BPDU into every VLAN</b> so the PVST+ switch sees the same root in all VLANs, and it uses the VLAN 1 BPDU it receives as the CIST information. It then checks the other VLANs for consistency:</p>
<ul>
<li><b>CIST root inside the MST region</b> (recommended): every PVST+ BPDU received must be <b>inferior</b> to the CIST root. If a PVST+ switch claims to be a better root for, say, VLAN 20, the port is blocked as PVST-simulation inconsistent.</li>
<li><b>CIST root in the PVST+ domain</b>: the boundary port is a root port, and the BPDUs for every other VLAN must be <b>as good as or better than</b> VLAN 1's, meaning the PVST+ side must be the root for all VLANs. Otherwise the port is blocked.</li>
</ul>
<pre class="out">%SPANTREE-2-PVSTSIM_FAIL: Blocking designated port Gi1/0/3: Inconsistent superior PVST BPDU received on VLAN 20, claiming root 24596:5254.0009.0000
DSW2# show spanning-tree inconsistentports
Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
MST0000              GigabitEthernet1/0/3     PVST Sim. Inconsistent</pre>
<p>Design rule: keep the CIST root and all MSTI roots inside the MST core, and give legacy PVST+ switches worse priorities in every VLAN. One more migration detail: after an 802.1D neighbour is replaced, the port may stay in compatibility mode; <code>clear spanning-tree detected-protocols</code> makes it renegotiate.</p>

<div class="eg"><p><b>Worked example: reading an accidental boundary.</b> SW3 keeps the default priority 32768, yet <code>show spanning-tree mst 2</code> on SW3 prints <code>Root this switch for MST2</code>, and its uplinks show <code>Gi0/1 Root FWD 20000 128.1 P2p Bound(RSTP)</code> and <code>Gi0/2 Altn BLK 20000 128.2 P2p Bound(RSTP)</code>, exactly the same roles as in MST0. SW3 (32770) can only be the MST2 root if SW2's MST2 information (24578) never reaches it: SW3 is alone in its own region. MSTIs stop at its ports, which copy their CIST roles. Compare digests: SW3 shows a different one. Fix the name, revision or mapping, and the Bound flags disappear.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving a PVST+ distribution switch with a better priority than the MST core for some VLANs "because it was root before". PVST simulation then blocks the boundary link, and the only path between the two domains disappears.</p></div>

<div class="exam"><p><b>Exam trap.</b> A boundary port has the same role and state in all instances (its CIST role). Role <b>Mstr</b> appears only on the CIST regional root's boundary port toward the CIST root. PVST simulation uses VLAN 1 for the CIST.</p></div>

<div class="scn"><h4>The link that blocked after a core upgrade</h4><p>A bank moved its core to MST but left two legacy PVST+ access switches. Weeks later, one access switch's uplink went into blocking on the core side and its users lost connectivity. The log showed <code>PVSTSIM_FAIL ... VLAN 50, claiming root</code>: a contractor had set <code>spanning-tree vlan 50 priority 4096</code> on the legacy switch while testing. Removing the command cleared the inconsistency within seconds.</p><p><b>Lesson:</b> at an MST-PVST+ boundary, the root of every VLAN must sit on one side, ideally in the MST core.</p></div>

<div class="iv"><p class="q">"How does MST interoperate with Rapid PVST+?"</p><p>Strong answer: the MST region acts as one bridge on the CST. On a boundary port toward PVST+, the MST switch sends its CIST BPDU replicated in every VLAN, and uses the received VLAN 1 BPDU for the CIST. PVST simulation checks consistency: if the CIST root is in the region, all PVST+ BPDUs must be inferior; if the root is on the PVST+ side, all VLANs must have that same or a better root. Violations block the port as PVST Sim. Inconsistent. Best practice: all roots in the MST core.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify in order: digest, then <code>show spanning-tree mst N</code> per instance, then per-interface view.</li>
<li><code>show spanning-tree vlan X</code> shows which MST instance carries the VLAN.</li>
<li>Boundary ports copy their CIST role/state into every instance; Type shows Bound(RSTP/PVST/STP).</li>
<li>PVST simulation: the root for every VLAN must be on one side; best inside the MST core.</li>
<li>An accidental boundary removes MSTI load sharing without any outage.</li>
</ul></div>
`,hi:`
<p>Alag traffic codes wale do desh socho. Har desh ke andar cars local detailed routes follow karti hain. Border crossing par details ruk jaati hain: har car, chahe uska local route kuch bhi ho, dono deshon ke beech tay ek main sadak use karti hai. Border posts ko yeh bhi check karna padta hai ki dono sides agree karein ki rajdhani kis taraf hai, warna cars gol gol ghumaayi jaati hain. MST <b>boundary ports</b> woh border posts hain, aur <b>PVST simulation</b> woh check hai.</p>

<h3>Lab 1 region verify karna</h3>
<p>Identity se shuru karo. Agar digest alag hai, to baaki kuch matter nahi karta.</p>
<pre class="out">SW3# show spanning-tree mst configuration digest
Name      [NK-CAMPUS]
Revision  1     Instances configured 3
<span class="hl">Digest          0x5D1E8A3C47B2F6019E44C0D7A18B3F2E</span></pre>
<p>SW1 par bhi yahi chalao (Lab 1, task 5): teeno lines bilkul same honi chahiye. Phir access switch se har instance dekho:</p>
<pre class="out">SW3# show spanning-tree mst 1

##### MST1    vlans mapped:   10,20
Bridge        address 5254.0003.0000  priority      32769 (32768 sysid 1)
<span class="hl">Root          address 5254.0001.0000  priority      24577 (24576 sysid 1)</span>
              port    Gi0/1            cost          20000     rem hops 19

Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/1            Root FWD 20000     128.1    P2p</span>
<span class="hl">Gi0/2            Altn BLK 20000     128.2    P2p</span>
Gi0/5            Desg FWD 20000     128.5    P2p Edge</pre>
<pre class="out">SW3# show spanning-tree mst 2

##### MST2    vlans mapped:   30,40
Bridge        address 5254.0003.0000  priority      32770 (32768 sysid 2)
<span class="hl">Root          address 5254.0002.0000  priority      24578 (24576 sysid 2)</span>
              port    Gi0/2            cost          20000     rem hops 19

Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/1            Altn BLK 20000     128.1    P2p</span>
<span class="hl">Gi0/2            Root FWD 20000     128.2    P2p</span>
Gi0/6            Desg FWD 20000     128.6    P2p Edge</pre>
<p>Gi0/1 MST1 forward karta hai aur MST2 discard; Gi0/2 iska ulta. Yahi Lab 1 task 3 hai. <b>rem hops 19</b> dekho: root ne 20 bheja, ek hop use hua. Do aur kaam ke views:</p>
<pre class="out">SW3# show spanning-tree mst interface GigabitEthernet0/1

GigabitEthernet0/1 of MST0 is root forwarding
Edge port: no             (default)        port guard : none        (default)
Link type: point-to-point (auto)           bpdu filter: disable     (default)
<span class="hl">Boundary : internal</span>                        bpdu guard : disable     (default)
Bpdus sent 14, received 412

Instance Role Sts Cost      Prio.Nbr Vlans mapped
-------- ---- --- --------- -------- -------------------------------
0        Root FWD 20000     128.1    1-9,11-19,21-29,31-39,41-4094
1        Root FWD 20000     128.1    10,20
2        Altn BLK 20000     128.1    30,40</pre>
<p><code>show spanning-tree vlan 30</code> header <b>MST0002</b> print karta hai, "yeh VLAN kaunsa instance le jaata hai?" ka sabse tez jawab. Aur MST0 view CIST ke dono roots dikhata hai:</p>
<pre class="out">SW3# show spanning-tree mst 0

##### MST0    vlans mapped:   1-9,11-19,21-29,31-39,41-4094
Bridge        address 5254.0003.0000  priority      32768 (32768 sysid 0)
Root          address 5254.0001.0000  priority      24576 (24576 sysid 0)
              port    Gi0/1            path cost     0
Regional Root address 5254.0001.0000  priority      24576 (24576 sysid 0)
                                       internal cost 20000     rem hops 19</pre>
<p><b>path cost 0</b> CIST root tak ki <b>external</b> cost hai: zero kyunki CIST root isi region ke andar hai. <b>Internal cost</b> region ke andar regional root tak ki cost hai.</p>

<h3>Boundary ports</h3>
<p>Jis port ka neighbour alag region mein ho, ya Rapid PVST+, RSTP ya 802.1D chala raha ho, woh <b>boundary port</b> hai. Boundary par:</p>
<ul>
<li>MSTIs ruk jaate hain. Port <b>har instance ke liye apna CIST role aur state</b> leta hai; woh MST1 forward aur MST2 block nahi kar sakta.</li>
<li>Bahar se poora region <b>ek bridge</b> dikhta hai. Region ka woh switch jiska CIST root tak best path hai <b>CIST regional root</b> banta hai; CIST root ki taraf uska boundary port har MSTI mein role <b>Mstr</b> (master) dikhata hai.</li>
<li>Type column neighbour ka protocol dikhata hai: <code>P2p Bound(RSTP)</code>, <code>P2p Bound(PVST)</code> ya <code>P2p Bound(STP)</code>, aur <code>show spanning-tree mst interface</code> <code>Boundary : boundary</code> dikhata hai.</li>
</ul>
<p>Planned boundary (aapke campus ka edge) theek hai. Galti se bani boundary, region mismatch ki wajah se, chupchaap aapka MSTI load sharing hata deti hai kyunki har VLAN CIST par wapas aa jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MST to PVST+ boundary">
<rect x="20" y="30" width="300" height="170" rx="12" fill="#e2e8f0"/><text x="170" y="52" text-anchor="middle" class="svg-ink" font-size="13">MST region (core)</text>
<rect x="60" y="80" width="110" height="40" rx="8" fill="#bae6fd"/><text x="115" y="105" text-anchor="middle" class="svg-ink" font-size="12">CIST root</text>
<rect x="190" y="140" width="110" height="40" rx="8" fill="#bae6fd"/><text x="245" y="165" text-anchor="middle" class="svg-ink" font-size="12">DSW2</text>
<rect x="430" y="140" width="170" height="40" rx="8" fill="#fed7aa"/><text x="515" y="165" text-anchor="middle" class="svg-ink" font-size="12">legacy PVST+ switch</text>
<line x1="300" y1="160" x2="430" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="365" y="150" text-anchor="middle" class="svg-accent" font-size="12">Bound(PVST)</text>
<text x="365" y="200" text-anchor="middle" class="svg-muted" font-size="12">IST BPDU har VLAN mein copy</text>
<text x="515" y="215" text-anchor="middle" class="svg-muted" font-size="12">iski priorities kharab honi chahiye</text>
</svg><p class="cap">PVST simulation: boundary par region PVST+ bolta hai, aur har VLAN ko agree karna hota hai ki root region ke andar hai.</p></div>

<h3>PVST+ ke saath interoperation: PVST simulation</h3>
<p>PVST+ switch har VLAN ka ek BPDU bhejta hai; region ke paas ek CIST hai. PVST+ ki taraf boundary port par MST switch <b>apne CIST BPDU ko har VLAN mein replicate</b> karta hai taaki PVST+ switch ko saare VLANs mein same root dikhe, aur receive hue VLAN 1 BPDU ko CIST info ki tarah use karta hai. Phir woh baaki VLANs ki consistency check karta hai:</p>
<ul>
<li><b>CIST root MST region ke andar</b> (recommended): receive hua har PVST+ BPDU CIST root se <b>inferior</b> hona chahiye. Agar koi PVST+ switch, maan lo VLAN 20 ke liye, behtar root hone ka claim kare, to port PVST-simulation inconsistent ki tarah block hota hai.</li>
<li><b>CIST root PVST+ domain mein</b>: boundary port root port hai, aur har doosre VLAN ke BPDUs VLAN 1 ke jitne ya usse <b>behtar</b> hone chahiye, yaani PVST+ side saare VLANs ka root honi chahiye. Warna port block hota hai.</li>
</ul>
<pre class="out">%SPANTREE-2-PVSTSIM_FAIL: Blocking designated port Gi1/0/3: Inconsistent superior PVST BPDU received on VLAN 20, claiming root 24596:5254.0009.0000
DSW2# show spanning-tree inconsistentports
Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
MST0000              GigabitEthernet1/0/3     PVST Sim. Inconsistent</pre>
<p>Design rule: CIST root aur saare MSTI roots MST core ke andar rakho, aur legacy PVST+ switches ko har VLAN mein kharab priorities do. Migration ki ek aur detail: 802.1D neighbour replace hone ke baad port compatibility mode mein reh sakta hai; <code>clear spanning-tree detected-protocols</code> use dobara negotiate karwata hai.</p>

<div class="eg"><p><b>Worked example: galti se bani boundary padhna.</b> SW3 default priority 32768 par hai, phir bhi SW3 par <code>show spanning-tree mst 2</code> <code>Root this switch for MST2</code> print karta hai, aur uske uplinks <code>Gi0/1 Root FWD 20000 128.1 P2p Bound(RSTP)</code> aur <code>Gi0/2 Altn BLK 20000 128.2 P2p Bound(RSTP)</code> dikhate hain, bilkul MST0 wale roles. SW3 (32770) MST2 ka root tabhi ho sakta hai jab SW2 ki MST2 info (24578) us tak kabhi pahunche hi nahi: SW3 apne alag region mein akela hai. MSTIs uske ports par ruk jaate hain, jo apne CIST roles copy karte hain. Digests compare karo: SW3 alag dikhata hai. Name, revision ya mapping theek karo, aur Bound flags gayab ho jaate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Kisi PVST+ distribution switch ko kuch VLANs ke liye MST core se behtar priority ke saath chhod dena "kyunki pehle woh root tha". Tab PVST simulation boundary link block kar deta hai, aur dono domains ke beech akela path gayab ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Boundary port ka saare instances mein same role aur state hota hai (uska CIST role). Role <b>Mstr</b> sirf CIST regional root ke us boundary port par dikhta hai jo CIST root ki taraf hai. PVST simulation CIST ke liye VLAN 1 use karta hai.</p></div>

<div class="scn"><h4>Core upgrade ke baad block hua link</h4><p>Ek bank ne apna core MST par move kiya lekin do legacy PVST+ access switches chhod diye. Hafton baad ek access switch ka uplink core side par blocking mein chala gaya aur uske users ki connectivity chali gayi. Log mein <code>PVSTSIM_FAIL ... VLAN 50, claiming root</code> tha: ek contractor ne testing karte waqt legacy switch par <code>spanning-tree vlan 50 priority 4096</code> set kiya tha. Command hatate hi kuch second mein inconsistency clear ho gayi.</p><p><b>Seekh:</b> MST-PVST+ boundary par har VLAN ka root ek hi taraf hona chahiye, behtar hai MST core mein.</p></div>

<div class="iv"><p class="q">"MST Rapid PVST+ ke saath kaise interoperate karta hai?"</p><p>Strong answer: MST region CST par ek bridge ki tarah kaam karta hai. PVST+ ki taraf boundary port par MST switch apna CIST BPDU har VLAN mein replicate karke bhejta hai, aur receive hue VLAN 1 BPDU ko CIST ke liye use karta hai. PVST simulation consistency check karta hai: agar CIST root region mein hai, to saare PVST+ BPDUs inferior hone chahiye; agar root PVST+ side par hai, to saare VLANs ka wahi ya behtar root hona chahiye. Violation par port PVST Sim. Inconsistent ki tarah block hota hai. Best practice: saare roots MST core mein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Is order mein verify karo: digest, phir har instance ke liye <code>show spanning-tree mst N</code>, phir per-interface view.</li>
<li><code>show spanning-tree vlan X</code> dikhata hai ki VLAN kaunsa MST instance le jaata hai.</li>
<li>Boundary ports apna CIST role/state har instance mein copy karte hain; Type Bound(RSTP/PVST/STP) dikhata hai.</li>
<li>PVST simulation: har VLAN ka root ek hi taraf hona chahiye; best MST core ke andar.</li>
<li>Galti se bani boundary bina kisi outage ke MSTI load sharing hata deti hai.</li>
</ul></div>
`}};export{e as default};