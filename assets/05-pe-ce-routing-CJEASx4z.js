var e=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="PE-CE eBGP"><rect x="30" y="40" width="120" height="50" rx="8" fill="#bae6fd"/><text x="90" y="70" text-anchor="middle" class="svg-ink" font-size="13">CE1 AS 65101</text><rect x="260" y="40" width="120" height="50" rx="8" fill="#fde68a"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">PE1 AS 65000</text><rect x="490" y="40" width="120" height="50" rx="8" fill="#bae6fd"/><text x="550" y="70" text-anchor="middle" class="svg-ink" font-size="13">CE2 AS 65102</text><line x1="150" y1="65" x2="260" y2="65" stroke="#64748b" stroke-width="2"/><line x1="380" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="205" y="55" text-anchor="middle" class="svg-accent" font-size="12">`+t+`</text><text x="435" y="55" text-anchor="middle" class="svg-muted" font-size="12">`+n+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`pe-ce-routing`,h:{en:`PE-CE routing with eBGP`,hi:`eBGP ke saath PE-CE routing`},body:{en:`
<p>The PE must learn the customer's prefixes from the CE. Any routing method works: static routes, RIP, EIGRP, OSPF or eBGP. This module uses <b>eBGP</b>, the most common choice for larger customers, and the one in lab 1 task 4. The PE-CE session lives <i>inside</i> the VRF.</p>

<h3>Configuration on PE1 (lab solution)</h3>
<pre class="code">router bgp 65000
 address-family ipv4 vrf CUST_A
  neighbor 192.168.1.2 remote-as 65101
  neighbor 192.168.1.2 activate
 exit-address-family</pre>
<p>PE2 uses neighbour 192.168.2.2 with remote-as 65102. The CE needs only an ordinary eBGP neighbour toward the PE and a <code>network</code> statement for its LAN. The neighbour address is the VRF interface address, not a loopback.</p>

<h3>What the CE sees</h3>
<pre class="out">CE1# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  172.16.1.0/24    0.0.0.0                  0         32768 i
 *&gt;  172.16.2.0/24    192.168.1.1                            0 65000 65102 i</pre>
<p>The path to CE2's LAN is <code>65000 65102</code>: the provider AS appears, then the remote customer AS. The provider is a normal AS in the path, and the P routers are invisible because they run no BGP.</p>

<h3>How the route moves end to end</h3>
<ol>
<li>CE1 advertises 172.16.1.0/24 by eBGP to PE1 (VRF table).</li>
<li>PE1 puts it in the VRF BGP table, exports it with RT 65000:1 into VPNv4 as 65000:1:172.16.1.0/24 and sends it to PE2.</li>
<li>PE2 imports it (RT matches), installs it in the VRF, and advertises it to CE2 by eBGP.</li>
</ol>
@@D@@

<h3>Same AS number at every site</h3>
<p>If CE1 and CE2 both use AS 65101, CE2 receives a path containing its own AS (65000 65101) and rejects it (loop prevention). Two standard fixes:</p>
<ul>
<li><b>as-override</b> on the PE: replace the customer ASN in the path with the provider ASN.</li>
<li><b>allowas-in</b> on the CE: accept its own AS in the path.</li>
</ul>
<pre class="code"><span class="c">! reference configuration (not output)</span>
router bgp 65000
 address-family ipv4 vrf CUST_A
  neighbor 192.168.2.2 as-override</pre>
<p>This lab uses different ASNs (65101, 65102), so neither is needed.</p>

<h3>Other PE-CE protocols</h3>
<table class="cmp"><tr><th>Protocol</th><th>Notes</th></tr>
<tr><td>Static</td><td>Simplest; redistribute into BGP in the VRF.</td></tr>
<tr><td>OSPF</td><td>Runs per VRF (<code>router ospf 10 vrf CUST_A</code>); redistribute with BGP; sham links for backdoor links.</td></tr>
<tr><td>EIGRP / RIP</td><td>Per-VRF address family; metrics carried in extended communities (EIGRP).</td></tr>
<tr><td>eBGP</td><td>Scales best; policy by communities; as-override/allowas-in for ASN reuse.</td></tr></table>
<p>For multihomed sites, <b>Site of Origin (SoO)</b> is an extended community that stops a route from being sent back into the site it came from. This is reference knowledge; it is not part of the lab.</p>

