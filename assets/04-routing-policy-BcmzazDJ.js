var e={id:`routing-policy`,h:{en:`Routing into the tunnel and the firewall policies`,hi:`Tunnel mein routing aur firewall policies`},body:{en:`
<p>A tunnel that is up still carries nothing until the firewall knows <b>where to send packets</b> and <b>whether it may</b>. Route-based IPsec turns the tunnel into an interface, so the two jobs are the ordinary FortiGate ones: a <b>route</b> pointing at the tunnel interface and a <b>firewall policy</b> allowing the traffic in each direction. Missing either is the most frequent reason for "VPN is up but nothing works".</p>

<h3>The packet's journey</h3>
<ol>
<li>A PC at HQ (10.10.0.25) pings a branch host (10.20.0.30). The packet arrives on <code>port2</code>.</li>
<li>The FortiGate does a <b>route lookup</b> for 10.20.0.30. The best route must point out of the tunnel interface <code>to-BRANCH</code>.</li>
<li>The FortiGate checks <b>firewall policy</b> from <code>port2</code> to <code>to-BRANCH</code>. A matching accept policy lets the packet pass.</li>
<li>The packet leaves through the tunnel interface, is encrypted with ESP and wrapped in a new header from 203.0.113.10 to 198.51.100.10, and goes out of <code>port1</code>.</li>
<li>The branch decrypts it, performs its own route and policy checks, and delivers it. The reply makes the mirror journey.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Packet journey into the tunnel">
<rect x="10" y="50" width="105" height="55" rx="10" fill="#bae6fd"/><text x="62" y="82" text-anchor="middle" class="svg-ink" font-size="12">PC 10.10.0.25</text>
<rect x="135" y="50" width="110" height="55" rx="10" fill="#bbf7d0"/><text x="190" y="75" text-anchor="middle" class="svg-ink" font-size="12">1 Route lookup</text><text x="190" y="93" text-anchor="middle" class="svg-muted" font-size="12">dev to-BRANCH</text>
<rect x="265" y="50" width="110" height="55" rx="10" fill="#fde68a"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="12">2 Policy</text><text x="320" y="93" text-anchor="middle" class="svg-muted" font-size="12">accept</text>
<rect x="395" y="50" width="110" height="55" rx="10" fill="#fed7aa"/><text x="450" y="75" text-anchor="middle" class="svg-ink" font-size="12">3 Encrypt</text><text x="450" y="93" text-anchor="middle" class="svg-muted" font-size="12">ESP, port1</text>
<rect x="525" y="50" width="105" height="55" rx="10" fill="#ddd6fe"/><text x="577" y="82" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<line x1="115" y1="78" x2="135" y2="78" stroke="#64748b" stroke-width="2"/><line x1="245" y1="78" x2="265" y2="78" stroke="#64748b" stroke-width="2"/><line x1="375" y1="78" x2="395" y2="78" stroke="#64748b" stroke-width="2"/><line x1="505" y1="78" x2="525" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">No route = packet goes to the default route (internet) unencrypted or is dropped</text>
</svg><p class="cap">Route first, then policy, then encryption.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>Address objects, the routes and the two policies on FGT-HQ:</p>
<pre class="code"><span class="c"># Address objects</span>
config firewall address
    edit "HQ-LAN"
        set subnet 10.10.0.0 255.255.255.0
    next
    edit "BRANCH-LAN"
        set subnet 10.20.0.0 255.255.255.0
    next
end

<span class="c"># Route into the tunnel, plus a blackhole safety net</span>
config router static
    edit 10
        set dst 10.20.0.0 255.255.255.0
        set device "to-BRANCH"
    next
    edit 11
        set dst 10.20.0.0 255.255.255.0
        set blackhole enable
        set distance 254
    next
end

<span class="c"># Policies in both directions, NAT off</span>
config firewall policy
    edit 20
        set name "HQ-to-BRANCH"
        set srcintf "port2"
        set dstintf "to-BRANCH"
        set srcaddr "HQ-LAN"
        set dstaddr "BRANCH-LAN"
        set action accept
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
    edit 21
        set name "BRANCH-to-HQ"
        set srcintf "to-BRANCH"
        set dstintf "port2"
        set srcaddr "BRANCH-LAN"
        set dstaddr "HQ-LAN"
        set action accept
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
end</pre>
<p>The branch has the mirror configuration with its own LAN interface. NAT is left off on both policies, because the two LANs have different, non-overlapping private ranges and should see each other's real addresses. If the LANs overlap, you need NAT or readdressing; that is a design problem to solve before building the tunnel.</p>

<h3>Why the blackhole route?</h3>
<p>When the tunnel is down, its interface goes down and the static route through it is withdrawn. Traffic for 10.20.0.0/24 would then match the default route and leave through the internet interface in clear text, where the internet will simply drop a private address, or worse, leak it to the ISP. A <b>blackhole route</b> to the same prefix with a higher administrative distance (254 here) stays in the table while the tunnel route is gone, and drops the traffic safely. It also gives a clean failure instead of a confusing one.</p>

<h3>Policy details that bite</h3>
<ul>
<li><b>Two policies, not one.</b> A FortiGate policy is one-directional; the reply is allowed by the session, but a new connection that starts at the branch needs the second policy.</li>
<li><b>Interface and address objects must match the route.</b> The policy's incoming and outgoing interfaces must be the ones the route lookup chooses.</li>
<li><b>Reverse path forwarding (RPF).</b> Return traffic must arrive on the interface that the FortiGate would use to reach the source. A route to the branch via the wrong interface causes drops that look like policy issues. See <b>nse4-routing</b> for the reverse path check.</li>
<li><b>Order.</b> A broader earlier policy, such as a deny or an internet policy with NAT, can match first. Check <b>nse4-policy</b> for policy ordering.</li>
</ul>

<h3>Dynamic routing over the tunnel</h3>
<p>For many sites, static routes become painful. Because the tunnel is an interface, OSPF or BGP can run over it (see <b>nse4-dynamic</b>), learning branch networks automatically and failing over between two tunnels. Tunnel interface addressing is then useful, and you can give the tunnel interface an IP with <code>set ip</code> and <code>set remote-ip</code> in the interface settings.</p>

<div class="eg"><p><b>Worked example.</b> Phase 1 and 2 are up, and the HQ PC cannot ping the branch. The policy list shows policy 20 but no policy 21, so branch-initiated connections are denied by the implicit deny. After adding policy 21 and a static route on the branch for 10.10.0.0/24 through its tunnel, pings work both ways. A packet capture on the HQ port1 earlier showed ESP packets only leaving but none returning, which pointed to the missing return route at the branch.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A route pointing to a gateway address instead of the tunnel device. NAT enabled on the tunnel policy, so the branch sees the HQ firewall's address instead of the real source. No policy in one direction. Overlapping subnets at the two sites.</p></div>
<div class="exam"><p><b>Exam trap.</b> In route-based IPsec, the static route uses the tunnel interface as the outgoing device, and policies reference the tunnel interface as source or destination interface. A policy cannot match traffic that was never routed into the tunnel.</p></div>

<div class="scn"><h4>Encrypted pings that went nowhere</h4><p>A new branch tunnel showed phase 1 and phase 2 established. HQ could not ping branch hosts. Packet capture showed no ESP leaving at all. The route to the branch LAN pointed at the default gateway, because the static route had been entered with the wrong interface selected. Correcting the route device to the tunnel interface solved it in a minute.</p><p><b>Lesson:</b> when a tunnel is up and nothing flows, check route lookup first.</p></div>

<div class="iv"><p class="q">"What do you need besides phase 1 and phase 2 for a route-based tunnel to work?"</p><p>A route for the remote subnet pointing out of the tunnel interface, and firewall policies in each direction between the LAN interface and the tunnel interface, usually with NAT disabled. I also add a blackhole route with a higher distance so traffic does not leak to the internet when the tunnel is down, and I check the return route on the remote side.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route-based IPsec needs a route to the tunnel interface plus policies both ways.</li>
<li>NAT is normally disabled for site-to-site traffic between distinct private ranges.</li>
<li>A blackhole route with a higher distance prevents leaks when the tunnel is down.</li>
<li>Check route first, policy second, return path third.</li>
<li>OSPF or BGP can run over the tunnel interface for many sites.</li>
</ul></div>
`,hi:`
<p>Up tunnel bhi tab tak kuch carry nahi karta jab tak firewall ko pata na ho ki <b>packets kahan bhejne hain</b> aur <b>bhej sakta hai ya nahi</b>. Route-based IPsec tunnel ko interface bana deta hai, isliye dono kaam normal FortiGate wale hain: tunnel interface ki taraf point karta <b>route</b> aur har direction mein traffic allow karne wali <b>firewall policy</b>. Inme se koi ek missing ho to "VPN up hai lekin kuch kaam nahi karta" ka sabse aam karan wahi hai.</p>

<h3>Packet ka safar</h3>
<ol>
<li>HQ ka PC (10.10.0.25) branch host (10.20.0.30) ko ping karta hai. Packet <code>port2</code> par aata hai.</li>
<li>FortiGate 10.20.0.30 ke liye <b>route lookup</b> karta hai. Best route tunnel interface <code>to-BRANCH</code> se bahar point karna chahiye.</li>
<li>FortiGate <code>port2</code> se <code>to-BRANCH</code> tak <b>firewall policy</b> check karta hai. Matching accept policy packet ko jaane deti hai.</li>
<li>Packet tunnel interface se nikalta hai, ESP se encrypt hota hai aur 203.0.113.10 se 198.51.100.10 tak naye header mein wrap hokar <code>port1</code> se bahar jaata hai.</li>
<li>Branch use decrypt karta hai, apne route aur policy checks karta hai, aur deliver karta hai. Reply mirror safar karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Tunnel mein packet ka safar">
<rect x="10" y="50" width="105" height="55" rx="10" fill="#bae6fd"/><text x="62" y="82" text-anchor="middle" class="svg-ink" font-size="12">PC 10.10.0.25</text>
<rect x="135" y="50" width="110" height="55" rx="10" fill="#bbf7d0"/><text x="190" y="75" text-anchor="middle" class="svg-ink" font-size="12">1 Route lookup</text><text x="190" y="93" text-anchor="middle" class="svg-muted" font-size="12">dev to-BRANCH</text>
<rect x="265" y="50" width="110" height="55" rx="10" fill="#fde68a"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="12">2 Policy</text><text x="320" y="93" text-anchor="middle" class="svg-muted" font-size="12">accept</text>
<rect x="395" y="50" width="110" height="55" rx="10" fill="#fed7aa"/><text x="450" y="75" text-anchor="middle" class="svg-ink" font-size="12">3 Encrypt</text><text x="450" y="93" text-anchor="middle" class="svg-muted" font-size="12">ESP, port1</text>
<rect x="525" y="50" width="105" height="55" rx="10" fill="#ddd6fe"/><text x="577" y="82" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<line x1="115" y1="78" x2="135" y2="78" stroke="#64748b" stroke-width="2"/><line x1="245" y1="78" x2="265" y2="78" stroke="#64748b" stroke-width="2"/><line x1="375" y1="78" x2="395" y2="78" stroke="#64748b" stroke-width="2"/><line x1="505" y1="78" x2="525" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Route nahi = packet default route (internet) par bina encrypt jaata hai ya drop hota hai</text>
</svg><p class="cap">Pehle route, phir policy, phir encryption.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>FGT-HQ par address objects, routes aur do policies:</p>
<pre class="code"><span class="c"># Address objects</span>
config firewall address
    edit "HQ-LAN"
        set subnet 10.10.0.0 255.255.255.0
    next
    edit "BRANCH-LAN"
        set subnet 10.20.0.0 255.255.255.0
    next
end

<span class="c"># Tunnel mein route, plus blackhole safety net</span>
config router static
    edit 10
        set dst 10.20.0.0 255.255.255.0
        set device "to-BRANCH"
    next
    edit 11
        set dst 10.20.0.0 255.255.255.0
        set blackhole enable
        set distance 254
    next
end

<span class="c"># Dono directions ki policies, NAT off</span>
config firewall policy
    edit 20
        set name "HQ-to-BRANCH"
        set srcintf "port2"
        set dstintf "to-BRANCH"
        set srcaddr "HQ-LAN"
        set dstaddr "BRANCH-LAN"
        set action accept
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
    edit 21
        set name "BRANCH-to-HQ"
        set srcintf "to-BRANCH"
        set dstintf "port2"
        set srcaddr "BRANCH-LAN"
        set dstaddr "HQ-LAN"
        set action accept
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
end</pre>
<p>Branch par apne LAN interface ke saath mirror configuration hoti hai. Dono policies par NAT off rakha hai, kyunki dono LANs ki alag, non-overlapping private ranges hain aur unhe ek-doosre ke real addresses dikhne chahiye. LANs overlap karein to NAT ya readdressing chahiye; yeh design problem tunnel banane se pehle solve karni hai.</p>

<h3>Blackhole route kyun?</h3>
<p>Tunnel down ho to uska interface down ho jaata hai aur uske through wala static route hat jaata hai. Tab 10.20.0.0/24 ka traffic default route se match karke internet interface se clear text mein nikal jaata hai, jahan internet private address ko drop kar deta hai, ya aur bura, ISP tak leak ho jaata hai. Usi prefix ka <b>blackhole route</b> jo zyada administrative distance (yahan 254) ke saath hota hai, tunnel route hatne par bhi table mein rehta hai aur traffic ko safely drop kar deta hai. Isse confusing ke bajaye saaf failure milta hai.</p>

<h3>Policy ki woh details jo kaat-ti hain</h3>
<ul>
<li><b>Ek nahi, do policies.</b> FortiGate policy one-directional hoti hai; reply session se allow ho jaata hai, lekin branch se shuru hone wale naye connection ko doosri policy chahiye.</li>
<li><b>Interface aur address objects route se match hone chahiye.</b> Policy ke incoming aur outgoing interfaces wahi hone chahiye jo route lookup chunta hai.</li>
<li><b>Reverse path forwarding (RPF).</b> Return traffic usi interface par aana chahiye jis se FortiGate source tak pahunchta. Galat interface se branch ka route aise drops deta hai jo policy issues jaise dikhte hain. Reverse path check ke liye <b>nse4-routing</b> dekho.</li>
<li><b>Order.</b> Pehle wali broader policy, jaise deny ya NAT wali internet policy, pehle match ho sakti hai. Policy ordering ke liye <b>nse4-policy</b> dekho.</li>
</ul>

<h3>Tunnel par dynamic routing</h3>
<p>Kai sites ke liye static routes dard ban jaate hain. Tunnel interface hone ki wajah se OSPF ya BGP uske upar chal sakte hain (<b>nse4-dynamic</b> dekho), branch networks automatically seekhte hain aur do tunnels ke beech failover karte hain. Tab tunnel interface addressing kaam aati hai, aur interface settings mein <code>set ip</code> aur <code>set remote-ip</code> se tunnel interface ko IP de sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> Phase 1 aur 2 up hain, aur HQ PC branch ko ping nahi kar paata. Policy list mein policy 20 hai lekin policy 21 nahi, isliye branch-initiated connections implicit deny se rok diye jaate hain. Policy 21 aur branch par apne tunnel se 10.10.0.0/24 ka static route add karne ke baad pings dono taraf chalte hain. Pehle HQ port1 par packet capture mein sirf ESP packets jaate dikhe aur laut-te nahi, jo branch par missing return route ki taraf ishara tha.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Route jo tunnel device ke bajaye gateway address par point karta hai. Tunnel policy par NAT enabled, jisse branch ko asli source ke bajaye HQ firewall ka address dikhta hai. Ek direction mein policy nahi. Dono sites par overlapping subnets.</p></div>
<div class="exam"><p><b>Exam trap.</b> Route-based IPsec mein static route outgoing device ki tarah tunnel interface use karta hai, aur policies tunnel interface ko source ya destination interface ki tarah reference karti hain. Jo traffic tunnel mein route hi nahi hua use policy match nahi kar sakti.</p></div>

<div class="scn"><h4>Encrypted pings jo kahin nahi gaye</h4><p>Naye branch tunnel mein phase 1 aur phase 2 established the. HQ branch hosts ko ping nahi kar paaya. Packet capture mein ESP bahar jaata hi nahi dikha. Branch LAN ka route default gateway par point kar raha tha, kyunki static route galat interface select karke daala gaya tha. Route device ko tunnel interface par sahi karne se ek minute mein solve ho gaya.</p><p><b>Lesson:</b> tunnel up ho aur kuch na chale to pehle route lookup check karo.</p></div>

<div class="iv"><p class="q">"Route-based tunnel ke kaam karne ke liye phase 1 aur phase 2 ke alawa aur kya chahiye?"</p><p>Remote subnet ke liye tunnel interface se bahar point karta route, aur LAN interface aur tunnel interface ke beech har direction mein firewall policies, aam taur par NAT disabled ke saath. Main zyada distance ka blackhole route bhi add karta hoon taaki tunnel down hone par traffic internet par leak na ho, aur remote side par return route check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route-based IPsec ko tunnel interface ka route aur dono taraf policies chahiye.</li>
<li>Alag private ranges ke beech site-to-site traffic ke liye NAT aam taur par disabled hota hai.</li>
<li>Zyada distance ka blackhole route tunnel down hone par leak rokta hai.</li>
<li>Pehle route, phir policy, phir return path check karo.</li>
<li>Kai sites ke liye tunnel interface par OSPF ya BGP chal sakta hai.</li>
</ul></div>
`}};export{e as default};