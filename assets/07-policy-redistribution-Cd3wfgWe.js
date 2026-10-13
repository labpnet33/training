var e={id:`policy-redistribution`,h:{en:`Routing objects, redistribution and the firewall policy engine`,hi:`Routing objects, redistribution aur firewall policy engine`},body:{en:`
<p>Dynamic routing becomes powerful when you control <b>which routes</b> go in and out. FortiOS gives you a small set of routing objects for this. They are plain building blocks: you create them once and attach them to OSPF, BGP or redistribution.</p>
<table class="cmp"><tr><th>Object</th><th>Matches</th><th>Typical use</th></tr><tr><td><code>router access-list</code></td><td>Prefixes (exact)</td><td>Simple permit or deny of networks</td></tr><tr><td><code>router prefix-list</code></td><td>Prefixes with ge and le length ranges</td><td>Control what you accept and announce</td></tr><tr><td><code>router aspath-list</code></td><td>AS-path patterns</td><td>Filter routes that came through a given AS</td></tr><tr><td><code>router community-list</code></td><td>BGP communities</td><td>Tag-based policy</td></tr><tr><td><code>router route-map</code></td><td>Combines matches and sets</td><td>Change attributes: local preference, MED, prepend, next hop, metric</td></tr></table>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router route-map
    edit "RM-ISPB-OUT"
        config rule
            edit 10
                set match-ip-address "PL-OUR-NET"
                config set-aspath
                    edit "65001 65001"
                    next
                end
            next
        end
    next
end</pre>
<p>This route-map matches our own prefix and prepends our AS twice, making the path through ISP-B look longer so other networks prefer ISP-A to reach us. Attach it to the ISP-B neighbour with <code>set route-map-out "RM-ISPB-OUT"</code>.</p>
<h3>Redistribution</h3>
<p><b>Redistribution</b> copies routes from one source into another protocol: static or connected routes into OSPF or BGP, BGP routes into OSPF, and so on. It is how the default route learned from an ISP reaches the branches. It is also the most common cause of loops and surprising paths, so follow three rules: redistribute only what you need, filter with a route-map or prefix-list, and never redistribute in both directions between two protocols without tags and filters.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router bgp
    config redistribute "ospf"
        set status enable
        set route-map "RM-OSPF-TO-BGP"
    end
end</pre>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="diagram"><rect x="10" y="60" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="85" y="87" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">internal routes</text><rect x="250" y="60" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">Filter</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">route-map / prefix-list</text><rect x="480" y="60" width="150" height="60" rx="10" fill="#bae6fd"/><text x="555" y="87" text-anchor="middle" class="svg-ink" font-size="13">BGP</text><text x="555" y="104" text-anchor="middle" class="svg-muted" font-size="11">to the provider</text><line x1="160" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="90" x2="480" y2="90" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">Never let a redistribution path run unfiltered in both directions.</text></svg><p class="cap">Redistribution always passes through a filter you control.</p></div>
<h3>Who wins when protocols disagree?</h3>
<p>Different sources can offer the same prefix. The distance decides: static 10 beats eBGP 20, which beats OSPF 110, which beats iBGP 200. A classic exam trap is a prefix learned by both OSPF and iBGP: OSPF wins because 110 is lower than 200, even though iBGP might look more "specific". You can change distances in the protocol settings (<code>distance-external</code>, <code>distance-internal</code>, and in OSPF <code>distance</code>), but do so deliberately.</p>
<h3>Learned routes meet the policy engine</h3>
<p>A route in the table does not mean traffic may flow. The same sequence as in <b>nse4-routing</b> applies to learned routes: the packet arrives, the reverse-path check looks at the source in the routing table (a dynamic route counts too), the destination route picks the egress interface, and only then does the firewall policy decide. A correct OSPF or BGP route with no policy produces exactly the message you saw in the backup-ISP lab:</p>
<pre class="out">id=65308 trace_id=1 msg="find a route: flag=04000000 gw-198.51.100.1 via port4"
id=65308 trace_id=1 msg="in-[port2], out-[port4], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
id=65308 trace_id=1 msg="<span class="hl">Denied by forward policy check (policy 0)</span>"</pre>
<p>The output above was captured in the nse4-routing lab with a static route; a learned route behaves identically because the policy engine does not care how a route got into the table.</p>
<p>Control traffic is different. OSPF hellos and BGP sessions to the FortiGate's own address are local traffic and need no forward policy; if you have written <b>local-in policies</b> they can block BGP (TCP 179), so check them when a peering will not come up. Finally, remember that a route to a remote branch through an IPsec tunnel also needs a policy between the LAN and the tunnel interface in both directions.</p>
<div class="warn"><p><b>Common mistake.</b> Redistributing BGP into OSPF without a filter. A full internet table, or a leaked provider route, can flood the internal network. Use a route-map that accepts only the default route or the exact prefixes you need.</p></div>
<div class="exam"><p><b>Exam trap.</b> Distance decides between protocols (static 10, eBGP 20, OSPF 110, iBGP 200); metric or attributes decide within one protocol. Routing objects: prefix-list and route-map are the workhorses.</p></div>
<div class="scn"><h4>The provider route that leaked into the LAN</h4><p>A branch redistributed BGP into OSPF without a filter. Thousands of internet prefixes appeared on the internal routers, and one more specific route pointed users to the wrong exit. The team added a route-map that accepts only 0.0.0.0/0 and measured the routing table size afterwards.</p><p><b>Lesson:</b> Every redistribution needs a filter.</p></div>
<div class="iv"><p class="q">"Why does a learned route not guarantee that traffic flows?"</p><p>Because the firewall policy engine is separate from routing. The route only selects the egress interface; a policy for the ingress and egress interface pair must allow the traffic, NAT must be right, and the reverse-path check must find a route back to the source. Control traffic like OSPF hellos and BGP is local traffic and handled differently.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Prefix-lists and route-maps filter and modify routes in OSPF, BGP and redistribution.</li><li>Redistribute only what you need and always filter.</li><li>Distance decides between protocols: 10, 20, 110, 200.</li><li>A route does not replace a firewall policy.</li></ul></div>
`,hi:`
<p>Dynamic routing tab powerful hoti hai jab aap control karte ho ki <b>kaun se routes</b> andar aur bahar jaayein. FortiOS iske liye routing objects ka chhota set deta hai. Ye seedhe building blocks hain: aap unhe ek baar banate ho aur OSPF, BGP ya redistribution se jodte ho.</p>
<table class="cmp"><tr><th>Object</th><th>Kise match karta hai</th><th>Aam use</th></tr><tr><td><code>router access-list</code></td><td>Prefixes (exact)</td><td>Networks ka simple permit ya deny</td></tr><tr><td><code>router prefix-list</code></td><td>ge aur le length ranges ke saath prefixes</td><td>Kya accept aur announce karna hai control karo</td></tr><tr><td><code>router aspath-list</code></td><td>AS-path patterns</td><td>Kisi AS se aaye routes ko filter karo</td></tr><tr><td><code>router community-list</code></td><td>BGP communities</td><td>Tag-based policy</td></tr><tr><td><code>router route-map</code></td><td>Matches aur sets milata hai</td><td>Attributes badlo: local preference, MED, prepend, next hop, metric</td></tr></table>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router route-map
    edit "RM-ISPB-OUT"
        config rule
            edit 10
                set match-ip-address "PL-OUR-NET"
                config set-aspath
                    edit "65001 65001"
                    next
                end
            next
        end
    next
end</pre>
<p>Yeh route-map hamare apne prefix se match karta hai aur hamara AS do baar prepend karta hai, jisse ISP-B ke through path lamba dikhta hai aur doosre networks hum tak pahunchne ke liye ISP-A prefer karte hain. Use ISP-B neighbour par <code>set route-map-out "RM-ISPB-OUT"</code> se jodo.</p>
<h3>Redistribution</h3>
<p><b>Redistribution</b> ek source ke routes ko doosre protocol mein copy karta hai: static ya connected routes OSPF ya BGP mein, BGP routes OSPF mein, aadi. Isi se ISP se seekha default route branches tak pahunchta hai. Yeh loops aur chauka dene wale paths ka sabse common karan bhi hai, isliye teen rules follow karo: sirf zaroori cheez redistribute karo, route-map ya prefix-list se filter karo, aur tags aur filters ke bina do protocols ke beech dono directions mein kabhi redistribute mat karo.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router bgp
    config redistribute "ospf"
        set status enable
        set route-map "RM-OSPF-TO-BGP"
    end
end</pre>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="diagram"><rect x="10" y="60" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="85" y="87" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">internal routes</text><rect x="250" y="60" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">Filter</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">route-map / prefix-list</text><rect x="480" y="60" width="150" height="60" rx="10" fill="#bae6fd"/><text x="555" y="87" text-anchor="middle" class="svg-ink" font-size="13">BGP</text><text x="555" y="104" text-anchor="middle" class="svg-muted" font-size="11">provider ko</text><line x1="160" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="90" x2="480" y2="90" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">Redistribution path ko kabhi dono directions mein bina filter ke mat chalne do.</text></svg><p class="cap">Redistribution hamesha aapke control wale filter se guzarta hai.</p></div>
<h3>Protocols mein asahmati ho to kaun jeetta hai?</h3>
<p>Alag sources same prefix de sakte hain. Distance tay karti hai: static 10, eBGP 20 se jeetta hai, jo OSPF 110 se jeetta hai, jo iBGP 200 se. Ek classic exam trap yeh hai ki prefix OSPF aur iBGP dono se seekha ho: OSPF jeetta hai kyunki 110, 200 se kam hai, chahe iBGP zyada "specific" dikhe. Aap distances ko protocol settings (<code>distance-external</code>, <code>distance-internal</code>, aur OSPF mein <code>distance</code>) mein badal sakte ho, lekin soch-samajhkar.</p>
<h3>Learned routes policy engine se milte hain</h3>
<p>Table mein route hone ka matlab yeh nahi ki traffic chal sakta hai. Wahi sequence jo <b>nse4-routing</b> mein tha learned routes par bhi lagu hota hai: packet aata hai, reverse-path check source ko routing table mein dekhta hai (dynamic route bhi gina jaata hai), destination route egress interface chunta hai, aur tabhi firewall policy decide karti hai. Sahi OSPF ya BGP route aur policy na ho to wahi message aata hai jo aapne backup-ISP lab mein dekha:</p>
<pre class="out">id=65308 trace_id=1 msg="find a route: flag=04000000 gw-198.51.100.1 via port4"
id=65308 trace_id=1 msg="in-[port2], out-[port4], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
id=65308 trace_id=1 msg="<span class="hl">Denied by forward policy check (policy 0)</span>"</pre>
<p>Upar ka output nse4-routing lab mein static route ke saath capture hua tha; learned route bilkul aise hi behave karta hai kyunki policy engine ko isse matlab nahi ki route table mein kaise aaya.</p>
<p>Control traffic alag hai. OSPF hellos aur FortiGate ke apne address par BGP sessions local traffic hain aur forward policy nahi maangte; agar aapne <b>local-in policies</b> likhi hain to ve BGP (TCP 179) ko block kar sakti hain, isliye peering up na ho to unhe check karo. Aakhir mein yaad rakho ki IPsec tunnel se remote branch ke route ko bhi LAN aur tunnel interface ke beech dono directions mein policy chahiye.</p>
<div class="warn"><p><b>Common galti.</b> BGP ko bina filter ke OSPF mein redistribute karna. Poora internet table, ya leak hua provider route internal network ko bhar sakta hai. Aisa route-map use karo jo sirf default route ya zaroori exact prefixes accept kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> Protocols ke beech distance tay karti hai (static 10, eBGP 20, OSPF 110, iBGP 200); ek protocol ke andar metric ya attributes. Routing objects: prefix-list aur route-map workhorses hain.</p></div>
<div class="scn"><h4>Provider route jo LAN mein leak hua</h4><p>Ek branch ne BGP ko bina filter ke OSPF mein redistribute kiya. Internal routers par hazaron internet prefixes aa gaye, aur ek zyada specific route ne users ko galat exit ki taraf bheja. Team ne aisa route-map lagaya jo sirf 0.0.0.0/0 accept karta hai aur baad mein routing table ka size naapa.</p><p><b>Seekh:</b> Har redistribution ko filter chahiye.</p></div>
<div class="iv"><p class="q">"Learned route ka matlab traffic chalna kyun nahi hota?"</p><p>Kyunki firewall policy engine routing se alag hai. Route sirf egress interface chunta hai; ingress aur egress interface pair ki policy traffic allow kare, NAT sahi ho, aur reverse-path check ko source tak wapas route mile. OSPF hellos aur BGP jaisa control traffic local traffic hai aur alag tareeke se handle hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Prefix-lists aur route-maps OSPF, BGP aur redistribution mein routes ko filter aur modify karte hain.</li><li>Sirf zaroori redistribute karo aur hamesha filter karo.</li><li>Protocols ke beech distance tay karti hai: 10, 20, 110, 200.</li><li>Route firewall policy ki jagah nahi leta.</li></ul></div>
`}};export{e as default};