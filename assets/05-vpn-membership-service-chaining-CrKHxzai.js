var e={id:`vpn-membership-service-chaining`,h:{en:`VPN membership policy and service chaining`,hi:`VPN membership policy aur service chaining`},body:{en:`
<p>Two more uses of the Controller policy engine: deciding <b>which VPNs a site is allowed to receive</b> (VPN membership) and <b>steering traffic through a network service</b> such as a firewall (service chaining).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Service chaining through a firewall at the hub">
<rect x="15" y="100" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="126" text-anchor="middle" class="svg-ink" font-size="13">E-HYD-1</text><text x="75" y="146" text-anchor="middle" class="svg-muted" font-size="12">site 400, VPN 10</text>
<rect x="255" y="100" width="130" height="60" rx="10" fill="#fde68a"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1 (hub)</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">hosts firewall</text>
<rect x="500" y="100" width="125" height="60" rx="10" fill="#bbf7d0"/><text x="562" y="126" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="562" y="146" text-anchor="middle" class="svg-muted" font-size="12">site 200, VPN 10</text>
<rect x="265" y="190" width="110" height="40" rx="8" fill="#fecaca"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text>
<path d="M135 130 L255 130 M385 130 L500 130" stroke="#64748b" stroke-width="2" fill="none"/><path d="M320 160 L320 190" stroke="#dc2626" stroke-width="3" fill="none"/>
<rect x="255" y="20" width="130" height="50" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">control policy: set service</text>
</svg><p class="cap">Branch-to-branch traffic is forced through the firewall behind the hub.</p></div>

<h3>VPN membership policy</h3>
<p>By default every site that has service VPN 10 receives the routes of VPN 10 from all other sites. A <b>VPN membership policy</b> restricts the VPNs a site's edge receives routes for. It is useful when a site such as a guest-Wi-Fi branch must only get VPN 20 and must not even learn the corporate VPN 10. It is applied to a site list and evaluated on the Controller, like control policy.</p>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Policies</b> &gt; <b>Centralized Policy</b> &gt; <b>Add Policy</b>.</li>
<li>At <b>Configure Topology and VPN Membership</b>, click the <b>Add Topology</b> menu and choose <b>VPN Membership</b>.</li>
<li>Enter a name, click <b>Add VPN Membership Policy</b> and choose a <b>site list</b>.</li>
<li>Choose the <b>VPN list</b> the sites are allowed to receive and click <b>Add</b>, then <b>Save</b>.</li>
</ol>
<p>In CLI the policy is a list of allowed VPNs per site list, and it is applied inside the site list in the apply-policy section. I describe it in words because the exact keyword layout differs by release: define a <b>vpn-membership</b> policy with one sequence per site list, permitting the VPN list, and reference it in <b>apply-policy</b> for the site list. No in or out direction is given. Verify in the lab before relying on the exact keywords.</p>

<h3>Service chaining</h3>
<p>A <b>service chain</b> forces traffic through a service (firewall, IDS, IDP or a network service) before it reaches its destination. Two pieces are needed:</p>
<ol>
<li>The edge that hosts the service <b>advertises it</b> to the Controller as a service route over OMP.</li>
<li>A <b>control policy</b> on the Controller changes the next hop of selected routes so that they point at the service.</li>
</ol>
<p>On the hub edge, the service is declared in the SD-WAN configuration:</p>
<pre class="code">sdwan
 service firewall vrf 10
  ipv4 address 10.1.10.50
 !
!</pre>
<p>On the Controller, a control policy sets the service for routes that come from the branches:</p>
<pre class="code">policy
 control-policy VIA-FW
  sequence 10
   match route
    site-id 200
    vpn-list CORP
   !
   action accept
    set
     service FW vpn 10
    !
   !
  !
  default-action accept
 !
!
apply-policy
 site-list SPOKES
  control-policy VIA-FW out
 !
!</pre>
<p>Check the names and the exact keywords for your release before pasting. The structure is what matters: a <code>match route</code>, an <code>accept</code>, <code>set service</code> with the service type and VPN, and an apply-policy on the site list that must receive the changed routes.</p>

<h3>How the traffic flows</h3>
<p>When the policy applies, a route that reached the Controller from Mumbai is re-advertised with its next hop replaced by the Delhi TLOC that hosts the firewall. Hyderabad sends traffic for Mumbai's LAN to Delhi first. The firewall inspects it in VPN 10, and the traffic is then forwarded on to Mumbai. Because the service hangs on the Delhi edge, the hub uses a service-side interface toward the firewall.</p>
<pre class="out">vsmart# show omp services
VPN   SERVICE   ORIGINATOR     FROM PEER   STATUS
10    FW        10.255.0.11    10.255.0.11 C,I,R</pre>
<p>If <code>show omp services</code> on the Controller does not list the service, the policy has nothing to point at. Check the edge configuration and the VPN first.</p>

<div class="warn"><p><b>Limits to know.</b> Control-policy service chaining with a locally hosted service chain is not supported. Service chaining and AppQoE on the same device are not supported together. Always read the release notes for your version.</p></div>
<div class="exam"><p><b>Exam trap.</b> The service is configured on the <b>edge</b> that hosts it; the redirection is a <b>control policy on the Controller</b>. VPN membership has no in or out direction; control policy does.</p></div>

<div class="scn"><h4>The firewall nobody could see</h4><p>The Delhi team installed the firewall and wrote the control policy, but branch traffic still went straight between branches. <code>show omp services</code> was empty. The firewall address had been configured under VPN 0 instead of the service VPN 10, so the edge never advertised the service. After moving it to VPN 10 the service route appeared, and the policy started working.</p></div>

<div class="iv"><p class="q">"Describe how you would put a firewall in the path between two branches."</p><p>Strong answer: declare the firewall as a service on the hub edge in the service VPN, confirm the Controller sees the service with show omp services, write a control policy that matches the branch routes and sets the service, and apply it to the site list that must receive those routes. Verify with a traceroute and the route's next hop on the receiving edge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN membership policy limits which VPNs a site receives; it is applied to a site list without direction.</li>
<li>Service chaining needs a service advertised by the edge and a control policy with set service.</li>
<li>Check show omp services first when a chain does not work.</li>
<li>Know the stated limits for locally hosted chains and AppQoE.</li>
</ul></div>
`,hi:`
<p>Controller policy engine ke do aur use: tay karna ki <b>site kaun se VPNs receive kar sakti hai</b> (VPN membership) aur <b>traffic ko network service se guzarna</b>, jaise firewall (service chaining).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Hub par firewall se service chaining">
<rect x="15" y="100" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="126" text-anchor="middle" class="svg-ink" font-size="13">E-HYD-1</text><text x="75" y="146" text-anchor="middle" class="svg-muted" font-size="12">site 400, VPN 10</text>
<rect x="255" y="100" width="130" height="60" rx="10" fill="#fde68a"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1 (hub)</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">firewall host karta hai</text>
<rect x="500" y="100" width="125" height="60" rx="10" fill="#bbf7d0"/><text x="562" y="126" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="562" y="146" text-anchor="middle" class="svg-muted" font-size="12">site 200, VPN 10</text>
<rect x="265" y="190" width="110" height="40" rx="8" fill="#fecaca"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text>
<path d="M135 130 L255 130 M385 130 L500 130" stroke="#64748b" stroke-width="2" fill="none"/><path d="M320 160 L320 190" stroke="#dc2626" stroke-width="3" fill="none"/>
<rect x="255" y="20" width="130" height="50" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">control policy: set service</text>
</svg><p class="cap">Branch-to-branch traffic hub ke peeche firewall se guzarne par majboor hoti hai.</p></div>

<h3>VPN membership policy</h3>
<p>Default mein jis site ke paas service VPN 10 hai woh baaki sab sites se VPN 10 ke routes receive karti hai. <b>VPN membership policy</b> us site ke edge ko kaun se VPNs ke routes milenge use limit karti hai. Yeh tab kaam aati hai jab guest-Wi-Fi branch ko sirf VPN 20 chahiye aur corporate VPN 10 seekhna hi nahi chahiye. Yeh site list par apply hoti hai aur Controller par evaluate hoti hai, control policy ki tarah.</p>
<ol>
<li><b>Configuration</b> &gt; <b>Policies</b> &gt; <b>Centralized Policy</b> &gt; <b>Add Policy</b> kholo.</li>
<li><b>Configure Topology and VPN Membership</b> par <b>Add Topology</b> menu click karo aur <b>VPN Membership</b> chuno.</li>
<li>Naam likho, <b>Add VPN Membership Policy</b> click karo aur <b>site list</b> chuno.</li>
<li>Woh <b>VPN list</b> chuno jo sites receive kar sakti hain aur <b>Add</b> click karo, phir <b>Save</b>.</li>
</ol>
<p>CLI mein policy har site list ke liye allowed VPNs ki list hai, aur woh apply-policy section mein site list ke andar apply hoti hai. Main ise shabdon mein bata raha hoon kyunki exact keyword layout release ke hisaab se alag hota hai: ek <b>vpn-membership</b> policy define karo jisme har site list ke liye ek sequence ho aur woh VPN list permit kare, aur use site list ke liye <b>apply-policy</b> mein reference karo. Koi in ya out direction nahi di jaati. Exact keywords par bharosa karne se pehle lab mein verify karo.</p>

<h3>Service chaining</h3>
<p><b>Service chain</b> traffic ko destination tak pahunchne se pehle service (firewall, IDS, IDP ya network service) se guzarne par majboor karti hai. Do hisse chahiye:</p>
<ol>
<li>Jo edge service host karta hai woh use Controller ko OMP par service route ke roop mein <b>advertise karta hai</b>.</li>
<li>Controller par ek <b>control policy</b> chuni hui routes ka next hop badalti hai taaki woh service ki taraf point karein.</li>
</ol>
<p>Hub edge par service SD-WAN configuration mein declare hoti hai:</p>
<pre class="code">sdwan
 service firewall vrf 10
  ipv4 address 10.1.10.50
 !
!</pre>
<p>Controller par control policy un routes ke liye service set karti hai jo branches se aate hain:</p>
<pre class="code">policy
 control-policy VIA-FW
  sequence 10
   match route
    site-id 200
    vpn-list CORP
   !
   action accept
    set
     service FW vpn 10
    !
   !
  !
  default-action accept
 !
!
apply-policy
 site-list SPOKES
  control-policy VIA-FW out
 !
!</pre>
<p>Paste karne se pehle apni release ke naam aur exact keywords check karo. Structure important hai: ek <code>match route</code>, ek <code>accept</code>, service type aur VPN ke saath <code>set service</code>, aur us site list par apply-policy jise badle hue routes milne chahiye.</p>

<h3>Traffic ka flow</h3>
<p>Policy lagne par Mumbai se Controller tak pahunchne wala route is tarah re-advertise hota hai ki uska next hop firewall host karne wale Delhi TLOC se badal jaata hai. Hyderabad Mumbai ke LAN ki traffic pehle Delhi bhejta hai. Firewall use VPN 10 mein inspect karta hai, aur phir traffic Mumbai ko forward hoti hai. Service Delhi edge par hai, isliye hub firewall ki taraf service-side interface use karta hai.</p>
<pre class="out">vsmart# show omp services
VPN   SERVICE   ORIGINATOR     FROM PEER   STATUS
10    FW        10.255.0.11    10.255.0.11 C,I,R</pre>
<p>Agar Controller par <code>show omp services</code> service list nahi karta to policy ke paas point karne ko kuch nahi hai. Pehle edge configuration aur VPN check karo.</p>

<div class="warn"><p><b>Limits jo pata honi chahiye.</b> Locally hosted service chain ke saath control-policy service chaining supported nahi hai. Same device par service chaining aur AppQoE saath supported nahi hain. Apni version ke release notes hamesha padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Service us <b>edge</b> par configure hoti hai jo use host karta hai; redirection <b>Controller par control policy</b> hai. VPN membership mein in ya out direction nahi hoti; control policy mein hoti hai.</p></div>

<div class="scn"><h4>Firewall jo kisi ko dikha nahi</h4><p>Delhi team ne firewall lagaya aur control policy likhi, lekin branch traffic phir bhi branches ke beech seedhi chalti rahi. <code>show omp services</code> khaali tha. Firewall address service VPN 10 ki jagah VPN 0 mein configure ho gaya tha, isliye edge ne service advertise hi nahi ki. VPN 10 mein move karne ke baad service route dikha aur policy kaam karne lagi.</p></div>

<div class="iv"><p class="q">"Do branches ke beech path mein firewall kaise lagaoge, batao."</p><p>Strong answer: firewall ko hub edge par service VPN mein service ke roop mein declare karo, show omp services se confirm karo ki Controller service dekh raha hai, ek control policy likho jo branch routes match kare aur service set kare, aur use us site list par apply karo jise woh routes milne chahiye. Traceroute aur receiving edge par route ke next hop se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN membership policy limit karti hai ki site ko kaun se VPNs milte hain; site list par bina direction apply hoti hai.</li>
<li>Service chaining ko edge se advertised service aur set service wali control policy chahiye.</li>
<li>Chain na chale to pehle show omp services check karo.</li>
<li>Locally hosted chains aur AppQoE ke stated limits yaad rakho.</li>
</ul></div>
`}};export{e as default};