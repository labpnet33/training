var e={id:`policy-based-vpn`,h:{en:`Policy-based VPN: what is protected and what enters the tunnel`,hi:`Policy-based VPN: kya protected hai aur tunnel mein kya jaata hai`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how two Network Kings offices, Pune and Delhi/HQ, talk safely over the internet using a policy-based VPN; how a gateway, a site and a VPN profile fit together; why a tunnel can be up while no traffic flows; how remote users log in with a second factor; and how an engine with two internet links stays online when one ISP fails. The last chapters preview Secure SD-WAN, SASE and ZTNA as concepts. Four labs follow: site-to-site VPN, a VPN that is up with no traffic, outbound Multi-Link with failover, and remote access that needs MFA. Tagline: <b>click-ops, but you understand what each click does.</b></p>
<p><b>Prerequisites.</b> The earlier modules of this track: elements, policies with first-match rules, NAT after an Access rule, and Install Policy as the boundary. You also need the basic idea of encryption: a key scrambles data so that only the other side can read it.</p>
<div class="note"><p>This is independent training based on published documentation. It does not claim to cover any certification. The CONFIG console is an original generic console, not Forcepoint software. Where behaviour depends on the release, check the documentation for your NGFW version.</p></div>

<h3>Start with an analogy: the armoured van between two offices</h3>
<p>Network Kings has a Pune branch and a Delhi head office. Every day, staff send documents between them. Sending them by open post (the internet) is risky: anyone on the route can read them. So the company hires an armoured van that runs only between the two offices. Documents loaded into the van are locked. Nobody on the road can open it.</p>
<p>Two decisions matter. First, <b>which parcels go into the van?</b> Only parcels from Pune staff to Delhi servers. A parcel for a public website must stay on the normal post. Second, <b>how is the van locked?</b> Both offices must hold matching keys. A policy-based VPN is this van. The rule book, not a road map, decides who rides in it.</p>

<h3>What a VPN is</h3>
<p>A <b>VPN</b> (virtual private network) is an encrypted tunnel across an untrusted network. The usual standard is <b>IPsec</b>. Each end is a <b>gateway</b>, here an NGFW engine. The engine encrypts a packet, wraps it inside a new packet addressed to the other gateway, and sends it over the internet. The far engine unwraps and decrypts it.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Site-to-site VPN between Pune and HQ">
<rect x="10" y="60" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="13">Pune LAN</text><text x="75" y="108" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<rect x="170" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="220" y="100" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text>
<rect x="370" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="420" y="100" text-anchor="middle" class="svg-ink" font-size="13">NK-HQ-FW</text>
<rect x="500" y="60" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="565" y="88" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="565" y="108" text-anchor="middle" class="svg-muted" font-size="12">10.2.1.0/24</text>
<rect x="270" y="85" width="100" height="20" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="12">encrypted tunnel</text>
<line x1="140" y1="95" x2="170" y2="95" stroke="#64748b"/><line x1="470" y1="95" x2="500" y2="95" stroke="#64748b"/>
<text x="220" y="150" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text><text x="420" y="150" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.2</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Only Pune LAN to HQ LAN enters the tunnel</text>
</svg><p class="cap">The tunnel runs between the two engine addresses. The LAN addresses behind them are what the tunnel protects. The HQ LAN here is example addressing; use the addressing shown in your lab.</p></div>

<h3>Why "policy-based"</h3>
<p>In a routing-based design the tunnel is an interface and a route sends traffic into it. In the model used in this track the tunnel is not a route. Traffic enters it only when three things line up at the same time:</p>
<ol>
<li>An Access rule matches the connection and has the <b>VPN option</b> set to Apply or Enforce.</li>
<li>The source is inside the local <b>protected networks</b> and the destination is inside the remote protected networks.</li>
<li>No NAT has changed the source address before encapsulation.</li>
</ol>
<p>If any one is missing, the packet does not enter the tunnel. It either follows normal routing to the internet or is dropped.</p>

<h3>Apply or Enforce</h3>
<table class="cmp"><tr><th>VPN option</th><th>Meaning</th><th>Typical use</th></tr>
<tr><td><b>Apply VPN</b></td><td>If the connection fits a VPN (right protected networks), send it through the tunnel. If not, the rule still allows it as normal traffic.</td><td>A general rule where some traffic goes to HQ and the rest to the internet</td></tr>
<tr><td><b>Enforce VPN</b></td><td>The rule matches only traffic that uses a VPN. Traffic that does not fit is not allowed by this rule.</td><td>Sensitive traffic that must never leave unencrypted</td></tr>
</table>
<p>Exact wording of these options can differ between releases, so check the documentation for your NGFW version.</p>

<div class="eg"><p><b>Worked example.</b> STAFF-PC 10.1.1.10 opens a file server at 10.2.1.20 in Delhi. The Pune rule says source net-staff, destination the HQ network, service any, action Allow, VPN Apply. The source is in the Pune protected network and the destination in the HQ protected network, so the engine encrypts the packet to 198.51.100.2. A second connection from the same PC to a public site at 192.0.2.80 fits no VPN. With Apply it goes out in clear through the normal internet rule. With Enforce it would not match and would be discarded.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting Enforce on a general internet rule. All ordinary web traffic then fails to match, and users say "internet is down" right after the VPN change.</p></div>
<div class="exam"><p><b>Exam trap.</b> A VPN is not a route. Adding a static route toward the remote LAN does not put traffic in the tunnel. The rule's VPN option and the protected networks decide.</p></div>

<div class="scn"><h4>The branch that could not reach HQ files</h4><p>After a VPN change, Pune users reached the internet but not the HQ file server. The tunnel showed up. The engineer opened the Pune policy and found the HQ rule had VPN set to none, a leftover from testing. Traffic matched the rule, was allowed, and left in clear text toward a private address that the internet drops. Setting the rule to Apply and installing the policy fixed it.</p><p><b>Lesson:</b> a tunnel that is up does nothing until a rule sends traffic into it.</p></div>

<div class="iv"><p class="q">"What does policy-based VPN mean, and what decides whether a packet is encrypted?"</p><p>Strong answer: the tunnel is selected by policy, not by a route. A matching Access rule with a VPN option, plus source and destination inside the protected networks of the two sites, sends the packet into the tunnel. Mention that NAT must not change the source first, and give the difference between Apply and Enforce.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VPN is an encrypted tunnel between two gateways; here the gateways are engines.</li>
<li>Policy-based means rule plus protected networks decide what enters the tunnel.</li>
<li>Apply sends fitting traffic into the tunnel and allows the rest normally; Enforce allows only VPN traffic.</li>
<li>NAT that changes the source before encapsulation keeps traffic out of the tunnel.</li>
<li>Nothing takes effect on the engine until Install Policy.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Network Kings ke do offices, Pune aur Delhi/HQ, policy-based VPN se internet par safely kaise baat karte hain; gateway, site aur VPN profile kaise saath fit hote hain; tunnel up hone par bhi traffic kyun nahi chalta; remote users second factor ke saath login kaise karte hain; aur do internet links wala engine ek ISP fail hone par bhi online kaise rehta hai. Aakhri chapters mein Secure SD-WAN, SASE aur ZTNA ka concept preview hai. Chaar labs aayenge: site-to-site VPN, VPN up lekin traffic nahi, outbound Multi-Link failover ke saath, aur MFA wala remote access. Tagline: <b>click-ops, but you understand what each click does.</b></p>
<p><b>Prerequisites.</b> Is track ke pichhle modules: elements, first-match rules wali policies, Access rule ke baad NAT, aur Install Policy ek boundary ke roop mein. Encryption ka basic idea bhi chahiye: key data ko scramble karti hai taaki sirf doosri side padh sake.</p>
<div class="note"><p>Yeh independent training hai jo published documentation par based hai. Yeh kisi certification ko cover karne ka claim nahi karti. CONFIG console ek original generic console hai, Forcepoint software nahi. Jahan behaviour release par depend karta hai, wahan check the documentation for your NGFW version.</p></div>

<h3>Analogy se shuru karein: do offices ke beech armoured van</h3>
<p>Network Kings ka Pune branch aur Delhi head office hai. Roz staff dono ke beech documents bhejta hai. Unhe open post (internet) se bhejna risky hai: raaste mein koi bhi padh sakta hai. Isliye company ek armoured van hire karti hai jo sirf dono offices ke beech chalti hai. Van mein rakhe documents locked hote hain. Sadak par koi use khol nahi sakta.</p>
<p>Do faisle important hain. Pehla, <b>kaun se parcels van mein jaayenge?</b> Sirf Pune staff se Delhi servers ke parcels. Public website ka parcel normal post par hi rahega. Doosra, <b>van ka lock kaise lagta hai?</b> Dono offices ke paas matching keys honi chahiye. Policy-based VPN yahi van hai. Yahan road map nahi, rule book decide karti hai ki van mein kaun baithega.</p>

<h3>VPN kya hai</h3>
<p><b>VPN</b> (virtual private network) untrusted network ke upar ek encrypted tunnel hai. Aam standard <b>IPsec</b> hai. Har end ek <b>gateway</b> hota hai, yahan NGFW engine. Engine packet ko encrypt karta hai, use ek naye packet ke andar wrap karta hai jo doosre gateway ke address par jaata hai, aur internet par bhejta hai. Door wala engine unwrap aur decrypt karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Pune aur HQ ke beech site-to-site VPN">
<rect x="10" y="60" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="13">Pune LAN</text><text x="75" y="108" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<rect x="170" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="220" y="100" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text>
<rect x="370" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="420" y="100" text-anchor="middle" class="svg-ink" font-size="13">NK-HQ-FW</text>
<rect x="500" y="60" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="565" y="88" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="565" y="108" text-anchor="middle" class="svg-muted" font-size="12">10.2.1.0/24</text>
<rect x="270" y="85" width="100" height="20" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="12">encrypted tunnel</text>
<line x1="140" y1="95" x2="170" y2="95" stroke="#64748b"/><line x1="470" y1="95" x2="500" y2="95" stroke="#64748b"/>
<text x="220" y="150" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text><text x="420" y="150" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.2</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Sirf Pune LAN se HQ LAN tunnel mein jaata hai</text>
</svg><p class="cap">Tunnel dono engine addresses ke beech chalta hai. Unke peeche ke LAN addresses wahi hain jinhe tunnel protect karta hai. Yahan HQ LAN example addressing hai; apni lab mein dikhayi gayi addressing use karo.</p></div>

<h3>"Policy-based" kyun</h3>
<p>Routing-based design mein tunnel ek interface hota hai aur route traffic ko usmein bhejta hai. Is track ke model mein tunnel route nahi hai. Traffic tabhi tunnel mein jaata hai jab teen cheezein ek saath match karein:</p>
<ol>
<li>Ek Access rule connection se match kare aur uska <b>VPN option</b> Apply ya Enforce ho.</li>
<li>Source local <b>protected networks</b> ke andar ho aur destination remote protected networks ke andar ho.</li>
<li>Encapsulation se pehle kisi NAT ne source address badla na ho.</li>
</ol>
<p>Agar koi ek bhi missing hai, packet tunnel mein nahi jaata. Woh ya to normal routing se internet par jaata hai ya drop ho jaata hai.</p>

<h3>Apply ya Enforce</h3>
<table class="cmp"><tr><th>VPN option</th><th>Matlab</th><th>Typical use</th></tr>
<tr><td><b>Apply VPN</b></td><td>Agar connection kisi VPN se fit hota hai (sahi protected networks), to tunnel se bhejo. Nahi to rule use normal traffic ki tarah allow karta hai.</td><td>General rule jahan kuch traffic HQ jaata hai aur baaki internet</td></tr>
<tr><td><b>Enforce VPN</b></td><td>Rule sirf us traffic se match karta hai jo VPN use karta hai. Jo fit nahi hota use yeh rule allow nahi karta.</td><td>Sensitive traffic jo kabhi unencrypted bahar na jaaye</td></tr>
</table>
<p>In options ki exact wording releases mein alag ho sakti hai, isliye check the documentation for your NGFW version.</p>

<div class="eg"><p><b>Worked example.</b> STAFF-PC 10.1.1.10 Delhi ke file server 10.2.1.20 ko kholta hai. Pune rule kehta hai source net-staff, destination HQ network, service any, action Allow, VPN Apply. Source Pune protected network mein hai aur destination HQ protected network mein, isliye engine packet ko encrypt karke 198.51.100.2 ko bhejta hai. Usi PC se public site 192.0.2.80 ka doosra connection kisi VPN se fit nahi hota. Apply mein woh normal internet rule se clear mein jaata hai. Enforce hota to match nahi hota aur discard ho jaata.</p></div>

<div class="warn"><p><b>Common mistake.</b> General internet rule par Enforce laga dena. Tab saari normal web traffic match nahi hoti, aur VPN change ke turant baad users bolte hain "internet band hai".</p></div>
<div class="exam"><p><b>Exam trap.</b> VPN route nahi hai. Remote LAN ki taraf static route add karne se traffic tunnel mein nahi jaata. Rule ka VPN option aur protected networks decide karte hain.</p></div>

<div class="scn"><h4>Branch jo HQ files tak nahi pahunch paaya</h4><p>VPN change ke baad Pune users internet tak pahunche lekin HQ file server tak nahi. Tunnel up dikh raha tha. Engineer ne Pune policy kholi to HQ rule ka VPN none tha, testing ka bacha hua setting. Traffic rule se match hua, allow hua, aur clear text mein private address ki taraf gaya jise internet drop kar deta hai. Rule ko Apply karke policy install karne se theek ho gaya.</p><p><b>Lesson:</b> tunnel up hone se kuch nahi hota jab tak koi rule traffic ko usmein na bheje.</p></div>

<div class="iv"><p class="q">"Policy-based VPN ka matlab kya hai, aur packet encrypt hoga ya nahi yeh kaun decide karta hai?"</p><p>Strong answer: tunnel policy se select hota hai, route se nahi. VPN option wala matching Access rule, aur dono sites ke protected networks ke andar source aur destination, packet ko tunnel mein bhejte hain. Batao ki NAT pehle source nahi badalna chahiye, aur Apply aur Enforce ka fark do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN do gateways ke beech encrypted tunnel hai; yahan gateways engines hain.</li>
<li>Policy-based ka matlab rule aur protected networks decide karte hain ki tunnel mein kya jaaye.</li>
<li>Apply fitting traffic ko tunnel mein bhejta hai aur baaki ko normal allow karta hai; Enforce sirf VPN traffic allow karta hai.</li>
<li>Encapsulation se pehle source badalne wala NAT traffic ko tunnel se bahar rakhta hai.</li>
<li>Install Policy ke bina engine par kuch effect nahi hota.</li>
</ul></div>
`}};export{e as default};