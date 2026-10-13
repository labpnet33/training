var e=e=>`<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Troubleshooting order"><rect x="10" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">1 PE-CE</text><rect x="135" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="190" y="60" text-anchor="middle" class="svg-ink" font-size="12">2 VPNv4</text><rect x="260" y="30" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="315" y="60" text-anchor="middle" class="svg-ink" font-size="12">3 RT</text><rect x="385" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="440" y="60" text-anchor="middle" class="svg-ink" font-size="12">4 LSP</text><rect x="510" y="30" width="120" height="50" rx="8" fill="#fecaca"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="12">5 Verify</text></svg><p class="cap">`+e+`</p></div>`,t={id:`troubleshooting-workflow`,h:{en:`Troubleshooting an L3VPN: a repeatable order`,hi:`L3VPN troubleshooting: ek repeatable order`},body:{en:`
<p>When site A cannot reach site B, do not guess. Follow the same order every time: start at the customer edge and move toward the core. This chapter uses the real output of lab 2, which contains three faults.</p>

<h3>The five-step order</h3>
<ol>
<li><b>PE-CE</b>: is the CE route in the VRF on the local PE? (<code>show ip route vrf CUST_A</code>, <code>show bgp vpnv4 unicast vrf CUST_A summary</code>)</li>
<li><b>VPNv4 session</b>: is the PE-to-PE session up and receiving prefixes? (<code>show bgp vpnv4 unicast all summary</code>)</li>
<li><b>Export and import RTs</b>: does the remote VRF import the RT that the source exports? (<code>show vrf detail</code>)</li>
<li><b>Data plane</b>: is there an LSP to the remote PE loopback and a label at every hop? (<code>show mpls forwarding-table</code>, <code>traceroute</code>)</li>
<li><b>Verify end to end</b> with <code>ping vrf CUST_A</code> and a label capture.</li>
</ol>
@@D@@

<h3>Fault 1: the wrong import RT</h3>
<pre class="out">PE2# show vrf detail CUST_A
  ...
  Export VPN Route-target Communities
    RT:65000:1
  Import VPN Route-target Communities
    RT:65000:99</pre>
<p>PE2 exports 65000:1 but imports <b>65000:99</b>. PE1's routes arrive but are not imported. Fix: set the import RT to 65000:1 on PE2.</p>

<h3>Fault 2: no extended communities</h3>
<pre class="out">PE1# show bgp vpnv4 unicast all summary
Neighbor        V           AS ...  State/PfxRcd
10.0.255.3      4       65000 ...  1

PE2# show bgp vpnv4 unicast all summary
Neighbor        V           AS ...  State/PfxRcd
10.0.255.1      4       65000 ...  0</pre>
<p>PE1 receives 1 prefix; PE2 receives 0. Asymmetry points at the sender: PE1 is not sending the route correctly. Under address-family vpnv4 on PE1, <code>neighbor 10.0.255.3 send-community extended</code> was missing. After the fix, PE2 shows <code>*&gt;i 172.16.1.0/24 10.0.255.1</code>.</p>

<h3>Fault 3: no LSP on one core link</h3>
<pre class="out">P# show mpls forwarding-table
Local      Outgoing   Prefix           ...  Outgoing   Next Hop
17         No Label   10.0.255.3/32    ...  Gi0/1      10.0.23.3

P# show mpls interfaces
(only GigabitEthernet0/0 is listed)</pre>
<p>The P router has no label for PE2's loopback because LDP is off on Gi0/1 (it has no LDP neighbour toward PE2). The VPN control plane was fine, but the data plane was broken. After enabling LDP autoconfig on Gi0/1:</p>
<pre class="out">P# show mpls forwarding-table
17         Pop Label  10.0.255.3/32    ...  Gi0/1      10.0.23.3

PE1# traceroute 10.0.255.3
  ... [MPLS: Label 17 Exp 0] ...</pre>
<p>The label 17 shows the LSP works again, and the P router pops it as the penultimate hop.</p>

<h3>Rules of thumb</h3>
<ul>
<li>Routes missing on one PE only: check RTs and send-community on the sender.</li>
<li>Routes present in VPNv4 but not in the VRF: import RT.</li>
<li>Routes present in the VRF but ping fails: LSP or return route.</li>
<li>The "No Label" entry on the path to a PE loopback: LDP.</li>
<li>Always test <i>both</i> directions; a missing return route looks like a one-way failure.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> CE1 pings CE2: no reply. Step 1: CE1 route exists on PE1. Step 2: VPNv4 session up, but PE2 PfxRcd is 0. Step 3: RTs match. So the sender must lack extended communities: add send-community extended. Ping still fails. Step 4: P shows No Label for the PE2 loopback: fix LDP. Step 5: ping vrf and traceroute succeed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing several things at once. Checking the global table instead of the VRF. Fixing the VPN layer when the transport layer (LDP) is the real fault.</p></div>
<div class="exam"><p><b>Exam trap.</b> A VPNv4 route can look perfect in the BGP table and still fail in forwarding if the transport LSP to the next hop is missing. Control plane first, then data plane.</p></div>

<div class="scn"><h4>One-way reachability</h4><p>CE1 could reach CE2's LAN but not the reverse. PE2 had the route to CE1's LAN in VPNv4 but not in its VRF. PE2's import RT was wrong. Correcting the import RT restored both directions.</p><p><b>Lesson:</b> RT faults are often asymmetric.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting a broken L3VPN."</p><p>I check the PE-CE route in the local VRF, then the VPNv4 session and prefix counts, then export and import RTs, then the LSP to the remote PE loopback with labels at each hop, and finally ping vrf end to end. I change one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: PE-CE, VPNv4 session, RTs, LSP, verify.</li>
<li>Asymmetric prefix counts point at the sender's configuration.</li>
<li>Wrong import RT: route in VPNv4 but not in the VRF.</li>
<li>No Label to a PE loopback: fix LDP.</li>
<li>Change one thing at a time and re-test.</li>
</ul></div>
`.replace(`@@D@@`,e(`Work from the customer edge toward the core, one layer at a time.`)),hi:`
<p>Jab site A site B tak nahi pahunch paata, andaza mat lagao. Har baar same order follow karo: customer edge se shuru karo aur core ki taraf badho. Yeh chapter lab 2 ka real output use karta hai, jisme teen faults hain.</p>

<h3>Paanch-step order</h3>
<ol>
<li><b>PE-CE</b>: kya CE route local PE ke VRF mein hai? (<code>show ip route vrf CUST_A</code>, <code>show bgp vpnv4 unicast vrf CUST_A summary</code>)</li>
<li><b>VPNv4 session</b>: kya PE-to-PE session up hai aur prefixes receive ho rahe hain? (<code>show bgp vpnv4 unicast all summary</code>)</li>
<li><b>Export aur import RTs</b>: kya remote VRF wahi RT import karta hai jo source export karta hai? (<code>show vrf detail</code>)</li>
<li><b>Data plane</b>: kya remote PE loopback tak LSP hai aur har hop par label hai? (<code>show mpls forwarding-table</code>, <code>traceroute</code>)</li>
<li><b>End to end verify</b> karo <code>ping vrf CUST_A</code> aur label capture se.</li>
</ol>
@@D@@

<h3>Fault 1: galat import RT</h3>
<pre class="out">PE2# show vrf detail CUST_A
  ...
  Export VPN Route-target Communities
    RT:65000:1
  Import VPN Route-target Communities
    RT:65000:99</pre>
<p>PE2 65000:1 export karta hai par <b>65000:99</b> import karta hai. PE1 ke routes aate hain par import nahi hote. Fix: PE2 par import RT 65000:1 karo.</p>

<h3>Fault 2: extended communities nahi</h3>
<pre class="out">PE1# show bgp vpnv4 unicast all summary
Neighbor        V           AS ...  State/PfxRcd
10.0.255.3      4       65000 ...  1

PE2# show bgp vpnv4 unicast all summary
Neighbor        V           AS ...  State/PfxRcd
10.0.255.1      4       65000 ...  0</pre>
<p>PE1 ko 1 prefix milta hai; PE2 ko 0. Asymmetry sender ki taraf ishara karti hai: PE1 route sahi nahi bhej raha. PE1 par address-family vpnv4 ke neeche <code>neighbor 10.0.255.3 send-community extended</code> missing tha. Fix ke baad PE2 <code>*&gt;i 172.16.1.0/24 10.0.255.1</code> dikhata hai.</p>

<h3>Fault 3: ek core link par LSP nahi</h3>
<pre class="out">P# show mpls forwarding-table
Local      Outgoing   Prefix           ...  Outgoing   Next Hop
17         No Label   10.0.255.3/32    ...  Gi0/1      10.0.23.3

P# show mpls interfaces
(only GigabitEthernet0/0 is listed)</pre>
<p>P router ke paas PE2 ke loopback ka label nahi hai kyunki Gi0/1 par LDP off hai (PE2 ki taraf koi LDP neighbour nahi). VPN control plane theek tha, par data plane toota tha. Gi0/1 par LDP autoconfig enable karne ke baad:</p>
<pre class="out">P# show mpls forwarding-table
17         Pop Label  10.0.255.3/32    ...  Gi0/1      10.0.23.3

PE1# traceroute 10.0.255.3
  ... [MPLS: Label 17 Exp 0] ...</pre>
<p>Label 17 dikhata hai ki LSP wapas kaam kar raha hai, aur P router penultimate hop ke naate use pop karta hai.</p>

<h3>Rules of thumb</h3>
<ul>
<li>Routes sirf ek PE par missing: sender par RTs aur send-community check karo.</li>
<li>Routes VPNv4 mein hain par VRF mein nahi: import RT.</li>
<li>Routes VRF mein hain par ping fail: LSP ya return route.</li>
<li>PE loopback ke raaste par "No Label": LDP.</li>
<li>Hamesha <i>dono</i> directions test karo; missing return route one-way failure jaisa dikhta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> CE1 CE2 ko ping karta hai: reply nahi. Step 1: PE1 par CE1 route hai. Step 2: VPNv4 session up, par PE2 PfxRcd 0. Step 3: RTs match. To sender ke paas extended communities nahi: send-community extended jodo. Ping ab bhi fail. Step 4: P PE2 loopback ke liye No Label dikhata hai: LDP fix karo. Step 5: ping vrf aur traceroute safal.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek saath kai cheezein badalna. VRF ke bajaye global table check karna. Jab transport layer (LDP) asli fault ho, tab VPN layer fix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> VPNv4 route BGP table mein perfect dikh sakta hai aur phir bhi forwarding mein fail ho sakta hai agar next hop tak transport LSP missing ho. Pehle control plane, phir data plane.</p></div>

<div class="scn"><h4>One-way reachability</h4><p>CE1 CE2 ki LAN tak pahunch gaya par ulta nahi. PE2 ke paas CE1 ki LAN ka route VPNv4 mein tha par VRF mein nahi. PE2 ka import RT galat tha. Import RT sahi karne se dono directions wapas aa gayi.</p><p><b>Lesson:</b> RT faults aksar asymmetric hote hain.</p></div>

<div class="iv"><p class="q">"Toote hue L3VPN ko troubleshoot kaise karoge?"</p><p>Pehle local VRF mein PE-CE route, phir VPNv4 session aur prefix counts, phir export aur import RTs, phir remote PE loopback tak LSP har hop par labels ke saath, aur aakhir mein ping vrf end to end. Ek baar mein ek hi cheez badalta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: PE-CE, VPNv4 session, RTs, LSP, verify.</li>
<li>Asymmetric prefix counts sender ki configuration ki taraf ishara karte hain.</li>
<li>Galat import RT: route VPNv4 mein par VRF mein nahi.</li>
<li>PE loopback par No Label: LDP fix karo.</li>
<li>Ek baar mein ek change aur re-test.</li>
</ul></div>
`.replace(`@@D@@`,e(`Customer edge se core ki taraf, ek layer ek baar mein.`))}};export{t as default};