var e={id:`architecture`,h:{en:`Cisco Secure Access architecture: tenant, on-ramps, identities and the console`,hi:`Cisco Secure Access architecture: tenant, on-ramps, identities aur console`},body:{en:`
<p>Think of a courier company with hubs in many cities. Your company has an <b>account</b> with it. Parcels reach a hub in different ways: a truck from your warehouse, a rider who picks up from a home, or a drop box. At the hub, the same rule book for your account decides what is accepted, and a tracking system logs every parcel. Cisco Secure Access works the same way: your organization is a tenant, traffic arrives through several <b>on-ramps</b>, one policy decides, and Activity Search tracks everything.</p>

<h3>The tenant and the cloud</h3>
<p>Secure Access runs in Cisco data centers around the world. Each customer is an <b>organization</b> (tenant) with an <b>org ID</b>. In our labs the organization is <b>MyPnetLab, org 8195126</b>, using the <b>Asia Pacific (Mumbai)</b> data center, whose network tunnel head-end is <b>146.112.0.10</b>. Roaming DNS goes to the Secure Access anycast resolvers <b>208.67.222.222</b> and <b>208.67.220.220</b>. Anycast means the same address is announced from many data centers, so a laptop in Pune and one in Singapore both reach their nearest resolver.</p>

<h3>The on-ramps: how traffic reaches Secure Access</h3>
<table class="cmp"><tr><th>On-ramp</th><th>How it works</th><th>Identity in the logs</th></tr>
<tr><td><b>Network connection</b> (network tunnel group)</td><td>IPsec IKEv2 tunnels from a branch router, firewall or SD-WAN edge to a Secure Access head-end, authenticated with a <b>tunnel ID</b> (an e-mail-style IKE identity) and a <b>passphrase</b> (pre-shared key). Static or BGP routing tells Secure Access which private prefixes are behind the tunnel.</td><td>The tunnel group, for example BRANCH-DEL</td></tr>
<tr><td><b>Roaming computer</b></td><td>Cisco Secure Client with the internet security (roaming) module sends DNS to the Secure Access resolvers and web traffic to the SWG on any network.</td><td>The signed-in user, or the computer name</td></tr>
<tr><td><b>Zero Trust Access client</b></td><td>The Secure Client Zero Trust Access module sends traffic for private resources to Secure Access after the device is enrolled.</td><td>The user</td></tr>
<tr><td><b>Browser-based access</b></td><td>An unmanaged device opens a public URL for one private web app and signs in with SAML.</td><td>The user</td></tr>
<tr><td><b>Remote access VPN</b></td><td>Secure Client VPN module terminates on Secure Access instead of an on-premises head-end.</td><td>The user</td></tr>
<tr><td><b>Proxy chaining or PAC file</b></td><td>An existing on-premises proxy or an explicit browser proxy setting forwards web traffic.</td><td>The proxy, or the SAML user</td></tr>
</table>

<h3>The private side: resource connectors</h3>
<p>Private apps (the ERP in our data center) are reached through <b>resource connectors</b>: small virtual machines that you deploy next to the apps. Each connector makes an <b>outbound</b> connection to Secure Access. When an authorised user asks for the ERP, Secure Access stitches the user session to a connector, and the connector opens the TCP session to the app. Nothing listens on the internet, no inbound firewall hole is opened, and the user never gets an IP on the data-center network.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Secure Access on-ramps">
<rect x="10" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="12">BRANCH (IPsec)</text>
<rect x="10" y="75" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="12">ROAM1 (Secure Client)</text>
<rect x="10" y="130" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="155" text-anchor="middle" class="svg-ink" font-size="12">TABLET (browser)</text>
<rect x="210" y="40" width="200" height="140" rx="10" fill="#ddd6fe"/><text x="310" y="65" text-anchor="middle" class="svg-ink" font-size="13">Secure Access</text><text x="310" y="88" text-anchor="middle" class="svg-muted" font-size="12">org 8195126, Mumbai</text><text x="310" y="110" text-anchor="middle" class="svg-muted" font-size="12">head-end 146.112.0.10</text><text x="310" y="132" text-anchor="middle" class="svg-muted" font-size="12">one access policy</text><text x="310" y="154" text-anchor="middle" class="svg-muted" font-size="12">one Activity Search</text>
<rect x="480" y="30" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="555" y="55" text-anchor="middle" class="svg-ink" font-size="12">Internet and SaaS</text>
<rect x="480" y="150" width="150" height="40" rx="8" fill="#fde68a"/><text x="555" y="175" text-anchor="middle" class="svg-ink" font-size="12">RC1 then ERP</text>
<line x1="140" y1="40" x2="210" y2="80" stroke="#64748b" stroke-width="2"/><line x1="140" y1="95" x2="210" y2="110" stroke="#64748b" stroke-width="2"/><line x1="140" y1="150" x2="210" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="80" x2="480" y2="50" stroke="#64748b" stroke-width="2"/><line x1="480" y1="170" x2="410" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="445" y="225" text-anchor="middle" class="svg-muted" font-size="12">dashed: the connector dials out; no inbound port</text>
</svg><p class="cap">Three of the on-ramps used in the labs, and the two destinations: internet or SaaS, and private apps through a resource connector.</p></div>

<h3>Identities: who is the user?</h3>
<p>Policy by user and group needs a directory. Secure Access learns identities in two steps. <b>Provisioning</b> imports users and groups, typically from Microsoft Entra ID or another IdP with <b>SCIM</b>, or from on-premises Active Directory with a connector; you can also add users manually. <b>Authentication</b> proves who is at the keyboard, through <b>SAML</b> single sign-on with your identity provider (often with Duo MFA). In the labs Vikram Singh is in group Sales, Asha Verma and Neha Kapoor are in Finance, and Rohit Mehra is in Engineering.</p>

<h3>A tour of the console</h3>
<p>Open the SECURE-ACCESS tab in any lab. The left menu matches the real product's structure:</p>
<table class="cmp"><tr><th>Menu</th><th>Pages</th><th>Used for</th></tr>
<tr><td><b>Overview</b></td><td>Overview</td><td>Health of connections, top blocks, a Get started checklist</td></tr>
<tr><td><b>Connect</b></td><td>Network Connections, Users and Groups, End User Connectivity</td><td>Tunnels from branches, identities, Secure Client settings</td></tr>
<tr><td><b>Resources</b></td><td>Destination Lists, Private Resources, Applications</td><td>Reusable lists, private apps and connector groups, the app and category catalog</td></tr>
<tr><td><b>Secure</b></td><td>Access Policy, Security Profiles, DLP &amp; AI Guardrails</td><td>Internet and private rules, security categories and decryption, data rules</td></tr>
<tr><td><b>Monitor</b></td><td>Activity Search, Reports</td><td>Every event with identity, rule and reason; summaries</td></tr>
<tr><td><b>Investigate</b></td><td>Investigate</td><td>Risk score and indicators for a domain or IP</td></tr>
</table>
<p>The tenant also has a read-only console on the SECURE-ACCESS device (type <code>help</code>):</p>
<pre class="out">SECURE-ACCESS&gt; help
Secure Access tenant console (read-only; configure in the Secure Access tab)
  show tunnels          network connections and IKEv2 status
  show roaming          roaming computers
  show policy [private] access rules
  show activity [N]     latest events
  show dlp              DLP and AI guardrail events
  show connectors       resource connector groups
  investigate &lt;domain&gt;  risk score and indicators</pre>

<div class="eg"><p><b>Worked example: the lab addressing.</b> The ISP router connects everything. BRANCH uses 203.0.113.2/29 on Gi0/0 (gateway 203.0.113.1) and 10.10.1.1/24 for the LAN where PC-BR1 is 10.10.1.10. Home users sit on 198.51.100.0/24: ROAM1 .20, ROAM2 .21, TABLET .30. The data center edge DC-EDGE uses 203.0.113.10/29 and 10.20.1.0/24, where RC1 is .20 and the ERP is .50. Secure Access itself sits behind the ISP at 146.112.0.10.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing user-based rules before users can be identified. Traffic that arrives through a network tunnel is identified as the tunnel group, not as a person, unless you add user authentication. A rule "group Sales, allow CRM" will never match a branch PC whose only identity is BRANCH-DEL.</p></div>

<div class="exam"><p><b>Exam traps.</b> Resource connectors connect <b>outbound</b>; no inbound NAT is needed. SCIM provisions identities; SAML authenticates them. The IKE identity of a network tunnel is the tunnel ID, not the router's IP address.</p></div>

<div class="scn"><h4>The rule that matched nobody</h4><p>A retailer wrote "Store Managers may use the Streaming Video category" and tested from a store PC behind the branch tunnel. It was still blocked. Activity Search showed the identity as the tunnel group STORE-114, not a user, so the group rule could not match. The engineer added a rule by tunnel group for store PCs and kept the user-group rule for managers' roaming laptops.</p><p><b>Lesson:</b> always check which identity Secure Access actually sees before writing an identity-based rule.</p></div>

<div class="iv"><p class="q">"How does traffic get into Cisco Secure Access, and how does it reach private apps?"</p><p>Strong answer: list the on-ramps (IPsec IKEv2 network tunnels from routers, firewalls or SD-WAN; Secure Client roaming and Zero Trust Access modules; browser-based access; RAVPN; proxy chaining) and say which identity each gives. Then explain resource connectors: VMs next to the app that dial out to Secure Access, so there is no inbound exposure and the user never joins the network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each customer is an organization (org ID) in a global, anycast cloud.</li>
<li>On-ramps: network tunnels, Secure Client roaming and ZTNA modules, browser access, RAVPN, proxy chaining.</li>
<li>Resource connectors reach private apps by dialling out; nothing inbound is exposed.</li>
<li>SCIM provisions users and groups; SAML authenticates them.</li>
<li>Console menus: Connect, Resources, Secure, Monitor, Investigate.</li>
</ul></div>
`,hi:`
<p>Ek courier company socho jiske hubs bahut saare shehron mein hain. Aapki company ka us company mein ek <b>account</b> hai. Parcels hub tak alag-alag tareekon se pahunchte hain: aapke warehouse se truck, ghar se pick-up karne wala rider, ya drop box. Hub par aapke account ki same rule book decide karti hai kya accept hoga, aur tracking system har parcel log karta hai. Cisco Secure Access bhi aise hi kaam karta hai: aapki organization ek tenant hai, traffic kai <b>on-ramps</b> se aata hai, ek policy decide karti hai, aur Activity Search sab track karta hai.</p>

<h3>Tenant aur cloud</h3>
<p>Secure Access duniya bhar ke Cisco data centers mein chalta hai. Har customer ek <b>organization</b> (tenant) hai jiska ek <b>org ID</b> hota hai. Hamari labs mein organization hai <b>MyPnetLab, org 8195126</b>, jo <b>Asia Pacific (Mumbai)</b> data center use karti hai, jiska network tunnel head-end <b>146.112.0.10</b> hai. Roaming DNS Secure Access anycast resolvers <b>208.67.222.222</b> aur <b>208.67.220.220</b> par jaata hai. Anycast ka matlab hai same address bahut saare data centers se announce hota hai, isliye Pune ka laptop aur Singapore ka laptop dono apne sabse paas wale resolver tak pahunchte hain.</p>

<h3>On-ramps: traffic Secure Access tak kaise pahunchta hai</h3>
<table class="cmp"><tr><th>On-ramp</th><th>Kaise kaam karta hai</th><th>Logs mein identity</th></tr>
<tr><td><b>Network connection</b> (network tunnel group)</td><td>Branch router, firewall ya SD-WAN edge se Secure Access head-end tak IPsec IKEv2 tunnels, <b>tunnel ID</b> (e-mail jaisi IKE identity) aur <b>passphrase</b> (pre-shared key) se authenticated. Static ya BGP routing Secure Access ko batati hai ki tunnel ke peeche kaunse private prefixes hain.</td><td>Tunnel group, jaise BRANCH-DEL</td></tr>
<tr><td><b>Roaming computer</b></td><td>Internet security (roaming) module wala Cisco Secure Client kisi bhi network par DNS ko Secure Access resolvers par aur web traffic ko SWG par bhejta hai.</td><td>Signed-in user, ya computer name</td></tr>
<tr><td><b>Zero Trust Access client</b></td><td>Device enroll hone ke baad Secure Client ka Zero Trust Access module private resources ka traffic Secure Access ko bhejta hai.</td><td>User</td></tr>
<tr><td><b>Browser-based access</b></td><td>Unmanaged device ek private web app ka public URL kholta hai aur SAML se sign in karta hai.</td><td>User</td></tr>
<tr><td><b>Remote access VPN</b></td><td>Secure Client VPN module on-premises head-end ki jagah Secure Access par terminate hota hai.</td><td>User</td></tr>
<tr><td><b>Proxy chaining ya PAC file</b></td><td>Existing on-premises proxy ya explicit browser proxy setting web traffic forward karti hai.</td><td>Proxy, ya SAML user</td></tr>
</table>

<h3>Private side: resource connectors</h3>
<p>Private apps (hamare data center ka ERP) <b>resource connectors</b> ke through pahunche jaate hain: chhoti virtual machines jo aap apps ke paas deploy karte ho. Har connector Secure Access ki taraf <b>outbound</b> connection banata hai. Jab authorised user ERP maangta hai, Secure Access user session ko connector se jodta hai, aur connector app tak TCP session kholta hai. Internet par kuch listen nahi karta, koi inbound firewall hole nahi khulta, aur user ko data-center network par kabhi IP nahi milta.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Secure Access on-ramps">
<rect x="10" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="12">BRANCH (IPsec)</text>
<rect x="10" y="75" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="12">ROAM1 (Secure Client)</text>
<rect x="10" y="130" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="155" text-anchor="middle" class="svg-ink" font-size="12">TABLET (browser)</text>
<rect x="210" y="40" width="200" height="140" rx="10" fill="#ddd6fe"/><text x="310" y="65" text-anchor="middle" class="svg-ink" font-size="13">Secure Access</text><text x="310" y="88" text-anchor="middle" class="svg-muted" font-size="12">org 8195126, Mumbai</text><text x="310" y="110" text-anchor="middle" class="svg-muted" font-size="12">head-end 146.112.0.10</text><text x="310" y="132" text-anchor="middle" class="svg-muted" font-size="12">ek access policy</text><text x="310" y="154" text-anchor="middle" class="svg-muted" font-size="12">ek Activity Search</text>
<rect x="480" y="30" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="555" y="55" text-anchor="middle" class="svg-ink" font-size="12">Internet aur SaaS</text>
<rect x="480" y="150" width="150" height="40" rx="8" fill="#fde68a"/><text x="555" y="175" text-anchor="middle" class="svg-ink" font-size="12">RC1 phir ERP</text>
<line x1="140" y1="40" x2="210" y2="80" stroke="#64748b" stroke-width="2"/><line x1="140" y1="95" x2="210" y2="110" stroke="#64748b" stroke-width="2"/><line x1="140" y1="150" x2="210" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="80" x2="480" y2="50" stroke="#64748b" stroke-width="2"/><line x1="480" y1="170" x2="410" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="445" y="225" text-anchor="middle" class="svg-muted" font-size="12">dashed: connector dial out karta hai; koi inbound port nahi</text>
</svg><p class="cap">Labs mein use hone wale teen on-ramps, aur do destinations: internet ya SaaS, aur resource connector ke through private apps.</p></div>

<h3>Identities: user kaun hai?</h3>
<p>User aur group ke hisaab se policy ke liye directory chahiye. Secure Access identities do steps mein seekhta hai. <b>Provisioning</b> users aur groups import karta hai, aam taur par Microsoft Entra ID ya kisi aur IdP se <b>SCIM</b> ke through, ya connector ke saath on-premises Active Directory se; aap users manually bhi add kar sakte ho. <b>Authentication</b> saabit karta hai ki keyboard par kaun hai, aapke identity provider ke saath <b>SAML</b> single sign-on se (aksar Duo MFA ke saath). Labs mein Vikram Singh group Sales mein hai, Asha Verma aur Neha Kapoor Finance mein, aur Rohit Mehra Engineering mein.</p>

<h3>Console ka tour</h3>
<p>Kisi bhi lab mein SECURE-ACCESS tab kholo. Left menu real product ke structure se match karta hai:</p>
<table class="cmp"><tr><th>Menu</th><th>Pages</th><th>Kis kaam ke liye</th></tr>
<tr><td><b>Overview</b></td><td>Overview</td><td>Connections ki health, top blocks, Get started checklist</td></tr>
<tr><td><b>Connect</b></td><td>Network Connections, Users and Groups, End User Connectivity</td><td>Branches se tunnels, identities, Secure Client settings</td></tr>
<tr><td><b>Resources</b></td><td>Destination Lists, Private Resources, Applications</td><td>Reusable lists, private apps aur connector groups, app aur category catalog</td></tr>
<tr><td><b>Secure</b></td><td>Access Policy, Security Profiles, DLP &amp; AI Guardrails</td><td>Internet aur private rules, security categories aur decryption, data rules</td></tr>
<tr><td><b>Monitor</b></td><td>Activity Search, Reports</td><td>Har event identity, rule aur reason ke saath; summaries</td></tr>
<tr><td><b>Investigate</b></td><td>Investigate</td><td>Domain ya IP ka risk score aur indicators</td></tr>
</table>
<p>Tenant ka SECURE-ACCESS device par ek read-only console bhi hai (<code>help</code> type karo):</p>
<pre class="out">SECURE-ACCESS&gt; help
Secure Access tenant console (read-only; configure in the Secure Access tab)
  show tunnels          network connections and IKEv2 status
  show roaming          roaming computers
  show policy [private] access rules
  show activity [N]     latest events
  show dlp              DLP and AI guardrail events
  show connectors       resource connector groups
  investigate &lt;domain&gt;  risk score and indicators</pre>

<div class="eg"><p><b>Worked example: lab addressing.</b> ISP router sabko jodta hai. BRANCH Gi0/0 par 203.0.113.2/29 (gateway 203.0.113.1) aur LAN ke liye 10.10.1.1/24 use karta hai jahan PC-BR1 10.10.1.10 hai. Home users 198.51.100.0/24 par hain: ROAM1 .20, ROAM2 .21, TABLET .30. Data center edge DC-EDGE 203.0.113.10/29 aur 10.20.1.0/24 use karta hai, jahan RC1 .20 hai aur ERP .50. Secure Access khud ISP ke peeche 146.112.0.10 par hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Users identify hone se pehle user-based rules likhna. Network tunnel se aane wala traffic tunnel group ki tarah identify hota hai, insaan ki tarah nahi, jab tak aap user authentication add na karo. Rule "group Sales, allow CRM" kabhi us branch PC se match nahi karega jiski identity sirf BRANCH-DEL hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Resource connectors <b>outbound</b> connect karte hain; koi inbound NAT nahi chahiye. SCIM identities provision karta hai; SAML unhe authenticate karta hai. Network tunnel ki IKE identity tunnel ID hai, router ka IP address nahi.</p></div>

<div class="scn"><h4>Woh rule jo kisi se match nahi hua</h4><p>Ek retailer ne likha "Store Managers Streaming Video category use kar sakte hain" aur branch tunnel ke peeche store PC se test kiya. Ab bhi blocked. Activity Search ne identity tunnel group STORE-114 dikhayi, user nahi, isliye group rule match nahi ho sakta tha. Engineer ne store PCs ke liye tunnel group wala rule joda aur managers ke roaming laptops ke liye user-group rule rakha.</p><p><b>Seekh:</b> identity-based rule likhne se pehle hamesha check karo ki Secure Access asal mein kaunsi identity dekhta hai.</p></div>

<div class="iv"><p class="q">"Traffic Cisco Secure Access mein kaise aata hai, aur private apps tak kaise pahunchta hai?"</p><p>Strong answer: on-ramps list karo (routers, firewalls ya SD-WAN se IPsec IKEv2 network tunnels; Secure Client roaming aur Zero Trust Access modules; browser-based access; RAVPN; proxy chaining) aur batao har ek kaunsi identity deta hai. Phir resource connectors samjhao: app ke paas VMs jo Secure Access ki taraf dial out karte hain, isliye koi inbound exposure nahi aur user kabhi network join nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har customer ek global, anycast cloud mein ek organization (org ID) hai.</li>
<li>On-ramps: network tunnels, Secure Client roaming aur ZTNA modules, browser access, RAVPN, proxy chaining.</li>
<li>Resource connectors dial out karke private apps tak pahunchte hain; kuch bhi inbound expose nahi hota.</li>
<li>SCIM users aur groups provision karta hai; SAML unhe authenticate karta hai.</li>
<li>Console menus: Connect, Resources, Secure, Monitor, Investigate.</li>
</ul></div>
`}};export{e as default};