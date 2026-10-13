var e={id:`authentication`,h:{en:`Authentication: methods, sources, users and endpoints`,hi:`Authentication: methods, sources, users aur endpoints`},body:{en:`
<p>A service has accepted the request. Now ClearPass must answer the first AAA question: who is this? Two things work together here. An <b>authentication method</b> is <em>how</em> the identity is checked (the protocol). An <b>authentication source</b> is <em>where</em> the identity is stored (the database). You choose both in the service.</p>

<h3>Analogy: checking an ID card at a library</h3>
<p>A library clerk asks for your member card (the method: show a card, or say a number, or scan a fingerprint). Then she looks you up in the member register (the source: the register, or the college database, or the staff list). If the card is good but you are not in the register, you are not a member. If you are in the register but the password you gave does not match, you are refused. If your membership was cancelled, you are also refused, for a different reason. ClearPass reports these three cases with three different alert codes.</p>

<h3>Authentication methods</h3>
<table class="cmp"><tr><th>Method</th><th>Used for</th><th>Notes</th></tr>
<tr><td>[EAP PEAP]</td><td>802.1X with username and password</td><td>Server certificate builds a tunnel; MSCHAPv2 inside</td></tr>
<tr><td>[EAP MSCHAPv2]</td><td>Inner method of PEAP</td><td>Listed as built-in in the lab</td></tr>
<tr><td>[MAC AUTH]</td><td>Devices known by MAC address</td><td>Checks the MAC against a source such as the Endpoints Repository</td></tr>
<tr><td>[Allow All MAC AUTH]</td><td>Test or open networks</td><td>Accepts any MAC. Dangerous in production</td></tr>
<tr><td>EAP-TLS</td><td>Certificate-based 802.1X</td><td>Concept only; not simulated in the lab</td></tr></table>
<p>The real GUI shows these on the Authentication tab of the service. A service for wired 802.1X lists [EAP PEAP]; a service for wired MAC authentication lists [MAC AUTH].</p>

<h3>Authentication sources</h3>
<dl class="terms">
<dt>[Local User Repository]</dt><dd>Users created inside ClearPass (Configuration, Identity, Local Users). Good for labs, test accounts and small sites. Each user has a password, a role and optional attributes, for example Department.</dd>
<dt>[Endpoints Repository]</dt><dd>The database of devices known by MAC address (Configuration, Identity, Endpoints). Each endpoint has a status (known, unknown, disabled) and attributes such as Category.</dd>
<dt>Active Directory or LDAP</dt><dd>Where most real companies keep users. ClearPass joins the domain or binds to the directory. This is a concept that is not simulated in the lab.</dd></dl>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Methods and sources">
<rect x="20" y="30" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="13">Method</text><text x="105" y="76" text-anchor="middle" class="svg-muted" font-size="12">[EAP PEAP]</text>
<rect x="240" y="30" width="170" height="60" rx="10" fill="#bae6fd"/><text x="325" y="58" text-anchor="middle" class="svg-ink" font-size="13">Source</text><text x="325" y="76" text-anchor="middle" class="svg-muted" font-size="12">[Local User Repository]</text>
<rect x="460" y="30" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="540" y="58" text-anchor="middle" class="svg-ink" font-size="13">Result</text><text x="540" y="76" text-anchor="middle" class="svg-muted" font-size="12">success or 215/216/217</text>
<line x1="190" y1="60" x2="240" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Method = how it is checked. Source = where the identity lives.</text>
</svg><p class="cap">Both are chosen inside the service; neither is global.</p></div>

<h3>Lab shell: creating users and endpoints</h3>
<pre class="code"><span class="c">! GUI: Configuration &gt; Identity &gt; Local Users &gt; Add</span>
configuration identity local-user add alice password Pass@2024 attr Department=Engineering
configuration identity local-user show
<span class="c">! GUI: Configuration &gt; Identity &gt; Endpoints &gt; Add</span>
configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer
configuration identity endpoint show</pre>
<p>The lab accounts are alice (password Pass@2024, Department Engineering) and bob (password Pass@2025, Department Contractor). Passwords are case-sensitive. The Department attribute is stored with the user and is read later by the role-mapping policy as <code>Local:Department</code>.</p>

<h3>The three alert codes to memorise</h3>
<pre class="out">Alerts for alice
  <span class="hl">215  Authentication failed: password mismatch</span>
Alerts for bob
  <span class="hl">217  Authentication failed: user account is disabled</span>
Alerts for 00:50:67:fb:67:01
  <span class="hl">216  Authentication failed: user/endpoint not found</span></pre>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>First fix</th></tr>
<tr><td>215</td><td>Found, but credentials do not match</td><td>Reset password on the source or correct the supplicant</td></tr>
<tr><td>216</td><td>Not found in any source of the service</td><td>Create the user or endpoint; check the source is listed in the service</td></tr>
<tr><td>217</td><td>Account exists but is disabled</td><td>Enable it, after finding out why it was disabled</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bob types his password with the wrong digit. ClearPass finds bob in the Local User Repository, runs MSCHAPv2, and the proofs differ. The result is a reject with alert 215. In another case a device with MAC 00:50:67:fb:67:01 is not in the Endpoints Repository at all. The same reject now carries alert 216, and the fix is on the ClearPass side: add the endpoint.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the wrong source in the service, so that valid users are "not found". Mixing the user's Windows password with the Local User password. Treating 217 as a password problem and resetting passwords endlessly. Marking an endpoint "unknown" and expecting it to authenticate.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication and authorization are separate. A user can pass authentication and still be rejected later because the enforcement policy default is deny. Read the alert code before assuming a credential issue.</p></div>

<div class="scn"><h4>Monday morning, three different rejects</h4><p>Three users could not connect. The Access Tracker showed one 215, one 217 and one 216. The first was a password stored with a typo, the second was an account that a leaver-clean-up script had disabled by mistake, and the third was a new printer never added to the Endpoints Repository. Three quick fixes on ClearPass, no switch change.</p><p><b>Lesson:</b> the alert code names the cause. Read it before touching anything.</p></div>

<div class="iv"><p class="q">"What is the difference between an authentication method and a source in ClearPass?"</p><p>Strong answer: the method is the protocol used to check identity, for example PEAP or MAC authentication; the source is the identity store consulted, for example the local user repository, the endpoints repository or Active Directory. Both are selected in the service. Add the alert codes 215, 216 and 217.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method is how; source is where; both are chosen per service.</li>
<li>Local Users hold passwords and attributes; Endpoints hold MAC addresses and status.</li>
<li>215 password mismatch, 216 not found, 217 disabled.</li>
<li>[Allow All MAC AUTH] accepts every MAC and is for tests only.</li>
<li>Active Directory and EAP-TLS are real-world options not simulated in the lab.</li>
</ul></div>
`,hi:`
<p>Service ne request accept kar li. Ab ClearPass ko pehle AAA sawaal ka jawab dena hai: yeh kaun hai? Yahan do cheezein saath kaam karti hain. <b>Authentication method</b> batata hai ki identity <em>kaise</em> check hoti hai (protocol). <b>Authentication source</b> batata hai ki identity <em>kahan</em> store hai (database). Dono aap service mein chunte ho.</p>

<h3>Analogy: library mein ID card check</h3>
<p>Library clerk aapka member card maangti hai (method: card dikhao, ya number bolo, ya fingerprint scan karo). Phir woh aapko member register mein dhoondhti hai (source: register, ya college database, ya staff list). Agar card theek hai par aap register mein nahi ho, to aap member nahi ho. Agar register mein ho par diya hua password match nahi karta, to refuse. Agar membership cancel ho gayi hai, to bhi refuse, par alag wajah se. ClearPass in teen cases ko teen alag alert codes se report karta hai.</p>

<h3>Authentication methods</h3>
<table class="cmp"><tr><th>Method</th><th>Kis liye</th><th>Notes</th></tr>
<tr><td>[EAP PEAP]</td><td>Username aur password wala 802.1X</td><td>Server certificate tunnel banata hai; andar MSCHAPv2</td></tr>
<tr><td>[EAP MSCHAPv2]</td><td>PEAP ka inner method</td><td>Lab mein built-in ke roop mein listed</td></tr>
<tr><td>[MAC AUTH]</td><td>MAC address se pehchane jaane wale devices</td><td>MAC ko Endpoints Repository jaise source se check karta hai</td></tr>
<tr><td>[Allow All MAC AUTH]</td><td>Test ya open networks</td><td>Koi bhi MAC accept karta hai. Production mein khatarnaak</td></tr>
<tr><td>EAP-TLS</td><td>Certificate-based 802.1X</td><td>Sirf concept; lab mein simulate nahi hota</td></tr></table>
<p>Real GUI inhe service ke Authentication tab par dikhata hai. Wired 802.1X service [EAP PEAP] list karti hai; wired MAC authentication service [MAC AUTH] list karti hai.</p>

<h3>Authentication sources</h3>
<dl class="terms">
<dt>[Local User Repository]</dt><dd>ClearPass ke andar bane users (Configuration, Identity, Local Users). Labs, test accounts aur chhoti sites ke liye achha. Har user ka password, role aur optional attributes hote hain, jaise Department.</dd>
<dt>[Endpoints Repository]</dt><dd>MAC address se pehchane jaane wale devices ka database (Configuration, Identity, Endpoints). Har endpoint ka status (known, unknown, disabled) aur Category jaise attributes hote hain.</dd>
<dt>Active Directory ya LDAP</dt><dd>Jahan zyada tar real companies apne users rakhti hain. ClearPass domain join karta hai ya directory se bind karta hai. Yeh concept hai jo lab mein simulate nahi hota.</dd></dl>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Methods aur sources">
<rect x="20" y="30" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="13">Method</text><text x="105" y="76" text-anchor="middle" class="svg-muted" font-size="12">[EAP PEAP]</text>
<rect x="240" y="30" width="170" height="60" rx="10" fill="#bae6fd"/><text x="325" y="58" text-anchor="middle" class="svg-ink" font-size="13">Source</text><text x="325" y="76" text-anchor="middle" class="svg-muted" font-size="12">[Local User Repository]</text>
<rect x="460" y="30" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="540" y="58" text-anchor="middle" class="svg-ink" font-size="13">Result</text><text x="540" y="76" text-anchor="middle" class="svg-muted" font-size="12">success ya 215/216/217</text>
<line x1="190" y1="60" x2="240" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Method = kaise check hota hai. Source = identity kahan rehti hai.</text>
</svg><p class="cap">Dono service ke andar chune jaate hain; koi bhi global nahi hai.</p></div>

<h3>Lab shell: users aur endpoints banana</h3>
<pre class="code"><span class="c">! GUI: Configuration &gt; Identity &gt; Local Users &gt; Add</span>
configuration identity local-user add alice password Pass@2024 attr Department=Engineering
configuration identity local-user show
<span class="c">! GUI: Configuration &gt; Identity &gt; Endpoints &gt; Add</span>
configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer
configuration identity endpoint show</pre>
<p>Lab accounts alice (password Pass@2024, Department Engineering) aur bob (password Pass@2025, Department Contractor) hain. Passwords case-sensitive hote hain. Department attribute user ke saath store hota hai aur baad mein role-mapping policy use <code>Local:Department</code> ke roop mein padhti hai.</p>

<h3>Teen alert codes jo yaad karne hain</h3>
<pre class="out">Alerts for alice
  <span class="hl">215  Authentication failed: password mismatch</span>
Alerts for bob
  <span class="hl">217  Authentication failed: user account is disabled</span>
Alerts for 00:50:67:fb:67:01
  <span class="hl">216  Authentication failed: user/endpoint not found</span></pre>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Pehla fix</th></tr>
<tr><td>215</td><td>Mil gaya, par credentials match nahi karte</td><td>Source par password reset karo ya supplicant sahi karo</td></tr>
<tr><td>216</td><td>Service ke kisi source mein nahi mila</td><td>User ya endpoint banao; check karo ki source service mein listed hai</td></tr>
<tr><td>217</td><td>Account hai par disabled hai</td><td>Enable karo, pehle pata karke ki kyun disable hua tha</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bob password mein galat digit type karta hai. ClearPass bob ko Local User Repository mein dhoondhta hai, MSCHAPv2 chalata hai, aur proofs alag aate hain. Result alert 215 ke saath reject hai. Doosre case mein MAC 00:50:67:fb:67:01 wala device Endpoints Repository mein hai hi nahi. Wahi reject ab alert 216 ke saath aata hai, aur fix ClearPass side par hai: endpoint add karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Service mein galat source daalna, jisse valid users "not found" ho jaate hain. User ke Windows password ko Local User password se mix karna. 217 ko password problem samajhkar baar baar password reset karna. Endpoint ko "unknown" mark karke authenticate hone ki umeed rakhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication aur authorization alag hain. User authentication pass karke bhi baad mein reject ho sakta hai kyunki enforcement policy ka default deny hai. Credential issue maanne se pehle alert code padho.</p></div>

<div class="scn"><h4>Monday subah, teen alag rejects</h4><p>Teen users connect nahi kar pa rahe the. Access Tracker mein ek 215, ek 217 aur ek 216 tha. Pehla typo ke saath stored password tha, doosra aisa account tha jise leaver-clean-up script ne galti se disable kar diya, aur teesra naya printer tha jo kabhi Endpoints Repository mein add nahi hua. ClearPass par teen quick fixes, switch change nahi.</p><p><b>Seekh:</b> alert code wajah batata hai. Kuch chhoone se pehle use padho.</p></div>

<div class="iv"><p class="q">"ClearPass mein authentication method aur source mein kya farak hai?"</p><p>Strong answer: method woh protocol hai jisse identity check hoti hai, jaise PEAP ya MAC authentication; source woh identity store hai jo consult hota hai, jaise local user repository, endpoints repository ya Active Directory. Dono service mein select hote hain. Alert codes 215, 216 aur 217 jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method kaise hai; source kahan hai; dono per service chune jaate hain.</li>
<li>Local Users passwords aur attributes rakhte hain; Endpoints MAC addresses aur status.</li>
<li>215 password mismatch, 216 not found, 217 disabled.</li>
<li>[Allow All MAC AUTH] har MAC accept karta hai aur sirf tests ke liye hai.</li>
<li>Active Directory aur EAP-TLS real-world options hain jo lab mein simulate nahi hote.</li>
</ul></div>
`}};export{e as default};