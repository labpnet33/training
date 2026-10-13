var e={id:`web-auth`,h:{en:`Web authentication: LWA on the controller, CWA as concept`,hi:`Web authentication: controller par LWA, CWA concept ke taur par`},body:{en:`
<p>Think of the reception desk of an office. A visitor walks in, the guard does not let them past the lobby, and a clipboard asks for a name and a signature. Only then does the guard open the inner door. <b>Web authentication</b> is that lobby for Wi-Fi: the client may connect to the radio network and get an IP address, but it is held in a waiting state until it signs in on a web page.</p>

<h3>Two flavours: local and central</h3>
<ul>
<li><b>LWA, Local Web Authentication.</b> The controller itself serves the login page and checks the credentials against its own local user list or a RADIUS server group. This is what lab 1 builds.</li>
<li><b>CWA, Central Web Authentication.</b> The controller only redirects the browser; the login page, the credentials check and the policy decision live on a central server such as Cisco ISE. CWA is <b>concept only</b> in this simulator; chapter 3 covers its flow.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Local web authentication flow">
<rect x="10" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Guest phone</text>
<rect x="260" y="70" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="320" y="111" text-anchor="middle" class="svg-muted" font-size="11">serves login page</text>
<rect x="510" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="47" text-anchor="middle" class="svg-ink" font-size="12">Local users</text>
<rect x="510" y="130" width="120" height="44" rx="8" fill="#fde68a"/><text x="570" y="152" text-anchor="middle" class="svg-ink" font-size="12">or RADIUS group</text>
<line x1="120" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="85" x2="510" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="105" x2="510" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="190" y="85" text-anchor="middle" class="svg-muted" font-size="11">1 associate, DHCP</text>
<text x="190" y="118" text-anchor="middle" class="svg-muted" font-size="11">2 browser, sign in</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">3 success: client state RUN</text>
</svg><p class="cap">The client first gets an address, then signs in. Until then only DHCP and DNS pass.</p></div>

<h3>The WEBAUTH_REQUIRED state</h3>
<p>A WLAN with web authentication has <b>no WPA</b> on Layer 2: it is open. The client associates, receives an address from the DHCP server, and the controller marks it <code>WEBAUTH_REQUIRED</code>. In that state only <b>DHCP (UDP 67 and 68)</b> and <b>DNS (UDP 53)</b> pass. Even a ping to the default gateway is dropped by the controller. DNS is allowed so that the client's browser can resolve a name and be intercepted and redirected to the login page. After successful login the state becomes <code>RUN</code> and the policy profile VLAN and ACL apply normally.</p>

<h3>The objects, in dependency order</h3>
<p>Lab 1 builds four things on the controller, then the WLAN:</p>
<ol>
<li>A <b>local user</b> and AAA turned on: <code>username guest1 password 0 Guest@123</code> and <code>aaa new-model</code>.</li>
<li>A <b>login method list</b> that says where to check credentials: <code>aaa authentication login GUEST-LIST local</code>.</li>
<li>The <b>controller web server</b>, which serves the page: <code>ip h&#116;tp server</code> (and optionally <code>ip h&#116;tp secure-server</code>).</li>
<li>A <b>parameter map</b> that defines the page: <code>parameter-map type webauth PM-GUEST</code>.</li>
</ol>
<pre class="code"><span class="c">! credentials and AAA</span>
username guest1 password 0 Guest@123
aaa new-model
aaa authentication login GUEST-LIST local
<span class="c">! controller web server serves the login page</span>
ip h&#116;tp server
<span class="c">! the page definition</span>
parameter-map type webauth PM-GUEST
 type webauth
 banner text ^CNK guest access. Sign in to continue.^C
 exit
<span class="c">! the WLAN: open + web auth, bound to list and map</span>
wlan NK-GUEST 3 NK-GUEST
 no security wpa
 security web-auth
 security web-auth authentication-list GUEST-LIST
 security web-auth parameter-map PM-GUEST
 no shutdown
 exit
wireless profile policy PP-GUEST
 vlan 50
 no shutdown
 exit
<span class="c">! then policy tag PT-CAMPUS maps NK-GUEST to PP-GUEST and both APs wear it</span></pre>
<p>The <b>parameter map type</b> decides the page: <code>webauth</code> asks for user and password, <code>consent</code> shows only an "accept" button (terms of use), <code>webconsent</code> asks for both. The special map named <code>global</code> is the fallback if a WLAN names no map; it also holds <code>virtual-ip ipv4</code>, the dummy address the client's browser is redirected to. Web UI: <b>Configuration &gt; Security &gt; Web Auth</b> for the parameter map and the web auth binding, and <b>Configuration &gt; Security &gt; AAA</b> for local users and method lists. A real RADIUS group works too: <code>aaa authentication login GUEST-LIST group RADIUS-GRP local</code>.</p>

<h3>Verify</h3>
<pre class="out">WLC1# show wireless client mac-address 0050.7966.6801 detail
...
<span class="hl">Client State       : WEBAUTH_REQUIRED</span>
Policy Manager State: Webauth Pending
Auth Method Status List
  Method           : Web Auth
  Webauth State    : Login

PHONE1&gt; wifi webauth user guest1 password Guest@123
%WEBAUTH-6-SUCCESS: Client 0050.7966.6801 web authentication succeeded (user guest1) on WLAN 3 (NK-GUEST), client state RUN</pre>
<p>The sign-in order that the controller checks: web server on, parameter map exists, map type needs credentials, WLAN has an authentication list, AAA is on, the list exists, then the user is checked. Each failure has its own message, which is why web auth troubleshooting (chapter 10) is a checklist, not guesswork.</p>

<h3>Banner hygiene and consent pages</h3>
<p>Keep the banner short and factual: who owns the network, acceptable use, and that activity may be logged as the law requires. Do not put internal hostnames, ticket numbers or credentials on a page that unauthenticated visitors can see. For public venues, a <code>consent</code> page is often enough and avoids handing out credentials at all.</p>

<div class="eg"><p><b>Worked example.</b> A cafe uses <code>type consent</code> with a banner that shows the terms. Customers tap Accept, the state moves to RUN, and the ACL (chapter 4) lets them reach the internet but not the cash-register VLAN. No passwords to give out, but the cafe still has a record of acceptance.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a login list name on the WLAN that differs from the AAA command (GUEST-LOGIN versus GUEST-LIST). Forgetting <code>aaa new-model</code>. Leaving the controller web server off. Naming a parameter map that does not exist. Trying to combine web auth with 802.1X on one WLAN: the controller refuses it.</p></div>

<div class="exam"><p><b>Exam traps.</b> Web auth is Layer 3 security: the Layer 2 part is open. Web auth does not encrypt. LWA serves the page on the controller; CWA redirects to an external server. Pre-login ACLs and redirect ACLs are different things (chapter 3).</p></div>

<div class="scn"><h4>The page that never opened</h4><p>After a controller upgrade a venue's guests got an IP address but the browser just spun. The engineer checked the client detail: WEBAUTH_REQUIRED, so association and DHCP were fine. The WLAN pointed at a parameter map that had been deleted during cleanup. Re-creating the map with <code>type webauth</code> restored the page; the engineer then added the map name to the change checklist.</p><p><b>Lesson:</b> a client in WEBAUTH_REQUIRED means the radio side works. Look at the bindings next.</p></div>

<div class="iv"><p class="q">"A guest says they are connected to Wi-Fi but cannot browse. How do you know whether it is a web auth problem?"</p><p>Check the client state on the controller. WEBAUTH_REQUIRED plus a valid IP means the client is simply waiting for login, so I verify the web server, the parameter map, the list binding and AAA. If the client has no IP, it is a DHCP or VLAN problem instead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Web auth runs on an open WLAN: the client associates, gets DHCP, and waits in WEBAUTH_REQUIRED.</li>
<li>Only DHCP and DNS pass before login; login moves the client to RUN.</li>
<li>LWA needs: user, aaa new-model, login list, web server, parameter map, WLAN bindings.</li>
<li>Parameter map types: webauth, consent, webconsent; global is the fallback map.</li>
<li>CWA with ISE is concept only; web auth never encrypts traffic.</li>
</ul></div>
`,hi:`
<p>Office ki reception desk socho. Visitor andar aata hai, guard use lobby se aage nahi jaane deta, aur ek clipboard naam aur signature maangta hai. Tabhi guard andar ka darwaza kholta hai. <b>Web authentication</b> Wi-Fi ke liye wahi lobby hai: client radio network se connect ho sakta hai aur IP address le sakta hai, lekin jab tak woh web page par sign in na kare use waiting state mein rakha jata hai.</p>

<h3>Do flavours: local aur central</h3>
<ul>
<li><b>LWA, Local Web Authentication.</b> Controller khud login page serve karta hai aur credentials apni local user list ya RADIUS server group se check karta hai. Lab 1 yahi banata hai.</li>
<li><b>CWA, Central Web Authentication.</b> Controller sirf browser ko redirect karta hai; login page, credentials ki checking aur policy decision Cisco ISE jaise central server par hote hain. Is simulator mein CWA <b>concept only</b> hai; chapter 3 mein uska flow hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Local web authentication flow">
<rect x="10" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Guest phone</text>
<rect x="260" y="70" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="320" y="111" text-anchor="middle" class="svg-muted" font-size="11">login page serve karta</text>
<rect x="510" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="47" text-anchor="middle" class="svg-ink" font-size="12">Local users</text>
<rect x="510" y="130" width="120" height="44" rx="8" fill="#fde68a"/><text x="570" y="152" text-anchor="middle" class="svg-ink" font-size="12">ya RADIUS group</text>
<line x1="120" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="85" x2="510" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="105" x2="510" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="190" y="85" text-anchor="middle" class="svg-muted" font-size="11">1 associate, DHCP</text>
<text x="190" y="118" text-anchor="middle" class="svg-muted" font-size="11">2 browser, sign in</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">3 success: client state RUN</text>
</svg><p class="cap">Client pehle address leta hai, phir sign in karta hai. Tab tak sirf DHCP aur DNS pass hote hain.</p></div>

<h3>WEBAUTH_REQUIRED state</h3>
<p>Web authentication wale WLAN par Layer 2 par <b>koi WPA nahi</b> hota: woh open hai. Client associate hota hai, DHCP server se address leta hai, aur controller use <code>WEBAUTH_REQUIRED</code> mark karta hai. Is state mein sirf <b>DHCP (UDP 67 aur 68)</b> aur <b>DNS (UDP 53)</b> pass hote hain. Default gateway ka ping bhi controller drop kar deta hai. DNS isliye allowed hai ki client ka browser naam resolve kare aur intercept hokar login page par redirect ho. Successful login ke baad state <code>RUN</code> ho jati hai aur policy profile ka VLAN aur ACL normal lagte hain.</p>

<h3>Objects, dependency ke order mein</h3>
<p>Lab 1 controller par chaar cheezein banata hai, phir WLAN:</p>
<ol>
<li>Ek <b>local user</b> aur AAA on: <code>username guest1 password 0 Guest@123</code> aur <code>aaa new-model</code>.</li>
<li>Ek <b>login method list</b> jo batati hai credentials kahan check hon: <code>aaa authentication login GUEST-LIST local</code>.</li>
<li><b>Controller web server</b>, jo page serve karta hai: <code>ip h&#116;tp server</code> (aur optionally <code>ip h&#116;tp secure-server</code>).</li>
<li>Ek <b>parameter map</b> jo page define karta hai: <code>parameter-map type webauth PM-GUEST</code>.</li>
</ol>
<pre class="code"><span class="c">! credentials aur AAA</span>
username guest1 password 0 Guest@123
aaa new-model
aaa authentication login GUEST-LIST local
<span class="c">! controller web server login page serve karta hai</span>
ip h&#116;tp server
<span class="c">! page ki definition</span>
parameter-map type webauth PM-GUEST
 type webauth
 banner text ^CNK guest access. Sign in to continue.^C
 exit
<span class="c">! WLAN: open + web auth, list aur map se bandha</span>
wlan NK-GUEST 3 NK-GUEST
 no security wpa
 security web-auth
 security web-auth authentication-list GUEST-LIST
 security web-auth parameter-map PM-GUEST
 no shutdown
 exit
wireless profile policy PP-GUEST
 vlan 50
 no shutdown
 exit
<span class="c">! phir policy tag PT-CAMPUS NK-GUEST ko PP-GUEST se map karta hai aur dono APs wahi tag pehente hain</span></pre>
<p><b>Parameter map type</b> page tay karta hai: <code>webauth</code> user aur password maangta hai, <code>consent</code> sirf "accept" button dikhata hai (terms of use), <code>webconsent</code> dono maangta hai. <code>global</code> naam ka special map fallback hai agar WLAN koi map naam na de; usme <code>virtual-ip ipv4</code> bhi hota hai, woh dummy address jahan client ka browser redirect hota hai. Web UI: parameter map aur web auth binding ke liye <b>Configuration &gt; Security &gt; Web Auth</b>, aur local users aur method lists ke liye <b>Configuration &gt; Security &gt; AAA</b>. Asli RADIUS group bhi chalta hai: <code>aaa authentication login GUEST-LIST group RADIUS-GRP local</code>.</p>

<h3>Verify</h3>
<pre class="out">WLC1# show wireless client mac-address 0050.7966.6801 detail
...
<span class="hl">Client State       : WEBAUTH_REQUIRED</span>
Policy Manager State: Webauth Pending
Auth Method Status List
  Method           : Web Auth
  Webauth State    : Login

PHONE1&gt; wifi webauth user guest1 password Guest@123
%WEBAUTH-6-SUCCESS: Client 0050.7966.6801 web authentication succeeded (user guest1) on WLAN 3 (NK-GUEST), client state RUN</pre>
<p>Controller sign-in ke time yeh order check karta hai: web server on, parameter map exist karta hai, map type credentials maangta hai, WLAN ke paas authentication list hai, AAA on hai, list exist karti hai, phir user check hota hai. Har failure ka apna message hai, isliye web auth troubleshooting (chapter 10) checklist hai, andaaza nahi.</p>

<h3>Banner hygiene aur consent pages</h3>
<p>Banner chhota aur factual rakho: network kiska hai, acceptable use, aur yeh ki activity kanoon ke hisaab se log ho sakti hai. Aise page par jo unauthenticated visitors dekh sakte hain, internal hostnames, ticket numbers ya credentials mat daalo. Public venues ke liye aksar <code>consent</code> page kaafi hota hai aur credentials baantne ki zaroorat hi nahi padti.</p>

<div class="eg"><p><b>Worked example.</b> Ek cafe <code>type consent</code> use karta hai aur banner mein terms dikhata hai. Customers Accept dabate hain, state RUN ho jati hai, aur ACL (chapter 4) unhe internet tak jaane deta hai lekin cash-register VLAN tak nahi. Password dene ki zaroorat nahi, phir bhi cafe ke paas acceptance ka record hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> WLAN par aisa login list naam use karna jo AAA command se alag ho (GUEST-LOGIN versus GUEST-LIST). <code>aaa new-model</code> bhool jana. Controller web server off chhodna. Aisa parameter map naam dena jo exist nahi karta. Web auth aur 802.1X ko ek WLAN par milana: controller refuse karta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Web auth Layer 3 security hai: Layer 2 wala hissa open hai. Web auth encrypt nahi karta. LWA page controller par serve karta hai; CWA external server par redirect karta hai. Pre-login ACLs aur redirect ACLs alag cheezein hain (chapter 3).</p></div>

<div class="scn"><h4>Woh page jo kabhi khula hi nahi</h4><p>Controller upgrade ke baad ek venue ke guests ko IP address mila lekin browser bas ghoomta raha. Engineer ne client detail dekhi: WEBAUTH_REQUIRED, matlab association aur DHCP theek the. WLAN ek aise parameter map ki taraf point kar raha tha jo cleanup mein delete ho gaya tha. <code>type webauth</code> ke saath map dobara banane se page wapas aaya; engineer ne map ka naam change checklist mein joda.</p><p><b>Lesson:</b> WEBAUTH_REQUIRED mein client ka matlab radio side theek hai. Agla step bindings dekhna hai.</p></div>

<div class="iv"><p class="q">"Guest kehta hai woh Wi-Fi se connected hai lekin browse nahi kar pa raha. Aapko kaise pata chalega ki yeh web auth problem hai?"</p><p>Controller par client state dekhta hoon. WEBAUTH_REQUIRED aur valid IP ka matlab client bas login ka wait kar raha hai, to main web server, parameter map, list binding aur AAA verify karta hoon. Agar client ko IP hi nahi mila, to woh DHCP ya VLAN problem hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Web auth open WLAN par chalta hai: client associate hota hai, DHCP leta hai, aur WEBAUTH_REQUIRED mein wait karta hai.</li>
<li>Login se pehle sirf DHCP aur DNS pass hote hain; login client ko RUN mein le jata hai.</li>
<li>LWA ko chahiye: user, aaa new-model, login list, web server, parameter map, WLAN bindings.</li>
<li>Parameter map types: webauth, consent, webconsent; global fallback map hai.</li>
<li>ISE ke saath CWA concept only hai; web auth traffic kabhi encrypt nahi karta.</li>
</ul></div>
`}};export{e as default};