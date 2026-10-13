var e={id:`zero-trust-sase`,h:{en:`Zero trust architecture and SASE/SSE`,hi:`Zero trust architecture aur SASE/SSE`},body:{en:`
<p>An old castle trusts anyone inside its walls: once you cross the drawbridge, you can walk into every room. A modern hotel works differently. Your key card opens only your room and the gym, only during your stay, and the card is checked at every door you try. If you lose it, reception cancels it and it stops working everywhere at once. Traditional networks were castles. <b>Zero trust</b> is the hotel.</p>

<h3>Why the castle model broke</h3>
<p>The old "perimeter" model trusted anything on the internal network and put all security at the edge firewall. Today Harbourline's apps live in a VPC and in SaaS, staff work from home and from warehouses, and attackers who steal one password or infect one laptop inside the perimeter can move sideways to everything. The network location of a user no longer says anything about whether they should be trusted.</p>

<h3>Zero trust architecture (ZTA)</h3>
<p><b>Zero trust</b> means <b>never trust, always verify</b>: no user, device or network location is trusted by default, and every access request to every resource is checked. Network+ highlights three parts:</p>
<dl class="terms">
<dt>Policy-based authentication</dt><dd>Proving who (and what) is asking, using policies that look at more than a password: multifactor authentication, the <b>device</b> (managed, patched, disk encrypted, endpoint protection running), and the <b>context</b> (location, time, behaviour, risk score). Authentication is not a one-time event at login; it is re-evaluated continuously.</dd>
<dt>Authorization</dt><dd>Deciding what that verified identity may do with <b>this specific resource</b>, for this session only. The decision is made by a policy engine and enforced at a policy enforcement point in front of the application, not by the network the user sits on.</dd>
<dt>Least privilege access</dt><dd>Giving the minimum access needed, for the minimum time: access to one application rather than to a whole subnet, read-only unless write is needed, admin rights only just in time. Combined with <b>microsegmentation</b>, it limits how far an attacker can move.</dd>
</dl>
<p>The common reference model (NIST SP 800-207) names the parts: a <b>policy engine</b> makes the decision, a <b>policy administrator</b> sets up or tears down the session, and a <b>policy enforcement point (PEP)</b> sits in the data path and allows or blocks the connection.</p>

<h3>SASE and SSE</h3>
<p>Zero trust needs enforcement points close to users wherever they are. <b>Secure access service edge (SASE)</b>, pronounced "sassy", delivers <b>networking and security together as a cloud service</b> from provider points of presence (PoPs) around the world. It combines SD-WAN with a set of security services. <b>Security service edge (SSE)</b> is the security half of SASE on its own:</p>
<ul>
<li><b>ZTNA</b> (zero trust network access): per-application access to private apps, replacing the old full-tunnel remote access VPN.</li>
<li><b>SWG</b> (secure web gateway): filters web traffic, blocks malicious sites and downloads.</li>
<li><b>CASB</b> (cloud access security broker): visibility and control of SaaS use, such as blocking uploads of customer data to personal storage.</li>
<li><b>FWaaS</b> (firewall as a service): cloud-delivered firewall for branch and user traffic.</li>
</ul>
<p>In short: <b>SASE = SD-WAN + SSE</b>, delivered from the cloud.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SASE architecture">
<rect x="20" y="30" width="140" height="44" rx="8" fill="#fde68a"/><text x="90" y="57" text-anchor="middle" class="svg-ink" font-size="13">Remote staff</text>
<rect x="20" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="137" text-anchor="middle" class="svg-ink" font-size="13">Branch SD-WAN</text>
<rect x="20" y="190" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="217" text-anchor="middle" class="svg-ink" font-size="13">Warehouse</text>
<rect x="215" y="20" width="210" height="225" rx="10" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">SASE cloud PoP</text>
<rect x="235" y="58" width="170" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">ZTNA</text>
<rect x="235" y="94" width="170" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="12">SWG</text>
<rect x="235" y="130" width="170" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">CASB</text>
<rect x="235" y="166" width="170" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="12">FWaaS</text>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="12">SSE + SD-WAN = SASE</text>
<rect x="480" y="30" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="57" text-anchor="middle" class="svg-ink" font-size="13">VPC apps</text>
<rect x="480" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="137" text-anchor="middle" class="svg-ink" font-size="13">SaaS</text>
<rect x="480" y="190" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="217" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="160" y1="52" x2="215" y2="100" stroke="#64748b" stroke-width="2"/><line x1="160" y1="132" x2="215" y2="132" stroke="#64748b" stroke-width="2"/><line x1="160" y1="212" x2="215" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="425" y1="100" x2="480" y2="52" stroke="#64748b" stroke-width="2"/><line x1="425" y1="132" x2="480" y2="132" stroke="#64748b" stroke-width="2"/><line x1="425" y1="160" x2="480" y2="212" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">With SASE, every user and site connects to the nearest cloud PoP, where identity-aware security is applied before traffic reaches private apps, SaaS or the internet.</p></div>

<div class="eg"><p><b>Worked example: Harbourline's portal admin policy.</b></p>
<table class="cmp"><tr><th>Condition</th><th>Requirement</th></tr>
<tr><td>User</td><td>Member of group "portal-admins", MFA passed in the last 8 hours</td></tr>
<tr><td>Device</td><td>Company-managed laptop, OS patched, disk encrypted</td></tr>
<tr><td>Access granted</td><td>HTTPS to tracking-admin only (not SSH, not the subnet)</td></tr>
<tr><td>Session</td><td>Re-checked every 30 minutes; revoked if posture changes</td></tr>
</table></div>
<pre class="out">ZTNA broker access log
2026-09-29T09:14:22Z user=priya@harbourline.example device=HL-LT-0412 posture=compliant mfa=passed app=tracking-admin <span class="hl">action=allow</span>
2026-09-29T09:15:03Z user=priya@harbourline.example device=HOME-PC posture=unknown mfa=passed app=tracking-admin <span class="hl">action=deny reason=device-not-managed</span></pre>
<p>Same person, same correct password and MFA, two different answers: the second request came from an unmanaged home PC, so the policy denied it. That is policy-based authentication and authorization in practice.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking zero trust is a product you buy. It is an architecture built from identity, device management, segmentation and policy. Keeping the old VPN that gives remote users the whole 10.0.0.0/8 network "for convenience", which defeats least privilege. Checking identity only once at login.</p></div>

<div class="exam"><p><b>Exam trap.</b> ZTA keywords: never trust, always verify; policy-based authentication; authorization per resource; least privilege. SASE = networking (SD-WAN) plus security (SSE) from the cloud; SSE = the security services only (ZTNA, SWG, CASB, FWaaS). ZTNA replaces broad VPN access with per-app access.</p></div>

<div class="scn"><h4>One stolen password, one application</h4><p>A contractor's password was phished. With the old VPN, the attacker could have scanned the whole internal network. Harbourline had already moved remote access to ZTNA: the attacker's login came from an unknown device in an unusual country, so the policy engine demanded a new MFA challenge that the attacker could not pass. Even if it had succeeded, the contractor's policy allowed only one ticketing application.</p><p><b>Lesson:</b> zero trust assumes credentials will be stolen and limits what they are worth.</p></div>

<div class="iv"><p class="q">"Explain zero trust and how SASE helps implement it."</p><p>Strong answer: zero trust removes implicit trust based on network location. Every request is authenticated with policy (identity, MFA, device posture, context), authorised for one specific resource, and given least privilege, with continuous re-evaluation; the reference model has a policy engine, policy administrator and enforcement points. SASE delivers SD-WAN and the SSE security stack (ZTNA, SWG, CASB, FWaaS) from cloud PoPs, so the same policy is enforced close to users and branches wherever they are. Mention microsegmentation and the replacement of full-tunnel VPNs by ZTNA.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zero trust: never trust, always verify; network location grants nothing.</li>
<li>Policy-based authentication uses identity, MFA, device posture and context, checked continuously.</li>
<li>Authorization is per resource and per session; least privilege gives only what is needed.</li>
<li>SSE = ZTNA, SWG, CASB, FWaaS from the cloud; SASE = SSE + SD-WAN.</li>
<li>ZTNA gives access to one application, not the whole network like a traditional VPN.</li>
</ul></div>
`,hi:`
<p>Ek purana qila apni deewaron ke andar har kisi par bharosa karta hai: drawbridge paar karte hi aap har kamre mein jaa sakte ho. Modern hotel alag tarike se kaam karta hai. Aapka key card sirf aapka kamra aur gym kholta hai, sirf aapke stay ke dauraan, aur har darwaze par card check hota hai. Agar kho jaaye, reception use cancel kar deti hai aur woh har jagah ek saath kaam karna band kar deta hai. Traditional networks qile the. <b>Zero trust</b> hotel hai.</p>

<h3>Qila model kyun toot gaya</h3>
<p>Purana "perimeter" model internal network par har cheez par bharosa karta tha aur saari security edge firewall par rakhta tha. Aaj Harbourline ke apps VPC aur SaaS mein hain, staff ghar se aur warehouses se kaam karta hai, aur jo attacker ek password chura le ya perimeter ke andar ek laptop infect kar de, woh side mein har cheez tak jaa sakta hai. User ki network location ab kuch nahi batati ki us par bharosa karna chahiye ya nahi.</p>

<h3>Zero trust architecture (ZTA)</h3>
<p><b>Zero trust</b> ka matlab hai <b>kabhi trust mat karo, hamesha verify karo</b>: koi user, device ya network location default mein trusted nahi hai, aur har resource ki har access request check hoti hai. Network+ teen hisse highlight karta hai:</p>
<dl class="terms">
<dt>Policy-based authentication</dt><dd>Yeh prove karna ki kaun (aur kya) maang raha hai, aisi policies se jo password se zyada dekhti hain: multifactor authentication, <b>device</b> (managed, patched, disk encrypted, endpoint protection chal raha), aur <b>context</b> (location, time, behaviour, risk score). Authentication login par ek baar ki cheez nahi hai; yeh lagatar dobara evaluate hota hai.</dd>
<dt>Authorization</dt><dd>Decide karna ki woh verified identity <b>is specific resource</b> ke saath kya kar sakti hai, sirf is session ke liye. Decision ek policy engine leta hai aur application ke saamne ek policy enforcement point lagu karta hai, na ki woh network jis par user baitha hai.</dd>
<dt>Least privilege access</dt><dd>Kam se kam zaroori access, kam se kam time ke liye dena: poore subnet ki jagah ek application ka access, jab tak write na chahiye tab tak read-only, admin rights sirf just in time. <b>Microsegmentation</b> ke saath milkar, yeh limit karta hai ki attacker kitni door tak jaa sakta hai.</dd>
</dl>
<p>Common reference model (NIST SP 800-207) hisson ke naam deta hai: <b>policy engine</b> decision leta hai, <b>policy administrator</b> session set up ya khatam karta hai, aur <b>policy enforcement point (PEP)</b> data path mein baith kar connection allow ya block karta hai.</p>

<h3>SASE aur SSE</h3>
<p>Zero trust ko users jahan bhi hon unke kareeb enforcement points chahiye. <b>Secure access service edge (SASE)</b>, jise "sassy" bolte hain, <b>networking aur security ko ek saath cloud service ki tarah</b> duniya bhar ke provider points of presence (PoPs) se deliver karta hai. Yeh SD-WAN ko security services ke set ke saath jodta hai. <b>Security service edge (SSE)</b> akela SASE ka security wala hissa hai:</p>
<ul>
<li><b>ZTNA</b> (zero trust network access): private apps ka per-application access, purane full-tunnel remote access VPN ko replace karta hai.</li>
<li><b>SWG</b> (secure web gateway): web traffic filter karta hai, malicious sites aur downloads block karta hai.</li>
<li><b>CASB</b> (cloud access security broker): SaaS use ki visibility aur control, jaise customer data ko personal storage mein upload hone se rokna.</li>
<li><b>FWaaS</b> (firewall as a service): branch aur user traffic ke liye cloud se diya gaya firewall.</li>
</ul>
<p>Short mein: <b>SASE = SD-WAN + SSE</b>, cloud se deliver kiya hua.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SASE architecture">
<rect x="20" y="30" width="140" height="44" rx="8" fill="#fde68a"/><text x="90" y="57" text-anchor="middle" class="svg-ink" font-size="13">Remote staff</text>
<rect x="20" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="137" text-anchor="middle" class="svg-ink" font-size="13">Branch SD-WAN</text>
<rect x="20" y="190" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="217" text-anchor="middle" class="svg-ink" font-size="13">Warehouse</text>
<rect x="215" y="20" width="210" height="225" rx="10" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">SASE cloud PoP</text>
<rect x="235" y="58" width="170" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">ZTNA</text>
<rect x="235" y="94" width="170" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="12">SWG</text>
<rect x="235" y="130" width="170" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">CASB</text>
<rect x="235" y="166" width="170" height="30" rx="6" fill="#ffffff" stroke="#64748b"/><text x="320" y="186" text-anchor="middle" class="svg-ink" font-size="12">FWaaS</text>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="12">SSE + SD-WAN = SASE</text>
<rect x="480" y="30" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="57" text-anchor="middle" class="svg-ink" font-size="13">VPC apps</text>
<rect x="480" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="137" text-anchor="middle" class="svg-ink" font-size="13">SaaS</text>
<rect x="480" y="190" width="140" height="44" rx="8" fill="#bae6fd"/><text x="550" y="217" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="160" y1="52" x2="215" y2="100" stroke="#64748b" stroke-width="2"/><line x1="160" y1="132" x2="215" y2="132" stroke="#64748b" stroke-width="2"/><line x1="160" y1="212" x2="215" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="425" y1="100" x2="480" y2="52" stroke="#64748b" stroke-width="2"/><line x1="425" y1="132" x2="480" y2="132" stroke="#64748b" stroke-width="2"/><line x1="425" y1="160" x2="480" y2="212" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">SASE ke saath, har user aur site sabse paas ke cloud PoP se connect hota hai, jahan traffic private apps, SaaS ya internet tak pahunchne se pehle identity-aware security lagti hai.</p></div>

<div class="eg"><p><b>Worked example: Harbourline ki portal admin policy.</b></p>
<table class="cmp"><tr><th>Condition</th><th>Requirement</th></tr>
<tr><td>User</td><td>Group "portal-admins" ka member, pichhle 8 ghante mein MFA passed</td></tr>
<tr><td>Device</td><td>Company-managed laptop, OS patched, disk encrypted</td></tr>
<tr><td>Access granted</td><td>Sirf tracking-admin tak HTTPS (SSH nahi, subnet nahi)</td></tr>
<tr><td>Session</td><td>Har 30 minute mein dobara check; posture badle to revoke</td></tr>
</table></div>
<pre class="out">ZTNA broker access log
2026-09-29T09:14:22Z user=priya@harbourline.example device=HL-LT-0412 posture=compliant mfa=passed app=tracking-admin <span class="hl">action=allow</span>
2026-09-29T09:15:03Z user=priya@harbourline.example device=HOME-PC posture=unknown mfa=passed app=tracking-admin <span class="hl">action=deny reason=device-not-managed</span></pre>
<p>Same insaan, same sahi password aur MFA, do alag jawab: doosri request ek unmanaged home PC se aayi, isliye policy ne deny kar di. Practice mein yahi policy-based authentication aur authorization hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Yeh sochna ki zero trust ek product hai jo aap khareedte ho. Yeh identity, device management, segmentation aur policy se bana architecture hai. Purana VPN rakhna jo remote users ko "convenience ke liye" poora 10.0.0.0/8 network de deta hai, jo least privilege ko hi khatam kar deta hai. Identity sirf login par ek baar check karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> ZTA keywords: never trust, always verify; policy-based authentication; har resource ke liye authorization; least privilege. SASE = cloud se networking (SD-WAN) plus security (SSE); SSE = sirf security services (ZTNA, SWG, CASB, FWaaS). ZTNA broad VPN access ko per-app access se replace karta hai.</p></div>

<div class="scn"><h4>Ek chori hua password, ek application</h4><p>Ek contractor ka password phish ho gaya. Purane VPN ke saath, attacker poora internal network scan kar sakta tha. Harbourline pehle hi remote access ko ZTNA par le ja chuki thi: attacker ka login ek unknown device se, ek unusual country se aaya, isliye policy engine ne naya MFA challenge maanga jo attacker paas nahi kar saka. Agar ho bhi jaata, contractor ki policy sirf ek ticketing application allow karti thi.</p><p><b>Seekh:</b> zero trust maanta hai ki credentials chori honge aur unki keemat limit kar deta hai.</p></div>

<div class="iv"><p class="q">"Zero trust explain karo aur SASE use implement karne mein kaise madad karta hai."</p><p>Strong answer: zero trust network location par based implicit trust hata deta hai. Har request policy se authenticate hoti hai (identity, MFA, device posture, context), ek specific resource ke liye authorise hoti hai, aur least privilege milta hai, lagatar re-evaluation ke saath; reference model mein policy engine, policy administrator aur enforcement points hain. SASE SD-WAN aur SSE security stack (ZTNA, SWG, CASB, FWaaS) ko cloud PoPs se deliver karta hai, taaki same policy users aur branches ke kareeb lagu ho, woh jahan bhi hon. Microsegmentation aur full-tunnel VPNs ko ZTNA se replace karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zero trust: kabhi trust mat karo, hamesha verify karo; network location kuch nahi deti.</li>
<li>Policy-based authentication identity, MFA, device posture aur context use karta hai, lagatar check hota hai.</li>
<li>Authorization har resource aur har session ke liye hai; least privilege sirf zaroori cheez deta hai.</li>
<li>SSE = cloud se ZTNA, SWG, CASB, FWaaS; SASE = SSE + SD-WAN.</li>
<li>ZTNA ek application ka access deta hai, traditional VPN ki tarah poora network nahi.</li>
</ul></div>
`}};export{e as default};