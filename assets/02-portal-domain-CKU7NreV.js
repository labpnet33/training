var e={id:`portal-domain`,h:{en:`The portal name: default domain versus company domain`,hi:`Portal ka naam: default domain versus company domain`},body:{en:`
<p>Users need a name to type into the app. Prisma Access offers two ways to name the portal: the <b>Default Domain</b> and a <b>Company Domain</b>. The choice affects certificates, DNS and the first user experience.</p>

<h3>Analogy: a shop with a street address or your own brand sign</h3>
<p>You can rent a shop in a shopping centre. The centre gives it an address, and signs and electricity are already done. Or you can put up your own brand name on the front, which looks better, but you must register the name, make the sign and tell the post office. The default domain is the shopping centre address; the company domain is your own brand sign.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Default and company domains">
<rect x="20" y="30" width="270" height="130" rx="10" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="13">Default Domain</text>
<text x="155" y="80" text-anchor="middle" class="svg-muted" font-size="11">name under gpcloudservice.com</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="11">certificate and DNS automatic</text><text x="155" y="120" text-anchor="middle" class="svg-muted" font-size="11">fastest start</text>
<rect x="350" y="30" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="13">Company Domain</text>
<text x="485" y="80" text-anchor="middle" class="svg-muted" font-size="11">gp.nkprisma.example</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="11">you supply certificate and profile</text><text x="485" y="120" text-anchor="middle" class="svg-muted" font-size="11">you add a DNS CNAME</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Same portal service underneath</text>
</svg><p class="cap">Two ways to name the same hosted portal.</p></div>

<h3>Default Domain</h3>
<p>The portal name is under <code>gpcloudservice.com</code>. The certificate and the DNS record are published automatically for you. Nothing is needed from your DNS team, and the app can connect quickly. This is what pa-mobile-1 uses. In the lab console the name is shown as a placeholder hostname.</p>

<h3>Company Domain</h3>
<p>You use your own name, such as <code>gp.nkprisma.example</code>. You must provide:</p>
<ol>
<li>A <b>certificate</b> for that name and an <b>SSL/TLS service profile</b> that uses it.</li>
<li>A <b>DNS CNAME</b> record that maps your name to the hostname shown by the console, of the form <code>&lt;portal_hostname&gt;.gpcloudservice.com</code>.</li>
</ol>
<p>Users see a name that matches your brand, and your security team can recognise it. The cost is certificate management: if the certificate expires or the CNAME is missing, the app cannot reach the portal.</p>
<pre class="out">Portal name (lab console view)
Mode               Company Domain
Portal name        <span class="hl">gp.nkprisma.example</span>
Certificate        gp-cert (valid)
DNS CNAME target   tenant-lab.gpcloudservice.example
</pre>
<p>The line to read is the portal name; it must resolve in public DNS to the CNAME target.</p>

<table class="cmp"><tr><th>Question</th><th>Default Domain</th><th>Company Domain</th></tr>
<tr><td>Certificate</td><td>Published automatically</td><td>You provide it and a service profile</td></tr>
<tr><td>DNS</td><td>Published automatically</td><td>You create a CNAME</td></tr>
<tr><td>Branding</td><td>Vendor domain</td><td>Your domain</td></tr>
<tr><td>Typical failure</td><td>Rare</td><td>Expired certificate or missing CNAME</td></tr>
</table>

<h3>IP Optimization</h3>
<p>One more first-setup choice is <b>IP Optimization</b>. It can be chosen only during the first setup and cannot be changed later. It needs GlobalProtect app version 6.1.4 or later, 6.2.3 or later, or 6.3.0 or later. The lab does not use it, but you must know that it is permanent and has an app version requirement.</p>

<div class="eg"><p><b>Worked example.</b> A company starts with the default domain to prove the design. Two months later management wants users to type <code>gp.nkprisma.example</code>. The security team issues a certificate, creates the service profile, and adds a CNAME pointing to the console hostname. The company then switches the portal to the company domain and tells users to update the app. If the CNAME is forgotten, the app reports that it cannot find the portal.</p></div>

<h3>A quick test routine</h3>
<p>After any change to the portal name, test in this order: resolve the name from a network outside the office, open the portal in a browser and read the certificate name and expiry, then start the app from a home connection such as 203.0.113.50. Record the date of each test so you can see when a problem started.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Selecting a company domain but forgetting the CNAME. (2) Using a certificate whose name does not match the portal name. (3) Letting the certificate expire. (4) Choosing IP Optimization casually, then discovering it cannot be changed.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default domain publishes the certificate and DNS for you; a company domain needs your certificate, an SSL/TLS service profile and a CNAME to the gpcloudservice.com hostname.</p></div>

<div class="scn"><h4>The certificate that expired at midnight</h4><p>On a Monday, the help desk received dozens of "cannot connect" calls. The app showed a certificate warning. The company-domain certificate had expired over the weekend. The team renewed the certificate, updated the service profile, pushed, and users reconnected.</p><p><b>Lesson:</b> put certificate expiry dates in your calendar, and monitor them.</p></div>

<div class="iv"><p class="q">"When would you choose a company domain over the default domain?"</p><p>Strong answer: when branding, policy or user trust requires your own name. It needs a certificate and SSL/TLS service profile plus a DNS CNAME to the gpcloudservice.com hostname. The default domain is simplest because certificate and DNS are automatic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default Domain: automatic certificate and DNS; fastest start.</li>
<li>Company Domain: your certificate, a service profile, and a CNAME.</li>
<li>Check the portal name resolves from the public internet.</li>
<li>IP Optimization is first-setup only and has app version requirements.</li>
<li>Watch certificate expiry.</li>
</ul></div>
`,hi:`
<p>Users ko app mein type karne ke liye ek naam chahiye. Prisma Access portal ko naam dene ke do tareeke deta hai: <b>Default Domain</b> aur <b>Company Domain</b>. Yeh choice certificates, DNS aur pehle user experience ko affect karti hai.</p>

<h3>Analogy: street address wali dukaan ya apna brand sign</h3>
<p>Aap shopping centre mein dukaan kiraye par le sakte ho. Centre use address deta hai, aur signs aur bijli pehle se hoti hain. Ya aap apna brand name front par laga sakte ho, jo behtar dikhta hai, lekin aapko naam register karna, sign banana aur post office ko batana padta hai. Default domain shopping centre ka address hai; company domain aapka apna brand sign.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Default aur company domains">
<rect x="20" y="30" width="270" height="130" rx="10" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="13">Default Domain</text>
<text x="155" y="80" text-anchor="middle" class="svg-muted" font-size="11">gpcloudservice.com ke neeche naam</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="11">certificate aur DNS automatic</text><text x="155" y="120" text-anchor="middle" class="svg-muted" font-size="11">sabse tez start</text>
<rect x="350" y="30" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="13">Company Domain</text>
<text x="485" y="80" text-anchor="middle" class="svg-muted" font-size="11">gp.nkprisma.example</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="11">certificate aur profile aap dete ho</text><text x="485" y="120" text-anchor="middle" class="svg-muted" font-size="11">aap DNS CNAME jodte ho</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Neeche wahi portal service</text>
</svg><p class="cap">Ek hi hosted portal ko naam dene ke do tareeke.</p></div>

<h3>Default Domain</h3>
<p>Portal ka naam <code>gpcloudservice.com</code> ke neeche hota hai. Certificate aur DNS record aapke liye automatically publish ho jaate hain. Aapki DNS team se kuch nahi chahiye, aur app jaldi connect ho sakta hai. pa-mobile-1 yahi use karta hai. Lab console mein naam placeholder hostname ke roop mein dikhta hai.</p>

<h3>Company Domain</h3>
<p>Aap apna naam use karte ho, jaise <code>gp.nkprisma.example</code>. Aapko yeh dena hoga:</p>
<ol>
<li>Us naam ka ek <b>certificate</b> aur use use karne wala <b>SSL/TLS service profile</b>.</li>
<li>Ek <b>DNS CNAME</b> record jo aapke naam ko console ke dikhaye hostname se map kare, form: <code>&lt;portal_hostname&gt;.gpcloudservice.com</code>.</li>
</ol>
<p>Users ko aapke brand se match karta naam dikhta hai, aur aapki security team use pehchaan sakti hai. Qeemat certificate management hai: certificate expire ho jaye ya CNAME na ho to app portal tak nahi pahunch sakta.</p>
<pre class="out">Portal name (lab console view)
Mode               Company Domain
Portal name        <span class="hl">gp.nkprisma.example</span>
Certificate        gp-cert (valid)
DNS CNAME target   tenant-lab.gpcloudservice.example
</pre>
<p>Dekhne wali line portal name hai; yeh public DNS mein CNAME target tak resolve honi chahiye.</p>

<table class="cmp"><tr><th>Sawaal</th><th>Default Domain</th><th>Company Domain</th></tr>
<tr><td>Certificate</td><td>Automatically publish</td><td>Aap dete ho aur service profile</td></tr>
<tr><td>DNS</td><td>Automatically publish</td><td>Aap CNAME banate ho</td></tr>
<tr><td>Branding</td><td>Vendor domain</td><td>Aapka domain</td></tr>
<tr><td>Typical failure</td><td>Rare</td><td>Expired certificate ya missing CNAME</td></tr>
</table>

<h3>IP Optimization</h3>
<p>Pehle setup ka ek aur choice <b>IP Optimization</b> hai. Ise sirf pehle setup ke dauraan chuna ja sakta hai aur baad mein badla nahi ja sakta. Ise GlobalProtect app version 6.1.4 ya baad ka, 6.2.3 ya baad ka, ya 6.3.0 ya baad ka chahiye. Lab ise use nahi karta, lekin aapko pata hona chahiye ki yeh permanent hai aur app version requirement hai.</p>

<div class="eg"><p><b>Worked example.</b> Company design prove karne ke liye default domain se shuru karti hai. Do mahine baad management chahta hai ki users <code>gp.nkprisma.example</code> type karein. Security team certificate issue karti hai, service profile banati hai, aur console hostname ki taraf point karta CNAME jodti hai. Company phir portal ko company domain par switch karti hai aur users ko app update karne ko kehti hai. CNAME bhool gaye to app bolta hai ki portal nahi mil raha.</p></div>

<h3>Ek quick test routine</h3>
<p>Portal name mein kisi bhi change ke baad is order mein test karo: office ke bahar ke network se naam resolve karo, browser mein portal kholo aur certificate ka naam aur expiry padho, phir ghar ke connection jaise 203.0.113.50 se app start karo. Har test ki date record karo taaki dikhe problem kab shuru hui.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Company domain chun kar CNAME bhool jaana. (2) Aisa certificate jiska naam portal name se match na kare. (3) Certificate ko expire hone dena. (4) IP Optimization ko bina soche chunna, phir pata chalna ki badla nahi ja sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default domain certificate aur DNS aapke liye publish karta hai; company domain ko aapka certificate, SSL/TLS service profile aur gpcloudservice.com hostname ki taraf CNAME chahiye.</p></div>

<div class="scn"><h4>Aadhi raat expire hua certificate</h4><p>Monday ko help desk ko kai "cannot connect" calls aayi. App certificate warning dikha raha tha. Company-domain certificate weekend mein expire ho gaya tha. Team ne certificate renew kiya, service profile update kiya, push kiya, aur users dobara connect ho gaye.</p><p><b>Seekh:</b> certificate expiry dates apne calendar mein daalo, aur unhe monitor karo.</p></div>

<div class="iv"><p class="q">"Default domain ki jagah company domain kab chunoge?"</p><p>Strong answer: jab branding, policy ya user trust ke liye apna naam chahiye. Ise certificate aur SSL/TLS service profile ke saath gpcloudservice.com hostname ki taraf DNS CNAME chahiye. Default domain sabse aasan hai kyunki certificate aur DNS automatic hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default Domain: automatic certificate aur DNS; sabse tez start.</li>
<li>Company Domain: aapka certificate, service profile, aur CNAME.</li>
<li>Check karo ki portal name public internet se resolve hota hai.</li>
<li>IP Optimization sirf first-setup hai aur app version requirements hain.</li>
<li>Certificate expiry par nazar rakho.</li>
</ul></div>
`}};export{e as default};