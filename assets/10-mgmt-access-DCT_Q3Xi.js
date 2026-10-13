var e={id:`mgmt-access`,h:{en:`Management access to the WLC: HTTPS, SSH, TACACS+ and RADIUS`,hi:`WLC ka management access: HTTPS, SSH, TACACS+ aur RADIUS`},body:{en:`
<p>The controller is the master key to every AP in the building. Whoever can log in to it can change every WLAN, read every pre-shared key, or switch the whole wireless network off with one click. Protecting it is like protecting the building's master key cabinet: a strong lock (encrypted protocols), a list of named key holders instead of one shared key (individual accounts), and a guard who writes down every time the cabinet opens (central AAA with accounting). The CCNA blueprint asks you to describe exactly these connections: Telnet, SSH, HTTP, HTTPS, console, TACACS+/RADIUS and cloud managed.</p>

<h3>Ways in, and which to allow</h3>
<table class="cmp"><tr><th>Method</th><th>Port</th><th>Encrypted?</th><th>Recommendation</th></tr>
<tr><td>Console</td><td>serial</td><td>Physical access</td><td>Keep for setup and recovery; lock the rack</td></tr>
<tr><td>Telnet</td><td>TCP 23</td><td><b>No</b>, passwords in clear text</td><td>Disable</td></tr>
<tr><td>SSH</td><td>TCP 22</td><td>Yes</td><td>Enable for CLI</td></tr>
<tr><td>HTTP (web GUI)</td><td>TCP 80</td><td><b>No</b></td><td>Disable</td></tr>
<tr><td>HTTPS (web GUI)</td><td>TCP 443</td><td>Yes (TLS)</td><td>Enable for GUI</td></tr>
<tr><td>Service port</td><td>out-of-band</td><td>Depends on protocol</td><td>Use for a separate management network</td></tr>
</table>
<p>Management should also reach the WLC only from the wired admin network. <b>Management via wireless</b> (logging in to the WLC from a laptop that is itself a wireless client of that WLC) should be disabled, and a CPU ACL can restrict which subnets may reach the management interface at all.</p>

<h3>Configuring secure protocols</h3>
<p>GUI: <b>Management &gt; HTTP-HTTPS</b> (HTTP Access disabled, HTTPS Access enabled) and <b>Management &gt; Telnet-SSH</b> (Telnet disabled, SSH enabled). CLI on an AireOS controller:</p>
<pre class="code">(WLC1) &gt;config network webmode disable
(WLC1) &gt;config network secureweb enable
(WLC1) &gt;config network telnet disable
(WLC1) &gt;config network ssh enable
(WLC1) &gt;config network mgmt-via-wireless disable
<span class="c">! a named local account instead of the shared "admin"</span>
(WLC1) &gt;config mgmtuser add netops1 Str0ng-Pass! read-write
(WLC1) &gt;save config</pre>

<pre class="out">(WLC1) &gt;show network summary
...
<span class="hl">Web Mode......................................... Disable</span>
<span class="hl">Secure Web Mode.................................. Enable</span>
Secure Shell (ssh)............................... Enable
Telnet........................................... Disable
Mgmt Via Wireless Interface...................... Disable
...</pre>
<p>These management commands come from a real AireOS controller; the lab simulator focuses on AP join, interfaces and WLANs, so practise them as reading and GUI exercises.</p>

<h3>Central AAA: TACACS+ or RADIUS for administrators</h3>
<p>Local accounts do not scale: with ten controllers and twenty engineers you would manage two hundred passwords. Instead, the WLC asks a central AAA server (such as Cisco ISE) to check each administrator's login. Two protocols can do this:</p>
<table class="cmp"><tr><th></th><th>TACACS+</th><th>RADIUS</th></tr>
<tr><td>Transport</td><td>TCP 49</td><td>UDP 1812/1813 (legacy 1645/1646)</td></tr>
<tr><td>Encryption</td><td><b>Entire payload</b> encrypted</td><td>Only the password field</td></tr>
<tr><td>AAA functions</td><td>Authentication, authorization and accounting <b>separated</b></td><td>Authentication and authorization combined</td></tr>
<tr><td>Command authorization</td><td>Yes, per command</td><td>Limited</td></tr>
<tr><td>Typical use</td><td><b>Device administration</b> (who can log in to network devices)</td><td><b>Network access</b> (802.1X users, VPN users)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Administrator login checked by TACACS+">
<rect x="20" y="80" width="140" height="56" rx="8" fill="#e2e8f0"/><text x="90" y="103" text-anchor="middle" class="svg-ink" font-size="13">Admin PC</text><text x="90" y="122" text-anchor="middle" class="svg-muted" font-size="12">HTTPS / SSH</text>
<rect x="250" y="80" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">10.10.99.10</text>
<rect x="480" y="80" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="103" text-anchor="middle" class="svg-ink" font-size="13">AAA server</text><text x="550" y="122" text-anchor="middle" class="svg-muted" font-size="12">10.10.50.30</text>
<line x1="160" y1="108" x2="250" y2="108" stroke="#64748b" stroke-width="2"/><text x="205" y="98" text-anchor="middle" class="svg-accent" font-size="12">TCP 443/22</text>
<line x1="390" y1="108" x2="480" y2="108" stroke="#64748b" stroke-width="2"/><text x="435" y="98" text-anchor="middle" class="svg-accent" font-size="12">TCP 49</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">order: TACACS+ first, local accounts only if the server is unreachable</text>
</svg><p class="cap">The administrator talks HTTPS or SSH to the WLC; the WLC asks the AAA server whether this person may log in and with which role.</p></div>

<pre class="code"><span class="c">! add a TACACS+ server for administrator logins</span>
(WLC1) &gt;config tacacs auth add 1 10.10.50.30 49 ascii NkTacacs1
<span class="c">! try TACACS+ first, fall back to local accounts</span>
(WLC1) &gt;config aaa auth mgmt tacacs local
<span class="c">! alternatively, allow a RADIUS server to authenticate management users</span>
(WLC1) &gt;config radius auth management 1 enable
(WLC1) &gt;show tacacs summary
(WLC1) &gt;show aaa auth</pre>
<p>GUI: <b>Security &gt; AAA &gt; TACACS+ &gt; Authentication &gt; New</b>, then <b>Security &gt; Priority Order &gt; Management User</b> to set the order. On the AAA server, the WLC is added as a network device with the same secret, and each administrator is given a <b>role</b> (for example full access, or read-only monitoring).</p>

<div class="eg"><p><b>Worked example.</b> The priority order is TACACS+ then local. Engineer Priya logs in over HTTPS. The WLC sends her credentials to 10.10.50.30 on TCP 49. The server replies <i>pass</i> with role ALL, so she gets full read-write access. Later the AAA server is down for maintenance: the WLC gets no answer, falls back to the local list, and only the emergency account <code>netops1</code> works. If the server had answered <i>fail</i> (wrong password), the WLC would <b>not</b> fall back; local is used only when the server is unreachable.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving HTTP and Telnet enabled "for convenience". Keeping only the default admin account, shared by everyone, so no one knows who changed a WLAN. Setting the order to TACACS+ only with no local fallback, then locking everyone out when the server dies. Allowing management via wireless, so a guest-side mistake exposes the controller's login page.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ = <b>TCP 49</b>, encrypts the whole body, separates AAA, preferred for <b>device administration</b>. RADIUS = <b>UDP 1812/1813</b>, encrypts only the password, preferred for <b>network access</b>. Telnet and HTTP send credentials in clear text. SSH and HTTPS are the secure choices.</p></div>

<div class="scn"><h4>Who deleted the staff WLAN?</h4><p>One Monday the staff WLAN at a hospital had vanished. Every engineer used the shared <code>admin</code> account over HTTP, so the controller's log showed only "admin deleted WLAN 1" from a desktop in a shared office. Nobody could say who did it, and the HTTP session could have been captured by anyone on that network. The fix was a management hardening project: HTTPS and SSH only, Telnet and HTTP disabled, management via wireless disabled, TACACS+ authentication and accounting to Cisco ISE with personal accounts and roles, and one emergency local account stored in a safe. The next change was logged with a name, a time and the exact command.</p><p><b>Lesson:</b> secure protocols protect the password; central AAA with personal accounts provides accountability.</p></div>

<div class="iv"><p class="q">"How would you secure management access to a wireless LAN controller? TACACS+ or RADIUS, and why?"</p><p>Strong answer: allow only HTTPS and SSH, disable HTTP and Telnet, disable management via wireless, restrict management to the admin subnet or the service port, and use named accounts. Authenticate administrators centrally with TACACS+, because it runs over TCP 49, encrypts the whole payload, separates authorization so you can give read-only or full roles, and gives per-command accounting. Keep a local fallback account for when the AAA server is unreachable. RADIUS also works, but it is mainly used for network access such as 802.1X.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use HTTPS and SSH; disable HTTP (TCP 80) and Telnet (TCP 23).</li>
<li>Disable management via wireless and limit which subnets can reach the management interface.</li>
<li>TACACS+ (TCP 49, full encryption, separate AAA) is preferred for device administration.</li>
<li>RADIUS (UDP 1812/1813, password-only encryption) is mainly for user network access.</li>
<li>Set AAA priority with a local fallback, which is used only when the server is unreachable.</li>
</ul></div>
`,hi:`
<p>Controller building ke har AP ki master key hai. Jo bhi usmein login kar sakta hai woh har WLAN badal sakta hai, har pre-shared key padh sakta hai, ya ek click mein poora wireless network band kar sakta hai. Ise protect karna building ki master key cabinet protect karne jaisa hai: mazboot taala (encrypted protocols), ek shared chaabi ki jagah naam wale key holders ki list (individual accounts), aur ek guard jo har baar cabinet khulne par likh leta hai (accounting ke saath central AAA). CCNA blueprint aapse yahi connections describe karne ko kehta hai: Telnet, SSH, HTTP, HTTPS, console, TACACS+/RADIUS aur cloud managed.</p>

<h3>Andar aane ke raaste, aur kaunse allow karne hain</h3>
<table class="cmp"><tr><th>Method</th><th>Port</th><th>Encrypted?</th><th>Recommendation</th></tr>
<tr><td>Console</td><td>serial</td><td>Physical access</td><td>Setup aur recovery ke liye rakho; rack lock karo</td></tr>
<tr><td>Telnet</td><td>TCP 23</td><td><b>Nahi</b>, passwords clear text mein</td><td>Disable karo</td></tr>
<tr><td>SSH</td><td>TCP 22</td><td>Haan</td><td>CLI ke liye enable karo</td></tr>
<tr><td>HTTP (web GUI)</td><td>TCP 80</td><td><b>Nahi</b></td><td>Disable karo</td></tr>
<tr><td>HTTPS (web GUI)</td><td>TCP 443</td><td>Haan (TLS)</td><td>GUI ke liye enable karo</td></tr>
<tr><td>Service port</td><td>out-of-band</td><td>Protocol par depend</td><td>Alag management network ke liye use karo</td></tr>
</table>
<p>Management bhi WLC tak sirf wired admin network se pahunchna chahiye. <b>Management via wireless</b> (aise laptop se WLC mein login karna jo khud usi WLC ka wireless client hai) disable hona chahiye, aur ek CPU ACL restrict kar sakta hai ki kaunse subnets management interface tak pahunch bhi sakte hain.</p>

<h3>Secure protocols configure karna</h3>
<p>GUI: <b>Management &gt; HTTP-HTTPS</b> (HTTP Access disabled, HTTPS Access enabled) aur <b>Management &gt; Telnet-SSH</b> (Telnet disabled, SSH enabled). AireOS controller par CLI:</p>
<pre class="code">(WLC1) &gt;config network webmode disable
(WLC1) &gt;config network secureweb enable
(WLC1) &gt;config network telnet disable
(WLC1) &gt;config network ssh enable
(WLC1) &gt;config network mgmt-via-wireless disable
<span class="c">! shared "admin" ki jagah naam wala local account</span>
(WLC1) &gt;config mgmtuser add netops1 Str0ng-Pass! read-write
(WLC1) &gt;save config</pre>

<pre class="out">(WLC1) &gt;show network summary
...
<span class="hl">Web Mode......................................... Disable</span>
<span class="hl">Secure Web Mode.................................. Enable</span>
Secure Shell (ssh)............................... Enable
Telnet........................................... Disable
Mgmt Via Wireless Interface...................... Disable
...</pre>
<p>Yeh management commands real AireOS controller se hain; lab simulator AP join, interfaces aur WLANs par focus karta hai, isliye inhe reading aur GUI exercises ki tarah practise karo.</p>

<h3>Central AAA: administrators ke liye TACACS+ ya RADIUS</h3>
<p>Local accounts scale nahi karte: das controllers aur bees engineers ke saath aap do sau passwords manage karoge. Iski jagah WLC har administrator ka login check karne ke liye ek central AAA server (jaise Cisco ISE) se poochta hai. Do protocols yeh kar sakte hain:</p>
<table class="cmp"><tr><th></th><th>TACACS+</th><th>RADIUS</th></tr>
<tr><td>Transport</td><td>TCP 49</td><td>UDP 1812/1813 (legacy 1645/1646)</td></tr>
<tr><td>Encryption</td><td><b>Poora payload</b> encrypted</td><td>Sirf password field</td></tr>
<tr><td>AAA functions</td><td>Authentication, authorization aur accounting <b>alag alag</b></td><td>Authentication aur authorization combined</td></tr>
<tr><td>Command authorization</td><td>Haan, har command par</td><td>Limited</td></tr>
<tr><td>Typical use</td><td><b>Device administration</b> (network devices mein kaun login kar sakta hai)</td><td><b>Network access</b> (802.1X users, VPN users)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="TACACS+ se check hone wala administrator login">
<rect x="20" y="80" width="140" height="56" rx="8" fill="#e2e8f0"/><text x="90" y="103" text-anchor="middle" class="svg-ink" font-size="13">Admin PC</text><text x="90" y="122" text-anchor="middle" class="svg-muted" font-size="12">HTTPS / SSH</text>
<rect x="250" y="80" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">10.10.99.10</text>
<rect x="480" y="80" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="103" text-anchor="middle" class="svg-ink" font-size="13">AAA server</text><text x="550" y="122" text-anchor="middle" class="svg-muted" font-size="12">10.10.50.30</text>
<line x1="160" y1="108" x2="250" y2="108" stroke="#64748b" stroke-width="2"/><text x="205" y="98" text-anchor="middle" class="svg-accent" font-size="12">TCP 443/22</text>
<line x1="390" y1="108" x2="480" y2="108" stroke="#64748b" stroke-width="2"/><text x="435" y="98" text-anchor="middle" class="svg-accent" font-size="12">TCP 49</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">order: pehle TACACS+, local accounts sirf tab jab server unreachable ho</text>
</svg><p class="cap">Administrator WLC se HTTPS ya SSH bolta hai; WLC AAA server se poochta hai ki yeh insaan login kar sakta hai ya nahi aur kis role ke saath.</p></div>

<pre class="code"><span class="c">! administrator logins ke liye TACACS+ server jodo</span>
(WLC1) &gt;config tacacs auth add 1 10.10.50.30 49 ascii NkTacacs1
<span class="c">! pehle TACACS+ try karo, phir local accounts par fallback</span>
(WLC1) &gt;config aaa auth mgmt tacacs local
<span class="c">! alternatively, RADIUS server ko management users authenticate karne do</span>
(WLC1) &gt;config radius auth management 1 enable
(WLC1) &gt;show tacacs summary
(WLC1) &gt;show aaa auth</pre>
<p>GUI: <b>Security &gt; AAA &gt; TACACS+ &gt; Authentication &gt; New</b>, phir order set karne ke liye <b>Security &gt; Priority Order &gt; Management User</b>. AAA server par WLC ko same secret ke saath network device ki tarah joda jaata hai, aur har administrator ko ek <b>role</b> diya jaata hai (jaise full access, ya read-only monitoring).</p>

<div class="eg"><p><b>Worked example.</b> Priority order TACACS+ phir local hai. Engineer Priya HTTPS par login karti hai. WLC uske credentials TCP 49 par 10.10.50.30 ko bhejta hai. Server role ALL ke saath <i>pass</i> reply karta hai, isliye use full read-write access milta hai. Baad mein AAA server maintenance ke liye down hai: WLC ko koi jawab nahi milta, woh local list par fallback karta hai, aur sirf emergency account <code>netops1</code> chalta hai. Agar server ne <i>fail</i> (galat password) jawab diya hota, WLC fallback <b>nahi</b> karta; local sirf tab use hota hai jab server unreachable ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "Convenience ke liye" HTTP aur Telnet enabled chhod dena. Sirf default admin account rakhna, jo sab share karte hain, taaki kisi ko pata na chale ki WLAN kisne badla. Order ko bina local fallback ke sirf TACACS+ set karna, phir server marne par sabko lock out kar dena. Management via wireless allow karna, taaki guest side ki ek galti controller ka login page expose kar de.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ = <b>TCP 49</b>, poora body encrypt karta hai, AAA alag karta hai, <b>device administration</b> ke liye preferred. RADIUS = <b>UDP 1812/1813</b>, sirf password encrypt karta hai, <b>network access</b> ke liye preferred. Telnet aur HTTP credentials clear text mein bhejte hain. SSH aur HTTPS secure choices hain.</p></div>

<div class="scn"><h4>Staff WLAN kisne delete kiya?</h4><p>Ek Monday ek hospital ka staff WLAN gayab tha. Har engineer HTTP par shared <code>admin</code> account use karta tha, isliye controller ka log sirf shared office ke ek desktop se "admin deleted WLAN 1" dikha raha tha. Koi nahi bata saka ki kisne kiya, aur HTTP session us network par koi bhi capture kar sakta tha. Fix ek management hardening project tha: sirf HTTPS aur SSH, Telnet aur HTTP disabled, management via wireless disabled, personal accounts aur roles ke saath Cisco ISE par TACACS+ authentication aur accounting, aur ek emergency local account jo safe mein rakha gaya. Agla change naam, time aur exact command ke saath log hua.</p><p><b>Seekh:</b> secure protocols password ko protect karte hain; personal accounts ke saath central AAA accountability deta hai.</p></div>

<div class="iv"><p class="q">"Wireless LAN controller ka management access kaise secure karoge? TACACS+ ya RADIUS, aur kyun?"</p><p>Strong answer: sirf HTTPS aur SSH allow karo, HTTP aur Telnet disable karo, management via wireless disable karo, management ko admin subnet ya service port tak restrict karo, aur naam wale accounts use karo. Administrators ko TACACS+ se centrally authenticate karo, kyunki yeh TCP 49 par chalta hai, poora payload encrypt karta hai, authorization alag karta hai taaki aap read-only ya full roles de sako, aur per-command accounting deta hai. AAA server unreachable hone ke liye ek local fallback account rakho. RADIUS bhi chalta hai, lekin woh mainly 802.1X jaise network access ke liye use hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HTTPS aur SSH use karo; HTTP (TCP 80) aur Telnet (TCP 23) disable karo.</li>
<li>Management via wireless disable karo aur limit karo ki kaunse subnets management interface tak pahunch sakte hain.</li>
<li>Device administration ke liye TACACS+ (TCP 49, full encryption, alag AAA) preferred hai.</li>
<li>RADIUS (UDP 1812/1813, sirf password encryption) mainly user network access ke liye hai.</li>
<li>Local fallback ke saath AAA priority set karo, jo sirf server unreachable hone par use hota hai.</li>
</ul></div>
`}};export{e as default};