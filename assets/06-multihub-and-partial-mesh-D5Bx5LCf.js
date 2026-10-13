var e={id:`multihub-and-partial-mesh`,h:{en:`Multihub (dual-hub) designs and partial mesh`,hi:`Multihub (dual-hub) designs aur partial mesh`},body:{en:`
<p>Real networks seldom have one hub. A single hub is a single point of failure, so Fortinet's reference architecture recommends <b>dual-hub regions</b>. And not every branch pair needs, or is allowed, a shortcut. This chapter covers two design questions: how ADVPN behaves with two hubs in one region, and how to build a partial mesh in which only the right pairs get direct tunnels.</p>
<h3>Why not full mesh?</h3>
<table class="cmp"><tr><th>Design</th><th>Tunnels for 100 branches (one underlay)</th><th>Comment</th></tr><tr><td>Hub and spoke</td><td>100</td><td>Simple, but all branch-to-branch traffic crosses the hub.</td></tr><tr><td>Full mesh</td><td>4,950 (100 x 99 / 2)</td><td>Each branch must hold 99 tunnels and 99 BGP sessions; unmanageable.</td></tr><tr><td>Hub and spoke with ADVPN</td><td>100 permanent plus only the active shortcuts, for example 10 per branch, about 500 in total</td><td>Mesh performance where traffic needs it, hub scale elsewhere.</td></tr></table>
<h3>Dual-hub region</h3>
<p>The design from fsd-ipsec chapter 5: each branch has one tunnel per ISP to each hub. HUB1 overlay uses network ID 1 and HUB2 overlay uses network ID 2 (the plan of that chapter). ADVPN is configured on both hubs exactly as on a single hub: <code>auto-discovery-sender enable</code> on every dial-up phase 1 of both hubs, and <code>auto-discovery-receiver enable</code> on all four spoke tunnels.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram"><rect x="60" y="10" width="170" height="52" rx="10" fill="#ddd6fe"/><text x="145" y="40" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT  ID 1</text><rect x="410" y="10" width="170" height="52" rx="10" fill="#fed7aa"/><text x="495" y="40" text-anchor="middle" class="svg-ink" font-size="13">HUB2-FGT  ID 2</text><rect x="60" y="190" width="150" height="52" rx="10" fill="#bbf7d0"/><text x="135" y="220" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><rect x="430" y="190" width="150" height="52" rx="10" fill="#bbf7d0"/><text x="505" y="220" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><line x1="115" y1="62" x2="110" y2="190" stroke="#0284c7" stroke-width="2"/><line x1="175" y1="62" x2="470" y2="190" stroke="#0284c7" stroke-width="2"/><line x1="450" y1="62" x2="170" y2="190" stroke="#d97706" stroke-width="2"/><line x1="520" y1="62" x2="540" y2="190" stroke="#d97706" stroke-width="2"/><line x1="210" y1="225" x2="430" y2="225" stroke="#16a34a" stroke-width="3" stroke-dasharray="8 5"/><text x="320" y="216" text-anchor="middle" class="svg-accent" font-size="12">shortcut inside ID 1 or ID 2</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="11">crossover block: no shortcut between ID 1 and ID 2</text></svg><p class="cap">Blue tunnels belong to the HUB1 overlay (ID 1), orange to the HUB2 overlay (ID 2). A shortcut forms inside one overlay.</p></div>
<h3>What the spokes must decide</h3>
<ul><li><b>Which hub is primary.</b> Both hubs reflect the same prefixes, so every spoke has two paths to every remote prefix. Choose with a route-map on the spoke BGP sessions (for example local preference 200 from HUB1 and 100 from HUB2), or with SD-WAN priority or tags from fsd-routing. The hub that carries the first packet is the one that offers the shortcut.</li><li><b>No crossover.</b> Set <code>auto-discovery-crossover block</code> if you do not want a shortcut that mixes HUB1 and HUB2 overlays, so that each shortcut belongs to one failure domain.</li><li><b>Hub-down behaviour.</b> The shortcuts live on (independent), BGP withdraws the HUB1 paths and the spoke uses HUB2; new shortcuts then form through HUB2. With IKEv2 the shortcut rekey does not need the hub.</li></ul>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: HUB1 primary, HUB2 backup (local preference); crossover blocked</span>
config router route-map
    edit "FROM-HUB1"
        config rule
            edit 1
                set set-local-preference 200
            next
        end
    next
    edit "FROM-HUB2"
        config rule
            edit 1
                set set-local-preference 100
            next
        end
    next
end
config router bgp
    config neighbor
        edit "10.255.255.1"
            set route-map-in "FROM-HUB1"
        next
        edit "10.255.255.2"
            set route-map-in "FROM-HUB2"
        next
    end
end
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set auto-discovery-crossover block
    next
    edit "HUB2-VPN1"
        set auto-discovery-crossover block
    next
end</pre>
<p>The BGP neighbor lines show only the added route-map; the sessions themselves are from fsd-routing chapter 4. The same crossover line goes on the other two tunnels (VPN2).</p>
<h3>Partial mesh: only the right pairs</h3>
<p>Sometimes a shortcut is not wanted: a finance branch that must never talk directly to a retail branch, a satellite site with metered data, or a branch whose NAT makes shortcuts impossible. There are four tools, from coarse to fine.</p>
<ol><li><b>Switch the role off.</b> <code>auto-discovery-receiver disable</code> on a spoke stops it from building shortcuts. <code>auto-discovery-sender disable</code> on the hub stops offers for that overlay completely; Fortinet notes that you then enable net-device on the hub so that the hub keeps correct kernel routing to the spokes.</li><li><b>Policy.</b> Without a hub policy that allows spoke-to-spoke transit for a pair, their traffic is dropped at the hub, no offer is sent, and the pair is isolated. Segment with address groups, not only with ADVPN.</li><li><b>Separate overlays.</b> Put each group of spokes on its own overlay with its own network ID (10 for retail, 20 for finance) and block crossover. Shortcuts then form only inside a group.</li><li><b>Permanent spoke-to-spoke tunnels.</b> For a heavy pair (a branch and its twin site), a static tunnel is built between the two spokes in addition to the hub tunnel, with its own BGP session. Use only where the traffic justifies the extra tunnel.</li></ol>
<div class="eg"><p>A bank has 60 retail branches and 8 finance back offices. Retail uses overlay ID 10, finance ID 20, each with network-overlay enabled. All have crossover block. A retail branch can build a shortcut to another retail branch, never to a finance office. Finance offices have a permanent static tunnel between the two sites that exchange 300 Mbit/s of reports.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using ADVPN settings as a security control. Disabling the receiver prevents a shortcut but does not secure anything: the traffic still passes through the hub, where the firewall policy is the real control. Write the policy first, then decide where shortcuts are allowed.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a dual-hub design the shortcut forms <b>inside one overlay</b>. Crossover decides whether it may form between overlays with different network IDs. Remember also the IKEv1 rekey limit when a hub is down: use IKEv2.</p></div>
<div class="scn"><h4>The two hubs that fought</h4><p>A company with HUB1 in Mumbai and HUB2 in Chennai saw branch pairs build shortcuts on one overlay and fail over to the other every few hours, flapping between them. The cause was equal local preference on both hubs, so each spoke chose a hub per prefix at random, and the first packet of a flow went through whichever hub BGP preferred at that moment. Setting local preference 200 for HUB1 and 100 for HUB2 gave stable choices; crossover block kept every shortcut inside one overlay.</p><p><b>Lesson:</b> Decide the primary hub with routing policy, or the shortcut will follow chance.</p></div>
<div class="iv"><p class="q">"How does ADVPN behave in a dual-hub design, and how do you keep some branches from building shortcuts?"</p><p>Both hubs are senders and the spokes are receivers on all tunnels. A shortcut forms inside the overlay (network ID) that carried the first packet, so a routing policy decides the primary hub, and crossover block keeps shortcuts inside one overlay. To limit shortcuts, disable the receiver on selected spokes, deny spoke-to-spoke transit by policy, separate groups into different network IDs, or add permanent tunnels for heavy pairs.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Dual-hub regions are the recommended design; both hubs run auto-discovery-sender.</li><li>Choose the primary hub with BGP local preference or SD-WAN priority, so shortcuts are predictable.</li><li>auto-discovery-crossover block keeps shortcuts inside one network ID.</li><li>Partial mesh tools: receiver off, hub policy, separate overlays, permanent tunnels.</li><li>ADVPN scales: about 500 tunnels instead of 4,950 for 100 branches.</li></ul></div>
`,hi:`
<p>Real networks mein ek hub shayad hi hota hai. Single hub single point of failure hai, isliye Fortinet ka reference architecture <b>dual-hub regions</b> recommend karta hai. Aur har branch pair ko shortcut ki zaroorat nahi hoti, ya allowed nahi hota. Yeh chapter do design sawaal cover karta hai: ek region mein do hubs ke saath ADVPN kaise behave karta hai, aur partial mesh kaise banate hain jisme sirf sahi pairs ko direct tunnels milte hain.</p>
<h3>Full mesh kyun nahi?</h3>
<table class="cmp"><tr><th>Design</th><th>100 branches ke liye tunnels (ek underlay)</th><th>Comment</th></tr><tr><td>Hub and spoke</td><td>100</td><td>Simple, par branch-to-branch ka saara traffic hub se jaata hai.</td></tr><tr><td>Full mesh</td><td>4,950 (100 x 99 / 2)</td><td>Har branch ko 99 tunnels aur 99 BGP sessions rakhne padte hain; manage nahi hota.</td></tr><tr><td>ADVPN ke saath hub and spoke</td><td>100 permanent plus sirf active shortcuts, jaise har branch ke 10, kul lagbhag 500</td><td>Jahan traffic ko chahiye wahan mesh jaisi performance, baaki jagah hub jaisa scale.</td></tr></table>
<h3>Dual-hub region</h3>
<p>fsd-ipsec chapter 5 ka design: har branch ke paas har hub tak har ISP ke liye ek tunnel hai. HUB1 overlay network ID 1 aur HUB2 overlay network ID 2 use karta hai (us chapter ka plan). ADVPN dono hubs par bilkul single hub jaisa configure hota hai: dono hubs ke har dial-up phase 1 par <code>auto-discovery-sender enable</code>, aur chaaron spoke tunnels par <code>auto-discovery-receiver enable</code>.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram"><rect x="60" y="10" width="170" height="52" rx="10" fill="#ddd6fe"/><text x="145" y="40" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT  ID 1</text><rect x="410" y="10" width="170" height="52" rx="10" fill="#fed7aa"/><text x="495" y="40" text-anchor="middle" class="svg-ink" font-size="13">HUB2-FGT  ID 2</text><rect x="60" y="190" width="150" height="52" rx="10" fill="#bbf7d0"/><text x="135" y="220" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><rect x="430" y="190" width="150" height="52" rx="10" fill="#bbf7d0"/><text x="505" y="220" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><line x1="115" y1="62" x2="110" y2="190" stroke="#0284c7" stroke-width="2"/><line x1="175" y1="62" x2="470" y2="190" stroke="#0284c7" stroke-width="2"/><line x1="450" y1="62" x2="170" y2="190" stroke="#d97706" stroke-width="2"/><line x1="520" y1="62" x2="540" y2="190" stroke="#d97706" stroke-width="2"/><line x1="210" y1="225" x2="430" y2="225" stroke="#16a34a" stroke-width="3" stroke-dasharray="8 5"/><text x="320" y="216" text-anchor="middle" class="svg-accent" font-size="12">shortcut ID 1 ya ID 2 ke andar</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="11">crossover block: ID 1 aur ID 2 ke beech shortcut nahi</text></svg><p class="cap">Neele tunnels HUB1 overlay (ID 1) ke hain, orange HUB2 overlay (ID 2) ke. Shortcut ek overlay ke andar banta hai.</p></div>
<h3>Spokes ko kya tay karna hai</h3>
<ul><li><b>Kaun sa hub primary hai.</b> Dono hubs wahi prefixes reflect karte hain, isliye har spoke ke paas har remote prefix ke liye do paths hain. Spoke BGP sessions par route-map se chuno (jaise HUB1 se local preference 200 aur HUB2 se 100), ya fsd-routing ke SD-WAN priority ya tags se. Jo hub pehla packet carry karta hai wahi shortcut offer karta hai.</li><li><b>Koi crossover nahi.</b> Agar aap nahi chahte ki HUB1 aur HUB2 overlays mix karne wala shortcut bane, to <code>auto-discovery-crossover block</code> set karo, taaki har shortcut ek failure domain ka rahe.</li><li><b>Hub-down behaviour.</b> Shortcuts jeete rehte hain (independent), BGP HUB1 ke paths withdraw karta hai aur spoke HUB2 use karta hai; naye shortcuts phir HUB2 se bante hain. IKEv2 ke saath shortcut rekey ko hub nahi chahiye.</li></ul>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: HUB1 primary, HUB2 backup (local preference); crossover blocked</span>
config router route-map
    edit "FROM-HUB1"
        config rule
            edit 1
                set set-local-preference 200
            next
        end
    next
    edit "FROM-HUB2"
        config rule
            edit 1
                set set-local-preference 100
            next
        end
    next
end
config router bgp
    config neighbor
        edit "10.255.255.1"
            set route-map-in "FROM-HUB1"
        next
        edit "10.255.255.2"
            set route-map-in "FROM-HUB2"
        next
    end
end
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set auto-discovery-crossover block
    next
    edit "HUB2-VPN1"
        set auto-discovery-crossover block
    next
end</pre>
<p>BGP neighbor lines sirf jodi gayi route-map dikhati hain; sessions khud fsd-routing chapter 4 se hain. Wahi crossover line baaki do tunnels (VPN2) par bhi jaati hai.</p>
<h3>Partial mesh: sirf sahi pairs</h3>
<p>Kabhi shortcut chahiye nahi hota: finance branch jo retail branch se kabhi seedha baat na kare, metered data wali satellite site, ya woh branch jiska NAT shortcuts impossible bana deta hai. Chaar tools hain, coarse se fine tak.</p>
<ol><li><b>Role band karo.</b> Spoke par <code>auto-discovery-receiver disable</code> use shortcuts banane se rokta hai. Hub par <code>auto-discovery-sender disable</code> us overlay ke offers poori tarah rokta hai; Fortinet batata hai ki phir hub par net-device enable karo taaki hub spokes tak sahi kernel routing rakhe.</li><li><b>Policy.</b> Kisi pair ke spoke-to-spoke transit ko allow karne wali hub policy ke bina unka traffic hub par drop hota hai, koi offer nahi bhejta, aur pair isolated rehti hai. Segmentation address groups se karo, sirf ADVPN se nahi.</li><li><b>Alag overlays.</b> Har spokes group ko apni overlay aur apna network ID do (retail ke liye 10, finance ke liye 20) aur crossover block karo. Shortcuts tab sirf group ke andar bante hain.</li><li><b>Permanent spoke-to-spoke tunnels.</b> Heavy pair (branch aur uski twin site) ke liye hub tunnel ke alawa dono spokes ke beech static tunnel banta hai, apne BGP session ke saath. Sirf wahan use karo jahan traffic extra tunnel ko justify kare.</li></ol>
<div class="eg"><p>Ek bank ke 60 retail branches aur 8 finance back offices hain. Retail overlay ID 10 aur finance ID 20 use karte hain, dono mein network-overlay enabled. Sabme crossover block hai. Retail branch doosre retail branch tak shortcut bana sakta hai, finance office tak kabhi nahi. Do finance sites jo 300 Mbit/s reports exchange karti hain unke beech permanent static tunnel hai.</p></div>
<div class="warn"><p><b>Common galti.</b> ADVPN settings ko security control ki tarah use karna. Receiver disable karna shortcut rokta hai par kuch secure nahi karta: traffic phir bhi hub se guzarta hai, jahan firewall policy asli control hai. Pehle policy likho, phir tay karo ki shortcuts kahan allowed hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dual-hub design mein shortcut <b>ek overlay ke andar</b> banta hai. Crossover tay karta hai ki alag network IDs wali overlays ke beech banega ya nahi. Hub down hone par IKEv1 rekey limit bhi yaad rakho: IKEv2 use karo.</p></div>
<div class="scn"><h4>Do hubs jo lad pade</h4><p>Mumbai mein HUB1 aur Chennai mein HUB2 wali company mein branch pairs ek overlay par shortcut banate aur har kuch ghante baad doosri par failover karke flap karte dikhe. Wajah dono hubs par barabar local preference thi, isliye har spoke har prefix ke liye random hub chunta tha, aur flow ka pehla packet us waqt jo hub BGP ko prefer tha usi se gaya. HUB1 ke liye local preference 200 aur HUB2 ke liye 100 karne se choices stable ho gayi; crossover block ne har shortcut ko ek overlay ke andar rakha.</p><p><b>Seekh:</b> Primary hub routing policy se tay karo, warna shortcut sanyog ke peeche chalega.</p></div>
<div class="iv"><p class="q">"Dual-hub design mein ADVPN kaise behave karta hai, aur kuch branches ko shortcut banane se kaise rokoge?"</p><p>Dono hubs senders aur spokes sab tunnels par receivers hain. Shortcut us overlay (network ID) ke andar banta hai jisne pehla packet carry kiya, isliye routing policy primary hub tay karti hai, aur crossover block shortcuts ko ek overlay ke andar rakhta hai. Shortcuts limit karne ke liye chuni hui spokes par receiver disable karo, policy se spoke-to-spoke transit deny karo, groups ko alag network IDs mein baanto, ya heavy pairs ke liye permanent tunnels jodo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Dual-hub regions recommended design hain; dono hubs auto-discovery-sender chalate hain.</li><li>Primary hub BGP local preference ya SD-WAN priority se chuno, taaki shortcuts predictable hon.</li><li>auto-discovery-crossover block shortcuts ko ek network ID ke andar rakhta hai.</li><li>Partial mesh tools: receiver off, hub policy, alag overlays, permanent tunnels.</li><li>ADVPN scale karta hai: 100 branches ke liye 4,950 ki jagah lagbhag 500 tunnels.</li></ul></div>
`}};export{e as default};