var e={id:`overview`,h:{en:`Why firewall authentication: policies by person, not by IP`,hi:`Firewall authentication kyun: policy IP ki nahi, insaan ki`},body:{en:`
<p>Until now a firewall policy answered the question "which address may talk to which address?". That works while every person always sits on the same IP. In a real office, people move between desks, share laptops, use Wi-Fi and log in from home. An address tells you where a packet came from, not <b>who</b> sent it. Firewall authentication adds the missing piece: the rule says "the Finance group may reach the payroll server", and the FortiGate works out, by asking a directory, who is behind each address.</p>
<div class="note"><p><b>Honest scope note.</b> The simulator in this course runs address-based policies, objects, VIPs and IP pools. It does not run user, group, LDAP, RADIUS, FSSO or captive-portal features, and this module has <b>no labs</b>. Every configuration block here is labelled <b>Reference configuration (not run in the simulator)</b>, and no command output is shown because none could be captured. To practise the policy side, use <b>nse4-policy</b> and <b>nse4-nat</b>. For the AAA concepts on other platforms, see <b>sec-aaa-mgmt</b> and <b>sec-ise</b>.</p></div>

<h3>Authentication, authorization, identity</h3>
<p>Three ideas keep appearing in this module:</p>
<dl class="terms">
<dt>Authentication</dt><dd>Proving who you are: a password, a certificate, a ticket from a domain controller.</dd>
<dt>Authorization</dt><dd>What that identity may do. On a FortiGate this is the firewall policy that lists the user or group.</dd>
<dt>Identity source</dt><dd>The place that knows the users: the FortiGate itself (local users), an LDAP directory, a RADIUS server, or Active Directory through FSSO.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Identity flow">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="96" text-anchor="middle" class="svg-ink" font-size="13">User</text><text x="65" y="114" text-anchor="middle" class="svg-muted" font-size="12">laptop</text>
<rect x="170" y="70" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="235" y="96" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="235" y="114" text-anchor="middle" class="svg-muted" font-size="12">policy with groups</text>
<rect x="350" y="20" width="130" height="50" rx="10" fill="#fde68a"/><text x="415" y="50" text-anchor="middle" class="svg-ink" font-size="13">LDAP / AD</text>
<rect x="350" y="130" width="130" height="50" rx="10" fill="#fde68a"/><text x="415" y="160" text-anchor="middle" class="svg-ink" font-size="13">RADIUS</text>
<rect x="520" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="575" y="96" text-anchor="middle" class="svg-ink" font-size="13">Server</text><text x="575" y="114" text-anchor="middle" class="svg-muted" font-size="12">allowed</text>
<line x1="120" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="300" y1="90" x2="350" y2="50" stroke="#64748b" stroke-width="2"/><line x1="300" y1="110" x2="350" y2="150" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="520" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">The firewall asks an identity source, then applies the policy that names the user's group.</p></div>

<h3>The four ways a FortiGate learns identity</h3>
<table class="cmp"><tr><th>Method</th><th>User experience</th><th>Typical use</th></tr>
<tr><td>Local users</td><td>Login prompt, accounts live on the FortiGate</td><td>Small sites, guests, VPN test users</td></tr>
<tr><td>LDAP / RADIUS</td><td>Login prompt, the check goes to a server</td><td>Central accounts, MFA through RADIUS</td></tr>
<tr><td>Captive portal</td><td>Browser is redirected to a login page</td><td>Guests and unmanaged devices</td></tr>
<tr><td>FSSO</td><td>No prompt; the Windows login is reused</td><td>Domain-joined staff PCs</td></tr></table>

<h3>What changes in the policy</h3>
<p>A normal policy has <code>srcaddr</code>. An identity-based policy adds users or groups next to it. The address still matters, because the user must also come from an allowed network. Reference shape:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 20
        set name "FINANCE-TO-PAYROLL"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "LAN_NET"
        set dstaddr "PAYROLL-SRV"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set groups "FINANCE-USERS"
        set logtraffic all
    next
end</pre>

<div class="eg"><p><b>Worked example.</b> Anita from Finance works at desk A in the morning and in the meeting room at noon. Address-based rules would need two different source objects and a change every time she moves. With a group rule, the FortiGate sees that the device in the meeting room belongs to Anita, a member of FINANCE-USERS, and the same policy applies at both places.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Thinking authentication replaces the firewall policy (it does not; it adds a condition); forgetting that a user who has not logged in has no identity yet; using the group name in a policy before it exists; and testing only with a user who is a member, never with one who is not.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authentication proves identity; the policy gives authorization. A successful login alone allows nothing. The user must also match a policy that lists the user or one of the user's groups.</p></div>

<div class="scn"><h4>The shared meeting-room PC</h4><p>A bank branch used one address-based rule for the meeting-room PC. Visitors and staff both used it, so everyone got the same access. After moving to identity-based policies, staff signed in and received staff access, while a visitor who signed in as a guest reached only the internet. The single PC stopped being a security gap because the rule followed the person.</p><p><b>Lesson:</b> when many people share one address, only identity can tell them apart.</p></div>

<div class="iv"><p class="q">"Why use user authentication on a firewall instead of just IP addresses?"</p><p>An IP address identifies a device and a place, not a person. Authentication lets the rule follow the user across desks and devices, gives logs a name instead of an address, and lets you separate staff, contractors and guests on the same network. Mention the sources (local, LDAP, RADIUS, FSSO) and that policy still gives the authorization.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Address-based rules say where; identity-based rules say who.</li>
<li>Identity can come from local users, LDAP, RADIUS, a captive portal or FSSO.</li>
<li>The policy gives authorization: it lists the users or groups.</li>
<li>This module is reference-only; practise policies in nse4-policy and nse4-nat.</li>
</ul></div>
`,hi:`
<p>Ab tak firewall policy yeh sawal poochhti thi: "kaunsa address kaunse address se baat kar sakta hai?" Yeh tab tak chalta hai jab tak har insaan hamesha ek hi IP par baithta hai. Asli office mein log desks badalte hain, laptop share karte hain, Wi-Fi use karte hain aur ghar se login karte hain. Address batata hai packet kahan se aaya, yeh nahi ki <b>kisne</b> bheja. Firewall authentication wahi missing hissa jodta hai: rule kehta hai "Finance group payroll server tak ja sakta hai", aur FortiGate directory se poochhkar pata lagata hai ki har address ke peeche kaun hai.</p>
<div class="note"><p><b>Honest scope note.</b> Is course ka simulator address-based policies, objects, VIPs aur IP pools chalata hai. Yeh user, group, LDAP, RADIUS, FSSO ya captive-portal features nahi chalata, aur is module mein <b>koi lab nahi hai</b>. Yahan har configuration block par <b>Reference configuration (not run in the simulator)</b> likha hai, aur koi command output nahi dikhaya kyunki capture nahi ho sakta tha. Policy side practise karne ke liye <b>nse4-policy</b> aur <b>nse4-nat</b> use karo. Doosre platforms par AAA concepts ke liye <b>sec-aaa-mgmt</b> aur <b>sec-ise</b> dekho.</p></div>

<h3>Authentication, authorization, identity</h3>
<p>Is module mein teen ideas baar baar aayenge:</p>
<dl class="terms">
<dt>Authentication</dt><dd>Saabit karna ki aap kaun ho: password, certificate, domain controller ka ticket.</dd>
<dt>Authorization</dt><dd>Us identity ko kya karne ki ijaazat hai. FortiGate par yeh woh firewall policy hai jo user ya group list karti hai.</dd>
<dt>Identity source</dt><dd>Woh jagah jo users ko jaanti hai: khud FortiGate (local users), LDAP directory, RADIUS server, ya FSSO ke through Active Directory.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Identity flow">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="96" text-anchor="middle" class="svg-ink" font-size="13">User</text><text x="65" y="114" text-anchor="middle" class="svg-muted" font-size="12">laptop</text>
<rect x="170" y="70" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="235" y="96" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="235" y="114" text-anchor="middle" class="svg-muted" font-size="12">groups wali policy</text>
<rect x="350" y="20" width="130" height="50" rx="10" fill="#fde68a"/><text x="415" y="50" text-anchor="middle" class="svg-ink" font-size="13">LDAP / AD</text>
<rect x="350" y="130" width="130" height="50" rx="10" fill="#fde68a"/><text x="415" y="160" text-anchor="middle" class="svg-ink" font-size="13">RADIUS</text>
<rect x="520" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="575" y="96" text-anchor="middle" class="svg-ink" font-size="13">Server</text><text x="575" y="114" text-anchor="middle" class="svg-muted" font-size="12">allowed</text>
<line x1="120" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="300" y1="90" x2="350" y2="50" stroke="#64748b" stroke-width="2"/><line x1="300" y1="110" x2="350" y2="150" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="520" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Firewall identity source se poochhta hai, phir user ke group wali policy lagata hai.</p></div>

<h3>FortiGate identity kaise seekhta hai: chaar tareeke</h3>
<table class="cmp"><tr><th>Method</th><th>User ka experience</th><th>Aam use</th></tr>
<tr><td>Local users</td><td>Login prompt, accounts FortiGate par rehte hain</td><td>Chhote sites, guests, VPN test users</td></tr>
<tr><td>LDAP / RADIUS</td><td>Login prompt, check server ko jaata hai</td><td>Central accounts, RADIUS ke through MFA</td></tr>
<tr><td>Captive portal</td><td>Browser login page par redirect hota hai</td><td>Guests aur unmanaged devices</td></tr>
<tr><td>FSSO</td><td>Koi prompt nahi; Windows login reuse hota hai</td><td>Domain-joined staff PCs</td></tr></table>

<h3>Policy mein kya badalta hai</h3>
<p>Normal policy mein <code>srcaddr</code> hota hai. Identity-based policy mein uske saath users ya groups jodte hain. Address phir bhi matter karta hai, kyunki user ko allowed network se bhi aana hoga. Reference shape:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 20
        set name "FINANCE-TO-PAYROLL"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "LAN_NET"
        set dstaddr "PAYROLL-SRV"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set groups "FINANCE-USERS"
        set logtraffic all
    next
end</pre>

<div class="eg"><p><b>Worked example.</b> Finance ki Anita subah desk A par aur dopahar ko meeting room mein kaam karti hai. Address-based rules mein do alag source objects chahiye aur har baar jab woh move kare change karna padta. Group rule mein FortiGate dekhta hai ki meeting room ka device Anita ka hai, jo FINANCE-USERS ki member hai, aur wahi policy dono jagah lagti hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Sochna ki authentication firewall policy ko replace karti hai (nahi, yeh ek condition jodti hai); bhoolna ki jis user ne login nahi kiya uski abhi identity nahi hai; group bane bina policy mein uska naam use karna; aur sirf member user se test karna, non-member se kabhi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authentication identity saabit karti hai; policy authorization deti hai. Sirf successful login kuch allow nahi karta. User ko aisi policy bhi match karni hogi jo user ya uska group list kare.</p></div>

<div class="scn"><h4>Shared meeting-room PC</h4><p>Ek bank branch ne meeting-room PC ke liye ek address-based rule rakha. Visitors aur staff dono use karte the, isliye sabko same access milta tha. Identity-based policies par jaane ke baad staff ne sign in kiya aur staff access paya, jabki guest ke roop mein sign in karne wala visitor sirf internet tak pahuncha. Ek PC security gap nahi raha kyunki rule insaan ko follow karta tha.</p><p><b>Lesson:</b> jab kai log ek address share karein, sirf identity unhe alag kar sakti hai.</p></div>

<div class="iv"><p class="q">"Firewall par sirf IP addresses ki jagah user authentication kyun use karte hain?"</p><p>IP address device aur jagah ko identify karta hai, insaan ko nahi. Authentication rule ko desks aur devices ke across user ke saath chalne deti hai, logs mein address ki jagah naam deti hai, aur ek hi network par staff, contractors aur guests ko alag karne deti hai. Sources (local, LDAP, RADIUS, FSSO) batao aur yeh bhi ki authorization policy deti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Address-based rules kahan batate hain; identity-based rules kaun batate hain.</li>
<li>Identity local users, LDAP, RADIUS, captive portal ya FSSO se aa sakti hai.</li>
<li>Policy authorization deti hai: woh users ya groups list karti hai.</li>
<li>Yeh module reference-only hai; policies nse4-policy aur nse4-nat mein practise karo.</li>
</ul></div>
`}};export{e as default};