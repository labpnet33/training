var e={id:`vrf-rd-rt`,h:{en:`VRF, route distinguisher and route target`,hi:`VRF, route distinguisher aur route target`},body:{en:`
<p>A large office building has one lobby, but each company on the upper floors has its own locked door and its own mailbox list. The VRF is the locked door. The RD is the unique mailbox number. The RT is the notice board that decides which floors may read which notices.</p>

<h3>VRF configuration on PE1</h3>
<pre class="code"><span class="c">! define the VRF</span>
vrf definition CUST_A
 rd 65000:1
 address-family ipv4
  route-target export 65000:1
  route-target import 65000:1
 exit-address-family
<span class="c">! put the customer-facing interface in the VRF</span>
interface GigabitEthernet0/3
 vrf forwarding CUST_A
 ip address 192.168.1.1 255.255.255.0
 no shutdown</pre>
<p>Notice the order: apply <code>vrf forwarding</code> first and the address second. Putting an interface into a VRF removes its IP address, so a late <code>vrf forwarding</code> silently wipes your configuration.</p>

<h3>Three jobs, three objects</h3>
<table class="cmp"><tr><th>Object</th><th>Job</th><th>Common failure</th></tr>
<tr><td>VRF</td><td>Separate routing table per customer</td><td>Interface not in the VRF</td></tr>
<tr><td>RD</td><td>Makes prefixes unique in BGP</td><td>Reused by two customers (usually harmless)</td></tr>
<tr><td>RT</td><td>Decides import and export</td><td>Typo; extended community not sent</td></tr></table>

<h3>Seeing it work</h3>
<pre class="out">PE1# show ip route vrf CUST_A
C  192.168.1.0/24 is directly connected, GigabitEthernet0/3
B  172.16.1.0/24 [20/0] via 192.168.1.2
<span class="hl">B  172.16.2.0/24 [200/0] via 10.0.255.5</span></pre>
<p>The highlighted line is the proof: a route in the customer VRF whose next hop is the other PE loopback. If it is missing, the VPN control plane has failed somewhere before this point.</p>

<h3>Designing RTs</h3>
<p>One RT used for both import and export gives an any-to-any full mesh, which is what our labs use. Different import and export values give hub-and-spoke, where spokes only learn the hub. Always write the design down before you type a single route-target line.</p>

<div class="eg"><b>Worked example.</b> Customer Bharat Retail also uses 172.16.1.0/24, in VRF CUST_B with RD and RT 65000:2. In BGP the two routes are 65000:1:172.16.1.0/24 and 65000:2:172.16.1.0/24, different keys, so they never clash. CUST_A imports only RT 65000:1, so Bharat's routes never enter it.</div>

<div class="warn"><b>Common mistake.</b> Typing an import value that differs from the exporting side, for example 65000:99 instead of 65000:1. The BGP session stays up and routes arrive, but the VRF imports none of them.</div>

<div class="exam"><b>Exam trap.</b> The RD does not need to match between PEs. The RT does. A different RD per PE is actually good practice for faster convergence with multiple paths.</div>

<div class="scn"><h4>The typo that hid for a week</h4><p>A VPN worked for nine sites and failed for the tenth. All sessions were up. The engineer diffed the VRF configurations and found the tenth site imported 65000:11. One digit; after the fix the routes appeared in seconds.</p><p><b>Lesson:</b> diff against a working site before reading any manual.</p></div>

<div class="iv"><p class="q">"Can two PEs have different RDs for the same VRF?"</p><p>Yes. The RD is locally significant to the route's uniqueness; the RT must agree between exporter and importer. Mention the multi-path convergence benefit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRF separates, RD uniquifies, RT controls import and export.</li>
<li>Put the interface in the VRF before configuring its address.</li>
<li>Check the remote route in <code>show ip route vrf</code>.</li>
<li>RT mismatch is silent: sessions stay up.</li>
</ul></div>
`,hi:`
<p>Ek bade office building mein lobby ek hoti hai, par upar ki har company ka apna locked darwaza aur apni mailbox list hoti hai. VRF locked darwaza hai. RD unique mailbox number hai. RT woh notice board hai jo tay karta hai kaunsi manzil kaunse notice padh sakti hai.</p>

<h3>PE1 par VRF configuration</h3>
<pre class="code"><span class="c">! VRF define karo</span>
vrf definition CUST_A
 rd 65000:1
 address-family ipv4
  route-target export 65000:1
  route-target import 65000:1
 exit-address-family
<span class="c">! customer-facing interface ko VRF mein daalo</span>
interface GigabitEthernet0/3
 vrf forwarding CUST_A
 ip address 192.168.1.1 255.255.255.0
 no shutdown</pre>
<p>Order dekho: pehle <code>vrf forwarding</code>, phir address. Interface ko VRF mein daalne se uska IP address hat jaata hai, isliye der se lagaya <code>vrf forwarding</code> chupchaap aapki configuration mita deta hai.</p>

<h3>Teen kaam, teen objects</h3>
<table class="cmp"><tr><th>Object</th><th>Kaam</th><th>Aam failure</th></tr>
<tr><td>VRF</td><td>Har customer ka alag routing table</td><td>Interface VRF mein nahi</td></tr>
<tr><td>RD</td><td>BGP mein prefixes unique banata hai</td><td>Do customers ne reuse kiya (aam taur par harmless)</td></tr>
<tr><td>RT</td><td>Import aur export tay karta hai</td><td>Typo; extended community nahi bheji</td></tr></table>

<h3>Kaam karta hua dekhna</h3>
<pre class="out">PE1# show ip route vrf CUST_A
C  192.168.1.0/24 is directly connected, GigabitEthernet0/3
B  172.16.1.0/24 [20/0] via 192.168.1.2
<span class="hl">B  172.16.2.0/24 [200/0] via 10.0.255.5</span></pre>
<p>Highlighted line saboot hai: customer VRF mein ek route jiska next hop doosre PE ka loopback hai. Agar yeh nahi hai to VPN control plane isse pehle kahin fail hua hai.</p>

<h3>RTs design karna</h3>
<p>Import aur export dono ke liye ek hi RT any-to-any full mesh deta hai, jo hamare labs use karte hain. Import aur export ke alag values hub-and-spoke dete hain, jahan spokes sirf hub seekhte hain. Ek bhi route-target line type karne se pehle design likh lo.</p>

<div class="eg"><b>Worked example.</b> Customer Bharat Retail bhi 172.16.1.0/24 use karta hai, VRF CUST_B mein RD aur RT 65000:2 ke saath. BGP mein dono routes 65000:1:172.16.1.0/24 aur 65000:2:172.16.1.0/24 hain, alag keys, isliye kabhi takraate nahi. CUST_A sirf RT 65000:1 import karta hai, isliye Bharat ke routes use mein kabhi nahi aate.</div>

<div class="warn"><b>Common mistake.</b> Exporting side se alag import value type karna, jaise 65000:1 ki jagah 65000:99. BGP session up rehta hai aur routes aate hain, par VRF unme se kuch import nahi karta.</div>

<div class="exam"><b>Exam trap.</b> PEs ke beech RD match hona zaroori nahi. RT match hona zaroori hai. Har PE par alag RD asal mein multiple paths ke saath tez convergence ke liye achhi practice hai.</div>

<div class="scn"><h4>Woh typo jo ek hafte chhupa raha</h4><p>VPN nau sites ke liye chala aur dasvi ke liye fail hua. Sab sessions up the. Engineer ne VRF configurations diff kiye aur dekha ki dasvi site 65000:11 import karti thi. Ek digit; fix ke baad routes seconds mein aa gaye.</p><p><b>Lesson:</b> manual padhne se pehle working site se diff karo.</p></div>

<div class="iv"><p class="q">"Kya do PEs ke same VRF ke liye alag RD ho sakte hain?"</p><p>Haan. RD route ki uniqueness ke liye locally significant hai; RT exporter aur importer ke beech agree hona chahiye. Multi-path convergence ka faayda batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRF alag karta hai, RD unique banata hai, RT import aur export control karta hai.</li>
<li>Address se pehle interface ko VRF mein daalo.</li>
<li>Remote route <code>show ip route vrf</code> mein check karo.</li>
<li>RT mismatch silent hai: sessions up rehte hain.</li>
</ul></div>
`}};export{e as default};