<div class="eg"><p><b>Worked example.</b> CE1 advertises two LANs. PE1 shows both with <code>show bgp vpnv4 unicast vrf CUST_A</code>; PE2 shows them with next hop 10.0.255.1; CE2 shows them with path 65000 65101. If CE2 shows nothing, check import RT on PE2 before blaming eBGP.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring the PE-CE neighbour in the global BGP instead of in <code>address-family ipv4 vrf</code>. Forgetting <code>activate</code>. Using the same ASN at all sites without as-override or allowas-in.</p></div>
<div class="exam"><p><b>Exam trap.</b> The PE-CE neighbour is configured under the VRF address family, not under vpnv4. eBGP routes learned from the CE are exported with the VRF's export RT.</p></div>

<div class="scn"><h4>Site two never gets the route</h4><p>Two branches both used AS 65200. PE1 and PE2 each had routes, but the remote branch did not install the other's LAN. The AS path contained the remote branch's own AS. Adding as-override on the PEs fixed it without changing customer routers.</p><p><b>Lesson:</b> same ASN at every site needs as-override or allowas-in.</p></div>

<div class="iv"><p class="q">"How does a PE learn customer routes, and what if all sites use the same ASN?"</p><p>Through a PE-CE routing protocol, often eBGP configured under the VRF address family. With the same ASN everywhere the CE rejects the route by AS-path loop prevention, so use as-override on the PE or allowas-in on the CE.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PE-CE eBGP is configured in address-family ipv4 vrf NAME.</li>
<li>CE sees the path provider-ASN then remote-customer-ASN.</li>
<li>Same ASN at every site: as-override or allowas-in.</li>
<li>Other options: static, OSPF, EIGRP, RIP.</li>
<li>SoO prevents loops at multihomed sites (concept).</li>
</ul></div>
`.replace(`@@D@@`,e(`eBGP between CE and PE inside the VRF; VPNv4 carries it across the core.`,`eBGP (VRF)`,`MP-BGP VPNv4`)),hi:`
<p>PE ko customer ke prefixes CE se seekhne hote hain. Koi bhi routing method chalta hai: static routes, RIP, EIGRP, OSPF ya eBGP. Yeh module <b>eBGP</b> use karta hai, jo bade customers ke liye sabse common hai, aur lab 1 task 4 mein bhi yahi hai. PE-CE session VRF ke <i>andar</i> rehta hai.</p>

<h3>PE1 par configuration (lab solution)</h3>
<pre class="code">router bgp 65000
 address-family ipv4 vrf CUST_A
  neighbor 192.168.1.2 remote-as 65101
  neighbor 192.168.1.2 activate
 exit-address-family</pre>
<p>PE2 neighbour 192.168.2.2 aur remote-as 65102 use karta hai. CE ko sirf PE ki taraf ek normal eBGP neighbour aur apni LAN ka <code>network</code> statement chahiye. Neighbour address VRF interface ka address hai, loopback nahi.</p>

<h3>CE kya dekhta hai</h3>
<pre class="out">CE1# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  172.16.1.0/24    0.0.0.0                  0         32768 i
 *&gt;  172.16.2.0/24    192.168.1.1                            0 65000 65102 i</pre>
<p>CE2 ki LAN ka path <code>65000 65102</code> hai: pehle provider AS, phir remote customer AS. Provider path mein ek normal AS hai, aur P routers dikhte nahi kyunki woh BGP nahi chalate.</p>

<h3>Route end to end kaise chalta hai</h3>
<ol>
<li>CE1 172.16.1.0/24 ko eBGP se PE1 ko advertise karta hai (VRF table).</li>
<li>PE1 use VRF BGP table mein rakhta hai, RT 65000:1 ke saath VPNv4 mein 65000:1:172.16.1.0/24 ke roop mein export karta hai aur PE2 ko bhejta hai.</li>
<li>PE2 use import karta hai (RT match), VRF mein install karta hai, aur eBGP se CE2 ko advertise karta hai.</li>
</ol>
@@D@@

