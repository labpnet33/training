var e={id:`troubleshooting-subinterfaces`,h:{en:`Troubleshooting subinterfaces`,hi:`Subinterfaces ki troubleshooting`},body:{en:`
<p><b>Analogy: a post office with numbered pigeonholes.</b> The trunk is the mail van; each tag is a pigeonhole number. If a letter is stamped 20 but your pigeonhole is numbered 30, it is not lost, it is simply never delivered to you. Most subinterface faults are a number that does not match, or a pigeonhole with no owner.</p>

<h3>A repeatable method</h3>
<ol>
<li><b>Layer 2:</b> does the switch trunk carry the VLAN? (<code>show interfaces trunk</code> on the switch.)</li>
<li><b>Tag:</b> does the subinterface tag equal the VLAN ID? (<code>show interface all</code>.)</li>
<li><b>Zone and router:</b> does the subinterface have a zone and a virtual router?</li>
<li><b>Policy:</b> does a rule exist between the zones? (<code>test security-policy-match</code>.)</li>
<li><b>Traffic:</b> from a host, then <code>show session all</code> and <code>show log traffic</code>.</li>
</ol>

<h3>Fault 1: tag mismatch</h3>
<p>Someone "tidies" the servers subinterface to tag 30 while the switch still uses VLAN 20. The commit succeeds, because 30 is a perfectly legal tag. The interface table is the evidence:</p>
<pre class="out">admin@NK-PA&gt; show interface all
name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/2         17    1    native           vr:default               0      10.10.99.1/24
ethernet1/2.10      18    1    users            vr:default               10     10.10.10.1/24
<span class="hl">ethernet1/2.20      19    1    servers          vr:default               30     10.10.20.1/24</span>
(other rows removed)</pre>
<p>The name still says .20 but the tag says 30. The effect from a host:</p>
<pre class="out">PC10&gt; ping 10.10.20.50
10.10.20.50 icmp_seq=1 timeout
10.10.20.50 icmp_seq=2 timeout
10.10.20.50 icmp_seq=3 timeout
10.10.20.50 icmp_seq=4 timeout
10.10.20.50 icmp_seq=5 timeout</pre>
<p>Fix: set the tag back to the VLAN ID and commit. The ping then returns with TTL 63 again:</p>
<pre class="code">set network interface ethernet ethernet1/2 layer3 units ethernet1/2.20 tag 20
commit</pre>
<p>Good practice: make the unit number equal to the tag (ethernet1/2.20 for tag 20). Then a mismatch is visible at a glance, as here.</p>

<h3>Fault 2: the native VLAN</h3>
<p>Untagged frames on the trunk are the native VLAN (here VLAN 99 on the switch). They arrive on the <b>parent</b> interface, not on any subinterface. If the parent has an IP, zone and virtual router, it serves that untagged network:</p>
<pre class="out">name                id    vsys zone             forwarding               tag    address
ethernet1/2         17    1    native           vr:default               0      10.10.99.1/24
ethernet1/2.10      18    1    users            vr:default               10     10.10.10.1/24
ethernet1/2.20      19    1    servers          vr:default               20     10.10.20.1/24

PC99&gt; ping 10.10.99.1
84 bytes from 10.10.99.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>This works, but it mixes tagged and untagged networks on one port, which is hard to audit. Many designs avoid it: use a dedicated unused native VLAN on the switch and give the parent no IP, or keep the parent for the untagged management-style network deliberately and document it.</p>

<h3>Fault 3: same tag, different parents</h3>
<p>A tag is unique <b>per parent interface</b>, not per firewall. Tag 10 on ethernet1/3 is a separate network from tag 10 on ethernet1/2, so you must give them different addresses and, usually, different zones:</p>
<pre class="out">ethernet1/2.10      18    1    users            vr:default               10     10.10.10.1/24
ethernet1/3         20    1    N/A              N/A                      0      N/A
ethernet1/3.10      21    1    other            vr:default               10     10.30.10.1/24</pre>
<p>Note ethernet1/3 itself is shown with no zone and N/A: it is only a trunk carrier. The danger is mistaking "VLAN 10" for one global network. VLAN IDs are local to a switch domain; here, two trunks may carry two different VLAN 10s.</p>

<h3>Fault 4: missing zone or route</h3>
<p>A subinterface with an IP but no zone passes no traffic that policy can match; one without a virtual router has no route entry. The routing table proves the connected networks exist:</p>
<pre class="out">admin@NK-PA&gt; show routing route
destination         nexthop       metric flags  age   interface
10.10.10.0/24       10.10.10.1    0      A C          ethernet1/2.10
10.10.20.0/24       10.10.20.1    0      A C          ethernet1/2.20
10.10.99.0/24       10.10.99.1    0      A C          ethernet1/2
203.0.113.0/30      203.0.113.2   0      A C          ethernet1/1
(host routes and headers trimmed)</pre>
<p>Every subinterface in the virtual router appears as a connected (C) route. If a subnet is missing from this table, the interface is not in the virtual router.</p>

<div class="eg"><p><b>Worked example.</b> "Servers are down after Friday's change." Step 1: the switch trunk shows VLAN 20 allowed, good. Step 2: show interface all shows tag 30 on ethernet1/2.20. Found in two commands. Correct the tag, commit, ping again.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Trusting the subinterface name instead of the tag column. Putting the same subnet on two subinterfaces. Leaving the native VLAN mismatched on the two ends of the trunk. Assuming a successful commit means a working network.</p></div>
<div class="exam"><p><b>Exam trap.</b> Frames with no tag go to the parent interface, never to a subinterface. A tag only has meaning together with its parent.</p></div>

<div class="scn"><h4>Two sites, one VLAN number</h4><p>An engineer copied the user subinterface configuration to a second trunk, keeping tag 10 and the same subnet. Routing became ambiguous because two connected routes overlapped. The fix was a new subnet for the second site, a new zone, and a rule between the two.</p><p><b>Lesson:</b> same tag on different parents means a different network; plan addressing accordingly.</p></div>

<div class="iv"><p class="q">"Where do untagged frames go on a firewall trunk port?"</p><p>To the parent interface. If the parent has an IP, zone and virtual router it serves the native VLAN; otherwise untagged traffic has nowhere to go. I prefer an unused native VLAN so nothing untagged is accepted.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in order: trunk, tag, zone and router, policy, traffic.</li>
<li>A tag mismatch commits cleanly and fails silently.</li>
<li>Untagged frames reach the parent interface, not a subinterface.</li>
<li>Tags are unique per parent interface.</li>
<li>Every working subinterface shows a connected route.</li>
</ul></div>
`,hi:`
<p><b>Analogy: numbered pigeonholes wala post office.</b> Trunk dak ki gaadi hai; har tag ek pigeonhole number. Agar chitthi par 20 likha hai aur aapka pigeonhole 30 hai, to chitthi khoti nahi, bas aap tak kabhi pahunchti nahi. Zyadatar subinterface faults ya to number ka mismatch hote hain ya aise pigeonhole jiska koi malik nahi.</p>

<h3>Doharaaya ja sakne wala tareeka</h3>
<ol>
<li><b>Layer 2:</b> kya switch trunk VLAN carry karta hai? (switch par <code>show interfaces trunk</code>.)</li>
<li><b>Tag:</b> kya subinterface ka tag VLAN ID ke barabar hai? (<code>show interface all</code>.)</li>
<li><b>Zone aur router:</b> kya subinterface ka zone aur virtual router hai?</li>
<li><b>Policy:</b> kya zones ke beech rule hai? (<code>test security-policy-match</code>.)</li>
<li><b>Traffic:</b> host se, phir <code>show session all</code> aur <code>show log traffic</code>.</li>
</ol>

<h3>Fault 1: tag mismatch</h3>
<p>Koi servers subinterface ko "tidy" karke tag 30 kar deta hai jabki switch abhi VLAN 20 use karta hai. Commit succeed hota hai, kyunki 30 legal tag hai. Interface table saboot hai:</p>
<pre class="out">admin@NK-PA&gt; show interface all
name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/2         17    1    native           vr:default               0      10.10.99.1/24
ethernet1/2.10      18    1    users            vr:default               10     10.10.10.1/24
<span class="hl">ethernet1/2.20      19    1    servers          vr:default               30     10.10.20.1/24</span>
(baaki rows hataayi gayi)</pre>
<p>Naam abhi bhi .20 hai par tag 30. Host se asar:</p>
<pre class="out">PC10&gt; ping 10.10.20.50
10.10.20.50 icmp_seq=1 timeout
10.10.20.50 icmp_seq=2 timeout
10.10.20.50 icmp_seq=3 timeout
10.10.20.50 icmp_seq=4 timeout
10.10.20.50 icmp_seq=5 timeout</pre>
<p>Fix: tag ko VLAN ID par wapas set karo aur commit karo. Ping phir TTL 63 ke saath laut aata hai:</p>
<pre class="code">set network interface ethernet ethernet1/2 layer3 units ethernet1/2.20 tag 20
commit</pre>
<p>Achhi practice: unit number ko tag ke barabar rakho (tag 20 ke liye ethernet1/2.20). Tab mismatch ek nazar mein dikh jaata hai, jaise yahan.</p>

<h3>Fault 2: native VLAN</h3>
<p>Trunk par untagged frames native VLAN hote hain (yahan switch par VLAN 99). Woh <b>parent</b> interface par aate hain, kisi subinterface par nahi. Agar parent ka IP, zone aur virtual router hai, to woh us untagged network ko serve karta hai:</p>
<pre class="out">name                id    vsys zone             forwarding               tag    address
ethernet1/2         17    1    native           vr:default               0      10.10.99.1/24
ethernet1/2.10      18    1    users            vr:default               10     10.10.10.1/24
ethernet1/2.20      19    1    servers          vr:default               20     10.10.20.1/24

PC99&gt; ping 10.10.99.1
84 bytes from 10.10.99.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>Yeh kaam karta hai, lekin ek port par tagged aur untagged networks mil jaate hain, jise audit karna mushkil hai. Kai designs ise avoid karte hain: switch par dedicated unused native VLAN rakho aur parent ko IP mat do, ya parent ko jaanbujhkar untagged network ke liye rakho aur document karo.</p>

<h3>Fault 3: same tag, alag parents</h3>
<p>Tag <b>har parent interface</b> par unique hota hai, poore firewall par nahi. ethernet1/3 par tag 10 ethernet1/2 ke tag 10 se alag network hai, isliye unhe alag addresses aur aam taur par alag zones dene honge:</p>
<pre class="out">ethernet1/2.10      18    1    users            vr:default               10     10.10.10.1/24
ethernet1/3         20    1    N/A              N/A                      0      N/A
ethernet1/3.10      21    1    other            vr:default               10     10.30.10.1/24</pre>
<p>Dhyan do ki ethernet1/3 khud bina zone aur N/A dikhta hai: woh sirf trunk carrier hai. Khatra yeh hai ki "VLAN 10" ko ek global network samajh liya jaaye. VLAN IDs ek switch domain ke liye local hote hain; yahan do trunks do alag VLAN 10 carry kar sakte hain.</p>

<h3>Fault 4: zone ya route missing</h3>
<p>IP wala lekin bina zone ka subinterface koi aisa traffic nahi guzarta jisse policy match kar sake; bina virtual router wale ka route entry nahi hoti. Routing table saabit karti hai ki connected networks maujood hain:</p>
<pre class="out">admin@NK-PA&gt; show routing route
destination         nexthop       metric flags  age   interface
10.10.10.0/24       10.10.10.1    0      A C          ethernet1/2.10
10.10.20.0/24       10.10.20.1    0      A C          ethernet1/2.20
10.10.99.0/24       10.10.99.1    0      A C          ethernet1/2
203.0.113.0/30      203.0.113.2   0      A C          ethernet1/1
(host routes aur headers trim kiye)</pre>
<p>Virtual router ka har subinterface connected (C) route ke roop mein dikhta hai. Agar koi subnet is table mein nahi hai, to interface virtual router mein nahi hai.</p>

<div class="eg"><p><b>Worked example.</b> "Friday ke change ke baad servers down hain." Step 1: switch trunk par VLAN 20 allowed hai, theek. Step 2: show interface all ethernet1/2.20 par tag 30 dikhata hai. Do commands mein mil gaya. Tag sahi karo, commit karo, phir ping.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Tag column ki jagah subinterface ke naam par bharosa karna. Do subinterfaces par ek hi subnet rakhna. Trunk ke dono sire par native VLAN mismatch chhodna. Yeh maan lena ki successful commit ka matlab working network hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bina tag ke frames parent interface par jaate hain, kabhi subinterface par nahi. Tag ka matlab sirf apne parent ke saath hai.</p></div>

<div class="scn"><h4>Do sites, ek VLAN number</h4><p>Engineer ne user subinterface ki configuration doosre trunk par copy kar di, tag 10 aur wahi subnet rakhkar. Routing ambiguous ho gayi kyunki do connected routes overlap karte the. Fix: doosre site ke liye naya subnet, naya zone, aur dono ke beech rule.</p><p><b>Lesson:</b> alag parents par same tag ka matlab alag network; addressing uske hisaab se plan karo.</p></div>

<div class="iv"><p class="q">"Firewall trunk port par untagged frames kahan jaate hain?"</p><p>Parent interface par. Agar parent ka IP, zone aur virtual router hai to woh native VLAN serve karta hai; warna untagged traffic ke paas jaane ki jagah nahi. Main unused native VLAN pasand karta hoon taaki koi untagged cheez accept na ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein troubleshoot karo: trunk, tag, zone aur router, policy, traffic.</li>
<li>Tag mismatch saaf commit hota hai aur chupchaap fail hota hai.</li>
<li>Untagged frames parent interface par aate hain, subinterface par nahi.</li>
<li>Tags har parent interface par unique hote hain.</li>
<li>Har working subinterface ka connected route dikhta hai.</li>
</ul></div>
`}};export{e as default};