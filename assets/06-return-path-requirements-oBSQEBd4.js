var e={id:`return-path-requirements`,h:{en:`Return-path requirements: what HQ must route back`,hi:`Return-path requirements: HQ ko kya route karna padta hai`},body:{en:`
<p>A letter needs a return address. If a parcel arrives at the warehouse with sender "10.200.0.15", the warehouse must know which door to use for the reply. If it does not, the parcel is delivered, the clerk shrugs, and the sender never hears back. In networking this is the most common service-connection failure: the request arrives, the reply is lost. This chapter lists exactly what HQ must know.</p>

<h3>The rule</h3>
<p>Every address that can originate traffic toward HQ through Prisma Access must have a route on the HQ side that points back into the service connection tunnel (through the Prisma Access tunnel peer). There are three groups, and a fourth when Source NAT is used.</p>
<table class="cmp"><tr><th>Source group</th><th>Lab prefix</th><th>Why HQ needs it</th></tr>
<tr><td>Mobile user pool</td><td>10.200.0.0/23</td><td>Replies to GlobalProtect users</td></tr>
<tr><td>Remote network (branch) subnets</td><td>10.20.0.0/24</td><td>Replies to branch hosts such as PC-BR</td></tr>
<tr><td>Infrastructure subnet</td><td>10.255.0.0/24</td><td>Traffic that Prisma Access itself generates, such as DNS proxy or authentication requests</td></tr>
<tr><td>Source NAT pool (only if used)</td><td>example 10.254.8.0/28</td><td>Replies to translated mobile-user traffic</td></tr>
</table>
<p>With BGP, HQ learns these prefixes from Prisma Access automatically (a summary for the pools when Summarize Mobile User Routes is on). With static routes, a person must add them.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Request and reply path">
<rect x="20" y="70" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP-HOME</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.200.0.15</text>
<rect x="250" y="70" width="140" height="80" rx="10" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">SC 203.0.113.102</text>
<rect x="480" y="70" width="140" height="80" rx="10" fill="#fde68a"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">HQ-FW</text><text x="550" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.50 behind</text>
<line x1="160" y1="95" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="130" x2="390" y2="130" stroke="#16a34a" stroke-width="2" stroke-dasharray="6 4"/><line x1="250" y1="130" x2="160" y2="130" stroke="#16a34a" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">reply needs a route: 10.200.0.0/23 via tunnel</text>
</svg><p class="cap">Solid line is the request. Dashed line is the reply, which needs the HQ return route.</p></div>

<h3>HQ-FW static return routes</h3>
<pre class="code"><span class="c"># HQ-FW, if you do not use BGP: return routes through tunnel.1 (course tunnel IPs)</span>
set network virtual-router default routing-table ip static-route PA-MOBILE destination 10.200.0.0/23 interface tunnel.1
set network virtual-router default routing-table ip static-route PA-BRANCH destination 10.20.0.0/24 interface tunnel.1
set network virtual-router default routing-table ip static-route PA-INFRA destination 10.255.0.0/24 interface tunnel.1
commit</pre>

<h3>Policy on HQ-FW</h3>
<p>Routing is only half the story. HQ-FW also needs a security rule from the tunnel zone (PRISMA) to the HQ LAN zone, allowing the traffic you intend (for example web-browsing and ssl to 10.10.0.50). If the HQ app server has a host firewall, allow the source ranges there as well.</p>

<h3>The lab flows</h3>
<ol>
<li><b>LAPTOP-HOME to 10.10.0.50:</b> client at 10.200.x.x, through the gateway, backbone, service connection, HQ-FW. Needs the HQ route to 10.200.0.0/23.</li>
<li><b>PC-BR to 10.10.0.50:</b> source 10.20.0.100. Needs the HQ route to 10.20.0.0/24. The remote network subnets are in the Prisma Access routing table and are advertised over the backbone and to service connections.</li>
<li><b>LAPTOP-HOME to PC-BR:</b> mobile user to branch through the hub, as the documentation describes. Both pool and branch subnets must be known to Prisma Access, and there must be no overlap with the infrastructure subnet.</li>
</ol>
<p>Note: the product documentation we rely on does not name a separate toggle that must be switched on before remote networks can reach service connections, and we do not teach one. If your console shows an extra access setting, follow that console's help.</p>

<div class="eg"><p><b>Worked example.</b> Laptop 10.200.0.15 pings 10.10.0.50. The request arrives on HQ-FW at tunnel.1, is allowed by the PRISMA to LAN rule, and reaches the server. The server replies to 10.200.0.15. HQ-FW looks for a route. With 10.200.0.0/23 via tunnel.1 present, the reply is encrypted and returns. Without that route, HQ-FW sends it to its default gateway on the internet, where it is dropped.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Adding a route for the mobile pool only and forgetting the branch subnets and the infrastructure subnet; routing the pool to the LAN side by mistake; forgetting the security rule from the tunnel zone; assuming the cloud routes themselves are enough.</p></div>
<div class="exam"><p><b>Exam trap.</b> The return path must cover the mobile pool, remote network subnets and the infrastructure subnet (or the NAT pool when Source NAT is on). A default route from HQ is not accepted by Prisma Access, and a default route at HQ will not carry replies into the tunnel.</p></div>

<div class="scn"><h4>The log says allowed, the user says broken</h4><p>A user could connect but the HQ app never loaded. The Prisma Access traffic log showed the session allowed. At HQ the firewall received the SYN and sent the reply to the internet gateway because it had no route to 10.200.0.0/23. Adding the route (or learning it by BGP) fixed it.</p><p><b>Lesson:</b> an allow in the cloud log proves nothing about the reply. Check the HQ routing table.</p></div>

<div class="iv"><p class="q">"What does HQ need so that mobile users and branches can reach it through a service connection?"</p><p>A tunnel and, critically, return routes via the tunnel to the mobile user pool, the remote network subnets and the infrastructure subnet (or to the NAT pool when Source NAT is enabled), by BGP or static, plus a security rule from the tunnel zone to the LAN zone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Requests arrive; replies need HQ routes back via the tunnel.</li>
<li>Three groups: mobile pool, branch subnets, infrastructure subnet; add the NAT pool when used.</li>
<li>BGP learns them; static routes need a person.</li>
<li>Security policy from tunnel zone to LAN zone is also required.</li>
<li>An allow in cloud logs does not prove the reply works.</li>
</ul></div>
`,hi:`
<p>Chitthi ko return address chahiye. Parcel warehouse par sender "10.200.0.15" ke saath aaye to warehouse ko pata hona chahiye ki reply ke liye kaun sa darwaza use karna hai. Pata na ho to parcel deliver ho jaata hai, clerk kandhe uchkata hai, aur sender ko kabhi jawab nahi milta. Networking mein service-connection ki sabse common failure yahi hai: request pahunchti hai, reply kho jaata hai. Yeh chapter exactly batata hai ki HQ ko kya pata hona chahiye.</p>

<h3>Rule</h3>
<p>Prisma Access ke through HQ ki taraf traffic originate karne wale har address ke liye HQ side par ek route hona chahiye jo service connection tunnel mein wapas point kare (Prisma Access tunnel peer ke through). Teen groups hain, aur Source NAT use ho to chautha.</p>
<table class="cmp"><tr><th>Source group</th><th>Lab prefix</th><th>HQ ko kyun chahiye</th></tr>
<tr><td>Mobile user pool</td><td>10.200.0.0/23</td><td>GlobalProtect users ko replies</td></tr>
<tr><td>Remote network (branch) subnets</td><td>10.20.0.0/24</td><td>Branch hosts jaise PC-BR ko replies</td></tr>
<tr><td>Infrastructure subnet</td><td>10.255.0.0/24</td><td>Woh traffic jo Prisma Access khud generate karta hai, jaise DNS proxy ya authentication requests</td></tr>
<tr><td>Source NAT pool (sirf use ho to)</td><td>example 10.254.8.0/28</td><td>Translated mobile-user traffic ko replies</td></tr>
</table>
<p>BGP ke saath HQ ye prefixes Prisma Access se automatically seekhta hai (Summarize Mobile User Routes on ho to pools ki summary). Static routes mein kisi insaan ko add karne padte hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Request and reply path">
<rect x="20" y="70" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP-HOME</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.200.0.15</text>
<rect x="250" y="70" width="140" height="80" rx="10" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">SC 203.0.113.102</text>
<rect x="480" y="70" width="140" height="80" rx="10" fill="#fde68a"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">HQ-FW</text><text x="550" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.50 peeche</text>
<line x1="160" y1="95" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="130" x2="390" y2="130" stroke="#16a34a" stroke-width="2" stroke-dasharray="6 4"/><line x1="250" y1="130" x2="160" y2="130" stroke="#16a34a" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">reply ko route chahiye: 10.200.0.0/23 via tunnel</text>
</svg><p class="cap">Solid line request hai. Dashed line reply hai, jise HQ return route chahiye.</p></div>

<h3>HQ-FW static return routes</h3>
<pre class="code"><span class="c"># HQ-FW, BGP use na ho to: tunnel.1 ke through return routes (course tunnel IPs)</span>
set network virtual-router default routing-table ip static-route PA-MOBILE destination 10.200.0.0/23 interface tunnel.1
set network virtual-router default routing-table ip static-route PA-BRANCH destination 10.20.0.0/24 interface tunnel.1
set network virtual-router default routing-table ip static-route PA-INFRA destination 10.255.0.0/24 interface tunnel.1
commit</pre>

<h3>HQ-FW par policy</h3>
<p>Routing sirf aadhi kahani hai. HQ-FW ko tunnel zone (PRISMA) se HQ LAN zone tak security rule bhi chahiye, jo aapka intended traffic allow kare (jaise 10.10.0.50 ko web-browsing aur ssl). HQ app server par host firewall ho to wahan bhi source ranges allow karo.</p>

<h3>Lab flows</h3>
<ol>
<li><b>LAPTOP-HOME se 10.10.0.50:</b> client 10.200.x.x, gateway, backbone, service connection, HQ-FW se. HQ ko 10.200.0.0/23 ka route chahiye.</li>
<li><b>PC-BR se 10.10.0.50:</b> source 10.20.0.100. HQ ko 10.20.0.0/24 ka route chahiye. Remote network subnets Prisma Access routing table mein hote hain aur backbone par aur service connections ko advertise hote hain.</li>
<li><b>LAPTOP-HOME se PC-BR:</b> mobile user se branch tak hub ke through, jaisa documentation batata hai. Pool aur branch subnets dono Prisma Access ko pata hon, aur infrastructure subnet se overlap na ho.</li>
</ol>
<p>Note: jis product documentation par hum rely karte hain woh aisa alag toggle naam se nahi batati jo remote networks ke service connections tak pahunchne se pehle on karna ho, aur hum aisa koi toggle nahi padhate. Aapke console mein extra access setting dikhe to us console ki help follow karo.</p>

<div class="eg"><p><b>Worked example.</b> Laptop 10.200.0.15 se 10.10.0.50 ko ping karta hai. Request HQ-FW par tunnel.1 par aati hai, PRISMA to LAN rule se allow hoti hai, aur server tak pahunchti hai. Server 10.200.0.15 ko reply karta hai. HQ-FW route dhoondhta hai. 10.200.0.0/23 via tunnel.1 maujood ho to reply encrypt hoke wapas jaata hai. Na ho to HQ-FW use internet gateway ko bhejta hai, jahan woh drop ho jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf mobile pool ka route add karna aur branch subnets aur infrastructure subnet bhoolna; pool ko galti se LAN side route karna; tunnel zone ka security rule bhoolna; yeh sochna ki cloud routes hi kaafi hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Return path mein mobile pool, remote network subnets aur infrastructure subnet (ya Source NAT on ho to NAT pool) cover hone chahiye. Prisma Access HQ se default route accept nahi karta, aur HQ ka default route replies ko tunnel mein nahi le jaayega.</p></div>

<div class="scn"><h4>Log kehta hai allowed, user kehta hai broken</h4><p>Ek user connect ho gaya par HQ app kabhi load nahi hui. Prisma Access traffic log mein session allowed tha. HQ par firewall ko SYN mila aur usne reply internet gateway ko bhej diya kyunki 10.200.0.0/23 ka route nahi tha. Route add karne (ya BGP se seekhne) se fix hua.</p><p><b>Lesson:</b> cloud log mein allow reply ke baare mein kuch prove nahi karta. HQ routing table check karo.</p></div>

<div class="iv"><p class="q">"Mobile users aur branches ko service connection se HQ tak pahunchne ke liye HQ ko kya chahiye?"</p><p>Tunnel, aur sabse zaroori, tunnel ke through return routes mobile user pool, remote network subnets aur infrastructure subnet ke liye (ya Source NAT enabled ho to NAT pool ke liye), BGP ya static se, aur tunnel zone se LAN zone tak security rule.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Requests pahunchti hain; replies ko tunnel ke through HQ routes chahiye.</li>
<li>Teen groups: mobile pool, branch subnets, infrastructure subnet; NAT use ho to NAT pool.</li>
<li>BGP seekhta hai; static routes ke liye insaan chahiye.</li>
<li>Tunnel zone se LAN zone tak security policy bhi zaroori hai.</li>
<li>Cloud logs ka allow reply kaam karne ka saboot nahi.</li>
</ul></div>
`}};export{e as default};