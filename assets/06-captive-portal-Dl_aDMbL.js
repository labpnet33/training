var e={id:`captive-portal`,h:{en:`Captive portal and authentication rules`,hi:`Captive portal aur authentication rules`},body:{en:`
<p>Local, LDAP and RADIUS tell the firewall <i>where</i> to check a login. The next question is <i>how the user is asked</i>. For devices that are not managed by the company, such as guest phones and contractor laptops, the usual answer is a <b>captive portal</b>: the user opens a web page, the firewall intercepts the request, and a login page appears. After a successful login the original request goes through and later traffic from that device is matched to the user's identity.</p>
<div class="note"><p><b>Reference only.</b> The simulator has no portal, no user tables and no authentication rules. The blocks below are <b>Reference configuration (not run in the simulator)</b> and show no output. Exact option names differ between FortiOS releases, so confirm each one with <code>?</code> on your unit before you use it.</p></div>

<h3>How the portal is triggered</h3>
<ol>
<li>An unauthenticated user starts a web session through a policy that lists a user group.</li>
<li>The FortiGate cannot match a group policy yet, so it checks the authentication rules and redirects the browser to its own login page.</li>
<li>The user enters credentials. The FortiGate verifies them against local, LDAP or RADIUS sources.</li>
<li>On success the user is recorded as authenticated with an expiry time, and the policy matches from then on.</li>
</ol>
<p>The portal can intercept web traffic that the firewall can redirect. Encrypted HTTPS is redirected too, but the browser may show a certificate warning for the firewall's own certificate, which is why a proper certificate on the portal matters. Traffic that is not web, such as a game or a database client, cannot be redirected, so the user must authenticate in a browser first.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Captive portal flow">
<rect x="10" y="60" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="13">Guest phone</text><text x="70" y="104" text-anchor="middle" class="svg-muted" font-size="12">opens a site</text>
<rect x="190" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="255" y="86" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="255" y="104" text-anchor="middle" class="svg-muted" font-size="12">redirects</text>
<rect x="380" y="20" width="120" height="50" rx="10" fill="#fde68a"/><text x="440" y="50" text-anchor="middle" class="svg-ink" font-size="13">Login page</text>
<rect x="380" y="120" width="120" height="50" rx="10" fill="#fde68a"/><text x="440" y="150" text-anchor="middle" class="svg-ink" font-size="13">User check</text>
<rect x="540" y="60" width="90" height="60" rx="10" fill="#bbf7d0"/><text x="585" y="95" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="130" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="380" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="100" x2="380" y2="145" stroke="#64748b" stroke-width="2"/><line x1="500" y1="145" x2="540" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">The first web request triggers the login; later traffic is matched to the user.</p></div>

<h3>Authentication scheme and rule</h3>
<p>In recent FortiOS releases the portal behaviour is described by an authentication scheme and an authentication rule, which tell the firewall which sources are eligible and which method to use:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config authentication scheme
    edit "GUEST-FORM"
        set method form
        set user-database "local-user-db"
    next
end
config authentication rule
    edit "GUEST-RULE"
        set srcaddr "GUEST_NET"
        set active-auth-method "GUEST-FORM"
    next
end</pre>
<p><code>method form</code> shows an HTML login form. Other methods exist, such as negotiate for single sign-on with Kerberos; the rule decides which source addresses use which scheme. The names above are examples and the object fields change with the release, so read the option list on your unit.</p>

<h3>Policy for guests</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 40
        set name "GUEST-INTERNET"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "GUEST_NET"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "HTTP" "HTTPS" "DNS"
        set groups "GUESTS"
        set nat enable
        set logtraffic all
    next
end</pre>
<p>This guest policy lists only web and DNS, keeps guests on their own network, and limits access to the GUESTS group.</p>

<div class="eg"><p><b>Worked example.</b> A conference hall gives visitors Wi-Fi in 192.0.2.0/24. Visitors open any website and are redirected to a form, enter the daily code printed on a card, and reach the internet for four hours. The hall's staff network uses different policies, and guests cannot reach any internal address.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Giving guests the same internal access as staff; forgetting DNS in the guest policy, so the portal page cannot even start; a portal certificate that does not match, which trains users to click through warnings; very long timeouts on shared devices; allowing non-web services and wondering why they never prompt for login.</p></div>
<div class="exam"><p><b>Exam trap.</b> A captive portal only triggers for web traffic from an unauthenticated source that hits a policy requiring a user or group. It does not authenticate every protocol. Also, passing the portal gives an identity, not access: the policy still has to allow the traffic.</p></div>

<div class="scn"><h4>Guests who could not log in</h4><p>Visitors on the guest Wi-Fi saw a blank page. Their browsers could not resolve names, because the guest policy did not include DNS. The portal redirect needed a name lookup before the login page could open. Adding DNS to the policy fixed it and the team added a name-resolution test to the guest checklist.</p><p><b>Lesson:</b> every step before login also needs a policy.</p></div>

<div class="iv"><p class="q">"How does a captive portal work on a FortiGate?"</p><p>An unauthenticated user's web request hits a policy that requires a user group; the firewall redirects it to a login page, verifies the credentials against a local, LDAP or RADIUS source, and then treats later traffic from that device as that user until the timeout. Mention DNS, a valid portal certificate and isolating guests.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Captive portal prompts a user through the browser for devices the company does not manage.</li>
<li>Portal login is triggered by web traffic that hits a group-based policy.</li>
<li>Authentication schemes and rules choose method and sources; confirm option names for your release.</li>
<li>Guests need DNS and a narrow policy of their own.</li>
</ul></div>
`,hi:`
<p>Local, LDAP aur RADIUS firewall ko batate hain ki login <i>kahan</i> check karna hai. Agla sawal hai ki <i>user se kaise poochha jaye</i>. Un devices ke liye jo company manage nahi karti, jaise guest phones aur contractor laptops, aam jawab <b>captive portal</b> hai: user web page kholta hai, firewall request intercept karta hai, aur login page aata hai. Successful login ke baad original request aage jaati hai aur us device ka agla traffic user ki identity se match hota hai.</p>
<div class="note"><p><b>Reference only.</b> Simulator mein portal, user tables aur authentication rules nahi hain. Neeche ke blocks <b>Reference configuration (not run in the simulator)</b> hain aur koi output nahi dikhate. Exact option names FortiOS releases ke beech alag hote hain, isliye use karne se pehle apne unit par har ek ko <code>?</code> se confirm karo.</p></div>

<h3>Portal kaise trigger hota hai</h3>
<ol>
<li>Unauthenticated user aisi policy ke through web session shuru karta hai jo user group list karti hai.</li>
<li>FortiGate abhi group policy match nahi kar sakta, isliye woh authentication rules check karta hai aur browser ko apne login page par redirect karta hai.</li>
<li>User credentials daalta hai. FortiGate unhe local, LDAP ya RADIUS sources se verify karta hai.</li>
<li>Success par user expiry time ke saath authenticated record hota hai, aur tab se policy match karti hai.</li>
</ol>
<p>Portal woh web traffic intercept kar sakta hai jo firewall redirect kar sake. Encrypted HTTPS bhi redirect hota hai, lekin browser firewall ke apne certificate ke liye certificate warning dikha sakta hai, isliye portal par sahi certificate matter karta hai. Jo traffic web nahi hai, jaise game ya database client, redirect nahi ho sakta, isliye user ko pehle browser mein authenticate karna hoga.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Captive portal flow">
<rect x="10" y="60" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="13">Guest phone</text><text x="70" y="104" text-anchor="middle" class="svg-muted" font-size="12">site kholta hai</text>
<rect x="190" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="255" y="86" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="255" y="104" text-anchor="middle" class="svg-muted" font-size="12">redirect karta hai</text>
<rect x="380" y="20" width="120" height="50" rx="10" fill="#fde68a"/><text x="440" y="50" text-anchor="middle" class="svg-ink" font-size="13">Login page</text>
<rect x="380" y="120" width="120" height="50" rx="10" fill="#fde68a"/><text x="440" y="150" text-anchor="middle" class="svg-ink" font-size="13">User check</text>
<rect x="540" y="60" width="90" height="60" rx="10" fill="#bbf7d0"/><text x="585" y="95" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="130" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="380" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="100" x2="380" y2="145" stroke="#64748b" stroke-width="2"/><line x1="500" y1="145" x2="540" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Pehli web request login trigger karti hai; baad ka traffic user se match hota hai.</p></div>

<h3>Authentication scheme aur rule</h3>
<p>Naye FortiOS releases mein portal ka behaviour authentication scheme aur authentication rule se describe hota hai, jo firewall ko batate hain ki kaunse sources eligible hain aur kaunsa method use karna hai:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config authentication scheme
    edit "GUEST-FORM"
        set method form
        set user-database "local-user-db"
    next
end
config authentication rule
    edit "GUEST-RULE"
        set srcaddr "GUEST_NET"
        set active-auth-method "GUEST-FORM"
    next
end</pre>
<p><code>method form</code> HTML login form dikhata hai. Doosre methods bhi hain, jaise Kerberos ke saath single sign-on ke liye negotiate; rule decide karta hai ki kaunse source addresses kaunsi scheme use karein. Upar ke naam examples hain aur object fields release ke saath badalte hain, isliye apne unit par option list padho.</p>

<h3>Guests ke liye policy</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 40
        set name "GUEST-INTERNET"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "GUEST_NET"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "HTTP" "HTTPS" "DNS"
        set groups "GUESTS"
        set nat enable
        set logtraffic all
    next
end</pre>
<p>Yeh guest policy sirf web aur DNS list karti hai, guests ko unke apne network par rakhti hai, aur access ko GUESTS group tak limit karti hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek conference hall visitors ko 192.0.2.0/24 mein Wi-Fi deta hai. Visitors koi bhi website kholte hain aur form par redirect hote hain, card par chhapa daily code daalte hain, aur chaar ghante internet paate hain. Hall ka staff network alag policies use karta hai, aur guests kisi internal address tak nahi pahunch sakte.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Guests ko staff jaisa internal access dena; guest policy mein DNS bhool jaana, jisse portal page shuru hi nahi hota; portal certificate jo match nahi karta, jo users ko warnings par click karna sikhata hai; shared devices par bahut lambe timeouts; non-web services allow karna aur sochna ki login prompt kyun nahi aata.</p></div>
<div class="exam"><p><b>Exam trap.</b> Captive portal sirf unauthenticated source ke web traffic ke liye trigger hota hai jo aisi policy se takraye jise user ya group chahiye. Yeh har protocol ko authenticate nahi karta. Aur portal pass karne se identity milti hai, access nahi: policy ko phir bhi traffic allow karna padta hai.</p></div>

<div class="scn"><h4>Guests jo login nahi kar paye</h4><p>Guest Wi-Fi par visitors ko blank page dikha. Unke browsers names resolve nahi kar paye, kyunki guest policy mein DNS nahi tha. Portal redirect ko login page khulne se pehle name lookup chahiye tha. Policy mein DNS add karne se theek hua aur team ne guest checklist mein name-resolution test joda.</p><p><b>Lesson:</b> login se pehle ke har step ko bhi policy chahiye.</p></div>

<div class="iv"><p class="q">"FortiGate par captive portal kaise kaam karta hai?"</p><p>Unauthenticated user ki web request aisi policy se takraati hai jise user group chahiye; firewall use login page par redirect karta hai, local, LDAP ya RADIUS source se credentials verify karta hai, aur phir timeout tak us device ke baad ke traffic ko us user ka maanta hai. DNS, valid portal certificate aur guests ko isolate karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Captive portal un devices ke liye browser ke through user se poochta hai jo company manage nahi karti.</li>
<li>Portal login group-based policy se takraane wale web traffic se trigger hota hai.</li>
<li>Authentication schemes aur rules method aur sources chunte hain; apne release ke option names confirm karo.</li>
<li>Guests ko DNS aur apni narrow policy chahiye.</li>
</ul></div>
`}};export{e as default};