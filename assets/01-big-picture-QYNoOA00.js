var e={id:`big-picture`,h:{en:`Remote networks: the big picture`,hi:`Remote networks: big picture`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you can connect a branch office to Prisma Access with an IPsec tunnel, build the matching objects on the branch PAN-OS firewall, choose static routes or BGP, read the status pages, verify with the firewall CLI and fix a tunnel that is down. You also learn the bandwidth models and the resilience options (ECMP and secondary WAN).</p>
<p><b>Prerequisites:</b> the previous module (pa-start) where you met the tenant, the infrastructure subnet and Commit and Push. You should also know basic IPsec ideas (IKE phase 1, IPsec phase 2) from the PAN-OS IPsec module. We will only recap them.</p>

<h3>An analogy: a branch post office joining a national courier network</h3>
<p>Imagine a small branch post office. It used to send every parcel to a head office by a private truck. Now a national courier company runs sorting centres in every region. The branch only needs one sealed, locked van to the nearest sorting centre. From there the courier inspects every parcel, applies company rules and delivers it. In Prisma Access, the branch is a <b>remote network</b>, the locked van is an <b>IPsec tunnel</b>, and the sorting centre is a <b>Prisma Access location</b> with a security stack in the cloud.</p>

<h3>Key vocabulary</h3>
<dl class="terms">
<dt>Remote network</dt><dd>A branch or office site connected to Prisma Access by an IPsec tunnel. Routing toward the site is static, BGP or both. The docs state that all remote network locations are fully meshed.</dd>
<dt>CPE</dt><dd>Customer premises equipment, the device at the branch that ends the tunnel. In our lab it is a PAN-OS firewall called BR-FW, but it can be another vendor.</dd>
<dt>Prisma Access location</dt><dd>The cloud region where the site attaches, for example India West.</dd>
<dt>Compute location</dt><dd>A group of at least two nearby locations. Bandwidth is allocated per compute location.</dd>
<dt>IPSec Termination Node</dt><dd>The cloud-side gateway that ends your tunnel. Each node has a Service Endpoint Address that your branch uses as the peer IP.</dd>
<dt>Strata Cloud Manager (SCM) and Panorama</dt><dd>The two ways to manage Prisma Access. Both can onboard remote networks.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Branch to Prisma Access">
<rect x="20" y="70" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="95" y="98" text-anchor="middle" class="svg-ink" font-size="14">Branch</text><text x="95" y="120" text-anchor="middle" class="svg-muted" font-size="12">BR-FW 10.20.0.1/24</text><text x="95" y="138" text-anchor="middle" class="svg-muted" font-size="12">PC-BR 10.20.0.100</text>
<rect x="260" y="40" width="130" height="140" rx="10" fill="#e2e8f0"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="14">Internet</text><text x="325" y="118" text-anchor="middle" class="svg-muted" font-size="12">underlay</text>
<rect x="470" y="60" width="150" height="100" rx="10" fill="#bae6fd"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="545" y="112" text-anchor="middle" class="svg-muted" font-size="12">termination node</text><text x="545" y="132" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.101</text>
<line x1="170" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">IPsec tunnel (IKEv2, AES-256-GCM)</text>
</svg><p class="cap">The branch sends traffic through one IPsec tunnel to the termination node in the cloud.</p></div>

<h3>Why a remote network?</h3>
<p>Old branch designs backhauled all traffic to HQ, which wasted bandwidth and added delay. With a remote network the branch goes to the nearest Prisma Access location. Policy is the same one that protects mobile users, so there is one rulebook for roaming users and sites. Because remote networks are meshed, a branch can also reach other branches, and, through a service connection, HQ and mobile users (covered in pa-service).</p>

<h3>The four moving parts</h3>
<ol>
<li><b>Cloud side:</b> a remote network object with a location, termination node, tunnel settings and routing.</li>
<li><b>Underlay:</b> the internet path between BR-FW (198.51.100.10) and the service endpoint (203.0.113.101).</li>
<li><b>Branch side:</b> IKE gateway, crypto profiles, tunnel interface, zone, virtual router and route.</li>
<li><b>Management:</b> a push (Push Config in SCM, Commit and Push in Panorama) that delivers the cloud-side config.</li>
</ol>

<div class="eg"><p><b>Worked example (lab plan).</b> The branch LAN is 10.20.0.0/24. BR-FW has WAN 198.51.100.10 and tunnel.1 10.254.1.2/32. The tenant remote-network endpoint is 203.0.113.101. The infrastructure subnet is 10.255.0.0/24 (BGP AS 65534). The mobile pool is 10.200.0.0/23. None of these overlap, and that is a rule you must keep.</p></div>

<div class="note"><p><b>Teaching model.</b> The real Prisma Access is a cloud service. In this course the console is a simplified teaching model, and the endpoints use documentation addresses. The branch PAN-OS commands are the real ones.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking the branch tunnel goes to the HQ firewall. It does not. A remote network ends in the cloud. HQ connects through a service connection, a separate object.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mobile users, remote networks and service connections are three different onboarding types. Remote networks are branches; service connections are HQ or data centre.</p></div>

<div class="scn"><h4>Branch moves off the old MPLS backhaul</h4><p>A retail branch sent all internet traffic across a slow link to HQ. The team created a remote network in the nearest location, built one tunnel from the branch firewall and moved the default route to it. Page load times dropped, and the branch now follows the same security rules as roaming staff.</p><p><b>Lesson:</b> a remote network replaces backhaul with a local cloud on-ramp and one common policy.</p></div>

<div class="iv"><p class="q">"What is a remote network in Prisma Access?"</p><p>A branch site connected by an IPsec tunnel to a Prisma Access termination node in a chosen location. Routing is static or BGP. Traffic from the site is inspected in the cloud with the same policy as mobile users, and remote networks are fully meshed with each other.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A remote network is a branch connected by IPsec to the cloud.</li>
<li>The CPE ends the tunnel at the branch; a termination node ends it in the cloud.</li>
<li>Bandwidth is planned per compute location.</li>
<li>Branch addresses must not overlap the infrastructure subnet or mobile pool.</li>
<li>HQ uses a service connection, not a remote network.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Is module ke end tak aap branch office ko IPsec tunnel se Prisma Access se connect kar paoge, branch PAN-OS firewall par matching objects bana paoge, static routes ya BGP choose kar paoge, status pages padh paoge, firewall CLI se verify kar paoge aur down tunnel fix kar paoge. Aap bandwidth models aur resilience options (ECMP aur secondary WAN) bhi seekhoge.</p>
<p><b>Prerequisites:</b> pichla module (pa-start) jahan aapne tenant, infrastructure subnet aur Commit and Push dekha. Basic IPsec ideas (IKE phase 1, IPsec phase 2) PAN-OS IPsec module se aane chahiye. Hum sirf recap karenge.</p>

<h3>Analogy: branch post office national courier network join karta hai</h3>
<p>Ek chhota branch post office socho. Pehle woh har parcel private truck se head office bhejta tha. Ab ek national courier company ke har region mein sorting centres hain. Branch ko bas nearest sorting centre tak ek sealed, locked van chahiye. Wahan se courier har parcel inspect karta hai, company rules lagata hai aur deliver karta hai. Prisma Access mein branch <b>remote network</b> hai, locked van <b>IPsec tunnel</b> hai, aur sorting centre ek <b>Prisma Access location</b> hai jisme cloud mein security stack hota hai.</p>

<h3>Key vocabulary</h3>
<dl class="terms">
<dt>Remote network</dt><dd>Branch ya office site jo IPsec tunnel se Prisma Access se connected hai. Site ki taraf routing static, BGP ya dono hoti hai. Docs ke hisaab se saare remote network locations fully meshed hain.</dd>
<dt>CPE</dt><dd>Customer premises equipment, branch ka device jo tunnel end karta hai. Hamari lab mein yeh PAN-OS firewall BR-FW hai, lekin dusre vendor ka bhi ho sakta hai.</dd>
<dt>Prisma Access location</dt><dd>Cloud region jahan site attach hota hai, jaise India West.</dd>
<dt>Compute location</dt><dd>Kam se kam do nearby locations ka group. Bandwidth compute location ke hisaab se allocate hoti hai.</dd>
<dt>IPSec Termination Node</dt><dd>Cloud-side gateway jo aapka tunnel end karta hai. Har node ka ek Service Endpoint Address hota hai jo branch peer IP ki tarah use karta hai.</dd>
<dt>Strata Cloud Manager (SCM) aur Panorama</dt><dd>Prisma Access manage karne ke do tareeke. Dono remote networks onboard kar sakte hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Branch to Prisma Access">
<rect x="20" y="70" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="95" y="98" text-anchor="middle" class="svg-ink" font-size="14">Branch</text><text x="95" y="120" text-anchor="middle" class="svg-muted" font-size="12">BR-FW 10.20.0.1/24</text><text x="95" y="138" text-anchor="middle" class="svg-muted" font-size="12">PC-BR 10.20.0.100</text>
<rect x="260" y="40" width="130" height="140" rx="10" fill="#e2e8f0"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="14">Internet</text><text x="325" y="118" text-anchor="middle" class="svg-muted" font-size="12">underlay</text>
<rect x="470" y="60" width="150" height="100" rx="10" fill="#bae6fd"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="545" y="112" text-anchor="middle" class="svg-muted" font-size="12">termination node</text><text x="545" y="132" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.101</text>
<line x1="170" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">IPsec tunnel (IKEv2, AES-256-GCM)</text>
</svg><p class="cap">Branch ek IPsec tunnel se cloud ke termination node tak traffic bhejta hai.</p></div>

<h3>Remote network kyun?</h3>
<p>Purane branch designs saara traffic HQ tak backhaul karte the, jisse bandwidth waste hoti thi aur delay badhta tha. Remote network ke saath branch nearest Prisma Access location par jaata hai. Policy wahi hai jo mobile users ko protect karti hai, to roaming users aur sites ke liye ek hi rulebook hai. Remote networks meshed hain, isliye branch dusre branches tak pahunch sakta hai, aur service connection ke through HQ aur mobile users tak bhi (pa-service mein).</p>

<h3>Chaar moving parts</h3>
<ol>
<li><b>Cloud side:</b> remote network object jisme location, termination node, tunnel settings aur routing hai.</li>
<li><b>Underlay:</b> BR-FW (198.51.100.10) aur service endpoint (203.0.113.101) ke beech internet path.</li>
<li><b>Branch side:</b> IKE gateway, crypto profiles, tunnel interface, zone, virtual router aur route.</li>
<li><b>Management:</b> push (SCM mein Push Config, Panorama mein Commit and Push) jo cloud-side config deliver karta hai.</li>
</ol>

<div class="eg"><p><b>Worked example (lab plan).</b> Branch LAN 10.20.0.0/24 hai. BR-FW ka WAN 198.51.100.10 aur tunnel.1 10.254.1.2/32 hai. Tenant ka remote-network endpoint 203.0.113.101 hai. Infrastructure subnet 10.255.0.0/24 (BGP AS 65534) hai. Mobile pool 10.200.0.0/23 hai. Inme se koi overlap nahi karta, aur yeh rule aapko hamesha follow karna hai.</p></div>

<div class="note"><p><b>Teaching model.</b> Asli Prisma Access ek cloud service hai. Is course mein console ek simplified teaching model hai, aur endpoints documentation addresses use karte hain. Branch PAN-OS commands asli hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki branch tunnel HQ firewall tak jaata hai. Aisa nahi hai. Remote network cloud mein end hota hai. HQ service connection se jodta hai, jo alag object hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mobile users, remote networks aur service connections teen alag onboarding types hain. Remote networks branches hain; service connections HQ ya data centre hain.</p></div>

<div class="scn"><h4>Branch purane MPLS backhaul se hatta</h4><p>Ek retail branch saara internet traffic slow link se HQ bhejta tha. Team ne nearest location mein remote network banaya, branch firewall se ek tunnel banaya aur default route usse point kar diya. Page load times kam ho gaye, aur branch ab roaming staff jaise hi security rules follow karta hai.</p><p><b>Lesson:</b> remote network backhaul ko local cloud on-ramp aur ek common policy se replace karta hai.</p></div>

<div class="iv"><p class="q">"Prisma Access mein remote network kya hota hai?"</p><p>Ek branch site jo IPsec tunnel se chosen location ke Prisma Access termination node se connected hai. Routing static ya BGP hoti hai. Site ka traffic cloud mein mobile users wali policy se inspect hota hai, aur remote networks aapas mein fully meshed hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote network IPsec se cloud se connected branch hai.</li>
<li>CPE branch par tunnel end karta hai; termination node cloud mein.</li>
<li>Bandwidth compute location ke hisaab se plan hoti hai.</li>
<li>Branch addresses infrastructure subnet ya mobile pool se overlap nahi hone chahiye.</li>
<li>HQ service connection use karta hai, remote network nahi.</li>
</ul></div>
`}};export{e as default};