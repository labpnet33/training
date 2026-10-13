var e={id:`mpbgp-overlay`,h:{en:`MP-BGP in the overlay: how branches learn each other's LANs`,hi:`Overlay mein MP-BGP: branches ek doosre ke LANs kaise seekhte hain`},body:{en:`
<p>Think of a company telephone directory kept by head office. Each branch phones head office and says "my rooms are 10.1.2.0/24, I am site 102, reach me through these roads". Head office then hands every other branch the updated directory. Branches never need to phone each other to learn who lives where. In Versa the directory service is the <b>Controller</b> and the language is <b>MP-BGP</b>.</p>

<h3>Why BGP?</h3>
<p><b>BGP</b> (Border Gateway Protocol) is the routing protocol built to carry a very large number of prefixes with attributes and policy. <b>MP-BGP</b> (multiprotocol BGP) extends it to carry several kinds of information in <b>address families</b>, for example per-tenant VPN routes. Service providers have used MP-BGP for MPLS VPNs for years, and Versa reuses that design for its SD-WAN control plane. This is why the lab output shows BGP neighbors, not a proprietary protocol name.</p>
<div class="note"><p><b>Stay with Versa terms.</b> Other SD-WAN vendors use different names for their control protocol. In Versa material you will see MP-BGP with the Controller, not those other names. Do not carry terms across vendors in an exam.</p></div>

<h3>The sessions and who talks to whom</h3>
<p>Each branch (VOS) keeps one control session to the Controller. The session itself runs inside the secured path over a transport, so it needs the underlay to work first. The Controller acts like a <b>route reflector</b>: it receives routes from every site and reflects them to the others, so you do not need a full mesh of BGP sessions between branches. In the course model the branch to Controller session uses AS 64512 and is shown as <code>Established</code> when at least one tunnel is up and tenant, site-id and Controller address are consistent.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Controller as route reflector">
<rect x="250" y="95" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">Controller-1</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">route reflector role</text>
<rect x="20" y="20" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="95" y="43" text-anchor="middle" class="svg-ink" font-size="13">Delhi, site 101</text><text x="95" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<rect x="470" y="20" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="545" y="43" text-anchor="middle" class="svg-ink" font-size="13">Bengaluru, site 102</text><text x="545" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.1.2.0/24</text>
<rect x="245" y="195" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">Kolkata, site 103</text><text x="320" y="237" text-anchor="middle" class="svg-muted" font-size="12">10.1.3.0/24</text>
<line x1="170" y1="62" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><line x1="470" y1="62" x2="380" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="195" x2="320" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="150" y="110" text-anchor="middle" class="svg-accent" font-size="12">MP-BGP</text><text x="495" y="110" text-anchor="middle" class="svg-accent" font-size="12">MP-BGP</text>
</svg><p class="cap">Three control sessions replace a mesh of branch-to-branch sessions.</p></div>

<h3>What is exchanged</h3>
<p>Described conservatively, the information that matters to you is:</p>
<ul>
<li><b>LAN prefixes</b> of each tenant, for example 10.1.2.0/24, so every site learns where that LAN is. These are tenant (VRF) routes, carried per organization.</li>
<li><b>Site identity</b>: which site-id originated the route (101, 102, 103), so a tunnel can be chosen to that site.</li>
<li><b>Path or tunnel-endpoint information</b>: which transports (Internet, MPLS, LTE) and tunnel endpoints the originating site is reachable through. This plays the role that "location" attributes play in other designs. Exact attribute names and formats differ by release and are not needed for the labs.</li>
<li><b>Key and policy related information</b> used to build secure tunnels, in general terms.</li>
</ul>
<p>The Controller does <b>not</b> carry user traffic. Traffic goes site to site through tunnels. The Controller only distributes knowledge.</p>

<h3>Conditions for the session</h3>
<p>The course model states the conditions precisely, and they match real life:</p>
<ol>
<li>At least one tunnel is up: interface up with address, circuit not down, Controller has a WAN interface and transport domain for that transport, and the Controller address is reachable (underlay route!).</li>
<li>The branch organization matches the Controller organization (Acme).</li>
<li>The branch site-id is configured, and the Controller address under <code>sd-wan controllers</code> is the Controller's real address 198.51.100.20.</li>
</ol>
<pre class="out">admin@Branch2-cli&gt; show bgp neighbor brief
Neighbor         AS      State
198.51.100.20    64512   <span class="hl">Established</span>

admin@Controller-1-cli&gt; show bgp neighbor brief
Neighbor (site)    Site-ID  State
Branch1            101      Established
Branch2            102      Established
Branch3            103      Established</pre>
<p>The Controller view is the quickest health check of the whole fabric: three neighbors, three site-ids, three Established.</p>

<h3>From session to reachability</h3>
<p>A session being Established means the <b>directory service works</b>. It does not mean your prefix is in it. Each site must <b>originate</b> its LAN prefix, which in the course model means the LAN interface is configured and enabled. Next chapters show this in detail. Then the other sites <b>import</b> it, which requires the same organization.</p>

<div class="warn"><p><b>Common mistakes.</b> Treating Established as "LAN reachable"; expecting a tenant prefix to appear when the LAN interface is shut down; mixing the Controller address 198.51.100.20 with the Director address 198.51.100.10.</p></div>
<div class="exam"><p><b>Exam trap.</b> The Controller is the control plane; the Director is the management plane. Routes come from the Controller via MP-BGP; templates and device configuration come from the Director.</p></div>

<div class="scn"><h4>Established but silent</h4><p>A new site showed Established on the Controller but nobody could reach its servers. The LAN interface had been configured on the wrong port, so no prefix existed for the site. show orgs org Acme sd-wan sites on another branch listed the site with no LAN prefix. Configuring the correct LAN port made the prefix appear within seconds.</p><p><b>Lesson:</b> control session health and prefix presence are two different checks.</p></div>
<div class="iv"><p class="q">"What does the Controller do in Versa SD-WAN routing?"</p><p>It is the control plane: each branch peers with it using MP-BGP, and it reflects tenant LAN prefixes and site and path information to the other branches, so no branch-to-branch BGP mesh is needed. It does not forward user data, which flows over tunnels between branches.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Versa uses MP-BGP between branches and the Controller as its control protocol.</li>
<li>The Controller behaves like a route reflector, avoiding a full BGP mesh.</li>
<li>Exchanged: tenant LAN prefixes, site identity and path or tunnel information.</li>
<li>Session needs a working tunnel and consistent tenant, site-id and Controller address.</li>
<li>Established does not guarantee that a prefix exists.</li>
</ul></div>
`,hi:`
<p>Head office ki rakhi hui ek company telephone directory socho. Har branch head office ko phone karke kehti hai "mere rooms 10.1.2.0/24 hain, main site 102 hoon, in roads se mujhe reach karo". Head office phir har doosri branch ko updated directory de deta hai. Branches ko ek doosre ko phone karke yeh janne ki zaroorat nahi ki kaun kahan rehta hai. Versa mein directory service <b>Controller</b> hai aur bhasha <b>MP-BGP</b>.</p>

<h3>BGP kyun?</h3>
<p><b>BGP</b> (Border Gateway Protocol) woh routing protocol hai jo bahut zyada prefixes ko attributes aur policy ke saath carry karne ke liye bana hai. <b>MP-BGP</b> (multiprotocol BGP) ise <b>address families</b> mein kai tarah ki information carry karne ke liye extend karta hai, jaise per-tenant VPN routes. Service providers MPLS VPNs ke liye saalon se MP-BGP use karte hain, aur Versa wahi design apne SD-WAN control plane ke liye reuse karta hai. Isliye lab output mein BGP neighbors dikhte hain, koi proprietary protocol naam nahi.</p>
<div class="note"><p><b>Versa terms par raho.</b> Doosre SD-WAN vendors apne control protocol ke alag naam use karte hain. Versa material mein Controller ke saath MP-BGP milega, un naamon ke saath nahi. Exam mein vendors ke terms mat mix karo.</p></div>

<h3>Sessions aur kaun kisse baat karta hai</h3>
<p>Har branch (VOS) Controller se ek control session rakhta hai. Session khud ek transport par secured path ke andar chalta hai, isliye pehle underlay kaam karna chahiye. Controller <b>route reflector</b> jaisa kaam karta hai: har site se routes leta hai aur doosron ko reflect karta hai, isliye branches ke beech BGP sessions ke full mesh ki zaroorat nahi. Course model mein branch se Controller session AS 64512 use karta hai aur tab <code>Established</code> dikhta hai jab kam se kam ek tunnel up ho aur tenant, site-id aur Controller address consistent hon.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Controller as route reflector">
<rect x="250" y="95" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">Controller-1</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">route reflector role</text>
<rect x="20" y="20" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="95" y="43" text-anchor="middle" class="svg-ink" font-size="13">Delhi, site 101</text><text x="95" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<rect x="470" y="20" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="545" y="43" text-anchor="middle" class="svg-ink" font-size="13">Bengaluru, site 102</text><text x="545" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.1.2.0/24</text>
<rect x="245" y="195" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">Kolkata, site 103</text><text x="320" y="237" text-anchor="middle" class="svg-muted" font-size="12">10.1.3.0/24</text>
<line x1="170" y1="62" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><line x1="470" y1="62" x2="380" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="195" x2="320" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="150" y="110" text-anchor="middle" class="svg-accent" font-size="12">MP-BGP</text><text x="495" y="110" text-anchor="middle" class="svg-accent" font-size="12">MP-BGP</text>
</svg><p class="cap">Teen control sessions branch-to-branch sessions ke mesh ki jagah lete hain.</p></div>

<h3>Kya exchange hota hai</h3>
<p>Conservatively describe karein to jo information aapke liye matter karti hai:</p>
<ul>
<li>Har tenant ke <b>LAN prefixes</b>, jaise 10.1.2.0/24, taaki har site jaane ki woh LAN kahan hai. Yeh tenant (VRF) routes hain, organization ke hisaab se carry hote hain.</li>
<li><b>Site identity</b>: kaunsa site-id route originate karta hai (101, 102, 103), taaki us site ke liye tunnel chuna ja sake.</li>
<li><b>Path ya tunnel-endpoint information</b>: originate karne wali site kin transports (Internet, MPLS, LTE) aur tunnel endpoints se reachable hai. Doosre designs mein "location" attributes yahi role nibhate hain. Exact attribute names aur formats release ke hisaab se alag hain aur labs ke liye zaroori nahi.</li>
<li>Secure tunnels banane ke liye <b>key aur policy se judi information</b>, general terms mein.</li>
</ul>
<p>Controller user traffic carry <b>nahi</b> karta. Traffic site se site tunnels ke through jaata hai. Controller sirf knowledge distribute karta hai.</p>

<h3>Session ki conditions</h3>
<p>Course model conditions precisely batata hai, aur woh real life se match karti hain:</p>
<ol>
<li>Kam se kam ek tunnel up: interface up with address, circuit down nahi, Controller ke paas us transport ka WAN interface aur transport domain hai, aur Controller address reachable hai (underlay route!).</li>
<li>Branch organization Controller organization (Acme) se match karta hai.</li>
<li>Branch site-id configured hai, aur <code>sd-wan controllers</code> ke under Controller address Controller ka asli address 198.51.100.20 hai.</li>
</ol>
<pre class="out">admin@Branch2-cli&gt; show bgp neighbor brief
Neighbor         AS      State
198.51.100.20    64512   <span class="hl">Established</span>

admin@Controller-1-cli&gt; show bgp neighbor brief
Neighbor (site)    Site-ID  State
Branch1            101      Established
Branch2            102      Established
Branch3            103      Established</pre>
<p>Controller ka view poore fabric ka sabse tez health check hai: teen neighbors, teen site-ids, teen Established.</p>

<h3>Session se reachability tak</h3>
<p>Session Established hone ka matlab <b>directory service chal rahi hai</b>. Iska matlab yeh nahi ki aapka prefix usme hai. Har site ko apna LAN prefix <b>originate</b> karna padta hai, jiska course model mein matlab hai ki LAN interface configured aur enabled ho. Agle chapters yeh detail mein dikhate hain. Phir doosri sites use <b>import</b> karti hain, jiske liye same organization chahiye.</p>

<div class="warn"><p><b>Common galtiyan.</b> Established ko "LAN reachable" maan lena; LAN interface shut ho tab bhi tenant prefix aane ki ummeed rakhna; Controller address 198.51.100.20 ko Director address 198.51.100.10 se mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Controller control plane hai; Director management plane. Routes Controller se MP-BGP ke through aate hain; templates aur device configuration Director se.</p></div>

<div class="scn"><h4>Established par khamosh</h4><p>Ek naya site Controller par Established dikha par koi uske servers tak nahi pahunch paya. LAN interface galat port par configure ho gaya tha, isliye site ka koi prefix tha hi nahi. Doosre branch par show orgs org Acme sd-wan sites ne site ko bina LAN prefix ke list kiya. Sahi LAN port configure karne se prefix seconds mein aa gaya.</p><p><b>Seekh:</b> control session health aur prefix presence do alag checks hain.</p></div>
<div class="iv"><p class="q">"Versa SD-WAN routing mein Controller kya karta hai?"</p><p>Woh control plane hai: har branch usse MP-BGP se peer karta hai, aur woh tenant LAN prefixes aur site aur path information doosre branches ko reflect karta hai, isliye branch-to-branch BGP mesh nahi chahiye. Woh user data forward nahi karta, jo branches ke beech tunnels par chalta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Versa branches aur Controller ke beech control protocol ke roop mein MP-BGP use karta hai.</li>
<li>Controller route reflector jaisa behave karta hai, full BGP mesh ki zaroorat nahi.</li>
<li>Exchange hota hai: tenant LAN prefixes, site identity aur path ya tunnel information.</li>
<li>Session ko working tunnel aur consistent tenant, site-id aur Controller address chahiye.</li>
<li>Established ka matlab yeh nahi ki prefix maujood hai.</li>
</ul></div>
`}};export{e as default};