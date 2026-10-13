var e=`<svg viewBox="0 0 640 250" role="img" aria-label="Site-to-site VPN objects: VPN gateway in the hub, local network gateway describing the office, connection with shared key, IPsec tunnel over the internet">
<rect x="15" y="40" width="200" height="150" rx="12" fill="#ddd6fe" stroke="#64748b"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="13">hub-vnet 10.0.0.0/16</text>
<rect x="35" y="80" width="160" height="44" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="115" y="100" text-anchor="middle" class="svg-ink" font-size="12">vpn-gw-hub (VpnGw1AZ)</text><text x="115" y="116" text-anchor="middle" class="svg-muted" font-size="10">GatewaySubnet 10.0.2.0/27</text>
<text x="115" y="150" text-anchor="middle" class="svg-muted" font-size="11">public IP: 198.51.100.10</text><text x="115" y="170" text-anchor="middle" class="svg-muted" font-size="11">route-based, IKEv2</text>
<rect x="425" y="40" width="200" height="150" rx="12" fill="#e2e8f0" stroke="#64748b"/><text x="525" y="62" text-anchor="middle" class="svg-ink" font-size="13">Office 192.168.0.0/16</text>
<rect x="445" y="80" width="160" height="44" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="525" y="100" text-anchor="middle" class="svg-ink" font-size="12">VPN device</text><text x="525" y="116" text-anchor="middle" class="svg-muted" font-size="10">public IP: 203.0.113.20</text>
<line x1="195" y1="102" x2="445" y2="102" stroke="#2563eb" stroke-width="4"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">IPsec / IKEv2 tunnel (internet)</text>
<rect x="240" y="125" width="160" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="11">Connection: shared key</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="10">gateway + local network gateway</text>
<text x="525" y="150" text-anchor="middle" class="svg-muted" font-size="11">local network gateway lng-office</text><text x="525" y="168" text-anchor="middle" class="svg-muted" font-size="11">= IP 203.0.113.20 + 192.168.0.0/16</text>
<text x="320" y="228" text-anchor="middle" class="svg-ink" font-size="12">Three Azure objects describe one tunnel: gateway, local network gateway, connection</text>
</svg>`,t={id:`vpn-gateway`,h:{en:`Azure VPN Gateway: site-to-site, SKUs and point-to-site`,hi:`Azure VPN Gateway: site-to-site, SKUs aur point-to-site`},body:{en:`
<h3>Three objects, one tunnel</h3>
<p>Azure describes a site-to-site tunnel with three objects. People often mix them up, so learn them as a set:</p>
<dl class="terms">
<dt>VPN gateway (virtual network gateway, type Vpn)</dt><dd>The Azure side. It is deployed into GatewaySubnet and gets a public IP. It runs as a pair of managed instances.</dd>
<dt>Local network gateway</dt><dd>A description of the <i>other</i> side: the public IP of your on-premises VPN device and the address prefixes behind it (or its BGP details). Despite the name, it is not a gateway you deploy; it is a record.</dd>
<dt>Connection</dt><dd>The link between the two, carrying the connection type (IPsec/Site-to-site), the pre-shared key and the IPsec/IKE settings.</dd>
</dl>
<div class="dia">`+e+`<p class="cap">One tunnel needs one VPN gateway, one local network gateway and one connection. The addresses use documentation ranges for the public IPs.</p></div>

<h3>Route-based or policy-based</h3>
<p><b>Route-based</b> VPNs use IKEv2 and a routing table: any traffic that routes into the tunnel interface is encrypted. They support BGP, multiple tunnels, VNet-to-VNet and point-to-site. <b>Policy-based</b> VPNs match traffic by fixed source/destination selectors (older devices, IKEv1) and are limited to the legacy Basic SKU in Azure. Use route-based wherever your device allows (verify the Basic SKU status before publishing; it has been moving towards retirement).</p>

<h3>SKUs</h3>
<table class="cmp"><tr><th>SKU family</th><th>Notes</th></tr>
<tr><td>Basic</td><td>Legacy, light-duty, no BGP, policy-based or route-based with limits; not for production (verify retirement before publishing)</td></tr>
<tr><td>VpnGw1 to VpnGw5</td><td>Route-based, increasing throughput and tunnel counts; Generation 1 or Generation 2 variants</td></tr>
<tr><td>VpnGw1AZ to VpnGw5AZ</td><td>Same sizes, zone-redundant: instances spread across availability zones. Preferred for new production deployments (verify)</td></tr></table>
<p>Throughput and tunnel limits per SKU change, so read the current SKU table before you pick one (verify before publishing). Use the smallest SKU that meets your throughput, because you can resize within a family without recreating the gateway.</p>
<p>Gateways take <b>30 to 45 minutes</b> to deploy and bill hourly from creation (verify the pricing structure). Plan lab time accordingly.</p>

<h3>Building it with the CLI (concept)</h3>
<pre class="code">az network public-ip create -g rg-hub -n pip-vpngw --sku Standard --allocation-method Static --zone 1 2 3
az network vnet-gateway create -g rg-hub -n vpn-gw-hub --vnet hub-vnet --public-ip-addresses pip-vpngw --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --vpn-gateway-generation Generation2 --no-wait
az network local-gateway create -g rg-hub -n lng-office --gateway-ip-address 203.0.113.20 --local-address-prefixes 192.168.0.0/16
az network vpn-connection create -g rg-hub -n cn-office --vnet-gateway1 vpn-gw-hub --local-gateway2 lng-office --shared-key 'REPLACE-WITH-A-LONG-RANDOM-KEY'</pre>
<p>Parameters can differ by CLI version; confirm with <code>--help</code> (verify before publishing). Treat the shared key like a password: use a long random value, keep it out of scripts you share, and use the same value on the device.</p>
<pre class="out"><span class="c">Illustrative output</span>
Name        ConnectionStatus   IngressBytesTransferred   EgressBytesTransferred
cn-office   <span class="hl">Connected</span>          1204811                   988342</pre>

<h3>IKE and IPsec basics</h3>
<p>IKEv2 negotiates in two phases: IKE phase 1 (the secure control channel; authentication with the pre-shared key) and phase 2 / child SA (the data tunnel that carries traffic, protected with ESP). Both sides must agree on encryption, integrity, Diffie-Hellman group and lifetimes. Azure supports default proposals, and a custom IPsec/IKE policy on the connection when the device needs specific settings. If the status stays <code>Connecting</code>, the usual culprits are a key mismatch, a wrong peer IP, proposals that do not match, or a blocked UDP 500 or 4500.</p>

<h3>Point-to-site (P2S)</h3>
<p>P2S lets an individual client dial into the same VPN gateway without a site device. You choose a <b>client address pool</b> (an RFC1918 range that does not overlap, for example 172.16.201.0/24), a <b>tunnel type</b> and an <b>authentication</b> method.</p>
<table class="cmp"><tr><th>Tunnel type</th><th>Notes</th></tr>
<tr><td>OpenVPN</td><td>TLS over TCP 443; works from Windows, macOS, Linux, iOS and Android; supports Microsoft Entra ID authentication</td></tr>
<tr><td>IKEv2</td><td>Native on macOS and many clients; UDP 500 and 4500</td></tr>
<tr><td>SSTP</td><td>Windows only, TLS over 443; limited concurrent connections</td></tr></table>
<p>Authentication choices: Azure certificate (client and root certificates), Microsoft Entra ID (OpenVPN, supports conditional access), or RADIUS. Users download a VPN client profile from the gateway and import it. Routes from the VNet and peered networks with gateway transit are pushed to the client (verify behaviour with peered VNets before publishing).</p>

<div class="warn"><p><b>Common mistakes:</b> overlapping the on-premises prefix with VNet space, entering a wrong local network gateway IP (the VPN device may be behind NAT), a mismatched shared key, a policy-based device against a route-based gateway, and forgetting that P2S client pools must not overlap anything.</p></div>
<div class="exam"><p><b>Exam trap:</b> the local network gateway is not a device you deploy; it is the Azure record of your on-premises device. Also: Entra ID authentication works with the OpenVPN protocol only.</p></div>

<div class="scn"><h4>The tunnel that stayed Connecting</h4><p>A new office tunnel never came up. Azure showed <code>NotConnected</code>; the on-premises firewall log showed IKE phase 1 failures. The shared key had been pasted with a trailing space on one side. Retyping the same key on both ends brought the tunnel up in a minute; the engineer then stored the key in a vault and rotated it.</p><p><b>Lesson:</b> start with the boring items: IPs, key, proposals, and blocked UDP 500 and 4500.</p></div>

<div class="iv"><p class="q">"What objects do you create for a site-to-site VPN in Azure?"</p><p>A VPN gateway in GatewaySubnet with a public IP, a local network gateway for the on-premises device (public IP and prefixes or BGP), and a connection with the shared key and IPsec settings. Mention route-based and IKEv2, and that deployment takes 30 to 45 minutes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateway, local network gateway and connection make one S2S tunnel.</li>
<li>Prefer route-based IKEv2; use zone-redundant AZ SKUs for new production gateways (verify).</li>
<li>The gateway takes 30 to 45 minutes to deploy and bills hourly.</li>
<li>P2S needs an address pool, a tunnel type and an authentication method.</li>
<li>If the tunnel will not come up: IP, key, proposals, UDP 500 and 4500.</li>
</ul></div>
`,hi:`
<h3>Teen objects, ek tunnel</h3>
<p>Azure site-to-site tunnel ko teen objects se describe karta hai. Log inhe aksar mix kar dete hain, isliye inhe ek set ke roop mein seekho:</p>
<dl class="terms">
<dt>VPN gateway (virtual network gateway, type Vpn)</dt><dd>Azure ki side. Yeh GatewaySubnet mein deploy hota hai aur public IP leta hai. Yeh managed instances ke jode ki tarah chalta hai.</dd>
<dt>Local network gateway</dt><dd><i>Doosri</i> side ka description: aapke on-premises VPN device ka public IP aur uske peeche ke address prefixes (ya uski BGP details). Naam ke bawajood yeh koi gateway nahi jo aap deploy karte ho; yeh ek record hai.</dd>
<dt>Connection</dt><dd>Dono ke beech link, jisme connection type (IPsec/Site-to-site), pre-shared key aur IPsec/IKE settings hoti hain.</dd>
</dl>
<div class="dia">`+e+`<p class="cap">Ek tunnel ko ek VPN gateway, ek local network gateway aur ek connection chahiye. Public IPs ke liye documentation ranges use hui hain.</p></div>

<h3>Route-based ya policy-based</h3>
<p><b>Route-based</b> VPNs IKEv2 aur routing table use karte hain: jo bhi traffic tunnel interface mein route hota hai woh encrypt hota hai. Yeh BGP, multiple tunnels, VNet-to-VNet aur point-to-site support karte hain. <b>Policy-based</b> VPNs fixed source/destination selectors se traffic match karte hain (purane devices, IKEv1) aur Azure mein legacy Basic SKU tak limited hain. Jahan aapka device allow kare wahan route-based use karo (publish se pehle Basic SKU ka status verify karo; woh retirement ki taraf badh raha hai).</p>

<h3>SKUs</h3>
<table class="cmp"><tr><th>SKU family</th><th>Notes</th></tr>
<tr><td>Basic</td><td>Legacy, halka, BGP nahi, policy-based ya limits ke saath route-based; production ke liye nahi (retirement publish se pehle verify karo)</td></tr>
<tr><td>VpnGw1 se VpnGw5</td><td>Route-based, badhta throughput aur tunnel counts; Generation 1 ya Generation 2 variants</td></tr>
<tr><td>VpnGw1AZ se VpnGw5AZ</td><td>Wahi sizes, zone-redundant: instances availability zones mein spread. Naye production deployments ke liye preferred (verify)</td></tr></table>
<p>Per-SKU throughput aur tunnel limits badalte rehte hain, isliye SKU chunne se pehle current SKU table padho (publish se pehle verify karo). Apne throughput ke liye sabse chhota SKU chuno, kyunki ek family ke andar gateway dobara banaye bina resize ho sakta hai.</p>
<p>Gateways ko deploy hone mein <b>30 se 45 minute</b> lagte hain aur creation se hourly bill karte hain (pricing structure verify karo). Lab time us hisaab se plan karo.</p>

<h3>CLI se banana (concept)</h3>
<pre class="code">az network public-ip create -g rg-hub -n pip-vpngw --sku Standard --allocation-method Static --zone 1 2 3
az network vnet-gateway create -g rg-hub -n vpn-gw-hub --vnet hub-vnet --public-ip-addresses pip-vpngw --gateway-type Vpn --vpn-type RouteBased --sku VpnGw1AZ --vpn-gateway-generation Generation2 --no-wait
az network local-gateway create -g rg-hub -n lng-office --gateway-ip-address 203.0.113.20 --local-address-prefixes 192.168.0.0/16
az network vpn-connection create -g rg-hub -n cn-office --vnet-gateway1 vpn-gw-hub --local-gateway2 lng-office --shared-key 'REPLACE-WITH-A-LONG-RANDOM-KEY'</pre>
<p>Parameters CLI version ke hisaab se alag ho sakte hain; <code>--help</code> se confirm karo (publish se pehle verify karo). Shared key ko password ki tarah treat karo: lambi random value, share hone wali scripts se bahar, aur device par wahi value.</p>
<pre class="out"><span class="c">Illustrative output</span>
Name        ConnectionStatus   IngressBytesTransferred   EgressBytesTransferred
cn-office   <span class="hl">Connected</span>          1204811                   988342</pre>

<h3>IKE aur IPsec basics</h3>
<p>IKEv2 do phases mein negotiate karta hai: IKE phase 1 (secure control channel; pre-shared key se authentication) aur phase 2 / child SA (data tunnel jo traffic carry karta hai, ESP se protected). Dono sides ko encryption, integrity, Diffie-Hellman group aur lifetimes par agree karna hota hai. Azure default proposals support karta hai, aur device ko specific settings chahiye to connection par custom IPsec/IKE policy. Status <code>Connecting</code> par atka rahe to aam wajah: key mismatch, galat peer IP, proposals match na hona, ya UDP 500 ya 4500 block hona.</p>

<h3>Point-to-site (P2S)</h3>
<p>P2S ek individual client ko site device ke bina usi VPN gateway mein dial karne deta hai. Aap ek <b>client address pool</b> (overlap na karne wali RFC1918 range, jaise 172.16.201.0/24), ek <b>tunnel type</b> aur ek <b>authentication</b> method chunte ho.</p>
<table class="cmp"><tr><th>Tunnel type</th><th>Notes</th></tr>
<tr><td>OpenVPN</td><td>TCP 443 par TLS; Windows, macOS, Linux, iOS aur Android par chalta hai; Microsoft Entra ID authentication support karta hai</td></tr>
<tr><td>IKEv2</td><td>macOS aur kai clients mein native; UDP 500 aur 4500</td></tr>
<tr><td>SSTP</td><td>Sirf Windows, 443 par TLS; concurrent connections limited</td></tr></table>
<p>Authentication choices: Azure certificate (client aur root certificates), Microsoft Entra ID (OpenVPN, conditional access support karta hai), ya RADIUS. Users gateway se VPN client profile download karke import karte hain. VNet aur gateway transit wale peered networks ke routes client ko push hote hain (peered VNets ke saath behaviour publish se pehle verify karo).</p>

<div class="warn"><p><b>Common mistakes:</b> on-premises prefix ko VNet space se overlap karna, local network gateway mein galat IP daalna (VPN device NAT ke peeche ho sakta hai), mismatched shared key, route-based gateway ke saamne policy-based device, aur yeh bhoolna ki P2S client pools kisi se overlap nahi hone chahiye.</p></div>
<div class="exam"><p><b>Exam trap:</b> local network gateway aisa device nahi jo aap deploy karte ho; yeh aapke on-premises device ka Azure record hai. Aur: Entra ID authentication sirf OpenVPN protocol ke saath chalta hai.</p></div>

<div class="scn"><h4>Tunnel jo Connecting par atka raha</h4><p>Naye office ka tunnel kabhi up nahi hua. Azure <code>NotConnected</code> dikha raha tha; on-premises firewall log mein IKE phase 1 failures the. Shared key ek side par trailing space ke saath paste ho gayi thi. Dono ends par wahi key dobara type karne se tunnel ek minute mein up ho gaya; engineer ne phir key ek vault mein rakhi aur rotate ki.</p><p><b>Lesson:</b> boring cheezon se shuru karo: IPs, key, proposals, aur blocked UDP 500 aur 4500.</p></div>

<div class="iv"><p class="q">"Azure mein site-to-site VPN ke liye kaunse objects banate ho?"</p><p>GatewaySubnet mein public IP ke saath VPN gateway, on-premises device ke liye local network gateway (public IP aur prefixes ya BGP), aur shared key aur IPsec settings ke saath connection. Route-based aur IKEv2 ka zikr karo, aur ki deployment 30 se 45 minute leta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateway, local network gateway aur connection mil kar ek S2S tunnel banate hain.</li>
<li>Route-based IKEv2 prefer karo; naye production gateways ke liye zone-redundant AZ SKUs (verify).</li>
<li>Gateway deploy hone mein 30 se 45 minute lagte hain aur hourly bill karta hai.</li>
<li>P2S ko address pool, tunnel type aur authentication method chahiye.</li>
<li>Tunnel up na ho to: IP, key, proposals, UDP 500 aur 4500.</li>
</ul></div>
`}};export{t as default};