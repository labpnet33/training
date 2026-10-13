var e={id:`transparent-policy`,h:{en:`What passes a transparent firewall: ACLs, inspection and EtherType ACLs`,hi:`Transparent firewall se kya pass hota hai: ACLs, inspection aur EtherType ACLs`},body:{en:`
<p>An airport security gate does not care whether you arrive by taxi or by metro; the same rules apply to everyone who walks through it. Transparent mode changes how the firewall is <i>wired in</i>, not what it <i>allows</i>. The same security levels, ACLs and inspection engines you learned for routed mode decide every IP flow. On top of that, a bridge can see traffic a router never sees: broadcasts, multicasts and non-IP frames. This chapter sorts all traffic into four buckets and shows how to handle each.</p>

<h3>Bucket 1: unicast IP (TCP, UDP, ICMP)</h3>
<ul>
<li><b>Higher to lower security level</b> (inside 100 to outside 0) is allowed without an ACL.</li>
<li><b>Lower to higher</b> needs an ACL on the ingress interface. The implicit deny drops everything else and logs it.</li>
<li><b>Replies</b> of allowed connections return through the stateful connection table.</li>
<li><b>ICMP</b> is not stateful unless you enable <code>inspect icmp</code>. Without it, echo replies arriving on outside are treated as new inbound traffic and denied.</li>
</ul>

<h4>Lab task 3: ping 8.8.8.8 fails, web works</h4>
<pre class="out">NK-TFW# show logging | include 106014
%ASA-3-106014: Deny inbound icmp src outside:8.8.8.8 dst inside:10.0.1.10 (type 0, code 0)</pre>
<p>The echo request left fine; the <b>reply</b> was denied. The clean fix is to make ICMP stateful, not to open ICMP from the internet:</p>
<pre class="code">NK-TFW(config)# policy-map global_policy
NK-TFW(config-pmap)# class inspection_default
NK-TFW(config-pmap-c)# inspect icmp
NK-TFW(config-pmap-c)# exit
NK-TFW(config-pmap)# exit</pre>

<h4>Lab task 4: only MON may reach SRV on HTTP</h4>
<p>MON (10.0.1.250) sits on the router side, so its traffic enters on <code>outside</code> (level 0) towards SRV on <code>inside</code> (level 100). It needs a permit, and only for TCP port 80:</p>
<pre class="code">NK-TFW(config)# access-list OUTSIDE_IN extended permit tcp host 10.0.1.250 host 10.0.1.20 eq www
NK-TFW(config)# access-group OUTSIDE_IN in interface outside</pre>
<pre class="out">NK-TFW# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 1 elements; name hash: 0x6bfe3e59
<span class="hl">access-list OUTSIDE_IN line 1 extended permit tcp host 10.0.1.250 host 10.0.1.20 eq www (hitcnt=3)</span> 0x4a1c2f10</pre>
<p>MON can now open the web page on SRV, while a ping from MON to PC1 and SSH from MON to SRV are denied by the implicit deny at the end of OUTSIDE_IN. Notice that the ACL uses the <b>real</b> addresses of the hosts; there is no NAT between them because they share a subnet.</p>

<h3>Bucket 2: ARP</h3>
<p>ARP passes in both directions <b>without any ACL</b>. You control it with ARP inspection (chapter 4), never with an ACL.</p>

<h3>Bucket 3: broadcast and multicast IP</h3>
<p>A routed firewall never forwards broadcast or multicast IP, even if an ACL permits it (unless you configure DHCP relay or multicast routing). A bridge group <b>can</b> pass them, but only if an extended ACL permits them. Typical cases:</p>
<ul>
<li><b>DHCP</b> through the firewall: permit UDP bootps and bootpc on the interfaces where client requests and server replies enter.</li>
<li><b>Routing protocols</b> between two routers on either side: permit <code>ospf</code> (224.0.0.5 and 224.0.0.6), EIGRP (protocol 88) or TCP 179 for BGP in both directions.</li>
<li><b>IPv6 neighbour discovery</b> and router solicitation/advertisement: permit the needed ICMPv6 types with an extended ACL.</li>
</ul>

<h3>Bucket 4: non-IP frames and EtherType ACLs</h3>
<p>Frames that are not IPv4, IPv6 or ARP are identified by their <b>EtherType</b>. An <b>EtherType ACL</b> permits or denies them per interface. The keywords include <code>bpdu</code>, <code>isis</code>, <code>mpls-unicast</code>, <code>mpls-multicast</code>, <code>ipx</code>, <code>any</code> and a hex EtherType of 0x600 or higher. EtherType ACLs are applied with <code>access-group</code> like any other ACL, and an interface can have one extended and one EtherType ACL in the same direction.</p>
<pre class="code"><span class="c">! let spanning tree see through the firewall (important with transparent failover)</span>
access-list NONIP ethertype permit bpdu
<span class="c">! carry IS-IS between two routers across the bridge</span>
access-list NONIP ethertype permit isis
access-group NONIP in interface inside
access-group NONIP in interface outside</pre>
<p>Frames with a length field instead of an EtherType (older 802.3 frames below 0x600, for example CDP) do not pass, with exceptions for BPDUs and IS-IS, which have their own keywords.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Four traffic buckets">
<rect x="220" y="15" width="200" height="40" rx="8" fill="#fed7aa"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Frame enters bridge group</text>
<rect x="10" y="110" width="145" height="70" rx="8" fill="#bbf7d0"/><text x="82" y="135" text-anchor="middle" class="svg-ink" font-size="13">Unicast IP</text><text x="82" y="153" text-anchor="middle" class="svg-muted" font-size="12">levels + ACL</text><text x="82" y="170" text-anchor="middle" class="svg-muted" font-size="12">+ inspection</text>
<rect x="170" y="110" width="140" height="70" rx="8" fill="#bae6fd"/><text x="240" y="135" text-anchor="middle" class="svg-ink" font-size="13">ARP</text><text x="240" y="153" text-anchor="middle" class="svg-muted" font-size="12">passes by default</text><text x="240" y="170" text-anchor="middle" class="svg-muted" font-size="12">ARP inspection</text>
<rect x="325" y="110" width="145" height="70" rx="8" fill="#ddd6fe"/><text x="397" y="135" text-anchor="middle" class="svg-ink" font-size="13">Bcast/mcast IP</text><text x="397" y="153" text-anchor="middle" class="svg-muted" font-size="12">needs extended</text><text x="397" y="170" text-anchor="middle" class="svg-muted" font-size="12">ACL permit</text>
<rect x="485" y="110" width="145" height="70" rx="8" fill="#fde68a"/><text x="557" y="135" text-anchor="middle" class="svg-ink" font-size="13">Non-IP</text><text x="557" y="153" text-anchor="middle" class="svg-muted" font-size="12">needs EtherType</text><text x="557" y="170" text-anchor="middle" class="svg-muted" font-size="12">ACL permit</text>
<line x1="320" y1="55" x2="82" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="55" x2="240" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="55" x2="397" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="55" x2="557" y2="110" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="12">same policy engine as routed mode, plus two extra buckets</text>
</svg><p class="cap">Every frame lands in one of four buckets, each with its own control.</p></div>

<div class="eg"><p><b>Worked example.</b> Two routers, R-A (10.40.0.1) and R-B (10.40.0.2), run OSPF through a transparent firewall. R-A is on inside (100), R-B on outside (0). OSPF hellos from R-A to 224.0.0.5 enter inside and hellos from R-B enter outside. Because they are multicast, <i>both</i> directions need a permit: <code>access-list IN_ACL extended permit ospf host 10.40.0.1 any</code> on inside and <code>access-list OUTSIDE_IN extended permit ospf host 10.40.0.2 any</code> on outside. The neighbours reach FULL; the firewall still inspects every data flow between the sites behind them.</p></div>

<div class="warn"><p><b>Common mistake.</b> Opening ICMP from any to any on outside to "fix ping". It works, but it lets the internet ping everything behind the firewall. <code>inspect icmp</code> fixes the replies without opening unsolicited ICMP.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the traffic to the tool: IP needs an <b>extended</b> ACL, ARP needs <b>nothing</b> (or ARP inspection), and BPDUs, IS-IS or MPLS need an <b>EtherType</b> ACL. An answer that uses an EtherType ACL for OSPF or DHCP is wrong: those are IP.</p></div>

<div class="scn"><h4>The monitoring server that went blind</h4><p>After a transparent firewall went into a branch, the NOC's monitoring server on the router side could no longer poll the inside web server. <code>show logging | include 106001</code> showed <i>Inbound TCP connection denied from 10.0.1.250/51022 to 10.0.1.20/80 flags SYN on interface outside</i>. Outbound browsing was fine. The engineer added one line to the outside ACL permitting only 10.0.1.250 to 10.0.1.20 on port 80 and confirmed the hit count increasing.</p><p><b>Lesson:</b> transparent mode changes the layer, not the policy; lower to higher still needs a permit.</p></div>

<div class="iv"><p class="q">"How do you let spanning tree BPDUs cross a transparent ASA, and why would you?"</p><p>With an EtherType ACL: <code>access-list NONIP ethertype permit bpdu</code>, applied inbound on the member interfaces. You want switches on both sides to see each other's BPDUs so STP can block a redundant path, which matters most in transparent failover where both units connect to the same VLANs; otherwise a loop can form. Mention that ARP needs no ACL and IP uses extended ACLs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unicast IP follows the normal rules: higher to lower allowed, lower to higher needs an ACL, replies are stateful.</li>
<li><code>inspect icmp</code> makes ping replies stateful; it is the clean fix for "web works, ping fails".</li>
<li>ARP passes without an ACL; broadcast and multicast IP need an extended ACL.</li>
<li>Non-IP traffic (BPDU, IS-IS, MPLS) needs an EtherType ACL; one extended and one EtherType ACL can share an interface and direction.</li>
<li>Lab 1's inbound rule: <code>permit tcp host 10.0.1.250 host 10.0.1.20 eq www</code> on outside.</li>
</ul></div>
`,hi:`
<p>Airport ka security gate is baat ki parwah nahi karta ki aap taxi se aaye ya metro se; jo bhi usse guzarta hai sab par same rules lagte hain. Transparent mode yeh badalta hai ki firewall kaise <i>wire</i> hota hai, yeh nahi ki woh kya <i>allow</i> karta hai. Routed mode ke liye seekhe gaye same security levels, ACLs aur inspection engines har IP flow decide karte hain. Iske upar, bridge woh traffic dekh sakta hai jo router kabhi nahi dekhta: broadcasts, multicasts aur non-IP frames. Yeh chapter saare traffic ko chaar buckets mein baantta hai aur dikhata hai ki har ek ko kaise handle karein.</p>

<h3>Bucket 1: unicast IP (TCP, UDP, ICMP)</h3>
<ul>
<li><b>Higher se lower security level</b> (inside 100 se outside 0) bina ACL ke allowed hai.</li>
<li><b>Lower se higher</b> ke liye ingress interface par ACL chahiye. Implicit deny baaki sab drop karke log karta hai.</li>
<li>Allowed connections ke <b>replies</b> stateful connection table se wapas aate hain.</li>
<li><b>ICMP</b> tab tak stateful nahi hai jab tak aap <code>inspect icmp</code> enable na karo. Iske bina outside par aane wale echo replies naya inbound traffic maane jaate hain aur deny hote hain.</li>
</ul>

<h4>Lab task 3: ping 8.8.8.8 fail, web chalta hai</h4>
<pre class="out">NK-TFW# show logging | include 106014
%ASA-3-106014: Deny inbound icmp src outside:8.8.8.8 dst inside:10.0.1.10 (type 0, code 0)</pre>
<p>Echo request theek se nikla; <b>reply</b> deny hua. Saaf fix ICMP ko stateful banana hai, internet se ICMP kholna nahi:</p>
<pre class="code">NK-TFW(config)# policy-map global_policy
NK-TFW(config-pmap)# class inspection_default
NK-TFW(config-pmap-c)# inspect icmp
NK-TFW(config-pmap-c)# exit
NK-TFW(config-pmap)# exit</pre>

<h4>Lab task 4: sirf MON SRV tak HTTP par pahunche</h4>
<p>MON (10.0.1.250) router side par hai, isliye uska traffic <code>outside</code> (level 0) par aata hai aur <code>inside</code> (level 100) par SRV ki taraf jaata hai. Use permit chahiye, aur sirf TCP port 80 ke liye:</p>
<pre class="code">NK-TFW(config)# access-list OUTSIDE_IN extended permit tcp host 10.0.1.250 host 10.0.1.20 eq www
NK-TFW(config)# access-group OUTSIDE_IN in interface outside</pre>
<pre class="out">NK-TFW# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 1 elements; name hash: 0x6bfe3e59
<span class="hl">access-list OUTSIDE_IN line 1 extended permit tcp host 10.0.1.250 host 10.0.1.20 eq www (hitcnt=3)</span> 0x4a1c2f10</pre>
<p>Ab MON SRV par web page khol sakta hai, jabki MON se PC1 ka ping aur MON se SRV ka SSH OUTSIDE_IN ke end ke implicit deny se deny hote hain. Dhyaan do ki ACL hosts ke <b>real</b> addresses use karti hai; unke beech koi NAT nahi kyunki woh ek subnet share karte hain.</p>

<h3>Bucket 2: ARP</h3>
<p>ARP dono directions mein <b>bina kisi ACL ke</b> pass hota hai. Aap ise ARP inspection (chapter 4) se control karte ho, kabhi ACL se nahi.</p>

<h3>Bucket 3: broadcast aur multicast IP</h3>
<p>Routed firewall broadcast ya multicast IP kabhi forward nahi karta, chahe ACL permit kare (jab tak aap DHCP relay ya multicast routing configure na karo). Bridge group inhe pass <b>kar sakta</b> hai, lekin sirf tab jab extended ACL permit kare. Typical cases:</p>
<ul>
<li>Firewall ke through <b>DHCP</b>: jin interfaces par client requests aur server replies aate hain wahan UDP bootps aur bootpc permit karo.</li>
<li>Dono taraf ke do routers ke beech <b>routing protocols</b>: dono directions mein <code>ospf</code> (224.0.0.5 aur 224.0.0.6), EIGRP (protocol 88) ya BGP ke liye TCP 179 permit karo.</li>
<li><b>IPv6 neighbour discovery</b> aur router solicitation/advertisement: zaroori ICMPv6 types extended ACL se permit karo.</li>
</ul>

<h3>Bucket 4: non-IP frames aur EtherType ACLs</h3>
<p>Jo frames IPv4, IPv6 ya ARP nahi hain, woh apne <b>EtherType</b> se pehchane jaate hain. <b>EtherType ACL</b> unhe har interface par permit ya deny karti hai. Keywords mein <code>bpdu</code>, <code>isis</code>, <code>mpls-unicast</code>, <code>mpls-multicast</code>, <code>ipx</code>, <code>any</code> aur 0x600 ya usse bada hex EtherType shamil hain. EtherType ACLs baaki ACLs ki tarah <code>access-group</code> se lagti hain, aur ek interface par same direction mein ek extended aur ek EtherType ACL ho sakti hai.</p>
<pre class="code"><span class="c">! spanning tree ko firewall ke paar dekhne do (transparent failover mein zaroori)</span>
access-list NONIP ethertype permit bpdu
<span class="c">! bridge ke paar do routers ke beech IS-IS le jao</span>
access-list NONIP ethertype permit isis
access-group NONIP in interface inside
access-group NONIP in interface outside</pre>
<p>Jin frames mein EtherType ki jagah length field hai (0x600 se neeche wale purane 802.3 frames, jaise CDP) woh pass nahi hote, siwaay BPDUs aur IS-IS ke, jinke apne keywords hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Chaar traffic buckets">
<rect x="220" y="15" width="200" height="40" rx="8" fill="#fed7aa"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Frame bridge group mein aata hai</text>
<rect x="10" y="110" width="145" height="70" rx="8" fill="#bbf7d0"/><text x="82" y="135" text-anchor="middle" class="svg-ink" font-size="13">Unicast IP</text><text x="82" y="153" text-anchor="middle" class="svg-muted" font-size="12">levels + ACL</text><text x="82" y="170" text-anchor="middle" class="svg-muted" font-size="12">+ inspection</text>
<rect x="170" y="110" width="140" height="70" rx="8" fill="#bae6fd"/><text x="240" y="135" text-anchor="middle" class="svg-ink" font-size="13">ARP</text><text x="240" y="153" text-anchor="middle" class="svg-muted" font-size="12">default se pass</text><text x="240" y="170" text-anchor="middle" class="svg-muted" font-size="12">ARP inspection</text>
<rect x="325" y="110" width="145" height="70" rx="8" fill="#ddd6fe"/><text x="397" y="135" text-anchor="middle" class="svg-ink" font-size="13">Bcast/mcast IP</text><text x="397" y="153" text-anchor="middle" class="svg-muted" font-size="12">extended ACL</text><text x="397" y="170" text-anchor="middle" class="svg-muted" font-size="12">permit chahiye</text>
<rect x="485" y="110" width="145" height="70" rx="8" fill="#fde68a"/><text x="557" y="135" text-anchor="middle" class="svg-ink" font-size="13">Non-IP</text><text x="557" y="153" text-anchor="middle" class="svg-muted" font-size="12">EtherType ACL</text><text x="557" y="170" text-anchor="middle" class="svg-muted" font-size="12">permit chahiye</text>
<line x1="320" y1="55" x2="82" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="55" x2="240" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="55" x2="397" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="55" x2="557" y2="110" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="12">routed mode jaisa policy engine, plus do extra buckets</text>
</svg><p class="cap">Har frame chaar buckets mein se ek mein girta hai, har ek ka apna control hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Do routers, R-A (10.40.0.1) aur R-B (10.40.0.2), transparent firewall ke through OSPF chalate hain. R-A inside (100) par hai, R-B outside (0) par. R-A se 224.0.0.5 ke OSPF hellos inside par aate hain aur R-B ke hellos outside par. Kyunki yeh multicast hain, <i>dono</i> directions ko permit chahiye: inside par <code>access-list IN_ACL extended permit ospf host 10.40.0.1 any</code> aur outside par <code>access-list OUTSIDE_IN extended permit ospf host 10.40.0.2 any</code>. Neighbours FULL tak pahunchte hain; firewall phir bhi unke peeche ki sites ke beech har data flow inspect karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> "Ping theek karne" ke liye outside par any se any ICMP kholna. Chalta hai, lekin internet firewall ke peeche sab kuch ping kar sakta hai. <code>inspect icmp</code> unsolicited ICMP khole bina replies theek karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Traffic ko tool se match karo: IP ko <b>extended</b> ACL chahiye, ARP ko <b>kuch nahi</b> (ya ARP inspection), aur BPDUs, IS-IS ya MPLS ko <b>EtherType</b> ACL. Jo answer OSPF ya DHCP ke liye EtherType ACL use karta hai woh galat hai: woh IP hain.</p></div>

<div class="scn"><h4>Monitoring server jo andha ho gaya</h4><p>Branch mein transparent firewall lagne ke baad router side ka NOC monitoring server inside web server ko poll nahi kar pa raha tha. <code>show logging | include 106001</code> ne dikhaya <i>Inbound TCP connection denied from 10.0.1.250/51022 to 10.0.1.20/80 flags SYN on interface outside</i>. Outbound browsing theek thi. Engineer ne outside ACL mein ek line jodi jo sirf 10.0.1.250 se 10.0.1.20 par port 80 permit karti thi aur hit count badhte hue confirm kiya.</p><p><b>Seekh:</b> transparent mode layer badalta hai, policy nahi; lower se higher ko ab bhi permit chahiye.</p></div>

<div class="iv"><p class="q">"Spanning tree BPDUs ko transparent ASA ke paar kaise jaane doge, aur kyun?"</p><p>EtherType ACL se: <code>access-list NONIP ethertype permit bpdu</code>, member interfaces par inbound lagao. Aap chahte ho ki dono taraf ke switches ek doosre ke BPDUs dekhein taaki STP redundant path block kar sake, jo sabse zyada transparent failover mein zaroori hai jahan dono units same VLANs se jude hote hain; warna loop ban sakta hai. Batao ki ARP ko ACL nahi chahiye aur IP extended ACLs use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unicast IP normal rules follow karta hai: higher se lower allowed, lower se higher ko ACL chahiye, replies stateful hain.</li>
<li><code>inspect icmp</code> ping replies ko stateful banata hai; "web chalta hai, ping fail" ka yahi saaf fix hai.</li>
<li>ARP bina ACL ke pass hota hai; broadcast aur multicast IP ko extended ACL chahiye.</li>
<li>Non-IP traffic (BPDU, IS-IS, MPLS) ko EtherType ACL chahiye; ek extended aur ek EtherType ACL interface aur direction share kar sakti hain.</li>
<li>Lab 1 ka inbound rule: outside par <code>permit tcp host 10.0.1.250 host 10.0.1.20 eq www</code>.</li>
</ul></div>
`}};export{e as default};