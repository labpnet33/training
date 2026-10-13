var e={id:`configuring`,h:{en:`Configuring multi-area OSPF: a full two-area build`,hi:`Multi-area OSPF configure karna: poora two-area build`},body:{en:`
<p>Setting up multi-area OSPF is like assigning employees to departments. The command for each person is the same; what matters is writing the correct department name next to each name. In OSPF the department is the <b>area number</b>, and a router becomes an ABR for no other reason than that you wrote two different area numbers on its interfaces. There is no 'make this router an ABR' command.</p>

<h3>Two ways to place an interface in an area</h3>
<div class="tbl"><table>
<tr><th>Method</th><th>Command</th><th>Good for</th></tr>
<tr><td><b>Network statement</b></td><td><code>router ospf 1</code> then <code>network 10.0.12.0 0.0.0.3 area 1</code></td><td>Classic style; one line can cover several interfaces by wildcard</td></tr>
<tr><td><b>Interface command</b></td><td><code>interface Gi0/0</code> then <code>ip ospf 1 area 1</code></td><td>Exact and explicit: you see the area on the interface itself</td></tr>
</table></div>
<p>The network statement is evaluated per interface: if an interface's IP address matches the address and wildcard mask, the interface is placed in that area. The most specific match is used, and the interface's own mask is advertised, not the mask in the statement. The interface command skips the matching logic and wins over any network statement for that interface. It is easier to audit and it is the method many designers prefer for ABRs, because the area is visible exactly where the link is.</p>

<h3>The build</h3>
<p>We build the reference network from chapter 2 from scratch. IP addresses are already configured: R1 has Loopback0 1.1.1.1/32, three LANs on Loopback1 to Loopback3 (172.16.1.1 to 172.16.3.1 /24) and Gi0/0 10.0.12.1/30. R2 has Gi0/0 10.0.12.2/30, Gi0/1 10.0.23.1/30 and Loopback0 2.2.2.2/32. R3 has Gi0/0 10.0.23.2/30, Gi0/1 203.0.113.1/30 to the ISP and Loopback0 3.3.3.3/32.</p>
<p><b>Step 1: R1, internal router in area 1.</b> Set the router ID first. If the process already exists with another ID, IOS asks for a restart, which is why you set it before anything else and clear the process once:</p>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
<span class="c">% OSPF: Reload or use "clear ip ospf process" command, for this to take effect</span>
R1(config-router)# end
R1# clear ip ospf process
R1# configure terminal
R1(config)# router ospf 1
R1(config-router)# passive-interface default
R1(config-router)# no passive-interface GigabitEthernet0/0
R1(config-router)# network 10.0.12.0 0.0.0.3 area 1
R1(config-router)# network 172.16.0.0 0.0.3.255 area 1
R1(config-router)# network 1.1.1.1 0.0.0.0 area 1</pre>
<p>Notice three things. The LANs 172.16.1.0 to 172.16.3.0 fit into one statement with wildcard 0.0.3.255. <code>passive-interface default</code> stops Hellos on every interface, and only the router-facing link is re-enabled, so no hosts or user switches will ever form (or fake) an adjacency. And the loopback is in area 1 because it identifies R1.</p>
<p><b>Step 2: R2, the ABR.</b> This time use the interface method, so each area is visible per link:</p>
<pre class="code">R2(config)# router ospf 1
R2(config-router)# router-id 2.2.2.2
R2(config-router)# interface GigabitEthernet0/0
R2(config-if)# ip ospf 1 area 1
R2(config-if)# interface GigabitEthernet0/1
R2(config-if)# ip ospf 1 area 0
R2(config-if)# interface Loopback0
R2(config-if)# ip ospf 1 area 0</pre>
<p>Here the router ID equals the Loopback0 address that IOS would have chosen anyway, so no restart message appears. Gi0/0 faces area 1; Gi0/1 and the loopback are in area 0. That is the whole definition of an ABR.</p>
<p><b>Step 3: R3, backbone router and ASBR.</b></p>
<pre class="code">R3(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.2
R3(config)# router ospf 1
R3(config-router)# router-id 3.3.3.3
R3(config-router)# network 10.0.23.0 0.0.0.3 area 0
R3(config-router)# network 3.3.3.3 0.0.0.0 area 0
R3(config-router)# default-information originate</pre>
<p>The link to the ISP (203.0.113.0/30) is deliberately not in OSPF: you do not run your IGP towards the provider. R3 sends the default route into OSPF instead. You will study this command in chapter 8.</p>

<h3>Check the result</h3>
<pre class="out">R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:37    10.0.12.1       GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           1   FULL/DR         00:00:31    10.0.23.2       GigabitEthernet0/1</span>

R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
<span class="hl">Gi0/0        1     1               10.0.12.2/30       1     DR    1/1</span>
<span class="hl">Gi0/1        1     0               10.0.23.1/30       1     BDR   1/1</span>
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0</pre>
<p>R2 has two FULL neighbours, one per area, and the Area column shows both areas on one router. The DR/BDR states are the Ethernet defaults you know from the single-area module; on router-to-router links you can set <code>ip ospf network point-to-point</code> as before.</p>
<pre class="out">R1# show ip protocols
Routing Protocol is "ospf 1"
  Router ID 1.1.1.1
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Maximum path: 4
  Routing for Networks:
    10.0.12.0 0.0.0.3 area 1
    172.16.0.0 0.0.3.255 area 1
    1.1.1.1 0.0.0.0 area 1
  Passive Interface(s):
    GigabitEthernet0/1
    GigabitEthernet0/2
    GigabitEthernet0/3
    Loopback0
    Loopback1
    Loopback2
    Loopback3
  Routing Information Sources:
    Gateway         Distance      Last Update
    2.2.2.2              110      00:00:15
  Distance: (default is 110)</pre>
<p>The 'Routing for Networks' list is your network statements, and 'Passive Interface(s)' lists everything silent. Gi0/0 is missing from that list, which is correct: it is the link that speaks OSPF. On R2 the same command prints <code>Routing on Interfaces Configured Explicitly (Area 0)</code> and <code>(Area 1)</code> instead, because R2 used interface commands.</p>

<div class="eg"><p><b>Worked example.</b> A new branch router, BR9, is added in area 1 beside R1. Its uplink is 10.0.19.0/30 to R2 and it owns LAN 172.16.9.0/24. What do you configure? On BR9: a router ID, <code>passive-interface default</code> with <code>no passive-interface</code> on the uplink, <code>network 10.0.19.0 0.0.0.3 area 1</code> and <code>network 172.16.9.0 0.0.0.255 area 1</code>. On R2: the new interface joins area 1 with <code>ip ospf 1 area 1</code>. Nothing changes on R3, which learns 172.16.9.0/24 as a type 3 LSA without any new line. Note that 172.16.9.0/24 is outside the 172.16.0.0/22 you will summarise later, so the summary plan must be updated too.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Setting the router ID after the process has started and forgetting <code>clear ip ospf process</code>: the router keeps an unexpected ID and the neighbour shows a different ID than you planned. Writing the wrong area on one network statement; the link then has a mismatch and no adjacency forms. Using a wildcard mask where a subnet mask is expected (255.255.255.252 instead of 0.0.0.3). Leaving user LAN interfaces active, which sends Hellos to hosts. And mixing methods without noticing: the interface command overrides the network statement, so you may think a statement controls an interface that it does not.</p></div>

<div class="exam"><p><b>Exam traps.</b> The ABR role comes from interfaces in different areas, not from a command. The network statement uses a wildcard mask. The area ID must match on both ends of a link. The router ID is chosen once; changing it needs a process restart. Process ID is local and need not match; the area ID must.</p></div>

<div class="scn"><h4>The summer intern and the area typo</h4><p>An intern added a new branch with a copy of another site's config and changed the interface address but not the area. The branch router came up with 'network 10.0.19.0 0.0.0.3 area 0' while R2's side was in area 1. No adjacency formed. On the branch router <code>show ip ospf interface brief</code> showed the link in area 0, and on R2 it showed area 1. Fixing one line made the neighbour FULL within seconds.</p><p><b>Lesson:</b> when a new link refuses to come up, compare the Area column on both ends before you look at anything else.</p></div>

<div class="iv"><p class="q">'How do you configure a router to be an ABR?'</p><p>Strong answer: there is no ABR command. You place at least one interface in area 0 and another in a different area, using either network statements with area numbers or <code>ip ospf 1 area N</code> on the interfaces. Then <code>show ip ospf</code> shows 'It is an area border router'. I would also set the router ID first, use passive-interface default for user-facing ports, and verify both neighbours with <code>show ip ospf neighbor</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An ABR is any router with interfaces in area 0 and another area: just write the area numbers correctly.</li>
<li>Use network statements (wildcard mask) or <code>ip ospf PID area N</code> on the interface; the interface command wins.</li>
<li>Set the router ID first, or run <code>clear ip ospf process</code>; use passive interfaces on user-facing links.</li>
<li>Verify with <code>show ip ospf neighbor</code>, <code>show ip ospf interface brief</code> (Area column) and <code>show ip protocols</code>.</li>
</ul></div>
`,hi:`
<p>Multi-area OSPF set karna employees ko departments mein assign karne jaisa hai. Har insaan ke liye command same hai; zaroori yeh hai ki har naam ke saamne sahi department ka naam likho. OSPF mein department <b>area number</b> hai, aur router ABR sirf isliye banta hai ki aapne uske interfaces par do alag area numbers likhe. 'Is router ko ABR banao' jaisi koi command nahi hoti.</p>

<h3>Interface ko area mein daalne ke do tareeke</h3>
<div class="tbl"><table>
<tr><th>Tareeka</th><th>Command</th><th>Kiske liye achha</th></tr>
<tr><td><b>Network statement</b></td><td><code>router ospf 1</code> phir <code>network 10.0.12.0 0.0.0.3 area 1</code></td><td>Classic style; ek line wildcard se kai interfaces cover kar sakti hai</td></tr>
<tr><td><b>Interface command</b></td><td><code>interface Gi0/0</code> phir <code>ip ospf 1 area 1</code></td><td>Exact aur explicit: area interface par hi dikhta hai</td></tr>
</table></div>
<p>Network statement har interface par check hota hai: agar interface ka IP address aur wildcard mask match karein, interface us area mein jaata hai. Sabse specific match use hota hai, aur interface ka apna mask advertise hota hai, statement wala nahi. Interface command matching logic skip karta hai aur us interface ke liye kisi bhi network statement par bhaari padta hai. Ise audit karna aasaan hai aur kai designers ABRs ke liye isi tareeke ko pasand karte hain, kyunki area wahin dikhta hai jahan link hai.</p>

<h3>Build</h3>
<p>Hum chapter 2 ka reference network shuru se banate hain. IP addresses pehle se configured hain: R1 par Loopback0 1.1.1.1/32, Loopback1 se Loopback3 par teen LANs (172.16.1.1 se 172.16.3.1 /24) aur Gi0/0 10.0.12.1/30. R2 par Gi0/0 10.0.12.2/30, Gi0/1 10.0.23.1/30 aur Loopback0 2.2.2.2/32. R3 par Gi0/0 10.0.23.2/30, ISP ki taraf Gi0/1 203.0.113.1/30 aur Loopback0 3.3.3.3/32.</p>
<p><b>Step 1: R1, area 1 ka internal router.</b> Router ID pehle set karo. Agar process pehle se kisi aur ID ke saath chal raha ho to IOS restart maangta hai, isliye sabse pehle yeh set karo aur process ek baar clear karo:</p>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
<span class="c">% OSPF: Reload or use "clear ip ospf process" command, for this to take effect</span>
R1(config-router)# end
R1# clear ip ospf process
R1# configure terminal
R1(config)# router ospf 1
R1(config-router)# passive-interface default
R1(config-router)# no passive-interface GigabitEthernet0/0
R1(config-router)# network 10.0.12.0 0.0.0.3 area 1
R1(config-router)# network 172.16.0.0 0.0.3.255 area 1
R1(config-router)# network 1.1.1.1 0.0.0.0 area 1</pre>
<p>Teen cheezein dekho. LANs 172.16.1.0 se 172.16.3.0 wildcard 0.0.3.255 ke saath ek statement mein aa gaye. <code>passive-interface default</code> har interface par Hellos rok deta hai, aur sirf router-facing link wapas enable hota hai, taaki hosts ya user switches kabhi adjacency na bana sakein (ya fake kar sakein). Aur loopback area 1 mein hai kyunki woh R1 ki pehchaan hai.</p>
<p><b>Step 2: R2, ABR.</b> Is baar interface method use karo, taaki har link par area dikhe:</p>
<pre class="code">R2(config)# router ospf 1
R2(config-router)# router-id 2.2.2.2
R2(config-router)# interface GigabitEthernet0/0
R2(config-if)# ip ospf 1 area 1
R2(config-if)# interface GigabitEthernet0/1
R2(config-if)# ip ospf 1 area 0
R2(config-if)# interface Loopback0
R2(config-if)# ip ospf 1 area 0</pre>
<p>Yahan router ID wahi hai jo IOS Loopback0 se khud chun leta, isliye restart ka message nahi aata. Gi0/0 area 1 ki taraf hai; Gi0/1 aur loopback area 0 mein hain. ABR ki poori definition yahi hai.</p>
<p><b>Step 3: R3, backbone router aur ASBR.</b></p>
<pre class="code">R3(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.2
R3(config)# router ospf 1
R3(config-router)# router-id 3.3.3.3
R3(config-router)# network 10.0.23.0 0.0.0.3 area 0
R3(config-router)# network 3.3.3.3 0.0.0.0 area 0
R3(config-router)# default-information originate</pre>
<p>ISP wala link (203.0.113.0/30) jaanbujhkar OSPF mein nahi hai: provider ki taraf apna IGP nahi chalate. R3 uski jagah default route ko OSPF mein bhejta hai. Is command ko chapter 8 mein padhoge.</p>

<h3>Result check karo</h3>
<pre class="out">R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:37    10.0.12.1       GigabitEthernet0/0</span>
<span class="hl">3.3.3.3           1   FULL/DR         00:00:31    10.0.23.2       GigabitEthernet0/1</span>

R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
<span class="hl">Gi0/0        1     1               10.0.12.2/30       1     DR    1/1</span>
<span class="hl">Gi0/1        1     0               10.0.23.1/30       1     BDR   1/1</span>
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0</pre>
<p>R2 ke do FULL neighbours hain, har area mein ek, aur Area column ek hi router par dono areas dikhata hai. DR/BDR states Ethernet ke defaults hain jo aap single-area module se jaante ho; router-to-router links par pehle ki tarah <code>ip ospf network point-to-point</code> set kar sakte ho.</p>
<pre class="out">R1# show ip protocols
Routing Protocol is "ospf 1"
  Router ID 1.1.1.1
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Maximum path: 4
  Routing for Networks:
    10.0.12.0 0.0.0.3 area 1
    172.16.0.0 0.0.3.255 area 1
    1.1.1.1 0.0.0.0 area 1
  Passive Interface(s):
    GigabitEthernet0/1
    GigabitEthernet0/2
    GigabitEthernet0/3
    Loopback0
    Loopback1
    Loopback2
    Loopback3
  Routing Information Sources:
    Gateway         Distance      Last Update
    2.2.2.2              110      00:00:15
  Distance: (default is 110)</pre>
<p>'Routing for Networks' aapke network statements hain, aur 'Passive Interface(s)' woh sab jo chup hain. Gi0/0 us list mein nahi hai, jo sahi hai: wahi link OSPF bolta hai. R2 par yahi command <code>Routing on Interfaces Configured Explicitly (Area 0)</code> aur <code>(Area 1)</code> print karta hai, kyunki R2 ne interface commands use kiye.</p>

<div class="eg"><p><b>Worked example.</b> Area 1 mein R1 ke paas ek naya branch router BR9 jodna hai. Uska uplink R2 ki taraf 10.0.19.0/30 hai aur LAN 172.16.9.0/24 hai. Kya configure karoge? BR9 par: router ID, <code>passive-interface default</code> ke saath uplink par <code>no passive-interface</code>, <code>network 10.0.19.0 0.0.0.3 area 1</code> aur <code>network 172.16.9.0 0.0.0.255 area 1</code>. R2 par: naya interface <code>ip ospf 1 area 1</code> se area 1 mein. R3 par kuch nahi badalta, woh 172.16.9.0/24 ko bina nayi line ke type 3 LSA ke roop mein seekh leta hai. Dhyan do ki 172.16.9.0/24 us 172.16.0.0/22 ke bahar hai jo aage summarise karoge, isliye summary plan bhi update karna padega.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Process shuru hone ke baad router ID set karna aur <code>clear ip ospf process</code> bhool jaana: router anchahi ID rakhta hai aur neighbour woh ID dikhata hai jo aapne plan nahi ki thi. Ek network statement par galat area likhna; link par mismatch ho jaata hai aur adjacency nahi banti. Subnet mask ki jagah wildcard (ya ulta) likhna (0.0.0.3 ki jagah 255.255.255.252). User LAN interfaces ko active chhodna, jisse hosts ko Hellos jaate hain. Aur methods mix karte time dhyan na dena: interface command network statement ko override karta hai, isliye aap soch sakte ho ki statement us interface ko control karta hai jabki nahi karta.</p></div>

<div class="exam"><p><b>Exam traps.</b> ABR ka role alag areas ke interfaces se aata hai, kisi command se nahi. Network statement mein wildcard mask lagta hai. Link ke dono ends par area ID match karna zaroori hai. Router ID ek baar chuni jaati hai; badalne ke liye process restart chahiye. Process ID local hai aur match karna zaroori nahi; area ID zaroori hai.</p></div>

<div class="scn"><h4>Summer intern aur area ka typo</h4><p>Ek intern ne naya branch dusre site ki config copy karke jodha aur interface address badla par area nahi. Branch router 'network 10.0.19.0 0.0.0.3 area 0' ke saath aaya jabki R2 ki taraf area 1 tha. Adjacency nahi bani. Branch router par <code>show ip ospf interface brief</code> mein link area 0 mein dikha, aur R2 par area 1. Ek line theek karte hi neighbour kuch seconds mein FULL ho gaya.</p><p><b>Seekh:</b> naya link up na ho to kuch aur dekhne se pehle dono ends par Area column compare karo.</p></div>

<div class="iv"><p class="q">'Router ko ABR kaise banate ho?'</p><p>Strong answer: ABR ki koi command nahi hoti. Kam se kam ek interface area 0 mein aur ek dusre area mein daalte ho, network statements (area numbers ke saath) ya interface par <code>ip ospf 1 area N</code> se. Phir <code>show ip ospf</code> 'It is an area border router' dikhata hai. Main router ID pehle set karta hoon, user-facing ports ke liye passive-interface default lagata hoon, aur <code>show ip ospf neighbor</code> se dono neighbours verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ABR woh router hai jiske interfaces area 0 aur dusre area mein hain: bas area numbers sahi likho.</li>
<li>Network statements (wildcard mask) ya interface par <code>ip ospf PID area N</code>; interface command jeetta hai.</li>
<li>Router ID pehle set karo, ya <code>clear ip ospf process</code> chalao; user-facing links par passive interfaces rakho.</li>
<li><code>show ip ospf neighbor</code>, <code>show ip ospf interface brief</code> (Area column) aur <code>show ip protocols</code> se verify karo.</li>
</ul></div>
`}};export{e as default};