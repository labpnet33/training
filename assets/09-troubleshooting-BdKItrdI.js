var e={id:`troubleshooting`,h:{en:`Troubleshooting multi-area OSPF: symptom, command, fix`,hi:`Multi-area OSPF troubleshooting: symptom, command, fix`},body:{en:`
<p>A good mechanic does not replace parts at random: she takes the one measurement that separates the likely causes. Multi-area faults repeat the same patterns, so you can learn them as a diagnosis chart. CCNA v2.0 weights troubleshooting more, so this chapter is a table first and a story second.</p>

<h3>The diagnosis chart</h3>
<div class="tbl"><table>
<tr><th>Symptom</th><th>First command</th><th>What you see</th><th>Fix</th></tr>
<tr><td>Link up, no OSPF neighbour at all</td><td><code>show ip ospf interface brief</code> on both ends</td><td>Different values in the Area column</td><td>Correct the area on the wrong side (network statement or interface command)</td></tr>
<tr><td>Area 1 reaches the ABR but not the backbone; other areas missing</td><td><code>show ip ospf</code> and <code>show ip ospf interface brief</code> on the ABR</td><td>Backbone block has only a loopback, or the ABR's backbone link sits in another area</td><td>Put the uplink in area 0 on both ends</td></tr>
<tr><td>One prefix from an area is missing elsewhere</td><td><code>show ip ospf interface brief</code> on the originating router</td><td>The interface is not listed, or is in the wrong area</td><td>Add or correct the network statement or interface command</td></tr>
<tr><td>A whole group of prefixes missing, a summary exists</td><td><code>show ip ospf</code> on the ABR (area ranges) and <code>show run | section ospf</code></td><td><code>DoNotAdvertise</code>, or a range with the wrong area or wrong mask</td><td>Remove <code>not-advertise</code>; fix the area number and mask</td></tr>
<tr><td>External routes or default route missing</td><td><code>show ip ospf database external</code> then <code>show ip ospf border-routers</code></td><td>No type 5 LSA, or type 5 present but ASBR not in border-routers</td><td>Add the static default under the originating router, use <code>always</code> if intended, repair the ABR so type 4 appears</td></tr>
</table></div>

<h3>Fault 1: ABR not touching area 0</h3>
<p>Imagine the link R2 to R3 was typed into area 1 on R2 while R3 uses area 0. The two ends disagree, so this fault looks identical to an area mismatch: no neighbour on that link. On R2:</p>
<pre class="out">R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     1               10.0.12.2/30       1     DR    1/1
<span class="hl">Gi0/1        1     1               10.0.23.1/30       1     DR    0/0</span>
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0

R3# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface</pre>
<p>R2's Gi0/1 is in area 1, so both real links of R2 are in area 1; it is a 'border router' only through its area 0 loopback. R3 has no neighbours, and R1 loses the default route and the path to 3.3.3.3. <b>Fix:</b> <code>interface GigabitEthernet0/1</code> then <code>ip ospf 1 area 0</code> on R2.</p>

<h3>Fault 2: area ID mismatch</h3>
<pre class="out">R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface

R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
<span class="hl">Gi0/0        1     2               10.0.12.1/30       1     DR    0/0</span>
Lo0          1     1               1.1.1.1/32         1     LOOP  0/0
Lo1          1     1               172.16.1.1/24      1     LOOP  0/0</pre>
<p>R1's uplink is in area 2 while R2's side is in area 1. Hellos carry the area ID, and a router ignores a Hello from another area. The neighbour table is empty and R1 even thinks it is the DR of a lonely segment (state DR, 0/0). <b>Fix:</b> change the network statement for 10.0.12.0 to area 1 on R1.</p>

<h3>Fault 3: a prefix missing in other areas</h3>
<p>Suppose R1's network statements cover only 172.16.1.0 and 172.16.2.0. Everything else works, but a user on 172.16.3.0/24 cannot be reached from the backbone:</p>
<pre class="out">R3# show ip route ospf
      172.16.0.0/24 is subnetted, 2 subnets
O IA     172.16.1.0 [110/3] via 10.0.23.1, 00:00:10, GigabitEthernet0/0
O IA     172.16.2.0 [110/3] via 10.0.23.1, 00:00:10, GigabitEthernet0/0

R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     1               10.0.12.1/30       1     BDR   1/1
Lo0          1     1               1.1.1.1/32         1     LOOP  0/0
<span class="hl">Lo1          1     1               172.16.1.1/24      1     LOOP  0/0</span>
<span class="hl">Lo2          1     1               172.16.2.1/24      1     LOOP  0/0</span></pre>
<p>(Some lines trimmed.) Loopback3 is missing in OSPF: no statement matches it. The rule is simple: <b>if the interface is not in the interface brief, it is not in OSPF</b>, so no LSA will ever describe it. <b>Fix:</b> <code>network 172.16.3.0 0.0.0.255 area 1</code> on R1.</p>

<h3>Fault 4: a summary hiding a needed route</h3>
<p>Two variants. In the first, somebody used <code>not-advertise</code> for 172.16.3.0/24 months ago:</p>
<pre class="out">R2# show ip ospf | include Area 1|ranges|172.16
        Area ranges are
    Area 1
        Area ranges are
<span class="hl">           172.16.3.0/24 Active(1) DoNotAdvertise</span></pre>
<p>R3 shows the same missing route as in fault 3, but here R1 is perfectly healthy. The range with <code>DoNotAdvertise</code> on the ABR is the cause. <b>Fix:</b> <code>no area 1 range 172.16.3.0 255.255.255.0 not-advertise</code>.</p>
<p>In the second variant, the range was typed for the wrong area, so the summary never forms. This one is quiet: the routes simply stay unsummarised.</p>
<pre class="out">R2# show ip ospf | include Area B|Area 1|ranges|172.16
 It is an area border router
    Area BACKBONE(0)
        Area ranges are
<span class="hl">           172.16.0.0/22 Passive Advertise</span>
    Area 1
        Area ranges are</pre>
<p>The range sits under BACKBONE (area 0) with status Passive, not Active, because there are no area 0 routes inside it, and area 1 has no range. R3 still sees the three /24s. <b>Fix:</b> <code>no area 0 range 172.16.0.0 255.255.252.0</code> then <code>area 1 range 172.16.0.0 255.255.252.0</code>. The number must be the area where the routes <b>live</b>.</p>

<h3>Fault 5: no default route</h3>
<pre class="out">R3# show run | section ospf
router ospf 1
 router-id 3.3.3.3
 network 10.0.23.0 0.0.0.3 area 0
 network 3.3.3.3 0.0.0.0 area 0

R1# show ip route 0.0.0.0
% Network not in table</pre>
<p>R3 has no <code>default-information originate</code> line, so no type 5 LSA exists. If the line is there but the static default to the ISP is missing, the result on R1 is the same (the plain command needs a default in the table). <b>Fix:</b> add the missing line, or restore the static route, or add <code>always</code> if you really want an unconditional default.</p>

<div class="eg"><p><b>Worked example, the full story.</b> Ticket: 'HQ servers cannot reach the Pune server LAN 172.16.3.0/24. Other Pune LANs are fine.' Step 1, on R3: <code>show ip route ospf</code> shows only .1.0 and .2.0 as O IA. So the route is lost before it arrives at R3. Step 2, on R2 (the ABR): <code>show ip ospf database summary</code> has no 172.16.3.0 either. Step 3, still on R2: <code>show ip ospf</code> lists <code>172.16.3.0/24 Active(1) DoNotAdvertise</code>. 'Active' tells you the route exists in area 1, so R1 is fine, and DoNotAdvertise tells you the ABR is hiding it. A change from last quarter, meant to keep a lab LAN private, now covers a production LAN. Step 4: remove the not-advertise range. Step 5: R3 shows 172.16.3.0 as O IA within seconds. Four commands, two routers, and you never touched R1.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Troubleshooting from the routing table alone. Starting at the far router instead of the ABR, where most inter-area problems show. Changing three things at once. Blaming OSPF for a failed ping without checking the return path (the ISP in our lab has no route back to internal subnets, so pings to it fail for that reason).</p></div>

<div class="exam"><p><b>Exam traps.</b> Area ID mismatch means no neighbour. An ABR needs a real area 0 link. In <code>area N range</code>, N is the area that owns the routes. An interface missing from <code>show ip ospf interface brief</code> is not running OSPF.</p></div>

<div class="iv"><p class="q">'Users in area 1 cannot reach a server in area 0. All OSPF neighbours are up. How do you proceed?'</p><p>Strong answer: I follow the route hop by hop. On a router in area 1, <code>show ip route</code> for the server prefix; if it is missing, go to the ABR and check <code>show ip ospf interface brief</code> for the backbone link and <code>show ip ospf database summary</code> for the prefix. Then <code>show ip ospf</code> for ranges or not-advertise statements. If the route is present on both sides, I check the return path and ACLs. I change one thing at a time and re-verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most multi-area faults are area typos, an ABR without a real area 0 link, a missing network statement, a range on the wrong area or with not-advertise, and a missing default or ASBR.</li>
<li>Always check the Area column on both ends of a link first.</li>
<li>An interface not listed in <code>show ip ospf interface brief</code> is not in OSPF.</li>
<li>Go to the ABR early: it shows area counts, area ranges and type 3 LSAs.</li>
</ul></div>
`,hi:`
<p>Achha mechanic parts ko randomly nahi badalta: woh ek aisi measurement leta hai jo sambhavit wajahon ko alag kare. Multi-area faults wahi patterns dohrate hain, isliye unhe diagnosis chart ki tarah seekh sakte ho. CCNA v2.0 troubleshooting ko zyada weight deta hai, isliye yeh chapter pehle table aur phir kahani hai.</p>

<h3>Diagnosis chart</h3>
<div class="tbl"><table>
<tr><th>Symptom</th><th>Pehli command</th><th>Kya dikhta hai</th><th>Fix</th></tr>
<tr><td>Link up, OSPF neighbour bilkul nahi</td><td>Dono ends par <code>show ip ospf interface brief</code></td><td>Area column mein alag values</td><td>Galat side par area theek karo (network statement ya interface command)</td></tr>
<tr><td>Area 1 ABR tak pahunchta hai par backbone nahi; dusre areas gayab</td><td>ABR par <code>show ip ospf</code> aur <code>show ip ospf interface brief</code></td><td>Backbone block mein sirf loopback, ya ABR ka backbone link doosre area mein</td><td>Uplink ko dono ends par area 0 mein daalo</td></tr>
<tr><td>Ek area ka ek prefix doosri jagah missing</td><td>Originating router par <code>show ip ospf interface brief</code></td><td>Interface list mein nahi, ya galat area mein</td><td>Network statement ya interface command add/theek karo</td></tr>
<tr><td>Prefixes ka poora group missing, summary maujood</td><td>ABR par <code>show ip ospf</code> (area ranges) aur <code>show run | section ospf</code></td><td><code>DoNotAdvertise</code>, ya galat area ya galat mask wali range</td><td><code>not-advertise</code> hatao; area number aur mask theek karo</td></tr>
<tr><td>External routes ya default route missing</td><td><code>show ip ospf database external</code> phir <code>show ip ospf border-routers</code></td><td>Type 5 LSA nahi, ya type 5 hai par ASBR border-routers mein nahi</td><td>Originating router par static default jodo, chaaho to <code>always</code>, ABR theek karo taaki type 4 aaye</td></tr>
</table></div>

<h3>Fault 1: ABR jo area 0 ko chhoota nahi</h3>
<p>Maan lo R2 par R2-R3 link area 1 mein type ho gaya jabki R3 area 0 use karta hai. Dono ends asahmat hain, isliye yeh fault area mismatch jaisa hi dikhta hai: us link par koi neighbour nahi. R2 par:</p>
<pre class="out">R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     1               10.0.12.2/30       1     DR    1/1
<span class="hl">Gi0/1        1     1               10.0.23.1/30       1     DR    0/0</span>
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0

R3# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface</pre>
<p>R2 ka Gi0/1 area 1 mein hai, yaani R2 ke dono asli links area 1 mein hain; woh sirf area 0 ke loopback ki wajah se 'border router' hai. R3 ke koi neighbours nahi, aur R1 default route aur 3.3.3.3 tak path kho deta hai. <b>Fix:</b> R2 par <code>interface GigabitEthernet0/1</code> phir <code>ip ospf 1 area 0</code>.</p>

<h3>Fault 2: area ID mismatch</h3>
<pre class="out">R1# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface

R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
<span class="hl">Gi0/0        1     2               10.0.12.1/30       1     DR    0/0</span>
Lo0          1     1               1.1.1.1/32         1     LOOP  0/0
Lo1          1     1               172.16.1.1/24      1     LOOP  0/0</pre>
<p>R1 ka uplink area 2 mein hai jabki R2 ki taraf area 1. Hellos mein area ID jaati hai, aur router doosre area ke Hello ko ignore karta hai. Neighbour table khaali hai aur R1 khud ko akele segment ka DR samajhta hai (state DR, 0/0). <b>Fix:</b> R1 par 10.0.12.0 ka network statement area 1 mein badlo.</p>

<h3>Fault 3: dusre areas mein prefix missing</h3>
<p>Maan lo R1 ke network statements sirf 172.16.1.0 aur 172.16.2.0 cover karte hain. Baaki sab chalta hai, lekin 172.16.3.0/24 ka user backbone se reach nahi hota:</p>
<pre class="out">R3# show ip route ospf
      172.16.0.0/24 is subnetted, 2 subnets
O IA     172.16.1.0 [110/3] via 10.0.23.1, 00:00:10, GigabitEthernet0/0
O IA     172.16.2.0 [110/3] via 10.0.23.1, 00:00:10, GigabitEthernet0/0

R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     1               10.0.12.1/30       1     BDR   1/1
Lo0          1     1               1.1.1.1/32         1     LOOP  0/0
<span class="hl">Lo1          1     1               172.16.1.1/24      1     LOOP  0/0</span>
<span class="hl">Lo2          1     1               172.16.2.1/24      1     LOOP  0/0</span></pre>
<p>(Kuch lines chhaanti gayi hain.) Loopback3 OSPF mein nahi hai: koi statement use match nahi karta. Rule simple hai: <b>agar interface interface brief mein nahi hai, to woh OSPF mein nahi hai</b>, isliye koi LSA use kabhi describe nahi karega. <b>Fix:</b> R1 par <code>network 172.16.3.0 0.0.0.255 area 1</code>.</p>

<h3>Fault 4: summary jo zaroori route chhupa de</h3>
<p>Do variants. Pehle mein, kisi ne mahinon pehle 172.16.3.0/24 ke liye <code>not-advertise</code> use kiya tha:</p>
<pre class="out">R2# show ip ospf | include Area 1|ranges|172.16
        Area ranges are
    Area 1
        Area ranges are
<span class="hl">           172.16.3.0/24 Active(1) DoNotAdvertise</span></pre>
<p>R3 par wahi missing route jaisa fault 3 mein, lekin yahan R1 poori tarah theek hai. ABR par <code>DoNotAdvertise</code> wali range wajah hai. <b>Fix:</b> <code>no area 1 range 172.16.3.0 255.255.255.0 not-advertise</code>.</p>
<p>Doosre variant mein range galat area ke liye type hui, isliye summary banti hi nahi. Yeh chupchaap fault hai: routes bas unsummarised rehte hain.</p>
<pre class="out">R2# show ip ospf | include Area B|Area 1|ranges|172.16
 It is an area border router
    Area BACKBONE(0)
        Area ranges are
<span class="hl">           172.16.0.0/22 Passive Advertise</span>
    Area 1
        Area ranges are</pre>
<p>Range BACKBONE (area 0) ke neeche hai aur status Passive hai, Active nahi, kyunki uske andar area 0 ke koi routes nahi hain, aur area 1 par koi range nahi. R3 ab bhi teeno /24 dekhta hai. <b>Fix:</b> <code>no area 0 range 172.16.0.0 255.255.252.0</code> phir <code>area 1 range 172.16.0.0 255.255.252.0</code>. Number woh area hona chahiye jahan routes <b>rehte</b> hain.</p>

<h3>Fault 5: default route nahi</h3>
<pre class="out">R3# show run | section ospf
router ospf 1
 router-id 3.3.3.3
 network 10.0.23.0 0.0.0.3 area 0
 network 3.3.3.3 0.0.0.0 area 0

R1# show ip route 0.0.0.0
% Network not in table</pre>
<p>R3 par <code>default-information originate</code> line nahi hai, isliye koi type 5 LSA hai hi nahi. Agar line hai lekin ISP ki taraf static default missing hai, to R1 par result wahi hota hai (plain command ko table mein default chahiye). <b>Fix:</b> missing line jodo, ya static route wapas lagao, ya agar sach mein unconditional default chahiye to <code>always</code> jodo.</p>

<div class="eg"><p><b>Worked example, poori kahani.</b> Ticket: 'HQ servers Pune server LAN 172.16.3.0/24 tak nahi pahunch pa rahe. Pune ke baaki LANs theek hain.' Step 1, R3 par: <code>show ip route ospf</code> mein sirf .1.0 aur .2.0 O IA hain. Matlab route R3 tak pahunchne se pehle hi kho gaya. Step 2, R2 (ABR) par: <code>show ip ospf database summary</code> mein 172.16.3.0 yahan bhi nahi. Step 3, R2 par hi: <code>show ip ospf</code> mein <code>172.16.3.0/24 Active(1) DoNotAdvertise</code>. 'Active' batata hai ki route area 1 mein maujood hai, yaani R1 theek hai, aur DoNotAdvertise batata hai ki ABR use chhupa raha hai. Pichhle quarter ka ek change, jo lab LAN ko private rakhne ke liye tha, ab production LAN ko cover kar raha hai. Step 4: not-advertise range hatao. Step 5: R3 par kuch seconds mein 172.16.3.0 O IA dikhta hai. Chaar commands, do routers, aur R1 ko kabhi chhua nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf routing table se troubleshoot karna. ABR ki jagah door ke router se shuru karna, jabki zyadatar inter-area problems ABR par dikhti hain. Ek saath teen cheezein badalna. Ping fail hone par bina return path dekhe OSPF ko dosh dena (hamari lab mein ISP ke paas internal subnets ka route wapas nahi hai, isliye uspar ping isi wajah se fail hota hai).</p></div>

<div class="exam"><p><b>Exam traps.</b> Area ID mismatch matlab koi neighbour nahi. ABR ko asli area 0 link chahiye. <code>area N range</code> mein N woh area hai jo routes ka maalik hai. Jo interface <code>show ip ospf interface brief</code> mein nahi, woh OSPF nahi chala raha.</p></div>

<div class="iv"><p class="q">'Area 1 ke users area 0 ke server tak nahi pahunch pa rahe. Saare OSPF neighbours up hain. Kaise aage badhoge?'</p><p>Strong answer: main route ko hop by hop follow karta hoon. Area 1 ke router par server prefix ke liye <code>show ip route</code>; agar missing hai, to ABR par jaakar backbone link ke liye <code>show ip ospf interface brief</code> aur prefix ke liye <code>show ip ospf database summary</code> dekhta hoon. Phir ranges ya not-advertise ke liye <code>show ip ospf</code>. Agar route dono taraf hai, to return path aur ACLs check karta hoon. Ek samay mein ek cheez badalta hoon aur dobara verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyadatar multi-area faults: area typo, asli area 0 link ke bina ABR, missing network statement, galat area ya not-advertise wali range, aur missing default ya ASBR.</li>
<li>Hamesha pehle link ke dono ends par Area column check karo.</li>
<li>Jo interface <code>show ip ospf interface brief</code> mein nahi hai woh OSPF mein nahi hai.</li>
<li>ABR par jaldi jao: wahan area counts, area ranges aur type 3 LSAs dikhte hain.</li>
</ul></div>
`}};export{e as default};