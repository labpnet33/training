var e={id:`summary`,h:{en:`Summary and exam checklist: SSL/SSH inspection`,hi:`Summary aur exam checklist: SSL/SSH inspection`},body:{en:`
<p>This chapter ties the module together for revision. Remember that every SSL profile configuration here is real FortiOS syntax that the simulator does not run. Practise the policy, sniffer, debug flow and session tools in <b>nse4-policy</b> and <b>nse4-diag</b>, and compare decryption on another platform in <b>sec-ftd-ips</b> and <b>sec-visibility</b>.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Module summary">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Notice</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">policy and consent</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Scope</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">exempt sensitive</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Mode</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">cert or deep</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">CA</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">trusted chain</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Verify</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">logs and tests</text>
</svg><p class="cap">The module in one line: decide, scope, choose a mode, trust the CA, verify.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain what a FortiGate sees without decrypting TLS and what it cannot see.</li>
<li>I can compare no-inspection, certificate-inspection and deep-inspection.</li>
<li>I can describe the two TLS sessions of deep inspection and how certificates are re-signed.</li>
<li>I can choose a CA: Fortinet default for labs, enterprise subordinate CA for production, and distribute it.</li>
<li>I can build exemptions by category, address and wildcard FQDN, and explain certificate pinning.</li>
<li>I can state the privacy, legal and performance considerations and the controls for each.</li>
<li>I can troubleshoot warnings, broken apps and slowness with the seven-question ladder.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>TLS / SSL</dt><dd>Protocol that encrypts traffic; SSL is the older name still used in menus.</dd>
<dt>SNI</dt><dd>Server Name Indication: the host name in the ClientHello.</dd>
<dt>Certificate inspection</dt><dd>Reads handshake and certificate; no decryption.</dd>
<dt>Deep inspection</dt><dd>Decrypts, inspects and re-encrypts using a FortiGate CA.</dd>
<dt>caname / untrusted-caname</dt><dd>CAs that sign copies of valid / invalid server certificates.</dd>
<dt>Subordinate CA</dt><dd>A CA certificate issued by another CA, able to sign certificates.</dd>
<dt>Exemption</dt><dd>Traffic that is not decrypted (category, address, wildcard FQDN, regex).</dd>
<dt>Certificate pinning</dt><dd>An application accepts only a built-in certificate or key.</dd>
<dt>Man-in-the-middle by consent</dt><dd>Deep inspection when users and policy authorise it.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Certificate inspection</td><td>No decryption, no CA on clients, SNI and certificate only</td></tr>
<tr><td>Deep inspection</td><td>Decrypts; clients must trust the signing CA; enables AV, IPS, URL path</td></tr>
<tr><td>Default CAs</td><td>Fortinet_CA_SSL (valid), Fortinet_CA_Untrusted (invalid)</td></tr>
<tr><td>Warning on one site</td><td>Real server certificate invalid</td></tr>
<tr><td>Warning on all sites</td><td>Client does not trust the inspection CA</td></tr>
<tr><td>Exemption types</td><td>fortiguard-category, address, wildcard-fqdn, regex</td></tr>
<tr><td>Typical exemptions</td><td>Finance and Banking, Health, pinned apps, updates</td></tr>
<tr><td>Guest/BYOD</td><td>Certificate inspection, not deep</td></tr>
<tr><td>Sizing</td><td>Use the SSL inspection throughput figure</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># captured in the simulator labs (nse4-diag)</span>
diagnose sniffer packet any "host 10.0.2.10 and port 80" 4 6
diagnose sys session filter dst 10.0.2.10
diagnose sys session list
diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2
<span class="c"># reference only, not run in the simulator</span>
show full-configuration firewall ssl-ssh-profile NK-DEEP
get vpn certificate local
get system performance status</pre>

<div class="warn"><p><b>Last reminder.</b> Decrypting is a decision about people as much as packets. Consent, exemptions and governance come before configuration.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question needs antivirus, IPS or URL-path filtering on HTTPS traffic, the answer includes deep inspection. If it mentions guests or unmanaged devices, the answer is certificate inspection. If it mentions an application that fails only with inspection on, think pinning and an exemption.</p></div>

<div class="scn"><h4>The pilot that became the standard</h4><p>A regional bank-branch network piloted deep inspection on 25 managed laptops with an enterprise subordinate CA, banking and health categories exempt, guests on certificate inspection, an updated acceptable-use policy and a town hall. Two pinned apps were exempted during the pilot. After eight weeks with stable CPU and no complaints, the rollout continued by department.</p><p><b>Lesson:</b> a small, well-governed pilot turns a risky change into a routine one.</p></div>

<div class="iv"><p class="q">"Summarise SSL inspection in a minute."</p><p>Encryption hides threats from security profiles. Certificate inspection reads only the handshake and needs no client CA; deep inspection decrypts using a trusted FortiGate or enterprise CA so antivirus, IPS and URL-path filtering work. I exempt sensitive categories and pinned applications, never deep inspect guests, get legal and consent in place, protect the CA key, size for SSL throughput and troubleshoot by policy, profile, exemption, trust, pinning, server certificate and load.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose the least inspection that meets the risk; deep only where it is justified.</li>
<li>Trusted CA, exemptions and governance make deep inspection work and acceptable.</li>
<li>Know the symptom to cause map for warnings and broken apps.</li>
<li>Practise policy and diagnostic tools in nse4-policy and nse4-diag.</li>
<li>Always size for SSL inspection throughput.</li>
</ul></div>
`,hi:`
<p>Yeh chapter revision ke liye module ko jodta hai. Yaad rakho ki yahan ki har SSL profile configuration real FortiOS syntax hai jo simulator nahi chalata. Policy, sniffer, debug flow aur session tools ki practice <b>nse4-policy</b> aur <b>nse4-diag</b> mein karo, aur doosre platform par decryption ki tulna <b>sec-ftd-ips</b> aur <b>sec-visibility</b> mein.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Module summary">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Notice</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">policy aur consent</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Scope</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">sensitive exempt</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Mode</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">cert ya deep</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">CA</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">trusted chain</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Verify</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">logs aur tests</text>
</svg><p class="cap">Module ek line mein: decide, scope, mode chuno, CA trust karo, verify karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki FortiGate TLS decrypt kiye bina kya dekhta hai aur kya nahi.</li>
<li>Main no-inspection, certificate-inspection aur deep-inspection ki tulna kar sakta hoon.</li>
<li>Main deep inspection ke do TLS sessions aur certificates re-sign hone ka tareeka bata sakta hoon.</li>
<li>Main CA chun sakta hoon: labs ke liye Fortinet default, production ke liye enterprise subordinate CA, aur use distribute kar sakta hoon.</li>
<li>Main category, address aur wildcard FQDN se exemptions bana sakta hoon aur certificate pinning samjha sakta hoon.</li>
<li>Main privacy, legal aur performance considerations aur har ke controls bata sakta hoon.</li>
<li>Main warnings, toote apps aur slowness ko saat-sawaal ki ladder se troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>TLS / SSL</dt><dd>Traffic encrypt karne wala protocol; SSL purana naam hai jo menus mein ab bhi dikhta hai.</dd>
<dt>SNI</dt><dd>Server Name Indication: ClientHello mein host name.</dd>
<dt>Certificate inspection</dt><dd>Handshake aur certificate padhta hai; decryption nahi.</dd>
<dt>Deep inspection</dt><dd>FortiGate CA se decrypt, inspect aur re-encrypt karta hai.</dd>
<dt>caname / untrusted-caname</dt><dd>Valid / invalid server certificates ke copies sign karne wale CAs.</dd>
<dt>Subordinate CA</dt><dd>Doosre CA ka issue kiya CA certificate jo certificates sign kar sakta hai.</dd>
<dt>Exemption</dt><dd>Jo traffic decrypt nahi hota (category, address, wildcard FQDN, regex).</dd>
<dt>Certificate pinning</dt><dd>Application sirf built-in certificate ya key accept karti hai.</dd>
<dt>Man-in-the-middle by consent</dt><dd>Deep inspection jab users aur policy authorise karein.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Certificate inspection</td><td>Decryption nahi, clients par CA nahi, sirf SNI aur certificate</td></tr>
<tr><td>Deep inspection</td><td>Decrypt karta hai; clients ko signing CA trust karna zaroori; AV, IPS, URL path enable</td></tr>
<tr><td>Default CAs</td><td>Fortinet_CA_SSL (valid), Fortinet_CA_Untrusted (invalid)</td></tr>
<tr><td>Ek site par warning</td><td>Asli server certificate invalid</td></tr>
<tr><td>Saari sites par warning</td><td>Client inspection CA par trust nahi karta</td></tr>
<tr><td>Exemption types</td><td>fortiguard-category, address, wildcard-fqdn, regex</td></tr>
<tr><td>Typical exemptions</td><td>Finance and Banking, Health, pinned apps, updates</td></tr>
<tr><td>Guest/BYOD</td><td>Certificate inspection, deep nahi</td></tr>
<tr><td>Sizing</td><td>SSL inspection throughput figure use karo</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># simulator labs (nse4-diag) mein captured</span>
diagnose sniffer packet any "host 10.0.2.10 and port 80" 4 6
diagnose sys session filter dst 10.0.2.10
diagnose sys session list
diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2
<span class="c"># sirf reference, simulator mein nahi chalta</span>
show full-configuration firewall ssl-ssh-profile NK-DEEP
get vpn certificate local
get system performance status</pre>

<div class="warn"><p><b>Aakhri reminder.</b> Decrypt karna packets ke saath logon ke baare mein bhi decision hai. Configuration se pehle consent, exemptions aur governance aate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal ko HTTPS traffic par antivirus, IPS ya URL-path filtering chahiye to jawab mein deep inspection hoga. Guests ya unmanaged devices ka zikr ho to jawab certificate inspection. Aisi application ka zikr ho jo sirf inspection on hone par fail ho, to pinning aur exemption socho.</p></div>

<div class="scn"><h4>Pilot jo standard ban gaya</h4><p>Ek regional bank-branch network ne 25 managed laptops par enterprise subordinate CA ke saath deep inspection pilot kiya, banking aur health categories exempt, guests certificate inspection par, updated acceptable-use policy aur town hall ke saath. Pilot ke dauraan do pinned apps exempt hui. Aath hafte stable CPU aur bina complaints ke baad rollout department ke hisaab se aage badha.</p><p><b>Lesson:</b> chhota, well-governed pilot risky change ko routine bana deta hai.</p></div>

<div class="iv"><p class="q">"SSL inspection ek minute mein summarise karo."</p><p>Encryption security profiles se threats chhupa deta hai. Certificate inspection sirf handshake padhta hai aur client CA nahi chahiye; deep inspection trusted FortiGate ya enterprise CA se decrypt karta hai taaki antivirus, IPS aur URL-path filtering chalein. Main sensitive categories aur pinned applications exempt karta hoon, guests ko kabhi deep inspect nahi karta, legal aur consent set karta hoon, CA key protect karta hoon, SSL throughput ke hisaab se size karta hoon aur policy, profile, exemption, trust, pinning, server certificate aur load se troubleshoot karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Risk ke hisaab se sabse kam inspection chuno; deep sirf jahan justified ho.</li>
<li>Trusted CA, exemptions aur governance deep inspection ko chalne layak aur acceptable banate hain.</li>
<li>Warnings aur toote apps ke liye symptom se cause ka map jaano.</li>
<li>Policy aur diagnostic tools ki practice nse4-policy aur nse4-diag mein karo.</li>
<li>Hamesha SSL inspection throughput ke hisaab se size karo.</li>
</ul></div>
`}};export{e as default};