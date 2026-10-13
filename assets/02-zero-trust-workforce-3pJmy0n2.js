var e={id:`zero-trust-workforce`,h:{en:`Zero trust for the workforce: identity, device and context on every access`,hi:`Workforce ke liye zero trust: har access par identity, device aur context`},body:{en:`
<p>In an old-style hotel you got a metal key at check-in and it opened your room for as long as you kept it, even after you checked out if you forgot to return it. A modern hotel card is different: the lift reads it before taking you to your floor, the gym door reads it again, the minibar is locked unless you paid for it, and the card simply stops working at noon on your check-out day. Nobody at the gym door assumes you are a guest because you are already inside the lobby. <b>Zero trust for the workforce</b> works the same way for employees, contractors and partners reaching company applications.</p>

<h3>From the theory you already know to the workforce</h3>
<p>In the modern threats module you learned the NIST SP 800-207 model: a <b>Policy Decision Point</b> (policy engine plus policy administrator) decides, a <b>Policy Enforcement Point</b> sits in the data path and enforces, and the decision uses many data sources. That model is product-neutral. In this chapter we apply it to one specific problem: <i>a person with a device wants to reach an application</i>. That problem is called <b>workforce</b> access, and in the Cisco portfolio Duo is the main tool for it.</p>

<p>Cisco describes zero trust in three areas. Know which product goes where, because exam questions test it:</p>
<table class="cmp"><tr><th>Area</th><th>The question it answers</th><th>Typical Cisco tools</th></tr>
<tr><td><b>Workforce</b></td><td>Should this user on this device reach this application?</td><td>Duo (MFA, device trust, SSO), Secure Access ZTNA</td></tr>
<tr><td><b>Workload</b></td><td>Should this application talk to that application or database?</td><td>Secure Workload micro-segmentation</td></tr>
<tr><td><b>Workplace</b></td><td>Should this device, including printers and IoT, get onto the network, and into which segment?</td><td>ISE, 802.1X, TrustSec, SD-Access</td></tr></table>

<h3>The trust lifecycle</h3>
<ol>
<li><b>Establish trust.</b> Verify the user (primary credentials plus a strong second factor) and verify the device (is it known, managed, patched, encrypted?).</li>
<li><b>Enforce trust-based access.</b> Give access to <b>one application</b>, not to a network, and only under the conditions the policy sets. A contractor on a personal laptop may reach the wiki but not the finance system.</li>
<li><b>Continuously verify.</b> Trust is not a one-time stamp. Each new session is evaluated again, sessions expire, and analytics such as Trust Monitor look for risky patterns over time.</li>
<li><b>Respond to change.</b> When the device falls out of compliance, the user's risk rises or an incident names the host, trust is reduced: deny, require a stronger factor, or isolate.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Workforce zero trust decision">
<rect x="10" y="30" width="150" height="60" rx="8" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">User</text><text x="85" y="74" text-anchor="middle" class="svg-muted" font-size="12">password + MFA</text>
<rect x="10" y="130" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="155" text-anchor="middle" class="svg-ink" font-size="13">Device</text><text x="85" y="174" text-anchor="middle" class="svg-muted" font-size="12">OS, encryption, managed</text>
<rect x="230" y="70" width="180" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Policy decision</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">identity + device</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">+ location + risk</text>
<line x1="160" y1="60" x2="230" y2="100" stroke="#64748b" stroke-width="2"/><line x1="160" y1="160" x2="230" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="20" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="555" y="47" text-anchor="middle" class="svg-ink" font-size="13">Allow</text>
<rect x="480" y="88" width="150" height="44" rx="8" fill="#fde68a"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">Step up MFA</text>
<rect x="480" y="156" width="150" height="44" rx="8" fill="#fed7aa"/><text x="555" y="183" text-anchor="middle" class="svg-ink" font-size="13">Deny / remediate</text>
<line x1="410" y1="95" x2="480" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="110" x2="480" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="125" x2="480" y2="178" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Evaluated per application, per session, every time</text>
</svg><p class="cap">Workforce zero trust: identity and device feed one policy decision with three possible outcomes.</p></div>

<h3>The signals a workforce policy can use</h3>
<dl class="terms">
<dt>Identity</dt><dd>Who the user is, from a directory such as Active Directory or a cloud identity provider, and which groups they belong to.</dd>
<dt>Authentication strength</dt><dd>Which second factor was used. A phishing-resistant passkey is stronger than a push, which is stronger than an SMS code.</dd>
<dt>Device health</dt><dd>Operating system version and patch level, disk encryption, host firewall, screen lock, and whether an endpoint security agent is running.</dd>
<dt>Device trust</dt><dd>Whether the device is a <b>managed</b> corporate device (a trusted endpoint) or a personal one.</dd>
<dt>Context</dt><dd>Country, source network, browser and plug-in versions, time, and how this login compares with the user's normal behaviour.</dd>
</dl>

<h3>How workforce users actually reach applications</h3>
<ul>
<li><b>Cloud (SaaS) applications</b> through single sign-on with SAML 2.0 or OIDC, where Duo SSO or another identity provider adds MFA and device checks.</li>
<li><b>Internal web applications and SSH</b> without a full VPN, through a ZTNA proxy such as Secure Access, or the Duo Network Gateway.</li>
<li><b>Remote access VPN</b> on ASA or Threat Defense, where Duo adds MFA through RADIUS, usually with the on-premises Duo Authentication Proxy.</li>
<li><b>Windows logon, RDP and Linux servers</b> with Duo's logon and Unix integrations.</li>
</ul>
<p>Every path ends at the same idea: one policy decision per user, device and application.</p>

<div class="eg"><p><b>Worked example.</b> A company defines three outcomes for its finance ERP. Priya, an employee on a managed, encrypted laptop running a current OS in India, gets a Verified Push and is allowed. Rahul, a contractor on his personal laptop, passes MFA but the device is not a trusted endpoint, so the ERP is denied while the wiki (a looser policy) is allowed. An attacker with Priya's stolen password logs in from an unknown device in a blocked country: denied before MFA is even offered, and the attempt appears in Trust Monitor. One user directory, three different results, all decided per application.</p></div>

<div class="warn"><p><b>Common mistake.</b> Calling a full-tunnel VPN that drops users onto a flat internal network "zero trust" because it has MFA. MFA verifies the user once; it does not limit what they can reach afterwards or check the device. Zero trust means least privilege per application and continuous checks.</p></div>

<div class="exam"><p><b>Exam trap.</b> Workforce equals Duo-style user and device trust; workload equals application-to-application segmentation; workplace equals network admission with ISE and SD-Access. Also remember the three verbs Cisco uses: <b>establish</b> trust, <b>enforce</b> trust-based access, <b>continuously verify</b> trust.</p></div>

<div class="scn"><h4>The contractor who could see everything</h4><p>A design agency gave contractors the same VPN profile as staff. One contractor's home PC was infected; once connected, the malware scanned the whole 10.0.0.0/8 range and encrypted two file servers. After recovery, the company moved contractors to application-level access: SSO with Duo for the three tools they needed, a device-health policy, and no network-level VPN. A later infected contractor laptop simply failed the health check and never reached anything.</p><p><b>Lesson:</b> give access to applications, not networks, and check the device every time.</p></div>

<div class="iv"><p class="q">"How would you implement zero trust for a remote workforce?"</p><p>Strong answer: start with strong identity (a central directory, SSO and phishing-resistant MFA such as Verified Push or passkeys), add device trust (health checks, managed-device detection), and enforce least privilege per application through SSO, ZTNA or application gateways instead of flat VPN access. Then continuously verify with session limits and anomaly detection such as Trust Monitor, and feed the logs into the SIEM. Name the Cisco mapping: Duo for workforce, Secure Workload for workload, ISE for workplace.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workforce zero trust asks one question per session: should this user on this device reach this application now?</li>
<li>Cisco splits zero trust into workforce (Duo), workload (Secure Workload) and workplace (ISE, SD-Access).</li>
<li>Trust is established, enforced per application, continuously verified, and reduced when something changes.</li>
<li>Signals: identity, authentication strength, device health, device trust and context.</li>
<li>MFA on a flat VPN is not zero trust; least privilege per application is the key difference.</li>
</ul></div>
`,hi:`
<p>Purane style ke hotel mein check-in par aapko ek metal key milti thi aur jab tak aapke paas rahe tab tak woh aapka room kholti thi, check-out ke baad bhi agar aap lautana bhool gaye. Modern hotel card alag hai: lift use padhkar hi aapko floor par le jaati hai, gym ka darwaza use phir padhta hai, minibar locked rehta hai jab tak aapne pay na kiya ho, aur check-out wale din dopahar ko card bas kaam karna band kar deta hai. Gym ke darwaze par koi yeh nahi maanta ki aap guest ho kyunki aap pehle se lobby mein ho. <b>Workforce ke liye zero trust</b> employees, contractors aur partners ke company applications tak pahunchne ke liye bilkul aise hi kaam karta hai.</p>

<h3>Jo theory aap jaante ho usse workforce tak</h3>
<p>Modern threats module mein aapne NIST SP 800-207 model seekha: ek <b>Policy Decision Point</b> (policy engine plus policy administrator) decide karta hai, ek <b>Policy Enforcement Point</b> data path mein baithkar enforce karta hai, aur decision kai data sources use karta hai. Woh model product-neutral hai. Is chapter mein hum use ek specific problem par lagate hain: <i>device ke saath ek insaan ek application tak pahunchna chahta hai</i>. Is problem ko <b>workforce</b> access kehte hain, aur Cisco portfolio mein iska main tool Duo hai.</p>

<p>Cisco zero trust ko teen areas mein describe karta hai. Kaunsa product kahan jaata hai yeh jaano, kyunki exam questions yeh test karte hain:</p>
<table class="cmp"><tr><th>Area</th><th>Kaunsa sawaal answer karta hai</th><th>Typical Cisco tools</th></tr>
<tr><td><b>Workforce</b></td><td>Kya is device par yeh user is application tak pahunche?</td><td>Duo (MFA, device trust, SSO), Secure Access ZTNA</td></tr>
<tr><td><b>Workload</b></td><td>Kya yeh application us application ya database se baat kare?</td><td>Secure Workload micro-segmentation</td></tr>
<tr><td><b>Workplace</b></td><td>Kya yeh device, printers aur IoT samet, network par aaye, aur kis segment mein?</td><td>ISE, 802.1X, TrustSec, SD-Access</td></tr></table>

<h3>Trust lifecycle</h3>
<ol>
<li><b>Trust establish karo.</b> User verify karo (primary credentials plus strong second factor) aur device verify karo (kya woh known, managed, patched, encrypted hai?).</li>
<li><b>Trust-based access enforce karo.</b> Access <b>ek application</b> ka do, network ka nahi, aur sirf un conditions mein jo policy set karti hai. Personal laptop wala contractor wiki tak pahunch sakta hai par finance system tak nahi.</li>
<li><b>Lagataar verify karo.</b> Trust ek baar ka stamp nahi hai. Har naya session phir se evaluate hota hai, sessions expire hote hain, aur Trust Monitor jaise analytics samay ke saath risky patterns dhoondhte hain.</li>
<li><b>Badlaav par respond karo.</b> Jab device compliance se bahar ho jaaye, user ka risk badhe ya koi incident host ka naam le, to trust kam hota hai: deny, stronger factor maango, ya isolate karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Workforce zero trust decision">
<rect x="10" y="30" width="150" height="60" rx="8" fill="#bae6fd"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">User</text><text x="85" y="74" text-anchor="middle" class="svg-muted" font-size="12">password + MFA</text>
<rect x="10" y="130" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="155" text-anchor="middle" class="svg-ink" font-size="13">Device</text><text x="85" y="174" text-anchor="middle" class="svg-muted" font-size="12">OS, encryption, managed</text>
<rect x="230" y="70" width="180" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Policy decision</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">identity + device</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">+ location + risk</text>
<line x1="160" y1="60" x2="230" y2="100" stroke="#64748b" stroke-width="2"/><line x1="160" y1="160" x2="230" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="20" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="555" y="47" text-anchor="middle" class="svg-ink" font-size="13">Allow</text>
<rect x="480" y="88" width="150" height="44" rx="8" fill="#fde68a"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">Step up MFA</text>
<rect x="480" y="156" width="150" height="44" rx="8" fill="#fed7aa"/><text x="555" y="183" text-anchor="middle" class="svg-ink" font-size="13">Deny / remediate</text>
<line x1="410" y1="95" x2="480" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="110" x2="480" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="125" x2="480" y2="178" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Har application, har session, har baar evaluate</text>
</svg><p class="cap">Workforce zero trust: identity aur device ek policy decision ko feed karte hain jiske teen possible outcomes hain.</p></div>

<h3>Workforce policy kaunse signals use kar sakti hai</h3>
<dl class="terms">
<dt>Identity</dt><dd>User kaun hai, Active Directory ya cloud identity provider jaise directory se, aur woh kin groups mein hai.</dd>
<dt>Authentication strength</dt><dd>Kaunsa second factor use hua. Phishing-resistant passkey push se strong hai, aur push SMS code se strong hai.</dd>
<dt>Device health</dt><dd>Operating system version aur patch level, disk encryption, host firewall, screen lock, aur kya endpoint security agent chal raha hai.</dd>
<dt>Device trust</dt><dd>Kya device <b>managed</b> corporate device (trusted endpoint) hai ya personal.</dd>
<dt>Context</dt><dd>Country, source network, browser aur plug-in versions, samay, aur yeh login user ke normal behaviour se kaise compare hota hai.</dd>
</dl>

<h3>Workforce users asal mein applications tak kaise pahunchte hain</h3>
<ul>
<li><b>Cloud (SaaS) applications</b> SAML 2.0 ya OIDC ke saath single sign-on se, jahan Duo SSO ya koi aur identity provider MFA aur device checks jodta hai.</li>
<li><b>Internal web applications aur SSH</b> bina full VPN ke, Secure Access jaise ZTNA proxy se, ya Duo Network Gateway se.</li>
<li>ASA ya Threat Defense par <b>remote access VPN</b>, jahan Duo RADIUS ke through MFA jodta hai, aam taur par on-premises Duo Authentication Proxy ke saath.</li>
<li><b>Windows logon, RDP aur Linux servers</b> Duo ke logon aur Unix integrations ke saath.</li>
</ul>
<p>Har path ek hi idea par khatam hota hai: har user, device aur application ke liye ek policy decision.</p>

<div class="eg"><p><b>Worked example.</b> Ek company apne finance ERP ke liye teen outcomes define karti hai. Priya, employee, managed encrypted laptop par current OS ke saath India mein, use Verified Push milta hai aur allow hoti hai. Rahul, contractor, apne personal laptop par MFA paas karta hai par device trusted endpoint nahi hai, isliye ERP deny hota hai jabki wiki (looser policy) allow hoti hai. Priya ke chori hue password wala attacker unknown device se blocked country se login karta hai: MFA offer hone se pehle hi deny, aur attempt Trust Monitor mein dikhta hai. Ek user directory, teen alag results, sab per application decide hue.</p></div>

<div class="warn"><p><b>Common galti.</b> Full-tunnel VPN jo users ko flat internal network par chhod deta hai, use sirf MFA hone ki wajah se "zero trust" kehna. MFA user ko ek baar verify karta hai; yeh limit nahi karta ki baad mein woh kya reach kar sakte hain, na device check karta hai. Zero trust ka matlab hai per application least privilege aur continuous checks.</p></div>

<div class="exam"><p><b>Exam trap.</b> Workforce matlab Duo-style user aur device trust; workload matlab application-to-application segmentation; workplace matlab ISE aur SD-Access ke saath network admission. Cisco ke teen verbs bhi yaad rakho: trust <b>establish</b> karo, trust-based access <b>enforce</b> karo, trust ko <b>continuously verify</b> karo.</p></div>

<div class="scn"><h4>Contractor jo sab kuch dekh sakta tha</h4><p>Ek design agency ne contractors ko staff wala hi VPN profile de diya. Ek contractor ka ghar ka PC infected tha; connect hote hi malware ne poori 10.0.0.0/8 range scan ki aur do file servers encrypt kar diye. Recovery ke baad company ne contractors ko application-level access par shift kiya: jin teen tools ki zaroorat thi unke liye Duo ke saath SSO, device-health policy, aur koi network-level VPN nahi. Baad mein ek aur infected contractor laptop bas health check mein fail hua aur kahin nahi pahuncha.</p><p><b>Seekh:</b> access applications ka do, networks ka nahi, aur device har baar check karo.</p></div>

<div class="iv"><p class="q">"Remote workforce ke liye zero trust aap kaise implement karoge?"</p><p>Strong answer: strong identity se shuru karo (central directory, SSO aur Verified Push ya passkeys jaisa phishing-resistant MFA), device trust jodo (health checks, managed-device detection), aur flat VPN access ki jagah SSO, ZTNA ya application gateways se per application least privilege enforce karo. Phir session limits aur Trust Monitor jaise anomaly detection se continuously verify karo, aur logs SIEM mein feed karo. Cisco mapping ka naam lo: workforce ke liye Duo, workload ke liye Secure Workload, workplace ke liye ISE.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workforce zero trust har session mein ek sawaal poochta hai: kya is device par yeh user abhi is application tak pahunche?</li>
<li>Cisco zero trust ko workforce (Duo), workload (Secure Workload) aur workplace (ISE, SD-Access) mein baant-ta hai.</li>
<li>Trust establish hota hai, per application enforce hota hai, lagataar verify hota hai, aur kuch badalne par kam hota hai.</li>
<li>Signals: identity, authentication strength, device health, device trust aur context.</li>
<li>Flat VPN par MFA zero trust nahi hai; per application least privilege asli fark hai.</li>
</ul></div>
`}};export{e as default};