<h3>Har site par same AS number</h3>
<p>Agar CE1 aur CE2 dono AS 65101 use karein, to CE2 ko aisa path milta hai jisme uska apna AS hai (65000 65101) aur woh use reject kar deta hai (loop prevention). Do standard fixes:</p>
<ul>
<li>PE par <b>as-override</b>: path mein customer ASN ko provider ASN se badal do.</li>
<li>CE par <b>allowas-in</b>: path mein apna AS accept karo.</li>
</ul>
<pre class="code"><span class="c">! reference configuration (not output)</span>
router bgp 65000
 address-family ipv4 vrf CUST_A
  neighbor 192.168.2.2 as-override</pre>
<p>Is lab mein alag ASNs hain (65101, 65102), isliye dono mein se koi zaroori nahi.</p>

<h3>Doosre PE-CE protocols</h3>
<table class="cmp"><tr><th>Protocol</th><th>Notes</th></tr>
<tr><td>Static</td><td>Sabse simple; VRF mein BGP mein redistribute karo.</td></tr>
<tr><td>OSPF</td><td>Per VRF chalta hai (<code>router ospf 10 vrf CUST_A</code>); BGP ke saath redistribute; backdoor links ke liye sham links.</td></tr>
<tr><td>EIGRP / RIP</td><td>Per-VRF address family; metrics extended communities mein jaate hain (EIGRP).</td></tr>
<tr><td>eBGP</td><td>Sabse achha scale; communities se policy; ASN reuse ke liye as-override/allowas-in.</td></tr></table>
<p>Multihomed sites ke liye <b>Site of Origin (SoO)</b> ek extended community hai jo route ko us site mein wapas jaane se rokti hai jahan se woh aaya. Yeh reference knowledge hai; lab ka hissa nahi.</p>

<div class="eg"><p><b>Worked example.</b> CE1 do LANs advertise karta hai. PE1 dono ko <code>show bgp vpnv4 unicast vrf CUST_A</code> se dikhata hai; PE2 unhe next hop 10.0.255.1 ke saath dikhata hai; CE2 unhe path 65000 65101 ke saath dikhata hai. Agar CE2 ko kuch na dikhe, to eBGP ko doshi thehrane se pehle PE2 par import RT check karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> PE-CE neighbour ko <code>address-family ipv4 vrf</code> ke bajaye global BGP mein configure karna. <code>activate</code> bhoolna. as-override ya allowas-in ke bina har site par same ASN.</p></div>
<div class="exam"><p><b>Exam trap.</b> PE-CE neighbour VRF address family ke neeche configure hota hai, vpnv4 ke neeche nahi. CE se seekhe eBGP routes VRF ke export RT ke saath export hote hain.</p></div>

<div class="scn"><h4>Site two ko route kabhi nahi milta</h4><p>Do branches ne AS 65200 use kiya. PE1 aur PE2 ke paas routes the, par remote branch ne doosre ki LAN install nahi ki. AS path mein remote branch ka apna AS tha. PEs par as-override lagane se customer routers badle bina fix ho gaya.</p><p><b>Lesson:</b> har site par same ASN ko as-override ya allowas-in chahiye.</p></div>

<div class="iv"><p class="q">"PE customer routes kaise seekhta hai, aur agar saare sites same ASN use karein to?"</p><p>PE-CE routing protocol se, aksar VRF address family ke neeche configure eBGP. Har jagah same ASN ho to CE AS-path loop prevention se route reject kar deta hai, isliye PE par as-override ya CE par allowas-in use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PE-CE eBGP address-family ipv4 vrf NAME mein configure hota hai.</li>
<li>CE ko path dikhta hai provider-ASN phir remote-customer-ASN.</li>
<li>Har site same ASN: as-override ya allowas-in.</li>
<li>Doosre options: static, OSPF, EIGRP, RIP.</li>
<li>SoO multihomed sites par loops rokta hai (concept).</li>
</ul></div>
`.replace(`@@D@@`,e(`CE aur PE ke beech VRF ke andar eBGP; VPNv4 use core ke paar le jaata hai.`,`eBGP (VRF)`,`MP-BGP VPNv4`))}};export{t as default};