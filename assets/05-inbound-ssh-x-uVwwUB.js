var e={id:`inbound-ssh`,h:{en:`SSL Inbound Inspection and SSH Proxy`,hi:`SSL Inbound Inspection aur SSH Proxy`},body:{en:`

<p><b>The other two decryption types.</b> Forward proxy protects your users. This chapter protects your <i>servers</i> from attacks hidden in TLS (SSL Inbound Inspection) and gives visibility into SSH (SSH Proxy). Both are simpler in some ways, because you own one side of the connection.</p>

<h3>Analogy: the security desk in your own lobby</h3>
<p>Visitors arrive at your building in sealed boxes, addressed to your own departments. Because the building is yours, your lobby desk holds the keys to open boxes addressed to your departments. The visitor sees an ordinary, correct delivery receipt, the desk checks the contents, and passes the box on. Nobody is impersonated, because the lobby desk is entitled to open what arrives at its own building.</p>

<h3>SSL Inbound Inspection</h3>
<p>Used when Internet clients connect to a server you own, for example a public web portal in the DMZ. The firewall holds a <b>copy of the server's real certificate and private key</b>. It terminates TLS on the server's behalf, inspects the clear text for attacks, and passes the traffic to the server.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Inbound inspection"><rect x="20" y="25" width="181" height="80" rx="10" fill="#bae6fd"/><text x="110.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Internet client</text><text x="110.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">sees the real certificate</text><line x1="201" y1="65" x2="229" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="229,65 222,61 222,69" fill="#64748b"/><rect x="229" y="25" width="181" height="80" rx="10" fill="#bbf7d0"/><text x="319.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="319.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">has server key; inspects</text><line x1="410" y1="65" x2="438" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="438,65 431,61 431,69" fill="#64748b"/><rect x="438" y="25" width="181" height="80" rx="10" fill="#ddd6fe"/><text x="528.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Your server</text><text x="528.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">in the DMZ</text></svg><p class="cap">Inbound inspection: the firewall uses the real server certificate and key; the client sees nothing unusual.</p></div>
<ul>
<li>No substitute certificate is created. The client sees the <b>real</b> certificate of your site, so there are no warnings and no client changes.</li>
<li>You must <b>import the server certificate and private key</b> into the firewall. That makes the firewall as sensitive as the server: protect it (chapter 4 rules apply).</li>
<li>Policy: a decryption rule of type <b>SSL Inbound Inspection</b> that selects the certificate, with the server as the destination.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Inspect TLS to the public web server in the DMZ. Names are fictional.</span>
set rulebase decryption rules DEC-Web-In from untrust to dmz source any destination WEB-PUBLIC service any category any action decrypt type ssl-inbound-inspection WEB-CERT profile DP-Inbound log-fail yes</pre>
<p>Check the exact syntax for your release with the question mark. The rule needs the certificate <code>WEB-CERT</code> (with its key) to exist on the firewall, and the security rule for this traffic should apply threat profiles (pan-profiles) because that is the benefit.</p>

<h3>Things to know about inbound inspection</h3>
<ul>
<li>It works because the firewall <b>terminates</b> the session with the key, as a proxy for the server. A passive copy of traffic could not do this when forward secrecy is used.</li>
<li>Certificate renewal: every time the server certificate is renewed, the new certificate and key must be imported to the firewall too. Forgetting this breaks the site, or makes the firewall fail to decrypt.</li>
<li>Multiple sites mean multiple rules and certificates, selected by destination address.</li>
<li>Check which TLS versions and cipher suites your release supports for inbound inspection, and set the profile to handle unsupported sessions deliberately.</li>
<li>If a load balancer or WAF already terminates TLS in front of the server, inspection may be better placed there, or after it. Do not decrypt twice without a reason.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A company publishes a customer portal at portal.acme.example. The security team imports the portal certificate and key into the firewall, adds an inbound inspection rule for the DMZ server address, and enables vulnerability protection and URL filtering in the security rule. Within a week the threat log shows blocked exploit attempts hidden in POST requests that were previously invisible. Customers noticed no change.</p></div>

<h3>SSH Proxy</h3>
<p>SSH is another encrypted protocol that attackers love: it can carry port forwarding, so a "single allowed SSH session" becomes a tunnel to anywhere. With <b>SSH Proxy</b>, the firewall terminates the SSH session on each side as a proxy, which lets App-ID see inside the session and recognise <b>tunnelling</b> such as port forwarding and X11 forwarding as their own applications (for example <code>ssh-tunnel</code>), which you can then block while still allowing normal SSH.</p>
<table class="cmp"><tr><th>Aspect</th><th>SSL Forward Proxy</th><th>SSH Proxy</th></tr>
<tr><td>Certificates needed</td><td>Yes, forward trust and untrust</td><td>No certificates; SSH host keys used, handled by the firewall</td></tr>
<tr><td>Rule type</td><td>ssl-forward-proxy</td><td>ssh-proxy</td></tr>
<tr><td>Goal</td><td>Inspect content and threats</td><td>See tunnelling and control SSH functions</td></tr>
<tr><td>Client impact</td><td>Needs CA trust</td><td>First-time host key prompts can appear for users</td></tr>
</table>
<pre class="code"><span class="c">! Reference configuration (not run): proxy SSH from staff to the internet</span>
set rulebase decryption rules DEC-SSH-Out from trust to untrust source any destination any service any category any action decrypt type ssh-proxy log-fail yes</pre>
<p>The firewall does not need to log the content of interactive sessions to do its job. If your environment treats shell contents as sensitive, restrict who may see any captured information and explain the control to engineers, who use SSH for their daily work.</p>

<h3>Decision guide</h3>
<table class="cmp"><tr><th>Goal</th><th>Use</th></tr>
<tr><td>Inspect what my users download</td><td>SSL Forward Proxy</td></tr>
<tr><td>Protect my public web server</td><td>SSL Inbound Inspection</td></tr>
<tr><td>Detect or block SSH tunnelling</td><td>SSH Proxy</td></tr>
<tr><td>Keep bank traffic private</td><td>No-decrypt rule (chapter 7)</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Importing a server key onto the firewall without treating it as sensitive, or renewing the server certificate without updating the firewall. Both are common outages and common risks.</p></div>
<div class="exam"><p><b>Exam trap.</b> Inbound inspection: firewall holds the server certificate and key, client sees the real certificate, no CA distribution. SSH Proxy: no certificates, detects tunnelling. Forward proxy: forged certificates, CA must be trusted.</p></div>

<div class="scn"><h4>The portal that broke at certificate renewal</h4><p>After a routine renewal of the customer portal certificate, some customers got errors. The web team had updated the server, but the firewall still held the old certificate, so inbound inspection failed. The change process was amended: renew in a single ticket that includes the web server, the load balancer and the firewall.</p><p><b>Lesson:</b> Inbound inspection ties the firewall to the lifecycle of the server certificate.</p></div>

<div class="iv"><p class="q">"When would you use SSL Inbound Inspection instead of Forward Proxy?"</p><p>When external clients connect to servers I own, for example a DMZ web portal. Inbound inspection uses a copy of the real server certificate and key on the firewall, the client sees the real certificate and nothing is distributed to clients. Forward proxy is for my users going to arbitrary internet sites and uses a forged certificate signed by a CA clients must trust.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inbound inspection uses the real server certificate and key imported on the firewall.</li>
<li>Clients see the real certificate; no client changes.</li>
<li>Renew certificates on the firewall too, and protect the key.</li>
<li>SSH Proxy needs no certificates and reveals tunnelling such as port forwarding.</li>
<li>Pick the type by the question: users out, servers in, SSH.</li>
</ul></div>

`,hi:`

<p><b>Baaki do decryption types.</b> Forward proxy aapke users ko protect karta hai. Yeh chapter aapke <i>servers</i> ko TLS mein chhupe attacks se bachata hai (SSL Inbound Inspection) aur SSH mein visibility deta hai (SSH Proxy). Dono kuch maamlon mein aasan hain, kyunki connection ka ek side aapka apna hai.</p>

<h3>Analogy: apni lobby ka security desk</h3>
<p>Visitors aapki building mein sealed boxes mein aate hain, jo aapke apne departments ke naam hain. Building aapki hai, isliye lobby desk ke paas aapke departments ke boxes kholne ki chabiyan hain. Visitor ko ek aam, sahi delivery receipt dikhti hai, desk andar ka saamaan check karta hai aur box aage bhej deta hai. Kisi ka impersonation nahi hota, kyunki lobby desk ko apni building mein aane waali cheez kholne ka haq hai.</p>

<h3>SSL Inbound Inspection</h3>
<p>Tab use hota hai jab Internet clients aapke apne server se connect karte hain, jaise DMZ mein public web portal. Firewall ke paas server ke <b>asli certificate aur private key ki copy</b> hoti hai. Woh server ki taraf se TLS terminate karta hai, clear text mein attacks ke liye inspect karta hai, aur traffic server ko pass karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Inbound inspection"><rect x="20" y="25" width="181" height="80" rx="10" fill="#bae6fd"/><text x="110.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Internet client</text><text x="110.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">asli certificate dekhta hai</text><line x1="201" y1="65" x2="229" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="229,65 222,61 222,69" fill="#64748b"/><rect x="229" y="25" width="181" height="80" rx="10" fill="#bbf7d0"/><text x="319.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="319.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">server key hai; inspect</text><line x1="410" y1="65" x2="438" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="438,65 431,61 431,69" fill="#64748b"/><rect x="438" y="25" width="181" height="80" rx="10" fill="#ddd6fe"/><text x="528.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Aapka server</text><text x="528.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">DMZ mein</text></svg><p class="cap">Inbound inspection: firewall asli server certificate aur key use karta hai; client ko kuch alag nahi dikhta.</p></div>
<ul>
<li>Koi substitute certificate nahi banta. Client ko aapki site ka <b>asli</b> certificate dikhta hai, isliye warnings nahi aur clients mein koi badlav nahi.</li>
<li>Aapko <b>server certificate aur private key firewall mein import</b> karni hogi. Isse firewall server jitna hi sensitive ho jaata hai: use protect karo (chapter 4 ke niyam lagte hain).</li>
<li>Policy: <b>SSL Inbound Inspection</b> type ki decryption rule jo certificate chunti hai, aur destination mein server.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! DMZ ke public web server ka TLS inspect karo. Naam fictional hain.</span>
set rulebase decryption rules DEC-Web-In from untrust to dmz source any destination WEB-PUBLIC service any category any action decrypt type ssl-inbound-inspection WEB-CERT profile DP-Inbound log-fail yes</pre>
<p>Apne release ke liye exact syntax question mark se check karo. Rule ko certificate <code>WEB-CERT</code> (key ke saath) firewall par chahiye, aur is traffic ki security rule par threat profiles (pan-profiles) lagane chahiye kyunki yahi fayda hai.</p>

<h3>Inbound inspection ke baare mein jaanne layak</h3>
<ul>
<li>Yeh isliye chalta hai kyunki firewall key se session <b>terminate</b> karta hai, server ke proxy ki tarah. Forward secrecy ho to traffic ki passive copy yeh nahi kar sakti.</li>
<li>Certificate renewal: jab bhi server certificate renew hota hai, naya certificate aur key firewall mein bhi import karni padti hai. Bhoolne par site tootti hai, ya firewall decrypt nahi kar pata.</li>
<li>Kai sites matlab kai rules aur certificates, destination address se chune jaate hain.</li>
<li>Check karo aapka release inbound inspection ke liye kaunse TLS versions aur cipher suites support karta hai, aur profile ko unsupported sessions jaanbujhkar handle karne par set karo.</li>
<li>Agar load balancer ya WAF pehle se server ke aage TLS terminate karta hai to inspection wahan ya uske baad behtar ho sakta hai. Bina wajah do baar decrypt mat karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek company portal.acme.example par customer portal publish karti hai. Security team portal certificate aur key firewall mein import karti hai, DMZ server address ke liye inbound inspection rule jodti hai, aur security rule mein vulnerability protection aur URL filtering enable karti hai. Ek hafte mein threat log mein POST requests mein chhupe blocked exploit attempts dikhte hain jo pehle invisible the. Customers ko koi badlav nahi dikha.</p></div>

<h3>SSH Proxy</h3>
<p>SSH ek aur encrypted protocol hai jise attackers pasand karte hain: yeh port forwarding le ja sakta hai, isliye "ek allowed SSH session" kahin bhi tunnel ban sakta hai. <b>SSH Proxy</b> mein firewall har side par SSH session ko proxy ke roop mein terminate karta hai, jisse App-ID session ke andar dekh sakta hai aur port forwarding aur X11 forwarding jaise <b>tunnelling</b> ko alag applications (jaise <code>ssh-tunnel</code>) ke roop mein pehchanta hai, jinhe aap block kar sakte ho jabki normal SSH allow rahe.</p>
<table class="cmp"><tr><th>Pehlu</th><th>SSL Forward Proxy</th><th>SSH Proxy</th></tr>
<tr><td>Certificates chahiye</td><td>Haan, forward trust aur untrust</td><td>Certificates nahi; SSH host keys, firewall sambhalta hai</td></tr>
<tr><td>Rule type</td><td>ssl-forward-proxy</td><td>ssh-proxy</td></tr>
<tr><td>Maqsad</td><td>Content aur threats inspect karna</td><td>Tunnelling dekhna aur SSH functions control karna</td></tr>
<tr><td>Client par asar</td><td>CA trust chahiye</td><td>Users ko pehli baar host key prompts aa sakte hain</td></tr>
</table>
<pre class="code"><span class="c">! Reference configuration (not run): staff se internet tak SSH proxy karo</span>
set rulebase decryption rules DEC-SSH-Out from trust to untrust source any destination any service any category any action decrypt type ssh-proxy log-fail yes</pre>
<p>Firewall ko apna kaam karne ke liye interactive sessions ka content log karne ki zaroorat nahi. Aapka environment shell contents ko sensitive maanta ho to restrict karo ki kaun koi bhi captured information dekh sakta hai, aur engineers ko control samjhao, jo roz SSH use karte hain.</p>

<h3>Decision guide</h3>
<table class="cmp"><tr><th>Maqsad</th><th>Use</th></tr>
<tr><td>Mere users kya download karte hain inspect karna</td><td>SSL Forward Proxy</td></tr>
<tr><td>Mera public web server protect karna</td><td>SSL Inbound Inspection</td></tr>
<tr><td>SSH tunnelling detect ya block karna</td><td>SSH Proxy</td></tr>
<tr><td>Bank traffic private rakhna</td><td>No-decrypt rule (chapter 7)</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Server key ko firewall par sensitive maane bina import karna, ya server certificate renew karke firewall update na karna. Dono aam outages aur aam risks hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Inbound inspection: firewall ke paas server certificate aur key, client ko asli certificate dikhta hai, CA distribution nahi. SSH Proxy: certificates nahi, tunnelling detect karta hai. Forward proxy: forged certificates, CA trusted honi chahiye.</p></div>

<div class="scn"><h4>Portal jo certificate renewal par toot gaya</h4><p>Customer portal certificate ke routine renewal ke baad kuch customers ko errors aaye. Web team ne server update kiya tha, lekin firewall ke paas abhi bhi purana certificate tha, isliye inbound inspection fail hua. Change process badla gaya: ek hi ticket mein web server, load balancer aur firewall teeno renew karo.</p><p><b>Lesson:</b> Inbound inspection firewall ko server certificate ke lifecycle se bandh deti hai.</p></div>

<div class="iv"><p class="q">"Forward Proxy ke bajaye SSL Inbound Inspection kab use karoge?"</p><p>Jab external clients mere apne servers se connect karein, jaise DMZ web portal. Inbound inspection firewall par asli server certificate aur key ki copy use karti hai, client ko asli certificate dikhta hai aur clients ko kuch distribute nahi karna padta. Forward proxy mere users ke arbitrary internet sites tak jaane ke liye hai aur forged certificate use karta hai jo aisi CA se signed hai jise clients trust karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inbound inspection firewall mein import kiye asli server certificate aur key use karti hai.</li>
<li>Clients ko asli certificate dikhta hai; clients mein badlav nahi.</li>
<li>Certificates firewall par bhi renew karo, aur key protect karo.</li>
<li>SSH Proxy ko certificates nahi chahiye aur port forwarding jaisi tunnelling dikha deta hai.</li>
<li>Type sawaal se chuno: users bahar, servers andar, SSH.</li>
</ul></div>

`}};export{e as default};