var e={id:`routing-policy-nat`,h:{en:`Routing, policy and NAT for tunnel traffic`,hi:`Tunnel traffic ke liye routing, policy aur NAT`},body:{en:`
<p>A tunnel without routing and policy is a tunnel nobody can use. Think of a private road between two factories: the road exists, but the gate guards (policy) must let trucks through and the signposts (routes) must point trucks onto it. This chapter covers the three things that decide whether user traffic crosses the tunnel: <b>routing</b>, <b>security policy</b> and <b>NAT</b>.</p>

<h3>Routing: send traffic into the tunnel</h3>
<p>Because the VPN is route-based, a packet is encrypted only if the routing table sends it out the tunnel interface. Two common ways:</p>
<ul>
<li><b>Static route</b>: <code>10.20.0.0/16 via tunnel.11</code> at HQ and the mirror at the branch. Simple and fine for small networks. You can also use the far tunnel address (10.255.11.2) as the next hop.</li>
<li><b>Dynamic routing</b> (OSPF or BGP) across the tunnel. Needs an IP address on each tunnel interface and a matching zone policy for the routing protocol. Best for many sites and automatic failover; see pan-routing for the protocols.</li>
</ul>
<p>Beware of a more specific route or a default route that sends the remote subnet to the Internet. Routing uses the longest prefix match, so a /24 pointing at the ISP beats your /16 via the tunnel. The tunnel's own peer address must <b>not</b> be reachable through the tunnel: the IKE packets to 203.0.113.1 must leave through the Internet interface, never the tunnel interface, or the tunnel will collapse and flap.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Packet path through policy and tunnel">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="13">Host 10.10.4.20</text>
<rect x="150" y="30" width="130" height="140" rx="10" fill="#bae6fd"/><text x="215" y="55" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW</text><text x="215" y="85" text-anchor="middle" class="svg-muted" font-size="12">1 route lookup</text><text x="215" y="105" text-anchor="middle" class="svg-muted" font-size="12">2 policy trust to VPN</text><text x="215" y="125" text-anchor="middle" class="svg-muted" font-size="12">3 NAT: none</text><text x="215" y="145" text-anchor="middle" class="svg-muted" font-size="12">4 encrypt (ESP)</text>
<rect x="310" y="85" width="110" height="30" rx="15" fill="#ddd6fe"/><text x="365" y="105" text-anchor="middle" class="svg-ink" font-size="12">IPsec tunnel</text>
<rect x="450" y="70" width="80" height="60" rx="10" fill="#bae6fd"/><text x="490" y="105" text-anchor="middle" class="svg-ink" font-size="13">BR-FW</text>
<rect x="545" y="70" width="90" height="60" rx="10" fill="#fde68a"/><text x="590" y="105" text-anchor="middle" class="svg-ink" font-size="12">10.20.1.5</text>
<line x1="120" y1="100" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="280" y1="100" x2="310" y2="100" stroke="#64748b" stroke-width="2"/><line x1="420" y1="100" x2="450" y2="100" stroke="#64748b" stroke-width="2"/><line x1="530" y1="100" x2="545" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Route lookup, policy, NAT decision, then encryption.</p></div>

<h3>Security policy: two kinds of traffic</h3>
<p><b>1. The user traffic inside the tunnel.</b> The tunnel interface is in the VPN zone, so write rules such as:</p>
<ul>
<li>From <b>trust</b> to <b>VPN</b>: source 10.10.0.0/16, destination 10.20.0.0/16, the applications you want (use App-ID, not "any").</li>
<li>From <b>VPN</b> to <b>trust</b>: the mirror, only what the branch needs. Least privilege applies to site-to-site links too, because a branch compromise should not give full access to HQ.</li>
</ul>
<p><b>2. The VPN control traffic itself.</b> IKE (UDP 500, UDP 4500) and ESP (IP protocol 50) arrive at the firewall's own Internet address. They need a rule that allows the applications <b>ike</b>, <b>ipsec-esp</b> and <b>ipsec-esp-udp</b> from the Internet zone to the same zone. The default intrazone rule normally already allows this (the destination is the firewall's own interface in the same zone), but if you have overridden the default or have an explicit intrazone deny, add the rule yourself. A common sign of this problem is that phase 1 never starts and the Traffic log shows denied IKE.</p>

<h3>NAT: exempt tunnel traffic</h3>
<p>If HQ has a source-NAT rule for Internet access (trust to untrust, translate to the public IP), tunnel traffic must <b>not</b> match it. Create a <b>no-NAT</b> rule above it: source zone trust, destination zone VPN, source 10.10.0.0/16, destination 10.20.0.0/16, no translation. NAT rules are read top-down, so order matters. Also remember that a policy is evaluated using the original (pre-NAT) addresses and the zones determined after the route lookup.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># Static route to the remote LAN (HQ-FW)</span>
set network virtual-router default routing-table ip static-route TO-BRANCH destination 10.20.0.0/16 interface tunnel.11
<span class="c"># Security policy: trust to VPN</span>
set rulebase security rules HQ-TO-BRANCH from trust to VPN source 10.10.0.0/16 destination 10.20.0.0/16 application any service application-default action allow
<span class="c"># Security policy: VPN to trust (narrow it to needed applications in real life)</span>
set rulebase security rules BRANCH-TO-HQ from VPN to trust source 10.20.0.0/16 destination 10.10.0.0/16 application any service application-default action allow
<span class="c"># No-NAT rule placed above the Internet source NAT rule</span>
set rulebase nat rules NO-NAT-VPN from trust to VPN source 10.10.0.0/16 destination 10.20.0.0/16 service any</pre>
<p>"application any" is used here for brevity. In production list the real applications. Verify syntax with <code>?</code>.</p>

<div class="eg"><p><b>Worked example.</b> HQ's Internet rule translates every trust source to 198.51.100.1. A branch user opens an HQ server and the packet arrives from 198.51.100.1 instead of 10.10.x.x. The branch server's policy rejects it. The cause: the no-NAT rule was missing, so source NAT applied to the tunnel traffic. Adding the no-NAT rule above the Internet rule fixed it.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Allowing "any any" between trust and VPN because "it is our own site". Branches are attractive attack steps. Allow only the applications and subnets required.</p></div>
<div class="exam"><p><b>Exam trap.</b> Routing sends traffic to the tunnel interface; zone policy is evaluated for the tunnel zone; a no-NAT rule must precede source NAT. The IKE peer address must be reachable outside the tunnel.</p></div>

<div class="scn"><h4>Everything up, still no pings</h4><p>The IKE and IPsec SAs were established, but pings to the branch got no reply. A routing check showed 10.20.0.0/16 resolved to the Internet interface because a leftover static route for 10.20.1.0/24 pointed at the ISP. Removing it let the /16 via the tunnel win.</p><p><b>Lesson:</b> check which route the destination actually matches before blaming the VPN.</p></div>

<div class="iv"><p class="q">"The tunnel is up but traffic does not pass. What do you check?"</p><p>First the route to the remote subnet and its egress interface, then the security policy in both directions and the zone of the tunnel interface, then NAT to be sure tunnel traffic is exempt, then the remote side's mirror config, then MTU and the traffic logs. I also confirm the tunnel is actually used by looking at session details.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route-based: only traffic routed to the tunnel interface is encrypted.</li>
<li>Beware longer-prefix or default routes that hijack remote subnets.</li>
<li>Policy for tunnel traffic uses the VPN zone; allow ike and ipsec applications to the firewall itself.</li>
<li>Create a no-NAT rule above Internet source NAT.</li>
<li>Apply least privilege across the tunnel.</li>
</ul></div>
`,hi:`
<p>Routing aur policy ke bina tunnel aisa tunnel hai jise koi use nahi kar sakta. Do factories ke beech private sadak socho: sadak maujood hai, lekin gate guards (policy) ko trucks jaane dene hain aur signposts (routes) ko trucks ko uspar bhejna hai. Yeh chapter woh teen cheezein cover karta hai jo tay karti hain ki user traffic tunnel cross karega ya nahi: <b>routing</b>, <b>security policy</b> aur <b>NAT</b>.</p>

<h3>Routing: traffic ko tunnel mein bhejo</h3>
<p>VPN route-based hai, isliye packet tabhi encrypt hota hai jab routing table use tunnel interface se bahar bheje. Do common tareeke:</p>
<ul>
<li><b>Static route</b>: HQ par <code>10.20.0.0/16 via tunnel.11</code> aur branch par uska mirror. Simple aur chhote networks ke liye theek. Aap far tunnel address (10.255.11.2) ko next hop bhi bana sakte ho.</li>
<li>Tunnel ke upar <b>dynamic routing</b> (OSPF ya BGP). Har tunnel interface par IP address aur routing protocol ke liye matching zone policy chahiye. Kai sites aur automatic failover ke liye best; protocols ke liye pan-routing dekho.</li>
</ul>
<p>Aise zyada specific route ya default route se savdhan raho jo remote subnet ko Internet bhej de. Routing longest prefix match use karti hai, isliye ISP ki taraf point karta /24 aapke tunnel wale /16 ko haraa deta hai. Tunnel ke apne peer address ko tunnel ke through reachable <b>nahi</b> hona chahiye: 203.0.113.1 ke IKE packets Internet interface se jaane chahiye, tunnel interface se kabhi nahi, nahi to tunnel collapse hoga aur flap karega.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Packet path through policy and tunnel">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="13">Host 10.10.4.20</text>
<rect x="150" y="30" width="130" height="140" rx="10" fill="#bae6fd"/><text x="215" y="55" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW</text><text x="215" y="85" text-anchor="middle" class="svg-muted" font-size="12">1 route lookup</text><text x="215" y="105" text-anchor="middle" class="svg-muted" font-size="12">2 policy trust to VPN</text><text x="215" y="125" text-anchor="middle" class="svg-muted" font-size="12">3 NAT: none</text><text x="215" y="145" text-anchor="middle" class="svg-muted" font-size="12">4 encrypt (ESP)</text>
<rect x="310" y="85" width="110" height="30" rx="15" fill="#ddd6fe"/><text x="365" y="105" text-anchor="middle" class="svg-ink" font-size="12">IPsec tunnel</text>
<rect x="450" y="70" width="80" height="60" rx="10" fill="#bae6fd"/><text x="490" y="105" text-anchor="middle" class="svg-ink" font-size="13">BR-FW</text>
<rect x="545" y="70" width="90" height="60" rx="10" fill="#fde68a"/><text x="590" y="105" text-anchor="middle" class="svg-ink" font-size="12">10.20.1.5</text>
<line x1="120" y1="100" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="280" y1="100" x2="310" y2="100" stroke="#64748b" stroke-width="2"/><line x1="420" y1="100" x2="450" y2="100" stroke="#64748b" stroke-width="2"/><line x1="530" y1="100" x2="545" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Route lookup, policy, NAT decision, phir encryption.</p></div>

<h3>Security policy: do tarah ka traffic</h3>
<p><b>1. Tunnel ke andar ka user traffic.</b> Tunnel interface VPN zone mein hai, isliye aise rules likho:</p>
<ul>
<li><b>trust</b> se <b>VPN</b>: source 10.10.0.0/16, destination 10.20.0.0/16, jo applications chahiye (App-ID use karo, "any" nahi).</li>
<li><b>VPN</b> se <b>trust</b>: mirror, sirf wohi jo branch ko chahiye. Site-to-site links par bhi least privilege lagta hai, kyunki branch ka compromise HQ ka full access nahi dena chahiye.</li>
</ul>
<p><b>2. VPN ka control traffic khud.</b> IKE (UDP 500, UDP 4500) aur ESP (IP protocol 50) firewall ke apne Internet address par aate hain. Unhe aise rule chahiye jo applications <b>ike</b>, <b>ipsec-esp</b> aur <b>ipsec-esp-udp</b> ko Internet zone se usi zone tak allow kare. Default intrazone rule aam taur par ise pehle se allow karta hai (destination same zone mein firewall ka apna interface hai), lekin agar aapne default override kiya hai ya explicit intrazone deny hai, to rule khud jodo. Is problem ka common sign yeh hai ki phase 1 kabhi shuru nahi hota aur Traffic log mein IKE denied dikhta hai.</p>

<h3>NAT: tunnel traffic ko exempt karo</h3>
<p>Agar HQ mein Internet access ke liye source-NAT rule hai (trust se untrust, public IP mein translate), to tunnel traffic use match <b>nahi</b> karna chahiye. Uske upar ek <b>no-NAT</b> rule banao: source zone trust, destination zone VPN, source 10.10.0.0/16, destination 10.20.0.0/16, koi translation nahi. NAT rules upar se neeche padhe jaate hain, isliye order matter karta hai. Yeh bhi yaad rakho ki policy original (pre-NAT) addresses aur route lookup ke baad tay hui zones se evaluate hoti hai.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># Remote LAN ka static route (HQ-FW)</span>
set network virtual-router default routing-table ip static-route TO-BRANCH destination 10.20.0.0/16 interface tunnel.11
<span class="c"># Security policy: trust se VPN</span>
set rulebase security rules HQ-TO-BRANCH from trust to VPN source 10.10.0.0/16 destination 10.20.0.0/16 application any service application-default action allow
<span class="c"># Security policy: VPN se trust (asli mein ise zaroori applications tak narrow karo)</span>
set rulebase security rules BRANCH-TO-HQ from VPN to trust source 10.20.0.0/16 destination 10.10.0.0/16 application any service application-default action allow
<span class="c"># Internet source NAT rule ke upar no-NAT rule</span>
set rulebase nat rules NO-NAT-VPN from trust to VPN source 10.10.0.0/16 destination 10.20.0.0/16 service any</pre>
<p>"application any" yahan sankshep ke liye hai. Production mein asli applications likho. Syntax <code>?</code> se verify karo.</p>

<div class="eg"><p><b>Worked example.</b> HQ ka Internet rule har trust source ko 198.51.100.1 mein translate karta hai. Branch ka user HQ server kholta hai aur packet 10.10.x.x ki jagah 198.51.100.1 se aata hai. Branch server ki policy use reject kar deti hai. Kaaran: no-NAT rule missing tha, isliye tunnel traffic par source NAT lag gaya. Internet rule ke upar no-NAT rule jodne se fix hua.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Yeh to apni hi site hai" sochkar trust aur VPN ke beech "any any" allow karna. Branches attack ke liye attractive steps hain. Sirf zaroori applications aur subnets allow karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Routing traffic ko tunnel interface par bhejti hai; zone policy tunnel zone ke liye evaluate hoti hai; no-NAT rule source NAT se pehle aana chahiye. IKE peer address tunnel ke bahar reachable hona chahiye.</p></div>

<div class="scn"><h4>Sab up, phir bhi ping nahi</h4><p>IKE aur IPsec SAs established the, lekin branch ko pings ka jawab nahi aa raha tha. Routing check mein dikha ki 10.20.0.0/16 Internet interface par resolve ho raha hai kyunki 10.20.1.0/24 ka ek leftover static route ISP ki taraf point kar raha tha. Use hatane se tunnel wala /16 jeet gaya.</p><p><b>Lesson:</b> VPN ko dosh dene se pehle check karo ki destination asal mein kaun sa route match karti hai.</p></div>

<div class="iv"><p class="q">"Tunnel up hai lekin traffic pass nahi ho raha. Kya check karoge?"</p><p>Pehle remote subnet ka route aur uska egress interface, phir dono directions mein security policy aur tunnel interface ka zone, phir NAT taaki tunnel traffic exempt ho, phir remote side ki mirror config, phir MTU aur traffic logs. Session details dekhkar bhi confirm karta hoon ki tunnel asal mein use ho raha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route-based: sirf tunnel interface ko route hua traffic encrypt hota hai.</li>
<li>Remote subnets hijack karne wale longer-prefix ya default routes se savdhan.</li>
<li>Tunnel traffic ki policy VPN zone use karti hai; firewall ko ike aur ipsec applications allow karo.</li>
<li>Internet source NAT ke upar no-NAT rule banao.</li>
<li>Tunnel ke upar least privilege lagao.</li>
</ul></div>
`}};export{e as default};