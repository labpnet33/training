var e={id:`bgp-config`,h:{en:`Configuring BGP on FortiOS: a dual-ISP edge`,hi:`FortiOS par BGP configure karna: dual-ISP edge`},body:{en:`
<p>The most common FortiGate BGP design is the internet edge with two providers. Our company uses private AS 65001 and its own address block 198.51.100.0/24 (a documentation range standing for provider-independent space). ISP-A (AS 65100, peer address 203.0.113.1) is primary; ISP-B (AS 65200, peer address 203.0.113.5) is the backup. Goals: advertise only our block, prefer ISP-A for outbound traffic, and never become a transit between the two providers.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router prefix-list
    edit "PL-OUR-NET"
        config rule
            edit 1
                set prefix 198.51.100.0 255.255.255.0
                unset ge
                unset le
            next
        end
    next
end
config router route-map
    edit "RM-ISPA-IN"
        config rule
            edit 10
                set set-local-preference 200
            next
        end
    next
end</pre>
<p>The prefix-list names exactly what we may announce. The route-map sets a local preference of 200 on everything learned from ISP-A, higher than the default 100, so ISP-A wins for outbound traffic.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router bgp
    set as 65001
    set router-id 10.255.0.1
    config neighbor
        edit "203.0.113.1"
            set remote-as 65100
            set description "ISP-A primary"
            set prefix-list-out "PL-OUR-NET"
            set route-map-in "RM-ISPA-IN"
            set soft-reconfiguration enable
            set password "CHANGE-ME-BGP"
        next
        edit "203.0.113.5"
            set remote-as 65200
            set description "ISP-B backup"
            set prefix-list-out "PL-OUR-NET"
            set soft-reconfiguration enable
            set password "CHANGE-ME-BGP"
        next
    end
    config network
        edit 1
            set prefix 198.51.100.0 255.255.255.0
        next
    end
end</pre>
<ul><li><code>remote-as</code> is mandatory; a neighbour without it is rejected.</li><li><code>prefix-list-out</code> is the guard against becoming a transit AS: only our /24 is ever sent to either provider, never the other provider's routes.</li><li><code>soft-reconfiguration enable</code> keeps an unmodified copy of received routes, so <code>received-routes</code> can be shown and a policy change applied without resetting the session.</li><li><code>password</code> turns on TCP MD5 authentication; the value here is a placeholder, and both sides must use the same.</li></ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="10" y="70" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="97" text-anchor="middle" class="svg-ink" font-size="13">FGT-EDGE</text><text x="75" y="114" text-anchor="middle" class="svg-muted" font-size="11">AS 65001</text><rect x="260" y="20" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="13">ISP-A</text><text x="325" y="59" text-anchor="middle" class="svg-muted" font-size="11">local-pref 200 in</text><rect x="260" y="130" width="130" height="50" rx="10" fill="#fde68a"/><text x="325" y="152" text-anchor="middle" class="svg-ink" font-size="13">ISP-B</text><text x="325" y="169" text-anchor="middle" class="svg-muted" font-size="11">default 100</text><rect x="500" y="70" width="130" height="60" rx="10" fill="#e2e8f0"/><text x="565" y="105" text-anchor="middle" class="svg-ink" font-size="13">Outbound to the internet</text><line x1="140" y1="90" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><line x1="140" y1="110" x2="260" y2="155" stroke="#64748b" stroke-width="2"/><line x1="390" y1="45" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="155" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Outbound uses ISP-A (200 > 100); ISP-B takes over if ISP-A is gone.</text></svg><p class="cap">Local preference steers outbound traffic to the primary provider.</p></div>
<h3>Other options you will see</h3>
<table class="cmp"><tr><th>Option</th><th>Use</th></tr><tr><td><code>ebgp-enforce-multihop</code></td><td>Allow an eBGP peer that is not directly connected (set the TTL with ebgp-multihop-ttl).</td></tr><tr><td><code>update-source</code></td><td>Use an interface (often a loopback) as the source of the session; common for iBGP.</td></tr><tr><td><code>next-hop-self</code></td><td>Set our address as next hop towards an iBGP peer so it can reach the route.</td></tr><tr><td><code>route-map-out</code> with set-aspath prepend</td><td>Make a path longer so the neighbour AS prefers the other provider inbound.</td></tr><tr><td><code>route-reflector-client</code></td><td>Avoid a full iBGP mesh.</td></tr><tr><td><code>maximum-prefix</code></td><td>Limit how many prefixes a peer may send; protects the routing table.</td></tr></table>
<p>In production add a <b>firewall policy</b> for each direction of user traffic, as in nse4-routing, and think about the interaction with SD-WAN: when two ISPs are SD-WAN members, BGP still advertises your prefix to both while SD-WAN decides outbound paths per application.</p>
<div class="warn"><p><b>Common mistake.</b> Announcing everything you learn. Without an outbound filter your edge firewall can advertise one provider's routes to the other and become a transit AS, carrying their traffic. Always apply an outbound prefix-list.</p></div>
<div class="exam"><p><b>Exam trap.</b> Neighbour needs remote-as. Network statements advertise only prefixes that exist in the routing table. Local preference (higher) steers outbound; prepending steers inbound. Outbound filters prevent transit.</p></div>
<div class="scn"><h4>The firewall that carried a provider's traffic</h4><p>After a configuration change removed the outbound filter, a company's FortiGate advertised ISP-A's routes to ISP-B. Parts of the internet started to reach each other through the company's single small link, which saturated. The prefix-list was restored in minutes, and maximum-prefix limits were added on both sessions.</p><p><b>Lesson:</b> Outbound filters protect other people's networks as well as yours.</p></div>
<div class="iv"><p class="q">"How do you make ISP-A the primary exit and ISP-B the backup with BGP?"</p><p>Apply a route-map inbound on the ISP-A neighbour that sets local preference higher than the default 100, for example 200. Local preference decides the exit from the AS, so outbound traffic uses ISP-A and falls back to ISP-B if the session fails. For inbound traffic I would prepend my AS number on the advertisements to ISP-B.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A dual-ISP edge needs two neighbours, one network statement and outbound filters.</li><li>Local preference in a route-map prefers one exit.</li><li>soft-reconfiguration and passwords are good practice.</li><li>Never skip the outbound prefix-list: it prevents transit.</li></ul></div>
`,hi:`
<p>Sabse common FortiGate BGP design do providers wala internet edge hai. Hamari company private AS 65001 aur apna address block 198.51.100.0/24 use karti hai (documentation range jo provider-independent space dikhata hai). ISP-A (AS 65100, peer address 203.0.113.1) primary hai; ISP-B (AS 65200, peer address 203.0.113.5) backup hai. Goals: sirf hamara block advertise karna, outbound traffic ke liye ISP-A prefer karna, aur kabhi dono providers ke beech transit na banna.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router prefix-list
    edit "PL-OUR-NET"
        config rule
            edit 1
                set prefix 198.51.100.0 255.255.255.0
                unset ge
                unset le
            next
        end
    next
end
config router route-map
    edit "RM-ISPA-IN"
        config rule
            edit 10
                set set-local-preference 200
            next
        end
    next
end</pre>
<p>Prefix-list bilkul batati hai ki hum kya announce kar sakte hain. Route-map ISP-A se seekhi har cheez par local preference 200 set karta hai, default 100 se zyada, isliye outbound traffic ke liye ISP-A jeetta hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router bgp
    set as 65001
    set router-id 10.255.0.1
    config neighbor
        edit "203.0.113.1"
            set remote-as 65100
            set description "ISP-A primary"
            set prefix-list-out "PL-OUR-NET"
            set route-map-in "RM-ISPA-IN"
            set soft-reconfiguration enable
            set password "CHANGE-ME-BGP"
        next
        edit "203.0.113.5"
            set remote-as 65200
            set description "ISP-B backup"
            set prefix-list-out "PL-OUR-NET"
            set soft-reconfiguration enable
            set password "CHANGE-ME-BGP"
        next
    end
    config network
        edit 1
            set prefix 198.51.100.0 255.255.255.0
        next
    end
end</pre>
<ul><li><code>remote-as</code> zaroori hai; uske bina neighbour reject ho jaata hai.</li><li><code>prefix-list-out</code> transit AS banne se bachane wala guard hai: dono providers ko sirf hamara /24 jaata hai, doosre provider ke routes kabhi nahi.</li><li><code>soft-reconfiguration enable</code> received routes ki unmodified copy rakhta hai, jisse <code>received-routes</code> dikhaya ja sakta hai aur policy change session reset kiye bina lagu hota hai.</li><li><code>password</code> TCP MD5 authentication on karta hai; yahan ki value placeholder hai, aur dono sides ko wahi use karna hota hai.</li></ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="10" y="70" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="97" text-anchor="middle" class="svg-ink" font-size="13">FGT-EDGE</text><text x="75" y="114" text-anchor="middle" class="svg-muted" font-size="11">AS 65001</text><rect x="260" y="20" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="325" y="42" text-anchor="middle" class="svg-ink" font-size="13">ISP-A</text><text x="325" y="59" text-anchor="middle" class="svg-muted" font-size="11">local-pref 200 in</text><rect x="260" y="130" width="130" height="50" rx="10" fill="#fde68a"/><text x="325" y="152" text-anchor="middle" class="svg-ink" font-size="13">ISP-B</text><text x="325" y="169" text-anchor="middle" class="svg-muted" font-size="11">default 100</text><rect x="500" y="70" width="130" height="60" rx="10" fill="#e2e8f0"/><text x="565" y="105" text-anchor="middle" class="svg-ink" font-size="13">Internet ki taraf outbound</text><line x1="140" y1="90" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><line x1="140" y1="110" x2="260" y2="155" stroke="#64748b" stroke-width="2"/><line x1="390" y1="45" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="155" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Outbound ISP-A use karta hai (200 > 100); ISP-A jaaye to ISP-B sambhalta hai.</text></svg><p class="cap">Local preference outbound traffic ko primary provider ki taraf steer karti hai.</p></div>
<h3>Doosre options jo dikhenge</h3>
<table class="cmp"><tr><th>Option</th><th>Use</th></tr><tr><td><code>ebgp-enforce-multihop</code></td><td>Aisa eBGP peer allow karo jo directly connected nahi (TTL ebgp-multihop-ttl se set karo).</td></tr><tr><td><code>update-source</code></td><td>Interface (aksar loopback) ko session ka source banao; iBGP ke liye common.</td></tr><tr><td><code>next-hop-self</code></td><td>iBGP peer ki taraf next hop apna address set karo taaki woh route reach kar sake.</td></tr><tr><td><code>route-map-out</code> with set-aspath prepend</td><td>Path lamba karo taaki neighbour AS inbound ke liye doosra provider prefer kare.</td></tr><tr><td><code>route-reflector-client</code></td><td>Full iBGP mesh se bacho.</td></tr><tr><td><code>maximum-prefix</code></td><td>Peer kitne prefixes bhej sakta hai usse limit karo; routing table ko bachata hai.</td></tr></table>
<p>Production mein user traffic ki har direction ke liye <b>firewall policy</b> jodo, jaise nse4-routing mein, aur SD-WAN ke saath interaction socho: jab do ISPs SD-WAN members hon, BGP phir bhi aapka prefix dono ko advertise karta hai jabki SD-WAN application ke hisaab se outbound paths tay karta hai.</p>
<div class="warn"><p><b>Common galti.</b> Jo seekha sab announce kar dena. Outbound filter ke bina aapka edge firewall ek provider ke routes doosre ko advertise karke transit AS ban sakta hai aur unka traffic carry karega. Hamesha outbound prefix-list lagao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Neighbour ko remote-as chahiye. Network statements sirf woh prefixes advertise karte hain jo routing table mein hain. Local preference (zyada) outbound steer karti hai; prepending inbound. Outbound filters transit rokte hain.</p></div>
<div class="scn"><h4>Firewall jisne provider ka traffic carry kiya</h4><p>Configuration change ne outbound filter hataya aur company ka FortiGate ISP-A ke routes ISP-B ko advertise karne laga. Internet ke kuch hisse company ki ek chhoti link se ek doosre tak pahunchne lage, jo saturate ho gayi. Prefix-list minutes mein wapas lagi, aur dono sessions par maximum-prefix limits jodi gayi.</p><p><b>Seekh:</b> Outbound filters doosron ke networks ko bhi bachate hain, sirf aapke nahi.</p></div>
<div class="iv"><p class="q">"BGP se ISP-A ko primary exit aur ISP-B ko backup kaise banate ho?"</p><p>ISP-A neighbour par inbound route-map lagao jo local preference default 100 se zyada, jaise 200, set kare. Local preference AS se exit tay karti hai, isliye outbound traffic ISP-A use karta hai aur session fail ho to ISP-B par jaata hai. Inbound traffic ke liye ISP-B ko jaane wale advertisements par apna AS number prepend karunga.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Dual-ISP edge ko do neighbours, ek network statement aur outbound filters chahiye.</li><li>Route-map mein local preference ek exit prefer karti hai.</li><li>soft-reconfiguration aur passwords achhi practice hain.</li><li>Outbound prefix-list kabhi skip mat karo: yeh transit rokti hai.</li></ul></div>
`}};export{e as default};