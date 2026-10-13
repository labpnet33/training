var e={id:`ipsec-bgp-overlay`,h:{en:`BGP over the overlay: neighbor-range, route reflection and next hops`,hi:`Overlay par BGP: neighbor-range, route reflection aur next hops`},body:{en:`
<p>Static routes work for two branches. For fifty they are a spreadsheet nobody trusts. Kaveri Retail therefore runs <b>iBGP</b> (one AS, 65100) inside the tunnels. Each spoke announces its LAN, the hub collects and re-announces them, and a new branch needs no change on the others. This chapter prepares task 4 of <b>n7-ipsec-hub</b> and is the key to the routing fault in <b>n7-ipsec-shortcut</b>.</p>

<h3>Why iBGP with a route reflector</h3>
<p>iBGP has a rule: a route learned from an iBGP peer is not passed to another iBGP peer. That would force a full mesh (every spoke peering with every other spoke), which is exactly what a hub-and-spoke design wants to avoid. A <b>route reflector (RR)</b> breaks the rule on purpose: the hub accepts routes from a <b>client</b> and reflects them to the other clients. Spokes need only one session, to the hub.</p>

<h3>The hub: neighbor-group and neighbor-range</h3>
<p>Spoke addresses appear dynamically, so the hub cannot list one <code>neighbor</code> per spoke. It defines a template and a range instead; any address inside the range that opens a session with a matching AS is accepted.</p>
<pre class="code"><span class="c">! HQ-FGT</span>
config router bgp
    set as 65100
    set router-id 10.255.1.1
    config neighbor-group
        edit "SPOKES"
            set remote-as 65100
            set route-reflector-client enable
        next
    end
    config neighbor-range
        edit 1
            set prefix 10.255.1.0 255.255.255.0
            set neighbor-group "SPOKES"
        next
    end
    config network
        edit 1
            set prefix 10.10.0.0 255.255.255.0
        next
    end
end
<span class="c">! MDU-FGT</span>
config router bgp
    set as 65100
    set router-id 10.255.1.2
    config neighbor
        edit "10.255.1.1"
            set remote-as 65100
        next
    end
    config network
        edit 1
            set prefix 10.20.0.0 255.255.255.0
        next
    end
end</pre>
<div class="dia"><svg viewBox="0 0 660 230" role="img" aria-label="Route reflection over the overlay">
<rect x="250" y="20" width="160" height="70" rx="10" fill="#bae6fd"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT (RR)</text><text x="330" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24</text>
<rect x="30" y="140" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT</text><text x="115" y="188" text-anchor="middle" class="svg-muted" font-size="12">announces 10.20.0.0/24</text>
<rect x="460" y="140" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="545" y="165" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT</text><text x="545" y="188" text-anchor="middle" class="svg-muted" font-size="12">announces 10.30.0.0/24</text>
<line x1="270" y1="90" x2="140" y2="140" stroke="#22c55e" stroke-width="3"/><line x1="390" y1="90" x2="520" y2="140" stroke="#22c55e" stroke-width="3"/>
<text x="190" y="105" class="svg-accent" font-size="12">iBGP 1</text><text x="440" y="105" class="svg-accent" font-size="12">iBGP 2</text>
<text x="330" y="215" text-anchor="middle" class="svg-ink" font-size="12">Hub reflects 10.30.0.0/24 to MDU; next hop stays 10.255.1.3</text>
</svg><p class="cap">Two sessions are enough; the reflector tells each client about the other.</p></div>

<h3>Next hops: the point of the whole design</h3>
<p>When the hub reflects a route it leaves the <b>next hop unchanged</b>. MDU learns 10.30.0.0/24 with next hop <b>10.255.1.3</b> (Trichy's tunnel address), not the hub. MDU then asks the routing table how to reach 10.255.1.3. Before ADVPN the answer is "via the overlay subnet, tunnel TO-HQ", so the traffic goes to the hub, which forwards it. After a shortcut exists, a /32 route to 10.255.1.3 appears through the shortcut, and the <i>same BGP route</i> now resolves through the direct tunnel. No BGP change is needed. This recursive lookup is what makes ADVPN elegant (chapter 8).</p>
<pre class="out">MDU-FGT # get router info routing-table all
<span class="hl">B       10.30.0.0/24 [200/0] via 10.255.1.3 (recursive is directly connected, TO-HQ), 00:02:10</span>
C       10.255.1.0/24 is directly connected, TO-HQ
MDU-FGT # get router info bgp summary
Neighbor        V    AS MsgRcvd MsgSent   Up/Down  State/PfxRcd
<span class="hl">10.255.1.1      4 65100      12      14  00:03:05        1</span></pre>
<div class="warn"><p><b>Common mistake.</b> Setting <code>next-hop-self-rr enable</code> on the neighbor-group "to be safe". It rewrites the next hop of reflected routes to the hub's own address, so every spoke-to-spoke flow keeps going through the hub and shortcuts never carry traffic. That is the second fault of ticket KR-2377.</p></div>
<div class="warn"><p><b>Another trap.</b> After changing BGP options such as <code>next-hop-self-rr</code> the already advertised routes are not recomputed. Use <code>execute router clear bgp all</code> on the hub and the spokes.</p></div>

<h3>Verifying</h3>
<ul>
<li><code>get router info bgp summary</code>: state/prefix count; a number in the last column means Established.</li>
<li><code>get router info bgp neighbors</code>: why a session is down (AS mismatch, no route to the neighbour).</li>
<li><code>get router info bgp network</code>: the BGP table with next hops.</li>
<li>Ping PC-MDU to PC-HQ and PC-TRY to confirm data plane after control plane.</li>
</ul>
<div class="exam"><p><b>Exam trap.</b> BGP between tunnel IPs needs the neighbour address to be reachable. Because of the connected route from <code>remote-ip</code> the spoke reaches 10.255.1.1 through TO-HQ. A neighbor-range accepts only addresses inside its prefix and only with the AS of the neighbor-group.</p></div>

<div class="scn"><h4>Branch 9 joins without a ticket</h4><p>Kaveri opened a ninth branch. The engineer built the spoke, gave it 10.255.1.10/32, and pointed BGP to 10.255.1.1. The hub needed no change: the neighbor-range already covered the address. Within a minute all other branches learned the new LAN through reflection.</p><p><b>Lesson:</b> design the hub once; adding spokes is a spoke-only job.</p></div>

<div class="iv"><p class="q">"Why a route reflector and a neighbor-range at the hub?"</p><p>iBGP does not re-advertise iBGP routes, so without an RR the spokes would need a full mesh. The reflector sends each spoke's prefix to the others; the neighbor-range accepts dynamically addressed spokes. Add that you leave the next hop unchanged so ADVPN shortcuts can take over.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>iBGP inside the tunnels removes static route maintenance.</li>
<li>The hub is a route reflector; spokes are clients and peer only with the hub.</li>
<li>neighbor-group + neighbor-range accept dynamic spokes.</li>
<li>Keep the next hop unchanged (no next-hop-self-rr) so shortcuts work.</li>
<li>Clear BGP after changing advertisement options.</li>
</ul></div>
`,hi:`
<p>Do branches ke liye static routes chal jaate hain. Pachaas ke liye woh aisi spreadsheet ban jaate hain jis par koi bharosa nahi karta. Isliye Kaveri Retail tunnels ke andar <b>iBGP</b> (ek AS, 65100) chalata hai. Har spoke apni LAN announce karta hai, hub unhe ikattha karke dobara announce karta hai, aur nayi branch ke liye baaki par kuch badalna nahi padta. Yeh chapter <b>n7-ipsec-hub</b> ke task 4 ki taiyari karata hai aur <b>n7-ipsec-shortcut</b> ke routing fault ki kunji hai.</p>

<h3>Route reflector ke saath iBGP kyun</h3>
<p>iBGP ka ek rule hai: iBGP peer se seekha route kisi doosre iBGP peer ko pass nahi hota. Isse full mesh chahiye hota (har spoke har doosre spoke se peer kare), jo hub-and-spoke design bilkul nahi chahta. <b>Route reflector (RR)</b> yeh rule jaan-boojh kar todta hai: hub ek <b>client</b> se routes leta hai aur baaki clients ko reflect karta hai. Spokes ko sirf ek session chahiye, hub ke saath.</p>

<h3>Hub: neighbor-group aur neighbor-range</h3>
<p>Spoke addresses dynamically aate hain, isliye hub har spoke ke liye alag <code>neighbor</code> list nahi kar sakta. Uski jagah template aur range define karta hai; range ke andar ka koi bhi address jo matching AS ke saath session kholta hai accept ho jata hai.</p>
<pre class="code"><span class="c">! HQ-FGT</span>
config router bgp
    set as 65100
    set router-id 10.255.1.1
    config neighbor-group
        edit "SPOKES"
            set remote-as 65100
            set route-reflector-client enable
        next
    end
    config neighbor-range
        edit 1
            set prefix 10.255.1.0 255.255.255.0
            set neighbor-group "SPOKES"
        next
    end
    config network
        edit 1
            set prefix 10.10.0.0 255.255.255.0
        next
    end
end
<span class="c">! MDU-FGT</span>
config router bgp
    set as 65100
    set router-id 10.255.1.2
    config neighbor
        edit "10.255.1.1"
            set remote-as 65100
        next
    end
    config network
        edit 1
            set prefix 10.20.0.0 255.255.255.0
        next
    end
end</pre>
<div class="dia"><svg viewBox="0 0 660 230" role="img" aria-label="Overlay par route reflection">
<rect x="250" y="20" width="160" height="70" rx="10" fill="#bae6fd"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT (RR)</text><text x="330" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24</text>
<rect x="30" y="140" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT</text><text x="115" y="188" text-anchor="middle" class="svg-muted" font-size="12">announce 10.20.0.0/24</text>
<rect x="460" y="140" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="545" y="165" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT</text><text x="545" y="188" text-anchor="middle" class="svg-muted" font-size="12">announce 10.30.0.0/24</text>
<line x1="270" y1="90" x2="140" y2="140" stroke="#22c55e" stroke-width="3"/><line x1="390" y1="90" x2="520" y2="140" stroke="#22c55e" stroke-width="3"/>
<text x="190" y="105" class="svg-accent" font-size="12">iBGP 1</text><text x="440" y="105" class="svg-accent" font-size="12">iBGP 2</text>
<text x="330" y="215" text-anchor="middle" class="svg-ink" font-size="12">Hub 10.30.0.0/24 ko MDU tak reflect karta hai; next hop 10.255.1.3 rehta hai</text>
</svg><p class="cap">Do sessions kaafi hain; reflector har client ko doosre ke baare mein batata hai.</p></div>

<h3>Next hops: poore design ka nichod</h3>
<p>Hub route reflect karte waqt <b>next hop ko badalta nahi</b>. MDU ko 10.30.0.0/24 next hop <b>10.255.1.3</b> (Trichy ka tunnel address) ke saath milta hai, hub ke saath nahi. MDU phir routing table se poochta hai ki 10.255.1.3 tak kaise pahunche. ADVPN se pehle jawab hai "overlay subnet se, tunnel TO-HQ", isliye traffic hub ke paas jata hai jo use forward karta hai. Shortcut banne ke baad 10.255.1.3 ka /32 route shortcut se aa jata hai, aur <i>wahi BGP route</i> ab seedhe tunnel se resolve hota hai. BGP mein kuch badalna nahi padta. Yeh recursive lookup hi ADVPN ko khoobsurat banata hai (chapter 8).</p>
<pre class="out">MDU-FGT # get router info routing-table all
<span class="hl">B       10.30.0.0/24 [200/0] via 10.255.1.3 (recursive is directly connected, TO-HQ), 00:02:10</span>
C       10.255.1.0/24 is directly connected, TO-HQ
MDU-FGT # get router info bgp summary
Neighbor        V    AS MsgRcvd MsgSent   Up/Down  State/PfxRcd
<span class="hl">10.255.1.1      4 65100      12      14  00:03:05        1</span></pre>
<div class="warn"><p><b>Common mistake.</b> "Safe rehne ke liye" neighbor-group par <code>next-hop-self-rr enable</code> laga dena. Yeh reflected routes ka next hop hub ke apne address par badal deta hai, isliye har spoke-to-spoke flow hub se hi jaati rehti hai aur shortcuts par traffic kabhi nahi chalta. Yahi ticket KR-2377 ka doosra fault hai.</p></div>
<div class="warn"><p><b>Ek aur trap.</b> <code>next-hop-self-rr</code> jaise BGP options badalne ke baad pehle se advertise ho chuke routes dobara compute nahi hote. Hub aur spokes par <code>execute router clear bgp all</code> chalao.</p></div>

<h3>Verify karna</h3>
<ul>
<li><code>get router info bgp summary</code>: state/prefix count; aakhri column mein number ka matlab Established hai.</li>
<li><code>get router info bgp neighbors</code>: session down kyun hai (AS mismatch, neighbour tak route nahi).</li>
<li><code>get router info bgp network</code>: next hops ke saath BGP table.</li>
<li>Control plane ke baad data plane confirm karne ke liye PC-MDU se PC-HQ aur PC-TRY ko ping karo.</li>
</ul>
<div class="exam"><p><b>Exam trap.</b> Tunnel IPs ke beech BGP ke liye neighbour address reachable hona chahiye. <code>remote-ip</code> ke connected route ki wajah se spoke TO-HQ se 10.255.1.1 tak pahunchta hai. Neighbor-range sirf apne prefix ke andar ke addresses aur neighbor-group ke AS ko accept karta hai.</p></div>

<div class="scn"><h4>Branch 9 bina ticket ke judi</h4><p>Kaveri ne nayi branch kholi. Engineer ne spoke banaya, use 10.255.1.10/32 diya, aur BGP ko 10.255.1.1 par point kiya. Hub par kuch badalna nahi pada: neighbor-range ne address pehle hi cover kar rakha tha. Ek minute ke andar baaki sab branches ne reflection se nayi LAN seekh li.</p><p><b>Lesson:</b> hub ko ek baar design karo; spokes jodna sirf spoke ka kaam hai.</p></div>

<div class="iv"><p class="q">"Hub par route reflector aur neighbor-range kyun?"</p><p>iBGP iBGP routes ko dobara advertise nahi karta, to RR ke bina spokes ko full mesh chahiye hota. Reflector har spoke ka prefix baaki spokes ko bhejta hai; neighbor-range dynamically addressed spokes ko accept karta hai. Jodo ki next hop unchanged rakhte ho taaki ADVPN shortcuts kaam sambhal sakein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnels ke andar iBGP static routes ka maintenance hata deta hai.</li>
<li>Hub route reflector hai; spokes clients hain aur sirf hub se peer karte hain.</li>
<li>neighbor-group + neighbor-range dynamic spokes ko accept karte hain.</li>
<li>Next hop unchanged rakho (next-hop-self-rr nahi) taaki shortcuts kaam karein.</li>
<li>Advertisement options badalne ke baad BGP clear karo.</li>
</ul></div>
`}};export{e as default};