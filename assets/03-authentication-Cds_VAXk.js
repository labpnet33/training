var e={id:`authentication`,h:{en:`Authentication methods and sources, and why they are not authorization`,hi:`Authentication methods aur sources, aur woh authorization kyun nahi`},body:{en:`
<p>At the airport, the officer at the passport desk checks that the passport is real and belongs to you. That is authentication. Whether you may enter the business lounge is a different question, answered later by a different list. ClearPass keeps the same separation. Once a service is chosen, ClearPass first answers only one question: <b>is this identity genuine?</b> It uses an <b>authentication method</b> (how to check) against an <b>authentication source</b> (where the truth is stored).</p>

<h3>Methods: how the proof is checked</h3>
<p>A method is a protocol the client and server agree on. The ones you meet in this track:</p>
<table class="cmp"><tr><th>Method</th><th>Used for</th><th>Notes</th></tr>
<tr><td>[EAP PEAP] with [EAP MSCHAPv2] inside</td><td>Laptops with a supplicant, user name and password</td><td>PEAP builds a TLS tunnel first, the password check runs inside it</td></tr>
<tr><td>[MAC AUTH]</td><td>Printers, cameras, phones without a supplicant</td><td>The MAC address must exist in the Endpoints Repository</td></tr>
<tr><td>[Allow All MAC AUTH]</td><td>Profiling or visibility only</td><td>Accepts every MAC at the authentication stage, so enforcement must do the real work</td></tr>
<tr><td>EAP-TLS</td><td>Certificate based, strongest</td><td>Needs a PKI or ClearPass Onboard. Not simulated in the lab</td></tr></table>
<p>The service lists which methods it accepts. If the client offers a method the service does not enable, the request fails with an authentication alert. In the lab model this is error 9005, "Unsupported EAP method".</p>

<h3>Sources: where the truth is stored</h3>
<p>A source is a database that holds the identity. The lab knows two:</p>
<ul>
<li><b>[Local User Repository]</b>: user accounts stored inside ClearPass itself, under Configuration &gt; Identity &gt; Local Users. Each user has a name, a password, an enabled flag, an optional role, and free attributes such as Department.</li>
<li><b>[Endpoints Repository]</b>: the table of known devices by MAC address, under Configuration &gt; Identity &gt; Endpoints. Each endpoint has a status (known, unknown, disabled) and attributes such as Category=Printer.</li>
</ul>
<p>In real companies the main source is usually a directory. <b>Active Directory</b> or another <b>LDAP</b> server holds the staff accounts, and the group memberships and attributes in it become the input for role mapping. ClearPass joins the domain, validates passwords against the domain controller and can read attributes such as memberOf or department. <b>Joining a domain and the AD/LDAP source are concept-only here and are not simulated in the lab.</b> What you learn from the Local User Repository transfers directly: the source supplies attributes, and role mapping reads them.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Methods and sources feed role mapping">
<rect x="14" y="18" width="190" height="46" rx="8" fill="#bae6fd"/><text x="109" y="46" text-anchor="middle" class="svg-ink" font-size="13">Method: EAP PEAP</text>
<rect x="14" y="76" width="190" height="46" rx="8" fill="#bbf7d0"/><text x="109" y="104" text-anchor="middle" class="svg-ink" font-size="13">Method: MAC AUTH</text>
<rect x="250" y="18" width="190" height="46" rx="8" fill="#ddd6fe"/><text x="345" y="40" text-anchor="middle" class="svg-ink" font-size="13">Local User Repository</text><text x="345" y="56" text-anchor="middle" class="svg-muted" font-size="11">Department=Engineering</text>
<rect x="250" y="76" width="190" height="46" rx="8" fill="#fde68a"/><text x="345" y="98" text-anchor="middle" class="svg-ink" font-size="13">Endpoints Repository</text><text x="345" y="114" text-anchor="middle" class="svg-muted" font-size="11">Category=Printer</text>
<rect x="486" y="40" width="140" height="62" rx="8" fill="#fed7aa"/><text x="556" y="66" text-anchor="middle" class="svg-ink" font-size="13">Attributes go to</text><text x="556" y="84" text-anchor="middle" class="svg-ink" font-size="13">role mapping</text>
<g stroke="#64748b" stroke-width="2"><line x1="204" y1="41" x2="250" y2="41"/><line x1="204" y1="99" x2="250" y2="99"/><line x1="440" y1="41" x2="486" y2="62"/><line x1="440" y1="99" x2="486" y2="82"/></g>
<text x="320" y="164" text-anchor="middle" class="svg-accent" font-size="13">Not simulated: Active Directory / LDAP source (same idea, real groups)</text>
</svg><p class="cap">A method checks the proof against a source. The same source also supplies the attributes used in the next stage.</p></div>

<h3>Authentication versus authorization</h3>
<p>Authentication ends with pass or fail. Authorization is what the user is allowed to do and it is decided by roles and enforcement later. The Authentication stage can still add context: after a successful login ClearPass collects attributes from the source (the lab calls the user ones Local:Department and the endpoint ones Endpoint:Category). Those are the facts the next stage uses. In the real product these appear as Authorization attributes of the source, and an authorization source can even be a different system from the one that proved the password.</p>

<h3>Error codes you must recognise</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Typical fix</th></tr>
<tr><td>215</td><td>Password mismatch</td><td>Reset the password, or fix the client credentials</td></tr>
<tr><td>216</td><td>User or endpoint not found</td><td>Create the user, or add the MAC to the Endpoints Repository</td></tr>
<tr><td>217</td><td>Account disabled</td><td>Enable the user or endpoint, after checking why it was disabled</td></tr></table>

<h3>Lab shell: a user with an attribute</h3>
<pre class="code"><span class="c">! Configuration &gt; Identity &gt; Local Users (Lab shell on CPPM)</span>
configuration identity local-user add alice password Pass@2024 attr Department=Engineering
configuration identity local-user add bob password Pass@2025 attr Department=Contractor
configuration identity local-user show</pre>
<pre class="out">Configuration &gt; Identity &gt; Local Users
Name   Status   Role  Attributes
-----  -------  ----  ----------------------
alice  enabled        Department=Engineering
bob    enabled        Department=Contractor</pre>
<p>Lab output, representative of the layout. The attribute is what role mapping will read in the next chapter. If Bob had no Department attribute at all, no Department rule could ever match him.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading a reject as "wrong password" when the alert is 216 or 217. Typing the attribute value with a different spelling, for example Contractors in the user and Contractor in the rule. Enabling [Allow All MAC AUTH] and then forgetting that every MAC now passes authentication. Expecting attributes of a source the service does not list.</p></div>
<div class="exam"><p><b>Exam trap.</b> A MAC-auth service needs the Endpoints Repository as a source. A user service needs a user source. A source not attached to the service is never consulted, even if it holds the right user.</p></div>

<div class="scn"><h4>Spelling that cost an afternoon</h4><p>A new batch of contractors authenticated fine but landed in the default deny. The role mapping rule said Department EQUALS Contractor. The accounts had been created from a spreadsheet with Department=Contractors. Authentication passed, so the helpdesk blamed ClearPass. Opening the Input and Summary tabs showed only [User Authenticated] in the roles. Correcting the spelling in the accounts (one bulk edit) fixed them all.</p><p><b>Lesson:</b> a role mapping rule compares text exactly. When roles are missing, compare the real attribute with the rule value letter by letter.</p></div>

<div class="iv"><p class="q">"What is the difference between an authentication source and an authorization source?"</p><p>Strong answer: the authentication source proves the identity with the chosen method; an authorization source supplies attributes (group, department, endpoint category) that role mapping and policy use. They are often the same system, such as Active Directory, but they do not have to be. Mention that AD/LDAP is the usual enterprise source and that local users and the Endpoints Repository are the simple built-in ones.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A method says how to check; a source says where the truth lives.</li>
<li>PEAP/MSCHAPv2 for users, MAC AUTH for devices, EAP-TLS needs certificates and is not simulated.</li>
<li>Local User Repository and Endpoints Repository are in the lab; AD and LDAP are concept-only.</li>
<li>215 password mismatch, 216 not found, 217 disabled.</li>
<li>Attributes collected here feed role mapping next.</li>
</ul></div>
`,hi:`
<p>Airport par passport desk ka officer check karta hai ki passport asli hai aur aapka hi hai. Yeh authentication hai. Aap business lounge mein ja sakte ho ya nahi, yeh alag sawaal hai, jiska jawab baad mein alag list deti hai. ClearPass bhi yahi separation rakhta hai. Service chun li jaaye to ClearPass pehle sirf ek sawaal poochta hai: <b>kya yeh identity asli hai?</b> Woh ek <b>authentication method</b> (kaise check karna hai) ek <b>authentication source</b> (sach kahan store hai) ke against use karta hai.</p>

<h3>Methods: proof kaise check hota hai</h3>
<p>Method ek protocol hai jis par client aur server sahmat hote hain. Is track mein jo milenge:</p>
<table class="cmp"><tr><th>Method</th><th>Kis liye</th><th>Notes</th></tr>
<tr><td>[EAP PEAP] aur andar [EAP MSCHAPv2]</td><td>Supplicant wale laptops, user name aur password</td><td>PEAP pehle TLS tunnel banata hai, password check uske andar chalta hai</td></tr>
<tr><td>[MAC AUTH]</td><td>Printers, cameras, bina supplicant wale phones</td><td>MAC address Endpoints Repository mein hona chahiye</td></tr>
<tr><td>[Allow All MAC AUTH]</td><td>Sirf profiling ya visibility</td><td>Authentication stage par har MAC accept karta hai, isliye asli kaam enforcement ko karna padta hai</td></tr>
<tr><td>EAP-TLS</td><td>Certificate based, sabse strong</td><td>PKI ya ClearPass Onboard chahiye. Lab mein simulate nahi hota</td></tr></table>
<p>Service batati hai kaunse methods accept hote hain. Client aisa method offer kare jo service ne enable nahi kiya, to request authentication alert ke saath fail hoti hai. Lab model mein yeh error 9005 hai, "Unsupported EAP method".</p>

<h3>Sources: sach kahan store hai</h3>
<p>Source ek database hai jisme identity rakhi hoti hai. Lab do jaanta hai:</p>
<ul>
<li><b>[Local User Repository]</b>: ClearPass ke andar hi store user accounts, Configuration &gt; Identity &gt; Local Users ke neeche. Har user ka naam, password, enabled flag, optional role aur Department jaise free attributes hote hain.</li>
<li><b>[Endpoints Repository]</b>: MAC address ke hisaab se known devices ki table, Configuration &gt; Identity &gt; Endpoints ke neeche. Har endpoint ka status (known, unknown, disabled) aur Category=Printer jaise attributes hote hain.</li>
</ul>
<p>Real companies mein main source aksar directory hoti hai. <b>Active Directory</b> ya koi aur <b>LDAP</b> server staff accounts rakhta hai, aur usmein ke group memberships aur attributes role mapping ka input ban jaate hain. ClearPass domain join karta hai, domain controller se password validate karta hai aur memberOf ya department jaise attributes padh sakta hai. <b>Domain join aur AD/LDAP source yahan concept-only hain aur lab mein simulate nahi hote.</b> Local User Repository se jo seekhte ho woh seedha transfer hota hai: source attributes deta hai, aur role mapping unhe padhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Methods aur sources role mapping ko feed karte hain">
<rect x="14" y="18" width="190" height="46" rx="8" fill="#bae6fd"/><text x="109" y="46" text-anchor="middle" class="svg-ink" font-size="13">Method: EAP PEAP</text>
<rect x="14" y="76" width="190" height="46" rx="8" fill="#bbf7d0"/><text x="109" y="104" text-anchor="middle" class="svg-ink" font-size="13">Method: MAC AUTH</text>
<rect x="250" y="18" width="190" height="46" rx="8" fill="#ddd6fe"/><text x="345" y="40" text-anchor="middle" class="svg-ink" font-size="13">Local User Repository</text><text x="345" y="56" text-anchor="middle" class="svg-muted" font-size="11">Department=Engineering</text>
<rect x="250" y="76" width="190" height="46" rx="8" fill="#fde68a"/><text x="345" y="98" text-anchor="middle" class="svg-ink" font-size="13">Endpoints Repository</text><text x="345" y="114" text-anchor="middle" class="svg-muted" font-size="11">Category=Printer</text>
<rect x="486" y="40" width="140" height="62" rx="8" fill="#fed7aa"/><text x="556" y="66" text-anchor="middle" class="svg-ink" font-size="13">Attributes yahan se</text><text x="556" y="84" text-anchor="middle" class="svg-ink" font-size="13">role mapping mein</text>
<g stroke="#64748b" stroke-width="2"><line x1="204" y1="41" x2="250" y2="41"/><line x1="204" y1="99" x2="250" y2="99"/><line x1="440" y1="41" x2="486" y2="62"/><line x1="440" y1="99" x2="486" y2="82"/></g>
<text x="320" y="164" text-anchor="middle" class="svg-accent" font-size="13">Not simulated: Active Directory / LDAP source (same idea, real groups)</text>
</svg><p class="cap">Method proof ko source ke against check karta hai. Wahi source agle stage ke attributes bhi deta hai.</p></div>

<h3>Authentication versus authorization</h3>
<p>Authentication pass ya fail par khatam hoti hai. Authorization yeh hai ki user kya kar sakta hai, aur woh baad mein roles aur enforcement tay karte hain. Phir bhi Authentication stage context jod sakta hai: successful login ke baad ClearPass source se attributes collect karta hai (lab user waale ko Local:Department aur endpoint waale ko Endpoint:Category kehta hai). Agla stage inhi facts ko use karta hai. Asli product mein yeh source ke Authorization attributes dikhte hain, aur authorization source woh system bhi ho sakta hai jisne password prove nahi kiya.</p>

<h3>Error codes jo pehchanne hain</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Typical fix</th></tr>
<tr><td>215</td><td>Password mismatch</td><td>Password reset karo, ya client credentials theek karo</td></tr>
<tr><td>216</td><td>User ya endpoint nahi mila</td><td>User banao, ya MAC ko Endpoints Repository mein add karo</td></tr>
<tr><td>217</td><td>Account disabled</td><td>Disable kyun hua check karke user ya endpoint enable karo</td></tr></table>

<h3>Lab shell: attribute wala user</h3>
<pre class="code"><span class="c">! Configuration &gt; Identity &gt; Local Users (Lab shell on CPPM)</span>
configuration identity local-user add alice password Pass@2024 attr Department=Engineering
configuration identity local-user add bob password Pass@2025 attr Department=Contractor
configuration identity local-user show</pre>
<pre class="out">Configuration &gt; Identity &gt; Local Users
Name   Status   Role  Attributes
-----  -------  ----  ----------------------
alice  enabled        Department=Engineering
bob    enabled        Department=Contractor</pre>
<p>Lab output, layout representative hai. Attribute hi woh cheez hai jo role mapping agle chapter mein padhegi. Agar Bob ke paas Department attribute hi na hota, to koi Department rule use kabhi match nahi kar sakta tha.</p>

<div class="warn"><p><b>Common mistakes.</b> Alert 216 ya 217 ho aur reject ko "galat password" samajhna. Attribute value alag spelling mein likhna, jaise user mein Contractors aur rule mein Contractor. [Allow All MAC AUTH] enable karke bhool jaana ki ab har MAC authentication pass karta hai. Aise source ke attributes expect karna jo service list mein nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> MAC-auth service ko source ke taur par Endpoints Repository chahiye. User service ko user source chahiye. Jo source service se attach nahi hai woh kabhi consult nahi hota, chahe sahi user usi mein ho.</p></div>

<div class="scn"><h4>Spelling jo ek dopahar kha gayi</h4><p>Contractors ka naya batch authenticate to ho gaya lekin default deny mein gaya. Role mapping rule kehta tha Department EQUALS Contractor. Accounts spreadsheet se bane the aur unmein Department=Contractors tha. Authentication pass hui, isliye helpdesk ne ClearPass ko blame kiya. Input aur Summary tabs kholne par roles mein sirf [User Authenticated] dikha. Accounts mein spelling theek karne (ek bulk edit) se sab fix ho gaye.</p><p><b>Seekh:</b> role mapping rule text ko exactly compare karta hai. Roles missing ho to asli attribute ko rule value se akshar-ba-akshar milao.</p></div>

<div class="iv"><p class="q">"Authentication source aur authorization source mein kya farak hai?"</p><p>Strong answer: authentication source chune hue method se identity prove karta hai; authorization source attributes (group, department, endpoint category) deta hai jo role mapping aur policy use karte hain. Aksar dono ek hi system hote hain, jaise Active Directory, lekin zaroori nahi. Batao ki AD/LDAP usual enterprise source hai aur local users aur Endpoints Repository simple built-in hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method batata hai kaise check karna hai; source batata hai sach kahan hai.</li>
<li>Users ke liye PEAP/MSCHAPv2, devices ke liye MAC AUTH, EAP-TLS ko certificates chahiye aur simulate nahi hota.</li>
<li>Local User Repository aur Endpoints Repository lab mein hain; AD aur LDAP concept-only hain.</li>
<li>215 password mismatch, 216 not found, 217 disabled.</li>
<li>Yahan collect hue attributes agle stage mein role mapping ko feed karte hain.</li>
</ul></div>
`}};export{e as default};