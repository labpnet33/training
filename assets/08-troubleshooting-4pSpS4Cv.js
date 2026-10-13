var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: certificate warnings and broken applications`,hi:`Troubleshooting workflow: certificate warnings aur toote applications`},body:{en:`
<p>SSL inspection tickets arrive in a few repeating shapes: "I get a certificate warning", "this app works at home but not in the office", "this site is slow", and "this site loads when it should be blocked". The method for all of them is to find out <b>which layer</b> is responsible: the policy, the SSL profile, the client's trust, the application, or the server. Always change one thing at a time and record what you saw.</p>

<h3>The seven-question ladder</h3>
<ol>
<li><b>Which policy handled the session?</b> The SSL profile is chosen by the matching policy; the wrong policy means the wrong profile.</li>
<li><b>Which SSL profile does that policy use?</b> no-inspection, certificate-inspection or deep-inspection.</li>
<li><b>Is the site or application exempt?</b> Check categories, address and wildcard exemptions and the exemption log.</li>
<li><b>Does the client trust the inspection CA?</b> Look at the issuer of the certificate the client actually received.</li>
<li><b>Does the application pin?</b> Works on mobile data or at home but fails behind deep inspection: suspect pinning.</li>
<li><b>Is the real server certificate OK?</b> Expired, revoked, untrusted or name-mismatch certificates trigger blocks or the untrusted CA warning.</li>
<li><b>Is it a resource problem?</b> High CPU, memory or session setup rate during inspection.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="SSL troubleshooting ladder">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Steps 1-2</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">policy, profile</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Steps 3-4</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">exempt, trust</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Steps 5-6</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">pinning, cert</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Step 7</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">load</text>
</svg><p class="cap">Seven questions from the policy outward to the server and the hardware.</p></div>

<h3>Steps 1 and 2: reuse the nse4-diag tools</h3>
<p>The policy and packet-level tools do not depend on decryption, and the simulator runs them. Find which policy a flow matches with the policy lookup and the session table, then read the profile from the policy. These lines were captured from the <b>nse4-diag</b> lab (plain port 80 session between 10.0.1.10 and 10.0.2.10; an encrypted session on port 443 gives the same packet-level view):</p>
<pre class="out">diagnose sniffer packet any "host 10.0.2.10 and port 80" 4 6
0.000000 port2 in 10.0.1.10.57160 -&gt; 10.0.2.10.80: syn 0
0.001000 port3 out 10.0.1.10.57160 -&gt; 10.0.2.10.80: syn 0
0.001000 port3 in 10.0.2.10.80 -&gt; 10.0.1.10.57160: syn 0 ack 1
0.002000 port2 out 10.0.2.10.80 -&gt; 10.0.1.10.57160: syn 0 ack 1
0.002000 port2 in 10.0.1.10.57160 -&gt; 10.0.2.10.80: ack 1
0.003000 port3 out 10.0.1.10.57160 -&gt; 10.0.2.10.80: ack 1
<span class="hl">6 packets received by filter</span>
0 packets dropped by kernel</pre>
<pre class="out">diagnose sys session filter dst 10.0.2.10
diagnose sys session list
...
<span class="hl">misc=0 policy_id=2</span> pol_uuid_idx=16 auth_info=0 chk_client_info=0 vd=0</pre>
<p>This confirms that the TCP session builds through the FortiGate and which policy owns it. If the TCP handshake does not complete, the problem is routing or policy, not SSL. The sniffer will never show the TLS payload; for that you need the SSL logs and a client-side test.</p>

<h3>Steps 3 to 7 on a real FortiGate</h3>
<p><b>Reference commands (not run in the simulator)</b></p>
<pre class="code"><span class="c"># which SSL profile does the policy use, and what does it exempt?</span>
show full-configuration firewall policy 20
show full-configuration firewall ssl-ssh-profile NK-DEEP
<span class="c"># CA certificates available</span>
get vpn certificate local
<span class="c"># resource view</span>
get system performance status
diagnose sys top 2 20</pre>
<p>On the client, check the issuer of the certificate the browser received. A browser padlock detail page, or a command-line TLS client, shows the issuer. If the issuer is your inspection CA, the session is being inspected; if it is the real public CA, the traffic was exempt or not inspected.</p>

<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Warning on every site, one device</td><td>CA not trusted by that device</td><td>Install CA via GPO or MDM, or move to certificate inspection</td></tr>
<tr><td>Warning on every site, all devices</td><td>Wrong or expired inspection CA</td><td>Check caname and CA expiry</td></tr>
<tr><td>Warning on one site only</td><td>Real server certificate invalid (untrusted CA used)</td><td>Check the server; fix it or knowingly allow</td></tr>
<tr><td>App fails behind the firewall</td><td>Certificate pinning or client certificate</td><td>Exempt the app's hosts</td></tr>
<tr><td>Sites slow or CPU high</td><td>Too much traffic being decrypted</td><td>Exempt bulk categories, size hardware, use flow mode</td></tr>
<tr><td>Blocked HTTPS site shows an error, not a page</td><td>Certificate inspection cannot show a page</td><td>Expected; explain or use deep inspection for managed users</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Our mobile ordering app times out in the Pune showroom but works on cellular." Step 1 and 2: the showroom Wi-Fi matches policy 20 with deep inspection. Step 3: the app's host is not exempt. Step 5: the app pins its certificate. The team adds the app's two host names to the exemption list. The app works, and the exemption log shows the hits.</p></div>

