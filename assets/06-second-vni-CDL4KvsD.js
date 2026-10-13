var e={id:`second-vni`,h:{en:`Adding a second VNI and reading the control and data plane`,hi:`Doosra VNI jodna aur control aur data plane padhna`},body:{en:`
<p>The second lab starts from a working fabric in the Pune pod (pod 40, AS 65040). VLAN V10 is already stretched as VNI 1010. The lab team needs VLAN V20 as VNI 1020 for PC3 and PC4 on ge-0/0/3 of each leaf, and the security team wants VNI 1020 to have its own route target. Adding a VNI is a routine job, and it is the best place to learn how to read the evidence that EVPN gives you.</p>

<h3>Adding the VNI</h3>
<p>The same four lines go on both leaves:</p>
<pre class="code"><span class="c"># on LEAF1 and LEAF2</span>
set vlans V20 vlan-id 20
set vlans V20 vxlan vni 1020
set protocols evpn extended-vni-list 1020
set interfaces ge-0/0/3 unit 0 family ethernet-switching vlan members V20
commit</pre>
<p><code>extended-vni-list 1020</code> adds to the existing list; the result is <code>[ 1010 1020 ]</code>. If you forget it on one leaf, EVPN shows you exactly what happened. Here is LEAF1 when only LEAF2 had the list updated:</p>
<pre class="out">lab@LEAF1&gt; show evpn instance extensive
...
  Number of bridge domains: 1
    VLAN  Domain-ID Intfs/up    IRB-intf  Mode             MAC-sync  IM-label  MAC-label
    10    1010      1  1                  Extended         Enabled   1010      
  <span class="hl">VNIs not in extended-vni-list (not advertised): 1020</span>
  Number of neighbors: 1
    Address               MAC    MAC+IP        AD        IM        ES Leaf-label
    10.40.255.12            2         1         0         2         0

lab@LEAF1&gt; show route table bgp.evpn.0 match-prefix 3:*
3:10.40.255.11:1::1010::10.40.255.11/248 IM
3:10.40.255.12:1::1010::10.40.255.12/248 IM
3:10.40.255.12:1::1020::10.40.255.12/248 IM</pre>
<p>(Output shortened.) Two clues: the line "VNIs not in extended-vni-list (not advertised): 1020", and only <b>three</b> type-3 routes. LEAF1 receives LEAF2's route for 1020 but has no VNI 1020 of its own, so there is no remote VTEP for 1020 and PC3 cannot reach PC4. After adding the list on LEAF1 the picture is complete:</p>
<pre class="out">lab@LEAF1&gt; show evpn instance extensive
  Number of bridge domains: 2
    VLAN  Domain-ID Intfs/up    IRB-intf  Mode             MAC-sync  IM-label  MAC-label
    10    1010      1  1                  Extended         Enabled   1010      
    <span class="hl">20    1020      1  1                  Extended         Enabled   1020      </span>

lab@LEAF1&gt; show ethernet-switching vxlan-tunnel-end-point remote
 RVTEP-IP         IFL-Idx   Interface    NH-Id   RVTEP-Mode  Flags
 10.40.255.12     546       vtep.32769   1740    RNVE        
    VNID          MC-Group-IP
    1010          0.0.0.0
    <span class="hl">1020          0.0.0.0</span></pre>
<p>Two bridge domains, and the remote VTEP now lists both VNIs. The count of type-3 routes is <b>four</b>: one per VNI per leaf (2 VNIs x 2 leaves). This is the lab question "how many IM routes does LEAF1 hold".</p>

<h3>The data plane evidence</h3>
<p>Once PC1 has pinged PC2, three tables agree:</p>
<pre class="out">lab@LEAF1&gt; show ethernet-switching table
Ethernet switching table : 2 entries, 2 learned
Routing instance : default-switch
   Vlan                MAC                 MAC      Logical                SVLBNH/      Active
   name                address             flags    interface              VENH Index   source
   V10                 00:50:7f:06:6d:01   D        ge-0/0/2.0
   V10                 00:50:80:06:6e:01   <span class="hl">DR       vtep.32769                          10.40.255.12</span>

lab@LEAF1&gt; show evpn database
Instance: default-switch
VLAN  DomainId  MAC address        Active source                  Timestamp        IP address
      1010      00:50:7f:06:6d:01  ge-0/0/2.0                     Oct  1 23:49:02  10.40.10.21
      1010      00:50:80:06:6e:01  <span class="hl">10.40.255.12</span>                  Oct  1 23:48:51  10.40.10.22</pre>
<p>(The timestamps are the time of the lab run.) PC1's MAC is local, learned dynamically (flag <code>D</code>) on <code>ge-0/0/2.0</code>. PC2's MAC has the flags <code>DR</code>: dynamic and <b>R</b>emote, installed from a type-2 route, pointing at the tunnel interface <code>vtep.32769</code> whose far end is 10.40.255.12. The EVPN database shows the same MAC with the <i>active source</i> being the remote VTEP address. Answer to the lab question: the active source of PC2's MAC is the loopback of LEAF2.</p>

<h3>A dedicated route target for VNI 1020</h3>
<p>Without special configuration, every VNI uses the instance-wide <code>vrf-target</code> (target:65040:1). To give VNI 1020 its own target use <code>vni-options</code> on <b>both</b> leaves:</p>
<pre class="code">set protocols evpn vni-options vni 1020 vrf-target target:65040:1020
commit</pre>
<pre class="out">lab@LEAF1&gt; show route table bgp.evpn.0 match-prefix 3:* extensive
3:10.40.255.11:1::1010::10.40.255.11/248 IM (1 entry, 1 announced)
                Communities: target:65040:1 encapsulation:vxlan(0x8)
                PMSI: Flags 0x0: Label 1010: Type INGRESS-REPLICATION 10.40.255.11
3:10.40.255.11:1::1020::10.40.255.11/248 IM (1 entry, 1 announced)
                <span class="hl">Communities: target:65040:1020 encapsulation:vxlan(0x8)</span>
                PMSI: Flags 0x0: Label 1020: Type INGRESS-REPLICATION 10.40.255.11
3:10.40.255.12:1::1020::10.40.255.12/248 IM (1 entry, 1 announced)
                Communities: target:65040:1020 encapsulation:vxlan(0x8)
                Import Accepted</pre>
<p>(Fields trimmed.) VNI 1010 keeps the instance target; VNI 1020 now carries <code>target:65040:1020</code>. Because LEAF2 has the same override, it still imports LEAF1's routes and PC3 can still ping PC4. If only one leaf were changed, the two sides would advertise different targets for VNI 1020, import would fail, and the tunnel for that VNI would disappear. That is why a per-VNI target must always be changed on every leaf serving that VNI.</p>

<div class="eg"><p><b>Worked example.</b> PC3 (10.40.20.31) pings PC4 (10.40.20.32). LEAF1 learns PC3's MAC on ge-0/0/3.0 in VLAN V20 and advertises a type-2 route with RD 10.40.255.11:1, VNI label 1020 and the 1020 target. LEAF2 learns PC4, advertises its own. Each leaf installs the other's MAC with flag <code>DR</code> on <code>vtep.32769</code>. The ARP request itself was replicated using the type-3 route for VNI 1020. Meanwhile V10 hosts continue to work, because its routes were not touched.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) VNI mapped but not in <code>extended-vni-list</code> on one leaf. (2) Changing the route target on one leaf only. (3) Forgetting to place the access port in the new VLAN. (4) Overwriting the list with <code>set</code> mistakenly; remember <code>set extended-vni-list 1020</code> adds, while <code>delete</code> then <code>set</code> replaces.</p></div>
<div class="exam"><p><b>Exam trap.</b> A remote MAC in <code>show ethernet-switching table</code> points to a <code>vtep.327xx</code> interface and has the <code>R</code> flag. The next hop of a type-2 route is the VTEP, never the host IP.</p></div>

<div class="scn"><h4>The VLAN that stayed local</h4><p>The lab team's VLAN V20 worked inside each rack but not between racks. The BGP sessions were up and VNI 1010 was healthy. <code>show evpn instance extensive</code> on one leaf printed "VNIs not in extended-vni-list (not advertised): 1020". Adding 1020 to the list created the type-3 route, the far leaf installed the tunnel, and the racks could talk.</p><p><b>Lesson:</b> a VNI that exists under <code>vlans</code> but not in the list is silently local. The instance summary tells you so.</p></div>

<div class="iv"><p class="q">"How do you confirm that a remote MAC was learned through EVPN?"</p><p>I check <code>show ethernet-switching table</code> for the MAC with flag DR on a vtep interface, then <code>show evpn database</code> for the active source (the remote VTEP address), and finally the type-2 route in <code>bgp.evpn.0</code> with <code>match-prefix 2:*</code> to see the RD, VNI label, route target and next hop. Consistent answers in the three places prove the control plane and the forwarding entry agree.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A new VNI needs the VLAN mapping, an entry in <code>extended-vni-list</code> and the access port.</li>
<li><code>show evpn instance extensive</code> reports VNIs that are not advertised.</li>
<li>One type-3 route per VNI per leaf: two leaves and two VNIs give four.</li>
<li>Remote MACs show flag DR on <code>vtep.327xx</code>; <code>show evpn database</code> gives the VTEP address.</li>
<li>Per-VNI route targets via <code>vni-options</code> must be identical on every leaf serving the VNI.</li>
</ul></div>
`,hi:`
<p>Doosra lab Pune pod (pod 40, AS 65040) ke chalte hue fabric se shuru hota hai. VLAN V10 pehle se VNI 1010 ki tarah stretched hai. Lab team ko har leaf ke ge-0/0/3 par PC3 aur PC4 ke liye VLAN V20 ko VNI 1020 ki tarah chahiye, aur security team chahti hai ki VNI 1020 ka apna route target ho. VNI jodna routine kaam hai, aur EVPN jo saboot deta hai use padhna seekhne ki yeh sabse achi jagah hai.</p>

<h3>VNI jodna</h3>
<p>Wahi chaar lines dono leaves par jaati hain:</p>
<pre class="code"><span class="c"># LEAF1 aur LEAF2 dono par</span>
set vlans V20 vlan-id 20
set vlans V20 vxlan vni 1020
set protocols evpn extended-vni-list 1020
set interfaces ge-0/0/3 unit 0 family ethernet-switching vlan members V20
commit</pre>
<p><code>extended-vni-list 1020</code> maujooda list mein jodta hai; nateeja <code>[ 1010 1020 ]</code> hota hai. Ek leaf par bhool gaye to EVPN bilkul dikha deta hai ki kya hua. Yeh LEAF1 hai jab sirf LEAF2 par list update hui thi:</p>
<pre class="out">lab@LEAF1&gt; show evpn instance extensive
...
  Number of bridge domains: 1
    VLAN  Domain-ID Intfs/up    IRB-intf  Mode             MAC-sync  IM-label  MAC-label
    10    1010      1  1                  Extended         Enabled   1010      
  <span class="hl">VNIs not in extended-vni-list (not advertised): 1020</span>
  Number of neighbors: 1
    Address               MAC    MAC+IP        AD        IM        ES Leaf-label
    10.40.255.12            2         1         0         2         0

lab@LEAF1&gt; show route table bgp.evpn.0 match-prefix 3:*
3:10.40.255.11:1::1010::10.40.255.11/248 IM
3:10.40.255.12:1::1010::10.40.255.12/248 IM
3:10.40.255.12:1::1020::10.40.255.12/248 IM</pre>
<p>(Output chhota kiya gaya.) Do clue: line "VNIs not in extended-vni-list (not advertised): 1020", aur sirf <b>teen</b> type-3 routes. LEAF1 ko LEAF2 ka 1020 ka route milta hai lekin uska apna VNI 1020 nahi hai, isliye 1020 ka koi remote VTEP nahi banta aur PC3, PC4 tak nahi pahunch pata. LEAF1 par list jodne ke baad tasveer poori ho jaati hai:</p>
<pre class="out">lab@LEAF1&gt; show evpn instance extensive
  Number of bridge domains: 2
    VLAN  Domain-ID Intfs/up    IRB-intf  Mode             MAC-sync  IM-label  MAC-label
    10    1010      1  1                  Extended         Enabled   1010      
    <span class="hl">20    1020      1  1                  Extended         Enabled   1020      </span>

lab@LEAF1&gt; show ethernet-switching vxlan-tunnel-end-point remote
 RVTEP-IP         IFL-Idx   Interface    NH-Id   RVTEP-Mode  Flags
 10.40.255.12     546       vtep.32769   1740    RNVE        
    VNID          MC-Group-IP
    1010          0.0.0.0
    <span class="hl">1020          0.0.0.0</span></pre>
<p>Do bridge domains, aur remote VTEP ab dono VNIs list karta hai. Type-3 routes ki ginti <b>chaar</b> hai: har leaf ka har VNI ke liye ek (2 VNIs x 2 leaves). Lab ka sawaal "LEAF1 ke paas kitne IM routes hain" yahi hai.</p>

<h3>Data plane ka saboot</h3>
<p>PC1 ke PC2 ko ping karne ke baad teen tables ek jaisa batati hain:</p>
<pre class="out">lab@LEAF1&gt; show ethernet-switching table
Ethernet switching table : 2 entries, 2 learned
Routing instance : default-switch
   Vlan                MAC                 MAC      Logical                SVLBNH/      Active
   name                address             flags    interface              VENH Index   source
   V10                 00:50:7f:06:6d:01   D        ge-0/0/2.0
   V10                 00:50:80:06:6e:01   <span class="hl">DR       vtep.32769                          10.40.255.12</span>

lab@LEAF1&gt; show evpn database
Instance: default-switch
VLAN  DomainId  MAC address        Active source                  Timestamp        IP address
      1010      00:50:7f:06:6d:01  ge-0/0/2.0                     Oct  1 23:49:02  10.40.10.21
      1010      00:50:80:06:6e:01  <span class="hl">10.40.255.12</span>                  Oct  1 23:48:51  10.40.10.22</pre>
<p>(Timestamps lab run ke time ke hain.) PC1 ka MAC local hai, <code>ge-0/0/2.0</code> par dynamically seekha (flag <code>D</code>). PC2 ke MAC par flags <code>DR</code> hain: dynamic aur <b>R</b>emote, type-2 route se install hua, tunnel interface <code>vtep.32769</code> ki taraf point karta hai jiska doosra sira 10.40.255.12 hai. EVPN database wahi MAC dikhata hai jiska <i>active source</i> remote VTEP address hai. Lab sawaal ka jawab: PC2 ke MAC ka active source LEAF2 ka loopback hai.</p>

<h3>VNI 1020 ke liye dedicated route target</h3>
<p>Khaas configuration ke bina har VNI poore instance ka <code>vrf-target</code> (target:65040:1) use karta hai. VNI 1020 ko apna target dene ke liye <b>dono</b> leaves par <code>vni-options</code> use karo:</p>
<pre class="code">set protocols evpn vni-options vni 1020 vrf-target target:65040:1020
commit</pre>
<pre class="out">lab@LEAF1&gt; show route table bgp.evpn.0 match-prefix 3:* extensive
3:10.40.255.11:1::1010::10.40.255.11/248 IM (1 entry, 1 announced)
                Communities: target:65040:1 encapsulation:vxlan(0x8)
                PMSI: Flags 0x0: Label 1010: Type INGRESS-REPLICATION 10.40.255.11
3:10.40.255.11:1::1020::10.40.255.11/248 IM (1 entry, 1 announced)
                <span class="hl">Communities: target:65040:1020 encapsulation:vxlan(0x8)</span>
                PMSI: Flags 0x0: Label 1020: Type INGRESS-REPLICATION 10.40.255.11
3:10.40.255.12:1::1020::10.40.255.12/248 IM (1 entry, 1 announced)
                Communities: target:65040:1020 encapsulation:vxlan(0x8)
                Import Accepted</pre>
<p>(Fields trim kiye gaye.) VNI 1010 instance target rakhta hai; VNI 1020 ab <code>target:65040:1020</code> le jaata hai. LEAF2 par bhi wahi override hai, isliye woh ab bhi LEAF1 ke routes import karta hai aur PC3 abhi bhi PC4 ko ping kar sakta hai. Sirf ek leaf badla hota to dono side VNI 1020 ke liye alag targets advertise karte, import fail hota aur us VNI ka tunnel gayab ho jaata. Isi liye per-VNI target hamesha us VNI ko serve karne wale har leaf par badlo.</p>

<div class="eg"><p><b>Worked example.</b> PC3 (10.40.20.31) PC4 (10.40.20.32) ko ping karta hai. LEAF1 PC3 ka MAC VLAN V20 mein ge-0/0/3.0 par seekhta hai aur RD 10.40.255.11:1, VNI label 1020 aur 1020 target ke saath type-2 route advertise karta hai. LEAF2 PC4 ko seekh kar apna advertise karta hai. Har leaf doosre ka MAC <code>vtep.32769</code> par flag <code>DR</code> ke saath install karta hai. ARP request khud VNI 1020 ke type-3 route se replicate hua tha. Is dauran V10 hosts chalte rehte hain, kyunki uske routes ko chhua hi nahi gaya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) VNI mapped hai lekin ek leaf par <code>extended-vni-list</code> mein nahi. (2) Sirf ek leaf par route target badalna. (3) Access port ko naye VLAN mein rakhna bhool jaana. (4) Galti se <code>set</code> se list overwrite samajhna; yaad rakho <code>set extended-vni-list 1020</code> jodta hai, jabki <code>delete</code> phir <code>set</code> replace karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show ethernet-switching table</code> mein remote MAC <code>vtep.327xx</code> interface par aur <code>R</code> flag ke saath hota hai. Type-2 route ka next hop VTEP hota hai, host IP kabhi nahi.</p></div>

<div class="scn"><h4>Woh VLAN jo local reh gaya</h4><p>Lab team ka VLAN V20 har rack ke andar chalta tha lekin racks ke beech nahi. BGP sessions up the aur VNI 1010 theek tha. Ek leaf par <code>show evpn instance extensive</code> ne "VNIs not in extended-vni-list (not advertised): 1020" print kiya. List mein 1020 jodne se type-3 route bana, door wale leaf ne tunnel install kiya, aur racks baat karne lage.</p><p><b>Lesson:</b> jo VNI <code>vlans</code> ke neeche hai lekin list mein nahi, woh chupchaap local rehta hai. Instance summary yeh batati hai.</p></div>

<div class="iv"><p class="q">"Kaise confirm karoge ki remote MAC EVPN se seekha gaya?"</p><p>Main <code>show ethernet-switching table</code> mein MAC ko vtep interface par DR flag ke saath dekhta hoon, phir <code>show evpn database</code> se active source (remote VTEP address), aur aakhir mein <code>bgp.evpn.0</code> mein <code>match-prefix 2:*</code> se type-2 route dekhta hoon: RD, VNI label, route target aur next hop. Teeno jagah ek jaise jawab saabit karte hain ki control plane aur forwarding entry agree karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Naye VNI ko VLAN mapping, <code>extended-vni-list</code> mein entry aur access port chahiye.</li>
<li><code>show evpn instance extensive</code> unn VNIs ko report karta hai jo advertise nahi ho rahe.</li>
<li>Har VNI ka har leaf ke liye ek type-3 route: do leaves aur do VNIs se chaar.</li>
<li>Remote MACs <code>vtep.327xx</code> par flag DR dikhate hain; <code>show evpn database</code> VTEP address deta hai.</li>
<li><code>vni-options</code> se per-VNI route targets us VNI ko serve karne wale har leaf par ek jaise hone chahiye.</li>
</ul></div>
`}};export{e as default};