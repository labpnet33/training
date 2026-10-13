var e={id:`floating-routes`,h:{en:`Floating static routes: a backup ISP that takes over by itself`,hi:`Floating static routes: backup ISP jo apne aap sambhal leta hai`},body:{en:`
<p>Many branches have two internet links: a fast primary (ISP-A) and a cheaper backup (ISP-B). You want users to use ISP-A, and to switch to ISP-B automatically if ISP-A fails. The classic way is the <b>floating static route</b>: two default routes with different administrative distances. The route with the lower distance is installed and used. The one with the higher distance "floats" below it, ready to appear when the first one disappears.</p>
<pre class="code">config router static
    edit 2
        set gateway 198.51.100.1
        set device "port4"
        set distance 20
    next
end</pre>
<p>This is the second lab. Route 1 (the default via 203.0.113.1 on port1) keeps the default distance 10. Route 2 uses 198.51.100.1 on port4 with distance 20. Look at the table: both routes exist in the configuration, but only the better one is installed.</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
       O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       V - BGP VPNv4
       * - candidate default

Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       198.51.100.0/30 is directly connected, port4
C       203.0.113.0/30 is directly connected, port1</pre>
<h3>Failover: port1 goes down</h3>
<p>Now the interface port1 is shut (<code>set status down</code>). Its connected route and the distance-10 default route that uses it vanish. The distance-20 route is now the best default route and is installed:</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
...
Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [20/0] via 198.51.100.1, port4, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       198.51.100.0/30 is directly connected, port4

NK-PUNE-FGT # execute traceroute 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 32 hops max, 3 probe packets per hop, 84 byte packets
 1  <span class="hl">198.51.100.1</span>  0.390 ms  0.360 ms  0.370 ms
 2  100.64.2.2  0.540 ms  0.510 ms  0.520 ms
 3  8.8.8.8  0.700 ms  0.670 ms  0.680 ms</pre>
<h3>The step people forget: the firewall policy</h3>
<p>A route is only half the job. Policy 1 allows traffic from port2 to port1 only. When the packet is routed out of port4, no policy matches and the implicit deny drops it:</p>
<pre class="out">id=65308 trace_id=1 msg="find a route: flag=04000000 gw-198.51.100.1 via port4"
id=65308 trace_id=1 msg="in-[port2], out-[port4], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
id=65308 trace_id=1 msg="<span class="hl">Denied by forward policy check (policy 0)</span>"</pre>
<p>The fix is <code>append dstintf port4</code> in policy 1. The same trace now ends with <code>Allowed by Policy-1: SNAT</code> and the source is translated to the address of the backup interface, <code>198.51.100.2</code>. That also explains why internet servers see a different public address during an outage. When port1 comes back (<code>set status up</code>), the distance-10 route returns and traffic moves back to ISP-A without any command.</p>
<pre class="out">NK-PUNE-FGT # show firewall policy
config firewall policy
    edit 1
        set name "LAN-to-WAN"
        ...
        set srcintf "port2"
        set dstintf "port1" <span class="hl">"port4"</span>
        set action accept
        set nat enable
    next
end</pre>
<h3>The limit of floating routes</h3>
<p>A static route is removed only when its <b>interface</b> goes down. If the cable is fine and the link light is green but ISP-A's router is dead or its upstream is broken, the route stays and traffic is black-holed. To detect that you need active probing. Two tools exist on a real FortiGate: <code>config system link-monitor</code> (with <code>update-static-route</code>) and the SD-WAN performance SLA, which is the modern answer and is covered in the SD-WAN module.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config system link-monitor
    edit "ISPA-CHECK"
        set srcintf "port1"
        set server "198.51.100.254"
        set gateway-ip 203.0.113.1
        set update-static-route enable
    next
end</pre>
<div class="warn"><p><b>Common mistake.</b> Forgetting the policy for the backup interface, or forgetting that NAT will now use the backup address. Test the failover for real before the outage does.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lower distance wins; the route with the higher distance is the backup. If the primary interface stays up but the gateway is dead, a plain floating route does not fail over; you need link monitoring or SD-WAN SLA.</p></div>
<div class="scn"><h4>ISP-A outage in Pune</h4><p>A fibre cut took ISP-A down for three hours. Users noticed nothing except that a few websites asked them to log in again because their public address changed to the backup ISP's address. The same firewall switched back automatically when the fibre was repaired.</p><p><b>Lesson:</b> A tested floating route plus a policy for the backup interface gives cheap, automatic resilience.</p></div>
<div class="iv"><p class="q">"How do you build a backup internet link on a FortiGate?"</p><p>Two default routes: primary with the default distance, backup with a higher distance on the second interface. Add the backup interface to the policy (or use a zone). Test by shutting the primary. Mention the limit that a route only disappears when the interface goes down, and that link monitor or SD-WAN SLA detect a dead gateway.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Floating route = same destination, higher distance, installed only when the better route is gone.</li><li>The backup interface needs a firewall policy too.</li><li>NAT switches to the backup interface address during failover.</li><li>Static routes follow the interface state only; probes need link monitor or SD-WAN SLA.</li></ul></div>
`,hi:`
<p>Bahut si branches ke paas do internet links hote hain: tez primary (ISP-A) aur sasta backup (ISP-B). Aap chahte ho ki users ISP-A use karein, aur ISP-A fail ho to apne aap ISP-B par chale jaayein. Classic tareeka <b>floating static route</b> hai: alag administrative distance wale do default routes. Kam distance wala route install hota hai aur use hota hai. Zyada distance wala route uske neeche "float" karta hai, pehle route ke gayab hote hi aane ke liye taiyaar.</p>
<pre class="code">config router static
    edit 2
        set gateway 198.51.100.1
        set device "port4"
        set distance 20
    next
end</pre>
<p>Yeh doosra lab hai. Route 1 (port1 par 203.0.113.1 ke through default) default distance 10 rakhta hai. Route 2 port4 par 198.51.100.1 use karta hai, distance 20 ke saath. Table dekho: dono routes configuration mein hain, lekin sirf behtar wala install hua hai.</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
       O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       V - BGP VPNv4
       * - candidate default

Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       198.51.100.0/30 is directly connected, port4
C       203.0.113.0/30 is directly connected, port1</pre>
<h3>Failover: port1 down ho jaata hai</h3>
<p>Ab interface port1 band hota hai (<code>set status down</code>). Uska connected route aur use karne wala distance-10 default route gayab ho jaate hain. Distance-20 route ab best default route hai aur install ho jaata hai:</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
...
Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [20/0] via 198.51.100.1, port4, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       198.51.100.0/30 is directly connected, port4

NK-PUNE-FGT # execute traceroute 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 32 hops max, 3 probe packets per hop, 84 byte packets
 1  <span class="hl">198.51.100.1</span>  0.390 ms  0.360 ms  0.370 ms
 2  100.64.2.2  0.540 ms  0.510 ms  0.520 ms
 3  8.8.8.8  0.700 ms  0.670 ms  0.680 ms</pre>
<h3>Woh step jo log bhool jaate hain: firewall policy</h3>
<p>Route sirf aadha kaam hai. Policy 1 sirf port2 se port1 tak traffic allow karti hai. Jab packet port4 se route hota hai to koi policy match nahi karti aur implicit deny use drop kar deta hai:</p>
<pre class="out">id=65308 trace_id=1 msg="find a route: flag=04000000 gw-198.51.100.1 via port4"
id=65308 trace_id=1 msg="in-[port2], out-[port4], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
id=65308 trace_id=1 msg="<span class="hl">Denied by forward policy check (policy 0)</span>"</pre>
<p>Fix policy 1 mein <code>append dstintf port4</code> hai. Ab wahi trace <code>Allowed by Policy-1: SNAT</code> par khatam hota hai aur source backup interface ke address <code>198.51.100.2</code> mein translate hota hai. Isse yeh bhi samajh aata hai ki outage ke dauran internet servers ko alag public address kyun dikhta hai. Port1 wapas aata hai (<code>set status up</code>) to distance-10 route laut aata hai aur traffic bina kisi command ke ISP-A par wapas chala jaata hai.</p>
<pre class="out">NK-PUNE-FGT # show firewall policy
config firewall policy
    edit 1
        set name "LAN-to-WAN"
        ...
        set srcintf "port2"
        set dstintf "port1" <span class="hl">"port4"</span>
        set action accept
        set nat enable
    next
end</pre>
<h3>Floating routes ki limit</h3>
<p>Static route tabhi hatta hai jab uska <b>interface</b> down ho. Cable theek ho aur link light green ho par ISP-A ka router mara ho ya upstream toota ho to route rehta hai aur traffic black-hole ho jaata hai. Iska pata lagane ke liye active probing chahiye. Real FortiGate par do tools hain: <code>config system link-monitor</code> (<code>update-static-route</code> ke saath) aur SD-WAN performance SLA, jo modern jawab hai aur SD-WAN module mein cover hota hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config system link-monitor
    edit "ISPA-CHECK"
        set srcintf "port1"
        set server "198.51.100.254"
        set gateway-ip 203.0.113.1
        set update-static-route enable
    next
end</pre>
<div class="warn"><p><b>Common galti.</b> Backup interface ki policy bhool jaana, ya yeh bhool jaana ki NAT ab backup address use karega. Outage se pehle failover ko sach mein test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kam distance jeetta hai; zyada distance wala route backup hai. Primary interface up rahe par gateway mara ho to simple floating route fail over nahi karta; link monitoring ya SD-WAN SLA chahiye.</p></div>
<div class="scn"><h4>Pune mein ISP-A outage</h4><p>Fibre cut se ISP-A teen ghante ke liye down raha. Users ko kuch pata nahi chala, sirf kuch websites ne dobara login maanga kyunki unka public address backup ISP ke address mein badal gaya tha. Fibre repair hote hi wahi firewall apne aap wapas switch ho gaya.</p><p><b>Seekh:</b> Test kiya hua floating route aur backup interface ki policy sasti, automatic resilience deti hai.</p></div>
<div class="iv"><p class="q">"FortiGate par backup internet link kaise banate ho?"</p><p>Do default routes: primary default distance ke saath, backup doosre interface par zyada distance ke saath. Backup interface ko policy mein jodo (ya zone use karo). Primary band karke test karo. Limit bhi batao ki route tabhi hatta hai jab interface down ho, aur dead gateway ko link monitor ya SD-WAN SLA pakadte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Floating route = same destination, zyada distance, tabhi install jab behtar route chala jaaye.</li><li>Backup interface ko bhi firewall policy chahiye.</li><li>Failover ke dauran NAT backup interface ke address par switch ho jaata hai.</li><li>Static routes sirf interface state follow karte hain; probes ke liye link monitor ya SD-WAN SLA chahiye.</li></ul></div>
`}};export{e as default};