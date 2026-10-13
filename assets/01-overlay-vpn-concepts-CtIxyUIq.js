var e={id:`overlay-vpn-concepts`,h:{en:`Overlay VPN concepts: hub-and-spoke, mesh and what SD-WAN adds`,hi:`Overlay VPN concepts: hub-and-spoke, mesh aur SD-WAN kya add karta hai`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>Why a company with several offices builds an <b>overlay</b> network on top of the internet.</li>
<li>The difference between <b>hub-and-spoke</b> and <b>full mesh</b>, and why Bharat Retail Co uses hub-and-spoke.</li>
<li>What <b>SD-WAN</b> adds on top of a plain VPN: path choice, failover and policy.</li>
<li>The words used in the rest of this module: tunnel, hub, spoke, uplink, underlay, overlay.</li>
</ul>
<p><b>Prerequisites.</b> Basic IP addressing and Ethernet. You should have finished <b>mk-start</b> (organization, networks, tags) and <b>mk-mx</b> (VLANs and subnets on the MX). Nothing about VPNs is assumed.</p>

<h3>The big picture: private lorries on public roads</h3>
<p>Think of the public internet as a national highway shared by everyone. Bharat Retail Co has three buildings: Mumbai HQ, Bengaluru Branch and Delhi Branch. Staff in Bengaluru need the file server in Mumbai (10.1.20.10). You do not want to put that server on the open highway for anyone to knock on. So the company hires <b>sealed lorries</b> that travel on the same highway but carry only company goods, locked, with a known destination. These sealed lorries are <b>VPN tunnels</b>.</p>
<p>A <b>VPN</b> (virtual private network) wraps private traffic inside ordinary internet packets between two gateways, so that the two sites behave as if they were on one private network. The road itself is called the <b>underlay</b> (the real internet circuits: ILL-MUM-01, BB-BLR-01 and so on). The sealed lorries form the <b>overlay</b> (the private network drawn on top). Remember these two words: the overlay is what your users see, the underlay is what carries it.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Underlay internet and overlay tunnels">
<rect x="20" y="95" width="600" height="60" rx="30" fill="#e2e8f0"/><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="13">Underlay: the public internet (ISP-A, ISP-B)</text>
<rect x="30" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="90" y="42" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM</text><text x="90" y="58" text-anchor="middle" class="svg-muted" font-size="12">hub, 10.1.x.x</text>
<rect x="260" y="180" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR</text><text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">spoke, 10.2.x.x</text>
<rect x="490" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="42" text-anchor="middle" class="svg-ink" font-size="13">MX-DEL</text><text x="550" y="58" text-anchor="middle" class="svg-muted" font-size="12">spoke, 10.3.x.x</text>
<line x1="110" y1="70" x2="300" y2="180" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/>
<line x1="150" y1="45" x2="490" y2="45" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/>
<text x="320" y="38" text-anchor="middle" class="svg-accent" font-size="12">tunnel Mumbai - Delhi</text>
<text x="170" y="150" class="svg-accent" font-size="12">tunnel Mumbai - Bengaluru</text>
</svg><p class="cap">Dashed lines are the overlay (tunnels). The grey band is the underlay that physically carries them.</p></div>

<h3>Hub-and-spoke versus full mesh</h3>
<p>With three sites you could connect every site to every other site. This is a <b>full mesh</b>: Mumbai-Bengaluru, Mumbai-Delhi and Bengaluru-Delhi. With 3 sites that is 3 tunnels. The number of tunnels for N sites is N x (N - 1) / 2, so 10 sites need 45 tunnels and 50 sites need 1,225. Mesh grows quickly and each tunnel is something to manage and monitor.</p>
<p>In <b>hub-and-spoke</b> one site is the <b>hub</b> (the central meeting point) and every other site is a <b>spoke</b> that builds one tunnel to the hub. For N sites you need N - 1 tunnels. Bharat Retail Co has the hub in Mumbai because the servers (VLAN 20) live there, so almost all traffic goes to Mumbai anyway. A Bengaluru-to-Delhi packet goes Bengaluru, then Mumbai, then Delhi. That is one extra hop, which is the price of simplicity.</p>
<table class="cmp"><tr><th>Design</th><th>Tunnels for N sites</th><th>Best when</th></tr>
<tr><td>Hub-and-spoke</td><td>N - 1</td><td>Most traffic goes to HQ or data centre; simple to run</td></tr>
<tr><td>Full mesh</td><td>N x (N - 1) / 2</td><td>Many branch-to-branch flows that must not detour</td></tr></table>

<h3>What SD-WAN adds</h3>
<p>A traditional WAN used one expensive private circuit per site. <b>SD-WAN</b> (software-defined wide area network) lets you use ordinary internet circuits, often two per site, and adds software intelligence on top: it builds the tunnels automatically from a cloud dashboard, watches the health of each circuit, <b>fails over</b> when one breaks, and lets you apply <b>policy</b> (for example, send voice over the better circuit). In this module, <b>AutoVPN</b> is the tunnel-building part and the <b>Uplinks</b> page is the path-choice part. The word <i>Auto</i> means you do not type tunnel addresses or keys: you choose a role (hub or spoke) and the dashboard coordinates the rest.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail Co has 3 sites, so mesh would be 3 tunnels and hub-and-spoke 2. If it grows to 40 stores plus HQ (41 sites), mesh needs 41 x 40 / 2 = 820 tunnels while hub-and-spoke needs 40. That is why the design contract puts MX-MUM as the hub and MX-BLR and MX-DEL as spokes.</p></div>

<div class="note"><p><b>Click-ops, but you understand what each click does.</b> Later chapters use the <b>Site-to-site VPN</b> and <b>Uplinks</b> pages. Choosing hub or spoke changes how the MX behaves on the wire: it decides who starts tunnels and who waits for them. Details such as the exact encryption and the list of ports come from the vendor documentation; the simulator models only the logic.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling the tunnel the "internet link" (the tunnel rides on the link, it is not the link); expecting a spoke-to-spoke packet to go direct in hub-and-spoke; assuming a VPN makes the site safe from everything (it protects the traffic in transit, not the devices).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which topology needs the fewest tunnels?" Hub-and-spoke: N - 1. "Which words describe the real circuits and the virtual private network?" Underlay and overlay.</p></div>

<div class="scn"><h4>The 40-store rollout</h4><p>A retailer planned a full mesh for 41 sites. The network team estimated 820 tunnels to monitor and re-key when a store changed ISP. They switched to a hub-and-spoke plan with two hubs. Each new store needed one change: set the store MX to spoke and list the hubs. Branch-to-branch traffic took one extra hop, which nobody noticed.</p><p><b>Lesson:</b> choose the topology from the traffic pattern, then let automation build the tunnels.</p></div>

<div class="iv"><p class="q">"What is the difference between hub-and-spoke and mesh, and what does SD-WAN add?"</p><p>Strong answer: hub-and-spoke uses N - 1 tunnels through a central site, simple but with an extra hop for branch-to-branch traffic; mesh uses N x (N - 1) / 2 direct tunnels. SD-WAN adds central automation, circuit health monitoring, failover and policy-based path choice on top of the tunnels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VPN carries private traffic inside internet packets; the overlay rides on the underlay.</li>
<li>Hub-and-spoke needs N - 1 tunnels; full mesh needs N x (N - 1) / 2.</li>
<li>Bharat Retail Co: hub MX-MUM, spokes MX-BLR and MX-DEL.</li>
<li>SD-WAN adds automation, health monitoring, failover and policy.</li>
<li>Spoke-to-spoke traffic in hub-and-spoke detours via the hub.</li>
</ul></div>
`,hi:`
<h3>What you will learn</h3>
<ul>
<li>Kai offices wali company internet ke upar <b>overlay</b> network kyun banati hai.</li>
<li><b>Hub-and-spoke</b> aur <b>full mesh</b> mein fark, aur Bharat Retail Co hub-and-spoke kyun use karta hai.</li>
<li>Plain VPN ke upar <b>SD-WAN</b> kya add karta hai: path choice, failover aur policy.</li>
<li>Is module ke words: tunnel, hub, spoke, uplink, underlay, overlay.</li>
</ul>
<p><b>Prerequisites.</b> Basic IP addressing aur Ethernet. Aapne <b>mk-start</b> (organization, networks, tags) aur <b>mk-mx</b> (MX par VLANs aur subnets) complete kiya hona chahiye. VPN ke baare mein kuch pehle se jaanna zaroori nahi.</p>

<h3>Big picture: public sadak par private lorries</h3>
<p>Public internet ko ek national highway samjho jo sab share karte hain. Bharat Retail Co ki teen buildings hain: Mumbai HQ, Bengaluru Branch aur Delhi Branch. Bengaluru ke staff ko Mumbai ka file server (10.1.20.10) chahiye. Aap us server ko khuli sadak par nahi rakhna chahte jahan koi bhi darwaza khatkhatae. To company <b>sealed lorries</b> hire karti hai jo usi highway par chalti hain lekin sirf company ka maal le jaati hain, locked, aur known destination ke saath. Yeh sealed lorries hi <b>VPN tunnels</b> hain.</p>
<p><b>VPN</b> (virtual private network) private traffic ko do gateways ke beech normal internet packets ke andar wrap karta hai, taaki dono sites aise behave karein jaise ek hi private network par hon. Sadak ko <b>underlay</b> kehte hain (asli internet circuits: ILL-MUM-01, BB-BLR-01 wagairah). Sealed lorries <b>overlay</b> banati hain (upar draw kiya private network). Yeh do words yaad rakho: overlay woh hai jo users dekhte hain, underlay woh hai jo use carry karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Underlay internet aur overlay tunnels">
<rect x="20" y="95" width="600" height="60" rx="30" fill="#e2e8f0"/><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="13">Underlay: public internet (ISP-A, ISP-B)</text>
<rect x="30" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="90" y="42" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM</text><text x="90" y="58" text-anchor="middle" class="svg-muted" font-size="12">hub, 10.1.x.x</text>
<rect x="260" y="180" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR</text><text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">spoke, 10.2.x.x</text>
<rect x="490" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="42" text-anchor="middle" class="svg-ink" font-size="13">MX-DEL</text><text x="550" y="58" text-anchor="middle" class="svg-muted" font-size="12">spoke, 10.3.x.x</text>
<line x1="110" y1="70" x2="300" y2="180" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/>
<line x1="150" y1="45" x2="490" y2="45" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/>
<text x="320" y="38" text-anchor="middle" class="svg-accent" font-size="12">tunnel Mumbai - Delhi</text>
<text x="170" y="150" class="svg-accent" font-size="12">tunnel Mumbai - Bengaluru</text>
</svg><p class="cap">Dashed lines overlay (tunnels) hain. Grey band underlay hai jo unhe physically carry karta hai.</p></div>

<h3>Hub-and-spoke versus full mesh</h3>
<p>Teen sites ke saath aap har site ko har dusri site se jod sakte ho. Yeh <b>full mesh</b> hai: Mumbai-Bengaluru, Mumbai-Delhi aur Bengaluru-Delhi. 3 sites par 3 tunnels. N sites ke tunnels: N x (N - 1) / 2, to 10 sites ke liye 45 aur 50 sites ke liye 1,225. Mesh tezi se badhta hai aur har tunnel manage aur monitor karna padta hai.</p>
<p><b>Hub-and-spoke</b> mein ek site <b>hub</b> (central meeting point) hoti hai aur baaki har site <b>spoke</b> hoti hai jo hub tak ek tunnel banati hai. N sites ke liye N - 1 tunnels. Bharat Retail Co ka hub Mumbai mein hai kyunki servers (VLAN 20) wahin hain, to zyada traffic waise bhi Mumbai jaata hai. Bengaluru se Delhi ka packet Bengaluru, phir Mumbai, phir Delhi jaata hai. Ek extra hop, simplicity ki keemat.</p>
<table class="cmp"><tr><th>Design</th><th>N sites ke liye tunnels</th><th>Kab best</th></tr>
<tr><td>Hub-and-spoke</td><td>N - 1</td><td>Zyada traffic HQ ya data centre jaata hai; chalana aasaan</td></tr>
<tr><td>Full mesh</td><td>N x (N - 1) / 2</td><td>Branch-to-branch flows bahut hain jo detour nahi kar sakte</td></tr></table>

<h3>SD-WAN kya add karta hai</h3>
<p>Traditional WAN mein har site ke liye ek mehenga private circuit hota tha. <b>SD-WAN</b> (software-defined wide area network) aapko normal internet circuits (aksar har site par do) use karne deta hai aur upar software intelligence add karta hai: cloud dashboard se tunnels automatically banata hai, har circuit ki health dekhta hai, ek toot jaye to <b>failover</b> karta hai, aur <b>policy</b> lagane deta hai (jaise voice ko behtar circuit par bhejo). Is module mein <b>AutoVPN</b> tunnel-building part hai aur <b>Uplinks</b> page path-choice part. <i>Auto</i> ka matlab: aap tunnel addresses ya keys type nahi karte, sirf role (hub ya spoke) chunte ho aur baaki dashboard coordinate karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail Co ki 3 sites hain, to mesh 3 tunnels aur hub-and-spoke 2. Agar yeh 40 stores plus HQ (41 sites) ho jaye, to mesh ko 41 x 40 / 2 = 820 tunnels chahiye jabki hub-and-spoke ko 40. Isiliye design contract mein MX-MUM hub hai aur MX-BLR, MX-DEL spokes.</p></div>

<div class="note"><p><b>Click-ops, but you understand what each click does.</b> Aage ke chapters <b>Site-to-site VPN</b> aur <b>Uplinks</b> pages use karte hain. Hub ya spoke chunne se MX ka wire par behaviour badalta hai: kaun tunnel shuru karta hai aur kaun intezaar karta hai. Exact encryption aur ports ki list vendor documentation se aati hai; simulator sirf logic model karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Tunnel ko "internet link" kehna (tunnel link ke upar chalta hai, woh link nahi hai); hub-and-spoke mein spoke-to-spoke packet ke direct jaane ki ummeed; yeh sochna ki VPN site ko har cheez se safe kar deta hai (woh transit mein traffic protect karta hai, devices nahi).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsi topology mein sabse kam tunnels?" Hub-and-spoke: N - 1. "Real circuits aur virtual private network ke liye kaunse words?" Underlay aur overlay.</p></div>

<div class="scn"><h4>40-store rollout</h4><p>Ek retailer ne 41 sites ke liye full mesh plan kiya. Network team ne 820 tunnels monitor aur re-key karne ka estimate nikala jab bhi koi store ISP badle. Unhone do hubs ke saath hub-and-spoke plan par switch kiya. Har naye store ke liye ek change: store MX ko spoke set karo aur hubs list karo. Branch-to-branch traffic ko ek extra hop laga, kisi ne notice nahi kiya.</p><p><b>Seekh:</b> traffic pattern se topology chuno, phir automation ko tunnels banane do.</p></div>

<div class="iv"><p class="q">"Hub-and-spoke aur mesh mein kya fark hai, aur SD-WAN kya add karta hai?"</p><p>Strong answer: hub-and-spoke central site ke through N - 1 tunnels use karta hai, simple lekin branch-to-branch traffic ko extra hop; mesh N x (N - 1) / 2 direct tunnels use karta hai. SD-WAN tunnels ke upar central automation, circuit health monitoring, failover aur policy-based path choice add karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN private traffic ko internet packets ke andar le jaata hai; overlay underlay par chalta hai.</li>
<li>Hub-and-spoke ko N - 1 tunnels; full mesh ko N x (N - 1) / 2.</li>
<li>Bharat Retail Co: hub MX-MUM, spokes MX-BLR aur MX-DEL.</li>
<li>SD-WAN automation, health monitoring, failover aur policy add karta hai.</li>
<li>Hub-and-spoke mein spoke-to-spoke traffic hub se detour karta hai.</li>
</ul></div>
`}};export{e as default};