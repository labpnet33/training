var e={id:`settings-auth`,h:{en:`SSL VPN settings, certificates and authentication`,hi:`SSL VPN settings, certificates aur authentication`},body:{en:`
<p>Now the engine room: the SSL VPN <b>settings</b> that make the FortiGate listen, and the <b>authentication</b> that decides who gets in. Most real SSL VPN incidents start here, either because a user cannot log in or because someone who should not be able to log in can. Reference configuration is <b>not run in the simulator</b>.</p>

<h3>The settings that matter</h3>
<table class="cmp"><tr><th>Setting</th><th>What it does</th><th>Good practice</th></tr>
<tr><td><code>source-interface</code></td><td>The interface where the service listens, normally the internet-facing one</td><td>Only the WAN interface that users reach</td></tr>
<tr><td><code>source-address</code></td><td>Which client source addresses may connect</td><td>Restrict by country or known ranges where possible</td></tr>
<tr><td><code>port</code></td><td>TCP port of the service, 443 by default</td><td>Avoid a clash with the administration GUI on the same address</td></tr>
<tr><td><code>servercert</code></td><td>The certificate presented to clients</td><td>A certificate from a trusted CA with the right name, not the default self-signed one</td></tr>
<tr><td><code>tunnel-ip-pools</code></td><td>Addresses given to tunnel-mode clients</td><td>Private range that does not overlap with the LAN or typical home networks</td></tr>
<tr><td><code>default-portal</code></td><td>Portal for users who match no authentication rule</td><td>Leave unset or point to a harmless portal</td></tr>
<tr><td><code>authentication-rule</code></td><td>Maps users or groups to portals</td><td>One rule per group, most specific first</td></tr>
<tr><td><code>dns-server1</code>, <code>dns-server2</code></td><td>DNS handed to tunnel clients</td><td>Internal DNS so that internal names resolve</td></tr></table>

<h3>The server certificate</h3>
<p>Clients check the certificate before sending credentials. If you leave the built-in self-signed certificate, every user sees a warning, learns to click through warnings, and an attacker's fake gateway is harder to spot. Install a certificate for <code>vpn.company.example</code> from a CA that clients trust, with that name in the subject alternative name, and select it with <code>servercert</code>. Renew it before expiry: an expired certificate is a classic cause of "VPN stopped working this morning".</p>

<h3>Who can log in: users and groups</h3>
<p>The FortiGate can authenticate users against several sources:</p>
<ul>
<li><b>Local users</b> created on the FortiGate (<code>config user local</code>), for small setups and break-glass accounts.</li>
<li><b>LDAP or Active Directory</b> servers (<code>config user ldap</code>), where staff already have accounts.</li>
<li><b>RADIUS</b> servers (<code>config user radius</code>), often paired with an MFA product.</li>
<li><b>SAML</b> single sign-on with an identity provider, where available in your release.</li>
<li><b>Client certificates</b>, which can be required in addition to a password.</li>
</ul>
<p>Users go into <b>user groups</b> (<code>config user group</code>). Policies and authentication rules refer to groups, not to individual users, so adding a new employee means adding them to a group in the directory, with no firewall change. For firewall authentication more broadly see <b>nse4-auth</b>.</p>

<h3>Multi-factor authentication (MFA)</h3>
<p>A password alone is not enough for an internet-facing service. Add a second factor: a <b>FortiToken</b> (hardware or mobile), an email or SMS token, or a token served by RADIUS or SAML. For a local user the setting is <code>two-factor</code> in the user definition. Do not make the second factor optional for staff, and make sure that service accounts and break-glass accounts are carefully controlled and monitored.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Authentication sequence">
<rect x="10" y="50" width="105" height="55" rx="10" fill="#bae6fd"/><text x="62" y="82" text-anchor="middle" class="svg-ink" font-size="12">User</text>
<rect x="135" y="50" width="115" height="55" rx="10" fill="#bbf7d0"/><text x="192" y="75" text-anchor="middle" class="svg-ink" font-size="12">TLS to gateway</text><text x="192" y="93" text-anchor="middle" class="svg-muted" font-size="11">server cert</text>
<rect x="270" y="50" width="115" height="55" rx="10" fill="#fde68a"/><text x="327" y="75" text-anchor="middle" class="svg-ink" font-size="12">Password</text><text x="327" y="93" text-anchor="middle" class="svg-muted" font-size="11">local / LDAP / RADIUS</text>
<rect x="405" y="50" width="105" height="55" rx="10" fill="#fed7aa"/><text x="457" y="82" text-anchor="middle" class="svg-ink" font-size="12">MFA token</text>
<rect x="530" y="50" width="100" height="55" rx="10" fill="#ddd6fe"/><text x="580" y="75" text-anchor="middle" class="svg-ink" font-size="12">Group, portal,</text><text x="580" y="93" text-anchor="middle" class="svg-ink" font-size="12">policy</text>
<line x1="115" y1="78" x2="135" y2="78" stroke="#64748b" stroke-width="2"/><line x1="250" y1="78" x2="270" y2="78" stroke="#64748b" stroke-width="2"/><line x1="385" y1="78" x2="405" y2="78" stroke="#64748b" stroke-width="2"/><line x1="510" y1="78" x2="530" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Each stage can fail separately and leaves its own log entry</text>
</svg><p class="cap">The login journey, from certificate check to group and portal.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># A local test user with a second factor, and a group</span>
config user local
    edit "trainer1"
        set type password
        set passwd "Placeholder-Change-Me-1"
        set two-factor fortitoken
    next
end
config user group
    edit "SSLVPN-Users"
        set member "trainer1"
    next
end

<span class="c"># SSL VPN settings and the group to portal mapping</span>
config vpn ssl settings
    set servercert "vpn-company-example-cert"
    set source-interface "port1"
    set port 10443
    set tunnel-ip-pools "SSLVPN-POOL"
    set dns-server1 10.10.0.10
    config authentication-rule
        edit 1
            set groups "SSLVPN-Users"
            set portal "tunnel-access"
        next
    end
end</pre>
<p>Using a non-default port such as 10443 avoids a clash with the administration GUI on 443 and removes some noise from automated scans, but it is not a security control on its own. If you also expose administration on the same interface, restrict it: <code>set allowaccess ping</code> is safer than adding h&#116;tps or ssh on an internet-facing port.</p>

<div class="eg"><p><b>Worked example.</b> Staff report certificate warnings after a firewall rebuild. The rebuilt FortiGate fell back to the default self-signed certificate because the <code>servercert</code> setting was lost. The administrator imported the certificate for vpn.company.example, selected it in the settings, and the warnings disappeared. Users were reminded to report unexpected certificate warnings, since a warning can mean a fake gateway.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving the default self-signed certificate. A pool that overlaps a home network range such as 192.168.1.0/24. Allowing any source address when staff are only in a few countries. Optional MFA. A default portal that grants real access to anybody who authenticates.</p></div>
<div class="exam"><p><b>Exam trap.</b> The authentication rule maps a user or group to a portal. If a user logs in but lands on the wrong portal, look at the rule order. If a user cannot log in at all, check the user source, group membership and MFA token before the policy.</p></div>

<div class="scn"><h4>The expired certificate on Monday morning</h4><p>Remote users could not connect on Monday. FortiClient showed a certificate error. The server certificate had expired over the weekend. The administrator installed the renewed certificate and added a calendar reminder and a monitoring check thirty days before expiry.</p><p><b>Lesson:</b> certificate expiry is predictable, so monitor it.</p></div>

<div class="iv"><p class="q">"How do you secure SSL VPN authentication?"</p><p>A trusted server certificate, users from the directory in groups, MFA for everyone, an authentication rule per group mapping to a least-privilege portal, source address restrictions where possible, and logging with alerts on repeated failures. I would also keep break-glass accounts few and monitored.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Settings define the listener: interface, port, certificate, pool, DNS.</li>
<li>Use a certificate from a trusted CA, and monitor its expiry.</li>
<li>Authenticate with local, LDAP, RADIUS or SAML users in groups; add MFA.</li>
<li>Authentication rules map groups to portals.</li>
<li>Restrict source addresses and avoid exposing administration on the same port.</li>
</ul></div>
`,hi:`
<p>Ab engine room: woh SSL VPN <b>settings</b> jo FortiGate ko listen karwate hain, aur woh <b>authentication</b> jo tay karti hai ki andar kaun jaayega. Zyadatar real SSL VPN incidents yahin se shuru hote hain, ya to isliye ki koi user login nahi kar paata, ya isliye ki koi aisa insaan login kar leta hai jo nahi kar sakna chahiye tha. Reference configuration <b>simulator mein nahi chalaye gaye</b>.</p>

<h3>Jo settings matter karti hain</h3>
<table class="cmp"><tr><th>Setting</th><th>Yeh kya karti hai</th><th>Good practice</th></tr>
<tr><td><code>source-interface</code></td><td>Woh interface jahan service listen karti hai, aam taur par internet-facing</td><td>Sirf woh WAN interface jahan users pahunchte hain</td></tr>
<tr><td><code>source-address</code></td><td>Kaun se client source addresses connect kar sakte hain</td><td>Jahan ho sake country ya known ranges se restrict karo</td></tr>
<tr><td><code>port</code></td><td>Service ka TCP port, default 443</td><td>Same address par administration GUI se clash se bacho</td></tr>
<tr><td><code>servercert</code></td><td>Clients ko dikhaya jaane wala certificate</td><td>Trusted CA ka sahi naam wala certificate, default self-signed nahi</td></tr>
<tr><td><code>tunnel-ip-pools</code></td><td>Tunnel-mode clients ko diye jaane wale addresses</td><td>Private range jo LAN ya aam home networks se overlap na kare</td></tr>
<tr><td><code>default-portal</code></td><td>Un users ka portal jo kisi authentication rule se match nahi karte</td><td>Unset chhodo ya harmless portal par point karo</td></tr>
<tr><td><code>authentication-rule</code></td><td>Users ya groups ko portals se map karta hai</td><td>Har group ke liye ek rule, sabse specific pehle</td></tr>
<tr><td><code>dns-server1</code>, <code>dns-server2</code></td><td>Tunnel clients ko diya jaane wala DNS</td><td>Internal DNS taaki internal names resolve hon</td></tr></table>

<h3>Server certificate</h3>
<p>Clients credentials bhejne se pehle certificate check karte hain. Built-in self-signed certificate chhodoge to har user ko warning dikhegi, woh warnings par click karna seekh jaayega, aur attacker ka fake gateway pakadna mushkil ho jaayega. <code>vpn.company.example</code> ke liye clients ke trusted CA ka certificate install karo, subject alternative name mein woh naam ke saath, aur use <code>servercert</code> se select karo. Expiry se pehle renew karo: expired certificate "aaj subah se VPN band hai" ka classic karan hai.</p>

<h3>Login kaun kar sakta hai: users aur groups</h3>
<p>FortiGate kai sources se users authenticate kar sakta hai:</p>
<ul>
<li>FortiGate par bane <b>local users</b> (<code>config user local</code>), chhote setups aur break-glass accounts ke liye.</li>
<li><b>LDAP ya Active Directory</b> servers (<code>config user ldap</code>), jahan staff ke accounts pehle se hain.</li>
<li><b>RADIUS</b> servers (<code>config user radius</code>), aksar MFA product ke saath.</li>
<li>Identity provider ke saath <b>SAML</b> single sign-on, jahan aapke release mein available ho.</li>
<li><b>Client certificates</b>, jo password ke alawa maange ja sakte hain.</li>
</ul>
<p>Users <b>user groups</b> (<code>config user group</code>) mein jaate hain. Policies aur authentication rules groups ko refer karti hain, individual users ko nahi, isliye naye employee ko directory mein group mein add karne par firewall change nahi chahiye. Firewall authentication ke liye <b>nse4-auth</b> dekho.</p>

<h3>Multi-factor authentication (MFA)</h3>
<p>Internet-facing service ke liye sirf password kaafi nahi. Second factor add karo: <b>FortiToken</b> (hardware ya mobile), email ya SMS token, ya RADIUS ya SAML se mila token. Local user ke liye setting user definition mein <code>two-factor</code> hai. Staff ke liye second factor optional mat rakho, aur dhyaan rakho ki service accounts aur break-glass accounts ko dhyaan se control aur monitor kiya jaaye.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Authentication sequence">
<rect x="10" y="50" width="105" height="55" rx="10" fill="#bae6fd"/><text x="62" y="82" text-anchor="middle" class="svg-ink" font-size="12">User</text>
<rect x="135" y="50" width="115" height="55" rx="10" fill="#bbf7d0"/><text x="192" y="75" text-anchor="middle" class="svg-ink" font-size="12">TLS gateway tak</text><text x="192" y="93" text-anchor="middle" class="svg-muted" font-size="11">server cert</text>
<rect x="270" y="50" width="115" height="55" rx="10" fill="#fde68a"/><text x="327" y="75" text-anchor="middle" class="svg-ink" font-size="12">Password</text><text x="327" y="93" text-anchor="middle" class="svg-muted" font-size="11">local / LDAP / RADIUS</text>
<rect x="405" y="50" width="105" height="55" rx="10" fill="#fed7aa"/><text x="457" y="82" text-anchor="middle" class="svg-ink" font-size="12">MFA token</text>
<rect x="530" y="50" width="100" height="55" rx="10" fill="#ddd6fe"/><text x="580" y="75" text-anchor="middle" class="svg-ink" font-size="12">Group, portal,</text><text x="580" y="93" text-anchor="middle" class="svg-ink" font-size="12">policy</text>
<line x1="115" y1="78" x2="135" y2="78" stroke="#64748b" stroke-width="2"/><line x1="250" y1="78" x2="270" y2="78" stroke="#64748b" stroke-width="2"/><line x1="385" y1="78" x2="405" y2="78" stroke="#64748b" stroke-width="2"/><line x1="510" y1="78" x2="530" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Har stage alag se fail ho sakta hai aur apni log entry chhodta hai</text>
</svg><p class="cap">Login ka safar, certificate check se group aur portal tak.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># Second factor wala local test user, aur ek group</span>
config user local
    edit "trainer1"
        set type password
        set passwd "Placeholder-Change-Me-1"
        set two-factor fortitoken
    next
end
config user group
    edit "SSLVPN-Users"
        set member "trainer1"
    next
end

<span class="c"># SSL VPN settings aur group se portal mapping</span>
config vpn ssl settings
    set servercert "vpn-company-example-cert"
    set source-interface "port1"
    set port 10443
    set tunnel-ip-pools "SSLVPN-POOL"
    set dns-server1 10.10.0.10
    config authentication-rule
        edit 1
            set groups "SSLVPN-Users"
            set portal "tunnel-access"
        next
    end
end</pre>
<p>10443 jaisa non-default port 443 par administration GUI se clash se bachata hai aur automated scans ka kuch noise ghatata hai, lekin yeh akela security control nahi hai. Administration bhi usi interface par expose karte ho to use restrict karo: internet-facing port par h&#116;tps ya ssh add karne se <code>set allowaccess ping</code> safer hai.</p>

<div class="eg"><p><b>Worked example.</b> Firewall rebuild ke baad staff certificate warnings report karta hai. Rebuilt FortiGate default self-signed certificate par wapas chala gaya kyunki <code>servercert</code> setting kho gayi thi. Administrator ne vpn.company.example ka certificate import kiya, settings mein select kiya, aur warnings gayab ho gayi. Users ko yaad dilaya gaya ki unexpected certificate warning report karein, kyunki warning ka matlab fake gateway ho sakta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Default self-signed certificate chhodna. Pool jo home network range jaise 192.168.1.0/24 se overlap kare. Jab staff sirf kuch countries mein hai tab bhi koi bhi source address allow karna. Optional MFA. Default portal jo authenticate hone wale har kisi ko asli access de.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authentication rule user ya group ko portal se map karta hai. User login karke galat portal par pahunche to rule order dekho. User login hi na kar paaye to policy se pehle user source, group membership aur MFA token check karo.</p></div>

<div class="scn"><h4>Monday subah expired certificate</h4><p>Monday ko remote users connect nahi kar paaye. FortiClient ne certificate error dikhaya. Server certificate weekend mein expire ho gaya tha. Administrator ne renewed certificate install kiya aur expiry se tees din pehle ka calendar reminder aur monitoring check add kiya.</p><p><b>Lesson:</b> certificate expiry predictable hai, isliye use monitor karo.</p></div>

<div class="iv"><p class="q">"SSL VPN authentication ko secure kaise karte ho?"</p><p>Trusted server certificate, groups mein directory se users, sab ke liye MFA, har group ke liye least-privilege portal se map karta authentication rule, jahan ho sake source address restrictions, aur baar-baar failures par alerts ke saath logging. Main break-glass accounts kam aur monitored bhi rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Settings listener define karti hain: interface, port, certificate, pool, DNS.</li>
<li>Trusted CA ka certificate use karo aur uski expiry monitor karo.</li>
<li>Local, LDAP, RADIUS ya SAML users groups mein authenticate karo; MFA add karo.</li>
<li>Authentication rules groups ko portals se map karte hain.</li>
<li>Source addresses restrict karo aur administration ko same port par expose mat karo.</li>
</ul></div>
`}};export{e as default};