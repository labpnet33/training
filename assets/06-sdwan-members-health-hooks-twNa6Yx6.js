var e={id:`members-health-hooks`,h:{en:`Tunnels as SD-WAN members, overlay health checks and the ADVPN hooks`,hi:`Tunnels SD-WAN members ki tarah, overlay health checks aur ADVPN hooks`},body:{en:`
<p>A tunnel becomes useful to SD-WAN when it is a member of a zone with a health check. The foundation module nse4-sdwan taught the members, zones and SLA. Here we add what is special about IPsec tunnels as members, and look at the two phase 1 options that prepare the ground for ADVPN.</p>
<h3>Tunnels as members</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: overlay tunnels to HUB1 as members of the zone overlay</span>
config system sdwan
    set status enable
    config zone
        edit "overlay"
        next
    end
    config members
        edit 1
            set interface "HUB1-VPN1"
            set zone "overlay"
        next
        edit 2
            set interface "HUB1-VPN2"
            set zone "overlay"
        next
    end
end</pre>
<p>The members refer to the tunnel interface, not to wan1 or wan2. The underlay interfaces are members of another zone, for example underlay, and carry the traffic that does not go through the hub (such as direct internet access). The overlay zone is what the policies and the SD-WAN rules for corporate traffic point to.</p>
<h3>Things that are specific to tunnel members</h3>
<ul><li><b>The tunnel interface exists only when phase 1 exists.</b> If the tunnel is not configured or is down, the member is dead, which is correct.</li><li><b>Up does not mean healthy.</b> A tunnel can be up in IKE and still lose packets. This is why a health check on the tunnel is needed, not only the IKE state.</li><li><b>Routes follow the tunnel.</b> The routes that BGP learns point out of the tunnel interface. When the tunnel is down, those routes go away and SD-WAN no longer sees the member as usable (chapter 2 of fsd-routing).</li><li><b>Cost and priority.</b> Members have settings such as priority and cost, which rules can use. In active-backup designs, the primary hub tunnel has the better priority.</li></ul>
<h3>Overlay health checks</h3>
<p>The health check measures through the tunnel, so its target must be reachable <b>inside the overlay</b>. Typical targets are the hub tunnel IP or the hub loopback. Probes need a route back, so the hub must know how to answer to the source address of the probe.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: health check towards the HUB1 loopback through both tunnels</span>
config system sdwan
    config health-check
        edit "HUB1_HC"
            set server "10.255.255.1"
            set protocol ping
            set interval 500
            set members 1 2
            set source 10.255.255.11
            config sla
                edit 1
                    set latency-threshold 150
                    set jitter-threshold 30
                    set packetloss-threshold 2
                next
            end
        next
    end
end</pre>
<p>Design points:</p>
<ul><li><b>Probe source.</b> If the source is the spoke loopback, the hub must have a route to it and the answer must come back through the same tunnel; this is another reason for the loopback routing design of fsd-routing. If the source is not set, the probe uses the tunnel IP of the member.</li><li><b>Probe interval.</b> Short intervals detect faster but multiply probe traffic with hundreds of spokes. Values in the hundreds of milliseconds are common; take the hub load into account.</li><li><b>Same health-check name on all spokes.</b> It makes templates and the monitor easier.</li><li><b>Thresholds from the application.</b> 150 ms, 30 ms and 2 percent are lab values. Use what your voice or video policy needs.</li></ul>
<p>The BGP self-healing design of fsd-routing (SD-WAN neighbor, communities, route tags) builds on this health check: when the SLA is met or not, the spoke tells the hub with communities.</p>
<h3>A preview of the ADVPN hooks</h3>
<p>ADVPN lets two spokes build a direct shortcut tunnel when they talk to each other, so that spoke-to-spoke traffic does not go through the hub all the time. The next module, fsd-advpn, covers it in full. Two phase 1 options matter here, because they are part of the overlay design from the start:</p>
<table class="cmp"><tr><th>Option</th><th>Where</th><th>Meaning</th></tr><tr><td><code>auto-discovery-sender enable</code></td><td>Hub phase 1</td><td>The hub tells a spoke that a better, direct path to another spoke may exist</td></tr><tr><td><code>auto-discovery-receiver enable</code></td><td>Spoke phase 1</td><td>The spoke accepts such hints and starts a shortcut negotiation</td></tr></table>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Hooks only. The full ADVPN design is in fsd-advpn.</span>
<span class="c">! HUB1-FGT</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set auto-discovery-sender enable
    next
end
<span class="c">! BR1-FGT</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set auto-discovery-receiver enable
    next
end</pre>
<p>Shortcut tunnels are created dynamically and are linked to the parent tunnel by the network ID and the exchanged addresses. This is another reason why the overlay IDs and address plan of chapters 4 and 5 are not optional.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="diagram"><rect x="230" y="10" width="180" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT (sender)</text><rect x="20" y="150" width="150" height="55" rx="10" fill="#bbf7d0"/><text x="95" y="182" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT (receiver)</text><rect x="470" y="150" width="150" height="55" rx="10" fill="#bbf7d0"/><text x="545" y="182" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT (receiver)</text><line x1="270" y1="60" x2="95" y2="150" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="545" y2="150" stroke="#64748b" stroke-width="2"/><line x1="170" y1="178" x2="470" y2="178" stroke="#16a34a" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">shortcut (fsd-advpn)</text></svg><p class="cap">The hub hints, the spokes build the shortcut. Solid lines are the normal tunnels.</p></div>
<div class="warn"><p><b>Common mistake.</b> A health check whose target is not reachable through every member. The check then reports a dead link even though the tunnel is fine, and the member is removed from SD-WAN. Test the target and the return route from each tunnel before relying on the result.</p></div>
<div class="exam"><p><b>Exam trap.</b> The members are the tunnel interfaces. The health check must work inside the overlay. Sender is on the hub and receiver on the spokes. DPD and health checks are not the same thing.</p></div>
<div class="scn"><h4>Voice that never moved</h4><p>The SLA for voice was configured, but BR1-FGT never switched away from HUB1-VPN1 even during a clear ISP1 problem. The health check server was the public hub address on ISP1, so the probe went out over the underlay and measured ISP1 only for both members, and the result for VPN2 was copied from the same path.</p><p><b>Lesson:</b> Probe a target inside the overlay so each tunnel is measured on its own path.</p></div>
<div class="iv"><p class="q">"What do you probe for an overlay health check?"</p><p>A target that is reachable inside the overlay, such as the hub tunnel IP or hub loopback, measured separately through each tunnel member. The hub needs a route back to the probe source. SLA thresholds come from the application needs, and the probe interval is balanced against the load on the hub.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Members are tunnel interfaces in an overlay zone; underlay interfaces are in another zone.</li><li>Tunnel up is not tunnel healthy: use health checks with SLA.</li><li>Probe inside the overlay and make sure the return route exists.</li><li>auto-discovery-sender on the hub and receiver on spokes prepare ADVPN.</li></ul></div>
`,hi:`
<p>Tunnel SD-WAN ke liye tab kaam ka banta hai jab woh health check wale zone ka member ho. Foundation module nse4-sdwan ne members, zones aur SLA sikhaye. Yahan hum jodte hain ki IPsec tunnels ko members ki tarah kya khaas banata hai, aur do phase 1 options dekhte hain jo ADVPN ke liye zameen taiyaar karte hain.</p>
<h3>Tunnels members ki tarah</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: overlay tunnels to HUB1 as members of the zone overlay</span>
config system sdwan
    set status enable
    config zone
        edit "overlay"
        next
    end
    config members
        edit 1
            set interface "HUB1-VPN1"
            set zone "overlay"
        next
        edit 2
            set interface "HUB1-VPN2"
            set zone "overlay"
        next
    end
end</pre>
<p>Members tunnel interface ko refer karte hain, wan1 ya wan2 ko nahi. Underlay interfaces kisi aur zone ke members hain, jaise underlay, aur woh traffic le jaate hain jo hub se nahi jaata (jaise direct internet access). Overlay zone woh hai jisse policies aur corporate traffic ke SD-WAN rules point karte hain.</p>
<h3>Tunnel members ki khaas baatein</h3>
<ul><li><b>Tunnel interface tabhi hota hai jab phase 1 ho.</b> Tunnel configured nahi ya down hai to member dead hai, jo sahi hai.</li><li><b>Up matlab healthy nahi.</b> Tunnel IKE mein up ho sakta hai aur phir bhi packets kho sakta hai. Isliye sirf IKE state nahi, tunnel par health check chahiye.</li><li><b>Routes tunnel ko follow karte hain.</b> BGP jo routes seekhta hai woh tunnel interface se bahar jaate hain. Tunnel down ho to woh routes chale jaate hain aur SD-WAN member ko usable nahi dekhta (fsd-routing chapter 2).</li><li><b>Cost aur priority.</b> Members ke paas priority aur cost jaisi settings hain jo rules use kar sakte hain. Active-backup designs mein primary hub tunnel ki priority behtar hoti hai.</li></ul>
<h3>Overlay health checks</h3>
<p>Health check tunnel ke through naapta hai, isliye uska target <b>overlay ke andar</b> reachable hona chahiye. Aam targets hub tunnel IP ya hub loopback hain. Probes ko wapsi ka route chahiye, isliye hub ko probe ke source address ko jawab dena aana chahiye.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: health check towards the HUB1 loopback through both tunnels</span>
config system sdwan
    config health-check
        edit "HUB1_HC"
            set server "10.255.255.1"
            set protocol ping
            set interval 500
            set members 1 2
            set source 10.255.255.11
            config sla
                edit 1
                    set latency-threshold 150
                    set jitter-threshold 30
                    set packetloss-threshold 2
                next
            end
        next
    end
end</pre>
<p>Design points:</p>
<ul><li><b>Probe source.</b> Source spoke loopback ho to hub ke paas uska route hona chahiye aur jawab usi tunnel se wapas aana chahiye; fsd-routing ke loopback routing design ki yeh ek aur wajah hai. Source set na ho to probe member ka tunnel IP use karta hai.</li><li><b>Probe interval.</b> Chhote intervals tez detect karte hain par saikdon spokes ke saath probe traffic guna kar dete hain. Sau millisecond ke aas paas ki values aam hain; hub ka load dhyan mein rakho.</li><li><b>Saare spokes par same health-check naam.</b> Isse templates aur monitor aasan hote hain.</li><li><b>Thresholds application se.</b> 150 ms, 30 ms aur 2 percent lab values hain. Wahi use karo jo aapki voice ya video policy ko chahiye.</li></ul>
<p>fsd-routing ka BGP self-healing design (SD-WAN neighbor, communities, route tags) isi health check par banta hai: SLA met ho ya na ho, spoke communities se hub ko batata hai.</p>
<h3>ADVPN hooks ka preview</h3>
<p>ADVPN do spokes ko aapas mein baat karte waqt direct shortcut tunnel banane deta hai, taaki spoke-to-spoke traffic hamesha hub se na jaye. Agla module fsd-advpn ise poori tarah cover karta hai. Yahan do phase 1 options matter karte hain, kyunki woh shuru se overlay design ka hissa hain:</p>
<table class="cmp"><tr><th>Option</th><th>Kahan</th><th>Matlab</th></tr><tr><td><code>auto-discovery-sender enable</code></td><td>Hub phase 1</td><td>Hub spoke ko batata hai ki doosre spoke tak behtar, direct path ho sakta hai</td></tr><tr><td><code>auto-discovery-receiver enable</code></td><td>Spoke phase 1</td><td>Spoke aise hints accept karta hai aur shortcut negotiation shuru karta hai</td></tr></table>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Hooks only. The full ADVPN design is in fsd-advpn.</span>
<span class="c">! HUB1-FGT</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set auto-discovery-sender enable
    next
end
<span class="c">! BR1-FGT</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set auto-discovery-receiver enable
    next
end</pre>
<p>Shortcut tunnels dynamically banti hain aur network ID aur exchange kiye addresses se parent tunnel se jurti hain. Chapters 4 aur 5 ke overlay IDs aur address plan optional kyun nahi hain, yeh uski ek aur wajah hai.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="diagram"><rect x="230" y="10" width="180" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT (sender)</text><rect x="20" y="150" width="150" height="55" rx="10" fill="#bbf7d0"/><text x="95" y="182" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT (receiver)</text><rect x="470" y="150" width="150" height="55" rx="10" fill="#bbf7d0"/><text x="545" y="182" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT (receiver)</text><line x1="270" y1="60" x2="95" y2="150" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="545" y2="150" stroke="#64748b" stroke-width="2"/><line x1="170" y1="178" x2="470" y2="178" stroke="#16a34a" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">shortcut (fsd-advpn)</text></svg><p class="cap">Hub hint deta hai, spokes shortcut banate hain. Solid lines normal tunnels hain.</p></div>
<div class="warn"><p><b>Common galti.</b> Aisa health check jiska target har member ke through reachable nahi. Check tab dead link report karta hai jabki tunnel theek hai, aur member SD-WAN se hat jaata hai. Result par bharosa karne se pehle har tunnel se target aur return route test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Members tunnel interfaces hain. Health check overlay ke andar kaam karna chahiye. Sender hub par aur receiver spokes par. DPD aur health checks ek cheez nahi hain.</p></div>
<div class="scn"><h4>Voice jo kabhi nahi hili</h4><p>Voice ka SLA configured tha, par BR1-FGT saaf ISP1 problem mein bhi HUB1-VPN1 se kabhi nahi hata. Health check server ISP1 par public hub address tha, isliye probe underlay se gaya aur dono members ke liye sirf ISP1 naapta, aur VPN2 ka result usi path se copy hua.</p><p><b>Seekh:</b> Overlay ke andar ka target probe karo taaki har tunnel apne path par naapa jaye.</p></div>
<div class="iv"><p class="q">"Overlay health check ke liye kya probe karte ho?"</p><p>Aisa target jo overlay ke andar reachable ho, jaise hub tunnel IP ya hub loopback, har tunnel member ke through alag naapa hua. Hub ko probe source tak wapsi ka route chahiye. SLA thresholds application ki zarooratein tay karti hain, aur probe interval ko hub par load se balance karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Members overlay zone mein tunnel interfaces hain; underlay interfaces doosre zone mein.</li><li>Tunnel up matlab healthy nahi: SLA ke saath health checks use karo.</li><li>Overlay ke andar probe karo aur yaqeen karo ki return route hai.</li><li>Hub par auto-discovery-sender aur spokes par receiver ADVPN ke liye tayyari karte hain.</li></ul></div>
`}};export{e as default};