<div class="warn"><p><b>Common mistake.</b> Switching deep inspection off globally to fix one application. You lose protection for everyone. Exempt the single application's hosts instead.</p></div>
<div class="exam"><p><b>Exam trap.</b> A certificate warning on a single site, while others are fine, points to an invalid real server certificate (the FortiGate used the untrusted CA). Warnings on all sites for one device point to missing CA trust.</p></div>

<div class="scn"><h4>"Everything is slow since Monday"</h4><p>After moving all staff and a video-heavy training room to deep inspection, the FortiGate CPU stayed high all day. A review of the traffic showed that most decrypted bytes were video streaming. The team exempted the Streaming Media category from deep inspection, kept certificate inspection for it, and CPU dropped to a comfortable level while the high-risk categories stayed fully inspected.</p><p><b>Lesson:</b> inspect where the risk is, not where the bytes are.</p></div>

<div class="iv"><p class="q">"Users report a certificate warning after SSL inspection was enabled. How do you troubleshoot?"</p><p>I check whether it is one site or all, one device or all. Every site on one device means the CA is not trusted there. Every site on every device suggests the wrong or expired inspection CA. One site means the real server certificate is invalid and the untrusted CA is being used. I also check which policy and profile the traffic matches and the issuer the client actually received.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work the ladder: policy, SSL profile, exemptions, client trust, pinning, server certificate, load.</li>
<li>Policy and session tools work without decryption; they will not show payloads.</li>
<li>One site warning means a bad server certificate; all sites warn means CA trust.</li>
<li>Fix a pinned app with an exemption, not by disabling inspection.</li>
<li>Reduce load by exempting bulk low-risk categories.</li>
</ul></div>
`,hi:`
<p>SSL inspection ke tickets kuch repeating shapes mein aate hain: "mujhe certificate warning aa rahi hai", "yeh app ghar par chalti hai lekin office mein nahi", "yeh site slow hai", aur "yeh site block honi chahiye par load ho rahi hai". Sab ka method yeh pata lagana hai ki <b>kaunsi layer</b> zimmedar hai: policy, SSL profile, client ka trust, application ya server. Hamesha ek baar mein ek hi cheez badlo aur jo dekha woh record karo.</p>

<h3>Saat sawaal ki ladder</h3>
<ol>
<li><b>Kaunsi policy ne session handle kiya?</b> SSL profile matching policy chunti hai; galat policy matlab galat profile.</li>
<li><b>Us policy ka SSL profile kaunsa hai?</b> no-inspection, certificate-inspection ya deep-inspection.</li>
<li><b>Kya site ya application exempt hai?</b> Categories, address aur wildcard exemptions aur exemption log check karo.</li>
<li><b>Kya client inspection CA par trust karta hai?</b> Client ko asal mein mile certificate ka issuer dekho.</li>
<li><b>Kya application pin karti hai?</b> Mobile data ya ghar par chalti hai lekin deep inspection ke peeche fail: pinning ka shak karo.</li>
<li><b>Kya asli server certificate theek hai?</b> Expired, revoked, untrusted ya name-mismatch certificates block ya untrusted CA warning trigger karte hain.</li>
<li><b>Kya yeh resource problem hai?</b> Inspection ke dauraan high CPU, memory ya session setup rate.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="SSL troubleshooting ladder">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Steps 1-2</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">policy, profile</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Steps 3-4</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">exempt, trust</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Steps 5-6</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">pinning, cert</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Step 7</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">load</text>
</svg><p class="cap">Policy se server aur hardware tak saat sawaal.</p></div>

<h3>Step 1 aur 2: nse4-diag ke tools reuse karo</h3>
<p>Policy aur packet-level tools decryption par depend nahi karte, aur simulator unhe chalata hai. Policy lookup aur session table se dhoondho ki flow kaunsi policy match karta hai, phir policy se profile padho. Yeh lines <b>nse4-diag</b> lab se capture ki gayi (10.0.1.10 aur 10.0.2.10 ke beech plain port 80 session; port 443 par encrypted session wahi packet-level view deta hai):</p>
<pre class="out">diagnose sniffer packet any "host 10.0.2.10 and port 80" 4 6
0.000000 port2 in 10.0.1.10.57160 -&gt; 10.0.2.10.80: syn 0
0.001000 port3 out 10.0.1.10.57160 -&gt; 10.0.2.10.80: syn 0
0.001000 port3 in 10.0.2.10.80 -&gt; 10.0.1.10.57160: syn 0 ack 1
0.002000 port2 out 10.0.2.10.80 -&gt; 10.0.1.10.57160: syn 0 ack 1
0.002000 port2 in 10.0.1.10.57160 -&gt; 10.0.2.10.80: ack 1
0.003000 port3 out 10.0.1.10.57160 -&gt; 10.0.2.10.80: ack 1
<span class="hl">6 packets received by filter</span>
0 packets dropped by kernel</pre>
<pre class="out">diagnose sys session filter dst 10.0.2.10
diagnose sys session list
...
<span class="hl">misc=0 policy_id=2</span> pol_uuid_idx=16 auth_info=0 chk_client_info=0 vd=0</pre>
<p>Yeh confirm karta hai ki TCP session FortiGate ke through ban raha hai aur kaunsi policy ka hai. TCP handshake complete na ho to problem routing ya policy ki hai, SSL ki nahi. Sniffer TLS payload kabhi nahi dikhayega; uske liye SSL logs aur client-side test chahiye.</p>

