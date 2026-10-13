var e={id:`fsso`,h:{en:`FSSO: single sign-on from the Windows login`,hi:`FSSO: Windows login se single sign-on`},body:{en:`
<p>A login prompt on the firewall is fine for guests, but staff on domain-joined PCs have already logged in to Windows. Asking them again is annoying and slows the day. <b>Fortinet Single Sign-On (FSSO)</b> reuses that Windows login: software watches the domain, learns which user is at which IP address, and tells the FortiGate. The user never sees a prompt, yet policies still apply by group.</p>
<div class="note"><p><b>Reference only.</b> The simulator has no FSSO collector, no domain controller and no user tables. The blocks below are a <b>Reference configuration (not run in the simulator)</b>, with a documentation address and a placeholder password. No output is shown because none could be captured.</p></div>

<h3>The pieces</h3>
<dl class="terms">
<dt>Domain controller (DC)</dt><dd>The Windows server that records logins in its event log.</dd>
<dt>FSSO collector agent</dt><dd>Software on a Windows server that gathers login events and sends user-to-IP mappings to the FortiGate.</dd>
<dt>DC agent</dt><dd>An optional agent installed on each domain controller that reports logins to the collector. Without it, the collector can poll the DCs instead.</dd>
<dt>FortiGate</dt><dd>Connects to the collector, receives the mappings and the user's AD groups, and uses them in policies.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="FSSO flow">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="96" text-anchor="middle" class="svg-ink" font-size="13">Staff PC</text><text x="65" y="114" text-anchor="middle" class="svg-muted" font-size="12">Windows login</text>
<rect x="170" y="70" width="130" height="60" rx="10" fill="#fde68a"/><text x="235" y="96" text-anchor="middle" class="svg-ink" font-size="13">Domain</text><text x="235" y="114" text-anchor="middle" class="svg-muted" font-size="12">controller</text>
<rect x="350" y="70" width="130" height="60" rx="10" fill="#fde68a"/><text x="415" y="96" text-anchor="middle" class="svg-ink" font-size="13">Collector</text><text x="415" y="114" text-anchor="middle" class="svg-muted" font-size="12">agent</text>
<rect x="520" y="70" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="575" y="96" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="575" y="114" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<line x1="120" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="350" y2="100" stroke="#64748b" stroke-width="2"/><line x1="480" y1="100" x2="520" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">user + IP + groups reach the firewall without a prompt</text>
</svg><p class="cap">The firewall learns the user from the Windows login, not from a new password prompt.</p></div>

<h3>Define the collector on the FortiGate</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user fsso
    edit "CORP-FSSO"
        set server "192.0.2.60"
        set port 8000
        set password "FSSO-Placeholder-Password"
    next
end</pre>
<p>The FortiGate connects to the collector agent on the stated port (the collector's default is 8000) and authenticates with the shared password. Make sure the firewall in front of the collector allows that connection. The DC agents, if used, report to the collector on their own port (commonly UDP 8002); check the product guide for your version.</p>

<h3>Use AD groups in policies</h3>
<p>FSSO groups are created in <code>config user adgrp</code> from the collector, and then placed into an FSSO-type firewall group:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user group
    edit "FINANCE-SSO"
        set group-type fsso-service
        set member "CN=Finance,OU=Groups,DC=corp,DC=example"
    next
end
config firewall policy
    edit 25
        set name "FINANCE-SSO-TO-PAYROLL"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "LAN_NET"
        set dstaddr "PAYROLL-SRV"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set groups "FINANCE-SSO"
        set logtraffic all
    next
end</pre>
<p>The policy does not change shape: it simply lists a group whose members arrive through FSSO. The group name above is an example; use the exact name that appears on your unit.</p>

<h3>Collector or polling?</h3>
<table class="cmp"><tr><th></th><th>DC agent mode</th><th>Polling mode</th></tr>
<tr><td>Software on DCs</td><td>Yes, a small agent per DC</td><td>No</td></tr>
<tr><td>How logins are learned</td><td>Agent pushes them to the collector</td><td>Collector reads the DC event log</td></tr>
<tr><td>Load and delay</td><td>Faster, lighter on the DC</td><td>Simpler but with delay and more load</td></tr></table>

<div class="eg"><p><b>Worked example.</b> At 09:00, 200 staff switch on their PCs and log in to the domain. The collector sees 200 logins and sends 200 mappings to the FortiGate. Anita from Finance, now on 10.0.1.34, opens the payroll site. The firewall checks its table, finds that 10.0.1.34 belongs to a Finance member, and policy 25 matches. She sees no prompt.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> A time difference between the collector and the DCs; users who log in while the collector is down (they appear as unknown); stale mappings when a laptop changes address and the old mapping stays until a timeout; devices that are not domain members (Linux, phones), which never produce a Windows login event, so they still need a portal or another method.</p></div>
<div class="exam"><p><b>Exam trap.</b> FSSO does not authenticate at the FortiGate. It trusts the information from the collector. Anyone who can place a wrong mapping into that channel can fool the firewall, so protect the connection and the password, and limit who can reach the collector.</p></div>

<div class="scn"><h4>Nobody was recognised after the reboot</h4><p>After patching the collector server, every user looked unauthenticated and fell to the guest policy. The collector service had not restarted, so no mappings reached the FortiGate. Restarting the service and re-checking the FSSO connection restored identities. The team added "collector running and connected" to the patch checklist.</p><p><b>Lesson:</b> if all users lose their identity at once, look at the collector link first.</p></div>

<div class="iv"><p class="q">"What is FSSO and why use it instead of a captive portal?"</p><p>FSSO learns who is logged in to the Windows domain through a collector agent and sends user-to-IP mappings and groups to the FortiGate, so staff on domain PCs get identity-based policy without a second login. A captive portal suits guests and unmanaged devices. Mention DC agent and polling modes and the risk of stale mappings.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FSSO reuses the Windows login; the user sees no extra prompt.</li>
<li>The collector agent sends user, IP and group information to the FortiGate.</li>
<li>Configure the collector under <code>config user fsso</code> and use FSSO groups in policies.</li>
<li>Non-domain devices need another method.</li>
</ul></div>
`,hi:`
<p>Firewall ka login prompt guests ke liye theek hai, lekin domain-joined PCs ke staff pehle hi Windows mein login kar chuke hote hain. Unse dobara poochna irritating hai aur din slow karta hai. <b>Fortinet Single Sign-On (FSSO)</b> wahi Windows login reuse karta hai: software domain ko dekhta hai, seekhta hai ki kaunsa user kaunse IP address par hai, aur FortiGate ko batata hai. User ko koi prompt nahi dikhta, phir bhi policies group ke hisaab se lagti hain.</p>
<div class="note"><p><b>Reference only.</b> Simulator mein FSSO collector, domain controller aur user tables nahi hain. Neeche ke blocks <b>Reference configuration (not run in the simulator)</b> hain, documentation address aur placeholder password ke saath. Koi output nahi dikhaya kyunki capture nahi ho sakta tha.</p></div>

<h3>Hisse</h3>
<dl class="terms">
<dt>Domain controller (DC)</dt><dd>Windows server jo logins ko apne event log mein record karta hai.</dd>
<dt>FSSO collector agent</dt><dd>Windows server par software jo login events ikattha karta hai aur user-to-IP mappings FortiGate ko bhejta hai.</dd>
<dt>DC agent</dt><dd>Har domain controller par install hone wala optional agent jo logins collector ko report karta hai. Iske bina collector DCs ko poll kar sakta hai.</dd>
<dt>FortiGate</dt><dd>Collector se connect hota hai, mappings aur user ke AD groups paata hai, aur unhe policies mein use karta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="FSSO flow">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="96" text-anchor="middle" class="svg-ink" font-size="13">Staff PC</text><text x="65" y="114" text-anchor="middle" class="svg-muted" font-size="12">Windows login</text>
<rect x="170" y="70" width="130" height="60" rx="10" fill="#fde68a"/><text x="235" y="96" text-anchor="middle" class="svg-ink" font-size="13">Domain</text><text x="235" y="114" text-anchor="middle" class="svg-muted" font-size="12">controller</text>
<rect x="350" y="70" width="130" height="60" rx="10" fill="#fde68a"/><text x="415" y="96" text-anchor="middle" class="svg-ink" font-size="13">Collector</text><text x="415" y="114" text-anchor="middle" class="svg-muted" font-size="12">agent</text>
<rect x="520" y="70" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="575" y="96" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="575" y="114" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<line x1="120" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="350" y2="100" stroke="#64748b" stroke-width="2"/><line x1="480" y1="100" x2="520" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">user + IP + groups bina prompt ke firewall tak pahunchte hain</text>
</svg><p class="cap">Firewall user ko Windows login se seekhta hai, naye password prompt se nahi.</p></div>

<h3>FortiGate par collector define karna</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user fsso
    edit "CORP-FSSO"
        set server "192.0.2.60"
        set port 8000
        set password "FSSO-Placeholder-Password"
    next
end</pre>
<p>FortiGate collector agent se bataye port par connect hota hai (collector ka default 8000 hai) aur shared password se authenticate karta hai. Pakka karo ki collector ke saamne ka firewall us connection ko allow karta hai. DC agents, agar use hon, collector ko apne port par report karte hain (aam taur par UDP 8002); apne version ki product guide dekho.</p>

<h3>Policies mein AD groups use karna</h3>
<p>FSSO groups collector se <code>config user adgrp</code> mein bante hain, aur phir FSSO-type firewall group mein daale jaate hain:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user group
    edit "FINANCE-SSO"
        set group-type fsso-service
        set member "CN=Finance,OU=Groups,DC=corp,DC=example"
    next
end
config firewall policy
    edit 25
        set name "FINANCE-SSO-TO-PAYROLL"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "LAN_NET"
        set dstaddr "PAYROLL-SRV"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set groups "FINANCE-SSO"
        set logtraffic all
    next
end</pre>
<p>Policy ka shape nahi badalta: woh bas aisa group list karti hai jiske members FSSO ke through aate hain. Upar ka group naam example hai; jo exact naam aapke unit par dikhe wahi use karo.</p>

<h3>Collector ya polling?</h3>
<table class="cmp"><tr><th></th><th>DC agent mode</th><th>Polling mode</th></tr>
<tr><td>DCs par software</td><td>Haan, har DC par chhota agent</td><td>Nahi</td></tr>
<tr><td>Logins kaise seekhe jaate hain</td><td>Agent unhe collector ko push karta hai</td><td>Collector DC event log padhta hai</td></tr>
<tr><td>Load aur delay</td><td>Tez, DC par halka</td><td>Simple lekin delay aur zyada load ke saath</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Subah 09:00 baje 200 staff PCs on karte hain aur domain mein login karte hain. Collector 200 logins dekhta hai aur 200 mappings FortiGate ko bhejta hai. Finance ki Anita, ab 10.0.1.34 par, payroll site kholti hai. Firewall apni table check karta hai, dekhta hai ki 10.0.1.34 Finance member ka hai, aur policy 25 match karti hai. Use koi prompt nahi dikhta.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Collector aur DCs ke beech time difference; woh users jo collector down hone par login karte hain (woh unknown dikhte hain); stale mappings jab laptop ka address badalta hai aur purana mapping timeout tak rehta hai; woh devices jo domain members nahi hain (Linux, phones), jo kabhi Windows login event nahi banate, isliye unhe phir bhi portal ya doosra method chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> FSSO FortiGate par authenticate nahi karta. Woh collector ki information par bharosa karta hai. Jo koi us channel mein galat mapping daal sake woh firewall ko dhokha de sakta hai, isliye connection aur password protect karo, aur collector tak kaun pahunch sakta hai use limit karo.</p></div>

<div class="scn"><h4>Reboot ke baad kisi ko pehchaana nahi gaya</h4><p>Collector server ko patch karne ke baad har user unauthenticated dikhne laga aur guest policy par gir gaya. Collector service restart nahi hui thi, isliye koi mapping FortiGate tak nahi pahunchi. Service restart karke aur FSSO connection dobara check karke identities wapas aayi. Team ne patch checklist mein "collector running and connected" joda.</p><p><b>Lesson:</b> agar sab users ek saath apni identity kho dein, pehle collector link dekho.</p></div>

<div class="iv"><p class="q">"FSSO kya hai aur captive portal ki jagah kyun use karte hain?"</p><p>FSSO collector agent ke through seekhta hai ki Windows domain mein kaun logged in hai aur user-to-IP mappings aur groups FortiGate ko bhejta hai, isliye domain PCs ke staff ko doosre login ke bina identity-based policy milti hai. Captive portal guests aur unmanaged devices ke liye hai. DC agent aur polling modes aur stale mappings ka risk batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FSSO Windows login reuse karta hai; user ko extra prompt nahi dikhta.</li>
<li>Collector agent user, IP aur group information FortiGate ko bhejta hai.</li>
<li>Collector <code>config user fsso</code> ke neeche configure karo aur policies mein FSSO groups use karo.</li>
<li>Non-domain devices ko doosra method chahiye.</li>
</ul></div>
`}};export{e as default};