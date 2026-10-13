var e={id:`globalprotect-configuration`,h:{en:`GlobalProtect configuration: building blocks, HIP and split tunnel`,hi:`GlobalProtect configuration: building blocks, HIP aur split tunnel`},body:{en:`

<p><b>Order of work.</b> A GlobalProtect deployment has many pieces. The common failure is not a wrong setting but a missing piece or a wrong order. This chapter gives the building blocks in order, the options you must understand (split tunnel, HIP), and the part you can run in the simulator: the VPN zone and its policy.</p>

<h3>Analogy: opening a new bus route</h3>
<p>First lay the road (interfaces and zone), then get the transport licence (certificate), choose how passengers prove who they are (authentication), build the bus stop (gateway), build the transport desk that hands out route maps (portal), and finally write the rules that say who may go where (policy).</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="GlobalProtect build order"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Interfaces, tunnel interface and VPN zone</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">tunnel.N in its own zone with User-ID enabled</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Certificates</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">server certificate for the portal and gateway FQDN, trusted by clients</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Authentication</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">authentication profile: LDAP, RADIUS or SAML; optional client certificate</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Gateway</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">interface, authentication, tunnel settings, IP pool, DNS, split tunnel</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Portal</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">interface, authentication, agent configurations, gateway list</text><line x1="320" y1="294" x2="320" y2="310" stroke="#64748b" stroke-width="2"/><rect x="60" y="310" width="520" height="44" rx="9" fill="#e2e8f0"/><text x="320" y="329" text-anchor="middle" class="svg-ink" font-size="13">6. Policy and NAT</text><text x="320" y="345" text-anchor="middle" class="svg-muted" font-size="11">rules from the VPN zone; NAT if tunnel IPs need internet access</text></svg><p class="cap">Build order for a GlobalProtect deployment.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>The portal, gateway and agent objects are GUI objects under <b>Network &gt; GlobalProtect</b> and cannot be run in the simulator. The table lists the main settings so you recognise them in an exam or a real project:</p>
<table class="cmp"><tr><th>Object</th><th>Key settings</th></tr>
<tr><td>Tunnel interface</td><td>tunnel.1, placed in the VPN zone and the virtual router; User-ID enabled on that zone</td></tr>
<tr><td>SSL/TLS service profile</td><td>The server certificate (CN or SAN = gp.acme.example) and minimum TLS version; clients must trust the issuer</td></tr>
<tr><td>Authentication profile</td><td>LDAP, RADIUS, SAML (for MFA) or local; optional certificate profile for client certificates</td></tr>
<tr><td>Gateway: General</td><td>Interface and IP address that clients reach; tunnel interface to use</td></tr>
<tr><td>Gateway: Agent</td><td>Tunnel mode (IPsec, SSL fallback), client IP pool (for example 10.250.0.0/24), DNS servers, split-tunnel routes</td></tr>
<tr><td>Portal: Agent config</td><td>One or more configurations selected by user, group or OS; gateways with priorities; connect method; trusted root CAs; app settings</td></tr>
<tr><td>Portal: Internal host detection</td><td>A DNS name and address that only resolve inside the office</td></tr>
</table>

<h3>Run it: the VPN zone and a user rule</h3>
<p>You can write the policy side. The VPN zone gets User-ID, and a rule lets the engineers group use SSH to the build servers. This is real simulator output (names are fictional):</p>
<pre class="out">PA1# set zone vpn enable-user-identification yes
PA1# set address BUILD-SERVERS ip-netmask 10.0.2.0/24
PA1# set rulebase security rules VPN-Eng from vpn to dmz source any destination BUILD-SERVERS source-user acme.example\\engineers application ssh service application-default action allow log-end yes
PA1# commit

Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully</pre>
<pre class="out">      VPN-Eng {
        from vpn;
        to dmz;
        source any;
        destination BUILD-SERVERS;
        <span class="hl">source-user acme.example\\engineers;</span>
        application ssh;
        service application-default;
        action allow;
        log-end yes;
      }</pre>
<p>A policy test shows how the rule matches traffic from a tunnel address. The simulator does not check the user (see the previous chapter), so it answers for any user:</p>
<pre class="out">PA1&gt; test security-policy-match from vpn to dmz source 10.250.0.5 destination 10.0.2.10 protocol 6 destination-port 22
"VPN-Eng; index: 3" {
        from vpn;
        to dmz;
        destination BUILD-SERVERS;
        application/service ssh/application-default;
        <span class="hl">action allow;</span>
        terminal yes;
}</pre>
<p>On a real firewall, the same rule would match only when the tunnel address is mapped to a user in the engineers group, which the gateway creates at login.</p>

<h3>Split tunnel versus full tunnel</h3>
<table class="cmp"><tr><th>Mode</th><th>What goes through the tunnel</th><th>Trade-off</th></tr>
<tr><td>Full tunnel</td><td>All traffic, including internet</td><td>Best visibility and control; uses more gateway bandwidth</td></tr>
<tr><td>Split tunnel by route</td><td>Only traffic to listed corporate networks (include routes)</td><td>Less load; internet traffic is not inspected by the firewall</td></tr>
<tr><td>Split tunnel by domain or application</td><td>Named SaaS or domains bypass the tunnel (exclude)</td><td>Good for latency-sensitive services, needs careful review</td></tr>
</table>
<p>Choose full tunnel when security inspection of internet traffic from remote devices matters more than bandwidth, and split tunnel when you must protect bandwidth and accept a gap in inspection. Document the decision.</p>

<h3>HIP: host information profile</h3>
<p>The agent can report the device state: operating system patch level, antivirus presence and update, disk encryption, firewall status. The firewall evaluates this against <b>HIP objects</b> and <b>HIP profiles</b>, which you can then use as a condition in a security rule, next to the user.</p>
<ul>
<li>HIP object: a set of checks, for example "disk encryption enabled".</li>
<li>HIP profile: a Boolean combination of objects, for example "encrypted AND antivirus current".</li>
<li>Use in a rule: allow engineers to the build servers only if the HIP profile matches, otherwise allow only a remediation portal.</li>
</ul>
<p>HIP checks typically require the GlobalProtect subscription license on the gateway; confirm licensing in your environment.</p>

<div class="eg"><p><b>Worked example.</b> A company allows engineers into the build network only from managed, encrypted laptops. The VPN rule lists source-user engineers and the HIP profile "managed-encrypted". A contractor laptop without disk encryption connects and gets internet access only, because it matches a lower rule with no HIP requirement.</p></div>

<h3>Security considerations</h3>
<ul>
<li>Use SAML or another MFA method for the portal. Passwords alone on a public portal are a risk.</li>
<li>Keep the portal and gateway certificates and their private keys protected, and renew before expiry.</li>
<li>Restrict the VPN zone with specific rules (user, application, destination) rather than any.</li>
<li>Log the VPN zone rules; GlobalProtect events also appear in the system log.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Forgetting to enable User-ID on the VPN zone. The tunnel works, but user rules never match because mappings are not used. Also forgetting the NAT or the return route for the tunnel pool is a common cause of "connected but no access".</p></div>
<div class="exam"><p><b>Exam trap.</b> The tunnel interface lives in a zone; User-ID must be enabled on that zone. HIP profiles are used as a rule condition. Split tunnel include routes send only listed networks through the tunnel; full tunnel sends everything.</p></div>

<div class="scn"><h4>Connected, but nothing worked</h4><p>Remote users showed as connected, but could not reach internal servers. The tunnel pool 10.250.0.0/24 was not known to the internal routers, so replies never returned. The team added a route for the pool towards the firewall, and the first ping worked.</p><p><b>Lesson:</b> A tunnel is a network. Routing for the client pool must exist on both sides.</p></div>

<div class="iv"><p class="q">"What do you configure for a GlobalProtect deployment, in order?"</p><p>Tunnel interface and a VPN zone with User-ID, a trusted server certificate, an authentication profile (ideally SAML with MFA), the gateway with tunnel settings, an IP pool and routes, the portal with agent configurations and the gateway list, and then security and NAT policy for the VPN zone, optionally with HIP. I verify with a test connection and the users shown on the gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: interfaces and zone, certificates, authentication, gateway, portal, policy.</li>
<li>Enable User-ID on the VPN zone so that user rules match.</li>
<li>Full tunnel inspects everything; split tunnel saves bandwidth but leaves a gap.</li>
<li>HIP profiles add device posture as a rule condition and usually need a license.</li>
<li>Client pool needs routing and, if required, NAT.</li>
</ul></div>

`,hi:`

<p><b>Kaam ka order.</b> GlobalProtect deployment mein kai pieces hote hain. Aam failure galat setting nahi balki missing piece ya galat order hota hai. Yeh chapter order mein building blocks deta hai, woh options jo samajhne zaroori hain (split tunnel, HIP), aur woh hissa jo simulator mein chal sakta hai: VPN zone aur uski policy.</p>

<h3>Analogy: nayi bus route kholna</h3>
<p>Pehle sadak banao (interfaces aur zone), phir transport licence lo (certificate), tay karo ki passengers apni pehchaan kaise denge (authentication), bus stop banao (gateway), woh transport desk banao jo route maps deta hai (portal), aur aakhir mein woh rules likho jo kehti hain kaun kahan ja sakta hai (policy).</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="GlobalProtect build order"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Interfaces, tunnel interface aur VPN zone</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">tunnel.N apni zone mein, User-ID enabled</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Certificates</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">portal aur gateway FQDN ke liye server certificate, clients ke liye trusted</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Authentication</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">authentication profile: LDAP, RADIUS ya SAML; optional client certificate</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Gateway</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">interface, authentication, tunnel settings, IP pool, DNS, split tunnel</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Portal</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">interface, authentication, agent configurations, gateway list</text><line x1="320" y1="294" x2="320" y2="310" stroke="#64748b" stroke-width="2"/><rect x="60" y="310" width="520" height="44" rx="9" fill="#e2e8f0"/><text x="320" y="329" text-anchor="middle" class="svg-ink" font-size="13">6. Policy aur NAT</text><text x="320" y="345" text-anchor="middle" class="svg-muted" font-size="11">VPN zone se rules; tunnel IPs ko internet chahiye to NAT</text></svg><p class="cap">GlobalProtect deployment ka build order.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>Portal, gateway aur agent objects <b>Network &gt; GlobalProtect</b> ke neeche GUI objects hain aur simulator mein nahi chalte. Table main settings dikhati hai taaki aap exam ya real project mein pehchan sako:</p>
<table class="cmp"><tr><th>Object</th><th>Key settings</th></tr>
<tr><td>Tunnel interface</td><td>tunnel.1, VPN zone aur virtual router mein; us zone par User-ID enabled</td></tr>
<tr><td>SSL/TLS service profile</td><td>Server certificate (CN ya SAN = gp.acme.example) aur minimum TLS version; clients ko issuer par trust karna hoga</td></tr>
<tr><td>Authentication profile</td><td>LDAP, RADIUS, SAML (MFA ke liye) ya local; client certificates ke liye optional certificate profile</td></tr>
<tr><td>Gateway: General</td><td>Interface aur IP address jahan clients pahunchte hain; use hone waala tunnel interface</td></tr>
<tr><td>Gateway: Agent</td><td>Tunnel mode (IPsec, SSL fallback), client IP pool (jaise 10.250.0.0/24), DNS servers, split-tunnel routes</td></tr>
<tr><td>Portal: Agent config</td><td>User, group ya OS se chuni gayi ek ya zyada configurations; priorities ke saath gateways; connect method; trusted root CAs; app settings</td></tr>
<tr><td>Portal: Internal host detection</td><td>Ek DNS naam aur address jo sirf office ke andar resolve hota hai</td></tr>
</table>

<h3>Chalao: VPN zone aur user rule</h3>
<p>Policy wala hissa aap likh sakte ho. VPN zone ko User-ID milta hai, aur ek rule engineers group ko build servers par SSH use karne deti hai. Yeh asli simulator output hai (naam fictional):</p>
<pre class="out">PA1# set zone vpn enable-user-identification yes
PA1# set address BUILD-SERVERS ip-netmask 10.0.2.0/24
PA1# set rulebase security rules VPN-Eng from vpn to dmz source any destination BUILD-SERVERS source-user acme.example\\engineers application ssh service application-default action allow log-end yes
PA1# commit

Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully</pre>
<pre class="out">      VPN-Eng {
        from vpn;
        to dmz;
        source any;
        destination BUILD-SERVERS;
        <span class="hl">source-user acme.example\\engineers;</span>
        application ssh;
        service application-default;
        action allow;
        log-end yes;
      }</pre>
<p>Policy test dikhata hai ki rule tunnel address ke traffic se kaise match karti hai. Simulator user check nahi karta (pichhla chapter dekho), isliye woh kisi bhi user ke liye jawab deta hai:</p>
<pre class="out">PA1&gt; test security-policy-match from vpn to dmz source 10.250.0.5 destination 10.0.2.10 protocol 6 destination-port 22
"VPN-Eng; index: 3" {
        from vpn;
        to dmz;
        destination BUILD-SERVERS;
        application/service ssh/application-default;
        <span class="hl">action allow;</span>
        terminal yes;
}</pre>
<p>Real firewall par wahi rule tabhi match karti jab tunnel address engineers group ke user se mapped hota, jo gateway login par banata hai.</p>

<h3>Split tunnel versus full tunnel</h3>
<table class="cmp"><tr><th>Mode</th><th>Tunnel se kya jaata hai</th><th>Trade-off</th></tr>
<tr><td>Full tunnel</td><td>Saara traffic, internet samet</td><td>Sabse achhi visibility aur control; gateway bandwidth zyada lagti hai</td></tr>
<tr><td>Route se split tunnel</td><td>Sirf listed corporate networks ka traffic (include routes)</td><td>Load kam; internet traffic firewall inspect nahi karta</td></tr>
<tr><td>Domain ya application se split tunnel</td><td>Named SaaS ya domains tunnel bypass karte hain (exclude)</td><td>Latency-sensitive services ke liye achha, dhyan se review chahiye</td></tr>
</table>
<p>Full tunnel tab chuno jab remote devices ke internet traffic ka security inspection bandwidth se zyada zaroori ho, aur split tunnel jab bandwidth bachani ho aur inspection ka gap maanna ho. Faisla document karo.</p>

<h3>HIP: host information profile</h3>
<p>Agent device ki state report kar sakta hai: operating system patch level, antivirus ka hona aur update, disk encryption, firewall status. Firewall isse <b>HIP objects</b> aur <b>HIP profiles</b> se evaluate karta hai, jinhe aap security rule mein user ke saath ek condition ki tarah use kar sakte ho.</p>
<ul>
<li>HIP object: checks ka set, jaise "disk encryption enabled".</li>
<li>HIP profile: objects ka Boolean combination, jaise "encrypted AND antivirus current".</li>
<li>Rule mein use: engineers ko build servers tak tabhi allow karo jab HIP profile match kare, warna sirf remediation portal.</li>
</ul>
<p>HIP checks ke liye aam taur par gateway par GlobalProtect subscription license chahiye; apne environment mein licensing confirm karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek company engineers ko build network mein sirf managed, encrypted laptops se aane deti hai. VPN rule mein source-user engineers aur HIP profile "managed-encrypted" hai. Bina disk encryption ka contractor laptop connect karta hai aur use sirf internet access milta hai, kyunki woh neeche ki rule match karta hai jisme HIP requirement nahi.</p></div>

<h3>Security considerations</h3>
<ul>
<li>Portal ke liye SAML ya koi aur MFA method use karo. Public portal par sirf password risk hai.</li>
<li>Portal aur gateway certificates aur unki private keys ko protect rakho, aur expiry se pehle renew karo.</li>
<li>VPN zone ko any ke bajaye specific rules (user, application, destination) se restrict karo.</li>
<li>VPN zone ki rules log karo; GlobalProtect events system log mein bhi aate hain.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> VPN zone par User-ID enable karna bhool jaana. Tunnel chalta hai, lekin user rules kabhi match nahi karti kyunki mappings use nahi hote. Tunnel pool ke liye NAT ya return route bhool jaana bhi "connected but no access" ka aam kaaran hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnel interface ek zone mein rehta hai; us zone par User-ID enable hona chahiye. HIP profiles rule condition ke roop mein use hote hain. Split tunnel include routes sirf listed networks tunnel se bhejte hain; full tunnel sab kuch.</p></div>

<div class="scn"><h4>Connected tha, par kuch nahi chala</h4><p>Remote users connected dikhe, lekin internal servers tak nahi pahunch paaye. Tunnel pool 10.250.0.0/24 internal routers ko pata nahi tha, isliye replies wapas nahi aaye. Team ne pool ka route firewall ki taraf jodaa, aur pehli ping chal gayi.</p><p><b>Lesson:</b> Tunnel ek network hai. Client pool ke liye routing dono taraf honi chahiye.</p></div>

<div class="iv"><p class="q">"GlobalProtect deployment ke liye order mein kya configure karte ho?"</p><p>Tunnel interface aur User-ID waali VPN zone, trusted server certificate, authentication profile (behtar hai MFA ke saath SAML), tunnel settings, IP pool aur routes ke saath gateway, agent configurations aur gateway list ke saath portal, phir VPN zone ke liye security aur NAT policy, optionally HIP ke saath. Test connection aur gateway par dikhte users se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: interfaces aur zone, certificates, authentication, gateway, portal, policy.</li>
<li>User rules match karane ke liye VPN zone par User-ID enable karo.</li>
<li>Full tunnel sab inspect karta hai; split tunnel bandwidth bachata hai par gap chhodta hai.</li>
<li>HIP profiles device posture ko rule condition banate hain aur aksar license chahiye.</li>
<li>Client pool ko routing aur zaroorat ho to NAT chahiye.</li>
</ul></div>

`}};export{e as default};