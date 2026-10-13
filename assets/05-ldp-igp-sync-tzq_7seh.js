var e=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Diamond core"><rect x="30" y="85" width="80" height="44" rx="8" fill="#bae6fd"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="14">PE1</text><rect x="280" y="20" width="80" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="14">P1</text><rect x="280" y="150" width="80" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="177" text-anchor="middle" class="svg-ink" font-size="14">P2</text><rect x="530" y="85" width="80" height="44" rx="8" fill="#bae6fd"/><text x="570" y="112" text-anchor="middle" class="svg-ink" font-size="14">PE2</text><line x1="110" y1="95" x2="280" y2="45" stroke="#64748b" stroke-width="2"/><line x1="110" y1="120" x2="280" y2="170" stroke="#64748b" stroke-width="2"/><line x1="360" y1="45" x2="530" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="170" x2="530" y2="120" stroke="#64748b" stroke-width="2"/><text x="170" y="58" class="svg-accent" font-size="12">`+t+`</text><text x="170" y="165" class="svg-muted" font-size="12">`+n+`</text><text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">PE1 to PE2: via P1 cost 20, via P2 cost 40 (P1 LDP ID is 7.7.7.7)</text></svg><p class="cap">`+e+`</p></div>`,t={id:`ldp-igp-sync`,h:{en:`LDP-IGP synchronization: the unlabelled shortcut`,hi:`LDP-IGP synchronization: bina label wala shortcut`},body:{en:`
<p>IS-IS and LDP converge independently. When a link comes up (after a reboot, or when a new link is installed), the IS-IS adjacency can form in a second while the LDP session takes longer. During that gap the IGP already sends traffic over the link, but the router has no label from that neighbour. This chapter follows the second lab, <i>the unlabelled shortcut</i>.</p>

<h3>The symptom: IP works, labels die</h3>
<p>The diamond core has two paths from PE1 to PE2: via P1 (total cost 20) and via P2 (cost 40). A migration test changed P1's LDP router ID to Loopback1 (7.7.7.7), a loopback that IS-IS does not advertise. IS-IS is unchanged, so IP traffic still goes through P1. But LDP discovery cannot form a session. Real output from PE1 in the broken network:</p>
<pre class="out">PE1# show ip route 10.0.255.4
Routing entry for 10.0.255.4/32
  Known via "isis", distance 115, metric 20
  * 10.0.12.2, via GigabitEthernet0/0

PE1# show mpls ldp discovery
 Local LDP Identifier:
    10.0.255.1:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/0 (ldp): xmit/recv
            LDP Id: <span class="hl">7.7.7.7:0; no route</span>
        GigabitEthernet0/1 (ldp): xmit/recv
            LDP Id: 10.0.255.3:0

PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
17         No Label   10.0.255.2/32    0             Gi0/0      10.0.12.2
20         <span class="hl">No Label</span>   10.0.255.4/32    0             Gi0/0      10.0.12.2</pre>
<p>Three facts. IS-IS routes via Gi0/0 (P1). PE1 hears P1's hello but its LDP ID 7.7.7.7 is "no route", so no TCP session. The LFIB entry for PE2's loopback shows <b>No Label</b> via Gi0/0. A plain traceroute works because it is IP. But an MPLS VPN would push its VPN label on top of a missing transport label: the packet would reach P1 unlabelled, and P1 has no customer routes, so the traffic is dropped. That is the black hole.</p>

@@D@@

<h3>The protection: LDP-IGP synchronization</h3>
<p>With <b>mpls ldp sync</b> under <code>router isis</code>, IS-IS waits for LDP. While an MPLS-enabled interface has no operational LDP session to its neighbour, IS-IS advertises the link with the <b>maximum metric</b>: 16777214 with wide metrics (63 with narrow). The link is still in the topology (so LDP can form) but is used only as a last resort.</p>
<pre class="code"><span class="c">! On all four routers (lab task 2)</span>
router isis
 mpls ldp sync</pre>
