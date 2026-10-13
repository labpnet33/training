var e={id:`bgp-loopback`,h:{en:`BGP on loopback, recursive next hops, multipath and additional paths`,hi:`Loopback par BGP, recursive next hops, multipath aur additional paths`},body:{en:`
<p>In chapter 3 every tunnel had its own BGP session. With two tunnels per spoke and 300 spokes the hub holds 600 sessions, and when one tunnel fails the session over it fails as well. A better design for large overlays is <b>BGP on loopback</b>: each FortiGate has one loopback address, each spoke has <b>one</b> session to each hub loopback, and that session simply rides over whichever tunnels are up. This is the design that Fortinet's large-scale and ADVPN examples use.</p>
<div class="note"><p><b>Note.</b> A first warning about wording. Fortinet's documentation calls the design "BGP on loopback", but I found no single FortiOS command with that name. It is a combination of settings, listed below. If you see a question or a script mentioning one switch for it, treat it with suspicion and check the options with <code>?</code> on your firmware.</p></div>
<h3>The building blocks of the loopback design</h3>
<ol><li><b>A loopback interface</b> on every FortiGate, with a /32 address. It never goes down, which is the whole point.</li><li><b>The loopback address is advertised to the IPsec peer</b>. On the phase 1 of the tunnels, the option <code>exchange-ip-addr4</code> carries the loopback address to the peer. The result is that the spoke can reach the hub loopback through each tunnel and the hub reaches the spoke loopback through each tunnel, as ECMP routes.</li><li><b>BGP peers on the loopbacks</b>: <code>update-source</code> is the loopback, so the TCP session runs between the two loopback addresses.</li><li><b>Recursive next hop</b>: <code>recursive-next-hop enable</code> lets BGP resolve a next hop (a loopback address) through another route instead of requiring it to be directly connected.</li><li><b>Multipath</b>: <code>ibgp-multipath enable</code> keeps several equal iBGP paths.</li><li><b>Tag resolve mode</b>: <code>tag-resolve-mode merge</code> is set in Fortinet's example so that routes with the same tag are combined when a next hop is resolved. We use tags in chapter 5; in this chapter just note that the option exists.</li><li><b>Health check source</b>: the SD-WAN health check on the overlay uses the loopback as its source address.</li></ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="10" y="80" width="150" height="70" rx="10" fill="#bae6fd"/><text x="85" y="106" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="85" y="124" text-anchor="middle" class="svg-muted" font-size="11">Loopback 10.255.255.11</text><rect x="480" y="80" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="106" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="555" y="124" text-anchor="middle" class="svg-muted" font-size="11">Loopback 10.255.255.1</text><line x1="160" y1="95" x2="480" y2="95" stroke="#16a34a" stroke-width="3"/><line x1="160" y1="135" x2="480" y2="135" stroke="#d97706" stroke-width="3"/><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">HUB1-VPN1</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="11">HUB1-VPN2</text><rect x="200" y="22" width="240" height="30" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">ONE iBGP session, loopback to loopback</text><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Both tunnels are ECMP paths to the peer loopback.</text></svg><p class="cap">A single BGP session survives the loss of either tunnel because it rides on the loopback addresses.</p></div>
<h3>Reference configuration</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT</span>
config system interface
    edit "Loopback"
        set vdom "root"
        set ip 10.255.255.1 255.255.255.255
        set allowaccess ping
        set type loopback
    next
end
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set exchange-ip-addr4 10.255.255.1
        set add-route disable
    next
    edit "HUB1-VPN2"
        set exchange-ip-addr4 10.255.255.1
        set add-route disable
    next
end
config router bgp
    set as 65000
    set router-id 10.255.255.1
    set ibgp-multipath enable
    set recursive-next-hop enable
    set tag-resolve-mode merge
    config neighbor-group
        edit "SPOKES"
            set remote-as 65000
            set interface "Loopback"
            set update-source "Loopback"
            set soft-reconfiguration enable
            set route-reflector-client enable
        next
    end
    config neighbor-range
        edit 1
            set prefix 10.255.255.0 255.255.255.0
            set neighbor-group "SPOKES"
        next
    end
end</pre>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: one neighbor, the hub loopback</span>
config router bgp
    set as 65000
    set router-id 10.255.255.11
    set ibgp-multipath enable
    set recursive-next-hop enable
    set tag-resolve-mode merge
    config neighbor
        edit "10.255.255.1"
            set remote-as 65000
            set interface "Loopback"
            set update-source "Loopback"
            set soft-reconfiguration enable
        next
    end
end
config system sdwan
    config health-check
        edit "HUB1_HC"
            set server "10.255.255.1"
            set source 10.255.255.11
            set members 3 4
        next
    end
end</pre>
<p>The names, the mirror image on the spoke phase 1 (<code>exchange-ip-addr4 10.255.255.11</code> and one tunnel per ISP) and the <code>add-route disable</code> pattern follow the Fortinet "ADVPN with BGP on loopback" example. <code>add-route disable</code> stops the tunnel from installing its own selector routes, because BGP supplies the routes. The neighbor-range prefix is the loopback range, not the tunnel range, since the sessions now come from loopbacks. Probing the hub loopback with the spoke loopback as source makes the probe, and its reply, use the same tunnel as the member under test. Check Fortinet's guide for which probe target it recommends in your design, because a probe address that is also reachable through a different kernel route can hide a tunnel failure.</p>
<h3>eBGP and multihop</h3>
<p>If you use eBGP between loopbacks, the peer is more than one hop away and an eBGP packet normally carries a small TTL. FortiOS has <code>ebgp-enforce-multihop</code> to allow such neighbors and <code>ebgp-multihop-ttl</code> to set the TTL. For iBGP, as in this design, no multihop setting is needed.</p>
<h3>Additional paths</h3>
<p>A route reflector normally advertises only its <b>best</b> path per prefix. When two spokes in the same branch group advertise the same prefix, or when two hubs reflect the same prefix, a spoke would learn one path only and have no ECMP or quick backup. <b>BGP additional paths</b> let the sender advertise several paths: in the global BGP settings <code>additional-path</code> is enabled, <code>additional-path-select</code> sets how many paths (default 2), and on each neighbor <code>additional-path</code> takes the values send, receive, both or disable. Fortinet's loopback example uses <code>both</code> on the spoke neighbor. Enable it on both ends of a session so the capability is negotiated.</p>
<h3>Verification</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
BR1-FGT # get router info bgp summary
Neighbor        V         AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.255.1    4      65000     120     118       14    0    0 00:41:12        2

BR1-FGT # get router info routing-table details 10.255.255.1
Routing entry for 10.255.255.1/32
<span class="hl">  * vrf 0 169.254.16.1, via HUB1-VPN1</span>
<span class="hl">  * vrf 0 169.254.17.1, via HUB1-VPN2</span></pre>
<p>One neighbor, and two ECMP paths to its loopback. If the second line disappears, the session stays up through the remaining tunnel.</p>
<div class="warn"><p><b>Common mistake.</b> Peering on loopbacks but forgetting that the loopback address must be reachable through the tunnels. If the spoke has no route to the hub loopback, the session stays in Active state. Always test the reachability of the peer loopback first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Loopback peering needs three things: an address that is reachable (exchange-ip-addr4 and routes), the loopback as update-source, and recursive next-hop resolution. iBGP needs no multihop setting; eBGP over loopbacks does.</p></div>
<div class="scn"><h4>Six hundred sessions down to three hundred</h4><p>A retailer with 300 shops ran one BGP session per tunnel, 600 sessions on each hub, and every ISP flap reset a session and recomputed routes. After moving to loopback peering the hub held 300 sessions. When one ISP failed at a shop, the session stayed up over the second tunnel and only the ECMP path disappeared, so reconvergence was almost invisible.</p><p><b>Lesson:</b> Peer on the thing that does not fail, and let the underlay choose the path.</p></div>
<div class="iv"><p class="q">"Why peer BGP on loopbacks over an SD-WAN overlay?"</p><p>One session per spoke and hub instead of one per tunnel, so fewer sessions and a session that survives the loss of a tunnel. The loopback is reachable through all tunnels as ECMP, and recursive next-hop resolution lets BGP use them. It also keeps next hops stable for ADVPN shortcuts. I would mention that the SD-WAN health check should use the loopback as source and that additional paths avoid losing path diversity at a route reflector.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>BGP on loopback is a design, built from a loopback, exchange-ip-addr4, update-source, recursive-next-hop and ibgp-multipath.</li><li>One session survives tunnel failures because the loopback is an ECMP destination.</li><li>iBGP needs no multihop; eBGP over loopbacks uses ebgp-enforce-multihop and ebgp-multihop-ttl.</li><li>Additional paths let a route reflector send more than the best path.</li></ul></div>
`,hi:`
<p>Chapter 3 mein har tunnel ka apna BGP session tha. Har spoke ke do tunnels aur 300 spokes ke saath hub par 600 sessions hote hain, aur ek tunnel fail ho to uske upar ka session bhi fail ho jaata hai. Bade overlays ke liye behtar design <b>loopback par BGP</b> hai: har FortiGate ka ek loopback address, har spoke ka har hub loopback se <b>ek</b> session, aur woh session jo bhi tunnels up hain unke upar se chalta hai. Fortinet ke large-scale aur ADVPN examples yahi design use karte hain.</p>
<div class="note"><p><b>Note.</b> Shabdon ke baare mein pehli chetavni. Fortinet ki documentation is design ko "BGP on loopback" kehti hai, lekin mujhe is naam ka koi single FortiOS command nahi mila. Yeh settings ka combination hai, jo neeche listed hai. Agar kisi sawaal ya script mein iske liye ek hi switch dikhe to shak karo aur apne firmware par <code>?</code> se options check karo.</p></div>
<h3>Loopback design ke building blocks</h3>
<ol><li>Har FortiGate par /32 address wala <b>loopback interface</b>. Yeh kabhi down nahi hota, yahi poora point hai.</li><li><b>Loopback address IPsec peer ko advertise hota hai</b>. Tunnels ke phase 1 par <code>exchange-ip-addr4</code> option loopback address peer tak le jaata hai. Natija: spoke hub loopback tak har tunnel se pahunch sakta hai aur hub spoke loopback tak har tunnel se, ECMP routes ki tarah.</li><li><b>BGP loopbacks par peer karta hai</b>: <code>update-source</code> loopback hai, isliye TCP session do loopback addresses ke beech chalta hai.</li><li><b>Recursive next hop</b>: <code>recursive-next-hop enable</code> BGP ko next hop (loopback address) ko directly connected maangne ki jagah doosre route se resolve karne deta hai.</li><li><b>Multipath</b>: <code>ibgp-multipath enable</code> kai equal iBGP paths rakhta hai.</li><li><b>Tag resolve mode</b>: Fortinet ke example mein <code>tag-resolve-mode merge</code> set hota hai taaki next hop resolve karte waqt same tag wale routes combine hon. Tags hum chapter 5 mein use karte hain; is chapter mein bas yaad rakho ki option hai.</li><li><b>Health check source</b>: overlay par SD-WAN health check source address ke roop mein loopback use karta hai.</li></ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="10" y="80" width="150" height="70" rx="10" fill="#bae6fd"/><text x="85" y="106" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="85" y="124" text-anchor="middle" class="svg-muted" font-size="11">Loopback 10.255.255.11</text><rect x="480" y="80" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="106" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="555" y="124" text-anchor="middle" class="svg-muted" font-size="11">Loopback 10.255.255.1</text><line x1="160" y1="95" x2="480" y2="95" stroke="#16a34a" stroke-width="3"/><line x1="160" y1="135" x2="480" y2="135" stroke="#d97706" stroke-width="3"/><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">HUB1-VPN1</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="11">HUB1-VPN2</text><rect x="200" y="22" width="240" height="30" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">EK iBGP session, loopback se loopback</text><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Dono tunnels peer loopback tak ECMP paths hain.</text></svg><p class="cap">Ek BGP session kisi bhi tunnel ke jaane par bachta hai kyunki woh loopback addresses par chalta hai.</p></div>
<h3>Reference configuration</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT</span>
config system interface
    edit "Loopback"
        set vdom "root"
        set ip 10.255.255.1 255.255.255.255
        set allowaccess ping
        set type loopback
    next
end
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set exchange-ip-addr4 10.255.255.1
        set add-route disable
    next
    edit "HUB1-VPN2"
        set exchange-ip-addr4 10.255.255.1
        set add-route disable
    next
end
config router bgp
    set as 65000
    set router-id 10.255.255.1
    set ibgp-multipath enable
    set recursive-next-hop enable
    set tag-resolve-mode merge
    config neighbor-group
        edit "SPOKES"
            set remote-as 65000
            set interface "Loopback"
            set update-source "Loopback"
            set soft-reconfiguration enable
            set route-reflector-client enable
        next
    end
    config neighbor-range
        edit 1
            set prefix 10.255.255.0 255.255.255.0
            set neighbor-group "SPOKES"
        next
    end
end</pre>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: one neighbor, the hub loopback</span>
config router bgp
    set as 65000
    set router-id 10.255.255.11
    set ibgp-multipath enable
    set recursive-next-hop enable
    set tag-resolve-mode merge
    config neighbor
        edit "10.255.255.1"
            set remote-as 65000
            set interface "Loopback"
            set update-source "Loopback"
            set soft-reconfiguration enable
        next
    end
end
config system sdwan
    config health-check
        edit "HUB1_HC"
            set server "10.255.255.1"
            set source 10.255.255.11
            set members 3 4
        next
    end
end</pre>
<p>Naam, spoke phase 1 par mirror image (<code>exchange-ip-addr4 10.255.255.11</code> aur har ISP ke liye ek tunnel) aur <code>add-route disable</code> pattern Fortinet ke "ADVPN with BGP on loopback" example ko follow karte hain. <code>add-route disable</code> tunnel ko apne selector routes install karne se rokta hai, kyunki routes BGP deta hai. Neighbor-range prefix loopback range hai, tunnel range nahi, kyunki ab sessions loopbacks se aate hain. Hub loopback ko spoke loopback source ke saath probe karne se probe aur uska reply usi tunnel se jaate hain jo member test ho raha hai. Apne design mein Fortinet ki guide se check karo ki woh kaun sa probe target recommend karti hai, kyunki aisa probe address jo kisi doosre kernel route se bhi reachable ho tunnel failure ko chhupa sakta hai.</p>
<h3>eBGP aur multihop</h3>
<p>Agar aap loopbacks ke beech eBGP use karte ho to peer ek se zyada hop door hota hai aur eBGP packet aam taur par chhota TTL rakhta hai. FortiOS mein aise neighbors allow karne ke liye <code>ebgp-enforce-multihop</code> aur TTL set karne ke liye <code>ebgp-multihop-ttl</code> hai. iBGP ke liye, jaisa is design mein hai, koi multihop setting nahi chahiye.</p>
<h3>Additional paths</h3>
<p>Route reflector aam taur par har prefix ka sirf <b>best</b> path advertise karta hai. Jab ek branch group ke do spokes same prefix advertise karein, ya do hubs same prefix reflect karein, to spoke ko sirf ek path milta aur ECMP ya quick backup nahi hota. <b>BGP additional paths</b> sender ko kai paths advertise karne dete hain: global BGP settings mein <code>additional-path</code> enable hota hai, <code>additional-path-select</code> tay karta hai kitne paths (default 2), aur har neighbor par <code>additional-path</code> send, receive, both ya disable leta hai. Fortinet ka loopback example spoke neighbor par <code>both</code> use karta hai. Session ke dono ends par enable karo taaki capability negotiate ho.</p>
<h3>Verification</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
BR1-FGT # get router info bgp summary
Neighbor        V         AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.255.1    4      65000     120     118       14    0    0 00:41:12        2

BR1-FGT # get router info routing-table details 10.255.255.1
Routing entry for 10.255.255.1/32
<span class="hl">  * vrf 0 169.254.16.1, via HUB1-VPN1</span>
<span class="hl">  * vrf 0 169.254.17.1, via HUB1-VPN2</span></pre>
<p>Ek neighbor, aur uske loopback tak do ECMP paths. Agar doosri line gayab ho jaaye to bhi session bacha hua tunnel se up rehta hai.</p>
<div class="warn"><p><b>Common galti.</b> Loopbacks par peer karna lekin bhool jaana ki loopback address tunnels se reachable hona chahiye. Agar spoke ke paas hub loopback ka route nahi hai to session Active state mein rehta hai. Hamesha pehle peer loopback ki reachability test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Loopback peering ko teen cheezein chahiye: reachable address (exchange-ip-addr4 aur routes), update-source ke roop mein loopback, aur recursive next-hop resolution. iBGP ko multihop setting nahi chahiye; loopbacks par eBGP ko chahiye.</p></div>
<div class="scn"><h4>Chhe sau sessions se teen sau</h4><p>300 shops wale retailer ne har tunnel par ek BGP session chalaya, har hub par 600 sessions, aur har ISP flap ek session reset karta aur routes dobara compute karta. Loopback peering par jaane ke baad hub par 300 sessions rahe. Jab kisi shop par ek ISP fail hua, session doosre tunnel se up raha aur sirf ECMP path gaya, isliye reconvergence lagbhag dikha hi nahi.</p><p><b>Seekh:</b> Us cheez par peer karo jo fail nahi hoti, aur path underlay ko chunne do.</p></div>
<div class="iv"><p class="q">"SD-WAN overlay par loopbacks par BGP peer kyun karte hain?"</p><p>Har tunnel ke bajay har spoke aur hub ke beech ek session, isliye kam sessions aur aisa session jo tunnel jaane par bachta hai. Loopback sab tunnels se ECMP ke roop mein reachable hai, aur recursive next-hop resolution BGP ko unhe use karne deta hai. Yeh ADVPN shortcuts ke liye next hops ko stable bhi rakhta hai. Main yeh bhi kahunga ki SD-WAN health check ko source ke roop mein loopback use karna chahiye aur additional paths route reflector par path diversity khone se bachate hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>BGP on loopback ek design hai, jo loopback, exchange-ip-addr4, update-source, recursive-next-hop aur ibgp-multipath se bana hai.</li><li>Ek session tunnel failures se bachta hai kyunki loopback ECMP destination hai.</li><li>iBGP ko multihop nahi chahiye; loopbacks par eBGP ebgp-enforce-multihop aur ebgp-multihop-ttl use karta hai.</li><li>Additional paths route reflector ko best path se zyada bhejne dete hain.</li></ul></div>
`}};export{e as default};