var e={id:`zero-trust`,h:{en:`Zero trust: NIST SP 800-207 and the Cisco pillars`,hi:`Zero trust: NIST SP 800-207 aur Cisco pillars`},body:{en:`
<p>In an old office building, once the guard at the front door let you in, you could walk into any room. In a modern hospital, your badge opens the ward you work on, only during your shift, and the medicine cabinet also asks for a PIN and logs who opened it. Nobody assumes you are safe because you are already inside the building. That is <b>zero trust</b>: never trust because of network location, always verify, and give only the access needed right now.</p>

<h3>The core ideas</h3>
<ul>
<li><b>No implicit trust</b> from being on the corporate LAN or the VPN.</li>
<li><b>Verify explicitly</b>: identity, device health, location, time, behaviour and threat intelligence all feed the decision.</li>
<li><b>Least privilege</b>: access to one application or resource, not to a whole network.</li>
<li><b>Per-session and continuous</b>: the decision is taken for each session and re-evaluated when something changes.</li>
<li><b>Assume breach</b>: design as if an attacker is already inside; segment, monitor and limit the blast radius.</li>
</ul>

<h3>NIST SP 800-207: the logical architecture</h3>
<p>NIST Special Publication 800-207 defines zero trust architecture (ZTA). Its key components:</p>
<dl class="terms">
<dt>Policy Engine (PE)</dt><dd>Makes the grant or deny decision using policy and a <b>trust algorithm</b> fed by many data sources.</dd>
<dt>Policy Administrator (PA)</dt><dd>Acts on the PE's decision: tells the enforcement point to open or close the session, issues session tokens or credentials. PE and PA together form the <b>Policy Decision Point (PDP)</b>.</dd>
<dt>Policy Enforcement Point (PEP)</dt><dd>Sits in the data path and enables, monitors and terminates the connection between subject and resource: a ZTNA proxy, a switch with an SGT policy, a firewall, an application gateway.</dd>
<dt>Data sources</dt><dd>Identity management, device posture (CDM), threat intelligence, activity logs and SIEM, PKI, data access policies and compliance rules.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NIST 800-207 components">
<rect x="220" y="15" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">PDP: Policy Engine</text><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">+ Policy Administrator</text>
<rect x="470" y="15" width="160" height="60" rx="8" fill="#fde68a"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="12">Identity, posture,</text><text x="550" y="58" text-anchor="middle" class="svg-ink" font-size="12">threat intel, SIEM</text>
<line x1="470" y1="45" x2="420" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="150" width="160" height="60" rx="8" fill="#bae6fd"/><text x="90" y="175" text-anchor="middle" class="svg-ink" font-size="13">Subject</text><text x="90" y="194" text-anchor="middle" class="svg-muted" font-size="12">user + device</text>
<rect x="240" y="150" width="160" height="60" rx="8" fill="#fed7aa"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">PEP</text><text x="320" y="194" text-anchor="middle" class="svg-muted" font-size="12">ZTNA proxy, SGT</text>
<rect x="470" y="150" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="175" text-anchor="middle" class="svg-ink" font-size="13">Resource</text><text x="550" y="194" text-anchor="middle" class="svg-muted" font-size="12">finance ERP</text>
<line x1="170" y1="180" x2="240" y2="180" stroke="#64748b" stroke-width="3"/><line x1="400" y1="180" x2="470" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="320" y1="75" x2="320" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="330" y="118" class="svg-accent" font-size="12">control plane</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">data plane: only after the PDP says yes, only to this resource</text>
</svg><p class="cap">The PDP decides; the PEP enforces in the data path; the subject never gets a whole network.</p></div>

<h3>Deployment approaches in 800-207</h3>
<ul>
<li><b>Enhanced identity governance</b>: identity and its attributes drive policy (for example Duo and identity providers).</li>
<li><b>Micro-segmentation</b>: resources are grouped into small segments protected by gateways or host firewalls (Secure Workload, TrustSec).</li>
<li><b>Network infrastructure and software-defined perimeters</b>: an overlay or ZTNA broker hides applications until the user is authorised.</li>
</ul>

<h3>Cisco's three pillars</h3>
<table class="cmp"><tr><th>Pillar</th><th>Question</th><th>Cisco examples</th></tr>
<tr><td><b>Workforce</b></td><td>Is this the right user on a healthy device?</td><td>Duo MFA and device trust, Secure Access ZTNA, Secure Client</td></tr>
<tr><td><b>Workload</b></td><td>Which applications and services may talk to each other?</td><td>Secure Workload micro-segmentation, Multicloud Defense</td></tr>
<tr><td><b>Workplace</b></td><td>Which devices may join the network and what may they reach?</td><td>ISE with 802.1X and MAB, TrustSec security group tags (SGTs), posture</td></tr>
</table>
<p>The US CISA Zero Trust Maturity Model uses five pillars instead (identity, devices, networks, applications and workloads, data) with visibility, automation and governance across them. Different framing, same principles.</p>

<div class="eg"><p><b>Worked example: one request, three outcomes.</b> Priya from finance opens the ERP from a laptop.</p>
<pre class="out">[nk-sim] policy decision  app=finance-erp  user=priya@nwkings.example
identity   : MFA passed (FIDO2)
device     : managed, disk encrypted, OS current, EDR running
location   : India, usual
risk       : low
<span class="hl">decision   : ALLOW  (session 8h, ERP only, re-check on posture change)</span></pre>
<p>Next day she uses her personal tablet: identity passes, but the device is unmanaged, so policy allows <b>browser-only access without downloads</b>. Later, the EDR on her laptop reports malware: the posture changes, the PDP revokes the session and the PEP cuts it, without anyone touching a firewall rule.</p></div>

<h3>ZTNA versus traditional VPN</h3>
<p>A classic remote-access VPN authenticates once and places the user on the network, where they can often reach far more than they need. <b>ZTNA</b> (zero trust network access) connects the user to <b>one application</b> after each policy check, hides applications from the internet, and keeps checking during the session. Many organisations run both during migration.</p>

<div class="warn"><p><b>Common mistakes.</b> Buying one product and calling it "zero trust"; it is an architecture and a journey. Checking identity but not device posture. Doing a one-time check at login and never re-evaluating. Forgetting service-to-service traffic (the workload pillar).</p></div>

<div class="exam"><p><b>Exam traps.</b> In 800-207 the <b>PE decides</b>, the <b>PA executes the decision</b> (PE + PA = PDP), and the <b>PEP enforces</b>. Zero trust does not mean "no trust ever"; it means no <b>implicit</b> trust. Cisco pillars: workforce, workload, workplace.</p></div>

<div class="scn"><h4>The contractor on the flat network</h4><p>A contractor's laptop connected over VPN to fix one application server. Malware on the laptop scanned the whole 10.0.0.0/8 range through the tunnel and reached a file server. After the incident the company moved contractors to ZTNA with per-application policies, required device posture checks, and added TrustSec SGTs so contractor traffic inside the campus could reach only the servers named in the contract.</p><p><b>Lesson:</b> access should be to an application, for a reason, from a healthy device, not to a network.</p></div>

<div class="iv"><p class="q">"Explain zero trust to me as if I were a network architect."</p><p>Say it removes implicit trust based on network location. Every access is decided per session by a policy decision point using identity, device posture, context and threat intel, and enforced by a policy enforcement point in the data path, giving least-privilege access to a specific resource with continuous re-evaluation. Name the NIST 800-207 components and approaches, map them to Cisco's workforce, workload and workplace pillars with products, and mention ZTNA replacing broad VPN access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zero trust = no implicit trust by location, explicit verification, least privilege, per-session decisions, assume breach.</li>
<li>NIST 800-207: PE + PA = PDP decides; PEP enforces in the data path; many data sources feed a trust algorithm.</li>
<li>Approaches: enhanced identity governance, micro-segmentation, software-defined perimeter.</li>
<li>Cisco pillars: workforce (Duo, ZTNA), workload (Secure Workload), workplace (ISE, TrustSec).</li>
<li>ZTNA gives per-application access and continuous checks; a classic VPN gives network access.</li>
</ul></div>
`,hi:`
<p>Purani office building mein, ek baar front door ke guard ne andar aane diya to aap kisi bhi kamre mein ja sakte the. Modern hospital mein aapka badge sirf woh ward kholta hai jahan aap kaam karte ho, sirf aapki shift ke dauraan, aur medicine cabinet PIN bhi maangta hai aur log karta hai kisne khola. Koi yeh nahi maanta ki aap safe ho kyunki aap pehle se building ke andar ho. Yahi <b>zero trust</b> hai: network location ki wajah se kabhi trust nahi, hamesha verify, aur sirf utna access jitna abhi chahiye.</p>

<h3>Core ideas</h3>
<ul>
<li>Corporate LAN ya VPN par hone se <b>koi implicit trust nahi</b>.</li>
<li><b>Explicitly verify</b>: identity, device health, location, time, behaviour aur threat intelligence sab decision mein jaate hain.</li>
<li><b>Least privilege</b>: ek application ya resource ka access, poore network ka nahi.</li>
<li><b>Per-session aur continuous</b>: decision har session ke liye hota hai aur kuch badalne par dobara evaluate hota hai.</li>
<li><b>Assume breach</b>: aise design karo jaise attacker pehle se andar hai; segment karo, monitor karo aur blast radius limit karo.</li>
</ul>

<h3>NIST SP 800-207: logical architecture</h3>
<p>NIST Special Publication 800-207 zero trust architecture (ZTA) define karta hai. Iske key components:</p>
<dl class="terms">
<dt>Policy Engine (PE)</dt><dd>Policy aur bahut saare data sources se chalne wale <b>trust algorithm</b> se grant ya deny decision leta hai.</dd>
<dt>Policy Administrator (PA)</dt><dd>PE ke decision par action leta hai: enforcement point ko session kholne ya band karne ko kehta hai, session tokens ya credentials issue karta hai. PE aur PA milkar <b>Policy Decision Point (PDP)</b> banate hain.</dd>
<dt>Policy Enforcement Point (PEP)</dt><dd>Data path mein baithta hai aur subject aur resource ke beech connection enable, monitor aur terminate karta hai: ZTNA proxy, SGT policy wala switch, firewall, application gateway.</dd>
<dt>Data sources</dt><dd>Identity management, device posture (CDM), threat intelligence, activity logs aur SIEM, PKI, data access policies aur compliance rules.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NIST 800-207 components">
<rect x="220" y="15" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">PDP: Policy Engine</text><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">+ Policy Administrator</text>
<rect x="470" y="15" width="160" height="60" rx="8" fill="#fde68a"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="12">Identity, posture,</text><text x="550" y="58" text-anchor="middle" class="svg-ink" font-size="12">threat intel, SIEM</text>
<line x1="470" y1="45" x2="420" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="150" width="160" height="60" rx="8" fill="#bae6fd"/><text x="90" y="175" text-anchor="middle" class="svg-ink" font-size="13">Subject</text><text x="90" y="194" text-anchor="middle" class="svg-muted" font-size="12">user + device</text>
<rect x="240" y="150" width="160" height="60" rx="8" fill="#fed7aa"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">PEP</text><text x="320" y="194" text-anchor="middle" class="svg-muted" font-size="12">ZTNA proxy, SGT</text>
<rect x="470" y="150" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="175" text-anchor="middle" class="svg-ink" font-size="13">Resource</text><text x="550" y="194" text-anchor="middle" class="svg-muted" font-size="12">finance ERP</text>
<line x1="170" y1="180" x2="240" y2="180" stroke="#64748b" stroke-width="3"/><line x1="400" y1="180" x2="470" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="320" y1="75" x2="320" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="330" y="118" class="svg-accent" font-size="12">control plane</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">data plane: sirf PDP ke haan kehne ke baad, sirf is resource tak</text>
</svg><p class="cap">PDP decide karta hai; PEP data path mein enforce karta hai; subject ko kabhi poora network nahi milta.</p></div>

<h3>800-207 mein deployment approaches</h3>
<ul>
<li><b>Enhanced identity governance</b>: identity aur uske attributes policy chalate hain (jaise Duo aur identity providers).</li>
<li><b>Micro-segmentation</b>: resources chhote segments mein group hote hain jinhe gateways ya host firewalls protect karte hain (Secure Workload, TrustSec).</li>
<li><b>Network infrastructure aur software-defined perimeters</b>: overlay ya ZTNA broker applications ko tab tak chhupata hai jab tak user authorised na ho.</li>
</ul>

<h3>Cisco ke teen pillars</h3>
<table class="cmp"><tr><th>Pillar</th><th>Sawaal</th><th>Cisco examples</th></tr>
<tr><td><b>Workforce</b></td><td>Kya yeh sahi user healthy device par hai?</td><td>Duo MFA aur device trust, Secure Access ZTNA, Secure Client</td></tr>
<tr><td><b>Workload</b></td><td>Kaunse applications aur services aapas mein baat kar sakte hain?</td><td>Secure Workload micro-segmentation, Multicloud Defense</td></tr>
<tr><td><b>Workplace</b></td><td>Kaunse devices network join kar sakte hain aur kahan tak pahunch sakte hain?</td><td>802.1X aur MAB ke saath ISE, TrustSec security group tags (SGTs), posture</td></tr>
</table>
<p>US CISA Zero Trust Maturity Model iski jagah paanch pillars use karta hai (identity, devices, networks, applications aur workloads, data) jinke across visibility, automation aur governance hain. Framing alag, principles wahi.</p>

<div class="eg"><p><b>Worked example: ek request, teen nateeje.</b> Finance ki Priya laptop se ERP kholti hai.</p>
<pre class="out">[nk-sim] policy decision  app=finance-erp  user=priya@nwkings.example
identity   : MFA passed (FIDO2)
device     : managed, disk encrypted, OS current, EDR running
location   : India, usual
risk       : low
<span class="hl">decision   : ALLOW  (session 8h, ERP only, re-check on posture change)</span></pre>
<p>Agle din woh apna personal tablet use karti hai: identity pass hoti hai, par device unmanaged hai, isliye policy <b>bina downloads ke browser-only access</b> deti hai. Baad mein uske laptop ka EDR malware report karta hai: posture badalta hai, PDP session revoke karta hai aur PEP use kaat deta hai, bina kisi ke firewall rule chhue.</p></div>

<h3>ZTNA versus traditional VPN</h3>
<p>Classic remote-access VPN ek baar authenticate karke user ko network par rakh deta hai, jahan se woh aksar zaroorat se kahin zyada tak pahunch sakta hai. <b>ZTNA</b> (zero trust network access) har policy check ke baad user ko <b>ek application</b> se jodta hai, applications ko internet se chhupata hai, aur session ke dauraan check karta rehta hai. Kai organisations migration ke dauraan dono chalate hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Ek product khareed kar use "zero trust" kehna; yeh architecture aur ek safar hai. Identity check karna par device posture nahi. Login par ek baar check karke kabhi re-evaluate na karna. Service-to-service traffic bhoolna (workload pillar).</p></div>

<div class="exam"><p><b>Exam traps.</b> 800-207 mein <b>PE decide karta hai</b>, <b>PA decision execute karta hai</b> (PE + PA = PDP), aur <b>PEP enforce karta hai</b>. Zero trust ka matlab "kabhi trust nahi" nahi; matlab koi <b>implicit</b> trust nahi. Cisco pillars: workforce, workload, workplace.</p></div>

<div class="scn"><h4>Flat network par contractor</h4><p>Ek contractor ka laptop ek application server fix karne ke liye VPN se juda. Laptop ke malware ne tunnel se poori 10.0.0.0/8 range scan ki aur ek file server tak pahunch gaya. Incident ke baad company ne contractors ko per-application policies ke saath ZTNA par shift kiya, device posture checks zaroori kiye, aur TrustSec SGTs jode taaki campus ke andar contractor traffic sirf contract mein naam wale servers tak pahunch sake.</p><p><b>Seekh:</b> access ek application ka hona chahiye, ek wajah se, healthy device se, network ka nahi.</p></div>

<div class="iv"><p class="q">"Mujhe zero trust aise samjhao jaise main network architect hoon."</p><p>Kaho ki yeh network location par based implicit trust hata deta hai. Har access har session ke liye ek policy decision point decide karta hai identity, device posture, context aur threat intel se, aur data path mein policy enforcement point enforce karta hai, specific resource ka least-privilege access continuous re-evaluation ke saath deta hai. NIST 800-207 ke components aur approaches ke naam lo, unhe Cisco ke workforce, workload aur workplace pillars aur products se map karo, aur broad VPN access ki jagah ZTNA mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zero trust = location se koi implicit trust nahi, explicit verification, least privilege, per-session decisions, assume breach.</li>
<li>NIST 800-207: PE + PA = PDP decide karta hai; PEP data path mein enforce karta hai; bahut saare data sources trust algorithm ko feed karte hain.</li>
<li>Approaches: enhanced identity governance, micro-segmentation, software-defined perimeter.</li>
<li>Cisco pillars: workforce (Duo, ZTNA), workload (Secure Workload), workplace (ISE, TrustSec).</li>
<li>ZTNA per-application access aur continuous checks deta hai; classic VPN network access deta hai.</li>
</ul></div>
`}};export{e as default};