<p>Real output after enabling sync, from PE1 (note PE1's own LSP):</p>
<pre class="out">PE1# show isis database detail
PE1.00-00           * 0x00000002   0x3545        1200/*                 0/0/0
  Hostname: PE1
  Metric: <span class="hl">16777214</span>  IS-Extended P1
  Metric: 20        IS-Extended P2
  Metric: 16777214  IP 10.0.12.0/24
  Metric: 20        IP 10.0.13.0/24
P1.00-00              0x00000002   0x3B4F        1200/1200              0/0/0
  Metric: 16777214  IS-Extended PE1
  Metric: 16777214  IS-Extended PE2

PE1# show ip route 10.0.255.4
  Known via "isis", distance 115, metric 40
  * 10.0.13.3, via GigabitEthernet0/1

PE1# traceroute 10.0.255.4
  1 10.0.13.3 [MPLS: Label 18 Exp 0] 1 msec 2 msec 1 msec
  2 10.0.255.4 2 msec 3 msec 2 msec</pre>
<p>The links toward P1 are advertised at 16777214 by PE1, P1 and PE2. The best path is now via P2 (metric 40) and the traceroute shows a label: <b>labelled traffic works</b>, only on the longer path. The answer to the lab question "which metric?" is <b>16777214</b>.</p>

<h3>Remove the root cause</h3>
<p>Sync only protects; the real fix is to give P1 a usable LDP identity, without renumbering anything:</p>
<pre class="code">P1(config)# mpls ldp router-id Loopback0 force</pre>
<pre class="out">PE1# show isis database detail
PE1.00-00           * 0x00000003   0xA622        1200/*                 0/0/0
  Metric: 10        IS-Extended P1
  Metric: 20        IS-Extended P2
PE1# show ip route 10.0.255.4
  Known via "isis", distance 115, metric 20
  * 10.0.12.2, via GigabitEthernet0/0
PE1# traceroute 10.0.255.4
  1 10.0.12.2 [MPLS: Label 17 Exp 0] 1 msec 2 msec 1 msec
  2 10.0.255.4 2 msec 3 msec 2 msec</pre>
<p>Once sessions with P1 are Oper, the metrics return to 10 and the preferred path via P1 is back, now labelled end to end (Label 17). That is exactly what sync is designed to do: the traffic returns only when it is safe.</p>

<div class="eg"><p><b>Worked example: the numbers.</b> PE1 to PE2: via P1 = 10 + 10 = 20; via P2 = 20 + 20 = 40. With sync and no LDP on P1: P1's links = 16777214, so the P1 path costs about 33.5 million, and the P2 path (40) wins. After the fix, the P1 path returns to 20.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling sync on only some routers: both ends of a link must have it for the link to be advertised at maximum metric from both sides. Believing that sync fixes LDP; it only avoids black-holing while LDP is down. Forgetting that on the last remaining path the max-metric link is still used (no alternative).</p></div>
<div class="exam"><p><b>Exam trap.</b> The maximum metric is 16777214 for wide metrics and 63 for narrow metrics in IS-IS. In OSPF it is 65535. The link stays in the topology, so routing adjacency and LDP can still form.</p></div>

<div class="scn"><h4>The router reboot that dropped VPN traffic after every reload</h4><p>After a P router reload, IS-IS came up in seconds and the PEs immediately sent VPN traffic through it, but LDP needed longer. Customers lost traffic. With LDP-IGP sync enabled network-wide, the next reload showed the rebooting router's links at maximum metric until LDP was Oper, and traffic stayed on the other path.</p><p><b>Lesson:</b> enable mpls ldp sync on every MPLS core link.</p></div>

<div class="iv"><p class="q">"What is LDP-IGP synchronization and what problem does it solve?"</p><p>If the IGP is up on a link but LDP is not, traffic follows the IGP path but has no label, so labelled services black-hole. Sync makes the IGP advertise the link with maximum metric until the LDP session is operational, so traffic uses another path. It is enabled with mpls ldp sync under the IGP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP up + LDP down = labelled traffic black-holed (No Label).</li>
<li>mpls ldp sync advertises the link at maximum metric until LDP is Oper.</li>
<li>Wide metric maximum is 16777214; narrow is 63.</li>
<li>The fix is a reachable LDP router ID: mpls ldp router-id Loopback0 force.</li>
<li>Sync must be enabled on both ends of the link.</li>
</ul></div>
`.replace(`@@D@@`,e(`Diamond core: the shorter path via P1 has no LDP session.`,`via P1: cost 20`,`via P2: cost 40`)),hi:`
<p>IS-IS aur LDP alag-alag converge hote hain. Jab link up hota hai (reboot ke baad, ya naya link lagne par), IS-IS adjacency ek second mein ban sakti hai jabki LDP session ko zyada waqt lagta hai. Us gap mein IGP link par traffic bhej deta hai lekin router ke paas us neighbour se label nahi hota. Yeh chapter doosre lab, <i>bina label wala shortcut</i>, ko follow karta hai.</p>

<h3>Symptom: IP chalta hai, labels mar jaate hain</h3>
<p>Diamond core mein PE1 se PE2 tak do paths hain: P1 ke through (total cost 20) aur P2 ke through (cost 40). Ek migration test ne P1 ka LDP router ID Loopback1 (7.7.7.7) par badal diya, ek loopback jise IS-IS advertise nahi karta. IS-IS unchanged hai, isliye IP traffic abhi bhi P1 se jaata hai. Lekin LDP discovery session nahi bana pata. Toote network mein PE1 ka real output:</p>
<pre class="out">PE1# show ip route 10.0.255.4
Routing entry for 10.0.255.4/32
  Known via "isis", distance 115, metric 20
  * 10.0.12.2, via GigabitEthernet0/0

PE1# show mpls ldp discovery
 Local LDP Identifier:
    10.0.255.1:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/0 (ldp): xmit/recv
            LDP Id: <span class="hl">7.7.7.7:0; no route</span>
        GigabitEthernet0/1 (ldp): xmit/recv
            LDP Id: 10.0.255.3:0

PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
17         No Label   10.0.255.2/32    0             Gi0/0      10.0.12.2
20         <span class="hl">No Label</span>   10.0.255.4/32    0             Gi0/0      10.0.12.2</pre>
<p>Teen facts. IS-IS Gi0/0 (P1) se route karta hai. PE1 P1 ka hello sunta hai par uska LDP ID 7.7.7.7 "no route" hai, isliye TCP session nahi. PE2 ke loopback ki LFIB entry Gi0/0 par <b>No Label</b> dikhati hai. Plain traceroute chalta hai kyunki woh IP hai. Lekin MPLS VPN apna VPN label missing transport label ke upar push karega: packet P1 tak unlabelled pahunchega, aur P1 ke paas customer routes nahi, isliye traffic drop hoga. Yahi black hole hai.</p>

@@D@@

<h3>Protection: LDP-IGP synchronization</h3>
<p><code>router isis</code> ke neeche <b>mpls ldp sync</b> ke saath IS-IS LDP ka intezaar karta hai. Jab tak MPLS-enabled interface ka neighbour ke saath operational LDP session nahi hai, IS-IS link ko <b>maximum metric</b> ke saath advertise karta hai: wide metrics mein 16777214 (narrow mein 63). Link topology mein rehta hai (taaki LDP ban sake) par sirf aakhri vikalp ki tarah use hota hai.</p>
<pre class="code"><span class="c">! Chaaron routers par (lab task 2)</span>
router isis
 mpls ldp sync</pre>
<p>Sync on karne ke baad PE1 ka real output (PE1 ka apna LSP dekho):</p>
<pre class="out">PE1# show isis database detail
PE1.00-00           * 0x00000002   0x3545        1200/*                 0/0/0
  Hostname: PE1
  Metric: <span class="hl">16777214</span>  IS-Extended P1
  Metric: 20        IS-Extended P2
  Metric: 16777214  IP 10.0.12.0/24
  Metric: 20        IP 10.0.13.0/24
P1.00-00              0x00000002   0x3B4F        1200/1200              0/0/0
  Metric: 16777214  IS-Extended PE1
  Metric: 16777214  IS-Extended PE2

PE1# show ip route 10.0.255.4
  Known via "isis", distance 115, metric 40
  * 10.0.13.3, via GigabitEthernet0/1

PE1# traceroute 10.0.255.4
  1 10.0.13.3 [MPLS: Label 18 Exp 0] 1 msec 2 msec 1 msec
  2 10.0.255.4 2 msec 3 msec 2 msec</pre>
<p>P1 ki taraf ke links PE1, P1 aur PE2 teeno 16777214 par advertise karte hain. Best path ab P2 se hai (metric 40) aur traceroute label dikhata hai: <b>labelled traffic chalta hai</b>, bas lambe path par. Lab sawal "kaunsa metric?" ka jawab <b>16777214</b> hai.</p>

<h3>Root cause hatao</h3>
<p>Sync sirf protect karta hai; asal fix P1 ko usable LDP identity dena hai, bina kuch renumber kiye:</p>
<pre class="code">P1(config)# mpls ldp router-id Loopback0 force</pre>
<pre class="out">PE1# show isis database detail
PE1.00-00           * 0x00000003   0xA622        1200/*                 0/0/0
  Metric: 10        IS-Extended P1
  Metric: 20        IS-Extended P2
PE1# show ip route 10.0.255.4
  Known via "isis", distance 115, metric 20
  * 10.0.12.2, via GigabitEthernet0/0
PE1# traceroute 10.0.255.4
  1 10.0.12.2 [MPLS: Label 17 Exp 0] 1 msec 2 msec 1 msec
  2 10.0.255.4 2 msec 3 msec 2 msec</pre>
<p>P1 ke saath sessions Oper hote hi metrics 10 par wapas aate hain aur P1 wala preferred path wapas aata hai, ab end to end labelled (Label 17). Sync yahi karne ke liye bana hai: traffic tabhi wapas aata hai jab safe ho.</p>

<div class="eg"><p><b>Worked example: numbers.</b> PE1 se PE2: P1 se = 10 + 10 = 20; P2 se = 20 + 20 = 40. Sync ke saath aur P1 par LDP nahi: P1 ke links = 16777214, isliye P1 path ka cost lagbhag 33.5 million aur P2 path (40) jeet-ta hai. Fix ke baad P1 path wapas 20.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sync sirf kuch routers par on karna: link ko dono sides se maximum metric par advertise karne ke liye dono ends par chahiye. Maanna ki sync LDP fix karta hai; woh sirf LDP down hone par black-hole se bachata hai. Bhoolna ki aakhri bache hue path par max-metric link phir bhi use hota hai (koi alternative nahi).</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS mein maximum metric wide metrics ke liye 16777214 aur narrow ke liye 63 hai. OSPF mein 65535. Link topology mein rehta hai, isliye routing adjacency aur LDP phir bhi ban sakte hain.</p></div>

<div class="scn"><h4>Router reboot jisne har reload par VPN traffic giraya</h4><p>P router reload ke baad IS-IS seconds mein up hua aur PEs ne turant us se VPN traffic bhejna shuru kiya, lekin LDP ko zyada waqt laga. Customers ka traffic gaya. Network-wide LDP-IGP sync enable karne ke baad agle reload mein rebooting router ke links LDP Oper hone tak maximum metric par dikhe aur traffic doosre path par raha.</p><p><b>Lesson:</b> har MPLS core link par mpls ldp sync enable karo.</p></div>

<div class="iv"><p class="q">"LDP-IGP synchronization kya hai aur kaunsi problem solve karta hai?"</p><p>Agar link par IGP up hai par LDP nahi, to traffic IGP path follow karta hai par label nahi hota, isliye labelled services black-hole hoti hain. Sync IGP ko link maximum metric par advertise karwata hai jab tak LDP session operational na ho, isliye traffic doosre path se jaata hai. Yeh IGP ke neeche mpls ldp sync se enable hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP up + LDP down = labelled traffic black-hole (No Label).</li>
<li>mpls ldp sync LDP Oper hone tak link ko maximum metric par advertise karta hai.</li>
<li>Wide metric maximum 16777214; narrow 63.</li>
<li>Fix reachable LDP router ID hai: mpls ldp router-id Loopback0 force.</li>
<li>Sync link ke dono ends par enable hona chahiye.</li>
</ul></div>
`.replace(`@@D@@`,e(`Diamond core: P1 wale chhote path par LDP session nahi.`,`P1 se: cost 20`,`P2 se: cost 40`))}};export{t as default};