<h3>Step 3 se 7 real FortiGate par</h3>
<p><b>Reference commands (not run in the simulator)</b></p>
<pre class="code"><span class="c"># policy kaunsa SSL profile use karti hai, aur woh kya exempt karta hai?</span>
show full-configuration firewall policy 20
show full-configuration firewall ssl-ssh-profile NK-DEEP
<span class="c"># available CA certificates</span>
get vpn certificate local
<span class="c"># resource view</span>
get system performance status
diagnose sys top 2 20</pre>
<p>Client par dekho ki browser ko jo certificate mila uska issuer kya hai. Browser ke padlock detail page ya command-line TLS client se issuer dikhta hai. Issuer aapka inspection CA ho to session inspect ho raha hai; asli public CA ho to traffic exempt tha ya inspect nahi hua.</p>

<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Har site par warning, ek device</td><td>Us device par CA trusted nahi</td><td>GPO ya MDM se CA install karo, ya certificate inspection par move karo</td></tr>
<tr><td>Har site par warning, saare devices</td><td>Galat ya expired inspection CA</td><td>caname aur CA expiry check karo</td></tr>
<tr><td>Sirf ek site par warning</td><td>Asli server certificate invalid (untrusted CA use hua)</td><td>Server check karo; fix karo ya jaanboojhkar allow karo</td></tr>
<tr><td>Firewall ke peeche app fail</td><td>Certificate pinning ya client certificate</td><td>App ke hosts exempt karo</td></tr>
<tr><td>Sites slow ya CPU high</td><td>Bahut zyada traffic decrypt ho raha hai</td><td>Bulk categories exempt, hardware size, flow mode</td></tr>
<tr><td>Blocked HTTPS site page ke bajay error dikhati hai</td><td>Certificate inspection page nahi dikha sakta</td><td>Expected; samjhao ya managed users ke liye deep inspection</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Hamari mobile ordering app Pune showroom mein timeout karti hai lekin cellular par chalti hai." Step 1 aur 2: showroom Wi-Fi policy 20 match karta hai jisme deep inspection hai. Step 3: app ka host exempt nahi hai. Step 5: app apna certificate pin karti hai. Team app ke do host names exemption list mein jodti hai. App chalti hai, aur exemption log mein hits dikhte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Ek application theek karne ke liye deep inspection globally band kar dena. Aap sabke liye protection kho dete ho. Uski jagah single application ke hosts exempt karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sirf ek site par certificate warning, jabki baaki theek, asli server certificate invalid hone ka sanket hai (FortiGate ne untrusted CA use kiya). Ek device par saari sites par warnings missing CA trust ka sanket hain.</p></div>

<div class="scn"><h4>"Monday se sab slow hai"</h4><p>Saare staff aur video-heavy training room ko deep inspection par move karne ke baad FortiGate CPU poora din high raha. Traffic review se dikha ki zyadatar decrypted bytes video streaming ke the. Team ne Streaming Media category ko deep inspection se exempt kiya, uske liye certificate inspection rakha, aur CPU comfortable level par aa gaya jabki high-risk categories poori tarah inspect hoti rahi.</p><p><b>Lesson:</b> wahan inspect karo jahan risk hai, jahan bytes hain wahan nahi.</p></div>

<div class="iv"><p class="q">"SSL inspection enable hone ke baad users certificate warning report kar rahe hain. Troubleshoot kaise karoge?"</p><p>Main check karta hoon ki ek site hai ya saari, ek device hai ya saare. Ek device par saari sites matlab wahan CA trusted nahi. Saare devices par saari sites matlab galat ya expired inspection CA. Ek site matlab asli server certificate invalid hai aur untrusted CA use ho raha hai. Main yeh bhi check karta hoon ki traffic kaunsi policy aur profile match karta hai aur client ko asal mein kaunsa issuer mila.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ladder chalao: policy, SSL profile, exemptions, client trust, pinning, server certificate, load.</li>
<li>Policy aur session tools decryption ke bina chalte hain; payload nahi dikhate.</li>
<li>Ek site warning matlab bad server certificate; saari sites warn matlab CA trust.</li>
<li>Pinned app ko exemption se theek karo, inspection band karke nahi.</li>
<li>Bulk low-risk categories exempt karke load kam karo.</li>
</ul></div>
`}};export{e as default};