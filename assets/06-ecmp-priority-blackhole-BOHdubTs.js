var e={id:`ecmp-priority-blackhole`,h:{en:`Distance, priority, ECMP and blackhole routes`,hi:`Distance, priority, ECMP aur blackhole routes`},body:{en:`
<p>Once you have more than one route to the same destination you need to know exactly what happens. Think of two roads to the same town. <b>Distance</b> is the traffic authority's trust rating: the road with the better rating is the only one signposted. If two roads have the same rating, <b>priority</b> is a second rating. If they are still tied, the FortiGate uses both roads: that is <b>ECMP</b>, equal-cost multipath.</p>
<h3>Mistake 1: the backup has a lower distance</h3>
<p>If you type <code>set distance 5</code> on the backup route, it beats the primary (distance 10) and all traffic leaves through the backup link while the "primary" sits idle. This is real output from the Pune lab:</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
...
Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [5/0] via 198.51.100.1, port4, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       198.51.100.0/30 is directly connected, port4
C       203.0.113.0/30 is directly connected, port1

NK-PUNE-FGT # get router info routing-table details 0.0.0.0
Routing table for VRF=0
Routing entry for 0.0.0.0/0
  Known via "static", distance 5, metric 0, candidate default, best
  * vrf 0 198.51.100.1, via port4</pre>
<h3>ECMP: equal distance, equal everything</h3>
<p>With distance 10 on both default routes the table lists two next hops and the FortiGate shares sessions between them. <code>details</code> shows both lines starting with a star:</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
...
Routing table for VRF=0
S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0]
<span class="hl">                  [10/0] via 198.51.100.1, port4, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2

NK-PUNE-FGT # get router info routing-table details 0.0.0.0
Routing table for VRF=0
Routing entry for 0.0.0.0/0
  Known via "static", distance 10, metric 0, candidate default, best
  * vrf 0 203.0.113.1, via port1
  * vrf 0 198.51.100.1, via port4</pre>
<p>How the sessions are shared is a global setting on a real FortiGate: <code>v4-ecmp-mode</code> in <code>config system settings</code> can be <code>source-ip-based</code> (the default), <code>weight-based</code>, <code>usage-based</code> or <code>source-dest-ip-based</code>. With weight-based mode the <code>weight</code> attribute of each route sets the share. Each session stays on one path, so one big download never splits across two ISPs. When ISPs differ in speed or cost, SD-WAN rules are the better tool.</p>
<h3>Priority</h3>
<p><code>priority</code> (default 1) is the tie-break between routes of the same destination and the same distance: the lower value is preferred. It is useful when two routes must keep the same distance, for example because a script or a monitoring tool expects 10. Remember the order: longest prefix, distance, then priority.</p>
<h3>Blackhole routes</h3>
<p>A <b>blackhole</b> route has no gateway; matching packets are silently dropped. Two classic uses. First, a summary: a blackhole route for a whole private range (for example 10.0.0.0/8) with a high distance catches traffic for unused addresses so it is dropped instead of leaking out through the default route to the internet. Specific routes still win because of longest prefix match. Second, routing protocols (BGP) that need a matching route in the table before they advertise a prefix.</p>
<pre class="code">config router static
    edit 3
        set dst 192.0.2.0 255.255.255.0
        set blackhole enable
        set distance 5
    next
end</pre>
<div class="note"><p><b>Note.</b> The simulator stores blackhole routes but does not print them in the routing table. On a real FortiGate they appear as a route to Null.</p></div>
<div class="warn"><p><b>Common mistake.</b> Giving a blackhole summary a low distance such as 1 or 5 when specific routes learned from OSPF (distance 110) should be used. Longest prefix still wins, but an identical prefix with a lower distance will hide the real route.</p></div>
<div class="exam"><p><b>Exam trap.</b> Equal distance and equal priority means ECMP. Different distance means one route is a backup. A /8 blackhole does not hide a /24 route, because the longest prefix wins first.</p></div>
<div class="scn"><h4>The backup that carried all the traffic</h4><p>Finance noticed an unexpectedly high bill on the cheap backup ISP. A junior had typed <code>distance 5</code> on the backup default route weeks earlier "to make failover faster". The primary link carried nothing. Setting the backup back to distance 20 fixed the bill.</p><p><b>Lesson:</b> Higher distance means backup. Review the table after every change.</p></div>
<div class="iv"><p class="q">"Two default routes have the same distance. What happens?"</p><p>If the priority is also equal, both are installed and the FortiGate load-shares sessions (ECMP) using the configured mode, source-IP based by default. If the priorities differ, the lower priority is preferred. Mention that SD-WAN gives control over how traffic is shared per application.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Lower distance is preferred; a higher distance makes a route a backup.</li><li>Equal distance and priority give ECMP; sessions are shared per mode.</li><li>Priority breaks ties between routes of the same distance (lower wins).</li><li>Blackhole routes drop traffic silently and are useful as summaries.</li></ul></div>
`,hi:`
<p>Jab ek hi destination ke liye ek se zyada routes hon to exactly pata hona chahiye kya hota hai. Ek shehar ke do raaste socho. <b>Distance</b> traffic authority ki trust rating hai: behtar rating wala raasta hi signpost hota hai. Do raaston ki rating same ho to <b>priority</b> doosri rating hai. Phir bhi barabar ho to FortiGate dono raaste use karta hai: yahi <b>ECMP</b>, equal-cost multipath hai.</p>
<h3>Galti 1: backup ki distance kam hai</h3>
<p>Agar aap backup route par <code>set distance 5</code> type karte ho to woh primary (distance 10) ko harata hai aur saara traffic backup link se nikalta hai jabki "primary" khaali baitha rehta hai. Yeh Pune lab ka real output hai:</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
...
Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [5/0] via 198.51.100.1, port4, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       198.51.100.0/30 is directly connected, port4
C       203.0.113.0/30 is directly connected, port1

NK-PUNE-FGT # get router info routing-table details 0.0.0.0
Routing table for VRF=0
Routing entry for 0.0.0.0/0
  Known via "static", distance 5, metric 0, candidate default, best
  * vrf 0 198.51.100.1, via port4</pre>
<h3>ECMP: barabar distance, sab kuch barabar</h3>
<p>Dono default routes par distance 10 ho to table do next hops dikhata hai aur FortiGate sessions ko unke beech baant deta hai. <code>details</code> dono lines star ke saath dikhata hai:</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
...
Routing table for VRF=0
S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0]
<span class="hl">                  [10/0] via 198.51.100.1, port4, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2

NK-PUNE-FGT # get router info routing-table details 0.0.0.0
Routing table for VRF=0
Routing entry for 0.0.0.0/0
  Known via "static", distance 10, metric 0, candidate default, best
  * vrf 0 203.0.113.1, via port1
  * vrf 0 198.51.100.1, via port4</pre>
<p>Sessions kaise baante jaate hain yeh real FortiGate par global setting hai: <code>config system settings</code> mein <code>v4-ecmp-mode</code> <code>source-ip-based</code> (default), <code>weight-based</code>, <code>usage-based</code> ya <code>source-dest-ip-based</code> ho sakta hai. Weight-based mode mein har route ka <code>weight</code> attribute hissa tay karta hai. Har session ek hi path par rehta hai, isliye ek bada download kabhi do ISPs mein nahi bantta. ISPs ki speed ya cost alag ho to SD-WAN rules behtar tool hain.</p>
<h3>Priority</h3>
<p><code>priority</code> (default 1) same destination aur same distance ke routes ke beech tie-break hai: kam value prefer hoti hai. Yeh tab kaam aata hai jab do routes ko same distance rakhna ho, jaise script ya monitoring tool 10 expect karta ho. Order yaad rakho: longest prefix, distance, phir priority.</p>
<h3>Blackhole routes</h3>
<p><b>Blackhole</b> route ka gateway nahi hota; matching packets chupchaap drop ho jaate hain. Do classic uses. Pehla, summary: poori private range (jaise 10.0.0.0/8) ka blackhole route, high distance ke saath, unused addresses ke traffic ko pakadta hai taaki woh default route se internet par leak hone ki jagah drop ho. Specific routes phir bhi longest prefix match se jeette hain. Doosra, routing protocols (BGP) jinhe prefix advertise karne se pehle table mein matching route chahiye.</p>
<pre class="code">config router static
    edit 3
        set dst 192.0.2.0 255.255.255.0
        set blackhole enable
        set distance 5
    next
end</pre>
<div class="note"><p><b>Note.</b> Simulator blackhole routes store karta hai lekin routing table mein print nahi karta. Real FortiGate par woh Null ke route ke roop mein dikhte hain.</p></div>
<div class="warn"><p><b>Common galti.</b> Blackhole summary ko 1 ya 5 jaisi kam distance dena jabki OSPF (distance 110) se seekhe specific routes use hone chahiye. Longest prefix phir bhi jeetta hai, lekin kam distance wala identical prefix asli route ko chhupa dega.</p></div>
<div class="exam"><p><b>Exam trap.</b> Barabar distance aur barabar priority ka matlab ECMP. Alag distance ka matlab ek route backup hai. /8 blackhole /24 route ko nahi chhupata, kyunki longest prefix pehle jeetta hai.</p></div>
<div class="scn"><h4>Backup jisne saara traffic utha liya</h4><p>Finance ne sasta backup ISP par achanak zyada bill dekha. Junior ne hafton pehle backup default route par "failover tez karne ke liye" <code>distance 5</code> type kar diya tha. Primary link par kuch nahi chal raha tha. Backup ko wapas distance 20 karne se bill theek hua.</p><p><b>Seekh:</b> Zyada distance ka matlab backup. Har change ke baad table review karo.</p></div>
<div class="iv"><p class="q">"Do default routes ki distance same hai. Kya hota hai?"</p><p>Priority bhi barabar ho to dono install hote hain aur FortiGate configured mode se sessions share karta hai (ECMP), default source-IP based. Priority alag ho to kam priority prefer hoti hai. Yeh bhi batao ki SD-WAN application ke hisaab se traffic sharing par control deta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Kam distance prefer hoti hai; zyada distance route ko backup banati hai.</li><li>Barabar distance aur priority se ECMP milta hai; sessions mode ke hisaab se share hote hain.</li><li>Priority same distance ke routes ke tie todti hai (kam jeetta hai).</li><li>Blackhole routes chupchaap traffic drop karte hain aur summaries ke roop mein kaam aate hain.</li></ul></div>
`}};export{e as default};