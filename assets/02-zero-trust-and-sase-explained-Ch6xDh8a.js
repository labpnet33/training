var e={id:`zero-trust-sase`,h:{en:`Zero trust and SASE explained`,hi:`Zero trust aur SASE samjhiye`},body:{en:`
<h3>Trust by location is dead</h3>
<p>In the fort model, being inside the office network was proof of trust. Once your laptop got an office address, it could reach almost everything. If a contractor's infected laptop plugged into a Pune wall port, it could scan the HR server. <b>Zero trust</b> is the idea that location proves nothing. Every request must be checked again, using who the user is, what the device is, and what exactly is being asked for, and the answer is the smallest access that does the job.</p>

<h3>Zero trust in three questions</h3>
<ol>
<li><b>Who is asking?</b> A signed-in identity from the company directory, not just an IP address.</li>
<li><b>What are they asking for?</b> One named application or website, not "the network".</li>
<li><b>Is it allowed right now?</b> A policy decides each time, and the default answer is no.</li>
</ol>
<p>This is "least privilege" plus "verify every time". It is a design idea, not a product you can buy in one box. Products help you build it.</p>

<h3>VPN access versus application access</h3>
<p>A classic remote-access VPN puts the user on the company network. After login the laptop can send packets to many servers, and the only limit is whatever firewall rules exist inside. <b>Zero trust network access</b> (ZTNA) works the other way round. The user never joins the network. They ask for one application, the service checks identity and policy, and only then does it build a path to that single application. Servers are never exposed to the internet and never to the user's device as a network.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VPN versus ZTNA">
<text x="150" y="20" text-anchor="middle" class="svg-ink" font-size="13">VPN: join the network</text>
<rect x="20" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="12">User</text>
<rect x="150" y="30" width="140" height="150" rx="10" fill="#fde68a"/><text x="220" y="52" text-anchor="middle" class="svg-ink" font-size="12">Company LAN</text>
<rect x="170" y="65" width="100" height="26" rx="6" fill="#fff"/><text x="220" y="83" text-anchor="middle" class="svg-ink" font-size="12">ERP</text>
<rect x="170" y="100" width="100" height="26" rx="6" fill="#fff"/><text x="220" y="118" text-anchor="middle" class="svg-ink" font-size="12">HR</text>
<rect x="170" y="135" width="100" height="26" rx="6" fill="#fff"/><text x="220" y="153" text-anchor="middle" class="svg-ink" font-size="12">Files</text>
<line x1="100" y1="60" x2="150" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="150" y="205" text-anchor="middle" class="svg-muted" font-size="12">user can reach many servers</text>
<text x="490" y="20" text-anchor="middle" class="svg-ink" font-size="13">ZTNA: ask for one app</text>
<rect x="340" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="380" y="65" text-anchor="middle" class="svg-ink" font-size="12">User</text>
<rect x="440" y="40" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="65" text-anchor="middle" class="svg-ink" font-size="12">Policy</text>
<rect x="540" y="40" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="580" y="65" text-anchor="middle" class="svg-ink" font-size="12">ERP only</text>
<rect x="540" y="100" width="80" height="26" rx="6" fill="#e2e8f0"/><text x="580" y="118" text-anchor="middle" class="svg-muted" font-size="12">HR hidden</text>
<rect x="540" y="135" width="80" height="26" rx="6" fill="#e2e8f0"/><text x="580" y="153" text-anchor="middle" class="svg-muted" font-size="12">Files hidden</text>
<line x1="420" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/><line x1="520" y1="60" x2="540" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="490" y="205" text-anchor="middle" class="svg-muted" font-size="12">other apps are not even visible</text>
</svg><p class="cap">A VPN grants a network; ZTNA grants one application at a time.</p></div>

<h3>What SASE means</h3>
<p><b>SASE</b> (said "sassy") stands for secure access service edge. It means networking and security functions are delivered together as a cloud service, placed at "edges" near the users, instead of as boxes in each office. The functions you will meet in this track are:</p>
<table class="cmp"><tr><th>Function</th><th>What it does</th><th>Where in this track</th></tr>
<tr><td>Secure web gateway</td><td>Proxy for web traffic: URL filtering, malware checks</td><td>zs-start, zs-fwd, zs-sec</td></tr>
<tr><td>SSL inspection</td><td>Opens TLS so the other functions can see inside</td><td>zs-sec</td></tr>
<tr><td>DLP (data loss prevention)</td><td>Spots sensitive data such as card numbers leaving</td><td>zs-sec</td></tr>
<tr><td>Cloud firewall</td><td>Rules for non-web traffic by protocol and port</td><td>zs-sec</td></tr>
<tr><td>ZTNA</td><td>Per-application access to private apps</td><td>zs-zpa</td></tr>
<tr><td>Experience monitoring</td><td>Scores that show where the slowness is</td><td>zs-zdx</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Meena in Chennai needs the file server. Under the old VPN she joined the Chennai LAN and could also scan the Pune ERP. Under ZTNA the policy says "Engineering may open the files application", so she reaches only files.corp.example. If she asks for erp.corp.example the answer is deny, and the log records who asked and when.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Choosing application access instead of network access changes what the user's device can send packets to. With a VPN, any server address on the LAN is reachable. With ZTNA, the device sends a request for a named application, and nothing else is reachable. The default in the portal's access policy is an implicit deny at the end of the list.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Saying "zero trust is a product". It is an approach that products implement. (2) Thinking SASE removes networks; it only moves the security functions to the cloud and still needs a way to forward traffic (zs-fwd). (3) Assuming a signed-in user is always trusted; policy is checked on every request.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which is true of ZTNA?" The correct choice says the user is connected to an application, not to the network. Anything that says "joins the corporate subnet" describes a classic VPN.</p></div>

<div class="scn"><h4>The contractor on the guest-turned-staff Wi-Fi</h4><p>A vendor's technician had been given office Wi-Fi for two days. Under the old model that meant LAN access, and a vulnerability scanner running on his laptop found the HR server. After the move to application access, the same technician could open only the one application written in his policy. The scan found nothing, because nothing was exposed to his device.</p><p><b>Lesson:</b> shrinking what is reachable shrinks the damage.</p></div>

<div class="iv"><p class="q">"Explain zero trust and SASE to a manager."</p><p>Strong answer: zero trust means we do not trust a user because of where they sit; we check identity, device and request every time and give least privilege. SASE delivers the security and networking functions (web gateway, firewall, ZTNA, DLP) from a cloud service near users. Together they let staff at any site or at home work safely without backhauling to head office. Mention that forwarding traffic correctly is still an engineering task.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zero trust: verify identity, device and request every time; grant least privilege.</li>
<li>ZTNA connects a user to one application; a VPN connects them to a network.</li>
<li>SASE is security plus networking delivered as a cloud service from edges near users.</li>
<li>SWG, SSL inspection, DLP, cloud firewall, ZTNA and experience monitoring are the pieces this track covers.</li>
<li>Default for private access is deny unless a policy rule allows.</li>
</ul></div>
`,hi:`
<h3>Location se trust ka zamana gaya</h3>
<p>Fort model mein office network ke andar hona hi trust ka saboot tha. Aapke laptop ko office address mil gaya to woh lagbhag sab kuch reach kar sakta tha. Agar kisi contractor ka infected laptop Pune ke wall port mein lag jaye, to woh HR server scan kar sakta tha. <b>Zero trust</b> ka idea yeh hai ki location kuch prove nahi karti. Har request dobara check hoti hai, user kaun hai, device kaisa hai, aur exactly kya manga ja raha hai, yeh dekhkar, aur jawab hota hai kaam ke liye sabse chhota access.</p>

<h3>Zero trust teen sawalon mein</h3>
<ol>
<li><b>Kaun maang raha hai?</b> Company directory ki ek signed-in identity, sirf IP address nahi.</li>
<li><b>Kya maang raha hai?</b> Ek named application ya website, "network" nahi.</li>
<li><b>Abhi allowed hai kya?</b> Har baar policy decide karti hai, aur default jawab no hota hai.</li>
</ol>
<p>Yeh "least privilege" plus "har baar verify" hai. Yeh ek design idea hai, aisa product nahi jo ek box mein mil jaye. Products ise banane mein madad karte hain.</p>

<h3>VPN access versus application access</h3>
<p>Classic remote-access VPN user ko company network par rakh deta hai. Login ke baad laptop bahut saare servers ko packets bhej sakta hai, aur limit sirf andar ke firewall rules ki hoti hai. <b>Zero trust network access</b> (ZTNA) ulta chalta hai. User kabhi network join nahi karta. Woh ek application maangta hai, service identity aur policy check karti hai, aur tab jaakar us ek application tak path banati hai. Servers kabhi internet par exposed nahi hote aur user ke device ko network ki tarah nahi dikhte.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VPN versus ZTNA">
<text x="150" y="20" text-anchor="middle" class="svg-ink" font-size="13">VPN: network join karo</text>
<rect x="20" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="12">User</text>
<rect x="150" y="30" width="140" height="150" rx="10" fill="#fde68a"/><text x="220" y="52" text-anchor="middle" class="svg-ink" font-size="12">Company LAN</text>
<rect x="170" y="65" width="100" height="26" rx="6" fill="#fff"/><text x="220" y="83" text-anchor="middle" class="svg-ink" font-size="12">ERP</text>
<rect x="170" y="100" width="100" height="26" rx="6" fill="#fff"/><text x="220" y="118" text-anchor="middle" class="svg-ink" font-size="12">HR</text>
<rect x="170" y="135" width="100" height="26" rx="6" fill="#fff"/><text x="220" y="153" text-anchor="middle" class="svg-ink" font-size="12">Files</text>
<line x1="100" y1="60" x2="150" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="150" y="205" text-anchor="middle" class="svg-muted" font-size="12">user bahut servers tak pahunch sakta hai</text>
<text x="490" y="20" text-anchor="middle" class="svg-ink" font-size="13">ZTNA: ek app maango</text>
<rect x="340" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="380" y="65" text-anchor="middle" class="svg-ink" font-size="12">User</text>
<rect x="440" y="40" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="65" text-anchor="middle" class="svg-ink" font-size="12">Policy</text>
<rect x="540" y="40" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="580" y="65" text-anchor="middle" class="svg-ink" font-size="12">Sirf ERP</text>
<rect x="540" y="100" width="80" height="26" rx="6" fill="#e2e8f0"/><text x="580" y="118" text-anchor="middle" class="svg-muted" font-size="12">HR hidden</text>
<rect x="540" y="135" width="80" height="26" rx="6" fill="#e2e8f0"/><text x="580" y="153" text-anchor="middle" class="svg-muted" font-size="12">Files hidden</text>
<line x1="420" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/><line x1="520" y1="60" x2="540" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="490" y="205" text-anchor="middle" class="svg-muted" font-size="12">baaki apps dikhte bhi nahi</text>
</svg><p class="cap">VPN network deta hai; ZTNA ek baar mein ek application deta hai.</p></div>

<h3>SASE ka matlab</h3>
<p><b>SASE</b> ("sassy" bolte hain) ka full form secure access service edge hai. Matlab networking aur security functions saath mein cloud service ki tarah milte hain, users ke paas "edges" par, har office ke boxes ki jagah. Is track mein jo functions milenge:</p>
<table class="cmp"><tr><th>Function</th><th>Kya karta hai</th><th>Is track mein kahan</th></tr>
<tr><td>Secure web gateway</td><td>Web traffic ka proxy: URL filtering, malware checks</td><td>zs-start, zs-fwd, zs-sec</td></tr>
<tr><td>SSL inspection</td><td>TLS kholta hai taaki baaki functions andar dekh saken</td><td>zs-sec</td></tr>
<tr><td>DLP (data loss prevention)</td><td>Card numbers jaisa sensitive data bahar jaate pakadta hai</td><td>zs-sec</td></tr>
<tr><td>Cloud firewall</td><td>Non-web traffic ke liye protocol aur port ke rules</td><td>zs-sec</td></tr>
<tr><td>ZTNA</td><td>Private apps ke liye per-application access</td><td>zs-zpa</td></tr>
<tr><td>Experience monitoring</td><td>Scores jo dikhate hain slowness kahan hai</td><td>zs-zdx</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Chennai mein Meena ko file server chahiye. Purane VPN mein woh Chennai LAN join karti thi aur Pune ERP bhi scan kar sakti thi. ZTNA mein policy kehti hai "Engineering files application khol sakti hai", to woh sirf files.corp.example tak pahunchti hai. Agar woh erp.corp.example maangti hai to jawab deny hai, aur log mein record hota hai kisne kab maanga.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Network access ki jagah application access chunne se user ka device kin cheezon ko packets bhej sakta hai woh badal jaata hai. VPN mein LAN ka koi bhi server address reachable hai. ZTNA mein device ek named application ki request bhejta hai, aur aur kuch reachable nahi. Portal ki access policy mein list ke end mein implicit deny default hota hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) "Zero trust ek product hai" bolna. Yeh ek approach hai jise products implement karte hain. (2) Sochna ki SASE networks hata deta hai; woh sirf security functions cloud mein le jaata hai aur traffic forward karne ka tareeka abhi bhi chahiye (zs-fwd). (3) Maan lena ki signed-in user hamesha trusted hai; policy har request par check hoti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "ZTNA ke baare mein kya sahi hai?" Sahi option kehta hai ki user ek application se connect hota hai, network se nahi. Jo bhi "corporate subnet join karta hai" kehta hai woh classic VPN hai.</p></div>

<div class="scn"><h4>Guest se staff bane Wi-Fi par contractor</h4><p>Ek vendor ke technician ko do din ke liye office Wi-Fi diya gaya tha. Purane model mein matlab LAN access, aur uske laptop par chalte vulnerability scanner ne HR server dhoondh liya. Application access par jaane ke baad wahi technician sirf wahi ek application khol sakta tha jo uski policy mein likhi thi. Scan ko kuch nahi mila, kyunki uske device ke saamne kuch exposed nahi tha.</p><p><b>Seekh:</b> jo reachable hai woh chhota karo to nuksan chhota hota hai.</p></div>

<div class="iv"><p class="q">"Manager ko zero trust aur SASE samjhao."</p><p>Strong answer: zero trust ka matlab hum user ko is wajah se trust nahi karte ki woh kahan baitha hai; har baar identity, device aur request check karte hain aur least privilege dete hain. SASE security aur networking functions (web gateway, firewall, ZTNA, DLP) ko users ke paas cloud service se deta hai. Dono milkar kisi bhi site ya ghar se kaam karne walon ko head office backhaul kiye bina safe rakhte hain. Yeh mention karo ki traffic ko sahi forward karna abhi bhi engineering ka kaam hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zero trust: har baar identity, device aur request verify karo; least privilege do.</li>
<li>ZTNA user ko ek application se jodta hai; VPN network se.</li>
<li>SASE security plus networking hai jo users ke paas edges se cloud service ki tarah milta hai.</li>
<li>SWG, SSL inspection, DLP, cloud firewall, ZTNA aur experience monitoring is track ke pieces hain.</li>
<li>Private access ka default deny hai jab tak koi policy rule allow na kare.</li>
</ul></div>
`}};export{e as default};