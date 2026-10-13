var e=`<svg viewBox="0 0 640 280" role="img" aria-label="Active-active VPN gateway with two instances, two public IPs, two tunnels and BGP sessions to the on-premises device">
<rect x="20" y="30" width="230" height="200" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="135" y="52" text-anchor="middle" class="svg-ink" font-size="13">Azure VPN Gateway, ASN 65515</text>
<rect x="40" y="70" width="190" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="135" y="92" text-anchor="middle" class="svg-ink" font-size="12">Instance 0</text><text x="135" y="110" text-anchor="middle" class="svg-muted" font-size="10">pip 198.51.100.10, BGP 10.0.2.4</text>
<rect x="40" y="145" width="190" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="135" y="167" text-anchor="middle" class="svg-ink" font-size="12">Instance 1</text><text x="135" y="185" text-anchor="middle" class="svg-muted" font-size="10">pip 198.51.100.11, BGP 10.0.2.5</text>
<rect x="430" y="70" width="190" height="135" rx="12" fill="#e2e8f0" stroke="#64748b"/><text x="525" y="95" text-anchor="middle" class="svg-ink" font-size="13">On-premises, ASN 65010</text><text x="525" y="115" text-anchor="middle" class="svg-muted" font-size="11">device 203.0.113.20</text><text x="525" y="135" text-anchor="middle" class="svg-muted" font-size="11">BGP ID 192.168.255.1</text><text x="525" y="170" text-anchor="middle" class="svg-muted" font-size="11">announces 192.168.0.0/16</text>
<g stroke="#2563eb" stroke-width="3"><line x1="230" y1="100" x2="430" y2="120"/><line x1="230" y1="175" x2="430" y2="155"/></g>
<text x="330" y="102" text-anchor="middle" class="svg-accent" font-size="11">tunnel 1 + eBGP</text><text x="330" y="188" text-anchor="middle" class="svg-accent" font-size="11">tunnel 2 + eBGP</text>
<text x="320" y="262" text-anchor="middle" class="svg-muted" font-size="11">Both tunnels carry traffic; if one instance or tunnel fails, BGP withdraws it and the other keeps going</text>
</svg>`,t={id:`bgp-active-active`,h:{en:`BGP and active-active VPN gateways`,hi:`BGP aur active-active VPN gateways`},body:{en:`
<h3>Why add BGP to a VPN?</h3>
<p>With a static VPN you type the prefixes on both sides. If you add a new subnet on-premises, someone must edit the local network gateway; if a tunnel fails, nothing re-routes. <b>BGP</b> (Border Gateway Protocol) makes the two sides tell each other which prefixes they own. Add a subnet and it is announced; lose a tunnel and its routes are withdrawn. That also lets you run several tunnels and have routes shift on their own.</p>

<h3>BGP ingredients in Azure</h3>
<dl class="terms">
<dt>ASN</dt><dd>Autonomous system number. Azure VPN Gateway uses 65515 by default, and you may set another private ASN. Some values are reserved (verify the list before publishing; for example 8074, 8075, 12076 and 65515 to 65520 are reserved or special). The on-premises device uses a different ASN, for example 65010, because the session is eBGP.</dd>
<dt>BGP peer IP (Azure)</dt><dd>An address from the GatewaySubnet that the gateway uses as its BGP identity, for example 10.0.2.4. You read it from the gateway.</dd>
<dt>BGP peer IP (on-premises)</dt><dd>The IP your device uses for the session, stored in the local network gateway together with its ASN. It must not be in the VNet and must not be a public address you do not own.</dd>
<dt>APIPA</dt><dd>Azure can use 169.254.x.x addresses for BGP sessions, useful when your device only supports link-local peer addresses (verify the permitted APIPA range before publishing).</dd>
</dl>
<pre class="code">az network vnet-gateway create -g rg-hub -n vpn-gw-hub --vnet hub-vnet --public-ip-addresses pip-vpngw --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --asn 65515 --no-wait
az network local-gateway create -g rg-hub -n lng-office --gateway-ip-address 203.0.113.20 --asn 65010 --bgp-peering-address 192.168.255.1 --local-address-prefixes 192.168.255.1/32
az network vpn-connection create -g rg-hub -n cn-office --vnet-gateway1 vpn-gw-hub --local-gateway2 lng-office --shared-key 'REPLACE-WITH-A-LONG-RANDOM-KEY' --enable-bgp true</pre>
<p>With BGP the local network gateway needs only the peer address as a prefix; the rest of the office prefixes arrive by BGP (verify parameter details before relying on them).</p>

<h3>Reading BGP state</h3>
<pre class="code">az network vnet-gateway list-bgp-peer-status -g rg-hub -n vpn-gw-hub -o table
az network vnet-gateway list-learned-routes -g rg-hub -n vpn-gw-hub -o table
az network vnet-gateway list-advertised-routes -g rg-hub -n vpn-gw-hub --peer 192.168.255.1 -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Neighbor        ASN     State       RoutesReceived   MessagesSent
192.168.255.1   65010   <span class="hl">Connected</span>   3                121

Network            NextHop         Origin   AsPath
192.168.0.0/16     192.168.255.1   EBgp     <span class="hl">65010</span>
10.0.0.0/16        10.0.2.4        Network  (advertised to the office)</pre>
<p>If the state is <code>Connecting</code> or <code>Idle</code> while the tunnel is up, check ASNs, the peer addresses, and that a route to the peer address exists through the tunnel.</p>

<h3>Active-standby versus active-active</h3>
<p>By default a VPN gateway has two instances in <b>active-standby</b>: one carries traffic and the other waits. If the active one fails or is updated, the standby takes over, and the tunnel re-establishes (typically within tens of seconds, verify the current figures). In <b>active-active</b> mode both instances have their own public IP, and each builds a tunnel to your device at the same time. Traffic can use both, and the loss of one instance costs half the bandwidth, not the entire path.</p>
<div class="dia">`+e+`<p class="cap">Active-active gateway: two public IPs, two tunnels, two BGP sessions to the same on-premises device.</p></div>
<ul>
<li>Create the gateway with two public IPs (<code>--public-ip-addresses pip-a pip-b</code>) and <code>--active-active true</code> (verify the exact parameter spelling).</li>
<li>Configure the on-premises device with <b>two</b> tunnels, one to each Azure public IP. The device must handle ECMP or an equivalent so it can use both (verify device support).</li>
<li>For maximum resilience use two on-premises devices, each with a tunnel to each Azure instance (a full mesh of four tunnels).</li>
<li>Use zone-redundant (AZ) SKUs so instances sit in different zones.</li>
</ul>

<h3>Route selection when there are two paths</h3>
<p>When the same prefix arrives over two tunnels, Azure applies the usual BGP rules: shorter AS path, then other tie-breakers. Equal paths may be load-shared. If ExpressRoute and VPN both advertise a prefix, the ExpressRoute route is preferred for equal prefixes, which is why VPN works as a backup (covered in the next chapter). A <i>longer prefix</i> still beats a shorter one everywhere.</p>
<div class="eg"><p><b>Worked example.</b> Office announces 192.168.0.0/16 over both tunnels with AS path 65010. Azure learns the route twice and may load-share. Tunnel 1 drops: BGP withdraws the learned route via instance 0, traffic continues over tunnel 2. Bandwidth halves but the office stays reachable. When tunnel 1 returns, the route reappears.</p></div>

<div class="warn"><p><b>Common mistakes:</b> using the same ASN on both sides, putting the on-premises BGP address inside the VNet range, enabling BGP on the gateway but forgetting to enable it on the connection, and configuring only one tunnel on an active-active gateway.</p></div>
<div class="exam"><p><b>Exam trap:</b> active-active needs two public IPs and two tunnels from your device; making the gateway active-active alone does not give you redundancy. Another one: Azure's default VPN Gateway ASN is 65515.</p></div>

<div class="scn"><h4>The one-tunnel active-active gateway</h4><p>A company switched its gateway to active-active "for resilience" and left its firewall configured with a single tunnel to the first public IP. During a gateway maintenance event, instance 0 rebooted and the office lost connectivity for several minutes. The fix was a second tunnel on the firewall to the second Azure public IP, with BGP on both. Later maintenance events went unnoticed.</p><p><b>Lesson:</b> redundancy exists only when both sides use both paths.</p></div>

<div class="iv"><p class="q">"What does active-active add to an Azure VPN Gateway?"</p><p>Two instances each with their own public IP, both with live tunnels to your device, so you get two paths and faster, partial failover. It requires two tunnels and normally BGP on the on-premises side, and ideally zone-redundant SKUs and two on-premises devices.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP exchanges prefixes dynamically and withdraws routes on failure.</li>
<li>Azure ASN 65515 by default; on-premises uses a different ASN.</li>
<li>Check BGP with peer status, learned routes and advertised routes.</li>
<li>Active-active means two public IPs and two tunnels from your device.</li>
<li>Equal prefixes: ExpressRoute beats VPN; longer prefixes win over everything.</li>
</ul></div>
`,hi:`
<h3>VPN mein BGP kyun jodte hain?</h3>
<p>Static VPN mein aap dono sides par prefixes khud type karte ho. On-premises mein naya subnet add karo to kisi ko local network gateway edit karna padta hai; tunnel fail ho jaye to kuch re-route nahi hota. <b>BGP</b> (Border Gateway Protocol) dono sides ko ek doosre ko batane deta hai ki unke paas kaunse prefixes hain. Subnet add karo to woh announce hota hai; tunnel khoyo to uske routes withdraw ho jaate hain. Isse kai tunnels chalana aur routes ka apne aap shift hona bhi possible hota hai.</p>

<h3>Azure mein BGP ingredients</h3>
<dl class="terms">
<dt>ASN</dt><dd>Autonomous system number. Azure VPN Gateway default mein 65515 use karta hai, aur aap koi aur private ASN set kar sakte ho. Kuch values reserved hain (publish se pehle list verify karo; jaise 8074, 8075, 12076 aur 65515 se 65520 reserved ya special hain). On-premises device alag ASN use karta hai, jaise 65010, kyunki session eBGP hai.</dd>
<dt>BGP peer IP (Azure)</dt><dd>GatewaySubnet ka ek address jo gateway apni BGP identity ke taur par use karta hai, jaise 10.0.2.4. Aap ise gateway se padhte ho.</dd>
<dt>BGP peer IP (on-premises)</dt><dd>Wo IP jo aapka device session ke liye use karta hai, jo local network gateway mein uske ASN ke saath store hota hai. Yeh VNet ke andar nahi hona chahiye aur aisa public address nahi hona chahiye jo aapka nahi.</dd>
<dt>APIPA</dt><dd>Azure BGP sessions ke liye 169.254.x.x addresses use kar sakta hai, jab aapka device sirf link-local peer addresses support kare (publish se pehle permitted APIPA range verify karo).</dd>
</dl>
<pre class="code">az network vnet-gateway create -g rg-hub -n vpn-gw-hub --vnet hub-vnet --public-ip-addresses pip-vpngw --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --asn 65515 --no-wait
az network local-gateway create -g rg-hub -n lng-office --gateway-ip-address 203.0.113.20 --asn 65010 --bgp-peering-address 192.168.255.1 --local-address-prefixes 192.168.255.1/32
az network vpn-connection create -g rg-hub -n cn-office --vnet-gateway1 vpn-gw-hub --local-gateway2 lng-office --shared-key 'REPLACE-WITH-A-LONG-RANDOM-KEY' --enable-bgp true</pre>
<p>BGP ke saath local network gateway ko prefix ke taur par sirf peer address chahiye; office ke baaki prefixes BGP se aate hain (rely karne se pehle parameter details verify karo).</p>

<h3>BGP state padhna</h3>
<pre class="code">az network vnet-gateway list-bgp-peer-status -g rg-hub -n vpn-gw-hub -o table
az network vnet-gateway list-learned-routes -g rg-hub -n vpn-gw-hub -o table
az network vnet-gateway list-advertised-routes -g rg-hub -n vpn-gw-hub --peer 192.168.255.1 -o table</pre>
<pre class="out"><span class="c">Illustrative output</span>
Neighbor        ASN     State       RoutesReceived   MessagesSent
192.168.255.1   65010   <span class="hl">Connected</span>   3                121

Network            NextHop         Origin   AsPath
192.168.0.0/16     192.168.255.1   EBgp     <span class="hl">65010</span>
10.0.0.0/16        10.0.2.4        Network  (office ko advertised)</pre>
<p>Tunnel up ho par state <code>Connecting</code> ya <code>Idle</code> ho to ASNs, peer addresses, aur yeh check karo ki peer address tak tunnel ke through route hai.</p>

<h3>Active-standby versus active-active</h3>
<p>Default mein VPN gateway ke do instances <b>active-standby</b> mein hote hain: ek traffic carry karta hai aur doosra intezaar. Active fail ho ya update ho to standby sambhal leta hai, aur tunnel dobara establish hota hai (aam taur par kuch dus second mein, current figures verify karo). <b>Active-active</b> mode mein dono instances ke apne public IP hote hain, aur har ek aapke device se ek saath tunnel banata hai. Traffic dono use kar sakte hain, aur ek instance khone par aadhi bandwidth jaati hai, poora path nahi.</p>
<div class="dia">`+e+`<p class="cap">Active-active gateway: do public IPs, do tunnels, ek hi on-premises device se do BGP sessions.</p></div>
<ul>
<li>Gateway ko do public IPs (<code>--public-ip-addresses pip-a pip-b</code>) aur <code>--active-active true</code> ke saath banao (exact parameter spelling verify karo).</li>
<li>On-premises device mein <b>do</b> tunnels configure karo, har Azure public IP ke liye ek. Device ECMP ya uska equivalent handle kare taaki dono use kar sake (device support verify karo).</li>
<li>Maximum resilience ke liye do on-premises devices use karo, har ek ka har Azure instance se tunnel (chaar tunnels ka full mesh).</li>
<li>Zone-redundant (AZ) SKUs use karo taaki instances alag zones mein hon.</li>
</ul>

<h3>Do paths hon to route selection</h3>
<p>Jab ek hi prefix do tunnels se aata hai, Azure usual BGP rules lagata hai: chhota AS path, phir doosre tie-breakers. Barabar paths load-share ho sakte hain. Agar ExpressRoute aur VPN dono ek prefix advertise karein to barabar prefixes ke liye ExpressRoute route prefer hota hai, isliye VPN backup ki tarah kaam karta hai (agle chapter mein). <i>Lamba prefix</i> phir bhi har jagah chhote prefix par jeetta hai.</p>
<div class="eg"><p><b>Worked example.</b> Office 192.168.0.0/16 dono tunnels par AS path 65010 ke saath announce karta hai. Azure route do baar seekhta hai aur load-share kar sakta hai. Tunnel 1 gir gaya: BGP instance 0 wala learned route withdraw karta hai, traffic tunnel 2 se chalta rehta hai. Bandwidth aadhi ho jaati hai par office reachable rehta hai. Tunnel 1 wapas aaye to route wapas dikhta hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b> dono sides par same ASN, on-premises BGP address ko VNet range ke andar rakhna, gateway par BGP enable karke connection par enable karna bhool jaana, aur active-active gateway par sirf ek tunnel configure karna.</p></div>
<div class="exam"><p><b>Exam trap:</b> active-active ko do public IPs aur aapke device se do tunnels chahiye; sirf gateway ko active-active karne se redundancy nahi milti. Ek aur: Azure ka default VPN Gateway ASN 65515 hai.</p></div>

<div class="scn"><h4>Ek-tunnel wala active-active gateway</h4><p>Ek company ne "resilience ke liye" gateway active-active kar diya aur apna firewall pehle public IP ke ek hi tunnel ke saath chhod diya. Gateway maintenance event mein instance 0 reboot hua aur office kai minute offline raha. Fix: firewall par doosre Azure public IP ka doosra tunnel, dono par BGP ke saath. Baad ke maintenance events kisi ko pata nahi chale.</p><p><b>Lesson:</b> redundancy tab hoti hai jab dono sides dono paths use karein.</p></div>

<div class="iv"><p class="q">"Active-active Azure VPN Gateway mein kya jodta hai?"</p><p>Do instances jinke apne public IP hain, dono ke aapke device se live tunnels, to aapko do paths aur tez, partial failover milta hai. Isme do tunnels aur aam taur par on-premises side par BGP chahiye, aur ideal mein zone-redundant SKUs aur do on-premises devices.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP prefixes dynamically exchange karta hai aur failure par routes withdraw karta hai.</li>
<li>Azure ASN default 65515; on-premises alag ASN use karta hai.</li>
<li>BGP peer status, learned routes aur advertised routes se check karo.</li>
<li>Active-active matlab do public IPs aur aapke device se do tunnels.</li>
<li>Barabar prefixes: ExpressRoute VPN ko haraata hai; lamba prefix sab par jeetta hai.</li>
</ul></div>
`}};export{t as default};