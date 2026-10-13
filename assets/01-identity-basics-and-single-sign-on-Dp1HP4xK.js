var e={id:`identity-sso`,h:{en:`Identity basics and single sign-on`,hi:`Identity basics aur single sign-on`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you can explain who a user is to the cloud security service, build and test a SAML trust, check that user accounts and groups arrive correctly, and fix the identity tickets that Sahyadri Logistics raises. <b>Prerequisites:</b> the earlier modules of this track (forwarding and policy order) and basic TLS and certificate knowledge. In the vendor's own wording the three services of this family are called ZIA, ZPA and ZDX; in this course we use the generic names internet access policy, private access and digital experience.</p>

<h3>The office reception analogy</h3>
<p>Think of a company reception. The guard asks "who are you?" and checks your ID card. That is <b>authentication</b>. Later a door reader decides "may this person enter the finance floor?". That is <b>authorisation</b>. Authentication proves identity; authorisation uses that identity, usually through a group such as Finance, to allow or block. In our portal every rule that names a group (Sales, Finance, Contractors) is an authorisation rule, and it can only work if authentication happened first.</p>

<h3>Why the cloud needs to know the user</h3>
<p>A firewall in the old world saw only an IP address. In the cloud service a hundred people may share the Pune public IP, and a remote worker has a home IP that means nothing. So the policy engine asks for a <b>user name and groups</b> instead. Rule "Sales cannot open social.example" needs to know kabir is in Sales. Without identity, only rules for "any user" can match.</p>

<h3>Identity provider and service provider</h3>
<dl class="terms">
<dt>Identity provider (IdP)</dt><dd>The system that owns passwords and proves who you are. For Sahyadri it is the company directory sign-in page.</dd>
<dt>Service provider (SP)</dt><dd>The service that wants to know who you are. Here the SP is the cloud security portal and its proxy.</dd>
<dt>Single sign-on (SSO)</dt><dd>You sign in once at the IdP and many services trust that result, so there is no separate password for each service.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Browser, service provider and identity provider">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="14">User browser</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">ravi at PC-PUN</text>
<rect x="250" y="10" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Cloud service (SP)</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">needs the user</text>
<rect x="480" y="70" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="14">Directory (IdP)</text><text x="550" y="120" text-anchor="middle" class="svg-muted" font-size="12">owns passwords</text>
<line x1="160" y1="90" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="390" y2="50" stroke="#64748b" stroke-width="2"/><line x1="160" y1="120" x2="480" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="195" y="60" class="svg-muted" font-size="12">1 who are you?</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">2 sign in at the directory</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">3 signed proof goes back to the service</text>
</svg><p class="cap">The service never sees the password; it trusts a signed answer from the directory.</p></div>

<h3>Where identity sits in the policy order</h3>
<p>You learned the cloud policy order earlier: identity first, then URL filtering, SSL, DLP, malware. Identity is first because every later rule may ask "which user and which group?". If identity fails, the request either stops with a sign-in error (code 401) or continues as an unknown user, depending on how the location is set.</p>

<h3>Two ways the user is identified</h3>
<ul>
<li><b>From a site</b> (IPsec, GRE or PAC): the location setting <i>Authentication required</i> decides. If it is on, the user signs in with SAML on the first web request. If it is off, the user stays unknown.</li>
<li><b>From the client connector</b>: the connector signs in with SAML when the user logs in, so the identity travels with the tunnel, even from home.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> kabir in Jaipur opens social.example. If the Jaipur location requires authentication, he signs in once, the engine learns "kabir, Sales", and the Sales rule applies. If authentication is off, the engine sees "unknown user" and the Sales rule is skipped.</p></div>
<pre class="out">Policy tester   user: kabir   host: social.example   location: jpr
Identity .......... kabir (Sales)   source: SAML
URL rule .......... <span class="hl">Block social for Sales</span>   action: block
Result ............ 403 blocked</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Turning authentication on for a location adds a sign-in redirect to the first web request from that site and gives every later rule a user and groups to match. Nothing changes in the tunnel itself; only the policy inputs change. Turning it off removes the redirect and every group rule stops matching.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Mixing up authentication and authorisation in an answer. (2) Assuming a group rule works for all traffic. (3) Thinking SSO stores the password in the cloud service; it does not.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Who holds the password?" Always the identity provider. The service provider only receives a signed statement.</p></div>

<div class="scn"><h4>The rule that never fired</h4><p>A new Sales rule worked in Pune but the Jaipur team kept reaching social.example. The engineer did not edit the rule. She opened the Jaipur location and saw authentication was off, so every Jaipur user was "unknown". Turning it on fixed the behaviour.</p><p><b>Lesson:</b> a group rule is only as good as the identity feeding it.</p></div>

<div class="iv"><p class="q">"What is the difference between authentication and authorisation?"</p><p>Authentication proves who you are; authorisation decides what that identity may do. Mention groups, that the cloud policy needs a known user for group rules, and that SSO moves the proof of identity to a directory instead of the service.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authentication proves identity; authorisation allows or blocks using it.</li>
<li>The IdP owns passwords; the service provider trusts a signed answer.</li>
<li>Identity is the first step in the cloud policy order.</li>
<li>Sites need Authentication required on; the client connector signs in on its own.</li>
<li>No identity means group rules cannot match.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Is module ke end tak aap explain kar paoge ki cloud security service ke liye user kaun hota hai, SAML trust kaise banate aur test karte hain, user accounts aur groups sahi aate hain ya nahi kaise check karte hain, aur Sahyadri Logistics ke identity tickets kaise fix karte hain. <b>Prerequisites:</b> is track ke pichhle modules (forwarding aur policy order) aur basic TLS aur certificate knowledge. Vendor ke apne wording mein is family ki teen services ZIA, ZPA aur ZDX kehlati hain; is course mein hum generic naam use karte hain: internet access policy, private access aur digital experience.</p>

<h3>Office reception ka analogy</h3>
<p>Company reception socho. Guard poochta hai "aap kaun ho?" aur ID card check karta hai. Yeh <b>authentication</b> hai. Baad mein door reader decide karta hai "kya yeh person finance floor mein ja sakta hai?". Yeh <b>authorisation</b> hai. Authentication identity prove karta hai; authorisation us identity ko, aam taur par Finance jaise group ke through, allow ya block ke liye use karta hai. Hamare portal mein har rule jo group (Sales, Finance, Contractors) ka naam leta hai woh authorisation rule hai, aur woh tabhi chalega jab authentication pehle ho chuka ho.</p>

<h3>Cloud ko user kyun jaanna padta hai</h3>
<p>Purani duniya mein firewall sirf IP address dekhta tha. Cloud service mein Pune ke ek public IP ke peeche sau log ho sakte hain, aur remote worker ka home IP kuch matlab nahi rakhta. Isliye policy engine <b>user name aur groups</b> poochta hai. Rule "Sales social.example nahi khol sakta" ko jaanna padta hai ki kabir Sales mein hai. Identity ke bina sirf "any user" wale rules match hote hain.</p>

<h3>Identity provider aur service provider</h3>
<dl class="terms">
<dt>Identity provider (IdP)</dt><dd>Woh system jo passwords rakhta hai aur prove karta hai ki aap kaun ho. Sahyadri ke liye yeh company directory ka sign-in page hai.</dd>
<dt>Service provider (SP)</dt><dd>Woh service jo jaanna chahti hai ki aap kaun ho. Yahan SP cloud security portal aur uska proxy hai.</dd>
<dt>Single sign-on (SSO)</dt><dd>Aap IdP par ek baar sign in karte ho aur kai services us result par trust karti hain, to har service ka alag password nahi hota.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Browser, service provider aur identity provider">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="14">User browser</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">ravi at PC-PUN</text>
<rect x="250" y="10" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Cloud service (SP)</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">user chahiye</text>
<rect x="480" y="70" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="14">Directory (IdP)</text><text x="550" y="120" text-anchor="middle" class="svg-muted" font-size="12">passwords rakhta hai</text>
<line x1="160" y1="90" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="390" y2="50" stroke="#64748b" stroke-width="2"/><line x1="160" y1="120" x2="480" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="195" y="60" class="svg-muted" font-size="12">1 aap kaun?</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">2 directory par sign in</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">3 signed proof service ko wapas</text>
</svg><p class="cap">Service password kabhi nahi dekhti; woh directory ke signed jawab par trust karti hai.</p></div>

<h3>Policy order mein identity kahan hai</h3>
<p>Aapne pehle cloud policy order seekha: pehle identity, phir URL filtering, SSL, DLP, malware. Identity pehle isliye hai kyunki baad ka har rule poochh sakta hai "kaun sa user aur kaun sa group?". Identity fail ho to request ya to sign-in error (code 401) ke saath ruk jaati hai, ya unknown user ke roop mein aage badhti hai, yeh location ki setting par depend karta hai.</p>

<h3>User ki pehchaan do tareeke se</h3>
<ul>
<li><b>Site se</b> (IPsec, GRE ya PAC): location ki setting <i>Authentication required</i> decide karti hai. On ho to user pehli web request par SAML se sign in karta hai. Off ho to user unknown rehta hai.</li>
<li><b>Client connector se</b>: user login karta hai tab connector SAML se sign in karta hai, to identity tunnel ke saath chalti hai, ghar se bhi.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Jaipur mein kabir social.example kholta hai. Agar Jaipur location authentication require karti hai, to woh ek baar sign in karta hai, engine ko "kabir, Sales" pata chalta hai, aur Sales rule lagta hai. Authentication off ho to engine "unknown user" dekhta hai aur Sales rule skip ho jaata hai.</p></div>
<pre class="out">Policy tester   user: kabir   host: social.example   location: jpr
Identity .......... kabir (Sales)   source: SAML
URL rule .......... <span class="hl">Block social for Sales</span>   action: block
Result ............ 403 blocked</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Location par authentication on karne se us site ki pehli web request mein sign-in redirect judta hai aur baad ke har rule ko match karne ke liye user aur groups milte hain. Tunnel mein kuch nahi badalta; sirf policy ke inputs badalte hain. Off karne par redirect hat jaata hai aur har group rule match karna band kar deta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Jawab mein authentication aur authorisation ko mix kar dena. (2) Maan lena ki group rule saare traffic par chalta hai. (3) Sochna ki SSO password cloud service mein store karta hai; aisa nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Password kiske paas hota hai?" Hamesha identity provider ke paas. Service provider ko sirf signed statement milta hai.</p></div>

<div class="scn"><h4>Woh rule jo kabhi fire nahi hua</h4><p>Naya Sales rule Pune mein chala lekin Jaipur team social.example kholti rahi. Engineer ne rule edit nahi kiya. Usne Jaipur location kholi aur dekha authentication off hai, to har Jaipur user "unknown" tha. Use on karne se behaviour theek ho gaya.</p><p><b>Seekh:</b> group rule utna hi achha hai jitni achhi identity use feed ho rahi hai.</p></div>

<div class="iv"><p class="q">"Authentication aur authorisation mein kya farak hai?"</p><p>Authentication prove karta hai aap kaun ho; authorisation decide karta hai ki woh identity kya kar sakti hai. Groups mention karo, yeh ki cloud policy ko group rules ke liye known user chahiye, aur yeh ki SSO identity ka proof service ki jagah directory ko de deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authentication identity prove karta hai; authorisation use karke allow ya block karta hai.</li>
<li>IdP passwords rakhta hai; service provider signed jawab par trust karta hai.</li>
<li>Cloud policy order mein identity pehla step hai.</li>
<li>Sites par Authentication required on chahiye; client connector khud sign in karta hai.</li>
<li>Identity nahi to group rules match nahi hote.</li>
</ul></div>
`}};export{e as default};