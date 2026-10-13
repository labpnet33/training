var e={id:`group-policy`,h:{en:`Group policy, split tunnelling, DNS and Secure Client modules`,hi:`Group policy, split tunnelling, DNS aur Secure Client modules`},body:{en:`
<p>Once the visitor is through reception, the <b>welcome pack</b> decides their day: which floors their badge opens, which phone directory they use, whether personal errands must also go through the office or can be done directly. On the Threat Defense that welcome pack is the <b>group policy</b>. It is pushed to Secure Client when the tunnel comes up.</p>

<h3>What a group policy contains</h3>
<p>Every connection profile points to one group policy; if you never choose one, users get <b>DfltGrpPolicy</b>, which tunnels all traffic. In the lab Management Center, <b>Devices → VPN · Remote Access → Group Policies → Add</b> opens a dialog with Name, Banner (optional), <b>IPv4 Split Tunneling</b>, <b>Split Tunnel Network List</b>, <b>DNS Server</b> and <b>Default Domain</b>. Production group policies also hold idle and session timeouts, simultaneous login limits, a VPN filter ACL, the Secure Client profile and modules, and client firewall rules.</p>

<h3>Split tunnelling: three choices</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Split include versus tunnel all">
<rect x="10" y="90" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="65" y="117" text-anchor="middle" class="svg-ink" font-size="12">HOME-PC</text>
<rect x="250" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="315" y="47" text-anchor="middle" class="svg-ink" font-size="12">NK-FTD tunnel</text>
<rect x="470" y="20" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="550" y="47" text-anchor="middle" class="svg-ink" font-size="12">SRV1 10.0.1.20</text>
<rect x="470" y="160" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="550" y="187" text-anchor="middle" class="svg-ink" font-size="12">internet 8.8.8.8</text>
<line x1="120" y1="105" x2="250" y2="45" stroke="#0284c7" stroke-width="2"/><line x1="380" y1="42" x2="470" y2="42" stroke="#0284c7" stroke-width="2"/>
<line x1="120" y1="120" x2="470" y2="180" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="200" y="60" text-anchor="middle" class="svg-accent" font-size="12">10.0.1.0/24: tunnel</text>
<text x="300" y="175" text-anchor="middle" class="svg-muted" font-size="12">everything else: direct from home</text>
</svg><p class="cap">Split include: only company networks use the tunnel. With tunnel all, the dashed path would also go through NK-FTD.</p></div>
<table class="cmp"><tr><th>IPv4 Split Tunneling</th><th>Device command</th><th>Effect</th><th>Trade-off</th></tr>
<tr><td>Allow all traffic over tunnel</td><td>split-tunnel-policy tunnelall</td><td>a default route through the tunnel</td><td>full inspection and logging; more load; internet traffic needs U-turn (hairpin) NAT on outside</td></tr>
<tr><td>Tunnel networks specified below</td><td>tunnelspecified</td><td>only the listed networks use the tunnel (split include)</td><td>efficient; internet traffic is not inspected by the firewall</td></tr>
<tr><td>Exclude networks specified below</td><td>excludespecified</td><td>everything except the listed networks (split exclude)</td><td>good for heavy SaaS such as video calls; keep the list short</td></tr></table>
<p>The selected networks become a standard ACL, for example <code>access-list GP-Employees_splitAcl standard permit 10.0.1.0 255.255.255.0</code>, referenced by <code>split-tunnel-network-list value GP-Employees_splitAcl</code>. Production releases also support <b>dynamic split tunnelling</b>, which includes or excludes <b>domains</b> (for example a SaaS service) instead of IP prefixes.</p>

<h3>DNS for VPN users</h3>
<p>The <b>DNS Server</b> and <b>Default Domain</b> are pushed while connected, so <code>intranet.nwk.lab</code> resolves through the company resolver (10.0.1.20). With split include, also think about <b>split DNS</b>: only company domains go to the company resolver, everything else to the home resolver. If you push a company DNS server but tunnel only 10.0.1.0/24, make sure the DNS server is inside that list, or name resolution breaks.</p>

<div class="eg"><p><b>Worked example (remote access lab).</b> GP-Employees: Tunnel networks specified below = INSIDE-NET, DNS 10.0.1.20, domain nwk.lab. After connecting, <code>vpn stats</code> on HOME-PC shows:</p>
<pre class="out">[ Connection Information ]

    <span class="hl">Tunnel Mode (IPv4):    Split Include</span>
    Tunnel Mode (IPv6):    Drop All Traffic

[ Address Information ]

    Client (IPv4):         10.50.0.10
    Server:                203.0.113.2

[ Transport Information ]

    Protocol:              DTLSv1.2
    Cipher:                ECDHE_RSA_AES_256_GCM_SHA384

[ Secured Routes (IPv4) ]

    <span class="hl">10.0.1.0/24</span>

[ DNS ]

    Server:                10.0.1.20
    Default domain:        nwk.lab</pre>
<p>Prove it: <code>curl 10.0.1.20</code> works and SRV1 sees the request from 10.50.0.10 (the pool), while <code>ping 8.8.8.8</code> leaves directly from 198.51.100.20 (the home address).</p></div>

<h3>Secure Client image and profile</h3>
<p>The <b>image</b> (a .pkg per operating system, chosen in the wizard's Secure Client image step and listed under Objects → VPN Objects → Secure Client File) is offered for web-deploy and upgrades. The <b>client profile</b> is an XML file created with the profile editor and attached to the group policy. It holds the host list users see (display name and FQDN such as vpn.nwk.lab), backup servers, certificate matching, <b>Start Before Login</b>, <b>Always-On</b> (block network access unless the VPN is up) and <b>Trusted Network Detection</b> (connect automatically when off the office network).</p>

<h3>Secure Client modules (concept level)</h3>
<table class="cmp"><tr><th>Module</th><th>What it adds</th></tr>
<tr><td>VPN (AnyConnect VPN)</td><td>the core remote access client: SSL/DTLS or IKEv2</td></tr>
<tr><td>ISE Posture</td><td>checks antivirus, patches, disk encryption; ISE can quarantine non-compliant users with CoA</td></tr>
<tr><td>Umbrella / Secure Access roaming</td><td>DNS-layer and web security when off the VPN or with split tunnel</td></tr>
<tr><td>Network Visibility Module (NVM)</td><td>per-process flow records sent to a collector or Secure Network Analytics</td></tr>
<tr><td>Secure Endpoint</td><td>endpoint detection and response connector</td></tr>
<tr><td>Zero Trust Access</td><td>per-application access through Cisco Secure Access, using QUIC and MASQUE instead of a network tunnel</td></tr>
<tr><td>Network Access Manager, DART</td><td>802.1X wired and wireless supplicant; diagnostics bundle for support cases</td></tr></table>
<p><b>QUIC</b> is a UDP transport with TLS 1.3 built in (HTTP/3 runs on it). <b>MASQUE</b> tunnels IP or UDP inside HTTP/3, so the connection looks like ordinary web traffic on UDP 443 and survives network changes. This is how zero trust network access (ZTNA) gives access to one application instead of a whole network; full-tunnel VPN remains for device management and legacy applications.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to attach the new group policy to the connection profile; split include without the DNS server's network; tunnel all without hairpin NAT, so users lose the internet; split tunnel without any cloud security for the direct internet path.</p></div>

<div class="exam"><p><b>Exam trap.</b> Split include = "Tunnel networks specified below" = tunnelspecified; split exclude = "Exclude networks specified below" = excludespecified. The group policy, not the connection profile, holds split tunnel, DNS and banner. ZTNA with MASQUE is per-application; a VPN is per-network.</p></div>

<div class="scn"><h4>The proxy that never saw her browsing</h4><p>A compliance officer asked why the web proxy logs showed no internet browsing for a remote employee who was online all day over Secure Client. <code>vpn stats</code> on her laptop showed <b>Tunnel Mode (IPv4): Split Include</b> with only 10.0.1.0/24 as a secured route. Her internet traffic left directly from her home router, so neither the firewall nor the proxy saw it. The team kept split include for performance but deployed the Umbrella module so every DNS request was filtered and logged wherever the laptop was.</p><p><b>Lesson:</b> split tunnelling moves internet traffic out of your firewall's view; replace that visibility with endpoint or cloud security.</p></div>

<div class="iv"><p class="q">"Split tunnel or tunnel all for remote workers? Defend your choice."</p><p>Explain both: tunnel all gives full inspection and consistent policy but costs bandwidth, latency and needs hairpin NAT; split include saves bandwidth and improves SaaS performance but the firewall no longer sees internet traffic. A mature answer picks split include or split exclude for SaaS plus Umbrella or Secure Access for the direct path, or tunnel all for high-risk users, and mentions dynamic split tunnelling by domain and ZTNA as the next step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The group policy is what users get: split tunnel, DNS, domain, banner, timeouts, filters, client profile and modules.</li>
<li>Allow all (tunnelall), Tunnel networks specified below (split include), Exclude networks specified below (split exclude).</li>
<li>Push DNS and domain; make sure the DNS server is reachable through the tunnel.</li>
<li>The image is the client package; the XML profile holds host entries, Always-On, Start Before Login and Trusted Network Detection.</li>
<li>Modules add posture, Umbrella, NVM, Secure Endpoint and Zero Trust Access (QUIC/MASQUE).</li>
</ul></div>
`,hi:`
<p>Visitor reception paar kar le, uske baad <b>welcome pack</b> uska din tay karta hai: uska badge kaunse floors kholta hai, kaunsi phone directory use karega, personal kaam bhi office se hokar jaane chahiye ya seedhe ho sakte hain. Threat Defense par woh welcome pack <b>group policy</b> hai. Tunnel up hone par yeh Secure Client ko push hoti hai.</p>

<h3>Group policy mein kya hota hai</h3>
<p>Har connection profile ek group policy ki taraf point karta hai; agar aap kabhi koi nahi chunte, users ko <b>DfltGrpPolicy</b> milti hai, jo saara traffic tunnel karti hai. Lab Management Center mein <b>Devices → VPN · Remote Access → Group Policies → Add</b> ek dialog kholta hai jismein Name, Banner (optional), <b>IPv4 Split Tunneling</b>, <b>Split Tunnel Network List</b>, <b>DNS Server</b> aur <b>Default Domain</b> hain. Production group policies mein idle aur session timeouts, simultaneous login limits, VPN filter ACL, Secure Client profile aur modules, aur client firewall rules bhi hote hain.</p>

<h3>Split tunnelling: teen choices</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Split include versus tunnel all">
<rect x="10" y="90" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="65" y="117" text-anchor="middle" class="svg-ink" font-size="12">HOME-PC</text>
<rect x="250" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="315" y="47" text-anchor="middle" class="svg-ink" font-size="12">NK-FTD tunnel</text>
<rect x="470" y="20" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="550" y="47" text-anchor="middle" class="svg-ink" font-size="12">SRV1 10.0.1.20</text>
<rect x="470" y="160" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="550" y="187" text-anchor="middle" class="svg-ink" font-size="12">internet 8.8.8.8</text>
<line x1="120" y1="105" x2="250" y2="45" stroke="#0284c7" stroke-width="2"/><line x1="380" y1="42" x2="470" y2="42" stroke="#0284c7" stroke-width="2"/>
<line x1="120" y1="120" x2="470" y2="180" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="200" y="60" text-anchor="middle" class="svg-accent" font-size="12">10.0.1.0/24: tunnel</text>
<text x="300" y="175" text-anchor="middle" class="svg-muted" font-size="12">baaki sab: ghar se seedha</text>
</svg><p class="cap">Split include: sirf company networks tunnel use karte hain. Tunnel all mein dashed path bhi NK-FTD se jaata.</p></div>
<table class="cmp"><tr><th>IPv4 Split Tunneling</th><th>Device command</th><th>Asar</th><th>Trade-off</th></tr>
<tr><td>Allow all traffic over tunnel</td><td>split-tunnel-policy tunnelall</td><td>tunnel se default route</td><td>poora inspection aur logging; zyada load; internet traffic ko outside par U-turn (hairpin) NAT chahiye</td></tr>
<tr><td>Tunnel networks specified below</td><td>tunnelspecified</td><td>sirf list ke networks tunnel use karte hain (split include)</td><td>efficient; firewall internet traffic inspect nahi karta</td></tr>
<tr><td>Exclude networks specified below</td><td>excludespecified</td><td>list ke networks chhodkar sab (split exclude)</td><td>video calls jaise heavy SaaS ke liye accha; list chhoti rakho</td></tr></table>
<p>Select kiye networks ek standard ACL bante hain, jaise <code>access-list GP-Employees_splitAcl standard permit 10.0.1.0 255.255.255.0</code>, jise <code>split-tunnel-network-list value GP-Employees_splitAcl</code> refer karta hai. Production releases <b>dynamic split tunnelling</b> bhi support karte hain, jo IP prefixes ki jagah <b>domains</b> (jaise koi SaaS service) include ya exclude karta hai.</p>

<h3>VPN users ke liye DNS</h3>
<p><b>DNS Server</b> aur <b>Default Domain</b> connected rehte waqt push hote hain, isliye <code>intranet.nwk.lab</code> company resolver (10.0.1.20) se resolve hota hai. Split include ke saath <b>split DNS</b> ke baare mein bhi socho: sirf company domains company resolver ko jaate hain, baaki sab home resolver ko. Agar aap company DNS server push karte ho par sirf 10.0.1.0/24 tunnel karte ho, to pakka karo ki DNS server us list ke andar ho, warna name resolution toot jaata hai.</p>

<div class="eg"><p><b>Worked example (remote access lab).</b> GP-Employees: Tunnel networks specified below = INSIDE-NET, DNS 10.0.1.20, domain nwk.lab. Connect hone ke baad HOME-PC par <code>vpn stats</code> dikhata hai:</p>
<pre class="out">[ Connection Information ]

    <span class="hl">Tunnel Mode (IPv4):    Split Include</span>
    Tunnel Mode (IPv6):    Drop All Traffic

[ Address Information ]

    Client (IPv4):         10.50.0.10
    Server:                203.0.113.2

[ Transport Information ]

    Protocol:              DTLSv1.2
    Cipher:                ECDHE_RSA_AES_256_GCM_SHA384

[ Secured Routes (IPv4) ]

    <span class="hl">10.0.1.0/24</span>

[ DNS ]

    Server:                10.0.1.20
    Default domain:        nwk.lab</pre>
<p>Prove karo: <code>curl 10.0.1.20</code> chalta hai aur SRV1 request 10.50.0.10 (pool) se dekhta hai, jabki <code>ping 8.8.8.8</code> seedha 198.51.100.20 (ghar ka address) se nikalta hai.</p></div>

<h3>Secure Client image aur profile</h3>
<p><b>Image</b> (har operating system ke liye ek .pkg, wizard ke Secure Client image step mein chuna jaata hai aur Objects → VPN Objects → Secure Client File mein list hota hai) web-deploy aur upgrades ke liye offer hota hai. <b>Client profile</b> profile editor se bani ek XML file hai jo group policy se attach hoti hai. Ismein users ko dikhne wali host list (display name aur vpn.nwk.lab jaisa FQDN), backup servers, certificate matching, <b>Start Before Login</b>, <b>Always-On</b> (VPN up na ho to network access block) aur <b>Trusted Network Detection</b> (office network se bahar hone par apne aap connect) hote hain.</p>

<h3>Secure Client modules (concept level)</h3>
<table class="cmp"><tr><th>Module</th><th>Kya jodta hai</th></tr>
<tr><td>VPN (AnyConnect VPN)</td><td>core remote access client: SSL/DTLS ya IKEv2</td></tr>
<tr><td>ISE Posture</td><td>antivirus, patches, disk encryption check karta hai; ISE non-compliant users ko CoA se quarantine kar sakta hai</td></tr>
<tr><td>Umbrella / Secure Access roaming</td><td>VPN se bahar ya split tunnel ke saath DNS-layer aur web security</td></tr>
<tr><td>Network Visibility Module (NVM)</td><td>per-process flow records jo collector ya Secure Network Analytics ko jaate hain</td></tr>
<tr><td>Secure Endpoint</td><td>endpoint detection and response connector</td></tr>
<tr><td>Zero Trust Access</td><td>Cisco Secure Access ke through per-application access, network tunnel ki jagah QUIC aur MASQUE use karke</td></tr>
<tr><td>Network Access Manager, DART</td><td>802.1X wired aur wireless supplicant; support cases ke liye diagnostics bundle</td></tr></table>
<p><b>QUIC</b> TLS 1.3 built-in wala UDP transport hai (HTTP/3 iske upar chalta hai). <b>MASQUE</b> IP ya UDP ko HTTP/3 ke andar tunnel karta hai, isliye connection UDP 443 par aam web traffic jaisa dikhta hai aur network changes jhel leta hai. Isi tarah zero trust network access (ZTNA) poore network ki jagah ek application ka access deta hai; full-tunnel VPN device management aur legacy applications ke liye rehta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Nayi group policy ko connection profile se attach karna bhoolna; DNS server ke network ke bina split include; hairpin NAT ke bina tunnel all, jisse users internet kho dete hain; direct internet path ke liye bina kisi cloud security ke split tunnel.</p></div>

<div class="exam"><p><b>Exam trap.</b> Split include = "Tunnel networks specified below" = tunnelspecified; split exclude = "Exclude networks specified below" = excludespecified. Split tunnel, DNS aur banner group policy mein hote hain, connection profile mein nahi. MASQUE wala ZTNA per-application hai; VPN per-network hai.</p></div>

<div class="scn"><h4>Woh proxy jisne uski browsing kabhi nahi dekhi</h4><p>Ek compliance officer ne poocha ki din bhar Secure Client par online rehne wali ek remote employee ki koi internet browsing web proxy logs mein kyun nahi dikhi. Uske laptop par <code>vpn stats</code> ne secured route ke roop mein sirf 10.0.1.0/24 ke saath <b>Tunnel Mode (IPv4): Split Include</b> dikhaya. Uska internet traffic seedha uske home router se nikalta tha, isliye na firewall ne dekha na proxy ne. Team ne performance ke liye split include rakha par Umbrella module deploy kiya taaki laptop jahan bhi ho har DNS request filter aur log ho.</p><p><b>Lesson:</b> split tunnelling internet traffic ko aapke firewall ki nazar se bahar le jaata hai; us visibility ko endpoint ya cloud security se replace karo.</p></div>

<div class="iv"><p class="q">"Remote workers ke liye split tunnel ya tunnel all? Apni choice defend karo."</p><p>Dono samjhao: tunnel all poora inspection aur consistent policy deta hai par bandwidth, latency kharch karta hai aur hairpin NAT chahiye; split include bandwidth bachata hai aur SaaS performance sudharta hai par firewall internet traffic nahi dekhta. Mature answer SaaS ke liye split include ya split exclude plus direct path ke liye Umbrella ya Secure Access chunta hai, ya high-risk users ke liye tunnel all, aur agle step ke roop mein domain se dynamic split tunnelling aur ZTNA mention karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Group policy woh hai jo users ko milta hai: split tunnel, DNS, domain, banner, timeouts, filters, client profile aur modules.</li>
<li>Allow all (tunnelall), Tunnel networks specified below (split include), Exclude networks specified below (split exclude).</li>
<li>DNS aur domain push karo; pakka karo ki DNS server tunnel se reachable ho.</li>
<li>Image client package hai; XML profile mein host entries, Always-On, Start Before Login aur Trusted Network Detection hote hain.</li>
<li>Modules posture, Umbrella, NVM, Secure Endpoint aur Zero Trust Access (QUIC/MASQUE) jodte hain.</li>
</ul></div>
`}};export{e as default};