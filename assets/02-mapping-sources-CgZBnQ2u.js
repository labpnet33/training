var e={id:`mapping-sources`,h:{en:`How the firewall learns IP-to-user mappings`,hi:`Firewall IP-to-user mappings kaise seekhta hai`},body:{en:`

<p><b>The firewall cannot guess identity.</b> Somebody has to tell it that 10.0.1.10 is currently priya.s. This chapter covers the places that information comes from, how long it is trusted, and how to choose among them.</p>

<h3>Analogy: where does the receptionist learn the visitor's name?</h3>
<p>She may read the sign-in sheet at the door, hear the security guard announce a name, scan a badge at a turnstile, or ask the visitor to type their name on a tablet. Each is a different <b>mapping source</b>. A good office uses more than one, because no single method catches every visitor.</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Mapping sources"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">Windows domain controller logs</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">logon events show user and source IP</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">GlobalProtect login</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">remote user logs in; mapping is exact</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">Captive portal / authentication policy</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">unknown user is asked to log in</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">Syslog and XML API</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">other systems (Wi-Fi, NAC, proxy) report logins</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">Terminal server agent</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">many users share one IP, mapped by port range</text></svg><p class="cap">Mapping sources, from most common to special cases.</p></div>

<h3>The main mapping sources</h3>
<table class="cmp"><tr><th>Source</th><th>How it works</th><th>Best for</th></tr>
<tr><td>Server monitoring (agentless)</td><td>The firewall reads Windows Security log events from domain controllers and Exchange servers: Kerberos ticket events and logon events carry the user and the client IP</td><td>Domain-joined Windows clients on the office network</td></tr>
<tr><td>Windows User-ID agent</td><td>A small program on a Windows server does the same job and sends mappings to one or more firewalls</td><td>Large sites, or when you want to offload the firewall</td></tr>
<tr><td>GlobalProtect</td><td>The user logs in to the portal and gateway; the gateway creates the mapping for the tunnel IP</td><td>Remote users and, in internal mode, office users</td></tr>
<tr><td>Captive portal and authentication policy</td><td>If the user is unknown, the firewall redirects a browser session to log in (form, Kerberos, NTLM or certificate)</td><td>Guests, non-domain devices, Linux and Mac clients</td></tr>
<tr><td>Syslog listener</td><td>The firewall parses login messages sent by other systems (Wi-Fi controllers, proxies, NAC)</td><td>Environments that already have a system that knows the login</td></tr>
<tr><td>XML API</td><td>A script or product pushes mappings to the firewall</td><td>Custom integration and automation</td></tr>
<tr><td>Terminal Services agent</td><td>Assigns port ranges per user on a shared server, so the firewall can tell users on one IP apart</td><td>RDS and Citrix servers</td></tr>
</table>
<p>Other products can also feed identity. For example, Cisco ISE (see the sec-ise module) knows who authenticated on 802.1X, and an integration can pass that to the firewall; in current deployments the Cloud Identity Engine is often used to bring directory and identity information together.</p>

<h3>How server monitoring works, step by step</h3>
<ol>
<li>A user logs in to the domain from 10.0.1.10. The domain controller writes a security event with the user name and the client IP.</li>
<li>The firewall reads that log over a service account connection.</li>
<li>It creates the mapping 10.0.1.10 to the user and stores it in the <b>IP-user mapping table</b>.</li>
<li>When the user opens a session from 10.0.1.10, the firewall copies the user into the session as <code>src user</code>.</li>
</ol>
<p>The mapping is not permanent. It has a <b>timeout</b> (a default of about 45 minutes for most agent-based mappings), after which it is removed unless a new login refreshes it. GlobalProtect mappings are held while the user is connected.</p>

<h3>Include and exclude networks</h3>
<p>Mapping only makes sense for networks where one IP means one person. Use an <b>include list</b> for user networks and an <b>exclude list</b> for addresses that must never be mapped: servers, proxies, NAT pools and VPN concentrators. Without this, an address shared by many users can be mapped to the wrong person.</p>

<div class="eg"><p><b>Worked example.</b> A company has 2,000 clients on 10.0.0.0/16 and a web proxy at 10.0.0.5 which forwards all web traffic. If the firewall sits behind the proxy, every web session would show the proxy address. The team excludes 10.0.0.5 from mapping and uses the proxy to pass the original user instead (for example with an X-Forwarded-For header and the matching firewall setting). Policy then sees real users instead of the proxy.</p></div>

<h3>Where identity can go wrong</h3>
<ul>
<li><b>NAT before the firewall.</b> If many users share one translated address, one IP maps to many people. Put the firewall before the NAT, or use a source that identifies users another way.</li>
<li><b>Multi-user hosts.</b> Terminal servers need the Terminal Services agent.</li>
<li><b>Stale mappings.</b> A laptop that leaves keeps its mapping until timeout. Another device that reuses the address may briefly inherit the identity.</li>
<li><b>Wrong zone.</b> If User-ID is not enabled on the source zone, mappings exist but sessions do not use them (next chapter).</li>
</ul>

<p>The lab firewall has no mapping source, so it can only show the "unknown" state. That makes the next verification command familiar: on a firewall with User-ID, you check <code>src user</code> in the session detail and the <code>SrcUser</code> column of the log, exactly the fields you saw empty in the lab.</p>

<div class="warn"><p><b>Common mistake.</b> Relying on one source only. A Windows server monitor misses non-domain devices, Macs and remote users. Combine server monitoring (office) with GlobalProtect (remote) and captive portal (guests).</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the sources and what each is best for. Terminal Services agent solves "many users, one IP"; GlobalProtect gives the most reliable mapping because the user authenticates directly to the gateway.</p></div>

<div class="scn"><h4>Everyone looked like the proxy</h4><p>After a new proxy was placed in front of the firewall, every log line showed the proxy address and the user column went empty. The team excluded the proxy from User-ID mapping and used the proxy-supplied client identity. Policy by group worked again, and the daily report named real users.</p><p><b>Lesson:</b> Mapping works only where one IP equals one person. Exclude shared addresses and use another identity source for them.</p></div>

<div class="iv"><p class="q">"How does a Palo Alto firewall learn which user is on an IP address?"</p><p>From mapping sources: server monitoring of domain controller security logs or a Windows User-ID agent, GlobalProtect logins, captive portal or authentication policy for unknown users, syslog parsing, the XML API, and the Terminal Services agent for shared servers. Mappings expire after a timeout. I would add that I use include and exclude lists so that proxies and NAT addresses are not mapped.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The firewall needs a mapping source; it cannot learn identity by itself.</li>
<li>Server monitoring and the Windows agent read domain controller logs; GlobalProtect is exact for remote users.</li>
<li>Captive portal covers unknown users and non-domain devices.</li>
<li>Mappings time out; use include and exclude lists for proxies and NAT pools.</li>
<li>Terminal Services agent handles many users on one IP.</li>
</ul></div>

`,hi:`

<p><b>Firewall identity ka andaza nahi laga sakta.</b> Kisi ko use batana padta hai ki 10.0.1.10 abhi priya.s hai. Yeh chapter woh jagahein cover karta hai jahan se yeh information aati hai, kitni der us par bharosa hota hai, aur inme se kaise chunna hai.</p>

<h3>Analogy: receptionist ko visitor ka naam kahan se pata chalta hai?</h3>
<p>Woh darwaze par sign-in sheet padh sakti hai, security guard se naam sun sakti hai, turnstile par badge scan kar sakti hai, ya visitor se tablet par naam type karwa sakti hai. Har ek alag <b>mapping source</b> hai. Achha office ek se zyada use karta hai, kyunki koi ek tareeka har visitor ko nahi pakadta.</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Mapping sources"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">Windows domain controller logs</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">logon events mein user aur source IP</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">GlobalProtect login</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">remote user login karta hai; mapping exact</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">Captive portal / authentication policy</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">unknown user se login karwaya jaata hai</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">Syslog aur XML API</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">doosre systems (Wi-Fi, NAC, proxy) login report karte hain</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">Terminal server agent</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">ek IP par kai users, port range se map</text></svg><p class="cap">Mapping sources, sabse common se special cases tak.</p></div>

<h3>Main mapping sources</h3>
<table class="cmp"><tr><th>Source</th><th>Kaise kaam karta hai</th><th>Kiske liye best</th></tr>
<tr><td>Server monitoring (agentless)</td><td>Firewall domain controllers aur Exchange servers ke Windows Security log events padhta hai: Kerberos ticket aur logon events mein user aur client IP hota hai</td><td>Office network par domain-joined Windows clients</td></tr>
<tr><td>Windows User-ID agent</td><td>Windows server par ek chhota program yahi kaam karta hai aur mappings ek ya zyada firewalls ko bhejta hai</td><td>Bade sites, ya firewall ka load kam karna ho</td></tr>
<tr><td>GlobalProtect</td><td>User portal aur gateway par login karta hai; gateway tunnel IP ka mapping banata hai</td><td>Remote users aur, internal mode mein, office users</td></tr>
<tr><td>Captive portal aur authentication policy</td><td>User unknown ho to firewall browser session ko login ke liye redirect karta hai (form, Kerberos, NTLM ya certificate)</td><td>Guests, non-domain devices, Linux aur Mac clients</td></tr>
<tr><td>Syslog listener</td><td>Firewall doosre systems (Wi-Fi controllers, proxies, NAC) ke bheje login messages parse karta hai</td><td>Jahan pehle se koi system login jaanta ho</td></tr>
<tr><td>XML API</td><td>Koi script ya product mappings firewall ko push karta hai</td><td>Custom integration aur automation</td></tr>
<tr><td>Terminal Services agent</td><td>Shared server par har user ko port range deta hai, taaki firewall ek IP par users ko alag pehchaan sake</td><td>RDS aur Citrix servers</td></tr>
</table>
<p>Doosre products bhi identity de sakte hain. Jaise Cisco ISE (sec-ise module dekho) jaanta hai 802.1X par kisne authenticate kiya, aur integration yeh firewall tak pahucha sakta hai; aaj ke deployments mein directory aur identity information ko jodne ke liye aksar Cloud Identity Engine use hota hai.</p>

<h3>Server monitoring step by step</h3>
<ol>
<li>User 10.0.1.10 se domain mein login karta hai. Domain controller user name aur client IP ke saath security event likhta hai.</li>
<li>Firewall service account connection se woh log padhta hai.</li>
<li>Woh 10.0.1.10 se user ka mapping banata hai aur use <b>IP-user mapping table</b> mein rakhta hai.</li>
<li>User 10.0.1.10 se session kholta hai to firewall user ko session mein <code>src user</code> ke roop mein copy karta hai.</li>
</ol>
<p>Mapping permanent nahi hota. Uska ek <b>timeout</b> hota hai (agent-based mappings ke liye default lagbhag 45 minute), uske baad woh hat jaata hai jab tak naya login use refresh na kare. GlobalProtect mappings user ke connected rehne tak rehte hain.</p>

<h3>Include aur exclude networks</h3>
<p>Mapping sirf un networks ke liye sense banata hai jahan ek IP ka matlab ek insaan. User networks ke liye <b>include list</b> aur un addresses ke liye <b>exclude list</b> use karo jinhe kabhi map nahi karna: servers, proxies, NAT pools aur VPN concentrators. Isse bina, kai users ka shared address galat insaan se map ho sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Company ke 2,000 clients 10.0.0.0/16 par hain aur 10.0.0.5 par web proxy hai jo saara web traffic forward karta hai. Firewall proxy ke peeche ho to har web session proxy ka address dikhayega. Team proxy 10.0.0.5 ko mapping se exclude karti hai aur proxy se asli user pass karwati hai (jaise X-Forwarded-For header aur matching firewall setting). Policy ab proxy ke bajaye asli users dekhti hai.</p></div>

<h3>Identity kahan galat ho sakti hai</h3>
<ul>
<li><b>Firewall se pehle NAT.</b> Kai users ek translated address share karein to ek IP kai logon se map hota hai. Firewall ko NAT se pehle rakho, ya users ko kisi aur tareeke se pehchanne waala source use karo.</li>
<li><b>Multi-user hosts.</b> Terminal servers ko Terminal Services agent chahiye.</li>
<li><b>Stale mappings.</b> Jo laptop chala gaya uska mapping timeout tak rehta hai. Wahi address reuse karne waala doosra device kuch der identity inherit kar sakta hai.</li>
<li><b>Galat zone.</b> Source zone par User-ID enable na ho to mappings hote hain lekin sessions unhe use nahi karte (agla chapter).</li>
</ul>

<p>Lab firewall ke paas koi mapping source nahi hai, isliye woh sirf "unknown" state dikha sakta hai. Isse agla verification command jaana-pehchana lagta hai: User-ID waale firewall par aap session detail mein <code>src user</code> aur log ke <code>SrcUser</code> column check karte ho, bilkul wahi fields jo lab mein khaali dikhe.</p>

<div class="warn"><p><b>Common mistake.</b> Sirf ek source par nirbhar rehna. Windows server monitor non-domain devices, Macs aur remote users miss karta hai. Server monitoring (office), GlobalProtect (remote) aur captive portal (guests) ko milao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sources aur har ek kiske liye best hai, yaad rakho. Terminal Services agent "kai users, ek IP" solve karta hai; GlobalProtect sabse reliable mapping deta hai kyunki user seedha gateway par authenticate karta hai.</p></div>

<div class="scn"><h4>Sab proxy jaise dikhne lage</h4><p>Firewall ke aage naya proxy lagne ke baad har log line proxy ka address dikhane lagi aur user column khaali ho gaya. Team ne proxy ko User-ID mapping se exclude kiya aur proxy se mili client identity use ki. Group se policy phir chalne lagi, aur daily report mein asli users ke naam aaye.</p><p><b>Lesson:</b> Mapping tabhi chalta hai jahan ek IP barabar ek insaan. Shared addresses exclude karo aur unke liye doosra identity source use karo.</p></div>

<div class="iv"><p class="q">"Palo Alto firewall ko kaise pata chalta hai ki IP address par kaunsa user hai?"</p><p>Mapping sources se: domain controller security logs ki server monitoring ya Windows User-ID agent, GlobalProtect logins, unknown users ke liye captive portal ya authentication policy, syslog parsing, XML API, aur shared servers ke liye Terminal Services agent. Mappings timeout ke baad expire hote hain. Jodunga ki include aur exclude lists use karta hoon taaki proxies aur NAT addresses map na hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewall ko mapping source chahiye; woh identity khud nahi seekh sakta.</li>
<li>Server monitoring aur Windows agent domain controller logs padhte hain; GlobalProtect remote users ke liye exact hai.</li>
<li>Captive portal unknown users aur non-domain devices cover karta hai.</li>
<li>Mappings time out hote hain; proxies aur NAT pools ke liye include aur exclude lists use karo.</li>
<li>Terminal Services agent ek IP par kai users sambhalta hai.</li>
</ul></div>

`}};export{e as default};