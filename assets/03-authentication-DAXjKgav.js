var e={id:`authentication`,h:{en:`Authenticating mobile users: local, SAML and certificate`,hi:`Mobile users ko authenticate karna: local, SAML aur certificate`},body:{en:`
<p>Before the gateway gives a user a tunnel, it must know who the user is. This is authentication. The same question (who are you?) can be answered in several ways, and each has different strengths. You must know the options and where they are configured.</p>

<h3>Analogy: entering an office building</h3>
<p>You can enter by showing a staff card, by signing at reception with the guard's own list, or by a trusted friend who works there vouching for you. In GlobalProtect these map to a <b>certificate</b> on the device, a <b>local</b> account list in Prisma Access, and a <b>SAML</b> identity provider that vouches for the user.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Authentication methods">
<rect x="20" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="80" y="104" text-anchor="middle" class="svg-ink" font-size="12">User and app</text>
<rect x="260" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="340" y="50" text-anchor="middle" class="svg-ink" font-size="12">Local accounts</text>
<rect x="260" y="80" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="340" y="110" text-anchor="middle" class="svg-ink" font-size="12">SAML identity provider</text>
<rect x="260" y="140" width="160" height="50" rx="8" fill="#fde68a"/><text x="340" y="170" text-anchor="middle" class="svg-ink" font-size="12">Client certificate</text>
<rect x="500" y="70" width="120" height="60" rx="8" fill="#fed7aa"/><text x="560" y="104" text-anchor="middle" class="svg-ink" font-size="12">Portal and gateway</text>
<line x1="140" y1="100" x2="260" y2="45" stroke="#64748b"/><line x1="140" y1="100" x2="260" y2="105" stroke="#64748b"/><line x1="140" y1="100" x2="260" y2="165" stroke="#64748b"/>
<line x1="420" y1="45" x2="500" y2="95" stroke="#64748b"/><line x1="420" y1="105" x2="500" y2="100" stroke="#64748b"/><line x1="420" y1="165" x2="500" y2="105" stroke="#64748b"/>
</svg><p class="cap">Three ways to prove identity; all are tied to the gateway through an authentication profile.</p></div>

<h3>The methods</h3>
<ul>
<li><b>Local:</b> accounts kept in Prisma Access itself. Simple, good for labs and for small groups. The lab uses local authentication in pa-mobile-1.</li>
<li><b>SAML:</b> the portal sends the user to an identity provider (IdP), for example Okta, and trusts the signed answer. Most enterprises use it, because it supports single sign-on and multi-factor authentication.</li>
<li><b>Certificate:</b> the device holds a client certificate and proves possession. It is strong for device identity and for unattended connection.</li>
<li><b>Other server profiles</b> can be used through an authentication profile.</li>
</ul>
<p>Prisma Access can also use <b>Cloud Identity Engine</b> to supply user and group information, which user-based security rules need later.</p>

<h3>Where it is configured</h3>
<table class="cmp"><tr><th>Item</th><th>SCM path</th><th>Panorama path</th></tr>
<tr><td>Portal and gateway authentication</td><td>Mobile Users &gt; GlobalProtect &gt; Infrastructure &gt; User Authentication (local or enterprise)</td><td>Mobile Users - GlobalProtect &gt; General tab, choose an Authentication Profile</td></tr>
<tr><td>Client certificate settings</td><td>Use the User Authentication area; exact menu names vary by release</td><td>Mobile_User_Template (client-side authentication)</td></tr>
<tr><td>After first push</td><td>Edit and push again</td><td>The Authentication Profile on the General tab becomes read-only after the first commit and push</td></tr>
</table>
<div class="warn"><p><b>Panorama detail.</b> Because the profile is read-only after the first commit and push, choose it carefully during the first setup. The exact SCM menu names under identity services can differ by release, so look for "User Authentication" in the Mobile Users infrastructure area.</p></div>

<pre class="out">Mobile Users - GlobalProtect &gt; User Authentication (lab console view)
Method              Local
Users defined       3
Portal reachable    yes
Last auth attempts  2 success, <span class="hl">1 failure (bad password)</span>
</pre>

<h3>How a SAML login flows</h3>
<ol>
<li>The app contacts the portal.</li>
<li>The portal redirects the user to the IdP page.</li>
<li>The user logs in (and gives a second factor if required).</li>
<li>The IdP sends a signed assertion back.</li>
<li>The portal and gateway accept the assertion and finish the connection.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A company has 800 staff who all use the company SSO. The administrator chooses SAML, not local, because staff already have accounts and MFA. Local accounts would mean 800 more passwords to manage. A small contractor group of 5 people is added through the local list during onboarding, then moved to SAML later. Remember that the authentication method is a project decision, not a technical limit.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing the wrong profile name and getting a silent authentication failure. (2) Forgetting that users must exist in the chosen source. (3) Relying on local accounts for hundreds of staff. (4) Not planning for the read-only profile on Panorama.</p></div>
<div class="exam"><p><b>Exam trap.</b> SAML does not store passwords in Prisma Access; the identity provider does. And on Panorama the authentication profile becomes read-only after the first commit and push.</p></div>

<div class="scn"><h4>Everyone failed except the admin</h4><p>After a change, every user failed to log in; the administrator's own test account worked. The authentication profile had been changed to point to a different SAML metadata file, and the administrator account existed in the old source only. The team restored the correct profile, pushed, and the failures stopped. The Network Services insight for GlobalProtect authentication showed the failures starting at the push time.</p><p><b>Lesson:</b> read the authentication success and failure view first, and correlate it with the time of the last push.</p></div>

<div class="iv"><p class="q">"How would you authenticate 800 remote staff?"</p><p>Strong answer: SAML with the company identity provider, for single sign-on and MFA; optionally add a device certificate for stronger device identity. Local accounts are for labs and small groups. Add Cloud Identity Engine for user and group information in policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Methods: local, SAML, certificate, and other server profiles through an authentication profile.</li>
<li>SAML uses an identity provider and supports SSO and MFA.</li>
<li>Panorama: the General tab profile is read-only after first commit and push.</li>
<li>Cloud Identity Engine can supply user and group data.</li>
<li>Use the authentication success and failure view to diagnose.</li>
</ul></div>
`,hi:`
<p>Gateway user ko tunnel de, usse pehle use pata hona chahiye ki user kaun hai. Isse authentication kehte hain. Wahi sawaal (aap kaun ho?) kai tareeke se answer ho sakta hai, aur har ki alag strength hai. Aapko options aur unke configure hone ki jagah pata honi chahiye.</p>

<h3>Analogy: office building mein entry</h3>
<p>Aap staff card dikha kar, reception par guard ki apni list mein sign karke, ya wahan kaam karne wale bharosemand dost ke guarantee dene par andar ja sakte ho. GlobalProtect mein yeh device par <b>certificate</b>, Prisma Access mein <b>local</b> account list, aur user ke liye guarantee dene wala <b>SAML</b> identity provider hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Authentication methods">
<rect x="20" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="80" y="104" text-anchor="middle" class="svg-ink" font-size="12">User aur app</text>
<rect x="260" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="340" y="50" text-anchor="middle" class="svg-ink" font-size="12">Local accounts</text>
<rect x="260" y="80" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="340" y="110" text-anchor="middle" class="svg-ink" font-size="12">SAML identity provider</text>
<rect x="260" y="140" width="160" height="50" rx="8" fill="#fde68a"/><text x="340" y="170" text-anchor="middle" class="svg-ink" font-size="12">Client certificate</text>
<rect x="500" y="70" width="120" height="60" rx="8" fill="#fed7aa"/><text x="560" y="104" text-anchor="middle" class="svg-ink" font-size="12">Portal aur gateway</text>
<line x1="140" y1="100" x2="260" y2="45" stroke="#64748b"/><line x1="140" y1="100" x2="260" y2="105" stroke="#64748b"/><line x1="140" y1="100" x2="260" y2="165" stroke="#64748b"/>
<line x1="420" y1="45" x2="500" y2="95" stroke="#64748b"/><line x1="420" y1="105" x2="500" y2="100" stroke="#64748b"/><line x1="420" y1="165" x2="500" y2="105" stroke="#64748b"/>
</svg><p class="cap">Identity prove karne ke teen tareeke; sab authentication profile ke through gateway se jude hain.</p></div>

<h3>Methods</h3>
<ul>
<li><b>Local:</b> accounts Prisma Access ke andar hi rakhe jaate hain. Simple, labs aur chhote groups ke liye achha. Lab pa-mobile-1 mein local authentication use karta hai.</li>
<li><b>SAML:</b> portal user ko identity provider (IdP) ke paas bhejta hai, jaise Okta, aur signed jawab par trust karta hai. Zyadatar enterprises use karte hain kyunki yeh single sign-on aur multi-factor authentication support karta hai.</li>
<li><b>Certificate:</b> device ke paas client certificate hota hai aur woh possession prove karta hai. Device identity aur unattended connection ke liye strong hai.</li>
<li><b>Doosre server profiles</b> authentication profile ke through use ho sakte hain.</li>
</ul>
<p>Prisma Access <b>Cloud Identity Engine</b> bhi use kar sakta hai user aur group information dene ke liye, jo baad mein user-based security rules ko chahiye.</p>

<h3>Kahan configure hota hai</h3>
<table class="cmp"><tr><th>Item</th><th>SCM path</th><th>Panorama path</th></tr>
<tr><td>Portal aur gateway authentication</td><td>Mobile Users &gt; GlobalProtect &gt; Infrastructure &gt; User Authentication (local ya enterprise)</td><td>Mobile Users - GlobalProtect &gt; General tab, Authentication Profile chuno</td></tr>
<tr><td>Client certificate settings</td><td>User Authentication area use karo; exact menu names release ke hisaab se alag hote hain</td><td>Mobile_User_Template (client-side authentication)</td></tr>
<tr><td>Pehle push ke baad</td><td>Edit karke dobara push</td><td>General tab ka Authentication Profile pehle commit aur push ke baad read-only ho jaata hai</td></tr>
</table>
<div class="warn"><p><b>Panorama detail.</b> Profile pehle commit aur push ke baad read-only hota hai, isliye pehle setup mein dhyan se chuno. Identity services ke neeche SCM menu names release ke hisaab se alag ho sakte hain, isliye Mobile Users infrastructure area mein "User Authentication" dhoondho.</p></div>

<pre class="out">Mobile Users - GlobalProtect &gt; User Authentication (lab console view)
Method              Local
Users defined       3
Portal reachable    yes
Last auth attempts  2 success, <span class="hl">1 failure (bad password)</span>
</pre>

<h3>SAML login ka flow</h3>
<ol>
<li>App portal se contact karta hai.</li>
<li>Portal user ko IdP page par redirect karta hai.</li>
<li>User login karta hai (aur zaroorat ho to second factor deta hai).</li>
<li>IdP signed assertion wapas bhejta hai.</li>
<li>Portal aur gateway assertion accept karke connection poora karte hain.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Company ke 800 staff company SSO use karte hain. Administrator local nahi, SAML chunta hai kyunki staff ke paas pehle se accounts aur MFA hain. Local accounts ka matlab 800 aur passwords manage karna. 5 logon ka chhota contractor group onboarding ke dauraan local list se add hota hai, baad mein SAML par move hota hai. Yaad rakho authentication method project decision hai, technical limit nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Galat profile naam type karke silent authentication failure paana. (2) Bhool jaana ki users chune hue source mein maujood hone chahiye. (3) Saikdon staff ke liye local accounts par depend karna. (4) Panorama par read-only profile ka plan na banana.</p></div>
<div class="exam"><p><b>Exam trap.</b> SAML mein passwords Prisma Access mein store nahi hote; identity provider mein hote hain. Aur Panorama par authentication profile pehle commit aur push ke baad read-only ho jaata hai.</p></div>

<div class="scn"><h4>Admin ko chhod kar sab fail</h4><p>Ek change ke baad har user login mein fail ho raha tha; administrator ka apna test account chal raha tha. Authentication profile ko alag SAML metadata file ki taraf point kar diya gaya tha, aur administrator account sirf purane source mein tha. Team ne sahi profile restore kiya, push kiya, aur failures ruk gaye. GlobalProtect authentication ka Network Services insight failures ko push time se shuru hote dikha raha tha.</p><p><b>Seekh:</b> pehle authentication success aur failure view padho, aur use last push ke time se correlate karo.</p></div>

<div class="iv"><p class="q">"800 remote staff ko authenticate kaise karoge?"</p><p>Strong answer: company identity provider ke saath SAML, single sign-on aur MFA ke liye; mazboot device identity ke liye optionally device certificate jodo. Local accounts labs aur chhote groups ke liye hain. Policy mein user aur group information ke liye Cloud Identity Engine jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Methods: local, SAML, certificate, aur authentication profile ke through doosre server profiles.</li>
<li>SAML identity provider use karta hai aur SSO aur MFA support karta hai.</li>
<li>Panorama: General tab ka profile pehle commit aur push ke baad read-only.</li>
<li>Cloud Identity Engine user aur group data de sakta hai.</li>
<li>Diagnose karne ke liye authentication success aur failure view use karo.</li>
</ul></div>
`}};export{e as default};